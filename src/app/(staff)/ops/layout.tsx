'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import InternalHeader from '@/components/shared/InternalHeader';
import { useStaffAuth } from '@/lib/store/auth-context';
import { BRANCHES_DATA } from '@/lib/mock/data';
import { CalendarDays, PhoneCall, Users, Building2 } from 'lucide-react';

const OPS_TABS = [
  {
    href: '/ops/schedule',
    label: 'Jadwal Hari Ini',
    icon: CalendarDays,
  },
  {
    href: '/ops/concierge',
    label: 'Concierge & Reschedule',
    icon: PhoneCall,
  },
  {
    href: '/ops/clients',
    label: 'Direktori Pelanggan',
    icon: Users,
  },
];

export default function OpsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, role, activeBranchId, setActiveBranchId } = useStaffAuth();

  const isManagerOrExec = role === 'BRANCH_MANAGER' || role === 'EXECUTIVE';

  return (
    <div className="min-h-screen bg-[#0a0c0f] text-zinc-100 flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-200">
      {/* Top Internal Header */}
      <InternalHeader
        title="Branch Operations"
        subtitle="Sanctuary Pipeline & Appointment Board"
      />

      {/* Sub-navigation & Branch Controls */}
      <div className="w-full bg-[#0e1116] border-b border-zinc-800/80 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2 sm:py-0">
            {/* Tab Navigation */}
            <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
              {OPS_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive =
                  pathname === tab.href ||
                  (tab.href === '/ops/schedule' && pathname === '/ops');

                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={`flex items-center gap-2 py-3 px-3.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
                      isActive
                        ? 'border-amber-400 text-amber-300 font-semibold'
                        : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-zinc-500'}`} />
                    <span>{tab.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right: Branch Selector or Branch Indicator */}
            <div className="flex items-center gap-3 pb-2 sm:pb-0">
              {isManagerOrExec ? (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-zinc-500 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Cabang:</span>
                  </span>
                  <select
                    value={activeBranchId || 'senopati'}
                    onChange={(e) => setActiveBranchId(e.target.value)}
                    className="bg-[#14171d] border border-zinc-700/80 rounded-md px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-amber-500/60"
                  >
                    {BRANCHES_DATA.map((b) => (
                      <option key={b.id} value={b.id} className="bg-[#14171d] text-zinc-200">
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-900/80 px-2.5 py-1 rounded border border-zinc-800">
                  <Building2 className="w-3 h-3 text-zinc-500" />
                  <span>{user?.branchName || 'ATMOS Senopati Sanctuary'}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
