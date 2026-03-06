---
title: "全网最小白Claude skills安装和使用教程来了！赶快收藏！看看自动写文档是怎么回事"
source: wechat
url: https://mp.weixin.qq.com/s/kPeWImbjsEgrIpKV27WtIw
author: 我才是嘎嘎乐
pub_date: 2025年10月22日 19:30
created: 2026-01-17 22:10
tags: [AI, 编程, 产品]
---

# 全网最小白Claude skills安装和使用教程来了！赶快收藏！看看自动写文档是怎么回事

> 作者: 我才是嘎嘎乐 | 发布日期: 2025年10月22日 19:30
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/kPeWImbjsEgrIpKV27WtIw)

---

Claude 10月16日发布了最新的更新，skills技能，网络上分享的挺多，但是对于没有网络环境的小白来说还是有一些门槛。

这里我就把纯国内网络环境，如何使用写个说明（claude code 没配置好的，先看上篇文章）：

一、claude skills 是什么？

Claude Skills 是 Anthropic 官方开源的“可插拔”技能包仓库，把常见任务（PDF/Excel/PPT 解析、内容创作、数据清洗、网页抓取等）封装成 即拷即用 的本地技能。 每个技能只有一个 SKILL.md 说明书 + 可选脚本模板等。

Claude Code 读取后自动把步骤映射成对话指令，用户 @skill名 即可一键执行。 

通俗易懂：

① 可组合 —— 像乐高，多个Skill可串并联。写论文时“搜文献Skill+画图Skill+排版Skill”一起上。
② 可移植 —— 同一套文件夹在Claude网页、Claude Code命令行、API端都能用，不用改代码。
③ 可执行 —— 不再只是“生成建议”，而是直接跑脚本、写文件、操纵电脑（受限环境）。
④ 省Token —— Claude只在命中时才把整本手册读进上下文，平时只占几十token的“目录”，省钱。




仓库地址： https://github.com/anthropics/skills 

MIT 许可证，可自由商用、二次开发。

有网络环境的可以自己看，没有的下载我链接里的工具包：

链接：https://pan.quark.cn/s/cf1a4fa9fbe4

二、安装
1. 解压下载的工具包（上边分享里下载的），解压下来的工具包就是你的一个“工具市场”源，自己找一个位置存放。




2. 打开命令行窗口->启动claude code->：输入/plugin
3. 选择Add marketplace
4. 添加市场源地址
改写前：
C:\Users\clay_\Downloads\skills-main\skills-main
改写后：（因为claude 启动在\clay_\ 下，所以底下的地址使用相对路径）
./Downloads/skills-main/skills-main 

把改写后的一行路径粘贴到下图的位置，回车。

5. 安装skills，选择第一个，回车。

如果有多套技能，分别回车安装两次。

6. 提示生效：
7. 测试一下：

安装后会生成配置文件：

三、测试

让它查查有哪些skills，直接写个详细介绍word文档，它会根据技能的描述方法和脚本去帮你做任务，提升精准度：

生成word文档：




Claude skills 还支持自定义的形式，关注后续分享。




目前，skills还只支持命令行工具里使用，不支持插件使用。

没想到人工智能发展到了今天，

知识的获取又回到了与苏格拉底对话的方式，

计算机的智能又回到了命令行的形式。。

---
*导入时间: 2026-01-17 22:10:54*
