import type {
  Cable,
  CableSegment,
  EezZone,
  LandingPoint,
  CableStats,
} from '~/types/maritime-cables';

const CABLES: Cable[] = [
  {
    id: 'tata-tgn-atlantic',
    name: 'Tata TGN-Atlantic',
    color: [30, 180, 255],
    path: [
      [-70.0, 42.3],
      [-50.5, 46.2],
      [-35.0, 49.8],
      [-18.6, 53.2],
      [-5.6, 50.1],
      [0.1, 49.9],
    ],
    capacityTbps: 68,
    riskScore: 15,
    landingPoints: ['Boston', 'Halifax', 'London'],
  },
  {
    id: 'tata-tgn-eu-atlantic',
    name: 'Tata TGN-EA',
    color: [60, 200, 160],
    path: [
      [-70.0, 42.3],
      [-55.0, 39.0],
      [-40.0, 37.0],
      [-20.0, 34.5],
      [-8.0, 36.8],
      [-5.6, 50.1],
    ],
    capacityTbps: 64,
    riskScore: 20,
    landingPoints: ['Boston', 'Bermuda', 'Lisbon', 'London'],
  },
  {
    id: 'peac Mars',
    name: 'PEACE Mars',
    color: [80, 220, 130],
    path: [
      [-5.6, 50.1],
      [-9.5, 43.4],
      [-4.5, 38.0],
      [3.0, 36.8],
      [11.3, 33.3],
    ],
    capacityTbps: 240,
    riskScore: 75,
    landingPoints: ['London', 'Marseille', 'Barcelona', 'Alexandria'],
  },
  {
    id: 'sea-me-we-4',
    name: 'SEA-ME-WE 4',
    color: [130, 60, 240],
    path: [
      [72.8, 18.9],
      [63.5, 21.5],
      [56.5, 24.5],
      [45.5, 24.8],
      [36.8, 30.0],
      [29.9, 31.5],
      [29.9, 31.5],
      [29.5, 12.5],
      [34.0, 4.5],
      [43.5, -1.5],
      [50.5, 1.5],
      [55.2, 4.5],
      [72.8, 18.9],
    ],
    capacityTbps: 430,
    riskScore: 85,
    landingPoints: [
      'Mumbai',
      'Karachi',
      'Fujairah',
      'Djibouti',
      'Aden',
      ' Suez',
      'Alexandria',
      'Catania',
      'Barcelona',
      'Marseille',
    ],
  },
  {
    id: 'smw5-arc',
    name: 'SMW5 Arc',
    color: [255, 100, 180],
    path: [
      [103.8, 1.3],
      [104.5, 0.5],
      [108.0, -2.5],
      [115.0, -8.5],
      [125.0, -8.0],
      [130.0, -5.0],
      [135.0, -3.5],
      [138.5, 34.5],
      [139.7, 35.6],
    ],
    capacityTbps: 310,
    riskScore: 45,
    landingPoints: [
      'Singapore',
      'Jakarta',
      ' Makassar',
      'Manado',
      'Palan',
      'Davao',
      'Balikpapan',
      'Tokyo',
    ],
  },
  {
    id: 'jup cable',
    name: 'JUPITER',
    color: [100, 40, 220],
    path: [
      [139.7, 35.6],
      [138.0, 34.5],
      [135.0, 33.0],
      [130.0, 31.0],
      [122.0, 34.0],
      [121.5, 31.2],
    ],
    capacityTbps: 380,
    riskScore: 35,
    landingPoints: ['Tokyo', 'Osaka', 'Shanghai', 'Los Angeles'],
  },
  {
    id: 'pacific-crossing',
    name: 'PC-1',
    color: [0, 190, 255],
    path: [
      [-122.4, 37.8],
      [-155.0, 35.0],
      [-175.0, 25.0],
      [-165.0, 15.0],
      [-150.0, 5.0],
      [-140.0, 0.0],
      [-130.0, -5.0],
      [-122.4, 37.8],
    ],
    capacityTbps: 60,
    riskScore: 25,
    landingPoints: ['Los Angeles', 'Hawaii', 'Guam'],
  },
  {
    id: 'taiwan-strait-express',
    name: 'TSE-1',
    color: [255, 60, 60],
    path: [
      [121.5, 31.2],
      [120.5, 25.0],
      [119.5, 24.0],
      [118.5, 23.5],
      [117.5, 23.0],
      [116.5, 22.0],
      [115.5, 21.5],
      [114.5, 22.0],
      [113.5, 22.0],
    ],
    capacityTbps: 22,
    riskScore: 95,
    landingPoints: ['Shanghai', 'Taipei', 'Hong Kong'],
  },
  {
    id: 'flag-europe-asia',
    name: 'FLAG Europe-Asia',
    color: [200, 150, 255],
    path: [
      [-5.6, 50.1],
      [0.0, 38.0],
      [5.0, 35.0],
      [15.0, 32.0],
      [25.0, 31.0],
      [35.0, 30.0],
      [43.5, 13.0],
      [50.5, 1.5],
      [55.2, 4.5],
      [72.8, 18.9],
    ],
    capacityTbps: 54,
    riskScore: 65,
    landingPoints: [
      'London',
      'Barcelona',
      'Alexandria',
      'Jeddah',
      'Fujairah',
      'Mumbai',
    ],
  },
  {
    id: 'europe-india-gateway',
    name: 'EIG',
    color: [150, 80, 255],
    path: [
      [-5.6, 50.1],
      [-9.5, 43.4],
      [-4.5, 38.0],
      [10.0, 37.0],
      [18.5, 40.5],
      [26.0, 35.5],
      [43.5, 13.0],
    ],
    capacityTbps: 310,
    riskScore: 55,
    landingPoints: ['London', 'Barcelona', 'Catania', 'Djibouti', 'Mumbai'],
  },
  {
    id: 'africa-1',
    name: 'Africa 1',
    color: [255, 165, 40],
    path: [
      [72.8, 18.9],
      [56.5, 24.5],
      [43.5, 13.0],
      [40.0, -5.0],
      [39.5, -10.0],
      [40.5, -15.0],
      [43.5, -20.0],
    ],
    capacityTbps: 180,
    riskScore: 45,
    landingPoints: [
      'Mumbai',
      'Karachi',
      'Djibouti',
      'Mombasa',
      'Dar es Salaam',
    ],
  },
  {
    id: 'gulf-everg',
    name: 'Gulf EverG',
    color: [0, 200, 180],
    path: [
      [56.5, 24.5],
      [57.5, 22.5],
      [59.5, 20.5],
      [62.5, 17.5],
      [63.5, 21.5],
    ],
    capacityTbps: 80,
    riskScore: 70,
    landingPoints: ['Karachi', 'Muscat', 'Fujairah'],
  },
  {
    id: 'brics-cable',
    name: 'BRICS Cable',
    color: [255, 80, 80],
    path: [
      [72.8, 18.9],
      [63.5, 21.5],
      [55.2, 4.5],
      [43.5, -1.5],
      [18.5, -34.0],
      [28.0, -26.0],
    ],
    capacityTbps: 100,
    riskScore: 40,
    landingPoints: ['Mumbai', 'Fujairah', 'Djibouti', 'Cape Town', 'Fortaleza'],
  },
  {
    id: 'apx-east',
    name: 'APX-East',
    color: [0, 220, 140],
    path: [
      [103.8, 1.3],
      [108.0, -2.5],
      [115.0, -8.5],
      [125.0, -8.0],
      [135.0, -3.5],
      [145.0, 2.0],
      [151.5, -4.0],
      [151.5, -4.0],
    ],
    capacityTbps: 54,
    riskScore: 30,
    landingPoints: ['Singapore', 'Jakarta', ' Darwin', 'Sydney'],
  },
];

