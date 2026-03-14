---
title: "Codex 史诗级更新！引入 Skills 技能库，直接兼容 Claude 生态，开发效率原地起飞"
source: wechat
url: https://mp.weixin.qq.com/s/jKXomWL0JG5sLPhEBNM-pg
author: AI智见录
pub_date: 2025年12月8日 22:00
created: 2026-01-17 20:40
tags: [AI, 编程]
---

# Codex 史诗级更新！引入 Skills 技能库，直接兼容 Claude 生态，开发效率原地起飞

> 作者: AI智见录 | 发布日期: 2025年12月8日 22:00
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/jKXomWL0JG5sLPhEBNM-pg)

---

Skill 是 Claude Code 此前推出的一个核心功能，最近我也在试用，这东西还是挺好玩的。这不，OpenAI 终于也按捺不住了，在刚刚发布的 Codex CLI 0.65 版本中，正式带来了试验性的 Skills 支持。

这一次更新不仅是对标竞品，更是将 "Agentic Workflow"（代理工作流）的概念进一步引入到了终端开发环境中。

什么是 Skills？

简单来说，Skills 就像是为你的 AI 助手外挂了一个「技能库」。

在此之前，如果你希望 AI 按照特定的规范写代码（比如特定的 CSS 命名规则、特定的测试流程），你通常需要把这些规则写在 AGENTS.md 里，或者每次在 Prompt 中重复粘贴。但这带来了两个问题：

1. 上下文浪费：所有规则都要一次性塞给 AI，占用了宝贵的 Token。
2. 复用困难：很难在不同的项目之间共享同一套工作流。

Codex CLI 的 Skills 功能解决了这个问题。它允许你在全局目录（~/.codex/skills）下定义一系列标准化的工作流文件（SKILL.md）。AI 启动时只会读取这些技能的名称和描述，只有当你明确调用（或 AI 觉得需要用）某个技能时，它才会去读取详细的内容。

这是一种 "Progressive Disclosure"（渐进式披露）的设计哲学——只在需要的时候，提供必要的信息。

快速上手：配置你的第一个 Skill

由于目前该功能仍处于试验阶段（Experimental），你需要手动开启它。

1. 开启功能配置

在你的 ~/.codex/config.toml 文件中，添加以下配置：

[features]
skills = true
2. 创建技能目录

Codex CLI 默认从 ~/.codex/skills 读取技能。我们可以创建一个简单的目录结构：

mkdir -p ~/.codex/skills/pdf-processing
3. 编写 Skill 文件

每个技能的核心是一个 SKILL.md 文件，它包含 YAML 头部元数据和 Markdown 正文。

Example:

---
name: pdf-processing
description: Extract text and tables from PDFs; use when PDFs, forms, or document extraction are mentioned.
---

# PDF Processing
- Use pdfplumber to extract text.
- For form filling, see FORMS.md.

配置完成后，重启 Codex CLI。你可以通过输入 /skills 或在对话中使用 $ 符号来查看和调用技能。

更方便的是如果之前你本地有自己搭建过的技能，可以直接一键复制，例如 cp -r ~/.claude/skills/pdf-to-md ~/.codex/skills/pdf-to-md。如下所示，这个是我之前在 Claude Code 中写的一个技能 Claude Code + Skills 自动解读 DeepSeek V3.2 技术报告。



Claude Code 官方 Skills 库推荐

Anthropic 官方维护了一个非常棒的开源仓库 anthropics/skills，里面提供了大量经过验证的 Skill 范例，涵盖了创意设计、开发技术、文档处理等多个领域。

你可以访问 https://github.com/anthropics/skills 查看完整列表。以下是几个值得关注的官方 Demo：

• Document Skills：这是一组处理办公文档的强力技能，包含 docx、pdf、pptx 和 xlsx。通过这些技能，你可以让 AI 具备读取 PDF 表单字段、生成 PowerPoint 演示文稿或分析 Excel 数据的能力。
• Frontend Design：这是一个专门用于提升前端设计质量的技能。它包含了一套完整的 UI 设计原则（排版、色彩、布局），可以防止 AI 生成那种「虽然正确但很平庸」的 Bootstrap 风格页面。

这些官方 Demo 不仅可以直接使用，更是学习如何编写高质量 Prompt 和工作流的最佳教材。



无缝迁移：从 Claude 到 Codex

好消息是，Codex 的 Skills 机制采用了与 Claude Code 几乎完全一致的 SKILL.md 格式。这意味着，你完全不需要从头编写，可以直接将 Claude Code 的生态资源迁移到 Codex CLI。

迁移步骤
1. 克隆仓库：首先将 Anthropic 的 Skills 仓库克隆到本地。
git clone https://github.com/anthropics/skills.git
2. 复制技能：找到你感兴趣的技能文件夹（例如 skills/frontend-design），将其直接复制到 Codex 的技能目录中。
cp -r skills/skills/frontend-design ~/.codex/skills/
3. 重启生效：重启 Codex CLI，输入 /skills 检查。你会发现 frontend-design 已经赫然在列，并且可以立即使用！

这种高度的兼容性极大地降低了迁移成本，也让 Codex 用户能够直接受益于 Claude 社区的丰富资源。

0.65 版本的其他亮点

除了 Skills，Codex CLI 0.65 版本还有一些值得关注的改进：

• Codex Max 正式成为默认模型：经过数个版本的迭代，Codex Max 的表现已经足够稳定，现在不仅是默认选项，还修复了 TUI 中的异步崩溃问题。
• 更好的恢复（Resume）体验：新增了 /resume 命令，并且优化了性能，让你可以更顺滑地回到之前被打断的工作流中。
• TUI 体验升级：终端界面支持了 Ctrl-P/N 上下导航，修复了 Windows 下的剪贴板粘贴问题，整体交互更加顺手。

---
*导入时间: 2026-01-17 20:40:32*
