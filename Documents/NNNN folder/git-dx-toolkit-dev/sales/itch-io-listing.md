# itch.io Listing — Git DX Toolkit

## Title
Git DX Toolkit — Hooks, Configs, Commit Templates, PR Templates, CI Workflows

## Short Description
15 Git workflow templates that fix the rough edges most developers never bother addressing. $19/$39/$59.

## Price
$19 / $39 / $59

---

## Description

Git is the one tool every developer uses every day. Its defaults are functional. They're not good.

This toolkit is 15 templates that fix the most common Git DX problems — the ones you know about but haven't gotten around to solving.

---

## What's in the Starter ($19)

**Hooks that actually work**

The pre-commit hook detects whether you're in a Node or Python project and runs the right linter. It also scans staged files for obvious secret patterns. The commit-msg hook validates Conventional Commits format and prints a clear error (with examples) when it fails — not just a rejected commit and silence. The pre-push hook runs your test suite before pushing to protected branches, but skips the check on feature branches so you're not blocked mid-work.

**Gitconfig worth using**

Three modular config files you can `[include]` from `~/.gitconfig`. The aliases file has 25+ useful shortcuts: `git lg` for a visual branch graph, `git up` for rebase-pull with auto-stash, `git cleanup` to delete merged branches, `git standup` for your last two weeks of commits. The UI file sets up delta pager integration (if installed), the histogram diff algorithm, and relative dates. The workflow file enables rebase-on-pull, auto-stash, rerere (remembers conflict resolutions), and zdiff3 conflict markers.

**Commit templates**

Three formats for `git config commit.template`. Set once, your editor opens with the template every time you commit without `-m`. Conventional Commits format includes the full type reference. The Angular format follows Angular's exact spec. The simple format has no ceremony.

**PR templates**

Four templates for GitHub and GitLab. The feature template has summary, changes list, test plan, screenshot placeholder, and reviewer checklist. The bugfix template has root cause, fix description, and regression test checkbox. The hotfix template has severity, blast radius, rollback plan, and deploy checklist. The GitLab MR template uses slash commands for labeling and assignment.

**GitHub Actions**

Five ready-to-use workflow files with `# CUSTOMIZE:` comments marking the values you need to change. Node CI runs ESLint, TypeScript check, and tests with matrix builds across Node versions. Python CI runs ruff lint and format check, mypy (optional), and pytest with coverage threshold. Docker build workflow pushes to GHCR with semantic version tags and layer caching. PR checks enforce conventional commit titles. Release workflow triggers on tag push and generates changelog with git-cliff.

---

## Pro adds 5 more templates ($39)

`.gitattributes` with 60+ file type mappings. Branch convention guides for Gitflow and trunk-based workflows. Full delta pager configuration. Husky + lint-staged setup for Node projects (runs linters only on staged files, fast). gitleaks secrets scanning config with allowlist for test files, docs, and CI expressions.

---

## Complete adds 5 more templates ($59)

Monorepo Git performance config. git-cliff changelog automation. Release Drafter GitHub Actions integration. Tag strategy guide + interactive `tag-workflow.sh`. CODEOWNERS template with ownership patterns for frontend, backend, infra, and security.

---

## 30-Day Guarantee

Full refund if anything doesn't work as described.
