'use client';

import React, { useState } from 'react';
import { X, Church, Users, Mic, DollarSign, BookOpen, Star, Calendar } from 'lucide-react';
import { useChurch } from '@/lib/store';
import { GeneralServiceReport, ServiceType } from '@/lib/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  connect_to_life_first: 'Connect to Life Service (1st Service)',
  connect_to_life_second: 'Connect to Life Service (2nd Service)',
  connect_to_life_combined: 'Connect to Life Service (Combined)',
  prayer_and_communion: 'Prayer & Communion Service (Last Sunday of Month - Combined)',
  c3_midweek: 'Midweek Service (Held in C3 Cells)',
  first_service: 'First Service (Main)',
  second_service: 'Second Service',
  combined_service: 'Combined Service',
  midweek_service: 'Midweek Service',
  special_meeting: 'Special Meeting / Programme',
};

export default function SundayServiceModal({ isOpen, onClose }: Props) {
  const { currentUser, submitGeneralServiceReport } = useChurch();

  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    serviceDate: today,
    serviceType: 'connect_to_life_first' as ServiceType,
    preacher: '',
    sermonTitle: '',
    maleCount: '',
    femaleCount: '',
    childrenCount: '',
    firstTimersCount: '',
    newConvertsCount: '',
    totalOffering: '',
    totalTithe: '',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const totalAttendance =
    (Number(form.maleCount) || 0) +
    (Number(form.femaleCount) || 0) +
    (Number(form.childrenCount) || 0);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));

    const report: Partial<GeneralServiceReport> = {
      serviceDate: form.serviceDate,
      serviceType: form.serviceType,
      preacher: form.preacher,
      sermonTitle: form.sermonTitle,
      maleCount: Number(form.maleCount) || 0,
      femaleCount: Number(form.femaleCount) || 0,
      childrenCount: Number(form.childrenCount) || 0,
      totalAttendance,
      firstTimersCount: Number(form.firstTimersCount) || 0,
      newConvertsCount: Number(form.newConvertsCount) || 0,
      totalOffering: Number(form.totalOffering) || 0,
      totalTithe: Number(form.totalTithe) || 0,
      notes: form.notes,
      submittedByName: currentUser.fullName,
    };

    submitGeneralServiceReport(report);
    setIsSubmitting(false);
    setSubmitted(true);
  };

  const handleClose = () => {
    setSubmitted(false);
    setForm({
      serviceDate: today,
      serviceType: 'first_service',
      preacher: '',
      sermonTitle: '',
      maleCount: '',
      femaleCount: '',
      childrenCount: '',
      firstTimersCount: '',
      newConvertsCount: '',
      totalOffering: '',
      totalTithe: '',
      notes: '',
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0a719e] to-[#139fdd] px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Church className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Connect to Life &amp; Communion Service Report</h2>
              <p className="text-xs text-sky-100">Christ Family Centre Makurdi — Connect to Life &amp; Monthly Prayer &amp; Communion</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {submitted ? (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
              <Star className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Service Report Submitted!</h3>
              <p className="text-sm text-slate-500 mt-1">
                The Sunday service record has been saved and is now visible on the Executive Overview dashboard.
              </p>
            </div>
            <button
              onClick={handleClose}
              className="mt-2 px-6 py-2.5 rounded-xl bg-[#0a719e] text-white font-bold text-sm hover:bg-[#085a7e] transition"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Service Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5" />
                Service Details
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Service Date *</label>
                  <input
                    type="date"
                    name="serviceDate"
                    value={form.serviceDate}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#139fdd]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Service Type *</label>
                  <select
                    name="serviceType"
                    value={form.serviceType}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#139fdd]"
                  >
                    {Object.entries(SERVICE_TYPE_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Preacher / Minister *</label>
                  <div className="relative">
                    <Mic className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      name="preacher"
                      value={form.preacher}
                      onChange={handleChange}
                      placeholder="e.g. Pastor David Terzungwe"
                      required
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#139fdd]"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Sermon Title *</label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      name="sermonTitle"
                      value={form.sermonTitle}
                      onChange={handleChange}
                      placeholder="e.g. Walking in Covenant Blessings"
                      required
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#139fdd]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <Users className="w-3.5 h-3.5" />
                Attendance Breakdown
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Males *</label>
                  <input
                    type="number"
                    name="maleCount"
                    value={form.maleCount}
                    onChange={handleChange}
                    min="0"
                    placeholder="0"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#139fdd]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Females *</label>
                  <input
                    type="number"
                    name="femaleCount"
                    value={form.femaleCount}
                    onChange={handleChange}
                    min="0"
                    placeholder="0"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#139fdd]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Children</label>
                  <input
                    type="number"
                    name="childrenCount"
                    value={form.childrenCount}
                    onChange={handleChange}
                    min="0"
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#139fdd]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Total (Auto)</label>
                  <div className="px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-sm font-bold text-emerald-700">
                    {totalAttendance}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">First Timers</label>
                  <input
                    type="number"
                    name="firstTimersCount"
                    value={form.firstTimersCount}
                    onChange={handleChange}
                    min="0"
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#139fdd]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">New Converts (Altar Call)</label>
                  <input
                    type="number"
                    name="newConvertsCount"
                    value={form.newConvertsCount}
                    onChange={handleChange}
                    min="0"
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#139fdd]"
                  />
                </div>
              </div>
            </div>

            {/* Financial */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <DollarSign className="w-3.5 h-3.5" />
                Financial Records (₦ NGN)
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Total Offering (₦)</label>
                  <input
                    type="number"
                    name="totalOffering"
                    value={form.totalOffering}
                    onChange={handleChange}
                    min="0"
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#139fdd]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Total Tithe (₦)</label>
                  <input
                    type="number"
                    name="totalTithe"
                    value={form.totalTithe}
                    onChange={handleChange}
                    min="0"
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#139fdd]"
                  />
                </div>
              </div>
              {(Number(form.totalOffering) + Number(form.totalTithe)) > 0 && (
                <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-xs font-semibold text-emerald-800">Combined Total Giving</span>
                  <span className="text-sm font-black text-emerald-700">
                    ₦{(Number(form.totalOffering) + Number(form.totalTithe)).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Pastor&apos;s Notes / Highlights</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Special moments, testimonies, prophetic words, notable occurrences during the service..."
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#139fdd] resize-none"
              />
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-[#0a719e] hover:bg-[#085a7e] disabled:opacity-60 text-white font-bold text-sm flex items-center gap-2 transition shadow-md"
              >
                {isSubmitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <Church className="w-4 h-4" />
                    Submit Service Report
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
