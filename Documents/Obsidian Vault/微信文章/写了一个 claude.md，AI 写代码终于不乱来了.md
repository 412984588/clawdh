---
title: "写了一个 claude.md，AI 写代码终于不乱来了"
source: wechat
url: https://mp.weixin.qq.com/s/4lyhqQE4xoYC_J8NyD2fgg
author: Feed
pub_date: 2026年1月13日 06:05
created: 2026-01-17 20:10
tags: [AI, 编程]
---

# 写了一个 claude.md，AI 写代码终于不乱来了

> 作者: Feed | 发布日期: 2026年1月13日 06:05
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/4lyhqQE4xoYC_J8NyD2fgg)

---

claude.md 是什么？5 分钟搞懂如何给 AI 立工程规矩

最近在用 Claude Code、MCP、Agent 自动化开发时，很多人都会看到一个文件：claude.md。

它看起来像 README，但不是给人看的； 它像 Prompt，但又不是一次性的。

那它到底有什么用？值不值得认真写？

一句话结论：

claude.md 是给 AI 用的工程规范文件，用来约束行为、降低不确定性、防止翻车。

一、为什么你需要 claude.md？

如果没有 claude.md，AI 很容易出现这些问题：

Vue2 项目被写成 Vue3
路径写错，文件生成在奇怪目录
随意引入新依赖
不经确认大范围改代码
抓网页不用 MCP，开始“编造内容”

这些不是模型不聪明，而是：

AI 没有长期稳定的工程上下文。

claude.md 的价值就在于： 把你的工程规则“固化”下来，让 AI 每次都遵守。

二、有没有官方规范？

目前没有官方强制标准，但社区已经形成共识：

✅ 文件名固定：claude.md
✅ 放在项目根目录
✅ 使用 Markdown
✅ 内容写工程规则，不写宣传文案

目标只有一个：

让 AI 可控，而不是靠运气。

三、一个好用的 claude.md 长什么样？

实践中，一个稳定可用的 claude.md 只需要 6 个模块：

项目是干嘛的（Project）
用了什么技术（Stack）
目录结构（Structure）
开发规则（Rules）
工具使用方式（MCP）
输出约定（Output）

你不需要写长文档，只要让 AI 不犯错即可。

四、最重要的 3 个模块

如果你只写 3 个部分，也能解决 80% 的问题。

✅ 1. 技术栈（防止乱猜）
ounter(lineounter(lineounter(line
Frontend: Vue 2.x
Backend: Flask
Package Manager: pnpm

这是错误率下降最快的一段。

✅ 2. 开发规则（最核心）
ounter(lineounter(lineounter(lineounter(line
- 禁止使用 Vue3 API
- 不随意引入新依赖
- 不修改现有 API
- 优先可读性

规则越具体，AI 越稳定。

✅ 3. 工具约束（防止乱用工具）
ounter(lineounter(line
- 抓网页必须使用 mcp-fetch
- 修改多个文件前必须确认

否则 AI 很容易“自由发挥”。

五、一个可直接使用的最小模板
ounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(lineounter(line
# Project
Visual editor built with Vue2 and GrapesJS.


# Stack
- Frontend: Vue 2.x
- Backend: Flask


# Rules
- Do NOT use Vue 3 APIs
- Avoid new dependencies
- Do not change APIs without confirmation


# Tools
- Use mcp-fetch for web content


# Output
- Respond in Chinese
- Provide runnable code

复制到项目根目录即可。

六、进阶：把 AI 当工程成员

当你开始把 AI 当“工程成员”，而不是聊天工具，可以继续升级：

✅ 代码评审角色约束
✅ Git 提交规范
✅ 安全与性能底线
✅ 自动化流程约束

claude.md 会逐渐变成你的 AI 工程规范中枢。

七、结语

claude.md 的本质不是“写文档”， 而是 把工程经验结构化交给 AI。

规则越清晰，AI 越稳定； 工程越复杂，claude.md 越重要。

---
*导入时间: 2026-01-17 20:10:26*
