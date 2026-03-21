# Gumroad Listing — Git DX Toolkit

## Product Name
Git DX Toolkit — 15 Git Workflow Templates

## Short Description (140 chars)
15 Git templates: hooks that actually work, gitconfig aliases, commit standards, PR templates, CI workflows. $19/$39/$59.

## Price
$19 Starter / $39 Pro / $59 Complete

---

## Body

**Your Git workflow has 5 unsolved problems. This fixes all of them.**

1. **pre-commit hooks** — you know you need one. You haven't written it. The one you copied doesn't handle your stack.
2. **git log** — still a wall of text. `git lg` should have been the default.
3. **commit messages** — "fix stuff", "wip", "asdf". Nobody's going back to read these.
4. **PR reviews** — same questions every time. "Did you test this?" "What's the rollback plan?"
5. **CI/CD** — copied from somewhere years ago. Probably works. Definitely stale.

---

### Starter — $19 (5 templates)

**Git Hooks** — 4 hooks, ready to copy into `.git/hooks/`
- `pre-commit`: Auto-detects Node/Python, runs the right linter, scans for secrets
- `commit-msg`: Enforces Conventional Commits with clear error output
- `pre-push`: Runs tests before push to main/master (skips feature branches)
- `prepare-commit-msg`: Auto-injects ticket number from branch name

**Gitconfig** — 3 modular config files
- Aliases: `git lg`, `git up`, `git st`, `git undo`, `git cleanup`, `git standup`, and 20 more
- UI: Delta pager integration, color themes, histogram diff algorithm
- Workflow: Rebase-on-pull, auto-stash, rerere, zdiff3 conflict markers

**Commit Templates** — 3 formats
- Conventional Commits, Angular style, simple minimal

**PR Templates** — Feature, bugfix, hotfix (GitHub) + GitLab MR

**GitHub Actions** — 5 workflows
- Node CI, Python CI, Docker build+push, PR title check, tag-triggered release

---

### Pro — $39 (10 templates, includes Starter)

Everything above, plus:
- **`.gitattributes`** — 60+ file types, lock file merge strategy, binary detection
- **Branch conventions** — Gitflow and trunk-based with naming patterns and protection rules
- **Delta config** — Side-by-side diffs, syntax themes, line numbers
- **Husky setup** — lint-staged for Node (runs linters only on staged files)
- **Secrets scan** — gitleaks config with custom rules and allowlist for test/docs

---

### Complete — $59 (15 templates, includes Pro)

Everything above, plus:
- **Monorepo config** — Git performance flags, sparse checkout, package aliases
- **Changelog automation** — git-cliff config for conventional commit changelogs
- **Release Drafter** — GitHub Actions integration for auto-release notes from PRs
- **Tag strategy** — SemVer guide + interactive `tag-workflow.sh` helper
- **CODEOWNERS** — Template with frontend/backend/infra/security ownership patterns

---

### 30-Day Guarantee

Full refund if anything doesn't work as described.

### Tags
git, developer tools, git hooks, gitconfig, CI/CD, GitHub Actions, pre-commit, conventional commits, PR template, developer experience
