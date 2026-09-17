'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { Booking, BookingStatus, SensoryProfile } from '@/types';
import { INITIAL_BOOKINGS, BRANCHES_DATA, CAPSTERS_DATA, SERVICES_DATA } from '@/lib/mock/data';

interface CreateConciergeBookingInput {
  id?: string;
  bookingNumber?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  branchId: string;
  branchName?: string;
  capsterId: string;
  capsterName?: string;
  serviceId: string;
  serviceName?: string;
  servicePrice: number;
  date: string;
  timeSlot: string;
  status?: BookingStatus;
  sensoryProfile?: SensoryProfile;
  notes?: string;
}

interface BookingStoreContextType {
  bookings: Booking[];
  sensoryProfiles: SensoryProfile[];
  isLoaded: boolean;
  updateBookingStatus: (bookingId: string, status: BookingStatus) => void;
  addSensoryNote: (
    bookingId: string,
    formulaNotes: string,
    scalpCondition?: string,
    additionalSensory?: Partial<SensoryProfile>
  ) => void;
  rescheduleBooking: (bookingId: string, newDate: string, newTime: string) => void;
  createConciergeBooking: (data: CreateConciergeBookingInput) => Booking;
  addBooking: (booking: Booking) => void;
  getBookingsByBranch: (branchId: string, date?: string) => Booking[];
  getClientHistory: (phoneOrName: string) => Booking[];
}

const STORAGE_KEY = 'atmos_bookings_store_v1';

