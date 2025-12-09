#!/usr/bin/env python3
"""
本地增强版工作流 - 完全基于本地数据的自动发现系统
无需任何外部API，使用智能算法持续发现新平台
"""

import json
import asyncio
import random
from datetime import datetime
from typing import List, Dict
from local_data_miner import LocalDataMiner
import logging

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('local_workflow.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class LocalEnhancedWorkflow:
    def __init__(self):
        self.miner = LocalDataMiner()
        self.batch_size = 50
        self.discovery_methods = [
            "type_combination",
            "keyword_combination",
            "competitor_variant",
            "directory_mining",
            "pattern_mutation",
            "trend_extrapolation"
        ]
        self.stats = {
            "total_discovered": 0,
            "total_verified": 0,
            "total_rejected": 0,
            "batches_completed": 0,
            "last_batch_time": None
        }

    async def discover_platforms_batch(self) -> List[Dict]:
        """发现一批新平台"""
        logger.info(f"🔍 开始发现一批平台 (目标: {self.batch_size} 个)")

        all_platforms = []

        # 方法1: 类型组合发现
        logger.info("  📊 执行类型组合发现...")
        type_platforms = self.miner.generate_type_based_platforms()
        all_platforms.extend(type_platforms[:self.batch_size // 4])

        # 方法2: 关键词组合发现
        logger.info("  🔤 执行关键词组合发现...")
        keyword_platforms = self.miner.generate_keyword_based_platforms()
        all_platforms.extend(keyword_platforms[:self.batch_size // 4])

        # 方法3: 竞争对手变体
        logger.info("  🔄 执行竞争对手变体生成...")
        variant_platforms = self.miner.generate_competitor_variants()
        all_platforms.extend(variant_platforms[:self.batch_size // 4])

        # 方法4: 模式变异（基于成功模式的随机变异）
        logger.info("  🧬 执行模式变异...")
        mutation_platforms = self.generate_pattern_mutations(self.batch_size // 8)
        all_platforms.extend(mutation_platforms)

        # 方法5: 趋势外推（基于热门平台类型）
        logger.info("  📈 执行趋势外推...")
        trend_platforms = self.generate_trend_extrapolation(self.batch_size // 8)
        all_platforms.extend(trend_platforms)

        # 去重并评分
        unique_platforms = self.deduplicate_and_score(all_platforms)

        # 限制批次大小
        return unique_platforms[:self.batch_size]

    def generate_pattern_mutations(self, count: int) -> List[Dict]:
        """基于成功模式生成变异"""
        platforms = []
        patterns = self.miner.success_patterns

        # 基于成功的域名模式
        for pattern in patterns["domain_patterns"][:count//2]:
            if len(pattern) >= 2:
                # 变异其中一个词
                synonyms = {
                    'pay': ['tip', 'fund', 'donate', 'support'],
                    'fund': ['raise', 'collect', 'gather', 'back'],
                    'create': ['make', 'build', 'craft', 'design'],
                    'creator': ['maker', 'artist', 'builder', 'producer'],
                    'hub': ['center', 'spot', 'place', 'zone'],
                    'link': ['connect', 'bridge', 'join', 'link'],
                    'go': ['start', 'launch', 'begin', 'init']
                }

                for word in pattern:
                    if word in synonyms:
                        for syn in synonyms[word][:2]:  # 只取2个同义词
                            new_pattern = [syn if w == word else w for w in pattern]
                            domain = ''.join(new_pattern) + '.com'

                            if not self.miner.is_domain_known(domain):
                                platforms.append({
                                    "platform_name": ''.join(w.title() for w in new_pattern),
                                    "platform_domain": domain,
                                    "platform_type": ["creator", "payment"],
                                    "source": "pattern_mutation",
                                    "confidence": 0.6
                                })

        return platforms[:count]

    def generate_trend_extrapolation(self, count: int) -> List[Dict]:
        """基于趋势外推生成平台"""
        platforms = []

        # 分析当前热门平台类型
        verified = self.miner.verified_platforms.get("platforms", [])
        type_counts = {}

        for p in verified:
            for t in p.get("platform_type", []):
                type_counts[t] = type_counts.get(t, 0) + 1

        # 找出热门类型
        hot_types = sorted(type_counts.items(), key=lambda x: x[1], reverse=True)[:5]

        # 基于热门类型生成新平台
        for type_name, count in hot_types:
            # 生成一些变体名称
            prefixes = ['super', 'mega', 'ultra', 'pro', 'max', 'smart', 'easy', 'quick']
            suffixes = ['now', 'go', 'app', 'hq', 'io', 'co', 'plus', 'hub']

            for i in range(count // 5):
                prefix = random.choice(prefixes)
                suffix = random.choice(suffixes)

                domain = f"{prefix}{type_name.lower()}{suffix}.com"
                if not self.miner.is_domain_known(domain):
                    platforms.append({
                        "platform_name": f"{prefix.title()}{type_name.title()}{suffix.title()}",
                        "platform_domain": domain,
                        "platform_type": [type_name],
                        "source": "trend_extrapolation",
                        "confidence": 0.5
                    })

        return platforms[:count]

    def deduplicate_and_score(self, platforms: List[Dict]) -> List[Dict]:
        """去重并评分"""
        unique_platforms = {}
        seen_domains = set()

        for p in platforms:
            domain = p.get("platform_domain", "")
            if not domain:
                continue

            # 检查是否已知
            if self.miner.is_domain_known(domain):
                continue

            # 去重
            if domain in seen_domains:
                continue

            seen_domains.add(domain)

            # 计算综合评分
            base_score = p.get("confidence", 0.5)

            # 根据来源调整评分
            source_boosts = {
                "competitor_variant": 0.2,
                "type_combination": 0.15,
                "pattern_mutation": 0.1,
                "trend_extrapolation": 0.05,
                "keyword_combination": 0.05,
                "directory_mining": 0.0
            }

            boost = source_boosts.get(p.get("source", ""), 0)
            p["confidence"] = min(1.0, base_score + boost)

            unique_platforms[domain] = p

        # 按评分排序
        return sorted(unique_platforms.values(), key=lambda x: x.get("confidence", 0), reverse=True)

    async def run_continuous_discovery(self, max_batches: int = None):
        """持续发现新平台"""
        batch_num = 0

        try:
            while max_batches is None or batch_num < max_batches:
                batch_num += 1
                logger.info(f"\n{'='*60}")
                logger.info(f"📦 第 {batch_num} 批次")
                logger.info(f"{'='*60}")

                # 发现新平台
                platforms = await self.discover_platforms_batch()

                if not platforms:
                    logger.warning("⚠️ 未发现新平台，等待...")
                    await asyncio.sleep(5)
                    continue

                logger.info(f"✅ 发现 {len(platforms)} 个候选平台")

                # 保存到待验证
                self.miner.save_to_pending(platforms)

                # 更新统计
                self.stats["batches_completed"] += 1
                self.stats["total_discovered"] += len(platforms)
                self.stats["last_batch_time"] = datetime.now().isoformat()

                # 保存统计
                self.save_stats()

                # 显示进度
                logger.info(f"📊 总发现: {self.stats['total_discovered']} 个平台")
                logger.info(f"📈 完成批次: {self.stats['batches_completed']} 批")

                # 短暂休息
                await asyncio.sleep(1)

        except KeyboardInterrupt:
            logger.info("\n⚠️ 收到停止信号")
        except Exception as e:
            logger.error(f"❌ 错误: {str(e)}")
        finally:
            logger.info("\n🎯 本地发现工作流结束")

    def save_stats(self):
        """保存统计信息"""
        with open("local_workflow_stats.json", "w") as f:
            json.dump(self.stats, f, indent=2)

async def main():
    workflow = LocalEnhancedWorkflow()

    print("🚀 本地增强版自动发现系统启动")
    print("✨ 特点：")
    print("   - 完全本地化，无需外部API")
    print("   - 基于已有数据智能挖掘")
    print("   - 多种发现算法组合")
    print("   - 自动去重和评分")
    print("\n按 Ctrl+C 停止\n")

    # 运行持续发现
    await workflow.run_continuous_discovery()

if __name__ == "__main__":
    asyncio.run(main())