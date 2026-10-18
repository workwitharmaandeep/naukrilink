'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/shared/Sidebar';
import { Button } from '@/components/ui/Button';
import { VerificationBadge } from '@/components/ui/VerificationBadge';
import { SkillBadge } from '@/components/ui/SkillBadge';
import {
  Award,
  Sparkles,
  MapPin,
  Clock,
  IndianRupee,
  Building2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Filter,
  Check,
  X,
  HelpCircle,
} from 'lucide-react';
import { clsx } from 'clsx';

export default function StudentRecommendationsPage() {
  const [internships, setInternships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'HIGH' | 'REMOTE'>('ALL');

  const fetchRecommendations = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.get('/matching/recommendations');
      setInternships(res.data.data || []);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to calculate internship recommendations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const filteredInternships = internships.filter((item) => {
    const match = item.matchResult;
    if (activeFilter === 'HIGH') return match.matchPercentage >= 80;
    if (activeFilter === 'REMOTE') return item.workMode === 'REMOTE';
    return true;
  });

  const getMatchColor = (percentage: number) => {
    if (percentage >= 85) return 'bg-emerald-50 text-emerald-800 border-emerald-300';
    if (percentage >= 70) return 'bg-blue-50 text-blue-800 border-blue-300';
    return 'bg-amber-50 text-amber-800 border-amber-300';
  };

  return (
    <div className="flex-1 flex bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-8 max-w-6xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-brand-600" />
              Smart Match Recommendations
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Personalized opportunities ranked by verified skill proof, academic alignment, and work preferences.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-standard',
                activeFilter === 'ALL'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              )}
            >
              All Matches ({internships.length})
            </button>
            <button
              onClick={() => setActiveFilter('HIGH')}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-standard',
                activeFilter === 'HIGH'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              )}
            >
              Top Matches (&ge;80%)
            </button>
            <button
              onClick={() => setActiveFilter('REMOTE')}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-standard',
                activeFilter === 'REMOTE'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              )}
            >
              Remote Only
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm flex items-center gap-2 shadow-subtle">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Internships List */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Sparkles className="w-8 h-8 text-brand-600 animate-spin mx-auto" />
            <h2 className="text-base font-bold text-slate-800">Calculating Personalized Match Scores...</h2>
            <p className="text-xs text-slate-500">
              Evaluating skill overlap, verified quiz scores, academic batch filters, and location preferences.
            </p>
          </div>
        ) : filteredInternships.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-subtle">
            <Award className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No Matching Internships Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Check back soon as new employers post verified listings, or update your profile skills and take assessments to expand match criteria.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredInternships.map((internship) => {
              const match = internship.matchResult;
              const matchPercentage = match?.matchPercentage ?? 0;

              return (
                <div
                  key={internship.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle hover:shadow-card transition-standard space-y-5"
                >
                  {/* Top Bar: Title, Company, Match Pill */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-100 px-2.5 py-0.5 rounded">
                          {internship.category}
                        </span>
                        <VerificationBadge
                          status={internship.company?.verificationStatus || 'UNVERIFIED'}
                        />
                      </div>

                      <h2 className="text-lg font-bold text-slate-900 mt-1.5">
                        {internship.title}
                      </h2>

                      <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
                        <span className="font-semibold text-slate-800">
                          {internship.company?.brandName}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {internship.workMode === 'REMOTE'
                            ? 'Remote'
                            : `${internship.locationCity || 'Onsite'}, ${internship.locationState || ''}`}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                          <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                          {internship.isUnpaid
                            ? 'Unpaid'
                            : internship.stipendAmount
                            ? `₹${internship.stipendAmount.toLocaleString()}/mo`
                            : 'Disclosed'}
                        </span>
                      </div>
                    </div>

                    {/* Match Score Badge */}
                    <div
                      className={clsx(
                        'px-4 py-2 rounded-2xl border text-center shrink-0 self-start sm:self-center',
                        getMatchColor(matchPercentage)
                      )}
                    >
                      <span className="text-2xl font-black block leading-none">
                        {matchPercentage}%
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-wider mt-1 block">
                        Match Score
                      </span>
                    </div>
                  </div>

                  {/* Smart Match Breakdown Card */}
                  <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100 text-xs space-y-3">
                    <div className="flex items-center gap-2 text-slate-800 font-bold">
                      <Sparkles className="w-4 h-4 text-brand-600" />
                      <span>Why you matched:</span>
                    </div>

                    <p className="text-slate-600 leading-relaxed">
                      {match?.explanationText}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                          Matched Skills ({match?.matchedSkills?.length || 0}):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {match?.matchedSkills?.length > 0 ? (
                            match.matchedSkills.map((s: string) => (
                              <span
                                key={s}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200"
                              >
                                <Check className="w-3 h-3 text-emerald-600" />
                                {s}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 italic">None</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                          Skills to Develop ({match?.missingSkills?.length || 0}):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {match?.missingSkills?.length > 0 ? (
                            match.missingSkills.map((s: string) => (
                              <span
                                key={s}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-200/70 text-slate-700"
                              >
                                <span className="text-slate-400">+</span>
                                {s}
                              </span>
                            ))
                          ) : (
                            <span className="text-emerald-700 font-semibold">
                              All required skills covered!
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-xs text-slate-400">
                      Application deadline:{' '}
                      {new Date(internship.deadline).toLocaleDateString()}
                    </span>

                    <div className="flex items-center gap-3">
                      <Button
                        href={`/internships/${internship.id}`}
                        variant="secondary"
                        size="sm"
                      >
                        View Details
                      </Button>
                      <Button href={`/internships/${internship.id}`} size="sm">
                        Apply Now
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
