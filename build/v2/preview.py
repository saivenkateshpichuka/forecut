"""Make a self-contained private preview of v2/ for a claude.ai artifact.

Images become resized data: URIs, the font is inlined into the CSS, links inside the redesign become
relative, every other link points at the live forecut.in page, and PDF buttons show a short note.
Output: /home/claude/work/preview/
"""
import os, re, io, json, base64, shutil
from PIL import Image

B = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOT = os.path.dirname(B)
SRC = os.path.join(ROOT, 'v2')
OUT = '/home/claude/work/preview'
CACHE = {}


def datauri(key, w):
    k = (key, w)
    if k not in CACHE:
        f = os.path.join(ROOT, 'img', key + '.webp')
        im = Image.open(f).convert('RGB')
        im.thumbnail((w, int(w * 1.6)))
        b = io.BytesIO()
        im.save(b, 'WEBP', quality=50 if w <= 480 else 64, method=5)
        CACHE[k] = 'data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode()
    return CACHE[k]


def fix_links(h):
    def rep(m):
        attr, u = m.group(1), m.group(2)
        if u.startswith(('#', 'data:', 'mailto:', 'tel:', 'javascript:')):
            return m.group(0)
        if u.startswith('/v2/pdf/'):
            return f'{attr}="#" data-pdfnote="1"'
        if u.startswith('/v2/'):
            r = u[4:]
            if r == '' or r.startswith('#'):
                r = 'index.html' + r
            return f'{attr}="{r}"'
        if u.startswith('/'):
            return f'{attr}="https://forecut.in{u}" target="_blank" rel="noopener"'
        return m.group(0)
    return re.sub(r'(href)="([^"]*)"', rep, h)


def fix_imgs(h):
    # item photos and small thumbnails small, covers medium, heroes large
    out, pos = [], 0
    for m in re.finditer(r'src="/img/([^"]+)\.webp"', h):
        before = h[max(0, m.start() - 260):m.start()]
        if '<div class="ph"' in before[-60:] or 'aspect-ratio:1"' in before[-40:] or 'aspect-ratio:4/5"><img' in before[-30:] and 'dimg' not in h[m.start() - 30:m.start()]:
            w = 300
        elif 'class="cov"' in before or 'aspect-ratio:3/4">' in before[-30:] or 'aspect-ratio:16/10' in before[-40:] or 'aspect-ratio:4/3' in before[-40:]:
            w = 560
        else:
            w = 1000
        out.append(h[pos:m.start()] + f'src="{datauri(m.group(1), w)}"')
        pos = m.end()
    out.append(h[pos:])
    return ''.join(out)


NOTE = r"""<div id="pvbar" style="position:fixed;right:12px;bottom:12px;z-index:60;background:#000;color:#fff;font-size:13px;padding:9px 12px;max-width:calc(100vw - 24px);box-shadow:0 2px 10px rgba(0,0,0,.2)">Redesign preview. The live site has not changed. <a href="#member" id="pvm" style="color:#fff;text-decoration:underline">Member view</a> <a href="#preview" id="pvp" style="color:#fff;text-decoration:underline;margin-left:8px">Signed-out view</a> <button type="button" onclick="this.parentNode.remove()" aria-label="Hide" style="background:none;border:0;color:#bbb;font:inherit;margin-left:8px;cursor:pointer">Hide</button></div>
<div id="pvtoast" style="display:none;position:fixed;left:50%;top:84px;transform:translateX(-50%);z-index:70;background:#fff;border:1px solid #000;padding:12px 16px;font-size:14px;max-width:90vw">PDF downloads switch on in the live build. In this preview, read the report on the page.</div>
<script>{document.addEventListener('click',function(e){var a=e.target.closest('[data-pdfnote]');if(!a)return;e.preventDefault();var t=document.getElementById('pvtoast');t.style.display='block';clearTimeout(window._pvt);window._pvt=setTimeout(function(){t.style.display='none'},3200)});
var r=document.getElementById('report');if(!r){var x=document.getElementById('pvm'),y=document.getElementById('pvp');x&&x.remove();y&&y.remove()}}</script>"""


def main():
    if os.path.isdir(OUT):
        shutil.rmtree(OUT)
    os.makedirs(OUT)
    css = open(os.path.join(SRC, 'forecut.css')).read()
    font = base64.b64encode(open(os.path.join(SRC, 'archivo.woff2'), 'rb').read()).decode()
    css = css.replace("url('/v2/archivo.woff2')", f"url(data:font/woff2;base64,{font})").replace('url(/v2/archivo.woff2)', f"url(data:font/woff2;base64,{font})")
    assert 'archivo.woff2' not in css, 'font url not replaced'
    css = ':root{color-scheme:light}\n' + css
    open(os.path.join(OUT, 'forecut.css'), 'w').write(css)
    js = open(os.path.join(SRC, 'forecut.js')).read().replace("'/v2/'+x.sk", "x.sk")
    open(os.path.join(OUT, 'forecut.js'), 'w').write(js)
    sizes = {}
    for f in sorted(os.listdir(SRC)):
        if not f.endswith('.html'):
            continue
        h = open(os.path.join(SRC, f)).read()
        h = h.replace('<link rel="icon" href="/favicon.svg">', '')
        h = h.replace('href="/v2/forecut.css"', 'href="forecut.css"').replace('src="/v2/forecut.js"', 'src="forecut.js"')
        m = re.search(r'<script>window\.FC_DOTD=(.*?)</script>', h, re.S)
        if m:
            pool = json.loads(m.group(1).replace('<\\/', '</'))
            step = max(1, len(pool) // 30)
            pool = pool[::step][:30]
            for x in pool:
                x['src'] = datauri(x['img'], 700)
            h = h[:m.start()] + '<script>window.FC_DOTD=' + json.dumps(pool).replace('</', '<\\/') + '</script>' + h[m.end():]
        h = fix_imgs(fix_links(h))
        assert '/img/' not in re.sub(r'https://forecut\.in[^"]*', '', h).replace("'/img/'", ''), f
        h = h.replace('</body>', NOTE + '</body>')
        open(os.path.join(OUT, f), 'w').write(h)
        sizes[f] = len(h)
    tot = sum(sizes.values())
    print(len(sizes), 'pages', round(tot / 1e6, 1), 'MB; largest', max(sizes.items(), key=lambda x: x[1]))


if __name__ == '__main__':
    main()
