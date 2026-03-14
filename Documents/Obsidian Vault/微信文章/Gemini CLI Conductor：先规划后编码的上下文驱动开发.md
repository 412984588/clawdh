---
title: "Gemini CLI Conductor：先规划后编码的上下文驱动开发"
source: wechat
url: https://mp.weixin.qq.com/s/x5nVoIzemdPghj-101Zg6w
author: AI灵感闪现
pub_date: 2025年12月20日 19:44
created: 2026-01-17 20:24
tags: [AI, 编程]
---

# Gemini CLI Conductor：先规划后编码的上下文驱动开发

> 作者: AI灵感闪现 | 发布日期: 2025年12月20日 19:44
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/x5nVoIzemdPghj-101Zg6w)

---

探索 Conductor，Google 全新的 Gemini CLI 扩展，它将 AI 编码从混乱的聊天会话转变为结构化的、规划优先的开发模式，具备持久化上下文和规格驱动的工作流。



引言

本杰明·富兰克林曾说过："不做计划，就是计划失败。"

这句话完美适用于 AI 辅助编码。虽然 ChatGPT 和 Claude 等工具在回答问题方面表现出色，但在复杂的多会话项目中，上下文经常在对话之间丢失，这让它们显得力不从心。

Conductor 应运而生 - 这是一个革命性的 Gemini CLI 扩展，引入了上下文驱动开发的概念。它不再将 AI 交互视为转瞬即逝的聊天记录，而是帮助你创建正式的规格文档和计划，以持久化的 Markdown 文件形式与代码共存。

什么是 Conductor？

Conductor 是 Gemini CLI 的一个预览版扩展，它彻底改变了你与 AI 协作开发的方式。其核心理念简单而强大：

"将上下文作为与代码并存的托管工件。"

不再依赖临时的聊天记录，Conductor 帮助你：

在编写代码之前创建正式规格文档
跨会话维护持久化上下文
构建实施计划来指导 AI 的行为
让代码仓库成为唯一的事实来源
核心特性
1. 先规划后实施

Conductor 强制执行结构化工作流：上下文 → 规格与计划 → 实施。这确保你在动手写代码之前充分思考需求。

2. 持久化上下文文件

所有项目上下文都存储在 Markdown 文件中：

在单个聊天会话结束后依然存在
可以用 Git 进行版本控制
支持团队协作共享标准
3. 层级化任务组织

工作被组织成清晰的层级结构：

Track（轨道） - 高级工作单元（功能、缺陷修复）
Phase（阶段） - 轨道内的主要阶段
Task（任务） - 单个实施步骤
4. 对现有项目友好

与许多在现有代码库上表现不佳的 AI 工具不同，Conductor 在"棕地"开发中表现出色 - 能够很好地处理成熟项目中的架构细节。

安装

开始使用 Conductor 非常简单：

gemini extensions install https://github.com/gemini-cli-extensions/conductor --auto-update


--auto-update 参数确保你始终使用最新版本。

前置条件：

已安装并配置 Gemini CLI
已初始化 Git 仓库
安装 Node.js（Gemini CLI 需要）
命令参考

Conductor 提供五个核心命令：

命令
	
用途

/conductor:setup	
初始项目配置（每个项目运行一次）

/conductor:newTrack	
开始新功能或缺陷修复

/conductor:implement	
执行计划中的任务

/conductor:status	
查看当前进度

/conductor:revert	
逻辑回滚（基于轨道/阶段/任务，而非 Git 提交）

小技巧： 可以为 newTrack 添加描述：/conductor:newTrack "添加用户认证"

上下文驱动工作流
第一步：设置项目

运行 /conductor:setup 建立项目的基础上下文：

/conductor:setup


这会创建以下配置文件：

产品定义 - 用户、目标、功能
技术栈 - 语言、框架、数据库
工作流偏好 - TDD 方法、提交策略
代码风格指南 - 格式化、命名规范
第二步：创建新轨道

开始新工作时，创建一个轨道：

/conductor:newTrack "实现 OAuth 登录流程"


这会生成：

spec.md - 详细需求文档
plan.md - 包含阶段的可执行任务分解
第三步：实施前审查

关键： Conductor 要求在实施前进行人工审查计划。这是你完善需求并尽早发现问题的机会。

第四步：实施

执行计划：

/conductor:implement


Conductor 会系统地完成任务，并维护状态，让你可以跨会话暂停和恢复。

生成的文件结构

设置后，你的项目将包含：

conductor/
├── product.md              # 产品愿景和用户定义
├── product-guidelines.md   # 品牌声音和文案风格
├── tech-stack.md           # 技术偏好
├── workflow.md             # 开发规范
├── code_styleguides/       # 语言特定的风格指南
├── tracks.md               # 所有工作的主索引
└── tracks/
    └── <track_id>/
        ├── spec.md         # 此轨道的需求
        ├── plan.md         # 实施计划
        └── metadata.json   # 状态和元数据

