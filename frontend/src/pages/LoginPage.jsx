import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Compass,
  Sparkles
} from 'lucide-react';

export default function LoginPage() {
  const { login, setActivePage } = useApp();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError('Please provide your email or username and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login({ email: identifier, password });
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-orbit-bg text-orbit-ivory flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden bg-tech-grid">
      {/* Background ambient orbit rings */}
      <div className="absolute w-[500px] h-[500px] rounded-full border border-dashed border-orbit-steel/10 animate-spin-slow pointer-events-none" />
      <div className="absolute w-[800px] h-[800px] rounded-full border border-orbit-steel/5 pointer-events-none" />

      {/* Top Brand Header */}
      <div className="text-center mb-8 z-10">
        <button
          onClick={() => setActivePage('landing')}
          className="inline-flex items-center gap-2 mb-4 p-1 px-3 rounded-full bg-orbit-surface/80 border border-orbit-border hover:border-orbit-lime/40 text-[11px] font-mono text-orbit-steel hover:text-orbit-ivory transition-colors"
        >
          <Compass className="w-3.5 h-3.5 text-orbit-lime" />
          <span>RETURN TO PLATFORM OVERVIEW</span>
        </button>

        <div className="flex items-center justify-center gap-3">
          <div className="relative w-8 h-8 rounded-lg bg-orbit-surface border border-orbit-borderLight flex items-center justify-center">
            <div className="w-4 h-4 rounded-full border border-dashed border-orbit-lime animate-spin-slow" />
            <div className="absolute w-1.5 h-1.5 rounded-full bg-orbit-lime" />
          </div>
          <h1 className="font-display font-bold text-2xl tracking-tight text-orbit-ivory">
            SKILL<span className="text-orbit-lime">ORBIT</span>
          </h1>
        </div>
        <p className="text-xs font-mono tracking-wider text-orbit-steel uppercase mt-1">
          Your career, mapped.
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md p-8 rounded-2xl bg-orbit-surface/80 border border-orbit-borderLight backdrop-blur-xl shadow-2xl z-10 animate-fade-in">
        <div className="mb-6">
          <span className="text-[10px] font-mono uppercase tracking-widest text-orbit-steel">
            AUTHENTICATION // SECURE ACCESS
          </span>
          <h2 className="text-xl font-display font-bold text-orbit-ivory mt-0.5">
            Sign In to SkillOrbit
          </h2>
          <p className="text-xs text-orbit-steel mt-1">
            Access your personalized career fit analysis, roadmap, and interview copilot.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-lg bg-orbit-coral/10 border border-orbit-coral/40 text-orbit-coral text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="leading-snug">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-orbit-steel mb-1.5">
              Email Address or Username
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-orbit-steel absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoComplete="username"
                placeholder="name@university.edu or username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full bg-orbit-midnight border border-orbit-border rounded-lg pl-9 pr-3 py-2.5 text-xs text-orbit-ivory placeholder-orbit-steel/50 focus:outline-none focus:border-orbit-lime/60 transition-colors font-sans"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono uppercase text-orbit-steel">
                Password
              </label>
              <button
                type="button"
                onClick={() => setActivePage('forgot-password')}
                className="text-[11px] font-mono text-orbit-lime hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-orbit-steel absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-orbit-midnight border border-orbit-border rounded-lg pl-9 pr-10 py-2.5 text-xs text-orbit-ivory placeholder-orbit-steel/50 focus:outline-none focus:border-orbit-lime/60 transition-colors font-sans"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-orbit-steel hover:text-orbit-ivory transition-colors p-0.5"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-lg bg-orbit-lime text-orbit-bg font-sans font-bold text-xs uppercase tracking-wider hover:bg-orbit-limeMuted disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg glow-lime"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-orbit-bg border-t-transparent rounded-full animate-spin" />
                Authenticating...
              </>
            ) : (
              <>
                Sign In to Platform
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-orbit-border/70 text-center">
          <p className="text-xs text-orbit-steel">
            Don't have an individual account?{' '}
            <button
              onClick={() => setActivePage('signup')}
              className="text-orbit-lime font-semibold hover:underline"
            >
              Sign Up Now
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
