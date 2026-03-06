# Claude Code 国内安装配置及使用技巧参考指南

## 基本信息
- **标题**: Claude Code 国内安装配置及使用技巧参考指南
- **来源**: 微信公众号
- **作者**: 任侠001
- **发布时间**: 2025年09月18日
- **URL**: https://mp.weixin.qq.com/s/bx0AupVCYvjCWyiE3rGIdg
- **分类**: 技术教程
- **标签**: #AI #GitHub #工具推荐 #技术分析 #效率 #深度学习 #开源 #教程 #职场 #产品

## 内容摘要



 

字数 9825，阅读大约需 50 分钟

本文为近一段时间学习使用实践 Claude Code 所记录的一些内容，主要介绍Claude Code在国内环境下的安装配置和基本使用方法，以及相关的应用技巧和社区实践参考案例。

要全面的学习了解 Claude Code，建议先速读翻阅一遍Claude Code 官方文档[1]，以对基本概念有较为完整而准确的认知，然后再结合社区实践和开源项目案例亲自验证，进一步掌握实战性技巧。

1 Claude Code 简介

2025 年是 AI 大模型快速普及应用的关键节点，其中受益于顶级模型上下文 Token 容量的大幅度增加，AI 编程工具应...

## 完整内容




 

字数 9825，阅读大约需 50 分钟

本文为近一段时间学习使用实践 Claude Code 所记录的一些内容，主要介绍Claude Code在国内环境下的安装配置和基本使用方法，以及相关的应用技巧和社区实践参考案例。

要全面的学习了解 Claude Code，建议先速读翻阅一遍Claude Code 官方文档[1]，以对基本概念有较为完整而准确的认知，然后再结合社区实践和开源项目案例亲自验证，进一步掌握实战性技巧。

1 Claude Code 简介

2025 年是 AI 大模型快速普及应用的关键节点，其中受益于顶级模型上下文 Token 容量的大幅度增加，AI 编程工具应用迎来了爆发式增长。

在经历了 Cursor、Github Copilot 等 IDE 类智能编程工具持续火爆之后，Anthropic 开发的 Claude Code 作为一款终端类 AI 编程辅助工具，在 2025 下半年引领了新一波基于终端的 AI 编程工具热潮。区别于传统 IDE 集成的 AI 编程工具，Claude Code让您可以直接在终端中交互式编程，实现高效智能的编程体验。

*Claude Code 的核心能力：

• 从描述构建功能：用简单的自然语言告诉 Claude 你的需求，它会制定计划、编写代码并确保代码正常工作。
• 调试和修复问题：描述错误或粘贴错误消息，Claude Code 会分析你的代码库、识别问题并实施修复。
• 导航任何代码库：询问关于团队代码库的任何问题，获得深思熟虑的回答。Claude Code 保持对整个项目结构的感知，可以从网络获取最新信息，并通过 MCP 从 Google Drive、Figma 和 Slack 等外部数据源获取信息。

Claude Code 的主要特性包括：

• 终端集成：在终端中工作，可以与常见的测试套件、构建系统和版本控制工具（如 Git）无缝集成。这使得其使用方式具有非常强大的灵活性和扩展性。
• 持久化记忆：通过 claude.md 文件构建项目的全局语义图谱，实现持久化记忆。
• 自动化工作流：直接通过 CLI 执行复杂任务，支持多步骤操作分解，自动执行命令和文件修改；能够在执行操作前请求用户确认，确保安全性。
• 子代理系统‌(Sub-Agents)： 支持创建专业化子代理，每个子代理拥有独立的上下文窗口、自定义系统提示词和特定工具权限，实现任务隔离和专业化处理。
• MCP集成： Model Context Protocol(MCP)是连接LLM与数据源的开放标准，如同"AI应用程序的USB-C端口"，为远程控制提供了标准化接口。
• Hooks：hooks 是用户定义的 shell 命令，在 Claude Code 生命周期的各个点执行。Hooks 提供对 Claude Code 行为的确定性控制。
• 支持与 IDE 集成：通过与 VSCode 插件关联与IDE集成，可以在 IDE 实现快速启动Claude Code、代码差异查看、自动上下文选择、错误诊断共享等便捷功能。
• 无头模式：使用 -p 标志和提示启用无头模式，可以用于 CI、预提交钩子、构建脚本和自动化等非交互式环境。
• GitHub 集成：Claude Code 知道如何使用 gh CLI 与 GitHub 交互，用于创建问题、打开拉取请求、读取评论等。
• 自定义斜杠命令：内置多个斜杠命令，并支持自定义斜杠命令（将重复工作流程的提示模板存储在 .claude/commands 文件夹内的 Markdown 文件）
• 安全性管控：采用严格的基于权限的架构，支持细粒度的自定义工具调用的安全边界。
2 基于 Node.js 安装 Claude Code

系统要求

• Node.js ≥ 18.0（推荐LTS版本）
• 支持的操作系统：macOS、Linux、Windows

步骤 1：安装Node.js

Windows用户可从 Node.js 官网下载安装包并安装：https://nodejs.org/zh-cn/download/

macOS/Linux 用户可通过 Homebrew 快速安装：

# 安装Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)
# 通过Homebrew安装 Node.js
brew install node

验证是否安装成功，执行命令：node --version

步骤 2：基于 Node.js 安装 Claude Code

打开终端并执行命令：

# macOS/LInux 下可能需要使用 sudo 提权，例如：sudo npm install -g @anthropic-ai/claude-code
npm install -g @anthropic-ai/claude-code

# 安装后验证
claude --version

# 可每日执行一次以下命令以检查并更新 Claude Code 至最新版本
claude update
3 Claude Code 国内配置参考指南

如果你有 Anthropic 的 API Key 并且有全局开境外代理的条件，可以直接执行 claude 并按提示快速的配置账号信息。否则，需要手动配置 API Key 和 BASE_URL 以使用第三方代理模型形式使用 Claude Code。

国内使用 Cluade Code 推荐基础方案：

• 使用 CCR （Claude Code Router）工具配置以支持使用任意 OpenAI 兼容的 API 平台；
• 简单使用学习：结合注册魔塔社区、心流平台(iflow.cn)账号以免费使用 GLM-4.5、kimi-k2 等顶级模型；
• 深度使用作为生产力工具：购买智谱 GLM-4.5、月之暗面 Kimi-K2 等顶级模型优惠包月套餐。
3.1 两种配置 API Key 和自定义 BADE_URL 的方式

可有两种方式自定义配置 API Key：一是设置环境变量，二是修改 Claude 配置文件。

方式一：设置环境变量

