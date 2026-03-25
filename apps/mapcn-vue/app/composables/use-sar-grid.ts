import type {
  SarSector,
  SarHelicopter,
  SarHelicopterPosition,
  SarStats,
  SarTripDatum,
  SectorStatus,
} from '~/types/defense-sar';

const DEG_TO_RAD = Math.PI / 180;

const GRID_COLS = 6;
const GRID_ROWS = 4;
const SECTOR_SIZE_DEG = 0.045;
const GRID_ORIGIN: [number, number] = [79.365, 30.41];
const ARC_POINTS_PER_SECTOR = 20;
const BASE_LOOP_SECONDS = 90;

const ROW_LABELS = ['A', 'B', 'C', 'D'];

function generateSectors(): SarSector[] {
  const sectors: SarSector[] = [];
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      const lng0 = GRID_ORIGIN[0] + col * SECTOR_SIZE_DEG;
      const lat0 = GRID_ORIGIN[1] + row * SECTOR_SIZE_DEG;
      const lng1 = lng0 + SECTOR_SIZE_DEG;
      const lat1 = lat0 + SECTOR_SIZE_DEG;
      const label = `${ROW_LABELS[row]}${col + 1}`;

      const seed = row * GRID_COLS + col;
      const probability = Math.abs(
        Math.sin(seed * 1.7 + 0.3) * Math.cos(seed * 0.9 + 1.2),
      );

      sectors.push({
        id: label,
        label,
        row,
        col,
        bounds: [
          [lng0, lat0],
          [lng1, lat0],
          [lng1, lat1],
          [lng0, lat1],
          [lng0, lat0],
        ],
        probability: Math.round(probability * 100) / 100,
        status: 'unsearched',
      });
    }
  }
  return sectors;
}

function sectorCenter(sector: SarSector): [number, number] {
  const b0 = sector.bounds[0]!;
  const b2 = sector.bounds[2]!;
  const lng = (b0[0] + b2[0]) / 2;
  const lat = (b0[1] + b2[1]) / 2;
  return [lng, lat];
}

function buildHelicopterRoute(startCol: number): string[] {
  const route: string[] = [];
  for (let row = 0; row < GRID_ROWS; row++) {
    const isEvenRow = row % 2 === 0;
    for (let col = 0; col < GRID_COLS; col++) {
      const actualCol = isEvenRow
        ? startCol + col
        : startCol + (GRID_COLS - 1 - col);
      const wrappedCol = ((actualCol % GRID_COLS) + GRID_COLS) % GRID_COLS;
      route.push(`${ROW_LABELS[row]}${wrappedCol + 1}`);
    }
  }
  return route;
}

function buildFlightPath(
  sectors: SarSector[],
  sectorRoute: string[],
): { path: [number, number][]; timestamps: number[] } {
  const sectorMap = new Map(sectors.map((s) => [s.id, s]));
  const path: [number, number][] = [];
  const timestamps: number[] = [];
  let t = 0;

  for (let i = 0; i < sectorRoute.length; i++) {
    const sector = sectorMap.get(sectorRoute[i]!);
    if (!sector) continue;
    const center = sectorCenter(sector);

    if (i === 0) {
      path.push(center);
      timestamps.push(t);
      t += ARC_POINTS_PER_SECTOR;
    } else {
      const prevSector = sectorMap.get(sectorRoute[i - 1]!);
      if (!prevSector) continue;
      const prevCenter = sectorCenter(prevSector);

      for (let step = 1; step <= ARC_POINTS_PER_SECTOR; step++) {
        const frac = step / ARC_POINTS_PER_SECTOR;
        const lng = prevCenter[0] + (center[0] - prevCenter[0]) * frac;
        const lat = prevCenter[1] + (center[1] - prevCenter[1]) * frac;
        path.push([lng, lat]);
        timestamps.push(t + step);
      }
      t += ARC_POINTS_PER_SECTOR;
    }
  }

  return { path, timestamps };
}

function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const p1 = lat1 * DEG_TO_RAD;
  const p2 = lat2 * DEG_TO_RAD;
  const dl = (lon2 - lon1) * DEG_TO_RAD;
  const y = Math.sin(dl) * Math.cos(p2);
  const x =
    Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl);
  return (Math.atan2(y, x) * (180 / Math.PI) + 360) % 360;
}

const HELICOPTERS: SarHelicopter[] = [
  {
    id: 'helo-1',
    callsign: 'RESCUE-1',
    color: [0, 180, 255],
    sectorRoute: buildHelicopterRoute(0),
  },
  {
    id: 'helo-2',
    callsign: 'RESCUE-2',
    color: [255, 120, 0],
    sectorRoute: buildHelicopterRoute(3),
  },
];

