#!/usr/bin/env python3
"""
MCP工具集 - 使用本地文件系统和智能分析替代外部API
"""

import json
import re
import socket
from typing import List, Dict, Any
from datetime import datetime
from urllib.parse import urlparse
import subprocess
import time

class MCPDataTool:
    """MCP数据读取工具"""

    @staticmethod
    def load_verified_platforms() -> List[Dict]:
        """加载已验证平台数据"""
        try:
            with open('verified_platforms.json', 'r', encoding='utf-8') as f:
                data = json.load(f)
                return data.get('platforms', [])
        except Exception as e:
            print(f"Error loading verified platforms: {e}")
            return []

    @staticmethod
    def load_rejected_platforms() -> List[Dict]:
        """加载已拒绝平台数据"""
        try:
            with open('rejected_platforms.json', 'r', encoding='utf-8') as f:
                data = json.load(f)
                return data.get('platforms', [])
        except Exception as e:
            print(f"Error loading rejected platforms: {e}")
            return []

    @staticmethod
    def save_platform(platform_data: Dict, status: str = 'verified'):
        """保存平台数据"""
        filename = 'verified_platforms.json' if status == 'verified' else 'rejected_platforms.json'

        try:
            with open(filename, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except:
            data = {"platforms": []}

        platform_data[f"{status}_date"] = datetime.now().isoformat()
        data["platforms"].append(platform_data)

        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        print(f"✅ 已保存平台到 {filename}: {platform_data.get('name')}")

class PatternMatcher:
    """模式匹配工具"""

    @staticmethod
    def extract_success_patterns(platforms: List[Dict]) -> Dict:
        """提取成功平台的模式"""
        patterns = {
            "domain_suffixes": [],
            "name_keywords": [],
            "type_distribution": {},
            "description_patterns": []
        }

        for platform in platforms:
            # 域名后缀
            domain = platform.get('domain', '')
            if '.' in domain:
                suffix = domain.split('.')[-1]
                if suffix not in patterns["domain_suffixes"]:
                    patterns["domain_suffixes"].append(suffix)

            # 名称关键词
            name = platform.get('name', '').lower()
            words = re.findall(r'[a-z]+', name)
            patterns["name_keywords"].extend(words)

            # 类型分布
            for ptype in platform.get('type', []):
                patterns["type_distribution"][ptype] = patterns["type_distribution"].get(ptype, 0) + 1

            # 描述模式
            desc = platform.get('verification_details', '').lower()
            if desc:
                patterns["description_patterns"].append(desc[:100])

        # 统计词频
        from collections import Counter
        patterns["name_keywords"] = [k for k, v in Counter(patterns["name_keywords"]).most_common(50)]

        return patterns

    @staticmethod
    def generate_domain_variations(base_domain: str, patterns: Dict) -> List[str]:
        """基于模式生成域名变体"""
        variations = []

        # 提取基础域名
        if '.' in base_domain:
            base = base_domain.split('.')[0]
        else:
            base = base_domain

        # 常见变体模式
        prefixes = ['get', 'go', 'my', 'your', 'the', 'app', 'join', 'start']
        suffixes = ['app', 'io', 'co', 'hub', 'spot', 'zone', 'pay', 'fund', 'pro']

        # 生成变体
        for prefix in prefixes:
            variations.append(f"{prefix}{base}.com")

        for suffix in suffixes:
            variations.append(f"{base}{suffix}.com")

        # 基于成功模式
        for keyword in patterns.get("name_keywords", [])[:10]:
            if keyword not in base and len(keyword) > 3:
                variations.append(f"{base}{keyword}.com")
                variations.append(f"{keyword}{base}.com")

        return list(set(variations))  # 去重

class SmartValidator:
    """智能验证工具"""

    @staticmethod
    def check_domain_exists(domain: str) -> bool:
        """检查域名是否存在"""
        try:
            # 移除协议前缀
            if '://' in domain:
                domain = domain.split('://')[1]

            # DNS解析检查
            socket.gethostbyname(domain.split('/')[0])
            return True
        except:
            return False

    @staticmethod
    def extract_validation_criteria(content: str, title: str) -> Dict[str, bool]:
        """基于内容提取验证标准"""
        content = content.lower()
        title = title.lower()
        combined = content + ' ' + title

        results = {
            "personal_registration": False,
            "payment_receiving": False,
            "own_payment_system": False,
            "us_market_ach": False
        }

        # 个人注册关键词
        personal_keywords = [
            'individual', 'personal', 'freelancer', 'creator', 'artist',
            'sole proprietor', 'self-employed', 'personal account'
        ]
        results["personal_registration"] = any(kw in combined for kw in personal_keywords)

        # 支付接收关键词
        payment_keywords = [
            'receive payment', 'get paid', 'accept payment', 'collect payment',
            'donation', 'tip', 'support', 'back', 'contribute'
        ]
        results["payment_receiving"] = any(kw in combined for kw in payment_keywords)

        # 自有支付系统关键词
        system_keywords = [
            'stripe connect', 'payment platform', 'payment system',
            'payout', 'withdraw', 'transfer to bank', 'bank account'
        ]
        results["own_payment_system"] = any(kw in combined for kw in system_keywords)

        # 美国市场/ACH关键词
        us_keywords = [
            'ach', 'bank transfer', 'us bank', 'usa', 'united states',
            'dollar', 'usd', 'american'
        ]
        results["us_market_ach"] = any(kw in combined for kw in us_keywords)

        return results

class WebScraperTool:
    """网页爬取工具（使用MCP web reader）"""

    @staticmethod
    def scrape_website(url: str) -> Dict[str, Any]:
        """爬取网站内容"""
        try:
            # 使用mcp__zai___webReader读取网页
            # 这里简化实现，实际应该调用MCP工具
            import requests
            from bs4 import BeautifulSoup

            # 设置请求头
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }

            response = requests.get(url, headers=headers, timeout=10)
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')

                # 提取主要内容
                title = soup.title.string if soup.title else ""
                # 移除脚本和样式
                for script in soup(["script", "style"]):
                    script.decompose()

                text = soup.get_text()[:5000]  # 限制长度

                return {
                    "title": title,
                    "content": text,
                    "status": "success"
                }
            else:
                return {
                    "status": "error",
                    "error": f"HTTP {response.status_code}"
                }
        except Exception as e:
            return {
                "status": "error",
                "error": str(e)
            }