# macOS/Linux 下设置环境变量方式：
export ANTHROPIC_BASE_URL='https://api.anthropic.com'# 自定义 BASE_URL
export ANTHROPIC_AUTH_TOKEN='your_api_key'# 自定义 API Key
export ANTHROPIC_MODEL='claude-opus-4-20250514'# 自定义默认使用的模型
export ANTHROPIC_SMALL_FAST_MODEL='claude-3-5-haiku-20241022'# 自定义快速模型：经实践发现，Claude Code 绝大多数场景下都是调用快速的小模型

# Windows cmd 命令提示符下设置环境变量方式：
set ANTHROPIC_BASE_URL=https://api.anthropic.com
set ANTHROPIC_AUTH_TOKEN=your_api_key
set ANTHROPIC_MODEL='claude-opus-4-20250514'
set ANTHROPIC_SMALL_FAST_MODEL='claude-3-5-haiku-20241022'

# Windows PoewrShell 下设置环境变量方式：
$env:ANTHROPIC_BASE_URL="https://api.anthropic.com"
$env:ANTHROPIC_AUTH_TOKEN="your_api_key"
$env:$ANTHROPIC_MODEL='claude-opus-4-20250514'
$env:$ANTHROPIC_SMALL_FAST_MODEL='claude-3-5-haiku-20241022'

方式二：修改配置文件

• macOS/Linux 下全局配置文件路径: ~/.claude/settings.json
• Windows 下全局配置文件路径: C:\Users\用户名\.claude\settings.json

内容格式：

{
  "env": {
    "ANTHROPIC_BASE_URL": "https://api.anthropic.com",
    "ANTHROPIC_AUTH_TOKEN": "your_api_key"
  }
}

此外，还可以在项目根目录下创建 .claude/settings.json 文件实现项目级的个性化配置，其优先级高于全局文件的配置。

也可以通过命令行方式达到修改配置文件的目的，示例：

claude config set --global env '{"ANTHROPIC_MODEL": "claude-opus-4-20250514"}'
• 详细参考： https://docs.anthropic.com/zh-CN/docs/claude-code/settings
3.2 国内支持 Claude Code 的三方平台 API 及配置方法参考

Claude 官方模型对中国区域不可用，可以通过科学上网方式使用美国地区的全局代理以绕过封控。

此外，有多种国内可访问的大模型 API 平台提供了对 Claude Code 的兼容支持， 如智谱 AI、Moonshot（Kimi）、第三方API聚合平台等。另外，还可以通过 CCR（Claude Code Router）等第三方插件工具配置使用任意与 OpenAI  API 兼容的大模型平台。

以下为常见大模型 API 平台设置 API Key 的格式参考。这里以环境变量配置为例，您也可以以配置文件形式设置到 .claude/settings.json 文件的 env 字段中。

官方Anthropic API：

export ANTHROPIC_BASE_URL=https://api.anthropic.com
export ANTHROPIC_AUTH_TOKEN=your_api_key

智谱AI(Zhipu)：

*智谱AI的 GLM-4.5 模型搭配 Claude Code 拥有不错的口碑。不过免费账户由于限速原因基本没法使用，官方提供了低价包月套餐可供选择。
注册并获取自己的API密钥：https://www.bigmodel.cn/invite?icode=TY4kHajmj2PV8KLUkl97jP2gad6AKpjZefIo3dVEQyA%3D

# 参考：https://docs.bigmodel.cn/cn/guide/develop/claude
# 默认使用模型为 GLM-4.5 和 GLM-4.5-Air，具体根据任务复杂程度自动路由，兼顾性能、速度与价格，暂不支持其它模型
# 免费账户有请求频率限制，可能会出现 429 超频访问报错。官方提供了包月使用 Claude Code 的套餐，可前往官网了解：https://bigmodel.cn/claude-code
export ANTHROPIC_BASE_URL="https://open.bigmodel.cn/api/anthropic"
export ANTHROPIC_AUTH_TOKEN="your_api_key"
export ANTHROPIC_MODEL="GLM-4.5"
export ANTHROPIC_SMALL_FAST_MODEL="GLM-4.5-Air"

Moonshot(Kimi)配置：

Moonshot 的 kimi-k2-0905 模型搭配 Claude Code 也有不错的口碑。官方近期提供有 5 折优惠的活动。
注册并获取自己的API秘钥：https://platform.moonshot.cn/console

# 注意：免费用户每分钟仅3次调用(RPM)，容易出现 429 错误，建议充值50元以上以获得更高的 RPM
# 参考： https://platform.moonshot.cn/docs/guide/agent-support#在-claude-code-中使用-kimi-k2-模型
export ANTHROPIC_BASE_URL=https://api.moonshot.cn/anthropic
export ANTHROPIC_AUTH_TOKEN=${YOUR_MOONSHOT_API_KEY}     # 请替换 API Key
export ANTHROPIC_MODEL="kimi-k2-turbo-preview"             # 启动高速版 kimi-k2-turbo-preview 模型。可以自行修改所需模型，目前仅支持非思考模型
export ANTHROPIC_SMALL_FAST_MODEL="kimi-k2-turbo-preview"

魔塔社区 API 配置：

魔塔社区提供了每天 2000 次的大模型API免费调用额度（可到模型库挑选，包括了 GLM-4.5 等顶级模型），可以满足大部分基础使用需求。

注册魔塔社区并获取自己的API秘钥：https://www.modelscope.cn/my/myaccesstoken

# 相关参考： https://www.modelscope.cn/docs/model-service/API-Inference/intro
export ANTHROPIC_BASE_URL='https://api-inference.modelscope.cn'
export ANTHROPIC_AUTH_TOKEN='ms-b3ead...' # 请替换为自己的 API Key
export ANTHROPIC_MODEL='Qwen/Qwen3-Coder-480B-A35B-Instruct' # 设置默认模型，这里以 qwen3-coder 为例
# export ANTHROPIC_MODEL='ZhipuAI/GLM-4.5' # GLM-4.5 示例
export ANTHROPIC_SMALL_FAST_MODEL='Qwen/Qwen3-Coder-480B-A35B-Instruct'

DeepSeek API 配置：

在 DeepSeek-V3.1 发布之后，DeepSeek 也增加支持了 Claude Code 的 API 调用。

# 参考：https://api-docs.deepseek.com/zh-cn/guides/anthropic_api
export ANTHROPIC_BASE_URL=https://api.deepseek.com/anthropic
export ANTHROPIC_AUTH_TOKEN=${DEEPSEEK_API_KEY}
export API_TIMEOUT_MS=600000
export ANTHROPIC_MODEL=deepseek-chat
export ANTHROPIC_SMALL_FAST_MODEL=deepseek-chat

