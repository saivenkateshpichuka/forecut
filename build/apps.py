"""Forecut Studio app: one installable app with every tool, plus each tool as its own installable app.

Writes studio.webmanifest, apps/<slug>.webmanifest and the app icons into the site root.
"""
import json, os, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import tools_shell as T

ROOT = Path(__file__).resolve().parent.parent
GREEN, PAPER, CLAY = '#214538', '#f7f4ee', '#c4643f'


def icons():
    from PIL import Image, ImageDraw, ImageFont
    import glob
    serif = (glob.glob('/usr/share/fonts/**/DejaVuSerif-Bold.ttf', recursive=True) or glob.glob('/usr/share/fonts/**/*Serif*Bold*.ttf', recursive=True))[0]
    sans = (glob.glob('/usr/share/fonts/**/DejaVuSans-Bold.ttf', recursive=True))[0]
    def make(size, maskable=False):
        im = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        d = ImageDraw.Draw(im)
        if maskable:
            d.rectangle([0, 0, size, size], fill=GREEN)
        else:
            d.rounded_rectangle([0, 0, size - 1, size - 1], radius=int(size * .22), fill=GREEN)
        k = .78 if maskable else 1
        f = ImageFont.truetype(serif, int(size * .5 * k))
        tw = d.textlength('F', font=f)
        x = (size - tw) / 2 - size * .04 * k
        y = size * (.17 if not maskable else .22)
        d.text((x, y), 'F', font=f, fill=PAPER)
        r = size * .045 * k
        cx, cy = x + tw + r * 1.6, y + size * .43 * k
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=CLAY)
        fs = ImageFont.truetype(sans, int(size * .085 * k))
        t = 'STUDIO'
        d.text(((size - d.textlength(t, font=fs)) / 2, size * (.74 if not maskable else .7)), t, font=fs, fill=PAPER)
        return im
    (ROOT / 'apps').mkdir(exist_ok=True)
    make(192).save(ROOT / 'apps/studio-192.png')
    make(512).save(ROOT / 'apps/studio-512.png')
    make(512, True).save(ROOT / 'apps/studio-maskable-512.png')


ICONS = [{'src': '/apps/studio-192.png', 'sizes': '192x192', 'type': 'image/png'},
         {'src': '/apps/studio-512.png', 'sizes': '512x512', 'type': 'image/png'},
         {'src': '/apps/studio-maskable-512.png', 'sizes': '512x512', 'type': 'image/png', 'purpose': 'maskable'}]


def manifests():
    (ROOT / 'apps').mkdir(exist_ok=True)
    order = list(T.NAMES)
    studio = {'id': '/forecut-studio', 'name': 'Forecut Studio', 'short_name': 'Forecut Studio',
              'description': 'Every Forecut tool for designers and apparel brands, in garment-process order.',
              'start_url': '/tools.html?source=studio-app', 'scope': '/', 'display': 'standalone',
              'theme_color': GREEN, 'background_color': PAPER, 'icons': ICONS,
              'shortcuts': [{'name': T.NAMES[s][0], 'url': f'/{s}.html?source=studio-app'} for s in
                            ['rangeboard', 'pattern-maker', 'textile-processing-studio', 'pricefold', 'tech-pack-builder', 'textile-calculator']]}
    (ROOT / 'studio.webmanifest').write_text(json.dumps(studio, ensure_ascii=False, indent=1))
    for s in order:
        n, l, _ = T.NAMES[s]
        m = {'id': f'/forecut-{s}', 'name': f'Forecut {n}', 'short_name': n if len(n) <= 18 else n.split(' ')[0] + ' ' + (n.split(' ')[1] if len(n.split(' ')) > 1 else ''),
             'description': l, 'start_url': f'/{s}.html?source=app', 'scope': '/', 'display': 'standalone',
             'theme_color': GREEN, 'background_color': PAPER, 'icons': ICONS}
        (ROOT / f'apps/{s}.webmanifest').write_text(json.dumps(m, ensure_ascii=False, indent=1))


if __name__ == '__main__':
    icons()
    manifests()
