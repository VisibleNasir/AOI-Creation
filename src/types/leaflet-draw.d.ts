import 'leaflet';
declare module 'leaflet' {
  namespace Control {
    interface DrawOptions {
      position?: string;
      draw?: {
        polygon?: {
          shapeOptions?: {
            color?: string;
            weight?: number;
          };
          allowIntersection?: boolean;
        };
        rectangle?: {
          shapeOptions?: {
            color?: string;
            weight?: number;
          };
        };
        circle?: boolean;
        circlemarker?: boolean;
        marker?: boolean;
        polyline?: boolean;
      };
      edit?: {
        featureGroup: L.FeatureGroup;
      };
    }
  }
}
