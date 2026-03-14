---
title: "Claudian：将 Claude Code 嵌入为 Obsidian 侧边栏聊天界面的插件"
source: wechat
url: https://mp.weixin.qq.com/s/AZB-fgkG_WYr4Mr0LRTtlg
author: AI灵感闪现
pub_date: 2026年1月4日 20:15
created: 2026-01-17 20:17
tags: [AI, 编程]
---

# Claudian：将 Claude Code 嵌入为 Obsidian 侧边栏聊天界面的插件

> 作者: AI灵感闪现 | 发布日期: 2026年1月4日 20:15
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/AZB-fgkG_WYr4Mr0LRTtlg)

---

发现 Claudian——一个 Obsidian 插件，将 Claude Code 的完整智能体能力直接带入你的笔记工作空间，支持侧边栏聊天、文件上下文和 MCP 协议

TL;DR： YishenTu[1] 开发的 Claudian 将 Claude Code 嵌入为 Obsidian 的侧边栏聊天界面，让你的知识库具备完整的智能体能力——文件读写、bash 命令、视觉支持、MCP 服务器以及多步骤工作流——同时与你的笔记无缝集成。

简介

如果你像我一样，Obsidian 知识库不仅仅是笔记应用——它是你的第二大脑、项目中心、知识库。现在想象一下，在这个工作空间中直接拥有 Claude Code 的完整 AI 智能体能力。

这正是 Claudian 所提供的。它是一个 Obsidian 插件，将 Claude Code 嵌入为侧边栏聊天界面，让你的知识库成为 Claude 的工作目录，具备完整的智能体能力。

为什么这很重要： 与传统的聊天机器人或简单的 AI 助手不同，Claudian 赋予了 Claude 实际的自主性——它可以读取、写入和编辑你知识库中的文件，执行 bash 命令，使用工具，运行多步骤工作流，甚至通过 MCP 连接到外部服务。同时，它始终对你的笔记保持上下文感知。




我是 AI 灵感闪现，正在实践和分享让 AI 自主解决工作、生活和健康等方面的问题。我尽可能让 AI 自己完成从目标到交付以及演进的闭环，以最少的人为交互与监督，让 AI 自己跑流程。我只给 AI 想法或目标，全程不陪跑，让 AI 自主运行类似 Tesla FSD 自动驾驶。










Claudian 是什么？

Claudian 是一个基于 Claude Agent SDK[2] 构建的 Obsidian 插件，将 Claude Code 的能力直接带入你的 Obsidian 工作空间。可以把它理解为：

侧边栏聊天： 点击机器人图标或使用命令面板在侧边栏打开 Claude
完整的智能体能力： Claude 可以在你的知识库中读取/写入文件、运行 bash 命令、执行多步骤工作流
上下文感知： 自动附加当前关注的笔记，支持 @提及文件，包含选中的文本
视觉支持： 通过拖放、粘贴或文件路径分析图像
可扩展： 支持斜杠命令、自定义指令、技能和 MCP 服务器

核心洞察： 这不仅仅是聊天界面——这是在你的 Obsidian 中运行的 Claude Code，你的知识库就是它的工作目录。

核心功能
1. 完整的智能体能力

在 Obsidian 知识库中充分利用 Claude Code 的强大功能：

能力
	
描述

文件操作	
读取、写入和编辑知识库中的文件

Bash 命令	
执行 shell 命令，具有审批安全机制

多步骤工作流	
Claude 可以规划并执行复杂任务

工具使用	
完整访问 Claude 的工具生态系统
2. 上下文感知聊天

Claudian 使 Claude 能够感知你的工作上下文：

自动附加当前笔记： 你正在查看的笔记会自动作为上下文包含
@提及文件： 输入 @ 附加知识库中的其他文件
选择感知： 选中的文本会自动包含在对话中
图像支持： 拖放、粘贴或通过路径引用图像
外部目录： 配置上下文路径以获取知识库外的只读访问
按标签排除： 防止敏感笔记自动加载
3. 内联编辑模式

在编辑器中选择文本并使用热键直接用 Claude 编辑：

词级差异预览精确显示更改内容
只读工具访问提供上下文而不进行修改
单击应用更改
4. 斜杠命令

创建由 /command 触发的可重用提示模板：

