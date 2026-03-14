---
title: "终于！Gemini CLI支持Agent Skills，一键搬运Claude Code的“绝招”"
source: wechat
url: https://mp.weixin.qq.com/s/F8MjGoOp6kTexv45fqMfpA
author: AIGC胶囊
pub_date: 2026年1月8日 23:25
created: 2026-01-17 20:14
tags: [AI, 编程]
---

# 终于！Gemini CLI支持Agent Skills，一键搬运Claude Code的“绝招”

> 作者: AIGC胶囊 | 发布日期: 2026年1月8日 23:25
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/F8MjGoOp6kTexv45fqMfpA)

---

说实话，等这个等挺久了。

Claude Code 去年就开放了 Agent Skills，随后开源成了开放标准。OpenAI 的 Codex 紧跟着接入。Google 这边——慢了一拍，但总算来了。

目前 Gemini CLI 的 Agent Skills 还在 nightly 版本里，正式版还没放出来，所以我也没法亲自体验。但官方文档已经公开了，今天就把这个特性扒一扒，算是给大家提前做个介绍。

等正式版上线，咱们再聊实际体验。

Agent Skills 是个啥

一句话：给 AI 装"专业技能包"。

你用 Claude Code 或者 Cursor 的时候可能有这个体验——AI 什么都懂一点，但什么都不精。遇到你们团队特有的代码规范、构建流程、PR 审查标准，它就抓瞎了。

Agent Skills 就是解决这个问题的。

一个 skill 就是一个文件夹，里面放一个 SKILL.md，告诉 AI 该怎么做。可以附带脚本、模板、参考文档。AI 判断需要的时候自动加载，不需要的时候不占 context。

这个设计挺聪明——按需加载，不浪费 token。下面是几篇入门文章可以看看：

Agent Skills 编写葵花宝典

Agent Skills 到底是个啥？为什么你的 AI 智能体需要它？

Agent Skills 资源大搜集：官方 + 社区精选合集

10秒学会！Claude Skill 轻松复刻任意公众号样式！

Gemini CLI 怎么玩

根据官方文档，Gemini CLI 的 Agent Skills 目前还是实验性功能，需要手动开启：

第一步：装 nightly 版

npm install -g @google/gemini-cli@nightly

注意是 @nightly，不是正式版。

第二步：开启 Skills 功能

进入 Gemini CLI 后输入：

/settings

找到 experimental.skills，打开它。

Skills 从哪来

Gemini CLI 从三个地方发现 Skills：

来源
	
路径
	
说明

项目级	.gemini/skills/	
跟项目一起提交 Git，团队共享

用户级	~/.gemini/skills/	
你个人的，所有项目都能用

扩展级	
通过 extensions 安装
	
第三方扩展带的 skill

优先级是 项目 > 用户 > 扩展。如果有同名 skill，高优先级的会覆盖低优先级的。

这个设计跟 Claude Code 类似，迁移起来应该问题不大。

管理命令

Gemini CLI 提供了一套 /skills 命令：

/skills list      # 列出所有 skill
/skills disable <name>   # 禁用某个 skill
/skills enable <name>    # 启用某个 skill
/skills reload    # 重新加载所有 skill

默认是用户级生效。加 --scope project 可以管理项目级的设置。

也可以在命令行直接用：

gemini skills list
gemini skills enable my-skill
gemini skills disable my-skill

这点比 Claude Code 多了个命令行入口，算是个小改进。

怎么写一个 Skill

一个 skill 至少需要一个 SKILL.md 文件，放在 skill 目录根下。

格式是 YAML frontmatter + Markdown 正文：

---
name:code-reviewer
description:代码审查专家。当用户说"review"、"检查代码"、"帮我看看"时使用。
---

# 代码审查流程

你是一个代码审查专家，按以下流程工作：

1.**分析**：检查改动范围是否合理
2.**风格**：确保符合项目规范（参考GEMINI.md）
3.**安全**：标记潜在安全问题
4.**测试**：确认有对应的测试覆盖

输出格式：优点+ 改进建议

几个要点：

• name：唯一标识，小写+短横线
• description：最关键的字段。Gemini 根据这个判断什么时候激活 skill。写得越具体，触发越精准

官方推荐的目录结构：

my-skill/
├── SKILL.md          # 主文件
├── scripts/          # 可执行脚本（bash/python/node）
├── references/       # 参考文档、schema、示例数据
└── assets/           # 代码模板、boilerplate

Skill 被激活后，Gemini 会拿到整个目录的 tree 视图，可以随时读取这些资源。

安全机制

这里值得单独说一下，因为设计得挺谨慎的。

Gemini CLI 激活 skill 的流程是这样的：

1. 发现：启动时扫描所有 skill 目录，只读取 name 和 description（省 token）
2. 匹配：你说话的时候，Gemini 判断哪个 skill 能帮忙
3. 确认：弹出确认框，告诉你要激活哪个 skill、它能访问哪些目录
4. 注入：你确认后，SKILL.md 的完整内容和目录结构才会注入 context
5. 执行：AI 按照 skill 里的流程干活

关键点：需要你确认才能激活。

不像有些工具直接静默执行，这套设计至少让你知道 AI 要干什么、能访问什么。算是比较克制的做法。

跨平台这件事

Agent Skills 是开放标准，不是 Google 自己搞的。

https://agentskills.io

Claude Code、Codex、Gemini CLI 理论上都兼容。你写一个 skill，到处都能用。

但"理论上"这三个字得划重点。

不同平台的环境变量不一样（$CLAUDE_PROJECT_DIR vs $GEMINI_PROJECT_DIR），底层调用方式也可能有差异。如果你的 skill 里有脚本，迁移的时候可能需要做一些兼容处理。

不过对于纯 SKILL.md 驱动的 skill，应该是无缝迁移的。

目前的问题

因为还在 nightly 版本，有几个显而易见的限制：

1. 不能用于生产：nightly 版本本来就是给尝鲜的，稳定性别指望太多
2. 生态还比较空：Claude Code 的 skill 生态已经有一堆 awesome-xxx 库了，Gemini CLI 这边刚起步
3. 文档还比较薄：官方文档覆盖了基本用法，高级场景还得自己摸索

等正式版出来，这些应该会逐步改善。

值得期待吗

如果你已经在用 Claude Code 的 skills，可以等 Gemini CLI 正式版出来后迁移一波。格式是兼容的，工作量不大。

如果你还没用过 Agent Skills，可以先从 Claude Code 入手。生态更成熟，踩坑的人更多，资料更全。等熟悉了再迁移到 Gemini CLI 也不迟。

至于"哪个更好用"这个问题——成年人不做选择，全都要😂

我是AIGC胶囊，谢谢你读我的文章。
如果觉得不错，随手点个赞、在看、转发三连吧🙂
如果想第一时间收到推送，也可以给我个星标⭐

---
*导入时间: 2026-01-17 20:14:05*