export function useSarGrid() {
  const sectors = ref<SarSector[]>(generateSectors());
  const helicopters = ref<SarHelicopter[]>([...HELICOPTERS]);

  const currentTime = ref(0);
  const isPlaying = ref(false);
  const speed = ref(1);

  let animationFrame: number | null = null;
  let lastTimestamp = 0;

  const flightPaths = computed(() =>
    helicopters.value.map((helo) => {
      const fp = buildFlightPath(sectors.value, helo.sectorRoute);
      return { helicopterId: helo.id, ...fp };
    }),
  );

  const totalPathLength = computed(() => {
    const first = flightPaths.value[0];
    return first ? (first.timestamps[first.timestamps.length - 1] ?? 0) : 0;
  });

  const loopedTime = computed(() => {
    const max = totalPathLength.value;
    return max > 0 ? currentTime.value % max : 0;
  });

  function getHelicopterPosition(
    helicopterId: string,
  ): SarHelicopterPosition | null {
    const fp = flightPaths.value.find((f) => f.helicopterId === helicopterId);
    if (!fp || fp.path.length < 2) return null;

    const t = loopedTime.value;
    let idx = 0;
    for (let i = 0; i < fp.timestamps.length - 1; i++) {
      if (fp.timestamps[i + 1]! >= t) {
        idx = i;
        break;
      }
      idx = i;
    }

    const t0 = fp.timestamps[idx]!;
    const t1 = fp.timestamps[idx + 1] ?? t0;
    const frac = t1 > t0 ? (t - t0) / (t1 - t0) : 0;

    const pt = fp.path[idx]!;
    const next = fp.path[Math.min(idx + 1, fp.path.length - 1)]!;

    const lng = pt[0] + (next[0] - pt[0]) * frac;
    const lat = pt[1] + (next[1] - pt[1]) * frac;

    const lookIdx = Math.min(idx + 3, fp.path.length - 1);
    const lookPt = fp.path[lookIdx]!;
    const bearing = calculateBearing(lat, lng, lookPt[1], lookPt[0]);

    return { lng, lat, bearing };
  }

  const positions = computed<Record<string, SarHelicopterPosition>>(() => {
    const result: Record<string, SarHelicopterPosition> = {};
    for (const helo of helicopters.value) {
      const pos = getHelicopterPosition(helo.id);
      if (pos) result[helo.id] = pos;
    }
    return result;
  });

  const tripData = computed<SarTripDatum[]>(() =>
    flightPaths.value.map((fp) => ({
      helicopterId: fp.helicopterId,
      path: fp.path,
      timestamps: fp.timestamps,
    })),
  );

  function getCurrentSectorForHelo(helicopterId: string): string | null {
    const pos = positions.value[helicopterId];
    if (!pos) return null;
    for (const sector of sectors.value) {
      const b0 = sector.bounds[0]!;
      const b2 = sector.bounds[2]!;
      const [minLng, minLat] = b0;
      const [maxLng, maxLat] = b2;
      if (
        pos.lng >= minLng &&
        pos.lng <= maxLng &&
        pos.lat >= minLat &&
        pos.lat <= maxLat
      ) {
        return sector.id;
      }
    }
    return null;
  }

  function autoMarkSearched(): void {
    for (const helo of helicopters.value) {
      const sectorId = getCurrentSectorForHelo(helo.id);
      if (!sectorId) continue;
      const sector = sectors.value.find((s) => s.id === sectorId);
      if (sector && sector.status === 'unsearched') {
        sector.status = 'searched';
        sector.probability = 0;
      }
    }
  }

  function markSearched(sectorId: string): void {
    const sector = sectors.value.find((s) => s.id === sectorId);
    if (sector) {
      const newStatus: SectorStatus =
        sector.status === 'searched' ? 'unsearched' : 'searched';
      sector.probability =
        newStatus === 'searched'
          ? 0
          : Math.round(
              Math.abs(Math.sin(sector.row * 1.7 + sector.col * 0.9)) * 100,
            ) / 100;
      sector.status = newStatus;
    }
  }

  const stats = computed<SarStats>(() => {
    const total = sectors.value.length;
    const searched = sectors.value.filter(
      (s) => s.status === 'searched',
    ).length;
    return {
      totalSectors: total,
      searchedSectors: searched,
      remainingSectors: total - searched,
      coveragePercent: total > 0 ? Math.round((searched / total) * 100) : 0,
    };
  });

  function animate(timestamp: number): void {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const delta = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    if (isPlaying.value) {
      const max = totalPathLength.value || 1;
      const increment = (delta * speed.value * max) / BASE_LOOP_SECONDS;
      currentTime.value += increment;
      autoMarkSearched();
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
    sectors.value = generateSectors();
  }

  function cleanup(): void {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
  }

  return {
    sectors,
    helicopters,
    positions,
    tripData,
    currentTime,
    loopedTime,
    isPlaying,
    speed,
    stats,
    markSearched,
    play,
    pause,
    reset,
    cleanup,
  };
}
