# Git DX Toolkit — Product Listing

## Headline
15 Git workflow templates that make your daily Git DX actually good.

## Subheadline
Hooks, configs, commit standards, PR templates, CI workflows, and more. Copy in, configure once, use forever.

## Price Tiers
- **Starter** — $19: 5 templates (hooks, gitconfig, commit templates, PR templates, GitHub Actions)
- **Pro** — $39: 10 templates (+gitattributes, branch conventions, delta config, husky setup, secrets scan)
- **Complete** — $59: 15 templates (everything + monorepo config, changelog automation, release workflows, tag strategy, CODEOWNERS)

---

## The Problem

Git's defaults are functional. They're not good.

`git log` gives you a wall of text. `git diff` gives you no syntax highlighting. Every new project, you write the same pre-commit hook from scratch. Your team's PR templates live in someone's notes. Your CI workflow was copied from a StackOverflow answer in 2021 and has never been updated.

The tooling to fix this exists. What's missing is someone having already configured it correctly.

---

## What's Included

### Starter — $19

**01-git-hooks** — 4 production-ready shell hooks
- `pre-commit`: Detects Node/Python projects and runs the right linter. Built-in secret pattern scan.
- `commit-msg`: Validates Conventional Commits format with clear error messages.
- `pre-push`: Runs your test suite before pushing to protected branches (main/master/production). Skips non-protected branches.
- `prepare-commit-msg`: Injects branch ticket number into commit message footer automatically.

**02-gitconfig** — 3 modular config files, include what you want
- `aliases.gitconfig`: 25+ aliases — `git lg` for visual log, `git up` for rebase-pull, `git cleanup` to delete merged branches, `git standup` to see your last 2 weeks.
- `ui.gitconfig`: Color themes, delta pager integration, diff algorithm (histogram), relative dates.
- `workflow.gitconfig`: Push defaults, rebase-on-pull, auto-stash, rerere, smart conflict markers (zdiff3).

**03-commit-templates** — 3 commit message templates
- `conventional.txt`: Full Conventional Commits with type reference, body/footer sections, and breaking change docs.
- `angular.txt`: Angular-style with subject rules and footer format.
- `simple.txt`: Minimal format for small teams without ceremony overhead.

**04-pr-templates** — 4 GitHub/GitLab templates
- `github-feature.md`: Summary, changes, test plan, screenshots placeholder, review checklist.
- `github-bugfix.md`: Bug description, root cause, fix description, regression test checklist.
- `github-hotfix.md`: Severity, incident link, blast radius, rollback plan, deploy checklist.
- `gitlab-mr.md`: GitLab-specific with label/assign slash commands.

**05-github-actions** — 5 workflow files
- `ci-node.yml`: Node/TypeScript matrix CI (lint → typecheck → test → build) with concurrency cancellation.
- `ci-python.yml`: Python CI (ruff lint + format check → mypy → pytest with coverage) with codecov upload.
- `docker-build-push.yml`: Multi-platform Docker build with GHCR push, semantic versioning tags, layer caching.
- `pr-checks.yml`: PR title convention enforcement + size check.
- `release.yml`: Tag-triggered release with git-cliff changelog generation.

### Pro — $39 (includes all Starter templates)

**06-gitattributes**: Comprehensive `.gitattributes` — 60+ file types mapped, lock files use union merge, generated files excluded from diffs, binary detection for all common formats.

**07-branch-conventions**: Gitflow and trunk-based strategy documents with naming patterns, workflow steps, and branch protection rule recommendations.

**08-delta-config**: Full delta pager configuration — side-by-side diffs, syntax themes, line numbers, word-level highlighting, merge conflict visualization, blame format.

**09-husky-setup**: Husky + lint-staged for Node projects. Pre-configured to run ESLint/Prettier on JS/TS and ruff on Python — only on staged files (fast). commitlint integration included.

**10-secrets-scan**: gitleaks config with custom rules (API keys, database URLs, JWT secrets) and a comprehensive allowlist (test files, `.env.example`, documentation, CI expressions).

### Complete — $59 (includes all Pro templates)

**11-monorepo-git-config**: Git performance flags for large repos (manyFiles, untrackedCache), submodule config, package-scoped aliases, sparse checkout setup.

**12-changelog-automation**: git-cliff configuration with commit type grouping, version resolver, and conventional-changelog setup for Node projects.

**13-release-workflows**: Release Drafter GitHub Actions integration with category config (features, fixes, performance, security, maintenance) and automatic PR-to-release notes.

**14-tag-strategy**: SemVer conventions, tagging workflow documentation, and an interactive `tag-workflow.sh` helper that calculates the next version and creates annotated tags.

**15-codeowners**: CODEOWNERS template with patterns for infrastructure, security-sensitive paths (auth, payments), frontend/backend separation, documentation, and package manifests.

---

## The Comparison

| | Starting from zero | Git DX Toolkit |
|---|---|---|
| pre-commit hook | Write from scratch, miss edge cases | Done, handles Node + Python, has secret scan |
| git log | Unreadable wall of text | `git lg` visual graph, relative dates |
| Commit messages | Whatever format someone remembers | Template opens in editor, types documented |
| PR reviews | Reviewer asks same questions every time | Template enforces test plan, checklist |
| CI | Copied from old project, stale | Current, handles caching, matrix builds |

---

## Refund Policy
30-day full refund if anything doesn't work as described.
