"""AI super-resolution restore of the photo masters (Real-ESRGAN, open source, CPU only).

Why: the masters in assets/photos/retouched/ were made by scripts/photos/retouch.py from small Google
Maps screenshots / phone photos (about 1000 px on the long side), with a light NL-means denoise and a
2x OpenCV EDSR upscale. Full-screen they look soft and smeary. This script re-runs the same pipeline
from the ORIGINAL sources (owner's Drive folder « Site web test/assets/photos », same crop and
straightening as scripts/photos/manifest.json) and only swaps the "denoise + 2x EDSR" step for
Real-ESRGAN x4 followed by an area downscale. The colour stage of retouch.py (white balance, tone,
local contrast, warm grade, inpaint/blur rectangles, output sharpening) is reused unchanged, so a
restored master differs from the old one only by the upscaler (checked: retouch.color() on the cached
EDSR geometry reproduces the old masters byte for byte).

Models (Real-ESRGAN, BSD-3-Clause, https://github.com/xinntao/Real-ESRGAN, weights from its GitHub
releases; network definitions below are transcriptions of basicsr/realesrgan archs):
  x4plus   RealESRGAN_x4plus.pth (release v0.1.0, sha256 4fa0d389...)  RRDBNet, 23 RRDB blocks.
  general  realesr-general-x4v3.pth (v0.2.5.0, sha256 8dc7edb9...) and realesr-general-wdn-x4v3.pth
           (v0.2.5.0, sha256 1641f8c4...), SRVGGNetCompact 64 feat / 32 conv, interpolated with the
           official "denoise strength" DN: weights = DN * general + (1 - DN) * wdn (DN 0.5 = moderate).
Runtime: torch 2.14.1 from PyPI on CPU (4 threads, fp32), tiles of --tile px with --pad px of context.
Output: x4 result downscaled (INTER_AREA) to --long px on the long side (never above the native x4),
then retouch.color() with output sharpening --sharpen (old masters: 0.3 at radius 0.8).

Usage (run with python -I, it loads downloaded weights):
  python -I scripts/photos/v2/restore.py sr      --raw RAW --weights W --cache C --model general [--dn 0.5] [--only a,b]
  python -I scripts/photos/v2/restore.py finish  --cache C --model general --out DIR [--only a,b]
  python -I scripts/photos/v2/restore.py publish --cache C --raw RAW [--out DIR]  # CHOSEN -> masters (or DIR)
"""

import argparse
import copy
import json
import sys
import time
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / "scripts/photos"))
import retouch  # noqa: E402  (crop/straighten + colour stage of the original pipeline)

MANIFEST = ROOT / "scripts/photos/manifest.json"
MASTERS = ROOT / "assets/photos/retouched"
SKIP = {"salle-allee-carreaux", "detail-chartreuse-etagere"}  # not publishable

LONG = 2800      # target long side of a restored master (px)
SHARPEN = 0.15   # output sharpening amount for AI-upscaled masters (radius 0.8, as retouch.py)

# Per-photo decision after comparing with the old EDSR masters at display size and at 3x zoom (see
# assets/photos/README.md). The GAN invents detail wherever the source is too small to resolve it:
# wicker weave of the lamps, label art on the bottles, the sign's rosette, letter-like glyphs on worn
# plaques, the knife's engraved text (erased). So it is used only on the two softest full-bleed photos,
# toned down (blend) and with every mark or ornament protected: inside each `protect` box (x0, y0, x1,
# y1 as fractions of the frame) the pixels are the plain Lanczos upscale of the source. Photos not
# listed keep their old master.
CHOSEN = {
    "exterieur-ruelle": {
        "model": "general", "dn": 0.5, "blend": 0.6,
        "protect": [
            (0.48, 0.35, 0.56, 0.42),    # worn wall plaque under the drainpipe (the GAN draws a glyph)
            (0.055, 0.80, 0.095, 0.86),  # green house plaque and notice by the door (icon redrawn)
        ],
    },
    "enseigne": {
        "model": "general", "dn": 0.5, "blend": 1.0,  # flat navy plate: full denoise removes the JPEG blocks
        "protect": [
            (0.31, 0.55, 0.45, 0.85),    # rosette of the logo around the « O » (the GAN breaks it apart)
        ],
    },
}
FEATHER = 0.012  # soft edge of a protect box, fraction of the long side


