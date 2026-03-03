# TEAM_COORDINATION_PROTOCOL.md

# Agent Team Coordination Protocol

## 核心原则

1. **Single Source of Truth** - CURRENT_WIP.md 是唯一真相
2. **Forced Communication** - 每 4 小时必须汇报
3. **Exception Management** - 只在异常时介入
4. **Transparency** - 所有状态公开
5. **Continuous Improvement** - 错误转化为改进

---

## 日常节奏

### 每 4 小时（00:00, 04:00, 08:00, 12:00, 16:00, 20:00 EST）

**所有 Agents:**
```
读取 CURRENT_WIP.md
如果 projId 与当前工作不符 → 停止并报告
如果自己在 BUILDING 项目 → 发进度汇报
```

**Commander:**
```
检查所有 BUILDING 项目
- >24h 无更新 → 介入
- 有阻塞 → 协调
- 无 WIP → 派新单
更新看板
```

### 每小时

**Ops:**
```
运行健康检查
聚合错误
有问题 → war-room 告警
```

### 每天 23:00 EST

**Evolver:**
```
生成每日简报
- Top 3 错误
- 1 个改进建议
```

---

## 汇报格式

### 进度汇报（每 4 小时）
```
📊 [项目名]
进度: X% | 本轮: <最后一轮改动> | 下步: <下一步> | 阻塞: 无/<问题描述>
```

### 错误报告（立即）
```
🚨 [Agent名] 错误
项目: <projId>
错误: <描述>
需要: <需要什么帮助>
```

### 完成报告（项目 SHIPPED 时）
```
✅ [项目名] 完成
Artifact: <路径>
验证: <如何验证>
下一步: <推广/交付计划>
```

---

## WIP 管理

### 限制
- 同时最多 **2 个 BUILDING** 项目
- 同时最多 **1 个 TESTING** 项目

### 超限处理
- Commander 拒绝新项目
- 优先完成现有 WIP
- 或 KILL 低优先级项目

---

## 异常处理

### Level 1: Agent 自愈
- 连续 3 次失败 → 重试
- 依赖缺失 → 尝试安装

### Level 2: Commander 介入
- 卡住 >2 小时 → 换人/降级
- 依赖阻塞 → 协调资源

### Level 3: Escalate to Boss
- 涉及资金/权限 → 问 Ming
- 方向性决策 → 问 Ming
- 系统级故障 → 问 Ming

---

## RACI 矩阵

| 任务 | Commander | Builders | Reviewer | Hunter | Growth | Delivery | Ops | Evolver |
|------|-----------|----------|----------|--------|--------|----------|-----|---------|
| 派单 | A | R | I | I | I | I | I | I |
| 构建 | I | A/R | C | I | I | I | I | I |
| 审查 | I | C | A/R | I | I | I | I | I |
| 找机会 | I | I | I | A/R | I | I | I | I |
| 推广 | C | I | I | I | A/R | C | I | I |
| 发布 | A | C | C | I | I | R | C | I |
| 监控 | I | I | I | I | I | I | A/R | C |
| 改进 | C | C | C | C | C | C | C | A/R |

A = Accountable (负责), R = Responsible (执行), C = Consulted (咨询), I = Informed (知情)

---

## 成功指标

### 效率指标
- **Cycle Time** - BUILDING → SHIPPED 平均时间（目标: <2 天）
- **Throughput** - 每周发货项目数（目标: ≥3）
- **Error Rate** - 错误发生频率（目标: <5%）

### 协作指标
- **Blocking Time** - 阻塞持续时间（目标: <1 小时）
- **Response Time** - 汇报到响应时间（目标: <30 分钟）
- **WIP Adherence** - WIP 限制遵守率（目标: 100%）

---

## 工具清单

### 已创建
- ✅ `CURRENT_WIP.md` - 单一真相源
- ✅ `scripts/generate-kanban.sh` - 自动看板
- ✅ `scripts/agent-health-check.sh` - 健康检查
- ✅ `scripts/aggregate-errors.sh` - 错误聚合
- ✅ `scripts/generate-progress-report.sh` - 进度汇报

### 待建
- 📋 `scripts/check-blockers.sh` - 阻塞检测
- 📋 `scripts/enforce-wip.sh` - WIP 限制强制
- 📋 `scripts/daily-retro.sh` - 每日复盘
- 📋 Dashboard UI - 可视化看板

---

## 实施路线图

### Week 1: 基础
- Day 1-2: 所有 agents 读取 CURRENT_WIP.md
- Day 3-4: 4 小时汇报机制
- Day 5-7: 看板自动化

### Week 2: 优化
- 阻塞检测
- 错误聚合
- Retrospective

### Week 3+: 进阶
- Dashboard UI
- 预测性调度
- 自动派单

---

## 维护

此协议由 Evolver 维护。
建议每月 review 一次，根据实际情况调整。
