interface Props {
    isDrawing: boolean;
    onToggle: () => void;
  }
  
  export const DrawingControls = ({ isDrawing, onToggle }: Props) => (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Drawing Tools</h3>
      <button
        onClick={onToggle}
        className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${
          isDrawing ? 'bg-orange-500 text-white' : 'bg-orange-100 text-gray-700'
        }`}
      >
        {isDrawing ? 'Finish drawing (double-click)' : 'Start Drawing Polygon'}
      </button>
    </div>
  );