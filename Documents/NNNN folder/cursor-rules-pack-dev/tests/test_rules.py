"""
test_rules.py — pytest 测试套件
验证 Cursor Rules Pack 的文件质量和完整性
"""

import json
import os
import zipfile
from pathlib import Path

import pytest

# 项目根目录
BASE_DIR = Path(__file__).parent.parent
RULES_DIR = BASE_DIR / "rules"
DIST_DIR = BASE_DIR / "dist"
TIERS_FILE = BASE_DIR / "tiers.json"
LICENSE_FILE = BASE_DIR / "LICENSE"

EXTRA_PATHS = {
    "framework-selection-guide": BASE_DIR / "docs" / "framework-selection-guide.md",
    "customization-templates": BASE_DIR / "docs" / "customization-templates",
}

# 所有 20 个 rules 目录名
ALL_RULES = [
    "nextjs",
    "nextjs-supabase",
    "fastapi-python",
    "react-typescript",
    "vue-nuxt",
    "django-python",
    "chrome-extension-mv3",
    "tauri-rust",
    "flutter-dart",
    "golang",
    "solidity-smart-contracts",
    "ai-python-ml",
    "nodejs-express",
    "svelte-sveltekit",
    "unity-csharp",
    "monorepo-turborepo",
    "saas-nextjs-stripe",
    "data-science-jupyter",
    "landing-page-tailwind",
    "ios-swiftui",
]

# 每个 .cursorrules 必须包含的关键词（至少一个）
REQUIRED_KEYWORDS = [
    "Code Style",
    "TypeScript",
    "Python",
    "Error Handling",
    "Naming",
    "What Cursor",
    "Pattern",
    "Swift",
    "Rust",
    "Go",
    "Solidity",
    "C#",
]


class TestDirectoryStructure:
    """测试目录结构完整性"""

    def test_all_rules_dirs_exist(self):
        """验证所有 20 个 rules 目录都存在"""
        missing = []
        for rule_name in ALL_RULES:
            rule_dir = RULES_DIR / rule_name
            if not rule_dir.is_dir():
                missing.append(rule_name)

        assert not missing, f"以下 rules 目录缺失: {missing}"

    def test_rules_dir_count(self):
        """验证 rules/ 目录下恰好有 20 个子目录"""
        if not RULES_DIR.exists():
            pytest.skip("rules/ 目录不存在")

        subdirs = [d for d in RULES_DIR.iterdir() if d.is_dir()]
        assert len(subdirs) == 20, f"期望 20 个 rules 目录，实际有 {len(subdirs)} 个"


class TestRulesFiles:
    """测试每个 .cursorrules 文件的存在和质量"""

    def test_each_cursorrules_file_exists(self):
        """验证每个 rules 目录都有 .cursorrules 文件"""
        missing = []
        for rule_name in ALL_RULES:
            cursorrules_file = RULES_DIR / rule_name / ".cursorrules"
            if not cursorrules_file.exists():
                missing.append(f"rules/{rule_name}/.cursorrules")

        assert not missing, f"以下 .cursorrules 文件缺失:\n" + "\n".join(missing)

    def test_each_readme_exists(self):
        """验证每个 rules 目录都有 README.md 文件"""
        missing = []
        for rule_name in ALL_RULES:
            readme_file = RULES_DIR / rule_name / "README.md"
            if not readme_file.exists():
                missing.append(f"rules/{rule_name}/README.md")

        assert not missing, f"以下 README.md 文件缺失:\n" + "\n".join(missing)

    def test_cursorrules_minimum_length(self):
        """每个 .cursorrules 文件必须 >= 100 行"""
        short_files = []
        for rule_name in ALL_RULES:
            cursorrules_file = RULES_DIR / rule_name / ".cursorrules"
            if not cursorrules_file.exists():
                continue

            with open(cursorrules_file, "r", encoding="utf-8") as f:
                lines = f.readlines()

            line_count = len(lines)
            if line_count < 100:
                short_files.append(f"{rule_name}: {line_count} 行 (需要 >= 100)")

        assert not short_files, f"以下文件行数不足:\n" + "\n".join(short_files)

    def test_cursorrules_has_required_sections(self):
        """每个 .cursorrules 文件必须包含至少一个关键词"""
        files_without_keywords = []
        for rule_name in ALL_RULES:
            cursorrules_file = RULES_DIR / rule_name / ".cursorrules"
            if not cursorrules_file.exists():
                continue

            with open(cursorrules_file, "r", encoding="utf-8") as f:
                content = f.read()

            has_keyword = any(kw.lower() in content.lower() for kw in REQUIRED_KEYWORDS)
            if not has_keyword:
                files_without_keywords.append(rule_name)

        assert not files_without_keywords, (
            f"以下文件缺少必要关键词: {files_without_keywords}\n"
            f"（需要包含以下之一: {REQUIRED_KEYWORDS}）"
        )

    def test_cursorrules_not_empty(self):
        """每个 .cursorrules 文件不能为空"""
        empty_files = []
        for rule_name in ALL_RULES:
            cursorrules_file = RULES_DIR / rule_name / ".cursorrules"
            if not cursorrules_file.exists():
                continue

            size = cursorrules_file.stat().st_size
            if size == 0:
                empty_files.append(rule_name)

        assert not empty_files, f"以下文件为空: {empty_files}"

    def test_cursorrules_has_what_cursor_should(self):
        """每个 .cursorrules 应包含 'What Cursor Should' 指导部分"""
        missing_section = []
        for rule_name in ALL_RULES:
            cursorrules_file = RULES_DIR / rule_name / ".cursorrules"
            if not cursorrules_file.exists():
                continue

            with open(cursorrules_file, "r", encoding="utf-8") as f:
                content = f.read()

            if "What Cursor Should" not in content:
                missing_section.append(rule_name)

        assert not missing_section, (
            f"以下文件缺少 'What Cursor Should' 指导部分: {missing_section}"
        )

    def test_cursorrules_no_placeholder_text(self):
        """文件不应包含占位符文本（TODO、PLACEHOLDER 等）"""
        files_with_placeholders = []
        placeholders = ["TODO: fill", "PLACEHOLDER", "Lorem ipsum"]

        for rule_name in ALL_RULES:
            cursorrules_file = RULES_DIR / rule_name / ".cursorrules"
            if not cursorrules_file.exists():
                continue

            with open(cursorrules_file, "r", encoding="utf-8") as f:
                content = f.read()

            for placeholder in placeholders:
                if placeholder in content:
                    files_with_placeholders.append(f"{rule_name}: 含有 '{placeholder}'")
                    break

        assert not files_with_placeholders, (
            f"以下文件含有占位符文本:\n" + "\n".join(files_with_placeholders)
        )


