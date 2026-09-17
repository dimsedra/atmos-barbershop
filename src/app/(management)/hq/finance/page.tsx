'use client';

import React, { useState, useMemo } from 'react';
import { useStaffAuth } from '@/lib/store/auth-context';
import { useFinanceStore } from '@/lib/store/finance-store';
import { BRANCHES_DATA } from '@/lib/mock/data';
import ManualExpenseModal from '@/components/hq/ManualExpenseModal';
import {
  TrendingUp,
  DollarSign,
  Users,
  Package,
  Receipt,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  Building2,
} from 'lucide-react';

const MONTH_OPTIONS = [
  { value: '2026-09', label: 'September 2026 (Periode Berjalan)' },
  { value: '2026-08', label: 'Agustus 2026' },
  { value: '2026-07', label: 'Juli 2026' },
];

export default function HqFinancePage() {
  const { user, role, activeBranchId } = useStaffAuth();
  const { getBranchMonthlyReport, getJabodetabekSummary, deleteExpense } = useFinanceStore();

  const [selectedMonth, setSelectedMonth] = useState('2026-09');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const isExecutive = role === 'EXECUTIVE';
  const isBranchManager = role === 'BRANCH_MANAGER';
  const effectiveBranchId = isExecutive ? activeBranchId : activeBranchId || user?.branchId || 'senopati';
  const isConsolidated = isExecutive && !effectiveBranchId;

  // Selected branch data
  const selectedBranch = useMemo(
    () => BRANCHES_DATA.find((b) => b.id === effectiveBranchId),
    [effectiveBranchId]
  );

  // Single branch report
  const branchReport = useMemo(() => {
    if (isConsolidated) return null;
    return getBranchMonthlyReport(effectiveBranchId || 'senopati', selectedMonth);
  }, [getBranchMonthlyReport, effectiveBranchId, selectedMonth, isConsolidated]);

  // Consolidated Jabodetabek summary
  const consolidatedReport = useMemo(() => {
    if (!isConsolidated) return null;
    return getJabodetabekSummary(selectedMonth);
  }, [getJabodetabekSummary, selectedMonth, isConsolidated]);

  const formatIDR = (num: number) => {
    return `Rp ${new Intl.NumberFormat('id-ID').format(num)}`;
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Context Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-amber-400 mb-1">
            <span>Rekonsiliasi Keuangan & P&L</span>
            <span>·</span>
            <span>{isConsolidated ? 'Jabodetabek Consolidated' : selectedBranch?.name || ''}</span>
          </div>
          <h1 className="text-2xl font-display font-semibold text-zinc-100 tracking-tight">
            Laporan Laba Rugi Operasional (P&L)
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Otomatisasi kalkulasi margin laba bersih dari pendapatan layanan, beban payroll, alokasi
            produk salon, dan biaya operasional.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Month Selector */}
          <div className="flex items-center gap-1.5 bg-[#121620] border border-zinc-700/80 rounded-lg px-3 py-1.5 text-xs text-zinc-300">
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent border-none text-zinc-200 focus:outline-none cursor-pointer"
            >
              {MONTH_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#121620] text-zinc-200">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Log Manual Expense Button (Branch Manager Only) */}
          {isBranchManager && (
            <button
              type="button"
              onClick={() => setIsExpenseModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-semibold shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Catat Beban Operasional</span>
            </button>
          )}

          {isExecutive && (
            <div className="text-[11px] text-zinc-500 bg-zinc-900/80 px-3 py-1.5 rounded-lg border border-zinc-800">
              Pencatatan beban cabang didelegasikan ke Branch Manager
            </div>
          )}
        </div>
      </div>

      {/* Main KPI Summary Cards */}
      {isConsolidated && consolidatedReport ? (
        // Executive Consolidated Metrics Strip
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0e1117] border border-zinc-800/90 rounded-xl p-5 shadow-sm">
            <span className="text-xs font-medium text-zinc-400">Total Pendapatan Layanan (6 Cabang)</span>
            <div className="mt-3 text-2xl font-display font-semibold text-emerald-400">
              {formatIDR(consolidatedReport.totalGrossRevenue)}
            </div>
            <div className="mt-2 text-[11px] text-zinc-500">
              Dari {consolidatedReport.totalCompletedBookings} layanan selesai
            </div>
          </div>

          <div className="bg-[#0e1117] border border-zinc-800/90 rounded-xl p-5 shadow-sm">
            <span className="text-xs font-medium text-zinc-400">Total Payroll & Komisi</span>
            <div className="mt-3 text-2xl font-display font-semibold text-rose-300">
              {formatIDR(consolidatedReport.totalPayroll)}
            </div>
            <div className="mt-2 text-[11px] text-zinc-500">
              Gaji pokok tim studio + komisi layanan
            </div>
          </div>

          <div className="bg-[#0e1117] border border-zinc-800/90 rounded-xl p-5 shadow-sm">
            <span className="text-xs font-medium text-zinc-400">Produk & Beban Operasional</span>
            <div className="mt-3 text-2xl font-display font-semibold text-rose-300">
              {formatIDR(
                consolidatedReport.totalSalonProductDeductions +
                  consolidatedReport.totalManualExpenses
              )}
            </div>
            <div className="mt-2 text-[11px] text-zinc-500">
              {formatIDR(consolidatedReport.totalSalonProductDeductions)} produk salon +{' '}
              {formatIDR(consolidatedReport.totalManualExpenses)} beban lokal
            </div>
          </div>

          <div className="bg-[#0e1117] border border-zinc-800/90 rounded-xl p-5 shadow-sm">
            <span className="text-xs font-medium text-zinc-400">Konsolidasi Laba Bersih</span>
            <div
              className={`mt-3 text-2xl font-display font-semibold ${
                consolidatedReport.totalNetProfit >= 0 ? 'text-amber-400' : 'text-rose-400'
              }`}
            >
              {formatIDR(consolidatedReport.totalNetProfit)}
            </div>
            <div className="mt-2 text-[11px] text-zinc-500">
              Net profit margin {consolidatedReport.overallProfitMargin}%
            </div>
          </div>
        </div>
      ) : branchReport ? (
        // Single Branch Metrics Strip
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0e1117] border border-zinc-800/90 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">Pendapatan Kotor Layanan</span>
              <div className="p-1.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <DollarSign className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-display font-semibold text-emerald-400">
              {formatIDR(branchReport.grossServiceRevenue)}
            </div>
            <div className="mt-2 text-[11px] text-zinc-500">
              {branchReport.completedBookingsCount} layanan selesai dari {branchReport.totalBookingsCount} reservasi
            </div>
          </div>

          <div className="bg-[#0e1117] border border-zinc-800/90 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">Beban Payroll & Komisi</span>
              <div className="p-1.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <Users className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-display font-semibold text-rose-300">
              {formatIDR(branchReport.totalPayroll)}
            </div>
            <div className="mt-2 text-[11px] text-zinc-500">
              Gaji pokok {formatIDR(branchReport.staffBaseSalaryTotal)} + komisi {formatIDR(branchReport.capsterCommissionsTotal)}
            </div>
          </div>

          <div className="bg-[#0e1117] border border-zinc-800/90 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">Produk Salon & Beban Lokal</span>
              <div className="p-1.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Package className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-display font-semibold text-rose-300">
              {formatIDR(branchReport.salonProductDeductions + branchReport.manualOperatingExpenses)}
            </div>
            <div className="mt-2 text-[11px] text-zinc-500">
              Produk {formatIDR(branchReport.salonProductDeductions)} · Beban lokal {formatIDR(branchReport.manualOperatingExpenses)}
            </div>
          </div>

          <div className="bg-[#0e1117] border border-zinc-800/90 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">Laba Bersih Operasional</span>
              <div className="p-1.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>
            <div
              className={`mt-3 text-2xl font-display font-semibold ${
                branchReport.netProfit >= 0 ? 'text-amber-400' : 'text-rose-400'
              }`}
            >
              {formatIDR(branchReport.netProfit)}
            </div>
            <div className="mt-2 text-[11px] text-zinc-500">
              Margin Laba: {branchReport.profitMarginPercent}%
            </div>
          </div>
        </div>
      ) : null}

      {/* P&L Equation Visualization Banner */}
      <div className="bg-[#0e1117] border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Receipt className="w-4 h-4 text-amber-400" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Formula Rekonsiliasi P&L Otomatis ATMOS
          </h2>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-lg bg-zinc-900/60 border border-zinc-800 font-mono text-xs">
          <div className="text-center md:text-left">
            <span className="text-zinc-500 text-[10px] uppercase block">1. Gross Revenue</span>
            <span className="text-emerald-400 font-medium">
              +{formatIDR(isConsolidated ? consolidatedReport?.totalGrossRevenue || 0 : branchReport?.grossServiceRevenue || 0)}
            </span>
          </div>
          <span className="text-zinc-600 text-lg hidden md:block">−</span>
          <div className="text-center md:text-left">
            <span className="text-zinc-500 text-[10px] uppercase block">2. Payroll & Komisi</span>
            <span className="text-rose-400 font-medium">
              −{formatIDR(isConsolidated ? consolidatedReport?.totalPayroll || 0 : branchReport?.totalPayroll || 0)}
            </span>
          </div>
          <span className="text-zinc-600 text-lg hidden md:block">−</span>
          <div className="text-center md:text-left">
            <span className="text-zinc-500 text-[10px] uppercase block">3. Alokasi Produk Backbar</span>
            <span className="text-rose-400 font-medium">
              −{formatIDR(isConsolidated ? consolidatedReport?.totalSalonProductDeductions || 0 : branchReport?.salonProductDeductions || 0)}
            </span>
          </div>
          <span className="text-zinc-600 text-lg hidden md:block">−</span>
          <div className="text-center md:text-left">
            <span className="text-zinc-500 text-[10px] uppercase block">4. Beban Operasional Lokal</span>
            <span className="text-rose-400 font-medium">
              −{formatIDR(isConsolidated ? consolidatedReport?.totalManualExpenses || 0 : branchReport?.manualOperatingExpenses || 0)}
            </span>
          </div>
          <span className="text-zinc-600 text-lg hidden md:block">=</span>
          <div className="text-center md:text-left p-2 rounded bg-amber-500/10 border border-amber-500/20">
            <span className="text-amber-300 text-[10px] uppercase block font-sans font-medium">Laba Bersih (Net Profit)</span>
            <span className="text-amber-400 font-bold">
              {formatIDR(isConsolidated ? consolidatedReport?.totalNetProfit || 0 : branchReport?.netProfit || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Consolidated Branch Comparison Table (if Executive has all branches selected) */}
      {isConsolidated && consolidatedReport && (
        <div className="bg-[#0e1117] border border-zinc-800/90 rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-zinc-800/80 bg-[#121620]/60 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-zinc-200">
                Perbandingan Profitabilitas Antar Cabang (Jabodetabek)
              </h2>
              <p className="text-xs text-zinc-400">
                Audit komparatif efisiensi biaya dan margin keuntungan setiap studio
              </p>
            </div>
            <span className="text-xs font-mono text-zinc-400">
              Periode: {selectedMonth}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-800 bg-zinc-900/40 text-zinc-400">
                <tr>
                  <th className="px-6 py-3 font-medium">Cabang</th>
                  <th className="px-6 py-3 font-medium text-right">Gross Revenue</th>
                  <th className="px-6 py-3 font-medium text-right">Payroll</th>
                  <th className="px-6 py-3 font-medium text-right">Produk Salon</th>
                  <th className="px-6 py-3 font-medium text-right">Beban Lokal</th>
                  <th className="px-6 py-3 font-medium text-right">Laba Bersih</th>
                  <th className="px-6 py-3 font-medium text-right">Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
                {consolidatedReport.branchSummaries.map((bSum) => (
                  <tr key={bSum.branchId} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-3.5 font-medium text-zinc-100 flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{bSum.branchName}</span>
                    </td>
                    <td className="px-6 py-3.5 text-right font-mono text-emerald-400">
                      {formatIDR(bSum.grossServiceRevenue)}
                    </td>
                    <td className="px-6 py-3.5 text-right font-mono text-zinc-400">
                      {formatIDR(bSum.totalPayroll)}
                    </td>
                    <td className="px-6 py-3.5 text-right font-mono text-zinc-400">
                      {formatIDR(bSum.salonProductDeductions)}
                    </td>
                    <td className="px-6 py-3.5 text-right font-mono text-zinc-400">
                      {formatIDR(bSum.manualOperatingExpenses)}
                    </td>
                    <td
                      className={`px-6 py-3.5 text-right font-mono font-medium ${
                        bSum.netProfit >= 0 ? 'text-amber-400' : 'text-rose-400'
                      }`}
                    >
                      {formatIDR(bSum.netProfit)}
                    </td>
                    <td className="px-6 py-3.5 text-right font-mono text-zinc-300">
                      {bSum.profitMarginPercent}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detailed Single-Branch Breakdown Sections */}
      {branchReport && (
        <div className="space-y-6">
          {/* 1. Capster Payroll Detail Table */}
          <div className="bg-[#0e1117] border border-zinc-800/90 rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-zinc-800/80 bg-[#121620]/60 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-zinc-200">
                  Rincian Beban Payroll & Komisi Capster
                </h3>
                <p className="text-xs text-zinc-400">
                  Gaji pokok studio + insentif komisi Rp 25.000 per layanan tuntas
                </p>
              </div>
              <span className="text-xs font-mono text-zinc-400">
                Total: {formatIDR(branchReport.totalPayroll)}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-zinc-800 bg-zinc-900/40 text-zinc-400">
                  <tr>
                    <th className="px-6 py-3 font-medium">Nama Capster / Staff</th>
                    <th className="px-6 py-3 font-medium text-right">Gaji Pokok</th>
                    <th className="px-6 py-3 font-medium text-right">Layanan Selesai</th>
                    <th className="px-6 py-3 font-medium text-right">Tarif Komisi</th>
                    <th className="px-6 py-3 font-medium text-right">Total Komisi</th>
                    <th className="px-6 py-3 font-medium text-right">Take-Home Pay</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
                  {branchReport.capsterPayrollList.map((cp) => (
                    <tr key={cp.capsterId} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-3 font-medium text-zinc-100">{cp.capsterName}</td>
                      <td className="px-6 py-3 text-right font-mono">{formatIDR(cp.baseSalary)}</td>
                      <td className="px-6 py-3 text-right font-mono">{cp.completedBookingsCount} Layanan</td>
                      <td className="px-6 py-3 text-right font-mono">{formatIDR(cp.commissionPerBooking)}</td>
                      <td className="px-6 py-3 text-right font-mono text-emerald-400">{formatIDR(cp.totalCommission)}</td>
                      <td className="px-6 py-3 text-right font-mono font-medium text-zinc-100">{formatIDR(cp.totalEarnings)}</td>
                    </tr>
                  ))}
                  {/* Branch Manager Row */}
                  <tr className="hover:bg-zinc-800/30 transition-colors bg-zinc-900/30">
                    <td className="px-6 py-3 font-medium text-zinc-300">Branch Manager (Gaji Pokok Manajemen)</td>
                    <td className="px-6 py-3 text-right font-mono">{formatIDR(6000000)}</td>
                    <td className="px-6 py-3 text-right font-mono text-zinc-500">-</td>
                    <td className="px-6 py-3 text-right font-mono text-zinc-500">-</td>
                    <td className="px-6 py-3 text-right font-mono text-zinc-500">-</td>
                    <td className="px-6 py-3 text-right font-mono font-medium text-zinc-100">{formatIDR(6000000)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. Salon Product Requisition Deductions */}
          <div className="bg-[#0e1117] border border-zinc-800/90 rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-zinc-800/80 bg-[#121620]/60 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-zinc-200">
                  Pemakaian Produk Backbar Salon (Requisition Gudang Pusat)
                </h3>
                <p className="text-xs text-zinc-400">
                  Dialokasikan langsung dari permintaan restock yang telah didispatch oleh Central Supply
                </p>
              </div>
              <span className="text-xs font-mono text-zinc-400">
                Total: {formatIDR(branchReport.salonProductDeductions)}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-zinc-800 bg-zinc-900/40 text-zinc-400">
                  <tr>
                    <th className="px-6 py-3 font-medium">No. Requisition</th>
                    <th className="px-6 py-3 font-medium">Nama Produk</th>
                    <th className="px-6 py-3 font-medium text-right">Jumlah Dispatched</th>
                    <th className="px-6 py-3 font-medium text-right">Harga Pokok (HPP)</th>
                    <th className="px-6 py-3 font-medium text-right">Total Beban Produk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
                  {branchReport.salonRequisitionsCost.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-6 text-center text-zinc-500">
                        Belum ada restock produk yang didispatch untuk periode ini.
                      </td>
                    </tr>
                  ) : (
                    branchReport.salonRequisitionsCost.map((sc, idx) => (
                      <tr key={`${sc.requisitionId}-${idx}`} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-6 py-3 font-mono text-zinc-400">{sc.requisitionId}</td>
                        <td className="px-6 py-3 font-medium text-zinc-100">{sc.productName}</td>
                        <td className="px-6 py-3 text-right font-mono">{sc.quantity} unit</td>
                        <td className="px-6 py-3 text-right font-mono">{formatIDR(sc.unitCost)}</td>
                        <td className="px-6 py-3 text-right font-mono text-rose-300 font-medium">
                          {formatIDR(sc.totalCost)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. Local Operational Expenses Ledger */}
          <div className="bg-[#0e1117] border border-zinc-800/90 rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-zinc-800/80 bg-[#121620]/60 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-zinc-200">
                  Buku Kas Beban Operasional Lokal Cabang
                </h3>
                <p className="text-xs text-zinc-400">
                  Dicatat langsung oleh Branch Manager untuk utilitas, laundry, dan perawatan rutin
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-zinc-400">
                  Total: {formatIDR(branchReport.manualOperatingExpenses)}
                </span>
                {isBranchManager && (
                  <button
                    type="button"
                    onClick={() => setIsExpenseModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-md transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Catat Baru</span>
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-zinc-800 bg-zinc-900/40 text-zinc-400">
                  <tr>
                    <th className="px-6 py-3 font-medium">Tanggal</th>
                    <th className="px-6 py-3 font-medium">Kategori</th>
                    <th className="px-6 py-3 font-medium">Keterangan</th>
                    <th className="px-6 py-3 font-medium text-right">Nominal</th>
                    {isBranchManager && <th className="px-6 py-3 font-medium text-right">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
                  {branchReport.expensesList.length === 0 ? (
                    <tr>
                      <td colSpan={isBranchManager ? 5 : 4} className="px-6 py-6 text-center text-zinc-500">
                        Belum ada beban operasional yang dicatat untuk periode ini.
                      </td>
                    </tr>
                  ) : (
                    branchReport.expensesList.map((exp) => (
                      <tr key={exp.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-6 py-3 font-mono text-zinc-400">{exp.date}</td>
                        <td className="px-6 py-3">
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                            {exp.category}
                          </span>
                        </td>
                        <td className="px-6 py-3 font-medium text-zinc-200">{exp.description}</td>
                        <td className="px-6 py-3 text-right font-mono text-rose-300 font-medium">
                          {formatIDR(exp.amount)}
                        </td>
                        {isBranchManager && (
                          <td className="px-6 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => deleteExpense(exp.id)}
                              title="Hapus Transaksi"
                              className="p-1 text-zinc-500 hover:text-rose-400 transition-colors rounded hover:bg-zinc-800"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Manual Expense Modal */}
      {isBranchManager && (
        <ManualExpenseModal
          isOpen={isExpenseModalOpen}
          onClose={() => setIsExpenseModalOpen(false)}
          branchId={effectiveBranchId || 'senopati'}
          branchName={selectedBranch?.name}
          managerId={user?.id || 'bm-senopati'}
        />
      )}
    </div>
  );
}