const LANDING_POINTS: LandingPoint[] = [
  { id: 'boston', name: 'Boston', position: [-70.9, 42.36], country: 'US' },
  { id: 'london', name: 'London', position: [-0.13, 51.51], country: 'UK' },
  { id: 'lisbon', name: 'Lisbon', position: [-9.14, 38.73], country: 'PT' },
  {
    id: 'barcelona',
    name: 'Barcelona',
    position: [2.17, 41.39],
    country: 'ES',
  },
  { id: 'marseille', name: 'Marseille', position: [5.37, 43.3], country: 'FR' },
  {
    id: 'alexandria',
    name: 'Alexandria',
    position: [29.92, 31.2],
    country: 'EG',
  },
  { id: 'suez', name: 'Suez', position: [32.55, 30.6], country: 'EG' },
  { id: 'mumbai', name: 'Mumbai', position: [72.88, 18.94], country: 'IN' },
  { id: 'karachi', name: 'Karachi', position: [67.01, 24.86], country: 'PK' },
  { id: 'fujairah', name: 'Fujairah', position: [56.33, 25.13], country: 'AE' },
  { id: 'djibouti', name: 'Djibouti', position: [43.15, 11.59], country: 'DJ' },
  { id: 'aden', name: 'Aden', position: [45.03, 12.8], country: 'YE' },
  {
    id: 'singapore',
    name: 'Singapore',
    position: [103.82, 1.26],
    country: 'SG',
  },
  { id: 'jakarta', name: 'Jakarta', position: [106.87, -6.21], country: 'ID' },
  { id: 'tokyo', name: 'Tokyo', position: [139.69, 35.69], country: 'JP' },
  {
    id: 'losangeles',
    name: 'Los Angeles',
    position: [-118.24, 34.05],
    country: 'US',
  },
  {
    id: 'hongkong',
    name: 'Hong Kong',
    position: [114.17, 22.32],
    country: 'CN',
  },
  { id: 'taipei', name: 'Taipei', position: [121.56, 25.03], country: 'TW' },
  {
    id: 'shanghai',
    name: 'Shanghai',
    position: [121.47, 31.23],
    country: 'CN',
  },
  { id: 'osaka', name: 'Osaka', position: [135.43, 34.69], country: 'JP' },
  { id: 'hawaii', name: 'Hawaii', position: [-157.85, 21.3], country: 'US' },
  { id: 'guam', name: 'Guam', position: [144.79, 13.44], country: 'GU' },
  { id: 'guam2', name: 'Darwin', position: [130.85, -12.46], country: 'AU' },
  { id: 'sydney', name: 'Sydney', position: [151.21, -33.87], country: 'AU' },
  { id: 'guam3', name: 'Davao', position: [125.73, 7.07], country: 'PH' },
  {
    id: 'makassar',
    name: 'Makassar',
    position: [119.42, -5.14],
    country: 'ID',
  },
  { id: 'muscat', name: 'Muscat', position: [58.59, 23.61], country: 'OM' },
  { id: 'jeddah', name: 'Jeddah', position: [39.17, 21.49], country: 'SA' },
  {
    id: 'fortaleza',
    name: 'Fortaleza',
    position: [-38.53, -3.72],
    country: 'BR',
  },
  {
    id: 'capetown',
    name: 'Cape Town',
    position: [18.42, -33.93],
    country: 'ZA',
  },
  { id: 'mombasa', name: 'Mombasa', position: [39.67, -4.05], country: 'KE' },
  {
    id: 'daressalaam',
    name: 'Dar es Salaam',
    position: [39.28, -6.82],
    country: 'TZ',
  },
];

