# 在大模型应用中使用长短记忆： OpenMemory MCP

## 基本信息
- **标题**: 在大模型应用中使用长短记忆： OpenMemory MCP
- **来源**: 微信公众号
- **作者**: 半吊子全栈工匠
- **发布时间**: 2025年08月03日
- **URL**: https://mp.weixin.qq.com/s/A1F0DHbqgz0KamGeGU0MyA
- **分类**: AI技术
- **标签**: #AI #GitHub #工具推荐 #技术分析 #效率 #深度学习 #教程

## 内容摘要
大模型虽然功能强大，但其输入长度（即上下文窗口）始终存在限制，这意味着它们在会话过程中无法记住所有交互内容。如果我们能为模型构建一个独立、可移植的“记忆层”，作为其长期记忆的补充，并且这一层运行于本地、由用户完全掌控数据，是否会让 AI 的使用更高效、更安全？

OpenMemory MCP 正是这样一种尝试。它基于 Mem0（专为 AI Agent 设计的记忆系统）构建，是一个私有的、以本地优先为核心的 LLM 记忆层。通过 OpenMemory MCP，用户可以在各种支持 MCP 协议的客户端之间（如 Cursor、Claude Desktop、Windsurf、Cline 等），实现持久...

## 完整内容

大模型虽然功能强大，但其输入长度（即上下文窗口）始终存在限制，这意味着它们在会话过程中无法记住所有交互内容。如果我们能为模型构建一个独立、可移植的“记忆层”，作为其长期记忆的补充，并且这一层运行于本地、由用户完全掌控数据，是否会让 AI 的使用更高效、更安全？

OpenMemory MCP 正是这样一种尝试。它基于 Mem0（专为 AI Agent 设计的记忆系统）构建，是一个私有的、以本地优先为核心的 LLM 记忆层。通过 OpenMemory MCP，用户可以在各种支持 MCP 协议的客户端之间（如 Cursor、Claude Desktop、Windsurf、Cline 等），实现持久化、上下文感知的 AI 交互体验。这不仅增强了 AI 的连贯性与个性化能力，也为数据隐私和控制权提供了更强保障。

如果希望零基础快速入门基于MCP的AI 应用开发，感谢大家阅读一个本人写的入门读物：

1. 什么是 OpenMemory？

OpenMemory MCP 是一个面向 MCP 客户端的私有、本地优先的内存层，旨在为 AI 提供持久化的记忆能力。它提供了一套完整的基础设施，用于存储、管理和利用 AI 生成的记忆数据，并确保所有信息始终保留在本地系统中，不对外泄露。简而言之，它就像一个基于标准 MCP 协议构建的向量支持型存储层，专为 LLM 客户端设计，并且可以与 Mem0 等工具无缝集成、开箱即用。

其核心能力包括：

跨会话记忆存储
支持任意文本块的长期保存与调用，使 AI 在每次交互中都能“记住”之前的内容，无需从零开始。
智能检索机制
借助 Qdrant 向量数据库，实现基于语义相关性的高效检索，超越传统关键字匹配的限制。
完全本地部署
整个系统基于 Docker、PostgreSQL 和 Qdrant 构建，所有数据均在本地处理和存储，不会向外发送任何信息，保障隐私安全。
精细访问控制
可在客户端或内存级别随时暂停或撤销访问权限，同时记录每一次读写操作的审计日志，提升透明度与安全性。
可视化管理界面
配套提供基于 Next.js 与 Redux 构建的仪表盘，实时展示谁在访问内存、进行了哪些更改，便于监控与追踪。

在实际使用中，用户只需通过一个 docker-compose 命令即可启动整个 OpenMemory 系统，包括 API 服务、Qdrant 向量数据库和 Postgres 数据存储。其中，API 进程托管了一个基于 Mem0 实现的 MCP 服务器，并通过 SSE（Server-Sent Events）协议提供符合标准的 MCP 接口。

当 LLM 客户端连接到 OpenMemory 的 /mcp/... 接口时，会建立一条 SSE 流式通信通道，并调用如 add_memories()、search_memory() 或 list_memories() 等方法来操作记忆内容。而其余诸如向量索引管理、访问控制和审计日志记录等复杂任务，则全部由 OpenMemory 服务自动完成，极大简化了开发者的集成负担。

