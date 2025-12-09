# 个人收款银行转账平台发现系统

## 🎯 核心目标
寻找允许个人用户注册收款并将资金转移到个人银行账户的平台。

### 🏆 核心特征
- **个人收款账户**：支持个人用户注册成为收款方
- **多场景收款**：接收顾客付款、打赏、捐赠、门票销售、众筹等
- **银行转账**：将收到的资金通过ACH/银行转账到个人银行账户
- **美国市场**：服务美国用户或支持美国银行系统

## ⚠️ 重要原则
**不做任何模拟行为** - 所有功能必须是真实的网站访问、API调用和数据分析

## 📊 数据源管理策略

### 🎯 数据源类型（按优先级排序）
1. **支付处理器目录**：Stripe Connect、PayPal Partners等官方目录
2. **创作者平台聚合器**：Patreon替代品列表、Substack竞争者分析
3. **众筹平台数据库**：Kickstarter、Indiegogo类似平台
4. **支付SaaS目录**：Payment处理平台清单
5. **开发者工具库**：GitHub上的支付相关项目
6. **行业报告白皮书**：FinTech、创作者经济报告
7. **社交媒体监测**：Twitter、LinkedIn上的平台推荐
8. **应用商店分析**：App Store、Google Play中的支付应用

### 🔍 数据源获取方法
- **自动化搜索**：使用关键词组合进行批量搜索
- **竞品分析**：分析已知平台的竞争对手
- **API接口**：利用公开API获取平台列表
- **网络爬虫**：定向爬取平台目录网站
- **社区挖掘**：Reddit、Discord、Product Hunt等社区推荐

## 🗂️ 文件管理系统

### 📁 必需文件清单
1. **`verified_platforms.json`** - 已验证通过的平台
2. **`rejected_platforms.json`** - 验证失败的平台
3. **`pending_platforms.json`** - 待验证平台队列
4. **`data_sources.json`** - 数据源清单和状态
5. **`validation_summary.md`** - 验证经验总结
6. **`strategy_updates.md`** - 策略变更记录

### 🔄 文件更新规则
- **实时更新**：每个验证完成后立即更新对应文件
- **备份机制**：每次更新前自动备份
- **版本控制**：Git提交记录所有变更
- **去重检查**：新增前检查所有文件避免重复

## 🔧 工作方式：自动循环Agents团队

### 🚀 无限循环架构
**核心设计**: 24/7全自动运行的智能发现系统

#### 🔄 永不停止的工作循环
**执行模式**:
```
开始循环 → 发现数据源 → 发现平台 → 验证平台 → 优化策略 → 下一轮循环
    ↑                                                         ↓
    ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
        持续自我进化，无限循环
```

**特点**:
- **零人工干预**: 完全自主运行，无需人工干预
- **自我进化**: 基于每轮结果持续优化发现和验证策略
- **持续增长**: 验证平台数量不断增加

#### 🤖 3个核心Agent（每轮循环执行）

**1. Discovery Agent (数据源发现者)**
- **职责**: 不断发现和扩展新数据源
- **策略**:
  - 基于平台类型智能生成新数据源
  - 自动评估数据源质量
  - 动态调整数据源权重
- **输出**: 高质量数据源池

**2. Scout Agent (平台发现者)**
- **职责**: 基于数据源生成高质量平台候选
- **策略**:
  - 利用184个已验证平台的成功模式
  - 智能生成变体和衍生平台
  - 严格去重和预筛选
- **输出**: 候选平台列表

**3. Validator Agent (验证者)**
- **职责**: 严格执行4项验证标准
- **策略**:
  - 快速预筛过滤明显不符合的平台
  - 智能预判减少无效验证
  - 深度验证确保4/4标准
  - 二次确认避免误判
- **输出**: 100%符合4项标准的平台

#### 📈 每轮循环的5个阶段
1. **发现数据源**: 自动扩展和优化数据源池
2. **发现平台**: Scout Agent智能生成候选
3. **潜力分析**: Analyzer Agent评估和排序
4. **严格验证**: Validator Agent执行4项验证
5. **智能优化**: 基本轮结果优化下一轮策略

