#!/usr/bin/env python3
"""
测试Web Breakthrough Agent功能
"""

from web_breakthrough_agent import WebBreakthroughAgent

async def test_web_breakthrough():
    """测试Web Breakthrough Agent"""
    print("🧪 测试Web Breakthrough Agent")

    agent = WebBreakthroughAgent()

    # 测试基本功能
    print(f"🔧 Agent ID: {agent.agent_id}")
    print(f"🔧 当前状态: {agent.status}")
    print(f"🔧 突破技术: {list(agent.breakthrough_techniques.keys())}")

    # 测试单个平台突破
    test_platform = {
        "url": "https://example-protected.com",
        "name": "test-protected-platform"
    }

    print(f"\n🧪 测试突破: {test_platform['name']}")
    result = await agent.breakthrough_protected_platform(
        test_platform["url"],
        test_platform["name"]
    )

    print(f"  🔍 突破结果: {result.get('final_status', 'unknown')}")
    print(f"  🔍 使用技术: {result.get('techniques_used', [])}")
    print(f"  🔍 耗时: {result.get('duration', 'N/A')}秒")

    # 测试性能指标
    metrics = agent.get_performance_metrics()
    print(f"\n📊 性能指标:")
    for key, value in metrics.items():
        print(f"  🔧 {key}: {value}")

    print("🧪 Web Breakthrough Agent 测试完成")

if __name__ == "__main__":
    import asyncio
    asyncio.run(test_web_breakthrough())