---
title: "Claude Code 外挂最强大脑 NotebookLM Skill"
source: wechat
url: https://mp.weixin.qq.com/s/CumNAPA3xbS9NUjsni4IyQ
author: 字节笔记本
pub_date: 2025年12月29日 05:28
created: 2026-01-17 20:20
tags: [AI, 编程]
---

# Claude Code 外挂最强大脑 NotebookLM Skill

> 作者: 字节笔记本 | 发布日期: 2025年12月29日 05:28
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/CumNAPA3xbS9NUjsni4IyQ)

---

这个Skills同样之前也有MCP，也被推翻使用Skills生重做了。一个PG数据库分析Skills

用Claude Code 来读取几百个 PDF 和 Markdown目前来说不太现实。

Claude Code的上下文就200K，直接挂载大量的外部数据，不可能。

但使用传统的本地 RAG 又很弱很麻烦，切片，向量化，检索，这一套流程下来，经常因为切片破碎导致 AI 幻觉。

今天这个Skill就完美地解决了这个问题，它结合了目前最强的文档阅读器 Google NotebookLM，将其集成为一个专有的Skill，丝滑接入Claude Code。

这个Skilk充分利用 Gemini 的长上下文能力，一口气吞下 50 多个文档，还能生成带引用的精准回答，它几乎不产生幻觉，只基于你上传的资料回答。

Gemini的文档综述能力可以说是是业界天花板，它比那种基于向量检索的本地 RAG 聪明太多了，它能理解跨文档的关联。

安装使用只需要三步。

进入你的 skills 目录。

cd ~/.claude/skills


下载技能包，skill目录下载地址：https://link.bytenote.net/note

使用前

What skills do I have


自动配置环境，自动安装依赖。

登录完弹出一个 Chrome 窗口让你登录 Google 账号。

有了这个知识库之后，不用每次切出去，复制问题，粘贴，等待回答，复制答案，再切回编辑器，再粘贴给 Claude。

可以说这个Skill彻底打通了 Claude Code 和 NotebookLM 之间的最后一公里。

这个Skill原理也相当简单，在后台启动一个无头浏览器，登录你的 NotebookLM，找到对应的笔记本，你在Claude Code输入问题后，Gemini 在后台疯狂阅读文档，总结答案输出到前台。

如果是写代码，Claude 把这个带引用的精准答案拿回来，直接生成代码。

也就是说再不需要把几百兆的文档喂给 Claude， 塞一堆的资料给Claude，Token 消耗直接归零。

Gemini 负责读万卷书，Claude 负责行万里路。

NotebookLM 目前是免费的，AI Pro会员更有超大容量使用。

NotebookLM Skill当然不仅仅只是用于编程的上下文，我觉得它的更大用处就是打通和激活了笔记AI功能，那些收藏吃灰的笔记终于可以重见天日。

所有的工作流都值得用Skills重写一遍！

---
*导入时间: 2026-01-17 20:20:39*
