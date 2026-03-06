---
title: "手把手教你玩转 Claude Code Hooks-从入门到生产实战"
source: wechat
url: https://mp.weixin.qq.com/s/9c_IIwAsAQcSsV8N0mgnZA
author: 与AI同行之路
pub_date: 2025年11月29日 10:23
created: 2026-01-17 20:47
tags: [AI, 编程]
---

# 手把手教你玩转 Claude Code Hooks-从入门到生产实战

> 作者: 与AI同行之路 | 发布日期: 2025年11月29日 10:23
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/9c_IIwAsAQcSsV8N0mgnZA)

---

这几个月来我一直在使用 Claude,但说实话,我觉得自己并没有完全掌握并发挥 Claude Code 的全部能力。Claude Code 不是一个简单的开发 CLI,它是一个强大的开发平台,它的插件系统可以支持你任意扩展 slash command、MCP、subagent、skills、hooks 等等。

自定义 slash command 我们之前的文章写过;MCP 我在 Cursor 的文章里写了很多;subagent 也专门写过;skills 也介绍过。今天主要想讲讲 hooks 的使用。

为了更好地理解和调试 hooks,我专门开发了一个 Claude Debug 工具,准备开源到我的 GitHub 上。这个工具提供了很多实用功能:

Skills Browser: 浏览、搜索和分析 Claude Code skills
Agents Manager: 管理和调试 Claude Code subagents
Hooks Manager: 配置、测试和调试 hook 执行链,支持实时执行日志
支持所有 hook 类型: SessionStart、SessionEnd、PreToolUse、PostToolUse 等
在外部终端启动调试会话
查看详细的执行日志
MCP Server Manager: 管理 MCP 服务器并测试连接
Commands Manager: 创建和编辑自定义 slash 命令
CLAUDE.md Manager: 跨项目浏览和编辑 CLAUDE.md 文件
Dependency Graph: 可视化组件依赖关系
Visual Editors: 通过直观的 UI 编辑配置
Multi-language Support: 中英文双语支持

今天这篇文章,我就结合这个工具,手把手教你玩转 Claude Code 的 Hooks 系统。

一、Hooks 到底是个啥?

说白了,Hooks 就是 Claude Code 给你留的一些"钩子",让你能在特定时机插入自己的自动化脚本。

想象一下这个场景:Claude 帮你写完代码后,你得手动运行 prettier 格式化,然后运行测试,再 git add...每次都要重复这些操作,烦不烦?

有了 Hooks,你可以让这些操作自动执行。比如:

Claude 写完文件后,自动格式化代码
执行危险命令前,先弹个确认
会话结束时,自动给你发个通知
提交 prompt 时,自动添加当前时间等上下文信息

Claude Code 一共提供了 10 种 Hook 事件:

SessionStart: 会话启动时触发
SessionEnd: 会话结束时触发
UserPromptSubmit: 用户提交 prompt 时触发
PreToolUse: Claude 执行工具前触发
PostToolUse: Claude 执行工具后触发
Stop: Claude 停止响应时触发
PreCompact: 上下文压缩前触发
PostCompact: 上下文压缩后触发
Notification: 收到通知时触发
SubagentStop: Subagent 停止时触发

注意:PreCompact、PostCompact、Notification 和 SubagentStop 是比较高级的功能,一般人用不到,除非你在做上下文管理或多 Agent 协作相关的工作。

二、为啥要用 Hooks?我遇到的真实痛点

在没用 Hooks 之前,我的开发流程是这样的:

让 Claude 写代码
Claude 写完了,我手动 prettier --write
再手动 npm test
发现忘了格式化某个文件,再格一次
测试挂了,改代码,又忘了格式化...

这种重复劳动实在太折磨人了。更要命的是,有一次 Claude 帮我修改了生产环境的配置文件,我没仔细看就提交了,结果上线出问题。

这些痛点,Hooks 都能解决:

痛点 1: 代码格式化总是忘→ 用 PostToolUse Hook,每次写完文件自动格式化

痛点 2: 不小心执行危险命令
→ 用 PreToolUse Hook,执行前拦截检查

痛点 3: 不知道 Claude 啥时候干完活→ 用 Stop Hook,任务完成自动通知

痛点 4: Claude 对项目上下文不了解→ 用 SessionStart Hook,启动时自动注入项目信息

三、动手实战:配置你的第一个 Hook

咱们从最简单的开始 —— 自动代码格式化。

3.1 创建配置文件

Hooks 的配置有两个地方:

全局配置: ~/.claude/settings.json (所有项目生效)
项目配置: .claude/settings.json (仅当前项目生效)

