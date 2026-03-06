---
title: "10K Star！这个 AGENTS.md 开源项目太赞了，AI 编程助手彻底悟了！"
source: wechat
url: https://mp.weixin.qq.com/s/fK8ifcDBbudEJB8-dFLMYg
author: 开源星探
pub_date: 2025年12月11日 18:04
created: 2026-01-17 20:34
tags: [AI, 编程]
---

# 10K Star！这个 AGENTS.md 开源项目太赞了，AI 编程助手彻底悟了！

> 作者: 开源星探 | 发布日期: 2025年12月11日 18:04
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/fK8ifcDBbudEJB8-dFLMYg)

---

当我们在 Cursor、Windsurf、Claude Code 或 VS Code + Copilot 中写代码时，可能会遇到下面这些类似的情况。

AI 看不懂你的项目结构；明明是一个现代框架，它却在用 3 年前的构建命令；还有问它怎么运行项目，它开始胡乱猜；即使你写了 README，AI 还是理解成奇怪的意思...

究其原因是其项目的 README.md 是写给人看的，而不是给机器看的。

这里面充满了上下文、口语化、甚至一些「废话文学」信息，人类能从经验推断出来，但 AI 并不一定懂。

于是，这类问题被开发者社区戏称为：“AI 在看 README 时的智商只有三岁。”

直到最近我看到一个非常有意思的 GitHub 项目：AGENTS.md。

这是一个专门写给 AI 编程智能体（Cursor/Windsurf等） 看的文档格式，让它们真正理解你的项目。

该项目非常火爆，已经收获了 10K Star，可见戳中了 AI 编程开发者的难处。

项目地址：https://github.com/agentsmd/agents.md

项目简介

AGENTS.md 是一个简单、开放的格式，用于指导 coding agents 在你的开发项目中工作。

可以将其视为给 Agents 的 README：一个专门且可预测的位置，用于提供上下文和指令，帮助 AI Agent 有效地与你的代码库协作。

你可以把它理解为“AI 使用手册、项目操作规程、工程化规范”的结合体。

与 README.md 的区别

之所以将他们区分开来是为了：

• Agents 能在标准化位置获得清晰、可预测的指令
• README 保持简洁，专注于人类贡献者
• 精确、面向 Agents 的指导，补充现有文档
快速入手

我们只需要在项目根目录新增一个文件，并命名为 AGENTS.md

下面是一个官方模板：

# Sample AGENTS.md file

## Dev environment tips
- Use `pnpm dlx turbo run where <project_name>` to jump to a package instead of scanning with `ls`.
- Run `pnpm install --filter <project_name>` to add the package to your workspace so Vite, ESLint, and TypeScript can see it.
- Use `pnpm create vite@latest <project_name> -- --template react-ts` to spin up a new React + Vite package with TypeScript checks ready.
- Check the name field inside each package's package.json to confirm the right name—skip the top-level one.

## Testing instructions
- Find the CI plan in the .github/workflows folder.
- Run `pnpm turbo run test --filter <project_name>` to run every check defined for that package.
- From the package root you can just call `pnpm test`. The commit should pass all tests before you merge.
- To focus on one step, add the Vitest pattern: `pnpm vitest run -t "<test name>"`.
- Fix any test or type errors until the whole suite is green.
- After moving files or changing imports, run `pnpm lint --filter <project_name>` to be sure ESLint and TypeScript rules still pass.
- Add or update tests for the code you change, even if nobody asked.

## PR instructions
- Title format: [<project_name>] <Title>
- Always run `pnpm lint` and `pnpm test` before committing.

比如告诉 AI 我的代码风格与规范：

## Coding Standards
- **Components**: Use Functional Components with arrow functions.
- **Imports**: Use absolute imports `@/components/...`.
- **Typing**: Strict mode enabled. No `any`. Define interfaces for all props.
- **Comments**: Write JSDoc for all exported functions.

测试该怎么跑，如何执行等等。

## Testing
- Framework: Vitest + React Testing Library
- Run All Tests: `pnpm test`
- Run Single File: `pnpm test <filename>`
- E2E Tests: Playwright (`pnpm exec playwright test`)

目前支持 VScode、Cursor、Windsurf、Zed、Warp、Gemini CLI等众多AI coding agents工具。

这意味着，AI 会主动读取 AGENTS.md，遵守里面的指令不乱来。

写在最后

我一直认为，AI 编程的未来，不仅仅是模型越来越强，更是人机交互协议的标准化。

README.md 是 Web 2.0 时代的产物，是人写给人的。 AGENTS.md 是 Web 3.0 + AI 时代的产物，是人写给 AI 的。

为你的项目配置一份「机器文档」，将很快成为开发者的基本技能，它很可能会成为未来项目的标配。

趁着现在，花 5 分钟，在你的 GitHub 仓库里新建一个 AGENTS.md 吧。

你会发现，那个曾经有些笨拙的 AI 助手，突然变得懂你、懂项目、懂规矩了。

GitHub：https://github.com/agentsmd/agents.md

 














如果本文对您有帮助，也请帮忙点个 赞👍 + 在看 哈！❤️

在看你就赞赞我！

---
*导入时间: 2026-01-17 20:34:21*
