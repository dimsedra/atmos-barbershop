'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import InternalHeader from '@/components/shared/InternalHeader';
import { useStaffAuth } from '@/lib/store/auth-context';
import { BRANCHES_DATA } from '@/lib/mock/data';
import { LayoutDashboard, TrendingUp, Building2, PackageCheck, Lock, Globe2 } from 'lucide-react';

const HQ_TABS = [
  {
    href: '/hq/overview',
    label: 'Overview & Metrik',
    icon: LayoutDashboard,
  },
  {
    href: '/hq/finance',
    label: 'Keuangan & P&L',
    icon: TrendingUp,
  },
  {
    href: '/hq/branches',
    label: 'Direktori Cabang',
    icon: Building2,
  },
  {
    href: '/hq/requisitions',
    label: 'Restock Permintaan',
    icon: PackageCheck,
  },
];

export default function HqLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, role, activeBranchId, setActiveBranchId } = useStaffAuth();

  const isExecutive = role === 'EXECUTIVE';
  const isBranchManager = role === 'BRANCH_MANAGER';

  // Get name of branch for manager
  const assignedBranch = BRANCHES_DATA.find(
    (b) => b.id === (activeBranchId || user?.branchId || 'senopati')
  );

  return (
    <div className="min-h-screen bg-[#090b0e] text-zinc-100 flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-200">
      {/* Top Staff Navigation Header */}
      <InternalHeader
        title="Executive & Management HQ"
        subtitle="Jabodetabek Multi-Branch Intelligence & P&L Oversight"
      />

      {/* Sub-navigation & Multi-Branch Scoping Bar */}
      <div className="border-b border-zinc-800/80 bg-[#0d1015]/95 backdrop-blur sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2 sm:py-0">
            {/* Tab Navigation */}
            <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
              {HQ_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive =
                  pathname === tab.href ||
                  (tab.href === '/hq/overview' && (pathname === '/hq' || pathname === '/hq/'));

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

            {/* Right Scope Switcher: Executive has global switcher, Branch Manager is locked */}
            <div className="flex items-center gap-3 pb-2 sm:pb-0">
              {isExecutive ? (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-zinc-500 flex items-center gap-1.5 font-medium">
                    <Globe2 className="w-3.5 h-3.5 text-purple-400" />
                    <span>Cakupan HQ:</span>
                  </span>
                  <select
                    value={activeBranchId || 'all'}
                    onChange={(e) => setActiveBranchId(e.target.value === 'all' ? null : e.target.value)}
                    className="bg-[#141720] border border-zinc-700/80 rounded-md px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500/70 cursor-pointer shadow-inner"
                  >
                    <option value="all" className="bg-[#141720] text-amber-300 font-medium">
                      ★ Semua Cabang (Jabodetabek Consolidated)
                    </option>
                    {BRANCHES_DATA.map((b) => (
                      <option key={b.id} value={b.id} className="bg-[#141720] text-zinc-200">
                        {b.name} ({b.area})
                      </option>
                    ))}
                  </select>
                </div>
              ) : isBranchManager ? (
                <div className="flex items-center gap-2 text-xs bg-zinc-900/90 border border-zinc-800 px-3 py-1.5 rounded-md text-zinc-300">
                  <Lock className="w-3 h-3 text-amber-400/80" />
                  <span className="text-zinc-500">Cabang Terkunci:</span>
                  <span className="font-semibold text-zinc-200">
                    {assignedBranch?.name || user?.branchName || 'ATMOS Senopati Sanctuary'}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-900/80 px-2.5 py-1 rounded border border-zinc-800">
                  <Building2 className="w-3 h-3 text-zinc-500" />
                  <span>{user?.branchName || 'ATMOS HQ'}</span>
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
