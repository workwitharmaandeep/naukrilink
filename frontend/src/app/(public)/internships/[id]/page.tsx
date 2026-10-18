'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/Button';
import { VerificationBadge } from '@/components/ui/VerificationBadge';
import { Badge } from '@/components/ui/Badge';
import {
  MapPin,
  Clock,
  IndianRupee,
  Calendar,
  Building2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Users,
  Briefcase,
} from 'lucide-react';

export default function InternshipDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, role } = useAuth();

  const [internship, setInternship] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Application Modal state
  const [isApplying, setIsApplying] = useState(false);
  const [coverNote, setCoverNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  // Smart Match state
  const [matchResult, setMatchResult] = useState<any | null>(null);

  useEffect(() => {
    async function fetchDetail() {
      try {
        const res = await api.get(`/internships/${id}`);
        setInternship(res.data.data);

        // If user is a logged-in student, fetch personalized match calculation
        if (role === 'STUDENT') {
          api
            .get(`/matching/internship/${id}`)
            .then((mRes) => setMatchResult(mRes.data.data))
            .catch(() => {});
        }
      } catch (err: any) {
        setError(err.response?.data?.error?.message || 'Internship not found');
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchDetail();
  }, [id, role]);

  const handleApply = async () => {
    setIsSubmitting(true);
    setApplyError(null);
    try {
      await api.post('/applications/apply', {
        internshipId: id,
        coverNote: coverNote.trim() || undefined,
      });
      setApplySuccess(true);
      setTimeout(() => {
        setIsApplying(false);
        router.push('/student/applications');
      }, 1500);
    } catch (err: any) {
      setApplyError(err.response?.data?.error?.message || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Student Reporting Modal state
  const [isReporting, setIsReporting] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [isReportingSubmitting, setIsReportingSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason) {
      setReportError('Please select a violation category.');
      return;
    }
    if (!reportDetails.trim()) {
      setReportError('Please provide details explaining the report.');
      return;
    }

    setIsReportingSubmitting(true);
    setReportError(null);
    try {
      await api.post('/reports', {
        targetType: 'INTERNSHIP',
        targetId: id,
        reason: reportReason,
        details: reportDetails.trim(),
      });
      setReportSuccess(true);
      setReportReason('');
      setReportDetails('');
    } catch (err: any) {
      setReportError(err.response?.data?.error?.message || 'Failed to submit report. Please log in.');
    } finally {
      setIsReportingSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-sm text-slate-500">
        Loading internship details...
      </div>
    );
  }

  if (error || !internship) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900">Internship Not Found</h2>
        <p className="mt-2 text-sm text-slate-500">{error || 'This listing may have been closed.'}</p>
        <div className="mt-6">
          <Button href="/internships">Back to Listings</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-100 px-2.5 py-0.5 rounded">
              {internship.category}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
              {internship.title}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-base font-semibold text-slate-700">
                {internship.company?.brandName}
              </span>
              <VerificationBadge
                status={internship.company?.verificationStatus || 'UNVERIFIED'}
                checks={internship.company?.verificationRequests?.[0]?.checks || []}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {matchResult && (
              <div className="px-3.5 py-1.5 rounded-xl border bg-emerald-50 border-emerald-300 text-emerald-900 text-center shrink-0">
                <span className="text-xl font-black block leading-none">
                  {matchResult.matchPercentage}%
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider block mt-0.5 text-emerald-700">
                  Smart Match
                </span>
              </div>
            )}

            <div>
              {role === 'STUDENT' ? (
                <Button size="lg" onClick={() => setIsApplying(true)}>
                  Apply Now
                </Button>
              ) : !user ? (
                <Button href="/login" size="lg">Log in to Apply</Button>
              ) : (
                <span className="text-xs text-slate-500 italic">
                  (Logged in as {role} — students can apply)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Personalized Match Breakdown if available */}
        {matchResult && (
          <div className="mt-4 p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-950">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Smart Match Alignment ({matchResult.matchPercentage}% Fit)</span>
            </div>
            <p className="text-emerald-900 leading-relaxed">
              {matchResult.explanationText}
            </p>
          </div>
        )}

        {/* Quick Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-sm">
          <div>
            <span className="block text-xs font-medium text-slate-400">Work Mode</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
              <MapPin className="w-4 h-4 text-slate-400" />
              {internship.workMode === 'REMOTE'
                ? 'Remote'
                : `${internship.locationCity || 'Onsite'}, ${internship.locationState || ''}`}
            </span>
          </div>

          <div>
            <span className="block text-xs font-medium text-slate-400">Monthly Stipend</span>
            <span className="font-semibold text-emerald-700 flex items-center gap-1 mt-0.5">
              <IndianRupee className="w-4 h-4 text-emerald-600" />
              {internship.isUnpaid
                ? 'Unpaid'
                : internship.stipendAmount
                ? `₹${internship.stipendAmount.toLocaleString()}/mo`
                : 'Disclosed'}
            </span>
          </div>

          <div>
            <span className="block text-xs font-medium text-slate-400">Duration</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
              <Clock className="w-4 h-4 text-slate-400" />
              {internship.durationMonths} Months
            </span>
          </div>

          <div>
            <span className="block text-xs font-medium text-slate-400">Deadline</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              {new Date(internship.deadline).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Description & Responsibilities */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-subtle space-y-3">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Role Description
            </h2>
            <div className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">
              {internship.description}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-subtle space-y-3">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Key Responsibilities
            </h2>
            <div className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">
              {internship.responsibilities}
            </div>
          </div>
        </div>

        {/* Sidebar: Skills & Eligibility */}
        <div className="space-y-6">
          {/* Required Skills */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-subtle">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Required Technical Skills</h3>
            <div className="flex flex-wrap gap-2">
              {internship.requiredSkills?.map((req: any) => (
                <span
                  key={req.id}
                  className="px-2.5 py-1 bg-brand-50 border border-brand-200 text-brand-800 rounded-md text-xs font-medium"
                >
                  {req.skill?.name}{' '}
                  <span className="text-[10px] text-brand-500 font-normal">
                    ({req.minLevel})
                  </span>
                </span>
              ))}
            </div>
          </div>

          {/* Eligibility Criteria */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-subtle text-xs space-y-2.5">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Eligibility Requirements</h3>
            {internship.eligibilityDegrees?.length > 0 && (
              <div>
                <span className="text-slate-400 block font-medium">Degrees:</span>
                <span className="text-slate-800 font-semibold">
                  {internship.eligibilityDegrees.join(', ')}
                </span>
              </div>
            )}
            {internship.eligibilityBranches?.length > 0 && (
              <div>
                <span className="text-slate-400 block font-medium">Branches:</span>
                <span className="text-slate-800 font-semibold">
                  {internship.eligibilityBranches.join(', ')}
                </span>
              </div>
            )}
            {internship.minCgpa && (
              <div>
                <span className="text-slate-400 block font-medium">Minimum CGPA:</span>
                <span className="text-slate-800 font-semibold">{internship.minCgpa} / 10</span>
              </div>
            )}
            <div>
              <span className="text-slate-400 block font-medium">Openings:</span>
              <span className="text-slate-800 font-semibold">{internship.openingsCount}</span>
            </div>
          </div>

          {/* About Company & Safety Reporting */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-subtle text-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">About the Employer</h3>
              <p className="text-slate-600 leading-relaxed">
                {internship.company?.description || 'Registered company on NEXAURA.'}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsReporting(true)}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg transition-standard"
              >
                <AlertCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-500" />
                <span>Report this listing for review</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Application Modal */}
      {isApplying && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-elevated border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">
              Apply to {internship.title}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Your verified student profile, declared skills, and resume will be submitted to{' '}
              {internship.company?.brandName}.
            </p>

            {applySuccess ? (
              <div className="my-6 p-4 bg-emerald-50 text-emerald-800 rounded-lg text-sm flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Application submitted successfully! Redirecting...</span>
              </div>
            ) : (
              <>
                {applyError && (
                  <div className="mt-3 p-3 bg-red-50 text-red-700 rounded-lg text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{applyError}</span>
                  </div>
                )}

                <div className="mt-4">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Optional Cover Note
                  </label>
                  <textarea
                    rows={4}
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value)}
                    placeholder="Briefly explain your interest in this role and any relevant project work..."
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsApplying(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleApply} isLoading={isSubmitting}>
                    Confirm & Submit Application
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Trust & Safety Student Reporting Modal */}
      {isReporting && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-elevated border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertCircle className="w-5 h-5" />
                <h2 className="text-base font-bold text-slate-900">
                  Report Listing to Trust & Safety
                </h2>
              </div>
              <button
                onClick={() => {
                  setIsReporting(false);
                  setReportSuccess(false);
                  setReportError(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                ✕
              </button>
            </div>

            {reportSuccess ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Report Submitted</h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Thank you for keeping NEXAURA safe. Your report has been dispatched directly to the admin moderation queue. We will investigate this listing immediately.
                </p>
                <div className="pt-3">
                  <Button
                    size="sm"
                    onClick={() => {
                      setIsReporting(false);
                      setReportSuccess(false);
                    }}
                  >
                    Done
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="mt-4 space-y-4">
                <p className="text-xs text-slate-500">
                  Reporting: <span className="font-semibold text-slate-800">{internship.title}</span> at <span className="font-semibold text-slate-800">{internship.company?.brandName}</span>
                </p>

                {reportError && (
                  <div className="p-3 bg-rose-50 text-rose-700 rounded-lg text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{reportError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Violation Category *
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    <option value="">Select a reason...</option>
                    <option value="SCAM_OR_FRAUD">Suspected Scam or Fraud (demanding money/training fees)</option>
                    <option value="UNPAID_DISGUISED">Unpaid internship disguised as paid / stipend discrepancy</option>
                    <option value="FAKE_COMPANY">Fake or impersonated organization</option>
                    <option value="INAPPROPRIATE_CONTENT">Offensive, misleading, or abusive job description</option>
                    <option value="OTHER">Other violation of NEXAURA policies</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Specific Details or Evidence *
                  </label>
                  <textarea
                    rows={4}
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    required
                    placeholder="Describe what occurred (e.g. recruiter requested payment via WhatsApp, company website is inactive, etc.)..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsReporting(false)}
                    disabled={isReportingSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="danger"
                    size="sm"
                    isLoading={isReportingSubmitting}
                  >
                    Submit Report
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
