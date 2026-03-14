---
title: "根治 Claude Code“失忆症”：我为它设计了一套“外部记忆架构”"
source: wechat
url: https://mp.weixin.qq.com/s/B3m9R-_6wfbV3n2mawiXdw
author: 果叔Ai全球化笔记
pub_date: 2025年9月26日 23:00
created: 2026-01-17 22:52
tags: [AI, 编程, 产品]
---

# 根治 Claude Code“失忆症”：我为它设计了一套“外部记忆架构”

> 作者: 果叔Ai全球化笔记 | 发布日期: 2025年9月26日 23:00
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/B3m9R-_6wfbV3n2mawiXdw)

---

内容字数：约 3042 字

预计阅读时间：约 10 分钟

最后更新日期：2025年09月25日

本文核心脉络

1. 病因诊断：深度剖析 Claude Code 为何总是“犯傻”。

2. 架构蓝图：构建一套多 Agent 协作的“外部记忆系统”。

3. 保姆级实战：手把手教你为 Claude Code 装上这个“外挂大脑”。

4. 核心揭秘：首次公开驱动“记忆执行体”的八层提示词架构与完整示例。

根治 Claude Code“失忆症”：我为它设计了一套“外部记忆架构”

引言：当你的 AI Agent 开始“犯傻”

你好，我是果叔。如果你是一位 Claude Code 的重度用户，一定经历过这样的崩溃瞬间：随着对话变长，AI 开始前后矛盾、忘记关键指令。甚至出现一些让你哭笑不得的“愚蠢”行为——比如，你明明已经让它创建了一个通用的 `Button` 组件，但在后续的开发中，它却完全忘了这回事，为了满足一个新页面的需求，硬生生地重新写了一个功能一模一样的 `NewButton` 组件出来。

这并非 AI “笨”，而是其底层架构的天然缺陷——“上下文窗口限制”。本文旨在提供一个系统性的解决方案，将记忆的控制权，从不可靠的 AI 手中，夺回到我们自己手里。

第一章：病因诊断——为什么 Claude Code 总是“忘事”？

AI 失忆的根源，在于其“聊天窗口”的大小是固定的。即便是 Claude Sonnet 的 200K Tokens 窗口，在复杂的真实项目中也极易被占满。这核心原因还是在于Agent 体系本身对Tokens 的巨量消耗。想了解更多关于Agent 体系Tokens 消耗巨量的原因请看为什么Claude Code 这类AI智能体会消耗天文数字般的Tokens？

Claude 面对此问题的方案是自动压缩历史对话，但这恰恰是问题的关键：压缩的权力在 AI 手里，它会自作主张地丢掉它认为不重要的信息，而这些信息对你来说可能至关重要。

第二章：架构蓝图——构建多 Agent 的外部记忆系统

我的解法很简单：将 AI 的记忆外置化、结构化，并由我们自己掌控。这套系统正好利用Claude Code 原生自带的子Agent 模式，基于“主 Agent + 子 Agent”的协作模式，包含三大核心层：

1. 规则契约层 (Rule Contract Layer)

在项目规则文件（我们命名为 `directive_contract.md`）中，定义主 Agent 与记忆 Agent 之间的交互契约和自动触发条件。

2. 记忆执行体 (Memory Executor Agent)

创建一个名为 `MemoryCog` (记忆齿轮) 的专用子 Agent，它唯一的职责就是作为“执行者”，精准地记录、归档和检索记忆。

3. 记忆持久化层 (Memory Persistence Layer)

由两个 Markdown 文件组成：
• `active_memory_log.md`：项目的“活跃记忆日志”。
• `permanent_archive.md`：项目的“永久记忆档案”。

第三章：保姆级实战——一步步为你的 Claude Code 装上“外挂大脑”
Step 1：环境准备 & 签订契约

在你熟悉的任何 IDE（如 VS Code, Cursor）中打开 Claude Code 终端。首先，在项目根目录创建一个 `directive_contract.md` 文件，并贴入我们的规则。

Step 2：创建“记忆执行体” (`MemoryCog`)

使用 `/agent` 指令，选择人工创建，Agent 名字填写 `MemoryCog`，然后贴入我们为其量身定制的系统提示词（详见第四章）。关键一步是描述调用时机，必须与 `directive_contract.md` 中的触发规则遥相呼应。

Step 3：实战演练与高阶指令

现在，你可以开始任意一个开发任务，比如：“请帮我用 React 和 Tailwind CSS 创建一个简单的登录表单组件”。开发完成后，你会看到 `MemoryCog` 被自动唤醒并创建 `active_memory_log.md` 文件进行记录。当你想回顾或归档时，就需要用到自定义的斜杠指令了。

Pro Tip: 如何自定义斜杠指令?

在 Claude Code 中，你可以通过创建特定的文件结构来定义自己的斜杠命令。首先，在你的项目根目录下创建一个 `.claude/commands/` 文件夹。然后，你创建的每一个 `.md` 文件，其文件名（不含.md）都会自动成为一个新的斜杠命令。

# 例如，创建文件：.claude/commands/recap.md

---
description: "读取并总结当前项目的活跃记忆"
---
Please read the entire content of `active_memory_log.md` and provide a summary of the project's current state, including key decisions, constraints, and pending tasks.

