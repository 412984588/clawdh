// TypeScript 品牌类型 / 标称类型 (Branded Types / Nominal Types)
// 解决 TypeScript 结构类型系统的"ID 混淆"问题

// ===== 1. 品牌类型基础 =====

// 通用 Brand 工具类型
declare const __brand: unique symbol;
type Brand<T, B> = T & { readonly [__brand]: B };

// 创建不可混用的 ID 类型
type UserId = Brand<string, "UserId">;
type PostId = Brand<string, "PostId">;
type OrderId = Brand<string, "OrderId">;

// 安全的构造函数（类型守卫）
function createUserId(id: string): UserId {
  if (!id.startsWith("usr_")) throw new Error(`Invalid UserId: ${id}`);
  return id as UserId;
}

function createPostId(id: string): PostId {
  if (!id.startsWith("pst_")) throw new Error(`Invalid PostId: ${id}`);
  return id as PostId;
}

// 使用示例 — 编译期防止 ID 混淆
function getUser(id: UserId) { return { id, name: "Alice" }; }
function getPost(id: PostId) { return { id, title: "Hello" }; }

// getUser(createPostId("pst_123")); // 编译错误！类型不匹配
// getPost(createUserId("usr_456")); // 编译错误！类型不匹配

// ===== 2. 货币金额类型 =====

type USD = Brand<number, "USD">;
type EUR = Brand<number, "EUR">;
type CNY = Brand<number, "CNY">;

function usd(amount: number): USD { return amount as USD; }
function eur(amount: number): EUR { return amount as EUR; }
function cny(amount: number): CNY { return amount as CNY; }

// 货币运算（类型安全，不会把美元加欧元）
function addUSD(a: USD, b: USD): USD { return (a + b) as USD; }

const price = usd(9.99);
const tax = usd(0.89);
const total = addUSD(price, tax); // USD ✓
// addUSD(price, eur(1.0));         // 编译错误！不能把 EUR 当 USD 加

// ===== 3. 已验证/已清理字符串 =====

type ValidEmail = Brand<string, "ValidEmail">;
type SanitizedHtml = Brand<string, "SanitizedHtml">;
type HashedPassword = Brand<string, "HashedPassword">;

function validateEmail(email: string): ValidEmail {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error(`Invalid email: ${email}`);
  }
  return email as ValidEmail;
}

function sanitize(html: string): SanitizedHtml {
  // 实际项目中使用 DOMPurify 或 sanitize-html
  return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") as SanitizedHtml;
}

// 只有通过验证的 email 才能传入 sendEmail
function sendEmail(to: ValidEmail, subject: string, body: SanitizedHtml) {
  console.log(`Sending to ${to}: ${subject}`);
}

// ===== 4. 测量单位品牌 =====

type Meters = Brand<number, "Meters">;
type Kilograms = Brand<number, "Kilograms">;
type Seconds = Brand<number, "Seconds">;
type MetersPerSecond = Brand<number, "MetersPerSecond">;

function meters(n: number): Meters { return n as Meters; }
function kilograms(n: number): Kilograms { return n as Kilograms; }
function seconds(n: number): Seconds { return n as Seconds; }

function calcSpeed(distance: Meters, time: Seconds): MetersPerSecond {
  return (distance / time) as MetersPerSecond;
}

const d = meters(100);
const t = seconds(9.58);
const speed = calcSpeed(d, t); // MetersPerSecond

// ===== 5. 非空字符串品牌 =====

type NonEmptyString = Brand<string, "NonEmptyString">;

function nonEmpty(s: string): NonEmptyString {
  if (s.trim().length === 0) throw new Error("String cannot be empty");
  return s as NonEmptyString;
}

// 正范围数字
type PositiveNumber = Brand<number, "PositiveNumber">;
type Percentage = Brand<number, "Percentage">; // 0-100

function positive(n: number): PositiveNumber {
  if (n <= 0) throw new Error(`${n} is not positive`);
  return n as PositiveNumber;
}

function percentage(n: number): Percentage {
  if (n < 0 || n > 100) throw new Error(`${n} is not a valid percentage`);
  return n as Percentage;
}

// ===== 6. 品牌类型 + 泛型组合 =====

// 通用只读品牌（标记为"已冻结"的对象）
type Frozen<T> = T & Brand<T, "Frozen">;

function freeze<T extends object>(obj: T): Frozen<T> {
  return Object.freeze(obj) as Frozen<T>;
}

// 通用已验证品牌
type Validated<T> = T & Brand<T, "Validated">;

function validate<T>(value: T, schema: (v: T) => boolean): Validated<T> {
  if (!schema(value)) throw new Error("Validation failed");
  return value as Validated<T>;
}

// ===== 导出 =====
export type {
  Brand, UserId, PostId, OrderId,
  USD, EUR, CNY,
  ValidEmail, SanitizedHtml, HashedPassword,
  Meters, Kilograms, Seconds, MetersPerSecond,
  NonEmptyString, PositiveNumber, Percentage,
  Frozen, Validated,
};

export { createUserId, createPostId, usd, eur, cny, validateEmail, sanitize };
export { meters, kilograms, seconds, nonEmpty, positive, percentage };
