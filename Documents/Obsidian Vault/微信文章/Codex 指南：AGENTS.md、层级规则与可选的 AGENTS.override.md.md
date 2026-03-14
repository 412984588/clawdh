---
title: "Codex 指南：AGENTS.md、层级规则与可选的 AGENTS.override.md"
source: wechat
url: https://mp.weixin.qq.com/s/x3nAqANBSO8prmuuvOBw-A
author: AKclown
pub_date: 2025年11月27日 02:38
created: 2026-01-17 20:36
tags: [AI, 编程]
---

# Codex 指南：AGENTS.md、层级规则与可选的 AGENTS.override.md

> 作者: AKclown | 发布日期: 2025年11月27日 02:38
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/x3nAqANBSO8prmuuvOBw-A)

---

适用范围：本文只针对 OpenAI Codex 代理，说明其“就近”读取 AGENTS.md 的层级行为，以及某些工具支持的 AGENTS.override.md。若你使用其他代理，请先确认它是否实现相同的优先顺序与覆盖机制。

文章配图：AGENTS.md 层级示意
TL;DR
• 在 Codex 中，AGENTS.md 就是给代理看的 README，写清楚“如何在此代码库中工作”：开发环境、构建/测试/Lint 命令、PR 规范、安全限制等。
• 层级法则：距离被编辑文件最近的 AGENTS.md 优先；目录层级越往上越次要。无论如何，你在提示里直接说的话优先级最高。
• 粒度建议：根目录文件覆盖全仓规则；在子目录（如 apps/web、packages/api）添加更精细的说明；必要时在某功能模块再放一个。
• AGENTS.override.md（可选约定）：一些工具会在特殊时期（如发布冻结、事故模式）读取该文件并赋予更高优先级。是否支持完全取决于你使用的代理/CLI。
为什么要写 AGENTS.md

代理非常擅长局部修改，但缺乏上下文时容易“跑偏”。AGENTS.md 就像一张地图：告诉它命令在哪里，用什么测试、PR 怎么写、哪些操作禁止。顺带一提，这也能帮助新同事快速融入团队。

层级结构（文字示意）

原则：就近文件优先。例如编辑 apps/web 里的组件，代理会先读取 apps/web/AGENTS.md，若没写到再退回根目录的版本。

repo/
├─ AGENTS.md            # 全仓默认规则
├─ apps/
│  └─ web/
│     ├─ AGENTS.md      # 仅对 /apps/web/** 生效
│     └─ src/components/Button.tsx
└─ packages/
   └─ api/
      ├─ AGENTS.md      # 仅对 /packages/api/** 生效
      └─ src/routes/users.ts
• 编辑 packages/api/src/routes/users.ts：先读 packages/api/AGENTS.md，再回退到根。
• 编辑 apps/web/src/components/Button.tsx：先读 apps/web/AGENTS.md，再回退到根。
• 编辑 tools/release.ts（没有子级文件）：只读根目录 AGENTS.md。

如果在 apps/web/src/feature-x 再放一个 AGENTS.md，它的内容会覆盖 apps/web/AGENTS.md 与根目录，对该子树拥有最高优先级。

可选的 AGENTS.override.md

在某些紧急时间窗，你也许需要一份临时、优先级更高的规则，例如发布封板、事故应急、合规冲刺等。

• 该文件名只是约定，不是标准；只有部分工具/CLI 会自动识别。
• 如果工具不支持，可通过命令行额外指定策略文件实现同样效果。
• 建议“少量、明确、短期”：写清目的、约束内容、结束条件，窗口结束后立即删除。
repo/
├─ AGENTS.md
├─ AGENTS.override.md        # 全仓临时规则（若被支持）
└─ packages/
   └─ api/
      ├─ AGENTS.md
      └─ AGENTS.override.md  # 仅 API 范围的事故模式（若被支持）
可复用模板（根目录 / 区域 / 功能 / 覆盖）

以下模板可直接拷贝后精简、增补。

1. 根目录 AGENTS.md
Overview
• Monorepo，使用 pnpm + Node 20 LTS。
• 包含 apps/web（React + Vite）、packages/api（Fastify）、packages/shared。
Setup & Dev
• 安装：pnpm install
• 启动所有服务：pnpm -w dev
• Typecheck：pnpm -w typecheck
• Lint：pnpm -w lint
• Test：pnpm -w test
Definition of Done

在提交或发起 PR 前，必须通过：