penMemory MCP 为构建具备持久上下文感知能力的 AI 应用提供了一个安全、可控、可扩展的本地化解决方案。更多细节和演示视频可参考官方页面 mem0.ai/openmemory-mcp。

2. 设置和运行 OpenMemory MCP指南

该项目由两个核心组件组成，需同时运行以实现完整功能：

api/ 目录：这是系统的后端部分，集成了 API 服务和 MCP 服务器。它负责处理客户端请求、管理记忆数据的存储与检索，并通过标准的 MCP 协议与其他 AI 工具和服务进行通信。整个后端采用 Docker 容器化部署，结合 PostgreSQL 和 Qdrant 向量数据库，确保高效的数据处理与本地化存储。

ui/ 目录：这是一个基于 React 构建的前端应用，作为用户交互的核心界面，提供直观的可视化仪表盘。通过该界面，用户可以实时查看内存访问情况、操作记录以及各客户端的状态变化，同时还可对权限设置、审计日志等进行管理，大大提升了系统的可观测性与可控性。

这两个组件协同工作，共同构建了一个具备持久记忆能力、上下文感知且安全可控的 AI 助手平台。

2.1. 系统先决条件

在开始之前，请确保系统安装了以下内容：

Docker 和 Docker Compose
Python 3.9 + ーー后端开发所需
Node.js — 前端开发所需
OpenAI API Key ー用于 LLM 交互
GNU Make 是一个组建自动化工具，将在安装过程中使用它。

在进行下一步之前，请确保 docker desktop 正在运行。

2.2. 克隆repo并设置 OpenAI API 密钥

使用以下命令克隆 github.com/mem0ai/mem0 可用的repo。

git clone <https://github.com/mem0ai/mem0.git>
cd openmemory

接下来，将 OpenAI API 密钥设置为环境变量。

export OPENAI_API_KEY=your_api_key_here


此命令仅为当前终端会话设置密钥，只持续到关闭该终端窗口为止。

2.3.设置后端

后端在 Docker 容器中运行。要启动后端，请在根目录中运行以下命令：

# Copy the environment file and edit the file to update OPENAI_API_KEY and other secrets
make env

# Build all Docker images
make build

# Start Postgres, Qdrant, FastAPI/MCP server
make up

其中，.env.local文件将具有以下约定。

OPENAI_API_KEY=your_api_key

一旦设置完成，API 将在 http://localhost:8000 上线，还应该看到在 docker desktop 中运行的容器。

下面是一些可以使用的其他后端命令：

# Run database migrations
make migrate

# View logs
make logs

# Open a shell in the API container
make shell

# Run tests
make test

# Stop the services
make down
2.4.设置前端

前端是一个 Next.js 应用程序：

# 使用 pnpm 安装依赖项并运行 Next.js 开发服务器
make ui

安装成功后，可以导航到 http://localhost:3000 检查 OpenMemory 仪表盘，在 MCP 客户端安装 MCP 服务器。

MCP 客户端打开 GET /mcp/{client_name}/sse/{user_id}的 SSE 通道，该通道连接两个上下文变量 (user_id、 client_name)。在仪表盘上，可以找到一行命令，根据所选择的客户端 (如 Cursor、 Claude、 Cline等) 安装 MCP 服务器。

在 Cursor 中安装命令如下所示：

npx install-mcp i https://mcp.openmemory.ai/xyz_id/sse --client cursor

打开Cursor设置并检查侧栏中的 MCP 选项以验证连接。

在 Cursor 中打开一个新的聊天，并给出一个示例的提示词，这将触发 add_memories()调用并存储内存。刷新仪表盘并转到 Memories 选项卡来检查所有这些记忆的内容。类别是为内存自动创建的，类似于可选的标记 (通过 GPT-4o 分类)。

每个 MCP 客户端可以 “调用” 四个标准操作之一：

add_memories(text) → 在 Qdrant 存储文本，插入 / 更新记忆行和审计条目



search_memory(query) →嵌入查询，使用可选的 ACL 过滤器运行向量搜索，记录每次访问



list_memories() → 检索用户存储的所有向量 (通过 ACL 过滤) 并记录清单



delete_all_memories(): 清除所有内存记忆

所有响应都通过相同的 SSE 连接流，仪表盘显示所有活动的连接，以及哪些应用程序正在访问内存和读 / 写的详细信息。

3. 仪表盘中可用的特性

OpenMemory 控制面板包括三个主要路径：

