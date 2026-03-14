---
title: "这个 GitHub 神器让 Gemini 写的网站 3 秒上线，累计部署 67 万个网站。"
source: wechat
url: https://mp.weixin.qq.com/s/gR5CR_4mRTmM9c5ctyFBUA
author: 逛逛GitHub
pub_date: 2025年12月16日 02:04
created: 2026-01-17 20:24
tags: [AI, 编程]
---

# 这个 GitHub 神器让 Gemini 写的网站 3 秒上线，累计部署 67 万个网站。

> 作者: 逛逛GitHub | 发布日期: 2025年12月16日 02:04
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/gR5CR_4mRTmM9c5ctyFBUA)

---

Gemini 3 发布后令人惊艳的效果还在持续发酵。
现在的 Gemini 3 写前端代码，尤其是 HTML/Tailwind/JS 这一套已经很吓人了。
你给个草图或几句人话，它就能给你吐出一堆能跑的代码。
相信你也刷到过类似下面这种炫酷的 Vibe Coding 网站：
比如上面这两个，像贾维斯一样手势操控仪表球；还有手势控制 3D 粒子旋转，酷毙了。

本文教你 3 分钟使用开源项目 PinMe 把 Gemini 生成的应用部署到线上，发给你的好朋友，他们也能访问，也能玩。

01

Gemini 生成网站

你可以打开 aistudio.google.com，找到侧边栏的 build 模式。
然后输入你想生成应用的提示词，比如：生成一个年会抽奖程序，要求非常炫酷，支持后台上传 excel 导入人员名单、配置奖品、配置默认中奖人。

视频加载失败，请刷新页面再试

 刷新
你可以把 AI 生成的代码下载下来，在你本地就是一个这样的文件。
以前你拿到 AI 生成的代码，还得折腾 Vercel、买服务器、配 Nginx 或者是搞 GitHub Pages，挺烦的。
现在你可以使用开源项目 PinMe，一个命令把静态网站变成任何人可访问的链接。

02

部署网站

PinMe 是一个一键部署工具，如果你想把 AI 生成的网站部署到线上，可以考虑用它。
首先安装 PinMe：
npm install -g pinme

安装完成之后，可以使用下面的命令，把本地网站文件部署到线上。

pinme upload /path/to/file-or-directory

这个命令敲出去，PinMe 会开始干活，把你的文件上传到 IPFS 网络。几秒钟后，它会吐给你一个链接，通常是 .eth.limo 或者 IPFS 网关的链接。

这就完事了，你的网站已经在线上了，全球可访问。

这玩意儿不仅是快，而且很多时候是基于 IPFS 的，这意味着你的网站是钉在网络上的，很难被单点关停。

没有乱七八糟的带宽账单，特别适合做 Landing Page、个人名片、或者临时跑个 Demo 给客户看。

Gemini 3 几秒钟生成，PinMe 几秒钟上线，这效率这谁受得了。

03

项目原理

PinMe 可以简化去中心化前端（Decentralized Frontend）的发布流程。

一行命令把视频、音频、图片、代码、文件夹发布成任何人都能访问的链接。

感兴趣的可以去这个开源项目主页看看，有用点个 Star。
开源地址：https://github.com/glitternetwork/pinme

PinMe 依赖于 Glitter Protocol 的基础设施来运行：当你在本地运行命令时，PinMe 会自动检测你的静态文件目录，将其打包压缩。

文件会被上传到 IPFS 网络，并通过 Glitter Protocol 的节点进行 Pinning（钉住），防止数据因长时间无人访问而被网络垃圾回收机制清除。


上传成功后，你会得到一个 IPFS CID（内容标识符），以及一个基于网关的可访问 URL

例如 https://ipfs.io/ipfs/<CID> 或特定的网关链接。


项目愿景中包含自动更新 ENS 记录的功能，这使得你可以拥有一个像 myapp.eth 这样易读的去中心化地址，而不是一长串乱码哈希。

04

点击下方卡片，关注逛逛 GitHub

这个公众号历史发布过很多有趣的开源项目，如果你懒得翻文章一个个找，你直接关注微信公众号：逛逛 GitHub ，后台对话聊天就行了：

---
*导入时间: 2026-01-17 20:24:25*
