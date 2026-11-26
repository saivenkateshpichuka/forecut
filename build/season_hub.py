"""Build the new-design SS27 season preview from existing content.

Reads build/details.json (items), build/seasons.json (themes, palette), content/reports/ss27-*.json and img/.
Writes forecasts/ss27/ (hub, c/ categories, r/ reports), the /forecasts/ landing, redirect stubs for old report URLs and sitemap entries. Run from build/: python3 season_hub.py
"""
import json, os, re, glob, shutil, html, collections
import markdown as MD
import pantone as PT

B = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(B)
OUT = os.path.join(ROOT, 'forecasts', 'ss27')
S = 'ss27'
SK = ['aw26', 'ss27', 'aw27', 'ss28', 'aw28']
SKL = ['AW26', 'SS27', 'AW27', 'SS28', 'AW28']
E = html.escape
DET = json.load(open(os.path.join(B, 'details.json')))['model']
META = json.load(open(os.path.join(B, 'seasons.json')))['meta'][S]
IMG = set(os.path.splitext(f)[0] for f in os.listdir(os.path.join(ROOT, 'img')) if f.endswith('.webp'))
STAGE = {'e': 'Emerging', 'r': 'Rising', 'p': 'Peaking', 'f': 'Fading'}
DO = {'e': 'Test in small runs and watch the January fairs before committing depth.',
      'r': 'Build range depth now; this is the window to add colours and fabrics.',
      'p': 'Buy the core, protect margin and plan the exit.',
      'f': 'Reduce, clear and keep only proven sellers.'}
FAB = {'Fabric', 'Material', 'Finish', 'Wash', 'Print', 'Pattern', 'Texture'}
TRIM = {'Hem', 'Strap', 'Pleat', 'Lining', 'Trim', 'Hardware', 'Closure', 'Embellishment', 'Pocket', 'Placket', 'Collar', 'Cuff', 'Stitch', 'Seam', 'Lapel', 'Neckline', 'Detail', 'Edge', 'Perforation'}
SIL = {'Shape', 'Silhouette', 'Waist', 'Shoulder', 'Sleeve', 'Length', 'Leg', 'Front', 'Back', 'Bodice', 'Panel', 'Layer', 'Cut', 'Garment', 'Toe', 'Heel', 'Shaft', 'Sole'}
AUD = [('women', 'Women'), ('men', 'Men'), ('kids', 'Kids'), ('boys', 'Boys'), ('girls', 'Girls'), ('toddler-boys', 'Toddler Boys'), ('toddler-girls', 'Toddler Girls')]
AUDN = dict(AUD)
RCAT = {'themes': 'Themes', 'colours': 'Colour', 'silhouettes': 'Silhouettes', 'fabrics': 'Fabrics', 'trims': 'Trims', 'styling': 'Styling',
        'couture': 'Couture and craft', 'business-strategy': 'Business strategy', 'innovations': 'Innovations'}


def islug(s):
    return re.sub('-+', '-', ''.join(c.lower() if c.isalnum() else '-' for c in s)).strip('-')


def photo(n):
    sl = islug(n)
    for c in (f'{sl}-{S}-photo', f'{sl}-photo', f'{sl}-{S}', sl):
        if c in IMG:
            return c


def media(n):
    """Realistic photo first, then flat sketches. Flats are only used in the pop-up."""
    sl = islug(n)
    ph = next((c for c in (f'{sl}-{S}-photo', f'{sl}-photo', f'{sl}-aw27-photo', f'{sl}-ss28-photo', f'{sl}-aw28-photo', f'{sl}-aw26-photo') if c in IMG), None)
    flats = []
    pref = [ph[:-6]] if ph else []
    pref += [sl, f'{sl}-{S}', f'{sl}-aw27', f'{sl}-ss28', f'{sl}-aw28']
    for p_ in pref:
        fl = [f'{p_}-f{i}' for i in range(1, 7) if f'{p_}-f{i}' in IMG]
        if fl:
            flats = fl
            break
    return ph, flats


def md(t):
    return MD.markdown(t or '', extensions=['extra', 'sane_lists'])


def tcx(h):
    try:
        return PT.nearest(h)[0]
    except Exception:
        return ''


