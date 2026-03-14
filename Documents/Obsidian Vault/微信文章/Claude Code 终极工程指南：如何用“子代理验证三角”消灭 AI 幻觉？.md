---
title: "Claude Code 终极工程指南：如何用“子代理验证三角”消灭 AI 幻觉？"
source: wechat
url: https://mp.weixin.qq.com/s/4QAJ2M_bh4WwLZluREtawQ
author: 果比AI
pub_date: 2026年1月8日 06:30
created: 2026-01-17 20:14
tags: [AI, 编程]
---

# Claude Code 终极工程指南：如何用“子代理验证三角”消灭 AI 幻觉？

> 作者: 果比AI | 发布日期: 2026年1月8日 06:30
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/4QAJ2M_bh4WwLZluREtawQ)

---

项目初始化
# 1. 创建项目目录并初始化 Git
mkdir my-project && cd my-project
git init

# 2. 创建初始规格文件
touch SPEC.md

# 3. 在 SPEC.md 中写入你的初步想法（可以很粗糙）
初始 SPEC.md 模板
# 项目名称

## 概述
[一句话描述项目目标]

## 核心功能
- [ ] 功能1：简单描述
- [ ] 功能2：简单描述

## 初步技术想法
- 语言/框架偏好（如有）
- 已知的约束条件

## 待澄清的问题
- [列出你自己不确定的点]
第一阶段：通过采访完善规格
目标

从粗糙的初始想法开始，让 Claude 通过深入提问逐步完善，最终生成详细、可执行的规格文档。

步骤 1：启动采访会话
cd your-project
claude
步骤 2：输入采访提示

在 Claude Code 会话中输入：

Read ./SPEC.md and interview me to refine this specification.

Ask focused questions about:
1. Core user workflows and use cases
2. Data models and relationships
3. API design (if applicable)
4. Authentication and authorization
5. Error handling and edge cases
6. Performance requirements and constraints
7. Testing priorities

Rules:
- Ask ONE question at a time, wait for my answer
- Go deep on important areas, skip trivial details
- If I say "move on", proceed to the next topic
- When the spec feels complete, summarize what we've covered 
  and ask if I want to add anything before you write the final version

Write the updated spec to ./SPEC.md only when I confirm it's ready.
步骤 3：有效参与采访的技巧

回答要具体：

❌ "用户需要登录"
✅ "用户通过邮箱+密码登录，需要支持'记住我'功能，
    登录失败3次后锁定15分钟"

主动引导方向：

"这部分够了，重点聊聊支付流程"
"数据库设计是关键，多问几个问题"
"这个功能是 MVP 之后的，先跳过"

承认不确定：

"这个我还没想清楚，你有什么建议？"
"两种方案都可以，帮我分析下利弊"
步骤 4：审查并提交
# 审查生成的规格
cat ./SPEC.md

# 提交版本
git add SPEC.md
git commit -m "docs: complete specification v1"
预期的 SPEC.md 结构
# 项目名称

## 1. 概述
- 项目目标
- 目标用户
- 成功标准

## 2. 功能需求
### 2.1 核心功能（MVP）
### 2.2 次要功能（Phase 2）
### 2.3 未来考虑（Backlog）

## 3. 技术规格
### 3.1 系统架构
### 3.2 数据模型
### 3.3 API 设计
### 3.4 第三方集成

## 4. 非功能需求
### 4.1 性能要求
### 4.2 安全要求
### 4.3 可用性要求

## 5. 实现约束
- 技术栈选择
- 环境要求
- 已知限制

## 6. 测试策略
- 单元测试范围
- 集成测试重点
- 需要手动测试的场景

## 7. 里程碑
- Phase 1: [目标] - [预估]
- Phase 2: [目标] - [预估]

注意：建议使用编号格式（如 2.1, 3.4），便于后续引用特定章节进行局部验证。




第二阶段：创建子代理

