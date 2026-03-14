---
title: "Token 消耗降低 85%！Claude 发布 Tool Search 与可编程调用功能"
source: wechat
url: https://mp.weixin.qq.com/s?__biz=MzYzMjI0NDcwMg==&mid=2247483688&idx=1&sn=eff88866ec3d725db10043a14260e377&chksm=f105d1acca3b499fc7966deabcf8d7b972273b902fa840a0da8b68b8ae24ae89bfe14b1691de&mpshare=1&scene=1&srcid=1130Je8TTAFxdqobPkeDIkZM&sharer_shareinfo=ac1246e958b2b9fab7bacd8c0a497d61&sharer_shareinfo_first=ac1246e958b2b9fab7bacd8c0a497d61
author: AI-Xia一站
pub_date: 2025年11月29日 07:00
created: 2026-01-17 20:48
tags: [AI, 编程]
---

# Token 消耗降低 85%！Claude 发布 Tool Search 与可编程调用功能

> 作者: AI-Xia一站 | 发布日期: 2025年11月29日 07:00
> 原文链接: [点击查看](https://mp.weixin.qq.com/s?__biz=MzYzMjI0NDcwMg==&mid=2247483688&idx=1&sn=eff88866ec3d725db10043a14260e377&chksm=f105d1acca3b499fc7966deabcf8d7b972273b902fa840a0da8b68b8ae24ae89bfe14b1691de&mpshare=1&scene=1&srcid=1130Je8TTAFxdqobPkeDIkZM&sharer_shareinfo=ac1246e958b2b9fab7bacd8c0a497d61&sharer_shareinfo_first=ac1246e958b2b9fab7bacd8c0a497d61)

---

引言

当AI代理从"单一工具调用者"向"多工具协同操作者"进化时，工具使用的效率、准确性与可扩展性成为开发者的核心痛点。近日，Claude Developer Platform推出工具搜索工具（Tool Search Tool）、可编程工具调用（Programmatic Tool Calling）与工具使用示例（Tool Use Examples）三大测试版功能，精准破解传统工具使用中的资源浪费、流程臃肿与调用失准等难题，为构建高效AI代理提供关键支撑。本文将深度拆解此次更新的核心目标与三大功能的原理实现细节。

背景：打破 Agent 扩展的“天花板”

此次更新的核心目的，是为了解决构建大规模、生产级 Agent 时面临的三个“不可能三角”问题：

上下文膨胀（Context Bloat）：当 Agent 需要连接 GitHub、Slack、Jira 等多个平台时，仅加载这些平台的 API 定义（Schema）就可能消耗数万 Token。

数据：仅 58 个常用工具的定义就会消耗约 55k Token。这不仅昂贵，而且挤占了真正的对话空间，导致“还没开始聊，显存已占满”。

推理效率低下与上下文污染：传统的工具调用是“一来一回”的。模型请求工具 -> 运行工具 -> 结果回传模型 -> 模型再思考。 这种模式下，中间过程产生的海量数据（如 10MB 的日志文件或数千条数据库记录）会直接灌入上下文，不仅浪费 Token，还会因为无关信息过多干扰模型判断。此外，串行调用导致延迟极高。

模式定义的模糊性：JSON Schema 只能定义“结构合法性”，无法定义“业务正确性”。例如，日期格式是用 2025-11-29 还是 Nov 29？ID 是纯数字还是 UUID？这种歧义导致模型经常调用失败。

为了解决这些问题，Anthropic 给出了以下三个解决方案。

1. Tool Search Tool（工具搜索工具）

实际原理

“按需加载，而非全量加载。”

传统的 Agent 会在系统提示词中一次性加载所有工具定义。而 Tool Search Tool 的核心思想是让 Claude 拥有“查找工具”的能力。

你仍然向 API 提供所有工具定义，但将大部分工具标记为“延迟加载”。
初始状态下，Claude 只看得到一个“搜索工具”和极少数核心工具。
当 Claude 发现当前任务无法用现有工具解决时（例如需要操作 GitHub），它会主动搜索“github”，系统再动态地将 GitHub 相关的工具定义加载到上下文中。



效果： 在测试中，这种方法将 Token 消耗从 77k 降低到了 8.7k，减少了约 85% 的开销，同时保持了访问数千个工具的能力。

实现方式

在定义工具列表时，利用 defer_loading 参数：

{
  "tools": [
    // 1. 必须包含一个搜索工具 (官方提供正则或BM25实现)
    {
      "type": "tool_search_tool_regex_20251119", 
      "name": "tool_search_tool_regex"
    },
    // 2. 将非核心工具标记为延迟加载
    {
      "name": "github.createPullRequest",
      "description": "Create a pull request",
      "input_schema": {...},
      "defer_loading": true  // 关键参数：初始时不加载
    },
    // ... 其他数百个工具
    {
       "name": "search_files",
       "defer_loading": false // 常用工具保持常驻
    }
  ]
}



该功能的适配场景具有明确边界：

当工具库规模≥10个

工具定义总token≥10K

构建具有多服务器的MCP驱动系统

遇到工具选择准确性问题

启用工具搜索工具往往能带来显著的收益。因为它可以有效减少上下文窗口的占用，提高工具选择的准确性，从而提升整个系统的性能。然而，当工具库较小（小于 10 个工具）、所有工具在每个会话中都频繁使用，或者工具定义本身较为紧凑时，使用工具搜索工具可能并不会带来明显的优势，反而可能因为增加了搜索步骤而导致额外的延迟 。

2. Programmatic Tool Calling（可编程工具调用）
实际原理

“用代码编排逻辑，而非用自然语言堆砌。”

这是本次更新中最具颠覆性的功能。传统的工具调用依赖模型进行多轮自然语言推理，而 Programmatic Tool Calling 允许 Claude 编写 Python 代码来编排工具调用。

并行执行：
 Claude 可以写一段代码，同时并发查询 20 个 API，而不是进行 20 轮对话。
沙箱运行：
 代码在隔离的沙箱（Code Execution Environment）中运行。
上下文净化：
 最关键的是，中间结果不进入上下文。例如，代码拉取了 2000 条消费记录并计算总和，只有最后的“总和数字”会传回给 Claude，那 2000 条原始数据在代码执行完后即被丢弃。

效果： 复杂任务的 Token 消耗减少 37%，延迟大幅降低，且由于逻辑由代码控制（循环、条件判断），准确率显著提升。

实现方式

以“Q3旅行预算超标核查”为例，生成的代码逻辑如下：

# 1. 获取团队列表
teams = call_tool("hr.get_teams", department="all")
over_budget_list = []
# 2. 循环查询并分析各团队消费
for team in teams:
    members = call_tool("hr.get_team_members", team_id=team["id"])
    for member in members:
        # 3. 查询成员Q3旅行消费
        expenses = call_tool("finance.get_travel_expenses", 
                           user_id=member["id"], 
                           start_date="2024-07-01", 
                           end_date="2024-09-30")
        # 4. 计算预算占比并筛选超标人员
        budget = call_tool("finance.get_travel_budget", user_id=member["id"])
        if sum(exp["amount"] for exp in expenses) > budget["amount"]:
            over_budget_list.append({
                "team": team["name"],
                "member": member["name"],
                "expense": sum(exp["amount"] for exp in expenses),
                "budget": budget["amount"]
            })
# 仅返回最终超标名单
print(over_budget_list)

该代码仅返回最终超标名单，上下文数据量较传统模式减少95%。

实现可编程工具调用需完成两步核心配置：第一步是工具授权配置，在需通过代码调用的工具定义中添加code_execution字段，指定允许的调用者为沙箱服务，示例：

{
  "name": "jira.get_ticket",
  "code_execution": {
    "allowed_callers": ["code_sandbox"],
    "return_format": "json"
  }
}

第二步是沙箱环境配置，在平台控制台开启“代码执行权限”，指定支持的Python版本（建议3.9+）、可用库（如pandas用于数据处理）及资源限制（如内存≤2GB、执行时长≤60秒）。

执行流程可分为四步：

开发者在系统提示中声明支持代码调用能力；

Claude生成包含工具调用逻辑的Python代码；

代码提交至沙箱执行，工具调用请求经API转发至用户系统；

沙箱返回代码执行结果（仅最终输出），Claude基于结果生成响应。

该功能在三类场景中价值最高：一是大型数据集处理（如日志分析、报表生成），需对工具返回的海量数据进行过滤汇总；二是多步骤依赖流程（如"代码提交→测试执行→部署上线"），需明确工具调用顺序与条件判断；三是批量操作场景（如批量查询Jira工单、批量发送通知），可通过循环语句高效完成。对于单步工具调用、无需数据处理的简单场景，传统调用方式更简洁高效。

3. Tool Use Examples（工具使用示例）
实际原理

“Show, Don't Just Tell.”

仅靠 Schema 定义类型（String, Integer）往往是不够的。Tool Use Examples 允许开发者在工具定义中直接嵌入“正确的使用案例”。这就像给 LLM 提供了 Few-Shot（少样本）学习材料。

通过示例，模型可以学习到：

格式惯例：
 日期是 YYYY-MM-DD。
参数组合：
 当优先级为 critical 时，必须填写 contact_info。
隐性知识：
 ID 需要加前缀 USR-。

效果： 在复杂参数处理的测试中，准确率从 72% 提升至 90%。

实现方式

在工具定义的 input_schema 同级，添加 input_examples 字段：

{
  "name": "create_ticket",
  "input_schema": { ... },
  "input_examples": [ // 直接展示最佳实践
    {
      "title": "Login page returns 500 error",
      "priority": "critical",
      "labels": ["bug", "production"],
      "reporter": {
        "id": "USR-12345", // 模型学会了 ID 格式
        "contact": { "email": "jane@acme.com" }
      }
    }
  ]
}



4. 最佳实践与使用建议

（一）分层使用功能

在利用 Claude Developer Platform 的新功能构建 AI 代理时，并非所有任务都需要同时启用这三个功能，明智的做法是根据实际面临的瓶颈问题，有针对性地选择先使用哪个功能，然后再根据具体需求叠加其他功能，从而有效提升代理的性能 。

核心建议1：优先解决资源占用问题  如果发现工具定义占用大量上下文空间，导致关键信息处理受影响，首先启用工具搜索工具。通过按需加载工具定义，可将初始上下文占用降至传统模式的10%以下，确保任务处理和对话交互的空间需求。

核心建议2：复杂流程用编程式调用  处理大型数据集或多步骤流程时，中间结果易造成上下文污染，此时可编程工具调用是关键。通过代码编排工具使用，可精准控制中间结果处理，仅返回核心结论，上下文数据量可减少95%以上。

核心建议3：调用失准加示例引导  若频繁出现参数错误或调用失败，工具使用示例功能可显著提升准确率。通过真实场景示例传递隐性规则，复杂工具调用准确率可从72%提升至90%。

（二）设置工具搜索工具

技巧1：精准定义工具元数据  模糊的工具名称和描述会降低搜索准确性，建议采用“功能+场景”的命名规则。

技巧2：添加精准系统提示  在系统提示中明确工具范围和搜索方式，引导Claude高效检索。

You have access to tools for Slack messaging, Google Drive file management, Jira ticket tracking, and GitHub repository operations. Use the tool search to find specific capabilities when needed.

技巧3：合理配置加载策略  保持3-5个高频工具常驻加载，其余工具通过“defer_loading: true”设置按需加载，平衡访问效率和上下文占用。

（三）设置编程式工具调用

关键要点1：清晰文档返回格式  Claude需根据返回结果编写解析代码，因此需明确结构、类型和含义，示例（以get_orders工具为例）：

返回结果为订单对象列表，每个对象包含： - id (str)：订单唯一标识 - total (float)：订单金额（美元） - status (str)：状态（pending/shipped/delivered） - items (list)：商品列表，含sku、quantity、price字段 - created_at (str)：创建时间（ISO 8601格式）




关键要点2：选择适配工具类型  优先对并行执行工具（如多订单查询）和幂等性重试操作使用编程式调用，可显著提升处理效率。

（四）设置编程式工具调用

规范1：采用真实场景数据  避免使用“string”等占位符，示例数据需贴合业务实际，如酒店预订工具示例：

{
  "hotel_name": "北京国贸大酒店",
  "check_in": "2024-12-01",
  "check_out": "2024-12-03",
  "guests": 2,
  "room_type": "豪华大床房"
}

规范2：覆盖核心使用模式  每个工具提供2-3个示例，覆盖“最小参数”“完整参数”“特殊场景”，如文件上传工具需包含基础上传和带权限设置的上传示例。

规范3：聚焦隐性规则痛点  示例数量控制在1-5个，重点解决JSON Schema无法覆盖的模糊点（如参数格式、条件关联），避免冗余。

总结

Claude 的这次更新，实际上是在告诉开发者：构建 Agent 不应再单纯依赖模型的“聪明程度”，而应依赖合理的架构设计。

用 Tool Search 解决规模化问题；
用 Programmatic Calling 解决效率与逻辑精度问题；
用 Examples 解决调用准确性问题。

当这三者结合，我们离真正能够处理复杂现实任务的 AI Agent 又近了一大步。

欢迎在评论区分享你的使用场景，一起探索AI工具协同的更多可能！

#Claude #工具调用 #Agent

---
*导入时间: 2026-01-17 20:48:33*
