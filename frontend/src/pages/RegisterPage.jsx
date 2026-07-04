import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Leaf, Lock, Mail, User, ArrowRight, CheckCircle } from 'lucide-react';

function getPasswordStrength(pwd) {
  if (pwd.length === 0) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const levels = [
    { label: 'Too short', color: 'bg-red-500' },
    { label: 'Weak',      color: 'bg-red-400' },
    { label: 'Fair',      color: 'bg-yellow-400' },
    { label: 'Good',      color: 'bg-primary-400' },
    { label: 'Strong',    color: 'bg-primary-500' },
  ];
  return { score, ...levels[score] };
}

export default function RegisterPage() {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [showPass, setShowPass] = useState(false);
  const [agree, setAgree]       = useState(false);
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState({});

  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const strength = getPasswordStrength(password);

  if (isAuthenticated) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Full name is required';
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email = 'Valid email required';
    if (password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (password !== confirm) errs.confirm = 'Passwords do not match';
    if (!agree) errs.agree = 'You must agree to terms';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      await register(name.trim(), email, password);
      toast.success('Account created! Welcome to TurmeriCare 🌿');
      navigate('/dashboard');
    } catch (err) {
      toast.error(
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        'Registration failed. Try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    'Free disease detection for turmeric crops',
    'AI-powered soil health analysis',
    'Downloadable PDF crop health reports',
    'Real-time alerts for disease outbreaks',
  ];

  return (
    <div className="min-h-screen flex bg-surface-950">
      {/* ── Right Panel (form) ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 order-first lg:order-none">
        <div className="w-full max-w-md animate-slide-up">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-white">TurmeriCare</span>
          </div>

          <div className="mb-8">
            <h2 className="font-display font-bold text-3xl text-surface-50">Create account</h2>
            <p className="text-surface-400 mt-1">Start monitoring your turmeric crop today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" id="register-form">
            {/* Name */}
            <div>
              <label className="input-label" htmlFor="reg-name">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                <input id="reg-name" type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Dr. Priya Sharma" className={`input pl-10 ${errors.name ? 'input-error' : ''}`} />
              </div>
              {errors.name && <p className="error-text">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="input-label" htmlFor="reg-email">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                <input id="reg-email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="priya@farm.in" className={`input pl-10 ${errors.email ? 'input-error' : ''}`} />
              </div>
              {errors.email && <p className="error-text">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="input-label" htmlFor="reg-password">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                <input id="reg-password" type={showPass ? 'text' : 'password'}
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 8 characters" className={`input pl-10 pr-10 ${errors.password ? 'input-error' : ''}`} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-500">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Strength bar */}
              {password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= strength.score ? strength.color : 'bg-surface-700'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-surface-500">{strength.label}</p>
                </div>
              )}
              {errors.password && <p className="error-text">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="input-label" htmlFor="reg-confirm">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                <input id="reg-confirm" type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                  placeholder="Repeat your password" className={`input pl-10 ${errors.confirm ? 'input-error' : ''}`} />
                {confirm && password === confirm && (
                  <CheckCircle className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
                )}
              </div>
              {errors.confirm && <p className="error-text">{errors.confirm}</p>}
            </div>

            {/* Terms */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" id="reg-terms" checked={agree}
                  onChange={e => setAgree(e.target.checked)}
                  className="mt-0.5 accent-primary-500 w-4 h-4" />
                <span className="text-sm text-surface-400">
                  I agree to the{' '}
                  <span className="text-primary-400 hover:text-primary-300 cursor-pointer">Terms of Service</span>
                  {' '}and{' '}
                  <span className="text-primary-400 hover:text-primary-300 cursor-pointer">Privacy Policy</span>
                </span>
              </label>
              {errors.agree && <p className="error-text mt-1">{errors.agree}</p>}
            </div>

            <button type="submit" id="register-submit" disabled={loading}
              className="btn-primary w-full btn-lg mt-2">
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Creating account...
                </>
              ) : (
                <>Create Account <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-surface-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold">Sign in</Link>
          </p>
        </div>
      </div>

      {/* ── Left Panel (branding) ── */}
      <div className="hidden lg:flex w-[42%] flex-col justify-between p-12 relative overflow-hidden
        bg-gradient-to-br from-primary-900 via-primary-800 to-surface-900">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-1/3 right-1/3 w-72 h-72 bg-turmeric-500/10 rounded-full blur-3xl" />
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-glow">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-white text-lg">TurmeriCare</h1>
            <p className="text-[11px] text-primary-300 uppercase tracking-widest">AI Crop Monitor</p>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <h2 className="font-display font-bold text-3xl text-white leading-tight">
            Join 10,000+<br />
            <span className="text-turmeric-300">Turmeric Farmers</span>
          </h2>
          <p className="text-primary-200 text-sm leading-relaxed">
            Get free access to AI-powered crop health monitoring designed specifically for turmeric cultivation.
          </p>
          <div className="space-y-3">
            {benefits.map((b, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-turmeric-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-primary-200">{b}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-primary-900/50 border border-primary-700/50 rounded-xl p-4 relative z-10">
          <p className="text-xs text-primary-200 italic">
            "TurmeriCare helped me detect Rhizome Rot 3 weeks early. I saved 40% of my crop last season!"
          </p>
          <p className="text-xs text-primary-400 mt-2 font-medium">— Rajan Kumar, Erode, Tamil Nadu</p>
        </div>
      </div>
    </div>
  );
}
