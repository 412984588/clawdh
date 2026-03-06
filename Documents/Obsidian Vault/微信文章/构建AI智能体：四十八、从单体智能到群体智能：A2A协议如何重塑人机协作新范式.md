---
title: "构建AI智能体：四十八、从单体智能到群体智能：A2A协议如何重塑人机协作新范式"
source: wechat
url: https://mp.weixin.qq.com/s/M9GlAdJH_JtNZ0CiUMKWHw
author: 知循AI-构建智能体
pub_date: 2025年10月15日 20:06
created: 2026-01-17 22:25
tags: [AI]
---

# 构建AI智能体：四十八、从单体智能到群体智能：A2A协议如何重塑人机协作新范式

> 作者: 知循AI-构建智能体 | 发布日期: 2025年10月15日 20:06
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/M9GlAdJH_JtNZ0CiUMKWHw)

---

一、开篇导语

我们对A2A已经有了初步的了解，但对具体使用可能还充满了很多疑问，今天我们结合具体的实例来加深对A2A实际应用的理解，想象这样一个场景：我们要组织一场户外篮球赛，需要同时考虑天气状况、场地预约、参与人员时间安排等多个因素。在传统模式下，这需要我们分别查看天气预报、联系场地管理员、逐个确认参与者时间——一个典型的多系统、多步骤的繁琐过程。

而现在，通过A2A智能代理协议，这一切变得相当简单，只需要一个简单的请求，就告诉我们是否可以如期举行，这背后发生的，是一场智能代理的协同交响曲：天气代理提供精准预报，场地代理检查可用性，日历代理协调参与者时间，最后通知代理发送确认信息。每个代理各司其职，又完美配合，共同完成一个复杂决策。

二、A2A的简单回顾

1.  什么是A2A协议

定义阐述：Agent-to-Agent协议的标准化通信框架

核心特征：松耦合、可发现、自描述、可组合的智能体交互模式

核心组件：

服务发现机制：通过标准端点实现代理能力的自动识别

任务描述语言：统一的JSON Schema定义输入输出规范

状态管理：完整的任务生命周期跟踪和管理

安全认证：基于令牌的身份验证和授权机制

2. A2A与传统API的对比优势

动态性对比：

传统API：静态接口，需要预先知道端点地址和参数

A2A协议：动态发现，代理可运行时识别彼此能力

语义化程度：

传统API：通常缺乏机器可读的语义描述

A2A协议：完整的JSON Schema提供丰富的语义信息

自治能力：

传统API：被动响应，无自主决策能力

A2A协议：代理具有自主性和智能决策能力

3. 协议的核心技术特性

标准化服务发现

通过/.well-known/agent.json端点暴露代理能力

自动化的代理注册和发现机制，动态的能力协商和版本管理

统一的任务模型

标准化的任务提交格式，统一的结果返回结构，完整的错误处理规范

安全通信机制

基于令牌的身份验证，端到端的加密通信，细粒度的权限控制

4. A2A协议的生态系统价值

互操作性：不同厂商、不同技术的代理无缝协作

可扩展性：新代理服务的即插即用式集成

维护性：独立部署、升级不影响整体系统运行

三、单智能体决策系统

这是一个基于天气条件自动决定篮球会议是否举行的智能代理系统，遵循A2A通信协议，首先要声明一个提供指定日期天气数据查询的 RESTful API 服务，并且要遵循智能代理（Agent）的标准规范。

1. 天气服务的Agent

1.1 Agent Card 声明

WEATHER_AGENT_CARD = {
    "name": "WeatherAgent",
    "version": "1.0",
    "description": "提供指定日期的天气数据查询",
    "endpoints": {
        "task_submit": "/api/tasks/weather",
        "sse_subscribe": "/api/tasks/updates"
    },
    "input_schema": {
        "type": "object",
        "properties": {
            "date": {"type": "string", "format": "date"},
            "location": {"type": "string", "enum": ["北京"]}
        },
        "required": ["date"]
    },
    "authentication": {"methods": ["API_Key"]}
}

作用：定义代理的元数据，遵循 .well-known/agent.json 标准

name/version/description: 代理的基本信息

endpoints: 定义任务提交和更新订阅的API端点

input_schema: 定义输入参数的JSON Schema

authentication: 声明认证方式

1.2 数据模型

class WeatherTaskRequest(BaseModel):
    task_id: str
    params: dict

作用：定义任务请求的数据结构

task_id: 任务唯一标识符

params: 包含查询参数（日期、位置）

1.3 模拟数据存储

weather_db = {
    "2025-05-08": {"temperature": "25℃", "condition": "雷阵雨"},
    "2025-05-09": {"temperature": "18℃", "condition": "小雨转晴"},
    "2025-05-10": {"temperature": "22℃", "condition": "多云转晴"}
}

作用：模拟数据库，存储预设日期的天气数据

1.4 Agent Card 发现端点

@app.get("/.well-known/agent.json")
async def get_agent_card():
    return WEATHER_AGENT_CARD

功能：提供代理的标准发现接口，让其他系统能够自动发现和了解这个代理的能力

1.5 天气查询任务处理端点

@app.post("/api/tasks/weather")
async def handle_weather_task(request: WeatherTaskRequest):
    target_date = request.params.get("date")
    if not target_date or target_date not in weather_db:
        raise HTTPException(status_code=400, detail="无效日期参数")
    return {
        "task_id": request.task_id,
        "status": "completed",
        "artifact": {
            "date": target_date,
            "weather": weather_db[target_date]
        }
    }

接收天气查询任务

验证日期参数

返回对应日期的天气信息

返回标准化的任务响应格式

1.5 服务提供的完整功能

1.5.1 代理发现

通过标准路径 /.well-known/agent.json 提供代理能力描述

1.5.2 天气查询

输入：指定日期（必需）和位置（可选，目前只支持北京）

输出：温度信息和天气状况

示例查询日期：2025-05-08、2025-05-09、2025-05-10

1.5.3 标准化响应

返回统一格式的任务响应：

{
    "task_id": "任务ID",
    "status": "completed",
    "artifact": {
        "date": "查询日期",
        "weather": {"temperature": "温度", "condition": "天气状况"}
    }
}

