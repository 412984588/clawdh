---
title: "传统Agent工具已死！看如何编排1000+工具！"
source: wechat
url: https://mp.weixin.qq.com/s?__biz=MzkzNjgwNzMwNQ==&mid=2247487590&idx=1&sn=68ac8d785625967f34d3dbce71d9c48a&chksm=c3272000b174525ed66a8e3692e760d08841c83fbf8e228e19b26e2450214bee7f5e8c2b70a7&mpshare=1&scene=1&srcid=1207JwB7Uq0Y4cHAjasWpdGQ&sharer_shareinfo=e2e4eb6c1895ee7a2d3447422890e703&sharer_shareinfo_first=e2e4eb6c1895ee7a2d3447422890e703
author: CourseAI
pub_date: 2025年12月1日 05:34
created: 2026-01-17 20:43
tags: [AI, 编程]
---

# 传统Agent工具已死！看如何编排1000+工具！

> 作者: CourseAI | 发布日期: 2025年12月1日 05:34
> 原文链接: [点击查看](https://mp.weixin.qq.com/s?__biz=MzkzNjgwNzMwNQ==&mid=2247487590&idx=1&sn=68ac8d785625967f34d3dbce71d9c48a&chksm=c3272000b174525ed66a8e3692e760d08841c83fbf8e228e19b26e2450214bee7f5e8c2b70a7&mpshare=1&scene=1&srcid=1207JwB7Uq0Y4cHAjasWpdGQ&sharer_shareinfo=e2e4eb6c1895ee7a2d3447422890e703&sharer_shareinfo_first=e2e4eb6c1895ee7a2d3447422890e703)

---

Anthropic 全新发布了三个核心模块： 工具搜索工具（Tool Search Tool）、程序化工具调用（Programmatic Tool Calling）和工具使用示例（Tool Use Examples）。

这三个模块对 AI 智能体工具使用逻辑进行了根本性重构，彻底解决了传统工具调用在上下文消耗、执行效率和使用准确性上的三大核心痛点，为构建能够无缝衔接数千种工具的下一代 AI 智能体铺平了道路。

为什么要打造者三大模块呢？ 首先，我们回到 AI 智能体的应用场景本身。想象一下这样的画面：

一个 IDE 助手需要同时整合 Git 操作、文件处理、包管理、测试框架和部署流水线；
一个运营协调工具要实时连接 Slack、GitHub、Google Drive、Jira、公司数据库和数十台 MCP 服务器。
这些场景的核心诉求是让 AI 能够像人类专家一样，灵活调度海量工具完成复杂任务。

但现实情况是，传统工具使用模式早已不堪重负，三大痛点成为制约 AI 智能体发展的天花板。

一、AI 工具使用的三大痛点

行业内的 AI 工具调用普遍采用 "全量加载 + 自然语言调度" 的模式，这种模式在面对复杂场景时暴露出无法调和的矛盾，具体表现为以下三个方面：

上下文窗口被工具定义吞噬，token 成本居高不下

GitHub（35 个工具，约 26K tokens）
Slack（11 个工具，约 21K tokens）
Sentry（5 个工具，约 3K tokens）
Grafana（5 个工具，约 3K tokens）
Splunk（2 个工具，约 2K tokens），仅工具定义就消耗了 55K tokens。 如果再加入 Jira（仅自身就占用 17K tokens）等更多工具，上下文开销会迅速突破 100K tokens。 这意味着模型还没开始处理用户请求，大部分上下文窗口就已经被工具定义占据，留给对话历史和任务执行的空间所剩无几。
AI 模型的上下文窗口是有限的宝贵资源，但传统模式要求在对话开始前就加载所有工具的定义。 以一个包含 5 台服务器的常见配置为例：

中间结果污染上下文，执行效率低下

传统工具调用采用 "一次调用 + 一次推理" 的模式，每个工具调用都需要完整的模型推理过程，且所有中间结果都会被存入上下文。
比如分析一个 10MB 的日志文件时，即使模型只需要错误频率摘要，整个文件内容也会进入上下文；
查询多个表格的客户数据时，每一条记录都会堆积在上下文里。
这种模式带来两个严重问题：
一是：大量无关的中间数据消耗巨额 token 预算，甚至会把关键信息挤出上下文窗口；
二是：多步骤任务需要多次模型推理往返，比如一个包含 5 个工具的工作流就需要 5 次推理，再加上模型手动解析结果、整合信息的过程，不仅速度慢，还容易出错。

仅靠 JSON Schema 无法定义工具使用规范，调用准确率低

JSON Schema 只能定义工具的结构（比如参数类型、必填字段、枚举值等），但无法传递实际使用场景中的关键信息：可选参数什么时候需要填写？哪些参数组合是合理的？API 有哪些隐含的命名规范？
以一个客服工单创建工具为例，JSON Schema 只能告诉模型 "due_date 是字符串类型"，但无法说明日期格式应该用 "2024-11-06" 还是 "Nov 6, 2024"；
只能定义 "reporter.id 是字符串"，但无法明确 ID 是 UUID、"USR-12345" 还是普通数字。
这种歧义直接导致工具选择错误和参数配置不当，比如混淆 "notification-send-user" 和 "notification-send-channel" 这类名称相似的工具，成为传统工具调用最常见的失败原因。

正是这些痛点，让 AI 智能体始终无法突破 "小范围工具调用" 的局限，难以实现大规模、高效率、高精度的工具协同。

接下来，我们看看Anthropic 是如何针对性地解决了这三个核心问题，构建起 "动态发现 - 高效执行 - 精准调用" 的完整工具使用闭环。

二、工具搜索工具（Tool Search Tool）：按需加载，释放 95% 上下文空间
2.1 解决的核心问题
传统工具调用 "全量加载" 导致的上下文膨胀和 token 浪费，以及工具选择准确率低的问题。

2.2 创新思路：从 "全量预加载" 到 "按需动态发现"
工具搜索工具的核心创新在于颠覆了工具定义的加载逻辑 —— 不再在对话开始前加载所有工具定义，而是让大模型根据当前任务需求，通过搜索动态发现并加载相关工具。
这种 "按需加载" 模式既保留了对全量工具库的访问能力，又将工具定义的 token 消耗降到最低，同时通过精准搜索减少工具选择错误。

2.3 关键步骤

工具搜索工具的实现逻辑可以分为三个关键步骤： （1）工具配置：标记延迟加载工具 在 API 中提供所有工具定义，但通过defer_loading: true,标记需要延迟加载的工具，仅将工具搜索工具本身和少数核心高频工具（defer_loading: false）预先加载到上下文。例如：

{
  "tools": [
    // 内置工具搜索工具（支持正则、BM25或自定义搜索）
    {"type": "tool_search_tool_regex_20251119", 
      "name": "tool_search_tool_regex"
    },
    // 延迟加载的工具
    {
      "name": "github.createPullRequest",
      "description": "Create a pull request",
      "input_schema": {...},
      "defer_loading": true
    },
    // 更多延迟加载工具...
  ]
}


对于 MCP 服务器，还支持批量延迟加载整个服务器的工具，同时保留核心工具的即时访问：

{
  "type": "mcp_toolset",
  "mcp_server_name": "google-drive",
  "default_config": {"defer_loading": true}, // 延迟加载整个服务器工具
  "configs": {
    "search_files": {"defer_loading": false} // 保留高频使用的搜索文件工具
  }
}


（2）动态搜索：根据任务匹配工具

LLM 接到用户任务时，会先分析所需的功能，通过工具搜索工具查询相关工具。 搜索基于工具名称和描述进行匹配，支持正则匹配、BM25 算法或自定义搜索策略（如基于嵌入向量的搜索）。

例如，当用户需要与 GitHub 交互时，LLM会搜索 "github" 相关工具，仅加载github.createPullRequest和github.listIssues等相关工具，而不会加载 Slack、Jira 等无关工具的定义。

（3）按需加载：仅加载匹配工具定义

工具搜索工具返回匹配的工具引用后，这些工具的完整定义才会被加载到上下文。此时 LLM 仅获取完成当前任务必需的工具信息，避免无关工具定义占用空间。

2.4 核心优势：token 节省与准确率双提升

（1）极致的 token 节省 传统模式下，50+ MCP 工具的定义需要约 72K tokens，加上系统提示等内容，初始上下文消耗约 77K tokens；

而工具搜索工具模式下，仅需预先加载约 500 tokens 的工具搜索工具，加上按需加载 3-5 个相关工具（约 3K tokens），初始上下文消耗仅 8.7K tokens，直接释放了 95% 的上下文窗口，token 使用率降低 85%。 （2）显著的准确率提升 在处理大型工具库时，工具搜索工具大幅减少了工具选择错误。例如，Opus 4 模型在启用工具搜索工具后，MCP 评估准确率从 49% 提升至 74%，Opus 4.5 更是从 79.5% 提升至 88.1%，彻底解决了名称相似工具的混淆问题。 （3）兼容缓存：不影响 prompt 缓存机制 由于延迟加载的工具完全不参与初始 prompt，核心的系统提示和高频工具定义依然可以被缓存，不会因为动态加载工具而破坏 prompt 缓存的有效性，兼顾了灵活性和性能。

2.5 适用场景

最适合的场景：

工具定义总 token 消耗超过 10K tokens
存在工具选择准确率问题（如相似名称工具混淆）
构建多服务器的 MCP 驱动系统
工具数量超过 10 个的复杂场景

不太适合的场景：

工具库规模小（少于 10 个工具）
所有工具在每个会话中都被频繁使用
工具定义非常简洁（总 token 消耗低）
三、程序化工具调用（Programmatic Tool Calling）：代码编排，告别上下文污染与低效推理
3.1. 解决的核心问题

传统"自然语言调度+逐次推理"模式导致的中间结果上下文污染、多步骤任务 latency 高、执行准确率低的问题。

3.2. 创新点：用代码替代自然语言，实现工具调用的高效编排

程序化工具调用的核心创新在于将工具调度逻辑从自然语言转移到代码层面——不再通过自然语言逐次请求工具，而是编写 Python 代码来编排多个工具的调用、处理中间结果，并仅将最终结果返回给模型。

这种模式带来三大优势：

中间结果在代码执行环境中处理，不进入模型上下文，彻底避免污染；
代码支持循环、条件判断、并行执行等复杂逻辑，实现高效的工作流编排；
减少模型推理往返次数，大幅降低 latency。
3.3. 用代码调用工具的流程

通过"工具配置-代码生成-执行调度-结果返回"的闭环，实现复杂任务的高效处理，具体流程如下：

（1）工具配置：标记支持程序化调用的工具 开发者需要在工具定义中添加代码执行类型，并通过allowed_callers字段指定该工具支持被代码执行环境调用：

{
  "tools": [
    // 内置代码执行工具
    {"type": "code_execution_20250825", "name": "code_execution"},
    // 支持程序化调用的工具
    {
      "name": "get_team_members",
      "description": "获取部门所有成员信息，返回包含ID和级别的列表",
      "input_schema": {...},
      "allowed_callers": ["code_execution_20250825"] // 允许被代码执行工具调用
    },
    {
      "name": "get_expenses",
      "description": "获取用户指定季度的费用明细",
      "input_schema": {...},
      "allowed_callers": ["code_execution_20250825"]
    },
    {
      "name": "get_budget_by_level",
      "description": "获取指定员工级别的预算限额",
      "input_schema": {...},
      "allowed_callers": ["code_execution_20250825"]
    }
  ]
}


API 会自动将这些工具定义转换为 LLM 可在代码中调用的 Python 函数。

（2）代码生成：LLM编写工具编排代码 当接到复杂任务时，LLM 会分析任务需求，生成包含工具调用、数据处理、逻辑判断的 Python 代码。 例如，对于"找出第三季度旅行预算超支的团队成员"这一任务，LLM 会生成如下编排代码：

import asyncio
import json

# 获取工程部门团队成员
team = await get_team_members("engineering")

# 批量获取所有级别对应的预算（并行执行）
levels = list(set(m["level"] for m in team))
budget_results = await asyncio.gather(*[
    get_budget_by_level(level) for level in levels
])
budgets = {level: budget for level, budget in zip(levels, budget_results)}

# 批量获取所有成员的Q3费用（并行执行）
expenses = await asyncio.gather(*[
    get_expenses(m["id"], "Q3") for m in team
])

# 筛选超支成员
exceeded = []
for member, exp in zip(team, expenses):
    budget = budgets[member["level"]]
    total_spent = sum(e["amount"] for e in exp)
    if total_spent > budget["travel_limit"]:
        exceeded.append({
            "name": member["name"],
            "spent": total_spent,
            "limit": budget["travel_limit"],
            "overspend": total_spent - budget["travel_limit"]
        })

# 输出最终结果
print(json.dumps(exceeded, indent=2))


这段代码实现了三大关键逻辑：并行调用工具提高效率、自动计算费用总和、筛选超支成员，所有复杂处理都在代码中完成。

（3）执行调度：代码执行环境处理工具调用 生成的代码会在 LLM 内置的沙箱化代码执行环境中运行。当代码调用工具（如get_expenses）时，API 会收到工具调用请求，其中包含代码执行工具的标识：

{
  "type": "tool_use",
  "id": "toolu_xyz",
  "name": "get_expenses",
  "input": {"user_id": "emp_123", "quarter": "Q3"},
  "caller": {
    "type": "code_execution_20250825",
    "tool_id": "srvtoolu_abc"
  }
}


开发者的系统返回工具执行结果后，结果会直接传递给代码执行环境，由代码进行处理，而不会进入 LLM 的上下文。 这个过程会重复执行，直到代码完成所有工具调用和数据处理。

（4）结果返回：仅将最终结果传入上下文 当代码执行完成后，仅将代码的输出结果（stdout）返回给 LLM 的上下文：

{
  "type": "code_execution_tool_result",
  "tool_use_id": "srvtoolu_abc",
  "content": {
    "stdout": "[\n  {\n    \"name\": \"Alice\",\n    \"spent\": 12500,\n    \"limit\": 10000,\n    \"overspend\": 2500\n  },\n  {\n    \"name\": \"Bob\",\n    \"spent\": 11000,\n    \"limit\": 10000,\n    \"overspend\": 1000\n  }\n]"
  }
}


此时 LLM 仅需处理最终的超支成员列表（约1KB数据），而无需关注2000+条费用明细（约50KB数据），彻底摆脱了中间数据的干扰。

3.4. 核心优势：效率、成本与准确率三重提升

程序化工具调用的价值在实际测试中得到了充分验证，在 token 消耗、 latency 和准确率上都实现了显著优化：

（1）token 消耗大幅降低 在复杂研究任务中，平均 token 使用率从43,588降至27,297，减少了37%。对于数据量更大的场景（如处理十万行Excel表格），token 节省效果更为明显——通过该功能，实现了对数千行表格的读写和修改，而不会导致上下文溢出。

（2）latency 显著降低 传统模式下，20个工具调用需要20次模型推理往返；而程序化工具调用通过代码并行执行，将20个工具调用整合为一次代码执行，仅需1次模型推理往返，消除了19次额外的推理延迟。对于需要大量工具调用的任务，latency 优化效果可达数倍甚至数十倍。

（3）执行准确率提升 通过代码明确表达编排逻辑（循环、条件判断、错误处理），避免了自然语言推理的模糊性。内部测试显示，知识检索任务的准确率从25.6%提升至28.5%，GIA 基准测试准确率从46.5%提升至51.2%，大幅减少了因手动整合数据导致的错误。

3.5. 适用场景与边界

程序化工具调用的优势在复杂任务中尤为突出，但也存在明确的适用边界：

最适合的场景：
处理大型数据集，仅需聚合结果或摘要（如日志分析、报表生成）
多步骤依赖的工作流（3个以上工具调用）
需要对工具结果进行筛选、排序、转换后再使用
中间数据不应影响模型推理（如敏感数据处理）
大规模并行操作（如检查50个端点、批量查询数据）
不太适合的场景：
简单的单次工具调用（如查询天气、翻译文本）
需要模型查看所有中间结果并实时调整策略的任务
快速查询且响应数据量小的场景
四、工具使用示例（Tool Use Examples）：以例为鉴，解决工具调用的"歧义难题"
4.1. 解决的核心问题

仅靠 JSON Schema 无法传递工具使用规范（如格式要求、参数组合、命名 conventions），导致的工具调用格式错误、参数配置不当等问题。

4.2. 创新思路：从"结构定义"到"示例引导"

工具使用示例的核心创新在于，在工具定义中加入实际的使用案例，让 LLM 通过模仿示例学习工具的正确用法，而不仅仅依赖抽象的 schema 结构。这种"示例驱动"的方式能够传递 schema 无法表达的隐性知识，让工具调用更符合实际应用场景的要求。

4.3. 工作原理与执行流程

工具使用示例的实现非常简洁，但效果显著，核心在于通过高质量的示例传递使用规范：

（1）在工具定义中添加示例 开发者在工具的input_examples字段中，提供1-5个覆盖不同场景的完整工具调用示例，包含正确的参数格式、组合方式和命名规范。 例如，对于客服工单创建工具：

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
          "contact": {"type": "object", "properties": {"email": {"type": "string"}, "phone": {"type": "string"}}}
        }
      },
      "due_date": {"type": "string"},
      "escalation": {
        "type": "object",
        "properties": {"level": {"type": "integer"}, "notify_manager": {"type": "boolean"}, "sla_hours": {"type": "integer"}}
      }
    },
    "required": ["title"]
  },
