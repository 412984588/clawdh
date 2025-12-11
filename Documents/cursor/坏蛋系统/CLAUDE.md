# Bad Egg System v3.0 (Claude Native Edition)

## 🎯 核心目标
寻找允许个人用户注册收款并将资金转移到个人银行账户的"漏网之鱼"平台。

### 🏆 核心特征 (The Bad Egg Criteria)
1.  **个人收款账户**：支持个人用户注册成为收款方。
2.  **多场景收款**：接收顾客付款、打赏、捐赠、门票销售、众筹等。
3.  **银行转账**：将收到的资金通过ACH/银行转账到个人银行账户。
4.  **美国市场**：服务美国用户或支持美国银行系统。

## ⚠️ 重要原则
**不做任何模拟行为** - 所有功能必须是真实的网站访问、API调用和数据分析。
**零 API 成本** - 利用 Claude Code 内置能力，不依赖外部 LLM API。

---

## 🔍 个人收款平台验证标准 (4项全过原则)

### ✅ 1. 个人注册能力
- **检查内容**：个人用户是否可以注册成为收款方。
- **优先类型**：创作者、打赏、众筹、写作、订阅、数字产品、在线课程、教育、活动、票务、支付、SaaS。
- **通过条件**（满足任一即可）：
  - 个人用户可以注册账户并设置收款功能
  - 或支持非营利组织注册和收款
  - 或支持个体EIN注册和收款
- **验证逻辑**：`browser` 访问注册页，寻找 "Individual" / "Sole Proprietorship" 选项。

### ✅ 2. 支付接收能力
- **检查内容**：平台是否允许用户接收他人付款。
- **通过条件**：平台允许用户接收他人付款（打赏、购买、捐赠等）。
- **验证逻辑**：检查产品功能页，确认有 Checkout / Donation / Invoice 功能。

### ✅ 3. 自有支付系统
- **检查内容**：平台是否拥有自有支付系统，无需外部支付网关。
- **支付集成要求**：使用 Stripe Connect Express/Custom（避免 Stripe Standard）。
- **通过条件**：
  - 拥有自有支付系统
  - OR 使用 Stripe Connect Express
  - OR 使用 Stripe Connect Custom
- **验证逻辑**：检查注册流程，若跳转 `connect.stripe.com/oauth` 且要求完整注册则为 Standard (❌)。

### ✅ 4. 服务美国=ACH银行转账
- **检查内容**：平台是否服务美国市场并支持ACH银行转账。
- **核心洞察**：**只要确认服务于美国市场就默认具备ACH银行转账能力**。
- **通过条件**：域名以 `.com` 结尾 OR 明确说明 ACH 功能 OR 明确服务美国市场。
- **验证逻辑**：`domain.endswith('.com') or 'ACH' in description`。

---

## 🔧 架构升级：Claude Code Native 5-Agent 协作网络

摒弃外部 API 依赖，采用 Claude Code 内置工具实现 BettaFish 风格的多 Agent 协作。

### 1. 🕷️ Crawler Agent (全网爬虫)
- **职责**：基于数据源策略，广度撒网。
- **工具**：`search_web` + `read_url_content`
- **策略**：
  - 执行 "自动化搜索"：使用关键词组合（如 "Stripe Connect Express platforms"）。
  - 执行 "竞品分析"：爬取 "Alternatives to X" 列表。
- **输出**：原始候选平台列表。

### 2. 🔍 Inspector Agent (规则过滤器)
- **职责**：基于文本分析的快速过滤。
- **工具**：`read_url_content`
- **策略**：
  - 快速扫描首页和 Pricing 页。
  - 过滤掉 "Business Only", "Enterprise" 平台。
  - 初步匹配 4 大标准。
- **输出**：潜力股列表。

### 3. 🔬 Deep Verify Agent (深度验证者)
- **职责**：模拟真实用户的"实地考察"。
- **工具**：`browser_subagent` (深度交互)
- **策略**：
  - **注册测试**：点击 Sign Up，验证是否强制要求 Company Name。
  - **支付测试**：检查 Stripe 跳转链接结构。
  - **费率检查**：寻找隐藏费用。
- **输出**：深度验证报告 + 截图证据。

### 4. ⚖️ Forum Agent (舆情陪审团)
- **职责**：社区挖掘与风险评估。
- **工具**：`search_web` (针对 Reddit/Trustpilot)
- **策略**：
  - 搜索 "[平台名] ban account", "[平台名] payout issues"。
  - 验证社区口碑。
- **输出**：风险评级。

### 5. 📝 Reporter Agent (记录员)
- **职责**：数据汇总与文件更新。
- **工具**：`write_to_file`
- **策略**：
  - 生成结构化 JSON。
  - 更新文件系统（去重、追踪）。
- **输出**：更新后的 JSON 文件。

---

## 🗂️ 文件管理系统

### 📁 必需文件清单
1. **`verified_platforms.json`** - 已验证通过的平台 (4项全过)
2. **`rejected_platforms.json`** - 验证失败的平台
3. **`pending_platforms.json`** - 待验证平台队列
4. **`data_sources.json`** - 数据源清单和状态
5. **`validation_summary.md`** - 验证经验总结
6. **`strategy_updates.md`** - 策略变更记录

### 🔄 文件更新规则
- **实时更新**：每个验证完成后立即更新。
- **去重检查**：基于域名和公司名去重。
- **版本控制**：Git 提交记录变更。

---

## 📊 数据源管理策略

### 🎯 数据源类型（按优先级排序）
1. **支付处理器目录**：Stripe Connect、PayPal Partners
2. **创作者平台聚合器**：Patreon 替代品
3. **众筹平台数据库**：Kickstarter 类似平台
4. **支付 SaaS 目录**
5. **开发者工具库** (GitHub)
6. **行业报告**
7. **社交媒体** (Twitter/LinkedIn)
8. **应用商店**

### 🔍 获取方法
- **自动化搜索**：Claude `search_web`
- **竞品分析**：Claude 分析
- **网络爬虫**：Claude `read_url_content`

---

## 📈 经验总结和策略更新机制

### 🎯 每轮验证后必做
1. **数据统计**：计算通过率、失败原因分布。
2. **经验总结**：分析成功平台特征。
3. **策略调整**：若通过率 < 20%，自动建议调整关键词或源。

### 📋 JSON 结构示例 (verified_platforms.json)
```json
{
  "platforms": [
    {
      "name": "Example Platform",
      "domain": "example.com",
      "type": ["Creator", "Donation"],
      "verified_date": "2025-12-10",
      "validation_results": {
        "personal_registration": true,
        "payment_receiving": true,
        "own_payment_system": true,
        "us_market_ach": true
      },
      "verification_details": "经 Deep Verify Agent 验证，注册流程支持个人，使用 Stripe Express，Terms 明确支持 US ACH。",
      "risk_score": "Low"
    }
  ]
}
```
⚠️ 联动维护规则
每当要更改这个文件的时候，必须同步更新以下文件：
- @/Users/zhimingdeng/Documents/cursor/坏蛋系统/GEMINI.md
- @/Users/zhimingdeng/Documents/cursor/坏蛋系统/ANTIGRAVITY.md
- @/Users/zhimingdeng/Documents/cursor/坏蛋系统/.antigravity/ANTIGRAVITY.md
