'use client';

import React, { useState, useEffect } from 'react';
import { useChurch } from '@/lib/store';
import { C3Report } from '@/lib/types';
import { X, Users, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editingReport?: C3Report | null;
}

export default function C3ReportModal({ isOpen, onClose, editingReport }: Props) {
  const { currentUser, c3Centres, submitC3Report, editC3Report } = useChurch();

  const isEditing = Boolean(editingReport);

  const [c3Id, setC3Id] = useState(currentUser.c3Id || c3Centres[0]?.id || '');
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().split('T')[0]);
  const [topicTaught, setTopicTaught] = useState('');
  const [maleAttendance, setMaleAttendance] = useState<number>(0);
  const [femaleAttendance, setFemaleAttendance] = useState<number>(0);
  const [childrenAttendance, setChildrenAttendance] = useState<number>(0);
  const [firstTimers, setFirstTimers] = useState<number>(0);
  const [newConverts, setNewConverts] = useState<number>(0);
  const [offeringAmount, setOfferingAmount] = useState<number>(0);
  const [tithesAmount, setTithesAmount] = useState<number>(0);
  const [prayerRequests, setPrayerRequests] = useState('');
  const [testimonies, setTestimonies] = useState('');
  const [challengesEncountered, setChallengesEncountered] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    if (editingReport) {
      setC3Id(editingReport.c3Id || '');
      setMeetingDate(editingReport.meetingDate || new Date().toISOString().split('T')[0]);
      setTopicTaught(editingReport.topicTaught || '');
      setMaleAttendance(editingReport.maleAttendance || 0);
      setFemaleAttendance(editingReport.femaleAttendance || 0);
      setChildrenAttendance(editingReport.childrenAttendance || 0);
      setFirstTimers(editingReport.firstTimers || 0);
      setNewConverts(editingReport.newConverts || 0);
      setOfferingAmount(editingReport.offeringAmount || 0);
      setTithesAmount(editingReport.tithesAmount || 0);
      setPrayerRequests(editingReport.prayerRequests || '');
      setTestimonies(editingReport.testimonies || '');
      setChallengesEncountered(editingReport.challengesEncountered || '');
    } else {
      setC3Id(currentUser.c3Id || c3Centres[0]?.id || '');
      setMeetingDate(new Date().toISOString().split('T')[0]);
      setTopicTaught('');
      setMaleAttendance(0);
      setFemaleAttendance(0);
      setChildrenAttendance(0);
      setFirstTimers(0);
      setNewConverts(0);
      setOfferingAmount(0);
      setTithesAmount(0);
      setPrayerRequests('');
      setTestimonies('');
      setChallengesEncountered('');
    }
  }, [editingReport, isOpen, currentUser, c3Centres]);

  if (!isOpen) return null;

  const totalAttendance = Number(maleAttendance) + Number(femaleAttendance) + Number(childrenAttendance);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      c3Id,
      meetingDate,
      topicTaught,
      maleAttendance: Number(maleAttendance),
      femaleAttendance: Number(femaleAttendance),
      childrenAttendance: Number(childrenAttendance),
      firstTimers: Number(firstTimers),
      newConverts: Number(newConverts),
      offeringAmount: Number(offeringAmount),
      tithesAmount: Number(tithesAmount),
      prayerRequests,
      testimonies,
      challengesEncountered,
    };

    if (isEditing && editingReport) {
      editC3Report(editingReport.id, payload);
    } else {
      submitC3Report(payload);
    }

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
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isEditing ? 'Edit Weekly C3 Community Church Report' : 'Submit Weekly C3 Community Church Report'}
              </h3>
              <p className="text-xs text-slate-400">
                Cell fellowship attendance, souls, giving &amp; pastoral notes
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
            <h4 className="text-lg font-bold text-slate-900">
              {isEditing ? 'Report Successfully Updated!' : 'Report Successfully Submitted!'}
            </h4>
            <p className="text-sm text-slate-500 mt-1">
              {isEditing ? 'Your changes have been saved to the reporting records.' : 'Your C3 report has been queued for Pastoral review.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            
            {/* Center & Date Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  C3 Community Church *
                </label>
                {currentUser.role === 'c3_minister' ? (
                  /* C3 Ministers are locked to their assigned C3 */
                  <div className="w-full px-3 py-2 text-sm rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-900 font-semibold flex items-center gap-2">
                    <span>⛪</span>
                    <span>{c3Centres.find((c) => c.id === currentUser.c3Id)?.name ?? currentUser.c3Name ?? 'Your C3'}</span>
                  </div>
                ) : (
                  <select
                    value={c3Id}
                    onChange={(e) => setC3Id(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  >
                    {c3Centres.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.zone})
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
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            {/* Word / Topic Taught */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Word Theme / Topic Taught *
              </label>
              <input
                type="text"
                placeholder="e.g. Walking in Supernatural Dominion"
                value={topicTaught}
                onChange={(e) => setTopicTaught(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            {/* Attendance Breakdown (Men, Women, Children -> Total Auto Calculated) */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Attendance Breakdown
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Total: {totalAttendance} Attendees
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Men
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={maleAttendance}
                    onChange={(e) => setMaleAttendance(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Women
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={femaleAttendance}
                    onChange={(e) => setFemaleAttendance(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Children
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={childrenAttendance}
                    onChange={(e) => setChildrenAttendance(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Soul Winning Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  First Timers Welcomed
                </label>
                <input
                  type="number"
                  min="0"
                  value={firstTimers}
                  onChange={(e) => setFirstTimers(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  New Converts (Souls Saved)
                </label>
                <input
                  type="number"
                  min="0"
                  value={newConverts}
                  onChange={(e) => setNewConverts(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Financials (Offering & Tithe in Naira) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-emerald-50/50 p-4 rounded-xl border border-emerald-200/60">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  C3 Offering (₦ Naira)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={offeringAmount}
                  onChange={(e) => setOfferingAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Tithes Remitted (₦ Naira)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={tithesAmount}
                  onChange={(e) => setTithesAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Testimonies & Prayer Requests */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Testimonies Shared
                </label>
                <textarea
                  rows={2}
                  placeholder="Record miraculous healings, breakthroughs, or answers to prayer..."
                  value={testimonies}
                  onChange={(e) => setTestimonies(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Urgent Prayer Requests &amp; Hospital Follow-ups
                </label>
                <textarea
                  rows={2}
                  placeholder="Members needing pastoral visitation, sick members..."
                  value={prayerRequests}
                  onChange={(e) => setPrayerRequests(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Challenges or Center Needs
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Space constraints, power supply, study guides..."
                  value={challengesEncountered}
                  onChange={(e) => setChallengesEncountered(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-md transition"
              >
                {isEditing ? 'Save Changes' : 'Submit C3 Report'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
