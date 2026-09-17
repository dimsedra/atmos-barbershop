'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  ProductBatch,
  Order,
  BranchRequisition,
  OrderStatus,
  RequisitionItem,
} from '@/types';
import { PRODUCTS_DATA, INITIAL_ORDERS, BRANCHES_DATA } from '@/lib/mock/data';

interface InventoryContextType {
  batches: ProductBatch[];
  orders: Order[];
  requisitions: BranchRequisition[];
  addNewBatch: (
    productId: string,
    batchNumber: string,
    initialQuantity: number,
    expiryDate: string,
    manufacturingDate?: string,
    costPerUnit?: number
  ) => void;
  updateOrderStatus: (
    orderId: string,
    status: OrderStatus,
    courierName?: string,
    trackingNumber?: string
  ) => void;
  addNewOrder: (order: Order) => void;
  createOrder: (order: Order) => void;
  dispatchRequisition: (requisitionId: string) => void;
  createRequisition: (
    branchId: string,
    managerId: string,
    items: RequisitionItem[],
    notes?: string
  ) => void;
  getExpiringBatchesCount: (daysThreshold?: number) => number;
  getPendingRequisitionsCount: () => number;
  getOrdersByStatusCount: (status: OrderStatus) => number;
  isBatchFefoPriority: (batch: ProductBatch) => boolean;
}

const STORAGE_BATCHES_KEY = 'atmos_inventory_batches_v1';
const STORAGE_ORDERS_KEY = 'atmos_inventory_orders_v1';
const STORAGE_REQUISITIONS_KEY = 'atmos_inventory_requisitions_v1';

