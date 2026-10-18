'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createInternshipSchema,
  CreateInternshipInput,
  INTERNSHIP_CATEGORIES,
  WORK_MODES,
  SKILL_LEVELS,
} from '@/shared';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/shared/Sidebar';
import { Button } from '@/components/ui/Button';
import { PlusCircle, Plus, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function NewInternshipPage() {
  const router = useRouter();
  const [taxonomySkills, setTaxonomySkills] = useState<any[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<
    Array<{ skillId: string; name: string; minLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' }>
  >([]);

  const [currentSkillId, setCurrentSkillId] = useState('');
  const [currentMinLevel, setCurrentMinLevel] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>('BEGINNER');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateInternshipInput>({
    resolver: zodResolver(createInternshipSchema),
    defaultValues: {
      workMode: 'REMOTE',
      durationMonths: 3,
      openingsCount: 1,
      isUnpaid: false,
      status: 'PUBLISHED',
      eligibilityDegrees: ['B.Tech', 'B.E.', 'BCA', 'MCA'],
      eligibilityBranches: ['Computer Science', 'Information Technology', 'Software Engineering'],
    },
  });

  const isUnpaid = watch('isUnpaid');

  useEffect(() => {
    async function loadSkills() {
      try {
        const res = await api.get('/skills');
        setTaxonomySkills(res.data.data || []);
      } catch (err) {
        console.error('Failed to load skills taxonomy', err);
      }
    }
    loadSkills();
  }, []);

  const handleAddSkill = () => {
    if (!currentSkillId) return;
    const found = taxonomySkills.find((s) => s.id === currentSkillId);
    if (!found) return;

    if (selectedSkills.some((s) => s.skillId === currentSkillId)) {
      alert('This skill has already been added to the requirement list.');
      return;
    }

    const updated = [
      ...selectedSkills,
      { skillId: currentSkillId, name: found.name, minLevel: currentMinLevel },
    ];
    setSelectedSkills(updated);
    setValue(
      'requiredSkills',
      updated.map((s) => ({ skillId: s.skillId, minLevel: s.minLevel, isRequired: true }))
    );
    setCurrentSkillId('');
  };

  const handleRemoveSkill = (skillId: string) => {
    const updated = selectedSkills.filter((s) => s.skillId !== skillId);
    setSelectedSkills(updated);
    setValue(
      'requiredSkills',
      updated.map((s) => ({ skillId: s.skillId, minLevel: s.minLevel, isRequired: true }))
    );
  };

  const onSubmit = async (data: CreateInternshipInput) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await api.post('/internships', {
        ...data,
        requiredSkills: selectedSkills.map((s) => ({
          skillId: s.skillId,
          minLevel: s.minLevel,
          isRequired: true,
        })),
      });

      setSuccessMsg('Internship listing created successfully!');
      setTimeout(() => {
        router.push('/company/dashboard');
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to create internship listing');
    }
  };

  return (
    <div className="flex-1 flex bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-8 max-w-4xl mx-auto w-full">
        <div className="pb-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <PlusCircle className="w-6 h-6 text-brand-600" />
            Post New Internship Opportunity
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Specify verified role details, required skill thresholds, and eligibility criteria.
          </p>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
          {/* General Information */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-subtle space-y-4">
            <h3 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-2">
              Role Information
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Internship Title
              </label>
              <input
                type="text"
                placeholder="e.g. Full Stack React & Node Developer Intern"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                {...register('title')}
              />
              {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  {...register('category')}
                >
                  <option value="">Select Category</option>
                  {INTERNSHIP_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-xs text-red-600">{errors.category.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Work Mode
                </label>
                <select
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  {...register('workMode')}
                >
                  {WORK_MODES.map((wm) => (
                    <option key={wm} value={wm}>
                      {wm}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Detailed Description
              </label>
              <textarea
                rows={4}
                placeholder="Describe the project scope, mentorship environment, and what the intern will learn..."
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                {...register('description')}
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Day-to-Day Responsibilities
              </label>
              <textarea
                rows={3}
                placeholder="List key tasks: design UI components, build REST endpoints, participate in code reviews..."
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                {...register('responsibilities')}
              />
              {errors.responsibilities && (
                <p className="mt-1 text-xs text-red-600">{errors.responsibilities.message}</p>
              )}
            </div>
          </div>

          {/* Logistics, Duration & Stipend */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-subtle space-y-4">
            <h3 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-2">
              Logistics & Compensation
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Duration (Months)
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  {...register('durationMonths')}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Total Openings
                </label>
                <input
                  type="number"
                  min="1"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  {...register('openingsCount')}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Application Deadline
                </label>
                <input
                  type="date"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  {...register('deadline')}
                />
                {errors.deadline && (
                  <p className="mt-1 text-xs text-red-600">{errors.deadline.message}</p>
                )}
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="rounded text-brand-600 focus:ring-brand-500"
                  {...register('isUnpaid')}
                />
                <span className="text-sm font-medium text-slate-700">This is an unpaid internship</span>
              </label>

              {!isUnpaid && (
                <div className="flex-1 w-full sm:w-auto">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Monthly Stipend Amount (INR ₹)
                  </label>
                  <input
                    type="number"
                    step="500"
                    placeholder="e.g. 15000"
                    className="w-full sm:w-64 px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    {...register('stipendAmount')}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Required Skills Picker */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-subtle space-y-4">
            <h3 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-2">
              Required Skills & Minimum Proficiency
            </h3>

            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={currentSkillId}
                onChange={(e) => setCurrentSkillId(e.target.value)}
                className="flex-1 px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="">Select required skill from taxonomy...</option>
                {taxonomySkills.map((sk) => (
                  <option key={sk.id} value={sk.id}>
                    {sk.name} ({sk.category})
                  </option>
                ))}
              </select>

              <select
                value={currentMinLevel}
                onChange={(e) => setCurrentMinLevel(e.target.value as any)}
                className="px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                {SKILL_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    Min: {lvl}
                  </option>
                ))}
              </select>

              <Button type="button" onClick={handleAddSkill} disabled={!currentSkillId}>
                <Plus className="w-4 h-4 mr-1.5" />
                Add Skill
              </Button>
            </div>

            {/* Selected Skills Chips */}
            <div className="flex flex-wrap gap-2 pt-2">
              {selectedSkills.map((item) => (
                <span
                  key={item.skillId}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-50 border border-brand-200 text-brand-800 text-xs font-semibold"
                >
                  <span>{item.name}</span>
                  <span className="text-[10px] text-brand-600 bg-white px-1.5 py-0.5 rounded border border-brand-100">
                    {item.minLevel}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(item.skillId)}
                    className="hover:text-red-600 p-0.5 rounded ml-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/company/dashboard')}
            >
              Cancel
            </Button>
            <Button type="submit" size="lg" isLoading={isSubmitting}>
              Publish Internship
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
