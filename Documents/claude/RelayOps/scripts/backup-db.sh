#!/usr/bin/env bash
# RelayOps 数据库备份脚本
# 用法: ./scripts/backup-db.sh [-o 输出目录] [-f custom|plain]
# 环境变量: DATABASE_URL 或 SUPABASE_DB_URL
set -euo pipefail

# ─── 默认值 ────────────────────────────────────────────────────────────────
OUTPUT_DIR="./backups"
FORMAT="custom"  # custom (pg_restore) 或 plain (.sql.gz)

# ─── 参数解析 ──────────────────────────────────────────────────────────────
while getopts "o:f:h" opt; do
  case $opt in
    o) OUTPUT_DIR="$OPTARG" ;;
    f) FORMAT="$OPTARG" ;;
    h)
      echo "用法: $0 [-o 输出目录] [-f custom|plain]"
      echo "  -o  输出目录 (默认: ./backups)"
      echo "  -f  格式: custom (default) 或 plain"
      echo ""
      echo "环境变量: DATABASE_URL 或 SUPABASE_DB_URL"
      exit 0
      ;;
    *) echo "未知参数: -$OPTARG" >&2; exit 1 ;;
  esac
done

# ─── 数据库 URL ────────────────────────────────────────────────────────────
DB_URL="${DATABASE_URL:-${SUPABASE_DB_URL:-}}"
if [ -z "$DB_URL" ]; then
  echo "错误: 请设置 DATABASE_URL 或 SUPABASE_DB_URL 环境变量" >&2
  exit 1
fi

# ─── 验证格式 ──────────────────────────────────────────────────────────────
if [ "$FORMAT" != "custom" ] && [ "$FORMAT" != "plain" ]; then
  echo "错误: 格式必须是 custom 或 plain" >&2
  exit 1
fi

# ─── 创建输出目录 ──────────────────────────────────────────────────────────
mkdir -p "$OUTPUT_DIR"

# ─── 生成文件名 ────────────────────────────────────────────────────────────
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
if [ "$FORMAT" = "custom" ]; then
  FILENAME="relayops_${TIMESTAMP}.dump"
else
  FILENAME="relayops_${TIMESTAMP}.sql.gz"
fi
FILEPATH="${OUTPUT_DIR}/${FILENAME}"

# ─── 执行备份 ──────────────────────────────────────────────────────────────
echo "开始备份..."
echo "  格式: ${FORMAT}"
echo "  输出: ${FILEPATH}"

if [ "$FORMAT" = "custom" ]; then
  pg_dump "$DB_URL" \
    --format=custom \
    --no-owner \
    --no-acl \
    --verbose \
    --file="$FILEPATH" 2>&1 | tail -5
else
  pg_dump "$DB_URL" \
    --format=plain \
    --no-owner \
    --no-acl \
    | gzip > "$FILEPATH"
fi

# ─── 验证 ──────────────────────────────────────────────────────────────────
if [ ! -f "$FILEPATH" ]; then
  echo "错误: 备份文件未生成" >&2
  exit 1
fi

FILE_SIZE=$(du -h "$FILEPATH" | cut -f1)
echo ""
echo "备份完成!"
echo "  文件: ${FILEPATH}"
echo "  大小: ${FILE_SIZE}"
echo ""
echo "恢复命令: ./scripts/restore-db.sh ${FILEPATH}"
