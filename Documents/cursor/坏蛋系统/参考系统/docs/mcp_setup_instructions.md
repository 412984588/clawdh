# MCP服务设置说明

生成时间: 2025-10-01 15:22:44

## ✅ 已安装的服务

### playwright-browser
- **描述**: 浏览器自动化服务，用于实时网站验证和Stripe Connect检测
- **状态**: 已安装 - 弃用版本但可用
- **启动命令**: npx @modelcontextprotocol/server-puppeteer

### memory-system
- **描述**: 内存知识图谱系统，用于存储验证证据和检测结果
- **状态**: 已安装并可用
- **启动命令**: npx @modelcontextprotocol/server-memory

## 🔧 需要设置的服务

### exa-search
- **描述**: Exa搜索API服务，用于高质量技术信息搜索
- **API URL**: https://exa.ai/api-key
- **设置步骤**:
  1. 访问 https://exa.ai/api-key
  2. 注册账户并获取API密钥
  3. 安装服务: `npm install -g @exa-labs/mcp-server-exa`
  4. 配置环境变量: `export EXA_API_KEY=your_key_here`

### brave-search
- **描述**: Brave搜索API服务，用于网络搜索和验证
- **API URL**: https://brave.com/search/api/
- **设置步骤**:
  1. 访问 https://brave.com/search/api/
  2. 获取API密钥
  3. 安装服务: `npm install -g @modelcontextprotocol/server-brave-search`
  4. 配置环境变量: `export BRAVE_API_KEY=your_key_here`

### github-integration
- **描述**: GitHub集成服务，用于代码管理和协作
- **API URL**: None
- **设置步骤**:
  1. 访问 https://github.com/settings/tokens
  2. 创建Personal Access Token
  3. 安装服务: `npm install -g mcp-server-github`
  4. 配置环境变量: `export GITHUB_TOKEN=your_token_here`

## 🚀 项目集成说明

### 在女王条纹测试2项目中使用MCP服务:

1. **浏览器自动化验证**:
   - 使用Playwright服务进行实时网站验证
   - 检测Stripe Connect集成和支付流程
   - 截图和记录验证过程

2. **知识图谱管理**:
   - 使用Memory服务存储验证证据
   - 构建网站Stripe集成状态的知识图谱
   - 追踪检测历史和变化

3. **增强搜索能力**:
   - 使用Exa搜索获取技术文档和集成指南
   - 使用Brave搜索进行公司背景调查
   - 验证Stripe合作伙伴身份