class TestTiersJson:
    """测试 tiers.json 格式正确性"""

    def test_tiers_json_exists(self):
        """tiers.json 文件必须存在"""
        assert TIERS_FILE.exists(), f"tiers.json 不存在: {TIERS_FILE}"

    def test_tiers_json_valid(self):
        """tiers.json 必须是有效的 JSON"""
        with open(TIERS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)  # 如果 JSON 无效会抛出异常

        assert isinstance(data, dict), "tiers.json 根元素必须是对象"

    def test_tiers_json_has_required_fields(self):
        """tiers.json 必须包含 version 和 tiers 字段"""
        with open(TIERS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)

        assert "version" in data, "tiers.json 缺少 version 字段"
        assert "tiers" in data, "tiers.json 缺少 tiers 字段"

    def test_tiers_json_has_three_tiers(self):
        """tiers.json 必须包含 starter、pro、complete 三个 tier"""
        with open(TIERS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)

        required_tiers = {"starter", "pro", "complete"}
        actual_tiers = set(data.get("tiers", {}).keys())
        missing = required_tiers - actual_tiers

        assert not missing, f"tiers.json 缺少以下 tier: {missing}"

    def test_tiers_json_rules_exist(self):
        """tiers.json 中引用的所有 rules 必须实际存在"""
        with open(TIERS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)

        missing_rules = []
        for tier_name, tier_config in data.get("tiers", {}).items():
            for rule_name in tier_config.get("rules", []):
                rule_dir = RULES_DIR / rule_name
                if not rule_dir.exists():
                    missing_rules.append(f"{tier_name}/{rule_name}")
            for extra_name in tier_config.get("extras", []):
                extra_path = EXTRA_PATHS.get(extra_name)
                if extra_path is None or not extra_path.exists():
                    missing_rules.append(f"{tier_name}/extra:{extra_name}")

        assert not missing_rules, (
            f"tiers.json 中引用了不存在的 rules:\n" + "\n".join(missing_rules)
        )

    def test_starter_has_10_rules(self):
        """starter tier 应该包含 10 个 rules"""
        with open(TIERS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)

        starter_rules = data["tiers"]["starter"]["rules"]
        assert len(starter_rules) == 10, (
            f"starter tier 应包含 10 个 rules，实际有 {len(starter_rules)} 个"
        )

    def test_pro_has_20_rules(self):
        """pro tier 应该包含所有 20 个 rules"""
        with open(TIERS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)

        pro_rules = data["tiers"]["pro"]["rules"]
        assert len(pro_rules) == 20, (
            f"pro tier 应包含 20 个 rules，实际有 {len(pro_rules)} 个"
        )


