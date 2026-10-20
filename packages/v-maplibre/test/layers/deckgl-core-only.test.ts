import { describe, it, expect, beforeEach } from 'vite-plus/test';
import { mount } from '@vue/test-utils';
import { defineComponent, h, shallowRef } from 'vue';
import type { Map } from 'maplibre-gl';
import VMap from '../../src/map/VMap.vue';
import { VLayerDeckglScatterplot } from '../../src/layers/deckgl';
import { useDeckOverlay } from '../../src/layers/deckgl/_shared/useDeckOverlay';
import { MockMapboxOverlay } from '../setup';
import '../setup';

const defaultMapOptions = {
  container: 'map',
  style: 'https://demotiles.maplibre.org/style.json',
  center: [0, 0] as [number, number],
  zoom: 2,
};

describe('issue #124: core-only VMap must not probe @deck.gl/mapbox', () => {
  beforeEach(() => {
    const container = document.createElement('div');
    container.id = 'map';
    document.body.appendChild(container);
    MockMapboxOverlay.constructionCount = 0;
  });

  it('never constructs a MapboxOverlay when no deck layer is registered', async () => {
    const wrapper = mount(VMap, { props: { options: defaultMapOptions } });
    await vi.dynamicImportSettled();
    await wrapper.vm.$nextTick();

    expect(MockMapboxOverlay.constructionCount).toBe(0);
  });

  it('still constructs the overlay (lazy path) once a deck layer mounts', async () => {
    const wrapper = mount(VMap, {
      props: { options: defaultMapOptions },
      slots: {
        default: {
          template: `<VLayerDeckglScatterplot id="s" :data="data" :get-position="d => d.coordinates" />`,
          components: { VLayerDeckglScatterplot },
          data: () => ({ data: [{ coordinates: [0, 0] }] }),
        },
      },
    });
    await vi.dynamicImportSettled();
    await wrapper.vm.$nextTick();

    expect(MockMapboxOverlay.constructionCount).toBeGreaterThan(0);
  });

  it('does not construct the overlay before the style is loaded, and constructs it once the style loads', async () => {
    const styleLoaded = { value: false };
    const styleLoadListeners = new Set<() => void>();
    const fakeMap = {
      isStyleLoaded: () => styleLoaded.value,
      on: (event: string, cb: () => void) => {
        if (event === 'style.load') styleLoadListeners.add(cb);
      },
      off: (event: string, cb: () => void) => {
        if (event === 'style.load') styleLoadListeners.delete(cb);
      },
      addControl: () => {},
      removeControl: () => {},
      triggerRepaint: () => {},
      getProjection: () => ({ type: 'mercator' }),
    } as unknown as Map;

    const harness = defineComponent({
      setup() {
        const map = shallowRef<Map | null>(fakeMap);
        const { addLayer } = useDeckOverlay(map);
        addLayer({ id: 'lazy-layer' });
        return () => h('div');
      },
    });

    mount(harness);
    await vi.dynamicImportSettled();

    // MapLibre throws "Style is not done loading." for any style mutation
    // issued before the style is parsed, so the overlay must wait for it.
    expect(MockMapboxOverlay.constructionCount).toBe(0);

    styleLoaded.value = true;
    styleLoadListeners.forEach((cb) => cb());
    await vi.dynamicImportSettled();

    expect(MockMapboxOverlay.constructionCount).toBeGreaterThan(0);
  });

  it('does not construct the overlay if the only layer is removed before the peer import resolves, yet still inits for a later layer', async () => {
    const fakeMap = {
      isStyleLoaded: () => true,
      once: () => {},
      on: () => {},
      off: () => {},
      addControl: () => {},
      removeControl: () => {},
      triggerRepaint: () => {},
      getProjection: () => ({ type: 'mercator' }),
    } as unknown as Map;

    let api: ReturnType<typeof useDeckOverlay> | null = null;
    const harness = defineComponent({
      setup() {
        const map = shallowRef<Map | null>(fakeMap);
        api = useDeckOverlay(map);
        return () => h('div');
      },
    });

    mount(harness);
    api!.addLayer({ id: 'transient' });
    api!.removeLayer('transient');
    await vi.dynamicImportSettled();

    expect(MockMapboxOverlay.constructionCount).toBe(0);

    api!.addLayer({ id: 'real' });
    await vi.dynamicImportSettled();

    expect(MockMapboxOverlay.constructionCount).toBeGreaterThan(0);
  });
});
