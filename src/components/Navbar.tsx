'use client';

import React from 'react';
import Image from 'next/image';
import { useChurch } from '@/lib/store';
import { UserRole } from '@/lib/types';
import {
  Download,
  LogOut,
} from 'lucide-react';
import { exportConsolidatedPastoralBriefPDF } from '@/lib/exportUtils';
import NotificationCenter from './NotificationCenter';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const {
    currentUser,
    metrics,
    c3Reports,
    serviceTeamReports,
    ministryReports,
    logout,
  } = useChurch();
  const router = useRouter();

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

  const badge = getRoleBadge(currentUser.role);

  const handleExportBrief = () => {
    exportConsolidatedPastoralBriefPDF(metrics, c3Reports, serviceTeamReports, ministryReports);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
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
                <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-300/40">
                  Makurdi
                </span>
              </div>
              <p className="text-[11px] text-sky-100 font-light tracking-wide flex items-center gap-1.5">
                <span>Raising a Happy &amp; Successful People</span>
                <span className="text-sky-300">•</span>
                <span className="italic font-medium text-white">Love is King</span>
              </p>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2.5">

            {/* Quick Export Brief (visible to Pastors) */}
            {(currentUser.role === 'resident_pastor' || currentUser.role.startsWith('associate_pastor')) && (
              <button
                onClick={handleExportBrief}
                className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-sm"
                title="Download Executive Pastoral PDF Brief"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Pastoral Brief</span>
              </button>
            )}

            {/* Notification Bell */}
            <NotificationCenter />

            {/* Current Logged In User Profile (Role switcher removed for production) */}
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-left">
              <div className="w-8 h-8 rounded-full bg-white text-[#0a719e] flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                {currentUser.fullName.charAt(0)}
              </div>
              <div className="hidden md:block">
                <div className="text-xs font-semibold text-white leading-tight">
                  {currentUser.fullName}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className={`text-[10px] font-medium px-1.5 py-0.2 rounded border ${badge.bg}`}>
                    {badge.label}
                  </span>
                  {(currentUser.c3Name || currentUser.serviceTeamName || currentUser.ministryName) && (
                    <span className="text-[10px] text-sky-100 font-light">
                      • {currentUser.c3Name || currentUser.serviceTeamName || currentUser.ministryName}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Universal Sign Out button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600/30 hover:bg-rose-600 border border-rose-400/40 text-rose-100 hover:text-white font-semibold text-xs transition shadow-xs"
              title="Sign Out of Portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
}