硅基流动 API 配置：

注册并获取自己的API密钥：https://cloud.siliconflow.cn/i/hDM9hDR6

# 参考： https://docs.siliconflow.cn/cn/usercases/use-siliconcloud-in-ClaudeCode
export ANTHROPIC_BASE_URL="https://api.siliconflow.cn"
export ANTHROPIC_API_KEY="YOUR_SILICONCLOUD_API_KEY"    # 请替换 API Key
export ANTHROPIC_MODEL="moonshotai/Kimi-K2-Instruct"    # 可以自行修改所需模型，目前仅支持非思考模型

OpenRouter API 配置：

注册/搜索免费模型：https://openrouter.ai/models?q=free

# 参考： https://docs.openrouter.ai/docs/claude-code
export ANTHROPIC_BASE_URL="https://api.openrouter.ai"
export ANTHROPIC_API_KEY="YOUR_OPENROUTER_API_KEY"       # 请替换 API Key
export ANTHROPIC_MODEL="z-ai/glm-4.5-air:free"           # 指定使用 free 模型

星辰心流 API 配置：

注册并获取自己的API密钥：https://platform.iflow.cn/docs/api-key-management

星辰心流是阿里旗下的AI搜索助手，当前提供免费的国内模型 API 调用。可结合 CCR（后文介绍）配置使用（推荐）。

其他第三方 LLM API 聚合平台：

一些基于开源项目 NewAPI 搭建的 LLM API 聚合平台，可以提供 Claude 模型调用（真假可通过 API 调用自行识别），并且为了推广大都会提供一定的免费额度。

NewAPI 的搭建非常简单，使得许多个人都可以搭建自己的 API 聚合平台并对外开放赚钱，但也因此给大家提供了大量薅羊毛的可能性。

以下是一些此类的 API 聚合平台参考（注册送免费额度，使用邀请注册可获得额外额度），请视情况选择适合自己的服务，并参考其提供的文档进行配置：

• Your API https://yourapi.cn/register?aff=Cx3T 低价稳定的 API 聚合代理平台。注册送一定的体验额度，可通过邀请获取额外额度。
• Any Router TOP API https://anyrouter.top/register?aff=izHZ 公益站点不支持充值，仅可通过邀请获取额度！注册送 50 元额度，邀请送 50 元额度。
• 青云聚合API https://api.qingyuntop.top/register?aff=U0Mv 低价充值使用顶级模型。邀请充值后获得奖励。
• 灵客 API https://api.aaaaapi.com/register?aff=r0sK 低价充值使用顶级模型。邀请充值后获得奖励。
3.3 通过 CCR （Claude Code Router）配置和使用 Claude Code

CCR（Claude Code Router）是一个开源项目，旨在为 Claude Code 提供一个可扩展的路由系统，支持通过配置文件的方式，将 Claude Code 的请求转发到不同的 API 服务，从而实现支持任意 LLM API 平台的接入，并支持更多个性化的可配置能力特性，例如：

• 模型路由：根据您的需求将请求路由到不同的模型（比如：后台任务、思考、长上下文）。
• 多提供商支持：支持 OpenRouter、DeepSeek、Ollama、Gemini、Volcengine 和 SiliconFlow 等各种模型提供商。
• 请求/响应转换：使用转换器为不同的提供商自定义请求和响应。
• 动态模型切换：在 Claude Code 中使用 /model 命令动态切换模型。
• GitHub Actions 集成：在您的 GitHub 工作流程中触发 Claude Code 任务。
• 插件系统：使用自定义转换器扩展功能。

安装和配置 CCR：

在安装了 Claude Code 后，执行如下命令全局安装 CCR：

# 全局安装或更新 CCR
npm install -g @musistudio/claude-code-router

然后创建配置文件 ~/.claude-code-router/config.json，内容格式参考如下：

{
  "HOST":"0.0.0.0",
// "APIKEY": "your-secret-key",
// "PROXY_URL": "http://127.0.0.1:7890",
"LOG":true,
"API_TIMEOUT_MS":600000,
"NON_INTERACTIVE_MODE":false,
"Providers":[
    {
      "name":"openrouter",
      "api_base_url":"https://openrouter.ai/api/v1/chat/completions",
      "api_key":"sk-xxx",
      "models":[
        "google/gemini-2.5-pro-preview",
        "anthropic/claude-sonnet-4",
        "anthropic/claude-3.5-sonnet",
        "anthropic/claude-3.7-sonnet:thinking"
      ],
      "transformer":{
        "use":["openrouter"]
      }
    },
    {
      "name":"deepseek",
      "api_base_url":"https://api.deepseek.com/chat/completions",
      "api_key":"sk-xxx",
      "models":["deepseek-chat","deepseek-reasoner"],
      "transformer":{
        "use":["deepseek"],
        "deepseek-chat":{
          "use":["tooluse"]
        }
      }
    },
    {
      "name":"ollama",
      "api_base_url":"http://localhost:11434/v1/chat/completions",
      "api_key":"ollama",
      "models":["qwen2.5-coder:latest"]
    },
    {
      "name":"gemini",
      "api_base_url":"https://generativelanguage.googleapis.com/v1beta/models/",
      "api_key":"sk-xxx",
      "models":["gemini-2.5-flash","gemini-2.5-pro"],
      "transformer":{
        "use":["gemini"]
      }
    },
    {
      "name":"volcengine",
      "api_base_url":"https://ark.cn-beijing.volces.com/api/v3/chat/completions",
      "api_key":"sk-xxx",
      "models":["deepseek-v3-250324","deepseek-r1-250528"],
      "transformer":{
        "use":["deepseek"]
      }
    },
    {
      "name":"modelscope",
      "api_base_url":"https://api-inference.modelscope.cn/v1/chat/completions",
      "api_key":"",
      "models":["Qwen/Qwen3-Coder-480B-A35B-Instruct","Qwen/Qwen3-235B-A22B-Thinking-2507"],
      "transformer":{
        "use":[
          [
            "maxtoken",
            {
              "max_tokens":65536
            }
          ],
          "enhancetool"
        ],
        "Qwen/Qwen3-235B-A22B-Thinking-2507":{
          "use":["reasoning"]
        }
      }
    },
    {
      "name":"dashscope",
      "api_base_url":"https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
      "api_key":"",
      "models":["qwen3-coder-plus"],
      "transformer":{
        "use":[
          [
            "maxtoken",
            {
              "max_tokens":65536
            }
          ],
          "enhancetool"
        ]
      }
    },
    {
      "name":"aihubmix",
      "api_base_url":"https://aihubmix.com/v1/chat/completions",
      "api_key":"sk-",
      "models":[
        "Z/glm-4.5",
        "claude-opus-4-20250514",
        "gemini-2.5-pro"
      ]
    }
],
"Router":{
    "default":"deepseek,deepseek-chat",
    "background":"ollama,qwen2.5-coder:latest",
    "think":"deepseek,deepseek-reasoner",
    "longContext":"openrouter,google/gemini-2.5-pro-preview",
    "longContextThreshold":60000,
    "webSearch":"gemini,gemini-2.5-flash"
}
}

