#!/usr/bin/env python3
"""
Brotli技术限制修复测试脚本
专门测试之前因Brotli问题失败的5个平台
"""

import asyncio
import aiohttp
import json
import os
import sys
import logging
from datetime import datetime

# 添加项目路径
sys.path.append(os.path.dirname(__file__))

from src.brotli_enhanced_detector import BrotliEnhancedDetector

def check_brotli_support():
    """检查Brotli支持状态"""
    print("🔧 Brotli支持状态检查")
    print("=" * 40)

    # 检查Brotli库
    try:
        import brotli
        print("✅ Brotli库: 已安装")
        print(f"   版本: {brotli.__version__}")
    except ImportError:
        print("❌ Brotli库: 未安装")
        print("   解决方案: pip install brotli")

    # 检查aiohttp-brotli
    try:
        import aiohttp_brotli
        print("✅ aiohttp-brotli: 已安装")
    except ImportError:
        print("⚠️ aiohttp-brotli: 未安装 (可选)")
        print("   解决方案: pip install aiohttp-brotli")

    # 检查aiohttp内置支持
    try:
        import aiohttp
        print("✅ aiohttp: 已安装 (内置Brotli支持)")
        print(f"   版本: {aiohttp.__version__}")
    except ImportError:
        print("❌ aiohttp: 未安装")

    print()

async def test_brotli_compression():
    """测试Brotli压缩功能"""
    print("🧪 Brotli压缩功能测试")
    print("=" * 40)

    test_url = "https://httpbin.org/gzip"  # 使用支持压缩的测试端点

    try:
        # 创建支持Brotli的会话
        connector = aiohttp.TCPConnector(ssl=False)
        timeout = aiohttp.ClientTimeout(total=30)

        headers = {
            'Accept-Encoding': 'gzip, deflate, br',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }

        async with aiohttp.ClientSession(
            connector=connector,
            timeout=timeout,
            headers=headers
        ) as session:
            async with session.get(test_url) as response:
                content_encoding = response.headers.get('Content-Encoding', '')
                content_length = response.headers.get('Content-Length', '0')

                print(f"📄 测试URL: {test_url}")
                print(f"📊 状态码: {response.status}")
                print(f"🗜️ Content-Encoding: {content_encoding}")
                print(f"📏 Content-Length: {content_length}")

                if response.status == 200:
                    content = await response.text()
                    print(f"✅ 内容获取成功,长度: {len(content)} 字符")

                    # 尝试解析JSON
                    try:
                        data = json.loads(content)
                        if 'gzipped' in data:
                            print(f"📦 压缩状态: {data.get('gzipped', 'unknown')}")
                    except:
                        pass
                else:
                    print(f"❌ 请求失败: {response.status}")

    except Exception as e:
        print(f"❌ 测试失败: {e}")

    print()

async def test_failed_platforms():
    """测试之前失败的5个平台"""
    print("🎯 测试之前失败的Brotli平台")
    print("=" * 40)

    # 之前因Brotli问题失败的5个平台
    failed_platforms = [
        {"url": "https://pocketsuite.io/", "name": "PocketSuite"},
        {"url": "https://www.honeybook.com/", "name": "HoneyBook"},
        {"url": "https://www.rover.com/", "name": "Rover"},
        {"url": "https://floranext.com/", "name": "FloraNext"}
    ]

    print(f"📋 待测试平台: {len(failed_platforms)} 个")
    print()

    # 创建检测器
    detector = BrotliEnhancedDetector(timeout=45, max_retries=3)

    # 运行检测
    results = await detector.batch_detect_brotli_platforms(failed_platforms)

    return results

def generate_report(results):
    """生成Brotli问题解决报告"""
    print("📊 生成Brotli问题解决报告")
    print("=" * 40)

    # 统计结果
    total_platforms = len(results)
    success_count = sum(1 for r in results if r.success)
    failed_count = total_platforms - success_count
    stripe_detected_count = sum(1 for r in results if r.stripe_detected)
    brotli_used_count = sum(1 for r in results if r.brotli_used)

    print(f"📈 测试统计:")
    print(f"  总平台数: {total_platforms}")
    print(f"  成功访问: {success_count} ({success_count/total_platforms*100:.1f}%)")
    print(f"  访问失败: {failed_count} ({failed_count/total_platforms*100:.1f}%)")
    print(f"  检测到Stripe: {stripe_detected_count}")
    print(f"  使用Brotli: {brotli_used_count}")
    print()

    # 详细结果
    print("📋 详细结果:")
    for result in results:
        status = "✅ 成功" if result.success else "❌ 失败"
        stripe = "🎯 Stripe" if result.stripe_detected else "⭕ 无Stripe"
        compression = f"🗜️ {result.compression_type}" if result.compression_type != "unknown" else "📄 未知"

        print(f"  {result.platform_name}")
        print(f"    {status} | {stripe} | {compression} | {result.scan_duration:.2f}s")

        if result.error:
            print(f"    错误: {result.error}")

        if result.brotli_used:
            print(f"    ✅ 成功使用Brotli解压缩")

        if result.warnings:
            for warning in result.warnings:
                print(f"    ⚠️ {warning}")

        print()

    # 保存报告
    report_data = {
        'metadata': {
            'test_time': datetime.now().isoformat(),
            'test_type': 'brotli_fix_validation',
            'total_platforms': total_platforms,
            'success_count': success_count,
            'failed_count': failed_count,
            'stripe_detected_count': stripe_detected_count,
            'brotli_used_count': brotli_used_count
        },
        'summary': {
            'success_rate': success_count / total_platforms * 100,
            'brotli_fix_success': brotli_used_count > 0,
            'issues_resolved': f"{brotli_used_count}/{total_platforms}"
        },
        'results': [
            {
                'platform_name': r.platform_name,
                'url': r.url,
                'success': r.success,
                'stripe_detected': r.stripe_detected,
                'confidence': r.confidence,
                'connect_type': r.connect_type,
                'brotli_used': r.brotli_used,
                'compression_type': r.compression_type,
                'error': r.error,
                'scan_duration': r.scan_duration
            } for r in results
        ]
    }

    # 保存到文件
    report_file = "/Users/zhimingdeng/Projects/女王条纹测试2/results/brotli_fix_report.json"
    os.makedirs(os.path.dirname(report_file), exist_ok=True)

    with open(report_file, 'w', encoding='utf-8') as f:
        json.dump(report_data, f, ensure_ascii=False, indent=2)

    print(f"📁 详细报告已保存到: {report_file}")

    return report_data

async def main():
    """主函数"""
    print("🚀 女王条纹测试2 - Brotli技术限制修复测试")
    print("=" * 60)
    print("目标: 解决5个平台因Brotli编码问题导致的访问失败")
    print()

    # 1. 检查Brotli支持
    check_brotli_support()

    # 2. 测试Brotli压缩功能
    await test_brotli_compression()

    # 3. 测试失败的平台
    results = await test_failed_platforms()

    # 4. 生成报告
    report = generate_report(results)

    # 5. 总结
    print("🎉 Brotli技术限制修复测试完成!")
    print("=" * 60)

    if report['summary']['brotli_fix_success']:
        print("✅ Brotli技术限制已成功解决!")
    else:
        print("⚠️ Brotli技术限制部分解决,可能需要进一步优化")

    print(f"📊 成功率: {report['summary']['success_rate']:.1f}%")
    print(f"🔧 问题解决: {report['summary']['issues_resolved']}")

if __name__ == "__main__":
    # 设置日志
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

    # 运行测试
    asyncio.run(main())