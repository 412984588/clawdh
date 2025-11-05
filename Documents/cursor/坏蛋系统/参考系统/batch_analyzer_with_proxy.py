#!/usr/bin/env python3
"""
批量网站分析器 - 增强版
支持Cloudflare代理(仅用于批量筛选功能)
针对Excel文件中的7730个网站进行Stripe Connect分析
"""

import json
import time
import sys
import os
import asyncio
import aiohttp
import logging
from datetime import datetime
from bs4 import BeautifulSoup
import re

# 导入女王条纹测试2专用代理管理器
from utils.proxy_manager import get_queen_proxy_manager, is_batch_operation

class BatchStripeConnectAnalyzerWithProxy:
    """支持代理的批量Stripe Connect分析器"""

    def __init__(self):
        # 设置日志
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)

        # 代理管理器(仅用于批量筛选)
        self.proxy_manager = get_queen_proxy_manager()

        self.high_priority_industries = [
            'Technology', 'SaaS', 'Software', 'E-commerce', 'Marketplace',
            'Platform', 'Fintech', 'Payments', 'Subscription', 'Gig Economy'
        ]

        self.stripe_connect_signals = [
            'stripe.com/connect',
            'connect.stripe.com',
            'stripe-express',
            'stripe-custom',
            'become a partner',
            'partner program',
            'seller portal',
            'merchant signup',
            'seller signup',
            'seller onboarding',
            'partner dashboard',
            'marketplace',
            'platform payments'
        ]

    def load_excel_data(self, file_path):
        """加载Excel数据"""
        try:
            with open(file_path.replace('.xlsx', '_data.json'), 'r', encoding='utf-8') as f:
                data = json.load(f)
            return data['data']
        except FileNotFoundError:
            print("JSON文件不存在,请先运行excel_reader.py")
            return None
        except Exception as e:
            print(f"读取数据失败: {e}")
            return None

    def prioritize_domains(self, domains_data):
        """对域名进行优先级排序"""
        high_priority = []
        medium_priority = []
        low_priority = []

        for item in domains_data:
            domain = item.get('Domain', '')
            company = item.get('Company', '')
            vertical = item.get('Vertical', '')
            revenue = item.get('Sales Revenue USD', 0)
            employees = item.get('Employees', 0)

            # 计算优先级分数
            priority_score = self.calculate_priority_score(
                domain, company, vertical, revenue, employees
            )

            categorized_item = {
                'domain': domain,
                'company': company,
                'vertical': vertical,
                'revenue': revenue,
                'employees': employees,
                'priority_score': priority_score,
                'original_data': item
            }

            if priority_score >= 70:
                high_priority.append(categorized_item)
            elif priority_score >= 40:
                medium_priority.append(categorized_item)
            else:
                low_priority.append(categorized_item)

        # 按优先级分数排序
        high_priority.sort(key=lambda x: x['priority_score'], reverse=True)
        medium_priority.sort(key=lambda x: x['priority_score'], reverse=True)
        low_priority.sort(key=lambda x: x['priority_score'], reverse=True)

        return {
            'high_priority': high_priority[:100],  # 限制数量
            'medium_priority': medium_priority[:200],
            'low_priority': low_priority[:300]
        }

    def calculate_priority_score(self, domain, company, vertical, revenue, employees):
        """计算优先级分数"""
        score = 0

        # 行业评分
        if vertical:
            if any(industry.lower() in vertical.lower() for industry in self.high_priority_industries):
                score += 30

        # 公司规模评分
        if employees:
            if 10 <= employees <= 1000:
                score += 20
            elif 1000 < employees <= 5000:
                score += 15
            elif employees > 5000:
                score += 10

        # 收入评分
        if revenue and revenue != 0:
            if isinstance(revenue, str) and '$' in revenue:
                # 解析收入字符串
                try:
                    revenue_num = int(revenue.replace('$', '').replace(',', ''))
                    if revenue_num >= 1000000:  # 100万美元以上
                        score += 25
                    elif revenue_num >= 100000:  # 10万美元以上
                        score += 15
                except:
                    pass

        # 域名评分
        if domain:
            if any(keyword in domain.lower() for keyword in ['platform', 'marketplace', 'connect']):
                score += 15
            if any(keyword in domain.lower() for keyword in ['tech', 'software', 'app']):
                score += 10

        return score

    async def analyze_single_domain_async(self, domain_info):
        """异步分析单个域名(支持代理)"""
        domain = domain_info['domain']
        url = f"https://{domain}"
        start_time = datetime.now()

        result = {
            'domain': domain,
            'company': domain_info.get('company', ''),
            'vertical': domain_info.get('vertical', ''),
            'priority_score': domain_info.get('priority_score', 0),
            'analysis_time': start_time.isoformat(),
            'proxy_used': False,
            'stripe_detected': False,
            'confidence': 0.0,
            'evidence': [],
            'error': None
        }

        try:
            # 创建会话(根据代理设置决定是否使用代理)
            if self.proxy_manager.is_enabled():
                self.logger.info(f"使用代理分析 {domain}")
                result['proxy_used'] = True
                session = await self.proxy_manager.create_session()
            else:
                self.logger.info(f"直连分析 {domain}")
                connector = aiohttp.TCPConnector(ssl=False, limit=10)
                timeout = aiohttp.ClientTimeout(total=30)
                session = aiohttp.ClientSession(connector=connector, timeout=timeout)

            headers = {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
            }

            try:
                async with session.get(url, headers=headers) as response:
                    if response.status == 200:
                        content = await response.text()
                        analysis = self.analyze_stripe_indicators(content, domain_info)
                        result.update(analysis)
                    else:
                        result['error'] = f'HTTP {response.status}'

            finally:
                await session.close()

        except Exception as e:
            self.logger.error(f"分析失败 {domain}: {e}")
            result['error'] = str(e)

        # 计算分析耗时
        end_time = datetime.now()
        result['duration'] = (end_time - start_time).total_seconds()

        return result

    def analyze_stripe_indicators(self, content, domain_info):
        """分析Stripe指标"""
        analysis_result = {
            'stripe_detected': False,
            'confidence': 0.0,
            'evidence': [],
            'connect_type': 'Unknown'
        }

        try:
            soup = BeautifulSoup(content, 'html.parser')

            # 检查JavaScript文件
            scripts = soup.find_all('script')
            for script in scripts:
                if script.src:
                    script_src = script.src.lower()
                    if any(signal in script_src for signal in self.stripe_connect_signals):
                        analysis_result['stripe_detected'] = True
                        analysis_result['confidence'] += 20
                        analysis_result['evidence'].append(f"Stripe JS: {script.src}")

            # 检查页面内容
            page_text = soup.get_text().lower()
            for signal in self.stripe_connect_signals:
                if signal in page_text:
                    analysis_result['stripe_detected'] = True
                    analysis_result['confidence'] += 15
                    analysis_result['evidence'].append(f"页面内容: {signal}")

            # 检查已知的Stripe Connect用户模式
            if self.is_likely_stripe_connect_user(domain_info):
                analysis_result['stripe_detected'] = True
                analysis_result['confidence'] += 25
                analysis_result['evidence'].append("符合Stripe Connect目标用户特征")

        except Exception as e:
            self.logger.error(f"内容分析失败: {e}")

        return analysis_result

    def is_likely_stripe_connect_user(self, domain_info):
        """判断是否可能是Stripe Connect用户"""
        vertical = domain_info.get('vertical', '').lower()
        employees = domain_info.get('employees', 0)
        domain = domain_info['domain'].lower()

        # 中小型科技/SaaS公司
        if any(industry in vertical for industry in ['technology', 'saas', 'software', 'platform']):
            if 10 <= employees <= 1000:
                return True

        # 市场平台
        if any(keyword in domain for keyword in ['marketplace', 'platform', 'connect']):
            return True

        # 金融科技公司
        if any(industry in vertical for industry in ['fintech', 'payments', 'finance']):
            if employees < 5000:  # 不是超大型公司
                return True

        return False

    async def analyze_domain_batch_async(self, domains_data, max_concurrent=20):
        """异步批量分析域名(支持代理)"""
        self.logger.info(f"开始异步批量分析 {len(domains_data)} 个域名")

        if self.proxy_manager.is_enabled():
            self.logger.info("✅ 启用Cloudflare代理进行批量分析")
            proxy_stats = self.proxy_manager.get_stats()
            self.logger.info(f"代理状态: {proxy_stats}")
        else:
            self.logger.info("⚠️ 代理未启用,使用直连")

        # 限制并发数
        semaphore = asyncio.Semaphore(max_concurrent)

        async def limited_analyze(domain_info):
            async with semaphore:
                return await self.analyze_single_domain_async(domain_info)

        # 创建所有任务
        tasks = [limited_analyze(domain_info) for domain_info in domains_data]

        # 执行所有任务
        results = await asyncio.gather(*tasks, return_exceptions=True)

        # 过滤和统计结果
        valid_results = []
        success_count = 0
        error_count = 0
        stripe_detected_count = 0

        for result in results:
            if isinstance(result, dict) and 'domain' in result:
                valid_results.append(result)
                if result.get('error'):
                    error_count += 1
                else:
                    success_count += 1
                    if result.get('stripe_detected'):
                        stripe_detected_count += 1
            else:
                error_count += 1

        # 输出统计信息
        self.logger.info(f"批量分析完成:")
        self.logger.info(f"  总数: {len(domains_data)}")
        self.logger.info(f"  成功: {success_count}")
        self.logger.info(f"  失败: {error_count}")
        self.logger.info(f"  检测到Stripe: {stripe_detected_count}")

        return valid_results

    def save_batch_results(self, results, filename):
        """保存批量结果"""
        # 创建输出目录
        output_dir = "/Users/zhimingdeng/Projects/女王条纹测试2/results/batches"
        os.makedirs(output_dir, exist_ok=True)

        output_path = os.path.join(output_dir, filename)

        # 添加元数据
        output_data = {
            'metadata': {
                'total_domains': len(results),
                'analysis_time': datetime.now().isoformat(),
                'proxy_enabled': self.proxy_manager.is_enabled(),
                'proxy_stats': self.proxy_manager.get_stats() if self.proxy_manager.is_enabled() else None
            },
            'results': results
        }

        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, ensure_ascii=False, indent=2)

        self.logger.info(f"结果已保存到: {output_path}")

    def save_priority_results(self, prioritized_domains):
        """保存优先级分类结果"""
        output_path = "/Users/zhimingdeng/Projects/女王条纹测试2/results/prioritized_domains_with_proxy.json"

        os.makedirs(os.path.dirname(output_path), exist_ok=True)

        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(prioritized_domains, f, ensure_ascii=False, indent=2)

