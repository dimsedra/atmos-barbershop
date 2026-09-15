import React, { useState } from 'react';
import { X, Check, ShoppingBag } from 'lucide-react';
import { ProductItem } from '../types';

interface ProductDetailModalProps {
  product: ProductItem | null;
  onClose: () => void;
  onAddToCart: (product: ProductItem) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  const [justAdded, setJustAdded] = useState(false);

  if (!product) return null;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const handleAdd = () => {
    onAddToCart(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="relative w-full max-w-xl md:max-w-2xl bg-white rounded-3xl shadow-xl border border-zinc-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <span>{product.number}</span>
            <span>•</span>
            <span className="uppercase">{product.category}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            <div className="aspect-square rounded-xl bg-zinc-50 p-6 flex items-center justify-center border border-zinc-100">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-xs text-zinc-400 font-medium">{product.volume}</span>
                <h3 className="font-display text-xl font-bold text-zinc-950 mt-0.5">
                  {product.name}
                </h3>
                <div className="font-display text-xl font-bold text-zinc-950 mt-1">
                  {formatRupiah(product.price)}
                </div>
              </div>

              <p className="text-xs text-zinc-600 leading-relaxed font-normal">
                {product.tagline}
              </p>

              {product.scentNotes && product.scentNotes.length > 0 && (
                <div className="space-y-1 pt-2 border-t border-zinc-100 text-xs text-zinc-500">
                  <span className="font-medium text-zinc-700">Aroma: </span>
                  <span>{product.scentNotes.join(', ')}</span>
                </div>
              )}
            </div>
          </div>

          {product.benefits && product.benefits.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-zinc-100">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Manfaat
              </div>
              <div className="flex flex-wrap gap-1.5">
                {product.benefits.map((b, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md bg-zinc-100 text-[11px] text-zinc-700"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>
          )}

          {product.ingredients && (
            <div className="space-y-1">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Kandungan Utama
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed font-mono">
                {product.ingredients}
              </p>
            </div>
          )}
        </div>

        {/* Footer Action */}
        <div className="p-6 border-t border-zinc-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full border border-zinc-200 text-zinc-700 text-xs font-semibold uppercase tracking-wider hover:bg-zinc-50 transition-colors"
          >
            Tutup
          </button>

          <button
            onClick={handleAdd}
            className="px-6 py-2.5 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
          >
            {justAdded ? (
              <>
                <Check className="w-4 h-4" />
                <span>Berhasil Ditambahkan</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>Tambah ke Keranjang</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
