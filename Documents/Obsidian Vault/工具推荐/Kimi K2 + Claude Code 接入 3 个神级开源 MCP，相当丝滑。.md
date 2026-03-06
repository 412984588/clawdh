# Kimi K2 + Claude Code 接入 3 个神级开源 MCP，相当丝滑。

## 基本信息
- **标题**: Kimi K2 + Claude Code 接入 3 个神级开源 MCP，相当丝滑。
- **来源**: 微信公众号
- **作者**: 逛逛
- **发布时间**: 2025年09月22日
- **URL**: https://mp.weixin.qq.com/s/8D-PTx6PBr2cyveEMdMa7g
- **分类**: 工具推荐
- **标签**: #AI #GitHub #工具推荐 #技术分析 #效率 #深度学习 #开源 #教程

## 内容摘要
Kimi K2 是月之暗面推出的具备超强代码和 Agent 能力的 MoE 架构基础模型。

它刚刚开源的时候，就在国内外掀起了一波浪潮。

最近 Kimi K2 推出了高速版：Kimi-K2-Turbo-Preview。接入到 Claude Code 并搭配各种开源 MCP 食用， 相当好玩。

而且 9 月 Anthropic 宣布对中国开发者断供 Claude 模型能力，Kimi K2 正好可以顶上。

本文介绍 3 个 好玩开源的 MCP ，教你如何使用 Claude Code + Kimi K2 驱动使用，建议收藏后续备用。

01

安装配置

在正式开始之前，需要完成下面这三个主...

## 完整内容

Kimi K2 是月之暗面推出的具备超强代码和 Agent 能力的 MoE 架构基础模型。

它刚刚开源的时候，就在国内外掀起了一波浪潮。

最近 Kimi K2 推出了高速版：Kimi-K2-Turbo-Preview。接入到 Claude Code 并搭配各种开源 MCP 食用， 相当好玩。

而且 9 月 Anthropic 宣布对中国开发者断供 Claude 模型能力，Kimi K2 正好可以顶上。

本文介绍 3 个 好玩开源的 MCP ，教你如何使用 Claude Code + Kimi K2 驱动使用，建议收藏后续备用。

01

安装配置

在正式开始之前，需要完成下面这三个主要步骤，我这里拿 MacOS 系统为例，其余操作系统的我在文章末尾放几个参考文章。：

① 安装 Node.js 


# macOS 用户
sudo xcode-select --install
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install node
node --version

检验安装 Node.js 是否成功，可以输入最后 node --version 的命令，如果输出了当前 Node 的版本，说明 OK 了。

② 安装Claude Code

然后使用 npm 安装 Claude Code 就行了。

如果是 Windows  系统麻烦一下，需要首先安装 git-for-windows，然后在 git-bash 里面使用 pnpm 安装。

npm install -g @anthropic-ai/claude-code
claude --version

同样的如果安装完成，输入 claude --version 显示版本号就可以进行下一步了。

 ③ 接入 Kimi K2 Turbo

可以接入 Kimi K2 的高速版，也就是 Kimi-K2-Turbo-Preview，很适合国内开发者。

获取 API Key

首先，打开下面这个网址，找到新建 API Key 按钮，创建一个属于自己的密钥，复制后一定要保存好，而且不要随便发给别人。

获取 API Key：https://platform.moonshot.cn/console/api-keys

接下来你请按照以下方式设置环境变量使用 kimi-k2-turbo-preview 模型，并启动 Claude。

# Linux/macOS 启动高速版 kimi-k2-turbo-preview 模型
export ANTHROPIC_BASE_URL=https://api.moonshot.cn/anthropic
export ANTHROPIC_AUTH_TOKEN=${YOUR_MOONSHOT_API_KEY}
export ANTHROPIC_MODEL=kimi-k2-turbo-preview
export ANTHROPIC_SMALL_FAST_MODEL=kimi-k2-turbo-preview
claude

注意上面 ANTHROPIC_AUTH_TOKEN 这里要输入你刚刚复制的 API Key。

将上面这些命令复制到终端里面就行了。如果显示 API Base URL 是 moonshot 的就行了。

你也可以通过输入 /status 查看当前 API 的配置是不是 Kimi K2 高速版。看下面的 API Configuration 和 Model 是我截图里面的就行了。

