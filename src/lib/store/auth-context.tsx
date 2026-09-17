'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { StaffUser, StaffRole } from '@/types';
import { findUserByCredentials, findUserByRole, MockStaffAccount } from '@/lib/mock/users';

interface AuthContextType {
  user: StaffUser | null;
  role: StaffRole | null;
  activeBranchId: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  loginAsRole: (role: StaffRole, branchId?: string) => void;
  logout: () => void;
  isRole: (targetRole: StaffRole | StaffRole[]) => boolean;
  setActiveBranchId: (branchId: string | null) => void;
}

const STORAGE_KEY = 'atmos_staff_auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StaffUser | null>(null);
  const [activeBranchId, setActiveBranchId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize from localStorage on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: StaffUser = JSON.parse(stored);
        setUser(parsed);
        setActiveBranchId(parsed.branchId || null);
      }
    } catch (e) {
      console.warn('Failed to load persisted staff auth:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveUserSession = (newUser: StaffUser | null) => {
    setUser(newUser);
    setActiveBranchId(newUser?.branchId || null);
    if (typeof window !== 'undefined') {
      if (newUser) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    const matched = findUserByCredentials(username, password);
    if (!matched) {
      return false;
    }
    // Omit sensitive test properties before saving
    const { password: _, ...safeUser } = matched;
    saveUserSession(safeUser);
    return true;
  };

  const loginAsRole = (targetRole: StaffRole, branchId?: string) => {
    const matched = findUserByRole(targetRole, branchId);
    if (matched) {
      const { password: _, ...safeUser } = matched;
      saveUserSession(safeUser);
    }
  };

  const logout = () => {
    saveUserSession(null);
  };

  const isRole = (targetRole: StaffRole | StaffRole[]): boolean => {
    if (!user) return false;
    if (Array.isArray(targetRole)) {
      return targetRole.includes(user.role);
    }
    return user.role === targetRole;
  };

  const role = user?.role || null;

  const value = useMemo(
    () => ({
      user,
      role,
      activeBranchId,
      isLoading,
      login,
      loginAsRole,
      logout,
      isRole,
      setActiveBranchId,
    }),
    [user, role, activeBranchId, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useStaffAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useStaffAuth must be used within an AuthProvider');
  }
  return context;
}
