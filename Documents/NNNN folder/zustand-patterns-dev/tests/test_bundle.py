"""
Tests for Zustand State Management Patterns Pack. TDD — RED first.
"""

import json
import zipfile
from pathlib import Path

PRODUCT_DIR = Path(__file__).parent.parent
TEMPLATES_DIR = PRODUCT_DIR / "templates"
DIST_DIR = PRODUCT_DIR / "dist"

TEMPLATE_DIRS = [
    "01-auth-store","02-cart-store","03-ui-store","04-form-store","05-notification-store",
    "06-settings-store","07-infinite-list-store","08-websocket-store","09-undo-redo-store","10-slices-pattern",
]
STARTER_TEMPLATES = TEMPLATE_DIRS[:5]
PRO_TEMPLATES = TEMPLATE_DIRS
SALES_FILES = ["product-listing.md","gumroad-listing.md","lemon-squeezy-listing.md",
               "itch-io-listing.md","faq.md","refund-policy.md","keywords.md"]

def test_readme_exists():
    assert (PRODUCT_DIR / "README.md").exists()
def test_changelog_exists():
    assert (PRODUCT_DIR / "CHANGELOG.md").exists()
def test_license_exists():
    assert (PRODUCT_DIR / "LICENSE").exists()
def test_tiers_json_exists():
    assert (PRODUCT_DIR / "tiers.json").exists()
def test_tiers_pricing():
    data = json.loads((PRODUCT_DIR / "tiers.json").read_text())
    by_id = {t["id"]: t for t in data["tiers"]}
    assert by_id["starter"]["price_usd"] == 19
    assert by_id["pro"]["price_usd"] == 39
def test_all_template_dirs_exist():
    for name in TEMPLATE_DIRS:
        assert (TEMPLATES_DIR / name).is_dir(), f"Missing: {name}"
def test_each_template_has_store_ts():
    for name in TEMPLATE_DIRS:
        assert (TEMPLATES_DIR / name / "store.ts").exists(), f"{name}: missing store.ts"
def test_each_template_has_readme():
    for name in TEMPLATE_DIRS:
        assert (TEMPLATES_DIR / name / "README.md").exists(), f"{name}: missing README.md"
def test_store_imports_zustand():
    for name in TEMPLATE_DIRS:
        content = (TEMPLATES_DIR / name / "store.ts").read_text()
        assert "zustand" in content, f"{name}: store.ts doesn't import zustand"
def test_store_has_exports():
    for name in TEMPLATE_DIRS:
        content = (TEMPLATES_DIR / name / "store.ts").read_text()
        assert "export" in content, f"{name}: store.ts has no exports"
def test_store_not_empty():
    for name in TEMPLATE_DIRS:
        assert (TEMPLATES_DIR / name / "store.ts").stat().st_size > 100, f"{name}: store.ts too small"
def test_sales_dir_exists():
    assert (PRODUCT_DIR / "sales").is_dir()
def test_all_sales_files_exist():
    for f in SALES_FILES:
        assert (PRODUCT_DIR / "sales" / f).exists(), f"Missing: {f}"
def test_sales_files_not_empty():
    for f in SALES_FILES:
        assert (PRODUCT_DIR / "sales" / f).stat().st_size > 50
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
    for f in ["README.md","LICENSE","CHANGELOG.md","tiers.json"]:
        assert f in names
def test_pro_zip_has_all_templates():
    tiers = json.loads((PRODUCT_DIR / "tiers.json").read_text())
    t = next(t for t in tiers["tiers"] if t["id"] == "pro")
    with zipfile.ZipFile(DIST_DIR / t["zip_name"]) as zf:
        names = zf.namelist()
    for tpl in PRO_TEMPLATES:
        assert any(n.startswith(f"templates/{tpl}/") for n in names)
