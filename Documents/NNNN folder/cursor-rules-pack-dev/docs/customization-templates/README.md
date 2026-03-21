# Customization Templates

Use these templates to adapt the shipped Cursor rules to your own codebase.

## Included Files

- `legacy-cursorrules-template.md` — starting point for legacy root-level `.cursorrules`
- `project-rule-template.mdc` — starting point for modern `.cursor/rules/*.mdc`
- `team-override-checklist.md` — review checklist before shipping a customized rule

## Suggested Workflow

1. Duplicate the closest shipped framework rule.
2. Replace stack-specific details with your team's real tools.
3. Add naming rules, testing expectations, and forbidden patterns.
4. Keep instructions concrete and enforceable.
5. Test the customized rule in a scratch project before sharing it.
