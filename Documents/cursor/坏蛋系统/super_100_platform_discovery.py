#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
超级100平台发现系统
专业解决HTTP 403错误，智能多策略验证，实现100个新平台发现目标
"""

import json
import random
import time
import requests
from datetime import datetime
from typing import Dict, List, Set, Tuple, Optional
from concurrent.futures import ThreadPoolExecutor, as_completed
import re
from urllib.parse import urljoin, urlparse
import os

class Super100PlatformDiscovery:
    """超级100平台发现系统"""

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        })

        # 扩展到150个平台数据库，覆盖更多细分领域
        self.platform_database = [
            # 创作者经济平台 (30个)
            {"name": "Substack", "domain": "substack.com", "category": "creator", "priority": 0.9},
            {"name": "Patreon", "domain": "patreon.com", "category": "creator", "priority": 0.9},
            {"name": "Buy Me a Coffee", "domain": "buymeacoffee.com", "category": "creator", "priority": 0.8},
            {"name": "Ko-fi", "domain": "ko-fi.com", "category": "creator", "priority": 0.8},
            {"name": "Memberful", "domain": "memberful.com", "category": "creator", "priority": 0.8},
            {"name": "Ghost", "domain": "ghost.org", "category": "creator", "priority": 0.8},
            {"name": "Beehiiv", "domain": "beehiiv.com", "category": "creator", "priority": 0.7},
            {"name": "ConvertKit", "domain": "convertkit.com", "category": "creator", "priority": 0.8},
            {"name": "AWeber", "domain": "aweber.com", "category": "creator", "priority": 0.7},
            {"name": "Mailchimp", "domain": "mailchimp.com", "category": "creator", "priority": 0.7},
            {"name": "Flodesk", "domain": "flodesk.com", "category": "creator", "priority": 0.6},
            {"name": "Kit", "domain": "kit.com", "category": "creator", "priority": 0.7},
            {"name": "Substack", "domain": "substack.com", "category": "creator", "priority": 0.9},
            {"name": "Revue", "domain": "revue.co", "category": "creator", "priority": 0.6},
            {"name": "Letterdrop", "domain": "letterdrop.com", "category": "creator", "priority": 0.6},
            {"name": "Beehiiv", "domain": "beehiiv.com", "category": "creator", "priority": 0.7},
            {"name": "Public", "domain": "public.com", "category": "creator", "priority": 0.6},
            {"name": "Every", "domain": "every.to", "category": "creator", "priority": 0.6},
            {"name": "The Tmpl", "domain": "thetmpl.com", "category": "creator", "priority": 0.5},
            {"name": "Creator Economy", "domain": "creatoreconomy.so", "category": "creator", "priority": 0.5},
            {"name": "Kajabi", "domain": "kajabi.com", "category": "creator", "priority": 0.9},
            {"name": "Podia", "domain": "podia.com", "category": "creator", "priority": 0.8},
            {"name": "Teachable", "domain": "teachable.com", "category": "creator", "priority": 0.9},
            {"name": "Thinkific", "domain": "thinkific.com", "category": "creator", "priority": 0.8},
            {"name": "LearnWorlds", "domain": "learnworlds.com", "category": "creator", "priority": 0.7},
            {"name": "Skillshare", "domain": "skillshare.com", "category": "creator", "priority": 0.8},
            {"name": "Udemy", "domain": "udemy.com", "category": "creator", "priority": 0.8},
            {"name": "Coursera", "domain": "coursera.org", "category": "creator", "priority": 0.7},
            {"name": "MasterClass", "domain": "masterclass.com", "category": "creator", "priority": 0.7},
            {"name": "Domestika", "domain": "domestika.org", "category": "creator", "priority": 0.6},

            # 市场place平台 (25个)
            {"name": "Etsy", "domain": "etsy.com", "category": "marketplace", "priority": 0.9},
            {"name": "Shopify", "domain": "shopify.com", "category": "marketplace", "priority": 0.9},
            {"name": "BigCommerce", "domain": "bigcommerce.com", "category": "marketplace", "priority": 0.8},
            {"name": "WooCommerce", "domain": "woocommerce.com", "category": "marketplace", "priority": 0.8},
            {"name": "Square", "domain": "squareup.com", "category": "marketplace", "priority": 0.9},
            {"name": "Wix", "domain": "wix.com", "category": "marketplace", "priority": 0.8},
            {"name": "Squarespace", "domain": "squarespace.com", "category": "marketplace", "priority": 0.8},
            {"name": "Webflow", "domain": "webflow.com", "category": "marketplace", "priority": 0.8},
            {"name": "Carrd", "domain": "carrd.co", "category": "marketplace", "priority": 0.6},
            {"name": "Gumroad", "domain": "gumroad.com", "category": "marketplace", "priority": 0.9},
            {"name": "Payhip", "domain": "payhip.com", "category": "marketplace", "priority": 0.7},
            {"name": "Sellfy", "domain": "sellfy.com", "category": "marketplace", "priority": 0.7},
            {"name": "Fetch", "domain": "fetchapp.com", "category": "marketplace", "priority": 0.5},
            {"name": "SendOwl", "domain": "sendowl.com", "category": "marketplace", "priority": 0.6},
            {"name": "DLGuard", "domain": "dlguard.com", "category": "marketplace", "priority": 0.5},
            {"name": "E-junkie", "domain": "e-junkie.com", "category": "marketplace", "priority": 0.6},
            {"name": "FastSpring", "domain": "fastspring.com", "category": "marketplace", "priority": 0.7},
            {"name": "Paddle", "domain": "paddle.com", "category": "marketplace", "priority": 0.8},
            {"name": "Lemon Squeezy", "domain": "lemonsqueezy.com", "category": "marketplace", "priority": 0.8},
            {"name": "SamCart", "domain": "samcart.com", "category": "marketplace", "priority": 0.7},
            {"name": "ClickBank", "domain": "clickbank.com", "category": "marketplace", "priority": 0.7},
            {"name": "JVZoo", "domain": "jvzoo.com", "category": "marketplace", "priority": 0.5},
            {"name": "WarriorPlus", "domain": "warriorplus.com", "category": "marketplace", "priority": 0.5},
            {"name": "ShareASale", "domain": "shareasale.com", "category": "marketplace", "priority": 0.6},
            {"name": "CJ Affiliate", "domain": "cj.com", "category": "marketplace", "priority": 0.7},

            # 自由职业者平台 (25个)
            {"name": "Upwork", "domain": "upwork.com", "category": "freelance", "priority": 0.9},
            {"name": "Fiverr", "domain": "fiverr.com", "category": "freelance", "priority": 0.9},
            {"name": "Freelancer.com", "domain": "freelancer.com", "category": "freelance", "priority": 0.8},
            {"name": "Toptal", "domain": "toptal.com", "category": "freelance", "priority": 0.8},
            {"name": "Guru.com", "domain": "guru.com", "category": "freelance", "priority": 0.7},
            {"name": "PeoplePerHour", "domain": "peopleperhour.com", "category": "freelance", "priority": 0.7},
            {"name": "99designs", "domain": "99designs.com", "category": "freelance", "priority": 0.8},
            {"name": "DesignCrowd", "domain": "designcrowd.com", "category": "freelance", "priority": 0.7},
            {"name": "Dribbble", "domain": "dribbble.com", "category": "freelance", "priority": 0.8},
            {"name": "Behance", "domain": "behance.net", "category": "freelance", "priority": 0.8},
            {"name": "Codeable", "domain": "codeable.io", "category": "freelance", "priority": 0.6},
            {"name": "Gun.io", "domain": "gun.io", "category": "freelance", "priority": 0.6},
            {"name": "Codementor", "domain": "codementor.io", "category": "freelance", "priority": 0.6},
            {"name": "Kolabtree", "domain": "kolabtree.com", "category": "freelance", "priority": 0.5},
            {"name": "Clarity", "domain": "clarity.fm", "category": "freelance", "priority": 0.6},
            {"name": "Catalant", "domain": "catalant.com", "category": "freelance", "priority": 0.5},
            {"name": "GLG", "domain": "glg.com", "category": "freelance", "priority": 0.5},
            {"name": "ThirdBridge", "domain": "thirdbridge.com", "category": "freelance", "priority": 0.5},
            {"name": "AlphaSights", "domain": "alphasights.com", "category": "freelance", "priority": 0.5},
            {"name": "Expert360", "domain": "expert360.com", "category": "freelance", "priority": 0.5},
            {"name": "Hive", "domain": "hive.com", "category": "freelance", "priority": 0.6},
            {"name": "Notion", "domain": "notion.so", "category": "freelance", "priority": 0.8},
            {"name": "Coda", "domain": "coda.io", "category": "freelance", "priority": 0.7},
            {"name": "Airtable", "domain": "airtable.com", "category": "freelance", "priority": 0.8},
            {"name": "Monday.com", "domain": "monday.com", "category": "freelance", "priority": 0.7},

            # SaaS和软件平台 (25个)
            {"name": "Stripe", "domain": "stripe.com", "category": "software", "priority": 0.9},
            {"name": "PayPal", "domain": "paypal.com", "category": "software", "priority": 0.9},
            {"name": "Square", "domain": "square.com", "category": "software", "priority": 0.9},
            {"name": "Adyen", "domain": "adyen.com", "category": "software", "priority": 0.8},
            {"name": "Braintree", "domain": "braintreepayments.com", "category": "software", "priority": 0.8},
            {"name": "Authorize.Net", "domain": "authorize.net", "category": "software", "priority": 0.8},
            {"name": "2Checkout", "domain": "2checkout.com", "category": "software", "priority": 0.7},
            {"name": "Payoneer", "domain": "payoneer.com", "category": "software", "priority": 0.8},
            {"name": "TransferWise", "domain": "wise.com", "category": "software", "priority": 0.8},
            {"name": "Revolut", "domain": "revolut.com", "category": "software", "priority": 0.7},
            {"name": "Klarna", "domain": "klarna.com", "category": "software", "priority": 0.8},
            {"name": "Afterpay", "domain": "afterpay.com", "category": "software", "priority": 0.7},
            {"name": "Affirm", "domain": "affirm.com", "category": "software", "priority": 0.7},
            {"name": "Sezzle", "domain": "sezzle.com", "category": "software", "priority": 0.6},
            {"name": "Quadpay", "domain": "quadpay.com", "category": "software", "priority": 0.6},
            {"name": "PayPal Credit", "domain": "paypal.com", "category": "software", "priority": 0.8},
            {"name": "Venmo", "domain": "venmo.com", "category": "software", "priority": 0.7},
            {"name": "Cash App", "domain": "cash.app", "category": "software", "priority": 0.7},
            {"name": "Zelle", "domain": "zellepay.com", "category": "software", "priority": 0.7},
            {"name": "Popmoney", "domain": "popmoney.com", "category": "software", "priority": 0.5},
            {"name": "ClearXchange", "domain": "clearxchange.com", "category": "software", "priority": 0.5},
            {"name": "Dwolla", "domain": "dwolla.com", "category": "software", "priority": 0.6},
            {"name": "MangoPay", "domain": "mangopay.com", "category": "software", "priority": 0.6},
            {"name": "Mollie", "domain": "mollie.com", "category": "software", "priority": 0.7},
            {"name": "iZettle", "domain": "izettle.com", "category": "software", "priority": 0.6},

            # 社区和众包平台 (25个)
            {"name": "GoFundMe", "domain": "gofundme.com", "category": "community", "priority": 0.8},
            {"name": "Kickstarter", "domain": "kickstarter.com", "category": "community", "priority": 0.9},
            {"name": "Indiegogo", "domain": "indiegogo.com", "category": "community", "priority": 0.8},
            {"name": "Patreon", "domain": "patreon.com", "category": "community", "priority": 0.9},
            {"name": "GoFundMe", "domain": "gofundme.com", "category": "community", "priority": 0.8},
            {"name": "JustGiving", "domain": "justgiving.com", "category": "community", "priority": 0.7},
            {"name": "Fundly", "domain": "fundly.com", "category": "community", "priority": 0.6},
            {"name": "FundRazr", "domain": "fundrazr.com", "category": "community", "priority": 0.6},
            {"name": "YouCaring", "domain": "youcaring.com", "category": "community", "priority": 0.6},
            {"name": "CrowdRise", "domain": "crowdrise.com", "category": "community", "priority": 0.6},
            {"name": "Experiment", "domain": "experiment.com", "category": "community", "priority": 0.5},
            {"name": "Crowdfunder", "domain": "crowdfunder.com", "category": "community", "priority": 0.6},
            {"name": "SeedInvest", "domain": "seedinvest.com", "category": "community", "priority": 0.6},
            {"name": "StartEngine", "domain": "startengine.com", "category": "community", "priority": 0.6},
            {"name": "Republic", "domain": "republic.co", "category": "community", "priority": 0.7},
            {"name": "WeFunder", "domain": "wefunder.com", "category": "community", "priority": 0.6},
            {"name": "AngelList", "domain": "angel.co", "category": "community", "priority": 0.8},
            {"name": "Crunchbase", "domain": "crunchbase.com", "category": "community", "priority": 0.7},
            {"name": "Product Hunt", "domain": "producthunt.com", "category": "community", "priority": 0.8},
            {"name": "Hacker News", "domain": "news.ycombinator.com", "category": "community", "priority": 0.7},
            {"name": "Reddit", "domain": "reddit.com", "category": "community", "priority": 0.8},
            {"name": "Discord", "domain": "discord.com", "category": "community", "priority": 0.8},
            {"name": "Slack", "domain": "slack.com", "category": "community", "priority": 0.8},
            {"name": "Telegram", "domain": "telegram.org", "category": "community", "priority": 0.7},
            {"name": "WhatsApp", "domain": "whatsapp.com", "category": "community", "priority": 0.7},

            # 小企业和新兴平台 (20个)
            {"name": "HoneyBook", "domain": "honeybook.com", "category": "business", "priority": 0.8},
            {"name": "Dubsado", "domain": "dubsado.com", "category": "business", "priority": 0.7},
            {"name": "17hats", "domain": "17hats.com", "category": "business", "priority": 0.6},
            {"name": "FreshBooks", "domain": "freshbooks.com", "category": "business", "priority": 0.8},
            {"name": "QuickBooks", "domain": "quickbooks.intuit.com", "category": "business", "priority": 0.8},
            {"name": "Xero", "domain": "xero.com", "category": "business", "priority": 0.8},
            {"name": "Wave", "domain": "waveapps.com", "category": "business", "priority": 0.7},
            {"name": "Invoice2go", "domain": "invoice2go.com", "category": "business", "priority": 0.6},
            {"name": "Zoho Invoice", "domain": "zoho.com", "category": "business", "priority": 0.7},
            {"name": "Square Invoices", "domain": "square.com", "category": "business", "priority": 0.8},
            {"name": "PayPal Invoices", "domain": "paypal.com", "category": "business", "priority": 0.8},
            {"name": "Stripe Invoicing", "domain": "stripe.com", "category": "business", "priority": 0.9},
            {"name": "Melio", "domain": "melio.com", "category": "business", "priority": 0.8},
            {"name": "Bill.com", "domain": "bill.com", "category": "business", "priority": 0.8},
            {"name": "Tipalti", "domain": "tipalti.com", "category": "business", "priority": 0.8},
            {"name": "Payoneer", "domain": "payoneer.com", "category": "business", "priority": 0.8},
            {"name": "TransferWise", "domain": "wise.com", "category": "business", "priority": 0.8},
            {"name": "Revolut", "domain": "revolut.com", "category": "business", "priority": 0.7},
            {"name": "N26", "domain": "n26.com", "category": "business", "priority": 0.6},
            {"name": "Monzo", "domain": "monzo.com", "category": "business", "priority": 0.6},
        ]

        # 支付处理器黑名单 (82个域名)
        self.payment_processor_blacklist = {
            'stripe.com', 'paypal.com', 'square.com', 'adyen.com', 'braintreepayments.com',
            'authorize.net', '2checkout.com', 'payoneer.com', 'wise.com', 'revolut.com',
            'klarna.com', 'afterpay.com', 'affirm.com', 'sezzle.com', 'quadpay.com',
            'venmo.com', 'cash.app', 'zellepay.com', 'popmoney.com', 'clearxchange.com',
            'dwolla.com', 'mangopay.com', 'mollie.com', 'izettle.com', 'gopay.com',
            'xendit.com', 'midtrans.com', 'omise.co', 'doku.com', 'payu.com',
            'rave.flutterwave.com', 'paystack.co', 'flutterwave.com', 'interswitch.co',
            'paytm.com', 'phonepe.com', 'googlepay.com', 'applepay.com', 'samsungpay.com',
            'alipay.com', 'wechat.com', 'qq.com', 'baidu.com', 'tencent.com',
            'jd.com', 'alibaba.com', 'taobao.com', 'tmall.com', 'pinduoduo.com',
            'meituan.com', 'didi.com', 'didiglobal.com', 'uber.com', 'lyft.com',
            'grab.com', 'gojek.com', 'se集团.com', 'tokopedia.com', 'bukalapak.com',
            'shopee.com', 'lazada.com', 'zalora.com', 'jumia.com', 'konga.com',
            'jiji.ng', 'olx.com', 'jumia.co.ke', 'kilimall.co.ke', 'copia.co.ke',
            'takealot.com', 'loot.co.za', 'game.co.za', 'makro.co.za', 'picknpay.co.za',
            'shoprite.co.za', 'checkers.co.za', 'woolworths.co.za', 'mrprice.co.za',
            'jet.co.za', 'edgars.co.za', 'foschini.co.za', 'markham.co.za',
            'truworths.co.za', 'identity.co.za', 'ackermans.co.za', 'pep.co.za',
            'spar.co.za', 'shoprite.co.za', 'checkers.co.za', 'woolworths.co.za'
        }

        # 去重缓存
        self.verified_cache = set()
        self.discovered_cache = set()
        self.failed_cache = set()

        # 验证结果
        self.results = []

        # 加载现有缓存
        self.load_cache()

    def load_cache(self):
        """加载现有缓存数据"""
        cache_files = [
            # 已删除amplifier_ace框架相关缓存文件
        ]

        for file in cache_files:
            if os.path.exists(file):
                try:
                    with open(file, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        for result in data.get('results', []):
                            domain = result.get('domain', '')
                            if result.get('verified', False):
                                self.verified_cache.add(domain)
                            else:
                                self.failed_cache.add(domain)
                            self.discovered_cache.add(domain)
                except Exception as e:
                    print(f"  ⚠️ 加载缓存文件失败 {file}: {e}")

        print(f"  📚 加载验证缓存: {len(self.verified_cache)} 个已验证平台")

    def smart_platform_selection(self, target_count: int = 999) -> List[Dict]:
        """智能平台选择策略"""
        # 按优先级排序
        sorted_platforms = sorted(self.platform_database, key=lambda x: x['priority'], reverse=True)

        selected = []
        used_domains = set()

        # 多轮选择策略
        # 第一轮：高优先级平台 (priority >= 0.8)
        for platform in sorted_platforms:
            if platform['priority'] >= 0.8 and len(selected) < target_count * 0.4:
                domain = platform['domain']
                if domain not in used_domains and domain not in self.verified_cache:
                    selected.append(platform)
                    used_domains.add(domain)

        # 第二轮：中优先级平台 (0.6 <= priority < 0.8)
        for platform in sorted_platforms:
            if 0.6 <= platform['priority'] < 0.8 and len(selected) < target_count * 0.7:
                domain = platform['domain']
                if domain not in used_domains and domain not in self.verified_cache:
                    selected.append(platform)
                    used_domains.add(domain)

        # 第三轮：补足到目标数量
        for platform in sorted_platforms:
            if len(selected) < target_count:
                domain = platform['domain']
                if domain not in used_domains and domain not in self.verified_cache:
                    selected.append(platform)
                    used_domains.add(domain)

        # 如果还不够，随机添加
        remaining = [p for p in sorted_platforms if p['domain'] not in used_domains and p['domain'] not in self.verified_cache]
        while len(selected) < target_count and remaining:
            platform = random.choice(remaining)
            selected.append(platform)
            remaining.remove(platform)

        return selected[:target_count]

    def smart_request(self, url: str, max_retries: int = 3) -> Tuple[bool, Optional[str]]:
        """智能HTTP请求，避免403错误"""

        # 多种User-Agent轮换
        user_agents = [
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ]

        # 多种请求策略
        strategies = [
            # 策略1：标准请求
            {'headers': {}, 'timeout': 10},
            # 策略2：带Referer
            {'headers': {'Referer': 'https://www.google.com/'}, 'timeout': 15},
            # 策略3：带更多浏览器特征
            {'headers': {
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }, 'timeout': 20},
            # 策略4：模拟移动端
            {'headers': {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
            }, 'timeout': 15}
        ]

        for attempt in range(max_retries):
            for strategy in strategies:
                try:
                    # 随机选择User-Agent
                    headers = self.session.headers.copy()
                    headers.update(strategy['headers'])
                    headers['User-Agent'] = random.choice(user_agents)

                    # 发送请求
                    response = self.session.get(
                        url,
                        headers=headers,
                        timeout=strategy['timeout'],
                        allow_redirects=True
                    )

                    # 检查响应状态
                    if response.status_code == 200:
                        return True, response.text
                    elif response.status_code == 403:
                        print(f"    ⚠️ 遇到403错误，尝试下一策略...")
                        continue
                    elif response.status_code == 429:
                        print(f"    ⏱️ 遇到429错误，等待后重试...")
                        time.sleep(random.uniform(2, 5))
                        continue
                    else:
                        return False, f"HTTP {response.status_code}"

                except requests.exceptions.Timeout:
                    print(f"    ⏱️ 请求超时，尝试下一策略...")
                    continue
                except requests.exceptions.ConnectionError:
                    print(f"    🔌 连接错误，尝试下一策略...")
                    continue
                except Exception as e:
                    print(f"    ❌ 请求异常: {e}")
                    continue

            # 每次重试之间等待
            if attempt < max_retries - 1:
                wait_time = random.uniform(1, 3)
                print(f"    ⏳ 等待 {wait_time:.1f} 秒后重试...")
                time.sleep(wait_time)

        return False, "Max retries exceeded"

    def validate_platform_intelligent(self, platform: Dict) -> Dict:
        """智能平台验证"""
        domain = platform['domain']

        # 检查缓存
        if domain in self.verified_cache:
            return {
                'domain': domain,
                'name': platform['name'],
                'category': platform['category'],
                'verified': True,
                'confidence': 1.0,
                'source': 'cache_verified',
                'validation_criteria': {
                    'us_market': True,
                    'self_register': True,
                    'third_party_payment': True,
                    'embedded_payment': True
                },
                'passed_count': 4,
                'analysis_notes': "缓存验证通过"
            }

        if domain in self.failed_cache:
            return {
                'domain': domain,
                'name': platform['name'],
                'category': platform['category'],
                'verified': False,
                'confidence': 0.0,
                'source': 'cache_failed',
                'validation_criteria': {
                    'us_market': False,
                    'self_register': False,
                    'third_party_payment': False,
                    'embedded_payment': False
                },
                'passed_count': 0,
                'analysis_notes': "缓存验证失败"
            }

        # 开始智能验证
        print(f"  🔍 智能验证平台: {domain}")

        result = {
            'domain': domain,
            'name': platform['name'],
            'category': platform['category'],
            'priority': platform['priority'],
            'source': 'intelligent_validation',
            'validation_criteria': {
                'us_market': False,
                'self_register': False,
                'third_party_payment': False,
                'embedded_payment': False
            },
            'passed_count': 0,
            'evidence': [],
            'analysis_notes': []
        }

        # 尝试多种URL访问策略
        urls_to_try = [
            f"https://{domain}",
            f"https://www.{domain}",
            f"https://{domain}/pricing",
            f"https://{domain}/signup",
            f"https://{domain}/register",
            f"https://{domain}/sell",
            f"https://{domain}/creators",
            f"https://{domain}/merchants"
        ]

        success = False
        content = None

        for url in urls_to_try:
            success, content = self.smart_request(url)
            if success:
                result['evidence'].append(f"成功访问: {url}")
                break
            else:
                result['analysis_notes'].append(f"访问失败: {url} ({content})")

        if not success or not content:
            result['verified'] = False
            result['confidence'] = 0.0
            result['analysis_notes'].append("所有URL访问失败")
            self.failed_cache.add(domain)
            return result

        # 内容分析
        content_lower = content.lower()

        # 验证1：美国市场服务
        us_market_indicators = [
            'usd', 'dollar', 'United States', 'USA', 'US only', 'US-based',
            '$', 'ACH', 'direct deposit', 'bank transfer', 'wire transfer'
        ]

        us_market_score = 0
        for indicator in us_market_indicators:
            if indicator.lower() in content_lower:
                us_market_score += 1
                result['evidence'].append(f"发现美国市场指标: {indicator}")

        result['validation_criteria']['us_market'] = us_market_score >= 2
        if result['validation_criteria']['us_market']:
            result['passed_count'] += 1
            result['analysis_notes'].append(f"美国市场验证通过 ({us_market_score} 个指标)")

        # 验证2：自注册功能
        self_register_indicators = [
            'sign up', 'signup', 'register', 'get started', 'create account',
            'join', 'start selling', 'become a creator', 'start earning',
            'merchant signup', 'seller registration', 'creator signup'
        ]

        self_register_score = 0
        for indicator in self_register_indicators:
            if indicator.lower() in content_lower:
                self_register_score += 1
                result['evidence'].append(f"发现自注册指标: {indicator}")

        result['validation_criteria']['self_register'] = self_register_score >= 2
        if result['validation_criteria']['self_register']:
            result['passed_count'] += 1
            result['analysis_notes'].append(f"自注册功能验证通过 ({self_register_score} 个指标)")

        # 验证3：第三方收款
        third_party_indicators = [
            'accept payments', 'receive payments', 'get paid', 'sell online',
            'merchant account', 'seller protection', 'buyer protection',
            'marketplace', 'platform', 'commission', 'fees', 'pricing'
        ]

        third_party_score = 0
        for indicator in third_party_indicators:
            if indicator.lower() in content_lower:
                third_party_score += 1
                result['evidence'].append(f"发现第三方收款指标: {indicator}")

        result['validation_criteria']['third_party_payment'] = third_party_score >= 2
        if result['validation_criteria']['third_party_payment']:
            result['passed_count'] += 1
            result['analysis_notes'].append(f"第三方收款验证通过 ({third_party_score} 个指标)")

        # 验证4：嵌入式支付
        embedded_payment_indicators = [
            'checkout', 'payment gateway', 'stripe', 'paypal', 'apple pay',
            'google pay', 'credit card', 'debit card', 'bank account',
            'instant payment', 'one-click payment', 'mobile payment'
        ]

        embedded_payment_score = 0
        for indicator in embedded_payment_indicators:
            if indicator.lower() in content_lower:
                embedded_payment_score += 1
                result['evidence'].append(f"发现嵌入式支付指标: {indicator}")

        result['validation_criteria']['embedded_payment'] = embedded_payment_score >= 2
        if result['validation_criteria']['embedded_payment']:
            result['passed_count'] += 1
            result['analysis_notes'].append(f"嵌入式支付验证通过 ({embedded_payment_score} 个指标)")

        # 计算置信度
        result['confidence'] = result['passed_count'] / 4.0
        result['verified'] = result['passed_count'] >= 3

        # 缓存结果
        if result['verified']:
            self.verified_cache.add(domain)
            result['analysis_notes'].append("✅ 验证通过，已加入验证缓存")
        else:
            self.failed_cache.add(domain)
            result['analysis_notes'].append("❌ 验证失败，已加入失败缓存")

        return result

    def run_discovery(self, target_count: int = 999) -> Dict:
        """运行超级平台发现"""
        print(f"🚀 启动超级{target_count}平台发现系统")
        print("=" * 60)

        # 智能选择平台
        selected_platforms = self.smart_platform_selection(target_count)
        print(f"🎯 智能选择了 {len(selected_platforms)} 个候选平台")

        # 并行验证
        verified_platforms = []
        failed_platforms = []

        with ThreadPoolExecutor(max_workers=5) as executor:
            # 提交验证任务
            future_to_platform = {
                executor.submit(self.validate_platform_intelligent, platform): platform
                for platform in selected_platforms
            }

            # 收集结果
            for i, future in enumerate(as_completed(future_to_platform), 1):
                platform = future_to_platform[future]
                try:
                    result = future.result()
                    print(f"  [{i}/{len(selected_platforms)}] 验证完成: {platform['domain']} - {'✅' if result['verified'] else '❌'} ({result['confidence']:.2f})")

                    if result['verified']:
                        verified_platforms.append(result)
                    else:
                        failed_platforms.append(result)

                    self.results.append(result)

                except Exception as e:
                    print(f"  ❌ 验证异常: {platform['domain']} - {e}")
                    failed_platforms.append({
                        'domain': platform['domain'],
                        'name': platform['name'],
                        'category': platform['category'],
                        'verified': False,
                        'confidence': 0.0,
                        'error': str(e)
                    })

                # 进度显示
                if i % 10 == 0:
                    verified_count = len(verified_platforms)
                    success_rate = verified_count / i * 100
                    print(f"  📊 进度更新: {i}/{len(selected_platforms)} 已验证, 成功率: {success_rate:.1f}%")

        # 生成报告
        total_verified = len(verified_platforms)
        total_failed = len(failed_platforms)
        success_rate = total_verified / len(selected_platforms) * 100 if selected_platforms else 0

        report = {
            'metadata': {
                'version': 'Super100-Discovery-v1.0',
                'timestamp': datetime.now().strftime('%Y%m%d_%H%M%S'),
                'target_count': target_count,
                'actual_count': len(selected_platforms),
                'performance_metrics': {
                    'total_platforms_tested': len(selected_platforms),
                    'verified_platforms': total_verified,
                    'failed_platforms': total_failed,
                    'success_rate': success_rate / 100,
                    'cache_hits': len(self.verified_cache),
                    'intelligent_validation_used': True
                }
            },
            'summary': {
                'total_verified': total_verified,
                'total_failed': total_failed,
                'success_rate': f"{success_rate:.1f}%",
                'avg_confidence': sum(r['confidence'] for r in self.results) / len(self.results) if self.results else 0,
                'categories_discovered': list(set(r['category'] for r in verified_platforms)),
                'high_confidence_platforms': len([r for r in verified_platforms if r['confidence'] >= 0.8])
            },
            'results': self.results
        }

        # 保存结果
        filename = f"super_100_discovery_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)

        # 显示最终报告
        print("\n" + "=" * 60)
        print("🎉 超级100平台发现系统 - 最终报告")
        print("=" * 60)
        print(f"📊 验证统计:")
        print(f"  • 目标平台数: {target_count}")
        print(f"  • 实际测试数: {len(selected_platforms)}")
        print(f"  • 验证通过数: {total_verified}")
        print(f"  • 验证失败数: {total_failed}")
        print(f"  • 成功率: {success_rate:.1f}%")
        print(f"  • 平均置信度: {report['summary']['avg_confidence']:.2f}")
        print(f"  • 高置信度平台: {report['summary']['high_confidence_platforms']}")
        print(f"  • 发现类别: {', '.join(report['summary']['categories_discovered'])}")
        print(f"💾 结果已保存: {filename}")

        # 显示验证通过的平台
        if verified_platforms:
            print(f"\n✅ 验证通过的平台 ({len(verified_platforms)} 个):")
            for platform in sorted(verified_platforms, key=lambda x: x['confidence'], reverse=True):
                print(f"  • {platform['name']} ({platform['domain']}) - 置信度: {platform['confidence']:.2f} - 类别: {platform['category']}")

        return report

# 主程序
if __name__ == "__main__":
    discovery = Super100PlatformDiscovery()
    report = discovery.run_discovery(100)

    print(f"\n🔥 超级100平台发现任务完成！")
    print(f"🎯 成功发现 {report['summary']['total_verified']} 个新平台！")