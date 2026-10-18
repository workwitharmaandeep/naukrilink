'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { SkillBadge } from '@/components/ui/SkillBadge';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Award,
  ArrowRight,
  ShieldAlert,
  Flame,
  Zap,
  Volume2,
  VolumeX,
  Sparkles,
  Trophy,
  RotateCcw,
  FileText,
  Timer,
  ChevronRight,
} from 'lucide-react';
import { clsx } from 'clsx';

interface Question {
  index: number;
  id: string;
  questionText: string;
  codeSnippet?: string | null;
  options: string[];
  difficulty: string;
}

const QUESTION_TIME_LIMIT = 30; // 30 seconds per question (Mentimeter style)

// Iconic Mentimeter / Kahoot vibrant color quadrant cards
const MENTI_CARDS = [
  {
    symbol: '▲',
    label: 'A',
    name: 'Red Triangle',
    bg: 'bg-rose-500 hover:bg-rose-600',
    border: 'border-rose-400',
    ring: 'ring-rose-400',
    shadow: 'shadow-rose-500/30',
    badgeBg: 'bg-rose-600 text-white',
    selectedBg: 'bg-rose-600 ring-4 ring-rose-300 scale-[1.02]',
  },
  {
    symbol: '◆',
    label: 'B',
    name: 'Blue Diamond',
    bg: 'bg-blue-600 hover:bg-blue-700',
    border: 'border-blue-400',
    ring: 'ring-blue-400',
    shadow: 'shadow-blue-500/30',
    badgeBg: 'bg-blue-700 text-white',
    selectedBg: 'bg-blue-700 ring-4 ring-blue-300 scale-[1.02]',
  },
  {
    symbol: '●',
    label: 'C',
    name: 'Amber Circle',
    bg: 'bg-amber-500 hover:bg-amber-600',
    border: 'border-amber-400',
    ring: 'ring-amber-400',
    shadow: 'shadow-amber-500/30',
    badgeBg: 'bg-amber-600 text-white',
    selectedBg: 'bg-amber-600 ring-4 ring-amber-300 scale-[1.02]',
  },
  {
    symbol: '■',
    label: 'D',
    name: 'Green Square',
    bg: 'bg-emerald-600 hover:bg-emerald-700',
    border: 'border-emerald-400',
    ring: 'ring-emerald-400',
    shadow: 'shadow-emerald-500/30',
    badgeBg: 'bg-emerald-700 text-white',
    selectedBg: 'bg-emerald-700 ring-4 ring-emerald-300 scale-[1.02]',
  },
];

