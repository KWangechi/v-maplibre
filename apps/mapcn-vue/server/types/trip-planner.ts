export interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: {
    name?: string;
    tourism?: string;
    amenity?: string;
    cuisine?: string;
    stars?: string;
    opening_hours?: string;
    website?: string;
    [key: string]: string | undefined;
  };
}

export interface OverpassResponse {
  elements: OverpassElement[];
}

export interface Activity {
  name: string;
  type: 'Attraction' | 'Dining';
  time: string;
  coordinates: [number, number];
}

export interface DayPlan {
  day: number;
  title: string;
  activities: Activity[];
  stay: { name: string; price: string; coordinates: [number, number] };
}

export interface TripResponse {
  title: string;
  duration: string;
  budget: string;
  highlights: { name: string; coordinates: [number, number] }[];
  days: DayPlan[];
  routeWaypoints: [number, number][];
}

export interface Waypoint {
  name: string;
  lat: number;
  lon: number;
}
