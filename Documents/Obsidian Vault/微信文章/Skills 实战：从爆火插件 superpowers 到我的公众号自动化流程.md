---
title: "Skills 实战：从爆火插件 superpowers 到我的公众号自动化流程"
source: wechat
url: https://mp.weixin.qq.com/s/pMgwMOBXBeZIgFzut-8_3Q
author: 芋见AI出海
pub_date: 2026年1月15日 20:04
created: 2026-01-17 20:07
tags: [AI, 编程]
---

# Skills 实战：从爆火插件 superpowers 到我的公众号自动化流程

> 作者: 芋见AI出海 | 发布日期: 2026年1月15日 20:04
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/pMgwMOBXBeZIgFzut-8_3Q)

---

最近 GitHub 上有个项目一天涨了 2000+ star，叫 superpowers。

点进去一看，核心就一个东西：Skills。

Skills 是 Claude Code 去年 10 月推出的功能，简单说就是"教 AI 按你的方式干活"。superpowers 火了，说明大家开始意识到这玩意儿的价值了。







今天聊聊 Skills 到底能干啥，顺便分享我用它自动化公众号写作的实战经验👇

🎯 Skills 是什么

一句话：把你的工作流程写成说明书，让 AI 照着执行。

以前用 Claude Code，每次都要重复说"先写测试再写代码"、“代码要有注释”、“提交前跑一遍 lint”…

现在有了 Skills，写一次，永久生效。

Skills 是一个文件夹，最简单的只需要一个 SKILL.md，复杂的可以包含脚本、模板、配置：

my-skill/ 

├── SKILL.md          # 核心指令（必需） 

├── scripts/          # 辅助脚本（可选） 

│   └── validate.py 

├── templates/        # 模板文件（可选） 

│   └── report.md 

└── examples/         # 示例（可选） 

    └── demo.json 

 

Claude 会根据你的需求自动激活对应的 Skill，不用手动调用。

🔧 案例 1：superpowers（开发工作流）

superpowers 是最近爆火的 Vibe Coding Skills 合集，专门解决"AI 写代码不按套路来"的问题。

它解决什么痛点？

让 AI 写功能，它直接给你一堆代码，不问需求

让 AI 写测试，它经常"忘记"

任务复杂一点，AI 就跑偏

装上之后变成什么样？

1. 写代码前先问需求

以前：

我：帮我写个登录功能 

Claude：好的，这是代码...（直接甩 200 行） 

 

现在：

我：帮我写个登录功能 

Claude：我来帮你梳理一下需求： 

1. 登录方式是什么？ 

2. 需要记住登录状态吗？ 

3. 登录失败有什么提示？ 

... 

 

2. 强制 TDD 流程

superpowers 内置了 test-driven-development Skill，写功能时必须：

先写失败的测试

运行确认失败

写最少的代码让测试通过

重构

每个功能都走这个流程，代码质量直接上一个档次。

3. 任务拆解 + 并行执行

大任务自动拆成 2-5 分钟的小块，还能用 git worktree 并行跑多个子任务。




怎么安装？

/plugin marketplace add obra/superpowers-marketplace 

/plugin install superpowers@superpowers-marketplace 

 

装完输入 /help，能看到 /superpowers:brainstorm、/superpowers:write-plan 等命令就成功了。

📝 案例 2：公众号全流程 Skill（这篇文章就是它写的）

看完 superpowers，我想：开发工作流能自动化，内容工作流是不是也行？

于是我搭了一套"公众号全流程 Skill"，从选题到发布全程自动化。




整体流程

热点采集 → 选题生成 → 选题审核 → 深度调研 → 文章撰写 → 文章审核 → 配图生成 

 

每个环节干了啥

1. 热点采集

自动抓取知乎热榜、GitHub Trending、HackerNews，筛选 AI 相关话题。

2. 选题生成 + 审核

根据我的账号定位（程序员视角的 AI 工具玩家），生成 10 个选题。




然后对照我写的《选题审核标准》打分，不及格的自动修改重审，直到全部通过。

3. 深度调研

选定一个题目后，用 WebSearch 搜集资料：官方文档、教程、用户评价、踩坑经验…

4. 文章撰写 + 审核

按我写的《写作风格方法论》生成初稿：

开头用场景切入

正文按工具教程结构

