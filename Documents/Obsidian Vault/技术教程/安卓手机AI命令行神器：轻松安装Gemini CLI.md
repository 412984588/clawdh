# 安卓手机AI命令行神器：轻松安装Gemini CLI

## 基本信息
- **标题**: 安卓手机AI命令行神器：轻松安装Gemini CLI
- **来源**: 微信公众号
- **作者**: Akogare
- **发布时间**: 2025年09月18日
- **URL**: https://mp.weixin.qq.com/s?__biz=Mzg3NjE3NjE3Nw==&mid=2247483681&idx=1&sn=fafab9611256a72edd24ac97e1e11c7f&chksm=ce77e2499415075f4bb781c10e9cbc4083bb2442cddc56db9f461b5efdb5d53c671bb78dab7f&mpshare=1&scene=24&srcid=0923eKeG0wbqhfTkGzyO9xel&sharer_shareinfo=7d428589756965b537c08df65241f890&sharer_shareinfo_first=7d428589756965b537c08df65241f890#rd
- **分类**: 技术教程
- **标签**: #AI #GitHub #工具推荐 #技术分析 #效率 #深度学习 #开源 #教程 #职场 #产品

## 内容摘要
🥳重要提示：本教程仅适用于安卓（Android）手机，iOS 用户请勿尝试（估计也找不到相似软件）！

命令行 AI 代理（CLI AI Agents）已经火了很长时间了，从最早推出的 GitHub Copilot CLI，再到倍受喜爱的Claude Code CLI 想必大家都已经玩过了，但是只能在PC上使用未免太局限，想不想随时随地在手机上体验直接通过命令行与 Google Gemini 这样强大的 AI 模型对话？无论你是程序员需要分析代码，还是学生党需要整理资料，拥有一个手机版的 AI 命令行工具都能极大提升你的效率。本教程将手把手教你如何在安卓手机上安装 Google Gemini ...

## 完整内容

🥳重要提示：本教程仅适用于安卓（Android）手机，iOS 用户请勿尝试（估计也找不到相似软件）！

命令行 AI 代理（CLI AI Agents）已经火了很长时间了，从最早推出的 GitHub Copilot CLI，再到倍受喜爱的Claude Code CLI 想必大家都已经玩过了，但是只能在PC上使用未免太局限，想不想随时随地在手机上体验直接通过命令行与 Google Gemini 这样强大的 AI 模型对话？无论你是程序员需要分析代码，还是学生党需要整理资料，拥有一个手机版的 AI 命令行工具都能极大提升你的效率。本教程将手把手教你如何在安卓手机上安装 Google Gemini CLI，让你的手机变身成一个强大的生产力工具。

准备工作

一台安卓手机

科学上网环境：Gemini 的登录和部分服务需要访问 Google，请确保你的网络环境通畅（科学上网），如果没有的话直接第二部分跳到最后备选方案。

耐心：过程并不复杂，跟着教程一步一步操作。

第一部分：基础环境搭建
第 1 步：安装 Termux 终端

Termux 是一个安卓平台强大的终端模拟器，它为我们提供了一个迷你的 Linux 环境。

下载地址：

https://f-droid.org/packages/com.termux/

建议：请务必从 F-Droid 官方网站下载，应用商店的版本可能已停止更新。

网络问题小贴士：Termux 默认的下载服务器在国外，国内用户初次使用时可能会遇到速度慢或命令失败的问题。如果 pkg 命令长时间无响应，请自行搜索“Termux 换源”教程，替换为国内的镜像源后再继续操作。

第 2 步：更新系统软件包

打开 Termux，你会看到一个类似电脑命令行的黑色窗口。首先，我们需要更新所有已安装的软件包，确保环境最新。

输入以下命令，然后按回车：

pkg update && pkg upgrade -y




第 3 步：获取手机文件访问权限

为了让 Gemini CLI 能够读取和操作你手机里的文件（例如“下载”文件夹里的文档），我们需要为 Termux 开启文件访问权限。

继续在 Termux 中输入以下命令，然后按回车：

