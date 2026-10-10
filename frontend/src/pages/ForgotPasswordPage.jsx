import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import {
  Mail,
  Lock,
  Key,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Compass,
  Info
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const { setActivePage, addToast } = useApp();

  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // 1 = Request token, 2 = Enter token & new password, 3 = Completed
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tokenNotice, setTokenNotice] = useState('');

  // Step 1: Request reset token
  const handleRequestToken = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please provide your email address.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await api.forgotPassword(email.trim());
      
      if (res.reset_token) {
        setToken(res.reset_token);
        setTokenNotice(res.message);
      }
      setStep(2);
      addToast('Reset token generated successfully.', 'info');
    } catch (err) {
      setError(err.message || 'Unable to process reset request.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!token.trim() || !newPassword || !confirmPassword) {
      setError('Please fill out all fields.');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await api.resetPassword({
        email: email.trim().toLowerCase(),
        token: token.trim().toUpperCase(),
        new_password: newPassword,
        confirm_password: confirmPassword
      });

      setStep(3);
      addToast('Password updated! You can now sign in.', 'success');
    } catch (err) {
      setError(err.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-orbit-bg text-orbit-ivory flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden bg-tech-grid">
      {/* Background ambient ring */}
      <div className="absolute w-[500px] h-[500px] rounded-full border border-dashed border-orbit-steel/10 animate-spin-slow pointer-events-none" />

      {/* Top Brand Header */}
      <div className="text-center mb-6 z-10">
        <button
          onClick={() => setActivePage('login')}
          className="inline-flex items-center gap-2 mb-3 p-1 px-3 rounded-full bg-orbit-surface/80 border border-orbit-border hover:border-orbit-lime/40 text-[11px] font-mono text-orbit-steel hover:text-orbit-ivory transition-colors"
        >
          <Compass className="w-3.5 h-3.5 text-orbit-lime" />
          <span>BACK TO SIGN IN</span>
        </button>

        <h1 className="font-display font-bold text-2xl tracking-tight text-orbit-ivory">
          SKILL<span className="text-orbit-lime">ORBIT</span>
        </h1>
        <p className="text-xs font-mono tracking-wider text-orbit-steel uppercase mt-1">
          Security & Password Recovery
        </p>
      </div>

      <div className="w-full max-w-md p-8 rounded-2xl bg-orbit-surface/80 border border-orbit-borderLight backdrop-blur-xl shadow-2xl z-10 animate-fade-in">
        
        {step === 1 && (
          <div>
            <div className="mb-5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-orbit-steel">
                STEP 01 // IDENTITY LOOKUP
              </span>
              <h2 className="text-xl font-display font-bold text-orbit-ivory mt-0.5">
                Reset Your Password
              </h2>
              <p className="text-xs text-orbit-steel mt-1">
                Enter your account email address to initiate the secure credential reset process.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-orbit-coral/10 border border-orbit-coral/40 text-orbit-coral text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleRequestToken} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-orbit-steel mb-1">
                  Account Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-orbit-steel absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="name@orbit.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-orbit-midnight border border-orbit-border rounded-lg pl-9 pr-3 py-2.5 text-xs text-orbit-ivory placeholder-orbit-steel/50 focus:outline-none focus:border-orbit-lime/60 transition-colors font-sans"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-orbit-lime text-orbit-bg font-sans font-bold text-xs uppercase tracking-wider hover:bg-orbit-limeMuted disabled:opacity-40 transition-all flex items-center justify-center gap-2 shadow-lg glow-lime"
              >
                {loading ? 'Verifying...' : 'Generate Reset Token'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="mb-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-orbit-steel">
                STEP 02 // TOKEN VERIFICATION
              </span>
              <h2 className="text-xl font-display font-bold text-orbit-ivory mt-0.5">
                Set New Password
              </h2>
            </div>

            {/* Honest Environment Explanation Banner */}
            <div className="mb-4 p-3 rounded-lg bg-orbit-surface border border-orbit-border text-xs text-orbit-steel leading-relaxed flex items-start gap-2">
              <Info className="w-4 h-4 text-orbit-lime flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-orbit-ivory">Environment Note: </strong>
                {tokenNotice || "Email delivery is not configured in this local environment. Your one-time verification token has been issued for verification below."}
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-orbit-coral/10 border border-orbit-coral/40 text-orbit-coral text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-mono uppercase text-orbit-steel mb-1">
                  One-Time Reset Token
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-orbit-lime absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="w-full bg-orbit-midnight border border-orbit-lime/40 rounded-lg pl-9 pr-3 py-2 text-xs text-orbit-lime font-mono font-bold tracking-widest uppercase focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-orbit-steel mb-1">
                  New Password (min 8 chars)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-orbit-steel absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-orbit-midnight border border-orbit-border rounded-lg pl-9 pr-3 py-2 text-xs text-orbit-ivory focus:outline-none focus:border-orbit-lime/60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-orbit-steel mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-orbit-steel absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-orbit-midnight border border-orbit-border rounded-lg pl-9 pr-3 py-2 text-xs text-orbit-ivory focus:outline-none focus:border-orbit-lime/60"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-orbit-lime text-orbit-bg font-sans font-bold text-xs uppercase tracking-wider hover:bg-orbit-limeMuted disabled:opacity-40 transition-all flex items-center justify-center gap-2 shadow-lg glow-lime"
              >
                {loading ? 'Updating Credentials...' : 'Save New Password'}
              </button>
            </form>
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 rounded-full bg-orbit-lime/20 border border-orbit-lime flex items-center justify-center mx-auto text-orbit-lime">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-orbit-ivory">
                Password Successfully Reset
              </h3>
              <p className="text-xs text-orbit-steel mt-1">
                Your credentials have been updated in the database. You can now log in to your personal dossier.
              </p>
            </div>
            <button
              onClick={() => setActivePage('login')}
              className="w-full py-3 rounded-lg bg-orbit-lime text-orbit-bg font-sans font-bold text-xs uppercase tracking-wider hover:bg-orbit-limeMuted transition-all"
            >
              Proceed to Sign In
            </button>
          </div>
        )}

        <div className="mt-5 pt-4 border-t border-orbit-border/70 text-center">
          <button
            onClick={() => setActivePage('login')}
            className="text-xs font-mono text-orbit-steel hover:text-orbit-ivory"
          >
            ← Cancel and return to Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
