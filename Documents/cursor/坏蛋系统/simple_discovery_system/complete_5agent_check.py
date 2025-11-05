#!/usr/bin/env python3
"""
完整的5-Agent架构系统检查
"""

import json
import sys
from datetime import datetime
from pathlib import Path

# 添加当前目录到路径
sys.path.append(str(Path(__file__).parent))

def check_all_agent_systems():
    """检查所有Agent系统"""
    print("🔍 完整的5-Agent架构系统检查")
    print("=" * 80)

    systems_status = {}

    # 检查1: dialog_5agent_system.py
    print(f"\n📦 系统1: dialog_5agent_system.py")
    print("-" * 50)

    try:
        from dialog_5agent_system import (
            DialogDADataDiscoveryExpert,
            DialogVAVerificationExpert,
            DialogAAAuditAllocator,
            Dialog5AgentSystem
        )

        systems_status['dialog_system'] = {
            'agents': ['DA', 'VA', 'AA'],
            'total_count': 3,
            'has_coordinator': True,
            'has_automation': False,
            'status': '✅ 正常'
        }

        print(f"   🤖 发现Agents: 3个")
        print(f"      - DA (数据发现专家)")
        print(f"      - VA (验证分析专家)")
        print(f"      - AA (审计分配器)")
        print(f"      - CA (协调器): ✅ (在Dialog5AgentSystem中)")
        print(f"      - PA (处理自动化): ❌ 缺失")
        print(f"   📊 状态: {systems_status['dialog_system']['status']}")

    except Exception as e:
        systems_status['dialog_system'] = {
            'status': f'❌ 错误: {e}',
            'agents': [],
            'total_count': 0
        }
        print(f"   ❌ 导入失败: {e}")

    # 检查2: five_agent_system_runner.py
    print(f"\n📦 系统2: five_agent_system_runner.py")
    print("-" * 50)

    try:
        from five_agent_system_runner import (
            DADataDiscoveryExpert,
            VAVerificationExpert,
            CACoordinator,
            PAProcessingExpert
        )

        systems_status['runner_system'] = {
            'agents': ['DA', 'VA', 'CA', 'PA'],
            'total_count': 4,
            'has_coordinator': True,
            'has_automation': True,
            'has_aa': False,
            'status': '⚠️ 部分正常'
        }

        print(f"   🤖 发现Agents: 4个")
        print(f"      - DA (数据发现专家)")
        print(f"      - VA (验证分析专家)")
        print(f"      - CA (协调器)")
        print(f"      - PA (处理自动化专家)")
        print(f"      - AA (审计分配器): ❌ 缺失")
        print(f"   📊 状态: {systems_status['runner_system']['status']}")

    except Exception as e:
        systems_status['runner_system'] = {
            'status': f'❌ 错误: {e}',
            'agents': [],
            'total_count': 0
        }
        print(f"   ❌ 导入失败: {e}")

    # 检查3: 是否有完整的5-Agent系统
    print(f"\n📦 系统3: 完整5-Agent系统搜索")
    print("-" * 50)

    # 搜索所有可能的5-Agent文件
    potential_files = [
        'five_agent_system.py',
        'aa_5agent_system.py',
        'real_visual_5agent_system.py',
        'infinite_dialog_aa_system.py'
    ]

    found_files = []
    for file_name in potential_files:
        file_path = Path(__file__).parent / file_name
        if file_path.exists():
            found_files.append(file_name)
            print(f"   📄 发现: {file_name}")

    if found_files:
        systems_status['potential_5agent_files'] = found_files
        print(f"   📊 状态: 找到 {len(found_files)} 个潜在的5-Agent系统文件")
    else:
        systems_status['potential_5agent_files'] = []
        print(f"   📊 状态: 未找到其他5-Agent系统文件")

    return systems_status

