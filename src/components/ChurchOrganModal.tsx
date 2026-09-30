'use client';

import React, { useState, useEffect } from 'react';
import { useChurch } from '@/lib/store';
import { C3Centre, ServiceTeam, MinistryTeam } from '@/lib/types';
import { Users, Wrench, Heart, X, CheckCircle2 } from 'lucide-react';

export type OrganType = 'c3' | 'service_team' | 'ministry';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  organType: OrganType;
  editingItem?: C3Centre | ServiceTeam | MinistryTeam | null;
}

export default function ChurchOrganModal({
  isOpen,
  onClose,
  organType,
  editingItem,
}: Props) {
  const {
    addC3Centre,
    editC3Centre,
    addServiceTeam,
    editServiceTeam,
    addMinistryTeam,
    editMinistryTeam,
  } = useChurch();

  // C3 Fields
  const [c3Name, setC3Name] = useState('');
  const [zone, setZone] = useState('Nyiman');
  const [meetingAddress, setMeetingAddress] = useState('');
  const [meetingDay, setMeetingDay] = useState('Wednesday');
  const [meetingTime, setMeetingTime] = useState('5:30 PM');
  const [hostName, setHostName] = useState('');
  const [c3MinisterName, setC3MinisterName] = useState('');

  // Service Team Fields
  const [teamName, setTeamName] = useState('');
  const [teamCode, setTeamCode] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [teamLeaderName, setTeamLeaderName] = useState('');

  // Ministry Fields
  const [ministryName, setMinistryName] = useState('');
  const [ministryCode, setMinistryCode] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [ministryDescription, setMinistryDescription] = useState('');
  const [ministryLeaderName, setMinistryLeaderName] = useState('');

  const [successMsg, setSuccessMsg] = useState(false);

  const isEditing = Boolean(editingItem);

  useEffect(() => {
    if (editingItem) {
      if (organType === 'c3') {
        const item = editingItem as C3Centre;
        setC3Name(item.name || '');
        setZone(item.zone || 'Nyiman');
        setMeetingAddress(item.meetingAddress || '');
        setMeetingDay(item.meetingDay || 'Wednesday');
        setMeetingTime(item.meetingTime || '5:30 PM');
        setHostName(item.hostName || '');
        setC3MinisterName(item.ministerName || '');
      } else if (organType === 'service_team') {
        const item = editingItem as ServiceTeam;
        setTeamName(item.name || '');
        setTeamCode(item.code || '');
        setTeamDescription(item.description || '');
        setTeamLeaderName(item.leaderName || '');
      } else if (organType === 'ministry') {
        const item = editingItem as MinistryTeam;
        setMinistryName(item.name || '');
        setMinistryCode(item.code || '');
        setTargetAudience(item.targetAudience || '');
        setMinistryDescription(item.description || '');
        setMinistryLeaderName(item.leaderName || '');
      }
    } else {
      // Reset
      setC3Name('');
      setZone('Nyiman');
      setMeetingAddress('');
      setMeetingDay('Wednesday');
      setMeetingTime('5:30 PM');
      setHostName('');
      setC3MinisterName('');
      setTeamName('');
      setTeamCode('');
      setTeamDescription('');
      setTeamLeaderName('');
      setMinistryName('');
      setMinistryCode('');
      setTargetAudience('');
      setMinistryDescription('');
      setMinistryLeaderName('');
    }
  }, [editingItem, organType, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (organType === 'c3') {
      if (isEditing && editingItem) {
        editC3Centre(editingItem.id, {
          name: c3Name,
          zone,
          meetingAddress,
          meetingDay,
          meetingTime,
          hostName,
          ministerName: c3MinisterName,
        });
      } else {
        addC3Centre({
          name: c3Name,
          zone,
          meetingAddress,
          meetingDay,
          meetingTime,
          hostName,
          ministerName: c3MinisterName,
          isActive: true,
        });
      }
    } else if (organType === 'service_team') {
      if (isEditing && editingItem) {
        editServiceTeam(editingItem.id, {
          name: teamName,
          code: teamCode || `team-${Date.now()}`,
          description: teamDescription,
          leaderName: teamLeaderName,
        });
      } else {
        addServiceTeam({
          name: teamName,
          code: teamCode || `team-${Date.now()}`,
          description: teamDescription,
          leaderName: teamLeaderName,
          isActive: true,
        });
      }
    } else if (organType === 'ministry') {
      if (isEditing && editingItem) {
        editMinistryTeam(editingItem.id, {
          name: ministryName,
          code: ministryCode || `min-${Date.now()}`,
          targetAudience,
          description: ministryDescription,
          leaderName: ministryLeaderName,
        });
      } else {
        addMinistryTeam({
          name: ministryName,
          code: ministryCode || `min-${Date.now()}`,
          targetAudience,
          description: ministryDescription,
          leaderName: ministryLeaderName,
          isActive: true,
        });
      }
    }

    setSuccessMsg(true);
    setTimeout(() => {
      setSuccessMsg(false);
      onClose();
    }, 1200);
  };

  const getTitle = () => {
    if (organType === 'c3') {
      return isEditing ? 'Edit C3 Community Church' : 'Add New C3 Community Church';
    }
    if (organType === 'service_team') {
      return isEditing ? 'Edit Service Team' : 'Add New Service Team';
    }
    return isEditing ? 'Edit Fellowship Ministry' : 'Add New Fellowship Ministry';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 overflow-y-auto backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              {organType === 'c3' ? (
                <Users className="w-4 h-4" />
              ) : organType === 'service_team' ? (
                <Wrench className="w-4 h-4" />
              ) : (
                <Heart className="w-4 h-4" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{getTitle()}</h3>
              <p className="text-xs text-slate-400">Christ Family Centre Makurdi Structure</p>
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
              {isEditing ? 'Changes Saved Successfully!' : 'Created Successfully!'}
            </h4>
            <p className="text-sm text-slate-500 mt-1">
              The church organ has been updated in the system directory.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            {/* C3 Centre Fields */}
            {organType === 'c3' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    C3 Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Modern Market C3"
                    value={c3Name}
                    onChange={(e) => setC3Name(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Makurdi Zone *
                    </label>
                    <select
                      value={zone}
                      onChange={(e) => setZone(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Nyiman">Nyiman</option>
                      <option value="George Akume Way">George Akume Way</option>
                      <option value="North Bank">North Bank</option>
                      <option value="Gyado Villa">Gyado Villa</option>
                      <option value="Welfare Quarters">Welfare Quarters</option>
                      <option value="Old GRA">Old GRA</option>
                      <option value="Wurukum">Wurukum</option>
                      <option value="High Level">High Level</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Minister in Charge *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Minister Faith Terungwa"
                      value={c3MinisterName}
                      onChange={(e) => setC3MinisterName(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Meeting Physical Address *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Behind Police Station, Nyiman Layout, Makurdi"
                    value={meetingAddress}
                    onChange={(e) => setMeetingAddress(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Meeting Day
                    </label>
                    <input
                      type="text"
                      value={meetingDay}
                      onChange={(e) => setMeetingDay(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Time
                    </label>
                    <input
                      type="text"
                      value={meetingTime}
                      onChange={(e) => setMeetingTime(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Host Name
                    </label>
                    <input
                      type="text"
                      placeholder="Bro. John Doe"
                      value={hostName}
                      onChange={(e) => setHostName(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Service Team Fields */}
            {organType === 'service_team' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Team Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Technical & Sound"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Leader Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bro. Daniel Aondo"
                      value={teamLeaderName}
                      onChange={(e) => setTeamLeaderName(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Identifier Code
                    </label>
                    <input
                      type="text"
                      placeholder="team-tech"
                      value={teamCode}
                      onChange={(e) => setTeamCode(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Description & Duties
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Overview of unit operational scope during church services"
                    value={teamDescription}
                    onChange={(e) => setTeamDescription(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            {/* Ministry Team Fields */}
            {organType === 'ministry' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Ministry Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Singles & Young Adults Fellowship"
                    value={ministryName}
                    onChange={(e) => setMinistryName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Leader Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Deaconess Ruth Bem"
                      value={ministryLeaderName}
                      onChange={(e) => setMinistryLeaderName(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Target Audience
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Men, Women, Youths"
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Description & Mission
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Focus and activities of the fellowship"
                    value={ministryDescription}
                    onChange={(e) => setMinistryDescription(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </>
            )}

            {/* Actions */}
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
                {isEditing ? 'Save Changes' : 'Create Record'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
