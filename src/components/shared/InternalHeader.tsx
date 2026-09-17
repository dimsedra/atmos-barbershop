'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useStaffAuth } from '@/lib/store/auth-context';
import { StaffRole } from '@/types';

interface InternalHeaderProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

const ROLE_LABELS: Record<StaffRole, { name: string; tagClass: string }> = {
  BRANCH_STAFF: {
    name: 'Branch Staff',
    tagClass: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40',
  },
  BRANCH_MANAGER: {
    name: 'Branch Manager',
    tagClass: 'bg-blue-950/60 text-blue-300 border-blue-800/40',
  },
  WAREHOUSE_STAFF: {
    name: 'Central Supply',
    tagClass: 'bg-amber-950/60 text-amber-300 border-amber-800/40',
  },
  EXECUTIVE: {
    name: 'Executive HQ',
    tagClass: 'bg-purple-950/60 text-purple-300 border-purple-800/40',
  },
};

export default function InternalHeader({ title, subtitle, actions }: InternalHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, role, logout } = useStaffAuth();

  const handleLogout = () => {
    logout();
    router.push('/internal/login');
  };

  const roleMeta = role ? ROLE_LABELS[role] : null;

  const currentPortal = pathname.startsWith('/hq')
    ? 'HQ'
    : pathname.startsWith('/supply')
    ? 'Supply'
    : pathname.startsWith('/ops')
    ? 'Ops'
    : 'Internal';

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0d0f12]/95 backdrop-blur border-b border-zinc-800/70 text-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Identity & Current Context */}
        <div className="flex items-center gap-4">
          <Link href="/internal/login" className="flex items-center gap-2.5 group">
            <span className="font-display font-semibold tracking-wider text-base text-zinc-100 group-hover:text-amber-300 transition-colors">
              ATMOS
            </span>
            <span className="text-[10px] tracking-widest font-mono uppercase px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-400 border border-zinc-700/50">
              {currentPortal}
            </span>
          </Link>

          {(title || subtitle) && (
            <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-zinc-800">
              {title && <h1 className="text-sm font-medium text-zinc-200">{title}</h1>}
              {subtitle && <span className="text-xs text-zinc-400 font-normal">· {subtitle}</span>}
            </div>
          )}
        </div>

        {/* Right: Assigned Branch, Role Badge, User Info, Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {actions && <div className="flex items-center gap-2">{actions}</div>}

          {user ? (
            <div className="flex items-center gap-3">
              {/* Branch / Location Badge */}
              <div className="hidden md:flex items-center gap-1.5 text-xs text-zinc-400">
                <svg
                  className="w-3.5 h-3.5 text-zinc-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>{user.branchName || 'Central Hub'}</span>
              </div>

              {/* Role Pill */}
              {roleMeta && (
                <span
                  className={`text-[11px] font-medium tracking-wide uppercase px-2.5 py-1 rounded-full border ${roleMeta.tagClass}`}
                >
                  {roleMeta.name}
                </span>
              )}

              {/* User Name & Dropdown / Controls */}
              <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-zinc-800">
                <div className="hidden sm:block text-right">
                  <div className="text-xs font-medium text-zinc-200">{user.fullName}</div>
                </div>

                {/* Quick Switch Role */}
                <Link
                  href="/internal/login"
                  title="Switch Staff Role"
                  className="text-xs text-zinc-400 hover:text-amber-300 px-2.5 py-1 rounded hover:bg-zinc-800/60 transition-colors border border-transparent hover:border-zinc-700/60"
                >
                  Switch
                </Link>

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Keluar / Sign Out"
                  aria-label="Sign out"
                  className="text-xs text-zinc-400 hover:text-rose-400 p-1.5 rounded hover:bg-zinc-800/60 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.7}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <Link
              href="/internal/login"
              className="text-xs font-medium text-zinc-300 hover:text-white px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 transition-colors"
            >
              Staff Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
