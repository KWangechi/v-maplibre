import type {
  RadarTier,
  AltitudeLayer,
  RadarSite,
  RadarTierConfig,
  CoveragePolygon,
  SweepLineDatum,
  SiteDatum,
  SiteLabelDatum,
  AirDefenseStats,
} from '~/types/defense-air-defense';

const EARTH_RADIUS = 6371000;
const COVERAGE_POINTS = 64;

const TIER_CONFIGS: RadarTierConfig[] = [
  {
    tier: 'shorad',
    label: 'SHORAD',
    icon: 'lucide:shield',
    range: 15,
    color: [0, 200, 255],
    altitudes: ['low'],
  },
  {
    tier: 'mrsam',
    label: 'MRSAM',
    icon: 'lucide:shield-half',
    range: 70,
    color: [0, 200, 100],
    altitudes: ['low', 'mid'],
  },
  {
    tier: 'lrsam',
    label: 'LRSAM',
    icon: 'lucide:shield-check',
    range: 250,
    color: [255, 165, 0],
    altitudes: ['low', 'mid', 'high'],
  },
];

const INITIAL_SITES: RadarSite[] = [
  {
    id: 'SHORAD-1',
    label: 'SHORAD-1',
    position: [70.8, 26.95],
    tier: 'shorad',
    range: 15,
    color: [0, 200, 255],
  },
  {
    id: 'SHORAD-2',
    label: 'SHORAD-2',
    position: [71.05, 26.85],
    tier: 'shorad',
    range: 15,
    color: [0, 200, 255],
  },
  {
    id: 'MRSAM-1',
    label: 'MRSAM-1',
    position: [70.7, 26.8],
    tier: 'mrsam',
    range: 70,
    color: [0, 200, 100],
  },
  {
    id: 'MRSAM-2',
    label: 'MRSAM-2',
    position: [71.1, 27.0],
    tier: 'mrsam',
    range: 70,
    color: [0, 200, 100],
  },
  {
    id: 'LRSAM-1',
    label: 'LRSAM-1',
    position: [70.9, 26.9],
    tier: 'lrsam',
    range: 250,
    color: [255, 165, 0],
  },
  {
    id: 'LRSAM-2',
    label: 'LRSAM-2',
    position: [71.0, 26.7],
    tier: 'lrsam',
    range: 250,
    color: [255, 165, 0],
  },
];

function destinationPoint(
  origin: [number, number],
  distanceMeters: number,
  bearingDeg: number,
): [number, number] {
  const lat1 = (origin[1] * Math.PI) / 180;
  const lon1 = (origin[0] * Math.PI) / 180;
  const brng = (bearingDeg * Math.PI) / 180;
  const d = distanceMeters / EARTH_RADIUS;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(d) +
      Math.cos(lat1) * Math.sin(d) * Math.cos(brng),
  );
  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(brng) * Math.sin(d) * Math.cos(lat1),
      Math.cos(d) - Math.sin(lat1) * Math.sin(lat2),
    );

  return [(lon2 * 180) / Math.PI, (lat2 * 180) / Math.PI];
}

function generateCoverageCircle(
  center: [number, number],
  radiusKm: number,
): [number, number][] {
  const polygon: [number, number][] = [];
  const radiusMeters = radiusKm * 1000;

  for (let i = 0; i <= COVERAGE_POINTS; i++) {
    const angle = (360 * i) / COVERAGE_POINTS;
    polygon.push(destinationPoint(center, radiusMeters, angle));
  }

  return polygon;
}

function getTierConfig(tier: RadarTier): RadarTierConfig {
  return TIER_CONFIGS.find((c) => c.tier === tier) ?? TIER_CONFIGS[0]!;
}

function tierCoversAltitude(tier: RadarTier, altitude: AltitudeLayer): boolean {
  const config = getTierConfig(tier);
  return config.altitudes.includes(altitude);
}

function computeCoverageAreaKm2(sites: RadarSite[]): number {
  let totalArea = 0;
  for (const site of sites) {
    totalArea += Math.PI * site.range * site.range;
  }
  return Math.round(totalArea);
}

