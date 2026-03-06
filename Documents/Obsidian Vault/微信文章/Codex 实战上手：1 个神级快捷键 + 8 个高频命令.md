---
title: "Codex 实战上手：1 个神级快捷键 + 8 个高频命令"
source: wechat
url: https://mp.weixin.qq.com/s/DPpS9U8u7FYQVErVQeakzw
author: 吴哥AI实操笔记
pub_date: 2025年11月16日 05:11
created: 2026-01-17 21:05
tags: [AI, 编程, 产品]
---

# Codex 实战上手：1 个神级快捷键 + 8 个高频命令

> 作者: 吴哥AI实操笔记 | 发布日期: 2025年11月16日 05:11
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/DPpS9U8u7FYQVErVQeakzw)

---

大家好，我是吴哥，专注AI编程、AI智能体。立志持续输出、帮助小白轻松上手AI编程和AI智能体。

AI 编码工具圈最近一年里头保持着神仙打架势头：前有 Claude Code 占山为王，后脚 Codex 追着掰手腕。

作为常用用户，我把这段时间稳定好用、提效显著的用法沉淀出来：一个快捷键 + 8 个命令，附最佳实践与防翻车清单，帮助你即刻上手、少走弯路。

经常看我文章朋友都直到，过去我一直写ClaudeCode，本篇文章做了对比Codex VS Claude Code。

先看省流版（30 秒）

Esc + Esc：神级上下文管理 → 一键翻历史、二键就地编辑“将要发送的上下文”。

/model：会话内快速切模型，无需再写长长的启动参数。

/approvals：权限闸；强烈建议 Auto 模式，禁用 Full Access。

/new：开启“纯净会话”，隔离旧上下文噪音。

/init：生成 Agent.md，给 Codex 立“系统级人设”（项目结构/风格/命令）。

/compact：压缩上下文；保留要点但可能丢细节，慎用。

/diff：查看 AI 改了什么，一眼掌控变更面。

/mention（@文件/片段）：精准投喂上下文。

/status：查看 token / 上下文占用，保障会话“可呼吸”。

铁律：任何自动化前先 Git commit。AI 写得再香，也敌不过一次“回不去”。

一个快捷键：Esc + Esc（上下文切换）

第一次 Esc：拉起历史记录，全局鸟瞰 AI 的推理与执行路径。

第二次 Esc：光标上移到上一条消息；回车即可就地编辑“将要发送给模型的上下文”（不是撤销已执行的文件操作）。

配套动作：

每一阶段性结果都 git add -A && git commit -m "提交内容描述"

别把“上下文编辑”当成撤销工具；撤销代码请用 Git，而不是对话记录。

八个命令，八种高频场景
1) /model —— 会话内切模型（替代繁琐启动参数）

场景：临时需要更慢更准/更快更省的模型；无须退出重开。

心法：先用默认（通常已很香），遇到“推理不稳/速度不够”再切。

2) /approvals —— AI 的“紧箍咒”（权限闸）

首次在项目里启动 Codex，会让你选权限：

Auto 模式（推荐）：可自动干活，但不可访问网络、且仅限当前文件夹。

Full Access（强烈不建议）：几乎没有围栏，有误删风险。

最佳实践：

绝不选 Full Access；有危险操作用脚本 + 人工确认。

rm / 覆盖写入类操作，让 AI 先输出拟执行命令清单，你审一眼再跑。

⚠️ 高风险提醒：选择 Full Access 可能导致项目或系统文件被误操作。安全第一。

3) /new —— 纯净会话，一键“洗脑”

场景：当前对话“记忆污染”太重；或要换一个全新子任务。

心法：一个功能一个会话；上下文越干净，产出越稳定。

4) /init —— 给 Agent 立“系统级人设”（Agent.md）

作用：在当前目录生成 Agent.md，约定 项目结构/构建命令/代码风格/分支策略 等；每次启动自动加载。

推荐模板：

