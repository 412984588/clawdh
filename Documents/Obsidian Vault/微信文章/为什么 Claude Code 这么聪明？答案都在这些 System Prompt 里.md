---
title: "为什么 Claude Code 这么聪明？答案都在这些 System Prompt 里"
source: wechat
url: https://mp.weixin.qq.com/s/Faf5F2lmntgM4sMerW7jpQ
author: 晓明兄
pub_date: 2025年12月19日 19:20
created: 2026-01-17 20:26
tags: [AI, 编程]
---

# 为什么 Claude Code 这么聪明？答案都在这些 System Prompt 里

> 作者: 晓明兄 | 发布日期: 2025年12月19日 19:20
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/Faf5F2lmntgM4sMerW7jpQ)

---

“揭秘 AI 编程助手的内核思维
花 2 小时研究这些 System Prompt，终于看懂 Claude Code 的黑魔法

如果你是开发者，最近一定用过 AI 编程助手。你惊叹于它能读懂项目、自动写代码、修 bug，甚至创建完整的 PR。但你有没有想过：这些 AI 编程助手，背后到底藏着什么秘密？

直到我发现了这个 GitHub 仓库——一个把 Claude Code 所有 System Prompts 拆解得清清楚楚的项目。40 多个独立的提示词文件，每个都标注了 token 数量，还有 52 个版本的变更记录。

这就像拿到了 AI 编程助手的「设计图纸」。

为什么这个仓库值得你花 10 分钟？

传统的 AI 工具，你只能看到输入和输出，中间的黑盒你永远猜不透。但这个项目不一样。

它给了你 X 光片：

每个功能背后的具体 System Prompt（怎么告诉 AI 该干什么）
Token 用量（哪些功能占用多少「思考空间」）
版本变化（52 个版本的迭代记录，看 Anthropic 团队怎么优化 AI 行为）

具体能看到什么：

核心系统提示词 3097 tokens - 定义 Claude Code 的语气、行为规范
16 个内置工具描述（Bash、Write、Edit、TodoWrite 等）
子代理提示词（Plan、Explore、Task）- 负责不同工作模式
实用功能提示词（对话压缩、CLAUDE.md 生成、会话标题生成等）

最爽的是：你终于能理解「为什么 Claude Code 有时候表现很聪明，有时候又不太灵」。因为每个行为背后，都是一段精心设计的 Prompt 在起作用。

5 分钟快速上手（真的只要 5 分钟）

第 1 分钟：克隆仓库

git clone https://github.com/Piebald-AI/claude-code-system-prompts.git
cd claude-code-system-prompts


第 2-3 分钟：浏览核心文件

# 查看主系统提示词（Claude Code 的"大脑"）
cat system-prompts/system-prompt-main-system-prompt.md

# 查看 Bash 工具描述（为什么 AI 知道怎么执行命令）
cat system-prompts/tool-description-bash.md

# 查看 Plan 模式提示词（为什么 AI 能先设计再执行）
cat system-prompts/agent-prompt-plan-mode-enhanced.md


第 4-5 分钟：看版本变化

# 打开 CHANGELOG 看 52 个版本的演进
cat CHANGELOG.md | head -50


你会看到的效果：

打开 system-prompt-main-system-prompt.md，你会发现类似这样的内容：

You are an interactive CLI tool that helps users with software
engineering tasks. Use the instructions below and the tools
available to you to assist the user.

# Tone and style
- Only use emojis if the user explicitly requests it.
- Your responses should be short and concise.
- NEVER create files unless they're absolutely necessary.


这就是 Claude Code 的「行为准则」——它为什么不会乱用 emoji，为什么倾向于编辑文件而不是创建新文件。

坑点提醒：这些 Prompt 文件包含一些插值变量（如 ${BASH_TOOL_NAME}），实际运行时会被替换成具体值。Token 数量可能有 ±20 的浮动。

什么场景下你会用到它？

场景 1: 理解 AI 编程助手的行为逻辑

某前端工程师："我用 Claude Code 的时候，发现它总是先读文件、再搜索、然后才写代码，为什么它的工作流这么规范？"

翻开 system-prompt-main-system-prompt.md，你会找到答案：

- Always prefer editing an existing file to creating a new one.
- Use Read tool to read files before editing.
- Use Grep to search for patterns before making changes.


原来 AI 不是「天生聪明」，而是 Prompt 设计者给它定了规矩。


场景 2: 优化自己的 AI Prompt 设计

某 Prompt 工程师："我想让自己的 AI Agent 更像 Claude Code 那样专业，有没有参考案例？"

这个仓库就是最好的「Prompt 设计教科书」：

看 tool-description-bash.md（1074 tokens）学怎么写工具描述
看 agent-prompt-plan-mode-enhanced.md（633 tokens）学怎么设计多步骤规划
看 agent-prompt-conversation-summarization.md（1121 tokens）学怎么压缩长对话

场景 3: 自定义 Claude Code 行为

某技术团队 Leader："我们团队的代码规范和 Claude Code 默认行为不一致，能不能定制？"

可以！这个仓库的姊妹项目 tweakcc 就是为此而生：

把这些 Prompt 文件下载到本地
修改你想改的部分（比如代码风格、命名规范）
用 tweakcc 工具打补丁到你的 Claude Code 安装中

下次遇到这些情况，直接翻出这个项目：

想知道某个 AI 功能是怎么实现的
需要设计自己的 AI Agent System Prompt
想定制 Claude Code 的默认行为

