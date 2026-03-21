// TypeScript 可辨别联合 (Discriminated Unions / Tagged Unions)
// 每个成员包含一个共同的判别字段（通常是字符串字面量 type 字段）

// ===== 1. 基础可辨别联合 =====

// API 响应状态
type ApiResponse<T> =
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string; code: number };

function renderResponse<T>(response: ApiResponse<T>): string {
  switch (response.status) {
    case "loading":
      return "加载中...";
    case "success":
      return `成功: ${JSON.stringify(response.data)}`;
    case "error":
      // TS 知道此处 response 有 error 和 code 字段
      return `错误 ${response.code}: ${response.error}`;
  }
  // 无需 default — TS 知道所有分支已处理完
}

// ===== 2. Redux 风格的 Action 类型 =====

// 定义 Actions
type CounterAction =
  | { type: "INCREMENT"; by?: number }
  | { type: "DECREMENT"; by?: number }
  | { type: "RESET" }
  | { type: "SET"; value: number };

// Reducer — 每个 case 的类型自动缩窄
function counterReducer(state: number, action: CounterAction): number {
  switch (action.type) {
    case "INCREMENT":
      return state + (action.by ?? 1);
    case "DECREMENT":
      return state - (action.by ?? 1);
    case "RESET":
      return 0;
    case "SET":
      return action.value; // TS 知道此处有 value 字段
  }
}

// ===== 3. 穷举检查 =====

// 使用 never 确保所有分支都被处理
function assertNever(x: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(x)}`);
}

type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rectangle"; width: number; height: number }
  | { kind: "triangle"; base: number; height: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      return shape.width * shape.height;
    case "triangle":
      return (shape.base * shape.height) / 2;
    default:
      // 如果新增 Shape 变体但忘记处理，这里会报编译错误
      return assertNever(shape);
  }
}

// ===== 4. 事件系统 =====

type AppEvent =
  | { type: "USER_LOGIN"; userId: string; timestamp: Date }
  | { type: "USER_LOGOUT"; userId: string }
  | { type: "CART_ADD"; productId: string; quantity: number; price: number }
  | { type: "CART_REMOVE"; productId: string }
  | { type: "ORDER_PLACED"; orderId: string; total: number }
  | { type: "PAYMENT_SUCCESS"; orderId: string; amount: number }
  | { type: "PAYMENT_FAILED"; orderId: string; reason: string };

type EventType = AppEvent["type"];

// 根据事件类型提取 payload
type EventPayload<T extends EventType> = Extract<AppEvent, { type: T }>;

type LoginPayload = EventPayload<"USER_LOGIN">;
// { type: "USER_LOGIN"; userId: string; timestamp: Date }

// 类型安全的事件处理器 map
type EventHandlers = {
  [T in EventType]: (event: EventPayload<T>) => void;
};

// ===== 5. 树形结构的可辨别联合 =====

type Expr =
  | { kind: "number"; value: number }
  | { kind: "string"; value: string }
  | { kind: "boolean"; value: boolean }
  | { kind: "array"; elements: Expr[] }
  | { kind: "object"; properties: Record<string, Expr> }
  | { kind: "null" };

function evalExpr(expr: Expr): unknown {
  switch (expr.kind) {
    case "number":
    case "string":
    case "boolean":
      return expr.value;
    case "null":
      return null;
    case "array":
      return expr.elements.map(evalExpr);
    case "object":
      return Object.fromEntries(
        Object.entries(expr.properties).map(([k, v]) => [k, evalExpr(v)])
      );
    default:
      return assertNever(expr);
  }
}

// ===== 6. 状态机类型 =====

type TrafficLight =
  | { state: "red"; nextAfter: number }
  | { state: "yellow"; nextAfter: number }
  | { state: "green"; nextAfter: number };

function nextState(light: TrafficLight): TrafficLight {
  switch (light.state) {
    case "red":
      return { state: "green", nextAfter: 30 };
    case "green":
      return { state: "yellow", nextAfter: 5 };
    case "yellow":
      return { state: "red", nextAfter: 45 };
  }
}

// ===== 7. 工具类型 =====

// 从可辨别联合提取特定 discriminant 的成员
type ExtractVariant<T, K extends string, V extends string> =
  T extends Record<K, V> ? T : never;

type CircleOnly = ExtractVariant<Shape, "kind", "circle">;
// { kind: "circle"; radius: number }

// 获取所有 discriminant 值的联合
type Discriminants<T, K extends keyof T> = T[K];
type AllKinds = Discriminants<Shape, "kind">; // "circle" | "rectangle" | "triangle"

// ===== 导出 =====
export type {
  ApiResponse, CounterAction, Shape, AppEvent, EventType, EventPayload, EventHandlers,
  Expr, TrafficLight, ExtractVariant, Discriminants,
  LoginPayload, CircleOnly, AllKinds,
};

export { renderResponse, counterReducer, assertNever, area, nextState };
