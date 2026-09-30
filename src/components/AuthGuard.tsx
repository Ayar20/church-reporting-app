'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useChurch } from '@/lib/store';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useChurch();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Allow login page always; redirect to login if not logged in
    if (!isLoggedIn && pathname !== '/login') {
      router.replace('/login');
    }
  }, [isLoggedIn, pathname, router]);

  // While checking auth, show nothing on protected routes
  if (!isLoggedIn && pathname !== '/login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a719e] to-[#064d6b] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="w-10 h-10 animate-spin text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-white text-sm font-semibold">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