/–dashboard/- 仪表盘
/memories – 查看和管理存储的记忆内容
/apps – 查看连接的应用程序

简而言之，查看仪表盘中的所有可用特性可以了解基本概念。

下面是一些重要的前端组件：

ui/app/memories/components/MemoryFilters.tsx : 处理搜索输入、过滤器对话框触发器、诸如 archive/pause/delete 之类的批量操作，还管理行的选择状态。
ui/app/memories/components/MemoriesSection.tsx : 加载、分页和显示内存列表的主容器。
ui/app/memories/components/MemoryTable.tsx – 呈现实际的内存表 (ID、内容、客户端、标记、创建日期、状态)。通过 MemoryActions (编辑、删除、复制链接) ，每一行都有自己的操作。

对于状态管理和 API 调用，它使用干净的钩子：

useStats.ts : 加载高级统计数据，比如总内存和应用程序数量。
useMemoriesApi.ts : 处理获取、删除和更新内存。
useAppsApi.ts : 检索应用程序信息和每个应用程序的内存细节。
useFiltersApi.ts : 支持获取类别和更新筛选器状态。

总之，这些部分创建了一个响应，实时仪表盘，控制AI内存层的每一个方面。

4. 安全、访问控制和架构

在使用 MCP 协议或任何 AI Agent 系统时，安全性已不再是可选项，而是必须优先考虑的核心要素。OpenMemory 正是基于“隐私优先”的设计理念构建而成，确保所有记忆数据始终保留在本地基础设施中，不向外部泄露。

该系统依赖一系列容器化组件（如 FastAPI、PostgreSQL 和 Qdrant）运行，所有记忆内容都存储在本地环境中。为防止常见的安全威胁，例如注入攻击，敏感输入通过 SQLAlchemy 进行参数化绑定处理，确保数据操作的安全性。同时，每一次内存的添加、检索或状态变更都会被详细记录在 MemoryStatusHistory 和 MemoryAccessLog 表中，实现完整的审计追踪能力。

尽管身份验证机制并未直接内置，但所有 API 接口均要求提供 user_id，并通过外部认证网关（如 OAuth 或 JWT）进行保护。开发环境下，FastAPI 的 CORS 设置对本地调试完全开放（allow_origins = ["*"]），但在生产部署时应限制访问来源，以增强安全性。

4.1 细粒度访问控制：安全与灵活性并重

OpenMemory 的一大核心优势在于其细粒度的访问控制机制。系统通过 access_controls 表定义应用程序与特定记忆之间的允许/拒绝规则，并由 check_memory_access_permissions函数执行权限判断。这一函数会综合考量多个因素，包括当前记忆的状态（如活动、暂停）、应用是否启用，以及具体的 ACL 规则配置。

这意味着你可以灵活地控制访问权限——例如，暂停某个应用程序的写入功能，归档或临时禁用某条记忆内容，甚至根据用户或类别设置过滤策略。对于处于暂停或非活动状态的记忆条目，它们将对工具调用和搜索接口不可见，从而有效防止未授权访问。这种分层式的访问模型，使得系统可以在应用、用户、记忆等多个维度上实现精准控制。

4.2 技术栈详解

为了更好地理解 OpenMemory 的运作方式，我们可以从其代码库出发，深入了解其系统架构：

1. 后端服务（FastAPI + FastMCP over SSE）

后端采用 FastAPI 构建，公开了标准 REST 接口（如 /api/v1/memories、/api/v1/apps、/api/v1/stats），同时也提供了基于 MCP 协议的“工具”接口（如 /mcp/messages、/mcp/sse/<client>/<user>），供 AI Agent 通过 SSE 流式连接调用相关方法（如 add_memories()、search_memory()、list_memories()）。这些接口连接至 PostgreSQL 用于管理结构化元数据，并与 Qdrant 集成以支持语义级向量搜索。

2. 向量存储（Qdrant via mem0 客户端）

所有记忆内容都会在 Qdrant 中建立语义索引，支持高效的相似性检索。查询时，系统会自动应用针对用户和应用程序的过滤器，确保返回结果的准确性和权限合规性。

3. 关系型元数据管理（SQLAlchemy + Alembic）

通过 SQLAlchemy ORM 和 Alembic 数据迁移框架，系统维护了用户、应用、记忆条目、访问日志、分类标签及访问控制等关键信息。默认使用 SQLite（文件为 openmemory.db），但也支持切换为 Postgres，以适应更复杂的应用场景。

