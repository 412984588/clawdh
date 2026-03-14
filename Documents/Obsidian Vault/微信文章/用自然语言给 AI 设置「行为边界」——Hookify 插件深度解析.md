---
title: "用自然语言给 AI 设置「行为边界」——Hookify 插件深度解析"
source: wechat
url: https://mp.weixin.qq.com/s/pzn_eRlbpAv5BZ4ZDP1G1w
author: 知识药丸
pub_date: 2025年12月21日 18:37
created: 2026-01-17 20:24
tags: [AI, 编程]
---

# 用自然语言给 AI 设置「行为边界」——Hookify 插件深度解析

> 作者: 知识药丸 | 发布日期: 2025年12月21日 18:37
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/pzn_eRlbpAv5BZ4ZDP1G1w)

---

👀 Hookify 的出现，把 Claude Code 的 Hooks 机制从"专业开发者工具"变成了"人人可用的功能"。
《贾杰的AI编程秘籍》付费合集，共10篇，现已完结。30元交个朋友，学不到真东西找我退钱；）
以及我的墨问合集《100个思维碎片》，1块钱100篇，与你探讨一些有意思的话题（文末有订阅方式



 

写在前面

有次我用 Claude Code 写代码时，遇到了一个很讨厌的问题。

Claude 兴冲冲地帮我重构完代码，说了句"任务完成"就要退出，结果我一看——测试根本没跑！这代码能不能用都不知道，它就想交差了。

当时我只能在聊天里反复强调："下次记得先跑测试！""别忘了跑测试！"

但我们都知道，AI 是没有记忆的。下一次对话，它还是会犯同样的错误。

那有没有办法，让 AI 助手像人类开发者一样，主动遵守项目规范，甚至在即将犯错时自己拦住自己？

好消息是，Claude Code 原生就支持 Hooks（钩子） 机制——可以在特定时刻插入自定义脚本。坏消息是，要写 JSON 配置，还得写 Python/Bash 脚本，门槛实在不低。

今天要介绍的 Hookify 插件，就是专门解决这个问题的。你不需要写一行代码，只需要用自然语言告诉它"不要做什么"，它就能自动生成规则。

更酷的是什么？它还能主动分析你的对话记录，发现你反复纠正 Claude 的地方，然后问你："要不要把这个变成永久规则？"

核心思想：把复杂的 Hook 配置变成简单的对话

传统的 Hook 配置是这样的：

{
  "PreToolUse": [{
    "matcher": "Bash",
    "hooks": [{
      "type": "command",
      "command": "python3 /path/to/validate.py"
    }]
  }]
}

然后你还得写那个 validate.py，用正则匹配命令内容，判断是否允许执行……

麻烦死了。

Hookify 做了三件事把这套流程简化：

1. 引擎化：写了一套通用的规则引擎（rule_engine.py），统一处理所有钩子的匹配逻辑
2. 配置化：把 Python 脚本变成简单的 Markdown + YAML 文件
3. Agent 化：让 Claude 自己分析对话，发现你不爽的地方，自动生成规则

用人话说就是：你只需要抱怨一句，Hookify 就能把它变成永久的防护栏。

三种创建规则的方式
方式一：直接下命令

最直观的用法：告诉 Claude 你不想要什么。

/hookify 禁止在 TypeScript 文件中添加 console.log

这条命令会在项目根目录的 .claude/ 下生成：

.claude/hookify.block-console-log.local.md：

