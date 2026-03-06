---
title: "JetBrains 官宣支持 ACP！10分钟接入 Claude Code"
source: wechat
url: https://mp.weixin.qq.com/s/ofSCDyNiw9KLxvl1cdtGtQ
author: 星鸣
pub_date: 2025年12月6日 00:00
created: 2026-01-17 20:33
tags: [AI, 编程]
---

# JetBrains 官宣支持 ACP！10分钟接入 Claude Code

> 作者: 星鸣 | 发布日期: 2025年12月6日 00:00
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/ofSCDyNiw9KLxvl1cdtGtQ)

---

🎉 重磅！JetBrains 官方支持 ACP 协议，手把手教你在 GoLand 中接入 Claude Code

各位开发者朋友们，今天给大家带来一个令人振奋的消息！

就在 2025 年 12 月 5 日，JetBrains 官方正式宣布支持 ACP（Agent Client Protocol）协议。这意味着什么？你可以在熟悉的 GoLand、IntelliJ IDEA 等 IDE 中，直接使用强大的 Claude Code AI 助手了！

想象一下：在你最熟悉的开发环境中，随时调用 Claude 的强大能力进行代码生成、问题分析、Bug 调试……是不是很心动？别急，本文将手把手教你如何配置，10 分钟就能完成！

📖 背景知识：什么是 ACP 和 Claude Code？

在开始配置之前，先简单了解一下这两个"主角"：

ACP 协议

Agent Client Protocol（代理客户端协议） 是一个开放的通信协议标准，它允许开发工具（如 IDE）与各种 AI 代理服务进行标准化通信。简单来说，有了 ACP，你可以在任何支持该协议的工具中自由切换和使用不同的 AI 助手。

Claude Code

Claude Code 是基于 Anthropic 的 Claude 大模型打造的 AI 编程助手，它能够：

理解复杂的代码逻辑和上下文

提供高质量的代码生成和重构建议

协助进行代码审查和问题诊断

解答技术问题和提供最佳实践建议

而现在，这两者可以完美结合了！ 🎊

🛠️ 配置步骤：三步搞定
第一步：安装 GoLand 2025.3 RC 版本

首先，我们需要安装支持 ACP 协议的 GoLand 版本。

打开 JetBrains Toolbox

找到 GoLand，选择 2025.3 Release Candidate 版本进行安装

💡 温馨提示： RC（Release Candidate）版本是正式版发布前的候选版本，功能已经完善，稳定性也很不错。不过如果你对稳定性要求极高，也可以等待正式版发布。

第二步：配置 ACP 代理

安装完成后，让我们来配置 ACP 连接。

2.1 打开配置界面

启动 GoLand 2025.3 RC

打开 AI Chat 工具窗口（你可能需要先登录 JetBrains 账号）

在选项卡中选择 配置 ACP 代理

系统会自动创建并打开 ~/.jetbrains/acp.json 配置文件

⚠️ 注意事项： 目前 AI Chat 功能需要登录 JetBrains 账号才能使用，不过官方表示后续会调整这一限制。

2.2 安装 Claude Code ACP 代理

打开终端，执行以下命令安装 claude-code-acp：

pnpm install @zed-industries/claude-code-acp 

 

💡 小贴士： 如果你还没有安装 pnpm，可以通过 npm install -g pnpm 命令进行安装。当然，使用 npm 或 yarn 也是可以的。

2.3 修改配置文件

在刚才打开的 ~/.jetbrains/acp.json 文件中，添加以下配置：

{ 

    "agent_servers": { 

        "Claude Code Agent": { 

            "command": "pnpx", 

            "args": [ 

                "@zed-industries/claude-code-acp" 

            ] 

        } 

    } 

} 

 

保存文件后，配置就完成了！是不是很简单？

第三步：开始使用 Claude Code

配置完成后，让我们来体验一下吧！

在 AI Chat 界面中，点击代理选择器

选择 Claude Code Agent

现在你可以开始与 Claude Code 对话了！试着问它一些问题，或者让它帮你生成代码
🌟 实际应用场景

配置完成后，Claude Code 可以在以下场景中帮助你：

1. 代码生成与补全

告诉 Claude 你的需求，它能生成完整的函数、类甚至整个模块的代码。

2. 代码审查与优化

将代码片段发送给 Claude，它会指出潜在问题并提供优化建议。

3. Bug 诊断

遇到难以理解的报错？Claude 可以帮你分析错误原因并提供解决方案。

4. 技术问答

不确定某个 API 怎么用？问 Claude！它能提供详细的使用说明和示例代码。

5. 学习新技术

想学习新的框架或语言特性？Claude 是你的私人导师。

❓ 常见问题与解决方案
Q1: 安装 claude-code-acp 时遇到网络问题怎么办?

A: 可以尝试配置 npm 镜像源，例如使用淘宝镜像：

pnpm config set registry https://registry.npmmirror.com 

 

Q2: 配置完成后找不到 Claude Code Agent 选项？

A: 请确认：

acp.json 文件格式正确（注意 JSON 语法）

已重启 GoLand

claude-code-acp 已成功安装

Q3: 其他 JetBrains IDE 也能用吗？

A: 当然可以！配置方法完全相同，只需安装对应 IDE 的 2025.3 RC 版本即可。包括：

IntelliJ IDEA

PyCharm

WebStorm

PhpStorm

等其他 JetBrains 全家桶产品

🎯 写在最后

JetBrains 对 ACP 协议的支持，标志着 IDE 与 AI 助手集成进入了一个新阶段。开发者不再需要在多个工具之间切换，可以在熟悉的开发环境中直接享受 AI 的强大能力。

这不仅仅是一个新功能，更是开发效率的一次飞跃。 🚀

从今天开始，让 Claude Code 成为你的编程搭档吧！无论是日常开发、学习新技术，还是解决棘手问题，它都能给你提供有力的支持。

📚 参考资料

JetBrains 官方博客：在 IDE 中使用自定义 AI 代理

JetBrains AI Assistant ACP 文档

ACP 协议官方介绍

ACP 代理列表

Claude Code ACP GitHub 仓库

你试过了吗？体验如何？

欢迎在评论区分享你的使用感受，或者提出遇到的问题。如果觉得这篇文章对你有帮助，别忘了点赞、在看、分享给更多需要的朋友！👍

让我们一起拥抱 AI 时代的开发新体验！💪

---
*导入时间: 2026-01-17 20:33:23*