1. pnpm -w typecheck
2. pnpm -w lint
3. pnpm -w test
Conventions
• TypeScript 严格模式，非必要不要 any。
• 提交信息遵循 Conventional Commits（feat:, fix:...）。
• 切勿提交真实密钥；维护 .env.example。
PR Guidance
• 标题：<type>(scope): summary
• PR 描述需写：问题、方案、测试、风险、回滚方式。
Safety
• 测试中禁止真实网络请求，需 Mock。
• 禁止写出仓库根目录；除非明确要求，不要执行破坏性命令。
2. 区域文件 apps/web/AGENTS.md
Commands
• 开发：pnpm --filter @acme/web dev
• 构建：pnpm --filter @acme/web build
• 单元测试：pnpm --filter @acme/web test
• Playwright E2E：pnpm --filter @acme/web e2e
Rules
• 路由是基于文件的，保持层级浅。
• UI 使用 Tailwind + CSS Modules。
• 测试就近存放为 *.test.ts[x]，新组件至少 1 个测试。
Done (web)
• pnpm -w typecheck && pnpm -w lint && pnpm --filter @acme/web test
3. 功能文件 apps/web/src/feature-x/AGENTS.md
Context
• 桌面与移动端的“快速操作”浮动菜单。
Guardrails
• 组件 gzip 后需小于 15 KB，非必须面板用动态导入。
• 必须可键盘操作，并提供可见的焦点样式。
Local Checks
• 目标测试：pnpm --filter @acme/web test -- -t "feature-x"
• 无障碍巡检：pnpm --filter @acme/web e2e -- --project=a11y --grep @feature-x
When Editing
• 更新用户文档 README.md 与变更日志。
• UI 变动需要在 /docs/feature-x/ 增加截图。
4. 区域文件 packages/api/AGENTS.md
Commands
• 开发：pnpm --filter @acme/api dev
• 测试：pnpm --filter @acme/api test
• Typecheck + Lint：pnpm --filter @acme/api typecheck && pnpm --filter @acme/api lint
API Rules
• 框架：Fastify，路由写在 src/routes/*。
• 输入校验：边界处使用 Zod，禁止直接信任 req.body。
• 错误：使用结构化对象，生产环境禁止泄露堆栈。
Local DB
• 启动 Postgres：docker compose up -d db
• 造数据：pnpm --filter @acme/api db:seed
Done (API)
• 所有测试（含 Postgres 集成）通过。
• 若修改了路由，执行 pnpm --filter @acme/api openapi:gen 更新 OpenAPI。
5. 可选 AGENTS.override.md（发布冻结期）

状态：生效中；其规则优先于普通 AGENTS.md。

临时约束
• 禁止除安全补丁外的依赖升级（只能打补丁版本）。
• 必须通过以下校验才能合并：
• pnpm -w typecheck
• pnpm -w lint
• pnpm -w test
• pnpm -w -r build（所有包必须可构建）
• PR 描述需附：风险评估 + 回滚方案。
• API 变更需在 PR 中附上 OpenAPI diff。
范围
• 全仓适用，窗口结束后请删除此文件。
6. 可选 packages/api/AGENTS.override.md（事故模式）

状态：生效中；优先级高于 packages/api/AGENTS.md。

约束
• 只允许 fix: 或 revert: 类型 PR。
• 修复前需先添加一个失败测试复现问题。
• 不要修改与事故无关的路由。
• 必须运行 pnpm --filter @acme/api test，并把失败输出贴到 PR 中。
退出条件
• 事故后总结（postmortem）合并，SLO 错误率恢复 48 小时后解除。
双树示例
基本树
repo/
├─ AGENTS.md
├─ apps/
│  └─ web/
│     ├─ AGENTS.md
│     └─ src/feature-x/AGENTS.md
└─ packages/
   └─ api/AGENTS.md
• 编辑 apps/web/src/feature-x/index.ts
1. 先读 apps/web/src/feature-x/AGENTS.md（最近）。
2. 若命令缺失再读 apps/web/AGENTS.md。
3. 仍无则回到根目录 AGENTS.md。
含 override 的树
repo/
├─ AGENTS.md
├─ AGENTS.override.md          # 发布冻结
├─ apps/web/AGENTS.md
└─ packages/api/
   ├─ AGENTS.md
   └─ AGENTS.override.md       # 事故模式
• 编辑 packages/api/src/routes/users.ts
1. 若工具支持，先读 packages/api/AGENTS.override.md。
2. 若未覆盖到，再读 packages/api/AGENTS.md。
3. 最后回退到根 AGENTS.md。
4. 若你的提示另有要求，提示优先。
AGENTS.override.md 的典型场景
1. 发布冻结：禁止依赖升级，强制运行全量构建和测试，并要求写清风险/回滚。
2. 事故应急：仅允许修复 PR，必须先写失败测试，限制修改范围，并在 PR 中附测试输出。
3. 合规冲刺：强制执行许可证检查、SBOM 生成或安全扫描。

记得让 override 时间盒化、目标明确，结束后马上删除。

反模式（请避免）
• 只在根目录放一个庞大却模糊的 AGENTS.md，没有子目录补充细节，导致代理跑错命令。
• 子目录 AGENTS.md 之间互相矛盾却没有说明。
• 把长期规则写进 AGENTS.override.md，变相造了第二套根目录规范。
• 隐藏前置条件（如“需要先启动 Docker”）却不写在任何文件里。
FAQ

Q：本文是否只对 Codex 有效？

是，案例和行为都基于 OpenAI Codex。其他代理需要自行确认兼容性。

Q：我的提示能覆盖 AGENTS.md 吗？

能。你在对话里明确的指示具有最高优先级。

Q：可以放多个 AGENTS.md 吗？

可以。代理会先读取距离修改文件最近的那个。

Q：AGENTS.override.md 是标准吗？

不是，只是约定。有些工具不支持，需要你自己在命令行或配置里额外加载。

Q：如何验证层级是否生效？

在不同目录做一次小改动，要求代理执行测试，观察它实际运行的命令并据此迭代文档。

最终检查清单
•根目录 AGENTS.md：记录全仓命令与 PR 政策。
•各大包/应用的 AGENTS.md。
•复杂模块的功能级 AGENTS.md。
•（可选）有明确结束日期的 AGENTS.override.md。
极简根目录示例（备选）
• 安装：pnpm install
• 提交前校验：pnpm -w typecheck && pnpm -w lint && pnpm -w test
• PR 模板：<type>(scope): summary，正文写问题/方案/测试/风险/回滚。
• 永远不要提交密钥；用 .env.example。

Happy shipping!

---
*导入时间: 2026-01-17 20:36:37*
