'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useBookingStore } from '@/lib/store/booking-store';
import { useStaffAuth } from '@/lib/store/auth-context';
import { BRANCHES_DATA, CAPSTERS_DATA, SERVICES_DATA } from '@/lib/mock/data';
import { Booking, SensoryProfile } from '@/types';
import {
  PhoneCall,
  Calendar,
  Clock,
  User,
  Scissors,
  Sparkles,
  CalendarClock,
  Search,
  CheckCircle,
  X,
  ShieldCheck,
  Coffee,
  Volume2,
} from 'lucide-react';

const TIME_SLOTS = [
  '09:00',
  '10:15',
  '11:30',
  '13:00',
  '14:15',
  '15:30',
  '17:00',
  '18:15',
  '19:30',
  '20:45',
];

function ConciergeContent() {
  const searchParams = useSearchParams();
  const queryGuest = searchParams.get('guest') || '';
  const queryPhone = searchParams.get('phone') || '';

  const { user, activeBranchId } = useStaffAuth();
  const { bookings, createConciergeBooking, rescheduleBooking, isLoaded } = useBookingStore();

  const effectiveBranchId = activeBranchId || user?.branchId || 'senopati';

  // State for Concierge Quick Booking Form
  const [guestName, setGuestName] = useState(queryGuest);
  const [guestPhone, setGuestPhone] = useState(queryPhone);
  const [guestEmail, setGuestEmail] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState(effectiveBranchId);
  const [selectedServiceId, setSelectedServiceId] = useState(SERVICES_DATA[0].id);
  const [selectedCapsterId, setSelectedCapsterId] = useState('');
  const [bookDate, setBookDate] = useState('2026-09-18');
  const [bookTime, setBookTime] = useState('14:15');
  const [scentPref, setScentPref] = useState('Sandalwood & Bergamot');
  const [bevPref, setBevPref] = useState('Artisan Cold Brew');
  const [convoPref, setConvoPref] = useState<'SILENT' | 'ESSENTIALS_ONLY' | 'LIGHT_CONVERSATION'>(
    'SILENT'
  );
  const [specialNotes, setSpecialNotes] = useState('');
  const [creationSuccessMessage, setCreationSuccessMessage] = useState<string | null>(null);

  // Pre-fill when query parameters change
  useEffect(() => {
    if (queryGuest) setGuestName(queryGuest);
    if (queryPhone) setGuestPhone(queryPhone);
  }, [queryGuest, queryPhone]);

  // Search & Filter for Upcoming List
  const [searchQuery, setSearchQuery] = useState('');

  // Reschedule Modal State
  const [rescheduleTarget, setRescheduleTarget] = useState<Booking | null>(null);
  const [newRescheduleDate, setNewRescheduleDate] = useState('2026-09-19');
  const [newRescheduleTime, setNewRescheduleTime] = useState('15:30');
  const [rescheduleSuccessMessage, setRescheduleSuccessMessage] = useState<string | null>(null);

  // Available Capsters for selected branch in form
  const formCapsters = useMemo(() => {
    return CAPSTERS_DATA.filter((c) => c.branchId === selectedBranchId);
  }, [selectedBranchId]);

  // Set default capster when formCapsters changes
  React.useEffect(() => {
    if (formCapsters.length > 0 && (!selectedCapsterId || !formCapsters.some(c => c.id === selectedCapsterId))) {
      setSelectedCapsterId(formCapsters[0].id);
    }
  }, [formCapsters, selectedCapsterId]);

  // Upcoming Active Bookings
  const upcomingBookings = useMemo(() => {
    return bookings
      .filter((b) => {
        const isUpcoming = b.status === 'CONFIRMED' || b.status === 'CHECKED_IN';
        const matchSearch =
          !searchQuery ||
          b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.customerPhone.includes(searchQuery) ||
          (b.bookingNumber && b.bookingNumber.toLowerCase().includes(searchQuery.toLowerCase()));
        return isUpcoming && matchSearch;
      })
      .sort((a, b) => `${a.date} ${a.timeSlot}`.localeCompare(`${b.date} ${b.timeSlot}`));
  }, [bookings, searchQuery]);

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const service = SERVICES_DATA.find((s) => s.id === selectedServiceId) || SERVICES_DATA[0];
    const branch = BRANCHES_DATA.find((b) => b.id === selectedBranchId) || BRANCHES_DATA[0];
    const capster = CAPSTERS_DATA.find((c) => c.id === selectedCapsterId) || formCapsters[0];

    const sensory: SensoryProfile = {
      scentPreference: scentPref,
      beveragePreference: bevPref,
      conversationPreference: convoPref,
    };

    const newBooking = createConciergeBooking({
      customerName: guestName,
      customerPhone: guestPhone,
      customerEmail: guestEmail || undefined,
      branchId: branch.id,
      branchName: branch.name,
      capsterId: capster?.id || 'st-01',
      capsterName: capster?.name || 'Master Barber',
      serviceId: service.id,
      serviceName: service.title,
      servicePrice: service.price,
      date: bookDate,
      timeSlot: bookTime,
      sensoryProfile: sensory,
      notes: specialNotes || undefined,
    });

    setCreationSuccessMessage(
      `Reservasi berhasil dibuat untuk ${newBooking.customerName} (${newBooking.bookingNumber}) pada ${newBooking.date} jam ${newBooking.timeSlot} WIB.`
    );

    // Reset some form inputs
    setGuestName('');
    setGuestPhone('');
    setGuestEmail('');
    setSpecialNotes('');

    setTimeout(() => {
      setCreationSuccessMessage(null);
    }, 6000);
  };

  const openRescheduleModal = (booking: Booking) => {
    setRescheduleTarget(booking);
    setNewRescheduleDate(booking.date);
    setNewRescheduleTime(booking.timeSlot);
  };

  const handleConfirmReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleTarget) return;

    rescheduleBooking(rescheduleTarget.id, newRescheduleDate, newRescheduleTime);
    setRescheduleSuccessMessage(
      `Jadwal untuk ${rescheduleTarget.customerName} berhasil diubah ke ${newRescheduleDate} jam ${newRescheduleTime} WIB.`
    );
    setRescheduleTarget(null);

    setTimeout(() => {
      setRescheduleSuccessMessage(null);
    }, 5000);
  };

  return (
    <div className="space-y-8">
      {/* Page Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-zinc-800/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <PhoneCall className="w-4 h-4 text-amber-400" />
            <h1 className="text-xl font-display font-semibold text-zinc-100 tracking-tight">
              VIP Concierge & Penjadwalan Cepat
            </h1>
          </div>
          <p className="text-xs text-zinc-400">
            Fasilitas resepsionis & concierge untuk reservasi tamu prioritas, telepon masuk, dan reschedule tanpa hambatan.
          </p>
        </div>
      </div>

      {/* Success Alerts */}
      {creationSuccessMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{creationSuccessMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setCreationSuccessMessage(null)}
            className="text-emerald-400 hover:text-emerald-200 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {rescheduleSuccessMessage && (
        <div className="p-3.5 rounded-xl bg-amber-950/50 border border-amber-500/40 text-amber-300 text-xs flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{rescheduleSuccessMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setRescheduleSuccessMessage(null)}
            className="text-amber-400 hover:text-amber-200 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Two Column Layout: Quick Booking Form (Left) & Upcoming Bookings Management (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Minimalist VIP Booking Form */}
        <div className="lg:col-span-5 bg-[#111317] border border-zinc-800/80 rounded-xl p-5 sm:p-6 space-y-5">
          <div className="border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2 text-zinc-100 font-semibold text-sm">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Input Reservasi Baru (VIP / Telepon)</span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Langsung terkonfirmasi ke papan operasional tanpa proses checkout publik.
            </p>
          </div>

          <form onSubmit={handleCreateBooking} className="space-y-4 text-xs">
            {/* Guest Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">
                  Nama Tamu VIP <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Contoh: Raditya Maulana"
                  className="w-full px-3 py-2 rounded-lg bg-[#0d0f12] border border-zinc-700/80 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500/60"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">
                  Nomor Telepon / WhatsApp <span className="text-amber-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="0812xxxxxxxx"
                  className="w-full px-3 py-2 rounded-lg bg-[#0d0f12] border border-zinc-700/80 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500/60"
                />
              </div>
            </div>

            {/* Email (Optional) */}
            <div>
              <label className="block text-zinc-300 font-medium mb-1">Email (Opsional)</label>
              <input
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="nama@perusahaan.com"
                className="w-full px-3 py-2 rounded-lg bg-[#0d0f12] border border-zinc-700/80 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500/60"
              />
            </div>

            {/* Branch & Service Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Cabang Sanctuary</label>
                <select
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0d0f12] border border-zinc-700/80 text-zinc-200 focus:outline-none focus:border-amber-500/60"
                >
                  {BRANCHES_DATA.map((b) => (
                    <option key={b.id} value={b.id} className="bg-[#121418]">
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Pilihan Layanan</label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0d0f12] border border-zinc-700/80 text-zinc-200 focus:outline-none focus:border-amber-500/60"
                >
                  {SERVICES_DATA.map((s) => (
                    <option key={s.id} value={s.id} className="bg-[#121418]">
                      {s.title} (Rp {s.price.toLocaleString('id-ID')})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Capster & Date/Time */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Master Barber</label>
                <select
                  value={selectedCapsterId}
                  onChange={(e) => setSelectedCapsterId(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-lg bg-[#0d0f12] border border-zinc-700/80 text-zinc-200 focus:outline-none focus:border-amber-500/60"
                >
                  {formCapsters.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#121418]">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Tanggal</label>
                <input
                  type="date"
                  required
                  value={bookDate}
                  onChange={(e) => setBookDate(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-lg bg-[#0d0f12] border border-zinc-700/80 text-zinc-200 focus:outline-none focus:border-amber-500/60"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Slot Waktu</label>
                <select
                  value={bookTime}
                  onChange={(e) => setBookTime(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-lg bg-[#0d0f12] border border-zinc-700/80 text-zinc-200 focus:outline-none focus:border-amber-500/60"
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot} className="bg-[#121418]">
                      {slot} WIB
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sensory Sanctuary Preferences */}
            <div className="pt-2 border-t border-zinc-800 space-y-3">
              <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                Preferensi Sensorik Privat
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 text-[11px] mb-1">Aroma Atsiri</label>
                  <select
                    value={scentPref}
                    onChange={(e) => setScentPref(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#0d0f12] border border-zinc-700/80 text-zinc-200 focus:outline-none"
                  >
                    <option value="Sandalwood & Bergamot">Sandalwood & Bergamot</option>
                    <option value="Hinoki & Cedarwood">Hinoki & Cedarwood</option>
                    <option value="Japanese Yuzu & Peppermint">Japanese Yuzu & Peppermint</option>
                    <option value="Silver Birch & Cold Cedar">Silver Birch & Cold Cedar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 text-[11px] mb-1">Minuman</label>
                  <select
                    value={bevPref}
                    onChange={(e) => setBevPref(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#0d0f12] border border-zinc-700/80 text-zinc-200 focus:outline-none"
                  >
                    <option value="Artisan Cold Brew">Artisan Cold Brew</option>
                    <option value="Warm Herbal Tea">Warm Herbal Tea</option>
                    <option value="Mineral Water">Mineral Water</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 text-[11px] mb-1">Mode Interaksi Tamu</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'SILENT', label: 'Hening (ASMR)' },
                    { id: 'ESSENTIALS_ONLY', label: 'Esensial' },
                    { id: 'LIGHT_CONVERSATION', label: 'Santai' },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() =>
                        setConvoPref(
                          mode.id as 'SILENT' | 'ESSENTIALS_ONLY' | 'LIGHT_CONVERSATION'
                        )
                      }
                      className={`py-1 px-2 rounded-lg border text-center transition-all ${
                        convoPref === mode.id
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-medium'
                          : 'bg-[#0d0f12] border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Special Instructions */}
            <div>
              <label className="block text-zinc-300 font-medium mb-1">Catatan Tambahan Tamu</label>
              <input
                type="text"
                value={specialNotes}
                onChange={(e) => setSpecialNotes(e.target.value)}
                placeholder="Misal: Tamu meminta kompres ekstra dingin, parkir valet"
                className="w-full px-3 py-2 rounded-lg bg-[#0d0f12] border border-zinc-700/80 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500/60"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Buat Reservasi VIP Concierge</span>
            </button>
          </form>
        </div>

        {/* Right Column: Upcoming Bookings & Quick Reschedule */}
        <div className="lg:col-span-7 bg-[#111317] border border-zinc-800/80 rounded-xl p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
            <div>
              <div className="flex items-center gap-2 text-zinc-100 font-semibold text-sm">
                <CalendarClock className="w-4 h-4 text-amber-400" />
                <span>Reservasi Mendatang & Reschedule Cepat</span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Kelola atau alihkan slot janji tamu yang meminta perubahan tanggal tanpa repot.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari tamu / nomor HP..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#0d0f12] border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          {/* Bookings List */}
          {!isLoaded ? (
            <div className="py-12 text-center text-xs font-mono text-zinc-500">
              Memuat data concierge...
            </div>
          ) : upcomingBookings.length === 0 ? (
            <div className="py-16 text-center text-xs text-zinc-500">
              Tidak ada reservasi mendatang yang cocok dengan pencarian.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {upcomingBookings.map((b) => (
                <div
                  key={b.id}
                  className="p-3.5 rounded-xl bg-[#0d0f12] border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-100 text-sm">
                        {b.customerName}
                      </span>
                      <span className="font-mono text-zinc-500 text-[11px]">
                        {b.customerPhone}
                      </span>
                      <span className="font-mono text-[10px] px-2 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                        {b.bookingNumber}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-zinc-400 text-[11px]">
                      <span className="text-amber-300/90 font-medium">{b.serviceName}</span>
                      <span>·</span>
                      <span>{b.capsterName || 'Master Barber'}</span>
                      <span>·</span>
                      <span className="text-zinc-500">{b.branchName}</span>
                    </div>

                    <div className="flex items-center gap-2 pt-0.5 text-zinc-400 font-mono text-[11px]">
                      <Calendar className="w-3 h-3 text-zinc-500" />
                      <span>{b.date}</span>
                      <Clock className="w-3 h-3 text-zinc-500 ml-1" />
                      <span className="text-amber-400 font-semibold">{b.timeSlot} WIB</span>
                    </div>
                  </div>

                  {/* Reschedule Trigger */}
                  <div className="shrink-0">
                    <button
                      type="button"
                      onClick={() => openRescheduleModal(b)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 transition-colors font-medium text-xs"
                    >
                      <CalendarClock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Reschedule Jadwal</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reschedule Confirmation Modal */}
      {rescheduleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#111317] border border-zinc-800 rounded-xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-zinc-100">
                  Reschedule Sesi Janji
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRescheduleTarget(null)}
                aria-label="Tutup modal"
                className="text-zinc-400 hover:text-zinc-200 p-1 rounded-lg hover:bg-zinc-800/60"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-zinc-400 bg-[#0d0f12] p-3 rounded-lg border border-zinc-800 space-y-1">
              <div>
                <span className="text-zinc-500">Tamu: </span>
                <span className="text-zinc-200 font-semibold">
                  {rescheduleTarget.customerName}
                </span>
              </div>
              <div>
                <span className="text-zinc-500">Layanan: </span>
                <span className="text-zinc-300">{rescheduleTarget.serviceName}</span>
              </div>
              <div>
                <span className="text-zinc-500">Jadwal Lama: </span>
                <span className="font-mono text-zinc-300">
                  {rescheduleTarget.date} jam {rescheduleTarget.timeSlot} WIB
                </span>
              </div>
            </div>

            <form onSubmit={handleConfirmReschedule} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">
                  Pilih Tanggal Baru
                </label>
                <input
                  type="date"
                  required
                  value={newRescheduleDate}
                  onChange={(e) => setNewRescheduleDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0d0f12] border border-zinc-700/80 text-zinc-200 focus:outline-none focus:border-amber-500/60"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">
                  Pilih Slot Waktu Baru
                </label>
                <select
                  value={newRescheduleTime}
                  onChange={(e) => setNewRescheduleTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0d0f12] border border-zinc-700/80 text-zinc-200 focus:outline-none focus:border-amber-500/60"
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot} className="bg-[#121418]">
                      {slot} WIB
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setRescheduleTarget(null)}
                  className="px-3.5 py-2 text-zinc-400 hover:text-zinc-200 bg-zinc-800/60 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold rounded-lg shadow-sm transition-colors"
                >
                  Konfirmasi Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ConciergePage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center text-xs font-mono text-zinc-500">
          Memuat formulir VIP concierge...
        </div>
      }
    >
      <ConciergeContent />
    </Suspense>
  );
}
