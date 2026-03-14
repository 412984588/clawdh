---
title: "【AI编程】如何用Claude Code开发任何应用【视频总结】"
source: wechat
url: https://mp.weixin.qq.com/s/EOPCnqRQvFWmjyFokEFBbQ
author: dtsola
pub_date: 2025年11月11日 20:56
created: 2026-01-17 21:12
tags: [AI, 编程, 产品]
---

# 【AI编程】如何用Claude Code开发任何应用【视频总结】

> 作者: dtsola | 发布日期: 2025年11月11日 20:56
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/EOPCnqRQvFWmjyFokEFBbQ)

---

配套视频：https://www.bilibili.com/video/BV1Te1aBJEVy/

一、引言：Claude Code 的强大能力
视频作者背景介绍

David Andre 是一位资深的 Claude Code 用户，他在这个工具上投入了超过 300 小时的使用时间。他的团队有 5 名开发人员每天都在使用 Claude Code，团队每月在这个工具上的花费超过 $1,000。这样的投入和经验让他对 Claude Code 有着深刻的理解。

Claude Code 的应用场景

Claude Code 是目前最强大的编码代理工具，它可以构建几乎任何东西：

📱 移动应用
🤖 AI 代理
🌐 网站
🎨 复杂的 3D 动画

即使你不是专业开发人员，通过正确的方法，你也能使用 Claude Code 构建复杂的项目。

二、成功使用 Claude Code 的四大支柱

David 强调，要成功使用 Claude Code 构建任何东西，需要掌握四个核心支柱：

1. Claude Code 设置优化

这是区分普通用户和高级用户的关键因素。优化设置包括：

Hooks（钩子）

自动在提示词后追加内容
减少重复输入
提高一致性

Commands（命令）

封装重复的工作流程
一键执行复杂操作
提高效率

Prompts（提示词模板）

标准化的提示词
确保输出质量
可复用的模板

Sub-agents（子代理）

专门化的 AI 代理
处理特定任务
独立的上下文窗口
2. 清晰的项目描述

你对项目的理解越清晰，Claude Code 的表现就越好。需要明确：

🎯 项目目标是什么
👥 目标用户是谁
⚡ 核心功能有哪些
🚫 哪些不在范围内
3. 技术技能水平

虽然 Claude Code 降低了编程门槛，但技术理解仍然重要：

💻 软件开发基础
🏗️ 架构设计能力
🔍 调试问题的逻辑思维
📚 计算机科学知识

重要观点：AI 不会让你变懒，而是让聪明人更聪明。不要外包你的思考，而是用 AI 加速你的学习和执行。

4. 提示词与上下文工程

掌握如何引导 AI 工具：

📝 如何编写有效的提示词
🗂️ 如何管理上下文
🎯 如何获得精确的输出
🔄 如何迭代改进
三、实战演示：构建 AI 驱动的 CRM 系统
1. 项目初始化

第一步：创建项目描述文件

# 创建核心文档
touch project-description.md

在这个文件中，David 描述了项目愿景：

# AI-Powered CRM

## 项目概述
构建一个简单的 Web CRM，由 AI 驱动
- 左侧：AI 聊天机器人（类似 Cursor）
- 右侧：CRM 界面（客户数据、表格、联系人）

## 目标
快速原型（Quick and Dirty Prototype）

第二步：设置 Claude Code 环境

David 使用 Claude Code 复制他已经优化好的 .cloud 文件夹：

# 创建 .cloud 文件夹
mkdir .cloud

# 复制优化的配置
# 包含：hooks, commands, sub-agents

快捷键提示：

Command + Escape：快速打开 Claude Code
Shift + Tab：切换模式
2. 技术栈选择

使用 Plan Mode 进行技术决策

David 切换到 Plan Mode（使用 Opus 4.1 模型），询问：

Read project-description.md and help me think through what the ideal tech stack should be. This should be a quick and dirty prototype.

Think hard, answer in short.

Claude Code 建议的技术栈：

前端框架：Next.js
全栈能力
服务端渲染
快速开发
样式：Tailwind CSS
实用优先
快速原型
数据库：Supabase → 后改为 SQLite
初始：Postgres（Supabase）
简化：SQLite（更适合 MVP）
AI 集成：
Anthropic API（Claude 模型）
Vercel AI SDK（简化集成）
部署：Vercel
与 Next.js 天然集成
零配置部署

技术栈决策的重要性

David 强调：

"如果你在构建需要运行 30 年的生产系统，应该使用 C 这样的低级语言。但如果你在构建不确定是否会继续的副项目，使用能让你快速工作的技术栈。"

文档化决策

将技术栈决策记录到 project-description.md：

## 技术栈

<tech_stack>
- **框架**: Next.js 14
- **样式**: Tailwind CSS
- **数据库**: SQLite (better-sqlite3)
- **AI**: Anthropic API via Vercel AI SDK
- **部署**: Vercel
</tech_stack>

3. 代码库架构设计

再次使用 Plan Mode 设计架构

Help me design the ideal codebase structure for this project. It should be a quick and dirty prototype (simple MVP).

Think hard, answer in short.

