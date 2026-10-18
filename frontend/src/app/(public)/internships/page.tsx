'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { VerificationBadge } from '@/components/ui/VerificationBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { INTERNSHIP_CATEGORIES, WORK_MODES } from '@/shared';
import {
  Search,
  Briefcase,
  MapPin,
  Clock,
  IndianRupee,
  ShieldCheck,
  Filter,
} from 'lucide-react';

export default function BrowseInternshipsPage() {
  const [internships, setInternships] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [workMode, setWorkMode] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const fetchInternships = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (category) params.category = category;
      if (workMode) params.workMode = workMode;
      if (verifiedOnly) params.verifiedOnly = true;

      const res = await api.get('/internships', { params });
      setInternships(res.data.items || []);
      setTotal(res.data.pagination?.total || 0);
    } catch (err) {
      console.error('Failed to fetch internships', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternships();
  }, [category, workMode, verifiedOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInternships();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Explore Verified Internships
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Discover legitimate career opportunities with vetted employers. All counts and badges
          computed live.
        </p>

        {/* Filter Controls Bar */}
        <form onSubmit={handleSearchSubmit} className="mt-6 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by role, company name, skill or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-brand-500 focus:outline-none"
          >
            <option value="">All Categories</option>
            {INTERNSHIP_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={workMode}
            onChange={(e) => setWorkMode(e.target.value)}
            className="px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-brand-500 focus:outline-none"
          >
            <option value="">All Work Modes</option>
            {WORK_MODES.map((wm) => (
              <option key={wm} value={wm}>
                {wm}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="rounded text-brand-600 focus:ring-brand-500"
            />
            <span className="text-xs font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Verified Only
            </span>
          </label>

          <Button type="submit">Search</Button>
        </form>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-slate-700">
          Showing {internships.length} of {total} available openings
        </span>
      </div>

      {/* Internships Grid */}
      {loading ? (
        <div className="py-16 text-center text-sm text-slate-500">
          Loading live opportunities...
        </div>
      ) : internships.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {internships.map((internship) => (
            <div
              key={internship.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-subtle hover:shadow-card hover:border-brand-300 transition-standard flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">
                    {internship.category}
                  </span>
                  <VerificationBadge
                    status={internship.company?.verificationStatus || 'UNVERIFIED'}
                  />
                </div>

                <a
                  href={`/internships/${internship.id}`}
                  className="text-base font-bold text-slate-900 hover:text-brand-600 line-clamp-1"
                >
                  {internship.title}
                </a>

                <p className="text-xs text-slate-600 font-medium mt-1">
                  {internship.company?.brandName}
                </p>

                <div className="mt-3 flex flex-wrap gap-y-1.5 gap-x-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {internship.workMode === 'REMOTE'
                      ? 'Remote'
                      : internship.locationCity || 'Onsite'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {internship.durationMonths} Months
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-emerald-700">
                    <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                    {internship.isUnpaid
                      ? 'Unpaid'
                      : internship.stipendAmount
                      ? `₹${internship.stipendAmount.toLocaleString()}/mo`
                      : 'Disclosed'}
                  </span>
                </div>

                <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {internship.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Deadline: {new Date(internship.deadline).toLocaleDateString()}
                </span>
                <Button href={`/internships/${internship.id}`} variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Briefcase}
          title="No Internships Matched Your Search"
          description="Try adjusting your filters or search keywords. New opportunities are verified and listed regularly."
          actionText="Clear Filters"
          onAction={() => {
            setSearch('');
            setCategory('');
            setWorkMode('');
            setVerifiedOnly(false);
          }}
        />
      )}
    </div>
  );
}
