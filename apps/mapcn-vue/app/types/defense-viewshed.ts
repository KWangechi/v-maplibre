export interface Observer {
  id: string;
  position: [number, number];
  heightM: number;
  label: string;
}

export interface ViewshedPolygon {
  observerId: string;
  polygon: [number, number][];
  color: [number, number, number, number];
}

export interface ViewshedConfig {
  baseRangeM: number;
  heightOptions: number[];
  maxObservers: number;
  rayCount: number;
}

export interface ObserverDatum {
  lng: number;
  lat: number;
  observerId: string;
}

export interface ObserverLabelDatum {
  position: [number, number];
  text: string;
}
