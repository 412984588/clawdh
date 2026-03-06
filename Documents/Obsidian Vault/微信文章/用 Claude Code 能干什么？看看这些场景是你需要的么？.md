---
title: "用 Claude Code 能干什么？看看这些场景是你需要的么？"
source: wechat
url: https://mp.weixin.qq.com/s?__biz=MzYzNjA1NzMwNQ==&mid=2247484882&idx=1&sn=3ebc9e215c0257a704bd269bd9d6dace&chksm=f108dc119889048072d1376ca252fd4782ce01c45161b259e40613d290773bcfb4c713260e8c&mpshare=1&scene=1&srcid=12057JVUbtLZRZQ95zme7Uxy&sharer_shareinfo=b3660a4c8eb427a90e32e60f92624911&sharer_shareinfo_first=b3660a4c8eb427a90e32e60f92624911
author: 左手用AI
pub_date: 2025年11月28日 09:17
created: 2026-01-17 20:44
tags: [AI, 编程]
---

# 用 Claude Code 能干什么？看看这些场景是你需要的么？

> 作者: 左手用AI | 发布日期: 2025年11月28日 09:17
> 原文链接: [点击查看](https://mp.weixin.qq.com/s?__biz=MzYzNjA1NzMwNQ==&mid=2247484882&idx=1&sn=3ebc9e215c0257a704bd269bd9d6dace&chksm=f108dc119889048072d1376ca252fd4782ce01c45161b259e40613d290773bcfb4c713260e8c&mpshare=1&scene=1&srcid=12057JVUbtLZRZQ95zme7Uxy&sharer_shareinfo=b3660a4c8eb427a90e32e60f92624911&sharer_shareinfo_first=b3660a4c8eb427a90e32e60f92624911)

---

上一篇文章介绍了安装Claude skills

说实话，很多人就用cc来写代码、改 bug。这当然没问题。但 Claude Code 能干的远不止这些。

最近发现两个技能库，一个官方的，一个社区的。加起来 26 个技能，覆盖了文档处理、开发测试、创意设计、业务分析等场景。

今天按场景分类，帮你快速找到需要的技能。

1  两个库，一句话介绍

anthropic/skills（官方）

3 个插件技能
专注文档处理：docx、pdf、pptx
质量稳定，开箱即用

ComposioHQ/awesome-claude-skills（社区）

23 个技能
覆盖开发、创意、业务、安全等场景
更新快，玩法多

接下来按场景说。

2  场景一：文档处理

这是最常用的场景。官方的 3 个技能全在这。

2.1  docx - Word 文档

能干啥：

创建新文档，支持格式、样式
编辑已有文档，保留原有格式
追踪修改、添加批注
提取文档内容分析

举个例子：你有一份合同模板，想批量生成 100 份带不同甲方名称的合同。以前得手动改。现在让 Claude 处理就行。

2.2  pdf - PDF 处理

能干啥：

提取文本、表格、元数据
合并多个 PDF
添加标注
填写 PDF 表单

很多报告、发票都是 PDF 格式。这个技能能帮你批量提取信息，省得一个个复制粘贴。

2.3  pptx - 幻灯片

能干啥：

创建演示文稿
读取和修改已有 PPT
调整布局、应用模板
添加备注

写完方案让 Claude 直接生成 PPT，比自己排版快多了。

2.4  xlsx - 电子表格

官方和社区库都有这个技能。能干啥：

操作 Excel：读写、公式、格式
数据分析和转换
生成图表
批量处理多个文件

处理数据报表、财务表格，这个技能很实用。比如把 10 个月度销售表格汇总成年度报告。以前得手动复制粘贴，现在一句话搞定。

3  场景二：写代码

开发者最关心的场景。社区库有一堆开发相关的技能。

3.1  software-architecture - 软件架构

设计模式、SOLID 原则、Clean Architecture——这些东西自己想可能想不全，让 Claude 帮你规划。

适合场景：

新项目架构设计
重构老代码
代码审查
3.2  test-driven-development - 测试驱动开发

TDD 的最佳实践。先写测试，再写实现。这个技能会引导你按 TDD 流程走。

3.3  webapp-testing - Web 应用测试

用 Playwright 做自动化测试。能干啥：

验证前端功能
调试 UI 行为
自动截图

以前写 E2E 测试很麻烦。现在告诉 Claude 要测什么，它帮你写测试代码、跑测试、截图报告。

3.4  mcp-builder - MCP 服务器开发

想给 Claude 扩展新能力？MCP（Model Context Protocol）是官方推的扩展协议。这个技能教你怎么写 MCP 服务器。

3.5  subagent-driven-development - 多代理开发

把任务拆分给多个子代理，并行处理。适合大型项目，一个人干多个人的活。

3.6  aws-skills - AWS 开发

AWS CDK 最佳实践、无服务器架构、成本优化。如果你用 AWS，这个技能能帮你少踩坑。

3.7  using-git-worktrees - Git 工作树

创建隔离的 git 工作树。适合同时处理多个分支、多个功能。

3.8  changelog-generator - 更新日志生成

从 git 提交记录自动生成 changelog。不用再手写"本次更新内容"了。

4  场景三：搞创意

不只是写代码，Claude Code 还能帮你做创意类工作。

4.1  D3.js Visualization - 数据可视化

生成 D3 图表，做交互式数据可视化。数据报告、Dashboard，用得上。

4.2  slack-gif-creator - Slack 动图

创建适合 Slack 大小的 GIF 动图。团队沟通发个动图，比纯文字有意思。

4.3  theme-factory - 主题工厂

10 套预设主题 + 自定义主题生成。给你的项目、文档快速换皮肤。

4.4  canvas-design - 画布设计

用设计原理创建视觉作品，输出 PNG 和 PDF。简单的海报、图表，不用开 PS 了。

4.5  youtube-transcript - YouTube 字幕

提取 YouTube 视频字幕，生成摘要。学习外文教程、做视频笔记，很方便。

4.6  video-downloader - 视频下载

从 YouTube 等平台下载视频。配合字幕提取，做视频资料整理。

5  场景四：做业务

不是开发者也能用。这些技能偏业务场景。

5.1  meeting-insights-analyzer - 会议分析

把会议记录变成待办清单和行动项。谁说了什么、该谁跟进、下一步做什么，都给你整理出来。

开完会不用再整理会议纪要了，丢给 Claude 处理。

5.2  content-research-writer - 内容写作

写文章辅助。先帮你调研，再帮你写。适合写报告、写方案。

5.3  internal-comms - 内部通讯

写内部邮件、状态报告、公司通告、FAQ。

以前写周报写半天，现在几分钟搞定。

5.4  csv-data-summarizer - CSV 数据分析

自动分析 CSV：列分布、缺失数据、相关性。数据分析的第一步，快速了解数据概况。

5.5  skill-creator - 技能创建器

想自己做一个技能？这个技能教你怎么写 Claude Skill。

5.6  skill-seekers - 文档转技能

把任何文档网站自动转成 Claude 技能。几分钟搞定。

6  场景五：安全取证（小众但硬核）

这几个技能比较专业，安全从业者、运维人员可能用得上。

6.1  computer-forensics - 数字取证

数字取证分析技术。帮你分析磁盘镜像、日志文件、系统痕迹。

6.2  metadata-extraction - 元数据提取

提取文件元数据：创建时间、修改时间、作者、GPS 位置等。取证分析、信息收集都能用。

6.3  threat-hunting-with-sigma-rules - 威胁猎捕

用 Sigma 规则做威胁猎捕。Sigma 是一种通用的日志检测规则格式，安全运维、蓝队防守会用到。

这几个技能门槛高一点，但真用得上的时候，能省很多事。

7  怎么安装？
7.1  官方技能（anthropic/skills）

这 3 个文档技能已经内置在 Claude Code 里，直接用就行。

在 Claude Code 里输入 /skills，能看到已安装的技能。

7.2  社区技能（awesome-claude-skills）

去 GitHub 下载后手动安装：

克隆仓库或下载单个技能文件夹
放到 ~/.claude/skills/ 目录（Mac/Linux）或对应的 Windows 路径
重启 Claude Code

也可以在 Claude Code 设置里添加技能源，具体操作看仓库 README。

仓库地址：

官方：https://github.com/anthropics/skills
社区：https://github.com/ComposioHQ/awesome-claude-skills
8  最后

26 个技能，5 个场景。

我个人最推荐的几个：

docx/pdf/xlsx - 文档处理是刚需，用得最多
webapp-testing - 写前端的话，这个能省很多测试时间
meeting-insights-analyzer - 开会多的人试试，整理会议纪要真的烦

不用全装。按需选择，用到再装。

仓库地址收藏一下，需要的时候去翻：

官方：https://github.com/anthropics/skills
社区：https://github.com/ComposioHQ/awesome-claude-skills

有问题评论区聊。

✨ 喜欢这篇内容？欢迎点赞👍，收藏，转发，您的支持是我前进的动力哈哈哈。关注我，获取更多干货！

---
*导入时间: 2026-01-17 20:44:31*
