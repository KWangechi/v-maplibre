export type CargoType = 'ammo' | 'fuel' | 'medical';
export type ConvoyStatus = 'en-route' | 'arrived' | 'delayed';
export type CheckpointStatus = 'cleared' | 'next' | 'pending';

export interface ConvoyUnit {
  id: string;
  callsign: string;
  cargoType: CargoType;
  vehicleCount: number;
  status: ConvoyStatus;
  color: [number, number, number];
}

export interface ConvoyCheckpoint {
  id: string;
  convoyId: string;
  label: string;
  position: [number, number];
  status: CheckpointStatus;
}

export interface ConvoyRoute {
  convoyId: string;
  path: [number, number][];
  timestamps: number[];
}

export interface ConvoyPositionDatum {
  lng: number;
  lat: number;
  convoyId: string;
  selected: boolean;
}

export interface ConvoyLabelDatum {
  position: [number, number];
  text: string;
}

export interface CheckpointDatum {
  position: [number, number];
  status: CheckpointStatus;
  label: string;
}

export interface ConvoyDetails {
  unit: ConvoyUnit;
  eta: string;
  nextCheckpoint: string;
  distanceRemaining: number;
  progress: number;
}

export interface ConvoyRouteResponse {
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
