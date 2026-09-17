// Core Staff & Customer Roles
export type StaffRole = 'BRANCH_STAFF' | 'BRANCH_MANAGER' | 'WAREHOUSE_STAFF' | 'EXECUTIVE';

export type BookingStatus = 'CONFIRMED' | 'CHECKED_IN' | 'IN_SERVICE' | 'COMPLETED' | 'CANCELLED';

export type OrderStatus = 'PENDING_PAYMENT' | 'PAID' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export type BatchStatus = 'ACTIVE' | 'DEPLETED' | 'EXPIRED';

export type RequisitionStatus = 'PENDING' | 'APPROVED' | 'DISPATCHED' | 'RECEIVED' | 'REJECTED';

// Sensory Sanctuary Profile
export interface SensoryProfile {
  scentPreference?: string; // e.g. 'Sandalwood & Bergamot', 'Hinoki & Cedarwood'
  beveragePreference?: string; // e.g. 'Artisan Cold Brew', 'Warm Herbal Tea', 'Mineral Water'
  conversationPreference?: 'SILENT' | 'ESSENTIALS_ONLY' | 'LIGHT_CONVERSATION';
  musicLightingPreference?: string;
  scalpCondition?: string;
  hairGoals?: string[];
  notes?: string;
}

// User Models
export interface CustomerUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role?: 'CUSTOMER';
  sensoryProfile?: SensoryProfile;
  loyaltyPoints?: number;
  totalVisits?: number;
  createdAt?: string;
}

export interface StaffUser {
  id: string;
  fullName: string;
  email: string;
  role: StaffRole;
  branchId?: string; // null for Warehouse Staff & Executive
  branchName?: string;
  pin?: string; // 4-6 digit quick POS PIN
  active?: boolean;
  createdAt?: string;
}

// Branch Model
export interface Branch {
  id: string;
  name: string;
  area: string;
  address: string;
  hours: string;
  phone: string;
  whatsapp: string;
  latitude: number;
  longitude: number;
  slotsLeftToday: number;
  image: string;
  features: string[];
  mapUrl?: string;
}

// Stylist / Capster Model
export interface Capster {
  id: string;
  name: string;
  role: string;
  branchId: string;
  experience: string;
  rating: number;
  specialties: string[];
  avatar: string;
  available?: boolean;
}

// Alias for compatibility with earlier generate templates
export type Stylist = Capster;

// Service Item Model
export interface ServiceItem {
  id: string;
  title: string;
  subtitle: string;
  duration: number; // in minutes
  price: number; // in IDR
  targetAudience: string;
  asmrIncluded: boolean;
  description: string;
  steps: string[];
  image: string;
}

// Booking Model
export interface Booking {
  id: string;
  bookingNumber?: string;
  customerId?: string;
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
  date: string; // YYYY-MM-DD
  timeSlot: string; // HH:mm
  status: BookingStatus;
  sensoryProfile?: SensoryProfile;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

// Product & Inventory Models
export interface ProductItem {
  id: string;
  number: string;
  name: string;
  tagline: string;
  price: number;
  volume: string;
  category: string;
  scentNotes: string[];
  routineStep: string;
  benefits: string[];
  ingredients: string;
  image: string;
  stock?: number;
}

export interface ProductBatch {
  id: string;
  productId: string;
  productName: string;
  batchNumber: string;
  quantity: number;
  initialQuantity: number;
  manufacturingDate: string;
  expiryDate: string;
  status: BatchStatus;
  location?: string; // Warehouse or specific branch ID
  costPerUnit?: number;
  receivedAt: string;
}

// Branch Requisitions (Restocking requests)
export interface RequisitionItem {
  productId: string;
  productName: string;
  quantityRequested: number;
  quantityDispatched?: number;
}

export interface BranchRequisition {
  id: string;
  branchId: string;
  branchName: string;
  requestedByStaffId: string;
  requestedByStaffName: string;
  items: RequisitionItem[];
  status: RequisitionStatus;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  dispatchedAt?: string;
  receivedAt?: string;
}

// E-Commerce & Retail Orders
export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  batchNumber?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  shippingAddress?: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentMethod?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CartItem {
  product: ProductItem;
  quantity: number;
}

// Financials & Branch Operations
export interface BranchExpense {
  id: string;
  branchId: string;
  branchName?: string;
  recordedByStaffId: string;
  category: 'UTILITIES' | 'SUPPLIES' | 'MAINTENANCE' | 'REFRESHMENTS' | 'OTHER';
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  receiptUrl?: string;
  createdAt: string;
}

export interface BranchMonthlyReport {
  branchId: string;
  branchName: string;
  month: string; // YYYY-MM
  totalRevenue: number;
  serviceRevenue: number;
  productRevenue: number;
  totalExpenses: number;
  netProfit: number;
  totalBookings: number;
  completedBookings: number;
  capsterPerformance: {
    capsterId: string;
    capsterName: string;
    bookingsHandled: number;
    revenueGenerated: number;
  }[];
}
