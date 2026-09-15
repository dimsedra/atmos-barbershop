import React, { useState } from 'react';
import { SERVICES_DATA } from '../data/services';
import { ServiceItem } from '../types';

interface ServicesProps {
  onSelectService: (service: ServiceItem) => void;
}

export const ServicesSection: React.FC<ServicesProps> = ({ onSelectService }) => {
  const [activeFilter, setActiveFilter] = useState<string>('Semua');

  const filteredServices = SERVICES_DATA.filter((srv) => {
    if (activeFilter === 'Semua') return true;
    if (activeFilter === 'Pria') return srv.targetAudience === 'Pria' || srv.targetAudience === 'Pria & Wanita' || srv.targetAudience === 'Unisex';
    if (activeFilter === 'Wanita') return srv.targetAudience === 'Wanita' || srv.targetAudience === 'Pria & Wanita' || srv.targetAudience === 'Unisex';
    return true;
  });

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <section id="services" className="py-24 md:py-32 xl:py-36 bg-[#F8F7F4] border-b border-[#E6E4DF]">
      <div className="max-w-7xl 2xl:max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 space-y-16">
        
        {/* Header & Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-[#E6E4DF]">
          <div className="space-y-3">
            <div className="text-xs font-mono tracking-widest text-[#8A7862] uppercase">
              KATALOG LAYANAN
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#121214] tracking-tight">
              Layanan Pangkas & Terapi
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 max-w-xl font-normal">
              Seluruh sesi sudah termasuk konsultasi bentuk wajah, pencucian kulit kepala, serta pijat relaksasi leher dan pundak.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 self-start md:self-auto bg-[#EFECE6] p-1.5 rounded-full border border-[#E6E4DF]">
            {['Semua', 'Pria', 'Wanita'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-5 py-2 rounded-full text-xs font-mono tracking-wider uppercase transition-all cursor-pointer ${
                  activeFilter === tab
                    ? 'bg-[#121214] text-white shadow-xs'
                    : 'text-zinc-600 hover:text-[#121214]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid with Architectural Rhythm */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-10">
          {filteredServices.map((service, index) => {
            const indexStr = `0${index + 1}`;
            return (
              <div
                key={service.id}
                className="bg-white rounded-3xl border border-[#E6E4DF] p-6 sm:p-7 flex flex-col justify-between group hover:border-zinc-400 transition-all duration-300 shadow-[0_2px_12px_rgba(0,0,0,0.02)]"
              >
                <div>
                  {/* Visual Header */}
                  <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-zinc-100 mb-6 border border-[#E6E4DF]/80">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#121214]/80 backdrop-blur-xs text-[10px] font-mono text-white tracking-wider uppercase">
                      {service.duration} Menit
                    </div>
                  </div>

                  {/* Metadata & Title */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-mono text-[#8A7862]">
                      <span className="uppercase tracking-wider">{service.targetAudience}</span>
                      <span className="text-zinc-400">{indexStr}</span>
                    </div>

                    <h3 className="font-display text-xl sm:text-2xl font-bold text-[#121214] group-hover:text-zinc-700 transition-colors leading-snug">
                      {service.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal">
                      {service.subtitle}
                    </p>
                  </div>
                </div>

                {/* Price & Action */}
                <div className="pt-6 mt-6 border-t border-[#EFECE6] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-400 block uppercase">Harga Sesi</span>
                    <span className="font-display text-lg font-bold text-[#121214]">
                      {formatRupiah(service.price)}
                    </span>
                  </div>
                  <button
                    onClick={() => onSelectService(service)}
                    className="px-5 py-2.5 rounded-full bg-[#121214] hover:bg-zinc-800 text-white text-xs font-mono tracking-wider uppercase transition-colors cursor-pointer"
                  >
                    Pilih Layanan
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
