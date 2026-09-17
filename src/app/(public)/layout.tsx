'use client';

import React from 'react';
import { CartProvider } from '@/context/CartContext';
import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import { CartDrawer } from '@/components/public/CartDrawer';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-[#F8F7F4] text-[#121214]">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <CartDrawer />
      </div>
    </CartProvider>
  );
}
