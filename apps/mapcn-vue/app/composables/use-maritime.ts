import type {
  Ship,
  ShipType,
  ShipPosition,
  CoastalRadar,
  EezBoundary,
  MaritimeStats,
  TripDatum,
} from '~/types/defense-maritime';

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

function toRad(deg: number): number {
  return deg * DEG_TO_RAD;
}

function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const p1 = toRad(lat1);
  const p2 = toRad(lat2);
  const dl = toRad(lon2 - lon1);
  const y = Math.sin(dl) * Math.cos(p2);
  const x =
    Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl);
  return (Math.atan2(y, x) * RAD_TO_DEG + 360) % 360;
}

/** Generate a circle polygon of N points at a center [lng, lat] with radius in km */
function generateCircle(
  center: [number, number],
  radiusKm: number,
  numPoints: number = 64,
): [number, number][] {
  const [cLng, cLat] = center;
  const latDeg = radiusKm / 111.32;
  const lngDeg = radiusKm / (111.32 * Math.cos(toRad(cLat)));
  const points: [number, number][] = [];
  for (let i = 0; i <= numPoints; i++) {
    const angle = (i / numPoints) * 2 * Math.PI;
    points.push([
      cLng + lngDeg * Math.cos(angle),
      cLat + latDeg * Math.sin(angle),
    ]);
  }
  return points;
}

/** Interpolate waypoints into smooth path with N points */
function interpolateRoute(
  waypoints: [number, number][],
  numPoints: number,
): [number, number][] {
  if (waypoints.length < 2) return waypoints;

  const segments: number[] = [0];
  let totalDist = 0;
  for (let i = 1; i < waypoints.length; i++) {
    const [x1, y1] = waypoints[i - 1]!;
    const [x2, y2] = waypoints[i]!;
    totalDist += Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    segments.push(totalDist);
  }

  const result: [number, number][] = [];
  for (let i = 0; i < numPoints; i++) {
    const targetDist = (i * totalDist) / numPoints;
    let segIdx = 0;
    for (let j = 1; j < segments.length; j++) {
      if (segments[j]! >= targetDist) {
        segIdx = j - 1;
        break;
      }
      segIdx = j - 1;
    }

    const segStart = segments[segIdx]!;
    const segEnd = segments[segIdx + 1] ?? segStart;
    const segLen = segEnd - segStart;
    const t = segLen > 0 ? (targetDist - segStart) / segLen : 0;

    const [x1, y1] = waypoints[segIdx]!;
    const [x2, y2] = waypoints[Math.min(segIdx + 1, waypoints.length - 1)]!;
    result.push([x1 + (x2 - x1) * t, y1 + (y2 - y1) * t]);
  }
  return result;
}

/** Check if a point is inside the EEZ polygon (ray casting) */
function pointInPolygon(
  point: [number, number],
  polygon: [number, number][],
): boolean {
  const [px, py] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i]!;
    const [xj, yj] = polygon[j]!;
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

const SHIP_COLORS: Record<ShipType, [number, number, number]> = {
  naval: [0, 100, 255],
  merchant: [0, 200, 150],
  fishing: [200, 200, 0],
  suspicious: [255, 50, 50],
};

