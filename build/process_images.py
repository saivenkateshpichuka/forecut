"""Convert new uploads in ../images/ into ../img/<slug>.webp (800x800), add them to images.json, move originals to ../images/done/.
Accepts <slug>.png and <slug>-<season>.png for any global or India detail, and hero-<season>.png / hero-india.png (wide season story banners, saved 1920x1080). Unmatched files are listed in ../images/UNMATCHED.txt."""
import json, os, shutil, sys
from PIL import Image
os.chdir(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, '.')
import india_data as I
def islug(x): return ''.join(ch.lower() if ch.isalnum() else '-' for ch in x).strip('-').replace('--', '-').replace('--', '-')
M = json.load(open('details.json'))['model']
base = {islug(it['name']) for v in M.values() for it in v} | {islug(x[2]) for x in I.D}
seasons = json.load(open('seasons.json'))['seasons']
heroes = {'hero-' + s for s in seasons} | {'hero-india'}
valid = base | {b + '-' + s for b in base for s in seasons} | heroes
imgs = set(json.load(open('images.json')))
src = '../images'; os.makedirs('../img', exist_ok=True); os.makedirs(src + '/done', exist_ok=True)
added, bad = [], []
for root, dirs, files in os.walk(src):
    if '/done' in root.replace('\\', '/'): continue
    for f in files:
        if not f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')): continue
        s = os.path.splitext(f)[0].strip().lower().replace(' ', '-').replace('_', '-')
        p = os.path.join(root, f)
        if s not in valid: bad.append(f); continue
        im = Image.open(p).convert('RGB'); w, h = im.size
        if s in heroes:  # season story banner: wide 16:9, 1920x1080
            th = int(w * 9 / 16)
            if th <= h: im = im.crop((0, (h - th) // 2, w, (h - th) // 2 + th))
            else: tw = int(h * 16 / 9); im = im.crop(((w - tw) // 2, 0, (w - tw) // 2 + tw, h))
            im = im.resize((1920, 1080), Image.LANCZOS); im.save(f'../img/{s}.webp', 'WEBP', quality=78)
        else:
            m = min(w, h)
            im = im.crop(((w - m) // 2, (h - m) // 2, (w - m) // 2 + m, (h - m) // 2 + m)).resize((800, 800), Image.LANCZOS)
            im.save(f'../img/{s}.webp', 'WEBP', quality=82)
        imgs.add(s); added.append(s)
        shutil.move(p, os.path.join(src, 'done', f))
json.dump(sorted(imgs), open('images.json', 'w'))
u = os.path.join(src, 'UNMATCHED.txt')
if bad: open(u, 'w').write('These files did not match any detail. Rename them to the exact File name from the prompt CSV and upload again:\n' + '\n'.join(bad) + '\n')
elif os.path.exists(u): os.remove(u)
print('added', len(added), 'unmatched', len(bad))
