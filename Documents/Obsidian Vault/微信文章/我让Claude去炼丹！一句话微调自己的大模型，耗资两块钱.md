---
title: "我让Claude去炼丹！一句话微调自己的大模型，耗资两块钱"
source: wechat
url: https://mp.weixin.qq.com/s/jb6VVjgazDkXDuuGhjim5w
author: 云中AI
pub_date: 2025年12月13日 12:00
created: 2026-01-17 20:32
tags: [AI, 编程]
---

# 我让Claude去炼丹！一句话微调自己的大模型，耗资两块钱

> 作者: 云中AI | 发布日期: 2025年12月13日 12:00
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/jb6VVjgazDkXDuuGhjim5w)

---

一句自然语言指令，价值三毛钱（$）的GPU时间，一个专属于你的微调模型。




“Fine-tune Qwen3-0.6B on the dataset open-r1/codeforces-cots.”

在Claude Code里敲下这行字，然后按下回车。

大概20分钟后，你的模型训练完成，安静地躺在Hugging Face Hub上。总成本：约0.3美元。

——让 AI 来训练 AI，至少听起来有点科幻感了。

01 世上无难事，交给大模型

如果你尝试过微调一个大语言模型，一定经历过这个标准流程：

研究文档、配置环境、编写训练脚本、处理数据集格式、选择超参数、监控训练过程……

每一步都是技术门槛。

不过最近Hugging Face推出了Skills工具链：

现在最不缺的就是大模型，你不干，有的是大模型干

它本质上是一套打包的指令、脚本和领域知识，让像Claude这样的编码智能体能够“理解”如何训练模型。

这个名为 hf-llm-trainer 的技能，教给了Claude关于微调的一切：

根据你的模型大小选择哪种GPU

如何配置Hub身份验证

何时使用LoRA

如何配置监控

如何处理训练中的几十个其他决策

Claude不再只是编写脚本，而是能够实际提交任务到云端GPU、监控进度，并将训练完成的模型推送到Hugging Face Hub。

02 准备工作

开始之前，你需要准备几样东西：

一个Hugging Face账户（需要Pro或Team/Enterprise计划，因为Jobs功能需要付费）——要花钱的事说在前头，这算一个隐形成本

一个有写入权限的Token（从huggingface.co/settings/tokens获取）

一个编码智能体：Claude Code、OpenAI Codex或Google的Gemini CLI

智能体具体安装过程因平台而异：

Claude Code：将仓库添加为市场插件后，安装技能：/plugin install hf-llm-trainer@huggingface-skills

Codex：通过AGENTS.md文件自动识别技能

Gemini CLI：通过gemini extensions install命令本地安装

连接Hugging Face，你需要用写入Token进行身份验证，这样任务才能有权限在Hub上创建模型仓库。

一切就绪，启动！

03 流程实战

让我们走一遍完整的例子：用最简单的指令，微调一个小模型。

对Claude说：“Fine-tune Qwen3-0.6B on the open-r1/codeforces-cots dataset for instruction following.”

Claude开始分析这个请求：

它识别出我们要微调的模型是Qwen/Qwen3-0.6B，数据集是open-r1/codeforces-cots（编程问题与解决方案的数据集，适合用于指令调优）。

对于一个0.6B的模型和一个演示数据集，它自动选择了t4-small——足够这个模型大小，也是最便宜的选择。

在提交任何任务之前，Claude会向我们展示配置：

I‘ll fine-tune Qwen/Qwen3-0.6B on open-r1/codeforces-cots using SFT.
Configuration:
- Hardware: t4-small (~$0.75/hour)
- Estimated time: ~20 minutes
- Estimated cost: ~$0.30
- Output: username/qwen-codeforces-cots-sft
The model will be pushed to Hub automatically. Should I submit?




这时候我们可以进行调整：改变输出仓库名称、选择不同的硬件，或者让Claude修改训练参数。批准后，智能体才会提交任务。

然后，我们会立刻获得了任务详情：

✅ Job submitted successfully!
Job ID: abc123xyz
Monitor: https://huggingface.co/jobs/username/abc123xyz
Expected time: ~20 minutes
Estimated cost: ~$0.30
View real-time metrics at: https://huggingface.co/spaces/username/trackio




任务在Hugging Face的GPU上异步运行，且集成了 Trackio，可以实时观察训练损失的变化。

如果想了解进度，只需问一句：“How’s my training job doing?”

Claude会获取日志并给出当前进展。

训练完成，我们的模型已经出现在Hub上，可以直接使用：

from transformers import AutoModelForCausalLM, AutoTokenizer
model = AutoModelForCausalLM.from_pretrained(“username/qwen-codeforces-cots-sft”)
tokenizer = AutoTokenizer.from_pretrained(“username/qwen-codeforces-cots-sft”)




