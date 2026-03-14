---
title: "OpenAI 正悄悄引入 skills 功能，已在ChatGPT与Codex CLI中可用"
source: wechat
url: https://mp.weixin.qq.com/s/ly-_g96UlCXGlJMedC30TA
author: 最佳人生
pub_date: 2025年12月13日 09:46
created: 2026-01-17 20:31
tags: [AI, 编程]
---

# OpenAI 正悄悄引入 skills 功能，已在ChatGPT与Codex CLI中可用

> 作者: 最佳人生 | 发布日期: 2025年12月13日 09:46
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/ly-_g96UlCXGlJMedC30TA)

---

一个 Skill 只是一组文件夹，其中包含 Markdown 文档以及可选的资源和脚本。只要任何具备文件系统读取与导航能力的 LLM 工具，就能使用这些技能（skills）。

https://github.com/openai/codex/blob/main/docs/skills.md

该skills指南文档指出，任何放在 ~/.codex/skills目录下的文件夹都会被视为一个技能。

如何创建 skill

1. ~/.codex/skills/<skill-name>/

2. 增加SKILL.md

---
name: your-skill-name
description: what it does and when to use it (<=500 chars)
---


# Optional body
Add instructions, references, examples, or scripts (kept on disk).

3. 确保 name 与 description 都在规定长度范围内，并且不要在这两个字段中使用换行符。
4. 重启 Codex(命令如：codex --enable skills)，即可加载新添加的技能。

列出所有 skill

在 codex cli 中，使用如下命令可列出本地所有skills插件

list skills
一个例子
文件：~/.codex/skills/my-plugin/SKILL.md
---
name: Brand Guidelines
description: 将 Acme 公司品牌指南应用于所有演示文稿和文档，包括官方颜色、字体和徽标使用
version: 1.0.0
---


## 概述
这个 Skill 提供 Acme 公司的官方品牌指南...


## 官方颜色
- 主色：#1F2937
- 辅助色：#3B82F6


## 字体
- 标题：Helvetica Bold
- 正文：Arial Regular
使用该skill之前的网页效果如下，prompt：生成网页 index.html
使用该skill之后的网页效果如下，prompt：对index.html使用Brand Guidelines
参考资料

[1]https://github.com/openai/codex/blob/main/docs/skills.md

[2]https://x.com/elias_judin/status/1999491647563006171

[3]https://github.com/eliasjudin/oai-skills/tree/main/pdfs

[4]https://github.com/datasette/skill

---
*导入时间: 2026-01-17 20:31:35*
