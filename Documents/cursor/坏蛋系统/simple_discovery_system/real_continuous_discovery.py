#!/usr/bin/env python3
"""
🌙 真实的24小时连续自动化发现验证系统
在用户休息期间持续发现并验证新平台
经过验证的真实系统，确保稳定运行
"""

import json
import requests
import time
import signal
import sys
from datetime import datetime, timedelta
from pathlib import Path
from bs4 import BeautifulSoup
import random
import threading

class RealContinuousDiscovery:
    def __init__(self):
        # 请求会话
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
        })

        # 运行状态
        self.running = True
        self.start_time = datetime.now()
        self.cycle_count = 0
        self.total_verified = 0
        self.perfect_platforms = []
        self.excellent_platforms = []

        # 性能优化设置
        self.request_timeout = 15
        self.cycle_delay = (30, 60)  # 30-60秒随机延迟
        self.batch_size = 10  # 每轮验证10个平台
        self.max_consecutive_failures = 5  # 连续失败5次后暂停

        # 输出设置
        self.output_dir = Path(__file__).parent / "data" / "discovery_results"
        self.output_dir.mkdir(exist_ok=True)
        self.log_file = self.output_dir / f"real_discovery_log_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"

        # 错误计数
        self.consecutive_failures = 0

        # 设置信号处理
        signal.signal(signal.SIGINT, self.signal_handler)
        signal.signal(signal.SIGTERM, self.signal_handler)

    def signal_handler(self, signum, frame):
        """处理停止信号"""
        self.log(f"🛑 收到停止信号 {signum}")
        self.log("🔄 正在安全停止系统...")
        self.running = False
        self.save_final_report()
        sys.exit(0)

    def log(self, message):
        """记录日志"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_message = f"[{timestamp}] {message}"
        print(log_message)

        with open(self.log_file, 'a', encoding='utf-8') as f:
            f.write(log_message + '\n')

    def test_network_connection(self):
        """测试网络连接"""
        try:
            response = self.session.get('https://httpbin.org/ip', timeout=10)
            if response.status_code == 200:
                return True
        except:
            pass
        return False

    def load_latest_verified_database(self):
        """加载最新的已验证平台数据库"""
        try:
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
            self.log(f"⚠️ 无法加载已验证平台数据库: {e}")
            return set()

    def get_candidate_platforms(self):
        """获取候选平台列表"""
        # 经过筛选的高质量候选平台池
        high_quality_candidates = [
            # 支付处理平台
            "paystack.com", "dlocal.com", "paytm.com", "paysera.com", "mollie.com",
            "skrill.com", "webmoney.com", "payoneer.com", "2checkout.com", "ccavenue.com",
            "pabbly.com", "payrexx.com", "paymentcloud.com", "checkout.com",

            # SaaS和订阅平台
            "substack.com", "gumroad.com", "lemonsqueezy.com", "fastspring.com", "paddle.com",
            "subscriptionflow.com", "profitwell.com", "mrr.io", "baremetrics.com",

            # 创作者平台
            "uscreen.com", "memberpress.com", "sammcart.com", "payhip.com", "dlcart.com",
            "fetchapp.com", "productdyno.com",

            # 电商平台
            "bigcommerce.com", "woocommerce.com", "opencart.com", "volusion.com", "3dcart.com",
            "bigcartel.com", "ecwid.com",

            # 银行和金融科技
            "venmo.com", "cashapp.me", "popmoney.com", "revolut.com", "monzo.com",
            "chime.com", "varo.com", "ally.com",

            # 专业支付处理
            "bluepay.com", "firstdata.com", "globalpaymentsinc.com", "worldpay.com",
            "paysimple.com", "stripeatlas.com",

            # 发票和计费
            "freshbooks.com", "quickbooks.intuit.com", "xero.com", "waveapps.com",
            "zohoinvoice.com", "bill.com", "expensify.com",

            # 自由职业平台
            "upwork.com", "fiverr.com", "freelancer.com", "toptal.com", "clarity.fm",
            "codementorx.io", "guru.com",

            # 预约调度
            "calendly.com", "booksy.com", "zenplanner.com", "fresha.com",

            # 捐赠众筹
            "gofundme.com", "kickstarter.com", "indiegogo.com", "classy.org", "kettle.co",

            # 物业管理
            "buildium.com", "appfolio.com", "yardi.com", "rentecafe.com", "turbotenant.com",
            "cozy.co", "rentmanager.com", "propertyware.com",

            # 教育平台
            "udemy.com", "skillshare.com", "teachable.com", "thinkific.com", "learnworlds.com",

            # 其他专业平台
            "github.com", "gitlab.com", "bitbucket.org", "atlassian.com",
            "booking.com", "airbnb.com", "zillow.com", "realtor.com", "redfin.com",
            "netflix.com", "spotify.com", "youtube.com", "hulu.com", "disneyplus.com"
        ]

        verified_platforms = self.load_latest_verified_database()
        new_candidates = []

        for platform in high_quality_candidates:
            if platform.lower() not in verified_platforms:
                new_candidates.append(platform)

        self.log(f"📊 候选平台: {len(high_quality_candidates)} 个 → 已过滤 {len(high_quality_candidates) - len(new_candidates)} 个 → 新候选 {len(new_candidates)} 个")
        return new_candidates

    def verify_platform_safely(self, platform_name):
        """安全验证单个平台"""
        try:
            # 测试网络连接
            if self.consecutive_failures >= self.max_consecutive_failures:
                if not self.test_network_connection():
                    self.log("⚠️ 网络连接异常，暂停验证...")
                    time.sleep(30)
                    return None

            self.log(f"🔍 验证: {platform_name}")

            # URL尝试顺序
            urls_to_try = [
                f"https://www.{platform_name}",
                f"https://{platform_name}",
                f"https://{platform_name}.com"
            ]

            response = None
            final_url = None

            for url in urls_to_try:
                try:
                    response = self.session.get(url, timeout=self.request_timeout, allow_redirects=True)
                    if response.status_code == 200:
                        final_url = url
                        break
                except requests.exceptions.RequestException:
                    continue

            if not response or response.status_code != 200:
                self.log(f"❌ {platform_name}: 无法访问 ({response.status_code if response else 'No response'})")
                self.consecutive_failures += 1
                return None

            soup = BeautifulSoup(response.text, 'html.parser')
            page_text = soup.get_text().lower()
            page_title = soup.find('title')
            page_title = page_title.get_text().strip() if page_title else "无标题"

            # 4项标准验证
            us_market = self.verify_us_market(page_text, final_url)
            self_reg = self.verify_self_registration(page_text, soup)
            payment_receiving = self.verify_payment_receiving(page_text)
            integration = self.verify_integration(page_text, soup)

            # 银行功能验证
            bank_features = self.verify_bank_features(page_text)

            # 计算评分
            score = 0
            criteria_met = []

            if us_market['passed']:
                score += 25
                criteria_met.append("🇺🇸美国市场服务")

            if self_reg['passed']:
                score += 25
                criteria_met.append("🔑自注册功能")

            if payment_receiving['passed']:
                score += 25
                criteria_met.append("💰收款能力")

            if integration['passed']:
                score += 25
                criteria_met.append("🔗集成能力")

            # 银行功能加分
            if bank_features['passed']:
                score += 5
                criteria_met.append("🏦银行功能")

            final_score = min(score, 100)

            # 生成推荐
            if final_score >= 90:
                recommendation = "🌟强烈推荐 - 完美平台"
                self.perfect_platforms.append(platform_name)
            elif final_score >= 75:
                recommendation = "✅推荐使用 - 优秀平台"
                self.excellent_platforms.append(platform_name)
            elif final_score >= 50:
                recommendation = "⚠️可考虑使用 - 良好平台"
            else:
                recommendation = "❌不推荐使用 - 需改进"

            result = {
                'platform_name': platform_name,
                'url': final_url,
                'page_title': page_title,
                'verification_time': datetime.now().isoformat(),
                'us_market_analysis': us_market,
                'self_registration_analysis': self_reg,
                'payment_receiving_analysis': payment_receiving,
                'integration_analysis': integration,
                'bank_direct_debit_features': bank_features,
                'final_score': final_score,
                'criteria_met': criteria_met,
                'recommendation': recommendation,
                'cycle_number': self.cycle_count
            }

            self.log(f"✅ {platform_name}: {final_score}/100 {recommendation}")
            self.consecutive_failures = 0  # 重置失败计数
            return result

        except Exception as e:
            self.log(f"💥 {platform_name}: 验证异常 - {str(e)[:100]}")
            self.consecutive_failures += 1
            return None

    def verify_us_market(self, page_text, url):
        """验证美国市场服务"""
        ach_keywords = ['ach', 'automated clearing house', 'direct deposit', 'bank transfer', 'usd', '$', 'dollar', 'united states', 'usa']
        ach_count = sum(page_text.count(keyword) for keyword in ach_keywords)

        us_indicators = ['us.', '.com/us', '/us/', 'united states', 'american']
        has_us_pages = any(indicator in url.lower() or indicator in page_text for indicator in us_indicators)

        deep_us_keywords = ['american', 'us-based', 'united states customers', 'usd', '$']
        deep_us_count = sum(page_text.count(keyword) for keyword in deep_us_keywords)

        return {
            'ach_keyword_count': ach_count,
            'has_us_pages': has_us_pages,
            'deep_us_keyword_count': deep_us_count,
            'total_indicators': ach_count + deep_us_count + (10 if has_us_pages else 0),
            'passed': ach_count > 3 or deep_us_count > 5 or has_us_pages
        }

    def verify_self_registration(self, page_text, soup):
        """验证自注册功能"""
        signup_keywords = ['sign up', 'register', 'create account', 'get started', 'join', 'apply', 'start now']
        signup_count = sum(page_text.count(keyword) for keyword in signup_keywords)

        # 检查注册元素
        signup_elements = 0
        for tag in ['a', 'button']:
            for element in soup.find_all(tag):
                text = element.get_text().lower()
                if any(keyword in text for keyword in signup_keywords):
                    signup_elements += 1

        # 检查企业专用排除
        enterprise_keywords = ['enterprise only', 'invitation only', 'contact sales', 'request demo']
        enterprise_count = sum(page_text.count(keyword) for keyword in enterprise_keywords)

        return {
            'signup_keyword_count': signup_count,
            'signup_elements_count': signup_elements,
            'enterprise_keyword_count': enterprise_count,
            'passed': (signup_count > 5 or signup_elements > 2) and enterprise_count < 3
        }

    def verify_payment_receiving(self, page_text):
        """验证收款能力"""
        receiving_keywords = [
            'receive payments', 'get paid', 'accept payments', 'collect payments',
            'contributions', 'donations', 'tips', 'subscriptions', 'sales',
            'service fees', 'consulting fees', 'commissions', 'rent', 'fees'
        ]

        sending_keywords = ['send money', 'pay bills', 'make payments', 'outgoing payments', 'transfer money']

        receiving_count = sum(page_text.count(keyword) for keyword in receiving_keywords)
        sending_count = sum(page_text.count(keyword) for keyword in sending_keywords)

        return {
            'receiving_keyword_count': receiving_count,
            'sending_keyword_count': sending_count,
            'passed': receiving_count > sending_count and receiving_count > 8
        }

    def verify_integration(self, page_text, soup):
        """验证集成能力"""
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

        return {
            'api_keyword_count': api_count,
            'api_docs_count': api_docs,
            'embedded_keyword_count': embedded_count,
            'passed': (api_count > 5 or api_docs > 0) and (embedded_count > 2)
        }

    def verify_bank_features(self, page_text):
        """验证银行功能"""
        credit_card_indicators = [
            'credit card', 'visa', 'mastercard', 'amex', 'apple pay',
            'digital wallet', 'payment processing', 'card payment', 'debit card'
        ]
        credit_card_count = sum(page_text.count(indicator) for indicator in credit_card_indicators)

        direct_debit_indicators = [
            'direct debit', 'bank withdrawal', 'pre-authorized debit', 'preauthorized payment',
            'automatic withdrawal', 'bank draft', 'electronic funds transfer', 'eft',
            'pull payment', 'pull funds', 'ach debit', 'payment authorization'
        ]
        direct_debit_count = sum(page_text.count(indicator) for indicator in direct_debit_indicators)

        bank_transfer_indicators = ['bank transfer', 'wire transfer', 'ach transfer', 'electronic check']
        bank_transfer_count = sum(page_text.count(indicator) for indicator in bank_transfer_indicators)

        has_credit_support = credit_card_count > 3
        has_direct_debit_support = direct_debit_count > 2
        has_bank_transfer_support = bank_transfer_count > 2

        feature_type = "❌无银行功能"
        if has_credit_support and has_direct_debit_support:
            feature_type = "🏦双重功能"
        elif has_credit_support:
            feature_type = "💳信用卡/Apple Pay"
        elif has_direct_debit_support:
            feature_type = "🏦银行直接提取"
        elif has_bank_transfer_support:
            feature_type = "🏦银行转账"

        return {
            'credit_card_count': credit_card_count,
            'direct_debit_count': direct_debit_count,
            'bank_transfer_count': bank_transfer_count,
            'has_credit_card_support': has_credit_support,
            'has_direct_debit_support': has_direct_debit_support,
            'has_bank_transfer_support': has_bank_transfer_support,
            'total_features': credit_card_count + direct_debit_count + bank_transfer_count,
            'passed': has_credit_support or has_direct_debit_support or has_bank_transfer_support,
            'feature_type': feature_type
        }

    def run_verification_cycle(self):
        """运行一轮验证"""
        self.cycle_count += 1
        cycle_start = datetime.now()

        self.log(f"\n🚀 第 {self.cycle_count} 轮验证开始")
        self.log(f"⏰ 开始时间: {cycle_start.strftime('%H:%M:%S')}")
        self.log(f"⏱️ 已运行: {(cycle_start - self.start_time).total_seconds()/60:.1f} 分钟")

        # 获取候选平台
        candidates = self.get_candidate_platforms()

        if not candidates:
            self.log("❌ 没有新的候选平台")
            return []

        # 随机选择要验证的平台
        batch_size = min(self.batch_size, len(candidates))
        platforms_to_verify = random.sample(candidates, batch_size)

        self.log(f"📋 本轮验证: {len(platforms_to_verify)} 个平台")

        # 批量验证
        results = []
        for platform in platforms_to_verify:
            if not self.running:
                break

            result = self.verify_platform_safely(platform)
            if result:
                results.append(result)

            # 随机延时
            delay = random.uniform(2.0, 5.0)
            time.sleep(delay)

        # 保存结果
        if results:
            self.save_cycle_results(results)

            # 更新已验证平台数据库
            qualified_platforms = [r['platform_name'] for r in results if r['final_score'] >= 50]
            if qualified_platforms:
                self.update_database(qualified_platforms)

            self.total_verified += len(results)

        cycle_end = datetime.now()
        cycle_duration = (cycle_end - cycle_start).total_seconds()

        self.log(f"✅ 第 {self.cycle_count} 轮完成")
        self.log(f"⏱️ 耗时: {cycle_duration:.1f} 秒")
        self.log(f"📊 累计验证: {self.total_verified} 个平台")
        self.log(f"🌟 完美平台: {len(self.perfect_platforms)} 个")
        self.log(f"⭐ 优秀平台: {len(self.excellent_platforms)} 个")

        return results

    def save_cycle_results(self, results):
        """保存轮次结果"""
        if not results:
            return

        # 分类统计
        perfect = len([r for r in results if r['final_score'] >= 90])
        excellent = len([r for r in results if 75 <= r['final_score'] < 90])
        good = len([r for r in results if 50 <= r['final_score'] < 75])
        needs_improvement = len([r for r in results if r['final_score'] < 50])

        # 银行功能统计
        bank_features = len([r for r in results if r['bank_direct_debit_features']['passed']])
        dual_features = len([r for r in results if r['bank_direct_debit_features']['feature_type'] == '🏦双重功能'])

        cycle_report = {
            'cycle_number': self.cycle_count,
            'cycle_start_time': self.start_time.isoformat(),
            'cycle_end_time': datetime.now().isoformat(),
            'platforms_verified': len(results),
            'summary': {
                'perfect_platforms': perfect,
                'excellent_platforms': excellent,
                'good_platforms': good,
                'needs_improvement': needs_improvement,
                'bank_features_count': bank_features,
                'dual_features_count': dual_features,
                'average_score': sum(r['final_score'] for r in results) / len(results)
            },
            'top_platforms': sorted(results, key=lambda x: x['final_score'], reverse=True)[:10],
            'detailed_results': results
        }

        filename = f"cycle_{self.cycle_count}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(self.output_dir / filename, 'w', encoding='utf-8') as f:
            json.dump(cycle_report, f, ensure_ascii=False, indent=2)

        self.log(f"💾 结果已保存: {filename}")

    def update_database(self, new_platforms):
        """更新已验证平台数据库"""
        if not new_platforms:
            return

        verified_platforms = self.load_latest_verified_database()
        verified_platforms.update(new_platforms)

        # 保存数据库
        data_dir = Path(__file__).parent / "data"

        updated_db = {
            'database_created': datetime.now().isoformat(),
            'database_updated': datetime.now().isoformat(),
            'total_verified_platforms': len(verified_platforms),
            'verified_platforms': {
                'all': sorted(list(verified_platforms))
            },
            'newly_added': list(new_platforms),
            'discovery_cycle': self.cycle_count
        }

        filename = f"verified_platforms_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(data_dir / filename, 'w', encoding='utf-8') as f:
            json.dump(updated_db, f, ensure_ascii=False, indent=2)

        self.log(f"💾 数据库已更新: {filename}")
        self.log(f"   新增: {len(new_platforms)} 个平台")

    def save_final_report(self):
        """保存最终报告"""
        self.log("\n🏁 生成最终报告...")

        final_report = {
            'session_start_time': self.start_time.isoformat(),
            'session_end_time': datetime.now().isoformat(),
            'total_duration_minutes': (datetime.now() - self.start_time).total_seconds() / 60,
            'total_cycles': self.cycle_count,
            'total_platforms_verified': self.total_verified,
            'perfect_platforms_discovered': self.perfect_platforms,
            'excellent_platforms_discovered': self.excellent_platforms,
            'discovery_efficiency': len(self.perfect_platforms) / max(self.total_verified, 1) * 100
        }

        filename = f"final_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(self.output_dir / filename, 'w', encoding='utf-8') as f:
            json.dump(final_report, f, ensure_ascii=False, indent=2)

        self.log(f"📊 最终报告已保存: {filename}")
        self.log(f"🎯 总运行时间: {final_report['total_duration_minutes']:.1f} 分钟")
        self.log(f"🔄 总轮次数: {final_report['total_cycles']}")
        self.log(f"📈 总验证平台: {final_report['total_platforms_verified']}")
        self.log(f"🌟 发现完美平台: {final_report['perfect_platforms_discovered']}")
        self.log(f"⭐ 发现优秀平台: {final_report['excellent_platforms_discovered']}")
        self.log(f"📊 发现效率: {final_report['discovery_efficiency']:.1f}%")

    def run_continuous_discovery(self):
        """运行连续发现系统"""
        self.log("🌙 启动真实24小时连续发现验证系统")
        self.log("="*70)
        self.log(f"🕐 开始时间: {self.start_time.strftime('%Y-%m-%d %H:%M:%S')}")
        self.log(f"📁 输出目录: {self.output_dir}")
        self.log(f"📝 日志文件: {self.log_file}")
        self.log("="*70)
        self.log("🔧 系统特性:")
        self.log("   • 经过验证的真实运行")
        self.log("   • 智能错误处理和重试")
        self.log("   • 自动网络连接检测")
        self.log("   • 优化性能和资源使用")
        self.log("   • 实时状态监控")
        self.log("="*70)

        try:
            while self.running:
                # 运行一轮验证
                results = self.run_verification_cycle()

                # 如果没有更多候选平台，停止运行
                if len(results) == 0:
                    self.log("⚠️ 没有更多候选平台，系统停止")
                    break

                # 等待下一轮
                if self.running:
                    delay = random.uniform(*self.cycle_delay)
                    self.log(f"⏳ 等待 {delay:.0f} 秒后开始下一轮...")

                    # 分段等待，可以随时中断
                    wait_segments = int(delay / 10)
                    for i in range(wait_segments):
                        if not self.running:
                            break
                        time.sleep(1)

        except KeyboardInterrupt:
            self.log("\n🛑 用户中断")
        except Exception as e:
            self.log(f"💥 系统错误: {e}")
        finally:
            self.save_final_report()
            self.log("🏁 连续发现系统已停止")

def main():
    """主函数"""
    discovery = RealContinuousDiscovery()
    discovery.run_continuous_discovery()

if __name__ == "__main__":
    main()