1.5.4 错误处理

参数验证：检查日期是否存在且有效

错误响应：返回标准HTTP错误码和描述

1.6. 使用示例

1.6.1 发现代理能力

GET http://localhost:8000/.well-known/agent.json

1.6.2 查询天气

POST http://localhost:8000/api/tasks/weather
Content-Type: application/json
{
    "task_id": "task_123",
    "params": {
        "date": "2025-05-08"
    }
}

1.6.3 相应结果

{
    "task_id": "task_123",
    "status": "completed",
    "artifact": {
        "date": "2025-05-08",
        "weather": {
            "temperature": "25℃",
            "condition": "雷阵雨"
        }
    }
}

1.6.4 服务启动示例

这个服务可以作为更大的AI系统或工作流中的一个组件，专门负责天气信息查询功能。

WeatherAgent完整参考：

from fastapi import FastAPI, HTTPException
from datetime import date
from pydantic import BaseModel
import uvicorn
app = FastAPI()
# Agent Card声明（通过/.well-known/agent.json暴露）
WEATHER_AGENT_CARD = {
    "name": "WeatherAgent",
    "version": "1.0",
    "description": "提供指定日期的天气数据查询",
    "endpoints": {
        "task_submit": "/api/tasks/weather",
        "sse_subscribe": "/api/tasks/updates"
    },
    "input_schema": {
        "type": "object",
        "properties": {
            "date": {"type": "string", "format": "date"},
            "location": {"type": "string", "enum": ["北京"]}
        },
        "required": ["date"]
    },
    "authentication": {"methods": ["API_Key"]}
}
# 任务请求模型
class WeatherTaskRequest(BaseModel):
    task_id: str
    params: dict
# 模拟天气数据存储
weather_db = {
    "2025-05-08": {"temperature": "25℃", "condition": "雷阵雨"},
    "2025-05-09": {"temperature": "18℃", "condition": "小雨转晴"},
    "2025-05-10": {"temperature": "22℃", "condition": "多云转晴"}
}
@app.get("/.well-known/agent.json")
async def get_agent_card():
    return WEATHER_AGENT_CARD
@app.post("/api/tasks/weather")
async def handle_weather_task(request: WeatherTaskRequest):
    """处理天气查询任务"""
    target_date = request.params.get("date")
    # 参数验证
    if not target_date or target_date not in weather_db:
        raise HTTPException(status_code=400, detail="无效日期参数")
    return {
        "task_id": request.task_id,
        "status": "completed",
        "artifact": {
            "date": target_date,
            "weather": weather_db[target_date]
        }
    }
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

2. 篮球会议安排代理

2.1 类初始化

class BasketBallAgent:
    def __init__(self):
        self.weather_agent_url = "http://localhost:8000"
        self.api_key = "SECRET_KEY"  # 实际应通过安全方式存储

设置天气代理服务的URL

配置API密钥（实际应用中应从安全存储获取）

2.2 任务创建方法

def _create_task(self, target_date: str) -> dict:
    """创建A2A标准任务对象"""
    return {
        "task_id": str(uuid.uuid4()),
        "params": {
            "date": target_date,
            "location": "北京"
        }
    }

生成符合A2A协议标准的任务对象

使用UUID确保任务ID的唯一性

封装查询参数（日期和位置）

2.3 天气查询核心方法

def check_weather(self, target_date: str) -> dict:
    """通过A2A协议查询天气"""
    # 获取天气智能体能力描述
    agent_card = requests.get(
        f"{self.weather_agent_url}/.well-known/agent.json"
    ).json()
    # 构造任务请求
    task = self._create_task(target_date)
    # 发送任务请求
    response = requests.post(
        f"{self.weather_agent_url}{agent_card['endpoints']['task_submit']}",
        json=task,
        headers={"Authorization": f"Bearer {self.api_key}"}
    )
    if response.status_code == 200:
        return response.json()["artifact"]
    else:
        raise Exception(f"天气查询失败: {response.text}")

作用：完整的A2A协议交互流程

服务发现：首先获取天气代理的能力描述

任务构造：创建标准格式的任务请求

API调用：向任务提交端点发送请求

结果处理：提取并返回天气数据

2.4 决策逻辑方法

def schedule_meeting(self, date: str):
    """综合决策逻辑"""
    try:
        result = self.check_weather(date)
        if "雨" not in result["weather"]["condition"] and "雪" not in result["weather"]["condition"]:
            return {"status": "confirmed", "weather": result["weather"]}
        else:
            return {"status": "cancelled", "reason": "恶劣天气"}
    except Exception as e:
        return {"status": "error", "detail": str(e)}

作用：基于天气条件做出智能决策

确认举行：天气状况不含"雨"或"雪"

取消会议：出现恶劣天气条件

错误处理：处理查询失败的情况

2.5 系统协议流程

2.5.1 A2A协议实现

BasketBallAgent (客户端) → WeatherAgent (服务端)
     ↓                         ↓
  决策代理                   能力代理

服务发现：动态获取代理能力

标准通信：统一的任务格式和响应格式

松耦合：代理间独立部署和升级

2.5.2 智能决策流程

输入日期 → 查询天气 → 分析条件 → 输出决策
    ↓         ↓         ↓         ↓
"2025-05-08" → 雷阵雨 → 包含"雨" → 取消会议
"2025-05-10" → 多云转晴 → 无恶劣天气 → 确认举行

2.6 使用示例

2.6.1 测试案例1：雨天取消

result = meeting_agent.schedule_meeting("2025-05-08")
# 输出: 篮球安排结果: {'status': 'cancelled', 'reason': '恶劣天气'}

2.6.2 测试案例2：晴天确认

result = meeting_agent.schedule_meeting("2025-05-10")
# 输出: 篮球安排结果: {'status': 'confirmed', 'weather': {'temperature': '22℃', 'condition': '多云转晴'}}

2.6.3 运行结果示例

BasketBallAgent 参考：

