'use client';

import React, { useState, useId } from 'react';
import Link from 'next/link';
import { 
  X, 
  MapPin, 
  Clock, 
  Calendar as CalendarIcon, 
  ChevronRight, 
  ChevronLeft, 
  Check,
  Headphones,
  Sparkles,
  VolumeX,
  ArrowRight
} from 'lucide-react';
import { BRANCHES_DATA, SERVICES_DATA, CAPSTERS_DATA } from '@/lib/mock/data';
import { ServiceItem, Branch, Capster, Booking } from '@/types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBranchId?: string;
  initialService?: ServiceItem | null;
  initialCapster?: Capster | null;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  initialBranchId,
  initialService,
  initialCapster,
}) => {
  const [step, setStep] = useState<number>(1);
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    initialBranchId || BRANCHES_DATA[0].id
  );
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    initialService ? initialService.id : SERVICES_DATA[0].id
  );
  const [selectedCapsterId, setSelectedCapsterId] = useState<string>(
    initialCapster ? initialCapster.id : ''
  );

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [selectedTime, setSelectedTime] = useState<string>('14:00');

  // Sensory Sanctuary Preferences
  const [asmrMode, setAsmrMode] = useState<'headphone' | 'speaker' | 'tanpa'>('headphone');
  const [massageForce, setMassageForce] = useState<'ringan' | 'standar' | 'kuat' | 'lewati'>('standar');
  const [quietChair, setQuietChair] = useState<boolean>(true);

  // Guest details
  const [guestName, setGuestName] = useState<string>('');
  const [guestPhone, setGuestPhone] = useState<string>('');
  const [guestNotes, setGuestNotes] = useState<string>('');

  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  if (!isOpen) return null;

  const currentBranch = BRANCHES_DATA.find((b) => b.id === selectedBranchId) || BRANCHES_DATA[0];
  const currentService = SERVICES_DATA.find((s) => s.id === selectedServiceId) || SERVICES_DATA[0];
  const availableCapsters = CAPSTERS_DATA.filter((c) => c.branchId === selectedBranchId);
  const currentCapster = CAPSTERS_DATA.find((c) => c.id === selectedCapsterId) || availableCapsters[0] || CAPSTERS_DATA[0];

  const timeSlots = [
    '10:00', '11:15', '12:30', '14:00', '15:15', '16:30', '18:00', '19:15', '20:30'
  ];

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !guestPhone) return;

    const bookingNum = `ATM-BK-${Math.floor(100000 + Math.random() * 900000)}`;

    const newBooking: Booking = {
      id: `bk-${Date.now()}`,
      bookingNumber: bookingNum,
      customerName: guestName,
      customerPhone: guestPhone,
      customerEmail: 'customer@atmos.id',
      branchId: currentBranch.id,
      branchName: currentBranch.name,
      capsterId: currentCapster?.id || 'st-01',
      capsterName: currentCapster?.name || 'Master Barber ATMOS',
      serviceId: currentService.id,
      serviceName: currentService.title,
      servicePrice: currentService.price,
      date: selectedDate,
      timeSlot: selectedTime,
      status: 'CONFIRMED',
      sensoryProfile: {
        scentPreference: 'Silver Birch Signature',
        conversationPreference: quietChair ? 'SILENT' : 'LIGHT_CONVERSATION',
        notes: `ASMR Mode: ${asmrMode} | Pijat: ${massageForce} | Kursi Hening: ${quietChair ? 'Ya' : 'Tidak'}`
      },
      notes: guestNotes,
      createdAt: new Date().toISOString(),
    };

    try {
      const existing = localStorage.getItem('atmos_customer_bookings');
      const bookings: Booking[] = existing ? JSON.parse(existing) : [];
      localStorage.setItem('atmos_customer_bookings', JSON.stringify([newBooking, ...bookings]));
    } catch {
      // ignore
    }

    setConfirmedBooking(newBooking);
    setIsSuccess(true);
  };

  const generateWhatsAppMessage = () => {
    const text = `Halo Concierge ATMOS, saya mengonfirmasi reservasi terjadwal saya:%0A%0A` +
      `• Kode Booking: ${confirmedBooking?.bookingNumber || 'Baru'}%0A` +
      `• Nama: ${guestName}%0A` +
      `• Cabang: ${currentBranch.name}%0A` +
      `• Layanan: ${currentService.title} (${currentService.duration} Menit)%0A` +
      `• Capster: ${currentCapster?.name || 'Tersedia'}%0A` +
      `• Jadwal: ${selectedDate} pukul ${selectedTime} WIB%0A` +
      `• Opsi Sensorik: ASMR (${asmrMode}), Pijatan (${massageForce}), Hening (${quietChair ? 'Aktif' : 'Non-aktif'})%0A` +
      `• Catatan: ${guestNotes || 'Tidak ada'}`;
    return `https://wa.me/${currentBranch.whatsapp}?text=${text}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-xl sm:max-w-2xl bg-white rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-base text-zinc-950">
                Reservasi Sesi Studio
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-[10px] font-mono font-medium text-zinc-600 uppercase">
                Strictly By Appointment
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Slot waktu privat eksklusif di studio pilihan Jabodetabek
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress */}
        {!isSuccess && (
          <div className="px-6 py-3 bg-zinc-50 border-b border-zinc-100 flex items-center justify-between text-xs font-mono text-zinc-400 overflow-x-auto no-scrollbar">
            <span className={step === 1 ? 'font-bold text-zinc-950' : ''}>1. Cabang</span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-300 shrink-0 mx-1" />
            <span className={step === 2 ? 'font-bold text-zinc-950' : ''}>2. Layanan</span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-300 shrink-0 mx-1" />
            <span className={step === 3 ? 'font-bold text-zinc-950' : ''}>3. Capster</span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-300 shrink-0 mx-1" />
            <span className={step === 4 ? 'font-bold text-zinc-950' : ''}>4. Waktu</span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-300 shrink-0 mx-1" />
            <span className={step === 5 ? 'font-bold text-zinc-950' : ''}>5. Sensorik</span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-300 shrink-0 mx-1" />
            <span className={step === 6 ? 'font-bold text-zinc-950' : ''}>6. Data Tamu</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {isSuccess ? (
            <div className="py-8 text-center space-y-6">
              <div className="w-12 h-12 rounded-full bg-zinc-950 text-white flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <span className="text-xs font-mono text-[#8A7862] tracking-wider uppercase">
                  {confirmedBooking?.bookingNumber}
                </span>
                <h4 className="font-display text-2xl font-bold text-zinc-950">
                  Reservasi Telah Terjadwal
                </h4>
                <p className="text-xs sm:text-sm text-zinc-600 max-w-md mx-auto leading-relaxed">
                  Terima kasih, <strong>{guestName}</strong>. Kursi privat Anda di <strong>{currentBranch.name}</strong> bersama <strong>{currentCapster?.name}</strong> telah disiapkan untuk <strong>{selectedDate} ({selectedTime} WIB)</strong>.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 text-left space-y-2.5 text-xs text-zinc-700 max-w-md mx-auto">
                <div className="flex justify-between pb-1 border-b border-zinc-200">
                  <span className="text-zinc-500">Cabang:</span>
                  <span className="font-semibold text-zinc-900">{currentBranch.name}</span>
                </div>
                <div className="flex justify-between pb-1 border-b border-zinc-200">
                  <span className="text-zinc-500">Layanan:</span>
                  <span className="font-semibold text-zinc-900">{currentService.title}</span>
                </div>
                <div className="flex justify-between pb-1 border-b border-zinc-200">
                  <span className="text-zinc-500">Capster / Stylist:</span>
                  <span className="font-semibold text-zinc-900">{currentCapster?.name}</span>
                </div>
                <div className="flex justify-between pb-1 border-b border-zinc-200">
                  <span className="text-zinc-500">Durasi & Investasi:</span>
                  <span className="font-semibold text-zinc-900">{currentService.duration} Menit • {formatRupiah(currentService.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Kenyamanan Sensorik:</span>
                  <span className="font-semibold text-zinc-900">ASMR: {asmrMode} • Pijat: {massageForce}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={generateWhatsAppMessage()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold uppercase tracking-wider text-center transition-colors"
                >
                  Konfirmasi via WhatsApp
                </a>
                <Link
                  href="/customer/orders"
                  onClick={onClose}
                  className="px-6 py-3 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold uppercase tracking-wider text-center transition-colors flex items-center justify-center gap-2"
                >
                  <span>Buka di Lacak Pesanan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={onClose}
                  className="px-6 py-3 rounded-full border border-zinc-200 hover:bg-zinc-50 text-zinc-800 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Selesai
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Step 1: Select Branch */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                    Pilih Lokasi Studio
                  </div>
                  <div className="space-y-2.5">
                    {BRANCHES_DATA.map((branch) => (
                      <div
                        key={branch.id}
                        onClick={() => {
                          setSelectedBranchId(branch.id);
                          setSelectedCapsterId('');
                        }}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          selectedBranchId === branch.id
                            ? 'border-zinc-950 bg-zinc-50'
                            : 'border-zinc-200 hover:border-zinc-300'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="font-display text-sm font-bold text-zinc-950">
                            {branch.name}
                          </div>
                          <div className="text-xs text-zinc-500 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            <span>{branch.address}</span>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          selectedBranchId === branch.id
                            ? 'border-zinc-950 bg-zinc-950 text-white'
                            : 'border-zinc-300'
                        }`}>
                          {selectedBranchId === branch.id && <Check className="w-2.5 h-2.5" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Select Service */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                    Pilih Menu Layanan
                  </div>
                  <div className="space-y-2.5">
                    {SERVICES_DATA.map((srv) => (
                      <div
                        key={srv.id}
                        onClick={() => setSelectedServiceId(srv.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          selectedServiceId === srv.id
                            ? 'border-zinc-950 bg-zinc-50'
                            : 'border-zinc-200 hover:border-zinc-300'
                        }`}
                      >
                        <div className="space-y-1 pr-4">
                          <div className="flex items-center gap-2">
                            <span className="font-display text-sm font-bold text-zinc-950">
                              {srv.title}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-400 uppercase">
                              • {srv.targetAudience}
                            </span>
                          </div>
                          <div className="text-xs text-zinc-500 font-mono">
                            {srv.duration} Menit • {formatRupiah(srv.price)}
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border shrink-0 flex items-center justify-center ${
                          selectedServiceId === srv.id
                            ? 'border-zinc-950 bg-zinc-950 text-white'
                            : 'border-zinc-300'
                        }`}>
                          {selectedServiceId === srv.id && <Check className="w-2.5 h-2.5" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Select Capster */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                    Pilih Capster / Stylist ({currentBranch.name})
                  </div>
                  <div className="space-y-2.5">
                    {availableCapsters.length > 0 ? (
                      availableCapsters.map((capster) => (
                        <div
                          key={capster.id}
                          onClick={() => setSelectedCapsterId(capster.id)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                            selectedCapsterId === capster.id || (!selectedCapsterId && availableCapsters[0]?.id === capster.id)
                              ? 'border-zinc-950 bg-zinc-50'
                              : 'border-zinc-200 hover:border-zinc-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={capster.avatar}
                              alt={capster.name}
                              className="w-12 h-12 rounded-xl object-cover"
                            />
                            <div>
                              <div className="font-display text-sm font-bold text-zinc-950">
                                {capster.name}
                              </div>
                              <div className="text-xs text-zinc-500 font-mono">
                                {capster.role} • ★ {capster.rating}
                              </div>
                            </div>
                          </div>
                          <div className={`w-4 h-4 rounded-full border shrink-0 flex items-center justify-center ${
                            selectedCapsterId === capster.id || (!selectedCapsterId && availableCapsters[0]?.id === capster.id)
                              ? 'border-zinc-950 bg-zinc-950 text-white'
                              : 'border-zinc-300'
                          }`}>
                            {(selectedCapsterId === capster.id || (!selectedCapsterId && availableCapsters[0]?.id === capster.id)) && (
                              <Check className="w-2.5 h-2.5" />
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-xs text-zinc-500 border border-dashed rounded-2xl">
                        Semua master barber tersedia untuk studio ini.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Date & Time */}
              {step === 4 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 mb-2">
                      Pilih Tanggal Reservasi
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-900 focus:outline-none focus:border-zinc-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 mb-2">
                      Pilih Slot Waktu Sesi (Eksklusif 1 Tamu)
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setSelectedTime(time)}
                          className={`py-2.5 rounded-xl text-xs font-mono transition-colors cursor-pointer border ${
                            selectedTime === time
                              ? 'bg-zinc-950 text-white border-zinc-950 font-bold'
                              : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                          }`}
                        >
                          {time} WIB
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Sensory Sanctuary Preferences */}
              {step === 5 && (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <div className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                      Preferensi Ruang & Sensorik
                    </div>
                    <p className="text-xs text-zinc-500">
                      Personalisasi lingkungan studio untuk memastikan kenyamanan holistik Anda.
                    </p>
                  </div>

                  {/* ASMR Mode */}
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-zinc-800">
                      Mode Suara & ASMR Sesi
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'headphone', label: 'Headphone Studio' },
                        { id: 'speaker', label: 'Audio Ambien' },
                        { id: 'tanpa', label: 'Tanpa Audio' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setAsmrMode(item.id as any)}
                          className={`p-3 rounded-xl border text-xs text-center transition-all cursor-pointer ${
                            asmrMode === item.id
                              ? 'border-zinc-950 bg-zinc-900 text-white font-medium'
                              : 'border-zinc-200 hover:border-zinc-300 text-zinc-700 bg-white'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Massage Force */}
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-zinc-800">
                      Tekanan Pijat Leher & Pundak
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: 'ringan', label: 'Ringan' },
                        { id: 'standar', label: 'Standar' },
                        { id: 'kuat', label: 'Kuat' },
                        { id: 'lewati', label: 'Lewati' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setMassageForce(item.id as any)}
                          className={`p-2.5 rounded-xl border text-xs text-center transition-all cursor-pointer ${
                            massageForce === item.id
                              ? 'border-zinc-950 bg-zinc-900 text-white font-medium'
                              : 'border-zinc-200 hover:border-zinc-300 text-zinc-700 bg-white'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quiet Chair Toggle */}
                  <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                    <div className="space-y-0.5 pr-4">
                      <div className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                        <VolumeX className="w-3.5 h-3.5 text-zinc-700" />
                        <span>Kursi Hening (Quiet Chair)</span>
                      </div>
                      <p className="text-[11px] text-zinc-500">
                        Capster membatasi obrolan hanya pada pertanyaan teknis pangkas dan kebutuhan relaksasi.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setQuietChair(!quietChair)}
                      className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                        quietChair ? 'bg-zinc-950' : 'bg-zinc-300'
                      }`}
                      aria-label="Toggle kursi hening"
                    >
                      <span
                        className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                          quietChair ? 'right-0.5' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 6: Guest Info */}
              {step === 6 && (
                <form onSubmit={handleConfirmBooking} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="e.g. Nicholas Surya"
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs sm:text-sm text-zinc-900 focus:outline-none focus:border-zinc-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Nomor WhatsApp
                    </label>
                    <input
                      type="tel"
                      required
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="e.g. 081288990011"
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs sm:text-sm text-zinc-900 focus:outline-none focus:border-zinc-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Catatan Tambahan (Opsional)
                    </label>
                    <textarea
                      rows={3}
                      value={guestNotes}
                      onChange={(e) => setGuestNotes(e.target.value)}
                      placeholder="Informasi struktur rambut, alergi kulit kepala, atau preferensi khusus..."
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs sm:text-sm text-zinc-900 focus:outline-none focus:border-zinc-900"
                    />
                  </div>
                </form>
              )}
            </>
          )}
        </div>

        {/* Footer Controls */}
        {!isSuccess && (
          <div className="p-6 border-t border-zinc-100 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 rounded-full border border-zinc-200 hover:bg-zinc-50 text-zinc-800 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Kembali</span>
              </button>
            ) : <div />}

            {step < 6 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-6 py-2.5 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Lanjut</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={!guestName || !guestPhone}
                className="px-6 py-2.5 rounded-full bg-zinc-950 hover:bg-zinc-800 disabled:bg-zinc-300 text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Konfirmasi Reservasi
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
