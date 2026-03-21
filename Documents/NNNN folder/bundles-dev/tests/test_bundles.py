"""
Product Bundles — TDD Tests (6 bundles)
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
    "04-ai-developer-starter",
    "05-indie-hacker",
    "06-knowledge-worker",
]

EXPECTED_PRICES = {
    "01-devops-complete": 99,
    "02-typescript-fullstack": 99,
    "03-claude-code-master": 149,
    "04-ai-developer-starter": 59,
    "05-indie-hacker": 99,
    "06-knowledge-worker": 79,
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


# ─── Root Files ─────────────────────────────────────────────────────────────

class TestRootFiles:
    def test_readme_exists(self):
        assert (REPO_ROOT / "README.md").exists()

    def test_readme_mentions_bundle(self):
        assert "bundle" in (REPO_ROOT / "README.md").read_text().lower()

    def test_build_all_exists(self):
        assert (REPO_ROOT / "build_all.py").exists()


# ─── Bundle Directories ──────────────────────────────────────────────────────

class TestBundleDirectories:
    def test_all_6_bundle_dirs_exist(self):
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


# ─── bundle.json Quality ─────────────────────────────────────────────────────

class TestBundleJson:
    def _load(self, bid: str) -> dict:
        return json.loads((BUNDLES_DIR / bid / "bundle.json").read_text())

    def test_every_bundle_json_valid(self):
        for bid in BUNDLE_IDS:
            data = self._load(bid)
            assert "name" in data
            assert "price_usd" in data
            assert "products" in data

    def test_every_bundle_has_individual_value_field(self):
        for bid in BUNDLE_IDS:
            data = self._load(bid)
            assert "individual_value" in data, f"{bid}: missing 'individual_value'"

    def test_bundle_price_less_than_individual_value(self):
        for bid in BUNDLE_IDS:
            data = self._load(bid)
            assert data["price_usd"] < data["individual_value"], \
                f"{bid}: bundle price should be less than individual value"

    def test_expected_prices(self):
        for bid, price in EXPECTED_PRICES.items():
            data = self._load(bid)
            assert data["price_usd"] == price, f"{bid}: expected ${price}, got ${data['price_usd']}"

    def test_every_product_entry_has_required_fields(self):
        for bid in BUNDLE_IDS:
            data = self._load(bid)
            for prod in data["products"]:
                assert "name" in prod, f"{bid}: product missing 'name'"
                assert "dir" in prod, f"{bid}: product missing 'dir'"
                assert "tier" in prod, f"{bid}: product missing 'tier'"
                assert "individual_price" in prod, f"{bid}: product missing 'individual_price'"

    def test_devops_bundle_has_5_products(self):
        assert len(self._load("01-devops-complete")["products"]) == 5

    def test_typescript_bundle_has_3_products(self):
        assert len(self._load("02-typescript-fullstack")["products"]) == 3

    def test_claude_code_bundle_has_5_products(self):
        assert len(self._load("03-claude-code-master")["products"]) == 5

    def test_ai_developer_starter_has_3_products(self):
        assert len(self._load("04-ai-developer-starter")["products"]) == 3

    def test_indie_hacker_has_3_products(self):
        assert len(self._load("05-indie-hacker")["products"]) == 3

    def test_knowledge_worker_has_3_products(self):
        assert len(self._load("06-knowledge-worker")["products"]) == 3

    def test_ai_developer_includes_cursor_rules(self):
        names = [p["name"].lower() for p in self._load("04-ai-developer-starter")["products"]]
        assert any("cursor" in n for n in names)

    def test_indie_hacker_includes_agency_blueprint(self):
        names = [p["name"].lower() for p in self._load("05-indie-hacker")["products"]]
        assert any("agency" in n for n in names)

    def test_knowledge_worker_includes_obsidian(self):
        names = [p["name"].lower() for p in self._load("06-knowledge-worker")["products"]]
        assert any("obsidian" in n for n in names)


# ─── Sales Files ─────────────────────────────────────────────────────────────

class TestSalesFiles:
    def test_all_sales_files_exist(self):
        for bid in BUNDLE_IDS:
            for sf in SALES_FILES:
                path = BUNDLES_DIR / bid / "sales" / sf
                assert path.exists(), f"Missing {sf} in {bid}/sales/"

    def test_sales_files_not_empty(self):
        for bid in BUNDLE_IDS:
            for sf in SALES_FILES:
                path = BUNDLES_DIR / bid / "sales" / sf
                assert path.stat().st_size > 50, f"{bid}/{sf} is too small"

    def test_product_listings_mention_bundle_price(self):
        for bid in BUNDLE_IDS:
            text = (BUNDLES_DIR / bid / "sales" / "product-listing.md").read_text()
            data = json.loads((BUNDLES_DIR / bid / "bundle.json").read_text())
            assert f"${data['price_usd']}" in text, f"{bid}: product-listing missing price"

    def test_product_listings_mention_savings(self):
        for bid in BUNDLE_IDS:
            text = (BUNDLES_DIR / bid / "sales" / "product-listing.md").read_text()
            assert "save" in text.lower() or "value" in text.lower() or "%" in text


# ─── ZIP Bundles ─────────────────────────────────────────────────────────────

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

    def test_all_zips_non_empty(self):
        for bid in BUNDLE_IDS:
            assert self._zip_path(bid).stat().st_size > 5_000, f"{bid} ZIP too small"

    def test_devops_zip_has_all_product_folders(self):
        data = json.loads((BUNDLES_DIR / "01-devops-complete" / "bundle.json").read_text())
        with zipfile.ZipFile(self._zip_path("01-devops-complete")) as zf:
            names = zf.namelist()
        for prod in data["products"]:
            assert any(prod["folder_name"] in n for n in names)

    def test_new_bundles_have_product_folders(self):
        for bid in ["04-ai-developer-starter", "05-indie-hacker", "06-knowledge-worker"]:
            data = json.loads((BUNDLES_DIR / bid / "bundle.json").read_text())
            with zipfile.ZipFile(self._zip_path(bid)) as zf:
                names = zf.namelist()
            for prod in data["products"]:
                assert any(prod["folder_name"] in n for n in names), \
                    f"{bid} ZIP missing folder {prod['folder_name']}"
