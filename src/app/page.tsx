'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useChurch } from '@/lib/store';
import {
  C3Report,
  ServiceTeamReport,
  MinistryReport,
  ReportStatus,
} from '@/lib/types';
import {
  Users,
  Wrench,
  Heart,
  TrendingUp,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Download,
  Filter,
  Search,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Sparkles,
  MapPin,
  Flame,
  Award,
  BookOpen,
} from 'lucide-react';
import { AttendanceTrendChart, C3ZoneBreakdownChart } from '@/components/DashboardCharts';
import C3ReportModal from '@/components/C3ReportModal';
import ServiceTeamReportModal from '@/components/ServiceTeamReportModal';
import MinistryReportModal from '@/components/MinistryReportModal';
import ReviewModal from '@/components/ReviewModal';
import {
  exportC3ReportsToPDF,
  exportC3ReportsToExcel,
  exportServiceTeamReportsToPDF,
  exportServiceTeamReportsToExcel,
  exportConsolidatedPastoralBriefPDF,
} from '@/lib/exportUtils';

type ActiveTab = 'overview' | 'c3' | 'service_teams' | 'ministries' | 'approvals' | 'exports';

export default function ChurchDashboard() {
  const {
    currentUser,
    metrics,
    c3Centres,
    serviceTeams,
    ministryTeams,
    c3Reports,
    serviceTeamReports,
    ministryReports,
  } = useChurch();

  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  
  // Modals state
  const [c3ModalOpen, setC3ModalOpen] = useState(false);
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [ministryModalOpen, setMinistryModalOpen] = useState(false);
  const [reviewModalData, setReviewModalData] = useState<{
    isOpen: boolean;
    type: 'c3' | 'service_team' | 'ministry';
    report: C3Report | ServiceTeamReport | MinistryReport | null;
  }>({
    isOpen: false,
    type: 'c3',
    report: null,
  });

  // Filter States
  const [c3ZoneFilter, setC3ZoneFilter] = useState('All');
  const [serviceTeamFilter, setServiceTeamFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const isPastor = currentUser.role === 'resident_pastor' || currentUser.role.startsWith('associate_pastor');
  const isResidentPastor = currentUser.role === 'resident_pastor';

  // Helper status color
  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case 'approved_by_resident_pastor':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Approved
          </span>
        );
      case 'reviewed_by_associate':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <Clock className="w-3 h-3 text-blue-600" />
            Reviewed by Associate
          </span>
        );
      case 'revision_requested':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            Needs Revision
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            Pending Review
          </span>
        );
    }
  };

  // Filtered reports
  const filteredC3Reports = c3Reports.filter((r) => {
    const matchesZone = c3ZoneFilter === 'All' || r.zone === c3ZoneFilter;
    const matchesSearch =
      r.c3Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.topicTaught.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.submittedByName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesZone && matchesSearch;
  });

  const filteredTeamReports = serviceTeamReports.filter((r) => {
    const matchesTeam = serviceTeamFilter === 'All' || r.teamName === serviceTeamFilter;
    const matchesSearch =
      r.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.tasksCompleted.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.submittedByName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTeam && matchesSearch;
  });

  const pendingApprovalReports = [
    ...c3Reports
      .filter((r) => r.status === 'submitted' || r.status === 'reviewed_by_associate')
      .map((r) => ({ ...r, itemType: 'c3' as const })),
    ...serviceTeamReports
      .filter((r) => r.status === 'submitted' || r.status === 'reviewed_by_associate')
      .map((r) => ({ ...r, itemType: 'service_team' as const })),
    ...ministryReports
      .filter((r) => r.status === 'submitted')
      .map((r) => ({ ...r, itemType: 'ministry' as const })),
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Role Banner / Context Bar */}
      <section className="bg-gradient-to-r from-[#0a719e] via-[#139fdd] to-[#0a719e] border-b border-[#085a7e] text-white py-3.5 px-4 sm:px-6 lg:px-8 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-300 animate-pulse" />
            <div>
              <span className="text-xs text-sky-100">Logged in as: </span>
              <span className="text-xs font-bold text-white uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-md ml-1">
                {currentUser.role.replace(/_/g, ' ')}
              </span>
              <span className="text-xs text-sky-100 ml-2 font-medium">
                ({currentUser.fullName})
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {currentUser.role === 'resident_pastor' && (
              <span className="bg-white/20 text-yellow-200 px-3 py-1 rounded-full border border-white/20 font-medium">
                👑 Makurdi Executive Oversight & Final Approval Rights
              </span>
            )}
            {currentUser.role === 'associate_pastor_c3' && (
              <span className="bg-white/20 text-white px-3 py-1 rounded-full border border-white/20 font-medium">
                🛡️ Supervising Community Churches (C3s) across Makurdi
              </span>
            )}
            {currentUser.role === 'associate_pastor_service_teams' && (
              <span className="bg-white/20 text-white px-3 py-1 rounded-full border border-white/20 font-medium">
                🛠️ Supervising Service Teams Operations & Rosters
              </span>
            )}
            {currentUser.role === 'c3_minister' && (
              <span className="bg-white/20 text-white px-3 py-1 rounded-full border border-white/20 font-medium">
                ⛪ Assigned C3: {currentUser.c3Name || 'Makurdi Cell'}
              </span>
            )}
            {currentUser.role === 'service_team_leader' && (
              <span className="bg-white/20 text-white px-3 py-1 rounded-full border border-white/20 font-medium">
                🎵 Assigned Team: {currentUser.serviceTeamName || 'Service Unit'}
              </span>
            )}
            {currentUser.role === 'ministry_leader' && (
              <span className="bg-white/20 text-white px-3 py-1 rounded-full border border-white/20 font-medium">
                🤝 Assigned Fellowship: {currentUser.ministryName || 'Ministry'}
              </span>
            )}

            {/* Quick Action Button based on Role */}
            <div className="ml-auto flex items-center gap-2">
              {(currentUser.role === 'c3_minister' || isPastor) && (
                <button
                  onClick={() => setC3ModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Submit C3 Report</span>
                </button>
              )}

              {(currentUser.role === 'service_team_leader' || isPastor) && (
                <button
                  onClick={() => setTeamModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-700 hover:bg-indigo-600 text-white font-semibold text-xs transition shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Submit Team Report</span>
                </button>
              )}

              {(currentUser.role === 'ministry_leader' || isPastor) && (
                <button
                  onClick={() => setMinistryModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Submit Ministry Report</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition shrink-0 ${
              activeTab === 'overview'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Executive Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('c3')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition shrink-0 ${
              activeTab === 'c3'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Community Churches (C3s)</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-800/40 text-emerald-100">
              {c3Reports.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('service_teams')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition shrink-0 ${
              activeTab === 'service_teams'
                ? 'bg-indigo-700 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Service Teams</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-800/40 text-indigo-100">
              {serviceTeamReports.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('ministries')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition shrink-0 ${
              activeTab === 'ministries'
                ? 'bg-rose-700 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Fellowship Ministries</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-800/40 text-rose-100">
              {ministryReports.length}
            </span>
          </button>

          {isPastor && (
            <button
              onClick={() => setActiveTab('approvals')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition shrink-0 ${
                activeTab === 'approvals'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Pastoral Approval Hub</span>
              {metrics.pendingApprovalsCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-800 text-amber-100">
                  {metrics.pendingApprovalsCount}
                </span>
              )}
            </button>
          )}

          <button
            onClick={() => setActiveTab('exports')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition shrink-0 ${
              activeTab === 'exports'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Reports & Exports</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: EXECUTIVE OVERVIEW                                                  */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* KPI Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Sunday Service
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900">
                    {metrics.totalSundayAttendance}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-600">+5.7%</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Last Sunday Worship
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  C3 Attendance
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-emerald-700">
                    {metrics.totalC3Attendance}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-600">6 Cells</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Community Churches
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  First Timers
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-amber-600">
                    {metrics.totalFirstTimers}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400">Total</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Welcomed this month
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Souls Won
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-rose-600">
                    {metrics.totalConverts}
                  </span>
                  <span className="text-[10px] font-medium text-rose-500">Converts</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Sunday & C3 Altarcalls
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Duty Volunteers
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-indigo-700">
                    {metrics.totalServiceVolunteers}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400">Active</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Choir, Ushers, Media, etc.
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Reported Giving
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-black text-slate-900 truncate">
                    ₦{(metrics.totalGiving / 1000).toFixed(0)}k
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block truncate">
                  Offerings & Tithes (NGN)
                </span>
              </div>

            </div>

            {/* Visual Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AttendanceTrendChart />
              <C3ZoneBreakdownChart />
            </div>

            {/* Quick Action Cards & Recent Submissions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Unit Highlights */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 lg:col-span-1 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">
                    Church Organs Summary
                  </h3>
                  <span className="text-xs text-amber-600 font-semibold">
                    Makurdi HQ
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-emerald-950 block">
                        C3 Community Churches
                      </span>
                      <span className="text-[11px] text-emerald-700">
                        {c3Centres.length} Centers in Wurukum, High-Level, North-Bank...
                      </span>
                    </div>
                    <button
                      onClick={() => setActiveTab('c3')}
                      className="p-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-indigo-950 block">
                        Service Teams
                      </span>
                      <span className="text-[11px] text-indigo-700">
                        {serviceTeams.length} Operational Units on Duty
                      </span>
                    </div>
                    <button
                      onClick={() => setActiveTab('service_teams')}
                      className="p-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-rose-950 block">
                        Ministry Fellowships
                      </span>
                      <span className="text-[11px] text-rose-700">
                        Men of Faith, 31st Ladies, Kingdom Kids
                      </span>
                    </div>
                    <button
                      onClick={() => setActiveTab('ministries')}
                      className="p-1 rounded-lg bg-rose-600 text-white hover:bg-rose-500"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => exportConsolidatedPastoralBriefPDF(metrics, c3Reports, serviceTeamReports, ministryReports)}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-2 transition"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span>Download Consolidated Weekly Brief (PDF)</span>
                  </button>
                </div>
              </div>

              {/* Recent Activity / Submissions Feed */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Latest Activity & Reports Stream
                    </h3>
                    <p className="text-xs text-slate-500">
                      Real-time submissions from C3s, Service Teams & Ministries
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-400">
                    Showing latest
                  </span>
                </div>

                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                  {c3Reports.slice(0, 3).map((r) => (
                    <div key={r.id} className="py-3 flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                          <Users className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">
                              {r.c3Name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {r.meetingDate}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-1">
                            Topic: {r.topicTaught}
                          </p>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                            <span>Attendance: <strong>{r.totalAttendance}</strong></span>
                            <span>First Timers: <strong>{r.firstTimers}</strong></span>
                            <span>Offering: <strong>₦{r.offeringAmount.toLocaleString()}</strong></span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        {getStatusBadge(r.status)}
                        {isPastor && (
                          <button
                            onClick={() =>
                              setReviewModalData({
                                isOpen: true,
                                type: 'c3',
                                report: r,
                              })
                            }
                            className="text-[11px] text-amber-700 hover:text-amber-800 font-semibold"
                          >
                            Review
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {serviceTeamReports.slice(0, 2).map((st) => (
                    <div key={st.id} className="py-3 flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                          <Wrench className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">
                              {st.teamName}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {st.serviceDate}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-1">
                            {st.tasksCompleted}
                          </p>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                            <span>Duty: <strong>{st.totalOnDuty} present</strong></span>
                            <span>Absent: <strong>{st.rosterAbsentCount}</strong></span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        {getStatusBadge(st.status)}
                        {isPastor && (
                          <button
                            onClick={() =>
                              setReviewModalData({
                                isOpen: true,
                                type: 'service_team',
                                report: st,
                              })
                            }
                            className="text-[11px] text-amber-700 hover:text-amber-800 font-semibold"
                          >
                            Review
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: C3 COMMUNITY CHURCHES                                              */}
        {/* ========================================================================= */}
        {activeTab === 'c3' && (
          <div className="space-y-5 animate-fadeIn">
            
            {/* Header & Controls */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-600" />
                  Community Churches (C3s) Weekly Reporting
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cell fellowship attendance, soul winning, and financial stewardship across Makurdi
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Zone Filter */}
                <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
                  <Filter className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-semibold text-slate-600">Zone:</span>
                  <select
                    value={c3ZoneFilter}
                    onChange={(e) => setC3ZoneFilter(e.target.value)}
                    className="bg-transparent font-medium text-slate-800 focus:outline-none"
                  >
                    <option value="All">All Makurdi Zones</option>
                    <option value="Wurukum">Wurukum</option>
                    <option value="High-Level">High-Level</option>
                    <option value="North-Bank">North-Bank</option>
                    <option value="Kanshio">Kanshio</option>
                    <option value="Judges Quarters">Judges Quarters</option>
                    <option value="Modern Market">Modern Market</option>
                  </select>
                </div>

                {/* Export Buttons */}
                <button
                  onClick={() => exportC3ReportsToPDF(filteredC3Reports)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition border border-slate-200"
                  title="Export filtered reports to PDF"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>PDF</span>
                </button>

                <button
                  onClick={() => exportC3ReportsToExcel(filteredC3Reports)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs transition border border-emerald-200"
                  title="Export to Excel Spreadsheet"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Excel</span>
                </button>

                {/* Submit New Report */}
                <button
                  onClick={() => setC3ModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-sm transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>New C3 Report</span>
                </button>
              </div>
            </div>

            {/* C3 Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">C3 Centre</th>
                      <th className="py-3 px-4">Zone</th>
                      <th className="py-3 px-4">Word Theme</th>
                      <th className="py-3 px-4 text-center">M / F / Kids</th>
                      <th className="py-3 px-4 text-center">Total</th>
                      <th className="py-3 px-4 text-center">1st Timers</th>
                      <th className="py-3 px-4 text-center">Converts</th>
                      <th className="py-3 px-4">Giving (₦)</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Minister</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredC3Reports.map((r) => (
                      <tr key={r.id} className="hover:bg-amber-50/30 transition">
                        <td className="py-3.5 px-4 font-semibold text-slate-800 whitespace-nowrap">
                          {r.meetingDate}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                          {r.c3Name}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium">
                            {r.zone}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 max-w-[180px] truncate" title={r.topicTaught}>
                          {r.topicTaught}
                        </td>
                        <td className="py-3.5 px-4 text-center text-slate-500 whitespace-nowrap">
                          {r.maleAttendance} / {r.femaleAttendance} / {r.childrenAttendance}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-emerald-700 whitespace-nowrap">
                          {r.totalAttendance}
                        </td>
                        <td className="py-3.5 px-4 text-center font-semibold text-amber-700 whitespace-nowrap">
                          {r.firstTimers}
                        </td>
                        <td className="py-3.5 px-4 text-center font-semibold text-rose-600 whitespace-nowrap">
                          {r.newConverts}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-800 whitespace-nowrap">
                          ₦{r.offeringAmount.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {getStatusBadge(r.status)}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                          {r.submittedByName}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          {isPastor ? (
                            <button
                              onClick={() =>
                                setReviewModalData({
                                  isOpen: true,
                                  type: 'c3',
                                  report: r,
                                })
                              }
                              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-xs border border-amber-200 transition"
                            >
                              Review
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400">Recorded</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: SERVICE TEAMS                                                      */}
        {/* ========================================================================= */}
        {activeTab === 'service_teams' && (
          <div className="space-y-5 animate-fadeIn">
            
            {/* Header & Controls */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-indigo-600" />
                  Service Teams Operational Reporting
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sunday & midweek roster turnouts, operations, technical health & equipment status
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Team Filter */}
                <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
                  <Filter className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-semibold text-slate-600">Unit:</span>
                  <select
                    value={serviceTeamFilter}
                    onChange={(e) => setServiceTeamFilter(e.target.value)}
                    className="bg-transparent font-medium text-slate-800 focus:outline-none"
                  >
                    <option value="All">All Service Teams</option>
                    {serviceTeams.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Export Buttons */}
                <button
                  onClick={() => exportServiceTeamReportsToPDF(filteredTeamReports)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition border border-slate-200"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>PDF</span>
                </button>

                <button
                  onClick={() => exportServiceTeamReportsToExcel(filteredTeamReports)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-semibold text-xs transition border border-indigo-200"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-700" />
                  <span>Excel</span>
                </button>

                {/* Submit New Report */}
                <button
                  onClick={() => setTeamModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Team Report</span>
                </button>
              </div>
            </div>

            {/* Service Teams Cards / Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTeamReports.map((st) => (
                <div key={st.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                        {st.serviceType.replace(/_/g, ' ')}
                      </span>
                      {getStatusBadge(st.status)}
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {st.teamName}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3.5 h-3.5" />
                        Service Date: {st.serviceDate}
                      </p>
                    </div>

                    {/* Attendance roster metric */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl text-center">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                          On Duty
                        </span>
                        <span className="text-base font-bold text-slate-900">
                          {st.rosterPresentCount}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                          Absent
                        </span>
                        <span className="text-base font-bold text-slate-500">
                          {st.rosterAbsentCount}
                        </span>
                      </div>
                    </div>

                    {/* Tasks Summary */}
                    <div className="text-xs space-y-1.5">
                      <span className="font-bold text-slate-700 block">
                        Tasks Accomplished:
                      </span>
                      <p className="text-slate-600 line-clamp-2">
                        {st.tasksCompleted}
                      </p>
                    </div>

                    {/* Equipment status */}
                    <div className="text-xs space-y-1">
                      <span className="font-bold text-slate-700 block">
                        Equipment Condition:
                      </span>
                      <p className="text-slate-600 line-clamp-2 italic">
                        {st.equipmentStatus}
                      </p>
                    </div>

                    {/* Urgent needs if any */}
                    {st.urgentNeeds && (
                      <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 text-xs">
                        <span className="font-bold text-amber-900 block">Immediate Need:</span>
                        <p className="text-amber-800">{st.urgentNeeds}</p>
                      </div>
                    )}

                    {/* Pastoral remarks */}
                    {(st.residentPastorNotes || st.associatePastorNotes) && (
                      <div className="p-2.5 bg-blue-50/70 rounded-lg border border-blue-200 text-xs">
                        <span className="font-bold text-blue-900 block mb-0.5">
                          Pastoral Note:
                        </span>
                        <p className="text-blue-800">
                          {st.residentPastorNotes || st.associatePastorNotes}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      By: <strong>{st.submittedByName}</strong>
                    </span>
                    {isPastor && (
                      <button
                        onClick={() =>
                          setReviewModalData({
                            isOpen: true,
                            type: 'service_team',
                            report: st,
                          })
                        }
                        className="px-3 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold border border-amber-200 transition"
                      >
                        Review
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: FELLOWSHIP MINISTRIES                                              */}
        {/* ========================================================================= */}
        {activeTab === 'ministries' && (
          <div className="space-y-5 animate-fadeIn">
            
            {/* Header & Controls */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-600" />
                  Ministry Fellowships Reporting
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Men of Faith Fellowship, 31st Ladies Fellowship, and Children's Church (Kingdom Kids)
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setMinistryModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-sm transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Ministry Report</span>
                </button>
              </div>
            </div>

            {/* Ministry Reports Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {ministryReports.map((m) => (
                <div key={m.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                        {m.ministryName}
                      </span>
                      {getStatusBadge(m.status)}
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {m.reportTitle}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3.5 h-3.5" />
                        Meeting Date: {m.meetingDate}
                      </p>
                    </div>

                    {/* Attendance & Offering metric */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl text-center">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                          Attendance
                        </span>
                        <span className="text-base font-bold text-slate-900">
                          {m.totalAttendance}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                          1st Timers
                        </span>
                        <span className="text-base font-bold text-amber-600">
                          {m.firstTimers}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                          Offering
                        </span>
                        <span className="text-sm font-bold text-slate-800">
                          ₦{m.offeringAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="text-xs space-y-1">
                      <span className="font-bold text-slate-700 block">
                        Activities Summary:
                      </span>
                      <p className="text-slate-600 line-clamp-3">
                        {m.activitiesSummary}
                      </p>
                    </div>

                    {/* Spiritual Highlights */}
                    {m.spiritualHighlights && (
                      <div className="text-xs space-y-1">
                        <span className="font-bold text-slate-700 block">
                          Spiritual Highlights:
                        </span>
                        <p className="text-slate-600 line-clamp-2">
                          {m.spiritualHighlights}
                        </p>
                      </div>
                    )}

                    {/* Upcoming programs */}
                    {m.upcomingPrograms && (
                      <div className="p-2 bg-slate-50 rounded-lg text-xs">
                        <span className="font-bold text-slate-800 block">Upcoming Event:</span>
                        <p className="text-slate-600">{m.upcomingPrograms}</p>
                      </div>
                    )}

                    {/* Pastoral Feedback */}
                    {m.pastoralNotes && (
                      <div className="p-2.5 bg-blue-50/70 rounded-lg border border-blue-200 text-xs">
                        <span className="font-bold text-blue-900 block mb-0.5">
                          Resident Pastor Directive:
                        </span>
                        <p className="text-blue-800">{m.pastoralNotes}</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      Leader: <strong>{m.submittedByName}</strong>
                    </span>
                    {isResidentPastor && (
                      <button
                        onClick={() =>
                          setReviewModalData({
                            isOpen: true,
                            type: 'ministry',
                            report: m,
                          })
                        }
                        className="px-3 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold border border-amber-200 transition"
                      >
                        Review
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: PASTORAL APPROVAL HUB                                              */}
        {/* ========================================================================= */}
        {activeTab === 'approvals' && (
          <div className="space-y-5 animate-fadeIn">
            
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                  Pastoral Review & Approval Hub
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Review queue for Associate Pastors (C3s & Teams) and Resident Pastor final sign-off
                </p>
              </div>

              <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200">
                {pendingApprovalReports.length} Reports Awaiting Review
              </span>
            </div>

            {pendingApprovalReports.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-900">
                  All Reports Reviewed!
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  There are no pending reports requiring pastoral action right now.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden divide-y divide-slate-100">
                {pendingApprovalReports.map((item) => {
                  const title =
                    'c3Name' in item
                      ? item.c3Name
                      : 'teamName' in item
                      ? item.teamName
                      : item.ministryName;
                  const date = 'meetingDate' in item ? item.meetingDate : item.serviceDate;
                  const summary =
                    'topicTaught' in item
                      ? `Word: ${item.topicTaught} | Total: ${item.totalAttendance} (Converts: ${item.newConverts})`
                      : 'tasksCompleted' in item
                      ? item.tasksCompleted
                      : (item as MinistryReport).activitiesSummary;

                  return (
                    <div key={item.id} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              item.itemType === 'c3'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.itemType === 'service_team'
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {item.itemType.replace(/_/g, ' ')}
                          </span>
                          <span className="text-xs text-slate-400">{date}</span>
                          {getStatusBadge(item.status)}
                        </div>

                        <h4 className="text-sm font-bold text-slate-900">{title}</h4>
                        <p className="text-xs text-slate-600 line-clamp-2">{summary}</p>
                        <span className="text-[11px] text-slate-400 block">
                          Submitted by: <strong>{item.submittedByName}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() =>
                            setReviewModalData({
                              isOpen: true,
                              type: item.itemType,
                              report: item,
                            })
                          }
                          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-sm flex items-center gap-1.5"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Review & Sign Off</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: REPORTS & EXPORTS CENTRE                                           */}
        {/* ========================================================================= */}
        {activeTab === 'exports' && (
          <div className="space-y-5 animate-fadeIn">
            
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Download className="w-5 h-5 text-amber-600" />
                Reports & Export Centre
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Generate official pastoral bulletins, audit spreadsheets, and PDF documents
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Executive Pastoral Brief Card */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Consolidated Pastoral Executive Brief (PDF)
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Formatted weekly executive briefing covering Sunday service metrics, C3 growth, service team readiness, giving totals, and pastoral signature blocks.
                  </p>
                </div>
                <button
                  onClick={() => exportConsolidatedPastoralBriefPDF(metrics, c3Reports, serviceTeamReports, ministryReports)}
                  className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Pastoral Brief (PDF)</span>
                </button>
              </div>

              {/* C3 Weekly Export */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    C3 Community Churches Full Digest
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Complete records of all Makurdi cell fellowship meetings, attendance breakdown, first timers, offering remittances, testimonies, and prayer requests.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => exportC3ReportsToPDF(c3Reports)}
                    className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </button>
                  <button
                    onClick={() => exportC3ReportsToExcel(c3Reports)}
                    className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Excel</span>
                  </button>
                </div>
              </div>

              {/* Service Teams Export */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Service Teams Operations & Equipment Audit
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Sunday and Midweek operational records covering Choir, Ushers, Media, Sanctuary Keepers, Security rosters, equipment faults, and procurement needs.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => exportServiceTeamReportsToPDF(serviceTeamReports)}
                    className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </button>
                  <button
                    onClick={() => exportServiceTeamReportsToExcel(serviceTeamReports)}
                    className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Excel</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-[#0a719e] border-t border-[#085a7e] text-sky-100 py-8 px-4 sm:px-6 lg:px-8 mt-12 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-white text-sm tracking-wide">
              CHRIST FAMILY CENTRE MAKURDI
            </span>
            <span className="text-yellow-300 font-semibold">•</span>
            <span className="text-sky-200">A Branch of Christ Family Ministries</span>
          </div>
          <div className="flex items-center gap-4 text-sky-200">
            <span className="italic text-yellow-300">"Raising a Happy & Successful People"</span>
            <span>•</span>
            <span className="font-medium text-white">Love is King</span>
            <span>•</span>
            <a
              href="https://christfamilyministries.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-yellow-300 underline underline-offset-2 transition"
            >
              christfamilyministries.org
            </a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-4 pt-4 border-t border-white/10 text-center text-sky-200/80 text-[11px]">
          © {new Date().getFullYear()} Christ Family Ministries. Senior Pastors: Pastors Arome & Avese Tokula. Reporting Portal for Makurdi Branch.
        </div>
      </footer>

      {/* Interactive Modals */}
      <C3ReportModal
        isOpen={c3ModalOpen}
        onClose={() => setC3ModalOpen(false)}
      />

      <ServiceTeamReportModal
        isOpen={teamModalOpen}
        onClose={() => setTeamModalOpen(false)}
      />

      <MinistryReportModal
        isOpen={ministryModalOpen}
        onClose={() => setMinistryModalOpen(false)}
      />

      <ReviewModal
        isOpen={reviewModalData.isOpen}
        onClose={() =>
          setReviewModalData({ isOpen: false, type: 'c3', report: null })
        }
        reportType={reviewModalData.type}
        report={reviewModalData.report}
      />
    </div>
  );
}
