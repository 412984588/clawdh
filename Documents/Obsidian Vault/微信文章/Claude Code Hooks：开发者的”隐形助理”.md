---
title: "Claude Code Hooks：开发者的”隐形助理”"
source: wechat
url: https://mp.weixin.qq.com/s/pAo8BNfoPuMfCyooIDaR5Q
author: 百牛技术
pub_date: 2025年10月29日 00:01
created: 2026-01-17 21:28
tags: [AI, 编程, 产品]
---

# Claude Code Hooks：开发者的”隐形助理”

> 作者: 百牛技术 | 发布日期: 2025年10月29日 00:01
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/pAo8BNfoPuMfCyooIDaR5Q)

---

前言 

最近在使用 Claude Code 进行项目开发时，萌生了一个想法：如果能够让 Claude 在执行某些命令前后自动执行特定操作，那将大大提升开发效率。

经过深入了解，发现 Claude Code 提供了"Hooks"功能，允许用户通过 shell 命令来自定义和扩展 Claude Code 的行为模式。

Claude Code Hooks 本质上是用户定义的 shell 命令，它们会在 Claude Code 执行生命周期的关键节点自动触发。这个机制为开发者提供了对 Claude Code 行为的精确控制能力，确保特定操作能够可靠执行，而不需要依赖大语言模型的自主选择。

一、为什么需要 Hooks？——背景与痛点

在没有 Hooks 的情况下，Claude 做的事情是：

1. 收到你输入的任务/指令
2. 根据任务上下文，用模型输出代码或命令
3. 执行工具（如本地脚本、编译器等）
4. 返回结果

乍一看好像没问题，但几种常见痛点浮现：

一致性与规范难保障

Claude 写完代码，可能风格不统一、注释不齐、没格式化。

安全 & 限制不好插手

如果 Claude 想执行一个危险命令（比如删除文件、访问敏感路径），但你希望有个"审核"机制拦截。

自动化流程断链

像提交前 lint、构建、测试这些步骤，你本来得一条条手动跑。要是 Claude 能帮你运行就省事多了。

可观察性差

Claude 执行命令输出结果，但你不太清楚它在内部做了什么（执行了什么命令），难以追踪问题。




Hooks 正是为了解决这些痛点：它让你可以在 Claude 执行流程的关键节点插入你自己的逻辑、过滤或检查机制。

二、Hooks 的核心概念与触发机制

接下来，我们要理解几个最关键的东西：触发点 (on)、匹配 (match)、执行动作 (do)。



2.1 触发点（on）

这是 Hook "插手干预"的时间点。这里说几个常见的触发点：

• PreToolUse：工具调用之前运行（可以阻止它们）
• PostToolUse：在工具调用完成后运行
• UserPromptSubmit：当用户提交提示时运行，在 Claude 处理之前
• Stop：当 Claude Code 完成响应时运行
• SubagentStop：当子代理任务完成时运行
• PreCompact：当子代理任务完成时运行
• SessionStart：当 Claude Code 开始新会话或恢复现有会话时运行
• SessionEnd：当 Claude Code 会话结束时运行

在写 Hook 的时候，就选一个合适的触发时机来执行自己写的逻辑。

2.2 匹配条件（match）

有了触发点还不行，通常不是对所有命令都插入逻辑。match 用来限定哪些命令/工具/路径才触发这个 Hook。

比如：

• matcher: npm*：只有 npm 相关命令触发（精准匹配）
• matcher: git commit：只有 git commit 这条指令触发
• matcher": "Edit\|Write：当 Claude Code 使用 Edit 或 Write 工具时都会触发（正则表达式匹配）
• matcher: * 或不写：所有命令都触发

小提示：目前matcher字段仅适用于PreToolUse和PostToolUse。

2.3 执行动作（do）

当触发条件满足，你就可以在do下写一系列要执行的动作，比如：

• 运行shell脚本 run: ./scripts/check.sh
• 输出日志 run: echo "开始执行..."
• 调用其他工具 / 程序

一个 Hook 可能包含多个动作（按顺序执行）。

2.4 参数与传值（args / context）

在 do 中，你还可以使用 args 或上下文变量（context）来传递参数、判断环境、区分 dev/prod 等。这样你的 Hook 执行逻辑会更灵活。

三、快速上手：配置你的第一个 Hook


3.1 打开 Hooks 配置

Claude 提供了便捷的斜杠命令来管理 Hooks：

/hooks

执行这个命令会打开 Hooks 配置界面，你可以在这里添加、编辑或删除 Hook 规则。

3.2 配置结构详解

Claude Hooks 使用JSON格式进行配置，每个Hook包含以下核心字段：

{
    "matcher": "Bash",
    "hook": "echo '执行命令: $(jq -r '.tool_input.command')'"
}

配置字段说明：

