#!/bin/bash

set -euo pipefail

input="$(cat)"

if ! command -v python3 >/dev/null 2>&1; then
  exit 0
fi

# 导出 PPID 让 Python 子进程能读取（用于 session 级静音）
export PPID

python3 - "$input" <<'PY' 2>/dev/null || exit 0
import json
import os
import sys
import time
import glob as glob_mod

def safe_exit(code: int = 0) -> None:
    raise SystemExit(code)

def load_json(raw: str) -> dict:
    try:
        data = json.loads(raw)
        if isinstance(data, dict):
            return data
    except Exception:
        pass
    return {}

def load_yaml_proactive(path: str) -> bool:
    """检查 gstack config.yaml 的 proactive 标志（简单解析，不依赖 PyYAML）"""
    if not os.path.isfile(path):
        return True  # 默认开启
    try:
        with open(path, "r", encoding="utf-8") as f:
            for line in f:
                stripped = line.strip()
                if stripped.startswith("proactive:"):
                    val = stripped.split(":", 1)[1].strip().lower()
                    return val not in ("false", "no", "0", "off")
    except Exception:
        pass
    return True

def is_session_muted(sessions_dir: str) -> bool:
    """检查当前 session 是否被静音"""
    ppid = os.environ.get("PPID") or str(os.getppid())
    mute_file = os.path.join(sessions_dir, f"{ppid}.muted")
    return os.path.isfile(mute_file)

def check_rate_limit(sessions_dir: str, skill_name: str, cooldown_sec: int = 300) -> bool:
    """限速：同一 skill 5 分钟内不重复触发。返回 True = 允许触发"""
    rate_file = os.path.join(sessions_dir, f"rate_{skill_name}.ts")
    now = time.time()
    if os.path.isfile(rate_file):
        try:
            with open(rate_file, "r") as f:
                last = float(f.read().strip())
            if now - last < cooldown_sec:
                return False
        except Exception:
            pass
    # 写入当前时间戳
    try:
        os.makedirs(sessions_dir, exist_ok=True)
        with open(rate_file, "w") as f:
            f.write(str(now))
    except Exception:
        pass
    return True

def apply_supersedes(matches: list, skills: dict) -> list:
    """冲突解决：gstack skill 覆盖被 supersedes 的 generic skill"""
    superseded_names: set = set()
    for _, name, cfg in matches:
        sup = cfg.get("supersedes") or []
        if isinstance(sup, list):
            for s in sup:
                if isinstance(s, str):
                    superseded_names.add(s)
    if not superseded_names:
        return matches
    return [(p, n, c) for p, n, c in matches if n not in superseded_names]

# ── 检查 mute/unmute 关键词 ──
raw_input = sys.argv[1] if len(sys.argv) > 1 else "{}"
data = load_json(raw_input)
prompt = (data.get("prompt") or "").lower().strip()
if not prompt:
    safe_exit(0)

home = os.path.expanduser("~")
sessions_dir = os.path.join(home, ".gstack", "sessions")
gstack_config = os.path.join(home, ".gstack", "config.yaml")

# 静音/解除静音指令检测
mute_keywords = ["别推荐了", "stop suggesting", "别建议了", "too aggressive", "不要推荐"]
unmute_keywords = ["重新推荐", "be proactive again", "turn on suggestions", "恢复推荐"]

ppid = os.environ.get("PPID") or str(os.getppid())
mute_file = os.path.join(sessions_dir, f"{ppid}.muted")

for kw in unmute_keywords:
    if kw in prompt:
        try:
            os.remove(mute_file)
        except FileNotFoundError:
            pass
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print("🔔 gstack 主动推荐已恢复")
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        safe_exit(0)

for kw in mute_keywords:
    if kw in prompt:
        try:
            os.makedirs(sessions_dir, exist_ok=True)
            with open(mute_file, "w") as f:
                f.write(str(time.time()))
        except Exception:
            pass
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print("🔇 gstack 建议已静音（本次会话）")
        print('说 "重新推荐" 或 "be proactive again" 恢复')
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        safe_exit(0)

# ── 加载规则文件 ──
project_dir = os.environ.get("CLAUDE_PROJECT_DIR") or ""
rules_candidates: list[str] = []
if project_dir:
    rules_candidates.append(os.path.join(project_dir, ".claude", "skills", "skill-rules.json"))
rules_candidates.append(os.path.join(home, ".claude", "skills", "skill-rules.json"))

rules_file = next((p for p in rules_candidates if os.path.isfile(p)), None)
if not rules_file:
    safe_exit(0)

try:
    with open(rules_file, "r", encoding="utf-8") as f:
        rules = json.load(f)
