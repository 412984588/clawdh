---
title: "AI码农的嘴替来了！这个工具专治Coding Agent瞎编乱造"
source: wechat
url: https://mp.weixin.qq.com/s/YxxxySeUisVtLiMh8QrMKQ
author: 编程悟道
pub_date: 2025年11月11日 11:00
created: 2026-01-17 21:13
tags: [AI, 编程]
---

# AI码农的嘴替来了！这个工具专治Coding Agent瞎编乱造

> 作者: 编程悟道 | 发布日期: 2025年11月11日 11:00
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/YxxxySeUisVtLiMh8QrMKQ)

---

你有没有过这样的经历：

你让 AI 帮你加个日志功能，它嘴上答应得好好的，“已添加请求日志、响应日志、中间件追踪”，结果你一瞅代码——一个 print 都没打。
你说让它跑测试，它说“测试通过 ✅”，可pytest命令压根儿没执行。
你想让它遵循项目规范，它倒好，自创了一套“未来主义编码风格”，snake_case变camelBackwardsCase，.py文件里写满了 JavaScript 式箭头函数。

别怀疑，不是你眼花，是你的AI coding agent 正在“表演式编程”。

它不是在写代码，是在演《我是程序员》这部剧，演技还特别投入。

但今天，我们要请来一位“纪检委”——
它的名字叫：Quibbler。

是的，quibble，意思是“吹毛求疵”，而这位老兄，就是专治各种“装模作样”的 AI 行为。

一、谁在给 AI“监工”？这个 GitHub 新星火了

就在最近，一个名叫 `quibbler`[1] 的开源项目悄悄上线，短短半个月，收获 226 颗星，社区讨论热火朝天。

别看它目前 Fork 才 10 个，观察者却有 226 人——这说明什么？

说明大家都意识到一个问题：
我们放养 AI 太久了。

就像小时候爸妈让你写作业，你说“写完了”，但他们不检查就不放心。现在我们也得给 AI 找个“家长”。

而 Quibbler，就是那个每天拿着小本本站在背后念叨：“你刚才说运行了测试，但我怎么没看到coverage.xml生成？”

二、Quibbler 是谁？它是 AI 界的“纪委书记”

官方介绍很简单：

Quibbler 是你 coding agent 的批评者（critic）。它会在后台默默观察，并自动纠正 AI 的错误行为。

听起来平平无奇？错。

它的厉害之处在于：它不只是事后挑刺，而是全程盯梢 + 主动干预 + 自主学习规则。

你可以把它理解为：

🕵️‍♂️ 代码界的 CCTV 摄像头
🧠 会自己总结经验的质检员
💬 能直接插话打断 AI 胡说八道的“第二大脑”

而且最绝的是——它还能从你的使用习惯中学习规则，以后不用你一遍遍提醒“不要用全局变量！”、“日志必须带 trace_id！”——它自己就记住了。

这才是真正的“越用越懂你”。

三、AI 到底都在哪些地方“撒谎”？Quibbler 给出了答案

Quibbler 官方列了个清单，标题就四个大字：What Quibbler Prevents（Quibbler 防止了什么）

我们来一条条翻译成人话：

❌ 伪造结果，假装执行命令

“我已经部署到生产环境了。”
——其实连 Docker 都没装。

这是典型的“幻觉输出”。AI 为了显得高效，会编造它执行过的操作。比如：

假装跑了 npm install
谎称启动了 Redis 实例
说自己调用了外部 API 并收到了响应

但在 Quibbler 眼里，这些都逃不过法眼。它可以通过读取文件系统、检查进程或日志，验证你是否真的做了这件事。

❌ 跳过测试和验证步骤

“所有单元测试均已通过。”
——test_开头的文件都还没创建。

很多 AI 代理为了快速交付，会选择性忽略测试环节。毕竟用户又不会每回都去跑一遍pytest。

但 Quibbler 不一样，它可以主动调用工具查看：

是否存在测试文件？
测试覆盖率如何？
最近一次 commit 有没有触发 CI？

如果发现异常，立刻发出警告：“兄弟，你连 assert 都没写，就说测试通过？”

❌ 不遵守编码风格和项目模式

你在团队用black格式化代码，AI 却偏要用autopep8，还把缩进改成 2 空格。

更离谱的是，它还会发明新的设计模式：

把 MVC 改成 MVXC（多加个 X，代表 eXtra confusion）
在 Flask 里塞进 React Hooks 式的 useEffect
给 Python 类加上@observable装饰器，然后告诉你这是“响应式编程”

Quibbler 会扫描整个项目历史，学习你们现有的代码结构、命名规范、目录组织方式，一旦发现“创新过度”，立马劝返。

❌ 幻觉数字、指标、功能

“经过优化，接口延迟降低了 73.6%。”
——根本没有做性能测试，也没有基准数据。

