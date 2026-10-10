import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Plus,
  Trash2,
  RefreshCw,
  Sparkles,
  Layers,
  FileCheck2
} from 'lucide-react';

export default function ResumePage() {
  const {
    currentUser,
    targetRoleId,
    setTargetRoleId,
    roles,
    refreshData,
    addToast,
    setActivePage,
    setIntendedPage
  } = useApp();

  const [file, setFile] = useState(null);
  const [pasteMode, setPasteMode] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [customJd, setCustomJd] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [newSkillName, setNewSkillName] = useState('');

  // Handle file select & validation
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    setError('');
    const ext = selected.name.split('.').pop().toLowerCase();
    if (!['pdf', 'docx', 'doc', 'txt'].includes(ext)) {
      setError(`Unsupported file extension '.${ext}'. Please upload a PDF or DOCX document.`);
      setFile(null);
      return;
    }

    if (selected.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10MB limit. Please upload a smaller document.');
      setFile(null);
      return;
    }

    setFile(selected);
  };

  // Trigger backend upload & parsing
  const handleUpload = async () => {
    if (!currentUser) {
      setError('Authentication required. Please sign in to your SKILLORBIT account to extract and analyze resumes.');
      addToast('Please sign in to analyze resumes.', 'info');
      if (setIntendedPage) setIntendedPage('resume');
      setTimeout(() => setActivePage('login'), 800);
      return;
    }

    if (!file) {
      setError('Please select a PDF or DOCX resume to upload.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await api.uploadResume(file);
      setParsedData(res);
      addToast(`Successfully parsed ${res.filename} (${res.word_count} words)`, 'success');
    } catch (err) {
      if (err.status === 401) {
        setError('Authentication required. Your session may have expired. Please sign in to analyze your resume.');
        addToast('Session expired. Redirecting to sign in...', 'error');
        if (setIntendedPage) setIntendedPage('resume');
        setTimeout(() => setActivePage('login'), 1200);
      } else if (err.status === 413) {
        setError('File size exceeds the 10MB limit. Please upload a smaller document.');
        addToast('File too large (max 10MB)', 'error');
      } else if (err.status === 415) {
        setError(err.message || 'Unsupported file format. Please upload a PDF (.pdf) or Word document (.docx, .doc).');
        addToast('Unsupported file format', 'error');
      } else if (err.status === 422) {
        setError(err.message || 'Unable to extract text from file. Please verify the document is not corrupted or password-protected.');
        addToast('Document unreadable', 'error');
      } else if (err.status === 403) {
        setError('Access forbidden. You do not have permission to upload resumes.');
        addToast('Access forbidden', 'error');
      } else if (err.status === 500) {
        setError('A server error occurred during resume processing. Please try again or paste resume text.');
        addToast('Server processing error', 'error');
      } else {
        setError(err.message || 'Failed to parse resume document.');
        addToast(err.message || 'Parsing error', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // Direct text parse
  const handleParseText = async () => {
    if (!currentUser) {
      setError('Authentication required. Please sign in to analyze resume text.');
      addToast('Please sign in to analyze text.', 'info');
      if (setIntendedPage) setIntendedPage('resume');
      setTimeout(() => setActivePage('login'), 800);
      return;
    }

    if (!pastedText.trim()) {
      setError('Please paste resume text into the editor.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await api.parseResumeText(pastedText);
      setParsedData(res);
      addToast('Parsed pasted resume text successfully.', 'success');
    } catch (err) {
      if (err.status === 401) {
        setError('Authentication required. Please sign in to analyze resume text.');
        addToast('Session expired. Redirecting to sign in...', 'error');
        if (setIntendedPage) setIntendedPage('resume');
        setTimeout(() => setActivePage('login'), 1200);
      } else {
        setError(err.message || 'Failed to parse text.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Add custom skill to list
  const handleAddSkill = () => {
    if (!newSkillName.trim() || !parsedData) return;
    const updated = {
      ...parsedData,
      detected_skills: [
        ...parsedData.detected_skills,
        {
          name: newSkillName.trim(),
          evidence_snippet: "Manually confirmed during resume review",
          confidence: 80,
          source: "resume"
        }
      ]
    };
    setParsedData(updated);
    setNewSkillName('');
  };

  const handleRemoveSkill = (idx) => {
    if (!parsedData) return;
    const updated = {
      ...parsedData,
      detected_skills: parsedData.detected_skills.filter((_, i) => i !== idx)
    };
    setParsedData(updated);
  };

  // Commit reviewed resume to backend SQLite
  const handleCommitToProfile = async () => {
    if (!currentUser) {
      addToast('Please sign in to commit your resume to your profile.', 'info');
      if (setIntendedPage) setIntendedPage('resume');
      setActivePage('login');
      return;
    }
    if (!parsedData) return;
    try {
      setLoading(true);
      await api.commitResume({
        filename: parsedData.filename,
        file_type: parsedData.file_type,
        raw_text: parsedData.raw_text,
        candidate: parsedData.candidate,
        sections: parsedData.sections,
        skills: parsedData.detected_skills,
        target_role: targetRoleId
      });

      await refreshData(targetRoleId);
      addToast('Resume synchronized with Career Intelligence Engine!', 'success');
      setActivePage('dashboard');
    } catch (err) {
      if (err.status === 401) {
        addToast('Authentication expired. Please sign in again.', 'error');
        if (setIntendedPage) setIntendedPage('resume');
        setActivePage('login');
      } else {
        addToast('Failed to save profile: ' + err.message, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono tracking-widest uppercase text-orbit-steel">
            MODULE 02 // RESUME INTELLIGENCE & INGESTION
          </span>
          <span className="px-2 py-0.5 rounded-full bg-orbit-surface border border-orbit-border text-[10px] font-mono text-orbit-ivory">
            LOCAL ENGINE
          </span>
        </div>
        <h1 className="text-3xl font-display font-bold text-orbit-ivory mt-1">
          Resume Intelligence Workflow
        </h1>
        <p className="text-sm text-orbit-steel mt-1 max-w-2xl">
          Upload your resume in PDF or DOCX format. Our backend parses structured sections, identifies technical competencies, and validates skills against target role benchmarks.
        </p>
      </div>

      {/* Guest Mode Notice */}
      {!currentUser && (
        <div className="p-4 rounded-xl bg-orbit-lime/5 border border-orbit-lime/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-orbit-lime/10 border border-orbit-lime/30 flex items-center justify-center text-orbit-lime shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-orbit-ivory font-sans">
                Sign in required to extract and save resume
              </div>
              <p className="text-[11px] text-orbit-steel font-sans">
                Your extracted skills, career gaps, and interview roadmaps are personalized and securely isolated to your account.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (setIntendedPage) setIntendedPage('resume');
              setActivePage('login');
            }}
            className="px-4 py-2 rounded-lg bg-orbit-lime text-orbit-bg font-sans font-bold text-xs uppercase tracking-wider hover:bg-orbit-limeMuted transition-all shrink-0"
          >
            Sign In to Analyze
          </button>
        </div>
      )}

      {/* Target Role & Optional JD Selector */}
      <div className="p-6 rounded-xl bg-orbit-surface/70 border border-orbit-border grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-mono uppercase text-orbit-steel mb-2">
            Target Job Benchmark
          </label>
          <select
            value={targetRoleId}
            onChange={(e) => setTargetRoleId(e.target.value)}
            className="w-full bg-orbit-midnight border border-orbit-border rounded-lg p-2.5 text-xs text-orbit-ivory font-sans focus:outline-none focus:border-orbit-lime/60"
          >
            {roles.map(r => (
              <option key={r.id} value={r.id}>
                {r.title} ({r.category})
              </option>
            ))}
          </select>
          <p className="text-[11px] text-orbit-steel mt-1.5">
            Benchmarks required competencies and questions against this industry role.
          </p>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase text-orbit-steel mb-2">
            Optional Custom Job Description (JD)
          </label>
          <input
            type="text"
            placeholder="Paste employer JD snippet to calibrate custom weights..."
            value={customJd}
            onChange={(e) => setCustomJd(e.target.value)}
            className="w-full bg-orbit-midnight border border-orbit-border rounded-lg p-2.5 text-xs text-orbit-ivory font-sans focus:outline-none focus:border-orbit-lime/60 placeholder-orbit-steel/50"
          />
          <p className="text-[11px] text-orbit-steel mt-1.5">
            SkillOrbit cross-references your profile against both standard benchmarks and custom JD requirements.
          </p>
        </div>
      </div>

      {/* Upload Zone & Mode Switcher */}
      {!parsedData && (
        <div className="p-8 rounded-xl bg-orbit-surface/50 border border-dashed border-orbit-borderLight flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-2 mb-6 p-1 rounded-lg bg-orbit-midnight border border-orbit-border text-xs">
            <button
              onClick={() => setPasteMode(false)}
              className={`px-3 py-1.5 rounded-md font-sans transition-all ${!pasteMode ? 'bg-orbit-surface text-orbit-lime font-medium' : 'text-orbit-steel hover:text-orbit-ivory'}`}
            >
              Document Upload (PDF / DOCX)
            </button>
            <button
              onClick={() => setPasteMode(true)}
              className={`px-3 py-1.5 rounded-md font-sans transition-all ${pasteMode ? 'bg-orbit-surface text-orbit-lime font-medium' : 'text-orbit-steel hover:text-orbit-ivory'}`}
            >
              Direct Text Paste
            </button>
          </div>

          {!pasteMode ? (
            <div className="space-y-4 max-w-md w-full">
              <div className="w-16 h-16 rounded-2xl bg-orbit-midnight border border-orbit-borderLight flex items-center justify-center mx-auto text-orbit-lime">
                <Upload className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-base font-display font-semibold text-orbit-ivory">
                  Select your resume document
                </h3>
                <p className="text-xs text-orbit-steel mt-1">
                  Supported formats: PDF, DOCX (Max file size: 10MB)
                </p>
              </div>

              <input
                type="file"
                id="resume-file"
                accept=".pdf,.docx,.doc,.txt"
                onChange={handleFileChange}
                className="hidden"
              />

              <label
                htmlFor="resume-file"
                className="inline-block px-5 py-2.5 rounded-lg bg-orbit-midnight border border-orbit-border hover:border-orbit-lime text-xs font-mono text-orbit-ivory cursor-pointer transition-all"
              >
                {file ? file.name : "Browse File on Computer"}
              </label>

              {file && (
                <div className="text-xs font-mono text-orbit-lime">
                  Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </div>
              )}

              {error && (
                <div className="p-3 rounded-lg bg-orbit-coral/10 border border-orbit-coral/40 text-orbit-coral text-xs flex items-center gap-2 justify-center">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <button
                  disabled={!file || loading}
                  onClick={handleUpload}
                  className="w-full py-3 rounded-lg bg-orbit-lime text-orbit-bg font-sans font-bold text-xs uppercase tracking-wider hover:bg-orbit-limeMuted disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 glow-lime"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Ingesting Document...
                    </>
                  ) : (
                    <>
                      Extract & Analyze Resume
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-xl space-y-4">
              <textarea
                rows={8}
                placeholder="Paste raw resume or LinkedIn text here (Education, Experience, Projects, Technical Skills)..."
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                className="w-full bg-orbit-midnight border border-orbit-border rounded-lg p-4 text-xs font-mono text-orbit-ivory placeholder-orbit-steel/50 focus:outline-none focus:border-orbit-lime/60"
              />

              {error && (
                <div className="p-3 rounded-lg bg-orbit-coral/10 border border-orbit-coral/40 text-orbit-coral text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              <button
                disabled={!pastedText.trim() || loading}
                onClick={handleParseText}
                className="w-full py-3 rounded-lg bg-orbit-lime text-orbit-bg font-sans font-bold text-xs uppercase tracking-wider hover:bg-orbit-limeMuted disabled:opacity-40 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Decompose Resume Text"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Review & Edit Extracted Results */}
      {parsedData && (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-xl bg-orbit-lime/10 border border-orbit-lime/40">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-orbit-lime flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-orbit-ivory">
                  Extraction Complete: {parsedData.filename}
                </h3>
                <p className="text-xs text-orbit-steel">
                  Review extracted candidate information and skills below before synchronizing.
                </p>
              </div>
            </div>

            <button
              onClick={() => { setParsedData(null); setFile(null); }}
              className="text-xs font-mono text-orbit-steel hover:text-orbit-ivory underline"
            >
              Re-upload another
            </button>
          </div>

          {/* Editable Candidate Meta */}
          <div className="p-6 rounded-xl bg-orbit-surface/70 border border-orbit-border space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-widest text-orbit-steel">
              1. CANDIDATE PROFILE IDENTIFIERS
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-mono text-orbit-steel">Candidate Name</label>
                <input
                  type="text"
                  value={parsedData.candidate.name}
                  onChange={(e) => setParsedData({
                    ...parsedData,
                    candidate: { ...parsedData.candidate, name: e.target.value }
                  })}
                  className="w-full bg-orbit-midnight border border-orbit-border rounded p-2 text-xs text-orbit-ivory mt-1"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-orbit-steel">Email</label>
                <input
                  type="email"
                  value={parsedData.candidate.email}
                  onChange={(e) => setParsedData({
                    ...parsedData,
                    candidate: { ...parsedData.candidate, email: e.target.value }
                  })}
                  className="w-full bg-orbit-midnight border border-orbit-border rounded p-2 text-xs text-orbit-ivory mt-1"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-orbit-steel">Phone</label>
                <input
                  type="text"
                  value={parsedData.candidate.phone}
                  onChange={(e) => setParsedData({
                    ...parsedData,
                    candidate: { ...parsedData.candidate, phone: e.target.value }
                  })}
                  className="w-full bg-orbit-midnight border border-orbit-border rounded p-2 text-xs text-orbit-ivory mt-1"
                />
              </div>
            </div>
          </div>

          {/* Extracted Sections Review (Education, Experience, Projects) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl bg-orbit-surface/70 border border-orbit-border space-y-4">
              <h4 className="text-xs font-mono uppercase tracking-widest text-orbit-steel">
                2. WORK EXPERIENCE & INTERNSHIPS
              </h4>
              <textarea
                rows={6}
                value={parsedData.sections.experience}
                onChange={(e) => setParsedData({
                  ...parsedData,
                  sections: { ...parsedData.sections, experience: e.target.value }
                })}
                className="w-full bg-orbit-midnight border border-orbit-border rounded p-3 text-xs font-mono text-orbit-ivory focus:outline-none"
              />
            </div>

            <div className="p-6 rounded-xl bg-orbit-surface/70 border border-orbit-border space-y-4">
              <h4 className="text-xs font-mono uppercase tracking-widest text-orbit-steel">
                3. KEY PROJECTS & REPOSITORIES
              </h4>
              <textarea
                rows={6}
                value={parsedData.sections.projects}
                onChange={(e) => setParsedData({
                  ...parsedData,
                  sections: { ...parsedData.sections, projects: e.target.value }
                })}
                className="w-full bg-orbit-midnight border border-orbit-border rounded p-3 text-xs font-mono text-orbit-ivory focus:outline-none"
              />
            </div>
          </div>

          {/* Detected Competencies & Verification Distinction */}
          <div className="p-6 rounded-xl bg-orbit-surface/70 border border-orbit-border space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-mono uppercase tracking-widest text-orbit-steel">
                  4. EXTRACTED COMPETENCIES ({parsedData.detected_skills.length} FOUND)
                </h4>
                <p className="text-xs text-orbit-steel mt-0.5">
                  These will be imported as <span className="text-orbit-ivory font-semibold">"Listed on Resume"</span> until verified in the Interview Lab.
                </p>
              </div>

              {/* Add custom skill input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Add missing skill..."
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="bg-orbit-midnight border border-orbit-border rounded px-2.5 py-1 text-xs text-orbit-ivory"
                />
                <button
                  onClick={handleAddSkill}
                  className="p-1.5 rounded bg-orbit-surface border border-orbit-border hover:border-orbit-lime text-orbit-lime"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {parsedData.detected_skills.map((skill, idx) => (
                <div
                  key={idx}
                  className="px-3 py-1.5 rounded-lg bg-orbit-midnight border border-orbit-border text-xs text-orbit-ivory flex items-center gap-2 group hover:border-orbit-lime/40 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-orbit-ivory" />
                  <span>{skill.name}</span>
                  <button
                    onClick={() => handleRemoveSkill(idx)}
                    className="text-orbit-steel hover:text-orbit-coral opacity-70 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Commit Button */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <button
              disabled={loading}
              onClick={handleCommitToProfile}
              className="px-6 py-3 rounded-lg bg-orbit-lime text-orbit-bg font-sans font-bold text-xs uppercase tracking-wider hover:bg-orbit-limeMuted transition-all flex items-center gap-2 shadow-lg glow-lime"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving to Database...
                </>
              ) : (
                <>
                  Commit & Calculate Role Fit
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
