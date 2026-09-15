import React from 'react';
import { BRANCHES_DATA } from '../data/branches';

interface FooterProps {
  onOpenBooking: () => void;
  onNavigateTo: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenBooking, onNavigateTo }) => {
  return (
    <footer className="bg-[#09090C] text-zinc-400 py-20 xl:py-24 border-t border-[#1E1E26]">
      <div className="max-w-7xl 2xl:max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 space-y-16">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 xl:gap-16">
          {/* Brand Info */}
          <div className="lg:col-span-4 space-y-4">
            <div>
              <span className="font-display font-bold text-xl tracking-[0.25em] text-white block leading-none">
                ATMOS
              </span>
              <span className="text-[10px] tracking-[0.18em] text-[#BFA888] uppercase font-mono block mt-1">
                HAIR LOUNGE & SANCTUARY
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-sm font-normal">
              Studio pangkas presisi berbasis anatomi wajah dan terapi relaksasi kepala di Jabodetabek. Beroperasi khusus reservasi terjadwal.
            </p>
          </div>

          {/* Nav Links */}
          <div className="lg:col-span-2 space-y-3 font-mono text-xs">
            <div className="text-white uppercase tracking-wider font-semibold">
              Navigasi
            </div>
            <ul className="space-y-2.5 text-zinc-400">
              <li>
                <button
                  onClick={() => onNavigateTo('services')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Layanan
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTo('why-us')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Mengapa Kami
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTo('capster')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Capster & Stylist
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTo('branches')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Lokasi Studio
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTo('shop')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Produk Perawatan
                </button>
              </li>
            </ul>
          </div>

          {/* Locations */}
          <div className="lg:col-span-3 space-y-3 font-mono text-xs">
            <div className="text-white uppercase tracking-wider font-semibold">
              Studio Network
            </div>
            <ul className="space-y-2 text-zinc-400">
              {BRANCHES_DATA.map((b) => (
                <li key={b.id} className="hover:text-zinc-200 transition-colors">
                  {b.name}
                </li>
              ))}
            </ul>
          </div>

          {/* Concierge Hotline */}
          <div className="lg:col-span-3 space-y-4">
            <div className="text-xs font-mono text-white uppercase tracking-wider font-semibold">
              Reservasi & Bantuan
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
              Hubungi concierge kami untuk konsultasi jadwal dan pertanyaan seputar layanan studio.
            </p>
            <div className="space-y-2.5">
              <button
                onClick={onOpenBooking}
                className="w-full py-3 rounded-full bg-white hover:bg-zinc-200 text-[#09090C] text-xs font-mono font-bold tracking-wider uppercase transition-colors cursor-pointer"
              >
                Reservasi Jadwal
              </button>
              <a
                href="https://wa.me/6281288990011"
                target="_blank"
                rel="noreferrer"
                className="block text-center text-xs font-mono text-zinc-400 hover:text-white transition-colors pt-1"
              >
                WhatsApp Concierge: +62 812-8899-0011
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-[#1E1E26] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-500">
          <div>
            © {new Date().getFullYear()} ATMOS Hair Lounge. Hak cipta dilindungi.
          </div>
          <div className="flex items-center gap-6 text-zinc-500">
            <span>Privasi & Sanitasi</span>
            <span>Ketentuan Reservasi</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
