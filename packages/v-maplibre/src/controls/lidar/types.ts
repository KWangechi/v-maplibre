export type { ControlPosition } from 'maplibre-gl';

/** Color scheme preset types */
export type ColorSchemeType =
  | 'elevation'
  | 'intensity'
  | 'classification'
  | 'rgb';

/** Custom color scheme configuration */
export interface ColorSchemeConfig {
  type: 'gradient' | 'categorical';
  attribute: string;
  colors?: string[];
  domain?: [number, number];
}

/** Color scheme can be a preset string or custom configuration */
export type ColorScheme = ColorSchemeType | ColorSchemeConfig;

/** COPC loading mode options */
export type CopcLoadingMode = 'full' | 'dynamic';

/** Available colormap names (matplotlib-style) */
export type ColormapName =
  | 'viridis'
  | 'plasma'
  | 'inferno'
  | 'magma'
  | 'cividis'
  | 'turbo'
  | 'jet'
  | 'rainbow'
  | 'terrain'
  | 'coolwarm'
  | 'gray';

/** Configuration for color range mapping */
export interface ColorRangeConfig {
  /** Mode for determining color range bounds */
  mode: 'percentile' | 'absolute';
  /** Lower percentile bound (used when mode is 'percentile') */
  percentileLow: number;
  /** Upper percentile bound (used when mode is 'percentile') */
  percentileHigh: number;
  /** Absolute minimum value (used when mode is 'absolute') */
  absoluteMin?: number;
  /** Absolute maximum value (used when mode is 'absolute') */
  absoluteMax?: number;
}

export interface PointCloudBounds {
  minX: number;
  minY: number;
  minZ: number;
  maxX: number;
  maxY: number;
  maxZ: number;
}

export interface PointCloudInfo {
  id: string;
  name: string;
  pointCount: number;
  bounds: PointCloudBounds;
  hasRGB: boolean;
  hasIntensity: boolean;
  hasClassification: boolean;
  source: string;
  wkt?: string;
}

export interface StreamingProgress {
  loadedNodes: number;
  loadedPoints: number;
  queueSize: number;
  isLoading: boolean;
}

/** Options for streaming loaders (COPC/EPT) */
export interface StreamingLoaderOptions {
  pointBudget?: number;
  maxConcurrentRequests?: number;
  viewportDebounceMs?: number;
}

export interface LidarControlOptions {
  /** Start collapsed (default: true) */
  collapsed?: boolean;
  /** Panel title (default: 'LiDAR Viewer') */
  title?: string;
  /** Panel width in pixels (default: 320) */
  panelWidth?: number;
  /** Panel max height with scrollbar (default: 500) */
  maxHeight?: number;
  /** Custom CSS class */
  className?: string;

  /** Point size in pixels (default: 2) */
  pointSize?: number;
  /** Opacity 0-1 (default: 1.0) */
  opacity?: number;
  /** Color scheme (default: 'elevation') */
  colorScheme?: ColorScheme;
  /** Use 2-98% percentile for coloring (default: true) @deprecated Use colorRange instead */
  usePercentile?: boolean;
  /** Colormap for elevation/intensity coloring (default: 'viridis') */
  colormap?: ColormapName;
  /** Color range mapping configuration */
  colorRange?: ColorRangeConfig;
  /** Show the colorbar legend (default: true) */
  showColorbar?: boolean;
  /** Max points to display (default: 1000000) */
  pointBudget?: number;

  /** Elevation filter range */
  elevationRange?: [number, number] | null;
  /** Enable Z offset adjustment (default: false) */
  zOffsetEnabled?: boolean;
  /** Z offset in meters (default: 0) */
  zOffset?: number;
  /** Auto-calculate Z offset from 2% percentile (default: true) */
  autoZOffset?: boolean;

  /** Enable point picking/hover tooltips (default: false) */
  pickable?: boolean;
  /** Fields to show in tooltip (default: all) */
  pickInfoFields?: string[];

  /** Auto zoom to data after loading (default: true) */
  autoZoom?: boolean;

  /** Loading mode for COPC files (default: 'full') */
  copcLoadingMode?: CopcLoadingMode;
  /** Enable 3D terrain (default: false) */
  terrainEnabled?: boolean;
  /** Terrain exaggeration factor (default: 1.0) */
  terrainExaggeration?: number;
  /** Max points for streaming (default: 5000000) */
  streamingPointBudget?: number;
  /** Concurrent node requests (default: 4) */
  streamingMaxConcurrentRequests?: number;
  /** Viewport change debounce (default: 150) */
  streamingViewportDebounceMs?: number;
}

/**
 * Display name and colour overrides per ASPRS classification code, for
 * example custom classes (64-255) from an annotation tool. A code without an
 * entry keeps its standard name and colour. Requires maplibre-gl-lidar 0.19+.
 */
export type ClassificationStyles = Record<
  number,
  { name?: string; color?: [number, number, number] }
>;

/** A picked LiDAR point (the `point` of a `pointclick` event). */
export interface PickedPointInfo {
  /** Id of the point cloud the point belongs to */
  pointCloudId?: string;
  /** Point index within the point cloud */
  index: number;
  longitude: number;
  latitude: number;
  /** Elevation in meters */
  elevation: number;
  /** Intensity (0-1) if available */
  intensity?: number;
  /** ASPRS classification code if available */
  classification?: number;
  red?: number;
  green?: number;
  blue?: number;
  /** Every extra attribute available for this point */
  attributes?: Record<string, number>;
  /** Screen X coordinate */
  x: number;
  /** Screen Y coordinate */
  y: number;
}

/** Payload of the `pointclick` event (maplibre-gl-lidar 0.21+). */
export interface LidarPointClickEventData {
  point?: PickedPointInfo;
}

/** Result of `loadRegion`: how much of the cloud is now pinned. */
export interface LidarRegionLoadResult {
  nodes: number;
  points: number;
}

export interface LidarLoadEventData {
  pointCloud: PointCloudInfo;
}

export interface LidarErrorEventData {
  error: Error;
}

export interface LidarUnloadEventData {
  pointCloud: { id: string };
}
