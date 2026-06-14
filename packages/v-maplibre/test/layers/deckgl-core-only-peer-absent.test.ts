import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import VMap from '../../src/map/VMap.vue';
import '../setup';

vi.mock('@deck.gl/mapbox', () => {
  throw new Error('Could not resolve "@deck.gl/mapbox"');
});

const defaultMapOptions = {
  container: 'map',
  style: 'https://demotiles.maplibre.org/style.json',
  center: [0, 0] as [number, number],
  zoom: 2,
};

describe('issue #124: core-only VMap with @deck.gl/mapbox absent', () => {
  beforeEach(() => {
    const container = document.createElement('div');
    container.id = 'map';
    document.body.appendChild(container);
  });

  it('does not attempt the peer import (no overlay-init error logged)', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const wrapper = mount(VMap, { props: { options: defaultMapOptions } });
    await vi.dynamicImportSettled();
    await wrapper.vm.$nextTick();

    const overlayErrors = errorSpy.mock.calls.filter((args) =>
      String(args[0]).includes('[deck.gl] Error initializing overlay:'),
    );
    expect(overlayErrors).toHaveLength(0);

    errorSpy.mockRestore();
  });
});
