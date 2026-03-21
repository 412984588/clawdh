"""
Tests for ESLint + Prettier Config Pack.
TDD — RED first.
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
    "04-typescript-strict",
    "05-vue",
    "06-svelte",
    "07-monorepo",
    "08-library",
    "09-vitest",
    "10-legacy-js",
]

STARTER_TEMPLATES = TEMPLATE_DIRS[:4]
PRO_TEMPLATES = TEMPLATE_DIRS  # all 10


# ── Root files ──────────────────────────────────────────────────────────────

def test_readme_exists():
    assert (PRODUCT_DIR / "README.md").exists()

def test_changelog_exists():
    assert (PRODUCT_DIR / "CHANGELOG.md").exists()

def test_license_exists():
    assert (PRODUCT_DIR / "LICENSE").exists()

def test_tiers_json_exists():
    assert (PRODUCT_DIR / "tiers.json").exists()


# ── tiers.json ───────────────────────────────────────────────────────────────

def test_tiers_json_valid():
    data = json.loads((PRODUCT_DIR / "tiers.json").read_text())
    assert "tiers" in data
    assert len(data["tiers"]) == 2

def test_tiers_have_required_fields():
    data = json.loads((PRODUCT_DIR / "tiers.json").read_text())
    for tier in data["tiers"]:
        assert "id" in tier
        assert "name" in tier
        assert "price_usd" in tier
        assert "zip_name" in tier

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


# ── Template directories ──────────────────────────────────────────────────────

def test_all_template_dirs_exist():
    for name in TEMPLATE_DIRS:
        assert (TEMPLATES_DIR / name).is_dir(), f"Missing template dir: {name}"

def test_each_template_has_eslint_config():
    for name in TEMPLATE_DIRS:
        d = TEMPLATES_DIR / name
        # Accept either flat config or legacy
        has_flat = (d / "eslint.config.js").exists()
        has_legacy = (d / ".eslintrc.json").exists()
        assert has_flat or has_legacy, f"{name}: missing eslint config"

def test_each_template_has_prettier_config():
    for name in TEMPLATE_DIRS:
        d = TEMPLATES_DIR / name
        assert (d / ".prettierrc").exists(), f"{name}: missing .prettierrc"

def test_each_template_has_readme():
    for name in TEMPLATE_DIRS:
        assert (TEMPLATES_DIR / name / "README.md").exists(), f"{name}: missing README.md"

def test_prettier_config_is_valid_json():
    for name in TEMPLATE_DIRS:
        path = TEMPLATES_DIR / name / ".prettierrc"
        try:
            json.loads(path.read_text())
        except json.JSONDecodeError as e:
            assert False, f"{name}/.prettierrc invalid JSON: {e}"

def test_eslint_config_not_empty():
    for name in TEMPLATE_DIRS:
        d = TEMPLATES_DIR / name
        cfg = d / "eslint.config.js" if (d / "eslint.config.js").exists() else d / ".eslintrc.json"
        assert cfg.stat().st_size > 20, f"{name}: eslint config too small"

def test_prettier_config_has_content():
    for name in TEMPLATE_DIRS:
        content = (TEMPLATES_DIR / name / ".prettierrc").read_text()
        data = json.loads(content)
        assert len(data) >= 2, f"{name}: .prettierrc should have at least 2 options"


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
        assert (PRODUCT_DIR / "sales" / f).exists(), f"Missing sales file: {f}"

def test_sales_files_not_empty():
    for f in SALES_FILES:
        path = PRODUCT_DIR / "sales" / f
        assert path.stat().st_size > 50, f"{f} is too small"


# ── ZIP bundles ───────────────────────────────────────────────────────────────

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
        assert any(n.startswith(f"templates/{tpl}/") for n in names), f"starter ZIP missing {tpl}"
    # Pro-only templates should NOT be in starter
    for tpl in TEMPLATE_DIRS[4:]:
        assert not any(n.startswith(f"templates/{tpl}/") for n in names), f"starter ZIP has pro-only {tpl}"
