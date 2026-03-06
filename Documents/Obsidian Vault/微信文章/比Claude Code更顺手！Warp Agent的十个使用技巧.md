---
title: "比Claude Code更顺手！Warp Agent的十个使用技巧"
source: wechat
url: https://mp.weixin.qq.com/s/sZaKzPhHG0287aTRlT6mqA
author: 字节笔记本
pub_date: 2025年12月8日 04:41
created: 2026-01-17 20:42
tags: [AI, 编程, 产品]
---

# 比Claude Code更顺手！Warp Agent的十个使用技巧

> 作者: 字节笔记本 | 发布日期: 2025年12月8日 04:41
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/sZaKzPhHG0287aTRlT6mqA)

---

如果你被Claude Code 的封号搞烦了，被Cursor的IP限制弄无语了，那么推荐使用Warp。

Warp目前来说依然是国内用户能够顺畅使用全球顶级模型Agent最方便的方式，基本上所有顶级模型模型都可以使用。

而且如果你使用体验下来之后发现它的模型能力都非常的强，很多其他的产品里面官方接口都掺了水，Warp的AI转发都还比较的真。

它的功能非常的强大，也非常的多，这里主要讲一下它特别好用的Agent的功能，下面是Warp的Agent日常使用的技巧。

有同学会问Warp Agent和Claude Code区别，其实CC大部分能做，但是集成度没有Warp Agent好，而且最新版本直接集成了编辑器功能，图形界面和可控性还有玩法比Claude Code更多，CC是手动档，要用好还得有大量的基础知识做支撑。

Warp Agent更象是自动档，上手就可以干。

Warp下载和注册地址：

https://link.bytenote.net/warp

1.上下文自动整理

Claude Code长对话会导致响应变慢、质量下降，Warp 会自动检测话题转换并建议分割。

快捷键：CMD + SHIFT + N 开新对话。

2.多fork路径

想尝试不同方案又不想污染原对话？

用 CMD + Y 打开对话菜单，fork 当前对话。

两个分支各自独立，可并行探，而在Claude Code你得会玩Git。

3.多Agent Profile

在 Settings > AI > Agents > Profiles 创建多个配置文件。

比如日常开发用 "Safe & cautious"，快速原型用 "YOLO mode"。每个 Profile 可独立设置模型、权限、自主级别。

4.更灵活的选项控制

权限相关的，我在设置项里面把 ls、grep、find 等只读命令加入 allowlist 自动执行，rm、curl、wget 等危险命令放 denylist 强制确认。

对于MCP或者使用的模型都可以单独指定。

5.用 @ 符号精准附加上下文

用@file 引用文件、@folder 引用目录大家都可以。

Warp的选项更多。

@symbol 引用代码符号、@plans 引用已保存计划。

比手动复制粘贴更高效，Agent 理解更准确。

6.用 /plan 命令处理复杂任务

输入 /plan 让 Agent 生成结构化计划，可编辑、有版本历史、支持分段执行。

计划自动保存到 Warp Drive，可导出 Markdown 分享给团队。

7.自动压缩

Universal Input 模式下有上下文窗口指示器。

接近上限时变红，超出后 Warp 自动总结。

主动在任务切换时开新对话，避免上下文溢出影响质量。

8.用 Auto 模式让 Warp 智能选模型

我一定都使用的是Auto模型，省 credits。

Warp 会根据任务类型动态选择最合适的模型。

9.多 Agent 并行，用管理面板统一监控

可在不同 pane/tab 同时运行多个 Agent。

右上角 Agent Management Panel 集中查看所有 Agent 状态，快速跳转到需要输入的对话。

而且每次完成之后都会进行进程的通知，这个时候需要你打开桌面的通知功能就可以。

10.启用 Web Search 获取实时信息

在 Agent Profile 中开启 "Call web tools"，Agent 可自动搜索最新文档、版本号、错误解决方案。

搜索结果可展开查看来源，便于验证准确性。

Warp下载和注册地址：

https://link.bytenote.net/warp

---
*导入时间: 2026-01-17 20:42:00*
