'use client';

import React, { useState } from 'react';
import { useChurch } from '@/lib/store';
import { X, Heart, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function MinistryReportModal({ isOpen, onClose }: Props) {
  const { currentUser, ministryTeams, submitMinistryReport } = useChurch();

  const [ministryId, setMinistryId] = useState(currentUser.ministryId || ministryTeams[0]?.id || '');
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportTitle, setReportTitle] = useState('');
  const [totalAttendance, setTotalAttendance] = useState<number>(0);
  const [firstTimers, setFirstTimers] = useState<number>(0);
  const [offeringAmount, setOfferingAmount] = useState<number>(0);
  const [activitiesSummary, setActivitiesSummary] = useState('');
  const [spiritualHighlights, setSpiritualHighlights] = useState('');
  const [upcomingPrograms, setUpcomingPrograms] = useState('');
  const [challengesAndRequests, setChallengesAndRequests] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMinistryReport({
      ministryId,
      meetingDate,
      reportTitle,
      totalAttendance: Number(totalAttendance),
      firstTimers: Number(firstTimers),
      offeringAmount: Number(offeringAmount),
      activitiesSummary,
      spiritualHighlights,
      upcomingPrograms,
      challengesAndRequests,
    });

    setSuccessMsg(true);
    setTimeout(() => {
      setSuccessMsg(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 overflow-y-auto backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
              <Heart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Submit Fellowship Ministry Report
              </h3>
              <p className="text-xs text-slate-400">
                Men of Faith, 31st Ladies, or Children&apos;s Church meeting highlights
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successMsg ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Ministry Report Submitted!</h4>
            <p className="text-sm text-slate-500 mt-1">
              Your fellowship report is routed directly to the Resident Pastor.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            
            {/* Ministry & Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Fellowship Ministry *
                </label>
                {currentUser.role === 'ministry_leader' ? (
                  /* Ministry Leaders are locked to their assigned fellowship */
                  <div className="w-full px-3 py-2 text-sm rounded-lg border border-teal-300 bg-teal-50 text-teal-900 font-semibold flex items-center gap-2">
                    <span>🤝</span>
                    <span>{ministryTeams.find((m) => m.id === currentUser.ministryId)?.name ?? currentUser.ministryName ?? 'Your Ministry'}</span>
                  </div>
                ) : (
                  <select
                    value={ministryId}
                    onChange={(e) => setMinistryId(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0a719e]"
                    required
                  >
                    {ministryTeams.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Meeting Date *
                </label>
                <input
                  type="date"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0a719e]"
                  required
                />
              </div>
            </div>

            {/* Title / Theme */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Meeting Theme or Event Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Monthly Men Breakfast & Wealth Summit / Daughters of Zion Vigil"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0a719e]"
                required
              />
            </div>

            {/* Attendance & Offering */}
            <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Total Attendance
                </label>
                <input
                  type="number"
                  min="0"
                  value={totalAttendance}
                  onChange={(e) => setTotalAttendance(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  First Timers
                </label>
                <input
                  type="number"
                  min="0"
                  value={firstTimers}
                  onChange={(e) => setFirstTimers(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Offering (₦)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={offeringAmount}
                  onChange={(e) => setOfferingAmount(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 bg-white"
                />
              </div>
            </div>

            {/* Summary & Highlights */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Meeting Activities Summary *
              </label>
              <textarea
                rows={3}
                placeholder="Provide details on teaching, discussions, welfare packages, activities carried out..."
                value={activitiesSummary}
                onChange={(e) => setActivitiesSummary(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0a719e]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Spiritual Highlights &amp; Testimonies
              </label>
              <textarea
                rows={2}
                placeholder="Spiritual impartation, healings, declarations..."
                value={spiritualHighlights}
                onChange={(e) => setSpiritualHighlights(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0a719e]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Upcoming Programs &amp; Next Meeting
                </label>
                <textarea
                  rows={2}
                  placeholder="Dates, venue, key targets..."
                  value={upcomingPrograms}
                  onChange={(e) => setUpcomingPrograms(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0a719e]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Pastoral Requests &amp; Support
                </label>
                <textarea
                  rows={2}
                  placeholder="Logistics, bus support, hall approval..."
                  value={challengesAndRequests}
                  onChange={(e) => setChallengesAndRequests(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0a719e]"
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#0a719e] hover:bg-[#085a7e] text-white font-semibold text-sm shadow-md transition"
              >
                Submit Ministry Report
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
