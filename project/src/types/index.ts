export interface Coordinate {
  longitude: number;
  latitude: number;
}

export interface WayPoint {
  id: string;
  coordinates: Coordinate;
  distance?: number;
}

export interface PolygonData {
  id: string;
  coordinates: Coordinate[];
  beforeWaypointId?: string;
  afterWaypointId?: string;
}