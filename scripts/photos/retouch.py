"""Retouch pipeline for the Comme Avant photo set.

Turns the owner-supplied screenshots / phone photos into consistent web masters:
crop (removes Google Maps UI) -> straighten -> denoise -> 2x EDSR upscale ->
neutralise white balance -> tone (levels + soft S-curve, shadow lift) ->
local contrast (CLAHE on L) -> unified warm grade -> vibrance -> output sharpening.

Usage:
  python retouch.py --manifest manifest.json --raw RAW_DIR --out OUT_DIR --model EDSR_x2.pb [--only id1,id2]

Each manifest entry: {"id", "file", "crop": {x0,y0,x1,y1} (0-1 of the original),
"rotate_deg", "wb", "exposure", "noise", "kind" ("food"|"room"|"detail"), optional "tweaks"}.
"""

import argparse
import json
import hashlib
import math
import os

import cv2
import numpy as np

MAX_EDGE = 2400
NOISE_H = {"low": 0, "medium": 2, "high": 4}


def load_rgb(path):
    img = cv2.imread(path, cv2.IMREAD_UNCHANGED)
    if img is None:
        raise FileNotFoundError(path)
    if img.ndim == 3 and img.shape[2] == 4:
        img = img[:, :, :3]
    return img  # BGR uint8


def crop_norm(img, c):
    h, w = img.shape[:2]
    x0, y0 = int(round(c["x0"] * w)), int(round(c["y0"] * h))
    x1, y1 = int(round(c["x1"] * w)), int(round(c["y1"] * h))
    return img[max(0, y0):min(h, y1), max(0, x0):min(w, x1)]


def rotate_and_crop(img, deg):
    """Rotate clockwise by deg and crop to the largest axis-aligned rectangle with no empty corners."""
    if abs(deg) < 0.05:
        return img
    h, w = img.shape[:2]
    m = cv2.getRotationMatrix2D((w / 2, h / 2), -deg, 1.0)
    rotated = cv2.warpAffine(img, m, (w, h), flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_REFLECT)
    a = math.radians(abs(deg))
    # largest rectangle of the original aspect that fits inside the rotated frame
    cos_a, sin_a = math.cos(a), math.sin(a)
    side_long, side_short = (w, h) if w >= h else (h, w)
    if side_short <= 2.0 * sin_a * cos_a * side_long or abs(sin_a - cos_a) < 1e-10:
        x = 0.5 * side_short
        wr, hr = (x / sin_a, x / cos_a) if w >= h else (x / cos_a, x / sin_a)
    else:
        cos_2a = cos_a * cos_a - sin_a * sin_a
        wr, hr = (w * cos_a - h * sin_a) / cos_2a, (h * cos_a - w * sin_a) / cos_2a
    wr, hr = int(wr) - 2, int(hr) - 2
    cx, cy = w // 2, h // 2
    return rotated[cy - hr // 2: cy + hr // 2, cx - wr // 2: cx + wr // 2]


def denoise(img, level):
    h = NOISE_H.get(level, 2)
    if h == 0:
        return img
    return cv2.fastNlMeansDenoisingColored(img, None, h, h, 5, 15)


class Upscaler:
    def __init__(self, model_path):
        self.sr = None
        if model_path and os.path.exists(model_path):
            self.sr = cv2.dnn_superres.DnnSuperResImpl_create()
            self.sr.readModel(model_path)
            name = os.path.basename(model_path).lower()
            scale = int(name.split("_x")[1].split(".")[0])
            self.sr.setModel("edsr", scale)
            self.scale = scale

    def __call__(self, img):
        if self.sr is None:
            return cv2.resize(img, None, fx=2, fy=2, interpolation=cv2.INTER_LANCZOS4)
        return self.sr.upsample(img)


def neutralise_wb(img, mode, strength=1.0):
    """Shift the near-neutral pixels towards a slightly warm neutral (a~+1, b~+5 in Lab)."""
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB).astype(np.float32)
    L, a, b = lab[..., 0], lab[..., 1] - 128.0, lab[..., 2] - 128.0
    chroma = np.sqrt(a * a + b * b)
    mask = (L > 40) & (L < 235) & (chroma < 22)
    if mask.sum() < 500:
        mask = (L > 30) & (L < 240)
    ma, mb = float(a[mask].mean()), float(b[mask].mean())
    target_a, target_b = 1.0, 5.0
    k = {"ok": 0.0, "mixed-light": 0.45}.get(mode, 0.7) * strength
    lab[..., 1] -= (ma - target_a) * k
    lab[..., 2] -= (mb - target_b) * k
    return cv2.cvtColor(np.clip(lab, 0, 255).astype(np.uint8), cv2.COLOR_LAB2BGR)


def tone(img, exposure, kind):
    f = img.astype(np.float32) / 255.0
    lum = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255.0
    lo, hi = np.percentile(lum, 0.4), np.percentile(lum, 99.6)
    hi = max(hi, lo + 0.25)
    # keep deep blacks for low-key food, never fully stretch
    lo = lo * 0.85
    hi = hi + (1.0 - hi) * 0.35
    f = np.clip((f - lo) / (hi - lo), 0, 1)
    gamma = {"under": 0.82, "over": 1.12, "flat-low-contrast": 1.0, "clipped-highlights": 1.05}.get(exposure, 1.0)
    f = np.power(f, gamma)
    # soft S-curve (smoothstep blend)
    s = 0.12 if kind == "food" else 0.08
    curve = f * f * (3 - 2 * f)
    f = f * (1 - s) + curve * s
    # shadow lift so dishes never disappear into the slate
    lift = 0.025 if kind == "food" else 0.035
    f = lift + f * (1 - lift)
    return np.clip(f * 255.0, 0, 255).astype(np.uint8)


