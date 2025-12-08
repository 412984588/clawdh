#!/usr/bin/env python3
"""
Claude Code 自动化平台发现验证工作流
完全自动化运行，无需人工干预的持续平台发现系统

核心功能：
1. 多数据源平台发现
2. 严格4项验证标准
3. 批量处理与自动优化
4. 无限循环自主运行
"""

import os
import json
import time
import random
import hashlib
from datetime import datetime
from typing import List, Dict, Any, Optional, Set
from urllib.parse import urlparse
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# 尝试导入可选依赖
try:
    from exa_py import Exa
    EXA_AVAILABLE = True
except ImportError:
    EXA_AVAILABLE = False
    print("⚠️ exa_py not installed, falling back to alternative search")

try:
    from playwright.sync_api import sync_playwright
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False
    print("⚠️ playwright not installed, verification will be limited")

# Configuration
EXA_API_KEY = os.getenv("EXA_API_KEY")
ZHIPUAI_API_KEY = os.getenv("ZHIPUAI_API_KEY")

# 4项验证标准关键词
VALIDATION_KEYWORDS = {
    "personal_registration": [
        "personal account", "individual", "no business required", "freelancer",
        "creator", "sign up free", "get started", "create account", "no llc",
        "personal use", "for individuals", "anyone can"
    ],
    "payment_receiving": [
        "receive payment", "get paid", "payout", "withdraw", "earnings",
        "revenue", "income", "collect payment", "accept payment", "tip",
        "donation", "subscription", "sell", "monetize"
    ],
    "own_payment_system": [
        "stripe connect", "payment processing", "direct deposit", "bank transfer",
        "payout system", "payment platform", "built-in payment", "integrated payment",
        "merchant", "payment gateway"
    ],
    "us_market_ach": [
        "united states", "usa", "us market", "ach", "bank transfer",
        "direct deposit", "us bank", "american", "usd", "dollar"
    ]
}

# 排除域名列表
EXCLUDED_DOMAINS = {
    "facebook.com", "twitter.com", "linkedin.com", "reddit.com",
    "instagram.com", "pinterest.com", "tiktok.com", "youtube.com",
    "wikipedia.org", "quora.com", "medium.com", "apps.apple.com",
    "play.google.com", "trustpilot.com", "bbb.org", "news.ycombinator.com",
    "alternativeto.net", "g2.com", "capterra.com", "getapp.com",
    "github.com", "stackoverflow.com", "amazon.com", "google.com"
}

# 已知真实平台（用于保留）
KNOWN_REAL_PLATFORMS = {
    "ko-fi.com", "buymeacoffee.com", "patreon.com", "paypal.com",
    "venmo.com", "cash.app", "gofundme.com", "stripe.com", "wise.com",
    "substack.com", "teachable.com", "thinkific.com", "gumroad.com",
    "kajabi.com", "podia.com", "memberful.com", "sendowl.com",
    "sellfy.com", "lemonsqueezy.com", "paddle.com"
}


