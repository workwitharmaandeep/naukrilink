'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Sidebar } from '@/components/shared/Sidebar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { VerificationBadge } from '@/components/ui/VerificationBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Users,
  Search,
  Filter,
  Shield,
  Building2,
  GraduationCap,
  CheckCircle,
  Ban,
  Clock,
  RefreshCw,
} from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (roleFilter !== 'ALL') params.append('role', roleFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await api.get(`/auth/admin/users?${params.toString()}`);
      setUsers(res.data.data || []);
    } catch (err) {
      console.error('Failed to load user directory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setActionLoading(userId);
    try {
      await api.patch(`/auth/admin/users/${userId}/status`, { status: newStatus });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
      );
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to update user status');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="flex-1 flex bg-slate-50 min-h-screen">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Users className="w-6 h-6 text-brand-600" />
              Platform User Directory
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Audit registered candidates, employer accounts, and platform privileges.
            </p>
          </div>

          <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Directory
          </Button>
        </div>

        {/* Filter Controls & Search */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle flex flex-col md:flex-row items-center gap-4 justify-between">
          <form onSubmit={handleSearch} className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by email, candidate, or company name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </form>

          {/* Role Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {['ALL', 'STUDENT', 'COMPANY', 'ADMIN'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-standard ${
                  roleFilter === r
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {r === 'ALL' ? 'All Roles' : r}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-sm text-slate-500">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-600" />
              Loading user accounts from database...
            </div>
          ) : users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">User / Entity</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Associated Profile</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Joined Date</th>
                    <th className="py-3 px-4 text-right">Moderation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => {
                    const isStudent = u.role === 'STUDENT';
                    const isCompany = u.role === 'COMPANY';
                    const isAdmin = u.role === 'ADMIN' || u.role === 'SUPER_ADMIN';

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900">{u.email}</div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            ID: {u.id.slice(0, 8)}...
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              isStudent
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : isCompany
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {isStudent && <GraduationCap className="w-3 h-3" />}
                            {isCompany && <Building2 className="w-3 h-3" />}
                            {isAdmin && <Shield className="w-3 h-3" />}
                            {u.role}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          {isStudent && u.studentProfile ? (
                            <div>
                              <div className="font-medium text-slate-800">
                                {u.studentProfile.fullName}
                              </div>
                              <div className="text-xs text-slate-500">
                                {u.studentProfile.collegeName} • {u.studentProfile.profileCompleteness}% ready
                              </div>
                            </div>
                          ) : isCompany && u.companyProfile ? (
                            <div>
                              <div className="font-medium text-slate-800">
                                {u.companyProfile.brandName}
                              </div>
                              <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                                <span>{u.companyProfile.industry}</span>
                                <VerificationBadge
                                  status={u.companyProfile.verificationStatus}
                                  showDetailsPopover={false}
                                />
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">System Account</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <Badge variant={u.status === 'ACTIVE' ? 'success' : 'danger'}>
                            {u.status}
                          </Badge>
                        </td>

                        <td className="py-3.5 px-4 text-xs text-slate-500">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          {!isAdmin && (
                            <Button
                              variant={u.status === 'ACTIVE' ? 'danger' : 'secondary'}
                              size="sm"
                              disabled={actionLoading === u.id}
                              onClick={() => handleToggleStatus(u.id, u.status)}
                            >
                              {actionLoading === u.id ? (
                                'Updating...'
                              ) : u.status === 'ACTIVE' ? (
                                <>
                                  <Ban className="w-3.5 h-3.5 mr-1" /> Suspend
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-3.5 h-3.5 mr-1" /> Activate
                                </>
                              )}
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={Users}
              title="No Users Found"
              description="No user accounts match the current filter criteria."
            />
          )}
        </div>
      </main>
    </div>
  );
}