参数占位符（例如 {topic}）
用于上下文的 @file 引用
可选的内联 bash 替换
每个命令覆盖模型和允许的工具
5. 指令模式（#）

直接从聊天输入添加自定义指令：

输入 # 进入指令模式
即时优化系统提示
在模态框中查看和编辑
6. MCP 支持

通过模型上下文协议连接外部工具和数据源：

传输类型： stdio、SSE、HTTP
上下文保存模式： 使用 @server-name 启用
@提及激活： 内联触发 MCP 服务器
Claude Code 兼容： 与 Claude Code 共享配置
7. 高级模型控制
模型选择： Haiku、Sonnet 或 Opus
自定义模型： 通过环境变量配置
思考预算： 微调扩展思考令牌
上下文仪表： 实时上下文窗口使用显示
8. 计划模式

在实现之前切换到只读探索模式：

按 Shift+Tab 进入计划模式
Claude 在不更改的情况下探索代码库
呈现计划供你审批
确认后实施
9. 强大的安全性
权限模式： YOLO（绕过提示）或安全（需要审批）
安全黑名单： 阻止危险的 bash 命令
知识库限制： 文件工具限制在知识库内，具有符号链接安全检查
导出路径例外： 允许写入指定目录（例如 ~/Desktop）
安装
选项 1：从发布版本安装（推荐）
从 GitHub Releases[3] 下载最新版本
在你的知识库插件文件夹中创建一个名为 claudian 的文件夹：
/path/to/vault/.obsidian/plugins/claudian/

将 main.js、manifest.json 和 styles.css 复制到文件夹中
在 Obsidian 中启用：设置 → 社区插件 → 启用"Claudian"
选项 2：从源代码安装
cd /path/to/vault/.obsidian/plugins
git clone https://github.com/YishenTu/claudian.git
cd claudian
npm install
npm run build


然后在 Obsidian 设置中启用插件。

系统要求
要求
	
详细说明

Claude Code CLI	
必须安装（SDK 在内部使用）

Obsidian	
版本 1.8.9 或更高

Claude 访问权限	
Claude 订阅/API 或自定义提供商（OpenRouter、Kimi、GLM、DeepSeek 等）

平台	
仅桌面版（macOS、Linux、Windows）
使用方法
打开聊天

有两种方式开始聊天：

点击功能区中的机器人图标
使用命令面板（Cmd/Ctrl + P）并搜索"Claudian"
使用上下文
操作
	
方法


附加当前笔记
	
聊天打开时自动包含


附加其他文件
	
输入 @ 后跟文件名


按文件夹过滤
	
输入 @folder/ 查看该目录中的文件


启用 MCP 服务器
	
输入 @server-name 用于上下文保存 MCP


包含选择内容
	
打开聊天前选择文本


添加图像
	
拖放、粘贴或输入文件路径
内联编辑
在编辑器中选择文本
使用配置的热键
Claude 编辑并显示差异预览
应用或放弃更改
斜杠命令

在聊天输入中输入 / 查看可用命令。在设置 → 斜杠命令中创建新命令。

指令模式

输入 # 添加自定义指令，修改当前会话的系统提示。

配置
主要设置
设置
	
描述

命令黑名单	
阻止危险的 bash 命令（默认：rm -rf、chmod 777 等）

允许的导出路径	
知识库外的文件导出路径（默认：~/Desktop、~/Downloads）

上下文路径	
用于只读访问的外部目录

排除标签	
防止笔记自动加载的标签

媒体文件夹	
知识库存储附件以进行图像嵌入的位置

自定义系统提示	
附加到默认提示的其他指令

权限模式	
YOLO（无提示）或安全（需要审批）

环境变量	
Claude SDK 的自定义环境变量（KEY=VALUE 格式）

MCP 服务器	
添加/编辑/测试/删除 MCP 服务器配置
存储

数据以分布式格式存储（类似 Claude Code）：

