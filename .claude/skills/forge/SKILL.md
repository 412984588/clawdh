---
name: forge
description: Forge 全自动开发引擎：粘贴 PRD → 全自动从规划到部署。融合 GSD（规划）+ gstack（执行质量）。
triggers:
  - /forge
  - forge new
  - forge resume
---

# Forge — 全自动开发引擎

> 非程序员友好。你只需要：① 说明要做什么 ② 等待完成报告

## 使用方式

- `/forge` — 开始新项目（粘贴 PRD 内容）
- `/forge resume <项目名>` — 恢复中断的项目
- `/forge:status` — 查看所有项目状态

---

## 关键原则

1. **所有状态存磁盘，不依赖对话记忆**：GSD 的 `.planning/STATE.md` 是主状态，`~/.forge/projects/{slug}/state.json` 是状态枢纽
2. **薄集成层**：不修改 GSD/gstack 源文件，只编排它们
3. **自动处理所有错误**：测试失败自动修3轮，QA 问题自动修，只有真正的人工操作（OAuth、短信验证码）才停下来请求帮助
4. **中文报告**：所有进度、错误、结果用非技术中文

---

## ═══════════════════════════════════
## STEP 0 — 初始化
## ═══════════════════════════════════

```
读取 ~/.forge/config.json 获取全局配置。
检查调用参数：
  - 包含 "resume" → 跳到 RESUME_MODE
  - 其他 → 继续到 STEP 1
```

### RESUME_MODE（恢复中断的项目）

```
从参数提取项目名/slug。
读取 ~/.forge/projects/{slug}/state.json：
  - 如有 .planning/HANDOFF.json → 调用 Skill("gsd:resume-work")
  - 否则读 state.json 的 phase.current（嵌套格式）→ 调用 Skill("gsd:autonomous", "--from", phase.current)

输出：「正在从第 N 阶段恢复项目 {名称}...」

**注意 phase 编号 ≠ STEP 编号**：
- STEP 0–6 是 Forge 固定的流程步骤
- phase.current 是 ROADMAP 里的开发阶段序号（1, 2, 3...）
- 恢复时应跳到 **STEP 4 的第 phase.current 次循环迭代**，而不是跳到 STEP N
```

---

## ═══════════════════════════════════
## STEP 1 — 苏格拉底访谈，定稿后才开工
## ═══════════════════════════════════

```
读取用户提供的 PRD 内容（粘贴的文字，或 @文件路径）。
```

> **核心原则**：PRD 往往不完整或有误。全自动开发方向错了代价极大。
> 必须先把不清楚的问题问完、确认，定稿后才能开始执行。

---

### 1a. 提取已知信息

从 PRD 中识别：

| 维度 | 已知？ | 来源 |
|------|--------|------|
| 项目名称 | | |
| 核心问题/痛点 | | |
| 目标用户 | | |
| 核心功能（Must Have） | | |
| 非核心功能（Nice to Have） | | |
| 明确不做的事 | | |
| 技术/平台偏好 | | |
| 部署方式 | | |
| 特殊集成（支付/认证/第三方）| | |
| 上线时间要求 | | |

---

### 1b. 识别缺口与矛盾

逐条检查以下问题，标记哪些在 PRD 中**没有明确答案**或**有矛盾**：

**关于产品定义：**
- 核心用户场景是什么？（典型用户 → 做什么 → 得到什么结果）
- 哪 3 个功能是绝对 Must Have，没有就不能上线？
- 有没有功能乍看像必须的，但其实可以推后？
- 有没有隐含的功能（比如"用户系统"暗示需要注册/登录）？

**关于规模与约束：**
- 预期用户量级？（个人用、小团队、公开产品）
- 有没有现有系统要对接或迁移数据？
- 有没有预算/技术栈硬限制？

**关于验收标准：**
- 什么算"做完了"？用什么标准判断？
- 有没有具体的界面/交互描述，还是只有功能描述？

---

### 1c. 分轮提问（每轮最多 5 个问题）

**规则：**
- 只问**真正影响开发方向**的问题，技术实现细节自己决定
- 每轮把相关问题打包问，不要一次一个
- 用户回答后，更新已知信息表，再判断是否还有疑问
- **轮数不限** — 一直问到真正搞清楚为止，不能因为"问够了"就停
- 每轮结束后评估：如果还有任何影响核心方向的不确定，继续下一轮

**第一轮问题模板**（根据实际缺口调整）：

