import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import {
  User,
  Settings,
  Cpu,
  FileText,
  Download,
  Save,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Printer
} from 'lucide-react';

export default function SettingsPage() {
  const {
    candidate,
    setCandidate,
    currentUser,
    targetRoleId,
    setTargetRoleId,
    roles,
    healthStatus,
    matchData,
    addToast
  } = useApp();

  const [name, setName] = useState(candidate?.name || currentUser?.full_name || '');
  const [email, setEmail] = useState(candidate?.email || currentUser?.email || '');
  const [headline, setHeadline] = useState(candidate?.headline || '');
  const [bio, setBio] = useState(candidate?.bio || '');
  const [targetLevel, setTargetLevel] = useState(candidate?.target_level || 'Associate / Mid-Level');
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.updateCandidate({
        name,
        email,
        headline,
        bio,
        target_role: targetRoleId,
        target_level: targetLevel
      });
      setCandidate(res);
      addToast('Profile identifiers saved to database.', 'success');
    } catch (err) {
      addToast('Failed to save profile: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePrintDossier = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono tracking-widest uppercase text-orbit-steel">
            MODULE 07 // CANDIDATE SETTINGS & ENGINE CONFIG
          </span>
        </div>
        <h1 className="text-3xl font-display font-bold text-orbit-ivory mt-1">
          Profile & System Settings
        </h1>
        <p className="text-sm text-orbit-steel mt-0.5">
          Manage your candidate metadata, career targets, and inspect active AI evaluation engines.
        </p>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSaveProfile} className="p-6 rounded-xl bg-orbit-surface/70 border border-orbit-border space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-orbit-border">
          <div className="flex items-center gap-2.5">
            <User className="w-4 h-4 text-orbit-lime" />
            <h3 className="text-base font-display font-semibold text-orbit-ivory">
              Candidate Identity
            </h3>
          </div>
          <span className="text-[10px] font-mono text-orbit-steel">
            PERSISTED PROFILE
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-mono uppercase text-orbit-steel">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-orbit-midnight border border-orbit-border rounded-lg p-2.5 text-xs text-orbit-ivory font-sans mt-1.5 focus:outline-none focus:border-orbit-lime/60"
            />
          </div>

          <div>
            <label className="text-xs font-mono uppercase text-orbit-steel">Contact Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-orbit-midnight border border-orbit-border rounded-lg p-2.5 text-xs text-orbit-ivory font-sans mt-1.5 focus:outline-none focus:border-orbit-lime/60"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-mono uppercase text-orbit-steel">Active Target Benchmark Role</label>
            <select
              value={targetRoleId}
              onChange={(e) => setTargetRoleId(e.target.value)}
              className="w-full bg-orbit-midnight border border-orbit-border rounded-lg p-2.5 text-xs text-orbit-ivory font-sans mt-1.5 focus:outline-none focus:border-orbit-lime/60"
            >
              {roles.map(r => (
                <option key={r.id} value={r.id}>{r.title} ({r.category})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-mono uppercase text-orbit-steel">Target Seniority Level</label>
            <select
              value={targetLevel}
              onChange={(e) => setTargetLevel(e.target.value)}
              className="w-full bg-orbit-midnight border border-orbit-border rounded-lg p-2.5 text-xs text-orbit-ivory font-sans mt-1.5 focus:outline-none focus:border-orbit-lime/60"
            >
              <option value="Associate / Entry-Level">Associate / Entry-Level (0-2 YOE)</option>
              <option value="Associate / Mid-Level">Associate / Mid-Level (2-4 YOE)</option>
              <option value="Senior Level">Senior Technical (5+ YOE)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-mono uppercase text-orbit-steel">Headline</label>
          <input
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className="w-full bg-orbit-midnight border border-orbit-border rounded-lg p-2.5 text-xs text-orbit-ivory font-sans mt-1.5 focus:outline-none focus:border-orbit-lime/60"
          />
        </div>

        <div>
          <label className="text-xs font-mono uppercase text-orbit-steel">Bio & Technical Summary</label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full bg-orbit-midnight border border-orbit-border rounded-lg p-2.5 text-xs text-orbit-ivory font-sans mt-1.5 focus:outline-none focus:border-orbit-lime/60 resize-none"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-lg bg-orbit-lime text-orbit-bg font-sans font-bold text-xs uppercase tracking-wider hover:bg-orbit-limeMuted transition-all flex items-center gap-2"
          >
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save Profile Updates
          </button>
        </div>
      </form>

      {/* System Diagnostics & Evaluation Engine Panel */}
      <div className="p-6 rounded-xl bg-orbit-surface/70 border border-orbit-border space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-orbit-border">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-4 h-4 text-orbit-lime" />
            <h3 className="text-base font-display font-semibold text-orbit-ivory">
              Evaluation Engine Telemetry
            </h3>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-orbit-lime/10 text-orbit-lime border border-orbit-lime/30">
            ONLINE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-orbit-midnight/70 border border-orbit-border space-y-2">
            <span className="font-mono text-[10px] uppercase text-orbit-steel">Active Engine Mode</span>
            <div className="font-semibold text-orbit-ivory flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orbit-lime" />
              {healthStatus?.active_evaluation_engine || 'SkillOrbit Deterministic Rubric Engine'}
            </div>
            <p className="text-[11px] text-orbit-steel leading-relaxed">
              When external API keys (Gemini / OpenAI) are configured in backend environment variables, the engine utilizes live LLM inference. Otherwise, it executes SkillOrbit's deterministic rubric-based semantic evaluator.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-orbit-midnight/70 border border-orbit-border space-y-2">
            <span className="font-mono text-[10px] uppercase text-orbit-steel">External Keys Configured</span>
            <div className="font-mono text-orbit-ivory">
              {healthStatus?.external_ai_configured ? "Yes (Configured in .env)" : "No (Using Built-in Semantic Evaluator)"}
            </div>
            <p className="text-[11px] text-orbit-steel leading-relaxed">
              Transparent status: no fabricated AI labels are presented to evaluators.
            </p>
          </div>
        </div>
      </div>

      {/* Printable / Download Dossier */}
      <div className="p-6 rounded-xl bg-orbit-surface/70 border border-orbit-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-display font-semibold text-orbit-ivory">
            Export Career Intelligence Dossier
          </h3>
          <p className="text-xs text-orbit-steel mt-0.5">
            Generate a clean, printable technical readiness report of your verified skills and interview history.
          </p>
        </div>

        <button
          onClick={handlePrintDossier}
          className="px-4 py-2.5 rounded-lg bg-orbit-midnight border border-orbit-border hover:border-orbit-lime text-xs font-mono text-orbit-ivory transition-colors flex items-center gap-2"
        >
          <Printer className="w-4 h-4 text-orbit-lime" />
          Print / Export Dossier
        </button>
      </div>
    </div>
  );
}