原理：利用 Claude Code 的 /agents 功能创建拥有独立上下文和职责的子代理。

提示：Claude Code v2.1+ 自带 Bash, Plan 等内置代理。我们创建的以下代理是"自定义专用代理"，它们与内置代理共存，互不冲突。




三个子代理的分工
子代理
	
核心职责
	
输出形式


spec-validator
	
静态检查：逐条对照规格与代码
	
检查报告


test-generator
	
动态验证：生成可执行的测试用例
	
测试文件


code-reviewer
	
质量把关：代码风格、安全、可维护性
	
审查意见

冲突处理：如果三者结论不一致，以 spec-validator 的静态检查为准，因为它直接对照规格原文。

spec-validator 说 ❌，其他说 ✅ → 按 spec-validator 处理
test-generator 的测试失败但 spec-validator 说 ✅ → 检查测试是否写错
code-reviewer 报 Critical 但 spec-validator 说 ✅ → 可能是代码质量问题而非规格问题
使用 /agents 命令创建

在 Claude Code 会话中输入 /agents，选择 "Create New Agent"，按提示填写配置。

必须创建的子代理
子代理 1：规格验证器（spec-validator）
字段
	
内容


Name
	spec-validator

Description
	Validates codebase against specification. Use when checking if implementation matches specification.

Tools
	Read, Grep, Glob

System Prompt:

You are a meticulous specification compliance validator.

## Your Task
Verify that the codebase implements all requirements in the specification file.

## Modes

### Default Mode: Full Verification
When asked to "verify" or "check", systematically check all requirements.

### Partial Mode: Section-specific Verification  
When user specifies "ONLY section X.X" or a specific feature name,
verify only requirements in that section/feature.

### Diagnosis Mode: Detailed Analysis
When asked to "diagnose", for EACH issue:
1. Quote the exact requirement from the spec
2. Show the relevant code snippet that should implement it
3. Explain specifically what's missing or wrong
4. Suggest how to fix it

## Process
1. Read the specification file (path specified by user, default: ./SPEC.md)
2. If code path is specified, focus search on that directory
3. Extract every testable requirement into a checklist
4. For each requirement:
   - Search the codebase for relevant implementation
   - Verify it matches the spec exactly
   - Check edge cases mentioned in the spec

