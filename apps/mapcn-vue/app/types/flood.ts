export interface GdacsFloodSeverity {
  severity: number;
  severitytext: string;
  severityunit: string;
}

export interface GdacsAffectedCountry {
  iso2: string;
  iso3: string;
  countryname: string;
}

export interface GdacsFloodProperties {
  eventtype: string;
  eventid: number;
  episodeid: number;
  name: string;
  description: string;
  alertlevel: 'Green' | 'Orange' | 'Red';
  alertscore: number;
  country: string;
  fromdate: string;
  todate: string;
  iscurrent: string;
  iso3: string;
  source: string;
  severitydata: GdacsFloodSeverity;
  affectedcountries: GdacsAffectedCountry[];
}

export interface GdacsFloodFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: GdacsFloodProperties;
}

export interface GdacsFloodGeoJSON {
  type: 'FeatureCollection';
  features: GdacsFloodFeature[];
}

export interface GoogleFloodEventInterval {
  startTime: string;
  endTime: string;
}

export interface GoogleSignificantEvent {
  eventInterval: GoogleFloodEventInterval;
  affectedCountryCodes: string[];
  affectedPopulation: number;
  areaKm2: number;
  gaugeIds: string[];
  eventPolygonId: string;
}

export interface GoogleSignificantEventsResponse {
  significantEvents: GoogleSignificantEvent[];
}

export interface FloodEvent {
  coordinates: [number, number];
  name: string;
  country: string;
  alertLevel: 'green' | 'orange' | 'red';
  alertScore: number;
  fromDate: string;
  toDate: string;
  isCurrent: boolean;
  severity: number;
  severityText: string;
  source: string;
  eventId: number;
  affectedCountries: string[];
}

/** Tuple format: [longitude, latitude, area_km2, startYear] */
export type FloodPoint = [number, number, number, number];

export interface GroundsourceResponse {
  total: number;
  nextCursor: number | null;
  data: FloodPoint[];
}

export type FloodSeverity = 'major' | 'significant' | 'moderate' | 'localized';

export interface SelectedFloodPoint {
  coordinates: [number, number];
  areaKm2: number;
  severity: FloodSeverity;
  year: number;
  locationName: string | null;
  locationLoading: boolean;
}

export interface ReverseGeocodeResult {
  name: string;
  address: Record<string, string | undefined> | null;
  displayName: string | null;
}

export interface FloodYearRange {
  min: number;
  max: number;
}
