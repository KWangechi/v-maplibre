export interface NominatimResponse {
  name?: string;
  display_name?: string;
  address?: {
    amenity?: string;
    tourism?: string;
    shop?: string;
    building?: string;
    road?: string;
    neighbourhood?: string;
    suburb?: string;
  };
}
