#!/usr/bin/env python3
"""

def create_robust_api_request(endpoint: str, data: Dict, headers: Dict = None) -> Dict:
    """创建健壮的API请求结构"""
    # 默认请求头
    default_headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Agent": "Claude-Code-Fixer/2.0.0"
    }

    if headers:
        default_headers.update(headers)

    # 验证请求数据
    is_valid, errors = validate_request_data(data)
    if not is_valid:
        raise ValueError(f"请求数据验证失败: {', '.join(errors)}")

    return {
        "url": endpoint,
        "method": "POST",
        "headers": default_headers,
        "json": data,
        "timeout": 30,
        "max_retries": 3
    }



import asyncio
import time

async def retry_with_backoff(func, *args, max_retries=3, backoff_factor=2, **kwargs):
    """带退避算法的重试机制"""
    for attempt in range(max_retries):
        try:
            result = await func(*args, **kwargs) if asyncio.iscoroutinefunction(func) else func(*args, **kwargs)

            # 检查422错误
            if isinstance(result, dict) and result.get("status_code") == 422:
                if attempt < max_retries - 1:
                    wait_time = backoff_factor ** attempt
                    logger.warning(f"422错误,{wait_time}秒后重试 (尝试 {attempt + 1}/{max_retries})")
                    await asyncio.sleep(wait_time)
                    continue

            return result

        except Exception as e:
            if attempt < max_retries - 1:
                wait_time = backoff_factor ** attempt
                logger.warning(f"请求失败,{wait_time}秒后重试: {e}")
                await asyncio.sleep(wait_time)
                continue
            else:
                raise e

    raise Exception(f"重试{max_retries}次后仍然失败")



def handle_422_error(response_data: Dict, original_request: Dict) -> Dict:
    """处理422 Unprocessable Entity错误"""
    if response_data.get("status_code") == 422:
        errors = response_data.get("errors", {})

        # 分析错误原因
        error_details = []
        for field, messages in errors.items():
            if isinstance(messages, list):
                error_details.append(f"{field}: {', '.join(messages)}")
            else:
                error_details.append(f"{field}: {messages}")

        # 生成修复建议
        return {
            "success": False,
            "error_type": "validation_error",
            "error_details": error_details,
            "fix_suggestions": [
                "检查请求数据格式",
                "验证必填字段",
                "确认字段类型正确",
                "检查字段长度限制"
            ],
            "recovery_request": create_recovery_request(original_request, error_details)
        }

    return {"success": True}

def create_recovery_request(original_request: Dict, errors: List[str]) -> Dict:
    """创建恢复请求"""
    return {
        "user_message": f"""之前的请求遇到验证错误,需要修复:

错误详情:
{chr(10).join(errors)}

请根据错误信息修正请求并重新执行.
""",
        "context": {**original_request.get("context", {}), "error_recovery": True},
        "retry_after": 2
    }



def validate_request_data(data: Dict, rules: Dict = None) -> Tuple[bool, List[str]]:
    """验证请求数据,防止422错误"""
    errors = []

    if rules is None:
        rules = {
            "required": ["user_message", "session_id"],
            "string_fields": ["user_message"],
            "max_length": {"user_message": 10000}
        }

    # 检查必填字段
    for field in rules.get("required", []):
        if field not in data or not data[field]:
            errors.append(f"必填字段缺失: {field}")

    # 检查字符串字段
    for field in rules.get("string_fields", []):
        if field in data and not isinstance(data[field], str):
            errors.append(f"字段类型错误: {field} 应为字符串")

    # 检查长度限制
    for field, max_len in rules.get("max_length", {}).items():
        if field in data and len(str(data[field])) > max_len:
            errors.append(f"字段长度超限: {field} 超过 {max_len} 字符")

    return len(errors) == 0, errors


批量网站分析器
针对Excel文件中的7730个网站进行Stripe Connect分析
支持Cloudflare代理(仅用于批量筛选功能)
"""

import json
import time
import sys
import os
import asyncio
import aiohttp
import logging
from datetime import datetime

# 导入女王条纹测试2专用代理管理器
from utils.proxy_manager import get_queen_proxy_manager, is_batch_operation

