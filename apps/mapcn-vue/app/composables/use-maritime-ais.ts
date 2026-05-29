import type {
  Vessel,
  VesselType,
  VesselPosition,
  TripDatum,
  MaritimeAisStats,
} from '~/types/maritime-ais';

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

function toRad(deg: number): number {
  return deg * DEG_TO_RAD;
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

function interpolateTrack(
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

// ---------------------------------------------------------------------------
// Shipping lane definitions
// ---------------------------------------------------------------------------
interface Lane {
  name: string;
  // [minLng, maxLng, minLat, maxLat]
  bounds: [number, number, number, number];
  // Preferred heading (degrees) + jitter
  heading: number;
  speedRange: [number, number];
  density: number; // 0-1 weight for vessel allocation
}

const LANES: Lane[] = [
  // North Atlantic
  {
    name: 'North Atlantic',
    bounds: [-60, -40, 43, 55],
    heading: 270,
    speedRange: [14, 22],
    density: 0.12,
  },
  // Mediterranean
  {
    name: 'Mediterranean',
    bounds: [-5, 36, 30, 46],
    heading: 90,
    speedRange: [10, 18],
    density: 0.1,
  },
  // Suez approach / Red Sea
  {
    name: 'Suez-Red Sea',
    bounds: [32, 45, 12, 28],
    heading: 0,
    speedRange: [12, 20],
    density: 0.09,
  },
  // Gulf of Oman / Hormuz
  {
    name: 'Gulf of Oman',
    bounds: [56, 62, 22, 28],
    heading: 270,
    speedRange: [10, 18],
    density: 0.08,
  },
  // Persian Gulf
  {
    name: 'Persian Gulf',
    bounds: [48, 56, 24, 30],
    heading: 180,
    speedRange: [10, 16],
    density: 0.07,
  },
  // Malacca Strait
  {
    name: 'Malacca',
    bounds: [95, 105, 0, 6],
    heading: 90,
    speedRange: [12, 18],
    density: 0.1,
  },
  // South China Sea
  {
    name: 'South China Sea',
    bounds: [106, 118, 5, 22],
    heading: 315,
    speedRange: [12, 20],
    density: 0.12,
  },
  // English Channel
  {
    name: 'English Channel',
    bounds: [-5, 5, 49, 51],
    heading: 180,
    speedRange: [8, 16],
    density: 0.06,
  },
  // US East Coast
  {
    name: 'US East Coast',
    bounds: [-80, -65, 28, 45],
    heading: 0,
    speedRange: [12, 20],
    density: 0.09,
  },
  // US West Coast
  {
    name: 'US West Coast',
    bounds: [-125, -115, 30, 48],
    heading: 180,
    speedRange: [12, 20],
    density: 0.07,
  },
  // West Africa / Gulf of Guinea
  {
    name: 'Gulf of Guinea',
    bounds: [-10, 10, -5, 8],
    heading: 0,
    speedRange: [10, 16],
    density: 0.04,
  },
  // South Atlantic (Brazil to Europe)
  {
    name: 'South Atlantic',
    bounds: [-35, -15, -30, -5],
    heading: 90,
    speedRange: [12, 18],
    density: 0.06,
  },
];

// ---------------------------------------------------------------------------
// Flag / country data
// ---------------------------------------------------------------------------
const FLAGS: { country: string; mid: number }[] = [
  { country: 'Panama', mid: 352 },
  { country: 'Liberia', mid: 636 },
  { country: 'Marshall Islands', mid: 538 },
  { country: 'Hong Kong', mid: 477 },
  { country: 'Malta', mid: 215 },
  { country: 'Greece', mid: 237 },
  { country: 'Singapore', mid: 563 },
  { country: 'Bahamas', mid: 308 },
  { country: 'Norway', mid: 257 },
  { country: 'Japan', mid: 431 },
  { country: 'Denmark', mid: 219 },
  { country: 'UK', mid: 232 },
  { country: 'US', mid: 338 },
  { country: 'India', mid: 419 },
  { country: 'China', mid: 413 },
  { country: 'Russia', mid: 273 },
  { country: 'Iran', mid: 422 },
  { country: 'North Korea', mid: 445 },
  { country: 'Syria', mid: 491 },
];

// ---------------------------------------------------------------------------
// Vessel type config
// ---------------------------------------------------------------------------
const VESSEL_COLORS: Record<VesselType, [number, number, number]> = {
  cargo: [0, 180, 255],
  tanker: [255, 140, 0],
  fishing: [50, 220, 100],
  naval: [180, 40, 255],
  passenger: [0, 210, 210],
};

const VESSEL_BASE_SPEEDS: Record<VesselType, number> = {
  cargo: 14,
  tanker: 12,
  fishing: 10,
  naval: 22,
  passenger: 20,
};

const VESSEL_RADII: Record<VesselType, number> = {
  cargo: 8,
  tanker: 9,
  fishing: 6,
  naval: 7,
  passenger: 8,
};

// ---------------------------------------------------------------------------
// Seeded PRNG (mulberry32)
// ---------------------------------------------------------------------------
function createRng(seed: number): () => number {
  let s = seed;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// MMSI generation
// ---------------------------------------------------------------------------
function generateMmsi(rng: () => number, mid: number): string {
  const midStr = mid.toString().padStart(3, '0');
  let mmsi = midStr;
  for (let i = 0; i < 6; i++) {
    mmsi += Math.floor(rng() * 10).toString();
  }
  return mmsi;
}

// ---------------------------------------------------------------------------
// Lane position generation
// ---------------------------------------------------------------------------
function randomInLane(lane: Lane, rng: () => number): [number, number] {
  const [minLng, maxLng, minLat, maxLat] = lane.bounds;
  return [
    minLng + rng() * (maxLng - minLng),
    minLat + rng() * (maxLat - minLat),
  ];
}

function randomHeading(
  base: number,
  jitter: number,
  rng: () => number,
): number {
  return (base + (rng() - 0.5) * jitter + 360) % 360;
}

// ---------------------------------------------------------------------------
// Build a short vessel track (Catmull-Rom interpolated)
// ---------------------------------------------------------------------------
function buildTrack(
  startLng: number,
  startLat: number,
  headingDeg: number,
  speedKnots: number,
  rng: () => number,
): [number, number][] {
  // Length proportional to speed (faster = longer visible trail)
  const trackNm = 40 + speedKnots * 4 + rng() * 30;
  const numWaypoints = 5 + Math.floor(rng() * 4); // 5-8 waypoints before interpolation

  // Start with the current position
  const waypoints: [number, number][] = [[startLng, startLat]];

  let curLng = startLng;
  let curLat = startLat;
  let curHeading = headingDeg;

  for (let i = 0; i < numWaypoints - 1; i++) {
    // Each leg: ~trackNm/numWaypoints nautical miles
    const legNm = trackNm / numWaypoints;
    const latDeg = legNm / 60;
    const lngDeg = latDeg / Math.cos(toRad(curLat));

    // Slight heading change per leg
    curHeading = randomHeading(curHeading, 8, rng);
    const hRad = toRad(curHeading);

    curLng += lngDeg * Math.sin(hRad);
    curLat += latDeg * Math.cos(hRad);

    // Clamp to lane (simple)
    const lane = LANES.find(
      (l) =>
        curLng >= l.bounds[0] - 5 &&
        curLng <= l.bounds[1] + 5 &&
        curLat >= l.bounds[2] - 5 &&
        curLat <= l.bounds[3] + 5,
    );
    if (lane) {
      curLng = Math.max(lane.bounds[0], Math.min(lane.bounds[1], curLng));
      curLat = Math.max(lane.bounds[2], Math.min(lane.bounds[3], curLat));
    }

    waypoints.push([curLng, curLat]);
  }

  // Interpolate to 30-60 points
  const totalPoints = 30 + Math.floor(rng() * 31);
  return interpolateTrack(waypoints, totalPoints);
}

// ---------------------------------------------------------------------------
// Generate the full fleet
// ---------------------------------------------------------------------------
const TOTAL_VESSELS = 250;
const DARK_RATIO = 0.08;

function generateFleet(): Vessel[] {
  const rng = createRng(0xdeadbeef);
  const vessels: Vessel[] = [];
  let id = 0;

  for (const lane of LANES) {
    const count = Math.round(TOTAL_VESSELS * lane.density);
    for (let i = 0; i < count; i++) {
      id++;
      const [lng, lat] = randomInLane(lane, rng);
      const heading = randomHeading(lane.heading, 40, rng);
      const [minSpeed, maxSpeed] = lane.speedRange;
      const speedKnots = Math.round(minSpeed + rng() * (maxSpeed - minSpeed));

      const isDark = rng() < DARK_RATIO;

      // Pick type — dark vessels are more likely to be tankers or cargo
      const roll = rng();
      let type: VesselType;
      if (isDark) {
        type = roll < 0.6 ? 'tanker' : roll < 0.8 ? 'cargo' : 'naval';
      } else {
        type =
          roll < 0.45
            ? 'cargo'
            : roll < 0.65
              ? 'tanker'
              : roll < 0.8
                ? 'passenger'
                : roll < 0.92
                  ? 'fishing'
                  : 'naval';
      }

      // Pick flag — dark vessels prefer "opaque" flags
      const flagIdx = isDark
        ? Math.floor(rng() * 5)
        : Math.floor(rng() * FLAGS.length);
      const { country, mid } = FLAGS[flagIdx]!;
      const mmsi = generateMmsi(rng, mid);

      const namePrefix =
        type === 'cargo'
          ? 'MV'
          : type === 'tanker'
            ? 'MT'
            : type === 'fishing'
              ? 'FV'
              : type === 'naval'
                ? rng() < 0.5
                  ? 'USS'
                  : 'HMS'
                : 'MS';

      const nameSuffix = [
        'Aquila',
        'Horizon',
        'Atlas',
        'Meridian',
        'Pioneer',
        'Sentinel',
        'Venture',
        'Navigator',
        ' Endeavour',
        'Discovery',
        'Voyager',
        'Pacific',
        'Atlantic',
        'Arctic',
        'Aurora',
        'Phoenix',
        'Falcon',
        'Eagle',
        'Condor',
        'Titan',
        'Hercules',
        'Odyssey',
        'Explorer',
        'Quest',
        'Gladiator',
        'Stellar',
        'Cosmos',
        'Orion',
        'Neptune',
        'Triton',
        'Poseidon',
        'Admiral',
        'Commander',
        'Guardian',
        'Patriot',
        'Liberty',
        'Victory',
        'Courage',
        'Strength',
        'Unity',
        'Frontier',
        'Frontier',
        'Expedition',
      ];
      const name = `${namePrefix} ${nameSuffix[Math.floor(rng() * nameSuffix.length)]}`;

      const track = buildTrack(lng, lat, heading, speedKnots, rng);

      vessels.push({
        id: `vessel-${id}`,
        mmsi,
        name,
        type,
        flag: country,
        lng,
        lat,
        heading,
        speedKnots,
        dark: isDark,
        color: VESSEL_COLORS[type],
        track,
      });
    }
  }

  // Trim to exactly 250
  return vessels.slice(0, TOTAL_VESSELS);
}

const ALL_VESSELS: Vessel[] = generateFleet();

// ---------------------------------------------------------------------------
// Animation constants
// ---------------------------------------------------------------------------
const TRACK_POINTS = 50; // canonical track length used for time normalization
const BASE_LOOP_SECONDS = 120;

function buildTripData(vessels: Vessel[]): TripDatum[] {
  return vessels.map((v) => {
    const path = v.track;
    // Normalize every vessel's timestamps onto the SAME 0..TRACK_POINTS span,
    // regardless of its variable point count (30-60). Without this, the single
    // shared loopedTime overshoots short tracks (trail vanishes) and undershoots
    // long ones (partial trail) — the cause of the glitchy out-of-sync trails.
    const lastIdx = Math.max(path.length - 1, 1);
    const timestamps = path.map((_, i) => (i / lastIdx) * TRACK_POINTS);
    return { vesselId: v.id, path, timestamps };
  });
}

const ALL_TRIPS: TripDatum[] = buildTripData(ALL_VESSELS);

// ---------------------------------------------------------------------------
// Composable
// ---------------------------------------------------------------------------
export function useMaritimeAis() {
  const vessels = ref<Vessel[]>([...ALL_VESSELS]);
  const tripData = ref<TripDatum[]>([...ALL_TRIPS]);

  const activeVesselTypes = ref<Set<VesselType>>(
    new Set([
      'cargo',
      'tanker',
      'fishing',
      'naval',
      'passenger',
    ] as VesselType[]),
  );

  const highlightDarkOnly = ref(false);

  const currentTime = ref(0);
  const isPlaying = ref(false);
  const speed = ref(1);

  let animationFrame: number | null = null;
  let lastTimestamp = 0;

  // ── Computed: filtered vessels ──────────────────────────────────────────
  const filteredVessels = computed(() => {
    return vessels.value.filter((v) => {
      if (!activeVesselTypes.value.has(v.type)) return false;
      if (highlightDarkOnly.value && !v.dark) return false;
      return true;
    });
  });

  const filteredTripData = computed(() => {
    const ids = new Set(filteredVessels.value.map((v) => v.id));
    return tripData.value.filter((t) => ids.has(t.vesselId));
  });

  // ── Computed: vessel positions ───────────────────────────────────────────
  function getVesselPositionAtTime(
    vessel: Vessel,
    time: number,
  ): { lng: number; lat: number; heading: number } {
    const path = vessel.track;
    if (path.length < 2)
      return { lng: vessel.lng, lat: vessel.lat, heading: vessel.heading };

    const maxIdx = path.length - 1;
    // Map the shared 0..TRACK_POINTS loop onto this vessel's variable-length
    // path so the dot rides exactly on its trail head (both share one period).
    const t = ((time % TRACK_POINTS) / TRACK_POINTS) * maxIdx;
    const idx = Math.floor(t);
    const frac = t - idx;

    const pt = path[idx]!;
    const nextIdx = Math.min(idx + 1, maxIdx);
    const next = path[nextIdx]!;

    const lng = pt[0] + (next[0] - pt[0]) * frac;
    const lat = pt[1] + (next[1] - pt[1]) * frac;

    // Approximate heading from direction
    const dLng = next[0] - pt[0];
    const dLat = next[1] - pt[1];
    const heading = (Math.atan2(dLng, dLat) * RAD_TO_DEG + 360) % 360;

    return { lng, lat, heading };
  }

  const positions = computed<Record<string, VesselPosition>>(() => {
    const time = currentTime.value;
    const result: Record<string, VesselPosition> = {};
    for (const v of filteredVessels.value) {
      const pos = getVesselPositionAtTime(v, time);
      const speedVariation =
        2 * Math.sin(time * 0.05 + v.id.charCodeAt(v.id.length - 1));
      result[v.id] = {
        lng: pos.lng,
        lat: pos.lat,
        heading: pos.heading,
        speedKnots: Math.round(v.speedKnots + speedVariation),
      };
    }
    return result;
  });

  const loopedTime = computed(() => currentTime.value % TRACK_POINTS);

  // ── Stats ───────────────────────────────────────────────────────────────
  const stats = computed<MaritimeAisStats>(() => {
    const filtered = filteredVessels.value;
    const total = filtered.length;
    const dark = filtered.filter((v) => v.dark).length;
    const naval = filtered.filter((v) => v.type === 'naval').length;
    const avgSpeed =
      total > 0
        ? Math.round(filtered.reduce((sum, v) => sum + v.speedKnots, 0) / total)
        : 0;
    return { totalTracked: total, darkVessels: dark, naval, avgSpeed };
  });

  // ── Controls ────────────────────────────────────────────────────────────
  function toggleVesselType(type: VesselType): void {
    const next = new Set(activeVesselTypes.value);
    if (next.has(type)) {
      next.delete(type);
    } else {
      next.add(type);
    }
    activeVesselTypes.value = next;
  }

  function animate(timestamp: number): void {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const delta = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    if (isPlaying.value) {
      const increment =
        (delta * speed.value * TRACK_POINTS) / BASE_LOOP_SECONDS;
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
    vessels: filteredVessels,
    allVessels: vessels,
    positions,
    tripData: filteredTripData,
    activeVesselTypes,
    highlightDarkOnly,
    stats,
    loopedTime,
    isPlaying,
    speed,
    toggleVesselType,
    play,
    pause,
    reset,
    cleanup,
    VESSEL_COLORS,
    VESSEL_BASE_SPEEDS,
    VESSEL_RADII,
  };
}
