import fs from 'fs';

const file = 'src/lib/mockData.ts';
let content = fs.readFileSync(file, 'utf8');
const marker = 'export const MOCK_C3_REPORTS';
const idx = content.indexOf(marker);

if (idx !== -1) {
  const kept = content.substring(0, idx);
  const cleared = kept + `export const MOCK_C3_REPORTS: C3Report[] = [];

export const MOCK_SERVICE_TEAM_REPORTS: ServiceTeamReport[] = [];

export const MOCK_MINISTRY_REPORTS: MinistryReport[] = [];

export const MOCK_GENERAL_SERVICES: GeneralServiceReport[] = [];

export const ATTENDANCE_TREND_DATA: { week: string; Sunday: number; C3Cells: number; Volunteers: number }[] = [];

export const C3_BREAKDOWN_DATA: { name: string; attendance: number; converts: number; firstTimers: number; offering: number }[] = [];
`;
  fs.writeFileSync(file, cleared, 'utf8');
  console.log('✅ Cleared mock reports from mockData.ts!');
} else {
  console.error('❌ Marker not found in mockData.ts');
  process.exit(1);
}
