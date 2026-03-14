---
title: "Star 369k！public-apis：1000+免费API集合，开发者的数据宝库"
source: wechat
url: https://mp.weixin.qq.com/s/CCmVRakwOVpNBGbGniEYsA
author: 云栈开源日记
pub_date: 2025年10月13日 11:59
created: 2026-01-17 22:27
tags: [AI, 编程]
---

# Star 369k！public-apis：1000+免费API集合，开发者的数据宝库

> 作者: 云栈开源日记 | 发布日期: 2025年10月13日 11:59
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/CCmVRakwOVpNBGbGniEYsA)

---

写在前面

大家有没有遇到这种情况？自己开发个数据各种API都要付费，关键是数据质量接口质量也无法保证。做项目时最头疼什么？想开发个天气小程序，得先搭后端；想做个加密货币看板，找不到数据源；简历上的项目总是用假数据……今天分享一个GitHub上36万Star的项目，里面收录了上千个免费API，天气、金融、AI、区块链应有尽有。

这是个什么项目

public-apis 是社区维护的免费公共API目录。它不提供代码，而是把互联网上靠谱的免费API整理成清单，每个都标注了认证方式、是否支持HTTPS、能不能跨域调用。

目前收录了50多个分类、1000多个API接口，从动物图片到股票行情，从随机笑话到机器学习模型都有。

能帮你解决什么

快速搭建Demo
前端开发者直接调API拿数据，省去搭后端的时间。比如用CoinGecko接口做个币价监控，用Cat API做个随机猫图展示。

学习Web开发核心知识
实际调用API的过程中，自然就理解了RESTful规范、OAuth认证、CORS跨域这些概念，比看文档记得牢。

丰富求职作品集
选2-3个API组合起来，周末两天就能做出一个完整项目。比如"天气+新闻+汇率"的信息聚合页面，比单纯的Todo List有说服力。

上手试试
获取比特币实时价格
import requests

url = "https://api.coingecko.com/api/v3/simple/price"
params = {'ids': 'bitcoin', 'vs_currencies': 'usd'}

data = requests.get(url, params=params).json()
print(f"BTC: ${data['bitcoin']['usd']}")


不用注册，复制代码直接跑就能看到结果。

随机猫图接口
fetch('https://cataas.com/cat?json=true')
  .then(res => res.json())
  .then(data => console.log(`图片: https://cataas.com${data.url}`));


适合练习异步请求和DOM操作。

怎么选合适的API

看认证方式

No Auth：无需注册，拿来就用
apiKey：注册拿个密钥，一般免费
OAuth：想学第三方登录可以试试

看HTTPS支持
生产环境必须选HTTPS，不然数据容易被截获。

看CORS配置
前端直接调用需要CORS支持，否则得绕一层后端代理。

适合谁用
前端开发：需要真实数据做展示
后端学习：想理解API设计规范
求职准备：要做作品集项目
独立开发：降低MVP开发成本
使用建议
先浏览README找感兴趣的分类
优先试No Auth的接口
用Postman测试接口返回
结合React/Vue做个完整应用
开源到GitHub写篇技术总结
最后说两句

这个项目的价值在于降低了开发门槛。不管是学习、练手还是求职，都能从里面找到合适的资源。建议Star收藏，隔段时间看看有没有新增的API。

关注《云栈开源日记》，每天3分钟，发现实用开源项目。

📦 Github：public-apis/public-apis

原文：https://yunpan.plus/t/348-1-1

#PublicAPIs #GitHub #开源项目 #API #Web开发 #程序员工具

---
*导入时间: 2026-01-17 22:27:44*
