---
title: "claude code 的 skills 原理白话解析。好（好用！牛！）？还是不好（额外增加复杂度！浪费理解成本！）？你来定！"
source: wechat
url: https://mp.weixin.qq.com/s/YatKCqwObxOhNUsddVCA4A
author: WeEvolve
pub_date: 2025年10月24日 11:13
created: 2026-01-17 21:29
tags: [AI, 编程]
---

# claude code 的 skills 原理白话解析。好（好用！牛！）？还是不好（额外增加复杂度！浪费理解成本！）？你来定！

> 作者: WeEvolve | 发布日期: 2025年10月24日 11:13
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/YatKCqwObxOhNUsddVCA4A)

---

目录
先说结论
Claude Code skills 认知对齐
Skills 的自动发现
创建 Skill
编写 SKILL.md
Skills 和 Commands（斜杠命令）在 Claude Code 中有几个关键区别：
调用方式
文件结构
参数传递
适用场景
Claude Code 中 subagents 和 skills 的异同：
Subagents 特点
Skills 特点
相同点
不同点
个人见解
看看官方有哪些 Skill 帮助理解


先说结论

skills 并没有创造一个新“功能”，但是打开了可组合性、可移植性和标准化的大门。目的就是，省token、省时间提升准确率、方便协作共建。

就像 MCP 虽然仅仅是把 Function call 加上了 微服务，但是重要的是打开了生态和共享的大门呀！参考： MCP（模型上下文协议）去魅！深刻（客观）剖析MCP到底是什么？带来了什么改变 

官方点说就是：

比如我之前听过关于一个博客，大概意思就是一个重复的工作（可以理解成是一个比较固定的工作流），让 cc 重复了 1000 次（这个过程，也呼应了我上次说的 Workflow 和 Agent 的区别）。

试想一下，一个成熟的流程，如果不用 workflow 就意味着每次都要 LLM 做决策下一步做什么。这浪费 token 和调用接口的时间是一方面，另一方面当重复次数上去后，“跑偏”的情况就有可能出现了，从而引入后续 DEBUG 的难度。

但是说实话这些问题 skills 之前就解决不掉吗？并不是，目前看是可以用 CLUADE.md + 一些小脚本替代的。

所以， Skill 还是类似 MCP ，他没有创造（或者让你的使用更方便）。但是，他便于分享和共建。这也是 skill 设计的一个背景。

Claude Code skills 认知对齐

Claude Code skills 毕竟是个新鲜东西，简单介绍一下：

他就是为了扩展一个能力而必须的基本描述、指令、脚本和资源等，Claude 会根据任务相关性自动使用这些能力。也就是说 Skills 是模型调用的——Claude 会根据你的请求和 Skill 的描述自动决定何时使用它们，这与用户调用的斜杠命令（/command）不同。

skills 信息是如何被 Claude Code 发现的呢？我们通过请求日志发现：所有的 skills 会在 tools 里作为 Skill 工具的 description 中被模型发现。

举个例子，我这里注册了两个 skill ，那么具体 skill 的 name 和 description 就会被默认读取。

