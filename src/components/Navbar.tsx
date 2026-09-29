'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useChurch } from '@/lib/store';
import { UserRole } from '@/lib/types';
import {
  ChevronDown,
  RotateCcw,
  Download,
  CheckCircle2,
  Heart,
  Sparkles,
} from 'lucide-react';
import { exportConsolidatedPastoralBriefPDF } from '@/lib/exportUtils';

export default function Navbar() {
  const { currentUser, allUsers, switchUser, metrics, c3Reports, serviceTeamReports, ministryReports, resetToSampleData } = useChurch();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'resident_pastor':
        return { label: 'Resident Pastor', bg: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'associate_pastor_c3':
        return { label: 'Assoc. Pastor (C3s)', bg: 'bg-sky-100 text-sky-900 border-sky-300' };
      case 'associate_pastor_service_teams':
        return { label: 'Assoc. Pastor (Teams)', bg: 'bg-indigo-100 text-indigo-900 border-indigo-300' };
      case 'c3_minister':
        return { label: 'C3 Minister', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      case 'service_team_leader':
        return { label: 'Service Team Leader', bg: 'bg-purple-100 text-purple-900 border-purple-300' };
      case 'ministry_leader':
        return { label: 'Ministry Leader', bg: 'bg-rose-100 text-rose-900 border-rose-300' };
      default:
        return { label: 'Member', bg: 'bg-slate-100 text-slate-800 border-slate-300' };
    }
  };

  const badge = getRoleBadge(currentUser.role);

  const handleExportBrief = () => {
    exportConsolidatedPastoralBriefPDF(metrics, c3Reports, serviceTeamReports, ministryReports);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0a719e] border-b border-[#085a7e] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Official Ministry Logo & Branch Identity */}
          <div className="flex items-center gap-3.5">
            <div className="bg-white/95 rounded-xl p-1.5 shadow-sm ring-1 ring-white/30 flex items-center justify-center shrink-0">
              <Image
                src="/logo.svg"
                alt="Christ Family Ministries Logo"
                width={160}
                height={38}
                className="h-9 w-auto object-contain"
                priority
              />
            </div>

            <div className="hidden sm:block border-l border-white/20 pl-3">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base md:text-lg tracking-tight text-white drop-shadow-xs">
                  CHRIST FAMILY CENTRE
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 text-yellow-300 px-2 py-0.5 rounded-full border border-yellow-300/40">
                  Makurdi
                </span>
              </div>
              <p className="text-[11px] text-sky-100 font-light tracking-wide flex items-center gap-1.5">
                <span>Raising a Happy & Successful People</span>
                <span className="text-yellow-300">•</span>
                <span className="italic font-medium text-yellow-200">Love is King</span>
              </p>
            </div>
          </div>

          {/* Right Action Bar: Quick Pastoral Export & Role Switcher */}
          <div className="flex items-center gap-3">
            
            {/* Quick Export Brief (visible to Pastors) */}
            {(currentUser.role === 'resident_pastor' || currentUser.role.startsWith('associate_pastor')) && (
              <button
                onClick={handleExportBrief}
                className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-xs transition shadow-sm"
                title="Download Executive Pastoral PDF Brief"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Pastoral Brief (PDF)</span>
              </button>
            )}

            {/* Quick Switch Role Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-left transition focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
              >
                <div className="w-8 h-8 rounded-full bg-white text-[#0a719e] flex items-center justify-center font-bold text-sm shadow-xs">
                  {currentUser.fullName.charAt(0)}
                </div>
                <div className="hidden lg:block">
                  <div className="text-xs font-semibold text-white leading-tight flex items-center gap-1.5">
                    {currentUser.fullName}
                    <ChevronDown className="w-3 h-3 text-sky-200" />
                  </div>
                  <span className={`text-[10px] font-medium px-1.5 py-0.2 rounded border ${badge.bg}`}>
                    {badge.label}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-sky-200 lg:hidden" />
              </button>

              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 text-slate-800 divide-y divide-slate-100 animate-fadeIn">
                    <div className="px-4 py-2 bg-sky-50/60">
                      <p className="text-xs font-bold text-[#0a719e] uppercase tracking-wider">
                        Interactive Role Switcher
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Test roles, permissions & approval workflows
                      </p>
                    </div>

                    <div className="max-h-72 overflow-y-auto py-1">
                      {allUsers.map((u) => {
                        const isCurrent = u.id === currentUser.id;
                        const roleInfo = getRoleBadge(u.role);
                        return (
                          <button
                            key={u.id}
                            onClick={() => {
                              switchUser(u.id);
                              setDropdownOpen(false);
                            }}
                            className={`w-full px-4 py-2 text-left flex items-start gap-2.5 hover:bg-sky-50/70 transition ${
                              isCurrent ? 'bg-sky-50 font-medium' : ''
                            }`}
                          >
                            <div className="w-7 h-7 rounded-full bg-[#139fdd]/20 text-[#0a719e] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                              {u.fullName.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-900 truncate">
                                  {u.fullName}
                                </span>
                                {isCurrent && (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0a719e] shrink-0" />
                                )}
                              </div>
                              <span className={`inline-block text-[9px] font-semibold px-1.5 py-0.5 rounded border mt-0.5 ${roleInfo.bg}`}>
                                {roleInfo.label}
                              </span>
                              {(u.c3Name || u.serviceTeamName || u.ministryName) && (
                                <p className="text-[10px] text-slate-500 truncate mt-0.5">
                                  {u.c3Name || u.serviceTeamName || u.ministryName}
                                </p>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="p-2 bg-slate-50 flex items-center justify-between">
                      <button
                        onClick={() => {
                          resetToSampleData();
                          setDropdownOpen(false);
                        }}
                        className="text-[11px] font-medium text-slate-600 hover:text-red-600 flex items-center gap-1 transition px-2 py-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Reset Mock Data
                      </button>
                      <span className="text-[10px] text-slate-400">
                        Makurdi Branch
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
