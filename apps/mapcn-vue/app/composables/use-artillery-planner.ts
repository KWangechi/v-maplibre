import type {
  WeaponType,
  WeaponConfig,
  ArtilleryPosition,
  RangeFanPolygon,
} from '~/types/defense-artillery';

const NATO_LABELS = ['ALPHA', 'BRAVO', 'CHARLIE', 'DELTA', 'ECHO', 'FOXTROT'];

const WEAPON_CONFIGS: WeaponConfig[] = [
  {
    type: 'howitzer',
    label: 'Howitzer',
    icon: 'lucide:target',
    minRange: 4000,
    maxRange: 30000,
    color: [255, 100, 0],
    defaultArcWidth: 60,
  },
  {
    type: 'mortar',
    label: 'Mortar',
    icon: 'lucide:circle-dot',
    minRange: 500,
    maxRange: 7000,
    color: [0, 200, 255],
    defaultArcWidth: 360,
  },
  {
    type: 'mlrs',
    label: 'MLRS',
    icon: 'lucide:rocket',
    minRange: 15000,
    maxRange: 70000,
    color: [255, 60, 60],
    defaultArcWidth: 45,
  },
];

const MAX_POSITIONS = 6;
const EARTH_RADIUS = 6371000;

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

function generateRangeFan(
  center: [number, number],
  bearing: number,
  arcWidth: number,
  minRange: number,
  maxRange: number,
  numPoints: number = 36,
): [number, number][] {
  const startAngle = bearing - arcWidth / 2;
  const endAngle = bearing + arcWidth / 2;
  const polygon: [number, number][] = [];

  for (let i = 0; i <= numPoints; i++) {
    const angle = startAngle + ((endAngle - startAngle) * i) / numPoints;
    polygon.push(destinationPoint(center, maxRange, angle));
  }

  for (let i = numPoints; i >= 0; i--) {
    const angle = startAngle + ((endAngle - startAngle) * i) / numPoints;
    polygon.push(destinationPoint(center, minRange, angle));
  }

  polygon.push(polygon[0]!);
  return polygon;
}

function getWeaponConfig(type: WeaponType): WeaponConfig {
  return WEAPON_CONFIGS.find((c) => c.type === type) ?? WEAPON_CONFIGS[0]!;
}

function createInitialPositions(): ArtilleryPosition[] {
  return [
    {
      id: 'pos-1',
      position: [71.85, 26.95],
      weaponType: 'howitzer',
      bearing: 180,
      arcWidth: 60,
      minRange: 4000,
      maxRange: 30000,
      label: 'ALPHA-1',
    },
    {
      id: 'pos-2',
      position: [71.95, 26.85],
      weaponType: 'mortar',
      bearing: 90,
      arcWidth: 360,
      minRange: 500,
      maxRange: 7000,
      label: 'BRAVO-1',
    },
    {
      id: 'pos-3',
      position: [71.8, 26.8],
      weaponType: 'mlrs',
      bearing: 45,
      arcWidth: 45,
      minRange: 15000,
      maxRange: 70000,
      label: 'CHARLIE-1',
    },
  ];
}

export function useArtilleryPlanner() {
  const positions = ref<ArtilleryPosition[]>(createInitialPositions());
  const selectedPositionId = ref<string | null>('pos-1');
  const activeWeaponType = ref<WeaponType>('howitzer');

  let nextId = 4;

  const selectedPosition = computed(
    () =>
      positions.value.find((p) => p.id === selectedPositionId.value) ?? null,
  );

  const rangeFans = computed<RangeFanPolygon[]>(() =>
    positions.value.map((pos) => {
      const config = getWeaponConfig(pos.weaponType);
      return {
        positionId: pos.id,
        polygon: generateRangeFan(
          pos.position,
          pos.bearing,
          pos.arcWidth,
          pos.minRange,
          pos.maxRange,
        ),
        color: [config.color[0], config.color[1], config.color[2], 50] as [
          number,
          number,
          number,
          number,
        ],
      };
    }),
  );

  function addPosition(lngLat: [number, number]): void {
    if (positions.value.length >= MAX_POSITIONS) return;
    const config = getWeaponConfig(activeWeaponType.value);
    const labelIndex = positions.value.length;
    const natoLabel = NATO_LABELS[labelIndex] ?? `UNIT-${labelIndex + 1}`;
    const id = `pos-${nextId++}`;
    positions.value.push({
      id,
      position: lngLat,
      weaponType: activeWeaponType.value,
      bearing: 0,
      arcWidth: config.defaultArcWidth,
      minRange: config.minRange,
      maxRange: config.maxRange,
      label: `${natoLabel}-1`,
    });
    selectedPositionId.value = id;
  }

  function removePosition(id: string): void {
    positions.value = positions.value.filter((p) => p.id !== id);
    if (selectedPositionId.value === id) {
      selectedPositionId.value = positions.value[0]?.id ?? null;
    }
  }

  function clearAll(): void {
    positions.value = [];
    selectedPositionId.value = null;
  }

  function selectPosition(id: string | null): void {
    selectedPositionId.value = id;
  }

  function setWeaponType(type: WeaponType): void {
    activeWeaponType.value = type;
  }

  function updateBearing(bearing: number): void {
    const pos = positions.value.find((p) => p.id === selectedPositionId.value);
    if (pos) {
      pos.bearing = bearing;
    }
  }

  function cleanup(): void {
    positions.value = [];
    selectedPositionId.value = null;
  }

  return {
    positions,
    selectedPositionId,
    selectedPosition,
    activeWeaponType,
    rangeFans,
    weaponConfigs: WEAPON_CONFIGS,
    addPosition,
    removePosition,
    clearAll,
    selectPosition,
    setWeaponType,
    updateBearing,
    cleanup,
  };
}
