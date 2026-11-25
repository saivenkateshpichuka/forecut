"""Writes build/docs/images-to-generate-all.csv: a photorealistic image prompt for every published report and every
category tile, all seasons and audiences. Adults: fictional models. Kids audiences: product-only photography."""
import csv, glob, json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KIDS = {'kids', 'boys', 'girls', 'toddler-boys', 'toddler-girls'}
AUDW = {'women': 'womenswear', 'men': 'menswear', 'kids': 'childrenswear for ages 4 to 10', 'boys': 'boyswear for ages 6 to 12',
        'girls': 'girlswear for ages 6 to 12', 'toddler-boys': 'toddler boys\' clothing for ages 1 to 3', 'toddler-girls': 'toddler girls\' clothing for ages 1 to 3'}
MODEL = {'women': 'a fictional adult female model (not a real or recognisable person)', 'men': 'a fictional adult male model (not a real or recognisable person)'}
SC = {'ss': 'outdoors in warm late-afternoon sunlight on a pale stone terrace by the sea', 'aw': 'in a minimalist studio with soft north-facing window light and a warm grey plaster wall'}
CAM = ('Photorealistic, shot on a full-frame camera with a 50mm lens at f/2.8, natural light, true-to-life colour, real fabric texture and drape, '
       'realistic stitching and seams, subtle shadows, magazine-quality editorial finish.')
NEG = ('No text, no logos, no brand names, no watermarks, no recognisable real people or celebrities, no copied designer runway looks, '
       'no distorted hands or faces, no extra limbs, no plastic-looking fabric, no illustration or cartoon style.')
KNEG = (' No children or people in the image. No drawstrings or cords at neck or hood, no small loose parts, no beads or sequins on baby pieces.')
SEASON = {'ss27': 'Spring/Summer 2027', 'aw27': 'Autumn/Winter 2027', 'ss28': 'Spring/Summer 2028', 'aw28': 'Autumn/Winter 2028'}


def clean(t):
    t = re.sub(r'<sup>.*?</sup>', '', t)
    t = re.sub(r'\*\*', '', t)
    return re.sub(r'\[\[\w+\]\]', '', t).strip()


def flat(t):
    t = clean(t).replace('\n- ', ', ').replace('- ', '')
    return re.sub(r'\s+', ' ', t).strip().rstrip('.')


def bullets(body, n=4):
    out = []
    for line in body.splitlines():
        line = clean(line)
        if line.startswith('- ') or re.match(r'^\d+\. ', line):
            x = re.sub(r'^(- |\d+\. )', '', line).rstrip('.')
            x = x.split(':')[0] if len(x.split(':')[0]) > 3 and ':' in x and len(x) > 60 else x
            out.append(x)
    return out[:n]


def table_col(body, col=0, n=5):
    rows = [r for r in body.splitlines() if r.startswith('|') and not set(r) <= set('|- ')]
    vals = [clean(r.strip('|').split('|')[col]) for r in rows[1:]] if rows else []
    return vals[:n]


def palette(r):
    for sct in r['sections']:
        if sct['heading'] in ('The palette',) or 'Pantone' in sct['body'][:200]:
            rows = [x for x in sct['body'].splitlines() if x.startswith('| ') and '#' in x]
            return [f"{clean(x.split('|')[1])} {clean(x.split('|')[3])}" for x in rows][:7]
    return []


def sec(r, *names):
    for sct in r['sections']:
        if sct['heading'] in names:
            return sct['body']
    return ''