# ---------------------------------------------------------------- data
ITEMS = []   # dict(name, area, note, life, dept, sub, img)
for k, L in DET.items():
    dept, sub = k.split('|')
    for it in L:
        if it['life'][1] != '-':
            ph, fl = media(it['name'])
            ITEMS.append(dict(name=it['name'], area=it['area'], note=it['note'], life=it['life'], dept=dept, sub=sub, img=ph, flats=fl, st=it['life'][1]))
REPORTS = []
for f in sorted(glob.glob(os.path.join(ROOT, 'content', 'reports', 'ss27-*.json'))):
    r = json.load(open(f))
    if r.get('status') != 'published':
        continue
    im = [x for x in (r.get('images') or []) if x['file'] in IMG and not re.search(r'-f\d$', x['file'])]
    r['_img'] = im[0]['file'] if im else None
    r['_id'] = f"{r['audience']}-{r['category']}-{r['slug']}"
    REPORTS.append(r)
PAL = META['palette']

CATS = [  # key, title, lead, kind, filter
    ('themes', 'Themes', 'The big stories of the season: why each is happening and the pieces that carry it.'),
    ('colour', 'Colour', 'The season palette with Pantone TCX and HEX codes, and the colour stories behind each theme.'),
    ('silhouettes', 'Silhouettes', 'Shapes, waists, shoulders, sleeves and lengths, with woven and knit fit direction by audience.'),
    ('fabrics', 'Fabrics and materials', 'Fabrics, finishes, washes, prints and textures, with woven and knit direction.'),
    ('womenswear', 'Womenswear', 'Coats, dresses, tops, knitwear, trousers, skirts, denim and tailoring, item by item.'),
    ('menswear', 'Menswear', 'Outerwear, shirts, knitwear, tailoring and trousers, item by item.'),
    ('kidswear', 'Kidswear', 'Kids, boys, girls and toddlers: every report written for children, grouped by topic.'),
    ('footwear', 'Footwear', 'Heels and flats, boots, men\'s shoes, sneakers and casual shoes, item by item.'),
    ('knitwear', 'Knitwear', 'Knit shapes, stitches and yarns for women and men.'),
    ('trims', 'Trims and details', 'Collars, closures, pockets, hardware, linings and embellishment, with trim stories and strategy.'),
    ('accessories', 'Accessories', 'Ties, pocket squares, brooches, straps and hardware. Bags, belts, jewellery and headwear are in research.'),
    ('styling', 'Styling', 'Casual, formal and party looks, plus celebrity influence, by audience.'),
    ('couture', 'Couture and craft', 'Craft techniques and materials and details for the occasion and festive wardrobe.'),
    ('business', 'Business strategy', 'Assortment, pricing, category opportunities and market notes.'),
    ('innovations', 'Innovations', 'New materials, trim innovations and design and production changes.'),
]
CAT = {c[0]: c for c in CATS}
RMAP = {'themes': ['themes'], 'colour': ['colours'], 'silhouettes': ['silhouettes'], 'fabrics': ['fabrics'], 'trims': ['trims'], 'styling': ['styling'],
        'couture': ['couture'], 'business': ['business-strategy'], 'innovations': ['innovations']}
AUDSETS = {'womenswear': ['women'], 'menswear': ['men'], 'kidswear': ['kids', 'boys', 'girls', 'toddler-boys', 'toddler-girls'], 'knitwear': [], 'footwear': [], 'accessories': []}


def item_filter(key, it):
    if key == 'womenswear':
        return it['dept'] == 'Womenswear'
    if key == 'menswear':
        return it['dept'] == 'Menswear'
    if key == 'footwear':
        return it['dept'] == 'Footwear'
    if key == 'knitwear':
        return it['sub'] == 'Knitwear'
    if key == 'silhouettes':
        return it['area'] in SIL
    if key == 'fabrics':
        return it['area'] in FAB
    if key == 'trims':
        return it['area'] in TRIM
    if key == 'accessories':
        return it['area'] == 'Accessory'
    return False


def reports_for(key):
    if key in RMAP:
        cs = RMAP[key]
        return [r for r in REPORTS if r['category'] in cs]
    a = AUDSETS.get(key, [])
    return [r for r in REPORTS if r['audience'] in a]


# ---------------------------------------------------------------- html
P = '/forecasts/ss27/'
C = P + 'c/'
FONTS = ''


