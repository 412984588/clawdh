#!/usr/bin/env python3
"""
✅ Verification Agent - 平台验证专家
极简但稳定的4-Agent平台发现系统 - 验证Agent

职责：
1. 使用官方技能验证平台
2. 管理验证队列
3. 生成验证报告
4. 更新验证状态

使用方法：
python3 verification_agent.py [verify|status|queue|report]
"""

import json
import time
import os
import subprocess
from datetime import datetime
from pathlib import Path

class VerificationAgent:
    def __init__(self):
        self.data_path = Path(__file__).parent / "data"
        self.config_file = self.data_path.parent / "config" / "system_config.json"
        self.known_platforms_file = self.data_path / "known_platforms.json"
        self.discovery_queue_file = self.data_path / "discovery_queue.json"
        self.verification_results_file = self.data_path / "verification_results.json"

        # 确保数据目录存在
        self.data_path.mkdir(exist_ok=True)

        # 加载配置
        self.config = self.load_config()
        self.discovery_queue = self.load_discovery_queue()
        self.verification_results = self.load_verification_results()

    def load_config(self):
        """加载系统配置"""
        try:
            with open(self.config_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"❌ 配置文件未找到: {self.config_file}")
            return None

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
                "total_discoveries": 0
            }
        }

    def load_verification_results(self):
        """加载验证结果"""
        if self.verification_results_file.exists():
            try:
                with open(self.verification_results_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                print(f"⚠️ 验证结果文件加载失败: {e}")

        return {
            "results": [],
            "metadata": {
                "last_updated": datetime.now().isoformat(),
                "total_verifications": 0,
                "successful_verifications": 0,
                "failed_verifications": 0,
                "success_rate": 0.0
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

    def save_verification_results(self):
        """保存验证结果"""
        self.verification_results["metadata"]["last_updated"] = datetime.now().isoformat()

        # 更新统计信息
        total = self.verification_results["metadata"]["total_verifications"]
        successful = self.verification_results["metadata"]["successful_verifications"]
        self.verification_results["metadata"]["success_rate"] = (successful / total * 100) if total > 0 else 0

        try:
            with open(self.verification_results_file, 'w', encoding='utf-8') as f:
                json.dump(self.verification_results, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"❌ 保存验证结果失败: {e}")

    def verify_next_platform(self):
        """验证下一个平台"""
        if not self.discovery_queue["queue"]:
            print("📭 验证队列为空")
            return False

        # 取出最高优先级的平台
        platform = max(self.discovery_queue["queue"], key=lambda x: x.get('priority', 0))
        self.discovery_queue["queue"].remove(platform)

        print(f"✅ 开始验证平台: {platform['name']} ({platform['domain']})")
        print(f"🌐 URL: {platform['url']}")
        print(f"📊 优先级: {platform.get('priority', 0)}")

        # 执行验证
        result = self.verify_platform(platform)

        # 记录结果
        self.verification_results["results"].append(result)
        self.verification_results["metadata"]["total_verifications"] += 1

        if result["success"]:
            self.verification_results["metadata"]["successful_verifications"] += 1
            print(f"✅ 验证成功! 置信度: {result['confidence']:.2f}")
        else:
            self.verification_results["metadata"]["failed_verifications"] += 1
            print(f"❌ 验证失败: {result.get('reason', 'Unknown error')}")

        # 保存结果
        self.save_verification_results()
        self.save_discovery_queue()

        return True

    def verify_platform(self, platform):
        """验证单个平台 - 使用真实官方技能"""
        print("🔍 使用platform-verification-v2技能进行真实验证...")
        print(f"🌐 平台: {platform['name']} ({platform['domain']})")

        try:
            # 构造验证参数
            verification_params = {
                "platform_url": platform['url'],
                "platform_name": platform.get('name', platform['domain']),
                "verification_criteria": [
                    "us_market_service",
                    "self_registration",
                    "third_party_payment",
                    "embedded_payment"
                ]
            }

            print(f"📋 验证参数: {verification_params}")

            # 这里应该调用官方的platform-verification-v2技能
            # 但是目前系统还没有真正的技能调用接口
            # 我们需要实现真实的HTTP请求或技能调用

            # TODO: 实现真实的技能调用
            # 目前先返回待验证状态，而不是模拟结果
            return {
                "platform": platform,
                "success": False,  # 暂时标记为未验证
                "confidence": 0.0,
                "verification_time": datetime.now().isoformat(),
                "skill_used": "platform-verification-v2",
                "reason": "等待真实技能调用实现 - 拒绝模拟执行",
                "status": "pending_real_verification"
            }

        except Exception as e:
            return {
                "platform": platform,
                "success": False,
                "confidence": 0.0,
                "verification_time": datetime.now().isoformat(),
                "skill_used": "platform-verification-v2",
                "reason": f"真实验证过程出错: {str(e)}",
                "error_details": str(e)
            }

    def generate_recommendation(self, confidence):
        """生成建议"""
        if confidence >= 0.8:
            return "💰 完美资金中转站 - 强烈推荐使用"
        elif confidence >= 0.6:
            return "✅ 优质资金中转站 - 推荐使用"
        elif confidence >= 0.4:
            return "🔶 合格资金中转站 - 可以使用"
        else:
            return "❌ 不符合要求 - 不建议使用"

    def verify_queue_batch(self, batch_size=5):
        """批量验证队列"""
        print(f"🔄 开始批量验证，批次大小: {batch_size}")

        verified_count = 0
        for i in range(batch_size):
            if self.discovery_queue["queue"]:
                print(f"\n--- 验证 {i+1}/{batch_size} ---")
                success = self.verify_next_platform()
                if success:
                    verified_count += 1
            else:
                print("📭 队列为空，停止批量验证")
                break

            # 避免过于频繁的请求
            time.sleep(2)

        print(f"\n📊 批量验证完成!")
        print(f"✅ 验证完成: {verified_count} 个平台")

    def show_queue_status(self):
        """显示队列状态"""
        print("\n📋 验证队列状态")
        print("=" * 40)

        queue_length = len(self.discovery_queue["queue"])
        print(f"📊 队列长度: {queue_length}")

        if queue_length > 0:
            # 按优先级排序
            sorted_queue = sorted(self.discovery_queue["queue"],
                               key=lambda x: x.get('priority', 0),
                               reverse=True)

            print(f"\n🎯 高优先级平台 (前10个):")
            for i, platform in enumerate(sorted_queue[:10], 1):
                status = platform.get('status', 'pending')
                priority = platform.get('priority', 0)
                print(f"  {i:2d}. {platform['name']:<25} {platform['domain']:<20} 优先级: {priority}")

        else:
            print("📭 队列为空")

        print(f"\n📈 统计信息:")
        print(f"  • 总发现: {self.discovery_queue['metadata']['total_discoveries']}")
        print(f"  • 待验证: {queue_length}")

    def show_verification_status(self):
        """显示验证状态"""
        print("\n📊 Verification Agent 状态")
        print("=" * 40)

        metadata = self.verification_results["metadata"]
        print(f"📈 验证统计:")
        print(f"  • 总验证: {metadata['total_verifications']}")
        print(f"  • 成功: {metadata['successful_verifications']}")
        print(f"  • 失败: {metadata['failed_verifications']}")
        print(f"  • 成功率: {metadata['success_rate']:.1f}%")

        if self.verification_results["results"]:
            print(f"\n📝 最近验证结果 (前5个):")
            recent_results = self.verification_results["results"][-5:]
            for result in reversed(recent_results):
                platform = result["platform"]
                status = "✅" if result["success"] else "❌"
                confidence = result["confidence"]
                print(f"  {status} {platform['name']:<25} 置信度: {confidence:.2f}")

    def generate_verification_report(self):
        """生成验证报告"""
        print("\n📊 平台验证报告")
        print("=" * 50)

        metadata = self.verification_results["metadata"]
        total = metadata["total_verifications"]

        if total == 0:
            print("📭 暂无验证结果")
            return

        print(f"📈 总体统计:")
        print(f"  • 总验证数量: {total}")
        print(f"  • 成功验证: {metadata['successful_verifications']}")
        print(f"  • 失败验证: {metadata['failed_verifications']}")
        print(f"  • 成功率: {metadata['success_rate']:.1f}%")

        # 成功的平台
        successful_platforms = [r for r in self.verification_results["results"] if r["success"]]
        if successful_platforms:
            print(f"\n✅ 成功验证平台 ({len(successful_platforms)} 个):")
            for result in successful_platforms[-10:]:  # 显示最近10个
                platform = result["platform"]
                confidence = result["confidence"]
                recommendation = result.get("recommendation", "")
                print(f"  • {platform['name']:<25} 置信度: {confidence:.2f} - {recommendation}")

        # 失败的平台
        failed_platforms = [r for r in self.verification_results["results"] if not r["success"]]
        if failed_platforms:
            print(f"\n❌ 验证失败平台 ({len(failed_platforms)} 个):")
            for result in failed_platforms[-5:]:  # 显示最近5个
                platform = result["platform"]
                reason = result.get("reason", "Unknown")
                print(f"  • {platform['name']:<25} 原因: {reason}")

        # 置信度分布
        confidences = [r["confidence"] for r in successful_platforms]
        if confidences:
            avg_confidence = sum(confidences) / len(confidences)
            max_confidence = max(confidences)
            min_confidence = min(confidences)

            print(f"\n📊 置信度分析:")
            print(f"  • 平均置信度: {avg_confidence:.2f}")
            print(f"  • 最高置信度: {max_confidence:.2f}")
            print(f"  • 最低置信度: {min_confidence:.2f}")

def main():
    """主函数"""
    agent = VerificationAgent()

    import sys
    if len(sys.argv) < 2:
        agent.show_verification_status()
        print("\n使用方法:")
        print("  python3 verification_agent.py verify              # 验证下一个平台")
        print("  python3 verification_agent.py verify batch        # 批量验证")
        print("  python3 verification_agent.py queue               # 查看队列状态")
        print("  python3 verification_agent.py status              # 查看验证状态")
        print("  python3 verification_agent.py report              # 生成验证报告")
        return

    command = sys.argv[1].lower()

    if command == "verify":
        if len(sys.argv) > 2 and sys.argv[2].lower() == "batch":
            batch_size = int(sys.argv[3]) if len(sys.argv) > 3 else 5
            agent.verify_queue_batch(batch_size)
        else:
            agent.verify_next_platform()

    elif command == "queue":
        agent.show_queue_status()

    elif command == "status":
        agent.show_verification_status()

    elif command == "report":
        agent.generate_verification_report()

    else:
        print(f"❌ 未知命令: {command}")
        print("可用命令: verify, queue, status, report")

if __name__ == "__main__":
    main()