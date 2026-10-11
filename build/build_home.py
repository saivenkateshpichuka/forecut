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
order = sorted(info, key=lambda x: (info[x][3] != 'Rising', x))[:16]
gal = ''
if order:
    cards = ''.join(f'<a href="{info[x][2]}.html"><img src="img/{x}.webp" alt="{info[x][0]}" loading="lazy" width="440" height="550"><small>{info[x][3]} · {info[x][2].upper()}</small><b>{info[x][0]}</b></a>' for x in order)
    gal = f'''  <section id="lookbook" aria-labelledby="lh">
    <div class="sechead"><div><span class="mono eyebrow">The detail edit</span><h2 id="lh">This season, up close.</h2></div><p>A few of the details we're tracking now. Open any season to see every detail, with notes and downloadable cards.</p></div>
    <div class="gal">{cards}</div>
  </section>
'''
h = h.replace('<!--GALLERY-->', gal)
for k, u in json.load(open('urls.json')).items(): h = h.replace(u, f'{k}.html')
h = h.replace('https://forecut.in/india.html', 'india.html').replace('https://forecut.in/about.html', 'about.html').replace('https://forecut.in/contact.html', 'contact.html').replace('https://forecut.in/terms.html', 'terms.html').replace('https://forecut.in/privacy.html', 'privacy.html').replace(' target="_blank" rel="noopener"', '')
if not h.lstrip().lower().startswith('<!doctype'):
    h = ('<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
         '<meta name="description" content="Forecut: AI trend forecasting for Indian fashion: garments, footwear, fabrics, embroidery and trims.">\n'
         + h.replace('<title>Forecut</title>', '<title>Forecut · Fashion trend forecasting for India</title></head><body>', 1) + '\n</body></html>')
open('../index.html', 'w').write(h)
print('home ok')
