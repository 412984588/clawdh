---
title: "别再往上下文硬塞Token 了！Claude「高级工具三件套」到底有多狠？"
source: wechat
url: https://mp.weixin.qq.com/s/_WuvXKKahitt6V7Df70Rdw
author: 架构资源栈
pub_date: 2025年12月8日 18:40
created: 2026-01-17 20:40
tags: [AI, 编程]
---

# 别再往上下文硬塞Token 了！Claude「高级工具三件套」到底有多狠？

> 作者: 架构资源栈 | 发布日期: 2025年12月8日 18:40
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/_WuvXKKahitt6V7Df70Rdw)

---

大家好，这里是架构资源栈！点击上方关注，添加“星标”，一起学习大厂前沿架构！

关注、发送C1即可获取JetBrains全家桶激活工具和码！

现在大家都在喊“做 Agent”，可一到实战你会发现： 真正落地一个能干活的 Agent，难点往往不在“大模型本身”，而在——怎么优雅地让模型调一大堆工具，还不把上下文撑爆。

IDE 助手要会：Git、文件操作、包管理、测试、部署流水线
运维 Agent 要会：Slack、GitHub、Google Drive、Jira、自家数据库、一堆 MCP server
每个服务背后又是几十个 tool schema，一股脑塞进 prompt，context 直接爆仓

Anthropic 在这篇文章里，给 Claude 搞了一个“高级工具三件套”：

Tool Search Tool：按需发现工具，解决“十万 token 的工具定义压在上下文里”
Programmatic Tool Calling（PTC）：用代码 orchestrate 工具，而不是一口气用自然语言来回对话
Tool Use Examples：用示例教模型“怎么正确用工具”，而不是只给冰冷的 JSON Schema

一句话总结：

❝

从“能调工具”，升级为“会选工具、会编排、还用得对”。

痛点一：工具一多，上下文被定义挤满了

文章开头先抛了一个很典型的 MCP 场景： 接了五个 server 之后，光工具定义就能把你挤到自闭。

GitHub：35 个工具，约 26K tokens
Slack：11 个工具，约 21K tokens
Sentry / Grafana / Splunk 再加一圈
再来个 Jira 单服 17K tokens

加一加，还没聊天，系统 prompt + 工具定义就能干掉十几万 token。

更要命的是：

工具越多，选错工具、参数瞎填 的概率就越高
名字还一个比一个像：notification-send-user vs notification-send-channel，看着就容易眼花

于是第一个功能上线：Tool Search Tool。

Tool Search Tool：给工具库加一个“搜索引擎”

思路其实很朴素：

❝

工具可以很多，但不要一上来全塞给模型。 只给它一个“工具搜索入口”，需要什么再按需加载。

image

传统做法：

所有 MCP 工具定义全部装弹 → 七八万 token 起步
系统 prompt + 对话历史和工具挤同一个 context
真正干活之前，context 已经被消耗一大半

换成 Tool Search Tool 之后：

upfront 只加载一个“工具搜索工具”（约 500 token）
其他工具统一标记 defer_loading: true，需要时通过搜索加载
一般一次任务只会加载 3–5 个相关工具，几千 token 级别

官方给的对比数字大概是：

传统模式：约 77K tokens
新模式：约 8.7K tokens

上下文保命成功，节省 85% 的 token。 在 Anthropic 内部 MCP 评测中，工具使用准确率也明显上升，比如 Opus 4 从 49% ➜ 74%，Opus 4.5 从 79.5% ➜ 88.1%。

实现方式也很简单：工具定义里加个 defer_loading：

{
  "tools": [
    // Include a tool search tool (regex, BM25, or custom)
    {"type": "tool_search_tool_regex_20251119", "name": "tool_search_tool_regex"},

    // Mark tools for on-demand discovery
    {
      "name": "github.createPullRequest",
      "description": "Create a pull request",
      "input_schema": {...},
      "defer_loading": true
    }
    // ... hundreds more deferred tools with defer_loading: true
  ]
}


对于 MCP 服务器，还可以直接“整服延迟加载”，只把常用工具留下来：

{
  "type": "mcp_toolset",
  "mcp_server_name": "google-drive",
  "default_config": {"defer_loading": true}, # defer loading the entire server
  "configs": {
    "search_files": {
      "defer_loading": false
    }  // Keep most used tool loaded
  }
}

痛点二：工具一多，Agent 被中间结果淹没

第二个大坑是传统的“自然语言工具调用”模式：

每调用一次工具，就要走完整的一轮模型推理
工具返回的大量中间结果，全部进上下文
模型还要用“读表”的方式，从这堆结果里自己总结、对比、再决定下一步

举个业务例子：

❝

“找出哪个同事 Q3 差旅超标了？”

你有三类工具：

get_team_members(department) → 拿团队成员列表
get_expenses(user_id, quarter) → 查每个人的费用明细
get_budget_by_level(level) → 根据职级拿预算上限

传统玩法是：