"input_examples": [
    // 紧急bug工单示例（完整参数）
    {
      "title": "Login page returns 500 error",
      "priority": "critical",
      "labels": ["bug", "authentication", "production"],
      "reporter": {
        "id": "USR-12345",
        "name": "Jane Smith",
        "contact": {"email": "jane@acme.com", "phone": "+1-555-0123"}
      },
      "due_date": "2024-11-06",
      "escalation": {"level": 2, "notify_manager": true, "sla_hours": 4}
    },
    // 功能请求工单示例（部分参数）
    {
      "title": "Add dark mode support",
      "labels": ["feature-request", "ui"],
      "reporter": {"id": "USR-67890", "name": "Alex Chen"}
    },
    // 内部任务工单示例（最小参数）
    {
      "title": "Update API documentation"
    }
  ]
}


（2）从示例中学习使用规范 LLM会分析示例中的模式，自动提炼出工具使用的关键规范：

格式规范：due_date使用"YYYY-MM-DD"格式，reporter.id遵循"USR-XXXXX"命名规则，labels使用小写短横线命名（kebab-case）；
参数组合：紧急优先级（critical）的工单需要填写完整的联系人信息和升级策略（escalation），功能请求仅需基本信息，内部任务可仅填标题；
嵌套结构：当工单优先级较高时，需要填充reporter.contact嵌套对象，普通工单可省略。

