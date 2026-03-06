# Claude Code伴侣：可视化管理新体验

## 基本信息
- **标题**: Claude Code伴侣：可视化管理新体验
- **来源**: 微信公众号
- **作者**: RussellLuo
- **发布时间**: 2025年09月23日
- **URL**: https://mp.weixin.qq.com/s/3853mOKdMyZ6NggaJOFilw
- **分类**: 产品管理
- **标签**: #AI #GitHub #工具推荐 #技术分析 #深度学习

## 内容摘要
引言

Claude Code 伴侣（即Claude Code Mate[1]，以下简称 CCM）最初的定位是一个极简的 LLM 代理工具，旨在帮助开发者快速用上 Claude Code 和切换各种大模型。所以 CCM 一开始选择了纯命令行交互，以及通过 YAML 文件进行配置。这种方式既简洁高效，也符合开发者的使用习惯。

距离 CCM 第一版发布（轻松解锁Claude Code：国内用户的多元模型新玩法）已经过去了近一个月，随着自己使用的增多，以及零星收到的一些用户反馈，我发现 CCM 存在以下问题：

模型管理不直观：用户如果不查阅LiteLLM 文档[2]，很难知道 CCM 支持哪些模...

## 完整内容

引言

Claude Code 伴侣（即Claude Code Mate[1]，以下简称 CCM）最初的定位是一个极简的 LLM 代理工具，旨在帮助开发者快速用上 Claude Code 和切换各种大模型。所以 CCM 一开始选择了纯命令行交互，以及通过 YAML 文件进行配置。这种方式既简洁高效，也符合开发者的使用习惯。

距离 CCM 第一版发布（轻松解锁Claude Code：国内用户的多元模型新玩法）已经过去了近一个月，随着自己使用的增多，以及零星收到的一些用户反馈，我发现 CCM 存在以下问题：

模型管理不直观：用户如果不查阅LiteLLM 文档[2]，很难知道 CCM 支持哪些模型，以及如何配置这些模型（比如 OpenAI 兼容的模型，需要加上openai/前缀）。
没有用量统计：用户在 CCM 中无法查看自己的用量情况，包括各个模型的请求数、输入/输出 Token 数和费用消耗等信息。

为了解决这些问题，我决定为 CCM 引入一个可视化管理后台，以提升用户体验。

PostgreSQL 小插曲

了解 LiteLLM 的朋友可能知道，LiteLLM Proxy 其实原本就提供Admin UI[3]。然而，它对数据库的选择有特定偏好：仅支持 PostgreSQL，并且明确表示不考虑 SQLite 等其他轻量级选项[4]。

这意味着，如果要启用 Admin UI，用户必须要先安装和配置 PostgreSQL。这显然与 CCM 的初衷——提供一个简单易用的工具——是相违背的。

幸运的是，经过一番调研，我找到了一个 Python 库pgserver[5]，可以实现：

可嵌入：通过 pip 安装依赖库，即可自动下载 PostgreSQL
零配置：无需用户手动设置数据库环境
跨平台：支持 Windows、macOS 和 Linux
无 Docker：不需要额外安装和配置 Docker

于是在 pgserver 的帮助下，CCM 成功引入了 Admin UI，并做到了用户无感。

快速开始

为了保持轻量级，CCM 默认不包含 UI 功能。如果要启用 UI 功能，可以通过以下命令安装：

# 使用uv（推荐）
uv pip install --system --python 3.12 "claude-code-mate[ui]"
# 或者使用pip
pip install "claude-code-mate[ui]"


安装后，使用以下命令启动 UI：

ccm ui


打开 Admin UI 后，使用默认的用户名和密码（admin和sk-1234567890）登录，即可进入管理后台。

可视化管理后台

LiteLLM Proxy 提供的 Admin UI 功能很强大，其中就包括 CCM 第一版缺失的模型管理和用量统计功能。

模型管理
模型管理界面

LiteLLM 内置支持众多提供商的模型，包括但不限于：

知名官方模型（如 Anthropic、OpenAI 和 DeepSeek 等）
聚合平台的模型（如 OpenRouter 等）
OpenAI 兼容模型
Ollama 本地模型

用户可以通过界面：

轻松添加、编辑和删除模型，无需了解 LiteLLM 的特殊前缀规则。
设置输入/输出的 Token 价格，以便准确计算费用。
修改一些高级参数，如 TPM/RPM、超时时间和 max_tokens 等。
用量统计
用量统计界面

通过用量统计功能，用户可以清晰地看到：

总（或按模型）的请求次数，以及成功和失败的次数。
总（或按模型）的 Token 数量，以及输入和输出的 Token 数量。
总（或按模型）的费用消耗情况等。
其他功能

除了上述两个功能外，Admin UI 还提供了以下一些实用功能：

模型测试（Test Key）：快速测试模型的可用性和效果。
日志查看（Logs）：实时查看请求日志，便于调试和排查问题。
模型测试界面
日志界面

以上只列举了 Admin UI 的部分功能，对于其他功能感兴趣的读者，可以进一步参考LiteLLM Proxy 文档[6]。

结语

欢迎大家体验 Claude Code Mate 的新 UI 功能！需要说明的是，该功能只在 macOS（我的开发环境）进行了测试，尚未在 Windows 和 Linux 上进行全面验证。如果你有任何问题或建议，欢迎随时在GitHub 仓库[7]中提出。

参考资料
[1] 

Claude Code Mate: https://github.com/RussellLuo/claude-code-mate

[2] 

LiteLLM 文档: https://docs.litellm.ai/docs/providers

[3] 

Admin UI: https://docs.litellm.ai/docs/proxy/ui

[4] 

不考虑 SQLite 等其他轻量级选项: https://github.com/BerriAI/litellm/issues/4583

[5] 

pgserver: https://github.com/orm011/pgserver

[6] 

LiteLLM Proxy 文档: https://docs.litellm.ai/docs/proxy/ui

[7] 

GitHub 仓库: https://github.com/RussellLuo/claude-code-mate

---

**处理完成时间**: 2025年10月09日
**文章字数**: 2305字
**内容类型**: 微信文章
**自动分类**: 产品管理
**处理状态**: ✅ 完成
