export interface ValhallaLocation {
  lat: number;
  lon: number;
  type: 'break';
}

export interface ConvoyDef {
  id: string;
  start: [number, number];
  end: [number, number];
  checkpointLabels: string[];
}

export interface ConvoyRouteResult {
  convoyId: string;
  path: [number, number][];
  timestamps: number[];
  distanceKm: number;
  durationSeconds: number;
  checkpoints: {
    label: string;
    position: [number, number];
    pathIndex: number;
  }[];
}
