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

/** ~20 coordinate pairs along the Ladakh LAC sector */
const LAC_BORDER_COORDS: [number, number][] = [
  [76.85, 33.55],
  [76.95, 33.62],
  [77.05, 33.7],
  [77.15, 33.78],
  [77.22, 33.88],
  [77.3, 33.95],
  [77.38, 34.02],
  [77.45, 34.1],
  [77.5, 34.18],
  [77.55, 34.22],
  [77.62, 34.28],
  [77.7, 34.35],
  [77.78, 34.4],
  [77.88, 34.45],
  [77.98, 34.5],
  [78.08, 34.55],
  [78.18, 34.6],
  [78.28, 34.65],
  [78.38, 34.72],
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
  const interpolate = (
    path: [number, number][],
    n: number,
  ): [number, number][] => {
    if (path.length < 2) return path;
    const segs: number[] = [0];
    let total = 0;
    for (let i = 1; i < path.length; i++) {
      const dx = path[i]![0] - path[i - 1]![0];
      const dy = path[i]![1] - path[i - 1]![1];
      total += Math.sqrt(dx * dx + dy * dy);
      segs.push(total);
    }
    const result: [number, number][] = [];
    for (let i = 0; i < n; i++) {
      const target = (i * total) / n;
      let si = 0;
      for (let j = 1; j < segs.length; j++) {
        if (segs[j]! >= target) {
          si = j - 1;
          break;
        }
        si = j - 1;
      }
      const start = segs[si]!;
      const end = segs[si + 1] ?? start;
      const len = end - start;
      const t = len > 0 ? (target - start) / len : 0;
      const [x1, y1] = path[si]!;
      const [x2, y2] = path[Math.min(si + 1, path.length - 1)]!;
      result.push([x1 + (x2 - x1) * t, y1 + (y2 - y1) * t]);
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