// Seed batches with realistic dates (current simulation year is 2026)
const INITIAL_BATCHES: ProductBatch[] = [
  {
    id: 'batch-01',
    productId: 'prod-01',
    productName: 'Silver Birch Scalp Elixir',
    batchNumber: 'ATM-2603-01',
    quantity: 18,
    initialQuantity: 50,
    manufacturingDate: '2026-03-10',
    expiryDate: '2026-10-15', // Expiring in ~28 days (FEFO #1)
    status: 'ACTIVE',
    location: 'Central Warehouse Jakarta',
    costPerUnit: 115000,
    receivedAt: '2026-03-12T08:00:00Z',
  },
  {
    id: 'batch-02',
    productId: 'prod-01',
    productName: 'Silver Birch Scalp Elixir',
    batchNumber: 'ATM-2606-05',
    quantity: 27,
    initialQuantity: 40,
    manufacturingDate: '2026-06-15',
    expiryDate: '2027-06-15',
    status: 'ACTIVE',
    location: 'Central Warehouse Jakarta',
    costPerUnit: 115000,
    receivedAt: '2026-06-18T10:00:00Z',
  },
  {
    id: 'batch-03',
    productId: 'prod-02',
    productName: 'White Kaolin Matte Clay',
    batchNumber: 'ATM-2604-02',
    quantity: 22,
    initialQuantity: 50,
    manufacturingDate: '2026-04-05',
    expiryDate: '2026-11-20', // FEFO #1
    status: 'ACTIVE',
    location: 'Central Warehouse Jakarta',
    costPerUnit: 90000,
    receivedAt: '2026-04-08T09:30:00Z',
  },
  {
    id: 'batch-04',
    productId: 'prod-02',
    productName: 'White Kaolin Matte Clay',
    batchNumber: 'ATM-2607-08',
    quantity: 38,
    initialQuantity: 50,
    manufacturingDate: '2026-07-10',
    expiryDate: '2027-07-10',
    status: 'ACTIVE',
    location: 'Central Warehouse Jakarta',
    costPerUnit: 90000,
    receivedAt: '2026-07-12T14:00:00Z',
  },
  {
    id: 'batch-05',
    productId: 'prod-03',
    productName: 'ASMR Acoustic Scalp Tonic',
    batchNumber: 'ATM-2602-09',
    quantity: 8,
    initialQuantity: 30,
    manufacturingDate: '2026-02-14',
    expiryDate: '2026-10-05', // Expiring in ~18 days (FEFO #1)
    status: 'ACTIVE',
    location: 'Central Warehouse Jakarta',
    costPerUnit: 105000,
    receivedAt: '2026-02-16T11:00:00Z',
  },
  {
    id: 'batch-06',
    productId: 'prod-03',
    productName: 'ASMR Acoustic Scalp Tonic',
    batchNumber: 'ATM-2605-12',
    quantity: 30,
    initialQuantity: 40,
    manufacturingDate: '2026-05-20',
    expiryDate: '2027-05-20',
    status: 'ACTIVE',
    location: 'Central Warehouse Jakarta',
    costPerUnit: 105000,
    receivedAt: '2026-05-22T13:15:00Z',
  },
  {
    id: 'batch-07',
    productId: 'prod-04',
    productName: 'Bamboo Mist Sea Salt Spray',
    batchNumber: 'ATM-2605-03',
    quantity: 52,
    initialQuantity: 60,
    manufacturingDate: '2026-05-01',
    expiryDate: '2027-05-01',
    status: 'ACTIVE',
    location: 'Central Warehouse Jakarta',
    costPerUnit: 85000,
    receivedAt: '2026-05-03T10:00:00Z',
  },
  {
    id: 'batch-08',
    productId: 'prod-05',
    productName: 'Silk Protein Intensive Mask',
    batchNumber: 'ATM-2601-04',
    quantity: 10,
    initialQuantity: 40,
    manufacturingDate: '2026-01-10',
    expiryDate: '2026-09-30', // Expiring in ~13 days (FEFO #1)
    status: 'ACTIVE',
    location: 'Central Warehouse Jakarta',
    costPerUnit: 120000,
    receivedAt: '2026-01-12T09:00:00Z',
  },
  {
    id: 'batch-09',
    productId: 'prod-05',
    productName: 'Silk Protein Intensive Mask',
    batchNumber: 'ATM-2606-11',
    quantity: 20,
    initialQuantity: 30,
    manufacturingDate: '2026-06-01',
    expiryDate: '2027-06-01',
    status: 'ACTIVE',
    location: 'Central Warehouse Jakarta',
    costPerUnit: 120000,
    receivedAt: '2026-06-03T15:45:00Z',
  },
  {
    id: 'batch-10',
    productId: 'prod-06',
    productName: 'The ATMOS Daily Reset Bundle',
    batchNumber: 'ATM-2606-20',
    quantity: 20,
    initialQuantity: 25,
    manufacturingDate: '2026-06-20',
    expiryDate: '2027-06-20',
    status: 'ACTIVE',
    location: 'Central Warehouse Jakarta',
    costPerUnit: 275000,
    receivedAt: '2026-06-22T08:30:00Z',
  },
  {
    id: 'batch-11',
    productId: 'prod-01',
    productName: 'Silver Birch Scalp Elixir',
    batchNumber: 'ATM-2508-01',
    quantity: 0,
    initialQuantity: 30,
    manufacturingDate: '2025-08-01',
    expiryDate: '2026-08-01', // Already expired & depleted
    status: 'EXPIRED',
    location: 'Central Warehouse Jakarta',
    costPerUnit: 110000,
    receivedAt: '2025-08-03T10:00:00Z',
  },
];

