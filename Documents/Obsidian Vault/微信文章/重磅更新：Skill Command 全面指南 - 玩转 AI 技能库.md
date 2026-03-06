---
title: "重磅更新：Skill Command 全面指南 - 玩转 AI 技能库"
source: wechat
url: https://mp.weixin.qq.com/s/sbOhARtNCQO28GhSUaEOqw
author: JZ AI与云计算
pub_date: 2025年11月26日 20:43
created: 2026-01-17 20:41
tags: [AI, 编程, 产品]
---

# 重磅更新：Skill Command 全面指南 - 玩转 AI 技能库

> 作者: JZ AI与云计算 | 发布日期: 2025年11月26日 20:43
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/sbOhARtNCQO28GhSUaEOqw)

---

大家好！今天我们要深入介绍 Code Assistant Manager (CAM) 的 Skill Command (技能指令)。此前我们简单提到了它的安装功能，但其实它内置了多达 15 个子命令，涵盖了从用户使用、开发者创建到配置管理的方方面面。

无论你是想快速增强 AI 能力的普通用户，还是热衷于编写 Prompt 的开发者，这篇指南都将带你彻底掌握 cam skill 的所有用法。

📚 目录
基础篇：技能的发现与管理
进阶篇：仓库管理
开发者篇：创建与维护技能
管理篇：数据备份与批量操作
🌟 基础篇：技能的发现与管理

这是日常最常用的工作流，助你快速获取社区资源。

1. 🔄 获取最新技能 (Fetch)

同步云端仓库信息,发现新技能。

cam skill fetch

效果：从所有配置的 GitHub 仓库下载最新的技能列表。

2. 📋 列出可用技能 (List)

查看当前数据库中所有已知的技能。

# 列出所有技能
cam skill list

# 查看特定应用（如 gemini）的安装状态
cam skill list -a gemini

提示：✅ 代表已安装，❌ 代表未安装。

3. 🔍 查看技能详情 (View)

在安装前，了解技能的具体功能、作者和来源。

cam skill view ComposioHQ/awesome-claude-skills:python-expert
4. 📥 安装技能 (Install)

将技能部署到你的 AI 助手目录。

# 默认安装到 Claude
cam skill install ComposioHQ/awesome-claude-skills:python-expert

# 指定安装给 Gemini
cam skill install ComposioHQ/awesome-claude-skills:python-expert -a gemini

# 一次性安装给所有助手 (Claude, Codex, Gemini)
cam skill install ComposioHQ/awesome-claude-skills:python-expert -a all
5. 📂 查看已安装技能 (Installed)

检查本地实际部署了哪些技能文件。

# 查看所有助手的已安装技能
cam skill installed

# 只查看 Claude 的
cam skill installed -a claude
6. 🗑️ 卸载技能 (Uninstall)

移除特定的技能文件。

cam skill uninstall ComposioHQ/awesome-claude-skills:python-expert -a claude
🛠️ 进阶篇：仓库管理

除了官方源，你还可以订阅社区或个人的技能仓库。

7. 📦 查看仓库列表 (Repos)

查看当前配置了哪些技能源。

cam skill repos
8. ➕ 添加仓库 (Add-Repo)

订阅新的 GitHub 仓库。仓库中需要包含符合 CAM 规范的技能目录。

# 格式：cam skill add-repo -o <Owner> -n <RepoName>
cam skill add-repo --owner my-github-user --name my-ai-skills --branch main

参数说明：

--owner / -o
: GitHub 用户名或组织名
--name / -n
: 仓库名称
--branch / -b
: 分支名 (默认 main)
--skills-path
: (可选) 如果技能不在根目录，指定子目录路径
9. ➖ 移除仓库 (Remove-Repo)

取消订阅某个仓库。

cam skill remove-repo -o my-github-user -n my-ai-skills
💻 开发者篇：创建与维护技能

如果你在本地开发了技能，或者想手动注册一个非 Git 源的技能，可以使用以下命令。

10. 🆕 注册新技能 (Create)

在本地数据库中注册一个新的技能条目（主要用于元数据管理）。

cam skill create my-local-skill \
  --name "My Custom Tool" \
  --description "A specialized tool for data analysis" \
  --directory "custom-tool-v1"

注意：这会在 CAM 的数据库中创建记录，方便你管理本地开发的技能。

11. 📝 更新技能信息 (Update)

修改已注册技能的元数据。

cam skill update my-local-skill --name "My Custom Tool V2"
12. ❌ 删除技能记录 (Delete)

从数据库中移除技能记录（不会删除物理文件，仅删除管理记录）。

cam skill delete my-local-skill
🛡️ 管理篇：数据备份与批量操作
13. 📤 导出配置 (Export)

将你当前的技能数据库导出为 JSON 文件，方便分享给同事或迁移环境。

cam skill export -f my_skills_backup.json
14. 📥 导入配置 (Import)

从 JSON 文件恢复技能数据库。

cam skill import -f my_skills_backup.json
15. 🧹 批量卸载 (Uninstall-All)

慎用！ 一键清空指定助手的技能目录。适合重置环境。

# 清空 Gemini 的所有技能
cam skill uninstall-all -a gemini
💡 总结

cam skill 不仅仅是一个下载器，它是一个完整的技能生命周期管理工具。

普通用户
：关注 fetch, list, install。
极客玩家
：尝试 add-repo 扩展更多源。
团队管理者
：利用 export/import 统一团队配置。

现在就打开终端，输入 cam skill --help 开始探索吧！让你的 AI 助手进化得更强大！

🌟 开源支持

本项目已在 GitHub 开源，欢迎大家 Star ⭐️ 支持我们！

🔗 项目地址：https://github.com/Chat2AnyLLM/code-assistant-manager

如果你有任何问题或建议，欢迎在 Issues 中提出！

---
*导入时间: 2026-01-17 20:41:24*