def page(title, desc, body, extra='', canon='/forecasts/ss27/'):
    return (f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
            f'<!--forecut-new--><meta name="robots" content="index,follow"><title>{E(title)}</title><meta name="description" content="{E(desc[:200])}"><link rel="canonical" href="https://forecut.in{canon}"><meta property="og:title" content="{E(title)}"><meta property="og:description" content="{E(desc[:200])}"><meta property="og:type" content="website"><link rel="icon" href="/favicon.svg" type="image/svg+xml">{FONTS}'
            f'<link rel="stylesheet" href="{C}style.css"></head><body>{header()}{body}{footer()}{extra}</body></html>')


def header():
    return (f'<header class="top"><div class="w tb"><a class="logo" href="/">Forecut</a><nav><a href="/forecasts/">Forecasts</a><a href="{P}">SS27</a><a href="/insights.html">Insights</a>'
            f'<a href="/tools.html">Tools</a><a href="/about.html">About</a></nav><a class="btn" href="/account.html#signin">Log in</a></div></header>')


def footer():
    cols = [('Forecasts', [('All forecasts', '/forecasts/'), ('SS27', P), ('Themes', C + 'themes.html'), ('Colour', C + 'colour.html'), ('Footwear', C + 'footwear.html')]),
            ('Company', [('About Forecut', '/about.html'), ('Our method', '/method.html'), ('Contact', '/contact.html')]),
            ('Resources', [('Insights', '/insights.html'), ('Tools', '/tools.html'), ('Privacy', '/privacy.html'), ('Terms', '/terms.html')])]
    return ('<footer class="ft"><div class="w fg"><div><b class="logo">Forecut</b><p>Seasonal fashion forecasts and design tools.</p><p>hello@forecut.in</p></div>' +
            ''.join(f'<div><h4>{h}</h4>' + ''.join(f'<a href="{u}">{t}</a>' for t, u in xs) + '</div>' for h, xs in cols) + '</div></footer>')


def catnav(active):
    return ('<div class="cn"><div class="w">' + ''.join(f'<a href="{C}{k}.html"{" class=on" if k == active else ""}>{E(t)}</a>' for k, t, _ in CATS) + '</div></div>')


def pill(st):
    return f'<span class="pill s-{st}">{STAGE[st]}</span>'


def tile(it, i):
    life = it['life']
    attrs = f'data-n="{E(it["name"])}" data-a="{E(it["area"])}" data-note="{E(it["note"])}" data-life="{life}" data-st="{it["st"]}" data-img="{it["img"] or ""}" data-flats="{",".join(it["flats"])}" data-sub="{E(it["dept"] + ", " + it["sub"])}"'
    im = f'<img src="/img/{it["img"]}.webp" alt="{E(it["name"])}" loading="lazy">' if it['img'] else '<span class="noimg"></span>'
    return (f'<button type="button" class="tile" {attrs}><span class="ti">{im}</span><span class="tt"><b>{E(it["name"])}</b>'
            f'<span class="tm">{E(it["area"])} {pill(it["st"])}</span></span></button>')


def rcard(r):
    palette = ''.join(f'<i style="background:{h}"></i>' for h, _ in PAL)
    if r['_img']:
        top = f'<span class="rci"><img src="/img/{r["_img"]}.webp" alt="" loading="lazy"></span>'
    else:
        top = f'<span class="rci ph"><span class="pal">{palette}</span><em>{E(RCAT.get(r["category"], ""))}</em></span>'
    return (f'<a class="rcard" data-aud="{r["audience"]}" href="{P}r/{r["_id"]}.html">{top}<span class="rcb"><span class="chip">{E(AUDN.get(r["audience"], r["audience"]))}</span>'
            f'<b>{E(r["title"])}</b><span class="rs">{E(r.get("summary", "")[:170])}</span></span></a>')


def audfilter(auds):
    if len(auds) < 2:
        return ''
    return ('<div class="af" role="group" aria-label="Audience"><button type="button" class="on" data-aud="all">All</button>' +
            ''.join(f'<button type="button" data-aud="{a}">{E(AUDN[a])}</button>' for a in auds) + '</div>')


