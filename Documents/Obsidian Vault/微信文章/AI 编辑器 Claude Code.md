---
title: "AI 编辑器 Claude Code"
source: wechat
url: https://mp.weixin.qq.com/s/6PiNvIp2O7Y9_8-5BTNBNw
author: 林元皓
pub_date: 2025年10月19日 08:11
created: 2026-01-17 22:14
tags: [AI, 编程, 产品]
---

# AI 编辑器 Claude Code

> 作者: 林元皓 | 发布日期: 2025年10月19日 08:11
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/6PiNvIp2O7Y9_8-5BTNBNw)

---

本来纠结要不要，做一篇关于 Claude Code 的文章，整合十一的时候，Claude Code 推出了 2.0、DeepSeek 推出了 V3.2-Exp（Experimental） 实验性版本、Cursor 也推出了 1.7 版本。因此我又开始写文章啦~

Claude Code 是一个用于代理编码的命令行工具。但我们的标题既然叫《AI 编辑器 Claude Code》，那么这篇文章将会多多少少地结合 IDE 来讲解其在各个代码库、语言和环境中使用 Cluade Code 的使用技巧。

Claude Code 概述

Claude Code 是 Anthropic 推出的代理式程式设计助理 (Agentic Coding Assistant)，一款创新的 AI 编程助手，其特点包括：

• 自主理解与规划：以 Claude Opus 4.1、Claude Sonnet 4.5 模型为核心，能够理解复杂的开发需求并制定计划
• 终端原生操作：使用者可以直接在終端中于 Claude Code 互动，進行写程式码、执行指令、管理 git 版本控制等操作，无需在不同工具间切换。
• 独特的 SubAgents 功能： 这是其最创新的特色，可以建立专门的子代理来处理特定任务，实现多代理协作 （build your agent team）
• 生态整合：透过 Model Context Protocol (MCP)，Claude Code 能夠于各种开发工具深度整合，形成完整的开发生态系统。

与其他 AI 工具相比，Claude Code 的优势在于 SubAgents 和 Extended Thinking 等其它工具较缺乏的独特功能。

并在企业应用方面，桥水基金、Asana 和 Ramp 等公司得到成功案例也很值得参考。

Claude Code 的核心功能与特色
管理 Claude 场景与记忆

参阅官方文档： Manage Claude's memory

• 项目目录 CLAUDE.md
• ./CLAUDE.md
• 放在项目目录，作为以项目为基础的记忆笔记。
• 同一个项目的团队可以共享。
• 刚进到新的项目，使用建立的就是项目目录的 CLAUDE.md。/init
• 用户（作者）个性化 CLAUDE.md
• ~/.claude/CLAUDE.md
• 个性化的属性设定，跨越所有项目。
• 自己惯有的属性，例如我会设定「」、「」。- 中文字元和英文字元之間，請加上一個半形空白字元，以方便閱讀。``- 不要誇我，驗證過是對就去做、有疑慮就問，不要浪費時間誇我。
• 项目目录的个性化 CLAUDE.md
• ./CLAUDE.local.md
• 已经 deprecated。
SubAgents 多代理协作的创新

参阅官方文档：SubAgents

SubAgents ：是 Claude Code 最创新的功能。 简单来说，你可以建立专门的「子代理 （subagent」来处理特定类型的任务，每个 SubAgent 都有自己的专长和上下文 （context）。

什麼是 SubAgents？

SubAgents 本质上是可以被主代理呼叫的专门化 AI 助理。 每个 SubAgent 都有：

• 独立的系统提示：定义其角色和专长
• 专属的上下文窗口：避免干扰主对话 （ 不干扰主线任务，自己去旁边玩沙画圈圈，乖）
• 特定的工具权限：只能使用完成任务所需的最小权限

使用场景范例

• 项目经理：整理访谈、撰写使用情境、撰写 PRD。
• 代码审查专家：建立一个专门审查安全漏洞的 SubAgent，遵循 OWASP Top 10 标准。
• 测试专家：建立专门编写单元测试的 SubAgent，熟悉特定框架的最佳实践。
• 文件专家：专门负责撰写和维护 API 文档的 SubAgent。

如何建立 SubAgents

Claude Code 提供两种方式建立 SubAgents：

1. 交互式接口：使用 指令打开管理界面/agents
2. 文件定义：在目录下建立 Markdown 文件.claude/agents/

个人偏好档案定义的方式，可以将 SubAgent 设定纳入版本控制，或与团队成员共享。

Extended Thinking 深度思考模式

Extended Thinking 是 Claude 3.7 模型开始的创新功能，让 AI 能够进行更深入的思考和规划。

与传统的「立即回应」不同，Extended Thinking 模式会：

• 给予模型更多计算时间和资源
• 在回答前进行多步骤的内部思考和推理
• 甚至可以呼叫外部工具来辅助思考

在处理复杂的编程任务时，可以使用 “think”， “think hard”， “ultrathink” 等关键词来触发这个模式。 适用场景 ：

• 大型代码重构的规划
• 复杂系统架构设计
• 调试复杂问题的根因分析 （root cause finding）

但如果在过程中作者能够识别出来同一次任务有不同维度可能形成逻辑冲突，建议拆开。 拆成多次处理，或是拆解成更小粒度的小任务、todo items。 或者，同一件事情，干净重跑 3~5 次 。

MCP 生态系统的核心

Model Context Protocol （MCP）是 Claude 生态系统的秘密武器，后来其他大厂也陆续跟进。

MCP 定义了一套标准通信协议，让外部工具能够将自己的「能力」和「上下文」注入到 Claude 的推理过程中。

MCP 解决的问题

传统 AI 助理的问题是缺乏对环境的真实感知。 MCP 打通之后让 Claude 能够：

• 「看到」整个项目的档案结构、或团队共享的项目工具 e.g. JIRA tickets。
• 「使用」本地安装的 linter 或测试工具。
• 「理解」项目的建置系统和依赖关系。

实际整合范例

透过 MCP，Claude Code 可以整合：

• 开发工具：ESLint、Prettier、Jest 等。
• 版本控制：Git 操作和历史分析。
• 项目管理：JIRA、GitHub Issues。
• 部署工具: Docker、Kubernetes。

MCP 的优势在于，它让 Claude Code 不再是一个孤立的工具，而是能够深度整合到现有开发工作流程中。

平行工具使用，效率的倍增器

Claude 4 模型支持平行工具使用 （Parallel Tool Use），这意味着它可以同时：

• 发起网络搜寻
• 读取本地档案
• 执行代码片段

这种并行处理能力让 Claude Code 的行为更接近熟练的人类开发者，大幅提升了任务执行效率。

企业级记忆管理

Claude Opus 具备建立和维护「记忆文件 （Memory Files）」的能力，用来记录：

• 关键信息和中间结论
• 用户偏好和习惯
• 项目特定的上下文

这让长时间的编程工作能够保持一致性，避免重复解释相同的需求。

但 Claude 4 Sonnet 和 Claude 3.7 Sonnet 在适当描述切分好的小任务已经能妥善解决任务，这一点也就不是那么必要。 但的确能够节省一部分人时消耗。

Claude Code 环境搭建

由于有 ThinkPad X1 和 Macbook 两个笔记本，所以这里讲以下 Windows 和 Mac 两个系统的环境搭建。

Claude Code 安装

由于 Claude Code 中国区被封杀，并且注册繁琐而且计费也比较昂贵，本来想通过美国区 App Store 购买订阅，但是办公室的香港 IP 地址也是无法登录的。

因此这里我们使用 DeepSeek 进行模型平替。

在安装 Claude Code 之前，需要安装 Node.js 和 Git 依赖。

安装 Node.js

下载地址：Node.js — 下载 Node.js®

安装后，使用命令检查安装版本：

node --version
npm --version

安装 Git

下载地址：Git - Downloads

安装后，使用命令检查安装版本：

git --version

需要注意在 Windows 下需要将 Git 的 bash.exe 路径设置到 CLAUDE_CODE_GIT_BASH_PATH 的环境变量中，需要长期有效，因此在命令提示符下输入：

setx CLAUDE_CODE_GIT_BASH_PATH "C:\Develop\Git\bin\bash.exe"
Windows 环境

