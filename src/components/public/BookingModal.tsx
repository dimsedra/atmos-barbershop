'use client';

import React from 'react';
import { BookingWizard } from './BookingWizard';
import { ServiceItem, Capster } from '@/types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBranchId?: string;
  initialService?: ServiceItem | null;
  initialCapster?: Capster | null;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  initialBranchId,
  initialService,
  initialCapster,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-xl sm:max-w-2xl bg-white rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden">
        <BookingWizard
          isModal={true}
          onClose={onClose}
          initialBranchId={initialBranchId}
          initialServiceId={initialService?.id}
          initialCapsterId={initialCapster?.id}
        />
      </div>
    </div>
  );
};
