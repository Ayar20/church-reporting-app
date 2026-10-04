'use client';

import React, { useState, useEffect } from 'react';
import { useChurch } from '@/lib/store';
import { UserProfile, UserRole } from '@/lib/types';
import { X, UserPlus, Save, AlertCircle } from 'lucide-react';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingUser?: UserProfile | null;
}

export default function UserModal({ isOpen, onClose, editingUser }: UserModalProps) {
  const { c3Centres, serviceTeams, ministryTeams, addUser, editUser } = useChurch();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('c3_minister');
  const [c3Id, setC3Id] = useState('');
  const [serviceTeamId, setServiceTeamId] = useState('');
  const [ministryId, setMinistryId] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingUser) {
      setFullName(editingUser.fullName);
      setEmail(editingUser.email);
      setPhone(editingUser.phone || '');
      setRole(editingUser.role);
      setC3Id(editingUser.c3Id || '');
      setServiceTeamId(editingUser.serviceTeamId || '');
      setMinistryId(editingUser.ministryId || '');
    } else {
      setFullName('');
      setEmail('');
      setPhone('');
      setRole('c3_minister');
      setC3Id(c3Centres[0]?.id || '');
      setServiceTeamId('');
      setMinistryId('');
    }
    setError('');
  }, [editingUser, isOpen, c3Centres]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !email.trim()) {
      setError('Please provide a full name and email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingUser) {
        await editUser(editingUser.id, {
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          role,
          c3Id: role === 'c3_minister' ? c3Id : undefined,
          serviceTeamId: role === 'service_team_leader' ? serviceTeamId : undefined,
          ministryId: role === 'ministry_leader' ? ministryId : undefined,
        });
      } else {
        await addUser({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          role,
          c3Id: role === 'c3_minister' ? c3Id : undefined,
          serviceTeamId: role === 'service_team_leader' ? serviceTeamId : undefined,
          ministryId: role === 'ministry_leader' ? ministryId : undefined,
        });
      }
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save user account';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#0a719e] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                {editingUser ? 'Edit Leadership Account' : 'Add New Leader / Minister'}
              </h2>
              <p className="text-[11px] text-sky-100">
                Christ Family Centre Makurdi Directory
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Full Name *
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Minister Timothy Bem"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0a719e]"
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Official Email Address *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. timothy.northbank@cfcmakurdi.org"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0a719e]"
              required
            />
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +234 815 678 1234"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0a719e]"
            />
          </div>

          {/* Role */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Leadership Role *
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0a719e]"
            >
              <option value="c3_minister">C3 Minister (Community Church)</option>
              <option value="service_team_leader">Service Team Leader</option>
              <option value="ministry_leader">Ministry Leader</option>
              <option value="associate_pastor_c3">Associate Pastor (C3s)</option>
              <option value="associate_pastor_service_teams">Associate Pastor (Service Teams)</option>
              <option value="resident_pastor">Resident Pastor (Executive)</option>
            </select>
          </div>

          {/* Dynamic Unit Assignment */}
          {role === 'c3_minister' && (
            <div className="space-y-1 p-3 bg-emerald-50/60 rounded-xl border border-emerald-200">
              <label className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                Assigned C3 Centre *
              </label>
              <select
                value={c3Id}
                onChange={(e) => setC3Id(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-emerald-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">-- Select C3 Centre --</option>
                {c3Centres.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.zone})
                  </option>
                ))}
              </select>
            </div>
          )}

          {role === 'service_team_leader' && (
            <div className="space-y-1 p-3 bg-sky-50/60 rounded-xl border border-sky-200">
              <label className="text-xs font-bold text-sky-900 uppercase tracking-wider">
                Assigned Service Team *
              </label>
              <select
                value={serviceTeamId}
                onChange={(e) => setServiceTeamId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-sky-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="">-- Select Service Team --</option>
                {serviceTeams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {role === 'ministry_leader' && (
            <div className="space-y-1 p-3 bg-teal-50/60 rounded-xl border border-teal-200">
              <label className="text-xs font-bold text-teal-900 uppercase tracking-wider">
                Assigned Ministry Fellowship *
              </label>
              <select
                value={ministryId}
                onChange={(e) => setMinistryId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-teal-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">-- Select Fellowship --</option>
                {ministryTeams.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#0a719e] hover:bg-[#085a7e] disabled:opacity-60 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Saving...' : editingUser ? 'Update Account' : 'Create Account'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
