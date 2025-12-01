import { SearchBox } from './SearchBox';
import { DrawingControls } from './DrawingControls';
import { SavedAreasList } from './SavedAreasList';
import { UploadButton } from './UploadButton';
import type { NominatimResult, PolygonData } from '../../types/types';

interface Props {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchResults: NominatimResult[];
  isSearching: boolean;
  onSearch: () => void;
  onLocationSelect: (r: NominatimResult) => void;
  isDrawing: boolean;
  setIsDrawing: (v: boolean) => void;
  polygons: PolygonData[];
  onDeletePolygon: (id: number) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const LeftSidebar = ({
  searchQuery,
  setSearchQuery,
  searchResults,
  isSearching,
  onSearch,
  onLocationSelect,
  isDrawing,
  setIsDrawing,
  polygons,
  onDeletePolygon,
  onFileUpload,
}: Props) => {
  return (
    <div className="absolute left-20 top-0 w-[300px] h-full bg-white shadow-xl z-[1000] flex flex-col">
      <div className="h-10 bg-orange-100" />
      <div className="p-3 border-b border-gray-200 flex-1 overflow-y-auto">
        <div className="flex items-center gap-3 mb-6">
          <img src="/leftchevron.png" alt="back" className="w-5 h-5" />
          <div className="h-8 w-px bg-gray-300" />
          <h1 className="text-md text-orange-600">Define Area of Interest</h1>
        </div>

        <p className="text-gray-700 text-base mb-6">
          <span className="font-bold">Define the area(s)</span> where you will apply your object count & detection model
        </p>

        <div className="text-sm text-gray-600 mb-4">Options:</div>

        <SearchBox
          query={searchQuery}
          onQueryChange={setSearchQuery}
          results={searchResults}
          loading={isSearching}
          onSelect={onLocationSelect}
          onSearch={onSearch}
        />

        <UploadButton onUpload={onFileUpload} />

        <div className="mt-6">
          <DrawingControls isDrawing={isDrawing} onToggle={() => setIsDrawing(!isDrawing)} />
          <SavedAreasList polygons={polygons} onDelete={onDeletePolygon} />
        </div>
      </div>
    </div>
  );
};