初始建议的架构：

crm-app/
├── app/           # Next.js 13+ app directory
├── components/    # React 组件
├── lib/          # 工具函数
├── hooks/        # 自定义 hooks
├── store/        # 状态管理
└── types/        # TypeScript 类型

进一步简化

David 要求更简单的结构：

Looks good, however make it even simpler. -d

最终简化的架构：

crm-app/
├── app/
│   ├── api/chat/route.ts    # AI 聊天端点
│   ├── page.tsx             # 主页面
│   └── layout.tsx
├── components/
│   ├── chat-panel.tsx       # 聊天界面
│   └── crm-view.tsx         # CRM 视图
├── lib/
│   ├── db.ts               # 数据库
│   └── ai.ts               # AI 集成
└── types.ts                # 类型定义

将架构文档化

## 文件结构

<file_structure>
crm-app/
├── app/              # Next.js App Router
├── components/       # UI 组件
├── lib/             # 核心逻辑
└── types.ts         # TypeScript 类型
</file_structure>

四、Claude Code 核心功能详解
1. 模式切换（Shift+Tab）

Claude Code 有三种主要模式：

Plan Mode（计划模式）

🧠 使用最强大的模型（Opus 4.1）
💭 用于思考和规划
📋 生成执行计划
💰 消耗更多 tokens

使用场景：

架构决策
技术栈选择
复杂问题分析
代码审查

Auto Accept Mode（自动接受模式）

⚡ 使用更快的模型（Sonnet 4）
🚀 自动执行更改
💨 快速迭代
💵 成本更低（5倍便宜）

使用场景：

实现已确定的功能
批量修改
常规开发任务

Default Mode（默认模式）

🔍 需要手动批准每个更改
🛡️ 更安全
📝 适合学习
2. 模型选择策略

新功能：Opus Plan Mode

在设置中选择 "Opus Plan Mode"：

/model → Opus Plan Mode

这个设置会：

Plan Mode 使用 Opus 4.1
Auto Accept Mode 使用 Sonnet 4
自动切换，无需手动选择

状态行显示

配置状态行显示当前模型和分支：

{
  "statusLine": {
    "model": true,
    "branch": true
  }
}
3. 上下文管理

三个关键命令：

/clear - 完全重置

使用场景：
- 切换到完全不同的主题
- 切换到不同的项目
- 上下文已经混乱

/compact - 压缩历史

使用场景：
- 对话变长但想保留上下文
- 主动清理不相关信息
- 避免上下文污染

示例：
/compact - 保留重要信息，总结其余部分

自动压缩

Claude Code 会在达到 200,000 tokens 时自动压缩，但主动压缩可以：

保持上下文清洁
提高响应质量
避免不必要的信息干扰
五、高级配置技巧
1. Hooks（钩子）设置

Hooks 是 Claude Code 中最强大的自动化功能之一。

什么是 Hooks？

Hooks 在特定事件触发时自动执行操作，最常用的是 on_prompt_submit。

David 的核心 Hook：-d

创建文件：.cloud/hooks/append-default.md

---
trigger: on_prompt_submit
pattern: "-d$"
---

# Append Default Prompt Enhancement

When the user ends their prompt with `-d`, append:

Think hard. Answer in short. Keep it simple.

工作原理：

用户输入：
"Fix the bug in chat.tsx -d"

实际发送给 AI：
"Fix the bug in chat.tsx

Think hard. Answer in short. Keep it simple."

其他有用的 Hooks：

-e - 错误解释 Hook

---
trigger: on_prompt_submit
pattern: "-e$"
---

# Error Explanation

When analyzing errors:

1. Do NOT jump to conclusions
2. Think harder about root causes
3. Analyze the error trace systematically
4. Explain in short, concise terms
5. Suggest the minimal fix needed

Think harder. Answer in short.

-u - Ultra Think Hook

---
trigger: on_prompt_submit
pattern: "-u$"
---

# Ultra Think Mode

Use the MAXIMUM amount of ultra think.

Take all the time you need. It's much better if you do too much research and thinking than not enough.

Analyze deeply before responding.

Hook 的好处：

⏱️ 节省时间（每次 20-30 秒）
🎯 保持一致性
💪 强制最佳实践
🔄 可复用
2. Commands（命令）创建

Commands 是可重用的工作流程。

命令结构

创建文件：.cloud/commands/create-pr.md

# Create Pull Request

Create a pull request with the following steps:

1. Review all staged changes
2. Create a clear, descriptive commit message
3. Push to branch: {{arguments}}
4. Generate PR description including:
   - What changed
   - Why it changed
   - Testing done
5. Create the PR

Be concise but thorough.

使用命令：

/create-pr feature/new-chat-ui

David 的常用命令：

文件审查命令

# File Review

Review {{arguments}} for:

1. **Security issues**
2. **Performance problems**
3. **Code quality**
4. **Best practices**

Provide actionable feedback. Think hard.

Header Comments 命令

# Add Header Comments

Add clear, concise header comments to {{arguments}}:

- Function purpose
- Parameters
- Return values
- Example usage (if complex)

Keep it simple. Don't over-document.

