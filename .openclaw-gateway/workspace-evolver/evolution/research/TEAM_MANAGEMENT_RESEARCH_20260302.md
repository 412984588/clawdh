# Team Management Research - Agent Team Optimization

## 当前团队架构

### 成员（9 个 agents）

- **Commander** 🎖️ - 总指挥，派单、汇总进度
- **Builder-Codex** 🔨 - 主工程手
- **Builder-Claude** 🏗️ - 协助构建
- **Builder-Gemini** 💎 - 调研/文案
- **Reviewer** 🔍 - 质量把关
- **Hunter** 🎯 - 机会猎手
- **Growth** 📈 - 推广分发
- **Delivery** 📦 - 部署交付
- **Ops** 🔧 - 运维
- **Evolver** 🧬 - 持续改进

### 当前问题

1. **响应被动** - agents 需要 mention 才说话
2. **状态不同步** - 做错项目、重复工作（部分解决 via CURRENT_WIP.md）
3. **缺少主动汇报** - 没有定期进度更新
4. **任务派发模糊** - DoD 不够清晰
5. **进度不可见** - 不知道每个人在做什么
6. **错误重复** - 相同错误多次出现
7. **协作低效** - builders 之间缺少分工

---

## 团队管理最佳实践（人类团队）

### 1. Scrum/敏捷开发

- **Sprint** - 固定周期（1-2 周）
- **Daily Standup** - 每日同步进度
- **Sprint Planning** - 计划会议
- **Retrospective** - 复盘改进

### 2. OKR（目标与关键结果）

- **Objective** - 定性目标
- **Key Results** - 可量化指标
- **每周检查** - 追踪进度

### 3. RACI 矩阵

- **Responsible** - 执行者
- **Accountable** - 负责人
- **Consulted** - 咨询者
- **Informed** - 知情者

### 4. 看板（Kanban）

- **To Do** - 待办
- **In Progress** - 进行中
- **Done** - 完成
- **可视化** - 所有人看到全局

---

## 适配 Agent 团队的管理框架

### 方案 A: Scrum-lite（轻量敏捷）

**Sprint 周期：** 1 天

- **09:00 EST** - Sprint Planning（Commander 派单）
- **12:00 EST** - Mid-day Check（进度同步）
- **18:00 EST** - Sprint Review（验收成果）
- **23:00 EST** - Retrospective（复盘改进）

**优点：**

- 节奏清晰
- 每天有产出
- 快速迭代

**缺点：**

- 需要更多 Commander 工作
- agents 需要定时汇报

### 方案 B: Kanban（看板模式）

**状态流：**

```
机会池 → PLANNING → BUILDING → TESTING → SHIPPED
```

**每个状态有明确 DoD：**

- PLANNING → BUILDING：需求文档 + 技术方案
- BUILDING → TESTING：代码完成 + 自测通过
- TESTING → SHIPPED：测试通过 + 文档完整

**优点：**

- 可视化进度
- 灵活
- WIP 限制防止过载

**缺点：**

- 需要维护看板
- 缺少时间盒

### 方案 C: Mission-Command（任务式指挥）

**理念：** 告诉 agents "做什么"和"为什么"，让他们自己决定"怎么做"

**实施：**

1. **Commander 发布 Mission** - 目标 + 约束 + 截止
2. **Agents 自主执行** - 自己决定具体方法
3. **定期 Check-in** - 每 4 小时汇报一次
4. **Exception-based** - 只在有问题时介入

**优点：**

- 自主性强
- Commander 负担轻
- agents 有发挥空间

**缺点：**

- 需要清晰的边界
- 可能偏离目标

---

## 推荐方案：混合模式

### 核心机制

**1. Mission-Command + Kanban**

- Commander 发布任务（目标 + 截止）
- Agents 自主执行
- Kanban 可视化进度

**2. 强制汇报节奏**

- **每 4 小时** - agents 在 war-room 发状态
  - 格式：`📊 [项目名] 进度: X% | 本轮: xxx | 下步: xxx | 阻塞: 无/xxx`
- **Commander 每小时** - 检查并协调

**3. WIP 限制**

- 同时最多 1-2 个 BUILDING 项目
- 避免上下文切换

**4. 自动化看板**

- 从 projects.jsonl 生成状态
- war-room 置顶消息

**5. 错误升级机制**

- 连续 3 次失败 → 自动告警
- 卡住 >2 小时 → Commander 介入
- 卡住 >24 小时 → 降级/换人

---

## 实施计划

### Phase 1: 基础设施（今天）

- ✅ CURRENT_WIP.md（已实施）
- 🔨 强制汇报 cron（待建）
- 🔨 自动看板生成（待建）

### Phase 2: 流程优化（明天）

- 📋 定义清晰的 DoD
- 📋 建立 RACI 矩阵
- 📋 实施 4 小时汇报机制

### Phase 3: 持续改进（本周）

- 📊 监控效率指标
- 📊 Retrospective 机制
- 📊 自动化协调

---

## 需要创建的工具

### 1. 进度汇报生成器

读取 projects.jsonl + git commits → 生成进度报告

### 2. 自动看板

从 projects.jsonl 生成 Markdown 看板，post 到 war-room

### 3. 阻塞检测器

检查 BUILDING 项目是否 >X 小时无更新

### 4. RACI 矩阵表

清晰定义每个 agent 的职责

---

## 关键指标（KPIs）

- **Cycle Time** - 从 BUILDING 到 SHIPPED 的平均时间
- **Throughput** - 每周发货项目数
- **Error Rate** - 错误发生频率
- **Agent Utilization** - 每个 agent 的工作饱和度
- ** blockers** - 阻塞发生次数和持续时间

---

## 结论

**推荐：Mission-Command + Kanban + 强制汇报**

**原因：**

1. Agent 自主性强，不需要 micromanagement
2. 可视化进度，所有人看到全局
3. 强制汇报确保同步
4. WIP 限制防止过载

**下一步：**

1. 创建进度汇报生成器
2. 建立自动看板
3. 实施 4 小时汇报机制
4. 监控效果并迭代
