import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface ListItem {
  id: string;
  [key: string]: unknown;
}

export interface ListFilters {
  search: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  [key: string]: unknown;
}

interface InfiniteListState<T extends ListItem = ListItem> {
  items: T[];
  cursor: string | null;
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  filters: ListFilters;
  total: number | null;
  error: string | null;
}

interface InfiniteListActions<T extends ListItem = ListItem> {
  fetchInitial: () => Promise<void>;
  fetchMore: () => Promise<void>;
  setFilter: (key: keyof ListFilters, value: unknown) => void;
  setFilters: (filters: Partial<ListFilters>) => void;
  resetFilters: () => void;
  refresh: () => Promise<void>;
  deleteItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<T>) => void;
}

const defaultFilters: ListFilters = { search: "", sortBy: "createdAt", sortOrder: "desc" };

// Factory function to create a typed store for any list
export function createInfiniteListStore<T extends ListItem>(
  fetchFn: (cursor: string | null, filters: ListFilters) => Promise<{
    items: T[];
    cursor: string | null;
    hasMore: boolean;
    total?: number;
  }>,
  storeName: string
) {
  return create<InfiniteListState<T> & InfiniteListActions<T>>()(
    devtools(
      (set, get) => ({
        items: [],
        cursor: null,
        hasMore: true,
        isLoading: false,
        isLoadingMore: false,
        filters: defaultFilters,
        total: null,
        error: null,

        fetchInitial: async () => {
          set({ isLoading: true, error: null }, false, `${storeName}/fetchStart`);
          try {
            const { items, cursor, hasMore, total } = await fetchFn(null, get().filters);
            set({ items, cursor, hasMore, total: total ?? null, isLoading: false }, false, `${storeName}/fetchSuccess`);
          } catch (err) {
            set({ isLoading: false, error: (err as Error).message }, false, `${storeName}/fetchError`);
          }
        },

        fetchMore: async () => {
          const { cursor, hasMore, isLoadingMore } = get();
          if (!hasMore || isLoadingMore) return;
          set({ isLoadingMore: true }, false, `${storeName}/fetchMoreStart`);
          try {
            const { items, cursor: nextCursor, hasMore: nextHasMore } = await fetchFn(cursor, get().filters);
            set((s) => ({
              items: [...s.items, ...items],
              cursor: nextCursor,
              hasMore: nextHasMore,
              isLoadingMore: false,
            }), false, `${storeName}/fetchMoreSuccess`);
          } catch (err) {
            set({ isLoadingMore: false, error: (err as Error).message }, false, `${storeName}/fetchMoreError`);
          }
        },

        setFilter: (key, value) => {
          set((s) => ({ filters: { ...s.filters, [key]: value } }), false, `${storeName}/setFilter`);
          get().fetchInitial();
        },

        setFilters: (filters) => {
          set((s) => ({ filters: { ...s.filters, ...filters } }), false, `${storeName}/setFilters`);
          get().fetchInitial();
        },

        resetFilters: () => {
          set({ filters: defaultFilters }, false, `${storeName}/resetFilters`);
          get().fetchInitial();
        },

        refresh: async () => {
          set({ cursor: null, items: [], hasMore: true }, false, `${storeName}/refresh`);
          await get().fetchInitial();
        },

        deleteItem: (id) =>
          set((s) => ({ items: s.items.filter((i) => i.id !== id) }), false, `${storeName}/delete`),

        updateItem: (id, updates) =>
          set((s) => ({
            items: s.items.map((i) => i.id === id ? { ...i, ...updates } : i),
          }), false, `${storeName}/update`),
      }),
      { name: storeName }
    )
  );
}

// Example usage
export interface Project { id: string; name: string; status: string; createdAt: string; }

export const useProjectListStore = createInfiniteListStore<Project>(
  async (cursor, filters) => {
    const params = new URLSearchParams({ ...(cursor ? { cursor } : {}), ...Object.fromEntries(
      Object.entries(filters).map(([k, v]) => [k, String(v)])
    ) });
    const res = await fetch(`/api/projects?${params}`);
    if (!res.ok) throw new Error("Failed to fetch projects");
    return res.json();
  },
  "ProjectListStore"
);