以上示例通过 Providers 字段配置了多个不通的模型提供商平台，其中 api_key 请替换为自己的。Claude Code Router 可以配置市面上任意大模型，包括 Ollama 本地运行的模型。

需要注意的是，更为简单直观的配置方式是执行 ccr ui 命令，然后通过浏览器打开管理界面进行配置，如下图所示：

CCR 管理界面
• 详细参考：https://github.com/musistudio/claude-code-router/blob/main/README_zh.md

**使用 CCR 运行 Claude Code：**在具体项目目录下执行 ccr code 命令即可，它会预设好环境变量并启动 Claude Code。

总的来说，CCR 提供了一种更为灵活、低成本、可扩展的 Claude Code 使用方式。

3.4 基于 Claude Code Proxy 使用 Claude Code

Claude Code Proxy[2] 是一个开源项目，用于解决 Claude Code 与 OpenAI 兼容 API 之间的互操作性问题。

CCP 与 CCR 的工作原理基本一致，即通过代理转换 OpenAI 兼容 API 为 Claude Code 可以直接使用的 API，从而实现与 OpenAI 兼容 API 的无缝集成。故使用 CCP 需要两步：

1. 本地安装部署 CCP 服务并配置 OpenAI 兼容的 LLM API Key。
2. 设置环境变量 ANTHROPIC_BASE_URL 为 CCP 启动的服务访问地址。

请参考其官方文档了解详细的安装配置和使用方法：https://github.com/fuergaosi233/claude-code-proxy/blob/main/README.md

3.5 基于 copilot-api 代理使用 Claude Code 解锁 Opus 高级规划模型

Claude Code 的 opusplan 模型很强，但 Pro 用户用不了 Opus 模型，Max 订阅很贵。但是 GitHub Copilot 平台支持 Claude 4 的各个模型，它的月付费用也便宜了许多，于是给了大家另一种选择。

Copilot API[3] 是一个开源项目，通过它可以启动用一个将 GitHub Copilot API 转换为与 OpenAI/Anthropic API 兼容的服务器。可与 Claude Code 一起使用！

具体使用方法参考如下。

1. 安装并运行 copilot-api：
# 安装 copilot-api
npm install -g copilot-api

# 登录授权
copilot-api auth

# 启动 copilot-api
copilot-api start
2. 设置 Claude Code 相关环境变量配置：
export ANTHROPIC_BASE_URL="http://localhost:4141"
export ANTHROPIC_AUTH_TOKEN="dummy"
# export ANTHROPIC_MODEL="claude-sonnet-4"
# export ANTHROPIC_SMALL_FAST_MODEL="gpt-5-mini"
export ANTHROPIC_MODEL="opusplan"
export ANTHROPIC_DEFAULT_SONNET_MODEL="claude-sonnet-4"
export ANTHROPIC_DEFAULT_OPUS_MODEL="claude-opus-4"
export DISABLE_NON_ESSENTIAL_MODEL_CALLS="1"
export CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC="1"

claude

相关参考：Claude Code with Github Copilot as Model Provider[4]

3.6 基于 Cherry Studio 代理使用 Claude Code

如果你已经习惯了使用 Cherry Studio[5]，那么可以试一试它新增的代码工具功能模块。该模块支持基于 Bun[6] 工具代理运行当前流行的 CLI 编程工具，包括：Claude Code、Qwen Code、Gemini CLI、OpenAI Codex 等。在它的代码工具界面，只需要选择CLI工具、要使用的模型以及项目工作目录等必要信息，然后点击启动按钮即可一键运行指定的 CLI 编程工具，极大简化了此类工具的上手难度，对于非程序员来说十分友好。当前仅支持智普和 Kimi 等平台 API 本身支持 Claude Code 的模型，后续版本可能会增加对 OpenAI 兼容 API 的转换支持。

Cherry Studio 代码工具
4 Claude Code 基本功能与使用简介

本部分对 Claude Code 的基本功能与使用进行介绍，让您能够快速对齐有一个大概的认识。若要具体的学习和使用它，建议你仔细完整的阅读一遍Claude Code官方文档[7]。

4.1 Claude Code 常用配置及命令
• 基本配置
• 修改默认模型：claude config set -g model claude-sonnet-4
• 打开详细输出：claude config set -g verbose true
• 修改输出格式：claude config set -g outputFormat text
• 测试安装：claude /doctor
• 安全设置
• 不发统计：export DISABLE_TELEMETRY=1
• 不报错日志：export DISABLE_ERROR_REPORTING=1
• 节约token：export DISABLE_NON_ESSENTIAL_MODEL_CALLS=1
• 限制工具：claude config set allowedTools "Edit,View"
• 跳过信任对话框：claude config set hasTrustDialogAccepted
• 跳过项目引导：claude config set hasCompletedProjectOnboarding
• 忽略敏感文件：claude config set ignorePatterns
• 全局设置：claude config set --global
• 基本命令
• 进入交互模式：claude
• 更新至最新版：claude update
• 启动 MCP：claude mcp
• 继续最近的对话：claude --continue
• 显示对话选择器：claude --resume [sessionId]
• 执行处理后打印响应并退出：claude -p "query"
• 进阶使用
• 激活 bypassPermissions 模式：claude --dangerously-skip-permissions
• 使用计划模式：claude --permission-mode plan

CLI 命令：

命令
	
描述
	
示例

claude	
启动交互式 REPL
	claude
claude "query"	
使用初始提示启动 REPL
	claude "explain this project"
claude -p "query"	
通过 SDK 查询，然后退出
	claude -p "explain this function"
cat file | claude -p "query"	
处理管道内容
	cat logs.txt | claude -p "explain"
claude -c	
继续最近的对话
	claude -c
claude -c -p "query"	
通过 SDK 继续
	claude -c -p "Check for type errors"
claude -r "<session-id>" "query"	
通过 ID 恢复会话
	claude -r "abc123" "Finish this PR"
claude update	
更新到最新版本
	claude update
claude mcp	
配置模型上下文协议 (MCP) 服务器
	
请参阅 Claude Code MCP 文档[8]。

CLI 标志：

使用这些命令行标志自定义 Claude Code 的行为。

标志
	
描述
	