def subject(r):
    a, cat, sub = r['audience'], r['category'], r['subsection']
    kid = a in KIDS
    who = MODEL.get(a, '')
    se = SC[r['season'][:2]]
    if cat == 'themes':
        sil = bullets(sec(r, 'Silhouettes'), 3)
        fab = flat(sec(r, 'Fabrics'))
        cb = sec(r, 'Colours')
        col = ', '.join(f"{clean(x.split('|')[1])} {clean(x.split('|')[3])}" for x in cb.splitlines() if x.startswith('| ') and '#' in x) or flat(cb)
        trim = ', '.join(bullets(sec(r, 'Trims and details'), 3)) or flat(sec(r, 'Trims and details'))
        items = '; '.join(sil)
        if kid:
            return (f'Product still life for a {AUDW[a]} trend story: {items}, laid out as a styled flat lay on a natural linen backdrop. '
                    f'Fabrics: {fab}. Colours: {col}. Details: {trim}.')
        return f'Full-length editorial fashion photograph {se}: {who} wearing {items}. Fabrics: {fab}. Colours: {col}. Details: {trim}.'
    if cat == 'colours':
        pal = palette(r)
        if sub == 'season-colours' and pal:
            return f'Overhead photograph of folded fabric swatches (cotton poplin, wool, jersey, satin) arranged as a colour card in exactly these colours: {", ".join(pal)}. One solid colour per swatch, neat grid, soft daylight.'
        tb = sec(r, 'Palettes by theme', 'Palettes')
        if tb:
            rows_ = [[clean(c) for c in x.strip('|').split('|')] for x in tb.splitlines() if x.startswith('| ') and not x.startswith('| Theme')]
            body = '; '.join(f"{x[0]}: {', '.join(x[1:])}" for x in rows_)
        else:
            names = [h['heading'] for h in r['sections'] if h['heading'] not in ('How this forecast was built', 'The evidence', 'Why these palettes', 'Why')]
            body = '; '.join(f"{h['heading']}: {flat(h['body'])}" for h in r['sections'] if h['heading'] in names)
        return f'Overhead styled flat lay of fabric swatches, yarn and a few {AUDW[a]} garments grouped into colour stories: {body}'
    if cat == 'silhouettes':
        sh = bullets(sec(r, 'Shapes to lead with', 'Shapes', 'Shapes and fit'), 4)
        if kid:
            return f'Product photograph of {AUDW[a]} on child-size invisible mannequins, side by side: {"; ".join(sh)}. Clean light-grey studio background.'
        return f'Editorial photograph {se} of three fictional models (not real people) showing the season\'s {AUDW[a]} shapes: {"; ".join(sh)}.'
    if cat == 'fabrics':
        f = table_col(sec(r, 'Fabric by fabric'), 0, 5)
        return f'Macro photograph of {"woven" if sub == "woven" else "knitted"} fabric swatches for {AUDW[a]}, slightly overlapping on a table, each texture clearly visible: {", ".join(f)}. Raking side light to show weave and hand.'
    if cat == 'trims':
        if sub == 'trim-stories':
            sts = [h for h in r['sections'] if h['heading'] not in ('How this forecast was built', 'The evidence')]
            return f'Macro still life of garment trims grouped by theme for {AUDW[a]}: ' + '; '.join(f"{h['heading']}: {flat(h['body'])}" for h in sts) + '. Close focus, shallow depth of field.'
        if sub == 'trim-market-strategy':
            tb = sec(r, 'Build, test, sell through')
            rows_ = [[clean(c) for c in x.strip('|').split('|')] for x in tb.splitlines() if x.startswith('| ') and not x.startswith('| Action')]
            keep = ', '.join(x[1] for x in rows_ if x[0] in ('Build', 'Test'))
            return f'Trim card board photographed flat: {keep}, pinned in neat rows with blank tags, for {AUDW[a]}. Close focus, soft daylight.'
        t = table_col(sec(r, 'Trims table'), 0, 5) or bullets(' '.join('- ' + clean(x['body']) for x in r['sections'][2:5]), 4) or [r['summary']]
        if sub == 'trim-innovations':
            t = table_col(sec(r, 'Readiness'), 0, 4) or t
        return f'Macro still life of garment trims and details for {AUDW[a]} on fabric: {", ".join(t)}. Close focus, shallow depth of field.'
    if cat == 'styling':
        f = bullets(sec(r, 'Formulas', 'Looks to build', 'What to take from it'), 2)
        look = f[0] if f else r['summary']
        if kid:
            return f'Styled flat lay of a complete {AUDW[a]} outfit: {look}. Shoes and one accessory included, natural wood floor.'
        if sub == 'celebrity-influence':
            return f'Editorial photograph of {who} at an evening event entrance, wearing {look}. Must not resemble any real celebrity.'
        return f'Full-length editorial street-style photograph {se}: {who} wearing {look}.'
    if cat == 'couture':
        t = bullets(sec(r, 'Translating to ready-to-wear', 'Translating', 'Materials', 'The evidence'), 3)
        return f'Close-up photograph in a couture atelier: {"; ".join(t)} on {AUDW[a]} pieces, hands-free, work in progress on a cutting table, soft daylight.'
    if cat == 'business-strategy':
        o = bullets(sec(r, 'Opportunities', 'Assortment'), 4) or table_col(sec(r, 'Assortment'), 1, 3)
        return f'Photograph of a modern boutique {AUDW[a]} floor: rails and tables merchandised by category ({"; ".join(o)}), blank swing tags, calm premium retail interior.'
    if cat == 'innovations':
        m = table_col(sec(r, 'Readiness'), 0, 4) or bullets(sec(r, 'Actions'), 3)
        if sub == 'design-production':
            return f'Photograph of a garment development studio: a laptop with a 3D garment simulation (no readable text), paper patterns, fabric swatches and a sample {AUDW[a]} piece; {"; ".join(m)}.'
        return f'Macro photograph of innovative materials for {AUDW[a]}: {", ".join(m)}, with a water droplet beading on a treated surface where relevant.'
    return r['summary']


