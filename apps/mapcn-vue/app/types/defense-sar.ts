export type SectorStatus = 'unsearched' | 'searching' | 'searched';

export interface SarSector {
  id: string;
  label: string;
  row: number;
  col: number;
  bounds: [number, number][]; // 5 points (closed polygon)
  probability: number; // 0–1
  status: SectorStatus;
}

export interface SarHelicopter {
  id: string;
  callsign: string;
  color: [number, number, number];
  /** Ordered list of sector IDs to sweep */
  sectorRoute: string[];
}

export interface SarHelicopterPosition {
  lng: number;
  lat: number;
  bearing: number;
}

export interface SarStats {
  totalSectors: number;
  searchedSectors: number;
  remainingSectors: number;
  coveragePercent: number;
}

export interface SarSectorDatum {
  polygon: [number, number][];
  fillColor: [number, number, number, number];
  lineColor: [number, number, number, number];
  sectorId: string;
}

export interface SarLabelDatum {
  position: [number, number];
  text: string;
  color: [number, number, number, number];
}

export interface SarPositionDatum {
  lng: number;
  lat: number;
  helicopterId: string;
}

export interface SarTripDatum {
  helicopterId: string;
  path: [number, number][];
  timestamps: number[];
}
