'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { BranchExpense } from '@/types';
import { BRANCHES_DATA, CAPSTERS_DATA, PRODUCTS_DATA } from '@/lib/mock/data';
import { useBookingStore } from '@/lib/store/booking-store';
import { useInventoryStore } from '@/lib/store/inventory-store';

export interface CapsterPayrollItem {
  capsterId: string;
  capsterName: string;
  branchId: string;
  baseSalary: number;
  completedBookingsCount: number;
  commissionPerBooking: number;
  totalCommission: number;
  totalEarnings: number;
}

export interface BranchFinancialSummary {
  branchId: string;
  branchName: string;
  month: string; // YYYY-MM
  // Revenue
  grossServiceRevenue: number;
  totalBookingsCount: number;
  completedBookingsCount: number;
  // Deductions & Expenses
  staffBaseSalaryTotal: number;
  capsterCommissionsTotal: number;
  totalPayroll: number;
  salonProductDeductions: number;
  manualOperatingExpenses: number;
  totalExpenses: number;
  // Profit
  netProfit: number;
  profitMarginPercent: number;
  // Details
  expensesList: BranchExpense[];
  capsterPayrollList: CapsterPayrollItem[];
  salonRequisitionsCost: {
    requisitionId: string;
    productName: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
    dispatchedAt?: string;
  }[];
}

export interface ConsolidatedFinancialSummary {
  month: string;
  totalGrossRevenue: number;
  totalPayroll: number;
  totalSalonProductDeductions: number;
  totalManualExpenses: number;
  totalExpenses: number;
  totalNetProfit: number;
  overallProfitMargin: number;
  totalCompletedBookings: number;
  branchSummaries: BranchFinancialSummary[];
}

interface FinanceContextType {
  expenses: BranchExpense[];
  addExpense: (
    branchId: string,
    managerId: string,
    category: BranchExpense['category'],
    amount: number,
    description: string,
    date?: string
  ) => void;
  deleteExpense: (expenseId: string) => void;
  getBranchMonthlyReport: (branchId: string, month: string) => BranchFinancialSummary;
  getJabodetabekSummary: (month: string) => ConsolidatedFinancialSummary;
}

const STORAGE_KEY = 'atmos_branch_expenses_v1';

// Standard payroll constants
const CAPSTER_BASE_SALARY = 4500000; // Rp 4.500.000 / month base
const MANAGER_BASE_SALARY = 6000000; // Rp 6.000.000 / month base
const COMMISSION_PER_SERVICE = 25000; // Rp 25.000 per completed booking

