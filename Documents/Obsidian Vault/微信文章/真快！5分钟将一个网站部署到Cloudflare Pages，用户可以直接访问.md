---
title: "真快！5分钟将一个网站部署到Cloudflare Pages，用户可以直接访问"
source: wechat
url: https://mp.weixin.qq.com/s/WugaIihzB_IiM_vAl39CeA
author: 浅墨 momo
pub_date: 2025年10月22日 23:07
created: 2026-01-17 21:26
tags: [编程, 产品]
---

# 真快！5分钟将一个网站部署到Cloudflare Pages，用户可以直接访问

> 作者: 浅墨 momo | 发布日期: 2025年10月22日 23:07
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/WugaIihzB_IiM_vAl39CeA)

---

Cloudflare Pages 是 Cloudflare 推出的一个静态网站托管平台，类似于：Vercel、Netlify、GitHub Pages等托管平台，支持从 Git 仓库（如 GitHub、GitLab）自动构建并部署网站。这里我选择Cloudflare Pages的原因有三点：

免费额度充足，已经足够支撑中小项目使用；

国内访问速度不受限，不需要科学上网；

部署流程简单。




接下来详细介绍下整个部署流程。

首先在Cloudflare Pages平台进入Workers & Pages页面，选择创建应用

导入Git仓库，然后选择你的网站对应的代码仓库

填写工程名称，分支，还有用到的框架，然后点击保存发布

接下来就是等它编译和发布，过程很快，我的只需要半分钟就完成了

编译完成后就可以跳转查看你的网站了

我点过去查看网页，出现一个问题，需要在Compatibility Flags settings section 模块添加 nodejs_compat

直接进入到工程对应的Settings页面，在Compatibility flags这里添加nodejs_compat这个flag即可

添加完成后重新编译，然后再次点击预览链接，即可成功查看你的网站了。接下来可以将你的域名绑定到对应的网站，用户可以直接通过你的域名来访问网站了。这个过程也比较简单，添加完域名，过几分钟验证通过了就可以直接访问了。

整个过程还是非常简单的，就花了5分钟左右，成功部署了一个网站到Cloudflare Pages上，并绑定了自己的域名上，用户可以通过域名直接访问了。




关于我：

211本科毕业，自学计算机编程，8年字节等大厂开发经验，裸辞创业，主要方向为跨境电商，结合AI做一些SaaS产品。




有些路，只有走过，才知道它通向哪里。创业是一场马拉松，不是短跑。我相信，每一次小小的坚持，每一个微小的改进，都会在未来某个时刻，以另一种方式回报给我，哪怕节奏慢一点，哪怕路上磕磕绊绊，只要不放弃，就已经在离梦想越来越近。

我的创业周报：

我的创业周报系列文章

Shopify App开发：

Shopify App开发系列

欢迎大家点击下方卡片与我交流关于创业、职场的一切~

---
*导入时间: 2026-01-17 21:26:39*
