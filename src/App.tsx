import { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, WMSTileLayer, Marker, Polygon } from 'react-leaflet';
import { MapControls } from './components/map/MapControls';
import { MapEventHandler } from './components/map/MapEventHandler';
import { DrawingTool } from './components/map/DrawingTool';
import { LeftSidebar } from './components/sidebar/LeftSidebar';
import { useSearch } from './hooks/useSearch';
import type { LatLngTuple, LatLngExpression } from 'leaflet';
import './utils/leafletFix';
import type { NominatimResult, PolygonData } from './types/types';

export default function App() {
  const [mapCenter, setMapCenter] = useState<LatLngExpression>([50.9375, 6.9603]);
  const [mapZoom, setMapZoom] = useState(11);
  const [selectedLocation, setSelectedLocation] = useState<LatLngTuple | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [polygons, setPolygons] = useState<PolygonData[]>(() => {
    const saved = localStorage.getItem('aoi-polygons');
    return saved ? JSON.parse(saved) : [];
  });

  const { query, setQuery, results, loading, search } = useSearch();

  const zoomInRef = useRef<(() => void) | null>(null);
  const zoomOutRef = useRef<(() => void) | null>(null);

  // Removed useEffect for loading polygons from localStorage

  // Save to localStorage
  useEffect(() => {
    if (polygons.length > 0) {
      localStorage.setItem('aoi-polygons', JSON.stringify(polygons));
    }
  }, [polygons]);

  const handleLocationSelect = useCallback((result: NominatimResult) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    const center: LatLngTuple = [lat, lon];
    setMapCenter(center);
    setMapZoom(15);
    setSelectedLocation(center);
    setQuery(result.display_name.split(',')[0]);
  }, [setQuery]);

  const handlePolygonComplete = useCallback((points: LatLngTuple[]) => {
    setPolygons((prev) => [...prev, {
      id: Date.now(),
      name: `AOI ${prev.length + 1}`,
      points,
    }]);
    setIsDrawing(false);
  }, []);

  const handleFileUpload = () => {
    alert('File upload demo — integrate shpjs/geojson-vt in production');
  };

  const handleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  };

  return (
    <div className="flex h-screen">
      {/* Vertical Nav */}
      <div className="w-20 fixed h-full flex flex-col items-center py-6 gap-6 z-[1100]">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center">
          <img src="/arrow.png" alt="logo" className="w-8 h-8 rotate-[-45deg]" />
        </div>
        <button className="p-2 rounded-lg ">
          <img src="/home.png" alt="home" className="w-8 h-8" />
        </button>
        <button className="p-2 rounded-lg ">
          <img src="/menu.png" alt="menu" className="w-8 h-8" />
        </button>
      </div>

      <LeftSidebar
        searchQuery={query}
        setSearchQuery={setQuery}
        searchResults={results}
        isSearching={loading}
        onSearch={() => search(query)}
        onLocationSelect={handleLocationSelect}
        isDrawing={isDrawing}
        setIsDrawing={setIsDrawing}
        polygons={polygons}
        onDeletePolygon={(id) => setPolygons(p => p.filter(x => x.id !== id))}
        onFileUpload={handleFileUpload}
      />

      <div className="flex-1 relative">
        <MapContainer center={mapCenter} zoom={mapZoom} className="h-full w-full" zoomControl={false}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <WMSTileLayer
            url="https://www.wms.nrw.de/geobasis/wms_nw_dop"
            layers="nw_dop_rgb"
            format="image/jpeg"
            transparent={false}
          />

          <MapEventHandler zoomInRef={zoomInRef} zoomOutRef={zoomOutRef} />
          <DrawingTool isDrawing={isDrawing} onComplete={handlePolygonComplete} />

          {polygons.map(p => (
            <Polygon key={p.id} positions={p.points} color="#FF6B35" weight={4} fillOpacity={0.25} />
          ))}

          {selectedLocation && <Marker position={selectedLocation} />}
        </MapContainer>

        <MapControls
          onZoomIn={() => zoomInRef.current?.()}
          onZoomOut={() => zoomOutRef.current?.()}
          onFullscreen={handleFullscreen}
        />
      </div>
    </div>
  );
}