// Initial realistic Jabodetabek branch expenses (September 2026)
const INITIAL_EXPENSES: BranchExpense[] = [
  // Senopati
  {
    id: 'exp-seno-01',
    branchId: 'senopati',
    branchName: 'ATMOS Senopati Sanctuary',
    recordedByStaffId: 'st-bm-senopati',
    category: 'UTILITIES',
    description: 'Tagihan Listrik PLN & AC Inverter Sanctuary',
    amount: 4850000,
    date: '2026-09-05',
    createdAt: '2026-09-05T10:00:00Z',
  },
  {
    id: 'exp-seno-02',
    branchId: 'senopati',
    branchName: 'ATMOS Senopati Sanctuary',
    recordedByStaffId: 'st-bm-senopati',
    category: 'SUPPLIES',
    description: 'Laundry Higienis Linen & Handuk Uap Hangat (400 pcs)',
    amount: 1750000,
    date: '2026-09-10',
    createdAt: '2026-09-10T14:30:00Z',
  },
  {
    id: 'exp-seno-03',
    branchId: 'senopati',
    branchName: 'ATMOS Senopati Sanctuary',
    recordedByStaffId: 'st-bm-senopati',
    category: 'MAINTENANCE',
    description: 'Servis Filter HVAC Air Purifier & Washbed Motor Zero-Gravity',
    amount: 1200000,
    date: '2026-09-12',
    createdAt: '2026-09-12T16:00:00Z',
  },
  {
    id: 'exp-seno-04',
    branchId: 'senopati',
    branchName: 'ATMOS Senopati Sanctuary',
    recordedByStaffId: 'st-bm-senopati',
    category: 'REFRESHMENTS',
    description: 'Biji Kopi Single Origin Arabica Gayo & Teh Herbal Chamomile',
    amount: 950000,
    date: '2026-09-08',
    createdAt: '2026-09-08T09:15:00Z',
  },

  // PIK Waterfront
  {
    id: 'exp-pik-01',
    branchId: 'pik',
    branchName: 'ATMOS PIK Waterfront',
    recordedByStaffId: 'st-bm-pik',
    category: 'UTILITIES',
    description: 'Listrik & Desalinasi Water Filter Hydro-Mist Spa',
    amount: 5200000,
    date: '2026-09-04',
    createdAt: '2026-09-04T11:00:00Z',
  },
  {
    id: 'exp-pik-02',
    branchId: 'pik',
    branchName: 'ATMOS PIK Waterfront',
    recordedByStaffId: 'st-bm-pik',
    category: 'SUPPLIES',
    description: 'Laundry Kimono Tamu & Handuk Mandi Sutra Microfiber',
    amount: 1600000,
    date: '2026-09-09',
    createdAt: '2026-09-09T13:40:00Z',
  },
  {
    id: 'exp-pik-03',
    branchId: 'pik',
    branchName: 'ATMOS PIK Waterfront',
    recordedByStaffId: 'st-bm-pik',
    category: 'MAINTENANCE',
    description: 'Kalibrasi Sirkulasi Air Panas Japanese Head-Spa Pod',
    amount: 1450000,
    date: '2026-09-14',
    createdAt: '2026-09-14T17:00:00Z',
  },

  // Menteng Heritage
  {
    id: 'exp-menteng-01',
    branchId: 'menteng',
    branchName: 'ATMOS Menteng Heritage',
    recordedByStaffId: 'st-bm-menteng',
    category: 'UTILITIES',
    description: 'Penerangan Warm Accent & Listrik Studio Kolonial',
    amount: 3900000,
    date: '2026-09-06',
    createdAt: '2026-09-06T10:30:00Z',
  },
  {
    id: 'exp-menteng-02',
    branchId: 'menteng',
    branchName: 'ATMOS Menteng Heritage',
    recordedByStaffId: 'st-bm-menteng',
    category: 'REFRESHMENTS',
    description: 'Daun Teh Artisan Sencha & Air Mineral Kaca Premium',
    amount: 800000,
    date: '2026-09-11',
    createdAt: '2026-09-11T15:20:00Z',
  },

  // The Breeze BSD
  {
    id: 'exp-bsd-01',
    branchId: 'bsd',
    branchName: 'ATMOS The Breeze BSD',
    recordedByStaffId: 'st-bm-bsd',
    category: 'UTILITIES',
    description: 'Service Charge Mall The Breeze & Beban Daya Listrik',
    amount: 4100000,
    date: '2026-09-05',
    createdAt: '2026-09-05T09:00:00Z',
  },
  {
    id: 'exp-bsd-02',
    branchId: 'bsd',
    branchName: 'ATMOS The Breeze BSD',
    recordedByStaffId: 'st-bm-bsd',
    category: 'SUPPLIES',
    description: 'Laundry Handuk Hangat & Sanitasi Disinfektan Barber',
    amount: 1350000,
    date: '2026-09-13',
    createdAt: '2026-09-13T12:00:00Z',
  },

  // Kelapa Gading
  {
    id: 'exp-kg-01',
    branchId: 'kelapagading',
    branchName: 'ATMOS Kelapa Gading Atelier',
    recordedByStaffId: 'st-bm-kg',
    category: 'UTILITIES',
    description: 'Beban Listrik Penerangan Atelier & Pendingin Ruangan',
    amount: 3750000,
    date: '2026-09-07',
    createdAt: '2026-09-07T11:45:00Z',
  },
  {
    id: 'exp-kg-02',
    branchId: 'kelapagading',
    branchName: 'ATMOS Kelapa Gading Atelier',
    recordedByStaffId: 'st-bm-kg',
    category: 'MAINTENANCE',
    description: 'Pelumasan Kursi Hidrolik & Pengasahan Pisau Gunting Jepang',
    amount: 950000,
    date: '2026-09-15',
    createdAt: '2026-09-15T16:30:00Z',
  },

  // Bekasi
  {
    id: 'exp-bekasi-01',
    branchId: 'bekasi',
    branchName: 'ATMOS Summarecon Bekasi',
    recordedByStaffId: 'st-bm-bekasi',
    category: 'UTILITIES',
    description: 'Listrik Rukan Sinpasa & Pompa Air Bersih',
    amount: 3200000,
    date: '2026-09-06',
    createdAt: '2026-09-06T10:15:00Z',
  },
  {
    id: 'exp-bekasi-02',
    branchId: 'bekasi',
    branchName: 'ATMOS Summarecon Bekasi',
    recordedByStaffId: 'st-bm-bekasi',
    category: 'REFRESHMENTS',
    description: 'Air Mineral Galon & Welcome Drinks Seruni',
    amount: 600000,
    date: '2026-09-10',
    createdAt: '2026-09-10T14:00:00Z',
  },
];

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [expenses, setExpenses] = useState<BranchExpense[]>(INITIAL_EXPENSES);
  const { bookings } = useBookingStore();
  const { requisitions, batches } = useInventoryStore();

  // Load persisted expenses from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setExpenses(JSON.parse(stored));
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_EXPENSES));
      }
    } catch (e) {
      console.warn('Failed to load stored branch expenses:', e);
    }
  }, []);

  const saveExpenses = useCallback((newExpenses: BranchExpense[]) => {
    setExpenses(newExpenses);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newExpenses));
    } catch (e) {
      console.warn('Failed to persist branch expenses:', e);
    }
  }, []);

  // Add new branch operational expense
  const addExpense = useCallback(
    (
      branchId: string,
      managerId: string,
      category: BranchExpense['category'],
      amount: number,
      description: string,
      date?: string
    ) => {
      const branch = BRANCHES_DATA.find((b) => b.id === branchId);
      const newExp: BranchExpense = {
        id: `exp-${Date.now()}`,
        branchId,
        branchName: branch ? branch.name : branchId,
        recordedByStaffId: managerId,
        category,
        description,
        amount,
        date: date || new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      };

      setExpenses((prev) => {
        const updated = [newExp, ...prev];
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {
          console.warn('Failed to persist new expense:', e);
        }
        return updated;
      });
    },
    []
  );

  // Delete an expense entry
  const deleteExpense = useCallback((expenseId: string) => {
    setExpenses((prev) => {
      const updated = prev.filter((e) => e.id !== expenseId);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to persist delete expense:', e);
      }
      return updated;
    });
  }, []);

  // Compute live branch monthly P&L
  const getBranchMonthlyReport = useCallback(
    (branchId: string, month: string): BranchFinancialSummary => {
      const branch = BRANCHES_DATA.find((b) => b.id === branchId);
      const branchName = branch ? branch.name : branchId;

      // 1. Gross Service Revenue
      const branchBookings = bookings.filter((b) => {
        const matchBranch = b.branchId === branchId;
        const matchMonth = b.date ? b.date.startsWith(month) : false;
        return matchBranch && matchMonth;
      });

      const completedBookings = branchBookings.filter((b) => b.status === 'COMPLETED');
      const grossServiceRevenue = completedBookings.reduce(
        (sum, b) => sum + (b.servicePrice || 0),
        0
      );

      // 2. Staff Payroll & Capster Commissions
      const branchCapsters = CAPSTERS_DATA.filter((c) => c.branchId === branchId);
      const capsterPayrollList: CapsterPayrollItem[] = branchCapsters.map((capster) => {
        const capsterCompleted = completedBookings.filter((b) => b.capsterId === capster.id);
        const count = capsterCompleted.length;
        const totalCommission = count * COMMISSION_PER_SERVICE;
        return {
          capsterId: capster.id,
          capsterName: capster.name,
          branchId,
          baseSalary: CAPSTER_BASE_SALARY,
          completedBookingsCount: count,
          commissionPerBooking: COMMISSION_PER_SERVICE,
          totalCommission,
          totalEarnings: CAPSTER_BASE_SALARY + totalCommission,
        };
      });

      // Total capster base + Branch Manager base
      const capstersBaseTotal = branchCapsters.length * CAPSTER_BASE_SALARY;
      const staffBaseSalaryTotal = capstersBaseTotal + MANAGER_BASE_SALARY;
      const capsterCommissionsTotal = capsterPayrollList.reduce(
        (sum, item) => sum + item.totalCommission,
        0
      );
      const totalPayroll = staffBaseSalaryTotal + capsterCommissionsTotal;

      // 3. Salon Product Deductions (fulfilled / dispatched requisitions for this branch in this month)
      const salonRequisitionsCost: BranchFinancialSummary['salonRequisitionsCost'] = [];
      let salonProductDeductions = 0;

      const branchRequisitions = requisitions.filter((r) => {
        const matchBranch = r.branchId === branchId;
        const isDispatched = r.status === 'DISPATCHED' || r.status === 'RECEIVED';
        const dateStr = r.dispatchedAt || r.createdAt;
        const matchMonth = dateStr ? dateStr.startsWith(month) : false;
        return matchBranch && isDispatched && matchMonth;
      });

      for (const req of branchRequisitions) {
        for (const item of req.items) {
          const qty = item.quantityDispatched ?? item.quantityRequested;
          // Determine unit cost: batch cost or default ~45% of retail price
          const batchMatch = batches.find((b) => b.productId === item.productId);
          const productMatch = PRODUCTS_DATA.find((p) => p.id === item.productId);
          const unitCost =
            batchMatch?.costPerUnit ??
            (productMatch ? Math.round(productMatch.price * 0.45) : 95000);
          const itemTotalCost = qty * unitCost;

          salonProductDeductions += itemTotalCost;
          salonRequisitionsCost.push({
            requisitionId: req.id,
            productName: item.productName,
            quantity: qty,
            unitCost,
            totalCost: itemTotalCost,
            dispatchedAt: req.dispatchedAt,
          });
        }
      }

      // 4. Manual Operating Expenses entered by Branch Manager
      const branchExpenses = expenses.filter((e) => {
        const matchBranch = e.branchId === branchId;
        const matchMonth = e.date ? e.date.startsWith(month) : false;
        return matchBranch && matchMonth;
      });

      const manualOperatingExpenses = branchExpenses.reduce((sum, e) => sum + e.amount, 0);

      // 5. Total Expenses & Net Profit
      const totalExpenses = totalPayroll + salonProductDeductions + manualOperatingExpenses;
      const netProfit = grossServiceRevenue - totalExpenses;
      const profitMarginPercent =
        grossServiceRevenue > 0
          ? Math.round((netProfit / grossServiceRevenue) * 1000) / 10
          : 0;

      return {
        branchId,
        branchName,
        month,
        grossServiceRevenue,
        totalBookingsCount: branchBookings.length,
        completedBookingsCount: completedBookings.length,
        staffBaseSalaryTotal,
        capsterCommissionsTotal,
        totalPayroll,
        salonProductDeductions,
        manualOperatingExpenses,
        totalExpenses,
        netProfit,
        profitMarginPercent,
        expensesList: branchExpenses,
        capsterPayrollList,
        salonRequisitionsCost,
      };
    },
    [bookings, requisitions, batches, expenses]
  );

  // Consolidated summary across all 6 Jabodetabek branches for Executive HQ
  const getJabodetabekSummary = useCallback(
    (month: string): ConsolidatedFinancialSummary => {
      const branchSummaries = BRANCHES_DATA.map((b) => getBranchMonthlyReport(b.id, month));

      const totalGrossRevenue = branchSummaries.reduce(
        (sum, item) => sum + item.grossServiceRevenue,
        0
      );
      const totalPayroll = branchSummaries.reduce((sum, item) => sum + item.totalPayroll, 0);
      const totalSalonProductDeductions = branchSummaries.reduce(
        (sum, item) => sum + item.salonProductDeductions,
        0
      );
      const totalManualExpenses = branchSummaries.reduce(
        (sum, item) => sum + item.manualOperatingExpenses,
        0
      );
      const totalExpenses = branchSummaries.reduce((sum, item) => sum + item.totalExpenses, 0);
      const totalNetProfit = totalGrossRevenue - totalExpenses;
      const overallProfitMargin =
        totalGrossRevenue > 0
          ? Math.round((totalNetProfit / totalGrossRevenue) * 1000) / 10
          : 0;
      const totalCompletedBookings = branchSummaries.reduce(
        (sum, item) => sum + item.completedBookingsCount,
        0
      );

      return {
        month,
        totalGrossRevenue,
        totalPayroll,
        totalSalonProductDeductions,
        totalManualExpenses,
        totalExpenses,
        totalNetProfit,
        overallProfitMargin,
        totalCompletedBookings,
        branchSummaries,
      };
    },
    [getBranchMonthlyReport]
  );

  const value = useMemo(
    () => ({
      expenses,
      addExpense,
      deleteExpense,
      getBranchMonthlyReport,
      getJabodetabekSummary,
    }),
    [expenses, addExpense, deleteExpense, getBranchMonthlyReport, getJabodetabekSummary]
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinanceStore(): FinanceContextType {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinanceStore must be used within a FinanceProvider');
  }
  return context;
}
