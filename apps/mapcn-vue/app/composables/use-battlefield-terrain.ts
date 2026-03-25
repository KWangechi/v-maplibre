import type {
  BattlefieldUnit,
  BattlefieldPath,
  BattlefieldPosition,
  BattlefieldStats,
  MilitaryUnitType,
  MissionPhase,
  MissionPhaseInfo,
} from '~/types/defense-terrain';

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
  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const dLambda = toRad(lon2 - lon1);

  const y = Math.sin(dLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLambda);

  return (Math.atan2(y, x) * RAD_TO_DEG + 360) % 360;
}

function catmullRom(
  p0: number,
  p1: number,
  p2: number,
  p3: number,
  t: number,
): number {
  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t)
  );
}

function interpolatePath(
  waypoints: [number, number][],
  numPoints: number,
): [number, number][] {
  if (waypoints.length < 2) return waypoints;

  const n = waypoints.length - 1;
  const result: [number, number][] = [];

  for (let i = 0; i < numPoints; i++) {
    const t = (i / (numPoints - 1)) * n;
    const seg = Math.min(Math.floor(t), n - 1);
    const frac = t - seg;

    const i0 = Math.max(seg - 1, 0);
    const i1 = seg;
    const i2 = Math.min(seg + 1, n);
    const i3 = Math.min(seg + 2, n);

    result.push([
      catmullRom(
        waypoints[i0]![0],
        waypoints[i1]![0],
        waypoints[i2]![0],
        waypoints[i3]![0],
        frac,
      ),
      catmullRom(
        waypoints[i0]![1],
        waypoints[i1]![1],
        waypoints[i2]![1],
        waypoints[i3]![1],
        frac,
      ),
    ]);
  }

  return result;
}

const UNITS: BattlefieldUnit[] = [
  {
    id: 'alpha',
    callsign: 'Alpha',
    type: 'infantry',
    color: [30, 144, 255],
    strength: 120,
  },
  {
    id: 'bravo',
    callsign: 'Bravo',
    type: 'infantry',
    color: [65, 170, 255],
    strength: 95,
  },
  {
    id: 'charlie',
    callsign: 'Charlie',
    type: 'armor',
    color: [255, 165, 0],
    strength: 14,
  },
  {
    id: 'delta',
    callsign: 'Delta',
    type: 'armor',
    color: [255, 200, 60],
    strength: 12,
  },
  {
    id: 'echo',
    callsign: 'Echo',
    type: 'patrol',
    color: [0, 200, 100],
    strength: 30,
  },
  {
    id: 'foxtrot',
    callsign: 'Foxtrot',
    type: 'recon',
    color: [180, 100, 255],
    strength: 8,
  },
];

const MISSION_PHASES: MissionPhaseInfo[] = [
  {
    phase: 'assembly',
    label: 'Assembly',
    timeRange: [0, 25],
    description: 'Units marshalling at forward staging area',
  },
  {
    phase: 'advance',
    label: 'Advance',
    timeRange: [25, 60],
    description: 'Tactical advance along designated axes',
  },
  {
    phase: 'engagement',
    label: 'Engagement',
    timeRange: [60, 80],
    description: 'Units converging on objective area',
  },
  {
    phase: 'consolidation',
    label: 'Consolidation',
    timeRange: [80, 100],
    description: 'Establishing defensive positions',
  },
];

// Waypoints per unit: assembly → advance → engagement → consolidation
const UNIT_WAYPOINTS: Record<string, [number, number][]> = {
  alpha: [
    [78.15, 34.18],
    [78.16, 34.19],
    [78.17, 34.2],
    [78.19, 34.21],
    [78.21, 34.23],
    [78.23, 34.24],
    [78.25, 34.25],
    [78.22, 34.24],
    [78.24, 34.26],
    [78.26, 34.25],
  ],
  bravo: [
    [78.16, 34.18],
    [78.17, 34.19],
    [78.18, 34.21],
    [78.19, 34.23],
    [78.2, 34.25],
    [78.2, 34.27],
    [78.21, 34.28],
    [78.22, 34.24],
    [78.2, 34.26],
    [78.19, 34.27],
  ],
  charlie: [
    [78.15, 34.17],
    [78.17, 34.17],
    [78.2, 34.18],
    [78.23, 34.18],
    [78.26, 34.19],
    [78.28, 34.2],
    [78.3, 34.2],
    [78.22, 34.24],
    [78.28, 34.22],
    [78.3, 34.21],
  ],
  delta: [
    [78.14, 34.18],
    [78.16, 34.18],
    [78.18, 34.19],
    [78.21, 34.2],
    [78.24, 34.21],
    [78.26, 34.23],
    [78.28, 34.24],
    [78.22, 34.24],
    [78.25, 34.25],
    [78.27, 34.24],
  ],
  echo: [
    [78.14, 34.19],
    [78.13, 34.19],
    [78.11, 34.2],
    [78.09, 34.2],
    [78.08, 34.21],
    [78.08, 34.22],
    [78.1, 34.22],
    [78.22, 34.24],
    [78.12, 34.23],
    [78.1, 34.24],
  ],
  foxtrot: [
    [78.16, 34.19],
    [78.17, 34.2],
    [78.19, 34.22],
    [78.2, 34.24],
    [78.21, 34.26],
    [78.22, 34.28],
    [78.22, 34.3],
    [78.22, 34.24],
    [78.23, 34.28],
    [78.21, 34.29],
  ],
};

