import type { PolygonData } from "../../types/types";


interface Props {
  polygons: PolygonData[];
  onDelete: (id: number) => void;
}

export const SavedAreasList = ({ polygons, onDelete }: Props) => {
  if (polygons.length === 0) return null;

  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        Saved Areas ({polygons.length})
      </h3>
      <div className="space-y-2">
        {polygons.map((poly) => (
          <div key={poly.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{poly.name}</span>
              <button onClick={() => onDelete(poly.id)} className="text-xs text-red-500 hover:text-red-700">
                Delete
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-1">{poly.points.length} vertices</div>
          </div>
        ))}
      </div>
    </div>
  );
};