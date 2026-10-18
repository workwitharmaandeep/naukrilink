'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { studentProfileSchema, StudentProfileInput, WORK_MODES, SKILL_LEVELS, INDIAN_STATES } from '@/shared';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/shared/Sidebar';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SkillBadge } from '@/components/ui/SkillBadge';
import { UserCheck, CheckCircle2, AlertCircle, Plus, Trash2, Award } from 'lucide-react';

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [taxonomySkills, setTaxonomySkills] = useState<any[]>([]);
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [selectedSkillLevel, setSelectedSkillLevel] = useState('BEGINNER');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StudentProfileInput>({
    resolver: zodResolver(studentProfileSchema),
  });

  const loadData = async () => {
    try {
      const [profRes, skillsRes] = await Promise.all([
        api.get('/students/profile'),
        api.get('/skills'),
      ]);

      const prof = profRes.data.data;
      setProfile(prof);
      setTaxonomySkills(skillsRes.data.data || []);

      reset({
        fullName: prof.fullName || '',
        phone: prof.phone || '',
        collegeName: prof.collegeName || '',
        degree: prof.degree || '',
        branch: prof.branch || '',
        graduationYear: prof.graduationYear || new Date().getFullYear() + 1,
        cgpa: prof.cgpa || undefined,
        locationCity: prof.locationCity || '',
        locationState: prof.locationState || '',
        preferredWorkModes: prof.preferredWorkModes || ['REMOTE'],
        preferredDurationMonths: prof.preferredDurationMonths || 3,
        availabilityDate: prof.availabilityDate
          ? new Date(prof.availabilityDate).toISOString().split('T')[0]
          : '',
        githubUrl: prof.githubUrl || '',
        linkedinUrl: prof.linkedinUrl || '',
        portfolioUrl: prof.portfolioUrl || '',
        bio: prof.bio || '',
      });
    } catch (err: any) {
      setErrorMsg('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSubmit = async (data: StudentProfileInput) => {
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const res = await api.put('/students/profile', data);
      setProfile(res.data.data);
      setSuccessMsg('Profile successfully updated!');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to update profile');
    }
  };

  const handleAddSkill = async () => {
    if (!selectedSkillId) return;
    try {
      await api.post('/students/skills', {
        skillId: selectedSkillId,
        declaredLevel: selectedSkillLevel,
      });
      setSelectedSkillId('');
      loadData();
    } catch (err: any) {
      setErrorMsg('Failed to add skill');
    }
  };

  const handleRemoveSkill = async (id: string) => {
    try {
      await api.delete(`/students/skills/${id}`);
      loadData();
    } catch (err: any) {
      setErrorMsg('Failed to delete skill');
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex bg-slate-50">
        <Sidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <p className="text-sm text-slate-500">Loading student profile...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-8 max-w-5xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-brand-600" />
              Manage Student Profile
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Keep your profile up to date to receive highly relevant verified internship recommendations.
            </p>
          </div>
          <div className="w-48">
            <ProgressBar
              value={profile?.profileCompleteness || 0}
              label="Completeness"
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

        {/* Profile Edit Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
          {/* Basic & Academic Info */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-subtle space-y-4">
            <h3 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-2">
              Academic Background
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  {...register('fullName')}
                />
                {errors.fullName && (
                  <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Contact Phone
                </label>
                <input
                  type="text"
                  placeholder="+91 9876543210"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  {...register('phone')}
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  College / University
                </label>
                <input
                  type="text"
                  placeholder="e.g. Delhi Technological University"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  {...register('collegeName')}
                />
                {errors.collegeName && (
                  <p className="mt-1 text-xs text-red-600">{errors.collegeName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Degree
                </label>
                <input
                  type="text"
                  placeholder="e.g. B.Tech / B.E. / BCA / MCA"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  {...register('degree')}
                />
                {errors.degree && (
                  <p className="mt-1 text-xs text-red-600">{errors.degree.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Branch / Specialization
                </label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science and Engineering"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  {...register('branch')}
                />
                {errors.branch && (
                  <p className="mt-1 text-xs text-red-600">{errors.branch.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Graduation Year
                  </label>
                  <input
                    type="number"
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    {...register('graduationYear')}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    CGPA (Scale 10)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 8.5"
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    {...register('cgpa')}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preferences & Location */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-subtle space-y-4">
            <h3 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-2">
              Location & Work Preferences
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Current City
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bangalore"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  {...register('locationCity')}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  State / UT
                </label>
                <select
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  {...register('locationState')}
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
                  Preferred Duration (Months)
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  {...register('preferredDurationMonths')}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Earliest Availability Date
                </label>
                <input
                  type="date"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  {...register('availabilityDate')}
                />
              </div>
            </div>
          </div>

          {/* Links & Bio */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-subtle space-y-4">
            <h3 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-2">
              Professional Links & Bio
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  GitHub Profile URL
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/username"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  {...register('githubUrl')}
                />
                {errors.githubUrl && (
                  <p className="mt-1 text-xs text-red-600">{errors.githubUrl.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  LinkedIn Profile URL
                </label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  {...register('linkedinUrl')}
                />
                {errors.linkedinUrl && (
                  <p className="mt-1 text-xs text-red-600">{errors.linkedinUrl.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Bio / Summary
              </label>
              <textarea
                rows={3}
                placeholder="Share your technical interests, notable projects, and career aspirations..."
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                {...register('bio')}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" size="lg" isLoading={isSubmitting}>
              Save Profile Changes
            </Button>
          </div>
        </form>

        {/* Skill Management Section */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-subtle mt-8">
          <h3 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-2 mb-4">
            Declared Skills Taxonomy
          </h3>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <select
              value={selectedSkillId}
              onChange={(e) => setSelectedSkillId(e.target.value)}
              className="flex-1 px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              <option value="">Select skill from taxonomy...</option>
              {taxonomySkills.map((sk) => (
                <option key={sk.id} value={sk.id}>
                  {sk.name} ({sk.category})
                </option>
              ))}
            </select>

            <select
              value={selectedSkillLevel}
              onChange={(e) => setSelectedSkillLevel(e.target.value)}
              className="px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              {SKILL_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>

            <Button type="button" onClick={handleAddSkill} disabled={!selectedSkillId}>
              <Plus className="w-4 h-4 mr-1.5" />
              Add Skill
            </Button>
          </div>

          {/* Current Skills List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {profile?.skills?.map((item: any) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50 transition-standard hover:shadow-subtle"
              >
                <div className="space-y-1">
                  <SkillBadge
                    name={item.skill?.name || 'Skill'}
                    verifiedScore={item.verifiedScore}
                    level={item.declaredLevel}
                    size="sm"
                  />
                  {item.verifiedScore === null && (
                    <a
                      href="/student/assessments"
                      className="text-[11px] text-brand-600 hover:underline block font-medium"
                    >
                      Take quiz to verify &rarr;
                    </a>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(item.id)}
                  className="text-slate-400 hover:text-red-600 p-1 rounded"
                  title="Remove skill"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