function computeGapCount(
  sites: RadarSite[],
  activeTiers: Set<RadarTier>,
): number {
  const filtered = sites.filter((s) => activeTiers.has(s.tier));
  if (filtered.length <= 1) return filtered.length === 0 ? 1 : 0;

  let gaps = 0;
  for (let i = 0; i < filtered.length; i++) {
    let hasOverlap = false;
    for (let j = 0; j < filtered.length; j++) {
      if (i === j) continue;
      const a = filtered[i]!;
      const b = filtered[j]!;
      const dx =
        (a.position[0] - b.position[0]) *
        111 *
        Math.cos((a.position[1] * Math.PI) / 180);
      const dy = (a.position[1] - b.position[1]) * 111;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < a.range + b.range) {
        hasOverlap = true;
        break;
      }
    }
    if (!hasOverlap) gaps++;
  }
  return gaps;
}

export function useAirDefense() {
  const sites = ref<RadarSite[]>(structuredClone(INITIAL_SITES));
  const activeAltitude = ref<AltitudeLayer | 'all'>('all');
  const activeTiers = ref<Set<RadarTier>>(
    new Set(['shorad', 'mrsam', 'lrsam']),
  );
  const sweepAngle = ref(0);
  const sweepSpeed = ref<number[]>([1]);

  let animationFrame: number | null = null;

  const filteredSites = computed(() => {
    return sites.value.filter((site) => {
      if (!activeTiers.value.has(site.tier)) return false;
      if (activeAltitude.value === 'all') return true;
      return tierCoversAltitude(site.tier, activeAltitude.value);
    });
  });

  const coveragePolygons = computed<CoveragePolygon[]>(() =>
    filteredSites.value.map((site) => {
      const config = getTierConfig(site.tier);
      const opacityMap: Record<RadarTier, number> = {
        shorad: 60,
        mrsam: 40,
        lrsam: 25,
      };
      return {
        siteId: site.id,
        tier: site.tier,
        polygon: generateCoverageCircle(site.position, site.range),
        color: [
          config.color[0],
          config.color[1],
          config.color[2],
          opacityMap[site.tier],
        ] as [number, number, number, number],
      };
    }),
  );

  const sweepLines = computed<SweepLineDatum[]>(() =>
    filteredSites.value.map((site) => {
      const endPoint = destinationPoint(
        site.position,
        site.range * 1000,
        sweepAngle.value,
      );
      const config = getTierConfig(site.tier);
      return {
        siteId: site.id,
        sourcePosition: site.position,
        targetPosition: endPoint,
        color: [config.color[0], config.color[1], config.color[2], 180] as [
          number,
          number,
          number,
          number,
        ],
      };
    }),
  );

  const siteData = computed<SiteDatum[]>(() =>
    filteredSites.value.map((site) => ({
      lng: site.position[0],
      lat: site.position[1],
      siteId: site.id,
      color: site.color,
      tier: site.tier,
    })),
  );

  const labelData = computed<SiteLabelDatum[]>(() =>
    filteredSites.value.map((site) => ({
      position: site.position,
      text: site.label,
    })),
  );

  const stats = computed<AirDefenseStats>(() => {
    const filtered = filteredSites.value;
    return {
      totalSites: filtered.length,
      activeTiers: activeTiers.value.size,
      coverageAreaKm2: computeCoverageAreaKm2(filtered),
      gapCount: computeGapCount(sites.value, activeTiers.value),
    };
  });

  function setAltitude(altitude: AltitudeLayer | 'all'): void {
    activeAltitude.value = altitude;
  }

  function toggleTier(tier: RadarTier): void {
    const next = new Set(activeTiers.value);
    if (next.has(tier)) {
      next.delete(tier);
    } else {
      next.add(tier);
    }
    activeTiers.value = next;
  }

  function startSweep(): void {
    if (animationFrame !== null) return;
    let lastTime: number | null = null;

    function tick(timestamp: number): void {
      if (!lastTime) lastTime = timestamp;
      const delta = (timestamp - lastTime) / 1000;
      lastTime = timestamp;
      sweepAngle.value =
        (sweepAngle.value + delta * 30 * (sweepSpeed.value[0] ?? 1)) % 360;
      animationFrame = requestAnimationFrame(tick);
    }

    animationFrame = requestAnimationFrame(tick);
  }

  function cleanup(): void {
    if (animationFrame !== null) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
  }

  return {
    sites: filteredSites,
    allSites: sites,
    coveragePolygons,
    sweepLines,
    siteData,
    labelData,
    sweepAngle,
    sweepSpeed,
    activeAltitude,
    activeTiers,
    stats,
    tierConfigs: TIER_CONFIGS,
    setAltitude,
    toggleTier,
    startSweep,
    cleanup,
  };
}
