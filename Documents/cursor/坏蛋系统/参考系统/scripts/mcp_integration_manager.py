#!/usr/bin/env python3
"""
MCP服务集成管理器
用于管理女王条纹测试2项目的MCP服务集成
"""
import json
import subprocess
import asyncio
from pathlib import Path
from typing import Dict, List, Optional
from dataclasses import dataclass
from datetime import datetime

@dataclass
class MCPService:
    name: str
    command: str
    args: List[str]
    description: str
    status: str
    api_url: Optional[str] = None
    setup_required: bool = False

class MCPIntegrationManager:
    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.config_path = self.project_root / "config" / "mcp_config.json"
        self.services = {}
        self.load_config()

    def load_config(self):
        """加载MCP配置"""
        with open(self.config_path, 'r', encoding='utf-8') as f:
            config = json.load(f)

        for name, service_config in config['mcpServers'].items():
            self.services[name] = MCPService(
                name=name,
                command=service_config['command'],
                args=service_config['args'],
                description=service_config['description'],
                status=service_config['status'],
                api_url=service_config.get('api_url'),
                setup_required=service_config.get('setup_required', False)
            )

    def get_installed_services(self) -> List[MCPService]:
        """获取已安装的服务"""
        return [service for service in self.services.values()
                if '已安装' in service.status]

    def get_services_needing_setup(self) -> List[MCPService]:
        """获取需要设置的服务"""
        return [service for service in self.services.values()
                if service.setup_required]

    def generate_setup_instructions(self) -> str:
        """生成设置说明"""
        instructions = ["# MCP服务设置说明\n"]
        instructions.append(f"生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

        # 已安装服务
        installed = self.get_installed_services()
        if installed:
            instructions.append("## ✅ 已安装的服务\n")
            for service in installed:
                instructions.append(f"### {service.name}")
                instructions.append(f"- **描述**: {service.description}")
                instructions.append(f"- **状态**: {service.status}")
                instructions.append(f"- **启动命令**: {' '.join([service.command] + service.args)}")
                instructions.append("")

        # 需要设置的服务
        need_setup = self.get_services_needing_setup()
        if need_setup:
            instructions.append("## 🔧 需要设置的服务\n")
            for service in need_setup:
                instructions.append(f"### {service.name}")
                instructions.append(f"- **描述**: {service.description}")
                instructions.append(f"- **API URL**: {service.api_url}")
                instructions.append(f"- **设置步骤**:")
                if 'exa' in service.name.lower():
                    instructions.append("  1. 访问 https://exa.ai/api-key")
                    instructions.append("  2. 注册账户并获取API密钥")
                    instructions.append("  3. 安装服务: `npm install -g @exa-labs/mcp-server-exa`")
                    instructions.append("  4. 配置环境变量: `export EXA_API_KEY=your_key_here`")
                elif 'brave' in service.name.lower():
                    instructions.append("  1. 访问 https://brave.com/search/api/")
                    instructions.append("  2. 获取API密钥")
                    instructions.append("  3. 安装服务: `npm install -g @modelcontextprotocol/server-brave-search`")
                    instructions.append("  4. 配置环境变量: `export BRAVE_API_KEY=your_key_here`")
                elif 'github' in service.name.lower():
                    instructions.append("  1. 访问 https://github.com/settings/tokens")
                    instructions.append("  2. 创建Personal Access Token")
                    instructions.append("  3. 安装服务: `npm install -g mcp-server-github`")
                    instructions.append("  4. 配置环境变量: `export GITHUB_TOKEN=your_token_here`")
                instructions.append("")

        # 集成说明
        instructions.append("## 🚀 项目集成说明\n")
        instructions.append("### 在女王条纹测试2项目中使用MCP服务:\n")
        instructions.append("1. **浏览器自动化验证**:")
        instructions.append("   - 使用Playwright服务进行实时网站验证")
        instructions.append("   - 检测Stripe Connect集成和支付流程")
        instructions.append("   - 截图和记录验证过程\n")

        instructions.append("2. **知识图谱管理**:")
        instructions.append("   - 使用Memory服务存储验证证据")
        instructions.append("   - 构建网站Stripe集成状态的知识图谱")
        instructions.append("   - 追踪检测历史和变化\n")

        instructions.append("3. **增强搜索能力**:")
        instructions.append("   - 使用Exa搜索获取技术文档和集成指南")
        instructions.append("   - 使用Brave搜索进行公司背景调查")
        instructions.append("   - 验证Stripe合作伙伴身份\n")

        return "\n".join(instructions)

    def save_setup_instructions(self):
        """保存设置说明"""
        instructions = self.generate_setup_instructions()
        output_path = self.project_root / "docs" / "mcp_setup_instructions.md"
        output_path.parent.mkdir(parents=True, exist_ok=True)

        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(instructions)

        return output_path

    async def test_service_connectivity(self, service_name: str) -> Dict:
        """测试服务连接性"""
        if service_name not in self.services:
            return {"error": f"服务 {service_name} 不存在"}

        service = self.services[service_name]
        try:
            # 简单的连接测试
            process = await asyncio.create_subprocess_exec(
                service.command, *service.args,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )

            # 等待一小段时间检查服务是否能启动
            try:
                stdout, stderr = await asyncio.wait_for(
                    process.communicate(), timeout=5.0
                )
                return {
                    "service": service_name,
                    "status": "可连接",
                    "output": stdout.decode()[:200]
                }
            except asyncio.TimeoutError:
                process.terminate()
                return {
                    "service": service_name,
                    "status": "服务启动超时",
                    "note": "服务可能需要额外配置"
                }
        except Exception as e:
            return {
                "service": service_name,
                "status": "连接失败",
                "error": str(e)
            }

def main():
    """主函数"""
    project_root = Path(__file__).parent.parent
    manager = MCPIntegrationManager(project_root)

    print("🔧 MCP服务集成管理器")
    print("=" * 50)

    # 显示已安装服务
    installed = manager.get_installed_services()
    print(f"\n✅ 已安装服务: {len(installed)}个")
    for service in installed:
        print(f"  - {service.name}: {service.status}")

    # 显示需要设置的服务
    need_setup = manager.get_services_needing_setup()
    print(f"\n🔧 需要设置服务: {len(need_setup)}个")
    for service in need_setup:
        print(f"  - {service.name} (API: {service.api_url})")

    # 保存设置说明
    output_path = manager.save_setup_instructions()
    print(f"\n📄 设置说明已保存到: {output_path}")

    print("\n🚀 下一步操作:")
    print("1. 获取需要的API密钥")
    print("2. 安装剩余的MCP服务")
    print("3. 测试服务集成")
    print("4. 在Stripe检测系统中使用MCP服务")

if __name__ == "__main__":
    main()