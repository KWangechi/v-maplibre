import type {
  BorderCamera,
  BorderPatrolRoute,
  BorderPatrolPosition,
  IntrusionZone,
  BorderLayerName,
} from '~/types/defense-border';

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

/** Build a camera coverage cone (120° arc, ~5km range) */
function buildCoverageCone(
  center: [number, number],
  bearingDeg: number,
  rangeKm: number,
  arcDeg: number,
): [number, number][] {
  const [cLng, cLat] = center;
  const latDeg = rangeKm / 111.32;
  const lngDeg = rangeKm / (111.32 * Math.cos(toRad(cLat)));
  const halfArc = arcDeg / 2;
  const steps = 12;
  const cone: [number, number][] = [[cLng, cLat]];

  for (let i = 0; i <= steps; i++) {
    const angle = bearingDeg - halfArc + (arcDeg * i) / steps;
    const rad = (angle - 90) * DEG_TO_RAD;
    cone.push([cLng + lngDeg * Math.cos(rad), cLat + latDeg * Math.sin(rad)]);
  }
  cone.push([cLng, cLat]);
  return cone;
}

/** Dense coordinate pairs along the Ladakh LAC sector following terrain features */
const LAC_BORDER_COORDS: [number, number][] = [
  [76.85, 33.55],
  [76.88, 33.57],
  [76.91, 33.59],
  [76.93, 33.61],
  [76.95, 33.62],
  [76.98, 33.64],
  [77.0, 33.67],
  [77.03, 33.69],
  [77.05, 33.7],
  [77.07, 33.72],
  [77.09, 33.74],
  [77.12, 33.76],
  [77.15, 33.78],
  [77.17, 33.81],
  [77.18, 33.84],
  [77.2, 33.86],
  [77.22, 33.88],
  [77.24, 33.9],
  [77.27, 33.92],
  [77.29, 33.94],
  [77.3, 33.95],
  [77.32, 33.97],
  [77.34, 33.99],
  [77.36, 34.01],
  [77.38, 34.02],
  [77.4, 34.04],
  [77.42, 34.06],
  [77.44, 34.08],
  [77.45, 34.1],
  [77.47, 34.12],
  [77.48, 34.14],
  [77.49, 34.16],
  [77.5, 34.18],
  [77.51, 34.19],
  [77.53, 34.2],
  [77.54, 34.21],
  [77.55, 34.22],
  [77.57, 34.24],
  [77.59, 34.25],
  [77.61, 34.27],
  [77.62, 34.28],
  [77.64, 34.3],
  [77.66, 34.31],
  [77.68, 34.33],
  [77.7, 34.35],
  [77.72, 34.36],
  [77.74, 34.37],
  [77.76, 34.39],
  [77.78, 34.4],
  [77.81, 34.41],
  [77.84, 34.43],
  [77.86, 34.44],
  [77.88, 34.45],
  [77.91, 34.46],
  [77.94, 34.48],
  [77.96, 34.49],
  [77.98, 34.5],
  [78.01, 34.51],
  [78.04, 34.53],
  [78.06, 34.54],
  [78.08, 34.55],
  [78.11, 34.56],
  [78.14, 34.58],
  [78.16, 34.59],
  [78.18, 34.6],
  [78.21, 34.61],
  [78.24, 34.63],
  [78.26, 34.64],
  [78.28, 34.65],
  [78.31, 34.67],
  [78.34, 34.69],
  [78.36, 34.71],
  [78.38, 34.72],
  [78.41, 34.74],
  [78.44, 34.76],
  [78.48, 34.78],
];

/** 8 camera positions distributed along the border */
function buildCameras(): BorderCamera[] {
  const cameraPositions: {
    pos: [number, number];
    bearing: number;
    label: string;
  }[] = [
    { pos: [76.9, 33.58], bearing: 45, label: 'CAM-01' },
    { pos: [77.1, 33.74], bearing: 60, label: 'CAM-02' },
    { pos: [77.28, 33.93], bearing: 40, label: 'CAM-03' },
    { pos: [77.48, 34.14], bearing: 55, label: 'CAM-04' },
    { pos: [77.65, 34.31], bearing: 50, label: 'CAM-05' },
    { pos: [77.85, 34.43], bearing: 35, label: 'CAM-06' },
    { pos: [78.1, 34.56], bearing: 65, label: 'CAM-07' },
    { pos: [78.35, 34.69], bearing: 45, label: 'CAM-08' },
  ];

  return cameraPositions.map((c, i) => ({
    id: `camera-${i}`,
    label: c.label,
    position: c.pos,
    bearing: c.bearing,
    status: i === 5 ? 'alert' : 'online',
    coverageCone: buildCoverageCone(c.pos, c.bearing, 5, 120),
  }));
}

