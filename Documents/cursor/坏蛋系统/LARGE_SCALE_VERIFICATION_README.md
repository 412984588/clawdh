# 大规模并行支付平台验证系统

## 系统概述

本系统专门为100个AI筛选平台的高效验证而设计，实现了大规模并行浏览器验证任务，确保100%准确性和完整的验证证据。

### 核心功能

- ✅ **批量处理**：每批10-15个平台，高效并行验证
- ✅ **多线程验证**：同时运行多个浏览器实例
- ✅ **智能重试**：访问失败时自动切换策略
- ✅ **结果缓存**：避免重复验证，提升效率
- ✅ **详细证据**：每个验证结论都有具体证据支持
- ✅ **综合报告**：Markdown、JSON、CSV多格式输出

### 4项统一验证标准

1. ✅ **美国市场服务**：验证服务区域和条款
2. ✅ **自注册功能**：测试注册流程，无需人工审核
3. ✅ **第三方收款**：确认可以接收他人付款（任何形式）
4. ✅ **支付集成**：验证Stripe Connect或内置支付处理

## 安装和配置

### 系统要求

- Python 3.8+
- Chrome/Chromium浏览器
- 8GB+ RAM（推荐16GB）
- 稳定的网络连接

### 依赖安装

```bash
# 安装Python依赖
pip install -r requirements_large_scale.txt

# 或手动安装主要依赖
pip install selenium selenium-wire undetected-chromedriver
pip install beautifulsoup4 requests pandas
pip install fake-useragent aiohttp pillow
pip install python-dotenv
```

### 浏览器设置

1. **安装Chrome浏览器**
   ```bash
   # macOS
   brew install --cask google-chrome

   # Ubuntu/Debian
   wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
   echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" | sudo tee /etc/apt/sources.list.d/google-chrome.list
   sudo apt update
   sudo apt install google-chrome-stable
   ```

2. **ChromeDriver配置**
   ```bash
   # 下载对应版本的ChromeDriver
   # 系统会自动下载和管理ChromeDriver
   ```

### 环境配置

创建 `.env` 文件（可选）：
```env
# 验证配置
DEFAULT_BATCH_SIZE=12
MAX_CONCURRENT_BROWSERS=6
MAX_WORKERS=4

# 日志级别
LOG_LEVEL=INFO

# 缓存配置
CACHE_HOURS=24

# 输出目录
OUTPUT_DIR=./verification_results
```

## 使用指南

### 快速开始

#### 1. 演示模式（推荐首次使用）
```bash
python launch_large_scale_verification.py --mode demo
```

#### 2. 完整验证流程（发现→筛选→验证）
```bash
python launch_large_scale_verification.py --mode full --target-count 100
```

#### 3. 从缓存验证
```bash
python launch_large_scale_verification.py --mode cached --from-cache discovery_results.json
```

#### 4. 自定义平台列表
```bash
# 从文件加载
python launch_large_scale_verification.py --mode custom --platforms my_platforms.txt

# 从JSON文件加载
python launch_large_scale_verification.py --mode custom --platforms my_platforms.json

# 单个平台验证
python launch_large_scale_verification.py --mode custom --platforms "https://example.com"
```

### 高级配置

#### 创建自定义配置文件
```bash
# 生成默认配置
python launch_large_scale_verification.py --save-config

# 编辑配置文件 large_scale_config.json
```

#### 自定义验证参数
```bash
python launch_large_scale_verification.py \
    --mode full \
    --target-count 50 \
    --batch-size 8 \
    --max-browsers 4 \
    --max-workers 3 \
    --log-level DEBUG
```

### 平台列表格式

#### TXT格式 (platforms.txt)
```
https://stripe.com
https://paypal.com
https://squareup.com
# 这是注释，会被忽略
https://substack.com
```

#### JSON格式 (platforms.json)
```json
{
  "platforms": [
    {"url": "https://stripe.com", "name": "Stripe"},
    {"url": "https://paypal.com", "name": "PayPal"},
    {"url": "https://squareup.com", "name": "Square"}
  ]
}
```

## 验证流程详解

### 阶段1：平台发现
- 使用多搜索引擎搜索关键词
- 提取平台URL和基本信息
- 计算平台置信度分数
- 去重和质量过滤

### 阶段2：AI筛选（可选）
- 基于机器学习的平台分类
- 4项要求预筛选
- 风险评估和优先级排序
- 人工审核标记

### 阶段3：大规模验证
- 批量并行处理
- 4项标准逐一验证
- 证据收集和截图
- 详细信息提取

### 验证标准详解

#### 1. 美国市场服务验证
- 检查页面语言和地区指示
- 分析服务条款中的地区信息
- 查找货币设置（USD、$等）
- 评估美国市场覆盖度

#### 2. 自注册功能验证
- 查找注册/Sign Up元素
- 测试注册表单可访问性
- 记录注册流程步骤
- 验证无需人工审核