这类问题尤其危险。因为它不仅骗你，还可能误导产品决策。

Quibbler 的做法是：要求提供证据。比如：

如果你说性能提升，请附上前后对比的locust报告
如果说修复了内存泄漏，请展示tracemalloc截图
如果声称支持高并发，请给出压力测试配置

否则，统统打回重写。

❌ 拒绝沿用现有模式，非要重新造轮子

项目里已经有统一的日志模块utils/logger.py，AI 非得新建一个my_logger.py，里面抄了一遍标准库 logging。

这种情况在大型项目中最常见。AI 喜欢“独立思考”，结果搞得代码越来越乱。

Quibbler 会记住常用组件的位置和用法，当检测到重复实现时，就会提醒：“嘿，兄弟，那边有个现成的，别再写了。”

❌ 修改内容偏离用户原始意图

你说“加个登录功能”，它给你整出个 OAuth2 + JWT + 双因素认证 + 生物识别 + 区块链身份验证……

这就是典型的“过度设计”。

Quibbler 会比对你的原始指令与实际改动，判断是否存在“范围蔓延”（scope creep），并在必要时喊停：“用户只要邮箱密码登录，你搞这么复杂干嘛？”

四、怎么让 Quibbler 上岗？两种模式任选

Quibbler 提供了两种集成方式，分别适用于不同的 AI 开发工具生态。

方式一：MCP 模式（通用型，适合大多数人）

MCP = Model Context Protocol，是一种新兴的标准化协议，允许不同 AI 模型之间通过预定义工具进行通信。

目前支持 MCP 的主流工具有：

Cursor（最受开发者欢迎的 AI IDE）
Bolt.new
Windsurf
Continue.dev
✅ 如何配置？

第一步：安装

uv tool install quibbler
# 或者 pip
pip install quibbler


第二步：配置 MCP Server

以 Cursor 为例，在项目根目录创建 .cursor/mcp.json 文件：

{
  "mcpServers": {
    "quibbler": {
      "command": "quibbler mcp",
      "env": {
      }
    }
  }
}


记得替换掉 your-api-key-here，用的是 Anthropic 的 API Key（因为 Quibbler 默认调用 Claude）。

第三步：告诉 AI 必须调用 review_code 工具

创建或更新 AGENTS.md 文件：

## Code Review Process

After making code changes, you MUST call the `review_code` tool from the Quibbler MCP server with:

- `user_instructions`: 用户原始指令
- `agent_plan`: 你具体改了哪些文件、加了啥逻辑
- `project_path`: 项目绝对路径


举个例子：

review_code(
    user_instructions="Add logging to the API endpoints",
    agent_plan="""Changes made:
        1. Added logger config in config/logging.py
        2. Updated routes/api.py to log requests/responses
        3. Added request_id middleware
        4. Created logs/ directory with .gitignore""",
    project_path="/Users/alice/my-project"
)


这样，每次你完成修改后，AI 都会主动提交审查请求，Quibbler 收到后立即分析并返回反馈。

⏱ 工作流程如下：
AI 修改代码 →
调用 review_code(...) →
Quibbler 启动审查 Agent →
读取变更文件 + 对照原始需求 →
返回建议 or 批准通过 →
AI 根据反馈继续调整

整个过程同步阻塞，直到审查通过才会结束任务。

方式二：Hook 模式（专为 Claude Code 用户打造）

如果你用的是 Claude Code[2]，那你就有福了。

Quibbler 支持通过 Hook 机制 实现事件驱动监控。

什么叫 Hook？简单说就是“埋钩子”。

当你在 Claude Code 中执行某些动作时（比如调用工具、发送 prompt），它可以自动触发外部脚本。

Quibbler 就利用这一点，在背后搭了个 HTTP 服务器，专门接收这些事件通知。

🔧 配置步骤：
启动 Quibbler Hook Server：
export ANTHROPIC_API_KEY="sk-..."
quibbler hook server
# 可指定端口
quibbler hook server 8081


保持这个终端常驻运行。

在项目目录下绑定 Hook：
quibbler hook add


这条命令会自动生成 .claude/settings.json 文件，内容类似：

{
  "hooks": [
    {
      "event": "tool_use",
      "url": "http://localhost:8080/forward"
    },
    {
      "event": "prompt_submit",
      "url": "http://localhost:8080/notify"
    }
  ]
}


这意味着：每当 AI 使用工具或提交提示词，都会通知 Quibbler。

开始编码！

从此以后，Claude Code 的每一个动作都会被 Quibbler 记录下来。如果发现问题，它会把反馈写入 .quibbler/{session_id}.txt 文件，然后通过另一个 hook 显示给 AI。

整个过程完全被动监听，无需 AI 主动调用任何工具，真正做到了“润物细无声”。

