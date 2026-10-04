'use client';

import React, { useState, useEffect } from 'react';
import { useChurch } from '@/lib/store';
import { AuditLog } from '@/lib/types';
import {
  Activity,
  PlusCircle,
  Pencil,
  Trash2,
  CheckCircle,
  FileSearch,
  RotateCcw,
  LogIn,
  LogOut,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  Shield,
} from 'lucide-react';

export default function ActivityLogView() {
  const { auditLogs, loadAuditLogs, isLoading } = useChurch();
  const [filterAction, setFilterAction] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    loadAuditLogs();
  }, [loadAuditLogs]);

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'create':
        return {
          icon: <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />,
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          label: 'Created',
        };
      case 'edit':
        return {
          icon: <Pencil className="w-3.5 h-3.5 text-[#0a719e]" />,
          bg: 'bg-sky-50 text-sky-800 border-sky-200',
          label: 'Edited',
        };
      case 'delete':
        return {
          icon: <Trash2 className="w-3.5 h-3.5 text-rose-600" />,
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          label: 'Deleted',
        };
      case 'approve':
        return {
          icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />,
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          label: 'Approved',
        };
      case 'review':
        return {
          icon: <FileSearch className="w-3.5 h-3.5 text-blue-600" />,
          bg: 'bg-blue-50 text-blue-800 border-blue-200',
          label: 'Reviewed',
        };
      case 'request_revision':
        return {
          icon: <RotateCcw className="w-3.5 h-3.5 text-amber-600" />,
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          label: 'Revision Requested',
        };
      case 'login':
        return {
          icon: <LogIn className="w-3.5 h-3.5 text-slate-600" />,
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          label: 'Logged In',
        };
      case 'logout':
        return {
          icon: <LogOut className="w-3.5 h-3.5 text-slate-500" />,
          bg: 'bg-slate-100 text-slate-600 border-slate-200',
          label: 'Logged Out',
        };
      default:
        return {
          icon: <Activity className="w-3.5 h-3.5 text-slate-600" />,
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          label: action,
        };
    }
  };

  const getEntityLabel = (entityType: string) => {
    switch (entityType) {
      case 'c3_report':
        return 'C3 Report';
      case 'service_team_report':
        return 'Service Team Report';
      case 'ministry_report':
        return 'Ministry Report';
      case 'general_service_report':
        return 'Sunday Service Report';
      case 'c3_centre':
        return 'C3 Centre';
      case 'service_team':
        return 'Service Team';
      case 'ministry_team':
        return 'Ministry Fellowship';
      case 'session':
        return 'Session';
      default:
        return entityType.replace(/_/g, ' ');
    }
  };

  const filteredLogs = auditLogs.filter((log) => {
    const matchesFilter = filterAction === 'all' || log.action === filterAction;
    const matchesSearch =
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.entityLabel && log.entityLabel.toLowerCase().includes(searchQuery.toLowerCase())) ||
      log.entityType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Controls */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#0a719e]" />
            <span>Audit Trail &amp; Activity Log</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time chronological record of reports submitted, edits, approvals, deletions, and pastoral decisions across CFC Makurdi.
          </p>
        </div>

        <button
          onClick={() => loadAuditLogs()}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition shrink-0 self-start md:self-auto"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Log</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search activity by leader name, report, or action..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0a719e] text-slate-900"
          />
        </div>

        {/* Action Filter Pills - Scrollable on mobile */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Activity' },
            { id: 'create', label: 'Submissions' },
            { id: 'edit', label: 'Edits' },
            { id: 'review', label: 'Reviews' },
            { id: 'approve', label: 'Approvals' },
            { id: 'delete', label: 'Deletions' },
            { id: 'login', label: 'Logins' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setFilterAction(pill.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                filterAction === pill.id
                  ? 'bg-[#0a719e] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Log List */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">No Activity Recorded Yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Actions taken by church leadership (submitting reports, reviewing, editing, approving) will appear here automatically.
            </p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const badge = getActionBadge(log.action);
            const dateObj = new Date(log.createdAt);
            const formattedDate = !isNaN(dateObj.getTime())
              ? dateObj.toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : log.createdAt;

            return (
              <div
                key={log.id}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0 mt-0.5">
                    {log.userName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{log.userName}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        {log.userRole.replace(/_/g, ' ')}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg}`}
                      >
                        {badge.icon}
                        {badge.label}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 mt-1">
                      <span className="font-semibold text-slate-800">{getEntityLabel(log.entityType)}</span>
                      {log.entityLabel && (
                        <span className="text-slate-600"> &mdash; {log.entityLabel}</span>
                      )}
                    </p>

                    {log.details && Object.keys(log.details).length > 0 && (
                      <p className="text-[11px] text-slate-500 mt-1 bg-slate-50 px-2 py-1 rounded border border-slate-100 max-w-xl">
                        {JSON.stringify(log.details).replace(/[{"}]/g, ' ').replace(/:/g, ': ')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 self-end sm:self-center shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formattedDate}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
