import type { Map as MaplibreMap } from 'maplibre-gl';
import type { MaplibreSnowLayer } from '@geoql/maplibre-gl-snow';
import type { Ref } from 'vue';

export function useSnowLayerSync(
  mapRef: Ref<MaplibreMap | null>,
  snowLayer: Ref<MaplibreSnowLayer | null>,
) {
  // Continuous: update flake size only (cheap, no particle rebuild)
  function updateSize(): void {
    const map = mapRef.value;
    const layer = snowLayer.value;
    if (!map || !layer) return;
    const zoom = map.getZoom();
    const zoomFactor = Math.max(0, Math.min(1, (zoom - 8) / 7));
    layer.setFlakeSize(0.8 + zoomFactor * 0.7);
  }

  // On animation end: update density (triggers particle rebuild) + size
  function update(): void {
    const map = mapRef.value;
    const layer = snowLayer.value;
    if (!map || !layer) return;
    const zoom = map.getZoom();
    const pitch = map.getPitch();
    const zoomFactor = Math.max(0, Math.min(1, (zoom - 8) / 7));
    const pitchFactor = Math.max(0, Math.min(1, pitch / 70));
    layer.setDensity(0.02 + zoomFactor * 0.06 * (0.5 + 0.5 * pitchFactor));
    layer.setFlakeSize(0.8 + zoomFactor * 0.7);
  }

  function start(): void {
    const map = mapRef.value;
    if (!map) return;
    // Continuous events: just resize flakes (no expensive rebuild)
    map.on('zoom', updateSize);
    map.on('pitch', updateSize);
    // Animation-end events: also update density (may rebuild particles)
    map.on('zoomend', update);
    map.on('pitchend', update);
    update();
  }

  function stop(): void {
    mapRef.value?.off('zoom', updateSize);
    mapRef.value?.off('pitch', updateSize);
    mapRef.value?.off('zoomend', update);
    mapRef.value?.off('pitchend', update);
  }

  return { start, stop };
}
