---
title: "来自Anthropic｜构建Claude Code中的宝贵经验"
source: wechat
url: https://mp.weixin.qq.com/s/l8jzPQzClUnn7YbP3ZbxSw
author: 问小黑LLM
pub_date: 2025年10月13日 06:00
created: 2026-01-17 22:47
tags: [AI, 编程]
---

# 来自Anthropic｜构建Claude Code中的宝贵经验

> 作者: 问小黑LLM | 发布日期: 2025年10月13日 06:00
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/l8jzPQzClUnn7YbP3ZbxSw)

---

随着Claude Sonnet 4.5重磅发布，Anthropic也为Claude API新增了两种feature

Context editing：新增的Capability，允许一键清除过往工具响应结果，压缩上下文
（https://docs.claude.com/en/docs/build-with-claude/context-editing）
Memory tool：新增的内置Tool，提供了一个命名空间，定义了几种对memory/路径下的文件交互方式
（https://docs.claude.com/en/docs/agents-and-tools/tool-use/memory-tool）

这些更新体现了 Anthropic 正在将开发者们构建 Agent 时的高频工具进行标准化。

肉眼可见地，Anthropic的战略向Agent Developer市场倾斜。

同时，他们也把在 Claude Code 与 Claude Research 中沉淀的最佳实践进行了分享，给开发者、researcher们带来了不少可落地的 insight。

这些经验是非常宝贵的，代表了AI领域最前沿团队对Agent系统的认知。在其面向 Agent 的方法版图中，我们能看到诸多亟待攻关的科学问题，例如 memory 结构设计 与 压缩（compact）策略 等，这些完全可以作为我们后续科研工作的动机与切入点。

接下来就来一起阅读 Anthropic 于 9 月 28 日 发布的最新博客，看看有什么核心Takeaways。




00 Context Enginnering，到底在解一个什么问题？


当我们在做Context Engineering的时候，我们在解的问题其实是：

“当我以什么样的结构组织我的上下文的时候，我的模型/Agent会输出符合我预期的行为”

AI Agent的能力瓶颈，不止在模型本身，一部分也在于"注意力预算"的管理。

就像人类的工作记忆容量有限一样，LLM的上下文窗口虽然越来越大（从4K到200K甚至更多），但每增加一个token，模型对整体信息的把控能力就会下降一点。

换句话说，更长的上下文，不等于更强的能力，反而可能带来更多混乱。


01 从Prompt Engineering到Context Engineering

在ChatGPT问世的几年时间里，Prompt-Engineering一度是比较热门的研究方向。Anthropic在这篇文章中指出：

"Context engineering是prompt engineering的自然演进。Prompt engineering专注于如何编写和组织LLM指令以获得最佳结果，而Context engineering则关注在LLM推理过程中，策划和维护最优token集合的策略。"




这两者的本质区别是

Prompt Engineering是静态的——你在开始前就把所有指令、示例、背景信息准备好，然后一次性喂给模型。

Context Engineering是动态的——它要解决的是：当Agent在多轮对话中不断运行、工具调用不断累积、上下文不断膨胀时，你要如何设计你的系统策略，持续优化每一步传递给模型的信息。

举个具体的例子：

你让一个AI Agent帮你完成一个复杂的代码迁移任务。

Agent需要：

理解你的需求（初始对话）- 浏览代码库结构（文件列表、目录树）- 读取多个源文件（每个可能几千行代码）- 调用测试工具查看结果（大量log输出）- 修改代码、再测试、再修改...

这个过程可能跨越几十几百轮对话。

如果你只会Prompt Engineering，你的做法可能是：

把所有代码、所有log、所有历史对话都塞进上下文，然后祈祷模型能找到关键信息。

结果？-- 上下文窗口很快就会爆炸。

即使窗口足够大（比如200K tokens），模型的表现也会因为信息过载而急剧下降。

这就是为什么Anthropic强调：

"Context必须被视为一种有限资源，且存在边际效用递减规律。"

就像人类的工作记忆一样，LLM也有一个"注意力预算"。

每增加一个token，都会消耗这个预算的一部分。

Context Engineering的核心目标，就是在这个有限预算下，找到最小且最高信号的token集合，最大化任务成功的概率。




02 如何通过System Prompt为Agent构建合适的语境基础


在Anthropic团队的实践中，他们指出一个对Agent来说合适的System Prompt应该落在两个错误的极端之间：

极端一：过于具体，也就是将所有处理方法硬编码在System Prompt中。其弊端就是随着Agent系统的迭代，这种System Prompt会变得脆弱且难以维护，大量的corner case的出现使得这种Prompt变得越来越冗余
极端二：过于模糊与high-level。我们仍然要在System中包含比较详细的模型输出结构要求，以及一些行为的guideline，避免模型对当前所处环境产生疑惑。



图中的三个例子很好的展示了上述两种极端，以及什么样的system对于Agent来说处于合适的高度。

Blog中建议，将System Prompt进行合适的分区，用XML（< Background_Information >) 或者用md格式（ ## Instructions: ）等语言间隔不同的分区。


