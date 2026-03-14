---
title: "Claude Code创始人曝光 13 个 Claude Code 使用技巧，告别乱改代码和反复返工"
source: wechat
url: https://mp.weixin.qq.com/s/OEQ1rpJsnPC9ZuvtkRxICQ
author: 赋范大模型技术圈
pub_date: 2026年1月8日 06:26
created: 2026-01-17 23:06
tags: [AI, 编程]
---

# Claude Code创始人曝光 13 个 Claude Code 使用技巧，告别乱改代码和反复返工

> 作者: 赋范大模型技术圈 | 发布日期: 2026年1月8日 06:26
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/OEQ1rpJsnPC9ZuvtkRxICQ)

---

Claude Code 创始人 Boris Cherny 刚公开了 13 条私藏技巧，Anthropic 社区负责人 Ado Kukic 也连续 31 天分享实战心得。
这些内容，几乎拼出了 Claude Code 从入门到精通的完整路线。
但现实是：99% 的人可能都用错了。
不是工具不行，是方法不对。这篇文章，把官方最佳实践 + 一线高手经验浓缩成一份你看完就能上手的 Claude Code 指南。
第一步：让AI真正理解你的项目
很多人上来就问问题，Claude给的答案牛头不对马嘴。为什么？
因为它不认识你的项目。
/init：让Claude给自己写入职文档
每次打开一个新项目，第一件事就运行/init命令。
Claude会引导你生成一个CLAUDE.md文件。官方建议在这个文件里写入：
常用命令（构建、测试、部署）
代码规范和风格偏好
架构决策和项目结构说明
这就相当于让新员工第一天就搞清楚公司架构、汇报线和内部规矩。
更进一步，你可以建一个.claude/rules/目录，针对不同模块设置专门规则。比如API目录下的规则文件，只在处理API代码时生效：
---
paths: src/api/**/*.ts
---
# API开发规范
- 所有接口必须包含参数校验
记住：Claude不是通灵的，你得告诉它规矩。
/memory：随时更新项目记忆
发现Claude总是用npm而不是bun？
用/memory命令直接编辑记忆文件，把规则写进去。或者让Claude生成建议，你再手动添加到CLAUDE.md。
一个好的实践是：团队共享一个CLAUDE.md文件，每次发现Claude出错，就把正确做法记录下来。这形成了一个学习闭环——Claude会变得越来越懂你的项目。
第二步：把这些快捷键刻进肌肉记忆
效率差距往往不在工具，在操作方式。
! 前缀：别浪费token问废话
不要输入："你能帮我运行一下git status吗？"
直接输入：
! git status
! npm test
! ls -la src/
!前缀会立即执行bash命令，结果自动作为上下文回传给Claude。一天下来，能省几十次窗口切换。
双击Esc：一键回滚
AI改错了？双击Esc键，立刻回到之前的状态。
你可以选择只回退对话、只回退代码、或者都回退。比手动git revert快10倍。
Ctrl+R：反向搜索历史Prompt
想找回昨天写的那条复杂提示词？
按Ctrl+R，开始搜索历史prompt。再按一次Ctrl+R继续往前找。
这个能力被严重低估——好的prompt是资产，值得反复使用。
第三步：会话管理——永不丢失上下文
开发最烦人的状况：电脑蓝屏、终端关掉、或者第二天接着干，结果得把昨天的背景再复述一遍。
Claude Code解决了这个问题。
--continue / --resume：断点续传
claude --continue    # 继续上次对话
claude --resume      # 选择要恢复的会话
会话默认保存30天。可以在配置里改cleanupPeriodDays，设成365保留一年。
/rename：给会话起名字
你的git分支有名字，你的Claude会话也该有。
/rename api-migration       # 命名当前会话
/resume api-migration       # 按名字恢复
重构、迁移、调试某个复杂bug——这些任务往往需要多个session才能完成。给它们起名字，回来就能接着干。
--teleport：跨设备同步
在一个设备上开启了会话，想在另一个设备上继续？
claude --teleport <session_id>
这个功能可以拉取并恢复会话，实现跨设备协作。
第四步：控制Claude的思考方式
很多人抱怨AI写代码"不动脑子"。
其实是因为你没让它动脑子。
ultrathink：深度思考模式
在prompt里加上ultrathink关键词，Claude会在回复前分配更多token预算（约32K量级）用于内部推理。
这就像问一个问题，对方想了半小时才回答——肯定比脱口而出的质量高。
适用场景：架构设计、棘手bug、性能优化。
代价：消耗比普通对话高。但对于复杂问题，值得。
Plan Mode：先规划再动手
用Shift+Tab可以在不同模式之间切换，包括进入Plan Mode。
Plan Mode下，Claude倾向于先读代码、分析架构、给出实现方案，而不是直接动手改代码。
好的实践：对于复杂任务，从Plan Mode开始。这一步直接影响后续的工作效率。
道理很简单：让人写代码之前先想清楚要做什么，让AI也一样。
第五步：权限与安全——既不过度保守，也不鲁莽冒进
AI操作太保守：每运行一个ls命令都要你点确认，一下午光点鼠标了。
AI操作太激进：一个rm -rf让你直接跑路。
怎么平衡？
权限控制：设置允许的操作范围
Claude Code支持细粒度的权限控制。通过CLI参数（如--allowedTools、--disallowedTools）或/permissions命令，你可以：
预先允许已知安全的命令（如npm install、npm test）
禁止危险操作
好处：不用每次都点允许，但危险操作自动拦截。
Hooks：在AI执行流程里设置检查点
你可以在这些时机插入自定义逻辑：
PreToolUse：工具使用前
PostToolUse：工具使用后
PermissionRequest：权限请求时
Notification：通知发送时
实际用途：
每次代码改动后自动运行测试
push前自动运行lint
拦截危险命令（比如force push到main）
操作完成后发Slack通知
用PostToolUse钩子可以确保代码格式一致性，避免后续CI中的格式错误。这种机制让你在AI的执行流程里掌握主动权。
第六步：自动化与团队协作
当你熟练掌握上面的技巧后，下一步是把Claude融入更大的工作流。
Headless Mode：非交互运行
claude -p "简述这些更改"
通过-p参数，Claude的输出直接流向标准输出。这意味着你可以把它写进Shell脚本，甚至塞进GitHub Actions流程里。
git diff | claude -p "Explain these changes"
claude -p "List all functions" | grep "async"
AI正式进入你的脚本和自动化流程。
Commands：把常用prompt保存成命令
/daily-standup      # 运行你的晨会流程
/explain $ARGUMENTS # 支持参数传递
通过插件系统的commands/目录，你可以把常用prompt保存成自定义slash命令。不用每次重新写。
Subagents：并行处理复杂任务
任务太大，单线程AI容易断片？
启用Subagents，主agent分配任务，子agent并行执行。每个子agent拥有独立的上下文窗口。
就像一个项目经理带几个工程师，肯定比一个全栈自己干快。
并行运行多个实例
很多高效用户会同时运行多个Claude Code实例，用系统通知提醒哪个需要输入。
你也可以在IDE中同时开启多个终端。多任务并行，效率翻倍。
第七部分：高级功能——这些才是真正的杀手锏
/context：监控Token使用
聊着聊着AI突然变傻了（忘了前面的设定），多半是上下文爆了。
输入/context，可以查看当前上下文的token使用情况（近似估算）。
上下文快满的时候，看一眼就知道该精简什么。
@ Mentions：瞬间引用上下文
@src/auth.ts        # 把单个文件引入上下文
@src/components/    # 参考整个目录
输入@会触发文件路径自动补全，支持模糊匹配。瞬间锁定你需要参考的文件或目录。
LSP Integration：语义级代码理解
LSP（Language Server Protocol）是IDE理解代码的底层协议。
Claude Code通过插件支持LSP，带来的能力包括：跳转定义、查找引用、悬停提示、获取文档信息等。
这让AI不再靠猜。它能更精准地知道改这个函数会影响哪些地方，哪些是真正的调用，哪些只是同名的注释。
Agent SDK：把能力集成到你的产品
如果你想把Claude Code的能力集成到自己的后台系统或产品里，官方提供了Agent SDK（TypeScript版本）。
通过SDK，你可以用代码调用Claude的工具能力，实现自动化的代码审查、文档生成、测试生成等场景。具体API参见官方文档。
最后：工具没有银弹，但方法有高下
看完这些技巧，你可能会问：到底哪个最重要？
答案是：验证机制。
给Claude一个验证工作的机制，是提升输出质量的关键。让它写完代码能跑测试、能看到报错、能自我修正——这比任何花哨的功能都重要。
从Claude Code获得最大收益的开发者，不是那些输入"为我做所有事情"的人。
而是那些知道：
何时使用Plan Mode
如何构建清晰的Prompt
何时调用ultrathink
如何设置Hooks在错误发生前捕获它们
AI是杠杆。但杠杆本身不产生力量——你才是支点。
这些技巧不会让你变成更好的程序员，它们只是让你原本的能力，有了配得上的放大器。
🚀 进阶学习
欢迎扫码加入 赋范空间，我们提供系统的课程体系，帮助你从零开始掌握：
​
*   AI Agent 开发：深入理解 Agent 架构与实战，打造智能体。
*   RAG 技术：构建高性能的企业级知识库问答系统。
*   MCP 协议：掌握下一代 AI 连接标准，连接万物。
*   大模型微调：掌握 Fine-tuning、RL等技术，打造专属垂直领域模型。
*   企业项目实战：15+ 项目实战（AI实时语音助手、AI文档审核、AI数据分析、智能客服系统等），将理论知识应用到实际项目中，解决真实业务问题。

---
*导入时间: 2026-01-17 23:06:29*