注意:如果项目配置存在,会完全覆盖全局配置,不是合并!

先创建一个全局配置:

mkdir -p ~/.claude
touch ~/.claude/settings.json

3.2 配置自动格式化 Hook

打开 ~/.claude/settings.json,添加:

{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "prettier --write \\"$CLAUDE_FILE_PATHS\\" || true"
          }
        ]
      }
    ]
  }
}


解释一下各个字段:

PostToolUse: Hook 类型,表示工具执行后触发
matcher: 匹配规则,这里匹配 Write 或 Edit 工具
command: 要执行的命令
$CLAUDE_FILE_PATHS: Claude 提供的环境变量,表示被修改的文件路径
|| true: 很重要!防止格式化失败时阻塞 Claude

当然你也可以用我的工具来配置和调试这个hooks

四、进阶实战:生产环境必备的 5 个 Hooks
Hook 1: 多语言代码格式化

上面的例子只处理了一种语言,实际项目往往是多语言的。我们写个脚本来处理:

创建 .claude/hooks/format.sh:

#!/bin/bash

for file in$CLAUDE_FILE_PATHS; do
case"$file"in
    *.js|*.jsx|*.ts|*.tsx)
      prettier --write "$file" 2>/dev/null || true
      ;;
    *.py)
      black "$file" 2>/dev/null || true
      ;;
    *.go)
      gofmt -w "$file" 2>/dev/null || true
      ;;
    *.java)
      google-java-format -i "$file" 2>/dev/null || true
      ;;
esac
done


别忘了加执行权限:

chmod +x .claude/hooks/format.sh


然后在 .claude/settings.json 里引用:

{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/format.sh"
          }
        ]
      }
    ]
  }
}


直接在工具里面配置和调试

Hook 2: 危险命令拦截(生产环境救命 Hook)

有次 Claude 想帮我执行 rm -rf / 清理缓存,幸好我眼疾手快按了 Ctrl+C。后来我配了这个安全 Hook,再也不担心了。

创建 .claude/hooks/safety_check.py:

#!/usr/bin/env python3
import json
import sys
import re

# 读取 stdin 中的 hook 数据
data = json.load(sys.stdin)
tool_name = data.get("tool_name", "")
tool_input = data.get("tool_input", {})

# 检查危险的 bash 命令
if tool_name == "Bash":
    command = tool_input.get("command", "")
    
    dangerous_patterns = [
        r"rm\\s+-rf\\s+/",           # 删除根目录
        r"rm\\s+-rf\\s+\\*",          # 删除所有文件
        r"dd\\s+if=/dev/zero",      # 清空磁盘
        r":\\(\\)\\{.*\\}",            # fork 炸弹
        r"mv\\s+/\\s+",              # 移动根目录
    ]
    
    for pattern in dangerous_patterns:
        if re.search(pattern, command):
            print(f"BLOCKED: 检测到危险命令: {pattern}", file=sys.stderr)
            print(f"命令内容: {command}", file=sys.stderr)
            sys.exit(2)  # exit code 2 会阻止执行

# 检查敏感文件修改
if tool_name in ["Write", "Edit"]:
    file_path = tool_input.get("file_path", "")
    
    sensitive_files = [
        ".env",
        "id_rsa",
        ".ssh/",
        "production.conf",
        "prod.yaml"
    ]
    
    for sensitive in sensitive_files:
        if sensitive in file_path:
            print(f"BLOCKED: 不能修改敏感文件: {file_path}", file=sys.stderr)
            print("请手动确认后再修改", file=sys.stderr)
            sys.exit(2)

# 没问题,放行
sys.exit(0)


记得加执行权限,然后配置:

{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash|Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/safety_check.py"
          }
        ]
      }
    ]
  }
}


Exit Code 说明(很重要):

exit 0: 放行,继续执行
exit 1: 警告,但继续执行
exit 2: 阻止执行,并把 stderr 信息反馈给 Claude

自从配了这个 Hook,我们团队的生产事故率下降了 90%以上。

Hook 3: 会话启动自动加载项目上下文

每次启动 Claude Code,我都要手动告诉它当前分支、最近提交、待办任务...太累了。

创建 .claude/hooks/session_start.sh:

#!/bin/bash

echo"=== 项目上下文 ==="
echo""

# Git 信息
echo"## 当前分支"
git branch --show-current

echo""
echo"## 最近 5 次提交"
git log --oneline -5

echo""
echo"## 工作区状态"
git status --short

echo""

# 如果安装了 gh CLI,显示你的 issue
ifcommand -v gh &> /dev/null; then
echo"## 你的待办 Issue"
  gh issue list --assignee @me --limit 5
