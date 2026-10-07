"""Cinematic « nocturne » grade for the V2 site (classical image processing, no AI).

The masters in assets/photos/retouched/ were graded light and neutral; full-bleed on a dark page they
look flat and the softness of the sources shows. This grade keeps every pixel's content (no object is
added, removed or moved) and only changes tone and colour:

- filmic exposure curve: deeper shadows, highlight roll-off (lamps glow instead of clipping);
- split toning: shadows lean to the brand's night navy, highlights to warm golden stone;
- local contrast (CLAHE on lightness) to bring back texture in stone, tiles and food;
- optional vignette (per preset) to keep the eye on the subject and calm white ceilings;
- fine luminance grain, so soft sources read as film rather than as low resolution.

Usage: python scripts/photos/v2/grade.py [ids...]   (default: every preset below)
Output: assets/photos/v2/graded/<id>.jpg (quality 92)
"""

import sys
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[3]
SRC = ROOT / "assets/photos/retouched"
OUT = ROOT / "assets/photos/v2/graded"

# ev: exposure; light: luminance above which a pixel counts as a light source and keeps its brightness;
# bloom: warm glow around light sources; black: black point; tone: navy split-tone in the shadows;
# warm: golden tint in the highlights; vignette; top: extra darkening of the top of the frame (white
# ceilings); contrast: mid-tone S-curve; grain: luminance grain (0-255 std); clahe: local contrast; sat.
ROOM = dict(ev=-1.2, light=0.62, bloom=0.45, black=0.03, tone=0.6, warm=0.7, vignette=0.7, top=0.45, contrast=0.25, grain=5.0, clahe=1.15, sat=1.08)
DISH = dict(ev=-0.55, light=0.75, bloom=0.0, black=0.02, tone=0.45, warm=0.4, vignette=0.75, top=0.0, contrast=0.2, grain=3.5, clahe=1.1, sat=1.1)

PRESETS = {
    "salle-mur-vins-paysage": {**ROOM, "light": 0.5, "ev": -1.3},
    "salle-mur-vins": {**ROOM, "light": 0.5, "ev": -1.3},
    "salle-mur-vins-portrait": {**ROOM, "light": 0.5, "ev": -1.3},
    "salle-arche-bar": {**ROOM, "light": 0.8, "ev": -1.0},
    "salle-cave-chartreuse": {**ROOM, "light": 0.78, "ev": -0.9, "top": 0.3},
    "detail-niche-chartreuse": {**ROOM, "light": 0.8, "ev": -0.8, "top": 0.2},
    "exterieur-ruelle": {**ROOM, "light": 0.45, "ev": -0.9, "bloom": 0.6, "top": 0.25},
    "enseigne": {**ROOM, "light": 0.9, "ev": -0.45, "bloom": 0.0, "top": 0.0, "vignette": 0.45, "tone": 0.4},
    "detail-carreaux-ciment": {**ROOM, "light": 0.85, "ev": -0.6, "bloom": 0.0, "top": 0.2},
    "plat-poulpe": {**DISH},
    "plat-entrecote": {**DISH},
    "plat-pate-en-croute": {**DISH, "ev": -0.3},
    "dessert-moelleux-chocolat": {**DISH, "ev": -0.7},
    "dessert-moelleux-fruits-rouges": {**DISH, "ev": -0.6},
    "dessert-pomme-pochee": {**DISH, "ev": -0.6},
    "dessert-ile-flottante": {**DISH, "ev": -0.6},
}

NAVY = np.array([0x0B, 0x10, 0x20], np.float32) / 255.0  # shadows tint (RGB)
GOLD = np.array([0xE2, 0xB8, 0x78], np.float32) / 255.0  # highlights tint (RGB)


def srgb_to_linear(c):
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def linear_to_srgb(c):
    c = np.clip(c, 0, 1)
    return np.where(c <= 0.0031308, c * 12.92, 1.055 * np.power(c, 1 / 2.4) - 0.055)


def filmic(x):
    # Hable-like shoulder: highlights roll off softly, mid-tones keep their contrast.
    a, b, c, d, e, f = 0.22, 0.30, 0.10, 0.20, 0.01, 0.30
    curve = lambda v: ((v * (a * v + c * b) + d * e) / (v * (a * v + b) + d * f)) - e / f
    white = 4.0
    return curve(x * 2.2) / curve(np.float32(white))


