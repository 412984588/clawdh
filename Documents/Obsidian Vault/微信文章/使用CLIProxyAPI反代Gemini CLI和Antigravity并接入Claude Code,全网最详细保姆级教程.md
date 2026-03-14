---
title: "使用CLIProxyAPI反代Gemini CLI和Antigravity并接入Claude Code,全网最详细保姆级教程"
source: wechat
url: https://mp.weixin.qq.com/s/d1bI1KsvLLc-GyvOhNe0Zw
author: AI科学空间
pub_date: 2025年12月27日 10:53
created: 2026-01-17 20:08
tags: [AI, 编程]
---

# 使用CLIProxyAPI反代Gemini CLI和Antigravity并接入Claude Code,全网最详细保姆级教程

> 作者: AI科学空间 | 发布日期: 2025年12月27日 10:53
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/d1bI1KsvLLc-GyvOhNe0Zw)

---

Antigravity不好用，甚至连登录都是个难题，你是否有这样的苦恼，别慌，我们来用几个神器反代，直接把模型”薅“到Claude Code，爽用免费的Gemini CLI和Antigravity。
用到：CLIProxyAPI,Cherry Studio,CC-Switch
全程开魔法，不需要会员，也不需要花钱，Gemini CLI完全免费，Antigravity是最大方的渠道，如果你有会员，每账号每5h有250次Claude和400次gemini 3Pro，已经足够爽用了。而且还可以拉普通账号进家庭组，那么每个家庭组打满就是1500次Claude和2400次gemini3 Pro，在搞强度开发也能顶得住。普号的话是周限制，但也完全够日常使用。
只提供Window教程（注意我用的命令全部是在PowerShell 窗口运行的，如果你要用cmd的话，可以把命令丢给ai改一下），Linux, macOS参照CLIProxyAPI官方文档(地址：https://help.router-for.me/cn/)，其他两个工具的Linux, macOS官方文档自己搜搜。开始!
1.利用CLIProxyAPI来反代
1.1克隆仓库：
git clone https://github.com/router-for-me/CLIProxyAPI.git
cd CLIProxyAPI
克隆后切换到CLIProxyAPI目录
将CLIProxyAPI目录下的config.example.yaml 重命名为 config.yaml，然后用文本编辑器打开，仅需保留并修改以下基础配置项：注意第4行的路径中不能用反斜杠 \ ，其在 YAML 中是转义字符，需要改成正斜杠 / 或者双反斜杠 \\，再注意你使用的路径是你克隆过后的auths的路径，比如我的在E:\CLIProxyapi\CLIProxyAPI\auths，第四行就写成
auth-dir:"E:/CLIProxyapi/CLIProxyAPI/auths"
port: 8317


# 文件夹位置请根据你的实际情况填写
auth-dir: "Z:/CLIProxyAPI/auths"


request-retry: 3


quota-exceeded:
  switch-project: true
  switch-preview-model: true


  api-keys:
# Key请自行设置，用于客户端访问代理
- "ABC-123456"


1.2构建程序：
这一步需要Go 语言环境，没有的话，你需要先安装 Go：
（1）下载 Go - 访问 https://go.dev/dl/ 下载 Windows 版本的安装包
（2）安装后重启终端 - 安装完成后，关闭当前 PowerShell 窗口，重新打开一个新的
（3）验证安装
go version
然后就可以构建程序了
go build -o cli-proxy-api.exe ./cmd/server
如果构建出了问题，大概率就是Go无法下载某些依赖包，因为某些被墙了，你需要换成国内的 Go 代理。运行以下命令设置代理：
go env -w GOPROXY=https://goproxy.cn,direct

设置好后，重新编译：

go build -o cli-proxy-api.exe ./cmd/server

现在不要关闭终端，我们去配置Gemini CLI，在这里我将从创建 Google Cloud 项目开始，一步步带你完成整个授权认证过程。

1.3配置Gemini CLI：

（1）请用你的 Google 账号登录 https://console.cloud.google.com/,成功后点击箭头指的这个地方

（2）点击“新建项目”

（3）给项目命名后，点击“创建”。随意命名就行

（4）按照第一步的位置，选择刚刚创建的项目，把项目的 ID 复制下来备用。

（5）点击左上角箭头所指的位置，依次点击“API和服务” -> “已启用的API和服务”。

（6）点击“启用API和服务”。

（7）在图示的搜索框内输入 cloudaicompanion.googleapis.com，然后点击搜索到的“Gemini for Google Cloud”。

（8）点击“启用”

至此，Google Cloud 前期的准备工作就全部完成了。现在，我们回到 CLIProxyAPI 程序所在的目录，打开终端命令行，输入下面命令来授权登录，注意输入命令时没有[]，例如，在本例中就是

.\cli-proxy-api.exe --login --project_id linear-poet-482514-i2




.\cli-proxy-api --login --project_id [你的项目ID]。

随后会弹出授权页面，请使用刚才完成准备工作的 Google 账号登录。验证成功的页面如下：


回到终端命令行，可以看到认证文件已被成功保存。如果你输出下面这样的输出

说明OAuth 认证失败了，因为无法连接到 Google 的服务器 (oauth2.googleapis.com)。这是网络问题，Google 服务在国内被墙了。你需要：让终端走代理 - 在 PowerShell 中设置代理环境变量（假设你的代理端口是 7890），然后重新运行命令

# 试试 7890（Clash 默认端口）
$env:HTTP_PROXY="http://127.0.0.1:7890"
$env:HTTPS_PROXY="http://127.0.0.1:7890"
.\cli-proxy-api.exe --login --project_id api-1-482509

成功之后，以后再启动只用下面这个命令就行

.\cli-proxy-api.exe
2.验证模型
2.1去官网下载Cherry Studio

地址：https://www.cherry-ai.com/

2.2添加模型

（1）下载安装好，打开点击箭头处设置

（2）点击模型服务，点击添加

（3）填入名称和选择Gemini类型

(4)填写密钥和地址，密钥就是你在第一步CLIProxyAPI目录下config.yaml文件下的api-keys，地址填我填这个。

（5）再点击下面的模型绿色按钮管理，就能添加你想要的gemini3 pro

然后点击健康检测验证是否可行

出现绿色对号和秒数说明健康，你可以到首页试一下




3.接着反代Antigravity
这就简单了，回到你操作的终端，ctal+c关闭刚才的进程，然后运行下面的命令
.\cli-proxy-api.exe --antigravity-login
在弹出的界面登录Antigravity，页面成功后如下


终端最后一行显示Antigravity authentication successful!
这说明你已经成功了，再次运行启动命令
.\cli-proxy-api.exe
然后返回Cherry Studio再点击设置，管理你的模型，你就能看到下面的模型了
4.接入Claude Code
4.1去下载cc-swtich
地址：https://github.com/farion1231/cc-switch/releases
往下滑，找到下图箭头指的文件，点击后自动下载
4.2添加 Claude Code 供应商
下载安装好后打开，选Claude，再点击右边加号，然后点击自定义配置
配置如下图，名字随便起，官网链接不用填，API Key还是

你在第一步CLIProxyAPI目录下config.yaml文件下的api-keys，地址填我填这个。模型按我这样填，


gemini-claude-opus-4-5-thinking

gemini-3-flash-preview


gemini-claude-sonnet-4-5-thinking

gemini-claude-opus-4-5-thinking



最后去claude里面看看你的模型变了吗，同时试试能用吗，能用的话直接开始“爽吃”，不行的话再检查一下上面的步骤
至此，整个教程结束，如果对您有用的话，欢迎给博主点个关注有其他问题欢迎私信或者在评论区交流

---
*导入时间: 2026-01-17 20:08:19*
