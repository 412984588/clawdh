// TypeScript 模板字面量类型 (Template Literal Types, TS 4.1+)
// 语法：`${Type1}${Type2}` — 在类型层面组合字符串

// ===== 1. 基础模板字面量类型 =====

// 拼接固定前缀/后缀
type EventName<T extends string> = `on${Capitalize<T>}`;
type ClickEvent = EventName<"click">;   // "onClick"
type FocusEvent_ = EventName<"focus">;  // "onFocus"
type SubmitEvent = EventName<"submit">; // "onSubmit"

// 分布在联合类型上（自动笛卡尔积）
type Direction = "top" | "bottom" | "left" | "right";
type Margin = `margin-${Direction}`;
// "margin-top" | "margin-bottom" | "margin-left" | "margin-right"

type Size = "sm" | "md" | "lg" | "xl";
type Variant = "primary" | "secondary" | "danger";
type ButtonClass = `btn-${Variant}-${Size}`;
// "btn-primary-sm" | "btn-primary-md" | ... (12 combinations)

// ===== 2. 内置字符串操作类型 =====

type Upper = Uppercase<"hello world">;    // "HELLO WORLD"
type Lower = Lowercase<"HELLO WORLD">;    // "hello world"
type Cap = Capitalize<"hello">;           // "Hello"
type Uncap = Uncapitalize<"Hello">;       // "hello"

// ===== 3. 从对象键生成事件类型 =====

interface Store {
  user: { name: string; email: string };
  cart: { items: string[]; total: number };
  theme: "light" | "dark";
}

// 生成 "user:change" | "cart:change" | "theme:change"
type StoreEvent = `${string & keyof Store}:change`;

// 生成带路径的事件名
type EventMap<T extends object> = {
  [K in keyof T & string]: `${K}:update` | `${K}:reset`;
}[keyof T & string];

type StoreEvents = EventMap<Store>;
// "user:update" | "user:reset" | "cart:update" | "cart:reset" | "theme:update" | "theme:reset"

// ===== 4. CSS 属性类型 =====

type CSSUnit = "px" | "rem" | "em" | "%" | "vw" | "vh";
type CSSValue = `${number}${CSSUnit}`;

type SpacingKey = `spacing-${1 | 2 | 4 | 8 | 16 | 32}`;
// "spacing-1" | "spacing-2" | "spacing-4" | ...

type TailwindColor = "red" | "blue" | "green" | "gray";
type TailwindShade = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
type TailwindColorClass = `${TailwindColor}-${TailwindShade}`;
// "red-100" | "red-200" | ... | "gray-900"

// ===== 5. 对象路径类型（扁平化嵌套键）=====

type Paths<T, Prefix extends string = ""> = T extends object
  ? {
      [K in keyof T & string]:
        | `${Prefix}${K}`
        | Paths<T[K], `${Prefix}${K}.`>;
    }[keyof T & string]
  : never;

interface AppConfig {
  database: { host: string; port: number; name: string };
  server: { port: number; ssl: boolean };
}

type ConfigPaths = Paths<AppConfig>;
// "database" | "database.host" | "database.port" | "database.name"
// | "server" | "server.port" | "server.ssl"

// ===== 6. HTTP 方法 + 路径生成 =====

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type ApiRoute = "/users" | "/posts" | "/comments";
type ApiEndpoint = `${HttpMethod} ${ApiRoute}`;
// "GET /users" | "POST /users" | ... (15 combinations)

// ===== 7. 版本字符串验证类型 =====

type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
type Version = `${Digit}.${Digit}.${Digit}`;
// 简化版本：实际项目中可以配合 branded types 做运行时验证

// ===== 8. 实用工具：类型安全的字符串操作 =====

// 将 camelCase 键名转为 snake_case（类型层面）
type CamelToSnake<S extends string> =
  S extends `${infer Head}${infer Tail}`
    ? Head extends Lowercase<Head>
      ? `${Head}${CamelToSnake<Tail>}`
      : `_${Lowercase<Head>}${CamelToSnake<Tail>}`
    : S;

type SnakeCaseKey = CamelToSnake<"myVariableName">; // "my_variable_name"
type SnakeCaseKey2 = CamelToSnake<"getUserById">;    // "get_user_by_id"

// 对象键全部转为 snake_case
type ToSnakeCase<T> = {
  [K in keyof T as CamelToSnake<string & K>]: T[K];
};

interface CamelUser {
  userId: number;
  firstName: string;
  lastName: string;
  createdAt: Date;
}

type SnakeUser = ToSnakeCase<CamelUser>;
// { user_id: number; first_name: string; last_name: string; created_at: Date; }

// ===== 导出 =====
export type {
  EventName, Margin, ButtonClass, StoreEvent, EventMap, StoreEvents,
  CSSUnit, CSSValue, SpacingKey, TailwindColorClass,
  Paths, ConfigPaths, ApiEndpoint,
  CamelToSnake, ToSnakeCase, SnakeUser,
};
