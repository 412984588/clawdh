---
title: "Claude Code官方最佳实践-1"
source: wechat
url: https://mp.weixin.qq.com/s/75CMVqo0tRfF-ABXGwzBZA
author: 一悟超然
pub_date: 2025年10月28日 08:03
created: 2026-01-17 20:23
tags: [AI, 编程]
---

# Claude Code官方最佳实践-1

> 作者: 一悟超然 | 发布日期: 2025年10月28日 08:03
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/75CMVqo0tRfF-ABXGwzBZA)

---

前言

Claude Code，一个用于智能体编程的命令行工具。

作为一个内部实验性项目，Claude Code被有意设计为low-level（低级别）且unopinionated(无特定偏好），提供接近原始模型的访问权限，而不强制使用特定的工作流程。

这种设计哲学创造了一个灵活，可定制，可脚本话且安全的强大工具。

虽然功能强大，但这种灵活性为初次接触智能体编程工具的工程师带来了学习曲线--至少直到他们形成自己的最近实践。

本文档概述了已被证明有效的通用模式。此列表中的内容不是一层不变的，也不普遍适用；请将这些建议视为起点。我们鼓励您进行实验，找到最适合您的方法！

详细信息请访问claude.ai/code

1.自定义您的设置

Claude Code是一个智能体编程助手，会自动将上下文拉入提示中。这种上下文收集会消耗时间和令牌，但您可以通过环境调优来优化它。

a.创建CLAUDE.md文件

CLAUDE.md是一种特殊文件，Claude在开始对话时会自动将其拉入上下文。这使其成为记录以下内容的理想场所：

·常用bash命令

·核心文件和实用函数

·代码风格指南

·测试说明

·代码库规范（例如，分支说明，合并与编辑等）

·开发环境设置（例如，pyenv使用，那些编译器有效）

·项目特有的任何意外行为或警告

·您希望Claude记住的其他信息

CLAUDE.md文件没有要求格式。建议保持简洁且人类可读。如：

#Bash命令            
- npm run build:构建项目            
- npm run typecheck: 运行类型检查器            
# 代码风格            
- 使用ES模块（import/export）语法，而不是CommonJS(require)            
- 尽可能使用解构导入（例如import{foo}from 'bar'）            
#工作流程            
- 在完成一系列代码更改后务必进行类型检查            
- 为了性能考虑，优先运行单个测试，而不是整个测试套件            


您可以将CLAUDE.md文件放置在几个位置

·代码库的根目录，或您运行claude的任何地方（最常见的用法）。将其命名为CLAUDE.md并将其检入git,这样您就可以在会话间和团队成员间共享（推荐），或将其命名为CLAUDE.local.md并将其添加到.gitignore中

·您运行claude的目录的任何子目录。这与上诉相反，在这种情况下，当您处理子目录中的文件时，Claude会按需拉入CLAUDE.md文件

·您的主文件夹（~/.claude/CLAUDE.md）,这会将其应用到所有您的claude会话

当您运行/init命令时，Claude会自动为您生成一个CLAUDE.md文件

b.调优您的CLAUDE.md文件

您的CLAUDE.md文件会成为Claude提示的一部分，因此应该像任何经常使用的提示一样进行精心完善。一个常见的错误是添加大量内容不迭代其有效性。请花时间实验并确定什么能产生模型最佳的指令遵循效果。

您可以手动向CLAUDE.md添加内容，或按#键给Claude一个指令，它会自动将其纳入相关的CLAUDE.md中。许多工程师在编码时频繁使用#来记录命令，文件和风格指南，然后在提交中包含CLAUDE.md的更改，以便团队成员也能受益。

在Anthropic，我们偶尔会通过提示词改进器运行CLAUDE.md文件，并经常调优指令（例如，添加“重要”或“您必须”的强调）以提高遵循度。

c.管理Claude的允许工具列表

默认情况下，Claude Code会为任何可能修改您系统的操作请求权限：文件写入，许多bash命令，MCP工具等。我们有意采用这种保守的方法设计Claude Code，以优先考虑安全性。您可以自定义允许列表，许可您知道安全的额外工具，或允许容易撤销的潜在不安全工具(例如：文件编辑，git commit).

有四种方式管理允许的工具：

·当在会话期间出现提示词时选择“始终允许”

·在启动Claude Code后使用/permissions命令向允许列表添加或移除工具。例如，您可以添加Edit以始终允许文件编辑，Bash(git commit:*)以允许git提交，或mcp_puppeteer_puppeteer_navigate以允许使用Puppeteer MCP服务器导航。

·手动编辑 您的.claude/settings.json或~/.claude.json（我们建议将前者检入源代码控制以与团队分享）。

·使用--allowedTools CLI标志进行会话特定的权限设置。

d.如果使用GitHub，安装gh CLI

Claude知道如何使用gh CLI 与GitHub交互，用于创建问题，打开Pull Request，读取评论等。

没有安装gh时，Claude任然可以使用GitHub API或MCP服务器（如果您已安装）。

CC提示词：帮我安装gh CLI,之后重启CC终端，然后执行gh --version

或者执行命令安装：winget install --id GitHub.cli

gh登录授权：gh auth login 获取github token

2.为Claude提供更多工具

Claude可以访问您的shell环境，您可以在其中为它构建便利脚本和函数集合，就像您日常开发时自己会为自己做的那样。它还可以通过MCP和REST API利用更复杂的工具。

a.与bash工具一起使用Claude

Claude Code继承了您的bash环境，让它可以访问您的所有工具。

虽然Claude了解常见使用程序如unix工具和gh，但它不会在没有指令的情况下了解您的自定义bash工具：

1.告诉Claude工具名称和使用示例

2.告诉Claude运行 --help来查看工具文档

3.在CLAUDE.md中记录常用工具

与MCP一起使用Claude

Claude Code即是MCP服务器又是客户端。作为客户端，它可以连接到任意数量的MCP服务器以通过三种方式访问它们的工具：

·在项目配置中（在该项目中运行Claude Code时可用）

·在全局配置中（在所有项目中可用）

·在检入的.mcp.json文件中（对在您代码库中工作的任何人都可用）。例如，您可以将Puppeteer和Sentry服务器添加到您的.mcp.json中，这样在您代码库工作的每个工程师都可以开箱即用地使用这些。

使用MCP时，使用claude --mcp-debug标志启动Claude也会有帮助，以帮组识别配置问题。

参考官方文档：https://docs.anthropic.com/zh-CN/docs/claude-code/mcp

管理您的服务器

配置完成后，您可以使用以下命令管理您的MCP服务器：

#列出所有配置的服务器            
claude mcp list            
claude mcp add --transport sse github-server https://api.github.com/cmp            
#获取特定服务器的详细信息            
claude mcp get github            
#删除服务器            
claude mcp remove github            
#(在Claude Code中）检查服务器状态            
/mcp            


示例：使用Sentry监控错误

#1.添加Sentry MCP服务器            
claude mcp add --transport http sentry https://mcp.sentry.dev/mcp            
#2.使用 /mcp 与您的Sentry账户进行身份验证            
>/mcp            
#3.调试生产问题            
>"过去24小时内最常见的错误是什么？"            
>"显示错误 ID abc123的堆栈跟踪"            
>"哪个部署引入了这些错误？"            


与远程MCP服务器进行身份验证

许多基于云的MCP服务器需要身份验证。Claude Code支持OAuth2.0进行安全连接。

1.添加需要身份验证的服务器

例如：

claude mcp add --transport http sentry https://mcp.sentry.dev/mcp            


2.在Claude Code中使用/mcp命令

Copy

> /mcp            


然后按照浏览器中的步骤登录。

将Claude Code用作MCP服务器

您可以将Claude Code本身用作其他应用程序可以连接的MCP服务器：

#将Claude启动为stdio MCP服务器            
claude mcp serve            


您可以通过将此配置添加到claude_desktop_config.json在Claude Desktop中使用此功能：

{            
  "mcpServers":{            
    "claude-code":{            
      "command":"claude",            
      "args":["mcp","serve"],            
      "env":{}            
    }            
  }            
}            


C.使用自定义斜杠命令

创建项目提示词：在当前工作空间创建一个超级马里奥html5小游戏项目，项目名为英文，创建完成后使用gh命令推送到github

提issue提示词：给当前目录下cc-project项目提一个issue,要求用中文，使用gh命令

对于重复的工作流程-调试循环，日志分析等-将提示模版存储在.claude/commands文件夹内的Markdown文件中。当您输入/时，这些会通过斜杠命令菜单变得可用。您可以将这些命令检入git，使其对团队的其他成员可用。

自定义斜杠命令可以包含特殊关键字$ARGUMENTS来从命令调用传递参数。

例如，这里是一个可以用来自动拉取和修复Github问题的斜杠命令：

请分析并修复GitHub问题：$ARGUMENTS。            
按照这些步骤：            
1.使用`gh issue view`获取问题详情            
2.理解问题中描述的问题            
3.搜索代码库中的相关文件            
4.实施必要的更改来修复问题            
5.编写并运行测试来验证修复            
6.确保代码通过代码检查和类型检查            
7.创建描述性的提交消息            
8.推送并创建PR            

记住对所有GitHub相关任务使用GitHub CLI(`gh`).            


将上诉内容放入.claude/commandes/fix-github-issue.md中，使其在Claude Code中作为/project:fix-github-issue命令可用。然后您可以使用/project:fix-github-issue 1234来让Claude修复问题#1234.类似地，您可以将自己的个人命令添加到~/.claude/commands文件夹中，以便在所有会话中使用。

3.尝试常见工作流程

Claude Code不强制特定的工作流程，为您提供了按照自己的方式使用它的灵活性。

在这种灵活性提供的空间内，我们的用户社区中已经出现了几种有效使用Claude Code的成功模式：

a.探索，规划，编码，提交

这种多功能工作流程适合许多问题：

1.要求Claude阅读相关文件，图像和URL,提供一般指引(“阅读处理日志记录的文件”）或具体文件名（“阅读logging.py”),但明确告诉它暂时不要编写任务代码。

a.这是工作流程中应该考虑大量使用子智能体的部分，特别是对于复杂问题。告诉Claude使用子智能体来验证细节或调查它可能有的特定问题，特别是在对话或任务的早期，往往能在不损失效率的情况下保持上下文可用性。

2.要求Claude制定解决特定问题的计划。我们建议使用“think”一词来触发扩展思维模式，这为Claude提供额外的计算时间来更彻底地评估替代方案。这些特定短语直接映射到系统中递增的思维预算级别：“think”<"think hard" <"think harder"<"ultrathink".每个级别为Claude 分配越来越多的思维预算。

a.如果这一步的结果看起来合理，您可以让Claude创建一个文档或GitHub问题，记录其计划，这样如何实施(第3步)不是您想要的，您可以重置到这个位置。

3.要求Claude在代码中实施其解决方案。这也是一个可以要求它在实施解决方案的各个部分时明确验证其解决方案的合理性的好地方。

4.要求Claude提交结果并创建拉取请求。如果有需要，这也是让Claude更新任何README或变更日志以说明它刚才所做工作的好时机。

第1-2步至关重要--没有它们，Claude倾向于直接跳到编码解决方案。虽然有时这正是您想要的，但要求Claude首先进行研究和规划显著改善了需要深度前期思考的问题的性能。

b.编写测试，提交；编码，迭代，提交

这是Anthropic最喜欢的工作流程，用于可以通过单元测试，集成测试或端到端测试轻松验证的更改。测试驱动开发（TDD）在智能体编程中变得更加强大：

1.要求Claude基于预期的输入/输出对编写测试。明确说明您正在进行测试驱动开发，这样它就会避免创建mock实现，即使对于代码库中尚不存在的功能也是如此。

2.告诉Claude运行测试并确认它们失败。明确告诉它在这个阶段不要编写任务实现代码通常是有帮助的。

3.要求Claude在您满意时把测试提交到git.

4.要求Claude编写通过测试的代码，指示它不要修改测试。告诉Claude继续直到所有测试通过。Claude通常需要几次迭代来编写代码，运行测试，调整代码并再次运行测试。

a.在这个阶段，可以要求它使用独立的子智能体验证实现没有过度拟合测试

5.在您满意更改后要求Claude提交代码到git。

Claude在有明确目标进行迭代时表现最佳-有视觉设计图，测试用例或其他类型的输出。通过提供像测试用例这样的预期输出，Claude可以进行更改，评估结果，并逐步改进直到成功。

c.编写代码，截图结果，迭代

与测试工作流程类似，您可以为Claude提供视觉输入：

1.为Claude提供拍摄浏览器截图的方法(例如，使用Puppeteer MCP服务器，ios模拟器MCP服务器，或手动复制/粘贴截图到Claude中).

2.通过复制/粘贴或拖放图像为Claude提供视觉输入，或给Claude图像文件路径。

3.要求Claude在代码中实现设计，拍摄结果截图，并迭代直到结果与模拟匹配。

4.在您满意时要求Claude提交。

像人类一样，Claude的输出通过迭代往往会显著改善。虽然第一版可能很好，但经过2-3次迭代后通常看起来会好很多。为Claude提供查看其输出的工具以获得最佳结果。

---
*导入时间: 2026-01-17 20:23:46*
