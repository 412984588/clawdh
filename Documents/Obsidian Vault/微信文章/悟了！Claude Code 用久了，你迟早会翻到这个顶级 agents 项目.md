---
title: "悟了！Claude Code 用久了，你迟早会翻到这个顶级 agents 项目"
source: wechat
url: https://mp.weixin.qq.com/s/MRaMcE6SUInaxHLbekMq9w
author: AI开源前哨
pub_date: 2026年1月7日 19:03
created: 2026-01-17 20:15
tags: [AI, 编程]
---

# 悟了！Claude Code 用久了，你迟早会翻到这个顶级 agents 项目

> 作者: AI开源前哨 | 发布日期: 2026年1月7日 19:03
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/MRaMcE6SUInaxHLbekMq9w)

---

哈喽大家好，我是前哨君。

最近在折腾 Claude Code 的时候，翻到一个完成度蛮高的开源项目：agents。
它是一个专门围绕 Claude Code 做的一整套自动化 + 多智能体编排方案，而且很明显是按真实开发流程来设计的。

如果你已经在用 Claude Code 写代码，这个项目能把很多“手动配流程”的事直接抹掉。

“工程脑”设计：模型分层

用过 Claude Code 的朋友应该会感受到，模型能力强不代表适合所有任务，而且token 成本更不是可以忽略的事，伤不起呀。

wshobson/agents 直接把模型和任务做了绑定：

• Opus 4.5：架构设计、安全审查、关键决策
• Sonnet 4.5：日常编码、重构、开发支持
• Haiku 4.5：快速、轻量、批量型任务
该稳的地方不省，该快的地方不浪费。

不管是个人开发者，还是团队用 Claude Code 跑长期项目都很不错。

大代码库不崩的关键：只加载“你现在要用的能力”

另一个很加分的点是它的 渐进式披露架构。

很多人一旦把 AI 丢进大项目里，就会遇到上下文越来越大，模型反而开始变慢、变乱。

wshobson/agents 的做法很直接：

• 插件没装 → 对应能力不存在
• 插件没用 → 技能不进上下文

也就是说，只有你当前调用的插件，才会把智能体、技能和工具注入到 Claude Code。

写 Python、跑 Kubernetes、做安全扫描，互不干扰。
不需要为了一个需求，把整个工具箱都塞进上下文里。

上手成本很低，两步就能用

安装过程也没什么门槛：

第一步：添加插件市场

/plugin marketplace add wshobson/agents

第二步：按需安装插件

/plugin

一些常见组合可以参考：

• 日常开发：python-development、javascript-typescript、backend-development
• 基础设施：kubernetes-operations、cloud-infrastructure
• 安全相关：security-scanning、code-review-ai
简单易用

调用方式也很直观，全是斜杠命令：

• 写个代码文档
/plugin install code-documentation
• 启动一个完整功能开发流程
/full-stack-orchestration:full-stack-feature "用户认证系统"
• 做一次系统级安全加固
/security-scanning:security-hardening --level comprehensive
• 快速生成 FastAPI 微服务脚手架
/python-development:python-scaffold fastapi-microservice
• 进行一次代码审查
/plugin install code-review-ai

目前插件已经覆盖 23 个大类，从开发、测试、文档、数据、数据库，到运维、性能优化、安全合规，基本就是一整套工程工具链。









项目地址：https://github.com/wshobson/agents


用过的朋友，也欢迎在评论区聊聊你最常用的是哪个插件，或者踩过哪些坑。 

欢迎 置顶（标星）关注本公众号「AI开源前哨」获取有趣AI技术/工具分享,这样就第一时间获取推送啦~

做 LLM 应用，这个“测试工具”比再调 prompt 更重要




AI 生成代码怎么安全执行？E2B : 一个专门给 Agent 用的沙箱!




本地跑千万级 RAG，这个开源项目把向量库“压扁”了 97%




我为什么建议所有 Claude Code 用户都装一下这个工具？




Claude Code 老是“失忆”？这个开源插件让 AI 终于记得你在干什么

---
*导入时间: 2026-01-17 20:15:21*
