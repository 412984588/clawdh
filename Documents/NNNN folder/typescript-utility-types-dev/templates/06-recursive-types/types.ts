// TypeScript 递归类型 (Recursive Types, TS 4.1+)
// 类型可以在自己的定义中引用自身

// ===== 1. 递归数据结构 =====

// 二叉树
type TreeNode<T> = {
  value: T;
  left: TreeNode<T> | null;
  right: TreeNode<T> | null;
};

// 链表
type LinkedList<T> = {
  head: T;
  tail: LinkedList<T> | null;
};

// 嵌套菜单（无限深度）
type MenuItem = {
  id: string;
  label: string;
  href?: string;
  children?: MenuItem[];
};

// JSON 值类型（完整表示）
type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };

type JSONObject = { [key: string]: JSONValue };
type JSONArray = JSONValue[];

// ===== 2. 深度工具类型 =====

// 深度 Partial（所有嵌套属性变为可选）
type DeepPartial<T> = T extends (infer U)[]
  ? DeepPartial<U>[]
  : T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

// 深度 Required（所有嵌套属性变为必填）
type DeepRequired<T> = T extends (infer U)[]
  ? DeepRequired<U>[]
  : T extends object
  ? { [K in keyof T]-?: DeepRequired<T[K]> }
  : T;

// 深度 Readonly（所有嵌套属性变为只读）
type DeepReadonly<T> = T extends (infer U)[]
  ? ReadonlyArray<DeepReadonly<U>>
  : T extends object
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;

// 深度 Mutable（移除所有 readonly）
type DeepMutable<T> = T extends (infer U)[]
  ? DeepMutable<U>[]
  : T extends object
  ? { -readonly [K in keyof T]: DeepMutable<T[K]> }
  : T;

// ===== 3. 对象路径类型 =====

// 点分隔路径字符串（如 "user.address.city"）
type DotPaths<T, Prefix extends string = ""> = T extends object
  ? {
      [K in keyof T & string]:
        | `${Prefix}${K}`
        | DotPaths<T[K], `${Prefix}${K}.`>;
    }[keyof T & string]
  : never;

// 根据路径获取值类型
type GetByPath<T, Path extends string> =
  Path extends `${infer Key}.${infer Rest}`
    ? Key extends keyof T
      ? GetByPath<T[Key], Rest>
      : never
    : Path extends keyof T
    ? T[Path]
    : never;

interface UserProfile {
  id: number;
  name: string;
  address: {
    street: string;
    city: string;
    country: {
      code: string;
      name: string;
    };
  };
  tags: string[];
}

type AllPaths = DotPaths<UserProfile>;
// "id" | "name" | "address" | "address.street" | "address.city"
// | "address.country" | "address.country.code" | "address.country.name" | "tags"

type CityType = GetByPath<UserProfile, "address.city">;        // string
type CountryCode = GetByPath<UserProfile, "address.country.code">; // string

// ===== 4. 递归元组操作 =====

// 元组扁平化
type Flatten<T extends unknown[]> = T extends [infer Head, ...infer Tail]
  ? Head extends unknown[]
    ? [...Flatten<Head>, ...Flatten<Tail>]
    : [Head, ...Flatten<Tail>]
  : [];

type Nested = [[1, 2], [3, [4, 5]], 6];
type Flat = Flatten<Nested>; // [1, 2, 3, 4, 5, 6]

// 生成 N 个相同元素的元组
type Repeat<T, N extends number, Acc extends T[] = []> =
  Acc["length"] extends N ? Acc : Repeat<T, N, [...Acc, T]>;

type ThreeStrings = Repeat<string, 3>; // [string, string, string]
type FiveNums = Repeat<number, 5>;     // [number, number, number, number, number]

// ===== 5. 字符串递归类型 =====

// 字符串分割（递归）
type Split<S extends string, D extends string> =
  S extends `${infer Head}${D}${infer Tail}`
    ? [Head, ...Split<Tail, D>]
    : [S];

type PathParts = Split<"a/b/c/d", "/">; // ["a", "b", "c", "d"]

// 字符串反转
type Reverse<S extends string> =
  S extends `${infer Head}${infer Tail}` ? `${Reverse<Tail>}${Head}` : S;

type Reversed = Reverse<"hello">; // "olleh"

// ===== 导出 =====
export type {
  TreeNode, LinkedList, MenuItem, JSONValue, JSONObject, JSONArray,
  DeepPartial, DeepRequired, DeepReadonly, DeepMutable,
  DotPaths, GetByPath, AllPaths, CityType, CountryCode,
  Flatten, Repeat, Split, Reverse,
};
