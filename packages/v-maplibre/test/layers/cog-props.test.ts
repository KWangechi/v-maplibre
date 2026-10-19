import { describe, it, expect, vi, beforeEach } from 'vite-plus/test';
import { mount, flushPromises } from '@vue/test-utils';
import VMap from '../../src/map/VMap.vue';
import VLayerCog from '../../src/layers/deckgl/cog/VLayerCog.vue';
import VLayerMultiCog from '../../src/layers/deckgl/multi-cog/VLayerMultiCog.vue';
import '../setup';

const created: Array<{ kind: string; props: Record<string, unknown> }> = [];

vi.mock('@developmentseed/deck.gl-geotiff', () => {
  const make = (kind: string) =>
    class {
      id: string;
      props: Record<string, unknown>;
      constructor(props: Record<string, unknown>) {
        this.id = props.id as string;
        this.props = props;
        created.push({ kind, props });
      }
    };
  return { COGLayer: make('cog'), MultiCOGLayer: make('multi') };
});

vi.mock('@developmentseed/proj', () => ({ epsgResolver: vi.fn() }));

const mountInMap = async (template: string, setup: () => object) => {
  const container = document.createElement('div');
  container.id = 'map';
  document.body.appendChild(container);
  const wrapper = mount(VMap, {
    props: { options: { container: 'map' } },
    slots: {
      default: { template, components: { VLayerCog, VLayerMultiCog }, setup },
    },
  });
  await flushPromises();
  return wrapper;
};

const lastOf = (kind: string) =>
  created.filter((c) => c.kind === kind).at(-1)!.props;

describe('COG layer props (deck.gl-geotiff 0.8)', () => {
  beforeEach(() => {
    created.length = 0;
  });

  // deck.gl copies every own key onto the props instance (create-props.js),
  // so an own `concurrencyLimiter: undefined` would shadow the layer's
  // prototype default. The key must be absent, not undefined.
  it('omits concurrencyLimiter when unset so the shared default applies', async () => {
    await mountInMap(
      '<VLayerCog id="c" geotiff="https://x/a.tif" />',
      () => ({}),
    );
    expect('concurrencyLimiter' in lastOf('cog')).toBe(false);
  });

  // A falsy check (`if (props.concurrencyLimiter)`) would silently drop the
  // deliberate `null` opt-out and keep the 6-per-origin default.
  it('keeps an explicit null (limiting off) for both COG layers', async () => {
    await mountInMap(
      '<VLayerCog id="c" geotiff="https://x/a.tif" :concurrency-limiter="null" />',
      () => ({}),
    );
    expect(lastOf('cog').concurrencyLimiter).toBeNull();

    await mountInMap(
      '<VLayerMultiCog id="m" :sources="{ red: { url: \'https://x/r.tif\' } }" :concurrency-limiter="null" />',
      () => ({}),
    );
    expect(lastOf('multi').concurrencyLimiter).toBeNull();
  });
});
