'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  LayoutDashboard,
  UserCheck,
  Briefcase,
  FileText,
  Award,
  Video,
  Settings,
  PlusCircle,
  ShieldCheck,
  AlertTriangle,
  Users,
  CheckCircle2,
  BarChart3,
} from 'lucide-react';
import { clsx } from 'clsx';

export function Sidebar() {
  const pathname = usePathname();
  const { role } = useAuth();

  const studentLinks = [
    { label: 'Overview', href: '/student/dashboard', icon: LayoutDashboard },
    { label: 'Match Recommendations', href: '/student/recommendations', icon: Award },
    { label: 'Skill Assessments', href: '/student/assessments', icon: CheckCircle2 },
    { label: 'AI Mock Interview', href: '/student/interview', icon: Video },
    { label: 'Applications', href: '/student/applications', icon: FileText },
    { label: 'Mentorship Sessions', href: '/student/mentorship', icon: Users },
    { label: 'My Profile', href: '/student/profile', icon: UserCheck },
    { label: 'Browse Internships', href: '/internships', icon: Briefcase },
  ];

  const companyLinks = [
    { label: 'Overview', href: '/company/dashboard', icon: LayoutDashboard },
    { label: 'Post Internship', href: '/company/internships/new', icon: PlusCircle },
    { label: 'Mentorship Sessions', href: '/company/mentorship', icon: Video },
    { label: 'Verification Pipeline', href: '/company/verification', icon: ShieldCheck },
    { label: 'Company Profile', href: '/company/profile', icon: UserCheck },
    { label: 'Public Listings', href: '/internships', icon: Briefcase },
  ];

  const adminLinks = [
    { label: 'Admin Overview', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Verification Queue', href: '/admin/verification-queue', icon: ShieldCheck },
    { label: 'Reported Listings', href: '/admin/reports', icon: AlertTriangle },
    { label: 'User Directory', href: '/admin/users', icon: Users },
  ];

  let links = studentLinks;
  if (role === 'COMPANY') links = companyLinks;
  if (role === 'ADMIN' || role === 'SUPER_ADMIN') links = adminLinks;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 hidden md:block shrink-0">
      <div className="space-y-1">
        <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
          {role || 'Portal'} Navigation
        </p>
        {links.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <a
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-standard',
                isActive
                  ? 'bg-brand-50 text-brand-700 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <Icon className={clsx('w-4 h-4', isActive ? 'text-brand-600' : 'text-slate-400')} />
              <span>{item.label}</span>
            </a>
          );
        })}
      </div>
    </aside>
  );
}
