'use client';

import React, { useState } from 'react';
import { ShoppingBag, Check, Sparkles, ArrowRight } from 'lucide-react';
import { PRODUCTS_DATA } from '@/lib/mock/data';
import { ProductItem } from '@/types';
import { useCart } from '@/context/CartContext';
import { ProductDetailModal } from '@/components/public/ProductDetailModal';

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [addedNotice, setAddedNotice] = useState<string | null>(null);

  const { addToCart, openCart } = useCart();

  const categories = [
    { id: 'all', label: 'Semua Produk' },
    { id: 'scalp', label: 'Kulit Kepala & Folikel' },
    { id: 'styling', label: 'Penataan & Pomade' },
    { id: 'mist', label: 'Tonic & Texturizer' },
    { id: 'bundle', label: 'Ritual Bundle' },
  ];

  const filteredProducts = PRODUCTS_DATA.filter((p) => {
    if (selectedCategory === 'all') return true;
    return p.category === selectedCategory;
  });

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const handleQuickAdd = (product: ProductItem, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    setAddedNotice(product.id);
    setTimeout(() => setAddedNotice(null), 2000);
  };

  return (
    <div className="py-12 md:py-20 max-w-7xl 2xl:max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 space-y-16">
      
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFECE6] border border-[#E6E4DF] text-[11px] font-mono tracking-wider text-zinc-800 uppercase">
          <Sparkles className="w-3.5 h-3.5 text-[#8A7862]" />
          <span>Apothecary & Ritual Rumah</span>
        </div>
        <h1 className="font-display text-3xl sm:text-5xl font-bold text-zinc-950 tracking-tight">
          Formulasi Perawatan Rambut
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 leading-relaxed font-normal">
          Perawatan harian berstandar salon untuk menjaga kesehatan mikrobioma kulit kepala dan bentuk potongan rambut Anda di rumah.
        </p>
      </div>

      {/* Routine Guide Box (Restrained & Architectural) */}
      <div className="bg-[#0E0E11] text-white rounded-3xl p-8 sm:p-10 border border-[#22222A] relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="text-xs font-mono tracking-widest text-[#BFA888] uppercase">
            RITUAL 3-LANGKAH ATMOS
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold">
            Cara Menggunakan Produk Perawatan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="space-y-2">
              <span className="font-mono text-xs text-[#BFA888] font-bold">Langkah 01</span>
              <div className="font-display text-base font-bold">Detoks Pra-Keramas</div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Gunakan <em>Silver Birch Elixir (No. 01)</em> untuk membersihkan folikel dari minyak perkotaan.
              </p>
            </div>
            <div className="space-y-2">
              <span className="font-mono text-xs text-[#BFA888] font-bold">Langkah 02</span>
              <div className="font-display text-base font-bold">Stimulasi Dingin</div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Semprotkan <em>ASMR Acoustic Tonic (No. 03)</em> pada kulit kepala lembap untuk merangsang sirkulasi akar.
              </p>
            </div>
            <div className="space-y-2">
              <span className="font-mono text-xs text-[#BFA888] font-bold">Langkah 03</span>
              <div className="font-display text-base font-bold">Tekstur Matte Alami</div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Tata helai rambut dengan <em>White Kaolin Matte Clay (No. 02)</em> atau <em>Bamboo Mist (No. 04)</em>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories & Filter */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-[#E6E4DF]">
        <div className="flex flex-wrap items-center gap-2 bg-[#EFECE6] p-1.5 rounded-full border border-[#E6E4DF]">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-5 py-2 rounded-full text-xs font-mono tracking-wider uppercase transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#121214] text-white shadow-xs'
                  : 'text-zinc-600 hover:text-[#121214]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <button
          onClick={openCart}
          className="text-xs font-mono text-zinc-600 hover:text-zinc-950 flex items-center gap-2 cursor-pointer transition-colors"
        >
          <ShoppingBag className="w-4 h-4 text-zinc-500" />
          <span>Lihat Keranjang Belanja</span>
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-10">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            onClick={() => setSelectedProduct(product)}
            className="bg-white rounded-3xl border border-[#E6E4DF] p-6 sm:p-7 flex flex-col justify-between group cursor-pointer hover:border-zinc-400 transition-all duration-300 shadow-[0_2px_12px_rgba(0,0,0,0.02)]"
          >
            <div>
              {/* Image Box */}
              <div className="relative aspect-square rounded-2xl bg-[#F8F7F4] p-8 flex items-center justify-center mb-6 border border-[#E6E4DF]/60 transition-colors group-hover:bg-[#F2EFE9]">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain group-hover:scale-104 transition-transform duration-500"
                />
                <span className="absolute top-4 left-4 text-xs font-mono text-[#8A7862]">
                  {product.number}
                </span>
                <span className="absolute top-4 right-4 text-xs font-mono text-zinc-400">
                  {product.volume}
                </span>
              </div>

              {/* Details */}
              <div className="space-y-2">
                <div className="text-xs font-mono text-[#8A7862] uppercase tracking-wider">
                  {product.category}
                </div>
                <h3 className="font-display text-xl font-bold text-[#121214] group-hover:text-zinc-700 transition-colors">
                  {product.name}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 line-clamp-2 leading-relaxed font-normal">
                  {product.tagline}
                </p>
              </div>
            </div>

            {/* Price & Action */}
            <div className="pt-6 mt-6 border-t border-[#EFECE6] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-zinc-400 block uppercase">Harga</span>
                <span className="font-display text-lg font-bold text-[#121214]">
                  {formatRupiah(product.price)}
                </span>
              </div>

              <button
                onClick={(e) => handleQuickAdd(product, e)}
                className={`px-5 py-2.5 rounded-full text-xs font-mono tracking-wider uppercase flex items-center gap-2 transition-colors cursor-pointer ${
                  addedNotice === product.id
                    ? 'bg-[#121214] text-white'
                    : 'bg-[#EFECE6] hover:bg-[#121214] text-zinc-800 hover:text-white'
                }`}
              >
                {addedNotice === product.id ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Ditambahkan</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Beli</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(prod) => addToCart(prod)}
      />

    </div>
  );
}
