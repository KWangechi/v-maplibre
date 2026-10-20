import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
} from 'vite-plus/test';
import { mount } from '@vue/test-utils';
import VMap from '../../src/map/VMap.vue';
import { VLayerDeckglScatterplot } from '../../src/layers/deckgl';
import { MockMap, MockMapboxOverlay } from '../setup';

const defaultMapOptions = {
  container: 'map',
  style: 'https://demotiles.maplibre.org/style.json',
  center: [0, 0] as [number, number],
  zoom: 2,
};

// deck.gl creates its device with `_reuseDevices: true`, so finalize() leaves
// a non-interleaved overlay's WebGL context alive until GC. The overlay
// teardown must release it explicitly, and must leave the map's own canvas to
// Map#remove().
describe('deck.gl overlay teardown releases its WebGL context', () => {
  const released: HTMLCanvasElement[] = [];

  beforeEach(() => {
    const container = document.createElement('div');
    container.id = 'map';
    document.body.appendChild(container);
    released.length = 0;
    MockMapboxOverlay.constructionCount = 0;
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
      function (this: HTMLCanvasElement) {
        return {
          getExtension: (name: string) =>
            name === 'WEBGL_lose_context'
              ? { loseContext: () => released.push(this) }
              : null,
        } as unknown as WebGL2RenderingContext;
      },
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function mountWithDeckLayer(projection: 'mercator' | 'globe') {
    return mount(VMap, {
      props: { options: defaultMapOptions, projection },
      slots: {
        default: {
          template: `<VLayerDeckglScatterplot id="s" :data="data" :get-position="d => d.coordinates" />`,
          components: { VLayerDeckglScatterplot },
          data: () => ({ data: [{ coordinates: [0, 0] }] }),
        },
      },
    });
  }

  it("releases a non-interleaved overlay's own canvas on unmount", async () => {
    const wrapper = mountWithDeckLayer('mercator');
    await vi.dynamicImportSettled();
    await wrapper.vm.$nextTick();
    expect(MockMapboxOverlay.constructionCount).toBe(1);
    expect(released).toHaveLength(0);

    wrapper.unmount();

    expect(released).toHaveLength(1);
    expect(released[0]).not.toBe(MockMap.lastInstance?.getCanvas());
  });

  it("leaves an interleaved (globe) overlay's shared map canvas alone", async () => {
    const wrapper = mountWithDeckLayer('globe');
    await vi.dynamicImportSettled();
    await wrapper.vm.$nextTick();
    // The overlay must actually exist, or this check proves nothing.
    expect(MockMapboxOverlay.constructionCount).toBe(1);

    wrapper.unmount();

    expect(released).toHaveLength(0);
  });
});
