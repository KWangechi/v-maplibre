import { describe, it, expect, vi, beforeEach } from 'vite-plus/test';
import { mount, flushPromises } from '@vue/test-utils';
import { shallowRef } from 'vue';
import VControlLidar from '../../src/controls/lidar/VControlLidar.vue';
import { MapKey } from '../../src/utils/symbols';
import { MockMap } from '../setup';

type Handler = (data?: unknown) => void;

class MockLidarControl {
  static lastInstance: MockLidarControl | null = null;
  /** What loadPointCloud() returns; the real control returns a promise. */
  static loadResult: () => Promise<unknown> = () => Promise.resolve();
  readonly handlers = new Map<string, Handler>();
  readonly setClassificationStyles = vi.fn();
  readonly loadPointCloud = vi.fn(() => MockLidarControl.loadResult());

  constructor(readonly options: unknown) {
    MockLidarControl.lastInstance = this;
  }

  on(event: string, handler: Handler) {
    this.handlers.set(event, handler);
  }

  off(event: string) {
    this.handlers.delete(event);
  }
}

vi.mock('maplibre-gl-lidar', () => ({ LidarControl: MockLidarControl }));

const mountLidar = async (props: Record<string, unknown> = {}) => {
  const map = new MockMap({ container: document.createElement('div') });
  const wrapper = mount(VControlLidar, {
    props,
    global: { provide: { [MapKey as symbol]: shallowRef(map) } },
  });
  await flushPromises();
  return { wrapper, control: MockLidarControl.lastInstance! };
};

describe('VControlLidar', () => {
  beforeEach(() => {
    MockLidarControl.lastInstance = null;
  });

  // maplibre-gl-lidar rejects with an AbortError when the control is removed
  // while `defaultUrl` is still loading (e.g. a map card scrolled away). That
  // is a cancellation and must not become an unhandled rejection; any other
  // error must still reject.
  it('handles a cancelled defaultUrl load and rethrows real failures', async () => {
    let handler: ((error: unknown) => unknown) | undefined;
    MockLidarControl.loadResult = () =>
      ({
        catch(onRejected: (error: unknown) => unknown) {
          handler = onRejected;
          return Promise.resolve();
        },
      }) as unknown as Promise<unknown>;

    const { control } = await mountLidar({
      defaultUrl: 'https://x/a.copc.laz',
    });
    MockLidarControl.loadResult = () => Promise.resolve();

    expect(control.loadPointCloud).toHaveBeenCalledWith('https://x/a.copc.laz');
    expect(handler).toBeTypeOf('function');
    const abort = new DOMException(
      'LidarControl was removed while loading',
      'AbortError',
    );
    expect(() => handler!(abort)).not.toThrow();
    const failure = new Error('404');
    expect(() => handler!(failure)).toThrow(failure);
  });

  it('re-emits pointclick with the picked point', async () => {
    const { wrapper, control } = await mountLidar();
    const point = {
      pointCloudId: 'cloud',
      index: 7,
      longitude: 1,
      latitude: 2,
      elevation: 3,
      classification: 6,
      x: 10,
      y: 20,
    };

    control.handlers.get('pointclick')?.({ type: 'pointclick', point });

    expect(wrapper.emitted('pointclick')?.[0]).toEqual([
      { type: 'pointclick', point },
    ]);
  });

  it('applies classificationStyles on mount and when the prop changes', async () => {
    const styles = { 64: { name: 'Solar panel', color: [255, 200, 0] } };
    const { wrapper, control } = await mountLidar({
      classificationStyles: styles,
    });
    expect(control.setClassificationStyles).toHaveBeenCalledWith(styles);

    await wrapper.setProps({
      classificationStyles: { 65: { name: 'Antenna' } },
    });
    expect(control.setClassificationStyles).toHaveBeenLastCalledWith({
      65: { name: 'Antenna' },
    });

    // Clearing the prop clears the overrides instead of keeping stale ones.
    await wrapper.setProps({ classificationStyles: undefined });
    expect(control.setClassificationStyles).toHaveBeenLastCalledWith({});
  });
});
