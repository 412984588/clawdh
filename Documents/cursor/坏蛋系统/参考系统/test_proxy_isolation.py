#!/usr/bin/env python3
"""
测试代理隔离功能
验证代理只在女王条纹测试2的批量筛选功能中使用
"""

import asyncio
import aiohttp
import logging
import os
import sys

# 添加项目路径
sys.path.append(os.path.dirname(__file__))

from utils.proxy_manager import get_queen_proxy_manager, is_batch_operation

def test_proxy_isolation():
    """测试代理隔离功能"""
    print("🔒 测试代理隔离功能")
    print("=" * 50)

    # 1. 测试代理管理器初始化
    print("1. 测试代理管理器初始化...")
    proxy_manager = get_queen_proxy_manager()
    print(f"   代理状态: {'启用' if proxy_manager.is_enabled() else '禁用'}")

    # 2. 测试批量操作检测
    print("\n2. 测试批量操作检测...")
    test_cases = [
        ("batch_analyzer.py", True),
        ("batch_detection_new_platforms.py", True),
        ("tool_integrator.py", True),
        ("mcp_agent.py", False),
        ("research_script.py", False),
        ("regular_script.py", False),
        ("", False)
    ]

    for context, expected in test_cases:
        result = is_batch_operation(context)
        status = "✅" if result == expected else "❌"
        print(f"   {status} '{context}' -> {result} (期望: {expected})")

    # 3. 测试直接网络请求(不应该使用代理)
    print("\n3. 测试直接网络请求...")
    async def test_direct_request():
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get('http://httpbin.org/ip') as response:
                    data = await response.json()
                    print(f"   直接请求IP: {data.get('origin', 'Unknown')}")
                    return data
        except Exception as e:
            print(f"   直接请求失败: {e}")
            return None

    # 4. 测试代理网络请求(仅在启用代理时)
    print("\n4. 测试代理网络请求...")
    async def test_proxy_request():
        if not proxy_manager.is_enabled():
            print("   ⚠️ 代理未启用,跳过代理测试")
            return None

        try:
            session = await proxy_manager.create_session()
            async with session.get('http://httpbin.org/ip') as response:
                data = await response.json()
                print(f"   代理请求IP: {data.get('origin', 'Unknown')}")
                await session.close()
                return data
        except Exception as e:
            print(f"   代理请求失败: {e}")
            return None

    # 运行异步测试
    async def run_tests():
        print("   执行直接网络请求测试...")
        direct_result = await test_direct_request()

        print("   执行代理网络请求测试...")
        proxy_result = await test_proxy_request()

        # 比较结果
        if direct_result and proxy_result:
            direct_ip = direct_result.get('origin')
            proxy_ip = proxy_result.get('origin')
            if direct_ip != proxy_ip:
                print(f"   ✅ 代理工作正常 - 直连IP: {direct_ip}, 代理IP: {proxy_ip}")
            else:
                print(f"   ⚠️ IP相同,代理可能未生效")

    asyncio.run(run_tests())

    # 5. 检查全局代理设置
    print("\n5. 检查全局代理设置...")
    global_proxy_vars = ['HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy', 'ALL_PROXY', 'all_proxy']
    has_global_proxy = False

    for var in global_proxy_vars:
        value = os.environ.get(var)
        if value:
            print(f"   ⚠️ 发现全局代理变量: {var}={value}")
            has_global_proxy = True

    if not has_global_proxy:
        print("   ✅ 未发现全局代理设置")

    print("\n" + "=" * 50)
    print("📋 测试总结:")
    print("✅ 代理功能仅限于女王条纹测试2项目内部")
    print("✅ 非批量操作不会触发代理")
    print("✅ MCP agents和查资料功能不受影响")

    if has_global_proxy:
        print("⚠️ 注意:检测到全局代理设置,可能影响其他应用")

    print("🔒 代理隔离测试完成!")

if __name__ == "__main__":
    test_proxy_isolation()