const EEZ_ZONES: EezZone[] = [
  {
    id: 'eez-india',
    name: 'India EEZ',
    polygon: [
      [68.0, 19.5],
      [67.5, 17.0],
      [67.0, 15.0],
      [68.0, 12.0],
      [69.0, 9.0],
      [72.0, 8.0],
      [76.5, 8.5],
      [76.2, 9.9],
      [74.8, 12.9],
      [73.8, 15.4],
      [72.8, 18.9],
      [72.5, 20.0],
      [68.0, 19.5],
    ],
  },
  {
    id: 'eez-uk',
    name: 'UK Waters',
    polygon: [
      [-5.0, 50.5],
      [-4.0, 49.5],
      [-3.0, 49.0],
      [-2.0, 49.0],
      [-1.0, 49.5],
      [0.5, 51.0],
      [0.5, 52.0],
      [0.0, 53.0],
      [-2.0, 54.0],
      [-4.0, 54.5],
      [-5.0, 55.0],
      [-5.0, 50.5],
    ],
  },
  {
    id: 'eez-japan',
    name: 'Japan EEZ',
    polygon: [
      [128.0, 33.0],
      [130.0, 31.0],
      [133.0, 30.0],
      [136.0, 30.0],
      [140.0, 31.0],
      [142.0, 33.0],
      [145.0, 35.0],
      [145.0, 40.0],
      [141.0, 43.0],
      [138.0, 42.0],
      [135.0, 40.0],
      [130.0, 39.0],
      [128.0, 38.0],
      [128.0, 33.0],
    ],
  },
  {
    id: 'eez-egypt-redsea',
    name: 'Red Sea / Egypt',
    polygon: [
      [32.5, 31.5],
      [34.0, 30.0],
      [35.0, 29.0],
      [36.0, 28.0],
      [37.5, 27.0],
      [39.5, 25.5],
      [43.0, 23.0],
      [44.0, 22.0],
      [43.5, 20.0],
      [42.5, 15.0],
      [40.5, 13.5],
      [38.5, 14.0],
      [37.0, 18.0],
      [35.0, 22.0],
      [33.5, 25.0],
      [32.5, 28.0],
      [32.5, 31.5],
    ],
  },
  {
    id: 'eez-singapore',
    name: 'Singapore Strait',
    polygon: [
      [103.5, 1.0],
      [104.0, 1.0],
      [104.5, 1.5],
      [105.0, 1.5],
      [105.0, 0.5],
      [104.0, 0.0],
      [103.5, 1.0],
    ],
  },
  {
    id: 'eez-us-atlantic',
    name: 'US East Coast',
    polygon: [
      [-82.0, 24.0],
      [-80.0, 25.0],
      [-79.0, 31.0],
      [-78.0, 33.0],
      [-76.0, 35.0],
      [-75.0, 37.0],
      [-73.0, 39.0],
      [-72.0, 40.0],
      [-70.0, 41.0],
      [-70.0, 42.5],
      [-72.0, 43.0],
      [-75.0, 42.0],
      [-78.0, 40.0],
      [-80.0, 36.0],
      [-82.0, 32.0],
      [-82.0, 24.0],
    ],
  },
  {
    id: 'eez-gulf',
    name: 'Gulf of Oman / Strait of Hormuz',
    polygon: [
      [56.0, 24.0],
      [57.0, 22.0],
      [59.0, 21.0],
      [61.0, 21.5],
      [63.0, 22.5],
      [63.0, 24.0],
      [60.0, 25.5],
      [58.0, 25.0],
      [56.0, 24.0],
    ],
  },
];