03 合适的Tool设计


Agent的Tool就是他们的手和脚。

几个月前Anthropic的另一篇Blog详细阐述了构建Agent所需工具的原则以及方法论（https://www.anthropic.com/engineering/writing-tools-for-agents）我们在之前的帖子中也进行了分享，具体可以参看。




04 如何为长期任务构造上下文


现在的Agent（例如Cursor、Openai Deep Research、Openai Computer Use Agent等）动辄运行几十分钟甚至几个小时，其中产生的token是当前模型能容纳的上下文窗口的几十几百倍，如何动态管理这些token是现在context engineering最核心的命题。

有的人会有疑惑，随着模型上下文窗口的持续扩充，这个命题会消失吗？

Chroma曾经做过一项研究，测试了18个主流LLM在不同上下文长度下的表现。

他们指出：

当上下文从4K扩展到128K时，所有模型的性能都会下降20-40%。

这就是Context Engineering存在的意义，模型的能力未必能随着上下文窗口同比增长，而且如今的Agent完成现实任务时所需的token远超当前的模型上下文窗口，10M，100M甚至更多。

研究发现了一个"U型曲线"现象：

模型对上下文开头和结尾的信息记忆最清晰。但对中间部分的信息，几乎处于"半失明"状态。

这就像你在读一本很长的书：开头的铺垫你记得清楚，结尾的高潮你印象深刻。但中间那几百页的细节早就忘得一干二净。

更糟糕的是，研究还发现：逻辑结构化的上下文，反而比随机排列的表现更差。

这听起来违反直觉，但原因很简单：结构化信息会让模型产生更多的"关联假设"，当信息量太大时，这些假设反而会相互干扰。

Anthropic给出了管理长期上下文的三种解法，或者说三个研究方向：

3.1 Compaction压缩上下文



Anthropic提出的第一个策略是：Compact（压缩）。

核心思想

当对话历史接近上下文窗口极限时，用模型自己对历史进行高保真总结，然后用总结替换原始内容，重新开始一个"干净的"上下文窗口。

其实就是summarize，只不过要根据Agent的框架设计比较合适的Prompt

Anthropic自己的产品Claude Code就提供了/compact工具，被动或主动的压缩超长上下文。

工作流程是这样的：

Agent在执行代码任务时，累积对话历史、工具调用结果、文件内容等
当上下文使用率达到95%时，自动触发"auto-compact"机制
Claude会总结整个用户-Agent交互轨迹，保留关键信息：
同时丢弃冗余信息：
生成的summary加上最近访问的5个文件，组成新的上下文

用户体验上，几乎感觉不到任何中断。

技术细节

具体Prompt细节可以参考CC的逆向工程 https://github.com/shareAI-lab/analysis_claude_code/blob/3a93602a/claude_code_v_1.0.33/stage1_analysis_workspace/docs/ana_docs/memory_context_analysis.md

Anthropic特别强调了一个关键点：

Compaction的艺术在于"保留什么"和"丢弃什么"的权衡。

"过于激进的压缩可能导致丢失微妙但关键的上下文，其重要性可能在后续才会显现。"

他们的建议是：

第一步：最大化召回率（Recall）

确保你的压缩prompt能够捕获轨迹中的每一个相关信息。宁可多留，不要漏掉。

第二步：提升精确率（Precision）

逐步迭代，删除真正冗余的内容。

最简单也最安全的Compaction形式是：Tool Result Clearing（工具结果清除）。

一旦工具被调用，而且结果已经被Agent理解和使用了，为什么还要在上下文中保留原始的JSON返回？

完全可以清除。

这也就是Anthropic最近在Claude Developer Platform上推出的context-editing。

3.2 Structured Note-Taking结构化地记笔记



Compaction解决了"如何在有限窗口内高效压缩"的问题。

但还有一个更根本的需求：如何让Agent拥有跨session的长期记忆？

这就是Structured Note-Taking（结构化笔记）要解决的问题。

核心理念：

将关键信息写入上下文窗口外部的持久化存储（类似于人类的笔记本），Agent在需要时可以随时读取。

Anthropic展示了一个案例：让Claude玩Pokemon游戏。（Anthropic和DeepMind不约而同地将游戏场景作为检验Agent长期记忆的setting，或许这个方向有值得做的空间）

这个游戏需要跨越数千个步骤，包括：

• 训练精灵（需要记住每个精灵的等级、技能）

• 探索地图（需要记住哪些区域已经访问过）

• 战斗策略（需要记住哪些招式对哪些对手有效）

没有任何关于记忆结构的特殊prompt，Claude自己学会了：

• 维护精确的计数器："在过去的1,234步中，我一直在1号路线训练我的宝可梦，皮卡丘已经获得了8级，目标是10级。"

• 绘制探索地图：记录哪些区域已经访问，哪些还没有

• 记录关键成就：获得了哪些徽章、解锁了哪些能力

• 维护战斗策略笔记："火焰攻击对草系宝可梦效果显著"

