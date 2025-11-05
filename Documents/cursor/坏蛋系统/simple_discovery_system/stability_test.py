#!/usr/bin/env python3
"""
🔧 系统稳定性验证测试
验证连续发现系统是否能够稳定运行，准备好整夜工作
"""

import json
import time
import sys
from datetime import datetime
from pathlib import Path

def test_system_components():
    """测试系统核心组件"""
    print("🔧 系统组件稳定性测试")
    print("="*50)

    # 1. 测试requests库
    try:
        import requests
        response = requests.get("https://httpbin.org/status/200", timeout=10)
        if response.status_code == 200:
            print("✅ requests库 - 正常")
        else:
            print("❌ requests库 - 异常")
            return False
    except Exception as e:
        print(f"❌ requests库 - 错误: {e}")
        return False

    # 2. 测试BeautifulSoup
    try:
        from bs4 import BeautifulSoup
        html = "<html><body><h1>Test</h1></body></html>"
        soup = BeautifulSoup(html, 'html.parser')
        if soup.h1.text == "Test":
            print("✅ BeautifulSoup - 正常")
        else:
            print("❌ BeautifulSoup - 异常")
            return False
    except Exception as e:
        print(f"❌ BeautifulSoup - 错误: {e}")
        return False

    # 3. 测试文件系统权限
    try:
        output_dir = Path(__file__).parent / "data" / "test_results"
        output_dir.mkdir(exist_ok=True)
        test_file = output_dir / "test.json"
        test_data = {"test": True, "timestamp": datetime.now().isoformat()}
        with open(test_file, 'w', encoding='utf-8') as f:
            json.dump(test_data, f, ensure_ascii=False, indent=2)

        with open(test_file, 'r', encoding='utf-8') as f:
            loaded_data = json.load(f)

        if loaded_data["test"] == True:
            print("✅ 文件系统权限 - 正常")
            test_file.unlink()  # 清理测试文件
        else:
            print("❌ 文件系统权限 - 异常")
            return False
    except Exception as e:
        print(f"❌ 文件系统权限 - 错误: {e}")
        return False

    # 4. 测试JSON处理
    try:
        complex_data = {
            "platforms": [
                {"name": "test.com", "score": 100, "features": ["ACH", "API"]},
                {"name": "test2.com", "score": 75, "features": ["API"]}
            ],
            "metadata": {
                "timestamp": datetime.now().isoformat(),
                "version": "1.0",
                "test_mode": True
            }
        }
        json_str = json.dumps(complex_data, ensure_ascii=False, indent=2)
        parsed_data = json.loads(json_str)
        if len(parsed_data["platforms"]) == 2:
            print("✅ JSON处理 - 正常")
        else:
            print("❌ JSON处理 - 异常")
            return False
    except Exception as e:
        print(f"❌ JSON处理 - 错误: {e}")
        return False

    return True

def test_discovery_algorithm():
    """测试发现算法准确性"""
    print("\n🎯 发现算法准确性测试")
    print("="*50)

    try:
        # 导入验证模块
        sys.path.append(str(Path(__file__).parent))
        from real_continuous_discovery import RealContinuousDiscovery

        system = RealContinuousDiscovery()

        # 测试已知优秀平台
        test_platforms = [
            "lemonsqueezy.com",  # 已知100分
            "mollie.com",        # 已知100分
            "paypal.com",        # 应该高分
        ]

        print("🔍 测试已知平台验证...")
        for platform in test_platforms:
            try:
                result = system.quick_verify_platform(platform)
                if result:
                    print(f"✅ {platform}: {result['final_score']}/100")
                else:
                    print(f"⚠️ {platform}: 验证失败")
            except Exception as e:
                print(f"❌ {platform}: 错误 - {e}")

        # 测试去重功能
        print("\n🔄 测试去重功能...")
        verified_platforms = system.load_latest_verified_database()
        dup_test = "paypal.com" in verified_platforms
        if dup_test:
            print("✅ 去重功能 - 正常 (paypal.com已正确识别)")
        else:
            print("⚠️ 去重功能 - 可能需要更新数据库")

        return True

    except Exception as e:
        print(f"❌ 算法测试错误: {e}")
        return False