import requests
import uuid
class BasketBallAgent:
    def __init__(self):
        self.weather_agent_url = "http://localhost:8000"
        self.api_key = "SECRET_KEY"  # 实际应通过安全方式存储
    def _create_task(self, target_date: str) -> dict:
        """创建A2A标准任务对象"""
        return {
            "task_id": str(uuid.uuid4()),
            "params": {
                "date": target_date,
                "location": "北京"
            }
        }
    def check_weather(self, target_date: str) -> dict:
        """通过A2A协议查询天气"""
        # 获取天气智能体能力描述
        agent_card = requests.get(
            f"{self.weather_agent_url}/.well-known/agent.json"
        ).json()
        # 构造任务请求
        task = self._create_task(target_date)
        # 发送任务请求
        response = requests.post(
            f"{self.weather_agent_url}{agent_card['endpoints']['task_submit']}",
            json=task,
            headers={"Authorization": f"Bearer {self.api_key}"}
        )
        if response.status_code == 200:
            return response.json()["artifact"]
        else:
            raise Exception(f"天气查询失败: {response.text}")
    def schedule_meeting(self, date: str):
        """综合决策逻辑"""
        try:
            result = self.check_weather(date)
            # print('result=', result)  
            if "雨" not in result["weather"]["condition"] and "雪" not in result["weather"]["condition"]:
                return {"status": "confirmed", "weather": result["weather"]}
            else:
                return {"status": "cancelled", "reason": "恶劣天气"}
        except Exception as e:
            return {"status": "error", "detail": str(e)}
# 使用示例
if __name__ == "__main__":
    meeting_agent = BasketBallAgent()
    result = meeting_agent.schedule_meeting("2025-05-08")
    # result = meeting_agent.schedule_meeting("2025-05-10")
    print("篮球安排结果:", result)

四、多代理协作系统

基于以上示例扩展为多代理协作系统，新增了场地代理、日历代理以及通知代理

1. 系统特点

1.1 多代理协作架构

BasketBallAgent (协调者)
    ├── WeatherAgent (天气查询)
    ├── VenueAgent (场地管理) 
    ├── CalendarAgent (日程检查)
    └── NotificationAgent (通知发送)

1.2 新增代理功能

场地代理 (VenueAgent)：检查室内/室外场地可用性、处理场地维护状态、支持不同运动类型

日历代理 (CalendarAgent)：检查参与者时间冲突、计算可用率、提供详细可用性信息

通知代理 (NotificationAgent)：发送会议确认/取消通知、支持多种通知类型、跟踪通知状态

1.3 智能决策逻辑

决策流程:

天气检查 → 恶劣天气则取消

场地检查 → 场地不可用则取消

参与者检查 → 可用率<60%则取消

发送通知 → 确认后自动通知

1.4 升级的架构设计

四层架构模型：

客户端层：用户交互界面

协调层：BasketBallAgent决策引擎

能力层：天气、场地、日历等专业代理

数据层：各代理的专有数据存储

1.5 代理职责边界划分

WeatherAgent：专注天气数据查询与预报

VenueAgent：管理场地资源与可用性状态

CalendarAgent：处理参与者时间冲突检测

NotificationAgent：负责多通道消息推送

BasketBallAgent：协调决策与业务流程编排

1.6 数据流与状态管理

请求流程：客户端→协调器→能力代理的链式调用

响应聚合：多源数据在协调层的智能融合

状态追踪：基于task_id的全链路任务状态管理

错误处理：分级故障隔离与优雅降级策略

1.7 决策机制

1.7.1 分布式决策流程设计

并行检查机制：天气、场地、日程的并发验证

决策树逻辑：基于优先级的条件判断序列

阈值配置：可调节的通过标准（如60%参与者可用率）

上下文传递：决策过程中状态信息的完整传递

1.7.2 智能推荐引擎

多因素综合分析：天气状况、场地类型、参与度权重计算

个性化建议生成：基于历史数据和用户偏好的智能推荐

备选方案提供：自动建议替代时间或场地选项

风险评估：基于概率的会议成功可能性预测

1.7.3 冲突解决策略

优先级仲裁：关键条件（安全因素）的否决权设置

权重平衡：不同代理反馈结果的权重分配算法

协商机制：代理间的条件协商与妥协方案生成

人工干预：复杂情况的转人工决策流程

2. 执行流程图

3. 流程详细说明

3.1 阶段一：客户端请求接收与初始化

3.1.1 请求接收过程

客户端向高级篮球代理系统提交会议安排请求，请求中包含会议日期、参与者列表、场地类型等关键信息。系统接收到请求后，首先创建决策上下文对象，用于在整个处理流程中跟踪和记录所有检查结果、决策状态和原因说明。

3.1.2 上下文初始化

系统初始化一个结构化的决策上下文，该上下文将作为整个决策过程的数据载体。它包含原始请求信息、各个代理的检查结果集合、最终决策状态以及决策原因列表。初始状态下，决策状态设置为待处理，等待后续检查结果的填充。

3.2 阶段二：多代理并行检查执行

3.2.1 并行调用策略

系统采用并行执行策略，同时向三个专业代理服务发起检查请求。这种并行处理方式显著减少了总体响应时间，提高了系统效率。每个代理服务都运行在独立的端口上，具有专门的功能领域。

3.2.2 天气代理检查流程

3.2.2.1 服务发现与连接

系统首先通过标准化的服务发现机制定位天气代理服务。通过访问预定义的服务描述端点，获取天气代理的能力描述和接口规范，确保调用的准确性和兼容性。

3.2.2.2 天气数据查询

向天气代理提交包含目标日期和位置的查询请求。天气代理接收到请求后，在其内部天气数据库中检索指定日期的详细天气信息，包括温度、天气状况、湿度、风速、降水概率等多个维度的数据。

3.2.2.3 天气适宜性分析

天气代理不仅返回原始天气数据，还进行专业的适宜性分析。通过分析温度范围、降水情况、风速等因素，计算得出篮球活动的天气适宜性评分，识别潜在的风险因素，并生成具体的活动建议。

3.2.3 场地代理检查流程

3.2.3.1 场地状态验证

系统向场地代理查询指定日期和场地类型的可用性状态。场地代理检查其管理的场地数据库，验证目标场地在请求时间段内是否可用，是否存在预定冲突或维护安排。

3.2.3.2 场地详情获取

