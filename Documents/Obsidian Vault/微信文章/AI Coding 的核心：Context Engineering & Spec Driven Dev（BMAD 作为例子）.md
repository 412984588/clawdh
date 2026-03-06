---
title: "AI Coding 的核心：Context Engineering & Spec Driven Dev（BMAD 作为例子）"
source: wechat
url: https://mp.weixin.qq.com/s/yfMziAdW9VhnW6zmnfXaqA
author: 程序员飞扬
pub_date: 2025年12月22日 09:24
created: 2026-01-17 23:03
tags: [AI]
---

# AI Coding 的核心：Context Engineering & Spec Driven Dev（BMAD 作为例子）

> 作者: 程序员飞扬 | 发布日期: 2025年12月22日 09:24
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/yfMziAdW9VhnW6zmnfXaqA)

---

目录
开场
核心问题
Context Engineering 核心概念
Context is Everything
The Dumb Zone（愚蠢区）
使用 AI 的几种方式
Naive Way - 一直聊到 context 用完
Smarter - 及时重新开始
Even Smarter - Intentional Compaction 有意压缩
使用 Sub-agents 管理上下文
Spec-Driven-Development = Research-Plan-Implement (RPI)
Research（研究）== 真相的压缩
Plan（规划）== 意图的压缩
Implement（实现）
Research 阶段
方式 1：一次性加载所有的信息
方式 2: Progressive Disclosure 渐进式披露
方式 3: On-demand Compressed Context 按需压缩上下文
Plan 阶段
Hierarchy of Leverage（杠杆层级）
问题复杂度 vs 上下文工程
选哪些 SDD 框架？
SDD 框架 = Software 3.0
BMAD 框架介绍
三种规划轨道
工作流四阶段
BMAD 框架使用
核心要点总结
参考资料

本文关于 Context Engineering 的部分，主要引用了 Dex Horthy (CEO, HumanLayer) 在 AI Engineer 上的演讲。对他的演讲做了一些总结和结构化的提炼，并删除了部分内容。非常推荐去看原演讲。

开场

今天我来分享一下 AI Coding 的核心 —— Context Engineering 和 Spec Driven Development。我会以 BMAD 作为 Spec Driven Development 的例子，它是一个比较有名的 SDD 框架。

整个分享分为两大块，一个是介绍 Context Engineering 的核心概念，再引出 Spec Driven Development 的核心步骤。

第二个部分介绍一下 BMAD Method 这个 SDD 框架，展示使用的步骤。

最后是总结。好，我们开始吧。

核心问题
Productivity by Task Complexity

上图是斯坦福大学的一个研究（研究了 100k 开发者），把效率提升分为两个象限：

一个是项目的成熟度，绿地（Greenfield 就是从零开始的项目）和棕地（Brownfield 就是已经有一些历史代码的项目）
另一个是任务的复杂度

可以看到，绿地的提效非常高，但是棕地项目，提效就不是那么明显了。为什么？因为缺少相关的上下文。

这也说明了 AI Coding 很大的问题就是上下文工程。如果缺乏上下文工程的话，就会有一些很常见的问题，比如不遵守架构模式，重复造轮子，不知道项目是什么情况 等等

为什么绿地项目问题不大呢？因为你是从零开始，很多这些问题都无所谓。但棕地项目就不一样了，这些问题会非常突出。

Context Engineering 核心概念
Context is Everything

Dex 介绍了两个 Context Engineering 的核心概念。

第一个是 Context is Everything，就是上下文就是全部。

Context is Everything

为什么这么说呢？因为我们在 AI Coding 的时候使用的大语言模型是无状态的，唯一影响它下一步输出的就是它目前上下文里面的内容。

这里面有 System Prompt、我们给的一些信息、它自己读的一些文件。它会根据自己上下文里的信息来决定下一步应该是 写一个新文件，还是 编辑一个现有文件。

有什么上下文就产出什么结果，这就是 Context is Everything。

The Dumb Zone（愚蠢区）
Smart Zone vs Dumb Zone

研究发现，上下文用得越多，model 越蠢。Context Window 用了 40% 之后，表现就会开始明显的下降。

前 40% 的 context 它还是挺聪明的，这叫 Smart Zone。但是超过 40% 之后呢，就进入了一个叫 Dumb Zone 的区域，就变得蠢了。

