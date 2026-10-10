import React from 'react';
import SkillAtlasGraph from '../components/SkillAtlasGraph';
import { useApp } from '../context/AppContext';
import { ShieldCheck, FileText, AlertTriangle, Info } from 'lucide-react';

export default function SkillAtlasPage() {
  const { matchData, targetRoleId, roles } = useApp();
  const currentRole = roles.find(r => r.id === targetRoleId) || { title: "Target Role" };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest uppercase text-orbit-steel">
              MODULE 03 // COMPETENCY KNOWLEDGE GRAPH
            </span>
          </div>
          <h1 className="text-3xl font-display font-bold text-orbit-ivory mt-1">
            Universal Skill Atlas
          </h1>
          <p className="text-sm text-orbit-steel mt-0.5">
            Explore the relational graph of required competencies for <span className="text-orbit-ivory font-medium">{currentRole.title}</span>. Click any node to inspect evidentiary citations.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 p-2 rounded-lg bg-orbit-surface/70 border border-orbit-border text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-orbit-lime" />
            <span className="text-orbit-lime font-mono text-[11px]">Demonstrated</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-orbit-ivory" />
            <span className="text-orbit-ivory font-mono text-[11px]">Resume Listed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-orbit-coral" />
            <span className="text-orbit-coral font-mono text-[11px]">Attention Gap</span>
          </div>
        </div>
      </div>

      {/* Main Full-Size Atlas Graph */}
      <SkillAtlasGraph compact={false} />

      {/* Explanatory Scientific Note */}
      <div className="p-4 rounded-xl bg-orbit-surface/40 border border-orbit-border/60 flex items-start gap-3 text-xs text-orbit-steel leading-relaxed">
        <Info className="w-4 h-4 text-orbit-lime flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-orbit-ivory">How Skill Verification Works: </span>
          Skills marked in <span className="text-orbit-ivory">ivory</span> originate from your uploaded resume or self-declaration. To turn them into <span className="text-orbit-lime">verified green competencies</span>, practice their corresponding questions in the Adaptive Interview Lab and score ≥70%.
        </div>
      </div>
    </div>
  );
}
