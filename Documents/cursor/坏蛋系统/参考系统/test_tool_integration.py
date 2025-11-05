#!/usr/bin/env python3
"""
工具集成测试脚本
作者: Jenny团队
版本: 1.0.0
"""

import asyncio
import sys
from pathlib import Path

# 添加项目根目录到Python路径
project_root = Path(__file__).parent
sys.path.append(str(project_root))

from src.tool_integrator import ToolIntegrator

async def test_tool_integration():
    """测试工具集成"""
    print("🧪 开始测试工具集成系统...")

    # 初始化集成器
    integrator = ToolIntegrator()

    # 测试网站列表
    test_sites = [
        {
            "url": "https://stripe.com",
            "name": "Stripe官方",
            "expected_stripe": True
        },
        {
            "url": "https://shopify.com",
            "name": "Shopify官方",
            "expected_stripe": True
        },
        {
            "url": "https://github.com",
            "name": "GitHub",
            "expected_stripe": False
        }
    ]

    print(f"📋 准备测试 {len(test_sites)} 个网站...")

    for i, site in enumerate(test_sites, 1):
        print(f"\n🔍 [{i}/{len(test_sites)}] 测试网站: {site['name']} ({site['url']})")

        try:
            result = await integrator.analyze_website(site['url'], site['name'])

            print(f"✅ 检测完成!")
            print(f"   支付网关: {', '.join(result.payment_gateways) if result.payment_gateways else '未检测到'}")
            print(f"   电商平台: {', '.join(result.ecommerce_platforms) if result.ecommerce_platforms else '未检测到'}")
            print(f"   技术栈: {len(result.technologies)} 种技术")
            print(f"   Stripe置信度: {result.integrated_stripe_confidence:.2f}")
            print(f"   综合评分: {result.integrated_overall_score:.2f}")

            # 验证结果
            stripe_detected = result.integrated_stripe_confidence > 0.5
            if stripe_detected == site['expected_stripe']:
                print(f"   ✅ 检测结果符合预期")
            else:
                print(f"   ⚠️ 检测结果与预期不符 (预期: {site['expected_stripe']}, 实际: {stripe_detected})")

            if result.error_message:
                print(f"   ❌ 错误: {result.error_message}")

        except Exception as e:
            print(f"   ❌ 测试失败: {str(e)}")

    print(f"\n🎉 工具集成测试完成!")

async def test_individual_tools():
    """测试各个工具的单独运行"""
    print("\n🛠️ 开始单独测试各个工具...")

    integrator = ToolIntegrator()
    test_url = "https://stripe.com"

    tools = [
        ("Payment Gateway Scanner", integrator.run_payment_gateway_scanner),
        ("Techackz", integrator.run_techackz),
        ("Wappalyzergo", integrator.run_wappalyzergo)
    ]

    for tool_name, tool_func in tools:
        print(f"\n🔧 测试 {tool_name}...")
        try:
            result = await tool_func(test_url)
            if isinstance(result, dict) and "error" not in result:
                print(f"   ✅ {tool_name} 运行成功")
                if "technologies" in result:
                    print(f"   检测到 {len(result['technologies'])} 种技术")
                elif "payment_gateways" in result:
                    print(f"   检测到支付网关: {result.get('payment_gateways', [])}")
            else:
                error_msg = result.get("error", "未知错误") if isinstance(result, dict) else str(result)
                print(f"   ⚠️ {tool_name} 返回错误: {error_msg}")
        except Exception as e:
            print(f"   ❌ {tool_name} 测试失败: {str(e)}")

async def main():
    """主测试函数"""
    print("=" * 60)
    print("🚀 女王条纹测试2 - 工具集成测试")
    print("=" * 60)

    # 检查工具目录
    tools_dir = Path(__file__).parent / "tools"
    if not tools_dir.exists():
        print(f"❌ 工具目录不存在: {tools_dir}")
        return

    print(f"✅ 工具目录: {tools_dir}")

    # 列出已安装的工具
    installed_tools = []
    for tool_dir in tools_dir.iterdir():
        if tool_dir.is_dir():
            installed_tools.append(tool_dir.name)

    print(f"📦 已安装工具: {', '.join(installed_tools)}")

    # 运行测试
    await test_individual_tools()
    await test_tool_integration()

    print("\n" + "=" * 60)
    print("🎊 测试完成!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(main())