/**
 * `@geoql/v-maplibre/lidar` subpath entry.
 *
 * LiDAR point-cloud control (COPC/LAZ streaming). Requires `maplibre-gl-lidar`:
 *
 * `pnpm add maplibre-gl-lidar`
 */
export { LidarControl as VControlLidar } from './controls/lidar';
export type {
  LidarControlOptions,
  ColorScheme,
  ColorSchemeType,
  ColorSchemeConfig,
  CopcLoadingMode,
  ColormapName,
  ColorRangeConfig,
  PointCloudInfo,
  PointCloudBounds,
  StreamingProgress,
  StreamingLoaderOptions,
  LidarLoadEventData,
  LidarErrorEventData,
  LidarUnloadEventData,
} from './controls/lidar';
