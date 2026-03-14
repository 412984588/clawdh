# 用手机做监工，让ClaudeCode持续工作

## 基本信息
- **标题**: 用手机做监工，让ClaudeCode持续工作
- **来源**: 微信公众号
- **作者**: 闲丰
- **发布时间**: 2025年09月27日
- **URL**: https://mp.weixin.qq.com/s/pB6Hn2U9oRQRUkWix6sX2Q
- **分类**: AI技术
- **标签**: #AI #工具推荐 #技术分析 #教程

## 内容摘要



自从用上了AI编程工具，周末总想自己动手做点小功能。

很多时候，只要规划好了，AI编程只需要等他跑完任务才看结果，期间可以干点别的事情，甚至外出。

如果可以让电脑一直在家Coding，而我可以在外面通过手机或者iPad查看工作情况，并继续推进下一步，那该多好！

研究了一下，可以使用以下组合来实现：

Tailscale+Tmux+ClaudeCode 。

Tailscale:

提供网络，在设备上开启了他的VPN以后，会提供IP地址，不同设备可以通过IP地址互相连接。

Tmux:

主要做会话保持，这以便我们每次重新连上电脑，执行tmux attach，就能回到原来的会话。

...

## 完整内容




自从用上了AI编程工具，周末总想自己动手做点小功能。

很多时候，只要规划好了，AI编程只需要等他跑完任务才看结果，期间可以干点别的事情，甚至外出。

如果可以让电脑一直在家Coding，而我可以在外面通过手机或者iPad查看工作情况，并继续推进下一步，那该多好！

研究了一下，可以使用以下组合来实现：

Tailscale+Tmux+ClaudeCode 。

Tailscale:

提供网络，在设备上开启了他的VPN以后，会提供IP地址，不同设备可以通过IP地址互相连接。

Tmux:

主要做会话保持，这以便我们每次重新连上电脑，执行tmux attach，就能回到原来的会话。

即使我们关掉终端、SSH断开，任务也不会中断。

Claude Code:

CLl编程工具，打工的好牛马！




安装Tailscale

首先，在电脑上安装 Tailscale:

brew install --cask tailscale

sudo tailscale up

在终端里执行第二步的时候，会在电脑上添加一个VPN，需要授权。但我遇到了点问题，提示授权失败。

执行 brew 命令后，电脑里就已经有Tailscale这个桌面软件了，打开软件，在右上角有个图标，通过图标完成登录等操作即可。




安装并配置 Tmux

brew install tmux

tmux new-session -d-s claude-code

tmux attach-session -t claude-code

执行到这里会看到终端的显示上会略有区别。

安装ClaudeCode，并且在tmux的会话里打开claude:

npm install -g @anthropic-ai/claude-code

cd your-project-directory

claude




移动设备监控

现在，我们可以在任何其他设备上，使用以下命令连接到此环境:

ssh username@100.x.x.x

tmux attach-session -t claude-code




手机上终端可以用terminus

在通过终端连接Mac的时候，如果提示拒绝，从下面两个地方检查一下:

1.确认 Mac 上是否启用了 SSH

在Mac里执行:

sudo systemsetup -getremotelogin

如果结果是 Remote Login:off，需要开启:

sudo systemsetup -setremotelogin on

这条命令在终端下，需要给终端额外的授权。

所以我推荐在 系统设置 →通用 →共享 →远程登录 里，打开远程登录。




2.确认Mac防火墙是否放行

macOs 自带防火墙有时会拦截 SSH。

在 系统设置→网络 →防火墙 中确认是否允许“远程登录(SSH)"访问。

好了，现在可以随时在手机或者iPad上查看Claude Code的运行情况了，也可以输入指令让他一直工作了。

美中不足的是，Tailscale因为要开VPN会跟我科学的VPN冲突，用这种方式连接的时候，没法用科学。







一个人人会编程的时代到来了！

关注我，我会进行一个claude code软件的系列分享。

在AI和AI破局俱乐部的加持下，我真的把AI编程这条路打穿了，做到让大家：

会说话就会编程！

如果感兴趣，请联系我！等待我的3分钟入门教程！

你对编程有任何畏惧或疑问，请在评论区留言!




这是闲丰公众号的第02篇原创文章

为什么要用claude？

推荐阅读：

《人人编程已到来，一大波 5 分钟一个的程序惊艳涌来……》




---

**处理完成时间**: 2025年10月09日
**文章字数**: 1561字
**内容类型**: 微信文章
**自动分类**: AI技术
**处理状态**: ✅ 完成
