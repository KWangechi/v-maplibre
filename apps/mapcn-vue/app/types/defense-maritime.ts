export type ShipType = 'naval' | 'merchant' | 'fishing' | 'suspicious';

export interface Ship {
  id: string;
  type: ShipType;
  callsign: string;
  color: [number, number, number];
  route: [number, number][];
}

export interface ShipPosition {
  lng: number;
  lat: number;
  heading: number;
  speed: number;
}

export interface CoastalRadar {
  id: string;
  name: string;
  position: [number, number];
  rangeKm: number;
}

export interface EezBoundary {
  polygon: [number, number][];
}

export interface MaritimeStats {
  totalShips: number;
  inEez: number;
  radarCoverage: number;
  suspicious: number;
}

export interface ShipPositionDatum {
  lng: number;
  lat: number;
  shipId: string;
  type: ShipType;
  selected: boolean;
}

export interface ShipLabelDatum {
  position: [number, number];
  text: string;
}

export interface RadarCircleDatum {
  polygon: [number, number][];
  name: string;
}

export interface TripDatum {
  shipId: string;
  path: [number, number][];
  timestamps: number[];
}