除了基本的可用性状态，场地代理还提供场地的详细信息，包括场地名称、容纳人数、设施配置、收费标准等。这些信息有助于了解场地的具体条件。

3.2.3.3 冲突检测处理

如果检测到场地冲突，场地代理会明确说明冲突类型（已被占用、维护中、已被预订等），为后续决策提供充分的依据。

3.2.4 日历代理检查流程

3.2.4.1 参与者时间冲突检测

日历代理接收参与者列表和目标日期，逐个检查每位参与者的个人日历安排。通过比对请求时间段与参与者已有日程，识别是否存在时间冲突。

3.2.4.5 可用性统计分析

日历代理统计可用参与者的数量，计算总体可用率，并分析关键参与者的可用情况。这些统计信息为会议安排决策提供重要参考。

3.2.4.6 冲突详情报告

对于存在时间冲突的参与者，日历代理提供详细的冲突事件信息，包括冲突事件的标题、时间范围和优先级，帮助理解冲突的性质和严重程度。

3.3 阶段三：检查结果聚合与智能决策

3.3.1 结果收集与整合

系统等待所有并行检查完成，收集各个代理返回的检查结果。将这些结果统一整合到决策上下文中，形成完整的检查结果数据集。

3.3.2 分级决策逻辑执行

系统按照预设的优先级顺序执行决策逻辑：

3.3.2.1 第一级：安全条件检查

首先评估天气条件的安全性。系统检查天气状况中是否包含雨、雪、雷暴、大风等不利于户外篮球活动的因素。如果检测到恶劣天气条件，立即做出取消决策，并记录具体的天气原因。

3.3.2.2 第二级：资源条件检查

如果天气条件通过，接着检查场地可用性。验证请求的场地在目标时间段内是否处于可用状态。如果场地不可用，做出取消决策，并说明具体的场地状态原因。

3.3.2.3 第三级：人员条件检查

如果前两级检查都通过，最后评估参与者可用性。检查可用参与者比例是否达到预设阈值（如60%）。如果参与率不足，做出取消决策，并报告具体的参与率数据。

3.3.3 最终确认决策

只有当所有三级检查都满足条件时，系统才做出会议确认的最终决策。

3.4 阶段四：通知处理与确认

3.4.1 条件性通知触发

仅当会议获得确认时，系统才会触发通知流程。这种条件性执行避免了不必要的通知发送，提高了系统效率。

3.4.2 通知代理调用

系统向通知代理发送会议确认通知请求，包含所有收件人列表、通知类型以及完整的会议决策数据。通知代理根据通知类型选择相应的模板，填充具体的会议信息。

3.4.3 多通道通知发送

通知代理通过配置的通信通道（如邮件、短信等）向所有参与者发送格式化的会议确认通知。通知内容包含会议详情、天气信息、场地信息和参与建议等。

3.4.4 通知结果记录

通知代理记录每次通知发送的详细结果，包括发送时间、接收者列表、发送状态等信息，这些信息被返回并记录在决策上下文中。

3.5 阶段五：最终响应生成与返回

3.5.1 结果格式化处理

系统将决策上下文中的所有信息整合生成标准化的响应格式。响应中包含系统生成的唯一会议标识符、最终决策状态、决策时间戳、决策原因说明、详细的检查结果汇总以及针对性的活动建议。

3.5.2 智能建议生成

根据最终的决策状态和具体的检查结果，系统生成个性化的建议信息。对于确认的会议，提供天气适应的活动建议；对于取消的会议，根据取消原因提供改期或调整的替代方案。

3.5.3 完整响应返回

将格式化后的最终响应返回给客户端，完成整个会议安排决策流程。客户端获得包含所有决策依据和详细信息的完整响应，便于用户理解系统决策并采取相应行动。

4. 启动说明

要运行完整的系统，需要在不同的终端中分别启动这四个服务：

# 终端1 - WeatherAgent

python WeatherAgent.py

# 终端2 - VenueAgent  

python VenueAgent.py

# 终端3 - NotificationAgent

python NotificationAgent.py

# 终端4 - CalendarAgent

python CalendarAgent.py

# 终端5 - 运行测试客户端

python MultiAgent2.py

每个Agent都提供了完整的REST API接口，支持服务发现、任务处理和健康检查，共同构成了一个完整的分布式智能代理系统。

5. 示例参考

1. WeatherAgent示例：

from fastapi import FastAPI, HTTPException
from datetime import date
from pydantic import BaseModel
import uvicorn
from enum import Enum
from typing import Dict, Optional
app = FastAPI(title="WeatherAgent", version="1.0.0")
class WeatherCondition(str, Enum):
    SUNNY = "晴"
    CLOUDY = "多云"
    RAIN = "雨"
    SNOW = "雪"
    THUNDERSTORM = "雷阵雨"
    LIGHT_RAIN = "小雨"
    CLEAR = "晴转多云"
class WeatherTaskRequest(BaseModel):
    task_id: str
    agent_type: str
    timestamp: str
    params: dict
