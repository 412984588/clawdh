#!/usr/bin/env python3
"""
分析旧系统中有用的组件
识别可以复用的模块和功能，为系统整合提供指导
"""

import os
import sys
import json
from typing import Dict, List, Any
import glob

def analyze_legacy_system():
    """分析旧系统中可复用的组件"""
    print("🔍 分析旧系统组件和模块")
    print("="*60)

    # 1. 分析核心组件
    legacy_systems = [
        {
            "name": "4-Agent协作系统",
            "path": "/agent-skills/4-agent-collaboration/"
        },
        {
            "name": "Payment Platform Validator",
            "path": "/agent-skills/payment-platform-validator/"
        },
        {
            "name": "Web Breakthrough Access",
            "path": "/simple_discovery_system/claude_agents_skills/"
        }
    ]

    useful_components = []
    reusable_modules = []

    for system in legacy_systems:
        system_name = system["name"]
        system_path = system["path"]

        print(f"\n🔍 分析系统: {system_name}")
        print(f"路径: {system_path}")

        if not os.path.exists(system_path):
            print(f"❌ 系统路径不存在: {system_path}")
            continue

        # 分析核心文件
        core_files = []
        for root, dirs, files in os.walk(system_path):
            for file in files:
                if file.endswith('.py'):
                    core_files.append(os.path.join(root, file))

        print(f"📁 核心文件: {len(core_files)} 个")
        for file in core_files[:3]:
            print(f"  - {file}")

        # 分析配置文件
        config_files = [f for f in core_files if f.endswith('.json')]
        print(f"⚙️ 配置文件: {len(config_files)} 个")

        # 分析模块和组件
        py_files = [f for f in core_files if not f.endswith('.json')]
        print(f"🐍 模块文件: {len(py_files)} 个")

        # 识别可复用组件
        reusable_patterns = {
            "agents": ["class", "def", "register_agent", "skill"],
            "web_scraping": ["headers", "timeout", "retry"],
            "validation": ["scoring", "criteria", "us_market_logic"],
            "coordination": ["task_assignment", "status_tracking", "result_collection"]
        }

        for system in legacy_systems:
            system_name = system["name"]

            # 检查可复用性
            try:
                with open(os.path.join(system_path, "platform_discovery_coordinator.py"), 'r', encoding='utf-8') as f:
                    content = f.read()

                    # 检查Agent模式
                    for pattern in reusable_patterns["agents"]:
                        if pattern in content:
                            print(f"  ✅ {system_name}: 发现Agent模式")
                            useful_components.append({
                                "system": system_name,
                                "component": "agent_class",
                                "file": "platform_discovery_coordinator.py",
                                "reusable": True
                            })

                    # 检查验证逻辑
                    for pattern in reusable_patterns["validation"]:
                        if pattern in content:
                            print(f"  ✅ {system_name}: 发现验证模式")
                            useful_components.append({
                                "system": system_name,
                                "component": "validation_logic",
                                "reusable": True
                            })

                    # 检查支付处理
                    if "Stripe Connect" in content or "ACH" in content:
                            print(f"  ✅ {system_name}: 发现支付处理逻辑")
                            useful_components.append({
                                "system": system_name,
                                "component": "payment_processing",
                                "reusable": True
                            })

            except Exception as e:
                print(f"❌ 分析 {system_name} 失败: {e}")

        # 生成整合建议
        integration_plan = {
            "core_architecture": "4-Agent协作系统",
            "reuse_strategy": "模块化整合现有组件",
            "new_components": ["任务协调器", "综合验证器"],
            "integration_points": [
                "Payment Platform Validator可复用验证逻辑",
                "Web Breakthrough Access可复用HTTP访问技术",
                "协调器模式可以应用到其他发现任务"
            ]
        }

        print(f"\n📋 有用组件总结:")
        print(f"🔄 可复用模块: {len(useful_components)} 个")
        for component in useful_components:
            print(f"  - {component['system']}.{component['component']} ({component['file']})")

        print(f"\n💡 整合建议:")
        for point in integration_plan["integration_points"]:
            print(f"  {point}")

        return useful_components, integration_plan

def main():
    """主函数"""
    useful_components, integration_plan = analyze_legacy_system()

        # 保存分析结果
        with open("/Users/zhimingdeng/Documents/cursor/坏蛋系统/agent-skills/legacy_analysis.json", 'w', encoding='utf-8') as f:
            json.dump({
                "analysis_date": "2025-10-26",
                "useful_components": useful_components,
                "integration_plan": integration_plan
            }, f, indent=2, ensure_ascii=False)

        print(f"\n🎯 分析完成，结果已保存到: legacy_analysis.json")
        return True

if __name__ == "__main__":
    main()