def category_page(key):
    _, title, lead = CAT[key]
    items = [it for it in ITEMS if item_filter(key, it)]
    reps = reports_for(key)
    body = f'{catnav(key)}<main><section class="w ph1"><p class="crumb"><a href="{P}">SS27</a> / {E(title)}</p><h1>{E(title)}</h1><p class="lead">{E(lead)}</p></section>'
    if key == 'colour':
        sw = ''.join(f'<button type="button" class="sw" data-copy="{h}"><span style="background:{h}"></span><b>{E(n)}</b><small>{tcx(h)}, {h.upper()}</small></button>' for h, n in PAL)
        body += f'<section class="w sec"><h2>Season palette</h2><p class="sub">Select a swatch to copy its HEX code.</p><div class="swg">{sw}</div></section>'
    if key == 'themes':
        cards = ''
        for t in META['themes']:
            sl = islug(t[0]); im = f'theme-{S}-{sl}'
            pic = f'<img src="/img/{im}.webp" alt="{E(t[0])}" loading="lazy">' if im in IMG else ''
            kw = ''.join(f'<span class="chip">{E(k)}</span>' for k in t[6][:4])
            cards += f'<article class="th"><span class="thi" style="background:{t[4]}">{pic}</span><div><h3>{E(t[0])}</h3><p>{E(t[1])}</p><p class="small">Key item: {E(t[5])}</p><div>{kw}</div></div></article>'
        body += f'<section class="w sec"><h2>Season themes</h2><div class="thg">{cards}</div></section>'
    if items:
        groups = collections.OrderedDict()
        for it in items:
            groups.setdefault(it['dept'] + ', ' + it['sub'] if key in ('silhouettes', 'fabrics', 'trims', 'knitwear', 'accessories') else it['sub'], []).append(it)
        nav = ''.join(f'<a href="#g{n}">{E(g)}</a>' for n, g in enumerate(groups))
        body += f'<section class="w sec"><h2>Detailing</h2><p class="sub">Select any item to open its detail card: what it is, where it sits in the cycle, and what to do.</p><div class="gnav">{nav}</div>'
        for n, (g, L) in enumerate(groups.items()):
            L.sort(key=lambda x: ('erpf'.index(x['st'])))
            body += f'<div class="grp" id="g{n}"><h3>{E(g)}</h3><div class="tg">{"".join(tile(i, n) for i in L)}</div></div>'
        body += '</section>'
    if key == 'accessories':
        todo = ['Bags and small leather goods', 'Belts', 'Jewellery', 'Headwear', 'Eyewear', 'Scarves and hosiery']
        body += ('<section class="w sec"><h2>In research</h2><p class="sub">These accessory groups are being researched and will be added with sourced evidence.</p><div class="todo">' +
                 ''.join(f'<span>{E(t)}</span>' for t in todo) + '</div></section>')
    if reps:
        auds = [a for a, _ in AUD if any(r['audience'] == a for r in reps)]
        order = list(RCAT) if key in ('kidswear',) else None
        body += f'<section class="w sec"><h2>Reports</h2>{audfilter(auds)}'
        if key == 'kidswear':
            for c in RCAT:
                rs = [r for r in reps if r['category'] == c]
                if rs:
                    body += f'<h3 class="gh">{E(RCAT[c])}</h3><div class="rg">{"".join(rcard(r) for r in rs)}</div>'
        else:
            subs = collections.OrderedDict()
            for r in reps:
                subs.setdefault(r.get('subsection') or 'reports', []).append(r)
            for s_, rs in subs.items():
                nm = s_.replace('-', ' ').capitalize() if s_ != 'reports' else 'Reports'
                body += f'<h3 class="gh">{E(nm)}</h3><div class="rg">{"".join(rcard(r) for r in rs)}</div>'
        body += '</section>'
    body += '</main>' + DIALOG
    return page(f'{title}, SS27 | Forecut', lead, body, f'<script src="{C}app.js"></script>', f'{C}{key}.html')


DIALOG = ('<dialog id="dc" aria-label="Detail card"><div class="dcg"><div class="dci"><img id="dimg" alt=""><button type="button" class="sl p" id="dprev" aria-label="Previous image">&#8249;</button><button type="button" class="sl n" id="dnext" aria-label="Next image">&#8250;</button><span class="scap" id="dcap"></span></div><div class="dcb">'
          '<button type="button" class="x" id="dx" aria-label="Close">x</button><span class="chip" id="dsub"></span>'
          '<h3 id="dn"></h3><p id="dnote" class="dnote"></p><div id="dpill"></div><h4>Where it sits in the cycle</h4><div class="life" id="dlife"></div>'
          '<p class="small">Forecut stage for each season, from emerging to fading.</p><div class="do"><b>Do this:</b> <span id="ddo"></span></div>'
          '<div class="acts"><button type="button" class="btn">Add to spec pack</button><button type="button" class="btn o">Save to board</button></div></div></div></dialog>')


