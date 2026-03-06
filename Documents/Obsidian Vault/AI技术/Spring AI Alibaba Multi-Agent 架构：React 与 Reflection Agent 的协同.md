# Spring AI Alibaba Multi-Agent 架构：React 与 Reflection Agent 的协同

## 基本信息
- **标题**: Spring AI Alibaba Multi-Agent 架构：React 与 Reflection Agent 的协同
- **来源**: 微信公众号
- **作者**: AI智能谷
- **发布时间**: 2025年08月12日
- **URL**: https://mp.weixin.qq.com/s/1rN-xEQMOOJsNEQWc9lpSA
- **分类**: AI技术
- **标签**: #AI #GitHub #工具推荐 #技术分析 #行业观察 #深度学习 #教程

## 内容摘要
 

Spring AI Alibaba Multi-Agent 架构：React 与 Reflection Agent 的协同

在前面的文中，我们分别了解了React Agent的推理-行动能力和Reflection Agent的自我反思机制。

现在让我们看看如何将这两种Agent结合起来，构建一个更强大的Multi-Agent协作系统。

Agent的协作
回顾：我们已经掌握的Agent类型

在前面的文章中，我们已经了解了两种重要的Agent：

Agent类型
	
核心能力
	
工作模式
	
应用场景

React Agent	
推理-行动循环
	
思考→工具调用→观察→再思考
	...

## 完整内容

 

Spring AI Alibaba Multi-Agent 架构：React 与 Reflection Agent 的协同

在前面的文中，我们分别了解了React Agent的推理-行动能力和Reflection Agent的自我反思机制。

现在让我们看看如何将这两种Agent结合起来，构建一个更强大的Multi-Agent协作系统。

Agent的协作
回顾：我们已经掌握的Agent类型

在前面的文章中，我们已经了解了两种重要的Agent：

Agent类型
	
核心能力
	
工作模式
	
应用场景

React Agent	
推理-行动循环
	
思考→工具调用→观察→再思考
	
复杂问题解决

Reflection Agent	
自我反思改进
	
生成→评估→改进→再生成
	
内容质量提升
什么是Multi-Agent？

Multi-Agent即多智能体系统，是由多个具有自主决策和交互能力的智能体组成，能通过相互协作、竞争或协商来完成特定任务或解决复杂问题的计算系统

Multi-Agent的协作优势

现在，让我们将这两种Agent结合起来：

React Agent作为"执行专家"：

• 负责任务分解和具体执行
• 调用各种工具完成操作
• 处理复杂的多步骤流程

Reflection Agent作为"质量专家"：

• 负责计划评估和结果审查
• 提供改进建议和优化方案
• 确保输出质量和准确性
Multi-Agent协作

制定计划

评估计划

需要改进

计划合理

执行结果

评估结果

需要继续

任务完成

用户任务
Planning Agent基于React模式任务分解
Supervisor Agent基于Reflection模式质量把控
计划是否合理?
Step Executing Agent基于React模式具体执行
任务是否完成?
高质量输出
Multi-Agent核心Agent解析：React与Reflection的分工协作
1. Planning Agent - React模式的任务规划专家

Planning Agent采用React Agent的推理-行动模式，负责将复杂任务智能分解为可执行的步骤序列。它就像一个经验丰富的项目经理，能够：

• 分析任务复杂度：理解用户需求的深层含义
• 制定执行计划：将大任务拆分为小步骤
• 调用规划工具：使用PlanningTool管理计划状态
核心配置
public OpenmanusController(ChatModel chatModel)throws GraphStateException {
    this.planningClient = ChatClient.builder(chatModel)
        .defaultSystem(PLANNING_SYSTEM_PROMPT)
        .defaultAdvisors(newSimpleLoggerAdvisor())
        .defaultToolCallbacks(Builder.getToolCallList())
        .defaultOptions(OpenAiChatOptions.builder().internalToolExecutionEnabled(false).build())
        .build();

    this.stepClient = ChatClient.builder(chatModel)
        .defaultSystem(STEP_SYSTEM_PROMPT)
        .defaultToolCallbacks(Builder.getManusAgentToolCalls())
        .defaultAdvisors(newSimpleLoggerAdvisor())
        .defaultOptions(OpenAiChatOptions.builder().internalToolExecutionEnabled(false).build())
        .build();

    initGraph();
}
规划能力展示