def main():
    """主函数"""
    if len(sys.argv) < 2:
        print("使用方法: python batch_analyzer_with_proxy.py <excel_file>")
        return

    excel_file = sys.argv[1]
    analyzer = BatchStripeConnectAnalyzerWithProxy()

    print(f"🎯 女王条纹测试2 - 批量分析器(支持代理)")
    print(f"📁 分析文件: {excel_file}")

    # 加载数据
    domains_data = analyzer.load_excel_data(excel_file)
    if not domains_data:
        return

    print(f"✅ 成功加载 {len(domains_data)} 个域名数据")

    # 优先级分类
    print("📊 开始进行优先级分类...")
    prioritized_domains = analyzer.prioritize_domains(domains_data)
    analyzer.save_priority_results(prioritized_domains)

    print(f"  高优先级: {len(prioritized_domains['high_priority'])}")
    print(f"  中优先级: {len(prioritized_domains['medium_priority'])}")
    print(f"  低优先级: {len(prioritized_domains['low_priority'])}")

    # 分析高优先级域名(使用代理)
    print("🚀 开始异步分析高优先级域名(支持代理)...")
    high_priority_results = asyncio.run(
        analyzer.analyze_domain_batch_async(prioritized_domains['high_priority'])
    )
    analyzer.save_batch_results(high_priority_results, "high_priority_with_proxy.json")

    print("✅ 第一阶段分析完成!")
    print(f"📈 分析了 {len(high_priority_results)} 个高优先级域名")

if __name__ == "__main__":
    main()