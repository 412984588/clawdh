"""Build ZIP bundles for social-media-calendar-pack."""
import json
import zipfile
from pathlib import Path

ROOT = Path(__file__).parent
DIST = ROOT / "dist"
DIST.mkdir(exist_ok=True)

TIERS = json.loads((ROOT / "tiers.json").read_text())

ROOT_FILES = ["README.md", "tiers.json", "LICENSE", "CHANGELOG.md"]


def build_zip(tier: dict) -> None:
    zip_path = DIST / tier["zip_name"]
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        # Root files
        for fname in ROOT_FILES:
            fpath = ROOT / fname
            if fpath.exists():
                zf.write(fpath, fname)

        # Template dirs
        for tid in tier["templates"]:
            tdir = ROOT / "templates" / tid
            if tdir.exists():
                for fpath in sorted(tdir.rglob("*")):
                    if fpath.is_file():
                        arcname = str(fpath.relative_to(ROOT))
                        zf.write(fpath, arcname)

    size_kb = zip_path.stat().st_size // 1024
    print(f"Built {zip_path.name} ({size_kb} KB, {len(tier['templates'])} templates)")


if __name__ == "__main__":
    for tier in TIERS["tiers"]:
        build_zip(tier)
    print("Done.")