创建完成后，你就可以在 Claude Code 终端中直接使用 `/recap` 命令了。同理，你也可以为 `/archive` 创建一个对应的命令文件。

第四章：核心揭秘——拆解“记忆执行体”的八层提示词架构

驱动这一切稳定运行的核心，就藏在 `MemoryCog` 的系统提示词里。这套我原创的八层架构，遵循了模块化、可验证的设计原则，将复杂的记忆管理，转化成了可控的标准化操作。

第一层：身份协议 (Identity Protocol)
 - 明确 Agent 的身份和职责边界 (只记录，不决策)。
第二层：任务分解 (Task Decomposition)
 - 将复杂任务拆解成最简单的执行单元 (记录、归档)。
第三层：能力清单 (Capability List)
 - 定义 Agent 需要掌握的核心能力 (语义抽取、高置信度判定)。
第四层：核心公理 (Core Axioms)
 - 定义系统运行的绝对约束 (决策不可删、归档只增不删)。
第五层：指令路由 (Command Router)
 - 路由逻辑，让 Agent 知道何时执行何功能 (检测 `/record`, `/archive` 指令)。
第六层：执行逻辑 (Execution Logic)
 - 核心实现，包含详细的触发词矩阵。
第七层：输出格式化 (Format Definition)
 - 保证 Agent 按照指定的 Markdown 格式稳定输出。
第八层：质量保证 (Quality Assurance)
 - 定义写入记录的质量检查要点，防止错误累积。
完整的系统提示词示例 (prompt.md)

# [第一层：身份协议] 你是一名“记录员 (MemoryCog)” subagent。 负责维护：`active_memory_log.md` 和 `permanent_archive.md`。 你需精通：变更合并、信息提取、冲突检测。 确保关键信息在上下文交叉验证中被稳定持久化。  禁止做：1. 你不是主代理 2. 你不需要做任何决策 3. 你不执行任何代码撰写任务  唯一职责：维护记录文档  --- # [第二层：任务分解] 1.  **增量合并任务**：解析对话内容 → 语义抽取 → 合并进 `active_memory_log.md` 2.  **快照归档任务**：当被 `/archive` 指令调用时 → 历史数据迁至 `permanent_archive.md` → 保持主体文件精简  --- # [第三层：能力清单] - **语义抽取**：识别 Facts/Decisions/TODO/Done/Notes - **高置信判定**：仅明确表达才写入 Pinned/Decisions - **稳健合并**：区块增量合并，保证格式一致 - **证据追踪**：为 Done 任务附加 commit/issue/PR 链接  --- # [第四层：核心公理] - 受保护区块 (Pinned/Decisions) 不可自动删除。 - 历史保存：`permanent_archive.md` 只增不删。 - 所有新增事实必须加时间戳 (YYYY-MM-DD)。 - 高置信判定：包含“可能/也许/建议”等弱化词的，需降级至 Notes。  --- # [第五层：指令路由] - if (被主 Agent 自动触发) { 执行 [增量合并] } - if (指令包含 "/archive") { 执行 [快照归档] }  --- # [第六层：执行逻辑 - 语义触发规则] - **Pinned 触发词**： "必须/不能/要求/强制/禁止/务必" - **Decisions 触发词**： "决定使用/选择/确定方案/制定" - **TODO 触发词**： "需要/应该/计划/待办/修复" + 具体任务 - **Done 触发词**： "完成了/实现了/修复了/已部署" - **Notes 降级词**： "可能/也许/大概/建议"  --- # [第七层：输出格式化 - active_memory_log.md] # Project: <name> _last updated: <YYYY-MM-DD>_  ## Pinned - <关键约束/接口要求>  ## Decisions - <YYYY-MM-DD>: <决策内容>  ## TODO - [ ] [P1] [#1] <任务>  ## Done - <YYYY-MM-DD>: [x] <任务> (evidence: commit/PR)  ## Notes - <待确认事项>  --- # [第八层：质量保证] 自检要求： ✔ `active_memory_log.md` 包含全部模板区块 ✔ Pinned/Decisions 块不可缺失 ✔ TODO 的 ID 唯一且递增 ✔ Done 条目包含证据指针 ✔ archive 文件只增不删  输出格式： 📄 「MemoryCog: 进度记录合并完成！」

结语：夺回 AI 记忆的控制权

今天这套方案的核心，是由我们来定义什么是最重要的，将 AI 的记忆控制权牢牢掌握在自己手中。我们通过构建一个分工明确的外部记忆系统，让主代理负责创造，子代理负责记录，而这套系统的稳定运行，又依赖于我们设计的系统提示词。掌握了这套方法，你甚至可以把项目里的 README 或其他任何文档，都变成 AI 记忆的一部分，让它对你的项目理解再上一个台阶。

果叔的军火库推荐

我一直在用的 Claude Code 国内代理，稳定、高速。我已经长时间稳定使用了 2 个月以上，强烈推荐给需要稳定生产力工具的朋友。

访问 code.yoretea.com，使用果叔专属 8 折优惠码：GUOSHU

 看懂了吗？看懂了不重要，重要的是打开你的Claude Code 立刻去尝试一遍，能跑通才重要！

🌌 最好的 AI 协作，不是让 AI 拥有无限的记忆，而是让我们拥有定义其记忆的权力。

---
*导入时间: 2026-01-17 22:52:07*
