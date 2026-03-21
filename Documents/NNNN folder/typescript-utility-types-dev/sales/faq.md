# FAQ — TypeScript Utility Types

**Q: Which TypeScript versions are supported?**
TypeScript 4.7 and above. Template literal types and key remapping require TS 4.1+; most recursive patterns require TS 4.5+.

**Q: Are these framework-specific?**
No. These are pure TypeScript utility types with no framework dependencies. They work in any TypeScript project — React, Next.js, Node.js, Deno, etc.

**Q: Can I use these in commercial projects?**
Yes. The license allows unlimited personal and commercial use with a one-time purchase.

**Q: Do the types work at runtime?**
TypeScript types are erased at compile time. These patterns are purely compile-time tools. For runtime validation, see the branded types template which includes constructor functions.

**Q: What's the difference between Starter and Pro?**
Starter (templates 01–05) covers the foundational advanced type patterns. Pro (templates 01–10) adds power-user patterns: recursive types, branded/nominal types, builder pattern, discriminated unions, and type guards.

**Q: Are there tests included?**
The templates focus on type definitions and usage examples. Since TypeScript types are compile-time constructs, "testing" is done by verifying the types compile correctly — which you can do by running `tsc --noEmit`.

**Q: Will I get updates?**
Yes. Updates for new TypeScript versions are included at no extra cost.
