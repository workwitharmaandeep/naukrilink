'use client';

import React from 'react';
import { Award, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';

export interface SkillBadgeProps {
  name: string;
  verifiedScore?: number | null;
  level?: string;
  size?: 'sm' | 'md';
}

export function SkillBadge({ name, verifiedScore, level, size = 'md' }: SkillBadgeProps) {
  let tier: 'GOLD' | 'SILVER' | 'BRONZE' | null = null;
  if (verifiedScore !== undefined && verifiedScore !== null) {
    if (verifiedScore >= 90) tier = 'GOLD';
    else if (verifiedScore >= 80) tier = 'SILVER';
    else if (verifiedScore >= 70) tier = 'BRONZE';
  }

  const isSmall = size === 'sm';

  if (tier === 'GOLD') {
    return (
      <span
        title={`Verified Skill: Gold Tier (${verifiedScore}% score on standardized assessment)`}
        className={clsx(
          'inline-flex items-center gap-1.5 rounded-lg font-semibold border transition-standard shadow-sm',
          'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-900 border-amber-300',
          isSmall ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs'
        )}
      >
        <Award className={clsx('text-amber-600', isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5')} />
        <span>{name}</span>
        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-200/80 text-amber-950 uppercase tracking-wider">
          Gold {verifiedScore}%
        </span>
      </span>
    );
  }

  if (tier === 'SILVER') {
    return (
      <span
        title={`Verified Skill: Silver Tier (${verifiedScore}% score on standardized assessment)`}
        className={clsx(
          'inline-flex items-center gap-1.5 rounded-lg font-semibold border transition-standard shadow-sm',
          'bg-gradient-to-r from-slate-50 to-gray-100 text-slate-800 border-slate-300',
          isSmall ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs'
        )}
      >
        <ShieldCheck className={clsx('text-slate-600', isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5')} />
        <span>{name}</span>
        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-900 uppercase tracking-wider">
          Silver {verifiedScore}%
        </span>
      </span>
    );
  }

  if (tier === 'BRONZE') {
    return (
      <span
        title={`Verified Skill: Bronze Tier (${verifiedScore}% score on standardized assessment)`}
        className={clsx(
          'inline-flex items-center gap-1.5 rounded-lg font-semibold border transition-standard shadow-sm',
          'bg-gradient-to-r from-orange-50 to-amber-50 text-orange-900 border-orange-200',
          isSmall ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs'
        )}
      >
        <CheckCircle2 className={clsx('text-orange-600', isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5')} />
        <span>{name}</span>
        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-orange-200/80 text-orange-950 uppercase tracking-wider">
          Bronze {verifiedScore}%
        </span>
      </span>
    );
  }

  // Declared unverified skill
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-lg font-medium border bg-slate-50 text-slate-700 border-slate-200',
        isSmall ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      )}
    >
      <span>{name}</span>
      {level && (
        <span className="text-[10px] text-slate-400 capitalize">({level.toLowerCase()})</span>
      )}
    </span>
  );
}
