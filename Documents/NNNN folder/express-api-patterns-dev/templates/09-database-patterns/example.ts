// Express.js 数据库集成模式 — TypeScript
// 连接池、Repository 模式、事务处理、查询构建器

// ===== 1. 数据库连接配置 =====

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
  pool?: {
    min: number;
    max: number;
    idleTimeoutMs?: number;
    connectionTimeoutMs?: number;
  };
}

// 从环境变量读取配置
export function getDatabaseConfig(): DatabaseConfig {
  return {
    host: process.env.DB_HOST ?? "localhost",
    port: parseInt(process.env.DB_PORT ?? "5432", 10),
    database: process.env.DB_NAME ?? "myapp",
    username: process.env.DB_USER ?? "postgres",
    password: process.env.DB_PASSWORD ?? "",
    ssl: process.env.DB_SSL === "true",
    pool: {
      min: parseInt(process.env.DB_POOL_MIN ?? "2", 10),
      max: parseInt(process.env.DB_POOL_MAX ?? "10", 10),
      idleTimeoutMs: 30_000,
      connectionTimeoutMs: 5_000,
    },
  };
}

// ===== 2. Repository 模式基类 =====

export interface PageOptions {
  page: number;
  limit: number;
  sort?: string;
  order?: "asc" | "desc";
}

export interface PageResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// 基础 Repository 接口
export interface IRepository<T, ID = number> {
  findById(id: ID): Promise<T | null>;
  findAll(options?: PageOptions): Promise<PageResult<T>>;
  create(data: Omit<T, "id" | "createdAt" | "updatedAt">): Promise<T>;
  update(id: ID, data: Partial<T>): Promise<T | null>;
  delete(id: ID): Promise<boolean>;
  count(where?: Partial<T>): Promise<number>;
}

// ===== 3. 用户 Repository 实现示例 =====

export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
  createdAt: Date;
  updatedAt: Date;
}

// 模拟数据库（实际项目中替换为 Prisma/Drizzle/Knex 等）
const usersTable: User[] = [
  { id: 1, name: "Alice", email: "alice@example.com", role: "admin", createdAt: new Date(), updatedAt: new Date() },
  { id: 2, name: "Bob", email: "bob@example.com", role: "user", createdAt: new Date(), updatedAt: new Date() },
];

export class UserRepository implements IRepository<User> {
  async findById(id: number): Promise<User | null> {
    return usersTable.find((u) => u.id === id) ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return usersTable.find((u) => u.email === email) ?? null;
  }

  async findAll(options: PageOptions = { page: 1, limit: 10 }): Promise<PageResult<User>> {
    const { page, limit, sort = "createdAt", order = "desc" } = options;
    let sorted = [...usersTable];

    sorted.sort((a, b) => {
      const av = a[sort as keyof User];
      const bv = b[sort as keyof User];
      const cmp = av! < bv! ? -1 : av! > bv! ? 1 : 0;
      return order === "asc" ? cmp : -cmp;
    });

    const total = sorted.length;
    const start = (page - 1) * limit;
    const data = sorted.slice(start, start + limit);

    return {
      data,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  async create(data: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
    const now = new Date();
    const user: User = {
      ...data,
      id: Math.max(...usersTable.map((u) => u.id), 0) + 1,
      createdAt: now,
      updatedAt: now,
    };
    usersTable.push(user);
    return user;
  }

  async update(id: number, data: Partial<User>): Promise<User | null> {
    const idx = usersTable.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    usersTable[idx] = { ...usersTable[idx], ...data, id, updatedAt: new Date() };
    return usersTable[idx];
  }

  async delete(id: number): Promise<boolean> {
    const idx = usersTable.findIndex((u) => u.id === id);
    if (idx === -1) return false;
    usersTable.splice(idx, 1);
    return true;
  }

  async count(where?: Partial<User>): Promise<number> {
    if (!where) return usersTable.length;
    return usersTable.filter((u) =>
      Object.entries(where).every(([k, v]) => u[k as keyof User] === v)
    ).length;
  }
}

// ===== 4. 事务包装器 =====

type TransactionCallback<T> = (trx: Transaction) => Promise<T>;

export interface Transaction {
  query<T>(sql: string, params?: unknown[]): Promise<T[]>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

// 事务工厂函数（实际使用 Knex/Prisma 的事务 API）
export async function withTransaction<T>(
  fn: TransactionCallback<T>
): Promise<T> {
  const trx = await beginTransaction();
  try {
    const result = await fn(trx);
    await trx.commit();
    return result;
  } catch (err) {
    await trx.rollback();
    throw err;
  }
}

// 占位实现
async function beginTransaction(): Promise<Transaction> {
  return {
    async query<T>(_sql: string, _params?: unknown[]): Promise<T[]> { return []; },
    async commit(): Promise<void> {},
    async rollback(): Promise<void> {},
  };
}

// ===== 5. 查询构建器辅助 =====

export interface WhereClause {
  [field: string]: unknown | { op: ">" | "<" | ">=" | "<=" | "!=" | "LIKE" | "IN"; value: unknown };
}

export function buildWhereClause(where: WhereClause): { sql: string; params: unknown[] } {
  const conditions: string[] = [];
  const params: unknown[] = [];

  for (const [field, value] of Object.entries(where)) {
    if (value === null) {
      conditions.push(`${field} IS NULL`);
    } else if (typeof value === "object" && "op" in value) {
      const clause = value as { op: string; value: unknown };
      if (clause.op === "IN" && Array.isArray(clause.value)) {
        const placeholders = clause.value.map(() => `$${params.length + 1}`).join(", ");
        conditions.push(`${field} IN (${placeholders})`);
        params.push(...clause.value);
      } else {
        conditions.push(`${field} ${clause.op} $${params.length + 1}`);
        params.push(clause.value);
      }
    } else {
      conditions.push(`${field} = $${params.length + 1}`);
      params.push(value);
    }
  }

  return {
    sql: conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "",
    params,
  };
}

// ===== 6. Service 层示例（包装 Repository）=====

export class UserService {
  constructor(private readonly repo: UserRepository) {}

  async getUser(id: number): Promise<User> {
    const user = await this.repo.findById(id);
    if (!user) throw new Error(`User ${id} not found`);
    return user;
  }

  async createUser(data: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
    const existing = await this.repo.findByEmail(data.email);
    if (existing) throw new Error(`Email ${data.email} already in use`);
    return this.repo.create(data);
  }

  async listUsers(options?: PageOptions): Promise<PageResult<User>> {
    return this.repo.findAll(options);
  }
}

// 单例（适合无状态服务）
export const userRepository = new UserRepository();
export const userService = new UserService(userRepository);

export { PageOptions, PageResult, IRepository };
