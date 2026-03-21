"""Tests for React Email Templates. TDD — RED first."""
import json, zipfile
from pathlib import Path

PRODUCT_DIR = Path(__file__).parent.parent
TEMPLATES_DIR = PRODUCT_DIR / "templates"
DIST_DIR = PRODUCT_DIR / "dist"

TEMPLATE_DIRS = [
    "01-welcome","02-verify-email","03-reset-password","04-magic-link","05-invoice",
    "06-subscription-started","07-subscription-cancelled","08-team-invitation",
    "09-payment-failed","10-onboarding",
]
STARTER_TEMPLATES = TEMPLATE_DIRS[:5]
PRO_TEMPLATES = TEMPLATE_DIRS
SALES_FILES = ["product-listing.md","gumroad-listing.md","lemon-squeezy-listing.md",
               "itch-io-listing.md","faq.md","refund-policy.md","keywords.md"]

def test_readme_exists(): assert (PRODUCT_DIR / "README.md").exists()
def test_changelog_exists(): assert (PRODUCT_DIR / "CHANGELOG.md").exists()
def test_license_exists(): assert (PRODUCT_DIR / "LICENSE").exists()
def test_tiers_json_exists(): assert (PRODUCT_DIR / "tiers.json").exists()

def test_tiers_pricing():
    data = json.loads((PRODUCT_DIR / "tiers.json").read_text())
    by_id = {t["id"]: t for t in data["tiers"]}
    assert by_id["starter"]["price_usd"] == 19
    assert by_id["pro"]["price_usd"] == 39

def test_all_template_dirs_exist():
    for name in TEMPLATE_DIRS:
        assert (TEMPLATES_DIR / name).is_dir(), f"Missing: {name}"

def test_each_template_has_tsx_file():
    for name in TEMPLATE_DIRS:
        files = list((TEMPLATES_DIR / name).glob("*.tsx"))
        assert len(files) >= 1, f"{name}: missing .tsx file"

def test_each_template_has_readme():
    for name in TEMPLATE_DIRS:
        assert (TEMPLATES_DIR / name / "README.md").exists(), f"{name}: missing README.md"

def test_tsx_files_not_empty():
    for name in TEMPLATE_DIRS:
        tsx_files = list((TEMPLATES_DIR / name).glob("*.tsx"))
        for f in tsx_files:
            assert f.stat().st_size > 200, f"{name}/{f.name} too small"

def test_tsx_files_have_react_email_imports():
    for name in TEMPLATE_DIRS:
        tsx_files = list((TEMPLATES_DIR / name).glob("*.tsx"))
        for f in tsx_files:
            content = f.read_text()
            assert "@react-email" in content or "react-email" in content, \
                f"{name}/{f.name}: missing react-email import"

def test_tsx_files_export_default():
    for name in TEMPLATE_DIRS:
        tsx_files = list((TEMPLATES_DIR / name).glob("*.tsx"))
        for f in tsx_files:
            content = f.read_text()
            assert "export default" in content, f"{name}/{f.name}: missing export default"

def test_sales_dir_exists(): assert (PRODUCT_DIR / "sales").is_dir()
def test_all_sales_files_exist():
    for f in SALES_FILES:
        assert (PRODUCT_DIR / "sales" / f).exists(), f"Missing: {f}"

def test_starter_zip_exists():
    tiers = json.loads((PRODUCT_DIR / "tiers.json").read_text())
    t = next(t for t in tiers["tiers"] if t["id"] == "starter")
    assert (DIST_DIR / t["zip_name"]).exists()

def test_pro_zip_exists():
    tiers = json.loads((PRODUCT_DIR / "tiers.json").read_text())
    t = next(t for t in tiers["tiers"] if t["id"] == "pro")
    assert (DIST_DIR / t["zip_name"]).exists()

def test_pro_zip_has_root_files():
    tiers = json.loads((PRODUCT_DIR / "tiers.json").read_text())
    t = next(t for t in tiers["tiers"] if t["id"] == "pro")
    with zipfile.ZipFile(DIST_DIR / t["zip_name"]) as zf:
        names = zf.namelist()
    for f in ["README.md","LICENSE","CHANGELOG.md","tiers.json"]:
        assert f in names, f"pro ZIP missing {f}"

def test_pro_zip_has_all_templates():
    tiers = json.loads((PRODUCT_DIR / "tiers.json").read_text())
    t = next(t for t in tiers["tiers"] if t["id"] == "pro")
    with zipfile.ZipFile(DIST_DIR / t["zip_name"]) as zf:
        names = zf.namelist()
    for tpl in PRO_TEMPLATES:
        assert any(n.startswith(f"templates/{tpl}/") for n in names), f"pro ZIP missing {tpl}"

def test_starter_excludes_pro_only():
    tiers = json.loads((PRODUCT_DIR / "tiers.json").read_text())
    t = next(t for t in tiers["tiers"] if t["id"] == "starter")
    with zipfile.ZipFile(DIST_DIR / t["zip_name"]) as zf:
        names = zf.namelist()
    for tpl in TEMPLATE_DIRS[5:]:
        assert not any(n.startswith(f"templates/{tpl}/") for n in names), \
            f"starter has pro-only {tpl}"
