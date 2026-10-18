'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/shared/Sidebar';
import { Button } from '@/components/ui/Button';
import { VerificationBadge } from '@/components/ui/VerificationBadge';
import {
  Video,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  Building2,
  ExternalLink,
  Sparkles,
  XCircle,
  Filter,
  Plus,
} from 'lucide-react';
import { clsx } from 'clsx';

export default function StudentMentorshipPage() {
  const [activeTab, setActiveTab] = useState<'EXPLORE' | 'MY_ENROLMENTS'>('EXPLORE');
  const [sessions, setSessions] = useState<any[]>([]);
  const [myEnrolments, setMyEnrolments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filter state
  const [selectedTopic, setSelectedTopic] = useState('');

  // Booking modal state
  const [bookingSlot, setBookingSlot] = useState<any | null>(null);
  const [bookingSession, setBookingSession] = useState<any | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [sessionsRes, enrolmentsRes] = await Promise.all([
        api.get('/mentorship'),
        api.get('/mentorship/my/enrolments').catch(() => ({ data: { data: [] } })),
      ]);
      setSessions(sessionsRes.data.data || []);
      setMyEnrolments(enrolmentsRes.data.data || []);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to load mentorship sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenBooking = (session: any, slot: any) => {
    setBookingSession(session);
    setBookingSlot(slot);
  };

  const handleConfirmBooking = async () => {
    if (!bookingSlot) return;

    setIsBooking(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await api.post(`/mentorship/slots/${bookingSlot.id}/book`);
      setSuccessMsg(`Successfully booked mentorship slot for ${bookingSession?.title}! Meeting details sent.`);
      setBookingSlot(null);
      setBookingSession(null);
      await loadData();
      setActiveTab('MY_ENROLMENTS');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to book slot');
    } finally {
      setIsBooking(false);
    }
  };

  const handleCancelBooking = async (enrolmentId: string) => {
    if (!confirm('Are you sure you want to cancel this mentorship booking?')) return;

    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await api.delete(`/mentorship/enrolments/${enrolmentId}`);
      setSuccessMsg('Mentorship booking cancelled.');
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to cancel booking');
    }
  };

  const filteredSessions = selectedTopic
    ? sessions.filter((s) => s.topic.toLowerCase().includes(selectedTopic.toLowerCase()))
    : sessions;

  return (
    <div className="flex-1 flex bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-8 max-w-6xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Video className="w-6 h-6 text-purple-600" />
              Company-Led Mentorship & AMAs
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Gain direct industry guidance from engineers, founders, and hiring managers at verified companies.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('EXPLORE')}
              className={clsx(
                'px-4 py-1.5 rounded-lg font-semibold transition-standard cursor-pointer',
                activeTab === 'EXPLORE'
                  ? 'bg-purple-50 text-purple-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              Explore Sessions ({sessions.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('MY_ENROLMENTS')}
              className={clsx(
                'px-4 py-1.5 rounded-lg font-semibold transition-standard cursor-pointer',
                activeTab === 'MY_ENROLMENTS'
                  ? 'bg-purple-50 text-purple-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              My Bookings ({myEnrolments.length})
            </button>
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
            TAB 1: EXPLORE AVAILABLE SESSIONS
        ------------------------------------------------------------- */}
        {activeTab === 'EXPLORE' && (
          <div className="space-y-6">
            {loading ? (
              <div className="py-20 text-center text-sm text-slate-500">
                Loading mentorship sessions...
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-subtle">
                <Video className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">No Mentorship Sessions Available</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Verified employers regularly post AMAs and 1-on-1 portfolio review sessions. Check back soon!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredSessions.map((session) => (
                  <div
                    key={session.id}
                    className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle hover:shadow-card transition-standard flex flex-col justify-between space-y-5"
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
                        <h2 className="text-base font-bold text-slate-900">{session.title}</h2>
                        <span className="text-xs font-semibold text-slate-700 block mt-0.5">
                          Hosted by {session.company?.brandName}
                        </span>
                        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                          {session.description}
                        </p>
                      </div>

                      {/* Target Skills */}
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

                    {/* Slots List */}
                    <div className="pt-4 border-t border-slate-100 space-y-2.5">
                      <span className="text-xs font-bold text-slate-800 block">
                        Available Time Slots:
                      </span>

                      {session.slots?.length === 0 ? (
                        <span className="text-xs text-slate-400 italic">No upcoming slots</span>
                      ) : (
                        <div className="space-y-2">
                          {session.slots.map((slot: any) => {
                            const availableSeats = slot.capacity - slot.bookedCount;
                            const isFull = availableSeats <= 0;

                            return (
                              <div
                                key={slot.id}
                                className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs"
                              >
                                <div className="space-y-0.5">
                                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                    {new Date(slot.startTime).toLocaleString([], {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                  <span className="text-[11px] text-slate-500">
                                    {isFull ? (
                                      <span className="text-rose-600 font-bold">Slot Full</span>
                                    ) : (
                                      `${availableSeats} seat(s) remaining`
                                    )}
                                  </span>
                                </div>

                                <Button
                                  size="sm"
                                  disabled={isFull}
                                  onClick={() => handleOpenBooking(session, slot)}
                                >
                                  Book Slot
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 2: MY BOOKED ENROLMENTS
        ------------------------------------------------------------- */}
        {activeTab === 'MY_ENROLMENTS' && (
          <div className="space-y-4">
            {myEnrolments.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-subtle">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">No Active Mentorship Bookings</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Browse available sessions and reserve a slot to receive 1-on-1 career guidance.
                </p>
                <div className="pt-2">
                  <Button size="sm" onClick={() => setActiveTab('EXPLORE')}>
                    Explore Sessions
                  </Button>
                </div>
              </div>
            ) : (
              myEnrolments.map((enrol) => {
                const slot = enrol.slot;
                const session = slot?.session;

                return (
                  <div
                    key={enrol.id}
                    className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded border border-purple-200">
                          {session?.topic}
                        </span>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Confirmed Booking
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 mt-1">
                        {session?.title}
                      </h3>

                      <span className="text-xs text-slate-600 block">
                        Hosted by <strong className="text-slate-800">{session?.company?.brandName}</strong>
                      </span>

                      <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                        <span className="flex items-center gap-1 font-semibold text-slate-800">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(slot?.startTime).toLocaleString()}
                        </span>
                        <span>·</span>
                        <span>Mode: Remote Video Call</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {session?.meetingLink && (
                        <a
                          href={session.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                            <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                            Join Video Call
                          </Button>
                        </a>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancelBooking(enrol.id)}
                        className="text-slate-500 hover:text-rose-600"
                      >
                        Cancel Booking
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* -------------------------------------------------------------
            BOOKING CONFIRMATION MODAL
        ------------------------------------------------------------- */}
        {bookingSlot && bookingSession && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-elevated border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">
                  Confirm Mentorship Slot Booking
                </h3>
                <button
                  onClick={() => {
                    setBookingSlot(null);
                    setBookingSession(null);
                  }}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-600">
                <p>
                  You are reserving a mentorship slot for{' '}
                  <strong className="text-slate-900">{bookingSession.title}</strong> hosted by{' '}
                  <strong className="text-slate-900">{bookingSession.company?.brandName}</strong>.
                </p>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 font-medium text-slate-800">
                  <div className="flex items-center justify-between">
                    <span>Scheduled Time:</span>
                    <span>{new Date(bookingSlot.startTime).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Format:</span>
                    <span>1-on-1 / Small Group Online AMA</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500">
                  An automated reminder and calendar invitation with the meeting link will be dispatched to your account.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setBookingSlot(null);
                    setBookingSession(null);
                  }}
                  disabled={isBooking}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleConfirmBooking}
                  isLoading={isBooking}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Confirm & Reserve Seat
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
