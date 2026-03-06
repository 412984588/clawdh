---
title: "用zcf+CCSwitch 一键配置claude code所有功能+自定义模型全攻略（绝不踩坑版）"
source: wechat
url: https://mp.weixin.qq.com/s/otFWI7ywa4iDJSQX9LRPew
author: 小雨寥寥
pub_date: 2025年10月16日 03:03
created: 2026-01-17 22:45
tags: [AI, 编程]
---

# 用zcf+CCSwitch 一键配置claude code所有功能+自定义模型全攻略（绝不踩坑版）

> 作者: 小雨寥寥 | 发布日期: 2025年10月16日 03:03
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/otFWI7ywa4iDJSQX9LRPew)

---

1.先用ZCF初始化环境

官网如下  https://github.com/UfoMiao/zcf   

npx zcf
2.再配置API的时候 直接先跳过
3.用claude code 客户端。（建议不用codex客户端，但是用codex gpt5 的模型）

我试了很多 。codex客户端不支持好多中转站。然后zcf也可以很简单配置openRouter，但openRouter对codex客户端不友好。模型claude code确实太贵了，所以用claude code客户端，配上ccSwitch 简直不要太香。

4.配置CCSwitch（免费的放心使用）

下载地址：https://github.com/farion1231/cc-switch/releases

直接在这里配置MCP 服务。然后服务商先选择 魔塔社区。因为魔塔社区有免费每天2000额度的调用 。地址如下：

https://www.modelscope.cn/

选用最屌模型

  ZhipuAI/GLM-4.6

5.配置中转站uniVibe.（这是我找的唯一一家包月套餐的，不用担心用的多扣的多，一个月只要75）

如果是不喜欢包月的 七牛Ai也不错。也支持CCSwitch 配置。

6.点击启用（建议先用免费的魔塔Ai试用效果。）
7.配置MCP。

zcf已经帮我们配置了8个mcp。其他我们自己添加。不用的记得关了免费浪费token

8 开始使用Ai编程。（记住要用规范开发，spec）。

/zcf:workflow

他会先跟你把需求弄明白再开发这样就不会返工了。

9.BMAD 企业工作流：内置产品、项目、架构、研发、测试等多角色代理，支持绿地/存量项目，能自动生成文档，/bmad-init 一键初始化。（这个我不会暂时也用不到）
10.我测试过。我的方法兼容windows、macos。

总结：用claude code客户端配上中转站的gpt5-codex 真的很爽！！！强烈建议不要参考其他人的就参考我的 真是一堆坑。

如果觉得我的文章对你有帮助的话，可以帮我点个赞👍或者喜欢❤，让更多跟你一样好品味的人看到这些内容，感谢🙏

---
*导入时间: 2026-01-17 22:45:12*
