---
title: "别再只写 CLAUDE.md 了：用 Rules 重构 Claude Code 的记忆系统"
source: wechat
url: https://mp.weixin.qq.com/s/13a2dtx3OeNvkZGipMyBYg
author: 绿蚁红泥天欲雪
pub_date: 2025年12月10日 19:18
created: 2026-01-17 20:34
tags: [AI, 编程]
---

# 别再只写 CLAUDE.md 了：用 Rules 重构 Claude Code 的记忆系统

> 作者: 绿蚁红泥天欲雪 | 发布日期: 2025年12月10日 19:18
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/13a2dtx3OeNvkZGipMyBYg)

---

在 CLAUDE.md 的使用编写中，总觉得写多了怪怪的，自己虽然拆成了子文件，但是比较没体系：

一开始写几条约定还好

写着写着变成《项目说明书》＋《团队规范》＋《个人碎碎念》大杂烩

Claude 也越来越「听不清重点」，时灵时不灵

这次 Claude 官方出手整理 CLAUDE.md 的臃肿了：新加了 rules 机制。本质是在说一句话：

别再只写一篇大 CLUDE.md 了，把「记忆」拆成一个个可组合的规则文件。

而这，又契合了最早提出 Rules 概念而且一直践行至今的 Cursor。Codex 刚支持了 Claude 家的 Skills，Claude 就支持了 Cursor 家的 Rules，国外的 AI Agent 生态在融合了。

什么？不知道 Rules 怎么学怎么写？看这里，使用Cursor的 rules 拿来就用，少走弯路：

https://github.com/PatrickJS/awesome-cursorrules
https://github.com/sanjeed5/awesome-cursor-rules-mdc

下面按这几个问题展开：

是什么 → 有什么用 → 怎么用 → 和 CLAUDE.md 的分工 → Memory 管理

一、Memory & Rules

先把盘子铺好：Claude Code 的记忆不是一份文件，而是一整套分层的记忆系统。

1. 五种 Memory 分层结构

官方给出了一个层级表，大致可以这样理解：

Enterprise policy（组织级）

位置：系统级目录（例如 /Library/.../CLAUDE.md）

用途：公司统一要求，比如安全规范、合规要求

共享范围：整个公司所有人

Project memory（项目级）

位置：./CLAUDE.md 或 ./.claude/CLAUDE.md

用途：这个仓库的通用约定、架构说明、常用命令

共享范围：参与这个项目的所有人（通过 Git）

Project rules（项目规则，新特性）

位置：./.claude/rules/*.md

用途：按主题/路径拆分的细粒度规则（重点）

共享范围：项目成员

User memory（用户全局）

位置：~/.claude/CLAUDE.md

用途：你个人的通用偏好（比如爱用 2 空格缩进、某种 commit 风格）

共享范围：只有你，所有项目通用

Project memory (local)（用户-项目私有）

位置：./CLAUDE.local.md

用途：和这个项目相关，但不想进 Git 的个人信息（本地 URL、调试数据）

共享范围：只有你，且只在当前项目生效（自动被 .gitignore 掉）

加载顺序是从上到下：先组织级，再项目级，再个人级。上层提供基础，具体的项目和个人在上面叠加、细化。

2. Project rules 是什么？

一句话概括：

CLAUDE.md 管「项目整体怎么合作」，
rules/*.md 管「在这个目录 / 这个语言 / 这个场景下，Claude 具体要怎么干活」。

形式上，rules 就是：

your-project/
├── .claude/
│   ├── CLAUDE.md         # 项目主说明
│   └── rules/
│       ├── code-style.md # 代码风格
│       ├── testing.md    # 测试约定
│       └── security.md   # 安全要求


特点：

多个 .md 文件，每个聚焦一个主题

和 .claude/CLAUDE.md 同一个优先级

可以用 paths 字段只对指定路径/文件生效

从「一篇说明书」，进化成「一柜子的分类规则手册」。

二、rules 解决了什么问题
1. 解决「一份 CLAUDE.md 越写越怪」

典型现状：

JS/TS 规范和后端 Java 规范写在一起

API 设计原则和前端组件命名规则混在一起

写久了谁也不敢删，Claude 也不知道该听谁的

rules 做的就是 把这些东西拆开，每个文件只讲一种事：

frontend/react.md：专讲 React 组件、状态管理约定

backend/api.md：专讲接口风格、错误码、超时重试

testing.md：专讲测试目录结构、命名、覆盖率要求

Claude 加载时能更「聚焦」，你自己维护也不会压力山大。

2. 按路径精细控制 Claude 的行为

关键在这个 YAML frontmatter：

---
paths: src/api/**/*.ts
---

# API Development Rules

