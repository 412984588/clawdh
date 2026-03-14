---
title: "亲测：使用 CLIProxyAPI 五步搞定反代 Antigravity ，省下Gemini + Claude API 巨款"
source: wechat
url: https://mp.weixin.qq.com/s/vVlYIQZZcIm0OT4fdmUmBw
author: 洪哥等风来
pub_date: 2025年12月25日 19:00
created: 2026-01-17 20:22
tags: [AI, 编程]
---

# 亲测：使用 CLIProxyAPI 五步搞定反代 Antigravity ，省下Gemini + Claude API 巨款

> 作者: 洪哥等风来 | 发布日期: 2025年12月25日 19:00
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/vVlYIQZZcIm0OT4fdmUmBw)

---

* 文末点击"阅读原文"可查看视频教程。
一、安装并启动服务
Windows

直接下载文件解压使用：CLIProxyAPI_6.6.54_windows_amd64.zip

https://github.com/router-for-me/CLIProxyAPI/releases
Ubuntu/Linux

使用一键脚本安装

curl -fsSL https://raw.githubusercontent.com/brokechubb/cliproxyapi-installer/refs/heads/master/cliproxyapi-installer | bash
MacOS
brew install cliproxyapi
二、修改配置文件，启用网页后台
Windows

安装目录下把config.example.yaml复制一份，复制的改名为config.yaml。

Ubuntu/Linux

家(Home)目录下找cliproxyapi/config.yaml，即~/cliproxyapi/config.yaml。

MacOS

/opt/homebrew/etc目录下找cliproxyapi.conf，即绝对路径为：/opt/homebrew/etc/cliproxyapi.conf。

修改文件如下内容(登录密码最好改成你自己的)
allow-remote: true
secret-key: "my-password"
三、在命令行中，登录Antigravity，成功后拷贝网址，回填到命令行:
Windows，安装目录下
.\cli-proxy-api.exe -antigravity-login
Ubuntu/Linux，安装目录下
./cli-proxy-api -antigravity-login
MacOS，直接执行
cliproxyapi  -antigravity-login
四、 在命令行中，启动CLIProxyAPI， 并登录后台查看：
Windows/Ubuntu/Linux

直接启动。也可以加到服务中开机自启，自己搜一下吧，我这里不演示了。

MacOS
brew services restart cliproxyapi
登录网页后台，注意地址，本机的直接写localhost就行，服务器的话要填服务器的地址或域名。首次登录密码是刚才设置的 my-password ：

http://localhost:8317/management.html

五、Claude Code中使用
从网页后台获取api key，然后配置claude

{
    "env": {
        "ANTHROPIC_BASE_URL": "http://localhost:8317",
        "ANTHROPIC_AUTH_TOKEN": "your-api-key-1",
        "ANTHROPIC_DEFAULT_OPUS_MODEL": "gemini-claude-opus-4-5-thinking",
        "ANTHROPIC_DEFAULT_SONNET_MODEL": "gemini-claude-sonnet-4-5-thinking",
        "ANTHROPIC_DEFAULT_HAIKU_MODEL": "gemini-claude-sonnet-4-5",
        "ANTHROPIC_MODEL": "gemini-claude-opus-4-5-thinking",
        "ANTHROPIC_SMALL_FAST_MODEL": "gemini-claude-sonnet-4-5-thinking"
    }
}

六、其它OpenAI兼容接口中使用

地址后加个/v1就行了，即http://localhost:8317/v1。
vscode中可以通过oai插件(OAI Compatible Provider for Copilot)来添加到copilot中。

---
*导入时间: 2026-01-17 20:22:16*
