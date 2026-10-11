"""Make ../index.html (GitHub Pages homepage) from forecut_home.txt."""
import json
h = open('forecut_home.txt').read()
# photo gallery from uploaded detail photos (GitHub site only)
def islug(x): return ''.join(ch.lower() if ch.isalnum() else '-' for ch in x).strip('-').replace('--', '-').replace('--', '-')
imgs = json.load(open('images.json'))
M = json.load(open('details.json'))['model']; SEAS = ['aw26', 'ss27', 'aw27', 'ss28', 'aw28']
info = {}
for k, items in M.items():
    for it in items:
        sl = islug(it['name'])
        if sl in imgs and sl not in info:
            si = next((i for i, c in enumerate(it['life']) if c != '-'), 0)
            info[sl] = (it['name'], k.split('|')[1], SEAS[si], {'e': 'Emerging', 'r': 'Rising', 'p': 'Peaking', 'f': 'Fading'}[it['life'][si]])
# India photos too (India is the main market)
import india_data as I
for x in I.D:
    sl = islug(x[2])
    if sl in imgs and sl not in info and x[5][0] in 'erp':
        info[sl] = (x[2], x[1], 'india', {'e': 'Emerging', 'r': 'Rising', 'p': 'Peaking'}[x[5][0]])
# mix seasons and categories so the edit isn't all coats
from collections import OrderedDict
lanes = OrderedDict()
for x in sorted(info, key=lambda x: ({'Rising': 0, 'Emerging': 1, 'Peaking': 2, 'Fading': 3}[info[x][3]], x)):
    lanes.setdefault((info[x][2], info[x][1]), []).append(x)
keys = list(lanes); subord = []
[subord.append(x[1]) for x in I.D if x[1] not in subord]
ik = sorted([k for k in keys if k[0] == 'india'], key=lambda k: subord.index(k[1]) if k[1] in subord else 99); gk = [k for k in keys if k[0] != 'india']
mixed = []
for n in range(max(len(ik), len(gk))):
    if n < len(ik): mixed.append(ik[n])
    if n < len(gk): mixed.append(gk[n])
lanes = OrderedDict((k, lanes[k]) for k in mixed)
order, seen_cat = [], set()
while len(order) < 9 and any(lanes.values()):
    for key in list(lanes):
        if lanes[key] and len(order) < 9:
            order.append(lanes[key].pop(0))
KC = {'Emerging': 'chalk', 'Rising': 'rise', 'Peaking': 'peak', 'Fading': 'fade'}
gal = ''
if order:
    cards = ''.join(
        f'<a href="{info[x][2]}.html"{" class=\"big\"" if n == 0 else ""}><img src="img/{x}.webp" alt="{info[x][0]}" loading="lazy" width="800" height="800">'
        f'<span class="cap"><span class="tag" style="--k:var(--{KC[info[x][3]]})"><i></i>{info[x][3]}</span><b>{info[x][0]}</b><small>{'India' if info[x][2] == 'india' else info[x][2].upper()} · {info[x][1]}</small></span></a>'
        for n, x in enumerate(order))
    more = ''.join(f'<a href="{s}.html">{s.upper()} →</a>' for s in SEAS) + '<a href="india.html">India →</a>'
    gal = f'''  <section id="lookbook" aria-labelledby="lh">
    <div class="sechead"><div><span class="mono eyebrow">The detail edit</span><h2 id="lh">This season, up close.</h2></div><p>A few of the details we're tracking now. Open any season to see every detail, with notes and downloadable cards.</p></div>
    <div class="gal">{cards}</div>
    <div class="galmore" role="navigation" aria-label="Browse seasons">{more}</div>
  </section>
'''
import journal_data as JD
jc = ''.join(f'<a class="jc" href="{a["slug"]}.html"><span class="ph"><img src="img/{a["hero"]}.webp" alt="" loading="lazy" width="800" height="800"></span><small>{a["tag"]} · {a["read"]} min read</small><b>{a["title"]}</b></a>' for a in JD.ARTICLES[:3])
jsec = f'''  <section id="journal" aria-labelledby="jlh">
    <div class="sechead"><div><span class="mono eyebrow">The Journal</span><h2 id="jlh">Read the analysis.</h2></div><p>Practical guides on what India will wear next, and how to act on it. <a href="journal.html">All articles →</a></p></div>
    <div class="jrow">{jc}</div>
  </section>
'''
import reports_data as RD
rs = [('reports.html', 'All reports', 'pre-draped-saree-gowns', 'Hub'), ('core-item-sarees.html', 'Core Item Update: Sarees', 'pre-draped-saree-gowns', 'Core Item Update'), ('capsule-festive-made-easy.html', 'Design Capsule: Festive made easy', 'cape-lehengas', 'Design Capsule'), ('india-colour-forecast.html', 'India Colour Forecast 2026–27', 'fit-and-flare-anarkalis', 'Colour Forecast'), ('india-brand-watch.html', 'Brand Watch: what Indian labels are launching', 'tissue-sarees-in-champagne-gold', 'Brand Watch')][1:]
rc = ''.join(f'<a class="jc" href="{u}"><span class="ph"><img src="img/{im}.webp" alt="" loading="lazy" width="800" height="800"></span><small>{k}</small><b>{t}</b></a>' for u, t, im, k in rs)
rsec = f'''  <section id="reports" aria-labelledby="rph">
    <div class="sechead"><div><span class="mono eyebrow">Reports</span><h2 id="rph">Ready-to-use trend reports.</h2></div><p>Item-by-item updates, design capsules with flat sketches, colour and sourcing guides. <a href="reports.html">All reports →</a></p></div>
    <div class="jrow r4">{rc}</div>
  </section>
'''
h = h.replace('<!--GALLERY-->', gal + rsec + jsec)
# hero stack + live ticker from India data
import india_data as _I
_CL = {'e': ('emerge', 'Emerging'), 'r': ('rise', 'Rising'), 'p': ('peak', 'Peaking'), 'f': ('fade', 'Fading')}
_hero = [x for x in _I.D if islug(x[2]) in imgs and x[5][0] in 'er']
_pick = []
for want in ['Pre-draped saree gowns', 'Kolhapuri chappals', 'Cape lehengas', 'Embroidered kurta co-ord sets']:
    _pick += [x for x in _hero if x[2] == want]