vault/.claude/
├── settings.json          # 用户设置和权限
├── mcp.json                # MCP 服务器配置
├── commands/*.md           # 斜杠命令作为 Markdown
└── sessions/*.jsonl        # 聊天会话（每个对话一个）

.obsidian/plugins/claudian/
├── data.json               # 机器状态（活动对话）
└── .claudian-cache/
    └── images/             # 图像缓存（SHA-256 去重）

架构
src/
├── main.ts                      # 插件入口点
├── core/                        # 核心基础设施
│   ├── agent/                   # Claude Agent SDK 包装器
│   ├── hooks/                   # PreToolUse/PostToolUse 钩子
│   ├── images/                  # 图像缓存和加载
│   ├── mcp/                     # MCP 服务器配置管理
│   ├── prompts/                 # 智能体的系统提示
│   ├── sdk/                     # SDK 消息转换
│   ├── security/                # 审批、黑名单、路径验证
│   ├── storage/                 # 分布式存储系统
│   ├── tools/                   # 工具常量和实用程序
│   └── types/                   # 类型定义
├── features/                    # 功能模块
│   ├── chat/                    # 主聊天视图
│   ├── inline-edit/             # 内联编辑服务
│   ├── mcp/                     # MCP @提及检测
│   └── settings/                # 设置选项卡
├── ui/                          # UI 组件
│   ├── components/              # 输入工具栏、下拉菜单
│   ├── modals/                  # 审批、内联编辑、指令模态框
│   ├── renderers/               # 思考块、工具调用、差异
│   └── settings/                # 环境片段、MCP 设置、斜杠命令
├── utils/                       # 实用工具函数
└── style/                       # 模块化 CSS（→ styles.css）

安全考虑

Claudian 实现了多层安全保护：

知识库限制： 文件工具和 Bash 命令限制在知识库目录内
路径验证： 使用 realpath 防止符号链接逃逸
命令黑名单： 平台特定的危险命令模式
审批系统： 安全模式需要每次工具调用审批
导出路径： 对外部路径的写入操作是显式且可配置的
上下文路径： 对外部目录的只读访问
无遥测： 除了配置的 API 提供商外，没有额外的跟踪
路线图

该插件正在积极开发中，拥有广泛的路线图：

 会话内持久化
 跨重启的聊天历史持久化
 带有历史下拉菜单的对话切换
 文件上下文感知
 扩展思考显示
 模型选择
 权限模式（YOLO/安全）
 图像支持
 内联编辑功能
 斜杠命令
 指令模式
 技能支持
 上下文路径
 分布式存储
 Windows 支持
 MCP 服务器支持
 计划模式
 自动标题生成
 钩子和其他高级功能
与替代方案比较
功能
	
Claudian
	
Copilot
	
ChatGPT Web


知识库内文件读写
	
✅
	
❌
	
❌


Bash 命令执行
	
✅
	
❌
	
❌


多步骤工作流
	
✅
	
❌
	
有限


上下文感知
	
✅（自动）
	
✅（代码）
	
❌


视觉支持
	
✅
	
✅
	
✅


可扩展（MCP/技能）
	
✅
	
❌
	
❌


自定义模型支持
	
✅
	
❌
	
❌


离线工作
	
✅
	
部分
	
❌
快速上手
安装 Claude Code CLI（如果尚未安装）
使用上述方法之一安装 Claudian
在 Claudian 设置中配置 API 密钥
打开聊天并尝试："分析我当前的笔记并建议改进"
使用 Shift+Tab 探索计划模式进行只读探索
结论

Claudian 代表了 AI 辅助知识工作的重要进步。通过将 Claude Code 的完整智能体能力带入 Obsidian，它将你的知识库从静态笔记存储转变为交互式工作空间，Claude 可以在其中读取、写入、分析和协作——同时对你工作保持深度上下文感知。

无论你是在编写文档、管理项目还是构建知识库，Claudian 都提供了一种与 AI 合作的强大新方式，感觉自然、集成且真正有用。

仓库地址： github.com/YishenTu/claudian[4]

许可证： MIT

相关资源
Claude Code 文档[5]
Claude Agent SDK[6]
Obsidian 插件文档[7]
引用链接

[1]
YishenTu: https://github.com/YishenTu

[2]
Claude Agent SDK: https://platform.claude.com/docs/en/agent-sdk/overview

[3]
GitHub Releases: https://github.com/YishenTu/claudian/releases/latest

[4]
github.com/YishenTu/claudian: https://github.com/YishenTu/claudian

[5]
Claude Code 文档: https://code.claude.com/docs/en/overview

[6]
Claude Agent SDK: https://platform.claude.com/docs/en/agent-sdk/overview

[7]
Obsidian 插件文档: https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin

---
*导入时间: 2026-01-17 20:17:30*