在 Windows 下安装 Claude Code 比较简单，以管理员身份打开 Powershell 或者 命令提示符：

npm install -g @anthropic-ai/Claude-code
claude --version

如果你使用的是旧版本，可以更新一下：

claude update
Mac 环境

在 Mac 下安装 Claude Code 和 Windows 几乎一致：

sudo npm install -g @anthropic-ai/claude-code
claude --version

如果你使用的是旧版本，可以更新一下：

claude update

可能因为我没有 sudo 的原因，安装时提示没有权限的错误：

npm error code EACCES
npm error syscall mkdir
npm error path /usr/local/lib/node_modules/@anthropic-ai
npm error errno -13
npm error Error: EACCES: permission denied, mkdir '/usr/local/lib/node_modules/@anthropic-ai'
npm error     at async mkdir (node:internal/fs/promises:857:10)
npm error     at async /usr/local/lib/node_modules/npm/node_modules/@npmcli/arborist/lib/arborist/reify.js:624:20
npm error     at async Promise.allSettled (index 0)
npm error     at async [reifyPackages] (/usr/local/lib/node_modules/npm/node_modules/@npmcli/arborist/lib/arborist/reify.js:325:11)
npm error     at async Arborist.reify (/usr/local/lib/node_modules/npm/node_modules/@npmcli/arborist/lib/arborist/reify.js:142:5)
npm error     at async Install.exec (/usr/local/lib/node_modules/npm/lib/commands/install.js:150:5)
npm error     at async Npm.exec (/usr/local/lib/node_modules/npm/lib/npm.js:207:9)
npm error     at async module.exports (/usr/local/lib/node_modules/npm/lib/cli/entry.js:74:5) {
npm error   errno: -13,
npm error   code: 'EACCES',
npm error   syscall: 'mkdir',
npm error   path: '/usr/local/lib/node_modules/@anthropic-ai'
npm error }
npm error
npm error The operation was rejected by your operating system.
npm error It is likely you do not have the permissions to access this file as the current user
npm error
npm error If you believe this might be a permissions issue, please double-check the
npm error permissions of the file and its containing directories, or try running
npm error the command again as root/Administrator.
npm error A complete log of this run can be found in: /Users/ming.xu/.npm/_logs/2025-09-25T03_02_43_827Z-debug-0.log

这里解决这个问题步骤如下，进入终端，依次输入命令：

• 创建 global 安装任务的目录：
mkdir ~/.npm-global
• 配置 npm 使用新的目录
npm config set prefix '~/.npm-global'
• 在 ~/.profile 文件中增加配置
export PATH=~/.npm-global/bin:$PATH
• 配置文件立即生效
source ~/.profile

这样使用命令再次安装即可。

配置 DeepSeek 模型

按照 Anthropic API 兼容规范，Claude Code 是可以切换到第三方模型的，

这里忽略了 DeepSeek API keys 的生成和购买，下面让我们看看如何切到 DeepSeek 模式：

• 环境变量设置（临时会话）
• Windws 下的环境变量设置：在 cmd 窗口下：
# DeepSeek 提供的 Anthropic 兼容入口
set ANTHROPIC_BASE_URL=https://api.deepseek.com/anthropic

# 使用 DeepSeek 的 API Key（Claude Code 读取 ANTHROPIC_AUTH_TOKEN）
set ANTHROPIC_AUTH_TOKEN="${DEEPSEEK_API_KEY}"

# 默认主模型（思考模式 deepseek-reasoner、非思考模型  deepseek-chat）
set ANTHROPIC_MODEL=deepseek-reasoner

# 快速小模型（同样可设为 deepseek-chat）
set ANTHROPIC_SMALL_FAST_MODEL=deepseek-chat
在 PowerShell 窗口下：
# DeepSeek 提供的 Anthropic 兼容入口
$env:ANTHROPIC_BASE_URL=https://api.deepseek.com/anthropic

# 使用 DeepSeek 的 API Key（Claude Code 读取 ANTHROPIC_AUTH_TOKEN）
$env:ANTHROPIC_AUTH_TOKEN="${DEEPSEEK_API_KEY}"

# 默认主模型（思考模式 deepseek-reasoner、非思考模型  deepseek-chat）
$env:ANTHROPIC_MODEL=deepseek-reasoner

# 快速小模型（同样可设为 deepseek-chat）
$env:ANTHROPIC_SMALL_FAST_MODEL=deepseek-chat
也可用 powershell 的 [Environment]::SetEnvironmentVariable 或者命令行的 setx 设置系统级长期变量。
• Mac 下的环境变量设置，在终端下
# DeepSeek 提供的 Anthropic 兼容入口
export ANTHROPIC_BASE_URL=https://api.deepseek.com/anthropic

# 使用 DeepSeek 的 API Key（Claude Code 读取 ANTHROPIC_AUTH_TOKEN）
export ANTHROPIC_AUTH_TOKEN="${DEEPSEEK_API_KEY}"

# 默认主模型（思考模式 deepseek-reasoner、非思考模型  deepseek-chat）
export ANTHROPIC_MODEL=deepseek-reasoner

# 快速小模型（同样可设为 deepseek-chat）
export ANTHROPIC_SMALL_FAST_MODEL=deepseek-chat
若需长期生效，可将这些* export 行加入 ~/.zshrc 或 ~/.bashrc。
• settings.json 配置文件 (持久化)如果要设置全局的，平台的目录有所不同：  WIndows 目录：C:\Users%username%\.claude Mac 目录：~/.claude/编辑 settings.json 配置文件
{
    "env": {
      "ANTHROPIC_BASE_URL": "https://api.deepseek.com/anthropic",
      "ANTHROPIC_AUTH_TOKEN": "${DEEPSEEK_API_KEY}",
      "ANTHROPIC_MODEL": "deepseek-reasoner",
      "ANTHROPIC_SMALL_FAST_MODEL": "deepseek-chat"
    }
}

至此，Claude Code 算安装完毕，并且配置了 DeepSeek 模型，命令行启动 Claude Code，进行一下初体验：

claude

先问他两个问题:

• 你是谁?
• 使用的模型是什么?





Claude Code Router 安装

如果你想使用多模型，并且进行不同模型间的切换。这里便引入了 Claude Code Router。

Claude Code Router 被设计为 Anthropic 官方命令行工具 Claude Code 的一个强大扩展。它允许用户将代码生成请求路由到不同的大模型，从而为开发者提供前所未有的灵活性和定制化能力。

该项目是一个社区驱动的开源项目，GitHub 仓库地址：https://github.com/musistudio/claude-code-router

核心功能解析

Claude Code Router 的核心价值在于其提供的精细化控制功能。

• 智能模型路由（Model Routing）：这是降低AI API使用成本的关键特性。Claude Code Router 允许您根据任务类型和模型能力将请求智能地路由到最合适的模型。
• 例如，您可以将计算量小、不那么紧急的后台任务（background）路由到成本较低的本地模型，例如通过 Ollama 运行的qwen2.5-coder:latest。
• 对于需要深度思考或规划的推理任务（think），可以将其发送给推理能力更强的模型，例如 deepseek,deepseek-reasoner。
• 而处理**超长上下文（longContext）**的任务，则可以路由到支持大上下文的模型，如 openrouter,google/gemini-2.5-pro-preview。
• 多提供商支持（Multi-Provider Support）：
• Claude Code Router 支持包括 OpenRouter、DeepSeek、Ollama、Gemini、Volcengine 和 SiliconFlow 在内的多种主流AI模型提供商。
• 这使得您能够灵活组合和选择模型，降低对单一AI服务提供商的依赖，并根据市场价格和性能动态调整策略。
• 代理URL配置（PROXY_URL）：
• 为了应对IP访问限制或潜在的IP封锁风险，Claude Code Router 提供了 PROXY_URL 配置选项。
• 通过在 ~/.claude-code-router/config.json 文件中设置代理URL（例如 "http://127.0.0.1:7890"），所有的API请求都可以通过您指定的代理服务器发出。这能够有效规避地域限制，保障服务的连续性和可访问性。
• 请求/响应转换（Request/Response Transformation）：
• 由于不同模型提供商的API接口可能存在差异，Claude Code Router 内置了或允许自定义转换器（Transformers）。
• 这些转换器能够修改请求和响应的数据负载，确保与各种API的兼容性。例如，deepseek、gemini、openrouter 是内置的转换器，maxtoken 转换器可以设置 max_tokens值，tooluse 则能优化某些模型的工具使用功能。
• 动态模型切换（Dynamic Model Switching）：在Claude Code 终端内部，您可以使用 /model provider,model 命令实时切换模型。例如，输入 /model openrouter,anthropic/claude-4.0-sonnet 即可快速调整所使用的AI模型，极大地提升了开发过程中的灵活性。
安装配置