这也解释了为什么安装太多 MCP Tools 会有问题 —— 它们会挤满你的上下文，直接进入 Dumb Zone。

使用 AI 的几种方式

了解了上下文的重要性之后呢，来看看实际使用 AI 的几种方式。

1. Naive Way - 一直聊到 context 用完
Naive Way

第一种是最原始的方式，一直聊一直聊，聊到 Context 用完，纠偏也是在同一个 session。

稍微提一嘴，Cursor 的计费方式其实是鼓励这种做法的，它按 request 使用量计费，逻辑就是跟它对话的一个 session 就算一次 request。如果你新开一轮对话的话，那就又算一个 request，尽管你那一个对话只是说了一个"hi"。这就是鼓励你把任务都放在在一个 Session 里面搞，因为你想省 request 嘛。

这也是我觉得 Cursor 不太好的一个地方。（不知道现在计费方式变没）

Cursor Usage
2. Smarter - 及时重新开始
Start Over vs Resteer

第二个稍微好一点的方式： 说着说着发现 AI 理解有问题，怎么办？不是直接在同一个 session 纠偏，而是开一个新的 session，然后带上之前漏的内容，比如"一定要用 XYZ 的 方式"。

3. Even Smarter - Intentional Compaction 有意压缩
Intentional Compaction

第三个方式就是有意的做一个压缩，叫 Intentional Compaction。

你叭叭说一大堆之后呢，就写一个 prompt 说，“把我们最近做了些什么都把它写到一个文档里”。这样的话下一次对话就可以直接引用这个文档。压缩的内容就包括文件搜索的结果、代码理解的结论、编辑和测试的内容等等。

Claude Code 它自带一个 /compact 这样一个 slash command 来压缩。

使用 Sub-agents 管理上下文
Managing Context with Sub-agents

Sub-agent 可以用来管理 context。

如果不用 Sub-agent，那搜索过程中产生的一大坨上下文都会在你的主 agent 里面。但如果用了 Sub-agent，主 agent 的上下文只会有一点点 —— 就是 Sub-agent 返回的精简结果。这样就可以大大节省上下文。

Dex 的观点是，Sub-agent 不是用来拟人的（比如前端 Agent、后端 Agent、QA Agent），而是用来控制 context 的（fork 一个新的上下文，然后返回精简的结果）。

Spec-Driven-Development = Research-Plan-Implement (RPI)
Frequent Intentional Compaction Workflow

这是使用 AI 的第四个方式。刚才第三个叫 Intentional Compaction，这个叫 Frequent Intentional Compaction，就是频繁的有意压缩。

其实也可以叫它为 Spec Driven Development，或者更好的名字可能就是 Research-Plan-Implement，简称 RPI。

核心思想就是整个工作流围绕上下文管理来构建。这三个阶段 —— Research、Plan、Implement —— 都在 Smart Zone 里完成，而不是堆到一个 context window 里面全都搞完。每次压缩都会产生相对应的文件。

1. Research（研究）== 真相的压缩

第一步是 Research，就是研究阶段。

有几个关键点：理解系统怎么工作的，找到相关的文件。Research 是真相的压缩，就是代码库的真相。

下面是一个例子：

Research Example
2. Plan（规划）== 意图的压缩

第二个是规划阶段。

Plan 是意图的压缩，就是你要做什么事。关键点是：要有明确的步骤，包含文件名、代码片段、测试方式。

下面是一个例子：

Plan Sample
3. Implement（实现）

第三步就是按 Plan 去实现了。

所以你看，每个阶段都会有一个新的 context，Research 一个、Plan 一个、Implement 一个，这样的话就能更好地管理上下文，不会撑爆。

Research 阶段

然后再细讲一下 Research 阶段。repo 里面有一堆文件目录模块，怎么压缩？有三种方式。

方式 1：一次性加载所有的信息
Big Ball of Mud Onboard

第一种方式就是直接把代码库所有的相关信息压缩到 repo 里面，写一个大的介绍文件。如果文件太大，会直接把 Smart Zone 爆掉，所以这是不好的做法。

方式 2: Progressive Disclosure 渐进式披露
Progressive Disclosure

第二个方式是渐进式披露。