export default function QuizRunnerPage() {
  const { skillId } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Quiz session state
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [skillName, setSkillName] = useState('');
  const [skillCategory, setSkillCategory] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Menti Per-Question Timing & Gamification
  const [questionTimeLeft, setQuestionTimeLeft] = useState(QUESTION_TIME_LIMIT);
  const [questionStatus, setQuestionStatus] = useState<'ACTIVE' | 'LOCKED' | 'TIMEOUT'>('ACTIVE');
  const [lastPointsEarned, setLastPointsEarned] = useState<number | null>(null);
  const [totalScore, setTotalScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState(3);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Recorded answers per question
  const [recordedAnswers, setRecordedAnswers] = useState<
    Record<string, { selectedOptionIndex: number; timeSpentSeconds: number }>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Anti-cheat tracking
  const [tabSwitchWarnings, setTabSwitchWarnings] = useState(0);
  const [showCheatWarning, setShowCheatWarning] = useState(false);

  // Post-submission result state
  const [result, setResult] = useState<any | null>(null);

  // Synthesize Web Audio sound effects
  const playSound = useCallback(
    (type: 'tick' | 'select' | 'timeout' | 'complete') => {
      if (!soundEnabled || typeof window === 'undefined') return;
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;

        if (type === 'tick') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(800, now);
          gain.gain.setValueAtTime(0.04, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
          osc.start(now);
          osc.stop(now + 0.06);
        } else if (type === 'select') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(523.25, now); // C5
          osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.12); // E5
          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
          osc.start(now);
          osc.stop(now + 0.2);
        } else if (type === 'timeout') {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(220, now);
          osc.frequency.exponentialRampToValueAtTime(140, now + 0.3);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
          osc.start(now);
          osc.stop(now + 0.3);
        } else if (type === 'complete') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(523.25, now);
          osc.frequency.setValueAtTime(659.25, now + 0.15);
          osc.frequency.setValueAtTime(783.99, now + 0.3);
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
          osc.start(now);
          osc.stop(now + 0.5);
        }
      } catch (e) {
        // AudioContext policy ignored gracefully
      }
    },
    [soundEnabled]
  );

  // Start Standardized Quiz Session
  useEffect(() => {
    async function start() {
      try {
        const res = await api.post(`/quizzes/start/${skillId}`);
        const data = res.data.data;
        setAttemptId(data.attemptId);
        setSkillName(data.skillName);
        setSkillCategory(data.skillCategory);
        setQuestions(data.questions || []);
        setQuestionTimeLeft(QUESTION_TIME_LIMIT);
        setQuestionStatus('ACTIVE');
      } catch (err: any) {
        setErrorMsg(err.response?.data?.error?.message || 'Failed to initialize standardized quiz session.');
      } finally {
        setLoading(false);
      }
    }
    if (skillId) start();
  }, [skillId]);

  // Anti-Cheat: Visibility / Tab Switch Detection
  useEffect(() => {
    if (result) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchWarnings((prev) => {
          const next = prev + 1;
          setShowCheatWarning(true);
          return next;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [result]);

  // Final submission of all answers to backend API
  const handleFinalSubmit = useCallback(
    async (finalAnswers = recordedAnswers) => {
      if (isSubmitting || !attemptId) return;
      setIsSubmitting(true);
      setErrorMsg(null);

      const formattedAnswers = questions.map((q) => {
        const ans = finalAnswers[q.id];
        return {
          questionId: q.id,
          selectedOptionIndex: ans ? ans.selectedOptionIndex : -1,
          timeSpentSeconds: ans ? ans.timeSpentSeconds : QUESTION_TIME_LIMIT,
        };
      });

      try {
        const res = await api.post(`/quizzes/submit/${attemptId}`, {
          answers: formattedAnswers,
        });
        playSound('complete');
        setResult(res.data.data);
      } catch (err: any) {
        setErrorMsg(err.response?.data?.error?.message || 'Failed to submit quiz assessment');
      } finally {
        setIsSubmitting(false);
      }
    },
    [attemptId, isSubmitting, playSound, questions, recordedAnswers]
  );

  // Advance to next question or trigger final submission
  const advanceToNextQuestion = useCallback(
    (currentRecorded = recordedAnswers) => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setQuestionTimeLeft(QUESTION_TIME_LIMIT);
        setQuestionStatus('ACTIVE');
        setLastPointsEarned(null);
        setAutoAdvanceCountdown(3);
      } else {
        handleFinalSubmit(currentRecorded);
      }
    },
    [currentIndex, handleFinalSubmit, questions.length, recordedAnswers]
  );

  // Per-Question Countdown Timer (Mentimeter 30s)
  useEffect(() => {
    if (loading || result || questionStatus !== 'ACTIVE' || questions.length === 0) return;

    const timer = setInterval(() => {
      setQuestionTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Time's up for this question!
          playSound('timeout');
          setQuestionStatus('TIMEOUT');
          setStreak(0);
          setLastPointsEarned(0);

          const currentQ = questions[currentIndex];
          const updated = {
            ...recordedAnswers,
            [currentQ.id]: {
              selectedOptionIndex: -1,
              timeSpentSeconds: QUESTION_TIME_LIMIT,
            },
          };
          setRecordedAnswers(updated);
          return 0;
        }

        // Play ticking sound when 5 seconds or less remain
        if (prev <= 6) {
          playSound('tick');
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, result, questionStatus, questions, currentIndex, recordedAnswers, playSound]);

  // Auto-advance countdown when answer is locked or timed out
  useEffect(() => {
    if (questionStatus === 'ACTIVE' || result || isSubmitting) return;

    const interval = setInterval(() => {
      setAutoAdvanceCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          advanceToNextQuestion();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [questionStatus, result, isSubmitting, advanceToNextQuestion]);

  // Handle Option Click (Menti Immediate Lock & Score Calculation)
  const handleSelectOption = (optionIndex: number) => {
    if (questionStatus !== 'ACTIVE') return;

    const currentQ = questions[currentIndex];
    const timeSpent = Math.max(1, QUESTION_TIME_LIMIT - questionTimeLeft);

    // Mentimeter / Kahoot speed bonus: base 500 + up to 500 based on remaining seconds
    const speedBonus = Math.round((questionTimeLeft / QUESTION_TIME_LIMIT) * 500);
    const pointsAwarded = 500 + speedBonus;

    playSound('select');

    setLastPointsEarned(pointsAwarded);
    setTotalScore((prev) => prev + pointsAwarded);
    setStreak((prev) => {
      const nextStreak = prev + 1;
      if (nextStreak > maxStreak) setMaxStreak(nextStreak);
      return nextStreak;
    });

    const updated = {
      ...recordedAnswers,
      [currentQ.id]: {
        selectedOptionIndex: optionIndex,
        timeSpentSeconds: timeSpent,
      },
    };
    setRecordedAnswers(updated);
    setQuestionStatus('LOCKED');
    setAutoAdvanceCountdown(3);
  };

  // Timer Progress Calculation
  const timerPercentage = (questionTimeLeft / QUESTION_TIME_LIMIT) * 100;
  const isUrgent = questionTimeLeft <= 10;
  const isCritical = questionTimeLeft <= 5;

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-brand-600/10 text-brand-600 flex items-center justify-center animate-bounce">
          <Zap className="w-8 h-8 fill-brand-600" />
        </div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">
          Preparing Menti-Style Technical Arena...
        </h2>
        <p className="text-xs text-slate-500 max-w-sm">
          Generating verified question bank, initializing 30s per-section countdown timer, and priming anti-cheat session.
        </p>
      </div>
    );
  }

  if (errorMsg && !result) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Unable to Start Assessment</h2>
        <p className="text-xs text-slate-600 leading-relaxed">{errorMsg}</p>
        <div className="pt-3">
          <Button href="/student/assessments">Back to Assessments Hub</Button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // POST-SUBMISSION MENTI RESULTS & PODIUM VIEW
  // -------------------------------------------------------------
  if (result) {
    const isSuccess = result.isPassed;

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8 animate-fade-in">
        {/* Celebration Podium Card */}
        <div
          className={clsx(
            'relative overflow-hidden rounded-3xl p-8 sm:p-10 border shadow-2xl text-center space-y-6',
            isSuccess
              ? 'bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 border-indigo-500/30 text-white'
              : 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-slate-700 text-white'
          )}
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Badge & Trophy Header */}
          <div className="relative inline-flex items-center justify-center">
            <div
              className={clsx(
                'w-20 h-20 rounded-3xl flex items-center justify-center shadow-xl',
                isSuccess
                  ? 'bg-gradient-to-tr from-amber-400 to-amber-200 text-amber-950 ring-4 ring-amber-400/30 animate-pulse'
                  : 'bg-slate-800 text-slate-300 ring-4 ring-slate-700'
              )}
            >
              <Trophy className="w-10 h-10" />
            </div>
            {isSuccess && (
              <span className="absolute -top-2 -right-2 px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black tracking-wider uppercase shadow">
                VERIFIED
              </span>
            )}
          </div>

          <div className="space-y-2 relative">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              {isSuccess ? 'Outstanding Performance!' : 'Assessment Completed'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
              {isSuccess
                ? `You passed the standardized ${result.skillName} evaluation and earned an official verified skill badge for your profile!`
                : `You scored ${result.scorePercentage}%. The passing benchmark is 70%. Review your question breakdown below and retake after the 24-hour review period.`}
            </p>
          </div>

          {/* Gamified Stat Pill Rows */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto pt-2 relative">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
                Accuracy
              </span>
              <span className="text-2xl sm:text-3xl font-black text-white mt-1 block">
                {result.scorePercentage}%
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                {result.correctCount} / {result.totalQuestions} correct
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
                Menti Points
              </span>
              <span className="text-2xl sm:text-3xl font-black text-amber-300 mt-1 block">
                {totalScore.toLocaleString()}
              </span>
              <span className="text-[10px] text-amber-200/80 mt-0.5 block">Speed bonus included</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
                Max Streak
              </span>
              <div className="flex items-center justify-center gap-1 mt-1">
                <Flame className="w-5 h-5 text-rose-400 fill-rose-400" />
                <span className="text-2xl sm:text-3xl font-black text-rose-300">
                  {maxStreak}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Consecutive answers</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
                Verified Badge
              </span>
              <div className="mt-1 flex justify-center">
                {result.badgeTier ? (
                  <SkillBadge
                    name={result.skillName}
                    verifiedScore={result.scorePercentage}
                    size="sm"
                  />
                ) : (
                  <span className="text-xs font-semibold px-2.5 py-1 bg-slate-800 text-slate-400 rounded-lg">
                    None Earned
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Profile proof</span>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3 relative">
            <Button href="/student/internships" size="lg" className="shadow-lg shadow-brand-500/25">
              Explore Matching Internships
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              href="/student/assessments"
              variant="outline"
              size="lg"
              className="text-white border-white/20 hover:bg-white/10"
            >
              Assessments Hub
            </Button>
          </div>
        </div>

        {/* Detailed Question Review & Answers */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-card space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Question Breakdown & Explanations
                </h2>
                <p className="text-xs text-slate-500">
                  Study the official explanations to deepen your domain knowledge.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {result.answerReviews?.length || 0} Questions Evaluated
            </span>
          </div>

          <div className="space-y-6">
            {result.answerReviews?.map((review: any, idx: number) => (
              <div
                key={review.questionId}
                className={clsx(
                  'p-5 sm:p-6 rounded-2xl border text-xs space-y-4 transition-all',
                  review.isCorrect
                    ? 'bg-emerald-50/40 border-emerald-200 shadow-sm'
                    : 'bg-rose-50/40 border-rose-200 shadow-sm'
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span
                      className={clsx(
                        'w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0',
                        review.isCorrect
                          ? 'bg-emerald-600 text-white'
                          : 'bg-rose-600 text-white'
                      )}
                    >
                      {idx + 1}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                      {review.questionText}
                    </h3>
                  </div>
                  <div>
                    {review.isCorrect ? (
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Correct (+500+)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-bold text-rose-800 bg-rose-100 px-2.5 py-1 rounded-full text-xs">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" /> Incorrect
                      </span>
                    )}
                  </div>
                </div>

                {review.codeSnippet && (
                  <pre className="p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto border border-slate-800">
                    {review.codeSnippet}
                  </pre>
                )}

                {/* Option Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {review.options?.map((opt: string, optIdx: number) => {
                    const isSelected = review.selectedOptionIndex === optIdx;
                    const isCorrectAnswer = review.correctAnswerIndex === optIdx;
                    const cardConfig = MENTI_CARDS[optIdx % MENTI_CARDS.length];

                    return (
                      <div
                        key={optIdx}
                        className={clsx(
                          'p-3 rounded-xl border text-xs flex items-center justify-between gap-2 transition-all',
                          isCorrectAnswer
                            ? 'bg-emerald-100 border-emerald-300 font-bold text-emerald-950 ring-2 ring-emerald-400/40'
                            : isSelected
                            ? 'bg-rose-100 border-rose-300 font-bold text-rose-950'
                            : 'bg-white/80 border-slate-200 text-slate-600'
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-5 h-5 rounded-md bg-slate-900/10 flex items-center justify-center font-black text-[11px] shrink-0">
                            {cardConfig.symbol}
                          </span>
                          <span className="truncate">{opt}</span>
                        </div>

                        {isCorrectAnswer && (
                          <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider shrink-0 bg-emerald-200/80 px-2 py-0.5 rounded">
                            Correct
                          </span>
                        )}
                        {!isCorrectAnswer && isSelected && (
                          <span className="text-[10px] font-black text-rose-700 uppercase tracking-wider shrink-0 bg-rose-200/80 px-2 py-0.5 rounded">
                            Your Choice
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                <div className="p-3.5 bg-white/90 rounded-xl border border-slate-200 text-slate-700 leading-relaxed text-xs">
                  <span className="font-bold text-slate-900 block mb-0.5">
                    Technical Explanation:
                  </span>
                  {review.explanation}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // ACTIVE MENTI-STYLE QUIZ RUNNER INTERFACE
  // -------------------------------------------------------------
  const currentQ = questions[currentIndex];
  const currentAnswer = currentQ ? recordedAnswers[currentQ.id] : undefined;
  const isAnswerLocked = questionStatus !== 'ACTIVE';

  return (
    <div
      className="min-h-screen bg-slate-900 text-white flex flex-col justify-between select-none relative overflow-x-hidden"
      onCopy={(e) => e.preventDefault()}
    >
      {/* Top Navigation Bar */}
      <header className="p-4 sm:p-5 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center font-black text-white shadow-md shadow-brand-500/20">
            <Zap className="w-5 h-5 fill-white" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 block">
              Menti Arena • {skillCategory || 'Skill Assessment'}
            </span>
            <h1 className="text-base sm:text-lg font-black text-white leading-tight">
              {skillName}
            </h1>
          </div>
        </div>

        {/* Gamified Live Scoreboard & Controls */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Score Counter */}
          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 px-3 py-1.5 rounded-2xl text-xs">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400 font-medium hidden sm:inline">Score:</span>
            <span className="font-black text-amber-300 text-sm font-mono">
              {totalScore.toLocaleString()}
            </span>
          </div>

          {/* Streak Counter */}
          <div
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold border transition-all',
              streak > 0
                ? 'bg-rose-950/60 border-rose-500/50 text-rose-300 shadow-sm shadow-rose-950'
                : 'bg-slate-800/80 border-slate-700/80 text-slate-400'
            )}
          >
            <Flame
              className={clsx(
                'w-4 h-4',
                streak > 0 ? 'text-rose-500 fill-rose-500 animate-pulse' : 'text-slate-500'
              )}
            />
            <span>{streak} Streak</span>
          </div>

          {/* Audio Mute/Unmute */}
          <button
            onClick={() => setSoundEnabled((prev) => !prev)}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
            title={soundEnabled ? 'Mute Sounds' : 'Enable Sounds'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
        </div>
      </header>

      {/* Anti-cheat tab switch warning banner */}
      {showCheatWarning && (
        <div className="bg-amber-500 text-amber-950 px-4 py-2 text-xs font-bold flex items-center justify-between z-30 shadow-md">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-950 shrink-0" />
            <span>
              Integrity Warning ({tabSwitchWarnings}/3): Window tab switch detected! Standardized verification results are logged.
            </span>
          </div>
          <button
            onClick={() => setShowCheatWarning(false)}
            className="underline hover:opacity-80 ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Question Display Area */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6 flex flex-col justify-between gap-6 z-10">
        {/* Question Info Header & Dedicated Mentimeter Timer */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-brand-400 text-xs font-black tracking-wider uppercase">
                Section {currentIndex + 1} of {questions.length}
              </span>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider capitalize">
                {currentQ?.difficulty.toLowerCase()} Level
              </span>
            </div>

            {/* Central Animated Time Pill */}
            <div
              className={clsx(
                'flex items-center gap-2 px-4 py-1.5 rounded-full font-mono font-black text-sm border shadow-lg transition-all',
                isCritical
                  ? 'bg-rose-500 text-white border-rose-400 animate-ping-short ring-4 ring-rose-500/30'
                  : isUrgent
                  ? 'bg-amber-500 text-white border-amber-400'
                  : 'bg-slate-800 border-slate-700 text-emerald-400'
              )}
            >
              <Timer className="w-4 h-4" />
              <span>00:{String(questionTimeLeft).padStart(2, '0')}</span>
            </div>
          </div>

          {/* Linear Countdown Progress Bar */}
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={clsx(
                'h-full transition-all duration-1000 ease-linear rounded-full',
                isCritical
                  ? 'bg-rose-500'
                  : isUrgent
                  ? 'bg-amber-400'
                  : 'bg-gradient-to-r from-brand-500 to-emerald-400'
              )}
              style={{ width: `${timerPercentage}%` }}
            />
          </div>

          {/* Question Text & Code Snippet */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-4">
            <h2 className="text-lg sm:text-2xl font-black text-white leading-snug">
              {currentQ?.questionText}
            </h2>

            {currentQ?.codeSnippet && (
              <pre className="p-4 bg-slate-900/90 text-emerald-300 font-mono text-xs sm:text-sm rounded-2xl overflow-x-auto text-left border border-slate-800">
                {currentQ.codeSnippet}
              </pre>
            )}
          </div>
        </div>

        {/* 4-Quadrant Mentimeter Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {currentQ?.options.map((opt, optIdx) => {
            const card = MENTI_CARDS[optIdx % MENTI_CARDS.length];
            const isSelected = currentAnswer?.selectedOptionIndex === optIdx;

            return (
              <button
                key={optIdx}
                type="button"
                disabled={isAnswerLocked}
                onClick={() => handleSelectOption(optIdx)}
                className={clsx(
                  'relative group p-5 sm:p-6 rounded-2xl border text-left transition-all duration-200 cursor-pointer overflow-hidden flex items-center justify-between gap-4',
                  card.bg,
                  card.border,
                  card.shadow,
                  isSelected && card.selectedBg,
                  isAnswerLocked && !isSelected && 'opacity-40 grayscale-[40%] cursor-not-allowed scale-[0.98]'
                )}
              >
                {/* Shape Badge & Text */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <span
                    className={clsx(
                      'w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shrink-0 shadow-inner',
                      card.badgeBg
                    )}
                  >
                    {card.symbol}
                  </span>
                  <span className="text-white font-bold text-sm sm:text-base leading-snug break-words">
                    {opt}
                  </span>
                </div>

                {/* Selection Indicator */}
                {isSelected && (
                  <div className="w-8 h-8 rounded-full bg-white text-slate-950 flex items-center justify-center font-bold shadow-md shrink-0 animate-bounce">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Action & Feedback Footer Banner */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Status Message */}
          <div className="text-center sm:text-left">
            {questionStatus === 'ACTIVE' ? (
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-400" />
                <span>Select your answer before the 30-second section timer expires!</span>
              </div>
            ) : questionStatus === 'TIMEOUT' ? (
              <div className="text-xs font-bold text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>Time Expired! Moving to next section in {autoAdvanceCountdown}s...</span>
              </div>
            ) : (
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>
                  Answer Locked! +{lastPointsEarned} Speed Points! Next section in {autoAdvanceCountdown}s...
                </span>
              </div>
            )}
          </div>

          {/* Skip / Next Button */}
          {isAnswerLocked && (
            <Button
              size="sm"
              onClick={() => advanceToNextQuestion()}
              isLoading={isSubmitting}
              className="bg-white text-slate-900 hover:bg-slate-100 font-bold shadow-md"
            >
              {currentIndex < questions.length - 1 ? (
                <>
                  Next Section
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              ) : (
                <>
                  View Results & Scorecard
                  <Trophy className="w-4 h-4 ml-1.5" />
                </>
              )}
            </Button>
          )}
        </div>
      </main>

      {/* Bottom Section Navigator Drawer */}
      <footer className="p-3 bg-slate-950/90 border-t border-slate-800/80 flex items-center justify-center gap-1.5 overflow-x-auto z-10">
        {questions.map((q, idx) => {
          const isAnswered = recordedAnswers[q.id] !== undefined;
          const isCurrent = idx === currentIndex;

          return (
            <div
              key={q.id}
              className={clsx(
                'w-6 h-6 rounded-md font-bold text-[10px] flex items-center justify-center transition-all',
                isCurrent
                  ? 'bg-brand-500 text-white ring-2 ring-brand-300 scale-110 shadow'
                  : isAnswered
                  ? 'bg-emerald-600/80 text-white'
                  : 'bg-slate-800 text-slate-500'
              )}
            >
              {idx + 1}
            </div>
          );
        })}
      </footer>
    </div>
  );
}
