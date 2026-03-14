---
title: "如何在本地项目中接入Gemini"
source: wechat
url: https://mp.weixin.qq.com/s/KIJTLaXD_2tN98xaAvPApQ
author: 零幺零贰
pub_date: 2025年12月14日 00:28
created: 2026-01-17 20:14
tags: [AI, 编程, 产品]
---

# 如何在本地项目中接入Gemini

> 作者: 零幺零贰 | 发布日期: 2025年12月14日 00:28
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/KIJTLaXD_2tN98xaAvPApQ)

---

Windows版教程
一. 验证本地是否安装node

打开 PowerShell，输入 node -v 和 npm -v，有版本号出来即安装。

如果没有安装的话，记得提前安装一下。

方案：使用 nvm-windows 安装（windows里面的安装方案我没有亲自试过，因为电脑里面已经装好了，如果有出错的地方，可以自己再看看别的教程，应该也不难）

下载安装包： 访问 nvm-windows 的发布页：https://github.com/coreybutler/nvm-windows/releases下载最新版本的 nvm-setup.exe。

安装： 双击运行 nvm-setup.exe，一路点击 Next（下一步）安装即可。

验证 nvm： 安装完成后，关闭并重新打开 PowerShell，输入：

nvm version


如果显示版本号，说明 nvm 安装成功。

安装 Node.js (LTS 长期支持版)：

nvm install lts
nvm use lts


验证： 输入 node -v 和 npm -v，有版本号出来即成功。

如果安装速度很慢，可以切换镜像。

默认的 npm 下载源在海外，你在国内直接用 npm install 可能会非常慢甚至卡死。 将下载源切换到淘宝镜像（npmmirror）：

npm config set registry https://registry.npmmirror.com


验证是否加速成功：

npm config get registry


如果输出 https://registry.npmmirror.com/，则切换成功。

二. 接入Gemini

安装 Google Gemini CLI 工具

环境配置好之后，就可以安装 Gemini 的命令行工具了。

直接在终端执行下面这条命令（加了 -g 代表全局安装，这样你在任何位置都能调用它）：

npm install -g @google/gemini-cli@latest


配置 API Key

需要先去 Google AI Studio 申请你的 API Key。拿到 Key 之后，我们把它通过命令写入到 PowerShell 的配置文件里。

地址：https://aistudio.google.com/api-keys

将申请下来的 api-key 写入配置

请将下面的 YOUR_API_KEY 替换成你自己申请到的真实 Key，然后依次执行这三行代码：

# 1. 确保配置文件存在（如果不存在则创建）
if (!(Test-Path -Path $PROFILE)) { New-Item -ItemType File -Path $PROFILE -Force }

# 2. 把 Key 写入配置文件 (注意替换你的Key)
Add-Content $PROFILE '$env:GEMINI_API_KEY="你的api-key"'

# 3. 让配置立即生效
. $PROFILE


我在执行第三行命令的时候报错了：

这意味着你的配置文件（$PROFILE）里，有两条命令粘在同一行了，没有换行。

你需要手动把它们拆开。请跟着我做：

修改文件

把鼠标光标放在 UTF8 后面，敲一下回车。

保存并退出

终端窗口重新执行

. $PROFILE


这次绝对不会出问题了~

打开配置文件，在 PowerShell 里输入：

notepad $PROFILE


找到错误的地方

你会看到记事本里的内容如下：

修改代理

开启一个新的终端，输入：gemini，选择第 2 个选项，回车。

随便发一个提示词，应该会出现下面的报错（Fetch failed）。

这个问题出现的根本原因是：网络连接被阻断。 你需要手动让终端命令通过代理上网。

方案：永久设置

如果你希望每次打开终端都能自动连上，可以把开启代理的命令直接写死在文件里。

恭喜你已成功领域连接之道，我这边再也没有什么能够传授给你的了，自行下山写代码去吧~~~~~~

打开配置文件

notepad $PROFILE


在文件末尾添加

$env:http_proxy = "http://127.0.0.1:你的端口号"
$env:https_proxy = "http://127.0.0.1:你的端口号"


保存退出

让配置生效

. $PROFILE

Mac版教程
一. 验证本地是否安装node

输入 node -v 和 npm -v，有版本号出来即安装。

如果没有安装的话，记得提前安装一下。

方案：使用 nvm 安装（上魔法）

打开终端，运行安装脚本：

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash


配置环境变量： 安装完成后，终端会提示你把几行代码加到配置文件里。对于你的 Mac（zsh），执行以下命令刷新配置：

source ~/.zshrc


如果提示：source: no such file or directory，说明你本地没有这个文件，需要先创建一下文件。

touch ~/.zshrc


再重新从第1步的命令开始执行即可~

安装 Node.js (LTS 长期支持版) ：

nvm install --lts


验证： 输入 node -v 和 npm -v，有版本号出来即成功。

如果安装速度很慢，可以切换镜像

默认的 npm 下载源在海外，你在国内直接用 npm install 可能会非常慢甚至卡死。

将下载源切换到淘宝镜像（npmmirror）：

npm config set registry https://registry.npmmirror.com


验证是否加速成功：

npm config get registry


如果输出 https://registry.npmmirror.com/，则切换成功。

二. 接入Gemini

安装 Google Gemini CLI 工具

环境配置好之后，就可以安装Gemini 的命令行工具了。 直接在终端执行下面这条命令（加了 -g 代表全局安装，这样你在任何位置都能调用它）：

npm install -g @google/gemini-cli@latest


安装过程中如果出现 warn 警告可以忽略，只要最后显示 added ... packages 就说明安装成功了。

配置 API Key

需要先去 Google AI Studio 申请你的 API Key。 拿到 Key 之后，我们把它通过命令写入到配置文件里，这样就不用每次都手动输入了。

地址：https://aistudio.google.com/api-keys

将申请下来的api-key写入配置

请将下面的 YOUR_API_KEY 替换成你自己申请到的真实 Key，然后依次执行这两行代码：

# 注意：把引号里的内容换成你自己的 Key
echo 'export GEMINI_API_KEY="你的api-key"' >> ~/.zshrc

# 让配置立即生效
source ~/.zshrc


修改代理

开启一个新的终端，输入：gemini，选择第2个选项，回车。

随便发一个提示词，应该会出现下面的报错：

这个问题出现的根本原因是：网络连接被阻断。

报错信息 TypeError: fetch failed sending request 表明 Node.js 在尝试向 Google 的服务器（Gemini API）发送请求时，连接失败了。

你需要手动让终端命令通过代理上网。

方案：永久设置（写入配置文件）

如果你希望每次打开终端都能自动连上，可以把配置写入你的 .zshrc 文件。

打开配置文件：

nano ~/.zshrc


在文件末尾添加：

# 开启终端代理
export https_proxy=http://127.0.0.1:7890
export http_proxy=http://127.0.0.1:7890


保存退出 (Ctrl+O 回车 -> Ctrl+X)。

让配置生效：

source ~/.zshrc




图片版教程：

（有任何想说的话都可以选择私信我）





—  期待与你的下次相遇  —

你的支持是我们更新的最大动力🌝

 文案：奥德奈瑞、刘哈哈

 图片：奥德奈瑞

 排版：奥德奈瑞


 审核：奥德奈瑞

---
*导入时间: 2026-01-17 20:14:14*
