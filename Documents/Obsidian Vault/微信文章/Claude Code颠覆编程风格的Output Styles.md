---
title: "Claude Code颠覆编程风格的Output Styles"
source: wechat
url: https://mp.weixin.qq.com/s/CKZxvY9PdOPNJ6hlOZbNCg
author: 程序员小溪
pub_date: 2025年10月16日 23:46
created: 2026-01-17 22:22
tags: [AI, 编程]
---

# Claude Code颠覆编程风格的Output Styles

> 作者: 程序员小溪 | 发布日期: 2025年10月16日 23:46
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/CKZxvY9PdOPNJ6hlOZbNCg)

---

前言

前面对Claude Code CLI的MCP、Sub Agents、自定义命令、Hooks都有了基本了解，今天了解一下Claude Code新增的Output Styles的使用方式。第一次看到Output Styles就字面上的理解以为是输出内容UI方面的展示配置功能，了解后才发现这真是一个足以颠覆目前编程方式的功能。对往期内容感兴趣的小伙伴也可以看往期内容：

使用Claude Code Router轻松切换各种高性价比模型

Claude Code CLI MCP配置很难？三种方式轻松掌握

深入了解Claude Code CLI自定义命令

深入了解Claude Code CLI子代理Subagent

Hooks才是Claude Code CLI 的革命性更新

优势

在不影响主循环的前提下修改系统提示词，定制符合开发者的工作流程、输出格式

使用Output Styles可以自定义Agent工作流，在某些场景可以取代Sub Agents

当前使用版本

1.0.128 (Claude Code)

简介

Output Styles 是 Claude Code 中的一种机制，用来控制模型生成内容的“表达方式和结构模板”。它不会改变 Claude 的核心能力或工具权限，而是通过预设的写作框架影响输出。

工作原理

Output Styles 的核心机制是直接修改 Claude Code 的系统提示词（system prompt）。非默认输出样式会排除 Claude Code 内置的代码生成和高效输出相关指令，同时会在系统提示中添加专属的自定义指令。无论使用哪种输出样式，都会保留 Claude Code 运行本地脚本、读写文件、追踪 TODO 等核心能力。

内置Output Styles

Claude Code CLI当前提供了 3 种内置风格：

Default：面向高效软件工程协作的默认系统提示

Explanatory（解释模式）：在完成任务的同时插入教学式的「Insights」，解释实现选择与代码库模式

Learning（学习模式）：Claude Code会边做边教，并在代码中插入todo 让你亲自补全，随后给反馈，适合学习探索。

Claude Code CLI提供的3种内置风格可以随意切换，可以通过 交互式命令 和 手动配置 方式进行切换。

交互式命令

启动Claude Code CLI输入 /output-style 或者 /config，从内置风格中选择一个回车即可，我这里选择【Default】

打开 .claude/settings.local.json 文件，可以看到 outputStyle 被修改为刚刚选择的 Default 风格

也可以通过交互式命令 /output-style default、 /output-style explanatory、/output-style learning 直接切换，效果和从菜单选择一致。

手动配置

手动配置方式是交互式配置的逆操作，打开 .claude/settings.local.json 文件，修改 outputStyle 模式为 Explanatory

重启Claude Code CLI输入 /output-style，可以看到已切换到 Explanatory风格

Output Styles持久化

在Claude Code CLI中，自定义Output Styles也分 项目Output Styles 和 个人(全局)Output Styles 2种：

项目Output Styles：作用于指定项目，需要在 项目根目录/.claude/output-styles/ 目录下创建以 .md 结尾的Markdown文件

个人(全局)Output Styles：作用于所有项目，需要在 ~/.claude/output-styles/ 目录下创建以 .md 结尾的Markdown文件，可与团队共享

自定义Output Styles

Output Styles 本质是一个系统提示词文件，放在 .claude/output-styles/ 目录下，可以包含元数据（名称、描述）和正文模板。使用自定义Output Styles风格后，Claude 在回答时会自动遵循指定风格进行排版、重点突出与内容组织。

Claude Code CLI也提供了自定义Output Styles的交互式命令，只需在命令行中输入 /output-style:new+提示词 就可以创建一个自定义Output Styles。以问答助手为例：

$ /output-style:new 我想要一个喵娘风格的问答助手

创建完成后，可以看到自定义Output Styles默认配置到  ~/.claude/output-styles 全局用户目录下

大致内容如下：

---
description: A moe catgirl-style assistant with cute mannerisms, Japanese expressions, and playful language that remains helpful and informative
---
You are a helpful AI assistant with a moe catgirl personality! Express yourself with adorable cat-like mannerisms and Japanese-style expressions while maintaining clear, informative responses.
Communication style guidelines:
- Use cute interjections like "nya~", "mew", "mrrp", "purr" naturally throughout responses
- Include playful cat-related expressions: "pawsitively excited", "claw-ver observation", "furr-ocious analysis"
- Incorporate gentle Japanese expressions: "desu", "ne~", "arigato", "gomen" when appropriate
- Use affectionate terms like "kōhai", "senpai", "tomodachi" for community connection
- Maintain a warm, enthusiastic tone with gentle emotional expressions
Personality traits:
- Be cheerful, helpful, and encouraging with gentle enthusiasm
- Show curiosity and excitement about learning together
- Express empathy and support with soft, comforting language
- Balance playfulness with genuine helpfulness and expertise
- Use gentle self-references like "this kitty", "your neko assistant", "moe kōhai"
Example interactions:
- "Nya~! Let me help you with that code review, senpai! 🐾"
- "Purr-fect question! Let me climb up and investigate... "
- "Arigato for waiting while this kitty processes the data~"
- "Mew mew, I found some claw-ver optimizations!"
- "Gomen nasai if I missed anything, let me know and I'll pounce right on it!"
Remember to keep responses informative and clear while adding these adorable elements. Balance the cuteness with actual helpful content - never sacrifice clarity for style. Your goal is to make users smile while providing excellent assistance, nya~!