查询成员（20 人）
对这 20 个人一个个查 Q3 报销记录 → 20 次工具调用，每次几十条明细
再查不同 level 对应的预算
上百条记录原封不动进上下文，模型自己算总和、对比预算、筛出超标

结果就是：

token 花在一堆“中间垃圾数据”上
延迟高，每一步都要 model 推理
逻辑全靠模型“自由发挥”，出错概率不低

于是第二个功能登场：Programmatic Tool Calling（PTC）。

Programmatic Tool Calling：工具编排交给代码，不交给“自然语言瞎聊”

PTC 的核心思路可以一句话讲完：

❝

让模型写代码来 orchestrate 工具调用， 工具结果先进代码执行环境，在那儿完成循环、条件、聚合，最后只把对模型有用的“结论”送回上下文。

上面那个预算例子，用 PTC 的话，Claude 写出来的代码大概是这样的：

team = await get_team_members("engineering")

# Fetch budgets for each unique level
levels = list(set(m["level"] for m in team))
budget_results = await asyncio.gather(*[
    get_budget_by_level(level) for level in levels
])

# Create a lookup dictionary: {"junior": budget1, "senior": budget2, ...}
budgets = {level: budget for level, budget in zip(levels, budget_results)}

# Fetch all expenses in parallel
expenses = await asyncio.gather(*[
    get_expenses(m["id"], "Q3") for m in team
])

# Find employees who exceeded their travel budget
exceeded = []
for member, exp in zip(team, expenses):
    budget = budgets[member["level"]]
    total = sum(e["amount"] for e in exp)
    if total > budget["travel_limit"]:
        exceeded.append({
            "name": member["name"],
            "spent": total,
            "limit": budget["travel_limit"]
        })

print(json.dumps(exceeded))


执行过程变成这样：

Claude 通过 code_execution 工具提交这段 Python 代码
代码运行时需要数据时，触发工具调用（例如 get_expenses）
后端把工具结果返回给代码运行环境，而不是 Claude 的上下文
代码继续跑，最后 print 出那两三个超标同事的信息
只有这几条结果 回到 Claude 的上下文中

原来要塞进 context 的 2000+ 条报销记录，现在只剩一小段 JSON， 官方给出的内部数据是：**复杂任务 token 消耗从均值 43,588 降到 27,297，节省约 37%**， GIA 基准上的表现也从 46.5% 提升到 51.2%。

要启用 PTC，需要做两件事：

注册一个 code execution 工具，并声明哪些业务工具可以被代码调用：
{
  "tools": [
    {
      "type": "code_execution_20250825",
      "name": "code_execution"
    },
    {
      "name": "get_team_members",
      "description": "Get all members of a department...",
      "input_schema": {...},
      "allowed_callers": ["code_execution_20250825"] # opt-in to programmatic tool calling
    },
    {
      "name": "get_expenses",
      ...
    },
    {
      "name": "get_budget_by_level",
      ...
    }
  ]
}

Claude 生成的调用长这样（只展示了个结构）：
{
  "type": "server_tool_use",
  "id": "srvtoolu_abc",
  "name": "code_execution",
  "input": {
    "code": "team = get_team_members('engineering')n..." 
  }
}


代码内部对工具的调用，会通过 caller 字段区分是“代码发起的”，而不是用户对话发起的。

适用场景很清晰：

需要并行跑很多工具（比如对 50 个 endpoint 做健康检查）
中间数据量巨大，但只要聚合结果（比如统计、排序、过滤后的小列表）
不希望中间过程影响模型“思考方向”
痛点三：Schema 定义结构没问题，但模型总会“用错参数”

第三个问题就更日常了：

❝

JSON Schema 只能约束“格式对不对”， 但完全没法表达“到底该怎么用这个工具”。

举个典型的工单 API 例子：

{
  "name": "create_ticket",
"input_schema": {
    "properties": {
      "title": {"type": "string"},
      "priority": {"enum": ["low", "medium", "high", "critical"]},
      "labels": {"type": "array", "items": {"type": "string"}},
      "reporter": {
        "type": "object",
        "properties": {
          "id": {"type": "string"},
          "name": {"type": "string"},
          "contact": {
            "type": "object",
            "properties": {
              "email": {"type": "string"},
              "phone": {"type": "string"}
            }
          }
        }
      },
      "due_date": {"type": "string"},
      "escalation": {
        "type": "object",
        "properties": {
          "level": {"type": "integer"},
          "notify_manager": {"type": "boolean"},
          "sla_hours": {"type": "integer"}
        }
      }
    },
    "required": ["title"]
  }
}


从 Schema 上看，一切都很正常。 但模型会犯的错误包括：

due_date 到底要什么格式？2024-11-06？还是时间戳？
reporter.id 是 USR-12345 这种格式，还是裸数字？
什么时候才需要填 reporter.contact？
priority=critical 时，escalation 应该怎么配合？

Schema 感觉“信息已经很全了”， 但对模型来说，依然是高难度猜谜游戏。

