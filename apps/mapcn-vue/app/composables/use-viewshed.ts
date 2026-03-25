import type {
  Observer,
  ViewshedPolygon,
  ViewshedConfig,
} from '~/types/defense-viewshed';

const OBSERVER_LABELS = ['OBS-1', 'OBS-2', 'OBS-3', 'OBS-4'];

const VIEWSHED_CONFIG: ViewshedConfig = {
  baseRangeM: 4000,
  heightOptions: [2, 5, 10, 20, 30],
  maxObservers: 4,
  rayCount: 72,
};

const EARTH_RADIUS = 6371000;

function destinationPoint(
  origin: [number, number],
  distanceMeters: number,
  bearingDeg: number,
): [number, number] {
  const lat1 = (origin[1] * Math.PI) / 180;
  const lon1 = (origin[0] * Math.PI) / 180;
  const brng = (bearingDeg * Math.PI) / 180;
  const d = distanceMeters / EARTH_RADIUS;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(d) +
      Math.cos(lat1) * Math.sin(d) * Math.cos(brng),
  );
  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(brng) * Math.sin(d) * Math.cos(lat1),
      Math.cos(d) - Math.sin(lat1) * Math.sin(lat2),
    );

  return [(lon2 * 180) / Math.PI, (lat2 * 180) / Math.PI];
}

function generateViewshed(
  center: [number, number],
  heightM: number,
): [number, number][] {
  const baseRange = VIEWSHED_CONFIG.baseRangeM;
  const heightMultiplier = Math.sqrt(heightM / 2);
  const points: [number, number][] = [];
  const step = 360 / VIEWSHED_CONFIG.rayCount;

  for (let angle = 0; angle < 360; angle += step) {
    const terrainFactor =
      0.5 +
      0.5 *
        (0.4 * Math.sin(angle * 0.05 + center[0] * 100) +
          0.3 * Math.cos(angle * 0.08 + center[1] * 100) +
          0.3 * Math.sin(angle * 0.15));
    const range = baseRange * heightMultiplier * Math.max(0.3, terrainFactor);
    points.push(destinationPoint(center, range, angle));
  }

  points.push(points[0]!);
  return points;
}

function computePolygonAreaKm2(polygon: [number, number][]): number {
  const coords = polygon.slice(0, -1);
  if (coords.length < 3) return 0;

  let area = 0;
  for (let i = 0; i < coords.length; i++) {
    const j = (i + 1) % coords.length;
    const lon1 = (coords[i]![0] * Math.PI) / 180;
    const lon2 = (coords[j]![0] * Math.PI) / 180;
    const lat1 = (coords[i]![1] * Math.PI) / 180;
    const lat2 = (coords[j]![1] * Math.PI) / 180;
    area += (lon2 - lon1) * (2 + Math.sin(lat1) + Math.sin(lat2));
  }

  area = (Math.abs(area) * EARTH_RADIUS * EARTH_RADIUS) / 2;
  return area / 1e6;
}

export function useViewshed() {
  const observers = ref<Observer[]>([]);
  const observerHeight = ref<number>(2);

  let nextId = 1;

  const viewshedPolygons = computed<ViewshedPolygon[]>(() =>
    observers.value.map((obs) => ({
      observerId: obs.id,
      polygon: generateViewshed(obs.position, obs.heightM),
      color: [0, 200, 100, 60] as [number, number, number, number],
    })),
  );

  const totalVisibleAreaKm2 = computed(() => {
    let total = 0;
    for (const vp of viewshedPolygons.value) {
      total += computePolygonAreaKm2(vp.polygon);
    }
    return total;
  });

  function addObserver(lngLat: [number, number]): void {
    if (observers.value.length >= VIEWSHED_CONFIG.maxObservers) return;
    const labelIndex = observers.value.length;
    const label = OBSERVER_LABELS[labelIndex] ?? `OBS-${labelIndex + 1}`;
    const id = `obs-${nextId++}`;
    observers.value.push({
      id,
      position: lngLat,
      heightM: observerHeight.value,
      label,
    });
  }

  function removeObserver(id: string): void {
    observers.value = observers.value.filter((o) => o.id !== id);
  }

  function clearAll(): void {
    observers.value = [];
  }

  function setHeight(heightM: number): void {
    observerHeight.value = heightM;
    for (const obs of observers.value) {
      obs.heightM = heightM;
    }
  }

  function cleanup(): void {
    observers.value = [];
  }

  return {
    observers,
    viewshedPolygons,
    observerHeight,
    totalVisibleAreaKm2,
    heightOptions: VIEWSHED_CONFIG.heightOptions,
    maxObservers: VIEWSHED_CONFIG.maxObservers,
    addObserver,
    removeObserver,
    clearAll,
    setHeight,
    cleanup,
  };
}
