'use client';

import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Shield, Info, X } from 'lucide-react';
import { VerificationStatus } from '@/shared';

interface CheckItem {
  checkType: string;
  status: string;
  providerName?: string;
  executedAt?: string;
}

interface VerificationBadgeProps {
  status: VerificationStatus;
  checks?: CheckItem[];
  showDetailsPopover?: boolean;
}

export function VerificationBadge({
  status,
  checks = [],
  showDetailsPopover = true,
}: VerificationBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (status === 'VERIFIED') {
    if (!showDetailsPopover) {
      return (
        <span
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
          title="Verified Company"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Verified Company</span>
        </span>
      );
    }

    return (
      <div className="relative inline-flex items-center">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-standard cursor-pointer"
          title="Click to view verification details"
          aria-expanded={isOpen}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Verified Company</span>
          <Info className="w-3 h-3 text-emerald-500 ml-0.5" />
        </button>

        {isOpen && (
          <div
            className="absolute left-0 top-full mt-2 z-50 w-72 bg-white rounded-lg shadow-elevated border border-slate-200 p-3 text-left text-xs animate-in fade-in"
            role="dialog"
            aria-label="Verification audit information"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                How was this verified?
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-slate-500 mb-2 leading-relaxed">
              This business underwent automated registry lookups and platform identity audit:
            </p>
            {checks.length > 0 ? (
              <ul className="space-y-1.5">
                {checks.map((chk, idx) => (
                  <li key={idx} className="flex items-start justify-between text-slate-700 bg-slate-50 p-1.5 rounded">
                    <span className="font-medium">{chk.checkType.replace(/_/g, ' ')}</span>
                    <span className="text-[10px] uppercase font-bold text-emerald-600 px-1 bg-emerald-100 rounded">
                      {chk.status}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 italic">
                Verified via GSTIN validation & government record audit.
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  if (status === 'PENDING_REVIEW') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
        <Shield className="w-3.5 h-3.5 text-amber-500" />
        <span>Pending Review</span>
      </span>
    );
  }

  if (status === 'REJECTED') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
        <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
        <span>Verification Rejected</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
      <Shield className="w-3.5 h-3.5 text-slate-400" />
      <span>Unverified</span>
    </span>
  );
}
