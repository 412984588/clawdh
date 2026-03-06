---
title: "如何将 Claude Code 等代码助手连接到 Google Antigravity 模型"
source: wechat
url: https://mp.weixin.qq.com/s/VslkCRCh7M0w0LAxnRPAQw
author: JZ AI与云计算
pub_date: 2025年12月26日 20:31
created: 2026-01-17 20:12
tags: [AI, 编程, 产品]
---

# 如何将 Claude Code 等代码助手连接到 Google Antigravity 模型

> 作者: JZ AI与云计算 | 发布日期: 2025年12月26日 20:31
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/VslkCRCh7M0w0LAxnRPAQw)

---

想要通过您喜欢的代码助手访问 Google 强大的 Antigravity 模型来提升您的 AI 编程工作流程？本综合指南将向您展示如何设置 CLIProxyAPI 作为 LLM 代理层，实现不同 AI 提供商之间的无缝模型切换。

通过遵循本教程，您将：

配置 CLIProxyAPI 作为多个 LLM 提供商的统一网关
设置代码助手管理器以便轻松选择模型
将 Claude Code、Codex、Qwen Code 或 Copilot 连接到 Google Antigravity 模型
获得在不改变工作流程的情况下在不同 AI 编程工具之间切换的灵活性

无论您是希望利用 Antigravity 的高级推理能力，还是只是想更好地控制哪些模型为您的开发环境提供动力，本指南都能满足您的需求。

先决条件

在开始之前，请确保您具备以下条件：

要求
	
最低版本
	
备注


Python
	
3.9+
	
代码助手管理器所需


pip
	
21.0+
	
用于包安装


Git
	
2.30+
	
用于克隆仓库


代码助手
	
最新版
	
Claude Code、Codex、Qwen Code 或 Copilot


Google Account
	
N/A
	
API 访问所需

注意： 如果您使用 Docker，请确保安装并运行 Docker Engine 20.10+。

步骤 1：安装 CLIProxyAPI

CLIProxyAPI 作为您的代码助手和各种 LLM 提供商之间的代理层。这个 LLM 代理实现了无缝模型切换，而无需重新配置每个单独的 AI 编程工具。

macOS
brew install cliproxyapi
brew services start cliproxyapi


预期输出：

==> Starting cliproxyapi
==> Successfully started `cliproxyapi` (label: homebrew.mxcl.cliproxyapi)

Linux
curl -fsSL https://raw.githubusercontent.com/brokechubb/cliproxyapi-installer/refs/heads/master/cliproxyapi-installer | bash


预期输出：

CLIProxyAPI installed successfully!
Service started on http://localhost:8317


提示： 在 Linux 上，安装程序会自动创建 systemd 服务。您可以使用 systemctl status cliproxyapi 检查状态。

Windows

从 GitHub releases 页面 下载，或使用 EasyCLI 桌面应用 获取图形界面。

Docker
docker run --rm -p 8317:8317 \
  -v /path/to/your/config.yaml:/CLIProxyAPI/config.yaml \
  -v /path/to/your/auth-dir:/root/.cli-proxy-api \
  eceasy/cli-proxy-api:latest


预期输出：

CLIProxyAPI server listening on 0.0.0.0:8317
Ready to accept connections...


警告： 使用 Docker 时，请将 /path/to/your/config.yaml 和 /path/to/your/auth-dir 替换为系统上的实际路径。使用占位符路径会导致容器失败。

步骤 2：配置提供商

安装代码助手管理器并设置您的 providers.json 文件以启用模型切换功能。

安装代码助手管理器
# 克隆仓库
curl -fsSL https://raw.githubusercontent.com/Chat2AnyLLM/code-assistant-manager/main/install.sh | bash


预期输出：

Successfully installed code-assistant-manager-1.x.x

配置 providers.json

创建或编辑 ~/.config/code-assistant-manager/providers.json：

{
"common":{
"cache_ttl_seconds":86400
},
"endpoints":{
"google-antigravity":{
"endpoint":"http://localhost:8317",
"api_key_env":"ANTIGRAVITY_API_KEY",
"list_models_cmd":"python -m code_assistant_manager.v1_models",
"supported_client":"claude,codex,qwen,copilot",
"description":"通过 CLIProxyAPI 访问 Google Antigravity 模型"
}
}
}


