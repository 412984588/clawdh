#!/usr/bin/env python3
"""
Jenny团队启动器 - 女王条纹测试2项目
一键启动Jenny团队完整工作流程
"""

import os
import sys
import json
import time
import subprocess
import asyncio
from pathlib import Path
from datetime import datetime

def print_banner():
    """打印启动横幅"""
    banner = """
╔══════════════════════════════════════════════════════════════╗
║                    🚀 Jenny团队启动器 🚀                       ║
║                                                              ║
║                    女王条纹测试2 - 2.0.0                      ║
║                                                              ║
║  👥 团队: Jenny团队全面接管                                    ║
║  📅 时间: 2025-10-01 14:32:00                                ║
║  🎯 状态: 系统启动中...                                       ║
╚══════════════════════════════════════════════════════════════╝
"""
    print(banner)

def check_environment():
    """检查运行环境"""
    print("🔍 检查运行环境...")

    # 检查Python版本
    python_version = sys.version_info
    if python_version.major < 3 or python_version.minor < 8:
        print("❌ 需要Python 3.8或更高版本")
        return False
    else:
        print(f"✅ Python版本: {python_version.major}.{python_version.minor}.{python_version.micro}")

    # 检查必要目录
    required_dirs = ["src", "scripts", "config", "data", "logs", "results", "management_logs"]
    for dir_name in required_dirs:
        dir_path = Path(dir_name)
        if not dir_path.exists():
            dir_path.mkdir(parents=True, exist_ok=True)
            print(f"📁 创建目录: {dir_name}")
        else:
            print(f"✅ 目录存在: {dir_name}")

    # 检查必要文件
    required_files = [
        "requirements.txt",
        "src/stripe_detector.py",
        "scripts/jenny_team_manager.py",
        "config/detection_config.json",
        "management_logs/jenny_team_takeover.json"
    ]

    missing_files = []
    for file_name in required_files:
        file_path = Path(file_name)
        if not file_path.exists():
            missing_files.append(file_name)
        else:
            print(f"✅ 文件存在: {file_name}")

    if missing_files:
        print(f"❌ 缺少必要文件: {', '.join(missing_files)}")
        return False

    print("✅ 环境检查完成")
    return True

def install_dependencies():
    """安装依赖包"""
    print("\n📦 安装依赖包...")

    try:
        result = subprocess.run([
            sys.executable, "-m", "pip", "install", "-r", "requirements.txt"
        ], capture_output=True, text=True, timeout=300)

        if result.returncode == 0:
            print("✅ 依赖包安装完成")
            return True
        else:
            print(f"❌ 依赖包安装失败: {result.stderr}")
            return False
    except subprocess.TimeoutExpired:
        print("❌ 依赖包安装超时")
        return False
    except Exception as e:
        print(f"❌ 依赖包安装出错: {e}")
        return False

def initialize_team_management():
    """初始化团队管理系统"""
    print("\n👥 初始化Jenny团队管理系统...")

    try:
        # 运行团队管理器初始化
        result = subprocess.run([
            sys.executable, "scripts/jenny_team_manager.py"
        ], capture_output=True, text=True, timeout=60)

        if result.returncode == 0:
            print("✅ 团队管理系统初始化完成")
            print(result.stdout)
            return True
        else:
            print(f"❌ 团队管理系统初始化失败: {result.stderr}")
            return False
    except subprocess.TimeoutExpired:
        print("❌ 团队管理系统初始化超时")
        return False
    except Exception as e:
        print(f"❌ 团队管理系统初始化出错: {e}")
        return False

def run_system_check():
    """运行系统检查"""
    print("\n🔧 运行系统检查...")

    # 检查配置文件
    config_file = Path("config/detection_config.json")
    if config_file.exists():
        with open(config_file, 'r', encoding='utf-8') as f:
            config = json.load(f)
            print("✅ 配置文件加载成功")
            print(f"   - 检测模式: {len(config['detection_patterns'])} 类")
            print(f"   - 并发数: {config['scraping']['concurrent_requests']}")
            print(f"   - 超时时间: {config['scraping']['timeout']}秒")

    # 检查接管状态
    takeover_file = Path("management_logs/jenny_team_takeover.json")
    if takeover_file.exists():
        with open(takeover_file, 'r', encoding='utf-8') as f:
            takeover_info = json.load(f)
            print("✅ Jenny团队接管状态确认")
            print(f"   - 接管团队: {takeover_info['takeover_info']['team']}")
            print(f"   - 接管时间: {takeover_info['takeover_info']['takeover_time']}")
            print(f"   - 项目状态: {takeover_info['takeover_info']['status']}")

    # 检查日志系统
    log_dir = Path("logs")
    if log_dir.exists():
        log_files = list(log_dir.glob("*.log"))
        print(f"✅ 日志系统正常 (发现 {len(log_files)} 个日志文件)")

    print("✅ 系统检查完成")

