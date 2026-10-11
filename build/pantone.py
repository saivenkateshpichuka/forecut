"""Nearest Pantone Fashion, Home + Interiors (TPX/TCX) match for a hex colour, by CIEDE2000.
Reference hex values are public screen approximations (github.com/Margaret2/pantone-colors); always confirm with a physical Pantone book."""
import json, math, os
_D = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'pantone_fhi.json')))
def _lab(h):
    h = h.lstrip('#'); rgb = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    rgb = [((c + .055) / 1.055) ** 2.4 if c > .04045 else c / 12.92 for c in rgb]
    x = (rgb[0] * .4124 + rgb[1] * .3576 + rgb[2] * .1805) / .95047
    y = (rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722)
    z = (rgb[0] * .0193 + rgb[1] * .1192 + rgb[2] * .9505) / 1.08883
    f = lambda t: t ** (1 / 3) if t > .008856 else 7.787 * t + 16 / 116
    fx, fy, fz = f(x), f(y), f(z)
    return 116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)
def _de2000(a, b):
    L1, a1, b1 = a; L2, a2, b2 = b
    C1, C2 = math.hypot(a1, b1), math.hypot(a2, b2); Cb = (C1 + C2) / 2
    G = .5 * (1 - math.sqrt(Cb ** 7 / (Cb ** 7 + 25 ** 7)))
    a1p, a2p = (1 + G) * a1, (1 + G) * a2
    C1p, C2p = math.hypot(a1p, b1), math.hypot(a2p, b2)
    h1p = math.degrees(math.atan2(b1, a1p)) % 360; h2p = math.degrees(math.atan2(b2, a2p)) % 360
    dL, dC = L2 - L1, C2p - C1p
    dh = 0 if C1p * C2p == 0 else (h2p - h1p if abs(h2p - h1p) <= 180 else h2p - h1p - 360 if h2p - h1p > 180 else h2p - h1p + 360)
    dH = 2 * math.sqrt(C1p * C2p) * math.sin(math.radians(dh / 2))
    Lp, Cp = (L1 + L2) / 2, (C1p + C2p) / 2
    hp = h1p + h2p if C1p * C2p == 0 else ((h1p + h2p) / 2 if abs(h1p - h2p) <= 180 else (h1p + h2p + 360) / 2 if h1p + h2p < 360 else (h1p + h2p - 360) / 2)
    T = 1 - .17 * math.cos(math.radians(hp - 30)) + .24 * math.cos(math.radians(2 * hp)) + .32 * math.cos(math.radians(3 * hp + 6)) - .2 * math.cos(math.radians(4 * hp - 63))
    SL = 1 + .015 * (Lp - 50) ** 2 / math.sqrt(20 + (Lp - 50) ** 2); SC = 1 + .045 * Cp; SH = 1 + .015 * Cp * T
    RT = -2 * math.sqrt(Cp ** 7 / (Cp ** 7 + 25 ** 7)) * math.sin(math.radians(60 * math.exp(-((hp - 275) / 25) ** 2)))
    return math.sqrt((dL / SL) ** 2 + (dC / SC) ** 2 + (dH / SH) ** 2 + RT * (dC / SC) * (dH / SH))
_LAB = {k: _lab(v[1]) for k, v in _D.items()}
_cache = {}
def nearest(hexc):
    """Return (code like '19-4052 TPX', name, deltaE)."""
    if hexc in _cache: return _cache[hexc]
    t = _lab(hexc); k = min(_LAB, key=lambda c: _de2000(t, _LAB[c]))
    r = (k + ' TPX', _D[k][0].replace('-', ' ').title(), round(_de2000(t, _LAB[k]), 1)); _cache[hexc] = r; return r
if __name__ == '__main__':
    for h in ['#0f6b4f', '#2f3f7a', '#f3ecdc', '#b5522b', '#d8c08a']: print(h, nearest(h))