fi

# 显示项目配置
if [ -f "package.json" ]; then
echo""
echo"## 项目信息"
echo"Name: $(cat package.json | jq -r .name)"
echo"Version: $(cat package.json | jq -r .version)"
fi


配置:

{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": ".claude/hooks/session_start.sh"
          }
        ]
      }
    ]
  }
}


这个 Hook 的输出会直接注入到 Claude 的上下文中,所以 Claude 一开始就知道你项目的状态了。

这个工具里面可以测试hooks是否生效。

Hook 4: 代码修改后自动测试

TDD 开发必备!每次改完代码,自动跑测试,省得老忘。

{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "if echo \\"$CLAUDE_FILE_PATHS\\" | grep -q '\\\\.py$'; then pytest tests/ -v --tb=short || true; fi",
            "timeout": 120
          }
        ]
      }
    ]
  }
}


性能优化提示:

测试超过 30 秒,建议后台运行: pytest > /tmp/test.log 2>&1 &
或者移到 Stop Hook,等 Claude 完全停止后再跑
Hook 5: 任务完成通知(摸鱼必备)

Claude 跑长任务的时候,我经常不知道啥时候好。配个通知 Hook,完成了自动提醒我。

macOS 系统提示音:

{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "afplay /System/Library/Sounds/Glass.aiff"
          }
        ]
      }
    ]
  }
}


如果想要更强的通知,可以用 Pushover 推送到手机:

#!/bin/bash
curl -s \\
  --form-string "token=YOUR_APP_TOKEN" \\
  --form-string "user=YOUR_USER_KEY" \\
  --form-string "message=Claude Code 任务完成!" \\
  https://api.pushover.net/1/messages.json

五、Claude Debug 工具:Hooks 调试利器

前面讲了怎么配 Hooks,但实际使用中,Hooks 经常会遇到各种问题:

配置了不生效
执行报错没提示
不知道 Hook 到底跑没跑
Matcher 不知道写对没有

为了解决这些问题,我开发了 Claude Debug 工具。下面重点介绍 Hooks Manager 功能。

5.1 主要功能

1. Hooks 配置管理

可视化查看所有已配置的 Hooks
按 Hook 类型分类展示
显示每个 Hook 的 matcher、command、timeout 等配置
支持直接编辑配置 JSON

2. 实时执行日志

捕获 Hook 执行的标准输出和错误输出
显示执行时间、exit code
高亮错误信息
支持日志搜索和过滤

3. 调试会话

在外部终端启动调试会话
模拟 Hook 执行环境
测试脚本是否能正常运行
查看环境变量(如 $CLAUDE_FILE_PATHS)

4. Hook 测试

手动触发特定 Hook
验证 Matcher 是否正确
测试 exit code 处理逻辑
模拟不同的工具调用场景
5.2 实战案例:用工具排查 Hook 不生效的问题

有次我配了个自动格式化的 Hook,但死活不执行。用 Claude Debug 工具一查:

打开 Hooks Manager,看到配置确实存在
查看执行日志,发现根本没有日志 → 说明 Hook 没被触发
检查 Matcher,发现我写的是 write(小写),而实际应该是 Write(大写)
改成 Write|Edit,重新审批,搞定!

还有一次,Hook 有日志但报错:

/bin/sh: prettier: command not found


原来是 prettier 不在 PATH 里。改成绝对路径就好了:

{
  "command": "/usr/local/bin/prettier --write \\"$CLAUDE_FILE_PATHS\\" || true"
}

六、Hooks 五大坑点及解决方案

根据我这几个月的实践,总结了最常见的 5 个坑:

坑点 1: 配置文件位置搞错

症状: Hook 配置了,但永远不执行

原因: Claude Code 读两个配置文件:

~/.claude/settings.json (全局)
.claude/settings.json (项目)

如果项目配置存在,会完全覆盖全局配置,不是合并!

解决:

运行 /hooks 命令查看实际加载的配置
决定你要的是全局 Hook 还是项目 Hook
把配置放在正确的文件里,不要两边都放

最佳实践:

个人效率工具(通知、快捷键) → 全局配置
团队规范(格式化、测试、安全检查) → 项目配置(提交到 git)
坑点 2: Matcher 大小写敏感

症状: Hook 配了 "matcher": "write",写文件时不触发

原因: 工具名是大小写敏感的!

Write ✅ (正确)
write ❌ (不会匹配)

常用 Matcher 模式:

Write|Edit        # 文件创建和修改
Bash              # 命令执行
Task              # Subagent 任务
                  # 空字符串匹配所有工具


