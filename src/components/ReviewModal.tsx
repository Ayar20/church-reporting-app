'use client';

import React, { useState } from 'react';
import { useChurch } from '@/lib/store';
import { ReportStatus, C3Report, ServiceTeamReport, MinistryReport } from '@/lib/types';
import { X, ShieldCheck, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  reportType: 'c3' | 'service_team' | 'ministry';
  report: C3Report | ServiceTeamReport | MinistryReport | null;
}

export default function ReviewModal({ isOpen, onClose, reportType, report }: Props) {
  const { currentUser, updateReportReview } = useChurch();
  const [note, setNote] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);

  if (!isOpen || !report) return null;

  const isResidentPastor = currentUser.role === 'resident_pastor';
  const isAssociatePastor = currentUser.role.startsWith('associate_pastor');

  const handleAction = (status: ReportStatus) => {
    updateReportReview(reportType, report.id, status, note);
    setSuccessMsg(true);
    setTimeout(() => {
      setSuccessMsg(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 overflow-y-auto backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Pastoral Review & Approval
              </h3>
              <p className="text-xs text-slate-400">
                {isResidentPastor ? 'Resident Pastor Final Sign-off' : 'Associate Pastor Cluster Review'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successMsg ? (
          <div className="p-10 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Review Submitted!</h4>
            <p className="text-xs text-slate-500 mt-1">
              Status and pastoral notes have been updated.
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            
            {/* Report Highlights */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Unit / Cell:</span>
                <span className="font-bold text-slate-900">
                  {'c3Name' in report
                    ? report.c3Name
                    : 'teamName' in report
                    ? report.teamName
                    : (report as MinistryReport).ministryName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Date:</span>
                <span className="text-slate-800">
                  {'meetingDate' in report ? report.meetingDate : report.serviceDate}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Submitted By:</span>
                <span className="text-slate-800">{report.submittedByName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Current Status:</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 uppercase">
                  {report.status.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            {/* Existing Notes if any */}
            {'associatePastorNotes' in report && report.associatePastorNotes && (
              <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200 text-xs">
                <span className="font-bold text-blue-900 block mb-0.5">
                  Associate Pastor Note:
                </span>
                <p className="text-blue-800">{report.associatePastorNotes}</p>
              </div>
            )}

            {/* Note input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
                Pastoral Directive / Commendation
              </label>
              <textarea
                rows={3}
                placeholder="Enter pastoral commendation, strategic directive, or requested corrections..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Action buttons */}
            <div className="pt-3 border-t border-slate-200 space-y-2">
              {isResidentPastor ? (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleAction('approved_by_resident_pastor')}
                    className="w-full px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve (Final)
                  </button>
                  <button
                    onClick={() => handleAction('revision_requested')}
                    className="w-full px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs transition flex items-center justify-center gap-1.5"
                  >
                    <AlertCircle className="w-4 h-4" />
                    Request Revision
                  </button>
                </div>
              ) : isAssociatePastor ? (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleAction('reviewed_by_associate')}
                    className="w-full px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Mark Reviewed
                  </button>
                  <button
                    onClick={() => handleAction('revision_requested')}
                    className="w-full px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs transition flex items-center justify-center gap-1.5"
                  >
                    <AlertCircle className="w-4 h-4" />
                    Request Revision
                  </button>
                </div>
              ) : (
                <p className="text-xs text-slate-500 text-center italic">
                  Switch to Resident Pastor or Associate Pastor to approve or review.
                </p>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
