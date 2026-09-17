'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, Trash2, ShoppingBag, Check, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Order } from '@/types';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    closeCart,
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
  } = useCart();

  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isOrdered, setIsOrdered] = useState(false);
  const [createdOrderNumber, setCreatedOrderNumber] = useState('');

  if (!isCartOpen) return null;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    const orderNum = `ATM-ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    setCreatedOrderNumber(orderNum);

    // Save to local storage for /customer/orders
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      customerName: recipientName || 'Pelanggan ATMOS',
      customerPhone: recipientPhone || '081288990011',
      customerEmail: 'customer@atmos.id',
      shippingAddress: {
        street: recipientAddress || 'Jabodetabek',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        postalCode: '12190',
      },
      items: cartItems.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
      })),
      totalAmount: subtotal,
      status: 'PAID',
      paymentMethod: 'BCA Virtual Account',
      trackingNumber: `ATM-EXP-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toISOString(),
    };

    try {
      const existing = localStorage.getItem('atmos_customer_orders');
      const orders: Order[] = existing ? JSON.parse(existing) : [];
      localStorage.setItem('atmos_customer_orders', JSON.stringify([newOrder, ...orders]));
    } catch {
      // ignore
    }

    setIsOrdered(true);
  };

  const generateWhatsAppOrderLink = () => {
    const itemsList = cartItems
      .map((item) => `• ${item.product.name} (${item.product.number}) x${item.quantity} = ${formatRupiah(item.product.price * item.quantity)}`)
      .join('%0A');

    const text = `Halo Concierge ATMOS, saya ingin mengonfirmasi pesanan produk (${createdOrderNumber}):%0A%0A` +
      `${itemsList}%0A%0A` +
      `• Total: ${formatRupiah(subtotal)}%0A%0A` +
      `Data Penerima:%0A` +
      `• Nama: ${recipientName || 'Pelanggan'}%0A` +
      `• Kontak: ${recipientPhone || '-'}` +
      `• Alamat: ${recipientAddress || 'Jabodetabek'}`;

    return `https://wa.me/6281288990011?text=${text}`;
  };

  const handleFinish = () => {
    setIsOrdered(false);
    clearCart();
    closeCart();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="relative w-full max-w-md bg-white shadow-2xl h-full flex flex-col justify-between animate-fade-in">
        
        {/* Header */}
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-display font-bold text-base text-zinc-950">
              Keranjang Belanja
            </h3>
            <span className="text-xs bg-zinc-100 text-zinc-800 font-semibold font-mono px-2 py-0.5 rounded-full">
              {cartItems.reduce((acc, curr) => acc + curr.quantity, 0)}
            </span>
          </div>
          <button
            onClick={closeCart}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 transition-colors cursor-pointer"
            aria-label="Tutup keranjang"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {isOrdered ? (
            <div className="py-10 text-center space-y-5">
              <div className="w-12 h-12 rounded-full bg-zinc-950 text-white flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-mono text-[#8A7862] tracking-wider uppercase">
                  {createdOrderNumber}
                </span>
                <h4 className="font-display text-lg font-bold text-zinc-950">
                  Pesanan Telah Dicatat
                </h4>
                <p className="text-xs text-zinc-500 leading-relaxed max-w-xs mx-auto">
                  Terima kasih. Pesanan Anda telah tersimpan di sistem dan dapat dilacak di halaman Lacak Pesanan.
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2.5">
                <a
                  href={generateWhatsAppOrderLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold uppercase tracking-wider text-center transition-colors"
                >
                  Konfirmasi ke WhatsApp
                </a>
                <Link
                  href="/customer/orders"
                  onClick={handleFinish}
                  className="w-full py-3 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold uppercase tracking-wider text-center transition-colors flex items-center justify-center gap-2"
                >
                  <span>Lihat Status di Lacak Pesanan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={handleFinish}
                  className="w-full py-2.5 rounded-full border border-zinc-200 text-zinc-700 text-xs font-semibold uppercase tracking-wider hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                  Tutup Keranjang
                </button>
              </div>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <ShoppingBag className="w-10 h-10 text-zinc-300 mx-auto" />
              <div className="font-display font-medium text-sm text-zinc-900">
                Keranjang Anda masih kosong
              </div>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                Jelajahi produk perawatan rambut kami untuk penggunaan rutin di rumah.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center gap-4 py-3 border-b border-zinc-100 last:border-0"
                >
                  <div className="w-14 h-14 rounded-xl bg-zinc-50 p-2 border border-zinc-100 flex items-center justify-center shrink-0">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-display text-xs font-bold text-zinc-950 truncate">
                      {item.product.name}
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono">
                      {item.product.volume} • {formatRupiah(item.product.price)}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="w-6 h-6 rounded-full border border-zinc-200 flex items-center justify-center text-xs text-zinc-700 hover:bg-zinc-100 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="text-xs font-mono font-medium px-1">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="w-6 h-6 rounded-full border border-zinc-200 flex items-center justify-center text-xs text-zinc-700 hover:bg-zinc-100 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-1.5 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                    aria-label="Hapus produk"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {/* Recipient info for order */}
              <div className="pt-4 border-t border-zinc-100 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                  Data Pengiriman
                </div>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Nama Penerima"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
                />
                <input
                  type="tel"
                  required
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  placeholder="Nomor WhatsApp (e.g. 081288990011)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
                />
                <textarea
                  rows={2}
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="Alamat lengkap pengiriman di Jabodetabek..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        {!isOrdered && cartItems.length > 0 && (
          <div className="p-6 border-t border-zinc-100 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500 font-mono text-xs">Subtotal:</span>
              <span className="font-display font-bold text-zinc-950 text-base">
                {formatRupiah(subtotal)}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={!recipientName || !recipientPhone}
              className="w-full py-3.5 rounded-full bg-zinc-950 hover:bg-zinc-800 disabled:bg-zinc-200 disabled:text-zinc-400 text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Lanjutkan Pemesanan
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
