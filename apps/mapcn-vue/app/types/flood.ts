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

export type GoogleFloodSeverity =
  | 'FLOOD_SEVERITY_UNSPECIFIED'
  | 'UNKNOWN'
  | 'NO_FLOODING'
  | 'ABOVE_NORMAL'
  | 'SEVERE'
  | 'EXTREME';

export interface GoogleGaugeLocation {
  latitude: number;
  longitude: number;
}

export interface GoogleGaugeQualityInfo {
  qualityVerified: boolean;
}

export interface GoogleGauge {
  gaugeId: string;
  location: GoogleGaugeLocation;
  gaugeQualityInfo: GoogleGaugeQualityInfo;
  riverId?: string;
  riverName?: string;
  stationName?: string;
  countryCode?: string;
}

export interface GoogleGaugesSearchResponse {
  gauges: GoogleGauge[];
  nextPageToken?: string;
}

export interface GoogleInundationMap {
  severity: GoogleFloodSeverity;
  serializedPolygonId: string;
}

export interface GoogleInundationMapSet {
  inundationMaps: GoogleInundationMap[];
}

export interface GoogleNotificationPolygon {
  serializedPolygonId: string;
}

export interface GoogleNotificationPolygonSet {
  notificationPolygons: GoogleNotificationPolygon[];
}

export interface GoogleFloodStatus {
  gaugeId: string;
  gauge: GoogleGauge;
  issuedTime: string;
  severity: GoogleFloodSeverity;
  inundationMapSet?: GoogleInundationMapSet;
  notificationPolygonSet?: GoogleNotificationPolygonSet;
}

export interface GoogleFloodStatusResponse {
  floodStatuses: GoogleFloodStatus[];
  nextPageToken?: string;
}

export interface GoogleForecastIntervalSummary {
  forecastInterval: GoogleFloodEventInterval;
  severity: GoogleFloodSeverity;
}

export interface GoogleForecastSummary {
  severity: GoogleFloodSeverity;
  forecastTimeIntervalSummaries: GoogleForecastIntervalSummary[];
}

export interface GoogleGaugeForecast {
  gaugeId: string;
  issuedTime: string;
  forecastSummary: GoogleForecastSummary;
}

export interface GoogleGaugeForecastsResponse {
  gaugeForecasts: GoogleGaugeForecast[];
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
  nextPageToken?: string;
}

export interface ParsedFloodPolygon {
  gaugeId: string;
  severity: GoogleFloodSeverity;
  coordinates: [number, number][][];
  serializedPolygonId: string;
}

export interface FloodMarker {
  gaugeId: string;
  coordinates: [number, number];
  severity: GoogleFloodSeverity;
  stationName: string;
  riverId?: string;
  riverName?: string;
  issuedTime: string;
  hasInundationMap: boolean;
}

export interface SelectedGauge {
  gaugeId: string;
  coordinates: [number, number];
  severity: GoogleFloodSeverity;
  stationName: string;
  riverId?: string;
  riverName?: string;
  issuedTime: string;
  hasInundationMap: boolean;
  forecast?: GoogleGaugeForecast;
  forecastLoading: boolean;
}

export interface FloodRegion {
  code: string;
  name: string;
  center: [number, number];
  zoom: number;
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
