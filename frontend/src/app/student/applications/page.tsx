'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/shared/Sidebar';
import { Button } from '@/components/ui/Button';
import { VerificationBadge } from '@/components/ui/VerificationBadge';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  Building2,
  ArrowRight,
  Sparkles,
  MapPin,
  IndianRupee,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { clsx } from 'clsx';

const PIPELINE_STAGES = ['APPLIED', 'SHORTLISTED', 'INTERVIEW', 'SELECTED'];

export default function StudentApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  const fetchApplications = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.get('/applications/my-applications');
      setApplications(res.data.data || []);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleWithdraw = async (applicationId: string) => {
    if (!confirm('Are you sure you want to withdraw this application? This action cannot be undone.')) {
      return;
    }

    setWithdrawingId(applicationId);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await api.delete(`/applications/${applicationId}/withdraw`);
      setSuccessMsg('Application withdrawn successfully.');
      await fetchApplications();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to withdraw application');
    } finally {
      setWithdrawingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SELECTED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Offer Extended / Selected
          </span>
        );
      case 'INTERVIEW':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-purple-600" />
            Interview Scheduled
          </span>
        );
      case 'SHORTLISTED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Shortlisted for Review
          </span>
        );
      case 'APPLIED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            Application Submitted
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
            Not Selected
          </span>
        );
      case 'WITHDRAWN':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
            Withdrawn by Candidate
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  const getStageIndex = (status: string) => {
    if (status === 'REJECTED' || status === 'WITHDRAWN') return -1;
    return PIPELINE_STAGES.indexOf(status);
  };

  return (
    <div className="flex-1 flex bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-8 max-w-5xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <FileText className="w-6 h-6 text-brand-600" />
              My Internship Applications
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Track real-time hiring stage transitions, employer feedback notes, and offer statuses.
            </p>
          </div>

          <Button href="/internships" size="sm">
            Browse More Internships
          </Button>
        </div>

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex items-center gap-2 shadow-subtle">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm flex items-center gap-2 shadow-subtle">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Applications List */}
        {loading ? (
          <div className="py-20 text-center text-sm text-slate-500">
            Loading your applications...
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-subtle">
            <FileText className="w-12 h-12 text-slate-300 mx-auto" />
            <div>
              <h3 className="text-base font-bold text-slate-900">No Applications Submitted Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Explore recommended internships aligned with your verified skills and academic track.
              </p>
            </div>
            <div className="pt-2">
              <Button href="/student/recommendations">View Matched Opportunities</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {applications.map((app) => {
              const currentStageIdx = getStageIndex(app.currentStatus);
              const isTerminalNegative =
                app.currentStatus === 'REJECTED' || app.currentStatus === 'WITHDRAWN';
              const canWithdraw =
                app.currentStatus !== 'WITHDRAWN' &&
                app.currentStatus !== 'REJECTED' &&
                app.currentStatus !== 'SELECTED';

              return (
                <div
                  key={app.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle hover:shadow-card transition-standard space-y-6"
                >
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-100 px-2.5 py-0.5 rounded">
                          {app.internship?.category}
                        </span>
                        <VerificationBadge
                          status={app.internship?.company?.verificationStatus || 'UNVERIFIED'}
                        />
                      </div>

                      <h2 className="text-lg font-bold text-slate-900 mt-1">
                        {app.internship?.title}
                      </h2>

                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <span className="font-semibold text-slate-800">
                          {app.internship?.company?.brandName}
                        </span>
                        <span>·</span>
                        <span>Applied on {new Date(app.createdAt).toLocaleDateString()}</span>
                        {app.matchScoreSnapshot && (
                          <>
                            <span>·</span>
                            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {app.matchScoreSnapshot}% Match Snapshot
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div>{getStatusBadge(app.currentStatus)}</div>
                  </div>

                  {/* Stage Pipeline Stepper */}
                  {!isTerminalNegative && (
                    <div className="pt-2">
                      <div className="relative flex items-center justify-between">
                        {/* Horizontal connecting bar */}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-0" />
                        <div
                          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-brand-600 -z-0 transition-all duration-500"
                          style={{
                            width: `${(currentStageIdx / (PIPELINE_STAGES.length - 1)) * 100}%`,
                          }}
                        />

                        {PIPELINE_STAGES.map((stage, idx) => {
                          const isPassed = idx <= currentStageIdx;
                          const isCurrent = idx === currentStageIdx;

                          return (
                            <div key={stage} className="relative z-10 flex flex-col items-center">
                              <div
                                className={clsx(
                                  'w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-standard',
                                  isCurrent
                                    ? 'bg-brand-600 text-white ring-4 ring-brand-100 shadow-sm'
                                    : isPassed
                                    ? 'bg-brand-600 text-white'
                                    : 'bg-white border-2 border-slate-300 text-slate-400'
                                )}
                              >
                                {isPassed ? (
                                  <CheckCircle2 className="w-4 h-4" />
                                ) : (
                                  <span>{idx + 1}</span>
                                )}
                              </div>
                              <span
                                className={clsx(
                                  'text-[10px] font-bold uppercase tracking-wider mt-2 block text-center',
                                  isCurrent
                                    ? 'text-brand-700'
                                    : isPassed
                                    ? 'text-slate-800'
                                    : 'text-slate-400'
                                )}
                              >
                                {stage === 'SELECTED' ? 'Offer Made' : stage.toLowerCase()}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Status History & Employer Notes */}
                  {app.statusHistory?.length > 0 && (
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-2">
                      <span className="font-semibold text-slate-700 block">
                        Recent Stage Activity & Employer Notes:
                      </span>
                      <ul className="space-y-1.5 text-slate-600">
                        {app.statusHistory.map((hist: any) => (
                          <li key={hist.id} className="flex items-start gap-2">
                            <span className="text-slate-400 font-mono text-[10px] shrink-0 mt-0.5">
                              [{new Date(hist.createdAt).toLocaleDateString()}]
                            </span>
                            <span>
                              Status changed to{' '}
                              <strong className="text-slate-900">{hist.toStatus}</strong>
                              {hist.notes ? ` — "${hist.notes}"` : ''}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <a
                      href={`/internships/${app.internshipId}`}
                      className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                    >
                      View Original Listing <ArrowRight className="w-3.5 h-3.5" />
                    </a>

                    {canWithdraw && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleWithdraw(app.id)}
                        disabled={withdrawingId === app.id}
                        className="text-slate-500 hover:text-rose-600"
                      >
                        Withdraw Application
                      </Button>
                    )}
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
