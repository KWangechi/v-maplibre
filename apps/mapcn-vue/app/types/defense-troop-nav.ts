export interface TroopWaypoint {
  id: string;
  position: [number, number];
  label: string;
}

export interface TroopWaypointDatum {
  position: [number, number];
  label: string;
  index: number;
}

export interface TroopLabelDatum {
  position: [number, number];
  text: string;
}

export interface ElevationPoint {
  distance: number;
  altitude: number;
}

export interface RouteStats {
  distanceKm: number;
  timeHours: number;
  elevationGain: number;
  elevationLoss: number;
}

export interface ValhallaRouteLeg {
  shape: string;
  summary: {
    length: number;
    time: number;
    name?: string;
  };
}

export interface ValhallaRouteTrip {
  legs: ValhallaRouteLeg[];
  summary: {
    length: number;
    time: number;
  };
}

export interface ValhallaRouteResponse {
  trip: ValhallaRouteTrip;
}
