"""
Build Claude Code Master Bundle ZIP.
"""

import json
import zipfile
from pathlib import Path

BUNDLE_DIR = Path(__file__).parent
NNNN_ROOT = BUNDLE_DIR.parent.parent.parent
DIST_DIR = BUNDLE_DIR.parent.parent / "dist"
BUNDLE_JSON = BUNDLE_DIR / "bundle.json"


def get_source_zip(product: dict) -> Path:
    product_dir = NNNN_ROOT / product["dir"]
    tiers_file = product_dir / "tiers.json"
    tiers = json.loads(tiers_file.read_text())
    tier = next(t for t in tiers["tiers"] if t["id"] == product["tier"])
    return product_dir / "dist" / tier["zip_name"]


def main():
    bundle = json.loads(BUNDLE_JSON.read_text())
    DIST_DIR.mkdir(exist_ok=True)
    zip_path = DIST_DIR / bundle["zip_name"]

    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as out_zf:
        out_zf.write(BUNDLE_DIR / "README.md", "README.md")
        out_zf.write(BUNDLE_JSON, "bundle.json")

        for product in bundle["products"]:
            folder = product["folder_name"]
            src_zip = get_source_zip(product)
            if not src_zip.exists():
                raise FileNotFoundError(f"Source ZIP not found: {src_zip}")
            with zipfile.ZipFile(src_zip) as src_zf:
                for item in src_zf.infolist():
                    data = src_zf.read(item.filename)
                    out_zf.writestr(f"{folder}/{item.filename}", data)
            print(f"  + {folder} ({src_zip.name})")

    size_kb = zip_path.stat().st_size / 1024
    print(f"\nBuilt {zip_path.name} ({size_kb:.0f} KB)")
    print(f"Individual value: ${bundle['individual_value']} → Bundle: ${bundle['price_usd']}")


if __name__ == "__main__":
    main()