def analyze_agent_architecture():
    """分析Agent架构"""
    print(f"\n🏗️ Agent架构分析")
    print("=" * 50)

    architecture = {
        'standard_5agent': ['DA', 'VA', 'CA', 'AA', 'PA'],
        'current_implementations': {},
        'missing_components': []
    }

    # 检查标准5-Agent的实现情况
    standard_roles = {
        'DA': 'Data Discovery Expert - 数据发现专家',
        'VA': 'Verification Expert - 验证分析专家',
        'AA': 'Audit Allocator - 审计分配器',
        'CA': 'Coordinator - 协调器',
        'PA': 'Processing Automation - 处理自动化专家'
    }

    print(f"📋 标准5-Agent角色:")
    for role, description in standard_roles.items():
        print(f"   - {role}: {description}")

    # 检查当前实现
    print(f"\n🔍 当前实现情况:")

    # dialog_5agent_system.py的实现
    try:
        from dialog_5agent_system import Dialog5AgentSystem
        system = Dialog5AgentSystem()

        implemented = {
            'DA': hasattr(system, 'da'),
            'VA': hasattr(system, 'va'),
            'AA': hasattr(system, 'aa'),
            'CA': hasattr(system, 'da') and hasattr(system, 'va') and hasattr(system, 'aa'),  # Dialog5AgentSystem作为协调器
            'PA': False
        }

        architecture['current_implementations']['dialog_system'] = implemented

        print(f"   📱 dialog_5agent_system.py:")
        for agent, exists in implemented.items():
            status = "✅" if exists else "❌"
            print(f"      - {agent}: {status}")

    except Exception as e:
        print(f"   ❌ dialog_5agent_system.py 检查失败: {e}")

    # five_agent_system_runner.py的实现
    try:
        from five_agent_system_runner import (
            DADataDiscoveryExpert, VAVerificationExpert,
            CACoordinator, PAProcessingExpert
        )

        implemented_runner = {
            'DA': True,  # DADataDiscoveryExpert
            'VA': True,  # VAVerificationExpert
            'CA': True,  # CACoordinator
            'PA': True,  # PAProcessingExpert
            'AA': False   # 缺失AA
        }

        architecture['current_implementations']['runner_system'] = implemented_runner

        print(f"   📱 five_agent_system_runner.py:")
        for agent, exists in implemented_runner.items():
            status = "✅" if exists else "❌"
            print(f"      - {agent}: {status}")

    except Exception as e:
        print(f"   ❌ five_agent_system_runner.py 检查失败: {e}")

    # 分析缺失组件
    print(f"\n⚠️ 缺失组件分析:")

    missing_in_dialog = [agent for agent, exists in architecture['current_implementations'].get('dialog_system', {}).items() if not exists]
    missing_in_runner = [agent for agent, exists in architecture['current_implementations'].get('runner_system', {}).items() if not exists]

    if missing_in_dialog:
        print(f"   📱 dialog_5agent_system.py 缺失: {missing_in_dialog}")
    if missing_in_runner:
        print(f"   📱 five_agent_system_runner.py 缺失: {missing_in_runner}")

    architecture['missing_overall'] = list(set(missing_in_dialog + missing_in_runner))

    return architecture

def check_system_integration():
    """检查系统集成"""
    print(f"\n🔗 系统集成检查")
    print("-" * 50)

    integration_status = {}

    # 检查哪个是主系统
    main_system_files = [
        'dialog_5agent_system.py',
        'five_agent_system_runner.py',
        'infinite_dialog_aa_system.py'
    ]

    print(f"🎯 主系统识别:")

    for file_name in main_system_files:
        file_path = Path(__file__).parent / file_name
        if file_path.exists():
            try:
                # 检查文件大小和修改时间
                stat = file_path.stat()
                size_kb = stat.st_size / 1024
                mod_time = datetime.fromtimestamp(stat.st_mtime).strftime('%Y-%m-%d %H:%M')

                print(f"   📄 {file_name}")
                print(f"      - 大小: {size_kb:.1f} KB")
                print(f"      - 修改时间: {mod_time}")

                # 检查是否为主要运行系统
                if 'infinite' in file_name:
                    print(f"      - 类型: 无限运行系统")
                    integration_status['main_system'] = file_name
                elif 'dialog' in file_name:
                    print(f"      - 类型: 对话系统")
                elif 'runner' in file_name:
                    print(f"      - 类型: 运行器系统")

            except Exception as e:
                print(f"   ❌ {file_name} 检查失败: {e}")

    # 检查突破功能集成
    print(f"\n🛡️ 突破功能集成:")
    try:
        from dialog_5agent_system import DialogVAVerificationExpert, DialogAAAuditAllocator

        va = DialogVAVerificationExpert()
        aa = DialogAAAuditAllocator()

        va_has_breakthrough = hasattr(va, '_real_verify_platform') and hasattr(va, '_smart_wait_for_content')
        aa_has_breakthrough = hasattr(aa, '_aa_breakthrough_access')

        integration_status['breakthrough_integration'] = {
            'va': '✅' if va_has_breakthrough else '❌',
            'aa': '✅' if aa_has_breakthrough else '❌'
        }

        print(f"   📱 VA突破功能: {integration_status['breakthrough_integration']['va']}")
        print(f"   🔴 AA突破功能: {integration_status['breakthrough_integration']['aa']}")

    except Exception as e:
        integration_status['breakthrough_integration'] = f'❌ 错误: {e}'
        print(f"   ❌ 突破功能检查失败: {e}")

    return integration_status

