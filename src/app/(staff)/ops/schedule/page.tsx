'use client';

import React, { useState, useMemo } from 'react';
import { useBookingStore } from '@/lib/store/booking-store';
import { useStaffAuth } from '@/lib/store/auth-context';
import { BRANCHES_DATA, CAPSTERS_DATA } from '@/lib/mock/data';
import { Booking, BookingStatus, SensoryProfile } from '@/types';
import ServiceLogModal from '@/components/ops/ServiceLogModal';
import {
  Calendar,
  Clock,
  User,
  Scissors,
  VolumeX,
  Volume2,
  Sparkles,
  CheckCircle2,
  Play,
  UserCheck,
  FileText,
  Filter,
  Eye,
  X,
  Droplets,
  Coffee,
} from 'lucide-react';

function getTodayString(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

const DEFAULT_DATE = '2026-09-17';

export default function ScheduleBoardPage() {
  const { user, activeBranchId } = useStaffAuth();
  const { bookings, updateBookingStatus, addSensoryNote, isLoaded } = useBookingStore();

  // Branch & Filter state
  const effectiveBranchId = activeBranchId || user?.branchId || 'senopati';
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    // If today is 2026-09-17 or if any booking matches today, pick today, otherwise default to 2026-09-17
    const today = getTodayString();
    return today === DEFAULT_DATE ? DEFAULT_DATE : today;
  });
  const [selectedCapster, setSelectedCapster] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal States
  const [activeLogBooking, setActiveLogBooking] = useState<Booking | null>(null);
  const [viewingSensoryBooking, setViewingSensoryBooking] = useState<Booking | null>(null);

  // Filtered Capsters for current branch
  const branchCapsters = useMemo(() => {
    return CAPSTERS_DATA.filter((c) => c.branchId === effectiveBranchId);
  }, [effectiveBranchId]);

  // Current Branch Object
  const currentBranch = useMemo(() => {
    return BRANCHES_DATA.find((b) => b.id === effectiveBranchId) || BRANCHES_DATA[0];
  }, [effectiveBranchId]);

  // Filtered Bookings for the board
  const filteredBookings = useMemo(() => {
    return bookings
      .filter((b) => {
        const matchBranch = b.branchId === effectiveBranchId;
        const matchDate = !selectedDate || b.date === selectedDate;
        const matchCapster = selectedCapster === 'all' || b.capsterId === selectedCapster;
        const matchStatus =
          statusFilter === 'all'
            ? true
            : statusFilter === 'ACTIVE'
            ? ['CONFIRMED', 'CHECKED_IN', 'IN_SERVICE'].includes(b.status)
            : b.status === statusFilter;

        return matchBranch && matchDate && matchCapster && matchStatus;
      })
      .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
  }, [bookings, effectiveBranchId, selectedDate, selectedCapster, statusFilter]);

  // Stat Counters for the selected branch & date
  const stats = useMemo(() => {
    const dayBookings = bookings.filter(
      (b) => b.branchId === effectiveBranchId && b.date === selectedDate
    );
    return {
      total: dayBookings.length,
      confirmed: dayBookings.filter((b) => b.status === 'CONFIRMED').length,
      checkedIn: dayBookings.filter((b) => b.status === 'CHECKED_IN').length,
      inService: dayBookings.filter((b) => b.status === 'IN_SERVICE').length,
      completed: dayBookings.filter((b) => b.status === 'COMPLETED').length,
    };
  }, [bookings, effectiveBranchId, selectedDate]);

  const handleStatusChange = (bookingId: string, nextStatus: BookingStatus) => {
    updateBookingStatus(bookingId, nextStatus);
  };

  const handleSaveServiceLog = (
    bookingId: string,
    formulaNotes: string,
    scalpCondition: string,
    additionalSensory: Partial<SensoryProfile>
  ) => {
    addSensoryNote(bookingId, formulaNotes, scalpCondition, additionalSensory);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-zinc-800/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h1 className="text-xl font-display font-semibold text-zinc-100 tracking-tight">
              Papan Jadwal Sesi Janji
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-400 border border-zinc-700/40">
              {currentBranch.name}
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Sistem operasional privat berlandaskan reservasi presisi — 0 antrean dan transisi status satu ketukan.
          </p>
        </div>

        {/* Date Selector Quick-Switcher */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedDate(DEFAULT_DATE)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
              selectedDate === DEFAULT_DATE
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-medium'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Demo 17 Sep 2026
          </button>
          <button
            type="button"
            onClick={() => setSelectedDate(getTodayString())}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
              selectedDate === getTodayString() && selectedDate !== DEFAULT_DATE
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-medium'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Hari Ini ({getTodayString()})
          </button>
          <div className="relative">
            <input
              type="date"
              aria-label="Pilih Tanggal Jadwal"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs bg-zinc-900 border border-zinc-800 text-zinc-300 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-amber-500/50"
            />
          </div>
        </div>
      </div>

      {/* KPI & Pipeline Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#111317] border border-zinc-800/80 p-3.5 rounded-xl">
          <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
            Total Sesi Terjadwal
          </div>
          <div className="text-2xl font-semibold font-mono text-zinc-100 mt-1">
            {stats.total}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Strictly by appointment</div>
        </div>

        <div className="bg-[#111317] border border-amber-500/20 p-3.5 rounded-xl">
          <div className="text-[11px] font-medium text-amber-400 uppercase tracking-wider">
            Tamu Tiba (Check-In)
          </div>
          <div className="text-2xl font-semibold font-mono text-amber-300 mt-1">
            {stats.checkedIn}
          </div>
          <div className="text-[11px] text-amber-500/80 mt-0.5">Siap di Washbed/Chair</div>
        </div>

        <div className="bg-[#111317] border border-emerald-500/20 p-3.5 rounded-xl">
          <div className="text-[11px] font-medium text-emerald-400 uppercase tracking-wider">
            Sedang Dilayani
          </div>
          <div className="text-2xl font-semibold font-mono text-emerald-300 mt-1">
            {stats.inService}
          </div>
          <div className="text-[11px] text-emerald-500/80 mt-0.5">Mode ASMR aktif</div>
        </div>

        <div className="bg-[#111317] border border-zinc-800/80 p-3.5 rounded-xl">
          <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
            Selesai Hari Ini
          </div>
          <div className="text-2xl font-semibold font-mono text-zinc-300 mt-1">
            {stats.completed}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Log sensory tercatat</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#111317] border border-zinc-800/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-zinc-400 font-medium">
            <Filter className="w-3.5 h-3.5 text-zinc-500" />
            <span>Filter Capster:</span>
          </div>
          <select
            value={selectedCapster}
            onChange={(e) => setSelectedCapster(e.target.value)}
            aria-label="Filter Berdasarkan Master Barber / Capster"
            className="bg-[#16191f] border border-zinc-700/80 text-zinc-200 px-3 py-1.5 rounded-lg focus:outline-none focus:border-amber-500/50"
          >
            <option value="all">Semua Master Barber ({branchCapsters.length})</option>
            {branchCapsters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1 bg-zinc-900/90 p-0.5 rounded-lg border border-zinc-800">
            {[
              { id: 'all', label: 'Semua Status' },
              { id: 'ACTIVE', label: 'Antrean Aktif' },
              { id: 'CONFIRMED', label: 'Menunggu' },
              { id: 'IN_SERVICE', label: 'Di Kursi' },
              { id: 'COMPLETED', label: 'Selesai' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  statusFilter === tab.id
                    ? 'bg-zinc-800 text-zinc-100 font-medium'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="text-zinc-400 font-mono">
          Menampilkan <span className="text-zinc-200 font-semibold">{filteredBookings.length}</span> sesi
        </div>
      </div>

      {/* Appointment Board List */}
      {!isLoaded ? (
        <div className="py-16 text-center text-xs font-mono text-zinc-500">
          Memuat jadwal janji...
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="py-20 text-center bg-[#111317] border border-zinc-800/80 rounded-xl space-y-2">
          <Calendar className="w-8 h-8 text-zinc-600 mx-auto" />
          <div className="text-sm font-medium text-zinc-300">
            Tidak Ada Janji Temu Terjadwal
          </div>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Tidak ada reservasi yang sesuai dengan cabang, tanggal, atau filter terpilih.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBookings.map((b) => {
            const isConfirmed = b.status === 'CONFIRMED';
            const isCheckedIn = b.status === 'CHECKED_IN';
            const isInService = b.status === 'IN_SERVICE';
            const isCompleted = b.status === 'COMPLETED';

            return (
              <div
                key={b.id}
                className={`p-4 sm:p-5 rounded-xl border transition-all ${
                  isInService
                    ? 'bg-[#141820] border-emerald-500/40 shadow-lg shadow-emerald-950/20 ring-1 ring-emerald-500/20'
                    : isCheckedIn
                    ? 'bg-[#161614] border-amber-500/30'
                    : isCompleted
                    ? 'bg-[#101215] border-zinc-800/60 opacity-80 hover:opacity-100'
                    : 'bg-[#111317] border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Time & Guest Context */}
                  <div className="flex items-start gap-4">
                    {/* Time Slot Badge */}
                    <div className="flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-[#0d0f12] border border-zinc-800 text-center shrink-0">
                      <Clock className="w-3.5 h-3.5 text-zinc-500 mb-0.5" />
                      <span className="font-mono text-sm font-semibold text-zinc-100">
                        {b.timeSlot}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">WIB</span>
                    </div>

                    {/* Booking Details */}
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm sm:text-base font-semibold text-zinc-100">
                          {b.customerName}
                        </span>
                        <span className="text-xs font-mono text-zinc-500">
                          ({b.customerPhone})
                        </span>
                        {b.bookingNumber && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800/70 text-zinc-400 border border-zinc-700/50">
                            {b.bookingNumber}
                          </span>
                        )}
                      </div>

                      {/* Service & Capster */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400">
                        <div className="flex items-center gap-1.5 text-zinc-300">
                          <Scissors className="w-3.5 h-3.5 text-amber-400/80" />
                          <span className="font-medium">{b.serviceName}</span>
                          <span className="text-zinc-500">
                            · Rp {b.servicePrice.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-400">
                          <User className="w-3.5 h-3.5 text-zinc-500" />
                          <span>Capster: </span>
                          <span className="text-zinc-200 font-medium">
                            {b.capsterName || 'Master Barber'}
                          </span>
                        </div>
                      </div>

                      {/* Sensory Badges & Guest Request */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {/* Conversation Mode Badge */}
                        {b.sensoryProfile?.conversationPreference === 'SILENT' && (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-purple-950/40 text-purple-300 border border-purple-800/40">
                            <VolumeX className="w-3 h-3 text-purple-400" />
                            <span>Silent Chair (ASMR)</span>
                          </span>
                        )}
                        {b.sensoryProfile?.conversationPreference === 'ESSENTIALS_ONLY' && (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                            <Volume2 className="w-3 h-3 text-zinc-400" />
                            <span>Hanya Esensial</span>
                          </span>
                        )}

                        {/* Scent Badge */}
                        {b.sensoryProfile?.scentPreference && (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-800/40">
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            <span>{b.sensoryProfile.scentPreference}</span>
                          </span>
                        )}

                        {/* Beverage Badge */}
                        {b.sensoryProfile?.beveragePreference && (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-300 border border-zinc-700/60">
                            <Coffee className="w-3 h-3 text-zinc-400" />
                            <span>{b.sensoryProfile.beveragePreference}</span>
                          </span>
                        )}

                        {/* Customer Notes */}
                        {b.notes && (
                          <span className="text-[11px] text-zinc-400 italic pl-1">
                            &ldquo;{b.notes}&rdquo;
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Status Pill & Single-Click Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3 self-end lg:self-center shrink-0">
                    {/* Status Pill */}
                    <div>
                      {isConfirmed && (
                        <span className="text-[11px] font-medium tracking-wide uppercase px-2.5 py-1 rounded-full bg-sky-950/50 text-sky-300 border border-sky-800/50">
                          Terkonfirmasi
                        </span>
                      )}
                      {isCheckedIn && (
                        <span className="text-[11px] font-medium tracking-wide uppercase px-2.5 py-1 rounded-full bg-amber-950/50 text-amber-300 border border-amber-800/50">
                          Tamu Tiba
                        </span>
                      )}
                      {isInService && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium tracking-wide uppercase px-2.5 py-1 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-700/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          Sedang Berjalan
                        </span>
                      )}
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium tracking-wide uppercase px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                          <CheckCircle2 className="w-3 h-3 text-zinc-500" />
                          Selesai
                        </span>
                      )}
                    </div>

                    {/* Action Triggers */}
                    {isConfirmed && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(b.id, 'CHECKED_IN')}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-sky-500/15 hover:bg-sky-500/25 text-sky-200 border border-sky-500/40 transition-colors shadow-sm"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-sky-300" />
                        <span>Check-In Tamu</span>
                      </button>
                    )}

                    {isCheckedIn && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(b.id, 'IN_SERVICE')}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-colors shadow-sm"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Mulai Layanan</span>
                      </button>
                    )}

                    {isInService && (
                      <button
                        type="button"
                        onClick={() => setActiveLogBooking(b)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-colors shadow-sm"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Selesai & Catat Sensory</span>
                      </button>
                    )}

                    {isCompleted && (
                      <button
                        type="button"
                        onClick={() => setViewingSensoryBooking(b)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 border border-zinc-700/60 transition-colors"
                      >
                        <Eye className="w-3 h-3 text-zinc-400" />
                        <span>Lihat Dossier Sensory</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Service Completion & Sensory Logger */}
      <ServiceLogModal
        isOpen={Boolean(activeLogBooking)}
        onClose={() => setActiveLogBooking(null)}
        booking={activeLogBooking}
        onSave={handleSaveServiceLog}
      />

      {/* Modal: Read-only Sensory Dossier Inspector for Completed Bookings */}
      {viewingSensoryBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#111317] border border-zinc-800 rounded-xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-zinc-100">
                  Dossier Sensory — {viewingSensoryBooking.customerName}
                </h3>
                <p className="text-xs text-zinc-400 font-mono">
                  {viewingSensoryBooking.serviceName} · {viewingSensoryBooking.date} ({viewingSensoryBooking.timeSlot} WIB)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingSensoryBooking(null)}
                aria-label="Tutup detail sensory"
                className="text-zinc-400 hover:text-zinc-200 p-1 rounded-lg hover:bg-zinc-800/60"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-[#0d0f12] p-3.5 rounded-lg border border-zinc-800/70">
                <div className="flex items-center gap-1.5 text-zinc-400 mb-1 font-medium">
                  <Scissors className="w-3.5 h-3.5 text-amber-400" />
                  <span>Formula Potong & Catatan Master Barber</span>
                </div>
                <div className="text-zinc-200 leading-relaxed font-mono text-[11px] whitespace-pre-wrap">
                  {viewingSensoryBooking.sensoryProfile?.notes ||
                    viewingSensoryBooking.notes ||
                    'Tidak ada catatan formula khusus.'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#0d0f12] p-3 rounded-lg border border-zinc-800/70">
                  <div className="flex items-center gap-1 text-zinc-400 mb-1">
                    <Droplets className="w-3 h-3 text-zinc-500" />
                    <span>Kondisi Kulit Kepala</span>
                  </div>
                  <div className="text-zinc-200 font-medium">
                    {viewingSensoryBooking.sensoryProfile?.scalpCondition || 'Normal'}
                  </div>
                </div>

                <div className="bg-[#0d0f12] p-3 rounded-lg border border-zinc-800/70">
                  <div className="flex items-center gap-1 text-zinc-400 mb-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Aroma Atsiri</span>
                  </div>
                  <div className="text-zinc-200 font-medium">
                    {viewingSensoryBooking.sensoryProfile?.scentPreference || 'Sandalwood & Bergamot'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#0d0f12] p-3 rounded-lg border border-zinc-800/70">
                  <div className="flex items-center gap-1 text-zinc-400 mb-1">
                    <Coffee className="w-3 h-3 text-zinc-500" />
                    <span>Minuman Disajikan</span>
                  </div>
                  <div className="text-zinc-200 font-medium">
                    {viewingSensoryBooking.sensoryProfile?.beveragePreference || 'Artisan Cold Brew'}
                  </div>
                </div>

                <div className="bg-[#0d0f12] p-3 rounded-lg border border-zinc-800/70">
                  <div className="flex items-center gap-1 text-zinc-400 mb-1">
                    <Volume2 className="w-3 h-3 text-zinc-500" />
                    <span>Interaksi Kursi</span>
                  </div>
                  <div className="text-zinc-200 font-medium">
                    {viewingSensoryBooking.sensoryProfile?.conversationPreference || 'SILENT'}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingSensoryBooking(null)}
                className="px-4 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
