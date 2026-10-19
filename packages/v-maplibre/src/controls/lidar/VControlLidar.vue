<script setup lang="ts">
  /**
   * COPC / LAZ point-cloud viewer control with streaming + colormap controls.
   *
   * @requires `maplibre-gl-lidar`
   *
   * Install with:
   * `pnpm add maplibre-gl-lidar`
   */
  import { onMounted, onUnmounted, ref, watch } from 'vue';
  import type { IControl } from 'maplibre-gl';
  import { MapKey, injectStrict, requirePeer } from '../../utils';
  import { lidarControlEvents as events } from './events';
  import type {
    ControlPosition,
    LidarControlOptions,
    ColorScheme,
    ColormapName,
    ColorRangeConfig,
    PointCloudInfo,
    StreamingLoaderOptions,
    CopcLoadingMode,
    ClassificationStyles,
    LidarRegionLoadResult,
  } from './types';

  const defaultOptions: LidarControlOptions = {
    collapsed: true,
    pointSize: 2,
    colorScheme: 'elevation',
    pickable: false,
    autoZoom: true,
  };

  const props = withDefaults(
    defineProps<{
      options?: LidarControlOptions;
      position?: ControlPosition;
      defaultUrl?: string;
      /**
       * Reactive name/colour overrides per classification code. Applies to
       * point colours, the legend and the tooltip. Requires
       * maplibre-gl-lidar 0.19+.
       */
      classificationStyles?: ClassificationStyles;
    }>(),
    {
      options: undefined,
      position: 'top-right',
      defaultUrl: undefined,
      classificationStyles: undefined,
    },
  );

  const emit = defineEmits(events);

  const map = injectStrict(MapKey);

  interface LidarControlInstance {
    on: (event: string, handler: (data?: unknown) => void) => void;
    off: (event: string, handler: (data?: unknown) => void) => void;
    loadPointCloud: (
      source: string | File | ArrayBuffer,
      options?: { loadingMode?: CopcLoadingMode },
    ) => Promise<PointCloudInfo>;
    loadPointCloudStreaming: (
      source: string | File | ArrayBuffer,
      options?: StreamingLoaderOptions,
    ) => Promise<PointCloudInfo>;
    loadPointCloudEptStreaming: (
      eptUrl: string,
      options?: StreamingLoaderOptions,
    ) => Promise<PointCloudInfo>;
    unloadPointCloud: (id?: string) => void;
    flyToPointCloud: (id?: string) => void;
    setPointSize: (size: number) => void;
    setOpacity: (opacity: number) => void;
    setColorScheme: (scheme: ColorScheme) => void;
    setColormap: (colormap: ColormapName) => void;
    getColormap: () => ColormapName;
    setColorRange: (config: ColorRangeConfig) => void;
    getColorRange: () => ColorRangeConfig;
    setUsePercentile: (use: boolean) => void;
    getUsePercentile: () => boolean;
    setPickable: (pickable: boolean) => void;
    setElevationRange: (min: number, max: number) => void;
    clearElevationRange: () => void;
    setPointBudget: (budget: number) => void;
    setZOffset: (offset: number) => void;
    setZOffsetEnabled: (enabled: boolean) => void;
    getZOffset: () => number;
    setTerrain: (enabled: boolean) => void;
    getTerrain: () => boolean;
    setPickInfoFields: (fields?: string[]) => void;
    getPickInfoFields: () => string[] | undefined;
    setClassificationVisibility: (code: number, visible: boolean) => void;
    showAllClassifications: () => void;
    hideAllClassifications: () => void;
    getHiddenClassifications: () => number[];
    getAvailableClassifications: () => number[];
    toggle: () => void;
    expand: () => void;
    collapse: () => void;
    getState: () => unknown;
    getPointClouds: () => PointCloudInfo[];
    stopStreaming: (id?: string) => void;
    isStreaming: (id?: string) => boolean;
    getStreamingProgress: () => unknown;
    getMap: () => unknown;
    getPanelElement: () => HTMLElement | null;
    // maplibre-gl-lidar 0.18+
    pauseStreaming: (id: string) => boolean;
    resumeStreaming: (id: string) => void;
    isStreamingLoading: (id: string) => boolean;
    // maplibre-gl-lidar 0.19+
    setClassificationStyles: (styles: ClassificationStyles) => void;
    getClassificationStyles: () => ClassificationStyles;
    // maplibre-gl-lidar 0.20+
    loadRegion: (
      id: string,
      bounds: [number, number, number, number],
      options?: { maxPoints?: number },
    ) => Promise<LidarRegionLoadResult>;
    clearPinnedRegion: (id: string) => void;
  }

  const control = ref<LidarControlInstance | null>(null);

  onMounted(async () => {
    await addControl();
  });

  onUnmounted(() => {
    if (control.value && map.value) {
      map.value.removeControl(control.value as unknown as IControl);
      control.value = null;
    }
  });

  const addControl = async (): Promise<void> => {
    const { LidarControl } = await requirePeer(
      'maplibre-gl-lidar',
      () => import('maplibre-gl-lidar'),
    );

    control.value = new LidarControl(
      props.options || defaultOptions,
    ) as unknown as LidarControlInstance;

    map.value!.addControl(control.value as unknown as IControl, props.position);

    const instance = control.value;
    events.forEach((event: string) => {
      instance.on(event, (data?: unknown) => {
        emit(event, data);
      });
    });

    if (props.classificationStyles) {
      instance.setClassificationStyles(props.classificationStyles);
    }

    if (props.defaultUrl) {
      control.value.loadPointCloud(props.defaultUrl);
    }
  };

  watch(
    () => props.classificationStyles,
    (styles) => {
      control.value?.setClassificationStyles(styles ?? {});
    },
    { deep: true },
  );

  defineExpose({
    loadPointCloud: (
      source: string | File | ArrayBuffer,
      options?: { loadingMode?: CopcLoadingMode },
    ) => control.value?.loadPointCloud(source, options),
    loadPointCloudStreaming: (
      source: string | File | ArrayBuffer,
      options?: StreamingLoaderOptions,
    ) => control.value?.loadPointCloudStreaming(source, options),
    loadPointCloudEptStreaming: (
      eptUrl: string,
      options?: StreamingLoaderOptions,
    ) => control.value?.loadPointCloudEptStreaming(eptUrl, options),
    unloadPointCloud: (id?: string) => control.value?.unloadPointCloud(id),
    flyToPointCloud: (id?: string) => control.value?.flyToPointCloud(id),
    setPointSize: (size: number) => control.value?.setPointSize(size),
    setColorScheme: (scheme: ColorScheme) =>
      control.value?.setColorScheme(scheme),
    setColormap: (colormap: ColormapName) =>
      control.value?.setColormap(colormap),
    getColormap: () => control.value?.getColormap(),
    setColorRange: (config: ColorRangeConfig) =>
      control.value?.setColorRange(config),
    getColorRange: () => control.value?.getColorRange(),
    setOpacity: (opacity: number) => control.value?.setOpacity(opacity),
    setPickable: (pickable: boolean) => control.value?.setPickable(pickable),
    setUsePercentile: (use: boolean) => control.value?.setUsePercentile(use),
    getUsePercentile: () => control.value?.getUsePercentile(),
    setElevationRange: (min: number, max: number) =>
      control.value?.setElevationRange(min, max),
    clearElevationRange: () => control.value?.clearElevationRange(),
    setPointBudget: (budget: number) => control.value?.setPointBudget(budget),
    setZOffset: (offset: number) => control.value?.setZOffset(offset),
    setZOffsetEnabled: (enabled: boolean) =>
      control.value?.setZOffsetEnabled(enabled),
    getZOffset: () => control.value?.getZOffset(),
    setTerrain: (enabled: boolean) => control.value?.setTerrain(enabled),
    getTerrain: () => control.value?.getTerrain(),
    setPickInfoFields: (fields?: string[]) =>
      control.value?.setPickInfoFields(fields),
    getPickInfoFields: () => control.value?.getPickInfoFields(),
    setClassificationVisibility: (code: number, visible: boolean) =>
      control.value?.setClassificationVisibility(code, visible),
    showAllClassifications: () => control.value?.showAllClassifications(),
    hideAllClassifications: () => control.value?.hideAllClassifications(),
    getHiddenClassifications: () => control.value?.getHiddenClassifications(),
    getAvailableClassifications: () =>
      control.value?.getAvailableClassifications(),
    toggle: () => control.value?.toggle(),
    expand: () => control.value?.expand(),
    collapse: () => control.value?.collapse(),
    getState: () => control.value?.getState(),
    getPointClouds: () => control.value?.getPointClouds(),
    stopStreaming: (id?: string) => control.value?.stopStreaming(id),
    isStreaming: (id?: string) => control.value?.isStreaming(id),
    getStreamingProgress: () => control.value?.getStreamingProgress(),
    getMap: () => control.value?.getMap(),
    getPanelElement: () => control.value?.getPanelElement(),
    pauseStreaming: (id: string) => control.value?.pauseStreaming(id),
    resumeStreaming: (id: string) => control.value?.resumeStreaming(id),
    isStreamingLoading: (id: string) => control.value?.isStreamingLoading(id),
    setClassificationStyles: (styles: ClassificationStyles) =>
      control.value?.setClassificationStyles(styles),
    getClassificationStyles: () => control.value?.getClassificationStyles(),
    loadRegion: (
      id: string,
      bounds: [number, number, number, number],
      options?: { maxPoints?: number },
    ) => control.value?.loadRegion(id, bounds, options),
    clearPinnedRegion: (id: string) => control.value?.clearPinnedRegion(id),
    getControl: () => control.value,
  });
</script>
