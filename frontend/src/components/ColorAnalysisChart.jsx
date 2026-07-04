/**
 * ColorAnalysisChart — visual representation of HSV color analysis results.
 * Shows green / yellow / brown percentages with animated bars and condition badge.
 */
export default function ColorAnalysisChart({ data }) {
  if (!data) return null;

  const { green_pct = 0, yellow_pct = 0, brown_pct = 0, other_pct = 0, condition, health_index = 0 } = data;

  const segments = [
    { label: 'Green (Healthy)',    pct: green_pct,  color: '#22c55e', bg: 'bg-primary-500', icon: '🌿' },
    { label: 'Yellow (Chlorosis)', pct: yellow_pct, color: '#eab308', bg: 'bg-yellow-500',  icon: '🍂' },
    { label: 'Brown (Necrosis)',   pct: brown_pct,  color: '#a16207', bg: 'bg-amber-700',   icon: '🪵' },
    { label: 'Other',              pct: other_pct,  color: '#475569', bg: 'bg-surface-600', icon: '⚪' },
  ];

  const conditionLabels = {
    healthy:              { label: 'Healthy Plant',         badge: 'badge-success' },
    leaf_yellowing:       { label: 'Leaf Yellowing',        badge: 'badge-warning' },
    chlorosis:            { label: 'Chlorosis Detected',    badge: 'badge-warning' },
    nutrient_deficiency:  { label: 'Nutrient Deficiency',   badge: 'badge-warning' },
    browning:             { label: 'Browning / Necrosis',   badge: 'badge-danger'  },
    mixed_stress:         { label: 'Mixed Stress Symptoms', badge: 'badge-danger'  },
  };

  const conditionInfo = conditionLabels[condition] || { label: condition || 'Unknown', badge: 'badge-neutral' };

  return (
    <div className="space-y-5">
      {/* Condition header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-surface-200 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-turmeric-400" />
          Color Health Analysis
        </h3>
        <span className={`badge ${conditionInfo.badge}`}>{conditionInfo.label}</span>
      </div>

      {/* Stacked bar */}
      <div className="h-5 rounded-full overflow-hidden flex" title="Color distribution">
        {segments.map((s, i) => (
          <div
            key={i}
            className={`${s.bg} transition-all duration-700`}
            style={{ width: `${s.pct}%`, transitionDelay: `${i * 100}ms` }}
            title={`${s.label}: ${s.pct.toFixed(1)}%`}
          />
        ))}
      </div>

      {/* Legend bars */}
      <div className="space-y-3">
        {segments.map((s, i) => (
          <div key={i} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-surface-300">
                <span>{s.icon}</span>
                {s.label}
              </span>
              <span className="font-semibold text-surface-100">{s.pct.toFixed(1)}%</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${s.pct}%`, backgroundColor: s.color, transitionDelay: `${i * 120}ms` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Health index */}
      <div className="flex items-center justify-between p-3 bg-surface-800/60 rounded-xl border border-surface-700">
        <span className="text-xs text-surface-400">Color Health Index</span>
        <div className="flex items-center gap-2">
          <div className="w-20 progress-bar">
            <div
              className="progress-fill bg-primary-500"
              style={{ width: `${health_index}%` }}
            />
          </div>
          <span className="text-sm font-bold text-surface-100">{health_index}/100</span>
        </div>
      </div>
    </div>
  );
}
