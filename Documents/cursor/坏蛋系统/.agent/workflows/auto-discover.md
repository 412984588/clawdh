---
description: 自动发现和验证个人收款平台
---

# 自动发现和验证工作流

此工作流用于持续发现和验证符合4项标准的个人收款平台。

## 前置检查
// turbo
1. 检查环境变量配置
```bash
cd /Users/zhimingdeng/Documents/cursor/坏蛋系统
cat .env | grep -E "EXA_API_KEY|ZHIPUAI_API_KEY" | head -2
```

## 运行测试批次 (5个平台)
// turbo
2. 测试小批次验证
```bash
cd /Users/zhimingdeng/Documents/cursor/坏蛋系统
python claude_auto_workflow.py --test
```

## 运行单批次 (50个平台)
// turbo
3. 运行完整批次
```bash
cd /Users/zhimingdeng/Documents/cursor/坏蛋系统
python claude_auto_workflow.py --batch --batch-size=50
```

## 启动无限循环模式
// turbo
4. 启动持续运行 (每2分钟一批)
```bash
cd /Users/zhimingdeng/Documents/cursor/坏蛋系统
nohup python claude_auto_workflow.py --batch-size=50 --interval=120 > workflow.log 2>&1 &
echo $! > workflow.pid
echo "Started with PID: $(cat workflow.pid)"
```

## 查看运行状态
// turbo
5. 检查运行日志
```bash
cd /Users/zhimingdeng/Documents/cursor/坏蛋系统
tail -100 workflow.log
```

## 查看统计数据
// turbo
6. 检查验证统计
```bash
cd /Users/zhimingdeng/Documents/cursor/坏蛋系统
cat workflow_stats.json | python -m json.tool
echo "已验证平台数: $(cat verified_platforms.json | python -c 'import json,sys;d=json.load(sys.stdin);print(len(d.get(\"platforms\",[])))')"
```

## 停止运行
// turbo
7. 停止工作流
```bash
cd /Users/zhimingdeng/Documents/cursor/坏蛋系统
if [ -f workflow.pid ]; then kill $(cat workflow.pid) && rm workflow.pid; echo "已停止"; else echo "无运行中的进程"; fi
```
