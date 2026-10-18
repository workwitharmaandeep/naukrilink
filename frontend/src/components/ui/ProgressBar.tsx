import React from 'react';
import { clsx } from 'clsx';

interface ProgressBarProps {
  value: number; // 0 to 100
  label?: string;
  showPercent?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  label,
  showPercent = true,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, value));

  return (
    <div className={clsx('w-full', className)}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1 text-xs">
          {label && <span className="font-medium text-slate-700">{label}</span>}
          {showPercent && (
            <span className="font-semibold text-brand-700">{percentage}%</span>
          )}
        </div>
      )}
      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-brand-600 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
