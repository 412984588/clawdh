# 插件开发

## OpenClaw 插件

目录：`packages/openclaw-plugin`

必备文件：

- `openclaw.plugin.json`
- `package.json`
- `src/index.js`
- `dist/index.js`

验证：

```bash
pnpm pack-openclaw
pnpm smoke:openclaw:install
pnpm smoke:openclaw:link
pnpm smoke:openclaw:archive
pnpm smoke:openclaw:provenance
```

## Claude Code 插件

目录：`packages/claude-marketplace`

必备文件：

- `.claude-plugin/plugin.json`
- `.claude/settings.json`
- `skills/`
- `bin/`
- `local-marketplace.json`

验证：

```bash
pnpm install-claude-local
pnpm smoke:claude:install
pnpm smoke:claude:dev
pnpm smoke:claude:marketplace
```

## 版本策略

- 插件 manifest 或内容变更后应同步 bump 版本
- OpenClaw 与 Claude 插件必须物理分离
