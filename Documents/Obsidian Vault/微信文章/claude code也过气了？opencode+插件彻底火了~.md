---
title: "claude code也过气了？opencode+插件彻底火了~"
source: wechat
url: https://mp.weixin.qq.com/s/v4OwbXftbhFXHZulV1P5Bg
author: 探索AGI
pub_date: 2026年1月4日 22:50
created: 2026-01-17 20:17
tags: [AI, 编程]
---

# claude code也过气了？opencode+插件彻底火了~

> 作者: 探索AGI | 发布日期: 2026年1月4日 22:50
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/v4OwbXftbhFXHZulV1P5Bg)

---

opencode也火了~

主要是因为这个开源插件，真的太强了~

https://github.com/code-yeongyu/oh-my-opencode/tree/dev

opencode是一个开源的CLI coding Agent，上图google trends数据可以看到，最近搜索量坐了火箭一样。

首先，opencode+oh-my-opencode的组合，解决了一个很实际的问题，如果你订阅了openai、google、anthropic 3家的模型，常规操作下，每次只能用一个。

那这个插件可以让他们组队干活，各司其职。默认配置是，opus 4.5 统筹全局，gpt 5.2负责架构调试，gemini 3pro写前端。还有一堆小模型，做简单的事情，比如扫文档、搜全网、读代码库。

作者标识，这是烧了24000刀的Token换来的最佳配置。

为了方便，还把 claudecode的能力都搬过来了，subagent、skills、mcp、hooks，做了完整的兼容层，之前所有的配置都能直接复用。

玩了一下，有几个非常不错的点：

后台的agent是并行的，gpt在调试的时候，claude已经在换思路了，gemini写前端的时候，claude可以干后端，相互之间不用等。

lsp工具全开，以前这些东西只有人能用，现在agent也可以跳转定义、查引用，代码debug了。

有个很强的魔法词 “ultrawork”，提示词加这个，就可以并行agent编排，深度探索，再加上自带的 todo续跑强制功能，干完才收工。

所以这一套到底适合谁呢？如果你只订阅了claude code 或者codex，那其实意义不大，但是如果你本身就经常切换使用，那它的核心价值就是可以让多个订阅发挥 1+1+1>3 的效果。

评论也是特别的顶~

好了，这就是我今天想分享的内容。如果你对构建AI智能体感兴趣，别忘了点赞、关注噢~

#aicoding #aiagent

---
*导入时间: 2026-01-17 20:17:50*