# 详细的天气数据库
weather_db = {
    "2025-05-08": {
        "temperature": "25℃", 
        "condition": WeatherCondition.THUNDERSTORM,
        "humidity": "85%",
        "wind_speed": "15km/h",
        "precipitation_probability": "90%",
        "uv_index": "2",
        "air_quality": "良"
    },
    "2025-05-09": {
        "temperature": "18℃", 
        "condition": WeatherCondition.LIGHT_RAIN,
        "humidity": "78%",
        "wind_speed": "12km/h",
        "precipitation_probability": "60%",
        "uv_index": "1",
        "air_quality": "优"
    },
    "2025-05-10": {
        "temperature": "22℃", 
        "condition": WeatherCondition.CLEAR,
        "humidity": "65%",
        "wind_speed": "8km/h",
        "precipitation_probability": "10%",
        "uv_index": "5",
        "air_quality": "优"
    },
    "2025-05-11": {
        "temperature": "28℃", 
        "condition": WeatherCondition.SUNNY,
        "humidity": "55%",
        "wind_speed": "6km/h",
        "precipitation_probability": "5%",
        "uv_index": "8",
        "air_quality": "良"
    }
}
# 智能天气分析
class WeatherAnalyzer:
    @staticmethod
    def analyze_weather_suitability(weather_data: dict, activity_type: str = "basketball") -> dict:
        """分析天气对活动的适宜性"""
        score = 100
        # 温度适宜性 (15-30度最佳)
        temp = int(weather_data["temperature"].replace("℃", ""))
        if 15 <= temp <= 30:
            temp_score = 100
        elif 10 <= temp < 15 or 30 < temp <= 35:
            temp_score = 70
        else:
            temp_score = 30
        score = score * 0.3 + temp_score * 0.7
        # 降水影响
        if "雨" in weather_data["condition"] or "雪" in weather_data["condition"]:
            score *= 0.3
        elif weather_data["precipitation_probability"] > "50%":
            score *= 0.7
        # 风速影响
        wind_speed = int(weather_data["wind_speed"].replace("km/h", ""))
        if wind_speed > 20:
            score *= 0.5
        elif wind_speed > 15:
            score *= 0.8
        return {
            "suitability_score": round(score),
            "recommendation": "适宜进行" if score >= 70 else "不适宜进行",
            "risk_factors": WeatherAnalyzer._identify_risk_factors(weather_data)
        }
    @staticmethod
    def _identify_risk_factors(weather_data: dict) -> list:
        """识别天气风险因素"""
        risks = []
        if "雨" in weather_data["condition"]:
            risks.append("地面湿滑")
        if "雷" in weather_data["condition"]:
            risks.append("雷电危险")
        if int(weather_data["temperature"].replace("℃", "")) > 30:
            risks.append("高温中暑风险")
        if int(weather_data["wind_speed"].replace("km/h", "")) > 15:
            risks.append("大风影响")
        return risks
WEATHER_AGENT_CARD = {
    "name": "WeatherAgent",
    "version": "2.0.0",
    "description": "提供详细的天气数据查询和分析服务",
    "endpoints": {
        "task_submit": "/api/tasks/weather",
        "health_check": "/health"
    },
    "input_schema": {
        "type": "object",
        "properties": {
            "date": {"type": "string", "format": "date", "description": "查询日期"},
            "location": {"type": "string", "description": "地理位置"},
            "detailed": {"type": "boolean", "description": "是否返回详细分析"}
        },
        "required": ["date"]
    },
    "capabilities": {
        "weather_forecast": True,
        "suitability_analysis": True,
        "risk_assessment": True
    },
    "authentication": {"methods": ["API_Key"]}
}
@app.get("/.well-known/agent.json")
async def get_agent_card():
    return WEATHER_AGENT_CARD
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "WeatherAgent"}
@app.post("/api/tasks/weather")
async def handle_weather_task(request: WeatherTaskRequest):
    """处理天气查询任务"""
    target_date = request.params.get("date")
    location = request.params.get("location", "北京")
    detailed = request.params.get("detailed", False)
    # 参数验证
    if not target_date:
        raise HTTPException(status_code=400, detail="缺少日期参数")
    if target_date not in weather_db:
        # 模拟未来日期的天气预测
        simulated_weather = {
            "temperature": "23℃",
            "condition": WeatherCondition.CLOUDY,
            "humidity": "70%",
            "wind_speed": "10km/h",
            "precipitation_probability": "30%",
            "uv_index": "4",
            "air_quality": "良"
        }
        weather_data = simulated_weather
    else:
        weather_data = weather_db[target_date]
    # 构建响应
    response = {
        "task_id": request.task_id,
        "status": "completed",
        "artifact": {
            "date": target_date,
            "location": location,
            "weather": weather_data
        }
    }
    # 如果请求详细分析，添加适宜性分析
    if detailed:
        analysis = WeatherAnalyzer.analyze_weather_suitability(weather_data)
        response["artifact"]["analysis"] = analysis
    return response
@app.get("/api/weather/history")
async def get_weather_history(days: int = 7):
    """获取历史天气数据（模拟）"""
    return {
        "historical_data": weather_db,
        "summary": {
            "total_days": len(weather_db),
            "rainy_days": len([w for w in weather_db.values() if "雨" in w["condition"]])
        }
    }
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")

2. VenueAgent示例：

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
from datetime import datetime, timedelta
from enum import Enum
from typing import Dict, List
import uuid
app = FastAPI(title="VenueAgent", version="1.0.0")
class VenueStatus(str, Enum):
    AVAILABLE = "available"
    OCCUPIED = "occupied"
    MAINTENANCE = "maintenance"
    RESERVED = "reserved"
class SportType(str, Enum):
    BASKETBALL = "basketball"
    FOOTBALL = "football"
    TENNIS = "tennis"
    SWIMMING = "swimming"
class VenueTaskRequest(BaseModel):
    task_id: str
    agent_type: str
    timestamp: str
    params: dict
