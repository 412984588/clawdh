"""
Tests for Next.js App Router Patterns. TDD — RED first.
"""

import json
import zipfile
from pathlib import Path

PRODUCT_DIR = Path(__file__).parent.parent
TEMPLATES_DIR = PRODUCT_DIR / "templates"
DIST_DIR = PRODUCT_DIR / "dist"

TEMPLATE_DIRS = [
    "01-server-components",
    "02-server-actions",
    "03-route-handlers",
    "04-loading-states",
    "05-error-handling",
    "06-metadata-seo",
    "07-parallel-routes",
    "08-middleware",
    "09-caching-patterns",
    "10-layout-patterns",
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

def test_each_template_has_example_file():
    for name in TEMPLATE_DIRS:
        d = TEMPLATES_DIR / name
        has_tsx = (d / "example.tsx").exists()
        has_ts = (d / "example.ts").exists()
        assert has_tsx or has_ts, f"{name}: missing example.tsx or example.ts"

def test_each_template_has_readme():
    for name in TEMPLATE_DIRS:
        assert (TEMPLATES_DIR / name / "README.md").exists(), \
            f"{name}: missing README.md"

def test_examples_mention_next():
    for name in TEMPLATE_DIRS:
        d = TEMPLATES_DIR / name
        path = d / "example.tsx" if (d / "example.tsx").exists() else d / "example.ts"
        content = path.read_text()
        assert "next" in content.lower(), f"{name}: example missing next reference"

def test_examples_have_exports():
    for name in TEMPLATE_DIRS:
        d = TEMPLATES_DIR / name
        path = d / "example.tsx" if (d / "example.tsx").exists() else d / "example.ts"
        content = path.read_text()
        assert "export" in content, f"{name}: example missing export"

def test_examples_not_empty():
    for name in TEMPLATE_DIRS:
        d = TEMPLATES_DIR / name
        path = d / "example.tsx" if (d / "example.tsx").exists() else d / "example.ts"
        assert path.stat().st_size > 200, f"{name}: example too small"


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
