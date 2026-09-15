import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Clock, 
  Calendar as CalendarIcon, 
  ChevronRight, 
  ChevronLeft, 
  Check 
} from 'lucide-react';
import { BRANCHES_DATA } from '../data/branches';
import { SERVICES_DATA } from '../data/services';
import { ServiceItem, Branch } from '../types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBranchId?: string;
  initialService?: ServiceItem | null;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  initialBranchId,
  initialService,
}) => {
  const [step, setStep] = useState<number>(1);
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    initialBranchId || BRANCHES_DATA[0].id
  );
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    initialService ? initialService.id : SERVICES_DATA[0].id
  );
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [selectedTime, setSelectedTime] = useState<string>('14:00');
  const [guestName, setGuestName] = useState<string>('');
  const [guestPhone, setGuestPhone] = useState<string>('');
  const [guestNotes, setGuestNotes] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentBranch = BRANCHES_DATA.find((b) => b.id === selectedBranchId) || BRANCHES_DATA[0];
  const currentService = SERVICES_DATA.find((s) => s.id === selectedServiceId) || SERVICES_DATA[0];

  const timeSlots = [
    '10:00', '11:15', '12:30', '14:00', '15:15', '16:30', '18:00', '19:15', '20:30'
  ];

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !guestPhone) return;
    setIsSuccess(true);
  };

  const generateWhatsAppMessage = () => {
    const text = `Halo Concierge ATMOS, saya ingin mengonfirmasi reservasi sesi saya:%0A%0A` +
      `• Nama: ${guestName}%0A` +
      `• Cabang: ${currentBranch.name}%0A` +
      `• Layanan: ${currentService.title} (${currentService.duration} Menit)%0A` +
      `• Tanggal & Waktu: ${selectedDate} pukul ${selectedTime} WIB%0A` +
      `• Catatan Khusus: ${guestNotes || 'Tidak ada'}`;
    return `https://wa.me/${currentBranch.whatsapp}?text=${text}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="relative w-full max-w-xl sm:max-w-2xl bg-white rounded-3xl shadow-xl border border-zinc-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-zinc-950">
              Reservasi Sesi
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Khusus janji temu tanpa antre di 6 cabang Jabodetabek
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress */}
        {!isSuccess && (
          <div className="px-6 py-3 bg-zinc-50 border-b border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
            <span className={step === 1 ? 'font-bold text-zinc-950' : ''}>1. Cabang</span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-300" />
            <span className={step === 2 ? 'font-bold text-zinc-950' : ''}>2. Layanan</span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-300" />
            <span className={step === 3 ? 'font-bold text-zinc-950' : ''}>3. Waktu</span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-300" />
            <span className={step === 4 ? 'font-bold text-zinc-950' : ''}>4. Data Tamu</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {isSuccess ? (
            <div className="py-8 text-center space-y-6">
              <div className="w-12 h-12 rounded-full bg-zinc-950 text-white flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h4 className="font-display text-xl font-bold text-zinc-950">
                  Reservasi Tercatat
                </h4>
                <p className="text-xs sm:text-sm text-zinc-600 max-w-md mx-auto leading-relaxed">
                  Terima kasih, <strong>{guestName}</strong>. Detail reservasi Anda di <strong>{currentBranch.name}</strong> pada <strong>{selectedDate} ({selectedTime} WIB)</strong> telah siap.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-left space-y-2 text-xs text-zinc-700 max-w-md mx-auto">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Cabang:</span>
                  <span className="font-medium">{currentBranch.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Layanan:</span>
                  <span className="font-medium">{currentService.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Durasi & Biaya:</span>
                  <span className="font-medium">{currentService.duration} Menit • {formatRupiah(currentService.price)}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={generateWhatsAppMessage()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold uppercase tracking-wider text-center transition-colors"
                >
                  Konfirmasi via WhatsApp
                </a>
                <button
                  onClick={onClose}
                  className="px-6 py-3 rounded-full border border-zinc-200 hover:bg-zinc-50 text-zinc-800 text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  Selesai
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Step 1: Select Branch */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Pilih Lokasi Studio
                  </div>
                  <div className="space-y-2.5">
                    {BRANCHES_DATA.map((branch) => (
                      <div
                        key={branch.id}
                        onClick={() => setSelectedBranchId(branch.id)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          selectedBranchId === branch.id
                            ? 'border-zinc-950 bg-zinc-50'
                            : 'border-zinc-200 hover:border-zinc-300'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="font-display text-sm font-bold text-zinc-950">
                            {branch.name}
                          </div>
                          <div className="text-xs text-zinc-500 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                            <span>{branch.address}</span>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          selectedBranchId === branch.id
                            ? 'border-zinc-950 bg-zinc-950 text-white'
                            : 'border-zinc-300'
                        }`}>
                          {selectedBranchId === branch.id && <Check className="w-2.5 h-2.5" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Select Service */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Pilih Menu Layanan
                  </div>
                  <div className="space-y-2.5">
                    {SERVICES_DATA.map((srv) => (
                      <div
                        key={srv.id}
                        onClick={() => setSelectedServiceId(srv.id)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          selectedServiceId === srv.id
                            ? 'border-zinc-950 bg-zinc-50'
                            : 'border-zinc-200 hover:border-zinc-300'
                        }`}
                      >
                        <div className="space-y-1 pr-4">
                          <div className="flex items-center gap-2">
                            <span className="font-display text-sm font-bold text-zinc-950">
                              {srv.title}
                            </span>
                            <span className="text-[10px] font-medium text-zinc-400 uppercase">
                              • {srv.targetAudience}
                            </span>
                          </div>
                          <div className="text-xs text-zinc-500">
                            {srv.duration} Menit • {formatRupiah(srv.price)}
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border shrink-0 flex items-center justify-center ${
                          selectedServiceId === srv.id
                            ? 'border-zinc-950 bg-zinc-950 text-white'
                            : 'border-zinc-300'
                        }`}>
                          {selectedServiceId === srv.id && <Check className="w-2.5 h-2.5" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Date & Time */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                      Pilih Tanggal
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-900 focus:outline-none focus:border-zinc-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                      Pilih Jam Kunjungan
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setSelectedTime(time)}
                          className={`py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer border ${
                            selectedTime === time
                              ? 'bg-zinc-950 text-white border-zinc-950'
                              : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                          }`}
                        >
                          {time} WIB
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Guest Info */}
              {step === 4 && (
                <form onSubmit={handleConfirmBooking} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="e.g. Nicholas Surya"
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs sm:text-sm text-zinc-900 focus:outline-none focus:border-zinc-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Nomor WhatsApp
                    </label>
                    <input
                      type="tel"
                      required
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="e.g. 081288990011"
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs sm:text-sm text-zinc-900 focus:outline-none focus:border-zinc-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Catatan Tambahan (Opsional)
                    </label>
                    <textarea
                      rows={3}
                      value={guestNotes}
                      onChange={(e) => setGuestNotes(e.target.value)}
                      placeholder="Preferensi khusus atau informasi kondisi rambut..."
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs sm:text-sm text-zinc-900 focus:outline-none focus:border-zinc-900"
                    />
                  </div>
                </form>
              )}
            </>
          )}
        </div>

        {/* Footer Controls */}
        {!isSuccess && (
          <div className="p-6 border-t border-zinc-100 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 rounded-full border border-zinc-200 hover:bg-zinc-50 text-zinc-800 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Kembali</span>
              </button>
            ) : <div />}

            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-6 py-2.5 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Lanjut</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={!guestName || !guestPhone}
                className="px-6 py-2.5 rounded-full bg-zinc-950 hover:bg-zinc-800 disabled:bg-zinc-300 text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Konfirmasi Reservasi
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