在不同平台下执行下面安装命令即可：

npm install -g @musistudio/claude-code-router
ccr -v

配置文件路径：

WIndows 目录：C:\Users%username%\.claude-code-router\config.json

Mac 目录：~/.claude-code-router/config.json

因为我们只有一个 DeepSeek 模型，因此配置比较简单：

{
  "API_TIMEOUT_MS": 600000,
  "Providers": [
    {
      "name": "deepseek",
      "api_base_url": "https://api.deepseek.com/anthropic",
      "api_key": "${DEEPSEEK_API_KEY}",
      "models": ["deepseek-chat", "deepseek-reasoner"]
    }
  ],
  "Router": {
    "default": "deepseek,deepseek-chat",
    "background": "deepseek,deepseek-chat",
    "think": "deepseek,deepseek-reasoner",
    "longContext": "deepseek,deepseek-reasoner"
  }
}

此时，使用 Claude Code Router 命令启动 Claude Code ：

ccr code






会发现，有 API 6000ms 超时设置，说明使用 Claude Code Router 启动成功了，还是比较方便的，因为 ccr 不是重点，更多学习可自行学习，这里就不作过多讲述了。

对于小白，可以用 cc-switch 和 Cherry Studio来解决多模型切换问题。

• 前者是一个开源的桌面应用
• 后者则在 v1.5.7 版本引入了 Code Agent 功能，特别适合当前大家都转向 “国产模型 + Claude Code / Codex” 的情况
Claude Code for IDE 安装

在 Vs Code、Cursor、Rider 等 IDE 中安装 Claude Code 插件，只需两步：

• 安装插件：在各自的插件商店搜索 "Claude Code" ，认准 Anthropic 官方版本，点击安装即可。
• 快速启动：用快捷键 Cmd+Esc（Mac）或 Ctrl+Esc（Windows） （可自定义）唤醒，或者点击 IDE 界面中的 Claude Code 图标，右侧会直接显示工作区，支持选中代码自动传入上下文、diff 对比代码修改，甚至用 Cmd+Option+K（Mac）或 Alt+Ctrl+K（Windows）一键推送选中内容到提示框。

当然，你也可以在命令行中输入 /ide 来关联你使用的 IDE 进行交互操作，也是比较方便的。




可以看到，我已经在 Vs Code、Cursor、Rider 都安装了插件，这里无法选择的原因，是我未将工程添加到 Claude Code 的工作目录中。

Claude Code 核心功能
Claude Code 基础操作
从帮助命令开始

想快速上手？从 claude --hlep 开始，解锁所有可能。







这个命令会列出所有可用参数和命令，比如：

• -p 用于非交互式输出
• -c 继续最近的对话
• --modle 指定模型
• ...

记住常用参数能让操作效率翻倍，比如：

• claude -r 恢复历史会话
• claude --output-format json 导出结构化结果

这里常见相关命令整理，安字母排序：

命令
	
解释
	
概述

/add-dir	
添加新工作目录
	
添加一个新的工作目录，用于管理多项目文件夹路径。

/agents	
管理代理配置
	
管理代理（Agent）的配置，包括自定义行为或权限规则。

/bug	
提交反馈
	
提交关于 Claude Code 的反馈或问题报告。

/bashes	
管理后台 Bash 终端
	
列出并管理在后台运行的 Bash Shell 实例。

/clear (reset)	
清除对话历史
	
清除当前对话历史并释放上下文空间（类似重启会话）。

/compact	
压缩上下文
	
压缩对话历史但保留摘要信息，支持自定义摘要指令（如 /compact [指令]）。

/config (theme)	
打开配置面板
	
调整终端主题、颜色或其他配置参数。

/context	
可视化上下文使用
	
以彩色网格形式可视化当前上下文（Token）占用情况。

/cost	
显示会话成本
	
显示当前会话的总费用和持续时间（基于 Token 使用量）。

/doctor	
诊断安装问题
	
检查并验证 Claude Code 的安装和配置状态，修复潜在问题。

/exit (quit)	
退出 REPL
	
退出当前交互式终端（REPL）会话。

/export	
导出对话记录
	
将当前对话导出为文件或复制到剪贴板（支持格式化文本）。

/help	
显示帮助
	
列出所有可用命令及其简要说明。

/hooks	
管理钩子配置
	
管理工具事件的钩子（Hook）配置，用于自动化任务。

/ide	
管理 IDE 集成
	
配置或查看 IDE（集成开发环境）的连接状态和集成选项。

/init	
初始化项目记忆文件
	
生成或更新 CLAUDE.md 文件（存储代码库文档和规则）。

/install-github-app	
设置 GitHub Actions
	
为仓库配置 Claude GitHub Actions 自动化流程。

/login
、/logout
	
账号登录、登出
	
从 Anthropic 账户进行切换等操作

/mcp	
管理 MCP 服务器
	
管理 Model Context Protocol (MCP) 服务器连接（如数据库、网页操作等）。

/memory	
编辑记忆文件
	
编辑 CLAUDE.md 等记忆文件，保存长期上下文或规则。

/migrate-installer	
迁移安装方式
	
将全局 npm 安装迁移到本地安装（优化依赖管理）。

/model	
切换 AI 模型
	
设置当前使用的 AI 模型（如 claude-sonnet-4 或 claude-opus）。

/output-style	
设置输出样式
	
直接设置输出样式或通过菜单选择（如代码高亮、分步解释）。

/output-style:new	
创建自定义样式
	
定义新的自定义输出样式模板。

/pr-comments	
获取 PR 评论
	
从 GitHub Pull Request 中提取并分析代码评论。

/permissions	
管理工具权限
	
设置工具的允许/拒绝规则，控制权限范围。

/release-notes	
查看更新日志
	
显示 Claude Code 的版本更新说明和功能改进。

/resume	
恢复对话
	
恢复当前目录下的聊天记录（继续之前的会话）。

/review	
代码审查
	
对当前文件或代码片段请求代码审查建议。

/status	
显示状态信息
	
查看 Claude Code 的状态，包括版本、模型、账户、API、连接和工具状态。

/statusline	
配置状态栏
	
自定义终端底部状态栏的显示内容（如模型名称、Token 使用量）。

/security-review	
安全审查
	
对当前分支的代码变更执行安全审查（识别潜在风险）。

/terminal-setup	
配置换行快捷键（Shift+Enter）
	
安装 Shift+Enter 换行绑定（优化多行输入体验）。
之前是不支持 shift+enter 换行的，执行了这个命令之后就支持了。

/upgrade	
升级到 Max 版本
	
升级到 Max 计划，解锁更高速率限制和 Opus 模型权限。

/vim	
切换 Vim 模式
	
在 Vim 编辑模式和普通模式之间切换（优化文本操作效率）。
快捷键

Claude Code 会话中键盘快捷键和 Vim 编辑器模式下的快捷键。

会话模式快捷键

通用控制：

快捷键
	
描述
	
上下文

Ctrl+C	
取消当前输入或生成
	
标准中断

Ctrl+D	
退出 Claude Code 会话
	
EOF 信号

Ctrl+L	
清除终端屏幕
	
保留对话历史

上/下箭头	
导航命令历史
	
回调之前的输入

Esc
 + Esc
	
编辑上一条消息
	
双击 Escape 进行修改

Shift+Tab	
切换权限模式
	
在自动接受模式、计划模式和正常模式之间切换

多行输入

方法
	
快捷键
	
上下文


快速转义
	\
 + Enter
	
