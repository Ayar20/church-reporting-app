'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

// ---------------------------------------------------------------------------
// Determine whether we have a real DB backend available
// ---------------------------------------------------------------------------
const DB_ENABLED = Boolean(process.env.NEXT_PUBLIC_DB_ENABLED === 'true');

// ---------------------------------------------------------------------------
// Helper: fetch wrapper with JSON return
// ---------------------------------------------------------------------------
async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ---------------------------------------------------------------------------
// Context type (unchanged so no components need editing)
// ---------------------------------------------------------------------------
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
  isLoggedIn: boolean;
  isAuthChecked: boolean;
  isLoading: boolean;
  switchUser: (userId: string) => void;
  switchRole: (role: UserRole) => void;
  logout: () => void;
  // Reports Add / Edit / Delete
  submitC3Report: (data: Partial<C3Report>) => Promise<C3Report>;
  editC3Report: (id: string, data: Partial<C3Report>) => Promise<void>;
  deleteC3Report: (id: string) => Promise<void>;
  submitServiceTeamReport: (data: Partial<ServiceTeamReport>) => Promise<ServiceTeamReport>;
  editServiceTeamReport: (id: string, data: Partial<ServiceTeamReport>) => Promise<void>;
  deleteServiceTeamReport: (id: string) => Promise<void>;
  submitMinistryReport: (data: Partial<MinistryReport>) => Promise<MinistryReport>;
  editMinistryReport: (id: string, data: Partial<MinistryReport>) => Promise<void>;
  deleteMinistryReport: (id: string) => Promise<void>;
  submitGeneralServiceReport: (data: Partial<GeneralServiceReport>) => Promise<GeneralServiceReport>;
  editGeneralServiceReport: (id: string, data: Partial<GeneralServiceReport>) => Promise<void>;
  deleteGeneralServiceReport: (id: string) => Promise<void>;
  // Church Structure (C3s, Service Teams, Ministries) Add / Edit / Delete
  addC3Centre: (data: Omit<C3Centre, 'id'>) => Promise<C3Centre>;
  editC3Centre: (id: string, data: Partial<C3Centre>) => Promise<void>;
  deleteC3Centre: (id: string) => Promise<void>;
  addServiceTeam: (data: Omit<ServiceTeam, 'id'>) => Promise<ServiceTeam>;
  editServiceTeam: (id: string, data: Partial<ServiceTeam>) => Promise<void>;
  deleteServiceTeam: (id: string) => Promise<void>;
  addMinistryTeam: (data: Omit<MinistryTeam, 'id'>) => Promise<MinistryTeam>;
  editMinistryTeam: (id: string, data: Partial<MinistryTeam>) => Promise<void>;
  deleteMinistryTeam: (id: string) => Promise<void>;
  updateReportReview: (
    type: 'c3' | 'service_team' | 'ministry',
    reportId: string,
    newStatus: ReportStatus,
    note: string
  ) => Promise<void>;
  resetToSampleData: () => void;
}

const ChurchContext = createContext<ChurchContextType | undefined>(undefined);

const SESSION_KEY = 'cfc_session_user';

