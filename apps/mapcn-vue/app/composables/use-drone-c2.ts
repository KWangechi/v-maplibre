import type {
  C2Unit,
  C2UnitPosition,
  C2UnitTelemetry,
  C2PatrolPath,
  C2Waypoint,
} from '~/types/defense-drone-c2';

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

/** Generate a closed polygon loop around a center point */
function generatePatrolLoop(
  center: [number, number],
  radiusKm: number,
  numWaypoints: number,
): [number, number][] {
  const [cLng, cLat] = center;
  const points: [number, number][] = [];
  const latDeg = radiusKm / 111.32;
  const lngDeg = radiusKm / (111.32 * Math.cos(toRad(cLat)));

  for (let i = 0; i <= numWaypoints; i++) {
    const angle = (i / numWaypoints) * 2 * Math.PI;
    // Add some noise for realism
    const r = 1 + 0.15 * Math.sin(angle * 3) + 0.1 * Math.cos(angle * 5);
    const lng = cLng + lngDeg * r * Math.cos(angle);
    const lat = cLat + latDeg * r * Math.sin(angle);
    points.push([lng, lat]);
  }
  // Close the loop
  points.push([...points[0]!]);
  return points;
}

/** Interpolate waypoints into smooth arc with N points */
function interpolateLoop(
  waypoints: [number, number][],
  numPoints: number,
): [number, number][] {
  if (waypoints.length < 2) return waypoints;

  const segments: number[] = [0];
  let totalDist = 0;
  for (let i = 1; i < waypoints.length; i++) {
    const [x1, y1] = waypoints[i - 1]!;
    const [x2, y2] = waypoints[i]!;
    const dx = x2 - x1;
    const dy = y2 - y1;
    totalDist += Math.sqrt(dx * dx + dy * dy);
    segments.push(totalDist);
  }

  const result: [number, number][] = [];
  const step = totalDist / numPoints;

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

const UNITS: C2Unit[] = [
  {
    id: 'alpha',
    callsign: 'ALPHA',
    type: 'drone',
    status: 'active',
    color: [0, 200, 255],
  },
  {
    id: 'bravo',
    callsign: 'BRAVO',
    type: 'drone',
    status: 'active',
    color: [255, 140, 0],
  },
  {
    id: 'charlie',
    callsign: 'CHARLIE',
    type: 'drone',
    status: 'active',
    color: [0, 255, 130],
  },
  {
    id: 'delta',
    callsign: 'DELTA',
    type: 'drone',
    status: 'active',
    color: [255, 60, 60],
  },
  {
    id: 'echo',
    callsign: 'ECHO',
    type: 'ugv',
    status: 'active',
    color: [180, 130, 255],
  },
  {
    id: 'foxtrot',
    callsign: 'FOXTROT',
    type: 'ugv',
    status: 'active',
    color: [255, 200, 0],
  },
];

const PATROL_CENTERS: Record<string, [number, number]> = {
  alpha: [70.4, 26.9],
  bravo: [70.6, 26.7],
  charlie: [70.3, 26.6],
  delta: [70.7, 26.9],
  echo: [70.5, 26.8],
  foxtrot: [70.45, 26.75],
};

const ARC_POINTS = 400;
const BASE_LOOP_SECONDS = 60;

function buildPatrolPaths(): C2PatrolPath[] {
  return UNITS.map((unit) => {
    const center = PATROL_CENTERS[unit.id]!;
    const radiusKm = unit.type === 'drone' ? 12 : 4;
    const numWaypoints = unit.type === 'drone' ? 10 : 8;
    const rawWaypoints = generatePatrolLoop(center, radiusKm, numWaypoints);
    const arcPath = interpolateLoop(rawWaypoints, ARC_POINTS);
    const timestamps = arcPath.map((_, i) => i);
    return { unitId: unit.id, path: arcPath, timestamps };
  });
}

function buildWaypoints(): C2Waypoint[] {
  return UNITS.map((unit, idx) => {
    const center = PATROL_CENTERS[unit.id]!;
    return {
      id: `wp-${unit.id}`,
      position: center,
      label: `WP-${idx + 1}`,
      unitId: unit.id,
    };
  });
}

export function useDroneC2() {
  const units = ref<C2Unit[]>([...UNITS]);
  const patrolPaths = ref<C2PatrolPath[]>(buildPatrolPaths());
  const waypoints = ref<C2Waypoint[]>(buildWaypoints());

  const currentTime = ref(0);
  const isPlaying = ref(false);
  const speed = ref(1);
  const selectedUnitId = ref<string | null>('alpha');

  let animationFrame: number | null = null;
  let lastTimestamp = 0;

  const selectedUnit = computed(
    () => units.value.find((u) => u.id === selectedUnitId.value) ?? null,
  );

  /** Compute position for a single unit at the current time */
  function getUnitPosition(unitId: string): C2UnitPosition | null {
    const patrol = patrolPaths.value.find((p) => p.unitId === unitId);
    if (!patrol || patrol.path.length < 2) return null;

    const maxIdx = patrol.path.length - 1;
    // Loop the time — units patrol continuously
    const t = currentTime.value % maxIdx;
    const idx = Math.floor(t);
    const frac = t - idx;

    const pt = patrol.path[idx]!;
    const next = patrol.path[(idx + 1) % patrol.path.length]!;

    const lng = pt[0] + (next[0] - pt[0]) * frac;
    const lat = pt[1] + (next[1] - pt[1]) * frac;

    const bearingIdx = Math.min(idx + 3, maxIdx);
    const bearingPt = patrol.path[bearingIdx]!;
    const bearing = calculateBearing(lat, lng, bearingPt[1], bearingPt[0]);

    return { lng, lat, bearing };
  }

  const positions = computed<Record<string, C2UnitPosition>>(() => {
    const result: Record<string, C2UnitPosition> = {};
    for (const unit of units.value) {
      const pos = getUnitPosition(unit.id);
      if (pos) result[unit.id] = pos;
    }
    return result;
  });

  /** Simulated telemetry per unit */
  const telemetry = computed<Record<string, C2UnitTelemetry>>(() => {
    const result: Record<string, C2UnitTelemetry> = {};
    const t = currentTime.value;
    for (const unit of units.value) {
      const pos = positions.value[unit.id];
      const baseAlt = unit.type === 'drone' ? 120 : 0;
      const altVariation =
        unit.type === 'drone'
          ? 10 * Math.sin(t * 0.05 + unit.id.charCodeAt(0))
          : 0;
      const baseSpeed = unit.type === 'drone' ? 85 : 35;
      const speedVariation = 5 * Math.sin(t * 0.08 + unit.id.charCodeAt(1));
      const batteryDrain = Math.max(
        15,
        100 - t * 0.02 * (unit.type === 'drone' ? 1 : 0.5),
      );
      result[unit.id] = {
        altitude: Math.round(baseAlt + altVariation),
        speed: Math.round(baseSpeed + speedVariation),
        battery: Math.round(batteryDrain),
        heading: Math.round(pos?.bearing ?? 0),
      };
    }
    return result;
  });

  /** Trip data formatted for TripsLayer — one entry per unit */
  const tripData = computed(() =>
    patrolPaths.value.map((p) => ({
      unitId: p.unitId,
      path: p.path,
      timestamps: p.timestamps,
    })),
  );

  /** Looping current time for TripsLayer (wraps around) */
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

  function resetAnimation(): void {
    isPlaying.value = false;
    currentTime.value = 0;
    lastTimestamp = 0;
  }

  function setSpeed(newSpeed: number): void {
    speed.value = newSpeed;
  }

  function selectUnit(unitId: string | null): void {
    selectedUnitId.value = unitId;
  }

  function cleanup(): void {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
  }

  return {
    units,
    patrolPaths,
    waypoints,
    tripData,
    currentTime,
    loopedTime,
    isPlaying,
    speed,
    selectedUnitId,
    selectedUnit,
    positions,
    telemetry,
    play,
    pause,
    resetAnimation,
    setSpeed,
    selectUnit,
    cleanup,
  };
}
