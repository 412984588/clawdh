#!/usr/bin/env python3
"""
简化版工具集成测试
"""

import asyncio
import sys
from pathlib import Path

# 添加项目路径
project_root = Path(__file__).parent
sys.path.append(str(project_root))

async def test_payment_scanner():
    """测试Payment Gateway Scanner"""
    print("🔧 测试Payment Gateway Scanner...")

    tools_dir = project_root / "tools"
    scanner_path = tools_dir / "payment-gateway-scanner"

    # 创建一个简单的测试脚本
    test_script = scanner_path / "test_stripe.py"
    test_script.write_text("""
import requests
from bs4 import BeautifulSoup
import re

def detect_payment_gateways(url):
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        response = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(response.content, 'html.parser')

        # 检测Stripe
        stripe_indicators = [
            r'stripe\\.com',
            r'js\\.stripe\\.com',
            r'checkout\\.stripe\\.com',
            r'stripe.*checkout',
            r'payment_intent',
            r'setup_intent'
        ]

        stripe_detected = False
        content = response.text.lower()
        html_content = str(soup).lower()

        for pattern in stripe_indicators:
            if re.search(pattern, content) or re.search(pattern, html_content):
                stripe_detected = True
                break

        return {
            'url': url,
            'stripe_detected': stripe_detected,
            'status_code': response.status_code
        }

    except Exception as e:
        return {'error': str(e)}

if __name__ == "__main__":
    url = "https://stripe.com"
    result = detect_payment_gateways(url)
    print(f"检测结果: {result}")
""")

    # 运行测试
    import subprocess
    result = subprocess.run([
        sys.executable, str(test_script)
    ], capture_output=True, text=True, cwd=str(scanner_path))

    print(f"输出: {result.stdout}")
    if result.stderr:
        print(f"错误: {result.stderr}")

    # 清理
    if test_script.exists():
        test_script.unlink()

async def test_wappalyzer():
    """测试Wappalyzer"""
    print("🔧 测试Wappalyzer...")

    try:
        from Wappalyzer import Wappalyzer, WebPage

        url = "https://stripe.com"
        wappalyzer = Wappalyzer.latest()
        webpage = WebPage.new_from_url(url)
        technologies = wappalyzer.analyze_with_versions(webpage)

        print(f"检测到 {len(technologies)} 种技术")

        # 查找支付相关技术
        payment_techs = []
        for tech_name, tech_data in technologies.items():
            if 'stripe' in tech_name.lower() or 'payment' in tech_name.lower():
                payment_techs.append(tech_name)

        if payment_techs:
            print(f"支付相关技术: {', '.join(payment_techs)}")
        else:
            print("未检测到支付相关技术")

    except Exception as e:
        print(f"Wappalyzer测试失败: {str(e)}")

async def test_basic_detection():
    """测试基础检测功能"""
    print("🔧 测试基础检测功能...")

    try:
        import aiohttp
        import asyncio
        from bs4 import BeautifulSoup
        import re

        async def detect_stripe_indicators(url):
            headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=headers, timeout=10) as response:
                    content = await response.text()

                    # Stripe相关模式
                    patterns = [
                        r'stripe\\.com',
                        r'js\\.stripe\\.com',
                        r'checkout\\.stripe\\.com',
                        r'stripe.*checkout',
                        r'payment_intent',
                        r'setup_intent',
                        r'connect\\.stripe\\.com'
                    ]

                    matches = []
                    for pattern in patterns:
                        found = re.findall(pattern, content, re.IGNORECASE)
                        if found:
                            matches.extend(found)

                    return {
                        'url': url,
                        'stripe_indicators': len(matches),
                        'matches': list(set(matches)),
                        'content_length': len(content)
                    }

        # 测试网站
        test_urls = [
            "https://stripe.com",
            "https://shopify.com"
        ]

        for url in test_urls:
            result = await detect_stripe_indicators(url)
            print(f"网站: {url}")
            print(f"  Stripe指示器数量: {result['stripe_indicators']}")
            if result['matches']:
                print(f"  匹配模式: {', '.join(result['matches'][:5])}")  # 只显示前5个
            print()

    except Exception as e:
        print(f"基础检测测试失败: {str(e)}")

async def main():
    """主测试函数"""
    print("=" * 60)
    print("🚀 女王条纹测试2 - 简化版集成测试")
    print("=" * 60)

    await test_basic_detection()
    await test_wappalyzer()
    await test_payment_scanner()

    print("=" * 60)
    print("🎊 简化版测试完成!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(main())