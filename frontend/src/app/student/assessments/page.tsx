'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/shared/Sidebar';
import { Button } from '@/components/ui/Button';
import { SkillBadge } from '@/components/ui/SkillBadge';
import {
  Award,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Sparkles,
  BookOpen,
  Filter,
} from 'lucide-react';

export default function StudentAssessmentsPage() {
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const fetchQuizzes = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.get('/quizzes/available');
      setSkills(res.data.data || []);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to load available assessments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const categories = Array.from(new Set(skills.map((s) => s.category)));
  const filteredSkills = selectedCategory
    ? skills.filter((s) => s.category === selectedCategory)
    : skills;

  const verifiedCount = skills.filter((s) => s.verifiedScore !== null).length;
  const goldCount = skills.filter((s) => s.badgeTier === 'GOLD').length;
  const silverCount = skills.filter((s) => s.badgeTier === 'SILVER').length;

  return (
    <div className="flex-1 flex bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-8 max-w-6xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Award className="w-6 h-6 text-brand-600" />
              Verified Skill Assessments
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Prove your abilities with timed, standardized technical quizzes. Earn Gold, Silver, and Bronze Verified Badges.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-2" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border-none bg-transparent text-slate-700 font-medium focus:ring-0 cursor-pointer pr-2"
            >
              <option value="">All Categories ({skills.length})</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm flex items-center gap-2 shadow-subtle">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Badges & Stats Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Verified Skills
            </span>
            <div className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <span>{verifiedCount}</span>
              <span className="text-xs text-slate-400 font-normal">of {skills.length} skills</span>
            </div>
            <span className="text-xs text-emerald-600 font-medium block">
              Boosts internship match score by up to 25%
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Gold Tier Badges (90%+)
            </span>
            <div className="text-2xl font-bold text-amber-600 flex items-center gap-2">
              <Award className="w-6 h-6 text-amber-500" />
              <span>{goldCount}</span>
            </div>
            <span className="text-xs text-slate-400 block">Top 10th percentile benchmark</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Silver Tier Badges (80-89%)
            </span>
            <div className="text-2xl font-bold text-slate-700 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-slate-500" />
              <span>{silverCount}</span>
            </div>
            <span className="text-xs text-slate-400 block">Proven industry readiness</span>
          </div>
        </div>

        {/* Skills Grid */}
        {loading ? (
          <div className="py-16 text-center text-sm text-slate-500">
            Loading skills and assessment question banks...
          </div>
        ) : filteredSkills.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
            No assessment quizzes found for category &apos;{selectedCategory}&apos;.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSkills.map((skill) => (
              <div
                key={skill.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-subtle hover:shadow-card transition-standard flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-100 px-2.5 py-0.5 rounded">
                      {skill.category}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      15 min · 10 Qs
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">{skill.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {skill.description || 'Standard technical evaluation covering core concepts and architecture.'}
                    </p>
                  </div>

                  {/* Badge & Score status */}
                  <div className="pt-2">
                    {skill.verifiedScore !== null ? (
                      <div className="space-y-1.5">
                        <SkillBadge
                          name={skill.name}
                          verifiedScore={skill.verifiedScore}
                          size="md"
                        />
                        <span className="text-[11px] text-slate-400 block">
                          Assessed on {new Date(skill.lastAssessedAt).toLocaleDateString()}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">
                        Not yet verified — take quiz to earn badge
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Action */}
                <div className="pt-3 border-t border-slate-100">
                  {skill.canRetake ? (
                    <Button
                      href={`/student/assessments/${skill.id}`}
                      className="w-full justify-center"
                    >
                      {skill.verifiedScore !== null ? 'Retake Assessment' : 'Start Assessment'}
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  ) : (
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs text-slate-500 space-y-1">
                      <span className="font-semibold block text-slate-700 flex items-center justify-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        Cooldown Active (24h)
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Retake available:{' '}
                        {skill.nextRetakeAvailableAt
                          ? new Date(skill.nextRetakeAvailableAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Tomorrow'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Verification Policy Information Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <ShieldCheck className="w-5 h-5 text-brand-600" />
            <span>NEXAURA Standardized Skill Verification Policy</span>
          </div>
          <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside leading-relaxed">
            <li>
              <strong>Standardized & Timed:</strong> Each assessment consists of 10 randomly selected technical questions drawn from verified question banks, with a strict 15-minute time limit.
            </li>
            <li>
              <strong>Anti-Cheat & Tab Monitoring:</strong> Switching tabs or navigating away triggers warning flags and will auto-submit the quiz upon repeated violations.
            </li>
            <li>
              <strong>Fair Retake Policy:</strong> A 24-hour cooldown period is enforced between attempts to encourage learning over brute-force trial and error.
            </li>
            <li>
              <strong>Employer Visibility:</strong> Verified badges are permanently attached to your student profile and prominently displayed on all internship applications.
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
