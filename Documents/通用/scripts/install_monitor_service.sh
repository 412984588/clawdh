#!/bin/bash
# OpenClaw 监控代理安装脚本
# 用于安装 systemd 服务和定时器

set -e  # 遇到错误立即退出

echo "========================================"
echo "OpenClaw 监控代理安装"
echo "========================================"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

# 检查是否以 root 身份运行（systemd 需要）
if [ "$EUID" -ne 0 ]; then
    echo "⚠️  警告：本脚本需要 root 权限来安装 systemd 服务"
    echo "    但会创建用户级 systemd 服务（~/.config/systemd/user/）"
    echo ""
    USER_MODE=true
else
    echo "✅ 以 root 身份运行（系统级 systemd）"
    USER_MODE=false
fi
echo ""

# 1. 创建 systemd 目录
echo "📝 步骤 1: 创建 systemd 目录..."
if [ "$USER_MODE" = true ]; then
    # 用户级 systemd
    SYSTEMD_DIR="$HOME/.config/systemd/user"
    mkdir -p "$SYSTEMD_DIR"
    echo "  ✅ 用户级 systemd 目录: $SYSTEMD_DIR"
else
    # 系统级 systemd
    SYSTEMD_DIR="/usr/local/lib/systemd/system"
    mkdir -p "$SYSTEMD_DIR"
    echo "  ✅ 系统级 systemd 目录: $SYSTEMD_DIR"
fi
echo ""

# 2. 复制服务文件
echo "📝 步骤 2: 复制服务文件..."
cp systemd/openclaw-monitor.service "$SYSTEMD_DIR/"
cp systemd/openclaw-monitor.timer "$SYSTEMD_DIR/"
echo "  ✅ 服务文件已复制"
echo ""

# 3. 重新加载 systemd 配置
echo "📝 步骤 3: 重新加载 systemd 配置..."
if [ "$USER_MODE" = true ]; then
    # 用户级 systemd
    systemctl --user daemon-reload
    echo "  ✅ 用户级 systemd 已重新加载"
else
    # 系统级 systemd
    systemctl daemon-reload
    echo "  ✅ 系统级 systemd 已重新加载"
fi
echo ""

# 4. 启用并启动定时器
echo "📝 步骤 4: 启用并启动定时器..."
if [ "$USER_MODE" = true ]; then
    # 用户级 systemd
    systemctl --user enable openclaw-monitor.timer
    systemctl --user start openclaw-monitor.timer
    echo "  ✅ 定时器已启用并启动（用户级）"
else
    # 系统级 systemd
    systemctl enable openclaw-monitor.timer
    systemctl start openclaw-monitor.timer
    echo "  ✅ 定时器已启用并启动（系统级）"
fi
echo ""

# 5. 验证安装
echo "📝 步骤 5: 验证安装..."
if [ "$USER_MODE" = true ]; then
    systemctl --user status openclaw-monitor.timer --no-pager
else
    systemctl status openclaw-monitor.timer --no-pager
fi
echo ""

echo "========================================"
echo "安装完成！"
echo "========================================"
echo ""
echo "监控代理将每 5 分钟运行一次"
echo ""
echo "管理命令："
if [ "$USER_MODE" = true ]; then
    echo "  查看状态: systemctl --user status openclaw-monitor.timer"
    echo "  查看日志: tail -f logs/openclaw-monitor.log"
    echo "  停止监控: systemctl --user stop openclaw-monitor.timer"
    echo "  禁用监控: systemctl --user disable openclaw-monitor.timer"
else
    echo "  查看状态: systemctl status openclaw-monitor.timer"
    echo "  查看日志: tail -f logs/openclaw-monitor.log"
    echo "  停止监控: systemctl stop openclaw-monitor.timer"
    echo "  禁用监控: systemctl disable openclaw-monitor.timer"
fi
echo ""
echo "手动测试："
echo "  python3 scripts/openclaw_monitor.py"
