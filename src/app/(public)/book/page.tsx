'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  MapPin, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  VolumeX, 
  Headphones, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Clock
} from 'lucide-react';
import { BRANCHES_DATA, SERVICES_DATA, CAPSTERS_DATA } from '@/lib/mock/data';
import { Booking, Capster } from '@/types';

function BookingWizardContent() {
  const searchParams = useSearchParams();
  const branchParam = searchParams.get('branch');
  const serviceParam = searchParams.get('service');
  const capsterParam = searchParams.get('capster');

  const [step, setStep] = useState<number>(1);
  const [selectedBranchId, setSelectedBranchId] = useState<string>(branchParam || BRANCHES_DATA[0].id);
  const [selectedServiceId, setSelectedServiceId] = useState<string>(serviceParam || SERVICES_DATA[0].id);
  const [selectedCapsterId, setSelectedCapsterId] = useState<string>(capsterParam || '');

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

  // Guest Information
  const [guestName, setGuestName] = useState<string>('');
  const [guestPhone, setGuestPhone] = useState<string>('');
  const [guestNotes, setGuestNotes] = useState<string>('');

  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Update initial selections if search params present
  useEffect(() => {
    if (branchParam && BRANCHES_DATA.some(b => b.id === branchParam)) {
      setSelectedBranchId(branchParam);
    }
    if (serviceParam && SERVICES_DATA.some(s => s.id === serviceParam)) {
      setSelectedServiceId(serviceParam);
    }
    if (capsterParam && CAPSTERS_DATA.some(c => c.id === capsterParam)) {
      setSelectedCapsterId(capsterParam);
    }
  }, [branchParam, serviceParam, capsterParam]);

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

  const handleConfirm = (e: React.FormEvent) => {
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
        notes: `ASMR Mode: ${asmrMode} | Pijat: ${massageForce} | Kursi Hening: ${quietChair ? 'Aktif' : 'Non-aktif'}`
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
    const text = `Halo Concierge ATMOS, saya ingin mengonfirmasi reservasi terjadwal saya:%0A%0A` +
      `• Kode Reservasi: ${confirmedBooking?.bookingNumber || 'Baru'}%0A` +
      `• Nama: ${guestName}%0A` +
      `• Studio: ${currentBranch.name}%0A` +
      `• Layanan: ${currentService.title} (${currentService.duration} Menit)%0A` +
      `• Artisan: ${currentCapster?.name || 'Tersedia'}%0A` +
      `• Tanggal & Waktu: ${selectedDate} pukul ${selectedTime} WIB%0A` +
      `• Kenyamanan Sensorik: ASMR (${asmrMode}), Pijatan (${massageForce}), Hening (${quietChair ? 'Aktif' : 'Non-aktif'})%0A` +
      `• Catatan: ${guestNotes || 'Tidak ada'}`;
    return `https://wa.me/${currentBranch.whatsapp}?text=${text}`;
  };

  return (
    <div className="py-12 md:py-20 max-w-4xl mx-auto px-6 sm:px-8">
      {/* Page Heading & Protocol Badge */}
      <div className="text-center space-y-4 mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFECE6] border border-[#E6E4DF] text-[11px] font-mono tracking-wider text-zinc-800 uppercase">
          <ShieldCheck className="w-3.5 h-3.5 text-[#8A7862]" />
          <span>Strictly By Appointment • 0 Antrean</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-950 tracking-tight">
          Reservasi Sesi Privat
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 max-w-xl mx-auto leading-relaxed">
          Pilih lokasi, layanan presisi, master barber, dan preferensi sensorik Anda untuk pengalaman relaksasi yang hening dan tanpa interupsi.
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl border border-[#E6E4DF] shadow-[0_4px_24px_rgba(0,0,0,0.04)] overflow-hidden">
        
        {/* Progress Tabs */}
        {!isSuccess && (
          <div className="px-6 py-4 bg-[#FAF9F6] border-b border-[#E6E4DF] flex items-center justify-between text-xs font-mono text-zinc-500 overflow-x-auto no-scrollbar">
            <span className={step === 1 ? 'font-bold text-zinc-950' : ''}>1. Cabang</span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-300 shrink-0 mx-1" />
            <span className={step === 2 ? 'font-bold text-zinc-950' : ''}>2. Layanan</span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-300 shrink-0 mx-1" />
            <span className={step === 3 ? 'font-bold text-zinc-950' : ''}>3. Capster</span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-300 shrink-0 mx-1" />
            <span className={step === 4 ? 'font-bold text-zinc-950' : ''}>4. Jadwal</span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-300 shrink-0 mx-1" />
            <span className={step === 5 ? 'font-bold text-zinc-950' : ''}>5. Sensorik</span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-300 shrink-0 mx-1" />
            <span className={step === 6 ? 'font-bold text-zinc-950' : ''}>6. Data Tamu</span>
          </div>
        )}

        {/* Wizard Body */}
        <div className="p-6 sm:p-10">
          {isSuccess ? (
            <div className="py-8 text-center space-y-6">
              <div className="w-14 h-14 rounded-full bg-zinc-950 text-white flex items-center justify-center mx-auto shadow-md">
                <Check className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <span className="text-xs font-mono text-[#8A7862] tracking-wider uppercase font-bold">
                  {confirmedBooking?.bookingNumber}
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-zinc-950">
                  Reservasi Anda Berhasil Terjadwal
                </h2>
                <p className="text-sm text-zinc-600 max-w-md mx-auto leading-relaxed">
                  Terima kasih, <strong>{guestName}</strong>. Kursi privat Anda di <strong>{currentBranch.name}</strong> bersama <strong>{currentCapster?.name}</strong> telah disiapkan untuk tanggal <strong>{selectedDate} ({selectedTime} WIB)</strong>.
                </p>
              </div>

              {/* Summary Card */}
              <div className="p-6 rounded-2xl bg-[#FAF9F6] border border-[#E6E4DF] text-left space-y-3 text-xs sm:text-sm text-zinc-700 max-w-lg mx-auto">
                <div className="flex justify-between pb-2 border-b border-[#E6E4DF]">
                  <span className="text-zinc-500">Cabang:</span>
                  <span className="font-semibold text-zinc-950">{currentBranch.name}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-[#E6E4DF]">
                  <span className="text-zinc-500">Layanan:</span>
                  <span className="font-semibold text-zinc-950">{currentService.title}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-[#E6E4DF]">
                  <span className="text-zinc-500">Capster:</span>
                  <span className="font-semibold text-zinc-950">{currentCapster?.name}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-[#E6E4DF]">
                  <span className="text-zinc-500">Durasi & Biaya:</span>
                  <span className="font-semibold text-zinc-950">{currentService.duration} Menit • {formatRupiah(currentService.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Opsi Sensorik:</span>
                  <span className="font-semibold text-zinc-950">Audio: {asmrMode} • Pijat: {massageForce} • Kursi Hening: {quietChair ? 'Aktif' : 'Non-aktif'}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 flex flex-col sm:flex-row gap-3.5 justify-center">
                <a
                  href={generateWhatsAppMessage()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-3.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold uppercase tracking-wider text-center transition-colors shadow-xs"
                >
                  Konfirmasi via WhatsApp
                </a>
                <Link
                  href="/customer/orders"
                  className="px-8 py-3.5 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold uppercase tracking-wider text-center transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <span>Buka di Lacak Pesanan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/"
                  className="px-8 py-3.5 rounded-full border border-zinc-200 hover:bg-zinc-50 text-zinc-800 text-xs font-semibold uppercase tracking-wider text-center transition-colors"
                >
                  Kembali ke Beranda
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Step 1: Select Branch */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h3 className="font-display text-xl font-bold text-zinc-950">
                      Pilih Studio ATMOS
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Tersedia di 6 lokasi eksklusif Jabodetabek dengan ruang hening berstandar sanitasi medis.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {BRANCHES_DATA.map((branch) => (
                      <div
                        key={branch.id}
                        onClick={() => {
                          setSelectedBranchId(branch.id);
                          setSelectedCapsterId('');
                        }}
                        className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                          selectedBranchId === branch.id
                            ? 'border-zinc-950 bg-[#FAF9F6] shadow-xs'
                            : 'border-zinc-200 hover:border-zinc-300 bg-white'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono tracking-widest text-[#8A7862] uppercase">
                              {branch.area}
                            </span>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              selectedBranchId === branch.id
                                ? 'border-zinc-950 bg-zinc-950 text-white'
                                : 'border-zinc-300'
                            }`}>
                              {selectedBranchId === branch.id && <Check className="w-2.5 h-2.5" />}
                            </div>
                          </div>
                          <div className="font-display text-base font-bold text-zinc-950">
                            {branch.name}
                          </div>
                          <p className="text-xs text-zinc-500 line-clamp-2">
                            {branch.address}
                          </p>
                        </div>
                        <div className="pt-3 mt-3 border-t border-zinc-100 text-[11px] font-mono text-zinc-400">
                          {branch.hours}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Select Service */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h3 className="font-display text-xl font-bold text-zinc-950">
                      Pilih Menu Layanan
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Setiap sesi mencakup konsultasi bentuk wajah, cuci zero-gravity, dan pijat leher-pundak.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {SERVICES_DATA.map((srv) => (
                      <div
                        key={srv.id}
                        onClick={() => setSelectedServiceId(srv.id)}
                        className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          selectedServiceId === srv.id
                            ? 'border-zinc-950 bg-[#FAF9F6] shadow-xs'
                            : 'border-zinc-200 hover:border-zinc-300 bg-white'
                        }`}
                      >
                        <div className="space-y-1 pr-4">
                          <div className="flex items-center gap-2">
                            <span className="font-display text-base font-bold text-zinc-950">
                              {srv.title}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-400 uppercase">
                              • {srv.targetAudience}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-500 max-w-xl">
                            {srv.subtitle}
                          </p>
                          <div className="text-xs font-mono text-zinc-700 pt-1 font-semibold">
                            {srv.duration} Menit • {formatRupiah(srv.price)}
                          </div>
                        </div>

                        <div className={`w-5 h-5 rounded-full border shrink-0 flex items-center justify-center ${
                          selectedServiceId === srv.id
                            ? 'border-zinc-950 bg-zinc-950 text-white'
                            : 'border-zinc-300'
                        }`}>
                          {selectedServiceId === srv.id && <Check className="w-3 h-3" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Select Capster */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h3 className="font-display text-xl font-bold text-zinc-950">
                      Pilih Master Barber & Stylist
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Artisan berdedikasi tinggi di {currentBranch.name}.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {availableCapsters.length > 0 ? (
                      availableCapsters.map((capster) => (
                        <div
                          key={capster.id}
                          onClick={() => setSelectedCapsterId(capster.id)}
                          className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between ${
                            selectedCapsterId === capster.id || (!selectedCapsterId && availableCapsters[0]?.id === capster.id)
                              ? 'border-zinc-950 bg-[#FAF9F6] shadow-xs'
                              : 'border-zinc-200 hover:border-zinc-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <img
                              src={capster.avatar}
                              alt={capster.name}
                              className="w-14 h-14 rounded-2xl object-cover"
                            />
                            <div className="space-y-1">
                              <div className="font-display text-sm font-bold text-zinc-950">
                                {capster.name}
                              </div>
                              <div className="text-xs text-zinc-500 font-mono">
                                {capster.role}
                              </div>
                              <div className="text-[11px] text-[#8A7862] font-mono">
                                {capster.experience} • ★ {capster.rating}
                              </div>
                            </div>
                          </div>

                          <div className={`w-4 h-4 rounded-full border shrink-0 flex items-center justify-center mt-1 ${
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
                      <div className="col-span-2 p-8 text-center text-xs text-zinc-500 border border-dashed rounded-2xl">
                        Semua master barber tersedia untuk studio ini.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Date & Time */}
              {step === 4 && (
                <div className="space-y-8">
                  <div className="space-y-1">
                    <h3 className="font-display text-xl font-bold text-zinc-950">
                      Pilih Tanggal & Jam Sesi
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Setiap slot dialokasikan untuk 1 tamu dengan sanitasi peralatan menyeluruh sebelum sesi dimulai.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 mb-2.5">
                        Pilih Tanggal Reservasi
                      </label>
                      <input
                        type="date"
                        value={selectedDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border border-zinc-200 text-sm text-zinc-900 focus:outline-none focus:border-zinc-950 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 mb-2.5">
                        Pilih Jam Sesi
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {timeSlots.map((time) => (
                          <button
                            key={time}
                            type="button"
                            onClick={() => setSelectedTime(time)}
                            className={`py-3 rounded-xl text-xs font-mono transition-colors cursor-pointer border ${
                              selectedTime === time
                                ? 'bg-zinc-950 text-white border-zinc-950 font-bold shadow-xs'
                                : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                            }`}
                          >
                            {time} WIB
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Sensory Sanctuary Options */}
              {step === 5 && (
                <div className="space-y-8">
                  <div className="space-y-1">
                    <h3 className="font-display text-xl font-bold text-zinc-950">
                      Personalisasi Suasana & Sensorik
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Sesuaikan stimulasi akustik, pijatan akupresur, dan tingkat keheningan percakapan selama sesi.
                    </p>
                  </div>

                  {/* ASMR Mode */}
                  <div className="space-y-3">
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                      Mode Audio & ASMR
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { id: 'headphone', label: 'Headphone Studio', desc: 'Audio binaural micro-tingle kedap suara luar' },
                        { id: 'speaker', label: 'Audio Ambien', desc: 'Musik instrumental lembut speaker langit-langit' },
                        { id: 'tanpa', label: 'Tanpa Audio', desc: 'Keheningan ruang tanpa musik latar' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setAsmrMode(item.id as any)}
                          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                            asmrMode === item.id
                              ? 'border-zinc-950 bg-zinc-950 text-white'
                              : 'border-zinc-200 hover:border-zinc-300 text-zinc-800 bg-white'
                          }`}
                        >
                          <div className="font-display text-sm font-bold">{item.label}</div>
                          <div className={`text-xs mt-1 ${asmrMode === item.id ? 'text-zinc-300' : 'text-zinc-500'}`}>
                            {item.desc}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Massage Force */}
                  <div className="space-y-3">
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                      Tekanan Pijat Leher & Pundak
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { id: 'ringan', label: 'Ringan', desc: 'Usapan relaksasi lembut' },
                        { id: 'standar', label: 'Standar', desc: 'Tekanan meridian ideal' },
                        { id: 'kuat', label: 'Kuat', desc: 'Pelemas otot tegang' },
                        { id: 'lewati', label: 'Lewati', desc: 'Fokus pangkas saja' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setMassageForce(item.id as any)}
                          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                            massageForce === item.id
                              ? 'border-zinc-950 bg-zinc-950 text-white'
                              : 'border-zinc-200 hover:border-zinc-300 text-zinc-800 bg-white'
                          }`}
                        >
                          <div className="font-display text-sm font-bold">{item.label}</div>
                          <div className={`text-xs mt-1 ${massageForce === item.id ? 'text-zinc-300' : 'text-zinc-500'}`}>
                            {item.desc}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quiet Chair Toggle */}
                  <div className="p-5 rounded-2xl bg-[#FAF9F6] border border-[#E6E4DF] flex items-center justify-between">
                    <div className="space-y-1 pr-6">
                      <div className="text-sm font-bold text-zinc-950 flex items-center gap-2">
                        <VolumeX className="w-4 h-4 text-zinc-800" />
                        <span>Kursi Hening (Quiet Chair Protocol)</span>
                      </div>
                      <p className="text-xs text-zinc-600 leading-relaxed">
                        Saat diaktifkan, master barber tidak akan memulai percakapan basa-basi santai dan hanya berkomunikasi seputar kebutuhan teknis pangkas dan kenyamanan Anda.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setQuietChair(!quietChair)}
                      className={`w-14 h-7 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                        quietChair ? 'bg-zinc-950' : 'bg-zinc-300'
                      }`}
                      aria-label="Toggle kursi hening"
                    >
                      <span
                        className={`w-6 h-6 rounded-full bg-white absolute top-0.5 transition-transform ${
                          quietChair ? 'right-0.5' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 6: Guest Information */}
              {step === 6 && (
                <form onSubmit={handleConfirm} className="space-y-6">
                  <div className="space-y-1">
                    <h3 className="font-display text-xl font-bold text-zinc-950">
                      Data Tamu & Konfirmasi
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Detail ini digunakan concierge studio untuk konfirmasi slot reservasi terjadwal.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        required
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="e.g. Nicholas Surya"
                        className="w-full px-4 py-3 rounded-2xl border border-zinc-200 text-sm text-zinc-900 focus:outline-none focus:border-zinc-950"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                        Nomor WhatsApp
                      </label>
                      <input
                        type="tel"
                        required
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        placeholder="e.g. 081288990011"
                        className="w-full px-4 py-3 rounded-2xl border border-zinc-200 text-sm text-zinc-900 focus:outline-none focus:border-zinc-950 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                        Catatan Tambahan (Opsional)
                      </label>
                      <textarea
                        rows={3}
                        value={guestNotes}
                        onChange={(e) => setGuestNotes(e.target.value)}
                        placeholder="Preferensi khusus, riwayat alergi kulit kepala, atau kondisi helai rambut..."
                        className="w-full px-4 py-3 rounded-2xl border border-zinc-200 text-sm text-zinc-900 focus:outline-none focus:border-zinc-950"
                      />
                    </div>
                  </div>
                </form>
              )}
            </>
          )}
        </div>

        {/* Footer Navigation */}
        {!isSuccess && (
          <div className="p-6 sm:p-8 border-t border-[#E6E4DF] bg-[#FAF9F6] flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-6 py-2.5 rounded-full border border-zinc-200 hover:bg-white text-zinc-800 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Kembali</span>
              </button>
            ) : <div />}

            {step < 6 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-8 py-3 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Lanjut Langkah Berikutnya</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!guestName || !guestPhone}
                className="px-8 py-3 rounded-full bg-zinc-950 hover:bg-zinc-800 disabled:bg-zinc-300 text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Konfirmasi Reservasi Sesi
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-sm font-mono text-zinc-400">Memuat formulir reservasi...</div>}>
      <BookingWizardContent />
    </Suspense>
  );
}