class BatchStripeConnectAnalyzer:
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
                score += 40
            elif 'finance' in vertical.lower() or 'payments' in vertical.lower():
                score += 30

        # 公司规模评分
        if employees:
            if 50 <= employees <= 1000:  # 中小型公司更可能使用Stripe Connect
                score += 30
            elif employees < 50:  # 小型公司
                score += 20
            elif employees > 1000:  # 大公司可能自建
                score += 10

        # 收入评分
        if revenue and revenue != 'NaN':
            try:
                if isinstance(revenue, str) and '$' in revenue:
                    revenue_num = float(revenue.replace('$', '').replace(',', ''))
                else:
                    revenue_num = float(revenue)

                if 1000000 <= revenue_num <= 50000000:  # 中等收入
                    score += 20
                elif revenue_num < 1000000:  # 小收入
                    score += 15
            except:
                pass

        # 域名特征评分
        domain_lower = domain.lower()
        if any(keyword in domain_lower for keyword in ['marketplace', 'platform', 'connect', 'api']):
            score += 10

        return min(score, 100)  # 最高100分

    def analyze_domain_batch(self, domains, batch_size=50):
        """批量分析域名"""
        results = []

        print(f"开始批量分析 {len(domains)} 个域名...")

        for i, domain_info in enumerate(domains):
            domain = domain_info['domain']
            print(f"分析进度: {i+1}/{len(domains)} - {domain}")

            try:
                result = self.analyze_single_domain(domain_info)
                results.append(result)

                # 批量保存结果
                if (i + 1) % batch_size == 0:
                    self.save_batch_results(results, f"batch_{i+1}.json")
                    print(f"已保存 {i+1} 个结果")

                # 避免请求过于频繁
                time.sleep(2)

            except Exception as e:
                print(f"分析 {domain} 时出错: {e}")
                results.append({
                    'domain': domain,
                    'error': str(e),
                    'uses_stripe_connect': False,
                    'confidence': 0
                })

        return results

    def analyze_single_domain(self, domain_info):
        """分析单个域名"""
        domain = domain_info['domain']

        # 模拟分析过程 - 实际应用中会调用爬虫工具
        analysis_result = {
            'domain': domain,
            'company': domain_info['company'],
            'vertical': domain_info['vertical'],
            'priority_score': domain_info['priority_score'],
            'uses_stripe_connect': False,
            'confidence': 0,
            'evidence': [],
            'analysis_timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
        }

        # 检查已知的Stripe Connect用户模式
        if self.is_likely_stripe_connect_user(domain_info):
            analysis_result['uses_stripe_connect'] = True
            analysis_result['confidence'] = 75
            analysis_result['evidence'] = [
                f"High priority score: {domain_info['priority_score']}",
                f"Industry: {domain_info['vertical']}",
                "Fits Stripe Connect target profile"
            ]

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

    def save_batch_results(self, results, filename):
        """保存批量结果"""
        output_path = f"/Users/zhimingdeng/Documents/cursor/claude code/女王条纹测试/results/batches/{filename}"

        # 确保目录存在
        os.makedirs(os.path.dirname(output_path), exist_ok=True)

        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)

    def save_priority_results(self, prioritized_domains):
        """保存优先级分类结果"""
        output_path = "/Users/zhimingdeng/Documents/cursor/claude code/女王条纹测试/results/prioritized_domains.json"

        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(prioritized_domains, f, ensure_ascii=False, indent=2)

        print(f"优先级分类结果已保存到: {output_path}")
        print(f"高优先级: {len(prioritized_domains['high_priority'])}")
        print(f"中优先级: {len(prioritized_domains['medium_priority'])}")
        print(f"低优先级: {len(prioritized_domains['low_priority'])}")

    async def async_analyze_domains(self, domains_data):
        """异步批量分析域名(支持代理)"""
        if not self.proxy_manager.is_enabled():
            self.logger.info("代理未启用,使用直连")
            return self.analyze_domain_batch(domains_data)

        self.logger.info("启用Cloudflare代理进行批量分析")

        async def analyze_single_domain(domain_info):
            """分析单个域名"""
            url = f"http://{domain_info['domain']}"
            start_time = datetime.now()

            try:
                # 创建带代理的会话
                async with await self.proxy_manager.create_session() as session:
                    headers = {
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                        'Accept-Language': 'en-US,en;q=0.9',
                        'Connection': 'keep-alive'
                    }

                    async with session.get(url, headers=headers, timeout=30) as response:
                        if response.status == 200:
                            content = await response.text()
                            return self.analyze_stripe_indicators(content, domain_info)
                        else:
                            return {
                                'domain': domain_info['domain'],
                                'error': f'HTTP {response.status}',
                                'proxy_used': True
                            }

            except Exception as e:
                self.logger.error(f"分析失败 {domain_info['domain']}: {e}")
                return {
                    'domain': domain_info['domain'],
                    'error': str(e),
                    'proxy_used': True
                }

        # 并发分析所有域名
        tasks = []
        for domain_info in domains_data:
            task = analyze_single_domain(domain_info)
            tasks.append(task)

        results = await asyncio.gather(*tasks, return_exceptions=True)

        # 过滤有效结果
        valid_results = []
        for result in results:
            if isinstance(result, dict) and 'domain' in result:
                valid_results.append(result)

        return valid_results

    def analyze_domain_batch_async(self, domains_data):
        """异步批量分析入口"""
        return asyncio.run(self.async_analyze_domains(domains_data))

    def analyze_stripe_indicators(self, content, domain_info):
        """分析Stripe指标"""
        indicators = {
            'domain': domain_info['domain'],
            'company': domain_info['company'],
            'uses_stripe_connect': False,
            'confidence': 0,
            'evidence': [],
            'analysis_timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
        }

        content_lower = content.lower()

        # 检查Stripe Connect信号
        found_signals = []
        for signal in self.stripe_connect_signals:
            if signal in content_lower:
                found_signals.append(signal)

        if found_signals:
            indicators['uses_stripe_connect'] = True
            indicators['confidence'] = min(len(found_signals) * 20, 90)
            indicators['evidence'] = found_signals

        return indicators

def main():
    analyzer = BatchStripeConnectAnalyzer()

    # 加载数据
    excel_file = "/Users/zhimingdeng/Documents/cursor/条纹分类/金融.xlsx"
    domains_data = analyzer.load_excel_data(excel_file)

    if not domains_data:
        print("无法加载数据,退出")
        return

    print(f"成功加载 {len(domains_data)} 个域名数据")

    # 优先级分类
    print("开始进行优先级分类...")
    prioritized_domains = analyzer.prioritize_domains(domains_data)
    analyzer.save_priority_results(prioritized_domains)

    # 创建批次目录
    os.makedirs("/Users/zhimingdeng/Documents/cursor/claude code/女王条纹测试/results/batches", exist_ok=True)

    # 分析高优先级域名
    print("开始分析高优先级域名...")
    high_priority_results = analyzer.analyze_domain_batch(prioritized_domains['high_priority'])
    analyzer.save_batch_results(high_priority_results, "high_priority_final.json")

    print("第一阶段分析完成!")
    print(f"分析了 {len(high_priority_results)} 个高优先级域名")

if __name__ == "__main__":
    main()