示例

--add-dir	
添加额外的工作目录供 Claude 访问（验证每个路径是否作为目录存在）
	claude --add-dir ../apps ../lib
--allowedTools	
除了 settings.json 文件[9] 之外，应该在不提示用户许可的情况下允许的工具列表
	"Bash(git log:*)" "Bash(git diff:*)" "Read"
--disallowedTools	
除了 settings.json 文件[10] 之外，应该在不提示用户许可的情况下禁止的工具列表
	"Bash(git log:*)" "Bash(git diff:*)" "Edit"
--print
, -p
	
打印响应而不使用交互模式（有关编程使用详细信息，请参阅 SDK 文档[11]）
	claude -p "query"
--append-system-prompt	
附加到系统提示（仅与 --print 一起使用）
	claude --append-system-prompt "Custom instruction"
--output-format	
指定打印模式的输出格式（选项：text、json、stream-json）
	claude -p "query" --output-format json
--input-format	
指定打印模式的输入格式（选项：text、stream-json）
	claude -p --output-format json --input-format stream-json
--include-partial-messages	
在输出中包含部分流事件（需要 --print 和 --output-format=stream-json）
	claude -p --output-format stream-json --include-partial-messages "query"
--verbose	
启用详细日志记录，显示完整的逐轮输出（在打印和交互模式下都有助于调试）
	claude --verbose
--max-turns	
限制非交互模式下的代理轮数
	claude -p --max-turns 3 "query"
--model	
使用最新模型的别名（sonnet 或 opus）或模型的全名为当前会话设置模型
	claude --model claude-sonnet-4-20250514
--permission-mode	
在指定的 权限模式[12] 下开始
	claude --permission-mode plan
--permission-prompt-tool	
指定一个 MCP 工具来处理非交互模式下的权限提示
	claude -p --permission-prompt-tool mcp_auth_tool "query"
--resume	
通过 ID 恢复特定会话，或在交互模式下选择
	claude --resume abc123 "query"
--continue	
加载当前目录中最近的对话
	claude --continue
--dangerously-skip-permissions	
跳过权限提示（谨慎使用）
	claude --dangerously-skip-permissions

--output-format json 标志对于脚本编写和自动化特别有用，允许您以编程方式解析 Claude 的响应。

有关打印模式（-p）的详细信息，包括输出格式、流式传输、详细日志记录和编程使用，请参阅 SDK 文档[13]。

4.2 Claude Code 常用斜杠命令（Slash Commands）

在执行 claude 命令进入交互模式后，可以输入 / 查看支持的斜杠命令列表，如下图所示：

Claude Code 常用斜杠命令
• 常用命令
• /add-dir 添加额外的工作目录
• /agnets 子代理配置管理
• /bashes 查看和管理后台执行中的任务
• /feedback 反馈问题
• /clear 清除对话历史。在切换到新任务时清空上下文，能让 AI 更专注于当前问题。
• /config 查看和修改配置
• /context 以可视化的表格形式查看上下文大小（若上下文过大，可以考虑使用 /compact 命令来压缩上下文）
• /cost 查看 token 令牌使用统计
• /doctor 检查您的 Claude Code 安装的健康状况
• /exit 退出
• /export 将当前会话导出到文件或剪切板中
• /help 获取使用帮助
• /hooks 查看和修改基于 tools 事件的钩子配置
• /ide 管理 IDE 集成和查看集成状态（和 Claude Code VSCode 插件一起使用）
• /login 切换 Anthropic 账户
• /logout 从您的 Anthropic 账户登出
• /mcp 管理 MCP 服务器连接和 OAuth 身份验证
• /model 选择或更改 AI 模型
• /permissions 查看或更新权限
• /pr_comments 查看 PR(拉取请求)评论
• /resume 恢复会话。如果不小心退出会话，可以用 /resume 命令加载之前的对话，防止丢失工作。
• /review 请求代码审查
• /sessions 列出 sessions
• /status 查看账户和系统状态，包括版本、模型、账号等信息
• /terminal-setup 安装 Shift+Enter 键绑定用于换行（仅限 iTerm2 和 VSCode）
• /vim 进入 vim 模式，在插入和命令模式之间切换
• 记忆管理
• /compact [instructions] 压缩对话，可选择性地提供重点指令。
• /init 初始化项目，生成 CLAUDE.md 文件。它会自动加载到新会话的上下文中，故需注意其内容大小的管理，尽量只保留关键指令。
• /memory 编辑长期记忆文件 CLAUDE.md。
4.3 Claude Code 集成 MCP

添加 MCP 工具服务能够让 Claude 简单快捷的连接外部服务、数据库、专用数据 API 等，大幅度的扩展其能力边界。

基本命令：

• claude mcp list：列出 MCP 服务
• claude mcp add：添加 MCP 服务
• claude mcp remove：移除 MCP 服务

一个典型的案例如：添加 Jira MCP[14] 服务，让 Claude 访问 Jira 的数据，实现从 JIRA 问题跟踪器获取功能描述并完成需求。

# 添加 JIRA MCP 服务
claude mcp add --transport sse atlassian https://mcp.atlassian.com/v1/sse

添加了 JIRA MCP 服务后，您可以使用自然语言要求 Claude Code 完成指定任务。示例：添加 JIRA 问题 MBDP-4521 中描述的功能，完成后提交并创建 PR

适合编程开发使用的 MCP 服务参考：

• @executeautomation/playwright-mcp-server[15]：使用 Playwright 运行浏览器自动化任务，让AI大模型能够通过结构化数据与网页进行交互，实现自动化操作，无需依赖视觉模型或截图识别。
• 添加命令：claude mcp add playwright -s user -- npx @playwright/mcp@latest
• @modelcontextprotocol/server-sequential-thinking[16]：（分步思维）通过结构化思维过程提供动态和反思性问题解决的工具，是一种结构化的思考与问题解决框架，适用于复杂、开放式任务。示例：claude "帮我规划电商订单处理系统的开发步骤，使用Sequential Thinking工具"
• 添加命令：claude mcp add sequential_thinking -s user -- npx @modelcontextprotocol/server-sequential-thinking
• @upstash/context7-mcp[17]：获取正确有效的编程语言、依赖工具库的文档，减少 AI 写代码的幻觉。
• 添加命令：claude mcp add context7 -s user -- npx @upstash/context7-mcp
• 秘塔搜索MCP[18] 使用 GLM4.5 等第三方模型时不支持联网搜索。秘塔搜索每天有100免费搜索额度，MCP可补齐该短板。
• 添加命令：claude mcp add --transport http metaso https://metaso.cn/api/mcp --header "Authorization: Bearer 你的API密钥"
4.4 Sub Agents 子代理