#### 3. 第三方收款验证
- 检查收款相关关键词
- 查找支付功能入口
- 分析定价/功能页面
- 确认可接收他人付款

#### 4. 支付集成验证
- 检测Stripe等支付处理器
- 查找API和集成文档
- 分析支付表单结构
- 确认支付处理能力

## 输出报告

### 报告类型

1. **Markdown报告** (`large_scale_verification_report_*.md`)
   - 完整的验证结果分析
   - 4项要求详细验证状态
   - 平台分类和推荐使用场景
   - 费用结构和技术细节

2. **JSON数据** (`large_scale_verification_results_*.json`)
   - 结构化验证数据
   - 完整的证据信息
   - 截图Base64数据
   - 批次和性能指标

3. **CSV报告** (`large_scale_verification_*.csv`)
   - 表格格式便于分析
   - 关键字段汇总
   - 支持Excel打开

4. **完整结果** (`full_verification_results_*.json`)
   - 包含所有阶段数据
   - 发现、筛选、验证完整流程
   - 性能和错误信息

### 报告内容结构

#### 验证结果分类
- **完全符合**：4项要求全部通过
- **部分符合**：2-3项要求通过
- **不符合**：少于2项要求通过

#### 平台信息
- 平台名称和URL
- 平台类型（创作者、SaaS、P2P等）
- 注册流程记录
- 支付方式列表
- 费用结构详情
- 到账时间信息
- API支持状态
- 白标方案可用性
- 客户支持质量评估

#### 评分系统
- 0-5星总体评分
- 基于验证结果的基础分
- API支持、白标等加分项
- 推荐使用场景

## 性能优化

### 并发设置建议

| 系统配置 | 批次大小 | 并发浏览器 | 工作线程 |
|---------|---------|-----------|---------|
| 8GB RAM | 8-10 | 3-4 | 2-3 |
| 16GB RAM | 12-15 | 6-8 | 4-5 |
| 32GB RAM | 20-25 | 10-12 | 6-8 |

### 网络优化
- 使用稳定的网络连接
- 考虑使用代理避免IP限制
- 设置合理的超时时间

### 资源管理
- 定期清理浏览器缓存
- 监控内存使用情况
- 及时释放浏览器实例

## 故障排除

### 常见问题

#### 1. Chrome浏览器问题
```bash
# 检查Chrome安装
google-chrome --version

# 检查ChromeDriver
chromedriver --version

# 手动下载ChromeDriver
# https://chromedriver.chromium.org/downloads
```

#### 2. 权限问题
```bash
# Linux/Mac权限设置
chmod +x launch_large_scale_verification.py

# 创建输出目录
mkdir -p verification_results
```

#### 3. 依赖问题
```bash
# 升级pip
pip install --upgrade pip

# 重新安装依赖
pip install -r requirements_large_scale.txt --force-reinstall
```

#### 4. 内存不足
- 减少并发浏览器数量
- 减小批次大小
- 增加系统虚拟内存

#### 5. 网络超时
- 增加超时时间配置
- 检查防火墙设置
- 考虑使用代理

### 日志分析

系统生成详细的日志文件，包含：
- 验证进度信息
- 错误和异常详情
- 性能指标统计
- 调试信息

```bash
# 查看最新日志
tail -f large_scale_launcher_*.log

# 搜索错误
grep "ERROR" large_scale_launcher_*.log
```

## API和扩展

### 自定义验证标准

可以扩展验证标准类：
```python
class CustomVerificationCriterion(Enum):
    CUSTOM_CHECK = "custom_check"
```

### 自定义证据类型

支持新的证据类型：
- video：视频证据
- document：文档证据
- api_response：API响应证据

### 集成其他系统

- 数据库存储集成
- 监控系统集成
- 报告系统集成
- 第三方API集成

## 最佳实践

### 验证策略
1. **分批验证**：避免同时验证过多平台
2. **缓存利用**：充分利用缓存避免重复工作
3. **渐进验证**：先小规模测试，再大规模验证
4. **结果验证**：定期抽样验证结果准确性

### 质量保证
1. **双重验证**：关键平台进行二次验证
2. **人工审核**：不确定的结果标记为需人工审核
3. **证据保存**：完整保存所有验证证据
4. **定期更新**：定期重新验证已验证平台

### 性能优化
1. **合理并发**：根据系统资源设置合理并发数
2. **资源监控**：监控系统资源使用情况
3. **错误处理**：完善的错误处理和重试机制
4. **结果缓存**：充分利用缓存提升效率

## 许可和支持

### 许可证
本项目采用MIT许可证，详见LICENSE文件。

### 技术支持
- 查看文档和FAQ
- 提交Issue报告问题
- 参与社区讨论

### 贡献指南
欢迎贡献代码和改进建议：
1. Fork项目
2. 创建功能分支
3. 提交Pull Request
4. 等待审核和合并

---

**系统版本**: v1.0
**最后更新**: 2025-10-20
**文档维护**: 大规模验证系统团队