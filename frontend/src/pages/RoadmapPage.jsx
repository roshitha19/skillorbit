import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import {
  Milestone,
  CheckCircle2,
  Circle,
  ExternalLink,
  Clock,
  Sparkles,
  RefreshCw,
  ArrowRight,
  BookOpen,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function RoadmapPage() {
  const {
    roadmapTasks,
    targetRoleId,
    roles,
    refreshData,
    addToast,
    launchInterviewForSkill
  } = useApp();

  const [togglingId, setTogglingId] = useState(null);
  const [regenerating, setRegenerating] = useState(false);

  const currentRole = roles.find(r => r.id === targetRoleId) || { title: "Frontend Engineer" };

  // Calculate completion percentage
  const totalTasks = roadmapTasks.length || 1;
  const completedCount = roadmapTasks.filter(t => t.is_completed).length;
  const completionPct = Math.round((completedCount / totalTasks) * 100);

  // Group tasks by milestone phase
  const phases = Array.from(new Set(roadmapTasks.map(t => t.milestone_phase)));

  const handleToggleTask = async (taskId, currentStatus) => {
    try {
      setTogglingId(taskId);
      const res = await api.toggleRoadmapTask(taskId);
      
      if (res.is_completed) {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#D7FF55', '#10B981']
        });
        addToast('Milestone task completed! Progress updated.', 'success');
      } else {
        addToast('Task marked incomplete.', 'info');
      }

      await refreshData(targetRoleId);
    } catch (err) {
      addToast('Failed to update task status.', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  const handleRegenerate = async () => {
    try {
      setRegenerating(true);
      await api.regenerateRoadmap(targetRoleId);
      await refreshData(targetRoleId);
      addToast('Roadmap recalculated based on latest evaluated skill gaps.', 'success');
    } catch (err) {
      addToast('Failed to regenerate roadmap.', 'error');
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Top Banner with Progress Track */}
      <div className="p-6 rounded-xl bg-orbit-surface/70 border border-orbit-border backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest uppercase text-orbit-steel">
              MODULE 05 // SPRINT ROADMAP
            </span>
            <span className="px-2 py-0.5 rounded-full bg-orbit-lime/10 border border-orbit-lime/30 text-[10px] font-mono text-orbit-lime">
              PERSISTENT PROGRESS
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-bold text-orbit-ivory mt-1">
            Personalized Career Roadmap
          </h1>

          <p className="text-xs sm:text-sm text-orbit-steel mt-0.5">
            Target: <span className="text-orbit-ivory font-medium">{currentRole.title}</span> · Structured sprints closing your specific priority gaps.
          </p>
        </div>

        {/* Overall Completion Metric */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-orbit-midnight/70 border border-orbit-border">
          <div className="relative w-14 h-14 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-orbit-surface"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-orbit-lime transition-all duration-700"
                strokeDasharray={`${completionPct}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute font-mono text-xs font-bold text-orbit-ivory">
              {completionPct}%
            </span>
          </div>

          <div>
            <div className="text-xs font-semibold text-orbit-ivory">
              {completedCount} of {totalTasks} Completed
            </div>
            <div className="text-[11px] font-mono text-orbit-steel">
              {completionPct === 100 ? "Ready for Interviews" : "Active Preparation Sprint"}
            </div>
          </div>
        </div>
      </div>

      {/* Recalculate Roadmap Button */}
      <div className="flex items-center justify-between pb-2 border-b border-orbit-border">
        <span className="text-xs font-mono text-orbit-steel">
          PHASED SPRINTS // {phases.length} PHASES FOUND
        </span>

        <button
          disabled={regenerating}
          onClick={handleRegenerate}
          className="text-xs font-mono text-orbit-steel hover:text-orbit-lime transition-colors flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />
          Recalculate Roadmap from Gaps
        </button>
      </div>

      {/* Phased Milestone Tasks */}
      <div className="space-y-8">
        {phases.map((phase, pIdx) => {
          const phaseTasks = roadmapTasks.filter(t => t.milestone_phase === phase);

          return (
            <div key={phase} className="space-y-4">
              {/* Phase Header */}
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-md bg-orbit-surface border border-orbit-border text-orbit-lime font-mono text-xs font-bold flex items-center justify-center">
                  0{pIdx + 1}
                </span>
                <h3 className="text-base font-display font-bold text-orbit-ivory tracking-wide">
                  {phase}
                </h3>
              </div>

              {/* Task Items in Phase */}
              <div className="space-y-3 pl-2 sm:pl-4 border-l-2 border-orbit-border/50">
                {phaseTasks.map((task) => {
                  const isDone = !!task.is_completed;
                  const isToggling = togglingId === task.id;

                  return (
                    <div
                      key={task.id}
                      className={`p-5 rounded-xl border transition-all ${
                        isDone
                          ? 'bg-orbit-midnight/40 border-orbit-border/60 opacity-80'
                          : 'bg-orbit-surface/70 border-orbit-border hover:border-orbit-steel/50'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Checkbox */}
                        <button
                          disabled={isToggling}
                          onClick={() => handleToggleTask(task.id, isDone)}
                          className="mt-0.5 flex-shrink-0 text-orbit-steel hover:text-orbit-lime transition-colors"
                          aria-label={isDone ? "Mark incomplete" : "Mark completed"}
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-5 h-5 text-orbit-lime fill-orbit-lime/20" />
                          ) : (
                            <Circle className="w-5 h-5 text-orbit-steel hover:text-orbit-lime" />
                          )}
                        </button>

                        {/* Task Content */}
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <h4 className={`text-sm font-semibold font-display ${isDone ? 'line-through text-orbit-steel' : 'text-orbit-ivory'}`}>
                                {task.task_title}
                              </h4>
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-orbit-midnight border border-orbit-border text-orbit-lime">
                                {task.skill_name}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 text-[11px] font-mono text-orbit-steel">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{task.estimated_hours} hrs</span>
                            </div>
                          </div>

                          <p className="text-xs text-orbit-steel/90 leading-relaxed font-sans">
                            {task.description}
                          </p>

                          {/* Why this matters */}
                          <div className="p-2.5 rounded bg-orbit-midnight/70 border border-orbit-border/50 text-[11px] text-orbit-steel">
                            <strong className="text-orbit-ivory">Why it matters: </strong>
                            {task.why_it_matters}
                          </div>

                          {/* Verified Reference Link & Practice Launcher */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                            {task.resource_url && (
                              <a
                                href={task.resource_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-mono text-orbit-lime hover:underline"
                              >
                                <BookOpen className="w-3 h-3" />
                                {task.resource_title || "Verified Documentation"}
                                <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                              </a>
                            )}

                            <button
                              onClick={() => launchInterviewForSkill(task.skill_name)}
                              className="text-xs font-mono text-orbit-steel hover:text-orbit-ivory flex items-center gap-1"
                            >
                              Practice in Interview Lab <ArrowRight className="w-3 h-3 text-orbit-lime" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
