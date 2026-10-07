#!/usr/bin/env python3
"""Build the graded "film plates" used by the Remotion compositions.

Input : ../assets/photos/retouched/*.jpg (the owner's real photos, already retouched)
Output: public/plates/<name>.jpg        graded plate (Lanczos-resized, min side >= MIN_SIDE)
        public/plates/<name>-soft.jpg   same plate, defocused (for focus-pull dissolves)
        public/grain/grain-<i>.png      film-grain tiles (overlay blend in the compositions)

The grade only changes tone and colour (exposure, contrast, split toning, highlight halation).
Nothing is added to or removed from the pictures.
"""
from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT.parent / "assets" / "photos" / "retouched"
OUT = ROOT / "public" / "plates"
GRAIN = ROOT / "public" / "grain"
MIN_SIDE = 2200  # covers 1920px / 1080x1920 frames with ~12 % camera-move headroom
MAX_SIDE = 3200

# name -> grade profile. "room": low-key cinematic; "dish": rich but appetising.
PLATES: dict[str, str] = {
    "salle-mur-vins-paysage": "room",
    "salle-mur-vins-portrait": "room",
    "salle-arche-bar": "room",
    "salle-cave-chartreuse": "room",
    "detail-niche-chartreuse": "room",
    "exterieur-ruelle": "room",
    "detail-carreaux-ciment": "room",
    "plat-poulpe": "dish",
    "plat-entrecote": "dish",
    "dessert-moelleux-chocolat": "dish",
    "dessert-pomme-pochee": "dish",
    "dessert-moelleux-fruits-rouges": "dish",
}

PROFILES = {
    # curve: filmic tone curve (input -> output), applied per channel. Low-key for the rooms
    # (walls and ceilings fall into shadow, light sources keep their glow through the halation).
    "room": dict(
        curve=[(0, 0), (0.1, 0.02), (0.25, 0.065), (0.5, 0.2), (0.7, 0.4), (0.85, 0.62), (0.95, 0.8), (1, 0.88)],
        sat=0.9, sh=(0.88, 0.96, 1.18), hi=(1.08, 1.0, 0.84), hal=0.55, bloom=0.30, clarity=0.35,
        floor=(0.010, 0.013, 0.028),
    ),
    "dish": dict(
        curve=[(0, 0), (0.1, 0.035), (0.25, 0.13), (0.5, 0.38), (0.75, 0.68), (0.9, 0.86), (1, 0.96)],
        sat=1.0, sh=(0.94, 0.97, 1.08), hi=(1.05, 1.0, 0.90), hal=0.20, bloom=0.10, clarity=0.25,
        floor=(0.008, 0.010, 0.020),
    ),
}


def smoothstep(e0: float, e1: float, x: np.ndarray) -> np.ndarray:
    t = np.clip((x - e0) / (e1 - e0), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def blur(arr: np.ndarray, radius: float) -> np.ndarray:
    im = Image.fromarray(np.clip(arr * 255.0, 0, 255).astype(np.uint8))
    return np.asarray(im.filter(ImageFilter.GaussianBlur(radius)), dtype=np.float32) / 255.0


def grade(img: Image.Image, p: dict) -> Image.Image:
    x = np.asarray(img.convert("RGB"), dtype=np.float32) / 255.0
    w = x.shape[1]
    luma = np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)
    lum0 = x @ luma
    # light sources, keyed on the ORIGINAL exposure so they keep glowing after the darkening
    hl = (smoothstep(0.72, 0.98, lum0)[..., None] * x).astype(np.float32)

    # 1. local contrast ("clarity") to give the soft sources some texture back
    if p["clarity"]:
        x = np.clip(x + p["clarity"] * (x - blur(x, w * 0.012)), 0, 1)
    # 2. saturation (luma-preserving)
    lum = x @ luma
    x = np.clip(lum[..., None] + (x - lum[..., None]) * p["sat"], 0, 1)
    # 3. filmic low-key tone curve
    xs, ys = zip(*p["curve"])
    x = np.interp(x, xs, ys).astype(np.float32)
    # 4. split toning: navy shadows, warm (pierre doree) highlights
    lum = x @ luma
    k = smoothstep(0.0, 0.7, lum)[..., None]
    mul = np.array(p["sh"], np.float32) * (1 - k) + np.array(p["hi"], np.float32) * k
    x = np.clip(x * mul, 0, 1)
    # 5. halation (tight, red-orange) + bloom (wide, warm) from the light sources
    hal = blur(hl, w * 0.005) * np.array([1.0, 0.52, 0.25], np.float32)
    bloom = blur(hl, w * 0.028) * np.array([1.0, 0.78, 0.5], np.float32)
    glow = np.clip(hal * p["hal"] + bloom * p["bloom"], 0, 1)
    x = 1 - (1 - x) * (1 - glow)  # screen
    # 6. lifted, navy-tinted black floor (film print look)
    floor = np.array(p["floor"], np.float32)
    x = floor + x * (1 - floor)
    return Image.fromarray(np.clip(x * 255.0 + 0.5, 0, 255).astype(np.uint8))


def resize(img: Image.Image) -> Image.Image:
    w, h = img.size
    s = max(MIN_SIDE / min(w, h), 1.0)
    s = min(s, MAX_SIDE / max(w, h))
    if abs(s - 1.0) < 1e-3:
        return img
    return img.resize((round(w * s), round(h * s)), Image.LANCZOS)


def make_grain(n: int = 8, size: int = 512) -> None:
    GRAIN.mkdir(parents=True, exist_ok=True)
    rng = np.random.default_rng(1953)
    for i in range(n):
        g = rng.normal(0.0, 1.0, (size, size)).astype(np.float32)
        im = Image.fromarray(np.clip(128 + g * 38, 0, 255).astype(np.uint8), "L")
        im = im.filter(ImageFilter.GaussianBlur(0.65))  # soft clumps, not digital noise
        a = np.asarray(im, np.float32)
        a = 128 + (a - a.mean()) * (38 / max(a.std(), 1e-3))
        Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), "L").save(GRAIN / f"grain-{i}.png", optimize=True)


def main(names: list[str]) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for name in names or list(PLATES):
        src = SRC / f"{name}.jpg"
        img = resize(Image.open(src))
        graded = grade(img, PROFILES[PLATES[name]])
        graded.save(OUT / f"{name}.jpg", quality=92, subsampling=0, optimize=True)
        soft = graded.filter(ImageFilter.GaussianBlur(max(graded.size) * 0.006))
        soft.save(OUT / f"{name}-soft.jpg", quality=85, optimize=True)
        print(f"{name}: {img.size[0]}x{img.size[1]}")
    make_grain()


if __name__ == "__main__":
    main(sys.argv[1:])
