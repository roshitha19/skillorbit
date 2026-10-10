import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Compass,
  LayoutDashboard,
  FileText,
  Orbit,
  Target,
  Terminal,
  Milestone,
  BarChart3,
  Settings,
  ChevronRight,
  ShieldCheck,
  LogOut,
  LogIn,
  UserCheck
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const {
    activePage,
    setActivePage,
    currentUser,
    candidate,
    matchData,
    logout
  } = useApp();

  const navItems = [
    { id: 'landing', label: 'Platform Home', icon: Compass, badge: null },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: 'Signature' },
    { id: 'resume', label: 'Resume Intelligence', icon: FileText, badge: null },
    { id: 'atlas', label: 'Skill Atlas', icon: Orbit, badge: null },
    { id: 'match', label: 'Job Match Matrix', icon: Target, badge: null },
    { id: 'interview', label: 'Adaptive Interview Lab', icon: Terminal, badge: 'Studio' },
    { id: 'roadmap', label: 'Career Roadmap', icon: Milestone, badge: null },
    { id: 'analytics', label: 'Progress Analytics', icon: BarChart3, badge: null },
    { id: 'settings', label: 'Profile & Settings', icon: Settings, badge: null },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-orbit-bg/80 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-orbit-midnight border-r border-orbit-border flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Brand Identity */}
        <div>
          <div className="p-6 border-b border-orbit-border/70 flex items-center gap-3">
            {/* Custom SVG Logo Icon */}
            <div className="relative w-9 h-9 rounded-lg bg-orbit-surface border border-orbit-borderLight flex items-center justify-center flex-shrink-0">
              <div className="w-5 h-5 rounded-full border border-dashed border-orbit-lime animate-spin-slow" />
              <div className="absolute w-2 h-2 rounded-full bg-orbit-lime glow-lime" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold tracking-tight text-lg text-orbit-ivory">
                  SKILL<span className="text-orbit-lime">ORBIT</span>
                </span>
              </div>
              <p className="text-[10px] font-mono tracking-wider text-orbit-steel uppercase">
                Your career, mapped.
              </p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-250px)]">
            <div className="px-3 py-1.5 text-[9px] font-mono tracking-widest text-orbit-steel/70 uppercase">
              NAVIGATION // CORE
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActivePage(item.id);
                    if (onClose) onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-sans transition-all group ${
                    isActive
                      ? 'bg-orbit-surface text-orbit-lime font-medium border border-orbit-lime/30 shadow-sm'
                      : 'text-orbit-steel hover:text-orbit-ivory hover:bg-orbit-surface/50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-orbit-lime' : 'text-orbit-steel group-hover:text-orbit-ivory'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase ${
                      isActive 
                        ? 'border-orbit-lime/40 text-orbit-lime bg-orbit-lime/10' 
                        : 'border-orbit-border text-orbit-steel bg-orbit-surface/30'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Candidate Status Card or Sign In Prompt */}
        <div className="p-4 m-3 rounded-lg bg-orbit-surface/60 border border-orbit-border/80">
          {currentUser ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-orbit-lime" />
                  <span className="text-[10px] font-mono uppercase text-orbit-steel">
                    PERSONAL DOSSIER
                  </span>
                </div>
                <span className="w-2 h-2 rounded-full bg-orbit-lime animate-pulse" />
              </div>

              <div className="text-xs font-semibold text-orbit-ivory truncate">
                {currentUser.full_name}
              </div>
              <div className="text-[11px] text-orbit-steel font-mono truncate">
                Fit: <span className="text-orbit-lime font-bold">{matchData?.fit_score || 0}%</span> · {matchData?.demonstrated_count || 0} verified
              </div>

              <div className="w-full bg-orbit-midnight rounded-full h-1 my-2 overflow-hidden">
                <div
                  className="bg-orbit-lime h-full rounded-full transition-all duration-500"
                  style={{ width: `${matchData?.fit_score || 0}%` }}
                />
              </div>

              <button
                onClick={logout}
                className="w-full mt-2 pt-2 border-t border-orbit-border/60 flex items-center justify-between text-[11px] font-mono text-orbit-steel hover:text-orbit-coral transition-colors"
              >
                <span>SIGN OUT</span>
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="space-y-2 text-center">
              <div className="text-xs font-medium text-orbit-ivory">
                Guest Explorer
              </div>
              <p className="text-[11px] text-orbit-steel leading-tight">
                Sign in to save your personal career analysis & practice history.
              </p>
              <button
                onClick={() => {
                  setActivePage('login');
                  if (onClose) onClose();
                }}
                className="w-full mt-1 py-1.5 rounded bg-orbit-lime text-orbit-bg font-sans font-bold text-xs uppercase tracking-wider hover:bg-orbit-limeMuted transition-all flex items-center justify-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
