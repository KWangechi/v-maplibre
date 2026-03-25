import type {
  ConvoyUnit,
  ConvoyRoute,
  ConvoyCheckpoint,
  ConvoyDetails,
  ConvoyRouteResponse,
} from '~/types/defense-convoy';

const BASE_LOOP_SECONDS = 90;

const CONVOYS: ConvoyUnit[] = [
  {
    id: 'supply-1',
    callsign: 'SUPPLY-1',
    cargoType: 'ammo',
    vehicleCount: 12,
    status: 'en-route',
    color: [255, 165, 0],
  },
  {
    id: 'supply-2',
    callsign: 'SUPPLY-2',
    cargoType: 'fuel',
    vehicleCount: 8,
    status: 'en-route',
    color: [0, 180, 255],
  },
  {
    id: 'medevac-1',
    callsign: 'MEDEVAC-1',
    cargoType: 'medical',
    vehicleCount: 5,
    status: 'en-route',
    color: [255, 60, 60],
  },
];

function formatEta(minutesRemaining: number): string {
  if (minutesRemaining <= 0) return 'Arrived';
  const h = Math.floor(minutesRemaining / 60);
  const m = Math.round(minutesRemaining % 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function useConvoyTracker() {
  const convoys = ref<ConvoyUnit[]>([...CONVOYS]);
  const routes = ref<ConvoyRoute[]>([]);
  const checkpoints = ref<ConvoyCheckpoint[]>([]);
  const isLoading = ref(true);
  const routeDistances = ref<Record<string, number>>({});

  const currentTime = ref(0);
  const isPlaying = ref(false);
  const speed = ref(1);
  const selectedConvoyId = ref<string | null>('supply-1');

  let animationFrame: number | null = null;
  let lastTimestamp = 0;

  const maxArcPoints = computed(() => {
    if (routes.value.length === 0) return 1;
    return Math.max(...routes.value.map((r) => r.path.length));
  });

  const selectedConvoy = computed(
    () => convoys.value.find((c) => c.id === selectedConvoyId.value) ?? null,
  );

  function getConvoyPosition(
    convoyId: string,
  ): { lng: number; lat: number } | null {
    const route = routes.value.find((r) => r.convoyId === convoyId);
    if (!route || route.path.length < 2) return null;

    const maxIdx = route.path.length - 1;
    const t = Math.min(currentTime.value, maxIdx);
    const idx = Math.floor(t);
    const frac = t - idx;

    if (idx >= maxIdx) {
      return { lng: route.path[maxIdx]![0], lat: route.path[maxIdx]![1] };
    }

    const pt = route.path[idx]!;
    const next = route.path[idx + 1]!;
    return {
      lng: pt[0] + (next[0] - pt[0]) * frac,
      lat: pt[1] + (next[1] - pt[1]) * frac,
    };
  }

  const positions = computed<Record<string, { lng: number; lat: number }>>(
    () => {
      const result: Record<string, { lng: number; lat: number }> = {};
      for (const convoy of convoys.value) {
        const pos = getConvoyPosition(convoy.id);
        if (pos) result[convoy.id] = pos;
      }
      return result;
    },
  );

  const loopedTime = computed(() =>
    Math.min(currentTime.value, maxArcPoints.value - 1),
  );

  const activeCheckpoints = computed<ConvoyCheckpoint[]>(() => {
    const t = currentTime.value;
    return checkpoints.value.map((cp) => {
      const route = routes.value.find((r) => r.convoyId === cp.convoyId);
      if (!route) return cp;

      const cpIdx = route.path.findIndex(
        (p) =>
          Math.abs(p[0] - cp.position[0]) < 0.001 &&
          Math.abs(p[1] - cp.position[1]) < 0.001,
      );
      if (cpIdx < 0) return cp;

      let status: ConvoyCheckpoint['status'] = 'pending';
      if (t >= cpIdx + 5) {
        status = 'cleared';
      } else if (t >= cpIdx - 30) {
        status = 'next';
      }
      return { ...cp, status };
    });
  });

  const selectedDetails = computed<ConvoyDetails | null>(() => {
    if (!selectedConvoy.value) return null;
    const convoy = selectedConvoy.value;
    const route = routes.value.find((r) => r.convoyId === convoy.id);
    if (!route) return null;

    const routeLen = route.path.length - 1;
    const progress = Math.min(currentTime.value / routeLen, 1);
    const remainingFraction = 1 - progress;
    const distKm = routeDistances.value[convoy.id] ?? 250;
    const totalMinutes = (distKm / 60) * 60;
    const minutesRemaining = totalMinutes * remainingFraction;

    const convoyCheckpoints = activeCheckpoints.value.filter(
      (cp) => cp.convoyId === convoy.id,
    );
    const nextCp = convoyCheckpoints.find((cp) => cp.status === 'next');
    const nextCheckpointName =
      nextCp?.label ??
      convoyCheckpoints[convoyCheckpoints.length - 1]?.label ??
      'N/A';

    return {
      unit: convoy,
      eta: formatEta(minutesRemaining),
      nextCheckpoint: nextCheckpointName,
      distanceRemaining: Math.round(remainingFraction * distKm),
      progress: Math.round(progress * 100),
    };
  });

  async function initRoutes(): Promise<void> {
    isLoading.value = true;
    try {
      const data = await $fetch<ConvoyRouteResponse[]>('/api/convoy-routes');
      const fetchedRoutes: ConvoyRoute[] = [];
      const fetchedCheckpoints: ConvoyCheckpoint[] = [];
      const distances: Record<string, number> = {};

      for (const item of data) {
        fetchedRoutes.push({
          convoyId: item.convoyId,
          path: item.path,
          timestamps: item.timestamps,
        });
        distances[item.convoyId] = item.distanceKm;

        for (const cp of item.checkpoints) {
          fetchedCheckpoints.push({
            id: `cp-${item.convoyId}-${cp.label}`,
            convoyId: item.convoyId,
            label: cp.label,
            position: cp.position,
            status: 'pending',
          });
        }
      }

      routes.value = fetchedRoutes;
      checkpoints.value = fetchedCheckpoints;
      routeDistances.value = distances;
    } catch (err) {
      console.error('[convoy-tracker] Failed to fetch routes:', err);
    } finally {
      isLoading.value = false;
    }
  }

  function animate(timestamp: number): void {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const delta = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    if (isPlaying.value) {
      const max = maxArcPoints.value - 1;
      const increment = (delta * speed.value * max) / BASE_LOOP_SECONDS;
      currentTime.value = Math.min(currentTime.value + increment, max);
    }

    animationFrame = requestAnimationFrame(animate);
  }

  function play(): void {
    if (currentTime.value >= maxArcPoints.value - 2) {
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
    lastTimestamp = 0;
  }

  function setSpeed(newSpeed: number): void {
    speed.value = newSpeed;
  }

  function selectConvoy(convoyId: string | null): void {
    selectedConvoyId.value = convoyId;
  }

  function cleanup(): void {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
  }

  initRoutes();

  return {
    convoys,
    routes,
    positions,
    activeCheckpoints,
    loopedTime,
    currentTime,
    isPlaying,
    isLoading,
    speed,
    selectedConvoyId,
    selectedConvoy,
    selectedDetails,
    play,
    pause,
    resetAnimation,
    setSpeed,
    selectConvoy,
    cleanup,
  };
}
