---
title: "别再手写Prompt了：偷师硅谷大佬的 .claude/agents 文件夹结构"
source: wechat
url: https://mp.weixin.qq.com/s/nxfSf2R4iknzbxqq1SUPtw
author: ChatGirl
pub_date: 2025年12月28日 02:30
created: 2026-01-17 20:21
tags: [AI, 编程, 产品]
---

# 别再手写Prompt了：偷师硅谷大佬的 .claude/agents 文件夹结构

> 作者: ChatGirl | 发布日期: 2025年12月28日 02:30
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/nxfSf2R4iknzbxqq1SUPtw)

---

你还在用 System Prompt 吗？🙅‍♂️

2024年，我们还在讨论如何写完美的 Prompt。 2025年，硅谷的大佬们已经悄悄把 Prompt 变成了文件系统。

最近，Hayes 在 Twitter 上分享的一张截图引爆了开发者社区：他的项目里没有一页页的 Prompt Library，只有一个 .claude/agents 文件夹。

这张图揭示了 Vibe Coding 的下一个进化形态：基于文件的 Agent 编排 (File-Based Agent Orchestration)。

为什么这一招能火？🔥
1. 上下文解耦 (Context Decoupling)

根据 Anthropic 官方文档[1]，过长的 Context Window 会导致模型注意力分散（"Lost in the Middle" 问题）。

试想一下，你把产品经理、前端、后端、测试的所有要求都塞给 AI，它能不晕吗？

Hayes 的做法：

写前端时，只加载 engineering/frontend-developer.md
做策划时，只加载 product/trend-researcher.md

结果：更少的 Token 消耗，更精准的回答。

2. 角色持久化 (Role Persistence)

以前，你每次都要对 AI 说："你是一个资深的前端工程师..."。

现在，这个"人设"被持久化在独立的 .md 文件里。

根据 Claude Code 官方最佳实践[2]，你可以通过创建 CLAUDE.md 文件让 Claude 自动读取项目上下文，而 Agent 文件进一步扩展了这个能力。

3. 一人公司架构

这不只是代码技巧，这是组织架构。

打开 .claude/agents，你看到的不是代码，而是一张公司组织架构图。你不再是写代码的人，你是 CEO，在调度各个部门的员工。

完整目录结构解析 📂

根据 Hayes 分享的截图，这是一套 7 部门、32+ Agent 的完整架构。我将其翻译并补充说明：

.claude/
└── agents/
    │
    ├── engineering/                    # 🔧 工程部 (6人)
    │   ├── frontend-developer.md       # 前端开发 (React/Tailwind)
    │   ├── backend-architect.md        # 后端架构师 (API/DB设计)
    │   ├── mobile-app-builder.md       # 移动端开发 (RN/Flutter)
    │   ├── ai-engineer.md              # AI工程师 (LLM/RAG)
    │   ├── devops-automator.md         # DevOps自动化
    │   └── rapid-prototyper.md         # 快速原型师
    │
    ├── product/                        # 📋 产品部 (3人)
    │   ├── trend-researcher.md         # 趋势调研员
    │   ├── feedback-synthesizer.md     # 用户反馈整合
    │   └── sprint-prioritizer.md       # 迭代优先级排序
    │
    ├── marketing/                      # 📢 市场部 (6人)
    │   ├── tiktok-strategist.md        # 抖音/TikTok运营
    │   ├── instagram-curator.md        # Instagram内容策划
    │   ├── twitter-engager.md          # Twitter互动专家
    │   ├── reddit-community-builder.md # Reddit社区运营
    │   ├── app-store-optimizer.md      # ASO优化
    │   ├── content-creator.md          # 通用内容创作
    │   └── growth-hacker.md            # 增长黑客
    │
    ├── design/                         # 🎨 设计部 (5人)
    │   ├── ui-designer.md              # UI设计
    │   ├── ux-researcher.md            # UX调研
    │   ├── brand-guardian.md           # 品牌规范守护者
    │   ├── visual-storyteller.md       # 视觉叙事
    │   └── whimsy-injector.md          # 创意注入 (彩蛋/趣味)
    │
    ├── project-management/             # 📊 项目管理部 (3人)
    │   ├── experiment-tracker.md       # A/B测试追踪
    │   ├── project-shipper.md          # 交付经理
    │   └── studio-producer.md          # 工作室制片人
    │
    ├── studio-operations/              # 🏢 运营部 (5人)
    │   ├── support-responder.md        # 客服响应
    │   ├── analytics-reporter.md       # 数据分析报告
    │   ├── infrastructure-maintainer.md# 基础设施维护
    │   ├── legal-compliance-checker.md # 法务合规
    │   └── finance-tracker.md          # 财务追踪
    │
    └── testing/                        # 🧪 测试部 (5人)
        ├── tool-evaluator.md           # 工具评估
        ├── api-tester.md               # API测试
        ├── workflow-optimizer.md       # 工作流优化
        ├── performance-benchmarker.md  # 性能基准测试
        └── test-results-analyzer.md    # 测试结果分析


关键洞察：

Hayes 拥有 7 个部门，像真实公司一样运作
每个部门有 3-6 个专业角色
命名规则是 [职能]-[动词/名词].md，清晰明了
完整模板：如何定义一个 Agent？🛠️

根据 Claude 官方 Skills 文档[3]，一个高质量的 Agent 文件应该包含以下 "Magic Blocks"：

模板文件：engineering/frontend-developer.md
---
name: frontend-developer
description: |
  负责所有前端开发任务，包括 React 组件、Tailwind 样式、动画效果。
  当用户提到"页面"、"UI"、"样式"、"组件"时自动激活。
---

# Role: Senior Frontend Developer

