export type CameraStatus = 'online' | 'offline' | 'alert';
export type PatrolStatus = 'patrolling' | 'halted' | 'returning';
export type ZoneAlertLevel = 'high' | 'medium' | 'low';
export type BorderLayerName = 'cameras' | 'patrols' | 'zones' | 'border';

export interface BorderCamera {
  id: string;
  label: string;
  position: [number, number];
  bearing: number;
  status: CameraStatus;
  coverageCone: [number, number][];
}

export interface BorderPatrolRoute {
  id: string;
  name: string;
  status: PatrolStatus;
  color: [number, number, number];
  path: [number, number][];
  timestamps: number[];
}

export interface BorderPatrolPosition {
  lng: number;
  lat: number;
  bearing: number;
  routeId: string;
}

export interface IntrusionZone {
  id: string;
  name: string;
  alertLevel: ZoneAlertLevel;
  polygon: [number, number][];
}

export interface BorderSegment {
  id: string;
  path: [number, number][];
}

export interface CameraDatum {
  lng: number;
  lat: number;
  cameraId: string;
  status: CameraStatus;
}

export interface PatrolVehicleDatum {
  lng: number;
  lat: number;
  routeId: string;
}

export interface ZoneDatum {
  polygon: [number, number][];
  alertLevel: ZoneAlertLevel;
  name: string;
}
