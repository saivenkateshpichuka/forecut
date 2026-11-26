"""Build the new-design SS27 season preview from existing content.

Reads build/details.json (items), build/seasons.json (themes, palette), content/reports/ss27-*.json and img/.
Writes forecasts/ss27/ (hub, c/ categories, r/ reports), the /forecasts/ landing, redirect stubs for old report URLs and sitemap entries. Run from build/: python3 season_hub.py
"""
import json, os, re, glob, shutil, html, collections
import markdown as MD
import pantone as PT

B = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(B)
S = 'ss27'
OUT = os.path.join(ROOT, 'forecasts', S)
SEASONS = ['ss27', 'aw27', 'ss28', 'aw28']
SK = ['aw26', 'ss27', 'aw27', 'ss28', 'aw28']
SKL = ['AW26', 'SS27', 'AW27', 'SS28', 'AW28']
E = html.escape
DET = json.load(open(os.path.join(B, 'details.json')))['model']
META_ALL = json.load(open(os.path.join(B, 'seasons.json')))['meta']
META = META_ALL[S]
SI = 1
CODE = 'SS27'
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
def load(s):
    global S, OUT, META, SI, CODE, ITEMS, REPORTS, PAL, P, C
    S = s
    OUT = os.path.join(ROOT, 'forecasts', S)
    META = META_ALL[S]
    SI = SK.index(S)
    CODE = META['code']
    P = f'/forecasts/{S}/'
    C = P + 'c/'
    ITEMS = []   # dict(name, area, note, life, dept, sub, img)
    for k, L in DET.items():
        dept, sub = k.split('|')
        for it in L:
            if it['life'][SI] != '-':
                ph, fl = media(it['name'])
                ITEMS.append(dict(name=it['name'], area=it['area'], note=it['note'], life=it['life'], dept=dept, sub=sub, img=ph, flats=fl, st=it['life'][SI]))
    REPORTS = []
    for f in sorted(glob.glob(os.path.join(ROOT, 'content', 'reports', S + '-*.json'))):
        r = json.load(open(f))
        if r.get('status') != 'published':
            continue
        im = [x for x in (r.get('images') or []) if x['file'] in IMG and not re.search(r'-f\d$', x['file'])]
        r['_img'] = im[0]['file'] if im else None
        r['_id'] = f"{r['audience']}-{r['category']}-{r['slug']}"
        if f"rpt-{S}-{r['_id']}" in IMG:
            r['images'] = [{'file': f"rpt-{S}-{r['_id']}", 'caption': r['title'], 'credit': 'Forecut'}] + [x for x in (r.get('images') or [])]
            r['_img'] = f"rpt-{S}-{r['_id']}"
        REPORTS.append(r)
    PAL = META['palette']
    assign_fallback()



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


KIDS = ('kids', 'boys', 'girls', 'toddler-boys', 'toddler-girls')


NOFB = ('innovations', 'styling', 'business-strategy', 'couture')


def pool_for(r):
    cat, aud = r['category'], r['audience']
    dept = 'Menswear' if aud == 'men' else 'Womenswear'
    ok = [it for it in ITEMS if it['img'] and it['st'] in 'rp']
    if cat == 'themes':
        return [f'theme-{S}-{islug(t[0])}' for t in META['themes'] if f'theme-{S}-{islug(t[0])}' in IMG] or [it['img'] for it in ok[:6]]
    if cat == 'colours':
        return [x for x in (f'cover-{S}-colour', f'cover-{S}-fabrics') if x in IMG] or [it['img'] for it in ok[:6]]
    if cat == 'silhouettes':
        return [it['img'] for it in ok if it['dept'] == dept and it['area'] in SIL] or [it['img'] for it in ok if it['dept'] == dept]
    if cat == 'fabrics':
        return [it['img'] for it in ok if it['area'] in FAB and it['dept'] == dept] or [f'cover-{S}-fabrics']
    if cat == 'trims':
        return [it['img'] for it in ok if it['area'] in TRIM and it['dept'] == dept] or [f'cover-{S}-trims']
    return [it['img'] for it in ok if it['dept'] == dept]


def assign_fallback():
    import zlib
    for r in REPORTS:
        r['_fb'] = None
        if r['_img'] or r['audience'] in KIDS or r['category'] in NOFB:
            continue
        pl = [x for x in pool_for(r) if x in IMG]
        if pl:
            r['_fb'] = pl[zlib.crc32(r['_id'].encode()) % len(pl)]


def related_items(r, n=6):
    cat, aud = r['category'], r['audience']
    if aud in KIDS or cat in NOFB:
        return []
    dept = 'Menswear' if aud == 'men' else 'Womenswear'
    f = {'silhouettes': lambda it: it['area'] in SIL, 'fabrics': lambda it: it['area'] in FAB, 'trims': lambda it: it['area'] in TRIM}.get(cat, lambda it: True)
    c_ = [it for it in ITEMS if it['dept'] == dept and it['img'] and f(it)]
    c_.sort(key=lambda x: 'erpf'.index(x['st']))
    import zlib
    k = zlib.crc32(r['_id'].encode()) % max(1, len(c_))
    return (c_[k:] + c_[:k])[:n]


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
AUTH_HEAD = ("<script>try{if(localStorage.getItem('fc-in')==='1')document.documentElement.classList.add('fc-in')}catch(e){}</script>"
             '<script type="module" src="/auth.js"></script>')
