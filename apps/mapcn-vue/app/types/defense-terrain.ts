export type MilitaryUnitType = 'infantry' | 'armor' | 'patrol' | 'recon';
export type MissionPhase =
  | 'assembly'
  | 'advance'
  | 'engagement'
  | 'consolidation';

export interface BattlefieldUnit {
  id: string;
  callsign: string;
  type: MilitaryUnitType;
  color: [number, number, number];
  strength: number;
}

export interface BattlefieldPath {
  unitId: string;
  path: [number, number][];
  timestamps: number[];
}

export interface BattlefieldPosition {
  lng: number;
  lat: number;
  bearing: number;
  unitId: string;
}

export interface MissionPhaseInfo {
  phase: MissionPhase;
  label: string;
  timeRange: [number, number];
  description: string;
}

export interface BattlefieldStats {
  phase: MissionPhase;
  phaseLabel: string;
  phaseDescription: string;
  elapsedTime: number;
  activeUnits: number;
}
