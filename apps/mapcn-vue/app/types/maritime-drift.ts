export type DriftMode = 'sar' | 'spill';

/** Single particle at one timestep */
export interface ParticlePosition {
  lng: number;
  lat: number;
}

/** Full path + final position for one Monte-Carlo particle */
export interface ParticleDatum {
  id: number;
  path: [number, number][];
  finalLng: number;
  finalLat: number;
}

/** Wind or current vector arrow */
export interface VectorDatum {
  position: [number, number];
  angleDeg: number;
  magnitude: number;
  label: string;
}

export interface DriftParams {
  mode: DriftMode;
  particleCount: number;
  currentSpeedKn: number;
  currentBearingDeg: number;
  windSpeedKn: number;
  windBearingDeg: number;
  durationHours: number;
}

export interface DriftStats {
  particleCount: number;
  searchAreaKm2: number;
  driftDistanceKm: number;
  elapsedHours: number;
}

export interface ParticlePositionDatum {
  lng: number;
  lat: number;
  id: number;
}

export interface TripDatum {
  id: number;
  path: [number, number][];
  timestamps: number[];
}

export interface ProbabilityHullDatum {
  polygon: [number, number][];
}
