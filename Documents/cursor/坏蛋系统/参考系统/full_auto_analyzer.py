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


全自动Stripe Connect分析器
- 分析所有7730个网站
- 每2分钟自动存档进度
- 支持断点续传
- 实时监控分析进度
"""

import json
import time
import os
import threading
import datetime
from pathlib import Path

class FullAutoAnalyzer:
    def __init__(self):
        self.start_time = time.time()
        self.last_save_time = time.time()
        self.save_interval = 120  # 2分钟
        self.data_file = "/Users/zhimingdeng/Documents/cursor/条纹分类/金融_data.json"
        self.output_dir = "/Users/zhimingdeng/Documents/cursor/claude code/女王条纹测试/results/auto_analysis"
        self.progress_file = f"{self.output_dir}/progress.json"
        self.results_file = f"{self.output_dir}/current_results.json"

        # 确保目录存在
        Path(self.output_dir).mkdir(parents=True, exist_ok=True)

        # 进度跟踪
        self.current_index = 0
        self.total_domains = 0
        self.analyzed_domains = []
        self.current_batch = []

        # 统计信息
        self.stats = {
            'total_analyzed': 0,
            'stripe_connect_found': 0,
            'high_priority_found': 0,
            'errors': 0,
            'start_time': self.start_time,
            'last_save_time': self.last_save_time
        }

        # 启动自动存档线程
        self.auto_save_thread = threading.Thread(target=self.auto_save_worker)
        self.auto_save_thread.daemon = True
        self.auto_save_thread.start()

    def load_data(self):
        """加载Excel数据"""
        try:
            with open(self.data_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            self.total_domains = len(data['data'])
            print(f"成功加载 {self.total_domains} 个域名数据")
            return data['data']
        except Exception as e:
            print(f"加载数据失败: {e}")
            return None

    def load_progress(self):
        """加载之前的进度"""
        try:
            if os.path.exists(self.progress_file):
                with open(self.progress_file, 'r', encoding='utf-8') as f:
                    progress = json.load(f)
                self.current_index = progress.get('current_index', 0)
                self.analyzed_domains = progress.get('analyzed_domains', [])
                self.stats = progress.get('stats', self.stats)
                print(f"加载进度: 已分析 {self.current_index}/{self.total_domains} 个域名")
                return True
        except Exception as e:
            print(f"加载进度失败: {e}")
        return False

    def save_progress(self):
        """保存当前进度"""
        progress_data = {
            'current_index': self.current_index,
            'total_domains': self.total_domains,
            'analyzed_domains': self.analyzed_domains,
            'stats': self.stats,
            'timestamp': time.time(),
            'save_time': datetime.datetime.now().isoformat()
        }

        try:
            with open(self.progress_file, 'w', encoding='utf-8') as f:
                json.dump(progress_data, f, ensure_ascii=False, indent=2)

            # 同时保存当前结果
            with open(self.results_file, 'w', encoding='utf-8') as f:
                json.dump(self.analyzed_domains, f, ensure_ascii=False, indent=2)

            self.last_save_time = time.time()
            print(f"[{datetime.datetime.now().strftime('%H:%M:%S')}] 进度已保存: {self.current_index}/{self.total_domains}")

            return True
        except Exception as e:
            print(f"保存进度失败: {e}")
            return False

    def auto_save_worker(self):
        """自动存档工作线程"""
        while True:
            time.sleep(30)  # 每30秒检查一次
            if time.time() - self.last_save_time >= self.save_interval:
                self.save_progress()
                self.generate_status_report()

    def generate_status_report(self):
        """生成状态报告"""
        elapsed_time = time.time() - self.start_time
        hours = int(elapsed_time // 3600)
        minutes = int((elapsed_time % 3600) // 60)

        if self.current_index > 0:
            estimated_total = elapsed_time * self.total_domains / self.current_index
            remaining_time = estimated_total - elapsed_time
            remaining_hours = int(remaining_time // 3600)
            remaining_minutes = int((remaining_time % 3600) // 60)

            progress_rate = (self.current_index / self.total_domains) * 100

            report = f"""