AUTH_SYNC = ("<script>(function w(n){if(window.FCAuth&&FCAuth.onChange){FCAuth.onChange(function(u){document.documentElement.classList.toggle('fc-in',!!u);try{u?localStorage.setItem('fc-in','1'):localStorage.removeItem('fc-in')}catch(e){}})}"
             "else if(n<60)setTimeout(function(){w(n+1)},150)})(0)</script>")


def page(title, desc, body, extra='', canon=None):
    canon = canon or P
    return (f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
            f'<!--forecut-new--><meta name="robots" content="index,follow"><title>{E(title)}</title><meta name="description" content="{E(desc[:200])}"><link rel="canonical" href="https://forecut.in{canon}"><meta property="og:title" content="{E(title)}"><meta property="og:description" content="{E(desc[:200])}"><meta property="og:type" content="website"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="preload" href="/v2/archivo.woff2" as="font" type="font/woff2" crossorigin><meta name="theme-color" content="#1f3d33">{AUTH_HEAD}'
            f'<link rel="stylesheet" href="{C}style.css"></head><body>{header()}{body}{footer()}{AUTH_SYNC}{extra}</body></html>')


MARK = '<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="2" y="2" width="28" height="28" rx="7" fill="#1f3d33"/><path d="M10 23V9h12M10 16h8" stroke="#f5f0e8" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M22 18l3 3-3 3" stroke="#e0784b" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>'
LOGO = MARK + '<span>FORECUT</span>'
LOGO_LIGHT = MARK.replace('fill="#1f3d33"', 'fill="#f5f0e8"').replace('stroke="#f5f0e8"', 'stroke="#1f3d33"') + '<span>FORECUT</span>'
MEGA_CATS = [('themes', 'Themes'), ('colour', 'Colour'), ('silhouettes', 'Silhouettes'), ('fabrics', 'Fabrics and materials'), ('womenswear', 'Womenswear'), ('menswear', 'Menswear'), ('footwear', 'Footwear'), ('trims', 'Trims and details')]


def header():
    cols = ''
    for x in SEASONS:
        m = META_ALL[x]
        cols += (f'<div><a class="mh" href="/forecasts/{x}/"><b>{m["code"]}</b><span>{E(m["stage"])}</span></a>' +
                 ''.join(f'<a href="/forecasts/{x}/c/{k}.html">{t}</a>' for k, t in MEGA_CATS) + '</div>')
    mega = (f'<div class="mega"><div class="w">{cols}<div class="mx"><a class="mh" href="/forecasts/"><b>All forecasts</b><span>Every season</span></a>'
            '<a href="/regions.html">Regional forecasts</a><a href="/india.html">India forecasts</a><a href="/colour.html">Colour library</a><a href="/insights.html">Insights</a></div></div></div>')
    links = [('What we do', '/#what'), ('Forecasts', '/forecasts/'), ('Services', '/#services'), ('About', '/about.html'), ('Resources', '/insights.html')]
    nav = ''.join((f'<div class="dd"><a class="on" href="{u}" aria-haspopup="true">{t}</a>{mega}</div>' if t == 'Forecasts' else f'<a href="{u}">{t}</a>') for t, u in links)
    return (f'<header class="nav"><div class="w"><a class="logo" href="/" aria-label="Forecut home">{LOGO}</a><nav class="links" aria-label="Main">{nav}</nav>'
            '<div class="r"><a class="out-only" href="/account.html#signin">Log in</a><a class="btn s out-only" href="/account.html#signup">Sign up free</a><a class="btn s in-only" href="/home.html">Your Home</a></div></div></header>')