（3）按照示例规范调用工具 在实际调用工具时，LLM会遵循示例中习得的规范，生成符合要求的工具调用请求。例如，当用户报告"支付接口频繁超时"时，LLM 会自动生成如下符合规范的调用：

{
  "name": "create_ticket",
"input": {
    "title": "Payment interface frequently times out",
    "priority": "critical",
    "labels": ["bug", "payment", "production"],
    "reporter": {
      "id": "USR-54321",
      "name": "Mike Wilson",
      "contact": {"email": "mike@acme.com", "phone": "+1-555-4567"}
    },
    "due_date": "2024-11-07",
    "escalation": {"level": 2, "notify_manager": true, "sla_hours": 4}
  }
}

4.4. 核心优势：调用准确率大幅提升

工具使用示例能显著降低因规范不明确导致的调用错误，复杂参数处理的准确率从72%提升至90%。其优势主要体现在三个方面：

（1）消除格式歧义 通过示例明确日期、ID、嵌套对象等的格式要求，避免因格式错误导致工具调用失败。

（2）明确参数组合逻辑 展示不同场景下的参数选择策略，让 LLM 知道在什么情况下需要填写可选参数，哪些参数组合是合理的。

（3）传递隐性规范 传递 API 的 domain-specific 规范（如标签命名、优先级与 SLA 小时数的对应关系），这些规范无法通过 schema 定义，只能通过示例传递。

