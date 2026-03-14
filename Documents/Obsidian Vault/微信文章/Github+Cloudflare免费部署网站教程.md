---
title: "Github+Cloudflare免费部署网站教程"
source: wechat
url: https://mp.weixin.qq.com/s/fOpSB27xhTC7wjM-KHwCGw
author: AFF超人不会飞
pub_date: 2025年10月20日 20:30
created: 2026-01-17 22:16
tags: [AI, 编程]
---

# Github+Cloudflare免费部署网站教程

> 作者: AFF超人不会飞 | 发布日期: 2025年10月20日 20:30
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/fOpSB27xhTC7wjM-KHwCGw)

---

点击上方蓝字关注我们

Cloudflare对我们来说，是一个可以免费白嫖很多东西的超级网站，像CDN、网站托管等等，今天我们来介绍一下如何把网站部署到Cloudflare上,这里以我自己今天做的网站举例。

我想做一个网站来推广Fiverr，我继续使用Cursor（之前换成codex一段时间，但是提示词不够精准，额度很快就用光了），并使用claude4.5模型来生成网站。

经过几次反复完善，基本可以用了（具体思路可以查看这篇文章），我告诉AI我要部署到cloudflare上，让AI给我写好部署文档，我按步骤操作：

OK，它已经准备好了。我们下面一步一步进行部署上线。我们需要购买一个域名，这里不赘述。然后，我们需要把域名解析到cloudflare上去。我们在cloudflare后台点击“加入域”。


复制域名到箭头处，继续。

选择免费计划即可。

我们把Cloudflare提供的名称服务器配置到域名管理的后台即可，等待生效。
下面我们开始把网站文件同步到Cloudflare上去。

我们的网站文件，先上传到github上，cursor可以设置自动同步到github仓库，非常方便。为什么不直接上传到Cloudflare？因为我们这个网站不是简单的纯静态html，涉及到一些环境配置，直接上传到Cloudflare会有问题，我们的开发预览都是在github存储的，AI推荐通过github把内容和环境一起同步过去。

下一步需要同步到cloudflare上，我们在cloudflare面板里找到“workers 和 Pages”，选择pages里的“Import an existing Git repository”。

选择connect github。

命名我们的项目名称，点击创建项目。

下一步这里我们把github授权给Cloudflare。

选择我们在gihub创建的Fiverr仓库。

然后保存和部署，我们先选择默认即可。下面的需要配置一些东西，根据你的项目需要的环境，cursor会提示如何配置。

部署成功了。

部署完成后，已经可以用cloudflare提供的链接打开了。

我们需要把我们自己的域名绑定过来。我们点击custom domains里的"set up a custom domain"。

输入我们自己的域名，继续。

配置DNS。




这一步在前面添加域名时已经操作好并生效的话，会直接跳到下面这一步。







我们输入域名访问一下，已经能正常访问网站了。

如果域名添加不成功，请确保cloudflare的配置入下图，排查一下问题。

这样，我们就通过github+cloudflare实现了网站的托管，并且是完全免费的。

往期推荐

回顾过去精彩文章

受论坛的启发赚3.9万美元

Afflift论坛优惠码

自动化建站教程

谷歌自动换链高级应用

汇丰众安银行申请记录

Propellerads优惠码

20分制作Landing Page

Paypal提现教程

Maxconv优惠码

一个万刀offer介绍

我的博客重新营业了

---
*导入时间: 2026-01-17 22:16:17*
