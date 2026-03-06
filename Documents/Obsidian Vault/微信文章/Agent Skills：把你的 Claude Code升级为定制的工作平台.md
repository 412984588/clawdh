---
title: "Agent Skills：把你的 Claude Code升级为定制的工作平台"
source: wechat
url: https://mp.weixin.qq.com/s/oX3ADDWuKVct0-kAPUnXmw
author: Simon Wong 的非线性漫游
pub_date: 2025年10月19日 06:05
created: 2026-01-17 22:27
tags: [AI, 编程]
---

# Agent Skills：把你的 Claude Code升级为定制的工作平台

> 作者: Simon Wong 的非线性漫游 | 发布日期: 2025年10月19日 06:05
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/oX3ADDWuKVct0-kAPUnXmw)

---

Claude 近期推出了一项新的功能 Agent Skill，能够让 AI 更好的完成特定的任务。

Skill 是一组可以重复使用的资源，包含了指令、元数据和可选资源（包括脚本、模板）。

你可以用它来

• 执行特定领域的任务
• 构建成一套个人偏好的工作流程
• 构建成一套团队工作流程
• 生产力工具
• 项目特定的专业知识
• 等等

玩个梗

传统的智能体， 就是在文档写一串文本指令，好无趣好无聊，而技能智能体，就是在传统的智能体，加入技能，好好玩

Skill 和 SubAgent、MCP 的区别关系

你可能会觉得 skill 做的事情 agent、mcp、slash-command 不是也能做吗，但是他们有不同的侧重点：

• Skills：主要用于场景知识、流程指导、专项操作。更像是“能力库”或“工具箱”。
• SubAgent：用来分割复杂任务、并行处理、隔离上下文。Skill 是“加载一个能力”，SubAgent 是启动一个小 Agent 执行子任务。
• MCP：是当 Agent 需要“真正执行”或“接入外部系统”时用，MCP 是工具＆服务接入，而 Skills 主要是知识+预定义脚本。
• mcp 其实有不少局限性，大量消耗 tokens，很多功能可以使用 cli 来代替。
• MCP 是一个完整的协议，比较复杂，而 skill 就是 markdown 和脚本。
• slash-command：skill 确实跟 slash-command 很像，都可以用来定制一套工作流，区别是 slash-command 是用户明确输入 /command 触发的，skill 是模型根据意图被动调用的。

下图是 skill 的架构。

Skill 的架构

我是这么理解这个架构的：

Agent 可以根据上下文调用特定的 skill。
Agent 可以根据上下文调用特定的 mcp。

如何在 Claude Code 中创建 Agent Skill

首先我们先了解下 skill 的结构。这个是一个 pdf skill 的文件结构示例。只有 SKILL.md 是必要的，其他都是可选的按需加载的资源。

pdf-skill/
├── SKILL.md (主要说明)
├── FORMS.md (填表指南)
├── REFERENCE.md (详细API参考文档)
└── scripts/
    └── fill_form.py (实用脚本)

他跟 agent 一样，可以存放在个人（~/.claude/skills/xxx-skill）、项目（.claude/skills/xxx-skill）中，也可以是 Claude Code plugin。

SKILL.md

每一个 skill 都是一个文件目录，包含了最主要的文件 SKILL.md 以及其他资源。

SKILL.md 包含了两部分，顶部的元数据，和内容说明。如下示例：

---
name: 你的技能名称
description: 该技能的具体内容简要说明及使用时机
allowed-tools: Read, Grep, Glob
---

# 你的技能名称

## 说明

[为Claude提供的清晰、分步指导说明]

## 示例

[使用此技能的具体示例]

元数据中的 name、description 是必填的内容，会在 Claude Code 启动时加载，并作为对话的上下文。当 AI 觉得需要调用某个 skill 时，才会读取内容。allowed-tools 可以指定 Claude 可以使用哪些 tools。不设置的话，就会在执行过程中向你请求权限。

内容通常包含工作流程、最佳实践和指导。

其他资源

通常，这个 skill 包含了众多的能力，全部放在 SKILL.md 中会消耗大量上下文。所以可以通过拆分内容来按需加载。只要在内容描述中准确描述比如 对于高级表单填写，请参阅 [FORMS.md](FORMS.md).，但 AI 需要填写表单时，才会加载 FORMS.md 资源。

捆绑额外内容

也可以包含确定性操作的脚本，Claude 会通过 bash 执行脚本。

捆绑可执行脚本
更多的 skills

anthropics 官网开源了一些 skills[1]。

• 文档操作：创建编辑分析 docx、pptx、xlsx
• PDF 操作：全面的 pdf 操作、合并拆分、处理表单
• 另外还有创意设计、开发技术、企业宣传等等领域的工作流

你可以在 claude code 中执行 /plugin marketplace add anthropics/skills 注册插件市场，然后安装特定技能，或者 /plugin install document-skills@anthropic-agent-skills 安装插件。

awesome-claude-skills[2] 是精选的 skills 清单，也可以看看。

结尾

Agent Skills 将 Claude Code 从一个开发工具转变为可定制的工作平台。通过构建和运用 Skills，你可以：

1. 标准化团队工作流程，确保输出质量的一致性
2. 将专业知识封装为可重用的能力模块
3. 在个人和项目之间灵活切换不同专业领域的工作模式

现在开始尝试创建你的第一个 Skill 吧。建议从日常工作中的重复性任务入手，逐步构建属于你的 AI 工具箱。

如果你觉得这篇文章对你有帮助，欢迎点赞、分享，你的支持是我持续创作的最大动力！

相关资源

• Introducing Agent Skills[3]
• Claude Code Agent Skills[4]
• Equipping agents for the real world with Agent Skills[5]
• github: anthropics/skills[1]
引用链接

[1] skills: https://github.com/anthropics/skills
[2] awesome-claude-skills: https://github.com/travisvn/awesome-claude-skills
[3] Introducing Agent Skills: https://www.anthropic.com/news/skills
[4] Claude Code Agent Skills: https://docs.claude.com/en/docs/claude-code/skills
[5] Equipping agents for the real world with Agent Skills: https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills

---
*导入时间: 2026-01-17 22:27:07*
