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
rs = [('reports.html', 'All reports', 'pre-draped-saree-gowns', 'Hub'), ('core-item-sarees.html', 'Core Item Update: Sarees', 'pre-draped-saree-gowns', 'Core Item Update'), ('capsule-festive-made-easy.html', 'Design Capsule: Festive made easy', 'cape-lehengas', 'Design Capsule'), ('india-colour-forecast.html', 'India Colour Forecast 2026–27', 'fit-and-flare-anarkalis', 'Colour Forecast'), ('india-textile-craft-guide.html', 'Textile and Craft Sourcing Guide', 'chanderi', 'Sourcing Guide')][1:]
rc = ''.join(f'<a class="jc" href="{u}"><span class="ph"><img src="img/{im}.webp" alt="" loading="lazy" width="800" height="800"></span><small>{k}</small><b>{t}</b></a>' for u, t, im, k in rs)
rsec = f'''  <section id="reports" aria-labelledby="rph">
    <div class="sechead"><div><span class="mono eyebrow">Reports</span><h2 id="rph">Ready-to-use trend reports.</h2></div><p>Item-by-item updates, design capsules with flat sketches, colour and sourcing guides. <a href="reports.html">All reports →</a></p></div>
    <div class="jrow r4">{rc}</div>
  </section>
'''
h = h.replace('<!--GALLERY-->', gal + rsec + jsec)
for k, u in json.load(open('urls.json')).items(): h = h.replace(u, f'{k}.html')
h = h.replace('https://forecut.in/reports.html', 'reports.html').replace('https://forecut.in/journal.html', 'journal.html')
h = h.replace('https://forecut.in/india.html', 'india.html').replace('https://forecut.in/about.html', 'about.html').replace('https://forecut.in/contact.html', 'contact.html').replace('https://forecut.in/terms.html', 'terms.html').replace('https://forecut.in/privacy.html', 'privacy.html').replace(' target="_blank" rel="noopener"', '')
if not h.lstrip().lower().startswith('<!doctype'):
    h = ('<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
         '<meta name="description" content="Forecut: AI trend forecasting for Indian fashion: garments, footwear, fabrics, embroidery and trims.">\n'
         + h.replace('<title>Forecut</title>', '<title>Forecut · Fashion trend forecasting for India</title></head><body>', 1) + '\n</body></html>')
open('../index.html', 'w').write(h)
print('home ok')
