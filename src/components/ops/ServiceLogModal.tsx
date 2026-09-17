'use client';

import React, { useState, useEffect } from 'react';
import { Booking, SensoryProfile } from '@/types';
import { Sparkles, X, Check, Droplets, Scissors, Coffee, Volume2 } from 'lucide-react';

interface ServiceLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onSave: (
    bookingId: string,
    formulaNotes: string,
    scalpCondition: string,
    additionalSensory: Partial<SensoryProfile>
  ) => void;
}

const SCALP_CONDITIONS = [
  'Normal Sehat',
  'Sensitif / Kemerahan',
  'Kering & Dehidrasi',
  'Berminyak / Sebum Tinggi',
  'Ketombe Mikro',
  'Tegang Area Tengkuk',
];

const ESSENTIAL_OILS = [
  'Sandalwood & Bergamot',
  'Hinoki & Cedarwood',
  'Japanese Yuzu & Peppermint',
  'Silver Birch & Cold Cedar',
];

const BEVERAGES = ['Artisan Cold Brew', 'Warm Herbal Tea', 'Mineral Water', 'Matcha Oat Latte'];

export default function ServiceLogModal({
  isOpen,
  onClose,
  booking,
  onSave,
}: ServiceLogModalProps) {
  const [formulaNotes, setFormulaNotes] = useState('');
  const [scalpCondition, setScalpCondition] = useState('Normal Sehat');
  const [scentPreference, setScentPreference] = useState('Sandalwood & Bergamot');
  const [beveragePreference, setBeveragePreference] = useState('Artisan Cold Brew');
  const [conversationPreference, setConversationPreference] = useState<
    'SILENT' | 'ESSENTIALS_ONLY' | 'LIGHT_CONVERSATION'
  >('SILENT');

  // Pre-fill existing sensory preferences if booking has them
  useEffect(() => {
    if (booking) {
      setFormulaNotes(booking.sensoryProfile?.notes || '');
      setScalpCondition(booking.sensoryProfile?.scalpCondition || 'Normal Sehat');
      setScentPreference(booking.sensoryProfile?.scentPreference || 'Sandalwood & Bergamot');
      setBeveragePreference(booking.sensoryProfile?.beveragePreference || 'Artisan Cold Brew');
      setConversationPreference(
        booking.sensoryProfile?.conversationPreference || 'SILENT'
      );
    }
  }, [booking]);

  if (!isOpen || !booking) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(booking.id, formulaNotes, scalpCondition, {
      scentPreference,
      beveragePreference,
      conversationPreference,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#111317] border border-zinc-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-[#16191f]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-medium text-zinc-100">Catat Log Sesi & Sensory Dossier</h2>
              <p className="text-xs text-zinc-400">
                Penyelesaian sesi untuk <span className="text-zinc-200 font-medium">{booking.customerName}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal"
            className="text-zinc-400 hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-800/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Appointment Context Strip */}
        <div className="px-6 py-3 bg-[#13161c] border-b border-zinc-800/60 flex flex-wrap items-center justify-between text-xs text-zinc-400 gap-2">
          <div>
            <span className="text-zinc-500">Layanan: </span>
            <span className="text-zinc-300 font-medium">{booking.serviceName}</span>
          </div>
          <div>
            <span className="text-zinc-500">Capster: </span>
            <span className="text-zinc-300 font-medium">{booking.capsterName || 'Master Barber'}</span>
          </div>
          <div>
            <span className="text-zinc-500">Slot: </span>
            <span className="font-mono text-amber-300 font-medium">{booking.timeSlot}</span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Haircut & Clipper Formula */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-300 mb-1.5">
              <Scissors className="w-3.5 h-3.5 text-zinc-400" />
              <span>Formula Potong Rambut & Teknik Clipper</span>
            </label>
            <textarea
              required
              rows={3}
              value={formulaNotes}
              onChange={(e) => setFormulaNotes(e.target.value)}
              placeholder="Contoh: Fade #1.5 open guard ke #2, scissor texturing atas, parting rapi sisi kiri, finish White Kaolin Matte Clay..."
              className="w-full text-xs px-3.5 py-2.5 rounded-lg bg-[#0d0f12] border border-zinc-700/70 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 transition-colors"
            />
          </div>

          {/* Scalp Condition */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-300 mb-1.5">
              <Droplets className="w-3.5 h-3.5 text-zinc-400" />
              <span>Kondisi Kulit Kepala Pasca-Layanan</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SCALP_CONDITIONS.map((cond) => {
                const isSelected = scalpCondition === cond;
                return (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => setScalpCondition(cond)}
                    className={`text-left text-xs px-3 py-2 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 font-medium'
                        : 'bg-[#0d0f12] border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'
                    }`}
                  >
                    {cond}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Essential Oil & Beverage Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Essential Oil */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Aromaterapi Essential Oil Digunakan
              </label>
              <select
                value={scentPreference}
                onChange={(e) => setScentPreference(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg bg-[#0d0f12] border border-zinc-700/70 text-zinc-200 focus:outline-none focus:border-amber-500/60 transition-colors"
              >
                {ESSENTIAL_OILS.map((oil) => (
                  <option key={oil} value={oil} className="bg-[#121418] text-zinc-200">
                    {oil}
                  </option>
                ))}
              </select>
            </div>

            {/* Beverage Served */}
            <div>
              <label className="flex items-center gap-1 text-xs font-medium text-zinc-300 mb-1.5">
                <Coffee className="w-3.5 h-3.5 text-zinc-400" />
                <span>Minuman Pendamping</span>
              </label>
              <select
                value={beveragePreference}
                onChange={(e) => setBeveragePreference(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg bg-[#0d0f12] border border-zinc-700/70 text-zinc-200 focus:outline-none focus:border-amber-500/60 transition-colors"
              >
                {BEVERAGES.map((bev) => (
                  <option key={bev} value={bev} className="bg-[#121418] text-zinc-200">
                    {bev}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Conversation / Quiet Chair Mode */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-300 mb-1.5">
              <Volume2 className="w-3.5 h-3.5 text-zinc-400" />
              <span>Preferensi Interaksi Tamu</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'SILENT', label: 'Hening Penuh (ASMR)' },
                { id: 'ESSENTIALS_ONLY', label: 'Hanya Esensial' },
                { id: 'LIGHT_CONVERSATION', label: 'Santai & Ramah' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() =>
                    setConversationPreference(
                      opt.id as 'SILENT' | 'ESSENTIALS_ONLY' | 'LIGHT_CONVERSATION'
                    )
                  }
                  className={`text-xs px-2.5 py-1.5 rounded-lg border text-center transition-all ${
                    conversationPreference === opt.id
                      ? 'bg-zinc-800 border-zinc-600 text-zinc-100 font-medium'
                      : 'bg-[#0d0f12] border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold rounded-lg transition-colors shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Simpan & Selesaikan Sesi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
