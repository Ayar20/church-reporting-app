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
  Pencil,
  Trash2,
  Building2,
  Settings,
  Activity,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import ActivityLogView from '@/components/ActivityLogView';

const AttendanceTrendChart = dynamic(
  () => import('@/components/DashboardCharts').then((mod) => mod.AttendanceTrendChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 bg-slate-100 rounded-2xl animate-pulse flex items-center justify-center text-xs text-slate-400">
        Loading Trends...
      </div>
    ),
  }
);

const C3ZoneBreakdownChart = dynamic(
  () => import('@/components/DashboardCharts').then((mod) => mod.C3ZoneBreakdownChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 bg-slate-100 rounded-2xl animate-pulse flex items-center justify-center text-xs text-slate-400">
        Loading C3 Performance...
      </div>
    ),
  }
);
import C3ReportModal from '@/components/C3ReportModal';
import ServiceTeamReportModal from '@/components/ServiceTeamReportModal';
import MinistryReportModal from '@/components/MinistryReportModal';
import ReviewModal from '@/components/ReviewModal';
import SundayServiceModal from '@/components/SundayServiceModal';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import ChurchOrganModal, { OrganType } from '@/components/ChurchOrganModal';
import {
  C3Centre,
  ServiceTeam,
  MinistryTeam,
  GeneralServiceReport,
} from '@/lib/types';
import {
  exportC3ReportsToPDF,
  exportC3ReportsToExcel,
  exportServiceTeamReportsToPDF,
  exportServiceTeamReportsToExcel,
  exportConsolidatedPastoralBriefPDF,
} from '@/lib/exportUtils';

