'use client';

import React, { useState } from 'react';
import { useChurch } from '@/lib/store';
import { UserProfile, UserRole } from '@/lib/types';
import {
  Settings,
  UserPlus,
  Pencil,
  Trash2,
  Search,
  Shield,
  Users,
  CheckCircle2,
  Server,
  Wifi,
  Building,
  AlertTriangle,
} from 'lucide-react';
import UserModal from './UserModal';
import DeleteConfirmModal from './DeleteConfirmModal';

export default function SettingsView() {
  const { allUsers, currentUser, deleteUser, isOnline, pendingSyncCount } = useChurch();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    user: UserProfile | null;
  }>({
    isOpen: false,
    user: null,
  });

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'resident_pastor':
        return { label: 'Resident Pastor', bg: 'bg-slate-900 text-white border-slate-700' };
      case 'associate_pastor_c3':
        return { label: 'Assoc. Pastor (C3s)', bg: 'bg-sky-100 text-sky-900 border-sky-300' };
      case 'associate_pastor_service_teams':
        return { label: 'Assoc. Pastor (Teams)', bg: 'bg-blue-100 text-blue-900 border-blue-300' };
      case 'c3_minister':
        return { label: 'C3 Minister', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      case 'service_team_leader':
        return { label: 'Service Team Leader', bg: 'bg-teal-100 text-teal-900 border-teal-300' };
      case 'ministry_leader':
        return { label: 'Ministry Leader', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      default:
        return { label: 'Member', bg: 'bg-slate-100 text-slate-800 border-slate-300' };
    }
  };

  const filteredUsers = allUsers.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.c3Name && u.c3Name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.serviceTeamName && u.serviceTeamName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.ministryName && u.ministryName.toLowerCase().includes(searchQuery.toLowerCase()));

    if (roleFilter === 'all') return matchesSearch;
    if (roleFilter === 'pastors') {
      return matchesSearch && (u.role === 'resident_pastor' || u.role.startsWith('associate_pastor'));
    }
    if (roleFilter === 'c3') return matchesSearch && u.role === 'c3_minister';
    if (roleFilter === 'teams') return matchesSearch && u.role === 'service_team_leader';
    if (roleFilter === 'ministries') return matchesSearch && u.role === 'ministry_leader';
    return matchesSearch;
  });

  const handleDeleteClick = (user: UserProfile) => {
    if (user.id === currentUser.id) {
      alert('You cannot delete your own active account.');
      return;
    }
    setDeleteModal({ isOpen: true, user });
  };

  const handleConfirmDelete = async () => {
    if (deleteModal.user) {
      await deleteUser(deleteModal.user.id);
      setDeleteModal({ isOpen: false, user: null });
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#0a719e]" />
            <span>Settings &amp; Leadership Accounts</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Create, edit, reassign, or remove church leadership accounts and oversee system settings for CFC Makurdi.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingUser(null);
            setUserModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0a719e] hover:bg-[#085a7e] text-white font-bold text-xs transition shadow-sm shrink-0 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Leader</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by leader name, email, or assigned cell/team..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0a719e] text-slate-900"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Accounts' },
            { id: 'pastors', label: 'Pastoral Team' },
            { id: 'c3', label: 'C3 Ministers' },
            { id: 'teams', label: 'Team Leaders' },
            { id: 'ministries', label: 'Ministry Leaders' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setRoleFilter(pill.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                roleFilter === pill.id
                  ? 'bg-[#0a719e] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Leadership Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Active Church Leadership Accounts ({filteredUsers.length})
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/60 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <th className="py-3 px-4">Leader / Minister</th>
                <th className="py-3 px-4">Contact Details</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Assigned Unit</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No leadership accounts match your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const roleBadge = getRoleBadge(u.role);
                  const isCurrent = u.id === currentUser.id;
                  const unitLabel = u.c3Name || u.serviceTeamName || u.ministryName || 'General Oversight';

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#0a719e]/10 text-[#0a719e] font-bold flex items-center justify-center shrink-0">
                            {u.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 flex items-center gap-1.5">
                              {u.fullName}
                              {isCurrent && (
                                <span className="text-[9px] bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.2 rounded-full">
                                  You
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-slate-800 font-medium">{u.email}</p>
                        {u.phone && <p className="text-slate-500 text-[11px] mt-0.5">{u.phone}</p>}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded border ${roleBadge.bg}`}>
                          {roleBadge.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {unitLabel}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditingUser(u);
                              setUserModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-[#0a719e] hover:bg-sky-50 transition"
                            title="Edit Account"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          {!isCurrent && (
                            <button
                              onClick={() => handleDeleteClick(u)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                              title="Delete Account"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Status & Infrastructure Card */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
          <Server className="w-4 h-4 text-[#0a719e]" />
          <span>System &amp; Server Infrastructure Status</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 block">Database</span>
            <p className="text-xs font-bold text-slate-800 mt-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Neon Serverless PostgreSQL (Live)</span>
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 block">Connectivity</span>
            <p className="text-xs font-bold text-slate-800 mt-1 flex items-center gap-1.5">
              <Wifi className={`w-3.5 h-3.5 ${isOnline ? 'text-emerald-600' : 'text-amber-500'}`} />
              <span>{isOnline ? 'Online (Synchronized)' : `Offline (${pendingSyncCount} pending)`}</span>
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 block">Branch Headquarters</span>
            <p className="text-xs font-bold text-slate-800 mt-1 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-[#0a719e]" />
              <span>CFC Makurdi, Benue State</span>
            </p>
          </div>
        </div>
      </div>

      {/* User Modal */}
      <UserModal
        isOpen={userModalOpen}
        onClose={() => {
          setUserModalOpen(false);
          setEditingUser(null);
        }}
        editingUser={editingUser}
      />

      {/* Delete User Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        title="Remove Leader Account"
        message={`Are you sure you want to delete the leadership profile for ${deleteModal.user?.fullName}? This will revoke their access to the portal.`}
        itemLabel={deleteModal.user?.fullName}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteModal({ isOpen: false, user: null })}
      />
    </div>
  );
}
