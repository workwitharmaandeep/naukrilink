'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '../ui/Button';
import { NotificationBell } from './NotificationBell';
import {
  Compass,
  Briefcase,
  User,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  GraduationCap,
  Video,
} from 'lucide-react';

export function Navbar() {
  const { user, role, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getDashboardLink = () => {
    if (role === 'STUDENT') return '/student/dashboard';
    if (role === 'COMPANY') return '/company/dashboard';
    if (role === 'COLLEGE') return '/college/dashboard';
    if (role === 'ADMIN' || role === 'SUPER_ADMIN') return '/admin/dashboard';
    return '/login';
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                N
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  NEXAURA
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs font-medium text-slate-500">
                  Career Platform
                </span>
              </div>
            </a>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <a
              href="/internships"
              className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-standard flex items-center gap-1.5"
            >
              <Briefcase className="w-4 h-4" />
              Browse Internships
            </a>

            <a
              href="/mentorship"
              className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-standard flex items-center gap-1.5"
            >
              <Video className="w-4 h-4" />
              Mentorship
            </a>

            {mounted && user ? (
              <div className="flex items-center gap-4">
                <a
                  href={getDashboardLink()}
                  className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1.5"
                >
                  <Compass className="w-4 h-4" />
                  Dashboard
                </a>

                <NotificationBell />

                <div className="flex items-center gap-2 pl-4 border-l border-slate-200">
                  <span className="px-2 py-0.5 text-xs font-semibold rounded bg-brand-50 text-brand-700 border border-brand-200">
                    {user.role}
                  </span>
                  <span className="text-xs text-slate-600 font-medium">
                    {user.email}
                  </span>
                  <button
                    onClick={() => logout()}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded transition-standard"
                    title="Log out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button href="/login" variant="ghost" size="sm">
                  Log in
                </Button>
                <Button href="/register" size="sm">
                  Get Started
                </Button>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-500 hover:text-slate-900 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-3">
          <a
            href="/internships"
            className="block py-2 text-sm font-medium text-slate-700 hover:text-brand-600"
            onClick={() => setMobileMenuOpen(false)}
          >
            Browse Internships
          </a>
          <a
            href="/mentorship"
            className="block py-2 text-sm font-medium text-slate-700 hover:text-brand-600"
            onClick={() => setMobileMenuOpen(false)}
          >
            Mentorship
          </a>
          {mounted && user ? (
            <>
              <a
                href={getDashboardLink()}
                className="block py-2 text-sm font-medium text-brand-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                Go to Dashboard ({user.role})
              </a>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="block w-full text-left py-2 text-sm font-medium text-red-600"
              >
                Log Out
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
              <Button
                href="/login"
                variant="outline"
                className="w-full"
                onClick={() => setMobileMenuOpen(false)}
              >
                Log in
              </Button>
              <Button
                href="/register"
                className="w-full"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
