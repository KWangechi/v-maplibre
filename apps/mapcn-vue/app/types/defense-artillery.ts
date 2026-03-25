export type WeaponType = 'howitzer' | 'mortar' | 'mlrs';

export interface ArtilleryPosition {
  id: string;
  position: [number, number];
  weaponType: WeaponType;
  bearing: number;
  arcWidth: number;
  minRange: number;
  maxRange: number;
  label: string;
}

export interface RangeFanPolygon {
  positionId: string;
  polygon: [number, number][];
  color: [number, number, number, number];
}

export interface WeaponConfig {
  type: WeaponType;
  label: string;
  icon: string;
  minRange: number;
  maxRange: number;
  color: [number, number, number];
  defaultArcWidth: number;
}

export interface ArtilleryPositionDatum {
  lng: number;
  lat: number;
  positionId: string;
  color: [number, number, number];
  selected: boolean;
}

export interface ArtilleryLabelDatum {
  position: [number, number];
  text: string;
}