# 场地数据库
venue_db = {
    "basketball": {
        "outdoor": {
            "2025-05-08": VenueStatus.AVAILABLE,
            "2025-05-09": VenueStatus.MAINTENANCE,
            "2025-05-10": VenueStatus.AVAILABLE,
            "2025-05-11": VenueStatus.RESERVED
        },
        "indoor": {
            "2025-05-08": VenueStatus.OCCUPIED,
            "2025-05-09": VenueStatus.AVAILABLE,
            "2025-05-10": VenueStatus.AVAILABLE,
            "2025-05-11": VenueStatus.AVAILABLE
        }
    },
    "football": {
        "outdoor": {
            "2025-05-08": VenueStatus.AVAILABLE,
            "2025-05-09": VenueStatus.AVAILABLE
        }
    }
}
# 场地详细信息
venue_details = {
    "basketball_outdoor": {
        "name": "室外篮球场A区",
        "capacity": 20,
        "facilities": ["灯光", "休息区", "饮水机"],
        "hourly_rate": 50,
        "location": "体育馆东侧"
    },
    "basketball_indoor": {
        "name": "室内篮球馆主场地",
        "capacity": 50,
        "facilities": ["空调", "更衣室", "淋浴间", "专业地板"],
        "hourly_rate": 150,
        "location": "体育馆主馆"
    }
}
class VenueManager:
    @staticmethod
    def check_availability(sport_type: str, venue_type: str, date: str) -> Dict:
        """检查场地可用性"""
        if sport_type not in venue_db:
            return {
                "status": VenueStatus.OCCUPIED,
                "message": "不支持的体育类型"
            }
        if venue_type not in venue_db[sport_type]:
            return {
                "status": VenueStatus.OCCUPIED,
                "message": "不支持的场地类型"
            }
        date_availability = venue_db[sport_type][venue_type]
        if date in date_availability:
            status = date_availability[date]
            message = VenueManager._get_status_message(status)
        else:
            status = VenueStatus.AVAILABLE
            message = "场地可用"
        return {
            "status": status,
            "message": message,
            "details": venue_details.get(f"{sport_type}_{venue_type}", {})
        }
    @staticmethod
    def _get_status_message(status: VenueStatus) -> str:
        messages = {
            VenueStatus.AVAILABLE: "场地可用",
            VenueStatus.OCCUPIED: "场地已被占用",
            VenueStatus.MAINTENANCE: "场地维护中",
            VenueStatus.RESERVED: "场地已被预订"
        }
        return messages.get(status, "场地状态未知")
    @staticmethod
    def reserve_venue(sport_type: str, venue_type: str, date: str, duration: int) -> Dict:
        """预订场地"""
        availability = VenueManager.check_availability(sport_type, venue_type, date)
        if availability["status"] != VenueStatus.AVAILABLE:
            return {
                "success": False,
                "message": f"无法预订: {availability['message']}",
                "reservation_id": None
            }
        # 模拟预订过程
        reservation_id = str(uuid.uuid4())[:8]
        venue_db[sport_type][venue_type][date] = VenueStatus.RESERVED
        return {
            "success": True,
            "message": "预订成功",
            "reservation_id": reservation_id,
            "details": availability["details"]
        }
VENUE_AGENT_CARD = {
    "name": "VenueAgent",
    "version": "1.0.0",
    "description": "提供场地管理和预订服务",
    "endpoints": {
        "task_submit": "/api/tasks/venue/check",
        "reservation": "/api/tasks/venue/reserve",
        "health_check": "/health"
    },
    "input_schema": {
        "type": "object",
        "properties": {
            "date": {"type": "string", "format": "date"},
            "venue_type": {"type": "string", "enum": ["outdoor", "indoor"]},
            "sport_type": {"type": "string", "enum": ["basketball", "football", "tennis"]}
        },
        "required": ["date", "venue_type"]
    },
    "capabilities": {
        "availability_check": True,
        "reservation_management": True,
        "venue_information": True
    },
    "authentication": {"methods": ["API_Key"]}
}
@app.get("/.well-known/agent.json")
async def get_agent_card():
    return VENUE_AGENT_CARD
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "VenueAgent"}
@app.post("/api/tasks/venue/check")
async def check_venue_availability(request: VenueTaskRequest):
    """检查场地可用性"""
    date = request.params.get("date")
    venue_type = request.params.get("venue_type")
    sport_type = request.params.get("sport_type", "basketball")
    if not date or not venue_type:
        raise HTTPException(status_code=400, detail="缺少必要参数")
    availability = VenueManager.check_availability(sport_type, venue_type, date)
    return {
        "task_id": request.task_id,
        "status": "completed",
        "artifact": {
            "date": date,
            "venue_type": venue_type,
            "sport_type": sport_type,
            "status": availability["status"],
            "message": availability["message"],
            "details": availability["details"]
        }
    }
@app.post("/api/tasks/venue/reserve")
async def reserve_venue(request: VenueTaskRequest):
    """预订场地"""
    date = request.params.get("date")
    venue_type = request.params.get("venue_type")
    sport_type = request.params.get("sport_type", "basketball")
    duration = request.params.get("duration", 2)
    if not date or not venue_type:
        raise HTTPException(status_code=400, detail="缺少必要参数")
    reservation_result = VenueManager.reserve_venue(sport_type, venue_type, date, duration)
    return {
        "task_id": request.task_id,
        "status": "completed",
        "artifact": reservation_result
    }
@app.get("/api/venue/types")
async def get_venue_types(sport_type: str = "basketball"):
    """获取可用的场地类型"""
    if sport_type in venue_db:
        return {
            "sport_type": sport_type,
            "available_venue_types": list(venue_db[sport_type].keys()),
            "details": {f"{sport_type}_{vt}": venue_details.get(f"{sport_type}_{vt}") 
                       for vt in venue_db[sport_type].keys()}
        }
    else:
        raise HTTPException(status_code=404, detail="不支持的体育类型")
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001, log_level="info")

3. MultiAgent2示例：

import requests
import uuid
from enum import Enum
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel
# 枚举定义
class MeetingStatus(str, Enum):
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    PENDING = "pending"
    ERROR = "error"
class VenueStatus(str, Enum):
    AVAILABLE = "available"
    OCCUPIED = "occupied"
    MAINTENANCE = "maintenance"
# 数据模型
class Participant(BaseModel):
    name: str
    email: str
    availability: bool = True
class MeetingRequest(BaseModel):
    date: str
    duration_hours: int = 2
    participants: List[Participant] = []
    venue_type: str = "outdoor"  # outdoor or indoor
