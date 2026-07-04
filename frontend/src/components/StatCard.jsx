import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * StatCard — compact metric card for dashboard KPIs.
 * Shows icon, value, label, optional trend, and color accent.
 */
export default function StatCard({ icon: Icon, label, value, subtitle, trend, trendValue, color = 'primary', loading = false }) {
  const colorMap = {
    primary:  { border: 'border-primary-500',  bg: 'bg-primary-500/10',  text: 'text-primary-400'  },
    yellow:   { border: 'border-yellow-500',   bg: 'bg-yellow-500/10',   text: 'text-yellow-400'   },
    red:      { border: 'border-red-500',      bg: 'bg-red-500/10',      text: 'text-red-400'      },
    blue:     { border: 'border-blue-500',     bg: 'bg-blue-500/10',     text: 'text-blue-400'     },
    orange:   { border: 'border-orange-500',   bg: 'bg-orange-500/10',   text: 'text-orange-400'   },
    turmeric: { border: 'border-turmeric-500', bg: 'bg-turmeric-500/10', text: 'text-turmeric-400' },
  };

  const { border, bg, text } = colorMap[color] || colorMap.primary;

  if (loading) {
    return (
      <div className={`stat-card ${border}`}>
        <div className="w-12 h-12 skeleton rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="h-3 skeleton w-20 rounded" />
          <div className="h-6 skeleton w-16 rounded" />
        </div>
      </div>
    );
  }

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-primary-400' : trend === 'down' ? 'text-red-400' : 'text-surface-500';

  return (
    <div className={`stat-card ${border} hover:shadow-card-lg hover:-translate-y-0.5 transition-all duration-300 cursor-default`}>
      {/* Icon */}
      <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-6 h-6 ${text}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-surface-500 font-medium uppercase tracking-wide truncate">{label}</p>
        <p className="text-2xl font-display font-bold text-surface-50 mt-0.5 leading-tight">{value}</p>
        {subtitle && <p className="text-xs text-surface-400 mt-0.5">{subtitle}</p>}
      </div>

      {/* Trend */}
      {trend && (
        <div className={`flex flex-col items-end gap-1 flex-shrink-0`}>
          <TrendIcon className={`w-4 h-4 ${trendColor}`} />
          {trendValue && <span className={`text-xs font-semibold ${trendColor}`}>{trendValue}</span>}
        </div>
      )}
    </div>
  );
}
