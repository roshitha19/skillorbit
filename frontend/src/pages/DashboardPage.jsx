import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import RadialScoreInstrument from '../components/RadialScoreInstrument';
import SkillAtlasGraph from '../components/SkillAtlasGraph';
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Terminal,
  Milestone,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertTriangle,
  History,
  FileCheck2,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';

export default function DashboardPage() {
  const {
    matchData,
    candidate,
    roles,
    targetRoleId,
    launchInterviewForSkill,
    setActivePage,
    analytics
  } = useApp();

  const [history, setHistory] = useState([]);

  useEffect(() => {
    api.getInterviewHistory()
      .then(res => setHistory(res || []))
      .catch(() => setHistory([]));
  }, []);

  const currentRole = roles.find(r => r.id === targetRoleId) || {
    id: targetRoleId,
    title: "Frontend Engineer"
  };

  const nextAction = matchData?.next_best_action || {
    title: "Bridge Priority Gap: TypeScript",
    description: "Essential competency for Frontend Engineer. Practice key scenarios to boost role readiness by up to 12%.",
    skill_name: "TypeScript",
    action_type: "interview_lab"
  };

  // Readiness stages
  const fitScore = matchData?.fit_score || 47;
  const stages = [
    { name: "1. Resume Parsing", done: true, desc: "Document ingested and sectioned" },
    { name: "2. Gap Quantification", done: true, desc: "Evaluated against benchmark competencies" },
    { name: "3. Practice Validation", done: fitScore >= 60, desc: "Validated via Adaptive Interview Lab" },
    { name: "4. Offer Ready", done: fitScore >= 85, desc: "Ready for senior technical evaluation" }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Welcome & Role Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-xl bg-orbit-surface/60 border border-orbit-border backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest uppercase text-orbit-steel">
              DASHBOARD // CAREER INTELLIGENCE DOSSIER
            </span>
            <span className="px-2 py-0.5 rounded-full bg-orbit-lime/10 border border-orbit-lime/30 text-[10px] font-mono text-orbit-lime">
              LIVE DATA
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-orbit-ivory mt-1">
            Welcome back, {candidate?.name || 'Candidate'}
          </h1>
          <p className="text-xs sm:text-sm text-orbit-steel mt-0.5">
            Active Target: <span className="text-orbit-ivory font-medium">{currentRole.title}</span> · Median Benchmark: <span className="text-orbit-lime font-mono">{matchData?.median_salary || "$115,000"}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActivePage('resume')}
            className="px-4 py-2 rounded-lg bg-orbit-midnight border border-orbit-border hover:border-orbit-steel text-xs font-sans text-orbit-ivory transition-colors flex items-center gap-2"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-orbit-steel" />
            Update Resume
          </button>
          <button
            onClick={() => setActivePage('interview')}
            className="px-4 py-2 rounded-lg bg-orbit-lime text-orbit-bg font-sans font-semibold text-xs uppercase tracking-wider hover:bg-orbit-limeMuted transition-all flex items-center gap-2 shadow glow-lime"
          >
            <Terminal className="w-3.5 h-3.5" />
            Interview Studio
          </button>
        </div>
      </div>

      {/* Grid: Role Fit Radial Gauge + Next Best Action */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* A. Role Fit Radial Instrument (5 cols) */}
        <div className="lg:col-span-5">
          <RadialScoreInstrument
            score={matchData?.fit_score || 47}
            demonstrated={matchData?.demonstrated_count || 2}
            listed={matchData?.listed_count || 4}
            gaps={matchData?.gap_count || 3}
            total={matchData?.total_analyzed || 12}
            roleTitle={currentRole.title}
          />
        </div>

        {/* C & D. Next Best Action + Readiness Stages (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-6">
          {/* Next Best Action Card */}
          <div className="p-6 rounded-xl bg-orbit-surface/80 border border-orbit-lime/40 backdrop-blur-sm relative overflow-hidden flex flex-col justify-between flex-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orbit-lime/5 rounded-full blur-2xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-orbit-lime/20 border border-orbit-lime/40 flex items-center justify-center">
                    <Zap className="w-3.5 h-3.5 text-orbit-lime" />
                  </div>
                  <span className="text-[10px] font-mono tracking-wider uppercase text-orbit-lime font-bold">
                    NEXT BEST ACTION // RECOMMENDED
                  </span>
                </div>
                <span className="text-[10px] font-mono text-orbit-steel">
                  PRIORITY: HIGH
                </span>
              </div>

              <h3 className="text-xl font-display font-bold text-orbit-ivory">
                {nextAction.title}
              </h3>

              <p className="text-xs sm:text-sm text-orbit-steel mt-2 leading-relaxed">
                {nextAction.description}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-orbit-border/60 flex items-center justify-between">
              <span className="text-xs font-mono text-orbit-steel">
                Target Competency: <span className="text-orbit-ivory font-bold">{nextAction.skill_name}</span>
              </span>

              <button
                onClick={() => {
                  if (nextAction.action_type === 'interview_lab') {
                    launchInterviewForSkill(nextAction.skill_name);
                  } else {
                    setActivePage('roadmap');
                  }
                }}
                className="px-4 py-2 rounded-lg bg-orbit-lime text-orbit-bg font-sans font-semibold text-xs uppercase tracking-wider hover:bg-orbit-limeMuted transition-all flex items-center gap-2"
              >
                <span>Execute Exercise</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* D. Interview Readiness Progress Stages */}
          <div className="p-5 rounded-xl bg-orbit-surface/60 border border-orbit-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-orbit-steel">
                READINESS TRAJECTORY // MILESTONES
              </span>
              <span className="text-xs font-mono text-orbit-lime font-bold">
                STAGE {fitScore >= 85 ? '4/4' : fitScore >= 60 ? '3/4' : '2/4'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {stages.map((st, i) => (
                <div
                  key={i}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    st.done
                      ? 'bg-orbit-lime/10 border-orbit-lime/40 text-orbit-lime'
                      : 'bg-orbit-midnight/60 border-orbit-border text-orbit-steel'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold font-mono">
                      {st.done ? <CheckCircle2 className="w-3.5 h-3.5 text-orbit-lime inline mr-1" /> : null}
                      {st.name.split('.')[0]}
                    </span>
                    <span className="text-[9px] font-mono uppercase">
                      {st.done ? 'COMPLETED' : 'PENDING'}
                    </span>
                  </div>
                  <div className="text-[11px] font-medium text-orbit-ivory truncate">
                    {st.name.split('. ')[1]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* B. Interactive Skill Atlas (Signature Experience) */}
      <div className="w-full">
        <SkillAtlasGraph compact={true} />
      </div>

      {/* Bottom Grid: E. Skill Gap Analytics & F. Recent Practice Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* E. Skill Gap Comparative Analytics (6 cols) */}
        <div className="lg:col-span-6 p-6 rounded-xl bg-orbit-surface/60 border border-orbit-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-orbit-border">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-orbit-steel">
                  ANALYTICS 02 // GAP DISCOVERY
                </span>
                <h3 className="text-lg font-display font-semibold text-orbit-ivory mt-0.5">
                  Benchmark vs. Evidenced Readiness
                </h3>
              </div>
              <button
                onClick={() => setActivePage('match')}
                className="text-xs font-mono text-orbit-lime hover:underline flex items-center gap-1"
              >
                Full Matrix <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3.5">
              {(matchData?.requirements || []).slice(0, 5).map((req) => {
                const diff = req.candidate_score - req.benchmark;
                return (
                  <div key={req.skill_name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-orbit-ivory flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          req.status === 'demonstrated' ? 'bg-orbit-lime' :
                          req.status === 'gap' ? 'bg-orbit-coral' : 'bg-orbit-ivory'
                        }`} />
                        {req.skill_name}
                      </span>
                      <span className="font-mono text-xs">
                        <span className="text-orbit-lime font-bold">{req.candidate_score}%</span>
                        <span className="text-orbit-steel"> / {req.benchmark}%</span>
                      </span>
                    </div>

                    <div className="w-full bg-orbit-midnight rounded-full h-1.5 overflow-hidden flex">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          req.status === 'demonstrated' ? 'bg-orbit-lime' :
                          req.status === 'gap' ? 'bg-orbit-coral' : 'bg-orbit-ivory'
                        }`}
                        style={{ width: `${req.candidate_score}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-orbit-border/60 text-[11px] text-orbit-steel flex items-center justify-between">
            <span>Bars reflect current evaluated proficiency</span>
            <span className="font-mono text-orbit-coral">Coral indicates urgent gap</span>
          </div>
        </div>

        {/* F. Recent Practice Log (6 cols) */}
        <div className="lg:col-span-6 p-6 rounded-xl bg-orbit-surface/60 border border-orbit-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-orbit-border">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-orbit-steel">
                  LOG 03 // PRACTICE SESSIONS
                </span>
                <h3 className="text-lg font-display font-semibold text-orbit-ivory mt-0.5">
                  Recent Practice Activity
                </h3>
              </div>
              <button
                onClick={() => setActivePage('interview')}
                className="text-xs font-mono text-orbit-lime hover:underline flex items-center gap-1"
              >
                Open Studio <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {history.length > 0 ? (
              <div className="space-y-3">
                {history.slice(0, 3).map((sess) => (
                  <div
                    key={sess.id}
                    className="p-3 rounded-lg bg-orbit-midnight/60 border border-orbit-border/70 hover:border-orbit-lime/30 transition-all text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-orbit-ivory font-display truncate max-w-[220px]">
                        {sess.question_title}
                      </span>
                      <span className="font-mono font-bold text-orbit-lime px-2 py-0.5 rounded bg-orbit-lime/10 border border-orbit-lime/30 text-[11px]">
                        {sess.score}%
                      </span>
                    </div>

                    <div className="text-[11px] text-orbit-steel font-mono flex items-center justify-between mt-1">
                      <span>Evaluator: {sess.evaluator_engine ? sess.evaluator_engine.split(' ')[0] : 'Engine'}</span>
                      <span>{new Date(sess.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-44 flex flex-col items-center justify-center text-center p-4 rounded-lg bg-orbit-midnight/40 border border-dashed border-orbit-border text-orbit-steel">
                <History className="w-8 h-8 text-orbit-steel/50 mb-2" />
                <p className="text-xs font-medium text-orbit-ivory">No practice submissions yet</p>
                <p className="text-[11px] text-orbit-steel mt-0.5 max-w-xs">
                  Complete your first interview question in the Interview Studio to convert resume claims into verified proof.
                </p>
                <button
                  onClick={() => setActivePage('interview')}
                  className="mt-3 px-3 py-1.5 rounded bg-orbit-surface border border-orbit-border hover:border-orbit-lime text-[11px] font-mono text-orbit-lime"
                >
                  Start practice session
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-orbit-border/60 text-[11px] text-orbit-steel flex items-center justify-between">
            <span>Submissions saved to persistent SQLite</span>
            <span className="font-mono text-orbit-steel">{history.length} records on file</span>
          </div>
        </div>

      </div>
    </div>
  );
}
