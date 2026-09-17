'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { BookingWizard } from '@/components/public/BookingWizard';

function BookingPageContent() {
  const searchParams = useSearchParams();
  const branchParam = searchParams.get('branch') || undefined;
  const serviceParam = searchParams.get('service') || undefined;
  const capsterParam = searchParams.get('capster') || undefined;

  return (
    <div className="py-12 md:py-20 max-w-4xl mx-auto px-6 sm:px-8">
      {/* Page Heading */}
      <div className="text-center space-y-4 mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFECE6] border border-[#E6E4DF] text-[11px] font-mono tracking-wider text-zinc-800 uppercase">
          <ShieldCheck className="w-3.5 h-3.5 text-[#8A7862]" />
          <span>Strictly By Appointment • 0 Antrean</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-950 tracking-tight">
          Reservasi Sesi Privat
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 max-w-xl mx-auto leading-relaxed">
          Pilih lokasi, layanan presisi, master barber, dan preferensi sensorik Anda untuk pengalaman relaksasi yang hening dan tanpa interupsi.
        </p>
      </div>

      {/* Booking Wizard Reusable Container */}
      <BookingWizard
        isModal={false}
        initialBranchId={branchParam}
        initialServiceId={serviceParam}
        initialCapsterId={capsterParam}
      />
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-sm font-mono text-zinc-400">Memuat formulir reservasi...</div>}>
      <BookingPageContent />
    </Suspense>
  );
}