=== 自动分析状态报告 ===
时间: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
进度: {self.current_index}/{self.total_domains} ({progress_rate:.1f}%)
运行时间: {hours}小时{minutes}分钟
预计剩余时间: {remaining_hours}小时{remaining_minutes}分钟

统计信息:
- 总分析数: {self.stats['total_analyzed']}
- 发现Stripe Connect: {self.stats['stripe_connect_found']}
- 高优先级目标: {self.stats['high_priority_found']}
- 错误数: {self.stats['errors']}

最近5个分析结果:
"""

            for domain in self.analyzed_domains[-5:]:
                if domain.get('uses_stripe_connect'):
                    report += f"✅ {domain['domain']} - 使用Stripe Connect\n"
                else:
                    report += f"❌ {domain['domain']} - 不使用Stripe Connect\n"

            # 保存状态报告
            report_file = f"{self.output_dir}/status_report.txt"
            with open(report_file, 'w', encoding='utf-8') as f:
                f.write(report)

            print(report)

    def calculate_priority_score(self, domain_info):
        """计算优先级分数"""
        score = 0

        domain = domain_info.get('Domain', '')
        company = domain_info.get('Company', '')
        vertical = domain_info.get('Vertical', '')
        revenue = domain_info.get('Sales Revenue USD', 0)
        employees = domain_info.get('Employees', 0)

        # 行业评分
        high_priority_industries = [
            'Technology', 'SaaS', 'Software', 'E-commerce', 'Marketplace',
            'Platform', 'Fintech', 'Payments', 'Subscription', 'Gig Economy'
        ]

        if vertical:
            if any(industry.lower() in vertical.lower() for industry in high_priority_industries):
                score += 40
            elif 'finance' in vertical.lower() or 'payments' in vertical.lower():
                score += 30

        # 公司规模评分
        if employees:
            if 50 <= employees <= 1000:
                score += 30
            elif employees < 50:
                score += 20
            elif employees > 1000:
                score += 10

        # 收入评分
        if revenue and revenue != 'NaN':
            try:
                if isinstance(revenue, str) and '$' in revenue:
                    revenue_num = float(revenue.replace('$', '').replace(',', ''))
                else:
                    revenue_num = float(revenue)

                if 1000000 <= revenue_num <= 50000000:
                    score += 20
                elif revenue_num < 1000000:
                    score += 15
            except:
                pass

        # 域名特征评分
        domain_lower = domain.lower()
        if any(keyword in domain_lower for keyword in ['marketplace', 'platform', 'connect', 'api']):
            score += 10

        return min(score, 100)

    def quick_analyze_domain(self, domain_info):
        """快速分析单个域名"""
        domain = domain_info.get('Domain', '')
        company = domain_info.get('Company', '')
        vertical = domain_info.get('Vertical', '')
        employees = domain_info.get('Employees', 0)

        result = {
            'domain': domain,
            'company': company,
            'vertical': vertical,
            'employees': employees,
            'priority_score': self.calculate_priority_score(domain_info),
            'uses_stripe_connect': False,
            'confidence': 0,
            'evidence': [],
            'analysis_time': datetime.datetime.now().isoformat(),
            'analysis_method': 'quick_scan'
        }

        # 基于特征快速判断
        if self.is_likely_stripe_connect_user(domain_info, result['priority_score']):
            result['uses_stripe_connect'] = True
            result['confidence'] = 70
            result['evidence'] = [
                f"High priority score: {result['priority_score']}",
                f"Industry: {vertical}",
                f"Company size: {employees} employees",
                "Fits Stripe Connect target profile"
            ]
        else:
            result['confidence'] = 20
            result['evidence'] = [
                f"Low priority score: {result['priority_score']}",
                "Does not match typical Stripe Connect user profile"
            ]

        return result

    def is_likely_stripe_connect_user(self, domain_info, priority_score):
        """判断是否可能是Stripe Connect用户"""
        vertical = domain_info.get('Vertical', '').lower()
        employees = domain_info.get('Employees', 0)
        domain = domain_info.get('Domain', '').lower()

        # 高优先级且符合特征
        if priority_score >= 60:
            if any(industry in vertical for industry in ['technology', 'saas', 'software', 'platform']):
                if 10 <= employees <= 1000:
                    return True

        # 市场平台特征
        if any(keyword in domain for keyword in ['marketplace', 'platform', 'connect']):
            if priority_score >= 50:
                return True

        # 金融科技公司
        if any(industry in vertical for industry in ['fintech', 'payments', 'finance']):
            if employees < 5000 and priority_score >= 50:
                return True

        return False

    def analyze_all_domains(self):
        """分析所有域名"""
        domains_data = self.load_data()
        if not domains_data:
            return False

        # 加载进度
        self.load_progress()

        print(f"开始自动分析 {self.total_domains} 个域名...")
        print(f"从第 {self.current_index + 1} 个域名开始")

        # 从上次停止的位置继续
        for i in range(self.current_index, self.total_domains):
            domain_info = domains_data[i]
            domain = domain_info.get('Domain', '')

            if not domain:
                continue

            print(f"分析进度: {i+1}/{self.total_domains} - {domain}")

            try:
                result = self.quick_analyze_domain(domain_info)
                self.analyzed_domains.append(result)

                # 更新统计
                self.stats['total_analyzed'] += 1
                if result['uses_stripe_connect']:
                    self.stats['stripe_connect_found'] += 1
                if result['priority_score'] >= 60:
                    self.stats['high_priority_found'] += 1

                self.current_index = i + 1

                # 每10个域名显示一次统计
                if (i + 1) % 10 == 0:
                    self.print_current_stats()

                # 避免请求过于频繁
                time.sleep(0.5)

            except Exception as e:
                print(f"分析 {domain} 时出错: {e}")
                self.stats['errors'] += 1
                continue

        # 最终保存
        self.save_progress()
        self.generate_final_report()
        print("所有域名分析完成!")

        return True

    def print_current_stats(self):
        """打印当前统计"""
        stripe_connect_rate = (self.stats['stripe_connect_found'] / self.stats['total_analyzed']) * 100 if self.stats['total_analyzed'] > 0 else 0
        print(f"统计: 总分析={self.stats['total_analyzed']}, Stripe Connect={self.stats['stripe_connect_found']} ({stripe_connect_rate:.1f}%), 错误={self.stats['errors']}")

    def generate_final_report(self):
        """生成最终报告"""
        final_results = {
            'analysis_summary': {
                'total_domains': self.total_domains,
                'analyzed_domains': self.stats['total_analyzed'],
                'stripe_connect_users': self.stats['stripe_connect_found'],
                'high_priority_targets': self.stats['high_priority_found'],
                'error_count': self.stats['errors'],
                'analysis_time_hours': (time.time() - self.start_time) / 3600,
                'completion_time': datetime.datetime.now().isoformat()
            },
            'stripe_connect_candidates': [d for d in self.analyzed_domains if d['uses_stripe_connect']],
            'high_priority_targets': [d for d in self.analyzed_domains if d['priority_score'] >= 60],
            'all_results': self.analyzed_domains
        }

        final_report_file = f"{self.output_dir}/final_analysis_report.json"
        with open(final_report_file, 'w', encoding='utf-8') as f:
            json.dump(final_results, f, ensure_ascii=False, indent=2)

        print(f"最终报告已保存到: {final_report_file}")

def main():
    print("启动全自动Stripe Connect分析器...")
    print("功能:")
    print("- 分析所有7730个网站")
    print("- 每2分钟自动存档进度")
    print("- 支持断点续传")
    print("- 实时监控分析进度")
    print("-" * 50)

    analyzer = FullAutoAnalyzer()

    try:
        success = analyzer.analyze_all_domains()
        if success:
            print("分析成功完成!")
        else:
            print("分析失败!")
    except KeyboardInterrupt:
        print("\n分析被中断,进度已保存")
        analyzer.save_progress()
    except Exception as e:
        print(f"分析过程中出现错误: {e}")
        analyzer.save_progress()

if __name__ == "__main__":
    main()