在所有终端中有效


macOS 默认
	Option+Enter	
macOS 上的默认设置


终端设置
	Shift+Enter	
在 /terminal-setup 之后


控制序列
	Ctrl+J	
多行的换行字符


粘贴模式
	
直接粘贴
	
用于代码块、日志

在终端设置中配置您首选的换行行为。运行 /terminal-setup 为 VS Code 终端安装 Shift+Enter 绑定。

快捷命令

快捷键
	
描述
	
注释


开头的 #
	
内存快捷键 - 添加到 CLAUDE.md
	
提示文件选择


开头的 /
	
斜杠命令
	
参考上方命令整理


开头的 !
	
Bash 模式
	
直接运行命令并将执行输出添加到会话中

Vim 模式快捷键

使用 /vim 命令启用 vim 风格编辑，或通过 /config 永久配置。

模式切换

命令
	
操作
	
从模式

Esc	
进入 NORMAL 模式
	
INSERT

i	
在光标前插入
	
NORMAL

I	
在行首插入
	
NORMAL

a	
在光标后插入
	
NORMAL

A	
在行尾插入
	
NORMAL

o	
在下方打开新行
	
NORMAL

O	
在上方打开新行
	
NORMAL

导航（NORMAL 模式）

命令
	
操作

h
/j/k/l
	
向左/下/上/右移动

w	
下一个单词

e	
单词末尾

b	
上一个单词

0	
行首

$	
行尾

^	
第一个非空白字符

gg	
输入开头

G	
输入末尾

编辑（NORMAL 模式）

命令
	
操作

x	
删除字符

dd	
删除行

D	
删除到行尾

dw
/de/db
	
删除单词/到末尾/向后

cc	
更改行

C	
更改到行尾

cw
/ce/cb
	
更改单词/到末尾/向后

.	
重复上次更改
多模式操作

为了安全起见， Claude Code 执行一些命令时默认请求你的同意。但是 Claude Code 支持三种模式操作：

• 自动编辑模式：免确定批处理操作适合无需逐次确认的文件创建、修改场景。按下 Shife+Tab（Mac）或 Alt+M（Windows） 一次即可启动。此时 Claude 会自动执行编辑操作，无需手动确认。比如提示 "创建一个炫酷的 ToDoList 应用" ，它会直接生成文件并修改，省去反复确认的时间。
• Plan 模式：前期规划神器面对项目搭建或者复杂问题时，用 Shife+Tab（Mac）或 Alt+M（Windows） 两次启动 Plan 模式。它会先梳理方案框架，比如要做 "像素风格的移动端 ToDoList "，会自动规划技术栈、页面结构、适配方案等，在确认后再动手。若不满意可以直接说 “重新规划”，直到符合预期。
• Yolo 模式：全权限放手干重构代码、启动新项目或者修复 Bug 时，用 claude --dangerously-skip-permissions 进入 Yolo 模式。此时 Claude 拥有更高权限，可以直接执行更多操作（需注意安全、建议再沙箱环境使用）。进入后仍能用 Shife+Tab（Mac）或 Alt+M（Windows） 调整模式，灵活切换权限粒度。
claude --dangerously-skip-permissions
设置

设置文件 settings.json 是通过分层设置配置 Claude Code 的官方机制：

• 用户设置 在 ~/.claude/settings.json 中定义，适用于所有项目。
• 项目设置 保存在您的项目目录中：
• .claude/settings.json 用于检入源代码控制并与团队共享的设置
• .claude/settings.local.json 用于不检入的设置，对个人偏好和实验很有用。Claude Code 会在创建时配置 git 忽略 .claude/settings.local.json。
• 对于 Claude Code 的企业部署，还支持企业托管策略设置。这些设置优先于用户和项目设置。系统管理员可以将策略部署到：
• macOS: /Library/Application Support/ClaudeCode/managed-settings.json
• Windows: C:\ProgramData\ClaudeCode\managed-settings.json

上面已经有了 settings.json 文件的示例，支持多个选项：

键
	
描述
	
示例

apiKeyHelper	
自定义脚本，在 /bin/sh 中执行，生成认证值。
此值将作为 X-Api-Key 和 Authorization: Bearer 标头发送给模型请求
	
/bin/generate_temp_api_key.sh

cleanupPeriodDays	
基于最后活动日期本地保留聊天记录的时间（默认：30天）
	
20

env	
将应用于每个会话的环境变量
	
{"FOO": "bar"}

includeCoAuthoredBy	
是否在 git 提交和拉取请求中包含 co-authored-by Claude 署名（默认：true）
	
false

permissions	
权限结构。
	



hooks	
配置在工具执行前后运行的自定义命令。
	
{"PreToolUse": {"Bash": "echo 'Running command...'"}}

disableAllHooks	
禁用所有钩子
	
true

model	
覆盖 Claude Code 使用的默认模型
	
"claude-3-5-sonnet-20241022"

statusLine	
配置自定义状态行以显示上下文。
	
{"type": "command", "command": "~/.claude/statusline.sh"}

outputStyle	
配置输出样式以调整系统提示。参见输出样式文档
	
"Explanatory"

forceLoginMethod	
使用 claudeai 限制登录到 Claude.ai 账户，console 限制登录到 Anthropic Console（API 使用计费）账户
	
claudeai

forceLoginOrgUUID	
指定组织的 UUID 以在登录期间自动选择它，绕过组织选择步骤。
需要设置 forceLoginMethod
	
"xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

enableAllProjectMcpServers	
自动批准项目 .mcp.json 文件中定义的所有 MCP 服务器
	
true

enabledMcpjsonServers	
从 .mcp.json 文件中批准的特定 MCP 服务器列表
	
["memory", "github"]

disabledMcpjsonServers	
从 .mcp.json 文件中拒绝的特定 MCP 服务器列表
	
["filesystem"]
工作目录

默认情况下，Claude 可以访问启动它的目录中的文件。您可以扩展此访问权限：

• 启动期间：使用--add-dir <path> CLI 参数
• 会话期间：使用/add-dir 斜杠命令
• 持久配置：添加到设置文件]中的additionalDirectories

附加目录中的文件遵循与原始工作目录相同的权限规则 - 它们变得可读而无需提示，文件编辑权限遵循当前权限模式。

记忆管理

记忆的核心：CLAUDE.md，该文件就类似于 Cursor 的 Rules 文件，规定了 AI 怎样生成代码。你可以在里面指定代码风格、开发环境、仓库规范等等。

Claude Code 的“记忆”功能允许它在不同的会话（Session）之间持久化存储开发者的指令、偏好、项目规范和上下文信息。

其核心是通过读取特定路径下的 Markdown 文件（CLAUDE.md）来实现的。

分层管理策略：三种记忆的定位于应用

Claude 的记忆管理体系设计了三个不同的作用域，理解它们的定位是高效使用的关键。

内存类型
	
文件路径
	
核心定位与策略建议
	
使用场景示例


用户内存
	
~/.claude/CLAUDE.md
	
个人编码哲学: 定义全局、跨所有项目的个人偏好。这是你的“数字 DNA”。
	
- 个人代码风格（如：使用 2 空格缩进）
- 习惯的 Git Commit 格式
- 个人常用工具的快捷指令


项目内存
	
./CLAUDE.md
	
团队共同语言: 定义项目范围内的规范和标准，是团队协作的基石。
	
- 项目技术栈与架构图
- API 设计规范与数据结构
- 团队共享的部署与测试流程


项目本地内存
	
./CLAUDE.local.md
	
个人项目配置 (已废弃): 存放个人在特定项目中的临时或敏感配置。
	
- 本地沙箱环境的 URL
- 个人的测试数据或 API 密钥
注意: 官方已不推荐使用此文件，建议通过在 .gitignore 中忽略特定文件，并使用 @import 功能导入的方式替代。

多个 CLAUDE.md 文件和用户记忆会同时生效，形成一个组合上下文。理解其加载和优先级对于解决配置冲突至关重要。

以下流程图清晰地展示了这一过程：




Claude.md 文件可以记录内容：

• 常用 bash 命令
• 核心文件和实用函数
• 代码风格指南
• 测试说明
• 代码库规范
• 开发环境设置
• 项目特有的任何意外行为或警告
• 希望 Claude 记住的其他信息

