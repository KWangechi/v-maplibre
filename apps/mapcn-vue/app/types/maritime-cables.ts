export type RiskLevel = 'low' | 'medium' | 'high';

export interface CableSegment {
  id: string;
  cableId: string;
  path: [number, number][];
  riskScore: number;
}

export interface Cable {
  id: string;
  name: string;
  color: [number, number, number];
  path: [number, number][];
  capacityTbps: number;
  riskScore: number;
  landingPoints: string[];
}

export interface LandingPoint {
  id: string;
  name: string;
  position: [number, number];
  country: string;
}

export interface EezZone {
  id: string;
  name: string;
  polygon: [number, number][];
}

export interface CableStats {
  totalCables: number;
  totalLandingPoints: number;
  highRiskSegments: number;
  totalCapacityTbps: number;
}
