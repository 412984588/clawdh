"""Tests for hono-api-patterns-dev bundle."""
import json
import zipfile
from pathlib import Path

ROOT = Path(__file__).parent.parent
TEMPLATES = ROOT / "templates"
DIST = ROOT / "dist"
SALES = ROOT / "sales"

TEMPLATE_IDS = [
    "01-app-basics",
    "02-zod-validation",
    "03-jwt-auth",
    "04-cors-middleware",
    "05-rpc-client",
    "06-cloudflare-workers",
    "07-streaming-sse",
    "08-testing-hono",
    "09-websockets",
    "10-openapi-spec",
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


def test_template_dirs_exist():
    for tid in TEMPLATE_IDS:
        assert (TEMPLATES / tid).is_dir(), f"Missing template dir: {tid}"


def test_app_files_exist():
    for tid in TEMPLATE_IDS:
        assert (TEMPLATES / tid / "app.ts").exists(), f"Missing app.ts in {tid}"


def test_app_files_contain_hono():
    for tid in TEMPLATE_IDS:
        content = (TEMPLATES / tid / "app.ts").read_text()
        assert "hono" in content.lower() or "Hono" in content, \
            f"app.ts in {tid} missing Hono reference"


def test_app_files_have_code():
    for tid in TEMPLATE_IDS:
        content = (TEMPLATES / tid / "app.ts").read_text()
        assert "function " in content or "const " in content or "=>" in content, \
            f"app.ts in {tid} has no code"


def test_app_files_not_empty():
    for tid in TEMPLATE_IDS:
        content = (TEMPLATES / tid / "app.ts").read_text().strip()
        assert len(content) > 200, f"app.ts in {tid} too short ({len(content)} chars)"


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
    assert (DIST / "hono-api-patterns-starter-v1.0.0.zip").exists()


def test_pro_zip_exists():
    assert (DIST / "hono-api-patterns-pro-v1.0.0.zip").exists()


def test_starter_zip_has_root_files():
    z = zipfile.ZipFile(DIST / "hono-api-patterns-starter-v1.0.0.zip")
    names = z.namelist()
    assert "README.md" in names
    assert "tiers.json" in names


def test_pro_zip_has_all_templates():
    z = zipfile.ZipFile(DIST / "hono-api-patterns-pro-v1.0.0.zip")
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
