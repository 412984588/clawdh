// TypeScript infer 关键字
// infer 在条件类型的 extends 子句中捕获类型，延迟推断

// ===== 1. 内置工具类型的 infer 实现 =====

// ReturnType<T> — 获取函数返回类型
type ReturnType_<T extends (...args: unknown[]) => unknown> =
  T extends (...args: unknown[]) => infer R ? R : never;

// Parameters<T> — 获取函数参数类型元组
type Parameters_<T extends (...args: unknown[]) => unknown> =
  T extends (...args: infer P) => unknown ? P : never;

// ConstructorParameters<T> — 获取构造函数参数
type ConstructorParameters_<T extends abstract new (...args: unknown[]) => unknown> =
  T extends abstract new (...args: infer P) => unknown ? P : never;

// InstanceType<T> — 获取类的实例类型
type InstanceType_<T extends abstract new (...args: unknown[]) => unknown> =
  T extends abstract new (...args: unknown[]) => infer I ? I : never;

// 测试
declare function fetchUser(id: number, token: string): Promise<{ name: string }>;
type FetchParams = Parameters_<typeof fetchUser>;      // [number, string]
type FetchReturn = ReturnType_<typeof fetchUser>;      // Promise<{ name: string }>

// ===== 2. Promise 解包 =====

// 递归解包嵌套 Promise
type UnwrapPromise<T> = T extends Promise<infer U> ? UnwrapPromise<U> : T;

type A = UnwrapPromise<Promise<string>>;                // string
type B = UnwrapPromise<Promise<Promise<number>>>;        // number
type C = UnwrapPromise<boolean>;                        // boolean (非 Promise 原样返回)

// ===== 3. 数组/元组操作 =====

// 获取数组元素类型
type ArrayElement<T> = T extends (infer E)[] ? E : never;

// 获取元组第一个元素
type Head<T extends unknown[]> = T extends [infer H, ...unknown[]] ? H : never;

// 获取元组最后一个元素
type Last<T extends unknown[]> = T extends [...unknown[], infer L] ? L : never;

// 获取元组的尾部（去掉第一个元素）
type Tail<T extends unknown[]> = T extends [unknown, ...infer Rest] ? Rest : never;

// 测试
type Tuple = [string, number, boolean];
type FirstEl = Head<Tuple>;   // string
type LastEl = Last<Tuple>;    // boolean
type TailEl = Tail<Tuple>;    // [number, boolean]

// ===== 4. 字符串 infer =====

// 提取字符串前缀后的部分
type RemovePrefix<S extends string, P extends string> =
  S extends `${P}${infer Rest}` ? Rest : S;

type WithoutGet = RemovePrefix<"getUserById", "get">; // "UserById"
type WithoutOn = RemovePrefix<"onClick", "on">;        // "Click"

// 提取 URL 路径参数
type ExtractParams<Path extends string> =
  Path extends `${string}:${infer Param}/${infer Rest}`
    ? Param | ExtractParams<`/${Rest}`>
    : Path extends `${string}:${infer Param}`
    ? Param
    : never;

type Params1 = ExtractParams<"/users/:userId">;               // "userId"
type Params2 = ExtractParams<"/users/:userId/posts/:postId">; // "userId" | "postId"

// ===== 5. 函数重载推断 =====

// 推断 async 函数的真实返回类型（去掉 Promise 包装）
type AsyncReturnType<T extends (...args: unknown[]) => Promise<unknown>> =
  T extends (...args: unknown[]) => Promise<infer R> ? R : never;

declare async function loadData(): Promise<{ id: number; data: string[] }>;
type LoadDataResult = AsyncReturnType<typeof loadData>;
// { id: number; data: string[] }

// ===== 6. 深度 infer — 提取嵌套类型 =====

// 提取对象特定路径的类型
type GetNested<T, K extends keyof T> = T[K] extends { value: infer V } ? V : T[K];

interface FormField {
  value: string;
  error?: string;
  touched: boolean;
}

interface FormState {
  username: FormField;
  password: FormField;
}

// 直接提取 FormField.value 的类型
type FieldValue = GetNested<FormState, "username">; // string（提取 FormField.value）

// ===== 7. 条件类型中多个 infer =====

// 同时推断多个位置
type Split<S extends string, D extends string> =
  S extends `${infer Head}${D}${infer Tail}`
    ? [Head, ...Split<Tail, D>]
    : [S];

type Parts = Split<"a.b.c", ".">;          // ["a", "b", "c"]
type CSV = Split<"hello,world,!", ",">;    // ["hello", "world", "!"]

// ===== 导出 =====
export type {
  ReturnType_, Parameters_, ConstructorParameters_, InstanceType_,
  UnwrapPromise, ArrayElement, Head, Last, Tail,
  RemovePrefix, ExtractParams, AsyncReturnType,
  GetNested, Split,
};
