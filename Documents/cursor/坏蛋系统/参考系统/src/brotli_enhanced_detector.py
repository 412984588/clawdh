#!/usr/bin/env python3
"""
Brotli增强检测器
专门解决Brotli压缩编码的技术限制问题
作者: Jenny团队
版本: 1.0.0
"""

import asyncio
import aiohttp
import ssl
import json
import logging
import re
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
from datetime import datetime
from urllib.parse import urljoin, urlparse
import certifi
from bs4 import BeautifulSoup

# 尝试导入Brotli支持
try:
    import brotli
    BROTLI_AVAILABLE = True
except ImportError:
    BROTLI_AVAILABLE = False
    logging.warning("Brotli库未安装，将使用aiohttp的内置Brotli支持")

try:
    import aiohttp_brotli
    AIOHTTP_BROTLI_AVAILABLE = True
except ImportError:
    AIOHTTP_BROTLI_AVAILABLE = False
    logging.warning("aiohttp-brotli库未安装")

@dataclass
class BrotliDetectionResult:
    """Brotli增强检测结果"""
    url: str
    platform_name: str
    success: bool
    stripe_detected: bool
    confidence: float
    connect_type: str
    self_registration: bool
    payment_capability: bool
    evidence_count: int
    evidence: Dict[str, List[str]]
    scan_duration: float
    detection_time: str
    error: Optional[str] = None
    warnings: List[str] = None
    brotli_used: bool = False
    compression_type: str = "unknown"

    def __post_init__(self):
        if self.warnings is None:
            self.warnings = []

