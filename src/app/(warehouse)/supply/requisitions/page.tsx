'use client';

import React, { useState, useMemo } from 'react';
import { useInventoryStore } from '@/lib/store/inventory-store';
import { PRODUCTS_DATA } from '@/lib/mock/data';
import { BranchRequisition } from '@/types';

export default function BranchRequisitionsPage() {
  const { requisitions, dispatchRequisition, getPendingRequisitionsCount } =
    useInventoryStore();

  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dispatchConfirmReq, setDispatchConfirmReq] = useState<BranchRequisition | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Counts
  const totalCount = requisitions.length;
  const pendingCount = getPendingRequisitionsCount();
  const dispatchedCount = useMemo(
    () => requisitions.filter((r) => r.status === 'DISPATCHED').length,
    [requisitions]
  );

  // Filtered requisitions
  const filteredRequisitions = useMemo(() => {
    return requisitions
      .filter((r) => {
        if (activeTab === 'PENDING' && r.status !== 'PENDING') return false;
        if (activeTab === 'DISPATCHED' && r.status !== 'DISPATCHED') return false;

        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        const matchesBranch = r.branchName.toLowerCase().includes(q);
        const matchesManager = r.requestedByStaffName.toLowerCase().includes(q);
        const matchesItem = r.items.some((it) =>
          it.productName.toLowerCase().includes(q)
        );
        return matchesBranch || matchesManager || matchesItem;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [requisitions, activeTab, searchQuery]);

  // Execute FEFO Dispatch
  const handleConfirmDispatch = () => {
    if (!dispatchConfirmReq) return;
    const branch = dispatchConfirmReq.branchName;
    dispatchRequisition(dispatchConfirmReq.id);
    setDispatchConfirmReq(null);
    setFeedbackToast(
      `Permintaan restock untuk ${branch} telah disetujui & dikirim. Stok pusat telah dipotong otomatis secara FEFO.`
    );
    setTimeout(() => setFeedbackToast(null), 5000);
  };

  // Helper to calculate estimated wholesale/transfer value
  const getItemValue = (productId: string, quantity: number) => {
    const prod = PRODUCTS_DATA.find((p) => p.id === productId);
    const unitCost = prod ? Math.round(prod.price * 0.45) : 95000;
    return unitCost * quantity;
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-display font-semibold tracking-tight text-zinc-100">
            Permintaan Restock & Pasokan Cabang
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Persetujuan pengiriman persediaan backbar dan etalase retail cabang salon dengan pemotongan stok otomatis sistem FEFO.
          </p>
        </div>
      </div>

      {/* Toast alert */}
      {feedbackToast && (
        <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/60 rounded-md text-emerald-300 text-xs sm:text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>{feedbackToast}</span>
          </div>
          <button
            onClick={() => setFeedbackToast(null)}
            className="text-emerald-400 hover:text-emerald-200 ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-[#12141a] border border-zinc-800/80 rounded-lg p-4">
          <div className="text-xs text-amber-400 font-medium flex items-center gap-1.5">
            {pendingCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />}
            Menunggu Persetujuan
          </div>
          <div className="text-2xl sm:text-3xl font-display font-semibold text-amber-300 mt-1.5">
            {pendingCount}
            <span className="text-xs font-sans text-amber-400/60 font-normal ml-1.5">permintaan</span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">Perlu tindakan verifikasi logistik</div>
        </div>

        <div className="bg-[#12141a] border border-zinc-800/80 rounded-lg p-4">
          <div className="text-xs text-emerald-400 font-medium">Telah Dikirim (Dispatched)</div>
          <div className="text-2xl sm:text-3xl font-display font-semibold text-emerald-300 mt-1.5">
            {dispatchedCount}
            <span className="text-xs font-sans text-emerald-400/60 font-normal ml-1.5">kiriman</span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">Stok telah dideplesi dari gudang</div>
        </div>

        <div className="bg-[#12141a] border border-zinc-800/80 rounded-lg p-4">
          <div className="text-xs text-zinc-400 font-medium">Total Permintaan Masuk</div>
          <div className="text-2xl sm:text-3xl font-display font-semibold text-zinc-100 mt-1.5">
            {totalCount}
            <span className="text-xs font-sans text-zinc-500 font-normal ml-1.5">total</span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">Dari seluruh outlet cabang Jabodetabek</div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between border-b border-zinc-800/70 pb-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === 'ALL'
                ? 'bg-zinc-800 text-zinc-100 border border-zinc-700/60'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
            }`}
          >
            Semua ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('PENDING')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === 'PENDING'
                ? 'bg-amber-950/50 text-amber-300 border border-amber-800/60'
                : 'text-zinc-400 hover:text-amber-300 hover:bg-zinc-900/50'
            }`}
          >
            Menunggu Persetujuan ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('DISPATCHED')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === 'DISPATCHED'
                ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-800/60'
                : 'text-zinc-400 hover:text-emerald-300 hover:bg-zinc-900/50'
            }`}
          >
            Telah Dikirim ({dispatchedCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Cari cabang, manager, barang..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#12141a] border border-zinc-800 rounded-md px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1.5 text-xs text-zinc-500 hover:text-zinc-300"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Requisitions List */}
      <div className="space-y-4">
        {filteredRequisitions.length === 0 ? (
          <div className="bg-[#12141a] border border-zinc-800/80 rounded-lg p-12 text-center text-zinc-500 text-xs sm:text-sm">
            Tidak ada data permintaan restock cabang pada status ini.
          </div>
        ) : (
          filteredRequisitions.map((req) => {
            const dateStr = new Date(req.createdAt).toLocaleString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            const totalRequestedUnits = req.items.reduce(
              (sum, item) => sum + item.quantityRequested,
              0
            );

            const totalEstValue = req.items.reduce(
              (sum, item) => sum + getItemValue(item.productId, item.quantityRequested),
              0
            );

            return (
              <div
                key={req.id}
                className="bg-[#12141a] border border-zinc-800/80 rounded-lg p-4 sm:p-5 transition-colors hover:border-zinc-700/80"
              >
                {/* Header: Branch Name, Date, Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800/60">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-zinc-100 text-sm sm:text-base">
                      {req.branchName}
                    </span>
                    <span className="text-xs text-zinc-500">· {dateStr}</span>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {req.status === 'PENDING' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-950/60 text-amber-300 border border-amber-800/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        Menunggu Persetujuan
                      </span>
                    )}
                    {req.status === 'DISPATCHED' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-800/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Telah Dikirim ke Cabang
                      </span>
                    )}
                    {req.status === 'RECEIVED' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-sky-950/60 text-sky-300 border border-sky-800/50">
                        Diterima di Cabang
                      </span>
                    )}
                  </div>
                </div>

                {/* Body Details */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-3 text-xs">
                  {/* Requester Info & Notes (Col 1-4) */}
                  <div className="lg:col-span-4 space-y-2">
                    <div>
                      <div className="text-[11px] uppercase font-mono tracking-wider text-zinc-500">
                        Pemohon Cabang
                      </div>
                      <div className="text-zinc-200 font-medium mt-0.5">
                        {req.requestedByStaffName}
                      </div>
                    </div>

                    {req.notes && (
                      <div>
                        <div className="text-[11px] uppercase font-mono tracking-wider text-zinc-500">
                          Catatan Cabang
                        </div>
                        <p className="text-zinc-400 text-[11px] leading-relaxed mt-0.5 bg-zinc-900/60 p-2.5 rounded border border-zinc-800/60 italic">
                          "{req.notes}"
                        </p>
                      </div>
                    )}

                    {req.dispatchedAt && (
                      <div className="text-[11px] text-emerald-400/90 font-mono">
                        Dikirim: {new Date(req.dispatchedAt).toLocaleString('id-ID')}
                      </div>
                    )}
                  </div>

                  {/* Requested Items (Col 5-8) */}
                  <div className="lg:col-span-5 space-y-1.5">
                    <div className="flex justify-between items-center text-[11px] uppercase font-mono tracking-wider text-zinc-500">
                      <span>Daftar Permintaan Stok</span>
                      <span>{totalRequestedUnits} Unit Total</span>
                    </div>

                    <div className="bg-zinc-900/40 rounded border border-zinc-800/50 overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-zinc-900/80 text-[10px] text-zinc-400 uppercase font-mono">
                          <tr>
                            <th className="py-2 px-3">Produk</th>
                            <th className="py-2 px-3 text-right">Jumlah</th>
                            <th className="py-2 px-3 text-right">Est. Nilai</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/40 text-zinc-300">
                          {req.items.map((item, idx) => {
                            const val = getItemValue(item.productId, item.quantityRequested);
                            return (
                              <tr key={idx} className="hover:bg-zinc-800/20">
                                <td className="py-2 px-3 font-medium text-zinc-200">
                                  {item.productName}
                                </td>
                                <td className="py-2 px-3 text-right font-mono text-zinc-100 font-semibold">
                                  {item.quantityRequested} unit
                                </td>
                                <td className="py-2 px-3 text-right font-mono text-zinc-400">
                                  Rp {val.toLocaleString('id-ID')}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex justify-between text-xs font-medium pt-1 text-zinc-400">
                      <span>Estimasi Total Nilai Pasokan</span>
                      <span className="font-mono text-amber-300">
                        Rp {totalEstValue.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  {/* Actions & Dispatch Notice (Col 9-12) */}
                  <div className="lg:col-span-3 flex flex-col justify-between space-y-3">
                    <div className="bg-zinc-900/60 p-2.5 rounded border border-zinc-800/60 text-[11px] text-zinc-400">
                      <div className="font-medium text-zinc-300 flex items-center gap-1.5 mb-1">
                        <span className="text-amber-400">●</span> Algoritma FEFO Aktif
                      </div>
                      Pengeluaran stok otomatis mengambil dari batch aktif dengan tanggal kedaluwarsa terdekat.
                    </div>

                    <div>
                      {req.status === 'PENDING' ? (
                        <button
                          type="button"
                          onClick={() => setDispatchConfirmReq(req)}
                          className="w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded bg-amber-500 hover:bg-amber-400 text-zinc-950 font-medium text-xs transition-colors shadow-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Setujui & Kirim Stok
                        </button>
                      ) : (
                        <div className="w-full text-center text-[11px] text-emerald-300 bg-emerald-950/40 border border-emerald-800/40 py-2 rounded">
                          ✓ Stok telah terpotong (FEFO)
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Confirmation Modal */}
      {dispatchConfirmReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#12141a] border border-zinc-800 w-full max-w-md rounded-xl shadow-2xl p-6 relative">
            <h3 className="text-base font-semibold text-zinc-100 font-display">
              Konfirmasi Persetujuan & Pengiriman Stok
            </h3>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Anda akan menyetujui pengiriman pasokan ke{' '}
              <strong className="text-zinc-200">{dispatchConfirmReq.branchName}</strong>. Sistem akan langsung memotong kuantitas dari batch tertua/terdekat kedaluwarsa (FEFO).
            </p>

            <div className="mt-4 p-3 bg-zinc-900/80 rounded border border-zinc-800 text-xs space-y-1.5">
              <div className="text-[11px] uppercase font-mono text-zinc-500">Item yang akan dikirim:</div>
              {dispatchConfirmReq.items.map((it, i) => (
                <div key={i} className="flex justify-between text-zinc-300">
                  <span>{it.productName}</span>
                  <span className="font-mono font-medium text-amber-300">{it.quantityRequested} unit</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDispatchConfirmReq(null)}
                className="px-4 py-2 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition-colors text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDispatch}
                className="px-4 py-2 rounded-md bg-amber-500 hover:bg-amber-400 text-zinc-950 font-medium transition-colors text-xs"
              >
                Ya, Setujui & Potong Stok FEFO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
