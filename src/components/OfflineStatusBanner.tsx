'use client';

import React from 'react';
import { useChurch } from '@/lib/store';
import { WifiOff, RefreshCw, CheckCircle2, CloudUpload } from 'lucide-react';

export default function OfflineStatusBanner() {
  const { isOnline, pendingSyncCount, isSyncing, syncOfflineOutbox } = useChurch();

  if (isOnline && pendingSyncCount === 0 && !isSyncing) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={`w-full py-2 px-4 transition-all duration-300 text-xs font-semibold flex items-center justify-between border-b shadow-xs ${
        !isOnline
          ? 'bg-amber-500 text-slate-950 border-amber-600'
          : isSyncing
          ? 'bg-sky-600 text-white border-sky-700'
          : 'bg-emerald-600 text-white border-emerald-700'
      }`}
    >
      <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
        <div className="flex items-center gap-2">
          {!isOnline ? (
            <>
              <WifiOff className="w-4 h-4 shrink-0 animate-pulse text-slate-950" />
              <span>
                <strong>Offline Mode:</strong> Working offline. Reports &amp; edits are saved locally and will sync automatically when back online.
              </span>
            </>
          ) : isSyncing ? (
            <>
              <RefreshCw className="w-4 h-4 shrink-0 animate-spin text-white" />
              <span>Syncing {pendingSyncCount} pending report(s) to church server...</span>
            </>
          ) : (
            <>
              <CloudUpload className="w-4 h-4 shrink-0 text-emerald-100" />
              <span>
                {pendingSyncCount} pending offline report(s) ready to sync.
              </span>
            </>
          )}
        </div>

        {isOnline && pendingSyncCount > 0 && !isSyncing && (
          <button
            onClick={() => syncOfflineOutbox()}
            className="shrink-0 ml-3 px-3 py-1 bg-white text-emerald-800 hover:bg-emerald-50 rounded-lg text-xs font-bold transition shadow-xs flex items-center gap-1.5"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Sync Now</span>
          </button>
        )}
      </div>
    </div>
  );
}
