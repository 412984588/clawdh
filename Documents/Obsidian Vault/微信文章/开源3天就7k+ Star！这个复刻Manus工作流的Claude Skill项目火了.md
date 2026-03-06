---
title: "开源3天就7k+ Star！这个复刻Manus工作流的Claude Skill项目火了"
source: wechat
url: https://mp.weixin.qq.com/s/4tSzlq3FgzN09U1JL6ZWrw
author: 东哥说AI
pub_date: 2026年1月13日 09:05
created: 2026-01-17 20:11
tags: [AI, 编程, 产品]
---

# 开源3天就7k+ Star！这个复刻Manus工作流的Claude Skill项目火了

> 作者: 东哥说AI | 发布日期: 2026年1月13日 09:05
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/4tSzlq3FgzN09U1JL6ZWrw)

---

点击蓝字
 
关注东哥

欢迎关注东哥，一起探索AI，在AI时代掌握更多的技能，创造更多的可能！


在AI工具生态持续爆发的当下，一款能精准复刻热门工作流的开源项目总能迅速抓住开发者的目光。近日，名为「Planning with Files」的Claude Skill项目悄然上线，仅用3天时间，GitHub星标数就突破7000+，成为近期AI工具领域的一匹黑马。这款项目以复刻Manus工作流为核心，为Claude赋予了更高效的文件规划与处理能力，一经开源便引发开发者圈的广泛关注。

为什么它能快速出圈？

Manus工作流凭借其在文件管理、任务规划上的高效性，成为不少AI从业者的「心头好」，但受限于使用门槛和定制化需求，很多开发者难以灵活适配。而「Planning with Files」的出现，恰好填补了这一空白——它专为Claude打造，完美复刻Manus核心工作流，让普通开发者也能轻松为Claude配置专业级的文件规划能力。

从核心能力来看，该项目并非简单的功能移植，而是深度适配Claude的交互逻辑，解决了AI在处理多文件、复杂任务时的规划盲区。无论是文件模板调用、任务流程钩子配置，还是用户自定义脚本，都能通过这个Skill快速实现，大幅降低了Claude定制化开发的成本。

核心版本与功能亮点

「Planning with Files」的版本迭代围绕实际使用场景展开，每个版本都针对性解决了关键问题，以下是核心版本的功能梳理：

版本	功能	安装方式
v2.1.2	修复模板缓存问题	/plugin install planning-with-files@planning-with-files
v2.1.1	修复插件模板路径	详见https://github.com/OthmanAdi/planning-with-files/releases
v2.1.0	兼容Claude Code v2.1，支持 SessionStart 钩子、PostToolUse 钩子，可由用户调用	详见https://github.com/OthmanAdi/planning-with-files/releases
v2.0.x	提供钩子、模板、脚本	详见https://github.com/OthmanAdi/planning-with-files/releases
v1.0.0	核心3文件模式	git clone -b legacy

其中，v2.1.0版本是该项目的「里程碑版本」——不仅完成了与Claude Code v2.1的兼容适配，还新增了SessionStart、PostToolUse两类关键钩子，支持用户直接调用功能，让开发者无需深入底层代码，就能快速实现工作流的触发与定制。而最新的v2.1.2版本则聚焦于体验优化，修复了模板缓存的核心问题，进一步提升了插件运行的稳定性。

开发者该如何上手？

对于想要快速体验的开发者，不同版本有对应的安装方式：

最新稳定版（v2.1.2）：直接通过指令 /plugin install planning-with-files@planning-with-files 即可完成插件安装，无需复杂的环境配置；
历史版本/定制化开发：可前往项目GitHub Releases页面（https://github.com/OthmanAdi/planning-with-files/releases）下载对应版本，legacy版本（v1.0.0）则可通过 git clone -b legacy 克隆源码，基于核心3文件模式进行二次开发。

项目还提供了详细的CHANGELOG.md文档，清晰记录了每个版本的更新细节、问题修复记录，开发者可根据自身需求选择适配版本，同时也能通过Issue区反馈使用过程中遇到的问题，项目维护团队的响应效率也成为其收获高星标的重要原因之一。

最后

「Planning with Files」的爆火，本质上反映了开发者对「轻量化、高适配」AI工具的迫切需求。它没有追求复杂的功能堆砌，而是精准聚焦「复刻Manus工作流」这一核心场景，通过持续的版本迭代打磨体验，最终凭借实用性和易用性赢得了市场认可。

目前，该项目仍在持续更新中，后续是否会接入更多AI模型、拓展更多工作流模板，值得期待。对于想要提升Claude使用效率的开发者来说，这款7k+ Star的开源项目，无疑是近期值得一试的优质工具。

如果想了解更多细节，可前往项目主页：https://github.com/OthmanAdi/planning-with-files一探究竟。

我是东哥，大模型算法工程师，职场努力搬砖，业余时间寻找第二曲线、探索更多人生可能，聚焦AI编程、AI智能体、大模型私有化方向。

如果你想加入我的免费AI编程交流群，直接扫码下方左边二维码、备注【AI编程】，还可以领取一份见面礼🎁

如果你想关注并跟随AI的最新动态，可以扫下方右边二维码关注公众号【东哥说AI】、不再错过最新AI资讯和实用干货内容📚

东哥微信：发送暗号【AI编程】加入专属交流群	东哥说AI公众号：实时获取最新AI工具动态

	

最后，记得点赞、在看、推荐，你的每一次互动，都是我持续更新的最大动力！





扫码找到东哥
AI智能体 | AI编程
大模型部署 | RPA

---
*导入时间: 2026-01-17 20:11:55*