4.55. 适用场景与边界

工具使用示例的价值取决于工具的复杂度和规范的隐性程度：

最适合的场景：
具有复杂嵌套结构的工具（如包含多层对象参数）
可选参数多且有明确使用场景的工具
存在 domain-specific 规范的 API（如内部系统工具）
名称相似、容易混淆的工具（如create_ticket vs create_incident）
不太适合的场景：
简单单参数工具（如get_current_time）
参数格式为标准类型（如 URL、邮箱）的工具（LLM 已具备相关知识）
规范可完全通过 JSON Schema 约束的工具（如必填字段、枚举值）
五、三大功能协同方式

Anthropic 推出的三大工具使用功能并非孤立存在，而是相互补充、协同工作的整体。在实际开发中，通过合理组合这三大功能，可以最大化 AI 智能体的工具使用能力。

5.1. 分层部署：先解决核心瓶颈

每个 AI 智能体的核心痛点不同，无需一开始就启用所有功能，应优先解决最突出的瓶颈：

如果工具定义占用大量 token → 先启用工具搜索工具
如果中间结果污染上下文、多步骤任务 latency 高 → 先启用程序化工具调用
如果工具调用参数错误频繁 → 先启用工具使用示例

例如，一个连接10+ MCP 服务器的运营协调工具

