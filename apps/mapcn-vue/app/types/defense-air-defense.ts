export type RadarTier = 'shorad' | 'mrsam' | 'lrsam';
export type AltitudeLayer = 'low' | 'mid' | 'high';

export interface RadarSite {
  id: string;
  label: string;
  position: [number, number];
  tier: RadarTier;
  range: number; // km
  color: [number, number, number];
}

export interface RadarTierConfig {
  tier: RadarTier;
  label: string;
  icon: string;
  range: number; // km
  color: [number, number, number];
  altitudes: AltitudeLayer[];
}

export interface CoveragePolygon {
  siteId: string;
  tier: RadarTier;
  polygon: [number, number][];
  color: [number, number, number, number];
}

export interface SweepLineDatum {
  siteId: string;
  sourcePosition: [number, number];
  targetPosition: [number, number];
  color: [number, number, number, number];
}

export interface SiteDatum {
  lng: number;
  lat: number;
  siteId: string;
  color: [number, number, number];
  tier: RadarTier;
}

export interface SiteLabelDatum {
  position: [number, number];
  text: string;
}

export interface AirDefenseStats {
  totalSites: number;
  activeTiers: number;
  coverageAreaKm2: number;
  gapCount: number;
}
