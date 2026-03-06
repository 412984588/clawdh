#!/bin/bash
# 扫描重复文件

echo "=== 1. 扫描文件名重复 ==="
echo ""

# 查找文件名重复
find . -type f -name "*.md" | sed 's!.*/!!' | sort | uniq -d | while read name; do
  echo "🔁 重复文件名: $name"
  find . -type f -name "$name" | sed 's!^\./!  - !'
  echo ""
done

echo "=== 2. 查找根目录重复文件（已在分类文件夹中存在） ==="
echo ""

# 检查根目录的文件是否在子文件夹中存在
for file in *.md; do
  if [ -f "$file" ]; then
    basename_file=$(basename "$file")
    if find . -type f -name "$basename_file" | wc -l | grep -q "^2$"; then
      echo "📄 根目录重复: $basename_file"
      find . -type f -name "$basename_file" | sed 's!^\./!  - !'
      echo ""
    fi
  fi
done
