// TypeScript 类型安全的 Builder 模式
// 利用泛型参数跟踪已设置的字段，防止遗漏必填属性

// ===== 1. 简单 Builder（类实现）=====

interface QueryOptions {
  table: string;
  conditions: string[];
  orderBy?: string;
  limit?: number;
  offset?: number;
}

export class QueryBuilder {
  private options: Partial<QueryOptions> = { conditions: [] };

  from(table: string): this {
    this.options.table = table;
    return this;
  }

  where(condition: string): this {
    this.options.conditions!.push(condition);
    return this;
  }

  orderBy(field: string): this {
    this.options.orderBy = field;
    return this;
  }

  limit(n: number): this {
    this.options.limit = n;
    return this;
  }

  offset(n: number): this {
    this.options.offset = n;
    return this;
  }

  build(): string {
    if (!this.options.table) throw new Error("table is required");
    let sql = `SELECT * FROM ${this.options.table}`;
    if (this.options.conditions!.length) {
      sql += ` WHERE ${this.options.conditions!.join(" AND ")}`;
    }
    if (this.options.orderBy) sql += ` ORDER BY ${this.options.orderBy}`;
    if (this.options.limit !== undefined) sql += ` LIMIT ${this.options.limit}`;
    if (this.options.offset !== undefined) sql += ` OFFSET ${this.options.offset}`;
    return sql;
  }
}

// 使用示例
const query = new QueryBuilder()
  .from("users")
  .where("age > 18")
  .where("status = 'active'")
  .orderBy("created_at")
  .limit(10)
  .build();
// "SELECT * FROM users WHERE age > 18 AND status = 'active' ORDER BY created_at LIMIT 10"

// ===== 2. 类型安全 Builder（泛型跟踪已设置字段）=====
// 编译期强制必填字段被设置后才能调用 build()

type BuilderState = Record<string, unknown>;

// 标记字段已设置的辅助类型
type SetField<State extends BuilderState, K extends string, V> =
  State & Record<K, V>;

// 检查所有必填字段是否已设置
type HasRequired<State extends BuilderState, Required extends string> =
  Required extends keyof State ? true : false;

interface RequestConfig {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
}

// 类型安全的 HTTP 请求 Builder
export class RequestBuilder<State extends BuilderState = BuilderState> {
  private config: Partial<RequestConfig> = {};

  url(url: string): RequestBuilder<SetField<State, "url", string>> {
    this.config.url = url;
    return this as unknown as RequestBuilder<SetField<State, "url", string>>;
  }

  method(
    method: RequestConfig["method"]
  ): RequestBuilder<SetField<State, "method", string>> {
    this.config.method = method;
    return this as unknown as RequestBuilder<SetField<State, "method", string>>;
  }

  headers(
    headers: Record<string, string>
  ): RequestBuilder<State & { headers: true }> {
    this.config.headers = headers;
    return this as unknown as RequestBuilder<State & { headers: true }>;
  }

  body(body: unknown): RequestBuilder<State & { body: true }> {
    this.config.body = body;
    return this as unknown as RequestBuilder<State & { body: true }>;
  }

  timeout(ms: number): RequestBuilder<State & { timeout: true }> {
    this.config.timeout = ms;
    return this as unknown as RequestBuilder<State & { timeout: true }>;
  }

  // build() 只在 url 和 method 都已设置时才可调用
  build(
    this: RequestBuilder<State & { url: string; method: string }>
  ): RequestConfig {
    return this.config as RequestConfig;
  }
}

// 正常使用 — url 和 method 都设置后才能 build
const req = new RequestBuilder()
  .url("https://api.example.com/users")
  .method("POST")
  .headers({ "Content-Type": "application/json" })
  .body({ name: "Alice" })
  .build(); // ✓

// 缺少 url 或 method 时调用 build() 会产生编译错误
// new RequestBuilder().url("...").build(); // ✗ 缺少 method

// ===== 3. 不可变 Builder（每步返回新对象）=====

type DeepReadonly<T> = { readonly [K in keyof T]: T[K] };

export class ImmutableBuilder<T extends object> {
  private constructor(private readonly data: Partial<T>) {}

  static create<T extends object>(): ImmutableBuilder<T> {
    return new ImmutableBuilder<T>({});
  }

  set<K extends keyof T>(key: K, value: T[K]): ImmutableBuilder<T> {
    return new ImmutableBuilder<T>({ ...this.data, [key]: value });
  }

  build(): DeepReadonly<Partial<T>> {
    return Object.freeze({ ...this.data }) as DeepReadonly<Partial<T>>;
  }
}

interface UserProfile {
  name: string;
  email: string;
  role: "admin" | "user";
}

const profile = ImmutableBuilder.create<UserProfile>()
  .set("name", "Alice")
  .set("email", "alice@example.com")
  .set("role", "admin")
  .build();

// ===== 4. Builder with Validation =====

export class ValidatedBuilder<T extends object> {
  private data: Partial<T> = {};
  private errors: string[] = [];

  set<K extends keyof T>(key: K, value: T[K]): this {
    this.data[key] = value;
    return this;
  }

  validate(fn: (data: Partial<T>) => string | null): this {
    const error = fn(this.data);
    if (error) this.errors.push(error);
    return this;
  }

  build(): { value: T | null; errors: string[] } {
    if (this.errors.length > 0) {
      return { value: null, errors: this.errors };
    }
    return { value: this.data as T, errors: [] };
  }
}

// ===== 导出 =====
export type { QueryOptions, RequestConfig, BuilderState, SetField, HasRequired };
