<script setup lang="ts">
  /**
   * Generic deck.gl layer wrapper — supply your own deck.gl Layer instance via the `layer` prop.
   *
   * @requires `@deck.gl/core`
   * @requires `@deck.gl/mapbox`
   *
   * Install with:
   * `pnpm add @deck.gl/core @deck.gl/mapbox`
   */
  import { onBeforeUnmount, watch } from 'vue';
  import type { PickingInfo } from '@deck.gl/core';
  import { injectStrict, MapKey } from '../../../utils';
  import { useDeckOverlay } from '../_shared/useDeckOverlay';

  interface Props {
    layer: unknown;
  }

  const props = defineProps<Props>();

  const emit = defineEmits<{
    click: [info: PickingInfo];
    hover: [info: PickingInfo];
  }>();

  const map = injectStrict(MapKey);
  const { addLayer, removeLayer, updateLayer } = useDeckOverlay(map);

  const getLayerId = (layer: unknown): string => {
    return (layer as { id: string }).id;
  };

  const initializeLayer = () => {
    addLayer(props.layer);
  };

  watch(
    map,
    (mapInstance) => {
      if (!mapInstance) return;
      // Register unconditionally once the map exists. addLayer() routes through
      // useDeckOverlay's initOverlay(), which robustly waits for style.load via
      // its own once-listener + polling. Gating here on isStyleLoaded() was racy:
      // if style.load already fired before this watch ran, the one-shot
      // .once('style.load') never fired and the layer was never registered.
      initializeLayer();
    },
    { immediate: true },
  );

  watch(
    () => props.layer,
    (newLayer, oldLayer) => {
      const oldId = oldLayer ? getLayerId(oldLayer) : null;
      const newId = getLayerId(newLayer);

      if (oldId && oldId !== newId) {
        removeLayer(oldId);
        addLayer(newLayer);
      } else {
        updateLayer(newId, newLayer);
      }
    },
    { deep: true },
  );

  onBeforeUnmount(() => {
    removeLayer(getLayerId(props.layer));
  });
</script>

<template>
  <slot></slot>
</template>
