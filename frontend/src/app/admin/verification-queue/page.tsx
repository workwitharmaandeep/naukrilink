'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/shared/Sidebar';
import { Button } from '@/components/ui/Button';
import {
  ShieldCheck,
  ShieldAlert,
  Shield,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText,
  Building2,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';

export default function AdminVerificationQueuePage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('PENDING_REVIEW');
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);

  // Review dialog state
  const [reviewingRequest, setReviewingRequest] = useState<any | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [decisionAction, setDecisionAction] = useState<'VERIFIED' | 'REJECTED' | 'SUSPENDED'>('VERIFIED');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const fetchQueue = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const url = statusFilter
        ? `/verification/admin/queue?status=${statusFilter}`
        : '/verification/admin/queue';
      const res = await api.get(url);
      setRequests(res.data.data || []);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to fetch verification queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [statusFilter]);

  const handleOpenReview = (req: any, action: 'VERIFIED' | 'REJECTED' | 'SUSPENDED') => {
    setReviewingRequest(req);
    setDecisionAction(action);
    setAdminNotes(
      action === 'VERIFIED'
        ? 'Statutory credentials and domain identity verified in accordance with platform standards.'
        : action === 'REJECTED'
        ? 'Verification rejected due to mismatch in statutory records or inability to confirm business identity.'
        : 'Company suspended pending formal investigation.'
    );
  };

  const handleSubmitDecision = async () => {
    if (!reviewingRequest) return;
    if (!adminNotes.trim()) {
      setErrorMsg('Admin notes are mandatory to record reason for decision in audit log.');
      return;
    }

    setIsSubmittingReview(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await api.patch(`/verification/admin/review/${reviewingRequest.id}`, {
        status: decisionAction,
        adminNotes: adminNotes.trim(),
      });
      setSuccessMsg(
        `Verification request for ${reviewingRequest.company?.brandName} marked as ${decisionAction}.`
      );
      setReviewingRequest(null);
      await fetchQueue();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to submit review decision');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
      case 'PASSED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {status}
          </span>
        );
      case 'PENDING_REVIEW':
      case 'WARNING':
      case 'MANUAL_REVIEW':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            {status.replace(/_/g, ' ')}
          </span>
        );
      case 'REJECTED':
      case 'FAILED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" />
            {status}
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            SUSPENDED
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="flex-1 flex bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-8 max-w-6xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-brand-600" />
              Company Verification Moderation Queue
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Review automated statutory audit results, DNS resolution, and approve genuine employers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400 ml-2" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border-none bg-transparent text-slate-700 font-medium focus:ring-0 cursor-pointer pr-2"
              >
                <option value="">All Requests</option>
                <option value="PENDING_REVIEW">Pending Manual Review</option>
                <option value="VERIFIED">Approved / Verified</option>
                <option value="REJECTED">Rejected</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>

            <Button variant="ghost" size="sm" onClick={fetchQueue}>
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
          </div>
        </div>

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex items-center gap-2 shadow-subtle">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm flex items-center gap-2 shadow-subtle">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Requests List */}
        {loading ? (
          <div className="py-16 text-center text-sm text-slate-500">
            Loading verification queue...
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-subtle">
            <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">Queue is Clear</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              No verification requests currently matching filter &apos;{statusFilter || 'All'}&apos;.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => {
              const isExpanded = expandedRequestId === req.id;
              const company = req.company;
              const checks = req.checks || [];

              return (
                <div
                  key={req.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-subtle overflow-hidden transition-standard"
                >
                  {/* Card Header */}
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-5 h-5 text-slate-400" />
                          <h2 className="text-lg font-bold text-slate-900">
                            {company?.brandName || 'Unnamed Brand'}
                          </h2>
                          <span className="text-xs text-slate-400">
                            ({company?.legalName || 'Legal name not provided'})
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-slate-500">
                          <span>
                            Email: <strong className="text-slate-700">{company?.user?.email}</strong>
                          </span>
                          <span>
                            Submitted:{' '}
                            <strong className="text-slate-700">
                              {new Date(req.createdAt).toLocaleString()}
                            </strong>
                          </span>
                          {req.websiteSubmitted && (
                            <a
                              href={req.websiteSubmitted}
                              target="_blank"
                              rel="noreferrer"
                              className="text-brand-600 hover:text-brand-700 flex items-center gap-1 font-medium"
                            >
                              {req.websiteSubmitted}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {getStatusBadge(req.status)}
                      </div>
                    </div>

                    {/* Statutory Highlights */}
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                      <div>
                        <span className="text-slate-400 block font-medium">GSTIN Submitted:</span>
                        <span className="font-mono font-semibold text-slate-800">
                          {req.gstinSubmitted || 'None'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">CIN Submitted:</span>
                        <span className="font-mono font-semibold text-slate-800">
                          {req.cinSubmitted || 'None'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Automated Checks:</span>
                        <span className="font-semibold text-slate-800">
                          {checks.filter((c: any) => c.status === 'PASSED').length} of {checks.length} Passed
                        </span>
                      </div>
                    </div>

                    {/* Admin notes if already reviewed */}
                    {req.adminNotes && (
                      <div className="mt-3 p-3 bg-amber-50/60 border border-amber-200/60 rounded-xl text-xs text-amber-900">
                        <span className="font-semibold">Reviewer Notes:</span> {req.adminNotes}
                      </div>
                    )}

                    {/* Bottom Action Bar */}
                    <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedRequestId(isExpanded ? null : req.id)
                        }
                        className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 self-start"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-4 h-4" />
                            Hide Check Audit Logs ({checks.length})
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            View Verification Audit Logs ({checks.length})
                          </>
                        )}
                      </button>

                      <div className="flex items-center gap-2">
                        {req.status !== 'VERIFIED' && (
                          <Button
                            size="sm"
                            onClick={() => handleOpenReview(req, 'VERIFIED')}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                            Approve
                          </Button>
                        )}

                        {req.status !== 'REJECTED' && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleOpenReview(req, 'REJECTED')}
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1" />
                            Reject
                          </Button>
                        )}

                        {req.status === 'VERIFIED' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleOpenReview(req, 'SUSPENDED')}
                          >
                            <ShieldAlert className="w-3.5 h-3.5 mr-1 text-purple-600" />
                            Suspend
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Audit Check Breakdown */}
                  {isExpanded && (
                    <div className="bg-slate-50 border-t border-slate-200 p-6 space-y-3">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Execution Details by Verification Provider
                      </h4>

                      {checks.length === 0 ? (
                        <p className="text-xs text-slate-500 italic">No check records found.</p>
                      ) : (
                        <div className="space-y-2">
                          {checks.map((chk: any) => (
                            <div
                              key={chk.id}
                              className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900">
                                    {chk.checkType.replace(/_/g, ' ')}
                                  </span>
                                  <span className="text-[10px] font-mono text-slate-400">
                                    via {chk.providerName}
                                  </span>
                                </div>
                                <p className="text-slate-600 leading-relaxed">
                                  {chk.details}
                                </p>
                                {chk.rawResponseSummary && (
                                  <details className="mt-1 text-[11px] text-slate-500">
                                    <summary className="cursor-pointer text-brand-600 hover:underline">
                                      Raw Provider Response Payload
                                    </summary>
                                    <pre className="mt-1 p-2 bg-slate-900 text-emerald-400 rounded overflow-x-auto text-[10px] font-mono">
                                      {JSON.stringify(chk.rawResponseSummary, null, 2)}
                                    </pre>
                                  </details>
                                )}
                              </div>

                              <div className="shrink-0">{getStatusBadge(chk.status)}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Modal Dialog for Decision */}
        {reviewingRequest && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-elevated border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">
                  Record Moderation Decision: {decisionAction}
                </h3>
                <button
                  onClick={() => setReviewingRequest(null)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-600">
                You are updating the verification status of{' '}
                <strong className="text-slate-900">
                  {reviewingRequest.company?.brandName}
                </strong>{' '}
                to <strong className="text-brand-600">{decisionAction}</strong>. This decision is permanently recorded in the audit log.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Required Administrator Notes *
                </label>
                <textarea
                  rows={4}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  required
                  placeholder="Explain why this decision is made (e.g. valid statutory GSTIN matching official domain, or failure to supply certificate)..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReviewingRequest(null)}
                  disabled={isSubmittingReview}
                >
                  Cancel
                </Button>
                <Button
                  variant={decisionAction === 'VERIFIED' ? 'primary' : 'danger'}
                  size="sm"
                  onClick={handleSubmitDecision}
                  isLoading={isSubmittingReview}
                >
                  Confirm & Save Decision
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