使用 @import 构建模块化配置

@import 语法是 CLAUDE.md 的核心高级功能，它允许你将其他文件内容嵌入到记忆中，实现配置的模块化和复用。

语法: @path/to/your/file

列举一些示例：

# CLAUDE.md

-----------------------------------------------------------------------------

## 基础用法

## 项目概览
本项目是一个基于 Next.js 的电商网站。详细信息请参考：@README.md

## 技术规范
- **编码规范**: @./docs/coding-style.md
- **API 文档**: @./docs/api-reference.md
- **可用脚本**: 请参考 @package.json 中的 "scripts" 部分。

-----------------------------------------------------------------------------

## 高级用法

# 导入团队共享的 React 最佳实践
@/path/to/shared/react-best-practices.md

# 导入我个人的项目特定快捷指令
@~/.claude/my-project-shortcuts.md

可以使用相对路径、绝对路径，甚至是用户主目录 (~) 的路径来导入文件。

技术限制: 最大支持 5 层递归导入。 在 Markdown 的代码块（```）或行内代码（）中，@import` 不会生效。

快速编辑与维护

• # 快捷添加在与 Claude 的对话中，以 # 开头输入内容，即可快速将其添加为一条记忆。Claude 会询问你希望将其保存在哪个记忆文件中。示例: # 在创建组件时，总是同时创建对应的测试文件。
• /memory 命令在会话中输入 /memory 命令，Claude 会在你的系统默认编辑器中打开相关的记忆文件，方便你进行更复杂的编辑、整理和重构。

通过掌握 Claude Code 的分层记忆管理、@import 模块化以及高效的工作流，开发者可以将其从一个通用的代码助手，转变为一个深度融入项目、理解团队规范并符合个人习惯的强大开发伙伴。核心在于将 CLAUDE.md 视为一个需要持续维护和演进的“活文档”，以此来最大化 AI 辅助开发的潜能。

会话管理
• 随时暂停于回滚
• 工作中按 Esc 可暂停当前操作，比如发现 Cladue 安装依赖超时、思路跑偏时，及时中断能减少无效操作。
• 按 Esc 两次可回退到历史对话节点（注意无 redo 功能，回退前确认）。
• 代码不满意？直接说 ”回滚到上次代码“，Claude 会自动恢复之前版本。
• 应对历史溢出虽然 Claude Code 2.0 最大的特色是支持输入 100K token 资料内容长度，但如果会话提示：
Context left until auto-compact:3%
说明历史记录快满了。此时会自动触发压缩，也可手动用 /compact 命令续命，避免对话中断。
• 恢复与查看历史
• 用 cluade -c 直接进入上次对话
• 用 claude -r 选择历史会话恢复，适合中途退出后继续工作。
Claude Code 进阶扩展
管理允许工具

默认情况下，Claude Code 会为任何可能修改你系统的操作请求权限：文件写入、base 命令、MCP 工具等。

有意采用这种保守的方法设计 Claude Code，以优先考虑安全性。

你可以自定义允许列表，许可你知道安全的额外工具，或者允许容易撤销的潜在不安全工具（如：文本编辑、git commit）。

Claude Code 可以访问一组强大的工具，帮助它理解和修改您的代码库：

工具
	
描述
	
需要权限


Bash
	
在您的环境中执行 shell 命令
	
是


LS
	
列出当前工作目录中的文件
	
否


Glob
	
基于模式匹配查找文件
	
否


Grep
	
在文件内容中搜索模式
	
否


Read
	
读取文件内容
	
否


Write
	
创建或覆盖文件
	
是


Edit
	
对特定文件进行有针对性的编辑
	
是


MultiEdit
	
在单个文件上原子性地执行多个编辑
	
是


NotebookEdit
	
修改 Jupyter notebook 单元格
	
是


NotebookRead
	
读取和显示 Jupyter notebook 内容
	
否


Task
	
运行子代理来处理复杂的多步骤任务
	
否


TodoWrite
	
创建和管理结构化任务列表
	
否


WebFetch
	
从指定 URL 获取内容
	
是


WebSearch
	
执行带有域过滤的网络搜索
	
是

有四种方式管理允许的工具：

