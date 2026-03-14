---
title: "每位高级工程师都推崇的 Git 工作流"
source: wechat
url: https://mp.weixin.qq.com/s/ObSP-3UgZCWdGGPz4r8YFA
author: 001024
pub_date: 2025年11月30日 19:34
created: 2026-01-17 20:35
tags: [产品]
---

# 每位高级工程师都推崇的 Git 工作流

> 作者: 001024 | 发布日期: 2025年11月30日 19:34
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/ObSP-3UgZCWdGGPz4r8YFA)

---

版本管理的最终目标是：
做到“无感”，但在关键时刻稳定得像岩石。

可 Git，本身一点也不“无感”。
它强大，但并不美观；灵活，但容易混乱。

几乎所有高级工程师都有相同的噩梦：

• 合并冲突折腾一整周
• “幽灵提交”神秘出现
• 主干被误改导致生产炸锅
• 分支结构像一锅乱麻
• 谁也说不清哪个环境对应哪个分支

经历过足够多这些坑之后，他们最终都会悟到一个真理：

Git 的本质不是命令，而是“工作流”。

一个好的工作流能让团队协作顺滑、有序、可控，让你从 Git 混乱地狱里解脱出来。

而经过多年打磨，在大部分资深工程师中逐渐沉淀出一个最有效、最稳妥、最可扩展的工作流：

基于主干（Trunk-Based Development）的：短生命周期特性分支 + PR 审查 + 稳定主干 + 发布标签管理。

本文带你拆开这个工作流——你完全不需要踩多年坑，就能掌握和高级工程师一样的 Git 心法。

为什么大多数 Git 工作流都会失败？

很多团队以为自己的 Git 协作流程已经“够用了”。
但失败往往不是显式的，而是慢性病：

1. 太多长期存活的分支

“feature-v2-final-final-really-final”
分支一放就是几周。

结果是：

• 分支差异巨大
• 合并冲突堆到天上
• 代码腐坏（rot）
• 一合并就风险巨大
2. 代码提交完全没纪律

有人一次 commit 一万个文件
有人一天只 commit 一次
有人 commit message 写 “fix”
有人 rewrite history 搞到整个团队懵掉

提交风格的混乱，是团队协作的毒瘤。

3. 没有“唯一真相源头”（Source of Truth）

main？
develop？
staging？
release-v3？

如果没人能回答：

“哪个分支才是生产环境真实代码？”

那么你距离事故已经不远了。

🧭 高级工程师推崇的 Git 工作流

最终沉淀出来的方案是：

**以主干为核心（Trunk-Based Development）

• 只保留短生命周期 feature 分支
• 所有内容通过 Pull Request 进入主干
• 使用 tag 管理发布版本**

结构如下：

main
│
├── feature/add-login
├── feature/upgrade-api
└── hotfix/fix-auth-bug

简单、清晰、可规模化。

接下来逐条拆解。

1. 黄金法则：主干（main）永远可部署

这是最高准则，违反一次就会付出代价。

main 必须：

• 随时能编译
• 所有测试都通过
• 随时可直接部署到生产

为了做到这点，需要：

• 分支保护（branch protection）
• 强制 PR 审查
• 自动化 CI 检查
• 线性历史（可选但推荐）

当 main 稳定时，整个团队速度会快得多。

2. Feature 分支生命周期必须短（1–3 天）

资深工程师从来不会让自己的分支“存活太久”。

原因很简单：

• 分支越久 → 与 main 差异越大
• 差异越大 → 合并越痛苦
• 合并越痛苦 → 进度越推不动

一个专业的 feature 分支：

• 清晰命名：feature/add-payment
• 生命周期短：1–3 天
• 专注一件事
• 合并速度快

短生命周期 = 小风险 + 快反馈 + 更少冲突。

3. 像专业人士一样写 Commit（小、原子、可读）

一个优秀的 commit：

• 只做一件事
• 内容原子化
• 信息足够

好例子：

feat: add password reset endpoint
fix: handle nil pointer in billing service
chore: remove deprecated serializers

坏例子：

fix
update code
misc changes
final fix really works

原子 commit 的好处：

• 可干净地 revert
• 清晰历史
• 易于 blame
• PR 可控且小

代码是写给人和机器读的，Commit Message 也是。

4. PR 不是代码完成后才开的 —— 要尽早开 Draft PR