const SHIPS: Ship[] = [
  {
    id: 'ins-vikrant',
    type: 'naval',
    callsign: 'INS-VIKRANT',
    color: SHIP_COLORS.naval,
    route: [
      [72.8, 18.9],
      [73.0, 17.5],
      [73.5, 16.0],
      [74.0, 15.0],
      [74.5, 14.0],
      [74.8, 12.9],
      [75.5, 11.5],
      [76.0, 10.5],
      [76.2, 9.9],
      [75.5, 11.5],
      [74.8, 12.9],
      [74.0, 15.0],
      [73.0, 17.5],
      [72.8, 18.9],
    ],
  },
  {
    id: 'ins-kolkata',
    type: 'naval',
    callsign: 'INS-KOLKATA',
    color: SHIP_COLORS.naval,
    route: [
      [70.5, 18.0],
      [70.0, 16.5],
      [69.5, 15.0],
      [69.0, 13.5],
      [69.5, 12.0],
      [70.5, 11.0],
      [71.5, 10.5],
      [72.0, 11.5],
      [71.5, 13.0],
      [70.5, 15.0],
      [70.0, 16.5],
      [70.5, 18.0],
    ],
  },
  {
    id: 'mv-sagarmala',
    type: 'merchant',
    callsign: 'MV-SAGARMALA',
    color: SHIP_COLORS.merchant,
    route: [
      [72.8, 18.9],
      [73.2, 17.5],
      [73.6, 16.0],
      [74.0, 14.5],
      [74.5, 13.0],
      [75.0, 11.5],
      [75.8, 10.5],
      [76.2, 9.9],
    ],
  },
  {
    id: 'mv-bharat',
    type: 'merchant',
    callsign: 'MV-BHARAT',
    color: SHIP_COLORS.merchant,
    route: [
      [65.0, 16.0],
      [66.5, 15.5],
      [68.0, 15.0],
      [69.5, 14.8],
      [71.0, 14.5],
      [72.5, 14.2],
      [73.8, 15.4],
    ],
  },
  {
    id: 'fv-matsya-1',
    type: 'fishing',
    callsign: 'FV-MATSYA-1',
    color: SHIP_COLORS.fishing,
    route: [
      [73.5, 15.8],
      [73.8, 15.4],
      [74.0, 15.0],
      [73.7, 14.8],
      [73.4, 15.2],
      [73.2, 15.6],
      [73.5, 15.8],
    ],
  },
  {
    id: 'unknown-1',
    type: 'suspicious',
    callsign: 'UNKNOWN-1',
    color: SHIP_COLORS.suspicious,
    route: [
      [65.0, 14.0],
      [66.0, 14.2],
      [67.0, 14.5],
      [68.0, 14.8],
      [69.0, 15.0],
      [70.0, 15.2],
      [71.0, 15.4],
      [72.0, 15.5],
    ],
  },
];

const RADARS: CoastalRadar[] = [
  { id: 'mumbai', name: 'Mumbai', position: [72.8, 18.9], rangeKm: 150 },
  { id: 'goa', name: 'Goa', position: [73.8, 15.4], rangeKm: 150 },
  { id: 'mangalore', name: 'Mangalore', position: [74.8, 12.9], rangeKm: 150 },
  { id: 'kochi', name: 'Kochi', position: [76.2, 9.9], rangeKm: 150 },
];

const EEZ_POLYGON: [number, number][] = [
  [68.0, 19.5],
  [67.5, 17.0],
  [67.0, 15.0],
  [68.0, 12.0],
  [69.0, 9.0],
  [72.0, 8.0],
  [76.5, 8.5],
  [76.2, 9.9],
  [74.8, 12.9],
  [73.8, 15.4],
  [72.8, 18.9],
  [72.5, 20.0],
  [68.0, 19.5],
];

const ARC_POINTS = 400;
const BASE_LOOP_SECONDS = 90;

function buildTripData(ships: Ship[]): TripDatum[] {
  return ships.map((ship) => {
    const path = interpolateRoute(ship.route, ARC_POINTS);
    const timestamps = path.map((_, i) => i);
    return { shipId: ship.id, path, timestamps };
  });
}

