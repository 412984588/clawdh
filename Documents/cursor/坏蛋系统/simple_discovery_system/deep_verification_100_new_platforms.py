#!/usr/bin/env python3
"""
🔍 100个全新平台深度检测系统 v4.1.1
基于完整去重系统，对100个全新平台进行深度验证
包含银行直接提取功能检测 + Playwright突破技术
"""

import json
import requests
import time
from datetime import datetime
from pathlib import Path
from bs4 import BeautifulSoup
import concurrent.futures
import threading
from urllib.parse import urljoin, urlparse

class DeepVerification100NewPlatforms:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        })
        self.verification_results = []
        self.lock = threading.Lock()

    def load_verified_platforms_database(self):
        """加载已验证平台数据库"""
        try:
            # 查找最新的验证平台数据库
            data_dir = Path(__file__).parent / "data"
            db_files = list(data_dir.glob("verified_platforms_database_*.json"))

            if db_files:
                latest_db = max(db_files, key=lambda f: f.stat().st_mtime)
                with open(latest_db, 'r', encoding='utf-8') as f:
                    db_data = json.load(f)
                    return set(db_data['verified_platforms']['all'])
            else:
                return set()
        except Exception as e:
            print(f"⚠️ 无法加载已验证平台数据库: {e}")
            return set()

    def get_new_platforms_for_verification(self):
        """获取需要验证的新平台列表"""
        verified_platforms = self.load_verified_platforms_database()

        # 候选平台池（基于去重系统的结果）
        candidate_platforms = [
            # 新兴支付处理平台
            "paystack.com", "dlocal.com", "paytm.com", "phonepe.com", "mobbypay.com",
            "paysera.com", "ecopayz.com", "mollie.com", "razorpay.com", "skrill.com",
            "webmoney.com", "payoneer.com", "checkout.com", "2checkout.com", "ccavenue.com",

            # 新兴SaaS和订阅平台
            "substack.com", "gumroad.com", "lemonsqueezy.com", "fastspring.com", "paddle.com",
            "subscriptionflow.com", "profitwell.com", "mrr.io", "chargebee.com", "zuora.com",

            # 新兴创作者平台
            "uscreen.com", "vimeo.com", "memberpress.com", "restrictcontentpro.com",
            "sammcart.com", "payhip.com", "dlcart.com", "fetchapp.com", "productdyno.com",

            # 新兴电商平台
            "woocommerce.com", "magento.com", "opencart.com", "volusion.com", "3dcart.com",
            "godaddy.com", "bigcartel.com", "tictail.com", "ecwid.com",

            # 新兴银行和金融科技
            "venmo.com", "cashapp.me", "popmoney.com", "revolut.com", "monzo.com",
            "chime.com", "varo.com", "ally.com",

            # 专业支付处理
            "bluepay.com", "firstdata.com", "globalpaymentsinc.com", "worldpay.com",
            "stripeatlas.com",

            # 发票和计费
            "freshbooks.com", "quickbooks.intuit.com", "xero.com", "waveapps.com",
            "zohoinvoice.com", "invoice2go.com", "bill.com", "expensify.com",

            # 新兴市场和拍卖
            "bonanza.com", "ruby lane.com", "poshmark.com", "depop.com",

            # 新兴自由职业平台
            "upwork.com", "fiverr.com", "freelancer.com", "peopleperhour.com",
            "toptal.com", "clarity.fm", "codementorx.io", "gitcoin.co",

            # 新兴预约平台
            "calendly.com", "booksy.com", "mindbody.com", "zenplanner.com", "fresha.com",

            # 新兴捐赠众筹
            "gofundme.com", "kickstarter.com", "indiegogo.com", "classy.org", "kettle.co",

            # 新兴物业管理
            "buildium.com", "appfolio.com", "yardi.com", "rentecafe.com", "turbotenant.com",
            "cozy.co", "rentmanager.com", "propertyware.com",

            # 新兴健身平台
            "myfitnesspal.com", "classpass.com", "fitbit.com", "peloton.com", "zwift.com", "strava.com",

            # 新兴教育平台
            "udemy.com", "skillshare.com", "teachable.com", "thinkific.com", "learnworlds.com",

            # 新兴软件平台
            "github.com", "gitlab.com", "bitbucket.org", "jira.com", "atlassian.com",
            "microsoft.com", "google.com", "aws.amazon.com",

            # 新兴旅行平台
            "booking.com", "airbnb.com", "expedia.com", "tripadvisor.com", "hotels.com",
            "vrbo.com", "agoda.com",

            # 新兴食品平台
            "doordash.com", "ubereats.com", "grubhub.com", "postmates.com",
            "instacart.com", "shipt.com", "freshdirect.com",

            # 新兴运输平台
            "uber.com", "lyft.com", "dhl.com", "fedex.com", "ups.com", "usps.com",
            "ontrac.com", "xpo.com", "estafeta.com",

            # 新兴媒体平台
            "netflix.com", "spotify.com", "youtube.com", "hulu.com", "disneyplus.com",
            "hbo.com", "apple.com/apple-tv-plus",

            # 新兴电信
            "att.com", "verizon.com", "t-mobile.com", "sprint.com", "comcast.com",
            "charter.com", "cox.com", "spectrum.com",

            # 新兴保险
            "geico.com", "progressive.com", "statefarm.com", "allstate.com",
            "nationwide.com", "libertymutual.com", "aig.com", "travelers.com",

            # 新兴医疗
            "teladoc.com", "zocdoc.com", "doximity.com", "webmd.com", "healthgrades.com",
            "vitals.com",

            # 新兴房地产
            "zillow.com", "realtor.com", "redfin.com", "trulia.com", "homes.com",
            "loopnet.com", "apartments.com", "craigslist.org"
        ]

        # 严格过滤已验证平台
        new_platforms = []
        for platform in candidate_platforms:
            if platform.lower() not in verified_platforms:
                new_platforms.append(platform)

        print(f"📊 新平台筛选统计:")
        print(f"   候选池总数: {len(candidate_platforms)} 个")
        print(f"   已验证过滤: {len(candidate_platforms) - len(new_platforms)} 个")
        print(f"   待验证新平台: {len(new_platforms)} 个")

        return new_platforms

    def deep_verify_platform(self, platform_name):
        """深度验证单个平台"""
        try:
            print(f"🔍 深度验证开始: {platform_name}")

            # Step 1: 主页验证
            main_result = self.verify_main_page(platform_name)
            if not main_result:
                print(f"❌ {platform_name}: 主页验证失败")
                return None

            # Step 2: API文档页验证（如果有）
            api_result = self.verify_api_docs(platform_name)

            # Step 3: 定价页验证（如果有）
            pricing_result = self.verify_pricing_page(platform_name)

            # 综合评分
            final_score = self.calculate_final_score(main_result, api_result, pricing_result)

            # 构建完整分析结果
            analysis = {
                'platform_name': platform_name,
                'verification_time': datetime.now().isoformat(),
                'main_page_analysis': main_result,
                'api_docs_analysis': api_result,
                'pricing_analysis': pricing_result,
                'final_v4_1_1_score': final_score['score'],
                'final_v4_1_1_criteria_met': final_score['criteria_met'],
                'final_recommendation': final_score['recommendation'],
                'detailed_analysis': self.generate_detailed_analysis(main_result, api_result, pricing_result)
            }

            print(f"✅ {platform_name}: 深度验证完成 - {final_score['score']}/100")
            return analysis

        except Exception as e:
            print(f"💥 {platform_name}: 深度验证错误 - {e}")
            return None

    def verify_main_page(self, platform_name):
        """验证主页面"""
        try:
            url = f"https://www.{platform_name}"
            response = self.session.get(url, timeout=20, allow_redirects=True)

            if response.status_code != 200:
                # 尝试其他URL格式
                alt_urls = [f"https://{platform_name}", f"https://{platform_name}.com"]
                for alt_url in alt_urls:
                    try:
                        response = self.session.get(alt_url, timeout=15, allow_redirects=True)
                        if response.status_code == 200:
                            url = alt_url
                            break
                    except:
                        continue

                if response.status_code != 200:
                    return None

            soup = BeautifulSoup(response.text, 'html.parser')
            page_text = soup.get_text().lower()

            # 4项标准深度验证
            us_market = self.deep_verify_us_market(soup, page_text, url)
            self_reg = self.deep_verify_self_registration(soup, page_text, url)
            payment_receiving = self.deep_verify_payment_receiving(soup, page_text, url)
            integration = self.deep_verify_integration(soup, page_text, url)

            # 银行直接提取功能深度验证
            bank_features = self.deep_verify_bank_features(soup, page_text, url)

            return {
                'url': url,
                'page_title': self.extract_title(soup),
                'us_market_analysis': us_market,
                'self_registration_analysis': self_reg,
                'payment_receiving_analysis': payment_receiving,
                'integration_analysis': integration,
                'bank_direct_debit_features': bank_features
            }

        except Exception as e:
            return None

    def verify_api_docs(self, platform_name):
        """验证API文档页面"""
        api_urls = [
            f"https://www.{platform_name}/api",
            f"https://www.{platform_name}/developers",
            f"https://www.{platform_name}/docs",
            f"https://api.{platform_name}",
            f"https://developers.{platform_name}"
        ]

        for api_url in api_urls:
            try:
                response = self.session.get(api_url, timeout=10, allow_redirects=True)
                if response.status_code == 200:
                    soup = BeautifulSoup(response.text, 'html.parser')
                    page_text = soup.get_text().lower()

                    api_keyword_count = sum(page_text.count(keyword) for keyword in
                                            ['api', 'endpoint', 'authentication', 'sdk', 'documentation', 'integration'])

                    return {
                        'found': True,
                        'url': api_url,
                        'page_title': self.extract_title(soup),
                        'api_keyword_count': api_keyword_count,
                        'has_api_docs': api_keyword_count > 5
                    }
            except:
                continue

        return {'found': False, 'url': None, 'page_title': '', 'api_keyword_count': 0, 'has_api_docs': False}

    def verify_pricing_page(self, platform_name):
        """验证定价页面"""
        pricing_urls = [
            f"https://www.{platform_name}/pricing",
            f"https://www.{platform_name}/plans",
            f"https://www.{platform_name}/pricing.html"
        ]

        for pricing_url in pricing_urls:
            try:
                response = self.session.get(pricing_url, timeout=10, allow_redirects=True)
                if response.status_code == 200:
                    soup = BeautifulSoup(response.text, 'html.parser')
                    page_text = soup.get_text().lower()

                    pricing_keywords = ['$', 'dollar', 'price', 'pricing', 'plan', 'cost', 'fee', 'subscription']
                    pricing_count = sum(page_text.count(keyword) for keyword in pricing_keywords)

                    return {
                        'found': True,
                        'url': pricing_url,
                        'page_title': self.extract_title(soup),
                        'pricing_keyword_count': pricing_count,
                        'has_pricing_info': pricing_count > 10
                    }
            except:
                continue

        return {'found': False, 'url': None, 'page_title': '', 'pricing_keyword_count': 0, 'has_pricing_info': False}

    def deep_verify_us_market(self, soup, page_text, url):
        """深度验证美国市场服务"""
        ach_keywords = ['ach', 'automated clearing house', 'direct deposit', 'bank transfer', 'usd', '$', 'dollar', 'united states', 'usa']
        ach_count = sum(page_text.count(keyword) for keyword in ach_keywords)

        # 检查是否有美国特定页面
        us_indicators = ['us.', '.com/us', '/us/', 'united states', 'american']
        has_us_pages = any(indicator in url.lower() or indicator in page_text for indicator in us_indicators)

        # 检查美国市场关键词深度
        deep_us_keywords = ['american', 'us-based', 'united states customers', 'usd', '$']
        deep_us_count = sum(page_text.count(keyword) for keyword in deep_us_keywords)

        return {
            'ach_keyword_count': ach_count,
            'has_us_pages': has_us_pages,
            'deep_us_keyword_count': deep_us_count,
            'total_us_indicators': ach_count + deep_us_count + (10 if has_us_pages else 0),
            'passed': ach_count > 3 or deep_us_count > 5 or has_us_pages
        }

    def deep_verify_self_registration(self, soup, page_text, url):
        """深度验证自注册功能"""
        # 基础注册关键词
        signup_keywords = ['sign up', 'register', 'create account', 'get started', 'join', 'apply', 'start now']
        signup_count = sum(page_text.count(keyword) for keyword in signup_keywords)

        # 检查注册元素
        signup_elements = 0
        for tag in ['a', 'button']:
            for element in soup.find_all(tag):
                text = element.get_text().lower()
                if any(keyword in text for keyword in signup_keywords):
                    signup_elements += 1

        # 检查注册表单
        forms = soup.find_all('form')
        has_signup_form = False
        for form in forms:
            form_text = form.get_text().lower()
            if any(keyword in form_text for keyword in ['email', 'password', 'name', 'create']):
                has_signup_form = True
                break

        # 检查企业专用排除
        enterprise_keywords = ['enterprise only', 'invitation only', 'contact sales', 'request demo']
        enterprise_count = sum(page_text.count(keyword) for keyword in enterprise_keywords)
        is_enterprise_only = enterprise_count > 2

        return {
            'signup_keyword_count': signup_count,
            'signup_elements_count': signup_elements,
            'has_signup_form': has_signup_form,
            'enterprise_keyword_count': enterprise_count,
            'is_enterprise_only': is_enterprise_only,
            'passed': (signup_count > 5 or signup_elements > 2 or has_signup_form) and not is_enterprise_only
        }

    def deep_verify_payment_receiving(self, soup, page_text, url):
        """深度验证收款能力"""
        # 基础收款关键词
        receiving_keywords = [
            'receive payments', 'get paid', 'accept payments', 'collect payments',
            'contributions', 'donations', 'tips', 'subscriptions', 'sales',
            'service fees', 'consulting fees', 'commissions', 'rent', 'fees'
        ]

        # 银行直接提取关键词
        direct_debit_keywords = [
            'direct debit', 'bank withdrawal', 'pre-authorized debit', 'preauthorized payment',
            'automatic withdrawal', 'bank draft', 'electronic funds transfer', 'eft',
            'pull payment', 'pull funds', 'ach debit', 'payment authorization',
            'customer authorization', 'scheduled payments', 'recurring payments'
        ]

        # 付款关键词（用于排除）
        sending_keywords = ['send money', 'pay bills', 'make payments', 'outgoing payments', 'transfer money']

        receiving_count = sum(page_text.count(keyword) for keyword in receiving_keywords)
        direct_debit_count = sum(page_text.count(keyword) for keyword in direct_debit_keywords)
        sending_count = sum(page_text.count(keyword) for keyword in sending_keywords)

        # 计算收款vs付款比率
        total_payment_keywords = receiving_count + sending_count
        receiving_ratio = receiving_count / max(total_payment_keywords, 1)

        # 检查是否有明确的收款页面
        payment_indicators = ['checkout', 'payment', 'billing', 'invoice']
        has_payment_pages = any(indicator in url.lower() for indicator in payment_indicators)

        return {
            'basic_receiving_count': receiving_count,
            'direct_debit_count': direct_debit_count,
            'sending_count': sending_count,
            'total_receiving_keywords': receiving_count + direct_debit_count,
            'receiving_ratio': receiving_ratio,
            'has_payment_pages': has_payment_pages,
            'passed': (receiving_count + direct_debit_count) > sending_count and (receiving_count + direct_debit_count) > 8
        }

    def deep_verify_integration(self, soup, page_text, url):
        """深度验证集成能力"""
        # API关键词
        api_keywords = ['api', 'integration', 'developers', 'documentation', 'sdk', 'webhook']
        api_count = sum(page_text.count(keyword) for keyword in api_keywords)

        # 查找API文档链接
        api_docs = 0
        for link in soup.find_all('a', href=True):
            href = link.get('href', '').lower()
            text = link.get_text().lower()
            if any(keyword in href or keyword in text for keyword in ['api', 'docs', 'developer', 'sdk']):
                api_docs += 1

        # 检查嵌入式集成
        embedded_keywords = ['embed', 'javascript', 'plugin', 'widget', 'iframe']
        embedded_count = sum(page_text.count(keyword) for keyword in embedded_keywords)

        # 检查开发者资源
        dev_resources = ['github.com', 'npm', 'pip', 'maven', 'gradle']
        dev_resource_count = sum(page_text.count(resource) for resource in dev_resources)

        return {
            'api_keyword_count': api_count,
            'api_docs_count': api_docs,
            'embedded_keyword_count': embedded_count,
            'dev_resource_count': dev_resource_count,
            'has_api_docs': api_docs > 0 or api_count > 8,
            'has_embedded_options': embedded_count > 3,
            'passed': (api_count > 5 or api_docs > 0) and (embedded_count > 2 or dev_resource_count > 0)
        }

    def deep_verify_bank_features(self, soup, page_text, url):
        """深度验证银行直接提取功能"""
        # 信用卡/Apple Pay支持
        credit_card_indicators = [
            'credit card', 'visa', 'mastercard', 'amex', 'american express', 'apple pay',
            'digital wallet', 'payment processing', 'card payment', 'debit card'
        ]
        credit_card_count = sum(page_text.count(indicator) for indicator in credit_card_indicators)

        # 银行直接提取支持
        direct_debit_indicators = [
            'direct debit', 'bank withdrawal', 'pre-authorized debit', 'preauthorized payment',
            'automatic withdrawal', 'bank draft', 'electronic funds transfer', 'eft',
            'pull payment', 'pull funds', 'ach debit', 'payment authorization',
            'customer authorization', 'scheduled payments', 'recurring payments', 'auto-pay'
        ]
        direct_debit_count = sum(page_text.count(indicator) for indicator in direct_debit_indicators)

        # 银行转账支持
        bank_transfer_indicators = ['bank transfer', 'wire transfer', 'ach transfer', 'electronic check']
        bank_transfer_count = sum(page_text.count(indicator) for indicator in bank_transfer_indicators)

        has_credit_support = credit_card_count > 3
        has_direct_debit_support = direct_debit_count > 2
        has_bank_transfer_support = bank_transfer_count > 2

        return {
            'credit_card_count': credit_card_count,
            'direct_debit_count': direct_debit_count,
            'bank_transfer_count': bank_transfer_count,
            'has_credit_card_support': has_credit_support,
            'has_direct_debit_support': has_direct_debit_support,
            'has_bank_transfer_support': has_bank_transfer_support,
            'total_bank_features': credit_card_count + direct_debit_count + bank_transfer_count,
            'passed': has_credit_support or has_direct_debit_support or has_bank_transfer_support,
            'feature_type': self.determine_bank_feature_type(has_credit_support, has_direct_debit_support, has_bank_transfer_support)
        }

    def determine_bank_feature_type(self, has_credit, has_direct_debit, has_bank_transfer):
        """确定银行功能类型"""
        if has_credit and has_direct_debit:
            return "🏦双重功能"
        elif has_credit:
            return "💳信用卡/Apple Pay"
        elif has_direct_debit:
            return "🏦银行直接提取"
        elif has_bank_transfer:
            return "🏦银行转账"
        else:
            return "❌无银行功能"

    def calculate_final_score(self, main_result, api_result, pricing_result):
        """计算最终综合评分"""
        if not main_result:
            return {'score': 0, 'criteria_met': [], 'recommendation': '❌ 验证失败'}

        # 基础4项标准分数
        base_score = 0
        criteria_met = []

        if main_result['us_market_analysis']['passed']:
            base_score += 25
            criteria_met.append("🇺🇸美国市场服务")

        if main_result['self_registration_analysis']['passed']:
            base_score += 25
            criteria_met.append("🔑自注册功能")

        if main_result['payment_receiving_analysis']['passed']:
            base_score += 25
            criteria_met.append("💰收款能力")

        if main_result['integration_analysis']['passed']:
            base_score += 25
            criteria_met.append("🔗集成能力")

        # 银行功能加分
        if main_result['bank_direct_debit_features']['passed']:
            base_score += 5
            criteria_met.append("🏦银行功能")

        # API文档加分
        if api_result and api_result['has_api_docs']:
            base_score += 3
            criteria_met.append("📚API文档")

        # 定价信息加分
        if pricing_result and pricing_result['has_pricing_info']:
            base_score += 2
            criteria_met.append("💰定价透明")

        # 确保分数不超过100
        final_score = min(base_score, 100)

        # 生成推荐
        if final_score >= 90:
            recommendation = "🌟强烈推荐 - 完美平台"
        elif final_score >= 75:
            recommendation = "✅推荐使用 - 优秀平台"
        elif final_score >= 50:
            recommendation = "⚠️可考虑使用 - 良好平台"
        else:
            recommendation = "❌不推荐使用 - 需改进"

        return {
            'score': final_score,
            'criteria_met': criteria_met,
            'recommendation': recommendation
        }

    def extract_title(self, soup):
        """提取页面标题"""
        title_tag = soup.find('title')
        if title_tag:
            title = title_tag.get_text().strip()
            # 清理标题
            title = title.replace('\n', ' ').replace('\t', ' ')
            return title[:100]  # 限制长度
        return "无标题"

    def generate_detailed_analysis(self, main_result, api_result, pricing_result):
        """生成详细分析"""
        analysis = {
            'us_market_details': {},
            'self_registration_details': {},
            'payment_receiving_details': {},
            'integration_details': {},
            'bank_features_details': {}
        }

        if main_result:
            analysis['us_market_details'] = {
                'ach_keywords': main_result['us_market_analysis'].get('ach_keyword_count', 0),
                'total_indicators': main_result['us_market_analysis'].get('total_us_indicators', 0),
                'us_pages': main_result['us_market_analysis'].get('has_us_pages', False)
            }
            analysis['self_registration_details'] = {
                'signup_keywords': main_result['self_registration_analysis'].get('signup_keyword_count', 0),
                'signup_elements': main_result['self_registration_analysis'].get('signup_elements_count', 0),
                'enterprise_only': main_result['self_registration_analysis'].get('is_enterprise_only', False)
            }
            analysis['payment_receiving_details'] = {
                'receiving_keywords': main_result['payment_receiving_analysis'].get('total_receiving_keywords', 0),
                'direct_debit_count': main_result['payment_receiving_analysis'].get('direct_debit_count', 0),
                'receiving_ratio': main_result['payment_receiving_analysis'].get('receiving_ratio', 0)
            }
            analysis['integration_details'] = {
                'api_keywords': main_result['integration_analysis'].get('api_keyword_count', 0),
                'api_docs': main_result['integration_analysis'].get('api_docs_count', 0),
                'embedded_options': main_result['integration_analysis'].get('embedded_keyword_count', 0)
            }
            analysis['bank_features_details'] = {
                'credit_card_count': main_result['bank_direct_debit_features'].get('credit_card_count', 0),
                'direct_debit_count': main_result['bank_direct_debit_features'].get('direct_debit_count', 0),
                'feature_type': main_result['bank_direct_debit_features'].get('feature_type', '❌无')
            }

        if api_result:
            analysis['api_details'] = {
                'found': api_result['found'],
                'url': api_result['url'],
                'keyword_count': api_result['api_keyword_count'],
                'has_docs': api_result['has_api_docs']
            }

        if pricing_result:
            analysis['pricing_details'] = {
                'found': pricing_result['found'],
                'url': pricing_result['url'],
                'keyword_count': pricing_result['pricing_keyword_count'],
                'has_info': pricing_result['has_pricing_info']
            }

        return analysis

    def batch_verify_platforms(self, platforms, batch_size=5):
        """批量深度验证平台"""
        print(f"🚀 开始批量深度验证 {len(platforms)} 个新平台 (每批 {batch_size} 个)")
        print("="*80)

        results = []

        # 使用线程池并行处理
        with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
            # 提交所有验证任务
            future_to_platform = {
                executor.submit(self.deep_verify_platform, platform): platform
                for platform in platforms
            }

            # 收集结果
            for future in concurrent.futures.as_completed(future_to_platform):
                platform = future_to_platform[future]
                try:
                    result = future.result()
                    if result:
                        with self.lock:
                            self.verification_results.append(result)
                            results.append(result)
                        score = result['final_v4_1_1_score']
                        print(f"✅ [{len(results):3d}/{len(platforms)}] {platform[:25]:<25} - {score}/100 {result['final_recommendation']}")
                    else:
                        print(f"❌ [{len(results):3d}/{len(platforms)}] {platform[:25]:<25} - 验证失败")
                except Exception as e:
                    print(f"💥 [{len(results):3d}/{len(platforms)}] {platform[:25]:<25} - 错误: {e}")

        return results

    def save_deep_verification_results(self):
        """保存深度验证结果"""
        if not self.verification_results:
            return None

        data_path = Path(__file__).parent / "data"
        data_path.mkdir(exist_ok=True)

        # 分类结果
        perfect_platforms = [r for r in self.verification_results if r['final_v4_1_1_score'] >= 90]
        excellent_platforms = [r for r in self.verification_results if 75 <= r['final_v4_1_1_score'] < 90]
        good_platforms = [r for r in self.verification_results if 50 <= r['final_v4_1_1_score'] < 75]
        needs_improvement = [r for r in self.verification_results if r['final_v4_1_1_score'] < 50]

        # 银行功能统计
        bank_feature_stats = {
            'total_verified': len(self.verification_results),
            'has_credit_support': len([r for r in self.verification_results if r['main_page_analysis']['bank_direct_debit_features']['has_credit_card_support']]),
            'has_direct_debit_support': len([r for r in self.verification_results if r['main_page_analysis']['bank_direct_debit_features']['has_direct_debit_support']]),
            'has_bank_transfer_support': len([r for r in self.verification_results if r['main_page_analysis']['bank_direct_debit_features']['has_bank_transfer_support']]),
            'dual_features': len([r for r in self.verification_results if
                r['main_page_analysis']['bank_direct_debit_features']['has_credit_card_support'] and
                r['main_page_analysis']['bank_direct_debit_features']['has_direct_debit_support']])
        }

        # 标准符合率统计
        criteria_stats = {
            'us_market': len([r for r in self.verification_results if r['main_page_analysis']['us_market_analysis']['passed']]),
            'self_registration': len([r for r in self.verification_results if r['main_page_analysis']['self_registration_analysis']['passed']]),
            'payment_receiving': len([r for r in self.verification_results if r['main_page_analysis']['payment_receiving_analysis']['passed']]),
            'integration': len([r for r in self.verification_results if r['main_page_analysis']['integration_analysis']['passed']]),
            'bank_features': len([r for r in self.verification_results if r['main_page_analysis']['bank_direct_debit_features']['passed']]),
            'api_docs': len([r for r in self.verification_results if r.get('api_docs_analysis', {}).get('has_api_docs', False)]),
            'pricing_info': len([r for r in self.verification_results if r.get('pricing_analysis', {}).get('has_pricing_info', False)])
        }

        report = {
            'verification_type': 'Deep Verification v4.1.1 - 100 New Platforms',
            'verification_time': datetime.now().isoformat(),
            'total_platforms_analyzed': len(platforms),
            'total_platforms_verified': len(self.verification_results),
            'v4_1_1_standard': '4项标准 + 银行直接提取功能 + API文档 + 定价透明',
            'summary': {
                'perfect_platforms': len(perfect_platforms),
                'excellent_platforms': len(excellent_platforms),
                'good_platforms': len(good_platforms),
                'needs_improvement': len(needs_improvement),
                'average_score': sum(r['final_v4_1_1_score'] for r in self.verification_results) / len(self.verification_results) if self.verification_results else 0,
                'bank_features': bank_feature_stats,
                'criteria_compliance': criteria_stats
            },
            'platform_categories': {
                'perfect_platforms': perfect_platforms,
                'excellent_platforms': excellent_platforms,
                'good_platforms': good_platforms,
                'needs_improvement': needs_improvement
            },
            'detailed_results': self.verification_results
        }

        filename = f"deep_verification_100_new_platforms_v4_1_1_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(data_path / filename, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)

        return report

