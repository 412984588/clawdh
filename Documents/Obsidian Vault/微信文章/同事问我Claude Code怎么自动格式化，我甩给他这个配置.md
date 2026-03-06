---
title: "同事问我Claude Code怎么自动格式化，我甩给他这个配置"
source: wechat
url: https://mp.weixin.qq.com/s/g4e_oUfaLfmaOQSAKkE7UQ
author: 易安说AI
pub_date: 2025年12月21日 10:26
created: 2026-01-17 20:24
tags: [AI, 编程]
---

# 同事问我Claude Code怎么自动格式化，我甩给他这个配置

> 作者: 易安说AI | 发布日期: 2025年12月21日 10:26
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/g4e_oUfaLfmaOQSAKkE7UQ)

---

上周有个朋友问我：你用Claude Code写代码，改完之后怎么格式化？

我说自动的啊，改完就格式化好了。

他说不对，我每次都要手动跑prettier。

我才意识到，他不知道Hooks这个东西。

Hooks是什么

简单说，就是在Claude Code干活的过程中，你可以"插入"一些自动执行的命令。

比如：

• Claude改完代码 → 自动格式化
• Claude要删文件 → 先检查是不是.env，是的话拦住
• Claude完成任务 → 弹个通知告诉你
• Claude想停下来 → 检查测试有没有全过，没过就让它继续

你可以把它理解成"自动触发器"。Claude干到某个节点，你的命令就自动跑。

跟在规则文件里写要求不一样，那个是"建议"，Claude可能忘。Hooks是代码级别的，到点必触发。

我在用的几个配置

直接上配置，复制到.claude/settings.json就能用。

1. 改完代码自动格式化
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Write|Edit",
      "hooks": [{
        "type": "command",
        "command": "npx prettier --write \"$FILE_PATH\""
      }]
    }]
  }
}

PostToolUse的意思是"工具用完之后"。matcher匹配Write和Edit，就是写文件和改文件。

这样Claude一改代码，prettier自动跑，不用你手动。

有个坑：项目里要装prettier。如果是全局配置，要npm i prettier -g。

2. 保护敏感文件
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Write|Edit",
      "hooks": [{
        "type": "command",
        "command": "python3 -c \"import json,sys;d=json.load(sys.stdin);p=d.get('tool_input',{}).get('file_path','');sys.exit(2 if '.env' in p or '.git/' in p else 0)\""
      }]
    }]
  }
}

PreToolUse是"工具用之前"。脚本检查文件路径，如果是.env或.git目录下的文件，返回退出码2，Claude就会被拦住。

有一次让Claude"清理无用文件"，它把.env删了。数据库密钥全没了，找了半天备份。从那之后就配了这个。

退出码的含义：

• 0 = 正常，继续
• 2 = 阻止操作，把错误信息反馈给Claude
• 其他 = 报错但继续
3. 任务完成弹通知
{
  "hooks": {
    "Stop": [{
      "hooks": [{
        "type": "command",
        "command": "osascript -e 'display notification \"任务完成\" with title \"Claude Code\"'"
      }]
    }]
  }
}

Stop是Claude完成响应的时候。Mac上用osascript弹系统通知，Windows可以用PowerShell的通知命令。

让Claude跑个耗时任务，你可以去干别的，完成了它会叫你。

4. 记录执行的命令
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Bash",
      "hooks": [{
        "type": "command",
        "command": "jq -r '.tool_input.command' >> ~/.claude/command-log.txt"
      }]
    }]
  }
}

每次Claude执行Bash命令，都记录到日志文件。方便回溯"它到底跑了什么"。

上下文一长，眼花缭乱的，有个日志文件清晰多了。

进阶玩法：Stop Hook强制继续

有时候Claude干完活说"我完成了"，但其实测试没跑，或者文档没更新。

Stop Hook可以检查这些，没完成就让它继续：

{
  "hooks": {
    "Stop": [{
      "hooks": [{
        "type": "command",
        "command": "python3 .claude/hooks/check_done.py"
      }]
    }]
  }
}

check_done.py大概这样写：

import json, sys, subprocess

data = json.load(sys.stdin)

# 防止无限循环，第二次就放行
if data.get("stop_hook_active"):
    sys.exit(0)

# 检查测试是否通过
result = subprocess.run(["npm", "test"], capture_output=True)
if result.returncode != 0:
    print("测试没过，继续修", file=sys.stderr)
    sys.exit(2)

sys.exit(0)

注意stop_hook_active这个字段。第一次拦住让Claude继续，第二次必须放行，不然会无限循环。

8种Hook事件

Claude Code一共有8个可以插入的节点：



事件
	
触发时机
	
能拦住吗


SessionStart
	
会话开始
	
否


UserPromptSubmit
	
你按回车之后
	
能


PreToolUse
	
工具执行前
	
能


PostToolUse
	
工具执行后
	
否


PreCompact
	
压缩上下文前
	
否


Notification
	
发通知时
	
否


Stop
	
完成响应时
	
能


SubagentStop
	
子任务完成时
	
能

"能拦住"的意思是，你的脚本可以返回退出码2，阻止Claude继续。

比如PreToolUse能拦，你就能在Claude删文件之前把它拦下来。PostToolUse拦不住，文件已经删了，你只能事后处理。

常用的就这几个：

• PostToolUse - 事后自动处理（格式化、lint）
• PreToolUse - 事前拦截（保护敏感文件、阻止危险命令）
• Stop - 完成时检查（确保测试通过、文档更新）
• Notification - 自定义提醒
配置文件放哪

三个位置，优先级从高到低：

• .claude/settings.local.json - 项目级，不提交git
• .claude/settings.json - 项目级，提交git，团队共享
• ~/.claude/settings.json - 用户级，全局生效

我的做法：

• 格式化放项目级（不同项目配置不同）
• 通知放用户级（全局都要）
• 敏感文件保护放用户级（所有项目都要）
组合起来用

把上面几个配置合在一起：

{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [{
          "type": "command",
          "command": "python3 -c \"import json,sys;d=json.load(sys.stdin);p=d.get('tool_input',{}).get('file_path','');sys.exit(2 if '.env' in p else 0)\""
        }]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [{
          "type": "command",
          "command": "npx prettier --write \"$FILE_PATH\" 2>/dev/null || true"
        }]
      }
    ],
    "Stop": [
      {
        "hooks": [{
          "type": "command",
          "command": "osascript -e 'display notification \"任务完成\" with title \"Claude Code\"'"
        }]
      }
    ]
  }
}

这样就有了：改代码自动格式化 + 保护.env + 完成通知。

调试技巧

配置改完要重启Claude Code才生效。我第一次配的时候，改了半天没反应，以为写错了。后来发现退出重进就好了。

用claude --debug启动可以看Hook执行日志：

[DEBUG] Hook triggered: PostToolUse
[DEBUG] Running command: npx prettier --write...
[DEBUG] Hook completed with exit code 0

如果Hook一直报错，Write和Edit工具会执行失败。遇到这种情况，先把Hook配置注释掉，确认是Hook的问题还是其他问题。

还可以在Hook命令里加日志：

echo "$(date) Hook执行" >> ~/.claude/hook-debug.log

出问题了去这个文件里找。

Hooks这个功能藏得比较深，官方文档也没怎么宣传。但用起来确实省事，把重复的操作自动化掉。

我目前主要用格式化、敏感文件保护、完成通知这几个。

有问题欢迎交流，微信：20133213。

---
*导入时间: 2026-01-17 20:24:57*