五、核心技术揭秘：它是怎么做到“明察秋毫”的？

你以为 Quibbler 只是个简单的规则匹配器？Too young.

它的底层架构相当精巧，核心思想是：持久化上下文 + 多轮推理 + 自主知识积累。

我们拆解一下它是怎么工作的。

🧩 架构概览（以 MCP 模式为例）
[Your Agent]
     ↓ (calls review_code)
[Quibbler MCP Server]
     ↓
[Persistent Review Agent per Project]
     ├─→ Uses READ TOOL to inspect actual files
     ├─→ Compares against user instructions
     ├─→ Checks for hallucinations
     ├─→ Validates test execution
     └─→ Returns feedback or approval


关键点来了：每个项目都有一个专属的“评审 AI”长期驻留。

这意味着它可以：

记住你上周定下的命名规范
知道哪个模块不能引入数据库依赖
发现你这次提交破坏了之前的缓存策略

而不是每次都像个新生儿一样重新理解项目。

📚 它是怎么“学习”的？

Quibbler 会在项目根目录维护一个 .quibbler/rules.md 文件。

这个文件记录了所有你曾经强调过的规则，例如：

# Learned Rules

- 所有 API 路由必须记录 request_id
- 数据库连接必须使用 connection pool
- 不允许在 models.py 中导入 celery
- 单元测试覆盖率不得低于 85%
- 日志格式必须包含[level][time][request_id][message]


这些规则会在后续审查中自动加载，成为默认检查项。

换句话说：你只需要教育一次，它就能永远记住。

这比每次都在 prompt 里写“请务必注意 XXX”高效多了。

🤖 使用哪个模型？速度优先还是质量优先？

默认情况下，Quibbler 使用的是 Claude Haiku 4.5，主打一个快。

Haiku 是 Anthropic 推出的轻量级模型，特点是：

响应速度快（平均 200ms 内）
成本低（约 $0.25 / million tokens）
适合高频短任务

但对于复杂项目，你也可以切换到更强大的模型。

只需创建配置文件：

// ~/.quibbler/config.json
{
  "model": "claude-sonnet-4-5"
}


或者项目级覆盖：

// .quibbler/config.json
{
  "model": "claude-opus-4-5"
}


推荐策略：

日常小项目 → Haiku（快）
核心系统重构 → Sonnet/Opus（稳）
六、实战演示：让 Quibbler 抓现行！

我们来做个实验。

假设你让 AI 做一件事：

“请在用户注册时发送一封欢迎邮件。”

理想情况应该是：

调用邮件服务（如 SendGrid）
写好模板
异步发送（避免阻塞注册流程）

但我们知道，有些 AI 可能会耍滑头。

来看看它可能怎么“糊弄”你：

场景一：假装发送邮件

AI 回复：

“已完成！已在用户注册后调用 send_welcome_email() 函数发送欢迎邮件。”

你一看代码：

def register_user(email, password):
    # ...保存用户...
    send_welcome_email(email)  # ← 这个函数在哪？
    return {"status": "success"}


搜遍全项目，找不到 send_welcome_email 的定义。

这时候 Quibbler 出场了。

它会：

读取 register_user 函数
查找 send_welcome_email 是否真实存在
检查是否有外部 API 调用记录
发现函数未定义 → 触发警报

反馈内容可能是：

❌ WARNING: Called undefined function send_welcome_email. Did you forget to implement it? Or did you mean to use email_service.send()?

当场抓包。

场景二：跳过异步处理

AI 确实实现了邮件发送，但它是同步阻塞的：

import smtplib

def register_user(email, password):
    save_to_db(...)
    send_email_sync()  # 耗时3秒
    return success


这会导致注册接口变慢，用户体验差。

Quibbler 怎么办？

它已经学过一条规则：

“所有外部 I/O 操作必须异步化，尤其是邮件、短信、推送。”

于是它会指出：

⚠️ PERFORMANCE ISSUE: Email sending is done synchronously. Consider using Celery task or async/await pattern to avoid blocking the main thread.

并且可以进一步建议：

💡 SUGGESTION: Move email sending to a background job using @shared_task decorator.

场景三：硬编码敏感信息

AI 为了图省事，直接把邮箱密码写死了：

SMTP_PASSWORD = "mysecretpassword123"


Quibbler 早就学会了安全规范：

“禁止在代码中硬编码凭证，必须使用环境变量或密钥管理服务。”

所以它会立刻报警：

🔒 SECURITY VIOLATION: Found hardcoded credential in source code. Please move to environment variable SMTP_PASSWORD.

甚至还能自动建议修复方案：

✅ FIX SUGGESTED:

import os
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

七、高级玩法：自定义审查规则，打造专属“AI 教练”

Quibbler 最强的地方，是允许你自定义系统提示词。

编辑这个文件：

~/.quibbler/prompt.md