创建自己的命令

步骤：

识别重复的工作流程
在 .cloud/commands/ 创建 .md 文件
使用 {{arguments}} 作为变量
测试和迭代
3. Sub-agents（子代理）应用

Sub-agents 是专门化的 AI 代理，有独立的上下文窗口。

何时使用 Sub-agents？

🔍 需要专门的研究
🎯 特定领域的任务
📦 不想污染主上下文
🔄 需要多次委托的任务

创建 Web 研究子代理

在视频中，David 创建了一个专门的 Web 研究代理：

/agents → Generate with Cloud

提示词：

This is an expert web researcher that always checks 10+ different sources to confirm we are using:

- The latest documentation
- The correct package versions
- The latest best practices

This agent should:
1. Search multiple authoritative sources
2. Cross-reference information
3. Verify version compatibility
4. Provide concise summaries

配置子代理：

{
  "name": "Web Research Validator",
  "color": "blue",
  "model": "inherit",
  "tools": ["web_search", "read_file"]
}

使用子代理：

@agent web-research-validator

Check if we're using the latest Vercel AI SDK correctly

Sub-agents vs Commands：

特性

	

Sub-agents

	

Commands




速度

	

较慢

	

快速




上下文

	

独立

	

共享




复杂度

	

高

	

低




适用场景

	

专门研究

	

重复操作

4. 项目文档体系

核心文档文件

project-description.md - 项目描述

# AI-Powered CRM

## 项目概述
[项目愿景]

## 技术栈
<tech_stack>
- Next.js
- Tailwind
- SQLite
</tech_stack>
## 文件结构
<file_structure>
[架构图]
</file_structure>
## 核心功能
<essential_features>
1. Contact Management
2. Lead Tracking
3. Task Management
</essential_features>
## 包版本
<package_versions>
- @ai-sdk/anthropic: 2.0.12
- next: 14.x
</package_versions>


cloud.md - 全局配置

这是 Claude Code 每次都会读取的系统提示：

# Cloud Code Configuration

## Project Rules

### Critical Rules
- ⛔ NEVER run `npm run build` unless explicitly asked
- ⛔ DO NOT start servers automatically
- ⛔ ALWAYS ask before running destructive commands

### Code Style
- Use TypeScript strict mode
- Prefer functional components
- Keep functions under 50 lines
- Write self-documenting code

### Testing
- Add tests for critical paths
- Use descriptive test names
- Mock external dependencies

## Project Context
[从 project-description.md 引用]

嵌套 cloud.md

可以在子文件夹创建特定的配置：

crm-app/
├── cloud.md                    # 全局配置
├── app/
│   └── api/
│       └── cloud.md           # API 特定配置
└── components/
    └── cloud.md               # 组件特定配置

/docs 文件夹

存储重要的技术文档：

docs/
├── vercel-ai-sdk.md          # Vercel AI SDK 文档
├── anthropic-api.md          # Anthropic API 文档
└── architecture.md           # 架构决策记录

使用 XML 标签组织内容

<tech_stack>
Next.js, Tailwind, SQLite
</tech_stack>
<file_structure>
app/, components/, lib/
</file_structure>
<core_features>
1. Chat interface
2. CRM data management
3. AI-powered actions
</core_features>


为什么使用 XML 标签？

🎯 AI 更容易解析
📋 结构化信息
🔍 易于引用特定部分
六、调试与问题解决
1. 前端调试

Playwright MCP 集成

这是视频中最令人印象深刻的功能之一。

安装 Playwright MCP：

npx @playwright/mcp@latest

在 Claude Code 中使用：

/mcp → 选择 Playwright

Playwright 能做什么？

Claude Code 可以：

🖱️ 自动点击按钮
⌨️ 输入文本
📸 截图
🔍 检查网络请求
📊 读取控制台日志
🧪 运行 JavaScript

实际调试示例

视频中的问题：发送消息后没有 AI 响应

Use the Playwright MCP to debug the frontend.

Right now, we are not getting an AI response at all when I send a prompt.

Claude Code 的自动化调试过程：

导航到 localhost:3000
在聊天框输入测试消息
点击发送按钮
检查网络请求
读取控制台错误
分析问题

输出：

Issue found: No API call is being made when clicking send.
The form submission is not triggering the API route.

控制台日志策略

添加彩色 Emoji 日志：

Add debug log statements with colorful emojis at the start so we can easily see them:

🚀 Function called
📤 Sending request
📥 Received response
❌ Error occurred
✅ Success

示例代码：

