import React from 'react';

export const TestimonialsSection: React.FC = () => {
  const reviews = [
    {
      name: 'Reza Pratama',
      role: 'SCBD, Jakarta Selatan',
      service: 'Precision Cut & Scalp Wash',
      comment:
        'Ketenangan yang sesungguhnya di tengah padatnya kota. Pijat pundak dan leher sangat profesional, potongan rambut presisi dan rapi selama berminggu-minggu.',
    },
    {
      name: 'Jessica Halim',
      role: 'PIK, Jakarta Utara',
      service: 'Hair Layering & Scalp Therapy',
      comment:
        'Studio yang bersih, hening, dan terjadwal tepat waktu. Teknik guntingan sangat detail untuk rambut berlayer dan bebas dari kebisingan salon umum.',
    },
    {
      name: 'Adrian Kusuma',
      role: 'Senopati, Jakarta Selatan',
      service: 'Signature Cut & Head Spa',
      comment:
        'Konsistensi kualitas di seluruh cabang ATMOS sangat terjaga. Sistem reservasi tanpa antre membuat sesi perawatan benar-benar efisien dan menenangkan.',
    },
  ];

  return (
    <section className="py-24 md:py-32 xl:py-36 bg-[#0D0D10] text-white border-b border-[#22222A]">
      <div className="max-w-7xl 2xl:max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 space-y-16">
        
        {/* Header */}
        <div className="pb-10 border-b border-[#22222A] flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="text-xs font-mono tracking-widest text-[#BFA888] uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#BFA888]" />
              <span>TESTIMONI TAMU</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
              Pengalaman Tamu
            </h2>
          </div>
          <p className="text-sm sm:text-base text-zinc-400 font-normal max-w-md md:text-right">
            Ulasan nyata dari para tamu yang mempercayakan perawatan rambut dan relaksasi kepala di ATMOS.
          </p>
        </div>

        {/* 3 Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 xl:gap-10 text-left">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="bg-[#141418] rounded-3xl p-8 xl:p-10 border border-[#262630] flex flex-col justify-between space-y-8 hover:border-zinc-600 transition-colors shadow-[0_4px_24px_rgba(0,0,0,0.15)]"
            >
              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-normal">
                "{rev.comment}"
              </p>
              
              <div className="pt-4 border-t border-[#22222A] space-y-1">
                <div className="font-display text-base font-bold text-white">
                  {rev.name}
                </div>
                <div className="text-xs font-mono text-[#BFA888]">
                  {rev.role}
                </div>
                <div className="text-[11px] font-mono text-zinc-500">
                  {rev.service}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
