'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, MapPin, Star } from 'lucide-react';
import { CAPSTERS_DATA, BRANCHES_DATA } from '@/lib/mock/data';
import { Capster } from '@/types';

interface CapsterSectionProps {
  onBookWithCapster?: (branchId: string, capster?: Capster) => void;
}

export const CapsterSection: React.FC<CapsterSectionProps> = ({
  onBookWithCapster,
}) => {
  const router = useRouter();

  const getBranchName = (branchId: string) => {
    const branch = BRANCHES_DATA.find((b) => b.id === branchId);
    return branch ? branch.name.replace('ATMOS ', '') : 'Jabodetabek';
  };

  const handleBooking = (branchId: string, capster?: Capster) => {
    if (onBookWithCapster) {
      onBookWithCapster(branchId, capster);
    } else {
      const query = new URLSearchParams({
        branch: branchId,
        ...(capster ? { capster: capster.id } : {}),
      });
      router.push(`/book?${query.toString()}`);
    }
  };

  return (
    <section id="capster" className="py-24 md:py-32 xl:py-36 bg-[#F8F7F4] border-b border-[#E6E4DF]">
      <div className="max-w-7xl 2xl:max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 space-y-16">
        
        {/* Editorial Section Header */}
        <div className="pb-10 border-b border-[#E6E4DF] flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="text-xs font-mono tracking-widest text-[#8A7862] uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8A7862]" />
              <span>TIM ARTISAN</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#121214] tracking-tight">
              Capster & Stylist
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 max-w-xl font-normal">
              Praktisi berlisensi dengan dedikasi tinggi pada anatomi wajah, teknik potong gunting ritmis, dan kenyamanan relaksasi kepala.
            </p>
          </div>
          <div className="text-xs font-mono text-zinc-400 self-start md:self-auto">
            Khusus Janji Temu • 1 Tamu 1 Kursi
          </div>
        </div>

        {/* Clean, Restrained Artisan Grid (No Gimmicks, Zero Clutter) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {CAPSTERS_DATA.map((stylist) => (
            <div
              key={stylist.id}
              className="bg-white rounded-3xl border border-[#E6E4DF] overflow-hidden flex flex-col justify-between hover:border-zinc-400 transition-all duration-300 shadow-[0_2px_12px_rgba(0,0,0,0.02)] group"
            >
              <div>
                {/* Portrait Canvas */}
                <div className="relative aspect-[4/5] bg-zinc-900 overflow-hidden">
                  <img
                    src={stylist.avatar}
                    alt={stylist.name}
                    className="w-full h-full object-cover object-top group-hover:scale-102 transition-transform duration-500"
                  />
                  
                  {/* Subtle Gradient Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                  {/* Top Branch & Rating Badges */}
                  <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
                    <span className="px-2.5 py-1 rounded-full bg-[#0E0E11]/80 backdrop-blur-xs text-[10px] font-mono text-[#D8C29D] border border-white/10 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#BFA888]" />
                      <span>{getBranchName(stylist.branchId)}</span>
                    </span>

                    <span className="px-2 py-1 rounded-full bg-black/60 backdrop-blur-xs text-[10px] font-mono text-white flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span>{stylist.rating}</span>
                    </span>
                  </div>

                  {/* Experience Tag inside photo bottom */}
                  <div className="absolute bottom-3.5 left-3.5 text-xs font-mono text-zinc-200">
                    {stylist.experience}
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 space-y-3">
                  <div>
                    <h3 className="font-display text-lg font-bold text-[#121214]">
                      {stylist.name}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {stylist.role}
                    </p>
                  </div>

                  {/* Specialties List */}
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {stylist.specialties.map((spec, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono text-zinc-700 bg-[#EFECE6] px-2 py-0.5 rounded-md"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-6 pt-0">
                <button
                  type="button"
                  onClick={() => handleBooking(stylist.branchId, stylist)}
                  className="w-full py-3 rounded-full bg-[#121214] hover:bg-zinc-800 text-white text-xs font-mono tracking-wider uppercase transition-colors cursor-pointer flex items-center justify-center gap-2 group/btn"
                >
                  <span>Reservasi Sesi</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