export async function POST(req: Request) {
  console.log('🚀 API route called');

  try {
    const body = await req.json();
    console.log('📥 Request body:', body);

    const response = await anthropic.messages.create({...});
    console.log('✅ API response received');

    return Response.json(response);
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

截图辅助调试

David 的工作流程：

遇到错误时截图
保存到 ~/Documents
拖拽到 Claude Code（按住 Shift）
让 AI 分析截图
Good, now the console does not reset. However, we still run into errors.

[附加截图]

-e
2. 版本兼容性问题

视频中的核心问题

Vercel AI SDK 从 v4 升级到 v5，导致 API 完全改变。

问题表现：

Error: useChat returned {messages, input, handleSubmit}
but our code expects different properties

诊断过程

步骤 1：检查版本

Run this command and show me the output:

npm list @ai-sdk/anthropic

输出：

@ai-sdk/anthropic@2.0.12

步骤 2：搜索最新文档

使用 Perplexity 深度研究：

Give me the latest documentation about how to use the Anthropic API with Vercel AI SDK.

Be detailed and thorough. Tell me everything I need to know about getting AI chat completions.

步骤 3：对比文档

<docs>
[粘贴 Perplexity 结果]
</docs>
Above are the official docs. Are we following these docs properly, or are we using outdated patterns?

Think hard, answer in short.

步骤 4：实施修复

Good. Now implement the fix to use v5 API correctly.

The fewer lines of code changed, the better.

-d

文档验证流程

David 的标准流程：

🔍识别包：确定使用的库
🌐深度研究：Perplexity 搜索最新文档（50+ 来源）
📋创建文档：保存到 /docs 文件夹
✅验证实现：让 Claude Code 对比
🔧实施修复：应用更改
📝记录版本：更新 project-description.md

创建文档文件

mkdir docs
touch docs/vercel-ai-sdk.md

将 Perplexity 结果粘贴进去：

# Vercel AI SDK v5 Documentation

## Installation
```bash
npm install ai @ai-sdk/anthropic
Usage with Anthropic
useChat Hook (v5)
import { useChat } from 'ai/react';

const { messages, input, handleInputChange, handleSubmit } = useChat({
  api: '/api/chat',
});
API Route (v5)
import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: anthropic('claude-sonnet-4-20250514'),
    messages,
  });

  return result.toDataStreamResponse();
}
Breaking Changes from v4
useChat now returns handleInputChange instead of setInput
API routes use streamText instead of OpenAIStream
Model names updated to new format

**版本文档化**

在 `project-description.md` 添加：

```markdown
## Package Versions

<package_versions>
- **@ai-sdk/anthropic**: 2.0.12 (Latest)
- **ai**: 5.x (Vercel AI SDK v5)
- **next**: 14.2.x
- **better-sqlite3**: 11.x

### Important Notes
- Using Vercel AI SDK v5 (breaking changes from v4)
- Anthropic model: claude-sonnet-4-20250514
</package_versions>

3. 错误处理最佳实践

隔离问题

不要试图一次性修复所有问题：

❌ 错误做法：
"Fix all the bugs"

✅ 正确做法：
"The console resets when I click send. Investigate why that's happening."

添加调试语句

Your task is to figure out the optimal 3 places where we can add concise debug log statements so that we can get closer towards fixing the issue.

We don't want to try to fix it in one go. We just want to proceed like a senior developer would - strategically isolating the problem.

Take a deep breath and analyze the entire frontend and suggest the best 3-4 places for us to insert debug logs.

Answer in short. -u

逐步验证修复

Good work. Now test if the fix works by:

1. Reloading the app
2. Sending a test message
3. Checking the console for our debug logs
4. Verifying the API is called

Report what you find. -d

David 的调试哲学

"有时候慢就是快。花时间做额外的深度研究，双重检查，比盲目地让 AI 一次性修复要好得多。"

高级调试提示词

Take a deep breath and investigate:

1. WHERE exactly is the issue occurring?
2. WHAT is the expected behavior?
3. WHAT is the actual behavior?
4. WHAT is the minimal change needed to fix it?

Are there any SERIOUS issues, or is it basically correct and we should not overthink this?

Think hard, answer in short.
七、工具组合使用
1. Claude Code + Cursor

为什么同时使用两者？

🎯Claude Code：复杂逻辑、架构、重构
⚡Cursor：快速编辑、简单修复、UI 调整

实际工作流程

场景：修复配置文件错误

视频中遇到 settings.json 路径问题（文件名有空格）。

在 Cursor 中：

Cursor Chat:
@settings.json @settings.local.json

Fix the file paths. Do not do anything else, just fix this.

模型选择：

Gemini 2.5 Pro（David 推荐，被低估）
GPT-5（某些版本很好）

Cursor Tab 补全

David 在编写 Markdown 时大量使用 Tab 补全：

## Tech Stack

<tech_stack>
[按 Tab，Cursor 自动补全]
- Next.js
- Tailwind
- SQLite
</tech_stack>


互补使用场景

任务类型

	

推荐工具

	

原因




架构设计

	

Claude Code

	

深度思考




快速修复

	

Cursor

	

速度快




重构代码

	

Claude Code

	

理解上下文




UI 调整

	

Cursor

	

即时反馈




调试复杂问题

	

Claude Code

	

系统分析




格式化代码

	

Cursor

	

简单快速

David 的建议

"不要只依赖一个工具。Claude Code 用于深度工作，Cursor 用于快速迭代。了解每个工具的优势。"

2. Claude Code + Perplexity

为什么需要 Perplexity？

知识截止日期问题

所有 LLM 都有训练数据截止日期：

Claude：2023 年 8 月
GPT-4：2023 年 4 月

这意味着它们不知道：

📦 最新的包版本
📚 更新的文档
🔧 新的最佳实践
🐛 已知的 bug 修复

Perplexity 的优势

🌐 实时网络搜索
📊 检查 50+ 来源
🔍 深度研究模式
📝 带引用的答案

标准工作流程

步骤 1：识别需要研究的内容

需要最新文档的情况：
- 新包或库
- 版本升级
- API 变更
- 最佳实践

步骤 2：在 Perplexity 进行深度研究

Give me the latest documentation for using @ai-sdk/anthropic and ai packages.

Specifically, how to integrate them into a full-stack AI web app in JavaScript and TypeScript.

Be detailed.

步骤 3：将结果提供给 Claude Code

<docs>
[粘贴 Perplexity 深度研究结果]
</docs>
Above are the official docs. Are we following these docs properly?

Think hard, answer in short.

实际示例：Vercel AI SDK 研究

Perplexity 提示词：

Give me the latest documentation about how to use the Anthropic API through the Vercel AI SDK.

I need to know:
1. Correct package names and versions
2. How to set up useChat hook
3. How to create API routes
4. Model naming conventions
5. Breaking changes from v4 to v5

Be detailed and thorough.

结果：检查了 52 个来源，包括：

Vercel 官方文档
Anthropic API 文档
GitHub issues
Stack Overflow
最新的博客文章

步骤 4：创建内部文档

# 保存研究结果
echo "[Perplexity 输出]" > docs/vercel-ai-sdk.md

步骤 5：验证实现

@docs/vercel-ai-sdk.md

Read the docs and investigate whether we are following the latest documentation properly.

-d

David 的 Perplexity 快捷方式

在 Perplexity 中创建自定义快捷方式：

/ws → "Browse the web, answer in short"

使用：

What is the official API name of Claude Sonnet 4 in the Anthropic API when using it via Vercel AI SDK?

/ws

组合的力量

Perplexity (研究) → Claude Code (实现) → Cursor (微调)

这个组合让 David 能够：

✅ 始终使用最新文档
✅ 避免过时的模式
✅ 快速验证实现
✅ 保持代码现代化
3. 版本控制集成

初始化 Git

Your task is to help me connect our project locally to a new GitHub repo.

Tell me step by step how to do this.

Claude Code 的响应：

# 步骤 1: 初始化 Git
git init

# 步骤 2: 创建 .gitignore
# (让 Claude Code 生成)

# 步骤 3: 添加远程仓库
git remote add origin [你的仓库 URL]

# 步骤 4: 首次提交
git add .
git commit -m "Initial commit"

# 步骤 5: 推送
git push -u origin main

创建安全的 .gitignore

Create a proper .gitignore that excludes:
- All .env and .env.local files
- Anything else sensitive in our codebase

Do not do anything else. Just create this safe and secure .gitignore file.

Ultra think. -u

生成的 .gitignore：

# 环境变量
.env
.env.local
.env.*.local

# 依赖
node_modules/
.pnp
.pnp.js

# 构建输出
.next/
out/
dist/
build/

# 调试
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.vscode/
.idea/
*.swp
*.swo

# 操作系统
.DS_Store
Thumbs.db

# 数据库
*.db
*.sqlite
*.sqlite3

# 测试
coverage/
.nyc_output/

使用 Claude Code 进行 Git 操作

创建 PR 命令

.cloud/commands/create-pr.md：

# Create Pull Request

1. Review all staged changes
2. Generate a clear commit message
3. Push to branch: {{arguments}}
4. Create PR with description

Think hard about the commit message.

使用：

/create-pr feature/ai-chat

自动化提交消息

Generate a commit message for the staged changes.

Follow conventional commits:
- feat: new feature
- fix: bug fix
- docs: documentation
- refactor: code refactor
- test: add tests

Be concise but descriptive.
八、效率提升策略
1. 自动化工作流

状态行配置

显示重要信息：

/status-line

配置选项：

📊 当前模型
🌿 Git 分支
💰 Token 使用（需要 cc-usage 包）
⏱️ 会话时间

示例配置：

{
  "statusLine": {
    "model": true,
    "branch": true,
    "showCost": false
  }
}

显示效果：

claude-sonnet-4 | main | 45.2k tokens

快捷键设置

核心快捷键：

快捷键

	

功能




Cmd+Esc

	

打开 Claude Code




Shift+Tab

	

切换模式




Esc

	

清空输入




↑

	

上一条提示词




Cmd+K

	

快速命令

自定义快捷键

在 VS Code 设置中：

{
  "keyboard.shortcuts": [
    {
      "key": "cmd+shift+c",
      "command": "claude.clearChat"
    },
    {
      "key": "cmd+shift+p",
      "command": "claude.planMode"
    }
  ]
}

允许列表管理

安全命令自动批准

在 settings.json 中：

{
  "claude.autoApprove": [
    "mkdir",
    "touch",
    "npm install",
    "git status",
    "git diff"
  ],
  "claude.alwaysAsk": [
    "npm uninstall",
    "rm -rf",
    "git push",
    "git reset"
  ]
}

动态添加到允许列表

当 Claude Code 请求权限时：

✅Yes：仅这次批准
✅Yes, don't ask：添加到允许列表
❌No：拒绝

David 的建议

"仔细管理你的允许列表。不要盲目批准所有命令。npm uninstall 这样的命令应该始终需要确认。"

2. 上下文工程

XML 标签包裹

为什么使用 XML？

🎯 AI 更容易解析结构化数据
📋 清晰的边界
🔍 易于引用特定部分

示例：

<tech_stack>
- Next.js 14
- Tailwind CSS
- SQLite
</tech_stack>
<core_features>
1. Contact Management
2. AI Chat Interface
3. Task Tracking
</core_features>
<constraints>
- Quick and dirty prototype
- Minimal dependencies
- Focus on core features only
</constraints>


在提示词中引用：

Read the <tech_stack> section and verify we're using the latest versions.

文件标记系统

标记文件

@filename.ts

标记多个文件

@chat.tsx @api/route.ts @lib/ai.ts

Review these files for consistency.

标记文件夹

@components/

Review all components for accessibility issues.

最佳实践

✅ 好的做法：
@chat.tsx
Fix the input handling bug

✅ 更好的做法：
@chat.tsx @types.ts
Fix the input handling bug. Make sure types are correct.

❌ 避免：
[粘贴整个文件内容]
Fix this

内存添加（#）

临时记忆

# Do not start any servers unless the user says so

这会添加到当前会话的记忆中。

使用场景：

🚫 临时规则
📝 会话特定的偏好
🎯 当前任务的约束

示例：

# For this session, always add TypeScript types
# Prefer functional components over class components
# Keep all functions under 30 lines

持久化重要规则

如果发现自己经常添加相同的规则，将其移到 cloud.md：

# cloud.md

## Session Rules
- Always add TypeScript types
- Prefer functional components
- Keep functions under 30 lines
3. 提示词优化

核心提示词模式

"Think hard, answer in short"

效果：
- 增加推理努力
- 减少冗长
- 聚焦核心

推理级别

提示词

	

推理级别

	

使用场景




"Think"

	

低

	

简单任务




"Think hard"

	

中

	

常规任务




"Think harder"

	

高

	

复杂问题




"Ultra think"

	

最高

	

关键决策

"The fewer lines of code, the better"

强制简洁：
- 避免过度工程
- 最小化更改
- 保持简单

组合使用

Fix the bug in chat.tsx.

The fewer lines of code changed, the better.

Think hard, answer in short.

高级提示词技巧

避免跳到结论

❌ 避免：
"I see the issue now..."
"You're right, the problem is..."

✅ 强制深度思考：
"Do NOT jump to conclusions. Analyze systematically."

强制具体性

Are there any SERIOUS issues, or is it basically correct and we should not overthink this?

这个提示词：

🎯 区分严重问题和小问题
🚫 避免过度优化
⚡ 保持开发速度

分步思考

Take a deep breath and think step by step:

1. WHAT is the current behavior?
2. WHAT is the expected behavior?
3. WHERE is the discrepancy?
4. WHAT is the minimal fix?

Think harder. Answer in short.

David 的提示词哲学

"好的提示词不是关于长度，而是关于清晰度和意图。告诉 AI 你想要什么，以及如何思考它。"

九、常见陷阱与注意事项
1. 避免过早执行

陷阱：立即开始编码

很多初学者的错误：

❌ 错误做法：
"Build me a CRM with AI chat"

[Claude Code 立即开始生成代码]

问题：

🚫 没有清晰的架构
🚫 技术栈可能不合适
🚫 需求不明确
🚫 后期需要大量重构

正确做法：充分规划

✅ 第 1 步：明确需求
"I want to build an AI-powered CRM. Help me think through:
1. What are the core features?
2. Who is the target user?
3. What's the MVP vs v2 features?"

✅ 第 2 步：选择技术栈
"Based on the requirements, what's the ideal tech stack for a quick prototype?"

✅ 第 3 步：设计架构
"Help me design a simple, clean codebase structure."

✅ 第 4 步：开始实现
"Now let's implement the core features."

David 的建议

"前期花的时间越多，后期执行越快。不要急于让 AI 写代码。先思考、规划、设计。"

规划检查清单

在开始编码前确认：

项目目标清晰
技术栈已选择并记录
架构已设计
核心功能已列出
MVP 范围已定义
文档结构已创建
2. 知识截止日期问题

陷阱：假设 AI 知道最新信息

常见场景：

Claude Code 使用：
- 过时的包版本
- 废弃的 API
- 旧的最佳实践
- 已修复的 bug 模式

视频中的实际例子

Vercel AI SDK v4 → v5：

// Claude Code 生成（v4，过时）
import { useChat } from 'ai/react';

const { messages, append } = useChat();

// 正确的 v5 API
const { messages, handleSubmit, handleInputChange } = useChat();

解决方案：始终验证

标准验证流程：

识别关键依赖
npm list [package-name]
Perplexity 深度研究
What is the latest version of [package]?
What are the breaking changes?
What's the current best practice?
创建文档
echo "[研究结果]" > docs/[package]-latest.md
验证实现
@docs/[package]-latest.md

Are we following the latest docs?
记录版本
## Package Versions
- [package]: [version] (verified [date])

自动化验证

创建一个 sub-agent 专门验证文档：

@agent web-research-validator

Check if we're using the latest version of @ai-sdk/anthropic and following current best practices.

David 的警告

"永远不要盲目信任 AI 生成的代码。始终验证你使用的是最新的文档和最佳实践。"

3. 上下文污染

陷阱：上下文窗口变得混乱

症状：

🐛 Claude Code 开始犯奇怪的错误
🔄 重复旧的错误
😕 响应变得不相关
📉 质量下降

原因：

上下文窗口充满了：
- 过时的信息
- 已修复的 bug
- 废弃的代码
- 不相关的讨论

解决方案 1：主动压缩

/compact

Summarize the conversation, keeping only:
- Current architecture decisions
- Active bugs and their fixes
- Important context for ongoing work

Remove everything else.

解决方案 2：定期清理

何时使用 /clear：

✅ 切换到完全不同的功能
✅ 开始新的主要任务
✅ 上下文已经混乱
✅ 切换项目

何时使用 /compact：

✅ 对话变长但仍相关
✅ 想保留重要上下文
✅ 定期维护（每 50k tokens）

解决方案 3：使用多个 Claude Code 实例

David 的策略：

Claude Code 1: 主要开发（架构、核心功能）
Claude Code 2: UI 调整
Claude Code 3: 调试特定问题

切换时机：

✅ 任务类型改变
✅ 上下文不再相关
✅ 需要新的视角

最佳实践

# 在切换前

## 选项 1：压缩并继续
/compact - 保留重要上下文

## 选项 2：清理并重新开始
/clear - 完全重置

## 选项 3：新实例
Command+Escape → 新的 Claude Code

预防上下文污染

保持提示词聚焦
❌ "Fix everything"
✅ "Fix the input handling in chat.tsx"
使用 Sub-agents
将专门任务委托给 sub-agents
保持主上下文清洁
定期压缩
每 30-50k tokens 压缩一次
文档化重要决策
将关键信息移到 cloud.md
不依赖会话记忆
十、成本与资源管理
成本结构

David 的团队使用情况

团队规模：5 名开发人员
月度花费：$1,000+
使用时长：300+ 小时（David 个人）

成本因素

因素

	

影响




模型选择

	

Opus vs Sonnet（5倍差异）




上下文长度

	

更长 = 更贵




使用频率

	

每日使用 vs 偶尔使用




任务复杂度

	

简单 vs 复杂

优化成本的策略

1. 智能模型选择

✅ 使用 Opus Plan Mode 设置：
- Plan Mode → Opus 4.1（深度思考）
- Auto Accept → Sonnet 4（执行，5倍便宜）

2. 主动上下文管理

定期压缩 → 减少 token 使用
及时清理 → 避免浪费

3. 使用 Commands 而非 Sub-agents

Commands：快速，共享上下文
Sub-agents：慢，独立上下文（更贵）

优先使用 Commands，必要时才用 Sub-agents

4. 批量操作

✅ 好：
"Review all files in /components for accessibility"

❌ 差：
[分别审查每个文件，多次调用]
每日维护

每天早上的例行程序

1. 更新 Claude Code

cloud update

这确保你有：

🆕 最新功能
🐛 Bug 修复
⚡ 性能改进
🔧 新的 API

2. 检查状态

/status-line

确认：

当前模型设置
Git 分支
Token 使用情况

3. 清理工作区

# 关闭旧的 Claude Code 实例
# 清理不需要的文件
# 提交昨天的工作
监控使用情况

安装 cc-usage

npm install -g cc-usage

配置状态行

{
  "statusLine": {
    "model": true,
    "branch": true,
    "showCost": true
  }
}

显示：

claude-sonnet-4 | main | $2.34 this session

设置预算警报

{
  "claude.budget": {
    "daily": 50,
    "weekly": 300,
    "monthly": 1000,
    "alertAt": 0.8
  }
}
资源管理最佳实践

1. 文档复用

创建一次，多次使用：
- /docs 文件夹
- project-description.md
- cloud.md

避免重复研究相同的主题

2. Hook 和 Command 投资

前期投入时间创建：
- 常用 hooks
- 重复 commands
- 专门 sub-agents

长期节省时间和金钱

3. 团队共享

团队共享：
- .cloud 文件夹
- 文档
- 最佳实践

避免每个人重复工作

David 的成本观点

"$1,000/月听起来很多，但如果它让 5 个开发人员的效率提高 2-5 倍，ROI 是巨大的。关键是聪明地使用它。"

十一、总结与建议
1. 持续改进

每周优化设置

David 的设置每周都在改进：

第 1 周：基本使用
第 4 周：添加 hooks
第 8 周：创建 commands
第 12 周：开发 sub-agents
第 16 周：完善文档系统

改进循环

1. 识别重复任务
   ↓
2. 创建自动化（hook/command）
   ↓
3. 测试和迭代
   ↓
4. 文档化
   ↓
5. 分享给团队
   ↓
回到步骤 1

持续学习

- 关注 Claude Code 更新
- 学习新功能
- 实验新模式
- 分享发现
2. 技能复合增长

三个增长维度

1. AI 工具能力

Claude Code 不断改进：
- 新模型
- 新功能
- 更好的性能

2. 个人技能

使用 AI 加速学习：
- 理解新概念
- 学习新技术栈
- 提高调试能力

3. 自定义配置

你的设置越来越好：
- 更多 hooks
- 更好的 commands
- 更智能的 sub-agents

复合效应

时间 → 所有三个维度都在改进 → 指数级增长

David 的成功公式

"成功不是关于一次性的技巧。它是关于每天变得更好一点点。AI 工具在改进，你在改进，你的设置在改进。这就是复合增长。"

3. 社区资源

New Society 会员福利

David 提供的服务（8 月特别优惠）：

1. 定制化 Claude Code 设置

包括：
- 个性化 hooks
- 定制 commands
- 专门 sub-agents
- cloud.md 配置
- settings.json 优化

2. 每周多次通话

直接与 David 或他的开发人员交流：
- 问题解答
- 代码审查
- 架构建议

3. 无限技术支持

遇到问题？
- 实时帮助
- 调试协助
- 最佳实践指导

4. 社区访问

加入其他 AI-first 开发者：
- 分享经验
- 学习技巧
- 协作项目
核心要点总结

四大支柱回顾

1. 优化的 Claude Code 设置
   - Hooks 自动化
   - Commands 快捷方式
   - Sub-agents 专门化

2. 清晰的项目理解
   - 明确的目标
   - 文档化的需求
   - 定义的范围

3. 扎实的技术基础
   - 编程知识
   - 架构理解
   - 调试能力

4. 高效的提示词工程
   - 清晰的指令
   - 上下文管理
   - 迭代改进

成功的关键心态

✅ 愿意学习
✅ 持续改进
✅ 不怕犯错
✅ 主动思考
✅ 文档化一切
✅ 分享知识

避免的陷阱

❌ 外包思考给 AI
❌ 盲目信任输出
❌ 忽视文档
❌ 过早优化
❌ 跳过规划
❌ 忽视成本
最后的建议

给初学者

1. 从简单项目开始
2. 学习基础命令（/clear, /compact）
3. 创建你的第一个 hook
4. 建立文档习惯
5. 不要害怕犯错

给中级用户

1. 优化你的 .cloud 设置
2. 创建 5-10 个 commands
3. 开发 2-3 个 sub-agents
4. 建立文档系统
5. 实验高级功能

给高级用户

1. 分享你的设置
2. 贡献社区
3. 指导他人
4. 推动工具边界
5. 构建复杂系统

David 的最终建议

"Claude Code 不是魔法。它是一个强大的工具，但工具的效果取决于使用它的人。投资于你的技能，优化你的设置，永远不要停止学习。这就是如何成为 10x 开发者。"

附录：快速参考
常用命令
# 基础
Command+Escape  # 打开 Claude Code
Shift+Tab       # 切换模式
/clear          # 清空上下文
/compact        # 压缩历史
/model          # 选择模型

# 高级
/mcp            # MCP 服务器
/agents         # 子代理
/status-line    # 状态行配置

# 更新
cloud update    # 更新 Claude Code
提示词模板
# 规划
"Help me think through [X]. Think hard, answer in short."

# 实现
"Implement [X]. The fewer lines of code, the better. -d"

# 调试
"[描述问题]. Investigate and suggest the minimal fix. -e"

# 深度分析
"Analyze [X] deeply. Take all the time you need. -u"

# 验证
"Are there any SERIOUS issues, or is it basically correct?"
文件结构模板
project/
├── .cloud/
│   ├── hooks/
│   │   ├── append-default.md
│   │   ├── explain-error.md
│   │   └── ultra-think.md
│   ├── commands/
│   │   ├── create-pr.md
│   │   ├── file-review.md
│   │   └── add-tests.md
│   └── agents/
│       └── web-research-validator/
├── docs/
│   ├── architecture.md
│   └── [package]-docs.md
├── cloud.md
└── project-description.md

源视频：

Build Anything with Claude Code, Here’s How

https://www.youtube.com/watch?v=hq8J-nj_Sr0&t

如果这篇文章对你有帮助，欢迎点赞、收藏、转发。也欢迎在评论区分享你的经验，我们一起交流学习！

我是 dtsola【IT解决方案架构师 | AI创业者】 ；专注AI创业、商业、技术、心理学、哲学内容分享。

提供服务：AI项目咨询 | 技术解决方案 | IT项目实施 | 企业技术顾问

博客：https://www.dtsola.com

公众号&VX：dtsola

需提供服务，加微信 dtsola，备注：IT咨询，并说明来意。

需交流经验，加微信 dtsola，备注：交流经验，并说明来意。




#独立开发者 #AI编程 #AI创业 #ClaudeCode #VibeCoding #编程开发 #独立开发 #AI工具 #效率工具 #生产力

---
*导入时间: 2026-01-17 21:12:46*
