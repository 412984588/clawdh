# OpenClaw 安装说明

## 本地安装

```bash
pnpm build
pnpm install-openclaw-local
pnpm smoke:openclaw:install
```

## 归档与验证

```bash
pnpm pack-openclaw
pnpm smoke:openclaw:archive
pnpm smoke:openclaw:link
pnpm smoke:openclaw:provenance
```

## 插件内容

- `packages/openclaw-plugin/openclaw.plugin.json`
- `packages/openclaw-plugin/package.json` 中的 `openclaw.extensions`
- `src/` 与 `dist/` 入口

## 运行要求

- Voice Hub daemon/API 默认监听 `http://127.0.0.1:8911`
- OpenClaw 插件只做桥接，不复制 runtime 逻辑
- 所有 provider 凭证仍由 `.env` 提供

## 环境受限说明

如果本机没有 OpenClaw 二进制，smoke 仍会验证文件布局、安装目录和打包产物完整性；不会伪造真实联调通过。
