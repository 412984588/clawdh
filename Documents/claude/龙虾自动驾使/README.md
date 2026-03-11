# 🦞 龙虾永动引擎 - OpenClaw 插件

> 零延迟 while(isRunning) 死循环，24/7/365 自治运行

## 特性

- **零延迟永动循环** - 真正的 `while(isRunning)` 死循环，无心跳、无 sleep
- **狂暴异常处理** - 任何错误都转化为提示词，立即继续下一轮
- **智能错误分类** - 按类型（文件IO、解析、网络、权限、超时）分类处理
- **自适应错误恢复** - 根据错误类型采取不同的恢复策略
- **状态持久化** - 定期保存状态到磁盘（原子写入，防止损坏）
- **状态恢复** - 重启后恢复之前的循环计数和上下文
- **性能监控** - 实时追踪循环速率、平均耗时、内存使用
- **健康检查** - 自动检测循环是否卡死
- **可配置** - 通过环境变量或配置对象自定义行为

## 安装

### 作为 OpenClaw 插件

```bash
# 复制到 OpenClaw workspace 插件目录
cp -r /path/to/lobster-perpetual-engine ~/.openclaw/workspace/plugins/

# 或创建符号链接
ln -s /path/to/lobster-perpetual-engine ~/.openclaw/workspace/plugins/lobster-perpetual-engine
```

### 重启 Gateway

```bash
openclaw restart gateway
```

## 使用

### 在 Telegram/Discord 中

```
/start_partner   启动永动循环
/stop_partner    停止永动循环
/partner_status  查看引擎状态
```

### 状态输出示例

```
🦞 永动引擎状态

运行中: 是
循环次数: 1234
平均耗时: 5ms
循环速率: 200 循环/秒
内存使用: 12.5 MB
错误统计: file_io: 2, parse: 1
上下文大小: 2048 字符
```

## 配置

### 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `LOBSTER_COMPRESS_INTERVAL` | 3 | 上下文压缩间隔（循环数） |
| `LOBSTER_PERSIST_INTERVAL` | 10 | 状态持久化间隔（循环数） |
| `LOBSTER_CACHE_TTL` | 5000 | 缓存生存时间（毫秒） |
| `LOBSTER_HEALTH_CHECK` | true | 启用健康检查 |
| `LOBSTER_METRICS` | true | 启用性能指标 |
| `LOBSTER_CACHE` | true | 启用文件缓存 |

### 代码配置

```typescript
import { PerpetualEngineService, DEFAULT_CONFIG } from "./engine/service.js";

const engine = new PerpetualEngineService(api, {
  ...DEFAULT_CONFIG,
  compressInterval: 5,
  enableHealthCheck: true,
});
```

## 架构

```
src/
├── plugin.ts           # 插件入口，注册命令和服务
├── types.ts            # OpenClaw 类型定义
├── config.ts           # 引擎配置系统
└── engine/
    └── service.ts       # 永动引擎核心逻辑（795行）
        ├── runLoop()              # while(isRunning) 主循环
        ├── planNextAction()       # 从 MISSION 解析任务
        ├── executeAction()        # 执行具体操作
        ├── categorizeError()      # 错误分类
        ├── getErrorRecoveryAction() # 错误恢复策略
        ├── compressContext()      # 上下文压缩
        ├── persistState()         # 状态持久化（原子写入）
        ├── startHealthCheck()     # 健康检查启动
        └── 性能监控方法
```

## 错误分类与恢复

引擎会自动分类错误并采取相应的恢复策略：

| 错误类型 | 恢复策略 |
|---------|---------|
| `file_io` | 重试文件操作，检查文件路径权限 |
| `parse` | 验证数据格式，使用默认值继续 |
| `network` | 切换到离线模式，使用缓存数据 |
| `permission` | 降级操作，使用只读模式 |
| `timeout` | 增加超时时间，简化操作 |
| `unknown` | 记录并跳过 |

## 状态文件

运行时状态保存在：
- `~/.openclaw/.lobster-engine/engine-state.json` - 引擎状态
- `~/.openclaw/.lobster-engine/suggestions.log` - 优化建议日志

## 开发

```bash
# 安装依赖
npm install

# 编译
npm run build

# 监听模式
npm run dev

# 清理
npm run clean

# 运行测试
npx tsx tests/engine.test.ts

# 运行基准测试
npx tsx tests/benchmark.ts
```

## 性能

- 吞吐量: >1,000,000 次/秒（状态查询）
- 内存占用: ~8-15 MB（取决于上下文大小）
- 零延迟循环: 无 sleep，无心跳间隔

## License

MIT
