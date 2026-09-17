import { StaffUser, StaffRole } from '@/types';

export interface MockStaffAccount extends StaffUser {
  username: string;
  password: string;
  title: string;
}

export const MOCK_STAFF_USERS: MockStaffAccount[] = [
  {
    id: 'staff-senopati-1',
    fullName: 'Rian Pratama',
    email: 'rian.pratama@atmosbarbershop.com',
    username: 'staff.senopati',
    password: 'atmos123',
    role: 'BRANCH_STAFF',
    branchId: 'senopati',
    branchName: 'ATMOS Senopati Sanctuary',
    title: 'Senior Barber & Stylist',
    pin: '1234',
    active: true,
    createdAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 'mgr-senopati-1',
    fullName: 'Bambang Wijaya',
    email: 'bambang.wijaya@atmosbarbershop.com',
    username: 'manager.senopati',
    password: 'atmos123',
    role: 'BRANCH_MANAGER',
    branchId: 'senopati',
    branchName: 'ATMOS Senopati Sanctuary',
    title: 'Branch Operations Manager',
    pin: '5678',
    active: true,
    createdAt: '2025-11-01T08:00:00Z',
  },
  {
    id: 'wh-central-1',
    fullName: 'Hendra Kusuma',
    email: 'hendra.kusuma@atmosbarbershop.com',
    username: 'warehouse.central',
    password: 'atmos123',
    role: 'WAREHOUSE_STAFF',
    branchId: undefined,
    branchName: 'Central Supply Warehouse',
    title: 'Central Supply Lead',
    pin: '9900',
    active: true,
    createdAt: '2025-10-15T08:00:00Z',
  },
  {
    id: 'exec-hq-1',
    fullName: 'Nicholas Arya',
    email: 'nicholas.arya@atmosbarbershop.com',
    username: 'director.hq',
    password: 'atmos123',
    role: 'EXECUTIVE',
    branchId: undefined,
    branchName: 'HQ Jabodetabek',
    title: 'Managing Director & Partner',
    pin: '0000',
    active: true,
    createdAt: '2025-08-01T08:00:00Z',
  },
];

/**
 * Helper to match user credentials (case-insensitive for username)
 */
export function findUserByCredentials(username: string, password: string): MockStaffAccount | null {
  const normalizedUsername = username.trim().toLowerCase();
  return (
    MOCK_STAFF_USERS.find(
      (u) => u.username.toLowerCase() === normalizedUsername && u.password === password.trim()
    ) || null
  );
}

/**
 * Helper to lookup mock user by role (and optional branch)
 */
export function findUserByRole(role: StaffRole, branchId?: string): MockStaffAccount | null {
  if (branchId) {
    const matched = MOCK_STAFF_USERS.find((u) => u.role === role && u.branchId === branchId);
    if (matched) return matched;
  }
  return MOCK_STAFF_USERS.find((u) => u.role === role) || null;
}

/**
 * Returns default redirect route based on staff role
 */
export function getRoleRedirectPath(role: StaffRole): string {
  switch (role) {
    case 'BRANCH_STAFF':
      return '/ops/schedule';
    case 'BRANCH_MANAGER':
      return '/hq/overview';
    case 'WAREHOUSE_STAFF':
      return '/supply/batches';
    case 'EXECUTIVE':
      return '/hq/overview';
    default:
      return '/internal/login';
  }
}
