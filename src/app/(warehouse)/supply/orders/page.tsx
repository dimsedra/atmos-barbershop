'use client';

import React, { useState, useMemo } from 'react';
import { useInventoryStore } from '@/lib/store/inventory-store';
import { Order, OrderStatus } from '@/types';

const COURIER_OPTIONS = [
  { id: 'JNE', name: 'JNE Express (Reguler/YES)' },
  { id: 'SICEPAT', name: 'SiCepat Ekspres (BEST/GOKIL)' },
  { id: 'ANTERAJA', name: 'AnterAja (NextDay/Reguler)' },
  { id: 'GOSEND', name: 'GoSend Instant Jabodetabek' },
  { id: 'GRAB', name: 'GrabExpress Sameday/Instant' },
];

export default function SupplyOrdersPage() {
  const { orders, updateOrderStatus, getOrdersByStatusCount } = useInventoryStore();

  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Shipping Modal State
  const [shippingModalOrder, setShippingModalOrder] = useState<Order | null>(null);
  const [selectedCourier, setSelectedCourier] = useState<string>('JNE');
  const [trackingNumberInput, setTrackingNumberInput] = useState<string>('');
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Tab counts
  const totalCount = orders.length;
  const paidCount = getOrdersByStatusCount('PAID');
  const packedCount = getOrdersByStatusCount('PACKED');
  const shippedCount = getOrdersByStatusCount('SHIPPED');

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders
      .filter((o) => {
        // Tab filter
        if (activeTab === 'PAID' && o.status !== 'PAID') return false;
        if (activeTab === 'PACKED' && o.status !== 'PACKED') return false;
        if (activeTab === 'SHIPPED' && o.status !== 'SHIPPED') return false;

        // Search query
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        const matchesOrder = o.orderNumber.toLowerCase().includes(q);
        const matchesCustomer = o.customerName.toLowerCase().includes(q);
        const matchesItem = o.items.some((it) =>
          it.productName.toLowerCase().includes(q)
        );
        const matchesTracking = o.trackingNumber?.toLowerCase().includes(q);

        return matchesOrder || matchesCustomer || matchesItem || matchesTracking;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, activeTab, searchQuery]);

  // Action: Pack Order
  const handlePackOrder = (order: Order) => {
    updateOrderStatus(order.id, 'PACKED');
    setFeedbackToast(`Pesanan ${order.orderNumber} telah dikemas dan siap dijemput kurir.`);
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  // Open modal to input AWB / Resi
  const handleOpenShipModal = (order: Order) => {
    const courierObj = COURIER_OPTIONS[0];
    setSelectedCourier(courierObj.name);
    // Generate suggested AWB number
    const randomSuffix = Math.floor(10000000 + Math.random() * 90000000);
    setTrackingNumberInput(`AWB${randomSuffix}`);
    setShippingModalOrder(order);
  };

  // Submit shipping resi
  const handleSubmitShipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingModalOrder) return;
    if (!trackingNumberInput.trim()) {
      alert('Nomor Resi / AWB wajib diisi.');
      return;
    }

    updateOrderStatus(
      shippingModalOrder.id,
      'SHIPPED',
      selectedCourier,
      trackingNumberInput.trim()
    );

    const ordNum = shippingModalOrder.orderNumber;
    setShippingModalOrder(null);
    setFeedbackToast(`Pesanan ${ordNum} berhasil dikirim dengan no. resi ${trackingNumberInput.trim()}.`);
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-display font-semibold tracking-tight text-zinc-100">
            Antrean Pemenuhan Pesanan E-Commerce
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Alur pengemasan pesanan ritel dari web publik ATMOS, pencetakan daftar barang, dan penetapan nomor resi logistik.
          </p>
        </div>
      </div>

      {/* Toast alert */}
      {feedbackToast && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-md text-emerald-300 text-xs sm:text-sm flex items-center justify-between">
          <span>{feedbackToast}</span>
          <button
            onClick={() => setFeedbackToast(null)}
            className="text-emerald-400 hover:text-emerald-200"
          >
            ✕
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#12141a] border border-zinc-800/80 rounded-lg p-4">
          <div className="text-xs text-zinc-400 font-medium">Total Pesanan Web</div>
          <div className="text-2xl sm:text-3xl font-display font-semibold text-zinc-100 mt-1.5">
            {totalCount}
            <span className="text-xs font-sans text-zinc-500 font-normal ml-1.5">pesanan</span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">Seluruh riwayat transaksi</div>
        </div>

        <div className="bg-[#12141a] border border-zinc-800/80 rounded-lg p-4">
          <div className="text-xs text-sky-400 font-medium flex items-center gap-1.5">
            {paidCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />}
            Perlu Dikemas (PAID)
          </div>
          <div className="text-2xl sm:text-3xl font-display font-semibold text-sky-300 mt-1.5">
            {paidCount}
            <span className="text-xs font-sans text-sky-400/60 font-normal ml-1.5">paket</span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">Menunggu penyiapan stok</div>
        </div>

        <div className="bg-[#12141a] border border-zinc-800/80 rounded-lg p-4">
          <div className="text-xs text-amber-400 font-medium flex items-center gap-1.5">
            {packedCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
            Dikemas / Siap Kirim
          </div>
          <div className="text-2xl sm:text-3xl font-display font-semibold text-amber-300 mt-1.5">
            {packedCount}
            <span className="text-xs font-sans text-amber-400/60 font-normal ml-1.5">paket</span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">Siap serah terima kurir</div>
        </div>

        <div className="bg-[#12141a] border border-zinc-800/80 rounded-lg p-4">
          <div className="text-xs text-emerald-400 font-medium">Dalam Pengiriman</div>
          <div className="text-2xl sm:text-3xl font-display font-semibold text-emerald-300 mt-1.5">
            {shippedCount}
            <span className="text-xs font-sans text-emerald-400/60 font-normal ml-1.5">resi</span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">Menuju alamat pelanggan</div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between border-b border-zinc-800/70 pb-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === 'ALL'
                ? 'bg-zinc-800 text-zinc-100 border border-zinc-700/60'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
            }`}
          >
            Semua ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('PAID')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === 'PAID'
                ? 'bg-sky-950/50 text-sky-300 border border-sky-800/60'
                : 'text-zinc-400 hover:text-sky-300 hover:bg-zinc-900/50'
            }`}
          >
            Perlu Dikemas ({paidCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('PACKED')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === 'PACKED'
                ? 'bg-amber-950/50 text-amber-300 border border-amber-800/60'
                : 'text-zinc-400 hover:text-amber-300 hover:bg-zinc-900/50'
            }`}
          >
            Dikemas / Siap Kirim ({packedCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('SHIPPED')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap ${
              activeTab === 'SHIPPED'
                ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-800/60'
                : 'text-zinc-400 hover:text-emerald-300 hover:bg-zinc-900/50'
            }`}
          >
            Dalam Pengiriman ({shippedCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Cari order no, pelanggan, resi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#12141a] border border-zinc-800 rounded-md px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1.5 text-xs text-zinc-500 hover:text-zinc-300"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Orders List / Cards */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="bg-[#12141a] border border-zinc-800/80 rounded-lg p-12 text-center text-zinc-500 text-xs sm:text-sm">
            Tidak ada pesanan e-commerce pada status ini.
          </div>
        ) : (
          filteredOrders.map((order) => {
            const dateStr = new Date(order.createdAt).toLocaleString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={order.id}
                className="bg-[#12141a] border border-zinc-800/80 rounded-lg p-4 sm:p-5 transition-colors hover:border-zinc-700/80"
              >
                {/* Header: Order Number, Date, Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800/60">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-semibold text-zinc-100">
                      {order.orderNumber}
                    </span>
                    <span className="text-xs text-zinc-500">· {dateStr}</span>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {order.status === 'PAID' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-sky-950/60 text-sky-300 border border-sky-800/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                        Perlu Dikemas
                      </span>
                    )}
                    {order.status === 'PACKED' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-950/60 text-amber-300 border border-amber-800/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        Dikemas · Siap Kirim
                      </span>
                    )}
                    {order.status === 'SHIPPED' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-800/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Dalam Pengiriman
                      </span>
                    )}
                    {order.status === 'DELIVERED' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                        Diterima Pelanggan
                      </span>
                    )}
                  </div>
                </div>

                {/* Body Content */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-3 text-xs">
                  {/* Left (Col 1-5): Customer & Address */}
                  <div className="lg:col-span-5 space-y-1.5">
                    <div className="text-[11px] uppercase font-mono tracking-wider text-zinc-500">
                      Tujuan Pengiriman
                    </div>
                    <div className="font-medium text-zinc-200 text-sm">
                      {order.customerName}
                    </div>
                    <div className="text-zinc-400">{order.customerPhone}</div>
                    {order.shippingAddress && (
                      <div className="text-zinc-400 leading-relaxed text-[11px] mt-1 bg-zinc-900/60 p-2 rounded border border-zinc-800/60">
                        {order.shippingAddress.street}, {order.shippingAddress.city},{' '}
                        {order.shippingAddress.province} {order.shippingAddress.postalCode}
                      </div>
                    )}
                    {order.paymentMethod && (
                      <div className="text-[11px] text-zinc-500">
                        Metode Bayar: <span className="text-zinc-400">{order.paymentMethod}</span>
                      </div>
                    )}
                  </div>

                  {/* Middle (Col 6-9): Ordered Items */}
                  <div className="lg:col-span-4 space-y-1.5">
                    <div className="text-[11px] uppercase font-mono tracking-wider text-zinc-500">
                      Barang Pesanan ({order.items.reduce((s, it) => s + it.quantity, 0)} pcs)
                    </div>
                    <ul className="space-y-1 divide-y divide-zinc-800/40">
                      {order.items.map((item, idx) => (
                        <li key={idx} className="pt-1 first:pt-0 flex justify-between gap-2">
                          <span className="text-zinc-300">
                            {item.quantity}x {item.productName}
                          </span>
                          <span className="font-mono text-zinc-400 whitespace-nowrap">
                            Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="pt-2 flex justify-between font-medium border-t border-zinc-800/60">
                      <span className="text-zinc-400">Total Transaksi</span>
                      <span className="font-mono text-amber-300 text-sm font-semibold">
                        Rp {order.totalAmount.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  {/* Right (Col 10-12): Logistics Tracking & Quick Action */}
                  <div className="lg:col-span-3 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="text-[11px] uppercase font-mono tracking-wider text-zinc-500">
                        Logistik & Resi
                      </div>
                      {order.trackingNumber ? (
                        <div className="mt-1.5 p-2 rounded bg-zinc-900/80 border border-zinc-800 text-[11px]">
                          <div className="text-zinc-400">Nomor Resi / AWB:</div>
                          <div className="font-mono font-medium text-emerald-400 break-all select-all mt-0.5">
                            {order.trackingNumber}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-1 text-zinc-500 italic text-[11px]">
                          Belum diterbitkan resi pengiriman
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2">
                      {order.status === 'PAID' && (
                        <button
                          type="button"
                          onClick={() => handlePackOrder(order)}
                          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded bg-sky-500 hover:bg-sky-400 text-zinc-950 font-medium text-xs transition-colors shadow-sm"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Kemas Pesanan
                        </button>
                      )}

                      {order.status === 'PACKED' && (
                        <button
                          type="button"
                          onClick={() => handleOpenShipModal(order)}
                          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded bg-amber-500 hover:bg-amber-400 text-zinc-950 font-medium text-xs transition-colors shadow-sm"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          Input Resi & Kirim
                        </button>
                      )}

                      {order.status === 'SHIPPED' && (
                        <div className="text-center text-[11px] text-zinc-400 bg-zinc-800/40 py-1.5 rounded border border-zinc-800">
                          Sedang dalam perjalanan kurir
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Input Resi & Dispatch Courier */}
      {shippingModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#12141a] border border-zinc-800 w-full max-w-md rounded-xl shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <h3 className="text-base font-semibold text-zinc-100 font-display">
                  Pemberangkatan Kurir & Resi
                </h3>
                <div className="text-xs text-zinc-400 font-mono mt-0.5">
                  {shippingModalOrder.orderNumber} · {shippingModalOrder.customerName}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShippingModalOrder(null)}
                className="text-zinc-400 hover:text-zinc-200 text-sm p-1 rounded"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitShipment} className="mt-4 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-zinc-300 font-medium mb-1.5">
                  Pilih Mitra Kurir Logistik
                </label>
                <select
                  value={selectedCourier}
                  onChange={(e) => setSelectedCourier(e.target.value)}
                  className="w-full bg-[#181a22] border border-zinc-700 rounded-md px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-400"
                >
                  {COURIER_OPTIONS.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1.5">
                  Nomor Resi / AWB Pengiriman
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: JNE0019283719"
                  value={trackingNumberInput}
                  onChange={(e) => setTrackingNumberInput(e.target.value)}
                  className="w-full bg-[#181a22] border border-zinc-700 rounded-md px-3 py-2 font-mono text-zinc-100 focus:outline-none focus:border-amber-400"
                />
                <p className="text-[11px] text-zinc-500 mt-1">
                  Nomor ini akan langsung tertera di portal riwayat pesanan pelanggan.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShippingModalOrder(null)}
                  className="px-4 py-2 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition-colors text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-amber-500 hover:bg-amber-400 text-zinc-950 font-medium transition-colors text-xs"
                >
                  Konfirmasi Pengiriman
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
