import { create, StateCreator } from "zustand";
import { devtools, persist } from "zustand/middleware";

// ── Slice pattern: combine multiple stores into one ───────────────────────
// Each slice handles one domain; combine into a single store for shared access.

// ── Auth Slice ─────────────────────────────────────────────────────────────
interface AuthSlice {
  userId: string | null;
  email: string | null;
  isAuthenticated: boolean;
  setAuth: (userId: string, email: string) => void;
  clearAuth: () => void;
}

const createAuthSlice: StateCreator<AppStore, [["zustand/devtools", never], ["zustand/persist", unknown]], [], AuthSlice> =
  (set) => ({
    userId: null,
    email: null,
    isAuthenticated: false,
    setAuth: (userId, email) => set({ userId, email, isAuthenticated: true }, false, "auth/setAuth"),
    clearAuth: () => set({ userId: null, email: null, isAuthenticated: false }, false, "auth/clear"),
  });

// ── App Settings Slice ─────────────────────────────────────────────────────
interface SettingsSlice {
  theme: "light" | "dark" | "system";
  sidebarCollapsed: boolean;
  setTheme: (theme: "light" | "dark" | "system") => void;
  toggleSidebar: () => void;
}

const createSettingsSlice: StateCreator<AppStore, [["zustand/devtools", never], ["zustand/persist", unknown]], [], SettingsSlice> =
  (set, get) => ({
    theme: "system",
    sidebarCollapsed: false,
    setTheme: (theme) => set({ theme }, false, "settings/setTheme"),
    toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }, false, "settings/toggleSidebar"),
  });

// ── Workspace Slice ────────────────────────────────────────────────────────
interface WorkspaceSlice {
  activeWorkspaceId: string | null;
  workspaceIds: string[];
  setActiveWorkspace: (id: string) => void;
  addWorkspace: (id: string) => void;
  removeWorkspace: (id: string) => void;
}

const createWorkspaceSlice: StateCreator<AppStore, [["zustand/devtools", never], ["zustand/persist", unknown]], [], WorkspaceSlice> =
  (set, get) => ({
    activeWorkspaceId: null,
    workspaceIds: [],
    setActiveWorkspace: (id) => set({ activeWorkspaceId: id }, false, "workspace/setActive"),
    addWorkspace: (id) =>
      set({ workspaceIds: [...get().workspaceIds, id] }, false, "workspace/add"),
    removeWorkspace: (id) => {
      const updated = get().workspaceIds.filter((w) => w !== id);
      set({
        workspaceIds: updated,
        activeWorkspaceId: get().activeWorkspaceId === id ? (updated[0] ?? null) : get().activeWorkspaceId,
      }, false, "workspace/remove");
    },
  });

// ── Combined Store ─────────────────────────────────────────────────────────
type AppStore = AuthSlice & SettingsSlice & WorkspaceSlice;

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (...args) => ({
        ...createAuthSlice(...args),
        ...createSettingsSlice(...args),
        ...createWorkspaceSlice(...args),
      }),
      {
        name: "app-store",
        // Only persist settings and workspace, not auth (use cookies/server session)
        partialize: (s) => ({
          theme: s.theme,
          sidebarCollapsed: s.sidebarCollapsed,
          activeWorkspaceId: s.activeWorkspaceId,
          workspaceIds: s.workspaceIds,
        }),
      }
    ),
    { name: "AppStore" }
  )
);

// Typed selectors by slice
export const selectAuth = (s: AppStore): AuthSlice => ({
  userId: s.userId, email: s.email, isAuthenticated: s.isAuthenticated,
  setAuth: s.setAuth, clearAuth: s.clearAuth,
});

export const selectSettings = (s: AppStore): SettingsSlice => ({
  theme: s.theme, sidebarCollapsed: s.sidebarCollapsed,
  setTheme: s.setTheme, toggleSidebar: s.toggleSidebar,
});
