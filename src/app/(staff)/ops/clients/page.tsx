'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useBookingStore } from '@/lib/store/booking-store';
import { Booking, SensoryProfile } from '@/types';
import {
  Users,
  Search,
  Scissors,
  Droplets,
  Sparkles,
  Calendar,
  Clock,
  Coffee,
  VolumeX,
  Volume2,
  ChevronRight,
  PhoneCall,
  History,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

interface ClientAggregated {
  key: string;
  name: string;
  phone: string;
  email?: string;
  totalVisits: number;
  lastVisitDate?: string;
  preferredCapster?: string;
  preferredBranch?: string;
  latestSensory?: SensoryProfile;
  bookings: Booking[];
}

export default function ClientsDossierPage() {
  const { bookings, isLoaded } = useBookingStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClientKey, setSelectedClientKey] = useState<string | null>(null);

  // Aggregate clients from all bookings in the system
  const clientsList = useMemo(() => {
    const map = new Map<string, ClientAggregated>();

    bookings.forEach((b) => {
      // Normalize key by phone number or name
      const key = b.customerPhone.replace(/\D/g, '') || b.customerName.toLowerCase().trim();

      if (!map.has(key)) {
        map.set(key, {
          key,
          name: b.customerName,
          phone: b.customerPhone,
          email: b.customerEmail,
          totalVisits: b.status === 'COMPLETED' ? 1 : 0,
          lastVisitDate: b.status === 'COMPLETED' ? b.date : undefined,
          bookings: [b],
        });
      } else {
        const existing = map.get(key)!;
        existing.bookings.push(b);
        if (b.status === 'COMPLETED') {
          existing.totalVisits += 1;
          if (!existing.lastVisitDate || b.date > existing.lastVisitDate) {
            existing.lastVisitDate = b.date;
          }
        }
        if (!existing.email && b.customerEmail) {
          existing.email = b.customerEmail;
        }
      }
    });

    // Compute preferred capsters, branches, and latest sensory
    return Array.from(map.values()).map((client) => {
      // Sort client bookings descending by date
      client.bookings.sort((a, b) => `${b.date} ${b.timeSlot}`.localeCompare(`${a.date} ${a.timeSlot}`));

      // Preferred Capster count
      const capsterCounts = new Map<string, number>();
      client.bookings.forEach((b) => {
        if (b.capsterName) {
          capsterCounts.set(b.capsterName, (capsterCounts.get(b.capsterName) || 0) + 1);
        }
      });
      let topCapster = '';
      let maxCount = 0;
      capsterCounts.forEach((count, capster) => {
        if (count > maxCount) {
          maxCount = count;
          topCapster = capster;
        }
      });
      client.preferredCapster = topCapster || 'Master Barber';

      // Latest sensory profile with notes
      const completedWithSensory = client.bookings.find(
        (b) => b.sensoryProfile && (b.sensoryProfile.notes || b.sensoryProfile.scentPreference)
      );
      client.latestSensory = completedWithSensory?.sensoryProfile || client.bookings[0]?.sensoryProfile;

      return client;
    });
  }, [bookings]);

  // Filtered by search query
  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clientsList;
    const q = searchQuery.toLowerCase().trim();
    return clientsList.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.email && c.email.toLowerCase().includes(q))
    );
  }, [clientsList, searchQuery]);

  // Default select first client if none selected
  React.useEffect(() => {
    if (!selectedClientKey && filteredClients.length > 0) {
      setSelectedClientKey(filteredClients[0].key);
    }
  }, [filteredClients, selectedClientKey]);

  const activeClient = useMemo(() => {
    return filteredClients.find((c) => c.key === selectedClientKey) || filteredClients[0] || null;
  }, [filteredClients, selectedClientKey]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-800/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-amber-400" />
            <h1 className="text-xl font-display font-semibold text-zinc-100 tracking-tight">
              Direktori Pelanggan & Sensory Dossier
            </h1>
          </div>
          <p className="text-xs text-zinc-400">
            Arsip profil sensorik, rekam jejak formula pemotongan clipper, dan riwayat kunjungan tamu privat.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama atau nomor telepon..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#111317] border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>
      </div>

      {!isLoaded ? (
        <div className="py-16 text-center text-xs font-mono text-zinc-500">
          Memuat berkas profil pelanggan...
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="py-20 text-center bg-[#111317] border border-zinc-800 rounded-xl space-y-2">
          <Users className="w-8 h-8 text-zinc-600 mx-auto" />
          <div className="text-sm font-medium text-zinc-300">
            Tidak Ada Klien Ditemukan
          </div>
          <p className="text-xs text-zinc-500">
            Coba sesuaikan kata kunci pencarian nama atau nomor telepon.
          </p>
        </div>
      ) : (
        /* Two-column Master-Detail Dossier Interface */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Client Roster */}
          <div className="lg:col-span-5 bg-[#111317] border border-zinc-800/80 rounded-xl overflow-hidden divide-y divide-zinc-800/60 max-h-[750px] overflow-y-auto">
            <div className="px-4 py-3 bg-[#14171d] text-xs font-medium text-zinc-400 flex items-center justify-between">
              <span>Daftar Klien Terdaftar ({filteredClients.length})</span>
              <span className="text-[11px] font-mono text-zinc-500">Urut Kunjungan</span>
            </div>

            {filteredClients.map((client) => {
              const isSelected = client.key === activeClient?.key;
              return (
                <button
                  key={client.key}
                  type="button"
                  onClick={() => setSelectedClientKey(client.key)}
                  className={`w-full text-left p-4 transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-amber-500/10 border-l-2 border-amber-400'
                      : 'hover:bg-zinc-800/40'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-100 text-sm">
                        {client.name}
                      </span>
                      {client.totalVisits >= 2 && (
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40">
                          Returning VIP
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-zinc-400 font-mono">
                      {client.phone}
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-zinc-500 pt-0.5">
                      <span>{client.totalVisits} Sesi Selesai</span>
                      <span>·</span>
                      <span>Barber: {client.preferredCapster}</span>
                    </div>
                  </div>

                  <ChevronRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isSelected ? 'text-amber-400 translate-x-0.5' : 'text-zinc-600'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Right Column: Selected Client's Deep Dossier */}
          {activeClient && (
            <div className="lg:col-span-7 bg-[#111317] border border-zinc-800/80 rounded-xl p-6 space-y-6">
              {/* Dossier Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-700/10 border border-amber-500/30 flex items-center justify-center text-amber-300 font-display font-semibold text-base">
                      {activeClient.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-zinc-100">
                        {activeClient.name}
                      </h2>
                      <p className="text-xs text-zinc-400 font-mono">
                        {activeClient.phone} {activeClient.email && `· ${activeClient.email}`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Concierge Action Link */}
                <Link
                  href={`/ops/concierge?guest=${encodeURIComponent(
                    activeClient.name
                  )}&phone=${encodeURIComponent(activeClient.phone)}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-colors shadow-sm self-start sm:self-center"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Reservasi Concierge Tamu Ini</span>
                </Link>
              </div>

              {/* Sensory & Grooming Blueprint Cards */}
              <div className="space-y-3">
                <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Blueprint Sensorik & Catatan Pemotongan Terakhir</span>
                </div>

                {/* Haircut Formula & Notes */}
                <div className="bg-[#0d0f12] p-4 rounded-xl border border-zinc-800/80 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-amber-300/90 font-medium">
                    <Scissors className="w-3.5 h-3.5 text-amber-400" />
                    <span>Formula Potong Rambut & Teknik Clipper</span>
                  </div>
                  <p className="text-xs text-zinc-200 leading-relaxed font-mono">
                    {activeClient.latestSensory?.notes ||
                      'Belum ada catatan formula khusus. Klik "Selesai & Catat Sensory" pada saat layanan selesai.'}
                  </p>
                </div>

                {/* Grid Preferences */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Scalp Condition */}
                  <div className="bg-[#0d0f12] p-3.5 rounded-xl border border-zinc-800/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                      <Droplets className="w-3 h-3 text-zinc-500" />
                      <span>Kondisi Kulit Kepala</span>
                    </div>
                    <div className="text-xs font-semibold text-zinc-200">
                      {activeClient.latestSensory?.scalpCondition || 'Normal Sehat'}
                    </div>
                  </div>

                  {/* Scent & Aroma */}
                  <div className="bg-[#0d0f12] p-3.5 rounded-xl border border-zinc-800/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>Aroma Atsiri Favorit</span>
                    </div>
                    <div className="text-xs font-semibold text-zinc-200">
                      {activeClient.latestSensory?.scentPreference || 'Sandalwood & Bergamot'}
                    </div>
                  </div>

                  {/* Beverage & Mode */}
                  <div className="bg-[#0d0f12] p-3.5 rounded-xl border border-zinc-800/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                      <Coffee className="w-3 h-3 text-zinc-500" />
                      <span>Minuman & Interaksi</span>
                    </div>
                    <div className="text-xs font-semibold text-zinc-200">
                      {activeClient.latestSensory?.beveragePreference || 'Artisan Cold Brew'} ·{' '}
                      {activeClient.latestSensory?.conversationPreference === 'SILENT'
                        ? 'Hening (ASMR)'
                        : 'Esensial'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Historical Visits Timeline */}
              <div className="space-y-3 pt-2">
                <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Riwayat Kunjungan ({activeClient.bookings.length} Reservasi)</span>
                </div>

                <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                  {activeClient.bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="p-3.5 rounded-lg bg-[#0d0f12] border border-zinc-800/70 text-xs space-y-1.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-zinc-200">
                            {booking.serviceName}
                          </span>
                          <span className="text-zinc-500">·</span>
                          <span className="text-zinc-400">
                            Rp {booking.servicePrice.toLocaleString('id-ID')}
                          </span>
                        </div>

                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                            booking.status === 'COMPLETED'
                              ? 'bg-zinc-800 text-zinc-400'
                              : booking.status === 'IN_SERVICE'
                              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/50'
                              : 'bg-amber-950/60 text-amber-300 border border-amber-800/50'
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-500 font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {booking.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {booking.timeSlot} WIB
                        </span>
                        <span>· Barber: {booking.capsterName || 'Master Barber'}</span>
                        <span>· {booking.branchName}</span>
                      </div>

                      {booking.sensoryProfile?.notes && (
                        <div className="text-[11px] text-zinc-400 bg-zinc-900/60 p-2 rounded border border-zinc-800/40">
                          <span className="text-zinc-500 font-medium">Log Sesi: </span>
                          {booking.sensoryProfile.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
