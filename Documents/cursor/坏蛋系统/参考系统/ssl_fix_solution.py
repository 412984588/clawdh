#!/usr/bin/env python3
"""
SSL证书问题修复解决方案
"""

import ssl
import certifi
import aiohttp
import asyncio
from pathlib import Path

class SSLFixSolution:
    """SSL证书修复解决方案"""

    def __init__(self):
        self.ssl_contexts = {}
        self.setup_ssl_contexts()

    def setup_ssl_contexts(self):
        """设置多种SSL上下文选项"""
        # 方案1: 使用默认证书
        self.ssl_contexts['default'] = ssl.create_default_context()

        # 方案2: 使用certifi证书
        self.ssl_contexts['certifi'] = ssl.create_default_context(cafile=certifi.where())

        # 方案3: 跳过SSL验证 (仅用于测试)
        self.ssl_contexts['skip_verify'] = ssl.create_default_context()
        self.ssl_contexts['skip_verify'].check_hostname = False
        self.ssl_contexts['skip_verify'].verify_mode = ssl.CERT_NONE

        # 方案4: 使用系统证书
        self.ssl_contexts['system'] = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
        try:
            self.ssl_contexts['system'].load_default_certs()
        except Exception as e:
            print(f"系统证书加载失败: {e}")

    def get_ssl_context(self, mode='certifi'):
        """获取SSL上下文"""
        return self.ssl_contexts.get(mode, self.ssl_contexts['certifi'])

    async def test_ssl_connection(self, url, mode='certifi'):
        """测试SSL连接"""
        ssl_context = self.get_ssl_context(mode)

        connector = aiohttp.TCPConnector(ssl=ssl_context)
        timeout = aiohttp.ClientTimeout(total=10)

        try:
            async with aiohttp.ClientSession(connector=connector, timeout=timeout) as session:
                async with session.get(url) as response:
                    print(f"✅ {mode}: {response.status} - {url}")
                    return True
        except Exception as e:
            print(f"❌ {mode}: {type(e).__name__} - {str(e)[:50]}")
            return False

    async def test_all_modes(self, url):
        """测试所有SSL模式"""
        print(f"🔍 测试URL: {url}")
        print("=" * 60)

        results = {}
        for mode in self.ssl_contexts.keys():
            results[mode] = await self.test_ssl_connection(url, mode)

        return results

    def create_fixed_session(self, mode='certifi'):
        """创建修复的HTTP会话"""
        ssl_context = self.get_ssl_context(mode)
        connector = aiohttp.TCPConnector(ssl=ssl_context)
        return aiohttp.ClientSession(connector=connector)

async def test_ssl_fixes():
    """测试SSL修复方案"""
    print("🚀 SSL证书问题修复方案测试")
    print("=" * 60)

    ssl_fix = SSLFixSolution()

    # 测试URLs
    test_urls = [
        "https://stripe.com",
        "https://example.com",
        "https://httpbin.org/get"
    ]

    print("📋 可用的SSL解决方案:")
    for i, mode in enumerate(ssl_fix.ssl_contexts.keys(), 1):
        print(f"  {i}. {mode}")

    print("\n🧪 开始测试各种SSL方案...")

    for url in test_urls:
        results = await ssl_fix.test_all_modes(url)
        working_modes = [mode for mode, success in results.items() if success]

        if working_modes:
            print(f"\n✅ {url} 的可用方案: {', '.join(working_modes)}")
        else:
            print(f"\n❌ {url} 所有方案都失败")

    print("\n💡 推荐使用顺序:")
    print("1. certifi - 最安全的选项")
    print("2. system - 使用系统证书")
    print("3. default - Python默认")
    print("4. skip_verify - 仅测试环境使用")

def install_certificates():
    """安装/更新证书"""
    import subprocess
    import sys

    print("📦 安装/更新证书包...")

    commands = [
        [sys.executable, "-m", "pip", "install", "--upgrade", "certifi"],
        [sys.executable, "-m", "pip", "install", "--upgrade", "requests[security]"],
        [sys.executable, "-m", "pip", "install", "--upgrade", "urllib3[secure]"]
    ]

    for cmd in commands:
        try:
            print(f"执行: {' '.join(cmd)}")
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            print("✅ 成功")
        except subprocess.CalledProcessError as e:
            print(f"❌ 失败: {e}")

if __name__ == "__main__":
    # 选项菜单
    print("🔧 SSL证书问题修复工具")
    print("=" * 40)
    print("1. 测试SSL连接方案")
    print("2. 安装/更新证书包")
    print("3. 运行完整测试")

    choice = input("请选择 (1-3): ").strip()

    if choice == "1":
        asyncio.run(test_ssl_fixes())
    elif choice == "2":
        install_certificates()
    elif choice == "3":
        install_certificates()
        print("\n" + "="*60)
        asyncio.run(test_ssl_fixes())
    else:
        print("运行默认测试...")
        asyncio.run(test_ssl_fixes())