'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useChurch } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LogIn, Lock, Mail, AlertCircle, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { DEMO_USERS } from '@/lib/mockData';
import { UserProfile } from '@/lib/types';

// Standard assigned credentials
const DEFAULT_PASSWORDS: Record<string, string> = {
  // Resident Pastor
  'resident.pastor@cfcmakurdi.org': 'resident2024',
  // Associate Pastors
  'assoc.c3@cfcmakurdi.org': 'associate2024',
  'assoc.teams@cfcmakurdi.org': 'associate2024',
  // C3 Ministers
  'faith.nyiman@cfcmakurdi.org': 'minister2024',
  'joshua.gakume@cfcmakurdi.org': 'minister2024',
  'timothy.northbank@cfcmakurdi.org': 'minister2024',
  'peter.gyadovilla@cfcmakurdi.org': 'minister2024',
  'comfort.welfareqtrs@cfcmakurdi.org': 'minister2024',
  'paul.oldgra@cfcmakurdi.org': 'minister2024',
  // Service Team Leaders
  'prayer.lead@cfcmakurdi.org': 'leader2024',
  'music.lead@cfcmakurdi.org': 'leader2024',
  'production.lead@cfcmakurdi.org': 'leader2024',
  'welfare.lead@cfcmakurdi.org': 'leader2024',
  'ushering.lead@cfcmakurdi.org': 'leader2024',
  // Ministry Leaders
  'men.fellowship@cfcmakurdi.org': 'leader2024',
  '31stladies@cfcmakurdi.org': 'leader2024',
  'children.church@cfcmakurdi.org': 'leader2024',
};

const ROLE_LABELS: Record<string, string> = {
  resident_pastor: '👑 Resident Pastor',
  associate_pastor_c3: '🛡️ Associate Pastor (C3s)',
  associate_pastor_service_teams: '🛠️ Associate Pastor (Service Teams)',
  c3_minister: '⛪ C3 Minister',
  service_team_leader: '🎵 Service Team Leader',
  ministry_leader: '🤝 Ministry Leader',
};

