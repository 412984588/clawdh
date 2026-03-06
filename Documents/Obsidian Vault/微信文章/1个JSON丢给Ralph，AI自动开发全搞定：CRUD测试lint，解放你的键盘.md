---
title: "1个JSON丢给Ralph，AI自动开发全搞定：CRUD/测试/lint，解放你的键盘"
source: wechat
url: https://mp.weixin.qq.com/s/gaBxZH6UunDE4gy_eZQ9jA
author: 老码小张
pub_date: 2026年1月16日 00:09
created: 2026-01-17 23:02
tags: [AI, 编程]
---

# 1个JSON丢给Ralph，AI自动开发全搞定：CRUD/测试/lint，解放你的键盘

> 作者: 老码小张 | 发布日期: 2026年1月16日 00:09
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/gaBxZH6UunDE4gy_eZQ9jA)

---

周四晚上11点，我看到一条企业微信机器人消息，目测是来自隔壁团队的后端邵同学：

"./ralph.sh 25"

就这一行命令。

然后他关掉电脑，去楼下便利店买了杯咖啡。等他回来时，一个完整的用户管理模块已经写好了——CRUD接口、单元测试、代码lint、Git提交记录，全部搞定。他只需要打开PR，看一眼diff，合并。

我当时就问他："这什么黑科技？"

他笑了笑，说："Ralph。一个不会下班的实习生。"

Ralph
你现在的开发流程，其实是在做重复劳动

想象一下你最近一周的工作日：

早上10点，产品扔来一份PRD。你花半小时理解需求，拆成几个任务。下午开始写代码——一个用户表的CRUD，标准得不能再标准。写完了跑单测，有个边界条件没考虑，改。再跑一遍，通过。然后是lint检查，代码风格不符合规范，改。再跑一遍。最后提交，写commit message。

这整个流程，从"理解需求"到"代码通过所有检查"，你花了多久？一个简单的CRUD，我见过有人花一整天。

现在问你一个问题：这一整天里，有多少时间是在做"创意工作"，有多少时间是在做"机械重复"？

我敢打赌，至少70%是后者。

Ralph就是来干这件事的。它的核心逻辑简单得要命——说白了就是一个Bash循环加一个Stop Hook：

#!/bin/bash
# 简化版Ralph核心逻辑

MAX_ITERATIONS=25
ITERATION=0

while [ $ITERATION -lt $MAX_ITERATIONS ]; do
# 调用Claude，传入当前项目状态 + PRD
  claude_response=$(call_claude_api "$(cat prd.json)""$(git status)""$(cat progress.txt)")

# 检查是否有完成标记
ifecho"$claude_response" | grep -q "<promise>COMPLETE</promise>"; then
    echo"任务完成！"
    break
fi

# 没完成？继续循环
  ITERATION=$((ITERATION + 1))
echo"第 $ITERATION 轮迭代..."
done

但这个"简单"背后，是一个完全不同的工作范式。

Ralph怎么把你的一周工作，压缩成24小时



我们来看一个真实的流程对比。

传统方式：你手动干

第一天上午：产品评审，理解需求。
第一天下午：开始写代码，实现用户表的增删改查。
第二天上午：跑单测，发现一个bug（删除用户时没检查关联订单），改代码。
第二天下午：再跑一遍单测，通过。然后跑lint，发现变量命名不符合规范，改。
第三天上午：集成测试，发现接口返回格式和前端约定不一致，改。
第三天下午：最后一轮回归，通过。提交代码。

总耗时：2.5天。而且这还是"顺利"的情况。

Ralph方式：AI自转

第一天上午：产品评审，你整理成一份结构化的prd.json：

{
  "tasks":[
    {
      "id":"user_crud",
      "description":"实现用户表的增删改查接口",
      "acceptance_criteria":[
        "POST /users 创建用户，返回201",
        "GET /users/:id 获取用户，返回200",
        "PUT /users/:id 更新用户，返回200",
        "DELETE /users/:id 删除用户，检查关联订单，返回204",
        "所有接口都有单元测试，覆盖率>80%",
        "代码通过eslint检查"
      ]
    }
],
"constraints":{
    "framework":"Node.js + Express",
    "database":"PostgreSQL",
    "testing":"Jest",
    "linter":"ESLint with Airbnb config"
}
}



