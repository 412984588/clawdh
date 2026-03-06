---
title: "Claude Code Skill：我是如何用它拯救"AI味写作"，并用半天搭建公众号自动化工作流的——超级个体第99天日报"
source: wechat
url: https://mp.weixin.qq.com/s/iNlO_szshprx_egRDJP8Mg
author: 郝朋友的AI进化论
pub_date: 2025年10月25日 12:25
created: 2026-01-17 22:08
tags: [AI, 编程]
---

# Claude Code Skill：我是如何用它拯救"AI味写作"，并用半天搭建公众号自动化工作流的——超级个体第99天日报

> 作者: 郝朋友的AI进化论 | 发布日期: 2025年10月25日 12:25
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/iNlO_szshprx_egRDJP8Mg)

---

Claude Code Skill：我是如何用它拯救"AI味写作"，并用半天搭建公众号自动化工作流的
痛点

之前用Claude Code写东西，经常遇到这些问题。

每次都要重复给它上下文。烦。

它总是"自作主张"。你想先讨论选题再写，它直接给你生成一篇。

想要个性化的写作风格？没戏。

想要它遵循特定流程？做梦。

** 核心问题：没法把工作流固化下来。 **

每次都是一次性协作。下次又得重新教。

Skill解决了什么

Claude Code的Skill功能，就是为了解决这个问题。

简单说：** Skill让你把工作流打包成一个模块，Claude自动调用。 **

你不需要每次都重复解释规则。

创建一次，到处使用。

3分钟理解Skill
什么是Skill

Skill是个文件夹，里面放：

说明文档（SKILL.md）
工作流程（workflows/）
参考模板（templates/）
其他支持文件

Claude读了这些文件后，就知道怎么干活了。

与Slash Command的区别

** Slash Command **：你主动触发。

比如你输入 /review，Claude才开始代码审查。

** Skill **：Claude自动判断。

你说"帮我审查代码"，Claude识别到任务，自动加载对应的Skill。

不用记命令，更自然。

Skill的四大特点

** 1. 可组合（Composable） **

多个Skill可以自动协同。

Claude识别任务后，自己决定调用哪几个Skill。

** 2. 可移植（Portable） **

同一个Skill，在Claude.ai网页版、Claude Code CLI、API都能用。

写一次，到处用。

** 3. 高效（Efficient） **

Skill描述很短，只占几十个token。

完整细节只在需要时才加载。

对比：GitHub的MCP要消耗数万token，Skill只要几十个。

** 4. 强大（Powerful） **

Skill可以包含可执行代码。

不只是生成文字，还能调用脚本、执行任务。

5分钟创建第一个Skill
文件结构

最简单的Skill，只需要一个文件：

.claude/skills/code-reviewer/
└── SKILL.md


复杂点的Skill，可以加支持文件：

.claude/skills/wechat-writer/
├── SKILL.md           # 主文件
├── workflows/         # 详细流程
├── templates/         # 模板文件
└── guidelines/        # 参考指南

SKILL.md格式

必须包含YAML头部：

---
name: code-reviewer
description: |
  自动代码审查工具。当用户请求代码审查、代码检查、
  或代码优化时使用。检查代码规范、性能问题、安全漏洞。
---

# Code Reviewer

## 使用场景

当用户说：
- "帮我审查这段代码"
- "检查代码有没有问题"
- "优化一下这个函数"

## 审查流程

1. 读取代码
2. 检查规范（命名、格式、注释）
3. 检查性能（算法复杂度、不必要的循环）
4. 检查安全（SQL注入、XSS等）
5. 给出建议

## 输出格式

使用Markdown清单：
- ✅ 做得好的地方
- ⚠️ 需要注意的地方
- ❌ 必须修复的问题


** 关键点 **：

name：只能用小写字母、数字、连字符，最多64字符
description：说清楚** 什么时候 **用这个Skill，包含触发关键词
内容：详细说明工作流程
创建第一个Skill

动手试试：

# 创建目录
mkdir -p .claude/skills/code-reviewer

# 创建SKILL.md
cat > .claude/skills/code-reviewer/SKILL.md << 'EOF'
---
name: code-reviewer
description: |
  代码审查工具。当用户请求代码审查、代码检查、
  代码优化时使用。
---

# Code Reviewer

## 审查流程

1. 读取代码
2. 检查命名规范
3. 检查性能问题
4. 检查安全漏洞
5. 给出改进建议

## 输出格式

- ✅ 优点
- ⚠️ 建议
- ❌ 问题
EOF


完成！