termux-setup-storage




此时，手机会弹出一个权限请求窗口，请务必点击“允许”。操作完成后，彻底关闭 Termux 应用再重新打开，以确保权限设置生效。

如果没有弹出来权限窗口，可以在手机设置里搜索文件和媒体，手动把Termux的权限打开，然后在运行一下这个代码。

第 4 步：安装 Node.js

Gemini CLI 是基于 Node.js 开发的，因此我们需要先安装它的运行环境。

输入以下命令，然后按回车：

pkg install nodejs -y




安装完成后，可以通过 node -v 和 npm -v 查看版本号，如果都成功显示，说明你的基础环境已准备就绪！

node -v
npm -v




第二部分：安装并登录 Gemini CLI

这是最核心的一步。在 Termux 中直接安装 Gemini CLI 会因为缺少电脑端的编译环境而失败。但别担心，经过我多次的失败尝试，终于找到了一个非常简单的解决方案。

第 5 步：使用特殊参数安装 Gemini CLI

在 Termux 中输入以下命令。这个命令的关键在于 --ignore-scripts 参数，它会跳过在安卓环境下无法完成的编译步骤，从而成功安装核心功能。

npm install -g @google/gemini-cli --ignore-scripts




等待命令执行完毕。你可以输入 gemini --help 来验证是否安装成功。如果屏幕上显示出一长串的帮助信息，恭喜你，安装成功！

第 6 步：登录 Google 账号

第一次使用需要登录。输入以下命令：

gemini




一般会自动跳转到登录界面，直接登录Google账号然后切回Termux就可以正常使用了；如果没有跳转，那找到程序生成的一个 Google 登录链接，长按屏幕上的链接，选择“复制”，然后把它粘贴到你的手机浏览器中打开。在浏览器里登录你的 Google 账号并授权后，再切回到 Termux，你就可以开始使用了。

第三部分：核心用法介绍

现在，强大的 AI 助手已经住进你的手机里了！我们来看看怎么使用它。

玩转你的手机文件

通过第 3 步的授权，Termux 在主目录下创建了一个名为 storage 的快捷方式，它就是通往你手机内部存储的“传送门”。

查看手机公共目录：

ls storage
# 你会看到类似列表: dcim downloads movies music pictures shared




进入“下载”文件夹：

cd storage/downloads




查看“下载”文件夹里的文件：

ls




随时返回主目录：

cd 




简单来说，先用 cd 命令进入你想操作的文件夹，然后就可以用 ls, cat 等 Linux 命令来查看文件了。

让 Gemini 读取和分析文件

这是最强大的功能之一。你可以让 Gemini 读取某个文件的内容，并对它进行分析、总结或修改。

场景示例：让 Gemini 解释“下载”文件夹里的一个代码文件

假设你的“下载”文件夹里有个 test.py 文件，你想让 AI 帮你解释代码。

# 1. 先进入“下载”文件夹cd storage/downloads
# 2. 使用 cat 命令读取文件内容，并通过管道符 | 传给 gemini
gemini "请逐行解释下面的 Python 代码: $(cat test.py)"




让 Gemini 生成内容并保存为文件

你可以让 Gemini 生成任何文本内容，并使用重定向符 > 将它直接保存为手机里的一个新文件。

场景示例：在“下载”文件夹里，快速生成一个 Python 脚本

# 1. 确保你位于“下载”文件夹cd storage/downloads
# 2. 让 gemini 生成代码，并保存为 new_script.py
gemini "写一个python脚本，功能是打印从1到100的所有偶数" > new_script.py




命令执行后，你就可以在手机自带的文件管理器里的“下载”文件夹中找到这个 new_script.py 文件了！

第四部分：进阶玩法 - 让 Gemini 成为你的命令行超强大脑

感谢歸藏（guizang）大佬的无私分享。现在，你可以直接进入任意文件夹，然后启动 Gemini，用最自然的方式让它为你操作各种强大的专业工具。

核心流程：

用 cd 命令进入你想操作的文件夹。

输入 gemini 进入交互模式。

用自然语言下达指令。

