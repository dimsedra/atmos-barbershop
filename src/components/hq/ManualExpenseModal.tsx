'use client';

import React, { useState } from 'react';
import { BranchExpense } from '@/types';
import { useFinanceStore } from '@/lib/store/finance-store';
import { X, Receipt, DollarSign, Calendar, FileText, Tag, CheckCircle2 } from 'lucide-react';

interface ManualExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  branchId: string;
  branchName?: string;
  managerId: string;
}

const CATEGORIES: { value: BranchExpense['category']; label: string; description: string }[] = [
  {
    value: 'UTILITIES',
    label: 'Utilitas & Listrik',
    description: 'PLN, air bersih, pendingin ruangan (AC), internet berkecepatan tinggi',
  },
  {
    value: 'SUPPLIES',
    label: 'Perlengkapan & Laundry',
    description: 'Laundry higienis handuk hangat, kimono tamu, disinfektan sanitasi',
  },
  {
    value: 'MAINTENANCE',
    label: 'Pemeliharaan Studio',
    description: 'Servis washbed hidrolik, filter HVAC, servis gunting & peralatan',
  },
  {
    value: 'REFRESHMENTS',
    label: 'Welcome Drinks & Bar',
    description: 'Biji kopi single origin, seduhan herbal, air mineral kaca, camilan santai',
  },
  {
    value: 'OTHER',
    label: 'Operasional Lainnya',
    description: 'Kebutuhan tak terduga cabang studio',
  },
];

export default function ManualExpenseModal({
  isOpen,
  onClose,
  branchId,
  branchName,
  managerId,
}: ManualExpenseModalProps) {
  const { addExpense } = useFinanceStore();

  const todayStr = new Date().toISOString().split('T')[0];
  const [category, setCategory] = useState<BranchExpense['category']>('UTILITIES');
  const [description, setDescription] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [date, setDate] = useState(todayStr);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const parsedAmount = parseInt(amountStr.replace(/\D/g, ''), 10) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!description.trim()) {
      setErrorMessage('Harap isi deskripsi pengeluaran dengan jelas.');
      return;
    }

    if (parsedAmount <= 0) {
      setErrorMessage('Nominal pengeluaran harus lebih besar dari Rp 0.');
      return;
    }

    addExpense(branchId, managerId, category, parsedAmount, description.trim(), date);
    setIsSuccess(true);

    setTimeout(() => {
      setIsSuccess(false);
      setDescription('');
      setAmountStr('');
      setDate(todayStr);
      onClose();
    }, 1200);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) {
      setAmountStr('');
      return;
    }
    const num = parseInt(raw, 10);
    setAmountStr(new Intl.NumberFormat('id-ID').format(num));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#0e1117] border border-zinc-800 rounded-xl shadow-2xl text-zinc-100 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-[#121620]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">Catat Beban Operasional Cabang</h2>
              <p className="text-xs text-zinc-400">
                {branchName || branchId} · Khusus Branch Manager
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        {isSuccess ? (
          <div className="p-8 text-center flex flex-col items-center justify-center gap-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-bounce" />
            <h3 className="text-base font-semibold text-zinc-100">Beban Berhasil Dicatat</h3>
            <p className="text-xs text-zinc-400 max-w-xs">
              Pengeluaran telah masuk ke dalam rekonsiliasi P&L cabang untuk periode berjalan.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {errorMessage && (
              <div className="p-3 text-xs rounded-lg bg-rose-950/50 border border-rose-800/50 text-rose-300">
                {errorMessage}
              </div>
            )}

            {/* Category Select */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-zinc-400" />
                <span>Kategori Pengeluaran</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as BranchExpense['category'])}
                className="w-full bg-[#161a23] border border-zinc-700/80 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500/70"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value} className="bg-[#121620] text-zinc-200">
                    {cat.label} ({cat.description.slice(0, 32)}...)
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-zinc-400" />
                <span>Rincian / Keterangan Beban</span>
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Contoh: Tagihan Listrik PLN 3 Phase & AC Inverter"
                className="w-full bg-[#161a23] border border-zinc-700/80 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/70"
                required
              />
            </div>

            {/* Amount & Date in Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Nominal Biaya (IDR)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-zinc-500 font-mono">Rp</span>
                  <input
                    type="text"
                    value={amountStr}
                    onChange={handleAmountChange}
                    placeholder="0"
                    className="w-full bg-[#161a23] border border-zinc-700/80 rounded-lg pl-10 pr-3 py-2 text-xs font-mono text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/70"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Tanggal Pembayaran</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#161a23] border border-zinc-700/80 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500/70 [color-scheme:dark]"
                  required
                />
              </div>
            </div>

            {/* Live deduction explanation */}
            <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-[11px] text-zinc-400 leading-relaxed">
              <span className="font-semibold text-zinc-300">P&L Linkage:</span> Pengeluaran ini akan
              secara langsung memotong laba bersih operasional cabang pada laporan laba rugi bulanan
              yang dapat diaudit oleh jajaran direksi eksekutif.
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-800/80">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-zinc-800/60 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-medium bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold rounded-lg shadow-sm transition-colors"
              >
                Simpan Beban
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
