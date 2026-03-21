# FAQ — Git DX Toolkit

**Q: Do the hooks work on Windows?**
The shell hooks (`pre-commit`, `commit-msg`, `pre-push`) require bash/sh, so they work on macOS, Linux, and WSL on Windows. For native Windows, use the `09-husky-setup` templates instead — Husky handles cross-platform hook execution via Node.

**Q: What's the difference between the bare hooks in 01-git-hooks and the Husky setup in 09-husky-setup?**
The bare hooks are shell scripts — no dependencies, copy and use. They work in any project regardless of language. The Husky setup is for Node.js projects specifically — it installs hooks via npm and adds lint-staged for running linters only on staged files (faster). Use bare hooks for Python/Go/Rust projects; use Husky for Node/TypeScript projects.

**Q: Do I need to install anything to use these?**
Starter tier (5 templates): nothing beyond Git itself. Pro tier adds delta (optional, for better diffs) and gitleaks (for secrets scanning). Complete tier adds git-cliff (for changelog generation). Everything is optional with fallback behavior.

**Q: Can I use just one or two templates instead of all of them?**
Yes. Each template directory is self-contained with its own README. Copy in the one you want, configure it, done. You don't need to use all 15.

**Q: My team already has some of this. Do I have to use all the templates?**
No. If you already have CI workflows, skip template 05. If you have a PR template, skip template 04. The toolkit is additive — take what you don't have.

**Q: The commit-msg hook is blocking my commits. How do I skip it once?**
`git commit --no-verify` bypasses all hooks. Use sparingly — it's there for when you're committing generated files or making a temporary WIP commit you plan to squash. The hook has a list of bypass-exempt commit types (merge commits, fixup commits) built in.

**Q: Will these gitconfig aliases conflict with aliases I already have?**
The gitconfig files use `[include]` so they're additive. If you have a conflicting alias in your existing `~/.gitconfig`, the later include wins. Check your existing aliases with `git config --global --list | grep alias` before including the file.

**Q: What CI systems do the GitHub Actions support?**
The workflows target GitHub Actions specifically. The underlying commands (npm test, pytest, docker build) are standard and the workflow structure could be adapted for GitLab CI or CircleCI, but that adaptation isn't included.

**Q: How do I update these templates when you release new versions?**
Gumroad and Lemon Squeezy notify you when a product you've purchased is updated. Re-download the ZIP and selectively copy updated files into your projects. There's no automatic update mechanism — these are files, not packages.

**Q: Is this compatible with pre-commit (the Python framework)?**
The shell hooks in `01-git-hooks` are separate from the `pre-commit` Python framework. If you use the Python `pre-commit` framework, use the commit-msg and pre-push hooks from this kit, but replace the pre-commit hook with your `.pre-commit-config.yaml`. The two approaches aren't directly compatible.
