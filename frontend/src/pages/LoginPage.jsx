import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Leaf, Lock, Mail, ArrowRight, CheckCircle, Shield, BarChart3, Zap } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please fill all fields'); return; }
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back! 🌿');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: BarChart3, text: 'Real-time disease detection with 95% accuracy' },
    { icon: Shield,    text: 'Grad-CAM explainable AI for transparent predictions' },
    { icon: Zap,       text: 'Instant soil health analysis and recommendations' },
  ];

  return (
    <div className="min-h-screen flex bg-surface-950">
      {/* ── Left Panel (branding) ── */}
      <div className="hidden lg:flex w-[45%] flex-col justify-between p-12 relative overflow-hidden
        bg-gradient-to-br from-surface-950 via-primary-950 to-primary-900">

        {/* Background radial glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2
            w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        </div>

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-glow">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-white text-lg">TurmeriCare</h1>
            <p className="text-[11px] text-primary-400 uppercase tracking-widest">AI Crop Monitor</p>
          </div>
        </div>

        {/* Main content */}
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="font-display font-bold text-4xl text-white leading-tight">
              Smart Farming
              <span className="block text-gradient">Starts Here</span>
            </h2>
            <p className="text-surface-300 mt-3 leading-relaxed">
              AI-powered turmeric crop monitoring. Detect diseases early,
              optimize soil health, and maximize your harvest yield.
            </p>
          </div>

          <div className="space-y-4">
            {features.map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-primary-400" />
                </div>
                <p className="text-sm text-surface-300 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            {[['10K+','Farms Monitored'],['95.2%','Detection Accuracy']].map(([val, lab]) => (
              <div key={lab} className="bg-surface-900/50 rounded-xl p-4 border border-surface-700/50">
                <p className="text-2xl font-display font-bold text-primary-400">{val}</p>
                <p className="text-xs text-surface-500 mt-0.5">{lab}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-surface-600 relative z-10">
          © 2026 TurmeriCare. Built for Indian farmers.
        </p>
      </div>

      {/* ── Right Panel (form) ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md animate-slide-up">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-white">TurmeriCare</span>
          </div>

          <div className="mb-8">
            <h2 className="font-display font-bold text-3xl text-surface-50">Welcome back</h2>
            <p className="text-surface-400 mt-1">Sign in to your TurmeriCare account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" id="login-form">
            {/* Email */}
            <div>
              <label className="input-label" htmlFor="login-email">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input pl-10"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="input-label mb-0" htmlFor="login-password">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary-400 hover:text-primary-300 font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input pl-10 pr-10"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              id="login-submit"
              disabled={loading}
              className="btn-primary w-full btn-lg mt-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                <>Sign in <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-4 p-3 bg-surface-800/50 rounded-xl border border-surface-700/50 text-xs text-surface-400">
            <p className="font-medium text-surface-300 mb-1">Demo Credentials (Admin):</p>
            <p>admin@turmericare.com / Admin@123</p>
          </div>

          <p className="text-center text-sm text-surface-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-semibold">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
