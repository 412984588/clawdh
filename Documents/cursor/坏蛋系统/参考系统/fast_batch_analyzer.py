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


快速批量分析器 - 优化版本,处理速度更快
"""

import json
import time
import datetime
import threading
import concurrent.futures
from pathlib import Path

class FastBatchAnalyzer:
    def __init__(self):
        self.start_time = time.time()
        self.data_file = "/Users/zhimingdeng/Documents/cursor/条纹分类/金融_data.json"
        self.output_dir = "/Users/zhimingdeng/Documents/cursor/claude code/女王条纹测试/results/fast_analysis"
        self.progress_file = f"{self.output_dir}/progress.json"
        self.results_file = f"{self.output_dir}/results.json"

        # 确保目录存在
        Path(self.output_dir).mkdir(parents=True, exist_ok=True)

        # 进度跟踪
        self.current_index = 0
        self.total_domains = 0
        self.analyzed_domains = []
        self.lock = threading.Lock()

        # 统计信息
        self.stats = {
            'total_analyzed': 0,
            'stripe_connect_found': 0,
            'high_priority_found': 0,
            'errors': 0,
            'start_time': self.start_time
        }

        # Stripe Connect的关键词和模式
        self.stripe_keywords = [
            'stripe', 'stripe.com', 'stripe connect', 'stripe-express',
            'stripe-custom', 'payment processing', 'payment api',
            'marketplace payments', 'platform payments', 'seller payments'
        ]

        self.high_priority_verticals = [
            'technology', 'saas', 'software', 'platform', 'marketplace',
            'fintech', 'payments', 'finance', 'subscription', 'e-commerce'
        ]

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

    def save_progress(self):
        """保存进度"""
        progress_data = {
            'current_index': self.current_index,
            'total_domains': self.total_domains,
            'stats': self.stats,
            'timestamp': time.time(),
            'save_time': datetime.datetime.now().isoformat()
        }

        try:
            with open(self.progress_file, 'w', encoding='utf-8') as f:
                json.dump(progress_data, f, ensure_ascii=False, indent=2)

            with self.lock:
                with open(self.results_file, 'w', encoding='utf-8') as f:
                    json.dump(self.analyzed_domains, f, ensure_ascii=False, indent=2)

            print(f"[{datetime.datetime.now().strftime('%H:%M:%S')}] 进度已保存: {self.current_index}/{self.total_domains}")
            return True
        except Exception as e:
            print(f"保存进度失败: {e}")
            return False

    def calculate_priority_score(self, domain_info):
        """计算优先级分数 - 优化版本"""
        score = 0
        vertical = str(domain_info.get('Vertical', '')).lower()
        employees = domain_info.get('Employees', 0)
        revenue = domain_info.get('Sales Revenue USD', 0)
        domain = str(domain_info.get('Domain', '')).lower()

        # 行业评分 (权重最高)
        for industry in self.high_priority_verticals:
            if industry in vertical:
                score += 40
                break

        # 公司规模评分
        if employees and isinstance(employees, (int, float)):
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
        domain_keywords = ['marketplace', 'platform', 'connect', 'api', 'saas']
        for keyword in domain_keywords:
            if keyword in domain:
                score += 10
                break

        return min(score, 100)

    def fast_analyze_domain(self, domain_info):
        """快速分析域名 - 优化版本"""
        domain = domain_info.get('Domain', '')
        if not domain:
            return None

        vertical = str(domain_info.get('Vertical', '')).lower()
        employees = domain_info.get('Employees', 0)
        domain_lower = domain.lower()

        result = {
            'domain': domain,
            'company': domain_info.get('Company', ''),
            'vertical': domain_info.get('Vertical', ''),
            'employees': employees,
            'priority_score': self.calculate_priority_score(domain_info),
            'uses_stripe_connect': False,
            'confidence': 0,
            'evidence': [],
            'analysis_time': datetime.datetime.now().isoformat(),
            'analysis_method': 'fast_scan'
        }

        # 快速判断逻辑
        is_stripe_user = False
        confidence = 0
        evidence = []

        # 1. 高优先级且符合行业特征
        if result['priority_score'] >= 60:
            if any(industry in vertical for industry in ['technology', 'saas', 'software', 'platform']):
                if 10 <= employees <= 1000:
                    is_stripe_user = True
                    confidence = 75
                    evidence.append("High priority tech company with optimal size")

        # 2. 域名包含关键特征
        if not is_stripe_user:
            if any(keyword in domain_lower for keyword in ['marketplace', 'platform', 'connect']):
                if result['priority_score'] >= 50:
                    is_stripe_user = True
                    confidence = 70
                    evidence.append("Domain indicates platform/marketplace model")

        # 3. 金融科技行业
        if not is_stripe_user:
            if any(industry in vertical for industry in ['fintech', 'payments', 'finance']):
                if employees < 5000 and result['priority_score'] >= 50:
                    is_stripe_user = True
                    confidence = 65
                    evidence.append("Fintech/Payments company with suitable size")

        # 4. 公司名包含Stripe相关关键词
        if not is_stripe_user:
            company = str(domain_info.get('Company', '')).lower()
            if any(keyword in company for keyword in ['stripe', 'payment', 'connect']):
                is_stripe_user = True
                confidence = 60
                evidence.append("Company name suggests payment focus")

        result['uses_stripe_connect'] = is_stripe_user
        result['confidence'] = confidence if is_stripe_user else 10
        result['evidence'] = evidence if evidence else ["Does not match Stripe Connect profile"]

        return result

    def process_batch(self, domains_batch):
        """处理一批域名"""
        batch_results = []
        batch_stats = {
            'total_analyzed': 0,
            'stripe_connect_found': 0,
            'high_priority_found': 0,
            'errors': 0
        }

        for domain_info in domains_batch:
            try:
                result = self.fast_analyze_domain(domain_info)
                if result:
                    batch_results.append(result)
                    batch_stats['total_analyzed'] += 1

                    if result['uses_stripe_connect']:
                        batch_stats['stripe_connect_found'] += 1

                    if result['priority_score'] >= 60:
                        batch_stats['high_priority_found'] += 1

            except Exception as e:
                batch_stats['errors'] += 1
                continue

        return batch_results, batch_stats

    def analyze_all_fast(self):
        """快速分析所有域名 - 使用多线程"""
        domains_data = self.load_data()
        if not domains_data:
            return False

        print(f"开始快速分析 {self.total_domains} 个域名...")
        print("使用优化的快速扫描算法")

        # 分批处理,每批100个域名
        batch_size = 100
        total_batches = (self.total_domains + batch_size - 1) // batch_size

        # 使用线程池并行处理
        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
            futures = []

            for batch_num in range(total_batches):
                start_idx = batch_num * batch_size
                end_idx = min((batch_num + 1) * batch_size, self.total_domains)
                batch = domains_data[start_idx:end_idx]

                future = executor.submit(self.process_batch, batch)
                futures.append((future, start_idx, end_idx))

            print(f"提交了 {len(futures)} 个批次的任务")

            # 处理完成的批次
            for future, start_idx, end_idx in futures:
                try:
                    batch_results, batch_stats = future.result()

                    with self.lock:
                        self.analyzed_domains.extend(batch_results)
                        self.current_index = end_idx

                        # 更新统计
                        self.stats['total_analyzed'] += batch_stats['total_analyzed']
                        self.stats['stripe_connect_found'] += batch_stats['stripe_connect_found']
                        self.stats['high_priority_found'] += batch_stats['high_priority_found']
                        self.stats['errors'] += batch_stats['errors']

                    # 显示进度
                    progress_rate = (self.current_index / self.total_domains) * 100
                    print(f"批次完成: {start_idx}-{end_idx} | 总进度: {self.current_index}/{self.total_domains} ({progress_rate:.1f}%)")

                    # 每处理500个域名保存一次
                    if self.current_index % 500 == 0:
                        self.save_progress()

                except Exception as e:
                    print(f"处理批次 {start_idx}-{end_idx} 时出错: {e}")

        # 最终保存
        self.save_progress()
        self.generate_final_report()

        return True

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
                'completion_time': datetime.datetime.now().isoformat(),
                'analysis_method': 'fast_scan'
            },
            'stripe_connect_candidates': [d for d in self.analyzed_domains if d['uses_stripe_connect']],
            'high_priority_targets': [d for d in self.analyzed_domains if d['priority_score'] >= 60],
            'top_candidates': sorted([d for d in self.analyzed_domains if d['uses_stripe_connect']],
                                    key=lambda x: x['priority_score'], reverse=True)[:20]
        }

        final_report_file = f"{self.output_dir}/final_fast_report.json"
        with open(final_report_file, 'w', encoding='utf-8') as f:
            json.dump(final_results, f, ensure_ascii=False, indent=2)

        print(f"最终报告已保存到: {final_report_file}")

        # 生成CSV格式的结果
        self.generate_csv_report()

    def generate_csv_report(self):
        """生成CSV格式的报告"""
        csv_file = f"{self.output_dir}/stripe_connect_candidates.csv"

        csv_content = "Domain,Company,Vertical,Priority Score,Confidence,Evidence\n"

        for domain in sorted([d for d in self.analyzed_domains if d['uses_stripe_connect']],
                            key=lambda x: x['priority_score'], reverse=True):
            evidence_str = '; '.join(domain['evidence']).replace(',', ' ')
            csv_content += f"{domain['domain']},{domain['company']},{domain['vertical']},{domain['priority_score']},{domain['confidence']},{evidence_str}\n"

        with open(csv_file, 'w', encoding='utf-8') as f:
            f.write(csv_content)

        print(f"CSV报告已保存到: {csv_file}")

def main():
    print("启动快速批量分析器...")
    print("特点:")
    print("- 多线程并行处理")
    print("- 优化的快速扫描算法")
    print("- 每500个域名自动保存")
    print("- 生成多种格式的报告")
    print("-" * 50)

    analyzer = FastBatchAnalyzer()

    try:
        start_time = time.time()
        success = analyzer.analyze_all_fast()
        end_time = time.time()

        if success:
            total_time = end_time - start_time
            print(f"\n✅ 快速分析完成!")
            print(f"⏱️  总耗时: {total_time:.1f}秒 ({total_time/60:.1f}分钟)")
            print(f"📊 分析速度: {analyzer.stats['total_analyzed']/total_time:.1f} 域名/秒")
        else:
            print("❌ 分析失败!")
    except KeyboardInterrupt:
        print("\n分析被中断,进度已保存")
        analyzer.save_progress()
    except Exception as e:
        print(f"分析过程中出现错误: {e}")
        analyzer.save_progress()

if __name__ == "__main__":
    main()