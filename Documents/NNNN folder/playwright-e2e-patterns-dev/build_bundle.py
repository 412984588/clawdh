"""Build starter and pro ZIP bundles for playwright-e2e-patterns-dev."""
import json
import zipfile
from pathlib import Path

ROOT = Path(__file__).parent
DIST = ROOT / "dist"
DIST.mkdir(exist_ok=True)

tiers = json.loads((ROOT / "tiers.json").read_text())["tiers"]

for tier in tiers:
    zip_path = DIST / tier["zip_name"]
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for fname in ("README.md", "tiers.json", "LICENSE", "CHANGELOG.md"):
            src = ROOT / fname
            if src.exists():
                zf.write(src, fname)
        for tid in tier["templates"]:
            tdir = ROOT / "templates" / tid
            if tdir.is_dir():
                for fpath in sorted(tdir.rglob("*")):
                    if fpath.is_file():
                        zf.write(fpath, fpath.relative_to(ROOT))
    print(f"Built {zip_path.name} ({zip_path.stat().st_size // 1024}KB)")

print("Done.")