```
我读完了你的 PRD，有几个问题需要确认才能开始：

【核心场景】
1. {针对最核心用户场景的问题}

【功能边界】
2. {关于 Must Have vs Nice to Have 的问题}
3. {关于隐含功能是否真的需要的问题}

【验收标准】
4. {关于怎么算做完的问题}

【约束条件】（如果有不确定的）
5. {关于平台/预算/集成的问题}
```

**等待用户回答，然后继续第二轮（如有需要）。**

---

### 1d. 定稿确认

当所有关键问题已有答案后，输出定稿摘要：

```
好，定稿了。我对这个项目的理解是：

**项目**：{项目名} — {一句话定义}

**要解决的问题**：{用户痛点}

**核心功能**（按优先级）：
1. ✅ {Must Have 1} — {一句话说清楚边界}
2. ✅ {Must Have 2} — {一句话说清楚边界}
3. ✅ {Must Have 3} — {一句话说清楚边界}
4. 🕐 {Nice to Have，先跳过}

**不做**：{明确排除的功能}

**技术方向**：{技术栈} → 部署到 {平台}

**验收标准**：{什么算做完了}

---
有没有哪里不对？没问题的话我就开始了。
```

**等待用户确认。确认（或无异议）后继续 STEP 2。**

---

## ═══════════════════════════════════
## STEP 2 — 项目脚手架
## ═══════════════════════════════════

### 2a. 检测技术栈

读取 `~/.forge/templates/constraints/detect.md` 的检测规则：
1. PRD 是否明确提到框架？
2. 当前目录是否有 package.json / pyproject.toml？
3. 都没有 → 默认使用 Next.js（最适合非程序员）

确定技术栈后，告知用户：「将使用 {技术栈} 构建，部署到 {平台}」

### 2b. 创建 GSD 项目（全自动模式，跳过 GSD 访谈）

> STEP 1 已完成了产品访谈和定稿，不能让 GSD 再问一遍。
> 必须用 `--auto` 标志 + 传入定稿摘要，让 GSD 跳过自己的 Deep Questioning。

调用 GSD 初始化，传入的文档内容 = STEP 1 定稿摘要全文：
```
Skill("gsd:new-project") 并在提示中包含：
  --auto [粘贴 STEP 1 定稿摘要，包括：项目名、痛点、核心功能、不做的事、技术方向、验收标准]
```

`--auto` 告诉 GSD：
- 跳过 "What do you want to build?" 访谈（已由 Forge 完成）
- 跳过 Deep Questioning（已由 Forge 完成）
- 直接从提供的文档合成 PROJECT.md

GSD 将自动：
- 创建 `.planning/PROJECT.md`
- 创建 `.planning/REQUIREMENTS.md`
- 创建 `.planning/ROADMAP.md`
- 进行必要的技术调研

**GSD 在 --auto 模式下仍会问配置问题（granularity/agents）。一律用以下预设回答，不要问用户：**
- 粒度？→ Standard（平衡）
- 并行？→ Parallel（推荐）
- Git 追踪？→ Yes（推荐）
- 研究代理？→ Yes（推荐）
- 计划检查代理？→ Yes（推荐）
- 验证代理？→ Yes（推荐）
- AI 模型？→ Balanced（推荐）

### 2c. 写入 GSD 自主配置

GSD 项目创建完成后，立即写入 `.planning/config.json`：

```json
{
  "mode": "yolo",
  "workflow": {
    "auto_advance": true,
    "skip_discuss": true
  },
  "gates": {
    "confirm_project": false,
    "confirm_phases": false,
    "confirm_roadmap": false,
    "confirm_breakdown": false,
    "confirm_plan": false,
    "execute_next_plan": false,
    "issues_review": false,
    "confirm_transition": false
  },
  "safety": {
    "always_confirm_destructive": true,
    "always_confirm_external_services": true
  },
  "parallelization": {
    "enabled": true,
    "max_concurrent": 3,
    "skip_checkpoints": true
  },
  "context": {
    "warnings_hook": true
  }
}
```

### 2d. 初始化 Forge 状态

生成 slug = 项目目录名（kebab-case）
创建 `~/.forge/projects/{slug}/state.json`：

```json
{
  "project_slug": "{slug}",
  "project_path": "{绝对路径}",
  "project_name": "{项目名}",
  "tech_stack": "{检测到的技术栈}",
  "status": "active",
  "phase": { "current": 1, "total": null, "name": "初始化" },
  "created_at": "{ISO时间}",
  "last_activity": "{ISO时间}",
  "resume_command": "/forge resume {slug}"
}
```

---

