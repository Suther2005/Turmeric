import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { Mail, ArrowRight, Leaf, CheckCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('');
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { toast.error('Please enter your email'); return; }
    setLoading(true);
    try {
      await authService.forgotPassword(email);
    } catch {
      // ignore — show success regardless for security
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-slide-up">

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-glow">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <span className="font-display font-bold text-xl text-white">TurmeriCare</span>
        </div>

        {!sent ? (
          <div className="card">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-primary-900/50 border border-primary-700/50 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-7 h-7 text-primary-400" />
              </div>
              <h1 className="font-display font-bold text-2xl text-surface-50">Forgot password?</h1>
              <p className="text-surface-400 text-sm mt-2">
                Enter your email and we'll send you a reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" id="forgot-form">
              <div>
                <label className="input-label" htmlFor="forgot-email">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                  <input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input pl-10"
                    required
                  />
                </div>
              </div>

              <button type="submit" id="forgot-submit" disabled={loading}
                className="btn-primary w-full btn-lg">
                {loading ? (
                  <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg> Sending...</>
                ) : (
                  <>Send Reset Link <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>

            <div className="mt-4 text-center">
              <Link to="/login" className="text-sm text-surface-500 hover:text-primary-400 flex items-center justify-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Back to sign in
              </Link>
            </div>
          </div>
        ) : (
          <div className="card text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-primary-900/50 border-2 border-primary-500 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-primary-400" />
            </div>
            <h2 className="font-display font-bold text-2xl text-surface-50 mb-2">Check your email</h2>
            <p className="text-surface-400 text-sm mb-1">
              We've sent a password reset link to:
            </p>
            <p className="text-primary-400 font-semibold mb-6">{email}</p>
            <p className="text-xs text-surface-500 mb-6">
              Didn't receive it? Check your spam folder. The link expires in 15 minutes.
            </p>
            <Link to="/login" className="btn-primary w-full">
              Back to Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
