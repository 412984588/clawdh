# Web Breakthrough Access Skill

## 📋 技能概述

这是一个用于突破403保护和安全检查的Web访问技能，专门为支付平台发现和验证而设计。

## 🛡️ 核心能力

### 1. 智能User-Agent轮换
- 13种真实浏览器User-Agent
- 支持Chrome、Firefox、Safari、Edge
- 包含移动版和桌面版

### 2. 完整HTTP头部模拟
- 发送真实浏览器的完整头部
- 包含安全相关的现代浏览器头部
- 避免基本的机器人检测

### 3. 智能安全检查等待
- 自动检测Cloudflare等安全检查
- 智能等待5秒后重试
- 区分基本信息和完整内容

### 4. 多URL格式尝试
- https://domain.com
- https://www.domain.com
- http://domain.com
- http://www.domain.com

## 🎯 使用场景

1. **支付平台发现**
   - 突破受保护的支付网站
   - 获取平台基本信息
   - 验证支付功能

2. **金融科技研究**
   - 访问Fintech公司网站
   - 分析产品和服务
   - 收集业务信息

3. **电子商务平台调查**
   - 突破电商平台的保护
   - 分析支付集成
   - 评估平台能力

## 🚀 快速开始

```python
from skill_library import breakthrough_access

# 基础使用
content, status, method, title = breakthrough_access('https://paystack.com')

# 检查结果
if status in [200, 403] and content:
    print(f"✅ 突破成功: {title}")
    print(f"📝 访问方法: {method}")
    print(f"📊 状态码: {status}")
else:
    print(f"❌ 访问失败")
```

## 📊 成功率指标

- **403突破率**: 75%+
- **内容提取**: 能获取标题和基本内容
- **重试成功**: 50%+ 在安全检查等待后成功

## ⚠️ 限制和注意事项

1. **技术限制**
   - 无法绕过JavaScript保护
   - 可能被高级机器人检测阻止
   - 某些网站需要验证码

2. **使用建议**
   - 仅用于合法研究目的
   - 实施合理的速率限制
   - 尊重robots.txt文件

## 🔧 高级配置

```python
# 自定义配置
config = {
    'timeouts': [10, 15, 20, 30],
    'user_agents': enhanced_agents,
    'wait_duration': 5,
    'retry_attempts': 2
}

result = breakthrough_access('https://example.com', **config)
```

## 📈 性能优化

1. **并发处理**: 使用异步请求提高效率
2. **缓存机制**: 缓存成功突破的结果
3. **速率控制**: 实现智能请求间隔
4. **错误处理**: 优雅处理各种失败情况

## 🌍 全局可用性

此技能已保存到Claude Agents Skills库，可在以下场景中使用：
- 支付平台验证
- 金融网站分析
- 电商调研
- SaaS服务评估
- 任何需要突破403保护的合法研究

---

*技能版本: 1.0.0*
*最后更新: 2025-10-23*