def report_page(r):
    imgs = [x for x in (r.get('images') or []) if x['file'] in IMG and not re.search(r'-f\d$', x['file'])]
    hero = ''
    if imgs:
        im = imgs[0]
        hero = f'<figure class="rf"><img src="/img/{im["file"]}.webp" alt="{E(im.get("caption", ""))}"><figcaption>{E(im.get("caption", ""))} <span>{E(im.get("credit", ""))}</span></figcaption></figure>'
    cat = {'themes': 'themes', 'colours': 'colour', 'business-strategy': 'business'}.get(r['category'], r['category'])
    meta = [('Season', 'Spring/Summer 2027'), ('Audience', AUDN.get(r['audience'], '')), ('Category', RCAT.get(r['category'], '')), ('Published', r.get('published', '')),
            ('Research period', r.get('research_period', '')), ('Market', r.get('markets', '')), ('Trend status', r.get('trend_status', ''))]
    mt = ''.join(f'<div><dt>{a}</dt><dd>{E(b)}</dd></div>' for a, b in meta if b)
    secs = ''.join(f'<section class="rsec"><h2>{E(s_["heading"])}</h2>{md(s_["body"])}</section>' for s_ in r.get('sections', []))
    for h, k in (('Timing', 'timing'), ('Products and customers', 'products'), ('Design implications', 'design_implications'), ('Commercial implications', 'commercial_implications')):
        if r.get(k):
            secs += f'<section class="rsec"><h2>{h}</h2>{md(r[k])}</section>'
    if len(imgs) > 1:
        secs += '<section class="rsec"><h2>Images</h2><div class="rfs">' + ''.join(f'<figure class="rf"><img src="/img/{x["file"]}.webp" alt="{E(x.get("caption", ""))}" loading="lazy"><figcaption>{E(x.get("caption", ""))} <span>{E(x.get("credit", ""))}</span></figcaption></figure>' for x in imgs[1:]) + '</div></section>'
    src = ''.join(f'<li><a href="{E(x["url"])}" target="_blank" rel="noopener">{E(x["title"])}</a>, {E(x.get("publisher", ""))}{", " + E(x["date"]) if x.get("date") else ""}{". " + E(x["note"]) if x.get("note") else ""}</li>' for x in (r.get('sources') or []))
    if src:
        secs += f'<section class="rsec"><h2>Evidence and sources</h2><ol class="srcs">{src}</ol></section>'
    body = (f'{catnav(cat if cat in CAT else "")}<main><article class="w rp"><p class="crumb"><a href="{P}">SS27</a> / <a href="{C}{cat}.html">{E(RCAT.get(r["category"], ""))}</a> / {E(AUDN.get(r["audience"], ""))}</p>'
            f'<div class="rh"><div><h1>{E(r["title"])}</h1><p class="lead">{E(r.get("summary", ""))}</p></div>{hero}</div><dl class="meta">{mt}</dl>{secs}</article></main>')
    return page(f'{r["title"]} | Forecut', r.get('summary', ''), body, '', f'{P}r/{r["_id"]}.html')


def tile_photo(k):
    if f'cover-{S}-{k}' in IMG:
        return f'cover-{S}-{k}'
    area = {'silhouettes': ('Silhouette', 'Shape'), 'styling': ('Styling',), 'accessories': ('Accessory',), 'couture': ('Embellishment',), 'innovations': ('Material', 'Perforation')}.get(k)
    if area:
        for a in area:
            for it in ITEMS:
                if it['area'] == a and it['img'] and it['st'] in 'rp':
                    return it['img']
    if k == 'kidswear':
        for r in REPORTS:
            if r['audience'] in AUDSETS['kidswear'] and r['_img']:
                return r['_img']
    return None


