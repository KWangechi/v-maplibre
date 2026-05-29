import type {
  VesselType,
  VesselPosition,
  StsEvent,
  Chokepoint,
  ChokepointStats,
  StsEventDatum,
  LanePathDatum,
} from '~/types/maritime-chokepoints';

function interpolateLane(
  waypoints: [number, number][],
  t: number,
): [number, number] {
  if (waypoints.length === 1) return waypoints[0]!;
  const n = waypoints.length - 1;
  const seg = Math.min(Math.floor(t * n), n - 1);
  const frac = t * n - seg;
  const p0 = waypoints[Math.max(seg - 1, 0)]!;
  const p1 = waypoints[seg]!;
  const p2 = waypoints[Math.min(seg + 1, n)]!;
  const p3 = waypoints[Math.min(seg + 2, n)]!;
  // Catmull-Rom
  const cr = (a: number, b: number, c: number, d: number, tt: number): number =>
    0.5 *
    (2 * b +
      (-a + c) * tt +
      (2 * a - 5 * b + 4 * c - d) * tt * tt +
      (-a + 3 * b - 3 * c + d) * tt * tt * tt);
  return [
    cr(p0[0], p1[0], p2[0], p3[0], frac),
    cr(p0[1], p1[1], p2[1], p3[1], frac),
  ];
}

const CHOKEPOINTS: Chokepoint[] = [
  {
    id: 'hormuz',
    name: 'Strait of Hormuz',
    center: [56.45, 26.45],
    zoom: 8,
    lane: [
      [55.65, 26.7],
      [56.0, 26.6],
      [56.3, 26.45],
      [56.55, 26.3],
      [56.85, 26.1],
    ],
  },
  {
    id: 'suez',
    name: 'Suez Canal',
    center: [32.45, 30.5],
    zoom: 8,
    lane: [
      [32.31, 31.23],
      [32.33, 30.95],
      [32.36, 30.6],
      [32.48, 30.2],
      [32.56, 29.93],
    ],
  },
  {
    id: 'malacca',
    name: 'Strait of Malacca',
    center: [100.3, 2.8],
    zoom: 7,
    lane: [
      [98.6, 4.4],
      [99.4, 3.5],
      [100.2, 2.7],
      [101.0, 1.9],
      [101.7, 1.4],
    ],
  },
  {
    id: 'bab',
    name: 'Bab-el-Mandeb',
    center: [43.35, 12.65],
    zoom: 9,
    lane: [
      [43.15, 13.05],
      [43.28, 12.78],
      [43.37, 12.58],
      [43.45, 12.42],
    ],
  },
];

const VESSEL_NAMES = [
  'MT Nordic Aurora',
  'MV Pacific Voyager',
  'MT Epsilon Star',
  'MV Orion Gate',
  'MT Caspian Pride',
  'MV Horizon Scout',
  'MT Zephyr Wave',
  'MV Delta Navigator',
  'MT Coral Quest',
  'MV Atlas Pioneer',
  'MT Serenity Sea',
  'MV Storm Chaser',
  'MT Venture Spirit',
  'MV Ocean Guardian',
  'MT Liberty Star',
  'MV Pacific Titan',
  'MT Nautilus Pride',
  'MV Sea Legend',
  'MT Grand Fortune',
  'MV Southern Cross',
  'MT Victory Wave',
  'MV Global Trader',
  'MT Royal Carrier',
  'MV Silver Express',
  'MT Atlantic Pioneer',
  'MV Crystal Harmony',
  'MT Excellence',
  'MV Express Navigator',
  'MT Superior Star',
  'MV Majestic Sea',
];

const STS_VESSEL_POOL = VESSEL_NAMES.slice(0, 16);

function generateVesselPositions(cp: Chokepoint): VesselPosition[] {
  const count = Math.floor(Math.random() * 201) + 400; // 400-600
  const types: VesselType[] = ['tanker', 'cargo', 'container', 'patrol'];
  const typeWeights = [0.45, 0.3, 0.2, 0.05];

  return Array.from({ length: count }, (_, i) => {
    const t = Math.random();
    const lanePt = interpolateLane(cp.lane, t);
    // Tight scatter (~3-9km) keeps vessels inside the navigable channel, not on land
    const scatterStd = 0.03 + Math.random() * 0.05;
    const angle = Math.random() * 2 * Math.PI;
    return {
      lng: lanePt[0] + scatterStd * Math.cos(angle),
      lat: lanePt[1] + scatterStd * Math.sin(angle),
      vesselId: `v-${cp.id}-${i}`,
      type: weightedPick(types, typeWeights),
    };
  });
}

