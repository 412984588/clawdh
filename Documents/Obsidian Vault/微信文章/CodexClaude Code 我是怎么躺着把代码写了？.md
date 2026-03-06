---
title: "Codex/Claude Code 我是怎么躺着把代码写了？"
source: wechat
url: https://mp.weixin.qq.com/s/je0Wny85NV2F1Opluy0XTw
author: 字节笔记本
pub_date: 2025年9月20日 07:04
created: 2026-01-17 21:12
tags: [AI, 编程]
---

# Codex/Claude Code 我是怎么躺着把代码写了？

> 作者: 字节笔记本 | 发布日期: 2025年9月20日 07:04
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/je0Wny85NV2F1Opluy0XTw)

---

真就躺着把代码写了，方法很简单 用手机访问部署好VSCode的Web版本。

之前也使用过类似于Happy的Claude Code的APP，但是说实话效果都不怎么样，相较于这些的CLI远程工具App或者web而言，VSCode 的web 版本code-server有加好的体验。

首先是启动包含了完整的开发环境和插件库，不需要再对开发环境做重新的配置，启动项目就可以直接对接到本地，代码审查也更加的方便。

对于手机端阅读也有非常好的自适应能力，得益于vscode的灵活性，可以自由地调节整个窗口的布局，配置成专门针对于手机版的workspace。

而且一旦远程的开发环境部署好之后，也不需要什么特殊的网络，连接就可以用，拿着手机打开网页就可以这在家里的沙发上躺着来写代码。

很多人会担心输入有困难，其实还好。比方说，在视频当中，我就直接用语音来输入了，根本就不需要打字，对于一些比较常用的命令，我们其实可以使用它的快捷输入方式，提前将它录入进去。

比方说我就是把co映射成claude，cx映射成codex。如果你想映射YOLO模式，不防就把cy在输入法的快捷输入里绑定好

claude--dangerously-skip-permissions。

把这些超长的指令都做一下梳理，后面只需要按两个键就可以直接输入。

再就是访问的问题。在家里或者公司直接可以使用局域网络IP来访问，如果要远程就得内网穿透了，最常用的方式就是FRP zerotier之类，再懒一点就todesk就行。因为我本身有固定 IP，所以直接使用了Edgeone CDN回家，如果需要出一些教程的话，可以在下方留言。

code-server 安装部署也极其简单，使用一句话就可以安装完成，如果你对系统有洁癖，也可以使用docker来启动项目，整个项目非常的轻量化，占用资源也比较的少。

# 使用安装脚本
curl -fsSL https://code-server.dev/install.sh | sh

# 或使用Docker
docker run -it --name code-server -p 127.0.0.1:8080:8080 \
  -v "$HOME/.local/share/code-server:/home/coder/.local/share/code-server" \
  -v "$PWD:/home/coder/project" \
  -u "$(id -u):$(id -g)" \
  -e "DOCKER_USER=$USER" \
  codercom/code-server:latest


启动：

code-server --bind-addr 127.0.0.1:8080

打开之后，就可以体验到本地完全一致的开发环境，完全相同的 VS Code 的开发体验，并且他对手机端的适配也是非常的到位，如果是使用pad效果会更加的好。

Cline入驻Jetbrains! 可免费使用老马最新免费的两百万上下文Grok 4 Fast


另辟蹊径！让Codex也能用上Spec-Kit


Codex的配置真是难用到爆！写了一个图形化配置界面轻松搞定！


GPT-5-Codex 能替代GPT-5-high吗？


关注字节笔记本视频号获取更多的演示教程，不定期送各种各样的福利：

---
*导入时间: 2026-01-17 21:12:09*