{
"name": "Skill",
"description": "Execute a skill within the main conversation
<skills_instructions>
When users ask you to perform tasks, check if any of the available skills below can help complete the task more effectively. Skills provide specialized capabilities and domain knowledge.
How to use skills:
- Invoke skills using this tool with the skill name only (no arguments)
- When you invoke a skill, you will see <command-message>The \"{name}\" skill is loading</command-message>
- The skill's prompt will expand and provide detailed instructions on how to complete the task
- Examples:
  - `command: \"pdf\"` - invoke the pdf skill
  - `command: \"xlsx\"` - invoke the xlsx skill
  - `command: \"ms-office-suite:pdf\"` - invoke using fully qualified name
Important:
- Only use skills listed in <available_skills> below
- Do not invoke a skill that is already running
- Do not use this tool for built-in CLI commands (like /help, /clear, etc.)
</skills_instructions>
<available_skills>
<skill>
<name>
artifacts-builder
</name>
<description>
Suite of tools for creating elaborate, multi-component claude.ai HTML artifacts using modern frontend web technologies (React, Tailwind CSS, shadcn/ui). Use for complex artifacts requiring state management, routing, or shadcn/ui components - not for simple single-file HTML/JSX artifacts. (project)
</description>
<location>
managed
</location>
</skill>
<skill>
<name>
skill-creator
</name>
<description>
Guide for creating effective skills. This skill should be used when users want to create a new skill (or update an existing skill) that extends Claude's capabilities with specialized knowledge, workflows, or tool integrations. (project)
</description>
<location>
managed
</location>
</skill>
</available_skills>
",
    "input_schema": {
        "type": "object",
        "properties": {
            "command": {
                "type": "string",
                "description": "The skill name (no arguments). E.g., \"pdf\" or \"xlsx\""
            }
        },
        "required": [
            "command"
        ],
        "additionalProperties": false,
        "$schema": "http://json-schema.org/draft-07/schema#"
    }
}

（做了一半的格式化🐶）大家应该看得出来这是个Function call 的 JSON 输入吧？

Skills 的自动发现

Claude Code 从三个位置自动发现 Skills，和 commmand 和 subagent 差不多：

个人 Skills：~/.claude/skills/
项目 Skills: .claude/skills/
插件 Skills: 通过已安装的插件提供（这个我还没体验过）
创建 Skill

个人 Skills：创建适用于所有项目都可用的个人级别 Skills：

mkdir -p ~/.claude/skills/my-skill-name 

项目 Skills：创建与团队共享的项目 Skills：

mkdir -p .claude/skills/my-skill-name 
编写 SKILL.md

在 .claude/skills/my-skill-name 目录中创建 SKILL.md 文件，Claude Code 会默认读取它（默认是读取它的 name 和 description）：

--- 
name: Your Skill Name 
description: Brief description of what this Skill does and when to use it 
--- 
 
# Your Skill Name 
 
## Instructions 
Provide clear, step-by-step guidance for Claude. 
 
## Examples 
Show concrete examples of using this Skill. 

description 字段非常重要，Claude 通过它来判断何时使用你的 Skill。




Skills 和 Commands 在 Claude Code 中有几个关键区别
调用方式
Skills
：模型调用——Claude 会根据你的请求和 Skill 的描述自动决定何时使用它们，用户没办法用 @ 或者 / 等命令召唤他们，也意味着，要想知道有哪些 skill 你不得不去文件夹里看看，或者直接问问 claude code ：“你有哪些技能可用？”。
Commands
：用户调用——一般你需要明确输入 /command 来触发它们，不过近期 Claude Code 增加了 SlashCommand 工具，也让 command 可以自主调用。
文件结构

Skills：

存储为包含 SKILL.md 文件的目录
可以包含支持文件（脚本、模板、资源等）
使用 YAML frontmatter 定义元数据

Commands：

一般只能存储为 Markdown 形式的 Prompt 文件
参数传递

Skills：通过自然语言描述传递上下文信息 Commands：支持参数占位符，如 $ARGUMENTS、$1、$2 等，例如：

# 命令定义示例 
echo 'Fix issue #$ARGUMENTS following our coding standards' > .claude/commands/fix-issue.md 
 
# 使用示例 
> /fix-issue 123 high-priority 
适用场景

Skills适合复杂的或者说固定的工作流程和领域专业知识，过程中可能包含脚本、资源等，需要 Claude 自主判断何时使用； 

Commands适合明确的、用户主动触发的操作，如快速执行特定任务或模板，只有 Prompt。

 举个例子，比如你想用 Playwright 去爬取一些数据，或者去做一些流程化的测试，如果需要重复 100 次，最高效的方法就是 -- 脚本。如果用 /command 或者 /agents 不是不能做，只是每次都要 Agent 自己去抉择下一步，会出现很多 token 和时间上的 浪费。