4. 前端仪表盘（Next.js）

前端采用 Next.js 框架构建，结合 Redux 实现全局状态管理，利用 Hooks 和 Axios 与后端 API 进行通信。界面中集成了 Recharts 图表库、React Hook Form 表单组件以及轮播图等 UI 元素，帮助用户直观查看记忆内容、访问记录及系统状态变化，实现真正的“可观测性”。

5. 基础设施与开发流程

整个系统通过 docker-compose.yml 文件统一编排，包含 Qdrant 向量数据库和 API 服务。同时，项目还提供 Makefile 脚本，简化了迁移、测试和热重载等常见操作。后端逻辑与测试代码共存，便于持续集成与质量保障。

OpenMemory 提供了一个完整、自托管的 LLM 记忆管理系统，具备以下核心能力：

在关系数据库与向量索引中持久化、版本化聊天记忆内容；
基于每个应用的 ACL 和状态控制（活动 / 暂停 / 归档）实现精细化权限管理；
利用 Qdrant 支持高效语义搜索；
通过丰富的 Next.js 仪表盘实现可视化监控与交互。

无论你是希望为 AI Agent 添加长期记忆能力，还是寻求一个符合企业级安全与合规要求的记忆解决方案，OpenMemory 都是一个值得深入探索的选择。

5. 应用示例

OpenMemory可以用于AI交互中的任何地方。

5.1 示例1: 具有内存层的多智能体研究助理

设想构建一个工具，其中不同的 LLM Agent 分别专注于特定的研究领域，例如：一个Agent专门处理学术论文，另一个负责分析GitHub仓库，还有一个专注于新闻报道。每个子Agent通过 add_memories(text) 方法将从其专注领域检索到的数据摘要添加到共享的记忆库OpenMemory中，并使用自动分类（如GPT模型）对这些记忆内容进行标记，以便于后续检索和管理。

主Agent则充当协调者角色，它通过打开一个SSE（Server-Sent Events）通道与OpenMemory交互，并利用 search_memory(query) 方法查询所有先前由子Agent存储的相关上下文信息。这种架构不仅使得跨领域的知识整合成为可能，同时也确保了数据的连贯性和一致性。

此外，该系统还配备了一个仪表盘界面，用于展示各个Agent存储的具体内容，并允许管理员基于ACL（访问控制列表）限制不同Agent之间的内存访问权限。这一步骤对于维护系统的安全性及数据隐私至关重要。

为了进一步增强系统的功能性和透明度，我们可以引入一个名为LangGraph的编排层。在这个框架下，每个Agent都被视为网络中的一个节点，能够追踪随时间变化的内存读写操作。这样一来，不仅可以可视化知识流的动态过程，还能清晰地识别出信息来源及其演变路径，从而为每一个研究线索提供详细的背景支持。这种方法极大地促进了跨学科研究的合作效率，同时也为深入挖掘和理解复杂问题提供了有力的技术支撑。通过这种方式，我们不仅实现了高效的AI协作，还为未来的研究工作奠定了坚实的基础。

5.2 示例2:具有持久跨会话内存的智能会议助理

我们可以创建一个类似于Zoom会议笔记记录器的系统，该系统不仅能通过LLM自动提取会议摘要，还能记住每次会议中的操作项，并在未来会议中自动检索相关的上下文信息。

在每次会议结束后，系统会调用 add_memories(text) 方法将会议内容及其摘要添加到记忆库中。这些记忆内容会被适当分类并标记，以便于后续检索和管理。例如，在下一次会议开始之前，系统可以运行 search_memory("open items for Project X") 来获取与项目X相关的未解决问题或待办事项，确保团队能够迅速回顾并跟进相关议题。

为了增强系统的透明度和可追溯性，所有被标记的记忆内容不仅会在用户界面（UI）中显示，还会记录在审计日志中，详细追踪哪些内存被读取以及何时被读取。这有助于维护数据的完整性和安全性，同时也方便用户随时查阅历史记录。

此外，该系统还可以与多种工具集成，如Google Drive、Notion和GitHub等，使得存储的操作条目可以直接链接到实时文档和任务。这样一来，团队成员可以在熟悉的平台上直接访问会议纪要和行动项，极大地提高了工作效率和协作便利性。