# 扩展的篮球代理系统
class AdvancedBasketBallAgent:
    def __init__(self):
        # 多个代理服务的配置
        self.agents = {
            "weather": {"url": "http://localhost:8000", "api_key": "WEATHER_KEY"},
            "venue": {"url": "http://localhost:8001", "api_key": "VENUE_KEY"},
            "notification": {"url": "http://localhost:8002", "api_key": "NOTIFY_KEY"},
            "calendar": {"url": "http://localhost:8003", "api_key": "CALENDAR_KEY"}
        }
    def _create_task(self, agent_type: str, params: dict) -> dict:
        """创建标准任务对象"""
        return {
            "task_id": str(uuid.uuid4()),
            "agent_type": agent_type,
            "timestamp": datetime.now().isoformat(),
            "params": params
        }
    def _call_agent(self, agent_name: str, endpoint: str, task: dict) -> dict:
        """通用代理调用方法"""
        agent_config = self.agents[agent_name]
        try:
            # 动态发现代理能力
            agent_card_url = f"{agent_config['url']}/.well-known/agent.json"
            agent_card = requests.get(agent_card_url, timeout=5).json()
            # 调用具体端点
            response = requests.post(
                f"{agent_config['url']}{endpoint}",
                json=task,
                headers={"Authorization": f"Bearer {agent_config['api_key']}"},
                timeout=10
            )
            if response.status_code == 200:
                return response.json()
            else:
                raise Exception(f"Agent {agent_name} 调用失败: {response.text}")
        except requests.exceptions.RequestException as e:
            raise Exception(f"Agent {agent_name} 连接失败: {str(e)}")
    # 天气代理调用
    def check_weather(self, date: str, location: str = "北京") -> dict:
        """查询天气情况"""
        task = self._create_task("weather", {
            "date": date,
            "location": location,
            "detailed": True  # 请求详细天气信息
        })
        return self._call_agent("weather", "/api/tasks/weather", task)
    # 场地代理调用
    def check_venue_availability(self, date: str, venue_type: str = "outdoor") -> dict:
        """检查场地可用性"""
        task = self._create_task("venue", {
            "date": date,
            "venue_type": venue_type,
            "sport_type": "basketball"
        })
        return self._call_agent("venue", "/api/tasks/venue/check", task)
    # 日历代理调用
    def check_participant_availability(self, date: str, participants: List[Participant]) -> dict:
        """检查参与者时间安排"""
        task = self._create_task("calendar", {
            "date": date,
            "participants": [p.dict() for p in participants],
            "event_type": "basketball_meeting"
        })
        return self._call_agent("calendar", "/api/tasks/calendar/check", task)
    # 通知代理调用
    def send_notification(self, meeting_data: dict, recipients: List[str]) -> dict:
        """发送会议通知"""
        task = self._create_task("notification", {
            "meeting_data": meeting_data,
            "recipients": recipients,
            "notification_type": "meeting_confirmation"
        })
        return self._call_agent("notification", "/api/tasks/notification/send", task)
    # 综合决策引擎
    def schedule_advanced_meeting(self, meeting_request: MeetingRequest) -> dict:
        """高级会议安排决策"""
        decision_context = {
            "request": meeting_request.dict(),
            "checks": {},
            "final_decision": MeetingStatus.PENDING,
            "reasons": []
        }
        try:
            # 1. 检查天气条件
            weather_result = self.check_weather(meeting_request.date)
            decision_context["checks"]["weather"] = weather_result
            weather_condition = weather_result["artifact"]["weather"]["condition"]
            if any(bad_weather in weather_condition for bad_weather in ["雨", "雪", "雷暴", "大风"]):
                decision_context["final_decision"] = MeetingStatus.CANCELLED
                decision_context["reasons"].append(f"恶劣天气: {weather_condition}")
                return self._format_decision(decision_context)
            # 2. 检查场地可用性
            venue_result = self.check_venue_availability(
                meeting_request.date, 
                meeting_request.venue_type
            )
            decision_context["checks"]["venue"] = venue_result
            if venue_result["artifact"]["status"] != VenueStatus.AVAILABLE:
                decision_context["final_decision"] = MeetingStatus.CANCELLED
                decision_context["reasons"].append(
                    f"场地不可用: {venue_result['artifact']['status']}"
                )
                return self._format_decision(decision_context)
            # 3. 检查参与者时间
            if meeting_request.participants:
                calendar_result = self.check_participant_availability(
                    meeting_request.date, 
                    meeting_request.participants
                )
                decision_context["checks"]["calendar"] = calendar_result
                available_count = calendar_result["artifact"]["available_count"]
                total_count = calendar_result["artifact"]["total_count"]
                if available_count < total_count * 0.6:  # 至少60%参与者可用
                    decision_context["final_decision"] = MeetingStatus.CANCELLED
                    decision_context["reasons"].append(
                        f"参与者可用率不足: {available_count}/{total_count}"
                    )
                    return self._format_decision(decision_context)
            # 4. 所有检查通过，确认会议
            decision_context["final_decision"] = MeetingStatus.CONFIRMED
            decision_context["reasons"].append("所有条件满足，会议确认")
            # 5. 发送通知
            if decision_context["final_decision"] == MeetingStatus.CONFIRMED:
                recipient_emails = [p.email for p in meeting_request.participants]
                notification_result = self.send_notification(
                    decision_context, 
                    recipient_emails
                )
                decision_context["checks"]["notification"] = notification_result
            return self._format_decision(decision_context)
        except Exception as e:
            decision_context["final_decision"] = MeetingStatus.ERROR
            decision_context["reasons"].append(f"系统错误: {str(e)}")
            return self._format_decision(decision_context)
    def _format_decision(self, context: dict) -> dict:
        """格式化决策结果"""
        return {
            "meeting_id": str(uuid.uuid4()),
            "status": context["final_decision"],
            "decision_time": datetime.now().isoformat(),
            "reasons": context["reasons"],
            "detailed_checks": context["checks"],
            "recommendation": self._generate_recommendation(context)
        }
    def _generate_recommendation(self, context: dict) -> str:
        """生成智能推荐"""
        status = context["final_decision"]
        if status == MeetingStatus.CONFIRMED:
            weather = context["checks"]["weather"]["artifact"]["weather"]
            return f"会议确认！预计天气：{weather['condition']}，温度：{weather['temperature']}，建议穿着运动服装。"
        elif status == MeetingStatus.CANCELLED:
            reasons = context["reasons"]
            if "天气" in str(reasons):
                return "由于天气原因取消，建议改为室内场地或改期举行。"
            elif "场地" in str(reasons):
                return "场地不可用，建议选择其他场地或时间。"
            else:
                return "会议取消，请重新安排时间。"
        else:
            return "无法确定会议状态，请手动检查。"