当上下文重置后，Claude读取自己的笔记，无缝继续多小时的工作序列。

这种跨上下文重置的连贯性，仅靠上下文窗口是不可能实现的。

技术实现：Memory Tool



为了让开发者更容易实现这种能力，Anthropic在Sonnet 4.5发布时推出了Memory Tool。

典型应用场景：

场景一：项目状态管理

Agent在执行长期项目时，可以维护一个NOTES.md文件：

# 项目进度
- [x] 需求分析完成
- [x] 数据库设计完成
- [ ] API开发进行中（当前进度：5/12个endpoint）
# 技术决策
- 使用PostgreSQL而非MySQL（原因：需要JSONB支持）
- 采用JWT认证（token过期时间：24小时）
# 待解决问题
- 文件上传模块在大文件时会超时
- 需要优化查询性能（users表已达100万条记录）

每次Agent恢复工作时，读取这个文件，立刻知道当前状态和待办事项。

场景二：用户偏好学习

Agent可以跨多次对话学习用户习惯：

# 用户偏好
- 编程风格：倾向函数式编程
- 代码规范：严格遵循PEP 8
- 沟通方式：喜欢详细解释，不喜欢简单的yes/no回答
Note-Taking vs Compaction：何时用哪个？



Compaction：需要保持对话流畅性的任务并且有大量user和agent来回交互的场景

Note-Taking：比较适合background agent的场景，也就是agent需要长期地与环境交互，完成一个任务

实际上，最佳实践是两者结合：

Agent在单个session内使用Compaction管理上下文，同时在关键节点使用Note-Taking保存长期状态。这样既保证了短期效率，又实现了长期记忆。

3.3 Multi-Agent架构，用"分工"突破上下文限制



Compaction和Note-Taking都是在"如何更好地管理单个Agent的上下文"上做文章。

但还有一个更激进的思路：既然单个Agent的上下文有限，为什么不用多个Agent分工合作？

这就是Multi-Agent（多智能体）架构的核心理念。

Anthropic的多Agent研究系统：

https://www.anthropic.com/engineering/multi-agent-research-system ，之前的帖子也分享过，可以参看，给出了清晰的论证：

"具有隔离上下文的多Agent系统优于单Agent，主要因为每个子Agent的上下文窗口可以专注于更窄的子任务。"

想象一个复杂的研究任务：

主Agent（Lead Researcher）：负责整体规划和协调
- 子Agent 1（Web Searcher）：专门负责网络搜索
- 子Agent 2（Data Analyzer）：专门负责数据分析
- 子Agent 3（Report Writer）：专门负责报告撰写

每个子Agent的上下文只包含自己任务相关的信息。

Web Searcher不需要知道数据分析的细节。

Data Analyzer不需要看到所有的搜索结果。

各司其职，互不干扰。

每个子Agent可以使用几万个token进行深度探索，但只返回1,000-2,000个token的压缩总结给主Agent。

举个例子：

Web Searcher子Agent执行了：搜索20个不同的关键词；浏览了50个网页；读取了大量的文本内容--总共消耗了50,000个token。

但它返回给主Agent的，只是一个1,500 token的结构化总结：

# 搜索结果总结
## 核心发现
1. Context Engineering已成为Agent开发的关键技能
2. 主流公司采用的三大策略：compaction、note-taking、multi-agent
## 关键数据
- Chroma研究：长上下文性能下降20-40%
- Anthropic：多Agent成本增加15倍
## 重要引用
...

主Agent的上下文窗口保持清爽，但获得了深度探索的成果。

这就是为什么Anthropic强调：

"详细的搜索上下文被隔离在子Agent内，而主Agent专注于综合和分析结果。"




结语：有限注意力下的智能博弈




Context Engineering的出现，标志着AI工程进入了一个新阶段。

我们不再追求"更大"，而是开始追求"更精准"。

从Prompt Engineering到Context Engineering，这不仅仅是技术概念的演进。

它反映了一个更深层的认知转变：

真正的智能，不在于记住所有信息，而在于知道在正确的时间关注正确的信息。

就像人类专家不是因为记住了所有细节而成为专家。

而是因为他们知道什么时候该关注什么，什么时候可以忽略什么。

Anthropic揭示的三大策略——Compaction、Structured Note-Taking、Multi-Agent——本质上都在做同一件事：

在有限的注意力预算下，最大化每个token的价值。

你认为Context Engineering最大的挑战是什么？

在你的实际项目中，哪种策略最有用？

欢迎在评论区分享你的观点和实践经验。

如果这篇文章对你有帮助，请点赞👍、转发🔄并关注"问小黑"，获取更多AI技术深度解读！

参考资料：

• Anthropic官方博客：

https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents

• Chroma Context Rot研究：

https://research.trychroma.com/context-rot

• Anthropic多Agent研究系统：

https://www.anthropic.com/engineering/multi-agent-research-system

• Claude Developer Platform：

https://www.anthropic.com/news/context-management

---
*导入时间: 2026-01-17 22:47:03*
