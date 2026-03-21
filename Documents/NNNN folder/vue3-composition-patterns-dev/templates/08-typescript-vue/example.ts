// Vue 3 TypeScript 最佳实践 — 类型化 props/emits、泛型组件、类型化 composable
// 充分利用 Vue 3 + TypeScript 的类型推断

import {
  computed,
  defineComponent,
  ref,
  type ComputedRef,
  type DefineComponent,
  type PropType,
  type Ref,
} from "vue";

// ===== 1. 精确类型化 Props =====

// 使用泛型约束 props 类型
export interface SelectOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
  group?: string;
}

export interface SelectProps<T = string> {
  modelValue: T | null;
  options: SelectOption<T>[];
  placeholder?: string;
  multiple?: boolean;
  clearable?: boolean;
  searchable?: boolean;
}

export const TypedSelect = defineComponent({
  props: {
    modelValue: { type: null as unknown as PropType<string | null>, default: null },
    options: { type: Array as PropType<SelectOption<string>[]>, required: true },
    placeholder: { type: String, default: "Select..." },
    multiple: { type: Boolean, default: false },
    clearable: { type: Boolean, default: false },
    searchable: { type: Boolean, default: false },
  },
  emits: {
    "update:modelValue": (_value: string | null) => true,
    change: (_value: string | null, _option: SelectOption<string> | null) => true,
  },
  setup(props, { emit }) {
    const query = ref("");
    const isOpen = ref(false);

    const filteredOptions = computed(() => {
      if (!props.searchable || !query.value) return props.options;
      return props.options.filter((o) =>
        o.label.toLowerCase().includes(query.value.toLowerCase())
      );
    });

    function select(option: SelectOption<string>) {
      if (option.disabled) return;
      emit("update:modelValue", option.value);
      emit("change", option.value, option);
      isOpen.value = false;
      query.value = "";
    }

    function clear() {
      emit("update:modelValue", null);
      emit("change", null, null);
    }

    return { query, isOpen, filteredOptions, select, clear };
  },
});

// ===== 2. 泛型 composable =====

export interface UseListOptions<T> {
  initialItems?: T[];
  keyExtractor?: (item: T) => string | number;
  sortFn?: (a: T, b: T) => number;
}

export interface UseListReturn<T> {
  items: ComputedRef<T[]>;
  count: ComputedRef<number>;
  isEmpty: ComputedRef<boolean>;
  add: (item: T) => void;
  remove: (key: string | number) => void;
  update: (key: string | number, updater: (item: T) => T) => void;
  clear: () => void;
  find: (key: string | number) => T | undefined;
}

export function useList<T>(
  options: UseListOptions<T> = {}
): UseListReturn<T> {
  const { initialItems = [], keyExtractor = (_, i) => i, sortFn } = options;
  const _list = ref<T[]>([...initialItems]) as Ref<T[]>;

  const items = computed(() =>
    sortFn ? [..._list.value].sort(sortFn) : _list.value
  );
  const count = computed(() => _list.value.length);
  const isEmpty = computed(() => _list.value.length === 0);

  function _key(item: T, idx: number): string | number {
    return keyExtractor(item, idx as unknown as never);
  }

  function add(item: T): void {
    _list.value = [..._list.value, item];
  }

  function remove(key: string | number): void {
    _list.value = _list.value.filter((item, idx) => _key(item, idx) !== key);
  }

  function update(key: string | number, updater: (item: T) => T): void {
    _list.value = _list.value.map((item, idx) =>
      _key(item, idx) === key ? updater(item) : item
    );
  }

  function clear(): void {
    _list.value = [];
  }

  function find(key: string | number): T | undefined {
    return _list.value.find((item, idx) => _key(item, idx) === key);
  }

  return { items, count, isEmpty, add, remove, update, clear, find };
}

// ===== 3. 事件类型推断 =====

// 强类型 emit 函数工厂
type EventMap = Record<string, unknown[]>;

export function createTypedEmitter<T extends EventMap>() {
  type EmitFn = <K extends keyof T>(event: K, ...args: T[K]) => void;
  const handlers = new Map<keyof T, Set<(...args: unknown[]) => void>>();

  const on = <K extends keyof T>(event: K, handler: (...args: T[K]) => void) => {
    if (!handlers.has(event)) handlers.set(event, new Set());
    handlers.get(event)!.add(handler as (...args: unknown[]) => void);
    return () => handlers.get(event)?.delete(handler as (...args: unknown[]) => void);
  };

  const emit: EmitFn = (event, ...args) => {
    handlers.get(event)?.forEach((h) => h(...(args as unknown[])));
  };

  return { on, emit };
}

// ===== 4. 组件类型提取工具 =====

// 从 defineComponent 提取 props 类型
export type ExtractProps<C> = C extends DefineComponent<infer P, unknown, unknown> ? P : never;

// 提取组件 emits 类型
export type ExtractEmits<C> = C extends { $emit: infer E } ? E : never;

// ===== 5. 类型安全的 inject =====

export function useInjectRequired<T>(
  key: symbol,
  errorMessage: string
): T {
  const value = undefined as unknown as T; // 实际：inject(key)
  if (value === undefined) throw new Error(errorMessage);
  return value;
}

// ===== 6. Ref 工具类型 =====

export type MaybeRef<T> = T | Ref<T>;

export function unref<T>(val: MaybeRef<T>): T {
  return val && typeof val === "object" && "value" in (val as object)
    ? (val as Ref<T>).value
    : (val as T);
}

export function toRef<T>(val: MaybeRef<T>): Ref<T> {
  if (val && typeof val === "object" && "value" in (val as object)) {
    return val as Ref<T>;
  }
  return ref(val) as Ref<T>;
}

export type { PropType, DefineComponent, ComputedRef, Ref };