def run_quick_test():
    """运行快速测试"""
    print("\n🧪 运行快速功能测试...")

    # 测试Stripe检测器
    try:
        result = subprocess.run([
            sys.executable, "-c",
            """
import sys
sys.path.append('src')
from stripe_detector import EnhancedStripeDetector
import asyncio

async def test():
    detector = EnhancedStripeDetector()
    result = await detector.analyze_domain('stripe.com')
    print(f'测试域名: stripe.com')
    print(f'检测到Stripe: {result.stripe_connect_detected}')
    print(f'置信度: {result.stripe_confidence:.2f}')
    print(f'总体评分: {result.overall_score:.2f}')

asyncio.run(test())
"""
        ], capture_output=True, text=True, timeout=30)

        if result.returncode == 0:
            print("✅ Stripe检测器测试通过")
            print(result.stdout)
        else:
            print(f"❌ Stripe检测器测试失败: {result.stderr}")

    except Exception as e:
        print(f"❌ Stripe检测器测试出错: {e}")

def display_dashboard():
    """显示项目仪表板"""
    print("\n📊 项目仪表板")
    print("=" * 50)

    # 读取接管信息
    takeover_file = Path("management_logs/jenny_team_takeover.json")
    if takeover_file.exists():
        with open(takeover_file, 'r', encoding='utf-8') as f:
            takeover_info = json.load(f)

        print(f"🎯 项目: {takeover_info['takeover_info']['project']}")
        print(f"👥 团队: {takeover_info['takeover_info']['team']}")
        print(f"📅 接管时间: {takeover_info['takeover_info']['takeover_time']}")
        print(f"🔄 状态: {takeover_info['takeover_info']['status']}")
        print(f"📦 版本: {takeover_info['takeover_info']['version']}")

        print("\n👷 团队成员:")
        for member in takeover_info['team_members']:
            print(f"  • {member['name']} - {member['role']}")

    # 读取任务信息
    tasks_file = Path("management_logs/project_tasks.json")
    if tasks_file.exists():
        with open(tasks_file, 'r', encoding='utf-8') as f:
            tasks = json.load(f)

        total_tasks = len(tasks)
        completed_tasks = len([t for t in tasks if t['status'] == 'completed'])
        in_progress_tasks = len([t for t in tasks if t['status'] == 'in_progress'])

        print(f"\n📋 任务统计:")
        print(f"  • 总任务数: {total_tasks}")
        print(f"  • 已完成: {completed_tasks}")
        print(f"  • 进行中: {in_progress_tasks}")
        print(f"  • 待处理: {total_tasks - completed_tasks - in_progress_tasks}")

        if total_tasks > 0:
            progress = (completed_tasks / total_tasks) * 100
            print(f"  • 完成进度: {progress:.1f}%")

    # 系统信息
    print(f"\n💻 系统信息:")
    print(f"  • Python版本: {sys.version.split()[0]}")
    print(f"  • 工作目录: {Path.cwd()}")
    print(f"  • 启动时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

def show_next_steps():
    """显示后续步骤"""
    print("\n🚀 后续操作建议")
    print("=" * 50)
    print("1. 📊 运行完整的Stripe检测:")
    print("   python src/stripe_detector.py")
    print()
    print("2. 👥 使用团队管理器:")
    print("   python scripts/jenny_team_manager.py")
    print()
    print("3. 📈 查看项目状态:")
    print("   cat management_logs/jenny_team_takeover.json")
    print()
    print("4. 📋 查看任务列表:")
    print("   cat management_logs/project_tasks.json")
    print()
    print("5. 📝 查看系统日志:")
    print("   tail -f logs/stripe_detector.log")
    print()
    print("6. 📊 查看检测结果:")
    print("   ls -la results/")
    print()
    print("🎉 Jenny团队，启动完成！系统已准备就绪！")

def main():
    """主函数"""
    print_banner()

    # 环境检查
    if not check_environment():
        print("\n❌ 环境检查失败，请解决上述问题后重试")
        return False

    # 询问是否安装依赖
    install_deps = input("\n📦 是否安装/更新依赖包? (y/N): ").lower().strip()
    if install_deps in ['y', 'yes']:
        if not install_dependencies():
            print("❌ 依赖安装失败，但继续启动...")

    # 初始化团队管理
    if not initialize_team_management():
        print("❌ 团队管理初始化失败，但继续启动...")

    # 系统检查
    run_system_check()

    # 快速测试
    run_test = input("\n🧪 是否运行快速功能测试? (Y/n): ").lower().strip()
    if run_test not in ['n', 'no']:
        run_quick_test()

    # 显示仪表板
    display_dashboard()

    # 显示后续步骤
    show_next_steps()

    return True

if __name__ == "__main__":
    try:
        success = main()
        if success:
            print("\n🎉 Jenny团队启动器执行完成！")
            sys.exit(0)
        else:
            print("\n❌ 启动失败")
            sys.exit(1)
    except KeyboardInterrupt:
        print("\n\n⚠️  用户中断启动过程")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ 启动过程中出现错误: {e}")
        sys.exit(1)