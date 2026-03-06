---
title: "是这个了！5个模板让Claude Code改得干净（附提示词）"
source: wechat
url: https://mp.weixin.qq.com/s/UhDNvnCgpa7UTHwmD8aLWQ
author: LEW-AI
pub_date: 2025年11月9日 04:14
created: 2026-01-17 21:16
tags: [AI, 编程, 产品]
---

# 是这个了！5个模板让Claude Code改得干净（附提示词）

> 作者: LEW-AI | 发布日期: 2025年11月9日 04:14
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/UhDNvnCgpa7UTHwmD8aLWQ)

---

问题很简单。
LEW 发现，跟 Claude Code 瞎聊天，最后代码改得乱七八糟。提交历史脏得像垃圾桶，测试漏了，安全也漏了。
这事儿不复杂。把需求写清楚，Claude 就能改得干净。LEW 的办法是：把"提示"升级成小型需求文档，用固定模版卡住 AI 的手脚。
三个疼处
1
第一疼，含糊提示害死人
"修复登录问题"这种话，Claude 听了就瞎改。改哪儿算哪儿，提交历史一团乱麻，测试和安全检查全凭运气。
2
第二疼，长会话里指令会丢
上下文压缩后，Claude 忘了你说的话，重复实现，误删代码，时有发生。
3
第三疼，提交信息随便写
后续回溯和代码审查，成本高得吓人。
LEW 的解法
目标明确。写清"要修什么、在哪修、验收条件是什么"。一个字都别含糊。
具体约束。限定目录和文件，说清楚哪些能碰，哪些不能碰。安全红线、性能红线，都得划好。
标准输出。要求更新测试，写清差异说明，统一提交信息格式。
计划先行。让 Claude 先出方案，你审核通过了再动手。这招最管用。
五个模板，拿来就用
把下面这些模版复制到项目对话开头，按需替换方括号里的内容。
1
一、修 Bug 与提交格式
Role: You are a careful fixer. Follow constraints and produce clean commits.
Task: Fix [issue] in [/path/to/module]. Root cause is [suspected/observed].
Constraints:
Touch only: [/src/auth/, /tests/auth/]
Keep public APIs stable; add tests for regression.
Security: do not log secrets; no plaintext tokens.
Acceptance Criteria:
Failing test added first, then passing after fix.
Manual steps to verify included.
Output:
Diff summary (files, functions, rationale).
Test names and coverage notes.
Commit message: fix([scope]): [concise change]; include "Root cause:" and "Tests:".
2
二、计划先行（审批后再执行）
Task: Propose a step-by-step plan to implement [feature].
Plan must include:
File-level changes
Edge cases & risks
Test strategy (unit/integration)
Rollback notes
Stop after plan. Ask for approval. Only execute after: APPROVED.
3
三、重构与不破坏行为
Task: Refactor [module] to improve [goal: readability/perf].
Constraints:
No behavior change (prove via tests)
Allowed files: [/src/utils/*]
Add benchmarks if perf-related
Output:
Before/after snippet examples
Tests proving equivalence
Commit: refactor([scope]): [what & why]
4
四、研究/文档生成的结构化提示
Task: Create a technical note on [topic] for this repo.
Structure:
Problem statement
Constraints/assumptions (repo-specific)
Recommended approach with trade-offs
Checklist & acceptance criteria
References (paths, files)
Output: MARKDOWN in /docs/[topic].md
5
五、统一提交信息模板（粘到每次对话结尾）
Commit message format:
type(scope): short subject
Body:
Why
What changed (files/functions)
Root cause (if fix)
Tests: [added|updated|none], paths
Risks & rollback
结语
LEW 的建议很直接：把这些模版贴在项目的 CLAUDE.md 或首条信息里。
之后 Claude Code 的每次操作都会更可控。提交历史更干净。可审查，可回滚。



就这么简单。

---
*导入时间: 2026-01-17 21:16:19*
