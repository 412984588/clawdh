---
title: "快速复刻我的内容创作流，支持 iflow 和 claude code，工作流全公开！"
source: wechat
url: https://mp.weixin.qq.com/s/itXxmDE8TSXUe8fg77GPvw
author: 二进制茶馆
pub_date: 2025年12月9日 04:02
created: 2026-01-17 20:40
tags: [AI, 编程, 产品]
---

# 快速复刻我的内容创作流，支持 iflow 和 claude code，工作流全公开！

> 作者: 二进制茶馆 | 发布日期: 2025年12月9日 04:02
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/itXxmDE8TSXUe8fg77GPvw)

---

序

在上一篇文章中，我分享了个人的内容创作工作流。很多朋友在后台&评论区留言，希望能使用这个方案。

为了让大家能直接“抄作业”，我将这套核心流程进行了打包。 支持了 iflow 和 claude code 两种客户端运行。

如何使用？

用什么客户端工具？

第一步，你需要根据自己的需求选择使用 iflow 还是 claude code。

如果你期望完全免费的运行整个流程那么就选择 iflow

如果你希望极简配置安装且拥有更高的拓展性就选择 claude code

iflow
📦 项目地址：https://github.com/xyzbit/content-assistant-iflow

你只需要安装项目 Readme 中的 Quick Start的指导进行安装、配置、使用即可。

claude code plugin
🔌 项目地址：https://github.com/xyzbit/claude-plugins

claude code plugin 中包含多个常用的 plugin（迭代中...）, 其中 content-create 包含 资料收集、内容创作、平台分发、数据分析 等相关能力。

且我极简化了安装方式，你只需要进入 Claude Code 命令行，做如下操作即可：

添加插件市场
/plugins marketplace add https://github.com/xyzbit/claude-plugins.git

安装插件
/plugins install content-create

执行交互式配置
/content-create:config


接下来claude code 会引导你 step by step 的进行初始化配置，整个过程 3-5 分钟。

更多指导你可以参考项目中 content-create 插件的 Readme.md

希望这套工具对你有帮助！如果有任何使用问题或建议，欢迎在 GitHub 上提 Issue 或 Star 支持。

---
*导入时间: 2026-01-17 20:40:12*
