# FAQ — ESLint + Prettier Config Pack

**Does this use the new flat config format?**
Yes — all configs except `10-legacy-js` use ESLint's flat config (`eslint.config.js`).
The legacy JS config uses `.eslintrc.json` because flat config is overkill for plain JS.

**What ESLint version is required?**
ESLint v9+ for flat config templates. ESLint v8+ for the legacy JS template.

**Do I need to install the plugins listed in the README?**
Yes. The configs reference plugins you need to install separately. Each template's README has the exact install command.

**Can I customise the rules?**
Absolutely. These are starting points. Add or override rules as needed.

**Do these work with VS Code?**
Yes. Install the ESLint and Prettier VS Code extensions, and they'll pick up the configs automatically.

**Is Prettier set up to not conflict with ESLint?**
Yes. None of the ESLint configs include formatting rules — that's Prettier's job.

**Can I use these in a monorepo where each package has its own config?**
Yes. Use `07-monorepo` at the root and extend or override in each package.

**Refund policy?**
30 days, no questions asked.
