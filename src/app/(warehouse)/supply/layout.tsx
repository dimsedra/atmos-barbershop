'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import InternalHeader from '@/components/shared/InternalHeader';
import { useInventoryStore } from '@/lib/store/inventory-store';

interface SupplyLayoutProps {
  children: React.ReactNode;
}

export default function SupplyLayout({ children }: SupplyLayoutProps) {
  const pathname = usePathname();
  const { getExpiringBatchesCount, getOrdersByStatusCount, getPendingRequisitionsCount } =
    useInventoryStore();

  const expiringCount = getExpiringBatchesCount(30);
  const paidOrdersCount = getOrdersByStatusCount('PAID');
  const pendingReqsCount = getPendingRequisitionsCount();

  const navItems = [
    {
      label: 'Manajemen Batch',
      href: '/supply/batches',
      badge: expiringCount > 0 ? `${expiringCount} rotasi` : null,
      badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    },
    {
      label: 'Antrean Order Web',
      href: '/supply/orders',
      badge: paidOrdersCount > 0 ? `${paidOrdersCount} kemas` : null,
      badgeColor: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    },
    {
      label: 'Restock Cabang',
      href: '/supply/requisitions',
      badge: pendingReqsCount > 0 ? `${pendingReqsCount} persetujuan` : null,
      badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    },
  ];

  return (
    <div className="min-h-screen bg-[#090b0e] text-zinc-100 flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-200">
      {/* Top Staff Navigation Header */}
      <InternalHeader
        title="Central Supply"
        subtitle="Logistik & Pergudangan Pusat"
      />

      {/* Sub-navigation Tabs */}
      <div className="border-b border-zinc-800/80 bg-[#0d0f14]/80 backdrop-blur sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-2 py-2 overflow-x-auto no-scrollbar">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-zinc-800/90 text-zinc-100 border border-zinc-700/60 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border border-transparent'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded-full border ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Page Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
