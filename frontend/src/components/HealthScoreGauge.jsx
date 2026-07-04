/**
 * HealthScoreGauge — SVG radial gauge showing crop/soil health score (0–100).
 * Animated on mount using CSS transitions.
 */
export default function HealthScoreGauge({ score = 0, label = 'Health Score', size = 160, loading = false }) {
  const radius   = 52;
  const stroke   = 8;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.min(100, Math.max(0, score));
  const offset = circumference - (clampedScore / 100) * circumference;

  // Color thresholds
  const color = clampedScore >= 75 ? '#22c55e'   // green  — excellent
              : clampedScore >= 50 ? '#eab308'    // yellow — good
              : clampedScore >= 25 ? '#f97316'    // orange — fair
              : '#ef4444';                         // red    — poor

  const getLabel = () => {
    if (clampedScore >= 75) return 'Excellent';
    if (clampedScore >= 50) return 'Good';
    if (clampedScore >= 25) return 'Fair';
    return 'Poor';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div style={{ width: size, height: size }} className="skeleton rounded-full" />
        <div className="h-3 w-24 skeleton rounded" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 120 120">
          {/* Background track */}
          <circle cx="60" cy="60" r={radius} fill="none"
            stroke="#1e293b" strokeWidth={stroke} />

          {/* Colored progress arc */}
          <circle cx="60" cy="60" r={radius} fill="none"
            stroke={color} strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transform: 'rotate(-90deg)',
              transformOrigin: '50% 50%',
              transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1)',
              filter: `drop-shadow(0 0 6px ${color}66)`
            }}
          />

          {/* Score text */}
          <text x="60" y="54" textAnchor="middle" dominantBaseline="middle"
            style={{ fontSize: 22, fontWeight: 700, fill: '#f8fafc', fontFamily: 'Outfit, sans-serif' }}>
            {clampedScore}
          </text>
          <text x="60" y="72" textAnchor="middle" dominantBaseline="middle"
            style={{ fontSize: 9, fill: '#64748b', fontFamily: 'Inter, sans-serif', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            / 100
          </text>
        </svg>

        {/* Glow dot at end of arc */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ filter: `drop-shadow(0 0 8px ${color})` }} />
      </div>

      <div className="text-center">
        <p className="text-sm font-semibold" style={{ color }}>{getLabel()}</p>
        <p className="text-xs text-surface-500">{label}</p>
      </div>
    </div>
  );
}
