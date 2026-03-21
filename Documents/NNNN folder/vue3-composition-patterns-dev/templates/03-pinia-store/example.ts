// Vue 3 Pinia 状态管理模式 — Option Store、Setup Store、Actions、Getters、插件
// 使用 Pinia 2.x API

import { computed, ref, watch } from "vue";
// import { defineStore, acceptHMRUpdate } from 'pinia'

// ===== 1. Option Store（传统风格）=====

// export const useCounterStore = defineStore('counter', {
//   state: () => ({ count: 0, name: 'Vue' }),
//   getters: {
//     doubled: (state) => state.count * 2,
//     greeting(): string { return `Hello, ${this.name}!` }
//   },
//   actions: {
//     increment(by = 1) { this.count += by },
//     async fetchCount() {
//       const res = await fetch('/api/count')
//       this.count = await res.json()
//     }
//   }
// })

// ===== 2. Setup Store（Composition API 风格，推荐）=====

// export const useUserStore = defineStore('user', () => {
//   const user = ref<User | null>(null)
//   const isLoggedIn = computed(() => user.value !== null)
//   const displayName = computed(() => user.value?.name ?? 'Guest')
//
//   async function login(email: string, password: string) {
//     const res = await fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
//     user.value = await res.json()
//   }
//
//   function logout() { user.value = null }
//
//   return { user: readonly(user), isLoggedIn, displayName, login, logout }
// })

// ===== 3. 模拟实现（无 Pinia 依赖，用于演示）=====

export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
}

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  qty: number;
}

// 模拟 defineStore 的 setup 风格（standalone composable）
export function createUserStore() {
  const user = ref<User | null>(null);
  const isLoggedIn = computed(() => user.value !== null);
  const displayName = computed(() => user.value?.name ?? "Guest");
  const isAdmin = computed(() => user.value?.role === "admin");

  async function login(email: string, _password: string): Promise<void> {
    // 模拟 API 调用
    await new Promise((r) => setTimeout(r, 100));
    user.value = { id: 1, name: email.split("@")[0], email, role: "user" };
  }

  function logout(): void {
    user.value = null;
  }

  function updateProfile(patch: Partial<Omit<User, "id">>): void {
    if (!user.value) return;
    user.value = { ...user.value, ...patch };
  }

  return {
    user: computed(() => user.value),
    isLoggedIn,
    displayName,
    isAdmin,
    login,
    logout,
    updateProfile,
  };
}

// ===== 4. 购物车 Store — 复杂状态 =====

export function createCartStore() {
  const items = ref<CartItem[]>([]);

  const itemCount = computed(() => items.value.reduce((n, i) => n + i.qty, 0));
  const total = computed(() =>
    items.value.reduce((sum, i) => sum + i.price * i.qty, 0)
  );
  const isEmpty = computed(() => items.value.length === 0);

  function addItem(item: Omit<CartItem, "qty">): void {
    const existing = items.value.find((i) => i.productId === item.productId);
    if (existing) {
      existing.qty++;
    } else {
      items.value.push({ ...item, qty: 1 });
    }
  }

  function removeItem(productId: number): void {
    items.value = items.value.filter((i) => i.productId !== productId);
  }

  function updateQty(productId: number, qty: number): void {
    if (qty <= 0) { removeItem(productId); return; }
    const item = items.value.find((i) => i.productId === productId);
    if (item) item.qty = qty;
  }

  function clear(): void {
    items.value = [];
  }

  // 持久化副作用
  watch(items, (v) => {
    try { localStorage.setItem("cart", JSON.stringify(v)); } catch {}
  }, { deep: true });

  return { items: computed(() => items.value), itemCount, total, isEmpty, addItem, removeItem, updateQty, clear };
}

// ===== 5. Pinia 插件模式 =====

// function persistPlugin({ store }: { store: any }) {
//   const key = `pinia-${store.$id}`
//   const stored = localStorage.getItem(key)
//   if (stored) store.$patch(JSON.parse(stored))
//   store.$subscribe((_mutation: any, state: any) => {
//     localStorage.setItem(key, JSON.stringify(state))
//   })
// }
// pinia.use(persistPlugin)

// ===== 6. Store 组合（跨 store 依赖）=====

export function createCheckoutStore(
  userStore: ReturnType<typeof createUserStore>,
  cartStore: ReturnType<typeof createCartStore>
) {
  const status = ref<"idle" | "processing" | "done" | "error">("idle");
  const error = ref<string | null>(null);

  const canCheckout = computed(
    () => userStore.isLoggedIn.value && !cartStore.isEmpty.value
  );

  async function checkout(): Promise<boolean> {
    if (!canCheckout.value) return false;
    status.value = "processing";
    try {
      await new Promise((r) => setTimeout(r, 500));
      cartStore.clear();
      status.value = "done";
      return true;
    } catch (err) {
      error.value = String(err);
      status.value = "error";
      return false;
    }
  }

  return { status, error, canCheckout, checkout };
}

export type { CartItem as CartItemType };
