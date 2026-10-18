'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/shared/Sidebar';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SkillBadge } from '@/components/ui/SkillBadge';
import { VerificationBadge } from '@/components/ui/VerificationBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  FileText,
  Briefcase,
  Award,
  Calendar,
  AlertCircle,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Compass,
  Video,
  Users,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [mentorshipBookings, setMentorshipBookings] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [
          profRes,
          appsRes,
          recomRes,
          mentorRes,
          interviewsRes,
          notifRes,
        ] = await Promise.all([
          api.get('/students/profile').catch(() => ({ data: { data: null } })),
          api.get('/applications/my-applications').catch(() => ({ data: { data: [] } })),
          api.get('/matching/recommendations').catch(() => ({ data: { data: [] } })),
          api.get('/mentorship/my-bookings').catch(() => ({ data: { data: [] } })),
          api.get('/interviews/my-interviews').catch(() => ({ data: { data: [] } })),
          api.get('/notifications?limit=5').catch(() => ({ data: { data: [] } })),
        ]);

        setProfile(profRes.data.data);
        setApplications(appsRes.data.data || []);
        setRecommendations(recomRes.data.data || []);
        setMentorshipBookings(mentorRes.data.data || []);
        setInterviews(interviewsRes.data.data || []);
        setNotifications(notifRes.data.data || []);
      } catch (err) {
        console.error('Failed to load student dashboard live data', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const completeness = profile?.profileCompleteness || 0;

  // Verified badges calculation
  const verifiedSkills = profile?.skills?.filter((s: any) => s.verifiedScore !== null) || [];
  const goldCount = verifiedSkills.filter((s: any) => s.verifiedScore >= 90).length;
  const silverCount = verifiedSkills.filter(
    (s: any) => s.verifiedScore >= 80 && s.verifiedScore < 90
  ).length;
  const bronzeCount = verifiedSkills.filter(
    (s: any) => s.verifiedScore >= 70 && s.verifiedScore < 80
  ).length;

  // Highest match
  const topMatch = recommendations.length > 0 ? recommendations[0] : null;

  // Next active mentorship session
  const activeBookings = mentorshipBookings.filter((b: any) => b.status === 'ENROLLED');
  const nextSession = activeBookings.length > 0 ? activeBookings[0] : null;

  // Latest completed interview
  const latestInterview = interviews.find((i: any) => i.status === 'COMPLETED');

  const getNextRecommendedAction = () => {
    if (!profile?.collegeName || !profile?.degree) {
      return {
        text: 'Add your educational background',
        href: '/student/profile',
      };
    }
    if (!profile?.skills || profile.skills.length === 0) {
      return {
        text: 'Declare core skills for matching',
        href: '/student/profile',
      };
    }
    if (verifiedSkills.length === 0) {
      return {
        text: 'Verify your skills with timed quizzes',
        href: '/student/assessments',
      };
    }
    if (interviews.length === 0) {
      return {
        text: 'Practice AI mock interview',
        href: '/student/interview',
      };
    }
    return {
      text: 'Explore verified recommendations',
      href: '/student/recommendations',
    };
  };

  const nextAction = getNextRecommendedAction();

  return (
    <div className="flex-1 flex bg-slate-50 min-h-screen">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Student Career Command Center
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                <Sparkles className="w-3 h-3 text-brand-600" /> Live AI Engine
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Welcome back, <span className="font-semibold text-slate-800">{profile?.fullName || user?.email}</span>
              {profile?.collegeName ? ` • ${profile.collegeName}` : ''}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              href="/student/assessments"
              size="sm"
              variant="outline"
              className="border-brand-200 text-brand-700 hover:bg-brand-50"
            >
              <Award className="w-4 h-4 mr-1.5 text-brand-600" />
              Take Skill Quiz
            </Button>
            <Button
              href="/student/interview"
              size="sm"
              variant="outline"
              className="border-purple-200 text-purple-700 hover:bg-purple-50"
            >
              <Video className="w-4 h-4 mr-1.5 text-purple-600" />
              AI Interview
            </Button>
            <Button href="/internships" size="sm">
              <Briefcase className="w-4 h-4 mr-1.5" />
              Browse Openings
            </Button>
          </div>
        </div>

        {/* 4-Stat Metric Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Applications */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Applications
              </span>
              <FileText className="w-4 h-4 text-brand-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{applications.length}</div>
            <div className="text-xs text-slate-500 flex items-center justify-between">
              <span>
                {applications.filter((a) => a.currentStatus === 'SHORTLISTED').length} Shortlisted
              </span>
              <a href="/student/applications" className="text-brand-600 hover:underline font-medium">
                View All
              </a>
            </div>
          </div>

          {/* Card 2: Verified Badges */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Verified Badges
              </span>
              <Award className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{verifiedSkills.length}</div>
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <span className="text-amber-700 font-semibold">{goldCount} Gold</span>
              <span>•</span>
              <span className="text-slate-600 font-semibold">{silverCount} Silver</span>
              <span>•</span>
              <span className="text-orange-700 font-semibold">{bronzeCount} Bronze</span>
            </div>
          </div>

          {/* Card 3: Top Match Readiness */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Top Job Match
              </span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-600">
              {topMatch ? `${Math.round(topMatch.matchPercentage)}%` : '—'}
            </div>
            <div className="text-xs text-slate-500 truncate">
              {topMatch ? topMatch.internship.title : 'Declare skills to calculate'}
            </div>
          </div>

          {/* Card 4: Mentorship */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Mentorships
              </span>
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{activeBookings.length}</div>
            <div className="text-xs text-slate-500">
              {nextSession
                ? `Next: ${new Date(nextSession.slot?.startTime).toLocaleDateString()}`
                : 'No upcoming sessions'}
            </div>
          </div>
        </div>

        {/* Profile Completeness & Action Banner */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Profile Readiness & Matching Power
              </span>
              <h2 className="text-base font-semibold text-slate-900 mt-0.5">
                Profile Completeness: {completeness}%
              </h2>
            </div>
            {completeness < 100 && (
              <Button href={nextAction.href} variant="secondary" size="sm">
                <span>{nextAction.text}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            )}
          </div>
          <ProgressBar value={completeness} />
        </div>

        {/* 2-Column Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 Cols): Applications, Top Recommendations & Mentorship */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Applications Section */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-600" />
                  Application Pipeline Tracker ({applications.length})
                </h3>
                {applications.length > 0 && (
                  <a
                    href="/student/applications"
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                  >
                    View Timeline <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {applications.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {applications.slice(0, 3).map((app) => (
                    <div key={app.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900">
                          {app.internship?.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-600">
                            {app.internship?.company?.brandName}
                          </span>
                          <VerificationBadge
                            status={app.internship?.company?.verificationStatus || 'UNVERIFIED'}
                            showDetailsPopover={false}
                          />
                          {app.matchScoreSnapshot && (
                            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {Math.round(app.matchScoreSnapshot)}% Match
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            app.currentStatus === 'OFFERED' || app.currentStatus === 'SELECTED'
                              ? 'success'
                              : app.currentStatus === 'REJECTED'
                              ? 'danger'
                              : app.currentStatus === 'SHORTLISTED' || app.currentStatus === 'INTERVIEW_SCHEDULED'
                              ? 'brand'
                              : 'warning'
                          }
                        >
                          {app.currentStatus.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={FileText}
                  title="No Applications Submitted"
                  description="You haven't submitted any internship applications yet. Review verified recommendations to apply."
                  actionText="Explore Internships"
                  actionHref="/internships"
                />
              )}
            </div>

            {/* Top Match Recommendations Section */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-600" />
                  <h3 className="font-semibold text-slate-900">Top AI Matches For You</h3>
                </div>
                {recommendations.length > 0 && (
                  <a
                    href="/student/recommendations"
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                  >
                    View All {recommendations.length} Matches <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {recommendations.length > 0 ? (
                <div className="space-y-4">
                  {recommendations.slice(0, 3).map((item) => (
                    <div
                      key={item.internship.id}
                      className="p-4 rounded-xl border border-slate-200 hover:border-brand-300 transition-standard hover:shadow-subtle"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <a
                            href={`/internships/${item.internship.id}`}
                            className="text-sm font-bold text-slate-900 hover:text-brand-600"
                          >
                            {item.internship.title}
                          </a>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                            <span className="font-medium text-slate-700">
                              {item.internship.company?.brandName}
                            </span>
                            <VerificationBadge
                              status={item.internship.company?.verificationStatus || 'UNVERIFIED'}
                              showDetailsPopover={false}
                            />
                            <span>•</span>
                            <span>{item.internship.workMode}</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {Math.round(item.matchPercentage)}% Match
                          </span>
                        </div>
                      </div>

                      {/* Matched & Missing Skills Tags */}
                      <div className="mt-3 flex flex-wrap gap-1.5 items-center text-xs">
                        {item.matchedSkills?.map((skillName: string) => (
                          <span
                            key={skillName}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[11px] font-medium border border-emerald-100"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            {skillName}
                          </span>
                        ))}
                        {item.missingSkills?.map((skillName: string) => (
                          <span
                            key={skillName}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px]"
                          >
                            Need: {skillName}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Briefcase}
                  title="No Match Recommendations Yet"
                  description="Declare your technical skills and verify your knowledge to receive algorithmically matched internships."
                  actionText="Declare Technical Skills"
                  actionHref="/student/profile"
                />
              )}
            </div>

            {/* Upcoming Mentorship Sessions */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  Your Scheduled Mentorship Sessions
                </h3>
                <a
                  href="/student/mentorship"
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                >
                  Browse Sessions <ChevronRight className="w-3.5 h-3.5" />
                </a>
              </div>

              {activeBookings.length > 0 ? (
                <div className="space-y-3">
                  {activeBookings.slice(0, 2).map((b) => (
                    <div
                      key={b.id}
                      className="p-4 rounded-xl border border-purple-100 bg-purple-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="text-xs font-semibold text-purple-700 uppercase tracking-wider">
                          {b.slot?.session?.topic}
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                          {b.slot?.session?.title}
                        </h4>
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {new Date(b.slot?.startTime).toLocaleString()} (
                            {b.slot?.session?.company?.brandName})
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {b.slot?.session?.meetingLink ? (
                          <Button
                            href={b.slot.session.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Join Session
                          </Button>
                        ) : (
                          <span className="text-xs text-slate-500 italic">Link active prior to call</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Users}
                  title="No Mentorship Sessions Booked"
                  description="Connect 1-on-1 with verified company leaders for portfolio reviews, interview prep, and career insights."
                  actionText="Discover Mentorship Sessions"
                  actionHref="/student/mentorship"
                />
              )}
            </div>
          </div>

          {/* Right Column (1 Col): Verified Skill Portfolio, AI Interview Coach, Recent Alerts */}
          <div className="space-y-6">
            {/* Verified Skill Badges Portfolio */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  Verified Skill Badges ({verifiedSkills.length})
                </h3>
                <a
                  href="/student/assessments"
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                >
                  Earn More
                </a>
              </div>

              {profile?.skills && profile.skills.length > 0 ? (
                <div className="space-y-2 mt-3">
                  {profile.skills.map((s: any) => (
                    <div key={s.id} className="flex items-center justify-between py-1">
                      <SkillBadge
                        name={s.skill?.name}
                        verifiedScore={s.verifiedScore}
                        level={s.declaredLevel}
                        size="sm"
                      />
                      {!s.verifiedScore && (
                        <a
                          href={`/student/assessments/${s.skill?.id}`}
                          className="text-[11px] font-semibold text-brand-600 hover:underline"
                        >
                          Verify
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-500 py-3 text-center">
                  Declare skills to verify and earn Gold, Silver, or Bronze badges.
                </div>
              )}
            </div>

            {/* AI Mock Interview Coach */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50/50 p-6 rounded-2xl border border-purple-200 shadow-subtle space-y-3">
              <div className="flex items-center gap-2 text-purple-900 font-bold text-sm">
                <Video className="w-4 h-4 text-purple-600" />
                AI Mock Interview Coach
              </div>

              {latestInterview ? (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Latest Session:</span>
                    <span className="font-bold text-slate-900">{latestInterview.targetRole}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Overall Score:</span>
                    <span className="font-bold text-purple-700">
                      {latestInterview.evaluation?.overallScore
                        ? `${latestInterview.evaluation.overallScore} / 10`
                        : 'Completed'}
                    </span>
                  </div>
                  <div className="pt-2">
                    <Button
                      href="/student/interview"
                      size="sm"
                      variant="outline"
                      className="w-full bg-white text-purple-700 border-purple-300"
                    >
                      Take Another AI Interview
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-xs">
                  <p className="text-purple-800 leading-relaxed">
                    Test your technical knowledge and spoken communication with our speech-enabled AI interviewer.
                  </p>
                  <div className="pt-1">
                    <Button
                      href="/student/interview"
                      size="sm"
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      Start AI Mock Interview
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Notifications & Activity */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle">
              <h3 className="font-semibold text-slate-900 text-sm mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                Recent In-App Activity
              </h3>

              {notifications.length > 0 ? (
                <div className="space-y-3">
                  {notifications.slice(0, 4).map((n) => (
                    <div key={n.id} className="text-xs space-y-1">
                      <div className="font-semibold text-slate-800">{n.title}</div>
                      <p className="text-slate-500 line-clamp-2">{n.message}</p>
                      <span className="text-[10px] text-slate-400">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