repo 的根目录里面先有一些基本的介绍，然后在每个模块里面再有一些单独的记忆文件（比如 CLAUDE.md）。到了某个模块工作之后再加载那个模块的文件。这样就会还在 Smart Zone 里，Context 不会那么容易爆掉。

阿里 Qoder 的 Repo Wiki 就是这样做的，它会根据代码库不同的模块生成对应的文档出来，然后在代码库更新的时候这个 wiki 也会更新。

Repo Wiki

这个方法的一个问题是比较复杂，另外一个问题就是下图展示的： 代码、名字、注释、文档，越往后走会有越来越多的 lies。

Amount of Lies
方式 3: On-demand Compressed Context 按需压缩上下文
On-demand Compressed Context

方式三是比较推荐的做法，叫按需压缩上下文。

要做某个 Research 的时候，可以用 Sub-agent 来搜索和分析。一个 agent 去搜索 research 这一块的 truth，另一个 agent 分析另一块，几个 agent 分头去做，然后再把结果写到一个 research.md 文档里面。这样的话，都是基于当前的文件来产出的文档，可靠性高。后面要讲的 SDD 框架也是这么做的。

Plan 阶段
可读性 vs 可靠性
Readability Reliability Sweet Spot

Plan 阶段有个点要注意，就是可靠性和可读性是负相关的关系。Plan 越长当然越可靠，但是越长就越难懂。所以 Plan 的长度需要适中。

Hierarchy of Leverage（杠杆层级）
Hierarchy of Leverage

如果有一行烂的 Code，那只是 1 行烂代码。

如果有一行烂的 Plan，会导致 10 到 100 行烂代码。

如果有一行烂的 Research（就是系统理解错了），会导致 1000+ 行烂代码。

如果有一行烂的 Spec （就是需求），会导致 10000+ 行烂代码。

所以我们人工 review 的时候，要专注到影响非常大的部分，就是杠杆非常大的部分。

这里 Dex 也提到一个观点：Don't Outsource the Thinking，不要把思考外包出去。AI 会放大你的思考，它可能放大你的好思考，也会放大你的坏思考。

问题复杂度 vs 上下文工程
Problem Complexity vs Context Engineering

那有人会问，这个 RPI 会不会杀鸡用牛刀了？

所以会把问题分为两个象限，根据问题的复杂度会有不同的策略。

改小的改动可能直接跟它说就行了。如果是复杂点的话，可能要 Research + Plan。更复杂的话可能就要多轮 RPI，叫 Multiple Research Multiple Plan。

但是我怎么知道要选哪个方式呢？他的建议是选一个工具，然后多练。因为你练多了，你就知道 Agent 能力到底在哪一个地方。不推荐切来切去。

Dex 他没有详细说 “工具” 是什么意思，我理解工具包括三个部分：

一个是 model。一个是 Coding 工具，比如用 Claude Code 还是 Cursor。 还有一个是 Spec-Driven Development (SDD) 框架的选择。

选哪些 SDD 框架？
SDD Frameworks Map

我这边把图加了一下注释，复杂一点的项目可以用 BMAD，中等的可能用 Spec-Kit，简单一点的可以用 feature-dev （Anthropic 官方的插件），或者是用内置的 Plan Mode。

简单展示一下这几个框架。BMAD 的话是针对大需求的，GitHub 上有 25K star，功能非常多，非常重量级。

BMAD Commands

然后 Spec-Kit 就非常简单，就只有几个步骤，是 GitHub 出品的，56K star。

Spec-Kit

还有 Anthropic 官方的 feature-dev ，Claude Code 可以用/plugin 直接装进去，它有一些 agent 和一个 command，更轻量。

Feature Dev
SDD 框架 = Software 3.0
Software Evolution

这里接着提一嘴 Andrej Karpathy 的一个演讲，他是 Tesla 的 Director of AI。他提到软件有三个版本：1.0 是代码，2.0 是神经网络的权重，3.0 就是 Prompt。可以说软件 3.0 就是用 Prompt 来编程。

Sentiment Classification Example

举个例子，区分情感这个任务：用软件 1.0 的话可能就是写一堆 if else，如果包含 good、great 这些词，就判断是正面情感。 如果用软件 2.0，就是用神经网络权重来做，训练一个模型出来。3.0 就是用 Prompt 来做，给一些 example，让大模型来分析。

