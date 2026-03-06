---
title: "OpenAI发了一个怎么做自进化Agent的教程"
source: wechat
url: https://mp.weixin.qq.com/s/aNftuG7fjlPgVqq2uxsY3A
author: 探索AGI
pub_date: 2025年11月13日 22:51
created: 2026-01-17 20:41
tags: [AI]
---

# OpenAI发了一个怎么做自进化Agent的教程

> 作者: 探索AGI | 发布日期: 2025年11月13日 22:51
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/aNftuG7fjlPgVqq2uxsY3A)

---

嘿，大家好！这里是一个专注于前沿AI和智能体的频道~

前几天，openai发了一个关于 self-evolve 自进化 智能体怎么做的博客。

核心思路其实很简单，分三步，代码也开源了。

Agent跑任务，输出结果

-> 评估系统打分，找出问题

-> 用另一个 Agent 改 Prompt，再跑

无限循环，理论上越来越强。

他们拿医疗文档总结做了个例子。

设置了4个评分器：化学名匹配度、长度、语义相似度、LLM-as-judge。

每个评分器有阈值，比如0.85分才算过。

就一直迭代就完了。

代码和博客在这里：https://cookbook.openai.com/examples/partners/self_evolving_agents/autonomous_agent_retraining

浅评一下，整个系统依赖评分，类似于做强化学习，依赖reward。

评分垃圾，优化出来的prompt也越烂。

同时过拟合也会是个很严重的问题，如果用过这套流程。新的prompt很容易出现一些非常具体，不合适的约束。

本质上还是人工设计评分标准 + 自动化调参。Agent 没有真正的自主性，只是在人类定义好的框架里打转。

好了，这就是我今天想分享的内容。如果你对构建AI智能体感兴趣，别忘了点赞、关注噢~

---
*导入时间: 2026-01-17 20:41:15*