Claude Code 中 subagents 和 skills 的异同：
相同点

Subagents 和 Skills 都可以通过插件提供，用于扩展 Claude 的能力，位置的放置等等都很类似。

不同点
Subagents 特点
本质还是 Agent，有至少 Reasoning - Action 循环，时间上、token 上都在消耗。
独立上下文：每个 subagent 使用自己独立的上下文窗口，与主对话分离。
显式调用: 可以通过命令或者 @ 符号 显式调用特定的 subagent，例如：
> Use the code-reviewer subagent to check my recent changes 
存储为带有 YAML 前言的 Markdown 文件，位于 .claude/agents/ 或 ~/.claude/agents/ 目录，内容仅相当于 SKILL.md（没有脚本、资源等）。
每个 subagent 可以配置不同的工具访问级别。
Skills 特点
Skills 是模型调用的 - Claude 根据任务上下文自主决定何时使用它们。
Skills 位于插件根目录的 skills/ 目录中，包含带有前言的 SKILL.md 文件。
Skills 可以在 SKILL.md 旁边包含支持文件。


个人见解

总体上说，如果不用 skills 也可以实现类似的功能，

比如自动如注一些成熟脚本的信息（比如一个用户自己开发的工具） -- 使用 CLAUDE.md + Agentic search （都是 Claude Code 的默认功能）
自动调用工具（比如利用 Bash 工具执行 python3 xxx --args xx）等。


因此，skill 更重要的，是和 MCP 类似，他并没有创造一个“功能”，而是让这种大家都会用到的功能，变得可分享、协议化。
截图 -- 来自 Claude 的认同🐶 


看看官方有哪些 Skill 帮助理解
类别
	
Skill 名称
	
主要功能描述

创意与设计类	
algorithmic-art
	
使用 p5.js 创建生成艺术，支持种子随机性和交互参数，输出 .md、.html、.js 文件。




	
canvas-design
	
创建精美的视觉艺术，重点在于形式、空间、颜色和构成，输出 .png 和 .pdf 格式。




	
slack-gif-creator
	
创建针对 Slack 优化的动图，支持消息 GIF（最大 2MB）和表情符号 GIF（严格限制 64KB）。




	
theme-factory
	
提供 10 个预设的专业主题，并可自动应用到任何工件。




	
brand-guidelines
	
应用 Anthropic 官方品牌色彩和排版，适用于需要公司设计标准的文档。

💻 开发与技术服务类	
artifacts-builder
	
使用 React、Tailwind CSS 和 shadcn/ui 创建复杂的 HTML 工件。

📄 文档处理技能	
docx
	
创建、编辑和分析 Word 文档，支持跟踪更改、评论和格式保留。




	
pdf
	
PDF 综合处理工具包，支持提取文本/表格、创建、合并/分割文档及处理表单。




	
pptx
	
创建、编辑和分析 PowerPoint 演示文稿，支持布局、模板、图表和自动幻灯片生成。




	
xlsx
	
创建、编辑和分析 Excel 文件，支持公式、格式设置、数据分析和可视化。




	
webapp-testing
	
使用 Playwright 测试本地 Web 应用，支持 UI 验证和调试。

🔧 工具与基础设施技能	
mcp-builder
	
提供创建高质量 MCP（模型上下文协议）服务器的指南，使 LLM 能与外部服务和 API 交互。




	
aggregator
	
从多个来源收集和整合数据，并创建预打包的工件。

技能管理工具	
skill-creator
	
提供创建有效技能的指导，包括初始化、打包和验证工具。




	
internal-comms
	
帮助编写各种内部通信，如状态报告、领导更新、3P 更新等。




参考资料：

https://docs.claude.com/en/docs/claude-code/plugins

https://docs.claude.com/en/docs/claude-code/sub-agents

https://docs.claude.com/en/docs/claude-code/common-workflows

---
*导入时间: 2026-01-17 21:29:11*
