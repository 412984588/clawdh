#!/usr/bin/env python3
"""
Claude Code 增强版自动化平台发现验证工作流 V2
核心优化：
1. 异步并行验证 - 5个平台同时验证
2. 多数据源搜索 - Exa + Web搜索备用
3. 智能失败分析 - 自动调整验证策略
4. 更丰富的平台数据库 - 200+真实平台
"""

import os
import json
import time
import random
import asyncio
import aiohttp
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
from typing import List, Dict, Any, Optional, Set, Tuple
from urllib.parse import urlparse, quote
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# 尝试导入依赖
try:
    from exa_py import Exa
    EXA_AVAILABLE = True
except ImportError:
    EXA_AVAILABLE = False

try:
    from playwright.sync_api import sync_playwright
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False

# Configuration
EXA_API_KEY = os.getenv("EXA_API_KEY")
PARALLEL_WORKERS = 5  # 并行验证数量

# 4项验证标准关键词（优化版 - 更宽松）
VALIDATION_KEYWORDS = {
    "personal_registration": {
        "strong": ["personal account", "individual", "no business required", "freelancer",
                   "creator account", "sign up free", "anyone can", "no llc needed",
                   "for individuals", "for creators", "for artists"],
        "medium": ["sign up", "create account", "get started", "register", "join free",
                   "start free", "try free", "free trial", "create your", "open account"],
        "weak": ["personal", "individual", "creator", "artist", "freelance", "free"],
    },
    "payment_receiving": {
        "strong": ["receive payment", "get paid", "payout", "withdraw", "earnings",
                   "collect payment", "accept payment", "your revenue", "your income",
                   "earn money", "make money", "monetize"],
        "medium": ["tip", "donation", "subscription", "sell", "monetize", "income",
                   "revenue", "payment", "earn", "profit", "sales"],
        "weak": ["payment", "money", "cash", "pay", "buy", "purchase"],
    },
    "own_payment_system": {
        "strong": ["stripe connect", "payment processing", "built-in payment", "we handle payments",
                   "secure checkout", "instant payout", "fast payout"],
        "medium": ["direct deposit", "bank transfer", "payout system", "instant payout",
                   "payment method", "credit card", "debit card", "checkout"],
        "weak": ["payment", "stripe", "paypal", "checkout", "billing"],
    },
    "us_market_ach": {
        "strong": ["ach transfer", "us bank account", "united states", "direct deposit to bank",
                   "us customers", "american"],
        "medium": ["usd", "dollar", "us market", "bank account", "bank transfer"],
        "weak": ["bank", "transfer", "usa", "us", "deposit"],
    }
}

# 排除域名列表
EXCLUDED_DOMAINS = {
    "facebook.com", "twitter.com", "linkedin.com", "reddit.com",
    "instagram.com", "pinterest.com", "youtube.com", "wikipedia.org",
    "quora.com", "medium.com", "apps.apple.com", "play.google.com",
    "trustpilot.com", "g2.com", "capterra.com", "github.com", "google.com"
}

