'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useChurch } from '@/lib/store';
import { UserRole } from '@/lib/types';
import {
  Download,
  LogOut,
  Settings,
  ChevronDown,
  Shield,
  User,
} from 'lucide-react';
import { exportConsolidatedPastoralBriefPDF } from '@/lib/exportUtils';
import NotificationCenter from './NotificationCenter';
import { useRouter } from 'next/navigation';

interface NavbarProps {
  activeTab?: string;
  onSelectTab?: (tab: 'overview' | 'c3' | 'service_teams' | 'ministries' | 'approvals' | 'exports' | 'sunday_service' | 'activity' | 'settings') => void;
}

export default function Navbar({ activeTab, onSelectTab }: NavbarProps) {
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

  const isPastor = currentUser.role === 'resident_pastor' || currentUser.role.startsWith('associate_pastor');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
            {isPastor && (
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

            {/* User Profile with Interactive Dropdown (Settings & Sign Out under profile) */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-left transition cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-white/40"
                aria-expanded={profileDropdownOpen}
                aria-label="User profile and settings menu"
              >
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
                      <span className="text-[10px] text-sky-100 font-light truncate max-w-[120px]">
                        • {currentUser.c3Name || currentUser.serviceTeamName || currentUser.ministryName}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-white/70 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu directly under user profile */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 text-slate-900 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* User Profile Summary Header */}
                  <div className="px-4 py-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-[#0a719e]/10 text-[#0a719e] flex items-center justify-center font-black text-base shrink-0">
                        {currentUser.fullName.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 truncate">{currentUser.fullName}</p>
                        <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                        <div className="mt-1">
                          <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                            {badge.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Settings Option under User Profile */}
                  <div className="py-1">
                    {isPastor && (
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onSelectTab?.('settings');
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-xs font-semibold transition ${
                          activeTab === 'settings'
                            ? 'bg-sky-50 text-[#0a719e]'
                            : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-sky-100 text-[#0a719e] flex items-center justify-center shrink-0">
                          <Settings className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-slate-900">Settings</p>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-100 text-sky-800">Admin</span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-normal truncate">Users, Leaders, Units &amp; Roles</p>
                        </div>
                      </button>
                    )}

                    {/* Divider */}
                    <div className="my-1 border-t border-slate-100" />

                    {/* Sign Out Option */}
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                    >
                      <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                        <LogOut className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-rose-700">Sign Out</p>
                        <p className="text-[11px] text-slate-400 font-normal">End your current session</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