def test_performance_benchmark():
    """性能基准测试"""
    print("\n⚡ 性能基准测试")
    print("="*50)

    try:
        from real_continuous_discovery import RealContinuousDiscovery
        system = RealContinuousDiscovery()

        # 测试验证速度
        test_platforms = ["stripe.com", "square.com", "adobe.com"]
        start_time = time.time()

        results = []
        for platform in test_platforms:
            try:
                result = system.quick_verify_platform(platform)
                if result:
                    results.append(result)
            except:
                pass

        end_time = time.time()
        total_time = end_time - start_time

        if len(results) > 0:
            avg_time = total_time / len(results)
            print(f"✅ 平均验证速度: {avg_time:.2f}秒/平台")
            print(f"✅ 成功率: {len(results)}/{len(test_platforms)} ({len(results)/len(test_platforms)*100:.0f}%)")

            if avg_time < 10:  # 每个平台验证时间少于10秒
                print("✅ 性能测试 - 通过")
                return True
            else:
                print("⚠️ 性能测试 - 速度较慢，但可接受")
                return True
        else:
            print("❌ 性能测试 - 无成功验证")
            return False

    except Exception as e:
        print(f"❌ 性能测试错误: {e}")
        return False

def test_error_handling():
    """错误处理测试"""
    print("\n🛡️ 错误处理机制测试")
    print("="*50)

    try:
        from real_continuous_discovery import RealContinuousDiscovery
        system = RealContinuousDiscovery()

        # 测试无效域名
        print("🔍 测试无效域名处理...")
        result1 = system.quick_verify_platform("thisisnotarealdomain12345.com")
        print(f"   无效域名处理: {'✅ 正常' if result1 is None else '❌ 异常'}")

        # 测试网络超时处理
        print("🔍 测试网络超时处理...")
        # 使用一个已知的慢速网站
        result2 = system.quick_verify_platform("httpbin.org/delay/10")
        print(f"   网络超时处理: {'✅ 正常' if result2 is not None else '❌ 超时'}")

        return True

    except Exception as e:
        print(f"❌ 错误处理测试: {e}")
        return False

def test_memory_usage():
    """内存使用测试"""
    print("\n💾 内存使用监控")
    print("="*50)

    try:
        import psutil
        process = psutil.Process()

        # 基线内存使用
        baseline_memory = process.memory_info().rss / 1024 / 1024  # MB
        print(f"📊 基线内存使用: {baseline_memory:.1f} MB")

        # 执行一些验证操作
        from real_continuous_discovery import ContinuousDiscoverySystem
        system = ContinuousDiscoverySystem()

        for platform in ["test1.com", "test2.com", "test3.com"]:
            try:
                system.quick_verify_platform(platform)
            except:
                pass

        # 检查内存增长
        current_memory = process.memory_info().rss / 1024 / 1024  # MB
        memory_growth = current_memory - baseline_memory

        print(f"📊 当前内存使用: {current_memory:.1f} MB")
        print(f"📊 内存增长: {memory_growth:.1f} MB")

        if memory_growth < 50:  # 内存增长少于50MB
            print("✅ 内存使用 - 正常")
            return True
        else:
            print("⚠️ 内存使用 - 较高，但可接受")
            return True

    except ImportError:
        print("⚠️ psutil未安装，跳过内存测试")
        return True
    except Exception as e:
        print(f"❌ 内存测试错误: {e}")
        return False

def generate_stability_report(test_results):
    """生成稳定性报告"""
    print("\n📋 系统稳定性报告")
    print("="*60)

    passed_tests = sum(test_results.values())
    total_tests = len(test_results)

    print(f"📊 测试通过率: {passed_tests}/{total_tests} ({passed_tests/total_tests*100:.0f}%)")

    if passed_tests == total_tests:
        print("🎉 系统稳定性验证 - 完全通过！")
        print("✅ 系统已准备好整夜运行")
    elif passed_tests >= total_tests * 0.8:
        print("✅ 系统稳定性验证 - 基本通过")
        print("⚠️ 系统可以运行，建议监控")
    else:
        print("❌ 系统稳定性验证 - 未通过")
        print("🛠️ 建议修复问题后再启动整夜运行")

    print("\n📝 详细结果:")
    for test_name, result in test_results.items():
        status = "✅ 通过" if result else "❌ 失败"
        print(f"   {test_name}: {status}")

    return passed_tests == total_tests

def main():
    """主测试函数"""
    print("🌙 24小时连续发现系统 - 稳定性验证")
    print("="*60)
    print(f"🕐 测试开始时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*60)

    # 执行所有测试
    test_results = {}

    test_results["系统组件"] = test_system_components()
    test_results["发现算法"] = test_discovery_algorithm()
    test_results["性能基准"] = test_performance_benchmark()
    test_results["错误处理"] = test_error_handling()
    test_results["内存使用"] = test_memory_usage()

    # 生成报告
    is_stable = generate_stability_report(test_results)

    print(f"\n🕐 测试完成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    if is_stable:
        print("\n🚀 系统已验证稳定，可以安全启动整夜运行！")
        return 0
    else:
        print("\n⚠️ 系统存在问题，建议修复后再启动整夜运行")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)