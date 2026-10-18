import React from 'react';
import { Button } from '@/components/ui/Button';
import {
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Users2,
  LayoutDashboard,
  ArrowRight,
  Briefcase,
  Sparkles,
} from 'lucide-react';

export default function HomePage() {
  const capabilities = [
    {
      icon: ShieldCheck,
      title: '1. Company Verification',
      badge: 'Trust & Authenticity',
      description:
        'Eliminating scam and phantom listings. Every employer submits verifiable government records (GSTIN, CIN, domain identity), audited before publishing.',
    },
    {
      icon: CheckCircle2,
      title: '2. Skill Assessments & AI Interview',
      badge: 'Proof of Ability',
      description:
        'Showcase actual proficiency through timed, anti-cheat quizzes and interactive AI-driven technical evaluations with transparent feedback.',
    },
    {
      icon: Cpu,
      title: '3. Smart Matching Engine',
      badge: 'Relevance',
      description:
        'Explainable, rule-based algorithmic matching based on verified skills, location, work mode preferences, and verified employer status.',
    },
    {
      icon: Users2,
      title: '4. Company-Led Mentorship',
      badge: 'Industry Guidance',
      description:
        'Connect directly with vetted industry professionals through scheduled group sessions and AMA slots with database-enforced capacity.',
    },
    {
      icon: LayoutDashboard,
      title: '5. Unified Student Dashboard',
      badge: 'Control',
      description:
        'One place to manage everything: monitor profile completeness, track applications in real time, view skill benchmarks, and book mentorships.',
    },
  ];

  return (
    <div className="flex flex-col min-h-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            Live Platform Launch
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
            Smarter Internships.{' '}
            <span className="text-brand-600">Verified Opportunities.</span> Guided Careers.
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            NEXAURA connects forward-thinking students with verified employers. Replace guesswork
            with proof of skill, algorithmic matching, and company-led mentorship.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button href="/register" size="lg" className="w-full sm:w-auto text-base">
              Create Free Account
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button href="/internships" variant="outline" size="lg" className="w-full sm:w-auto text-base">
              <Briefcase className="w-4 h-4 mr-2" />
              Explore Available Internships
            </Button>
          </div>
        </div>
      </section>

      {/* 5 Core Capabilities Section */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            A Transparent 5-Stage Student Journey
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base">
            Engineered from first principles to solve unverified listings, generic resumes, and
            mismatched expectations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {capabilities.map((cap, i) => {
            const Icon = cap.icon;
            return (
              <div
                key={i}
                className="bg-white rounded-xl p-6 border border-slate-200 shadow-card hover:shadow-elevated transition-standard flex flex-col"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {cap.badge}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{cap.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed flex-1">{cap.description}</p>
              </div>
            );
          })}

          {/* Quick Start Card */}
          <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-xl p-6 text-white shadow-card flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold text-brand-200 uppercase tracking-wider">
                Get Started Today
              </span>
              <h3 className="text-xl font-bold mt-2">Ready to discover your next career milestone?</h3>
              <p className="text-sm text-brand-100 mt-2 leading-relaxed">
                Join as a student, company, or institutional training & placement office.
              </p>
            </div>
            <div className="mt-6">
              <Button href="/register" variant="secondary" className="w-full text-brand-900 font-semibold">
                Register Now
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 NEXAURA Platform. Smarter Internships. Verified Opportunities. Guided Careers.</p>
        </div>
      </footer>
    </div>
  );
}
