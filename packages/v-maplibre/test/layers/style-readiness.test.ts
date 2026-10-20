import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
} from 'vite-plus/test';
import { mount } from '@vue/test-utils';
import { nextTick, ref, defineComponent, h, shallowRef } from 'vue';
import type { Map } from 'maplibre-gl';
import VLayerMaplibreRaster from '../../src/layers/maplibre/raster/VLayerMaplibreRaster.vue';
import VLayerMaplibreVector from '../../src/layers/maplibre/vector/VLayerMaplibreVector.vue';
import { useDeckOverlay } from '../../src/layers/deckgl/_shared/useDeckOverlay';
import { MapKey } from '../../src/utils/symbols';
import { MockMapboxOverlay } from '../setup';
import '../setup';
import type {
  RasterLayerSpecification,
  RasterSourceSpecification,
  VectorSourceSpecification,
} from 'maplibre-gl';

/**
 * Regression tests for the "Style is not done loading." race.
 *
 * MapLibre guards every style mutation behind `style._checkLoaded()`, which
 * throws `Error: Style is not done loading.` until the style JSON has been
 * parsed. Layer wrappers mount as soon as their host renders them — long
 * before the style request resolves — so anything that mutates the style has
 * to WAIT for the style.
 *
 * The maps below reproduce MapLibre's contract exactly: `addLayer`,
 * `addSource` and `setProjection` throw while the style is not loaded.
 *
 * Production symptoms this locked down:
 *  - `[osm-raster] Error adding layer: Error: Style is not done loading.`
 *  - `[deck.gl] Error initializing overlay: Error: Style is not done loading.
 *     at Map._checkLoaded at Map.setProjection`
 */

type EventCallback = (...args: unknown[]) => void;

/**
 * A map mock that enforces MapLibre's "style must be loaded" precondition.
 */
class StyleGatedMap {
  styleLoaded = false;
  addedLayers: string[] = [];
  addedSources: string[] = [];
  projections: string[] = [];
  private layers = new Set<string>();
  private sources = new Set<string>();
  private listeners = new Map<string, Set<EventCallback>>();

  private assertStyleLoaded(): void {
    if (!this.styleLoaded) {
      throw new Error('Style is not done loading.');
    }
  }

  on(event: string, layerOrCb: string | EventCallback, cb?: EventCallback) {
    const callback = (typeof layerOrCb === 'function' ? layerOrCb : cb)!;
    const key =
      typeof layerOrCb === 'function' ? event : `${event}:${layerOrCb}`;
    if (!this.listeners.has(key)) this.listeners.set(key, new Set());
    this.listeners.get(key)!.add(callback);
    return this;
  }

  off(event: string, layerOrCb: string | EventCallback, cb?: EventCallback) {
    const callback = (typeof layerOrCb === 'function' ? layerOrCb : cb)!;
    const key =
      typeof layerOrCb === 'function' ? event : `${event}:${layerOrCb}`;
    this.listeners.get(key)?.delete(callback);
    return this;
  }

  fire(event: string) {
    this.listeners.get(event)?.forEach((cb) => cb());
  }

  isStyleLoaded() {
    return this.styleLoaded;
  }

  loaded() {
    return this.styleLoaded;
  }

  addSource(id: string, _src: unknown) {
    this.assertStyleLoaded();
    this.sources.add(id);
    this.addedSources.push(id);
    return this;
  }

  getSource(id: string) {
    return this.sources.has(id) ? { setData: vi.fn() } : undefined;
  }

  removeSource(id: string) {
    this.assertStyleLoaded();
    this.sources.delete(id);
    return this;
  }

  addLayer(layer: { id: string }, _before?: string) {
    this.assertStyleLoaded();
    this.layers.add(layer.id);
    this.addedLayers.push(layer.id);
    return this;
  }

  getLayer(id: string) {
    return this.layers.has(id) ? { id, type: 'raster' } : null;
  }

  removeLayer(id: string) {
    this.assertStyleLoaded();
    this.layers.delete(id);
    return this;
  }

  setLayoutProperty() {
    this.assertStyleLoaded();
    return this;
  }

  setPaintProperty() {
    this.assertStyleLoaded();
    return this;
  }

  moveLayer() {
    this.assertStyleLoaded();
    return this;
  }

  // --- deck.gl overlay surface -------------------------------------------

  getProjection() {
    return { type: 'mercator' };
  }

  setProjection(projection: { type: string }) {
    this.assertStyleLoaded();
    this.projections.push(projection.type);
    return this;
  }

  getCenter() {
    return { lng: 0, lat: 0 };
  }

  getZoom() {
    return 2;
  }

  getPitch() {
    return 0;
  }

  getBearing() {
    return 0;
  }

  setCenter() {
    return this;
  }

  setZoom() {
    return this;
  }

  setPitch() {
    return this;
  }

  setBearing() {
    return this;
  }

  addControl() {
    this.assertStyleLoaded();
    return this;
  }

  removeControl() {
    return this;
  }

  triggerRepaint() {
    return this;
  }
}

const rasterSource: RasterSourceSpecification = {
  type: 'raster',
  tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
  tileSize: 256,
};

const rasterLayer: RasterLayerSpecification = {
  id: 'osm-raster',
  type: 'raster',
  source: 'osm-source',
  paint: { 'raster-opacity': 0.7 },
} as RasterLayerSpecification;

const vectorSource: VectorSourceSpecification = {
  type: 'vector',
  tiles: ['https://example.com/{z}/{x}/{y}.pbf'],
};

