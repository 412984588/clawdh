// TypeScript 分布式条件类型 (Distributive Conditional Types)
// 当条件类型的检查类型是裸类型参数时，会自动分布在联合类型上

// ===== 1. 分布式行为 =====

// 裸类型参数 T（触发分布）
type Flatten<T> = T extends unknown[] ? T[number] : T;
// Flatten<string[] | number[]>
// = (string[] extends unknown[] ? string : string[]) | (number[] extends unknown[] ? number : number[])
// = string | number  ✓

// 非裸类型参数（不触发分布）
type NoDistribute<T> = [T] extends [unknown[]] ? T[number] : T;
// NoDistribute<string[] | number[]>
// = ([string[] | number[]] extends [unknown[]] ? ...) — 整体判断，不分布

// ===== 2. 内置分布式工具 =====

// Extract 和 Exclude 都是分布式的
type A = Extract<string | number | boolean, string | number>; // string | number
type B = Exclude<string | number | boolean, boolean>;         // string | number

// NonNullable 同样分布式
type C = NonNullable<string | null | undefined | number>; // string | number

// ===== 3. 自定义分布式类型 =====

// 将联合类型中每个成员变为数组
type ToArray<T> = T extends unknown ? T[] : never;
type StrOrNumArr = ToArray<string | number>; // string[] | number[]
// 注意：不是 (string | number)[]，而是分别包装

// 将联合类型中每个成员包装为 Promise
type ToPromise<T> = T extends unknown ? Promise<T> : never;
type AsyncUnion = ToPromise<string | number>; // Promise<string> | Promise<number>

// ===== 4. 联合类型扁平化 =====

// 联合转交叉（分布式 + infer 技巧）
type UnionToIntersection<U> = (
  U extends unknown ? (x: U) => void : never
) extends (x: infer I) => void
  ? I
  : never;

type Combined = UnionToIntersection<{ a: string } | { b: number }>;
// { a: string } & { b: number }

type AllMethods = UnionToIntersection<
  { log(): void } | { warn(): void } | { error(): void }
>;
// { log(): void } & { warn(): void } & { error(): void }

// ===== 5. 获取联合类型的最后一个成员 =====

// 利用 UnionToIntersection 获取联合最后成员（高级技巧）
type UnionToLastMember<U> = UnionToIntersection<
  U extends unknown ? (x: U) => void : never
> extends (x: infer L) => void
  ? L
  : never;

type Last_ = UnionToLastMember<"a" | "b" | "c">; // "c"（顺序依赖 TS 内部实现）

// ===== 6. 联合类型转元组 =====

type UnionToTuple<U, T extends unknown[] = []> = [U] extends [never]
  ? T
  : UnionToTuple<Exclude<U, UnionToLastMember<U>>, [UnionToLastMember<U>, ...T]>;

type Tuple_ = UnionToTuple<"a" | "b" | "c">; // ["a", "b", "c"]（顺序依赖实现）

// ===== 7. 实用：联合类型操作工具集 =====

// 联合类型成员数量（利用元组长度）
type UnionSize<U> = UnionToTuple<U>["length"];
type Size1 = UnionSize<"a" | "b" | "c">; // 3
type Size2 = UnionSize<boolean>;           // 2（true | false）

// 检查联合类型是否包含某个成员
type IsUnionMember<U, T> = T extends U ? true : false;
type HasString = IsUnionMember<string | number, string>;  // boolean（分布了！）
// 要获得精确结果，需要用 [T] 避免分布
type HasStringExact<U, T> = [T] extends [U] ? true : false;
type HasStringResult = HasStringExact<string | number, string>; // true

// ===== 8. 实用场景：类型安全的事件系统 =====

// 定义各事件的 payload
type EventPayloadMap = {
  click: { x: number; y: number };
  focus: { target: string };
  blur: { target: string };
  submit: { data: Record<string, unknown> };
};

type EventType = keyof EventPayloadMap;

// 类型安全的事件处理器类型
type EventHandler<T extends EventType = EventType> =
  T extends EventType
    ? { type: T; handler: (payload: EventPayloadMap[T]) => void }
    : never;

// 通过分布式展开，每个事件类型都有精确的 payload 类型
type ClickHandler = EventHandler<"click">;
// { type: "click"; handler: (payload: { x: number; y: number }) => void }

type AnyHandler = EventHandler;
// 联合类型，每种 handler 都精确匹配

// ===== 导出 =====
export type {
  Flatten, NoDistribute,
  ToArray, ToPromise,
  UnionToIntersection, UnionToLastMember, UnionToTuple, UnionSize,
  IsUnionMember, HasStringExact,
  EventPayloadMap, EventType, EventHandler,
};