首先面临的是工具定义的 token 爆炸问题，应优先启用工具搜索工具；
当工具调用流程稳定后，再针对多步骤数据整合场景启用程序化工具调用；
最后针对内部 API 的特殊规范添加工具使用示例，进一步提升准确率。
5.2. 优化配置：提升功能效果

（1）工具搜索工具优化

编写清晰的工具名称和描述：名称应包含核心功能（如search_customer_orders而非query_db_orders），描述应明确工具的用途和返回结果，提高搜索匹配准确率；
在系统提示中明确工具范围：告诉 LLM 可用的工具类别（如"你可以使用 Slack 消息、Google Drive 文件管理、Jira 工单跟踪和 GitHub 仓库操作工具，通过工具搜索查找具体功能"），引导 LLM 高效搜索；
保留3-5个高频工具：将最常用的工具设置为defer_loading: false，平衡即时访问和上下文节省。

（2）程序化工具调用优化

清晰文档化工具返回格式：在工具描述中明确返回数据的结构（如字段名称、类型、取值范围），帮助 LLM 编写正确的解析代码；
优先对并行化工具启用：对于可独立执行的工具（如批量查询多个用户数据），充分利用asyncio.gather实现并行执行，最大化效率提升；
标记幂等工具：对于支持重试的幂等工具（如get_expenses），在代码中添加错误处理和重试逻辑，提高鲁棒性。

