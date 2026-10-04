'use client';

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useChurch } from '@/lib/store';
import { TrendingUp, BarChart3 } from 'lucide-react';

export function AttendanceTrendChart() {
  const { generalServices, c3Reports, serviceTeamReports } = useChurch();

  // Dynamically compute trend data from live reports (grouped by service date or week)
  const hasData = generalServices.length > 0 || c3Reports.length > 0;

  const trendData = React.useMemo(() => {
    if (!hasData) return [];

    // Group Sunday services by date
    const dateMap = new Map<string, { week: string; Sunday: number; C3Cells: number; Volunteers: number }>();

    generalServices.slice(0, 8).reverse().forEach((s) => {
      const label = s.serviceDate;
      dateMap.set(label, {
        week: label,
        Sunday: s.totalAttendance,
        C3Cells: 0,
        Volunteers: 0,
      });
    });

    c3Reports.forEach((c) => {
      const match = dateMap.get(c.meetingDate);
      if (match) {
        match.C3Cells += c.totalAttendance;
      } else if (dateMap.size < 6) {
        dateMap.set(c.meetingDate, {
          week: c.meetingDate,
          Sunday: 0,
          C3Cells: c.totalAttendance,
          Volunteers: 0,
        });
      }
    });

    serviceTeamReports.forEach((st) => {
      const match = dateMap.get(st.serviceDate);
      if (match) {
        match.Volunteers += st.totalOnDuty;
      }
    });

    return Array.from(dateMap.values());
  }, [generalServices, c3Reports, serviceTeamReports, hasData]);

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">
            Attendance &amp; Mobilization Trends
          </h3>
          <p className="text-xs text-slate-500">
            Sunday Worship Services vs Midweek C3 Cell Fellowships
          </p>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
          Weekly Progression
        </span>
      </div>

      <div className="h-64 w-full">
        {trendData.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-200 p-6 text-center">
            <TrendingUp className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-xs font-bold text-slate-600">No Service Reports Submitted Yet</p>
            <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs">
              Attendance trends will populate here automatically as reports are submitted across Makurdi.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSunday" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0a719e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0a719e" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorC3" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '0.75rem',
                  border: 'none',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Area
                type="monotone"
                dataKey="Sunday"
                name="Connect to Life"
                stroke="#0a719e"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorSunday)"
              />
              <Area
                type="monotone"
                dataKey="C3Cells"
                name="C3 Cell Attendance"
                stroke="#059669"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorC3)"
              />
              <Area
                type="monotone"
                dataKey="Volunteers"
                name="Service Volunteers"
                stroke="#0284c7"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorVol)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export function C3ZoneBreakdownChart() {
  const { c3Reports, c3Centres } = useChurch();

  const breakdownData = React.useMemo(() => {
    if (c3Reports.length === 0) {
      return [];
    }

    // Aggregate by C3 centre
    const map = new Map<string, { name: string; attendance: number; converts: number; firstTimers: number; offering: number }>();

    c3Centres.forEach((c) => {
      map.set(c.id, {
        name: c.name.replace(/ C3$/i, ''),
        attendance: 0,
        converts: 0,
        firstTimers: 0,
        offering: 0,
      });
    });

    c3Reports.forEach((r) => {
      const entry = map.get(r.c3Id) || {
        name: r.c3Name.replace(/ C3$/i, ''),
        attendance: 0,
        converts: 0,
        firstTimers: 0,
        offering: 0,
      };
      entry.attendance += r.totalAttendance;
      entry.converts += r.newConverts;
      entry.firstTimers += r.firstTimers;
      entry.offering += r.offeringAmount;
      map.set(r.c3Id, entry);
    });

    return Array.from(map.values()).filter((e) => e.attendance > 0 || e.offering > 0);
  }, [c3Reports, c3Centres]);

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">
            C3 Community Churches Performance by Zone
          </h3>
          <p className="text-xs text-slate-500">
            Attendance comparison and outreach converts across Makurdi
          </p>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          Makurdi Zones
        </span>
      </div>

      <div className="h-64 w-full">
        {breakdownData.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-200 p-6 text-center">
            <BarChart3 className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-xs font-bold text-slate-600">No C3 Reports Submitted Yet</p>
            <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs">
              Zonal performance and comparisons will appear once C3 ministers submit their reports.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={breakdownData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '0.75rem',
                  border: 'none',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="attendance" name="Attendance" fill="#059669" radius={[4, 4, 0, 0]} />
              <Bar dataKey="firstTimers" name="First Timers" fill="#0284c7" radius={[4, 4, 0, 0]} />
              <Bar dataKey="converts" name="New Converts" fill="#0d9488" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