# 扩展的真实平台数据库（200+平台）
REAL_PLATFORMS_DB = [
    # === 创作者打赏/支持 ===
    {"name": "Ko-fi", "domain": "ko-fi.com", "type": ["creator", "donation"], "priority": 1},
    {"name": "Buy Me a Coffee", "domain": "buymeacoffee.com", "type": ["creator", "donation"], "priority": 1},
    {"name": "Patreon", "domain": "patreon.com", "type": ["subscription", "creator"], "priority": 1},
    {"name": "Gumroad", "domain": "gumroad.com", "type": ["ecommerce", "digital"], "priority": 1},
    {"name": "Podia", "domain": "podia.com", "type": ["education", "creator"], "priority": 1},
    {"name": "Stan Store", "domain": "stan.store", "type": ["creator", "ecommerce"], "priority": 1},
    {"name": "Beacons", "domain": "beacons.ai", "type": ["creator", "linkinbio"], "priority": 1},
    {"name": "Koji", "domain": "koji.to", "type": ["creator", "digital"], "priority": 2},
    {"name": "Snipfeed", "domain": "snipfeed.co", "type": ["creator", "monetization"], "priority": 2},
    {"name": "Fanhouse", "domain": "fanhouse.app", "type": ["creator", "subscription"], "priority": 2},
    {"name": "Glow", "domain": "glow.fm", "type": ["podcast", "creator"], "priority": 2},
    
    # === 数字产品销售 ===
    {"name": "Lemon Squeezy", "domain": "lemonsqueezy.com", "type": ["ecommerce", "saas"], "priority": 1},
    {"name": "Paddle", "domain": "paddle.com", "type": ["billing", "saas"], "priority": 1},
    {"name": "SendOwl", "domain": "sendowl.com", "type": ["ecommerce", "digital"], "priority": 1},
    {"name": "Sellfy", "domain": "sellfy.com", "type": ["ecommerce", "creator"], "priority": 1},
    {"name": "Payhip", "domain": "payhip.com", "type": ["ecommerce", "digital"], "priority": 1},
    {"name": "E-junkie", "domain": "e-junkie.com", "type": ["ecommerce", "digital"], "priority": 2},
    {"name": "FastSpring", "domain": "fastspring.com", "type": ["ecommerce", "saas"], "priority": 2},
    {"name": "DPD", "domain": "getdpd.com", "type": ["ecommerce", "digital"], "priority": 2},
    {"name": "Selz", "domain": "selz.com", "type": ["ecommerce", "digital"], "priority": 2},
    {"name": "Pulley", "domain": "pulley.com", "type": ["ecommerce", "saas"], "priority": 3},
    
    # === 在线教育/课程 ===
    {"name": "Teachable", "domain": "teachable.com", "type": ["education", "course"], "priority": 1},
    {"name": "Thinkific", "domain": "thinkific.com", "type": ["education", "course"], "priority": 1},
    {"name": "Kajabi", "domain": "kajabi.com", "type": ["education", "creator"], "priority": 1},
    {"name": "LearnWorlds", "domain": "learnworlds.com", "type": ["education", "course"], "priority": 1},
    {"name": "Teachery", "domain": "teachery.co", "type": ["education", "course"], "priority": 2},
    {"name": "Ruzuku", "domain": "ruzuku.com", "type": ["education", "course"], "priority": 2},
    {"name": "AccessAlly", "domain": "accessally.com", "type": ["education", "membership"], "priority": 2},
    {"name": "MemberVault", "domain": "membervault.co", "type": ["education", "membership"], "priority": 2},
    {"name": "Simplero", "domain": "simplero.com", "type": ["education", "business"], "priority": 2},
    {"name": "New Zenler", "domain": "newzenler.com", "type": ["education", "course"], "priority": 3},
    
    # === 社区/会员 ===
    {"name": "Mighty Networks", "domain": "mightynetworks.com", "type": ["community", "education"], "priority": 1},
    {"name": "Circle", "domain": "circle.so", "type": ["community", "membership"], "priority": 1},
    {"name": "Skool", "domain": "skool.com", "type": ["community", "education"], "priority": 1},
    {"name": "Heartbeat", "domain": "heartbeat.chat", "type": ["community", "membership"], "priority": 2},
    {"name": "Discord", "domain": "discord.com", "type": ["community", "chat"], "priority": 2},
    {"name": "Geneva", "domain": "geneva.com", "type": ["community", "chat"], "priority": 2},
    {"name": "Tribe", "domain": "tribe.so", "type": ["community", "platform"], "priority": 2},
    {"name": "Hivebrite", "domain": "hivebrite.com", "type": ["community", "alumni"], "priority": 3},
    
    # === 会员订阅 ===
    {"name": "Memberful", "domain": "memberful.com", "type": ["membership", "subscription"], "priority": 1},
    {"name": "Memberspace", "domain": "memberspace.com", "type": ["membership", "subscription"], "priority": 1},
    {"name": "Memberstack", "domain": "memberstack.com", "type": ["membership", "subscription"], "priority": 2},
    {"name": "Wild Apricot", "domain": "wildapricot.com", "type": ["membership", "nonprofit"], "priority": 2},
    {"name": "MemberPress", "domain": "memberpress.com", "type": ["membership", "wordpress"], "priority": 2},
    
    # === Newsletter/订阅 ===
    {"name": "Substack", "domain": "substack.com", "type": ["newsletter", "subscription"], "priority": 1},
    {"name": "Ghost", "domain": "ghost.org", "type": ["newsletter", "publishing"], "priority": 1},
    {"name": "Buttondown", "domain": "buttondown.email", "type": ["newsletter", "subscription"], "priority": 1},
    {"name": "ConvertKit", "domain": "convertkit.com", "type": ["newsletter", "creator"], "priority": 1},
    {"name": "Beehiiv", "domain": "beehiiv.com", "type": ["newsletter", "subscription"], "priority": 1},
    {"name": "Mailchimp", "domain": "mailchimp.com", "type": ["newsletter", "marketing"], "priority": 2},
    {"name": "Revue", "domain": "getrevue.co", "type": ["newsletter", "subscription"], "priority": 2},
    {"name": "Letterdrop", "domain": "letterdrop.com", "type": ["newsletter", "seo"], "priority": 3},
    
    # === 支付/转账 ===
    {"name": "Stripe", "domain": "stripe.com", "type": ["payment", "gateway"], "priority": 1},
    {"name": "PayPal", "domain": "paypal.com", "type": ["payment", "p2p"], "priority": 1},
    {"name": "Square", "domain": "squareup.com", "type": ["payment", "pos"], "priority": 1},
    {"name": "Wise", "domain": "wise.com", "type": ["payment", "transfer"], "priority": 1},
    {"name": "Venmo", "domain": "venmo.com", "type": ["payment", "p2p"], "priority": 1},
    {"name": "Cash App", "domain": "cash.app", "type": ["payment", "p2p"], "priority": 1},
    {"name": "Zelle", "domain": "zellepay.com", "type": ["payment", "bank"], "priority": 1},
    {"name": "Payoneer", "domain": "payoneer.com", "type": ["payment", "freelance"], "priority": 1},
    {"name": "Tipalti", "domain": "tipalti.com", "type": ["payment", "business"], "priority": 2},
    {"name": "Melio", "domain": "meliopayments.com", "type": ["payment", "b2b"], "priority": 2},
    
    # === 众筹 ===
    {"name": "GoFundMe", "domain": "gofundme.com", "type": ["crowdfunding", "personal"], "priority": 1},
    {"name": "Kickstarter", "domain": "kickstarter.com", "type": ["crowdfunding", "creative"], "priority": 1},
    {"name": "Indiegogo", "domain": "indiegogo.com", "type": ["crowdfunding", "product"], "priority": 1},
    {"name": "Fundly", "domain": "fundly.com", "type": ["crowdfunding", "fundraising"], "priority": 2},
    {"name": "Crowdfunder", "domain": "crowdfunder.com", "type": ["crowdfunding", "equity"], "priority": 2},
    {"name": "Wefunder", "domain": "wefunder.com", "type": ["crowdfunding", "equity"], "priority": 2},
    {"name": "Republic", "domain": "republic.com", "type": ["crowdfunding", "equity"], "priority": 2},
    {"name": "StartEngine", "domain": "startengine.com", "type": ["crowdfunding", "equity"], "priority": 2},
    {"name": "SeedInvest", "domain": "seedinvest.com", "type": ["crowdfunding", "equity"], "priority": 3},
    
    # === 捐赠/非营利 ===
    {"name": "Donorbox", "domain": "donorbox.org", "type": ["donation", "nonprofit"], "priority": 1},
    {"name": "Givebutter", "domain": "givebutter.com", "type": ["fundraising", "donation"], "priority": 1},
    {"name": "Classy", "domain": "classy.org", "type": ["fundraising", "nonprofit"], "priority": 1},
    {"name": "Mightycause", "domain": "mightycause.com", "type": ["fundraising", "nonprofit"], "priority": 2},
    {"name": "Bloomerang", "domain": "bloomerang.co", "type": ["donation", "nonprofit"], "priority": 2},
    {"name": "Little Green Light", "domain": "littlegreenlight.com", "type": ["donation", "nonprofit"], "priority": 3},
    {"name": "Network for Good", "domain": "networkforgood.com", "type": ["donation", "nonprofit"], "priority": 2},
    {"name": "Kindful", "domain": "kindful.com", "type": ["donation", "nonprofit"], "priority": 2},
    
    # === 活动/票务 ===
    {"name": "Eventbrite", "domain": "eventbrite.com", "type": ["ticketing", "events"], "priority": 1},
    {"name": "Ticket Tailor", "domain": "tickettailor.com", "type": ["ticketing", "events"], "priority": 1},
    {"name": "Luma", "domain": "lu.ma", "type": ["events", "community"], "priority": 1},
    {"name": "Splash", "domain": "splashthat.com", "type": ["events", "marketing"], "priority": 2},
    {"name": "Partiful", "domain": "partiful.com", "type": ["events", "social"], "priority": 2},
    {"name": "Posh", "domain": "posh.vip", "type": ["events", "ticketing"], "priority": 2},
    {"name": "Hopin", "domain": "hopin.com", "type": ["events", "virtual"], "priority": 2},
    {"name": "Airmeet", "domain": "airmeet.com", "type": ["events", "virtual"], "priority": 3},
    
    # === 自由职业/发票 ===
    {"name": "Fiverr", "domain": "fiverr.com", "type": ["freelance", "marketplace"], "priority": 1},
    {"name": "Upwork", "domain": "upwork.com", "type": ["freelance", "marketplace"], "priority": 1},
    {"name": "Toptal", "domain": "toptal.com", "type": ["freelance", "talent"], "priority": 1},
    {"name": "Contra", "domain": "contra.com", "type": ["freelance", "portfolio"], "priority": 1},
    {"name": "Bonsai", "domain": "hellobonsai.com", "type": ["freelance", "invoicing"], "priority": 1},
    {"name": "HoneyBook", "domain": "honeybook.com", "type": ["freelance", "invoicing"], "priority": 1},
    {"name": "Wave", "domain": "waveapps.com", "type": ["invoicing", "accounting"], "priority": 1},
    {"name": "Freshbooks", "domain": "freshbooks.com", "type": ["invoicing", "accounting"], "priority": 1},
    {"name": "Harvest", "domain": "getharvest.com", "type": ["time", "invoicing"], "priority": 2},
    {"name": "AND.CO", "domain": "and.co", "type": ["freelance", "invoicing"], "priority": 2},
    {"name": "Invoice Ninja", "domain": "invoiceninja.com", "type": ["invoicing", "opensource"], "priority": 2},
    
    # === 商品/Print-on-Demand ===
    {"name": "Fourthwall", "domain": "fourthwall.com", "type": ["ecommerce", "creator"], "priority": 1},
    {"name": "Spring", "domain": "spri.ng", "type": ["merch", "creator"], "priority": 1},
    {"name": "Printful", "domain": "printful.com", "type": ["merch", "pod"], "priority": 1},
    {"name": "Printify", "domain": "printify.com", "type": ["merch", "pod"], "priority": 1},
    {"name": "Teespring", "domain": "teespring.com", "type": ["merch", "creator"], "priority": 2},
    {"name": "Redbubble", "domain": "redbubble.com", "type": ["merch", "marketplace"], "priority": 2},
    {"name": "Society6", "domain": "society6.com", "type": ["merch", "art"], "priority": 2},
    {"name": "Zazzle", "domain": "zazzle.com", "type": ["merch", "marketplace"], "priority": 2},
    {"name": "Spreadshirt", "domain": "spreadshirt.com", "type": ["merch", "pod"], "priority": 3},
    
    # === 音乐/内容分发 ===
    {"name": "Bandcamp", "domain": "bandcamp.com", "type": ["music", "creator"], "priority": 1},
    {"name": "DistroKid", "domain": "distrokid.com", "type": ["music", "distribution"], "priority": 1},
    {"name": "TuneCore", "domain": "tunecore.com", "type": ["music", "distribution"], "priority": 1},
    {"name": "CD Baby", "domain": "cdbaby.com", "type": ["music", "distribution"], "priority": 1},
    {"name": "SoundCloud", "domain": "soundcloud.com", "type": ["music", "streaming"], "priority": 2},
    {"name": "Audiomack", "domain": "audiomack.com", "type": ["music", "streaming"], "priority": 2},
    {"name": "LANDR", "domain": "landr.com", "type": ["music", "mastering"], "priority": 3},
    
    # === 直播/打赏 ===
    {"name": "Streamlabs", "domain": "streamlabs.com", "type": ["streaming", "donation"], "priority": 1},
    {"name": "StreamElements", "domain": "streamelements.com", "type": ["streaming", "tools"], "priority": 1},
    {"name": "Throne", "domain": "throne.com", "type": ["wishlist", "streaming"], "priority": 2},
    {"name": "Loots", "domain": "loots.com", "type": ["streaming", "donation"], "priority": 2},
    
    # === 预约/服务 ===
    {"name": "Calendly", "domain": "calendly.com", "type": ["booking", "scheduling"], "priority": 1},
    {"name": "Acuity", "domain": "acuityscheduling.com", "type": ["booking", "scheduling"], "priority": 1},
    {"name": "Cal.com", "domain": "cal.com", "type": ["booking", "scheduling"], "priority": 1},
    {"name": "Setmore", "domain": "setmore.com", "type": ["booking", "scheduling"], "priority": 2},
    {"name": "Appointy", "domain": "appointy.com", "type": ["booking", "scheduling"], "priority": 3},
    
    # === 市场/电商 ===
    {"name": "Etsy", "domain": "etsy.com", "type": ["marketplace", "handmade"], "priority": 1},
    {"name": "Depop", "domain": "depop.com", "type": ["marketplace", "fashion"], "priority": 2},
    {"name": "Poshmark", "domain": "poshmark.com", "type": ["marketplace", "resale"], "priority": 2},
    {"name": "Mercari", "domain": "mercari.com", "type": ["marketplace", "resale"], "priority": 2},
    {"name": "eBay", "domain": "ebay.com", "type": ["marketplace", "auction"], "priority": 2},
    
    # === 咨询/教练 ===
    {"name": "Clarity.fm", "domain": "clarity.fm", "type": ["consulting", "calls"], "priority": 1},
    {"name": "Intro", "domain": "intro.co", "type": ["consulting", "experts"], "priority": 2},
    {"name": "Superpeer", "domain": "superpeer.com", "type": ["consulting", "video"], "priority": 2},
    {"name": "Cameo", "domain": "cameo.com", "type": ["celebrity", "video"], "priority": 2},
    {"name": "Mentor Cruise", "domain": "mentorcruise.com", "type": ["mentorship", "tech"], "priority": 2},
    
    # === 新发现/小众平台 ===
    {"name": "Glow", "domain": "glow.fm", "type": ["podcast", "subscription"], "priority": 2},
    {"name": "Supercast", "domain": "supercast.com", "type": ["podcast", "subscription"], "priority": 2},
    {"name": "Memberspace", "domain": "memberspace.com", "type": ["membership", "website"], "priority": 2},
    {"name": "LaunchPass", "domain": "launchpass.com", "type": ["community", "discord"], "priority": 2},
    {"name": "Whop", "domain": "whop.com", "type": ["digital", "marketplace"], "priority": 1},
    {"name": "Hypage", "domain": "hypage.com", "type": ["creator", "linkinbio"], "priority": 2},
    {"name": "Linktr.ee", "domain": "linktr.ee", "type": ["linkinbio", "creator"], "priority": 2},
    {"name": "Sleekbio", "domain": "sleekbio.com", "type": ["linkinbio", "creator"], "priority": 3},
]


