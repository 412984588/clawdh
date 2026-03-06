# 运维说明

## 常用命令

```bash
pnpm doctor
pnpm doctor:probe-live
node apps/bridge-daemon/dist/cli.js status
node apps/bridge-daemon/dist/cli.js start
node apps/bridge-daemon/dist/cli.js stop
node apps/bridge-daemon/dist/cli.js config-validate
node apps/bridge-daemon/dist/cli.js self-test
node apps/bridge-daemon/dist/cli.js provider list
node apps/bridge-daemon/dist/cli.js provider status
node apps/bridge-daemon/dist/cli.js provider config-validate
```

## 诊断重点

- Node / pnpm 版本
- Discord 配置完整性
- 当前 provider 凭证完整性
- DB 路径是否落在同步盘/网络盘
- OpenClaw / Claude 插件目录完整性

## 运行时检查

```bash
curl http://127.0.0.1:8911/health
curl http://127.0.0.1:8911/ready
```

## voice 侧约束

- DB 写入、webhook 处理、backend dispatch 不应阻塞音频 pump
- decrypt 失败、receive stall、rejoin 会通过 watchdog/self-test 暴露