#### 🧠 自我优化机制
**性能监控**:
- 通过率监控 (低于15%时自动调整)
- 数据源质量评估
- 验证效率分析

**策略调整**:
- 通过率过低 → 降低验证阈值
- 个人注册失败多 → 重点关注创作者类型
- 自有系统失败多 → 提高支付系统权重
- 数据源不足 → 自动扩展新数据源

**紧急恢复**:
- 连续3轮无发现时执行紧急优化
- 自动重置和调整策略
- 清理低质量数据源

### 🔄 智能工作流程（4阶段流水线）

#### 🎯 阶段1: 协同发现 (CrewAI Orchestration)
```
Scout-Agent-01 ←→ Data-Source-Pool-A ←→ Shared-Cache ←→ Scout-Agent-02 ←→ Data-Source-Pool-B
        ↓                                           ↓
  专注FinTech平台                              专注Creator平台
        ↓                                           ↓
   Discovery-Result-01                     Discovery-Result-02
        ↓                                           ↓
              ↘              ↙
           Consolidated-Discovery-List (50 platforms)
```

#### 🧠 阶段2: 智能分析 (LangGraph State Machine)
```
Input: Consolidated-Discovery-List
    ↓
State: Data-Preprocessing
    ↓
State: Feature-Extraction (基于287个已验证平台模式)
    ↓
State: ML-Based-Scoring (机器学习评分模型)
    ↓
State: Priority-Ranking
    ↓
Output: Ranked-Platform-List (按通过概率排序)
```

#### ✅ 阶段3: 对话验证 (AutoGen Conversation)
```
Validator-01: "我发现平台X通过前3项标准，评分0.8"
Validator-02: "让我验证美国市场支持...确认通过，最终评分0.85"
Validator-01: "同意，建议收录"
Validator-02: "记录到verified_platforms.json"
```

#### 📊 阶段4: 智能汇总 (CrewAI Coordination)
- 实时更新所有JSON文件
- 生成详细performance metrics
- 自动优化下次工作参数
- 更新agent performance scores

## 🔍 平台去重和追踪机制

### 🚫 去重策略
- **域名去重**：基于platform_domain的精确匹配
- **公司去重**：基于同一公司的不同产品
- **功能去重**：功能高度相似的平台
- **历史检查**：检查所有历史文件避免重复验证

### 📊 追踪机制
- **状态追踪**：待验证→验证中→已通过→已拒绝
- **时间戳**：记录每个状态变更时间
- **验证详情**：记录每项验证的详细结果
- **失败原因**：记录未通过验证的具体原因

## 🔍 个人收款平台验证标准 (4项全部通过才能收录)

### ✅ **1. 个人注册能力**
- **检查内容**：个人用户是否可以注册成为收款方
- **优先类型**：'创作者'、'打赏'、'众筹'、'写作'、'订阅'、'数字产品'、'在线课程'、'教育'、'活动'、'票务'、'支付'、'SaaS'
- **通过条件**（满足任一即可）：
  - 个人用户可以注册账户并设置收款功能
  - 或支持非营利组织注册和收款
  - 或支持个体EIN注册和收款
- **验证逻辑**：优先支持上述类型的平台

### ✅ **2. 支付接收能力**
- **检查内容**：平台是否允许用户接收他人付款
- **优先类型**：'创作者'、'打赏'、'众筹'、'销售'、'订阅'、'服务'、'课程'、'教育'、'活动'、'票务'、'支付'
- **通过条件**：平台允许用户接收他人付款（打赏、购买、捐赠等）
- **验证逻辑**：优先支持上述类型的平台

### ✅ **3. 自有支付系统**
- **检查内容**：平台是否拥有自有支付系统，无需外部支付网关
- **支付集成要求**：使用Stripe Connect Express/Custom（避免Stripe Standard）
- **通过条件**：使用Stripe Connect Express/Custom（避免Stripe Standard）
- **验证逻辑**：优先小平台

### ✅ **4. 服务美国=ACH银行转账**
- **检查内容**：平台是否服务美国市场并支持ACH银行转账
- **核心洞察**：**只要确认服务于美国市场就默认具备ACH银行转账能力**
- **等价逻辑**：**有ACH介绍也等同于服务美国市场**
- **通过条件**：域名以 '.com' 结尾 OR 明确说明ACH功能
- **验证逻辑**：`domain.endswith('.com') or 'ACH' in platform_description`

