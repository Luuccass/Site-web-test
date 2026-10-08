"""Build the self-hosted web fonts (subset WOFF2) from the full google/fonts sources.

Why: the Google Fonts API serves Spectral without small caps (smcp/c2sc) and without U+202F, the
narrow no-break space French typography needs before ; : ! ? € and inside « ». We subset the full
files ourselves, keep the OpenType features we use, and add U+202F (a copy of the thin space).

Cormorant Garamond (V2 display face) is cut to what the site uses, to keep the bytes loaded before
the hero photo low: upright as a variable font limited to weights 300-400 (headlines 300, h3 400),
italic as a static 300 instance (italic accents are always in 300 headlines).

Usage: python build_fonts.py SRC_DIR OUT_DIR
SRC_DIR must contain Spectral-{Light,Regular,Italic,Medium}.ttf, Montserrat-VF.ttf,
CormorantGaramond[wght].ttf and CormorantGaramond-Italic[wght].ttf
(https://github.com/google/fonts/tree/main/ofl/spectral, .../ofl/montserrat, .../ofl/cormorantgaramond,
SIL OFL 1.1).
"""

import os
import sys

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

TEXT_RANGES = [
    (0x20, 0x7E),      # Basic Latin
    (0xA0, 0xFF),      # Latin-1 Supplement (é, à, ç, «, », °, ×, nbsp…)
    (0x152, 0x153),    # Œ œ
    (0x178, 0x178),    # Ÿ
    (0x2009, 0x2009),  # thin space
    (0x2013, 0x2014),  # – —
    (0x2018, 0x201E),  # ‘ ’ ‚ “ ” „
    (0x2026, 0x2026),  # …
    (0x202F, 0x202F),  # narrow no-break space (added below if missing)
    (0x2032, 0x2033),  # ′ ″
    (0x20AC, 0x20AC),  # €
    (0x2192, 0x2192),  # → (only used in print stylesheet)
]
FEATURES = ["kern", "liga", "clig", "ccmp", "locl", "case", "smcp", "c2sc", "onum", "lnum", "tnum", "pnum", "frac", "numr", "dnom"]


def unicodes():
    out = []
    for a, b in TEXT_RANGES:
        out.extend(range(a, b + 1))
    return out


def add_narrow_nbsp(font: TTFont) -> None:
    """Map U+202F to the thin-space glyph (or a narrowed space) when the font lacks it."""
    cmap = font.getBestCmap()
    if 0x202F in cmap:
        return
    source = cmap.get(0x2009) or cmap.get(0x20)
    for table in font["cmap"].tables:
        if table.isUnicode():
            table.cmap[0x202F] = source


def subset_font(src: str, dst: str, keep_unicodes, features=FEATURES) -> None:
    font = TTFont(src)
    add_narrow_nbsp(font)
    options = subset.Options()
    options.layout_features = features
    options.flavor = "woff2"
    options.name_IDs = ["*"]
    options.notdef_outline = True
    options.hinting = False
    options.desubroutinize = True
    sub = subset.Subsetter(options=options)
    sub.populate(unicodes=keep_unicodes)
    sub.subset(font)
    font.flavor = "woff2"
    font.save(dst)
    print(f"{os.path.basename(dst)}: {os.path.getsize(dst) // 1024} KB")


def cut_variable(src: str, dst: str, keep_unicodes, wght) -> None:
    """Subset a variable font, then pin or narrow its weight axis (wght: number or (min, max))."""
    font = TTFont(src)
    add_narrow_nbsp(font)
    options = subset.Options()
    options.layout_features = ["kern", "liga", "calt", "ccmp", "locl", "onum", "lnum", "pnum", "tnum"]  # no small caps or fractions in headlines
    options.name_IDs = ["*"]
    options.notdef_outline = True
    options.hinting = False
    sub = subset.Subsetter(options=options)
    sub.populate(unicodes=keep_unicodes)
    sub.subset(font)  # subset before instancing: instancing first leaves gvar entries for dropped glyphs
    font = instancer.instantiateVariableFont(font, {"wght": wght})
    font.flavor = "woff2"
    font.save(dst)
    print(f"{os.path.basename(dst)}: {os.path.getsize(dst) // 1024} KB")


def main():
    src, out = sys.argv[1:3]
    os.makedirs(out, exist_ok=True)
    text = unicodes()
    for name in ["Spectral-Light", "Spectral-Regular", "Spectral-Italic", "Spectral-Medium"]:
        subset_font(os.path.join(src, f"{name}.ttf"), os.path.join(out, f"{name}.woff2"), text)

    # Montserrat Medium, capitals only: used for the address plaque, like the sign at the door.
    vf = TTFont(os.path.join(src, "Montserrat-VF.ttf"))
    medium = instancer.instantiateVariableFont(vf, {"wght": 500})
    tmp = os.path.join(out, "_montserrat-500.ttf")
    medium.save(tmp)
    caps = [c for c in text if not (0x61 <= c <= 0x7A) and not (0xDF <= c <= 0xFF)]
    subset_font(tmp, os.path.join(out, "Montserrat-Medium-caps.woff2"), caps, ["kern", "case", "lnum", "tnum", "ccmp", "locl"])
    os.remove(tmp)

    # Cormorant Garamond: upright 300-400 (variable), italic 300 (static).
    cut_variable(os.path.join(src, "CormorantGaramond[wght].ttf"), os.path.join(out, "CormorantGaramond-Variable.woff2"), text, (300, 400))
    cut_variable(os.path.join(src, "CormorantGaramond-Italic[wght].ttf"), os.path.join(out, "CormorantGaramond-LightItalic.woff2"), text, 300)


if __name__ == "__main__":
    main()
