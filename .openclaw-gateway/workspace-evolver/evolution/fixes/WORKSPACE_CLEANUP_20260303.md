# 工作区清理方案

**问题：** 工作区有 418 个脏文件，包括：

1. Redditscout（已 KILLED 项目）还在被修改
2. wh-app（非 app 工厂项目）在工作区
3. 大量未跟踪文件

---

## 根因分析

### 问题 1: Redditscout 还在被修改

**原因：** Builder agents 不知道项目已经 KILLED，还在继续工作

**解决方案：**

1. ✅ 已创建 CURRENT_WIP.md（单一真相源）
2. ❌ Agents 还没强制读取 CURRENT_WIP.md
3. ❌ Builder cron 任务没有检查项目状态

### 问题 2: 非工厂项目在工作区

**原因：** 工作区在用户主目录，包含其他项目

**解决方案：**

1. 隔离 app 工厂工作区
2. 或明确 .gitignore 排除非工厂项目

### 问题 3: 大量未跟踪文件

**原因：** 系统生成的临时文件、日志等

**解决方案：**

1. 更新 .gitignore
2. 定期清理

---

## 立即行动

### Step 1: 清理 Redditscout 修改（已 KILLED 项目）

```bash
cd /Users/zhimingdeng/.openclaw-gateway
git checkout workspace-builder-codex/redditscout/
```

### Step 2: 提交当前工厂相关改动

```bash
# 只提交 app 工厂相关的文件
git add workspace-evolver/
git add workspace-gateway/PIPELINE/
git add workspace-gateway/scripts/
git commit -m "feat: VCP + OpenFang 启发系统上线

- 记忆系统（4 库 + 2 脚本）
- 积分系统（排行榜）
- Hands 架构（Hunter Hand）
- 团队协调协议
- 决策记录系统
"
```

### Step 3: 更新 .gitignore

排除非工厂项目和系统文件

### Step 4: 强制 Agents 读取 CURRENT_WIP.md

更新所有 builder cron 任务

---

## 长期方案

### 1. 工作区隔离

**当前：** 工作区在 `~/.openclaw-gateway/`（包含所有项目）
**建议：** 仅关注 `workspace-*` 子目录

### 2. Git 策略

**策略：**

- App 工厂项目 → workspace-\* 目录
- 其他项目 → Documents/ 等其他位置
- .gitignore 排除非工厂项目

### 3. Agent 规则

**新增规则：**

1. 每次运行前读取 CURRENT_WIP.md
2. 忽略 status ∈ [SHIPPED, KILLED] 的项目
3. 只在项目 workspacePath 目录工作

---

## 实施计划

### 立即（现在）

```bash
# 清理 redditscout
cd ~/.openclaw-gateway
git checkout workspace-builder-codex/redditscout/

# 提交工厂改动
git add workspace-evolver/ workspace-gateway/PIPELINE/ workspace-gateway/scripts/
git commit -m "feat: 吸收 VCP + OpenFang 精华"

# 检查状态
git status
```

### 明天

1. 更新所有 builder cron 任务
2. 添加 CURRENT_WIP.md 检查
3. 更新 .gitignore

### 本周

1. 建立工作区清理 cron
2. 每周自动清理脏文件
3. 监控工作区健康度

---

## 预防措施

### 规则 1: 项目状态检查

所有 builders 必须在开始工作前：

```bash
# 读取 CURRENT_WIP.md
# 读取 projects.jsonl
# 检查目标项目 status
# 如果 status ∈ [SHIPPED, KILLED] → 停止并报告
```

### 规则 2: 工作目录限制

所有 builders 只能在：

- 项目指定的 workspacePath
- 不修改其他项目目录

### 规则 3: 定期清理

每周运行：

- 清理未跟踪文件
- 提交遗忘的改动
- 重置 KILLED 项目

---

## 监控

### 健康指标

- 脏文件数量：目标 <20
- 未跟踪文件：目标 <10
- 非 WIP 项目修改：目标 0

### 告警

- 脏文件 >100 → 警告
- 脏文件 >500 → 紧急清理
- 非 WIP 项目被修改 → 立即阻止

---

**现在执行清理...**
