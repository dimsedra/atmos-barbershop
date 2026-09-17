'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface HeroProps {
  onOpenBooking?: () => void;
  onExploreServices?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenBooking,
  onExploreServices,
}) => {
  return (
    <section 
      id="hero" 
      className="relative min-h-[82vh] lg:min-h-[88vh] flex flex-col justify-between overflow-hidden bg-[#0E0E11] text-white border-b border-[#22222A]"
    >
      {/* Cinematic Sanctuary Visual Layer */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=2560&q=85"
          alt="ATMOS Studio Sanctuary"
          className="w-full h-full object-cover object-center opacity-35 scale-[1.02] filter contrast-[1.05]"
        />
        {/* Architectural warm obsidian gradient vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E11] via-[#0E0E11]/75 to-[#0E0E11]/50 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0E0E11]/90 via-transparent to-[#0E0E11]/60 pointer-events-none" />
      </div>

      {/* Hero Body Content */}
      <div className="relative z-10 max-w-7xl 2xl:max-w-[1720px] mx-auto w-full px-6 sm:px-10 lg:px-12 xl:px-16 flex-1 flex flex-col justify-between py-16 sm:py-20 md:py-24 xl:py-28">
        
        {/* Top Architectural Coordinate Pill */}
        <div className="flex items-center gap-3 text-[11px] font-mono tracking-widest text-[#BFA888] uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-[#BFA888]" />
          <span>ATMOS STUDIO</span>
          <span className="text-zinc-600">—</span>
          <span>JABODETABEK</span>
          <span className="text-zinc-600">—</span>
          <span>BY APPOINTMENT</span>
        </div>

        {/* Center: Hero Typography & Actions */}
        <div className="max-w-3xl space-y-8 my-auto py-8">
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white leading-[0.94] text-balance">
            Pangkas Presisi. <br />
            <span className="text-zinc-400 font-normal">Ruang Hening.</span>
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-zinc-300 font-normal leading-relaxed max-w-xl">
            Pangkas rambut berbasis anatomi wajah dan terapi relaksasi kepala di 6 studio Jabodetabek. Khusus reservasi terjadwal tanpa antre.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            {onOpenBooking ? (
              <button
                onClick={onOpenBooking}
                className="px-8 py-4 rounded-full bg-white hover:bg-zinc-100 text-[#0E0E11] text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer inline-flex items-center gap-3 group shadow-lg"
              >
                <span>Reservasi Sesi</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <Link
                href="/book"
                className="px-8 py-4 rounded-full bg-white hover:bg-zinc-100 text-[#0E0E11] text-xs font-semibold tracking-wider uppercase transition-all inline-flex items-center gap-3 group shadow-lg"
              >
                <span>Reservasi Sesi</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}

            {onExploreServices ? (
              <button
                onClick={onExploreServices}
                className="px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/20 text-xs font-semibold tracking-wider uppercase backdrop-blur-xs transition-colors cursor-pointer"
              >
                Menu Layanan
              </button>
            ) : (
              <a
                href="#services"
                className="px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/20 text-xs font-semibold tracking-wider uppercase backdrop-blur-xs transition-colors"
              >
                Menu Layanan
              </a>
            )}
          </div>
        </div>

        {/* Bottom Bar: Concise Guarantees with Bronze Touch */}
        <div className="pt-6 border-t border-[#262630] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono">
          <div className="text-zinc-300 flex items-center gap-2">
            <span className="text-white font-medium">1 Tamu</span>
            <span className="text-zinc-600">•</span>
            <span className="text-white font-medium">1 Kursi Privat</span>
            <span className="text-zinc-600">•</span>
            <span className="text-[#BFA888]">Nol Antrean</span>
          </div>

          <div className="text-zinc-400 sm:text-right">
            Senopati • PIK • Menteng • BSD • Kelapa Gading • Bekasi
          </div>
        </div>

      </div>
    </section>
  );
};
