'use client';

import React, { useState, useMemo } from 'react';
import { useStaffAuth } from '@/lib/store/auth-context';
import { useInventoryStore } from '@/lib/store/inventory-store';
import { BRANCHES_DATA, PRODUCTS_DATA } from '@/lib/mock/data';
import { RequisitionItem } from '@/types';
import {
  PackageCheck,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Building2,
  Trash2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

export default function HqRequisitionsPage() {
  const { user, role, activeBranchId } = useStaffAuth();
  const { requisitions, createRequisition } = useInventoryStore();

  const isExecutive = role === 'EXECUTIVE';
  const isBranchManager = role === 'BRANCH_MANAGER';
  const effectiveBranchId = isExecutive ? activeBranchId : activeBranchId || user?.branchId || 'senopati';
  const isConsolidated = isExecutive && !effectiveBranchId;

  const currentBranch = useMemo(
    () => BRANCHES_DATA.find((b) => b.id === effectiveBranchId),
    [effectiveBranchId]
  );

  // Requisition Form State
  const [selectedProductId, setSelectedProductId] = useState(PRODUCTS_DATA[0].id);
  const [quantity, setQuantity] = useState(5);
  const [requestItems, setRequestItems] = useState<RequisitionItem[]>([]);
  const [notes, setNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Filtered Requisitions
  const branchRequisitions = useMemo(() => {
    return requisitions.filter((r) => {
      return isConsolidated ? true : r.branchId === effectiveBranchId;
    });
  }, [requisitions, isConsolidated, effectiveBranchId]);

  // Add product to draft basket
  const handleAddItem = () => {
    setErrorMessage('');
    const product = PRODUCTS_DATA.find((p) => p.id === selectedProductId);
    if (!product) return;

    if (quantity <= 0) {
      setErrorMessage('Jumlah permintaan minimal 1 unit.');
      return;
    }

    const existingIndex = requestItems.findIndex((i) => i.productId === selectedProductId);
    if (existingIndex > -1) {
      const updated = [...requestItems];
      updated[existingIndex].quantityRequested += quantity;
      setRequestItems(updated);
    } else {
      setRequestItems([
        ...requestItems,
        {
          productId: product.id,
          productName: product.name,
          quantityRequested: quantity,
        },
      ]);
    }
  };

  const handleRemoveItem = (index: number) => {
    setRequestItems(requestItems.filter((_, idx) => idx !== index));
  };

  const handleSubmitRequisition = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (requestItems.length === 0) {
      setErrorMessage('Pilih minimal satu produk untuk diajukan restock.');
      return;
    }

    createRequisition(
      effectiveBranchId || 'senopati',
      user?.id || 'bm-local',
      requestItems,
      notes.trim() || undefined
    );

    setIsSuccess(true);
    setRequestItems([]);
    setNotes('');

    setTimeout(() => {
      setIsSuccess(false);
    }, 2500);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Context Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-amber-400 mb-1">
            <span>Logistik Backbar Salon</span>
            <span>·</span>
            <span>{isConsolidated ? 'Semua Cabang' : currentBranch?.name || ''}</span>
          </div>
          <h1 className="text-2xl font-display font-semibold text-zinc-100 tracking-tight">
            Permintaan Restock Produk Salon
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Pengajuan isi ulang stok produk backbar (perawatan rambut & kulit kepala) langsung ke
            Central Warehouse Jakarta.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/hq/finance"
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-200 transition-colors"
          >
            <span>Audit Beban Produk di P&L</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
          </Link>
        </div>
      </div>

      {/* Grid: Request Form (for Manager) & Requisition History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form (if Branch Manager) or Logistics Policy (if Executive) */}
        <div className="lg:col-span-1 space-y-6">
          {isBranchManager ? (
            <div className="bg-[#0e1117] border border-zinc-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-800/80 mb-4">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-zinc-100">Buat Permintaan Restock</h2>
                  <p className="text-xs text-zinc-400">Cabang: {currentBranch?.name}</p>
                </div>
              </div>

              {isSuccess && (
                <div className="p-3.5 mb-4 rounded-lg bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Permintaan berhasil diajukan ke Gudang Pusat!</span>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 mb-4 rounded-lg bg-rose-950/60 border border-rose-800/50 text-rose-300 text-xs">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmitRequisition} className="space-y-4">
                {/* Product Selection */}
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Pilih Produk Salon
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full bg-[#161a23] border border-zinc-700/80 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500/70"
                  >
                    {PRODUCTS_DATA.map((prod) => (
                      <option key={prod.id} value={prod.id} className="bg-[#121620] text-zinc-200">
                        {prod.number} - {prod.name} ({prod.volume})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantity */}
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                      Jumlah Unit
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                      className="w-full bg-[#161a23] border border-zinc-700/80 rounded-lg px-3 py-2 text-xs font-mono text-zinc-100 focus:outline-none focus:border-amber-500/70"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg transition-colors border border-zinc-700"
                  >
                    + Masukkan
                  </button>
                </div>

                {/* Basket List */}
                <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                    Daftar Barang yang Diajukan ({requestItems.length}):
                  </span>
                  {requestItems.length === 0 ? (
                    <p className="text-xs text-zinc-500 italic py-2">
                      Belum ada barang dipilih. Klik &quot;+ Masukkan&quot; di atas.
                    </p>
                  ) : (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {requestItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded bg-zinc-900/80 border border-zinc-800 text-xs"
                        >
                          <span className="font-medium text-zinc-200 truncate pr-2">
                            {item.quantityRequested}x {item.productName}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-zinc-500 hover:text-rose-400 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Catatan Operasional (Opsional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contoh: Lonjakan reservasi Head-Spa akhir pekan, stok menipis."
                    rows={2}
                    className="w-full bg-[#161a23] border border-zinc-700/80 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/70"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={requestItems.length === 0}
                  className="w-full py-2.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-950 text-xs font-semibold shadow-sm transition-colors"
                >
                  Kirim Permintaan ke Gudang
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-[#0e1117] border border-zinc-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-amber-400">
                <Sparkles className="w-4 h-4" />
                <h3 className="text-xs font-semibold uppercase tracking-wider">
                  Protokol Logistik Pusat
                </h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Sebagai Executive HQ, Anda memantau arus barang antar gudang pusat dan seluruh cabang.
                Pengajuan restock diajukan oleh masing-masing Branch Manager dan diproses oleh tim
                Gudang Pusat via portal Central Supply.
              </p>
              <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-400">
                <span className="text-zinc-200 font-medium block mb-1">Integrasi Laba Rugi:</span>
                Ketika gudang mengubah status permintaan menjadi <span className="text-emerald-400">DISPATCHED</span>,
                nilai HPP produk langsung dibukukan pada akun Beban Produk Salon di P&L cabang.
              </div>
            </div>
          )}

          {/* Restock Info Card */}
          <div className="bg-[#0e1117] border border-zinc-800 rounded-xl p-5 text-xs text-zinc-400 space-y-2">
            <h3 className="font-semibold text-zinc-200 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-zinc-400" />
              <span>Jadwal Pengiriman Gudang</span>
            </h3>
            <p>
              Pengiriman logistik Jabodetabek diberangkatkan setiap hari Selasa & Jumat pukul 14:00 WIB
              dari Central Warehouse Jakarta Barat.
            </p>
          </div>
        </div>

        {/* Right Column: Requisition Tracking Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#0e1117] border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-zinc-800/80 bg-[#121620]/60 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-zinc-200">
                  Riwayat & Status Permintaan Restock
                </h2>
                <p className="text-xs text-zinc-400">
                  Pemantauan real-time proses persetujuan dan pengiriman barang dari gudang
                </p>
              </div>
              <span className="text-xs font-mono text-zinc-400">
                {branchRequisitions.length} Tiket
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-zinc-800 bg-zinc-900/40 text-zinc-400">
                  <tr>
                    <th className="px-6 py-3 font-medium">Tiket & Waktu</th>
                    <th className="px-6 py-3 font-medium">Cabang</th>
                    <th className="px-6 py-3 font-medium">Rincian Barang</th>
                    <th className="px-6 py-3 font-medium">Status Pengiriman</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
                  {branchRequisitions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">
                        Belum ada permintaan restock tercatat untuk cabang ini.
                      </td>
                    </tr>
                  ) : (
                    branchRequisitions.map((req) => {
                      const isDispatched = req.status === 'DISPATCHED' || req.status === 'RECEIVED';

                      return (
                        <tr key={req.id} className="hover:bg-zinc-800/30 transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-mono text-amber-300 block font-medium">
                              {req.id}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-mono">
                              {req.createdAt.replace('T', ' ').slice(0, 16)}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <span className="font-medium text-zinc-200 block">{req.branchName}</span>
                            <span className="text-[10px] text-zinc-500">{req.requestedByStaffName}</span>
                          </td>

                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              {req.items.map((item, iIdx) => (
                                <div key={iIdx} className="text-zinc-200 flex items-center gap-1.5">
                                  <span className="font-mono text-amber-400">
                                    {item.quantityDispatched ?? item.quantityRequested}x
                                  </span>
                                  <span>{item.productName}</span>
                                </div>
                              ))}
                            </div>
                            {req.notes && (
                              <div className="text-[10px] text-zinc-500 mt-1 italic">
                                &quot;{req.notes}&quot;
                              </div>
                            )}
                          </td>

                          <td className="px-6 py-4">
                            {req.status === 'PENDING' ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/60 text-amber-300 border border-amber-800/40 text-[11px] font-medium">
                                <Clock className="w-3 h-3" />
                                <span>Menunggu Gudang</span>
                              </span>
                            ) : req.status === 'DISPATCHED' ? (
                              <div>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 text-[11px] font-medium">
                                  <Truck className="w-3 h-3" />
                                  <span>Telah Terkirim (Dispatched)</span>
                                </span>
                                {req.dispatchedAt && (
                                  <span className="block text-[10px] text-zinc-500 font-mono mt-1">
                                    {req.dispatchedAt.replace('T', ' ').slice(0, 16)}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-950/60 text-blue-300 border border-blue-800/40 text-[11px] font-medium">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>{req.status}</span>
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
        </div>
      </div>
    </div>
  );
}
