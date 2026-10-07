"""Prepare the TrueType fonts embedded in the PDF cartes (react-pdf reads TTF, not WOFF2).

Same subset as the web fonts (scripts/fonts/build_fonts.py): Latin + French punctuation, the
OpenType features we use (tabular lining figures, small caps, kerning), and U+202F (narrow no-break
space, missing from Spectral) mapped to the thin-space glyph.

Usage: python3 prepare_fonts.py SRC_DIR
SRC_DIR must contain Spectral-{Light,Regular,Italic,Medium}.ttf from
https://github.com/google/fonts/tree/main/ofl/spectral (SIL OFL 1.1). Output: scripts/pdf/fonts/.
"""

import os
import sys

from fontTools import subset
from fontTools.ttLib import TTFont

RANGES = [
    (0x20, 0x7E), (0xA0, 0xFF), (0x152, 0x153), (0x178, 0x178), (0x2009, 0x2009), (0x2013, 0x2014),
    (0x2018, 0x201E), (0x2026, 0x2026), (0x202F, 0x202F), (0x20AC, 0x20AC),
]
FEATURES = ["kern", "liga", "ccmp", "locl", "smcp", "c2sc", "lnum", "tnum", "onum", "pnum"]
NAMES = ["Spectral-Light", "Spectral-Regular", "Spectral-Italic", "Spectral-Medium"]


def main() -> None:
    src = sys.argv[1]
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fonts")
    os.makedirs(out, exist_ok=True)
    codepoints = [c for a, b in RANGES for c in range(a, b + 1)]
    for name in NAMES:
        font = TTFont(os.path.join(src, f"{name}.ttf"))
        cmap = font.getBestCmap()
        if 0x202F not in cmap:
            glyph = cmap.get(0x2009) or cmap[0x20]
            for table in font["cmap"].tables:
                if table.isUnicode():
                    table.cmap[0x202F] = glyph
        options = subset.Options()
        options.layout_features = FEATURES
        options.name_IDs = ["*"]
        options.notdef_outline = True
        options.hinting = False
        sub = subset.Subsetter(options=options)
        sub.populate(unicodes=codepoints)
        sub.subset(font)
        dst = os.path.join(out, f"{name}.ttf")
        font.save(dst)
        print(f"{name}.ttf: {os.path.getsize(dst) // 1024} KB")


if __name__ == "__main__":
    main()
