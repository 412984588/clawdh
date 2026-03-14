---
title: "微软悄悄发布了 Amplifier 来探索 AI 自动化的未来"
source: wechat
url: https://mp.weixin.qq.com/s/3Sd8npylZ6ZrSjKr2diCXw
author: 明志说
pub_date: 2025年10月21日 23:37
created: 2026-01-17 22:10
tags: [AI, 编程]
---

# 微软悄悄发布了 Amplifier 来探索 AI 自动化的未来

> 作者: 明志说 | 发布日期: 2025年10月21日 23:37
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/3Sd8npylZ6ZrSjKr2diCXw)

---

微软最近悄然推出了 Amplifier，一个新的 AI 自动化框架，旨在通过结合专用代理、记忆系统和工作流，推动更高效的自我学习自动化系统。
一、什么是 Amplifier?

Amplifier 是微软推出的一款早期研究框架，旨在探索如何将多个专用代理（AI agents）、记忆存储系统和工作流结合起来，打造出一种自我改进的自动化系统。该框架提供了一个协调和加速开发的环境，能够管理多个 AI 代理协同工作，同时保持持久的知识，确保任务执行时能够积累历史数据。

Amplifier 的最大特点在于，代理不是每次都从头开始，而是通过记忆和上下文信息，让每次任务执行都能够利用之前的经验，提升效率和智能。

Github 上的开源库地址：https://github.com/microsoft/amplifier

二、Amplifier 如何工作？
代理和工作流

Amplifier 中的每个代理都有特定的目标和预设的任务方法，例如设计系统架构、调试代码或进行安全审查。这些代理会共享一个共同的知识库，使得每个代理都能在执行任务时使用已经积累的知识。

例如，Amplifier 中的 “Zen Architect” 代理专注于设计和优化系统架构，而 “Bug Hunter” 则专注于自动化调试工作。每个代理会依照特定的工作流运行，在执行过程中不断积累新的信息。

持久记忆和知识提取

Amplifier 的另一个亮点是其持久记忆系统。当你为代理提供文件或文档时，它会将这些内容进行分块、总结并存储，方便后续的任务使用。这使得 Amplifier 成为一个 “记忆驱动”的自动化框架，可以不断提高代理的任务执行能力。

多元化任务和并行工作

Amplifier 不仅仅返回单一答案，而是通过并行化的方式，在多个不同的方向上生成并评估解决方案。这种方法类似于人类专家的工作方式：同时探索多个可能的解决方案，进行比较分析，最终选出最优解。

三、Amplifier 的安装运行

Amplifier 主要使用 Python 和 Node.js 技术栈，支持高效的开发和部署。它依赖于多个技术框架的集成，确保 AI 代理能够稳定运行。

为了在本地使用 Amplifier，你需要准备好以下环境：

Python 3.11+
Node.js 18+
pnpm 包管理器

通过以下步骤，你可以快速启动并运行 Amplifier：

克隆 Amplifier 仓库并安装依赖：
git clone https://github.com/microsoft/amplifier.git
cd amplifier
pnpm install
pnpm run build

设置 Python 环境并安装依赖：
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

启动命令行界面：
pnpm start

总结

Amplifier 的设计理念与微软的 AI 战略高度契合，是一个充满潜力的 AI 自动化工具，它不仅可以管理多个 AI 代理的协作，还能实现持久记忆和任务执行的自动化。

Amplifier 帮助开发者创建更加智能、灵活的自动化系统，推动 AI 技术在企业中的应用。

目前它仍处于实验阶段，但其创新的设计和未来的发展潜力值得关注。

---
*导入时间: 2026-01-17 22:10:10*
