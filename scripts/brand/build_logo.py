"""Rebuild the Comme Avant logo as clean SVG from the 194 px raster the owner supplied.

The wordmark is set in Montserrat (Medium for COMME AVANT, Bold for the small lines), converted to
outlines so the SVG does not depend on a font. The O of COMME is the cement-tile rosette, redrawn as
simple geometry. This is a faithful reconstruction, NOT the original artwork: ask the owners for the
source file before printing anything.

Usage: python build_logo.py MEDIUM_TTF BOLD_TTF OUT_DIR
"""

import math
import os
import sys

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

NAVY = "#3D435B"
WHITE = "#FFFFFF"
SIZE = 776  # matches the measured 4x upscale of the original


class Setter:
    def __init__(self, path):
        self.font = TTFont(path)
        self.glyphs = self.font.getGlyphSet()
        self.cmap = self.font.getBestCmap()
        self.upm = self.font["head"].unitsPerEm
        self.cap = self.font["OS/2"].sCapHeight

    def advance(self, ch, size, tracking=0.0):
        g = self.cmap[ord(ch)]
        return self.glyphs[g].width * size / self.upm + tracking * size

    def width(self, text, size, tracking=0.0):
        w = sum(self.advance(c, size, tracking) for c in text)
        return w - tracking * size  # no tracking after the last letter

    def path(self, text, x, baseline, size, tracking=0.0, skip=()):
        """Return SVG path data for text whose cap height is drawn above `baseline`."""
        s = size / self.upm
        out = []
        for i, ch in enumerate(text):
            g = self.cmap[ord(ch)]
            if i not in skip:
                pen = SVGPathPen(self.glyphs)
                tpen = TransformPen(pen, (s, 0, 0, -s, x, baseline))
                self.glyphs[g].draw(tpen)
                out.append(pen.getCommands())
            x += self.advance(ch, size, tracking)
        return " ".join(out)

    def glyph_box(self, text, index, x, size, tracking=0.0):
        """x position and advance of letter `index` in `text` starting at x."""
        for i, ch in enumerate(text):
            adv = self.advance(ch, size, tracking)
            if i == index:
                return x, adv - tracking * size
            x += adv
        raise IndexError(index)


