'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/shared/Sidebar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { VerificationBadge } from '@/components/ui/VerificationBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Building2,
  PlusCircle,
  Briefcase,
  Users,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Video,
  ChevronRight,
  ExternalLink,
  Kanban,
  CheckCircle,
} from 'lucide-react';

export default function CompanyDashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [internships, setInternships] = useState<any[]>([]);
  const [mentorshipSessions, setMentorshipSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCompanyData() {
      try {
        const [profRes, internRes, mentorRes] = await Promise.all([
          api.get('/companies/profile').catch(() => ({ data: { data: null } })),
          api.get('/internships/company/my-listings').catch(() => ({ data: { data: [] } })),
          api.get('/mentorship/sessions').catch(() => ({ data: { data: [] } })),
        ]);

        setProfile(profRes.data.data);
        setInternships(internRes.data.data || []);
        setMentorshipSessions(mentorRes.data.data || []);
      } catch (err) {
        console.error('Failed to load company dashboard data', err);
      } finally {
        setLoading(false);
      }
    }

    loadCompanyData();
  }, []);

  const totalApplicants = internships.reduce((sum, item) => sum + (item._count?.applications || 0), 0);
  const isVerified = profile?.verificationStatus === 'VERIFIED';

  return (
    <div className="flex-1 flex bg-slate-50 min-h-screen">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200 gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Employer Talent Hub
              </h1>
              <VerificationBadge status={profile?.verificationStatus || 'UNVERIFIED'} />
            </div>
            <p className="text-sm text-slate-500 mt-1">
              {profile?.brandName || 'Company'} — Source verified candidate interns, conduct evaluations, and host mentorship.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              href="/company/mentorship"
              size="sm"
              variant="outline"
              className="border-purple-200 text-purple-700 hover:bg-purple-50"
            >
              <Video className="w-4 h-4 mr-1.5 text-purple-600" />
              Host Mentorship
            </Button>
            <Button href="/company/internships/new" size="sm">
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Post New Internship
            </Button>
          </div>
        </div>

        {/* Verification Status Warning / Banner */}
        {!isVerified && (
          <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <h3 className="text-sm font-semibold">
                  Verification Status: {profile?.verificationStatus || 'UNVERIFIED'}
                </h3>
                <p className="text-xs text-amber-700 mt-0.5">
                  Unverified employers can draft postings, but listings remain hidden until GSTIN, MCA CIN, or corporate domain identity verification passes.
                </p>
              </div>
            </div>
            <div className="shrink-0">
              <Button
                href="/company/verification"
                size="sm"
                variant="outline"
                className="border-amber-300 text-amber-900 bg-white hover:bg-amber-100"
              >
                Submit Verification Records <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {/* 4-Stat Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Active Openings
              </span>
              <Briefcase className="w-4 h-4 text-brand-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{internships.length}</div>
            <div className="text-xs text-slate-500">
              {internships.filter((i) => i.status === 'PUBLISHED').length} Published to Candidates
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Candidate Applicants
              </span>
              <Users className="w-4 h-4 text-brand-600" />
            </div>
            <div className="text-2xl font-bold text-brand-600">{totalApplicants}</div>
            <div className="text-xs text-slate-500">Across all internship openings</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Mentorship Sessions
              </span>
              <Video className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{mentorshipSessions.length}</div>
            <div className="text-xs text-slate-500">Company-led talent guidance</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Trust Pipeline
              </span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="pt-1">
              <VerificationBadge status={profile?.verificationStatus || 'UNVERIFIED'} />
            </div>
            <a href="/company/verification" className="text-xs text-brand-600 hover:underline block pt-1">
              View Audit Checks
            </a>
          </div>
        </div>

        {/* Posted Internships & Applicant Review Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle p-6">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-brand-600" />
                Internship Listings & Applicant Review
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Review applicants via Kanban Board or Table with verified skill badges.
              </p>
            </div>
            <Button href="/company/internships/new" size="sm" variant="secondary">
              <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
              Post Role
            </Button>
          </div>

          {internships.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {internships.map((item) => {
                const applicantCount = item._count?.applications || 0;
                return (
                  <div
                    key={item.id}
                    className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                        <Badge
                          variant={
                            item.status === 'PUBLISHED'
                              ? 'success'
                              : item.status === 'DRAFT'
                              ? 'warning'
                              : 'default'
                          }
                        >
                          {item.status}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1.5">
                        <span>{item.category}</span>
                        <span>•</span>
                        <span>{item.workMode}</span>
                        <span>•</span>
                        <span>Deadline: {new Date(item.deadline).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                          {applicantCount} Candidate {applicantCount === 1 ? 'Applicant' : 'Applicants'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <Button
                        href={`/company/internships/${item.id}/applicants`}
                        size="sm"
                        className="bg-brand-600 hover:bg-brand-700 text-white"
                      >
                        <Kanban className="w-3.5 h-3.5 mr-1.5" />
                        Review Candidates ({applicantCount})
                      </Button>
                      <Button
                        href={`/internships/${item.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="sm"
                        variant="outline"
                        className="border-slate-200 text-slate-600"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={Briefcase}
              title="No Internships Created Yet"
              description="Create your first internship listing to start attracting verified candidate applicants."
              actionText="Post Your First Internship"
              actionHref="/company/internships/new"
            />
          )}
        </div>

        {/* Company Mentorship Snapshot */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle p-6">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Video className="w-4 h-4 text-purple-600" />
                Company Mentorship Sessions
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Host group or 1-on-1 career guidance sessions for pre-screened students.
              </p>
            </div>
            <Button href="/company/mentorship" size="sm" variant="secondary">
              Manage Mentorship Sessions
            </Button>
          </div>

          {mentorshipSessions.length > 0 ? (
            <div className="space-y-3">
              {mentorshipSessions.slice(0, 3).map((session) => (
                <div
                  key={session.id}
                  className="p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded uppercase tracking-wider">
                      {session.topic}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">{session.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{session.description}</p>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <span className="text-xs text-slate-600 font-medium bg-slate-100 px-2.5 py-1 rounded">
                      {session.slots?.length || 0} Slots Scheduled
                    </span>
                    <Button href="/company/mentorship" size="sm" variant="outline">
                      View Attendees
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Video}
              title="No Mentorship Sessions Scheduled"
              description="Offer mentorship to build brand awareness, identify top talent early, and fulfill corporate social guidance."
              actionText="Host a Mentorship Session"
              actionHref="/company/mentorship"
            />
          )}
        </div>
      </main>
    </div>
  );
}
