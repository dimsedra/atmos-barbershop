import React, { useState } from 'react';
import { ShoppingBag, Check } from 'lucide-react';
import { PRODUCTS_DATA } from '../data/products';
import { ProductItem } from '../types';

interface ShopProps {
  onSelectProduct: (product: ProductItem) => void;
  onAddToCart: (product: ProductItem) => void;
}

export const ShopSection: React.FC<ShopProps> = ({ onSelectProduct, onAddToCart }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [addedNotice, setAddedNotice] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'Semua' },
    { id: 'scalp', label: 'Kulit Kepala' },
    { id: 'styling', label: 'Styling' },
    { id: 'mist', label: 'Tonic & Mist' },
    { id: 'bundle', label: 'Set Bundling' },
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
    onAddToCart(product);
    setAddedNotice(product.id);
    setTimeout(() => setAddedNotice(null), 2000);
  };

  return (
    <section id="shop" className="py-24 md:py-32 xl:py-36 bg-[#F8F7F4] border-b border-[#E6E4DF]">
      <div className="max-w-7xl 2xl:max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 space-y-16">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-[#E6E4DF]">
          <div className="space-y-3">
            <div className="text-xs font-mono tracking-widest text-[#8A7862] uppercase">
              APOTHECARY & FORMULA
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#121214] tracking-tight">
              Produk Perawatan
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 max-w-xl font-normal">
              Formulasi perawatan rambut dan kulit kepala standar salon untuk menjaga hasil pangkas di rumah.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto bg-[#EFECE6] p-1.5 rounded-full border border-[#E6E4DF]">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-mono tracking-wider uppercase transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#121214] text-white shadow-xs'
                    : 'text-zinc-600 hover:text-[#121214]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-10">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => onSelectProduct(product)}
              className="bg-white rounded-3xl border border-[#E6E4DF] p-6 sm:p-7 flex flex-col justify-between group cursor-pointer hover:border-zinc-400 transition-all duration-300 shadow-[0_2px_12px_rgba(0,0,0,0.02)]"
            >
              <div>
                {/* Product Image Canvas */}
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
                  <h3 className="font-display text-lg xl:text-xl font-bold text-[#121214] group-hover:text-zinc-700 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 line-clamp-2 leading-relaxed font-normal">
                    {product.tagline}
                  </p>
                </div>
              </div>

              {/* Price & Add to Cart */}
              <div className="pt-6 mt-6 border-t border-[#EFECE6] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 block uppercase">Harga</span>
                  <span className="font-display text-base xl:text-lg font-bold text-[#121214]">
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
                      <span>Tambah</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
