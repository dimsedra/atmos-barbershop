'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check, MapPin, Star } from 'lucide-react';
import { CAPSTERS_DATA, BRANCHES_DATA } from '@/lib/mock/data';
import { Capster } from '@/types';
import { MobileCapsterDeck } from './MobileCapsterDeck';

interface CapsterSectionProps {
  onBookWithCapster?: (branchId: string, capster?: Capster) => void;
}

export const CapsterSection: React.FC<CapsterSectionProps> = ({
  onBookWithCapster,
}) => {
  const [selectedId, setSelectedId] = useState<string>(CAPSTERS_DATA[0].id);
  const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const isClickingRef = useRef<boolean>(false);
  const router = useRouter();

  const activeStylist = CAPSTERS_DATA.find((s) => s.id === selectedId) || CAPSTERS_DATA[0];

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

  useEffect(() => {
    const observerCallback: IntersectionObserverCallback = (entries) => {
      if (isClickingRef.current) return;

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('data-stylist-id');
          if (id) {
            setSelectedId(id);
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: '-20% 0px -35% 0px',
      threshold: 0.2,
    });

    Object.values(cardRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleSelectStylist = (id: string) => {
    setSelectedId(id);
    isClickingRef.current = true;
    setTimeout(() => {
      isClickingRef.current = false;
    }, 600);
  };

  return (
    <section id="capster" className="py-20 md:py-24 xl:py-28 bg-[#F8F7F4] border-b border-[#E6E4DF]">
      <div className="max-w-7xl 2xl:max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 space-y-12 lg:space-y-14">
        
        {/* Header */}
        <div className="pb-8 border-b border-[#E6E4DF] flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="text-xs font-mono tracking-widest text-[#8A7862] uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8A7862]" />
              <span>TIM ARTISAN</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#121214] tracking-tight">
              Capster & Stylist
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-zinc-600 max-w-md font-normal md:text-right leading-relaxed">
            Praktisi berlisensi dengan dedikasi pada presisi bentuk wajah dan kenyamanan relaksasi kepala.
          </p>
        </div>

        {/* Mobile & Tablet Dedicated Experience */}
        <div className="block lg:hidden">
          <MobileCapsterDeck onBookWithCapster={handleBooking} />
        </div>

        {/* Desktop Experience: Harmonized 2-Column Stage with Sticky Spotlight & Roster */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-8 lg:gap-12 items-start relative">
          
          {/* Left: Active Stylist Portrait Stage */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
            <div className="relative rounded-3xl overflow-hidden h-[460px] sm:h-[500px] xl:h-[540px] w-full bg-zinc-900 border border-[#E6E4DF] shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
              <img
                key={activeStylist.id}
                src={activeStylist.avatar}
                alt={activeStylist.name}
                className="w-full h-full object-cover object-top"
              />
              
              {/* Studio Badge */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                <span className="px-3 py-1 rounded-full bg-[#0E0E11]/80 backdrop-blur-md text-[11px] font-mono text-[#D8C29D] border border-white/10 flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-[#BFA888]" />
                  <span>Studio {getBranchName(activeStylist.branchId)}</span>
                </span>
                
                <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-mono text-white flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span>{activeStylist.rating}</span>
                </span>
              </div>

              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E11] via-[#0E0E11]/40 to-transparent pointer-events-none" />

              {/* In-photo Stylist Meta & Specialties */}
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-3">
                <div className="space-y-1">
                  <div className="text-xs font-mono text-[#D8C29D]">
                    {activeStylist.experience}
                  </div>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-white leading-tight">
                    {activeStylist.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-300 font-normal">
                    {activeStylist.role}
                  </p>
                </div>

                <div className="pt-1 flex flex-wrap gap-1.5">
                  {activeStylist.specialties.map((spec, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-mono text-zinc-200 bg-white/15 backdrop-blur-xs px-2.5 py-1 rounded-full"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Direct Booking Action */}
            <div className="space-y-2">
              <button
                onClick={() => handleBooking(activeStylist.branchId, activeStylist)}
                className="w-full py-4 rounded-full bg-[#121214] hover:bg-zinc-800 text-white text-xs font-mono tracking-wider uppercase transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs group"
              >
                <span>Reservasi Sesi dengan {activeStylist.name.split(' ')[0]}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="text-[11px] text-zinc-500 text-center font-mono">
                Studio {getBranchName(activeStylist.branchId)} • Khusus Reservasi Terjadwal
              </div>
            </div>
          </div>

          {/* Right: Interactive Editorial Roster */}
          <div className="lg:col-span-7 space-y-3.5">
            {CAPSTERS_DATA.map((stylist, index) => {
              const isSelected = stylist.id === selectedId;
              const number = `0${index + 1}`;

              return (
                <div
                  key={stylist.id}
                  data-stylist-id={stylist.id}
                  ref={(el) => {
                    cardRefs.current[stylist.id] = el;
                  }}
                  onClick={() => handleSelectStylist(stylist.id)}
                  className={`p-5 sm:p-6 rounded-3xl border transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? 'bg-white border-[#121214] shadow-[0_6px_24px_rgba(0,0,0,0.05)] ring-1 ring-[#121214]'
                      : 'bg-white/80 border-[#E6E4DF] hover:bg-white hover:border-zinc-400'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-[#8A7862]">
                          {number}
                        </span>
                        <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                          Studio {getBranchName(stylist.branchId)} • {stylist.experience}
                        </span>
                      </div>

                      <h4 className="font-display text-xl font-bold text-[#121214]">
                        {stylist.name}
                      </h4>

                      <p className="text-xs text-zinc-600 font-normal">
                        {stylist.role}
                      </p>

                      <div className="pt-1.5 flex flex-wrap gap-1.5">
                        {stylist.specialties.map((spec, i) => (
                          <span
                            key={i}
                            className="text-[11px] font-mono text-zinc-700 bg-[#EFECE6] px-2.5 py-0.5 rounded-md"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-1 shrink-0">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors ${
                          isSelected
                            ? 'bg-[#121214] border-[#121214] text-white'
                            : 'border-zinc-300 text-transparent'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
};