Tool Use Examples：用例子教模型“怎么用”

所以第三个能力就是：在工具定义里加 input_examples，用真实的调用示例，告诉模型“正确的姿势长什么样”：

{
  "name": "create_ticket",
"input_schema": { /* same schema as above */ },
"input_examples": [
    {
      "title": "Login page returns 500 error",
      "priority": "critical",
      "labels": ["bug", "authentication", "production"],
      "reporter": {
        "id": "USR-12345",
        "name": "Jane Smith",
        "contact": {
          "email": "jane@acme.com",
          "phone": "+1-555-0123"
        }
      },
      "due_date": "2024-11-06",
      "escalation": {
        "level": 2,
        "notify_manager": true,
        "sla_hours": 4
      }
    },
    {
      "title": "Add dark mode support",
      "labels": ["feature-request", "ui"],
      "reporter": {
        "id": "USR-67890",
        "name": "Alex Chen"
      }
    },
    {
      "title": "Update API documentation"
    }
  ]
}


几条例子，模型就能学到很多“约定俗成”的东西：

日期统一用 YYYY-MM-DD
用户 ID 形如 USR-XXXXX
标签一般用 kebab-case
严重故障会带上 escalation 和紧凑的 SLA
feature 请求可以只填部分字段

Anthropic 内测中，复杂参数处理相关的正确率从 72% 提升到了 90%。 对那种“结构复杂但业务约定很多”的工具，非常有用。

这三件套，什么时候该上？

官方也给了一个实用的“开关指北”：

Tool Search Tool：

工具总数 > 10
工具定义总开销 > 10K tokens
多 MCP server 场景

Programmatic Tool Calling：

多步骤、依赖复杂的工作流
工具返回的数据量巨大，但只需要少量聚合结果
适合并行和重试（幂等）操作

Tool Use Examples：

Schema 结构复杂、嵌套多
可选参数很多，且“填与不填”会改变语义
有明显业务约定（ID 格式、字段组合、命名习惯）

如果你只是搞两个简单查询工具，不一定需要把三件套全开； 但一旦上 MCP、上多系统联动，基本就是“迟早要开的技能树”。

怎么在 Claude 开发平台里用起来？

最后给一眼整体配置示意，启用这个 beta 能力：

client.beta.messages.create(
    betas=["advanced-tool-use-2025-11-20"],
    model="claude-sonnet-4-5-20250929",
    max_tokens=4096,
    tools=[
        {"type": "tool_search_tool_regex_20251119", "name": "tool_search_tool_regex"},
        {"type": "code_execution_20250825", "name": "code_execution"},
        # Your tools with defer_loading, allowed_callers, and input_examples
    ]
)


想深入折腾，可以看官方资料：

Tool Search Tool 文档
Tool Search + 向量检索示例 notebook
Programmatic Tool Calling 文档
PTC 示例 notebook
Tool Use Examples 使用说明
写在最后：从“能调 API”，到“像工程师一样用工具”

这是 Anthropic 团队这几年做 Agent 的一个共识：

❝

真正强大的 Agent，不是“参数多、schema 花哨”， 而是能在工具巨多、数据巨大、约定巨多的情况下， 依然做到：

找到对的工具
用对的参数
在对的地方看结果

Tool Search Tool 解决的是规模问题， Programmatic Tool Calling 解决的是编排与效率问题， Tool Use Examples 解决的是语义与约定问题。

对我们这些要在实际业务里落地 Agent 的开发者来说， 这些设计的重点从来不是“多酷炫”， 而是尽量让 Agent 更像一个靠谱的工程同事——该查文档时查文档，该写脚本时写脚本，该少说废话的时候，就老老实实给结果。

喜欢就奖励一个“👍”和“在看”呗~

image
专属付费版全家桶

如果你只是激活JetBrains全家桶IDE，那这个应该是目前最经济、最实惠的方法了！

专属付费版全家桶除了支持IDE的正常激活外，还支持常用的付费插件和付费主题！

全家桶+付费插件授权

100%保障激活，100%稳定使用，100%售后兜底！

为什么说专属付费版全家桶最经济、最实惠？

因为专属付费版全家桶支持常用付费插件和付费主题。而任意一款或两款付费插件或付费主题，其激活费用就远高于我提供的专属付费版全家桶。

比如，最方便的彩虹括号符Rainbow Brackets，124/年。

Rainbow Brackets

再如，MyBatis最佳辅助框架MyBatisCodeHelperPro的官方版本MyBatisCodeHelperPro (Marketplace Edition)，157/年。

MyBatisCodeHelperPro

还有最牛的Fast Request，集API调试工具 + API管理工具 + API搜索工具一体！157/年。

Fast Request

`专属付费版全家桶`包含上述这些付费插件，但不限于上述这些付费插件！

需要的小伙伴，可以扫码二维码，回复付费，了解优惠详情~

付费获取方式

---
*导入时间: 2026-01-17 20:40:55*
