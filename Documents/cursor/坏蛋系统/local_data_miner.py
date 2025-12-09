#!/usr/bin/env python3
"""
本地数据挖掘器 - 基于已有数据生成新平台
完全不依赖外部API，使用智能算法从现有数据中挖掘新候选
"""

import json
import random
import re
from datetime import datetime
from typing import List, Dict, Set, Tuple
from collections import Counter
import itertools
from smart_name_generator import SmartNameGenerator

class LocalDataMiner:
    def __init__(self):
        self.verified_platforms = self.load_json("verified_platforms.json")
        self.rejected_platforms = self.load_json("rejected_platforms.json")
        self.pending_platforms = self.load_json("pending_platforms.json")
        self.data_sources = self.load_json("data_sources.json")

        # 已验证的域名集合（用于去重）
        self.verified_domains = {p.get("platform_domain", p.get("domain", "")).lower()
                               for p in self.verified_platforms.get("platforms", [])}

        # 所有已知域名集合
        self.all_domains = self.verified_domains.union({
            p.get("platform_domain", p.get("domain", "")).lower()
            for p in self.rejected_platforms.get("platforms", [])
        }).union({
            p.get("platform_domain", p.get("domain", "")).lower()
            for p in self.pending_platforms.get("platforms", [])
        })

        # 成功模式分析
        self.success_patterns = self.analyze_success_patterns()

        # 智能名称生成器
        self.name_generator = SmartNameGenerator()

    def load_json(self, filename: str) -> Dict:
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            return {}

    def analyze_success_patterns(self) -> Dict:
        """分析成功验证的平台模式"""
        platforms = self.verified_platforms.get("platforms", [])
        patterns = {
            "domain_patterns": [],
            "type_combinations": [],
            "successful_keywords": [],
            "domain_suffixes": [],
            "company_variations": []
        }

        # 提取域名模式
        for p in platforms:
            domain = p.get("platform_domain", p.get("domain", ""))
            if domain:
                # 提取核心词汇
                words = re.findall(r'[a-zA-Z]+', domain.lower())
                if len(words) > 1:
                    patterns["domain_patterns"].append(words[-2:])  # 最后两个词
                patterns["domain_suffixes"].append(domain.split('.')[-1])

        # 提取类型组合
        for p in platforms:
            types = p.get("platform_type", [])
            if len(types) > 1:
                patterns["type_combinations"].append(sorted(types))

        # 提取成功关键词
        all_names = [p.get("platform_name", "") for p in platforms]
        for name in all_names:
            words = name.lower().split()
            patterns["successful_keywords"].extend(words)

        # 统计频率
        patterns["successful_keywords"] = [k for k, v in Counter(patterns["successful_keywords"]).most_common(50)]

        return patterns

    def generate_domain_variations(self, domain: str) -> List[str]:
        """生成域名变体"""
        variations = []

        # 获取主域名
        if '.' not in domain:
            return variations

        main = domain.split('.')[0]
        tld = domain.split('.')[-1] if '.' in domain else 'com'

        # 常见前缀
        prefixes = ['get', 'go', 'my', 'your', 'the', 'app', 'join', 'start', 'use']
        # 常见后缀
        suffixes = ['app', 'io', 'co', 'hq', 'now', 'app', 'me', 'tech', 'pay', 'fund']

        # 生成变体
        for prefix in prefixes:
            variations.append(f"{prefix}{main}.{tld}")

        for suffix in suffixes:
            variations.append(f"{main}{suffix}.{tld}")

        # 组合词变体
        words = re.findall(r'[a-zA-Z]+', main)
        if len(words) >= 2:
            # 交换词序
            variations.append(f"{words[1]}{words[0]}.{tld}")

        return variations

    def generate_type_based_platforms(self) -> List[Dict]:
        """基于成功类型组合生成新平台"""
        new_platforms = []
        type_combinations = self.success_patterns["type_combinations"]

        # 收集所有成功的类型
        all_types = set()
        for combo in type_combinations:
            all_types.update(combo)

        # 生成新的类型组合
        for t1, t2 in itertools.combinations(all_types, 2):
            combo = sorted([t1, t2])
            if combo not in type_combinations:
                # 生成平台名称
                name1 = t1.replace("creator", "").replace("platform", "").strip()
                name2 = t2.replace("creator", "").replace("platform", "").strip()

                # 组合命名
                platform_names = [
                    f"{name1}{name2.title()}",
                    f"{name2}{name1.title()}",
                    f"{name1}and{name2}",
                    f"smart{name1}{name2}",
                    f"easy{name1}{name2}"
                ]

                for name in platform_names[:3]:  # 只取前3个
                    domain = f"{name.lower().replace(' ', '')}.com"
                    if not self.is_domain_known(domain):
                        new_platforms.append({
                            "platform_name": name,
                            "platform_domain": domain,
                            "platform_type": combo,
                            "source": "type_combination",
                            "confidence": 0.6
                        })

        return new_platforms

    def generate_keyword_based_platforms(self) -> List[Dict]:
        """基于成功关键词生成新平台"""
        new_platforms = []

        # 使用智能名称生成器
        smart_names = self.name_generator.generate_meaningful_names(50)

        for name, domain, types in smart_names:
            if not self.is_domain_known(domain):
                new_platforms.append({
                    "platform_name": name,
                    "platform_domain": domain,
                    "platform_type": types,
                    "source": "smart_generation",
                    "confidence": 0.7
                })

        return new_platforms

    def generate_competitor_variants(self) -> List[Dict]:
        """基于已知平台生成竞争对手变体"""
        new_platforms = []
        verified = self.verified_platforms.get("platforms", [])

        # 只取高置信度的平台
        high_confidence = [p for p in verified if p.get("confidence", 0) > 0.7][:50]

        for platform in high_confidence:
            domain = platform.get("platform_domain", platform.get("domain", ""))
            if not domain:
                continue

            # 生成变体
            variations = self.generate_domain_variations(domain)
            for var_domain in variations[:5]:  # 限制变体数量
                if not self.is_domain_known(var_domain):
                    # 推断名称
                    name_parts = var_domain.split('.')[0].split('get')
                    if len(name_parts) > 1:
                        name = name_parts[1].title()
                    else:
                        name = name_parts[0].title()

                    new_platforms.append({
                        "platform_name": name,
                        "platform_domain": var_domain,
                        "platform_type": platform.get("platform_type", ["creator"]),
                        "source": f"variant_of_{platform.get('platform_name', 'unknown')}",
                        "confidence": 0.7
                    })

        return new_platforms

    def generate_directory_mining(self) -> List[Dict]:
        """基于软件目录生成新平台"""
        new_platforms = []

        # 从data_sources中的类别生成平台
        for source in self.data_sources.get("software_directories", []):
            categories = source.get("categories", [])

            # 组合类别生成平台
            for cat1, cat2 in zip(categories, categories[1:]):
                # 提取关键词
                words1 = cat1.split('-')
                words2 = cat2.split('-')

                # 简化的平台生成
                if 'payment' in cat1 or 'payment' in cat2:
                    platform_types = ["payment", "creator"]
                elif 'fundraising' in cat1 or 'crowdfunding' in cat1:
                    platform_types = ["fundraising", "creator"]
                else:
                    platform_types = ["creator"]

                # 生成几个候选
                for i in range(3):
                    domain = f"{source['name'].lower().replace(' ', '')}{cat1.split('-')[0]}{i}.com"
                    if not self.is_domain_known(domain):
                        new_platforms.append({
                            "platform_name": f"{source['name']} {cat1.title()} {i}",
                            "platform_domain": domain,
                            "platform_type": platform_types,
                            "source": f"directory_{source['name']}",
                            "confidence": 0.4
                        })

        return new_platforms

    def is_domain_known(self, domain: str) -> bool:
        """检查域名是否已知"""
        domain_lower = domain.lower()
        return domain_lower in self.all_domains or any(
            domain_lower.endswith(f".{d}") for d in self.all_domains if d
        )

    def is_reasonable_platform(self, name: str, domain: str) -> bool:
        """判断是否是合理的平台"""
        # 避免无意义组合
        if len(name) < 4 or len(name) > 20:
            return False

        # 避免重复字母
        if any(name.count(c*3) > 0 for c in set(name)):
            return False

        # 检查是否包含支付相关词汇
        payment_keywords = ['pay', 'fund', 'donate', 'money', 'cash', 'wallet', 'tip']
        has_payment = any(k in name.lower() for k in payment_keywords)

        # 检查是否包含创作者相关词汇
        creator_keywords = ['creator', 'artist', 'writer', 'maker', 'content', 'fan']
        has_creator = any(k in name.lower() for k in creator_keywords)

        # 至少要有一种特征
        return has_payment or has_creator

    def discover_new_platforms(self, target_count: int = 100) -> List[Dict]:
        """发现新平台"""
        all_platforms = []

        print("🔍 生成类型组合平台...")
        all_platforms.extend(self.generate_type_based_platforms())

        print("🔍 生成关键词组合平台...")
        all_platforms.extend(self.generate_keyword_based_platforms())

        print("🔍 生成竞争对手变体...")
        all_platforms.extend(self.generate_competitor_variants())

        print("🔍 基于目录挖掘平台...")
        all_platforms.extend(self.generate_directory_mining())

        # 去重并评分
        unique_platforms = {}
        for p in all_platforms:
            domain = p.get("platform_domain", "")
            if domain and not self.is_domain_known(domain):
                if domain not in unique_platforms:
                    unique_platforms[domain] = p
                else:
                    # 如果已有，选择置信度更高的
                    if p.get("confidence", 0) > unique_platforms[domain].get("confidence", 0):
                        unique_platforms[domain] = p

        # 按置信度排序
        sorted_platforms = sorted(
            unique_platforms.values(),
            key=lambda x: x.get("confidence", 0),
            reverse=True
        )

        return sorted_platforms[:target_count]

    def save_to_pending(self, platforms: List[Dict]):
        """保存到待验证列表"""
        # 加载现有pending
        pending = self.pending_platforms

        # 添加新平台
        if "platforms" not in pending:
            pending["platforms"] = []

        # 添加时间戳
        for p in platforms:
            p["discovered_date"] = datetime.now().isoformat()
            p["discovered_method"] = "local_mining"

        pending["platforms"].extend(platforms)

        # 去重
        seen = set()
        unique_platforms = []
        for p in pending["platforms"]:
            domain = p.get("platform_domain", "")
            if domain and domain not in seen:
                seen.add(domain)
                unique_platforms.append(p)

        pending["platforms"] = unique_platforms

        # 保存
        with open("pending_platforms.json", "w", encoding="utf-8") as f:
            json.dump(pending, f, indent=2, ensure_ascii=False)

        print(f"✅ 已保存 {len(platforms)} 个新平台到 pending_platforms.json")

def main():
    miner = LocalDataMiner()

    print("🚀 启动本地数据挖掘器...")
    print(f"📊 已验证平台: {len(miner.verified_domains)} 个")
    print(f"📈 成功模式: {len(miner.success_patterns['domain_patterns'])} 种")

    # 发现新平台
    platforms = miner.discover_new_platforms(target_count=200)

    print(f"\n✨ 发现 {len(platforms)} 个新平台候选")
    print("\n前10个候选:")
    for p in platforms[:10]:
        print(f"  - {p['platform_name']} ({p['platform_domain']}) - {p['source']}")

    # 保存
    miner.save_to_pending(platforms)

    print("\n🎯 本地数据挖掘完成！无需任何外部API调用")

if __name__ == "__main__":
    main()