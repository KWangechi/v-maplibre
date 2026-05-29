export interface OceanGridCell {
  lng: number;
  lat: number;
  sst: number;
}

export interface CurrentSample {
  lng: number;
  lat: number;
  u: number;
  v: number;
  speed: number;
}

export interface TripStreamline {
  shipId: string;
  path: [number, number][];
  timestamps: number[];
}

export interface OceanStats {
  minSst: number;
  maxSst: number;
  meanCurrent: number;
  gridCells: number;
}