你是一个拥有 10 年经验的前端架构师，精通：
-**框架**：React 19, Next.js 15, Astro
-**样式**：Tailwind CSS 4, CSS Variables
-**动画**：Framer Motion, GSAP
-**状态管理**：Zustand, Jotai (非 Redux)

你的审美标准是：**Apple 极简风 + Linear 工业风**。

---

## Constraints (行为约束)

### ❌ 禁止
- 使用 inline style（必须用 Tailwind class）
- 使用 Redux（太重）
- 不响应式的组件
- 硬编码颜色值（必须用 CSS 变量）

### ✅ 必须
- 所有组件必须是 TypeScript
- 遵循 `src/components/[ComponentName]/index.tsx` 结构
- 支持 Dark Mode
- 小于 100 行的组件

---

## Context (知识挂载)

工作时请始终参考以下项目文件：
-`tailwind.config.ts` - 设计 Token
-`src/styles/variables.css` - CSS 变量
-`src/components/ui/` - 可复用 UI 组件

---

## Output Format (输出格式)

返回代码时，使用以下格式：

\`\`\`tsx
// src/components/[ComponentName]/index.tsx
interface Props { ... }
export const ComponentName: React.FC<Props> = ({ ... }) => { ... }
\`\`\`

---

## Examples (示例)

**用户输入**：帮我做一个渐变背景的 Hero 区域

**期望输出**：
1. 确认设计风格（极简/科技/活力）
2. 提供 2-3 个渐变方案
3. 输出完整的 React 组件代码

如何使用这套系统？📖
Step 1：创建目录
mkdir -p .claude/agents/{engineering,product,marketing,design,testing}

Step 2：创建 CLAUDE.md (项目入口)

在项目根目录创建 CLAUDE.md，这是 Claude Code 的"项目入口文件"：

# Project: [你的项目名]

## Tech Stack
- Frontend: React 19 + Tailwind CSS 4
- Backend: Hono + Cloudflare Workers
- Database: D1 + Drizzle ORM

## Agent Directory
本项目使用基于文件的 Agent 编排系统。
所有角色定义位于 `.claude/agents/`，按部门分类。

**激活方式**：
- 前端任务 → 读取 `engineering/frontend-developer.md`
- 后端任务 → 读取 `engineering/backend-architect.md`
- 内容创作 → 读取 `marketing/content-creator.md`

## Common Commands
-`pnpm dev` - 启动开发服务器
-`pnpm test` - 运行测试
-`pnpm deploy` - 部署到 Cloudflare

Step 3：按需加载 Agent

在与 Claude Code 对话时，明确指定角色：

请使用 @frontend-developer 帮我优化首页的加载动画


或者通过 MCP 工具自动路由到对应 Agent。

社区反馈精选 💬

从 Hayes 推文的评论区挖掘的一些亮点：

评论者
	
洞察

@indie_hacker_22	
"这本质上是把 System Prompt 变成了可版本控制的配置文件，终于可以 git diff 我的 AI 了！"

@aidev_sarah	
"我给每个 Agent 加了 ## Anti-Patterns 部分，专门列出不该做的事，效果拔群。"

@build_in_public	
"用 whimsy-injector.md 这个思路太妙了，专门有个 Agent 负责往产品里加彩蛋。"
效果对比 📊

我用这个架构重构了我的 Vibe Coding 工作流：

指标
	
传统 Prompt 模式
	
Agent 文件模式
	
提升

启动时间	
每次需重复描述需求
	0秒 (自动加载)	
🚀

代码准确率	
65% (常有幻觉)
	85% (专注特定领域)	
✅

Token消耗	
每次带全家桶
	按需加载	
💰 省钱

可维护性	
Prompt 散落各处
	Git 版本控制	
📦

(数据来源：个人实测 + 社区反馈)

结语：文件即团队 💡

Andrej Karpathy 说的 "Software 3.0" 正在发生。

未来的 IDE 可能不会显示文件列表，而是显示你的员工列表。

当你点击头像时，你不是在打开一个文件，而是在呼叫一个专家。

别等未来了，现在就在你的项目里 mkdir .claude/agents 吧。

🎁 Lead Magnet

想直接要这套完整模板？

👉 回复「agent」，获取我整理好的 《Vibe Coding 标准 Agent 目录模板包 v2.0》

包含：

✅ 32 个预置角色 Prompt（可直接使用）
✅ CLAUDE.md 项目入口模板
✅ 7 部门组织架构图 (Figma)
✅ 使用说明 README
参考资料 📚
Hayes 原始推文[4]
Anthropic: Claude Code 文档[5]
Anthropic: Skills 系统[6]
Anthropic: CLAUDE.md 最佳实践[7]
AGENTS.md 开源规范[8]
引用链接

[1]
Anthropic 官方文档: https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching

[2]
Claude Code 官方最佳实践: https://platform.claude.com/docs/zh-CN/build-with-claude/prompt-engineering/claude-4-best-practices

[3]
Claude 官方 Skills 文档: https://platform.claude.com/docs/zh-CN/build-with-claude/context-windows

[4]
Hayes 原始推文: https://x.com/hayesdev_/status/2004666315978727829

[5]
Anthropic: Claude Code 文档: https://platform.claude.com/docs/zh-CN/build-with-claude/context-windows

[6]
Anthropic: Skills 系统: https://platform.claude.com/docs/zh-CN/agents-and-tools/agent-skills/overview

[7]
Anthropic: CLAUDE.md 最佳实践: https://platform.claude.com/docs/zh-CN/build-with-claude/prompt-engineering/claude-4-best-practices

[8]
AGENTS.md 开源规范: https://agents.md/

---
*导入时间: 2026-01-17 20:21:37*