# --------------------------------------------------------------------------------------------- nets
def build_nets():
    import torch
    import torch.nn as nn
    import torch.nn.functional as F

    class ResidualDenseBlock(nn.Module):
        def __init__(self, nf=64, gc=32):
            super().__init__()
            self.conv1 = nn.Conv2d(nf, gc, 3, 1, 1)
            self.conv2 = nn.Conv2d(nf + gc, gc, 3, 1, 1)
            self.conv3 = nn.Conv2d(nf + 2 * gc, gc, 3, 1, 1)
            self.conv4 = nn.Conv2d(nf + 3 * gc, gc, 3, 1, 1)
            self.conv5 = nn.Conv2d(nf + 4 * gc, nf, 3, 1, 1)
            self.lrelu = nn.LeakyReLU(0.2, inplace=True)

        def forward(self, x):
            x1 = self.lrelu(self.conv1(x))
            x2 = self.lrelu(self.conv2(torch.cat((x, x1), 1)))
            x3 = self.lrelu(self.conv3(torch.cat((x, x1, x2), 1)))
            x4 = self.lrelu(self.conv4(torch.cat((x, x1, x2, x3), 1)))
            x5 = self.conv5(torch.cat((x, x1, x2, x3, x4), 1))
            return x5 * 0.2 + x

    class RRDB(nn.Module):
        def __init__(self, nf, gc=32):
            super().__init__()
            self.rdb1 = ResidualDenseBlock(nf, gc)
            self.rdb2 = ResidualDenseBlock(nf, gc)
            self.rdb3 = ResidualDenseBlock(nf, gc)

        def forward(self, x):
            return self.rdb3(self.rdb2(self.rdb1(x))) * 0.2 + x

    class RRDBNet(nn.Module):
        """ESRGAN generator, scale 4 (RealESRGAN_x4plus)."""

        def __init__(self, nf=64, nb=23, gc=32):
            super().__init__()
            self.conv_first = nn.Conv2d(3, nf, 3, 1, 1)
            self.body = nn.Sequential(*[RRDB(nf, gc) for _ in range(nb)])
            self.conv_body = nn.Conv2d(nf, nf, 3, 1, 1)
            self.conv_up1 = nn.Conv2d(nf, nf, 3, 1, 1)
            self.conv_up2 = nn.Conv2d(nf, nf, 3, 1, 1)
            self.conv_hr = nn.Conv2d(nf, nf, 3, 1, 1)
            self.conv_last = nn.Conv2d(nf, 3, 3, 1, 1)
            self.lrelu = nn.LeakyReLU(0.2, inplace=True)

        def forward(self, x):
            feat = self.conv_first(x)
            feat = feat + self.conv_body(self.body(feat))
            feat = self.lrelu(self.conv_up1(F.interpolate(feat, scale_factor=2, mode="nearest")))
            feat = self.lrelu(self.conv_up2(F.interpolate(feat, scale_factor=2, mode="nearest")))
            return self.conv_last(self.lrelu(self.conv_hr(feat)))

    class SRVGGNetCompact(nn.Module):
        """Compact VGG-style SR net (realesr-general-x4v3)."""

        def __init__(self, nf=64, nc=32, up=4):
            super().__init__()
            self.up = up
            body = [nn.Conv2d(3, nf, 3, 1, 1), nn.PReLU(num_parameters=nf)]
            for _ in range(nc):
                body += [nn.Conv2d(nf, nf, 3, 1, 1), nn.PReLU(num_parameters=nf)]
            body.append(nn.Conv2d(nf, 3 * up * up, 3, 1, 1))
            self.body = nn.ModuleList(body)
            self.upsampler = nn.PixelShuffle(up)

        def forward(self, x):
            out = x
            for layer in self.body:
                out = layer(out)
            return self.upsampler(out) + F.interpolate(x, scale_factor=self.up, mode="nearest")

    return torch, RRDBNet, SRVGGNetCompact


