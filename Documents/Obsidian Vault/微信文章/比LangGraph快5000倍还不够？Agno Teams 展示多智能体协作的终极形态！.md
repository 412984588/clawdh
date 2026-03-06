---
title: "比LangGraph快5000倍还不够？Agno Teams 展示多智能体协作的终极形态！"
source: wechat
url: https://mp.weixin.qq.com/s?__biz=MzIzNTcxOTU3OA==&mid=2247487555&idx=1&sn=eb24aad8135aae1366dd0962fef4585e&chksm=e90fed6e06a37d4a36130232161135241af6a06f7d5a160f04f34a9b0c779ea00e638a48567f&mpshare=1&scene=1&srcid=1209kZ4wvEWM1g6QNz8Je30b&sharer_shareinfo=81fdf354526f1f5fb7195b46fa3e31d1&sharer_shareinfo_first=81fdf354526f1f5fb7195b46fa3e31d1
author: AI 博物院
pub_date: 2025年11月18日 19:42
created: 2026-01-17 20:41
tags: [AI]
---

# 比LangGraph快5000倍还不够？Agno Teams 展示多智能体协作的终极形态！

> 作者: AI 博物院 | 发布日期: 2025年11月18日 19:42
> 原文链接: [点击查看](https://mp.weixin.qq.com/s?__biz=MzIzNTcxOTU3OA==&mid=2247487555&idx=1&sn=eb24aad8135aae1366dd0962fef4585e&chksm=e90fed6e06a37d4a36130232161135241af6a06f7d5a160f04f34a9b0c779ea00e638a48567f&mpshare=1&scene=1&srcid=1209kZ4wvEWM1g6QNz8Je30b&sharer_shareinfo=81fdf354526f1f5fb7195b46fa3e31d1&sharer_shareinfo_first=81fdf354526f1f5fb7195b46fa3e31d1)

---

本文针对于Teams概念进行深入研究。

概述

一个 Team（团队） 是由多个智能体（或其他子团队）组成的集合，它们协作完成任务。

下面是一个简单示例：

from agno.team import Team
from agno.agent import Agent

team = Team(members=[
    Agent(name="智能体 1", role="你用英文回答问题"),
    Agent(name="智能体 2", role="你用中文回答问题"),
    Team(name="团队 1", members=[Agent(name="智能体 3", role="你用法语回答问题")], role="你协调团队成员用法语回答问题"),
])


团队的领导者会根据成员的角色与任务性质，将任务分配给相应的成员。

与智能体类似，团队也支持以下特性：

模型（Model）：可设置用于团队领导者（team leader）的模型，用来决定如何将任务分配给团队成员。
指令（Instructions）：可以对团队领导者下达指令，指导其如何解决问题。 团队成员的名称、描述和角色会自动提供给团队领导者。
工具（Tools）：如果团队领导者需要直接使用工具，可以为团队添加工具。
推理（Reasoning）：允许团队领导者在作出回应或分配任务前进行“思考”，并在收到成员结果后进行“分析”。
知识（Knowledge）：如果团队需要检索信息，可以为团队添加知识库。知识库由团队领导者访问。
存储（Storage）：团队的会话历史和状态会保存在数据库中，使团队可以从上次中断处继续对话，支持多轮、长期的交互。
记忆（Memory）：赋予团队记忆能力，让其能够存储并回忆先前交互中的信息，从而学习用户偏好并个性化响应。
构建团队（Building Teams）

要构建一个高效的团队，应从简单开始 —— 只包含模型（model）、成员（members）和指令（instructions）。 当基本功能正常后，再根据需要逐步增加复杂性。

以下是一个最简单的带有专职智能体的团队示例：

# 文件名：news_weather_team.py
from agno.team import Team
from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.tools.duckduckgo import DuckDuckGoTools

# 创建专职智能体
news_agent = Agent(
    id="news-agent",
    name="新闻智能体", 
    role="获取最新新闻并提供摘要",
    tools=[DuckDuckGoTools()]
)

weather_agent = Agent(
    id="weather-agent",
    name="天气智能体", 
    role="获取天气信息和预报",
    tools=[DuckDuckGoTools()]
)

# 创建团队
team = Team(
    name="新闻与天气团队",
    members=[news_agent, weather_agent],
    model=OpenAIChat(id="gpt-4o"),
    instructions="与团队成员协作，为用户提供全面的信息。根据用户请求分配任务。"
)

team.print_response("东京的最新新闻和天气怎么样？", stream=True)


提示（Tip）建议为每个团队成员明确指定 id、name 和 role 字段，以便团队领导者更好地识别成员。 其中，id 用于在团队内部以及领导者上下文中标识该成员。

注意（Note）当团队成员未指定模型时，会从其父团队继承模型。 如果成员显式指定了模型，则保留自身模型。 在嵌套团队中，成员从其直接父级团队继承模型。 若团队未指定模型，则默认使用 OpenAI 的 gpt-4o。

该继承规则适用于以下字段：model、reasoning_model、parser_model、output_model。

运行团队（Run your Team）

运行团队时，可以使用 Team.print_response() 方法在终端中打印响应：

team.print_response("东京的最新新闻和天气怎么样？")


此方法仅适用于开发阶段，不推荐在生产环境中使用。 在生产环境中，请使用 Team.run() 或异步版本 Team.arun()。例如：

from typing import Iterator
from agno.team import Team
from agno.agent import Agent
from agno.run.team import TeamRunOutputEvent
from agno.models.openai import OpenAIChat
from agno.utils.pprint import pprint_run_response

news_agent = Agent(name="新闻智能体", role="获取最新新闻")
weather_agent = Agent(name="天气智能体", role="获取未来7天的天气")

team = Team(
    name="新闻与天气团队", 
    members=[news_agent, weather_agent],
    model=OpenAIChat(id="gpt-4o")
)

# 运行团队并返回响应变量
response = team.run("东京的天气怎么样？")
# 打印响应内容
print(response.content)

################ 流式响应（STREAM RESPONSE） #################
stream: Iterator[TeamRunOutputEvent] = team.run("东京的天气怎么样？", stream=True)
for chunk in stream:
    if chunk.event == "TeamRunContent":
        print(chunk.content)

################ 流式响应 + 美化打印（STREAM AND PRETTY PRINT） #################
stream: Iterator[TeamRunOutputEvent] = team.run("东京的天气怎么样？", stream=True)
pprint_run_response(stream, markdown=True)

修改终端显示内容

使用 print_response 方法时，默认只打印团队中涉及工具调用的部分（通常是任务分配信息）。 如果希望同时打印各个成员（智能体）的响应内容，可以设置参数 show_members_responses=True：

team.print_response("东京的天气怎么样？", show_members_responses=True)

运行团队（Running Teams）

可以通过调用 Team.run() 或 Team.arun() 来运行团队。其工作流程如下：

团队领导者构建要发送给模型的上下文（包括系统消息、用户消息、对话历史、用户记忆、会话状态及其他相关输入）。
团队领导者将该上下文发送给模型。
模型处理输入，并决定是使用 delegate_task_to_members 工具将任务委派给团队成员、调用其他工具，还是直接生成响应。
如果发生了任务委派，团队成员会执行各自的任务，并将结果返回给团队领导者。
团队领导者处理更新后的上下文，并生成最终响应。
团队将该最终响应返回给调用方。
基本执行（Basic Execution）

Team.run() 函数运行团队并返回输出结果 —— 可以是一个 TeamRunOutput 对象， 也可以在启用 stream=True 时，返回一个由 TeamRunOutputEvent（以及成员智能体的 RunOutputEvent）组成的流。

示例如下：

from agno.team import Team
from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.utils.pprint import pprint_run_response

news_agent = Agent(
    name="新闻智能体",
    model=OpenAIChat(id="gpt-4o"),
    role="获取最新新闻",
    tools=[DuckDuckGoTools()]
)
weather_agent = Agent(
    name="天气智能体",
    model=OpenAIChat(id="gpt-4o"),
    role="获取未来7天的天气",
    tools=[DuckDuckGoTools()]
)

team = Team(
    name="新闻与天气团队",
    members=[news_agent, weather_agent],
    model=OpenAIChat(id="gpt-4o")
)

# 运行团队并返回响应
response = team.run(input="东京的天气怎么样？")
# 以 Markdown 格式打印响应
pprint_run_response(response, markdown=True)


提示：你也可以使用 Team.arun() 异步运行团队。 当团队领导者在一次请求中将任务委派给多个成员时，成员会并发执行任务。

运行输出（Run Output）

当未启用流式（stream）模式时，Team.run() 函数会返回一个 TeamRunOutput 对象。 该对象的核心属性包括：

run_id：本次运行的唯一 ID。
team_id：团队 ID。
team_name：团队名称。
session_id：会话 ID。
user_id：用户 ID。
content：最终响应内容。
content_type：内容类型（若为结构化输出，则为对应 Pydantic 模型的类名）。
reasoning_content：推理内容。
messages：发送给模型的消息列表。
metrics：本次运行的指标。
model：本次运行所使用的模型。
member_responses：团队成员的响应列表（若 store_member_responses=True 时可用）。

注意：未指定模型的团队成员会继承其父团队的模型。 这适用于：model、reasoning_model、parser_model、output_model。

流式运行（Streaming）

设置 stream=True 可启用流式模式。此时，run() 将返回一个 TeamRunOutputEvent 对象的迭代器，而非单一响应。

from typing import Iterator
from agno.team import Team
from agno.agent import Agent
from agno.models.openai import OpenAIChat

news_agent = Agent(name="新闻智能体", role="获取最新新闻")
weather_agent = Agent(name="天气智能体", role="获取未来7天的天气")

team = Team(
    name="新闻与天气团队",
    members=[news_agent, weather_agent],
    model=OpenAIChat(id="gpt-4o")
)

# 以流式方式运行团队
stream: Iterator[TeamRunOutputEvent] = team.run("东京的天气怎么样？", stream=True)
for chunk in stream:
    if chunk.event == "TeamRunContent":
        print(chunk.content)


提示：当使用 arun() 异步运行团队时，如果团队领导者将任务分派给多个成员，这些成员会并发执行。 这意味着事件会并行产生，事件顺序不一定有序。

流式所有事件（Streaming All Events）

默认情况下，流式输出仅包含 RunContent 类型事件。 若要流式传输团队内部所有事件，可设置 stream_events=True：

# 启用全部事件流式输出
response_stream = team.run(
    "东京的天气怎么样？",
    stream=True,
    stream_events=True
)


这将实时输出团队的内部进程，如工具调用（tool call）或推理步骤（reasoning）。

处理事件（Handling Events）

你可以通过迭代响应流，逐个处理到达的事件：

response_stream = team.run("你的提示词", stream=True, stream_events=True)

for event in response_stream:
    if event.event == "TeamRunContent":
        print(f"内容: {event.content}")
    elif event.event == "TeamToolCallStarted":
        print(f"开始调用工具: {event.tool}")
    elif event.event == "ToolCallStarted":
        print(f"成员开始调用工具: {event.tool}")
    elif event.event == "ToolCallCompleted":
        print(f"成员完成调用工具: {event.tool}")
    elif event.event == "TeamReasoningStep":
        print(f"推理步骤: {event.content}")
    ...


注意：团队成员事件会在团队执行期间产生。 若不希望接收这些事件，可设置 stream_member_events=False。

存储事件（Storing Events）

你可以在 RunOutput 对象中保存运行期间产生的所有事件。

from agno.team import Team
from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.utils.pprint import pprint_run_response

team = Team(
    name="故事团队",
    members=[],
    model=OpenAIChat(id="gpt-4o"),
    store_events=True
)

response = team.run("讲一个5秒钟的关于狮子的短故事", stream=True, stream_events=True)
pprint_run_response(response)

for event in response.events:
    print(event.event)


默认情况下，TeamRunContentEvent 和 RunContentEvent 不会被存储。 你可以通过设置 events_to_skip 参数修改跳过的事件类型。例如：

team = Team(
    name="故事团队",
    members=[],
    model=OpenAIChat(id="gpt-4o"),
    store_events=True,
    events_to_skip=["TeamRunStarted"]
)

事件类型（Event Types）

以下是 Team.run() 与 Team.arun() 根据配置可能产生的事件类型：

核心事件（Core Events）
事件类型
	
描述

TeamRunStarted	
表示运行开始

TeamRunContent	
包含模型响应的文本块

TeamRunContentCompleted	
表示内容流式传输结束

TeamRunIntermediateContent	
包含模型的中间响应（当启用 output_model 时）

TeamRunCompleted	
表示运行成功完成

TeamRunError	
表示运行过程中发生错误

TeamRunCancelled	
表示运行被取消
工具事件（Tool Events）
事件类型
	
描述

TeamToolCallStarted	
团队工具调用开始

TeamToolCallCompleted	
团队工具调用完成（包含结果）
推理事件（Reasoning Events）
事件类型
	
描述

TeamReasoningStarted	
推理开始

TeamReasoningStep	
单个推理步骤

TeamReasoningCompleted	
推理完成
记忆事件（Memory Events）
事件类型
	
描述

TeamMemoryUpdateStarted	
团队记忆更新开始

TeamMemoryUpdateCompleted	
团队记忆更新完成
会话摘要事件（Session Summary Events）
事件类型
	
描述

TeamSessionSummaryStarted	
会话摘要生成开始

TeamSessionSummaryCompleted	
会话摘要生成完成
前置钩子事件（Pre-Hook Events）
事件类型
	
描述

TeamPreHookStarted	
前置钩子开始执行

TeamPreHookCompleted	
前置钩子执行完成
后置钩子事件（Post-Hook Events）
事件类型
	
描述

TeamPostHookStarted	
后置钩子开始执行

TeamPostHookCompleted	
后置钩子执行完成
解析模型事件（Parser Model Events）
事件类型
	
描述

TeamParserModelResponseStarted	
解析模型响应开始

TeamParserModelResponseCompleted	
解析模型响应完成
输出模型事件（Output Model Events）
事件类型
	
描述

TeamOutputModelResponseStarted	
输出模型响应开始

TeamOutputModelResponseCompleted	
输出模型响应完成
自定义事件（Custom Events）

如果你编写了自定义工具（custom tools），你可以定义并发送自定义事件。 这些事件会与 Agno 内置事件一同被处理。

可以通过继承内置的 CustomEvent 类来自定义事件类型，例如：

from dataclasses import dataclass
from agno.run.team import CustomEvent

@dataclass
class CustomerProfileEvent(CustomEvent):
    """客户资料的自定义事件"""

    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    customer_phone: Optional[str] = None


然后可以在自定义工具中产出该事件：

from agno.tools import tool

@tool()
async def get_customer_profile():
    """示例工具，生成自定义事件"""

    yield CustomerProfileEvent(
        customer_name="John Doe",
        customer_email="john.doe@example.com",
        customer_phone="1234567890",
    )

指定运行用户与会话（Specify Run User and Session）

你可以通过 user_id 和 session_id 参数指定运行所属的用户和会话：

team.run("生成我的月度报告", user_id="john@example.com", session_id="session_123")

传入图片 / 音频 / 视频 / 文件（Passing Images / Audio / Video / Files）

你可以通过 images、audio、video 或 files 参数向团队传入多模态内容。例如：

team.run("根据这张图片讲一个5秒钟的短故事", images=[Image(url="https://example.com/image.jpg")])

取消运行（Cancelling a Run）

可以通过调用 Team.cancel_run() 方法取消正在执行的运行。

团队成员指派（Team Member Delegation）
基本概念：团队执行流程

一个 Team 在内部其实有一个“团队领导者”（team leader）agent。 当你调用 team.run() 或 team.arun() 时，这个领导者会分析用户输入并决定：

是否需要将任务分配（delegate）给团队成员；
分配给谁；
或者是否自己直接回答。

整个执行流程如下：

团队接收到用户输入；
团队领导者（Team Leader） 分析输入并拆解为子任务；
领导者将子任务分配给合适的成员；
各成员执行任务并返回结果；
领导者可能再次委派任务，或综合所有成员的结果；
最终返回完整的响应给用户。

内部实现上，这个“分配任务”的动作是通过一个特殊的工具：delegate_task_to_members 工具来完成的。

当使用异步执行（arun()）时，如果领导者同时把任务分配给多个成员，这些成员将并发执行。

不同的团队执行策略

Agno 提供了几种常见的执行模式，用来控制任务分配与响应方式。

1. 成员直接响应（respond_directly=True）

默认情况下，成员的回答会被领导者处理、总结，然后返回统一结果。 但如果你希望成员的回答直接返回给用户（领导者不加工），就设置：

Team(respond_directly=True)


这种模式下，团队更像一个 “路由器（Router）”，负责把问题转发给最合适的 agent。

例子：多语言团队

multi_language_team = Team(
    name="Multi Language Team",
    respond_directly=True,
    members=[english_agent, japanese_agent],
    instructions=[
        "You are a language router that directs questions to the appropriate language agent.",
    ],
)


当 respond_directly=True 时：

团队领导者不会再整合结果；
多个成员的回答会直接拼接返回；
不可与 delegate_task_to_all_members 同时使用。
2. 直接把用户输入传给成员（determine_input_for_members=False）

默认情况下，领导者会重新组织输入，决定给成员什么任务。 但如果你希望成员直接收到用户的原始输入，可以设置：

Team(determine_input_for_members=False)


这对于成员输入结构化（如 Pydantic 模型）特别有用。

例子：研究团队

team = Team(
    name="Hackernews Research Team",
    determine_input_for_members=False,
    members=[hackernews_agent],
)


场景：当团队接收结构化任务（如 JSON 或表单输入）时，希望成员直接处理原始数据。

3. 任务同时分配给所有成员（delegate_task_to_all_members=True）

默认团队领导者会选择一个成员处理任务。 若你希望所有成员并行执行相同任务，可以启用：

Team(delegate_task_to_all_members=True)


这会让所有成员同时接收相同的输入，执行各自的分析，然后团队领导者再整合结果。 在异步模式（arun()）下，所有成员将并发运行。

例子：多来源信息研究团队

agent_team = Team(
    name="Discussion Team",
    delegate_task_to_all_members=True,
    members=[
        reddit_researcher,
        hackernews_researcher,
        academic_paper_researcher,
        twitter_researcher,
    ],
)


这种模式常用于：

信息聚合（多渠道新闻/研究源）；
共创（多 agent 协作生成结果）；
决策（各成员提出意见再综合）。
三种模式的区别总结
模式
	
关键参数
	
行为特点
	
常用场景


成员直接响应
	respond_directly=True	
领导者不加工结果，直接返回成员回答
	
路由团队（如多语言、专业分类）


输入直传成员
	determine_input_for_members=False	
用户输入直接送成员
	
结构化输入、科研/开发任务


同时分配任务
	delegate_task_to_all_members=True	
所有成员同时执行任务
	
协作、共识形成、聚合分析
调试团队（Debugging Teams）
为什么要用 Debug 模式？

Agno 的团队（Team）设计允许多个智能体（Agent）协作，因此在开发和测试阶段：

你需要知道每一步是谁执行的；
模型之间传了哪些消息；
是否正确调用了工具；
token 消耗、执行时间等指标如何。

Debug 模式能让你 可视化整个团队的执行过程，包括中间步骤与错误信息，非常适合在调试或优化阶段使用。

Debug 模式的三种启用方式

你可以通过三种方式开启 debug 模式：

方式
	
说明
	
作用范围

debug_mode=True
（在 Team 实例化时）
	
在创建团队时启用
	
全局生效（包括团队成员）

debug_mode=True
（在运行时）
	
在调用 .run() 或 .arun() 时启用
	
只对当前运行有效


环境变量 AGNO_DEBUG=True
	
在系统层面开启
	
所有 Team 默认进入调试模式
示例：启用 Debug 模式
from agno.team import Team
from agno.agent import Agent
from agno.models.openai import OpenAIChat

# 定义两个简单的 Agent
news_agent = Agent(name="News Agent", role="Get the latest news")
weather_agent = Agent(name="Weather Agent", role="Get the weather for the next 7 days")

# 创建一个团队
team = Team(
    name="News and Weather Team",
    members=[news_agent, weather_agent],
    model=OpenAIChat(id="gpt-4o"),
    debug_mode=True,        # 启用调试模式
    # debug_level=2,        # 可选，提供更详细日志
)

# 调试运行
team.print_response("What is the weather in Tokyo?")

Debug 输出内容包括：
模型接收到的 prompt 与生成的响应；
调用了哪些工具（例如搜索、数据库、API）；
任务分配给了哪个成员；
token 用量、执行时长；
报错栈与上下文。

如果你设置 debug_level=2，日志会更加详细，包括每个子任务的上下文与中间输出。

Debug 日志等级说明
参数值
	
说明

debug_level=1	
默认，显示关键步骤（输入、输出、调用链）

debug_level=2	
显示所有细节（包括模型消息、内部调用、token 消耗等）

在开发复杂团队时建议开启 debug_level=2，能帮助你：

定位消息在何处被修改；
追踪工具调用失败的原因；
优化 prompt 和上下文结构。
交互式 CLI 模式（Interactive CLI）

Agno 还提供了一个命令行交互式界面，可以让你像聊天一样与团队实时对话，非常适合测试多轮会话和团队协调效果。

from agno.team import Team
from agno.agent import Agent
from agno.db.sqlite import SqliteDb
from agno.models.openai import OpenAIChat

news_agent = Agent(name="News Agent", role="Get the latest news")
weather_agent = Agent(name="Weather Agent", role="Get the weather for the next 7 days")

team = Team(
    name="News and Weather Team",
    members=[news_agent, weather_agent],
    model=OpenAIChat(id="gpt-4o"),
    db=SqliteDb(db_file="tmp/data.db"),     # 保存历史记录
    add_history_to_context=True,            # 将历史对话加到上下文中
    num_history_runs=3,                     # 保存最近3次记录
)

# 启动命令行交互模式
team.cli_app(stream=True)


运行后你会看到一个交互式命令行界面，比如：

> Hello team!
[News Agent]: Here's the latest news...
[Weather Agent]: The forecast for Tokyo is sunny...


支持：

多轮对话；
流式输出；
历史追踪；
调试中实时查看任务流转。

Teams其他的用法跟单个Agent用法类似，详情可参考官方文档。

---
*导入时间: 2026-01-17 20:41:51*
