---
title: "白嫖！claude code中怎么使用iflow的免费模型"
source: wechat
url: https://mp.weixin.qq.com/s/QFBBEJwR4ewX77HDDopb1A
author: IT原始人
pub_date: 2025年11月6日 01:25
created: 2026-01-17 21:20
tags: [AI, 编程]
---

# 白嫖！claude code中怎么使用iflow的免费模型

> 作者: IT原始人 | 发布日期: 2025年11月6日 01:25
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/QFBBEJwR4ewX77HDDopb1A)

---

最近我发现iflow的模型不止可以在cli上面使用，我们是可以申请apikey然后后调用API来使用iflow提供的免费模型的，这样我们能用的模型就远比在cli上看到的更多。

我们直接进入正题：

心流AI助手 | 让知识随心流动 点击链接可以进去官网

点击API管理就能获取密钥

现在你已经拿到了iflow的可以了。我们要教一下怎么把这些模型转移到claude code中使用，这里面有些技巧，因为iflow的API是百分百兼容openai的，但是他并不兼容anthropic.所以小编写了一个路由转换的小工具，可以anthropic的请求通过openai的形式转发出去。文章最后会提供工具的获取方式。

第一步：

.env.example改名.env



第二步：找到



BACKEND_URL=https://api.openai.com/v1 地址改成 https://apis.iflow.cn/v1



OPENAI_API_KEY=sk-your-api-key-here key改成自己的key



TARGET_MODEL=gpt-4o 改成自己喜欢的模型id Models | 心流开放平台

第三步：
双击启动 proxy.exe 黑框不能关

这样 http://127.0.0.1:5555 就能支持anthropic的协议了

最后一步

配置一下环境变量
ANTHROPIC_BASE_URL=https://127.0.0.1:5555

配置完打开新的终端

输入：claude，这样你的claude code就已经用上了iflow的模型了

工具的获取方式：

微信扫描二维码关注“IT原始人”，回复：工具1

---
*导入时间: 2026-01-17 21:20:57*