## Output Format
For each requirement, report:
- ✅ **Implemented**: [requirement summary]
- ⚠️ **Partial**: [requirement summary] - Missing: [what's incomplete]
- ❌ **Missing**: [requirement summary] - Suggestion: [how to implement]

End with a summary: X implemented, Y partial, Z missing.

## Rules
- Be strict: "mostly works" is ⚠️, not ✅
- Check error handling explicitly mentioned in spec
- Verify data validation matches spec constraints
- Flag any code that contradicts the spec
子代理 2：测试生成器（test-generator）
字段
	
内容


Name
	test-generator

Description
	Generates specification compliance tests. Use when creating or updating tests to verify requirements coverage.

Tools
	Read, Write, Edit, Glob

System Prompt:

You are a specification compliance test generator.

## Your Task
Generate tests that verify the codebase meets specification requirements.
These are NOT unit tests for code logic - they are integration/e2e tests 
that verify user-facing requirements are satisfied.

## Modes

### Create Mode (default)
Generate tests for ALL requirements in the spec.

### Update Mode
When user mentions "update", "changed", or specifies sections:
1. Only generate/modify tests for the specified requirements
2. Do not touch tests for unchanged requirements

## Process
1. Read the specification file (path specified by user, default: ./SPEC.md)
2. Scan existing tests in ./tests/ to understand:
   - Current test coverage (avoid duplication)
   - Testing framework and language used
   - Naming conventions
3. Parse spec for testable requirements
4. Generate tests with strict data isolation

## Critical Rules for Test Generation
1. **Data Isolation**: 
   - NEVER assume database state
   - Use unique identifiers for every test run (e.g., `user_${uuid}@test.com`)
   - Include setup and teardown hooks to clean data
2. **External Dependencies**: 
   - Mock all 3rd party APIs (payment gateways, email services)
   - Do NOT make real network calls to external services
3. **Idempotency**: 
   - Tests must be able to run repeatedly without failure

## Output
Write tests to ./tests/spec-compliance/ directory (create if not exists).
Use the same testing framework/language as existing tests.
Name each test to clearly reference the spec requirement:
- test_spec_2_1_user_can_login_with_email
- test_spec_2_1_login_fails_after_3_attempts

## Important
- Scan ./tests/ first to avoid duplicating existing test coverage
- Match the project's testing framework and conventions
- Focus only on verifying spec requirements from a user/API perspective
- Do NOT test internal implementation details
子代理 3：代码审查员（code-reviewer）
字段
	
内容


Name
	code-reviewer

Description
	Reviews code for quality and spec compliance. Use after implementing features.

Tools
	Read, Grep, Glob

System Prompt:

You are a senior code reviewer focusing on quality and specification compliance.

## Your Task
Review code changes against the specification file (path specified by user, default: ./SPEC.md).

## Review Checklist
1. **Spec Compliance**: Does the code implement what the spec requires?
2. **Error Handling**: Are all error cases from the spec handled?
3. **Security**: Are security requirements from the spec met?
4. **Code Quality**: Is the code maintainable and well-structured?

## Output Format
Provide actionable feedback grouped by file, with severity levels:
- 🔴 Critical: Must fix (spec violation, security issue)
- 🟡 Warning: Should fix (potential bugs, poor practices)
- 🔵 Suggestion: Nice to have (style, optimization)

End with summary counts for each severity level.
验证子代理创建成功

创建完成后，在 Claude Code 会话中输入：

/agents

确认三个子代理都已列出。

提交子代理配置
# 将子代理配置纳入版本控制（便于团队共享）
git add .claude/agents/
git commit -m "chore: add subagents for spec validation workflow"
子代理调用方式

推荐：显式调用

在 Claude Code 会话中使用自然语言请求：

Use the spec-validator to verify the codebase against ./SPEC.md
Have the test-generator create tests for ./SPEC.md
Ask the code-reviewer to review the codebase against ./SPEC.md

指定代码范围（大型项目推荐）：

Use the spec-validator to verify ./src/auth/ against ./specs/AUTH.md

自动调用（不总是可靠）

Claude 可能会根据子代理的 description 字段自动判断何时调用。但为确保调用，建议始终使用显式调用方式。

工具权限说明
工具
	
作用
	
适用场景


Read
	
读取文件
	
所有子代理


Write
	
新建文件
	
需要生成新文件的子代理


Edit
	
编辑现有文件
	
需要修改现有代码的子代理


Grep
	
搜索文件内容
	
需要查找特定代码的子代理


Glob
	
文件模式匹配
	
需要遍历文件的子代理

最佳实践：只给子代理必要的工具权限。验证类任务（如 spec-validator、code-reviewer）不需要 Write/Edit 权限。

第三阶段：从规格到代码
原则
永远不要一次性生成全部代码
（即使小项目）
分阶段实现，每阶段完成后测试并提交
保持人工检查点
项目测试结构配置

在开始实现前，确保项目有清晰的测试结构：

./tests/
  ├── unit/                    # 单元测试（第三阶段编写）
  │   └── ...
  └── spec-compliance/         # 规格符合性测试（第四阶段生成）
      └── ...

根据项目技术栈配置测试命令：

Node.js 示例：

{
  "scripts": {
    "test": "vitest run ./tests/unit",
    "test:spec": "playwright test ./tests/spec-compliance",
    "test:all": "npm run test && npm run test:spec"
  }
}

Python 示例：

# pyproject.toml
[tool.pytest.ini_options]
testpaths = ["tests/unit"]

# 运行命令
# pytest tests/unit/             # 单元测试
# pytest tests/spec-compliance/  # 规格符合性测试
两类测试的区别


	
单元测试（第三阶段）
	
规格符合性测试（第四阶段）


目的
	
验证代码逻辑正确
	
验证需求被满足


粒度
	
函数/类/模块级别
	
用户流程/API 级别


由谁写
	
开发过程中编写
	
test-generator 子代理生成


位置
	./tests/unit/	./tests/spec-compliance/

示例
	test_hash_password_returns_valid_hash	test_spec_2_1_user_can_login
3.1 生成实现计划

在 Claude Code 会话中输入：

Read ./SPEC.md and create an implementation plan.

Include:
1. Project structure (folder/file tree)
2. Implementation phases in dependency order
3. For each phase: files to create, key functions, estimated complexity
4. External dependencies to install

Output the plan as ./IMPLEMENTATION_PLAN.md
Do NOT write any code yet.

审核并提交：

cat ./IMPLEMENTATION_PLAN.md
git add IMPLEMENTATION_PLAN.md
git commit -m "docs: add implementation plan"
3.2 循环实现每个阶段

对每个阶段重复以下步骤。在 Claude Code 会话中输入：

Read ./SPEC.md and ./IMPLEMENTATION_PLAN.md

Execute implementation phase 1: [阶段名称]

Requirements:
- Create only the files listed for this phase
- Include error handling as specified in the spec
- Add basic input validation
- Write unit tests for code logic (functions, classes, modules)
- Put unit tests in ./tests/unit/

After completion, list what was created and any deviations from the plan.

完成后在终端运行测试并提交：

# 运行单元测试
npm test  # 或 pytest tests/unit/, go test, etc.

# 手动快速验证
npm run dev

# 提交
git add .
git commit -m "feat: complete implementation phase 1 - [描述]"

继续下一阶段：

Implementation phase 1 is committed. Continue with implementation phase 2: [阶段名称]
Follow the same requirements as before.
3.3 规格修正协议（Spec Correction Protocol）

重要：如果发现 SPEC.md 中的要求存在逻辑漏洞、技术不可行或性能风险，严禁强行编写"符合规格但有错误"的代码。

请执行以下 "停止-修正-继续" 流程：

步骤 1：停止编码并报告

STOP. Implementing section [X.X] reveals a critical issue.

The Spec requires: [引用要求]
The Reality is: [解释技术障碍/逻辑冲突]

I propose changing the spec to: [你的建议]

步骤 2：用户确认后更新规格

等待用户同意修改方案后，输入：

Update ./SPEC.md with the agreed changes.

步骤 3：调整计划并恢复

Read the updated ./SPEC.md and adjust ./IMPLEMENTATION_PLAN.md.
Resume implementation of phase [X] based on the revised spec.
第四阶段：全面规格一致性审查

与第三阶段的区别：第三阶段的单元测试确保"代码逻辑正确"；本阶段是系统性检查"实现是否完全符合 SPEC.md 的每一条用户需求"。




何时进行
所有实现阶段完毕后
重大重构后
发布前的最终检查
步骤 1：快速扫描确认代码完整性

在 Claude Code 会话中输入：

Use the spec-validator to verify the codebase against ./SPEC.md

查看报告摘要。如果有大量 ❌ Missing，先回到第三阶段补全代码，再继续本阶段。

步骤 2：生成规格符合性测试

在 Claude Code 会话中输入：

Use the test-generator to create specification compliance tests for ./SPEC.md

子代理会在 ./tests/spec-compliance/ 目录生成测试文件。

步骤 3：人工审查生成的测试

重要：在运行测试前，快速审查生成的测试文件。检查以下几点：

[ ] 测试是否覆盖了规格中提到的所有边界条件？
[ ] 断言是否验证了正确的字段/值？
[ ] 测试数据是否符合规格约束？
[ ] 错误测试是否验证了正确的错误类型/消息？
[ ] 是否正确使用了 Mock（无真实外部调用）？

生成的测试本身可能有 bug，测试通过不一定代表代码正确。

步骤 4：运行规格符合性测试

在终端运行：

npm run test:spec  # 或对应的测试命令

记录失败的测试。

步骤 5：修复发现的问题

综合 spec-validator 报告和失败的测试，在 Claude Code 会话中输入：

Based on the spec-validator report and failing tests, fix these issues:
1. [第一个问题]
2. [第二个问题]
...

For each fix, explain:
- What the spec requires
- What was wrong
- How you fixed it
步骤 6：循环验证直到通过

在 Claude Code 会话中输入：

Use the spec-validator to verify the codebase against ./SPEC.md

在终端重新运行测试：

npm run test:spec

重复步骤 5-6，直到：

所有规格符合性测试通过
spec-validator 报告全部 ✅

退出条件：如果循环 3 次后仍有问题未解决，停止自动修复。手动分析根本原因——可能需要重新审视规格定义或架构设计。

步骤 7：最终代码审查

在 Claude Code 会话中输入：

Use the code-reviewer to review the codebase against ./SPEC.md
步骤 8：提交验证阶段成果
git add .
git commit -m "test: add spec compliance tests and fixes

- Generated spec compliance tests for all requirements
- Fixed issues found during verification
- All spec requirements now passing"
审查完成标准
[ ] spec-validator 报告全部 ✅（或仅剩已知的延期项）
[ ] 规格符合性测试全部通过
[ ] code-reviewer 无 🔴 Critical 问题
[ ] 手动测试关键用户流程无问题
[ ] 已提交到 Git
第五阶段：持续维护
规格变更流程

步骤 1：提出变更

在 Claude Code 会话中输入：

I need to change a requirement in ./SPEC.md:

[描述变更]

Please:
1. Update ./SPEC.md with the change
2. Identify affected code files
3. Implement the necessary code changes
4. Update related unit tests
5. Summarize what changed

步骤 2：更新规格符合性测试

Use the test-generator to update spec compliance tests for section [X.X] of ./SPEC.md

步骤 3：清理过时测试

Use the test-generator to remove or update any obsolete tests 
in ./tests/spec-compliance/ that no longer match ./SPEC.md

步骤 4：验证变更

Use the spec-validator to verify ONLY section [X.X] against ./SPEC.md

步骤 5：提交变更

git add .
git commit -m "feat: update requirement [X.X] - [描述变更]"
定期一致性检查

每次大改动后，在 Claude Code 会话中运行完整验证：

Use the spec-validator to verify the codebase against ./SPEC.md
实用技巧
控制上下文长度

长会话会导致质量下降。定期开新会话：

# 结束当前会话
exit

# 开启新会话
claude

在新会话中输入：

Read ./SPEC.md and ./IMPLEMENTATION_PLAN.md. 
We've completed implementation phases 1-3. Continue with implementation phase 4.
处理大型项目

按领域分割规格文件：

./specs/
  ├── OVERVIEW.md        # 整体架构
  ├── AUTH.md            # 认证模块规格
  ├── PAYMENTS.md        # 支付模块规格
  └── NOTIFICATIONS.md   # 通知模块规格

在 Claude Code 会话中针对性工作：

Read ./specs/OVERVIEW.md for context, then focus on 
implementing ./specs/AUTH.md

验证时指定代码路径和规格文件：

Use the spec-validator to verify ./src/auth/ against ./specs/AUTH.md
调试验证失败

当 spec-validator 报告问题时，使用诊断模式获取详细信息。在 Claude Code 会话中输入：

Use the spec-validator to diagnose the issues in ./src/auth/ against ./SPEC.md

子代理会输出：

规格原文引用
相关代码片段
具体问题说明
修复建议

根据诊断结果修复：

Fix the issue with [功能名] based on the diagnosis above.
Show me the changes before and after.
Git 工作流集成
# 创建功能分支
git checkout -b feature/user-auth

# Claude 实现后提交
git add .
git commit -m "feat(auth): implement user authentication

- Add login/logout endpoints
- Implement JWT token management
- Add password reset flow

Spec: ./SPEC.md section 2.1"

合并前在 Claude Code 会话中验证：

Use the spec-validator to verify ./src/auth/ against ./SPEC.md
常见问题
Q: 采访问题太多/太少怎么办？

太多：

在 Claude Code 会话中输入：

Let's wrap up this section. What are the 2-3 most critical 
questions you still have before moving on?

太少：

在 Claude Code 会话中输入：

I feel like we're missing something about [领域]. 
What edge cases or failure scenarios should we consider?
Q: Claude 生成的代码与规格有偏差？

立即纠正并强化规格优先。在 Claude Code 会话中输入：

Stop. This doesn't match the spec.

SPEC.md says: [引用具体内容]
Your code does: [描述偏差]

Please re-read that section and fix the implementation.
The spec is the source of truth.
Q: 如何处理规格中的模糊点？

在 Claude Code 会话中输入：

Section 3.2 of the spec is ambiguous about [具体问题].

Before implementing, let's clarify:
- Option A: [描述]
- Option B: [描述]

Which approach better fits the overall design? 
After we decide, update SPEC.md to remove the ambiguity.
Q: 发现规格本身有错误或不可行？

使用规格修正协议（见第三阶段 3.3）：

STOP. Implementing section [X.X] reveals a critical issue.

The Spec requires: [引用要求]
The Reality is: [解释技术障碍/逻辑冲突]

I propose changing the spec to: [你的建议]
Q: 验证过程太慢？

缩小验证范围。在 Claude Code 会话中输入：

Use the spec-validator to verify ONLY section 2.1 against ./SPEC.md

或指定代码目录：

Use the spec-validator to verify ./src/auth/ against ./SPEC.md
Q: 子代理没有被调用？

使用显式调用语法，明确指定子代理名称和规格文件：

Use the spec-validator to verify the codebase against ./SPEC.md
Q: 单元测试和规格符合性测试有冲突？

它们测试的层面不同，不应该冲突：

单元测试：测试代码内部逻辑（如 hashPassword 函数返回正确格式）
规格符合性测试：测试用户需求（如"用户可以用邮箱登录"）

如果发现重复，删除规格符合性测试中过于底层的测试，保持其关注用户可见行为。

Q: 使用多个规格文件时如何验证？

分别验证每个规格文件，并指定对应的代码目录：

Use the spec-validator to verify ./src/auth/ against ./specs/AUTH.md
Use the spec-validator to verify ./src/payments/ against ./specs/PAYMENTS.md
Q: 三个子代理结果不一致怎么办？

以 spec-validator 的静态检查为准，因为它直接对照规格原文。

spec-validator 说 ❌，其他说 ✅ → 按 spec-validator 处理
test-generator 的测试失败但 spec-validator 说 ✅ → 检查测试是否写错
code-reviewer 报 Critical 但 spec-validator 说 ✅ → 可能是代码质量问题而非规格问题
Q: 循环验证多次仍无法通过？

如果循环 3 次后仍有问题：
1. 停止自动修复
2. 手动分析根本原因
3. 可能需要重新审视规格定义或架构设计
4. 在 SPEC.md 中标记已知限制或延期项

Q: 生成的测试质量不高？

test-generator 生成的测试可能需要人工调整。重点检查：

数据隔离是否正确（每次运行使用唯一标识符）
外部依赖是否已 Mock
断言是否足够具体


注意：文章中部分内容由AI参与生成，可能存在幻觉，如果有错误、疏漏请指正。

---
*导入时间: 2026-01-17 20:14:53*