现在你对Claude说"帮我审查这段代码"，它会自动加载这个Skill。

实战：创建公众号写作Skill

下面我们创建一个复杂的Skill：公众号写作助手。

需求分析

公众号写作需要什么？

** 结构化流程 **：理解需求 → 搜索资料 → 讨论选题 → 写作 → 审校 → 配图
** 个性化风格 **：保持作者的写作风格
** 降AI味 **：让文章读起来像人写的
** 真实素材 **：用真实案例和数据
目录结构设计
.claude/skills/wechat-writer/
├── SKILL.md                          # 入口导航
├── workflows/                        # 详细流程
│   ├── wechat-article.md            # 公众号文章流程
│   ├── video-script.md              # 视频脚本流程
│   └── xiaohongshu-post.md          # 小红书流程
├── guidelines/                       # 参考指南
│   ├── style-guide.md               # 写作风格指南
│   └── review-checklist.md          # 审校清单
├── templates/                        # 模板
│   ├── brief-template.md
│   └── topic-discussion-template.md
└── personal-materials/               # 个人素材库
    ├── style-samples/               # 风格参考文章
    └── raw-data/                    # 原始素材（即刻动态等）

SKILL.md：入口导航
---
name: wechat-writer
description: |
  自动化写作工作流。用于创建公众号文章、视频脚本、小红书内容等。
  关键词：写作、文章、博客、脚本、内容创作、真实内容、AI检测、个人风格
---

# 自动化写作工作流

## 概述

这个skill提供全面的写作助手功能，通过结构化的工作流创建真实、高质量的内容。

核心特点：
- 真实数据优先
- 保持个人风格
- 低AI检测率（目标<30%）
- 透明决策过程

## 工作流决策树

### 第一步：检测任务类型

** A. 新写作任务（有详细需求） **
→ 执行对应工作区的完整流程

** B. 新写作任务（只有需求，没有brief） **
→ 先提取需求创建brief
→ 然后执行完整流程

** C. 编辑已有文章 **
→ 阅读原文
→ 理解修改需求
→ 进行最小化编辑
→ 审校修改内容

** D. 审校/降低AI检测率 **
→ 跳转到三遍审校流程
→ 重点执行风格审校（去除AI味）

### 第二步：检测工作区类型

** 公众号文章（长文） **
→ 阅读 `workflows/wechat-article.md`

** 视频脚本 **
→ 阅读 `workflows/video-script.md`

** 小红书内容 **
→ 阅读 `workflows/xiaohongshu-post.md`

## 核心原则（不可妥协）

1. ** 绝不编造 **
   - 所有数据、案例必须真实
   - 引用必须有来源

2. ** 绝不用过时信息 **
   - 新话题必须搜索
   - 验证技术细节

3. ** 绝不省略Think Aloud **
   - 始终解释推理过程
   - 不确定时询问澄清

4. ** 绝不跳过用户确认（关键决策） **
   - 话题选择必须用户决定
   - 重大方向变更需要批准

## 快速开始

新写作任务：
1. 说明需求："帮我写一篇关于XX的文章，3000字"
2. Skill自动检测工作区和任务类型
3. 加载相应流程
4. 你在关键点参与（话题选择、提供素材）

编辑已有文章：
1. 提供文章和修改需求
2. Skill进行针对性修改
3. 提供审校

降低AI味：
1. 提供文章："这篇AI味太重"
2. Skill执行三遍审校
3. 提供修改对比

## 详细流程

详见：
- 公众号文章：`workflows/wechat-article.md`（完整9步流程）
- 视频脚本：`workflows/video-script.md`
- 小红书内容：`workflows/xiaohongshu-post.md`

workflows/wechat-article.md：详细流程

这个文件包含完整的9步流程。

篇幅较长，这里展示关键部分：

# 公众号文章写作工作流

## 完整9步工作流

### 第1步：理解需求并保存Brief

** 操作 **：
1. 仔细阅读用户需求
2. 提取关键信息（主题、受众、字数、截止时间）
3. 创建待办清单（使用TodoWrite工具）
4. 保存brief到 `_briefs/项目名-日期-brief.md`

### 第2步：信息搜索与知识管理 ⭐

** 必做情况 **：
- 新产品/新技术（2024年后发布）
- 不熟悉的概念
- 需要最新数据

** 搜索策略 **：
1. 多渠道搜索（官方文档、科技媒体、社区讨论）
2. 信息验证（至少2个来源交叉验证）
3. 保存到 `_knowledge_base/主题-日期.md`

### 第3步：话题讨论 ⭐（必做，不可跳过）

