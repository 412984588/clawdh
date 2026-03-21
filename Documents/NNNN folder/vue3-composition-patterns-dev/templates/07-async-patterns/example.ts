// Vue 3 异步模式 — async setup、Suspense、defineAsyncComponent、错误边界
// 充分利用 Vue 3 的 Suspense 和异步组合式 API

import {
  computed,
  defineAsyncComponent,
  onErrorCaptured,
  ref,
  shallowRef,
  type AsyncComponentOptions,
} from "vue";

// ===== 1. defineAsyncComponent — 懒加载组件 =====

// 基础懒加载
// const AsyncModal = defineAsyncComponent(() => import('./Modal.vue'))

// 带加载/错误状态的高级懒加载
export function createLazyComponent(loader: () => Promise<object>, options?: AsyncComponentOptions) {
  return defineAsyncComponent({
    loader,
    loadingComponent: options?.loadingComponent,
    errorComponent: options?.errorComponent,
    delay: options?.delay ?? 200,
    timeout: options?.timeout ?? 5000,
    onError(error, retry, fail, attempts) {
      if (attempts <= 3) {
        setTimeout(retry, 1000 * attempts); // 指数退避
      } else {
        fail();
      }
    },
  });
}

// ===== 2. async setup — Suspense 感知 =====

// 在 <script setup> 中直接用 await，配合 Suspense 组件：
// <Suspense>
//   <template #default><AsyncChild /></template>
//   <template #fallback><LoadingSpinner /></template>
// </Suspense>

// async setup 等效（用于演示）
export async function asyncSetupExample() {
  // 可以直接 await，Suspense 会捕获 Promise
  const [users, posts] = await Promise.all([
    fetch("/api/users").then((r) => r.json()),
    fetch("/api/posts").then((r) => r.json()),
  ]);
  return { users, posts };
}

// ===== 3. 错误边界（onErrorCaptured）=====

export function useErrorBoundary() {
  const error = ref<Error | null>(null);
  const hasError = computed(() => error.value !== null);

  // 在父组件 setup 中调用
  onErrorCaptured((err) => {
    error.value = err instanceof Error ? err : new Error(String(err));
    return false; // 阻止错误向上传播
  });

  function reset() { error.value = null; }

  return { error, hasError, reset };
}

// ===== 4. 并发请求与竞态条件处理 =====

export function useRaceFreeFetch<T>(fetchFn: (signal: AbortSignal) => Promise<T>) {
  const data = shallowRef<T | null>(null);
  const loading = ref(false);
  const error = ref<Error | null>(null);
  let controller: AbortController | null = null;

  async function fetch(..._args: unknown[]) {
    // 取消上一次未完成的请求
    controller?.abort();
    controller = new AbortController();
    const { signal } = controller;

    loading.value = true;
    error.value = null;

    try {
      data.value = await fetchFn(signal);
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        error.value = err instanceof Error ? err : new Error(String(err));
      }
    } finally {
      if (!signal.aborted) loading.value = false;
    }
  }

  function cancel() { controller?.abort(); }

  return { data, loading, error, fetch, cancel };
}

// ===== 5. 分页异步加载 =====

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  hasMore: boolean;
}

export function usePaginatedLoader<T>(
  loadPage: (page: number) => Promise<PaginatedResult<T>>
) {
  const items = ref<T[]>([]) as ReturnType<typeof ref<T[]>>;
  const loading = ref(false);
  const loadingMore = ref(false);
  const error = ref<Error | null>(null);
  const currentPage = ref(0);
  const hasMore = ref(true);
  const total = ref(0);

  async function loadFirst() {
    loading.value = true;
    (items.value as T[]).length = 0;
    currentPage.value = 0;
    hasMore.value = true;
    error.value = null;
    try {
      const result = await loadPage(1);
      (items.value as T[]).push(...result.data);
      currentPage.value = 1;
      hasMore.value = result.hasMore;
      total.value = result.total;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err));
    } finally {
      loading.value = false;
    }
  }

  async function loadMore() {
    if (!hasMore.value || loadingMore.value) return;
    loadingMore.value = true;
    try {
      const result = await loadPage(currentPage.value + 1);
      (items.value as T[]).push(...result.data);
      currentPage.value++;
      hasMore.value = result.hasMore;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err));
    } finally {
      loadingMore.value = false;
    }
  }

  return { items, loading, loadingMore, error, hasMore, total, loadFirst, loadMore };
}

// ===== 6. 乐观更新模式 =====

export function useOptimisticUpdate<T extends { id: number }>(
  initialItems: T[]
) {
  const items = ref<T[]>([...initialItems]) as ReturnType<typeof ref<T[]>>;
  const pending = ref<Set<number>>(new Set());

  async function optimisticUpdate(
    id: number,
    updater: (item: T) => T,
    persist: () => Promise<void>
  ) {
    const arr = items.value as T[];
    const idx = arr.findIndex((i) => i.id === id);
    if (idx === -1) return;

    const original = arr[idx];
    arr[idx] = updater(original); // 乐观更新
    (pending.value as Set<number>).add(id);

    try {
      await persist();
    } catch {
      arr[idx] = original; // 回滚
    } finally {
      (pending.value as Set<number>).delete(id);
    }
  }

  return { items, pending, optimisticUpdate };
}

export type { AsyncComponentOptions };
