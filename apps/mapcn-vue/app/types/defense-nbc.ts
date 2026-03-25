export type HazardType = 'nuclear' | 'biological' | 'chemical';

export type DangerLevel = 'lethal' | 'danger' | 'caution';

export interface HazardSource {
  position: [number, number];
  type: HazardType;
  placedAt: number;
}

export interface PlumeZone {
  level: DangerLevel;
  polygon: [number, number][];
  color: [number, number, number, number];
  label: string;
}

export interface WindConfig {
  direction: number;
  speed: number;
}

export interface NbcStats {
  affectedAreaKm2: number;
  windDirection: number;
  windSpeed: number;
  elapsedSeconds: number;
  activeZones: number;
}

export interface PlumeZoneDatum {
  polygon: [number, number][];
  color: [number, number, number, number];
}

export interface PlumeLabelDatum {
  position: [number, number];
  text: string;
}

export interface SourcePointDatum {
  position: [number, number];
  color: [number, number, number];
}
