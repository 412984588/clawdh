# deepseek接入微信聊天机器人，还能群聊保存瞬时笔记到 Obsidian

## 基本信息
- **标题**: deepseek接入微信聊天机器人，还能群聊保存瞬时笔记到 Obsidian
- **来源**: 微信公众号
- **作者**: 林三更
- **发布时间**: 2025年01月04日
- **URL**: https://mp.weixin.qq.com/s?__biz=MzI5MzMxMTU1OQ==&mid=2247488705&idx=1&sn=52cdd941c59589ad3dce279916ca68bf&chksm=ed8d24ffbdddd1b1f279f6a9a38dd848176b97e7d5d6146c2d39f8b82764835bf40b9e125061&mpshare=1&scene=24&srcid=0130h7ERlcx6qaR5NufvEPal&sharer_shareinfo=00c39dabdd5c39bbf0a08034f1e75670&sharer_shareinfo_first=00c39dabdd5c39bbf0a08034f1e75670#rd
- **分类**: AI技术
- **标签**: #AI #GitHub

## 内容摘要
🐤大家好，我是瓴上知更。知止而后定，遂有知更鸟在屋顶。🐤

🏡相逢是缘，点击上方蓝字关注公众号，或订阅合集：🏡

📖笔记森林：为常青而作 | 生活写给我的热爱 | 油锅不饿📖







昨天看到 wechatbot，可以在微信中和大模型对话。

于是就萌生一个想法：

是否可以通过对话将消息保存到 Obsidian 中呢？

当然可以了！

本项目基于：
- openwechat：https://github.com/eatmoreapple/openwechat
- wechatbot：https://github.com/869413421/wechatbot.git

首先，获取项目...

## 完整内容

🐤大家好，我是瓴上知更。知止而后定，遂有知更鸟在屋顶。🐤

🏡相逢是缘，点击上方蓝字关注公众号，或订阅合集：🏡

📖笔记森林：为常青而作 | 生活写给我的热爱 | 油锅不饿📖







昨天看到 wechatbot，可以在微信中和大模型对话。

于是就萌生一个想法：

是否可以通过对话将消息保存到 Obsidian 中呢？

当然可以了！

本项目基于：
- openwechat：https://github.com/eatmoreapple/openwechat
- wechatbot：https://github.com/869413421/wechatbot.git

首先，获取项目：

git clone https://github.com/zigholding/WechatObsidian.git

进入项目目录：

cd WechatObsidian

复制配置文件：

copy config.dev.json config.json

修改配置文件：

vi config.json
api_key：deepseek API
obsidian_group：保存 Obsidian 笔记的群聊名称
obsidian_daily_note：日记笔记路径，会替换 {year}{month}{day} 为当日日期；

启动项目，扫码登录：

go run main.go

项目支持 wechatbot 原生的功能，修复了每次热加载时重复回复的问题：

群聊@回复
私聊回复
自动通过回复

例如问它：你知道“知更鸟在屋顶”这个公众号吗？

咳，Kimi 就知道：


额外添加了功能：在 obsidian_group 里发消息时，会将消息自动同步到 obsidian_daily_note 的日志笔记中。

哈哈，看起来似乎鸡肋？之后就可以通过它将公众号的文章保存到 obsidian中了！

顺便说下，deepseek 的API比OpenAI好用多了！我都找不到 OpenAI 在哪儿充值，是我傻还是它蠢？

注册 deepseek api 开放平台后，点击充值页面：

https://platform.deepseek.com

充值后点击 API keys，输入名称，创建后复制 key，粘贴到 config.json 对应的 api_key 字段中即可。

送佛送到西，项目是用 golang 写的，需要到 Go官网下载页面，下载 windows 安装包。

https://go.dev/dl/

点击安装包，按默认项安装，之后在 git bash 里执行 go version，能输出版本号信息说明安装成功。

golang 的源国内使用不为，还需要设置镜像源，同样在 git bash 里输入：

export GOPROXY=https://goproxy.cn

点击阅读原文，查看项目。




关注公众号，或点击合集，查看更多内容。

---

**处理完成时间**: 2025年10月09日
**文章字数**: 1242字
**内容类型**: 微信文章
**自动分类**: AI技术
**处理状态**: ✅ 完成