💡 如果你团队里有人正在研究 Prompt 工程或 AI Agent 开发，这篇文章是最真实的工业级参考案例。

仓库的核心价值：透明化 AI 行为

传统 AI 工具的问题在于「黑盒」：你不知道它为什么这样做，也不知道怎么改变它。这个项目打破了这个黑盒。


你能看到的细节

1. Token 用量分布

每个 Prompt 文件都标注了 token 数量，你能看到：

核心系统提示词 3097 tokens（最大的单一 Prompt）
安全审查提示词 2610 tokens（说明安全有多重要）
TodoWrite 工具描述 2167 tokens（为什么任务管理这么智能）

这让你理解：为什么有些功能「更聪明」（因为 Prompt 更长更详细），有些功能「反应更快」（Prompt 短，处理快）。

2. 多层次架构

Claude Code 不是一个单一 Prompt，而是分层设计：

层级
	
组件
	
Token 数量

主系统	
主系统提示词
	
3097

工具层	
Bash
	
1074




	
Edit
	
278




	
TodoWrite
	
2167

代理层	
Plan 代理
	
633




	
Explore 代理
	
516




	
Task 代理
	
294

功能层	
对话压缩
	
1121




	
会话标题生成
	
333




	
安全审查
	
2610

这种分层让不同功能可以独立优化，互不干扰。

3. 52 个版本的演进史

CHANGELOG.md 记录了从 v2.0.14 到 v2.0.71 的所有变化：

哪些 Prompt 被优化了（token 数量变化）
新增了哪些功能（新的 Prompt 文件）
哪些行为被调整了（Prompt 内容变更）

这就像看一部「AI 进化史」，你能学到：Anthropic 团队是怎么一步步把 AI 调教得更专业的。

让人意外的是：很多版本的变化非常微妙，比如某个 Prompt 从 1074 tokens 调整到 1089 tokens，但这 15 个 token 的差异可能就是「AI 更懂你意图」的关键。

对比其他方案：为什么选这个项目？
方案
	
痛点
	
这个项目的优势


直接读 Claude Code 源码
	
代码混淆，Prompt 藏在大文件里
	
已拆分成 40+ 独立文件，清晰标注


自己测试 AI 行为
	
猜测，不确定，浪费时间
	
直接看 Prompt，一目了然


官方文档
	
只讲功能，不讲实现
	
看到实现细节，理解设计思路


其他 Prompt 教程
	
理论多，实战少
	
工业级实战案例，直接可用

我最不推荐：完全不看 System Prompt 就去用 AI 工具。你会发现很多「奇怪行为」无法理解，也不知道怎么优化。

强烈推荐：如果你正在做 AI Agent 开发、Prompt 工程，或者想深入理解 Claude Code，这个项目是必看资源。

配套工具：tweakcc（定制你的 Claude Code）

这个仓库的团队还开发了 tweakcc 工具，让你能真正「改造」Claude Code：

核心功能：

把 System Prompt 文件下载到本地（markdown 格式，方便编辑）
修改你想改的部分
打补丁到你的 Claude Code 安装（支持 npm 和二进制安装）
提供冲突管理（当你和 Anthropic 都改了同一个 Prompt 文件时）

使用场景：

团队代码规范定制：把你的 Coding Style 写进 System Prompt
增强特定功能：给某个工具描述加更多细节
禁用某些行为：比如完全禁止 AI 使用 emoji

快速开始：

# 安装 tweakcc
npm install -g tweakcc

# 初始化配置（会下载所有 Prompt 文件）
tweakcc init

# 编辑你想改的 Prompt
vim ~/.tweakcc/prompts/system-prompt-main-system-prompt.md

# 应用修改
tweakcc apply


坑点提醒：tweakcc 会直接修改你的 Claude Code 安装文件，建议先备份，或者只在测试环境使用。

💼 团队正在探索 AI 编程助手定制化？这个工具能大幅提升协作效率，推荐给你们的架构师看看。

从工具使用到工程化思维

这个项目的价值不只是「看懂 System Prompt」，更是一种工程化思维的体现。

传统思路：

AI 是黑盒，我只能接受它的默认行为
不满意就换工具
不知道为什么 AI 有时好用有时不好用

工程化思路：

AI 是可配置系统，System Prompt 是配置文件
理解内部机制，针对性优化
把 AI 行为标准化、可复制、可迭代

这个项目教会你：

透明化设计：好的系统应该让用户看得懂内部逻辑
模块化架构：40+ 独立 Prompt 文件，各司其职
版本管理：52 个版本记录，每次改动都有迹可循
可定制性：通过 tweakcc 让用户能改造系统

从「学会用 AI」到「理解 AI 设计哲学」，这是质的飞跃。

总结

核心价值：

透明化 AI 行为 - 40+ System Prompt 文件，看懂 Claude Code 的每个决策
工业级参考案例 - Anthropic 团队的 Prompt 设计实战
可定制化 - 通过 tweakcc 改造你的 AI 编程助手
版本追踪 - 52 个版本演进，学习 AI 优化思路

行动建议：

花 10 分钟浏览几个核心 Prompt 文件
如果你在做 Prompt 工程，参考这些工业级设计
如果需要定制 Claude Code，可以研究 tweakcc 工具

💾 收藏这篇，下次团队讨论「AI 编程助手怎么工作」时，这是最好的参考资料。省得以后翻半天文档还找不到答案。

项目地址：

[1]
claude-code-system-prompts: https://github.com/Piebald-AI/claude-code-system-prompts

---
*导入时间: 2026-01-17 20:26:37*
