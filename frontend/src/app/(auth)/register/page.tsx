'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterInput } from '@/shared';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/Button';
import { UserPlus, AlertCircle, GraduationCap, Building2, School } from 'lucide-react';
import { clsx } from 'clsx';

export default function RegisterPage() {
  const { register: registerAuth } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'STUDENT' | 'COMPANY' | 'COLLEGE'>('STUDENT');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'STUDENT',
    },
  });

  const handleRoleChange = (role: 'STUDENT' | 'COMPANY' | 'COLLEGE') => {
    setSelectedRole(role);
    setValue('role', role);
  };

  const onSubmit = async (data: RegisterInput) => {
    setErrorMsg(null);
    try {
      await registerAuth(data);
    } catch (err: any) {
      const msg =
        err.response?.data?.error?.message ||
        'Registration failed. Please check your details and try again.';
      setErrorMsg(msg);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-card p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="inline-flex w-12 h-12 rounded-xl bg-brand-50 text-brand-600 items-center justify-center mb-3">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Create an Account</h1>
          <p className="mt-1 text-sm text-slate-500">
            Select your account type to get started with verified opportunities.
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => handleRoleChange('STUDENT')}
            className={clsx(
              'flex flex-col items-center py-2.5 px-2 rounded-lg text-xs font-semibold transition-standard',
              selectedRole === 'STUDENT'
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <GraduationCap className="w-4 h-4 mb-1" />
            Student
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange('COMPANY')}
            className={clsx(
              'flex flex-col items-center py-2.5 px-2 rounded-lg text-xs font-semibold transition-standard',
              selectedRole === 'COMPANY'
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <Building2 className="w-4 h-4 mb-1" />
            Company
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange('COLLEGE')}
            className={clsx(
              'flex flex-col items-center py-2.5 px-2 rounded-lg text-xs font-semibold transition-standard',
              selectedRole === 'COLLEGE'
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <School className="w-4 h-4 mb-1" />
            College
          </button>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register('role')} value={selectedRole} />

          {selectedRole === 'STUDENT' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Full Legal Name
              </label>
              <input
                type="text"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="e.g. Aditi Sharma"
                {...register('fullName')}
              />
              {errors.fullName && (
                <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>
              )}
            </div>
          )}

          {selectedRole === 'COMPANY' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Registered Company Name
                </label>
                <input
                  type="text"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="e.g. NexaTech Solutions Pvt Ltd"
                  {...register('companyName')}
                />
                {errors.companyName && (
                  <p className="mt-1 text-xs text-red-600">{errors.companyName.message}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Authorized Contact Person
                </label>
                <input
                  type="text"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="e.g. Rahul Verma"
                  {...register('fullName')}
                />
              </div>
            </>
          )}

          {selectedRole === 'COLLEGE' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Institution Name
                </label>
                <input
                  type="text"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="e.g. Indian Institute of Technology Delhi"
                  {...register('institutionName')}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  T&P Officer Name
                </label>
                <input
                  type="text"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="e.g. Dr. K. Raman"
                  {...register('fullName')}
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              autoComplete="email"
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder={
                selectedRole === 'STUDENT'
                  ? 'student@college.edu or personal email'
                  : 'official@company.com'
              }
              {...register('email')}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              autoComplete="new-password"
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Min. 8 chars, 1 uppercase, 1 number, 1 special symbol"
              {...register('password')}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full mt-4" isLoading={isSubmitting}>
            Create {selectedRole === 'STUDENT' ? 'Student' : selectedRole === 'COMPANY' ? 'Company' : 'College'} Account
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Already registered?{' '}
          <a href="/login" className="text-brand-600 hover:text-brand-700 font-semibold">
            Log in to your account
          </a>
        </div>
      </div>
    </div>
  );
}
