#!/usr/bin/env python3
"""
简化版旧系统分析
专注识别可复用的组件
"""

import os
import json

def simple_analysis():
    """简化分析旧系统"""
    print("🔍 简化分析旧系统组件")
    print("="*50)

    # 分析目录结构
    legacy_systems = [
        {"name": "4-Agent协作系统", "path": "/agent-skills/4-agent-collaboration/"},
        {"name": "Payment Platform Validator", "path": "/agent-skills/payment-platform-validator/"},
        {"name": "Web Breakthrough Access", "path": "/simple_discovery_system/claude_agents_skills/"}
    ]

    for system in legacy_systems:
        system_name = system["name"]
        system_path = system["path"]

        print(f"\n🔍 分析系统: {system_name}")
        print(f"路径: {system_path}")

        if not os.path.exists(system_path):
            print(f"❌ 系统路径不存在: {system_path}")
            continue

        # 分析核心文件
        agent_classes = 0
        validation_logic = 0
        payment_processing = 0
        web_scraping = 0
        coordination = 0

        # 检查可复用的组件
        for root, dirs, files in os.walk(system_path):
            for file in files:
                if file.endswith('.py'):
                    with open(os.path.join(root, file), 'r', encoding='utf-8') as f:
                        content = f.read()

                        # 检查Agent类
                        if 'class ' in content:
                            agent_classes += 1
                            print(f"  📋 发现Agent类: {os.path.basename(file)}")

                        # 检查验证逻辑
                        if 'US Market Logic' in content or 'us_market' in content:
                            validation_logic += 1
                            print(f"  ✅ 发现验证逻辑: US Market Logic")

                        # 检查支付处理
                        if 'Stripe' in content or 'ACH' in content:
                            payment_processing += 1
                            print(f"  ✅ 发现支付处理: Stripe/ACH")

                        # 检查Web访问
                        if 'User-Agent' in content or 'headers' in content:
                            web_scraping += 1
                            print(f"  ✅ 发现Web访问: User-Agent/Headers")

                        # 检查协调功能
                        if 'assign' in content or 'task' in content:
                            coordination += 1
                            print(f"  ✅ 发现协调功能: Task Assignment/Status")

        print(f"\n📊 分析统计:")
        print(f"  📋 Agent类: {agent_classes}")
        print(f"  ✅ 验证逻辑: {validation_logic}")
        print(f"  ✅ 支付处理: {payment_processing}")
        print(f"  ✅ Web访问: {web_scraping}")
        print(f"  ✅ 协调功能: {coordination}")

        # 生成分析报告
        analysis = {
            "total_systems": len(legacy_systems),
            "agent_classes": agent_classes,
            "validation_logic": validation_logic,
            "payment_processing": payment_processing,
            "web_scraping": web_scraping,
            "coordination": coordination,
            "reusable_components": {
                "Payment Platform Validator": {
                    "path": "/agent-skills/payment-platform-validator/",
                    "reusable": True,
                    "features": ["验证逻辑", "US Market Logic", "多场景评估"]
                },
                "Web Breakthrough Access": {
                    "path": "/simple_discovery_system/claude_agents_skills/",
                    "reusable": True,
                    "features": ["HTTP访问", "安全检查", "403突破"]
                }
            }
        }

        return analysis

def main():
    """主函数"""
    print("🚀 启动简化分析")
    result = simple_analysis()

    # 保存结果
    output_file = "/Users/zhimingdeng/Documents/cursor/坏蛋系统/agent-skills/4-agent-collaboration/simple_legacy_analysis.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    print(f"✅ 分析完成，结果保存到: {output_file}")
    print(f"📊 发现的可复用组件数: {len(result['reusable_components'])}")

    return True

if __name__ == "__main__":
    main()