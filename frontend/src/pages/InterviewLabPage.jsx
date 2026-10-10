import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import {
  Terminal,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ChevronRight,
  Layers,
  Award,
  Cpu,
  BookOpen,
  ArrowRight,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function InterviewLabPage() {
  const {
    targetRoleId,
    roles,
    activeInterviewQuestion,
    setActiveInterviewQuestion,
    refreshData,
    addToast
  } = useApp();

  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [previousAttempts, setPreviousAttempts] = useState([]);
  const [evaluation, setEvaluation] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Load questions for active target role
  useEffect(() => {
    api.getQuestions(targetRoleId)
      .then(res => {
        const qList = res.questions || [];
        setQuestions(qList);

        // If context had an active targeted question or skill
        if (activeInterviewQuestion) {
          if (activeInterviewQuestion.id) {
            const foundIdx = qList.findIndex(q => q.id === activeInterviewQuestion.id);
            if (foundIdx !== -1) setCurrentIdx(foundIdx);
          } else if (activeInterviewQuestion.target_skill) {
            const foundIdx = qList.findIndex(q => 
              q.target_skill?.toLowerCase() === activeInterviewQuestion.target_skill.toLowerCase()
            );
            if (foundIdx !== -1) setCurrentIdx(foundIdx);
          }
        }
      })
      .catch(err => {
        console.error("Error loading interview questions:", err);
      });
  }, [targetRoleId, activeInterviewQuestion]);

  // Stopwatch timer
  useEffect(() => {
    let interval;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const currentQ = questions[currentIdx] || {
    id: "fe-q1",
    title: "React Re-rendering & Performance Optimization",
    category: "Technical",
    difficulty: "Intermediate",
    target_skill: "React.js",
    prompt: "How does React's reconciliation algorithm work, and what specific techniques would you employ to identify and eliminate unnecessary re-renders in a high-frequency dashboard application?",
    rubric_keywords: ["virtual dom", "reconciliation", "fiber", "usememo", "usecallback", "react.memo", "keys", "profiler"]
  };

  const wordCount = userAnswer.trim() ? userAnswer.trim().split(/\s+/).length : 0;
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Submit Answer
  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) {
      addToast('Please enter your response before submitting.', 'error');
      return;
    }

    try {
      setEvaluating(true);
      setTimerRunning(false);

      const res = await api.evaluateAnswer({
        role_id: targetRoleId,
        question_id: currentQ.id,
        question_title: currentQ.title,
        question_category: currentQ.category,
        target_skill: currentQ.target_skill,
        prompt: currentQ.prompt,
        answer: userAnswer
      });

      setEvaluation(res);
      setPreviousAttempts(prev => [
        ...prev,
        { answer: userAnswer, score: res.overall_score, time: formatTime(timerSeconds) }
      ]);

      if (res.overall_score >= 70) {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.7 },
          colors: ['#D7FF55', '#10B981', '#F5F1E8']
        });
        addToast(`Exceptional answer! Scored ${res.overall_score}%. Competency verified.`, 'success');
      } else {
        addToast(`Scored ${res.overall_score}%. Review rubric feedback to improve.`, 'info');
      }

      await refreshData(targetRoleId);
    } catch (err) {
      addToast('Evaluation failed: ' + err.message, 'error');
    } finally {
      setEvaluating(false);
    }
  };

  // Retry Answer
  const handleRetry = () => {
    setEvaluation(null);
    setTimerRunning(true);
  };

  // Move to Next Question
  const handleNextQuestion = () => {
    setEvaluation(null);
    setUserAnswer('');
    setTimerSeconds(0);
    setTimerRunning(true);
    setCurrentIdx(idx => (idx + 1) % Math.max(questions.length, 1));
  };

  // Load Follow-up question as active prompt
  const handleLoadFollowUp = (followUpText) => {
    const followUpObj = {
      id: `${currentQ.id}-followup`,
      title: `Follow-up on ${currentQ.title}`,
      category: currentQ.category,
      difficulty: "Advanced Drilldown",
      target_skill: currentQ.target_skill,
      prompt: followUpText,
      rubric_keywords: currentQ.rubric_keywords
    };
    setQuestions(prev => [...prev, followUpObj]);
    setCurrentIdx(questions.length); // point to new question
    setUserAnswer('');
    setEvaluation(null);
    setTimerSeconds(0);
    setTimerRunning(true);
    addToast('Follow-up challenge loaded in editor.', 'info');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Studio Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-orbit-surface/70 border border-orbit-border backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orbit-lime animate-pulse" />
            <span className="text-[10px] font-mono tracking-widest uppercase text-orbit-steel">
              INTERVIEW PRACTICE STUDIO // ADAPTIVE COPILOT
            </span>
          </div>
          <h1 className="text-2xl font-display font-bold text-orbit-ivory mt-0.5">
            Adaptive Interview Lab
          </h1>
        </div>

        {/* Stopwatch & Question Index Counter */}
        <div className="flex items-center gap-4 font-mono text-xs">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orbit-midnight border border-orbit-border">
            <Clock className="w-3.5 h-3.5 text-orbit-steel" />
            <span className="text-orbit-steel">TIMER:</span>
            <span className="text-orbit-lime font-bold">{formatTime(timerSeconds)}</span>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-orbit-midnight border border-orbit-border text-orbit-steel">
            QUESTION <span className="text-orbit-ivory font-bold">{currentIdx + 1}</span> OF {questions.length || 1}
          </div>
        </div>
      </div>

      {/* Main Studio Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Question Focus + Answer Editor (7 cols if no eval, 6 cols if eval) */}
        <div className={`${evaluation ? 'lg:col-span-6' : 'lg:col-span-12'} space-y-6 transition-all duration-300`}>
          
          {/* Question Card */}
          <div className="p-6 rounded-xl bg-orbit-surface/80 border border-orbit-border relative">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-orbit-lime/10 text-orbit-lime border border-orbit-lime/30 font-semibold">
                  {currentQ.category}
                </span>
                <span className="text-[10px] font-mono text-orbit-steel">
                  TARGET: <span className="text-orbit-ivory font-bold">{currentQ.target_skill}</span>
                </span>
              </div>
              <span className="text-[10px] font-mono text-orbit-steel">
                DIFF: {currentQ.difficulty || 'Intermediate'}
              </span>
            </div>

            <h2 className="text-xl font-display font-bold text-orbit-ivory leading-snug">
              {currentQ.title}
            </h2>

            <div className="mt-4 p-4 rounded-lg bg-orbit-midnight/80 border border-orbit-borderLight/60 text-sm font-sans text-orbit-ivory/95 leading-relaxed">
              {currentQ.prompt}
            </div>

            {/* Question Selector Pills */}
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-orbit-border/50">
              <span className="text-[10px] font-mono text-orbit-steel mr-1">SCENARIOS:</span>
              {questions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => {
                    setCurrentIdx(idx);
                    setEvaluation(null);
                    setUserAnswer('');
                    setTimerSeconds(0);
                  }}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${
                    currentIdx === idx
                      ? 'bg-orbit-lime text-orbit-bg font-bold'
                      : 'bg-orbit-midnight text-orbit-steel hover:text-orbit-ivory border border-orbit-border'
                  }`}
                >
                  Q{idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Answer Editor */}
          <div className="p-6 rounded-xl bg-orbit-surface/70 border border-orbit-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-widest text-orbit-steel">
                CANDIDATE RESPONSE TERMINAL
              </span>
              <div className="flex items-center gap-3 text-xs font-mono text-orbit-steel">
                <span>WORDS: <strong className="text-orbit-ivory">{wordCount}</strong></span>
                <span>CHARS: <strong className="text-orbit-ivory">{userAnswer.length}</strong></span>
              </div>
            </div>

            <textarea
              rows={11}
              disabled={evaluating}
              placeholder="State your technical approach, architectural considerations, and concrete production trade-offs here. Structured points and edge case mentions are rewarded in evaluation..."
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="w-full bg-orbit-midnight border border-orbit-border rounded-lg p-4 text-xs sm:text-sm font-sans text-orbit-ivory placeholder-orbit-steel/50 focus:outline-none focus:border-orbit-lime/60 leading-relaxed resize-y"
            />

            {/* Actions Bar */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  setUserAnswer('');
                  setEvaluation(null);
                  setTimerSeconds(0);
                }}
                className="px-3 py-2 rounded-lg text-xs font-mono text-orbit-steel hover:text-orbit-coral transition-colors"
              >
                Clear Response
              </button>

              <button
                disabled={evaluating || !userAnswer.trim()}
                onClick={handleSubmitAnswer}
                className="px-6 py-2.5 rounded-lg bg-orbit-lime text-orbit-bg font-sans font-bold text-xs uppercase tracking-wider hover:bg-orbit-limeMuted disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg glow-lime"
              >
                {evaluating ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-orbit-bg border-t-transparent rounded-full animate-spin" />
                    Evaluating Rubrics...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Submit for Rubric Evaluation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Structured Evaluation Feedback Panel */}
        {evaluation && (
          <div className="lg:col-span-6 space-y-6 animate-fade-in">
            <div className="p-6 rounded-xl bg-orbit-surface border border-orbit-borderLight space-y-6 shadow-2xl">
              
              {/* Header & Overall Score */}
              <div className="flex items-start justify-between pb-4 border-b border-orbit-border">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-orbit-steel">
                    EVALUATION RESULT // RUBRIC MATRIX
                  </span>
                  <h3 className="text-xl font-display font-bold text-orbit-ivory mt-0.5">
                    Response Diagnostic
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1 text-[11px] font-mono text-orbit-steel">
                    <Cpu className="w-3.5 h-3.5 text-orbit-lime" />
                    <span>{evaluation.evaluator_engine}</span>
                  </div>
                </div>

                {/* Big Score Badge */}
                <div className="text-right">
                  <div className={`text-4xl font-mono font-bold ${
                    evaluation.overall_score >= 80 ? 'text-orbit-emerald' :
                    evaluation.overall_score >= 60 ? 'text-orbit-lime' : 'text-orbit-coral'
                  }`}>
                    {evaluation.overall_score}%
                  </div>
                  <div className="text-[10px] font-mono text-orbit-steel uppercase">
                    OVERALL PROFICIENCY
                  </div>
                </div>
              </div>

              {/* 4 Metric Breakdown Meters */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: "Relevance", score: evaluation.relevance_score },
                  { name: "Clarity & Flow", score: evaluation.clarity_score },
                  { name: "Technical Depth", score: evaluation.technical_score },
                  { name: "Completeness", score: evaluation.completeness_score },
                ].map((m) => (
                  <div key={m.name} className="p-3 rounded-lg bg-orbit-midnight/70 border border-orbit-border space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-orbit-steel">{m.name}</span>
                      <span className="font-mono font-bold text-orbit-ivory">{m.score}%</span>
                    </div>
                    <div className="w-full bg-orbit-surface rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-orbit-lime h-full rounded-full transition-all duration-500"
                        style={{ width: `${m.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Strengths */}
              {evaluation.strengths?.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-mono uppercase text-orbit-lime flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Key Identified Strengths
                  </span>
                  <ul className="space-y-1.5 text-xs text-orbit-ivory/90 pl-1">
                    {evaluation.strengths.map((str, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-orbit-lime font-bold">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Missing Concepts */}
              {evaluation.missing_concepts?.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-mono uppercase text-orbit-coral flex items-center gap-1.5 font-bold">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Missing Technical Concepts
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {evaluation.missing_concepts.map((concept, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded text-[11px] font-mono bg-orbit-coral/10 text-orbit-coral border border-orbit-coral/30"
                      >
                        {concept}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actionable Improvement Suggestions */}
              {evaluation.improvement_suggestions?.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-mono uppercase text-orbit-steel flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-orbit-lime" />
                    Concrete Improvement Suggestions
                  </span>
                  <ul className="space-y-1.5 text-xs text-orbit-steel pl-1">
                    {evaluation.improvement_suggestions.map((imp, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-orbit-lime font-bold">→</span>
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Ideal Answer Framework */}
              {evaluation.ideal_answer_framework?.length > 0 && (
                <div className="p-4 rounded-lg bg-orbit-midnight/80 border border-orbit-border space-y-2">
                  <span className="text-xs font-mono uppercase text-orbit-ivory flex items-center gap-1.5 font-semibold">
                    <BookOpen className="w-3.5 h-3.5 text-orbit-lime" />
                    Model Answer Architecture
                  </span>
                  <ol className="list-decimal list-inside space-y-1 text-xs text-orbit-steel">
                    {evaluation.ideal_answer_framework.map((point, i) => (
                      <li key={i} className="leading-relaxed text-orbit-ivory/80">
                        {point}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Adaptive Follow-up Question */}
              {evaluation.follow_up_question && (
                <div className="p-4 rounded-lg bg-orbit-lime/5 border border-orbit-lime/30 space-y-2">
                  <span className="text-xs font-mono uppercase text-orbit-lime font-bold flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    Adaptive Follow-Up Question
                  </span>
                  <p className="text-xs text-orbit-ivory italic leading-relaxed">
                    "{evaluation.follow_up_question}"
                  </p>
                  <button
                    onClick={() => handleLoadFollowUp(evaluation.follow_up_question)}
                    className="mt-2 text-xs font-mono text-orbit-lime hover:underline flex items-center gap-1"
                  >
                    Accept Follow-up Drilldown <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Bottom Actions: Retry or Next */}
              <div className="flex items-center gap-3 pt-3 border-t border-orbit-border">
                <button
                  onClick={handleRetry}
                  className="flex-1 py-2 rounded-lg bg-orbit-midnight border border-orbit-border hover:border-orbit-steel text-xs font-sans text-orbit-ivory transition-colors flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Retry & Refine Answer
                </button>

                <button
                  onClick={handleNextQuestion}
                  className="flex-1 py-2 rounded-lg bg-orbit-lime text-orbit-bg font-sans font-bold text-xs uppercase tracking-wider hover:bg-orbit-limeMuted transition-all flex items-center justify-center gap-1.5"
                >
                  Next Scenario
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
