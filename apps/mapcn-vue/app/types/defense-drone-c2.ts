export type UnitType = 'drone' | 'ugv';
export type UnitStatus = 'active' | 'idle' | 'rtb' | 'alert';

export interface C2Unit {
  id: string;
  callsign: string;
  type: UnitType;
  status: UnitStatus;
  color: [number, number, number];
}

export interface C2UnitTelemetry {
  altitude: number;
  speed: number;
  battery: number;
  heading: number;
}

export interface C2UnitPosition {
  lng: number;
  lat: number;
  bearing: number;
}

export interface C2PatrolPath {
  unitId: string;
  path: [number, number][];
  timestamps: number[];
}

export interface C2Waypoint {
  id: string;
  position: [number, number];
  label: string;
  unitId: string;
}

export interface C2UnitState {
  unit: C2Unit;
  position: C2UnitPosition;
  telemetry: C2UnitTelemetry;
}

export interface C2PositionDatum {
  lng: number;
  lat: number;
  unitId: string;
  selected: boolean;
}

export interface C2LabelDatum {
  position: [number, number];
  text: string;
}

export type GeofenceDrawMode = 'polygon' | 'select' | 'static';

export interface GeofenceZone {
  id: string;
  polygon: [number, number][];
}

export interface GeofenceBreach {
  unitId: string;
  callsign: string;
  timestamp: number;
}