rows = []
for f in sorted(glob.glob(os.path.join(ROOT, 'content', 'reports', '*.json'))):
    r = json.load(open(f))
    if r.get('status') != 'published':
        continue
    a = r['audience']
    subj = subject(r)
    subj = re.sub(r'\.\.+', '.', re.sub(r'\s+', ' ', subj)).strip()
    prompt = f'{subj} {SEASON[r["season"]]} {AUDW[a]}. {CAM} 4:3 landscape, 1600 x 1200 px. {NEG}' + (KNEG if a in KIDS else '')
    fn = f"{r['season']}-{a}-{r['category']}-{r['slug']}"
    have = bool(r.get('images'))
    rows.append({'season': r['season'].upper(), 'audience': a, 'category': r['category'], 'type': 'report', 'title': r['title'],
                 'page': f"https://forecut.in/forecasts/{r['season']}/{a}/{r['category']}/{r['slug']}/",
                 'has_image_now': 'yes' if have else 'no', 'save_as': f'img/{fn}.webp', 'size': '1600 x 1200 (4:3)', 'chatgpt_prompt': prompt,
                 'caption_on_site': f"{r['title']}. Forecut generated image, not a photograph of a real collection.",
                 'credit_on_site': 'Forecut. Created with ChatGPT image generation (OpenAI) and edited by Forecut.'})

# category tiles
CATS = ['themes', 'colours', 'silhouettes', 'fabrics', 'trims', 'styling', 'couture', 'business-strategy', 'innovations']
CN = {'business-strategy': 'Business Strategy'}
for s in SEASON:
    for a in AUDW:
        for c in CATS:
            ex = [json.load(open(x)) for x in glob.glob(os.path.join(ROOT, 'content', 'reports', f'{s}-{a}-{c}-*.json'))]
            gist = (ex[0]['summary'] if ex else '')[:220]
            if a in KIDS:
                sub = f'Hero product photograph for the {SEASON[s]} {AUDW[a]} {CN.get(c, c.title())} category: {gist} Styled flat lay or child-size mannequin.'
            else:
                sub = f'Hero editorial photograph for the {SEASON[s]} {AUDW[a]} {CN.get(c, c.title())} category, {SC[s[:2]]}: {MODEL[a]}; {gist}'
            title = f'{s.upper()} {a.replace("-", " ").title()} {CN.get(c, c.title())}'
            rows.append({'season': s.upper(), 'audience': a, 'category': c, 'type': 'category tile', 'title': title,
                         'page': f'https://forecut.in/forecasts/{s}/{a}/{c}/', 'has_image_now': 'no', 'save_as': f'img/{s}-{a}-{c}-tile.webp',
                         'size': '1200 x 1500 (4:5)', 'chatgpt_prompt': f'{sub} {CAM} 4:5 portrait, 1200 x 1500 px. {NEG}' + (KNEG if a in KIDS else ''),
                         'caption_on_site': f'{title}. Forecut generated image, not a photograph of a real collection.',
                         'credit_on_site': 'Forecut. Created with ChatGPT image generation (OpenAI) and edited by Forecut.'})
ORD = {'SS27': 0, 'AW27': 1, 'SS28': 2, 'AW28': 3}
AO = list(AUDW)
rows.sort(key=lambda x: (ORD[x['season']], AO.index(x['audience']), x['type'] != 'category tile', x['category'], x['title']))
out = os.path.join(ROOT, 'build', 'docs', 'images-to-generate-all.csv')
with open(out, 'w', newline='', encoding='utf-8-sig') as fh:
    w = csv.DictWriter(fh, fieldnames=list(rows[0]))
    w.writeheader(); w.writerows(rows)
print(len(rows), 'rows ->', out)