- 所有接口必须做入参校验
- 统一错误返回格式
- 必须补 OpenAPI 注释


这段规则只在 Claude 处理 src/api 下的 ts 文件时才会生效。

带来的直接好处：

API 规则不会误伤前端组件、配置脚本

安全规则可以只绑在「关键目录」上

不同层（前端、后端、测试）可以有不同的「口味」

你等于是给 Claude 加了一层「按目录切换专用人格」。

3. 提升团队协作与标准统一

配合 Git 和符号链接（symlink），rules 有几个很现实的价值：

公司统一标准：安全、日志、API 设计，放到一个共享 rules 仓库

各项目按需挂载：通过 symlink 把那套规则挂进 .claude/rules/

规则可审可追溯：rules 文件本身也走 code review，谁改了规范，一目了然

从此以后，团队改规范不再是「群里发句话」，而是 改一条 rules + 合个 PR。

4. 兼顾个人偏好与隐私

搭配以下三层，就能很好地处理「团队 vs 个人」：

~/.claude/rules/：你的通用偏好 & workflow

.claude/rules/：团队共识、强约定

CLAUDE.local.md：本地不想公开的信息（测试账号、内部 URL 等）

个人习惯可以普适所有项目，但若和项目规则冲突，项目规则优先 —— 这样既不干扰团队，又不用你每个仓库重新调教 Claude。

三、从 0 到 1 搭一套 rules

这一部分对应的是「实操视角」，你可以照着做一遍。

1. 初始化项目记忆

在 Claude Code 里打开你的项目，先运行：

/init


它会帮你生成一份基础版 CLAUDE.md，里面会自动写入一些项目上下文。

接下来手动建目录：

mkdir -p .claude/rules


现在结构大概是：

.
├── CLAUDE.md         # 或 .claude/CLAUDE.md
└── .claude/
    └── rules/

2. 写一份「最小可用」规则文件

从团队里争议最多、最容易踩坑的一块开始，例如测试约定：

# .claude/rules/testing.md

# 测试约定

- 所有单测放在 `tests/` 目录
- 文件命名统一为 `*.test.ts`
- 新功能必须至少有 1 个 happy path + 1 个 edge case 测试


不写 paths，先让它全局生效，确保 Claude 在任何地方提到测试时，都按这套说。

3. 熟练使用 paths + Glob

等你掌握之后，可以逐步加上路径条件，比如前端专用规则：

---
paths: src/components/**/*.tsx
---

# 前端组件规则

- 所有组件使用函数组件写法
- 样式统一从 `styles/` 引入，不写行内样式
- 组件必须是「傻瓜组件」，逻辑尽量放到 hooks 中


常用 pattern 可以记几个：

**/*.ts：所有目录下的 ts 文件

src/**/*：src 目录下所有文件

*.md：项目根目录下的 Markdown

src/components/*.tsx：某个特定目录下的 React 组件

组合用法（花括号、多模式）：

---
paths: src/**/*.{ts,tsx}
---

# TypeScript/React 规则


---
paths: {src,lib}/**/*.ts, tests/**/*.test.ts
---

# 通用 TS 规则 + 测试规则


你可以借这个机制，把「一个仓库」切成「多块规则区」。

4. 用子目录整理复杂项目

项目一旦变大，rules 推荐这样拆：

.claude/rules/
├── frontend/
│   ├── react.md
│   └── styles.md
├── backend/
│   ├── api.md
│   └── database.md
└── general.md


建议：

每个文件只讲一个主题

文件名力求一眼看懂：api-design.md > a1.md

有 paths 的规则集中放一起，避免以后排查冲突时满地找

5. 用 symlink 复用公司级规则

如果你所在团队有很多项目，共享规则非常有价值：

# 在 home 目录建一个标准规则库
mkdir -p ~/shared-claude-rules
# 写好 security.md、logging.md 等

# 在具体项目里挂进来
ln -s ~/shared-claude-rules .claude/rules/shared
ln -s ~/shared-claude-rules/security.md .claude/rules/security.md


Claude 会把这些符号链接当普通文件处理，循环引用也会被安全处理掉，不用担心炸掉。

6. 用用户级 rules 保护你的工作流

在 ~/.claude/rules/ 写上你自己的「通用规则」：

~/.claude/rules/
├── preferences.md    # 代码风格、命名习惯
└── workflows.md      # 你的常用开发流程、调试步骤


比如在 workflows.md 里写：

我在排查 bug 时，优先看哪些日志

我写新 feature 时，默认希望 Claude 按怎样的「TDD 流程」配合

用户级 rules 会在项目规则之前加载，但 项目规则优先级更高——也就是项目可以 override 你的个人偏好，这正是你希望的。

7. 日常维护：# 快捷添加 + /memory 管理