其实为什么我们要理解 BMAD 呢？你看它的实现（见下图），可以看到非常像一个软件 —— 里面有 YAML，有各种配置，非常复杂，完全等同于一个复杂的开源软件了。

BMAD as Software

所以我觉得未来如果还不用这些 SDD 框架，就约等于 “明明有开源的 MySQL 但你还是要自研数据库”。现在应该关注起来。

BMAD 框架介绍

下面来介绍一下一个比较有名的 SDD 框架 —— BMAD Method。搞清楚这个的话，就可以搞清楚很多其他框架了。

三种规划轨道

它提到有三种轨道，就是三种使用它的方式：

轨道
	
适用场景
	
故事数量

Quick Flow	
Bug 修复、小功能
	
1-15

BMad Method	
功能集、集成
	
10-50+

Enterprise	
企业级扩展
	
30+

Quick Flow 我用起来不咋地（当然可能之后会优化），我觉得简单的任务直接用 Plan Mode 就行。BMad Metod 就是我们现在准备介绍的。企业级的我们不涉及，就不说了。

工作流四阶段

主要是分为四个阶段：

分析（可选）：brainstorm-project、research、product-brief
规划（必需）： Quick Flow 用 tech-spec，BMad/Enterprise 用 prd
解决方案设计：create-architecture → create-epics-and-stories → implementation-readiness
实施：sprint-planning → create-story → dev-story → code-review

官方的流程图：

BMAD 工作流程图
BMAD 框架使用
整体流程图

我们用的是简单版的流程。整体的流程是这样的：

原始 PRD 
    ↓ 导出 Markdown
原始 PRD.md 
    ↓ shard-doc 切分
切分后的文件
    ↓ BMad PRD 工作流
BMad PRD.md
    ↓ create-architecture
Architecture.md
    ↓ create-epics-and-stories
Epics + Stories
    ↓ sprint-planning
sprint-status.yaml
    ↓ 实施循环
create-story → dev-story → code-review

步骤 1：获取和切分 PRD

第一步肯定是得把这个 PRD 给捞出来嘛。一般就用 “导出成 Markdown”。 这里我用的 PRD 是让 Claude 生成的一个电商的 PRD （当然不可能直接给你企业里的了）。

原始 PRD 示例

原始 PRD 可能非常长，所以直接塞给 AI 的话，上下文就直接爆了，直接进入到刚才说的 Dumb Zone 了，所以要使用 /shard-doc 来切分。

# 在 Claude Code 中
/bmad:core:tools:shard-doc


它会按标题的结构来切分。切分之后就变成好几个小文件了，每个文件里面内容就比较少了。这时候我们就可以让它先读几个小文件，而不是全都 load 进去，这样就不会撑爆它的 context。

切分后的文件结构
步骤 2：运行 BMad PRD 工作流

然后再运行 PRD 工作流，这个流程会把原始 PRD 转换成 BMAD 的规范格式。

# 在 Claude Code 中
/bmad:bmm:workflows:create-prd


工作流会：

读取切分后的原始 PRD
提取功能需求（FR）和非功能需求（NFR）
与你确认关键需求
生成 BMad 格式的 PRD.md

生成的 PRD 会长成这样子：

BMad PRD 示例
步骤 3：创建架构文档

