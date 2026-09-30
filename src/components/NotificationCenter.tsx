'use client';

import React, { useState, useCallback } from 'react';
import { Bell, X, CheckCircle2, Clock, AlertCircle, Church, Users, Wrench, Heart, CheckCheck } from 'lucide-react';
import { useChurch } from '@/lib/store';
import { C3Report, ServiceTeamReport, MinistryReport, ReportStatus } from '@/lib/types';

interface Notification {
  id: string;
  type: 'c3' | 'service_team' | 'ministry' | 'service';
  title: string;
  body: string;
  status: ReportStatus | 'info';
  timestamp: string;
  read: boolean;
  reportId?: string;
}

function buildNotifications(
  c3Reports: C3Report[],
  serviceTeamReports: ServiceTeamReport[],
  ministryReports: MinistryReport[],
  role: string
): Notification[] {
  const notes: Notification[] = [];

  c3Reports.forEach((r) => {
    const isForPastor = r.status === 'submitted' || r.status === 'reviewed_by_associate';
    const isForC3Minister = r.status === 'revision_requested' || r.status === 'approved_by_resident_pastor';

    if ((role.includes('pastor') && isForPastor) || (role === 'c3_minister' && isForC3Minister)) {
      notes.push({
        id: `notif-c3-${r.id}`,
        type: 'c3',
        title: `${r.c3Name}`,
        body: r.status === 'submitted'
          ? `Report submitted for ${r.meetingDate}. Awaiting your review.`
          : r.status === 'reviewed_by_associate'
          ? `Associate reviewed report for ${r.meetingDate}. Needs Resident Pastor approval.`
          : r.status === 'approved_by_resident_pastor'
          ? `Your report for ${r.meetingDate} has been approved! ✅`
          : `Revision requested for your ${r.meetingDate} report. Please review notes.`,
        status: r.status,
        timestamp: r.updatedAt,
        read: false,
        reportId: r.id,
      });
    }
  });

  serviceTeamReports.forEach((r) => {
    const isForPastor = r.status === 'submitted' || r.status === 'reviewed_by_associate';
    const isForLeader = r.status === 'revision_requested' || r.status === 'approved_by_resident_pastor';

    if ((role.includes('pastor') && isForPastor) || (role === 'service_team_leader' && isForLeader)) {
      notes.push({
        id: `notif-st-${r.id}`,
        type: 'service_team',
        title: `${r.teamName}`,
        body: r.status === 'submitted'
          ? `Team report for ${r.serviceDate} is pending pastoral review.`
          : r.status === 'reviewed_by_associate'
          ? `Associate reviewed team report. Awaiting final approval.`
          : r.status === 'approved_by_resident_pastor'
          ? `Your team report for ${r.serviceDate} has been approved! ✅`
          : `Revision needed on your ${r.serviceDate} team report.`,
        status: r.status,
        timestamp: r.updatedAt,
        read: false,
        reportId: r.id,
      });
    }
  });

  ministryReports.forEach((r) => {
    const isForPastor = r.status === 'submitted';
    const isForLeader = r.status === 'revision_requested' || r.status === 'approved_by_resident_pastor';

    if ((role.includes('pastor') && isForPastor) || (role === 'ministry_leader' && isForLeader)) {
      notes.push({
        id: `notif-min-${r.id}`,
        type: 'ministry',
        title: `${r.ministryName}`,
        body: r.status === 'submitted'
          ? `Ministry team report "${r.reportTitle}" submitted for pastoral review.`
          : r.status === 'approved_by_resident_pastor'
          ? `Your ministry team report "${r.reportTitle}" has been approved! ✅`
          : `Pastoral feedback on your report: please review and resubmit.`,
        status: r.status,
        timestamp: r.updatedAt,
        read: false,
        reportId: r.id,
      });
    }
  });

  // Sort newest first
  return notes.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return 'Just now';
}

const typeIcon = {
  c3: <Users className="w-3.5 h-3.5" />,
  service_team: <Wrench className="w-3.5 h-3.5" />,
  ministry: <Heart className="w-3.5 h-3.5" />,
  service: <Church className="w-3.5 h-3.5" />,
};

const typeBg = {
  c3: 'bg-emerald-100 text-emerald-800',
  service_team: 'bg-sky-100 text-sky-800',
  ministry: 'bg-teal-100 text-teal-800',
  service: 'bg-blue-100 text-blue-800',
};

function statusIcon(status: ReportStatus | 'info') {
  if (status === 'approved_by_resident_pastor') return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
  if (status === 'revision_requested') return <AlertCircle className="w-3.5 h-3.5 text-rose-600" />;
  return <Clock className="w-3.5 h-3.5 text-sky-600" />;
}

export default function NotificationCenter() {
  const { currentUser, c3Reports, serviceTeamReports, ministryReports } = useChurch();
  const [isOpen, setIsOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const notifications = buildNotifications(
    c3Reports,
    serviceTeamReports,
    ministryReports,
    currentUser.role
  );

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  const markAllRead = useCallback(() => {
    setReadIds(new Set(notifications.map((n) => n.id)));
  }, [notifications]);

  const markRead = useCallback((id: string) => {
    setReadIds((prev) => new Set([...prev, id]));
  }, []);

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="relative w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition border border-white/10"
        title="Notifications"
      >
        <Bell className="w-4.5 h-4.5 text-white" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-emerald-500 text-[10px] font-black text-white flex items-center justify-center px-1 shadow">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-11 z-40 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            {/* Panel Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-slate-700" />
                <span className="text-sm font-bold text-slate-900">Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[11px] font-bold">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="flex items-center gap-1 text-[11px] text-[#0a719e] font-semibold hover:underline"
                  >
                    <CheckCheck className="w-3 h-3" />
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-6 h-6 rounded-lg hover:bg-slate-200 flex items-center justify-center"
                >
                  <X className="w-3.5 h-3.5 text-slate-500" />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <div className="py-10 text-center">
                  <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 font-medium">No notifications at this time</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const isRead = readIds.has(n.id);
                  return (
                    <div
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className={`flex gap-3 px-4 py-3 cursor-pointer transition ${
                        isRead ? 'bg-white hover:bg-slate-50' : 'bg-sky-50/50 hover:bg-sky-50'
                      }`}
                    >
                      {/* Type icon */}
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${typeBg[n.type]}`}>
                        {typeIcon[n.type]}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <span className={`text-xs font-bold ${isRead ? 'text-slate-700' : 'text-slate-900'}`}>
                            {n.title}
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {formatRelativeTime(n.timestamp)}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                          {n.body}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          {statusIcon(n.status)}
                          {!isRead && (
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 ml-auto" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50 text-center">
              <p className="text-[11px] text-slate-500">
                Showing alerts relevant to your role · {currentUser.role.replace(/_/g, ' ')}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