/** 2 patrol routes parallel to the border */
function buildPatrolRoutes(): BorderPatrolRoute[] {
  const offsetRoute = (
    coords: [number, number][],
    lngOff: number,
    latOff: number,
  ): [number, number][] =>
    coords.map(([lng, lat]) => [lng + lngOff, lat + latOff]);

  const route1Path = offsetRoute(LAC_BORDER_COORDS, -0.06, -0.04);
  const route2Path = offsetRoute(LAC_BORDER_COORDS.slice(4, 16), -0.1, -0.06);

  const ARC = 300;
  const spline = (
    p0: number,
    p1: number,
    p2: number,
    p3: number,
    t: number,
  ): number =>
    0.5 *
    (2 * p1 +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t);

  const interpolate = (
    path: [number, number][],
    n: number,
  ): [number, number][] => {
    if (path.length < 2) return path;
    const segs = path.length - 1;
    const result: [number, number][] = [];
    for (let i = 0; i < n; i++) {
      const t = (i / (n - 1)) * segs;
      const seg = Math.min(Math.floor(t), segs - 1);
      const frac = t - seg;
      const i0 = Math.max(seg - 1, 0);
      const i1 = seg;
      const i2 = Math.min(seg + 1, segs);
      const i3 = Math.min(seg + 2, segs);
      result.push([
        spline(path[i0]![0], path[i1]![0], path[i2]![0], path[i3]![0], frac),
        spline(path[i0]![1], path[i1]![1], path[i2]![1], path[i3]![1], frac),
      ]);
    }
    return result;
  };

  const arc1 = interpolate(route1Path, ARC);
  const arc2 = interpolate(route2Path, ARC);

  return [
    {
      id: 'patrol-alpha',
      name: 'Patrol Alpha',
      status: 'patrolling',
      color: [0, 200, 255],
      path: arc1,
      timestamps: arc1.map((_, i) => i),
    },
    {
      id: 'patrol-bravo',
      name: 'Patrol Bravo',
      status: 'patrolling',
      color: [255, 180, 0],
      path: arc2,
      timestamps: arc2.map((_, i) => i),
    },
  ];
}

/** 3 intrusion detection zones at critical border crossings */
function buildIntrusionZones(): IntrusionZone[] {
  return [
    {
      id: 'zone-depsang',
      name: 'Depsang Plains',
      alertLevel: 'high',
      polygon: [
        [77.4, 34.08],
        [77.55, 34.08],
        [77.55, 34.2],
        [77.4, 34.2],
        [77.4, 34.08],
      ],
    },
    {
      id: 'zone-galwan',
      name: 'Galwan Valley',
      alertLevel: 'high',
      polygon: [
        [77.6, 34.26],
        [77.75, 34.26],
        [77.75, 34.38],
        [77.6, 34.38],
        [77.6, 34.26],
      ],
    },
    {
      id: 'zone-pangong',
      name: 'Pangong Tso',
      alertLevel: 'medium',
      polygon: [
        [78.0, 34.48],
        [78.2, 34.48],
        [78.2, 34.58],
        [78.0, 34.58],
        [78.0, 34.48],
      ],
    },
  ];
}

const ARC_POINTS = 300;
const BASE_LOOP_SECONDS = 80;

export function useBorderSurveillance() {
  const borderLine = ref<[number, number][]>([...LAC_BORDER_COORDS]);
  const cameras = ref<BorderCamera[]>(buildCameras());
  const patrols = ref<BorderPatrolRoute[]>(buildPatrolRoutes());
  const intrusionZones = ref<IntrusionZone[]>(buildIntrusionZones());

  const visibleLayers = ref<Set<BorderLayerName>>(
    new Set(['cameras', 'patrols', 'zones', 'border']),
  );
  const currentTime = ref(0);
  const isPlaying = ref(false);
  const speed = ref(1);

  let animationFrame: number | null = null;
  let lastTimestamp = 0;

  function toggleLayer(layer: BorderLayerName): void {
    const next = new Set(visibleLayers.value);
    if (next.has(layer)) {
      next.delete(layer);
    } else {
      next.add(layer);
    }
    visibleLayers.value = next;
  }

  function getPatrolPosition(routeId: string): BorderPatrolPosition | null {
    const route = patrols.value.find((p) => p.id === routeId);
    if (!route || route.path.length < 2) return null;

    const maxIdx = route.path.length - 1;
    const t = currentTime.value % maxIdx;
    const idx = Math.floor(t);
    const frac = t - idx;

    const pt = route.path[idx]!;
    const next = route.path[(idx + 1) % route.path.length]!;

    const lng = pt[0] + (next[0] - pt[0]) * frac;
    const lat = pt[1] + (next[1] - pt[1]) * frac;

    const bearingIdx = Math.min(idx + 3, maxIdx);
    const bearingPt = route.path[bearingIdx]!;
    const bearing = calculateBearing(lat, lng, bearingPt[1], bearingPt[0]);

    return { lng, lat, bearing, routeId };
  }

  const positions = computed<Record<string, BorderPatrolPosition>>(() => {
    const result: Record<string, BorderPatrolPosition> = {};
    for (const route of patrols.value) {
      const pos = getPatrolPosition(route.id);
      if (pos) result[route.id] = pos;
    }
    return result;
  });

  const loopedTime = computed(() => currentTime.value % (ARC_POINTS - 1));

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

  function startAnimation(): void {
    isPlaying.value = true;
    lastTimestamp = 0;
    if (!animationFrame) {
      animationFrame = requestAnimationFrame(animate);
    }
  }

  function pauseAnimation(): void {
    isPlaying.value = false;
  }

  function setSpeed(newSpeed: number): void {
    speed.value = newSpeed;
  }

  function cleanup(): void {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
  }

  return {
    borderLine,
    cameras,
    patrols,
    positions,
    intrusionZones,
    visibleLayers,
    loopedTime,
    isPlaying,
    speed,
    toggleLayer,
    startAnimation,
    pauseAnimation,
    setSpeed,
    cleanup,
  };
}
