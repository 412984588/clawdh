# Claude Code 插件说明

## 本地安装

```bash
pnpm build
pnpm install-claude-local
pnpm smoke:claude:install
pnpm smoke:claude:dev
pnpm smoke:claude:marketplace
```

## 插件根目录

`packages/claude-marketplace/` 包含：

- `.claude-plugin/plugin.json`
- `.claude/settings.json`
- `skills/`
- `bin/doctor.js`
- `bin/provider-matrix.js`
- `bin/run-dev.js`
- `local-marketplace.json`

## 当前能力

- 本地安装到 Claude 插件目录
- 通过 `${CLAUDE_PLUGIN_ROOT}` 调用本地包装脚本
- 暴露 `doctor`、`provider-matrix`、`run-dev` 相关技能

## 限制

- 真实 provider 联调仍依赖本机 `.env`
- `doctor --probe-live` 在未提供真实凭证时只会返回 `ENVIRONMENT-BLOCKED`
