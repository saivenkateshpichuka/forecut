"""Write ../india-image-prompts.csv: one ChatGPT image prompt per India detail (same naming rules as the main report)."""
import csv, json
import india_data as I
def islug(s): return ''.join(ch.lower() if ch.isalnum() else '-' for ch in s).strip('-').replace('--', '-').replace('--', '-')
done = set(json.load(open('images.json')))
DEPT = {c[1]: c[0] for c in I.CATS}
import re
def clean(n):
    if 'Prada' in n: return 'Traditional GI-tagged leather sandals from Kolhapur with a toe ring and wide plaited strap.'
    return re.sub(r',? (as )?(shown )?by [A-Z][^.]*', '', n)
rows = []
for (cat, sub, name, area, note, life, sk) in I.D:
    note = clean(note)
    subject = {'Indian Footwear': 'Indian footwear', 'Fabrics & Weaves': 'Indian textile', 'Embroidery & Surface': 'Indian embroidery and surface craft', 'Trims & Accessories': 'Indian trim and accessory'}.get(cat, cat.lower() + ' garment')
    if cat == 'Indian Footwear':
        p = (f"Product photograph of {name.lower()} ({subject}): {note} Shown from a three-quarter side angle on a plain surface. "
             "Soft diffused studio light, plain warm-grey background, gentle shadow, shallow depth of field. No logos, no brand names, no text, no people. Square 1:1, editorial catalogue style.")
    elif cat in ('Fabrics & Weaves', 'Embroidery & Surface'):
        p = (f"Close-up product photograph of {name.lower()} ({subject}): {note} Show the fabric or craft detail clearly on a draped garment piece, texture and weave visible. "
             "Soft diffused studio light, plain warm-grey background, shallow depth of field. No logos, no brand names, no text, no people or faces. Square 1:1, editorial catalogue style.")
    else:
        p = (f"Close-up product photograph of {name.lower()} ({subject}, Indian fashion): {note} Shown on a dress form or invisible mannequin, framed on the key detail. "
             "Soft diffused studio light, plain warm-grey background, shallow depth of field. No logos, no brand names, no text, no people or faces. Square 1:1, editorial catalogue style.")
    rows.append([islug(name) + '.png', name, DEPT[cat], cat, sub, ' '.join(c for c, ch in zip(I.CODES, life) if ch != '-'), 'Done' if islug(name) in done else 'Priority', p])
with open('../india-image-prompts.csv', 'w', newline='', encoding='utf-8') as f:
    w = csv.writer(f); w.writerow(['File name', 'Detail', 'Department', 'Category', 'Subcategory', 'Seasons', 'Priority', 'Prompt']); w.writerows(rows)
print(len(rows), 'india prompts')