export function ChurchProvider({ children }: { children: React.ReactNode }) {
  // -------------------------------------------------------------------------
  // State
  // -------------------------------------------------------------------------
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEMO_USERS[0]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>(DEMO_USERS);
  const [c3Centres, setC3Centres] = useState<C3Centre[]>(MOCK_C3_CENTRES);
  const [serviceTeams, setServiceTeams] = useState<ServiceTeam[]>(MOCK_SERVICE_TEAMS);
  const [ministryTeams, setMinistryTeams] = useState<MinistryTeam[]>(MOCK_MINISTRY_TEAMS);
  const [c3Reports, setC3Reports] = useState<C3Report[]>(MOCK_C3_REPORTS);
  const [serviceTeamReports, setServiceTeamReports] = useState<ServiceTeamReport[]>(MOCK_SERVICE_TEAM_REPORTS);
  const [ministryReports, setMinistryReports] = useState<MinistryReport[]>(MOCK_MINISTRY_REPORTS);
  const [generalServices, setGeneralServices] = useState<GeneralServiceReport[]>(MOCK_GENERAL_SERVICES);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // -------------------------------------------------------------------------
  // Load data from Neon DB on mount (if DB_ENABLED) or restore session
  // -------------------------------------------------------------------------
  const loadFromDB = useCallback(async (user: UserProfile) => {
    if (!DB_ENABLED) return;
    setIsLoading(true);
    try {
      const role = user.role;
      const c3Id = user.c3Id || '';
      const teamId = user.serviceTeamId || '';
      const ministryId = user.ministryId || '';

      const [c3Res, stRes, minRes, genRes, centresRes, teamsRes, ministriesRes, usersRes] = await Promise.all([
        apiFetch<{ data: C3Report[] }>(`/api/c3-reports?role=${role}&c3Id=${c3Id}`),
        apiFetch<{ data: ServiceTeamReport[] }>(`/api/service-team-reports?role=${role}&teamId=${teamId}`),
        apiFetch<{ data: MinistryReport[] }>(`/api/ministry-reports?role=${role}&ministryId=${ministryId}`),
        apiFetch<{ data: GeneralServiceReport[] }>('/api/general-service-reports'),
        apiFetch<{ data: C3Centre[] }>('/api/c3-centres'),
        apiFetch<{ data: ServiceTeam[] }>('/api/service-teams'),
        apiFetch<{ data: MinistryTeam[] }>('/api/ministry-teams'),
        apiFetch<{ users: UserProfile[] }>('/api/auth').catch(() => ({ users: DEMO_USERS })),
      ]);

      setC3Reports(c3Res.data);
      setServiceTeamReports(stRes.data);
      setMinistryReports(minRes.data);
      setGeneralServices(genRes.data);
      setC3Centres(centresRes.data);
      setServiceTeams(teamsRes.data);
      setMinistryTeams(ministriesRes.data);
      if (usersRes.users && usersRes.users.length > 0) {
        setAllUsers(usersRes.users);
      }
    } catch (err) {
      console.error('Failed to load data from DB, using mock data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Restore session on page reload
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        const user: UserProfile = JSON.parse(saved);
        setCurrentUser(user);
        setIsLoggedIn(true);
        loadFromDB(user);
      }
    } catch { /* ignore */ }
    finally {
      setIsAuthChecked(true);
    }
  }, [loadFromDB]);

  // -------------------------------------------------------------------------
  // Auth
  // -------------------------------------------------------------------------
  const switchUser = useCallback((userId: string) => {
    let user: UserProfile | undefined;

    // Try from allUsers first (may have DB users)
    user = allUsers.find((u) => u.id === userId);
    // Fallback to DEMO_USERS
    if (!user) user = DEMO_USERS.find((u) => u.id === userId);

    if (user) {
      setCurrentUser(user);
      setIsLoggedIn(true);
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
      loadFromDB(user);
    }
  }, [allUsers, loadFromDB]);

  const switchRole = useCallback((role: UserRole) => {
    let user = allUsers.find((u) => u.role === role);
    if (!user) user = DEMO_USERS.find((u) => u.role === role);
    if (user) {
      setCurrentUser(user);
      setIsLoggedIn(true);
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
      loadFromDB(user);
    }
  }, [allUsers, loadFromDB]);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    sessionStorage.removeItem(SESSION_KEY);
    // Reset to mock data
    setC3Reports(MOCK_C3_REPORTS);
    setServiceTeamReports(MOCK_SERVICE_TEAM_REPORTS);
    setMinistryReports(MOCK_MINISTRY_REPORTS);
    setGeneralServices(MOCK_GENERAL_SERVICES);
  }, []);

  // -------------------------------------------------------------------------
  // C3 Reports
  // -------------------------------------------------------------------------
  const submitC3Report = useCallback(async (data: Partial<C3Report>): Promise<C3Report> => {
    const male = Number(data.maleAttendance || 0);
    const female = Number(data.femaleAttendance || 0);
    const children = Number(data.childrenAttendance || 0);
    const matchedC3 = c3Centres.find((c) => c.id === data.c3Id);

    if (DB_ENABLED) {
      const res = await apiFetch<{ data: C3Report }>('/api/c3-reports', {
        method: 'POST',
        body: JSON.stringify({ ...data, submittedBy: currentUser.id }),
      });
      const newReport: C3Report = {
        ...res.data,
        c3Name: matchedC3?.name || data.c3Name || '',
        zone: matchedC3?.zone || data.zone || '',
        submittedByName: currentUser.fullName,
      };
      setC3Reports((prev) => [newReport, ...prev]);
      return newReport;
    }

    // Local fallback
    const newReport: C3Report = {
      id: `c3rep-${Date.now()}`,
      c3Id: data.c3Id || currentUser.c3Id || '',
      c3Name: matchedC3?.name || currentUser.c3Name || '',
      zone: matchedC3?.zone || '',
      meetingDate: data.meetingDate || new Date().toISOString().split('T')[0],
      topicTaught: data.topicTaught || '',
      maleAttendance: male,
      femaleAttendance: female,
      childrenAttendance: children,
      totalAttendance: male + female + children,
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
    setC3Reports((prev) => [newReport, ...prev]);
    return newReport;
  }, [c3Centres, currentUser]);

  const editC3Report = useCallback(async (id: string, data: Partial<C3Report>) => {
    if (DB_ENABLED) {
      await apiFetch(`/api/c3-reports/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    }
    setC3Reports((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const male = data.maleAttendance !== undefined ? Number(data.maleAttendance) : r.maleAttendance;
        const female = data.femaleAttendance !== undefined ? Number(data.femaleAttendance) : r.femaleAttendance;
        const children = data.childrenAttendance !== undefined ? Number(data.childrenAttendance) : r.childrenAttendance;
        const matchedC3 = data.c3Id ? c3Centres.find((c) => c.id === data.c3Id) : undefined;
        return {
          ...r, ...data,
          maleAttendance: male, femaleAttendance: female, childrenAttendance: children,
          totalAttendance: male + female + children,
          c3Name: matchedC3?.name || data.c3Name || r.c3Name,
          zone: matchedC3?.zone || data.zone || r.zone,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, [c3Centres]);

  const deleteC3Report = useCallback(async (id: string) => {
    if (DB_ENABLED) {
      await apiFetch(`/api/c3-reports/${id}`, { method: 'DELETE' });
    }
    setC3Reports((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // -------------------------------------------------------------------------
  // Service Team Reports
  // -------------------------------------------------------------------------
  const submitServiceTeamReport = useCallback(async (data: Partial<ServiceTeamReport>): Promise<ServiceTeamReport> => {
    const present = Number(data.rosterPresentCount || 0);
    const absent = Number(data.rosterAbsentCount || 0);
    const matchedTeam = serviceTeams.find((t) => t.id === data.teamId);

    if (DB_ENABLED) {
      const res = await apiFetch<{ data: ServiceTeamReport }>('/api/service-team-reports', {
        method: 'POST',
        body: JSON.stringify({ ...data, submittedBy: currentUser.id }),
      });
      const newReport: ServiceTeamReport = {
        ...res.data,
        teamName: matchedTeam?.name || data.teamName || '',
        submittedByName: currentUser.fullName,
      };
      setServiceTeamReports((prev) => [newReport, ...prev]);
      return newReport;
    }

    const newReport: ServiceTeamReport = {
      id: `st-rep-${Date.now()}`,
      teamId: data.teamId || currentUser.serviceTeamId || '',
      teamName: matchedTeam?.name || currentUser.serviceTeamName || '',
      serviceDate: data.serviceDate || new Date().toISOString().split('T')[0],
      serviceType: data.serviceType || 'first_service',
      rosterPresentCount: present,
      rosterAbsentCount: absent,
      totalOnDuty: present,
      tasksCompleted: data.tasksCompleted || '',
      equipmentStatus: data.equipmentStatus || '',
      challengesEncountered: data.challengesEncountered || '',
      urgentNeeds: data.urgentNeeds || '',
      submittedBy: currentUser.id,
      submittedByName: currentUser.fullName,
      status: 'submitted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setServiceTeamReports((prev) => [newReport, ...prev]);
    return newReport;
  }, [serviceTeams, currentUser]);

  const editServiceTeamReport = useCallback(async (id: string, data: Partial<ServiceTeamReport>) => {
    if (DB_ENABLED) {
      await apiFetch(`/api/service-team-reports/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    }
    setServiceTeamReports((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const present = data.rosterPresentCount !== undefined ? Number(data.rosterPresentCount) : r.rosterPresentCount;
        const absent = data.rosterAbsentCount !== undefined ? Number(data.rosterAbsentCount) : r.rosterAbsentCount;
        const matchedTeam = data.teamId ? serviceTeams.find((t) => t.id === data.teamId) : undefined;
        return {
          ...r, ...data,
          teamName: matchedTeam?.name || data.teamName || r.teamName,
          rosterPresentCount: present, rosterAbsentCount: absent, totalOnDuty: present,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, [serviceTeams]);

  const deleteServiceTeamReport = useCallback(async (id: string) => {
    if (DB_ENABLED) {
      await apiFetch(`/api/service-team-reports/${id}`, { method: 'DELETE' });
    }
    setServiceTeamReports((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // -------------------------------------------------------------------------
  // Ministry Reports
  // -------------------------------------------------------------------------
  const submitMinistryReport = useCallback(async (data: Partial<MinistryReport>): Promise<MinistryReport> => {
    const matchedMin = ministryTeams.find((m) => m.id === data.ministryId);

    if (DB_ENABLED) {
      const res = await apiFetch<{ data: MinistryReport }>('/api/ministry-reports', {
        method: 'POST',
        body: JSON.stringify({ ...data, submittedBy: currentUser.id }),
      });
      const newReport: MinistryReport = {
        ...res.data,
        ministryName: matchedMin?.name || data.ministryName || '',
        submittedByName: currentUser.fullName,
      };
      setMinistryReports((prev) => [newReport, ...prev]);
      return newReport;
    }

    const newReport: MinistryReport = {
      id: `minrep-${Date.now()}`,
      ministryId: data.ministryId || currentUser.ministryId || '',
      ministryName: matchedMin?.name || currentUser.ministryName || '',
      meetingDate: data.meetingDate || new Date().toISOString().split('T')[0],
      reportTitle: data.reportTitle || 'Monthly Fellowship Report',
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
    setMinistryReports((prev) => [newReport, ...prev]);
    return newReport;
  }, [ministryTeams, currentUser]);

  const editMinistryReport = useCallback(async (id: string, data: Partial<MinistryReport>) => {
    if (DB_ENABLED) {
      await apiFetch(`/api/ministry-reports/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    }
    setMinistryReports((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const matchedMin = data.ministryId ? ministryTeams.find((m) => m.id === data.ministryId) : undefined;
        return {
          ...r, ...data,
          ministryName: matchedMin?.name || data.ministryName || r.ministryName,
          totalAttendance: data.totalAttendance !== undefined ? Number(data.totalAttendance) : r.totalAttendance,
          firstTimers: data.firstTimers !== undefined ? Number(data.firstTimers) : r.firstTimers,
          offeringAmount: data.offeringAmount !== undefined ? Number(data.offeringAmount) : r.offeringAmount,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, [ministryTeams]);

  const deleteMinistryReport = useCallback(async (id: string) => {
    if (DB_ENABLED) {
      await apiFetch(`/api/ministry-reports/${id}`, { method: 'DELETE' });
    }
    setMinistryReports((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // -------------------------------------------------------------------------
  // General Service Reports
  // -------------------------------------------------------------------------
  const submitGeneralServiceReport = useCallback(async (data: Partial<GeneralServiceReport>): Promise<GeneralServiceReport> => {
    if (DB_ENABLED) {
      const res = await apiFetch<{ data: GeneralServiceReport }>('/api/general-service-reports', {
        method: 'POST',
        body: JSON.stringify({ ...data, submittedBy: currentUser.id }),
      });
      const newReport: GeneralServiceReport = { ...res.data, submittedByName: currentUser.fullName };
      setGeneralServices((prev) => [newReport, ...prev]);
      return newReport;
    }

    const newReport: GeneralServiceReport = {
      id: `gen-${Date.now()}`,
      serviceDate: data.serviceDate || new Date().toISOString().split('T')[0],
      serviceType: data.serviceType || 'first_service',
      preacher: data.preacher || currentUser.fullName,
      sermonTitle: data.sermonTitle || '',
      maleCount: Number(data.maleCount || 0),
      femaleCount: Number(data.femaleCount || 0),
      childrenCount: Number(data.childrenCount || 0),
      totalAttendance: Number(data.totalAttendance || 0),
      firstTimersCount: Number(data.firstTimersCount || 0),
      newConvertsCount: Number(data.newConvertsCount || 0),
      totalOffering: Number(data.totalOffering || 0),
      totalTithe: Number(data.totalTithe || 0),
      notes: data.notes || '',
      submittedByName: currentUser.fullName,
      createdAt: new Date().toISOString(),
    };
    setGeneralServices((prev) => [newReport, ...prev]);
    return newReport;
  }, [currentUser]);

  const editGeneralServiceReport = useCallback(async (id: string, data: Partial<GeneralServiceReport>) => {
    if (DB_ENABLED) {
      await apiFetch(`/api/general-service-reports/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    }
    setGeneralServices((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const male = data.maleCount !== undefined ? Number(data.maleCount) : r.maleCount;
        const female = data.femaleCount !== undefined ? Number(data.femaleCount) : r.femaleCount;
        const children = data.childrenCount !== undefined ? Number(data.childrenCount) : r.childrenCount;
        return {
          ...r, ...data,
          maleCount: male, femaleCount: female, childrenCount: children,
          totalAttendance: male + female + children || Number(data.totalAttendance || r.totalAttendance),
        };
      })
    );
  }, []);

  const deleteGeneralServiceReport = useCallback(async (id: string) => {
    if (DB_ENABLED) {
      await apiFetch(`/api/general-service-reports/${id}`, { method: 'DELETE' });
    }
    setGeneralServices((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // -------------------------------------------------------------------------
  // Report Review (pastor approval/rejection)
  // -------------------------------------------------------------------------
  const updateReportReview = useCallback(async (
    type: 'c3' | 'service_team' | 'ministry',
    reportId: string,
    newStatus: ReportStatus,
    note: string
  ) => {
    const isAssocC3 = currentUser.role === 'associate_pastor_c3';
    const isAssocTeams = currentUser.role === 'associate_pastor_service_teams';
    const isResident = currentUser.role === 'resident_pastor';

    if (type === 'c3') {
      const patch: Partial<C3Report> = {
        status: newStatus,
        associatePastorNotes: isAssocC3 ? note : undefined,
        residentPastorNotes: isResident ? note : undefined,
      };
      if (DB_ENABLED) await apiFetch(`/api/c3-reports/${reportId}`, { method: 'PUT', body: JSON.stringify(patch) });
      setC3Reports((prev) => prev.map((r) => r.id === reportId ? {
        ...r, status: newStatus,
        associatePastorNotes: isAssocC3 ? note : r.associatePastorNotes,
        residentPastorNotes: isResident ? note : r.residentPastorNotes,
        updatedAt: new Date().toISOString(),
      } : r));
    } else if (type === 'service_team') {
      const patch: Partial<ServiceTeamReport> = {
        status: newStatus,
        associatePastorNotes: isAssocTeams ? note : undefined,
        residentPastorNotes: isResident ? note : undefined,
      };
      if (DB_ENABLED) await apiFetch(`/api/service-team-reports/${reportId}`, { method: 'PUT', body: JSON.stringify(patch) });
      setServiceTeamReports((prev) => prev.map((r) => r.id === reportId ? {
        ...r, status: newStatus,
        associatePastorNotes: isAssocTeams ? note : r.associatePastorNotes,
        residentPastorNotes: isResident ? note : r.residentPastorNotes,
        updatedAt: new Date().toISOString(),
      } : r));
    } else {
      const patch: Partial<MinistryReport> = { status: newStatus, pastoralNotes: note };
      if (DB_ENABLED) await apiFetch(`/api/ministry-reports/${reportId}`, { method: 'PUT', body: JSON.stringify(patch) });
      setMinistryReports((prev) => prev.map((r) => r.id === reportId ? {
        ...r, status: newStatus, pastoralNotes: note, updatedAt: new Date().toISOString(),
      } : r));
    }
  }, [currentUser]);

  // -------------------------------------------------------------------------
  // Church Organs CRUD
  // -------------------------------------------------------------------------
  const addC3Centre = useCallback(async (data: Omit<C3Centre, 'id'>): Promise<C3Centre> => {
    if (DB_ENABLED) {
      const res = await apiFetch<{ data: C3Centre }>('/api/c3-centres', { method: 'POST', body: JSON.stringify(data) });
      setC3Centres((prev) => [...prev, res.data]);
      return res.data;
    }
    const newCentre: C3Centre = { ...data, id: `c3-${Date.now()}`, isActive: true };
    setC3Centres((prev) => [...prev, newCentre]);
    return newCentre;
  }, []);

  const editC3Centre = useCallback(async (id: string, data: Partial<C3Centre>) => {
    if (DB_ENABLED) await apiFetch(`/api/c3-centres/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    setC3Centres((prev) => prev.map((c) => c.id === id ? { ...c, ...data } : c));
  }, []);

  const deleteC3Centre = useCallback(async (id: string) => {
    if (DB_ENABLED) await apiFetch(`/api/c3-centres/${id}`, { method: 'DELETE' });
    setC3Centres((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const addServiceTeam = useCallback(async (data: Omit<ServiceTeam, 'id'>): Promise<ServiceTeam> => {
    if (DB_ENABLED) {
      const res = await apiFetch<{ data: ServiceTeam }>('/api/service-teams', { method: 'POST', body: JSON.stringify(data) });
      setServiceTeams((prev) => [...prev, res.data]);
      return res.data;
    }
    const newTeam: ServiceTeam = { ...data, id: `team-${Date.now()}`, isActive: true };
    setServiceTeams((prev) => [...prev, newTeam]);
    return newTeam;
  }, []);

  const editServiceTeam = useCallback(async (id: string, data: Partial<ServiceTeam>) => {
    if (DB_ENABLED) await apiFetch(`/api/service-teams/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    setServiceTeams((prev) => prev.map((t) => t.id === id ? { ...t, ...data } : t));
  }, []);

  const deleteServiceTeam = useCallback(async (id: string) => {
    if (DB_ENABLED) await apiFetch(`/api/service-teams/${id}`, { method: 'DELETE' });
    setServiceTeams((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addMinistryTeam = useCallback(async (data: Omit<MinistryTeam, 'id'>): Promise<MinistryTeam> => {
    if (DB_ENABLED) {
      const res = await apiFetch<{ data: MinistryTeam }>('/api/ministry-teams', { method: 'POST', body: JSON.stringify(data) });
      setMinistryTeams((prev) => [...prev, res.data]);
      return res.data;
    }
    const newMin: MinistryTeam = { ...data, id: `min-${Date.now()}`, isActive: true };
    setMinistryTeams((prev) => [...prev, newMin]);
    return newMin;
  }, []);

  const editMinistryTeam = useCallback(async (id: string, data: Partial<MinistryTeam>) => {
    if (DB_ENABLED) await apiFetch(`/api/ministry-teams/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    setMinistryTeams((prev) => prev.map((m) => m.id === id ? { ...m, ...data } : m));
  }, []);

  const deleteMinistryTeam = useCallback(async (id: string) => {
    if (DB_ENABLED) await apiFetch(`/api/ministry-teams/${id}`, { method: 'DELETE' });
    setMinistryTeams((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const resetToSampleData = useCallback(() => {
    setC3Reports(MOCK_C3_REPORTS);
    setServiceTeamReports(MOCK_SERVICE_TEAM_REPORTS);
    setMinistryReports(MOCK_MINISTRY_REPORTS);
    setGeneralServices(MOCK_GENERAL_SERVICES);
    setC3Centres(MOCK_C3_CENTRES);
    setServiceTeams(MOCK_SERVICE_TEAMS);
    setMinistryTeams(MOCK_MINISTRY_TEAMS);
    setCurrentUser(DEMO_USERS[0]);
    sessionStorage.removeItem(SESSION_KEY);
  }, []);

  // -------------------------------------------------------------------------
  // Metrics computation
  // -------------------------------------------------------------------------
  const totalSundayAttendance = generalServices[0]?.totalAttendance || 0;
  const totalC3Attendance = c3Reports.reduce((acc, r) => acc + r.totalAttendance, 0);
  const totalFirstTimers =
    c3Reports.reduce((acc, r) => acc + r.firstTimers, 0) +
    ministryReports.reduce((acc, r) => acc + r.firstTimers, 0) +
    (generalServices[0]?.firstTimersCount || 0);
  const totalConverts =
    c3Reports.reduce((acc, r) => acc + r.newConverts, 0) +
    (generalServices[0]?.newConvertsCount || 0);
  const totalServiceVolunteers = serviceTeamReports.reduce((acc, r) => acc + r.totalOnDuty, 0);
  const totalGiving =
    c3Reports.reduce((acc, r) => acc + r.offeringAmount + r.tithesAmount, 0) +
    ministryReports.reduce((acc, r) => acc + r.offeringAmount, 0) +
    (generalServices[0]?.totalOffering || 0) + (generalServices[0]?.totalTithe || 0);
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
        allUsers,
        c3Centres,
        serviceTeams,
        ministryTeams,
        c3Reports,
        serviceTeamReports,
        ministryReports,
        generalServices,
        metrics,
        isLoggedIn,
        isAuthChecked,
        isLoading,
        switchUser,
        switchRole,
        logout,
        submitC3Report,
        editC3Report,
        deleteC3Report,
        submitServiceTeamReport,
        editServiceTeamReport,
        deleteServiceTeamReport,
        submitMinistryReport,
        editMinistryReport,
        deleteMinistryReport,
        submitGeneralServiceReport,
        editGeneralServiceReport,
        deleteGeneralServiceReport,
        addC3Centre,
        editC3Centre,
        deleteC3Centre,
        addServiceTeam,
        editServiceTeam,
        deleteServiceTeam,
        addMinistryTeam,
        editMinistryTeam,
        deleteMinistryTeam,
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
