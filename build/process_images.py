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
_S = json.load(open('seasons.json'))
themes_v = {'theme-' + s + '-' + islug(t[0]) for s in seasons for t in _S['meta'][s]['themes']} | {'theme-india-' + islug(t['t']) for t in I.THEMES}
import hubs_data as HD
hubs_v = {c for h in HD.HUBS for c in h['hero'] + [x for a in h['articles'] for x in a['img']] + [x for a in h.get('ateliers', []) for x in a['img']] if c.startswith('hub-')}
import journal_data as JDX
hubs_v |= {a['hero_new'] for a in JDX.ARTICLES if a.get('hero_new')}
themes_v |= hubs_v  # hub images: 16:10 like theme tiles
flats_v = {'flat-' + b for b in base} | {'flat-' + b + '-' + s for b in base for s in seasons}
valid = base | {b + '-' + s for b in base for s in seasons} | heroes | themes_v | flats_v
imgs = set(json.load(open('images.json')))
import datetime
log = json.load(open('upload_log.json')) if os.path.exists('upload_log.json') else {}
src = '../images'; os.makedirs('../img', exist_ok=True); os.makedirs(src + '/done', exist_ok=True)
added, bad, broken = [], [], []
for root, dirs, files in os.walk(src):
    if '/done' in root.replace('\\', '/') or '/broken' in root.replace('\\', '/'): continue
    for f in files:
        if not f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')): continue
        s = os.path.splitext(f)[0].strip().lower().replace(' ', '-').replace('_', '-')
        p = os.path.join(root, f)
        if s not in valid: bad.append(f); continue
        try: im = Image.open(p); im.load(); im = im.convert('RGB'); w, h = im.size
        except Exception:  # corrupt/partial upload: set aside so the row stays "not Done" and gets regenerated
            os.makedirs(os.path.join(src, 'broken'), exist_ok=True); shutil.move(p, os.path.join(src, 'broken', f)); broken.append(f); continue
        if s in flats_v:  # technical flat sketch: keep whole drawing, pad to square on white
            im.thumbnail((1000, 1000), Image.LANCZOS); bg = Image.new('RGB', (1000, 1000), (255, 255, 255))
            bg.paste(im, ((1000 - im.width) // 2, (1000 - im.height) // 2)); bg.save(f'../img/{s}.webp', 'WEBP', quality=86)
        elif s in themes_v:  # theme tile photo: 16:10, 1600x1000
            th = int(w * 10 / 16)
            if th <= h: im = im.crop((0, (h - th) // 2, w, (h - th) // 2 + th))
            else: tw = int(h * 16 / 10); im = im.crop(((w - tw) // 2, 0, (w - tw) // 2 + tw, h))
            im = im.resize((1600, 1000), Image.LANCZOS); im.save(f'../img/{s}.webp', 'WEBP', quality=80)
        elif s in heroes:  # season story banner: wide 16:9, 1920x1080
            th = int(w * 9 / 16)
            if th <= h: im = im.crop((0, (h - th) // 2, w, (h - th) // 2 + th))
            else: tw = int(h * 16 / 9); im = im.crop(((w - tw) // 2, 0, (w - tw) // 2 + tw, h))
            im = im.resize((1920, 1080), Image.LANCZOS); im.save(f'../img/{s}.webp', 'WEBP', quality=78)
        else:
            m = min(w, h)
            im = im.crop(((w - m) // 2, (h - m) // 2, (w - m) // 2 + m, (h - m) // 2 + m)).resize((800, 800), Image.LANCZOS)
            im.save(f'../img/{s}.webp', 'WEBP', quality=82)
        imgs.add(s); added.append(s); log[s] = datetime.date.today().isoformat()
        shutil.move(p, os.path.join(src, 'done', f))
json.dump(sorted(imgs), open('images.json', 'w'))
json.dump(log, open('upload_log.json', 'w'), indent=1, sort_keys=True)
u = os.path.join(src, 'UNMATCHED.txt')
if bad: open(u, 'w').write('These files did not match any detail. Rename them to the exact File name from the prompt CSV and upload again:\n' + '\n'.join(bad) + '\n')
elif os.path.exists(u): os.remove(u)
bk = os.path.join(src, 'BROKEN.txt')
if broken: open(bk, 'a').write(''.join(f'{f} — upload was corrupted (not a valid image). Generate and upload it again.\n' for f in broken))
print('added', len(added), 'unmatched', len(bad), 'broken', len(broken))
