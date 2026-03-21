"""Tests for meal-planning-templates bundle."""
import json
from pathlib import Path

ROOT = Path(__file__).parent.parent
TEMPLATES = ROOT / "templates"
DIST = ROOT / "dist"

TEMPLATE_IDS = [
    "01-weekly-meal-plan",
    "02-grocery-list",
    "03-meal-prep-guide",
    "04-budget-meals",
    "05-macro-tracker",
    "06-family-meals",
    "07-30min-recipes",
    "08-freezer-meals",
    "09-seasonal-planner",
    "10-pantry-inventory",
]

CONTENT_KEYWORDS = ["meal", "recipe", "grocery", "food", "cook", "ingredient", "dinner", "breakfast", "lunch", "prep"]


# ── Structure (5 tests) ──────────────────────────────────────

def test_template_dirs_exist():
    for tid in TEMPLATE_IDS:
        assert (TEMPLATES / tid).is_dir(), f"Missing dir: {tid}"


def test_main_files_exist():
    for tid in TEMPLATE_IDS:
        assert (TEMPLATES / tid / "template.md").exists(), f"Missing template.md in {tid}"


def test_main_files_not_empty():
    for tid in TEMPLATE_IDS:
        content = (TEMPLATES / tid / "template.md").read_text()
        assert len(content) > 200, f"template.md too short in {tid}"


def test_main_files_have_content_keywords():
    for tid in TEMPLATE_IDS:
        content = (TEMPLATES / tid / "template.md").read_text().lower()
        assert any(kw in content for kw in CONTENT_KEYWORDS), f"No keywords in {tid}"


def test_tiers_json_exists():
    assert (ROOT / "tiers.json").exists()


# ── Tiers (4 tests) ──────────────────────────────────────────

def test_tiers_json_valid():
    data = json.loads((ROOT / "tiers.json").read_text())
    assert "tiers" in data
    assert len(data["tiers"]) == 2


def test_tiers_have_required_fields():
    data = json.loads((ROOT / "tiers.json").read_text())
    for tier in data["tiers"]:
        assert "id" in tier
        assert "price_usd" in tier
        assert "zip_name" in tier
        assert "templates" in tier


def test_starter_tier():
    data = json.loads((ROOT / "tiers.json").read_text())
    starter = [t for t in data["tiers"] if t["id"] == "starter"][0]
    assert len(starter["templates"]) == 5
    assert starter["price_usd"] <= 30


def test_pro_tier():
    data = json.loads((ROOT / "tiers.json").read_text())
    pro = [t for t in data["tiers"] if t["id"] == "pro"][0]
    assert len(pro["templates"]) == 10
    assert pro["price_usd"] <= 60


# ── Dist (4 tests) ───────────────────────────────────────────

def test_dist_dir_exists():
    assert DIST.is_dir()


def test_starter_zip_exists():
    zips = list(DIST.glob("*starter*.zip"))
    assert len(zips) == 1


def test_pro_zip_exists():
    zips = list(DIST.glob("*pro*.zip"))
    assert len(zips) == 1


def test_zips_not_empty():
    for zp in DIST.glob("*.zip"):
        assert zp.stat().st_size > 1024, f"ZIP too small: {zp.name}"


# ── Sales (3 tests) ──────────────────────────────────────────

def test_sales_dir_exists():
    assert (ROOT / "sales").is_dir()


def test_sales_files_count():
    sales_files = list((ROOT / "sales").glob("*.md"))
    assert len(sales_files) >= 5


def test_readme_exists():
    assert (ROOT / "README.md").exists()
