'use client';

import React, { useState, useMemo } from 'react';
import { useInventoryStore } from '@/lib/store/inventory-store';
import { PRODUCTS_DATA } from '@/lib/mock/data';
import { ProductBatch, BatchStatus } from '@/types';

export default function BatchesPage() {
  const { batches, addNewBatch, isBatchFefoPriority, getExpiringBatchesCount } =
    useInventoryStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states for new batch
  const [formProductId, setFormProductId] = useState(PRODUCTS_DATA[0].id);
  const [formBatchNumber, setFormBatchNumber] = useState('');
  const [formQuantity, setFormQuantity] = useState<number>(50);
  const [formMfgDate, setFormMfgDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [formExpiryDate, setFormExpiryDate] = useState(() => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    return future.toISOString().split('T')[0];
  });
  const [formCostPerUnit, setFormCostPerUnit] = useState<number>(95000);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Expiry countdown calculator
  const getExpiryCountdown = (expiryDateStr: string, status: BatchStatus) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(expiryDateStr);
    exp.setHours(0, 0, 0, 0);
    const diffMs = exp.getTime() - today.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0 || status === 'EXPIRED') {
      return { text: 'Sudah Kedaluwarsa', type: 'expired' };
    }
    if (diffDays === 0) {
      return { text: 'Kedaluwarsa Hari Ini', type: 'critical' };
    }
    if (diffDays <= 14) {
      return { text: `Kedaluwarsa dlm ${diffDays} hari`, type: 'critical' };
    }
    if (diffDays <= 30) {
      return { text: `Kedaluwarsa dlm ${diffDays} hari`, type: 'warning' };
    }
    const months = Math.round(diffDays / 30);
    return { text: `Aman (${months} bulan)`, type: 'safe' };
  };

  // Metrics summary
  const totalUnits = useMemo(() => {
    return batches
      .filter((b) => b.status === 'ACTIVE')
      .reduce((sum, b) => sum + b.quantity, 0);
  }, [batches]);

  const activeBatchesCount = useMemo(() => {
    return batches.filter((b) => b.status === 'ACTIVE' && b.quantity > 0).length;
  }, [batches]);

  const expiringSoonCount = getExpiringBatchesCount(30);

  const depletedOrExpiredCount = useMemo(() => {
    return batches.filter(
      (b) => b.status === 'EXPIRED' || b.status === 'DEPLETED' || b.quantity === 0
    ).length;
  }, [batches]);

  const productMap = useMemo(() => {
    return new Map(PRODUCTS_DATA.map((p) => [p.id, p]));
  }, []);

  // Filtered batches
  const filteredBatches = useMemo(() => {
    return batches
      .filter((b) => {
        // Search filter
        const query = searchQuery.toLowerCase();
        const matchesQuery =
          b.batchNumber.toLowerCase().includes(query) ||
          b.productName.toLowerCase().includes(query);
        if (!matchesQuery) return false;

        // Status filter
        if (selectedStatus === 'ACTIVE') {
          return b.status === 'ACTIVE' && b.quantity > 0;
        }
        if (selectedStatus === 'EXPIRING_SOON') {
          if (b.status !== 'ACTIVE' || b.quantity <= 0) return false;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const limit = new Date(today.getTime() + 30 * 86400000);
          const exp = new Date(b.expiryDate);
          return exp >= today && exp <= limit;
        }
        if (selectedStatus === 'DEPLETED_OR_EXPIRED') {
          return b.status === 'EXPIRED' || b.status === 'DEPLETED' || b.quantity === 0;
        }
        return true;
      })
      .sort((a, b) => {
        // Active FEFO: sort by expiryDate ascending
        if (a.status === 'ACTIVE' && b.status === 'ACTIVE') {
          return a.expiryDate.localeCompare(b.expiryDate);
        }
        if (a.status === 'ACTIVE') return -1;
        if (b.status === 'ACTIVE') return 1;
        return a.expiryDate.localeCompare(b.expiryDate);
      });
  }, [batches, searchQuery, selectedStatus]);

  // Handle new batch submission
  const handleSubmitNewBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formBatchNumber.trim()) {
      alert('Nomor Batch wajib diisi.');
      return;
    }
    if (formQuantity <= 0) {
      alert('Jumlah unit harus lebih dari 0.');
      return;
    }

    addNewBatch(
      formProductId,
      formBatchNumber.trim(),
      formQuantity,
      formExpiryDate,
      formMfgDate,
      formCostPerUnit
    );

    setIsModalOpen(false);
    setFeedbackMsg(`Batch ${formBatchNumber.trim()} berhasil ditambahkan ke inventaris.`);
    setFormBatchNumber('');
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-display font-semibold tracking-tight text-zinc-100">
            Manajemen Batch & Rotasi FEFO
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Pantau ketersediaan stok pusat, nomor batch, dan prioritaskan pengeluaran berdasarkan tanggal kedaluwarsa terdekat.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            // Auto generate suggestive batch number
            const randSuffix = Math.floor(10 + Math.random() * 90);
            setFormBatchNumber(`ATM-2609-${randSuffix}`);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-amber-500 hover:bg-amber-400 text-zinc-950 font-medium text-xs sm:text-sm transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Terima Batch Baru
        </button>
      </div>

      {/* Feedback Alert */}
      {feedbackMsg && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-md text-emerald-300 text-xs sm:text-sm flex items-center justify-between">
          <span>{feedbackMsg}</span>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="text-emerald-400 hover:text-emerald-200"
          >
            ✕
          </button>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#12141a] border border-zinc-800/80 rounded-lg p-4">
          <div className="text-xs text-zinc-400 font-medium">Total Unit Aktif</div>
          <div className="text-2xl sm:text-3xl font-display font-semibold text-zinc-100 mt-1.5">
            {totalUnits.toLocaleString('id-ID')}
            <span className="text-xs font-sans text-zinc-500 font-normal ml-1.5">unit</span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">Stok siap distribusi</div>
        </div>

        <div className="bg-[#12141a] border border-zinc-800/80 rounded-lg p-4">
          <div className="text-xs text-zinc-400 font-medium">Batch Aktif</div>
          <div className="text-2xl sm:text-3xl font-display font-semibold text-zinc-100 mt-1.5">
            {activeBatchesCount}
            <span className="text-xs font-sans text-zinc-500 font-normal ml-1.5">batch</span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">Tersimpan di gudang pusat</div>
        </div>

        <div className="bg-[#12141a] border border-zinc-800/80 rounded-lg p-4">
          <div className="text-xs text-amber-400/90 font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Rotasi Segera (≤ 30 Hari)
          </div>
          <div className="text-2xl sm:text-3xl font-display font-semibold text-amber-300 mt-1.5">
            {expiringSoonCount}
            <span className="text-xs font-sans text-amber-400/60 font-normal ml-1.5">batch</span>
          </div>
          <div className="text-[11px] text-amber-400/60 mt-1">Prioritas FEFO tinggi</div>
        </div>

        <div className="bg-[#12141a] border border-zinc-800/80 rounded-lg p-4">
          <div className="text-xs text-zinc-400 font-medium">Kedaluwarsa / Habis</div>
          <div className="text-2xl sm:text-3xl font-display font-semibold text-zinc-400 mt-1.5">
            {depletedOrExpiredCount}
            <span className="text-xs font-sans text-zinc-500 font-normal ml-1.5">batch</span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">Tidak untuk pemenuhan</div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between border-b border-zinc-800/70 pb-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedStatus('ALL')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap ${
              selectedStatus === 'ALL'
                ? 'bg-zinc-800 text-zinc-100 border border-zinc-700/60'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
            }`}
          >
            Semua ({batches.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedStatus('ACTIVE')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap ${
              selectedStatus === 'ACTIVE'
                ? 'bg-zinc-800 text-zinc-100 border border-zinc-700/60'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
            }`}
          >
            Aktif ({activeBatchesCount})
          </button>
          <button
            type="button"
            onClick={() => setSelectedStatus('EXPIRING_SOON')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap ${
              selectedStatus === 'EXPIRING_SOON'
                ? 'bg-amber-950/40 text-amber-300 border border-amber-800/50'
                : 'text-zinc-400 hover:text-amber-300 hover:bg-zinc-900/50'
            }`}
          >
            Mendekati Kedaluwarsa ({expiringSoonCount})
          </button>
          <button
            type="button"
            onClick={() => setSelectedStatus('DEPLETED_OR_EXPIRED')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap ${
              selectedStatus === 'DEPLETED_OR_EXPIRED'
                ? 'bg-zinc-800 text-zinc-100 border border-zinc-700/60'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
            }`}
          >
            Habis / Kedaluwarsa ({depletedOrExpiredCount})
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Cari batch no. atau produk..."
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

      {/* Batches Table */}
      <div className="bg-[#12141a] border border-zinc-800/80 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0f1116] border-b border-zinc-800/80 text-zinc-400 uppercase tracking-wider font-mono text-[10px]">
              <tr>
                <th className="py-3 px-4">No. Batch</th>
                <th className="py-3 px-4">Produk & Kategori</th>
                <th className="py-3 px-4">Sisa Unit / Kapasitas</th>
                <th className="py-3 px-4">Tgl. Kedaluwarsa</th>
                <th className="py-3 px-4">Status & Prioritas FEFO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
              {filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-zinc-500">
                    Tidak ada batch yang sesuai dengan filter atau pencarian.
                  </td>
                </tr>
              ) : (
                filteredBatches.map((batch) => {
                  const isFefo = isBatchFefoPriority(batch);
                  const countdown = getExpiryCountdown(batch.expiryDate, batch.status);
                  const fillPercentage = Math.round(
                    (batch.quantity / (batch.initialQuantity || 1)) * 100
                  );

                  return (
                    <tr
                      key={batch.id}
                      className="hover:bg-zinc-800/30 transition-colors"
                    >
                      {/* Batch Number */}
                      <td className="py-3.5 px-4 font-mono font-medium text-zinc-200">
                        <div className="flex items-center gap-2">
                          <span>{batch.batchNumber}</span>
                          {isFefo && (
                            <span
                              title="Batch ini memiliki tanggal kedaluwarsa paling awal untuk produk ini dan akan dikeluarkan terlebih dahulu (FEFO)."
                              className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-sans font-semibold tracking-wider uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30"
                            >
                              FEFO #1
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-sans mt-0.5">
                          Masuk: {batch.manufacturingDate}
                        </div>
                      </td>

                      {/* Product Name & Category */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-zinc-100 flex items-center gap-2">
                          <span>{batch.productName}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-400 border border-zinc-700/50">
                            {productMap.get(batch.productId)?.category || 'Hair Care'}
                          </span>
                        </div>
                        <div className="text-[10px] text-zinc-400 mt-0.5">
                          Gudang: {batch.location || 'Central Warehouse Jakarta'}
                        </div>
                      </td>

                      {/* Stock Level with Clean Bar */}
                      <td className="py-3.5 px-4 min-w-[140px]">
                        <div className="flex items-baseline justify-between gap-2 mb-1">
                          <span className="font-mono text-zinc-100 font-semibold text-xs">
                            {batch.quantity}
                          </span>
                          <span className="text-[10px] text-zinc-500">
                            / {batch.initialQuantity} unit ({fillPercentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-zinc-800/90 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              batch.quantity === 0
                                ? 'bg-zinc-700'
                                : batch.quantity <= 10
                                ? 'bg-amber-400'
                                : 'bg-emerald-400'
                            }`}
                            style={{ width: `${Math.min(100, fillPercentage)}%` }}
                          />
                        </div>
                      </td>

                      {/* Expiry Date & Countdown */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-zinc-200 text-xs">
                          {batch.expiryDate}
                        </div>
                        <div className="mt-0.5">
                          {countdown.type === 'expired' && (
                            <span className="text-[10px] font-medium text-rose-400">
                              ● {countdown.text}
                            </span>
                          )}
                          {countdown.type === 'critical' && (
                            <span className="text-[10px] font-medium text-rose-300">
                              ▲ {countdown.text}
                            </span>
                          )}
                          {countdown.type === 'warning' && (
                            <span className="text-[10px] font-medium text-amber-300">
                              ◆ {countdown.text}
                            </span>
                          )}
                          {countdown.type === 'safe' && (
                            <span className="text-[10px] text-zinc-400">
                              ✓ {countdown.text}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {batch.status === 'ACTIVE' && batch.quantity > 0 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-950/50 text-emerald-300 border border-emerald-800/40">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Aktif
                          </span>
                        ) : batch.status === 'EXPIRED' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-rose-950/50 text-rose-300 border border-rose-800/40">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                            Kedaluwarsa
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-zinc-800/80 text-zinc-400 border border-zinc-700/50">
                            Habis (Depleted)
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Receive New Batch */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#12141a] border border-zinc-800 w-full max-w-lg rounded-xl shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <h3 className="text-base font-semibold text-zinc-100 font-display">
                Penerimaan Batch Stok Baru
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-200 text-sm p-1 rounded"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitNewBatch} className="mt-4 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-zinc-300 font-medium mb-1.5">
                  Pilih Produk
                </label>
                <select
                  value={formProductId}
                  onChange={(e) => setFormProductId(e.target.value)}
                  className="w-full bg-[#181a22] border border-zinc-700 rounded-md px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-400"
                >
                  {PRODUCTS_DATA.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.volume}) - Rp {p.price.toLocaleString('id-ID')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1.5">
                    Nomor Batch / Lot
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ATM-2609-02"
                    value={formBatchNumber}
                    onChange={(e) => setFormBatchNumber(e.target.value)}
                    className="w-full bg-[#181a22] border border-zinc-700 rounded-md px-3 py-2 font-mono text-zinc-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1.5">
                    Jumlah Unit Diterima
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formQuantity}
                    onChange={(e) => setFormQuantity(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#181a22] border border-zinc-700 rounded-md px-3 py-2 font-mono text-zinc-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1.5">
                    Tanggal Produksi
                  </label>
                  <input
                    type="date"
                    required
                    value={formMfgDate}
                    onChange={(e) => setFormMfgDate(e.target.value)}
                    className="w-full bg-[#181a22] border border-zinc-700 rounded-md px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1.5">
                    Tanggal Kedaluwarsa (Expiry)
                  </label>
                  <input
                    type="date"
                    required
                    value={formExpiryDate}
                    onChange={(e) => setFormExpiryDate(e.target.value)}
                    className="w-full bg-[#181a22] border border-zinc-700 rounded-md px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1.5">
                  Biaya Pokok per Unit (IDR)
                </label>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={formCostPerUnit}
                  onChange={(e) => setFormCostPerUnit(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#181a22] border border-zinc-700 rounded-md px-3 py-2 font-mono text-zinc-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-amber-500 hover:bg-amber-400 text-zinc-950 font-medium transition-colors"
                >
                  Simpan Batch Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
