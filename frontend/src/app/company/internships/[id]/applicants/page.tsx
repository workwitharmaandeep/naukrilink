'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/shared/Sidebar';
import { Button } from '@/components/ui/Button';
import { SkillBadge } from '@/components/ui/SkillBadge';
import {
  Users,
  LayoutGrid,
  List,
  Sparkles,
  GraduationCap,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Filter,
  ChevronRight,
  User,
  ExternalLink,
} from 'lucide-react';
import { clsx } from 'clsx';

const COLUMNS = [
  { key: 'APPLIED', label: 'New Applied', color: 'border-slate-300 bg-slate-50' },
  { key: 'SHORTLISTED', label: 'Shortlisted', color: 'border-blue-300 bg-blue-50/50' },
  { key: 'INTERVIEW', label: 'Interview Scheduled', color: 'border-purple-300 bg-purple-50/50' },
  { key: 'SELECTED', label: 'Offer Extended', color: 'border-emerald-300 bg-emerald-50/50' },
  { key: 'REJECTED', label: 'Not Selected', color: 'border-rose-300 bg-rose-50/50' },
];

export default function CompanyApplicantsPage() {
  const { id } = useParams();

  const [applicants, setApplicants] = useState<any[]>([]);
  const [internship, setInternship] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<'KANBAN' | 'TABLE'>('KANBAN');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Status transition modal
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState<string>('SHORTLISTED');
  const [notes, setNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [internshipRes, applicantsRes] = await Promise.all([
        api.get(`/internships/${id}`),
        api.get(`/applications/internship/${id}/applicants`),
      ]);
      setInternship(internshipRes.data.data);
      setApplicants(applicantsRes.data.data || []);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to load applicants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const handleOpenStatusModal = (app: any, targetStatus?: string) => {
    setSelectedApp(app);
    setNewStatus(targetStatus || app.currentStatus);
    setNotes('');
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    setIsUpdating(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await api.patch(`/applications/${selectedApp.id}/status`, {
        status: newStatus,
        notes: notes.trim() || undefined,
      });

      setSuccessMsg(`Candidate stage updated to ${newStatus}. Notification sent to candidate.`);
      setSelectedApp(null);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to update application status');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex bg-slate-50">
        <Sidebar />
        <main className="flex-1 p-8 text-center text-sm text-slate-500">
          Loading applicants and match profiles...
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">
                Applicant Review Hub
              </span>
              <span className="text-xs text-slate-500">
                {applicants.length} Total Candidates
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
              {internship?.title || 'Internship Candidates'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('KANBAN')}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-standard',
                  viewMode === 'KANBAN'
                    ? 'bg-brand-50 text-brand-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Kanban Board</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('TABLE')}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-standard',
                  viewMode === 'TABLE'
                    ? 'bg-brand-50 text-brand-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                <List className="w-3.5 h-3.5" />
                <span>Table View</span>
              </button>
            </div>
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
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* -------------------------------------------------------------
            VIEW A: KANBAN PIPELINE BOARD
        ------------------------------------------------------------- */}
        {viewMode === 'KANBAN' && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-6">
            {COLUMNS.map((col) => {
              const colApplicants = applicants.filter((a) => a.currentStatus === col.key);

              return (
                <div
                  key={col.key}
                  className="bg-slate-100/70 rounded-2xl border border-slate-200/80 p-3 flex flex-col min-w-[260px] space-y-3"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 px-1">
                    <span className="text-xs font-bold text-slate-800">
                      {col.label}
                    </span>
                    <span className="w-5 h-5 rounded-full bg-white text-slate-700 text-[11px] font-bold flex items-center justify-center shadow-xs">
                      {colApplicants.length}
                    </span>
                  </div>

                  {/* Cards List */}
                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px]">
                    {colApplicants.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-400 italic">
                        No candidates
                      </div>
                    ) : (
                      colApplicants.map((app) => {
                        const student = app.studentProfile;
                        const skills = student?.skills || [];

                        return (
                          <div
                            key={app.id}
                            className="bg-white rounded-xl border border-slate-200 p-4 shadow-subtle hover:shadow-card transition-standard space-y-3"
                          >
                            <div>
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-bold text-slate-900 truncate">
                                  {student?.user?.email?.split('@')[0] || 'Candidate'}
                                </h4>
                                {app.matchScoreSnapshot && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                                    {app.matchScoreSnapshot}%
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-500 block truncate">
                                {student?.degree || 'Degree not listed'} · {student?.branch || ''}
                              </span>
                            </div>

                            {/* Skills with Verified Badges */}
                            <div className="flex flex-wrap gap-1">
                              {skills.slice(0, 3).map((sk: any) => (
                                <SkillBadge
                                  key={sk.id}
                                  name={sk.skill?.name}
                                  verifiedScore={sk.verifiedScore}
                                  level={sk.declaredLevel}
                                  size="sm"
                                />
                              ))}
                              {skills.length > 3 && (
                                <span className="text-[10px] text-slate-400 self-center">
                                  +{skills.length - 3} more
                                </span>
                              )}
                            </div>

                            {/* Cover Note snippet if present */}
                            {app.coverNote && (
                              <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded line-clamp-2 italic">
                                &ldquo;{app.coverNote}&rdquo;
                              </p>
                            )}

                            {/* Action Button */}
                            <div className="pt-2 border-t border-slate-100 flex justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenStatusModal(app)}
                                className="text-[11px]"
                              >
                                Move Stage &rarr;
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* -------------------------------------------------------------
            VIEW B: SORTABLE TABLE VIEW
        ------------------------------------------------------------- */}
        {viewMode === 'TABLE' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle overflow-hidden">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Candidate</th>
                  <th className="p-4">Academics & CGPA</th>
                  <th className="p-4">Verified Skills</th>
                  <th className="p-4">Match Score</th>
                  <th className="p-4">Applied Date</th>
                  <th className="p-4">Stage</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applicants.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      No applications received yet.
                    </td>
                  </tr>
                ) : (
                  applicants.map((app) => {
                    const student = app.studentProfile;
                    const skills = student?.skills || [];

                    return (
                      <tr key={app.id} className="hover:bg-slate-50/70 transition-standard">
                        <td className="p-4 font-bold text-slate-900">
                          {student?.user?.email}
                        </td>
                        <td className="p-4">
                          <div>{student?.degree || 'Degree not listed'}</div>
                          <div className="text-slate-400 text-[11px]">
                            CGPA: {student?.cgpa ? `${student.cgpa}/10` : 'Not provided'}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {skills.slice(0, 2).map((sk: any) => (
                              <SkillBadge
                                key={sk.id}
                                name={sk.skill?.name}
                                verifiedScore={sk.verifiedScore}
                                level={sk.declaredLevel}
                                size="sm"
                              />
                            ))}
                          </div>
                        </td>
                        <td className="p-4">
                          {app.matchScoreSnapshot ? (
                            <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {app.matchScoreSnapshot}% Match
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="p-4 text-slate-500">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <span className="font-semibold text-slate-800 px-2 py-0.5 rounded bg-slate-100">
                            {app.currentStatus}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleOpenStatusModal(app)}
                          >
                            Update Stage
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* -------------------------------------------------------------
            STAGE TRANSITION MODAL
        ------------------------------------------------------------- */}
        {selectedApp && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-elevated border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">
                  Update Candidate Hiring Stage
                </h3>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-600">
                Updating stage for{' '}
                <strong className="text-slate-900">
                  {selectedApp.studentProfile?.user?.email}
                </strong>
                . A real-time in-app notification will be delivered to the candidate.
              </p>

              <form onSubmit={handleUpdateStatus} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select New Stage *
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    <option value="APPLIED">Applied (Initial)</option>
                    <option value="SHORTLISTED">Shortlisted (Under Technical Review)</option>
                    <option value="INTERVIEW">Interview Scheduled</option>
                    <option value="SELECTED">Selected / Offer Extended</option>
                    <option value="REJECTED">Not Selected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Reviewer Notes / Feedback (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Passed technical round with strong React scores; interview scheduled for Thursday 3 PM..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedApp(null)}
                    disabled={isUpdating}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" isLoading={isUpdating}>
                    Save & Notify Candidate
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
