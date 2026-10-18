'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/shared/Sidebar';
import { Button } from '@/components/ui/Button';
import {
  ShieldCheck,
  AlertTriangle,
  Building2,
  Users,
  Briefcase,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    pendingVerifications: 0,
    verifiedCompanies: 0,
    openReports: 0,
    totalInternships: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [queueRes, reportsRes, internshipsRes] = await Promise.all([
          api.get('/verification/admin/queue').catch(() => ({ data: { data: [] } })),
          api.get('/reports/admin').catch(() => ({ data: { data: [] } })),
          api.get('/internships').catch(() => ({ data: { data: [] } })),
        ]);

        const queue = queueRes.data.data || [];
        const reports = reportsRes.data.data || [];
        const internships = internshipsRes.data.data || [];

        setStats({
          pendingVerifications: queue.filter((r: any) => r.status === 'PENDING_REVIEW').length,
          verifiedCompanies: queue.filter((r: any) => r.status === 'VERIFIED').length,
          openReports: reports.filter((r: any) => r.status === 'PENDING').length,
          totalInternships: internships.length,
        });
      } catch (err) {
        console.error('Error fetching admin dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="flex-1 flex bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-8 max-w-6xl mx-auto w-full space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Administrator Command Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Platform governance, company verification auditing, and trust & safety moderation.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Pending Verification
              </span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {loading ? '...' : stats.pendingVerifications}
            </div>
            <a
              href="/admin/verification-queue"
              className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1 pt-1"
            >
              Review Queue <ArrowRight className="w-3 h-3" />
            </a>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Verified Employers
              </span>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {loading ? '...' : stats.verifiedCompanies}
            </div>
            <span className="text-xs text-slate-400 block pt-1">
              Active trust badge recipients
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Safety Reports
              </span>
              <AlertTriangle className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {loading ? '...' : stats.openReports}
            </div>
            <a
              href="/admin/reports"
              className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 pt-1"
            >
              Moderate Reports <ArrowRight className="w-3 h-3" />
            </a>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Active Listings
              </span>
              <Briefcase className="w-4 h-4 text-brand-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {loading ? '...' : stats.totalInternships}
            </div>
            <a
              href="/internships"
              className="text-xs text-slate-500 hover:text-slate-700 font-medium flex items-center gap-1 pt-1"
            >
              Browse Listings <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Quick Action Panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Verification Moderation</h2>
                <p className="text-xs text-slate-500">
                  Inspect statutory check logs (GSTIN, MCA CIN, DNS, SSL) and approve companies.
                </p>
              </div>
            </div>
            <div className="pt-2">
              <Button href="/admin/verification-queue" className="w-full">
                Verification Queue
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Safety Reports Queue</h2>
                <p className="text-xs text-slate-500">
                  Moderate student reports regarding suspicious fees, unpaid roles, or fake companies.
                </p>
              </div>
            </div>
            <div className="pt-2">
              <Button href="/admin/reports" variant="danger" className="w-full">
                Safety Reports
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">User Directory</h2>
                <p className="text-xs text-slate-500">
                  Audit registered candidates, employer accounts, and manage account statuses.
                </p>
              </div>
            </div>
            <div className="pt-2">
              <Button
                href="/admin/users"
                variant="outline"
                className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50"
              >
                Manage Users
              </Button>
            </div>
          </div>
        </div>

        {/* Platform Integrity Standards */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            NEXAURA Platform Integrity Principles
          </h2>
          <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside leading-relaxed">
            <li>
              <strong>Zero Fake Data:</strong> Unverified companies remain marked as <span className="font-mono bg-slate-100 px-1 py-0.5 rounded">UNVERIFIED</span> or <span className="font-mono bg-slate-100 px-1 py-0.5 rounded">PENDING_REVIEW</span> until statutory lookups pass.
            </li>
            <li>
              <strong>Mandatory Justification:</strong> Every administrative decision (approval, rejection, suspension) requires reviewer notes recorded in the permanent audit trail.
            </li>
            <li>
              <strong>Rapid Sanctions:</strong> Resolving a student fraud report automatically suspends the offending employer and pauses their active listings across the platform.
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