最佳实践
1. 每个项目只运行一次 Setup

setup 命令建立共享的团队标准。运行一次，然后提交生成的文件。

2. 仔细审查计划

计划在实施前需要人工批准。花时间完善它们 - 修改计划比重构代码便宜得多。

3. 监控 Token 使用量

上下文密集型操作消耗更多 token。使用 /stats model 跟踪消耗。

4. 使用逻辑回滚

/conductor:revert 命令基于轨道/阶段/任务而非 Git 提交进行回滚，提供更安全的回退方式。

5. 将上下文文件作为活文档维护

你的 conductor 文件不仅仅是给 AI 用的 - 它们也是团队宝贵的文档。

Conductor 与其他 AI 工具对比
特性
	
标准聊天 AI
	
Conductor


上下文持久性
	
仅限会话
	
永久文件


规划
	
可选
	
强制


团队协作
	
复制粘贴混乱
	
共享配置


现有项目支持
	
有限
	
优秀


状态管理
	
无
	
内置检查点
对比 Amazon Q Developer Transform

虽然两者都是 AI 驱动的，但服务于不同目的：

Conductor = 日常编码的项目经理
Amazon Transform = 大规模迁移（如 Java 8 → Java 17）
对比 Cursor/Claude Code

Conductor 是 IDE 集成 AI 的补充而非替代：

使用 Conductor 进行规划和规格制定
使用 Cursor/Claude 进行编辑器内实施
实际应用场景
场景 1：新功能开发
/conductor:setup                    # 仅首次
/conductor:newTrack "添加深色模式"
# 审查生成的规格和计划
/conductor:implement

场景 2：带调查的缺陷修复
/conductor:newTrack "修复登录超时问题"
# Conductor 首先生成调查任务
# 然后是实施任务
/conductor:implement

场景 3：团队新成员入职

新开发者加入？他们可以：

阅读 conductor/product.md 了解产品上下文
查看 conductor/tech-stack.md 了解技术决策
检查 conductor/workflow.md 了解规范
立即开始使用一致的指南进行贡献
故障排除
问题
	
解决方案


找不到扩展
	
确保 Gemini CLI 已更新到最新版本


Setup 失败
	
检查你在仓库中是否有写权限


上下文过大
	
使用 /stats model 监控；考虑拆分工作


计划生成缓慢
	
大型代码库分析时可能需要耐心等待
常见问题
Q：Conductor 能用于现有项目吗？

A： 可以！Conductor 专门为"棕地"开发设计。setup 命令会分析你现有的代码库以理解模式。

Q：我可以编辑生成的计划吗？

A： 当然可以。计划是 Markdown 文件 - 在实施前根据需要编辑它们。

Q：我的代码会发送给 Google 吗？

A： Conductor 使用 Gemini API。请查阅 Google 的 AI 条款和你组织的政策。

Q：我可以将 Conductor 与其他 AI 工具一起使用吗？

A： 可以。生成的规格和计划对任何 AI 助手都是有价值的输入。

总结

Conductor 代表了 AI 辅助开发的范式转变。通过将上下文作为一等工件并将规划作为强制步骤，它解决了基于聊天的 AI 编码的核心弱点：上下文丢失和缺乏结构。

关键要点：

先规划后编码 - Conductor 强制在实施前进行规格制定
上下文为王 - 持久化文件确保会话之间不会丢失任何内容
团队就绪 - 共享配置实现跨开发者的一致 AI 交互
支持现有项目 - 与你现有的代码库协同工作，而非对抗

AI 编码的未来不仅仅是更快地生成代码 - 而是一致地生成正确的代码。Conductor 是朝这个方向迈出的重要一步。

参考资料
Conductor: Introducing context-driven development for Gemini CLI - Google 开发者博客[1]
Conductor GitHub 仓库[2]
Gemini CLI 官方仓库[3]
Spec-Driven Development with Gemini CLI - Medium[4]
引用链接

[1]
Conductor: Introducing context-driven development for Gemini CLI - Google 开发者博客: https://developers.googleblog.com/en/conductor-introducing-context-driven-development-for-gemini-cli/

[2]
Conductor GitHub 仓库: https://github.com/gemini-cli-extensions/conductor

[3]
Gemini CLI 官方仓库: https://github.com/google-gemini/gemini-cli

[4]
Spec-Driven Development with Gemini CLI - Medium: https://medium.com/google-cloud/spec-driven-development-with-gemini-cli-dfb4b88d4880



加入 AI灵感闪现 微信群 

长按下图二维码进入 AI灵感闪现 微信群




长按下图二维码添加微信好友 VibeSparking 加群

关注 AI灵感闪现 微信公众号

---
*导入时间: 2026-01-17 20:24:46*
