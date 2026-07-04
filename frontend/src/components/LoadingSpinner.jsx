import { Leaf } from 'lucide-react';

/**
 * LoadingSpinner — shown during async operations and auth loading.
 * fullScreen: centers spinner in full viewport.
 * small: compact inline spinner.
 */
export default function LoadingSpinner({ fullScreen = false, small = false, message = 'Loading...' }) {
  if (small) {
    return (
      <svg className="animate-spin h-4 w-4 text-primary-400" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center gap-6 ${fullScreen ? 'min-h-screen bg-surface-950' : 'py-20'}`}>
      {/* Animated logo ring */}
      <div className="relative w-20 h-20">
        {/* Outer spinning ring */}
        <div className="absolute inset-0 rounded-full border-4 border-surface-800" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-500 animate-spin" />
        {/* Inner pulsing icon */}
        <div className="absolute inset-3 rounded-full bg-primary-900/50 flex items-center justify-center animate-pulse-slow">
          <Leaf className="w-6 h-6 text-primary-400" />
        </div>
      </div>

      <div className="text-center">
        <p className="text-surface-300 text-sm font-medium">{message}</p>
        <p className="text-surface-600 text-xs mt-1">TurmeriCare AI</p>
      </div>
    </div>
  );
}