### 🎯 **验证逻辑优化**
- **4项全部通过**：平台必须通过所有4项验证才能被收录
- **第1项灵活性**：第1项内部满足任一条件即可通过该项
- **美国市场逻辑**：服务于美国的平台100%具备ACH银行转账能力
- **ACH功能逻辑**：有ACH介绍的平台等同于服务美国市场
- **效率优先**：只要确认服务美国市场或有ACH介绍，第4项自动通过，大幅提升验证效率

## 📈 经验总结和策略更新机制

### 🎯 每轮验证后必做事项
1. **数据统计**
   - 通过率：X/50个平台通过验证
   - 失败原因分布：4项验证标准的失败率
   - 数据源效果：各数据源的平台质量评分
   - 验证效率：单个平台平均验证时间

2. **经验总结**
   - 成功平台共同特征
   - 高失败率验证项目分析
   - 新发现的平台类型
   - 验证流程优化建议

3. **策略调整**
   - 验证标准优化
   - 数据源优先级调整
   - 关键词策略更新
   - agents分工优化

### 🔄 策略更新触发条件
- **通过率<20%**：重新评估验证标准
- **数据源枯竭**：寻找新数据源
- **发现新平台类型**：更新优先级列表
- **验证流程瓶颈**：优化agents分工

### 📋 文件模板和格式

#### verified_platforms.json 格式
```json
{
  "platforms": [
    {
      "name": "平台名称",
      "domain": "platform.com",
      "type": ["创作者", "打赏"],
      "verified_date": "2025-01-01",
      "validation_results": {
        "personal_registration": true,
        "payment_receiving": true,
        "own_payment_system": true,
        "us_market_ach": true
      },
      "verification_details": "详细的验证信息"
    }
  ]
}
```

#### rejected_platforms.json 格式
```json
{
  "platforms": [
    {
      "name": "平台名称",
      "domain": "platform.com",
      "type": "平台类型",
      "rejected_date": "2025-01-01",
      "failed_criteria": ["personal_registration"],
      "rejection_reason": "具体的失败原因"
    }
  ]
}
```

#### validation_summary.md 格式
```markdown
# 第X轮验证总结

## 📊 验证统计
- 总验证数：50个平台
- 通过数量：X个平台
- 失败数量：Y个平台
- 通过率：XX%

## 🎯 失败原因分析
1. 个人注册能力：X个平台失败
2. 支付接收能力：X个平台失败
3. 自有支付系统：X个平台失败
4. 服务美国市场：X个平台失败

## 💡 新发现
- 发现的新平台类型
- 验证流程中的新问题
- 优化建议

## 🔄 策略调整
- 验证标准变更
- 数据源优先级调整
- 下轮验证优化计划
```

## 🚀 当前工作状态

### ⭐ 升级版智能Agents团队（基于现代框架）
- **工作方式**：CrewAI + LangGraph + AutoGen 混合架构
- **协作模式**：角色扮演 + 状态管理 + 对话验证
- **批量处理**：每轮50个平台，4阶段智能流水线
- **技术优势**：机器学习评分 + 状态持久化 + 质量控制

### 🧠 核心技术升级
#### 🔧 Framework Integration
- **CrewAI**: 用于Scout agents的角色扮演和任务编排
- **LangGraph**: 用于Analyzer的状态管理工作流
- **AutoGen**: 用于Validator的对话式质量验证

#### 📊 智能化特性
- **机器学习评分**: 基于287个已验证平台的模式识别
- **状态持久化**: 验证过程中的状态保存和恢复
- **质量控制**: Double-check verification和对话确认
- **性能监控**: 实时agent performance tracking

### 🔄 自优化工作流
1. **智能发现**: CrewAI编排的并行探索，数据源隔离
2. **状态分析**: LangGraph状态机，特征提取和ML评分
3. **对话验证**: AutoGen多轮对话，质量控制
4. **智能汇总**: CrewAI协调，自动参数优化

### 💡 Agent Performance Metrics
- **Scout Agent Efficiency**: 平台发现速度和质量
- **Analyzer Accuracy**: 评分预测准确率
- **Validator Consistency**: 验证结果一致性
- **Team Throughput**: 每小时处理平台数量