两个容易忽略但非常实用的入口：

# 快捷添加
 在输入开头写一行：

# 所有变量名必须具备业务含义


Claude 会问你：这条记忆存到哪份 memory 里？你可以选择对应的 CLAUDE / rules 文件。

/memory 可视化管理
 输入 /memory，Claude 会帮你打开当前加载的 memory 文件，方便你改、删、重构。

这两个入口让「写规则」变成日常工作的一部分，而不是「某天抽时间写完所有规范」这种不会发生的事。

四、和 CLAUDE.md 的区别与分工

可以粗暴地这样理解：

CLAUDE.md：写给人和 Claude 一起看的「项目说明书」

rules/*.md：主要写给 Claude 的「执行细则」

更细一点看：

1. CLAUDE.md：全局背景 + 通用约定

适合放：

项目整体介绍、架构图的说明

通用的 code style、命名规范

常用命令（build、test、lint、deploy）

团队的一些工作方式（例如「所有改动必须有 issue 链接」）

Claude 会把它当作「理解这个项目」的基础。

2. rules：针对场景的操作说明书

适合放：

特定目录的 API 规则

某类文件的测试策略

安全敏感目录的特殊约定

前后端不同 stack 的风格差异

Claude 只在触发了对应 paths 的时候，才会把这些规则拿出来用。

这相当于把「看说明书」和「查手册」拆开了：

CLAUDE.md：入职第一天你会认真看完

rules：干到对应场景时再翻出来查

3. 个人与团队边界的处理方式

最后再看三个「个人相关」的记忆位置：

~/.claude/CLAUDE.md：你的个人原则

~/.claude/rules/：你的个人工作流和偏好

./CLAUDE.local.md：你在这个项目的本地情报

配合项目 CLAUDE 和 rules，就形成这样一套秩序：

组织政策 > 项目共识 > 你的个人习惯 > 你的本地情报

你可以自由发挥，但不会把团队带偏。

五、Memory：从写说明，到设计规则系统

如果往前看几年，开发者写文档大多是：

有事就写 README

有规范就放 Confluence

出事了才翻 issue 和群聊记录

Claude Memory + rules 提供了一个新方向：

把「说明文档」升级成「可执行的规则系统」，
把「写文档」升级成「设计规则网络」。

几个值得提前想的点：

1. 不同规模团队的策略

个人开发者

重点搞好 ~/.claude/CLAUDE.md + ~/.claude/rules/

各项目只放少量项目特定规则

小团队/创业公司

每个仓库都有 .claude/CLAUDE.md + .claude/rules/

把「我们团队怎么写代码」这件事用 rules 固化下来

大厂 / 多项目团队

有企业级 CLAUDE policy

有一个「公司规则库」，通过 symlink 分发到各项目

rules 的变更像代码一样走评审和版本管理

2. 和开发流程真正绑在一起

比较理想的状态是：

写功能 → 顺手补上对应 rules

code review → 不只看代码，还看规则变更是否合理

出事故 → 复盘完改代码的同时，也补一条 rules，防止再犯

长期下来，这套 rules 会变成「你们团队踩坑史＋最佳实践」的压缩包。

3. 提前认识几个坑

规则写太细、太多
  Claude 会被各种规则拉扯，输出变得难预测
  → 规则遵循「从粗到细」「从少到多」，只在真踩坑后再加

paths 滥用，冲突难排查
  → 用清晰的命名和目录结构管理 rules，比如：
frontend/api/xxx.md、backend/security/xxx.md，不要到处散

记忆不更新，输出变旧
  → 定期用 /memory 做一次「记忆体检」，删掉已经失效的规则

六、实践是第一要务

读完这篇，如果你想让 Claude Code 在你项目里「越用越聪明」，而不是「越用越混乱」，可以先做这三步：

在当前项目建好基础结构

确认根目录有 CLAUDE.md（没有就用 /init）

创建 .claude/rules/ 目录

写一个真有用的 rules 文件

选一个你们团队争议最多的点（命名？测试？日志？）

写成一份聚焦规则（必要时加上 paths）

在个人目录里建自己的 rules

~/.claude/rules/preferences.md 写上你的个人偏好

~/.claude/rules/workflows.md 写上你常用的工作流和排错步骤

从这一刻起，Claude 不再只是「看一份 CLAUDE.md」，而是在执行一整套你设计出来的「记忆 + 规则系统」。

真正的差别，不在于你有没有用 Claude，
而在于：你有没有为 Claude 设计一套自己的规则宇宙。

参考：

https://code.claude.com/docs/en/memory

#ClaudeCode #Claude #Skill #Agent #Subagent #Rules

---
*导入时间: 2026-01-17 20:34:50*
