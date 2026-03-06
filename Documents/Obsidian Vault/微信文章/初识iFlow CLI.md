---
title: "初识iFlow CLI"
source: wechat
url: https://mp.weixin.qq.com/s?__biz=MzU5Njg3ODUzOA==&mid=2247494137&idx=1&sn=ac052f1ce0e44da28b6b40355e69c03c&chksm=ff079f19b70fce1487a129e350ef386c65dc2174d2fe945c3d292b5ae1e4e4853da1df75b2e2&mpshare=1&scene=1&srcid=1203TfRmR47rW53XPS3GjV6t&sharer_shareinfo=baed8b4042a23c0eae40968f4af34ce7&sharer_shareinfo_first=baed8b4042a23c0eae40968f4af34ce7
author: 程序员小溪
pub_date: 2025年12月3日 00:36
created: 2026-01-17 20:45
tags: [AI, 编程]
---

# 初识iFlow CLI

> 作者: 程序员小溪 | 发布日期: 2025年12月3日 00:36
> 原文链接: [点击查看](https://mp.weixin.qq.com/s?__biz=MzU5Njg3ODUzOA==&mid=2247494137&idx=1&sn=ac052f1ce0e44da28b6b40355e69c03c&chksm=ff079f19b70fce1487a129e350ef386c65dc2174d2fe945c3d292b5ae1e4e4853da1df75b2e2&mpshare=1&scene=1&srcid=1203TfRmR47rW53XPS3GjV6t&sharer_shareinfo=baed8b4042a23c0eae40968f4af34ce7&sharer_shareinfo_first=baed8b4042a23c0eae40968f4af34ce7)

---

前言

小伙伴们大家好，我是小溪，见字如面。初次听说iFlow还是在使用 Claude Code Router时，依稀记得当时作者在文档上的标注是当前版本比较依赖iFlow，通过iFlow官网得知iFlow也提供了CLI，这次有时间特来体验一下。对其他CLI感兴趣的小伙伴也可以看往期内容：

Claude Code CLI初体验

Codex CLI初体验

Google百万Token上下文Gemini CLI，离AI自由更近一步

初识Qwen Code CLI

腾讯发布CodeBuddy Code CLI平替Claude Code?

当前使用版本

iflow cli 0.3.28

优势

完全免费使用

提供国内主流模型调用

限制

Node.js 20+

无法完全使用心流开发平台所有模型

官网

iFlow CLI 是一款终端AI助手，可以分析代码、执行编程任务、处理文件操作。本指南帮您快速上手核心功能。

官网开放平台地址：https://platform.iflow.cn

官网CLI地址：https://cli.iflow.cn

安装配置

macOS/Linux

# 一键安装脚本，会安装全部所需依赖
$ bash -c "$(curl -fsSL https://gitee.com/iflow-ai/iflow-cli/raw/main/install.sh)"
# 已有Node.js 20+
$ npm i -g @iflow-ai/iflow-cli@latest
# 更新
$ npm i -g @iflow-ai/iflow-cli@latest

Windows

$ npm install -g @iflow-ai/iflow-cli@latest

安装完成后，在命令行终端执行以下命令，可以输出版本号表示安装成功

$ iflow -v

申请API Key

用于 心流API Key、OpenAI Compatible API 及 其他AI工具 登录方式

在心流开发平台点击头像，在下拉菜单中选择【API Key管理】

点击【插件API密钥】创建一个新的API Key，点击【同意协议并生成】创建

创建完成后即可在API Key管理列表查看

登录授权

在命令行终端输入 iflow 启动 iFlow CLI，看到启动界面细心的小伙伴可能已经发现了，这个界面和Gemini CLI有点像哦😂（不要怀疑自己的眼睛，多半是魔改了）

iFlow CLI 支持 Login with iFlow、Login with iFlow ApiKey、OpenAI Compatible API 3种登录方式，不同方式提供的功能有所差异

Login with iFlow 登录（推荐）

强烈推荐使用 Login with iFlow 方式登录心流平台，享受最完整的功能体验，令牌自动刷新，永不过期

完整功能支持：

WebSearch 服务：智能网络搜索，获取最新信息

WebFetch 服务：网页内容抓取和分析

多模态能力：内置图像理解等多模态功能

工具调用优化：心流平台提供的模型经过专门优化，工具调用更加精准高效

选择【Login with iFlow】，在官网授权

心流 API Key 登录

API Key 有效期为 7 天，需定期更新

完整功能支持：

WebSearch 服务：智能网络搜索，获取最新信息

WebFetch 服务：网页内容抓取和分析

多模态能力：内置图像理解等多模态功能

工具调用优化：心流平台提供的模型经过专门优化，工具调用更加精准高效

在交互式命令中输入 /auth，选择【Login with iFlow ApiKey】

输入心流开放平台API Key

也可以在AI助手中使用，iFlow目前没有适配Claude Code CLI，直接使用会报错

想在Claude Code CLI中使用需要借助Claude Code Router工具，对Claude Code Router还不了解的小伙伴可以看往期内容：使用Claude Code Router轻松切换各种高性价比模型

配置完后就可以直接使用了

OpenAI Compatible API

适用于使用自有模型服务或其他兼容 OpenAI 协议的服务

功能限制：

不支持 WebSearch 服务

不支持 WebFetch 服务

不支持心流平台的内置多模态能力

无法享受心流平台模型的工具调用优化

在交互式命令中输入 /auth，选择【OpenAI Compatible API】

输入 OpenAi Base URL、API Key 和 模型名称

基本使用

命令行参数

在命令行终端输入 iflow -h 可以查看iFlow CLI提供的所有命令行指令

iflow：启动iFlow CLI，示例：iflow [query] 

iflow mcp：管理MCP服务，示例：iflow mcp list 

iflow commands：管理市场命令，示例：iflow commands list 

iflow agent：管理子代理，示例：iflow agent list 

iflow workflow：工作流管理

交互式命令

在交互式命令输入 / 可以查看终端命令信息，基本和Gemini CLI一致，这里只介绍有区别的，其他的参考往期：Google百万Token上下文Gemini CLI，离AI自由更近一步

/agents：代理管理

install：安装具有引导设置的新代理

list：查看所有可用代理

online：浏览并安装来自在线仓库的代理
refresh：更新源文件中的代理

/auth：切换授权方式

/cleanup-checkpoint：清除所有检查点历史记录并释放磁盘

/cleanup-history：清除当前项目的对话历史记录并释放磁盘空间

/commands：管理市场命令

add：添加命令

get：查看命令详情

list：命令列表

online：在交互式对话框中浏览在线市场的可用命令

remove：移除本地安装的命令

/demo：用于研究和头脑风暴的互动任务

/directory：管理工作区目录

/export：导出对话历史

/init：分析项目并生成定制的 IFLOW.md 文件

/language：切换语言

/log：查看会话日志

/mcp：MCP管理

auth：MCP授权

list：列出已配置的 MCP 服务器和工具

online：从在线存储库浏览和安装 MCP 服务器

refresh：刷新 MCP 服务器和工具列表，并重新加载设置文件

/output-style：更改输出风格偏好（参考了claude code）

/output-style:new：可视化创建一个风格偏好

/qa：基于知识库检索的智能问答

/update：更新版本

执行Shell

和Gemini CLI一样在交互式命令中输入 ! 可进入Shell模式执行Shell命令

配置文件

iFlow CLI延续了Gemini CLI的配置文件系统，提供了 .iflow/settings.json、.env、IFLOW.md 等配置文件，整体上和Gemini CLI的配置文件没有太大差异。

对话模式

iFlow CLI提供了 plan、default、accepting edits、YOLO 4种对话模式，使用【Shift+Tab】可以快速切换

plan：仅分析，不修改文件或执行命令

default：要求审批文件编辑或 shell 命令

accepting edits：自动批准文件编辑

YOLO：自动批准所有工具

和Qwen Code CLI功能类似，这里就不展开了，感兴趣的小伙伴可以看往期内容：初识Qwen Code CLI

模型切换

iFlow CLI提供了模型切换功能，在交互式命令中输入 /model 可以随时切换模型

自定义指令

iFlow提供了自定义指令也就是Claude Code中的自定义命令，iFlow CLI提供了多种安装自定义指令的方式

1）心流指令市场（推荐）

自定义指令市场：https://platform.iflow.cn/agents?type=commands&category=all

选择一个指令，点击【安装】获取安装命令

复制命令在命令行终端一键安装

安装完成后，在命令行终端输入 /iflow commands list 可以查看安装列表

2）在线安装

在交互式命令中执行 /commands online 可以在线浏览自定义指令市场

使用 ↑↓ 选择自定义指令， ←→ 翻页查看，使用对应的数字键进行安装

3）创建自定义指令

iFlow CLI自定义指令支持 TOML 和 Markdown 格式，好结合了 Gemini CLI和Claude Code CLI的特点，创建自定义指令的方式和其他主流CLI工具类似，在全局或者项目 iflow/commands 目录下新建一个 my-command.toml 文件，输入如下提示词即可

# 命令描述（必需）
description = "命令的简短描述"
# 命令提示词（必需）
prompt = """
发送给AI模型的完整提示词内容
支持多行文本和特殊占位符
"""

Markdown格式需要创建 my-command.md 文件，格式如下：

---
description: Create a git commit
---
## Context
- Current git status: !`git status`
- Current git diff (staged and unstaged changes): !`git diff HEAD`
- Current branch: !`git branch --show-current`
- Recent commits: !`git log --oneline -10`
## Your task
Based on the above changes, create a single git commit.

关于更详细的配置，感兴趣的小伙伴可以看官方文档：https://platform.iflow.cn/cli/examples/subcommand

在交互式命令中输入 /commands list 查看自定义指令列表

自定义工作流

iFlow提供的Workflow是整合 agents、commands、IFLOW.md 和 MCP 创建的完整自动化工作流程，相当于Claude Code中的插件系统，目前只提供了1种安装方式

1）心流工作流市场

心流工作流市场：https://platform.iflow.cn/agents?type=workflows&category=all

选择一个工作流，点击【安装】获取安装命令

复制命令在命令行终端一键安装

iFlow CLI暂时没有提供查看Workflow的指令，Workflow的具体使用方式可以在心流开放平台的工作流详情中查看

2）创建工作流

iFlow CLI创建工作流的方式就是直接打包拥有iFlow CLI配置文件结构的所有文件，也可以理解为一个项目就是一个工作流，安装时iFlow CLI会对文件进行合并

工作流创建完成后，直接在命令行终端执行如下命令打包工作流

$ zip -r your-workflow-name.zip . -x your-workflow-name.zip

这个命令打包以下内容：

压缩当前目录下的所有文件和文件夹（包括 .iflow 文件夹、项目文件、IFLOW.md 等）

包含隐藏文件（如 .iflow 目录）

排除生成的压缩包本身，避免递归包含

解压时保持原始目录结构，不会创建额外的目录层级

为了保证工作流的准确性，可以在命令行终端执行如下命令验证打包内容

$ unzip -l your-workflow-name.zip

验证没有问题后就可以上传到心流开放平台了，目前只支持通过心流平台分发。

Subagents

iFlow提供了Subagents功能，也提供了多种安装方式

1）心流Agent市场（推荐）

智能体市场：https://platform.iflow.cn/agents?type=agents&category=all

选择一个智能体，点击【安装】获取安装命令

复制命令在命令行终端一键安装

在命令行终端输入 /iflow agent list 可以查看安装列表

2）在线安装

在交互式命令中执行 /agents online 可以在线浏览Agents市场

使用 ↑↓ 选择Agents， ←→ 翻页查看，使用对应的数字键进行安装

3）创建Subagents

iFlow CLI创建Agents也有 2种 方式，可以使用交互式命令 /agents install 根据安装向导一步步安装

也可以自定义安装，在全局或者项目 iflow/agents 目录下新建一个 my-agent.md 文件，输入如下提示词

---
agentType: "custom-expert"
systemPrompt: "你是一个自定义领域的专家..."
whenToUse: "当需要处理特定领域任务时使用"
model: "GLM-4.6"
allowedTools: ["*"]
proactive: false
---
# Custom Expert Agent
这是一个自定义专家Agent的详细说明...

关于更详细的配置，感兴趣的小伙伴可以看官方Subagents文档：https://platform.iflow.cn/cli/examples/subagent#%E5%8F%AF%E9%80%89%E5%B1%9E%E6%80%A7

在交互式命令中输入 /agents list 查看Subagents列表

MCP服务

iFlow支持MCP服务，提供了多种安装方式

1）心流MCP市场（推荐）

访问心流MCP市场：https://platform.iflow.cn/mcp，找到MCP点击【安装】

复制命令在命令行终端一键安装

安装完成后，在命令行终端输入 /iflow mcp list 可以查看MCP安装列表

2）在线安装

在交互式命令中执行 /mcp online 可以在线浏览MCP市场，选择合适的MCP进行安装

使用 ↑↓ 选择MCP， ←→ 翻页查看，使用对应的数字键进行安装

3）命令行安装

iFlow CLI和其他主流CLI一样支持使用命令行安装，默认安装到项目作用域

$ iflow mcp add --transport http context7 https://mcp.context7.com/mcp
# 完整安装方式
$ iflow mcp add --transport http -s project context7 https://mcp.context7.com/mcp

如果需要全局安装MCP可以添加 -s user 或 --scope user 标识

$ iflow mcp add --transport http -s user context7 https://mcp.context7.com/mcp
$ iflow mcp add --transport http --scope user context7 https://mcp.context7.com/mcp

4）配置文件安装

在iFlow CLI中也可直接修改全局用户配置 ~/.iflow/settings.json 和 项目配置 .iflow/settings.json 直接添加MCP服务

Hooks

iFlow CLI提供了Hooks的支持，支持 用户配置 和 项目配置 2种配置层级

用户配置：~/.iflow/settings.json

项目配置：.iflow/settings.json

支持9大类Hooks类型，配置方式和Claude Code CLI基本一致。可以直接在 settings.json 文件中添加 hooks 配置项，完整配置如下：

{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "tool_pattern",
        "hooks": [
          {
            "type": "command",
            "command": "your_command",
            "timeout": 30
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "another_pattern",
        "hooks": [
          {
            "type": "command",
            "command": "cleanup_command"
          }
        ]
      }
    ],
    "SetUpEnvironment": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "python ~/.iflow/hooks/env_enhancer.py",
            "timeout": 30
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "echo 'Session ended'"
          }
        ]
      }
    ],
    "SubagentStop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "cleanup_subagent.sh"
          }
        ]
      }
    ],
    "SessionStart": [
      {
        "matcher": "startup",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'Session initialized'"
          }
        ]
      }
    ],
    "SessionEnd": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "python ~/.iflow/hooks/session_summary.py"
          }
        ]
      }
    ],
    "UserPromptSubmit": [
      {
        "matcher": ".*sensitive.*",
        "hooks": [
          {
            "type": "command",
            "command": "python ~/.iflow/hooks/content_filter.py"
          }
        ]
      }
    ],
    "Notification": [
      {
        "matcher": ".*permission.*",
        "hooks": [
          {
            "type": "command",
            "command": "logger 'iFlow permission request'"
          }
        ]
      }
    ]
  }
}

本人尝试了几个没有触发过😂。

总结

抛开iFlow CLI好用不好用之说，iFlow CLI首先免费就是一大优势，其次iFlow CLI应该是国内为数不多的在功能上基本追齐Claude Code CLI的CLI工具，自定义命令、自定义工作流、Subagnets、MCP、Hooks已是应由具有了，其次iFlow提供了对国人友好的各种工具的安装市场和详细的文档，是值得点赞的，在没有AI足够额度的情况还是可以作为代替使用的。

 




点击关注，及时接收最新消息

---
*导入时间: 2026-01-17 20:45:00*
