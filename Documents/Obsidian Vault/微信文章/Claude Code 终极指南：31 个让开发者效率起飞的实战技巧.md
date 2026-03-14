---
title: "Claude Code 终极指南：31 个让开发者效率起飞的实战技巧"
source: wechat
url: https://mp.weixin.qq.com/s/8WDDgebQqwjX_cEq7WL4VQ
author: ITPostman
created: 2026-01-17
---

# Claude Code 终极指南：31 个让开发者效率起飞的实战技巧

> 作者: ITPostman | [原文链接](https://mp.weixin.qq.com/s/8WDDgebQqwjX_cEq7WL4VQ)

---

在刚刚过去的 12 月，Ado Kukic 在 X/Twitter 和 LinkedIn 上发起了一个 "Advent of Claude" 活动，每天分享一个 Claude Code 的实用技巧。

它最终汇聚成了一张彻底改变软件开发方式的“藏宝图”。

本文将这 31 个技巧汇编成一份详尽的指南，从入门必备到高级 Agent 模式，带你通过这 31 个功能，掌握 AI 时代的人机协作之道。无论你是初学者还是资深玩家，这里都有你需要的“黑科技”。

第一部分：快速上手 (Getting Started)

在使用具体功能之前，先让 Claude Code 读懂你的项目。

1. /init — 让 Claude 自动生成项目说明书

每个项目都需要文档，用 /init，Claude 会自己写。




它会扫描你的代码库并生成一个 CLAUDE.md 文件，包含：

构建和测试命令
关键目录及其用途
代码规范和模式
重要的架构决策

这是我在任何新项目中运行的第一条命令。对于大型项目，你还可以创建 .claude/rules/ 目录，存放模块化的规则文件（如 testing.md, api.md），Claude 会自动读取它们作为项目记忆。

2. 记忆更新 (Memory Updates)

想让 Claude 记住某些偏好，而不想手动编辑 CLAUDE.md？




直接告诉它：

“Update Claude.md: 在这个项目中始终使用 bun 而不是 npm”

保持编码心流，无需中断。

3. @ Mentions — 秒级上下文注入

@ 是给 Claude 提供上下文的最快方式。




@src/auth.ts — 立即添加文件上下文
@src/components/ — 引用整个目录
@mcp:github — 启用/禁用 MCP 服务器

在 Git 仓库中，文件建议速度快约 3 倍，且支持模糊匹配。这是从“我需要上下文”到“Claude 已获取上下文”的最短路径。

第二部分：必备快捷键 (Essential Shortcuts)

把这些刻进你的肌肉记忆里，效率倍增。

4. ! 前缀 — 极速运行 Bash 命令

别浪费 Token 问“你能运行 git status 吗？”




直接输入 ! 加上你的命令：

! git status
! npm test
! ls -la src/


这会立即执行 Bash 命令并将输出注入上下文。没有模型处理延迟，不消耗 Token，无需切换终端窗口。一天用上几十次，你会离不开它。

5. 双击 Esc — 时光倒流 (Rewind)

想尝试一个大胆的想法，又怕搞砸？




尽管去试。如果方向错了，双击 Esc 即可回到干净的检查点。你可以回退对话、代码更改，或者两者都回退。（注意：已运行的 Bash 命令无法撤销）

6. Ctrl + R — 反向搜索 (Reverse Search)

你的历史 Prompt 都是可搜索的。




按键
	
动作

Ctrl+R	
开始反向搜索

Ctrl+R
 (再次)
	
在匹配项中循环

Enter	
运行选中项

Tab	
编辑选中项

别再重复打字了，直接调用记忆。这与 Slash 命令配合同样完美。

7. Prompt 暂存 (Stashing)

就像 git stash，但是用于你的 Prompt。




Ctrl+S 保存草稿。先发送别的指令，准备好后草稿会自动恢复。再也不用复制到记事本，也不会在对话中途打断思路。

8. 智能建议 (Prompt Suggestions)

Claude 能预测你接下来想问什么。




完成一个任务后，有时会出现灰色的后续建议：

Tab: 接受并编辑
Enter: 接受并立即运行

以前 Tab 补全代码，现在它补全你的工作流。可通过 /config 开启此功能。

第三部分：会话管理 (Session Management)

Claude Code 是一个持久化的开发环境，优化它能让你事半功倍。

9. 断点续传 (Continue)

误关终端？电脑没电？完全没问题。




claude --continue# 瞬间恢复上一次会话
claude --resume    # 显示列表选择历史会话


上下文完美保留，工作流无缝衔接。

10. 会话命名 (Named Sessions)

Git 分支有名字，你的 Claude 会话也该有。




/rename api-migration       # 命名当前会话
/resume api-migration       # 按名称恢复
claude --resume api-migration  # 命令行直接恢复

11. Claude Code Remote — 跨端传送

在网页上开始任务，在终端里完成它。




# 在 claude.ai/code 开启会话，它会在后台运行
# 回到终端：
claude --teleport session_abc123


这会将云端会话“传送”到本地。支持 iOS/Android 移动端及桌面端。

12. /export — 留存记录

有时你需要“呈堂证供”。




/export 将整个对话导出为 Markdown：

你发送的所有 Prompt
Claude 的所有回复
所有工具调用及其输出

完美的文档素材，也是复盘学习的最佳资料。

第四部分：生产力利器 (Productivity Features)

消除摩擦，唯快不破。

13. Vim 模式

不想手离键盘去鼠标点击？




输入 /vim 解锁全套 Vim 快捷键编辑 Prompt (h j k l, ciw, dd 等)。多年练就的 Vim 肌肉记忆终于在 AI 工具里派上用场了。再次输入 /vim 即可退出。

14. /statusline — 自定义状态栏

定制终端底部的状态栏。




/statusline 可配置显示：Git 分支、当前模型、Token 用量、上下文占比、自定义脚本等。一眼掌握关键信息。

15. /context — Token 的 X 光片

想知道是什么吃光了你的 Context Window？




输入 /context 查看详情：System prompt、MCP server、CLAUDE.md、加载的 Skills、对话历史各自占用了多少。

16. /stats — 你的使用仪表盘

2023: "看我的 GitHub 绿格子" 2025: "看我的 Claude Code 数据"。




/stats 展示你的使用习惯、最爱模型、连胜纪录等。

17. /usage — 了解极限

“我要超额度了吗？”




/usage 通过可视化进度条显示当前用量。知己知彼，方能极限操作。

第五部分：思考与规划 (Thinking & Planning)

控制 Claude 如何解决问题。

18. Ultrathink — 深度思考模式

用一个关键词触发深度推理：




> ultrathink: 设计我们 API 的缓存层


加入 ultrathink，Claude 会在回答前分配最多 32k Token 进行内部推理。对于复杂的架构决策或棘手的 Debug，这往往是“表面回答”与“深刻洞见”的区别。

19. Plan Mode — 谋定而后动

先扫清迷雾。




双击 Shift+Tab 进入 Plan 模式。Claude 会：

阅读并搜索代码库
分析架构和依赖
起草实施计划但它不会修改任何代码，直到你批准计划。 三思而后行，一次做对。我 90% 的时间都默认使用 Plan 模式。
20. Extended Thinking (API)

直接使用 API 时，启用 extended thinking 可以看到 Claude 的逐步推理过程，便于调试复杂逻辑。

第六部分：权限与安全 (Permissions & Safety)

没有控制的力量只是混乱。

21. Sandbox Mode — 沙盒模式

/sandbox 让你一次性定义边界，Claude 在边界内自由活动。




支持通配符语法（如 mcp__server__*）批量授权。既有速度，又有安全。

22. YOLO Mode — 狂野模式

厌倦了 Claude 问“我可以运行这个吗？”




claude --dangerously-skip-permissions


这个 Flag 对一切说 Yes。名字里带有 dangerously 是有原因的——请仅在隔离环境或完全受信任的操作中使用。

23. Hooks — 生命周期钩子

在特定事件发生时自动运行 Shell 命令。




支持 PreToolUse, PostToolUse, PermissionRequest, Notification 等。你可以用它来拦截危险命令、发送通知、记录日志等。这是对概率性 AI 的确定性控制。

第七部分：自动化与 CI/CD

Claude Code 不止于交互式会话。

24. Headless Mode — 无头模式

把 Claude Code 当作强大的 CLI 工具集成到脚本中：




claude -p "修复 Lint 错误"
claude -p "列出所有函数" | grep "async"
git diff | claude -p "解释这些变更"


-p 参数让 Claude 非交互式运行并将结果输出到 stdout。让 AI 进入你的流水线。

25. Commands — 可复用的 Prompt

把常用 Prompt 保存为命令。




创建一个 Markdown 文件，它就变成了一个 Slash 命令，甚至支持参数：

/daily-standup          # 运行你的晨会 Prompt
/explain $ARGUMENTS# /explain src/auth.ts


不要重复造轮子，把你最好的 Prompt 封装起来。

第八部分：浏览器集成 (Browser Integration)
26. Claude Code + Chrome

Claude 现在可以直接操作 Chrome 了：




导航页面、点击按钮、填写表单、读取控制台错误、检查 DOM、截图。“修复 Bug 并验证它能工作”现在只需要一条指令。

第九部分：高级玩法：Agent 与扩展

这才是 Claude Code 真正强大的地方。

27. Subagents — 子智能体

圣诞老人不自己包所有礼物，他有精灵。Subagents 就是 Claude 的精灵。




每个 Subagent 拥有独立的 200k 上下文窗口，并行执行专门任务，最后将结果合并回主 Agent。像圣诞老人一样放权吧。

28. Agent Skills — 技能包

Skills 是教会 Claude 特定任务的指令、脚本和资源的集合。




一次打包，处处使用。无论是你们公司的部署流程、测试方法论还是文档标准，都可以封装成 Skill。

29. Plugins — 插件生态

以前分享配置要发 47 个文件，现在：




/plugin install my-setup


一个插件包罗万象（Commands, Agents, Skills, Hooks, MCP servers）。

30. LSP 集成 — IDE 级智能

LSP 支持让 Claude 拥有 IDE 级别的代码理解能力。




即时诊断错误、代码导航、类型感知。Claude 现在像 IDE 一样懂你的代码。

31. Claude Agent SDK

只需 10 行代码，构建你自己的 Agent。




import { query } from '@anthropic-ai/claude-agent-sdk';
// ...


驱动 Claude Code 的核心引擎现在作为 SDK 开放了。这仅仅是个开始。

结语

当我们回顾这 31 个技巧时，我们看到的不仅是功能列表，更是一种人机协作的哲学。

Claude Code 最棒的功能都在于赋予你控制权。Plan Mode、Skills、Hooks、Sandbox... 这些工具是为了让你与 AI 协作，而不是向它投降。

用好 Claude Code 的开发者，不是那些输入“帮我做所有事”的人，而是那些懂得何时使用 Plan Mode，如何构建 Prompt，何时调用 Ultrathink，以及如何设置 Hooks 防患于未然的人。

AI 是杠杆。这些功能帮你找到了最佳的支点。

本文翻译整理自 Ado Kukic 的 "Advent of Claude"，图片与视频素材归原作者所有。
