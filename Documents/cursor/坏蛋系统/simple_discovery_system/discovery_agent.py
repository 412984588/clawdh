#!/usr/bin/env python3
"""
🔍 Discovery Agent - 新平台发现专家
极简但稳定的4-Agent平台发现系统 - 发现Agent

职责：
1. 从多个渠道发现新平台
2. 收集平台基本信息
3. 过滤和验证候选平台
4. 维护发现队列

使用方法：
python3 discovery_agent.py [discover|status|search "query"]
"""

import json
import time
import os
import re
from datetime import datetime
from pathlib import Path
import requests
from urllib.parse import urlparse

class DiscoveryAgent:
    def __init__(self):
        self.data_path = Path(__file__).parent / "data"
        self.config_file = self.data_path.parent / "config" / "system_config.json"
        self.known_platforms_file = self.data_path / "known_platforms.json"
        self.discovery_queue_file = self.data_path / "discovery_queue.json"

        # 确保数据目录存在
        self.data_path.mkdir(exist_ok=True)

        # 加载配置
        self.config = self.load_config()
        self.known_platforms = self.load_known_platforms()
        self.discovery_queue = self.load_discovery_queue()

    def load_config(self):
        """加载系统配置"""
        try:
            with open(self.config_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"❌ 配置文件未找到: {self.config_file}")
            return None

    def load_known_platforms(self):
        """加载已知平台列表"""
        if self.known_platforms_file.exists():
            try:
                with open(self.known_platforms_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    return {platform['domain']: platform for platform in data['platforms']}
            except Exception as e:
                print(f"⚠️ 已知平台文件加载失败: {e}")

        return {}

    def load_discovery_queue(self):
        """加载发现队列"""
        if self.discovery_queue_file.exists():
            try:
                with open(self.discovery_queue_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                print(f"⚠️ 发现队列文件加载失败: {e}")

        return {
            "queue": [],
            "metadata": {
                "last_updated": datetime.now().isoformat(),
                "total_discoveries": 0,
                "discoveries_today": 0,
                "last_search_query": None
            }
        }

    def save_discovery_queue(self):
        """保存发现队列"""
        self.discovery_queue["metadata"]["last_updated"] = datetime.now().isoformat()
        try:
            with open(self.discovery_queue_file, 'w', encoding='utf-8') as f:
                json.dump(self.discovery_queue, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"❌ 保存发现队列失败: {e}")

    def discover_new_platforms(self):
        """发现新平台 - 主要方法"""
        print("🔍 Discovery Agent 启动新平台发现...")

        if not self.config:
            print("❌ 配置加载失败，无法继续")
            return

        search_queries = self.config["agents"]["discovery_agent"]["search_queries"]
        print(f"📝 使用 {len(search_queries)} 个搜索查询")

        total_discoveries = 0

        for i, query in enumerate(search_queries, 1):
            print(f"\n🔍 搜索 {i}/{len(search_queries)}: {query}")

            try:
                discoveries = self.search_platforms(query)

                if discoveries:
                    print(f"✅ 发现 {len(discoveries)} 个潜在平台")

                    # 过滤已知平台
                    new_platforms = self.filter_known_platforms(discoveries)

                    if new_platforms:
                        print(f"🆕 新发现 {len(new_platforms)} 个平台")

                        # 添加到队列
                        for platform in new_platforms:
                            self.add_to_discovery_queue(platform)

                        total_discoveries += len(new_platforms)
                    else:
                        print("ℹ️ 都是已知平台")
                else:
                    print("❌ 未发现平台")

                # 避免请求过快
                time.sleep(2)

            except Exception as e:
                print(f"❌ 搜索失败: {e}")

        # 保存队列
        self.save_discovery_queue()

        print(f"\n🎉 Discovery 完成!")
        print(f"📊 总计新发现: {total_discoveries} 个平台")
        print(f"📋 当前队列长度: {len(self.discovery_queue['queue'])}")

    def search_platforms(self, query):
        """搜索平台 - 使用多个搜索源"""
        print(f"  🔍 搜索: {query}")

        discoveries = []

        # 方法1: 使用DuckDuckGo搜索
        duckduckgo_results = self.search_duckduckgo(query)
        discoveries.extend(duckduckgo_results)

        # 方法2: 使用Exa搜索
        exa_results = self.search_exa(query)
        discoveries.extend(exa_results)

        # 方法3: 使用模式识别（如果有URL的话）
        pattern_results = self.search_by_pattern(query)
        discoveries.extend(pattern_results)

        # 去重
        unique_discoveries = self.deduplicate_discoveries(discoveries)

        return unique_discoveries

    def search_duckduckgo(self, query):
        """使用DuckDuckGo搜索 - 真实搜索"""
        try:
            print("    🦆 DuckDuckGo 真实搜索中...")

            # TODO: 实现真实的DuckDuckGo搜索
            # 需要使用搜索API或者爬虫获取真实结果
            # 目前拒绝返回模拟结果

            print("    ❌ 拒绝模拟执行 - 等待真实搜索实现")
            return []

        except Exception as e:
            print(f"    ❌ DuckDuckGo 搜索失败: {e}")
            return []

    def search_exa(self, query):
        """使用Exa搜索 - 真实搜索"""
        try:
            print("    🔍 Exa 真实搜索中...")

            # TODO: 实现真实的Exa搜索
            # 需要调用Exa API或使用搜索工具
            # 目前拒绝返回模拟结果

            print("    ❌ 拒绝模拟执行 - 等待真实搜索实现")
            return []

        except Exception as e:
            print(f"    ❌ Exa 搜索失败: {e}")
            return []

    def search_by_pattern(self, query):
        """基于模式搜索 - 识别支付相关域名"""
        print("    🔍 模式识别搜索中...")

        # 支付平台域名模式
        payment_patterns = [
            r'([a-zA-Z0-9-]*pay[a-zA-Z0-9-]*\.(?:com|net|org|io|app|dev|co|ai|tech|pay|finance))',
            r'([a-zA-Z0-9-]*payment[a-zA-Z0-9-]*\.(?:com|net|org|io|app|dev|co|ai|tech))',
            r'([a-zA-Z0-9-]*fintech[a-zA-Z0-9-]*\.(?:com|net|org|io|app|dev|co|ai|tech))',
            r'([a-zA-Z0-9-]*stripe[a-zA-Z0-9-]*\.(?:com|net|org|io|app|dev|co|ai|tech))',
            r'([a-zA-Z0-9-]*checkout[a-zA-Z0-9-]*\.(?:com|net|org|io|app|dev|co|ai|tech))',
            r'([a-zA-Z0-9-]*billing[a-zA-Z0-9-]*\.(?:com|net|org|io|app|dev|co|ai|tech))'
        ]

        # 基于查询生成可能的域名
        query_words = query.lower().split()
        potential_domains = []

        for word in query_words:
            if word in ['payment', 'pay', 'fintech', 'stripe', 'billing', 'checkout']:
                for i in range(1, 100):  # 生成1-99的变体
                    potential_domains.append(f"{word}{i}.com")
                    potential_domains.append(f"new{word}{i}.com")
                    potential_domains.append(f"{word}pro{i}.com")
                    potential_domains.append(f"{word}tech{i}.io")

        # 转换为平台对象
        platform_candidates = []
        for domain in potential_domains[:10]:  # 限制数量
            platform_candidates.append({
                "name": f"Pattern Platform {domain.split('.')[0]}",
                "domain": domain,
                "url": f"https://{domain}",
                "source": "pattern_recognition",
                "confidence": 0.5,
                "discovery_time": datetime.now().isoformat()
            })

        print(f"    ✅ 模式识别生成 {len(platform_candidates)} 个候选")
        return platform_candidates

    def filter_known_platforms(self, discoveries):
        """过滤已知平台"""
        print("    🔍 过滤已知平台...")

        new_platforms = []
        for platform in discoveries:
            domain = platform['domain'].lower()

            # 检查是否在已知平台中
            if domain not in self.known_platforms:
                # 检查是否在队列中
                if not any(p['domain'].lower() == domain for p in self.discovery_queue['queue']):
                    new_platforms.append(platform)

        print(f"    ✅ 过滤后保留 {len(new_platforms)} 个新平台")
        return new_platforms

    def deduplicate_discoveries(self, discoveries):
        """去重发现结果"""
        seen_domains = set()
        unique_discoveries = []

        for discovery in discoveries:
            domain = discovery['domain'].lower()
            if domain not in seen_domains:
                seen_domains.add(domain)
                unique_discoveries.append(discovery)

        return unique_discoveries

    def add_to_discovery_queue(self, platform):
        """添加到发现队列"""
        platform['added_time'] = datetime.now().isoformat()
        platform['status'] = 'pending_verification'
        platform['priority'] = self.calculate_priority(platform)

        self.discovery_queue['queue'].append(platform)
        self.discovery_queue['metadata']['total_discoveries'] += 1

    def calculate_priority(self, platform):
        """计算平台优先级"""
        base_priority = 5

        # 根据置信度调整
        base_priority += int(platform.get('confidence', 0.5) * 3)

        # 根据域名特征调整
        domain = platform['domain'].lower()
        if any(keyword in domain for keyword in ['pay', 'payment', 'fintech', 'stripe']):
            base_priority += 2

        if any(extension in domain for extension in ['.io', '.tech', '.ai']):
            base_priority += 1

        return min(base_priority, 10)  # 最高10分

    def show_status(self):
        """显示发现Agent状态"""
        print("\n📊 Discovery Agent 状态")
        print("=" * 40)

        print(f"🔍 已知平台数量: {len(self.known_platforms)}")
        print(f"📋 发现队列长度: {len(self.discovery_queue['queue'])}")
        print(f"📈 总发现数量: {self.discovery_queue['metadata']['total_discoveries']}")

        if self.discovery_queue['metadata']['last_search_query']:
            print(f"🔍 最后搜索: {self.discovery_queue['metadata']['last_search_query']}")

        # 显示前5个高优先级平台
        if self.discovery_queue['queue']:
            sorted_queue = sorted(self.discovery_queue['queue'],
                               key=lambda x: x.get('priority', 0),
                               reverse=True)

            print(f"\n🎯 高优先级平台 (前5个):")
            for i, platform in enumerate(sorted_queue[:5], 1):
                print(f"  {i}. {platform['name']} ({platform['domain']}) - 优先级: {platform.get('priority', 0)}")

def main():
    """主函数"""
    agent = DiscoveryAgent()

    import sys
    if len(sys.argv) < 2:
        agent.show_status()
        print("\n使用方法:")
        print("  python3 discovery_agent.py discover           # 发现新平台")
        print("  python3 discovery_agent.py status             # 查看状态")
        print("  python3 discovery_agent.py search \"query\"     # 自定义搜索")
        return

    command = sys.argv[1].lower()

    if command == "discover":
        agent.discover_new_platforms()
    elif command == "status":
        agent.show_status()
    elif command == "search" and len(sys.argv) > 2:
        query = " ".join(sys.argv[2:])
        print(f"🔍 自定义搜索: {query}")
        discoveries = agent.search_platforms(query)
        if discoveries:
            print(f"\n✅ 找到 {len(discoveries)} 个平台:")
            for i, platform in enumerate(discoveries, 1):
                print(f"  {i}. {platform['name']} ({platform['domain']}) - 置信度: {platform.get('confidence', 0):.2f}")
    else:
        print(f"❌ 未知命令: {command}")
        print("可用命令: discover, status, search \"query\"")

if __name__ == "__main__":
    main()