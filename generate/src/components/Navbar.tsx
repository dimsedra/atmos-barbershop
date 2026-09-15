import React, { useState } from 'react';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { CartItem } from '../types';

interface NavbarProps {
  onOpenBooking: () => void;
  onOpenCart: () => void;
  cartItems: CartItem[];
  onNavigateTo: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenBooking,
  onOpenCart,
  cartItems,
  onNavigateTo,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const navLinks = [
    { label: 'Layanan', target: 'services' },
    { label: 'Mengapa Kami', target: 'why-us' },
    { label: 'Capster', target: 'capster' },
    { label: 'Lokasi', target: 'branches' },
    { label: 'Produk', target: 'shop' },
  ];

  const handleNavClick = (target: string) => {
    onNavigateTo(target);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0E0E11]/95 backdrop-blur-md border-b border-[#22222A] text-white">
      <div className="max-w-7xl 2xl:max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-12 xl:px-16">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Brand */}
          <button
            onClick={() => handleNavClick('hero')}
            className="text-left cursor-pointer group"
          >
            <span className="font-display font-bold text-xl tracking-[0.25em] text-white block leading-none">
              ATMOS
            </span>
            <span className="text-[10px] tracking-[0.18em] text-zinc-400 uppercase font-mono block mt-1">
              HAIR LOUNGE & SANCTUARY
            </span>
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <button
                key={link.target}
                onClick={() => handleNavClick(link.target)}
                className="text-xs font-mono tracking-wider uppercase text-zinc-300 hover:text-white transition-colors cursor-pointer"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={onOpenCart}
              className="p-2.5 rounded-full text-zinc-300 hover:text-white hover:bg-white/10 transition-colors relative cursor-pointer"
              aria-label="Keranjang Belanja"
            >
              <ShoppingBag className="w-4 h-4" />
              {totalCartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-white text-zinc-950 text-[10px] font-bold flex items-center justify-center">
                  {totalCartCount}
                </span>
              )}
            </button>

            <button
              onClick={onOpenBooking}
              className="hidden sm:inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer"
            >
              Reservasi
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-zinc-300 hover:text-white"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#22222A] bg-[#0E0E11] px-6 py-6 space-y-4">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <button
                key={link.target}
                onClick={() => handleNavClick(link.target)}
                className="text-left text-sm font-mono tracking-wider uppercase text-zinc-300 hover:text-white py-1"
              >
                {link.label}
              </button>
            ))}
          </div>
          <div className="pt-4 border-t border-[#22222A]">
            <button
              onClick={() => {
                onOpenBooking();
                setMobileMenuOpen(false);
              }}
              className="w-full py-3 rounded-full bg-white text-zinc-950 text-xs font-semibold tracking-wider uppercase"
            >
              Reservasi Sesi
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
