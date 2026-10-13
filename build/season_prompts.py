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
          'crossing a city street at golden hour, street-style photographer shot',
          'at a garden party under dappled sunlight',
          'backstage just before a runway show, natural window light',
          'outside an Art Deco building on a Mumbai street in the late afternoon',
          'in a sandstone courtyard with carved jharokha windows in Jaipur, soft shade',
          'on the steps of a modernist concrete building, Chandigarh-style architecture, hard midday shadows',
          'by a quiet Goa beach shack at sunset, warm low light',
          'browsing a busy flower market in the early morning, motion blur of people behind',
          'on a Delhi metro platform, cool overcast daylight',
          'on a breezy rooftop terrace in the city at blue hour',
          'in a minimal photo studio against a coloured seamless paper backdrop, soft flash',
          'cycling slowly down a leafy Bengaluru avenue, dappled light',
          'at a design-week café, sitting and laughing with a friend, natural window light',
          'walking past colourful old Fort Kochi walls after rain, soft diffused light',
          'in a sunlit textile workshop surrounded by fabric bolts'],
}
MODELS = ['South Asian', 'South Asian', 'South Asian', 'Black', 'East Asian', 'Latino', 'Middle Eastern', 'white', 'mixed-heritage']
AGES = ['in their twenties', 'in their twenties', 'in their thirties', 'in their forties']
BUILD = ['', '', ', with a curvier build', ', tall and lean', ', with an athletic build']
SHOT = ['shot on 35mm film', 'shot on a full-frame camera at 50mm', 'shot with a slightly wide 28mm lens', 'shot from a low angle', 'shot from across the street with a telephoto lens']
REDO = json.load(open('redo_images.json')) if os.path.exists('redo_images.json') else {}
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
                hh = h31('m' + it['name'])
                person = f"{MODELS[hh % len(MODELS)]} {'male' if dept == 'Menswear' else ('' if shoe else 'female')} model {AGES[(hh >> 4) % len(AGES)]} ".replace('  ', ' ').strip() + BUILD[(hh >> 8) % len(BUILD)]
                who = ("an " if person[0] in "AEIOU" else "a ") + person + (', framed so the shoes are clearly visible while walking' if shoe else '')
                scene = f"{scene}, {SHOT[(hh >> 12) % len(SHOT)]}"
                view = (['lateral side profile', 'side profile plus top view', 'three-quarter view'] if shoe else ['front view and back view', 'front view', 'front view with a small back view'])[h31(s + it['name']) % 3]
                prompt = (f"One single square image (1:1) split into two clean panels side by side, like a page from a professional fashion trend report. "
                          f"LEFT PANEL (about 55% width): a natural, realistic editorial photograph of {who} wearing {it['name'].lower()} ({cat.lower()}) {scene}, candid mid-movement, real skin and fabric texture, professional photoshoot quality, a unique face and pose not repeated from other images, natural unretouched skin, styled simply so the garment is the hero. "
                          f"{it['note']} Main colour: {col}; {MOOD['SS' if m['code'].startswith('SS') else 'AW'].split(':')[1].split(';')[0].strip()}. "
                          f"RIGHT PANEL (about 45% width, plain white background): an accurate technical flat sketch of the SAME garment in the same colour, {view}, drawn like an Adobe Illustrator tech-pack flat by a garment technician: crisp black vector outlines, dashed topstitching, correct seams and construction, the {('key' if it['area'].lower() == 'detail' else it['area'].lower())} detail drawn most clearly, flat colour fill with no shading or 3D. "
                          "A thin neutral gap between the two panels. No text, no labels, no arrows, no logos, no watermarks anywhere. It must look like a real photo plus a real designer's flat, not AI-generated.")
                redo = fn in REDO.get(s, [])
                rows.append([fn + '.png', it['name'], dept, cat, m['code'], STAT[ch].title(), 'Redo (photo + flat)' if (done and redo) else ('Done' if done else ('New for this season' if si != first else 'First season')), prompt])
                continue
            prompt = (f"{'Product photograph' if shoe else 'Close-up product photograph'} of {it['name'].lower()} ({cat.lower()}) for {m['code']} ({m['title']}), {angle}, clearly showing the {it['area'].lower()} detail. "
                      f"{it['note']} Colour: {col}. Season styling: {MOOD['AW' if m['code'].startswith('AW') else 'SS']}. Trend stage: {STAT[ch]}. "
                      f"{'Realistic leather or fabric texture, crisp stitching.' if shoe else 'Realistic fabric texture with visible seams and topstitching, garment on an invisible mannequin.'} "
                      "Plain warm-grey background, shallow depth of field. One single photo, no collage. No logos, no brand names, no text, no people or faces. Square 1:1, editorial catalogue style.")
            rows.append([fn + '.png', it['name'], dept, cat, m['code'], STAT[ch].title(), 'Done' if done else ('New for this season' if si != first else 'First season'), prompt])
    rows.sort(key=lambda r: (r[6] == 'Done', r[6] != 'First season', r[6].startswith('Redo')))
    with open(f'../season-prompts/{s}-image-prompts.csv', 'w', newline='', encoding='utf-8') as f:
        w = csv.writer(f); w.writerow(['File name', 'Detail', 'Department', 'Category', 'Season', 'Status', 'Progress', 'Prompt']); w.writerows(rows)
    tot[s] = (len(rows), sum(r[6] == 'Done' for r in rows))
print(tot)
