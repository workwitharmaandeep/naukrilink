'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/Button';
import { VerificationBadge } from '@/components/ui/VerificationBadge';
import {
  Video,
  Clock,
  Calendar,
  Users,
  Building2,
  ExternalLink,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function PublicMentorshipPage() {
  const { user, role } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/mentorship');
        setSessions(res.data.data || []);
      } catch (err) {
        console.error('Failed to load sessions:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1 space-y-8">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-elevated">
        <div className="max-w-2xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur border border-white/20 text-purple-200">
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            <span>Company-Led Mentorship & Career Guidance</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Bridge the Gap Between Campus & Industry.
          </h1>

          <p className="text-sm sm:text-base text-purple-200 leading-relaxed">
            Attend live interactive AMAs, technical deep-dives, and resume review sessions hosted directly by verified engineering leads and recruiters.
          </p>

          <div className="pt-2">
            {role === 'STUDENT' ? (
              <Button
                href="/student/mentorship"
                size="lg"
                className="bg-white text-purple-900 hover:bg-purple-50"
              >
                Go to Student Mentorship Hub <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : !user ? (
              <Button
                href="/register"
                size="lg"
                className="bg-white text-purple-900 hover:bg-purple-50"
              >
                Sign Up to Book Free Slots <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                href="/company/dashboard"
                size="lg"
                className="bg-white text-purple-900 hover:bg-purple-50"
              >
                Host a Mentorship Session
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Available Sessions Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Upcoming Live Mentorship Sessions</h2>
          <p className="text-xs text-slate-500 mt-1">
            Free admission for enrolled students. Reserve your slot before capacity fills.
          </p>
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-slate-500">
            Loading upcoming sessions...
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 shadow-subtle">
            No upcoming public mentorship sessions scheduled right now. Check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle hover:shadow-card transition-standard flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded border border-purple-200">
                      {session.topic}
                    </span>
                    <VerificationBadge
                      status={session.company?.verificationStatus || 'UNVERIFIED'}
                    />
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">{session.title}</h3>
                    <span className="text-xs text-slate-600 block mt-0.5">
                      Hosted by <strong className="text-slate-800">{session.company?.brandName}</strong>
                    </span>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      {session.description}
                    </p>
                  </div>

                  {session.targetSkills?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {session.targetSkills.map((sk: string) => (
                        <span
                          key={sk}
                          className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {session.slots?.length || 0} slot(s) open
                  </span>

                  <Button
                    href={role === 'STUDENT' ? '/student/mentorship' : '/login'}
                    size="sm"
                  >
                    {role === 'STUDENT' ? 'Book a Slot' : 'Log in to Book'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
