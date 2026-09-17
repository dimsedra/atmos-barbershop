import React from 'react';

export const WhyUsSection: React.FC = () => {
  const principles = [
    {
      number: '01',
      title: 'Anatomi Wajah',
      description: 'Potongan disesuaikan dengan struktur tulang rahang, tekstur helai, dan arah jatuh rambut alami.',
    },
    {
      number: '02',
      title: '100% By Appointment',
      description: 'Satu slot waktu khusus untuk Anda. Tanpa antrean ruang tunggu dan tanpa kebisingan salon umum.',
    },
    {
      number: '03',
      title: 'Ritual Relaksasi',
      description: 'Setiap sesi sudah termasuk keramas pembersih sebum, pijat leher-pundak, dan kompres handuk hangat.',
    },
  ];

  return (
    <section id="why-us" className="py-24 md:py-32 xl:py-36 bg-[#0D0D10] text-white border-b border-[#22222A]">
      <div className="max-w-7xl 2xl:max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 space-y-20 lg:space-y-24">
        
        {/* Top Editorial Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end pb-12 border-b border-[#22222A]">
          <div className="lg:col-span-6 space-y-3">
            <div className="text-xs font-mono tracking-widest text-[#BFA888] uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#BFA888]" />
              <span>STANDAR & FILOSOFI</span>
            </div>
            <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[0.98]">
              Mengapa ATMOS.
            </h2>
          </div>

          <div className="lg:col-span-6 lg:text-right">
            <p className="text-sm sm:text-base text-zinc-400 font-normal max-w-md lg:ml-auto leading-relaxed">
              Tiga komitmen baku yang kami jaga di setiap detik kunjungan Anda di seluruh studio Jabodetabek.
            </p>
          </div>
        </div>

        {/* 3 Principles with Sculptural Numbers & Typographic Tension */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 xl:gap-16">
          {principles.map((p) => (
            <div key={p.number} className="space-y-5 group">
              <div className="flex items-center gap-4">
                <span className="font-display text-3xl sm:text-4xl font-bold text-[#BFA888] tracking-tight">
                  {p.number}
                </span>
                <span className="h-px flex-1 bg-[#262630] group-hover:bg-[#BFA888]/40 transition-colors" />
              </div>

              <h3 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {p.title}
              </h3>

              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed font-normal">
                {p.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