• matcher: 匹配器，指定触发 Hook 的工具类型
• "Bash": 匹配 bash 命令执行
• "Edit": 匹配文件编辑操作
• "Write": 匹配文件写入操作
• 或使用通配符匹配特定命令
• hook: 要执行的 Hook 命令
3.3 实际配置示例
示例 1：记录所有 Bash 命令
{
    "matcher": "Bash",
    "hook": "jq -r '\"\\(.tool_input.command) - \\(.tool_input.description // \"No description\")\"' >> ~/.claude/bash-command-log.txt"
}
示例 2：Git 提交前检查
{
    "matcher": "git commit",
    "hook": "npm run lint && npm test"
}
示例 3：自动格式化代码
{
    "matcher": "Write",
    "hook": "prettier --write ."
}
3.4 配置位置

Claude Code Hooks 支持 三种配置层级（按优先级从高到低）：

1. 本地项目设置 .claude/settings.local.json
2. 项目设置 .claude/settings.json
3. 用户设置 ~/.claude/settings.json

优先级：本地 > 项目 > 用户

设置文件结构

在 settings.json 中，Hooks 配置位于 hooks 字段下：

{
    "hooks": [
        {
            "matcher": "Bash",
            "hook": "echo '执行命令: $(jq -r '.tool_input.command')'"
        }
    ]
}
四、Hooks 在日常开发中的实战案例

下面是几个特别实用的实战案例



案例 A：命令执行日志记录

记录所有执行的 Bash 命令，方便后续追踪和调试：

{
    "matcher": "Bash",
    "hook": "jq -r '\"\\(.tool_input.command) - \\(.tool_input.description // \"No description\")\"' >> ~/.claude/bash-command-log.txt"
}
这个 Hook 会将每个执行的 bash 命令记录到日志文件中，包含命令和描述信息。(如图所示)



案例 B：自动代码格式化

在文件写入后自动格式化代码：

{
    "matcher": "Write",
    "hook": "prettier --write . && echo '代码已自动格式化'"
}
案例 C：Git 提交前安全检查

在执行 git commit 前进行代码检查：

{
    "matcher": "git commit",
    "hook": "npm run lint && npm test || (echo '代码检查失败，请修复后再提交' && exit 1)"
}

如果 lint 或测试失败，这个 Hook 会阻止提交操作。

案例 D：危险命令拦截

阻止执行危险的系统命令：

{
    "matcher": "Bash",
    "hook": "if echo '$(jq -r '.tool_input.command')' | grep -E '(rm -rf|sudo|chmod 777)'; then echo '检测到危险命令，执行已阻止' && exit 1; fi"
}
五、最佳实践与安全注意事项
5.1 安全注意事项

重要提醒：Hooks 会以当前环境的凭证运行，请务必检查 Hook 实现的安全性。

安全最佳实践：
1. 审查 Hook 代码：确保没有恶意代码
2. 限制权限：避免使用过高的系统权限
3. 输入验证：对传入的参数进行验证
4. 避免敏感信息：不要在 Hook 中硬编码密码等敏感信息
5.2 最佳实践建议
渐进式配置

刚开始别一口气写一大堆，先写一个简单的日志记录开始，然后逐步增加功能：

// 第一步：简单记录
{"matcher":"Bash","hook":"echo '执行了命令'"}

// 第二步：增加详细信息
{"matcher":"Bash","hook":"jq -r '.tool_input.command' >> command.log"}

// 第三步：添加条件判断
{"matcher":"Bash","hook":"if jq -r '.tool_input.command' | grep git; then git status; fi"}
精准匹配，避免性能问题

使用具体的匹配器而不是通配符：

//尽量精确匹配
{"matcher": "git commit", "hook": "npm run lint"}

//太宽泛了
{"matcher": "*", "hook": "echo '每次都执行'"}
使用 JSON 处理工具

jq 是用于命令行中处理 JSON 数据的强大工具，它能让 shell 理解和操作 JSON，也是先决条件 推荐在 Hooks 中使用：

# 提取命令
jq -r '.tool_input.command'

# 提取文件路径
jq -r '.tool_input.path'

# 提取描述信息
jq -r '.tool_input.description // "无描述"'

# 条件判断
jq -e '.tool_input.command | test("git")'
5.3 团队协作建议
1. 版本控制：将 .claude/hooks.json 纳入 Git 管理
2. 文档化：为每个 Hook 添加注释说明其用途
3. 标准化：团队统一 Hook 的命名和结构规范
4. 测试：在应用到生产环境前充分测试 Hook
5.4 常见问题解决
Hook 不执行？
• 检查匹配器是否正确
• 确认 Hook 语法是否有误
• 查看错误日志
Hook 执行失败？
• 检查命令路径是否正确
• 确认权限是否足够
• 添加错误输出以便调试
六、快速参考
6.1 常用命令
命令
	
功能

/hooks	
打开 Hooks 配置界面

jq -r '.tool_input.command'	
提取执行的命令

jq -r '.tool_input.path'	
提取文件路径
6.2 文档
• 官方文档：https://docs.claude.com/zh-CN/docs/claude-code/hooks-guide

• JSON 处理工具：https://stedolan.github.io/jq/manual/

• hooks 下载网站：https://www.aitmpl.com/hooks




感谢围观~


这里是 百牛技术，专注分享有趣又不无用的技术灵感。


别忘了点个「关注」或「星标」，我们会持续更新，等你常来玩！

---
*导入时间: 2026-01-17 21:28:30*