02

操作浏览器 MCP

叫 Playwright MCP 的 开源 MCP 能让你的 Kimi K2+ Claude Code 支持操作浏览器的能力。

堪称黑科技。先给你描述一下安装这个 MCP 后的效果：

比如你输入一行命令，让他打开浏览器访问百度，搜索一下今天最新的天气。 Kimi K2 加持版的 Claude Code 就会自己打开一个浏览器，在你面前搜索百度的域名、检索今天的天气。

如何安装呢？超级简单，你只需要在命令行中输入：帮我安装并配置一下 Playwright MCP。

然后它自己会查找资源，下载并配置这个 MCP 服务。

安装配置完，你可以输入命令 /mcp ，看看当前 Claude Code 的 MCP 列表中有没有 Playwright MCP。
如果显示 playwright 并且 connected 为绿色的对号就行了，如果为空。你就再给 Claude Code 发命令，让他重新安装并配置 playwright MCP。
这个时候，你的 Kimi K2 版的 Claude Code 就加持了操纵浏览器的能力。

比如我说：你打开浏览器，访问微信公众号的后台 mp.weixin.qq.com ，然后点开最近发送的一篇文章，复制内容到知乎里面，创建一个新的文章

我下达了命令后，它自己打开一个浏览器打开公众号的后台。然后让我扫码登录一下，它读取到最近一篇公众号文章，打开后把里面的内容进行了复制。
紧接着又访问知乎网址，让我扫码登录后，自己就打开知乎的创作中心， 新建了一个文章把刚刚复制的内容粘贴进去了。
整个过程看起来还是挺魔幻的，下面就是整个流程录屏：

视频加载失败，请刷新页面再试

 刷新

03

将 Kimi K2 生成的网站发布

加持了 Kimi K2 的 Claude Code 在写前端页面也就是 HTML 还是挺强的。
但是 AI 生成的 HTML 只是一个静态页面，如何发布出去让别人访问到呢？
这就需要用到另外一个开源的 MCP 服务。
同样的，直接输入：帮我安装并配置 edgeone-pages-mcp 。然后等一会就行了。

帮我写一个美观的 kimi K2 介绍网页，并且发布出去谁都能访问

然后你就能得到一个外网可以访问的链接，发给微信好友点开就能直接访问了。

视频加载失败，请刷新页面再试

 刷新

04

小红书 MCP

最近有一个叫 xiaohongshu-mcp 的开源 MCP 是挺火的，目前已经获得 3000 多的 Star 了。

能让 Claude Colde + Kimi K2 支持调用小红书的能力，不需要自己打开网页点点点，就能发帖子、获取数据。

老办法，直接让接入了 Kimi K2 的 Claude Code 自己搜索并安装就行了。

这个开源的 MCP 能让你说句话就完成小红书账号的操控：比如登录、发帖子、搜内容、看详情、刷评论，全都能自动化完成。

并且 MCP 的开发者整理了一份特别详细的 Claude Code + Kimi K2 使用的教程：

教程：https://github.com/xpzouying/xiaohongshu-mcp/blob/main/examples/claude-code/claude-code-kimi-k2.md

06

推荐使用 Kimi K2 Turbo

上面这些演示，都是使用的 Kimi-K2-Turbo-Preview 模型，参数与 0905 版本一致，已提升至 256K 上下文。 


输出速度达 60~100 Token/s，是普通版的 6 倍左右。

而且最近国内遭到 Anthropic 的封禁，使用 Kimi K2 接入 Claude Code 相当丝滑，而且看了一下官网，最近还有 5 折的活动。

感兴趣的直接冲：platform.moonshot.cn

# Claude Code 接入 Kimi K2 更多教程：
1. https://platform.moonshot.cn/docs/guide/agent-support
2. https://zhuanlan.zhihu.com/p/1928071611342393465

07

点击下方卡片，关注我

这个公众号历史发布过很多有趣的开源项目，如果你懒得翻文章一个个找，你直接关注微信公众号：逛逛 GitHub ，后台对话聊天就行了：

---

**处理完成时间**: 2025年10月09日
**文章字数**: 3406字
**内容类型**: 微信文章
**自动分类**: 工具推荐
**处理状态**: ✅ 完成
