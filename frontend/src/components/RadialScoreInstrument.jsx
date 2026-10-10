import React from 'react';
import { ShieldCheck, FileText, AlertTriangle } from 'lucide-react';

export default function RadialScoreInstrument({
  score = 0,
  demonstrated = 0,
  listed = 0,
  gaps = 0,
  total = 12,
  roleTitle = "Target Role"
}) {
  const radius = 70;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  // Use a 270 degree arc for gauge look
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let scoreColor = '#D7FF55'; // Lime
  let badgeLabel = 'Accelerating Readiness';
  if (score >= 80) {
    scoreColor = '#10B981'; // Emerald
    badgeLabel = 'Strong Fit Benchmark';
  } else if (score < 50) {
    scoreColor = '#FF655D'; // Coral
    badgeLabel = 'Foundational / Active Gaps';
  }

  return (
    <div className="relative p-6 rounded-xl bg-orbit-surface/80 border border-orbit-border backdrop-blur-sm flex flex-col justify-between">
      {/* Top Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-orbit-steel">
            INSTRUMENT 01 // CAREER READINESS GAUGE
          </span>
          <h3 className="text-lg font-display font-semibold text-orbit-ivory mt-0.5">
            Role Fit Index
          </h3>
        </div>
        <span 
          className="px-2.5 py-0.5 text-xs font-mono font-medium rounded-full border"
          style={{ borderColor: `${scoreColor}40`, color: scoreColor, backgroundColor: `${scoreColor}10` }}
        >
          {badgeLabel}
        </span>
      </div>

      {/* Radial Instrument Center */}
      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 my-2">
        <div className="relative flex items-center justify-center">
          {/* Subtle outer dashed instrument ring */}
          <div className="absolute w-[180px] h-[180px] rounded-full border border-dashed border-orbit-steel/20 animate-spin-slow pointer-events-none" />
          
          <svg
            height={radius * 2 + 20}
            width={radius * 2 + 20}
            className="transform -rotate-90"
          >
            {/* Background track */}
            <circle
              stroke="#132B45"
              fill="transparent"
              strokeWidth={stroke}
              r={normalizedRadius}
              cx={radius + 10}
              cy={radius + 10}
            />
            {/* Value stroke */}
            <circle
              stroke={scoreColor}
              fill="transparent"
              strokeWidth={stroke}
              strokeDasharray={`${circumference} ${circumference}`}
              style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s ease-in-out' }}
              strokeLinecap="round"
              r={normalizedRadius}
              cx={radius + 10}
              cy={radius + 10}
            />
          </svg>

          {/* Value Display */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-4xl font-mono font-bold text-orbit-ivory tracking-tight">
              {score}
            </span>
            <span className="text-[11px] font-mono text-orbit-steel uppercase tracking-wider">
              / 100 PTS
            </span>
          </div>
        </div>

        {/* Contributing Factors */}
        <div className="flex flex-col gap-3 w-full sm:w-56">
          <div className="flex items-center justify-between p-2 rounded bg-orbit-midnight/60 border border-orbit-border/60">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-orbit-lime" />
              <span className="text-xs text-orbit-steel">Demonstrated</span>
            </div>
            <span className="text-xs font-mono font-bold text-orbit-lime">
              {demonstrated} <span className="text-orbit-steel font-normal">skills</span>
            </span>
          </div>

          <div className="flex items-center justify-between p-2 rounded bg-orbit-midnight/60 border border-orbit-border/60">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-orbit-ivory" />
              <span className="text-xs text-orbit-steel">Resume Listed</span>
            </div>
            <span className="text-xs font-mono font-bold text-orbit-ivory">
              {listed} <span className="text-orbit-steel font-normal">skills</span>
            </span>
          </div>

          <div className="flex items-center justify-between p-2 rounded bg-orbit-midnight/60 border border-orbit-border/60">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orbit-coral" />
              <span className="text-xs text-orbit-steel">Attention Gaps</span>
            </div>
            <span className="text-xs font-mono font-bold text-orbit-coral">
              {gaps} <span className="text-orbit-steel font-normal">skills</span>
            </span>
          </div>
        </div>
      </div>

      {/* Scientific Footnote */}
      <div className="mt-4 pt-3 border-t border-orbit-border/50 text-[11px] text-orbit-steel/80 flex items-center justify-between">
        <span>Evaluated against {total} competencies for {roleTitle}</span>
        <span className="font-mono text-[10px] text-orbit-steel">EVIDENTIARY MODEL v1.4</span>
      </div>
    </div>
  );
}
