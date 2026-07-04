/**
 * DiseaseBadge — colored badge displaying disease name and severity.
 * SeverityIndicator — animated severity level bar.
 */

export function DiseaseBadge({ disease, className = '' }) {
  if (!disease || disease === 'Healthy') {
    return (
      <span className={`badge badge-success ${className}`}>
        ✅ Healthy
      </span>
    );
  }
  return (
    <span className={`badge badge-danger ${className}`}>
      🦠 {disease}
    </span>
  );
}

export function SeverityIndicator({ severity, showLabel = true }) {
  const levels = { none: 0, mild: 1, moderate: 2, severe: 3 };
  const colors = {
    none:     { bg: 'bg-primary-500', text: 'text-primary-400', label: 'None (Healthy)', bar: 'bg-primary-500' },
    mild:     { bg: 'bg-yellow-500',  text: 'text-yellow-400',  label: 'Mild',           bar: 'bg-yellow-500'  },
    moderate: { bg: 'bg-orange-500',  text: 'text-orange-400',  label: 'Moderate',       bar: 'bg-orange-500'  },
    severe:   { bg: 'bg-red-500',     text: 'text-red-400',     label: 'Severe',         bar: 'bg-red-500'     },
  };

  const level  = levels[severity] ?? 0;
  const config = colors[severity] ?? colors.none;

  return (
    <div className="space-y-1.5">
      {showLabel && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-surface-400">Severity</span>
          <span className={`font-semibold ${config.text}`}>{config.label}</span>
        </div>
      )}
      {/* 4-segment bar */}
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-full transition-all duration-500 ${
              i <= level ? config.bar : 'bg-surface-700'
            }`}
            style={{ transitionDelay: `${i * 80}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

export function ConfidenceBar({ confidence = 0, label = 'Confidence' }) {
  const pct = Math.round(confidence * 100);
  const color = pct >= 80 ? 'bg-primary-500'
              : pct >= 60 ? 'bg-yellow-500'
              : 'bg-red-500';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-surface-400">{label}</span>
        <span className="font-bold text-surface-100">{pct}%</span>
      </div>
      <div className="progress-bar">
        <div
          className={`progress-fill ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
