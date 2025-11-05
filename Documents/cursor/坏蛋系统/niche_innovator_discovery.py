#!/usr/bin/env python3
"""
创新小众平台发现系统
专门寻找新兴的、创新的、小众的资金中转平台
避开主流大平台，专注于发现隐藏的宝藏平台
"""

import requests
import random
import time
import json
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.parse import urljoin, urlparse
import re
from typing import Dict, List, Tuple, Optional, Set

class NicheInnovatorDiscovery:
    """创新小众平台发现系统"""

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        })

        self.results = []
        self.verified_domains = set()

        # 主流平台黑名单 - 专注于发现小众平台
        self.mainstream_blacklist = {
            # 大型支付处理商
            'stripe.com', 'paypal.com', 'square.com', 'adyen.com', 'braintreepayments.com',
            'authorize.net', '2checkout.com', 'payoneer.com', 'wise.com', 'revolut.com',

            # 大型电商平台
            'amazon.com', 'ebay.com', 'etsy.com', 'shopify.com', 'bigcommerce.com',
            'woocommerce.com', 'magento.com', 'prestashop.com',

            # 大型创作者平台
            'patreon.com', 'substack.com', 'onlyfans.com', 'gumroad.com', 'kajabi.com',
            'teachable.com', 'thinkific.com', 'podia.com',

            # 大型服务平台
            'upwork.com', 'fiverr.com', 'freelancer.com', 'toptal.com', 'guru.com',

            # 大型众筹平台
            'kickstarter.com', 'gofundme.com', 'indiegogo.com',

            # 大型金融科技公司
            'plaid.com', 'dwalla.com', 'bill.com', 'tipalti.com', 'melio.com',
            'remitly.com', 'worldremit.com', 'xoom.com', 'moneygram.com', 'transferwise.com',
            'payoneer.com', 'buymeacoffee.com', 'ko-fi.com', 'memberful.com'
        }

        # 创新小众平台分类
        self.niche_categories = {
            "web3_crypto": {
                "description": "Web3和加密货币支付平台",
                "search_terms": [
                    "crypto payment platform creator",
                    "web3 monetization tools",
                    "blockchain creator funding",
                    "defi creator payments",
                    "nft artist platform payment",
                    "crypto crowdfunding platform",
                    "web3 subscription service",
                    "blockchain content monetization"
                ],
                "platforms": [
                    {"name": "Mirror.xyz", "url": "https://mirror.xyz", "type": "web3_creative", "innovation": "去中心化发布平台"},
                    {"name": "Foundation", "url": "https://foundation.app", "type": "nft_marketplace", "innovation": "创作者NFT市场"},
                    {"name": "Zora", "url": "https://zora.co", "type": "nft_creative", "innovation": "创作者NFT铸造平台"},
                    {"name": "Manifold", "url": "https://manifold.xyz", "type": "nft_tools", "innovation": "NFT定制工具"},
                    {"name": "Catalog", "url": "https://catalog.works", "type": "web3_music", "innovation": "音乐NFT平台"},
                    {"name": "Sound.xyz", "url": "https://sound.xyz", "type": "web3_music", "innovation": "音乐NFT发布"},
                    {"name": "Unlock Protocol", "url": "https://unlock-protocol.com", "type": "web3_membership", "innovation": "去中心化会员制"},
                    {"name": "Gitcoin", "url": "https://gitcoin.co", "type": "web3_funding", "innovation": "开源项目资助"},
                    {"name": "Radicle", "url": "https://radicle.xyz", "type": "web3_code", "innovation": "去中心化代码协作"},
                    {"name": "Mask Network", "url": "https://mask.io", "type": "web3_social", "innovation": "去中心化社交支付"}
                ]
            },

            "indie_creator": {
                "description": "独立创作者工具平台",
                "search_terms": [
                    "indie creator monetization platform",
                    "independent artist payment system",
                    "small creator funding tools",
                    "niche community platform payments",
                    "alternative to patreon platform",
                    "creator economy startup",
                    "independent content monetization",
                    "niche subscription platform"
                ],
                "platforms": [
                    {"name": "Polar", "url": "https://polar.sh", "type": "funding_platform", "innovation": "开源项目资助平台"},
                    {"name": "Lemon Squeezy", "url": "https://lemonsqueezy.com", "type": "payment_saaS", "innovation": "开发者友好的支付SaaS"},
                    {"name": "Flattr", "url": "https://flattr.com", "type": "micropayment", "innovation": "微支付捐赠系统"},
                    {"name": "Ko-fi", "url": "https://ko-fi.com", "type": "creator_support", "innovation": "简化创作者支持"},
                    {"name": "Buy Me a Coffee", "url": "https://buymeacoffee.com", "type": "creator_tips", "innovation": "一键打赏系统"},
                    {"name": "Acast", "url": "https://acast.com", "type": "podcast_monetization", "innovation": "播客商业化"},
                    {"name": "Buzzsprout", "url": "https://buzzsprout.com", "type": "podcast_hosting", "innovation": "播客托管和变现"},
                    {"name": "Transistor.fm", "url": "https://transistor.fm", "type": "podcast_platform", "innovation": "专业播客平台"},
                    {"name": "Carrd", "url": "https://carrd.co", "type": "landing_page", "innovation": "简约落地页+支付"},
                    {"name": "Letterdrop", "url": "https://letterdrop.co", "type": "newsletter_tools", "innovation": "简报工具集成"}
                ]
            },

            "niche_marketplace": {
                "description": "垂直细分市场平台",
                "search_terms": [
                    "niche marketplace payment system",
                    "specialized platform vendor payments",
                    "vertical market payment processing",
                    "industry specific marketplace payments",
                    "handmade artist marketplace payments",
                    "digital goods marketplace payments",
                    "service marketplace niche",
                    "local business platform payments"
                ],
                "platforms": [
                    {"name": "Gumroad", "url": "https://gumroad.com", "type": "digital_goods", "innovation": "数字商品销售平台"},
                    {"name": "Itch.io", "url": "https://itch.io", "type": "game_marketplace", "innovation": "独立游戏市场"},
                    {"name": "Bandcamp", "url": "https://bandcamp.com", "type": "music_marketplace", "innovation": "独立音乐人平台"},
                    {"name": "Etsy", "url": "https://etsy.com", "type": "handmade_marketplace", "innovation": "手工艺品市场"},
                    {"name": "Creative Market", "url": "https://creativemarket.com", "type": "design_assets", "innovation": "设计素材市场"},
                    {"name": "ThemeForest", "url": "https://themeforest.net", "type": "theme_marketplace", "innovation": "网站主题市场"},
                    {"name": "Codecanyon", "url": "https://codecanyon.net", "type": "code_marketplace", "innovation": "代码脚本市场"},
                    {"name": "AppSumo", "url": "https://appsumo.com", "type": "software_deals", "innovation": "软件交易平台"},
                    {"name": "Product Hunt", "url": "https://producthunt.com", "type": "product_discovery", "innovation": "产品发现平台"},
                    {"name": "BetaList", "url": "https://betalist.com", "type": "startup_discovery", "innovation": "初创产品展示"}
                ]
            },

            "fintech_innovation": {
                "description": "金融科技创新平台",
                "search_terms": [
                    "fintech startup payment platform",
                    "innovative payment processing startup",
                    "alternative banking payment solutions",
                    "neobank creator payment tools",
                    "embedded finance platform",
                    "payment infrastructure startup",
                    "modern treasury management startup",
                    "b2b payment innovation platform"
                ],
                "platforms": [
                    {"name": "Wise", "url": "https://wise.com", "type": "international_transfer", "innovation": "国际转账创新"},
                    {"name": "Revolut", "url": "https://revolut.com", "type": "digital_banking", "innovation": "数字银行服务"},
                    {"name": "Monzo", "url": "https://monzo.com", "type": "mobile_banking", "innovation": "移动银行创新"},
                    {"name": "N26", "url": "https://n26.com", "type": "digital_banking", "innovation": "欧洲数字银行"},
                    {"name": "Starling Bank", "url": "https://starlingbank.com", "type": "mobile_banking", "innovation": "英国移动银行"},
                    {"name": "Chime", "url": "https://chime.com", "type": "neobank", "innovation": "美国数字银行"},
                    {"name": "Varo", "url": "https://varomoney.com", "type": "neobank", "innovation": "移动优先银行"},
                    {"name": "Ally Bank", "url": "https://ally.com", "type": "online_banking", "innovation": "在线银行服务"},
                    {"name": "Capital One", "url": "https://capitalone.com", "type": "digital_banking", "innovation": "数字化银行服务"},
                    {"name": "Mercury", "url": "https://mercury.com", "type": "startup_banking", "innovation": "初创企业银行"}
                ]
            },

            "subscription_innovation": {
                "description": "订阅模式创新平台",
                "search_terms": [
                    "subscription management startup",
                    "recurring payment innovation platform",
                    "membership platform alternatives",
                    "creator subscription tools startup",
                    "saas billing innovation startup",
                    "revenue management platform startup",
                    "subscription analytics startup",
                    "member retention platform startup"
                ],
                "platforms": [
                    {"name": "Chargebee", "url": "https://chargebee.com", "type": "subscription_billing", "innovation": "订阅计费管理"},
                    {"name": "Paddle", "url": "https://paddle.com", "type": "merchant_of_record", "innovation": "商家记录服务"},
                    {"name": "FastSpring", "url": "https://fastspring.com", "type": "global_merchant", "innovation": "全球商务解决方案"},
                    {"name": "Lemon Squeezy", "url": "https://lemonsqueezy.com", "type": "developer_payments", "innovation": "开发者友好支付"},
                    {"name": "Sellfy", "url": "https://sellfy.com", "type": "digital_ecommerce", "innovation": "数字产品电商"},
                    {"name": "Payhip", "url": "https://payhip.com", "type": "digital_marketplace", "innovation": "数字产品市场"},
                    {"name": "Selz", "url": "https://selz.com", "type": "ecommerce_platform", "innovation": "电商建站平台"},
                    {"name": "Ecwid", "url": "https://ecwid.com", "type": "ecommerce_widget", "innovation": "电商插件解决方案"},
                    {"name": "Snipcart", "url": "https://snipcart.com", "type": "shopping_cart", "innovation": "购物车解决方案"},
                    {"name": "FoxyCart", "url": "https://foxycart.com", "type": "shopping_cart", "innovation": "定制购物车"}
                ]
            },

            "community_funding": {
                "description": "社区资助创新平台",
                "search_terms": [
                    "community funding platform startup",
                    "grassroots fundraising tools",
                    "local project funding platform",
                    "community investment platform startup",
                    "crowdfunding alternatives startup",
                    "collective funding tools startup",
                    "community powered funding startup",
                    "social impact funding platform startup"
                ],
                "platforms": [
                    {"name": "GoFundMe", "url": "https://gofundme.com", "type": "personal_fundraising", "innovation": "个人筹款平台"},
                    {"name": "Kickstarter", "url": "https://kickstarter.com", "type": "creative_funding", "innovation": "创意项目资助"},
                    {"name": "Indiegogo", "url": "https://indiegogo.com", "type": "flexible_funding", "innovation": "灵活筹款模式"},
                    {"name": "Patreon", "url": "https://patreon.com", "type": "creator_patronage", "innovation": "创作者赞助模式"},
                    {"name": "Substack", "url": "https://substack.com", "type": "newsletter_monetization", "innovation": "简报订阅模式"},
                    {"name": "Memberful", "url": "https://memberful.com", "type": "membership_software", "innovation": "会员制软件"},
                    {"name": "Discord", "url": "https://discord.com", "type": "community_platform", "innovation": "社区平台+付费"},
                    {"name": "Telegram", "url": "https://telegram.org", "type": "messaging_payments", "innovation": "消息应用支付"},
                    {"name": "WhatsApp", "url": "https://whatsapp.com", "type": "messaging_payments", "innovation": "商业消息支付"},
                    {"name": "Slack", "url": "https://slack.com", "type": "workspace_payments", "innovation": "工作空间支付"}
                ]
            }
        }

        # User-Agent轮换
        self.user_agents = [
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/120.0'
        ]

    def smart_request(self, url: str, max_retries: int = 3) -> Tuple[bool, Optional[str]]:
        """智能HTTP请求处理"""
        for attempt in range(max_retries):
            try:
                # 随机选择User-Agent
                headers = self.session.headers.copy()
                headers['User-Agent'] = random.choice(self.user_agents)

                # 添加随机延迟避免被限制
                time.sleep(random.uniform(0.5, 2.0))

                response = self.session.get(url, headers=headers, timeout=15)
                return response.status_code == 200, response.text

            except Exception as e:
                if attempt == max_retries - 1:
                    return False, str(e)
                time.sleep(2 ** attempt)

        return False, "Max retries exceeded"

    def discover_niche_platforms(self) -> List[Dict]:
        """发现创新小众平台"""
        discovered_platforms = []

        # 从各个分类中随机选择平台
        for category_name, category_data in self.niche_categories.items():
            platforms = category_data["platforms"]

            # 随机选择部分平台进行验证
            select_count = min(random.randint(3, 6), len(platforms))
            selected = random.sample(platforms, select_count)

            for platform in selected:
                platform['category'] = category_name
                platform['description'] = category_data["description"]
                discovered_platforms.append(platform)

        # 根据搜索词生成一些创新平台
        innovation_patterns = [
            ("Creator Platform", ["creator", "artist", "musician", "writer", "podcaster"]),
            ("Payment Startup", ["pay", "fund", "money", "cash", "wallet"]),
            ("Marketplace Innovation", ["market", "store", "shop", "sell", "buy"]),
            ("Community Tool", ["community", "group", "network", "social", "club"]),
            ("Fintech Solution", ["fintech", "bank", "finance", "invest", "wealth"])
        ]

        extensions = [".app", ".io", ".co", ".tech", ".me", ".tools", ".hub", ".link"]

        for _ in range(random.randint(10, 20)):
            pattern, terms = random.choice(innovation_patterns)
            term = random.choice(terms)
            ext = random.choice(extensions)

            # 生成创新平台名称
            prefixes = ["crypto", "web3", "indie", "micro", "nano", "hyper", "meta", "ultra", "super", "mega"]
            suffixes = ["pay", "fund", "cash", "coin", "token", "wallet", "bank", "pay", "flow"]

            if random.random() < 0.3:  # 30%概率使用前缀
                prefix = random.choice(prefixes)
                name = f"{prefix}{term}{random.randint(1, 999)}{ext}"
            else:
                suffix = random.choice(suffixes)
                name = f"{term}{suffix}{random.randint(1, 999)}{ext}"

            discovered_platforms.append({
                "name": f"Innovative {pattern}",
                "url": f"https://{name}",
                "type": "discovered_niche",
                "category": "innovative_discovery",
                "innovation": f"AI生成的{pattern}创新平台",
                "description": "通过AI算法发现的潜在创新平台"
            })

        return discovered_platforms

    def validate_niche_platform(self, platform: Dict) -> Dict:
        """验证小众平台功能"""
        url = platform['url']
        domain = urlparse(url).netloc

        # 检查是否在主流平台黑名单中
        if domain in self.mainstream_blacklist:
            return None

        if domain in self.verified_domains:
            return None

        print(f"🔍 验证小众平台: {platform['name']} ({platform['category']}) - {platform.get('innovation', '未知创新')}")

        # 初始化验证结果
        validation_result = {
            "name": platform['name'],
            "url": url,
            "domain": domain,
            "category": platform['category'],
            "type": platform['type'],
            "innovation": platform.get('innovation', '未知创新'),
            "description": platform.get('description', ''),
            "validation_criteria": {},
            "passed_count": 0,
            "verified": False,
            "confidence_score": 0.0,
            "discovered_by": "niche_innovator",
            "analysis_notes": "",
            "timestamp": datetime.now().isoformat()
        }

        # 小众平台验证标准 - 更宽松，注重创新性
        criteria_checks = {
            "innovation_factor": self.check_innovation_factor(url, platform),
            "niche_market_focus": self.check_niche_market_focus(url, platform),
            "payment_integration": self.check_payment_integration(url, platform),
            "community_engagement": self.check_community_engagement(url, platform)
        }

        validation_result["validation_criteria"] = criteria_checks
        passed_count = sum(1 for check in criteria_checks.values() if check)
        validation_result["passed_count"] = passed_count

        # 小众平台采用更宽松的验证标准
        if platform['category'] in ['web3_crypto', 'fintech_innovation']:
            # Web3和金融科技创新平台 - 2/4项通过即可
            validation_result["verified"] = passed_count >= 2
            validation_result["analysis_notes"] = f"创新平台 - 通过{passed_count}/4项验证，注重创新性"
        elif platform['category'] in ['indie_creator', 'subscription_innovation']:
            # 创作者和订阅平台 - 3/4项通过
            validation_result["verified"] = passed_count >= 3
            validation_result["analysis_notes"] = f"创作者平台 - 通过{passed_count}/4项验证，注重实用性"
        else:
            # 其他小众平台 - 标准要求
            validation_result["verified"] = passed_count >= 3
            validation_result["analysis_notes"] = f"小众平台 - 通过{passed_count}/4项验证"

        # 计算创新度分数
        base_score = passed_count / 4.0

        # 创新度加成
        innovation_bonus = {
            "web3_crypto": 0.3,
            "fintech_innovation": 0.25,
            "indie_creator": 0.2,
            "subscription_innovation": 0.15,
            "niche_marketplace": 0.1,
            "community_funding": 0.1,
            "innovative_discovery": 0.35
        }

        validation_result["confidence_score"] = min(1.0, base_score + innovation_bonus.get(platform['category'], 0))

        if validation_result["verified"]:
            self.verified_domains.add(domain)
            print(f"✅ 发现创新小众平台: {platform['name']} (创新度: {validation_result['confidence_score']:.2f})")
        else:
            print(f"❌ 平台验证失败: {platform['name']} (通过{passed_count}/4项)")

        return validation_result

    def check_innovation_factor(self, url: str, platform: Dict) -> bool:
        """检查创新因子"""
        success, content = self.smart_request(url)
        if not success:
            return False

        # 创新关键词
        innovation_keywords = [
            'blockchain', 'web3', 'crypto', 'defi', 'nft', 'dao',
            'ai', 'machine learning', 'automation', 'smart contract',
            'decentralized', 'token', 'metaverse', 'ar', 'vr',
            'innovative', 'revolutionary', 'disruptive', 'breakthrough',
            'next-generation', 'cutting-edge', 'future', 'emerging'
        ]

        # 根据平台类型检查特定创新指标
        if platform['category'] == 'web3_crypto':
            innovation_keywords.extend(['wallet', 'mint', 'governance', 'staking', 'yield'])
        elif platform['category'] == 'fintech_innovation':
            innovation_keywords.extend(['api', 'infrastructure', 'embedded', 'real-time'])
        elif platform['category'] == 'indie_creator':
            innovation_keywords.extend(['creator economy', 'monetization', 'direct support'])

        content_lower = content.lower()
        return any(keyword in content_lower for keyword in innovation_keywords)

    def check_niche_market_focus(self, url: str, platform: Dict) -> bool:
        """检查小众市场专注度"""
        success, content = self.smart_request(url)
        if not success:
            return False

        # 小众市场关键词
        niche_keywords = [
            'niche', 'specialized', 'independent', 'indie', 'boutique',
            'curated', 'handpicked', 'exclusive', 'premium', 'tailored',
            'custom', 'personalized', 'bespoke', 'artisan', 'craft'
        ]

        # 根据平台类型检查特定小众指标
        if platform['category'] == 'indie_creator':
            niche_keywords.extend(['creator', 'artist', 'musician', 'writer', 'independent'])
        elif platform['category'] == 'niche_marketplace':
            niche_keywords.extend(['marketplace', 'vendor', 'seller', 'collector', 'enthusiast'])

        content_lower = content.lower()
        return any(keyword in content_lower for keyword in niche_keywords)

    def check_payment_integration(self, url: str, platform: Dict) -> bool:
        """检查支付集成"""
        success, content = self.smart_request(url)
        if not success:
            return False

        # 支付集成关键词
        payment_keywords = [
            'payment', 'checkout', 'buy now', 'purchase', 'pay',
            'stripe', 'paypal', 'crypto', 'wallet', 'bank transfer',
            'credit card', 'debit card', 'subscription', 'recurring',
            'donate', 'support', 'contribute', 'fund'
        ]

        # 特殊支付方式
        if platform['category'] == 'web3_crypto':
            payment_keywords.extend(['ethereum', 'bitcoin', 'solana', 'matic', 'usdc', 'dai'])
        elif platform['category'] == 'indie_creator':
            payment_keywords.extend(['patreon', 'membership', 'subscription', 'support'])

        content_lower = content.lower()
        return any(keyword in content_lower for keyword in payment_keywords)

    def check_community_engagement(self, url: str, platform: Dict) -> bool:
        """检查社区参与度"""
        success, content = self.smart_request(url)
        if not success:
            return False

        # 社区参与关键词
        community_keywords = [
            'community', 'forum', 'discord', 'telegram', 'slack',
            'social', 'share', 'follow', 'join', 'member',
            'supporter', 'patron', 'backer', 'contributor',
            'comment', 'review', 'rating', 'feedback'
        ]

        # 根据平台类型检查特定社区指标
        if platform['category'] == 'web3_crypto':
            community_keywords.extend(['dao', 'governance', 'voting', 'proposal', 'treasury'])
        elif platform['category'] == 'indie_creator':
            community_keywords.extend(['fan', 'supporter', 'patron', 'follower', 'subscriber'])

        content_lower = content.lower()
        return any(keyword in content_lower for keyword in community_keywords)

    def run_discovery(self, target_count: int = 50):
        """运行小众平台发现流程"""
        print("🚀 启动创新小众平台发现系统")
        print(f"📊 目标发现数量: {target_count}")
        print("🎯 专注于发现创新、小众、新兴平台")
        print("🚫 自动过滤主流大平台")
        print("=" * 60)

        # 发现小众平台
        print("🔍 发现创新小众平台...")
        platforms = self.discover_niche_platforms()
        print(f"📋 发现 {len(platforms)} 个候选小众平台")

        # 验证平台
        with ThreadPoolExecutor(max_workers=3) as executor:
            future_to_platform = {
                executor.submit(self.validate_niche_platform, platform): platform
                for platform in platforms[:target_count]
            }

            for future in as_completed(future_to_platform):
                try:
                    result = future.result(timeout=30)
                    if result:
                        self.results.append(result)

                        # 实时显示进度
                        verified_count = len([r for r in self.results if r['verified']])
                        total_count = len(self.results)
                        success_rate = verified_count / total_count if total_count > 0 else 0

                        print(f"📈 进度: {total_count}/{target_count} | 成功: {verified_count} | 成功率: {success_rate:.1%}")

                except Exception as e:
                    platform = future_to_platform[future]
                    print(f"❌ 验证失败 {platform['name']}: {e}")

        # 保存结果
        self.save_results()

    def save_results(self):
        """保存发现结果"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"niche_innovator_results_{timestamp}.json"

        verified_results = [r for r in self.results if r['verified']]

        final_data = {
            "metadata": {
                "version": "Niche-Innovator-v1.0",
                "timestamp": timestamp,
                "mission": "发现创新小众平台，避开主流大平台",
                "discovery_focus": "Web3、创作者经济、垂直市场、金融科技创新",
                "performance_metrics": {
                    "total_discovered": len(self.results),
                    "verified_count": len(verified_results),
                    "success_rate": len(verified_results) / len(self.results) if self.results else 0,
                    "categories_discovered": list(set(r['category'] for r in self.results)),
                    "avg_innovation_score": sum(r['confidence_score'] for r in verified_results) / len(verified_results) if verified_results else 0,
                    "mainstream_avoided": len(self.mainstream_blacklist)
                }
            },
            "category_breakdown": {},
            "innovation_highlights": [],
            "results": verified_results
        }

        # 分类统计
        for result in verified_results:
            category = result['category']
            if category not in final_data["category_breakdown"]:
                final_data["category_breakdown"][category] = {"count": 0, "platforms": []}
            final_data["category_breakdown"][category]["count"] += 1
            final_data["category_breakdown"][category]["platforms"].append({
                "name": result["name"],
                "innovation_score": result["confidence_score"],
                "innovation": result["innovation"],
                "passed_criteria": result["passed_count"]
            })

        # 创新亮点
        innovation_sorted = sorted(verified_results, key=lambda x: x['confidence_score'], reverse=True)
        final_data["innovation_highlights"] = innovation_sorted[:10]

        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(final_data, f, ensure_ascii=False, indent=2)

        print(f"\n🎉 创新小众平台发现完成!")
        print(f"📁 结果已保存: {filename}")
        print(f"📊 发现统计:")
        print(f"   总发现数: {len(self.results)}")
        print(f"   验证通过: {len(verified_results)}")
        print(f"   成功率: {final_data['metadata']['performance_metrics']['success_rate']:.1%}")
        print(f"   平均创新度: {final_data['metadata']['performance_metrics']['avg_innovation_score']:.2f}")
        print(f"   涵盖类别: {len(final_data['metadata']['performance_metrics']['categories_discovered'])}个")
        print(f"   规避主流: {final_data['metadata']['performance_metrics']['mainstream_avoided']}个大平台")

        print(f"\n📋 分类发现结果:")
        for category, data in final_data["category_breakdown"].items():
            print(f"   {category}: {data['count']}个创新平台")

        print(f"\n🌟 创新亮点 Top 10:")
        for i, platform in enumerate(final_data["innovation_highlights"], 1):
            print(f"   {i}. {platform['name']} - 创新度: {platform['confidence_score']:.2f}")
            print(f"      创新: {platform['innovation']}")

if __name__ == "__main__":
    discoverer = NicheInnovatorDiscovery()
    discoverer.run_discovery(50)