const ARC_POINTS = 300;
const BASE_DURATION_SECONDS = 40;

export function useBattlefieldTerrain() {
  const currentTime = ref(0);
  const isPlaying = ref(false);
  const speed = ref(1);
  const progress = ref(0);
  const elapsedTime = ref(0);
  const activeUnitTypes = ref<Set<MilitaryUnitType>>(
    new Set(['infantry', 'armor', 'patrol', 'recon']),
  );

  let animationFrame: number | null = null;
  let lastTimestamp = 0;

  // Pre-compute interpolated paths
  const paths = computed<BattlefieldPath[]>(() => {
    return UNITS.map((unit) => {
      const waypoints = UNIT_WAYPOINTS[unit.id]!;
      const interpolated = interpolatePath(waypoints, ARC_POINTS);
      const timestamps = interpolated.map((_, i) => i);
      return { unitId: unit.id, path: interpolated, timestamps };
    });
  });

  const activeUnits = computed<BattlefieldUnit[]>(() =>
    UNITS.filter((u) => activeUnitTypes.value.has(u.type)),
  );

  const activePaths = computed<BattlefieldPath[]>(() =>
    paths.value.filter((p) => {
      const unit = UNITS.find((u) => u.id === p.unitId);
      return unit ? activeUnitTypes.value.has(unit.type) : false;
    }),
  );

  const positions = computed<BattlefieldPosition[]>(() => {
    const t = currentTime.value;
    const maxIdx = ARC_POINTS - 1;
    const result: BattlefieldPosition[] = [];

    for (const unit of activeUnits.value) {
      const unitPath = paths.value.find((p) => p.unitId === unit.id);
      if (!unitPath || unitPath.path.length < 2) continue;

      const clampedT = Math.min(t, maxIdx);
      const idx = Math.floor(clampedT);
      const frac = clampedT - idx;
      const safeIdx = Math.min(idx, maxIdx - 1);

      const p0 = unitPath.path[safeIdx]!;
      const p1 = unitPath.path[safeIdx + 1]!;

      const lng = p0[0] + (p1[0] - p0[0]) * frac;
      const lat = p0[1] + (p1[1] - p0[1]) * frac;

      const bearingIdx = Math.min(safeIdx + 3, maxIdx);
      const bearingPt = unitPath.path[bearingIdx]!;
      const bearing = calculateBearing(lat, lng, bearingPt[1], bearingPt[0]);

      result.push({ lng, lat, bearing, unitId: unit.id });
    }

    return result;
  });

  const selectedPhase = computed<MissionPhaseInfo>(() => {
    const p = progress.value;
    return (
      MISSION_PHASES.find(
        (phase) => p >= phase.timeRange[0] && p < phase.timeRange[1],
      ) ?? MISSION_PHASES[MISSION_PHASES.length - 1]!
    );
  });

  const stats = computed<BattlefieldStats>(() => ({
    phase: selectedPhase.value.phase,
    phaseLabel: selectedPhase.value.label,
    phaseDescription: selectedPhase.value.description,
    elapsedTime: elapsedTime.value,
    activeUnits: activeUnits.value.length,
  }));

  function animate(timestamp: number): void {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const delta = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    if (isPlaying.value) {
      const increment =
        (delta * speed.value * ARC_POINTS) / BASE_DURATION_SECONDS;
      const newTime = currentTime.value + increment;

      if (newTime >= ARC_POINTS - 1) {
        currentTime.value = ARC_POINTS - 1;
        progress.value = 100;
        isPlaying.value = false;
      } else {
        currentTime.value = newTime;
        progress.value = (newTime / (ARC_POINTS - 1)) * 100;
      }
      elapsedTime.value += delta;
    }

    animationFrame = requestAnimationFrame(animate);
  }

  function play(): void {
    if (progress.value >= 100) {
      resetAnimation();
    }
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
    progress.value = 0;
    elapsedTime.value = 0;
    lastTimestamp = 0;
  }

  function setSpeed(newSpeed: number): void {
    speed.value = newSpeed;
  }

  function seekTo(pct: number): void {
    const clamped = Math.max(0, Math.min(100, pct));
    progress.value = clamped;
    currentTime.value = (clamped / 100) * (ARC_POINTS - 1);
  }

  function toggleUnitType(type: MilitaryUnitType): void {
    const next = new Set(activeUnitTypes.value);
    if (next.has(type)) {
      next.delete(type);
    } else {
      next.add(type);
    }
    activeUnitTypes.value = next;
  }

  function cleanup(): void {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
  }

  return {
    units: UNITS,
    missionPhases: MISSION_PHASES,
    paths,
    activePaths,
    activeUnits,
    positions,
    currentTime,
    selectedPhase,
    isPlaying,
    speed,
    progress,
    activeUnitTypes,
    stats,
    play,
    pause,
    resetAnimation,
    setSpeed,
    seekTo,
    toggleUnitType,
    cleanup,
  };
}