def hub():
    sw = ''.join(f'<span class="swm"><i style="background:{h}"></i><b>{E(n)}</b><small>{tcx(h)}</small></span>' for h, n in PAL)
    def ct(k, stage_img=None):
        _, t, lead = CAT[k]
        im = stage_img or tile_photo(k)
        if im:
            return f'<a class="ct" href="{C}{k}.html"><span class="cti"><img src="/img/{im}.webp" alt="" loading="lazy"></span><b>{E(t)}</b><span>{E(lead)}</span></a>'
        return f'<a class="ct" href="{C}{k}.html"><span class="cti tp"><em>{E(t)}</em></span><b>{E(t)}</b><span>{E(lead)}</span></a>'
    def sec(n, t, q, inner):
        return f'<section class="w sec st" id="s{n}"><div class="sth"><b>{n}</b><h2>{t}</h2><span>{q}</span></div>{inner}</section>'
    ths = ''.join(f'<a class="tc" href="{C}themes.html"><span class="tci" style="background:{t[4]}"><img src="/img/theme-{S}-{islug(t[0])}.webp" alt="" loading="lazy"></span><b>{E(t[0])}</b><span>{E(t[1])}</span></a>' for t in META['themes'])
    arts = sorted(glob.glob(os.path.join(ROOT, '*ss27*guide*.html')) + glob.glob(os.path.join(ROOT, '*ss27*.html')))
    guides, seen = '', set()
    for f in arts:
        n = os.path.basename(f)[:-5]
        if n in seen or not n.startswith(('australia', 'east-asia', 'eu-', 'gulf', 'north-america', 'southeast-asia', 'art-')) and 'guide' not in n:
            continue
        seen.add(n)
        t = re.search(r'<title>(.*?)</title>', open(f, errors='ignore').read(), re.S)
        t = re.sub(r'\s*\|.*$', '', html.unescape(t.group(1))).strip() if t else n
        im = [x for x in IMG if x.startswith('art-' + n) and not x.endswith(('-640', '-960'))] or [x for x in IMG if x == 'art-' + n]
        pic = f'<img src="/img/{im[0]}.webp" alt="" loading="lazy">' if im else ''
        guides += f'<a class="ct" href="/{n}.html"><span class="cti">{pic}</span><b>{E(t)}</b></a>'
    latest = sorted(REPORTS, key=lambda r: r.get('published', ''), reverse=True)[:6]
    lt = ''.join(f'<li><b>{E(r.get("published", ""))}</b><a href="{P}r/{r["_id"]}.html">{E(r["title"])}</a></li>' for r in latest)
    keyitems = [it for it in ITEMS if it['st'] == 'r' and it['img']][:8]
    body = (f'<main><section class="w hero"><div><p class="crumb">Forecasts / SS27</p><h1>Spring Summer 2027</h1><p class="lead">{E(META["intro"])}</p>'
            f'<div class="ctas"><a class="btn" href="{C}themes.html">Start with the themes</a><a class="btn o" href="{C}womenswear.html">Browse key items</a></div>'
            f'<p class="small">Preview built from the existing SS27 research, updated weekly once live.</p></div>'
            f'<div class="hg"><img src="/img/cover-{S}-themes.webp" alt=""><img src="/img/cover-{S}-womenswear.webp" alt=""><img src="/img/cover-{S}-menswear.webp" alt=""></div></section>'
            f'<div class="cn stk"><div class="w">' + ''.join(f'<a href="#s{n}">{n} {t}</a>' for n, t in [(1, 'Drivers'), (2, 'Signals'), (3, 'Trends'), (4, 'Colour and materials'), (5, 'Products and detailing'), (6, 'Commercial call'), (7, 'Validate')]) + '</div></div>' +
            sec(1, 'Drivers', 'What is changing in people\'s lives?', f'<p class="lead sm">Market guides for the season, by region.</p><div class="cg">{guides}</div>') +
            sec(2, 'Signals', 'Where is it showing up already?', f'<div class="cg">{ct("innovations")}{ct("styling")}</div>') +
            sec(3, 'Trends', 'Which signals add up to a real direction?', f'<div class="tcg">{ths}</div><p><a class="more" href="{C}themes.html">All themes and theme reports</a></p>') +
            sec(4, 'Colour and materials', 'What does it look and feel like?', f'<div class="swr">{sw}</div><div class="cg">{ct("colour")}{ct("fabrics")}{ct("trims")}</div>') +
            sec(5, 'Products and detailing', 'What exactly should be made?', f'<div class="cg">{ct("silhouettes")}{ct("womenswear")}{ct("menswear")}{ct("kidswear")}{ct("footwear")}{ct("knitwear")}{ct("accessories")}{ct("couture")}</div>') +
            sec(6, 'Commercial call', 'How much should a brand back it?', f'<div class="cg">{ct("business")}</div>') +
            sec(7, 'Validate and update', 'Were we right?', f'<ul class="log">{lt}</ul><p class="small">Next check: the January 2027 fairs. Every page here is updated after them.</p>') + '</main>')
    return page('Spring Summer 2027 forecast | Forecut', META['intro'], body)


