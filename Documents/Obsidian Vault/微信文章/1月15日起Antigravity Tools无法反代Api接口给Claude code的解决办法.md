---
title: "1月15日起Antigravity Tools无法反代Api接口给Claude code的解决办法"
source: wechat
url: https://mp.weixin.qq.com/s/40OTX3XE1cZvrz0q8RaxEQ
author: 昊影流光
pub_date: 2026年1月14日 23:16
created: 2026-01-17 20:10
tags: [AI, 编程]
---

# 1月15日起Antigravity Tools无法反代Api接口给Claude code的解决办法

> 作者: 昊影流光 | 发布日期: 2026年1月14日 23:16
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/40OTX3XE1cZvrz0q8RaxEQ)

---

一大早就炸锅了，所有用Antigravity Tools反代Api接口给Claude code使用的小伙伴都说无法使用了，看日志都报429。哪怕直接用Antigravity的也一样报错无法使用。
    有的本身账号能登录Antigravity原始客户端的，重新登录就恢复了；有的学生账号本来能登录Antigravity的，又开始报无权限了；家庭组的号大批量都不能登录，用api也报429；甚至有订阅Ultra的账号也报不能使用，反而pro账号有的可以，搞得大家都觉得Google开始封号了。
    凌晨5点左右同类的各种开源工具例如CLIProxyAPI也有人反馈同样的问题，讨论后判断是google在做灰度测试，并且之前授权登录的都存在问题，重新授权后恢复。
    但是同样的操作在Antigravity Tools重新授权了以后也暂时无法恢复使用。
    经过issue内的讨论，小伙伴们发现了一个折衷的办法，先能解决问题，恢复使用，再等待工具更新。
具体方法如下：
1、打开Antygravity原始客户端（记得开TUN模式）。
2、如果本身账号出现没权限，无法登录的用Antigravity Tools授权登录以后切换账号。
3、进入插件市场下载Antigravity Cockpit插件
4、使用Antigravity Cockpit插件的自动唤醒功能中的测试按钮，选择有问题的账号进行唤醒。
5、重启Antigravity即可恢复使用/或直接使用唤醒后的账号通过Antigravity Tools反代API使用。（使用Antigravity的需要重启，使用Tools的不需要）
    亲测确实有效，小伙伴们称作"赛博起搏器"，等待Tools更新吧。当前有问题的可以按以上方式临时处理，以恢复使用。
    突然发现重度使用AI以后，越来越依赖其作用了，如果哪天确实没法用的，会极度的不习惯，这有可能就是以后的常态吧，人机协作的时代已经到了。
    我会持续为大家带来各种经验分享，记得关注我。
精选文章：
还在卡在Antigravity授权登录？你需要这个神器！
免费试用Google云服务并无限续杯
Google Gemini pro 1年免费申请方法
2025年12月最新Google账号注册技巧
近期文章：
谷歌Cloud AI负责人预测：软件专才将不再重要！谷歌部分岗位已不再要求本科！程序员要成为系统编排者
当AI已经能够自主完成任务，我们应当如何调整工作方式？
如何用好Claude Code？它到底应该怎么用？
NoteBookLM才是Google的最大杀招
如何安装Claude Code，用上最新的Skills？
如何利用Claude Skills的形成自己独有AI助手体系？
小白没法注册Google账号？来免费试用Gemini企业版吧

---
*导入时间: 2026-01-17 20:10:17*