### 🎯 关键优化洞察
- **专业化分工**: Scout agent专业化（FinTech vs Creator）
- **状态管理**: LangGraph解决复杂验证状态跟踪
- **质量控制**: AutoGen对话验证减少误判
- **机器学习**: 基于历史数据的智能评分提升准确性
- **现代框架**: 避免重复造轮子，利用成熟agent框架

### 🔧 技术栈要求
```python
# 核心依赖
aiohttp>=3.8.0
python-dotenv>=1.0.0
exa-py>=1.0.0
playwright>=1.48.0
duckduckgo-search>=6.0.0
```

### 📈 Performance Targets
- **Discovery Rate**: >50 platforms/hour
- **Validation Accuracy**: >95% consistency
- **False Positive Rate**: <5%
- **Throughput**: Complete 50-platform batch in <2 hours

---

## 🤖 Claude Code 自动化工作流

### 核心脚本
- **`claude_auto_workflow.py`** - 主自动化脚本(含深度验证+自动优化)
- **`.agent/workflows/auto-discover.md`** - 工作流配置
- **`start_workflow.sh`** / **`stop_workflow.sh`** - 启停脚本

### 增强版特性
- ⚡ **5线程并行验证** - 速度提升5倍
- 🔬 **深度验证突破** - 被拒绝平台自动二次验证
- 📚 **200+平台数据库** - 更丰富的候选源
- 📊 **智能失败分析** - 自动调整策略
- 🔍 **智能多源搜索** - Exa (优先) + DuckDuckGo (免费备用)
- 🛑 **熔断保护机制** - 自动识别 Exa 配额耗尽并切换搜索源

### 深度验证突破机制
当平台首次验证通过2项以上但不满4项时，自动触发：
- 🔘 点击注册/Sign Up按钮获取更多信息
- 💰 访问Pricing/Plans页面检测支付系统
- ❓ 访问About/FAQ页面补充信息
- 🔧 访问Developers/API页面检测自有系统

### 快速启动命令

```bash
# 测试模式 (5平台)
python3 claude_auto_workflow.py --test

# 正式运行 (无限循环 + 自动优化)
python3 claude_auto_workflow.py --workers=5 --batch-size=50
```

### 工作流触发
在Claude Code中使用 `/auto-discover` 命令。

### 🧠 批次间自动优化机制
每批验证后自动分析并优化策略：
- 📊 **失败模式分析** - 统计4项验证的失败率
- 🔄 **策略动态调整** - 根据通过率优化平台选择
- ⚠️ **紧急优化** - 连续3批低通过率时自动重置
- 📈 **优化历史记录** - 保存最近10次优化决策

### 自动优化触发规则
| 条件 | 动作 |
|------|------|
| 通过率<30% + 个人注册失败高 | 优先creator类型平台 |
| 自有系统失败>30% | 增强深度验证 |
| 通过率>50% | 扩展边缘类型平台 |
| 连续3批<20% | 🔥 紧急优化重置 |

### ⚡ 批次执行模式
- **间隔时间**: 0秒 (立即执行)
- **执行流程**: 验证50个 → 分析优化 → 立即开始下一批
- **无限循环**: 24/7持续运行，零等待

---
**版本**: v20.0 多源韧性优化版
**更新日期**: 2025-12-08
**核心使命**: 完全自动化 + 智能突破 + 自我优化 + 成本韧性
**工作模式**: 验证 → 分析 → 优化 → 循环
**验证逻辑**: 首次验证 → 深度突破 → 失败分析 → 策略调整
**文件管理**: 实时更新JSON + 优化历史记录
**技术栈**: Python + Exa + DuckDuckGo + Playwright + 并行处理 + 自优化引擎

⚠️ 联动维护规则
每当要更改这个文件的时候，必须同步更新以下文件：
- @/Users/zhimingdeng/Documents/cursor/坏蛋系统/CLAUDE.md
- @/Users/zhimingdeng/Documents/cursor/坏蛋系统/ANTIGRAVITY.md
- @/Users/zhimingdeng/.antigravity/ANTIGRAVITY.md
