---
title: "推荐一个封装了React近10年最佳实践的Skills"
source: wechat
url: https://mp.weixin.qq.com/s/-MretLH0n0KauRM2re4MpQ
author: AI陪我笨拙前行
pub_date: 2026年1月15日 20:05
created: 2026-01-17 23:02
tags: [AI]
---

# 推荐一个封装了React近10年最佳实践的Skills

> 作者: AI陪我笨拙前行 | 发布日期: 2026年1月15日 20:05
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/-MretLH0n0KauRM2re4MpQ)

---

大家好，我是小四。

今天看到 Vercel CEO Guillermo Rauch 发了一条很有意思的推文：

"我们正在把对 React 和 Next.js 前端优化的所有知识，封装成一套可复用的 Agent Skills。这是 10 多年的经验积累，来自像 @shuding 这样的专家，现在蒸馏出来，造福每一个 Ralph。"

Ralph 是谁？Rauch 用这个名字指代“AI Coding使用者”。

如果你让 Claude、Cursor 帮你写过代码，你就是这个 Ralph。

这条推文当时就收获了大量互动（显示 8000+ 赞、65 万次浏览）。

AI 能写代码了，但怎么保证写得好？

Vercel 给了一个答案。

Vercel 做了什么

他们发布了一个叫 react-best-practices 的Skills。

里面是 40+ 条规则，覆盖 8 个类别/维度，并按影响排序。

关键在于：这些规则不是写给人看的，是写给 AI 看的。

装上技能包后，你让 AI 写 React 代码，它会自动按这些规则来写，尽量避开性能坑。

打个比方：

以前让 AI 写代码，就像刚拿驾照的新手上路——会开，但不知道哪里有坑。

现在相当于副驾驶坐了老司机。
新手开车，老司机随时提醒：“这里有坑，绕一下。”

有人在评论区说：

"just installed this, identified 10 fixes I could make"
"刚装上，立刻发现了 10 个可以改进的地方"

这就是价值：你不需要懂规则背后的原理，AI 懂就行。你只需要验收结果。

为什么这件事重要

你可能觉得，这不就是个工具吗？

但它背后其实是一个更大的变化：

越来越多人把“代码初稿”交给 AI。

这意味着，“教人写代码”正在退场，“教 AI 写好代码”正在成为新的核心能力。

知识传播的链条也变了：

专家 → 写文档/博客 → 人读 → 人写代码

现在变成：

专家 → 写Skills → AI 读 → AI 写代码 → 人审核

“读者”从人变成了 AI。

也因此，写给 AI 的规则需要：

• 更清晰的触发条件
• 更明确的边界
• 更可执行的指令

Vercel 的价值不只是 40 条规则，更是他们在探索一种新的知识传播格式。

更大的图景

顺着这个思路，还有三个变化值得注意：

1）专家的角色在变。
从“教人写代码”变成“教 AI 写代码”。

2）这是软性标准化。
谁的Skills有更多的用户，谁就在定义默认范式。

3）普通人的机会在变多。
不只写代码，运营、设计、数据分析的经验，也能被蒸馏成Skills

最后

如果你是开发者，可以在 GitHub 查看安装方式；命令行用户可以这样装：

npx add-skill vercel-labs/agent-skills

如果你不是开发者，这件事的核心也很简单：

AI 时代，知识正在被写给 AI。

文档、博客、教程依然重要，但“可执行的规则”会越来越重要。

未来，“写Skills”可能会像“写文档”一样成为必备技能。

参考资料：

• Vercel 博客：https://vercel.com/blog/introducing-react-best-practices
• GitHub 仓库：https://github.com/vercel-labs/agent-skills

---
*导入时间: 2026-01-17 23:02:19*