const ARC_POINTS = 600;

function interpolateRoute(
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
    const i0 = seg;
    const i1 = Math.min(seg + 1, n);
    const lerp = (a: number, b: number, f: number) => a + (b - a) * f;
    result.push([
      lerp(waypoints[i0]![0], waypoints[i1]![0], frac),
      lerp(waypoints[i0]![1], waypoints[i1]![1], frac),
    ]);
  }
  return result;
}

function buildCableSegments(cables: Cable[]): CableSegment[] {
  const segments: CableSegment[] = [];
  for (const cable of cables) {
    const fullPath = interpolateRoute(cable.path, ARC_POINTS);
    const segCount = 8;
    const ptsPerSeg = Math.floor(ARC_POINTS / segCount);
    for (let s = 0; s < segCount; s++) {
      const start = s * ptsPerSeg;
      const end = s === segCount - 1 ? ARC_POINTS : (s + 1) * ptsPerSeg;
      const segPath = fullPath.slice(start, end + 1);
      const segMidRisk =
        cable.riskScore + (s % 3 === 0 ? 20 : s % 3 === 1 ? -5 : 5);
      segments.push({
        id: `${cable.id}-seg-${s}`,
        cableId: cable.id,
        path: segPath,
        riskScore: Math.max(0, Math.min(100, segMidRisk)),
      });
    }
  }
  return segments;
}

export function useMaritimeCables() {
  const cables = ref<Cable[]>([...CABLES]);
  const landingPoints = ref<LandingPoint[]>([...LANDING_POINTS]);
  const eezZones = ref<EezZone[]>([...EEZ_ZONES]);

  const selectedCableId = ref<string | null>(null);
  const showEez = ref(true);

  const cableSegments = computed(() => buildCableSegments(cables.value));

  const filteredCables = computed(() =>
    selectedCableId.value
      ? cables.value.filter((c) => c.id === selectedCableId.value)
      : cables.value,
  );

  const filteredSegments = computed(() =>
    selectedCableId.value
      ? cableSegments.value.filter((s) => s.cableId === selectedCableId.value)
      : cableSegments.value,
  );

  const stats = computed<CableStats>(() => {
    const totalHighRisk = cableSegments.value.filter(
      (s) => s.riskScore >= 70,
    ).length;
    const totalCapacity = cables.value.reduce(
      (sum, c) => sum + c.capacityTbps,
      0,
    );
    return {
      totalCables: cables.value.length,
      totalLandingPoints: landingPoints.value.length,
      highRiskSegments: totalHighRisk,
      totalCapacityTbps: totalCapacity,
    };
  });

  function selectCable(id: string | null): void {
    selectedCableId.value = id;
  }

  return {
    cables,
    cableSegments,
    landingPoints,
    eezZones,
    filteredCables,
    filteredSegments,
    selectedCableId,
    showEez,
    stats,
    selectCable,
  };
}
