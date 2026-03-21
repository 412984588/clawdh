"""Tests for OpenAPI Spec Templates. TDD — RED first."""

import json
import zipfile
from pathlib import Path
try:
    import yaml
except ImportError:
    import subprocess, sys
    subprocess.run([sys.executable, "-m", "pip", "install", "pyyaml", "-q"])
    import yaml

PRODUCT_DIR = Path(__file__).parent.parent
TEMPLATES_DIR = PRODUCT_DIR / "templates"
DIST_DIR = PRODUCT_DIR / "dist"

TEMPLATE_DIRS = [
    "01-rest-crud", "02-auth-api", "03-ecommerce-api", "04-file-upload-api",
    "05-payment-api", "06-social-api", "07-search-api", "08-webhook-api",
    "09-admin-api", "10-multi-tenant-api",
]
STARTER_TEMPLATES = TEMPLATE_DIRS[:4]
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

def test_each_template_has_openapi_yaml():
    for name in TEMPLATE_DIRS:
        assert (TEMPLATES_DIR / name / "openapi.yaml").exists(), f"{name}: missing openapi.yaml"

def test_each_template_has_readme():
    for name in TEMPLATE_DIRS:
        assert (TEMPLATES_DIR / name / "README.md").exists(), f"{name}: missing README.md"

def test_openapi_yaml_is_valid_yaml():
    for name in TEMPLATE_DIRS:
        path = TEMPLATES_DIR / name / "openapi.yaml"
        try:
            data = yaml.safe_load(path.read_text())
            assert data is not None
        except yaml.YAMLError as e:
            assert False, f"{name}/openapi.yaml invalid YAML: {e}"

def test_openapi_yaml_has_openapi_field():
    for name in TEMPLATE_DIRS:
        data = yaml.safe_load((TEMPLATES_DIR / name / "openapi.yaml").read_text())
        assert "openapi" in data, f"{name}: missing 'openapi' field"
        assert data["openapi"].startswith("3."), f"{name}: not OpenAPI 3.x"

def test_openapi_yaml_has_info_section():
    for name in TEMPLATE_DIRS:
        data = yaml.safe_load((TEMPLATES_DIR / name / "openapi.yaml").read_text())
        assert "info" in data, f"{name}: missing 'info'"
        assert "title" in data["info"], f"{name}: info missing 'title'"
        assert "version" in data["info"], f"{name}: info missing 'version'"

def test_openapi_yaml_has_paths():
    for name in TEMPLATE_DIRS:
        data = yaml.safe_load((TEMPLATES_DIR / name / "openapi.yaml").read_text())
        assert "paths" in data, f"{name}: missing 'paths'"
        assert len(data["paths"]) >= 2, f"{name}: needs at least 2 paths"

def test_openapi_yaml_has_components():
    for name in TEMPLATE_DIRS:
        data = yaml.safe_load((TEMPLATES_DIR / name / "openapi.yaml").read_text())
        assert "components" in data, f"{name}: missing 'components'"

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
    for f in ["README.md", "LICENSE", "CHANGELOG.md", "tiers.json"]:
        assert f in names

def test_pro_zip_has_all_templates():
    tiers = json.loads((PRODUCT_DIR / "tiers.json").read_text())
    t = next(t for t in tiers["tiers"] if t["id"] == "pro")
    with zipfile.ZipFile(DIST_DIR / t["zip_name"]) as zf:
        names = zf.namelist()
    for tpl in PRO_TEMPLATES:
        assert any(n.startswith(f"templates/{tpl}/") for n in names)

def test_starter_zip_excludes_pro_only():
    tiers = json.loads((PRODUCT_DIR / "tiers.json").read_text())
    t = next(t for t in tiers["tiers"] if t["id"] == "starter")
    with zipfile.ZipFile(DIST_DIR / t["zip_name"]) as zf:
        names = zf.namelist()
    for tpl in TEMPLATE_DIRS[4:]:
        assert not any(n.startswith(f"templates/{tpl}/") for n in names)