class BrotliEnhancedDetector:
    """Brotli增强检测器"""

    def __init__(self, timeout: int = 45, max_retries: int = 3):
        self.timeout = timeout
        self.max_retries = max_retries

        # 配置SSL上下文
        self.ssl_context = ssl.create_default_context()
        self.ssl_context.check_hostname = False
        self.ssl_context.verify_mode = ssl.CERT_NONE

        # 设置日志
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)

        # 检测模式
        self.stripe_patterns = {
            'js_patterns': [
                r'js\.stripe\.com',
                r'checkout\.stripe\.com',
                r'connect\.stripe\.com',
                r'api\.stripe\.com',
                r'stripe\.com/v3/',
                r'stripe\.js',
                r'stripe.*checkout',
                r'stripe.*payment',
                r'stripe.*connect'
            ],
            'html_patterns': [
                r'stripe.*checkout',
                r'stripe.*payment',
                r'stripe.*connect',
                r'checkout.*session',
                r'payment.*intent',
                r'setup.*intent',
                r'stripe.*customer',
                r'stripe.*subscription'
            ],
            'api_patterns': [
                r'stripe\.com/v3/',
                r'api\.stripe\.com',
                r'checkout\.stripe\.com',
                r'connect\.stripe\.com'
            ]
        }

    def create_session_with_brotli(self) -> aiohttp.ClientSession:
        """创建支持Brotli的会话"""

        # 配置连接器，支持多种压缩编码
        connector = aiohttp.TCPConnector(
            ssl=self.ssl_context,
            limit=10,
            enable_cleanup_closed=True
        )

        # 配置超时
        timeout = aiohttp.ClientTimeout(total=self.timeout)

        # 配置头部，明确支持多种编码
        headers = {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',  # 明确支持Brotli (br)
            'Accept-Language': 'en-US,en;q=0.9',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        }

        # 创建会话
        session = aiohttp.ClientSession(
            connector=connector,
            timeout=timeout,
            headers=headers
        )

        return session

    async def fetch_with_brotli_support(self, session: aiohttp.ClientSession, url: str) -> Tuple[Optional[str], Optional[str], Dict[str, Any]]:
        """获取内容，支持Brotli解压缩"""

        compression_info = {
            'content_encoding': None,
            'content_length': 0,
            'compressed_length': 0,
            'brotli_used': False,
            'compression_type': 'none'
        }

        try:
            async with session.get(url) as response:
                # 获取压缩信息
                content_encoding = response.headers.get('Content-Encoding', '').lower()
                compression_info['content_encoding'] = content_encoding
                compression_info['content_length'] = response.headers.get('Content-Length', '0')

                self.logger.info(f"Content-Encoding: {content_encoding}")

                # 检测压缩类型
                if 'br' in content_encoding:
                    compression_info['brotli_used'] = True
                    compression_info['compression_type'] = 'brotli'
                elif 'gzip' in content_encoding:
                    compression_info['compression_type'] = 'gzip'
                elif 'deflate' in content_encoding:
                    compression_info['compression_type'] = 'deflate'

                # 读取内容
                content = await response.text()
                compression_info['compressed_length'] = len(content.encode('utf-8'))

                return content, None, compression_info

        except Exception as e:
            error_msg = str(e)
            self.logger.error(f"获取内容失败 {url}: {error_msg}")
            return None, error_msg, compression_info

    def analyze_stripe_indicators(self, content: str, url: str) -> Dict[str, Any]:
        """分析Stripe指标"""
        result = {
            'stripe_detected': False,
            'confidence': 0.0,
            'connect_type': 'Unknown',
            'self_registration': False,
            'payment_capability': False,
            'evidence_count': 0,
            'evidence': {
                'js_indicators': [],
                'html_indicators': [],
                'api_indicators': [],
                'business_indicators': []
            }
        }

        try:
            # 解析HTML
            soup = BeautifulSoup(content, 'html.parser')

            # 检查JavaScript文件
            scripts = soup.find_all('script')
            for script in scripts:
                if script.src:
                    script_src = str(script.src)
                    for pattern_name, patterns in self.stripe_patterns.items():
                        if pattern_name == 'js_patterns':
                            for pattern in patterns:
                                if re.search(pattern, script_src, re.IGNORECASE):
                                    result['evidence']['js_indicators'].append(f"JS: {script_src}")
                                    result['stripe_detected'] = True

            # 检查页面内容
            page_text = soup.get_text().lower()
            for pattern in self.stripe_patterns['html_patterns']:
                matches = re.findall(pattern, page_text, re.IGNORECASE)
                for match in matches:
                    result['evidence']['html_indicators'].append(f"Content: {match}")
                    result['stripe_detected'] = True

            # 检查表单和链接
            forms = soup.find_all('form')
            for form in forms:
                form_action = form.get('action', '')
                if any(keyword in form_action.lower() for keyword in ['stripe', 'checkout', 'payment']):
                    result['evidence']['html_indicators'].append(f"Form: {form_action}")
                    result['stripe_detected'] = True

            # 计算置信度
            total_evidence = sum(len(indicators) for indicators in result['evidence'].values())
            result['evidence_count'] = total_evidence

            if total_evidence > 0:
                result['confidence'] = min(0.1 * total_evidence, 0.9)

                # 判断Connect类型
                if any('connect' in evidence.lower() for evidence in result['evidence']['js_indicators']):
                    result['connect_type'] = 'Express'
                elif any('api' in evidence.lower() for evidence in result['evidence']['api_indicators']):
                    result['connect_type'] = 'Custom'

            # 检查自注册功能
            if any(keyword in page_text for keyword in ['sign up', 'register', 'create account', 'get started']):
                result['self_registration'] = True

            # 检查支付能力
            if any(keyword in page_text for keyword in ['payment', 'checkout', 'buy', 'purchase']):
                result['payment_capability'] = True

        except Exception as e:
            self.logger.error(f"内容分析失败: {e}")

        return result

    async def detect_platform(self, url: str, name: str) -> BrotliDetectionResult:
        """检测单个平台（支持Brotli）"""
        result = BrotliDetectionResult(
            url=url,
            platform_name=name,
            success=False,
            stripe_detected=False,
            confidence=0.0,
            connect_type='Unknown',
            self_registration=False,
            payment_capability=False,
            evidence_count=0,
            evidence={},
            scan_duration=0.0,
            detection_time=datetime.now().isoformat()
        )

        start_time = datetime.now()

        try:
            # 创建支持Brotli的会话
            async with self.create_session_with_brotli() as session:
                content, error, compression_info = await self.fetch_with_brotli_support(session, url)

                if content and not error:
                    # 更新压缩信息
                    result.brotli_used = compression_info['brotli_used']
                    result.compression_type = compression_info['compression_type']

                    # 分析Stripe指标
                    analysis = self.analyze_stripe_indicators(content, url)
                    result.stripe_detected = analysis['stripe_detected']
                    result.confidence = analysis['confidence']
                    result.connect_type = analysis['connect_type']
                    result.self_registration = analysis['self_registration']
                    result.payment_capability = analysis['payment_capability']
                    result.evidence_count = analysis['evidence_count']
                    result.evidence = analysis['evidence']
                    result.success = True

                    # 添加压缩信息到evidence
                    if result.brotli_used:
                        result.warnings.append(f"成功使用Brotli解压缩")
                        result.evidence['technical'] = [f"Brotli压缩类型: {result.compression_type}"]
                else:
                    result.error = error

        except Exception as e:
            result.error = f"检测异常: {str(e)}"
            self.logger.error(f"检测异常 {url}: {e}")

        # 计算扫描时间
        end_time = datetime.now()
        result.scan_duration = (end_time - start_time).total_seconds()

        return result

    async def batch_detect_brotli_platforms(self, platforms: List[Dict[str, str]]) -> List[BrotliDetectionResult]:
        """批量检测Brotli平台"""
        self.logger.info(f"开始批量检测 {len(platforms)} 个平台（支持Brotli）")

        results = []
        for platform in platforms:
            url = platform['url']
            name = platform['name']

            self.logger.info(f"检测平台: {name} ({url})")
            result = await self.detect_platform(url, name)
            results.append(result)

            # 输出结果摘要
            status = "✅ 成功" if result.success else "❌ 失败"
            stripe_status = "🎯 检测到Stripe" if result.stripe_detected else "⭕ 未检测到Stripe"
            brotli_status = "🗜️ 使用Brotli" if result.brotli_used else "📄 普通压缩"

            self.logger.info(f"  {status} | {stripe_status} | {brotli_status} | 耗时: {result.scan_duration:.2f}s")

        # 生成摘要报告
        success_count = sum(1 for r in results if r.success)
        stripe_count = sum(1 for r in results if r.stripe_detected)
        brotli_count = sum(1 for r in results if r.brotli_used)

        self.logger.info("=" * 60)
        self.logger.info("🎯 批量检测完成！")
        self.logger.info(f"  总平台数: {len(platforms)}")
        self.logger.info(f"  成功访问: {success_count}")
        self.logger.info(f"  检测到Stripe: {stripe_count}")
        self.logger.info(f"  使用Brotli: {brotli_count}")
        self.logger.info("=" * 60)

        return results