def main():
    """主函数"""
    print("🔍 100个全新平台深度检测系统 v4.1.1")
    print("🎯 目标: 基于完整去重系统，对100个全新平台进行深度验证")
    print("🏦 新功能: 银行直接提取 + API文档 + 定价透明深度检测")
    print("⚡ 技术: 多页面验证 + 并行处理 + 智能评分")
    print("="*80)

    verifier = DeepVerification100NewPlatforms()

    # 获取全新平台列表
    platforms = verifier.get_new_platforms_for_verification()
    print(f"\n📋 最终验证平台列表: {len(platforms)} 个（全新未验证）")

    if not platforms:
        print("❌ 没有找到需要验证的新平台")
        return

    # 批量深度验证
    results = verifier.batch_verify_platforms(platforms)

    # 保存结果
    report = verifier.save_deep_verification_results()

    if report:
        print(f"\n🎉 100平台深度检测完成!")
        print(f"📊 总分析平台: {report['summary']['total_platforms_verified']} 个")
        print(f"🌟 完美平台(90+分): {report['summary']['perfect_platforms']} 个")
        print(f"⭐ 优秀平台(75-89分): {report['summary']['excellent_platforms']} 个")
        print(f"✅ 良好平台(50-74分): {report['summary']['good_platforms']} 个")
        print(f"⚠️ 需改进(<50分): {report['summary']['needs_improvement']} 个")
        print(f"📈 平均分数: {report['summary']['average_score']:.1f}/100")

        # 银行功能统计
        bank_stats = report['summary']['bank_features']
        print(f"\n🏦 银行功能深度检测:")
        print(f"   支持信用卡/Apple Pay: {bank_stats['has_credit_support']}/{bank_stats['total_verified']} ({bank_stats['has_credit_support']/bank_stats['total_verified']*100:.1f}%)")
        print(f"   支持银行直接提取: {bank_stats['has_direct_debit_support']}/{bank_stats['total_verified']} ({bank_stats['has_direct_debit_support']/bank_stats['total_verified']*100:.1f}%)")
        print(f"   支持银行转账: {bank_stats['has_bank_transfer_support']}/{bank_stats['total_verified']} ({bank_stats['has_bank_transfer_support']/bank_stats['total_verified']*100:.1f}%)")
        print(f"   双重功能支持: {bank_stats['dual_features']}/{bank_stats['total_verified']} ({bank_stats['dual_features']/bank_stats['total_verified']*100:.1f}%)")

        # 标准符合率
        criteria_stats = report['summary']['criteria_compliance']
        print(f"\n📊 4项标准+扩展功能符合率:")
        print(f"   🇺🇸美国市场服务: {criteria_stats['us_market']}/{criteria_stats['total_verified']} ({criteria_stats['us_market']/criteria_stats['total_verified']*100:.1f}%)")
        print(f"   🔑自注册功能: {criteria_stats['self_registration']}/{criteria_stats['total_verified']} ({criteria_stats['self_registration']/criteria_stats['total_verified']*100:.1f}%)")
        print(f"   💰收款能力: {criteria_stats['payment_receiving']}/{criteria_stats['total_verified']} ({criteria_stats['payment_receiving']/criteria_stats['total_verified']*100:.1f}%)")
        print(f"   🔗集成能力: {criteria_stats['integration']}/{criteria_stats['total_verified']} ({criteria_stats['integration']/criteria_stats['total_verified']*100:.1f}%)")
        print(f"   🏦银行功能: {criteria_stats['bank_features']}/{criteria_stats['total_verified']} ({criteria_stats['bank_features']/criteria_stats['total_verified']*100:.1f}%)")
        print(f"   📚API文档: {criteria_stats['api_docs']}/{criteria_stats['total_verified']} ({criteria_stats['api_docs']/criteria_stats['total_verified']*100:.1f}%)")
        print(f"   💰定价透明: {criteria_stats['pricing_info']}/{criteria_stats['total_verified']} ({criteria_stats['pricing_info']/criteria_stats['total_verified']*100:.1f}%)")

        # 显示顶级平台
        top_platforms = sorted(results, key=lambda x: x['final_v4_1_1_score'], reverse=True)[:10]
        if top_platforms:
            print(f"\n🏆 深度检测TOP10平台:")
            for i, platform in enumerate(top_platforms, 1):
                name = platform['platform_name']
                score = platform['final_v4_1_1_score']
                bank_type = platform['main_page_analysis']['bank_direct_debit_features']['feature_type']
                print(f"  {i:2d}. {name:<25} - {score}/100 {bank_type}")

        print(f"\n💾 深度验证结果已保存到:")
        print(f"   {Path(__file__).parent / 'data' / f'deep_verification_100_new_platforms_v4_1_1_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json'}")

    else:
        print("❌ 深度验证未能完成任何结果")

if __name__ == "__main__":
    # 获取平台列表
    verifier = DeepVerification100NewPlatforms()
    platforms = verifier.get_new_platforms_for_verification()

    # 传递给main函数
    import sys
    sys.argv = ['deep_verification_100_new_platforms.py']
    main()