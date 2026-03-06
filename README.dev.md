# 开发者说明

## 仓库约束

- 只用 `pnpm`
- Node `>=22.12.0`
- TypeScript 严格模式
- 不允许 `--passWithNoTests`
- BYOK，不提交任何真实密钥

## 常用命令

```bash
pnpm install
pnpm typecheck
pnpm build
pnpm test
pnpm doctor
pnpm doctor:probe-live
pnpm release:gate
```

## 目标包结构

- `apps/bridge-daemon`
- `apps/voice-hub-app`
- `packages/provider-contracts`
- `packages/provider-registry`
- `packages/provider-openai-realtime`
- `packages/provider-gemini-live`
- `packages/provider-hume-evi`
- `packages/provider-azure-voice-live`
- `packages/provider-volcengine-realtime`
- `packages/provider-local-mock`
- `packages/provider-local-pipeline`
- `packages/provider-test-kit`

## 本地验证顺序

1. `pnpm doctor`
2. `pnpm typecheck`
3. `pnpm build`
4. `pnpm test`
5. 插件 smoke 脚本

## 真实联调原则

- 没有真实凭证时，不伪造 live probe 通过
- 外部协议未确认的字段必须保留 `TODO(protocol-confirmation)`