当 Gemini 准备执行操作时，会显示它将要运行的命令，并出现一个授权提示：[?] Allow execution of :...。

下面几个选项，直接点回车，Gemini 就会为你执行。

使用 ffmpeg 处理视频

ffmpeg 是什么？ 它是视频处理领域的瑞士军刀，功能极其强大，像剪映这类专业剪辑软件的底层都依赖它。你可以用它实现视频拼接、剪辑、加字幕、转格式、调分辨率、加音乐等任何你能想到的操作。

安装： 你可以先让 Gemini 帮你安装。

You: 帮我安装 ffmpeg

Gemini: (ShellTool): pkg install ffmpeg -y

Allow execution of :... <--  回车

使用示例 (剪辑视频)：

You: 我有个视频叫 travel.mp4, 帮我从第15秒开始剪辑45秒，保存成 highlight.mp4

Gemini: (ShellTool): ffmpeg -i travel.mp4 -ss 00:00:15 -t 00:00:45 -c copy highlight.mp4

Allow execution of :... <--  回车

使用 yt-dlp 下载视频

yt-dlp 是什么？ 这是一个开源的视频下载神器，和 ffmpeg 配合几乎可以下载任何主流平台的视频。

安装：

You: 帮我安装 yt-dlp

Gemini: (ShellTool): pip install yt-dlp

Allow execution of :... <--  回车

(如果提示 pip 不存在, 就先对它说 "帮我安装 python")

使用示例 (下载视频)：

You: 帮我用 yt-dlp 下载这个视频 [这里粘贴视频网址]

Gemini: (ShellTool): yt-dlp "[视频网址]"

Allow execution of :... <--  回车

使用 ImageMagick 处理图片

ImageMagick 是什么？ 它是图片处理领域的 ffmpeg，一个极其强大的工具集，可以转换格式、缩放、裁剪、旋转、加滤镜、组合图片等。

安装：

You: 帮我安装 imagemagick

Gemini: (ShellTool): pkg install imagemagick -y

Allow execution of :... <--  回车

使用示例 (转换并压缩图片)：

You: 把 photo.png 转成80%质量的jpg图片

Gemini: (ShellTool): magick convert photo.png -quality 80 photo.jpg

Allow execution of :... <--  回车

使用 Pandoc 进行文档转换

Pandoc 是什么？ 这是文档格式转换的终极利器，在 Markdown(.md) 和 Word(.docx) 等几十种格式之间轻松转换。

安装：

You: 帮我安装 pandoc

Gemini: (ShellTool): pkg install pandoc -y

Allow execution of :... <--  回车

使用示例 (Markdown 转 Word)：

You: 请用 pandoc 把我的 report.md 文件转成 report.docx

Gemini: (ShellTool): pandoc report.md -o report.docx

Allow execution of :... <--  回车

备选方案：安装 Qwen-Code

如果你在登录或使用 Gemini CLI 时遇到无法解决的网络问题，可以尝试由阿里巴巴开发的 Qwen-Code。它基于 Gemini CLI，安装和使用方法几乎完全相同。

建议通过 Qwen OAuth（qwen.ai 账号）登录，可享 每天 2,000 次请求，无 token 限制，每分钟 60 次速率限制。 自动管理凭证，无需额外费用。

点击Qwen OAuth会自动跳转到登录页面，登录成功后切回termux就可以直接使用了.

安装命令

npm install -g @qwen-code/qwen-code --ignore-scripts




登录与使用 (方法与 Gemini CLI 类似)

qwen




你可以用它作为 Gemini CLI 的一个优秀备选。

写在最后

恭喜你！现在你已经掌握了在手机上使用 AI 命令行工具的强大能力。不妨参考一下网络上其他 Gemini CLI 的高级用法教程（例如搜索“Gemini CLI 提效方法”）许多技巧在手机上同样适用。快去探索吧！




---

**处理完成时间**: 2025年10月09日
**文章字数**: 4922字
**内容类型**: 微信文章
**自动分类**: 技术教程
**处理状态**: ✅ 完成