def local_contrast(img, amount):
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    clahe = cv2.createCLAHE(clipLimit=1.6, tileGridSize=(8, 8))
    L2 = clahe.apply(lab[..., 0])
    lab[..., 0] = cv2.addWeighted(lab[..., 0], 1 - amount, L2, amount, 0)
    return cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)


def grade(img, kind, warmth=1.0, vibrance=1.0):
    """Unified 'Comme Avant' look: warm highlights, neutral-warm shadows, gentle vibrance."""
    f = img.astype(np.float32) / 255.0
    lum = (0.114 * f[..., 0] + 0.587 * f[..., 1] + 0.299 * f[..., 2])[..., None]
    hi = np.clip((lum - 0.45) / 0.55, 0, 1)
    sh = np.clip((0.4 - lum) / 0.4, 0, 1)
    warm_hi = np.array([-0.008, 0.002, 0.008], np.float32) * warmth   # BGR: less blue, more red in highlights
    warm_sh = np.array([-0.002, 0.000, 0.002], np.float32) * warmth   # barely warm shadows (no muddy brown)
    f = f + hi * warm_hi + sh * warm_sh
    f = np.clip(f, 0, 1)
    # vibrance: boost low-saturation pixels more than saturated ones
    hsv = cv2.cvtColor((f * 255).astype(np.uint8), cv2.COLOR_BGR2HSV).astype(np.float32)
    sat = hsv[..., 1] / 255.0
    boost = (0.05 if kind == "food" else 0.03) * vibrance
    sat = sat + boost * (1 - sat) * sat * 2.0
    hsv[..., 1] = np.clip(sat * 255.0, 0, 255)
    out = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2BGR)
    if kind == "food":
        out = vignette(out, 0.06)
    return out


def vignette(img, strength):
    h, w = img.shape[:2]
    y, x = np.ogrid[:h, :w]
    d = np.sqrt(((x - w / 2) / (w / 2)) ** 2 + ((y - h / 2) / (h / 2)) ** 2) / math.sqrt(2)
    mask = 1 - strength * np.clip((d - 0.45) / 0.55, 0, 1) ** 1.6
    return np.clip(img.astype(np.float32) * mask[..., None], 0, 255).astype(np.uint8)


def sharpen(img, amount=0.55, radius=1.1):
    blur = cv2.GaussianBlur(img, (0, 0), radius)
    return cv2.addWeighted(img, 1 + amount, blur, -amount, 0)


def limit_size(img):
    h, w = img.shape[:2]
    s = MAX_EDGE / max(h, w)
    if s < 1:
        img = cv2.resize(img, (int(w * s), int(h * s)), interpolation=cv2.INTER_AREA)
    return img


def geometry(entry, raw_dir, upscaler, cache_dir):
    """Crop, straighten, light denoise and 2x upscale. Cached because EDSR is slow on CPU."""
    key = json.dumps([entry["file"], entry["crop"], entry.get("rotate_deg", 0), entry.get("noise")], sort_keys=True)
    tag = hashlib.sha1(key.encode()).hexdigest()[:10]
    path = os.path.join(cache_dir, f"{entry['id']}-{tag}.png")
    if os.path.exists(path):
        return cv2.imread(path)
    img = load_rgb(os.path.join(raw_dir, entry["file"]))
    img = crop_norm(img, entry["crop"])
    img = rotate_and_crop(img, entry.get("rotate_deg", 0) or 0)
    img = denoise(img, entry.get("noise", "medium"))
    img = upscaler(img)
    cv2.imwrite(path, img)
    return img


def color(img, entry):
    t = entry.get("tweaks", {})
    kind = entry.get("kind", "room")
    img = neutralise_wb(img, entry.get("wb", "ok"), t.get("wb_strength", 1.0))
    img = tone(img, entry.get("exposure", "ok"), kind)
    img = local_contrast(img, t.get("local_contrast", 0.12 if kind == "food" else 0.18))
    img = grade(img, kind, t.get("warmth", 1.0), t.get("vibrance", 1.0))
    img = sharpen(img, t.get("sharpen", 0.3))
    return limit_size(img)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--manifest", required=True)
    ap.add_argument("--raw", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--model", default="")
    ap.add_argument("--only", default="")
    ap.add_argument("--cache", default="")
    args = ap.parse_args()
    entries = json.load(open(args.manifest))
    only = set(filter(None, args.only.split(",")))
    os.makedirs(args.out, exist_ok=True)
    up = Upscaler(args.model)
    for e in entries:
        if only and e["id"] not in only:
            continue
        if e.get("skip"):
            continue
        cache = args.cache or os.path.join(args.out, "_cache")
        os.makedirs(cache, exist_ok=True)
        out = color(geometry(e, args.raw, up, cache), e)
        path = os.path.join(args.out, e["id"] + ".jpg")
        cv2.imwrite(path, out, [cv2.IMWRITE_JPEG_QUALITY, 92, cv2.IMWRITE_JPEG_PROGRESSIVE, 1])
        print(f"{e['id']}: {out.shape[1]}x{out.shape[0]} -> {path}", flush=True)


if __name__ == "__main__":
    main()
