'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useStaffAuth } from '@/lib/store/auth-context';
import { useBookingStore } from '@/lib/store/booking-store';
import { useInventoryStore } from '@/lib/store/inventory-store';
import { BRANCHES_DATA, CAPSTERS_DATA } from '@/lib/mock/data';
import {
  Armchair,
  Users,
  AlertTriangle,
  CalendarCheck,
  Star,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

const BRANCH_CHAIR_CAPACITY: Record<string, number> = {
  senopati: 6,
  pik: 8,
  menteng: 5,
  bsd: 6,
  kelapagading: 6,
  bekasi: 5,
};

export default function HqOverviewPage() {
  const { user, role, activeBranchId } = useStaffAuth();
  const { bookings } = useBookingStore();
  const { requisitions, batches, getExpiringBatchesCount } = useInventoryStore();

  const isExecutive = role === 'EXECUTIVE';
  const effectiveBranchId = isExecutive ? activeBranchId : activeBranchId || user?.branchId || 'senopati';
  const isConsolidated = isExecutive && !effectiveBranchId;

  // Selected branch object if scoped
  const selectedBranch = useMemo(
    () => BRANCHES_DATA.find((b) => b.id === effectiveBranchId),
    [effectiveBranchId]
  );

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const currentMonthStr = useMemo(() => todayStr.slice(0, 7), [todayStr]);

  // Filter bookings for scope
  const scopedBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchBranch = isConsolidated ? true : b.branchId === effectiveBranchId;
      return matchBranch;
    });
  }, [bookings, isConsolidated, effectiveBranchId]);

  // Today's bookings
  const todayBookings = useMemo(() => {
    return scopedBookings.filter((b) => b.date === todayStr);
  }, [scopedBookings, todayStr]);

  // Month's completed bookings
  const monthCompletedBookings = useMemo(() => {
    return scopedBookings.filter(
      (b) => b.status === 'COMPLETED' && b.date && b.date.startsWith(currentMonthStr)
    );
  }, [scopedBookings, currentMonthStr]);

  // Occupancy calculation
  const totalChairs = useMemo(() => {
    if (isConsolidated) {
      return Object.values(BRANCH_CHAIR_CAPACITY).reduce((a, b) => a + b, 0);
    }
    return BRANCH_CHAIR_CAPACITY[effectiveBranchId || 'senopati'] || 6;
  }, [isConsolidated, effectiveBranchId]);

  // Approximate 8 slots per chair daily
  const dailyTotalSlotCapacity = totalChairs * 8;
  const occupancyPercent = Math.min(
    100,
    Math.round((todayBookings.length / (dailyTotalSlotCapacity || 1)) * 100)
  );

  // Filter capsters for scope
  const scopedCapsters = useMemo(() => {
    return CAPSTERS_DATA.filter((c) => {
      return isConsolidated ? true : c.branchId === effectiveBranchId;
    });
  }, [isConsolidated, effectiveBranchId]);

  // Requisitions & supply health alerts
  const scopedRequisitions = useMemo(() => {
    return requisitions.filter((r) => {
      return isConsolidated ? true : r.branchId === effectiveBranchId;
    });
  }, [requisitions, isConsolidated, effectiveBranchId]);

  const pendingRequisitions = useMemo(() => {
    return scopedRequisitions.filter((r) => r.status === 'PENDING');
  }, [scopedRequisitions]);

  const expiringCount = getExpiringBatchesCount(30);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner / Context Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-amber-400 mb-1">
            <span>Operasional & Okupansi</span>
            <span>·</span>
            <span>{isConsolidated ? 'Jabodetabek Network' : selectedBranch?.name || 'Cabang'}</span>
          </div>
          <h1 className="text-2xl font-display font-semibold text-zinc-100 tracking-tight">
            {isConsolidated
              ? 'Multi-Branch Performance Cockpit'
              : `Dasbor Eksekutif ${selectedBranch?.name || ''}`}
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Pantauan live kapasitas kursi, produktivitas tim capster, dan status suplai backbar salon.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/hq/finance"
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-200 transition-colors"
          >
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            <span>Lihat Laporan P&L</span>
          </Link>
          <Link
            href="/hq/requisitions"
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-semibold shadow-sm transition-colors"
          >
            <span>Permintaan Restock</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Occupancy Card */}
        <div className="bg-[#0e1117] border border-zinc-800/90 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Okupansi Kursi Hari Ini</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Armchair className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-display font-semibold text-zinc-100">
              {occupancyPercent}%
            </span>
            <span className="text-xs text-zinc-500">
              ({todayBookings.length} dari {dailyTotalSlotCapacity} slot)
            </span>
          </div>
          <div className="mt-3 w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, occupancyPercent)}%` }}
            />
          </div>
          <div className="mt-2 text-[11px] text-zinc-500">
            Kapasitas {totalChairs} kursi barber aktif
          </div>
        </div>

        {/* Bookings Card */}
        <div className="bg-[#0e1117] border border-zinc-800/90 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Reservasi Hari Ini</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-display font-semibold text-zinc-100">
              {todayBookings.length}
            </span>
            <span className="text-xs text-emerald-400">
              {todayBookings.filter((b) => b.status === 'COMPLETED').length} selesai
            </span>
          </div>
          <p className="mt-3 text-[11px] text-zinc-500">
            {scopedBookings.filter((b) => b.status === 'IN_SERVICE').length} sedang dilayani saat ini
          </p>
        </div>

        {/* Capster Productivity */}
        <div className="bg-[#0e1117] border border-zinc-800/90 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Tim Capster Aktif</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-display font-semibold text-zinc-100">
              {scopedCapsters.length}
            </span>
            <span className="text-xs text-zinc-500">stylist master</span>
          </div>
          <p className="mt-3 text-[11px] text-zinc-500">
            Total {monthCompletedBookings.length} layanan ditangani bulan ini
          </p>
        </div>

        {/* Supply Alerts */}
        <div className="bg-[#0e1117] border border-zinc-800/90 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Status Suplai Backbar</span>
            <div
              className={`p-2 rounded-lg border ${
                pendingRequisitions.length > 0
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-display font-semibold text-zinc-100">
              {pendingRequisitions.length}
            </span>
            <span className="text-xs text-zinc-500">permintaan restock pending</span>
          </div>
          <p className="mt-3 text-[11px] text-zinc-500">
            {expiringCount > 0
              ? `${expiringCount} batch mendekati masa kedaluwarsa di gudang pusat`
              : 'Stok logistik terpantau aman'}
          </p>
        </div>
      </div>

      {/* Jabodetabek Multi-Branch Comparison (for Executive Consolidated View) */}
      {isConsolidated && (
        <div className="bg-[#0e1117] border border-zinc-800/90 rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-zinc-800/80 bg-[#121620]/60 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-zinc-200">
                Peta Utilisasi Kursi Seluruh Cabang Jabodetabek
              </h2>
              <p className="text-xs text-zinc-400">
                Pemantauan real-time kapasitas kursi dan beban reservasi lintas cabang
              </p>
            </div>
            <span className="text-[11px] font-mono text-zinc-400 bg-zinc-800/60 px-2.5 py-1 rounded">
              6 Cabang Terintegrasi
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-800 bg-zinc-900/40 text-zinc-400">
                <tr>
                  <th className="px-6 py-3 font-medium">Cabang Studio</th>
                  <th className="px-6 py-3 font-medium">Wilayah</th>
                  <th className="px-6 py-3 font-medium">Kapasitas Kursi</th>
                  <th className="px-6 py-3 font-medium">Reservasi Hari Ini</th>
                  <th className="px-6 py-3 font-medium">Tingkat Okupansi</th>
                  <th className="px-6 py-3 font-medium">Status Operasional</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
                {BRANCHES_DATA.map((branch) => {
                  const bCapacity = BRANCH_CHAIR_CAPACITY[branch.id] || 6;
                  const bBookingsToday = bookings.filter(
                    (b) => b.branchId === branch.id && b.date === todayStr
                  );
                  const bOccupancy = Math.min(
                    100,
                    Math.round((bBookingsToday.length / (bCapacity * 8)) * 100)
                  );

                  return (
                    <tr key={branch.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-3.5 font-medium text-zinc-100">
                        {branch.name}
                      </td>
                      <td className="px-6 py-3.5 text-zinc-400">{branch.area}</td>
                      <td className="px-6 py-3.5 font-mono">{bCapacity} Kursi</td>
                      <td className="px-6 py-3.5 font-mono">{bBookingsToday.length} Tamu</td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-20 bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-amber-400 h-full rounded-full"
                              style={{ width: `${bOccupancy}%` }}
                            />
                          </div>
                          <span className="font-mono text-zinc-300">{bOccupancy}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Beroperasi Optimal</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Capster Productivity Roster */}
      <div className="bg-[#0e1117] border border-zinc-800/90 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-zinc-800/80 bg-[#121620]/60 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-zinc-200">
              Produktivitas & Kinerja Capster
            </h2>
            <p className="text-xs text-zinc-400">
              Layanan terselesaikan, komisi terakumulasi, dan evaluasi rating kepuasan
            </p>
          </div>
          <span className="text-xs text-zinc-400">
            {scopedCapsters.length} Capster Terdaftar
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-800 bg-zinc-900/40 text-zinc-400">
              <tr>
                <th className="px-6 py-3 font-medium">Nama Capster</th>
                <th className="px-6 py-3 font-medium">Peran / Gelar</th>
                <th className="px-6 py-3 font-medium">Cabang</th>
                <th className="px-6 py-3 font-medium">Rating Tamu</th>
                <th className="px-6 py-3 font-medium">Layanan Selesai (Bulan Ini)</th>
                <th className="px-6 py-3 font-medium">Estimasi Revenue Dihasilkan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
              {scopedCapsters.map((capster) => {
                const capsterCompleted = bookings.filter(
                  (b) =>
                    b.capsterId === capster.id &&
                    b.status === 'COMPLETED' &&
                    b.date &&
                    b.date.startsWith(currentMonthStr)
                );
                const revenueGenerated = capsterCompleted.reduce(
                  (sum, b) => sum + (b.servicePrice || 0),
                  0
                );
                const branchName =
                  BRANCHES_DATA.find((b) => b.id === capster.branchId)?.name || capster.branchId;

                return (
                  <tr key={capster.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-3.5 font-medium text-zinc-100 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-semibold text-amber-300">
                        {capster.name.charAt(0)}
                      </div>
                      <span>{capster.name}</span>
                    </td>
                    <td className="px-6 py-3.5 text-zinc-400">{capster.role}</td>
                    <td className="px-6 py-3.5 text-zinc-400">{branchName}</td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-1 text-amber-300">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="font-mono">{capster.rating.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 font-mono text-zinc-200">
                      {capsterCompleted.length} Layanan
                    </td>
                    <td className="px-6 py-3.5 font-mono text-zinc-100">
                      Rp {new Intl.NumberFormat('id-ID').format(revenueGenerated)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supply & Backbar Health Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Requisitions Alert Box */}
        <div className="bg-[#0e1117] border border-zinc-800/90 rounded-xl p-5">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
            <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Permintaan Restock Menunggu (Pending)</span>
            </h3>
            <Link
              href="/hq/requisitions"
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <span>Kelola Permintaan</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {pendingRequisitions.length === 0 ? (
              <div className="py-6 text-center text-xs text-zinc-500">
                Tidak ada permintaan restock yang menunggu persetujuan gudang.
              </div>
            ) : (
              pendingRequisitions.map((req) => (
                <div
                  key={req.id}
                  className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-zinc-200">{req.branchName}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {req.id}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-1">
                      {req.items.map((i) => `${i.quantityRequested}x ${i.productName}`).join(', ')}
                    </div>
                    {req.notes && (
                      <div className="text-[10px] text-zinc-500 mt-1 italic">&quot;{req.notes}&quot;</div>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-800/40 font-medium">
                      PENDING GUDANG
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Central Warehouse Health & Guidance */}
        <div className="bg-[#0e1117] border border-zinc-800/90 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2 pb-3 border-b border-zinc-800/80">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Pedoman Operasional Backbar & Sanitasi</span>
            </h3>

            <div className="mt-4 space-y-3 text-xs text-zinc-400 leading-relaxed">
              <p>
                <span className="text-zinc-200 font-medium">Rotasi FEFO:</span> Penggunaan produk backbar
                (Silver Birch Elixir, ASMR Scalp Tonic) dianjurkan mematuhi batas kedaluwarsa batch
                terdekat untuk menjaga kesegaran formula minyak esensial organik.
              </p>
              <p>
                <span className="text-zinc-200 font-medium">Rekonsiliasi Laba Rugi:</span> Setiap
                permintaan produk yang telah didispatch oleh Gudang Pusat akan otomatis dibukukan
                sebagai beban pemakaian produk salon pada laporan keuangan P&L cabang.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
            <span>Total {batches.length} batch terdaftar di Gudang Pusat</span>
            <Link href="/supply" className="text-zinc-400 hover:text-zinc-200 underline">
              Buka Central Supply Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
