export type ZoneType = 'minefield' | 'restricted' | 'hazard';
export type DrawMode = 'polygon' | 'rectangle' | 'select' | 'static';

export interface DangerZone {
  id: string;
  type: ZoneType;
  label: string;
  polygon: [number, number][];
  areaKm2: number;
  color: [number, number, number, number];
}

export interface SafeCorridor {
  id: string;
  path: [number, number][];
  width: number; // meters
}

export interface ZonePolygonDatum {
  polygon: [number, number][];
  color: [number, number, number, number];
  outlineColor: [number, number, number];
}

export interface ZoneLabelDatum {
  position: [number, number];
  text: string;
}

export interface ZoneCenterDatum {
  position: [number, number];
  color: [number, number, number];
}
