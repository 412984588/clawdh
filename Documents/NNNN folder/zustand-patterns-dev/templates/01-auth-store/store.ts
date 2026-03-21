import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "member" | "viewer";
  avatarUrl?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User, token: string) => void;
  clearError: () => void;
  refreshToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  devtools(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (email, password) => {
        set({ isLoading: true, error: null }, false, "auth/loginStart");
        try {
          const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
          if (!res.ok) throw new Error("Invalid credentials");
          const { user, token } = await res.json();
          set({ user, token, isAuthenticated: true, isLoading: false }, false, "auth/loginSuccess");
        } catch (err) {
          set({ error: (err as Error).message, isLoading: false }, false, "auth/loginError");
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false, error: null }, false, "auth/logout");
      },

      setUser: (user, token) => {
        set({ user, token, isAuthenticated: true }, false, "auth/setUser");
      },

      clearError: () => set({ error: null }, false, "auth/clearError"),

      refreshToken: async () => {
        const { token } = get();
        if (!token) return;
        try {
          const res = await fetch("/api/auth/refresh", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) { get().logout(); return; }
          const { token: newToken } = await res.json();
          set({ token: newToken }, false, "auth/tokenRefreshed");
        } catch {
          get().logout();
        }
      },
    }),
    { name: "AuthStore" }
  )
);

// Selector helpers (avoids unnecessary re-renders)
export const selectUser = (s: AuthState) => s.user;
export const selectIsAuthenticated = (s: AuthState) => s.isAuthenticated;
export const selectIsAdmin = (s: AuthState) => s.user?.role === "admin";
