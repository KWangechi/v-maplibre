export interface GroundsourceRow {
  id: number;
  lon: number;
  lat: number;
  area_km2: number;
  start_year: number;
}

export interface GroundsourceApiResponse {
  total: number;
  nextCursor: number | null;
  data: [number, number, number, number][];
}