• 当在会话期间出现提示信息时选择：“始终允许”。
• 在启动 Claude Code 后使用 /permissions 命令向允许列表添加或移除工具。
• Edit 始终允许文件编辑
• Bash(git commit:*) 允许 git 提交
• mcp__puppeteer__puppeteer_navigate 允许使用 Puppeteer MCP 服务器导航
• 手动编辑 .claude/settings.json 或者 ~/.claude.json
{
  "permissions": {
    "allow": [
      "Bash(npm run lint)",
      "Bash(npm run test:*)",
      "Read(~/.zshrc)"
    ],
    "deny": [
      "Bash(curl:*)",
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./secrets/**)"
    ]
  },
  ...
}
键
	
描述
	
示例

allow	
允许工具使用的权限规则数组。注意： Bash 规则使用前缀匹配，不是正则表达式
	
[ "Bash(git diff:*)" ]

ask	
在工具使用时要求确认的权限规则数组。
	
[ "Bash(git push:*)" ]

deny	
拒绝工具使用的权限规则数组。
使用此选项也可以排除敏感文件不被 Claude Code 访问。
注意： Bash 模式是前缀匹配，可以被绕过（参见Bash 权限限制）
	
[ "WebFetch",
"Bash(curl:*)",
"Read(./.env)",
"Read(./secrets/**)" ]

additionalDirectories	
Claude 可以访问的额外工作目录
	



defaultMode	
打开 Claude Code 时的默认权限模式
	
"acceptEdits"

disableBypassPermissionsMode	
设置为 "disable" 以防止激活 bypassPermissions 模式。
参见托管策略设置
	
"disable"
Claude Code支持几种权限模式，可以在设置文件中设置为defaultMode：
模式
	
描述


default
	
标准行为 - 在首次使用每个工具时提示权限


acceptEdits
	
自动接受会话的文件编辑权限


plan
	
计划模式 - Claude可以分析但不能修改文件或执行命令


bypassPermissions
	
跳过所有权限提示（需要安全环境 - 请参阅下面的警告）
• 使用 --allowedTools CLI 标志进行会话特定的权限设置。
钩子机制

Claude Code 提供了一套 可自动化执行的 Hooks 机制，帮助我们在大型项目中避免常见错误、保持代码质量稳定。

以下是Claude Code Hooks 在实践上常见的几种应用方式：

• 代码格式化：在 Claude 编辑完文件后自动执行 formatter
• 自动化测试：当档案变动时触发单元测试或整合测试
• 访问控制：阻挡 Claude 读取或编辑特定敏感文件
• 程序质量检查：执行 linter 或 type checker，并将错误反馈给 Claude
• 访问记录与审计：记录 Claude 作过的文件或内容
• 命名规则 / 结构验证：自动检查变量命名、文件路径、模块归属等规范

Hooks 常用支持的事件：

• PreToolUse：在工具调用之前运行（可以阻止它们）
• PostToolUse：在工具调用完成后运行
• UserPromptSubmit：当用户提交提示时运行，在 Claude 处理之前
• Notification：当 Claude Code 发送通知时运行
• Stop：当 Claude Code 完成响应时运行
• SubagentStop：当子代理任务完成时运行
• PreCompact：在 Claude Code 即将运行压缩操作之前运行
• SessionStart：当 Claude Code 开始新会话或恢复现有会话时运行
• SessionEnd：当 Claude Code 会话结束时运行

每个事件接收不同的数据，并可以以不同的方式控制 Claude 的行为。

下面来举几个常用钩子的示例：

*防止 Claude 阅读敏感文件 .env

使用 PreToolUse Hook 监控 Claude 使用 和 工具时读取数据，如果 Claude 试图阅读 、 等敏感目录，则跳出 Exit Code 2 以阻挡作。

Claude Code 配置文件 settings.local.json

{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Read|Grep",
        "hooks": [
          {
            "type": "command",
            "command": "node ./hooks/read_hook.js"
          }
        ]
      },
    ]
  }
  ...
}

read_hook.js

async function main() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }

  const toolArgs = JSON.parse(Buffer.concat(chunks).toString());
  // readPath is the path to the file that Claude is trying to read
  const readPath = toolArgs.tool_input?.file_path || toolArgs.tool_input?.path || "";
  
  // TODO: ensure Claude isn't trying to read the .env file
  
  if (readPath.includes(".env")) {
    console.error("you cannot read .env files");
    process.exit(2);
  }
}

main();

Claude Code 设置完成任务后播放声音提示

首先创建脚本目录和文件：

# 创建脚本目录
mkdir -p $CLAUDE_PROJECT_DIR/.claude/scripts

# 创建脚本文件
nano $CLAUDE_PROJECT_DIR/.claude/scripts/claude-beep.sh

# 给脚本执行权限
chmod +x $CLAUDE_PROJECT_DIR/.claude/scripts/claude-beep.sh

编辑 claude-beep.sh 脚本

#!/bin/bash
echo "Hook triggered at $(date): $1" >> /tmp/claude-hook.log
afplay "$1"

测试 claude-beep.sh 脚本

# 手动测试播放
$CLAUDE_PROJECT_DIR/.claude/scripts/claude-beep.sh $CLAUDE_PROJECT_DIR/.claude/hooks/over.mp3

Claude Code 配置文件 settings.local.json

{
    ...
    "hooks": {
    "PostToolUse": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/scripts/claude-beep.sh $CLAUDE_PROJECT_DIR/.claude/hooks/over.mp3"
          }
        ],
    "UserPromptSubmit": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/scripts/claude-beep.sh $CLAUDE_PROJECT_DIR/.claude/hooks/over.mp3"
          }
        ]
      }
    ]
      }
    ],
    "Notification": [
      {
        "matcher": "permission",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/scripts/claude-beep.sh $CLAUDE_PROJECT_DIR/.claude/hooks/ding.mp3"
          }
        ]
      }
    ]
  }
}
• 发送一条消息 → 应该听到 ding.mp3
• 用户提交提示时、Claude 执行操作后 → 应该听到 over.mp3

Claude Code 实现任务完成后飞书提醒

创建飞书机器人并配置 Webhook 触发流程

• 在飞书创建一个机器人






完成后点击 “确定” 就会跳转到这个机器人应用的管理窗口（默认是“流程设计”页面）。点击 “创建流程” 后跳转到流程编辑画布中，初始默认三个节点（支持添加更多）：触发器→操作→结束。






需要用到 Webhook，对应飞书机器人助手中的 “Wehook触发”。接着填写 Webhook 推送的 JSON 数据格式或示例数据，对应的 key 值可以被后续流程节点（如操作）消费。






完成配置后，你可以通过 curl 指令，向以上 Webhook 地址发送一个 HTTP POST 请求，进行功能测试。前面所有环节完成后，记得点击“发布”，否则后续步骤在测试时会失败。将 Claude Code 与飞书机器人助手连接实现自动提醒macOS 系统：在电脑上打开“终端”应用程序，并执行以下命令。
curl -X POST -H "Content-Type: application/json" \    
-d '{"msg_type":"text","content":{"project":"cc","time":"21:15:37"}}' \    
${feishu_Webhook_url}
Windows 系统：在电脑上用快捷键 Win + R 打开运行对话框，输入 cmd 并按回车键。在命令窗口执行以下命令。
curl -X POST -H "Content-Type: application/json" \
-d "{\"msg_type\":\"text\",\"content\":{\"text\":\"request example\"}}" \
${feishu_Webhook_url}
• 配置 Claude Code HookClaude Code 配置文件 settings.local.json
{    
    ...
    "hooks": 
    {      
        "Stop": [        
        {          
            "hooks": [            
                {              
                    "type": "command",             
                    "command": "$CLAUDE_PROJECT_DIR/.claude/scripts/feishu-notify.sh"            
                }]        
        }]    
    }  
}
这里使用的是 Stop hook，因为它在 Claude Code 会话结束（任务完成后）触发。feishu-notify.sh脚本
#!/bin/bash

# 从stdin读取hook输入数据
input=$(cat)

# 记录原始输入用于调试
echo "Raw input: $input" >> /tmp/feishu-debug.log

# 提取基本信息
if command -v jq >/dev/null 2>&1; then
    cwd=$(echo "$input" | jq -r '.cwd // "Unknown"')
    session_id=$(echo "$input" | jq -r '.session_id // "Unknown"')
else

# 如果没有jq，使用简单的方法
    cwd="Unknown"
    session_id="Unknown"
fi
project_name=$(basename "$cwd")
completion_time=$(date '+%H:%M:%S')
completion_date=$(date '+%Y-%m-%d')

# 记录提取的信息
echo "Extracted: cwd=$cwd, project=$project_name" >> /tmp/feishu-debug.log

# 构建消息文本（避免在JSON中使用换行符）
text_content="Claude Code 任务完成 项目名称: $project_name 完成时间: $completion_time 完成日期: $completion_date"

# 使用简单的JSON构建（避免复杂的转义）
curl -X POST '替换成你的实际 Wehook 链接' \
     -H 'Content-Type: application/json' \
     -d "{\"msg_type\":\"text\",\"content\":{\"project\":\"$project_name\",\"time\":\"$completion_time\",\"date\":\"$completion_date\"}}"
     >> /tmp/feishu-debug.log 2>&1
echo "Script completed at $(date)" >> /tmp/feishu-debug.log
这个脚本的主要作用就是，读取 Claude Code 传来的 JSON 数据（包括项目名、任务完成时间、任务完成日期）并构造一条飞书通知消息，通过 curl发送 HTTP POST 请求到飞书 Webhook。记得加一下执行权限
chmod +x ~/.claude/scripts/feishu-notify.sh
• 功能测试和优化启动 Claude Code（如果之前开着，记得退出后重新进入）中运行一个简单任务，完成后检查前面配置的飞书账号是否收到通知。当然也可以替换微信提醒、钉钉提醒、桌面提醒，整个核心逻辑和流程基本是一致的，比如：

其中桌面、Discord、Telegram、Slack 有现成的 Hook 可以直接用，在这里就可以快速安装的指令：https://www.aitmpl.com/hooks

• 微信提醒，可以借助企业微信机器人，或者第三方推送工具如虾推啥；
• 钉钉提醒，可以借助钉钉机器人；
• 还有桌面、Discord、Telegram、Slack等提醒，也都是类似的流程。
子代理

在 Claude Code 中创建和使用专门的 AI 子代理（Subagent），用于特定任务的工作流程和改进的上下文管理。

子代理是 Claude Code 可以委派任务的预配置 AI 个性。每个子代理：

• 具有特定的目的和专业领域
• 使用与主对话分离的自己的上下文窗口
• 可以配置允许使用的特定工具
• 包含指导其行为的自定义系统提示

当 Claude Code 遇到与子代理专业知识匹配的任务时，它可以将该任务委派给专门的子代理，该子代理独立工作并返回结果。

管理子代理，可是使用/agents 命令：

/agents

这将打开一个交互式菜单，您可以：

• 查看所有可用的子代理（内置、用户和项目）
• 通过引导设置创建新的子代理
• 编辑现有的自定义子代理，包括其工具访问权限
• 删除自定义子代理
• 查看当存在重复时哪些子代理处于活动状态
• 轻松管理工具权限，提供可用工具的完整列表

如果要配置自己的子代理，可以采取下面方法：

• 基于 CLI 命令配置：使用 --agents CLI 标志动态定义子代理，该标志接受 JSON 对象。
• 直接使用文件管理：
• 项目子代理：.claude/agents/
• 用户子代理：~/.claude/agents/

举两个子代理的示例实践一下：

代码审查员

---
name: code-reviewer
description: 专家代码审查专家。主动审查代码的质量、安全性和可维护性。在编写或修改代码后立即使用。
tools: Read, Grep, Glob, Bash
model: inherit
---

您是一位确保高标准代码质量和安全性的高级代码审查员。

被调用时：
1. 运行 git diff 查看最近的更改
2. 专注于修改的文件
3. 立即开始审查

审查清单：
- 代码简单易读
- 函数和变量命名良好
- 没有重复代码
- 适当的错误处理
- 没有暴露的秘密或 API 密钥
- 实现了输入验证
- 良好的测试覆盖率
- 考虑了性能问题

按优先级组织提供反馈：
- 关键问题（必须修复）
- 警告（应该修复）
- 建议（考虑改进）

包括如何修复问题的具体示例。

调试器

---
name: debugger
description: 错误、测试失败和意外行为的调试专家。在遇到任何问题时主动使用。
tools: Read, Edit, Bash, Grep, Glob
---

您是专门从事根本原因分析的专家调试器。

被调用时：
1. 捕获错误消息和堆栈跟踪
2. 识别重现步骤
3. 隔离失败位置
4. 实施最小修复
5. 验证解决方案有效

调试过程：
- 分析错误消息和日志
- 检查最近的代码更改
- 形成和测试假设
- 添加战略性调试日志
- 检查变量状态

对于每个问题，提供：
- 根本原因解释
- 支持诊断的证据
- 具体的代码修复
- 测试方法
- 预防建议

专注于修复根本问题，而不仅仅是症状。

可以使用中午，给我们带来了最佳实践：

• 从 Claude 生成的代理开始：我们强烈建议使用 Claude 生成您的初始子代理，然后对其进行迭代以使其个人化。这种方法为您提供最佳结果 - 一个您可以根据特定需求自定义的坚实基础。
• 设计专注的子代理：创建具有单一、明确职责的子代理，而不是试图让一个子代理做所有事情。这提高了性能并使子代理更可预测。
• 编写详细的提示：在您的系统提示中包含具体的指令、示例和约束。您提供的指导越多，子代理的表现就越好。
• 限制工具访问：只授予子代理目的所必需的工具。这提高了安全性并帮助子代理专注于相关操作。
• 版本控制：将项目子代理检入版本控制，这样您的团队就可以从中受益并协作改进它们。
MCP

Claude Code 可以通过 Model Context Protocol (MCP) 连接到数百个外部工具和数据源，这是一个用于 AI 工具集成的开源标准。MCP 服务器为 Claude Code 提供对您的工具、数据库和 API 的访问。

MCP 解决的问题

传统 AI 助理的问题是缺乏对环境的真实感知。 MCP 打通之后让 Claude 能够：

• 「看到」整个项目的档案结构、或团队共享的项目工具 e.g. JIRA tickets。
• 「使用」本地安装的 linter 或测试工具。
• 「理解」项目的建置系统和依赖关系。

MCP 配置安装指南

MCP 服务器是 Claude Code 的核心部分，通过配置不同的 MCP 服务器，开发者可以扩展 Claude Code 的能力，实现更复杂的任务。

配置 MCP 服务器

• 添加 stdio 服务器（最常见类型）这是最基础的服务器类型，就像学开车先学手动挡一样：
# 基本语法
claude mcp add <name> <command> [args...]

# 示例：添加一个本地服务器
claude mcp add my-server -e API_KEY=123 -- /path/to/server arg1 arg2
• 添加 SSE 服务器（实时通信的好伙伴）SSE（Server-Sent Events）服务器适合需要实时通信的场景：
# 基本语法
claude mcp add --transport sse <name> <url>

# 示例：添加一个SSE服务器
claude mcp add --transport sse sse-server https://example.com/sse-endpoint

# 示例：添加带自定义头部的SSE服务器
claude mcp add --transport sse api-server https://api.example.com/mcp --header "X-API-Key: your-key"
• 添加 HTTP服务器（老实可靠的选择）HTTP服务器就像是MCP世界里的"老实人"——可靠、稳定、大家都懂：
# 基本语法
claude mcp add --transport http <name> <url>

# 示例：添加一个可流式传输的HTTP服务器
claude mcp add --transport http http-server https://example.com/mcp

# 示例：添加带认证头部的HTTP服务器
claude mcp add --transport http secure-server https://api.example.com/mcp --header "Authorization: Bearer your-token"

管理 MCP 服务器：

# 列出所有配置的服务器（看看你有多少"朋友"）
claude mcp list

# 获取特定服务器的详细信息（深入了解某个"朋友"）
claude mcp get my-server

# 删除服务器（有时候需要断舍离）
claude mcp remove my-server

MCP 服务器作用域

MCP服务器可以在三个不同的作用域级别进行配置，每个都有其独特的用途。

• Local 作用域：私人空间本地作用域服务器代表默认配置级别，存储在你的项目特定用户设置中。这些服务器对你保持私有，只有在当前项目目录中工作时才可访问。这个作用域非常适合个人开发服务器、实验性配置或包含不应共享的敏感凭据的服务器。
# 添加本地作用域服务器（默认）
claude mcp add my-private-server /path/to/server

# 明确指定本地作用域
claude mcp add my-private-server -s local /path/to/server
• Preject 作用域：团队合作桥梁项目作用域服务器通过在项目根目录存储配置到.mcp.json文件中来实现团队协作。这个文件设计为检入版本控制，确保所有团队成员都能访问相同的MCP工具和服务。当你添加项目作用域服务器时，Claude Code 会自动创建或更新这个文件，使用适当的配置结构。
# 添加项目作用域服务器
claude mcp add shared-server -s project /path/to/server
生成的.mcp.json文件遵循标准化格式：
{
  "mcpServers": {
    "shared-server": {
      "command": "/path/to/server",
      "args": [],
      "env": {}
    }
  }
}
出于安全原因，Claude Code在使用来自.mcp.json文件的项目作用域服务器之前会提示批准。如果你需要重置这些批准选择，使用claude mcp reset-project-choices命令。
• User 作用域：跨项目好帮手用户作用域服务器提供跨项目可访问性，使它们在你机器上的所有项目中都可用，同时对你的用户账户保持私有。这个作用域非常适合个人实用程序服务器、开发工具或你在不同项目中经常使用的服务。
# 添加用户服务器
claude mcp add my-user-server -s user /path/to/server

Claude Code支持在.mcp.json文件中进行环境变量扩展，允许团队共享配置，同时为机器特定路径和API密钥等敏感值保持灵活性。

支持的语法：

• ${VAR} - 扩展为环境变量VAR的值
• ${VAR:-default} - 如果设置了VAR则扩展为其值，否则使用 default

扩展位置：

• command - 服务器可执行文件路径
• args - 命令行参数
• env - 传递给服务器的环境变量
• url - 用于SSE/HTTP服务器类型
• headers - 用于SSE/HTTP服务器认证

示例：

{
  "mcpServers": {
    "api-server": {
      "type": "sse",
      "url": "${API_BASE_URL:-https://api.example.com}/mcp",
      "headers": {
        "Authorization": "Bearer ${API_KEY}"
      }
    }
  }
}

通过社区安装 MCP

通过社区推荐的安装 MCP，开发者可以轻松地配置和使用这些服务器。

#!/bin/bash
# 社区验证的 MCP 服务器安装脚本

echo "🚀 安装 Claude Code MCP 服务器..."

# 添加 Sequential Thinking MCP
claude mcp add sequential-thinking -s user -- npx -y @modelcontextprotocol/server-sequential-thinking

# 添加 Filesystem MCP
claude mcp add filesystem -s user -- npx -y @modelcontextprotocol/server-filesystem ~/Documents ~/Desktop ~/Downloads ~/Projects

# 检查安装结果
claude mcp list

通过配置这些 MCP，Claude Code 的能力将得到显著增强，开发者可以更好地处理复杂的任务。

Claude Code 中安装 MCP 很麻烦，我们可以依赖 IDE 中的插件来简化这个流程，这里推荐的插件是：Chat for Claude Code

Chat for Claude Code ：是 VS Code 中的插件，如果你懂得了上面语法后，一切则变得更加简单：





自定义命令

Claude Code 支持自定义命令，你可以创建一些命令来快速执行特定的提示或任务，比如：

• 分析这个项目的性能，并提出三个具体的优化建议。
• 用合理描述性信息提交所有变更文件，然后推送到远程仓库。
• ...

这样一些常用的操作就不需要写一堆文字了，用自定义命令即可。

自定义命令解读：

• 命令分为用户级和项目级；
• 用户级命令所有项目都能用，项目级命令只有当前项目可以用；
• 用户级命令放在个人 ~/.claude/commands 目录下，而项目级命令放在当前项目 .claude/commands 目录下；
• 使用命令时，用户级命令以 /user: 为前缀，项目级命令 /project: 为前缀，后面跟的是命令文件名称，可级联；
• 命令文件支持使用 $ARGUMENTS 参数占位符，在命令后面带上参数，如：/project:test 123 它会用 123 替换命令文件中的 $ARGUMENTS 标记。

比如如果有 .claude/commands/frontend/component.md 自定义命令，使用方法 就是：/project:frontend:component。

这里举一个较繁琐了示例：

Claude Code 自动修复 GitHub 上的 Issue

• 安装 gh CLIGitHub CLI 是用于从计算机的命令行使用 GitHub 的开源工具。 从命令行操作时，您可以使用 GitHub CLI 来节省时间并避免切换上下文。Claude Code 知道如何使用 gh CLI 和 GitHub 交互，可以创建问题、打开 pull request、读取评论等。没有安装 gh 时，Claude 仍然可以使用 GitHub API 或者 MCP 服务器（如果你已经安装的话）进行操作。已经有了 Claude ，当然你可以在 Claude Code CLI 中，使用提示词安装：
帮我安装 gh CLI，然后重启 Claude ，执行 gh --version 查看版本。
当然也可以用命令安装：
winget install --id GitHub.cli
若要向 GitHub 进行身份验证，请从终端运行以下命令。
gh auth login
选择要进行身份验证的位置：
• 如果通过 GitHub.com 访问 GitHub，请选择“GitHub.com”****。
• 如果通过其他域访问 GitHub，请选择“其他”，然后输入主机名（例如 octocorp.ghe.com）****。
• 自定义 issue 命令对应自己的一个项目工程提一个 issue （可以用 gh ，并使用中文）。对于重复的工作流程：调试循环、日志分析等。将提示词模板存储在 .claude/commands 文件夹的 Markdown 文件中。当你输入 / 时，这些会通过斜杠命令菜单变得可用。可以将这些命令检入 git，使其对团队的其他成员可用。自定义斜杠命令可以包含特殊关键子 $ARGUMENTS 来从命令调用传递参数。issue.md
请分析并修复 GitHub 问题：$ARGUMENTS

按照这些步骤：

1. 使用 'gh issue view' 获取问题详情
2. 理解问题中描述的问题
3. 搜索代码库中的相关文件
4. 实施必要的更改来修复问题
5. 编写并运行测试来验证修复
6. 确保代码通过代码检查和类型检查
7. 创建描述性的提交消息
8. 推送并创建 PR

记住对所有 GitHub 相关任务使用 GitHub CLI (`gh`)。


Please analyze and fix the GitHub issue: $ARGUMENTS.

Follow these steps:

1. Use `gh issue view` to get the issue details
2. Understand the problem described in the issue
3. Search the codebase for relevant files
4. Implement the necessary changes to fix the issue
5. Write and run tests to verify the fix
6. Ensure code passes linting and type checking
7. Create a descriptive commit message
8. Push and create a PR

Remember to use the GitHub CLI (`gh`) for all GitHub-related tasks.
将上述内容存放 .claude/commands/issue.md 中，使其 Claude 中作为 /project:issue 命令可用。然后便可以使用 issue 命令进行修复问题了。
插件

插件是新版本出的功能，其作用是，用插件共享你的 Claude Code 设置。

斜杠命令、代理、MCP 服务器和钩子都是可用于自定义 Claude Code 体验的扩展点。

看到用户构建了越来越强大的设置，希望与队友和更广泛的社区共享这些设置。因此便有了插件来简化这一切。

插件是一种轻量级的方式，用于打包和共享以下任意组合：

• 斜杠命令：为常用作创建自定义快捷键
• 子代理：为专门的开发任务安装专用代理
• MCP 服务器：通过模型上下文协议连接到工具和数据源
• 钩子：自定义 Claude Code 在其工作流程的关键点的行为

要使用市场中的插件，请运行 ，然后使用菜单浏览并安装插件。

/plugin marketplace add user-or-org/repo-name 
/plugin

如果你想开发插件，可以查看官网文档进行学习：插件 - Claude Docs

技能

Claude Skills 现在可以使用技能来改进其执行特定任务的方式。

技能是包含指令、脚本和资源的文件夹，Claude 可以在需要时加载这些说明、脚本和资源。

技能是比插件还新的功能，但是只适用于 Pro、Max、Team 和 Enterprise 用户。 因为自己无法使用，这里就做过多介绍了...

推荐网站：

讲了这么多，我们可以拿来注意，推荐两个网站：里面有许多现成的 agents、commands、settings、hooks、mcps、plugins、skills 可以是使用。

• https://www.aitmpl.com/
• https://claudecodemarketplace.com/
Claude Code 图形化工具

最后介绍一个Claude Code 图形化工具：opcode

opcode 是为 Claude Code 开发的桌面应用程序和工具套件，提供可视化界面管理 Claude Code 会话、创建自定义代理、运行后台代理等功能。

基于 Tauri 2 构建，旨在提升 AI 辅助开发的效率和体验。

官方网站：opcode - The Elegant Desktop Companion for Claude Code

GitHub 地址：https://github.com/winfunc/opcode

核心功能

项目和会话管理

• **可视化项目浏览器：**浏览所有 Claude Code 项目~/.claude/projects/
• 会话历史记录：查看和恢复具有完整上下文的过去的编码会话
• 智能搜索：使用内置搜索快速查找项目和会话
• 会话洞察：一目了然地查看第一条消息、时间戳和会话元数据

Claude Code 代理

• 自定义 AI 代理：使用自定义系统提示和行为创建专用代理
• 代理库：为不同任务构建专用代理的集合
• 后台执行：在单独的进程中运行代理以进行非阻塞作
• 执行历史记录：使用详细的日志和性能指标跟踪所有代理运行

使用情况分析仪表板

• 成本跟踪：实时监控您的 Claude API 使用情况和成本
• 代币分析：按模型、项目和时间段进行详细细分
• 可视化图表：显示使用趋势和模式的精美图表
• 导出数据：导出使用情况数据以进行会计和分析

MCP 服务器管理

• 服务器注册表：从中央 UI 管理模型上下文协议服务器
• 轻松配置：通过 UI 添加服务器或从现有配置导入
• 连接测试：使用前验证服务器连接
• Claude Desktop 导入：从 Claude Desktop 导入服务器配置

时间线和检查点

• 会话版本控制：在编码会话中的任何时间点创建检查点
• 可视化时间线：使用分支时间线浏览会话历史记录
• 即时恢复：一键跳回任何检查点
• 分叉会话：从现有检查点创建新分支
• 差异查看器：准确查看检查点之间的更改

CLAUDE.md 管理

• 内置编辑器：直接在应用程序内编辑 CLAUDE.md 文件
• 实时预览：实时查看渲染的 Markdown
• 项目扫描仪：查找项目中的所有 CLAUDE.md 文件
• 语法突出显示：通过语法突出显示完全支持降价
安装配置

系统要求

• 作系统：Windows 10/11、macOS 11+ 或 Linux （Ubuntu 20.04+）
• 内存：至少 4GB（推荐 8GB）
• 存储空间：至少 1GB 可用空间

平台依赖项

macOS 系统

# Install Xcode Command Line Tools
xcode-select --install

# Install additional dependencies via Homebrew (optional)
brew install pkg-config

Windows 系统

• 安装 Microsoft C++ 生成工具
• 安装 WebView2（通常预装在 Windows 11 上）

构建步骤：

# Install rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install bun
curl -fsSL https://bun.sh/install | bash

# 从源码构建
git clone https://github.com/getAsterisk/opcode.git
cd opcode
bun install
bun run tauri build

# bun run tauri build --debug                         // 调试构建
# bun run tauri build --target universal-apple-darwin  // macOS 的通用二进制文件






使用的话，这里就不讲了，如果感兴趣的小伙伴可以自行尝试。

---
*导入时间: 2026-01-17 22:14:16*