通过这种设计，我们不仅实现了高效、智能的会议记录和管理，还为跨平台的数据同步和任务跟踪提供了强有力的支持，确保每个团队成员都能及时获取所需的信息，推动项目的顺利进行。这一解决方案特别适合需要频繁开会讨论并跟踪进展的企业和组织使用。




如果希望了解MCP 的价值，可以参考《拆解OpenAI最大对手的杀手锏：为什么会是MCP？》和《什么可能会定义人工智能的下一个十年？》；

如果想全面而有深度地了解MCP， 可以阅读《大模型应用系列：两万字解读MCP》；

如果想了解MCP 规范的原文， 可以参考我的译稿《MCP规范完整中译稿：2025-3-26版》；

如果想通过工具快速入手，可以使用《让你的服务变成MCP Server？FastAPI MCP 指南》；

如果选择使用 MCP 的开发框架， 可以参考《万字解读：8种常见框架，选择哪一种来开发MCP呢？》；

如果希望集成多个MCP服务，可以利用《采用LangGraph集成多个MCP服务器的应用》

如果希望了解基于MCP的架构模式，有全网首发的文字《全网首发：MCP 的10种架构模式》；

如果想对比 MCP 与其他智能体协议的区别， 🉑参考《智能体间协作的"巴别塔困境"如何破解？解读Agent通信4大协议：MCP/ACP/A2A/ANP》；

如果希望快速入门MCP，请阅读老码农的作品——

如果希望了解MCP 更多的应用价值，建议阅读：




6.小结

OpenMemory 结合了向量搜索（用于实现语义查询）、关系型元数据（用于审计和日志记录）以及实时控制面板（用于增强可观察性和支持动态访问控制），使我们能够构建具备上下文感知能力的应用程序。这种集成方式赋予了 MCP 客户端一种真正的“历史记忆”，使其能够在不同会话之间保持连续性和一致性。

尤为重要的是，所有数据均存储于本地系统中，确保了数据的安全性与隐私保护。这一架构不仅提升了系统的智能性和响应能力，同时也为用户提供了对数据的完全掌控，使得构建既强大又安全的AI应用成为可能。




【关联阅读】

全网首发：MCP 的10种架构模式

什么可能会定义人工智能的下一个十年？

大模型应用系列：两万字解读MCP

拆解OpenAI最大对手的杀手锏：为什么会是MCP？

万字解读：8种常见框架，选择哪一种来开发MCP呢？

MCP规范完整中译稿：2025-3-26版

智能体间协作的"巴别塔困境"如何破解？解读Agent通信4大协议：MCP/ACP/A2A/ANP

大模型应用的10种架构模式

7B？13B？175B？解读大模型的参数

采用LangGraph集成多个MCP服务器的应用

让你的服务变成MCP Server？FastAPI MCP 指南

大模型应用系列：从Ranking到Reranking

大模型应用系列：Query 变换的示例浅析


从零构建大模型之Transformer公式解读

如何选择Embedding Model？关于嵌入模型的10个思考

解读文本嵌入：语义表达的练习

解读知识图谱的自动构建


“提示工程”的技术分类


大模型系列：提示词管理


提示工程中的10个设计模式

解读：基于图的大模型提示技术

大模型微调：RHLF与DPO浅析

Chunking：基于大模型RAG系统中的文档分块

大模型应用框架：LangChain与LlamaIndex的对比选择

解读大模型应用的可观测性

大模型系列之解读MoE

在大模型RAG系统中应用知识图谱

面向知识图谱的大模型应用

让知识图谱成为大模型的伴侣

如何构建基于大模型的App


Qcon2023: 大模型时代的技术人成长（简）

论文学习笔记：增强学习应用于OS调度

《深入浅出Embedding》随笔

LLM的工程实践思考

大模型应用设计的10个思考

基于大模型（LLM）的Agent 应用开发


解读大模型的微调

解读向量数据库

解读向量索引


解读ChatGPT中的RLHF

解读大模型（LLM）的token

解读提示词工程（Prompt Engineering）

解读Toolformer

解读TaskMatrix.AI

解读LangChain

解读LoRA

解读RAG

大模型应用框架之Semantic Kernel


浅析多模态机器学习

大模型应用于数字人


深度学习架构的对比分析

老码农眼中的大模型（LLM）




---

**处理完成时间**: 2025年10月09日
**文章字数**: 9417字
**内容类型**: 微信文章
**自动分类**: AI技术
**处理状态**: ✅ 完成
