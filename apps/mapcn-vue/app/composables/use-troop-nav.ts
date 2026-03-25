import type {
  TroopWaypoint,
  ElevationPoint,
  RouteStats,
  ValhallaRouteResponse,
} from '~/types/defense-troop-nav';
import { decodePolyline } from '~/composables/use-route-utils';

const MAX_WAYPOINTS = 8;

function haversineDistance(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const dLat = ((b[1] - a[1]) * Math.PI) / 180;
  const dLon = ((b[0] - a[0]) * Math.PI) / 180;
  const lat1 = (a[1] * Math.PI) / 180;
  const lat2 = (b[1] * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

function generateElevationProfile(
  coords: [number, number][],
): ElevationPoint[] {
  if (coords.length === 0) return [];

  const points: ElevationPoint[] = [];
  let cumulativeDistance = 0;

  for (let i = 0; i < coords.length; i++) {
    if (i > 0) {
      cumulativeDistance += haversineDistance(coords[i - 1]!, coords[i]!);
    }

    // Simulate Ladakh terrain: base ~3500m + terrain variation
    const d = cumulativeDistance;
    const altitude =
      3500 +
      200 * Math.sin(d * 0.8) +
      120 * Math.cos(d * 1.5 + 1) +
      80 * Math.sin(d * 3.2 + 2) +
      50 * Math.cos(d * 0.3);

    points.push({ distance: cumulativeDistance, altitude });
  }

  return points;
}

function computeRouteStats(
  distanceKm: number,
  timeSec: number,
  elevation: ElevationPoint[],
): RouteStats {
  let gain = 0;
  let loss = 0;

  for (let i = 1; i < elevation.length; i++) {
    const diff = elevation[i]!.altitude - elevation[i - 1]!.altitude;
    if (diff > 0) gain += diff;
    else loss += Math.abs(diff);
  }

  return {
    distanceKm,
    timeHours: timeSec / 3600,
    elevationGain: Math.round(gain),
    elevationLoss: Math.round(loss),
  };
}

export function useTroopNav() {
  const waypoints = ref<TroopWaypoint[]>([]);
  const routeCoords = ref<[number, number][]>([]);
  const elevationProfile = ref<ElevationPoint[]>([]);
  const routeStats = ref<RouteStats | null>(null);
  const isLoading = ref(false);

  async function fetchRoute(): Promise<void> {
    if (waypoints.value.length < 2) {
      routeCoords.value = [];
      elevationProfile.value = [];
      routeStats.value = null;
      return;
    }

    isLoading.value = true;

    try {
      const params = {
        locations: waypoints.value.map((wp) => ({
          lat: wp.position[1],
          lon: wp.position[0],
          type: 'through' as const,
        })),
        costing: 'pedestrian',
        directions_options: { units: 'kilometers' },
        elevation_interval: 30,
      };

      const url = `/api/valhalla?json=${encodeURIComponent(JSON.stringify(params))}`;
      const data = await $fetch<ValhallaRouteResponse>(url);

      const allCoords: [number, number][] = [];
      let totalDistance = 0;
      let totalTime = 0;

      for (const leg of data.trip.legs) {
        const legCoords = decodePolyline(leg.shape);
        allCoords.push(...legCoords);
        totalDistance += leg.summary.length;
        totalTime += leg.summary.time;
      }

      routeCoords.value = allCoords;
      elevationProfile.value = generateElevationProfile(allCoords);
      routeStats.value = computeRouteStats(
        totalDistance,
        totalTime,
        elevationProfile.value,
      );
    } catch {
      routeCoords.value = [];
      elevationProfile.value = [];
      routeStats.value = null;
    } finally {
      isLoading.value = false;
    }
  }

  function addWaypoint(position: [number, number]): void {
    if (waypoints.value.length >= MAX_WAYPOINTS) return;

    const id = `wp-${Date.now()}`;
    const label = `WP-${waypoints.value.length + 1}`;
    waypoints.value.push({ id, position, label });
    fetchRoute();
  }

  function removeWaypoint(id: string): void {
    waypoints.value = waypoints.value
      .filter((wp) => wp.id !== id)
      .map((wp, i) => ({ ...wp, label: `WP-${i + 1}` }));
    fetchRoute();
  }

  function clearRoute(): void {
    waypoints.value = [];
    routeCoords.value = [];
    elevationProfile.value = [];
    routeStats.value = null;
  }

  return {
    waypoints,
    routeCoords,
    elevationProfile,
    routeStats,
    isLoading,
    addWaypoint,
    removeWaypoint,
    clearRoute,
  };
}
