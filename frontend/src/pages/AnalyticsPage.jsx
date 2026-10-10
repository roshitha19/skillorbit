import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import {
  BarChart3,
  TrendingUp,
  Award,
  Terminal,
  ShieldCheck,
  Milestone,
  History,
  Clock,
  ArrowRight
} from 'lucide-react';

export default function AnalyticsPage() {
  const { setActivePage, targetRoleId, roles } = useApp();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAnalytics()
      .then(res => setData(res))
      .catch(err => console.error("Error loading analytics:", err))
      .finally(() => setLoading(false));
  }, []);

  const currentRole = roles.find(r => r.id === targetRoleId) || { title: "Target Role" };

  const interviewSummary = data?.interview_summary || { sessions_completed: 0, average_score: 0, session_history: [] };
  const skillsSummary = data?.skills_summary || { demonstrated: 0, listed: 0, gaps: 0, total: 0 };
  const roadmapSummary = data?.roadmap_summary || { total_tasks: 0, completed_tasks: 0, completion_percentage: 0 };
  const activities = data?.recent_activities || [];

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono tracking-widest uppercase text-orbit-steel">
            MODULE 06 // HISTORICAL TELEMETRY & PROGRESS
          </span>
          <span className="px-2 py-0.5 rounded-full bg-orbit-lime/10 border border-orbit-lime/30 text-[10px] font-mono text-orbit-lime">
            DATABASE BACKED
          </span>
        </div>
        <h1 className="text-3xl font-display font-bold text-orbit-ivory mt-1">
          Progress & Verification Analytics
        </h1>
        <p className="text-sm text-orbit-steel mt-0.5">
          Quantified telemetry tracking your evidentiary progression toward <span className="text-orbit-ivory font-medium">{currentRole.title}</span> readiness.
        </p>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-orbit-surface/70 border border-orbit-border space-y-1">
          <div className="flex items-center justify-between text-orbit-steel">
            <span className="text-[11px] font-mono uppercase">Verified Skills</span>
            <ShieldCheck className="w-4 h-4 text-orbit-lime" />
          </div>
          <div className="text-3xl font-mono font-bold text-orbit-lime">
            {skillsSummary.demonstrated}
          </div>
          <div className="text-[11px] text-orbit-steel">
            Out of {skillsSummary.total} competencies
          </div>
        </div>

        <div className="p-5 rounded-xl bg-orbit-surface/70 border border-orbit-border space-y-1">
          <div className="flex items-center justify-between text-orbit-steel">
            <span className="text-[11px] font-mono uppercase">Interview Sessions</span>
            <Terminal className="w-4 h-4 text-orbit-ivory" />
          </div>
          <div className="text-3xl font-mono font-bold text-orbit-ivory">
            {interviewSummary.sessions_completed}
          </div>
          <div className="text-[11px] text-orbit-steel">
            Completed in Practice Studio
          </div>
        </div>

        <div className="p-5 rounded-xl bg-orbit-surface/70 border border-orbit-border space-y-1">
          <div className="flex items-center justify-between text-orbit-steel">
            <span className="text-[11px] font-mono uppercase">Average Rubric Score</span>
            <Award className="w-4 h-4 text-orbit-lime" />
          </div>
          <div className="text-3xl font-mono font-bold text-orbit-lime">
            {interviewSummary.average_score}%
          </div>
          <div className="text-[11px] text-orbit-steel">
            Across all attempted questions
          </div>
        </div>

        <div className="p-5 rounded-xl bg-orbit-surface/70 border border-orbit-border space-y-1">
          <div className="flex items-center justify-between text-orbit-steel">
            <span className="text-[11px] font-mono uppercase">Roadmap Progress</span>
            <Milestone className="w-4 h-4 text-orbit-ivory" />
          </div>
          <div className="text-3xl font-mono font-bold text-orbit-ivory">
            {roadmapSummary.completion_percentage}%
          </div>
          <div className="text-[11px] text-orbit-steel">
            {roadmapSummary.completed_tasks} of {roadmapSummary.total_tasks} sprints done
          </div>
        </div>
      </div>

      {/* Two Column Section: Practice Score Trajectory & Competency Mix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Practice Score Trajectory (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-xl bg-orbit-surface/60 border border-orbit-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-orbit-border">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-orbit-steel">
                  CHART 01 // INTERVIEW PERFORMANCE
                </span>
                <h3 className="text-lg font-display font-semibold text-orbit-ivory mt-0.5">
                  Rubric Evaluation Trajectory
                </h3>
              </div>
              <span className="text-xs font-mono text-orbit-steel">Real Stored Records</span>
            </div>

            {interviewSummary.session_history.length > 0 ? (
              <div className="space-y-4">
                <div className="h-44 flex items-end gap-3 pt-6 pb-2 border-b border-orbit-border/60">
                  {interviewSummary.session_history.map((sess, i) => {
                    const heightPct = Math.max(15, sess.score);
                    return (
                      <div key={sess.id} className="flex-1 flex flex-col items-center gap-1.5 group">
                        <span className="text-[10px] font-mono text-orbit-steel opacity-0 group-hover:opacity-100 transition-opacity">
                          {sess.score}%
                        </span>
                        <div
                          className="w-full rounded-t transition-all duration-500 bg-orbit-lime hover:bg-orbit-limeMuted"
                          style={{ height: `${heightPct}%` }}
                        />
                        <span className="text-[9px] font-mono text-orbit-steel truncate max-w-[50px]">
                          S{i + 1}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-orbit-steel">
                  <span>Earliest session</span>
                  <span>Latest evaluation</span>
                </div>
              </div>
            ) : (
              <div className="h-44 flex flex-col items-center justify-center text-center p-4 rounded-lg bg-orbit-midnight/40 border border-dashed border-orbit-border text-orbit-steel">
                <Terminal className="w-8 h-8 text-orbit-steel/50 mb-2" />
                <p className="text-xs font-medium text-orbit-ivory">No sessions completed yet</p>
                <p className="text-[11px] text-orbit-steel mt-0.5">
                  Practice questions in the Interview Lab to establish your score curve.
                </p>
                <button
                  onClick={() => setActivePage('interview')}
                  className="mt-3 px-3 py-1.5 rounded bg-orbit-surface border border-orbit-border text-xs text-orbit-lime hover:border-orbit-lime"
                >
                  Start first session
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-orbit-border/60 text-[11px] text-orbit-steel flex items-center justify-between">
            <span>Evaluated against relevance, clarity, depth & examples</span>
            <span className="font-mono text-orbit-lime">≥70% achieves verification</span>
          </div>
        </div>

        {/* Competency Distribution (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-xl bg-orbit-surface/60 border border-orbit-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-orbit-border">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-orbit-steel">
                  DISTRIBUTION 02 // EVIDENCE BREAKDOWN
                </span>
                <h3 className="text-lg font-display font-semibold text-orbit-ivory mt-0.5">
                  Competency Portfolio Mix
                </h3>
              </div>
            </div>

            <div className="space-y-4 my-2">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-orbit-lime font-medium flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Demonstrated in Practice ({skillsSummary.demonstrated})
                  </span>
                  <span className="font-mono text-orbit-steel">
                    {Math.round((skillsSummary.demonstrated / Math.max(skillsSummary.total, 1)) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-orbit-midnight rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-orbit-lime h-full rounded-full"
                    style={{ width: `${(skillsSummary.demonstrated / Math.max(skillsSummary.total, 1)) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-orbit-ivory font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-orbit-ivory" />
                    Listed on Resume ({skillsSummary.listed})
                  </span>
                  <span className="font-mono text-orbit-steel">
                    {Math.round((skillsSummary.listed / Math.max(skillsSummary.total, 1)) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-orbit-midnight rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-orbit-ivory h-full rounded-full"
                    style={{ width: `${(skillsSummary.listed / Math.max(skillsSummary.total, 1)) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-orbit-coral font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-orbit-coral" />
                    Attention Gaps ({skillsSummary.gaps})
                  </span>
                  <span className="font-mono text-orbit-steel">
                    {Math.round((skillsSummary.gaps / Math.max(skillsSummary.total, 1)) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-orbit-midnight rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-orbit-coral h-full rounded-full"
                    style={{ width: `${(skillsSummary.gaps / Math.max(skillsSummary.total, 1)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-orbit-border/60 text-[11px] text-orbit-steel">
            Aim for at least 70% demonstrated competencies before applying for senior rounds.
          </div>
        </div>

      </div>

      {/* Activity Timeline Stream */}
      <div className="p-6 rounded-xl bg-orbit-surface/60 border border-orbit-border space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-orbit-border">
          <span className="text-xs font-mono font-bold uppercase text-orbit-ivory">
            AUDIT TRAIL // SYSTEM ACTIVITY STREAM
          </span>
          <span className="text-[10px] font-mono text-orbit-steel">
            PERSISTED IN SQLITE
          </span>
        </div>

        <div className="space-y-3">
          {activities.length > 0 ? (
            activities.map((act) => (
              <div
                key={act.id}
                className="p-3 rounded-lg bg-orbit-midnight/60 border border-orbit-border/70 flex items-start justify-between gap-4 text-xs"
              >
                <div>
                  <div className="font-semibold text-orbit-ivory font-display">
                    {act.title}
                  </div>
                  <p className="text-orbit-steel mt-0.5">{act.details}</p>
                </div>
                <span className="text-[10px] font-mono text-orbit-steel whitespace-nowrap">
                  {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-xs text-orbit-steel">
              No recent activity recorded.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
