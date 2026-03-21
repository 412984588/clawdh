# Refund Policy — Git DX Toolkit

## 30-Day Full Refund

If any template doesn't work as described within 30 days of purchase, full refund.

## What "Works as Described" Means

- **Hooks**: Shell scripts run without syntax errors, produce the documented behavior (lint check, commit message validation, test gate)
- **Gitconfig**: Config files are valid gitconfig syntax and apply correctly when included
- **Commit templates**: Templates open correctly in `git commit` editor and contain the documented sections
- **PR templates**: GitHub/GitLab templates render correctly in pull request UI
- **GitHub Actions**: Workflows are valid YAML, pass `actionlint`, and run the documented steps

## How to Request a Refund

Contact through Gumroad or Lemon Squeezy. State which template didn't work and what happened.

## We Fix First

If a hook has a bug, a config file has a syntax error, or a workflow is outdated — we fix it within 24 hours and update the download. If the fix doesn't resolve your issue, refund stays open.

## Edge Cases

**Tool version changes**: If GitHub Actions updates its runner environment and breaks a workflow, we update it. If git changes a config key name, we update the gitconfig files.

**Platform-specific behavior**: The shell hooks are tested on macOS and Ubuntu. Edge cases on other platforms get fixed or get a refund.
