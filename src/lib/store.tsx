'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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
  AuditLog,
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
const SESSION_KEY = 'cfc_session_user';
const CACHE_KEY = 'cfc_cache_data';
const OUTBOX_KEY = 'cfc_offline_outbox';

export interface OutboxItem {
  id: string;
  url: string;
  method: 'POST' | 'PUT' | 'DELETE';
  body?: any;
  label: string;
  timestamp: string;
}

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
// Audit log helper (fire-and-forget — never breaks main operations)
// ---------------------------------------------------------------------------
async function logAudit(entry: {
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  entityType: string;
  entityId?: string;
  entityLabel?: string;
  details?: Record<string, unknown>;
}) {
  if (!DB_ENABLED) return;
  try {
    await apiFetch('/api/audit-logs', { method: 'POST', body: JSON.stringify(entry) });
  } catch { /* Non-critical */ }
}

// ---------------------------------------------------------------------------
// Offline Outbox Helpers
// ---------------------------------------------------------------------------
function getStoredOutbox(): OutboxItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(OUTBOX_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredOutbox(items: OutboxItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(OUTBOX_KEY, JSON.stringify(items));
  } catch { /* ignore */ }
}

function queueOfflineMutation(item: Omit<OutboxItem, 'id' | 'timestamp'>) {
  const items = getStoredOutbox();
  const newItem: OutboxItem = {
    ...item,
    id: `outbox-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
  };
  items.push(newItem);
  saveStoredOutbox(items);
  return items.length;
}

// ---------------------------------------------------------------------------
// Context type
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
  isOnline: boolean;
  pendingSyncCount: number;
  isSyncing: boolean;
  syncOfflineOutbox: () => Promise<void>;
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
  // Church Structure Add / Edit / Delete
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
  auditLogs: AuditLog[];
  loadAuditLogs: () => Promise<void>;
}

const ChurchContext = createContext<ChurchContextType | undefined>(undefined);

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
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Offline-first states
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Syncing lock ref
  const isSyncingRef = useRef(false);

  // -------------------------------------------------------------------------
  // Local cache update helper
  // -------------------------------------------------------------------------
  const updateLocalCache = useCallback((overrides?: Record<string, unknown>) => {
    if (typeof window === 'undefined') return;
    try {
      const cacheObj = {
        c3Centres,
        serviceTeams,
        ministryTeams,
        c3Reports,
        serviceTeamReports,
        ministryReports,
        generalServices,
        allUsers,
        cachedAt: new Date().toISOString(),
        ...overrides,
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheObj));
    } catch { /* storage full or quota */ }
  }, [c3Centres, serviceTeams, ministryTeams, c3Reports, serviceTeamReports, ministryReports, generalServices, allUsers]);

  // -------------------------------------------------------------------------
  // Load data from Neon DB (with instant fallback to local cache)
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

      // Update offline cache with the fresh server data
      if (typeof window !== 'undefined') {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          c3Reports: c3Res.data,
          serviceTeamReports: stRes.data,
          ministryReports: minRes.data,
          generalServices: genRes.data,
          c3Centres: centresRes.data,
          serviceTeams: teamsRes.data,
          ministryTeams: ministriesRes.data,
          allUsers: usersRes.users || DEMO_USERS,
          cachedAt: new Date().toISOString(),
        }));
      }
    } catch (err) {
      console.warn('Network issue or offline: using cached local data', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // -------------------------------------------------------------------------
  // Replay queued offline mutations to Neon DB
  // -------------------------------------------------------------------------
  const syncOfflineOutbox = useCallback(async () => {
    if (isSyncingRef.current || !DB_ENABLED) return;
    const items = getStoredOutbox();
    if (items.length === 0) {
      setPendingSyncCount(0);
      return;
    }

    isSyncingRef.current = true;
    setIsSyncing(true);

    const remainingItems: OutboxItem[] = [];

    for (const item of items) {
      try {
        await apiFetch(item.url, {
          method: item.method,
          body: item.body ? JSON.stringify(item.body) : undefined,
        });
      } catch (err) {
        console.error(`Failed to sync queued item ${item.label}:`, err);
        remainingItems.push(item);
      }
    }

    saveStoredOutbox(remainingItems);
    setPendingSyncCount(remainingItems.length);
    isSyncingRef.current = false;
    setIsSyncing(false);

    // Refresh state from DB if any item was synced
    if (remainingItems.length < items.length) {
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved) {
        loadFromDB(JSON.parse(saved));
      }
    }
  }, [loadFromDB]);

  // -------------------------------------------------------------------------
  // Online / Offline Detection & Initial Session / Cache Restore
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check online status
    setIsOnline(navigator.onLine);
    setPendingSyncCount(getStoredOutbox().length);

    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineOutbox();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 1. Instant Cache Hydration for Offline First
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const data = JSON.parse(cached);
        if (data.c3Reports) setC3Reports(data.c3Reports);
        if (data.serviceTeamReports) setServiceTeamReports(data.serviceTeamReports);
        if (data.ministryReports) setMinistryReports(data.ministryReports);
        if (data.generalServices) setGeneralServices(data.generalServices);
        if (data.c3Centres) setC3Centres(data.c3Centres);
        if (data.serviceTeams) setServiceTeams(data.serviceTeams);
        if (data.ministryTeams) setMinistryTeams(data.ministryTeams);
        if (data.allUsers) setAllUsers(data.allUsers);
      }
    } catch { /* ignore cache parse errors */ }

    // 2. Restore Persistent User Session from localStorage
    try {
      const saved = localStorage.getItem(SESSION_KEY);
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

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [loadFromDB, syncOfflineOutbox]);

  // -------------------------------------------------------------------------
  // Auth (Persistent with localStorage)
  // -------------------------------------------------------------------------
  const switchUser = useCallback((userId: string) => {
    let user: UserProfile | undefined;
    user = allUsers.find((u) => u.id === userId);
    if (!user) user = DEMO_USERS.find((u) => u.id === userId);

    if (user) {
      setCurrentUser(user);
      setIsLoggedIn(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      }
      loadFromDB(user);
      logAudit({ userId: user.id, userName: user.fullName, userRole: user.role, action: 'login', entityType: 'session' }).catch(() => {});
    }
  }, [allUsers, loadFromDB]);

  const switchRole = useCallback((role: UserRole) => {
    let user = allUsers.find((u) => u.role === role);
    if (!user) user = DEMO_USERS.find((u) => u.role === role);
    if (user) {
      setCurrentUser(user);
      setIsLoggedIn(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      }
      loadFromDB(user);
      logAudit({ userId: user.id, userName: user.fullName, userRole: user.role, action: 'login', entityType: 'session' }).catch(() => {});
    }
  }, [allUsers, loadFromDB]);

  const logout = useCallback(() => {
    logAudit({ userId: currentUser.id, userName: currentUser.fullName, userRole: currentUser.role, action: 'logout', entityType: 'session' }).catch(() => {});
    setIsLoggedIn(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SESSION_KEY);
    }
    // Revert to demo state
    setC3Reports(MOCK_C3_REPORTS);
    setServiceTeamReports(MOCK_SERVICE_TEAM_REPORTS);
    setMinistryReports(MOCK_MINISTRY_REPORTS);
    setGeneralServices(MOCK_GENERAL_SERVICES);
  }, [currentUser]);

  // -------------------------------------------------------------------------
  // C3 Reports CRUD (Offline-Ready)
  // -------------------------------------------------------------------------
  const submitC3Report = useCallback(async (data: Partial<C3Report>): Promise<C3Report> => {
    const male = Number(data.maleAttendance || 0);
    const female = Number(data.femaleAttendance || 0);
    const children = Number(data.childrenAttendance || 0);
    const matchedC3 = c3Centres.find((c) => c.id === data.c3Id);

    const clientReport: C3Report = {
      id: `c3rep-${Date.now()}`,
      c3Id: data.c3Id || currentUser.c3Id || '',
      c3Name: matchedC3?.name || currentUser.c3Name || data.c3Name || '',
      zone: matchedC3?.zone || data.zone || '',
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

    if (DB_ENABLED) {
      try {
        const res = await apiFetch<{ data: C3Report }>('/api/c3-reports', {
          method: 'POST',
          body: JSON.stringify({ ...data, submittedBy: currentUser.id }),
        });
        const serverReport: C3Report = {
          ...res.data,
          c3Name: matchedC3?.name || data.c3Name || clientReport.c3Name,
          zone: matchedC3?.zone || data.zone || clientReport.zone,
          submittedByName: currentUser.fullName,
        };
        setC3Reports((prev) => [serverReport, ...prev]);
        updateLocalCache({ c3Reports: [serverReport, ...c3Reports] });
        logAudit({ userId: currentUser.id, userName: currentUser.fullName, userRole: currentUser.role, action: 'create', entityType: 'c3_report', entityId: serverReport.id, entityLabel: `${serverReport.c3Name} · ${serverReport.meetingDate}` }).catch(() => {});
        return serverReport;
      } catch (err) {
        console.warn('Network issue: saving C3 report to offline outbox', err);
        const count = queueOfflineMutation({
          url: '/api/c3-reports',
          method: 'POST',
          body: { ...data, submittedBy: currentUser.id },
          label: `Submit C3 Report (${clientReport.c3Name})`,
        });
        setPendingSyncCount(count);
      }
    }

    // Apply locally (optimistic / offline fallback)
    setC3Reports((prev) => [clientReport, ...prev]);
    updateLocalCache({ c3Reports: [clientReport, ...c3Reports] });
    return clientReport;
  }, [c3Centres, currentUser, c3Reports, updateLocalCache]);

  const editC3Report = useCallback(async (id: string, data: Partial<C3Report>) => {
    if (DB_ENABLED) {
      try {
        await apiFetch(`/api/c3-reports/${id}`, { method: 'PUT', body: JSON.stringify(data) });
        logAudit({ userId: currentUser.id, userName: currentUser.fullName, userRole: currentUser.role, action: 'edit', entityType: 'c3_report', entityId: id }).catch(() => {});
      } catch (err) {
        console.warn('Network issue: queueing C3 report edit offline', err);
        const count = queueOfflineMutation({
          url: `/api/c3-reports/${id}`,
          method: 'PUT',
          body: data,
          label: `Edit C3 Report (${id})`,
        });
        setPendingSyncCount(count);
      }
    }
    setC3Reports((prev) => {
      const updated = prev.map((r) => {
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
      });
      updateLocalCache({ c3Reports: updated });
      return updated;
    });
  }, [c3Centres, currentUser, updateLocalCache]);

  const deleteC3Report = useCallback(async (id: string) => {
    if (DB_ENABLED) {
      try {
        await apiFetch(`/api/c3-reports/${id}`, { method: 'DELETE' });
        logAudit({ userId: currentUser.id, userName: currentUser.fullName, userRole: currentUser.role, action: 'delete', entityType: 'c3_report', entityId: id }).catch(() => {});
      } catch (err) {
        console.warn('Network issue: queueing C3 report deletion offline', err);
        const count = queueOfflineMutation({
          url: `/api/c3-reports/${id}`,
          method: 'DELETE',
          label: `Delete C3 Report (${id})`,
        });
        setPendingSyncCount(count);
      }
    }
    setC3Reports((prev) => {
      const remaining = prev.filter((r) => r.id !== id);
      updateLocalCache({ c3Reports: remaining });
      return remaining;
    });
  }, [currentUser, updateLocalCache]);

  // -------------------------------------------------------------------------
  // Service Team Reports CRUD (Offline-Ready)
  // -------------------------------------------------------------------------
  const submitServiceTeamReport = useCallback(async (data: Partial<ServiceTeamReport>): Promise<ServiceTeamReport> => {
    const present = Number(data.rosterPresentCount || 0);
    const absent = Number(data.rosterAbsentCount || 0);
    const matchedTeam = serviceTeams.find((t) => t.id === data.teamId);

    const clientReport: ServiceTeamReport = {
      id: `st-rep-${Date.now()}`,
      teamId: data.teamId || currentUser.serviceTeamId || '',
      teamName: matchedTeam?.name || currentUser.serviceTeamName || data.teamName || '',
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

    if (DB_ENABLED) {
      try {
        const res = await apiFetch<{ data: ServiceTeamReport }>('/api/service-team-reports', {
          method: 'POST',
          body: JSON.stringify({ ...data, submittedBy: currentUser.id }),
        });
        const serverReport: ServiceTeamReport = {
          ...res.data,
          teamName: matchedTeam?.name || data.teamName || clientReport.teamName,
          submittedByName: currentUser.fullName,
        };
        setServiceTeamReports((prev) => [serverReport, ...prev]);
        updateLocalCache({ serviceTeamReports: [serverReport, ...serviceTeamReports] });
        logAudit({ userId: currentUser.id, userName: currentUser.fullName, userRole: currentUser.role, action: 'create', entityType: 'service_team_report', entityId: serverReport.id, entityLabel: `${serverReport.teamName} · ${serverReport.serviceDate}` }).catch(() => {});
        return serverReport;
      } catch (err) {
        console.warn('Network issue: queueing Service Team report offline', err);
        const count = queueOfflineMutation({
          url: '/api/service-team-reports',
          method: 'POST',
          body: { ...data, submittedBy: currentUser.id },
          label: `Submit Team Report (${clientReport.teamName})`,
        });
        setPendingSyncCount(count);
      }
    }

    setServiceTeamReports((prev) => [clientReport, ...prev]);
    updateLocalCache({ serviceTeamReports: [clientReport, ...serviceTeamReports] });
    return clientReport;
  }, [serviceTeams, currentUser, serviceTeamReports, updateLocalCache]);

  const editServiceTeamReport = useCallback(async (id: string, data: Partial<ServiceTeamReport>) => {
    if (DB_ENABLED) {
      try {
        await apiFetch(`/api/service-team-reports/${id}`, { method: 'PUT', body: JSON.stringify(data) });
        logAudit({ userId: currentUser.id, userName: currentUser.fullName, userRole: currentUser.role, action: 'edit', entityType: 'service_team_report', entityId: id }).catch(() => {});
      } catch (err) {
        console.warn('Network issue: queueing team report edit offline', err);
        const count = queueOfflineMutation({
          url: `/api/service-team-reports/${id}`,
          method: 'PUT',
          body: data,
          label: `Edit Team Report (${id})`,
        });
        setPendingSyncCount(count);
      }
    }
    setServiceTeamReports((prev) => {
      const updated = prev.map((r) => {
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
      });
      updateLocalCache({ serviceTeamReports: updated });
      return updated;
    });
  }, [serviceTeams, currentUser, updateLocalCache]);

  const deleteServiceTeamReport = useCallback(async (id: string) => {
    if (DB_ENABLED) {
      try {
        await apiFetch(`/api/service-team-reports/${id}`, { method: 'DELETE' });
        logAudit({ userId: currentUser.id, userName: currentUser.fullName, userRole: currentUser.role, action: 'delete', entityType: 'service_team_report', entityId: id }).catch(() => {});
      } catch (err) {
        console.warn('Network issue: queueing team report delete offline', err);
        const count = queueOfflineMutation({
          url: `/api/service-team-reports/${id}`,
          method: 'DELETE',
          label: `Delete Team Report (${id})`,
        });
        setPendingSyncCount(count);
      }
    }
    setServiceTeamReports((prev) => {
      const remaining = prev.filter((r) => r.id !== id);
      updateLocalCache({ serviceTeamReports: remaining });
      return remaining;
    });
  }, [currentUser, updateLocalCache]);

  // -------------------------------------------------------------------------
  // Ministry Reports CRUD (Offline-Ready)
  // -------------------------------------------------------------------------
  const submitMinistryReport = useCallback(async (data: Partial<MinistryReport>): Promise<MinistryReport> => {
    const matchedMin = ministryTeams.find((m) => m.id === data.ministryId);

    const clientReport: MinistryReport = {
      id: `minrep-${Date.now()}`,
      ministryId: data.ministryId || currentUser.ministryId || '',
      ministryName: matchedMin?.name || currentUser.ministryName || data.ministryName || '',
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

    if (DB_ENABLED) {
      try {
        const res = await apiFetch<{ data: MinistryReport }>('/api/ministry-reports', {
          method: 'POST',
          body: JSON.stringify({ ...data, submittedBy: currentUser.id }),
        });
        const serverReport: MinistryReport = {
          ...res.data,
          ministryName: matchedMin?.name || data.ministryName || clientReport.ministryName,
          submittedByName: currentUser.fullName,
        };
        setMinistryReports((prev) => [serverReport, ...prev]);
        updateLocalCache({ ministryReports: [serverReport, ...ministryReports] });
        logAudit({ userId: currentUser.id, userName: currentUser.fullName, userRole: currentUser.role, action: 'create', entityType: 'ministry_report', entityId: serverReport.id, entityLabel: `${serverReport.ministryName} · ${serverReport.meetingDate}` }).catch(() => {});
        return serverReport;
      } catch (err) {
        console.warn('Network issue: queueing ministry report offline', err);
        const count = queueOfflineMutation({
          url: '/api/ministry-reports',
          method: 'POST',
          body: { ...data, submittedBy: currentUser.id },
          label: `Submit Ministry Report (${clientReport.ministryName})`,
        });
        setPendingSyncCount(count);
      }
    }

    setMinistryReports((prev) => [clientReport, ...prev]);
    updateLocalCache({ ministryReports: [clientReport, ...ministryReports] });
    return clientReport;
  }, [ministryTeams, currentUser, ministryReports, updateLocalCache]);

  const editMinistryReport = useCallback(async (id: string, data: Partial<MinistryReport>) => {
    if (DB_ENABLED) {
      try {
        await apiFetch(`/api/ministry-reports/${id}`, { method: 'PUT', body: JSON.stringify(data) });
        logAudit({ userId: currentUser.id, userName: currentUser.fullName, userRole: currentUser.role, action: 'edit', entityType: 'ministry_report', entityId: id }).catch(() => {});
      } catch (err) {
        console.warn('Network issue: queueing ministry report edit offline', err);
        const count = queueOfflineMutation({
          url: `/api/ministry-reports/${id}`,
          method: 'PUT',
          body: data,
          label: `Edit Ministry Report (${id})`,
        });
        setPendingSyncCount(count);
      }
    }
    setMinistryReports((prev) => {
      const updated = prev.map((r) => {
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
      });
      updateLocalCache({ ministryReports: updated });
      return updated;
    });
  }, [ministryTeams, currentUser, updateLocalCache]);

  const deleteMinistryReport = useCallback(async (id: string) => {
    if (DB_ENABLED) {
      try {
        await apiFetch(`/api/ministry-reports/${id}`, { method: 'DELETE' });
        logAudit({ userId: currentUser.id, userName: currentUser.fullName, userRole: currentUser.role, action: 'delete', entityType: 'ministry_report', entityId: id }).catch(() => {});
      } catch (err) {
        console.warn('Network issue: queueing ministry report delete offline', err);
        const count = queueOfflineMutation({
          url: `/api/ministry-reports/${id}`,
          method: 'DELETE',
          label: `Delete Ministry Report (${id})`,
        });
        setPendingSyncCount(count);
      }
    }
    setMinistryReports((prev) => {
      const remaining = prev.filter((r) => r.id !== id);
      updateLocalCache({ ministryReports: remaining });
      return remaining;
    });
  }, [currentUser, updateLocalCache]);

  // -------------------------------------------------------------------------
  // General Service Reports CRUD (Offline-Ready)
  // -------------------------------------------------------------------------
  const submitGeneralServiceReport = useCallback(async (data: Partial<GeneralServiceReport>): Promise<GeneralServiceReport> => {
    const clientReport: GeneralServiceReport = {
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

    if (DB_ENABLED) {
      try {
        const res = await apiFetch<{ data: GeneralServiceReport }>('/api/general-service-reports', {
          method: 'POST',
          body: JSON.stringify({ ...data, submittedBy: currentUser.id }),
        });
        const serverReport: GeneralServiceReport = { ...res.data, submittedByName: currentUser.fullName };
        setGeneralServices((prev) => [serverReport, ...prev]);
        updateLocalCache({ generalServices: [serverReport, ...generalServices] });
        logAudit({ userId: currentUser.id, userName: currentUser.fullName, userRole: currentUser.role, action: 'create', entityType: 'general_service_report', entityId: serverReport.id, entityLabel: `${serverReport.serviceType} · ${serverReport.serviceDate}` }).catch(() => {});
        return serverReport;
      } catch (err) {
        console.warn('Network issue: queueing Sunday service report offline', err);
        const count = queueOfflineMutation({
          url: '/api/general-service-reports',
          method: 'POST',
          body: { ...data, submittedBy: currentUser.id },
          label: `Submit Sunday Report (${clientReport.serviceDate})`,
        });
        setPendingSyncCount(count);
      }
    }

    setGeneralServices((prev) => [clientReport, ...prev]);
    updateLocalCache({ generalServices: [clientReport, ...generalServices] });
    return clientReport;
  }, [currentUser, generalServices, updateLocalCache]);

  const editGeneralServiceReport = useCallback(async (id: string, data: Partial<GeneralServiceReport>) => {
    if (DB_ENABLED) {
      try {
        await apiFetch(`/api/general-service-reports/${id}`, { method: 'PUT', body: JSON.stringify(data) });
        logAudit({ userId: currentUser.id, userName: currentUser.fullName, userRole: currentUser.role, action: 'edit', entityType: 'general_service_report', entityId: id }).catch(() => {});
      } catch (err) {
        console.warn('Network issue: queueing Sunday report edit offline', err);
        const count = queueOfflineMutation({
          url: `/api/general-service-reports/${id}`,
          method: 'PUT',
          body: data,
          label: `Edit Sunday Report (${id})`,
        });
        setPendingSyncCount(count);
      }
    }
    setGeneralServices((prev) => {
      const updated = prev.map((r) => {
        if (r.id !== id) return r;
        const male = data.maleCount !== undefined ? Number(data.maleCount) : r.maleCount;
        const female = data.femaleCount !== undefined ? Number(data.femaleCount) : r.femaleCount;
        const children = data.childrenCount !== undefined ? Number(data.childrenCount) : r.childrenCount;
        return {
          ...r, ...data,
          maleCount: male, femaleCount: female, childrenCount: children,
          totalAttendance: male + female + children || Number(data.totalAttendance || r.totalAttendance),
        };
      });
      updateLocalCache({ generalServices: updated });
      return updated;
    });
  }, [currentUser, updateLocalCache]);

  const deleteGeneralServiceReport = useCallback(async (id: string) => {
    if (DB_ENABLED) {
      try {
        await apiFetch(`/api/general-service-reports/${id}`, { method: 'DELETE' });
        logAudit({ userId: currentUser.id, userName: currentUser.fullName, userRole: currentUser.role, action: 'delete', entityType: 'general_service_report', entityId: id }).catch(() => {});
      } catch (err) {
        console.warn('Network issue: queueing Sunday report delete offline', err);
        const count = queueOfflineMutation({
          url: `/api/general-service-reports/${id}`,
          method: 'DELETE',
          label: `Delete Sunday Report (${id})`,
        });
        setPendingSyncCount(count);
      }
    }
    setGeneralServices((prev) => {
      const remaining = prev.filter((r) => r.id !== id);
      updateLocalCache({ generalServices: remaining });
      return remaining;
    });
  }, [currentUser, updateLocalCache]);

  // -------------------------------------------------------------------------
  // Report Review & Approval (Offline-Ready)
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

    const action = newStatus === 'approved_by_resident_pastor'
      ? 'approve'
      : newStatus === 'reviewed_by_associate'
      ? 'review'
      : 'request_revision';

    if (type === 'c3') {
      const patch: Partial<C3Report> = {
        status: newStatus,
        associatePastorNotes: isAssocC3 ? note : undefined,
        residentPastorNotes: isResident ? note : undefined,
      };
      if (DB_ENABLED) {
        try {
          await apiFetch(`/api/c3-reports/${reportId}`, { method: 'PUT', body: JSON.stringify(patch) });
          logAudit({ userId: currentUser.id, userName: currentUser.fullName, userRole: currentUser.role, action, entityType: 'c3_report', entityId: reportId, details: { note, status: newStatus } }).catch(() => {});
        } catch {
          const count = queueOfflineMutation({
            url: `/api/c3-reports/${reportId}`,
            method: 'PUT',
            body: patch,
            label: `Review C3 Report (${reportId} -> ${newStatus})`,
          });
          setPendingSyncCount(count);
        }
      }
      setC3Reports((prev) => {
        const updated = prev.map((r) => r.id === reportId ? {
          ...r, status: newStatus,
          associatePastorNotes: isAssocC3 ? note : r.associatePastorNotes,
          residentPastorNotes: isResident ? note : r.residentPastorNotes,
          updatedAt: new Date().toISOString(),
        } : r);
        updateLocalCache({ c3Reports: updated });
        return updated;
      });
    } else if (type === 'service_team') {
      const patch: Partial<ServiceTeamReport> = {
        status: newStatus,
        associatePastorNotes: isAssocTeams ? note : undefined,
        residentPastorNotes: isResident ? note : undefined,
      };
      if (DB_ENABLED) {
        try {
          await apiFetch(`/api/service-team-reports/${reportId}`, { method: 'PUT', body: JSON.stringify(patch) });
          logAudit({ userId: currentUser.id, userName: currentUser.fullName, userRole: currentUser.role, action, entityType: 'service_team_report', entityId: reportId, details: { note, status: newStatus } }).catch(() => {});
        } catch {
          const count = queueOfflineMutation({
            url: `/api/service-team-reports/${reportId}`,
            method: 'PUT',
            body: patch,
            label: `Review Team Report (${reportId} -> ${newStatus})`,
          });
          setPendingSyncCount(count);
        }
      }
      setServiceTeamReports((prev) => {
        const updated = prev.map((r) => r.id === reportId ? {
          ...r, status: newStatus,
          associatePastorNotes: isAssocTeams ? note : r.associatePastorNotes,
          residentPastorNotes: isResident ? note : r.residentPastorNotes,
          updatedAt: new Date().toISOString(),
        } : r);
        updateLocalCache({ serviceTeamReports: updated });
        return updated;
      });
    } else {
      const patch: Partial<MinistryReport> = { status: newStatus, pastoralNotes: note };
      if (DB_ENABLED) {
        try {
          await apiFetch(`/api/ministry-reports/${reportId}`, { method: 'PUT', body: JSON.stringify(patch) });
          logAudit({ userId: currentUser.id, userName: currentUser.fullName, userRole: currentUser.role, action, entityType: 'ministry_report', entityId: reportId, details: { note, status: newStatus } }).catch(() => {});
        } catch {
          const count = queueOfflineMutation({
            url: `/api/ministry-reports/${reportId}`,
            method: 'PUT',
            body: patch,
            label: `Review Ministry Report (${reportId} -> ${newStatus})`,
          });
          setPendingSyncCount(count);
        }
      }
      setMinistryReports((prev) => {
        const updated = prev.map((r) => r.id === reportId ? {
          ...r, status: newStatus, pastoralNotes: note, updatedAt: new Date().toISOString(),
        } : r);
        updateLocalCache({ ministryReports: updated });
        return updated;
      });
    }
  }, [currentUser, updateLocalCache]);

  // -------------------------------------------------------------------------
  // Church Structure (C3s, Service Teams, Ministries) CRUD
  // -------------------------------------------------------------------------
  const addC3Centre = useCallback(async (data: Omit<C3Centre, 'id'>): Promise<C3Centre> => {
    if (DB_ENABLED) {
      const res = await apiFetch<{ data: C3Centre }>('/api/c3-centres', { method: 'POST', body: JSON.stringify(data) });
      setC3Centres((prev) => [...prev, res.data]);
      logAudit({ userId: currentUser.id, userName: currentUser.fullName, userRole: currentUser.role, action: 'create', entityType: 'c3_centre', entityId: res.data.id, entityLabel: res.data.name }).catch(() => {});
      return res.data;
    }
    const newCentre: C3Centre = { ...data, id: `c3-${Date.now()}`, isActive: true };
    setC3Centres((prev) => [...prev, newCentre]);
    return newCentre;
  }, [currentUser]);

  const editC3Centre = useCallback(async (id: string, data: Partial<C3Centre>) => {
    if (DB_ENABLED) {
      await apiFetch(`/api/c3-centres/${id}`, { method: 'PUT', body: JSON.stringify(data) });
      logAudit({ userId: currentUser.id, userName: currentUser.fullName, userRole: currentUser.role, action: 'edit', entityType: 'c3_centre', entityId: id }).catch(() => {});
    }
    setC3Centres((prev) => prev.map((c) => c.id === id ? { ...c, ...data } : c));
  }, [currentUser]);

  const deleteC3Centre = useCallback(async (id: string) => {
    if (DB_ENABLED) {
      await apiFetch(`/api/c3-centres/${id}`, { method: 'DELETE' });
      logAudit({ userId: currentUser.id, userName: currentUser.fullName, userRole: currentUser.role, action: 'delete', entityType: 'c3_centre', entityId: id }).catch(() => {});
    }
    setC3Centres((prev) => prev.filter((c) => c.id !== id));
  }, [currentUser]);

  const addServiceTeam = useCallback(async (data: Omit<ServiceTeam, 'id'>): Promise<ServiceTeam> => {
    if (DB_ENABLED) {
      const res = await apiFetch<{ data: ServiceTeam }>('/api/service-teams', { method: 'POST', body: JSON.stringify(data) });
      setServiceTeams((prev) => [...prev, res.data]);
      logAudit({ userId: currentUser.id, userName: currentUser.fullName, userRole: currentUser.role, action: 'create', entityType: 'service_team', entityId: res.data.id, entityLabel: res.data.name }).catch(() => {});
      return res.data;
    }
    const newTeam: ServiceTeam = { ...data, id: `team-${Date.now()}`, isActive: true };
    setServiceTeams((prev) => [...prev, newTeam]);
    return newTeam;
  }, [currentUser]);

  const editServiceTeam = useCallback(async (id: string, data: Partial<ServiceTeam>) => {
    if (DB_ENABLED) {
      await apiFetch(`/api/service-teams/${id}`, { method: 'PUT', body: JSON.stringify(data) });
      logAudit({ userId: currentUser.id, userName: currentUser.fullName, userRole: currentUser.role, action: 'edit', entityType: 'service_team', entityId: id }).catch(() => {});
    }
    setServiceTeams((prev) => prev.map((t) => t.id === id ? { ...t, ...data } : t));
  }, [currentUser]);

  const deleteServiceTeam = useCallback(async (id: string) => {
    if (DB_ENABLED) {
      await apiFetch(`/api/service-teams/${id}`, { method: 'DELETE' });
      logAudit({ userId: currentUser.id, userName: currentUser.fullName, userRole: currentUser.role, action: 'delete', entityType: 'service_team', entityId: id }).catch(() => {});
    }
    setServiceTeams((prev) => prev.filter((t) => t.id !== id));
  }, [currentUser]);

  const addMinistryTeam = useCallback(async (data: Omit<MinistryTeam, 'id'>): Promise<MinistryTeam> => {
    if (DB_ENABLED) {
      const res = await apiFetch<{ data: MinistryTeam }>('/api/ministry-teams', { method: 'POST', body: JSON.stringify(data) });
      setMinistryTeams((prev) => [...prev, res.data]);
      logAudit({ userId: currentUser.id, userName: currentUser.fullName, userRole: currentUser.role, action: 'create', entityType: 'ministry_team', entityId: res.data.id, entityLabel: res.data.name }).catch(() => {});
      return res.data;
    }
    const newMin: MinistryTeam = { ...data, id: `min-${Date.now()}`, isActive: true };
    setMinistryTeams((prev) => [...prev, newMin]);
    return newMin;
  }, [currentUser]);

  const editMinistryTeam = useCallback(async (id: string, data: Partial<MinistryTeam>) => {
    if (DB_ENABLED) {
      await apiFetch(`/api/ministry-teams/${id}`, { method: 'PUT', body: JSON.stringify(data) });
      logAudit({ userId: currentUser.id, userName: currentUser.fullName, userRole: currentUser.role, action: 'edit', entityType: 'ministry_team', entityId: id }).catch(() => {});
    }
    setMinistryTeams((prev) => prev.map((m) => m.id === id ? { ...m, ...data } : m));
  }, [currentUser]);

  const deleteMinistryTeam = useCallback(async (id: string) => {
    if (DB_ENABLED) {
      await apiFetch(`/api/ministry-teams/${id}`, { method: 'DELETE' });
      logAudit({ userId: currentUser.id, userName: currentUser.fullName, userRole: currentUser.role, action: 'delete', entityType: 'ministry_team', entityId: id }).catch(() => {});
    }
    setMinistryTeams((prev) => prev.filter((m) => m.id !== id));
  }, [currentUser]);

  const loadAuditLogs = useCallback(async () => {
    if (!DB_ENABLED) return;
    try {
      const res = await apiFetch<{ data: AuditLog[] }>('/api/audit-logs?limit=100');
      setAuditLogs(res.data);
    } catch { /* non-critical */ }
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
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(OUTBOX_KEY);
    }
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
        isOnline,
        pendingSyncCount,
        isSyncing,
        syncOfflineOutbox,
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
        auditLogs,
        loadAuditLogs,
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
