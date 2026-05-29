export type VesselType = 'tanker' | 'cargo' | 'container' | 'patrol';

export interface VesselPosition {
  lng: number;
  lat: number;
  vesselId: string;
  type: VesselType;
}

export interface StsEvent {
  id: string;
  midpointLng: number;
  midpointLat: number;
  vessel1Name: string;
  vessel2Name: string;
  risk: number;
}

export interface Chokepoint {
  id: string;
  name: string;
  center: [number, number];
  zoom: number;
  lane: [number, number][];
}

export interface ChokepointStats {
  totalVessels: number;
  densityPeak: number;
  stsEvents: number;
  activeChokepoint: string;
}

export interface StsEventDatum {
  lng: number;
  lat: number;
  id: string;
  vessel1Name: string;
  vessel2Name: string;
  risk: number;
}

export interface LanePathDatum {
  path: [number, number][];
}
