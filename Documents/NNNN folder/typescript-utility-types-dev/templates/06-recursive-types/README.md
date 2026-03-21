# 06 — Recursive Types

Self-referential types: deep utilities, object paths, tuple operations, and string parsing.

## Patterns

- Recursive data structures: `TreeNode`, `LinkedList`, `MenuItem`, `JSONValue`
- Deep utilities: `DeepPartial`, `DeepRequired`, `DeepReadonly`, `DeepMutable`
- Object paths: `DotPaths<T>` — all dot-separated path strings, `GetByPath<T, "a.b.c">`
- Tuple flattening: `Flatten<[[1,2],[3,[4,5]]]>` → `[1,2,3,4,5]`
- Tuple generation: `Repeat<string, 3>` → `[string, string, string]`
- String splitting: `Split<"a.b.c", ".">` → `["a", "b", "c"]`
- String reversal: `Reverse<"hello">` → `"olleh"`