---
name: block-console-log
enabled: true
event: file          # 监听文件编辑
pattern: console\.log\(
action: block        # 直接拦截
---

🐛 **检测到调试代码！**

你正在添加 `console.log`，记得提交前删除哦。

就这么简单。下次 Claude 尝试写 console.log 时，会直接被拦下来，并看到你定义的提示。

方式二：AI 主动分析对话

这是 Hookify 最智能的地方。

假设你刚刚经历了这样的对话：

你：帮我重构这段代码
Claude：好的，重构完成了！（准备退出）
你：等等！你没跑测试就想跑？！
Claude：抱歉，我这就运行测试...

现在你只需要输入：

/hookify

（没错，不带任何参数）

Hookify 会启动一个叫 conversation-analyzer 的智能体，读取你最近的对话，识别出"挫败信号"（比如"等等！""为什么不...""你应该..."），然后总结出问题：

发现问题：用户希望在任务完成前必须运行测试

接着它会问你："要不要把这个变成永久规则？"

你确认后，自动生成：

.claude/hookify.require-tests.local.md：

---
name: require-tests-before-stop
enabled: true
event: stop          # 监听任务结束
action: block
conditions:
  - field: transcript
    operator: not_contains
    pattern: npm test|pytest|cargo test
---

⚠️ **还没跑测试呢！**

在完成任务前，请先运行测试验证你的修改。

从此以后，Claude 想要"交差"时，如果聊天记录里没出现过测试命令，就会被自动拦下来。

这就是 AI 时代的"事后诸葛亮"——把你踩过的坑，自动变成未来的防护栏。

方式三：手动编写

如果你对规则有精确要求，可以直接在 .claude/ 下新建 Markdown 文件。

比如拦截包含敏感信息的文件编辑：

.claude/hookify.sensitive-files.local.md：

---
name: warn-sensitive-files
enabled: true
event: file
action: warn         # 警告但不阻止
conditions:
  - field: file_path
    operator: regex_match
    pattern: \.env$|credentials|secrets
  - field: new_text
    operator: contains
    pattern: API_KEY|SECRET|TOKEN
---

🔐 **敏感文件编辑警告！**

你正在修改可能包含密钥的文件。请确认：
- 凭证没有硬编码
- 文件已添加到 .gitignore

注意这里的 action: warn——它只会警告，但不会阻止 Claude 继续操作。对于"提醒"类的规则很有用。

配置语法速查
基础字段
name: my-rule           # 规则唯一标识
enabled: true           # 是否启用
event: bash             # 触发时机
pattern: rm\s+-rf       # 正则表达式
action: block           # warn（警告）或 block（拦截）
Event 类型（什么时候触发）
Event
	
触发时机
	
典型用途

bash	
执行命令前
	
拦截 rm -rf、chmod 777

file	
编辑文件时
	
检查文件内容和路径

stop	
Claude 想结束任务时
	
检查是否跑过测试

prompt	
用户提交输入时
	
添加上下文

all	
所有事件
	
通用监控
Pattern（正则表达式常用技巧）
rm\s+-rf              # 匹配 "rm -rf"
console\.log\(        # 匹配 "console.log("（注意转义点）
(eval|exec)\(         # 匹配 "eval(" 或 "exec("
\.env$                # 以 .env 结尾
chmod\s+777           # "chmod 777"
Conditions（多条件组合）

当需要同时满足多个条件时：

conditions:
  - field: file_path           # 文件路径
    operator: regex_match      # 正则匹配
    pattern: \.tsx?$           # TypeScript 文件
  - field: new_text            # 新增内容
    operator: contains         # 包含字符串
    pattern: API_KEY           # 关键词

所有条件必须同时满足。

支持的操作符：

• regex_match：正则匹配
• contains：包含字符串
• not_contains：不包含
• equals：完全相等
• starts_with / ends_with：开头/结尾
实用规则案例
案例1：拦截危险命令
---
name: block-destructive-ops
enabled: true
event: bash
pattern: rm\s+-rf|dd\s+if=|mkfs|format
action: block
---

🛑 **检测到破坏性操作！**

这条命令可能导致数据丢失，已被阻止。
请仔细检查路径并使用更安全的方式。
案例2：TypeScript 禁止硬编码密钥
---
name: api-key-in-typescript
enabled: true
event: file
conditions:
  - field: file_path
    operator: regex_match
    pattern: \.tsx?$
  - field: new_text
    operator: regex_match
    pattern: (API_KEY|SECRET|TOKEN)\s*=\s*["']
action: warn
---

🔐 **TypeScript 文件中检测到硬编码凭证！**

请使用环境变量：
```typescript
const apiKey = process.env.API_KEY;

#### 案例3：强制代码审查

```markdown
---
name: require-code-review
enabled: true
event: stop
action: block
conditions:
  - field: transcript
    operator: not_contains
    pattern: git diff|reviewed
---

📋 **缺少代码审查步骤！**

在完成任务前，请运行 `git diff` 查看修改。
底层实现剖析

好了，前面讲的都是"怎么用"。现在我们来看看它是怎么做到的。

整体架构
plugins/hookify/
├── hooks/hooks.json              # 注册 Claude Code 钩子
├── core/
│   ├── config_loader.py          # 加载 .md 规则文件
│   └── rule_engine.py            # 规则匹配引擎
├── agents/
│   └── conversation-analyzer.md  # 对话分析 Agent
├── commands/
│   ├── hookify.md                # /hookify 命令
│   └── hookify-list.md           # /hookify:list
└── scripts/
    ├── pretooluse.py             # 工具执行前钩子
    └── stop.py                   # 任务结束钩子
关键组件
1. hooks.json：入口注册

这个文件告诉 Claude Code："在这些时刻，请调用我的脚本"。

{
  "PreToolUse": [
    {
      "matcher": "*",
      "hooks": [
        {
          "type": "command",
          "command": "python3 ${CLAUDE_PLUGIN_ROOT}/scripts/pretooluse.py"
        }
      ]
    }
  ]
}

${CLAUDE_PLUGIN_ROOT} 是环境变量，指向插件目录。

2. rule_engine.py：规则匹配器

这是 Hookify 的核心。每次钩子触发时，它会：

1. 加载所有 .claude/hookify.*.local.md 文件
2. 遍历规则，检查 event 是否匹配
3. 用 Python 的 re 模块执行正则匹配
4. 返回决策：approve（允许）、block（拦截）或 warn（警告）

核心逻辑（简化版）：

def evaluate(tool_name, tool_input):
    for rule in load_rules():
        # 检查事件类型
        if rule['event'] != current_event:
            continue
        
        # 正则匹配
        if re.search(rule['pattern'], tool_input):
            if rule['action'] == 'block':
                return {
                    'decision': 'block',
                    'message': rule['markdown_content']
                }
    
    return {'decision': 'approve'}

优雅的地方在于：所有规则共用一个引擎，每次加载最新的配置文件，完全不需要重启 Claude Code。

3. config_loader.py：配置解析

负责扫描 .claude/ 目录，解析 Markdown 的 YAML frontmatter。

为什么要用 .local.md 后缀？因为这些规则通常是个人习惯，不应该提交到 Git。你会发现项目的 .gitignore 里有：

*.local.md

这样团队成员可以各自定制规则，互不干扰。当然，你也可以创建 .md（不带 .local）的文件来共享团队规范。

4. conversation-analyzer.md：AI 分析师

这是最"魔法"的部分。它其实是一个 Prompt 文件，定义了一个专门的 Agent：

# 你是一位对话分析专家

你的任务是分析用户与 Claude 的聊天记录，识别：
- 用户的挫败感（"为什么不..."、"你应该..."）
- 重复纠正（多次提醒同一件事）
- 明确禁止（"不要..."、"别..."）

输出格式：
{
  "issue": "问题描述",
  "pattern": "正则表达式",
  "severity": "high|medium|low"
}

当你运行 /hookify 时，这个 Agent 会被唤醒，读取聊天记录，生成结构化的分析结果。

这就是"元编程"思想的体现——用 AI 来配置 AI 的行为边界。

实战技巧
技巧1：从宽松到严格

刚开始用时，建议先设置 action: warn：

action: warn  # 先观察，不阻止

确认规则准确后，再改成 action: block。

技巧2：善用多条件组合

与其写十条单一规则，不如写一条精确的：

# ✅ 好的做法：一条规则搞定
conditions:
  - field: file_path
    operator: ends_with
    pattern: .ts
  - field: new_text
    operator: contains
    pattern: API_KEY
技巧3：为复杂正则添加说明

在 Markdown 正文里解释你的正则：

---
pattern: (rm|dd|mkfs|format)\s+
---

**拦截规则说明**：
- `rm`：删除命令
- `dd`：磁盘镜像工具（可能覆盖分区）
- `mkfs`：格式化文件系统

方便以后维护。

技巧4：定期检查规则列表
/hookify:list

规则多了容易忘，定期清理过时的。

常见问题
Q：规则不生效？

检查清单：

1. 文件是否在 .claude/ 目录？
2. 文件名符合 hookify.*.local.md 格式吗？
3. YAML 里 enabled: true 了吗？
4. 试试 /hookify:list 看是否被加载
Q：正则匹配不上？

用 Python 测试：

python3 -c "import re; print(re.search(r'你的正则', '测试文本'))"

记得在 YAML 里不要用引号包裹正则，否则需要双重转义。

Q：规则太多会不会慢？

Hookify 的正则匹配通常在毫秒级。只要别写超级复杂的嵌套正则，性能完全 OK。

建议：保持规则简单，用多条规则代替复杂条件。

Q：能跨项目共享规则吗？

可以！创建全局规则：

~/.claude/hookify.global-rules.local.md

所有项目都会应用。

总结

Hookify 的出现，把 Claude Code 的 Hooks 机制从"专业开发者工具"变成了"人人可用的功能"。

它最巧妙的地方在于三点：

1. 通用引擎：把复杂的 Python 脚本封装成一个规则匹配器，所有规则共用
2. AI 驱动：让 Claude 自己分析对话，发现问题，生成规则
3. 即改即用：规则文件修改后立即生效，无需重启

如果你正在用 Claude Code，强烈建议试试 Hookify。说不定下次，你就能对着 Claude 说：

"这次不用我提醒，你自己记得跑测试了吧？"

P.S. 如果你创造了什么有趣的规则，欢迎分享！我特别想看看大家都给 Claude 设置了哪些"行为边界" 😄

参考资料
• Hookify GitHub 文档
• Claude Code Hooks 参考
• 《深入理解 AI 辅助编程工具》

 





 坚持创作不易，求个一键三连，谢谢你～❤️
以及「AI Coding技术交流群」，联系 ayqywx 我拉你进群，共同交流学习～

---
*导入时间: 2026-01-17 20:24:16*
