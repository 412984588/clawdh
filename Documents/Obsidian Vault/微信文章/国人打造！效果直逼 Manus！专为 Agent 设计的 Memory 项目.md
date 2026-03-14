---
title: "国人打造！效果直逼 Manus！专为 Agent 设计的 Memory 项目"
source: wechat
url: https://mp.weixin.qq.com/s/FHhTUDT9SQxQC-zdFfUpag
author: GitHubStore
pub_date: 2025年11月27日 20:04
created: 2026-01-17 20:50
tags: [AI, 产品]
---

# 国人打造！效果直逼 Manus！专为 Agent 设计的 Memory 项目

> 作者: GitHubStore | 发布日期: 2025年11月27日 20:04
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/FHhTUDT9SQxQC-zdFfUpag)

---

项目简介

Acontext 是一个上下文数据平台，它：

存储 上下文和工件
观察 代理任务和用户反馈。
通过将经验（SOP）收集到长期记忆中，实现代理自我学习。
提供本地仪表板来查看消息、任务、工件和经验。

存储、观察和学习

我们正在构建它，因为我们相信 Acontext 可以帮助您：

构建更具可扩展性的代理产品
提高代理成功率并减少运行步骤

这样您的代理可以更加稳定，并为用户提供更大的价值。

🌲 核心概念
Session - 一个对话线程，支持多模态消息存储。
Task Agent - 后台 TODO 代理，收集任务的状态、进度和偏好。
Disk - 用于代理工件的文件存储。
Space - 一个类似 Notion 的代理 Space，用于存储学习的技能。
Experience Agent - 后台代理，用于提炼、保存和搜索技能。
它们如何协同工作
┌──────┐    ┌────────────┐    ┌──────────────┐    ┌───────────────┐
│ User │◄──►│ Your Agent │◄──►│   Session    │    │ Artifact Disk │
└──────┘    └─────▲──────┘    └──────┬───────┘    └───────────────┘
                  │                  │
                  │         ┌────────▼────────┐
                  │         │ Observed Tasks  │
                  │         └────────┬────────┘
                  │                  │
                  │         ┌────────▼────────┐
                  │         │  Space (learn)  │
                  │         └────────┬────────┘
                  │                  │
                  └──────────────────┘
                  技能指导代理


您的代理技能看起来像：

{
    "use_when": "star a repo on github.com",
    "preferences": "use personal account. star but not fork",
    "tool_sops": [
        {"tool_name": "goto", "action": "goto github.com"},
        {"tool_name": "click", "action": "find login button if any. login first"},
        ...
    ]
}


代理经验将存储在结构化的 Space 中，包含文件夹、页面和块。例如：

/
└── github/ (folder)
    └── GTM (page)
        ├── find_trending_repos (sop block)
        └── find_contributor_emails (sop block)
    └── basic_ops (page)
        ├── create_repo (sop block)
        └── delete_repo (sop block)
    ...

🚀 如何开始？

我们有一个 acontext-cli 来帮助您快速进行概念验证。首先在终端中下载它：

curl -fsSL https://install.acontext.io | sh


您应该安装 docker 并拥有 OpenAI API 密钥，以便在计算机上启动 Acontext 后端：

acontext docker up


📖 本地设置 Acontext 至少需要一个 OpenAI API 密钥。我们推荐使用 gpt-5.1 或 gpt-4.1 作为 LLM 模型

完成后，您可以访问以下端点：

Acontext API Base URL: http://localhost:8029/api/v1
Acontext Dashboard: http://localhost:3000/




成功率和其他指标的仪表板

🧐 如何使用？

使用 acontext 下载端到端脚本：

OpenAI SDK + Acontext (python)

acontext create my-proj --template-path "python/openai-basic"


OpenAI SDK + Acontext (typescript)

acontext create my-proj --template-path "typescript/openai-basic"


OpenAI Agent SDK + Acontext (python)

acontext create my-proj --template-path "python/openai-agent-basic"


Agno + Acontext (python)

acontext create my-proj --template-path "python/agno-basic"


vercel/ai-sdk + Acontext (typescript)

acontext create my-proj --template-path "typescript/vercel-ai-basic"


查看我们的示例仓库以获取更多模板：Acontext-Examples。

项目地址

https://github.com/memodb-io/Acontext/blob/main/readme/zh/README.md







扫码加入技术交流群，备注「开发语言-城市-昵称」

合作请注明




如果你觉得这篇文章不错，别忘了点赞、在看、转发给更多需要的小伙伴哦！我们下期再见！

---
*导入时间: 2026-01-17 20:50:14*
