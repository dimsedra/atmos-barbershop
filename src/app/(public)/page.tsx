'use client';

import React, { useState } from 'react';
import { Hero } from '@/components/public/Hero';
import { ServicesSection } from '@/components/public/ServicesSection';
import { WhyUsSection } from '@/components/public/WhyUsSection';
import { CapsterSection } from '@/components/public/CapsterSection';
import { BranchFinder } from '@/components/public/BranchFinder';
import { ShopSection } from '@/components/public/ShopSection';
import { TestimonialsSection } from '@/components/public/TestimonialsSection';
import { BookingModal } from '@/components/public/BookingModal';
import { ProductDetailModal } from '@/components/public/ProductDetailModal';
import { useCart } from '@/context/CartContext';
import { ServiceItem, Branch, Capster, ProductItem } from '@/types';

export default function PublicLandingPage() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingBranchId, setBookingBranchId] = useState<string | undefined>(undefined);
  const [bookingService, setBookingService] = useState<ServiceItem | null>(null);
  const [bookingCapster, setBookingCapster] = useState<Capster | null>(null);

  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const { addToCart } = useCart();

  const handleOpenBooking = () => {
    setBookingBranchId(undefined);
    setBookingService(null);
    setBookingCapster(null);
    setIsBookingOpen(true);
  };

  const handleSelectService = (service: ServiceItem) => {
    setBookingService(service);
    setIsBookingOpen(true);
  };

  const handleBookWithCapster = (branchId: string, capster?: Capster) => {
    setBookingBranchId(branchId);
    setBookingCapster(capster || null);
    setIsBookingOpen(true);
  };

  const handleSelectBranch = (branch: Branch) => {
    setBookingBranchId(branch.id);
    setIsBookingOpen(true);
  };

  return (
    <>
      <Hero
        onOpenBooking={handleOpenBooking}
        onExploreServices={() => {
          const el = document.getElementById('services');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      <ServicesSection onSelectService={handleSelectService} />

      <WhyUsSection />

      <CapsterSection onBookWithCapster={handleBookWithCapster} />

      <BranchFinder onSelectBranch={handleSelectBranch} />

      <ShopSection
        onSelectProduct={(prod) => setSelectedProduct(prod)}
        onAddToCart={(prod) => addToCart(prod)}
      />

      <TestimonialsSection />

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        initialBranchId={bookingBranchId}
        initialService={bookingService}
        initialCapster={bookingCapster}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(prod) => addToCart(prod)}
      />
    </>
  );
}
