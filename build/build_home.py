"""Make ../index.html (GitHub Pages homepage) from forecut_home.txt."""
import json, os as _os0
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
for n in range(max(len(ik), (len(gk) + 1) // 2)):
    if 2 * n < len(gk): mixed.append(gk[2 * n])
    if 2 * n + 1 < len(gk): mixed.append(gk[2 * n + 1])
    if n < len(ik): mixed.append(ik[n])
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
        f'<a href="{info[x][2]}.html"{" class=\"big\"" if n == 0 else ""}><img src="img/{x + "-photo" if _os0.path.exists(f"../img/{x}-photo.webp") else x}.webp" alt="{info[x][0]}" loading="lazy" width="800" height="800">'
        f'<span class="cap"><span class="tag" style="--k:var(--{KC[info[x][3]]})"><i></i>{info[x][3]}</span><b>{info[x][0]}</b><small>{'India' if info[x][2] == 'india' else info[x][2].upper()} · {info[x][1]}</small></span></a>'
        for n, x in enumerate(order))
    more = ''.join(f'<a href="{s}.html">{s.upper()} →</a>' for s in SEAS) + '<a href="regions.html">Regions →</a><a href="india.html">India →</a>'
    gal = f'''  <section id="lookbook" aria-labelledby="lh">
    <div class="sechead"><div><span class="mono eyebrow">The detail edit</span><h2 id="lh">This season, up close.</h2></div><p>A few of the details we're tracking now. Open any season to see every detail, with notes and downloadable cards.</p></div>
    <div class="gal">{cards}</div>
    <div class="galmore" role="navigation" aria-label="Browse seasons">{more}</div>
  </section>
'''
import journal_data as JD
jc = ''.join(f'<a class="jc" href="{a["slug"]}.html"><span class="ph"><img src="img/{a["hero"]}.webp" alt="" loading="lazy" width="800" height="800"></span><small>{a["tag"]} · {a["read"]} min read</small><b>{a["title"]}</b></a>' for a in JD.ARTICLES[:3])
jsec = f'''  <section id="journal" aria-labelledby="jlh">
    <div class="sechead"><div><span class="mono eyebrow">The Journal</span><h2 id="jlh">Read the analysis.</h2></div><p>Practical guides on what the world will wear next, region by region, and how to act on it. <a href="journal.html">All articles →</a></p></div>
    <div class="jrow">{jc}</div>
  </section>
'''
import reports_data as RD
rs = [('global-trend-report.html', 'Global Trend Report', 'collarless-tailored-jackets-photo', 'Global Trend Report'), ('fashion-brand-competition-2026.html', 'Brand competition 2026: who is growing', 'band-collar-shirts-photo', 'Market Data'), ('fashion-marketing-trends-2026.html', 'Fashion marketing trends 2026', 'mesh-running-sneakers-photo', 'Marketing Trends'), ('india-brand-watch.html', 'India market: Brand Watch', 'tissue-sarees-in-champagne-gold', 'India market')]
_pv = {'global-trend-report.html': 'Worldwide outlook AW26 to AW28: rising, emerging and fading details.', 'fashion-brand-competition-2026.html': 'Inditex, Shein, Uniqlo, H&M, Trent and ABFRL growth compared.', 'fashion-marketing-trends-2026.html': 'Nine marketing trends, from quick commerce to AI search, and what to do.', 'india-brand-watch.html': 'How Indian brands are bringing festive 2026 trends to market.'}
rc = ''.join(f'<a class="rcv" href="{u}"><span class="ph"><span class="brand">Forecut</span><img src="img/{im}.webp" alt="" loading="lazy" width="800" height="800"><span class="tt">{t}</span></span><span class="bd"><small>{k}</small><span class="pv">{_pv.get(u, '')}</span></span></a>' for u, t, im, k in rs)
rsec = f'''  <section id="reports" aria-labelledby="rph">
    <div class="sechead"><div><span class="mono eyebrow">Reports</span><h2 id="rph">Ready-to-use trend reports.</h2></div><p>Item-by-item updates, design capsules with flat sketches, colour and sourcing guides. <a href="reports.html">All reports →</a></p></div>
    <div class="rcov">{rc}</div>
  </section>
'''
h = h.replace('<!--LOOKBOOK-->', gal).replace('<!--REPORTS-->', rsec).replace('<!--JOURNAL-->', jsec)
import home_blocks as _HB
for _k, _v in _HB.blocks(M, SEAS, islug).items(): h = h.replace(f'<!--{_k}-->', _v)
# hero stack + live ticker from India data
import india_data as _I
_CL = {'e': ('emerge', 'Emerging'), 'r': ('rise', 'Rising'), 'p': ('peak', 'Peaking'), 'f': ('fade', 'Fading')}
_hero = [x for x in _I.D if islug(x[2]) in imgs and x[5][0] in 'er']
# global hero stack: SS27 global trends + one India market trend, and a mixed global ticker
def _gimg(name):
    sl = islug(name)
    for c in (sl + '-photo', sl + '-ss27-photo', sl):
        if _os0.path.exists(f'../img/{c}.webp'): return c
    return None
import os as _os0
_G = {it['name']: it for _k, _its in M.items() for it in _its}
_gl = []
for want in ['Peplum blouses', 'Collarless tailored jackets', 'Band-collar shirts']:
    it = _G.get(want); im = _gimg(want) if it else None
    if it and im: _gl.append((want, im, it['life'][1], 'SS27 · Global', 'ss27.html'))
for want in ['Cape lehengas']:
    x = next((x for x in _hero if x[2] == want), None)
    if x: _gl.append((x[2], islug(x[2]), x[5][0], 'Festive 26 · India', 'india.html'))
hs = ''.join(f'<a class="hc" data-p="{i}" href="{u}"><img src="img/{im}.webp" alt="{n}" width="800" height="800"{" fetchpriority=\"high\"" if i == 0 else " loading=\"lazy\""}><span class="pill {_CL[st][0]}">{_CL[st][1]}</span><span class="hcb"><b>{n}</b><small>{lab}</small></span></a>' for i, (n, im, st, lab, u) in enumerate(_gl))
h = h.replace('<!--HEROSTACK-->', hs)
_gt = [(it['name'], it['life'][1]) for _k, _its in M.items() for it in _its if it['life'][1] in 'er'][:18]
_it = [(x[2], x[5][0]) for x in _I.D if x[5][0] in 'er'][:6]
_mix = [v for pair in zip(_gt[::3], _gt[1::3], _gt[2::3], _it + [None] * 6) for v in pair if v]
tk = ''.join(f'<span>{n} <span class="pill {_CL[st][0]}">{_CL[st][1]}</span></span>' for n, st in _mix)
h = h.replace('<!--TICKER-->', tk + tk)
# live tracker from the global season data
import datetime as _dt, os as _os
_LK = []  # tracker always shows all seasons
_rows, _seen, _cats = [], set(), set()
for _pat in ['errrp', 'eerrr', 'rrrpf', 'errpf', 'rrpf-', 'ppppf', 'rrrrp', 'pppff', 'eerrp', 'rrppf', 'rpff-']:
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
h = h.replace('https://forecut.in/account.html', 'account.html').replace('https://forecut.in/reports.html', 'reports.html').replace('https://forecut.in/journal.html', 'journal.html')
h = h.replace('https://forecut.in/india.html', 'india.html').replace('https://forecut.in/about.html', 'about.html').replace('https://forecut.in/contact.html', 'contact.html').replace('https://forecut.in/terms.html', 'terms.html').replace('https://forecut.in/privacy.html', 'privacy.html').replace(' target="_blank" rel="noopener"', '')
if not h.lstrip().lower().startswith('<!doctype'):
    h = ('<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
         + h.replace('<title>Forecut</title>', '<title>Forecut · Global fashion trend forecasting</title></head><body>', 1) + '\n</body></html>')
open('../index.html', 'w').write(h)
print('home ok')
