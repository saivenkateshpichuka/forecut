"""Write ../season-prompts/<season>-image-prompts.csv: one new image per detail per season.
A detail's FIRST season uses the plain file name (slug.png, same as the main report); every later season uses slug-<season>.png,
with that season's colours and fabric weight so each season's photo looks different. Already-uploaded images are marked Done."""
import csv, json, os
from seasons_data import SEASONS, META
M = json.load(open('details.json')); IMGS = set(json.load(open('images.json')))
def islug(x): return ''.join(ch.lower() if ch.isalnum() else '-' for ch in x).strip('-').replace('--', '-').replace('--', '-')
def h31(x):
    v = 0
    for ch in x: v = (v * 31 + ord(ch)) & 0xffffffff
    return v
MOOD = {'AW': 'autumn/winter: heavier fabrics such as wool, melton, tweed, velvet, leather, knit; deeper tones; soft moody studio light',
        'SS': 'spring/summer: lighter fabrics such as cotton, linen, poplin, seersucker, organza; fresh brighter tones; bright airy studio light'}
STORY = {  # seasons whose photos are people-in-a-story with a zoomed detail inset
 'ss27': ['walking the runway at a bright daylight fashion show, front-row blur behind',
          'strolling down a sunny whitewashed Mediterranean street',
          'crossing a city street at golden hour, street-style photographer shot',
          'on a seaside promenade with a soft breeze in the fabric',
          'at a garden party under dappled sunlight',
          'stepping out of a modern art gallery in bright daylight',
          'on a café terrace in a sunlit old town square',
          'backstage just before a runway show, natural window light'],
}
STORY_SINCE = {'ss27': '2026-10-13'}  # uploads on/after this date are already in story style
LOG = json.load(open('upload_log.json')) if os.path.exists('upload_log.json') else {}
STAT = {'e': 'emerging', 'r': 'rising', 'p': 'peaking', 'f': 'fading'}
os.makedirs('../season-prompts', exist_ok=True)
tot = {}
for si, s in enumerate(SEASONS):
    m = META[s]; rows = []
    for dept, cat in M['order']:
        for it in M['model'][f'{dept}|{cat}']:
            ch = it['life'][si]
            if ch == '-': continue
            first = next(i for i, c in enumerate(it['life']) if c != '-')
            sl = islug(it['name']); fn = sl if si == first else f'{sl}-{s}'
            done = fn in IMGS
            col = m['palette'][h31(it['name'] + s) % len(m['palette'])][1].lower()
            angle = ['three-quarter front view', 'close-up detail view', 'flat-lay from above', 'side view'][h31(s + it['name']) % 4]
            shoe = dept == 'Footwear'
            if s in STORY:
                scene = STORY[s][h31(it['name']) % len(STORY[s])]
                who = 'a male model' if dept == 'Menswear' else ('a model, framed to show the shoes clearly while walking' if shoe else 'a female model')
                prompt = (f"Natural editorial fashion photograph for {m['code']} ({m['title']}): {who} wearing {it['name'].lower()} ({cat.lower()}) {scene}, caught mid-movement with a real, candid feel. "
                          f"{it['note']} Main colour: {col}; styling: {MOOD['SS' if m['code'].startswith('SS') else 'AW'].split(':')[1].split(';')[0].strip()}. "
                          f"Add ONE circular magnified close-up inset in the lower-right area (about 28% of the frame, thin white border, kept about 12% in from the right and bottom edges so it is never cropped) zooming into the {it['area'].lower()} so the detail is crystal clear: fabric texture, stitching and construction visible. "
                          "Photorealistic, natural skin and fabric, professional photoshoot quality, diverse adult model. No logos, no brand names, no text, no watermarks. Square 1:1.")
                rows.append([fn + '.png', it['name'], dept, cat, m['code'], STAT[ch].title(), 'Done' if (done and LOG.get(fn, '') >= STORY_SINCE.get(s, '9999')) else 'Redo (story style)' if done else ('New for this season' if si != first else 'First season'), prompt])
                continue
            prompt = (f"{'Product photograph' if shoe else 'Close-up product photograph'} of {it['name'].lower()} ({cat.lower()}) for {m['code']} ({m['title']}), {angle}, clearly showing the {it['area'].lower()} detail. "
                      f"{it['note']} Colour: {col}. Season styling: {MOOD['AW' if m['code'].startswith('AW') else 'SS']}. Trend stage: {STAT[ch]}. "
                      f"{'Realistic leather or fabric texture, crisp stitching.' if shoe else 'Realistic fabric texture with visible seams and topstitching, garment on an invisible mannequin.'} "
                      "Plain warm-grey background, shallow depth of field. One single photo, no collage. No logos, no brand names, no text, no people or faces. Square 1:1, editorial catalogue style.")
            rows.append([fn + '.png', it['name'], dept, cat, m['code'], STAT[ch].title(), 'Done' if done else ('New for this season' if si != first else 'First season'), prompt])
    rows.sort(key=lambda r: (r[6] == 'Done', r[6] != 'First season', r[6] == 'Redo (story style)'))
    with open(f'../season-prompts/{s}-image-prompts.csv', 'w', newline='', encoding='utf-8') as f:
        w = csv.writer(f); w.writerow(['File name', 'Detail', 'Department', 'Category', 'Season', 'Status', 'Progress', 'Prompt']); w.writerows(rows)
    tot[s] = (len(rows), sum(r[6] == 'Done' for r in rows))
print(tot)
