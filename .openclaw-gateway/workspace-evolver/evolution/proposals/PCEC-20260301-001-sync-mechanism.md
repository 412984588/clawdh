# PCEC-20260301-001: Agent 状态同步机制

## 问题
1. **状态不同步** - Evolver 改了 projects.jsonl，Builders 不知道，继续做旧项目
2. **文件路径混乱** - Commander 没有 workspace，找不到项目文件
3. **无广播机制** - 状态变更没有通知，agents 继续按旧逻辑跑

## 目标
- 状态变更后，所有 agents 立即知道
- 单一真相源，避免冲突
- Commander 能正确读取项目状态

## 方案

### 1. 单一真相源
创建 `PIPELINE/CURRENT_WIP.md` - 只有一个当前 WIP：
```markdown
# Current WIP
projId: PROJ-20260301-008
name: DevDash
status: BUILDING
owner: builder-codex
updatedAt: 2026-03-01T22:30:00Z
```

### 2. 广播机制
每次状态变更，自动在 war-room 发：
```
🔔 状态变更：PROJ-007 → KILLED
🔔 新 WIP：PROJ-008 DevDash → BUILDING
```

### 3. 强制读取
所有 agents 的 cron 任务第一行：
```
读取 CURRENT_WIP.md，如果 projId 与当前工作不符，立即停止。
```

### 4. 修复 Commander workspace
在 openclaw.json 添加：
```json
{
  "id": "commander",
  "workspace": "/Users/zhimingdeng/.openclaw-gateway/workspace-gateway"
}
```

## 回滚方案
- 删除 CURRENT_WIP.md
- 恢复原 cron 任务
- 移除 Commander workspace 配置

## 预期效果
- ✅ 状态变更立即同步
- ✅ 不再有"还在做旧项目"的问题
- ✅ Commander 能正确派单

## 风险
- 低 - 只是增加协调机制，不改核心逻辑

## 状态
PENDING_APPROVAL