## ═══════════════════════════════════
## STEP 3 — 生成架构约束
## ═══════════════════════════════════

### 3a. 读取约束模板

根据检测到的技术栈，读取对应模板：
- nextjs → 读 `~/.forge/templates/constraints/nextjs.md`
- fastapi → 读 `~/.forge/templates/constraints/fastapi.md`
- 其他 → 读 `~/.forge/templates/constraints/generic-web.md`

### 3b. 生成项目级配置

在项目目录创建 `.claude/` 目录（如不存在），写入命令配置到 `.claude/forge-project.json`：

```json
{
  "tech_stack": "{技术栈}",
  "commands": {
    "test": "{测试命令}",
    "lint": "{Lint命令}",
    "format": "{格式化命令}",
    "dev": "{启动命令}",
    "build": "{构建命令}"
  },
  "is_web_project": true/false,
  "deploy_platform": "{部署平台}"
}
```

### 3c. 生成 CI 配置（如果是 GitHub 仓库）

检查是否已有 `.github/workflows/`。如果没有，**直接生成**基础 `.github/workflows/ci.yml`，包含：
- 触发：push 到 main/master
- 步骤：安装依赖 → lint → 测试
- 技术栈对应的运行环境

不要询问用户 — Forge 全自动原则，CI 是标配。

---

## ═══════════════════════════════════
## STEP 4 — 自动执行循环
## ═══════════════════════════════════

从 `.planning/ROADMAP.md` 读取所有阶段。
按顺序执行每个阶段，直到全部完成。

### 每个阶段的执行流程

更新 state.json（深度合并，保留 total 等已有字段）：`{"status": "active", "phase": {"current": N, "total": M, "name": "..."}}`

输出进度：「🔨 第 N/M 阶段：{阶段名} — 开始...」

---

#### 4a. 规划阶段（GSD plan-phase）

```
Skill("gsd:plan-phase", N)
```

GSD 生成 PLAN.md（含详细任务列表）。

---

#### 4b. 计划审查（gstack /autoplan）

读取 `~/.claude/skills/gstack/autoplan/SKILL.md` 的内容，
然后**完整执行** autoplan 流程：

- **Phase 1 CEO 审查**：从战略层评估计划的前提假设
  - 使用 `codex exec` 和 Claude subagent 双声道独立质疑
  - 如发现根本性问题，更新 PLAN.md 再继续
  - 「前提确认」问题：**自动回答「继续」**

- **Phase 2 设计审查**（仅 Web 项目）：
  - 评估 UI 合理性、一致性
  - 自动决策所有设计选择

- **Phase 3 工程审查**：
  - 架构边界检查
  - 测试覆盖评估
  - 自动决策所有工程选择

- **最终审批门**：
  - 如有 CRITICAL 问题：自动修改计划
  - 如只有 taste 决策：**自动选择推荐选项**，不暂停

autoplan 的所有 `AskUserQuestion` 用以下原则自动回答：
- 「批准/继续」类 → 自动选第一个选项（通常是 Approve）
- 「覆盖/修改」类 → 如有 CRITICAL 问题才选修改，否则 Approve
- 「确认前提」类 → 自动 Approve

---

#### 4c. 执行阶段（GSD execute-phase）

```
Skill("gsd:execute-phase", N, "--no-transition")
```

子代理按 PLAN.md 写代码。每个 PLAN 完成后生成 SUMMARY.md。

**处理 GSD 硬停止：**

| 停止类型 | 自动处理策略 |
|---------|------------|
| `checkpoint:human-verify` | 自动 Approve |
| `checkpoint:decision` | 自动选第一个选项 |
| `checkpoint:human-action` | 用 `.env` / 项目配置中已有的凭证回答；如没有则告诉用户需要什么（简单中文） |
| `gaps_found` | 自动选「运行缺口修复」；如第二次仍 gaps_found 则选「继续」 |
| blocker（执行阻塞） | 自动修复3轮；失败则跳过此计划，记录到 state.json，继续 |
| 回归测试失败 | 自动选「修复」；3轮后失败则选「继续并记录」 |

---

#### 4d. 代码审查（gstack /review）

读取 `~/.claude/skills/gstack/review/SKILL.md` 的内容，
然后**完整执行** review 流程：

- diff-aware 模式（只看本次变更）
- 自动修复所有机械问题
- 对抗性审查（diff > 200行时自动触发 Codex + Claude 双声道）
- **ASK 批次**：自动选择推荐修复方案，不停下来问用户

---

#### 4e. 验证阶段（GSD verify-phase）

