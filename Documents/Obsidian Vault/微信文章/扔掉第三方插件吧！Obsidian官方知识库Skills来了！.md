---
title: "扔掉第三方插件吧！Obsidian官方知识库Skills来了！"
source: wechat
url: https://mp.weixin.qq.com/s/EQjqHSx3xdmkaDcSW6fI3w
author: 字节笔记本
pub_date: 2026年1月6日 22:29
created: 2026-01-17 20:16
tags: [AI, 编程]
---

# 扔掉第三方插件吧！Obsidian官方知识库Skills来了！

> 作者: 字节笔记本 | 发布日期: 2026年1月6日 22:29
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/EQjqHSx3xdmkaDcSW6fI3w)

---

Obsidian的CEO Kepano 刚刚开源了一套技能包工具 obsidian-skills。

这套skill直接打通Claude Code 读写笔记的技能，Obsidian上的第三方AI插件真的可以扔掉了！

用过AI处理 Obsidian 笔记的朋友都知道，体验其实很割裂。

让 AI 帮你整理笔记，它生成的链接往往是标准的 Markdown 链接，而不是 Obsidian 那个好用的双向链接。

帮你画个图，一堆的Mermaid 代码，但真正想要的是 Obsidian Canvas 那种无限画布的节点。

obsidian-skills直接把Obsidian专家集成在 Claude Code 里，仓库包含三个核心技能Skill:

obsidian-markdown Obsidian 风格的 Markdown计写，各种专有格式都支持。

obsidian-bases  .base 类数据库视图支持过滤、公式、汇总。

json-canvas  .canvas无限画布文件格式可以实现点、连线、分组。

通用型的AI模型因为知识库的问题可能本身不了解 Obsidian 特有的语法和文件格式。

这个技能包让 Claude Code 能够正确理解和生成 Obsidian 特有语法，正确处理 .base 和 .canvas 这些 Obsidian 专有格式。

比如我让obsidian-markdown skill来写一个如臂使指的介绍文章。

在这个专家型的Skill指导下，生成文档结构完整，元数据，多种 Callout，引用等都应用自如。

很好的理解和正确生成所有Obsidian 特有语法。

Obsidian Bases让 Claude Code 能够创建和编辑类数据库视图文件。

下面就是我创建的书籍阅读追踪数据库，如果靠人工来配置，真的是费时费力，还不一定写正确。

但如果使用这套技能，既整洁又漂亮，还完全不用动脑，全自动实现编写公式属性，配置视图。

如果你有项目任务看板，会议笔记索引这些场景使用需求，这套技能能够帮你省下n多的时间，提高几倍的效率。

JSON Canvas 无限画布是Obsidian里面我最喜欢的一个功能。

现在有了这套skill之后的，可以更畅快地让让 Claude Code  创建和编辑无限画布文件，你唯一要做的就是整理资料、梳理材料，确定主题。

全自动创建节点，还能定义连线设置位置、大小、颜色，适合于思维导图流程图等自动化场景。

这才是本地知识库真正应该做的，不做简单的素材收藏，而是让内容节点通过AI来不断地进行连接和碰撞。

而且Obsidian Skills这套开源仓库，内容也相当的经典，它可以作为我们学习Skill的很好的参照，是知识固化专家型Skill非常好的典范，和之前发布Skills驱动的前端页面设计有异曲同工之妙，只不过我的这套前端设计经验固化更加的极致，里面包含了更多完整的内容和全面的知识点。

Obsidian Skills下载地址(skills目录)：

https://link.bytenote.net/note

原仓库地址：

https://link.bytenote.net/Q2N6XD

---
*导入时间: 2026-01-17 20:16:28*