Claude Code 支持Sub Agents[19]多子代理模式。在主对话模式下，遇到与子代理专业知识匹配的任务时，它可以将该任务委托给专门的子代理，该子代理独立工作并返回结果。

进入 Claude 后，输入斜杠命令 /agents，然后按提示依次操作即可创建一个子代理。该过程最终会在 .calude/agents 目录下生成一个 .md 文件，之后你可以通过修改它的内容来修改子代理配置，所以如果已经对子代理结构比较熟悉，也可以直接在该目录下创建符合子代理格式规则的 .md 文件手动的创建子代理。

Sub Agents 的主要特点：

• 每一个子代理都是以单独的 .md 文件配置保存于 .calude/agents 目录下。
• 在头部以 yaml 格式定义子代理关键信息，包含name、description、tools等字段。主对话通过这些信息以确定在合适的时机调用子代理执行独立任务。
• 子代理的上下文是独立的，与主对话分离，且不会相互干扰。
• 主对话可以创建多个子代理，每个子代理独立运行完成特定任务，但子代理不可以创建其他子代理。

Sub Agents 是让 Claude Code 能够支持长时间无间断地完成复杂开发任务的功能。下面是一些关于子代理实战案例与技巧参考：

• Claude Code Sub Agent完全指南：构建你的专属编程团队
• Sub-Agents怎么玩？一文看懂核心逻辑与应用场景
• 图解Claude Code高级用法(一)：用Subagents打造你的一整支“专业团队”
4.5 激活 bypassPermissions 模式

Claude Code 默认使用严格的只读权限。当需要额外操作时（编辑文件、运行测试、执行命令），Claude Code会请求明确权限。这使得需要用户时常介入和确认。

若希望不考虑安全性让它全自动运行，例如让其在虚拟机、Docker 镜像等环境下工作，可以按如下方式激活 bypassPermissions 模式。

方式一，使用 --dangerously-skip-permissions 命令行参数来绕过所有权限检查：

claude --dangerously-skip-permissions

方式二，可以通过修改 settings.json 配置文件的方式设置为默认启用：

{
  "permissions": {
    "defaultMode": "bypassPermissions"
  }
}

以 Docker 容器运行 Node.js 环境的简单示例：

docker pull node:22-alpine
# Create a Node.js container and start a Shell session:
docker run -it --rm -v /host/path:/container/path  --entrypoint sh node:22-alpine
node -v

# 安装 Claude Code
npm install -g @anthropic-ai/claude-code
# 配置 Claude Code，并进入 bypassPermissions 模式
claude --dangerously-skip-permissions

Claude Code 官方文档推荐的一种方案是基于 DevContainer 和 VSCode 来创建一个预配置的开发容器。VSCode Dev Containers 扩展允许你使用 Docker 容器作为功能齐全的开发环境。它允许你在容器中打开任何文件夹或存储库，并利用 Visual Studio Code 的全部功能。

关于 VSCode Dev Containers 的更多信息请参考：

• 开发容器[20]
• Claude Code DevContainer 设置[21]
• VSCode: Developing inside a Container[22]
4.6 Claude Code 与 VSCode 集成
• 在 VSCode 中搜索并安装 Claude Code for VSCode 扩展。
• 在 VSCode 的集成终端中运行 claude 命令。
• 输入 /ide 命令，将 VSCode 选为链接的 IDE。

在 VSCode 中完成集成后可以实现：

• 差异查看：在 IDE 中查看代码 diff 差异。
• 自动选择上下文：IDE 中的当前选择、标签页自动与 Claude Code 共享，从而可以便捷的选择为上下文。
• 诊断共享：IDE 中的错误信息自动与 Claude Code 共享，从而可以便捷地修复错误。
Claude Code 与 VSCode 集成：差异查看
4.7 使用 Claude Code Hooks

Claude Code Hooks 是用户定义的 shell 命令，在 Claude Code 生命周期的各个点执行。Hooks 提供对 Claude Code 行为的确定性控制，确保某些操作总是发生，而不是依赖 LLM 选择运行它们。

Claude Code 提供了几个在工作流程不同点运行的 hook 事件，每个事件接收不同的数据，并可以以不同的方式控制 Claude 的行为。它们是：

• PreToolUse：在工具调用之前运行（可以阻止它们）
• PostToolUse：在工具调用完成后运行
• UserPromptSubmit：当用户提交提示时运行，在 Claude 处理之前
• Notification：当 Claude Code 发送通知时运行
• Stop：当 Claude Code 完成响应时运行
• SubagentStop：当子代理任务完成时运行
• PreCompact：在 Claude Code 即将运行压缩操作之前运行
• SessionStart：当 Claude Code 开始新会话或恢复现有会话时运行
• SessionEnd：当 Claude Code 会话结束时运行

您可以通过斜杠命令 /hooks 以交互方式创建和管理 Hooks，也可以在配置文件 .claude/settings.json 中直接编辑配置。

一个 Hooks 配置示例如下，它的功能为在文件被编辑后执行 npx prettier 以格式化文件：

{
  "hooks":{
    "PostToolUse":[
      {
        "matcher":"Edit|MultiEdit|Write",
        "hooks":[
          {
            "type":"command",
            "command":"jq -r '.tool_input.file_path' | { read file_path; if echo \"$file_path\" | grep -q '\\.ts$'; then npx prettier --write \"$file_path\"; fi; }"
          }
        ]
      }
    ]
}
}
5 Claude Code 实战应用及技巧
5.1 基本使用案例参考

Claude Code 是您的 AI 结对编程伙伴，你只需要像与同事交谈一样与它对话：描述您想要实现的目标，它将帮助您达到目标。Claude Code 不仅仅会分析需求和生成代码，还会根据你的需求决定运行什么命令或调用什么工具来解决问题。

智能代码生成：

claude "用Python实现一个快速排序算法，要求添加详细注释"

# 生成用户登录功能
claude "实现基于JWT的用户认证系统"

# 带测试用例
claude "实现用户登录功能 --test"

代码分析与优化：

claude "分析当前目录下的src/app.js文件，找出性能瓶颈并提供优化建议"

代码审查：

claude 'review my changes and suggest improvements'

# 打印响应后退出
claude -p "review this code for potential bugs and improvements"

# 自动创建提交
claude commit

完整项目任务开发：

claude "为这个Express项目添加用户认证功能，包括：
1. 使用JWT实现登录/注册
2. 创建必要的路由和中间件
3. 编写测试用例
完成后直接提交到Git分支'feature/auth'"

项目源码分析：

