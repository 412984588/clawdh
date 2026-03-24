# Task Plan: OpenClaw 自主服务监控代理

## Goal
创建一个自主服务监控代理，每5分钟监控 OpenClaw 服务健康状况，自动诊断和恢复故障，并从事故中学习优化

## Phases
- [x] Phase 1: 规划与设计
- [x] Phase 2: 核心监控实现
- [x] Phase 3: 自动诊断与恢复
- [x] Phase 4: 学习与优化
- [x] Phase 5: 测试与部署
- [x] Phase 6: 代码审核（Gemini）
- [x] Phase 7: Git 提交

## Status
**Completed** - 所有阶段已完成，代码已修复并提交

## Phase 5 完成情况
- ✅ 创建 systemd 服务配置（openclaw-monitor.service）
- ✅ 创建 systemd 定时器（openclaw-monitor.timer，每5分钟）
- ✅ 创建安装脚本（install_monitor_service.sh）
- ✅ 支持用户级和系统级 systemd
- ⚠️  注意：systemd 仅支持 Linux，macOS 用户需参考 launchd 配置

## Phase 2-4 完成情况
- ✅ 创建 4 个核心模块（monitor, diagnostics, recovery, learning）
- ✅ 所有模块语法检查通过
- ✅ 设置执行权限
- ✅ 创建测试脚本并验证基本功能
- ✅ 诊断引擎：支持 4 种故障类型识别
- ✅ 恢复引擎：支持进程崩溃和 API 超时自动恢复
- ✅ 学习引擎：自动记录事故、生成改进建议

## 最新发现
- **OpenClaw CLI**: `../../moltbot/extensions/memory-lancedb/node_modules/.bin/openclaw`
- **Gateway 命令**: `openclaw gateway start/stop/status/health`
- **Bots 命令**: `openclaw channels status` （检查所有 channels）
- **进程检测**: `pgrep -f openclaw` (已优化)
- **日志命令**: `openclaw gateway logs --tail 50`

## Decisions Made
- **语言选择**: Python（用户环境已有 Python，且 Bash 调用方便）
- **监控周期**: 5分钟（用户指定）
- **日志位置**: INCIDENT_LOG.md（事故日志）、PROPOSALS.md（改进建议）
- **服务优先级**: Gateway > Bots（Gateway 是核心）
- **告警机制**: 仅在恢复失败2次或需要外部资源时通知用户

## Architecture Design

### 文件结构
```
通用/
├── scripts/
│   ├── openclaw_monitor.py       # 主监控脚本 (已修复 import time)
│   ├── openclaw_diagnostics.py    # 诊断模块 (已实现真实 API 检测)
│   ├── openclaw_recovery.py        # 恢复模块
│   └── openclaw_learning.py       # 学习模块 (已重构，支持模板)
├── logs/
│   ├── INCIDENT_LOG.md            # 事故日志
│   └── PROPOSALS.md               # 改进建议
└── .claude/
    └── hooks/
        └── openclaw-monitor.sh    # 启动脚本（systemd/timer）
```

## Phase 6 完成情况

- ✅ Gemini 代码审核完成
- ✅ 整体评价：设计精良，模块化 OODA 架构
- ✅ 已修复：`openclaw_monitor.py` 缺失 `import time` 的关键 bug
- ✅ 已修复：`openclaw_learning.py` 模板渲染逻辑错误
- ✅ 已优化：`openclaw_monitor.py` 路径处理更鲁棒（支持自动寻找 CLI）
- ✅ 已优化：`openclaw_monitor.py` 进程检测改用 `pgrep`（减少误报）
- ✅ 已优化：`openclaw_diagnostics.py` 实现真实 API 连通性检测
- ⚠️  风险：`systemd` 脚本在 macOS 环境下不可用（需改用 launchd）
- ⚠️  风险：OpenClaw CLI 目前存在 `SyntaxError`（由监控代理成功检测到）

### 代码审核修复详情

**1. 路径鲁棒性 (Fixed)**
- 改进了 `openclaw_cli` 的寻找逻辑，支持环境变量、常见相对路径和系统 PATH。

**2. 真实诊断 (Fixed)**
- `check_external_apis()` 现在使用 `nc` 进行真实的域名连通性测试。

**3. 进程检测精度 (Fixed)**
- 优先使用 `pgrep -f` 进行进程检测，降级方案也保留了。

**4. 关键 Bug 修复 (Fixed)**
- 补全了 `openclaw_monitor.py` 中缺失的 `import time`。
- 修正了 `openclaw_learning.py` 中生成建议时列表渲染为字符串的问题。

---

## Phase 7: Git 提交

- [x] 查看 Git 状态
- [x] 添加所有新文件
- [x] 创建 commit（遵循格式规范）
- [x] 推送到远程仓库 (Not applicable in this sandbox)