至此，一个完整的循环完成：

我们用自然语言描述需求，智能体处理了GPU选择、脚本生成、任务提交、身份验证和持久化。整个过程大约三毛钱（$）。

04 除了SFT

平台支持三种生产级别的训练方法，理解每种方法的适用场景能帮你获得更好的结果。

监督微调（SFT）

大多数项目的起点。提供数据（输入 VS 期望输出），训练会调整模型以匹配这些模式。

推荐当你拥有高质量的数据时使用SFT，比如客户支持对话、代码生成对、领域特定的问答......以及任何你可以向模型展示“优秀表现是什么样子”的场景。

指令示例：“Fine-tune Qwen3-0.6B on my-org/support-conversations for 3 epochs.”

对于超过30亿参数的大模型，智能体会自动使用LoRA来减少内存需求，这使得在单GPU上训练7B或13B模型成为可能。

直接偏好优化（DPO）

在偏好对数据（一个响应被“选中”，另一个被“拒绝”）上训练。

这种方法使模型输出与人类偏好保持一致，通常在初始SFT阶段之后使用。

当你拥有人工标注者或自动比较的偏好注释时，使用DPO。DPO直接针对首选响应进行优化，而不需要单独的奖励模型。

DPO对数据集格式敏感，需要确切命名为chosen和rejected的列。智能体会首先验证这一点。

群组相对策略优化（GRPO）

一种强化学习任务，在可验证的任务（如解决数学问题、编写代码）上被证明是有效的。

指令示例：“Train a math reasoning model using GRPO on the openai/gsm8k dataset based on Qwen3-0.6B.”

模型生成响应，根据正确性获得奖励，并从结果中学习。这比SFT或DPO更复杂，但配置类似。

05 成本控制

智能体会根据你的模型大小选择硬件，但理解其中的权衡能帮助你做出更好的决策。

模型大小与GPU的对应关系：

极小模型（<1B参数）：t4-small效果很好。模型训练很快——一个完整训练预计花费1-2美元。非常适合教育或实验性运行。

小型模型（1-3B）：升级到t4-medium或a10g-small。训练需要几个小时，成本5-15美元。

中型模型（3-7B）：需要a10g-large或a100-large配合LoRA，因为全参数微调可能顶不住。生产环境预算15-40美元。

演示 vs 生产：

测试一个工作流程时，可以从低成本开始：

“Do a quick test run to SFT Qwen-0.6B with 100 examples of my-org/support-conversations.”

而到了生产环境，则可以给出这样的指令：

“SFT Qwen-0.6B for production on the full my-org/support-conversations. Checkpoints every 500 steps, 3 epochs, cosine learning rate.”

一个花费0.5美元但能捕获格式错误的测试，可以为你节省后续运行失败的30美元。

06 避坑指南

数据集验证是训练失败最常见的原因。智能体可以在你花费GPU时间之前验证数据集。

指令：“Check if my-org/conversation-data works for SFT training.”

智能体在CPU上快速检查（成本几乎可以忽略不计）并报告：

Dataset validation for my-org/conversation-data:
SFT: ✓ READY
  Found ‘messages’ column with conversation format
DPO: ✗ INCOMPATIBLE
  Missing ‘chosen’ and ‘rejected’ columns




如果你的数据集需要转换，智能体可以告诉你如何操作。

实时监控帮助你及早发现问题。默认配置Trackio——提交任务后，你可以在https://huggingface.co/spaces/username/trackio查看指标。

转换为GGUF以进行本地部署

训练完成后，你可能想在本地运行模型。GGUF格式适用于llama.cpp及其依赖工具，如LM Studio、Ollama等。

指令：“Convert my fine-tuned model to GGUF with Q4_K_M quantization. Push to username/my-model-gguf.”

智能体提交一个转换任务，合并LoRA适配器，转换为GGUF，应用量化，并推送到Hub。然后你就可以在本地使用它了。

07 总结

以上过程展示了：像Claude Code、Codex或Gemini CLI这样的编码智能体，可以处理模型微调的完整生命周期：

验证数据、选择硬件、生成脚本、提交任务、监控进度、转换输出。

将曾经的专业技能，变成了可以通过对话完成的事情。

而且这个技能是开源的，你可以将其作为起点，或者针对自己的工作流进行定制。

最后，在小编看来，这个东西最炫酷的概念就是“用AI来训练AI”了，而背后，则是完整的工程化支撑。

只看微调模型的话，随便找个国内平台，RTX 4090，一小时两块钱，llama-factory容器实例，命令行+配置文件，或者界面化操作，

但以后，这些都不用了，

我们只要下命令就可以，可是AI要考虑的事情就很多了

---
*导入时间: 2026-01-17 20:32:01*
