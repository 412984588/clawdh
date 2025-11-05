#!/bin/bash
# 女王条纹测试2 - 代理检查Hook

echo "👑 女王条纹测试2代理模式激活"
echo "检查Cloudflare代理状态..."

# 检查代理配置
if [ -f "/Users/zhimingdeng/Projects/女王条纹测试2/utils/proxy_manager.py" ]; then
    python3 -c "
import sys
sys.path.append('/Users/zhimingdeng/Projects/女王条纹测试2')
from utils.proxy_manager import get_queen_proxy_manager
proxy = get_queen_proxy_manager()
print(f'代理状态: {"启用" if proxy.is_enabled() else "禁用"}')
"
else
    echo "⚠️ 代理管理器未找到"
fi
