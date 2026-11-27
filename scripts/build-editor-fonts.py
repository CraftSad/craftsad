"""Build the 3D-editor fonts as small static WOFF files (Latin + Cyrillic).

The editor turns text into printable outlines with opentype.js, which needs a
real TTF/OTF/WOFF file and lays out variable fonts incorrectly (advance widths
and kerning stay at the default master). Every weight is therefore pinned
offline, subset and saved as its own file; the same file drives the on-screen
preview through @font-face.

Each output is a modified version under the SIL Open Font License, so it gets
its own family name "<Name> 3dbirka" (required when the licence reserves the
original name) and ships with the original licence text.

Sources are the OFL directories of https://github.com/google/fonts, e.g.
`ofl/rubik/Rubik[wght].ttf` + `ofl/rubik/OFL.txt`.

Usage (originals live outside the repo; outputs are committed):
    python -I scripts/build-editor-fonts.py --src <dir>/ofl
"""
import argparse
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parents[1]
PUBLIC_FONTS = ROOT / "apps/app/public/fonts"
OUTPUT = PUBLIC_FONTS / "editor"

# id -> (google/fonts file inside its family dir, name, pinned weights)
FONTS = {
    "manrope": (None, "Manrope", [500, 700, 800]),
    "rubik": ("Rubik[wght].ttf", "Rubik", [500, 700, 900]),
    "montserrat": ("Montserrat[wght].ttf", "Montserrat", [600, 800, 900]),
    "unbounded": ("Unbounded[wght].ttf", "Unbounded", [400, 700, 900]),
    "comfortaa": ("Comfortaa[wght].ttf", "Comfortaa", [400, 700]),
    "lora": ("Lora[wght].ttf", "Lora", [500, 700]),
    "caveat": ("Caveat[wght].ttf", "Caveat", [400, 700]),
    "jetbrains-mono": (
        "JetBrainsMono[wght].ttf",
        "JetBrains Mono",
        [500, 700],
    ),
    "pt-sans-narrow": ("PT_Sans-Narrow-Web-Bold.ttf", "PT Sans Narrow", [700]),
    "russo-one": ("RussoOne-Regular.ttf", "Russo One", [400]),
    "marck-script": ("MarckScript-Regular.ttf", "Marck Script", [400]),
}
WEIGHT_NAMES = {
    400: "Regular",
    500: "Medium",
    600: "SemiBold",
    700: "Bold",
    800: "ExtraBold",
    900: "Black",
}

# Basic Latin, Latin-1, Latin Extended-A, Cyrillic (+ Ukrainian Ge), dashes,
# quotes, arrows, currency and the marks plant names tend to carry.
UNICODES = (
    "U+0020-007E,U+00A0-00FF,U+0100-017F,U+0400-045F,U+0490-0491,U+2010-2027,"
    "U+2030,U+2032-2033,U+2039-203A,U+2044,U+2052,U+2190-2193,U+2196-2199,"
    "U+20AE,U+20B4,U+20B8,U+20BA,U+20BC,U+20BD,U+20AC,U+20BF,U+2116,U+2122,"
    "U+00A9,U+00AE,U+00B7,U+2126,U+2212"
)
# Every font must be able to print these; the build fails otherwise.
REQUIRED = (
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
    "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя"
    "0123456789.,!?-–—№"
)
SUFFIX = "3dbirka"
ITALIC, BOLD, REGULAR = 0, 5, 6  # OS/2 fsSelection bits


def source(font_id: str, ofl: Path) -> tuple[Path, str]:
    filename, _, _ = FONTS[font_id]
    if filename is None:  # Manrope already ships with the storefront.
        return PUBLIC_FONTS / "manrope.ttf", (
            PUBLIC_FONTS / "OFL.txt"
        ).read_text(encoding="utf-8")
    # "[wght]" is part of the file name, so match by suffix instead of glob.
    path = next(path for path in ofl.glob(f"*/{filename.split('[')[0]}*")
                if path.name == filename)
    return path, (path.parent / "OFL.txt").read_text(encoding="utf-8")


def rename(font: TTFont, name: str, weight: int) -> None:
    """Give the modified font its own name (OFL reserved font names)."""
    family = f"{name} {SUFFIX}"
    style = WEIGHT_NAMES[weight]
    # Classic four-style scheme: the other weights form their own families.
    family_name = family if style in ("Regular", "Bold") else f"{family} {style}"
    subfamily = "Bold" if weight >= 700 else "Regular"
    records = {
        1: family_name,
        2: subfamily,
        3: f"3dbirka: {name} {style}",
        4: family if style == "Regular" else f"{family} {style}",
        6: f"{name.replace(' ', '')}{SUFFIX}-{style}",
    }
    table = font["name"]
    # Typographic family/subfamily (16, 17) and WWS (21, 22) would contradict
    # the names above; the copyright and licence records are kept as they are.
    table.names = [
        record
        for record in table.names
        if record.nameID not in (16, 17, 21, 22) and record.nameID not in records
    ]
    for name_id, value in records.items():
        table.setName(value, name_id, 3, 1, 0x409)  # Windows, Unicode, en-US
        table.setName(value, name_id, 1, 0, 0)  # Macintosh, Roman, English
    is_bold = weight >= 700
    flags = font["OS/2"].fsSelection & ~((1 << ITALIC) | (1 << BOLD) | (1 << REGULAR))
    font["OS/2"].fsSelection = flags | (1 << (BOLD if is_bold else REGULAR))
    font["OS/2"].usWeightClass = weight
    font["head"].macStyle = 1 if is_bold else 0


def build(font_id: str, weight: int, path: Path, license_text: str) -> int:
    font = TTFont(path)
    if "fvar" in font:
        font = instantiateVariableFont(font, {"wght": weight}, inplace=False)
    options = subset.Options()
    # Kerning only: the outlines are extruded, so no shaping ever runs on them.
    options.layout_features = ["kern"]
    options.hinting = False
    options.notdef_outline = True
    options.recalc_bounds = True
    options.recalc_timestamp = False
    subsetter = subset.Subsetter(options)
    subsetter.populate(unicodes=subset.parse_unicodes(UNICODES))
    subsetter.subset(font)
    missing = sorted({char for char in REQUIRED if ord(char) not in font.getBestCmap()})
    if missing:
        raise SystemExit(f"{font_id} {weight}: missing glyphs {missing}")
    rename(font, FONTS[font_id][1], weight)
    output = OUTPUT / f"{font_id}-{weight}.woff"
    output.parent.mkdir(parents=True, exist_ok=True)
    font.flavor = "woff"
    font.save(output)
    (OUTPUT / "licenses").mkdir(parents=True, exist_ok=True)
    (OUTPUT / "licenses" / f"{font_id}-OFL.txt").write_text(
        license_text, encoding="utf-8", newline="\n"
    )
    return output.stat().st_size


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--src", type=Path, required=True, help="ofl/ directory")
    args = parser.parse_args()
    for font_id, (_, name, weights) in FONTS.items():
        path, license_text = source(font_id, args.src)
        for weight in weights:
            size = build(font_id, weight, path, license_text)
            print(f"{font_id}-{weight}: {name} {WEIGHT_NAMES[weight]} -> {size} B")


if __name__ == "__main__":
    main()