export default function LoginPage() {
  const { switchUser, allUsers } = useChurch();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [directoryOpen, setDirectoryOpen] = useState(false);

  // Available users list (prioritize allUsers from DB, fallback to DEMO_USERS)
  const userList: UserProfile[] = allUsers && allUsers.length > 0 ? allUsers : DEMO_USERS;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const normalizedEmail = email.toLowerCase().trim();

    try {
      // 1. Try server-side lookup via Neon DB /api/auth
      let user: UserProfile | null = null;
      try {
        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: normalizedEmail }),
        });
        if (res.ok) {
          const data = await res.json();
          user = data.user;
        }
      } catch {
        // Fallback to local userList if network / offline
      }

      // 2. If not found in DB API, check local userList
      if (!user) {
        user = userList.find((u) => u.email.toLowerCase() === normalizedEmail) || null;
      }

      if (!user) {
        setError('User account not found. Please verify your email or select your leadership account below.');
        setIsLoading(false);
        return;
      }

      // 3. Password Verification
      const expectedPass = DEFAULT_PASSWORDS[normalizedEmail] || 'cfc2024';
      const isMasterPass = password === 'cfc2024' || password === 'password123';
      const isRolePass = password === 'resident2024' || password === 'associate2024' || password === 'minister2024' || password === 'leader2024';
      
      if (password !== expectedPass && !isMasterPass && !isRolePass) {
        setError('Incorrect password. Please use your assigned leadership password or church pass.');
        setIsLoading(false);
        return;
      }

      // 4. Authenticate & redirect
      switchUser(user.id);
      router.push('/');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      setError(message);
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (user: UserProfile) => {
    setEmail(user.email);
    const pass = DEFAULT_PASSWORDS[user.email.toLowerCase()] || 'cfc2024';
    setPassword(pass);
    switchUser(user.id);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a719e] via-[#085a7e] to-[#064d6b] flex flex-col">
      {/* Header */}
      <header className="pt-8 pb-4 flex flex-col items-center gap-3">
        <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-xl p-2">
          <Image
            src="/logowhite.svg"
            alt="Christ Family Ministries"
            width={64}
            height={64}
            className="object-contain"
            priority
          />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-black text-white tracking-tight">
            Christ Family Centre
          </h1>
          <p className="text-sm text-sky-200 font-semibold">Makurdi Branch · Leadership Portal</p>
          <p className="text-xs text-sky-300/80 mt-0.5 italic">
            &ldquo;Love is King&rdquo;
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-start justify-center px-4 pt-2 pb-12">
        <div className="w-full max-w-md space-y-4">

          {/* Login Card */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
            <div className="bg-gradient-to-r from-[#0a719e] to-[#139fdd] px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Church Reporting System</h2>
                <p className="text-xs text-sky-100 mt-0.5">Sign in to your ministerial dashboard</p>
              </div>
              <Shield className="w-6 h-6 text-white/80" />
            </div>

            <form onSubmit={handleLogin} className="p-6 space-y-4">
              {/* Error Alert */}
              {error && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="text-xs font-medium">{error}</p>
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. resident.pastor@cfcmakurdi.org"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#139fdd] focus:border-transparent transition"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password (e.g. cfc2024)"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#139fdd] focus:border-transparent transition"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-200/60 transition cursor-pointer flex items-center justify-center focus:outline-none focus:ring-1 focus:ring-sky-500"
                    title={showPassword ? 'Hide password' : 'Show password'}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 text-slate-700" /> : <Eye className="w-4 h-4 text-slate-500" />}
                  </button>
                </div>
              </div>

              {/* Quick Auto-Fill Chips */}
              <div className="pt-1">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Quick-Fill Leadership Account:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('resident.pastor@cfcmakurdi.org');
                      setPassword('resident2024');
                      setError('');
                    }}
                    className="text-[11px] font-medium px-2 py-1 rounded-md bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition"
                  >
                    👑 Resident Pastor
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('faith.nyiman@cfcmakurdi.org');
                      setPassword('minister2024');
                      setError('');
                    }}
                    className="text-[11px] font-medium px-2 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition"
                  >
                    ⛪ Nyiman C3
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('assoc.teams@cfcmakurdi.org');
                      setPassword('associate2024');
                      setError('');
                    }}
                    className="text-[11px] font-medium px-2 py-1 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition"
                  >
                    🛠️ Service Teams
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('music.lead@cfcmakurdi.org');
                      setPassword('leader2024');
                      setError('');
                    }}
                    className="text-[11px] font-medium px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
                  >
                    🎵 Music Lead
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-[#0a719e] hover:bg-[#085a7e] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm flex items-center justify-center gap-2 transition shadow-md"
              >
                {isLoading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Sign In to Portal
                  </>
                )}
              </button>

              <p className="text-center text-xs text-slate-500 pt-1">
                Forgot password or need access? Contact{' '}
                <span className="text-[#0a719e] font-semibold">CFC Makurdi Admin</span>
              </p>
            </form>
          </div>

          {/* Collapsible Leadership Directory */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-4 space-y-3">
            <button
              type="button"
              onClick={() => setDirectoryOpen((v) => !v)}
              className="w-full flex items-center justify-between text-left text-white"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-200">
                  Church Leadership Directory
                </span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-semibold">
                  {userList.length} Active Accounts
                </span>
              </div>
              {directoryOpen ? <ChevronUp className="w-4 h-4 text-sky-200" /> : <ChevronDown className="w-4 h-4 text-sky-200" />}
            </button>

            {directoryOpen && (
              <div className="grid grid-cols-1 gap-2 pt-2 max-h-80 overflow-y-auto pr-1">
                {userList.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleQuickLogin(user)}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-left transition group"
                  >
                    <div>
                      <p className="text-xs font-bold text-white">{user.fullName}</p>
                      <p className="text-[11px] text-sky-200">
                        {ROLE_LABELS[user.role]}
                        {user.c3Name ? ` · ${user.c3Name}` : ''}
                        {user.serviceTeamName ? ` · ${user.serviceTeamName}` : ''}
                        {user.ministryName ? ` · ${user.ministryName}` : ''}
                      </p>
                    </div>
                    <LogIn className="w-3.5 h-3.5 text-white/50 group-hover:text-white transition shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="text-center pb-6 text-[11px] text-sky-200/60 space-y-1">
        <p>© {new Date().getFullYear()} Christ Family Centre Makurdi · All rights reserved</p>
        <p className="text-[10px] text-sky-300/40">Powered by Neon Serverless PostgreSQL & Vercel</p>
      </footer>
    </div>
  );
}
