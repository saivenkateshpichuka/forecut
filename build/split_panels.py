"""Split two-panel detail images (realistic photo | flat sketch) into separate files for the viewer.

For every original in ../images/done/ that is a detail image (not hero/theme/flat), detect the white
flat-sketch panel on the right. If found, write:
  ../img/<slug>-photo.webp   left photo panel only
  ../img/<slug>-f1.webp      flat sketch (front, or the only view)
  ../img/<slug>-f2.webp      second flat view (back / top) when the panel holds two drawings
and record it in panels.json ({slug: number_of_flats}). Old-style single photos are left alone.
Never deletes anything.
"""
import os, json, glob
import numpy as np
from PIL import Image
from scipy import ndimage

SRC, OUT = '../images/done', '../img'
PJ = 'panels.json'
panels = json.load(open(PJ)) if os.path.exists(PJ) else {}
meta = json.load(open('panels_src.json')) if os.path.exists('panels_src.json') else {}
imgs = set(json.load(open('images.json')))


def white(a, t=232):
    return (a > t).all(axis=-1)


def find_divider(a):
    h, w, _ = a.shape
    s = max(4, int(h * 0.035))
    colw = (white(a[:s]).mean(0) + white(a[-s:]).mean(0)) / 2
    for x in range(int(w * 0.33), int(w * 0.75)):
        if colw[x:x + 12].min() > 0.97:
            right = colw[x:]
            left = colw[:max(1, x - 8)]
            if (right > 0.9).mean() > 0.7 and left.mean() < 0.6:
                return x
            return None
    return None


def bbox(mask):
    ys, xs = np.where(mask)
    if len(ys) == 0: return None
    return ys.min(), ys.max() + 1, xs.min(), xs.max() + 1


def gap_split(mask, axis, minlen):
    """Find the longest empty band (no ink) along axis inside the mask; return its centre or None."""
    prof = mask.any(axis=1 - axis) if axis == 0 else mask.any(axis=0)
    n = len(prof); best = (0, None); i = 0
    while i < n:
        if not prof[i]:
            j = i
            while j < n and not prof[j]: j += 1
            if i > 0 and j < n and j - i > best[0]: best = (j - i, (i + j) // 2)
            i = j
        else: i += 1
    return best[1] if best[0] >= minlen else None


def pad_square(img, size=900, margin=0.07):
    inner = int(size * (1 - 2 * margin))
    f = min(inner / img.width, inner / img.height)
    img = img.resize((max(1, int(img.width * f)), max(1, int(img.height * f))), Image.LANCZOS)
    bg = Image.new('RGB', (size, size), (255, 255, 255))
    bg.paste(img, ((size - img.width) // 2, (size - img.height) // 2))
    return bg


def process(path, slug):
    im = Image.open(path).convert('RGB'); a = np.asarray(im)
    h, w, _ = a.shape
    x = find_divider(a)
    if x is None: return 0
    # photo: trim the neutral gap line(s) left of the divider
    px = x
    while px > w * 0.3 and a[:, px - 1].std() < 10: px -= 1
    photo = im.crop((0, 0, px - 2, h))
    photo.thumbnail((900, 1400), Image.LANCZOS)
    photo.save(f'{OUT}/{slug}-photo.webp', 'WEBP', quality=84)
    # flat panel
    fp = a[:, x:]; ink = ~white(fp, 225)
    b = bbox(ink)
    if not b: return 0
    y0, y1, x0, x1 = b; sub = ink[y0:y1, x0:x1]
    # each separate drawing = one connected shape (dilated to bridge dashed stitch lines)
    lab, n = ndimage.label(sub)
    comps = []
    for i, sl in enumerate(ndimage.find_objects(lab), 1):
        cnt = int((sub[sl] & (lab[sl] == i)).sum())
        comps.append([sl[0].start, sl[0].stop, sl[1].start, sl[1].stop, cnt, [i]])
    if not comps: return 0
    big = max(c[4] for c in comps)
    main = [c for c in comps if c[4] >= 0.12 * big]
    for c in comps:  # small marks join the drawing that contains them
        if c in main: continue
        cy, cx = (c[0] + c[1]) / 2, (c[2] + c[3]) / 2
        for m in main:
            if m[0] - 10 <= cy <= m[1] + 10 and m[2] - 10 <= cx <= m[3] + 10:
                m[0], m[1], m[2], m[3] = min(m[0], c[0]), max(m[1], c[1]), min(m[2], c[2]), max(m[3], c[3]); m[5] += c[5]; break
    rowh = max(1, sub.shape[0] // 4)
    main.sort(key=lambda b: (b[0] // rowh, b[2]))
    pad = 6
    fa = np.asarray(im)[y0:y1, x + x0:x + x1]
    pieces = []
    for b in main:
        Y0, Y1, X0, X1 = max(0, b[0] - pad), min(sub.shape[0], b[1] + pad), max(0, b[2] - pad), min(sub.shape[1], b[3] + pad)
        keep = np.isin(lab[Y0:Y1, X0:X1], b[5])
        crop = fa[Y0:Y1, X0:X1].copy(); crop[~keep] = 255
        pieces.append(Image.fromarray(crop))
    for i, p in enumerate(pieces[:6]):
        pad_square(p).save(f'{OUT}/{slug}-f{i + 1}.webp', 'WEBP', quality=88)
    return min(len(pieces), 6)


done = 0
for path in sorted(glob.glob(f'{SRC}/*')):
    if not path.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')): continue
    slug = os.path.splitext(os.path.basename(path))[0].strip().lower().replace(' ', '-').replace('_', '-')
    if slug.startswith(('hero-', 'theme-', 'flat-')) or slug not in imgs: continue
    sz = str(os.path.getsize(path))
    if slug in meta and meta[slug].split(':')[0] == sz and (slug not in panels or os.path.exists(f'{OUT}/{slug}-f1.webp')): continue
    n = process(path, slug)
    meta[slug] = sz + ':0'
    if n: panels[slug] = n; done += 1
    elif slug in panels: panels.pop(slug)
json.dump(panels, open(PJ, 'w'), indent=0, sort_keys=True)
json.dump(meta, open('panels_src.json', 'w'), indent=0, sort_keys=True)
print('split', done, 'two-panel images; total', len(panels))
