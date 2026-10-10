import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  FileText,
  AlertTriangle,
  ArrowRight,
  Filter,
  CheckCircle2,
  ExternalLink,
  Terminal,
  Milestone,
  HelpCircle,
  RefreshCw
} from 'lucide-react';

export default function JobMatchPage() {
  const {
    matchData,
    targetRoleId,
    setTargetRoleId,
    roles,
    refreshData,
    launchInterviewForSkill,
    setActivePage
  } = useApp();

  const [weightFilter, setWeightFilter] = useState('all'); // all, essential, recommended
  const [selectedReq, setSelectedReq] = useState(null);

  const currentRole = roles.find(r => r.id === targetRoleId) || {
    id: targetRoleId,
    title: "Frontend Engineer"
  };

  const requirements = matchData?.requirements || [];
  const filteredReqs = requirements.filter(r => {
    if (weightFilter === 'all') return true;
    return r.weight === weightFilter;
  });

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Top Banner with Role Selector & Overview */}
      <div className="p-6 rounded-xl bg-orbit-surface/70 border border-orbit-border backdrop-blur-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest uppercase text-orbit-steel">
              MODULE 04 // BENCHMARK FIT MATRIX
            </span>
            <span className="px-2 py-0.5 rounded-full bg-orbit-lime/10 border border-orbit-lime/30 text-[10px] font-mono text-orbit-lime">
              EVIDENCE-BASED
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-1.5">
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-orbit-ivory">
              Job Match: {currentRole.title}
            </h1>
            <select
              value={targetRoleId}
              onChange={(e) => setTargetRoleId(e.target.value)}
              className="bg-orbit-midnight border border-orbit-border rounded-lg px-3 py-1.5 text-xs text-orbit-ivory font-mono focus:outline-none focus:border-orbit-lime/60"
            >
              {roles.map(r => (
                <option key={r.id} value={r.id}>{r.title}</option>
              ))}
            </select>
          </div>

          <p className="text-xs text-orbit-steel mt-1 max-w-xl">
            Detailed comparison of your evidenced profile against industry requirements. Role-fit score: <span className="text-orbit-lime font-mono font-bold">{matchData?.fit_score || 47}%</span>.
          </p>
        </div>

        {/* Quick summary statistics */}
        <div className="flex items-center gap-3 sm:gap-6 p-3 rounded-lg bg-orbit-midnight/70 border border-orbit-border">
          <div className="text-center">
            <div className="text-lg font-mono font-bold text-orbit-lime">
              {matchData?.demonstrated_count || 2}
            </div>
            <div className="text-[10px] font-mono text-orbit-steel uppercase">Verified</div>
          </div>
          <div className="w-px h-8 bg-orbit-border" />
          <div className="text-center">
            <div className="text-lg font-mono font-bold text-orbit-ivory">
              {matchData?.listed_count || 4}
            </div>
            <div className="text-[10px] font-mono text-orbit-steel uppercase">Listed</div>
          </div>
          <div className="w-px h-8 bg-orbit-border" />
          <div className="text-center">
            <div className="text-lg font-mono font-bold text-orbit-coral">
              {matchData?.gap_count || 3}
            </div>
            <div className="text-[10px] font-mono text-orbit-steel uppercase">Gaps</div>
          </div>
        </div>
      </div>

      {/* Honest Scientific Disclaimer */}
      <div className="p-4 rounded-xl bg-orbit-midnight/60 border border-orbit-border/80 flex items-start gap-3 text-xs text-orbit-steel">
        <HelpCircle className="w-4 h-4 text-orbit-lime flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-orbit-ivory">Evidentiary Estimate Notice: </span>
          The role-fit score reflects demonstrable evidence on record (interview responses, coding exercises, resume claims) relative to target industry benchmarks. It does not promise guaranteed employment, but quantifies your readiness for technical scrutiny.
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between pb-2 border-b border-orbit-border">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-mono text-orbit-steel mr-2">WEIGHT:</span>
          <button
            onClick={() => setWeightFilter('all')}
            className={`px-3 py-1.5 rounded-md font-sans transition-all ${weightFilter === 'all' ? 'bg-orbit-surface text-orbit-ivory font-medium border border-orbit-border' : 'text-orbit-steel hover:text-orbit-ivory'}`}
          >
            All Competencies ({requirements.length})
          </button>
          <button
            onClick={() => setWeightFilter('essential')}
            className={`px-3 py-1.5 rounded-md font-sans transition-all ${weightFilter === 'essential' ? 'bg-orbit-surface text-orbit-lime font-medium border border-orbit-lime/40' : 'text-orbit-steel hover:text-orbit-lime'}`}
          >
            Essential Only
          </button>
          <button
            onClick={() => setWeightFilter('recommended')}
            className={`px-3 py-1.5 rounded-md font-sans transition-all ${weightFilter === 'recommended' ? 'bg-orbit-surface text-orbit-ivory font-medium border border-orbit-border' : 'text-orbit-steel hover:text-orbit-ivory'}`}
          >
            Recommended
          </button>
        </div>

        <button
          onClick={() => refreshData(targetRoleId)}
          className="text-xs font-mono text-orbit-steel hover:text-orbit-lime flex items-center gap-1 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Rerun Analysis
        </button>
      </div>

      {/* Requirements Matrix Table / Cards */}
      <div className="space-y-3">
        {filteredReqs.map((req) => {
          let statusBadge = (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-orbit-surface text-orbit-ivory border border-orbit-border">
              Listed on Resume
            </span>
          );

          if (req.status === 'demonstrated') {
            statusBadge = (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-orbit-lime/20 text-orbit-lime border border-orbit-lime/40 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Demonstrated
              </span>
            );
          } else if (req.status === 'gap') {
            statusBadge = (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-orbit-coral/20 text-orbit-coral border border-orbit-coral/40 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Attention Gap
              </span>
            );
          }

          return (
            <div
              key={req.skill_name}
              className="p-5 rounded-xl bg-orbit-surface/60 border border-orbit-border hover:border-orbit-steel/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Left: Competency info */}
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-base font-display font-semibold text-orbit-ivory">
                    {req.skill_name}
                  </span>
                  <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${
                    req.weight === 'essential' 
                      ? 'bg-orbit-coral/10 text-orbit-coral border border-orbit-coral/30' 
                      : 'bg-orbit-midnight text-orbit-steel border border-orbit-border'
                  }`}>
                    {req.weight}
                  </span>
                  <span className="text-[10px] font-mono text-orbit-steel">
                    // {req.category}
                  </span>
                </div>

                <p className="text-xs text-orbit-steel/90 italic">
                  Evidence: "{req.evidence}"
                </p>
              </div>

              {/* Middle: Scores */}
              <div className="flex items-center gap-6 font-mono text-xs">
                <div>
                  <div className="text-[10px] text-orbit-steel uppercase">Verified</div>
                  <div className={`font-bold ${req.candidate_score >= req.benchmark ? 'text-orbit-lime' : 'text-orbit-ivory'}`}>
                    {req.candidate_score}%
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-orbit-steel uppercase">Benchmark</div>
                  <div className="text-orbit-steel">
                    {req.benchmark}%
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-orbit-steel uppercase">Status</div>
                  {statusBadge}
                </div>
              </div>

              {/* Right: Working Action */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {req.status === 'gap' ? (
                  <button
                    onClick={() => launchInterviewForSkill(req.skill_name)}
                    className="px-3.5 py-1.5 rounded-lg bg-orbit-coral text-orbit-bg font-sans font-semibold text-xs tracking-wide uppercase hover:bg-orbit-coral/90 transition-all flex items-center gap-1.5 shadow"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    Bridge in Lab
                  </button>
                ) : req.status === 'listed' ? (
                  <button
                    onClick={() => launchInterviewForSkill(req.skill_name)}
                    className="px-3.5 py-1.5 rounded-lg bg-orbit-lime text-orbit-bg font-sans font-semibold text-xs tracking-wide uppercase hover:bg-orbit-limeMuted transition-all flex items-center gap-1.5 shadow"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verify Skill
                  </button>
                ) : (
                  <button
                    onClick={() => setActivePage('roadmap')}
                    className="px-3.5 py-1.5 rounded-lg bg-orbit-midnight border border-orbit-border text-orbit-ivory hover:border-orbit-lime text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Milestone className="w-3.5 h-3.5 text-orbit-lime" />
                    View Roadmap
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
