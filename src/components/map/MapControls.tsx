import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface Props {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFullscreen: () => void;
}

export const MapControls = ({ onZoomIn, onZoomOut, onFullscreen }: Props) => (
  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-[1000]">
    <button onClick={onZoomIn} className="bg-white hover:bg-gray-50 p-3 rounded-lg shadow-lg">
      <ZoomIn className="w-5 h-5 text-gray-700" />
    </button>
    <button onClick={onZoomOut} className="bg-white hover:bg-gray-50 p-3 rounded-lg shadow-lg">
      <ZoomOut className="w-5 h-5 text-gray-700" />
    </button>
    <button onClick={onFullscreen} className="bg-white hover:bg-gray-50 p-3 rounded-lg shadow-lg">
      <Maximize2 className="w-5 h-5 text-gray-700" />
    </button>
  </div>
);