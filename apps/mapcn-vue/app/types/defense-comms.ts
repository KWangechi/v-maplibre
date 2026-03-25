export type NodeType = 'hq' | 'relay' | 'field';
export type LinkStatus = 'strong' | 'degraded' | 'weak' | 'down';

export interface CommNode {
  id: string;
  type: NodeType;
  label: string;
  position: [number, number];
  range: number;
  color: [number, number, number];
}

export interface CommLink {
  id: string;
  source: string;
  target: string;
  status: LinkStatus;
  signalStrength: number;
}

export interface CommNodeTypeConfig {
  type: NodeType;
  label: string;
  icon: string;
  color: [number, number, number];
  defaultRange: number;
}

export interface CommNetworkStats {
  totalNodes: number;
  activeLinks: number;
  avgSignal: number;
  downLinks: number;
}
