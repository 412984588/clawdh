---
title: "Claude Code 做不到的，Antigravity 做到了 | Google AI IDE 首发深度体验"
source: wechat
url: https://mp.weixin.qq.com/s/ca4tJDqqotR_v8jPim2rdg
author: 老烨的AI工具实验室
pub_date: 2025年11月19日 00:41
created: 2026-01-17 21:00
tags: [AI, 编程]
---

# Claude Code 做不到的，Antigravity 做到了 | Google AI IDE 首发深度体验

> 作者: 老烨的AI工具实验室 | 发布日期: 2025年11月19日 00:41
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/ca4tJDqqotR_v8jPim2rdg)

---

上周末，我花了三个小时试图用 Cursor+CC 生成一个交易所系统的撮合模块。它是一行行地帮我生成了80分代码，但我自己还是得在编辑器、终端、浏览器之间来回切换——改一行代码，切到终端跑测试，再切到浏览器刷新页面看效果，慢慢把代码改到100分。等写完整个订单撮合模块，我突然意识到：这跟以前手搓代码的流程好像没什么大区别。

直到这周二，Google 发布了王炸模型Gemini 3，以及 AI IDE Antigravity。

我打开他，在 Agent Manager 里输入了一句话："帮我实现一个交易所的限价订单功能，前端用 React，后端用 Rust，数据库用 TimescaleDB，需要支持高并发撮合。" 

然后我就看着他帮我完成了订单表设计、撮合引擎 API、前端交易界面、压力测试。最让我意外的是——它还在 Chrome 里把程序跑起来了！自己模拟了几笔买卖单，测试了订单匹配、成交通知的流程，最后给我截了个图，上面写着"限价订单功能已验证通过，撮合延迟 < 50ms"。

这一刻我意识到，区别不在于写得快，而在于验证得准。




Agent 模式不是新鲜事

先说一个事实：Antigravity 的 Agent 工作流并不是什么独家创新。

Claude Code 早就在做类似的事。Anthropic 推荐你用"探索-计划-编码-提交"四步工作流，还支持开多个 Claude 实例并行工作，互相验证。还可以用用 git worktrees 配合 Claude Code，同时在不同分支上重构不同的模块，效率确实高。但说实话，面对交易所这种复杂架构——订单簿、撮合引擎、风控系统、WebSocket 推送都要协同工作——Claude Code 的多终端协调就显得力不从心了。你得自己在脑子里记住哪个终端在处理什么模块、哪些接口还没定义、谁依赖谁，心智负担太重。

Codex CLI 的设计更加保守，但也是典型的 Agent 架构。它有三种自主模式：

Suggest Mode：AI 只提建议，你批准后才执行
Auto Edit Mode：AI 可以自动改文件，但运行命令前要问你
Full Auto Mode：AI 在沙盒环境里全自动干活

“任务拆解 → 多 agent 执行 → 交付结果”这套流程，已经是 2025 年 AI 编程工具的常见模式了。

那 Antigravity 凭什么值得关注？




Antigravity 的三个创新
1.Mission Control：可视化的Agent管治

Claude Code 让你自己协调多个终端窗口，Codex CLI 基本是单任务流水线。Antigravity 给了你一个可视化的 Mission Control 仪表盘。




你可以同时看到：

Agent A 在写后端 API，进度 60%
Agent B 在写前端组件，等待 Agent A 的接口定义
Agent C 在写单元测试，已完成 80%

这不是开三个终端窗口自己协调，而是系统帮你管理依赖关系、冲突检测、进度同步。就像项目管理工具里的看板视图，但这里的任务卡片会自己动。

我之前用 Cursor 配合 Claude Code 做过类似的事，但对于交易所这种跨语言、多模块、但又强耦合的系统，管理多个终端的心智负担不小。你得自己记住哪个终端在处理订单模块、哪个在写撮合引擎、哪个在做 WebSocket 推送，哪些接口还没对齐、谁先谁后。Antigravity 把这些都可视化了，依赖关系一目了然。

2.Computer Use：AI 真的看懂了运行结果

这是 Antigravity 最独特的能力，也是 Claude Code 和 Codex CLI 都做不到的——Gemini 2.5 Computer Use 的浏览器验证。

简单的说，agent 可以：

