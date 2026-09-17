'use client';

import React, { useState, useMemo } from 'react';
import { BRANCHES_DATA, CAPSTERS_DATA } from '@/lib/mock/data';
import { useStaffAuth } from '@/lib/store/auth-context';
import {
  Building2,
  MapPin,
  Clock,
  Phone,
  Armchair,
  Star,
  Users,
  Search,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

const BRANCH_CHAIR_CAPACITY: Record<string, number> = {
  senopati: 6,
  pik: 8,
  menteng: 5,
  bsd: 6,
  kelapagading: 6,
  bekasi: 5,
};

export default function HqBranchesPage() {
  const { role, activeBranchId, setActiveBranchId } = useStaffAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('ALL');

  const isExecutive = role === 'EXECUTIVE';

  // Distinct areas for filter
  const areas = useMemo(() => {
    const list = Array.from(new Set(BRANCHES_DATA.map((b) => b.area)));
    return ['ALL', ...list];
  }, []);

  // Filtered branches
  const filteredBranches = useMemo(() => {
    return BRANCHES_DATA.filter((b) => {
      const matchArea = selectedArea === 'ALL' || b.area === selectedArea;
      const matchQuery =
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.area.toLowerCase().includes(searchQuery.toLowerCase());
      return matchArea && matchQuery;
    });
  }, [searchQuery, selectedArea]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-amber-400 mb-1">
            <span>Direktori Jaringan Studio</span>
            <span>·</span>
            <span>Jabodetabek Network</span>
          </div>
          <h1 className="text-2xl font-display font-semibold text-zinc-100 tracking-tight">
            Direktori Cabang & Roster Tim
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Master data 6 cabang salon di Jabodetabek, kapasitas kursi hidrolik, dan penempatan tim stylist master.
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-3">
          <div className="bg-[#121620] border border-zinc-800 px-3.5 py-2 rounded-lg text-xs flex items-center gap-2 text-zinc-300">
            <Building2 className="w-4 h-4 text-amber-400" />
            <span>6 Cabang Aktif</span>
          </div>
          <div className="bg-[#121620] border border-zinc-800 px-3.5 py-2 rounded-lg text-xs flex items-center gap-2 text-zinc-300">
            <Users className="w-4 h-4 text-blue-400" />
            <span>{CAPSTERS_DATA.length} Capster Master</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0e1117] border border-zinc-800 p-3.5 rounded-xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama cabang, alamat, atau wilayah..."
            className="w-full bg-[#161a23] border border-zinc-700/80 rounded-lg pl-9 pr-4 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/70"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {areas.map((area) => (
            <button
              key={area}
              type="button"
              onClick={() => setSelectedArea(area)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedArea === area
                  ? 'bg-amber-500 text-zinc-950 font-semibold'
                  : 'bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              {area === 'ALL' ? 'Semua Wilayah' : area}
            </button>
          ))}
        </div>
      </div>

      {/* Branches Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredBranches.map((branch) => {
          const capsters = CAPSTERS_DATA.filter((c) => c.branchId === branch.id);
          const chairCount = BRANCH_CHAIR_CAPACITY[branch.id] || 6;
          const isCurrentActive = activeBranchId === branch.id;

          return (
            <div
              key={branch.id}
              className={`bg-[#0e1117] border rounded-xl overflow-hidden shadow-sm transition-all ${
                isCurrentActive
                  ? 'border-amber-500/60 ring-1 ring-amber-500/30'
                  : 'border-zinc-800/90 hover:border-zinc-700'
              }`}
            >
              {/* Branch Header */}
              <div className="p-5 border-b border-zinc-800/80 bg-[#121620]/60">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono uppercase text-amber-400 font-semibold">
                        {branch.area}
                      </span>
                      {isCurrentActive && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          Aktif Dipilih
                        </span>
                      )}
                    </div>
                    <h2 className="text-base font-semibold text-zinc-100 mt-1">{branch.name}</h2>
                  </div>

                  {isExecutive && (
                    <button
                      type="button"
                      onClick={() => setActiveBranchId(branch.id)}
                      className="px-2.5 py-1 text-xs rounded bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 text-zinc-300 transition-colors font-medium"
                    >
                      Pilih Lingkup
                    </button>
                  )}
                </div>

                <div className="mt-3 flex flex-col gap-1.5 text-xs text-zinc-400">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                    <span className="leading-snug">{branch.address}</span>
                  </div>
                  <div className="flex items-center gap-4 text-zinc-400 mt-1">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{branch.hours}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{branch.phone}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Branch Quick Stats & Features */}
              <div className="p-5 border-b border-zinc-800/80 grid grid-cols-2 gap-4 bg-zinc-900/20 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-zinc-800 text-amber-400">
                    <Armchair className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Kapasitas Kursi</span>
                    <span className="font-semibold text-zinc-200">{chairCount} Kursi Studio</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-zinc-800 text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Sisa Slot Hari Ini</span>
                    <span className="font-semibold text-zinc-200">{branch.slotsLeftToday} Slot Terbuka</span>
                  </div>
                </div>
              </div>

              {/* Sensory Features Badges */}
              <div className="px-5 py-3 border-b border-zinc-800/80 bg-zinc-900/10 flex flex-wrap gap-1.5">
                {branch.features.map((feat, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded bg-zinc-800/70 text-zinc-400 border border-zinc-700/50"
                  >
                    {feat}
                  </span>
                ))}
              </div>

              {/* Capster Team Roster */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Stylist & Capster Roster ({capsters.length})</span>
                  </span>
                </div>

                <div className="space-y-3">
                  {capsters.map((capster) => (
                    <div
                      key={capster.id}
                      className="p-3 rounded-lg bg-[#141822] border border-zinc-800/80 flex items-start gap-3 text-xs"
                    >
                      <div className="w-9 h-9 rounded-full bg-zinc-800 overflow-hidden shrink-0 border border-zinc-700 flex items-center justify-center text-xs font-semibold text-amber-300">
                        {capster.name.charAt(0)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-semibold text-zinc-200 truncate">{capster.name}</h4>
                          <div className="flex items-center gap-1 text-amber-400 text-[11px] shrink-0 font-mono">
                            <Star className="w-3 h-3 fill-current" />
                            <span>{capster.rating.toFixed(1)}</span>
                          </div>
                        </div>

                        <p className="text-[11px] text-zinc-400 mt-0.5">{capster.role}</p>
                        <p className="text-[10px] text-zinc-500">{capster.experience}</p>

                        {/* Specialties */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {capster.specialties.map((spec, sIdx) => (
                            <span
                              key={sIdx}
                              className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
