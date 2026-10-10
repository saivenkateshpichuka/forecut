"""Make ../index.html (GitHub Pages homepage) from forecut_home.txt."""
import json
h = open('forecut_home.txt').read()
for k, u in json.load(open('urls.json')).items(): h = h.replace(u, f'{k}.html')
h = h.replace('https://forecut.in/india.html', 'india.html').replace(' target="_blank" rel="noopener"', '')
if not h.lstrip().lower().startswith('<!doctype'):
    h = ('<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
         '<meta name="description" content="Forecut: AI trend forecasting for Indian fashion: garments, footwear, fabrics, embroidery and trims.">\n'
         + h.replace('<title>Forecut</title>', '<title>Forecut · Fashion trend forecasting for India</title></head><body>', 1) + '\n</body></html>')
open('../index.html', 'w').write(h)
print('home ok')
