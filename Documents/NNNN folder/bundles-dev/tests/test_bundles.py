"""
Product Bundles — P36 TDD Tests
"""

import json
import zipfile
from pathlib import Path

REPO_ROOT = Path(__file__).parent.parent
BUNDLES_DIR = REPO_ROOT / "bundles"
DIST_DIR = REPO_ROOT / "dist"

BUNDLE_IDS = [
    "01-devops-complete",
    "02-typescript-fullstack",
    "03-claude-code-master",
]

EXPECTED_PRICES = {
    "01-devops-complete": 99,
    "02-typescript-fullstack": 99,
    "03-claude-code-master": 149,
}

SALES_FILES = [
    "product-listing.md",
    "gumroad-listing.md",
    "lemon-squeezy-listing.md",
    "itch-io-listing.md",
    "faq.md",
    "refund-policy.md",
    "keywords.md",
]


# ─── Root Files ────────────────────────────────────────────────────────────────

class TestRootFiles:
    def test_readme_exists(self):
        assert (REPO_ROOT / "README.md").exists()

    def test_readme_mentions_bundle(self):
        assert "bundle" in (REPO_ROOT / "README.md").read_text().lower()

    def test_build_all_exists(self):
        assert (REPO_ROOT / "build_all.py").exists()


# ─── Bundle Directories ────────────────────────────────────────────────────────

class TestBundleDirectories:
    def test_all_3_bundle_dirs_exist(self):
        for bid in BUNDLE_IDS:
            assert (BUNDLES_DIR / bid).is_dir(), f"Missing bundle dir: {bid}"

    def test_every_bundle_has_bundle_json(self):
        for bid in BUNDLE_IDS:
            assert (BUNDLES_DIR / bid / "bundle.json").exists(), f"Missing bundle.json in {bid}"

    def test_every_bundle_has_readme(self):
        for bid in BUNDLE_IDS:
            assert (BUNDLES_DIR / bid / "README.md").exists(), f"Missing README.md in {bid}"

    def test_every_bundle_has_build_script(self):
        for bid in BUNDLE_IDS:
            assert (BUNDLES_DIR / bid / "build_bundle.py").exists(), f"Missing build_bundle.py in {bid}"

    def test_every_bundle_has_sales_dir(self):
        for bid in BUNDLE_IDS:
            assert (BUNDLES_DIR / bid / "sales").is_dir(), f"Missing sales/ in {bid}"


# ─── bundle.json Quality ──────────────────────────────────────────────────────

class TestBundleJson:
    def _load(self, bid: str) -> dict:
        return json.loads((BUNDLES_DIR / bid / "bundle.json").read_text())

    def test_every_bundle_json_valid(self):
        for bid in BUNDLE_IDS:
            data = self._load(bid)
            assert "name" in data
            assert "price_usd" in data
            assert "products" in data

    def test_devops_bundle_price_99(self):
        assert self._load("01-devops-complete")["price_usd"] == 99

    def test_typescript_bundle_price_99(self):
        assert self._load("02-typescript-fullstack")["price_usd"] == 99

    def test_claude_code_bundle_price_149(self):
        assert self._load("03-claude-code-master")["price_usd"] == 149

    def test_devops_bundle_has_5_products(self):
        data = self._load("01-devops-complete")
        assert len(data["products"]) == 5

    def test_typescript_bundle_has_3_products(self):
        data = self._load("02-typescript-fullstack")
        assert len(data["products"]) == 3

    def test_claude_code_bundle_has_5_products(self):
        data = self._load("03-claude-code-master")
        assert len(data["products"]) == 5

    def test_every_product_entry_has_required_fields(self):
        for bid in BUNDLE_IDS:
            data = self._load(bid)
            for prod in data["products"]:
                assert "name" in prod, f"{bid}: product missing 'name'"
                assert "dir" in prod, f"{bid}: product missing 'dir'"
                assert "tier" in prod, f"{bid}: product missing 'tier'"
                assert "individual_price" in prod, f"{bid}: product missing 'individual_price'"

    def test_every_bundle_has_individual_value_field(self):
        for bid in BUNDLE_IDS:
            data = self._load(bid)
            assert "individual_value" in data, f"{bid}: missing 'individual_value'"

    def test_bundle_price_less_than_individual_value(self):
        for bid in BUNDLE_IDS:
            data = self._load(bid)
            assert data["price_usd"] < data["individual_value"], \
                f"{bid}: bundle price should be less than individual value"

    def test_devops_bundle_includes_github_actions(self):
        data = self._load("01-devops-complete")
        names = [p["name"].lower() for p in data["products"]]
        assert any("github actions" in n or "workflow" in n for n in names)

    def test_typescript_bundle_includes_zod(self):
        data = self._load("02-typescript-fullstack")
        names = [p["name"].lower() for p in data["products"]]
        assert any("zod" in n for n in names)

    def test_claude_code_bundle_includes_skills(self):
        data = self._load("03-claude-code-master")
        names = [p["name"].lower() for p in data["products"]]
        assert any("skill" in n or "claude" in n for n in names)


# ─── Sales Files ───────────────────────────────────────────────────────────────

class TestSalesFiles:
    def test_all_sales_files_exist(self):
        for bid in BUNDLE_IDS:
            for sf in SALES_FILES:
                path = BUNDLES_DIR / bid / "sales" / sf
                assert path.exists(), f"Missing {sf} in {bid}/sales/"

    def test_product_listings_mention_bundle_price(self):
        for bid in BUNDLE_IDS:
            text = (BUNDLES_DIR / bid / "sales" / "product-listing.md").read_text()
            data = json.loads((BUNDLES_DIR / bid / "bundle.json").read_text())
            assert f"${data['price_usd']}" in text, f"{bid}: product-listing missing price"

    def test_product_listings_mention_savings(self):
        for bid in BUNDLE_IDS:
            text = (BUNDLES_DIR / bid / "sales" / "product-listing.md").read_text()
            assert "save" in text.lower() or "value" in text.lower() or "%" in text


# ─── ZIP Bundles ───────────────────────────────────────────────────────────────

class TestZipBundles:
    def _zip_path(self, bid: str) -> Path:
        data = json.loads((BUNDLES_DIR / bid / "bundle.json").read_text())
        return DIST_DIR / data["zip_name"]

    def test_all_bundle_zips_exist(self):
        for bid in BUNDLE_IDS:
            assert self._zip_path(bid).exists(), f"Missing ZIP for {bid}"

    def test_all_zips_have_readme(self):
        for bid in BUNDLE_IDS:
            with zipfile.ZipFile(self._zip_path(bid)) as zf:
                names = zf.namelist()
            assert "README.md" in names, f"{bid} ZIP missing README.md"

    def test_all_zips_have_bundle_json(self):
        for bid in BUNDLE_IDS:
            with zipfile.ZipFile(self._zip_path(bid)) as zf:
                names = zf.namelist()
            assert "bundle.json" in names, f"{bid} ZIP missing bundle.json"

    def test_devops_zip_has_all_5_product_folders(self):
        data = json.loads((BUNDLES_DIR / "01-devops-complete" / "bundle.json").read_text())
        zip_path = self._zip_path("01-devops-complete")
        with zipfile.ZipFile(zip_path) as zf:
            names = zf.namelist()
        for prod in data["products"]:
            folder = prod["folder_name"]
            assert any(folder in n for n in names), f"Missing {folder} in devops bundle ZIP"

    def test_claude_code_zip_non_empty(self):
        zip_path = self._zip_path("03-claude-code-master")
        assert zip_path.stat().st_size > 10_000, "Claude Code bundle ZIP seems too small"