def landing():
    seas = [('SS27', 'Spring Summer 2027', 'Live in the new design: every theme, colour, silhouette, key item, footwear, trim and report.', P, True),
            ('AW27', 'Autumn Winter 2027', 'Being rebuilt in the new design.', '', False), ('SS28', 'Spring Summer 2028', 'Being rebuilt in the new design.', '', False),
            ('AW28', 'Autumn Winter 2028', 'Being rebuilt in the new design.', '', False)]
    cards = ''.join((f'<a class="sc on" href="{u}"><b>{c}</b><span class="sn">{n}</span><span>{d}</span><span class="go">Open the forecast</span></a>' if live else
                     f'<div class="sc"><b>{c}</b><span class="sn">{n}</span><span>{d}</span></div>') for c, n, d, u, live in seas)
    stages = ''.join(f'<li><b>{n}</b><span>{t}</span></li>' for n, t in [(1, 'Drivers'), (2, 'Signals'), (3, 'Trends'), (4, 'Colour and materials'), (5, 'Products and detailing'), (6, 'Commercial call'), (7, 'Validate and update')])
    body = (f'<main><section class="w ph1"><p class="crumb">Forecasts</p><h1>Fashion forecasts</h1><p class="lead">Every season, from what is changing in people\'s lives to the exact details to make. Updated weekly.</p></section>'
            f'<section class="w sec"><div class="scg">{cards}</div></section><section class="w sec"><h2>How every forecast is organised</h2><ol class="stl">{stages}</ol></section></main>')
    return page('Fashion forecasts | Forecut', 'Seasonal fashion forecasts: themes, colour, silhouettes, key items, footwear, trims and more.', body, '', '/forecasts/')


def stub(new):
    return (f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Moved | Forecut</title>'
            f'<link rel="canonical" href="https://forecut.in{new}"><meta http-equiv="refresh" content="0;url={new}"><script>location.replace("{new}")</script></head>'
            f'<body><p>This page has moved to <a href="{new}">{new}</a>.</p></body></html>')


def build():
    for d in ('c', 'r'):
        shutil.rmtree(os.path.join(OUT, d), ignore_errors=True)
        os.makedirs(os.path.join(OUT, d))
    shutil.copy(os.path.join(B, 'season_hub.css'), os.path.join(OUT, 'c', 'style.css'))
    shutil.copy(os.path.join(B, 'season_hub.js'), os.path.join(OUT, 'c', 'app.js'))
    open(os.path.join(OUT, 'index.html'), 'w').write(hub())
    for k, _, _ in CATS:
        open(os.path.join(OUT, 'c', k + '.html'), 'w').write(category_page(k))
    urls = [P] + [f'{C}{k}.html' for k, _, _ in CATS]
    n_stub = 0
    for r in REPORTS:
        open(os.path.join(OUT, 'r', r['_id'] + '.html'), 'w').write(report_page(r))
        urls.append(f'{P}r/{r["_id"]}.html')
        old = os.path.join(OUT, r['audience'], r['category'], r['slug'])
        if os.path.isdir(old):   # keep the old report URL working: send it to the new page
            open(os.path.join(old, 'index.html'), 'w').write(stub(f'{P}r/{r["_id"]}.html'))
            n_stub += 1
    html_l = landing()
    for f in (os.path.join(ROOT, 'forecasts', 'index.html'), os.path.join(ROOT, 'forecasts.html')):
        open(f, 'w').write(html_l)
    # sitemap
    sm = os.path.join(ROOT, 'sitemap.xml')
    if os.path.exists(sm):
        x = open(sm).read()
        x = re.sub(r'<!--forecut-new-->.*?<!--/forecut-new-->\n?', '', x, flags=re.S)
        add = '<!--forecut-new-->' + ''.join(f'<url><loc>https://forecut.in{u}</loc></url>' for u in urls) + '<!--/forecut-new-->\n'
        x = x.replace('</urlset>', add + '</urlset>')
        open(sm, 'w').write(x)
    print('pages:', len(urls), 'items:', len(ITEMS), 'reports:', len(REPORTS), 'old report urls redirected:', n_stub)


if __name__ == '__main__':
    build()