注意： cache_ttl_seconds 设置控制模型列表的缓存时间。为获得最佳性能，设置为 86400（24 小时），或如果您经常添加新模型，则设置较低值。

设置您的 API 密钥

将您的 Gemini/Antigravity API 密钥添加到环境变量中：

export ANTIGRAVITY_API_KEY="your-api-key-here"


或在您的主目录中创建 .env 文件：

ANTIGRAVITY_API_KEY="your-api-key-here"


警告： 切勿将您的 API 密钥提交到版本控制中。将 .env 添加到您的 .gitignore 文件中以防止意外泄露。

验证配置
cam doctor


预期输出：

✓ antigravity endpoint URL format is valid
✓ antigravity uses environment variable for API key

步骤 3：选择 Antigravity 模型

使用模型选择器启动 Claude Code：

cam l claude


此命令打开一个交互式菜单，您可以在其中选择可用的 Antigravity 模型。选择您偏好的模型，并开始使用增强的 AI 功能进行编程。




总结和后续步骤
步骤
	
操作
	
验证


1
	
为您的平台安装 CLIProxyAPI
	
服务在端口 8317 上运行


2
	
使用您的端点配置 providers.json
	cam doctor
 通过所有检查


3
	
运行 cam l claude 选择模型
	
出现交互式模型选择器

您现在已经准备好将 Google Antigravity 模型与 Claude Code 或其他支持的 AI 编程工具一起使用。

推荐的后续步骤：

探索不同的 Antigravity 模型，找到最适合您的编程任务的模型
在您的 providers.json 中配置额外的 LLM 提供商以获得最大灵活性
在您的终端中设置键盘快捷键以实现更快的模型切换
加入社区 Discord 以获取提示和高级配置
故障排除
CLIProxyAPI 无法启动

症状： 服务无法启动或立即崩溃。

解决方案： 检查端口 8317 是否已被使用：

lsof -i :8317


如果另一个进程正在使用该端口，请停止该进程或在 config.yaml 中配置 CLIProxyAPI 使用不同的端口。

"连接被拒绝" 错误

症状： cam doctor 报告连接失败。

解决方案： 确保 CLIProxyAPI 正在运行：

# macOS
brew services list | grep cliproxyapi

# Linux
systemctl status cliproxyapi

API 密钥未被识别

症状： 连接到 Antigravity 模型时出现身份验证错误。

解决方案： 验证您的 API 密钥是否正确设置：

echo$ANTIGRAVITY_API_KEY


如果为空，请重新导出变量或检查您的 .env 文件位置。

模型列表为空

症状： 选择器中未出现任何模型。

解决方案： 清除模型缓存并刷新：

cam l claude

常见问题
什么是 CLIProxyAPI？

CLIProxyAPI 是一个开源的 LLM 代理，作为代码助手和多个 AI 模型提供商之间的统一网关。它实现了无缝模型切换，而无需修改单个工具配置。

我可以同时使用多个 LLM 提供商吗？

是的。您可以在 providers.json 文件中配置多个端点，允许您根据需要切换 Google Antigravity、OpenAI、Anthropic 和其他提供商。

支持哪些代码助手？

代码助手管理器目前支持 Claude Code、Codex、Qwen Code 和 GitHub Copilot。其他 AI 编程工具可能需要手动配置。

我的 API 密钥安全吗？

您的 API 密钥存储在本地环境变量或 .env 文件中。CLIProxyAPI 不会外部传输或存储您的密钥。始终遵循安全最佳实践，切勿将密钥提交到版本控制。

如何更新 CLIProxyAPI？

在 macOS 上，运行 brew upgrade cliproxyapi。在 Linux 上，重新运行安装脚本。对于 Docker，使用 docker pull eceasy/cli-proxy-api:latest 拉取最新镜像。

相关资源
CLIProxyAPI GitHub 仓库 - 官方源代码和文档
代码助手管理器文档 - 详细配置选项
Google AI Studio - 获取您的 Antigravity API 密钥
EasyCLI 桌面应用 - Windows 用户的 GUI 替代方案

---
*导入时间: 2026-01-17 20:12:26*