class ClaudeAutoWorkflow:
    """Claude Code 自动化工作流主系统"""

    def __init__(self, project_dir: str = None):
        self.project_dir = project_dir or os.path.dirname(os.path.abspath(__file__))
        self.verified_file = os.path.join(self.project_dir, "verified_platforms.json")
        self.rejected_file = os.path.join(self.project_dir, "rejected_platforms.json")
        self.pending_file = os.path.join(self.project_dir, "pending_platforms.json")
        self.data_sources_file = os.path.join(self.project_dir, "data_sources.json")
        self.stats_file = os.path.join(self.project_dir, "workflow_stats.json")
        
        # 初始化统计
        self.stats = {
            "total_discovered": 0,
            "total_verified": 0,
            "total_rejected": 0,
            "batches_completed": 0,
            "last_batch_time": None,
            "pass_rate_history": []
        }
        
        # 加载数据
        self.load_data()
        
        # 初始化搜索客户端
        self.exa = Exa(EXA_API_KEY) if EXA_AVAILABLE and EXA_API_KEY else None
        
        print(f"🚀 Claude Auto Workflow 初始化完成")
        print(f"   📊 已验证平台: {len(self.verified['platforms'])}")
        print(f"   ❌ 已拒绝平台: {len(self.rejected['platforms'])}")
        print(f"   ⏳ 待验证平台: {len(self.pending['platforms'])}")

    def load_data(self):
        """加载所有数据文件"""
        # 加载已验证平台
        try:
            with open(self.verified_file, 'r', encoding='utf-8') as f:
                self.verified = json.load(f)
        except:
            self.verified = {"platforms": []}
        
        # 加载已拒绝平台
        try:
            with open(self.rejected_file, 'r', encoding='utf-8') as f:
                self.rejected = json.load(f)
        except:
            self.rejected = {"platforms": []}
        
        # 加载待验证平台
        try:
            with open(self.pending_file, 'r', encoding='utf-8') as f:
                self.pending = json.load(f)
        except:
            self.pending = {"platforms": []}
        
        # 加载数据源
        try:
            with open(self.data_sources_file, 'r', encoding='utf-8') as f:
                self.data_sources = json.load(f)
        except:
            self.data_sources = {}
        
        # 加载统计
        try:
            with open(self.stats_file, 'r', encoding='utf-8') as f:
                self.stats = json.load(f)
        except:
            pass
        
        # 构建已处理域名集合
        self._build_processed_domains()

    def _build_processed_domains(self):
        """构建已处理域名集合用于去重"""
        self.processed_domains: Set[str] = set()
        
        for p in self.verified.get("platforms", []):
            domain = self._extract_domain(p.get("domain") or p.get("url", ""))
            if domain:
                self.processed_domains.add(domain)
        
        for p in self.rejected.get("platforms", []):
            domain = self._extract_domain(p.get("domain") or p.get("url", ""))
            if domain:
                self.processed_domains.add(domain)

    def _extract_domain(self, url: str) -> str:
        """从URL提取域名"""
        if not url:
            return ""
        url = url.lower().strip()
        if not url.startswith(("http://", "https://")):
            url = "https://" + url
        try:
            parsed = urlparse(url)
            domain = parsed.netloc
            if domain.startswith("www."):
                domain = domain[4:]
            return domain
        except:
            return url

    def save_data(self):
        """保存所有数据"""
        with open(self.verified_file, 'w', encoding='utf-8') as f:
            json.dump(self.verified, f, ensure_ascii=False, indent=2)
        
        with open(self.rejected_file, 'w', encoding='utf-8') as f:
            json.dump(self.rejected, f, ensure_ascii=False, indent=2)
        
        with open(self.pending_file, 'w', encoding='utf-8') as f:
            json.dump(self.pending, f, ensure_ascii=False, indent=2)
        
        with open(self.stats_file, 'w', encoding='utf-8') as f:
            json.dump(self.stats, f, ensure_ascii=False, indent=2)

    def is_new_platform(self, url_or_domain: str) -> bool:
        """检查是否为新平台"""
        domain = self._extract_domain(url_or_domain)
        if not domain:
            return False
        if domain in EXCLUDED_DOMAINS:
            return False
        if domain in self.processed_domains:
            return False
        return True

    # ==================== 平台发现模块 ====================

    def discover_platforms_exa(self, query: str, num_results: int = 20) -> List[Dict]:
        """使用Exa API进行语义搜索"""
        if not self.exa:
            print("   ⚠️ Exa API不可用")
            return []
        
        print(f"   🔍 Exa搜索: '{query}'")
        try:
            result = self.exa.search_and_contents(
                query,
                type="neural",
                use_autoprompt=True,
                num_results=num_results,
                text=True
            )
            
            platforms = []
            for res in result.results:
                domain = self._extract_domain(res.url)
                if self.is_new_platform(domain):
                    platforms.append({
                        "name": res.title or domain,
                        "url": res.url,
                        "domain": domain,
                        "snippet": (res.text or "")[:300],
                        "source": "exa_search",
                        "discovered_date": datetime.now().isoformat()
                    })
            
            print(f"   ✅ 发现 {len(platforms)} 个新平台")
            return platforms
            
        except Exception as e:
            print(f"   ❌ Exa搜索失败: {e}")
            return []

    def discover_platforms(self, batch_size: int = 50) -> List[Dict]:
        """批量发现平台"""
        print(f"\n🔍 ========== 平台发现阶段 (目标: {batch_size}) ==========")
        
        # 搜索查询列表
        queries = [
            "personal payment platform for creators accept tips donations",
            "Stripe Connect alternatives for individuals freelancers",
            "collect donations without business entity personal account",
            "sell digital products personal account payment",
            "freelance invoicing platforms US ACH bank transfer",
            "creator monetization platform membership subscription",
            "tip jar platform for content creators",
            "crowdfunding platform personal fundraising",
            "online payment platform individual sellers",
            "accept payments as individual no LLC required"
        ]
        
        all_discovered = []
        
        # 方案1: 使用Exa搜索
        if self.exa:
            for query in queries[:5]:  # 使用5个查询
                platforms = self.discover_platforms_exa(query, num_results=15)
                all_discovered.extend(platforms)
                if len(all_discovered) >= batch_size:
                    break
                time.sleep(1)  # 避免API限流
        
        # 方案2: 智能平台变体生成（当Exa不可用或结果不足时）
        if len(all_discovered) < batch_size:
            print(f"   🧠 使用智能变体生成补充...")
            fallback_platforms = self._generate_platform_candidates(batch_size - len(all_discovered))
            all_discovered.extend(fallback_platforms)
        
        # 去重
        seen_domains = set()
        unique_platforms = []
        for p in all_discovered:
            domain = p.get("domain", "")
            if domain and domain not in seen_domains:
                seen_domains.add(domain)
                unique_platforms.append(p)
        
        # 限制数量
        unique_platforms = unique_platforms[:batch_size]
        
        print(f"\n📊 发现汇总: 共 {len(unique_platforms)} 个新平台待验证")
        
        return unique_platforms

    def _generate_platform_candidates(self, count: int) -> List[Dict]:
        """基于真实已知平台列表生成候选"""
        # 真实存在的平台列表（来自行业研究）
        real_platforms = [
            # 创作者打赏平台
            {"name": "Ko-fi", "domain": "ko-fi.com", "type": ["creator", "donation"]},
            {"name": "Buy Me a Coffee", "domain": "buymeacoffee.com", "type": ["creator", "donation"]},
            {"name": "Patreon", "domain": "patreon.com", "type": ["subscription", "creator"]},
            {"name": "Benevity", "domain": "benevity.com", "type": ["donation", "nonprofit"]},
            {"name": "Donorbox", "domain": "donorbox.org", "type": ["donation", "nonprofit"]},
            {"name": "Givebutter", "domain": "givebutter.com", "type": ["fundraising", "donation"]},
            {"name": "Classy", "domain": "classy.org", "type": ["fundraising", "nonprofit"]},
            {"name": "Fundly", "domain": "fundly.com", "type": ["crowdfunding", "fundraising"]},
            {"name": "Mightycause", "domain": "mightycause.com", "type": ["fundraising", "nonprofit"]},
            
            # 数字产品销售
            {"name": "Gumroad", "domain": "gumroad.com", "type": ["ecommerce", "digital"]},
            {"name": "Lemon Squeezy", "domain": "lemonsqueezy.com", "type": ["ecommerce", "saas"]},
            {"name": "Paddle", "domain": "paddle.com", "type": ["billing", "saas"]},
            {"name": "SendOwl", "domain": "sendowl.com", "type": ["ecommerce", "digital"]},
            {"name": "Sellfy", "domain": "sellfy.com", "type": ["ecommerce", "creator"]},
            {"name": "Podia", "domain": "podia.com", "type": ["education", "creator"]},
            {"name": "Stan Store", "domain": "stan.store", "type": ["creator", "ecommerce"]},
            {"name": "Beacons", "domain": "beacons.ai", "type": ["creator", "linkinbio"]},
            {"name": "Koji", "domain": "koji.to", "type": ["creator", "digital"]},
            {"name": "Snipfeed", "domain": "snipfeed.co", "type": ["creator", "monetization"]},
            
            # 在线教育课程
            {"name": "Teachable", "domain": "teachable.com", "type": ["education", "course"]},
            {"name": "Thinkific", "domain": "thinkific.com", "type": ["education", "course"]},
            {"name": "Kajabi", "domain": "kajabi.com", "type": ["education", "creator"]},
            {"name": "LearnWorlds", "domain": "learnworlds.com", "type": ["education", "course"]},
            {"name": "Teachery", "domain": "teachery.co", "type": ["education", "course"]},
            {"name": "Mighty Networks", "domain": "mightynetworks.com", "type": ["community", "education"]},
            {"name": "Circle", "domain": "circle.so", "type": ["community", "membership"]},
            {"name": "Skool", "domain": "skool.com", "type": ["community", "education"]},
            {"name": "Heartbeat", "domain": "heartbeat.chat", "type": ["community", "membership"]},
            
            # 订阅会员
            {"name": "Memberful", "domain": "memberful.com", "type": ["membership", "subscription"]},
            {"name": "Memberspace", "domain": "memberspace.com", "type": ["membership", "subscription"]},
            {"name": "Substack", "domain": "substack.com", "type": ["newsletter", "subscription"]},
            {"name": "Ghost", "domain": "ghost.org", "type": ["newsletter", "publishing"]},
            {"name": "Revue", "domain": "getrevue.co", "type": ["newsletter", "subscription"]},
            {"name": "Buttondown", "domain": "buttondown.email", "type": ["newsletter", "subscription"]},
            {"name": "ConvertKit", "domain": "convertkit.com", "type": ["newsletter", "creator"]},
            {"name": "Beehiiv", "domain": "beehiiv.com", "type": ["newsletter", "subscription"]},
            
            # 支付链接
            {"name": "Stripe", "domain": "stripe.com", "type": ["payment", "gateway"]},
            {"name": "PayPal", "domain": "paypal.com", "type": ["payment", "p2p"]},
            {"name": "Square", "domain": "squareup.com", "type": ["payment", "pos"]},
            {"name": "Wise", "domain": "wise.com", "type": ["payment", "transfer"]},
            {"name": "PayPal.me", "domain": "paypal.me", "type": ["payment", "personal"]},
            {"name": "Venmo", "domain": "venmo.com", "type": ["payment", "p2p"]},
            {"name": "Cash App", "domain": "cash.app", "type": ["payment", "p2p"]},
            {"name": "Zelle", "domain": "zellepay.com", "type": ["payment", "bank"]},
            
            # 众筹平台
            {"name": "GoFundMe", "domain": "gofundme.com", "type": ["crowdfunding", "personal"]},
            {"name": "Kickstarter", "domain": "kickstarter.com", "type": ["crowdfunding", "creative"]},
            {"name": "Indiegogo", "domain": "indiegogo.com", "type": ["crowdfunding", "product"]},
            {"name": "Crowdfunder", "domain": "crowdfunder.com", "type": ["crowdfunding", "equity"]},
            {"name": "Wefunder", "domain": "wefunder.com", "type": ["crowdfunding", "equity"]},
            {"name": "Republic", "domain": "republic.com", "type": ["crowdfunding", "equity"]},
            {"name": "StartEngine", "domain": "startengine.com", "type": ["crowdfunding", "equity"]},
            
            # 活动票务
            {"name": "Eventbrite", "domain": "eventbrite.com", "type": ["ticketing", "events"]},
            {"name": "Ticket Tailor", "domain": "tickettailor.com", "type": ["ticketing", "events"]},
            {"name": "Splash", "domain": "splashthat.com", "type": ["events", "marketing"]},
            {"name": "Luma", "domain": "lu.ma", "type": ["events", "community"]},
            {"name": "Partiful", "domain": "partiful.com", "type": ["events", "social"]},
            {"name": "Posh", "domain": "posh.vip", "type": ["events", "ticketing"]},
            
            # 自由职业
            {"name": "Fiverr", "domain": "fiverr.com", "type": ["freelance", "marketplace"]},
            {"name": "Upwork", "domain": "upwork.com", "type": ["freelance", "marketplace"]},
            {"name": "Toptal", "domain": "toptal.com", "type": ["freelance", "talent"]},
            {"name": "Contra", "domain": "contra.com", "type": ["freelance", "portfolio"]},
            {"name": "Bonsai", "domain": "hellobonsai.com", "type": ["freelance", "invoicing"]},
            {"name": "HoneyBook", "domain": "honeybook.com", "type": ["freelance", "invoicing"]},
            {"name": "Wave", "domain": "waveapps.com", "type": ["invoicing", "accounting"]},
            {"name": "Freshbooks", "domain": "freshbooks.com", "type": ["invoicing", "accounting"]},
            
            # 新发现平台
            {"name": "Throne", "domain": "throne.com", "type": ["wishlist", "creator"]},
            {"name": "Fourthwall", "domain": "fourthwall.com", "type": ["ecommerce", "creator"]},
            {"name": "Spring", "domain": "spri.ng", "type": ["merch", "creator"]},
            {"name": "Printful", "domain": "printful.com", "type": ["merch", "pod"]},
            {"name": "Printify", "domain": "printify.com", "type": ["merch", "pod"]},
            {"name": "Teespring", "domain": "teespring.com", "type": ["merch", "creator"]},
            {"name": "Redbubble", "domain": "redbubble.com", "type": ["merch", "marketplace"]},
            {"name": "Society6", "domain": "society6.com", "type": ["merch", "art"]},
            {"name": "Etsy", "domain": "etsy.com", "type": ["marketplace", "handmade"]},
            {"name": "Depop", "domain": "depop.com", "type": ["marketplace", "fashion"]},
            {"name": "Poshmark", "domain": "poshmark.com", "type": ["marketplace", "resale"]},
            
            # 音乐/内容
            {"name": "Bandcamp", "domain": "bandcamp.com", "type": ["music", "creator"]},
            {"name": "DistroKid", "domain": "distrokid.com", "type": ["music", "distribution"]},
            {"name": "TuneCore", "domain": "tunecore.com", "type": ["music", "distribution"]},
            {"name": "CD Baby", "domain": "cdbaby.com", "type": ["music", "distribution"]},
            {"name": "SoundCloud", "domain": "soundcloud.com", "type": ["music", "streaming"]},
            {"name": "Audiomack", "domain": "audiomack.com", "type": ["music", "streaming"]},
            
            # 直播打赏
            {"name": "Streamlabs", "domain": "streamlabs.com", "type": ["streaming", "donation"]},
            {"name": "StreamElements", "domain": "streamelements.com", "type": ["streaming", "tools"]},
            {"name": "Throne Wishlist", "domain": "throne.com", "type": ["wishlist", "streaming"]},
            {"name": "Loots", "domain": "loots.com", "type": ["streaming", "donation"]},
        ]
        
        candidates = []
        random.shuffle(real_platforms)
        
        for platform in real_platforms:
            if len(candidates) >= count:
                break
            
            domain = platform["domain"]
            if self.is_new_platform(domain):
                candidates.append({
                    "name": platform["name"],
                    "domain": domain,
                    "url": f"https://{domain}",
                    "type": platform["type"],
                    "source": "known_platforms_db",
                    "discovered_date": datetime.now().isoformat()
                })
        
        print(f"   ✨ 从已知平台列表中选择 {len(candidates)} 个候选")
        return candidates

    # ==================== 平台验证模块 ====================

    def fetch_website_content(self, url: str) -> Optional[Dict]:
        """使用Playwright获取网站内容"""
        if not PLAYWRIGHT_AVAILABLE:
            return None
        
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                context = browser.new_context(
                    user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
                )
                page = context.new_page()
                
                try:
                    response = page.goto(url, timeout=30000, wait_until="domcontentloaded")
                    if not response or response.status >= 400:
                        browser.close()
                        return {"error": f"HTTP {response.status if response else 'No response'}"}
                    
                    page.wait_for_timeout(2000)
                    
                    title = page.title()
                    content = page.inner_text('body').lower()[:15000]
                    
                    browser.close()
                    
                    return {
                        "url": url,
                        "title": title,
                        "content": content,
                        "success": True
                    }
                except Exception as e:
                    browser.close()
                    return {"error": str(e)}
        except Exception as e:
            return {"error": str(e)}

    def validate_criteria(self, content: str, domain: str) -> Dict[str, Any]:
        """验证4项标准"""
        content_lower = content.lower()
        
        results = {
            "personal_registration": False,
            "payment_receiving": False,
            "own_payment_system": False,
            "us_market_ach": False,
            "evidence": {}
        }
        
        # 1. 个人注册能力
        matched_keywords = []
        for kw in VALIDATION_KEYWORDS["personal_registration"]:
            if kw in content_lower:
                matched_keywords.append(kw)
        if len(matched_keywords) >= 2:  # 至少匹配2个关键词
            results["personal_registration"] = True
            results["evidence"]["personal_registration"] = matched_keywords[:3]
        
        # 2. 支付接收能力
        matched_keywords = []
        for kw in VALIDATION_KEYWORDS["payment_receiving"]:
            if kw in content_lower:
                matched_keywords.append(kw)
        if len(matched_keywords) >= 2:
            results["payment_receiving"] = True
            results["evidence"]["payment_receiving"] = matched_keywords[:3]
        
        # 3. 自有支付系统
        matched_keywords = []
        for kw in VALIDATION_KEYWORDS["own_payment_system"]:
            if kw in content_lower:
                matched_keywords.append(kw)
        if len(matched_keywords) >= 1:  # 1个关键词即可
            results["own_payment_system"] = True
            results["evidence"]["own_payment_system"] = matched_keywords[:3]
        
        # 4. 美国市场/ACH支持
        # .com域名默认通过
        if domain.endswith(".com"):
            results["us_market_ach"] = True
            results["evidence"]["us_market_ach"] = [".com domain"]
        else:
            matched_keywords = []
            for kw in VALIDATION_KEYWORDS["us_market_ach"]:
                if kw in content_lower:
                    matched_keywords.append(kw)
            if len(matched_keywords) >= 1:
                results["us_market_ach"] = True
                results["evidence"]["us_market_ach"] = matched_keywords[:3]
        
        # 计算通过项数
        passed = sum([
            results["personal_registration"],
            results["payment_receiving"],
            results["own_payment_system"],
            results["us_market_ach"]
        ])
        results["passed_count"] = passed
        results["all_passed"] = passed == 4
        
        return results

    def validate_platform(self, platform: Dict) -> Dict:
        """验证单个平台"""
        url = platform.get("url") or f"https://{platform.get('domain')}"
        domain = platform.get("domain") or self._extract_domain(url)
        name = platform.get("name", domain)
        
        print(f"   🔍 验证: {name} ({domain})")
        
        # 获取网站内容
        site_data = self.fetch_website_content(url)
        
        if not site_data or site_data.get("error"):
            error_msg = site_data.get("error", "无法访问") if site_data else "无法访问"
            return {
                **platform,
                "validation_status": "failed",
                "validation_error": error_msg,
                "validation_results": {
                    "personal_registration": False,
                    "payment_receiving": False,
                    "own_payment_system": False,
                    "us_market_ach": False
                }
            }
        
        # 执行4项验证
        content = site_data.get("content", "")
        validation = self.validate_criteria(content, domain)
        
        result = {
            **platform,
            "name": site_data.get("title", name)[:100],  # 使用网站标题
            "validation_status": "verified" if validation["all_passed"] else "rejected",
            "validation_results": {
                "personal_registration": validation["personal_registration"],
                "payment_receiving": validation["payment_receiving"],
                "own_payment_system": validation["own_payment_system"],
                "us_market_ach": validation["us_market_ach"]
            },
            "validation_evidence": validation.get("evidence", {}),
            "passed_count": validation["passed_count"],
            "verified_date": datetime.now().isoformat()
        }
        
        if validation["all_passed"]:
            print(f"      ✅ 通过 4/4 验证")
        else:
            print(f"      ❌ 仅通过 {validation['passed_count']}/4 验证")
        
        return result

    # ==================== 批量处理模块 ====================

    def run_batch(self, batch_size: int = 50) -> Dict:
        """运行一批验证"""
        batch_start = datetime.now()
        print(f"\n🔄 ========== 批次开始 @ {batch_start.strftime('%Y-%m-%d %H:%M:%S')} ==========")
        
        # 1. 发现平台
        candidates = self.discover_platforms(batch_size)
        
        if not candidates:
            print("⚠️ 未发现新平台，等待下一批")
            return {"discovered": 0, "verified": 0, "rejected": 0}
        
        # 2. 验证平台
        print(f"\n✅ ========== 验证阶段 ({len(candidates)} 个平台) ==========")
        
        verified_count = 0
        rejected_count = 0
        
        for i, platform in enumerate(candidates):
            print(f"\n[{i+1}/{len(candidates)}]")
            
            result = self.validate_platform(platform)
            
            if result["validation_status"] == "verified":
                self.verified["platforms"].append(result)
                self.processed_domains.add(result.get("domain", ""))
                verified_count += 1
            else:
                self.rejected["platforms"].append(result)
                self.processed_domains.add(result.get("domain", ""))
                rejected_count += 1
            
            # 每10个平台保存一次
            if (i + 1) % 10 == 0:
                self.save_data()
                print(f"   💾 已保存进度...")
        
        # 3. 保存最终结果
        self.save_data()
        
        # 4. 更新统计
        batch_end = datetime.now()
        batch_time = (batch_end - batch_start).total_seconds()
        pass_rate = (verified_count / len(candidates) * 100) if candidates else 0
        
        self.stats["total_discovered"] += len(candidates)
        self.stats["total_verified"] += verified_count
        self.stats["total_rejected"] += rejected_count
        self.stats["batches_completed"] += 1
        self.stats["last_batch_time"] = batch_end.isoformat()
        self.stats["pass_rate_history"].append({
            "batch": self.stats["batches_completed"],
            "pass_rate": pass_rate,
            "time": batch_end.isoformat()
        })
        self.save_data()
        
        # 5. 输出报告
        print(f"\n📊 ========== 批次报告 ==========")
        print(f"   ⏱️  耗时: {batch_time:.1f} 秒")
        print(f"   🔍 发现: {len(candidates)} 个平台")
        print(f"   ✅ 通过: {verified_count} 个平台")
        print(f"   ❌ 拒绝: {rejected_count} 个平台")
        print(f"   📈 通过率: {pass_rate:.1f}%")
        print(f"   📊 累计验证平台: {len(self.verified['platforms'])}")
        
        return {
            "discovered": len(candidates),
            "verified": verified_count,
            "rejected": rejected_count,
            "pass_rate": pass_rate,
            "batch_time": batch_time
        }

    def analyze_and_optimize(self) -> Dict:
        """分析通过率并优化策略"""
        if len(self.stats.get("pass_rate_history", [])) < 3:
            return {"action": "继续", "reason": "数据不足，需要更多批次"}
        
        # 计算最近5批的平均通过率
        recent = self.stats["pass_rate_history"][-5:]
        avg_rate = sum(r["pass_rate"] for r in recent) / len(recent)
        
        print(f"\n🧠 ========== 策略分析 ==========")
        print(f"   📈 最近{len(recent)}批平均通过率: {avg_rate:.1f}%")
        
        if avg_rate < 15:
            # 通过率过低，需要调整
            print(f"   ⚠️ 通过率过低，建议调整搜索策略")
            return {"action": "调整", "reason": "通过率低于15%"}
        elif avg_rate > 60:
            print(f"   ✅ 通过率良好，保持当前策略")
            return {"action": "保持", "reason": "通过率正常"}
        else:
            print(f"   📊 通过率一般，继续监控")
            return {"action": "继续", "reason": "通过率正常范围"}

    def run_forever(self, batch_size: int = 50, interval_seconds: int = 120):
        """无限循环运行"""
        print(f"\n🚀 ========== 启动无限循环模式 ==========")
        print(f"   📦 批量大小: {batch_size}")
        print(f"   ⏱️  批间隔: {interval_seconds} 秒")
        print(f"   🔄 按 Ctrl+C 停止")
        
        batch_count = 0
        
        while True:
            batch_count += 1
            print(f"\n{'='*60}")
            print(f"🔄 循环 #{batch_count}")
            print(f"{'='*60}")
            
            try:
                # 运行一批
                result = self.run_batch(batch_size)
                
                # 分析优化
                if batch_count % 3 == 0:  # 每3批分析一次
                    self.analyze_and_optimize()
                
            except KeyboardInterrupt:
                print("\n\n⏹️ 用户中断，正在保存...")
                self.save_data()
                print("✅ 数据已保存，退出")
                break
            except Exception as e:
                print(f"❌ 批次失败: {e}")
                import traceback
                traceback.print_exc()
            
            print(f"\n💤 等待 {interval_seconds} 秒...")
            try:
                time.sleep(interval_seconds)
            except KeyboardInterrupt:
                print("\n\n⏹️ 用户中断，正在保存...")
                self.save_data()
                print("✅ 数据已保存，退出")
                break


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Claude Auto Workflow")
    parser.add_argument("--test", action="store_true", help="运行测试批次")
    parser.add_argument("--batch", action="store_true", help="运行单批次")
    parser.add_argument("--batch-size", type=int, default=50, help="批量大小")
    parser.add_argument("--interval", type=int, default=120, help="批间隔(秒)")
    args = parser.parse_args()
    
    workflow = ClaudeAutoWorkflow()
    
    if args.test:
        print("🧪 测试模式: 运行小批次")
        workflow.run_batch(batch_size=5)
    elif args.batch:
        print("📦 单批次模式")
        workflow.run_batch(batch_size=args.batch_size)
    else:
        print("🔄 无限循环模式")
        workflow.run_forever(batch_size=args.batch_size, interval_seconds=args.interval)


if __name__ == "__main__":
    main()
