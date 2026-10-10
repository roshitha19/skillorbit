import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  User,
  Mail,
  Lock,
  AtSign,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Compass
} from 'lucide-react';

export default function SignUpPage() {
  const { register, setActivePage } = useApp();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Password requirement flags
  const hasMinLength = password.length >= 8;
  const hasSpecialOrDigit = /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !email.trim() || !username.trim() || !password || !confirmPassword) {
      setError('Please fill out all required fields.');
      return;
    }

    if (!/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(email)) {
      setError('Please provide a valid email address.');
      return;
    }

    if (!/^[a-zA-Z0-9_]{3,24}$/.test(username)) {
      setError('Username must be 3-24 characters containing only letters, numbers, and underscores.');
      return;
    }

    if (!hasMinLength || !hasSpecialOrDigit) {
      setError('Password does not satisfy the security requirements (≥8 chars, 1 number/symbol).');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await register({
        full_name: fullName.trim(),
        email: email.trim().lower ? email.trim().toLowerCase() : email.trim(),
        username: username.trim().toLowerCase ? username.trim().toLowerCase() : username.trim(),
        password,
        confirm_password: confirmPassword
      });
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-orbit-bg text-orbit-ivory flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden bg-tech-grid">
      {/* Background ambient orbit rings */}
      <div className="absolute w-[600px] h-[600px] rounded-full border border-dashed border-orbit-steel/10 animate-spin-slow pointer-events-none" />

      {/* Top Brand Header */}
      <div className="text-center mb-6 z-10">
        <button
          onClick={() => setActivePage('landing')}
          className="inline-flex items-center gap-2 mb-3 p-1 px-3 rounded-full bg-orbit-surface/80 border border-orbit-border hover:border-orbit-lime/40 text-[11px] font-mono text-orbit-steel hover:text-orbit-ivory transition-colors"
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

      {/* Sign Up Card */}
      <div className="w-full max-w-lg p-8 rounded-2xl bg-orbit-surface/80 border border-orbit-borderLight backdrop-blur-xl shadow-2xl z-10 animate-fade-in">
        <div className="mb-5">
          <span className="text-[10px] font-mono uppercase tracking-widest text-orbit-steel">
            ENROLLMENT // CREATE INDIVIDUAL DOSSIER
          </span>
          <h2 className="text-xl font-display font-bold text-orbit-ivory mt-0.5">
            Create Your Account
          </h2>
          <p className="text-xs text-orbit-steel mt-1">
            Build your personal, isolated career intelligence profile with adaptive interview diagnostics.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-lg bg-orbit-coral/10 border border-orbit-coral/40 text-orbit-coral text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="leading-snug">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-mono uppercase text-orbit-steel mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-orbit-steel absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Maya Patel"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-orbit-midnight border border-orbit-border rounded-lg pl-9 pr-3 py-2 text-xs text-orbit-ivory placeholder-orbit-steel/50 focus:outline-none focus:border-orbit-lime/60 transition-colors font-sans"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-orbit-steel mb-1">
                Username
              </label>
              <div className="relative">
                <AtSign className="w-4 h-4 text-orbit-steel absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="mayap_dev"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-orbit-midnight border border-orbit-border rounded-lg pl-9 pr-3 py-2 text-xs text-orbit-ivory placeholder-orbit-steel/50 focus:outline-none focus:border-orbit-lime/60 transition-colors font-sans"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-orbit-steel mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-orbit-steel absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="maya.patel@orbit.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-orbit-midnight border border-orbit-border rounded-lg pl-9 pr-3 py-2 text-xs text-orbit-ivory placeholder-orbit-steel/50 focus:outline-none focus:border-orbit-lime/60 transition-colors font-sans"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-mono uppercase text-orbit-steel mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-orbit-steel absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-orbit-midnight border border-orbit-border rounded-lg pl-9 pr-9 py-2 text-xs text-orbit-ivory placeholder-orbit-steel/50 focus:outline-none focus:border-orbit-lime/60 transition-colors font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-orbit-steel hover:text-orbit-ivory p-0.5"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-orbit-steel mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-orbit-steel absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-orbit-midnight border border-orbit-border rounded-lg pl-9 pr-3 py-2 text-xs text-orbit-ivory placeholder-orbit-steel/50 focus:outline-none focus:border-orbit-lime/60 transition-colors font-sans"
                />
              </div>
            </div>
          </div>

          {/* Password checklist badges */}
          <div className="p-3 rounded-lg bg-orbit-midnight/60 border border-orbit-border/70 space-y-1 text-[11px] font-mono">
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${hasMinLength ? 'bg-orbit-lime' : 'bg-orbit-steel'}`} />
              <span className={hasMinLength ? 'text-orbit-lime' : 'text-orbit-steel'}>
                Minimum 8 characters
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${hasSpecialOrDigit ? 'bg-orbit-lime' : 'bg-orbit-steel'}`} />
              <span className={hasSpecialOrDigit ? 'text-orbit-lime' : 'text-orbit-steel'}>
                Includes number or symbol
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${passwordsMatch ? 'bg-orbit-lime' : 'bg-orbit-steel'}`} />
              <span className={passwordsMatch ? 'text-orbit-lime' : 'text-orbit-steel'}>
                Passwords match
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-3 rounded-lg bg-orbit-lime text-orbit-bg font-sans font-bold text-xs uppercase tracking-wider hover:bg-orbit-limeMuted disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg glow-lime"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-orbit-bg border-t-transparent rounded-full animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                Create Account & Launch Dossier
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-orbit-border/70 text-center">
          <p className="text-xs text-orbit-steel">
            Already registered?{' '}
            <button
              onClick={() => setActivePage('login')}
              className="text-orbit-lime font-semibold hover:underline"
            >
              Sign In Instead
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
