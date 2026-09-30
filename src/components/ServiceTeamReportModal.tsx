'use client';

import React, { useState, useEffect } from 'react';
import { useChurch } from '@/lib/store';
import { ServiceType, ServiceTeamReport } from '@/lib/types';
import { X, Wrench, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editingReport?: ServiceTeamReport | null;
}

export default function ServiceTeamReportModal({ isOpen, onClose, editingReport }: Props) {
  const { currentUser, serviceTeams, submitServiceTeamReport, editServiceTeamReport } = useChurch();

  const isEditing = Boolean(editingReport);

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

  useEffect(() => {
    if (editingReport) {
      setTeamId(editingReport.teamId || '');
      setServiceDate(editingReport.serviceDate || new Date().toISOString().split('T')[0]);
      setServiceType(editingReport.serviceType || 'first_service');
      setRosterPresentCount(editingReport.rosterPresentCount || 0);
      setRosterAbsentCount(editingReport.rosterAbsentCount || 0);
      setTasksCompleted(editingReport.tasksCompleted || '');
      setEquipmentStatus(editingReport.equipmentStatus || '');
      setChallengesEncountered(editingReport.challengesEncountered || '');
      setUrgentNeeds(editingReport.urgentNeeds || '');
    } else {
      setTeamId(currentUser.serviceTeamId || serviceTeams[0]?.id || '');
      setServiceDate(new Date().toISOString().split('T')[0]);
      setServiceType('first_service');
      setRosterPresentCount(15);
      setRosterAbsentCount(2);
      setTasksCompleted('');
      setEquipmentStatus('');
      setChallengesEncountered('');
      setUrgentNeeds('');
    }
  }, [editingReport, isOpen, currentUser, serviceTeams]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      teamId,
      serviceDate,
      serviceType,
      rosterPresentCount: Number(rosterPresentCount),
      rosterAbsentCount: Number(rosterAbsentCount),
      tasksCompleted,
      equipmentStatus,
      challengesEncountered,
      urgentNeeds,
    };

    if (isEditing && editingReport) {
      editServiceTeamReport(editingReport.id, payload);
    } else {
      submitServiceTeamReport(payload);
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
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isEditing ? 'Edit Service Team Operational Report' : 'Submit Service Team Operational Report'}
              </h3>
              <p className="text-xs text-slate-400">
                Duty roster attendance, equipment condition &amp; service tasks
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
              {isEditing ? 'Report Successfully Updated!' : 'Service Team Report Submitted!'}
            </h4>
            <p className="text-sm text-slate-500 mt-1">
              {isEditing ? 'Your changes have been saved.' : 'Your unit report is routed to Associate Pastor (Service Teams) and Resident Pastor.'}
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
                {currentUser.role === 'service_team_leader' ? (
                  /* Service Team Leaders are locked to their assigned team */
                  <div className="w-full px-3 py-2 text-sm rounded-lg border border-blue-300 bg-blue-50 text-blue-900 font-semibold flex items-center gap-2">
                    <span>🎵</span>
                    <span>{serviceTeams.find((t) => t.id === currentUser.serviceTeamId)?.name ?? currentUser.serviceTeamName ?? 'Your Team'}</span>
                  </div>
                ) : (
                  <select
                    value={teamId}
                    onChange={(e) => setTeamId(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {serviceTeams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Service Date *
                </label>
                <input
                  type="date"
                  value={serviceDate}
                  onChange={(e) => setServiceDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="connect_to_life_first">Connect to Life Service (1st Service)</option>
                <option value="connect_to_life_second">Connect to Life Service (2nd Service)</option>
                <option value="connect_to_life_combined">Connect to Life Service (Combined)</option>
                <option value="prayer_and_communion">Prayer &amp; Communion Service (Last Sunday of Month)</option>
                <option value="c3_midweek">Midweek Service (Held in C3s)</option>
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
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-md transition"
              >
                {isEditing ? 'Save Changes' : 'Submit Team Report'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
