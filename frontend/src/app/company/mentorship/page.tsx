'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/shared/Sidebar';
import { Button } from '@/components/ui/Button';
import {
  Video,
  Plus,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { clsx } from 'clsx';

export default function CompanyMentorshipPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New session modal
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('Engineering & Career AMA');
  const [description, setDescription] = useState('');
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/nex-aura-session');
  const [targetSkills, setTargetSkills] = useState('React, Node.js');
  const [slotDate, setSlotDate] = useState('');
  const [slotTime, setSlotTime] = useState('15:00');
  const [capacity, setCapacity] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  const loadSessions = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.get('/mentorship/company/my-sessions');
      setSessions(res.data.data || []);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to load mentorship sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotDate) {
      setErrorMsg('Please select a date for the session slot.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const startDateTime = new Date(`${slotDate}T${slotTime}:00`);
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // 1 hour duration

    try {
      await api.post('/mentorship/sessions', {
        title: title.trim(),
        topic: topic.trim(),
        description: description.trim(),
        meetingLink: meetingLink.trim(),
        targetSkills: targetSkills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        slots: [
          {
            startTime: startDateTime.toISOString(),
            endTime: endDateTime.toISOString(),
            capacity: Number(capacity),
          },
        ],
      });

      setSuccessMsg('Mentorship session published successfully! Students can now reserve slots.');
      setIsCreating(false);
      setTitle('');
      setDescription('');
      await loadSessions();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to publish mentorship session');
    } finally {
      setIsSubmitting(false);
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
              <Video className="w-6 h-6 text-purple-600" />
              Company Mentorship & AMA Sessions
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Host small-group workshops, technical code reviews, and career guidance sessions for aspiring interns.
            </p>
          </div>

          <Button onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Host New Session
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

        {/* Sessions List */}
        {loading ? (
          <div className="py-20 text-center text-sm text-slate-500">
            Loading hosted sessions...
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-subtle">
            <Video className="w-12 h-12 text-slate-300 mx-auto" />
            <div>
              <h3 className="text-base font-bold text-slate-900">No Mentorship Sessions Scheduled</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Hosting mentorship sessions elevates your employer brand and connects you with motivated student talent.
              </p>
            </div>
            <div className="pt-2">
              <Button onClick={() => setIsCreating(true)}>
                Schedule First Session
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => {
              const isExpanded = expandedSessionId === session.id;
              const allEnrolments = session.slots.flatMap((s: any) => s.enrolments || []);

              return (
                <div
                  key={session.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-subtle overflow-hidden transition-standard"
                >
                  <div className="p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded border border-purple-200">
                          {session.topic}
                        </span>
                        <span className="text-xs text-slate-400">
                          {allEnrolments.length} Candidate(s) Enrolled
                        </span>
                      </div>

                      <h2 className="text-lg font-bold text-slate-900">{session.title}</h2>
                      <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                        {session.description}
                      </p>

                      <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                        {session.meetingLink && (
                          <a
                            href={session.meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-1"
                          >
                            Meeting Link <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        <span>·</span>
                        <span>{session.slots?.length || 0} Time Slot(s)</span>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setExpandedSessionId(isExpanded ? null : session.id)
                      }
                      className="text-xs self-start"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-4 h-4 mr-1" />
                          Hide Attendees
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4 mr-1" />
                          View Enrolled Attendees ({allEnrolments.length})
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Enrolled Attendees Drawer */}
                  {isExpanded && (
                    <div className="bg-slate-50 border-t border-slate-200 p-6 space-y-4">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Enrolled Student Attendees
                      </h4>

                      {allEnrolments.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">
                          No students have registered for this session yet.
                        </p>
                      ) : (
                        <div className="divide-y divide-slate-200 bg-white rounded-xl border border-slate-200 overflow-hidden">
                          {allEnrolments.map((enrol: any) => (
                            <div
                              key={enrol.id}
                              className="p-3.5 flex items-center justify-between text-xs"
                            >
                              <div>
                                <span className="font-bold text-slate-900 block">
                                  {enrol.studentProfile?.user?.email}
                                </span>
                                <span className="text-[11px] text-slate-500 block">
                                  {enrol.studentProfile?.degree || 'Student'} · Enrolled on{' '}
                                  {new Date(enrol.createdAt).toLocaleDateString()}
                                </span>
                              </div>

                              <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                                {enrol.status}
                              </span>
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

        {/* Create Session Modal */}
        {isCreating && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-elevated border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">
                  Host New Mentorship Session
                </h3>
                <button
                  onClick={() => setIsCreating(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateSession} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Session Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Full Stack Engineering AMA & Portfolio Review"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Topic / Domain *
                    </label>
                    <select
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    >
                      <option value="Engineering & Career AMA">Engineering & Career AMA</option>
                      <option value="Code Review & Architecture">Code Review & Architecture</option>
                      <option value="Resume & Portfolio Feedback">Resume & Portfolio Feedback</option>
                      <option value="Interview Preparation">Interview Preparation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Target Skills (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={targetSkills}
                      onChange={(e) => setTargetSkills(e.target.value)}
                      placeholder="React, Node.js, SQL"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Description & Agenda *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Briefly describe what attendees will learn and how the session will be conducted..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Slot Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={slotDate}
                      onChange={(e) => setSlotDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      required
                      value={slotTime}
                      onChange={(e) => setSlotTime(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Max Capacity *
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      required
                      value={capacity}
                      onChange={(e) => setCapacity(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Video Meeting Link (Google Meet / Zoom) *
                  </label>
                  <input
                    type="url"
                    required
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    placeholder="https://meet.google.com/xyz-abcd-efg"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCreating(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" isLoading={isSubmitting}>
                    Publish Session
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
