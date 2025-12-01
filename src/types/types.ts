import type { LatLngTuple } from 'leaflet';

export interface PolygonData {
  id: number;
  name: string;
  points: LatLngTuple[];
}

export interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  boundingbox: string[];
}