GSD 自动运行测试验证。
处理策略见 4c 中的 gaps_found 策略。

---

#### 4f. 浏览器 QA（gstack /qa，仅 Web 项目）

**仅当** `.claude/forge-project.json` 中 `is_web_project: true` 时执行。

读取 `~/.claude/skills/gstack/qa/SKILL.md` 的内容，
然后**完整执行** QA 流程：

- Diff-aware 模式（只测本次变更的页面）
- 自动修复发现的 bug（最多 50 个）
- 每个修复自动 commit
- 健康分 < 80 → 继续修复直到达标或修复次数耗尽
- **认证门**：如需登录，自动尝试项目 `.env` 中的测试账号；没有则告知用户简单步骤

---

#### 4g. 阶段完成

更新 state.json 状态：
```json
{"phase": {"current": N, "total": M, "name": "阶段名", "completed": true}, "last_activity": "..."}
```

输出进度报告（中文）：
```
✅ 第 N 阶段完成：{阶段名}
   完成了：{简短说明}
   下一步：第 N+1 阶段 — {名称}
```

继续下一个阶段。

---

## ═══════════════════════════════════
## STEP 5 — 里程碑完成
## ═══════════════════════════════════

所有阶段完成后：

### 5a. 里程碑审计

```
Skill("gsd:audit-milestone")
```

GSD 自动检查是否有遗漏。发现问题：
- CRITICAL 遗漏 → 自动创建补充阶段（decimal phase）并执行
- 技术债务 → 记录到 state.json，不阻断发布

### 5b. 创建 PR（gstack /ship）

读取 `~/.claude/skills/gstack/ship/SKILL.md` 的内容，
然后**完整执行** ship 流程：

- 运行全量测试
- 生成 VERSION bump + CHANGELOG
- 提交并 Push
- 创建 PR（自动生成 PR 描述，包含变更概要）

**自动处理：**
- 测试失败 → 自动修复3轮
- Eng Review 未通过 → 自动修复
- 合并冲突 → 自动 rebase

### 5c. 合并并部署（gstack /land-and-deploy）

读取 `~/.claude/skills/gstack/land-and-deploy/SKILL.md` 的内容，
然后**完整执行** land-and-deploy 流程：

- 等待 CI 通过（最长 15 分钟）
- **预合并确认门（唯一一个明确暂停点）**：
  展示给用户：
  ```
  ✅ 准备合并
  所有测试通过 | 代码审查通过 | QA 健康分: {分数}
  合并后将部署到生产环境。
  ```
  **如果用户之前选择了「完全自治」(即当前情境) → 自动批准，不暂停**

- `gh pr merge --squash --auto --delete-branch`
- 等待部署（Vercel/Railway/etc.）
- Canary 验证（访问关键页面，检查控制台错误）
- 部署失败 → 自动 `git revert` 并通知用户

### 5d. 完成里程碑

```
Skill("gsd:complete-milestone")
```

更新 state.json：`{"status": "complete"}`

---

## ═══════════════════════════════════
## STEP 6 — 完成报告
## ═══════════════════════════════════

输出中文完成报告：

```
🎉 项目「{名称}」开发完成！

✅ 完成的功能
━━━━━━━━━━━━━━
• {功能1}
• {功能2}
• {功能3}

🌐 项目地址
━━━━━━━━━━━
{生产环境 URL（如果有）}
{GitHub PR URL}

📊 开发统计
━━━━━━━━━━━
共 {N} 个阶段 | {M} 个子任务
代码审查发现并修复 {X} 个问题
QA 测试健康分：{Y}%

⏭️ 后续可以做
━━━━━━━━━━━━━
如需新增功能，告诉我你想做什么就可以继续。
```

---

## 错误处理规则

| 情况 | 处理方式 |
|-----|---------|
| 测试失败 | 自动修复，最多3轮。3轮后跳过并记录 |
| 工具/命令不可用 | WebSearch 找替代方案，自动安装 |
| 依赖冲突 | 自动解决版本冲突 |
| 网络错误 | 重试2次，失败告知用户 |
| API 认证失败 | 检查 .env，没有则中文提示用户提供（一句话说清楚需要什么） |
| 不明错误 | 英文报错翻译成中文，说明影响范围和解决方向 |

---

## 硬性禁止

- ❌ 不向用户解释技术细节（代码、架构、框架）
- ❌ 不问技术问题（「你想用 React 还是 Vue？」— 自己决定）
- ❌ 不展示原始错误日志（翻译成人话）
- ❌ 不在流程中途随意停止等待确认（只有规定的确认点才停）