（3）工具使用示例优化

示例数据要真实：使用真实的业务数据（如实际的用户名、部门名称、预算金额），避免使用"string"、"value"等占位符，让 LLM 学习到真实的使用模式；
覆盖关键场景：每个工具提供1-5个示例，涵盖最小参数、部分参数、完整参数三种场景，确保 LLM 能应对不同情况；
聚焦歧义点：仅在 schema 无法表达的规范处添加示例，避免示例冗余导致 token 浪费。
5.3. 实际案例：用LLM 处理 Excel
工具搜索工具：Excel 相关工具包含表格读取、修改、公式计算等数十个功能，通过工具搜索工具实现按需加载，避免工具定义占用过多上下文；
程序化工具调用：处理数千行表格数据时，通过 Python 代码批量读取数据、执行计算、筛选结果，仅将最终报表返回给 LLM，避免原始数据污染上下文；
工具使用示例：针对 Excel 公式参数、单元格范围格式等特殊规范，添加示例引导 LLM 正确调用工具，提高公式计算和数据修改的准确率。

通过三大功能的协同，可以实现对大型表格的高效处理，而不会出现上下文溢出或调用错误，充分验证了这套工具使用方案的有效性。

六、一个调用的示例

通过在 API 请求中添加 Beta 头部和相关工具定义，即可启用三大功能：

