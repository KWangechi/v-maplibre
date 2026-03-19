<script setup lang="ts">
  import {
    onMounted,
    onBeforeUnmount,
    watch,
    shallowRef,
    toRaw,
    markRaw,
  } from 'vue';
  import type { Color, PickingInfo } from '@deck.gl/core';
  import { injectStrict, MapKey } from '../../../utils';
  import { useDeckOverlay } from '../_shared/useDeckOverlay';

  interface Props {
    id: string;
    /**
     * GeoTIFF source - URL string, ArrayBuffer, Blob, or geotiff.js instance
     */
    geotiff: string | ArrayBuffer | Blob | object;
    /**
     * Tile size in pixels
     */
    tileSize?: number;
    /**
     * Maximum zoom level
     */
    maxZoom?: number;
    /**
     * Minimum zoom level
     */
    minZoom?: number;
    /**
     * Maximum number of tiles to cache
     */
    maxCacheSize?: number;
    /**
     * Refinement strategy for tile loading
     */
    refinementStrategy?: 'best-available' | 'no-overlap' | 'never';
    /**
     * Maximum concurrent requests
     */
    maxRequests?: number;
    /**
     * Layer opacity (0-1)
     */
    opacity?: number;
    /**
     * Layer visibility
     */
    visible?: boolean;
    /**
     * Enable picking on this layer
     */
    pickable?: boolean;
    /**
     * Auto highlight on hover
     */
    autoHighlight?: boolean;
    /**
     * Highlight color when autoHighlight is enabled
     */
    highlightColor?: Color;
    /**
     * Insert layer before this layer id
     */
    beforeId?: string;
    /**
     * Show debug overlay on tiles
     */
    debug?: boolean;
    /**
     * Opacity of debug overlay (0-1)
     */
    debugOpacity?: number;
  }

  const props = withDefaults(defineProps<Props>(), {
    tileSize: 256,
    minZoom: 0,
    refinementStrategy: 'best-available',
    maxRequests: 6,
    opacity: 1,
    visible: true,
    pickable: false,
    autoHighlight: false,
    debug: false,
    debugOpacity: 0.25,
  });

  const emit = defineEmits<{
    click: [info: PickingInfo];
    hover: [info: PickingInfo];
    geotiffLoad: [
      tiff: unknown,
      options: {
        geographicBounds: {
          west: number;
          south: number;
          east: number;
          north: number;
        };
      },
    ];
  }>();

  const map = injectStrict(MapKey);
  const { addLayer, removeLayer, updateLayer } = useDeckOverlay(map);

  // Store module references
  const COGLayerClass = shallowRef<
    typeof import('@developmentseed/deck.gl-geotiff').COGLayer | null
  >(null);
  const epsgResolverFn = shallowRef<
    typeof import('@developmentseed/deck.gl-geotiff').epsgResolver | null
  >(null);

  const createLayer = () => {
    if (!COGLayerClass.value) return null;

    // Use toRaw() to unwrap Vue reactive proxies - required for web worker serialization
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const layerProps: Record<string, any> = {
      id: toRaw(props.id),
      geotiff: toRaw(props.geotiff),
      opacity: toRaw(props.opacity),
      visible: toRaw(props.visible),
      pickable: toRaw(props.pickable),
      autoHighlight: toRaw(props.autoHighlight),
      debug: toRaw(props.debug),
      debugOpacity: toRaw(props.debugOpacity),
    };

    if (epsgResolverFn.value) {
      layerProps.epsgResolver = epsgResolverFn.value;
    }

    layerProps.onGeoTIFFLoad = (
      tiff: unknown,
      options: {
        geographicBounds: {
          west: number;
          south: number;
          east: number;
          north: number;
        };
      },
    ) => {
      emit('geotiffLoad', tiff, options);
    };

    if (props.tileSize !== 256) layerProps.tileSize = toRaw(props.tileSize);
    if (props.maxZoom !== undefined) layerProps.maxZoom = toRaw(props.maxZoom);
    if (props.minZoom !== 0) layerProps.minZoom = toRaw(props.minZoom);
    if (props.maxCacheSize !== undefined)
      layerProps.maxCacheSize = toRaw(props.maxCacheSize);
    if (props.refinementStrategy !== 'best-available')
      layerProps.refinementStrategy = toRaw(props.refinementStrategy);
    if (props.maxRequests !== 6)
      layerProps.maxRequests = toRaw(props.maxRequests);
    if (props.highlightColor !== undefined)
      layerProps.highlightColor = toRaw(props.highlightColor);
    if (props.beforeId !== undefined)
      layerProps.beforeId = toRaw(props.beforeId);

    const layer = new COGLayerClass.value(layerProps);
    return markRaw(layer);
  };

  const initializeLayer = async () => {
    try {
      const geotiffModule = await import('@developmentseed/deck.gl-geotiff');

      COGLayerClass.value = markRaw(geotiffModule.COGLayer);
      epsgResolverFn.value = geotiffModule.epsgResolver;

      const layer = createLayer();
      if (layer) {
        addLayer(layer);
      }
    } catch (error) {
      console.error('[deck.gl-raster] Error loading COGLayer:', error);
      console.error('Make sure @developmentseed/deck.gl-geotiff is installed');
    }
  };

  onMounted(() => {
    if (map.value?.isStyleLoaded()) {
      initializeLayer();
    } else {
      map.value?.once('style.load', initializeLayer);
    }
  });

  watch(
    () => [
      props.geotiff,
      props.tileSize,
      props.maxZoom,
      props.minZoom,
      props.opacity,
      props.visible,
      props.debug,
      props.debugOpacity,
    ],
    () => {
      const layer = createLayer();
      if (layer) {
        updateLayer(props.id, layer);
      }
    },
    { deep: true },
  );

  onBeforeUnmount(() => {
    removeLayer(props.id);
  });
</script>

<template>
  <slot></slot>
</template>