# 模拟的其他代理服务实现
class VenueAgent:
    """场地管理代理"""
    def __init__(self):
        self.venue_db = {
            "2025-05-08": {"outdoor": VenueStatus.AVAILABLE, "indoor": VenueStatus.OCCUPIED},
            "2025-05-09": {"outdoor": VenueStatus.MAINTENANCE, "indoor": VenueStatus.AVAILABLE},
            "2025-05-10": {"outdoor": VenueStatus.AVAILABLE, "indoor": VenueStatus.AVAILABLE},
        }
    def check_availability(self, task_request: dict) -> dict:
        date = task_request["params"]["date"]
        venue_type = task_request["params"]["venue_type"]
        if date in self.venue_db and venue_type in self.venue_db[date]:
            return {
                "task_id": task_request["task_id"],
                "status": "completed",
                "artifact": {
                    "date": date,
                    "venue_type": venue_type,
                    "status": self.venue_db[date][venue_type],
                    "message": f"{venue_type}场地状态查询完成"
                }
            }
        else:
            return {
                "task_id": task_request["task_id"],
                "status": "completed",
                "artifact": {
                    "date": date,
                    "venue_type": venue_type,
                    "status": VenueStatus.OCCUPIED,
                    "message": "未找到场地信息，默认不可用"
                }
            }
class CalendarAgent:
    """日历管理代理"""
    def __init__(self):
        self.user_calendars = {
            "alice@example.com": ["2025-05-08", "2025-05-09"],  # 这些日期忙碌
            "bob@example.com": ["2025-05-09"],
            "charlie@example.com": [],  # 所有日期都可用
        }
    def check_availability(self, task_request: dict) -> dict:
        date = task_request["params"]["date"]
        participants = task_request["params"]["participants"]
        available_count = 0
        availability_details = {}
        for participant in participants:
            email = participant["email"]
            is_available = date not in self.user_calendars.get(email, [])
            availability_details[email] = {
                "available": is_available,
                "name": participant["name"]
            }
            if is_available:
                available_count += 1
        return {
            "task_id": task_request["task_id"],
            "status": "completed",
            "artifact": {
                "date": date,
                "available_count": available_count,
                "total_count": len(participants),
                "availability_rate": available_count / len(participants) if participants else 0,
                "details": availability_details
            }
        }
class NotificationAgent:
    """通知代理"""
    def send_notification(self, task_request: dict) -> dict:
        meeting_data = task_request["params"]["meeting_data"]
        recipients = task_request["params"]["recipients"]
        # 模拟发送通知
        notification_result = {
            "sent_to": recipients,
            "meeting_status": meeting_data["final_decision"],
            "notification_id": str(uuid.uuid4()),
            "timestamp": datetime.now().isoformat()
        }
        return {
            "task_id": task_request["task_id"],
            "status": "completed",
            "artifact": notification_result
        }
# 使用示例和测试
def demo_advanced_system():
    """演示高级系统功能"""
    print("=== 高级篮球会议安排系统演示 ===\n")
    # 创建代理实例
    meeting_agent = AdvancedBasketBallAgent()
    # 测试场景1: 理想情况 - 所有条件满足
    print("场景1: 理想情况")
    ideal_request = MeetingRequest(
        date="2025-05-10",
        participants=[
            Participant(name="Alice", email="alice@example.com"),
            Participant(name="Bob", email="bob@example.com"),
            Participant(name="Charlie", email="charlie@example.com")
        ],
        venue_type="outdoor"
    )
    result1 = meeting_agent.schedule_advanced_meeting(ideal_request)
    print(f"结果: {result1['status']}")
    print(f"推荐: {result1['recommendation']}\n")
    # 测试场景2: 恶劣天气
    print("场景2: 恶劣天气")
    bad_weather_request = MeetingRequest(
        date="2025-05-08",  # 雷阵雨
        participants=[
            Participant(name="Alice", email="alice@example.com"),
            Participant(name="Bob", email="bob@example.com")
        ]
    )
    result2 = meeting_agent.schedule_advanced_meeting(bad_weather_request)
    print(f"结果: {result2['status']}")
    print(f"原因: {result2['reasons']}")
    print(f"推荐: {result2['recommendation']}\n")
    # 测试场景3: 场地维护
    print("场景3: 场地维护")
    venue_issue_request = MeetingRequest(
        date="2025-05-09",  # 户外场地维护
        participants=[
            Participant(name="Alice", email="alice@example.com"),
            Participant(name="Charlie", email="charlie@example.com")
        ]
    )
    result3 = meeting_agent.schedule_advanced_meeting(venue_issue_request)
    print(f"结果: {result3['status']}")
    print(f"原因: {result3['reasons']}")
    print(f"推荐: {result3['recommendation']}\n")
if __name__ == "__main__":
    demo_advanced_system()

6. 系统特性体现

高效并行处理：通过同时执行多个代理检查，显著优化了系统响应时间。

分级决策机制：按照安全、资源、人员的优先级顺序执行决策，确保关键因素优先考虑。

条件性操作执行：通知等后续操作仅在特定决策条件下触发，避免不必要的资源消耗。

完整溯源能力：通过详细的检查结果记录和决策原因说明，提供完整的决策过程溯源。

弹性容错设计：单个代理服务的故障不会导致整个系统崩溃，具备优雅降级能力。

五、总结

从简单的天气查询代理到复杂的多代理协同决策系统，我们见证了A2A智能代理协议如何重塑分布式人工智能的架构范式。这个演进过程不仅仅是技术栈的升级，更是思维模式的根本转变——从追求单体智能的极致性能转向构建智能体间的协同生态。

通过篮球会议安排系统的完整示例，我们看到了A2A协议的核心价值：标准化的服务发现机制让代理能够自主识别彼此能力，语义化的任务描述确保跨系统的准确理解，自治性的决策逻辑使每个代理都能发挥专业优势。这种架构带来的不仅是技术上的松耦合和可扩展性，更是业务层面的敏捷响应和智能升级。

更重要的是，这个系统展现了分布式智能的乘法效应：单个代理或许只能解决特定领域的问题，但当它们通过A2A协议协同工作时，产生的集体智能远远超出各部分能力的简单叠加。天气代理的专业预报、场地代理的资源管理、日历代理的时间协调、通知代理的沟通触达——每个代理专注本职，却共同完成了一个需要多维度考量的复杂决策。

---
*导入时间: 2026-01-17 22:25:26*