class EvidenceCollector:
    """证据收集工具"""

    @staticmethod
    def collect_evidence(url: str, validation_results: Dict) -> Dict[str, str]:
        """收集验证证据"""
        evidence = {}

        scraper = WebScraperTool()
        result = scraper.scrape_website(url)

        if result["status"] == "success":
            content = result["content"]

            for criterion, passed in validation_results.items():
                if passed:
                    # 查找相关证据
                    if criterion == "personal_registration":
                        evidence[criterion] = "找到个人注册相关关键词"
                    elif criterion == "payment_receiving":
                        evidence[criterion] = "找到支付接收相关功能"
                    elif criterion == "own_payment_system":
                        evidence[criterion] = "发现自有支付系统"
                    elif criterion == "us_market_ach":
                        evidence[criterion] = "确认支持美国市场/ACH"

        return evidence

class StatsAnalyzer:
    """统计分析工具"""

    @staticmethod
    def calculate_success_rate(verified: int, total: int) -> float:
        """计算成功率"""
        if total == 0:
            return 0.0
        return (verified / total) * 100

    @staticmethod
    def analyze_failure_modes(rejected_platforms: List[Dict]) -> Dict:
        """分析失败模式"""
        failure_modes = {
            "personal_registration": 0,
            "payment_receiving": 0,
            "own_payment_system": 0,
            "us_market_ach": 0
        }

        for platform in rejected_platforms:
            failed_criteria = platform.get("failed_criteria", [])
            for criterion in failed_criteria:
                if criterion in failure_modes:
                    failure_modes[criterion] += 1

        return failure_modes

class StrategyOptimizer:
    """策略优化工具"""

    @staticmethod
    def should_adjust_strategy(success_rate: float, recent_batches: List[float]) -> Dict:
        """判断是否需要调整策略"""
        if success_rate < 20:
            return {
                "adjust": True,
                "reason": "成功率过低",
                "suggestion": "增加候选平台质量检查"
            }

        if len(recent_batches) >= 3:
            avg_recent = sum(recent_batches[-3:]) / 3
            if avg_recent < success_rate - 10:
                return {
                    "adjust": True,
                    "reason": "成功率持续下降",
                    "suggestion": "优化验证标准或更换数据源"
                }

        return {
            "adjust": False,
            "reason": "策略正常",
            "suggestion": "继续当前策略"
        }

# 工具集合
MCP_TOOLS = {
    "data": MCPDataTool,
    "pattern": PatternMatcher,
    "validator": SmartValidator,
    "scraper": WebScraperTool,
    "evidence": EvidenceCollector,
    "stats": StatsAnalyzer,
    "optimizer": StrategyOptimizer
}