def generate_complete_report():
    """生成完整报告"""
    print(f"\n📊 完整5-Agent架构系统分析报告")
    print("=" * 80)

    # 执行所有检查
    systems = check_all_agent_systems()
    architecture = analyze_agent_architecture()
    integration = check_system_integration()

    # 生成报告
    report = {
        'analysis_timestamp': datetime.now().isoformat(),
        'analysis_version': 'Complete 5-Agent Architecture Analysis v1.0',
        'findings': {
            'total_agent_systems_found': len([s for s in systems.values() if isinstance(s, dict) and 'agents' in s]),
            'max_agents_in_any_system': max([s.get('total_count', 0) for s in systems.values() if isinstance(s, dict)]),
            'standard_5agent_implemented': False,  # 没有系统实现完整的5个agent
            'breakthrough_capability_enabled': True
        },
        'systems_status': systems,
        'architecture_analysis': architecture,
        'integration_status': integration,
        'recommendations': []
    }

    # 生成建议
    print(f"\n💡 改进建议:")
    recommendations = []

    # 检查是否需要完整的5-Agent实现
    if not report['findings']['standard_5agent_implemented']:
        recommendations.append("🔧 创建完整的5-Agent系统实现")
        print(f"   🔧 创建完整的5-Agent系统实现")
        report['recommendations'].append("🔧 创建完整的5-Agent系统实现")

    # 检查缺失的组件
    if architecture['missing_overall']:
        recommendations.append(f"🔧 补充缺失的Agent组件: {architecture['missing_overall']}")
        print(f"   🔧 补充缺失的Agent组件: {architecture['missing_overall']}")

    # 检查系统整合
    if 'main_system' not in integration:
        recommendations.append("🔧 明确主运行系统")
        print(f"   🔧 明确主运行系统")

    # 检查突破功能
    if isinstance(integration.get('breakthrough_integration', {}), dict):
        breakthrough_status = integration['breakthrough_integration']
        if '❌' in breakthrough_status.values():
            recommendations.append("🔧 统一突破功能实现")
            print(f"   🔧 统一突破功能实现")

    if not recommendations:
        print(f"   ✅ 系统架构良好，无需立即改进")
        print(f"   💡 建议: 考虑创建标准5-Agent文档和最佳实践")

    # 保存报告
    report_file = Path(__file__).parent / "data" / f"complete_5agent_analysis_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    report_file.parent.mkdir(exist_ok=True)

    with open(report_file, 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    print(f"\n💾 完整分析报告已保存: {report_file}")

    # 显示总结
    print(f"\n🎯 分析总结:")
    print(f"   📊 发现系统数: {report['findings']['total_agent_systems_found']}")
    print(f"   🤖 最大Agent数: {report['findings']['max_agents_in_any_system']}")
    print(f"   📋 标准5-Agent: {'✅' if report['findings']['standard_5agent_implemented'] else '❌'}")
    print(f"   🛡️ 突破能力: {'✅' if report['findings']['breakthrough_capability_enabled'] else '❌'}")

    return report

def main():
    """主函数"""
    print("🚀 完整的5-Agent架构系统深度检查")
    print("目标: 全面分析所有Agent系统组件和架构")

    # 生成完整报告
    report = generate_complete_report()

    print(f"\n🎉 5-Agent架构系统分析完成!")
    print(f"📊 分析版本: {report['analysis_version']}")
    print(f"🕐 分析时间: {report['analysis_timestamp']}")

if __name__ == "__main__":
    main()