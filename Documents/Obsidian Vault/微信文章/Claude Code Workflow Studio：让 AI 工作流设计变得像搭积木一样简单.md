---
title: "Claude Code Workflow Studio：让 AI 工作流设计变得像搭积木一样简单"
source: wechat
url: https://mp.weixin.qq.com/s/vf2aVW2ljoa-9CN00fW4rg
author: 链熵工坊
pub_date: 2025年12月29日 21:26
created: 2026-01-17 20:20
tags: [AI, 编程, 产品]
---

# Claude Code Workflow Studio：让 AI 工作流设计变得像搭积木一样简单

> 作者: 链熵工坊 | 发布日期: 2025年12月29日 21:26
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/vf2aVW2ljoa-9CN00fW4rg)

---

Claude Code Workflow Studio：让 AI 工作流设计变得像搭积木一样简单
前言

还记得第一次接触 Claude Code 时的兴奋吗？这个强大的 AI 编程助手让我们体验到了前所未有的开发效率。但随着使用深入，你可能会发现一个问题：如何让多个 AI Agent 协同工作，执行复杂的多步骤任务？

传统的做法是手写 .claude/agents/ 和 .claude/commands/ 配置文件，但这需要熟悉 Markdown frontmatter 语法、理解 Agent 配置规范，对于非程序员或刚接触 Claude Code 的用户来说，门槛不低。

今天要介绍的这个开源项目 Claude Code Workflow Studio，彻底改变了这一局面 —— 它让你用拖拽的方式设计复杂的 AI 工作流，然后一键导出为 Claude Code 可直接执行的格式。

项目概览
项目信息
	
详情


项目地址
	
https://github.com/breaking-brake/cc-wf-studio


Stars
	
890+


类型
	
VSCode 扩展


许可证
	
AGPL-3.0


语言支持
	
简体中文、繁体中文、英文、日文、韩文
为什么选择 Claude Code Workflow Studio？

官方给出了四个核心理由：

1. 零代码工作流设计
不需要任何编程经验。通过可视化方式连接 Sub-Agent 和用户决策节点，就能构建复杂的自动化流程。

2. 开箱即用
设计好的工作流会自动导出到 .claude/agents/ 和 .claude/commands/ 目录，可以立即在 Claude Code 中使用。

3. 快速迭代
工作流以 JSON 格式保存和加载，方便你反复实验和优化。

4. 完全本地 & 安全
所有操作都在 VSCode 本地执行。注意：MCP 工具节点可能需要网络连接（取决于具体的 MCP 服务器配置），但非 MCP 功能完全离线运行。

核心功能
1. 可视化工作流编辑器

直观的拖拽画布，无需编写代码即可设计 AI 工作流。

2. AI 辅助工作流优化

通过对话式 AI 迭代改进工作流 —— 用自然语言描述修改需求、添加功能或调整逻辑。

3. 一键导出