def load_model(name, weights_dir, dn):
    torch, RRDBNet, SRVGGNetCompact = build_nets()
    torch.set_num_threads(4)
    w = Path(weights_dir)
    load = lambda p: torch.load(p, map_location="cpu", weights_only=True)  # noqa: E731  (no pickle code)
    if name == "x4plus":
        net = RRDBNet()
        sd = load(w / "RealESRGAN_x4plus.pth")
        net.load_state_dict(sd["params_ema"] if "params_ema" in sd else sd["params"], strict=True)
    elif name == "general":
        net = SRVGGNetCompact()
        a = load(w / "realesr-general-x4v3.pth")["params"]
        b = load(w / "realesr-general-wdn-x4v3.pth")["params"]
        net.load_state_dict({k: dn * a[k] + (1 - dn) * b[k] for k in a}, strict=True)
    else:
        raise ValueError(name)
    return torch, net.eval()


def upscale4(torch, net, bgr, tile, pad):
    """x4 super-resolution of a BGR uint8 image, tiled; each tile sees `pad` px of real context."""
    pre = 8  # reflect pre-pad so the outer border also has context
    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
    rgb = cv2.copyMakeBorder(rgb, pre, pre, pre, pre, cv2.BORDER_REFLECT_101)
    x = torch.from_numpy(rgb.astype(np.float32).transpose(2, 0, 1) / 255.0).unsqueeze(0)
    h, w = rgb.shape[:2]
    out = np.zeros((h * 4, w * 4, 3), np.float32)
    with torch.inference_mode():
        for y0 in range(0, h, tile):
            for x0 in range(0, w, tile):
                y1, x1 = min(y0 + tile, h), min(x0 + tile, w)
                py0, px0, py1, px1 = max(y0 - pad, 0), max(x0 - pad, 0), min(y1 + pad, h), min(x1 + pad, w)
                o = net(x[:, :, py0:py1, px0:px1])[0].clamp_(0, 1).numpy().transpose(1, 2, 0)
                oy, ox = (y0 - py0) * 4, (x0 - px0) * 4
                out[y0 * 4:y1 * 4, x0 * 4:x1 * 4] = o[oy:oy + (y1 - y0) * 4, ox:ox + (x1 - x0) * 4]
    out = out[pre * 4:-pre * 4, pre * 4:-pre * 4]
    return cv2.cvtColor((out * 255.0 + 0.5).astype(np.uint8), cv2.COLOR_RGB2BGR)


# ------------------------------------------------------------------------------------------ pipeline
def entries(only):
    es = [e for e in json.load(open(MANIFEST)) if e["id"] not in SKIP and not e.get("skip")]
    sel = set(filter(None, (only or "").split(",")))
    return [e for e in es if not sel or e["id"] in sel]


def geometry(entry, raw_dir):
    """Same crop + straightening as retouch.geometry(), on the original pixels, without denoise/EDSR."""
    img = retouch.load_rgb(str(Path(raw_dir) / entry["file"]))
    img = retouch.crop_norm(img, entry["crop"])
    return retouch.rotate_and_crop(img, entry.get("rotate_deg", 0) or 0)


def model_tag(model, dn):
    return f"general-dn{dn:.2f}" if model == "general" else model


def protect_mask(shape, boxes):
    """Float mask (1 inside the boxes) with a feathered edge."""
    h, w = shape[:2]
    m = np.zeros((h, w), np.float32)
    for x0, y0, x1, y1 in boxes:
        m[round(y0 * h):round(y1 * h), round(x0 * w):round(x1 * w)] = 1
    sigma = FEATHER * max(h, w) / 2
    return np.clip(cv2.GaussianBlur(m, (0, 0), sigma) * 1.6, 0, 1)[..., None] if boxes else m[..., None]


