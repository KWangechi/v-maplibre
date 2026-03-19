<script setup lang="ts">
  /**
   * VLayerDeckglMosaic - Client-side COG mosaic layer for STAC items
   *
   * Uses @developmentseed/deck.gl-geotiff v0.2.0 MosaicLayer for efficient
   * client-side rendering of multiple COGs from STAC APIs.
   *
   * @see https://github.com/developmentseed/deck.gl-raster/blob/main/examples/naip-mosaic/src/App.tsx
   */
  import {
    onMounted,
    onBeforeUnmount,
    watch,
    shallowRef,
    markRaw,
    toRaw,
  } from 'vue';
  import type { Color, PickingInfo } from '@deck.gl/core';
  import type { GeoTIFF } from '@developmentseed/geotiff';
  import type { Texture } from '@luma.gl/core';
  import type { RasterModule } from '@developmentseed/deck.gl-raster';
  import type {
    EpsgResolver,
    MosaicLayerProps,
    MosaicSource as BaseMosaicSource,
  } from '@developmentseed/deck.gl-geotiff';
  import { injectStrict, MapKey } from '../../../utils';
  import { useDeckOverlay } from '../_shared/useDeckOverlay';

  /**
   * A STAC-like item with bounding box and COG asset URL
   * Extends the base MosaicSource from deck.gl-geotiff with asset info
   */
  export interface MosaicSource extends BaseMosaicSource {
    /** Asset containing the COG URL */
    assets: {
      image: { href: string };
    };
  }

  /**
   * Render mode for the mosaic layer
   */
  export type MosaicRenderMode = 'trueColor' | 'falseColor' | 'ndvi' | 'custom';

  /**
   * Custom render module for advanced band manipulation
   */
  export interface RenderModule {
    module: { name: string; inject?: Record<string, string> };
    props?: Record<string, unknown>;
  }

  interface Props {
    id: string;
    /**
     * Array of STAC-like items with bbox and COG asset URLs
     */
    sources: MosaicSource[];
    /**
     * Render mode: trueColor (RGB), falseColor (NIR-R-G), ndvi (with colormap)
     */
    renderMode?: MosaicRenderMode;
    /**
     * Custom render modules (only used when renderMode is 'custom')
     */
    customRenderModules?: (texture: Texture) => RenderModule[];
    /**
     * Custom colormap data for NDVI (Uint8ClampedArray of RGBA values, 256 colors)
     * @reserved Currently not implemented - NDVI uses built-in cfastie colormap.
     */
    colormapData?: Uint8ClampedArray;
    /**
     * Maximum number of tiles to cache
     */
    maxCacheSize?: number;
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
     * NDVI range filter: pixels outside [min, max] are discarded.
     * Only applies when renderMode is 'ndvi'. Range: [-1, 1].
     */
    ndviRange?: [number, number];
    /**
     * Insert layer before this layer id
     */
    beforeId?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    renderMode: 'trueColor',
    maxCacheSize: Infinity,
    opacity: 1,
    visible: true,
    pickable: false,
    autoHighlight: false,
    ndviRange: () => [-1, 1] as [number, number],
  });

  const emit = defineEmits<{
    click: [info: PickingInfo];
    hover: [info: PickingInfo];
    sourceLoad: [source: MosaicSource];
    error: [error: Error, source?: MosaicSource];
  }>();

  const map = injectStrict(MapKey);
  const { addLayer, removeLayer, updateLayer } = useDeckOverlay(map);

  interface LoadedModules {
    MosaicLayer: typeof import('@developmentseed/deck.gl-geotiff').MosaicLayer;
    COGLayer: typeof import('@developmentseed/deck.gl-geotiff').COGLayer;
    CreateTexture: RasterModule['module'];
    fromUrl: typeof GeoTIFF.fromUrl;
    resolveEpsg: EpsgResolver;
  }

  const modules = shallowRef<LoadedModules | null>(null);

  // Shader modules for different render modes
  const SetAlpha1 = {
    name: 'set-alpha-1',
    inject: { 'fs:DECKGL_FILTER_COLOR': `color = vec4(color.rgb, 1.0);` },
  };

  const FalseColorInfrared = {
    name: 'false-color-infrared',
    inject: {
      'fs:DECKGL_FILTER_COLOR': `
        float nir = color[3];
        float red = color[0];
        float green = color[1];
        color.rgb = vec3(nir, red, green);
      `,
    },
  };

  // NDVI with built-in colormap (cfastie-inspired gradient)
  // This applies the colormap directly in the shader for reliability
  const NDVIWithColormap = {
    name: 'ndvi-with-colormap',
    inject: {
      'fs:DECKGL_FILTER_COLOR': `
        float nir = color[3];
        float red = color[0];
        float sum = nir + red;
        
        // Prevent division by zero
        float ndvi = sum > 0.001 ? (nir - red) / sum : 0.0;
        
        // Normalize from [-1, 1] to [0, 1]
        float t = clamp((ndvi + 1.0) / 2.0, 0.0, 1.0);
        
        // Cfastie-inspired colormap gradient
        // Low NDVI (water/bare): blue/cyan -> Mid (sparse): yellow -> High (vegetation): green
        vec3 result;
        if (t < 0.4) {
          // Water/bare soil: blue to cyan (NDVI < -0.2)
          float localT = t / 0.4;
          result = mix(vec3(0.0, 0.0, 0.5), vec3(0.5, 0.8, 0.9), localT);
        } else if (t < 0.5) {
          // Bare/sparse: cyan to yellow (NDVI -0.2 to 0)
          float localT = (t - 0.4) / 0.1;
          result = mix(vec3(0.5, 0.8, 0.9), vec3(0.9, 0.9, 0.4), localT);
        } else if (t < 0.6) {
          // Sparse vegetation: yellow to light green (NDVI 0 to 0.2)
          float localT = (t - 0.5) / 0.1;
          result = mix(vec3(0.9, 0.9, 0.4), vec3(0.6, 0.8, 0.2), localT);
        } else if (t < 0.75) {
          // Moderate vegetation: light green to green (NDVI 0.2 to 0.5)
          float localT = (t - 0.6) / 0.15;
          result = mix(vec3(0.6, 0.8, 0.2), vec3(0.1, 0.6, 0.1), localT);
        } else {
          // Dense vegetation: green to dark green (NDVI > 0.5)
          float localT = (t - 0.75) / 0.25;
          result = mix(vec3(0.1, 0.6, 0.1), vec3(0.0, 0.3, 0.0), localT);
        }
        
        color.rgb = result;
      `,
    },
  };

  const NDVI_FILTER_MODULE_NAME = 'ndviRangeFilter';

  const ndviFilterUniformBlock = `\
uniform ${NDVI_FILTER_MODULE_NAME}Uniforms {
  float ndviMin;
  float ndviMax;
} ${NDVI_FILTER_MODULE_NAME};
`;

  const NDVIRangeFilter = {
    name: NDVI_FILTER_MODULE_NAME,
    fs: ndviFilterUniformBlock,
    inject: {
      'fs:DECKGL_FILTER_COLOR': `
        float filter_nir = color[3];
        float filter_red = color[0];
        float filter_sum = filter_nir + filter_red;
        float filter_ndvi = filter_sum > 0.001 ? (filter_nir - filter_red) / filter_sum : 0.0;
        if (filter_ndvi < ${NDVI_FILTER_MODULE_NAME}.ndviMin || filter_ndvi > ${NDVI_FILTER_MODULE_NAME}.ndviMax) {
          discard;
        }
      `,
    },
    defaultUniforms: {
      ndviMin: -1,
      ndviMax: 1,
    },
  };

  /**
   * Get render modules based on render mode
   */
  function getRenderModules(
    mode: MosaicRenderMode,
    texture: Texture,
    mods: {
      CreateTexture: RasterModule['module'];
    },
    ndviRange: [number, number],
    customModules?: (texture: Texture) => RenderModule[],
  ): RasterModule[] {
    if (mode === 'custom' && customModules) {
      return customModules(texture) as RasterModule[];
    }

    const base: RasterModule[] = [
      { module: mods.CreateTexture, props: { textureName: texture } },
    ];

    if (mode === 'trueColor') {
      return [...base, { module: SetAlpha1 }];
    }

    if (mode === 'falseColor') {
      return [...base, { module: FalseColorInfrared }, { module: SetAlpha1 }];
    }

    return [
      ...base,
      {
        module: NDVIRangeFilter,
        props: { ndviMin: ndviRange[0], ndviMax: ndviRange[1] },
      },
      { module: NDVIWithColormap },
      { module: SetAlpha1 },
    ];
  }

  function createLayer() {
    const mods = modules.value;
    if (!mods || !props.sources.length) return null;

    const { MosaicLayer, COGLayer, CreateTexture, fromUrl, resolveEpsg } = mods;

    const rawSources = toRaw(props.sources);
    const renderMode = toRaw(props.renderMode);
    const ndviRange = toRaw(props.ndviRange) ?? ([-1, 1] as [number, number]);
    const customRenderModules = props.customRenderModules;

    const layer = new MosaicLayer<MosaicSource, GeoTIFF>({
      id: toRaw(props.id),
      sources: rawSources,
      maxCacheSize: toRaw(props.maxCacheSize),

      getSource: async (source) => {
        try {
          const tiff = await fromUrl(source.assets.image.href);
          emit('sourceLoad', source);
          return tiff;
        } catch (error) {
          emit('error', error as Error, source);
          throw error;
        }
      },

      renderSource: (source, { data, signal }) => {
        if (!data) return null;

        return new COGLayer({
          id: `cog-${source.assets.image.href}-${renderMode}`,
          geotiff: data,
          epsgResolver: resolveEpsg,
          renderTile: (tileData) =>
            getRenderModules(
              renderMode,
              tileData.texture,
              { CreateTexture },
              ndviRange,
              customRenderModules,
            ),
          signal,
        });
      },
    } as MosaicLayerProps<MosaicSource, GeoTIFF>);

    return markRaw(layer);
  }

  async function initializeLayer() {
    try {
      const [geotiffModule, rasterModule, devGeotiff] = await Promise.all([
        import('@developmentseed/deck.gl-geotiff'),
        import('@developmentseed/deck.gl-raster/gpu-modules'),
        import('@developmentseed/geotiff'),
      ]);

      modules.value = markRaw({
        MosaicLayer: geotiffModule.MosaicLayer,
        COGLayer: geotiffModule.COGLayer,
        CreateTexture: rasterModule.CreateTexture,
        fromUrl: devGeotiff.GeoTIFF.fromUrl,
        resolveEpsg: geotiffModule.epsgResolver,
      });

      const layer = createLayer();
      if (layer) {
        addLayer(layer);
      }
    } catch (error) {
      console.error('[deck.gl-mosaic] Error loading MosaicLayer:', error);
      console.error(
        'Make sure @developmentseed/deck.gl-geotiff, @developmentseed/deck.gl-raster, and @developmentseed/geotiff are installed',
      );
      emit('error', error as Error);
    }
  }

  onMounted(() => {
    if (map.value?.isStyleLoaded()) {
      initializeLayer();
    } else {
      map.value?.once('style.load', initializeLayer);
    }
  });

  watch(
    () => [
      props.sources,
      props.renderMode,
      props.ndviRange,
      props.opacity,
      props.visible,
    ],
    () => {
      if (modules.value) {
        const layer = createLayer();
        if (layer) {
          updateLayer(props.id, layer);
        }
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