生成 .claude/agents/*.md 和 .claude/commands/*.md 文件，可直接用于 Claude Code。

4. Slack 工作流分享（Beta）

直接将工作流分享到 Slack 频道，带预览卡片和一键导入链接，实现无缝团队协作。

5. 丰富的节点类型

支持多种节点类型构建复杂工作流：

节点类型
	
说明

Prompt	
可复用的提示词模板，支持 {{variableName}} 变量语法

Sub-Agent	
自主 AI 代理，可配置系统提示词、工具权限、模型选择

Skill	
调用 Claude Code Skills（个人/项目级别）

MCP	
集成 Model Context Protocol 外部工具

IfElse	
二元分支（True/False、成功/失败）

Switch	
多路分支（2-N 个条件路径）

AskUserQuestion	
用户决策点（2-4 个选项）
快速上手
前置条件

使用 AI 辅助功能需要先安装 Claude Code CLI：

# 验证安装
claude --version

如未安装，请访问 https://claude.com/claude-code 获取安装指南。

安装扩展

方式一：VSCode 扩展商店（推荐）

1. 打开 VSCode，按 Ctrl+Shift+X（Mac 用户按 Cmd+Shift+X）
2. 搜索 "Claude Code Workflow Studio"
3. 点击安装

方式二：从源码构建

git clone https://github.com/breaking-brake/cc-wf-studio.git
cd cc-wf-studio
npm install
cd src/webview && npm install && cd ../..
npm run build
npx vsce package

然后在 VSCode 中通过 "Install from VSIX..." 安装生成的 .vsix 文件。

打开编辑器
1. 按 Ctrl+Shift+P（Mac 用户按 Cmd+Shift+P）
2. 输入 "Claude Code Workflow Studio: Open Editor"
3. 回车
交互式引导

首次打开时会自动启动交互式引导教程，支持 5 种语言（英文、日文、韩文、简体中文、繁体中文），手把手教你创建第一个工作流。随时点击工具栏的 ? 按钮可以重新开始引导。

创建工作流

左侧面板按功能分类组织节点：

• 基础节点：Prompt（模板）、Sub-Agent（AI 任务）
• 控制流：IfElse（二元分支）、Switch（多路分支）、AskUserQuestion（用户决策）
• 集成：Skill（Claude Code Skills）、MCP（Model Context Protocol 工具）

操作步骤：

1. 从左侧拖拽节点到画布
2. 点击节点在右侧配置属性
3. 从输出端口（右侧）拖线到输入端口（左侧）建立连接
4. 在工具栏输入工作流名称
5. 点击 Save 保存为 JSON（存储在 .vscode/workflows/）
6. 点击 Export 生成 .claude 文件
使用示例
示例 1：数据分析流水线
1. Collect Data (Sub-Agent) → 从文件收集数据
2. AskUserQuestion → "选择分析类型" → 统计分析 / 可视化
3. Statistical Analysis (Sub-Agent) 或 Data Visualization (Sub-Agent)
4. Generate Report (Sub-Agent) → 生成最终输出
示例 2：代码审查工作流
1. Code Scanner (Sub-Agent) → 识别代码问题
2. AskUserQuestion → "优先级？" → 仅关键问题 / 所有问题
3. Filter Results (Sub-Agent) → 过滤结果
4. Generate Fix Suggestions (Sub-Agent) → 生成修复建议
示例 3：文档处理（结合 Skills）
1. Upload Document (Prompt) → 询问用户文件路径
2. PDF Extractor (Skill - Personal) → 提取 PDF 文本
3. AskUserQuestion → "处理方式？" → 摘要 / 翻译 / 分析
4. Document Processor (Skill - Project) → 团队共享的处理逻辑
5. Format Results (Sub-Agent) → 格式化输出
示例 4：网页自动化（结合 MCP 工具）
1. Input URL (Prompt) → 询问目标网站
2. Playwright Navigate (MCP) → 使用 playwright-mcp 服务器打开浏览器导航
3. AskUserQuestion → "操作类型？" → 截图 / 提取文本 / 点击元素
4. Playwright Action (MCP) → 执行浏览器操作
5. Process Results (Sub-Agent) → 分析并格式化输出
AI 辅助工作流优化

这是整个项目最惊艳的功能！

使用方法
1. 打开或创建工作流
2. 点击工具栏的 "Edit with AI" 按钮（✨ 图标）
3. 用自然语言描述修改需求（最多 2000 字符）
4. 点击 "Apply Changes" 或按 Ctrl+Enter / Cmd+Enter
5. 查看画布上的变化，继续提出后续需求
6. 满意后点击 "Accept Changes"，或点击 "Cancel" 放弃所有修改
官方示例请求

初始创建：

Create a PR code review workflow with MCP, Skills, and conditional branching

迭代优化：

Add error handling when the MCP tool fails to fetch PR details

添加验证逻辑：

Add a Sub-Agent node that validates user input before processing

修改连接：

Connect the error output of the validator to a new error handler Sub-Agent

调整配置：

Change the AskUserQuestion node to have 3 options instead of 2: High, Medium, Low

复杂多步请求：

1. Add a Skill node that reads PDF files
2. Connect it after the input Prompt node
3. Add error handling if the PDF read fails
最佳实践

推荐做法：

• 具体明确：指定确切的节点类型和连接
• 一次一个改动：小而专注的请求准确率更高
• 渐进式构建：从简单开始，通过迭代增加复杂性
• 每步验证：在请求更多修改前确认当前改动

避免做法：

• 模糊请求如 "make it better"
• 要求完全重写（应使用 "Generate with AI"）
• 一次请求过多改动（拆分成小步骤）
错误处理
错误代码
	
含义
	
解决方案

COMMAND_NOT_FOUND	
Claude Code CLI 未安装
	
安装 Claude Code CLI

TIMEOUT	
请求超时
	
简化请求、增加超时设置或重试

PARSE_ERROR	
AI 输出无法解析
	
重新措辞后重试

VALIDATION_ERROR	
工作流超出限制（最多 50 节点）
	
删除节点或降低复杂度
节点类型详解
Prompt 节点

定义可复用的提示词模板：

• 使用 {{variableName}} 语法定义变量
• 运行时动态替换变量值
• 自动检测和验证变量
Sub-Agent 节点

配置自主 AI 代理：

• 自定义系统提示词
• 工具权限（Read、Write、Bash 等）
• 模型选择（Sonnet 平衡、Opus 复杂任务、Haiku 速度优先）
Skill 节点

集成 Claude Code Skills：

• Personal Skills：存储在 ~/.claude/skills/，仅个人使用
• Project Skills：存储在 .claude/skills/，可通过版本控制与团队共享
• 支持在可视化编辑器中直接创建新 Skill
MCP 节点

集成 Model Context Protocol 工具：

• 自动发现已配置的 MCP 服务器
• 搜索和筛选 MCP 工具
• 动态表单配置参数
• 实时参数验证

注意：MCP 服务器需要在 Claude Code 中预先配置，扩展会自动检测可用的服务器和工具。

条件分支节点

IfElse 节点：固定二路分支

• True/False、Yes/No、Success/Error 模式
• 绿色/红色视觉区分

Switch 节点：可变多路分支（2-N 路）

• 单点多条件路径
• 动态添加/删除分支
AskUserQuestion 节点

创建用户决策点：

• 2-4 个选项（或多选）
• 每个选项分支到不同节点
• AI 可根据上下文动态生成选项
常见问题

Q: 需要编程经验吗？
A: 不需要！可视化编辑器专为所有人设计，只需拖放和配置即可。

Q: 可以手动编辑导出的文件吗？
A: 可以！导出的 .claude 文件是带 frontmatter 的纯 Markdown，可直接编辑。

Q: 最多可以添加多少节点？
A: 每个工作流最多 50 个节点，大多数工作流使用 3-10 个节点就足够了。

Q: Personal Skills 和 Project Skills 有什么区别？
A: Personal Skills 存储在 ~/.claude/skills/，仅本机可用；Project Skills 存储在项目的 .claude/skills/ 目录，可通过版本控制与团队共享。

Q: 如果引用的 Skill 文件缺失会怎样？
A: 编辑器会检测缺失的 Skill 文件并在节点上显示警告，你可以重新选择有效的 Skill 或删除引用。

使用限制
• 每个工作流最多 50 个节点
• AI 处理超时：30 秒到 5 分钟（可通过 UI 配置）
• 请求限制 2000 字符
• 会话历史仅在当前会话期间保存
• 需要安装 Claude Code CLI
技术栈
组件
	
技术


平台
	
VSCode Extension


语言
	
TypeScript


UI 框架
	
React（基于 React Flow）


构建工具
	
Vite


代码质量
	
Biome

项目灵感来自 Dify，基于 React Flow 构建。

写在最后

Claude Code Workflow Studio 填补了 Claude Code 生态中的一个重要空白 —— 可视化工作流设计。它让复杂的 AI Agent 编排变得触手可及，无论你是资深开发者还是刚接触 AI 编程的新手，都能快速上手。

如果你正在使用 Claude Code，强烈建议试试这个扩展。它能帮你：

• 零代码快速构建复杂的多 Agent 工作流
• 用自然语言迭代优化工作流设计
• 一键导出可执行的配置文件
• 通过 Slack 与团队成员共享工作流

项目地址：https://github.com/breaking-brake/cc-wf-studio

你用过 Claude Code 吗？有什么使用心得？欢迎在评论区分享！

---
*导入时间: 2026-01-17 20:20:11*