调试技巧: 用空 Matcher 先记录所有工具名:

{
  "hooks": {
    "PreToolUse": [{
      "matcher": "",
      "hooks": [{
        "type": "command",
        "command": "echo \\"Tool: $CLAUDE_TOOL_NAME, Time: $(date)\\" >> /tmp/claude_tools.log"
      }]
    }]
  }
}


然后查看日志: tail -f /tmp/claude_tools.log

坑点 3: Exit Code 理解错误

症状: Hook 失败了但 Claude 继续执行,或者 Hook 成功但 Claude 停了

原因: Exit Code 2 有特殊含义!

Exit Code 规则:

0: 成功,继续执行
1: 警告,继续执行
2: 阻止执行,并将 stderr 反馈给 Claude
其他: 当作警告处理

生产实践:

# 关键安全检查:发现问题必须停止
if grep -r "API_KEY.*=""$CLAUDE_FILE_PATHS"; then
echo"ERROR: 检测到硬编码的 API Key" >&2
exit 2  # 阻止执行
fi

# 代码风格问题:自动修复,不阻塞
if ! prettier --check "$CLAUDE_FILE_PATHS" 2>/dev/null; then
  prettier --write "$CLAUDE_FILE_PATHS"
exit 0  # 修复后继续
fi

坑点 4: 忘记审批 Hook

症状: settings.json 改了,Hook 还是不生效

原因: 安全机制要求手动审批 Hook

解决流程:

修改 settings.json
重启 Claude Code 或开新会话
运行 /hooks 命令
选择待审批的 Hook,批准

注意:这是刻意的安全设计,防止恶意配置文件自动执行

坑点 5: Hook 悄悄失败,没日志

症状: Hook 应该跑,但啥输出都没有

可能原因:

脚本路径不对,找不到文件
脚本没有执行权限
Python/bash 不在 PATH 里
stderr 没被捕获

排查方法:

Step 1: 先用 echo 测试 Hook 是否触发

{
  "command": "echo \\"Hook fired at $(date)\\" >> /tmp/hook_test.log"
}


检查 /tmp/hook_test.log,如果没内容,说明 Hook 根本没触发 → 检查 Matcher

Step 2: 如果有日志,说明 Hook 触发了,再测试脚本本身

cd /path/to/project
export CLAUDE_FILE_PATHS="test.py"
.claude/hooks/your_script.sh


Step 3: 常见修复

# 加执行权限
chmod +x .claude/hooks/*

# 使用绝对路径
"command": "/usr/local/bin/python3 /full/path/to/script.py"

# 确保 shebang 正确
#!/usr/bin/env python3  # 推荐,自动找 python3
#!/bin/bash

七、生产团队的 Hook 配置最佳实践

我们团队现在的配置方案,供参考:

7.1 配置分层
~/.claude/settings.json  (个人配置)
├── 通知 Hooks
├── 效率工具
└── 个人偏好

.claude/settings.json  (团队配置,提交 git)
├── 代码格式化  
├── 安全检查
├── 自动测试
└── 上下文加载

7.2 性能预算

Hook 执行时间会影响开发体验,我们的标准:

同步执行: ≤5 秒 (格式化、lint)
后台执行: 30-120 秒 (测试、构建)
绝不能做: >120 秒或交互式命令

超过 30 秒的任务,要么后台跑,要么移到 Stop Hook。

八、总结

Hooks 是 Claude Code 最强大但也最容易被忽视的功能。用好了,能大幅提升效率,减少人工失误。

核心要点回顾:

10 种 Hook 类型,最常用的是 PreToolUse、PostToolUse、SessionStart、Stop
配置分层: 全局配置 vs 项目配置,项目配置会覆盖全局
Exit Code 规则: 0/1 继续,2 阻止
安全第一: PreToolUse 拦截危险操作
性能考虑: 同步 ≤5s,后台 ≤120s
调试工具: 用 Claude Debug 工具可视化管理和调试

我的 Claude Debug 工具已经开源,欢迎试用和提 issue。工具地址会在文末放出。

最后说一句,Claude Code 的强大远不止于此。Hooks 只是它插件系统的一部分,配合 MCP、Subagent、Skills 一起用,才能发挥最大威力。

相关文章推荐:

《手把手教你创建第一个能用的Claude Code Skill(附完整代码)》
《Claude Code 斜杠命令使用指南：你想知道的都在这了》
《Claude Code Sub Agent完全指南：构建你的专属编程团队》

工具开源地址: https://github.com/lookfree/claude-code-debugger

---
*导入时间: 2026-01-17 20:47:46*