except Exception:
    safe_exit(0)

skills = rules.get("skills") or {}
if not isinstance(skills, dict):
    safe_exit(0)

# ── 关键词匹配 ──
# 结构：(priority, name, cfg)
matches: list[tuple[str, str, dict]] = []
for name, cfg in skills.items():
    if not isinstance(name, str) or not isinstance(cfg, dict):
        continue
    priority = cfg.get("priority") or "medium"
    triggers = cfg.get("promptTriggers") or {}
    keywords = triggers.get("keywords") or []
    if not isinstance(keywords, list):
        continue
    for kw in keywords:
        if not isinstance(kw, str):
            continue
        needle = kw.lower().strip()
        if needle and needle in prompt:
            matches.append((str(priority), name, cfg))
            break

if not matches:
    safe_exit(0)

# ── 检查 gstack proactive 标志 + session 静音 ──
gstack_proactive = load_yaml_proactive(gstack_config)
session_muted = is_session_muted(sessions_dir)

# ── 先过滤掉不会实际输出的 gstack skills ──
MAX_GSTACK_PER_ROUND = 3
gstack_count = 0
active_matches: list[tuple[str, str, dict]] = []
filtered_gstack_names: set[str] = set()

for priority, name, cfg in matches:
    skill_type = cfg.get("type") or "domain"
    enforcement = cfg.get("enforcement") or "suggest"
    is_gstack = (skill_type == "gstack")

    if is_gstack:
        if session_muted:
            filtered_gstack_names.add(name)
            continue
        if not gstack_proactive and enforcement != "auto":
            filtered_gstack_names.add(name)
            continue
        if not check_rate_limit(sessions_dir, name):
            filtered_gstack_names.add(name)
            continue
        if gstack_count >= MAX_GSTACK_PER_ROUND:
            filtered_gstack_names.add(name)
            continue
        gstack_count += 1

    active_matches.append((priority, name, cfg))

# ── 冲突解决：只用实际存活的 gstack 的 supersedes ──
# 被过滤掉的 gstack 不能 supersede 别人
active_superseded: set[str] = set()
for _, name, cfg in active_matches:
    sup = cfg.get("supersedes") or []
    if isinstance(sup, list):
        for s in sup:
            if isinstance(s, str):
                active_superseded.add(s)

final_matches = [(p, n, c) for p, n, c in active_matches if n not in active_superseded]

# ── 分类：按 enforcement 分桶 ──
auto_skills: list[str] = []       # Tier 1: 直接执行
recommended_skills: list[str] = []  # Tier 2: 建议（默认 Y）
suggested_skills: list[str] = []   # Tier 3+: 仅提示

for priority, name, cfg in final_matches:
    skill_type = cfg.get("type") or "domain"
    enforcement = cfg.get("enforcement") or "suggest"
    is_gstack = (skill_type == "gstack")
    gstack_skill_name = cfg.get("gstackSkillName") or name

    if enforcement == "auto":
        auto_skills.append(gstack_skill_name if is_gstack else name)
    elif enforcement == "suggest-default-yes":
        recommended_skills.append(gstack_skill_name if is_gstack else name)
    else:
        p = priority.lower().strip()
        if p == "critical":
            auto_skills.append(name)
        elif p == "high":
            recommended_skills.append(name)
        else:
            suggested_skills.append(name)

# 去重
auto_skills = list(dict.fromkeys(auto_skills))
recommended_skills = list(dict.fromkeys(recommended_skills))
suggested_skills = list(dict.fromkeys(suggested_skills))

if not auto_skills and not recommended_skills and not suggested_skills:
    safe_exit(0)

# ── 输出 ──
print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
print("🎯 SKILL ACTIVATION CHECK")
print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
print("")

if auto_skills:
    print("🚀 INVOKE NOW (auto — 自动执行，无需确认):")
    for s in auto_skills:
        print(f'  → INVOKE NOW: Skill("{s}")')
    print("")

if recommended_skills:
    print("📚 RECOMMENDED (suggest — 建议执行，默认 Y):")
    for s in recommended_skills:
        print(f'  → RECOMMENDED: Skill("{s}")')
    print("")

if suggested_skills:
    print("💡 AVAILABLE (可用，需用户确认):")
    for s in suggested_skills:
        print(f'  → AVAILABLE: Skill("{s}")')
    print("")

if auto_skills:
    print("ACTION: IMMEDIATELY invoke auto skills, then suggest the rest")
elif recommended_skills:
    print("ACTION: Use Skill tool BEFORE responding (recommended)")
else:
    print("ACTION: Mention available skills to user")
print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

safe_exit(0)
PY

exit 0
