'use client';

import React, { useState } from 'react';
import { useChurch } from '@/lib/store';
import { ServiceType } from '@/lib/types';
import { X, Wrench, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ServiceTeamReportModal({ isOpen, onClose }: Props) {
  const { currentUser, serviceTeams, submitServiceTeamReport } = useChurch();

  const [teamId, setTeamId] = useState(currentUser.serviceTeamId || serviceTeams[0]?.id || '');
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [serviceType, setServiceType] = useState<ServiceType>('first_service');
  const [rosterPresentCount, setRosterPresentCount] = useState<number>(15);
  const [rosterAbsentCount, setRosterAbsentCount] = useState<number>(2);
  const [tasksCompleted, setTasksCompleted] = useState('');
  const [equipmentStatus, setEquipmentStatus] = useState('');
  const [challengesEncountered, setChallengesEncountered] = useState('');
  const [urgentNeeds, setUrgentNeeds] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitServiceTeamReport({
      teamId,
      serviceDate,
      serviceType,
      rosterPresentCount: Number(rosterPresentCount),
      rosterAbsentCount: Number(rosterAbsentCount),
      tasksCompleted,
      equipmentStatus,
      challengesEncountered,
      urgentNeeds,
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
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Submit Service Team Operational Report
              </h3>
              <p className="text-xs text-slate-400">
                Duty roster attendance, equipment condition & service tasks
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
            <h4 className="text-lg font-bold text-slate-900">Service Team Report Submitted!</h4>
            <p className="text-sm text-slate-500 mt-1">
              Your unit report is routed to Associate Pastor (Service Teams) and Resident Pastor.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            
            {/* Team & Service Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Service Team *
                </label>
                <select
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  {serviceTeams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Service Date *
                </label>
                <input
                  type="date"
                  value={serviceDate}
                  onChange={(e) => setServiceDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Service Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Service Type *
              </label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value as ServiceType)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="first_service">1st Sunday Service</option>
                <option value="second_service">2nd Sunday Service</option>
                <option value="combined_service">Combined Sunday Celebration</option>
                <option value="midweek_service">Wednesday Midweek Service</option>
                <option value="special_meeting">Special Conference / Vigil</option>
              </select>
            </div>

            {/* Duty Attendance Roster */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                Team Member Attendance on Duty
              </span>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Members Present on Duty
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={rosterPresentCount}
                    onChange={(e) => setRosterPresentCount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Members Absent / Excused
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={rosterAbsentCount}
                    onChange={(e) => setRosterAbsentCount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Tasks Accomplished */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Tasks & Operations Accomplished *
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Set up stage acoustics, managed seating of 700 congregants, coordinated offering collection..."
                value={tasksCompleted}
                onChange={(e) => setTasksCompleted(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {/* Equipment & Gear Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Equipment & Facilities Condition *
              </label>
              <textarea
                rows={2}
                placeholder="Microphones, audio mixers, cameras, air conditioners, generator, badges, communion trays..."
                value={equipmentStatus}
                onChange={(e) => setEquipmentStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {/* Challenges & Urgent Needs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Operational Bottlenecks / Challenges
                </label>
                <textarea
                  rows={2}
                  placeholder="Any delays, crowding, sound hitches..."
                  value={challengesEncountered}
                  onChange={(e) => setChallengesEncountered(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Immediate Procurement / Support Needs
                </label>
                <textarea
                  rows={2}
                  placeholder="Cables, batteries, visitor cards, cleaning supplies..."
                  value={urgentNeeds}
                  onChange={(e) => setUrgentNeeds(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-md transition"
              >
                Submit Team Report
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