// Dynamic helper to ensure appointments always exist for today
function getTodayDateString(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

const SEED_DATE = '2026-09-17';

export const COMPREHENSIVE_INITIAL_BOOKINGS: Booking[] = [
  // Today's Senopati Sanctuary Board (Active Pipeline)
  {
    id: 'bk-seno-01',
    bookingNumber: 'ATM-BK-260917-01',
    customerId: 'cust-01',
    customerName: 'Farhan Alamsyah',
    customerPhone: '081234567890',
    customerEmail: 'farhan.alamsyah@example.com',
    branchId: 'senopati',
    branchName: 'ATMOS Senopati Sanctuary',
    capsterId: 'st-01',
    capsterName: 'Kenji Takahashi',
    serviceId: 'signature-cut',
    serviceName: 'ATMOS Signature Sensory Haircut',
    servicePrice: 325000,
    date: SEED_DATE,
    timeSlot: '09:00',
    status: 'COMPLETED',
    sensoryProfile: {
      scentPreference: 'Sandalwood & Bergamot',
      beveragePreference: 'Artisan Cold Brew',
      conversationPreference: 'SILENT',
      scalpCondition: 'Normal to Dry',
      notes: 'Fade #1.5 tapering ke #2 scissor crop. Kulit kepala bersih terhidrasi tonic No.03.',
    },
    notes: 'Klien menyukai kompres handuk ekstra hangat.',
    createdAt: '2026-09-15T08:00:00Z',
  },
  {
    id: 'bk-seno-02',
    bookingNumber: 'ATM-BK-260917-02',
    customerId: 'cust-02',
    customerName: 'Nicholas Surya',
    customerPhone: '081288990011',
    customerEmail: 'surya.nicholas@example.com',
    branchId: 'senopati',
    branchName: 'ATMOS Senopati Sanctuary',
    capsterId: 'st-01',
    capsterName: 'Kenji Takahashi',
    serviceId: 'japanese-headspa',
    serviceName: 'Japanese Head-Spa & Scalp Detox',
    servicePrice: 450000,
    date: SEED_DATE,
    timeSlot: '10:30',
    status: 'IN_SERVICE',
    sensoryProfile: {
      scentPreference: 'Hinoki & Cedarwood',
      beveragePreference: 'Warm Herbal Tea',
      conversationPreference: 'SILENT',
      scalpCondition: 'Sensitif / Sedikit Kemerahan',
      notes: 'Pijatan akupresur leher 25 menit, sirkulasi water-loop aromatik.',
    },
    notes: 'Prioritaskan mode hening (Silent Chair).',
    createdAt: '2026-09-16T11:20:00Z',
  },
  {
    id: 'bk-seno-03',
    bookingNumber: 'ATM-BK-260917-03',
    customerId: 'cust-03',
    customerName: 'Dimas Wicaksono',
    customerPhone: '081399887766',
    customerEmail: 'dimas.w@example.com',
    branchId: 'senopati',
    branchName: 'ATMOS Senopati Sanctuary',
    capsterId: 'st-02',
    capsterName: 'Arya Wicaksono',
    serviceId: 'signature-cut',
    serviceName: 'ATMOS Signature Sensory Haircut',
    servicePrice: 325000,
    date: SEED_DATE,
    timeSlot: '11:45',
    status: 'CHECKED_IN',
    sensoryProfile: {
      scentPreference: 'Japanese Yuzu & Peppermint',
      beveragePreference: 'Artisan Cold Brew',
      conversationPreference: 'ESSENTIALS_ONLY',
      scalpCondition: 'Normal',
      notes: 'Classic side-part textured, pomade matte clay No. 02.',
    },
    notes: 'Tamu sudah tiba di lounge santai.',
    createdAt: '2026-09-16T15:00:00Z',
  },
  {
    id: 'bk-seno-04',
    bookingNumber: 'ATM-BK-260917-04',
    customerId: 'cust-04',
    customerName: 'Adrian Hadinata',
    customerPhone: '081122334455',
    customerEmail: 'adrian.h@example.com',
    branchId: 'senopati',
    branchName: 'ATMOS Senopati Sanctuary',
    capsterId: 'st-01',
    capsterName: 'Kenji Takahashi',
    serviceId: 'executive-ritual',
    serviceName: 'Executive Decompression Ritual',
    servicePrice: 580000,
    date: SEED_DATE,
    timeSlot: '13:30',
    status: 'CONFIRMED',
    sensoryProfile: {
      scentPreference: 'Sandalwood & Bergamot',
      beveragePreference: 'Mineral Water',
      conversationPreference: 'SILENT',
      scalpCondition: 'Normal to Oily',
    },
    notes: 'Reservasi VIP Concierge lewat WhatsApp.',
    createdAt: '2026-09-17T02:00:00Z',
  },
  {
    id: 'bk-seno-05',
    bookingNumber: 'ATM-BK-260917-05',
    customerId: 'cust-05',
    customerName: 'Kevin Sanjaya',
    customerPhone: '081700998877',
    customerEmail: 'kevin.s@example.com',
    branchId: 'senopati',
    branchName: 'ATMOS Senopati Sanctuary',
    capsterId: 'st-02',
    capsterName: 'Arya Wicaksono',
    serviceId: 'beard-architecture',
    serviceName: 'Precision Sculpt & Beard Architecture',
    servicePrice: 260000,
    date: SEED_DATE,
    timeSlot: '15:15',
    status: 'CONFIRMED',
    sensoryProfile: {
      scentPreference: 'Hinoki & Cedarwood',
      beveragePreference: 'Warm Herbal Tea',
      conversationPreference: 'LIGHT_CONVERSATION',
    },
    notes: 'Straight razor lining rahang simetris.',
    createdAt: '2026-09-17T04:15:00Z',
  },
  {
    id: 'bk-seno-06',
    bookingNumber: 'ATM-BK-260917-06',
    customerId: 'cust-06',
    customerName: 'Raditya Pratama',
    customerPhone: '081812345678',
    customerEmail: 'raditya.p@example.com',
    branchId: 'senopati',
    branchName: 'ATMOS Senopati Sanctuary',
    capsterId: 'st-01',
    capsterName: 'Kenji Takahashi',
    serviceId: 'signature-cut',
    serviceName: 'ATMOS Signature Sensory Haircut',
    servicePrice: 325000,
    date: SEED_DATE,
    timeSlot: '17:00',
    status: 'CONFIRMED',
    sensoryProfile: {
      scentPreference: 'Silver Birch & Cold Cedar',
      beveragePreference: 'Artisan Cold Brew',
      conversationPreference: 'ESSENTIALS_ONLY',
    },
    notes: 'Mohon siapkan headphone ASMR binaural audio.',
    createdAt: '2026-09-17T06:30:00Z',
  },
  // PIK Waterfront Branch Bookings
  {
    id: 'bk-pik-01',
    bookingNumber: 'ATM-BK-260917-07',
    customerId: 'cust-07',
    customerName: 'William Tanuwijaya',
    customerPhone: '081290123456',
    customerEmail: 'william.t@example.com',
    branchId: 'pik',
    branchName: 'ATMOS PIK Waterfront',
    capsterId: 'st-03',
    capsterName: 'Nadia Michelle',
    serviceId: 'japanese-headspa',
    serviceName: 'Japanese Head-Spa & Scalp Detox',
    servicePrice: 450000,
    date: SEED_DATE,
    timeSlot: '11:00',
    status: 'IN_SERVICE',
    sensoryProfile: {
      scentPreference: 'Japanese Yuzu & Peppermint',
      beveragePreference: 'Warm Herbal Tea',
      conversationPreference: 'SILENT',
      scalpCondition: 'Kering & Sensitif',
      notes: 'Perawatan hydro-loop 30 menit, serum elixir No. 01.',
    },
    notes: 'Kamar privat ocean view.',
    createdAt: '2026-09-16T10:00:00Z',
  },
  {
    id: 'bk-pik-02',
    bookingNumber: 'ATM-BK-260917-08',
    customerId: 'cust-08',
    customerName: 'Jessica Halim',
    customerPhone: '081387654321',
    customerEmail: 'jessica.h@example.com',
    branchId: 'pik',
    branchName: 'ATMOS PIK Waterfront',
    capsterId: 'st-03',
    capsterName: 'Nadia Michelle',
    serviceId: 'womens-botanical',
    serviceName: "Women's Layering Cut & Botanical Infusion",
    servicePrice: 380000,
    date: SEED_DATE,
    timeSlot: '14:00',
    status: 'CONFIRMED',
    sensoryProfile: {
      scentPreference: 'Sandalwood & Bergamot',
      beveragePreference: 'Warm Herbal Tea',
      conversationPreference: 'LIGHT_CONVERSATION',
    },
    notes: 'Masker sutra organik & uap nano.',
    createdAt: '2026-09-17T01:00:00Z',
  },
  // BSD Branch Booking
  {
    id: 'bk-bsd-01',
    bookingNumber: 'ATM-BK-260917-09',
    customerId: 'cust-09',
    customerName: 'Anton Setiawan',
    customerPhone: '081512344321',
    branchId: 'bsd',
    branchName: 'ATMOS The Breeze BSD',
    capsterId: 'st-04',
    capsterName: 'Bima Santoso',
    serviceId: 'signature-cut',
    serviceName: 'ATMOS Signature Sensory Haircut',
    servicePrice: 325000,
    date: SEED_DATE,
    timeSlot: '10:00',
    status: 'CHECKED_IN',
    sensoryProfile: {
      scentPreference: 'Hinoki & Cedarwood',
      beveragePreference: 'Artisan Cold Brew',
      conversationPreference: 'ESSENTIALS_ONLY',
    },
    notes: 'Low fade skin clean cut.',
    createdAt: '2026-09-16T09:00:00Z',
  },
  // Historical Completed Bookings (for Client Dossier & Past Sensory Profiles)
  {
    id: 'bk-hist-01',
    bookingNumber: 'ATM-BK-260902',
    customerId: 'cust-02',
    customerName: 'Nicholas Surya',
    customerPhone: '081288990011',
    customerEmail: 'surya.nicholas@example.com',
    branchId: 'senopati',
    branchName: 'ATMOS Senopati Sanctuary',
    capsterId: 'st-02',
    capsterName: 'Arya Wicaksono',
    serviceId: 'japanese-headspa',
    serviceName: 'Japanese Head-Spa & Scalp Detox',
    servicePrice: 450000,
    date: '2026-09-02',
    timeSlot: '15:15',
    status: 'COMPLETED',
    sensoryProfile: {
      scentPreference: 'Hinoki & Cedarwood',
      beveragePreference: 'Warm Herbal Tea',
      conversationPreference: 'ESSENTIALS_ONLY',
      scalpCondition: 'Kering, tegang area pelipis',
      notes: 'Aromaterapi Hinoki sangat menenangkan bagi klien. Disarankan bilas air hangat 38°C.',
    },
    createdAt: '2026-08-30T14:20:00Z',
  },
  {
    id: 'bk-hist-02',
    bookingNumber: 'ATM-BK-260818',
    customerId: 'cust-01',
    customerName: 'Farhan Alamsyah',
    customerPhone: '081234567890',
    customerEmail: 'farhan.alamsyah@example.com',
    branchId: 'senopati',
    branchName: 'ATMOS Senopati Sanctuary',
    capsterId: 'st-01',
    capsterName: 'Kenji Takahashi',
    serviceId: 'signature-cut',
    serviceName: 'ATMOS Signature Sensory Haircut',
    servicePrice: 325000,
    date: '2026-08-18',
    timeSlot: '14:00',
    status: 'COMPLETED',
    sensoryProfile: {
      scentPreference: 'Sandalwood & Bergamot',
      beveragePreference: 'Artisan Cold Brew',
      conversationPreference: 'SILENT',
      scalpCondition: 'Normal Sehat',
      notes: 'Formula taper: Clipper #2 open guard samping, top scissor 3cm texturing.',
    },
    createdAt: '2026-08-15T10:00:00Z',
  },
  {
    id: 'bk-hist-03',
    bookingNumber: 'ATM-BK-260905',
    customerId: 'cust-03',
    customerName: 'Dimas Wicaksono',
    customerPhone: '081399887766',
    customerEmail: 'dimas.w@example.com',
    branchId: 'senopati',
    branchName: 'ATMOS Senopati Sanctuary',
    capsterId: 'st-02',
    capsterName: 'Arya Wicaksono',
    serviceId: 'beard-architecture',
    serviceName: 'Precision Sculpt & Beard Architecture',
    servicePrice: 260000,
    date: '2026-09-05',
    timeSlot: '16:00',
    status: 'COMPLETED',
    sensoryProfile: {
      scentPreference: 'Japanese Yuzu & Peppermint',
      beveragePreference: 'Mineral Water',
      conversationPreference: 'LIGHT_CONVERSATION',
      scalpCondition: 'Normal',
      notes: 'Rahang simetris dibentuk rapi, after-shave balm dingin melembutkan kulit leher.',
    },
    createdAt: '2026-09-03T11:00:00Z',
  },
];

const BookingContext = createContext<BookingStoreContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize and ensure seeds for today's real client date as well as timeline date
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: Booking[] = JSON.parse(stored);
        setBookings(parsed);
      } else {
        // Prepare initial seed, also duplicating active ones for today if different from SEED_DATE
        const todayStr = getTodayDateString();
        let initialList = [...COMPREHENSIVE_INITIAL_BOOKINGS];

        if (todayStr !== SEED_DATE) {
          const duplicatedForToday: Booking[] = COMPREHENSIVE_INITIAL_BOOKINGS.filter(
            (b) => b.date === SEED_DATE
          ).map((b) => ({
            ...b,
            id: `${b.id}-today`,
            date: todayStr,
            createdAt: new Date().toISOString(),
          }));
          initialList = [...initialList, ...duplicatedForToday];
        }

        setBookings(initialList);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialList));
      }
    } catch (e) {
      console.warn('Failed to load bookings from storage:', e);
      setBookings(COMPREHENSIVE_INITIAL_BOOKINGS);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveBookings = useCallback((newBookings: Booking[]) => {
    setBookings(newBookings);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newBookings));
    } catch (e) {
      console.warn('Failed to persist bookings:', e);
    }
  }, []);

  // Update status single-click transitions (CONFIRMED -> CHECKED_IN -> IN_SERVICE -> COMPLETED)
  const updateBookingStatus = useCallback(
    (bookingId: string, status: BookingStatus) => {
      setBookings((prev) => {
        const updated = prev.map((item) =>
          item.id === bookingId
            ? { ...item, status, updatedAt: new Date().toISOString() }
            : item
        );
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {
          console.warn('Failed to persist status change:', e);
        }
        return updated;
      });
    },
    []
  );

  // Add sensory notes and complete service
  const addSensoryNote = useCallback(
    (
      bookingId: string,
      formulaNotes: string,
      scalpCondition?: string,
      additionalSensory?: Partial<SensoryProfile>
    ) => {
      setBookings((prev) => {
        const updated = prev.map((item) => {
          if (item.id === bookingId) {
            const mergedSensory: SensoryProfile = {
              ...(item.sensoryProfile || {}),
              ...(additionalSensory || {}),
              scalpCondition: scalpCondition || item.sensoryProfile?.scalpCondition,
              notes: formulaNotes || item.sensoryProfile?.notes,
            };

            return {
              ...item,
              status: 'COMPLETED' as BookingStatus,
              sensoryProfile: mergedSensory,
              updatedAt: new Date().toISOString(),
            };
          }
          return item;
        });

        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {
          console.warn('Failed to persist sensory notes:', e);
        }
        return updated;
      });
    },
    []
  );

  // Reschedule booking
  const rescheduleBooking = useCallback(
    (bookingId: string, newDate: string, newTime: string) => {
      setBookings((prev) => {
        const updated = prev.map((item) => {
          if (item.id === bookingId) {
            return {
              ...item,
              date: newDate,
              timeSlot: newTime,
              status: 'CONFIRMED' as BookingStatus,
              updatedAt: new Date().toISOString(),
            };
          }
          return item;
        });

        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {
          console.warn('Failed to persist reschedule:', e);
        }
        return updated;
      });
    },
    []
  );

  // Create fast VIP / Receptionist concierge booking
  const createConciergeBooking = useCallback(
    (data: CreateConciergeBookingInput): Booking => {
      const newBooking: Booking = {
        id: data.id || `bk-concierge-${Date.now()}`,
        bookingNumber: data.bookingNumber || `ATM-VIP-${Math.floor(100000 + Math.random() * 900000)}`,
        customerId: `cust-${Date.now()}`,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail,
        branchId: data.branchId,
        branchName: data.branchName,
        capsterId: data.capsterId,
        capsterName: data.capsterName,
        serviceId: data.serviceId,
        serviceName: data.serviceName,
        servicePrice: data.servicePrice,
        date: data.date,
        timeSlot: data.timeSlot,
        status: data.status || 'CONFIRMED',
        sensoryProfile: data.sensoryProfile,
        notes: data.notes,
        createdAt: new Date().toISOString(),
      };

      setBookings((prev) => {
        const updated = [newBooking, ...prev];
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {
          console.warn('Failed to persist new concierge booking:', e);
        }
        return updated;
      });

      return newBooking;
    },
    []
  );

  // Directly insert booking into store
  const addBooking = useCallback((booking: Booking) => {
    setBookings((prev) => {
      const updated = [booking, ...prev];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to persist booking:', e);
      }
      return updated;
    });
  }, []);

  // Filter bookings by branch and optional date
  const getBookingsByBranch = useCallback(
    (branchId: string, date?: string): Booking[] => {
      return bookings
        .filter((b) => {
          const matchBranch = !branchId || branchId === 'all' || b.branchId === branchId;
          const matchDate = !date || b.date === date;
          return matchBranch && matchDate;
        })
        .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
    },
    [bookings]
  );

  // Retrieve client historical records by phone or name
  const getClientHistory = useCallback(
    (phoneOrName: string): Booking[] => {
      const q = phoneOrName.trim().toLowerCase();
      if (!q) return [];
      return bookings.filter(
        (b) =>
          b.customerPhone.toLowerCase().includes(q) ||
          b.customerName.toLowerCase().includes(q)
      );
    },
    [bookings]
  );

  // Sensory profiles collection from all recorded bookings
  const sensoryProfiles = useMemo(() => {
    const list: SensoryProfile[] = [];
    bookings.forEach((b) => {
      if (b.sensoryProfile && (b.sensoryProfile.notes || b.sensoryProfile.scentPreference)) {
        list.push(b.sensoryProfile);
      }
    });
    return list;
  }, [bookings]);

  const value = useMemo(
    () => ({
      bookings,
      sensoryProfiles,
      isLoaded,
      updateBookingStatus,
      addSensoryNote,
      rescheduleBooking,
      createConciergeBooking,
      addBooking,
      getBookingsByBranch,
      getClientHistory,
    }),
    [
      bookings,
      sensoryProfiles,
      isLoaded,
      updateBookingStatus,
      addSensoryNote,
      rescheduleBooking,
      createConciergeBooking,
      addBooking,
      getBookingsByBranch,
      getClientHistory,
    ]
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBookingStore(): BookingStoreContextType {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBookingStore must be used within a BookingProvider');
  }
  return context;
}
