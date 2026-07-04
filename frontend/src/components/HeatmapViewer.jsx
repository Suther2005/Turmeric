import { useState } from 'react';
import { Info, Eye, EyeOff } from 'lucide-react';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * HeatmapViewer — displays Grad-CAM heatmap overlay on original image.
 * Toggle between original and heatmap views.
 */
export default function HeatmapViewer({ originalPath, heatmapPath, explanation }) {
  const [showHeatmap, setShowHeatmap] = useState(true);

  const getImgUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${BASE_URL}/uploads/${path.split('uploads/').pop()}`;
  };

  const originalUrl = getImgUrl(originalPath);
  const heatmapUrl  = getImgUrl(heatmapPath);

  return (
    <div className="space-y-4">
      {/* Toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-surface-200 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />
          Grad-CAM Heatmap
        </h3>
        <button
          onClick={() => setShowHeatmap(!showHeatmap)}
          className="flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300 transition-colors font-medium"
        >
          {showHeatmap ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {showHeatmap ? 'View Original' : 'View Heatmap'}
        </button>
      </div>

      {/* Image display */}
      <div className="relative rounded-xl overflow-hidden bg-surface-800 border border-surface-700">
        {showHeatmap && heatmapUrl ? (
          <img
            src={heatmapUrl}
            alt="Grad-CAM Disease Heatmap"
            className="w-full h-auto max-h-64 object-contain"
            onError={(e) => { e.target.src = originalUrl; }}
          />
        ) : originalUrl ? (
          <img
            src={originalUrl}
            alt="Original Plant Image"
            className="w-full h-auto max-h-64 object-contain"
          />
        ) : (
          <div className="h-48 flex items-center justify-center">
            <p className="text-surface-600 text-sm">Image unavailable</p>
          </div>
        )}

        {/* Badge overlay */}
        <div className="absolute top-3 left-3">
          <span className={`badge ${showHeatmap ? 'badge-warning' : 'badge-neutral'} text-[10px]`}>
            {showHeatmap ? '🔥 Heatmap' : '📷 Original'}
          </span>
        </div>
      </div>

      {/* Explanation */}
      {explanation && (
        <div className="alert alert-info text-xs">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium mb-0.5">Why this prediction?</p>
            <p>{explanation}</p>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-surface-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-red-500" />
          <span>High activation</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-yellow-500" />
          <span>Medium</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-blue-500" />
          <span>Low activation</span>
        </div>
      </div>
    </div>
  );
}