第一天下午：你写一个简单的prompt.txt：

# Ralph Agent Instructions

## Your Task

1. Read `scripts/ralph/prd.json`
2. Read `scripts/ralph/progress.txt`
   (check Codebase Patterns first)
3. Check you're on the correct branch
4. Pick highest priority story 
   where `passes: false`
5. Implement that ONE story
6. Run typecheck and tests
7. Update AGENTS.md files with learnings
8. Commit: `feat: [ID] - [Title]`
9. Update prd.json: `passes: true`
10. Append learnings to progress.txt

## Progress Format

APPEND to progress.txt:

## [Date] - [Story ID]
- What was implemented
- Files changed
- **Learnings:**
  - Patterns discovered
  - Gotchas encountered
---

## Codebase Patterns

Add reusable patterns to the TOP 
of progress.txt:

## Codebase Patterns
- Migrations: Use IF NOT EXISTS
- React: useRef<Timeout | null>(null)

## Stop Condition

If ALL stories pass, reply:
<promise>COMPLETE</promise>

Otherwise end normally.

然后你敲一行命令：

./ralph.sh 25

第一天晚上到第二天中午：Ralph自己在转圈。它：

• 读取prd.json，理解需求
• 生成代码文件
• 运行npm test，看到报错
• 根据报错信息，修改代码
• 再运行npm test，通过
• 运行npm run lint，看到风格问题
• 修改代码
• 再运行一遍，全绿
• 提交Git，记录每一步做了什么

第二天下午：你起床，打开电脑，看到一个已经完成的PR。你花15分钟review代码，合并。

总耗时：24小时（其中你只花了1小时）。

这不是夸大。我看过的实际案例里，一个中等复杂度的后台模块（5-6个接口，完整的单测），从PRD到可运行版本，Ralph跑下来就是这个时间量级。

关键细节：为什么它不会"半途而废"

你可能会问：AI不是经常"写到一半就停了"吗？

是的，这是传统AI编程助手的老毛病。你问它写个功能，它写了一半，然后说"剩下的你自己完成吧"。

Ralph解决这个问题的方法，就是那个Stop Hook——一个拦截机制。

当AI试图结束对话时（比如说"我已经完成了"），系统不会真的让它退出。而是：

1. 检查输出里有没有<promise>COMPLETE</promise>这个标记
2. 没有？那就不准退出
3. 把当前的文件状态、测试结果、错误日志，再喂给同一个AI
4. AI看到"咦，我说完成了，但系统说我没完成，那我再看看"
5. 它会重新审视代码，发现遗漏的地方，继续改

这个机制的妙处在于：AI不是在"自我评估"（这很不靠谱），而是在"对照客观事实"。

比如说，你的验收标准是"所有单测通过"。AI写完代码说"完成了"，但npm test的输出里有红色的FAIL。系统就会说："你看，这里还有失败的测试。"AI再看一遍代码，改掉bug，再跑一遍。

这样反复，直到真的所有测试都绿了。

三种人会最先被冲击

说到这，我得说点扎心的。

第一种：纯体力型开发

你的工作就是：看PRD → 写CRUD → 跑测试 → 改bug → 提交。

如果这是你的全部工作内容，那我得直说——你最危险。

因为Ralph最擅长的，就是这种"有明确验收标准、可以自动化验证"的任务。一个CRUD模块、一个数据迁移脚本、一个性能优化任务，这些都是Ralph的主场。

你现在花3天做的事，它24小时搞定。公司会怎么想？

第二种：需求翻译型产品经理

你的工作是：听业务方说需求 → 整理成PRD → 跟开发讲清楚。

现在有个问题：AI也能做这个。

产品经理的价值，本来应该在"选方向、拍板、承担结果"这些地方。但如果你大部分时间在做"翻译和协调"，那这部分工作，AI可以直接接手。

