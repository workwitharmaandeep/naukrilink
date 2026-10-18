'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/shared/Sidebar';
import { Button } from '@/components/ui/Button';
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  RefreshCw,
  FileWarning,
  Building,
  Briefcase,
  User,
} from 'lucide-react';

export default function AdminReportsQueuePage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');

  // Action modal state
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [actionType, setActionType] = useState<'RESOLVED' | 'DISMISSED'>('RESOLVED');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [shouldSuspend, setShouldSuspend] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const url = statusFilter
        ? `/reports/admin?status=${statusFilter}`
        : '/reports/admin';
      const res = await api.get(url);
      setReports(res.data.data || []);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to fetch reports queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const handleOpenAction = (report: any, action: 'RESOLVED' | 'DISMISSED') => {
    setSelectedReport(report);
    setActionType(action);
    setResolutionNotes(
      action === 'RESOLVED'
        ? 'Report investigated and verified. Listing paused / company sanctioned.'
        : 'Report investigated and found to not violate platform terms.'
    );
    setShouldSuspend(action === 'RESOLVED');
  };

  const handleSubmitResolution = async () => {
    if (!selectedReport) return;
    if (!resolutionNotes.trim()) {
      setErrorMsg('Resolution notes are required for moderation auditing.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await api.patch(`/reports/admin/${selectedReport.id}`, {
        status: actionType,
        resolutionNotes: resolutionNotes.trim(),
        shouldSuspend: actionType === 'RESOLVED' ? shouldSuspend : false,
      });

      setSuccessMsg(`Report #${selectedReport.id.slice(0, 8)} marked as ${actionType}.`);
      setSelectedReport(null);
      await fetchReports();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to resolve report');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Pending Action
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Resolved
          </span>
        );
      case 'DISMISSED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" />
            Dismissed
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
              <AlertTriangle className="w-6 h-6 text-rose-600" />
              Trust & Safety Reports Moderation
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Review flagged internship listings and reported employers. Enforce platform integrity.
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
                <option value="">All Reports</option>
                <option value="PENDING">Pending Review</option>
                <option value="RESOLVED">Resolved</option>
                <option value="DISMISSED">Dismissed</option>
              </select>
            </div>

            <Button variant="ghost" size="sm" onClick={fetchReports}>
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

        {/* Reports Content */}
        {loading ? (
          <div className="py-16 text-center text-sm text-slate-500">
            Loading safety reports...
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-subtle">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">Zero Open Reports</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              No reports currently matching filter &apos;{statusFilter || 'All'}&apos;. The platform is safe and clean.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-subtle p-6 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {report.targetType === 'INTERNSHIP' ? (
                        <Briefcase className="w-4 h-4 text-brand-600" />
                      ) : (
                        <Building className="w-4 h-4 text-purple-600" />
                      )}
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Target: {report.targetType} #{report.targetId.slice(0, 10)}
                      </span>
                    </div>

                    <h2 className="text-base font-bold text-slate-900">
                      Reason: {report.reason.replace(/_/g, ' ')}
                    </h2>

                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        Reported by: {report.reportedBy?.email}
                      </span>
                      <span>
                        Date: {new Date(report.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div>{getStatusBadge(report.status)}</div>
                </div>

                {/* Details text */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed">
                  <span className="font-semibold block text-slate-900 mb-1">
                    Student Details & Allegation:
                  </span>
                  {report.details || 'No additional details provided.'}
                </div>

                {/* Resolution info if resolved */}
                {report.resolutionNotes && (
                  <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/70 rounded-xl text-xs text-emerald-900">
                    <span className="font-semibold block text-emerald-950 mb-0.5">
                      Moderation Resolution Notes:
                    </span>
                    {report.resolutionNotes}
                  </div>
                )}

                {/* Action Buttons for Pending */}
                {report.status === 'PENDING' && (
                  <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenAction(report, 'DISMISSED')}
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" />
                      Dismiss Report
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleOpenAction(report, 'RESOLVED')}
                    >
                      <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                      Resolve & Suspend / Pause
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Modal Dialog for Resolving/Dismissing Report */}
        {selectedReport && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-elevated border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">
                  {actionType === 'RESOLVED' ? 'Resolve & Take Action' : 'Dismiss Report'}
                </h3>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-600">
                Moderating report against{' '}
                <strong className="text-slate-900">{selectedReport.targetType}</strong> (Reason: {selectedReport.reason}).
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Moderator Resolution Notes *
                </label>
                <textarea
                  rows={4}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  required
                  placeholder="Record justification and findings for this report..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              {actionType === 'RESOLVED' && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-rose-900">
                    <input
                      type="checkbox"
                      checked={shouldSuspend}
                      onChange={(e) => setShouldSuspend(e.target.checked)}
                      className="rounded border-rose-300 text-rose-600 focus:ring-rose-500 w-4 h-4"
                    />
                    <span>
                      Take Disciplinary Action: Pause listing or suspend employer profile immediately.
                    </span>
                  </label>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedReport(null)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  variant={actionType === 'RESOLVED' ? 'danger' : 'secondary'}
                  size="sm"
                  onClick={handleSubmitResolution}
                  isLoading={isSubmitting}
                >
                  Confirm & Finalize
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
