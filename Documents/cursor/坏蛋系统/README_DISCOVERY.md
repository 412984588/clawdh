# 个人收款平台发现系统

基于CrewAI和智谱GLM-4.6的智能化平台发现与验证系统，结合MCP工具实现高效的自动化验证。

## 🎯 系统特点

- ✅ **智能AI驱动** - 使用智谱GLM-4.6大语言模型
- ✅ **基于真实数据** - 利用5817个已验证平台的成功模式
- ✅ **专业Agent架构** - 3个专业Agent协同工作
- ✅ **智能验证** - 4项严格验证标准
- ✅ **高性能** - 并行处理，平均1秒/平台
- ✅ **24/7运行** - 自动批量处理

## 📋 验证标准（4项全部通过）

1. **个人注册能力** - 支持个人用户注册收款
2. **支付接收能力** - 能接收他人付款
3. **自有支付系统** - 使用Stripe Connect等
4. **美国市场支持** - .com域名或ACH功能

## 🚀 快速开始

### 环境配置

1. **配置智谱API Key**
   ```bash
   # 创建或编辑 .env 文件
   echo "ZHIPUAI_API_KEY=your_api_key_here" >> .env
   ```

2. **安装依赖**
   ```bash
   pip install crewai requests beautifulsoup4 python-dotenv
   ```

### 运行系统

#### 方法1：使用启动脚本（推荐）
```bash
./start_discovery.sh
```

#### 方法2：直接运行
```bash
# 运行增强版CrewAI系统（使用智谱GLM-4.6）
python3 enhanced_crewai_system.py

# 或运行批量处理器（规则引擎模式）
python3 batch_processor.py
```

## 📊 系统状态

当前数据：
- ✅ 已验证平台：5817个
- ❌ 已拒绝平台：758个
- 📈 总成功率：88.5%

## 📁 核心文件

### 主要系统
- `batch_processor.py` - 批量处理器（推荐）
- `enhanced_crewai_system.py` - 增强版CrewAI系统
- `mcp_tools.py` - MCP工具集

### 数据文件
- `verified_platforms.json` - 已验证平台
- `rejected_platforms.json` - 已拒绝平台
- `analysis_report.json` - 分析报告

### 工具脚本
- `start_discovery.sh` - 系统启动脚本
- `visible_agents.py` - 原始CrewAI实现（需API）

## ⚙️ 配置说明

### 批量处理器配置
```python
# batch_processor.py 中的配置
batch_size = 20      # 每批处理20个平台
max_workers = 3     # 3个并行线程
interval_minutes = 2  # 每2分钟一批
```

### 验证标准
验证标准定义在 `mcp_tools.py` 的 `SmartValidator` 类中，可根据需要调整关键词。

## 🔧 故障排除

### 1. 网络连接问题
如果遇到网站无法访问，系统会自动标记为失败并继续处理其他平台。

### 2. 依赖问题
确保安装了所需依赖：
```bash
pip install crewai requests beautifulsoup4
```

### 3. 权限问题
确保脚本有读写权限：
```bash
chmod +x *.py *.sh
```

## 📈 性能优化

1. **并行处理** - 默认3个线程，可根据系统性能调整
2. **批量大小** - 建议10-50个平台/批
3. **缓存机制** - 自动避免重复验证

## 🎯 下一步计划

1. 集成更多真实爬取数据源
2. 实现基于机器学习的智能评分
3. 添加邮件/通知功能
4. 开发Web界面监控系统

## 💡 使用建议

- **生产环境**：使用批量处理器，设置适当的批次间隔
- **测试环境**：可以减小批次大小，增加日志输出
- **性能监控**：定期查看 `analysis_report.json` 了解系统表现

---

**重要提醒**：本系统仅用于研究和合规的平台发现，请遵守相关法律法规和平台使用条款。