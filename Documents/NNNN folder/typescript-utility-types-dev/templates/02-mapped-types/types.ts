// TypeScript 映射类型 (Mapped Types)
// 语法：{ [K in keyof T]: NewType }

// ===== 1. 内置映射类型工具 =====

// Readonly<T> — 所有属性变为只读
interface Config {
  host: string;
  port: number;
  ssl: boolean;
}

type FrozenConfig = Readonly<Config>;
// { readonly host: string; readonly port: number; readonly ssl: boolean; }

// Partial<T> — 所有属性变为可选
type PartialConfig = Partial<Config>;
// { host?: string; port?: number; ssl?: boolean; }

// Required<T> — 所有属性变为必填（移除 ?）
interface FormState {
  name?: string;
  email?: string;
  age?: number;
}
type StrictFormState = Required<FormState>;
// { name: string; email: string; age: number; }

// Pick<T, K> — 只保留指定键
type HostConfig = Pick<Config, "host" | "port">;
// { host: string; port: number; }

// Omit<T, K> — 排除指定键
type NoSsl = Omit<Config, "ssl">;
// { host: string; port: number; }

// Record<K, V> — 创建键值对类型
type StatusMap = Record<"pending" | "active" | "inactive", boolean>;
// { pending: boolean; active: boolean; inactive: boolean; }

// ===== 2. 自定义映射类型 =====

// 所有属性变为 nullable
type Nullable<T> = { [K in keyof T]: T[K] | null };

// 所有属性变为 Promise
type Promisify<T> = { [K in keyof T]: Promise<T[K]> };

// 所有属性包装在数组中
type Arrayify<T> = { [K in keyof T]: T[K][] };

// ===== 3. 条件映射类型 =====

// 仅将指定类型的属性变为可选
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
}

// price 和 description 可选，其他必填
type CreateProductInput = PartialBy<Product, "id" | "description">;
// { name: string; price: number; id?: number; description?: string; }

// 仅将指定属性变为必填
type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// ===== 4. 键重映射 (as 子句，TS 4.1+) =====

// 将所有键添加前缀
type Prefixed<T, P extends string> = {
  [K in keyof T as `${P}${Capitalize<string & K>}`]: T[K];
};

type PrefixedConfig = Prefixed<Config, "app">;
// { appHost: string; appPort: number; appSsl: boolean; }

// 生成 getter/setter 方法对
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

type Setters<T> = {
  [K in keyof T as `set${Capitalize<string & K>}`]: (value: T[K]) => void;
};

type ConfigAccessors = Getters<Config> & Setters<Config>;
// { getHost(): string; getPort(): number; ...; setHost(v: string): void; ... }

// ===== 5. 过滤键 =====

// 仅保留值为函数的键（移除非函数属性）
type FunctionKeys<T> = {
  [K in keyof T]: T[K] extends (...args: unknown[]) => unknown ? K : never;
}[keyof T];

// 仅保留值为非函数的键（数据属性）
type DataKeys<T> = {
  [K in keyof T]: T[K] extends (...args: unknown[]) => unknown ? never : K;
}[keyof T];

type DataOnly<T> = Pick<T, DataKeys<T>>;
type MethodsOnly<T> = Pick<T, FunctionKeys<T>>;

interface Service {
  name: string;
  url: string;
  connect(): void;
  disconnect(): void;
  ping(): Promise<boolean>;
}

type ServiceData = DataOnly<Service>;     // { name: string; url: string; }
type ServiceMethods = MethodsOnly<Service>; // { connect(): void; disconnect(): void; ping(): Promise<boolean>; }

// ===== 6. 深度映射类型 =====

// 深度 Partial（递归）
type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

// 深度 Readonly（递归）
type DeepReadonly<T> = T extends (infer U)[]
  ? ReadonlyArray<DeepReadonly<U>>
  : T extends object
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;

interface AppState {
  user: { name: string; settings: { theme: string; lang: string } };
  data: number[];
}

type PartialState = DeepPartial<AppState>;
type FrozenState = DeepReadonly<AppState>;

// ===== 导出 =====
export type {
  Nullable, Promisify, Arrayify,
  PartialBy, RequireFields,
  Prefixed, Getters, Setters,
  FunctionKeys, DataKeys, DataOnly, MethodsOnly,
  DeepPartial, DeepReadonly,
};

export type { FrozenConfig, PartialConfig, StrictFormState, HostConfig, NoSsl, StatusMap };
