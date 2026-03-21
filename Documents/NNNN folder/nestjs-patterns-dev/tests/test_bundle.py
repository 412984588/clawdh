"""Tests for nestjs-patterns-dev bundle."""
import json
import zipfile
from pathlib import Path

ROOT = Path(__file__).parent.parent
TEMPLATES = ROOT / "templates"
DIST = ROOT / "dist"
SALES = ROOT / "sales"

TEMPLATE_IDS = [
    "01-module-basics",
    "02-dto-validation",
    "03-auth-guards",
    "04-interceptors",
    "05-pipes-filters",
    "06-typeorm-entities",
    "07-prisma-service",
    "08-graphql-resolver",
    "09-websocket-gateway",
    "10-microservices",
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
        assert (TEMPLATES / tid).is_dir(), f"Missing dir: {tid}"


def test_module_files_exist():
    for tid in TEMPLATE_IDS:
        assert (TEMPLATES / tid / "module.ts").exists(), f"Missing module.ts in {tid}"


def test_module_files_contain_nestjs():
    for tid in TEMPLATE_IDS:
        content = (TEMPLATES / tid / "module.ts").read_text()
        assert "@nestjs" in content or "NestFactory" in content or "Injectable" in content, \
            f"module.ts in {tid} missing NestJS reference"


def test_module_files_have_decorators():
    for tid in TEMPLATE_IDS:
        content = (TEMPLATES / tid / "module.ts").read_text()
        assert "@" in content, f"module.ts in {tid} has no decorators"


def test_module_files_not_empty():
    for tid in TEMPLATE_IDS:
        content = (TEMPLATES / tid / "module.ts").read_text().strip()
        assert len(content) > 200, f"module.ts in {tid} too short ({len(content)} chars)"


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
        assert len((SALES / fname).read_text().strip()) > 50, f"Sales file {fname} too short"


def test_starter_zip_exists():
    assert (DIST / "nestjs-patterns-starter-v1.0.0.zip").exists()


def test_pro_zip_exists():
    assert (DIST / "nestjs-patterns-pro-v1.0.0.zip").exists()


def test_starter_zip_has_root_files():
    z = zipfile.ZipFile(DIST / "nestjs-patterns-starter-v1.0.0.zip")
    names = z.namelist()
    assert "README.md" in names
    assert "tiers.json" in names


def test_pro_zip_has_all_templates():
    z = zipfile.ZipFile(DIST / "nestjs-patterns-pro-v1.0.0.zip")
    names = z.namelist()
    for tid in TEMPLATE_IDS:
        assert any(tid in n for n in names), f"Missing template {tid}"


def test_tiers_json_structure():
    data = json.loads((ROOT / "tiers.json").read_text())
    assert "tiers" in data and len(data["tiers"]) == 2


def test_starter_has_five_templates():
    data = json.loads((ROOT / "tiers.json").read_text())
    starter = next(t for t in data["tiers"] if t["id"] == "starter")
    assert len(starter["templates"]) == 5


def test_pro_has_ten_templates():
    data = json.loads((ROOT / "tiers.json").read_text())
    pro = next(t for t in data["tiers"] if t["id"] == "pro")
    assert len(pro["templates"]) == 10


def test_license_exists():
    assert (ROOT / "LICENSE").exists()
    assert "MIT" in (ROOT / "LICENSE").read_text()


def test_changelog_exists():
    assert (ROOT / "CHANGELOG.md").exists()
    assert len((ROOT / "CHANGELOG.md").read_text().strip()) > 20
