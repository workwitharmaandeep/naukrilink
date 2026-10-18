'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/shared/Sidebar';
import { Button } from '@/components/ui/Button';
import { VerificationBadge } from '@/components/ui/VerificationBadge';
import {
  ShieldCheck,
  ShieldAlert,
  Shield,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Globe,
  Lock,
  Mail,
  FileCheck,
  Building,
  RefreshCw,
  Info,
  ExternalLink,
} from 'lucide-react';

export default function CompanyVerificationPage() {
  const [profile, setProfile] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states for submitting new or updated credentials
  const [gstin, setGstin] = useState('');
  const [cin, setCin] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');

  const loadData = async () => {
    try {
      const [profileRes, historyRes] = await Promise.all([
        api.get('/companies/profile'),
        api.get('/verification/my-history').catch(() => ({ data: { data: [] } })),
      ]);

      const prof = profileRes.data.data;
      setProfile(prof);
      setGstin(prof.gstin || '');
      setCin(prof.cin || '');
      setWebsiteUrl(prof.websiteUrl || '');

      setHistory(historyRes.data.data || []);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to load verification status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await api.post('/verification/submit', {
        gstin: gstin.trim() || undefined,
        cin: cin.trim() || undefined,
        websiteUrl: websiteUrl.trim(),
      });
      setSuccessMsg('Automated verification pipeline executed! Review results below.');
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Verification submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const latestRequest = history[0];
  const checks = latestRequest?.checks || [];

  const getCheckIcon = (status: string) => {
    switch (status) {
      case 'PASSED':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
      case 'WARNING':
      case 'MANUAL_REVIEW':
        return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
      case 'FAILED':
        return <XCircle className="w-5 h-5 text-rose-500 shrink-0" />;
      default:
        return <Clock className="w-5 h-5 text-slate-400 shrink-0" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PASSED':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            PASSED
          </span>
        );
      case 'WARNING':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            WARNING
          </span>
        );
      case 'MANUAL_REVIEW':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            MANUAL REVIEW
          </span>
        );
      case 'FAILED':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            FAILED
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-50 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex bg-slate-50">
        <Sidebar />
        <main className="flex-1 p-8 text-center text-sm text-slate-500">
          Loading verification audit history...
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-8 max-w-5xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-brand-600" />
              Company Verification & Trust Pipeline
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Statutory GSTIN/CIN checks, corporate domain verification, and platform trust score.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <VerificationBadge
              status={profile?.verificationStatus || 'UNVERIFIED'}
              checks={checks}
            />
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

        {/* Verification Overview Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Legal Entity Name
            </span>
            <span className="text-base font-bold text-slate-900 block mt-1">
              {profile?.legalName || 'Not Set'}
            </span>
            <span className="text-xs text-slate-500 block mt-0.5">
              Brand: {profile?.brandName}
            </span>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Statutory Identifiers
            </span>
            <span className="text-sm font-medium text-slate-800 block mt-1">
              GSTIN: <span className="font-mono">{profile?.gstin || 'Not provided'}</span>
            </span>
            <span className="text-sm font-medium text-slate-800 block mt-0.5">
              CIN: <span className="font-mono">{profile?.cin || 'Not provided'}</span>
            </span>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Official Website & Domain
            </span>
            <a
              href={profile?.websiteUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1 mt-1 truncate"
            >
              {profile?.websiteUrl || 'Not provided'}
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <span className="text-xs text-slate-400 block mt-0.5">
              Email domain checked against official host
            </span>
          </div>
        </div>

        {/* Admin Notes banner if present */}
        {profile?.verificationNotes && (
          <div className="p-4 bg-slate-100 border border-slate-200 rounded-xl text-xs space-y-1">
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-slate-500" />
              Administrator Notes / Feedback:
            </span>
            <p className="text-slate-600">{profile.verificationNotes}</p>
          </div>
        )}

        {/* Audit Pipeline Checks */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Automated Verification Audit Checks
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Each statutory and digital parameter is independently verified before public trust badges are granted.
              </p>
            </div>
            {latestRequest && (
              <span className="text-xs text-slate-400">
                Last checked: {new Date(latestRequest.createdAt).toLocaleString()}
              </span>
            )}
          </div>

          {checks.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500 space-y-2">
              <Shield className="w-8 h-8 text-slate-300 mx-auto" />
              <p>No verification checks executed yet for this profile.</p>
              <p className="text-xs text-slate-400">
                Submit your GSTIN, CIN, and website URL below to run automated verification.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {checks.map((chk: any) => (
                <div
                  key={chk.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200/70 gap-3"
                >
                  <div className="flex items-start gap-3">
                    {getCheckIcon(chk.status)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">
                          {chk.checkType.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          [{chk.providerName}]
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {chk.details}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
                    {getStatusBadge(chk.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submission / Re-run Verification Form */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Trigger Automated Verification or Update Credentials
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Submit genuine statutory identifiers. Algorithmic Mod-36 GST checksum, live DNS resolution, and SSL certificates are executed immediately.
            </p>
          </div>

          <form onSubmit={handleSubmitVerification} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  GSTIN (15 characters) *
                </label>
                <input
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  placeholder="27AABCU9603R1ZM"
                  maxLength={15}
                  required
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-xs font-mono uppercase text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  State code (2) + PAN (10) + entity (1) + Z + checksum
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Corporate CIN (21 characters)
                </label>
                <input
                  type="text"
                  value={cin}
                  onChange={(e) => setCin(e.target.value.toUpperCase())}
                  placeholder="U72200MH2020PTC123456"
                  maxLength={21}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-xs font-mono uppercase text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Required for Private / Public Limited entities
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Website URL *
                </label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://company.com"
                  required
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Must resolve via DNS with valid SSL certificate
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" isLoading={submitting}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Run Verification Pipeline
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
