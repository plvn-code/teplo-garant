"""White-background packshot → transparent PNG/WebP. Imported by catalog.py; run directly to test: cutout.py out_dir file…"""
import sys, os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

def cutout(im: Image.Image):
    """Returns (RGBA image, ok). ok=False when the border is not a clean white studio background."""
    rgb = np.asarray(im.convert('RGB')).astype(np.float32)
    h, w, _ = rgb.shape
    mn = rgb.min(axis=2); mx = rgb.max(axis=2)
    border = np.concatenate([mn[:3].ravel(), mn[-3:].ravel(), mn[:, :3].ravel(), mn[:, -3:].ravel()])
    if (border >= 236).mean() < 0.96:
        return None, False
    # Background = near-white pixels connected to the frame (product whites inside an outline survive).
    cand = ((mn >= 236) & (mx - mn <= 14)).astype(np.uint8) * 255
    # Erode first so the fill cannot squeeze through thin gaps into highlights on the product.
    tight = np.asarray(Image.fromarray(cand).filter(ImageFilter.MinFilter(5)))
    pad = Image.fromarray(np.pad(tight, 1, constant_values=255)).copy()
    ImageDraw.floodfill(pad, (0, 0), 128)
    seed = np.asarray(pad)[1:-1, 1:-1] == 128
    # Grow back to the full candidate area, but only next to the filled region.
    grown = np.asarray(Image.fromarray((seed * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(7))) > 0
    bg = seed | (grown & (cand > 0))
    # Soft edge: a 3 px band around the background gets alpha from its distance to white.
    bgimg = Image.fromarray((bg * 255).astype(np.uint8))
    band = np.asarray(bgimg.filter(ImageFilter.MaxFilter(7))) > 0
    d = 255 - mn
    alpha = np.ones((h, w), np.float32)
    edge = band & ~bg
    alpha[edge] = np.clip((d[edge] - 6) / 70, 0, 1) ** 0.8
    alpha[bg] = 0
    # Remove white spill from semi-transparent edge pixels (assume background = pure white).
    a = np.maximum(alpha, 1e-3)[..., None]
    col = np.clip(255 - (255 - rgb) / a, 0, 255)
    col = np.where(alpha[..., None] >= 0.999, rgb, col)
    al = Image.fromarray((alpha * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6))
    out = Image.fromarray(col.astype(np.uint8)); out.putalpha(al)
    fg = alpha > 0.5
    ok = 0.04 < fg.mean() < 0.97
    bbox = out.getbbox()
    return (out.crop(bbox) if bbox else out), ok

if __name__ == '__main__':
    o = sys.argv[1]; os.makedirs(o, exist_ok=True)
    for f in sys.argv[2:]:
        im = Image.open(f); im.thumbnail((900, 900))
        r, ok = cutout(im)
        if r is not None: r.save(os.path.join(o, os.path.splitext(os.path.basename(f))[0] + '.png'))
        print(os.path.basename(f), 'ok' if ok else 'SKIP')
