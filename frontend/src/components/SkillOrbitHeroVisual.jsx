import React, { useState, useEffect } from 'react';

export default function SkillOrbitHeroVisual({
  roleTitle = "Frontend Engineer",
  onSelectSkill
}) {
  const [hoveredSkill, setHoveredSkill] = useState(null);
  const [time, setTime] = useState(0);

  useEffect(() => {
    let animId;
    const animate = () => {
      setTime(t => t + 0.005);
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Skill satellites distributed along 3 orbital rings
  const satellites = [
    // Ring 1 (Inner, r=100)
    { name: "JavaScript", ring: 100, speed: 1.2, offset: 0, status: "demonstrated", score: "88%" },
    { name: "React.js", ring: 100, speed: 1.2, offset: Math.PI, status: "demonstrated", score: "84%" },

    // Ring 2 (Middle, r=160)
    { name: "TypeScript", ring: 160, speed: -0.7, offset: 0.5, status: "gap", score: "45%" },
    { name: "Tailwind CSS", ring: 160, speed: -0.7, offset: 2.6, status: "listed", score: "80%" },
    { name: "HTML5 & A11y", ring: 160, speed: -0.7, offset: 4.7, status: "listed", score: "75%" },

    // Ring 3 (Outer, r=220)
    { name: "Web Performance", ring: 220, speed: 0.5, offset: 1.1, status: "gap", score: "40%" },
    { name: "Zustand State", ring: 220, speed: 0.5, offset: 3.2, status: "gap", score: "50%" },
    { name: "REST APIs", ring: 220, speed: 0.5, offset: 5.3, status: "demonstrated", score: "82%" },
  ];

  const centerX = 260;
  const centerY = 260;

  return (
    <div className="relative w-full max-w-[540px] aspect-square flex items-center justify-center select-none">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-radial-gradient from-orbit-midnight/50 to-transparent rounded-full pointer-events-none" />

      <svg viewBox="0 0 520 520" className="w-full h-full overflow-visible">
        <defs>
          <radialGradient id="nucleusGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#D7FF55" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#132B45" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#07111F" stopOpacity="0.95" />
          </radialGradient>
          <filter id="glowLime" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glowCoral" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Concentric Orbital Rings */}
        {[100, 160, 220].map((r, idx) => (
          <circle
            key={idx}
            cx={centerX}
            cy={centerY}
            r={r}
            fill="none"
            stroke="#1C3554"
            strokeWidth="1.2"
            strokeDasharray={idx === 1 ? "4,4" : idx === 2 ? "2,6" : "none"}
            opacity={0.65}
          />
        ))}

        {/* Radial Axis Guide Lines */}
        <line x1={centerX - 240} y1={centerY} x2={centerX + 240} y2={centerY} stroke="#132B45" strokeWidth="0.8" strokeDasharray="3,3" />
        <line x1={centerX} y1={centerY - 240} x2={centerX} y2={centerY + 240} stroke="#132B45" strokeWidth="0.8" strokeDasharray="3,3" />

        {/* Central Nucleus (Target Role) */}
        <circle
          cx={centerX}
          cy={centerY}
          r={46}
          fill="url(#nucleusGrad)"
          stroke="#D7FF55"
          strokeWidth="1.5"
          filter="url(#glowLime)"
          className="transition-all duration-300"
        />
        <circle
          cx={centerX}
          cy={centerY}
          r={54}
          fill="none"
          stroke="#D7FF55"
          strokeWidth="0.8"
          strokeDasharray="2,4"
          className="animate-spin-slow opacity-60"
        />
        <text
          x={centerX}
          y={centerY - 4}
          textAnchor="middle"
          fill="#D7FF55"
          fontSize="10"
          fontFamily="JetBrains Mono"
          fontWeight="bold"
          letterSpacing="0.08em"
        >
          TARGET ROLE
        </text>
        <text
          x={centerX}
          y={centerY + 12}
          textAnchor="middle"
          fill="#F5F1E8"
          fontSize="11"
          fontFamily="Space Grotesk"
          fontWeight="600"
        >
          {roleTitle}
        </text>

        {/* Satellite Nodes */}
        {satellites.map((sat, i) => {
          const angle = sat.offset + time * sat.speed;
          const x = centerX + Math.cos(angle) * sat.ring;
          const y = centerY + Math.sin(angle) * sat.ring;

          const isHovered = hoveredSkill?.name === sat.name;
          let nodeFill = "#F5F1E8";
          let nodeStroke = "#8D9CAF";
          let nodeGlow = "";

          if (sat.status === "demonstrated") {
            nodeFill = "#D7FF55";
            nodeStroke = "#10B981";
            nodeGlow = "url(#glowLime)";
          } else if (sat.status === "gap") {
            nodeFill = "#FF655D";
            nodeStroke = "#FF655D";
            nodeGlow = "url(#glowCoral)";
          }

          return (
            <g
              key={i}
              className="cursor-pointer transition-transform duration-150"
              onMouseEnter={() => setHoveredSkill(sat)}
              onMouseLeave={() => setHoveredSkill(null)}
              onClick={() => onSelectSkill && onSelectSkill(sat.name)}
            >
              {/* Connecting thread to center if hovered */}
              {isHovered && (
                <line
                  x1={centerX}
                  y1={centerY}
                  x2={x}
                  y2={y}
                  stroke={nodeFill}
                  strokeWidth="1.2"
                  strokeDasharray="2,2"
                />
              )}

              {/* Orbital node circle */}
              <circle
                cx={x}
                cy={y}
                r={isHovered ? 11 : 7}
                fill={nodeFill}
                stroke={nodeStroke}
                strokeWidth={isHovered ? 3 : 1.5}
                filter={nodeGlow}
                className="transition-all duration-200"
              />

              {/* Label text */}
              <text
                x={x}
                y={y + (sat.ring > 150 ? 18 : -14)}
                textAnchor="middle"
                fill={isHovered ? "#F5F1E8" : "#8D9CAF"}
                fontSize={isHovered ? "11" : "9.5"}
                fontFamily="Inter"
                fontWeight={isHovered ? "600" : "400"}
                className="transition-all duration-150 pointer-events-none drop-shadow"
              >
                {sat.name}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Floating Hover Tooltip */}
      {hoveredSkill && (
        <div className="absolute top-4 right-4 p-3 rounded-lg bg-orbit-midnight/90 border border-orbit-borderLight backdrop-blur-md shadow-2xl pointer-events-none text-left z-20 w-48">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-orbit-ivory">{hoveredSkill.name}</span>
            <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded ${
              hoveredSkill.status === 'demonstrated' ? 'bg-orbit-lime/20 text-orbit-lime border border-orbit-lime/40' :
              hoveredSkill.status === 'gap' ? 'bg-orbit-coral/20 text-orbit-coral border border-orbit-coral/40' :
              'bg-orbit-surface text-orbit-ivory border border-orbit-border'
            }`}>
              {hoveredSkill.status}
            </span>
          </div>
          <div className="text-[11px] text-orbit-steel font-mono">
            Readiness: <span className="text-orbit-ivory font-bold">{hoveredSkill.score}</span>
          </div>
          <div className="text-[10px] text-orbit-steel/80 mt-1 italic">
            Click node to inspect competency
          </div>
        </div>
      )}
    </div>
  );
}
