import { Search } from 'lucide-react';
import type { NominatimResult } from '../../types/types';

interface Props {
  query: string;
  onQueryChange: (q: string) => void;
  results: NominatimResult[];
  loading: boolean;
  onSelect: (result: NominatimResult) => void;
  onSearch: () => void;
}

export const SearchBox = ({ query, onQueryChange, results, loading, onSelect, onSearch }: Props) => {
  return (
    <div className="relative mb-4">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <div
          contentEditable
          suppressContentEditableWarning
          onInput={(e) => onQueryChange(e.currentTarget.innerText)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-xl bg-orange-50 text-gray-700 outline-none min-h-[56px]"
          dangerouslySetInnerHTML={{ __html: query || '<b>Search</b> for a city, town... or <b>draw</b> area on map' }}
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500" />
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto z-50">
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => onSelect(r)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0"
            >
              <div className="text-sm text-gray-700">{r.display_name}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};