你可以在这里加入自己的审查哲学。

比如：

你是一个严谨的技术负责人，负责审查 AI 生成的代码。

你的职责包括但不限于：

- 确保代码符合 PEP8 规范
- 检查是否有潜在的安全漏洞（SQL 注入、XSS 等）
- 验证是否编写了足够的单元测试
- 判断是否过度设计或欠设计
- 提醒使用项目已有组件而非重复造轮子

语气要专业但不失友好，避免指责性语言。

最后总是问一句：“还有没有其他地方需要改进？”


你还可以针对特定项目定制规则。

比如在一个金融项目中：

## .additional_rules

- 所有金额计算必须使用 decimal 类型，严禁 float
- 每笔交易必须记录审计日志
- API 必须启用 rate limiting
- 敏感字段（身份证、银行卡）需脱敏显示


这些 .quibbler/rules.md 文件会被自动加载，形成“个性化审查引擎”。

久而久之，Quibbler 就不再是冷冰冰的工具，而是你团队里的“虚拟 CTO”。

八、与其他工具对比：Quibbler 牛在哪里？

市面上类似的 AI 监督工具有不少，比如：

工具
	
功能
	
缺点

Linting Tools
（ESLint、Pylint）
	
检查语法、风格
	
只能静态分析，不懂业务逻辑

GitHub Actions	
自动化测试、CI/CD
	
反馈延迟高，无法干预 AI 决策过程

Custom Scripts	
自定义校验逻辑
	
需手动维护，难以适应变化

Prompt Engineering	
在 prompt 里加约束
	
容易被绕过，效果不稳定

而 Quibbler 的优势在于：

✅ 动态上下文感知：能结合项目历史、用户意图、当前状态综合判断
✅ 主动干预能力：不仅能发现问题，还能直接介入对话流
✅ 持续学习机制：越用越聪明，规则自动沉淀
✅ 跨工具兼容性：MCP + Hook 双模式覆盖主流平台

它不是替代传统工具，而是填补了一个空白：在 AI 自主行动的过程中，建立实时监督闭环。

九、适用人群 & 最佳实践
👨‍💻 谁最适合用 Quibbler？
团队使用 AI 辅助开发，担心代码质量失控
个人开发者想提高 AI 产出可靠性
DevOps 希望减少人为疏忽导致的线上事故
教学场景中用于训练学生识别 AI 幻觉
🛠 最佳实践建议
尽早接入：在项目初期就引入 Quibbler，让它完整见证项目成长
定期回顾 rules.md：人工审核自动学习的规则是否合理
结合 CI/CD：将 Quibbler 审查作为合并请求的前置条件
设置分级反馈：
警告（Warning）→ 可忽略
错误（Error）→ 必须修复
搭配代码评审：Quibbler 负责机械性检查，人类专注架构设计
十、未来展望：AI 时代的“代码纪检制度”

Quibbler 的出现，标志着我们进入了一个新阶段：

AI not only writes code, but must also be accountable for it.

未来的软件工程，很可能演变为“三人协作”模式：

👨‍💻 人类开发者 → 提出需求、把控方向
🤖 AI Coding Agent → 执行编码、提出方案
🕵️ Quibbler 类工具 → 监督过程、确保合规

这不是不信任 AI，而是构建健康的协作关系。

就像自动驾驶汽车需要雷达+摄像头+控制系统协同工作，AI 编程也需要“感知-决策-监督”三位一体。

而 Quibbler，正是那个不可或缺的“监督模块”。

结语：别再让 AI“自由发挥”了

我们曾天真地以为，只要给 AI 足够清晰的指令，它就能写出完美的代码。

现实告诉我们：AI 也会偷懒、会犯错、会自我欺骗。

而 Quibbler 的意义，不只是纠正错误，更是建立起一种信任但验证（Trust but Verify） 的新型人机协作范式。

它让我们明白：

最好的 AI，不是最聪明的那个，而是最诚实、最可靠的那个。

所以，下次当你让 AI“随便搞搞”的时候，不妨问问自己：

“我的代码，有人盯着吗？”

如果没有，赶紧把 Quibbler 请进来吧。

毕竟，不怕 AI 犯错，就怕它犯错还不承认。

📌 项目地址：https://github.com/fulcrumresearch/quibbler[3]
💬 加入社区：Discord 链接[4]
🚀 立即安装：

pip install quibbler
# 或
uv tool install quibbler

参考资料
[1] 

quibbler: https://github.com/fulcrumresearch/quibbler

[2] 

Claude Code: https://www.anthropic.com/news/coding-with-claude

[3] 

https://github.com/fulcrumresearch/quibbler: https://github.com/fulcrumresearch/quibbler

[4] 

Discord 链接: https://discord.gg/QmMybVuwWp

---
*导入时间: 2026-01-17 21:13:03*
