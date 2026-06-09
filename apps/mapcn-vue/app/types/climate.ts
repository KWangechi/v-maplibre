import type { Feature, FeatureCollection, MultiPolygon } from 'geojson';

// ---------------------------------------------------------------------------
// Köppen-Geiger climate classification
// ---------------------------------------------------------------------------

/** Numeric ID used as pixel value in the Beck raster and in GeoJSON properties. */
export type KoppenClassId = number;

export interface KoppenClass {
  /** Abbreviation, e.g. "Cfa" */
  symbol: string;
  /** Human-readable name, e.g. "Temperate, no dry season, hot summer" */
  name: string;
  /** CSS-compatible color string, e.g. "rgb(200, 255, 80)" */
  color: string;
}

/** Index from class ID (1..30) to Köppen metadata. */
export type KoppenClassesIndex = Record<KoppenClassId, KoppenClass>;

// ---------------------------------------------------------------------------
// GeoJSON feature types
// ---------------------------------------------------------------------------

export interface ZoneFeatureProperties {
  iso3: string;
  name: string;
  koppen_class: number;
  area_km2: number;
}

export type ZoneFeature = Feature<MultiPolygon, ZoneFeatureProperties>;

export type ZoneFeatureCollection = FeatureCollection<
  MultiPolygon,
  ZoneFeatureProperties
>;

// ---------------------------------------------------------------------------
// Exemplar types (per-class top countries by area)
// ---------------------------------------------------------------------------

export interface Exemplar {
  iso3: string;
  name: string;
  area_km2: number;
}

/** Per-class ranked list (top 8 by area). */
export type ExemplarsByClass = Record<KoppenClassId, Exemplar[]>;

// ---------------------------------------------------------------------------
// Country indexing
// ---------------------------------------------------------------------------

export interface CountryEntry {
  name: string;
  features: ZoneFeature[];
}

export type CountriesByIso = Map<string, CountryEntry>;

export interface CountryBreakdown {
  name: string;
  total: number; // total area_km2
  /** Top-3 climate classes by area fraction, sorted descending. */
  top: CountryTopClass[];
}

export interface CountryTopClass {
  klass: KoppenClassId;
  fraction: number;
}

// ---------------------------------------------------------------------------
// Per-country selection state
// ---------------------------------------------------------------------------

export interface ClassState {
  exemplars: Exemplar[];
  /** Current shuffle offset into exemplars (user intent). */
  index: number;
}

export interface ClassContext {
  exemplar: Exemplar;
  /** Share of selected country's total area. */
  fraction: number;
  /** Next 3 runners-up for display. */
  runnersUp: Exemplar[];
}

/** "Part" = one connected component (island, territory, etc.) of a zone. */
export interface PartCandidate {
  klass: KoppenClassId;
  /** polylabel anchor [lng, lat]. */
  anchor: [number, number];
  partArea: number;
  featureTotal: number;
  featureParts: number;
}

export interface LabelCluster {
  klass: KoppenClassId;
  anchor: [number, number];
  totalArea: number;
  partCount: number;
}

export interface RegionLabel {
  klass: KoppenClassId;
  anchor: [number, number];
  /** Country name to display ("Climate of …"). */
  exemplarName: string;
  /** Priority for collision pass: 1 = top-3 class, 0 = rest. */
  prio: boolean;
}

// ---------------------------------------------------------------------------
// Treemap
// ---------------------------------------------------------------------------

export interface TreemapCell {
  klass: KoppenClassId;
  fraction: number;
  x: number;
  y: number;
  w: number;
  h: number;
  tiny: boolean;
}

// ---------------------------------------------------------------------------
// Top-level selection state
// ---------------------------------------------------------------------------

export interface SelectedCountry {
  iso: string;
  name: string;
  features: ZoneFeature[];
  /** Per-class shuffle state. */
  classes: Map<KoppenClassId, ClassState>;
  /** Computed per-class labels (greedy dedupe applied). */
  context: Map<KoppenClassId, ClassContext>;
  /** Cached part candidates for label placement. */
  partCandidates: PartCandidate[] | null;
}

// ---------------------------------------------------------------------------
// Hover state
// ---------------------------------------------------------------------------

export interface HoverState {
  iso: string;
  klass: KoppenClassId;
  lngLat: { lng: number; lat: number };
}

// ---------------------------------------------------------------------------
// Detail view state
// ---------------------------------------------------------------------------

export interface DetailView {
  klass: KoppenClassId;
}
