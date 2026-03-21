// Vue 3 测试模式 — Vitest + @vue/test-utils、组件测试、Composable 测试、Mock 注入
// 使用 Vue Testing Library 和 Vitest

import { computed, ref } from "vue";

// ===== 1. 被测 Composable =====

export function useCounter(initial = 0) {
  const count = ref(initial);
  const doubled = computed(() => count.value * 2);
  const isPositive = computed(() => count.value > 0);

  function increment(by = 1) { count.value += by; }
  function decrement(by = 1) { count.value -= by; }
  function reset() { count.value = initial; }
  function setValue(v: number) { count.value = v; }

  return { count, doubled, isPositive, increment, decrement, reset, setValue };
}

// ===== 2. 被测 Component（defineComponent 风格）=====

export interface TodoItem {
  id: number;
  text: string;
  done: boolean;
}

export function useTodoList(initialItems: TodoItem[] = []) {
  const items = ref<TodoItem[]>([...initialItems]);
  let nextId = Math.max(0, ...initialItems.map((i) => i.id)) + 1;

  const pending = computed(() => (items.value as TodoItem[]).filter((i) => !i.done));
  const completed = computed(() => (items.value as TodoItem[]).filter((i) => i.done));
  const allDone = computed(() => (items.value as TodoItem[]).length > 0 && (items.value as TodoItem[]).every((i) => i.done));

  function add(text: string): TodoItem {
    const item: TodoItem = { id: nextId++, text: text.trim(), done: false };
    (items.value as TodoItem[]).push(item);
    return item;
  }

  function toggle(id: number): void {
    const item = (items.value as TodoItem[]).find((i) => i.id === id);
    if (item) item.done = !item.done;
  }

  function remove(id: number): void {
    items.value = (items.value as TodoItem[]).filter((i) => i.id !== id);
  }

  function clearCompleted(): void {
    items.value = (items.value as TodoItem[]).filter((i) => !i.done);
  }

  return { items, pending, completed, allDone, add, toggle, remove, clearCompleted };
}

// ===== 3. 测试辅助工厂 =====

export function createTestItems(count: number): TodoItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    text: `Item ${i + 1}`,
    done: i % 2 === 0,
  }));
}

// ===== 4. 内联单元测试（可直接 node 运行）=====

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`FAIL: ${message}`);
  console.log(`  ✓ ${message}`);
}

export function runCounterTests(): void {
  console.log("useCounter tests:");

  const counter = useCounter(10);
  assert(counter.count.value === 10, "initial value");
  assert(counter.doubled.value === 20, "doubled computed");
  assert(!counter.isPositive.value, "not positive at 10? — should be positive");

  counter.increment();
  assert(counter.count.value === 11, "increment by 1");

  counter.increment(5);
  assert(counter.count.value === 16, "increment by 5");

  counter.decrement(6);
  assert(counter.count.value === 10, "decrement by 6");

  counter.reset();
  assert(counter.count.value === 10, "reset to initial");

  counter.setValue(0);
  assert(!counter.isPositive.value, "isPositive false at 0");

  counter.increment();
  assert(counter.isPositive.value, "isPositive true after increment");
}

export function runTodoListTests(): void {
  console.log("useTodoList tests:");

  const list = useTodoList();

  const item = list.add("Buy milk");
  assert(item.text === "Buy milk", "add returns new item");
  assert(!item.done, "new item not done");
  assert((list.items.value as TodoItem[]).length === 1, "items has 1 entry");
  assert((list.pending.value as TodoItem[]).length === 1, "one pending");
  assert((list.completed.value as TodoItem[]).length === 0, "zero completed");

  list.toggle(item.id);
  assert(item.done, "toggle marks done");
  assert((list.completed.value as TodoItem[]).length === 1, "one completed");

  list.toggle(item.id);
  assert(!item.done, "toggle unmarks done");

  list.add("Walk dog");
  list.toggle(item.id); // mark first done
  list.clearCompleted();
  assert((list.items.value as TodoItem[]).length === 1, "clearCompleted removes done items");

  list.remove((list.items.value as TodoItem[])[0].id);
  assert((list.items.value as TodoItem[]).length === 0, "remove works");
  assert(!list.allDone.value, "allDone false when empty");
}

// ===== 5. Vitest 测试示例（注释形式）=====

// --- counter.test.ts ---
// import { describe, it, expect } from 'vitest'
// import { useCounter } from './example'
//
// describe('useCounter', () => {
//   it('initializes with correct value', () => {
//     const { count } = useCounter(5)
//     expect(count.value).toBe(5)
//   })
//   it('increments', () => {
//     const { count, increment } = useCounter()
//     increment(3)
//     expect(count.value).toBe(3)
//   })
// })

// --- component.test.ts (@vue/test-utils) ---
// import { mount } from '@vue/test-utils'
// import MyComponent from './MyComponent.vue'
//
// it('renders a button', () => {
//   const wrapper = mount(MyComponent, { props: { label: 'Click' } })
//   expect(wrapper.find('button').text()).toBe('Click')
// })
// it('emits click', async () => {
//   const wrapper = mount(MyComponent, { props: { label: 'Go' } })
//   await wrapper.find('button').trigger('click')
//   expect(wrapper.emitted('click')).toHaveLength(1)
// })

if (typeof process !== "undefined" && process.argv[1]?.endsWith("example.ts")) {
  runCounterTests();
  runTodoListTests();
  console.log("All inline tests passed.");
}

export type { TodoItem as TodoItemType };
