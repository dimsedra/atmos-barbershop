import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ServicesSection } from './components/ServicesSection';
import { WhyUsSection } from './components/WhyUsSection';
import { CapsterSection } from './components/CapsterSection';
import { BranchFinder } from './components/BranchFinder';
import { ShopSection } from './components/ShopSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { Footer } from './components/Footer';
import { BookingModal } from './components/BookingModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { ProductItem, CartItem, Branch, ServiceItem } from './types';

export function App() {
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [bookingBranchId, setBookingBranchId] = useState<string | undefined>(undefined);
  const [bookingService, setBookingService] = useState<ServiceItem | null>(null);

  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const handleOpenBooking = (branchId?: string, service?: ServiceItem) => {
    setBookingBranchId(branchId);
    if (service) {
      setBookingService(service);
    }
    setIsBookingOpen(true);
  };

  const handleSelectBranch = (branch: Branch) => {
    handleOpenBooking(branch.id);
  };

  const handleSelectService = (service: ServiceItem) => {
    handleOpenBooking(undefined, service);
  };

  const handleAddToCart = (product: ProductItem) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFC] text-zinc-950 selection:bg-zinc-200">
      {/* Navigation Header */}
      <Navbar
        onOpenBooking={() => handleOpenBooking()}
        onOpenCart={() => setIsCartOpen(true)}
        cartItems={cartItems}
        onNavigateTo={scrollToSection}
      />

      {/* Main Page Flow */}
      <main className="flex-1">
        <Hero
          onOpenBooking={() => handleOpenBooking()}
          onExploreServices={() => scrollToSection('services')}
        />

        <ServicesSection
          onSelectService={handleSelectService}
        />

        <WhyUsSection />

        <CapsterSection
          onBookWithCapster={(branchId) => handleOpenBooking(branchId)}
        />

        <BranchFinder
          onSelectBranch={handleSelectBranch}
        />

        <ShopSection
          onSelectProduct={(p) => setSelectedProduct(p)}
          onAddToCart={handleAddToCart}
        />

        <TestimonialsSection />
      </main>

      {/* Footer */}
      <Footer
        onOpenBooking={() => handleOpenBooking()}
        onNavigateTo={scrollToSection}
      />

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => {
          setIsBookingOpen(false);
          setBookingService(null);
        }}
        initialBranchId={bookingBranchId}
        initialService={bookingService}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />
    </div>
  );
}

export default App;
