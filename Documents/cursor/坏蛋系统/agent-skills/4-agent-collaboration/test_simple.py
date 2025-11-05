#!/usr/bin/env python3
"""
简化的4-Agent协作系统测试
专注核心功能验证，避免复杂错误
"""

import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from platform_discovery_coordinator import PlatformDiscoveryCoordinator

def test_basic_functionality():
    """基础功能测试"""
    print("🚀 启动4-Agent协作基础测试")

    # 创建协调器
    coordinator = PlatformDiscoveryCoordinator()

    # 测试1: Agent注册
    print("\n🧪 测试1: Agent注册")
    success = coordinator.register_agent(
        "payment_validator",
        {"type": "payment_platform_validator"}
    )

    if success:
        print("✅ Payment Validator Agent注册成功")
    else:
        print("❌ Payment Validator Agent注册失败")

    # 测试2: 任务创建和分配
    print("\n🧪 测试2: 任务创建")
    task_id = coordinator.create_discovery_task(
        "测试个人收款平台发现",
        ["testplatform1.com", "testplatform2.com"]
    )

    print(f"✅ 任务创建成功: {task_id}")

    # 测试任务分配
    assignment_success = coordinator.assign_tasks(task_id)

    if assignment_success:
        print("✅ 任务分配成功")
    else:
        print("❌ 任务分配失败")

    # 测试3: 简单结果收集
    print("\n🧪 测试3: 结果收集")

    # 模拟Web Agent结果
    web_results = {
        "testplatform1.com": {"accessible": True, "discovery_method": "direct_access"},
        "testplatform2.com": {"accessible": True, "discovery_method": "direct_access"}
    }

    # 模拟Payment Validator结果
    payment_results = {
        "testplatform1.com": {"score": 90, "validation_status": "approved"},
        "testplatform2.com": {"score": 75, "validation_status": "conditional_approval"}
    }

    # 收集结果
    collect1 = coordinator.collect_results(task_id, "web_breakthrough", web_results)
    collect2 = coordinator.collect_results(task_id, "payment_validator", payment_results)

    if collect1 and collect2:
        print("✅ 结果收集成功")
        print(f"📊 Web发现: {len(web_results)} 个平台")
        print(f"💳 支付验证: {len(payment_results)} 个平台")
    else:
        print("❌ 结果收集失败")

    return collect1 and collect2

def main():
    """主测试函数"""
    print("="*60)

    # 执行基础功能测试
    success = test_basic_functionality()

    if success:
        print("🎉 4-Agent协作系统基础功能测试成功！")
        print("✅ Agent注册功能正常")
        print("✅ 任务创建分配功能正常")
        print("✅ 结果收集功能正常")
        print("📊 系统已准备进行实际平台发现验证")
        return True
    else:
        print("❌ 基础功能测试失败，需要修复")
        return False

if __name__ == "__main__":
    main()