def grade(img_bgr, p, seed=7):
    rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0
    lin0 = srgb_to_linear(rgb)
    lin = lin0 * (2.0 ** p["ev"])
    # Light sources (lamps, backlit niches, lantern) keep their brightness: only pixels far above the
    # rest are restored, so walls and ceilings go dark while the lights glow.
    lum0 = (0.2126 * lin0[..., 0] + 0.7152 * lin0[..., 1] + 0.0722 * lin0[..., 2])[..., None]
    keep = np.clip((lum0 - p.get("light", 0.55)) / 0.35, 0, 1) ** 1.5
    lin = lin * (1 - keep) + lin0 * keep
    h0, w0 = lin.shape[:2]
    glow = cv2.GaussianBlur(lin0 * keep, (0, 0), w0 * 0.012) * p.get("bloom", 0.0)
    lin = lin + glow * np.array([1.0, 0.82, 0.55], np.float32)
    lin = filmic(lin)
    out = linear_to_srgb(lin)

    # Local contrast on lightness.
    lab = cv2.cvtColor((out * 255).astype(np.uint8), cv2.COLOR_RGB2LAB)
    clahe = cv2.createCLAHE(clipLimit=p["clahe"], tileGridSize=(8, 8))
    lab[..., 0] = clahe.apply(lab[..., 0])
    out = cv2.cvtColor(lab, cv2.COLOR_LAB2RGB).astype(np.float32) / 255.0

    # Black point: deep but not crushed; then a gentle mid-tone S-curve.
    out = np.clip((out - p["black"]) / (1 - p["black"]), 0, 1)
    k = p.get("contrast", 0.0)
    out = out + k * (out - 0.5) * (1 - np.abs(2 * out - 1))

    # Split toning by luminance.
    lum = (0.2126 * out[..., 0] + 0.7152 * out[..., 1] + 0.0722 * out[..., 2])[..., None]
    shadow_w = np.clip(1 - lum * 2.2, 0, 1) ** 1.5 * p["tone"]
    high_w = np.clip((lum - 0.55) / 0.45, 0, 1) ** 1.2 * p["warm"] * 0.35
    out = out * (1 - shadow_w) + (out * 0.55 + NAVY * 0.45) * shadow_w
    out = out * (1 - high_w) + (out * GOLD / GOLD.max()) * high_w

    # Saturation.
    gray = (0.2126 * out[..., 0] + 0.7152 * out[..., 1] + 0.0722 * out[..., 2])[..., None]
    out = np.clip(gray + (out - gray) * p["sat"], 0, 1)

    # Vignette (elliptical, soft).
    h, w = out.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    nx, ny = (xx - w / 2) / (w / 2), (yy - h / 2) / (h / 2)
    r = np.sqrt(nx**2 * 0.85 + ny**2)
    vig = 1 - p["vignette"] * np.clip((r - 0.55) / 0.85, 0, 1) ** 1.6
    vig = vig * (1 - p.get("top", 0.0) * np.clip(1 - yy / (h * 0.32), 0, 1) ** 1.4)
    out = out * vig[..., None]

    # Fine luminance grain, scaled to the image size so it reads the same at any width.
    rng = np.random.default_rng(seed)
    g = rng.normal(0, p["grain"] / 255.0, (h, w)).astype(np.float32)
    g = cv2.GaussianBlur(g, (0, 0), max(0.6, w / 2400))
    out = np.clip(out + g[..., None] * (0.6 + 0.4 * (1 - out)), 0, 1)

    return cv2.cvtColor((out * 255 + 0.5).astype(np.uint8), cv2.COLOR_RGB2BGR)


def main(ids):
    OUT.mkdir(parents=True, exist_ok=True)
    for pid in ids:
        src = SRC / f"{pid}.jpg"
        img = cv2.imread(str(src), cv2.IMREAD_COLOR)
        res = grade(img, PRESETS[pid])
        cv2.imwrite(str(OUT / f"{pid}.jpg"), res, [cv2.IMWRITE_JPEG_QUALITY, 92])
        print("graded", pid, res.shape[1], "x", res.shape[0])


if __name__ == "__main__":
    main(sys.argv[1:] or list(PRESETS))
