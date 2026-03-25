export type SensorType = 'acoustic' | 'radar' | 'lora' | 'jammer';
export type SensorStatus = 'active' | 'inactive' | 'alert' | 'maintenance';
export type ThreatLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Sensor {
  id: string;
  name: string;
  type: SensorType;
  status: SensorStatus;
  position: [number, number]; // [lng, lat]
  detectionRadius: number; // km
  color: [number, number, number, number]; // RGBA
}

export interface ThreatEvent {
  id: string;
  timestamp: number;
  position: [number, number];
  level: ThreatLevel;
  description: string;
  detectedBy: string[]; // sensor IDs
}

export interface CoverageZone {
  id: string;
  type: 'friendly' | 'adversary';
  polygon: [number, number][];
  label: string;
  color: [number, number, number, number];
}

export interface SensorNetworkStats {
  totalSensors: number;
  activeSensors: number;
  alertCount: number;
  coveragePercent: number;
}

export interface SensorTypeConfig {
  type: SensorType;
  label: string;
  icon: string;
  color: [number, number, number, number];
}
