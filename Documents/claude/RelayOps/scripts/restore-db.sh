#!/usr/bin/env bash
# RelayOps 数据库恢复脚本
# 用法: ./scripts/restore-db.sh <备份文件> [--force]
# 环境变量: DATABASE_URL 或 SUPABASE_DB_URL
#
# 警告: --force 跳过确认提示，仅用于自动化流程。
#        生产环境恢复前务必确认目标数据库正确。
set -euo pipefail

# ─── 参数解析 ──────────────────────────────────────────────────────────────
BACKUP_FILE=""
FORCE=false

for arg in "$@"; do
  case $arg in
    --force) FORCE=true ;;
    -h|--help)
      echo "用法: $0 <备份文件> [--force]"
      echo "  <备份文件>  .dump (custom) 或 .sql.gz (plain) 格式"
      echo "  --force     跳过确认提示 (仅用于自动化，生产环境慎用)"
      echo ""
      echo "环境变量: DATABASE_URL 或 SUPABASE_DB_URL"
      exit 0
      ;;
    *)
      if [ -z "$BACKUP_FILE" ]; then
        BACKUP_FILE="$arg"
      else
        echo "错误: 多余参数: $arg" >&2
        exit 1
      fi
      ;;
  esac
done

# ─── 验证备份文件 ──────────────────────────────────────────────────────────
if [ -z "$BACKUP_FILE" ]; then
  echo "错误: 请指定备份文件路径" >&2
  echo "用法: $0 <备份文件> [--force]" >&2
  exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
  echo "错误: 备份文件不存在: ${BACKUP_FILE}" >&2
  exit 1
fi

# ─── 数据库 URL ────────────────────────────────────────────────────────────
DB_URL="${DATABASE_URL:-${SUPABASE_DB_URL:-}}"
if [ -z "$DB_URL" ]; then
  echo "错误: 请设置 DATABASE_URL 或 SUPABASE_DB_URL 环境变量" >&2
  exit 1
fi

# ─── 检测格式 ──────────────────────────────────────────────────────────────
if [[ "$BACKUP_FILE" == *.dump ]]; then
  FORMAT="custom"
elif [[ "$BACKUP_FILE" == *.sql.gz ]]; then
  FORMAT="plain"
else
  echo "错误: 无法识别文件格式，支持 .dump (custom) 和 .sql.gz (plain)" >&2
  exit 1
fi

# ─── 安全确认 ──────────────────────────────────────────────────────────────
# 从 URL 中提取主机名用于显示（隐藏密码）
DB_HOST=$(echo "$DB_URL" | sed -E 's|.*@([^:/]+).*|\1|')

echo "========================================="
echo "  RelayOps 数据库恢复"
echo "========================================="
echo "  备份文件: ${BACKUP_FILE}"
echo "  格式:     ${FORMAT}"
echo "  目标主机: ${DB_HOST}"
echo "========================================="
echo ""
echo "警告: 此操作将覆盖目标数据库中的现有数据!"
echo ""

if [ "$FORCE" = false ]; then
  read -p "确认恢复? 输入 YES 继续: " CONFIRM
  if [ "$CONFIRM" != "YES" ]; then
    echo "已取消恢复操作"
    exit 0
  fi
fi

# ─── 执行恢复 ──────────────────────────────────────────────────────────────
echo ""
echo "开始恢复..."

if [ "$FORMAT" = "custom" ]; then
  pg_restore "$BACKUP_FILE" \
    --dbname="$DB_URL" \
    --clean \
    --if-exists \
    --no-owner \
    --no-acl \
    --verbose 2>&1 | tail -10
else
  gunzip -c "$BACKUP_FILE" | psql "$DB_URL" --quiet
fi

# ─── 连通性检查 ────────────────────────────────────────────────────────────
echo ""
echo "验证数据库连通性..."
if psql "$DB_URL" -c "SELECT 1 AS health_check;" > /dev/null 2>&1; then
  echo "数据库连通性检查通过"
else
  echo "警告: 数据库连通性检查失败，请手动验证" >&2
  exit 1
fi

echo ""
echo "恢复完成!"
echo "建议: 立即验证关键业务数据完整性"
