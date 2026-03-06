---
title: "Claude Code 推出插件功能"
source: wechat
url: https://mp.weixin.qq.com/s/xtq14nVHpobYDS5zm43zAw
author: AGI Hunt
pub_date: 2025年10月9日 22:02
created: 2026-01-17 22:50
tags: [AI, 编程]
---

# Claude Code 推出插件功能

> 作者: AGI Hunt | 发布日期: 2025年10月9日 22:02
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/xtq14nVHpobYDS5zm43zAw)

---

现在，我们可以给 Claude Code 安装插件了！

Anthropic 刚刚宣布 Claude Code 支持插件系统，让开发者们可以用一条命令就能安装定制化的工具集合。

此次更新的负责人 Daisy Hollman(@The_Whole_Daisy) 兴奋地宣布：

这是我在 Claude Code 中领导的第一个重要功能，真的很期待看到大家怎么使用它！

什么是插件？

简单来说，插件就是把斜杠命令、智能体、MCP 服务器和钩子打包在一起的工具包。

以前你需要一个个配置这些扩展，现在，只需要一个 /plugin 命令就能搞定。

这个系统支持四种扩展类型：

斜杠命令：为常用操作创建快捷方式

子智能体：安装专门用途的开发智能体

MCP 服务器：通过模型上下文协议连接工具和数据源

钩子：在关键工作流节点自定义 Claude Code 的行为

考虑周到的是，这些插件可以按需开关。

也就是说，你可以疯狂装上一堆，然后在需要特定功能时打开对应插件，不需要时关闭，减少系统提示词的复杂度和插件之间的冲突。

对此，Reply guy 😐(@GolerGkA) 称：不知为何，我对这个比最近 OpenAI 的任何公告都更兴奋。

The vibecoder(@gen_ai_help) 也是大赞：哇！我喜欢这个胜过 Open AI 的新闻！

社区驱动

Daisy 透露，Claude Code 团队每隔几天就会在 Slack 频道里分享社区创造的精彩配置，然后就是一片 🤯 和 🎉 表情。

当我们推出自定义斜杠命令时，互联网上就开始出现精心策划的命令集合。随后的钩子和自定义智能体更是火上浇油。

现在有了插件系统，这些分享变得前所未有的简单。

如何使用

使用插件非常简单，只需要几个命令：

添加插件市场：

/plugin marketplace add owner/repo

浏览和安装插件：

/plugin

你会看到一个交互式菜单，显示所有可用的插件。按空格键开关插件，按 u 更新，按 Delete 卸载。

直接安装特定插件：

/plugin install plugin-name@marketplace-name

已有插件展示

Kieran Klaassen(@kieranklaassen) 分享了 Every 市场的「复利工程」插件：

https://github.com/EveryInc/every-marketplace

这个插件包含了代码审查、自动化测试、PR 管理、文档维护等功能，遵循「让每个工程单元都让后续工作更容易」的理念。

Anand Tyagi(@ananddtyagi) 也创建了自己的市场：

https://github.com/ananddtyagi/claude-code-marketplace

他的市场已经包含 32 个命令，涵盖 10 个类别，有 17 位贡献者参与，包括 Lyra 提示词优化专家、代码库分析、代码审查等热门插件。


使用场景

Anthropic 列出了插件的主要使用场景：

强制标准：工程负责人可以通过插件确保团队使用特定的代码审查或测试工作流

支持用户：开源维护者可以提供斜杠命令帮助开发者正确使用他们的包

分享工作流：开发者可以轻松分享调试设置、部署管道或测试框架

连接工具：团队可以通过 MCP 服务器连接内部工具和数据源

打包定制：框架作者或技术负责人可以为特定用例打包多个定制功能

团队配置

企业还可以在 .claude/settings.json 中配置自动安装的市场：

{
  "extraKnownMarketplaces": {
    "team-tools": {
      "source": {
        "source": "github",
        "repo": "your-org/claude-plugins"
      }
    }
  }
}

当团队成员信任仓库文件夹时，Claude Code 会自动安装这些市场和指定的插件。

创建自己的插件

创建插件只需要在项目中添加一个 plugin.json 文件，定义你的扩展组件：

{
  "name": "my-awesome-plugin",
  "description": "让开发更高效的工具集",
  "version": "1.0.0",
  "commands": "./commands/",
  "agents": "./agents/",
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [{"type": "command", "command": "./scripts/validate.sh"}]
      }
    ]
  },
  "mcpServers": {
    "my-server": {
      "command": "./servers/my-server",
      "args": ["--config", "./config.json"]
    }
  }
}
插件市场

任何人都可以创建和托管插件，甚至建立自己的插件市场。

创建市场

在你的仓库中创建 .claude-plugin/marketplace.json 文件：

{
  "name": "company-tools",
  "owner": {
    "name": "DevTools Team",
    "email": "devtools@company.com"
  },
  "plugins": [
    {
      "name": "code-formatter",
      "source": "./plugins/formatter",
      "description": "代码自动格式化",
      "version": "2.1.0"
    },
    {
      "name": "deployment-tools",
      "source": {
        "source": "github",
        "repo": "company/deploy-plugin"
      },
      "description": "部署自动化工具"
    }
  ]
}
分发市场

最简单的方式是通过 GitHub：

创建一个仓库

添加 .claude-plugin/marketplace.json 文件

团队成员使用 /plugin marketplace add owner/repo 添加

你也可以使用其他 git 服务，或者本地开发测试：

# 本地测试
/plugin marketplace add ./my-local-marketplace


# GitLab
/plugin marketplace add https://gitlab.com/company/plugins.git

未来规划

Kevin(@Kevin70143227) 提出建议，希望支持 CLAUDE.md 文件来加载用户定义的指令集。

<<< 左右滑动见更多 >>>

对此，Daisy 神秘地回应：

这个……快了。我不能说太多，但简单来说，我们有个更好的版本即将推出，只是没赶上这次发布。敬请期待！

当被问到是否会将所有扩展都纳入插件框架时，SCOTT(@scottinallcaps) 得到的暗示是这个方向很有道理。

而 Thariq(@trq212) 也确认团队正在开发输出样式功能，让插件不仅限于编码领域。

Svenn ⚡️(@svennpetter) 则更是提出了一个商业化的建议：支持插件货币化会很酷！

网友 Eric Buess(@EricBuess) 表示：这是发布功能和培育社区的正确方式。准备用这个做一些有趣的东西！等不及在 Agent SDK 中看到它了！🔥

现在，插件功能已经对所有 Claude Code 用户开放公测，快去试一下 /plugin 命令安装吧，终端和 VS Code 等 IDE 插件中都可以使用。

回看当年在 npm 出现后，JavaScript 生态系统瞬间爆发。现在，Claude Code 的插件系统也在做同样的事——

插件功能或许将成为 Claude Code 生态系统的一次重要进化。







[1]

官方文档: https://www.anthropic.com/news/claude-code-plugins

[2]

构建插件: https://docs.claude.com/en/docs/claude-code/plugins

[3]

发布市场: https://docs.claude.com/en/docs/claude-code/plugin-marketplaces

👇

👇

👇


另外，我还用AI 进行了全网的AI 资讯采集，并用AI 进行挑选、审核、翻译、总结后发布到《AGI Hunt》的实时AI 快讯群中。

这是个只有信息、没有感情的 AI 资讯信息流（不是推荐流、不卖课、不讲道理、不教你做人、只提供信息、希望能为你节省一些时间）

欢迎加入！

也欢迎加群和7000+群友交流。

---
*导入时间: 2026-01-17 22:50:47*