语言要程序员口吻、真实不装

不用"不是…而是…"句式

不用破折号

写完对照《文章审核标准》打分，100 分制，90 分以上才能发布。

5. 配图生成

输出每张配图的 AI 绘图提示词，标注位置和风格要求。

实际效果

这篇文章就是这套 Skill 生成的：

选题来自今天的 GitHub Trending（superpowers +2000 star）

调研了 GitHub 仓库、作者博客、中文教程

按我的风格方法论写的初稿

审核得分 90 分，直接发布

我只在几个关键节点确认了一下，全程不到 1 小时。

💡 如何创建自己的 Skill

你每天有没有重复做的事情？

写周报、跑测试、审代码、发邮件… 这些流程如果能让 AI 按你的方式自动跑，每周能省几个小时？

创建 Skill 没你想的那么难，4 步就能搞定：

第 1 步：梳理你的工作流程

先想清楚你重复做的事情：

每次都要强调的规范是什么？

固定的执行步骤是什么？

有哪些检查清单？

第 2 步：写 SKILL.md

最简单的结构：

--- 

name: my-skill 

description: 一句话描述 

triggers: 

  - 触发关键词1 

  - 触发关键词2
--- 

 

# 技能名称 

 

## 触发条件 

什么情况下激活这个 Skill 

 

## 执行流程 

1. 第一步做什么 

2. 第二步做什么 

3. ... 

 

## 注意事项 

- 要点1 

- 要点2 

 

第 3 步：放到正确位置

个人使用：~/.claude/skills/my-skill/

项目级别：.claude/skills/my-skill/

Claude Code 启动时会自动扫描这些目录。

第 4 步：测试和迭代

用几次，发现问题就改。好的 Skill 都是迭代出来的。

懒人方案：让 AI 帮你写 Skill

觉得自己写太麻烦？官方早想到了。

Anthropic 内置了一个"帮你创建 Skill 的 Skill"，叫 skill-creator。你只需要口述你的需求，它就能帮你生成完整的 SKILL.md。

比如你说"我想要一个帮我写周报的 Skill，要包含本周完成、下周计划、遇到的问题三个部分"，它就能直接给你生成一个可用的 Skill。

从可塑性和灵活性来讲，Skills 真的太强大了。

⚠️ 踩坑经验

用了一段时间，分享几个坑：

1. Skill 不要写太复杂

一开始我想把所有情况都覆盖，结果 Skill 写了几千字，Claude 反而容易搞混。

后来拆成多个小 Skill，每个只管一件事，效果好很多。

2. 触发条件要明确

如果触发条件太模糊，Skill 会在不该激活的时候激活。

写清楚"当用户要求 XXX 时"，比"当用户需要帮助时"好用。

3. 留出人工确认点

全自动不一定好。关键节点让 Claude 停下来问你一句，比跑完发现全错了强。

4. 当前的局限性

Skills 目前还有两个硬伤：

没法定时执行：不能设置"每天早上 9 点自动跑"，必须手动触发

没法做成服务端：只能在本地 Claude Code 里跑，不能部署成 API 服务

所以现在 Skills 更适合"人在电脑前，让 AI 帮你干活"的场景，完全无人值守的自动化还做不到。

期待官方后续更新吧。

🔗 资源链接

superpowers 相关：

GitHub：https://github.com/obra/superpowers

作者博客：https://blog.fsck.com/2025/10/09/superpowers/

Skills 官方资料：

官方文档：https://code.claude.com/docs/en/skills

Anthropic Skills 仓库：https://github.com/anthropics/skills

社区资源：

Skills 市场：https://claude-plugins.dev/skills

Agent Skills Marketplace：https://skillsmp.com/

Awesome Claude Skills：https://github.com/travisvn/awesome-claude-skills

总结

Skills 的本质是：把你的经验变成 AI 能执行的指令。

superpowers 证明了这套思路在开发工作流上的价值，我的公众号 Skill 证明了它在内容工作流上也能跑通。

如果你有重复做的事情，不妨试试写个 Skill：

梳理流程

写 SKILL.md

放到 ~/.claude/skills/

测试迭代

把 AI 训练成你的专属助手，比每次都从头教它强多了。

有问题评论区见👇

---
*导入时间: 2026-01-17 20:07:44*