def finish(x4, entry, long_side=LONG, sharpen=SHARPEN, blend=1.0, raw_dir=None, protect=()):
    """Area-downscale the x4 result to the target size, then the unchanged colour stage of retouch.py.

    blend < 1 mixes the AI result with a plain Lanczos upscale of the same source pixels
    (blend * AI + (1 - blend) * Lanczos): a "detail strength" knob that tones down GAN texture.
    """
    h, w = x4.shape[:2]
    s = min(1.0, long_side / max(h, w))
    size = (round(w * s), round(h * s))
    img = cv2.resize(x4, size, interpolation=cv2.INTER_AREA) if s < 1 else x4
    if blend < 1 or protect:
        base = cv2.resize(geometry(entry, raw_dir), size, interpolation=cv2.INTER_LANCZOS4)
        if blend < 1:
            img = cv2.addWeighted(img, blend, base, 1 - blend, 0)
        if protect:
            m = protect_mask(img.shape, protect)
            img = (img.astype(np.float32) * (1 - m) + base.astype(np.float32) * m).round().clip(0, 255).astype(np.uint8)
    e = copy.deepcopy(entry)
    e.setdefault("tweaks", {}).setdefault("sharpen", sharpen)
    retouch.MAX_EDGE = max(img.shape[:2])  # no further downscale inside color()
    return retouch.color(img, e)


def write_jpg(path, img):
    cv2.imwrite(str(path), img, [cv2.IMWRITE_JPEG_QUALITY, 92, cv2.IMWRITE_JPEG_PROGRESSIVE, 1])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("cmd", choices=["sr", "finish", "publish"])
    ap.add_argument("--raw", help="folder with the original Drive sources (210934.png, ...)")
    ap.add_argument("--weights", help="folder with the Real-ESRGAN .pth files")
    ap.add_argument("--cache", required=True, help="folder for the full-resolution x4 results")
    ap.add_argument("--model", default="general", choices=["general", "x4plus"])
    ap.add_argument("--dn", type=float, default=0.5, help="denoise strength for the general model")
    ap.add_argument("--tile", type=int, default=320)
    ap.add_argument("--pad", type=int, default=24)
    ap.add_argument("--long", type=int, default=LONG)
    ap.add_argument("--sharpen", type=float, default=SHARPEN)
    ap.add_argument("--blend", type=float, default=1.0, help="AI share vs a Lanczos upscale (1 = pure AI)")
    ap.add_argument("--out", help="output folder for candidate masters (finish)")
    ap.add_argument("--only", default="")
    args = ap.parse_args()
    cache = Path(args.cache)

    if args.cmd == "sr":
        torch, net = load_model(args.model, args.weights, args.dn)
        d = cache / model_tag(args.model, args.dn)
        d.mkdir(parents=True, exist_ok=True)
        for e in entries(args.only):
            t = time.time()
            src = geometry(e, args.raw)
            x4 = upscale4(torch, net, src, args.tile, args.pad)
            cv2.imwrite(str(d / f"{e['id']}.png"), x4)
            print(f"{e['id']}: {src.shape[1]}x{src.shape[0]} -> {x4.shape[1]}x{x4.shape[0]} "
                  f"in {time.time() - t:.0f}s", flush=True)

    elif args.cmd == "finish":
        out = Path(args.out)
        out.mkdir(parents=True, exist_ok=True)
        tag = model_tag(args.model, args.dn)
        for e in entries(args.only):
            x4 = cv2.imread(str(cache / tag / f"{e['id']}.png"))
            img = finish(x4, e, args.long, args.sharpen, args.blend, args.raw)
            write_jpg(out / f"{e['id']}.jpg", img)
            print(f"{e['id']}: {tag} -> {img.shape[1]}x{img.shape[0]}", flush=True)

    elif args.cmd == "publish":
        by_id = {e["id"]: e for e in entries("")}
        for pid, c in CHOSEN.items():
            tag = model_tag(c["model"], c.get("dn", 0.5))
            x4 = cv2.imread(str(cache / tag / f"{pid}.png"))
            img = finish(x4, by_id[pid], c.get("long", LONG), c.get("sharpen", SHARPEN), c.get("blend", 1.0), args.raw, c.get("protect", ()))
            dest = Path(args.out) if args.out else MASTERS  # --out: review copy, masters untouched
            dest.mkdir(parents=True, exist_ok=True)
            write_jpg(dest / f"{pid}.jpg", img)
            print(f"{pid}: {tag} -> {img.shape[1]}x{img.shape[0]} -> {dest / (pid + '.jpg')}", flush=True)


if __name__ == "__main__":
    main()
