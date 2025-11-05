#!/usr/bin/env python3
"""
基础功能测试 - 女王条纹测试2项目
验证核心系统功能正常工作
"""

import sys
import asyncio
import json
from pathlib import Path

# 添加src目录到路径
sys.path.append(str(Path(__file__).parent.parent / "src"))

try:
    from stripe_detector import EnhancedStripeDetector, ConfigManager
except ImportError as e:
    print(f"❌ 导入模块失败: {e}")
    sys.exit(1)

async def test_config_manager():
    """测试配置管理器"""
    print("🔧 测试配置管理器...")

    try:
        config_manager = ConfigManager()
        config = config_manager.config

        # 验证配置结构
        assert "detection_patterns" in config
        assert "scraping" in config
        assert "scoring" in config

        print(f"✅ 配置加载成功")
        print(f"   - 检测模式: {len(config['detection_patterns'])} 类")
        print(f"   - 并发数: {config['scraping']['concurrent_requests']}")
        print(f"   - 超时时间: {config['scraping']['timeout']}秒")

        return True
    except Exception as e:
        print(f"❌ 配置管理器测试失败: {e}")
        return False

async def test_stripe_detector():
    """测试Stripe检测器"""
    print("\n🔍 测试Stripe检测器...")

    try:
        detector = EnhancedStripeDetector()

        # 测试单个域名分析
        test_domains = ["stripe.com", "example.com"]
        results = []

        for domain in test_domains:
            result = await detector.analyze_domain(domain)
            results.append(result)

            print(f"✅ 测试域名: {domain}")
            print(f"   - 公司名称: {result.company_name}")
            print(f"   - Stripe检测: {result.stripe_connect_detected}")
            print(f"   - 置信度: {result.stripe_confidence:.2f}")
            print(f"   - 总体评分: {result.overall_score:.2f}")

            if result.error_message:
                print(f"   - 错误信息: {result.error_message}")

        # 验证结果
        assert len(results) == 2
        assert all(isinstance(r, type(results[0])) for r in results)

        print("✅ Stripe检测器测试通过")
        return True

    except Exception as e:
        print(f"❌ Stripe检测器测试失败: {e}")
        return False

async def test_batch_analysis():
    """测试批量分析功能"""
    print("\n📊 测试批量分析功能...")

    try:
        detector = EnhancedStripeDetector()

        test_domains = ["stripe.com", "shopify.com", "example.com"]
        results = await detector.batch_analyze(test_domains)

        print(f"✅ 批量分析完成")
        print(f"   - 输入域名: {len(test_domains)} 个")
        print(f"   - 成功分析: {len(results)} 个")

        # 统计结果
        stripe_detected = sum(1 for r in results if r.stripe_connect_detected)
        high_score = sum(1 for r in results if r.overall_score >= 0.5)

        print(f"   - 检测到Stripe: {stripe_detected} 个")
        print(f"   - 高评分平台: {high_score} 个")

        # 生成摘要报告
        summary = detector.generate_summary_report(results)
        print(f"✅ 摘要报告生成成功")
        print(f"   - 总平台数: {summary['总平台数量']}")
        print(f"   - 平均评分: {summary['平均评分']}")

        return True

    except Exception as e:
        print(f"❌ 批量分析测试失败: {e}")
        return False

def test_file_operations():
    """测试文件操作"""
    print("\n📁 测试文件操作...")

    try:
        # 检查必要文件
        required_files = [
            "requirements.txt",
            "src/stripe_detector.py",
            "config/detection_config.json",
            "management_logs/jenny_team_takeover.json"
        ]

        missing_files = []
        for file_path in required_files:
            if not Path(file_path).exists():
                missing_files.append(file_path)

        if missing_files:
            print(f"❌ 缺少文件: {', '.join(missing_files)}")
            return False

        print(f"✅ 所有必要文件存在")

        # 检查目录
        required_dirs = ["src", "scripts", "config", "data", "logs", "results", "management_logs"]
        for dir_name in required_dirs:
            if not Path(dir_name).exists():
                print(f"❌ 缺少目录: {dir_name}")
                return False

        print(f"✅ 所有必要目录存在")

        # 测试读取配置文件
        with open("config/detection_config.json", 'r', encoding='utf-8') as f:
            config = json.load(f)
            assert "detection_patterns" in config

        print("✅ 配置文件读取正常")

        # 测试读取接管文件
        with open("management_logs/jenny_team_takeover.json", 'r', encoding='utf-8') as f:
            takeover_info = json.load(f)
            assert takeover_info["takeover_info"]["team"] == "Jenny团队"

        print("✅ 团队接管文件正常")

        return True

    except Exception as e:
        print(f"❌ 文件操作测试失败: {e}")
        return False

async def test_team_manager():
    """测试团队管理器"""
    print("\n👥 测试团队管理器...")

    try:
        # 添加scripts目录到路径
        scripts_path = Path(__file__).parent.parent / "scripts"
        if str(scripts_path) not in sys.path:
            sys.path.append(str(scripts_path))

        from jenny_team_manager import JennyTeamManager

        manager = JennyTeamManager()

        # 测试创建任务
        task_id = manager.create_task(
            name="测试任务",
            description="这是一个测试任务",
            assignee="测试员",
            priority="low",
            estimated_hours=1.0
        )

        print(f"✅ 任务创建成功: {task_id}")

        # 测试更新任务状态
        success = manager.update_task_status(task_id, "completed", 100.0)
        assert success == True
        print("✅ 任务状态更新成功")

        # 测试计算指标
        metrics = manager.calculate_metrics()
        print(f"✅ 项目指标计算成功")
        print(f"   - 总任务数: {metrics.total_tasks}")
        print(f"   - 完成任务数: {metrics.completed_tasks}")
        print(f"   - 整体进度: {metrics.overall_progress:.1f}%")

        return True

    except Exception as e:
        print(f"❌ 团队管理器测试失败: {e}")
        return False

async def main():
    """主测试函数"""
    print("🧪 女王条纹测试2 - 基础功能测试")
    print("=" * 50)

    tests = [
        ("配置管理器", test_config_manager),
        ("文件操作", test_file_operations),
        ("团队管理器", test_team_manager),
        ("Stripe检测器", test_stripe_detector),
        ("批量分析", test_batch_analysis)
    ]

    passed = 0
    failed = 0

    for test_name, test_func in tests:
        try:
            if asyncio.iscoroutinefunction(test_func):
                result = await test_func()
            else:
                result = test_func()

            if result:
                passed += 1
                print(f"✅ {test_name} 测试通过")
            else:
                failed += 1
                print(f"❌ {test_name} 测试失败")

        except Exception as e:
            failed += 1
            print(f"❌ {test_name} 测试异常: {e}")

        print("-" * 30)

    # 总结
    total_tests = len(tests)
    success_rate = (passed / total_tests) * 100 if total_tests > 0 else 0

    print(f"📊 测试总结:")
    print(f"   - 总测试数: {total_tests}")
    print(f"   - 通过: {passed}")
    print(f"   - 失败: {failed}")
    print(f"   - 成功率: {success_rate:.1f}%")

    if success_rate >= 80:
        print("\n🎉 系统基础功能测试通过！")
        print("✅ 女王条纹测试2项目已准备就绪")
        print("🚀 Jenny团队可以开始正式工作")
        return True
    else:
        print("\n⚠️  系统存在问题，建议检查失败项目")
        return False

if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)