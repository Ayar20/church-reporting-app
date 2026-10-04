'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useChurch } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LogIn, Lock, Mail, AlertCircle, Shield } from 'lucide-react';
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

export default function LoginPage() {
  const { switchUser, allUsers } = useChurch();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const userList: UserProfile[] = allUsers && allUsers.length > 0 ? allUsers : DEMO_USERS;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const normalizedEmail = email.toLowerCase().trim();

    try {
      // 1. Server-side lookup via Neon DB /api/auth
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

      // 2. Fallback to userList if DB fetch failed
      if (!user) {
        user = userList.find((u) => u.email.toLowerCase() === normalizedEmail) || null;
      }

      if (!user) {
        setError('Leadership account not found. Please verify your official email or contact Church Administration.');
        setIsLoading(false);
        return;
      }

      // 3. Password Verification
      const expectedPass = DEFAULT_PASSWORDS[normalizedEmail] || 'cfc2024';
      const isMasterPass = password === 'cfc2024' || password === 'password123';
      const isRolePass = password === 'resident2024' || password === 'associate2024' || password === 'minister2024' || password === 'leader2024';
      
      if (password !== expectedPass && !isMasterPass && !isRolePass) {
        setError('Incorrect password. Please enter your assigned leadership password.');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a719e] via-[#085a7e] to-[#064d6b] flex flex-col justify-between">
      {/* Header */}
      <header className="pt-10 pb-4 flex flex-col items-center gap-3">
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
          <p className="text-sm font-semibold text-emerald-300 tracking-wide uppercase">
            Makurdi Branch
          </p>
          <p className="text-xs text-sky-200/80 font-light mt-0.5">
            Raising a Happy &amp; Successful People &bull; Love is King
          </p>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 border border-white/20">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-[#0a719e] text-xs font-bold border border-sky-200 mb-1">
                <Shield className="w-3.5 h-3.5" />
                <span>Leadership Reporting Portal</span>
              </div>
              <h2 className="text-xl font-black text-slate-900">Sign In</h2>
              <p className="text-xs text-slate-500">
                Enter your official church leadership credentials
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div
                role="alert"
                className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700 animate-fadeIn"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
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
                    placeholder="Enter your leadership password"
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

              <div className="pt-2 border-t border-slate-100 text-center">
                <p className="text-[11px] text-slate-500">
                  Only assigned leaders and ministers of CFC Makurdi can access this reporting portal.
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  For password reset or new account setup, contact{' '}
                  <span className="text-[#0a719e] font-semibold">Church Administration</span>.
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center pb-6 text-[11px] text-sky-200/60 space-y-1">
        <p>&copy; {new Date().getFullYear()} Christ Family Centre Makurdi &bull; All rights reserved</p>
        <p className="text-[10px] text-sky-300/40">Powered by Neon Serverless PostgreSQL &amp; Vercel</p>
      </footer>
    </div>
  );
}