class TestDistZips:
    """测试生成的 ZIP 文件（需要先运行 build_bundle.py）"""

    @pytest.fixture(autouse=True)
    def check_dist_exists(self):
        """检查 dist 目录是否存在"""
        if not DIST_DIR.exists():
            pytest.skip("dist/ 目录不存在，请先运行 build_bundle.py")

    def _find_zip(self, tier_name: str) -> Path | None:
        """查找指定 tier 的 ZIP 文件"""
        for zip_file in DIST_DIR.glob(f"cursor-rules-{tier_name}-*.zip"):
            return zip_file
        return None

    def test_starter_zip_exists(self):
        """starter ZIP 文件必须存在"""
        zip_file = self._find_zip("starter")
        assert zip_file is not None, "dist/ 下找不到 starter ZIP 文件"
        assert zip_file.stat().st_size > 0, "starter ZIP 文件为空"
        with zipfile.ZipFile(zip_file, "r") as zf:
            names = {Path(name).name for name in zf.namelist()}
        assert "README.md" in names, "starter ZIP 缺少根 README.md"
        assert "LICENSE" in names, "starter ZIP 缺少根 LICENSE"

    def test_pro_zip_exists(self):
        """pro ZIP 文件必须存在"""
        zip_file = self._find_zip("pro")
        assert zip_file is not None, "dist/ 下找不到 pro ZIP 文件"
        assert zip_file.stat().st_size > 0, "pro ZIP 文件为空"
        with zipfile.ZipFile(zip_file, "r") as zf:
            names = {Path(name).name for name in zf.namelist()}
        assert "README.md" in names, "pro ZIP 缺少根 README.md"
        assert "LICENSE" in names, "pro ZIP 缺少根 LICENSE"

    def test_complete_zip_exists(self):
        """complete ZIP 文件必须存在"""
        zip_file = self._find_zip("complete")
        assert zip_file is not None, "dist/ 下找不到 complete ZIP 文件"
        assert zip_file.stat().st_size > 0, "complete ZIP 文件为空"
        with zipfile.ZipFile(zip_file, "r") as zf:
            names = zf.namelist()
        assert any(Path(name).name == "README.md" for name in names), (
            "complete ZIP 缺少根 README.md"
        )
        assert any(Path(name).name == "LICENSE" for name in names), (
            "complete ZIP 缺少根 LICENSE"
        )
        assert "docs/framework-selection-guide.md" in names, (
            "complete ZIP 缺少 docs/framework-selection-guide.md"
        )
        assert any(name.startswith("docs/customization-templates/") for name in names), (
            "complete ZIP 缺少 docs/customization-templates/ 内容"
        )

    def test_starter_zip_contains_cursorrules(self):
        """starter ZIP 必须包含 .cursorrules 文件"""
        zip_file = self._find_zip("starter")
        if zip_file is None:
            pytest.skip("starter ZIP 不存在")

        with zipfile.ZipFile(zip_file, "r") as zf:
            names = zf.namelist()
            cursorrules_files = [n for n in names if n.endswith(".cursorrules")]
            assert len(cursorrules_files) == 10, (
                f"starter ZIP 应含 10 个 .cursorrules，实际有 {len(cursorrules_files)} 个"
            )

    def test_pro_zip_contains_all_cursorrules(self):
        """pro ZIP 必须包含所有 20 个 .cursorrules 文件"""
        zip_file = self._find_zip("pro")
        if zip_file is None:
            pytest.skip("pro ZIP 不存在")

        with zipfile.ZipFile(zip_file, "r") as zf:
            names = zf.namelist()
            cursorrules_files = [n for n in names if n.endswith(".cursorrules")]
            assert len(cursorrules_files) == 20, (
                f"pro ZIP 应含 20 个 .cursorrules，实际有 {len(cursorrules_files)} 个"
            )

    def test_all_zips_are_valid(self):
        """所有 ZIP 文件必须是有效的 ZIP 格式"""
        for tier_name in ["starter", "pro", "complete"]:
            zip_file = self._find_zip(tier_name)
            if zip_file is None:
                continue

            assert zipfile.is_zipfile(zip_file), f"{tier_name} ZIP 文件格式无效"


class TestContentQuality:
    """测试内容质量"""

    def test_line_count_statistics(self):
        """打印各文件行数统计（不会失败，仅供参考）"""
        stats = {}
        for rule_name in ALL_RULES:
            cursorrules_file = RULES_DIR / rule_name / ".cursorrules"
            if cursorrules_file.exists():
                with open(cursorrules_file, "r", encoding="utf-8") as f:
                    stats[rule_name] = len(f.readlines())

        if stats:
            sorted_stats = sorted(stats.items(), key=lambda x: x[1], reverse=True)
            print("\n=== .cursorrules 文件行数统计 ===")
            for name, count in sorted_stats:
                status = "✓" if count >= 150 else "△" if count >= 100 else "✗"
                print(f"  {status} {name:<35} {count:4d} 行")

            max_rule, max_lines = sorted_stats[0]
            min_rule, min_lines = sorted_stats[-1]
            avg_lines = sum(stats.values()) / len(stats)
            print(f"\n  最长: {max_rule} ({max_lines} 行)")
            print(f"  最短: {min_rule} ({min_lines} 行)")
            print(f"  平均: {avg_lines:.0f} 行")

        # 确保至少有一个文件 >= 150 行（证明内容丰富）
        has_rich_content = any(lines >= 150 for lines in stats.values())
        assert has_rich_content, "应该至少有一个 .cursorrules 文件 >= 150 行"
