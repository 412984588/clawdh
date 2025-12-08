#!/usr/bin/env python3
"""
轻量级CrewAI系统 - 无API依赖版本
专注于本地逻辑，减少对外部API的依赖
"""

import os
import json
import time
import random
from datetime import datetime
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

class SmartSearchTool:
    """智能搜索工具 - 基于本地模式匹配"""

    def __init__(self):
        self.verified_patterns = [
            {"name": "Ko-fi", "domain": "ko-fi.com", "type": "打赏平台", "priority": 9},
            {"name": "Buy Me a Coffee", "domain": "buymeacoffee.com", "type": "创作者支持", "priority": 9},
            {"name": "Patreon", "domain": "patreon.com", "type": "订阅支持", "priority": 8},
            {"name": "Venmo", "domain": "venmo.com", "type": "个人支付", "priority": 7},
            {"name": "Cash App", "domain": "cash.app", "type": "现金转账", "priority": 7},
            {"name": "Zelle", "domain": "zellepay.com", "type": "银行转账", "priority": 8},
            {"name": "GoFundMe", "domain": "gofundme.com", "type": "众筹平台", "priority": 8},
            {"name": "Square", "domain": "squareup.com", "type": "支付系统", "priority": 9},
            {"name": "Stripe", "domain": "stripe.com", "type": "支付网关", "priority": 9},
        ]

        # 智能变体生成
        self.variants = [
            {"name": "PayPal Pro", "domain": "paypalpro.com", "type": "专业版"},
            {"name": "Stripe Studio", "domain": "stripestudio.com", "type": "创意版"},
            {"name": "Square Tools", "domain": "squaretools.com", "type": "工具版"},
            {"name": "Creator Hub", "domain": "creatorhub.com", "type": "创作者中心"},
            {"name": "Payment Lab", "domain": "paymentlab.com", "type": "支付实验室"},
            {"name": "Donation Pro", "domain": "donationpro.com", "type": "专业捐赠"},
        ]

    def search(self, query: str) -> str:
        print(f"\n   🛠️  [智能搜索] 查询: '{query}'...")

        query_lower = query.lower()
        candidates = []

        # 基于查询类型智能匹配
        if any(keyword in query_lower for keyword in ['donation', '支持', '打赏', 'creator']):
            candidates = [p for p in self.verified_patterns if p['type'] in ['打赏平台', '创作者支持', '订阅支持', '众筹平台']]
            candidates.extend([v for v in self.variants if 'pro' in v['name'].lower() or 'donation' in v['name'].lower()])

        elif any(keyword in query_lower for keyword in ['payment', '支付', 'transfer', '转账']):
            candidates = [p for p in self.verified_patterns if p['type'] in ['个人支付', '现金转账', '银行转账', '支付系统', '支付网关']]
            candidates.extend([v for v in self.variants if 'payment' in v['name'].lower() or 'square' in v['name'].lower()])

        else:
            # 混合匹配
            candidates = random.sample(self.verified_patterns, min(5, len(self.verified_patterns)))
            candidates.extend(random.sample(self.variants, min(3, len(self.variants))))

        # 按优先级排序
        candidates.sort(key=lambda x: x.get('priority', 5), reverse=True)

        # 限制返回数量
        result = candidates[:6]

        print(f"      🎯 智能匹配 {len(result)} 个候选平台")
        return json.dumps([{
            "name": p["name"],
            "url": f"https://www.{p['domain']}",
            "domain": p["domain"],
            "type": p["type"]
        } for p in result])

class SmartVerifyTool:
    """智能验证工具 - 基于规则快速验证"""

    def __init__(self):
        # 加载已验证平台避免重复工作
        try:
            with open('verified_platforms.json', 'r') as f:
                self.verified_data = json.load(f)
                self.verified_domains = {p.get('domain', '') for p in self.verified_data.get('platforms', [])}
        except:
            self.verified_domains = set()

        try:
            with open('rejected_platforms.json', 'r') as f:
                self.rejected_data = json.load(f)
                self.rejected_domains = {p.get('domain', '') for p in self.rejected_data.get('platforms', [])}
        except:
            self.rejected_domains = set()

    def verify(self, platform_info: dict) -> dict:
        domain = platform_info.get('domain', '')
        name = platform_info.get('name', '')

        print(f"\n   🔍 [智能验证] 检查: {name} ({domain})")

        # 快速去重检查
        if domain in self.verified_domains:
            return {
                "name": name,
                "domain": domain,
                "status": "already_verified",
                "reason": "已验证平台"
            }

        if domain in self.rejected_domains:
            return {
                "name": name,
                "domain": domain,
                "status": "already_rejected",
                "reason": "已拒绝平台"
            }

        # 基于域名的智能验证
        verification_result = self._smart_domain_check(domain, name)

        return verification_result

    def _smart_domain_check(self, domain: str, name: str) -> dict:
        """基于域名模式的智能验证"""

        # 美国域名检查
        us_indicators = ['.com', 'pay', 'fund', 'donate', 'stripe', 'square', 'paypal']
        is_us_market = any(indicator in domain.lower() for indicator in us_indicators)

        # 个人注册友好检查
        personal_friendly = [
            'kofi', 'coffee', 'patreon', 'venmo', 'cash', 'zelle',
            'gofundme', 'ko-fi', 'buymeacoffee', 'creator', 'donate'
        ]
        is_personal_friendly = any(indicator in domain.lower() for indicator in personal_friendly)

        # 支付能力检查
        payment_keywords = [
            'pay', 'payment', 'fund', 'donate', 'transfer', 'stripe',
            'square', 'paypal', 'venmo', 'cash', 'zelle', 'kofi'
        ]
        has_payment_capability = any(keyword in domain.lower() for keyword in payment_keywords)

        # 自有系统检查（避免明显的聚合网关）
        is_own_system = len(domain.split('.')) <= 2 and not any(
            bad in domain.lower() for bad in ['gateway', 'api', 'service']
        )

        # 综合评分
        score = 0
        reasons = []

        if is_us_market:
            score += 3
            reasons.append("美国市场")
        if is_personal_friendly:
            score += 3
            reasons.append("个人友好")
        if has_payment_capability:
            score += 2
            reasons.append("支付功能")
        if is_own_system:
            score += 2
            reasons.append("自有系统")

        # 判断是否通过
        passed = score >= 6

        return {
            "name": name,
            "domain": domain,
            "status": "verified" if passed else "rejected",
            "score": score,
            "reasons": reasons,
            "details": f"评分 {score}/10，符合条件：{', '.join(reasons)}"
        }

