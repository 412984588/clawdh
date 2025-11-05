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


进度监控器 - 实时监控分析进度
"""

import json
import time
import datetime
import os

class ProgressMonitor:
    def __init__(self):
        self.output_dir = "/Users/zhimingdeng/Documents/cursor/claude code/女王条纹测试/results/auto_analysis"
        self.progress_file = f"{self.output_dir}/progress.json"
        self.status_file = f"{self.output_dir}/status_report.txt"

    def get_current_progress(self):
        """获取当前进度"""
        try:
            with open(self.progress_file, 'r', encoding='utf-8') as f:
                progress = json.load(f)
            return progress
        except:
            return None

    def display_progress(self):
        """显示当前进度"""
        progress = self.get_current_progress()
        if not progress:
            print("无法获取进度信息")
            return

        current_index = progress['current_index']
        total_domains = progress['total_domains']
        stats = progress['stats']

        # 计算进度百分比
        progress_rate = (current_index / total_domains) * 100

        # 计算运行时间
        start_time = stats['start_time']
        elapsed_time = time.time() - start_time
        hours = int(elapsed_time // 3600)
        minutes = int((elapsed_time % 3600) // 60)

        # 计算预计剩余时间
        if current_index > 0:
            time_per_domain = elapsed_time / current_index
            remaining_domains = total_domains - current_index
            remaining_time = time_per_domain * remaining_domains
            remaining_hours = int(remaining_time // 3600)
            remaining_minutes = int((remaining_time % 3600) // 60)
        else:
            remaining_hours = 0
            remaining_minutes = 0

        # 计算发现率
        stripe_connect_rate = (stats['stripe_connect_found'] / stats['total_analyzed']) * 100 if stats['total_analyzed'] > 0 else 0
        high_priority_rate = (stats['high_priority_found'] / stats['total_analyzed']) * 100 if stats['total_analyzed'] > 0 else 0

        # 显示进度条
        progress_bar_length = 50
        filled_length = int(progress_bar_length * current_index // total_domains)
        progress_bar = '█' * filled_length + '░' * (progress_bar_length - filled_length)

        print("\n" + "="*60)
        print(f"🚀 女王条纹测试项目 - 自动分析进度监控")
        print("="*60)
        print(f"📊 进度条: [{progress_bar}] {progress_rate:.1f}%")
        print(f"📈 分析数量: {current_index:,} / {total_domains:,}")
        print(f"⏱️  运行时间: {hours}小时{minutes}分钟")
        print(f"⏳ 预计剩余: {remaining_hours}小时{remaining_minutes}分钟")
        print(f"🎯 发现率: Stripe Connect {stripe_connect_rate:.1f}% | 高优先级 {high_priority_rate:.1f}%")
        print(f"📋 统计: 总分析={stats['total_analyzed']:,} | Stripe Connect={stats['stripe_connect_found']:,} | 高优先级={stats['high_priority_found']:,} | 错误={stats['errors']:,}")

        # 显示最近发现的Stripe Connect用户
        if stats['stripe_connect_found'] > 0:
            print(f"\n✅ 最近发现的Stripe Connect用户:")
            try:
                with open(f"{self.output_dir}/current_results.json", 'r', encoding='utf-8') as f:
                    results = json.load(f)
                recent_stripe_users = [d for d in results[-10:] if d.get('uses_stripe_connect')]
                for domain in recent_stripe_users[-3:]:
                    print(f"   • {domain['domain']} (优先级: {domain['priority_score']})")
            except:
                pass

        print("\n" + "="*60)

    def monitor_continuously(self):
        """持续监控进度"""
        print("启动进度监控器...")
        print("按 Ctrl+C 停止监控")
        print()

        try:
            while True:
                self.display_progress()
                time.sleep(30)  # 每30秒更新一次
        except KeyboardInterrupt:
            print("\n监控已停止")

def main():
    monitor = ProgressMonitor()

    # 检查是否有进度文件
    if not os.path.exists(monitor.progress_file):
        print("没有找到分析进度文件")
        print("请先运行: python3 utils/full_auto_analyzer.py")
        return

    # 显示当前进度
    monitor.display_progress()

    # 询问是否持续监控
    try:
        choice = input("\n是否开始持续监控? (y/n): ").lower().strip()
        if choice == 'y':
            monitor.monitor_continuously()
    except KeyboardInterrupt:
        print("\n监控已停止")

if __name__ == "__main__":
    main()