def rosette(cx, cy, r_letter, stroke):
    """Cement-tile medallion replacing the O: ring, scalloped outer ring, quatrefoil centre, 4 fleurons."""
    parts = []
    # the letter ring itself
    parts.append(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r_letter - stroke / 2:.1f}" fill="none" stroke="{WHITE}" stroke-width="{stroke:.1f}"/>')
    # scalloped outer ring: 8 lobes, drawn as a single closed path
    R = r_letter + stroke * 1.05
    lobes = 8
    pts = []
    for k in range(lobes * 2):
        a = math.pi * 2 * k / (lobes * 2) - math.pi / 2
        rr = R * (1.0 if k % 2 == 0 else 0.955)
        pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
    d = f"M{pts[0][0]:.1f},{pts[0][1]:.1f} "
    for k in range(1, len(pts) + 1):
        p = pts[k % len(pts)]
        prev = pts[k - 1]
        # quadratic through an outward control point gives soft cusps
        mx, my = (prev[0] + p[0]) / 2, (prev[1] + p[1]) / 2
        ang = math.atan2(my - cy, mx - cx)
        cr = R * 1.012
        d += f"Q{cx + cr * math.cos(ang):.1f},{cy + cr * math.sin(ang):.1f} {p[0]:.1f},{p[1]:.1f} "
    parts.append(f'<path d="{d}Z" fill="none" stroke="{WHITE}" stroke-width="{stroke * 0.3:.1f}" opacity="0.9"/>')
    parts.append(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{R * 0.93:.1f}" fill="none" stroke="{WHITE}" stroke-width="{stroke * 0.12:.1f}" opacity="0.6"/>')
    # quatrefoil centre: 2x2 rounded squares with a cross gap
    q = r_letter * 0.24
    gap = q * 0.22
    for sx in (-1, 1):
        for sy in (-1, 1):
            x = cx + (gap / 2 if sx > 0 else -gap / 2 - q)
            y = cy + (gap / 2 if sy > 0 else -gap / 2 - q)
            parts.append(f'<rect x="{x:.1f}" y="{y:.1f}" width="{q:.1f}" height="{q:.1f}" rx="{q * 0.35:.1f}" fill="{WHITE}"/>')
    # four fleurons on the diagonals, pointing outwards
    for k in range(4):
        a = math.pi / 4 + k * math.pi / 2
        fx, fy = cx + (R + stroke * 0.95) * math.cos(a), cy + (R + stroke * 0.95) * math.sin(a)
        deg = math.degrees(a) + 90
        s = stroke * 0.78
        leaf = (f"M0,{-1.6 * s:.1f} C{0.9 * s:.1f},{-0.9 * s:.1f} {0.7 * s:.1f},{0.2 * s:.1f} 0,{0.6 * s:.1f} "
                f"C{-0.7 * s:.1f},{0.2 * s:.1f} {-0.9 * s:.1f},{-0.9 * s:.1f} 0,{-1.6 * s:.1f} Z")
        parts.append(
            f'<g transform="translate({fx:.1f},{fy:.1f}) rotate({deg:.1f})" fill="{WHITE}">'
            f'<path d="{leaf}"/>'
            f'<circle cx="{-0.95 * s:.1f}" cy="{0.75 * s:.1f}" r="{0.38 * s:.1f}"/>'
            f'<circle cx="{0.95 * s:.1f}" cy="{0.75 * s:.1f}" r="{0.38 * s:.1f}"/></g>'
        )
    return "\n    ".join(parts)


def build(regular, semibold, badge=True):
    reg, semi = Setter(regular), Setter(semibold)
    big = 158            # font size giving the measured ~116 px cap height
    track = 0.02
    small = 26
    small_track = 0.2
    c = SIZE / 2

    w1 = reg.width("COMME", big, track)
    x1 = c - w1 / 2
    base1 = 388
    w2 = reg.width("AVANT", big, track)
    x2 = c - w2 / 2
    base2 = 529
    cap = reg.cap * big / reg.upm

    ox, oadv = reg.glyph_box("COMME", 1, x1, big, track)
    ocx, ocy = ox + oadv / 2, base1 - cap / 2
    stroke = 14.5  # Montserrat Medium stroke at this size
    o_r = cap / 2 + 1.5

    rest_w = semi.width("RESTAURANT", small, small_track)
    dard_w = semi.width("DARDILLY", small, small_track)

    body = [
        f'<path fill="{WHITE}" d="{reg.path("COMME", x1, base1, big, track, skip=(1,))}"/>',
        f'<path fill="{WHITE}" d="{reg.path("AVANT", x2, base2, big, track)}"/>',
        f'<path fill="{WHITE}" d="{semi.path("RESTAURANT", c - rest_w / 2, 200, small, small_track)}"/>',
        f'<path fill="{WHITE}" d="{semi.path("DARDILLY", c - dard_w / 2, 640, small, small_track)}"/>',
        rosette(ocx, ocy, o_r, stroke),
    ]
    bg = f'<circle cx="{c}" cy="{c}" r="{c - 4}" fill="{NAVY}"/>' if badge else ""
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {SIZE} {SIZE}" role="img" aria-labelledby="t">\n'
        f'  <title id="t">Restaurant Comme Avant, Dardilly</title>\n  {bg}\n  <g>\n    '
        + "\n    ".join(body)
        + "\n  </g>\n</svg>\n"
    )


def main():
    regular, semibold, out = sys.argv[1:4]
    os.makedirs(out, exist_ok=True)
    with open(os.path.join(out, "logo-comme-avant.svg"), "w") as f:
        f.write(build(regular, semibold, badge=True))
    with open(os.path.join(out, "logo-comme-avant-wordmark.svg"), "w") as f:
        f.write(build(regular, semibold, badge=False))
    print("ok")


if __name__ == "__main__":
    main()
