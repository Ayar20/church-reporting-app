'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  UserRole,
  ReportStatus,
  C3Report,
  ServiceTeamReport,
  MinistryReport,
  GeneralServiceReport,
  C3Centre,
  ServiceTeam,
  MinistryTeam,
  DashboardMetricSummary,
} from './types';
import {
  DEMO_USERS,
  MOCK_C3_CENTRES,
  MOCK_SERVICE_TEAMS,
  MOCK_MINISTRY_TEAMS,
  MOCK_C3_REPORTS,
  MOCK_SERVICE_TEAM_REPORTS,
  MOCK_MINISTRY_REPORTS,
  MOCK_GENERAL_SERVICES,
} from './mockData';

interface ChurchContextType {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  c3Centres: C3Centre[];
  serviceTeams: ServiceTeam[];
  ministryTeams: MinistryTeam[];
  c3Reports: C3Report[];
  serviceTeamReports: ServiceTeamReport[];
  ministryReports: MinistryReport[];
  generalServices: GeneralServiceReport[];
  metrics: DashboardMetricSummary;
  switchUser: (userId: string) => void;
  switchRole: (role: UserRole) => void;
  submitC3Report: (data: Partial<C3Report>) => C3Report;
  submitServiceTeamReport: (data: Partial<ServiceTeamReport>) => ServiceTeamReport;
  submitMinistryReport: (data: Partial<MinistryReport>) => MinistryReport;
  updateReportReview: (
    type: 'c3' | 'service_team' | 'ministry',
    reportId: string,
    newStatus: ReportStatus,
    note: string
  ) => void;
  resetToSampleData: () => void;
}

const ChurchContext = createContext<ChurchContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'cfc_makurdi_reporting_state_v2';

