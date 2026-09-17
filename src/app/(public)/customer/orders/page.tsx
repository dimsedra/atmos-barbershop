'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  Package, 
  MapPin, 
  Clock, 
  ArrowRight, 
  Search, 
  ExternalLink,
  MessageCircle,
  VolumeX,
  Headphones,
  CheckCircle2
} from 'lucide-react';
import { Booking, Order } from '@/types';
import { INITIAL_BOOKINGS, INITIAL_ORDERS } from '@/lib/mock/data';

export default function CustomerOrdersPage() {
  const [activeTab, setActiveTab] = useState<'bookings' | 'orders'>('bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Load bookings from localStorage combined with initial seed
    try {
      const storedBookings = localStorage.getItem('atmos_customer_bookings');
      if (storedBookings) {
        const parsed: Booking[] = JSON.parse(storedBookings);
        // Deduplicate with initial bookings
        const combined = [...parsed];
        INITIAL_BOOKINGS.forEach((ib) => {
          if (!combined.some((b) => b.bookingNumber === ib.bookingNumber || b.id === ib.id)) {
            combined.push(ib);
          }
        });
        setBookings(combined);
      } else {
        setBookings(INITIAL_BOOKINGS);
      }
    } catch {
      setBookings(INITIAL_BOOKINGS);
    }

    // Load orders from localStorage combined with initial seed
    try {
      const storedOrders = localStorage.getItem('atmos_customer_orders');
      if (storedOrders) {
        const parsed: Order[] = JSON.parse(storedOrders);
        const combined = [...parsed];
        INITIAL_ORDERS.forEach((io) => {
          if (!combined.some((o) => o.orderNumber === io.orderNumber || o.id === io.id)) {
            combined.push(io);
          }
        });
        setOrders(combined);
      } else {
        setOrders(INITIAL_ORDERS);
      }
    } catch {
      setOrders(INITIAL_ORDERS);
    }
  }, []);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const filteredBookings = bookings.filter((b) => {
    const q = searchQuery.toLowerCase();
    return (
      (b.bookingNumber?.toLowerCase().includes(q) ?? false) ||
      b.customerName.toLowerCase().includes(q) ||
      (b.branchName?.toLowerCase().includes(q) ?? false) ||
      (b.serviceName?.toLowerCase().includes(q) ?? false)
    );
  });

  const filteredOrders = orders.filter((o) => {
    const q = searchQuery.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      (o.trackingNumber?.toLowerCase().includes(q) ?? false)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'COMPLETED':
      case 'DELIVERED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'PAID':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'SHIPPED':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-zinc-100 text-zinc-700 border-zinc-200';
    }
  };

  return (
    <div className="py-12 md:py-20 max-w-5xl mx-auto px-6 sm:px-8 space-y-12">
      {/* Header */}
      <div className="space-y-3 text-center sm:text-left">
        <div className="text-xs font-mono tracking-widest text-[#8A7862] uppercase">
          PORTAL PELANGGAN
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-zinc-950 tracking-tight">
          Lacak Reservasi & Pesanan
        </h1>
        <p className="text-sm text-zinc-600 max-w-xl">
          Pantau status jadwal reservasi salon dan pengiriman produk perawatan rambut Anda secara real-time.
        </p>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-[#E6E4DF]">
        <div className="flex items-center gap-2 bg-[#EFECE6] p-1.5 rounded-full border border-[#E6E4DF] self-start">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-5 py-2 rounded-full text-xs font-mono tracking-wider uppercase transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'bookings'
                ? 'bg-[#121214] text-white shadow-xs'
                : 'text-zinc-600 hover:text-[#121214]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Jadwal Reservasi ({bookings.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-2 rounded-full text-xs font-mono tracking-wider uppercase transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'bg-[#121214] text-white shadow-xs'
                : 'text-zinc-600 hover:text-[#121214]'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Pesanan Produk ({orders.length})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kode booking / nama..."
            className="w-full pl-9 pr-4 py-2 rounded-full border border-zinc-200 text-xs bg-white text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900"
          />
        </div>
      </div>

      {/* Tab: Bookings */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-3xl border border-[#E6E4DF] p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E6E4DF]">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-zinc-950">
                      {b.bookingNumber}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono border font-semibold uppercase ${getStatusBadge(b.status)}`}>
                      {b.status}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-zinc-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{b.date} • {b.timeSlot} WIB</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="font-display text-lg font-bold text-zinc-950">
                      {b.serviceName}
                    </div>
                    <div className="text-xs text-zinc-500 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{b.branchName}</span>
                    </div>
                    <div className="text-xs text-zinc-700">
                      Artisan: <strong>{b.capsterName}</strong>
                    </div>
                  </div>

                  <div className="space-y-2 bg-[#FAF9F6] p-4 rounded-2xl border border-[#E6E4DF] text-xs">
                    <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                      Preferensi Sensorik
                    </div>
                    <div className="text-zinc-700">
                      {b.sensoryProfile?.notes || 'Mode Standar Sanctuary ATMOS'}
                    </div>
                    {b.notes && (
                      <div className="text-zinc-500 italic pt-1 border-t border-[#E6E4DF]">
                        Catatan: "{b.notes}"
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E6E4DF] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-400 uppercase block">Biaya Sesi</span>
                    <span className="font-display font-bold text-zinc-950 text-base">
                      {formatRupiah(b.servicePrice)}
                    </span>
                  </div>

                  <a
                    href={`https://wa.me/6281288990011?text=Halo%20ATMOS,%20saya%20ingin%20bertanya%20mengenai%20reservasi%20${b.bookingNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 rounded-full border border-zinc-200 hover:bg-zinc-50 text-xs font-mono tracking-wider uppercase text-zinc-800 flex items-center gap-1.5 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Hubungi Concierge</span>
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className="py-16 text-center space-y-4 border border-[#E6E4DF] rounded-3xl bg-white p-8">
              <Calendar className="w-10 h-10 text-zinc-300 mx-auto" />
              <div className="font-display font-bold text-base text-zinc-950">
                Belum ada riwayat reservasi
              </div>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Anda belum memiliki jadwal pangkas atau spa rambut aktif. Reservasikan slot sesi eksklusif Anda sekarang.
              </p>
              <Link
                href="/book"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                <span>Buat Reservasi Sesi</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Tab: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((o) => (
              <div
                key={o.id}
                className="bg-white rounded-3xl border border-[#E6E4DF] p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E6E4DF]">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-zinc-950">
                      {o.orderNumber}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono border font-semibold uppercase ${getStatusBadge(o.status)}`}>
                      {o.status}
                    </span>
                  </div>
                  {o.trackingNumber && (
                    <div className="text-xs font-mono text-zinc-500">
                      Resi: <span className="text-zinc-900 font-semibold">{o.trackingNumber}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                    Daftar Produk ({o.items.length})
                  </div>
                  <div className="divide-y divide-zinc-100">
                    {o.items.map((it, idx) => (
                      <div key={idx} className="py-2 flex items-center justify-between text-xs">
                        <div className="text-zinc-900 font-medium">
                          {it.productName} <span className="text-zinc-400">x{it.quantity}</span>
                        </div>
                        <div className="font-mono text-zinc-600">
                          {formatRupiah(it.price * it.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {o.shippingAddress && (
                  <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#E6E4DF] text-xs text-zinc-600">
                    <span className="text-zinc-400 font-mono block mb-0.5">Alamat Pengiriman:</span>
                    {o.shippingAddress.street}, {o.shippingAddress.city}, {o.shippingAddress.province} {o.shippingAddress.postalCode}
                  </div>
                )}

                <div className="pt-4 border-t border-[#E6E4DF] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-400 uppercase block">Total Belanja</span>
                    <span className="font-display font-bold text-zinc-950 text-base">
                      {formatRupiah(o.totalAmount)}
                    </span>
                  </div>

                  <a
                    href={`https://wa.me/6281288990011?text=Halo%20ATMOS,%20saya%20ingin%20menanyakan%20status%20pengiriman%20pesanan%20${o.orderNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 rounded-full border border-zinc-200 hover:bg-zinc-50 text-xs font-mono tracking-wider uppercase text-zinc-800 flex items-center gap-1.5 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Bantuan Pesanan</span>
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className="py-16 text-center space-y-4 border border-[#E6E4DF] rounded-3xl bg-white p-8">
              <Package className="w-10 h-10 text-zinc-300 mx-auto" />
              <div className="font-display font-bold text-base text-zinc-950">
                Belum ada riwayat pesanan produk
              </div>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Jelajahi lini produk perawatan rambut kami untuk penggunaan rutin di rumah.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                <span>Buka Katalog Produk</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
