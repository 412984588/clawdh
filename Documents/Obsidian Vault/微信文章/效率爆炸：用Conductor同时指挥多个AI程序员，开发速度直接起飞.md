---
title: "效率爆炸：用Conductor同时指挥多个AI程序员，开发速度直接起飞"
source: wechat
url: https://mp.weixin.qq.com/s/i-6uLY6nvxj0mrYUfnUqjQ
author: AmpCode
pub_date: 2025年10月30日 19:20
created: 2026-01-17 21:25
tags: [AI, 编程]
---

# 效率爆炸：用Conductor同时指挥多个AI程序员，开发速度直接起飞

> 作者: AmpCode | 发布日期: 2025年10月30日 19:20
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/i-6uLY6nvxj0mrYUfnUqjQ)

---

Conductor 是一款 Mac 应用，能够同时运行多个 Claude Code 智能体。每个智能体都将获得代码库的独立副本。您可以在同一界面中实时查看各智能体的工作进度，并审核、合并它们的代码变更。

安装指南
下载 Mac 版本

访问 conductor.build 官网，点击"下载 Conductor" 将 Conductor 应用拖拽至"应用程序"文件夹 启动 Conductor

通过 Homebrew 安装：

brew install meltylabs/tap/conductor

目前 Conductor 仅支持 Mac 系统，暂不提供 Windows 或 Linux 版本。

环境配置

Conductor 要求您已在终端环境中登录 GitHub 账户。请运行 gh auth status 命令验证登录状态。

若您已使用 Claude Code，则无需额外配置。否则请先设置 Claude Code 并执行 claude /login 登录命令。

完成上述步骤后，您就可以开始指挥智能体团队协同工作了！

创建首个工作区

安装完成后，即可开始添加您的第一个代码库。 您可以选择添加本地文件夹或 Git 远程仓库中的代码库。

新建工作区

添加代码库后，Conductor 会自动创建新的工作区。

每个工作区都是您 Git 仓库的独立副本和分支。Conductor 仅复制 Git 跟踪的文件，但您可以通过设置脚本自动复制其他文件（如 .env 文件或运行 pnpm install）。后续我们将详细介绍此功能！

此时您有两个选择： 在常用 IDE 中打开工作区（⌘O）继续开发 使用内置聊天功能，让 Claude Code 协助您完成项目

工作流程

以下推荐的最佳实践，将帮助您充分发挥 Conductor 的潜力：

为每个功能创建独立工作区

建议为每个新功能或故障修复创建专属工作区。

开发阶段

您可以直接在 Conductor 中使用 Claude Code，也可以在惯用的 IDE 中打开工作区进行编辑。

审核与测试变更

通过差异查看器（⌘D）审核代码变更。使用终端或运行面板测试修改内容。 

创建拉取请求与合并

创建拉取请求（⌘⇧P）。若检查未通过，Conductor 将协助您修复问题。 确认无误后，即可完成Merge！

归档管理

功能开发完成后，可将工作区归档。您随时可从"已归档工作区"页面恢复工作区——包括所有聊天记录。

并行智能体
同时运行多个 Claude Code 智能体

在 Conductor 中创建并行智能体非常简单。只需按下 ⌘ + N 即可创建新的工作区。 Claude 将在独立环境中开始工作，在此处进行的修改不会影响其他 Claude 智能体。

使用 conductor.json 进行配置

Conductor 通过 conductor.json 文件来配置运行脚本。

共享配置
推荐在工作区根目录创建 conductor.json 文件，并将其提交至 Git 版本管理。 这样既能将配置与代码同步版本化，也能让新开发者在使用时快速上手。

本地配置
您也可以在代码库根目录创建 conductor.json 文件。此配置将应用于所有相关工作区。 通过点击侧边栏中的代码库名称，再点击"打开"按钮，即可访问代码库根目录。

运行机制
Conductor 会在以下三个位置查找 conductor.json 文件：

工作区根目录：例如工作区路径为 ~/my-repo/.conductor/tokyo，Conductor 将查找 ~/my-repo/.conductor/tokyo/conductor.json
远程默认分支根目录：通常对应 origin/main
代码库根目录：例如代码库路径为 ~/my-repo，Conductor 将查找 ~/my-repo/conductor.json
斜线命令

在聊天中运行自定义命令

斜线命令功能允许您将常用指令定义为 Markdown 文件，供 Claude Code 执行。 前往"设置" -> "命令"管理您的自定义命令。您可以添加自定义 Markdown 指令，或从推荐命令中选择使用。

目前斜线命令为全局设置。暂不支持用户或项目层级的命令配置。

常见问题解答

Conductor 是否使用工作树？
是的，每个 Conductor 工作区都是一个全新的 Git 工作树。

Conductor 支持哪些代码智能体？
目前仅支持 Claude Code。其他智能体即将推出。

Conductor 如何支付 Claude Code 的费用？
Conductor 使用您已登录的 Claude Code 方式。如果您使用 API 密钥登录 Claude Code，Conductor 也会使用该密钥。如果您使用的是 Claude Pro 或 Max 套餐，Conductor 将使用该套餐。

---
*导入时间: 2026-01-17 21:25:14*
