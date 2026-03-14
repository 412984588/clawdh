---
title: "生产级的 Skills 又上新了，而且是 OpenAI 家的，学（抄）起来"
source: wechat
url: https://mp.weixin.qq.com/s/SPiJL38raP2nBkVmaM0jhw
author: 绿蚁红泥天欲雪
pub_date: 2025年12月20日 19:18
created: 2026-01-17 20:26
tags: [AI, 编程, 产品]
---

# 生产级的 Skills 又上新了，而且是 OpenAI 家的，学（抄）起来

> 作者: 绿蚁红泥天欲雪 | 发布日期: 2025年12月20日 19:18
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/SPiJL38raP2nBkVmaM0jhw)

---

OpenAI 官方终于正式宣布支持 Skills https://developers.openai.com/codex/skills/ 了，而且开源了自己的 Skills 仓库： https://github.com/openai/skills 。

另外，Agent Skills 作为单独的规范标准独立成站： https://agentskills.io/home ，这标志着其作为 Agent 通用规范的开始，而且支持的 AI 开发工具现在已达 10 家，基本都是头部。

这意味着，Skills 作为一个 Agent 的通用规范已然成型，以后写一个，多个大模型来跑，是必然的趋势了！

	
openai/skills 的开源技能

因为 Codex 是开源的，所以其系统提示词也能看到，这样我们就看到了两部分的 skills：内置的（系统级别的），官方打样的（自己选装）。

skills/.system（系统技能）有 3 个：

plan: 规划管理，帮助创建和管理实施计划

skill-creator: 技能创建指南，帮助用户创建新技能

skill-installer: 从 GitHub 等仓库安装社区技能，不仅支持 openai/skills 仓库，也支持自定义的 github 参考，比如自己或团队建一个，一键安装

skills/.curated（官方精选技能）有 7 个：

gh-address-comments: GitHub 处理/归纳/回应评论类

gh-fix-ci: GitHub CI 失败修复流

linear Linear 工作流

notion-knowledge-capture 等: 4 个 notion 系列的 skill，主要是同步文档

重点（敲黑板）：把“高频、可复用、强流程”的工作流（CI 修复、Issue 评论收敛、Notion/Linear 结构化写入）封装成技能，而不是让每个项目都临时写一段提示词。

如何使用

只要更新最新 codex 版本就可以使用了，输入 /skills 或 $ 就能看到支持的 Skills。

Codex 原本是不支持 Plan 模式的，这个是不少人的痛点，现在终于通过 Skills 机制解决了！ 只需在 Prompt 中加上 $plan即可调用内置的 Plan Skill，当然这是显式调用，它也能根据你的提示词自动调用。这下不用苦恼于复杂问题的计划了。

使用就这么简单，无需多说。如果要手动放置skills，只需要放置在 ./codex/skills 下即可（当然你也可以放到系统级、用户级等目录，具体目录看前边链接里官方的文档），之前文章分享的数十个 Skill 都可添加使用。

Skills 拆解学习

最好最快速的学习就是“向高手偷师”，但是得形和神都要有。一起来一览这些 Skill 的设计精髓吧，首选这两个高频的生产机 Skill：

Skill Creator (方法论)：解决的是 "Capability"（能不能做） 的问题。它扩展了 Agent 的能力边界。

Plan (控制轮)：解决的是 "Alignment"（做得对不对） 的问题。它确保 Agent 在能力边界内安全、有序地行动。

我们实际工作中，大部分也是这两类 Skill。

1. Plan Skill：思维与行动的解耦器

Plan Skill 的核心功能是将“思考（规划）”从“行动（编码）”中剥离。它强制 Agent 在执行复杂任务前，先生成一份结构化的 Markdown 计划文件。

原理上，它利用文件系统作为“外挂显存”，解决 LLM 上下文遗忘的问题，并通过“只读代码库”→“生成计划”→“用户确认”的流程，构建了一个安全的人机回环（Human-in-the-loop）。

提示词与设计技巧

模版化约束：SKILL.md 中直接给出了 Implementation plan 和 Overview plan 的严格模版。这利用了 LLM 极强的“完形填空”能力，保证输出格式统一，便于人类快速审查。

规则前置：明确 Core rules，如“绝不修改代码库”、“文件名必须小写连字符”，在 Agent 犯错前进行防御性编程。

什么适合内化为脚本

文件元数据处理：create_plan.py 封装了 YAML Frontmatter 的生成逻辑。让 LLM 手写 YAML 容易出现缩进错误，用脚本处理则 100% 可靠。

检索与预览：list_plans.py 和 read_plan_frontmatter.py 只读取头部信息。如果让 LLM 自己 cat 文件，会消耗大量 Token，脚本则能精准控制读取范围，节省成本。

设计此类 Skill 时，应将 SKILL.md 写成一份“流程规范”。不要只告诉 Agent “做一个计划”，而要告诉它“先只读扫描，再起草正文，最后调用脚本保存”，即详细的流程步骤和约束边界。

2. Skill Creator：标准化的生产流水线

Skill Creator 是一个“元技能”，用于生成其他 Skills。

它的原理是将最佳实践（Best Practices）固化为代码和文档。它不仅是一个工具集，更是一份“教育指南”，教导 Agent 如何遵循“渐进式披露（Progressive Disclosure）”原则来节省上下文资源。

提示词与设计技巧

教育型 Prompt：SKILL.md 花了大量篇幅解释“为什么”（如：上下文是公共资源），而不仅仅是“怎么做”。这能让 Agent 在面对模糊需求时，根据原则自我决策。

分层加载设计：明确区分了 Metadata（常驻）、Body（触发加载）和 Resources（按需加载）三个层级，这是设计高效 Skill 的核心心法。

什么适合内化为脚本

脚手架生成：init_skill.py 负责创建标准目录结构。这种繁琐且容错率低的 IO 操作，绝对不应该让 LLM 逐个命令去敲，脚本一键生成既快又准。

格式校验：quick_validate.py 和 package_skill.py 充当“质检员”。正则匹配命名规范、YAML 解析等逻辑，用 Python 实现比用自然语言让 LLM 检查要严谨得多。

对于复杂的方法论 Skill，SKILL.md 应该像一本“教科书”。包含具体的“Do's and Don'ts”（例如：不要包含 README.md），并提供具体的 Pattern（模式）供 Agent 参考，如“工作流模式”或“任务型模式”。

结语

因为涉及到 SKILL.md 和脚本，如果需要详细说明，就需要贴长短的文字和代码，这就让文章很长，本来是这样写的，最后总结的太不便于阅读了，就都删了。

最后剩下的只是形和神的分析，具体想学习的还是要去 openai/skills 仓库深入学习下，然后实践，这才是最好的途径。公众号文章作为一个快捷了解、判定是否需要深入的选择即可，毕竟你的学会不可能靠一篇或几篇文章，而是要靠实践。

还是老话：大道至简，知易行难。

少说这不行、那不行，多思考这”这为何行、我如何用“。

#ClaudeCode #Claude #Skill #Agent #Codex #AI #AICoding #VibeCoding

---
*导入时间: 2026-01-17 20:26:15*
