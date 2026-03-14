---
title: "Claude Superpowers Skill：代码脑暴神器，我试了下真不错"
source: wechat
url: https://mp.weixin.qq.com/s/V5vrDrd-hvUP3fBGF3yd4g
author: 极客精研社
pub_date: 2025年12月26日 00:09
created: 2026-01-17 20:22
tags: [AI, 编程]
---

# Claude Superpowers Skill：代码脑暴神器，我试了下真不错

> 作者: 极客精研社 | 发布日期: 2025年12月26日 00:09
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/V5vrDrd-hvUP3fBGF3yd4g)

---

Claude Superpowers Skill：代码脑暴神器，我试了下真不错

最近在折腾Claude Skills时，偶然看到有人推荐Superpowers这个库。一开始以为就是个普通插件，装上试了试，才发现这东西在复杂项目里发力，帮你主动脑暴方案，问问题还特别精准。说实话，以前用Claude写代码，总觉得缺了点结构，现在这个Skill补上了。来聊聊它是什么，怎么用，有什么坑。

先说说怎么发现的

上周刷文档和社区时，翻到Superpowers的介绍。作者说一开始测试没觉得多有用，但跟Claude Code对话时，它开始主动提脑暴，讨论技术方案，一步步收敛问题，输出靠谱计划。还有人分享用它重构了烂代码，挺带劲的。截图里是终端交互，Claude在帮脑暴NotebookLM的技能，搜索文件、读代码、建议扩展，看起来很智能。

我好奇，就去GitHub（https://github.com/obra/superpowers）扒了扒。简单来说，这是个Claude Code的技能库，专注软件开发流程。不是零散工具，而是整套工作流，从idea到代码落地。

Superpowers 到底干啥？

说白了，它是一堆可组合的“技能”，加上初始指令，让Claude自动用起来。核心是把开发过程标准化，避免你东一榔头西一棒槌。

主要流程：

• 脑暴（Brainstorming）：从粗idea开始，问问题探索方案，分段呈现设计文档，等你验证后保存。
• Git工作树（Using-git-worktrees）：设计OK后，新分支建隔离 workspace，跑setup，确认测试基线干净。
• 写计划（Writing-plans）：把设计拆成小任务，每任务2-5分钟，包括文件路径、完整代码、验证步骤。
• 执行计划（Executing-plans）：派子代理（sub-agent）逐任务干活，两阶段review：先查spec合规，再看代码质量。
• TDD（Test-driven-development）：强制红-绿-重构：先写失败测试，看它fail；最小代码pass；commit。没测试的代码直接删。
• 代码审查（Requesting-code-review）：对照计划审代码，按严重度报issue，关键问题堵进度。
• 收尾（Finishing-a-development-branch）：验测试，选项merge/PR/丢弃，清理worktree。

这些技能在任务前自动触发，成了强制环节。挺有意思的，以前Agent路由复杂，这里靠上下文注入，贴合LLM本性。

还有调试技能，像systematic-debugging，四阶段根因分析；meta技能，教你写新技能。

怎么装？一步步来

针对Claude Code（可能是Claude的代码模式或插件）：

1. 注册marketplace：/plugin marketplace add obra/superpowers-marketplace
2. 安装：/plugin install superpowers@superpowers-marketplace
3. 查帮助：/help，看到/superpowers:brainstorm 等命令就OK。

如果是Codex或OpenCode，告诉它fetch INSTALL.md从GitHub raw链接，跟着走。文档在docs/下。

我试了Claude Code，装上后直接在对话里触发。没代码执行，就纯prompt切换，但脑暴时Claude问题问得准，帮我收敛一个小程序方案，从模糊idea到任务列表，花了10分钟。

踩坑和个人看法

试了下，脑暴部分超赞，适合solo开发者。但如果项目大，子代理dispatch可能卡在上下文限里——Claude窗口不是无限的。吐槽一句，TDD强制有点严，适合新手练手，老鸟可能觉得啰嗦。

相比普通Tool Calling，这更像Prompt升级：不跑代码，而是变“状态”。跟之前聊的Claude Skills一脉相承，按需加载高权限上下文。

有点遗憾，没raw prompt模板，全是技能文件。要自定义，得学着写。

总结

Superpowers 把Claude从“代码生成器”变“开发伙伴”，工作流标准化，脑暴和计划部分最亮眼。如果你用Claude写代码，值得试试。未来Claude Skills生态估计会爆，更多这种库冒出来。

你装过类似东西吗？评论区说说效果。

---
*导入时间: 2026-01-17 20:22:06*
