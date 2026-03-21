// Vue 3 Composables 模式 — 可复用逻辑、状态管理、生命周期钩子封装
// 遵循 Vue 官方 use* 命名规范

import {
  computed,
  onMounted,
  onUnmounted,
  readonly,
  ref,
  shallowRef,
  watch,
  type Ref,
} from "vue";

// ===== 1. useToggle — 布尔切换 =====

export function useToggle(initial = false) {
  const state = ref(initial);

  function toggle() { state.value = !state.value; }
  function setTrue() { state.value = true; }
  function setFalse() { state.value = false; }
  function set(v: boolean) { state.value = v; }

  return { state: readonly(state), toggle, setTrue, setFalse, set };
}

// ===== 2. useLocalStorage — 持久化响应式状态 =====

export function useLocalStorage<T>(key: string, defaultValue: T) {
  const stored = localStorage.getItem(key);
  const initial = stored ? (JSON.parse(stored) as T) : defaultValue;
  const value = ref<T>(initial) as Ref<T>;

  watch(value, (newVal) => {
    localStorage.setItem(key, JSON.stringify(newVal));
  }, { deep: true });

  function remove() {
    localStorage.removeItem(key);
    value.value = defaultValue;
  }

  return { value, remove };
}

// ===== 3. useFetch — 数据获取 =====

export interface FetchState<T> {
  data: Ref<T | null>;
  error: Ref<Error | null>;
  loading: Ref<boolean>;
  refetch: () => Promise<void>;
}

export function useFetch<T>(url: string | Ref<string>): FetchState<T> {
  const data = ref<T | null>(null) as Ref<T | null>;
  const error = ref<Error | null>(null);
  const loading = ref(false);

  async function fetchData() {
    const resolvedUrl = typeof url === "string" ? url : url.value;
    loading.value = true;
    error.value = null;
    try {
      const res = await fetch(resolvedUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      data.value = (await res.json()) as T;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err));
    } finally {
      loading.value = false;
    }
  }

  // 响应式 URL — URL 变化自动重新获取
  if (typeof url !== "string") {
    watch(url, fetchData, { immediate: true });
  } else {
    onMounted(fetchData);
  }

  return { data, error, loading, refetch: fetchData };
}

// ===== 4. useEventListener — 自动清理的事件监听 =====

export function useEventListener<K extends keyof WindowEventMap>(
  target: EventTarget | Ref<EventTarget | null>,
  event: K,
  handler: (e: WindowEventMap[K]) => void,
  options?: AddEventListenerOptions
) {
  function addListener() {
    const el = (target as Ref<EventTarget | null>).value ?? target as EventTarget;
    el?.addEventListener(event as string, handler as EventListener, options);
  }

  function removeListener() {
    const el = (target as Ref<EventTarget | null>).value ?? target as EventTarget;
    el?.removeEventListener(event as string, handler as EventListener, options);
  }

  onMounted(addListener);
  onUnmounted(removeListener);

  return { addListener, removeListener };
}

// ===== 5. useDebounce — 防抖响应式值 =====

export function useDebounce<T>(source: Ref<T>, delay = 300) {
  const debounced = ref<T>(source.value) as Ref<T>;
  let timer: ReturnType<typeof setTimeout> | null = null;

  watch(source, (newVal) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => { debounced.value = newVal; }, delay);
  });

  onUnmounted(() => { if (timer) clearTimeout(timer); });

  return debounced;
}

// ===== 6. useMediaQuery — 响应式媒体查询 =====

export function useMediaQuery(query: string) {
  const matches = ref(false);

  onMounted(() => {
    const mq = window.matchMedia(query);
    matches.value = mq.matches;
    const handler = (e: MediaQueryListEvent) => { matches.value = e.matches; };
    mq.addEventListener("change", handler);
    onUnmounted(() => mq.removeEventListener("change", handler));
  });

  return readonly(matches);
}

// ===== 7. useIntersectionObserver — 懒加载触发 =====

export function useIntersectionObserver(
  targetRef: Ref<Element | null>,
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
) {
  const isIntersecting = ref(false);
  let observer: IntersectionObserver | null = null;

  onMounted(() => {
    if (!targetRef.value) return;
    observer = new IntersectionObserver((entries, obs) => {
      isIntersecting.value = entries[0]?.isIntersecting ?? false;
      callback(entries, obs);
    }, options);
    observer.observe(targetRef.value);
  });

  onUnmounted(() => observer?.disconnect());

  return { isIntersecting: readonly(isIntersecting) };
}

// ===== 8. useAsync — 封装异步操作状态 =====

export function useAsync<T, Args extends unknown[]>(
  fn: (...args: Args) => Promise<T>
) {
  const data = shallowRef<T | null>(null);
  const error = ref<Error | null>(null);
  const loading = ref(false);
  const lastArgs = ref<Args | null>(null) as Ref<Args | null>;

  async function execute(...args: Args) {
    loading.value = true;
    error.value = null;
    lastArgs.value = args;
    try {
      data.value = await fn(...args);
      return data.value;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err));
      return null;
    } finally {
      loading.value = false;
    }
  }

  const isIdle = computed(() => !loading.value && data.value === null && error.value === null);

  return { data, error, loading, isIdle, execute };
}

export type { Ref };
