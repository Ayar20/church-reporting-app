export type UserRole =
  | 'resident_pastor'
  | 'associate_pastor_c3'
  | 'associate_pastor_service_teams'
  | 'c3_minister'
  | 'service_team_leader'
  | 'ministry_leader';

export type ReportStatus =
  | 'draft'
  | 'submitted'
  | 'reviewed_by_associate'
  | 'approved_by_resident_pastor'
  | 'revision_requested';

export type ServiceType =
  | 'first_service'
  | 'second_service'
  | 'combined_service'
  | 'midweek_service'
  | 'special_meeting';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
  c3Id?: string;
  c3Name?: string;
  serviceTeamId?: string;
  serviceTeamName?: string;
  ministryId?: string;
  ministryName?: string;
  avatarUrl?: string;
}

export interface C3Centre {
  id: string;
  name: string;
  zone: string;
  meetingAddress: string;
  meetingDay: string;
  meetingTime: string;
  hostName: string;
  ministerName?: string;
  isActive: boolean;
}

export interface ServiceTeam {
  id: string;
  name: string;
  code: string;
  description: string;
  leaderName?: string;
  isActive: boolean;
}

export interface MinistryTeam {
  id: string;
  name: string;
  code: string;
  description: string;
  targetAudience: string;
  leaderName?: string;
  isActive: boolean;
}

export interface C3Report {
  id: string;
  c3Id: string;
  c3Name: string;
  zone: string;
  meetingDate: string; // YYYY-MM-DD
  topicTaught: string;
  maleAttendance: number;
  femaleAttendance: number;
  childrenAttendance: number;
  totalAttendance: number;
  firstTimers: number;
  newConverts: number;
  offeringAmount: number;
  tithesAmount: number;
  prayerRequests?: string;
  testimonies?: string;
  challengesEncountered?: string;
  submittedBy: string;
  submittedByName: string;
  status: ReportStatus;
  associatePastorNotes?: string;
  residentPastorNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceTeamReport {
  id: string;
  teamId: string;
  teamName: string;
  serviceDate: string; // YYYY-MM-DD
  serviceType: ServiceType;
  rosterPresentCount: number;
  rosterAbsentCount: number;
  totalOnDuty: number;
  tasksCompleted: string;
  equipmentStatus: string;
  challengesEncountered?: string;
  urgentNeeds?: string;
  submittedBy: string;
  submittedByName: string;
  status: ReportStatus;
  associatePastorNotes?: string;
  residentPastorNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MinistryReport {
  id: string;
  ministryId: string;
  ministryName: string;
  meetingDate: string; // YYYY-MM-DD
  reportTitle: string;
  totalAttendance: number;
  firstTimers: number;
  offeringAmount: number;
  activitiesSummary: string;
  spiritualHighlights?: string;
  upcomingPrograms?: string;
  challengesAndRequests?: string;
  submittedBy: string;
  submittedByName: string;
  status: ReportStatus;
  pastoralNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GeneralServiceReport {
  id: string;
  serviceDate: string;
  serviceType: ServiceType;
  preacher: string;
  sermonTitle: string;
  maleCount: number;
  femaleCount: number;
  childrenCount: number;
  totalAttendance: number;
  firstTimersCount: number;
  newConvertsCount: number;
  totalOffering: number;
  totalTithe: number;
  notes?: string;
  submittedByName: string;
  createdAt: string;
}

export interface DashboardMetricSummary {
  totalSundayAttendance: number;
  totalC3Attendance: number;
  totalFirstTimers: number;
  totalConverts: number;
  totalServiceVolunteers: number;
  totalGiving: number;
  pendingApprovalsCount: number;
  activeC3sCount: number;
  activeTeamsCount: number;
}
