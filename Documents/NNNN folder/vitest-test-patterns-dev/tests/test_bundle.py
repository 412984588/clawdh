"""
Tests for Vitest Test Patterns. TDD — RED first.
"""

import json
import zipfile
from pathlib import Path

PRODUCT_DIR = Path(__file__).parent.parent
TEMPLATES_DIR = PRODUCT_DIR / "templates"
DIST_DIR = PRODUCT_DIR / "dist"

TEMPLATE_DIRS = [
    "01-unit-functions",
    "02-class-testing",
    "03-async-promises",
    "04-timer-mocking",
    "05-module-mocking",
    "06-component-testing",
    "07-api-mocking",
    "08-snapshot-testing",
    "09-error-handling",
    "10-parameterized-tests",
]

STARTER_TEMPLATES = TEMPLATE_DIRS[:5]
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

def test_tiers_pricing():
    data = json.loads((PRODUCT_DIR / "tiers.json").read_text())
    by_id = {t["id"]: t for t in data["tiers"]}
    assert by_id["starter"]["price_usd"] == 19
    assert by_id["pro"]["price_usd"] == 39


# ── Template structure ────────────────────────────────────────────────────────

def test_all_template_dirs_exist():
    for name in TEMPLATE_DIRS:
        assert (TEMPLATES_DIR / name).is_dir(), f"Missing: {name}"

def test_each_template_has_test_file():
    for name in TEMPLATE_DIRS:
        assert (TEMPLATES_DIR / name / "example.test.ts").exists(), \
            f"{name}: missing example.test.ts"

def test_each_template_has_readme():
    for name in TEMPLATE_DIRS:
        assert (TEMPLATES_DIR / name / "README.md").exists(), \
            f"{name}: missing README.md"

def test_test_files_import_vitest():
    for name in TEMPLATE_DIRS:
        content = (TEMPLATES_DIR / name / "example.test.ts").read_text()
        assert "vitest" in content, f"{name}: example.test.ts missing vitest import"

def test_test_files_have_test_blocks():
    for name in TEMPLATE_DIRS:
        content = (TEMPLATES_DIR / name / "example.test.ts").read_text()
        has_it = "it(" in content
        has_test = "test(" in content
        has_describe = "describe(" in content
        assert has_it or has_test or has_describe, \
            f"{name}: example.test.ts missing test/it/describe blocks"

def test_test_files_not_empty():
    for name in TEMPLATE_DIRS:
        size = (TEMPLATES_DIR / name / "example.test.ts").stat().st_size
        assert size > 200, f"{name}: example.test.ts too small ({size} bytes)"


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
        assert any(n.startswith(f"templates/{tpl}/") for n in names), \
            f"pro ZIP missing {tpl}"