# Agent.md（示例）
## 项目概览
- Monorepo: apps/*, packages/*
- 前端: Next.js / Tailwind；后端: Node + tRPC；DB: Postgres

## 开发命令
- dev: `pnpm -w dev`
- test: `pnpm -w test`
- build: `pnpm -w build`

## 代码风格
- TS 严格模式；ESLint + Prettier；commit 使用 Conventional Commits

## 工作流
- 以“单功能”为粒度：规划 → 实现 → `/diff` 自检 → 提交
- 禁止大范围重构；如需，先输出重构计划与影响范围

## 产物要求
- 修改点清单 + PR 描述模板 + 风险与回退说明

5) /compact —— 压缩上下文（慎用）

优点：在 Context 将满时“挤一口气”。

风险：细节丢失 → 带来“误会”与“倒退”。

建议：优先 /new + 手动管理上下文；确需保留大局观时再 /compact。

6) /diff —— 变更一目了然

作用：快速查看 AI 改动范围与粒度，发现误改/过改。

建议：每个小功能一轮 /diff → 人工确认 → git commit。

7) /mention —— 精准投喂上下文（@ 文件/目录/片段）

用法：在对话中键入 @ 选择文件或代码片段；或粘贴路径。

例子：

@apps/web/src/pages/index.tsx（指定修复）

@docs/api.md（以契约驱动实现）

心法：少量、精准，比“大堆文件一起丢”更靠谱。

8) /status —— 会话健康监控

查看 token 使用量 / 上下文余量；预判“爆窗”风险。

我个人更习惯看 TUI 右下角，但 /status 适合脚本化检查。

建议工作流（把效率拉满）

目标：让 Codex 像“听话的搭档”，而不是“不可控的自由球员”。

建分支：git switch -c feat/<task>

/new：开启纯净会话

/init：完善 Agent.md（结构、命令、风格、产物）

/model：默认即可；必要时再切

/mention：精准喂入契约/目标文件

分解任务：让 Codex 按子功能输出“执行计划”→ 再动手

/diff：每步自检 → git commit

/approvals：保持 Auto 模式；危险命令先列表后人工执行

收尾：编写 PR 描述（动机/变更点/风险/回退）+ 关键日志

防翻车的清单

绝不 Full Access；Auto 模式 + 白名单。

大改动前先 git stash / commit。

生成脚本/迁移脚本先dry-run。

任何“删除/覆盖”操作先让 AI 列出命令清单，你手动执行。

会话混乱就 /new，别硬顶。

图省事用 /compact 前，确认关键细节不会丢。

以“功能”为单位推进：小步快跑，随时可回滚。

速查卡（收藏版）
Esc Esc       历史总览 → 就地编辑“将发送的上下文”
/model        切换模型
/approvals    权限闸（推荐 Auto；禁用 Full Access）
/new          纯净会话
/init         生成 Agent.md（系统级人设/项目约定）
/compact      压缩上下文（慎用） 
/diff         查看变更
/mention      @文件/片段 精准喂料
/status       token / 上下文占用

Codex VS Claude
 Q&A
“出活速度”？

单点功能：Codex 更快。

复杂流程/多系统：Claude Code 更稳（流程、分工、审计齐全）。

“学不会怎么办”？

Codex：命令少、心智低。

Claude Code：先把高频 Prompt 升级为 Skill（一次学习，长期复用）。

“出错/误删风险”？

Codex：严禁 Full Access，默认用 Auto，危险命令先列表后手动执行。

Claude Code：通过 Subagents 权限 + MCP 围栏 降风险。

“换人能不能续上”？

Codex：靠仓库 Agent.md+ Git 约束即可。

Claude Code：Project + Skills + 调用日志，可交接可回放。

“能不能接公司现有系统”？

Codex：以本地/仓库维度为主；可脚本化。

Claude Code：用 MCP，统一连外部系统（DB/Docs/API/内部平台）。

“多角色并行怎么办”？

Codex：多会话人工调度。

Claude Code：Subagents 分工并行，权限隔离、上下文干净。

“成本如何？”

Codex：学习/迁移成本更低。

Claude Code：前期搭建成本更高，但规模效应明显（复用与治理省大钱）。

“是否可以两者并用？”
最佳实践：Codex 做日常开发 → Claude Code 做方法论与自动化（Skills/MCP/CI）。
落地建议

Step 1：先把活干出来（2 周）

以 Codex 为主：/new 纯净会话、/mention 精准投喂、/diff 自检、git commit 小步快跑。

把高频 Prompt 与约定写进 Agent.md，形成**“可复制的人设 + 项目约定”**。

Step 2：把能复用的“干法”抽成 Skills（2–4 周）

选择 2–3 条高频流程（如代码审查、生成报表、发布文档），封装为 Skills（SOP + 模板 + 脚本）。

引入 Claude Code Subagents 专职执行；危险操作走人工确认。

Step 3：把系统接起来 + 上审计（4–8 周）

通过 MCP 接外部数据/工具（DB/Docs/API/工单系统）。

建 Project 做知识归档与上下文托底；所有产出带来源/参数/版本，实现可回放与审计。

逐步纳入 CI/CD（质量门禁、自动化脚本、健康检查）。

结语

AI 编码的关键不在“让模型一次写完所有”，而在结构化协作：干净的上下文、清晰的人设与产物标准、小步提交的可回滚节奏。

Codex = 轻巧高效的“执行型搭档”：快、易用、适合单点推进与个人/小团队日常开发。

Claude Code = 可治理、可复用的“AI 生产体系”：适合中大型团队，把流程、规范与工具沉淀为“长期资产”。

真正省心的方案：先用 Codex 把价值证实，再用 Claude Code 把流程固化、把系统接通、把合规与审计建起来。




这是今天分享过去AI发展和个人使用见解，感谢阅读。

  如果你对AI编程感兴趣，欢迎交流，进群领取吴哥AI编程手册详细资料福利。要是觉得今天这碗饭喂得够香，随手点个赞、在看、转发三连吧！

---
*导入时间: 2026-01-17 21:05:40*