const vectorLayer = {
  id: 'demo-vector',
  type: 'line',
  source: 'demo-source',
  paint: { 'line-color': '#007cbf' },
};

describe('style-readiness race — "Style is not done loading."', () => {
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    MockMapboxOverlay.constructionCount = 0;
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  describe('VLayerMaplibreRaster', () => {
    function mountRaster(mapRef: { value: StyleGatedMap | null }) {
      const Harness = defineComponent({
        setup() {
          return () =>
            h(VLayerMaplibreRaster, {
              sourceId: 'osm-source',
              layerId: 'osm-raster',
              source: rasterSource,
              layer: rasterLayer,
            });
        },
      });
      return mount(Harness, {
        global: { provide: { [MapKey as symbol]: mapRef } },
      });
    }

    it('does not touch the style before it is loaded', async () => {
      const map = new StyleGatedMap();
      const mapRef = ref<StyleGatedMap | null>(map);

      mountRaster(mapRef);
      await nextTick();
      await nextTick();

      // The visibility watcher runs immediately at mount. Calling addLayer()
      // here is what produced "[osm-raster] Error adding layer: Error: Style
      // is not done loading." in production.
      expect(map.addedLayers).not.toContain('osm-raster');
      expect(map.addedSources).not.toContain('osm-source');
      expect(consoleError).not.toHaveBeenCalled();
    });

    it('adds the layer once the style has loaded', async () => {
      const map = new StyleGatedMap();
      const mapRef = ref<StyleGatedMap | null>(map);

      mountRaster(mapRef);
      await nextTick();

      map.styleLoaded = true;
      map.fire('style.load');
      await nextTick();

      expect(map.addedSources).toContain('osm-source');
      expect(map.addedLayers).toContain('osm-raster');
      expect(consoleError).not.toHaveBeenCalled();
    });
  });

  describe('VLayerMaplibreVector', () => {
    function mountVector(mapRef: { value: StyleGatedMap | null }) {
      const Harness = defineComponent({
        setup() {
          return () =>
            h(VLayerMaplibreVector, {
              sourceId: 'demo-source',
              layerId: 'demo-vector',
              source: vectorSource,
              layer: vectorLayer,
            });
        },
      });
      return mount(Harness, {
        global: { provide: { [MapKey as symbol]: mapRef } },
      });
    }

    it('does not touch the style before it is loaded', async () => {
      const map = new StyleGatedMap();
      const mapRef = ref<StyleGatedMap | null>(map);

      mountVector(mapRef);
      await nextTick();
      await nextTick();

      expect(map.addedLayers).not.toContain('demo-vector');
      expect(map.addedSources).not.toContain('demo-source');
      expect(consoleError).not.toHaveBeenCalled();
    });

    it('adds the layer once the style has loaded', async () => {
      const map = new StyleGatedMap();
      const mapRef = ref<StyleGatedMap | null>(map);

      mountVector(mapRef);
      await nextTick();

      map.styleLoaded = true;
      map.fire('style.load');
      await nextTick();

      expect(map.addedSources).toContain('demo-source');
      expect(map.addedLayers).toContain('demo-vector');
      expect(consoleError).not.toHaveBeenCalled();
    });
  });

  describe('useDeckOverlay — globe projection', () => {
    function mountOverlay(map: StyleGatedMap, options: { globe: boolean }) {
      const Harness = defineComponent({
        setup() {
          const mapRef = shallowRef<Map | null>(map as unknown as Map);
          const { addLayer } = useDeckOverlay(mapRef, { globe: options.globe });
          addLayer({ id: 'overlay-layer' });
          return () => h('div');
        },
      });
      return mount(Harness);
    }

    it('does not set the projection before the style is loaded', async () => {
      const map = new StyleGatedMap();
      mountOverlay(map, { globe: true });
      await vi.dynamicImportSettled();

      // setProjection() before the style is ready is what produced
      // "[deck.gl] Error initializing overlay: Error: Style is not done
      // loading. at Map._checkLoaded at Map.setProjection".
      expect(map.projections).toEqual([]);
      expect(MockMapboxOverlay.constructionCount).toBe(0);
      expect(consoleError).not.toHaveBeenCalled();
    });

    it('sets the projection and builds the overlay once the style has loaded', async () => {
      const map = new StyleGatedMap();
      mountOverlay(map, { globe: true });
      await vi.dynamicImportSettled();

      map.styleLoaded = true;
      map.fire('style.load');
      await vi.dynamicImportSettled();
      await nextTick();

      expect(map.projections).toEqual(['globe']);
      expect(MockMapboxOverlay.constructionCount).toBeGreaterThan(0);
      expect(consoleError).not.toHaveBeenCalled();
    });
  });

  describe('useDeckOverlay — non-globe overlay', () => {
    it('does not build the overlay before the style is loaded', async () => {
      const map = new StyleGatedMap();
      const Harness = defineComponent({
        setup() {
          const mapRef = shallowRef<Map | null>(map as unknown as Map);
          const { addLayer } = useDeckOverlay(mapRef);
          addLayer({ id: 'overlay-layer' });
          return () => h('div');
        },
      });

      mount(Harness);
      await vi.dynamicImportSettled();

      expect(MockMapboxOverlay.constructionCount).toBe(0);
      expect(consoleError).not.toHaveBeenCalled();

      map.styleLoaded = true;
      map.fire('style.load');
      await vi.dynamicImportSettled();

      expect(MockMapboxOverlay.constructionCount).toBeGreaterThan(0);
      expect(consoleError).not.toHaveBeenCalled();
    });
  });
});
