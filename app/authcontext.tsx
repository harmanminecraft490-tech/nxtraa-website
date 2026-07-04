"use client";

import React, { createContext, useContext } from "react";

import type { SessionUser } from "@/lib/auth/session";

export type AuthContextType = {
  user: SessionUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  logout: () => Promise<void> | void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Minimal client provider to keep existing components working.
// Auth state is derived from server session endpoints (no localStorage).
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const value: AuthContextType = {
    user: null,
    isAuthenticated: false,
    loading: true,
    logout: () => {},
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