** 核心原则 **：不要直接写！先讨论话题。

** 操作 **：
1. 生成3-4个话题方案，每个包含：
   - 吸引人的标题
   - 核心角度
   - 详细大纲
   - 工作量评估
   - 优势和劣势
   - 是否需要真实测试

2. 等待用户选择（使用AskUserQuestion工具）

### 第4步：创建协作文档（条件触发）

** 触发条件 **：需要真实测试或配图

包含：
- 测试任务清单
- 配图需求清单
- 时间和成本预估

### 第5步：学习你的写作风格

** 操作 **：
1. 阅读 `guidelines/style-guide.md`
2. 分析 `personal-materials/style-samples/` 中的2-3篇文章
3. 提取风格特征：
   - 开头方式
   - 句子长度
   - 语气态度
   - 标点使用

### 第5.5步：使用个人素材库 ⭐

** 核心原则 **：用真实经历、观点、案例替代AI生成内容

** 操作 **：
1. 在 `personal-materials/raw-data/` 中搜索关键词
2. 找到相关的真实素材
3. 改写成长文逻辑
4. 融入文章

** 典型使用场景 **：
- 文章开头：用真实经历引入
- 观点支撑：用真实评价
- 案例展示：用真实项目
- 结尾思考：用个人洞察

### 第6步：等待用户提供测试数据（条件触发）

如果需要真实测试，等待用户完成并提供数据。

### 第7步：创作初稿

基于真实数据写作，保持个人调性，融入真实素材。

### 第8步：三遍审校 ⭐

** 第一遍：内容审校 **
- 事实准确
- 逻辑清晰
- 结构合理

** 第二遍：风格审校（降AI味） **

删除AI味：
- ❌ "在当今时代..." → ✅ 直接切入
- ❌ "显著提升" → ✅ 具体数字
- ❌ "值得注意的是" → ✅ 删除废话
- ❌ "综上所述" → ✅ "所以"

改写策略：
- 加入真实细节
- 加入个人态度
- 口语化
- 删除废话

** 第三遍：细节打磨 **
- 句子长度（15-25字）
- 段落不太长（3-5行）
- 标点使用自然
- 节奏有变化

### 第9步：文章配图 ⭐

1. 分析配图需求（5-8张）
2. 创建图片文件夹
3. 获取/生成图片（优先级：用户提供 > 公共领域 > AI生成）
4. 插入到Markdown
5. 验证显示

guidelines/style-guide.md：写作风格指南
# 写作风格指南

## AI味典型特征（必须删除）

** 1. 套话开头 **
- ❌ "在当今时代..."
- ❌ "随着...的发展..."
- ❌ "近年来..."
- ✅ 直接切入或用真实场景

** 2. AI句式 **
- ❌ "不是...而是..."（频繁）
- ❌ "既...又..."（机械）
- ✅ 打乱句式，增加变化

** 3. 书面词汇 **
- ❌ "显著提升" → ✅ 具体数字
- ❌ "充分利用" → ✅ "用好"
- ❌ "进行操作" → ✅ 直接用动词
- ❌ "值得注意的是" → ✅ 删除

** 4. 过长句子 **
- 超过30字的句子，拆成2-3句
- 主力句长：15-25字

** 5. 抽象表达 **
- ❌ "显著提升效率"
- ✅ "原来2小时，现在30分钟"

** 6. 中立客观 **
- ❌ "这个工具有优势，也有不足"
- ✅ "Claude Code确实好用，但也有坑"

## 改写示例

** 改写前（AI味重） **：
> 在当今AI技术飞速发展的时代，编程工具也在不断进化。Claude Code作为Anthropic推出的新一代AI编程助手，不仅具有强大的代码生成能力，而且在上下文理解方面也表现出色。

** 改写后（人味足） **：
> Claude Code出了。我用了两周，确实比Cursor好用。好用在哪？三点：1) 理解上下文，很少答非所问。2) 代码质量高，95%能直接用。3) 能同时改多个文件。

templates/topic-discussion-template.md：话题讨论模板
# 话题讨论模板

## 方案1：{标题}

** 核心角度 **：{一句话描述}

** 大纲 **：
1. {章节1}（约500字）
   - 要点1
   - 要点2
2. {章节2}（约800字）
   - 要点1
   - 要点2

** 预计字数 **：XXXX字

** 工作量评估 **：⭐⭐⭐
- 研究：X小时
- 写作：X小时
- 总计：X小时

** 优势 **：
- 优势1
- 优势2

** 劣势 **：
- 劣势1

** 需要真实测试 **：是/否