// Initial e-commerce orders with various states
const SEED_ORDERS: Order[] = [
  ...INITIAL_ORDERS,
  {
    id: 'ord-202',
    orderNumber: 'ATM-ORD-8815',
    customerName: 'Kevin Wicaksono',
    customerPhone: '081399881122',
    customerEmail: 'kevin.w@example.com',
    shippingAddress: {
      street: 'Jl. Dharmawangsa X No. 5, Kebayoran Baru',
      city: 'Jakarta Selatan',
      province: 'DKI Jakarta',
      postalCode: '12160',
    },
    items: [
      {
        productId: 'prod-01',
        productName: 'Silver Birch Scalp Elixir',
        price: 265000,
        quantity: 2,
      },
      {
        productId: 'prod-04',
        productName: 'Bamboo Mist Sea Salt Spray',
        price: 195000,
        quantity: 1,
      },
    ],
    totalAmount: 725000,
    status: 'PAID',
    paymentMethod: 'GoPay / QRIS',
    createdAt: '2026-09-17T09:15:00Z',
  },
  {
    id: 'ord-203',
    orderNumber: 'ATM-ORD-8816',
    customerName: 'Amanda Clarissa',
    customerPhone: '081233445566',
    customerEmail: 'amanda.c@example.com',
    shippingAddress: {
      street: 'Pantai Indah Kapuk Bukit Golf Mediterania Blok C-18',
      city: 'Jakarta Utara',
      province: 'DKI Jakarta',
      postalCode: '14470',
    },
    items: [
      {
        productId: 'prod-06',
        productName: 'The ATMOS Daily Reset Bundle',
        price: 640000,
        quantity: 1,
      },
    ],
    totalAmount: 640000,
    status: 'PACKED',
    paymentMethod: 'Mandiri Virtual Account',
    createdAt: '2026-09-17T11:30:00Z',
  },
  {
    id: 'ord-204',
    orderNumber: 'ATM-ORD-8817',
    customerName: 'Raditya Pratama',
    customerPhone: '081177889900',
    customerEmail: 'raditya.p@example.com',
    shippingAddress: {
      street: 'Cluster Greenwich Park Blok A5 No. 12, BSD City',
      city: 'Tangerang Selatan',
      province: 'Banten',
      postalCode: '15345',
    },
    items: [
      {
        productId: 'prod-02',
        productName: 'White Kaolin Matte Clay',
        price: 210000,
        quantity: 1,
      },
      {
        productId: 'prod-03',
        productName: 'ASMR Acoustic Scalp Tonic',
        price: 245000,
        quantity: 1,
      },
    ],
    totalAmount: 455000,
    status: 'PAID',
    paymentMethod: 'BCA Virtual Account',
    createdAt: '2026-09-17T13:40:00Z',
  },
];