git clone https://github.com/lzwme/m3u8-dl.git
cd m3u8-dl
claude "结合 src 目录下源码，分析m3u8视频下载实现的完整流程"
m3u8-dl 分析

项目性能分析和优化：

# 分析代码库性能瓶颈
claude /requirements-pilot 优化项目响应速度

# 生成架构文档
claude "分析当前项目架构并生成Markdown文档"

自动化任务执行：

# 自动化构建流程
claude "执行npm run build并部署到测试环境"
# Git操作
claude "创建feature分支并提交到远程仓库"

多 AI 协作：

# 与 Gemini CLI 协同审查
claude "生成代码后调用 gemini review"

# 多实例协同
claude --multi-instance "并行处理前端和后端任务"

管道式处理：

# 单文件处理
cat mycode.py | claude -p "Review this code for bugs"

# 批量处理多个文件
for file in *.js; do
    echo "Processing $file..."
    claude -p "Add JSDoc comments to this file:" < "$file" > "${file}.documented"
done

# 管道处理
grep -l "TODO" *.py | while read file; do
    claude -p "Fix all TODO items in this file" < "$file"
done
5.2 多 AI 编程工具协同案例

**基本策略：**让 Claude Code 完成开发，让 Codex 审阅，两者互搏直到意见达成一致。

# Cluade Code 完成一个具体任务并提交到 Git
claude --multi-instance "实现全部文件下载功能，然后提交 Git"

# codex review 代码，并将结果返回给 claude 处理
codex "git提交 1a2b3d4d 为页面增加了全部文件下载功能。请 review 代码检查是否有疏漏"

# 将 codex 的 review 提交给 claude 核实。如此反复直到意见达成一致
claude ...
5.3 基于 Github Actions 的自动化开发流程

可以通过创建一个 .github/workflows/claude.yml 文件实现 Github Actions 集成。官方提供了一个通用的 Claude Code Action[23] 可帮助您快速实现集成。

也可以通过斜杠命令 /install-github-app 以交互式逐步完成集成。

之后您可以随时随地通过 GitHub App 在手机上处理 Issue 和 PR，只需要简单的提及 @claude 就可以触发 Claude Code 执行代码分析、创建拉取请求、实现功能和修复错误。

此外，通过添加 -p 参数执行一次性任务，也可以方便的将 Claude Code 集成到 CI/CD 流水线中。

5.4 躺式编程：基于 claudecodeui 远程操控 Claude Code 工作

通过运行 Claude Code UI[24] 项目启动一个服务器，然后你就可以在手机浏览器上控制 Claude Code 进行开发。再配置上内网穿透则可以随时随地访问，24小时不间断指派任务并监督其工作（提示：基于企业内网安全考量，在公司内部部署内网穿透服务可能是不被允许的，请务必先与负责公司网络安全的部门进行确认）。

Claude Code UI 主要功能及特性：

• 内置聊天界面，与 Claude Code 进行实时交互。
• 集成终端，直接运行 Claude Code CLI 命令。
• 文件树浏览，支持展开/收起目录，查看项目结构。
• 实时文件编辑，内置语法高亮，支持多种编程语言。
• Git 集成，查看、暂存、提交更改，切换分支。
• 会话管理，保存、恢复和组织多项目会话。
• 跨设备同步，随时在不同设备上访问项目。
• 响应式设计，适配桌面、平板和手机屏幕。

安装和使用：

git clone https://github.com/siteboon/claudecodeui.git
cd claudecodeui
npm install
cp .env.example .env
npm run dev

启动后，打开浏览器访问 http://localhost:3001（或 .env 中指定的端口）。

其逻辑架构很简单：

其他同类型工具参考：

• happy-coder[25] Claude Code 的移动和 Web客户端，支持具有实时语音功能齐全，有独立的 App 客户端。
• Claude-Code-Remote[26] 通过电子邮件、discord、telegram 远程控制 Claude Code：在本地启动任务，在Claude完成任务时接收通知，并通过简单地回复发送新命令。
5.5 社区实践与资源

Claude Code 强大的灵活性使得其可玩性很强，社区贡献的实践也非常多。多看看他人是怎样使用的可以让我们更快更好的探索和使用 AI 辅助编程提升效率。以下是一些社区贡献的实践和资源：

• Claude Code Subagents Collection[27] 收集了数十个专业子代理，每个子代理都如同一个领域专家。如果你在 Sub Agents 设计过程中有疑问，可以结合这里的同类案例并予以借鉴参考。
• Claude Code Templates[28] 一个 Claude Code 的配置模板，提供了全面的、开箱即用的经典配置，包括 基础设置、Sub Agents、自定义命令、MCP 集成、项目模板等等。对于新手来说也相当于是一个最佳实践的参考。
• awesome-claude-code[29] 每一个热门的工具都有一个 Awesome，Claude Code 也不例外。这个项目收集了大量与 Claude Code 相关的资源，并按类型进行了分类整理。从这里可以看到大佬们都在怎样的关注和使用 CLAUDE CODE。
• awesome-claude-code-subagents[30] 维护了 100+ 专业子代理模板
• claude-code-cheat-sheet[31] Claude Code 提示、技巧、技巧和工作流程的终极集合，您可以使用它们在几分钟内掌握 Claude Code
5.6 AI 辅助编程实践经验参考

Vibe Coding 常见的陷阱 参考[32]）：

• 多智能体编排：Agent 的复杂性可能会因为很小的错误而走偏方向。一步失败可能会导致 Agent 走向完全不同的轨迹，从而导致不可预测的结果。
• 使用 RAG （检索增强生成）索引代码库：RAG 导致代码分散、上下文缺失。使用 grep 检索文件效果更好：像开发人员一样阅读代码，相信模型的功能。随着顶级模型token上下文窗口容量的增加，RAG 在许多场景下不再是必要的。
• 更多说明 != 更好的结果：额外的指令经常发生冲突并产生噪音，过多的指令会产生矛盾，矛盾会产生混乱。新的前沿模型 Claude 4、Gemini 2.5 和 GPT-5 在遵循简洁的方向方面要好得多。

实用技巧：

• 复杂需求开发：小步快跑 + 频繁测试 + 频繁commit
• 及时保存有效的经验。如：用言简意赅 AI 易读的方式把这些经验写到plan.md,为下次重构做好准备
• 及时保存进度。如：迭代成功，记录目前的进展以及成功的关键经验到 plan.md, 方便下次继续
6 与 Claude Code 同类的基于终端的 AI 编程工具列表

在 Claude Code 火出圈后，各流行 AI 辅助编程应用也陆续跟进推出了同类工具。下面是当前较为流行的一些基于终端的 AI 辅助编程工具及简介列表：

