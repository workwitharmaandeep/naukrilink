'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { companyProfileSchema, CompanyProfileInput, INDIAN_STATES } from '@/shared';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/shared/Sidebar';
import { Button } from '@/components/ui/Button';
import { VerificationBadge } from '@/components/ui/VerificationBadge';
import { Building2, ShieldCheck, CheckCircle2, AlertCircle, FileText } from 'lucide-react';

export default function CompanyProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CompanyProfileInput>({
    resolver: zodResolver(companyProfileSchema),
  });

  const loadProfile = async () => {
    try {
      const res = await api.get('/companies/profile');
      const data = res.data.data;
      setProfile(data);

      reset({
        legalName: data.legalName || '',
        brandName: data.brandName || '',
        industry: data.industry || 'Technology',
        companySize: data.companySize || '1-10',
        websiteUrl: data.websiteUrl || 'https://',
        addressLine1: data.addressLine1 || '',
        addressLine2: data.addressLine2 || '',
        city: data.city || '',
        state: data.state || '',
        pincode: data.pincode || '',
        gstin: data.gstin || '',
        cin: data.cin || '',
        contactPersonName: data.contactPersonName || '',
        contactPersonPhone: data.contactPersonPhone || '',
        contactPersonDesignation: data.contactPersonDesignation || '',
        description: data.description || '',
      });
    } catch {
      setErrorMsg('Failed to load company profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const onSubmit = async (data: CompanyProfileInput) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await api.put('/companies/profile', data);
      setProfile(res.data.data);
      setSuccessMsg('Company details and verification credentials updated successfully!');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to update company profile');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex bg-slate-50">
        <Sidebar />
        <main className="flex-1 p-8 text-center text-sm text-slate-500">
          Loading company details...
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-8 max-w-4xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Building2 className="w-6 h-6 text-brand-600" />
              Company Profile & Verification Status
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Provide legal entity credentials for automated verification and trust badge issuance.
            </p>
          </div>

          <div>
            <VerificationBadge
              status={profile?.verificationStatus || 'UNVERIFIED'}
              checks={profile?.verificationRequests?.[0]?.checks || []}
            />
          </div>
        </div>

        {successMsg && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
          {/* Statutory Verification Credentials */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-subtle space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-semibold text-slate-900">
                Statutory Business Verification
              </h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              To obtain the <strong>Verified Company</strong> trust badge, provide your GSTIN and CIN.
              Our automated system cross-references these with licensed registry APIs and WHOIS records.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  GSTIN (15 Characters)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 22AAAAA0000A1Z5"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none uppercase font-mono"
                  {...register('gstin')}
                />
                {errors.gstin && (
                  <p className="mt-1 text-xs text-red-600">{errors.gstin.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  CIN (Corporate Identification Number)
                </label>
                <input
                  type="text"
                  placeholder="e.g. U72200MH2020PTC123456"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none uppercase font-mono"
                  {...register('cin')}
                />
                {errors.cin && (
                  <p className="mt-1 text-xs text-red-600">{errors.cin.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Legal Entity Details */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-subtle space-y-4">
            <h3 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-2">
              Organization Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Legal Entity Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. NexaTech Solutions Private Limited"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  {...register('legalName')}
                />
                {errors.legalName && (
                  <p className="mt-1 text-xs text-red-600">{errors.legalName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Brand / Trade Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. NexaTech"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  {...register('brandName')}
                />
                {errors.brandName && (
                  <p className="mt-1 text-xs text-red-600">{errors.brandName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Industry Sector
                </label>
                <input
                  type="text"
                  placeholder="e.g. Software & Cloud Computing"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  {...register('industry')}
                />
                {errors.industry && (
                  <p className="mt-1 text-xs text-red-600">{errors.industry.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Official Website URL
                </label>
                <input
                  type="url"
                  placeholder="https://company.com"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  {...register('websiteUrl')}
                />
                {errors.websiteUrl && (
                  <p className="mt-1 text-xs text-red-600">{errors.websiteUrl.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Company Description
              </label>
              <textarea
                rows={3}
                placeholder="Overview of company products, culture, and achievements..."
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                {...register('description')}
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>
              )}
            </div>
          </div>

          {/* Registered Address */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-subtle space-y-4">
            <h3 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-2">
              Registered Office Address
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Address Line 1
              </label>
              <input
                type="text"
                placeholder="Plot/Building, Street, Area"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                {...register('addressLine1')}
              />
              {errors.addressLine1 && (
                <p className="mt-1 text-xs text-red-600">{errors.addressLine1.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  City
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bangalore"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  {...register('city')}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  State
                </label>
                <select
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  {...register('state')}
                >
                  <option value="">Select State</option>
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  PIN Code (6 Digits)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 560001"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  {...register('pincode')}
                />
                {errors.pincode && (
                  <p className="mt-1 text-xs text-red-600">{errors.pincode.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Representative */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-subtle space-y-4">
            <h3 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-2">
              Authorized Contact Representative
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Contact Person Name
                </label>
                <input
                  type="text"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  {...register('contactPersonName')}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Designation
                </label>
                <input
                  type="text"
                  placeholder="e.g. Head of Talent Acquisition"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  {...register('contactPersonDesignation')}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="+91 9876543210"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  {...register('contactPersonPhone')}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" size="lg" isLoading={isSubmitting}>
              Save & Submit for Verification
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
