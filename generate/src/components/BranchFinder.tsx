import React, { useState, useMemo } from 'react';
import { Search, ExternalLink, MapPin, X } from 'lucide-react';
import { BRANCHES_DATA } from '../data/branches';
import { Branch } from '../types';

interface BranchFinderProps {
  onSelectBranch: (branch: Branch) => void;
}

export const BranchFinder: React.FC<BranchFinderProps> = ({ onSelectBranch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('Semua');

  const areas = ['Semua', 'Jakarta Selatan', 'Jakarta Utara', 'Jakarta Pusat', 'Tangerang Selatan', 'Bekasi'];

  const filteredBranches = useMemo(() => {
    return BRANCHES_DATA.filter((b) => {
      const matchSearch =
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.area.toLowerCase().includes(searchQuery.toLowerCase());

      const matchArea = selectedArea === 'Semua' || b.area === selectedArea;
      return matchSearch && matchArea;
    });
  }, [searchQuery, selectedArea]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedArea('Semua');
  };

  return (
    <section id="branches" className="py-24 md:py-32 xl:py-36 bg-[#0E0E11] text-white border-b border-[#22222A]">
      <div className="max-w-7xl 2xl:max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 space-y-12 lg:space-y-16">
        
        {/* Header */}
        <div className="pb-10 border-b border-[#22222A] flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="text-xs font-mono tracking-widest text-[#BFA888] uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#BFA888]" />
              <span>STUDIO NETWORK</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
              Lokasi Cabang
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 max-w-xl font-normal">
              Enam studio privat di Jabodetabek. Seluruh kunjungan dilayani berdasarkan reservasi terjadwal untuk menjaga ketenangan ruang.
            </p>
          </div>
        </div>

        {/* Refined Architectural Search & Filter Bar */}
        <div className="space-y-6">
          {/* Top Search Input Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari studio atau nama jalan..."
                className="w-full pl-11 pr-10 py-3 rounded-full bg-[#141418] border border-[#262630] text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-[#BFA888] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white p-1 transition-colors cursor-pointer"
                  aria-label="Hapus kata kunci"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Studio Count Badge */}
            <div className="text-xs font-mono text-zinc-400 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#BFA888]" />
              <span>{filteredBranches.length} studio ditemukan</span>
            </div>
          </div>

          {/* Area Navigation Tab Strip */}
          <div className="border-b border-[#22222A] flex items-center gap-6 sm:gap-8 overflow-x-auto no-scrollbar pt-1">
            {areas.map((area) => {
              const isActive = selectedArea === area;
              return (
                <button
                  key={area}
                  onClick={() => setSelectedArea(area)}
                  className={`pb-3.5 text-xs font-mono tracking-wider uppercase whitespace-nowrap transition-all cursor-pointer border-b-2 relative -mb-px ${
                    isActive
                      ? 'border-[#BFA888] text-white font-semibold'
                      : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {area}
                </button>
              );
            })}
          </div>
        </div>

        {/* Branches Grid */}
        {filteredBranches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-10">
            {filteredBranches.map((branch) => (
              <div
                key={branch.id}
                className="bg-[#141418] rounded-3xl border border-[#262630] overflow-hidden flex flex-col justify-between group hover:border-zinc-600 transition-all duration-300 shadow-[0_4px_24px_rgba(0,0,0,0.2)]"
              >
                <div>
                  {/* Photo */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-zinc-900">
                    <img
                      src={branch.image}
                      alt={branch.name}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500 opacity-85 group-hover:opacity-100"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#0E0E11]/80 backdrop-blur-xs text-[10px] font-mono tracking-widest text-[#BFA888] uppercase border border-[#262630]">
                      {branch.area}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-6 xl:p-8 space-y-3">
                    <h3 className="font-display text-xl font-bold text-white">
                      {branch.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-[#BFA888] shrink-0 mt-0.5" />
                      <span>{branch.address}</span>
                    </p>
                    <div className="text-xs font-mono text-zinc-400 pt-3 border-t border-[#22222A] space-y-1.5">
                      <div><span className="text-zinc-500">Jam Buka:</span> {branch.hours}</div>
                      <div><span className="text-zinc-500">Telepon:</span> {branch.phone}</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-6 xl:p-8 pt-0 flex items-center gap-3">
                  <a
                    href={branch.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 rounded-full border border-[#262630] hover:bg-white/5 text-zinc-300 hover:text-white text-xs font-mono tracking-wider uppercase text-center flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Peta</span>
                  </a>
                  <button
                    onClick={() => onSelectBranch(branch)}
                    className="flex-1 py-3 rounded-full bg-white hover:bg-zinc-200 text-[#0E0E11] text-xs font-mono font-bold tracking-wider uppercase text-center transition-colors cursor-pointer"
                  >
                    Pilih Cabang
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center space-y-4 border border-[#262630] rounded-3xl bg-[#141418] max-w-xl mx-auto px-6">
            <p className="text-sm text-zinc-400 font-normal">
              Tidak ada studio yang sesuai dengan pencarian "{searchQuery}".
            </p>
            <button
              onClick={handleResetFilters}
              className="px-6 py-2.5 rounded-full bg-white text-[#0E0E11] text-xs font-mono uppercase tracking-wider font-semibold cursor-pointer"
            >
              Reset Filter
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