def footer():
    cols = [('Forecasts', [('All forecasts', '/forecasts/'), (CODE, P), ('Themes', C + 'themes.html'), ('Colour', C + 'colour.html'), ('Footwear', C + 'footwear.html')]),
            ('Company', [('About Forecut', '/about.html'), ('Our method', '/method.html'), ('Contact', '/contact.html')]),
            ('Resources', [('Insights', '/insights.html'), ('Tools', '/tools.html'), ('Privacy', '/privacy.html'), ('Terms', '/terms.html')])]
    return ('<footer class="ft"><div class="w fg"><div><b class="logo">' + LOGO_LIGHT + '</b><p>Seasonal fashion forecasts and design tools.</p><p>hello@forecut.in</p></div>' +
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
    if r['_img'] or r.get('_fb'):
        top = f'<span class="rci"><img src="/img/{r["_img"] or r["_fb"]}.webp" alt="" loading="lazy"></span>'
    else:
        top = f'<span class="rci ph">{MARK}<em>{E(RCAT.get(r["category"], ""))}</em></span>'
    return (f'<a class="rcard" data-aud="{r["audience"]}" href="{P}r/{r["_id"]}.html">{top}<span class="rcb"><span class="chip">{E(AUDN.get(r["audience"], r["audience"]))}</span>'
            f'<b>{E(r["title"])}</b><span class="rs">{E(nc(r.get("summary", ""))[:170])}</span></span></a>')


def audfilter(auds):
    if len(auds) < 2:
        return ''
    return ('<div class="af" role="group" aria-label="Audience"><button type="button" class="on" data-aud="all">All</button>' +
            ''.join(f'<button type="button" data-aud="{a}">{E(AUDN[a])}</button>' for a in auds) + '</div>')


def category_page(key):
    _, title, lead = CAT[key]
    items = [it for it in ITEMS if item_filter(key, it)]
    reps = reports_for(key)
    body = f'{catnav(key)}<main><section class="w ph1"><p class="crumb"><a href="{P}">{CODE}</a> / {E(title)}</p><h1>{E(title)}</h1><p class="lead">{E(lead)}</p><p>{live()}</p></section>'
    if key == 'colour':
        sw = ''.join(f'<button type="button" class="sw" data-copy="{h}"><span style="background:{h}"></span><b>{E(n)}</b><small>{tcx(h)}, {h.upper()}</small></button>' for h, n in PAL)
        body += f'<section class="w sec"><h2>Season palette</h2><p class="sub">Select a swatch to copy its HEX code.</p><div class="swg">{sw}</div></section>'
    if key == 'themes':
        cards = ''
        for t in META['themes']:
            sl = islug(t[0]); im = f'theme-{S}-{sl}'
            pic = f'<img src="/img/{im}.webp" alt="{E(t[0])}" loading="lazy">' if im in IMG else ''
            kw = ''.join(f'<span class="chip">{E(k)}</span>' for k in t[6][:4])
            cards += f'<a class="th" href="{P}t/{sl}.html"><span class="thi" style="background:{t[4]}">{pic}</span><div><h3>{E(t[0])}</h3><p>{E(t[1])}</p><p class="small">Key item: {E(t[5])}</p><div>{kw}</div><span class="more">Open the theme</span></div></a>'
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
    body += '</main>' + dialog()
    return page(f'{title}, {CODE} | Forecut', lead, body, f'<script src="{C}app.js"></script>', f'{C}{key}.html')


DIALOG = ('<dialog id="dc" aria-label="Detail card"><div class="dcg"><div class="dci"><img id="dimg" alt=""><button type="button" class="sl p" id="dprev" aria-label="Previous image">&#8249;</button><button type="button" class="sl n" id="dnext" aria-label="Next image">&#8250;</button><span class="scap" id="dcap"></span></div><div class="dcb">'
          '<button type="button" class="x" id="dx" aria-label="Close">x</button><div class="dtop"><span id="dpill"></span><span class="chip" id="dsub"></span></div>'
          '<h3 id="dn"></h3><p class="darea" id="darea"></p><p id="dnote" class="dnote"></p>'
          '<div class="do"><b>Do this:</b> <span id="ddo"></span></div>'
          '<div class="dsec"><h4>Trend timing</h4><div id="dgraph"></div><div class="life" id="dlife"></div></div>'
          '<div id="dnotes" class="dsec" hidden><h4>Design notes</h4><ul id="dnl"></ul></div>'
          '<div id="dfab" class="dsec" hidden><h4>Fabric and trims</h4><p id="dft"></p></div>'
          '<div id="duse" class="dsec" hidden><h4>Where to use it</h4><p id="dut"></p></div>'
          '<div class="acts"><button type="button" class="btn">Add to spec pack</button><button type="button" class="btn o">Save to board</button><button type="button" class="btn o" data-pdf="dialog">Download PDF</button></div></div></div></dialog>')


import datetime as _dt
TODAY = _dt.date.today().strftime('%-d %B %Y')


def live(txt='Live forecast'):
    return f'<span class="live"><i></i>{txt}, updated {TODAY}</span>'


def ticker():
    rs = sorted(REPORTS, key=lambda r: r.get('published', ''), reverse=True)
    seen, out = set(), []
    for r in rs:
        k = r['title']
        if k in seen or r['audience'] not in ('women', 'men'):
            continue
        seen.add(k); out.append(f'<a href="{P}r/{r["_id"]}.html"><b>New</b> {E(nc(r["title"]))}</a>')
        if len(out) >= 10:
            break
    if not out:
        return ''
    row = ''.join(out)
    return f'<div class="tick" aria-label="Latest updates"><div class="tkt">{row}{row}</div></div>'


def nc(t):
    return re.sub(r'\s*\[\d+(?:\s*[,\u2013-]\s*\d+)*\]', '', t or '')


STAGES4 = [('Emerging', 'e'), ('Rising', 'r'), ('Peaking', 'p'), ('Fading', 'f')]


def report_page(r):
    imgs = [x for x in (r.get('images') or []) if x['file'] in IMG and not re.search(r'-f\d$', x['file'])]
    hero = ''
    if imgs:
        im = imgs[0]
        hero = f'<figure class="rf"><img src="/img/{im["file"]}.webp" alt="{E(im.get("caption", ""))}"><figcaption>{E(im.get("caption", ""))}</figcaption></figure>'
    elif r.get('_fb'):
        hero = f'<figure class="rf"><img src="/img/{r["_fb"]}.webp" alt=""><figcaption>From the {E(META["title"].replace("/", " "))} forecast</figcaption></figure>'
    cat = {'themes': 'themes', 'colours': 'colour', 'business-strategy': 'business'}.get(r['category'], r['category'])
    rel = related_items(r)
    status = (r.get('trend_status') or '').strip()
    sk = next((k for n, k in STAGES4 if n.lower() == status.lower()), None)
    life = ''
    if sk:
        idx = 'erpf'.index(sk)
        life = ('<div class="lc" aria-label="Trend status: ' + status + '">' + ''.join(
            f'<span class="{"on s-" + k if i == idx else ("done" if i < idx else "")}" style="--i:{i}"><i></i>{n}</span>' for i, (n, k) in enumerate(STAGES4)) + '</div>')
    facts = [('Season', META['title'].replace('/', ' ')), ('Audience', AUDN.get(r['audience'], '')), ('Published', r.get('published', ''))]
    fct = ''.join(f'<div><dt>{a_}</dt><dd>{E(b_)}</dd></div>' for a_, b_ in facts if b_)
    more = ''.join(f'<p><b>{a_}</b> {E(nc(b_))}</p>' for a_, b_ in (('Research period', r.get('research_period', '')), ('Markets', r.get('markets', ''))) if b_)
    timing = f'<aside class="rtime"><b>When it lands</b><p>{E(nc(r["timing"]))}</p></aside>' if r.get('timing') else ''
    main, toc = '', []
    for s_ in r.get('sections', []):
        sid = islug(s_['heading'])
        toc.append((sid, s_['heading']))
        main += f'<section class="rsec" id="{sid}"><h2>{E(s_["heading"])}</h2>{md(nc(s_["body"]))}</section>'
    if len(imgs) > 1:
        toc.append(('images', 'Images'))
        main += '<section class="rsec" id="images"><h2>Images</h2><div class="rfs">' + ''.join(f'<figure class="rf"><img src="/img/{x["file"]}.webp" alt="{E(x.get("caption", ""))}" loading="lazy"><figcaption>{E(x.get("caption", ""))}</figcaption></figure>' for x in imgs[1:]) + '</div></section>'
    tri = ''
    for h, k, ic in (('Products and customers', 'products', 'Make'), ('Design implications', 'design_implications', 'Design'), ('Commercial implications', 'commercial_implications', 'Buy')):
        if r.get(k):
            tri += f'<section class="rc"><span class="rk">{ic}</span><h2>{h}</h2>{md(nc(r[k]))}</section>'
    if tri:
        toc.append(('act', 'What to do'))
    src = ''.join(f'<li><a href="{E(x["url"])}" target="_blank" rel="noopener">{E(x["title"])}</a>, {E(x.get("publisher", ""))}{", " + E(x["date"]) if x.get("date") else ""}</li>' for x in (r.get('sources') or []))
    tocs = ''.join(f'<a href="#{i}">{E(t)}</a>' for i, t in toc)
    body = (f'{catnav(cat if cat in CAT else "")}<main><article class="w rp"><p class="crumb"><a href="{P}">{CODE}</a> / <a href="{C}{cat}.html">{E(RCAT.get(r["category"], ""))}</a> / {E(AUDN.get(r["audience"], ""))}</p>'
            f'<div class="rh2{" nohero" if not hero else ""}"><div class="rhl">{live("Live report")}<h1>{E(r["title"])}</h1><p class="lead">{E(nc(r.get("summary", "")))}</p>{life}'
            f'<dl class="fx">{fct}</dl><button class="btn o" type="button" data-pdf>Download PDF</button></div>{hero}</div>{timing}'
            f'<div class="rbody"><nav class="toc" aria-label="On this page"><b>On this page</b>{tocs}<details><summary>Research details</summary>{more}</details></nav><div class="rmain">{main}</div></div>'
            + (f'<div class="rtri" id="act">{tri}</div>' if tri else '')
            + (f'<section class="rsec wide"><h2>Pieces to look at</h2><p class="sub">Select any piece to open its detail card.</p><div class="tg">{"".join(tile(i, 0) for i in rel)}</div></section>' if rel else '')
            + (f'<details class="srcd"><summary>Evidence and sources</summary><ul class="srcs">{src}</ul></details>' if src else '') + '</article></main>' + (dialog() if rel else ''))
    return page(f'{r["title"]} | Forecut', nc(r.get('summary', '')), body, f'<script src="{C}app.js"></script>', f'{P}r/{r["_id"]}.html')


STOP = set('with that this from their they have been into more what when over then than made makes make keep keeps item items piece pieces season seasons back after years every each next moves move bring brings'.split())


def theme_words(t):
    ws = set()
    for x in list(t[6]) + [t[5]]:
        ws.add(x.lower())
    for x in (t[0] + ' ' + t[1]).lower().replace(',', ' ').replace('.', ' ').split():
        if len(x) > 4 and x not in STOP:
            ws.add(x)
    return ws


def theme_score(t, it):
    txt = (it['name'] + ' ' + it['note']).lower()
    strong = sum(3 for x in [k.lower() for k in t[6]] + [t[5].lower()] if x in txt)
    weak = sum(1 for x in theme_words(t) if ' ' not in x and x in txt)
    return strong + weak


def theme_items(t, n=24):
    sc = [(theme_score(t, it), it) for it in ITEMS]
    sc = [x for x in sc if x[0] >= 2]
    sc.sort(key=lambda x: -x[0])
    return [it for _, it in sc[:n]]


def theme_curve(t):
    """items matching the theme that are active in each of the five seasons, from the full detail model"""
    out = []
    for si in range(5):
        n = 0
        for k, L in DET.items():
            for it in L:
                if it['life'][si] != '-' and theme_score(t, dict(name=it['name'], note=it['note'])) >= 2:
                    n += 1
        out.append(n)
    return out


def curve_svg(vals):
    W, Hh, pl, pb, pt = 560, 190, 20, 30, 28
    mx = max(vals) or 1
    n = len(vals)
    cw = (W - pl * 2) / n
    pts, bars = [], ''
    for i, v in enumerate(vals):
        x = pl + i * cw + cw * 0.2
        w = cw * 0.6
        h = (Hh - pb - pt) * v / mx
        y = Hh - pb - h
        cur = ' cur' if i == SI else ''
        bars += (f'<rect class="bar{cur}" style="--i:{i}" x="{x:.0f}" y="{y:.0f}" width="{w:.0f}" height="{h:.0f}" rx="4"/>'
                 f'<text class="gv2" data-v="{v}" style="--i:{i}" x="{x + w / 2:.0f}" y="{y - 8:.0f}" text-anchor="middle">{v}</text>'
                 f'<text class="gl{cur}" x="{x + w / 2:.0f}" y="{Hh - 9}" text-anchor="middle">{SK[i].upper()}</text>')
        pts.append((x + w / 2, y))
    line = ' '.join(f'{px:.0f},{py:.0f}' for px, py in pts)
    dots = ''.join(f'<circle class="dot{" cur" if i == SI else ""}" style="--i:{i}" cx="{px:.0f}" cy="{py:.0f}" r="{6 if i == SI else 4.5}"/>' for i, (px, py) in enumerate(pts))
    return (f'<svg viewBox="0 0 {W} {Hh}" class="cv" role="img" aria-label="Pieces carrying this theme, by season: {", ".join(f"{SK[i].upper()} {v}" for i, v in enumerate(vals))}">'
            f'{bars}<polyline class="cl" pathLength="1" points="{line}" fill="none"/>{dots}</svg>')


def theme_page(t):
    sl = islug(t[0])
    its = theme_items(t)
    imgs = [it for it in its if it['img']]
    hero = f'theme-{S}-{sl}' if f'theme-{S}-{sl}' in IMG else (imgs[0]['img'] if imgs else None)
    kw = ''.join(f'<span class="chip">{E(k)}</span>' for k in t[6])
    board = ''.join(f'<span class="bd"><img src="/img/{it["img"]}.webp" alt="{E(it["name"])}" loading="lazy"><em>{E(it["name"])}</em></span>' for it in imgs[:8])
    pal = ''.join(f'<span class="swm"><i style="background:{h}"></i><b>{E(n)}</b><small>{tcx(h)}, {h.upper()}</small></span>' for h, n in PAL)
    tiles = ''.join(tile(it, 0) for it in sorted(its, key=lambda x: 'erpf'.index(x['st'])))
    curve = theme_curve(t)
    peak = SK[curve.index(max(curve))].upper() if max(curve) else CODE
    kws = [k.lower() for k in t[6]] + [t[5].lower(), t[0].lower()]
    rel = [r for r in REPORTS if (r['_img'] or r.get('_fb')) and any(k in (r['title'] + ' ' + r.get('summary', '')).lower() for k in kws)][:6]
    reps = ''.join(rcard(r) for r in rel)
    sib = ''.join(f'<a class="chip lk" href="{P}t/{islug(x[0])}.html">{E(x[0])}</a>' for x in META['themes'] if x[0] != t[0])
    body = (f'{catnav("themes")}<main><section class="w ph1 thh"><div><p class="crumb"><a href="{P}">{CODE}</a> / <a href="{C}themes.html">Themes</a> / {E(t[0])}</p><h1>{E(t[0])}</h1><p class="lead">{E(t[1])}</p>'
            f'<p class="small">Key item: <b>{E(t[5])}</b></p><div>{kw}</div><p class="hb">{live()}</p><p class="hb"><button class="btn o" type="button" data-pdf>Download PDF</button></p></div>'
            + (f'<span class="thp" style="background:{t[4]}"><img src="/img/{hero}.webp" alt="{E(t[0])}"></span>' if hero else '') + '</section>'
            f'<section class="w sec"><h2>The theme board</h2><p class="sub">The pieces and details that make up this theme, in the order they matter.</p><div class="bdg">{board}</div></section>'
            f'<section class="w sec"><h2>How strong is it?</h2><p class="sub">Pieces and details in the Forecut model that carry this theme, by season. It builds towards {peak}. {live('Live model')}</p>{curve_svg(curve)}</section>'
            f'<section class="w sec"><h2>Colour</h2><p class="sub">The season palette this theme draws from.</p><div class="swr">{pal}</div></section>'
            f'<section class="w sec"><h2>Pieces that carry it</h2><p class="sub">Select any item to open its detail card with drawings, spec notes and its timing graph.</p><div class="tg">{tiles}</div></section>'
            + (f'<section class="w sec"><h2>Related reports</h2><div class="rg">{reps}</div></section>' if reps else '') +
            f'<section class="w sec"><h2>Other themes this season</h2><div>{sib}</div></section></main>' + dialog())
    return page(f'{t[0]}, {META["title"].replace("/", " ")} theme | Forecut', t[1], body, f'<script src="{C}app.js"></script>', f'{P}t/{sl}.html')



def seasonnav():
    return ''.join(f'<a href="/forecasts/{x}/"{" class=cur" if x == S else ""}>{META_ALL[x]["code"]}</a>' for x in SEASONS)


def dialog():
    return DIALOG.replace('<dialog id="dc"', f'<dialog id="dc" data-cur="{SI}" data-code="{CODE}" data-desc="{C}desc.json"')


def tile_photo(k):
    if f'cover-{S}-{k}' in IMG:
        return f'cover-{S}-{k}'
    area = {'silhouettes': ('Silhouette', 'Shape'), 'styling': ('Styling',), 'accessories': ('Accessory',), 'couture': ('Embellishment',), 'innovations': ('Material', 'Perforation')}.get(k)
    if area:
        for a in area:
            for it in ITEMS:
                if it['area'] == a and it['img'] and it['st'] in 'rp':
                    return it['img']
    if k in ('themes', 'womenswear', 'menswear', 'footwear', 'knitwear', 'colour', 'fabrics', 'trims'):
        pick = {'themes': lambda it: True, 'womenswear': lambda it: it['dept'] == 'Womenswear', 'menswear': lambda it: it['dept'] == 'Menswear', 'footwear': lambda it: it['dept'] == 'Footwear',
                'knitwear': lambda it: it['sub'] == 'Knitwear', 'colour': lambda it: True, 'fabrics': lambda it: it['area'] in FAB, 'trims': lambda it: it['area'] in TRIM}[k]
        c_ = [it for it in ITEMS if it['img'] and pick(it) and it['st'] in 'rp']
        if c_:
            return c_[{'themes': 0, 'colour': 3}.get(k, 0) % len(c_)]['img']
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
        return f'<section class="w sec st" id="s{n}"><div class="sth"><h2>{t}</h2><span>{q}</span></div>{inner}</section>'
    ths = ''.join(f'<a class="tc" href="{P}t/{islug(t[0])}.html"><span class="tci" style="background:{t[4]}"><img src="/img/theme-{S}-{islug(t[0])}.webp" alt="" loading="lazy"></span><b>{E(t[0])}</b><span>{E(t[1])}</span></a>' for t in META['themes'])
    arts = sorted(glob.glob(os.path.join(ROOT, f'*{S}*guide*.html')) + (glob.glob(os.path.join(ROOT, f'*{S}*.html')) if S == 'ss27' else []))
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
    hero_imgs = ''.join(f'<img src="/img/{x}.webp" alt="">' for x in (tile_photo(k) for k in ('themes', 'womenswear', 'menswear')) if x)
    proj = META.get('basis') == 'projection'
    NEXTCHK = ('Next check: the January 2027 fairs. Every page here is updated after them.' if S == 'ss27' else
               'This is an outlook built from yarn and fabric fairs, trade coverage and the Forecut trend model. It is checked and updated as each fair and show happens.')
    drivers = (f'<p class="lead sm">Market guides for the season, by region.</p><div class="cg">{guides}</div>' if guides else
               f'<p class="lead sm">{E(META["intro"])}</p><p class="small">{E(META["stage"])}, {E(META["window"])}. <a class="more" href="{C}themes.html">See the themes</a></p>')
    body = (f'<main><section class="w hero"><div><p class="crumb">Forecasts / {CODE}</p><h1>{E(META["title"].replace("/", " "))}</h1><p class="lead">{E(META["intro"])}</p>'
            f'<div class="ctas"><a class="btn" href="{C}themes.html">Start with the themes</a><a class="btn o" href="{C}womenswear.html">Browse key items</a></div>'
            f'<p>{live()}</p><p class="small">{E(META["stage"])}, {E(META["window"])}.</p></div>'
            f'<div class="hg">{hero_imgs}</div></section>{ticker()}'
            f'<div class="cn stk"><div class="w">' + ''.join(f'<a href="#s{n}">{t}</a>' for n, t in [(1, 'Market context'), (2, 'Signals'), (3, 'Trends'), (4, 'Colour and materials'), (5, 'Products and detailing'), (6, 'Commercial call'), (7, 'Validate')]) + '</div></div>' +
            sec(1, 'Market context', 'What is shaping this season?', drivers) +
            sec(2, 'Signals', 'Where is it showing up already?', f'<div class="cg">{ct("innovations")}{ct("styling")}</div>') +
            sec(3, 'Trends', 'Which signals add up to a real direction?', f'<div class="tcg">{ths}</div><p><a class="more" href="{C}themes.html">All themes and theme reports</a></p>') +
            sec(4, 'Colour and materials', 'What does it look and feel like?', f'<div class="swr">{sw}</div><div class="cg">{ct("colour")}{ct("fabrics")}{ct("trims")}</div>') +
            sec(5, 'Products and detailing', 'What exactly should be made?', f'<div class="cg">{ct("silhouettes")}{ct("womenswear")}{ct("menswear")}{ct("kidswear")}{ct("footwear")}{ct("knitwear")}{ct("accessories")}{ct("couture")}</div>') +
            sec(6, 'Commercial call', 'How much should a brand back it?', f'<div class="cg">{ct("business")}</div>') +
            sec(7, 'Validate and update', 'Were we right?', f'<ul class="log">{lt}</ul><p class="small">{NEXTCHK}</p>') + '</main>')
    return page(f'{META["title"].replace("/", " ")} forecast | Forecut', META['intro'], body)


def home_page():
    """Signed-in start page at /home."""
    import datetime
    load('ss27')
    ok = [it for it in ITEMS if it['img'] and it['st'] in 'er']
    ok.sort(key=lambda x: x['name'])
    day = datetime.date.today().toordinal()
    feat = ok[day % len(ok)]
    rising = [ok[(day * 7 + i * 37) % len(ok)] for i in range(8)]
    seen, rs = set(), []
    for it in rising:
        if it['name'] not in seen and it['name'] != feat['name']:
            seen.add(it['name']); rs.append(it)
    ft = tile(feat, 0).replace('class="tile"', 'class="tile big"')
    desc = feat['note']
    seasons = ''
    for x in SEASONS:
        m = META_ALL[x]
        hero = next((f'theme-{x}-{islug(t[0])}' for t in m['themes'] if f'theme-{x}-{islug(t[0])}' in IMG), None)
        im = f'<img src="/img/{hero}.webp" alt="" loading="lazy">' if hero else ''
        seasons += f'<a class="hs{" now" if x == "ss27" else ""}" href="/forecasts/{x}/"><span class="hsi">{im}</span><b>{m["code"]}</b><span>{E(m["stage"])}</span><small>{E(m["window"])}</small></a>'
    latest = sorted(REPORTS, key=lambda r: r.get('published', ''), reverse=True)
    latest = [r for r in latest if r['_img'] or r.get('_fb')]
    wm = [r for r in latest if r['audience'] == 'women'][:3]
    mn = [r for r in latest if r['audience'] == 'men'][:3]
    latest = [x for p in zip(wm, mn) for x in p]
    rc = ''.join(rcard(r) for r in latest)
    sw = ''.join(f'<span class="swm"><i style="background:{h}"></i><b>{E(n)}</b><small>{tcx(h)}</small></span>' for h, n in PAL)
    tools = [('trend-to-style', 'Start a style brief'), ('rangeboard', 'Plan a collection'), ('tech-pack-builder', 'Build a tech pack'), ('swatchsmith', 'Make a colour palette')]
    tl = ''.join(f'<a class="ct" href="/{a}.html"><span class="cti"><img src="/tools/covers/{a}-640.webp" alt="" loading="lazy"></span><b>{E(b)}</b></a>' for a, b in tools)
    body = (f'<main><section class="w hh"><div><p class="crumb">Your start page</p><h1 id="greet">Welcome back.</h1><p class="lead">New this week in the {META["code"]} forecast, and where each season stands.</p></div>'
            f'<form class="hsr" action="/search.html" method="get" role="search"><input name="q" type="search" placeholder="Search a detail, colour or report" aria-label="Search"><button class="btn" type="submit">Search</button></form></section>'
            f'<section class="w sec"><div class="hf"><div class="hfi">{ft}</div><div><p class="crumb">Detail of the day</p><h2>{E(feat["name"])}</h2><p class="lead sm">{E(desc)}</p>'
            f'<p>{pill(feat["st"])} <span class="chip">{E(feat["dept"])}, {E(feat["sub"])}</span></p><p class="small">Open the card for drawings, spec notes and its trend graph.</p></div></div></section>'
            f'<section class="w sec"><h2>Where each season is</h2><div class="hsg">{seasons}</div></section>'
            f'<section class="w sec"><h2>Rising and emerging now</h2><p class="sub">Select any item to open its detail card.</p><div class="tg">{"".join(tile(i, 0) for i in rs)}</div><p><a class="more" href="{C}womenswear.html">Browse all details</a></p></section>'
            f'<section class="w sec"><h2>New this week</h2><div class="rg">{rc}</div></section>'
            f'<section class="w sec"><h2>{CODE} colour</h2><div class="swr">{sw}</div><p><a class="more" href="{C}colour.html">Full palette with Pantone TCX and HEX</a></p></section>'
            f'<section class="w sec"><h2>Your tools</h2><div class="cg">{tl}</div><p><a class="more" href="/tools.html">All tools</a></p></section></main>' + dialog())
    guard = ("<script>try{if(localStorage.getItem('fc-in')!=='1')location.replace('/')}catch(e){}</script><script type=\"module\" src=\"/auth.js\"></script>"
             "<script>(function w(n){if(window.FCAuth&&FCAuth.onChange){FCAuth.onChange(function(u){if(!u){try{localStorage.removeItem('fc-in')}catch(e){}location.replace('/');return}"
             "var g=document.getElementById('greet'),h=new Date().getHours(),t=h<12?'Good morning':h<17?'Good afternoon':'Good evening';g.textContent=t+(u.displayName?', '+u.displayName.split(' ')[0]:'')+'.'})}else if(n<80)setTimeout(function(){w(n+1)},100)})(0)</script>")
    h = page('Home | Forecut', 'Your Forecut start page.', body, f'<script src="{C}app.js"></script>' + guard, '/home')
    return h.replace('content="index,follow"', 'content="noindex,nofollow"')



def landing():
    load('ss27')
    cards = ''
    for x in SEASONS:
        m = META_ALL[x]
        hero = next((f'theme-{x}-{islug(t[0])}' for t in m['themes'] if f'theme-{x}-{islug(t[0])}' in IMG), None)
        im = f'<span class="sci"><img src="/img/{hero}.webp" alt="" loading="lazy"></span>' if hero else ''
        tl = ''.join(f'<li>{E(t[0])}</li>' for t in m['themes'][:4])
        lab = {'ss27': 'now', 'aw27': 'early', 'ss28': 'range', 'aw28': 'range'}[x]
        cards += (f'<a class="sc2 {lab}" href="/forecasts/{x}/">{im}<span class="scb"><b>{m["code"]}</b><span class="sn">{E(m["title"].replace("/", " "))}</span>'
                  f'<span class="stg">{E(m["stage"])}</span><small>{E(m["window"])}</small><ul>{tl}</ul><span class="go">Open the forecast</span></span></a>')
    st = [('Market context', 'What is shaping the season and the markets you sell into.'), ('Signals', 'What fairs, shows and retail are telling us.'),
          ('Trends', 'The season themes and how each one builds.'), ('Colour and materials', 'The palette with Pantone TCX and HEX, fabrics and trims.'),
          ('Products and detailing', 'Key items and the details to make, with photos, flat sketches and notes.'), ('Commercial call', 'What to buy, how deep and what to watch.'),
          ('Validate and update', 'What we checked and what changed this week.')]
    stages = ''.join(f'<li><b>{t}</b><span>{d}</span></li>' for t, d in st)
    hero_imgs = ''.join(f'<img src="/img/theme-{x}-{islug(META_ALL[x]["themes"][0][0])}.webp" alt="">' for x in SEASONS[:3] if f'theme-{x}-{islug(META_ALL[x]["themes"][0][0])}' in IMG)
    ok = [it for it in ITEMS if it['img'] and it['st'] in 'er']
    pick = [ok[i * 37 % len(ok)] for i in range(5)]
    body = (f'<main><section class="w hero"><div><p class="crumb">Forecasts</p><h1>See the next season first.</h1><p class="lead">Themes, colour, silhouettes and the exact details to make, season by season, from the next two years.</p>'
            f'<div class="ctas"><a class="btn" href="/forecasts/ss27/">Open SS27</a><a class="btn o" href="#how">How it works</a></div><p>{live()}</p></div><div class="hg">{hero_imgs}</div></section>{ticker()}'
            f'<section class="w sec"><h2>Choose a season</h2><div class="scg2">{cards}</div></section>'
            f'<section class="w sec" id="how"><h2>How every forecast is organised</h2><ol class="stl2">{stages}</ol></section>'
            f'<section class="w sec"><h2>The detail cards</h2><p class="sub">Every key item opens a card with photos, flat sketches, design notes, fabric and trims, and its timing graph.</p><div class="tg">{"".join(tile(i, 0) for i in pick)}</div></section></main>' + dialog())
    return page('Fashion forecasts | Forecut', 'Seasonal fashion forecasts: themes, colour, silhouettes, key items, footwear, trims and more.', body, f'<script src="{C}app.js"></script>', '/forecasts/')


def stub(new):
    return (f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Moved | Forecut</title>'
            f'<link rel="canonical" href="https://forecut.in{new}"><meta http-equiv="refresh" content="0;url={new}"><script>location.replace("{new}")</script></head>'
            f'<body><p>This page has moved to <a href="{new}">{new}</a>.</p></body></html>')


def build_season():
    for d in ('c', 'r', 't'):
        shutil.rmtree(os.path.join(OUT, d), ignore_errors=True)
        os.makedirs(os.path.join(OUT, d))
    shutil.copy(os.path.join(B, 'season_hub.css'), os.path.join(OUT, 'c', 'style.css'))
    shutil.copy(os.path.join(B, 'season_hub.js'), os.path.join(OUT, 'c', 'app.js'))
    DA = json.load(open(os.path.join(B, 'desc_all.json')))
    dd = {}
    for it in ITEMS:
        e = DA.get(S, {}).get(it['name']) or next((DA[x][it['name']] for x in SK if it['name'] in DA.get(x, {})), None)
        if e:
            dd[it['name']] = e
    json.dump(dd, open(os.path.join(OUT, 'c', 'desc.json'), 'w'), separators=(',', ':'), ensure_ascii=False)
    open(os.path.join(OUT, 'index.html'), 'w').write(hub())
    for k, _, _ in CATS:
        open(os.path.join(OUT, 'c', k + '.html'), 'w').write(category_page(k))
    for t in META['themes']:
        open(os.path.join(OUT, 't', islug(t[0]) + '.html'), 'w').write(theme_page(t))
    urls = [P] + [f'{C}{k}.html' for k, _, _ in CATS] + [f'{P}t/{islug(t[0])}.html' for t in META['themes']]
    n_stub = 0
    for r in REPORTS:
        open(os.path.join(OUT, 'r', r['_id'] + '.html'), 'w').write(report_page(r))
        urls.append(f'{P}r/{r["_id"]}.html')
        old = os.path.join(OUT, r['audience'], r['category'], r['slug'])
        if os.path.isdir(old):   # keep the old report URL working: send it to the new page
            open(os.path.join(old, 'index.html'), 'w').write(stub(f'{P}r/{r["_id"]}.html'))
            n_stub += 1
    print(S, 'pages:', len(urls), 'items:', len(ITEMS), 'reports:', len(REPORTS), 'redirected:', n_stub)
    return urls


def build():
    urls = []
    for x in SEASONS:
        load(x)
        urls += build_season()
    open(os.path.join(ROOT, 'home.html'), 'w').write(home_page())
    html_l = landing()
    for f in (os.path.join(ROOT, 'forecasts', 'index.html'), os.path.join(ROOT, 'forecasts.html')):
        open(f, 'w').write(html_l)
    sm = os.path.join(ROOT, 'sitemap.xml')
    if os.path.exists(sm):
        x_ = open(sm).read()
        x_ = re.sub(r'<!--forecut-new-->.*?<!--/forecut-new-->\n?', '', x_, flags=re.S)
        add = '<!--forecut-new-->' + '<url><loc>https://forecut.in/forecasts/</loc></url>' + ''.join(f'<url><loc>https://forecut.in{u}</loc></url>' for u in urls) + '<!--/forecut-new-->\n'
        open(sm, 'w').write(x_.replace('</urlset>', add + '</urlset>'))


if __name__ == '__main__':
    build()