def main():
    """主函数 - 测试之前失败的Brotli平台"""
    print("🚀 Brotli增强检测器 - 解决技术限制测试")
    print("=" * 60)

    # 之前失败的5个平台
    failed_platforms = [
        {"url": "https://pocketsuite.io/", "name": "PocketSuite"},
        {"url": "https://www.honeybook.com/", "name": "HoneyBook"},
        {"url": "https://www.rover.com/", "name": "Rover"},
        {"url": "https://floranext.com/", "name": "FloraNext"}
    ]

    print(f"📋 测试平台: {len(failed_platforms)} 个之前因Brotli问题失败的平台")
    print()

    # 检查Brotli支持
    print("🔧 检查Brotli支持状态:")
    print(f"  Brotli库: {'✅ 已安装' if BROTLI_AVAILABLE else '❌ 未安装'}")
    print(f"  aiohttp-brotli: {'✅ 已安装' if AIOHTTP_BROTLI_AVAILABLE else '❌ 未安装'}")
    print()

    # 创建检测器
    detector = BrotliEnhancedDetector()

    # 运行批量检测
    async def run_test():
        results = await detector.batch_detect_brotli_platforms(failed_platforms)

        # 保存结果
        output_file = "/Users/zhimingdeng/Projects/女王条纹测试2/results/brotli_test_results.json"
        os.makedirs(os.path.dirname(output_file), exist_ok=True)

        # 转换为可序列化格式
        serializable_results = []
        for result in results:
            result_dict = {
                'url': result.url,
                'platform_name': result.platform_name,
                'success': result.success,
                'stripe_detected': result.stripe_detected,
                'confidence': result.confidence,
                'connect_type': result.connect_type,
                'self_registration': result.self_registration,
                'payment_capability': result.payment_capability,
                'evidence_count': result.evidence_count,
                'evidence': result.evidence,
                'scan_duration': result.scan_duration,
                'detection_time': result.detection_time,
                'error': result.error,
                'warnings': result.warnings,
                'brotli_used': result.brotli_used,
                'compression_type': result.compression_type
            }
            serializable_results.append(result_dict)

        # 添加元数据
        output_data = {
            'metadata': {
                'test_time': datetime.now().isoformat(),
                'total_platforms': len(failed_platforms),
                'brotli_support': {
                    'brotli_available': BROTLI_AVAILABLE,
                    'aiohttp_brotli_available': AIOHTTP_BROTLI_AVAILABLE
                }
            },
            'results': serializable_results
        }

        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, ensure_ascii=False, indent=2)

        print(f"📁 结果已保存到: {output_file}")

    # 运行测试
    asyncio.run(run_test())

if __name__ == "__main__":
    import os
    import re
    main()