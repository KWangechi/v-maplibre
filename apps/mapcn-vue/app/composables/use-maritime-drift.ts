import type {
  DriftMode,
  DriftParams,
  DriftStats,
  ParticleDatum,
  ParticlePositionDatum,
  ProbabilityHullDatum,
  TripDatum,
  VectorDatum,
} from '~/types/maritime-drift';

const DEG_TO_RAD = Math.PI / 180;
const EARTH_RADIUS_KM = 6371;

/** Default datum: Arabian Sea, ~72.0°E, 15.0°N */
const DEFAULT_DATUM_LNG = 72.0;
const DEFAULT_DATUM_LAT = 15.0;

function toRad(deg: number): number {
  return deg * DEG_TO_RAD;
}

/** Seeded LCG pseudo-RNG for deterministic results every load */
function createSeededRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

/** Box-Muller: generates Gaussian noise with mean 0, std 1 */
function boxMuller(rng: () => number): number {
  const u1 = Math.max(rng(), 1e-10);
  const u2 = rng();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

/** Convert speed in knots + bearing in degrees to [dLng, dLat] per hour */
function velocityComponents(
  speedKn: number,
  bearingDeg: number,
): [number, number] {
  // 1 knot = 1 nautical mile/hour ≈ 1.852 km/h
  // 1 degree lat ≈ 111.32 km; 1 degree lng ≈ 111.32 * cos(lat) km
  const speedKmH = speedKn * 1.852;
  const bearingRad = toRad(bearingDeg);
  // dLat (degrees north) = speed * cos(bearing) / 111.32
  const dLatDeg = (speedKmH * Math.cos(bearingRad)) / 111.32;
  // dLng (degrees east) = speed * sin(bearing) / (111.32 * cos(lat))
  const cosLat = Math.cos(toRad(DEFAULT_DATUM_LAT));
  const dLngDeg = (speedKmH * Math.sin(bearingRad)) / (111.32 * cosLat);
  return [dLngDeg, dLatDeg];
}

/**
 * Gift-wrapping (Jarvis march) convex hull.
 * Returns the polygon in CCW order.
 */
function convexHull(points: [number, number][]): [number, number][] {
  if (points.length < 3) return [...points];

  const n = points.length;
  const hull: [number, number][] = [];

  // Find leftmost point
  let leftIdx = 0;
  for (let i = 1; i < n; i++) {
    if (points[i]![0] < points[leftIdx]![0]) leftIdx = i;
  }

  let current = leftIdx;
  do {
    hull.push(points[current]!);
    let next = 0;
    for (let i = 1; i < n; i++) {
      if (next === current) {
        next = i;
        continue;
      }
      const cross = crossProduct(points[current]!, points[next]!, points[i]!);
      if (cross < 0) next = i; // Counter-clockwise turn
    }
    current = next;
  } while (current !== leftIdx && hull.length < n);

  return hull;
}

function crossProduct(
  o: [number, number],
  a: [number, number],
  b: [number, number],
): number {
  return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
}

/** Great-circle distance in km between two [lng, lat] points */
function haversineKm(
  lng1: number,
  lat1: number,
  lng2: number,
  lat2: number,
): number {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.asin(Math.sqrt(a));
}

/** Approximate polygon area via shoelace formula (works for small patches) */
function polygonAreaKm2(polygon: [number, number][]): number {
  if (polygon.length < 3) return 0;
  const refLat = polygon.reduce((s, p) => s + p[1], 0) / polygon.length;
  const mPerDegLat = 111_320;
  const mPerDegLng = 111_320 * Math.cos(toRad(refLat));
  let area = 0;
  for (let i = 0; i < polygon.length; i++) {
    const j = (i + 1) % polygon.length;
    area +=
      polygon[i]![0] * mPerDegLng * polygon[j]![1] * mPerDegLat -
      polygon[j]![0] * mPerDegLng * polygon[i]![1] * mPerDegLat;
  }
  return Math.abs(area / 2) / 1_000_000;
}

/** Run one Monte-Carlo particle simulation */
function simulateParticle(
  rng: () => number,
  params: DriftParams,
  datumLng: number,
  datumLat: number,
): ParticleDatum {
  const [currDLng, currDLat] = velocityComponents(
    params.currentSpeedKn,
    params.currentBearingDeg,
  );
  const [windDLng, windDLat] = velocityComponents(
    params.windSpeedKn * 0.03, // wind drift is ~3% of wind speed
    params.windBearingDeg,
  );
  const turbScale = 0.005; // degrees per sqrt(hour) — tuned for visual spread

  const timesteps = Math.ceil(params.durationHours);
  let lng = datumLng;
  let lat = datumLat;
  const path: [number, number][] = [[lng, lat]];

  for (let t = 1; t <= timesteps; t++) {
    const dt = 1; // 1 hour per step
    const turbLng = boxMuller(rng) * turbScale * Math.sqrt(dt);
    const turbLat = boxMuller(rng) * turbScale * Math.sqrt(dt);
    lng += (currDLng + windDLng) * dt + turbLng;
    lat += (currDLat + windDLat) * dt + turbLat;
    path.push([lng, lat]);
  }

  return {
    id: 0,
    path,
    finalLng: lng,
    finalLat: lat,
  };
}

export function useMaritimeDrift() {
  // --- State ---
  const mode = ref<DriftMode>('sar');
  const particleCount = ref(600);
  const currentSpeedKn = ref(2);
  const currentBearingDeg = ref(90); // East
  const windSpeedKn = ref(15);
  const windBearingDeg = ref(45); // NE
  const durationHours = ref(24);

  const isPlaying = ref(false);
  const currentTime = ref(0); // 0..1 normalized
  const showHeatmap = ref(false);

  const datumLng = DEFAULT_DATUM_LNG;
  const datumLat = DEFAULT_DATUM_LAT;

  let rafId: number | null = null;
  let lastTs = 0;
  const PLAY_DURATION_S = 8; // one full simulation plays in 8 seconds

  // --- Simulation results (recomputed on param change) ---
  const particles = ref<ParticleDatum[]>([]);
  const probabilityHull = ref<ProbabilityHullDatum>({ polygon: [] });

  function runSimulation(): void {
    const rng = createSeededRng(mode.value === 'sar' ? 0x5a52 : 0x5091);
    const params: DriftParams = {
      mode: mode.value,
      particleCount: particleCount.value,
      currentSpeedKn: currentSpeedKn.value,
      currentBearingDeg: currentBearingDeg.value,
      windSpeedKn: windSpeedKn.value,
      windBearingDeg: windBearingDeg.value,
      durationHours: durationHours.value,
    };

    const results: ParticleDatum[] = [];
    for (let i = 0; i < params.particleCount; i++) {
      const p = simulateParticle(rng, params, datumLng, datumLat);
      p.id = i;
      results.push(p);
    }
    particles.value = results;

    // Convex hull of final positions
    const finals: [number, number][] = results.map((p) => [
      p.finalLng,
      p.finalLat,
    ]);
    const hull = convexHull(finals);
    // Close the polygon
    if (
      hull.length > 0 &&
      (hull[0]![0] !== hull[hull.length - 1]![0] ||
        hull[0]![1] !== hull[hull.length - 1]![1])
    ) {
      hull.push(hull[0]!);
    }
    probabilityHull.value = { polygon: hull };
  }

  // Re-run when parameters change (debounced by not debouncing — immediate recompute)
  watch(
    [
      mode,
      particleCount,
      currentSpeedKn,
      currentBearingDeg,
      windSpeedKn,
      windBearingDeg,
      durationHours,
    ],
    () => runSimulation(),
    { immediate: true },
  );

  // --- Accessors ---
  const modeColorSar: [number, number, number] = [255, 191, 0]; // amber
  const modeColorSpill: [number, number, number] = [30, 30, 30]; // near-black oil

  const particlePositionData = computed<ParticlePositionDatum[]>(() =>
    particles.value.map((p) => {
      const t = Math.min(
        Math.floor(currentTime.value * (p.path.length - 1)),
        p.path.length - 1,
      );
      const pos = p.path[t]!;
      return { lng: pos[0], lat: pos[1], id: p.id };
    }),
  );

  const tripData = computed<TripDatum[]>(() =>
    particles.value.map((p) => ({
      id: p.id,
      path: p.path,
      timestamps: p.path.map((_, i) => i),
    })),
  );

  const vectorData = computed<VectorDatum[]>(() => [
    {
      position: [datumLng, datumLat],
      angleDeg: currentBearingDeg.value,
      magnitude: currentSpeedKn.value,
      label: 'Current',
    },
    {
      position: [datumLng + 0.15, datumLat + 0.15],
      angleDeg: windBearingDeg.value,
      magnitude: windSpeedKn.value,
      label: 'Wind',
    },
  ]);

  const stats = computed<DriftStats>(() => {
    const hullPoly = probabilityHull.value.polygon;
    const area = hullPoly.length >= 3 ? polygonAreaKm2(hullPoly) : 0;

    // Drift distance: average distance of final positions from datum
    const avgDist =
      particles.value.length > 0
        ? particles.value.reduce(
            (s, p) =>
              s + haversineKm(datumLng, datumLat, p.finalLng, p.finalLat),
            0,
          ) / particles.value.length
        : 0;

    return {
      particleCount: particleCount.value,
      searchAreaKm2: Math.round(area),
      driftDistanceKm: Math.round(avgDist),
      elapsedHours: Math.round(currentTime.value * durationHours.value),
    };
  });

  // --- Animation ---
  function animate(ts: number): void {
    if (!lastTs) lastTs = ts;
    const delta = (ts - lastTs) / 1000;
    lastTs = ts;

    if (isPlaying.value) {
      currentTime.value = Math.min(
        currentTime.value + delta / PLAY_DURATION_S,
        1,
      );
      if (currentTime.value >= 1) {
        currentTime.value = 1;
        isPlaying.value = false;
      }
    }

    rafId = requestAnimationFrame(animate);
  }

  function play(): void {
    if (currentTime.value >= 1) currentTime.value = 0;
    isPlaying.value = true;
    lastTs = 0;
    if (!rafId) rafId = requestAnimationFrame(animate);
  }

  function pause(): void {
    isPlaying.value = false;
  }

  function reset(): void {
    isPlaying.value = false;
    currentTime.value = 0;
    lastTs = 0;
  }

  function cleanup(): void {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  return {
    // Params
    mode,
    particleCount,
    currentSpeedKn,
    currentBearingDeg,
    windSpeedKn,
    windBearingDeg,
    durationHours,
    showHeatmap,
    // State
    isPlaying,
    currentTime,
    // Data
    datumLng,
    datumLat,
    particles,
    probabilityHull,
    particlePositionData,
    tripData,
    vectorData,
    stats,
    modeColorSar,
    modeColorSpill,
    // Methods
    play,
    pause,
    reset,
    cleanup,
  };
}