function weightedPick<T>(items: T[], weights: number[]): T {
  const r = Math.random();
  let cumulative = 0;
  for (let i = 0; i < items.length; i++) {
    cumulative += weights[i]!;
    if (r <= cumulative) return items[i]!;
  }
  return items[items.length - 1]!;
}

function generateStsEvents(positions: VesselPosition[]): StsEvent[] {
  const count = Math.floor(Math.random() * 5) + 6; // 6-10
  const events: StsEvent[] = [];
  const usedIndices = new Set<number>();

  for (let i = 0; i < count; i++) {
    let idx1: number;
    let attempts = 0;
    do {
      idx1 = Math.floor(Math.random() * positions.length);
      attempts++;
    } while (usedIndices.has(idx1) && attempts < 20);
    usedIndices.add(idx1);

    let idx2: number;
    attempts = 0;
    do {
      idx2 = Math.floor(Math.random() * positions.length);
      attempts++;
    } while ((idx2 === idx1 || usedIndices.has(idx2)) && attempts < 20);
    usedIndices.add(idx2);

    const v1 = positions[idx1]!;
    const v2 = positions[idx2]!;
    const risk = Math.round(30 + Math.random() * 70);

    events.push({
      id: `sts-${i}`,
      midpointLng: (v1.lng + v2.lng) / 2,
      midpointLat: (v1.lat + v2.lat) / 2,
      vessel1Name: STS_VESSEL_POOL[idx1 % STS_VESSEL_POOL.length],
      vessel2Name: STS_VESSEL_POOL[idx2 % STS_VESSEL_POOL.length],
      risk,
    });
  }
  return events;
}

export function useMaritimeChokepoints() {
  const selectedChokepointId = ref<string>('hormuz');

  const selectedChokepoint = computed<Chokepoint>(
    () =>
      CHOKEPOINTS.find((c) => c.id === selectedChokepointId.value) ??
      CHOKEPOINTS[0]!,
  );

  const vesselPositions = ref<VesselPosition[]>([]);
  const stsEvents = ref<StsEvent[]>([]);

  const showSts = ref(true);
  // Hexagon radius is in METERS. At the chokepoint zoom (~8) one pixel covers
  // ~550m, so a 400m hex is sub-pixel and invisible — the density field needs
  // ~2-3km bins to read on screen.
  const hexagonRadius = ref(2500);
  const elevationScale = ref(30);
  const isPlaying = ref(false);
  const loopedTime = ref(0);

  let animationFrame: number | null = null;
  let lastTimestamp = 0;
  const STS_PULSE_PERIOD = 120;

  function generate(): void {
    const cp = selectedChokepoint.value;
    vesselPositions.value = generateVesselPositions(cp);
    stsEvents.value = generateStsEvents(vesselPositions.value);
  }

  function selectChokepoint(id: string): void {
    selectedChokepointId.value = id;
    generate();
  }

  function animate(timestamp: number): void {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const delta = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;
    if (isPlaying.value) {
      loopedTime.value = (loopedTime.value + delta * 20) % STS_PULSE_PERIOD;
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
    loopedTime.value = 0;
    lastTimestamp = 0;
  }

  function cleanup(): void {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
  }

  const densityPeak = computed<number>(() => {
    const positions = vesselPositions.value;
    if (positions.length === 0) return 0;
    // rough density: count in a 0.2° grid cell
    const grid: Record<string, number> = {};
    for (const p of positions) {
      const key = `${Math.round(p.lng * 5) / 5},${Math.round(p.lat * 5) / 5}`;
      grid[key] = (grid[key] ?? 0) + 1;
    }
    return Math.max(...Object.values(grid), 0);
  });

  const stats = computed<ChokepointStats>(() => ({
    totalVessels: vesselPositions.value.length,
    densityPeak: densityPeak.value,
    stsEvents: showSts.value ? stsEvents.value.length : 0,
    activeChokepoint: selectedChokepoint.value.name,
  }));

  const stsEventData = computed<StsEventDatum[]>(() =>
    stsEvents.value.map((e) => ({
      lng: e.midpointLng,
      lat: e.midpointLat,
      id: e.id,
      vessel1Name: e.vessel1Name,
      vessel2Name: e.vessel2Name,
      risk: e.risk,
    })),
  );

  const lanePath = computed<LanePathDatum>(() => ({
    path: selectedChokepoint.value.lane,
  }));

  // initial generation
  generate();

  return {
    chokepoints: CHOKEPOINTS,
    selectedChokepoint,
    selectedChokepointId,
    vesselPositions,
    stsEvents,
    stsEventData,
    lanePath,
    showSts,
    hexagonRadius,
    elevationScale,
    isPlaying,
    loopedTime,
    stats,
    selectChokepoint,
    play,
    pause,
    reset,
    cleanup,
  };
}