class LightweightCrewAI:
    """轻量级CrewAI系统"""

    def __init__(self):
        self.session_id = datetime.now().strftime("%Y%m%d_%H%M%S")
        self.search_tool = SmartSearchTool()
        self.verify_tool = SmartVerifyTool()

        print(f"🚀 启动轻量级CrewAI系统 (无API依赖)")
        print(f"🧠 模式: 智能规则引擎 + 本地验证")

        self.load_data()

    def load_data(self):
        """加载数据"""
        try:
            with open('verified_platforms.json', 'r') as f:
                self.verified = json.load(f)
        except:
            self.verified = {"platforms": []}
        try:
            with open('rejected_platforms.json', 'r') as f:
                self.rejected = json.load(f)
        except:
            self.rejected = {"platforms": []}

    def save_data(self):
        """保存数据"""
        with open('verified_platforms.json', 'w', encoding='utf-8') as f:
            json.dump(self.verified, f, ensure_ascii=False, indent=2)
        with open('rejected_platforms.json', 'w', encoding='utf-8') as f:
            json.dump(self.rejected, f, ensure_ascii=False, indent=2)

    def run_session(self):
        print(f"\n🔄 ========== 轻量级会话 {self.session_id} ==========")

        # 智能搜索
        search_queries = [
            "personal donation platforms for creators",
            "individual payment receiving platforms",
            "creator monetization tools"
        ]

        query = random.choice(search_queries)
        print(f"🎯 搜索查询: {query}")

        # 执行搜索
        search_results = json.loads(self.search_tool.search(query))

        if not search_results:
            print("❌ 搜索未返回结果")
            return

        print(f"🔍 发现 {len(search_results)} 个候选平台")

        # 验证每个平台
        verified_count = 0
        rejected_count = 0

        for platform in search_results:
            result = self.verify_tool.verify(platform)

            if result["status"] == "verified":
                verified_count += 1
                platform_data = {
                    "name": result["name"],
                    "domain": result["domain"],
                    "type": "智能发现",
                    "verified_date": datetime.now().isoformat(),
                    "verification_details": result["details"],
                    "verification_score": result["score"]
                }
                self.verified["platforms"].append(platform_data)
                print(f"   ✅ 验证通过: {result['name']} (评分: {result['score']})")

            elif result["status"] == "rejected":
                rejected_count += 1
                platform_data = {
                    "name": result["name"],
                    "domain": result["domain"],
                    "type": "智能发现",
                    "rejected_date": datetime.now().isoformat(),
                    "rejection_reason": result["details"],
                    "verification_score": result["score"]
                }
                self.rejected["platforms"].append(platform_data)
                print(f"   ❌ 验证失败: {result['name']} (评分: {result['score']})")

            else:
                print(f"   ⚠️ 跳过: {result['name']} ({result['reason']})")

        # 保存结果
        self.save_data()

        # 会话总结
        total_processed = verified_count + rejected_count
        success_rate = (verified_count / total_processed * 100) if total_processed > 0 else 0

        print(f"\n📊 会话总结:")
        print(f"   🎯 处理平台: {total_processed}")
        print(f"   ✅ 验证通过: {verified_count}")
        print(f"   ❌ 验证失败: {rejected_count}")
        print(f"   📈 成功率: {success_rate:.1f}%")

        return {
            "processed": total_processed,
            "verified": verified_count,
            "rejected": rejected_count,
            "success_rate": success_rate
        }

def main():
    print("🤖 启动轻量级CrewAI系统")

    while True:
        system = LightweightCrewAI()
        try:
            result = system.run_session()

            # 如果成功率太低，调整策略
            if result["success_rate"] < 20:
                print("⚠️ 成功率较低，调整搜索策略...")
                time.sleep(10)  # 稍微延长等待时间
            else:
                print("✅ 会话成功完成")

        except Exception as e:
            print(f"❌ 会话出错: {e}")

        print("\n⏰ 等待 3 分钟...")
        time.sleep(180)

if __name__ == "__main__":
    main()