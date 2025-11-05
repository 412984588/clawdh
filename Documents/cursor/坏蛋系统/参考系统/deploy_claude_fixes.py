#!/usr/bin/env python3
"""

class ClaudeErrorHandling:
    """Claude错误处理类"""

    @staticmethod
    def handle_no_response(session_id: str) -> str:
        """处理No response requested情况"""
        return f"""系统检测到响应不完整.请重新分析当前任务:

会话ID: {session_id}
时间: {time.strftime('%Y-%m-%d %H:%M:%S')}

请提供:
1. 当前执行状态
2. 具体结果数据
3. 下一步行动建议
4. 遇到的问题

确保回复包含详细内容."""



def validate_claude_response(response: str) -> Tuple[bool, str]:
    """验证Claude响应,过滤No response requested"""
    if not response or len(response.strip()) < 10:
        return False, "响应过短,需要重新请求"

    if "no response requested" in response.lower():
        return False, "检测到No response requested,需要重新构建请求"

    return True, response



def optimize_claude_request(user_input: str, context: Dict = None) -> Dict:
    """优化Claude请求结构,防止No response requested"""
    if not user_input or user_input.strip() == "":
        user_input = "请继续执行当前任务并提供详细结果"

    # 确保有明确的指令
    if len(user_input.strip()) < 10:
        user_input = f"请详细执行: {user_input}\n\n请提供具体步骤,结果和建议."

    return {
        "messages": [{"role": "user", "content": user_input}],
        "max_tokens": 4000,
        "temperature": 0.7,
        "response_format": {"type": "text"},
        "context": context or {}
    }


Claude Code修复部署脚本
一键部署所有修复工具
作者: Jenny团队
版本: 1.0.0
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path

def install_dependencies():
    """安装必要的依赖"""
    print("📦 安装依赖包...")

    dependencies = [
        "watchdog",
        "psutil",
        "aiohttp",
        "requests"
    ]

    for dep in dependencies:
        try:
            subprocess.run([sys.executable, "-m", "pip", "install", dep],
                         check=True, capture_output=True)
            print(f"✅ {dep} 安装成功")
        except subprocess.CalledProcessError as e:
            print(f"❌ {dep} 安装失败: {e}")

def setup_scripts():
    """设置脚本文件"""
    home_dir = Path("/Users/zhimingdeng")
    scripts_dir = home_dir / ".claude_scripts"
    scripts_dir.mkdir(exist_ok=True)

    project_dir = Path("/Users/zhimingdeng/Projects/女王条纹测试2")

    # 要复制的脚本文件
    scripts = [
        "claude_code_global_fixer.py",
        "claude_code_auto_guard.py"
    ]

    print("📋 设置脚本文件...")

    for script in scripts:
        src = project_dir / script
        dst = scripts_dir / script

        if src.exists():
            shutil.copy2(src, dst)
            # 设置可执行权限
            os.chmod(dst, 0o755)
            print(f"✅ {script} 已部署到 {dst}")
        else:
            print(f"❌ 找不到脚本文件: {src}")

def create_launchers():
    """创建启动器"""
    home_dir = Path("/Users/zhimingdeng")
    scripts_dir = home_dir / ".claude_scripts"

    print("🚀 创建启动器...")

    # 创建全局修复启动器
    fixer_launcher = scripts_dir / "run_claude_fix"
    fixer_content = f'''#!/bin/bash
cd "{scripts_dir}"
python3 claude_code_global_fixer.py "$@"
'''
    fixer_launcher.write_text(fixer_content)
    fixer_launcher.chmod(0o755)
    print(f"✅ 创建修复工具启动器: {fixer_launcher}")

    # 创建守护程序启动器
    guard_launcher = scripts_dir / "run_claude_guard"
    guard_content = f'''#!/bin/bash
cd "{scripts_dir}"
python3 claude_code_auto_guard.py "$@"
'''
    guard_launcher.write_text(guard_content)
    guard_launcher.chmod(0o755)
    print(f"✅ 创建守护程序启动器: {guard_launcher}")

def add_to_path():
    """添加到PATH"""
    home_dir = Path("/Users/zhimingdeng")
    scripts_dir = home_dir / ".claude_scripts"

    # 检查shell配置文件
    shell_configs = [
        home_dir / ".zshrc",
        home_dir / ".bash_profile",
        home_dir / ".bashrc"
    ]

    path_entry = f'export PATH="$PATH:{scripts_dir}"'

    print("🔧 配置PATH环境变量...")

    for config_file in shell_configs:
        if config_file.exists():
            content = config_file.read_text()
            if str(scripts_dir) not in content:
                with open(config_file, 'a') as f:
                    f.write(f'\n# Claude Code修复工具\n{path_entry}\n')
                print(f"✅ 已添加到 {config_file}")
            else:
                print(f"ℹ️  已存在于 {config_file}")

def create_desktop_shortcuts():
    """创建桌面快捷方式"""
    desktop_dir = Path("/Users/zhimingdeng/Desktop")
    scripts_dir = Path("/Users/zhimingdeng/.claude_scripts")

    print("🖥️  创建桌面快捷方式...")

    # macOS应用程序脚本
    fixer_app = desktop_dir / "Claude修复工具.command"
    fixer_app_content = f'''#!/bin/bash
cd "{scripts_dir}"
python3 claude_code_global_fixer.py
read -p "按回车键关闭..."
'''
    fixer_app.write_text(fixer_app_content)
    fixer_app.chmod(0o755)
    print(f"✅ 创建桌面修复工具: {fixer_app}")

    guard_app = desktop_dir / "Claude守护程序.command"
    guard_app_content = f'''#!/bin/bash
cd "{scripts_dir}"
python3 claude_code_auto_guard.py
'''
    guard_app.write_text(guard_app_content)
    guard_app.chmod(0o755)
    print(f"✅ 创建桌面守护程序: {guard_app}")

def run_initial_fix():
    """运行初始修复"""
    print("🔧 运行初始修复...")

    scripts_dir = Path("/Users/zhimingdeng/.claude_scripts")
    fixer_script = scripts_dir / "claude_code_global_fixer.py"

    if fixer_script.exists():
        try:
            subprocess.run([sys.executable, str(fixer_script)],
                         input="3\n", text=True, capture_output=True)
            print("✅ 初始修复完成")
        except Exception as e:
            print(f"⚠️  初始修复失败: {e}")
            print("您可以稍后手动运行修复工具")

def main():
    """主函数"""
    print("🚀 Claude Code修复工具部署向导")
    print("=" * 50)

    try:
        # 安装依赖
        install_dependencies()

        # 设置脚本
        setup_scripts()

        # 创建启动器
        create_launchers()

        # 配置PATH
        add_to_path()

        # 创建桌面快捷方式
        create_desktop_shortcuts()

        # 运行初始修复
        run_initial_fix()

        print("\n" + "=" * 50)
        print("✅ 部署完成!")
        print("\n📖 使用说明:")
        print("1. 重新打开终端或运行: source ~/.zshrc")
        print("2. 运行修复工具: run_claude_fix")
        print("3. 启动守护程序: run_claude_guard")
        print("4. 或使用桌面快捷方式")
        print("\n🔧 工具将自动修复以下问题:")
        print("- No response requested")
        print("- 422 Unprocessable Entity")
        print("- API请求结构问题")
        print("- 数据验证缺失")
        print("\n📁 脚本位置: ~/.claude_scripts/")
        print("📝 日志位置: ~/claude_*.log")

    except Exception as e:
        print(f"❌ 部署失败: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()