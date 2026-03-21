import { create } from "zustand";
import { devtools } from "zustand/middleware";

export type ModalId = "confirm-delete" | "create-project" | "invite-member" | string;
export type DrawerId = "user-settings" | "notifications" | string;

interface ModalState { isOpen: boolean; data?: unknown }
interface DrawerState { isOpen: boolean; data?: unknown }

interface UIState {
  modals: Record<ModalId, ModalState>;
  drawers: Record<DrawerId, DrawerState>;
  globalLoading: boolean;
  toasts: Toast[];
  commandPaletteOpen: boolean;
}

export interface Toast {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  description?: string;
  duration?: number; // ms, default 4000
}

interface UIActions {
  openModal: (id: ModalId, data?: unknown) => void;
  closeModal: (id: ModalId) => void;
  openDrawer: (id: DrawerId, data?: unknown) => void;
  closeDrawer: (id: DrawerId) => void;
  setGlobalLoading: (loading: boolean) => void;
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  getModalData: <T = unknown>(id: ModalId) => T | undefined;
}

export const useUIStore = create<UIState & UIActions>()(
  devtools(
    (set, get) => ({
      modals: {},
      drawers: {},
      globalLoading: false,
      toasts: [],
      commandPaletteOpen: false,

      openModal: (id, data) =>
        set((s) => ({ modals: { ...s.modals, [id]: { isOpen: true, data } } }), false, "ui/openModal"),

      closeModal: (id) =>
        set((s) => ({ modals: { ...s.modals, [id]: { isOpen: false } } }), false, "ui/closeModal"),

      openDrawer: (id, data) =>
        set((s) => ({ drawers: { ...s.drawers, [id]: { isOpen: true, data } } }), false, "ui/openDrawer"),

      closeDrawer: (id) =>
        set((s) => ({ drawers: { ...s.drawers, [id]: { isOpen: false } } }), false, "ui/closeDrawer"),

      setGlobalLoading: (loading) => set({ globalLoading: loading }, false, "ui/setLoading"),

      addToast: (toast) => {
        const id = Math.random().toString(36).slice(2);
        set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }), false, "ui/addToast");
        const duration = toast.duration ?? 4000;
        setTimeout(() => get().removeToast(id), duration);
      },

      removeToast: (id) =>
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }), false, "ui/removeToast"),

      openCommandPalette: () => set({ commandPaletteOpen: true }, false, "ui/openCmdPalette"),
      closeCommandPalette: () => set({ commandPaletteOpen: false }, false, "ui/closeCmdPalette"),

      getModalData: <T>(id: ModalId) => get().modals[id]?.data as T | undefined,
    }),
    { name: "UIStore" }
  )
);

// Convenience selectors
export const selectIsModalOpen = (id: ModalId) => (s: UIState) => !!s.modals[id]?.isOpen;
export const selectIsDrawerOpen = (id: DrawerId) => (s: UIState) => !!s.drawers[id]?.isOpen;
export const selectToasts = (s: UIState) => s.toasts;