• Claude Code[33] Anthropic 的智能编程工具，它运行在您的终端中，帮助您比以往更快地将想法转化为代码。
• OpenAI Codex[34] 使用 GPT-5，编程能力第一梯队，后端语言编程能力强
• Qwen Code[35] 千问团队专为开发人员打造的强大人工智能工具。提供每日 2000 次免费调用额度。
• Gemini CLI[36] Gemini CLI 是一个开源 AI 代理，可将 Gemini 的强大功能直接带入您的终端。它提供了对 Gemini 的轻量级访问，为您提供从提示到我们模型的最直接路径。
• iFlow CLI[37] iFlow CLI 是一款终端AI助手，可以分析代码、执行编程任务、处理文件操作。
• Kode[38] Claude Code 的开源优化增强版
• aider[39] AI pair programming in your terminal
• Cursor CLI[40] Cursor 于2025年8月发布的基于终端的AI编程工具，支持使用 GPT5 模型。
• CloudBase AI CLI[41] 腾讯云。集成多种主流 AI 编程工具的统一命令行工具，支持内置模型（ DeepSeek/Kimi）和自定义模型。让你能够通过一个简单的命令使用 Claude Code、OpenAI Codex、aider、Qwen Code 等 AI 编程助手。
• CodeBuddy Code[42] 腾讯云官方2025年9月发布的 AI 智能编码工具，支持在终端、IDE 及 GitHub 上通过自然语言高效协作与开发。

此外，这里也有一个流行 AI 编程辅助工具的列表可供参考：https://lzw.me/a/ai-coding-assistant.html

7 相关资源及扩展参考

通过本教程，你应该已经掌握了 Claude Code 从安装到多平台配置和使用的完整流程。建议从简单任务开始，逐步体验"代理式编程"的强大能力。

扩展参考：

• Claude Code 官方文档[43]
• Claude Code 安装、配置与基本使用教程[44]
• Claude Code 最佳实践（官方）[45]
• Claude Code 最佳实践（官方中文翻译版）
• Getting Good Results from Claude Code[46]
• 史上最硬核！Claude Code全链路生存指南[47]
• 终极指南：Claude Code 最佳实践（社区总结版）
• 玩转 Claude Code 的 23 个实用小技巧
引用链接

[1] Claude Code 官方文档:https://docs.anthropic.com/zh-CN/docs/claude-code/overview
[2]Claude Code Proxy:https://github.com/fuergaosi233/claude-code-proxy
[3]Copilot API:https://github.com/ericc-ch/copilot-api
[4]Claude Code with Github Copilot as Model Provider:https://github.com/feiskyer/claude-code-settings/blob/main/guidances/github-copilot.md
[5]Cherry Studio:https://www.cherry-ai.com
[6]Bun:https://github.com/PureStake/bun
[7]Claude Code官方文档:https://docs.anthropic.com/zh-CN/docs/claude-code/overview
[8]Claude Code MCP 文档:https://docs.claude.com/zh-CN/docs/claude-code/mcp
[9]settings.json 文件:https://docs.claude.com/zh-CN/docs/claude-code/settings
[10]settings.json 文件:https://docs.claude.com/zh-CN/docs/claude-code/settings
[11]SDK 文档:https://docs.claude.com/zh-CN/docs/claude-code/sdk
[12]权限模式:https://docs.claude.com/zh-CN/docs/claude-code/iam#permission-modes
[13]SDK 文档:https://docs.claude.com/zh-CN/docs/claude-code/sdk
[14]Jira MCP:https://github.com/atlassian/atlassian-mcp-server
[15]@executeautomation/playwright-mcp-server:https://github.com/executeautomation/mcp-playwright
[16]@modelcontextprotocol/server-sequential-thinking:https://github.com/smithery-ai/reference-servers/tree/main/src/sequentialthinking
[17]@upstash/context7-mcp:https://github.com/upstash/context7-mcp
[18]秘塔搜索MCP:https://metaso.cn/search-api/api-keys
[19]Sub Agents:https://docs.anthropic.com/zh-CN/docs/claude-code/sub-agents
[20]开发容器:https://docs.anthropic.com/zh-CN/docs/claude-code/devcontainer
[21]Claude Code DevContainer 设置:https://github.com/anthropics/claude-code/tree/main/.devcontainer
[22]VSCode: Developing inside a Container:https://code.visualstudio.com/docs/devcontainers/containers
[23]Claude Code Action:https://github.com/anthropics/claude-code-action
[24]Claude Code UI:https://github.com/siteboon/claudecodeui
[25]happy-coder:https://github.com/slopus/happy
[26]Claude-Code-Remote:https://github.com/JessyTsui/Claude-Code-Remote
[27]Claude Code Subagents Collection:https://github.com/wshobson/agents
[28]Claude Code Templates:https://github.com/davila7/claude-code-templates
[29]awesome-claude-code:https://github.com/hesreallyhim/awesome-claude-code
[30]awesome-claude-code-subagents:https://github.com/VoltAgent/awesome-claude-code-subagents
[31]claude-code-cheat-sheet:https://github.com/Njengah/claude-code-cheat-sheet
[32]参考:https://cline.bot/blog/3-seductive-traps-in-agent-building
[33]Claude Code:https://docs.anthropic.com/zh-CN/docs/claude-code/overview
[34]OpenAI Codex:https://openai.com/index/openai-codex/
[35]Qwen Code:https://qwenlm.github.io/qwen-code-docs/zh/
[36]Gemini CLI:https://google-gemini.github.io/gemini-cli/
[37]iFlow CLI:https://platform.iflow.cn/cli/quickstart
[38]Kode:https://github.com/shareAI-lab/Kode
[39]aider:https://aider.chat
[40]Cursor CLI:https://cursor.com/cn/cli
[41]CloudBase AI CLI:https://docs.cloudbase.net/cli-v1/ai/introduce
[42]CodeBuddy Code:https://cnb.cool/codebuddy/codebuddy-code
[43]Claude Code 官方文档:https://docs.anthropic.com/zh-CN/docs/claude-code/overview
[44]Claude Code 安装、配置与基本使用教程:https://doc.yourapi.cn/guide/windows
[45]Claude Code 最佳实践（官方）:https://www.anthropic.com/engineering/claude-code-best-practices
[46]Getting Good Results from Claude Code:https://www.dzombak.com/blog/2025/08/getting-good-results-from-claude-code/
[47]史上最硬核！Claude Code全链路生存指南:https://blog.csdn.net/zhq426/article/details/149273770


 

---

**处理完成时间**: 2025年10月09日
**文章字数**: 30516字
**内容类型**: 微信文章
**自动分类**: 技术教程
**处理状态**: ✅ 完成