type ActiveTab = 'overview' | 'c3' | 'service_teams' | 'ministries' | 'approvals' | 'exports' | 'sunday_service' | 'activity';

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
    generalServices,
    deleteC3Report,
    deleteServiceTeamReport,
    deleteMinistryReport,
    deleteGeneralServiceReport,
    deleteC3Centre,
    deleteServiceTeam,
    deleteMinistryTeam,
  } = useChurch();

  // Determine the default landing tab per role
  const getDefaultTab = (): ActiveTab => {
    switch (currentUser.role) {
      case 'resident_pastor':
      case 'associate_pastor_c3':
      case 'associate_pastor_service_teams':
        return 'overview';
      case 'c3_minister':
        return 'c3';
      case 'service_team_leader':
        return 'service_teams';
      case 'ministry_leader':
        return 'ministries';
      default:
        return 'overview';
    }
  };

  const [activeTab, setActiveTab] = useState<ActiveTab>(getDefaultTab());
  
  // Modals state
  const [c3ModalOpen, setC3ModalOpen] = useState(false);
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [ministryModalOpen, setMinistryModalOpen] = useState(false);
  const [sundayModalOpen, setSundayModalOpen] = useState(false);

  // Edit states for reports
  const [editingC3Report, setEditingC3Report] = useState<C3Report | null>(null);
  const [editingTeamReport, setEditingTeamReport] = useState<ServiceTeamReport | null>(null);
  const [editingMinistryReport, setEditingMinistryReport] = useState<MinistryReport | null>(null);
  const [editingSundayReport, setEditingSundayReport] = useState<GeneralServiceReport | null>(null);

  // Delete confirmation modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    itemLabel?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    itemLabel: '',
    onConfirm: () => {},
  });

  // Church organ management modal state (C3 / Service Team / Ministry)
  const [organModal, setOrganModal] = useState<{
    isOpen: boolean;
    organType: OrganType;
    editingItem?: C3Centre | ServiceTeam | MinistryTeam | null;
  }>({
    isOpen: false,
    organType: 'c3',
    editingItem: null,
  });

  // Directory view toggles for Pastoral roles
  const [showC3Directory, setShowC3Directory] = useState(false);
  const [showTeamsDirectory, setShowTeamsDirectory] = useState(false);
  const [showMinistriesDirectory, setShowMinistriesDirectory] = useState(false);

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
  const isAssocPastorC3 = currentUser.role === 'associate_pastor_c3';
  const isAssocPastorTeams = currentUser.role === 'associate_pastor_service_teams';
  const isC3Minister = currentUser.role === 'c3_minister';
  const isServiceTeamLeader = currentUser.role === 'service_team_leader';
  const isMinistryLeader = currentUser.role === 'ministry_leader';

  // -------------------------------------------------------------------------
  // ROLE-BASED TAB VISIBILITY
  // Resident Pastor:    all tabs
  // Assoc Pastor C3:    overview, sunday, c3, approvals, exports
  // Assoc Pastor Teams: overview, sunday, service_teams, approvals, exports
  // C3 Minister:        c3 (own C3 only), sunday (read-only)
  // Service Team Leader: service_teams (own team only)
  // Ministry Leader:    ministries (own ministry only)
  // -------------------------------------------------------------------------
  const canSeeOverview      = isPastor;
  const canSeeSundayService = isPastor || isC3Minister;
  const canSeeC3Tab         = isPastor || isC3Minister;
  const canSeeTeamsTab      = isPastor || isServiceTeamLeader;
  const canSeeMinistriesTab = isPastor || isMinistryLeader;
  const canSeeApprovals     = isPastor;
  const canSeeExports       = isPastor;
  const canSeeActivity      = isPastor;

  // Helper status color - Blue, Green, Black, White, Red ONLY where necessary
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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-200">
            <Clock className="w-3 h-3 text-sky-600" />
            Reviewed by Associate
          </span>
        );
      case 'revision_requested':
        // Red is used here as it indicates an error/correction requirement
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            Needs Revision
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
            <Clock className="w-3 h-3 text-slate-600" />
            Pending Review
          </span>
        );
    }
  };

  const getServiceTypeBadge = (type: string) => {
    switch (type) {
      case 'connect_to_life_first':
        return (
          <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[11px] font-semibold whitespace-nowrap">
            Connect to Life (1st)
          </span>
        );
      case 'connect_to_life_second':
        return (
          <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[11px] font-semibold whitespace-nowrap">
            Connect to Life (2nd)
          </span>
        );
      case 'connect_to_life_combined':
        return (
          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 text-[11px] font-semibold whitespace-nowrap">
            Connect to Life (Combined)
          </span>
        );
      case 'prayer_and_communion':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[11px] font-bold border border-emerald-300 whitespace-nowrap">
            Prayer &amp; Communion (Last Sun Combined)
          </span>
        );
      case 'c3_midweek':
        return (
          <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[11px] font-semibold whitespace-nowrap">
            C3 Midweek Service
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[11px] font-semibold capitalize whitespace-nowrap">
            {type.replace(/_/g, ' ')}
          </span>
        );
    }
  };

  // -------------------------------------------------------------------------
  // ROLE-SCOPED DATA FILTERING
  // C3 Ministers see ONLY their own C3's reports.
  // Associate Pastor (C3) sees ALL C3 reports.
  // Resident Pastor sees ALL reports.
  // Service Team Leaders see ONLY their own team's reports.
  // Associate Pastor (Teams) sees ALL team reports.
  // Ministry Leaders see ONLY their own ministry's reports.
  // -------------------------------------------------------------------------

  const filteredC3Reports = c3Reports.filter((r) => {
    // Scope to own C3 for c3_minister
    const matchesRole = isC3Minister
      ? r.c3Id === currentUser.c3Id
      : true;
    const matchesZone = c3ZoneFilter === 'All' || r.zone === c3ZoneFilter;
    const matchesSearch =
      r.c3Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.topicTaught.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.submittedByName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesZone && matchesSearch;
  });

  const filteredTeamReports = serviceTeamReports.filter((r) => {
    // Scope to own team for service_team_leader
    const matchesRole = isServiceTeamLeader
      ? r.teamId === currentUser.serviceTeamId
      : true;
    const matchesTeam = serviceTeamFilter === 'All' || r.teamName === serviceTeamFilter;
    const matchesSearch =
      r.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.tasksCompleted.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.submittedByName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesTeam && matchesSearch;
  });

  const filteredMinistryReports = ministryReports.filter((r) => {
    // Scope to own ministry for ministry_leader
    return isMinistryLeader ? r.ministryId === currentUser.ministryId : true;
  });

  // Approval queue — scoped by associate role
  const pendingApprovalReports = [
    ...c3Reports
      .filter((r) => {
        if (!canSeeApprovals) return false;
        // Assoc Pastor (C3) only sees C3 reports needing review
        // Resident Pastor sees everything pending
        const statusOk = r.status === 'submitted' || r.status === 'reviewed_by_associate';
        if (isResidentPastor) return statusOk;
        if (isAssocPastorC3) return r.status === 'submitted';
        return false;
      })
      .map((r) => ({ ...r, itemType: 'c3' as const })),
    ...serviceTeamReports
      .filter((r) => {
        if (!canSeeApprovals) return false;
        const statusOk = r.status === 'submitted' || r.status === 'reviewed_by_associate';
        if (isResidentPastor) return statusOk;
        if (isAssocPastorTeams) return r.status === 'submitted';
        return false;
      })
      .map((r) => ({ ...r, itemType: 'service_team' as const })),
    ...ministryReports
      .filter((r) => {
        if (!canSeeApprovals) return false;
        return r.status === 'submitted';
      })
      .map((r) => ({ ...r, itemType: 'ministry' as const })),
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Role Banner / Context Bar */}
      <section className="bg-gradient-to-r from-[#0a719e] via-[#139fdd] to-[#0a719e] border-b border-[#085a7e] text-white py-3.5 px-4 sm:px-6 lg:px-8 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-pulse" />
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
              <span className="bg-white/20 text-white px-3 py-1 rounded-full border border-white/20 font-medium">
                Makurdi Executive Oversight &amp; Final Approval Rights
              </span>
            )}
            {currentUser.role === 'associate_pastor_c3' && (
              <span className="bg-white/20 text-white px-3 py-1 rounded-full border border-white/20 font-medium">
                Supervising Community Churches (C3s) across Makurdi
              </span>
            )}
            {currentUser.role === 'associate_pastor_service_teams' && (
              <span className="bg-white/20 text-white px-3 py-1 rounded-full border border-white/20 font-medium">
                Supervising Service Teams Operations &amp; Rosters
              </span>
            )}
            {currentUser.role === 'c3_minister' && (
              <span className="bg-white/20 text-white px-3 py-1 rounded-full border border-white/20 font-medium">
                Assigned C3: {currentUser.c3Name || 'Makurdi Cell'}
              </span>
            )}
            {currentUser.role === 'service_team_leader' && (
              <span className="bg-white/20 text-white px-3 py-1 rounded-full border border-white/20 font-medium">
                Assigned Team: {currentUser.serviceTeamName || 'Service Unit'}
              </span>
            )}
            {currentUser.role === 'ministry_leader' && (
              <span className="bg-white/20 text-white px-3 py-1 rounded-full border border-white/20 font-medium">
                Assigned Fellowship: {currentUser.ministryName || 'Ministry'}
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
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0a719e] hover:bg-[#085a7e] text-white font-semibold text-xs transition shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Submit Team Report</span>
                </button>
              )}

              {(currentUser.role === 'ministry_leader' || isPastor) && (
                <button
                  onClick={() => setMinistryModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-600 text-white font-semibold text-xs transition shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Submit Ministry Team Report</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24 md:pb-8">
        
        {/* Navigation Tabs — role-gated, horizontally scrollable on mobile */}
        <div className="flex items-center gap-2 pb-3 border-b border-slate-200 overflow-x-auto no-scrollbar flex-nowrap md:flex-wrap">

          {canSeeOverview && (
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition ${
                activeTab === 'overview'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Executive Overview</span>
            </button>
          )}

          {canSeeSundayService && (
            <button
              onClick={() => setActiveTab('sunday_service')}
              className={`flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition ${
                activeTab === 'sunday_service'
                  ? 'bg-[#0a719e] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Connect to Life Services</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === 'sunday_service' ? 'bg-white/20 text-white' : 'bg-sky-100 text-sky-800'}`}>
                {generalServices.length}
              </span>
            </button>
          )}

          {canSeeC3Tab && (
            <button
              onClick={() => setActiveTab('c3')}
              className={`flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition ${
                activeTab === 'c3'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{isC3Minister ? `${currentUser.c3Name ?? 'My C3'} — Reports` : 'C3 Midweek Services'}</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-800/40 text-emerald-100">
                {filteredC3Reports.length}
              </span>
            </button>
          )}

          {canSeeTeamsTab && (
            <button
              onClick={() => setActiveTab('service_teams')}
              className={`flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition ${
                activeTab === 'service_teams'
                  ? 'bg-[#0a719e] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>{isServiceTeamLeader ? `${currentUser.serviceTeamName ?? 'My Team'} — Reports` : 'Service Teams'}</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#085a7e] text-sky-100">
                {filteredTeamReports.length}
              </span>
            </button>
          )}

          {canSeeMinistriesTab && (
            <button
              onClick={() => setActiveTab('ministries')}
              className={`flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition ${
                activeTab === 'ministries'
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              }`}
            >
              <Heart className="w-4 h-4" />
              <span>{isMinistryLeader ? `${currentUser.ministryName ?? 'My Ministry'} — Reports` : 'Fellowship Ministries'}</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-teal-800/40 text-teal-100">
                {filteredMinistryReports.length}
              </span>
            </button>
          )}

          {canSeeApprovals && (
            <button
              onClick={() => setActiveTab('approvals')}
              className={`flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition ${
                activeTab === 'approvals'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Pastoral Approval Hub</span>
              {pendingApprovalReports.length > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-sky-900 text-sky-100">
                  {pendingApprovalReports.length}
                </span>
              )}
            </button>
          )}

          {canSeeExports && (
            <button
              onClick={() => setActiveTab('exports')}
              className={`flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm whitespace-nowrap transition ${
                activeTab === 'exports'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>Reports &amp; Exports</span>
            </button>
          )}

          {canSeeActivity && (
            <button
              onClick={() => setActiveTab('activity')}
              className={`flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm whitespace-nowrap transition ${
                activeTab === 'activity'
                  ? 'bg-[#0a719e] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Activity Log</span>
            </button>
          )}

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
                  Connect to Life
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900">
                    {metrics.totalSundayAttendance}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-600">+5.7%</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Sunday / Monthly Communion
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  C3 Midweek
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-emerald-700">
                    {metrics.totalC3Attendance}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-600">6 Cells</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Wednesday Cell Gatherings
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  First Timers
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-sky-700">
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
                  <span className="text-2xl font-black text-emerald-700">
                    {metrics.totalConverts}
                  </span>
                  <span className="text-[10px] font-medium text-emerald-600">Converts</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Sunday &amp; C3 Altarcalls
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Duty Volunteers
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900">
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
                  <span className="text-xl font-black text-emerald-700 truncate">
                    ₦{(metrics.totalGiving / 1000).toFixed(0)}k
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block truncate">
                  Offerings &amp; Tithes (NGN)
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
                  <span className="text-xs text-sky-700 font-semibold">
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
                        {c3Centres.length} Centers in Nyiman, George Akume Way, North Bank...
                      </span>
                    </div>
                    <button
                      onClick={() => setActiveTab('c3')}
                      className="p-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-sky-950 block">
                        Service Teams
                      </span>
                      <span className="text-[11px] text-sky-700">
                        {serviceTeams.length} Operational Units on Duty
                      </span>
                    </div>
                    <button
                      onClick={() => setActiveTab('service_teams')}
                      className="p-1 rounded-lg bg-[#0a719e] text-white hover:bg-[#085a7e]"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-3 bg-teal-50 rounded-xl border border-teal-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-teal-950 block">
                        Ministry Fellowships
                      </span>
                      <span className="text-[11px] text-teal-700">
                        Men of Faith, 31st Ladies, Kingdom Kids
                      </span>
                    </div>
                    <button
                      onClick={() => setActiveTab('ministries')}
                      className="p-1 rounded-lg bg-teal-700 text-white hover:bg-teal-600"
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
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Download Consolidated Weekly Brief (PDF)</span>
                  </button>
                </div>
              </div>

              {/* Recent Activity / Submissions Feed */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Latest Activity &amp; Reports Stream
                    </h3>
                    <p className="text-xs text-slate-500">
                      Real-time submissions from C3s, Service Teams &amp; Ministries
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
                            className="text-[11px] text-sky-700 hover:text-sky-900 font-semibold"
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
                        <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center shrink-0 mt-0.5">
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
                            className="text-[11px] text-sky-700 hover:text-sky-900 font-semibold"
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
                  C3 Midweek Services &amp; Cell Fellowships
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Weekly Midweek services held across the 6 Community Churches in Makurdi (Nyiman, George Akume Way, North Bank, Gyado Villa, Welfare Quarters, Old GRA)
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
                    <option value="Nyiman">Nyiman</option>
                    <option value="George Akume Way">George Akume Way</option>
                    <option value="North Bank">North Bank</option>
                    <option value="Gyado Villa">Gyado Villa</option>
                    <option value="Welfare Quarters">Welfare Quarters</option>
                    <option value="Old GRA">Old GRA</option>
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

                {/* Manage C3 Centres (Pastors only) */}
                {isPastor && (
                  <>
                    <button
                      onClick={() => setShowC3Directory(!showC3Directory)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                        showC3Directory
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{showC3Directory ? 'View Reports Table' : `Manage C3 Centres (${c3Centres.length})`}</span>
                    </button>

                    <button
                      onClick={() => setOrganModal({ isOpen: true, organType: 'c3', editingItem: null })}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs shadow-sm transition"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add C3 Centre</span>
                    </button>
                  </>
                )}

                {/* Submit New Report */}
                <button
                  onClick={() => setC3ModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-sm transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Midweek C3 Report</span>
                </button>
              </div>
            </div>

            {/* C3 Centres Directory Grid (Shown when toggled by Pastors) */}
            {showC3Directory && isPastor && (
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-emerald-700" />
                    <h3 className="text-sm font-bold text-slate-900">Makurdi C3 Community Churches Directory</h3>
                  </div>
                  <span className="text-xs text-slate-500">
                    {c3Centres.length} Active Centers Across Makurdi
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {c3Centres.map((c) => (
                    <div key={c.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{c.name}</h4>
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                            {c.zone} Zone
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setOrganModal({ isOpen: true, organType: 'c3', editingItem: c })}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                            title="Edit C3 Details"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteModal({
                                isOpen: true,
                                title: 'Delete C3 Community Church',
                                message: `Are you sure you want to delete ${c.name}? All cell reports linked to this center will remain archived.`,
                                itemLabel: `${c.name} (${c.zone})`,
                                onConfirm: () => deleteC3Centre(c.id),
                              })
                            }
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete C3 Centre"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="text-xs text-slate-600 space-y-1">
                        <p className="flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span>{c.meetingAddress}</span>
                        </p>
                        <p className="flex items-center gap-1.5 text-slate-500">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{c.meetingDay} • {c.meetingTime}</span>
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Host: <strong>{c.hostName || 'TBA'}</strong></span>
                        <span className="text-emerald-800 font-semibold">{c.ministerName || 'Assigned Minister'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                      <tr key={r.id} className="hover:bg-sky-50/30 transition">
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
                        <td className="py-3.5 px-4 text-center font-semibold text-sky-700 whitespace-nowrap">
                          {r.firstTimers}
                        </td>
                        <td className="py-3.5 px-4 text-center font-semibold text-emerald-700 whitespace-nowrap">
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
                          <div className="flex items-center justify-end gap-1.5">
                            {isPastor && (
                              <button
                                onClick={() =>
                                  setReviewModalData({
                                    isOpen: true,
                                    type: 'c3',
                                    report: r,
                                  })
                                }
                                className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 font-semibold text-xs border border-sky-200 transition"
                              >
                                Review
                              </button>
                            )}

                            {(isPastor || (currentUser.role === 'c3_minister' && r.c3Id === currentUser.c3Id)) && (
                              <button
                                onClick={() => {
                                  setEditingC3Report(r);
                                  setC3ModalOpen(true);
                                }}
                                className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                                title="Edit C3 Report"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {(isPastor || (currentUser.role === 'c3_minister' && r.c3Id === currentUser.c3Id && r.status !== 'approved_by_resident_pastor')) && (
                              <button
                                onClick={() => {
                                  setDeleteModal({
                                    isOpen: true,
                                    title: 'Delete C3 Report',
                                    message: `Are you sure you want to delete this C3 report from ${r.c3Name} (${r.meetingDate})?`,
                                    itemLabel: `${r.c3Name} — ${r.topicTaught}`,
                                    onConfirm: () => deleteC3Report(r.id),
                                  });
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                title="Delete C3 Report"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
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
                  <Wrench className="w-5 h-5 text-[#0a719e]" />
                  Service Teams Operational Reporting
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sunday &amp; midweek roster turnouts, operations, technical health &amp; equipment status
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
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 font-semibold text-xs transition border border-sky-200"
                >
                  <Download className="w-3.5 h-3.5 text-sky-700" />
                  <span>Excel</span>
                </button>

                {/* Manage Service Teams (Pastors only) */}
                {isPastor && (
                  <>
                    <button
                      onClick={() => setShowTeamsDirectory(!showTeamsDirectory)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                        showTeamsDirectory
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{showTeamsDirectory ? 'View Reports Grid' : `Manage Teams (${serviceTeams.length})`}</span>
                    </button>

                    <button
                      onClick={() => setOrganModal({ isOpen: true, organType: 'service_team', editingItem: null })}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs shadow-sm transition"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Service Team</span>
                    </button>
                  </>
                )}

                {/* Submit New Report */}
                <button
                  onClick={() => setTeamModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0a719e] hover:bg-[#085a7e] text-white font-semibold text-xs shadow-sm transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Team Report</span>
                </button>
              </div>
            </div>

            {/* Service Teams Directory Grid (Shown when toggled by Pastors) */}
            {showTeamsDirectory && isPastor && (
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-blue-700" />
                    <h3 className="text-sm font-bold text-slate-900">Church Operational Service Teams Directory</h3>
                  </div>
                  <span className="text-xs text-slate-500">
                    {serviceTeams.length} Operational Units
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {serviceTeams.map((t) => (
                    <div key={t.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">{t.name}</h4>
                            <span className="text-[10px] font-mono text-slate-500 uppercase bg-slate-100 px-1.5 py-0.5 rounded">
                              {t.code}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setOrganModal({ isOpen: true, organType: 'service_team', editingItem: t })}
                              className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                              title="Edit Team Details"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteModal({
                                  isOpen: true,
                                  title: 'Delete Service Team',
                                  message: `Are you sure you want to delete ${t.name}?`,
                                  itemLabel: t.name,
                                  onConfirm: () => deleteServiceTeam(t.id),
                                })
                              }
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Delete Team"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-2">
                          {t.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Team Leader:</span>
                        <span className="font-bold text-slate-900">{t.leaderName || 'Appointed Leader'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Service Teams Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTeamReports.map((st) => (
                <div key={st.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#0a719e] uppercase tracking-wider bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">
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
                      <div className="p-2 bg-sky-50 rounded-lg border border-sky-200 text-xs">
                        <span className="font-bold text-sky-900 block">Immediate Need:</span>
                        <p className="text-sky-800">{st.urgentNeeds}</p>
                      </div>
                    )}

                    {/* Pastoral remarks */}
                    {(st.residentPastorNotes || st.associatePastorNotes) && (
                      <div className="p-2.5 bg-sky-50/70 rounded-lg border border-sky-200 text-xs">
                        <span className="font-bold text-sky-900 block mb-0.5">
                          Pastoral Note:
                        </span>
                        <p className="text-sky-800">
                          {st.residentPastorNotes || st.associatePastorNotes}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      By: <strong>{st.submittedByName}</strong>
                    </span>
                    <div className="flex items-center gap-1.5">
                      {isPastor && (
                        <button
                          onClick={() =>
                            setReviewModalData({
                              isOpen: true,
                              type: 'service_team',
                              report: st,
                            })
                          }
                          className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 font-semibold border border-sky-200 transition"
                        >
                          Review
                        </button>
                      )}

                      {(isPastor || (currentUser.role === 'service_team_leader' && st.teamId === currentUser.serviceTeamId)) && (
                        <button
                          onClick={() => {
                            setEditingTeamReport(st);
                            setTeamModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                          title="Edit Team Report"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {(isPastor || (currentUser.role === 'service_team_leader' && st.teamId === currentUser.serviceTeamId && st.status !== 'approved_by_resident_pastor')) && (
                        <button
                          onClick={() => {
                            setDeleteModal({
                              isOpen: true,
                              title: 'Delete Service Team Report',
                              message: `Are you sure you want to delete the report for ${st.teamName} on ${st.serviceDate}?`,
                              itemLabel: `${st.teamName} (${st.serviceDate})`,
                              onConfirm: () => deleteServiceTeamReport(st.id),
                            });
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Team Report"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
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
                  <Heart className="w-5 h-5 text-teal-600" />
                  Ministry Fellowships Reporting
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Men of Faith Fellowship, 31st Ladies Fellowship, and Children&apos;s Church (Kingdom Kids)
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                {/* Manage Ministries (Pastors only) */}
                {isPastor && (
                  <>
                    <button
                      onClick={() => setShowMinistriesDirectory(!showMinistriesDirectory)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                        showMinistriesDirectory
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{showMinistriesDirectory ? 'View Reports Grid' : `Manage Ministries (${ministryTeams.length})`}</span>
                    </button>

                    <button
                      onClick={() => setOrganModal({ isOpen: true, organType: 'ministry', editingItem: null })}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs shadow-sm transition"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Fellowship Ministry</span>
                    </button>
                  </>
                )}

                <button
                  onClick={() => setMinistryModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-semibold text-xs shadow-sm transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Submit Ministry Team Report</span>
                </button>
              </div>
            </div>

            {/* Fellowship Ministries Directory Grid (Shown when toggled by Pastors) */}
            {showMinistriesDirectory && isPastor && (
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-teal-700" />
                    <h3 className="text-sm font-bold text-slate-900">Church Fellowship Ministries Directory</h3>
                  </div>
                  <span className="text-xs text-slate-500">
                    {ministryTeams.length} Fellowship Arms
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ministryTeams.map((m) => (
                    <div key={m.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">{m.name}</h4>
                            <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                              {m.targetAudience}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setOrganModal({ isOpen: true, organType: 'ministry', editingItem: m })}
                              className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition"
                              title="Edit Ministry Details"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteModal({
                                  isOpen: true,
                                  title: 'Delete Fellowship Ministry',
                                  message: `Are you sure you want to delete ${m.name}?`,
                                  itemLabel: m.name,
                                  onConfirm: () => deleteMinistryTeam(m.id),
                                })
                              }
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Delete Ministry"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-2">
                          {m.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Ministry Leader:</span>
                        <span className="font-bold text-slate-900">{m.leaderName || 'Appointed Leader'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ministry Reports Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredMinistryReports.map((m) => (
                <div key={m.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
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
                        <span className="text-base font-bold text-sky-700">
                          {m.firstTimers}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                          Offering
                        </span>
                        <span className="text-sm font-bold text-emerald-700">
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
                      <div className="p-2.5 bg-sky-50/70 rounded-lg border border-sky-200 text-xs">
                        <span className="font-bold text-sky-900 block mb-0.5">
                          Resident Pastor Directive:
                        </span>
                        <p className="text-sky-800">{m.pastoralNotes}</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      Leader: <strong>{m.submittedByName}</strong>
                    </span>
                    <div className="flex items-center gap-1.5">
                      {isResidentPastor && (
                        <button
                          onClick={() =>
                            setReviewModalData({
                              isOpen: true,
                              type: 'ministry',
                              report: m,
                            })
                          }
                          className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 font-semibold border border-sky-200 transition"
                        >
                          Review
                        </button>
                      )}

                      {(isPastor || (currentUser.role === 'ministry_leader' && m.ministryId === currentUser.ministryId)) && (
                        <button
                          onClick={() => {
                            setEditingMinistryReport(m);
                            setMinistryModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition"
                          title="Edit Ministry Report"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {(isPastor || (currentUser.role === 'ministry_leader' && m.ministryId === currentUser.ministryId && m.status !== 'approved_by_resident_pastor')) && (
                        <button
                          onClick={() => {
                            setDeleteModal({
                              isOpen: true,
                              title: 'Delete Ministry Team Report',
                              message: `Are you sure you want to delete the report for ${m.ministryName} on ${m.meetingDate}?`,
                              itemLabel: `${m.ministryName} — ${m.reportTitle}`,
                              onConfirm: () => deleteMinistryReport(m.id),
                            });
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Ministry Team Report"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
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
                  <ShieldCheck className="w-5 h-5 text-[#0a719e]" />
                  Pastoral Review &amp; Approval Hub
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Review queue for Associate Pastors (C3s &amp; Teams) and Resident Pastor final sign-off
                </p>
              </div>

              <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-sky-50 text-sky-900 border border-sky-200">
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
                                ? 'bg-sky-100 text-sky-800'
                                : 'bg-teal-100 text-teal-800'
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
                          className="px-4 py-2 rounded-xl bg-[#0a719e] hover:bg-[#085a7e] text-white font-bold text-xs transition shadow-sm flex items-center gap-1.5"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Review &amp; Sign Off</span>
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
                <Download className="w-5 h-5 text-[#0a719e]" />
                Reports &amp; Export Centre
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Generate official pastoral bulletins, audit spreadsheets, and PDF documents
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Executive Pastoral Brief Card */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 text-[#0a719e] flex items-center justify-center">
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
                  className="w-full py-2.5 px-3 rounded-xl bg-[#0a719e] hover:bg-[#085a7e] text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm"
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
                  <div className="w-10 h-10 rounded-xl bg-sky-100 text-[#0a719e] flex items-center justify-center">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Service Teams Operations &amp; Equipment Audit
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
                    className="py-2.5 px-3 rounded-xl bg-[#0a719e] hover:bg-[#085a7e] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Excel</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: SUNDAY SERVICE RECORDS                                             */}
        {/* ========================================================================= */}
        {activeTab === 'sunday_service' && (
          <div className="space-y-5 animate-fadeIn">

            {/* Header */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#0a719e]" />
                  Connect to Life &amp; Communion Services — CFC Makurdi
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Weekly Connect to Life Sunday Services &amp; Monthly Prayer &amp; Communion (Last Sunday of every month — all C3s gather in one place)
                </p>
              </div>
              {isPastor && (
                <button
                  onClick={() => setSundayModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0a719e] hover:bg-[#085a7e] text-white font-bold text-sm transition shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Record Service
                </button>
              )}
            </div>

            {/* Service Records Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Service Type</th>
                      <th className="py-3 px-4">Preacher</th>
                      <th className="py-3 px-4 max-w-[200px]">Sermon Title</th>
                      <th className="py-3 px-4 text-center">M / F / Kids</th>
                      <th className="py-3 px-4 text-center">Total</th>
                      <th className="py-3 px-4 text-center">1st Timers</th>
                      <th className="py-3 px-4 text-center">Converts</th>
                      <th className="py-3 px-4 text-right">Offering (₦)</th>
                      <th className="py-3 px-4 text-right">Tithe (₦)</th>
                      {isPastor && <th className="py-3 px-4 text-center">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {generalServices.map((s) => (
                      <tr key={s.id} className="hover:bg-sky-50/30 transition">
                        <td className="py-3.5 px-4 font-semibold text-slate-800 whitespace-nowrap">{s.serviceDate}</td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {getServiceTypeBadge(s.serviceType)}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">{s.preacher}</td>
                        <td className="py-3.5 px-4 text-slate-600 max-w-[200px] truncate" title={s.sermonTitle}>{s.sermonTitle}</td>
                        <td className="py-3.5 px-4 text-center text-slate-500 whitespace-nowrap">
                          {s.maleCount} / {s.femaleCount} / {s.childrenCount}
                        </td>
                        <td className="py-3.5 px-4 text-center font-black text-[#0a719e] whitespace-nowrap text-sm">{s.totalAttendance}</td>
                        <td className="py-3.5 px-4 text-center font-semibold text-sky-700 whitespace-nowrap">{s.firstTimersCount}</td>
                        <td className="py-3.5 px-4 text-center font-semibold text-emerald-700 whitespace-nowrap">{s.newConvertsCount}</td>
                        <td className="py-3.5 px-4 text-right font-medium text-slate-800 whitespace-nowrap">₦{s.totalOffering.toLocaleString()}</td>
                        <td className="py-3.5 px-4 text-right font-medium text-emerald-700 whitespace-nowrap">₦{s.totalTithe.toLocaleString()}</td>
                        {isPastor && (
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => {
                                  setEditingSundayReport(s);
                                  setSundayModalOpen(true);
                                }}
                                className="p-1.5 text-slate-500 hover:text-[#0a719e] hover:bg-sky-50 rounded-lg transition"
                                title="Edit Service Record"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  setDeleteModal({
                                    isOpen: true,
                                    title: 'Delete Service Record',
                                    message: `Are you sure you want to delete the record for "${s.sermonTitle || 'Sunday Service'}" on ${s.serviceDate}?`,
                                    itemLabel: `${s.sermonTitle} (${s.serviceDate})`,
                                    onConfirm: () => deleteGeneralServiceReport(s.id),
                                  });
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                title="Delete Service Record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Row */}
              {generalServices.length > 0 && (
                <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="text-center">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Avg Attendance</p>
                    <p className="text-base font-black text-slate-900">
                      {Math.round(generalServices.reduce((a, s) => a + s.totalAttendance, 0) / generalServices.length)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total First Timers</p>
                    <p className="text-base font-black text-sky-700">
                      {generalServices.reduce((a, s) => a + s.firstTimersCount, 0)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Converts</p>
                    <p className="text-base font-black text-emerald-700">
                      {generalServices.reduce((a, s) => a + s.newConvertsCount, 0)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Giving</p>
                    <p className="text-base font-black text-emerald-700">
                      ₦{(generalServices.reduce((a, s) => a + s.totalOffering + s.totalTithe, 0) / 1000).toFixed(0)}k
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 8: AUDIT TRAIL / ACTIVITY LOG                                         */}
        {/* ========================================================================= */}
        {activeTab === 'activity' && <ActivityLogView />}
      </main>

      {/* Footer */}
      <footer className="bg-[#0a719e] border-t border-[#085a7e] text-sky-100 py-8 px-4 sm:px-6 lg:px-8 mt-12 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-white text-sm tracking-wide">
              CHRIST FAMILY CENTRE MAKURDI
            </span>
            <span className="text-emerald-300 font-semibold">•</span>
            <span className="text-sky-200">A Branch of Christ Family Ministries</span>
          </div>
          <div className="flex items-center gap-4 text-sky-200">
            <span className="italic text-white">&ldquo;Raising a Happy &amp; Successful People&rdquo;</span>
            <span>•</span>
            <span className="font-medium text-white">Love is King</span>
            <span>•</span>
            <a
              href="https://christfamilyministries.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-sky-200 underline underline-offset-2 transition"
            >
              christfamilyministries.org
            </a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-4 pt-4 border-t border-white/10 text-center text-sky-200/80 text-[11px]">
          © {new Date().getFullYear()} Christ Family Ministries. Senior Pastors: Pastors Arome &amp; Avese Tokula. Reporting Portal for Makurdi Branch.
        </div>
      </footer>

      {/* Mobile Sticky Bottom Navigation Bar */}
      <nav aria-label="Mobile Navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 py-1.5 px-1 flex justify-around items-center shadow-lg">
        {canSeeOverview && (
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-semibold transition ${
              activeTab === 'overview' ? 'text-[#0a719e]' : 'text-slate-500'
            }`}
          >
            <TrendingUp className="w-4 h-4 mb-0.5" />
            <span>Overview</span>
          </button>
        )}
        {canSeeSundayService && (
          <button
            onClick={() => setActiveTab('sunday_service')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-semibold transition ${
              activeTab === 'sunday_service' ? 'text-[#0a719e]' : 'text-slate-500'
            }`}
          >
            <BookOpen className="w-4 h-4 mb-0.5" />
            <span>Sunday</span>
          </button>
        )}
        {canSeeC3Tab && (
          <button
            onClick={() => setActiveTab('c3')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-semibold transition ${
              activeTab === 'c3' ? 'text-emerald-700' : 'text-slate-500'
            }`}
          >
            <Users className="w-4 h-4 mb-0.5" />
            <span>C3s</span>
          </button>
        )}
        {canSeeTeamsTab && (
          <button
            onClick={() => setActiveTab('service_teams')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-semibold transition ${
              activeTab === 'service_teams' ? 'text-[#0a719e]' : 'text-slate-500'
            }`}
          >
            <Wrench className="w-4 h-4 mb-0.5" />
            <span>Teams</span>
          </button>
        )}
        {canSeeMinistriesTab && (
          <button
            onClick={() => setActiveTab('ministries')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-semibold transition ${
              activeTab === 'ministries' ? 'text-teal-700' : 'text-slate-500'
            }`}
          >
            <Heart className="w-4 h-4 mb-0.5" />
            <span>Ministries</span>
          </button>
        )}
        {canSeeApprovals && (
          <button
            onClick={() => setActiveTab('approvals')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-semibold transition ${
              activeTab === 'approvals' ? 'text-slate-900' : 'text-slate-500'
            }`}
          >
            <ShieldCheck className="w-4 h-4 mb-0.5" />
            <span>Approvals</span>
          </button>
        )}
        {canSeeActivity && (
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-semibold transition ${
              activeTab === 'activity' ? 'text-[#0a719e]' : 'text-slate-500'
            }`}
          >
            <Activity className="w-4 h-4 mb-0.5" />
            <span>Activity</span>
          </button>
        )}
      </nav>

      {/* Interactive Modals */}
      <C3ReportModal
        isOpen={c3ModalOpen}
        onClose={() => {
          setC3ModalOpen(false);
          setEditingC3Report(null);
        }}
        editingReport={editingC3Report}
      />

      <ServiceTeamReportModal
        isOpen={teamModalOpen}
        onClose={() => {
          setTeamModalOpen(false);
          setEditingTeamReport(null);
        }}
        editingReport={editingTeamReport}
      />

      <MinistryReportModal
        isOpen={ministryModalOpen}
        onClose={() => {
          setMinistryModalOpen(false);
          setEditingMinistryReport(null);
        }}
        editingReport={editingMinistryReport}
      />

      <SundayServiceModal
        isOpen={sundayModalOpen}
        onClose={() => {
          setSundayModalOpen(false);
          setEditingSundayReport(null);
        }}
        editingReport={editingSundayReport}
      />

      <ChurchOrganModal
        isOpen={organModal.isOpen}
        organType={organModal.organType}
        editingItem={organModal.editingItem}
        onClose={() => setOrganModal({ isOpen: false, organType: 'c3', editingItem: null })}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        title={deleteModal.title}
        message={deleteModal.message}
        itemLabel={deleteModal.itemLabel}
        onConfirm={deleteModal.onConfirm}
        onClose={() => setDeleteModal({ isOpen: false, title: '', message: '', onConfirm: () => {} })}
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
