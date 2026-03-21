"""Tests for notion-productivity-templates bundle."""
import json
import zipfile
from pathlib import Path

ROOT = Path(__file__).parent.parent
TEMPLATES = ROOT / "templates"
DIST = ROOT / "dist"
SALES = ROOT / "sales"

TEMPLATE_IDS = [
    "01-project-management",
    "02-goal-tracker",
    "03-habit-tracker",
    "04-weekly-review",
    "05-monthly-review",
    "06-reading-notes",
    "07-meeting-notes",
    "08-second-brain",
    "09-personal-crm",
    "10-daily-planner",
]

SALES_FILES = [
    "product-listing.md",
    "gumroad-listing.md",
    "lemon-squeezy-listing.md",
    "itch-io-listing.md",
    "faq.md",
    "refund-policy.md",
    "keywords.md",
]

CONTENT_KEYWORDS = ["notion", "template", "productivity", "goal", "habit", "track", "plan", "review"]


def test_template_dirs_exist():
    for tid in TEMPLATE_IDS:
        assert (TEMPLATES / tid).is_dir(), f"Missing template dir: {tid}"


def test_main_files_exist():
    for tid in TEMPLATE_IDS:
        assert (TEMPLATES / tid / "template.md").exists(), f"Missing template.md in {tid}"


def test_main_files_have_content_keywords():
    for tid in TEMPLATE_IDS:
        content = (TEMPLATES / tid / "template.md").read_text().lower()
        assert any(kw in content for kw in CONTENT_KEYWORDS), \
            f"template.md in {tid} missing productivity/notion/goal/habit/track/plan/review keyword"


def test_main_files_have_structure():
    for tid in TEMPLATE_IDS:
        content = (TEMPLATES / tid / "template.md").read_text()
        assert "#" in content or "|" in content or "- " in content, \
            f"template.md in {tid} has no markdown structure"


def test_main_files_not_empty():
    for tid in TEMPLATE_IDS:
        content = (TEMPLATES / tid / "template.md").read_text().strip()
        assert len(content) > 200, f"template.md in {tid} too short ({len(content)} chars)"


def test_readme_exists():
    assert (ROOT / "README.md").exists()
    assert len((ROOT / "README.md").read_text().strip()) > 100


def test_sales_dir_exists():
    assert SALES.is_dir()


def test_all_sales_files_exist():
    for fname in SALES_FILES:
        assert (SALES / fname).exists(), f"Missing sales file: {fname}"


def test_sales_files_not_empty():
    for fname in SALES_FILES:
        content = (SALES / fname).read_text().strip()
        assert len(content) > 50, f"Sales file {fname} too short"


def test_starter_zip_exists():
    assert (DIST / "notion-productivity-templates-starter-v1.0.0.zip").exists()


def test_pro_zip_exists():
    assert (DIST / "notion-productivity-templates-pro-v1.0.0.zip").exists()


def test_starter_zip_has_root_files():
    z = zipfile.ZipFile(DIST / "notion-productivity-templates-starter-v1.0.0.zip")
    names = z.namelist()
    assert "README.md" in names
    assert "tiers.json" in names


def test_pro_zip_has_all_templates():
    z = zipfile.ZipFile(DIST / "notion-productivity-templates-pro-v1.0.0.zip")
    names = z.namelist()
    for tid in TEMPLATE_IDS:
        assert any(tid in n for n in names), f"Pro ZIP missing template {tid}"


def test_tiers_json_structure():
    data = json.loads((ROOT / "tiers.json").read_text())
    assert "tiers" in data
    assert len(data["tiers"]) == 2


def test_starter_tier_has_five_templates():
    data = json.loads((ROOT / "tiers.json").read_text())
    starter = next(t for t in data["tiers"] if t["id"] == "starter")
    assert len(starter["templates"]) == 5


def test_pro_tier_has_ten_templates():
    data = json.loads((ROOT / "tiers.json").read_text())
    pro = next(t for t in data["tiers"] if t["id"] == "pro")
    assert len(pro["templates"]) == 10


def test_license_exists():
    assert (ROOT / "LICENSE").exists()
    assert "MIT" in (ROOT / "LICENSE").read_text()


def test_changelog_exists():
    assert (ROOT / "CHANGELOG.md").exists()
    assert len((ROOT / "CHANGELOG.md").read_text().strip()) > 20