import anthropic

client = anthropic.Anthropic()

response = client.beta.messages.create(
    betas=["advanced-tool-use-2025-11-20"],  # 启用高级工具使用 Beta 功能
    model="LLM-sonnet-4-5-20250929",
    max_tokens=4096,
    system="你可以使用 Slack 消息、Google Drive 文件管理、Jira 工单跟踪和 GitHub 仓库操作工具，通过工具搜索查找具体功能。",
    messages=[{"role": "user", "content": "找出第三季度旅行预算超支的工程部门员工，并创建 Jira 工单跟踪处理。"}],
    tools=[
        # 工具搜索工具
        {"type": "tool_search_tool_regex_20251119", "name": "tool_search_tool_regex"},
        # 代码执行工具
        {"type": "code_execution_20250825", "name": "code_execution"},
        # 业务工具：部门成员查询
        {
            "name": "get_team_members",
            "description": "获取指定部门的所有成员信息，返回包含id、name、level的列表",
            "input_schema": {
                "type": "object",
                "properties": {"department": {"type": "string"}},
                "required": ["department"]
            },
            "allowed_callers": ["code_execution_20250825"],  # 支持程序化调用
            "defer_loading": true  # 延迟加载，通过工具搜索发现
        },
        # 业务工具：费用查询
        {
            "name": "get_expenses",
            "description": "获取用户指定季度的费用明细，返回包含amount、type、date的列表",
            "input_schema": {
                "type": "object",
                "properties": {
                    "user_id": {"type": "string"},
                    "quarter": {"type": "string", "enum": ["Q1", "Q2", "Q3", "Q4"]}
                },
                "required": ["user_id", "quarter"]
            },
            "allowed_callers": ["code_execution_20250825"],
            "defer_loading": true
        },
        # 业务工具：预算查询
        {
            "name": "get_budget_by_level",
            "description": "获取指定员工级别的预算限额，返回包含travel_limit的对象",
            "input_schema": {
                "type": "object",
                "properties": {"level": {"type": "string"}},
                "required": ["level"]
            },
            "allowed_callers": ["code_execution_20250825"],
            "defer_loading": true
        },
        # 业务工具：创建Jira工单（带使用示例）
        {
            "name": "create_jira_ticket",
            "description": "创建Jira工单，用于跟踪问题或任务",
            "input_schema": {
                "type": "object",
                "properties": {
                    "summary": {"type": "string"},
                    "description": {"type": "string"},
                    "priority": {"type": "string", "enum": ["Low", "Medium", "High", "Critical"]},
                    "assignee": {"type": "string"},
                    "labels": {"type": "array", "items": {"type": "string"}}
                },
                "required": ["summary"]
            },
            "input_examples": [
                {
                    "summary": "Q3旅行预算超支处理 - Alice",
                    "description": "员工Alice（ID: USR-12345）Q3旅行费用12500元，超出预算2500元，请财务部门跟进。",
                    "priority": "Medium",
                    "assignee": "finance-lead",
                    "labels": ["budget", "travel", "Q3"]
                }
            ],
            "allowed_callers": ["code_execution_20250825"],
            "defer_loading": true
        }
    ]
)

print(response.content)


https://www.anthropic.com/engineering/advanced-tool-use

---
*导入时间: 2026-01-17 20:43:09*