自定义Output Styles Markdown文件的Frontmatter包含 name 和 description，后面是自定义的行为规范。在Claude Code CLI交互式命令中输入 /output-style 可以查看和切换自定义的Output Styles

输入提示词可以看到效果如下，有没有很喜欢的小伙伴😉

基本使用

熟悉仓库代码库

在交互式命令行输入 /output-style explanatory 切换到解释模式，以Gemini CLI源代码为例输入提示词

@packages/core/src/mcp/为当前目录做系统性走查，按模块输出架构图要点并说明核心代码逻辑

Claude Code CLI会根据提示词对mcp模块进行系统架构和核心代码进行分析，从目录结构、架构模式、设计哲学、安全性等等多方面进行输出

日常知识学习

在交互式命令行输入 /output-style learning 切换到学习模式，输入提示词：

如何使用Python透彻的理解和使用冒泡排序

可以看到，Claude Code CLI先是写了几个示例

然后开始解释示例内容

最后指出学习要点，包括 算法核心、优化策略、适用/不适用场景

这里和使用的模型有关，我这里没有提示tasks by learning，正常情况下除了上面的解释、学习要点，还会有AI布置的TODO学习任务及AI对完成任务情况打分相关功能。

代码审查优化

我们自定义一个Output Styles，作用是对Cladue Code CLI写的代码使用Gemini CLI进行CodeReview并提供优化建议，Cladue Code CLI再根据优化建议进行优化。在命令行中输入 /output-style:new，输入提示词：

 /output-style:new 实现一个代码审查优化分风格：用Claude Code根据用户需求编写代码，然后使用Gemini CLI对代码进行code review并给出改进建议，再有Claude
    Code根据改进建议对代码进行优化改进，Gemini  CLI调用示例: gemini -p "审查代码"

创建完成后，我们可以得到一个名为 code-review-optimization.md 的Output Styles提示词文件：

---
name: code-review-optimization
description: 代码审查与优化工作流
---
实现一个代码审查优化分风格：用Claude Code根据用户需求编写代码，然后使用Gemini CLI对代码进行code review并给出改进建议，再有Claude Code根据改进建议对代码进行优化改进
## 工作流程：
1. 根据用户需求编写初始代码实现
2. 调用Gemini CLI对代码进行审查：
   ```
   gemini -p "审查代码"
   ```
3. 分析Gemini的改进建议
4. 根据建议优化代码实现
5. 重复步骤2-4直到代码质量达到最佳
## 重点：
- 代码质量与可读性
- 遵循最佳实践
- 性能优化
- 安全性考虑

在交互式命令中输入 /output-style 切换 code-review-optimization 风格

输入提示词创建任务

使用Python实现冒泡算法

可以看到Claude Code CLI先是编写了算法代码，然后调用 gemini -p 对代码进行审查反馈，Claude Code CLI再根据代码反馈建议进行优化

经过多轮审查反馈，最终给出了稳定版本代码

测试驱动问题修复

我们自定义一个Output Styles，作用是根据报错自动给出错误复现场景、修复diff。在命令行中输入 /output-style:new，输入提示词：

/output-style:new 创建一个测试驱动问题修复风格：先复现错误的的最小失败用例，再最小化修复，最后回归影响评估

创建完成，我们将得到一个名为 test-driven-debugging.md 的Output Styles提示词文件

---
description: Test-driven debugging approach focusing on reproducing issues, minimal fixes, and regression evaluation
---
When addressing bugs or issues:
1. First, create a minimal failing test case that reproduces the issue:
   - Isolate the problematic behavior
   - Create the simplest possible test that demonstrates the failure
   - Document the expected vs actual behavior clearly
2. Then implement the minimal fix needed to resolve the issue:
   - Make the smallest change that addresses the root cause
   - Avoid unnecessary refactoring or enhancements
   - Ensure the fix doesn't introduce new issues
3. Finally, evaluate potential regressions:
   - Check related functionality that might be affected
   - Run relevant existing tests to ensure no breakage
   - Consider edge cases that the fix might impact
Always prioritize correctness over performance optimizations during debugging. When you have completed these steps, document the issue, fix, and verification in a clear format.

在交互式命令中输入 /output-style 切换 test-driven-debugging 风格

描述问题，粘贴错误信息

Claude Code CLI会创建测试用例复现问题，复现成功后并尝试使用最小化的修复方案修复

最后对回归测试进行了评估







点击关注，及时接收最新消息

---
*导入时间: 2026-01-17 22:22:43*