export function ChurchProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEMO_USERS[0]); // default to Resident Pastor
  const [c3Centres] = useState<C3Centre[]>(MOCK_C3_CENTRES);
  const [serviceTeams] = useState<ServiceTeam[]>(MOCK_SERVICE_TEAMS);
  const [ministryTeams] = useState<MinistryTeam[]>(MOCK_MINISTRY_TEAMS);

  const [c3Reports, setC3Reports] = useState<C3Report[]>(MOCK_C3_REPORTS);
  const [serviceTeamReports, setServiceTeamReports] = useState<ServiceTeamReport[]>(MOCK_SERVICE_TEAM_REPORTS);
  const [ministryReports, setMinistryReports] = useState<MinistryReport[]>(MOCK_MINISTRY_REPORTS);
  const [generalServices] = useState<GeneralServiceReport[]>(MOCK_GENERAL_SERVICES);

  // Load from LocalStorage if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.c3Reports) setC3Reports(parsed.c3Reports);
        if (parsed.serviceTeamReports) setServiceTeamReports(parsed.serviceTeamReports);
        if (parsed.ministryReports) setMinistryReports(parsed.ministryReports);
        if (parsed.currentUser) {
          const match = DEMO_USERS.find((u) => u.id === parsed.currentUser.id);
          if (match) setCurrentUser(match);
        }
      }
    } catch (e) {
      console.error('Failed to load saved state from localStorage:', e);
    }
  }, []);

  // Save to LocalStorage on updates
  const saveState = (c3s = c3Reports, sts = serviceTeamReports, mins = ministryReports, usr = currentUser) => {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({
          c3Reports: c3s,
          serviceTeamReports: sts,
          ministryReports: mins,
          currentUser: usr,
        })
      );
    } catch (e) {
      console.error('Failed to persist state:', e);
    }
  };

  const switchUser = (userId: string) => {
    const user = DEMO_USERS.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      saveState(c3Reports, serviceTeamReports, ministryReports, user);
    }
  };

  const switchRole = (role: UserRole) => {
    const user = DEMO_USERS.find((u) => u.role === role);
    if (user) {
      setCurrentUser(user);
      saveState(c3Reports, serviceTeamReports, ministryReports, user);
    }
  };

  const submitC3Report = (data: Partial<C3Report>): C3Report => {
    const male = Number(data.maleAttendance || 0);
    const female = Number(data.femaleAttendance || 0);
    const children = Number(data.childrenAttendance || 0);
    const total = male + female + children;

    const matchedC3 = c3Centres.find((c) => c.id === data.c3Id);

    const newReport: C3Report = {
      id: `c3rep-${Date.now()}`,
      c3Id: data.c3Id || currentUser.c3Id || 'c3-nyiman',
      c3Name: matchedC3 ? matchedC3.name : currentUser.c3Name || 'C3 Centre',
      zone: matchedC3 ? matchedC3.zone : 'Makurdi Zone',
      meetingDate: data.meetingDate || new Date().toISOString().split('T')[0],
      topicTaught: data.topicTaught || 'Midweek Discipleship & Prayer',
      maleAttendance: male,
      femaleAttendance: female,
      childrenAttendance: children,
      totalAttendance: total,
      firstTimers: Number(data.firstTimers || 0),
      newConverts: Number(data.newConverts || 0),
      offeringAmount: Number(data.offeringAmount || 0),
      tithesAmount: Number(data.tithesAmount || 0),
      prayerRequests: data.prayerRequests || '',
      testimonies: data.testimonies || '',
      challengesEncountered: data.challengesEncountered || '',
      submittedBy: currentUser.id,
      submittedByName: currentUser.fullName,
      status: 'submitted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newReport, ...c3Reports];
    setC3Reports(updated);
    saveState(updated, serviceTeamReports, ministryReports, currentUser);
    return newReport;
  };

  const submitServiceTeamReport = (data: Partial<ServiceTeamReport>): ServiceTeamReport => {
    const present = Number(data.rosterPresentCount || 0);
    const absent = Number(data.rosterAbsentCount || 0);
    const matchedTeam = serviceTeams.find((t) => t.id === data.teamId);

    const newReport: ServiceTeamReport = {
      id: `st-rep-${Date.now()}`,
      teamId: data.teamId || currentUser.serviceTeamId || 'team-prayer',
      teamName: matchedTeam ? matchedTeam.name : currentUser.serviceTeamName || 'Service Team',
      serviceDate: data.serviceDate || new Date().toISOString().split('T')[0],
      serviceType: data.serviceType || 'first_service',
      rosterPresentCount: present,
      rosterAbsentCount: absent,
      totalOnDuty: present,
      tasksCompleted: data.tasksCompleted || 'All unit responsibilities successfully executed.',
      equipmentStatus: data.equipmentStatus || 'Equipment inspected and functional.',
      challengesEncountered: data.challengesEncountered || '',
      urgentNeeds: data.urgentNeeds || '',
      submittedBy: currentUser.id,
      submittedByName: currentUser.fullName,
      status: 'submitted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newReport, ...serviceTeamReports];
    setServiceTeamReports(updated);
    saveState(c3Reports, updated, ministryReports, currentUser);
    return newReport;
  };

  const submitMinistryReport = (data: Partial<MinistryReport>): MinistryReport => {
    const matchedMin = ministryTeams.find((m) => m.id === data.ministryId);

    const newReport: MinistryReport = {
      id: `minrep-${Date.now()}`,
      ministryId: data.ministryId || currentUser.ministryId || 'min-men',
      ministryName: matchedMin ? matchedMin.name : currentUser.ministryName || 'Fellowship Ministry',
      meetingDate: data.meetingDate || new Date().toISOString().split('T')[0],
      reportTitle: data.reportTitle || 'Monthly Fellowship & Empowerment Meeting',
      totalAttendance: Number(data.totalAttendance || 0),
      firstTimers: Number(data.firstTimers || 0),
      offeringAmount: Number(data.offeringAmount || 0),
      activitiesSummary: data.activitiesSummary || '',
      spiritualHighlights: data.spiritualHighlights || '',
      upcomingPrograms: data.upcomingPrograms || '',
      challengesAndRequests: data.challengesAndRequests || '',
      submittedBy: currentUser.id,
      submittedByName: currentUser.fullName,
      status: 'submitted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newReport, ...ministryReports];
    setMinistryReports(updated);
    saveState(c3Reports, serviceTeamReports, updated, currentUser);
    return newReport;
  };

  const updateReportReview = (
    type: 'c3' | 'service_team' | 'ministry',
    reportId: string,
    newStatus: ReportStatus,
    note: string
  ) => {
    if (type === 'c3') {
      const updated = c3Reports.map((r) => {
        if (r.id === reportId) {
          return {
            ...r,
            status: newStatus,
            associatePastorNotes:
              currentUser.role === 'associate_pastor_c3' ? note : r.associatePastorNotes,
            residentPastorNotes:
              currentUser.role === 'resident_pastor' ? note : r.residentPastorNotes,
            updatedAt: new Date().toISOString(),
          };
        }
        return r;
      });
      setC3Reports(updated);
      saveState(updated, serviceTeamReports, ministryReports, currentUser);
    } else if (type === 'service_team') {
      const updated = serviceTeamReports.map((r) => {
        if (r.id === reportId) {
          return {
            ...r,
            status: newStatus,
            associatePastorNotes:
              currentUser.role === 'associate_pastor_service_teams' ? note : r.associatePastorNotes,
            residentPastorNotes:
              currentUser.role === 'resident_pastor' ? note : r.residentPastorNotes,
            updatedAt: new Date().toISOString(),
          };
        }
        return r;
      });
      setServiceTeamReports(updated);
      saveState(c3Reports, updated, ministryReports, currentUser);
    } else if (type === 'ministry') {
      const updated = ministryReports.map((r) => {
        if (r.id === reportId) {
          return {
            ...r,
            status: newStatus,
            pastoralNotes: note,
            updatedAt: new Date().toISOString(),
          };
        }
        return r;
      });
      setMinistryReports(updated);
      saveState(c3Reports, serviceTeamReports, updated, currentUser);
    }
  };

  const resetToSampleData = () => {
    setC3Reports(MOCK_C3_REPORTS);
    setServiceTeamReports(MOCK_SERVICE_TEAM_REPORTS);
    setMinistryReports(MOCK_MINISTRY_REPORTS);
    setCurrentUser(DEMO_USERS[0]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  // Metrics computation
  const totalSundayAttendance = generalServices[0]?.totalAttendance || 701;
  const totalC3Attendance = c3Reports.reduce((acc, curr) => acc + curr.totalAttendance, 0);
  const totalFirstTimers =
    c3Reports.reduce((acc, curr) => acc + curr.firstTimers, 0) +
    ministryReports.reduce((acc, curr) => acc + curr.firstTimers, 0) +
    (generalServices[0]?.firstTimersCount || 48);
  const totalConverts =
    c3Reports.reduce((acc, curr) => acc + curr.newConverts, 0) +
    (generalServices[0]?.newConvertsCount || 17);
  const totalServiceVolunteers = serviceTeamReports.reduce(
    (acc, curr) => acc + curr.totalOnDuty,
    0
  );
  const totalGiving =
    c3Reports.reduce((acc, curr) => acc + curr.offeringAmount + curr.tithesAmount, 0) +
    ministryReports.reduce((acc, curr) => acc + curr.offeringAmount, 0) +
    ((generalServices[0]?.totalOffering || 0) + (generalServices[0]?.totalTithe || 0));

  const pendingApprovalsCount =
    c3Reports.filter((r) => r.status === 'submitted' || r.status === 'reviewed_by_associate').length +
    serviceTeamReports.filter((r) => r.status === 'submitted' || r.status === 'reviewed_by_associate').length +
    ministryReports.filter((r) => r.status === 'submitted').length;

  const metrics: DashboardMetricSummary = {
    totalSundayAttendance,
    totalC3Attendance,
    totalFirstTimers,
    totalConverts,
    totalServiceVolunteers,
    totalGiving,
    pendingApprovalsCount,
    activeC3sCount: c3Centres.length,
    activeTeamsCount: serviceTeams.length,
  };

  return (
    <ChurchContext.Provider
      value={{
        currentUser,
        allUsers: DEMO_USERS,
        c3Centres,
        serviceTeams,
        ministryTeams,
        c3Reports,
        serviceTeamReports,
        ministryReports,
        generalServices,
        metrics,
        switchUser,
        switchRole,
        submitC3Report,
        submitServiceTeamReport,
        submitMinistryReport,
        updateReportReview,
        resetToSampleData,
      }}
    >
      {children}
    </ChurchContext.Provider>
  );
}

export function useChurch() {
  const context = useContext(ChurchContext);
  if (!context) {
    throw new Error('useChurch must be used within a ChurchProvider');
  }
  return context;
}
