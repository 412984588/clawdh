---
title: "将任意MCP转为Claude Code Skill"
source: wechat
url: https://mp.weixin.qq.com/s/XukYuTGEF6FsnvPeTgfRpA
author: 字节笔记本
pub_date: 2025年11月4日 07:30
created: 2026-01-17 21:22
tags: [AI, 编程]
---

# 将任意MCP转为Claude Code Skill

> 作者: 字节笔记本 | 发布日期: 2025年11月4日 07:30
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/XukYuTGEF6FsnvPeTgfRpA)

---

上午发了为什么我的Claude Code选择“裸奔”？

但是MCP发展到今天确确实实存在一些非常好用的工具。

正如文章留言区的朋友所讲：先使用，再去摆脱依赖。

所以下午就Vibe Code了一个小工具，功能很简单：可以将任意MCP转为Claude Code Skill。

在原MCP配置和接入不变的情况下，使用Skill来接入完成MCP的功能。

不仅可以对接既有的MCP丰富的生态，还能省去了Skill的编排书写过程，最主要是继承了Skill的灵活和按需加载，可谓一举多得。

使用地址：

https://mcp2skill.streamlit.app/

使用方法：

选择输入方式，可直接输入原始的MCP JSON配置。

点击“生成Skill”，就可以一键点击生成Skill。

自带测试功能，可以看到MCP详情的Tool工具列表和对应的工具详情

最后下载压缩包，解压下载的文件

本地安装依赖: pip install mcp

复制到 Claude Skills 目录: cp -r skill-xxx ~/.claude/skills/

Claude 会自动发现并加载这个 Skill

正确加载上下文，调用这个skill-filesystem 技能，再使用正确的MCP Tool工具来调用。

Skill最后返回正确的结果

也就是说，甚至不用单独在Claude Code中安装MCP Server了，交给Skill来统一管理就可以。

---
*导入时间: 2026-01-17 21:22:50*
