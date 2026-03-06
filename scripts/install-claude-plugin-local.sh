#!/bin/bash
# install-claude-plugin-local.sh
# 本地安装 Claude Code 插件到 Claude Code 系统

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PLUGIN_DIR="$PROJECT_ROOT/packages/claude-marketplace"

echo "🔌 安装 Voice Hub Claude Code 插件..."

# 检查 Claude Code 插件目录
CLAUDE_DIR="${CLAUDE_DIR:-$HOME/.claude}"
if [ ! -d "$CLAUDE_DIR" ]; then
  echo "❌ Claude Code 目录不存在: $CLAUDE_DIR"
  echo "   请设置 CLAUDE_DIR 环境变量或确认 Claude Code 已安装"
  exit 1
fi

PLUGINS_DIR="$CLAUDE_DIR/plugins/voice-hub"
echo "📁 目标目录: $PLUGINS_DIR"

# 创建插件目录
mkdir -p "$PLUGINS_DIR"

# 构建插件
echo "🔨 构建插件..."
cd "$PLUGIN_DIR"
pnpm build

# 复制文件
echo "📋 复制插件文件..."
cp -r "$PLUGIN_DIR/dist" "$PLUGINS_DIR/"
cp -r "$PLUGIN_DIR/src" "$PLUGINS_DIR/"
cp -r "$PLUGIN_DIR/.claude-plugin" "$PLUGINS_DIR/"
cp -r "$PLUGIN_DIR/.claude" "$PLUGINS_DIR/"
cp -r "$PLUGIN_DIR/skills" "$PLUGINS_DIR/"
cp -r "$PLUGIN_DIR/bin" "$PLUGINS_DIR/"
cp "$PLUGIN_DIR/package.json" "$PLUGINS_DIR/"
cp "$PLUGIN_DIR/local-marketplace.json" "$PLUGINS_DIR/"
cp "$PROJECT_ROOT/.env.example" "$PLUGINS_DIR/.env.example"

# 注册到 Claude Code (如果支持)
REGISTRY_FILE="$CLAUDE_DIR/plugins/registry.json"
if [ -f "$REGISTRY_FILE" ]; then
  echo "📝 注册插件到 Claude Code..."
  if command -v jq &> /dev/null; then
    jq --arg id "voice-hub" --arg path "$PLUGINS_DIR" \
      '.plugins[$id] = {"path": $path, "enabled": true, "version": "0.2.0"}' \
      "$REGISTRY_FILE" > "$REGISTRY_FILE.tmp" && mv "$REGISTRY_FILE.tmp" "$REGISTRY_FILE"
  else
    echo "⚠️  jq 未安装，请手动注册插件"
  fi
fi

echo "✅ 安装完成！"
echo ""
echo "📌 下一步："
echo "   1. 运行 smoke: ./scripts/smoke-claude-plugin-install.sh"
echo "   2. 配置环境变量: cp $PLUGINS_DIR/.env.example $CLAUDE_DIR/plugins/voice-hub/.env"
echo "   3. 重启 Claude Code 并重新加载插件"
