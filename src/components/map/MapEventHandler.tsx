import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

interface Props {
  zoomInRef: React.MutableRefObject<(() => void) | null>;
  zoomOutRef: React.MutableRefObject<(() => void) | null>;
}

export const MapEventHandler = ({ zoomInRef, zoomOutRef }: Props) => {
  const map = useMap();

  useEffect(() => {
    zoomInRef.current = () => map.zoomIn();
    zoomOutRef.current = () => map.zoomOut();
  }, [map, zoomInRef, zoomOutRef]);

  return null;
};