许多工程师：
“代码快写完了，我开个 PR。”

高级工程师：
“我刚写一半，我先开个 draft PR。”

提前开 PR 的好处：

• 早反馈
• 提前跑 CI
• 可见性更高
• 减少冲突概率
• 团队更同步

PR 是沟通工具，不是完工证明。

5. PR 越小越好（300 行以内是黄金标准）

“小 PR = 好 PR”。

因为：

• 审查更快
• 更不容易出 bug
• 回滚容易
• 风险更小
• 审查者压力更低

小 PR ≠ 小影响。
小 PR 是对“大影响的拆分”。

6. 使用 Squash + Merge（除非你有特别理由不用）

这是争议点，但高级工程师普遍偏向 squash merge。

好处：

• 主干历史极干净
• 每个 PR 对应一个 commit
• 没有 “fix typo” 垃圾 commit
• bisect 速度更快
• 回滚更容易

详细历史？
你的 feature 分支里已经有。

7. 发布必须打 Tag（且保持一致）

无论你一天发一次还是一天发二十次，都要打标签。

为什么 tag 必须存在？

• 版本历史清晰
• 回滚有锚点
• 部署更可追踪
• 多环境管理更有序

常见格式：

v2.3.1
v2.4.0
v2.4.0-rc1

关键是 一致性。

8. Hotfix 可以绕过流程，但必须遵守规则

生产崩了？
那就要“救火流程”。

hotfix 规则：

1. 从 main 拉 branch
2. 修复
3. PR + merge 回 main
4. 打 patch tag（例如 v2.3.1）
5. 若有长期 release 分支则再 back-merge

Hotfix 是例外，但必须组织有序。

9. 自动化是成熟团队的标志

想要高效协作，只有一条路：

能自动化的都自动化。

包括：

• 测试
• lint
• static check
• 格式化
• 安全扫描
• 部署触发

自动化减少争论，增加产出。

10. 工作流必须简单到能“在一张餐巾纸上画出来”

如果你无法在 60 秒内向新人解释团队的 Git 工作流，那这个工作流就太复杂了。

GitFlow 曾经流行，但现在被认为是：

• 太重
• 太慢
• 太多 ceremony
• 太不适合快速迭代

Trunk-Based Development 反之：

• 摩擦更低
• 速度更快
• 冲突更少
• 上手更快
• 历史更干净
• 部署更容易
示例：一个资深工程师的 Git 工作流（完整流程）

👇 一个典型 feature 的完整流程：

1. 更新主干
git checkout main
git pull
2. 创建分支
git checkout -b feature/add-invoice-filter
3. 小步提交
git add .
git commit -m "feat: implement invoice filter"
4. 推送 + Draft PR
git push -u origin feature/add-invoice-filter
5. CI 自动跑测试
6. 审查 & 修改
7. squash + merge 回 main
8. 打 tag
9. 部署
10. 删除分支

流程清晰且可复用。

工程师常犯的 Git 错误（高级工程师如何避免）

❌ 在过时代码上继续开发
✔️ 资深工程师经常 rebase / pull

❌ 一次性推 2000 行 PR
✔️ 资深工程师分块拆解

❌ 直接 push 到 main
✔️ 永不违反主干可部署规则

❌ 分支不删
✔️ 分支短命、及时清理

❌ 不打 tag
✔️ 完整、清晰的发布历史

❌ 提交混乱
✔️ 提交有语义、有结构

为什么这个工作流被高级工程师视为“标准答案”？

不是因为它新潮、酷炫或理论完美。
而是因为它：

• 简单
• 稳定
• 可扩展
• 易维护
• 高效
• 风险低
• 能适应现代持续交付节奏

它遵循工程的现实：

• 人会犯错
• 代码会变复杂
• 需求会变
• 团队会流动
• 时间永远不够

越复杂的系统，越需要简单的流程。

高级工程师信这个流程，是因为：

它让团队能专注于构建产品，而不是与 Git 战斗。

🏁 最后的结论：

Git 不让你高级，但你的工作流会。

掌握这个流程后，你会明显感觉到：

• 冲突变少了
• PR 更快合了
• 历史更清晰了
• 部署更稳了
• 团队氛围更好了
• 自己写代码也更自信了

工作流的成熟感，就是“高级工程师的味道”。

---
*导入时间: 2026-01-17 20:35:14*