然后再走 Architecture 这个流程，运行 `/create-architecture

架构文档示例
步骤 4：生成 Epic 和 Story

运行 create-epics-and-stories 工作流。

/bmad:bmm:workflows:create-epics-and-stories


这一步和 PRD 阶段的区别就是：这里会涉及一些实现层的内容。

一个 Epic 里面会包含好几个 Story。有点像 OKR 的关系 —— 大 O 下面就是 KR。每个 Story 会有 Business Value，验收标准，还有依赖的分析等等。

Epic 示例
步骤 5：Sprint 规划

然后就是做 Sprint Planning 冲刺规划了。

/bmad:bmm:workflows:sprint-planning


它会生成一个 YAML 文件来追踪状态，后续工作流会自动读取这个文件来决定下一步

Sprint Status 文件示例
步骤 6：创建详细 Story

然后就是跑/create-story 了，

/bmad:bmm:workflows:create-story


工作流会：

读取 sprint-status.yaml 找到下一个 backlog 状态的 story
读取对应的 epic 上下文
生成详细的 story 文件（含 tech-spec）
自动更新状态为 drafted 或 ready-for-dev

就是会生成一些详细的 story 文件，包含技术方案。还会把 story 拆成更详细的 task，可能还会提到一些模型设计。比最初的那个阶段又再细化了一下。

Story 文件示例

所以你看，这就是 Multiple Research，Multiple Plan 的体现 —— 它不只是用一个大的文件作为一个 Plan，而是每个 Story 都会做一个 Research，做一个 Plan。

如果你忘了 Multiple Research，Multiple Plan 是啥，我把那个图再贴一下到这：

Problem Complexity vs Context Engineering
步骤 7：实施 Story

开始编码实现。

/bmad:bmm:workflows:dev-story


工作流会：

读取 story 文件和 tech-spec
按照 tech-spec 的步骤实施
运行测试确保质量
更新 sprint-status.yaml 状态为 review
步骤 8：代码评审
/bmad:bmm:workflows:code-review


评审内容：

代码质量（可读性、可维护性）
测试覆盖率
是否满足所有接受标准
与现有代码的集成

评审通过后，状态更新为 done。

步骤 9： API 测试（可以前置，也可以后置）

这一块不在 BMAD 里面，但是我们实践中会用到。因为单元测试还是有一些局限性嘛，而 API Test 是端到端的测试，会更可靠。

总体来说，是推荐前置的，因为这就符合这个 ATDD 的这个原则，而且这样的话，AI 就可以自己修了嘛。（当然大部分的企业都是都是后置的）

我们现在实现了 AI 自动创建、自动修复 API Test。

自动创建

我们的 API 测试平台上面测试用例以 JSON 文件保存，让 AI 根据 Story 的验收条件编辑这个 JSON 文件，然后再调用平台的开放接口，把这个用例保存起来就行。

当然在实践过程中，以 JSON 这样保存还是比较麻烦，因为它会有很多不需要的字段，还有些字段是重复的。

为了节省 Context，我把它定义成一个 JS 文件：

它可以自动转化成对应的 API Test 平台的 JSON 格式。
可以做一些代码提取，重复的字段用变量定义，测试用例更简洁。
运行 JS 就是调用接口更新测试用例。

算是一点小的创新。

自动修复

这个其实很简单，就是两个 Tool，一个可以运行测试，一个可以查日志。

运行测试的 Tool

基于 API Test 的开放接口封装了一个 CLI 工具，然后有一些小的改进，比如：

轮询测试用例是不是跑完了
执行后 会提取 trace ID 出来 并 prompt 提示 agent 可以使用查日志的 CLI 工具来查 trace 的日志
把 API Test 平台的接口返回值做了一些精简，这样可以节省 context

查日志的 Tool

基于原有的查日志的 CLI 再封装了一下成为自己团队用的 CLI，也是有一些优化和 context engineering 这个我就不细讲了。

简单说说为什么我选 CLI 而不是用 MCP 吧：

针对自己的场景做定制优化比较方便
不会让 MCP Tool Definition 挤爆你的上下文
支持渐进式披露（Progressive Disclosure），Agent 可以自己使用-h 来查看各个命令怎么用
自己可以很方便地在 Terminal 去调用。
核心要点总结

总结一下核心要点：

上下文就是一切 - LLM 是无状态的

Context is Everything

保持在 smart 区 - 避免 dumb 区

Smart Zone vs Dumb Zone

压缩是关键 - 压缩真相 (Research) 和意图 (Plan)

On-demand Compressed Context

Human in the Loop - 专注于最高杠杆部分

Hierarchy of Leverage

选择适合的工具，多练

SDD Frameworks Map
参考资料

No Vibes Allowed: Solving Hard Problems in Complex CodebasesDex Horthy (CEO, HumanLayer) - AI Engineer https://www.youtube.com/watch?v=rmvDxxNubIg

Software Is Changing (Again)Andrej Karpathy - Y Combinator https://www.youtube.com/watch?v=LCEmiRjPEtQ

Does AI Actually Boost Developer Productivity? (100k Devs Study)Yegor Denisov-Blanch (Stanford) - AI Engineer https://www.youtube.com/watch?v=tbDDYKRFjhk

Vibe Coding in Prod (Responsibly)Erik Schluntz (Anthropic) - Anthropic https://www.youtube.com/watch?v=fHWFF_pnqDk

---
*导入时间: 2026-01-17 23:03:02*