hs = ''.join(f'<a class="hc" data-p="{i}" href="india.html"><img src="img/{islug(x[2])}.webp" alt="{x[2]}" width="800" height="800"{" fetchpriority=\"high\"" if i == 0 else " loading=\"lazy\""}><span class="pill {_CL[x[5][0]][0]}">{_CL[x[5][0]][1]}</span><span class="hcb"><b>{x[2]}</b><small>{x[1]} · Festive 26</small></span></a>' for i, x in enumerate(_pick))
h = h.replace('<!--HEROSTACK-->', hs)
_tk = [x for x in _I.D if x[5][0] in 'erp'][:24]
tk = ''.join(f'<span>{x[2]} <span class="pill {_CL[x[5][0]][0]}">{_CL[x[5][0]][1]}</span></span>' for x in _tk)
h = h.replace('<!--TICKER-->', tk + tk)
# live tracker from the global season data
import datetime as _dt, os as _os
_SITE = json.load(open('site.json')); _LK = [z.lower() for z in _SITE.get('locked', [])]
_rows, _seen, _cats = [], set(), set()
for _pat in ['errrp', 'eerrr', 'rrrpf', 'errpf', 'rrpf-', 'ppppf', 'rrrrp', 'pppff']:
    for _k, _items in M.items():
        _cat = _k.split('|')[1]
        if _cat in _cats: continue
        _hit = next((_it for _it in _items if _it['life'] == _pat and _it['name'] not in _seen), None)
        if _hit: _rows.append((_hit['name'], _cat, _pat)); _seen.add(_hit['name']); _cats.add(_cat); break
_PL = {'e': ('emerge', 'Emerging'), 'r': ('rise', 'Rising'), 'p': ('peak', 'Peaking'), 'f': ('fade', 'Fading')}
_head = '<thead><tr><th scope="col">Detail</th>' + ''.join(f'<th scope="col" class="{"now" if i == 0 else ("lockh" if s in _LK else "")}">{s.upper()}{" · now" if i == 0 else (" 🔒" if s in _LK else "")}</th>' for i, s in enumerate(SEAS)) + '</tr></thead>'
_body = '<tbody>' + ''.join('<tr><th scope="row">' + n + '<small style="display:block;font-weight:500;color:var(--muted);font-size:12px">' + cat + '</small></th>' + ''.join(
    ('<td class="lockc"><span>🔒 At launch</span></td>' if SEAS[i] in _LK else ('<td class="dash">–</td>' if ch == '-' else f'<td><span class="pill {_PL[ch][0]}">{_PL[ch][1]}</span></td>'))
    for i, ch in enumerate(pat)) + '</tr>' for n, cat, pat in _rows) + '</tbody>'
h = h.replace('<!--TRTABLE-->', _head + _body)
_mt = max(_os.path.getmtime(f) for f in ['details.json', 'india_data.py', 'seasons.json'] if _os.path.exists(f))
h = h.replace('<!--TRDATE-->', _dt.date.fromtimestamp(_mt).strftime('%-d %b %Y'))
for k, u in json.load(open('urls.json')).items(): h = h.replace(u, f'{k}.html')
h = h.replace('https://forecut.in/reports.html', 'reports.html').replace('https://forecut.in/journal.html', 'journal.html')
h = h.replace('https://forecut.in/india.html', 'india.html').replace('https://forecut.in/about.html', 'about.html').replace('https://forecut.in/contact.html', 'contact.html').replace('https://forecut.in/terms.html', 'terms.html').replace('https://forecut.in/privacy.html', 'privacy.html').replace(' target="_blank" rel="noopener"', '')
if not h.lstrip().lower().startswith('<!doctype'):
    h = ('<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
         + h.replace('<title>Forecut</title>', '<title>Forecut · Fashion trend forecasting for India</title></head><body>', 1) + '\n</body></html>')
open('../index.html', 'w').write(h)
print('home ok')
