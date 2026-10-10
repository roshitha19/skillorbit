import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, ShieldCheck, FileText, AlertTriangle, ArrowRight, ExternalLink, X } from 'lucide-react';

export default function SkillAtlasGraph({
  compact = false,
  onOpenPractice
}) {
  const { matchData, launchInterviewForSkill, setActivePage } = useApp();
  const [filter, setFilter] = useState('all'); // all, demonstrated, listed, gap
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState(null);

  const requirements = matchData?.requirements || [];

  const filteredSkills = requirements.filter(skill => {
    const matchesFilter = filter === 'all' || skill.status === filter;
    const matchesSearch = skill.skill_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          skill.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Category clusters
  const categories = Array.from(new Set(requirements.map(r => r.category)));

  return (
    <div className={`relative bg-orbit-surface/70 border border-orbit-border rounded-xl backdrop-blur-sm overflow-hidden flex flex-col ${compact ? 'p-4' : 'p-6'}`}>
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orbit-lime animate-pulse" />
            <span className="text-[10px] font-mono tracking-widest uppercase text-orbit-steel">
              COMPETENCY NETWORK // SKILL ATLAS
            </span>
          </div>
          <h3 className="text-xl font-display font-semibold text-orbit-ivory mt-0.5">
            {compact ? 'Interactive Skill Graph' : 'Universal Competency Atlas'}
          </h3>
        </div>

        {/* Filter Pills & Search */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-48">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-orbit-steel" />
            <input
              type="text"
              placeholder="Search competencies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-orbit-midnight/80 border border-orbit-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-orbit-ivory placeholder-orbit-steel/60 focus:outline-none focus:border-orbit-lime/50 font-sans"
            />
          </div>

          <div className="flex items-center p-0.5 rounded-lg bg-orbit-midnight/80 border border-orbit-border text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-all ${filter === 'all' ? 'bg-orbit-surface text-orbit-ivory font-medium' : 'text-orbit-steel hover:text-orbit-ivory'}`}
            >
              All ({requirements.length})
            </button>
            <button
              onClick={() => setFilter('demonstrated')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${filter === 'demonstrated' ? 'bg-orbit-lime/20 text-orbit-lime font-medium' : 'text-orbit-steel hover:text-orbit-lime'}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-orbit-lime" />
              Verified
            </button>
            <button
              onClick={() => setFilter('listed')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${filter === 'listed' ? 'bg-orbit-surface text-orbit-ivory font-medium' : 'text-orbit-steel hover:text-orbit-ivory'}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-orbit-ivory" />
              Listed
            </button>
            <button
              onClick={() => setFilter('gap')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${filter === 'gap' ? 'bg-orbit-coral/20 text-orbit-coral font-medium' : 'text-orbit-steel hover:text-orbit-coral'}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-orbit-coral" />
              Gaps
            </button>
          </div>
        </div>
      </div>

      {/* Network Grid View with fine technical dotted canvas feel */}
      <div className="relative min-h-[300px] bg-orbit-bg/60 rounded-lg p-5 border border-orbit-border/60 bg-tech-grid overflow-hidden">
        {/* Category Groups */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => {
            const catSkills = filteredSkills.filter(s => s.category === cat);
            if (!catSkills.length) return null;

            return (
              <div
                key={cat}
                className="p-4 rounded-lg bg-orbit-midnight/50 border border-orbit-border/70 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-orbit-border/50">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-orbit-steel">
                    DOMAIN // {cat}
                  </span>
                  <span className="text-[10px] font-mono text-orbit-steel/70">
                    {catSkills.length} skills
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  {catSkills.map((skill) => {
                    let statusColor = "text-orbit-ivory border-orbit-border";
                    let dotColor = "bg-orbit-ivory";
                    let badge = "Listed";

                    if (skill.status === "demonstrated") {
                      statusColor = "text-orbit-lime border-orbit-lime/30 bg-orbit-lime/5 hover:border-orbit-lime/60";
                      dotColor = "bg-orbit-lime shadow-sm shadow-orbit-lime";
                      badge = "Verified";
                    } else if (skill.status === "gap") {
                      statusColor = "text-orbit-coral border-orbit-coral/30 bg-orbit-coral/5 hover:border-orbit-coral/60";
                      dotColor = "bg-orbit-coral shadow-sm shadow-orbit-coral";
                      badge = "Gap";
                    }

                    return (
                      <div
                        key={skill.skill_name}
                        onClick={() => setSelectedSkill(skill)}
                        className={`group p-2.5 rounded-md border bg-orbit-surface/60 hover:bg-orbit-surfaceLight cursor-pointer transition-all flex items-center justify-between ${statusColor}`}
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`} />
                          <span className="text-xs font-medium text-orbit-ivory group-hover:text-orbit-lime transition-colors truncate">
                            {skill.skill_name}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[10px] font-mono text-orbit-steel">
                            {skill.candidate_score}%
                          </span>
                          <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-orbit-bg border border-orbit-border">
                            {badge}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {filteredSkills.length === 0 && (
          <div className="h-48 flex flex-col items-center justify-center text-center text-orbit-steel">
            <p className="text-sm">No competencies match your current filter or search criteria.</p>
            <button
              onClick={() => { setFilter('all'); setSearchQuery(''); }}
              className="mt-2 text-xs font-mono text-orbit-lime underline"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>

      {/* Slide-out Inspection Drawer / Modal */}
      {selectedSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center sm:justify-end bg-orbit-bg/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full sm:max-w-md bg-orbit-midnight border border-orbit-borderLight rounded-xl p-6 shadow-2xl flex flex-col justify-between max-h-[90vh] overflow-y-auto">
            <div>
              {/* Drawer Top */}
              <div className="flex items-start justify-between pb-4 border-b border-orbit-border">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-orbit-steel">
                    SKILL INSPECTION // {selectedSkill.category}
                  </span>
                  <h4 className="text-xl font-display font-bold text-orbit-ivory mt-0.5">
                    {selectedSkill.skill_name}
                  </h4>
                </div>
                <button
                  onClick={() => setSelectedSkill(null)}
                  className="p-1 rounded-md text-orbit-steel hover:text-orbit-ivory hover:bg-orbit-surface transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status & Benchmark comparison */}
              <div className="grid grid-cols-2 gap-3 my-4">
                <div className="p-3 rounded-lg bg-orbit-surface/70 border border-orbit-border">
                  <span className="text-[10px] font-mono text-orbit-steel uppercase">Verification Status</span>
                  <div className="flex items-center gap-2 mt-1">
                    {selectedSkill.status === 'demonstrated' && <ShieldCheck className="w-4 h-4 text-orbit-lime" />}
                    {selectedSkill.status === 'listed' && <FileText className="w-4 h-4 text-orbit-ivory" />}
                    {selectedSkill.status === 'gap' && <AlertTriangle className="w-4 h-4 text-orbit-coral" />}
                    <span className="text-sm font-semibold capitalize text-orbit-ivory">
                      {selectedSkill.status === 'demonstrated' ? 'Proven in Practice' : selectedSkill.status === 'listed' ? 'Listed on Resume' : 'Attention Gap'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-orbit-surface/70 border border-orbit-border">
                  <span className="text-[10px] font-mono text-orbit-steel uppercase">Benchmark Target</span>
                  <div className="flex items-baseline gap-1.5 mt-1 font-mono">
                    <span className="text-sm font-bold text-orbit-lime">{selectedSkill.candidate_score}%</span>
                    <span className="text-xs text-orbit-steel">/ {selectedSkill.benchmark}% target</span>
                  </div>
                </div>
              </div>

              {/* Evidentiary Record */}
              <div className="p-4 rounded-lg bg-orbit-surface/50 border border-orbit-border my-4">
                <span className="text-[11px] font-mono uppercase text-orbit-steel flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-orbit-lime" />
                  Supporting Evidence Source
                </span>
                <p className="text-xs font-sans text-orbit-ivory/90 mt-2 leading-relaxed italic bg-orbit-bg/60 p-3 rounded border border-orbit-border/60">
                  "{selectedSkill.evidence || 'No verifiable citation on record yet. Complete practice to validate.'}"
                </p>
                <div className="flex items-center justify-between mt-2 text-[10px] font-mono text-orbit-steel">
                  <span>Source: {selectedSkill.source || 'Diagnostic'}</span>
                  <span>Weight: {selectedSkill.weight?.toUpperCase()}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-orbit-border flex flex-col gap-2">
              <button
                onClick={() => {
                  const s = selectedSkill.skill_name;
                  setSelectedSkill(null);
                  launchInterviewForSkill(s);
                }}
                className="w-full py-2.5 px-4 rounded-lg bg-orbit-lime text-orbit-bg font-sans font-semibold text-xs tracking-wide uppercase hover:bg-orbit-limeMuted transition-all flex items-center justify-center gap-2 shadow-lg glow-lime"
              >
                Practice in Interview Lab
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => {
                  setSelectedSkill(null);
                  setActivePage('roadmap');
                }}
                className="w-full py-2 px-4 rounded-lg bg-orbit-surface border border-orbit-border text-orbit-ivory font-sans text-xs hover:border-orbit-steel transition-all flex items-center justify-center gap-2"
              >
                View in Learning Roadmap
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
