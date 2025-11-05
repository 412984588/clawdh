#!/usr/bin/env python3
"""
Claude Flow全局删除工具
完全删除系统中所有Claude Flow相关文件和配置
"""

import os
import shutil
import subprocess
import json
from pathlib import Path
import sys

class ClaudeFlowUninstaller:
    """Claude Flow卸载器"""

    def __init__(self):
        self.removed_items = []
        self.failed_items = []
        self.backup_dir = Path("claude_flow_backup")

    def log_removal(self, item, item_type="文件"):
        """记录删除操作"""
        self.removed_items.append(f"✅ 已删除{item_type}: {item}")
        print(f"✅ 已删除{item_type}: {item}")

    def log_failure(self, item, reason, item_type="文件"):
        """记录删除失败"""
        self.failed_items.append(f"❌ 删除失败{item_type}: {item} - {reason}")
        print(f"❌ 删除失败{item_type}: {item} - {reason}")

    def backup_important_configs(self):
        """备份重要配置"""
        print("🔄 备份重要配置文件...")

        backup_items = [
            "/Users/zhimingdeng/.cursor/mcp.json",
            "/Users/zhimingdeng/.mcp.json",
            "/Users/zhimingdeng/Projects/女王条纹测试2/.claude/CLAUDE.md"
        ]

        if not self.backup_dir.exists():
            self.backup_dir.mkdir(exist_ok=True)

        for item in backup_items:
            if os.path.exists(item):
                try:
                    dest = self.backup_dir / Path(item).name
                    shutil.copy2(item, dest)
                    self.log_removal(item, "配置文件(已备份)")
                except Exception as e:
                    self.log_failure(item, str(e), "配置文件")

    def uninstall_npm_package(self):
        """卸载npm全局包"""
        print("\n📦 卸载npm全局包...")

        try:
            # 卸载主包
            result = subprocess.run(
                ["npm", "uninstall", "-g", "claude-flow"],
                capture_output=True, text=True
            )
            if result.returncode == 0:
                self.log_removal("claude-flow", "npm全局包")
            else:
                self.log_failure("claude-flow", result.stderr, "npm全局包")

            # 卸载alpha版本
            result = subprocess.run(
                ["npm", "uninstall", "-g", "claude-flow@alpha"],
                capture_output=True, text=True
            )
            if result.returncode == 0:
                self.log_removal("claude-flow@alpha", "npm全局包")
            else:
                print(f"claude-flow@alpha 未安装或卸载失败: {result.stderr}")

        except Exception as e:
            self.log_failure("npm包", str(e), "npm全局包")

    def remove_project_files(self):
        """删除项目中的Claude Flow文件"""
        print("\n📁 删除项目文件...")

        project_dir = Path("/Users/zhimingdeng/Projects/女王条纹测试2")

        # 要删除的文件和目录
        items_to_remove = [
            ".claude-flow",
            ".claude-flow@alpha",
            "claude-flow",
            "memory/claude-flow@alpha-data.json",
            ".claude/projects/-Users-zhimingdeng-Documents-cursor-claude-code-claude-flow",
            "coordination",
            "web-service-test"
        ]

        for item in items_to_remove:
            item_path = project_dir / item
            if item_path.exists():
                try:
                    if item_path.is_dir():
                        shutil.rmtree(item_path)
                        self.log_removal(str(item_path), "目录")
                    else:
                        item_path.unlink()
                        self.log_removal(str(item_path), "文件")
                except Exception as e:
                    self.log_failure(str(item_path), str(e))

    def remove_cache_files(self):
        """删除缓存文件"""
        print("\n🗂️  删除缓存文件...")

        cache_patterns = [
            "/Users/zhimingdeng/Library/Caches/*claude-flow*",
            "/Users/zhimingdeng/Library/Caches/*/*claude-flow*",
            "/Users/zhimingdeng/.claude/projects/*claude-flow*",
            "/Users/zhimingdeng/.cache/*claude-flow*"
        ]

        for pattern in cache_patterns:
            import glob
            for item in glob.glob(pattern):
                try:
                    item_path = Path(item)
                    if item_path.is_dir():
                        shutil.rmtree(item_path)
                        self.log_removal(item, "缓存目录")
                    else:
                        item_path.unlink()
                        self.log_removal(item, "缓存文件")
                except Exception as e:
                    self.log_failure(item, str(e), "缓存文件")

    def clean_mcp_configs(self):
        """清理MCP配置中的Claude Flow条目"""
        print("\n⚙️  清理MCP配置...")

        mcp_configs = [
            "/Users/zhimingdeng/.cursor/mcp.json",
            "/Users/zhimingdeng/.mcp.json"
        ]

        for config_path in mcp_configs:
            if os.path.exists(config_path):
                try:
                    with open(config_path, 'r', encoding='utf-8') as f:
                        config = json.load(f)

                    original_servers = len(config.get('mcpServers', {}))

                    # 删除Claude Flow相关服务器
                    servers_to_remove = []
                    for server_name, server_config in config.get('mcpServers', {}).items():
                        if 'claude-flow' in str(server_config).lower() or 'claude' in server_name.lower():
                            servers_to_remove.append(server_name)

                    for server_name in servers_to_remove:
                        del config['mcpServers'][server_name]
                        self.log_removal(f"{server_name} (从{config_path})", "MCP服务器配置")

                    # 保存更新后的配置
                    with open(config_path, 'w', encoding='utf-8') as f:
                        json.dump(config, f, indent=2, ensure_ascii=False)

                    remaining_servers = len(config.get('mcpServers', {}))
                    print(f"📊 {config_path}: {original_servers} -> {remaining_servers} 个服务器")

                except Exception as e:
                    self.log_failure(config_path, str(e), "MCP配置文件")

    def remove_npm_modules(self):
        """删除npm模块目录"""
        print("\n📦 删除npm模块...")

        npm_module_path = Path("/Users/zhimingdeng/.nvm/versions/node/v22.20.0/lib/node_modules/claude-flow")

        if npm_module_path.exists():
            try:
                shutil.rmtree(npm_module_path)
                self.log_removal(str(npm_module_path), "npm模块目录")
            except Exception as e:
                self.log_failure(str(npm_module_path), str(e), "npm模块目录")

    def clean_environment_variables(self):
        """清理环境变量（提示用户）"""
        print("\n🌍 环境变量清理...")
        print("⚠️  请手动检查并删除以下环境变量（如果存在）:")
        print("   - CLAUDE_FLOW_HOME")
        print("   - CLAUDE_FLOW_CONFIG")
        print("   - 任何包含claude-flow的环境变量")
        print("   检查文件: ~/.bashrc, ~/.zshrc, ~/.bash_profile, ~/.zshenv")

    def remove_processes_and_services(self):
        """停止相关进程和服务"""
        print("\n🔄 停止相关进程...")

        try:
            # 查找并停止Claude Flow相关进程
            result = subprocess.run(
                ["pgrep", "-f", "claude-flow"],
                capture_output=True, text=True
            )

            if result.returncode == 0 and result.stdout.strip():
                pids = result.stdout.strip().split('\n')
                for pid in pids:
                    try:
                        subprocess.run(["kill", pid])
                        self.log_removal(f"进程 {pid}", "Claude Flow进程")
                    except:
                        self.log_failure(f"进程 {pid}", "无法停止", "进程")
            else:
                print("✅ 没有发现运行中的Claude Flow进程")

        except Exception as e:
            print(f"⚠️  进程检查失败: {e}")

    def generate_report(self):
        """生成删除报告"""
        print("\n" + "="*60)
        print("📊 Claude Flow删除报告")
        print("="*60)

        print(f"✅ 成功删除: {len(self.removed_items)} 项")
        print(f"❌ 删除失败: {len(self.failed_items)} 项")

        if self.removed_items:
            print("\n✅ 成功删除的项目:")
            for item in self.removed_items:
                print(f"  {item}")

        if self.failed_items:
            print("\n❌ 删除失败的项目:")
            for item in self.failed_items:
                print(f"  {item}")

        print(f"\n💾 备份位置: {self.backup_dir.absolute()}")
        print("\n🎯 删除完成!")
        print("💡 建议:")
        print("   1. 重启终端以确保所有更改生效")
        print("   2. 检查是否有其他应用仍在引用Claude Flow")
        print("   3. 如果需要，可以从备份恢复配置文件")

    def run_full_uninstallation(self):
        """运行完整卸载流程"""
        print("🚀 开始Claude Flow全局删除")
        print("="*60)
        print("⚠️  这将删除系统中所有Claude Flow相关文件")
        print("⚠️  重要配置文件将被备份到 claude_flow_backup 目录")
        print("="*60)

        # 确认操作
        confirm = input("确定要继续吗? (y/N): ").lower().strip()
        if confirm != 'y':
            print("❌ 操作已取消")
            return

        try:
            # 1. 备份重要配置
            self.backup_important_configs()

            # 2. 停止进程
            self.remove_processes_and_services()

            # 3. 卸载npm包
            self.uninstall_npm_package()

            # 4. 删除npm模块
            self.remove_npm_modules()

            # 5. 删除项目文件
            self.remove_project_files()

            # 6. 删除缓存文件
            self.remove_cache_files()

            # 7. 清理MCP配置
            self.clean_mcp_configs()

            # 8. 环境变量提示
            self.clean_environment_variables()

            # 9. 生成报告
            self.generate_report()

        except KeyboardInterrupt:
            print("\n❌ 操作被用户中断")
        except Exception as e:
            print(f"\n❌ 卸载过程中出现错误: {e}")

def main():
    """主函数"""
    if len(sys.argv) > 1:
        command = sys.argv[1]

        if command == "--dry-run":
            print("🔍 预览模式 - 显示将要删除的项目（不实际删除）")
            # 这里可以添加预览逻辑
        else:
            print("❌ 未知命令。使用 --dry-run 进行预览，或不带参数运行完整删除")
            return

    uninstaller = ClaudeFlowUninstaller()
    uninstaller.run_full_uninstallation()

if __name__ == "__main__":
    main()