import type { Map as MaplibreMap } from 'maplibre-gl';
import type {
  GeofenceZone,
  GeofenceBreach,
  GeofenceDrawMode,
  C2UnitPosition,
  C2Unit,
} from '~/types/defense-drone-c2';

/** Ray-casting point-in-polygon test */
function isPointInPolygon(
  point: [number, number],
  polygon: [number, number][],
): boolean {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i]!;
    const [xj, yj] = polygon[j]!;
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

export function useGeofence() {
  const geofence = ref<GeofenceZone | null>(null);
  const drawMode = ref<GeofenceDrawMode>('static');

  let drawInstance: InstanceType<typeof import('terra-draw').TerraDraw> | null =
    null;

  async function initDraw(map: MaplibreMap): Promise<void> {
    const { TerraDraw, TerraDrawPolygonMode, TerraDrawSelectMode } =
      await import('terra-draw');
    const { TerraDrawMapLibreGLAdapter } =
      await import('terra-draw-maplibre-gl-adapter');

    const draw = new TerraDraw({
      adapter: new TerraDrawMapLibreGLAdapter({ map }),
      modes: [
        new TerraDrawPolygonMode(),
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
          },
        }),
      ],
    });

    draw.start();
    draw.setMode('polygon');
    drawMode.value = 'polygon';

    draw.on('finish', (id, context) => {
      if (context.action === 'draw') {
        const feature = draw.getSnapshotFeature(id);
        if (feature && feature.geometry.type === 'Polygon') {
          const coords = feature.geometry.coordinates[0] as
            | [number, number][]
            | undefined;
          if (coords) {
            geofence.value = {
              id: String(id),
              polygon: coords,
            };
            draw.setMode('select');
            drawMode.value = 'select';
          }
        }
      }
    });

    drawInstance = draw;
  }

  function setDrawMode(mode: GeofenceDrawMode): void {
    if (!drawInstance) return;
    drawMode.value = mode;
    if (mode === 'polygon') {
      drawInstance.clear();
      geofence.value = null;
      drawInstance.setMode('polygon');
    } else if (mode === 'select') {
      drawInstance.setMode('select');
    }
  }

  function clearGeofence(): void {
    if (drawInstance) {
      drawInstance.clear();
    }
    geofence.value = null;
    drawMode.value = 'polygon';
    if (drawInstance) {
      drawInstance.setMode('polygon');
    }
  }

  function checkBreaches(
    positions: Record<string, C2UnitPosition>,
    units: C2Unit[],
  ): GeofenceBreach[] {
    if (!geofence.value) return [];

    const polygon = geofence.value.polygon;
    const breaches: GeofenceBreach[] = [];

    for (const unit of units) {
      const pos = positions[unit.id];
      if (!pos) continue;
      const inside = isPointInPolygon([pos.lng, pos.lat], polygon);
      if (!inside) {
        breaches.push({
          unitId: unit.id,
          callsign: unit.callsign,
          timestamp: Date.now(),
        });
      }
    }

    return breaches;
  }

  function cleanup(): void {
    if (drawInstance) {
      drawInstance.stop();
      drawInstance = null;
    }
  }

  return {
    geofence,
    drawMode,
    initDraw,
    setDrawMode,
    clearGeofence,
    checkBreaches,
    cleanup,
  };
}
