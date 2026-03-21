// TypeScript 类型守卫 (Type Guards)
// 在运行时缩窄类型，让 TS 编译器知道变量的具体类型

// ===== 1. typeof 守卫 =====

function processValue(value: string | number | boolean): string {
  if (typeof value === "string") {
    return value.toUpperCase(); // TS 知道 value 是 string
  }
  if (typeof value === "number") {
    return value.toFixed(2);    // TS 知道 value 是 number
  }
  return value.toString();      // TS 知道 value 是 boolean
}

// ===== 2. instanceof 守卫 =====

class NetworkError extends Error {
  constructor(message: string, public readonly statusCode: number) {
    super(message);
    this.name = "NetworkError";
  }
}

class ValidationError extends Error {
  constructor(message: string, public readonly field: string) {
    super(message);
    this.name = "ValidationError";
  }
}

function handleError(err: unknown): string {
  if (err instanceof NetworkError) {
    return `网络错误 ${err.statusCode}: ${err.message}`;
  }
  if (err instanceof ValidationError) {
    return `字段 "${err.field}" 验证失败: ${err.message}`;
  }
  if (err instanceof Error) {
    return `错误: ${err.message}`;
  }
  return `未知错误: ${String(err)}`;
}

// ===== 3. 用户自定义类型谓词 (is) =====

// 类型谓词语法：parameterName is Type
function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && !isNaN(value);
}

function isNonNull<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

// 对象类型守卫
interface User {
  id: number;
  name: string;
  email: string;
}

interface Admin extends User {
  role: "admin";
  permissions: string[];
}

function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "name" in value &&
    "email" in value &&
    typeof (value as User).id === "number" &&
    typeof (value as User).name === "string"
  );
}

function isAdmin(value: unknown): value is Admin {
  return isUser(value) && "role" in value && (value as Admin).role === "admin";
}

// 使用示例
const data: unknown = JSON.parse('{"id": 1, "name": "Alice", "email": "a@b.com"}');
if (isUser(data)) {
  console.log(data.email); // TS 知道 data 是 User
}

// ===== 4. 断言函数 (asserts) =====

// 断言成功则缩窄类型，失败则抛出异常
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== "string") {
    throw new TypeError(`Expected string, got ${typeof value}`);
  }
}

function assertIsDefined<T>(value: T): asserts value is NonNullable<T> {
  if (value === null || value === undefined) {
    throw new Error("Value is null or undefined");
  }
}

// 使用断言函数
function processInput(input: unknown): void {
  assertIsString(input);
  // 之后 input 的类型是 string
  console.log(input.toUpperCase());
}

// ===== 5. in 操作符守卫 =====

type Circle = { kind: "circle"; radius: number };
type Rectangle = { kind: "rect"; width: number; height: number };
type Shape = Circle | Rectangle;

function describeShape(shape: Shape): string {
  if ("radius" in shape) {
    return `圆形，半径 ${shape.radius}`;
  }
  return `矩形 ${shape.width}×${shape.height}`;
}

// ===== 6. 过滤数组中的 null/undefined =====

// 使用类型谓词过滤数组
function filterDefined<T>(arr: (T | null | undefined)[]): T[] {
  return arr.filter(isNonNull);
}

const mixed = ["alice", null, "bob", undefined, "charlie"];
const defined = filterDefined(mixed); // string[]

// ===== 7. 泛型类型守卫 =====

// 检查对象是否有某个键
function hasKey<K extends string>(
  obj: unknown,
  key: K
): obj is Record<K, unknown> {
  return typeof obj === "object" && obj !== null && key in obj;
}

// 检查值是否为枚举成员
function isEnumValue<T extends object>(
  enumObj: T,
  value: unknown
): value is T[keyof T] {
  return Object.values(enumObj).includes(value);
}

enum Status { Active = "active", Inactive = "inactive" }

function processStatus(raw: string): void {
  if (isEnumValue(Status, raw)) {
    // raw 的类型缩窄为 Status
    console.log(`Status: ${raw}`);
  }
}

// ===== 8. 联合类型的判别守卫 =====

type JsonValue =
  | { type: "string"; value: string }
  | { type: "number"; value: number }
  | { type: "boolean"; value: boolean }
  | { type: "null" };

function isJsonString(v: JsonValue): v is Extract<JsonValue, { type: "string" }> {
  return v.type === "string";
}

function serialize(v: JsonValue): string {
  if (isJsonString(v)) return `"${v.value}"`;
  if (v.type === "null") return "null";
  return String(v.value);
}

// ===== 导出 =====
export type { User, Admin, Shape, Circle, Rectangle, JsonValue };
export {
  processValue, handleError,
  isString, isNumber, isNonNull,
  isUser, isAdmin,
  assertIsString, assertIsDefined,
  describeShape, filterDefined,
  hasKey, isEnumValue, isJsonString, serialize,
};
