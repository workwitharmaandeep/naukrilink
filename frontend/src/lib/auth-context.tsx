'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from './api';
import { LoginInput, RegisterInput, UserRole } from '@/shared';

interface User {
  id: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  studentProfile?: any;
  companyProfile?: any;
  collegeProfile?: any;
}

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.data);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (input: LoginInput) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', input);
      setUser(res.data.data.user);
      const role = res.data.data.user.role;
      if (role === 'STUDENT') router.push('/student/dashboard');
      else if (role === 'COMPANY') router.push('/company/dashboard');
      else if (role === 'COLLEGE') router.push('/college/dashboard');
      else if (role === 'ADMIN' || role === 'SUPER_ADMIN') router.push('/admin/dashboard');
      else router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (input: RegisterInput) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/register', input);
      setUser(res.data.data.user);
      const role = res.data.data.user.role;
      if (role === 'STUDENT') router.push('/student/profile');
      else if (role === 'COMPANY') router.push('/company/dashboard');
      else router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
      router.push('/login');
    }
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
