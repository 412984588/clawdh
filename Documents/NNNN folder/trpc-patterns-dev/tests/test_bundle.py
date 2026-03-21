"""Tests for trpc-patterns-dev bundle."""
import zipfile
from pathlib import Path

ROOT = Path(__file__).parent.parent
TEMPLATES = ROOT / "templates"
DIST = ROOT / "dist"
SALES = ROOT / "sales"

TEMPLATE_IDS = [
    "01-router-basics",
    "02-context-middleware",
    "03-error-handling",
    "04-zod-input",
    "05-subscriptions",
    "06-file-upload",
    "07-batch-requests",
    "08-testing-trpc",
    "09-nextjs-integration",
    "10-infinite-queries",
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


def test_router_files_exist():
    for tid in TEMPLATE_IDS:
        assert (TEMPLATES / tid / "router.ts").exists(), f"Missing router.ts in {tid}"


def test_router_files_contain_trpc():
    for tid in TEMPLATE_IDS:
        content = (TEMPLATES / tid / "router.ts").read_text()
        assert "trpc" in content.lower() or "initTRPC" in content or "@trpc" in content, \
            f"router.ts in {tid} missing tRPC reference"


def test_router_files_have_functions():
    for tid in TEMPLATE_IDS:
        content = (TEMPLATES / tid / "router.ts").read_text()
        assert "function " in content or "const " in content or "=>" in content, \
            f"router.ts in {tid} has no function definitions"


def test_router_files_not_empty():
    for tid in TEMPLATE_IDS:
        content = (TEMPLATES / tid / "router.ts").read_text().strip()
        assert len(content) > 200, f"router.ts in {tid} is too short ({len(content)} chars)"


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
        assert len(content) > 50, f"Sales file {fname} is too short"


def test_starter_zip_exists():
    assert (DIST / "trpc-patterns-starter-v1.0.0.zip").exists()


def test_pro_zip_exists():
    assert (DIST / "trpc-patterns-pro-v1.0.0.zip").exists()


def test_starter_zip_has_root_files():
    z = zipfile.ZipFile(DIST / "trpc-patterns-starter-v1.0.0.zip")
    names = z.namelist()
    assert "README.md" in names
    assert "tiers.json" in names


def test_pro_zip_has_all_templates():
    z = zipfile.ZipFile(DIST / "trpc-patterns-pro-v1.0.0.zip")
    names = z.namelist()
    for tid in TEMPLATE_IDS:
        assert any(tid in n for n in names), f"Pro ZIP missing template {tid}"


def test_tiers_json_exists():
    assert (ROOT / "tiers.json").exists()


def test_tiers_json_structure():
    import json
    data = json.loads((ROOT / "tiers.json").read_text())
    assert "tiers" in data
    assert len(data["tiers"]) == 2
    assert data["tiers"][0]["id"] == "starter"
    assert data["tiers"][1]["id"] == "pro"


def test_starter_tier_has_five_templates():
    import json
    data = json.loads((ROOT / "tiers.json").read_text())
    starter = next(t for t in data["tiers"] if t["id"] == "starter")
    assert len(starter["templates"]) == 5


def test_pro_tier_has_ten_templates():
    import json
    data = json.loads((ROOT / "tiers.json").read_text())
    pro = next(t for t in data["tiers"] if t["id"] == "pro")
    assert len(pro["templates"]) == 10


def test_license_exists():
    assert (ROOT / "LICENSE").exists()
    content = (ROOT / "LICENSE").read_text()
    assert "MIT" in content