** 目标受众 **：{谁会觉得有价值}

personal-materials/：个人素材库

这个文件夹存放你的真实素材。

personal-materials/
├── README.md                    # 使用说明
├── materials-index.md           # 话题索引
├── style-samples/               # 风格参考文章
│   └── sample1.md
└── raw-data/                    # 原始素材
    ├── jike-posts.csv           # 即刻动态导出
    └── twitter-archive.json     # 推特存档


** 使用方法 **：

导出你的社交媒体内容（即刻、Twitter、微博）
放到 raw-data/ 文件夹
Skill自动搜索和使用

** 这是降AI味的核心！ **

完整文件

创建所有文件：

# 创建目录结构
mkdir -p .claude/skills/wechat-writer/{workflows,guidelines,templates,personal-materials/{style-samples,raw-data}}

# 创建 SKILL.md（上面的内容）
# 创建 workflows/wechat-article.md（上面的内容）
# 创建 guidelines/style-guide.md（上面的内容）
# 创建 templates/topic-discussion-template.md（上面的内容）

Progressive Disclosure实践

这个Skill的设计，体现了Progressive Disclosure（渐进式披露）原则。

** 什么是Progressive Disclosure？ **

信息分层：

第一层：SKILL.md（简洁导航，约200行）
第二层：workflows/*.md（详细流程，约800行）
第三层：支持文件（模板、指南）

Claude先读SKILL.md，知道整体结构。

需要时，再读具体的workflow文件。

** 为什么这样设计？ **

节省token。

Claude不用一次性加载所有信息。

按需加载，高效。

** 对比 **：

如果把所有内容都写在SKILL.md里，会怎样？

文件太长（1000+行）
Claude每次都要读完整文件
浪费token
加载慢

分层设计后：

SKILL.md只有200行
按需加载详细流程
节省token
更快
测试和优化
测试Skill

创建好后，测试一下：

你：帮我写一篇关于Claude Code Skill的文章，3000字

Claude：[加载wechat-writer skill]
我理解你想写一篇关于Claude Code Skill的文章...
[执行9步流程]


看Claude是否：

正确识别任务（新写作任务）
加载正确的workflow（wechat-article.md）
遵循流程（保存brief → 搜索 → 话题讨论...） ## 总结

Claude Code Skill的核心是：

** 1. 结构化 **

文件分层（SKILL.md → workflows → 支持文件）
Progressive Disclosure（按需加载）

** 2. 可发现 **

description包含触发词
清楚说明什么时候用

** 3. 可复用 **

一次创建，到处使用
跨平台（网页版、CLI、API）

** 4. 真实素材 **

personal-materials存放真实内容
降AI味的核心
下一步

想搭建自己的Skill？

** 确定需求 **：你想让Claude帮你做什么？
** 设计流程 **：拆解成具体步骤
** 创建文件 **：按上面的结构创建
** 测试优化 **：多测试，不断改进

重点：

从简单开始（先创建基础版）
逐步完善（根据实际使用情况优化）
积累素材（真实经历、观点、案例）

Claude Code + Skill，让AI按你的规则干活。

试试看。

PS：关于我的“1000天超级个体计划”

这是一份公开的个人挑战记录。我在2025年7月20日立下目标，计划用1000天时间，将自己从一个擅长技术但拙于营销的“产品人”，进化成一个能独立完成产品、营销、商业化闭环的**“AI时代超级个体”**。

我将围绕以下三个项目，死磕我的能力短板：

毕方智映 (BifrostV): 已上线的AI数字人做课神器，可将一本书批量生成ppt、数字人讲课视频、题库，目标客户是培训机构和学校，支持私有化部署，由合作方运营，正在寻找全国代理商。 试用地址：https://workbench.bifrostv.com/#/login?invitationCode=PGbpsdeFwf
TextLoom: 正在开发的“文章一键转短视频”产品，用于打造个人IP，目标独立跑通开发出海完整流程。
EasyAIedu: 我为我4岁孩子启动的AI创新教育项目，在呼和浩特线下打造了一个AI科创实验室，包括机械臂、机器人、3D打印、算力服务器以及各种最新的AI工具，同时研发了一款PBL课程辅助制作产品(开源地址：https://github.com/haojing8312/PBLCourseAgent)，帮助我们研发开放式的PBL课程，带孩子们在实验室体验创造的快乐。

这份日报是我最真实的思考、进展和困境。如果你对AI、独立开发或创新教育感兴趣，欢迎你关注、见证、监督我完成这个目标。

交流+V：hj364430879

---
*导入时间: 2026-01-17 22:08:21*