当用户提出"帮我调研AI技术的最新发展趋势并生成分析报告"时，Planning Agent会输出：

{
  "planId": "G_12345",
  "steps": [
    "1. 使用搜索工具查找AI技术最新发展信息",
    "2. 整理和分析收集到的技术资料",
    "3. 提取关键趋势和发展方向",
    "4. 生成结构化的分析报告文档"
  ]
}
2. Supervisor Agent - Reflection模式的质量把控专家

Supervisor Agent采用Reflection Agent的自我反思模式，负责协调各个Agent的工作，监控执行进度，确保任务质量。它就像一个严格的质量检查员，能够：

• 评估计划合理性：检查Planning Agent制定的计划是否可行
• 监控执行进度：跟踪每个步骤的执行状态
• 质量把控：确保每个步骤的输出符合要求
• 动态调整：根据执行情况决定是否需要重新规划
核心决策逻辑
public String think(OverAllState state) {
    String nextPrompt = (String) state.value("step_prompt").orElseThrow();

    if (nextPrompt.equalsIgnoreCase("Plan completed.")) {
        state.updateState(Map.of("final_output", state.value("step_output").orElseThrow()));
        return "end";
    }

    return "continue";
}
质量把控能力展示

当Planning Agent提交计划后，Supervisor Agent会进行质量评估：

输入计划：

{
  "planId": "G_12345",
  "steps": [
    "1. 使用搜索工具查找AI技术最新发展信息",
    "2. 整理和分析收集到的技术资料",
    "3. 提取关键趋势和发展方向",
    "4. 生成结构化的分析报告文档"
  ]
}

Supervisor Agent的反思过程：

✅ 计划评估：步骤逻辑清晰，从信息收集到报告生成形成完整闭环
✅ 可执行性检查：每个步骤都有对应的工具支持
✅ 质量标准：符合调研报告的基本要求
→ 决策：计划通过，开始执行第1步

执行过程中的持续监督：

步骤1完成后：
- 反思：搜索结果是否全面？信息质量如何？
- 评估：✅ 已获得足够的AI技术资料
- 决策：继续执行第2步

步骤2完成后：
- 反思：数据整理是否结构化？关键信息是否提取？
- 评估：✅ 数据已按主题分类整理
- 决策：继续执行第3步
状态管理机制
@Override
public Map<String, Object> apply(OverAllState t)throws Exception {
    StringplanStr= (String) t.value("plan").orElseThrow();
    Planplan= planningTool.getGraphPlan(parsePlan(planStr).getPlan_id());

    Optional<Object> optionalOutput = t.value("step_output");
    if (optionalOutput.isPresent()) {
        StringfinalStepOutput= String.format("This is the final output of step %s:\n %s",
            plan.getCurrentStep(), optionalOutput.get());
        plan.updateStepStatus(plan.getCurrentStep(), finalStepOutput);
    }

    StringpromptForNextStep= plan.isFinished() ? "Plan completed." : plan.nextStepPrompt();
    return Map.of("step_prompt", promptForNextStep);
}
3. Step Executing Agent - React模式的任务执行专家

Step Executing Agent同样采用React Agent的推理-行动模式，拥有丰富的工具集，负责执行具体的操作步骤。它就像一个全能的技术专家，能够：

• 理解执行指令：准确理解Supervisor Agent分配的任务
• 选择合适工具：从工具箱中选择最适合的工具
• 执行具体操作：调用工具完成实际的工作
• 反馈执行结果：将执行结果报告给Supervisor Agent
执行能力展示

当Supervisor Agent分配任务"使用搜索工具查找AI技术最新发展信息"时，Step Executing Agent的执行过程：

第1步：推理阶段

