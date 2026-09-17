'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ShoppingBag, Shield } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface NavbarProps {
  onOpenBooking?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenBooking }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalCartCount, openCart } = useCart();
  const pathname = usePathname();

  const isHome = pathname === '/' || pathname === '';

  const navLinks = [
    { label: 'Layanan', href: isHome ? '#services' : '/#services' },
    { label: 'Mengapa Kami', href: isHome ? '#why-us' : '/#why-us' },
    { label: 'Capster', href: isHome ? '#capster' : '/#capster' },
    { label: 'Lokasi', href: isHome ? '#branches' : '/#branches' },
    { label: 'Produk', href: '/shop' },
    { label: 'Lacak Pesanan', href: '/customer/orders' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0E0E11]/95 backdrop-blur-md border-b border-[#22222A] text-white">
      <div className="max-w-7xl 2xl:max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-12 xl:px-16">
        <div className="flex items-center justify-between h-20">
          {/* Logo Brand */}
          <Link href="/" className="text-left cursor-pointer group">
            <span className="font-display font-bold text-xl tracking-[0.25em] text-white block leading-none">
              ATMOS
            </span>
            <span className="text-[10px] tracking-[0.18em] text-zinc-400 uppercase font-mono block mt-1">
              HAIR LOUNGE & SANCTUARY
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs font-mono tracking-wider uppercase text-zinc-300 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3.5">
            {/* Cart Button */}
            <button
              onClick={openCart}
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

            {/* Internal Staff Link (Unobtrusive) */}
            <Link
              href="/internal/login"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-800 hover:border-zinc-700 bg-zinc-900/50 text-zinc-400 hover:text-zinc-200 text-[11px] font-mono tracking-wider transition-colors"
              title="Akses Staf Internal ATMOS"
            >
              <Shield className="w-3 h-3 text-zinc-500" />
              <span>Staf</span>
            </Link>

            {/* Booking CTA Button */}
            {onOpenBooking ? (
              <button
                onClick={onOpenBooking}
                className="hidden sm:inline-flex items-center justify-center px-5 py-2 rounded-full bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer"
              >
                Reservasi
              </button>
            ) : (
              <Link
                href="/book"
                className="hidden sm:inline-flex items-center justify-center px-5 py-2 rounded-full bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold tracking-wider uppercase transition-colors"
              >
                Reservasi
              </Link>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-zinc-300 hover:text-white"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#22222A] bg-[#0E0E11] px-6 py-6 space-y-4">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-left text-sm font-mono tracking-wider uppercase text-zinc-300 hover:text-white py-1"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/internal/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-left text-xs font-mono tracking-wider uppercase text-zinc-500 hover:text-zinc-300 py-1 flex items-center gap-1.5 pt-2 border-t border-zinc-800"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Akses Portal Staf</span>
            </Link>
          </div>

          <div className="pt-4 border-t border-[#22222A]">
            {onOpenBooking ? (
              <button
                onClick={() => {
                  onOpenBooking();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-3 rounded-full bg-white text-zinc-950 text-xs font-semibold tracking-wider uppercase"
              >
                Reservasi Sesi
              </button>
            ) : (
              <Link
                href="/book"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full py-3 rounded-full bg-white text-zinc-950 text-xs font-semibold tracking-wider uppercase"
              >
                Reservasi Sesi
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
