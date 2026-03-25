import type { Map as MaplibreMap } from 'maplibre-gl';
import type {
  DangerZone,
  DrawMode,
  ZoneType,
} from '~/types/defense-zone-planner';

const ZONE_COLORS: Record<ZoneType, [number, number, number, number]> = {
  minefield: [255, 60, 60, 60],
  restricted: [255, 165, 0, 60],
  hazard: [255, 200, 0, 60],
};

const PRESET_ZONES: DangerZone[] = [
  {
    id: 'preset-alpha',
    type: 'minefield',
    label: 'Minefield Alpha',
    polygon: [
      [71.35, 26.62],
      [71.42, 26.65],
      [71.45, 26.6],
      [71.4, 26.56],
      [71.35, 26.62],
    ],
    areaKm2: 0,
    color: ZONE_COLORS.minefield,
  },
  {
    id: 'preset-bravo',
    type: 'restricted',
    label: 'Restricted Zone Bravo',
    polygon: [
      [71.55, 26.52],
      [71.65, 26.55],
      [71.68, 26.48],
      [71.58, 26.45],
      [71.55, 26.52],
    ],
    areaKm2: 0,
    color: ZONE_COLORS.restricted,
  },
  {
    id: 'preset-charlie',
    type: 'hazard',
    label: 'Hazard Area Charlie',
    polygon: [
      [71.45, 26.32],
      [71.55, 26.35],
      [71.58, 26.28],
      [71.48, 26.25],
      [71.45, 26.32],
    ],
    areaKm2: 0,
    color: ZONE_COLORS.hazard,
  },
];

function computeAreaKm2(polygon: [number, number][]): number {
  if (polygon.length < 4) return 0;
  const toRad = Math.PI / 180;
  const R = 6371;
  let area = 0;
  for (let i = 0; i < polygon.length - 1; i++) {
    const [lng1, lat1] = polygon[i]!;
    const [lng2, lat2] = polygon[i + 1]!;
    area +=
      (lng2 - lng1) *
      toRad *
      (2 + Math.sin(lat1 * toRad) + Math.sin(lat2 * toRad));
  }
  return Math.abs((area * R * R) / 2);
}

function polygonCentroid(polygon: [number, number][]): [number, number] {
  const pts =
    polygon.length > 1 && polygon[0]![0] === polygon[polygon.length - 1]![0]
      ? polygon.slice(0, -1)
      : polygon;
  let cx = 0;
  let cy = 0;
  for (const [x, y] of pts) {
    cx += x;
    cy += y;
  }
  return [cx / pts.length, cy / pts.length];
}

export function useZonePlanner() {
  const zones = ref<DangerZone[]>(
    PRESET_ZONES.map((z) => ({ ...z, areaKm2: computeAreaKm2(z.polygon) })),
  );
  const drawMode = ref<DrawMode>('static');
  const activeZoneType = ref<ZoneType>('minefield');

  let drawInstance: InstanceType<typeof import('terra-draw').TerraDraw> | null =
    null;
  let zoneCounter = 0;

  async function initDraw(map: MaplibreMap): Promise<void> {
    const {
      TerraDraw,
      TerraDrawPolygonMode,
      TerraDrawRectangleMode,
      TerraDrawSelectMode,
    } = await import('terra-draw');
    const { TerraDrawMapLibreGLAdapter } =
      await import('terra-draw-maplibre-gl-adapter');

    const draw = new TerraDraw({
      adapter: new TerraDrawMapLibreGLAdapter({ map }),
      modes: [
        new TerraDrawPolygonMode(),
        new TerraDrawRectangleMode(),
        new TerraDrawSelectMode({
          flags: {
            polygon: {
              feature: {
                draggable: true,
                coordinates: {
                  midpoints: true,
                  draggable: true,
                  deletable: true,
                },
              },
            },
            rectangle: {
              feature: {
                draggable: true,
                coordinates: {
                  midpoints: true,
                  draggable: true,
                  deletable: true,
                },
              },
            },
          },
        }),
      ],
    });

    draw.start();
    draw.setMode('static');

    draw.on('finish', (id, context) => {
      if (context.action === 'draw') {
        const feature = draw.getSnapshotFeature(id);
        if (feature && feature.geometry.type === 'Polygon') {
          const coords = feature.geometry.coordinates[0] as
            | [number, number][]
            | undefined;
          if (coords) {
            zoneCounter++;
            const type = activeZoneType.value;
            const zone: DangerZone = {
              id: `zone-${Date.now()}-${zoneCounter}`,
              type,
              label: `${type.charAt(0).toUpperCase() + type.slice(1)} ${zoneCounter}`,
              polygon: coords,
              areaKm2: computeAreaKm2(coords),
              color: ZONE_COLORS[type],
            };
            zones.value = [...zones.value, zone];
          }
        }
        draw.removeFeatures([id]);
      }
    });

    drawInstance = draw;
  }

  function setDrawMode(mode: DrawMode): void {
    if (!drawInstance) return;
    drawMode.value = mode;
    if (mode === 'polygon' || mode === 'rectangle' || mode === 'select') {
      drawInstance.setMode(mode);
    } else {
      drawInstance.setMode('static');
    }
  }

  function removeZone(zoneId: string): void {
    zones.value = zones.value.filter((z) => z.id !== zoneId);
  }

  function clearZones(): void {
    zones.value = [];
    if (drawInstance) {
      drawInstance.clear();
    }
  }

  function cleanup(): void {
    if (drawInstance) {
      drawInstance.stop();
      drawInstance = null;
    }
  }

  return {
    zones,
    drawMode,
    activeZoneType,
    initDraw,
    setDrawMode,
    removeZone,
    clearZones,
    cleanup,
    polygonCentroid,
  };
}
