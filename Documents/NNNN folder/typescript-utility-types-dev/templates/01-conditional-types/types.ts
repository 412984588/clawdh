// TypeScript 条件类型 (Conditional Types)
// 语法：T extends U ? TrueType : FalseType

// ===== 1. 基础条件类型 =====
type IsString<T> = T extends string ? true : false;
type IsArray<T> = T extends unknown[] ? true : false;
type IsFunction<T> = T extends (...args: unknown[]) => unknown ? true : false;

// 测试
type T1 = IsString<"hello">;     // true
type T2 = IsString<42>;          // false
type T3 = IsArray<number[]>;     // true
type T4 = IsFunction<() => void>; // true

// ===== 2. 内置条件类型工具 =====

// NonNullable<T> — 移除 null 和 undefined
type SafeString = NonNullable<string | null | undefined>; // string

// Extract<T, U> — 提取 T 中可赋值给 U 的类型
type OnlyStrings = Extract<string | number | boolean, string>; // string
type StringOrNumber = Extract<string | number | boolean, string | number>; // string | number

// Exclude<T, U> — 从 T 中排除可赋值给 U 的类型
type NoBoolean = Exclude<string | number | boolean, boolean>; // string | number
type NoNullish = Exclude<string | null | undefined, null | undefined>; // string

// ===== 3. 自定义条件类型 =====

// 类型是否为 Promise
type IsPromise<T> = T extends Promise<infer _> ? true : false;

// 解包 Promise
type Awaited_<T> = T extends Promise<infer U> ? U : T;
type Resolved = Awaited_<Promise<string>>;   // string
type NotWrapped = Awaited_<number>;           // number

// 获取数组元素类型
type ElementType<T> = T extends (infer E)[] ? E : never;
type StrEl = ElementType<string[]>;   // string
type NumEl = ElementType<number[][]>; // number[]

// ===== 4. 条件类型 + 映射类型组合 =====

// 仅保留对象中值为指定类型的键
type KeysOfType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  isActive: boolean;
}

type StringKeys = KeysOfType<User, string>;  // "name" | "email"
type NumberKeys = KeysOfType<User, number>;  // "id" | "age"
type BoolKeys = KeysOfType<User, boolean>;   // "isActive"

// ===== 5. 函数重载辅助类型 =====

// 获取函数最后一个重载的返回类型（TS 已内置 ReturnType）
type ReturnType_<T extends (...args: unknown[]) => unknown> =
  T extends (...args: unknown[]) => infer R ? R : never;

// 获取函数第一个参数类型
type FirstArg<T extends (arg: unknown, ...args: unknown[]) => unknown> =
  T extends (arg: infer A, ...args: unknown[]) => unknown ? A : never;

function greet(name: string): string { return `Hello, ${name}`; }
type GreetReturn = ReturnType_<typeof greet>; // string
type GreetArg = FirstArg<typeof greet>;       // string

// ===== 6. 条件类型的 never 裁剪 =====

// 从联合类型中过滤掉 never（自动裁剪）
type FilterNever<T> = T extends never ? never : T;

// 实用：构建类型安全的事件 map 子集
type ClickableEvents<Events extends Record<string, unknown>> = {
  [K in keyof Events]: K extends `on${string}` ? K : never;
}[keyof Events];

interface DOMEvents {
  onClick: MouseEvent;
  onFocus: FocusEvent;
  style: string;
  className: string;
}

type OnlyOnEvents = ClickableEvents<DOMEvents>; // "onClick" | "onFocus"

// ===== 导出 =====
export type {
  IsString, IsArray, IsFunction, IsPromise,
  Awaited_, ElementType,
  KeysOfType, ReturnType_, FirstArg,
  ClickableEvents,
};

export type { SafeString, OnlyStrings, StringOrNumber, NoBoolean, NoNullish };