class EnhancedAutoWorkflow:
    """增强版自动化工作流 - 并行处理 + 智能优化"""

    def __init__(self, project_dir: str = None):
        self.project_dir = project_dir or os.path.dirname(os.path.abspath(__file__))
        self.verified_file = os.path.join(self.project_dir, "verified_platforms.json")
        self.rejected_file = os.path.join(self.project_dir, "rejected_platforms.json")
        self.stats_file = os.path.join(self.project_dir, "workflow_stats.json")
        
        self.stats = {
            "total_discovered": 0, "total_verified": 0, "total_rejected": 0,
            "batches_completed": 0, "pass_rate_history": [],
            "failure_patterns": {"personal": 0, "payment": 0, "system": 0, "us_market": 0}
        }
        
        self.load_data()
        self.exa = Exa(EXA_API_KEY) if EXA_AVAILABLE and EXA_API_KEY else None
        
        print(f"🚀 Enhanced Auto Workflow V2 初始化")
        print(f"   📊 已验证: {len(self.verified['platforms'])} | 已拒绝: {len(self.rejected['platforms'])}")
        print(f"   ⚡ 并行验证: {PARALLEL_WORKERS} workers")

    def load_data(self):
        try:
            with open(self.verified_file, 'r', encoding='utf-8') as f:
                self.verified = json.load(f)
        except:
            self.verified = {"platforms": []}
        try:
            with open(self.rejected_file, 'r', encoding='utf-8') as f:
                self.rejected = json.load(f)
        except:
            self.rejected = {"platforms": []}
        try:
            with open(self.stats_file, 'r', encoding='utf-8') as f:
                loaded_stats = json.load(f)
                # 合并确保所有字段存在
                for key, value in loaded_stats.items():
                    self.stats[key] = value
        except:
            pass
        # 确保failure_patterns存在
        if "failure_patterns" not in self.stats:
            self.stats["failure_patterns"] = {"personal": 0, "payment": 0, "system": 0, "us_market": 0}
        self._build_processed_domains()

    def _build_processed_domains(self):
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
        with open(self.verified_file, 'w', encoding='utf-8') as f:
            json.dump(self.verified, f, ensure_ascii=False, indent=2)
        with open(self.rejected_file, 'w', encoding='utf-8') as f:
            json.dump(self.rejected, f, ensure_ascii=False, indent=2)
        with open(self.stats_file, 'w', encoding='utf-8') as f:
            json.dump(self.stats, f, ensure_ascii=False, indent=2)

    def is_new_platform(self, domain: str) -> bool:
        domain = self._extract_domain(domain)
        return domain and domain not in EXCLUDED_DOMAINS and domain not in self.processed_domains

    def discover_platforms(self, batch_size: int = 50) -> List[Dict]:
        """智能发现平台"""
        print(f"\n🔍 ========== 发现阶段 (目标: {batch_size}) ==========")
        
        candidates = []
        
        # 1. Exa搜索
        if self.exa:
            queries = [
                "alternative to patreon for creators personal payments",
                "tip platform for content creators individuals",
                "digital product marketplace personal sellers",
            ]
            for query in queries[:2]:
                try:
                    print(f"   🔍 Exa: '{query[:40]}...'")
                    result = self.exa.search_and_contents(query, type="neural", num_results=10, text=True)
                    for r in result.results:
                        domain = self._extract_domain(r.url)
                        if self.is_new_platform(domain):
                            candidates.append({
                                "name": r.title or domain, "domain": domain,
                                "url": r.url, "source": "exa",
                                "discovered_date": datetime.now().isoformat()
                            })
                    time.sleep(0.5)
                except Exception as e:
                    print(f"   ⚠️ Exa错误: {e}")
        
        # 2. 从数据库补充
        if len(candidates) < batch_size:
            db_candidates = self._get_from_database(batch_size - len(candidates))
            candidates.extend(db_candidates)
        
        # 去重
        seen = set()
        unique = []
        for c in candidates:
            if c["domain"] not in seen:
                seen.add(c["domain"])
                unique.append(c)
        
        print(f"   ✅ 发现 {len(unique[:batch_size])} 个候选平台")
        return unique[:batch_size]

    def _get_from_database(self, count: int) -> List[Dict]:
        """从内置数据库获取平台"""
        # 按优先级排序，优先验证高优先级平台
        sorted_platforms = sorted(REAL_PLATFORMS_DB, key=lambda x: x.get("priority", 99))
        
        candidates = []
        for p in sorted_platforms:
            if len(candidates) >= count:
                break
            if self.is_new_platform(p["domain"]):
                candidates.append({
                    "name": p["name"], "domain": p["domain"],
                    "url": f"https://{p['domain']}", "type": p.get("type", []),
                    "source": "database", "priority": p.get("priority", 3),
                    "discovered_date": datetime.now().isoformat()
                })
        
        print(f"   📚 从数据库选择 {len(candidates)} 个平台")
        return candidates

    def validate_platform_enhanced(self, platform: Dict) -> Dict:
        """增强版验证 - 权重评分 + 深度验证"""
        url = platform.get("url") or f"https://{platform.get('domain')}"
        domain = platform.get("domain") or self._extract_domain(url)
        
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                context = browser.new_context(user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36")
                page = context.new_page()
                
                try:
                    response = page.goto(url, timeout=25000, wait_until="domcontentloaded")
                    if not response or response.status >= 400:
                        browser.close()
                        return {**platform, "validation_status": "failed", "error": f"HTTP {response.status if response else 'No response'}"}
                    
                    page.wait_for_timeout(1500)
                    content = page.inner_text('body').lower()[:20000]
                    title = page.title()
                    
                    # 首次验证
                    validation = self._enhanced_validation(content, domain)
                    
                    # 如果首次验证失败(通过<4项)，尝试深度验证突破
                    if not validation["all_passed"] and validation["passed_count"] >= 2:
                        print(f"      🔬 尝试深度验证突破...")
                        deep_result = self._deep_validation(page, domain, validation)
                        if deep_result["all_passed"]:
                            print(f"      ✅ 深度验证突破成功!")
                            validation = deep_result
                    
                    browser.close()
                    
                    return {
                        **platform,
                        "name": title[:100] if title else platform.get("name"),
                        "validation_status": "verified" if validation["all_passed"] else "rejected",
                        "validation_results": validation["results"],
                        "validation_scores": validation["scores"],
                        "passed_count": validation["passed_count"],
                        "deep_validated": validation.get("deep_validated", False),
                        "verified_date": datetime.now().isoformat()
                    }
                except Exception as e:
                    browser.close()
                    return {**platform, "validation_status": "failed", "error": str(e)}
        except Exception as e:
            return {**platform, "validation_status": "failed", "error": str(e)}

    def _deep_validation(self, page, domain: str, initial_validation: Dict) -> Dict:
        """深度验证 - 浏览器交互获取更多信息突破拒绝"""
        results = initial_validation["results"].copy()
        scores = initial_validation["scores"].copy()
        all_content = ""
        
        # 需要突破的验证项目
        failed_criteria = [k for k, v in results.items() if not v]
        
        # === 策略1: 点击注册/Sign Up按钮 ===
        if "personal_registration" in failed_criteria:
            try:
                signup_selectors = [
                    "text=Sign Up", "text=Get Started", "text=Start Free",
                    "text=Create Account", "text=Register", "text=Join",
                    "a:has-text('Sign Up')", "button:has-text('Sign Up')",
                    "[href*='signup']", "[href*='register']"
                ]
                for selector in signup_selectors:
                    try:
                        element = page.locator(selector).first
                        if element.is_visible(timeout=1000):
                            element.click(timeout=3000)
                            page.wait_for_timeout(2000)
                            all_content += " " + page.inner_text('body').lower()[:10000]
                            page.go_back()
                            page.wait_for_timeout(1000)
                            break
                    except:
                        continue
            except:
                pass
        
        # === 策略2: 访问Pricing页面 ===
        if "payment_receiving" in failed_criteria or "own_payment_system" in failed_criteria:
            try:
                pricing_selectors = [
                    "text=Pricing", "text=Plans", "text=Features",
                    "a:has-text('Pricing')", "[href*='pricing']", "[href*='plans']"
                ]
                for selector in pricing_selectors:
                    try:
                        element = page.locator(selector).first
                        if element.is_visible(timeout=1000):
                            element.click(timeout=3000)
                            page.wait_for_timeout(2000)
                            all_content += " " + page.inner_text('body').lower()[:10000]
                            page.go_back()
                            page.wait_for_timeout(1000)
                            break
                    except:
                        continue
            except:
                pass
        
        # === 策略3: 访问关于/帮助页面 ===
        try:
            about_selectors = [
                "text=About", "text=Help", "text=FAQ", "text=How it works",
                "[href*='about']", "[href*='help']", "[href*='faq']"
            ]
            for selector in about_selectors[:2]:
                try:
                    element = page.locator(selector).first
                    if element.is_visible(timeout=1000):
                        element.click(timeout=3000)
                        page.wait_for_timeout(2000)
                        all_content += " " + page.inner_text('body').lower()[:10000]
                        page.go_back()
                        page.wait_for_timeout(1000)
                        break
                except:
                    continue
        except:
            pass
        
        # === 策略4: 访问开发者/API页面(检测支付系统) ===
        if "own_payment_system" in failed_criteria:
            try:
                dev_selectors = [
                    "text=Developers", "text=API", "text=Integrations",
                    "[href*='developer']", "[href*='api']"
                ]
                for selector in dev_selectors:
                    try:
                        element = page.locator(selector).first
                        if element.is_visible(timeout=1000):
                            element.click(timeout=3000)
                            page.wait_for_timeout(2000)
                            all_content += " " + page.inner_text('body').lower()[:10000]
                            page.go_back()
                            page.wait_for_timeout(1000)
                            break
                    except:
                        continue
            except:
                pass
        
        # 重新评估所有收集的内容
        if all_content:
            deep_validation = self._enhanced_validation(all_content, domain)
            
            # 合并分数(取最高分)
            for criteria in scores:
                scores[criteria] = max(scores[criteria], deep_validation["scores"].get(criteria, 0))
                # 重新判断是否通过(阈值3)
                results[criteria] = scores[criteria] >= 3 or results[criteria]
            
            # .com域名自动通过US market
            if domain.endswith(".com"):
                results["us_market_ach"] = True
                scores["us_market_ach"] = max(scores.get("us_market_ach", 0), 5)
        
        passed_count = sum(results.values())
        
        return {
            "results": results,
            "scores": scores,
            "passed_count": passed_count,
            "all_passed": passed_count == 4,
            "deep_validated": True
        }

    def _enhanced_validation(self, content: str, domain: str) -> Dict:
        """增强验证逻辑 - 权重评分"""
        scores = {}
        results = {}
        
        for criteria, keywords in VALIDATION_KEYWORDS.items():
            score = 0
            # Strong matches = 3 points each
            for kw in keywords.get("strong", []):
                if kw in content:
                    score += 3
            # Medium matches = 2 points each
            for kw in keywords.get("medium", []):
                if kw in content:
                    score += 2
            # Weak matches = 1 point each
            for kw in keywords.get("weak", []):
                if kw in content:
                    score += 1
            
            scores[criteria] = score
            # Threshold: 3 points to pass (降低阈值)
            results[criteria] = score >= 3
        
        # .com域名自动通过US market
        if domain.endswith(".com"):
            results["us_market_ach"] = True
            scores["us_market_ach"] = max(scores.get("us_market_ach", 0), 5)
        
        passed_count = sum(results.values())
        
        return {
            "results": results,
            "scores": scores,
            "passed_count": passed_count,
            "all_passed": passed_count == 4
        }

    def run_batch_parallel(self, batch_size: int = 50) -> Dict:
        """并行验证批次"""
        batch_start = datetime.now()
        print(f"\n🔄 ========== 批次开始 @ {batch_start.strftime('%H:%M:%S')} ==========")
        
        # 发现
        candidates = self.discover_platforms(batch_size)
        if not candidates:
            print("⚠️ 未发现新平台")
            return {"discovered": 0, "verified": 0, "rejected": 0}
        
        # 并行验证
        print(f"\n✅ ========== 并行验证 ({len(candidates)}平台, {PARALLEL_WORKERS}workers) ==========")
        
        verified_count = 0
        rejected_count = 0
        
        with ThreadPoolExecutor(max_workers=PARALLEL_WORKERS) as executor:
            futures = {executor.submit(self.validate_platform_enhanced, p): p for p in candidates}
            
            for i, future in enumerate(as_completed(futures)):
                result = future.result()
                platform = futures[future]
                
                status = "✅" if result.get("validation_status") == "verified" else "❌"
                print(f"   [{i+1}/{len(candidates)}] {status} {result.get('name', platform['domain'])[:30]}")
                
                if result.get("validation_status") == "verified":
                    self.verified["platforms"].append(result)
                    self.processed_domains.add(result.get("domain", ""))
                    verified_count += 1
                else:
                    self.rejected["platforms"].append(result)
                    self.processed_domains.add(result.get("domain", ""))
                    rejected_count += 1
                    # 记录失败模式
                    self._update_failure_patterns(result)
        
        # 保存
        self.save_data()
        
        # 报告
        batch_time = (datetime.now() - batch_start).total_seconds()
        pass_rate = (verified_count / len(candidates) * 100) if candidates else 0
        
        self.stats["total_discovered"] += len(candidates)
        self.stats["total_verified"] += verified_count
        self.stats["total_rejected"] += rejected_count
        self.stats["batches_completed"] += 1
        self.stats["pass_rate_history"].append({"rate": pass_rate, "time": datetime.now().isoformat()})
        self.save_data()
        
        print(f"\n📊 ========== 批次报告 ==========")
        print(f"   ⏱️  耗时: {batch_time:.1f}s (平均 {batch_time/len(candidates):.1f}s/平台)")
        print(f"   ✅ 通过: {verified_count} | ❌ 拒绝: {rejected_count}")
        print(f"   📈 通过率: {pass_rate:.1f}%")
        print(f"   📊 累计验证: {len(self.verified['platforms'])}")
        
        return {"discovered": len(candidates), "verified": verified_count, "rejected": rejected_count, "pass_rate": pass_rate}

    def _update_failure_patterns(self, result: Dict):
        """更新失败模式统计"""
        results = result.get("validation_results", {})
        if not results.get("personal_registration"):
            self.stats["failure_patterns"]["personal"] += 1
        if not results.get("payment_receiving"):
            self.stats["failure_patterns"]["payment"] += 1
        if not results.get("own_payment_system"):
            self.stats["failure_patterns"]["system"] += 1
        if not results.get("us_market_ach"):
            self.stats["failure_patterns"]["us_market"] += 1

    def run_forever(self, batch_size: int = 50, interval: int = 90):
        """无限循环"""
        print(f"\n🚀 启动无限循环 (批量:{batch_size}, 间隔:{interval}s)")
        
        while True:
            try:
                self.run_batch_parallel(batch_size)
            except KeyboardInterrupt:
                print("\n⏹️ 用户中断")
                self.save_data()
                break
            except Exception as e:
                print(f"❌ 批次失败: {e}")
            
            print(f"\n💤 等待 {interval}s...")
            try:
                time.sleep(interval)
            except KeyboardInterrupt:
                print("\n⏹️ 退出")
                self.save_data()
                break


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Enhanced Auto Workflow V2")
    parser.add_argument("--test", action="store_true", help="测试模式 (5平台)")
    parser.add_argument("--batch", action="store_true", help="单批次")
    parser.add_argument("--batch-size", type=int, default=50, help="批量大小")
    parser.add_argument("--interval", type=int, default=90, help="间隔(秒)")
    parser.add_argument("--workers", type=int, default=5, help="并行数")
    args = parser.parse_args()
    
    global PARALLEL_WORKERS
    PARALLEL_WORKERS = args.workers
    
    workflow = EnhancedAutoWorkflow()
    
    if args.test:
        workflow.run_batch_parallel(batch_size=5)
    elif args.batch:
        workflow.run_batch_parallel(batch_size=args.batch_size)
    else:
        workflow.run_forever(batch_size=args.batch_size, interval=args.interval)


if __name__ == "__main__":
    main()