你可能会说："但我还要理解业务啊。"

对，但理解业务的人，不一定是你。可能是一个懂业务的架构师，加上一个会用AI的产品助理。你这个中间层，就被挤掉了。

第三种：测试工程师（某些类型）

如果你的工作主要是：写测试用例 → 跑回归 → 报bug。

那你要小心。因为Ralph的整个循环，就是"跑测试 → 看结果 → 改代码"。如果你的测试体系已经很完善，那AI可以自己跑完整个流程。

你剩下的价值，就是"设计测试体系"和"想出AI想不到的风险场景"。这两样，不是每个测试都能做的。

那什么样的人还值钱？

别光听坏消息。我也见过一些人，在这波浪潮里反而升职加薪。

架构师型开发

你不是在写代码，而是在设计"怎么让AI能写代码"。

具体来说：

• 选技术栈，让它足够规范化（这样AI容易理解）
• 设计自动化测试体系（这是Ralph的眼睛）
• 定义代码规范和验收标准（这是Ralph的目标）

一个好的架构师，能把一个"模糊的需求"转化成"Ralph能理解的任务"。这个能力，目前还很值钱。

系统思维型产品

你不是在写PRD，而是在定义"什么叫成功"。

比如说，不是"实现用户管理模块"，而是"用户管理模块要支持100万日活、P99延迟<200ms、支持三种登录方式"。

这种"定义成功标准"的能力，AI目前还做不了。

懂AI的工程师

你会用AI，也知道AI的边界。

你能看出AI生成的代码哪里有坑，能快速修复。你知道什么任务适合丢给AI，什么任务不适合。你能设计一个工作流，让AI和人类配合得最高效。

这种人，现在特别抢手。

一个真实的案例数字

我有个朋友在一个20人的创业公司。他们用Ralph做了一个实验：

传统方式：一个新的后台管理系统，3个开发，预计6周。

Ralph方式：同样的系统，1个架构师（他自己）+ Ralph，预计2周。

结果怎样？

• 第一周：架构师设计系统、写自动化测试、定义规范。
• 第二周：Ralph跑完整个开发流程。
• 第三周：架构师做code review、对接复杂业务逻辑、性能优化。

总耗时：3周（对比原来的6周）。

成本从"3个开发 × 6周"变成"1个架构师 × 3周"。

你算一下这个账：原来要花30人天，现在花15人天。省下来的钱，可以招一个更强的架构师，或者投到其他项目。

这就是为什么硅谷的VC现在都在看这个方向。

你现在应该做什么

如果你读到这，有点慌了，那很正常。

但慌完了，该干什么？

第一步：承认现实。
你现在的工作里，有多少是"机械重复"？诚实地评估一下。如果超过60%，那你确实需要转变。

第二步：升级你的技能。
不是学更多编程语言，而是学：

• 怎么设计自动化测试（这是Ralph的眼睛）
• 怎么定义清晰的验收标准（这是Ralph的目标）
• 怎么用AI工具（这是你的新键盘）

第三步：从小处开始。
别等着公司给你分配Ralph任务。自己找一个小需求，试试看能不能用AI工具（Claude、Cursor、或者其他）从头到尾跑一遍。体验一下"定义目标 → AI自转 → 你只需要review"的感觉。

第四步：转向更高价值的工作。
一旦你能放心地把"写CRUD"这种事交给AI，你就有时间去做：

• 系统设计
• 性能优化
• 跨团队协作
• 技术决策

这些事，AI目前还做不了。

最后的话

我不是在危言耸听。Ralph这种技术，已经不是"未来可能"，而是"现在进行时"。

有人已经在用它交付项目。有公司已经在调整组织结构。有新人已经在学"怎么跟AI搭班"而不是"怎么从零写代码"。

你可以选择：

• 继续做你现在的事，等着被替代
• 或者，主动升级，成为那个"会用AI的人"

区别就在这里。

https://github.com/snarktank/ralph

---
*导入时间: 2026-01-17 23:02:30*