export function useMaritime() {
  const ships = ref<Ship[]>([...SHIPS]);
  const radars = ref<CoastalRadar[]>([...RADARS]);
  const eezBoundary = ref<EezBoundary>({ polygon: EEZ_POLYGON });

  const tripData = ref<TripDatum[]>(buildTripData(SHIPS));

  const activeShipTypes = ref<Set<ShipType>>(
    new Set(['naval', 'merchant', 'fishing', 'suspicious']),
  );

  const currentTime = ref(0);
  const isPlaying = ref(false);
  const speed = ref(1);

  let animationFrame: number | null = null;
  let lastTimestamp = 0;

  const filteredShips = computed(() =>
    ships.value.filter((s) => activeShipTypes.value.has(s.type)),
  );

  const filteredTripData = computed(() =>
    tripData.value.filter((t) => {
      const ship = ships.value.find((s) => s.id === t.shipId);
      return ship && activeShipTypes.value.has(ship.type);
    }),
  );

  function getShipPosition(shipId: string): ShipPosition | null {
    const trip = tripData.value.find((t) => t.shipId === shipId);
    const ship = ships.value.find((s) => s.id === shipId);
    if (!trip || !ship || trip.path.length < 2) return null;

    const maxIdx = trip.path.length - 1;
    // Non-looping ships (merchant approaching, suspicious) clamp at end
    const isLooping =
      ship.route[0]![0] === ship.route[ship.route.length - 1]![0] &&
      ship.route[0]![1] === ship.route[ship.route.length - 1]![1];

    const rawT = currentTime.value % (maxIdx + 1);
    const t = isLooping ? rawT : Math.min(rawT, maxIdx);
    const idx = Math.floor(t);
    const frac = t - idx;

    const pt = trip.path[idx]!;
    const nextIdx = isLooping
      ? (idx + 1) % trip.path.length
      : Math.min(idx + 1, maxIdx);
    const next = trip.path[nextIdx]!;

    const lng = pt[0] + (next[0] - pt[0]) * frac;
    const lat = pt[1] + (next[1] - pt[1]) * frac;

    const bearingIdx = Math.min(idx + 3, maxIdx);
    const bearingPt = trip.path[bearingIdx]!;
    const heading = calculateBearing(lat, lng, bearingPt[1], bearingPt[0]);

    const baseSpeed =
      ship.type === 'naval' ? 28 : ship.type === 'merchant' ? 14 : 8;
    const speedVariation =
      2 * Math.sin(currentTime.value * 0.05 + ship.id.charCodeAt(0));

    return { lng, lat, heading, speed: Math.round(baseSpeed + speedVariation) };
  }

  const positions = computed<Record<string, ShipPosition>>(() => {
    const result: Record<string, ShipPosition> = {};
    for (const ship of filteredShips.value) {
      const pos = getShipPosition(ship.id);
      if (pos) result[ship.id] = pos;
    }
    return result;
  });

  const loopedTime = computed(() => currentTime.value % ARC_POINTS);

  const radarCircles = computed(() =>
    radars.value.map((r) => ({
      polygon: generateCircle(r.position, r.rangeKm),
      name: r.name,
    })),
  );

  const stats = computed<MaritimeStats>(() => {
    const posEntries = Object.entries(positions.value);
    const inEez = posEntries.filter(([, pos]) =>
      pointInPolygon([pos.lng, pos.lat], eezBoundary.value.polygon),
    ).length;

    const suspiciousCount = filteredShips.value.filter(
      (s) => s.type === 'suspicious',
    ).length;

    // Radar coverage: % of filtered ships within any radar range
    const inRadar = posEntries.filter(([, pos]) =>
      radars.value.some((r) => {
        const dlat = pos.lat - r.position[1];
        const dlng = (pos.lng - r.position[0]) * Math.cos(toRad(pos.lat));
        const distKm = Math.sqrt(dlat * dlat + dlng * dlng) * 111.32;
        return distKm <= r.rangeKm;
      }),
    ).length;

    const total = posEntries.length;
    const coverage = total > 0 ? Math.round((inRadar / total) * 100) : 0;

    return {
      totalShips: total,
      inEez,
      radarCoverage: coverage,
      suspicious: suspiciousCount,
    };
  });

  function toggleShipType(type: ShipType): void {
    const next = new Set(activeShipTypes.value);
    if (next.has(type)) {
      next.delete(type);
    } else {
      next.add(type);
    }
    activeShipTypes.value = next;
  }

  function animate(timestamp: number): void {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const delta = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    if (isPlaying.value) {
      const increment = (delta * speed.value * ARC_POINTS) / BASE_LOOP_SECONDS;
      currentTime.value += increment;
    }

    animationFrame = requestAnimationFrame(animate);
  }

  function play(): void {
    isPlaying.value = true;
    lastTimestamp = 0;
    if (!animationFrame) {
      animationFrame = requestAnimationFrame(animate);
    }
  }

  function pause(): void {
    isPlaying.value = false;
  }

  function reset(): void {
    isPlaying.value = false;
    currentTime.value = 0;
    lastTimestamp = 0;
  }

  function cleanup(): void {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
  }

  return {
    ships: filteredShips,
    allShips: ships,
    positions,
    eezBoundary,
    radars,
    radarCircles,
    tripData: filteredTripData,
    activeShipTypes,
    stats,
    loopedTime,
    isPlaying,
    speed,
    toggleShipType,
    play,
    pause,
    reset,
    cleanup,
  };
}
