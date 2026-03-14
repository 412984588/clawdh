---
title: "OpenSkills让所有AI 代码工具用上Anthropic同款技能库"
source: wechat
url: https://mp.weixin.qq.com/s/Xif7AfcTzptiyUEciLxo_Q
author: CourseAI
pub_date: 2025年12月18日 05:14
created: 2026-01-17 20:27
tags: [AI, 编程, 产品]
---

# OpenSkills让所有AI 代码工具用上Anthropic同款技能库

> 作者: CourseAI | 发布日期: 2025年12月18日 05:14
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/Xif7AfcTzptiyUEciLxo_Q)

---

本公众号主要关注NLP、CV、LLM、RAG、Agent等AI前沿技术，免费分享业界实战案例与课程，助力您全面拥抱AIGC







用Claude Code写代码时，总羡慕它能调用各种现成技能？但其他AI助手（Cursor、Windsurf、Aider）却没法用这些能力？

想安装自定义技能，却被各种复杂配置劝退？

今天给大家推荐一个神器——OpenSkills，让所有AI代码助手都能用上Anthropic的技能系统！

什么是OpenSkills？

简单说，它是一个CLI工具，能让任何AI代码助手都拥有和Claude Code一模一样的技能系统。

可以：

从GitHub安装任何技能（不止Anthropic官方市场）
本地开发、私有仓库的技能也能轻松使用
跨多个AI助手共享技能
用版本控制管理你的技能
它能解决什么痛点？
对Claude Code用户：
打破市场限制，安装任何GitHub仓库的技能
支持本地路径和私有仓库安装
跨多个代理共享技能
用Git管理技能版本
本地开发技能时可实时调试
对其他AI助手用户（Cursor、Windsurf、Aider）：
直接获得Claude Code的全套技能系统
通过GitHub获取Anthropic官方市场的所有技能
实现按需加载（只在需要时加载技能，不占用上下文）
和Claude Code有什么不同？

几乎没有不同！除了调用方式：

Claude Code用Skill("pdf")工具
OpenSkills用openskills read pdf命令

其他方面完全一致：

相同的<available_skills>XML格式
相同的技能市场（anthropics/skills）
相同的文件夹结构（默认.claude/skills/）
相同的SKILL.md格式（YAML头+markdown说明）
相同的按需加载机制
支持哪些技能？

Anthropic官方技能库有这些实用技能：

xlsx：电子表格创建、编辑、公式计算
docx：带修订和批注的文档创建
pdf：PDF处理（提取、合并、拆分、表单）
pptx：演示文稿创建和编辑
canvas-design：创建海报和视觉设计
还有更多...
高级玩法：自己创建技能

你也可以创建自己的技能，最少只需要一个文件：

my-skill/
└── SKILL.md
    ---
    name: my-skill
    description: 我的自定义技能
    ---

    # 用命令式语气写的说明
    当用户需要做X时，执行Y步骤...


复杂点的技能还可以包含：

references/：存放支持文档
scripts/：辅助脚本
assets/：模板和配置文件

创建好后推到GitHub，别人就能用openskills install 你的用户名/你的技能库安装了！

分享几个实战案例

看看OpenSkills 作为一款能让所有 AI 代码助手用上 Claude 技能系统的工具，是如何提升效率的

1. 用 Cursor 批量处理 PDF 文档，告别复制粘贴

需要从 20 份 PDF 合同中提取关键信息（甲方名称、金额、日期），用 Cursor 手动复制效率极低。

通过 OpenSkills 安装 pdf 技能，让 Cursor 自动调用工具完成提取：

# 安装 PDF 处理技能
openskills install anthropics/skills
# 同步到 AGENTS.md
openskills sync



在 Cursor 中输入指令后，AI 会自动执行 openskills read pdf，加载 PDF 处理逻辑，生成 Python 脚本批量提取数据，原本 2 小时的工作缩短到 10 分钟。

2. 跨工具共享「Excel 数据分析」技能

同时使用 Claude Code 和 Windsurf 处理数据，希望两者都能调用同一个「Excel 公式自动生成」技能。

用 OpenSkills 的「通用模式」实现技能共享：

# 安装到通用目录（所有工具可访问）
openskills install anthropics/skills/xlsx --universal


无论是在 Claude Code 写报表，还是用 Windsurf 做数据可视化，都能直接调用同一个 xlsx 技能，避免重复配置，技能更新一次全工具生效。

3. 开发团队私有「API 文档生成」技能

团队内部有统一的 API 文档规范，希望 AI 助手能按此格式自动生成文档，但公开技能库不满足需求。

团队自建私有技能并通过 Git 管理：

# 1. 团队仓库创建技能（结构如下）
my-api-skill/
└── SKILL.md  # 包含团队 API 文档规范和生成逻辑

# 2. 团队成员安装私有技能
openskills install git@github.com:团队账号/私有技能仓库.git



AI 助手生成的 API 文档直接符合团队规范，新成员无需学习格式，文档一致性提升 90%。

4. 用本地开发的「PPT 模板生成」技能实时调试

自定义了一个生成产品演示 PPT 的技能，需要反复调整模板和逻辑，每次修改后重新安装太麻烦。

解决方案：
用符号链接实时调试：

# 克隆技能仓库到本地开发目录
git clone 你的技能仓库 ~/dev/ppt-skill

# 创建符号链接到技能目录
ln -s ~/dev/ppt-skill .claude/skills/ppt-skill


修改 ~/dev/ppt-skill 中的内容后，无需重新安装，运行 openskills sync 即可实时生效，调试效率提升 3 倍。

5. 合并多个技能实现「报告自动化流水线」

从 Excel 取数 → 生成 PDF 报告 → 用 PPT 可视化，希望 AI 能一键完成全流程。

组合 xlsx、pdf、pptx 三个技能：

# 一次性安装多个技能
openskills install anthropics/skills -y  # -y 跳过交互，全量安装


AI 助手会按顺序调用三个技能：先用 xlsx 提取数据，再用 pdf 生成报告正文，最后用 pptx 生成可视化幻灯片，原本需要手动协调三个工具的工作，现在全程自动化。

https://github.com/numman-ali/openskills

---
*导入时间: 2026-01-17 20:27:48*
