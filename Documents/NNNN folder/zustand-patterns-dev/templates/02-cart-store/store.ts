import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  variantId?: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

interface CartActions {
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (itemId: string, variantId?: string) => void;
  updateQuantity: (itemId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

interface CartComputedProps {
  totalItems: () => number;
  subtotal: () => number;
  isEmpty: () => boolean;
}

const cartKey = (id: string, variantId?: string) => `${id}:${variantId ?? ""}`;

export const useCartStore = create<CartState & CartActions>()(
  devtools(
    persist(
      (set, get) => ({
        items: [],
        isOpen: false,

        addItem: (item) => {
          set((state) => {
            const key = cartKey(item.id, item.variantId);
            const existing = state.items.find((i) => cartKey(i.id, i.variantId) === key);
            if (existing) {
              return {
                items: state.items.map((i) =>
                  cartKey(i.id, i.variantId) === key
                    ? { ...i, quantity: i.quantity + (item.quantity ?? 1) }
                    : i
                ),
              };
            }
            return { items: [...state.items, { ...item, quantity: item.quantity ?? 1 }] };
          }, false, "cart/addItem");
        },

        removeItem: (itemId, variantId) => {
          set((state) => ({
            items: state.items.filter((i) => cartKey(i.id, i.variantId) !== cartKey(itemId, variantId)),
          }), false, "cart/removeItem");
        },

        updateQuantity: (itemId, quantity, variantId) => {
          if (quantity <= 0) { get().removeItem(itemId, variantId); return; }
          set((state) => ({
            items: state.items.map((i) =>
              cartKey(i.id, i.variantId) === cartKey(itemId, variantId) ? { ...i, quantity } : i
            ),
          }), false, "cart/updateQuantity");
        },

        clearCart: () => set({ items: [] }, false, "cart/clear"),
        openCart: () => set({ isOpen: true }, false, "cart/open"),
        closeCart: () => set({ isOpen: false }, false, "cart/close"),
      }),
      { name: "cart-storage", partialize: (s) => ({ items: s.items }) }
    ),
    { name: "CartStore" }
  )
);

// Computed selectors (memoised via selector pattern)
export const selectTotalItems = (s: CartState) =>
  s.items.reduce((sum, i) => sum + i.quantity, 0);

export const selectSubtotal = (s: CartState) =>
  s.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

export const selectIsEmpty = (s: CartState) => s.items.length === 0;
