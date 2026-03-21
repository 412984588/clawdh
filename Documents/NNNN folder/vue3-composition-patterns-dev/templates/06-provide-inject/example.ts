// Vue 3 Provide / Inject 模式 — 上下文传递、类型安全注入键、插件模式
// provide/inject 是 Vue 的依赖注入机制，用于深层组件通信

import { computed, inject, provide, readonly, ref, type InjectionKey } from "vue";

// ===== 1. 类型安全注入键 =====

export interface Theme {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  isDark: boolean;
}

export interface ThemeContext {
  theme: ReturnType<typeof readonly<ReturnType<typeof ref<Theme>>>>;
  toggleDark: () => void;
  setColor: (key: keyof Omit<Theme, "isDark">, value: string) => void;
}

// Symbol 注入键确保唯一性
export const THEME_KEY: InjectionKey<ThemeContext> = Symbol("theme");
export const USER_KEY: InjectionKey<UserContext> = Symbol("user");
export const TOAST_KEY: InjectionKey<ToastContext> = Symbol("toast");

// ===== 2. Theme Provider =====

const LIGHT_THEME: Theme = {
  primary: "#3b82f6",
  secondary: "#8b5cf6",
  background: "#ffffff",
  text: "#1f2937",
  isDark: false,
};

const DARK_THEME: Theme = {
  primary: "#60a5fa",
  secondary: "#a78bfa",
  background: "#1f2937",
  text: "#f9fafb",
  isDark: true,
};

export function provideTheme() {
  const theme = ref<Theme>({ ...LIGHT_THEME });

  function toggleDark() {
    theme.value = theme.value.isDark ? { ...LIGHT_THEME } : { ...DARK_THEME };
  }

  function setColor(key: keyof Omit<Theme, "isDark">, value: string) {
    theme.value = { ...theme.value, [key]: value };
  }

  const ctx: ThemeContext = { theme: readonly(theme), toggleDark, setColor };
  provide(THEME_KEY, ctx);
  return ctx;
}

export function useTheme(): ThemeContext {
  const ctx = inject(THEME_KEY);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}

// ===== 3. User Context =====

export interface UserContext {
  user: ReturnType<typeof computed<{ id: number; name: string; role: string } | null>>;
  isLoggedIn: ReturnType<typeof computed<boolean>>;
  login: (email: string) => void;
  logout: () => void;
}

export function provideUser() {
  const _user = ref<{ id: number; name: string; role: string } | null>(null);
  const user = computed(() => _user.value);
  const isLoggedIn = computed(() => _user.value !== null);

  function login(email: string) {
    _user.value = { id: 1, name: email.split("@")[0], role: "user" };
  }
  function logout() { _user.value = null; }

  const ctx: UserContext = { user, isLoggedIn, login, logout };
  provide(USER_KEY, ctx);
  return ctx;
}

export function useUser(): UserContext {
  const ctx = inject(USER_KEY);
  if (!ctx) throw new Error("useUser must be used within a UserProvider");
  return ctx;
}

// ===== 4. Toast / Notification Context =====

export interface ToastMessage {
  id: number;
  type: "info" | "success" | "warning" | "error";
  message: string;
  duration?: number;
}

export interface ToastContext {
  toasts: ReturnType<typeof computed<ToastMessage[]>>;
  toast: (message: string, type?: ToastMessage["type"], duration?: number) => void;
  dismiss: (id: number) => void;
  clear: () => void;
}

export function provideToast(): ToastContext {
  const toasts = ref<ToastMessage[]>([]);
  let nextId = 1;

  function toast(
    message: string,
    type: ToastMessage["type"] = "info",
    duration = 4000
  ) {
    const id = nextId++;
    toasts.value.push({ id, type, message, duration });
    if (duration > 0) setTimeout(() => dismiss(id), duration);
  }

  function dismiss(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }

  function clear() { toasts.value = []; }

  const ctx: ToastContext = {
    toasts: computed(() => toasts.value),
    toast,
    dismiss,
    clear,
  };
  provide(TOAST_KEY, ctx);
  return ctx;
}

export function useToast(): ToastContext {
  const ctx = inject(TOAST_KEY);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

// ===== 5. 带默认值的 inject =====

export function injectWithDefault<T>(key: InjectionKey<T>, fallback: T): T {
  return inject(key, fallback);
}

// ===== 6. 插件模式（Vue.use）=====

// export const ToastPlugin = {
//   install(app: App) {
//     const toast = provideToast()
//     app.provide(TOAST_KEY, toast)
//     app.config.globalProperties.$toast = toast.toast
//   }
// }
// app.use(ToastPlugin)

export type { Theme, ToastMessage };
