import React from 'react';
import { useApp } from '../context/AppContext';
import SkillOrbitHeroVisual from '../components/SkillOrbitHeroVisual';
import {
  ArrowRight,
  ShieldCheck,
  Target,
  Terminal,
  Milestone,
  FileText,
  Compass,
  Cpu,
  CheckCircle2,
  ChevronRight,
  Layers
} from 'lucide-react';

export default function LandingPage() {
  const { setActivePage, roles, targetRoleId } = useApp();
  const currentRole = roles.find(r => r.id === targetRoleId) || { title: "Frontend Engineer" };

  return (
    <div className="relative min-h-screen bg-orbit-bg text-orbit-ivory selection:bg-orbit-lime selection:text-orbit-bg">
      {/* Hero Section */}
      <section className="relative px-6 lg:px-16 pt-12 pb-24 overflow-hidden bg-tech-grid">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6 z-10 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orbit-surface/90 border border-orbit-borderLight">
              <span className="w-2 h-2 rounded-full bg-orbit-lime animate-pulse" />
              <span className="text-[11px] font-mono tracking-widest uppercase text-orbit-lime">
                AI CAREER INTELLIGENCE & ADAPTIVE COPILOT
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight leading-[1.08] text-orbit-ivory">
              Your career, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orbit-lime via-orbit-ivory to-orbit-steel">
                mapped.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-orbit-steel max-w-xl font-sans leading-relaxed">
              Bridge the divide between what your resume claims and what high-performing engineering teams evaluate. Discover precision skill gaps, practice adaptive interview scenarios, and follow an actionable milestone roadmap.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => setActivePage('resume')}
                className="px-6 py-3.5 rounded-lg bg-orbit-lime text-orbit-bg font-sans font-bold text-xs uppercase tracking-wider hover:bg-orbit-limeMuted transition-all flex items-center gap-2.5 shadow-xl glow-lime"
              >
                Start career analysis
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActivePage('dashboard')}
                className="px-6 py-3.5 rounded-lg bg-orbit-surface border border-orbit-border text-orbit-ivory font-sans font-medium text-xs uppercase tracking-wider hover:border-orbit-steel hover:bg-orbit-surfaceLight transition-all flex items-center gap-2"
              >
                Explore the platform
                <Compass className="w-4 h-4 text-orbit-steel" />
              </button>
            </div>

            {/* Micro Metrics bar */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-orbit-border/60 max-w-lg">
              <div>
                <div className="text-xl sm:text-2xl font-mono font-bold text-orbit-ivory">8+</div>
                <div className="text-[11px] font-mono text-orbit-steel uppercase">Tech Benchmarks</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-mono font-bold text-orbit-lime">100%</div>
                <div className="text-[11px] font-mono text-orbit-steel uppercase">Evidence-Based</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-mono font-bold text-orbit-ivory">Multi-Rubric</div>
                <div className="text-[11px] font-mono text-orbit-steel uppercase">Adaptive Studio</div>
              </div>
            </div>
          </div>

          {/* Hero Right Visual: Distinctive Skill Orbit */}
          <div className="lg:col-span-5 flex items-center justify-center relative">
            <SkillOrbitHeroVisual
              roleTitle={currentRole.title}
              onSelectSkill={(skill) => {
                setActivePage('atlas');
              }}
            />
          </div>
        </div>
      </section>

      {/* The 4-Step Continuous Workflow */}
      <section className="py-20 px-6 lg:px-16 border-t border-orbit-border/70 bg-orbit-midnight/60">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[10px] font-mono tracking-widest uppercase text-orbit-steel">
              CONTINUOUS INTELLIGENCE ARCHITECTURE
            </span>
            <h2 className="text-3xl font-display font-bold text-orbit-ivory mt-1">
              From Document Extraction to Verified Job Offer
            </h2>
            <p className="text-sm text-orbit-steel mt-2">
              Career progression is not a static quiz. SkillOrbit treats career readiness as an ongoing evidentiary feedback loop.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Analyze",
                tagline: "Resume Ingestion & Sectioning",
                desc: "Ingests PDF/DOCX files, decomposes education, experience, and project claims, and extracts technical competencies.",
                icon: FileText,
                page: "resume"
              },
              {
                step: "02",
                title: "Discover",
                tagline: "Benchmarked Gap Quantification",
                desc: "Matches your verified skills against industry benchmarks. Isolates missing competencies without vanity scores.",
                icon: Target,
                page: "match"
              },
              {
                step: "03",
                title: "Practise",
                tagline: "Adaptive Interview Studio",
                desc: "Answers scenario questions scored against strict multi-metric rubrics (relevance, clarity, depth, and examples).",
                icon: Terminal,
                page: "interview"
              },
              {
                step: "04",
                title: "Improve",
                tagline: "Targeted Milestone Roadmap",
                desc: "Follows phased learning sprints with verified official documentation, code exercises, and progress persistence.",
                icon: Milestone,
                page: "roadmap"
              }
            ].map((st) => {
              const Icon = st.icon;
              return (
                <div
                  key={st.step}
                  onClick={() => setActivePage(st.page)}
                  className="group p-6 rounded-xl bg-orbit-surface/70 border border-orbit-border hover:border-orbit-lime/50 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-mono font-bold text-orbit-lime">
                        PHASE // {st.step}
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-orbit-midnight border border-orbit-border flex items-center justify-center group-hover:border-orbit-lime/40 transition-colors">
                        <Icon className="w-4 h-4 text-orbit-steel group-hover:text-orbit-lime transition-colors" />
                      </div>
                    </div>
                    <h3 className="text-xl font-display font-bold text-orbit-ivory group-hover:text-orbit-lime transition-colors">
                      {st.title}
                    </h3>
                    <div className="text-xs font-mono text-orbit-steel mt-0.5 mb-3">
                      {st.tagline}
                    </div>
                    <p className="text-xs font-sans text-orbit-steel/90 leading-relaxed">
                      {st.desc}
                    </p>
                  </div>

                  <div className="pt-4 mt-6 border-t border-orbit-border/60 flex items-center justify-between text-xs font-mono text-orbit-steel group-hover:text-orbit-ivory">
                    <span>EXPLORE WORKFLOW</span>
                    <ChevronRight className="w-4 h-4 text-orbit-lime transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Editorial Feature Highlights */}
      <section className="py-20 px-6 lg:px-16 border-t border-orbit-border/70 bg-orbit-bg">
        <div className="max-w-7xl mx-auto space-y-16">
          
          {/* Feature 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-4">
              <span className="text-[10px] font-mono tracking-widest uppercase text-orbit-lime">
                FEATURE 01 // EVIDENTIARY DISTINCTION
              </span>
              <h3 className="text-2xl sm:text-3xl font-display font-bold text-orbit-ivory leading-tight">
                Never treat a buzzword on a resume as proven mastery.
              </h3>
              <p className="text-sm text-orbit-steel leading-relaxed">
                Traditional platforms give high match scores just because a keyword appears in a bullet point. SkillOrbit establishes three distinct evidentiary classes:
              </p>
              <div className="space-y-3 pt-2">
                <div className="p-3 rounded-lg bg-orbit-surface/60 border border-orbit-lime/30 flex items-start gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-orbit-lime mt-1 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-orbit-lime font-mono">DEMONSTRATED IN PRACTICE</div>
                    <div className="text-xs text-orbit-steel">Validated through technical scenarios in our Adaptive Interview Lab.</div>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-orbit-surface/60 border border-orbit-border flex items-start gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-orbit-ivory mt-1 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-orbit-ivory font-mono">LISTED ON RESUME</div>
                    <div className="text-xs text-orbit-steel">Extracted from your resume projects and experience, pending diagnostic proof.</div>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-orbit-surface/60 border border-orbit-coral/30 flex items-start gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-orbit-coral mt-1 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-orbit-coral font-mono">ACTIVE GAP</div>
                    <div className="text-xs text-orbit-steel">Critical benchmark requirements with zero evidence on file.</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 p-6 rounded-xl bg-orbit-surface/70 border border-orbit-border backdrop-blur-sm">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-orbit-border">
                <span className="text-xs font-mono font-bold text-orbit-ivory">EVIDENTIARY MATRIX COMPARISON</span>
                <span className="text-[10px] font-mono text-orbit-steel">BENCHMARK: FRONTEND</span>
              </div>
              <div className="space-y-3 text-xs">
                {[
                  { name: "React.js", req: 90, status: "demonstrated", score: 84 },
                  { name: "JavaScript (ES6+)", req: 90, status: "demonstrated", score: 88 },
                  { name: "HTML5 & Accessibility", req: 95, status: "listed", score: 75 },
                  { name: "TypeScript", req: 85, status: "gap", score: 45 },
                  { name: "Web Performance & CWV", req: 85, status: "gap", score: 40 },
                ].map((s) => (
                  <div key={s.name} className="flex items-center justify-between p-2.5 rounded bg-orbit-midnight/60 border border-orbit-border/50">
                    <span className="font-medium text-orbit-ivory">{s.name}</span>
                    <div className="flex items-center gap-3 font-mono text-[11px]">
                      <span className="text-orbit-steel">Target: {s.req}%</span>
                      <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] ${
                        s.status === 'demonstrated' ? 'bg-orbit-lime/20 text-orbit-lime' :
                        s.status === 'gap' ? 'bg-orbit-coral/20 text-orbit-coral' : 'bg-orbit-surface text-orbit-ivory'
                      }`}>
                        {s.status} ({s.score}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-orbit-border/70 py-12 px-6 lg:px-16 bg-orbit-midnight text-xs text-orbit-steel">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-orbit-surface border border-orbit-border flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-orbit-lime" />
            </div>
            <div>
              <span className="font-display font-bold text-orbit-ivory tracking-tight">SKILLORBIT</span>
              <span className="text-orbit-steel ml-2 font-mono text-[10px]">CAREER INTELLIGENCE SYSTEM</span>
            </div>
          </div>

          <div className="flex items-center gap-6 font-mono text-[11px]">
            <button onClick={() => setActivePage('dashboard')} className="hover:text-orbit-lime transition-colors">DASHBOARD</button>
            <button onClick={() => setActivePage('resume')} className="hover:text-orbit-lime transition-colors">RESUME</button>
            <button onClick={() => setActivePage('atlas')} className="hover:text-orbit-lime transition-colors">ATLAS</button>
            <button onClick={() => setActivePage('interview')} className="hover:text-orbit-lime transition-colors">INTERVIEW LAB</button>
            <button onClick={() => setActivePage('roadmap')} className="hover:text-orbit-lime transition-colors">ROADMAP</button>
          </div>

          <div className="font-mono text-[10px] text-orbit-steel/70">
            © 2026 SKILLORBIT · ALL SYSTEM DATA PERSISTED LOCALLY
          </div>
        </div>
      </footer>
    </div>
  );
}
