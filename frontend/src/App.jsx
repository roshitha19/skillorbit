import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import Toast from './components/Toast';

// Auth Pages
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

// Main Application Pages
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import ResumePage from './pages/ResumePage';
import SkillAtlasPage from './pages/SkillAtlasPage';
import JobMatchPage from './pages/JobMatchPage';
import InterviewLabPage from './pages/InterviewLabPage';
import RoadmapPage from './pages/RoadmapPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';

function AppContent() {
  const { activePage, currentUser, setActivePage } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Standalone Auth Pages
  if (activePage === 'login') {
    return (
      <>
        <LoginPage />
        <Toast />
      </>
    );
  }

  if (activePage === 'signup') {
    return (
      <>
        <SignUpPage />
        <Toast />
      </>
    );
  }

  if (activePage === 'forgot-password') {
    return (
      <>
        <ForgotPasswordPage />
        <Toast />
      </>
    );
  }

  // Public Landing Page layout with custom header
  if (activePage === 'landing') {
    return (
      <div className="min-h-screen bg-orbit-bg text-orbit-ivory selection:bg-orbit-lime selection:text-orbit-bg font-sans">
        {/* Landing Top Nav */}
        <header className="sticky top-0 z-30 h-16 bg-orbit-midnight/90 border-b border-orbit-border backdrop-blur-md px-6 lg:px-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orbit-surface border border-orbit-borderLight flex items-center justify-center">
              <div className="w-4 h-4 rounded-full border border-dashed border-orbit-lime animate-spin-slow" />
              <div className="absolute w-1.5 h-1.5 rounded-full bg-orbit-lime" />
            </div>
            <div>
              <span className="font-display font-bold tracking-tight text-base text-orbit-ivory">
                SKILL<span className="text-orbit-lime">ORBIT</span>
              </span>
              <span className="text-[9px] font-mono tracking-wider text-orbit-steel uppercase ml-2 hidden sm:inline">
                Your career, mapped.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActivePage('dashboard')}
                  className="text-xs font-mono text-orbit-steel hover:text-orbit-ivory transition-colors"
                >
                  DASHBOARD //
                </button>
                <button
                  onClick={() => setActivePage('dashboard')}
                  className="px-4 py-2 rounded-lg bg-orbit-lime text-orbit-bg font-sans font-bold text-xs uppercase tracking-wider hover:bg-orbit-limeMuted transition-all shadow glow-lime"
                >
                  Open Dossier ({currentUser.full_name.split(' ')[0]})
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActivePage('login')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-mono text-orbit-ivory hover:text-orbit-lime transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setActivePage('signup')}
                  className="px-4 py-2 rounded-lg bg-orbit-lime text-orbit-bg font-sans font-bold text-xs uppercase tracking-wider hover:bg-orbit-limeMuted transition-all shadow glow-lime"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </header>

        <main>
          <LandingPage />
        </main>
        <Toast />
      </div>
    );
  }

  // Application Layout (Dashboard, Resume, Atlas, Match, Interview, Roadmap, Analytics, Settings)
  return (
    <div className="min-h-screen bg-orbit-bg text-orbit-ivory selection:bg-orbit-lime selection:text-orbit-bg flex">
      {/* Sidebar (Desktop permanent, Mobile drawer) */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <TopHeader onOpenSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activePage === 'dashboard' && <DashboardPage />}
          {activePage === 'resume' && <ResumePage />}
          {activePage === 'atlas' && <SkillAtlasPage />}
          {activePage === 'match' && <JobMatchPage />}
          {activePage === 'interview' && <InterviewLabPage />}
          {activePage === 'roadmap' && <RoadmapPage />}
          {activePage === 'analytics' && <AnalyticsPage />}
          {activePage === 'settings' && <SettingsPage />}
        </main>
      </div>

      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