🧠 思考：需要搜索AI技术发展信息
- 分析：用户需要最新的AI技术资料
- 判断：应该使用GoogleSearch工具
- 策略：搜索关键词"AI技术发展趋势 2024"

第2步：行动阶段

🔧 调用GoogleSearch工具：
- 输入：{"query": "AI技术发展趋势 2024", "num_results": 10}
- 执行：发起搜索请求
- 状态：工具调用成功

第3步：观察阶段

👀 分析搜索结果：
✅ 找到10篇相关文章
✅ 包含大模型、机器学习、自动驾驶等热点
✅ 信息来源权威（IEEE、Nature、MIT等）
→ 判断：搜索结果质量良好，任务完成

执行输出报告：

{
  "step":1,
"status":"completed",
"tool_used":"GoogleSearch",
"results_summary":"成功获取10篇AI技术发展相关文章",
"key_findings":[
    "大模型技术持续突破",
    "多模态AI成为新趋势",
    "AI在垂直领域深度应用"
],
"next_action":"等待Supervisor Agent指令"
}
React + Reflection协作流程解析
实际案例：市场调研任务的协作执行

当用户提出"帮我调研一下AI技术的最新发展趋势并生成分析报告"时，我们可以看到React Agent和Reflection Agent是如何协作的：

阶段一：任务规划与质量评估
Supervisor Agent
Planning Agent
用户
Supervisor Agent
Planning Agent
用户
React模式：推理-分解
Reflection模式：评估-改进
"调研AI技术发展趋势并生成报告"
🧠 思考：如何分解这个任务？
📋 制定：生成详细执行计划
📋 返回详细执行计划
🤔 反思：这个计划合理吗？
✅ 评估：步骤是否可执行？
📝 计划质量评估完成
阶段二：任务执行与持续监督
用户
工具集
Step Executing Agent
Supervisor Agent
用户
工具集
Step Executing Agent
Supervisor Agent
React模式：推理-行动循环
Reflection模式：质量检查
React模式：继续推理-行动
Reflection模式：持续质量把控
最终质量检查
"✅ 计划通过，开始执行第1步"
🧠 思考：需要用什么工具？
🔧 行动：调用GoogleSearch
👀 观察：获得搜索结果
"📊 第1步完成：已找到AI技术资料"
🤔 反思：结果质量如何？
"✅ 质量合格，继续第2步"
🧠 思考：如何整理数据？
🔧 行动：数据提取和处理
"📈 第2步完成：数据整理完成"
🤔 反思：信息是否全面？
"✅ 继续执行报告生成"
🔧 调用FileSaver生成报告文档
"📄 所有步骤执行完毕"
🤔 反思：整体任务完成度？
"🎉 高质量AI技术调研报告已生成"
总结
技术突破的本质：Agent协作模式的创新

Multi-Agent系统最大的创新在于将我们之前学习的两种Agent模式完美结合：

1. React Agent模式的深度应用：
• Planning Agent：用React模式进行任务分解
• Step Executing Agent：用React模式执行具体操作
• 体现了推理-行动循环的强大执行能力
2. Reflection Agent模式的巧妙融入：
• Supervisor Agent：用Reflection模式进行质量把控
• 持续评估计划合理性和执行质量
• 体现了自我反思机制的质量保证能力
3. 协作机制的精妙设计：
• 通过StateGraph实现Agent间的状态共享
• 通过条件边控制实现动态流程调度
• 通过异步执行提升整体性能

回顾我们的路径，可以看到Agent技术的清晰进化：

传统Function Call 单次工具调用
React Agent推理-行动循环
Reflection Agent自我反思改进
Multi-Agent协作智能系统

每一步都是能力的跃升：

• Function Call → React Agent：从被动响应到主动推理
• React Agent → Reflection Agent：从执行能力到质量意识
• Reflection Agent → Multi-Agent：从个体智能到集体智能
引用链接

[1]
https://arxiv.org/abs/2501.06322




 

---

**处理完成时间**: 2025年10月09日
**文章字数**: 5975字
**内容类型**: 微信文章
**自动分类**: AI技术
**处理状态**: ✅ 完成
