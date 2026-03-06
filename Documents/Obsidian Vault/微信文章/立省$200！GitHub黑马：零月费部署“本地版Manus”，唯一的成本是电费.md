---
title: "立省$200！GitHub黑马：零月费部署“本地版Manus”，唯一的成本是电费"
source: wechat
url: https://mp.weixin.qq.com/s/Zbg9rSv1rfVf_MdLTnVI6w
author: AIMCP
pub_date: 2025年12月20日 07:33
created: 2026-01-17 20:26
tags: [AI, 编程]
---

# 立省$200！GitHub黑马：零月费部署“本地版Manus”，唯一的成本是电费

> 作者: AIMCP | 发布日期: 2025年12月20日 07:33
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/Zbg9rSv1rfVf_MdLTnVI6w)

---

大家好，我是 AIMCP。

最近后台常被问到："Manus 的月费值不值？把代码扔给云端 Agent 怕不怕泄露？"——一句话， 想玩 AI Agent，要么钱包出血，要么隐私风险不易评估 。今天实测的 AgenticSeek 主打“本地自治”，订阅成本为零，主要支出为本地算力耗电与硬件折旧。

项目地址： https://github.com/Fosowl/agenticSeek 核验方法：仓库所有者 Fosowl，近期活跃（以当日数据为准）；Demo 中的 CV_candidates.zip 为虚构示例，仅用于功能演示。

痛点直击：它到底解决了什么？

传统本地 LLM 对话： 你问：“怎么写贪吃蛇？” 它答：“给你一段代码，自己去贴吧。”

AgenticSeek 工作流： 你下令：“写个贪吃蛇” → 思考拆解 → 联网查最新文档 → 写代码 → 运行报错 → 自查修复 → 交付可执行文件

区别就是“自主闭环”：从 Chat 到 Work，不再只给答案，直接交付可运行结果。

“空口无凭，直接看它如何自动筛选简历 👇”

视频加载失败，请刷新页面再试

 刷新
实战三板斧：带日志的任务实录
Thinks（思考链） ：先拆任务，再分配工具，避免“瞎忙”。
Browses（联网检索） ：本地模型知识截止？它直接搜最新文档，解决幻觉。
Codes（生成+自测） ：输出可运行文件，出错会反复调试，直到跑通。
 
下面给出真实日志（macOS 14 + Ollama 0.3.6 + deepseek-r1:14b，显存峰值 11.8 GB，耗时 4′12″）：
[Agent] 任务：写一个 Python 贪吃蛇
[Planner] 步骤 1/4：搜索“pygame snake example 2025”
[Browser] 返回 3 条相关源码
[Coder] 生成 snake_game.py（287 行）
[Executor] 首次运行 → ModuleNotFoundError: No module named 'pygame'
[Agent] 自动修复：写入 requirements.txt && pip install -r requirements.txt
[Executor] 再次运行 → 正常启动窗口，帧率 60 FPS
[Agent] 任务完成，输出文件：./snake_game.py


全程零人工干预，CPU 峰值 78 %，风扇高速 2 分钟左右；联网抓取 3 份源码，最终可执行文件 287 行，自检修复 1 次即通过。

另外，混合模式也可选用

本地硬件不够？官方支持“小模型本地+大模型 API”混跑：简单任务用 7B/14B，复杂推理切到云端，既省显存又保护隐私。如需云端能力，在 .env 中配置相应 API Key/提供者；不配置则默认本地。

上手清单：环境 & 硬件真相

关键配置示例（ .env ）：

SEARXNG_BASE_URL="http://searxng:8080"
REDIS_BASE_URL="redis://redis:6379/0"
WORK_DIR="/Users/yourname/ai_workspace"
OLLAMA_PORT="11434"


本地提供者启动：

export OLLAMA_HOST=0.0.0.0:11434
ollama serve


项目仍在积极开发（WIP），版本迭代可能带来接口变动，请锁定 Release 页面变更日志。

结论 & 行动号召

AgenticSeek 让“个人 AI 员工”第一次离普通开发者这么近：无需云端 API 也能跑，隐私数据留在本地，出错会自己修，直到交付可用代码。它不完美，但方向清晰——让 AI 真正替你干活，而不是让你为 API 账单打工。

如果你已被订阅费折磨够呛，或对数据隐私有执念，这个项目值得一试。订阅成本为零，主要支出为本地算力耗电与硬件折旧。

想看更多硬核的 AI 部署实战？ 点击上方话题 #AIMCP·Model 订阅合集，或直接关注 【AIMCP】，不讲废话，只推能落地的效率神器。

Github 项目仓库： https://github.com/Fosowl/agenticSeek

---
*导入时间: 2026-01-17 20:26:28*
