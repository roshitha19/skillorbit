import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Menu,
  Bell,
  Cpu,
  ChevronDown,
  User,
  Check,
  LogOut,
  Settings,
  ShieldCheck,
  X
} from 'lucide-react';

export default function TopHeader({ onOpenSidebar }) {
  const {
    targetRoleId,
    setTargetRoleId,
    roles,
    candidate,
    currentUser,
    logout,
    matchData,
    healthStatus,
    setActivePage
  } = useApp();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const currentRole = roles.find(r => r.id === targetRoleId) || {
    id: targetRoleId,
    title: targetRoleId ? targetRoleId.replace(/-/g, ' ').toUpperCase() : 'Role'
  };

  const notifications = [
    { id: 1, title: 'Evaluation Engine Active', desc: healthStatus?.active_evaluation_engine || 'Deterministic Rubric Evaluator ready', time: 'Now' },
    { id: 2, title: 'Multi-User Isolation Active', desc: 'Personal dossier and telemetry authenticated securely.', time: 'Now' },
    { id: 3, title: 'Session Verified', desc: currentUser ? `Authenticated as ${currentUser.full_name}` : 'Public Guest Session', time: 'Now' }
  ];

  return (
    <header className="sticky top-0 z-30 h-16 bg-orbit-midnight/90 border-b border-orbit-border backdrop-blur-md px-4 lg:px-8 flex items-center justify-between">
      {/* Left: Mobile hamburger & Target Role selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="p-2 rounded-lg text-orbit-steel hover:text-orbit-ivory hover:bg-orbit-surface lg:hidden transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Target Role Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-orbit-surface/80 border border-orbit-border hover:border-orbit-steel/60 transition-all text-xs"
          >
            <span className="text-[10px] font-mono uppercase text-orbit-steel hidden sm:inline">
              TARGET ROLE:
            </span>
            <span className="font-medium text-orbit-ivory font-display truncate max-w-[150px] sm:max-w-[220px]">
              {currentRole.title}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-orbit-steel" />
          </button>

          {showRoleMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowRoleMenu(false)}
              />
              <div className="absolute left-0 mt-2 w-72 rounded-xl bg-orbit-midnight border border-orbit-borderLight shadow-2xl p-2 z-50 animate-fade-in">
                <div className="px-3 py-2 text-[10px] font-mono uppercase text-orbit-steel tracking-wider border-b border-orbit-border">
                  SELECT TARGET BENCHMARK
                </div>
                <div className="max-h-72 overflow-y-auto py-1">
                  {roles.map((r) => {
                    const isSelected = r.id === targetRoleId;
                    return (
                      <button
                        key={r.id}
                        onClick={() => {
                          setTargetRoleId(r.id);
                          setShowRoleMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-orbit-surface text-orbit-lime font-semibold'
                            : 'text-orbit-steel hover:text-orbit-ivory hover:bg-orbit-surface/50'
                        }`}
                      >
                        <div>
                          <div className="font-medium text-orbit-ivory">{r.title}</div>
                          <div className="text-[10px] text-orbit-steel font-mono">{r.category}</div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-orbit-lime" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Fit Score Badge */}
        {matchData && currentUser && (
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orbit-surface/60 border border-orbit-border text-xs font-mono">
            <span className="text-orbit-steel">READINESS:</span>
            <span className="text-orbit-lime font-bold">{matchData.fit_score}%</span>
          </div>
        )}
      </div>

      {/* Right: Engine Indicator, Notifications & User */}
      <div className="flex items-center gap-3">
        {/* Engine status pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orbit-surface/60 border border-orbit-border text-[11px] font-mono text-orbit-steel">
          <Cpu className="w-3.5 h-3.5 text-orbit-lime" />
          <span className="truncate max-w-[140px] lg:max-w-none">
            {healthStatus?.active_evaluation_engine || 'Deterministic Engine'}
          </span>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-orbit-steel hover:text-orbit-ivory hover:bg-orbit-surface transition-colors relative"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orbit-lime ring-2 ring-orbit-midnight" />
          </button>

          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 mt-2 w-80 rounded-xl bg-orbit-midnight border border-orbit-borderLight shadow-2xl p-4 z-50 animate-fade-in">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-orbit-border">
                  <span className="text-xs font-mono font-bold uppercase text-orbit-ivory">
                    System Feed
                  </span>
                  <span className="text-[10px] font-mono text-orbit-steel">3 updates</span>
                </div>
                <div className="space-y-3">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-2 rounded-lg bg-orbit-surface/40 border border-orbit-border/50 text-xs">
                      <div className="flex items-center justify-between font-medium text-orbit-ivory">
                        <span>{n.title}</span>
                        <span className="text-[10px] font-mono text-orbit-steel">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-orbit-steel mt-0.5 leading-snug">{n.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Candidate / User Profile Menu */}
        {currentUser ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 pl-2.5 rounded-lg bg-orbit-surface border border-orbit-border hover:border-orbit-lime/40 transition-all text-xs"
            >
              <span className="font-medium text-orbit-ivory hidden sm:inline truncate max-w-[120px]">
                {currentUser.full_name}
              </span>
              <div className="w-6 h-6 rounded-md bg-orbit-lime text-orbit-bg font-bold font-mono text-xs flex items-center justify-center">
                {currentUser.full_name.charAt(0)}
              </div>
              <ChevronDown className="w-3 h-3 text-orbit-steel hidden sm:inline" />
            </button>

            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-orbit-midnight border border-orbit-borderLight shadow-2xl p-3 z-50 animate-fade-in">
                  <div className="pb-3 mb-2 border-b border-orbit-border">
                    <div className="font-semibold text-orbit-ivory text-xs truncate">
                      {currentUser.full_name}
                    </div>
                    <div className="text-[11px] text-orbit-steel font-mono truncate">
                      {currentUser.email}
                    </div>
                    <div className="text-[10px] font-mono text-orbit-lime mt-1 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Individual Account
                    </div>
                  </div>

                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setActivePage('settings');
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-orbit-steel hover:text-orbit-ivory hover:bg-orbit-surface transition-colors text-left"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>Profile & Settings</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-orbit-coral hover:bg-orbit-coral/10 transition-colors text-left font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActivePage('login')}
              className="px-3 py-1.5 rounded-lg text-xs font-mono text-orbit-ivory hover:text-orbit-lime transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => setActivePage('signup')}
              className="px-3.5 py-1.5 rounded-lg bg-orbit-lime text-orbit-bg font-sans font-bold text-xs uppercase tracking-wider hover:bg-orbit-limeMuted transition-all shadow glow-lime"
            >
              Get Started
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
