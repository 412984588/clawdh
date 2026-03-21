"""
Tests for Prisma Schema Templates. TDD — RED first.
"""

import json
import zipfile
from pathlib import Path

PRODUCT_DIR = Path(__file__).parent.parent
TEMPLATES_DIR = PRODUCT_DIR / "templates"
DIST_DIR = PRODUCT_DIR / "dist"

TEMPLATE_DIRS = [
    "01-users-auth",
    "02-blog-cms",
    "03-saas-billing",
    "04-ecommerce",
    "05-multi-tenancy",
    "06-analytics",
    "07-file-storage",
    "08-notifications",
    "09-audit-log",
    "10-social",
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

def test_each_template_has_schema_prisma():
    for name in TEMPLATE_DIRS:
        assert (TEMPLATES_DIR / name / "schema.prisma").exists(), \
            f"{name}: missing schema.prisma"

def test_each_template_has_readme():
    for name in TEMPLATE_DIRS:
        assert (TEMPLATES_DIR / name / "README.md").exists(), \
            f"{name}: missing README.md"

def test_schema_has_model_keyword():
    for name in TEMPLATE_DIRS:
        content = (TEMPLATES_DIR / name / "schema.prisma").read_text()
        assert "model " in content, f"{name}: schema.prisma missing 'model' keyword"

def test_schema_has_id_field():
    for name in TEMPLATE_DIRS:
        content = (TEMPLATES_DIR / name / "schema.prisma").read_text()
        assert "@id" in content, f"{name}: schema.prisma missing @id field"

def test_schema_has_datasource():
    for name in TEMPLATE_DIRS:
        content = (TEMPLATES_DIR / name / "schema.prisma").read_text()
        assert "datasource" in content, f"{name}: schema.prisma missing datasource block"

def test_schema_not_empty():
    for name in TEMPLATE_DIRS:
        size = (TEMPLATES_DIR / name / "schema.prisma").stat().st_size
        assert size > 300, f"{name}: schema.prisma too small ({size} bytes)"


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
