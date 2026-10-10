"""Build the Forecut image-prompt report: one ChatGPT prompt + file name per unique detail."""
import json, html, sys, os
from seasons_data import SEASONS, META
M = json.load(open('details.json'))
SC = json.load(open('subcats.json'))
E = html.escape
MONTH = sys.argv[1] if len(sys.argv) > 1 else 'October 2026'
NEWONLY = set(json.load(open('new_this_month.json'))) if os.path.exists('new_this_month.json') else None
def slug(s): return ''.join(ch.lower() if ch.isalnum() else '-' for ch in s).strip('-').replace('--', '-').replace('--', '-')
def h31(name):
    h = 0
    for ch in name: h = (h * 31 + ord(ch)) & 0xFFFFFFFF
    return h
def subof(dept, area):
    m = SC['footwear' if dept == 'Footwear' else 'garment']
    for k, v in m.items():
        if area in v: return k
    return list(m)[-1]
rows = []
for dept, cat in M['order']:
    for it in M['model'][f'{dept}|{cat}']:
        seasons = [META[s]['code'] for i, s in enumerate(SEASONS) if it['life'][i] != '-']
        if not seasons: continue
        first = SEASONS[[i for i in range(len(SEASONS)) if it['life'][i] != '-'][0]]
        pal = META[first]['palette']
        colname = pal[h31(it['name']) % len(pal)][1].lower()
        sub = subof(dept, it['area'])
        if dept == 'Footwear':
            prompt = (f"Product photograph of {it['name'].lower()} ({cat.lower()}), shown from a three-quarter side angle so the {it['area'].lower()} is clearly visible. "
                      f"{it['note']} Colour: {colname}. Realistic leather or fabric texture, crisp stitching. "
                      "Soft diffused studio light, plain warm-grey background, gentle shadow under the shoe, shallow depth of field. "
                      "No logos, no brand names, no text, no people. Square 1:1, editorial catalogue style.")
        else:
            prompt = (f"Close-up product photograph of {it['name'].lower()} for {dept.lower()} ({cat.lower()}), framed tightly on the {it['area'].lower()} detail. "
                      f"{it['note']} Colour: {colname}. Realistic fabric texture with visible seams and topstitching, garment on an invisible mannequin. "
                      "Soft diffused studio light, plain warm-grey background, shallow depth of field. "
                      "No logos, no brand names, no text, no people or faces. Square 1:1, editorial catalogue style.")
        pri = 1 if ('AW26' in seasons or 'SS27' in seasons) else 2
        rows.append(dict(name=it['name'], dept=dept, cat=cat, sub=sub, area=it['area'], seasons=seasons, pri=pri,
                         file=slug(it['name']) + '.png', prompt=prompt, new=(NEWONLY is not None and it['name'] in NEWONLY)))
ORD = {f'{d}|{c}': i for i, (d, c) in enumerate(M['order'])}
rows.sort(key=lambda r: (r['pri'], ORD[r['dept'] + '|' + r['cat']], r['sub'], r['name']))
tpl = open('prompt_tpl.txt').read()
out = tpl.replace('%%DATA%%', json.dumps(rows, ensure_ascii=False).replace('</', '<\\/')).replace('%%MONTH%%', E(MONTH)) \
         .replace('%%TOTAL%%', str(len(rows))).replace('%%P1%%', str(sum(1 for r in rows if r['pri'] == 1))) \
         .replace('%%NEWCOUNT%%', str(sum(1 for r in rows if r['new'])))
open('forecut-prompts.html', 'w').write(out)
print(len(rows), 'prompts;', sum(1 for r in rows if r['pri'] == 1), 'priority')
