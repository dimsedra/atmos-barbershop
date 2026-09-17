'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStaffAuth } from '@/lib/store/auth-context';
import { MOCK_STAFF_USERS, getRoleRedirectPath } from '@/lib/mock/users';
import { StaffRole } from '@/types';

export default function InternalLoginPage() {
  const router = useRouter();
  const { user, login, loginAsRole, logout } = useStaffAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('Harap masukkan username dan password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await login(username, password);
      if (success) {
        // Find user role to determine redirect
        const matched = MOCK_STAFF_USERS.find(
          (u) => u.username.toLowerCase() === username.trim().toLowerCase()
        );
        const destination = matched ? getRoleRedirectPath(matched.role) : '/ops/schedule';
        router.push(destination);
      } else {
        setError('Kredensial tidak valid. Silakan gunakan akun demo yang terdaftar.');
      }
    } catch {
      setError('Terjadi kesalahan saat memproses autentikasi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickSwitch = (role: StaffRole, branchId?: string) => {
    loginAsRole(role, branchId);
    const destination = getRoleRedirectPath(role);
    router.push(destination);
  };

  return (
    <main className="min-h-screen bg-[#0a0b0d] text-zinc-100 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 font-sans">
      {/* Top Header */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between text-xs text-zinc-500">
        <Link
          href="/"
          className="hover:text-zinc-300 transition-colors flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali ke Front of House
        </Link>
        <span className="font-mono text-[11px] tracking-wider uppercase text-zinc-600">
          Internal Systems
        </span>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-md mx-auto my-8">
        <div className="text-center mb-8">
          <span className="font-display text-2xl font-bold tracking-widest text-zinc-100">
            ATMOS
          </span>
          <p className="mt-1 text-xs tracking-wider uppercase text-zinc-400 font-mono">
            Staff & Management Sanctuary Portal
          </p>
        </div>

        {/* Current Active Session Banner (if already logged in) */}
        {user && (
          <div className="mb-6 p-4 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400">Sesi Aktif:</p>
                <p className="font-medium text-zinc-200 mt-0.5">{user.fullName}</p>
                <p className="text-[11px] text-zinc-500">{user.role} · {user.branchName || 'Central'}</p>
              </div>
              <div className="flex flex-col gap-1.5 items-end">
                <button
                  type="button"
                  onClick={() => router.push(getRoleRedirectPath(user.role))}
                  className="px-3 py-1 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-colors text-[11px] font-medium"
                >
                  Buka Portal
                </button>
                <button
                  type="button"
                  onClick={logout}
                  className="text-[11px] text-zinc-500 hover:text-rose-400 transition-colors"
                >
                  Keluar Sesi
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Login Form Container */}
        <div className="bg-[#111317] border border-zinc-800/80 rounded-xl p-6 sm:p-8 shadow-2xl shadow-black/40">
          <form onSubmit={handleStandardLogin} className="space-y-4">
            {error && (
              <div className="p-3 rounded-md bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs leading-relaxed">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="username"
                className="block text-xs font-medium text-zinc-400 mb-1.5 tracking-wide"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="staff.senopati"
                autoComplete="username"
                className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-900/90 border border-zinc-700/80 text-zinc-100 placeholder:text-zinc-600 text-sm focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/40 transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium text-zinc-400 mb-1.5 tracking-wide"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-900/90 border border-zinc-700/80 text-zinc-100 placeholder:text-zinc-600 text-sm focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/40 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-2.5 px-4 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? 'Memverifikasi...' : 'Masuk ke Portal'}
            </button>
          </form>

          {/* Quick Profile Testing / Role Switcher */}
          <div className="mt-8 pt-6 border-t border-zinc-800/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
                Quick Role Testing
              </span>
              <span className="text-[10px] text-zinc-600">Satu klik untuk demonstrasi</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {MOCK_STAFF_USERS.map((account) => (
                <button
                  key={account.id}
                  type="button"
                  onClick={() => handleQuickSwitch(account.role, account.branchId)}
                  className="p-2.5 text-left rounded-lg bg-zinc-900/60 hover:bg-zinc-800/70 border border-zinc-800/70 hover:border-zinc-700 transition-all text-xs group cursor-pointer"
                >
                  <div className="font-medium text-zinc-200 group-hover:text-amber-300 transition-colors flex items-center justify-between">
                    <span>{account.fullName}</span>
                    <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-zinc-800 text-zinc-400">
                      {account.role === 'BRANCH_STAFF' && 'Staff'}
                      {account.role === 'BRANCH_MANAGER' && 'Manager'}
                      {account.role === 'WAREHOUSE_STAFF' && 'Supply'}
                      {account.role === 'EXECUTIVE' && 'HQ'}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-1 truncate">
                    {account.title} · {account.branchName || 'Central'}
                  </div>
                  <div className="text-[10px] text-zinc-600 font-mono mt-0.5">
                    {account.username}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer System Info */}
      <div className="w-full max-w-md mx-auto text-center text-[11px] text-zinc-600">
        ATMOS Internal Security Boundary · All sessions mock-persisted locally.
      </div>
    </main>
  );
}