1.启动 Chrome 浏览器
2.打开你刚写好的网页
3.像真人一样填表单、点按钮
4.截图并分析页面是否符合预期
5.如果发现问题，自己改代码重新测试

让它实现一个"用户登录"功能。它写完前后端代码后，自己在浏览器里打开登录页面，填入测试账号密码，点击登录按钮，然后截图——"登录成功，页面正常跳转"。

这是真正的端到端闭环。Claude Code 和 Codex CLI 只能生成代码，最多帮你跑个单元测试，但没法验证页面在浏览器里是不是真的能用。

3.Artifacts：可验证的协作记录

当多个 agent 并行工作时，你需要知道它们在干什么、怎么协作的。Antigravity 自动生成三种 Markdown 文档：

Implementation Plan：整个任务怎么拆解的，每个 agent 负责什么
Task List：当前进度，哪些完成了，哪些在等待
Verification Report：测试结果，哪些通过了，哪些有问题




测试过程中遇到过一个 bug：订单撮合后前端没收到推送。打开 Implementation Plan 一看，Agent 2 订阅的 WebSocket 频道是 orders.matched，但 Agent 1 实际推送到的频道是 trades.completed。如果没有这份文档，我可能要花半小时才能定位到问题。

Claude Code 也有类似的工作记录，但需要你自己在多个终端日志里翻。Codex CLI 的审批模式更多是"问你一次批准一次"，缺乏整体的任务视图。




但它也有局限

说了这么多优点，Antigravity 也有不少问题。

性能问题：终端响应有时候会明显延迟，尤其是多个 agent 并行时。风扇呼呼转。Claude Code 在这方面明显更轻量。

稳定性风险：今天的流量确实巨大，异常退出，限流是常态。一开始完全无法使用，Agent执行没两步就提示额度不足（并非账号额度不足，目前无定价，是gemini3 今天用户访问量太大导致限流，换了好几个账号才完成测试）。

Google 生态锁定：深度依赖 Google Cloud，如果你的项目需要本地优先或者对数据隐私敏感，Antigravity 不适合。




实用技巧：登录卡住怎么办？

说个实际问题。很多人第一次用 Antigravity 就卡在了登录环节。

具体表现是：网页端登录 Google 账号成功了，但点击"打开 Antigravity 应用"后，软件无法启动或者一直卡在 "Setting up your account" 界面。

问题大概率在于代理设置。很多人用的是系统代理或规则模式，这种模式在浏览器里可以正常工作，但 Antigravity 应用本身需要访问 Google 服务器时就会出问题。

解决方法：

1.把代理模式改成 TUN 模式（虚拟网卡模式）
如果你用的是 Clash，在设置里找到"TUN Mode"并开启
如果是其他代理工具，找到类似的"增强模式"或"网络模式"选项
2.开启 DNS 覆写（DNS Hijacking）
在代理工具的设置中找到"DNS"相关选项
确保开启了"DNS 支持/覆写"功能
3.重启代理工具和 Antigravity
修改设置后记得重启代理
然后关闭 Antigravity 应用，重新打开

我自己就是这样解决的。改成 TUN 模式后，登录一次就顺利进去了。

另外还有一个小提示：安装时不要勾选"将 Antigravity 分配给所有扩展"。有些人反映这个选项会导致与现有的 VS Code 扩展冲突。




结语：从代码生成到任务闭环

Agent 时代已经来临——Claude Code、Codex CLI、Antigravity 都在做这件事。它们的共同点是把开发者从"编码者"变成了"架构师"，你负责定义任务，AI 负责执行。

但 Antigravity 在验证闭环上走得更远。它不只是生成代码，还能看懂代码运行的结果。Mission Control 让多 agent 协作可视化，Computer Use 让验证过程自动化，Artifacts 让整个流程可追溯。

这是从生成到闭环的一步。

未来的开发工具，竞争的不再是"生成多快"，而是"验证得准不准"。Antigravity 在这方面已经迈了一大步。

所以，下次再看到那种"哇，生成了一个视频网页，真的牛！"的评测时，你知道该问什么了：

它写完代码后，能自己验证功能是否真的正常吗？

下载地址：https://antigravity.google/

---
*导入时间: 2026-01-17 21:00:05*
