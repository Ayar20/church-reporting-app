'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useChurch } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LogIn, Lock, Mail, AlertCircle } from 'lucide-react';
import { DEMO_USERS } from '@/lib/mockData';

// Demo credential map: email -> password (for prototype)
const DEMO_CREDENTIALS: Record<string, string> = {
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
  'women.fellowship@cfcmakurdi.org': 'leader2024',
  'youth.fellowship@cfcmakurdi.org': 'leader2024',
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
  const { switchUser } = useChurch();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate async auth check
    await new Promise((r) => setTimeout(r, 400));

    const normalizedEmail = email.toLowerCase().trim();
    // Find matching user
    const user = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === normalizedEmail
    );
    if (!user) {
      setError('User account not found. Please choose one of the sample accounts below.');
      setIsLoading(false);
      return;
    }

    const expectedPass = DEMO_CREDENTIALS[normalizedEmail] || 'password123';
    // Accept user-specific password, or universal test passwords
    if (password !== expectedPass && password !== 'cfc2024' && password !== 'password123') {
      setError(`Invalid password. For demo testing, you can use "${expectedPass}" or "cfc2024".`);
      setIsLoading(false);
      return;
    }

    switchUser(user.id);
    router.push('/');
  };

  const handleQuickLogin = (userId: string) => {
    switchUser(userId);
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
          <h1 className="text-xl font-black text-white tracking-tight">
            Christ Family Centre
          </h1>
          <p className="text-sm text-sky-200 font-medium">Makurdi Branch</p>
          <p className="text-xs text-sky-300/70 mt-0.5 italic">
            &ldquo;Love is King&rdquo;
          </p>
        </div>
      </header>

      {/* Login Card */}
      <main className="flex-1 flex items-start justify-center px-4 pt-4 pb-10">
        <div className="w-full max-w-md space-y-4">

          {/* Login Form Card */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#0a719e] to-[#139fdd] px-6 py-4">
              <h2 className="text-base font-bold text-white">Church Reporting Portal</h2>
              <p className="text-xs text-sky-100 mt-0.5">Sign in with your assigned credentials</p>
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Quick Fill Demo Credentials */}
              <div className="pt-1">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Click to Auto-fill Demo Account:
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
                    🛠️ Service Teams Pastor
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

              {/* Submit */}
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
                    Sign In
                  </>
                )}
              </button>

              <p className="text-center text-xs text-slate-500">
                Forgot your password? Contact{' '}
                <span className="text-[#0a719e] font-semibold">the church administrator</span>
              </p>
            </form>
          </div>

          {/* Quick Demo Access */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-white/20" />
              <p className="text-xs font-bold text-white/70 uppercase tracking-wider px-2">
                Demo Quick Access
              </p>
              <div className="h-px flex-1 bg-white/20" />
            </div>

            <div className="grid grid-cols-1 gap-2">
              {DEMO_USERS.slice(0, 6).map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleQuickLogin(user.id)}
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
                  <LogIn className="w-3.5 h-3.5 text-white/50 group-hover:text-white transition" />
                </button>
              ))}
            </div>

            <p className="text-center text-[11px] text-white/40">
              Demo mode — no real authentication. For production, connect Supabase Auth.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center pb-6 text-[11px] text-sky-300/50">
        © {new Date().getFullYear()} Christ Family Ministries · All rights reserved
      </footer>
    </div>
  );
}
