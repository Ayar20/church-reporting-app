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
import { ATTENDANCE_TREND_DATA, C3_BREAKDOWN_DATA } from '@/lib/mockData';

export function AttendanceTrendChart() {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">
            September Attendance &amp; Mobilization Trends
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
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={ATTENDANCE_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
              name="Sunday Service"
              stroke="#0a719e"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorSunday)"
            />
            <Area
              type="monotone"
              dataKey="C3Cells"
              name="C3 Cells Total"
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
      </div>
    </div>
  );
}

export function C3ZoneBreakdownChart() {
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
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={C3_BREAKDOWN_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
      </div>
    </div>
  );
}
