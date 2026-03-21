"""
Tests for Cursor Rules Pack. TDD — RED first.
"""

import json
import zipfile
from pathlib import Path

PRODUCT_DIR = Path(__file__).parent.parent
TEMPLATES_DIR = PRODUCT_DIR / "templates"
DIST_DIR = PRODUCT_DIR / "dist"

TEMPLATE_DIRS = [
    "01-react-typescript",
    "02-nextjs",
    "03-nodejs-api",
    "04-python-fastapi",
    "05-go-api",
    "06-vue",
    "07-sveltekit",
    "08-monorepo",
    "09-documentation",
    "10-code-reviewer",
]

STARTER_TEMPLATES = TEMPLATE_DIRS[:4]
PRO_TEMPLATES = TEMPLATE_DIRS


# ── Root files ────────────────────────────────────────────────────────────────

def test_readme_exists():
    assert (PRODUCT_DIR / "README.md").exists()

def test_changelog_exists():
    assert (PRODUCT_DIR / "CHANGELOG.md").exists()

def test_license_exists():
    assert (PRODUCT_DIR / "LICENSE").exists()

def test_tiers_json_exists():
    assert (PRODUCT_DIR / "tiers.json").exists()


# ── tiers.json ────────────────────────────────────────────────────────────────

def test_tiers_json_valid():
    data = json.loads((PRODUCT_DIR / "tiers.json").read_text())
    assert "tiers" in data
    assert len(data["tiers"]) == 2

def test_tiers_ids():
    data = json.loads((PRODUCT_DIR / "tiers.json").read_text())
    ids = [t["id"] for t in data["tiers"]]
    assert "starter" in ids
    assert "pro" in ids

def test_tiers_pricing():
    data = json.loads((PRODUCT_DIR / "tiers.json").read_text())
    by_id = {t["id"]: t for t in data["tiers"]}
    assert by_id["starter"]["price_usd"] == 19
    assert by_id["pro"]["price_usd"] == 39


# ── Template structure ────────────────────────────────────────────────────────

def test_all_template_dirs_exist():
    for name in TEMPLATE_DIRS:
        assert (TEMPLATES_DIR / name).is_dir(), f"Missing: {name}"

def test_each_template_has_cursorrules():
    for name in TEMPLATE_DIRS:
        assert (TEMPLATES_DIR / name / ".cursorrules").exists(), f"{name}: missing .cursorrules"

def test_each_template_has_mdc_rule():
    for name in TEMPLATE_DIRS:
        mdc = TEMPLATES_DIR / name / ".cursor" / "rules" / "main.mdc"
        assert mdc.exists(), f"{name}: missing .cursor/rules/main.mdc"

def test_each_template_has_readme():
    for name in TEMPLATE_DIRS:
        assert (TEMPLATES_DIR / name / "README.md").exists(), f"{name}: missing README.md"

def test_cursorrules_not_empty():
    for name in TEMPLATE_DIRS:
        size = (TEMPLATES_DIR / name / ".cursorrules").stat().st_size
        assert size > 100, f"{name}: .cursorrules too small ({size} bytes)"

def test_mdc_has_frontmatter():
    for name in TEMPLATE_DIRS:
        content = (TEMPLATES_DIR / name / ".cursor" / "rules" / "main.mdc").read_text()
        assert content.startswith("---"), f"{name}: main.mdc missing frontmatter"

def test_mdc_has_description():
    for name in TEMPLATE_DIRS:
        content = (TEMPLATES_DIR / name / ".cursor" / "rules" / "main.mdc").read_text()
        assert "description:" in content, f"{name}: main.mdc missing description"


# ── Sales files ───────────────────────────────────────────────────────────────

SALES_FILES = [
    "product-listing.md",
    "gumroad-listing.md",
    "lemon-squeezy-listing.md",
    "itch-io-listing.md",
    "faq.md",
    "refund-policy.md",
    "keywords.md",
]

def test_sales_dir_exists():
    assert (PRODUCT_DIR / "sales").is_dir()

def test_all_sales_files_exist():
    for f in SALES_FILES:
        assert (PRODUCT_DIR / "sales" / f).exists(), f"Missing: {f}"

def test_sales_files_not_empty():
    for f in SALES_FILES:
        assert (PRODUCT_DIR / "sales" / f).stat().st_size > 50, f"{f} too small"


# ── ZIPs ─────────────────────────────────────────────────────────────────────

def test_starter_zip_exists():
    tiers = json.loads((PRODUCT_DIR / "tiers.json").read_text())
    t = next(t for t in tiers["tiers"] if t["id"] == "starter")
    assert (DIST_DIR / t["zip_name"]).exists()

def test_pro_zip_exists():
    tiers = json.loads((PRODUCT_DIR / "tiers.json").read_text())
    t = next(t for t in tiers["tiers"] if t["id"] == "pro")
    assert (DIST_DIR / t["zip_name"]).exists()

def test_starter_zip_has_root_files():
    tiers = json.loads((PRODUCT_DIR / "tiers.json").read_text())
    t = next(t for t in tiers["tiers"] if t["id"] == "starter")
    with zipfile.ZipFile(DIST_DIR / t["zip_name"]) as zf:
        names = zf.namelist()
    for f in ["README.md", "LICENSE", "CHANGELOG.md", "tiers.json"]:
        assert f in names, f"starter ZIP missing {f}"

def test_pro_zip_has_all_templates():
    tiers = json.loads((PRODUCT_DIR / "tiers.json").read_text())
    t = next(t for t in tiers["tiers"] if t["id"] == "pro")
    with zipfile.ZipFile(DIST_DIR / t["zip_name"]) as zf:
        names = zf.namelist()
    for tpl in PRO_TEMPLATES:
        assert any(n.startswith(f"templates/{tpl}/") for n in names), f"pro ZIP missing {tpl}"

def test_starter_zip_has_only_starter_templates():
    tiers = json.loads((PRODUCT_DIR / "tiers.json").read_text())
    t = next(t for t in tiers["tiers"] if t["id"] == "starter")
    with zipfile.ZipFile(DIST_DIR / t["zip_name"]) as zf:
        names = zf.namelist()
    for tpl in STARTER_TEMPLATES:
        assert any(n.startswith(f"templates/{tpl}/") for n in names), f"starter missing {tpl}"
    for tpl in TEMPLATE_DIRS[4:]:
        assert not any(n.startswith(f"templates/{tpl}/") for n in names), f"starter has pro-only {tpl}"