// Initial branch restock requisitions
const SEED_REQUISITIONS: BranchRequisition[] = [
  {
    id: 'req-301',
    branchId: 'senopati',
    branchName: 'ATMOS Senopati Sanctuary',
    requestedByStaffId: 'st-bm-senopati',
    requestedByStaffName: 'Budi Santoso (Branch Manager)',
    items: [
      {
        productId: 'prod-01',
        productName: 'Silver Birch Scalp Elixir',
        quantityRequested: 8,
      },
      {
        productId: 'prod-05',
        productName: 'Silk Protein Intensive Mask',
        quantityRequested: 6,
      },
    ],
    status: 'PENDING',
    notes: 'Stok backbar untuk reservasi akhir pekan menipis pesat. Mohon kirim segera.',
    createdAt: '2026-09-17T08:00:00Z',
    updatedAt: '2026-09-17T08:00:00Z',
  },
  {
    id: 'req-302',
    branchId: 'pik',
    branchName: 'ATMOS PIK Waterfront',
    requestedByStaffId: 'st-bm-pik',
    requestedByStaffName: 'Michael Salim (Branch Manager)',
    items: [
      {
        productId: 'prod-02',
        productName: 'White Kaolin Matte Clay',
        quantityRequested: 10,
      },
      {
        productId: 'prod-03',
        productName: 'ASMR Acoustic Scalp Tonic',
        quantityRequested: 8,
      },
    ],
    status: 'PENDING',
    notes: 'Permintaan styling retail tinggi di lounge PIK, stok etalase tersisa sedikit.',
    createdAt: '2026-09-17T10:15:00Z',
    updatedAt: '2026-09-17T10:15:00Z',
  },
  {
    id: 'req-303',
    branchId: 'bsd',
    branchName: 'ATMOS The Breeze BSD',
    requestedByStaffId: 'st-bm-bsd',
    requestedByStaffName: 'Fajar Nugraha (Branch Manager)',
    items: [
      {
        productId: 'prod-04',
        productName: 'Bamboo Mist Sea Salt Spray',
        quantityRequested: 10,
        quantityDispatched: 10,
      },
    ],
    status: 'DISPATCHED',
    notes: 'Restock rutin pertengahan bulan.',
    createdAt: '2026-09-16T11:00:00Z',
    dispatchedAt: '2026-09-16T15:20:00Z',
    updatedAt: '2026-09-16T15:20:00Z',
  },
];

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [batches, setBatches] = useState<ProductBatch[]>(INITIAL_BATCHES);
  const [orders, setOrders] = useState<Order[]>(SEED_ORDERS);
  const [requisitions, setRequisitions] = useState<BranchRequisition[]>(SEED_REQUISITIONS);

  // Restore from localStorage if available
  useEffect(() => {
    try {
      const storedBatches = localStorage.getItem(STORAGE_BATCHES_KEY);
      if (storedBatches) {
        setBatches(JSON.parse(storedBatches));
      }
      const storedOrders = localStorage.getItem(STORAGE_ORDERS_KEY);
      if (storedOrders) {
        setOrders(JSON.parse(storedOrders));
      }
      const storedReqs = localStorage.getItem(STORAGE_REQUISITIONS_KEY);
      if (storedReqs) {
        setRequisitions(JSON.parse(storedReqs));
      }
    } catch (e) {
      console.warn('Failed to load stored inventory:', e);
    }
  }, []);

  // Save changes to localStorage
  const saveBatches = (newBatches: ProductBatch[]) => {
    setBatches(newBatches);
    try {
      localStorage.setItem(STORAGE_BATCHES_KEY, JSON.stringify(newBatches));
    } catch {
      // ignore
    }
  };

  const saveOrders = (newOrders: Order[]) => {
    setOrders(newOrders);
    try {
      localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(newOrders));
    } catch {
      // ignore
    }
  };

  const saveRequisitions = (newReqs: BranchRequisition[]) => {
    setRequisitions(newReqs);
    try {
      localStorage.setItem(STORAGE_REQUISITIONS_KEY, JSON.stringify(newReqs));
    } catch {
      // ignore
    }
  };

  // Add new stock batch
  const addNewBatch = (
    productId: string,
    batchNumber: string,
    initialQuantity: number,
    expiryDate: string,
    manufacturingDate?: string,
    costPerUnit?: number
  ) => {
    const product = PRODUCTS_DATA.find((p) => p.id === productId);
    const productName = product ? product.name : 'Produk ATMOS';
    const todayStr = new Date().toISOString().split('T')[0];
    const isExpired = expiryDate < todayStr;

    const newBatch: ProductBatch = {
      id: `batch-${Date.now()}`,
      productId,
      productName,
      batchNumber,
      quantity: initialQuantity,
      initialQuantity,
      manufacturingDate:
        manufacturingDate || new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0],
      expiryDate,
      status: isExpired ? 'EXPIRED' : initialQuantity > 0 ? 'ACTIVE' : 'DEPLETED',
      location: 'Central Warehouse Jakarta',
      costPerUnit: costPerUnit || (product ? Math.round(product.price * 0.45) : 95000),
      receivedAt: new Date().toISOString(),
    };

    const updated = [newBatch, ...batches];
    saveBatches(updated);
  };

  // Update order status (and optional courier & AWB)
  const updateOrderStatus = (
    orderId: string,
    status: OrderStatus,
    courierName?: string,
    trackingNumber?: string
  ) => {
    const updated = orders.map((ord) => {
      if (ord.id !== orderId) return ord;
      const formattedTracking =
        courierName && trackingNumber
          ? `${courierName.toUpperCase()}: ${trackingNumber}`
          : trackingNumber || ord.trackingNumber;

      return {
        ...ord,
        status,
        trackingNumber: formattedTracking,
        updatedAt: new Date().toISOString(),
      };
    });
    saveOrders(updated);
  };

  // Add new order (e.g. from public shop checkout)
  const addNewOrder = (newOrder: Order) => {
    setOrders((prev) => {
      const updated = [newOrder, ...prev];
      try {
        localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  // Dispatch branch requisition with FEFO stock deduction
  const dispatchRequisition = (requisitionId: string) => {
    const target = requisitions.find((r) => r.id === requisitionId);
    if (!target || target.status === 'DISPATCHED' || target.status === 'RECEIVED') {
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const updatedBatches = [...batches];

    // For each requested item, deduct using FEFO (earliest expiry first)
    for (const item of target.items) {
      let remainingNeeded = item.quantityRequested;

      // Filter active, non-expired batches for this product
      const candidateBatches = updatedBatches
        .map((b, index) => ({ ...b, originalIndex: index }))
        .filter(
          (b) =>
            b.productId === item.productId &&
            b.status === 'ACTIVE' &&
            b.quantity > 0 &&
            b.expiryDate >= todayStr
        )
        .sort((a, b) => (a.expiryDate > b.expiryDate ? 1 : -1));

      for (const candidate of candidateBatches) {
        if (remainingNeeded <= 0) break;

        const idx = candidate.originalIndex;
        const currentBatch = updatedBatches[idx];
        const deductAmount = Math.min(currentBatch.quantity, remainingNeeded);
        const newQty = currentBatch.quantity - deductAmount;
        remainingNeeded -= deductAmount;

        updatedBatches[idx] = {
          ...currentBatch,
          quantity: newQty,
          status: newQty === 0 ? 'DEPLETED' : currentBatch.status,
        };
      }
    }

    saveBatches(updatedBatches);

    // Mark requisition as DISPATCHED
    const updatedReqs = requisitions.map((r) =>
      r.id === requisitionId
        ? {
            ...r,
            status: 'DISPATCHED' as const,
            dispatchedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            items: r.items.map((it) => ({
              ...it,
              quantityDispatched: it.quantityRequested,
            })),
          }
        : r
    );
    saveRequisitions(updatedReqs);
  };

  // Create requisition from branch
  const createRequisition = (
    branchId: string,
    managerId: string,
    items: RequisitionItem[],
    notes?: string
  ) => {
    const branch = BRANCHES_DATA.find((b) => b.id === branchId);
    const branchName = branch ? branch.name : branchId;

    const newReq: BranchRequisition = {
      id: `req-${Date.now()}`,
      branchId,
      branchName,
      requestedByStaffId: managerId,
      requestedByStaffName: 'Branch Manager',
      items,
      status: 'PENDING',
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newReq, ...requisitions];
    saveRequisitions(updated);
  };

  // Expiring batches count (default 30 days)
  const getExpiringBatchesCount = (daysThreshold = 30) => {
    const now = new Date();
    const futureLimit = new Date();
    futureLimit.setDate(futureLimit.getDate() + daysThreshold);
    const nowStr = now.toISOString().split('T')[0];
    const limitStr = futureLimit.toISOString().split('T')[0];

    return batches.filter(
      (b) =>
        b.status === 'ACTIVE' &&
        b.quantity > 0 &&
        b.expiryDate >= nowStr &&
        b.expiryDate <= limitStr
    ).length;
  };

  // Pending requisitions count
  const getPendingRequisitionsCount = () => {
    return requisitions.filter((r) => r.status === 'PENDING').length;
  };

  // Count orders by status
  const getOrdersByStatusCount = (status: OrderStatus) => {
    return orders.filter((o) => o.status === status).length;
  };

  // Check if batch is FEFO priority #1 for its product
  const isBatchFefoPriority = (batch: ProductBatch) => {
    if (batch.status !== 'ACTIVE' || batch.quantity <= 0) return false;
    const todayStr = new Date().toISOString().split('T')[0];
    if (batch.expiryDate < todayStr) return false;

    const activeSameProduct = batches
      .filter(
        (b) =>
          b.productId === batch.productId &&
          b.status === 'ACTIVE' &&
          b.quantity > 0 &&
          b.expiryDate >= todayStr
      )
      .sort((a, b) => (a.expiryDate > b.expiryDate ? 1 : -1));

    return activeSameProduct.length > 0 && activeSameProduct[0].id === batch.id;
  };

  return (
    <InventoryContext.Provider
      value={{
        batches,
        orders,
        requisitions,
        addNewBatch,
        updateOrderStatus,
        addNewOrder,
        createOrder: addNewOrder,
        dispatchRequisition,
        createRequisition,
        getExpiringBatchesCount,
        getPendingRequisitionsCount,
        getOrdersByStatusCount,
        isBatchFefoPriority,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventoryStore(): InventoryContextType {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventoryStore must be used within an InventoryProvider');
  }
  return context;
}
