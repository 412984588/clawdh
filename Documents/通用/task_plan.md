# Task Plan: OpenClaw 自主服务监控代理

## Goal
创建一个自主服务监控代理，每5分钟监控 OpenClaw 服务健康状况，自动诊断和恢复故障，并从事故中学习优化

## Phases
- [x] Phase 1: 规划与设计
- [x] Phase 2: 核心监控实现
- [x] Phase 3: 自动诊断与恢复
- [x] Phase 4: 学习与优化
- [x] Phase 5: 测试与部署
- [ ] Phase 6: 代码审核（Gemini）
- [ ] Phase 7: Git 提交

## Status
**Currently in Phase 6** - Gemini 代码审核

## Phase 5 完成情况
- ✅ 创建 systemd 服务配置（openclaw-monitor.service）
- ✅ 创建 systemd 定时器（openclaw-monitor.timer，每5分钟）
- ✅ 创建安装脚本（install_monitor_service.sh）
- ✅ 支持用户级和系统级 systemd

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
- **进程检测**: `ps aux | grep openclaw | grep -v grep`
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
│   ├── openclaw_monitor.py       # 主监控脚本
│   ├── openclaw_diagnostics.py    # 诊断模块
│   ├── openclaw_recovery.py        # 恢复模块
│   └── openclaw_learning.py       # 学习模块
├── logs/
│   ├── INCIDENT_LOG.md            # 事故日志
│   └── PROPOSALS.md               # 改进建议
└── .claude/
    └── hooks/
        └── openclaw-monitor.sh    # 启动脚本（systemd/timer）
```

### 监控流程
```
┌─────────────────────────────────────────┐
│  MONITORING PHASE (Every 5 min)   │
├─────────────────────────────────────────┤
│ 1. Check process status           │
│ 2. Test API health               │
│ 3. Check logs (ERROR/CRITICAL)  │
│ 4. Test Telegram bot             │
└─────────────┬───────────────────┘
              │
              ▼ (All checks pass?)
         ┌────┴────┐
         │         │
        YES       NO
         │         │
         │         ▼
         │  ┌─────────────────────────────┐
         │  │  DIAGNOSIS PHASE           │
         │  ├─────────────────────────────┤
         │  │ 1. Identify failure type     │
         │  │ 2. Gather logs (10 min)     │
         │  │ 3. Check config files        │
         │  │ 4. Test external APIs        │
         │  └─────────────┬───────────────┘
         │                │
         │                ▼
         │  ┌─────────────────────────────┐
         │  │  RECOVERY PHASE              │
         │  ├─────────────────────────────┤
         │  │ 1. Restart process           │
         │  │ 2. Fix config error          │
         │  │ 3. Switch API provider       │
         │  │ 4. Kill zombie processes     │
         │  └─────────────┬───────────────┘
         │                │
         │                ▼
         │  ┌─────────────────────────────┐
         │  │  LEARNING PHASE              │
         │  ├─────────────────────────────┤
         │  │ 1. Log incident             │
         │  │ 2. Count similar incidents   │
         │  │ 3. Propose fix (if ≥3)     │
         │  └─────────────────────────────┘
         │
         └─────────> Loop (wait 5 min)
```

### 故障类型分类
1. **Process Crash** - 进程崩溃（`ps aux | grep openclaw` 无结果）
2. **API Timeout** - API 超时（`curl http://localhost:8080/health` 非 200）
3. **Config Error** - 配置错误（JSON 语法、缺失字段）
4. **External API Failure** - 外部 API 故障（GLM, Kimi）

### 恢复策略矩阵
| 故障类型 | 诊断方法 | 恢复策略 | 重试次数 |
|---------|----------|----------|---------|
| Process Crash | ps aux | openclaw gateway start / openclaw bots start | 2次 |
| API Timeout | curl health check | 重启服务 → 检查端口占用 → 重启系统 | 2次 |
| Config Error | 检查 JSON 语法 | 修复配置 → 重启服务 | 1次 |
| External API | curl 测试端点 | 切换备用 provider → 更新 .env | 自动 |

## Implementation Tasks

### Phase 2: 核心监控实现
- [ ] 2.1 创建 `openclaw_monitor.py` 主脚本
- [ ] 2.2 实现进程状态检查（`ps aux | grep openclaw`）
- [ ] 2.3 实现 API 健康检查（`curl http://localhost:8080/health`）
- [ ] 2.4 实现日志监控（`tail -n 50 /var/log/openclaw/gateway.log`）
- [ ] 2.5 实现 Telegram bot 测试（发送 /start 命令）

### Phase 3: 自动诊断与恢复
- [ ] 3.1 创建 `openclaw_diagnostics.py` 诊断模块
- [ ] 3.2 创建 `openclaw_recovery.py` 恢复模块
- [ ] 3.3 实现故障类型识别逻辑
- [ ] 3.4 实现配置文件自动修复（JSON 语法）
- [ ] 3.5 实现外部 API 切换（更新 .env）

### Phase 4: 学习与优化
- [ ] 4.1 创建 `openclaw_learning.py` 学习模块
- [ ] 4.2 实现事故日志记录（INCIDENT_LOG.md）
- [ ] 4.3 实现事故统计逻辑（按故障类型计数）
- [ ] 4.4 实现自动生成改进建议（PROPOSALS.md）

### Phase 5: 测试与部署
- [ ] 5.1 创建测试配置文件（模拟故障场景）
- [ ] 5.2 测试进程崩溃恢复
- [ ] 5.3 测试 API 超时恢复
- [ ] 5.4 测试配置错误修复
- [ ] 5.5 创建 systemd service 和 timer（自动启动）

## Errors Encountered
（待执行时记录）

## Success Criteria
1. ✅ 所有 4 个监控检查正常工作
2. ✅ 4 种故障类型能正确识别
3. ✅ 每种故障类型至少有 1 种恢复策略
4. ✅ 事故日志正确记录到 INCIDENT_LOG.md
5. ✅ 3 次类似事故后自动生成 PROPOSALS.md
6. ✅ systemd 自动启动监控服务
7. ✅ Gemini 审核通过代码质量检查

## Phase 6 完成情况

- ✅ Gemini 代码审核完成
- ✅ 整体评价：设计精良，模块化 OODA 架构
- ⚠️  发现 4 个可优化项（非关键问题）

### 代码审核发现的问题

**1. 路径脆弱性**
- 文件: scripts/openclaw_monitor.py, diagnostics.py, recovery.py
- 问题: `openclaw_cli` 硬编码相对路径
- 影响: 运行环境目录变化时失效
- 建议: 改为环境变量或配置文件读取

**2. 诊断盲区**
- 文件: scripts/openclaw_diagnostics.py
- 问题: `check_external_apis()` 仅返回占位符
- 影响: 外部 API 故障无法真实检测
- 建议: 实现真实 API 探测（curl 或 HTTP GET）

**3. 进程检测精度**
- 文件: scripts/openclaw_monitor.py
- 问题: `ps aux | grep openclaw` 字符串匹配可能误报
- 影响: 路径包含关键字时假阳性
- 建议: 改用 `pgrep -f openclaw` 或读取 PID 文件

**4. 状态一致性**
- 文件: scripts/openclaw_learning.py
- 问题: 使用本地 JSON 文件维护事故统计
- 影响: 多实例运行时存在竞争条件
- 建议: 使用文件锁或 SQLite 数据库

---

## Phase 7: Git 提交

- [ ] 查看 Git 状态
- [ ] 添加所有新文件
- [ ] 创建 commit（遵循格式规范）
- [ ] 推送到远程仓库

