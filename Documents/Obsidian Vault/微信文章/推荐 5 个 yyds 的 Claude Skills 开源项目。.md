---
title: "推荐 5 个 yyds 的 Claude Skills 开源项目。"
source: wechat
url: https://mp.weixin.qq.com/s/TL_6jQ4K1fFKENFc7gGm1g
author: 逛逛GitHub
pub_date: 2025年11月23日 02:05
created: 2026-01-17 20:51
tags: [AI, 编程]
---

# 推荐 5 个 yyds 的 Claude Skills 开源项目。

> 作者: 逛逛GitHub | 发布日期: 2025年11月23日 02:05
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/TL_6jQ4K1fFKENFc7gGm1g)

---

前段时间，Anthropic 推出了 Claude Skills 能力。
这是一种模块化能力扩展机制。有了它你不就用给 AI 重复解释了。
你可以把所有想让 Claude 吸取的经验都写到一个 Skill.md 文件里面。
这个文件可以理解为是一份详细的指令说明书、可执行的脚本或相关资源，专门用于完成某项特定任务 。
感兴趣可以看看下面这个文章，有详细描述。
开源地址：https://www.claude.com/blog/skills
比如你搞了一个 Skill.md 文件，里面放了 AI 生成 PPT 固定流程的指令。你给 Claude 说：帮我生成 PPT，这个 Skill 就能激活。你就不需要每次都把你的要求写出来。
今天看看 GitHub 上有哪些实用的 Claude Skills。
节省你的时间，直接拿来用，不用自己写了。

01

Claude Skills 大合集

awesome-claude-skills 是一个精心整理的 Claude Skills 精选列表，专门用于定制Claude AI 工作流程。
该项目收集了各种实用 Skill，采用模块化设计。比如文档处理、开发、数据分析、营销、写作创意啥的都有。
开源地址：https://github.com/ComposioHQ/awesome-claude-skills
项目结构清晰，每个技能文件夹都包含 SKILL.md 文件，其中详细描述了技能的功能、使用场景和操作指令。部分复杂技能还提供了辅助脚本、文档模板和资源文件，方便你快速上手。
比如这个 playwright-skill 是让 Claude 模型调用 Playwright 自动化测试和验证网页应用。
然后开发者 @BehiSecc 也开源了一个类似精选列表。大差不差，可以一起对照着看。
开源地址：https://github.com/BehiSecc/awesome-claude-skills

02

Claude Code 基础设施

这个开源项目里面的 Skill 就两个字：实用。
因为每个 Skill 都经过了真实项目的严格测试，具有极高的实用价值。
是开发者经过 6 个月的打磨，经过生产环境检验的 Claude Code 基础设施。
它解决了 Skills 无法自动激活这个问题。
传统的 Claude Code Skill 需要你手动记忆和调用，而这个项目通过创新的钩子机制，实现了 Skill 的智能自动触发。
当你输入提示或操作文件时，系统会自动分析上下文，并建议最相关的技能。
每个主要 Skill 文件控制在 500 行以内，配合多个资源文件实现渐进式披露。这种设计避免了大型技能文件超出上下文限制的问题，同时确保了信息的深度和广度。
基础设施包含 5 个 Skills，涵盖后端开发指南、前端开发指南、技能开发元技能、路由测试和错误追踪等领域。
开源地址：https://github.com/diet103/claude-code-infrastructure-showcase

03

数据分析 Agent

开发者 @obra 觉得现在的 AI 写代码太随意了，所以他写了一组 Skills，强迫 Claude 按照世界级高级工程师的标准流程来工作。

superpowers 就像一套专门为程序员打造的高级技能包。

装了之后，Claude 的模式就是：收到需求 -> 先头脑风暴 -> 制定详细计划 -> 写测试用例（TDD） -> 写代码通过测试 -> 检查质量。

所以不像常规的 AI，直接给你写业务代码，有没有 Bug 全靠运气。

比如，它有 brainstorm（头脑风暴）和 write-plan（写计划）skills。在写任何代码前，它会先生成一份详细的 Markdown 计划书，列出所有步骤，你确认没问题了，它才开始干活。

开源地址：https://github.com/obra/superpowers

04

网站转成 Skills

Skill_Seekers 这个开源项目之前介绍过。

它其实是一个自动化工具，可以把文档网站、GitHub 项目和 PDF 文件转换为 Claude AI Skill 。

不需要你手动阅读总结文档了。

全程无需手动操作，将智能抓取的信息有机整合，最后整理成 Claude 能直接导入的 .zip  技能包。

开发者写了一篇从 0 部署这个开源项目的文章，很详细。

开源地址：https://github.com/yusufkaraaslan/Skill_Seekers

05

点击下方卡片，关注逛逛 GitHub

这个公众号历史发布过很多有趣的开源项目，如果你懒得翻文章一个个找，你直接关注微信公众号：逛逛 GitHub ，后台对话聊天就行了：

---
*导入时间: 2026-01-17 20:51:03*
