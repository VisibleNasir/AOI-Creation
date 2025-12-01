
import { useEffect, useRef, useState, memo } from 'react';
import { Polygon, useMapEvents } from 'react-leaflet';
import type { LatLngTuple } from 'leaflet';

interface Props {
  isDrawing: boolean;
  onComplete: (points: LatLngTuple[]) => void;
}

export const DrawingTool = memo(({ isDrawing, onComplete }: Props) => {
  const [points, setPoints] = useState<LatLngTuple[]>([]);
  const isDrawingRef = useRef(isDrawing);

  // Keep ref in sync so double-click handler always sees the latest value
  useEffect(() => {
    isDrawingRef.current = isDrawing;
  }, [isDrawing]);

  useMapEvents({
    click(e) {
      if (isDrawingRef.current) {
        setPoints((prev) => [...prev, [e.latlng.lat, e.latlng.lng]]);
      }
    },
    dblclick(e) {
      // Prevent zoom on double-click
      e.originalEvent.preventDefault();

      if (isDrawingRef.current && points.length >= 3) {
        onComplete(points);
        setPoints([]); // only clear once here → no loop
      }
    },
  });

  
  // Nothing to render when we have less than 2 points
  if (points.length < 2) return null;

  return (
    <Polygon
      positions={points}
      color="#FF6B35"
      weight={4}
      fillOpacity={0.2}
      interactive={false}
    />
  );
});

DrawingTool.displayName = 'DrawingTool';