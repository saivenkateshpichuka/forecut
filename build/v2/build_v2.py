"""Forecut redesign (v2), built from the real site data. Writes ../../v2/*.html.

Run from build/:  python3 v2/build_v2.py
Pages: landing (index), home, forecasts library, one report page per season and topic, insights, tools, account.
The live site is untouched; this folder is reviewed as a private preview first (see preview.py).
"""
import json, os, sys, datetime as dt, shutil, re
from html import escape as E

B = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))          # build/
ROOT = os.path.dirname(B)                                                 # repo root
OUT = os.path.join(ROOT, 'v2')
sys.path.insert(0, B)
os.chdir(B)
import home_blocks as HB
import journal_data as JD
import pantone as PT
from tools_hub import TOOLS

TODAY = dt.date.today()
DET = json.load(open('details.json'))['model']
SEAS = json.load(open('seasons.json'))
SKEYS = SEAS['seasons']                     # ['aw26','ss27','aw27','ss28','aw28']
META = SEAS['meta']
THEMES = json.load(open('themes.json'))
NEW = json.load(open('new_this_month.json')) if os.path.exists('new_this_month.json') else []
IMG = set(os.path.splitext(f)[0] for f in os.listdir(os.path.join(ROOT, 'img')) if f.endswith('.webp'))
NEXT = 'ss27'                               # next season (the default report shelf)

STAGE = {'e': ('Emerging', 'st-e'), 'r': ('Rising', 'st-r'), 'p': ('Peaking', 'st-p'), 'f': ('Fading', 'st-f')}
ORDER = 'erpf'


def islug(s):
    return re.sub('-+', '-', ''.join(ch.lower() if ch.isalnum() else '-' for ch in s)).strip('-')


def photo(name, s):
    sl = islug(name)
    for c in (f'{sl}-{s}-photo', f'{sl}-photo', f'{sl}-{s}', sl):
        if c in IMG:
            return c
    return None


def img(key, alt='', cls='', style=''):
    return f'<img src="/img/{key}.webp" alt="{E(alt)}" loading="lazy"{" class=" + chr(34) + cls + chr(34) if cls else ""}{" style=" + chr(34) + style + chr(34) if style else ""}>'


def tcx(hexc):
    try:
        code, _, _ = PT.nearest(hexc)
        return code
    except Exception:
        return ''


# ---------------------------------------------------------------- topics
FAB = {'Fabric', 'Material', 'Finish', 'Wash', 'Print', 'Pattern', 'Texture'}
TRIM = {'Hem', 'Strap', 'Pleat', 'Lining', 'Trim', 'Hardware', 'Closure', 'Embellishment', 'Pocket', 'Placket', 'Collar', 'Cuff', 'Stitch', 'Seam', 'Lapel', 'Neckline', 'Detail', 'Edge', 'Perforation'}
TOPICS = [  # key, title, short description, filter(category, item)
    ('themes', 'Season themes', 'The big stories of the season, why they are happening and the pieces that carry them.', None),
    ('colour', 'Colour forecast', 'The season palette with Pantone TCX and HEX codes, and the colours behind each theme.', None),
    ('womenswear', 'Womenswear', 'Coats, dresses, tops, knitwear, trousers, denim and tailoring, item by item.', lambda k, it: k.startswith('Womenswear|')),
    ('menswear', 'Menswear', 'Outerwear, shirts, knitwear, tailoring and trousers, item by item.', lambda k, it: k.startswith('Menswear|')),
    ('footwear', 'Footwear', 'Heels, flats, boots, men\'s shoes and sneakers.', lambda k, it: k.startswith('Footwear|')),
    ('knitwear', 'Knitwear', 'Knit shapes, stitches and yarns for women and men.', lambda k, it: k.endswith('|Knitwear')),
    ('fabrics', 'Fabrics and finishes', 'Fabrics, materials, washes, prints and finishes across every category.', lambda k, it: it['area'] in FAB),
    ('trims', 'Trims and details', 'Collars, closures, pockets, hardware, trims and embellishment.', lambda k, it: it['area'] in TRIM),
]
TOPIC = {t[0]: t for t in TOPICS}


def items_for(topic, s):
    si = SKEYS.index(s)
    f = TOPIC[topic][3]
    out = []
    for k, L in DET.items():
        for it in L:
            st = it['life'][si]
            if st != '-' and f(k, it):
                out.append((k, it, st, it['life'][si + 1] if si + 1 < len(it['life']) else ''))
    return out


def season_label(s):
    m = META[s]
    return f"{m['code']}, {m['stage'].lower()}"


def report_slug(s, topic):
    return f'{s}-{topic}'


_COV = {}


def cover_img(s, topic):
    if (s, topic) not in _COV:
        used = {v for (s2, _), v in _COV.items() if s2 == s}
        _COV[(s, topic)] = _cover_img(s, topic, used)
    return _COV[(s, topic)]


def _cover_img(s, topic, used):
    m = META[s]
    if topic == 'themes':
        return f'hero-{s}' if f'hero-{s}' in IMG else None
    if topic == 'colour':
        for t in m['themes'][::-1]:
            k = f'theme-{s}-{islug(t[0])}'
            if k in IMG:
                return k
        return f'hero-{s}' if f'hero-{s}' in IMG else None
    pref = [n for n in NEW]
    its = items_for(topic, s)
    for _, it, st, _ in sorted(its, key=lambda x: (x[1]['name'] not in pref, ORDER.find(x[2]))):
        p = photo(it['name'], s)
        if p and p.endswith('photo') and p not in used:
            return p
    for _, it, _, _ in its:
        p = photo(it['name'], s)
        if p:
            return p
    return f'hero-{s}' if f'hero-{s}' in IMG else None


REPORTS = [(s, t[0]) for s in SKEYS for t in TOPICS]
for _s, _t in REPORTS:
    cover_img(_s, _t)


# ---------------------------------------------------------------- shell
LOCK = '<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><rect x="2" y="5" width="8" height="6" fill="none" stroke="currentColor"/><path d="M4 5V3.5a2 2 0 0 1 4 0V5" fill="none" stroke="currentColor"/></svg>'
SEARCH = '<svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M11 11l4 4" stroke="currentColor" stroke-width="1.5"/></svg>'
BURGER = '<svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><path d="M3 7h16M3 15h16" stroke="#000" stroke-width="1.6"/></svg>'


def head(title, desc):
    return (f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
            f'<title>{E(title)}</title><meta name="description" content="{E(desc)}"><meta name="robots" content="noindex">'
            '<link rel="icon" href="/favicon.svg"><link rel="stylesheet" href="/v2/forecut.css"></head><body>'
            '<a class="skip" href="#main">Skip to content</a>')


def nav_public(active=''):
    links = [('What we do', '/v2/#what'), ('Forecasts', '/v2/forecasts.html'), ('Services', '/v2/#services'), ('About', '/about.html'), ('Resources', '/v2/insights.html')]
    return _nav(links, active, '<a href="/account.html">Log in</a><a class="btn s" href="/account.html?signup=1">Sign up free</a>',
                [('What we do', '/v2/#what', 'Forecasts, colour, tools'), ('Forecasts', '/v2/forecasts.html', 'Seasons and topics'), ('Services', '/v2/#services', 'For designers, brands, schools'),
                 ('About', '/about.html', 'Our method'), ('Resources', '/v2/insights.html', 'Reports and articles'), ('Log in', '/account.html', ''), ('Sign up free', '/account.html?signup=1', '')])


def nav_app(active=''):
    links = [('Home', '/v2/home.html'), ('Forecasts', '/v2/forecasts.html'), ('Insights', '/v2/insights.html'), ('Tools', '/v2/tools.html')]
    return _nav(links, active, f'<a class="srch" href="/search.html">{SEARCH} Search forecasts</a><a class="av" href="/v2/account.html" aria-label="Your dashboard">You</a>',
                [('Home', '/v2/home.html', ''), ('Forecasts', '/v2/forecasts.html', 'Seasons, topics, regions'), ('Insights', '/v2/insights.html', 'Reports and articles'),
                 ('Tools', '/v2/tools.html', 'Free design tools'), ('Your dashboard', '/v2/account.html', 'Plan, saved work'), ('Search', '/search.html', '')])


def _nav(links, active, right, mob):
    return ('<header class="nav"><div class="w"><a class="logo" href="/v2/">FORECUT</a><nav class="links" aria-label="Main">' +
            ''.join(f'<a{" class=on" if t == active else ""} href="{u}">{t}</a>' for t, u in links) +
            f'</nav><div class="r">{right}<button class="mbtn" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mmenu">{BURGER}</button></div></div></header>'
            '<div class="mmenu" id="mmenu">' + ''.join(f'<a class="big" href="{u}">{t}<span>{d}</span></a>' for t, u, d in mob) +
            '<p class="small gr" style="margin-top:20px">hello@forecut.in</p></div>')


def footer():
    cols = [('Forecasts', [('Seasonal forecasts', '/v2/forecasts.html'), ('Colour', f'/v2/{NEXT}-colour.html'), ('Fabrics', f'/v2/{NEXT}-fabrics.html'), ('Trims and details', f'/v2/{NEXT}-trims.html'), ('Regions', '/regions.html'), ('India', '/india.html')]),
            ('Services', [('Forecast reports', '/v2/forecasts.html'), ('Design tools', '/v2/tools.html'), ('For fashion schools', '/v2/#services'), ('For brands', '/v2/#services')]),
            ('Company', [('About Forecut', '/about.html'), ('Our method', '/method.html'), ('Track record', '/track-record.html'), ('Contact', '/contact.html')]),
            ('Resources', [('Insights', '/v2/insights.html'), ('Couture', '/couture.html'), ('Privacy', '/privacy.html'), ('Terms', '/terms.html')])]
    return ('<footer class="ft"><div class="w"><div class="g">'
            '<div><div class="logo" style="margin-bottom:14px">FORECUT</div><p class="small" style="color:#bdbdbd;max-width:24em">Seasonal fashion forecasts and design tools for designers, brands and fashion schools.</p>'
            '<p class="small" style="margin-top:18px">hello@forecut.in</p></div>' +
            ''.join(f'<div><h4>{h}</h4>' + ''.join(f'<a href="{u}">{t}</a>' for t, u in xs) + '</div>' for h, xs in cols) +
            f'</div><div class="bot"><span>© {TODAY.year} Forecut</span><span><a href="https://www.instagram.com/forecut.in" style="display:inline;color:inherit">Instagram</a>  <a href="https://www.linkedin.com/company/forecut" style="display:inline;color:inherit">LinkedIn</a></span></div></div></footer>')


def end(extra=''):
    return f'<script src="/v2/forecut.js" defer></script>{extra}</body></html>'


def coming(n=5):
    return [(d, t, u if u.startswith(('/', 'http')) else '/' + u) for d, t, u in HB.CALENDAR if d >= TODAY][:n]


ARTS = JD.ARTICLES


def art_img(a):
    for k in (a.get('hero_new'), a.get('hero')):
        if k and k in IMG:
            return k
    return None


def art_kind(a):
    return 'Market news' if 'market' in a.get('tag', '').lower() else 'Article'


ARTS = sorted(JD.ARTICLES, key=lambda a: a.get('date', ''), reverse=True)


# ---------------------------------------------------------------- pages
def landing():
    hero_item = next(((k, it) for k, L in DET.items() for it in L if it['name'] == 'Colour-block knits'), None)
    h = head('Forecut: seasonal fashion forecasts', 'Seasonal trend forecasts with colour, fabric and detail direction, for designers, brands and fashion schools.') + nav_public() + '<main id="main">'
    pal = META['aw27']['palette'] if 'aw27' in META else META[NEXT]['palette']
    sg = next((p for p in pal if 'grey' in p[1].lower()), pal[0])
    h += hero_html() + f'''<section class="sec" id="what"><div class="w">
  <div class="hd"><h2 class="dsp">What we do</h2><p class="gr">Forecut reads runways, retail and fabric fairs, and turns them into reports you can design from.</p></div>
  <div class="g g3">
    <div><div style="aspect-ratio:4/3">{img('theme-' + NEXT + '-the-waist-returns')}</div><h3 class="dsp" style="margin:18px 0 8px">Seasonal forecasts</h3><p class="gr">Themes, womenswear, menswear and footwear for every season, from what is in stores now to two years ahead.</p></div>
    <div><div style="aspect-ratio:4/3">{img('theme-' + NEXT + '-elegant-ease')}</div><h3 class="dsp" style="margin:18px 0 8px">Colour and materials</h3><p class="gr">Palettes with Pantone TCX and HEX codes, fabrics, finishes and trims for each season.</p></div>
    <div><div style="aspect-ratio:4/3">{img('theme-aw27-quiet-structure')}</div><h3 class="dsp" style="margin:18px 0 8px">Design to production</h3><p class="gr">Free tools that take a trend to a brief, a pattern, a tech pack and a cost sheet.</p></div>
  </div></div></section>
<section class="sec st"><div class="w">
  <div class="hd"><h2 class="dsp">This season’s reports</h2><a class="lk" href="/v2/forecasts.html">All forecasts</a></div>
  <div class="g g4">{''.join(cover(NEXT, t, locked=True) for t in ['themes', 'colour', 'womenswear', 'trims'])}</div>
  <p class="small gr" style="margin-top:18px">Every report opens with a free preview. Sign up to read it in full and download the PDF.</p>
</div></section>
<section class="sec"><div class="w g g2 split" style="align-items:center;gap:56px">
  <div style="aspect-ratio:16/11">{img('hero-india', 'Festive wear in India')}</div>
  <div><h2 class="dsp" style="margin-bottom:18px">A global forecast, with India in depth.</h2>
  <p class="lead">Every season starts from the global runways. Forecut adds what most forecasters leave out: Indian festive and summer seasons, handloom, craft clusters and the colours that sell there.</p>
  <p style="margin-top:24px"><a class="lk" href="/india.html">See the India forecasts</a></p></div>
</div></section>
<section class="sec t ru" id="services"><div class="w g g4">
  <div><h3 class="dsp" style="font-size:21px;margin-bottom:8px">Designers</h3><p class="gr small">Know what to sketch next, with colours and details you can put straight into a tech pack.</p></div>
  <div><h3 class="dsp" style="font-size:21px;margin-bottom:8px">Brands and buyers</h3><p class="gr small">Plan ranges by what is rising, peaking or fading in each market.</p></div>
  <div><h3 class="dsp" style="font-size:21px;margin-bottom:8px">Fashion schools</h3><p class="gr small">Give a whole batch current forecasts and tools for projects and portfolios. Ask about an access code.</p></div>
  <div><h3 class="dsp" style="font-size:21px;margin-bottom:8px">Students</h3><p class="gr small">Learn to read a forecast and build a collection from it.</p></div>
</div></section>
<section class="sec st"><div class="w g split" style="grid-template-columns:1fr 2fr;gap:56px">
  <div><h2 class="dsp" style="font-size:34px">Coming up</h2><p class="gr small" style="margin-top:10px">Dates our next reports follow.</p></div>
  <div>{''.join(f'<a href="{u}" style="display:grid;grid-template-columns:110px 1fr;padding:14px 0;border-bottom:1px solid var(--ru)"><span class="gr">{d.strftime("%-d %b")}</span><span>{E(t)}</span></a>' for d, t, u in coming())}</div>
</div></section>
<section class="sec"><div class="w">
  <div class="hd"><h2 class="dsp">Resources</h2><a class="lk" href="/v2/insights.html">All insights</a></div>
  <div class="g g3">{''.join(f'<a href="/{a["slug"]}.html">' + (f'<div style="aspect-ratio:16/10">{img(art_img(a))}</div>' if art_img(a) else '') + f'<p class="small gr" style="margin:14px 0 4px">{art_kind(a)}{(", " + dt.date.fromisoformat(a["date"]).strftime("%-d %b")) if a.get("date") else ""}</p><h3 class="dsp" style="font-size:21px">{E(a["title"])}</h3></a>' for a in ARTS[:3])}</div>
</div></section>
<section style="background:{META[NEXT]['palette'][0][0]};color:#fff;padding:64px 0"><div class="w cta2" style="display:flex;justify-content:space-between;align-items:center;gap:24px">
  <h2 class="dsp" style="font-size:40px">Start with {META[NEXT]['code']}. It is free to join.</h2>
  <a class="btn" style="background:#fff;color:#000;border-color:#fff" href="/account.html?signup=1">Sign up free</a></div></section>
</main>'''
    return h + footer() + end()


def detail_pool():
    pool = []
    for k, L in DET.items():
        for it in L:
            for si, s in enumerate(SKEYS[:3]):
                st = it['life'][si]
                p = photo(it['name'], s)
                if st in 'rep' and p and p.endswith('photo'):
                    pal = META[s]['palette']
                    pool.append({'n': it['name'], 'k': k.replace('|', ', '), 'a': it['area'], 'note': it['note'], 's': META[s]['code'], 'sk': s,
                                 'st': STAGE[st][0].lower(), 'nx': (STAGE.get(it['life'][si + 1], ('', ''))[0].lower() if si + 1 < 5 else ''), 'img': p})
                    break
    pool.sort(key=lambda x: x['n'])
    return pool


def home():
    pool = detail_pool()
    h = head('Home | Forecut', 'Your Forecut start page.') + nav_app('Home') + '<main id="main">'
    h += f'''<section class="sec t"><div class="w"><h1 class="dsp" style="font-size:44px" id="greet">Welcome back.</h1>
<p class="gr" style="margin-top:8px">New this week: {E(', '.join(NEW[:2]))} and more in the {META[NEXT]['code']} reports.</p></div></section>
<section class="w g split" style="grid-template-columns:2fr 1fr;gap:24px;padding-bottom:48px">
  <div id="dotd" class="split" style="display:grid;grid-template-columns:1fr 1fr;background:var(--st)">
    <div style="aspect-ratio:4/5"><img id="dimg" src="/img/{pool[0]['img']}.webp" alt=""></div>
    <div style="padding:28px"><p class="small gr" id="ddate">Detail of the day</p>
      <h2 class="dsp" style="font-size:32px;margin:10px 0 14px" id="dname">{E(pool[0]['n'])}</h2>
      <p class="gr small" id="dnote">{E(pool[0]['note'])}</p>
      <div style="margin:18px 0;display:grid;gap:8px" class="small"><div><b style="font-weight:500">Category:</b> <span id="dcat">{E(pool[0]['k'])}</span></div>
      <div><b style="font-weight:500">Stage:</b> <span id="dst"></span></div><div><b style="font-weight:500">Detail type:</b> <span id="darea">{E(pool[0]['a'])}</span></div></div>
      <a class="btn s" id="dlink" href="/v2/{pool[0]['sk']}-womenswear.html">Open the report</a></div></div>
  <div style="display:flex;flex-direction:column;gap:24px">
    <div style="border:1px solid var(--ru);padding:22px" id="cont"><h3 style="font-weight:500;margin-bottom:12px">Continue reading</h3>
      <a href="/v2/{NEXT}-colour.html" id="contlink" style="display:grid;grid-template-columns:120px 1fr;gap:14px;align-items:center"><div class="mini">{cover_art(NEXT, 'colour')}</div><div><div class="small gr" id="contseason">{META[NEXT]['code']}</div><div id="conttitle">Colour forecast</div></div></a></div>
    <div style="border:1px solid var(--ru);padding:22px"><h3 style="font-weight:500;margin-bottom:6px">Coming up</h3>{''.join(f'<a href="{u}" style="display:grid;grid-template-columns:62px 1fr;padding:9px 0;border-bottom:1px solid var(--ru);font-size:14px"><span class="gr">{d.strftime("%-d %b")}</span><span>{E(t)}</span></a>' for d, t, u in coming(4))}</div>
  </div></section>
<section class="sec st"><div class="w"><div class="hd"><h2 class="dsp" style="font-size:34px">{META[NEXT]['code']} reports</h2><a class="lk" href="/v2/forecasts.html">All forecasts</a></div>
  <div class="g g4">{''.join(cover(NEXT, t) for t in ['trims', 'womenswear', 'footwear', 'fabrics'])}</div></div></section>
<section class="sec"><div class="w"><div class="hd"><h2 class="dsp" style="font-size:34px">Latest insights</h2><a class="lk" href="/v2/insights.html">All insights</a></div>
  <div class="g g3">{''.join(f'<a href="/{a["slug"]}.html" style="display:grid;grid-template-columns:110px 1fr;gap:16px">' + (f'<div style="aspect-ratio:1">{img(art_img(a))}</div>' if art_img(a) else '<div></div>') + f'<div><p class="small gr">{art_kind(a)}</p><p style="font-weight:500;margin-top:4px">{E(a["title"])}</p></div></a>' for a in ARTS[:3])}</div></div></section>
</main>'''
    data = json.dumps(pool, ensure_ascii=False).replace('</', '<\\/')
    return h + footer() + end(f'<script>window.FC_DOTD={data}</script>')


def lum(hx):
    h = hx.lstrip('#')
    r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


TI = {t[0]: i for i, t in enumerate(TOPICS)}


def topic_colour(s, topic):
    pal = META[s]['palette']
    return pal[TI[topic] % len(pal)]


def cover_art(s, topic, big=False, part=None):
    """Landscape typographic report cover. A generated thumbnail at img/cover-{s}-{topic}.webp replaces the colour field when it exists."""
    hx, nm = topic_colour(s, topic)
    fg = '#000' if lum(hx) > .55 else '#fff'
    thumb = f'cover-{s}-{topic}'
    t = TOPIC[topic][1]
    title = E(part or t)
    pal = ''.join(f'<i style="background:{c}"></i>' for c, _ in META[s]['palette'])
    return (f'<div class="art{" big" if big else ""}" style="background:{hx};color:{fg}">' +
            (img(thumb, f'{META[s]["code"]} {t}') if thumb in IMG else '') +
            f'<span class="a1">{META[s]["code"]}</span><span class="a2">Forecut</span>'
            f'<span class="at">{title}</span>' + (f'<span class="as">{E(t)}</span>' if part else '') + f'<span class="pal">{pal}</span></div>')


def cover(s, topic, locked=False, small=False):
    return (f'<a class="cv" href="/v2/{report_slug(s, topic)}.html" data-season="{s}" data-topic="{topic}">' + cover_art(s, topic) +
            f'<div class="meta"><span>{E(season_label(s))}</span>' + (f'<span class="lock">{LOCK} Full report</span>' if locked else '<span>Report and PDFs</span>') + '</div></a>')


# ------------------------------------------------------------ report data
def season_items(s):
    si = SKEYS.index(s)
    return [(k, it, it['life'][si], it['life'][si + 1] if si + 1 < 5 else '') for k, L in DET.items() for it in L if it['life'][si] != '-']


def topic_items(s, topic):
    if TOPIC[topic][3]:
        return items_for(topic, s)
    kws = [w for t in META[s]['themes'] for w in THEMES.get(f'{s}|{t[0]}', {}).get('kw', t[6])]
    return [x for x in season_items(s) if any(w.lower() in (x[1]['name'] + ' ' + x[1]['note']).lower() for w in kws)]


def theme_hits(s, it):
    txt = (it['name'] + ' ' + it['note']).lower()
    out = []
    for t in META[s]['themes']:
        kw = THEMES.get(f'{s}|{t[0]}', {}).get('kw') or [w.lower() for w in t[6]]
        if any(w.lower() in txt for w in kw):
            out.append(t[0])
    return out


def related_themes(s, its):
    sc = {}
    for _, it, _, _ in its:
        for t in theme_hits(s, it):
            sc[t] = sc.get(t, 0) + 1
    th = [t for t in META[s]['themes'] if sc.get(t[0])]
    th.sort(key=lambda t: -sc[t[0]])
    return th or META[s]['themes']


def names(xs, n):
    xs = [x[1]['name'] for x in xs][:n]
    if not xs:
        return ''
    return xs[0] if len(xs) == 1 else ', '.join(xs[:-1]) + ' and ' + xs[-1]


def by_stage(its, st, s):
    g = [x for x in its if x[2] == st]
    g.sort(key=lambda x: (photo(x[1]['name'], s) is None, x[1]['name'] not in NEW, x[1]['name']))
    return g


def lc_html(life, si):
    return '<span class="lc">' + ''.join(
        f'<i class="c-{c if c != "-" else "n"}{" now" if j == si else ""}" title="{META[SKEYS[j]]["code"]}: {STAGE[c][0] if c in STAGE else "not in the forecast"}"></i>' for j, c in enumerate(life)) + '</span>'


def cal_for(s):
    import regions_data as R
    code = META[s]['code'][:2]
    return next((c for c in R.CALENDAR if c[1] == code), None)


def regions_for(s, its):
    import regions_data as R
    out = []
    for r in R.REGIONS:
        fit = [x for x in its if any(b in x[1]['name'].lower() for b in r['boost'])]
        out.append((r, r['dir'].get(s, []), fit[:4]))
    return out


PARTS = [('full', 'Full forecast report', 'Every section of this report in one document, for reading and presenting.',
          ['Overview and key messages', 'Inspiration and themes', 'How it developed', 'The forecast, item by item', 'Colour, strategy, pricing and markets']),
         ('inspiration', 'Inspiration and design', 'Moodboards, themes and colour, ready to pin up in the studio.',
          ['Theme stories and why now', 'Moodboard of key pieces', 'Colour palette with TCX and HEX', 'Design notes for each key piece']),
         ('strategy', 'Range strategy', 'What to build, test, sell through and drop, with season timing.',
          ['Build, test, sell through, exit', 'Lifecycle of key pieces across seasons', 'Actions for the range', 'Season calendar']),
         ('pricing', 'Pricing and cost', 'Price bands for key garments and where cost sits.',
          ['Indicative retail bands: value, mid, premium', 'Cost level and cost-down options', 'Margin checklist']),
         ('markets', 'Markets and business', 'Where this direction sells and how each region reads it.',
          ['Regional directions', 'Best-fit pieces by region', 'Climate and key selling moments', 'India in depth'])]


def report(s, topic):
    m = META[s]
    si = SKEYS.index(s)
    key, title, desc, f = TOPIC[topic]
    its = topic_items(s, topic)
    R_ = by_stage(its, 'r', s); Em = by_stage(its, 'e', s); Pk = by_stage(its, 'p', s); Fd = by_stage(its, 'f', s)
    ths = related_themes(s, its)
    nxt = META[SKEYS[si + 1]]['code'] if si + 1 < 5 else None
    prv = META[SKEYS[si - 1]]['code'] if si > 0 else None
    h = head(f'{m["code"]} {title} | Forecut', f'{m["title"]} {title.lower()}: {desc}') + nav_app('Forecasts') + '<main id="main">'
    h += f'<div class="w crumb"><a href="/v2/forecasts.html">Forecasts</a> / <a href="/v2/forecasts.html#{s}">{m["code"]}</a> / {E(title)}</div>'
    # ---------------- header
    lead_line = (f'Build around {names(R_, 3)}.' if R_ else f'Lead with {names(Pk, 3)}.' if Pk else '')
    h += f'''<section class="w rhead"><div>{cover_art(s, topic, big=True)}</div>
<div class="rinfo"><p class="small gr">{E(m["title"])}, {E(m["stage"].lower())}, in stores {E(m["window"])}</p>
<h1 class="dsp">{E(title)}</h1><p class="lead">{E(desc)}</p>{f'<p class="key">{E(lead_line)}</p>' if lead_line else ''}
<div class="ctas"><a class="btn" href="#forecast">Read the forecast</a><a class="btn o" href="#downloads">Downloads</a></div>
<p class="small gr">Updated {TODAY.strftime("%-d %B %Y")}.</p></div></section>'''
    secs = [('overview', 'Overview'), ('inspiration', 'Inspiration'), ('development', 'How it developed'), ('forecast', 'The forecast'),
            ('colour', 'Colour'), ('strategy', 'Strategy'), ('pricing', 'Pricing and cost'), ('markets', 'Markets'), ('downloads', 'Downloads')]
    h += '<nav class="rnav" aria-label="In this report"><div class="w">' + ''.join(f'<a href="#{a}">{t}</a>' for a, t in secs) + '</div></nav>'
    body = ''
    # ---------------- overview
    newish = [x for x in its if si > 0 and x[1]['life'][si - 1] == '-']
    share_new = len(newish) / max(1, len(its))
    mood = ('Mostly new ideas this season: expect to test before you commit.' if share_new > .5 else
            'A season of development: most pieces carry on from last season and grow.' if share_new < .25 else
            'A mix of fresh ideas and pieces carried on from last season.') if si > 0 else 'What is in stores now, and what keeps selling into next season.'
    ov = [('The headline', mood), ]
    if R_: ov.append(('Build into the range', f'{names(R_, 4)} are rising{f" and keep growing into {nxt}" if nxt else ""}.'))
    if Em: ov.append(('Test in small quantities', f'{names(Em, 4)} are new ideas to try.'))
    if Pk: ov.append(('Sell through', f'{names(Pk, 3)} are at their height. Do not add depth.'))
    if Fd: ov.append(('Reduce or rework', f'{names(Fd, 3)} are moving out.'))
    body += (f'<section class="rs" id="overview"><div class="rsh"><h2 class="dsp">Overview</h2><p class="gr">{E(m["intro"])}</p></div><div class="ovg">' +
             ''.join(f'<div><h3>{E(a)}</h3><p>{E(b)}</p></div>' for a, b in ov) + '</div></section>')
    # ---------------- inspiration
    body += '<section class="rs" id="inspiration"><div class="rsh"><h2 class="dsp">Inspiration</h2><p class="gr">The stories behind this direction and where they were seen.</p></div>'
    for t, d, pat, bg, fg, fl, kw in ths[:3]:
        th = THEMES.get(f'{s}|{t}', {})
        tk = f'theme-{s}-{islug(t)}'
        body += (f'<article class="insp"><div class="ip" style="background:{bg}">' + (img(tk, t) if tk in IMG else '') + '</div><div>'
                 f'<h3 class="dsp">{E(t)}</h3><p>{E(th.get("story", d))}</p>' +
                 (f'<h4>Why now</h4><p class="gr">{E(th["why"])}</p>' if th.get('why') else '') +
                 (f'<h4>Seen at</h4><p class="gr">{E("; ".join(b[0] + ": " + b[1] for b in th["brands"][:4]))}</p>' if th.get('brands') else '') +
                 f'<h4>Key pieces</h4><p class="gr">{E(", ".join(kw))}</p>'
                 f'<div class="tsw"><span style="background:{bg}"></span><span style="background:{fg}"></span><em class="small gr">{E(tcx(bg))} and {E(tcx(fg))}</em></div>' +
                 (f'<p class="small mu" style="margin-top:10px">Source: {E(th["src"])}</p>' if th.get('src') else '') + '</div></article>')
    moodx = [x for x in R_ + Pk + Em if photo(x[1]['name'], s)][:5]
    if moodx:
        body += '<h3 class="sub">Moodboard</h3><div class="mood">' + ''.join(
            f'<figure>{img(photo(x[1]["name"], s), x[1]["name"])}<figcaption>{E(x[1]["name"])}</figcaption></figure>' for x in moodx) + '</div>'
    body += '</section>'
    # ---------------- development
    body += f'<section class="rs" id="development"><div class="rsh"><h2 class="dsp">How it developed</h2><p class="gr">Where these pieces came from and where they go next.</p></div>'
    if topic == 'colour':
        body += '<div class="cdev">' + ''.join(
            f'<div class="crow{" now" if j == si else ""}"><span>{META[k2]["code"]}<em>{E(META[k2]["stage"].lower())}</em></span><div>' +
            ''.join(f'<i style="background:{c}" title="{E(n)}, {tcx(c)}"></i>' for c, n in META[k2]['palette']) + '</div></div>' for j, k2 in enumerate(SKEYS)) + '</div>'
        body += f'<p class="gr" style="margin-top:16px">Read down the seasons to see each palette grow from the one before. {E(m["code"])} is highlighted.</p>'
    elif topic == 'themes':
        body += '<div class="tdev">' + ''.join(
            f'<div class="crow{" now" if j == si else ""}"><span>{META[k2]["code"]}<em>{E(META[k2]["stage"].lower())}</em></span><div class="tl">' +
            ''.join(f'<b style="border-color:{t[3]}">{E(t[0])}</b>' for t in META[k2]['themes']) + '</div></div>' for j, k2 in enumerate(SKEYS)) + '</div>'
    if TOPIC[topic][3] or topic == 'themes':
        key = (R_ + Pk + Em + Fd)
        key = [x for x in key if photo(x[1]['name'], s)][:10] + [x for x in key if not photo(x[1]['name'], s)][:2]
        body += ('<div class="lcwrap"><table class="lct"><thead><tr><th scope="col">Piece</th>' +
                 ''.join(f'<th scope="col"{" class=now" if j == si else ""}>{META[k2]["code"]}</th>' for j, k2 in enumerate(SKEYS)) + '</tr></thead><tbody>')
        for k, it, st, nx in key:
            p = photo(it['name'], s)
            body += (f'<tr><th scope="row"><span class="th">{img(p, "") if p else ""}</span>{E(it["name"])}</th>' +
                     ''.join(f'<td class="c-{c if c != "-" else "n"}{" now" if j == si else ""}"><span>{STAGE[c][0] if c in STAGE else ""}</span></td>' for j, c in enumerate(it['life'])) + '</tr>')
        body += '</tbody></table></div><p class="small gr lckey"><i class="c-e"></i>Emerging <i class="c-r"></i>Rising <i class="c-p"></i>Peaking <i class="c-f"></i>Fading</p>'
        carried = [x for x in its if si > 0 and x[1]['life'][si - 1] in STAGE][:5]
        if carried or R_:
            body += '<div class="g g2 split" style="margin-top:28px;gap:40px">'
            if carried:
                body += f'<div><h3 class="sub">Carried on from {prv}</h3>' + ''.join(
                    f'<p class="dl"><b>{E(x[1]["name"])}</b><span>{STAGE[x[1]["life"][si - 1]][0]} in {prv}, {STAGE[x[2]][0].lower()} now</span></p>' for x in carried) + '</div>'
            if nxt:
                nxs = [x for x in R_ + Em if x[3] in STAGE][:5]
                body += f'<div><h3 class="sub">What happens in {nxt}</h3>' + ''.join(
                    f'<p class="dl"><b>{E(x[1]["name"])}</b><span>{STAGE[x[2]][0]} now, {STAGE[x[3]][0].lower()} in {nxt}</span></p>' for x in nxs) + '</div>'
            body += '</div>'
    body += '</section>'
    # ---------------- forecast
    body += f'<section class="rs" id="forecast"><div class="rsh"><h2 class="dsp">The forecast</h2><p class="gr">Select any piece to see its full detail.</p></div>'
    data = []
    if topic == 'themes':
        for t, d, pat, bg, fg, fl, kw in m['themes']:
            th = THEMES.get(f'{s}|{t}', {})
            tk = f'theme-{s}-{islug(t)}'
            body += (f'<article id="{islug(t)}" class="insp"><div class="ip" style="background:{bg}">' + (img(tk, t) if tk in IMG else '') + '</div>'
                     f'<div><h3 class="dsp">{E(t)}</h3><p>{E(th.get("story", d))}</p><h4>Key pieces</h4><p class="gr">{E(", ".join(kw))}; {E(fl.lower())}.</p>' +
                     ('<h4>Actions</h4><ul class="ul">' + ''.join(f'<li>{E(a)}</li>' for a in th.get('actions', [])) + '</ul>' if th.get('actions') else '') + '</div></article>')
    elif topic == 'colour':
        body += '<div class="g g4 pal4">'
        for hx, nm in m['palette']:
            body += f'<div><div class="sw4" style="background:{hx}"></div><p style="font-weight:500;margin-top:10px">{E(nm)}</p><p class="small gr">{tcx(hx)}, {hx.upper()}</p></div>'
        body += '</div><h3 class="sub">Colour by theme</h3><div class="g g3" style="gap:24px">'
        for t, d, pat, bg, fg, fl, kw in m['themes']:
            body += (f'<div><div class="tpair"><div style="background:{bg}"></div><div style="background:{fg}"></div></div>'
                     f'<p style="font-weight:500;margin-top:10px">{E(t)}</p><p class="small gr">Lead colour {tcx(bg)}, {bg.upper()}. Accent {tcx(fg)}, {fg.upper()}.</p><p class="small" style="margin-top:6px">Use for: {E(fl.lower())}.</p></div>')
        body += '</div>'
    else:
        stxt = {'e': 'New ideas to test in small quantities.', 'r': 'Growing fast: build these into the range.', 'p': 'At their height: sell through, do not add depth.', 'f': 'Moving out: reduce or rework.'}
        for st, grp in (('e', Em), ('r', R_), ('p', Pk), ('f', Fd)):
            if not grp:
                continue
            body += f'<div class="stg" id="stage-{STAGE[st][0].lower()}"><h3 class="dsp">{STAGE[st][0]} in {m["code"]}</h3><p class="gr">{stxt[st]}</p></div><div class="g g4 items">'
            for k, it, stg, nx in grp:
                p = photo(it['name'], s)
                i = len(data)
                data.append({'n': it['name'], 'k': k.replace('|', ', '), 'a': it['area'], 'note': it['note'], 'l': it['life'], 'st': stg, 'th': theme_hits(s, it)})
                nxl = ('Next season: ' + STAGE[nx][0].lower()) if nx in STAGE else ('Leaves the forecast next season' if nxt else '')
                body += (f'<button type="button" class="item" data-i="{i}"><span class="ph{"" if p else " none"}"' + ('' if p else f' style="background:{topic_colour(s, topic)[0]};color:{"#000" if lum(topic_colour(s, topic)[0]) > .55 else "#fff"}"') + '>' + (img(p, it['name']) if p else f'<em>{E(it["area"])}</em>') + '</span>'
                         f'<span class="h4">{E(it["name"])}</span><span class="p">{E(k.replace("|", ", "))}, {E(it["area"].lower())}</span>'
                         f'<span class="lab"><span class="stage {STAGE[stg][1]}">{STAGE[stg][0]}</span> <span class="gr">{nxl}</span></span></button>')
            body += '</div>'
    body += '</section>'
    # ---------------- colour
    body += f'<section class="rs" id="colour"><div class="rsh"><h2 class="dsp">Colour</h2><p class="gr">The {m["code"]} palette for this report, with Pantone TCX and HEX codes.</p></div><div class="cstrip">' + ''.join(
        f'<div><span style="background:{hx}"></span><b>{E(nm)}</b><em>{tcx(hx)}<br>{hx.upper()}</em></div>' for hx, nm in m['palette']) + '</div>'
    body += '<div class="g g3" style="gap:20px;margin-top:28px">' + ''.join(
        f'<p class="small"><b style="font-weight:500">{E(t[0])}:</b> <span class="gr">{E(tcx(t[3]))} with {E(tcx(t[4]))}, for {E(t[5].lower())}.</span></p>' for t in ths[:3]) + '</div></section>'
    # ---------------- strategy
    cols = [('Build depth', 'Rising', R_), ('Test small', 'Emerging', Em), ('Sell through', 'Peaking', Pk), ('Exit or rework', 'Fading', Fd)]
    body += '<section class="rs" id="strategy"><div class="rsh"><h2 class="dsp">Strategy</h2><p class="gr">How to plan the range from this forecast.</p></div><div class="g g4 strat">' + ''.join(
        f'<div><h3>{a}</h3><p class="small gr">{b} pieces</p><ul>' + (''.join(f'<li>{E(x[1]["name"])}</li>' for x in g[:6]) or '<li class="gr">Nothing at this stage</li>') + '</ul></div>' for a, b, g in cols) + '</div>'
    acts = [a for t in ths[:3] for a in THEMES.get(f'{s}|{t[0]}', {}).get('actions', [])]
    if acts:
        body += '<h3 class="sub">Actions for the range</h3><ul class="ul acts">' + ''.join(f'<li>{E(a)}</li>' for a in acts[:6]) + '</ul>'
    c = cal_for(s)
    if c:
        body += (f'<h3 class="sub">Season timing</h3><div class="g g4 tim"><div><b>Shown on the runway</b><span>{E(c[2])}</span></div><div><b>In stores, northern hemisphere</b><span>{E(m["window"])}</span></div>'
                 f'<div><b>Southern hemisphere</b><span>{E(c[4])}</span></div><div><b>Tropical and seasonless markets</b><span>{E(c[5])}</span></div></div>')
    body += '</section>'
    # ---------------- pricing
    body += '<section class="rs" id="pricing"><div class="rsh"><h2 class="dsp">Pricing and cost</h2><p class="gr">Indicative retail bands in ₹ for key garments, and where cost sits. A guide for planning, not a quote.</p></div><div class="g g2 split" style="gap:32px">'
    for t in ths[:4]:
        th = THEMES.get(f'{s}|{t[0]}', {})
        if not th.get('prices'):
            continue
        body += (f'<div class="ptab"><h3>{E(t[0])}</h3><table><thead><tr><th scope="col">Key garment</th><th scope="col">Value</th><th scope="col">Mid</th><th scope="col">Premium</th></tr></thead><tbody>' +
                 ''.join(f'<tr><th scope="row">{E(r[0])}</th><td>₹{E(r[1])}</td><td>₹{E(r[2])}</td><td>₹{E(r[3])}</td></tr>' for r in th['prices']) + '</tbody></table>' +
                 (f'<p class="small" style="margin-top:12px"><b style="font-weight:500">Cost level: {E(th["cost"][0].lower())}.</b> <span class="gr">{E(th["cost"][1])}</span></p>' if th.get('cost') else '') + '</div>')
    body += '</div><p class="small gr" style="margin-top:18px">Work out your own margin with the <a class="lk" href="/pricefold.html">price and margin calculator</a>.</p></section>'
    # ---------------- markets
    body += f'<section class="rs" id="markets"><div class="rsh"><h2 class="dsp">Markets</h2><p class="gr">How each region reads {m["code"]}, and the pieces from this report that fit it best.</p></div><div class="g g3 mk">'
    for r, dirs, fit in regions_for(s, its):
        body += (f'<div><h3><a href="/region-{r["slug"]}.html">{E(r["name"])}</a></h3>' +
                 ('<ul>' + ''.join(f'<li>{E(d)}</li>' for d in dirs[:3]) + '</ul>' if dirs else f'<p class="small gr">{E(r["climate"])}</p>') +
                 (f'<p class="small" style="margin-top:10px"><b style="font-weight:500">Best fit:</b> <span class="gr">{E(", ".join(x[1]["name"] for x in fit))}</span></p>' if fit else '') + '</div>')
    body += f'''</div><a class="india" href="/india.html"><div><h3 class="dsp">India in depth</h3><p class="gr">Festive and summer seasons, handloom, craft clusters and the colours that sell in India, read against {m["code"]}.</p></div><span class="lk">See the India forecasts</span></a></section>'''
    # ---------------- downloads
    body += '<section class="rs" id="downloads"><div class="rsh"><h2 class="dsp">Downloads</h2><p class="gr">Each PDF stands on its own, so share only the part a team needs.</p></div><div class="dls">'
    for pk, pt, pd, pc in PARTS:
        body += (f'<div class="dl1"><div class="dth">{cover_art(s, topic, part=pt)}</div><div><h3>{pt}</h3><p class="gr small">{pd}</p><ul>' + ''.join(f'<li>{E(x)}</li>' for x in pc) +
                 f'</ul><a class="btn s" href="/v2/pdf/{report_slug(s, topic)}-{pk}.pdf" data-pdf>Download PDF</a></div></div>')
    body += '</div></section>'
    h += f'''<div class="w gate hide" id="gate"><h2 class="dsp" style="font-size:32px">Read the full report free</h2><p class="gr" style="margin:12px 0 22px">Sign up to read every section and download the PDFs. It takes under a minute.</p><a class="btn" href="/account.html?signup=1">Sign up free</a> <a class="btn o" href="/account.html" style="margin-left:8px">Log in</a></div>
<div class="w" id="report">{body}<p class="small gr src">Sources: {E(m.get("sources", ""))}</p></div>
<section class="sec st"><div class="w"><h2 class="dsp" style="font-size:30px;margin-bottom:22px">More {m["code"]} reports</h2><div class="g g4">{''.join([cover(s, t) for t, *_ in TOPICS if t != topic][:4])}</div></div></section></main>'''
    h += '''<div class="dm" id="dm" role="dialog" aria-modal="true" aria-labelledby="dmn" hidden><div class="dmb" data-close></div><div class="dmc" tabindex="-1">
<button class="dmx" type="button" data-close aria-label="Close">Close</button><div class="dmi"><img alt="" id="dmimg"></div>
<div class="dmt"><p class="small gr" id="dmk"></p><h2 class="dsp" id="dmn"></h2><p id="dmnote"></p>
<div class="dmrow"><span class="stage" id="dmst"></span><span class="small gr" id="dmnx"></span></div>
<h3>Across the seasons</h3><div class="dmlc" id="dmlc"></div><div id="dmth"></div>
<div class="dmact"><button class="btn s" type="button" id="dmsave">Save detail</button><a class="btn s o" href="/trend-to-style.html">Use in Trend to Style</a></div>
<div class="dmnav"><button type="button" id="dmprev">Previous</button><button type="button" id="dmnext">Next</button></div></div></div></div>'''
    seas = [META[k2]['code'] for k2 in SKEYS]
    dj = json.dumps({'items': data, 'seasons': seas, 'si': si}, ensure_ascii=False).replace('</', '<\\/')
    return h + footer() + end(f'<script>window.FC_ITEMS={dj}</script>')


REGIONS_LINKS = [('Europe', '/region-europe.html'), ('North America', '/region-north-america.html'), ('Asia', '/region-asia.html'), ('South America', '/region-south-america.html'),
                 ('Africa', '/region-africa.html'), ('Oceania', '/region-oceania.html'), ('India', '/india.html'), ('Resort 27', '/resort-27.html'), ('Pre-Fall 27', '/pre-fall-27.html')]


def forecasts():
    h = head('Forecasts | Forecut', 'Forecut forecast reports: one report per topic, per season.') + nav_app('Forecasts') + '<main id="main">'
    h += '''<section class="sec t"><div class="w"><h1 class="dsp" style="font-size:52px">Forecasts</h1>
<p class="lead" style="margin-top:10px">One report per topic, per season, each with its own set of PDFs.</p></div></section>'''
    h += ('<div class="fbar"><div class="w"><div class="stabs" role="group" aria-label="Season"><button type="button" class="on" data-v="all"><b>All</b><span>every season</span></button>' +
          ''.join(f'<button type="button" data-v="{s}"><b>{META[s]["code"]}</b><span>{E(META[s]["stage"].lower())}</span></button>' for s in SKEYS) +
          '</div><div class="fsel"><label><span>Topic</span><select id="ftopic"><option value="all">All topics</option>' +
          ''.join(f'<option value="{k}">{E(t)}</option>' for k, t, _, _ in TOPICS) +
          '</select></label><label><span>Region</span><select id="fregion"><option value="">Global</option>' +
          ''.join(f'<option value="{u}">{t}</option>' for t, u in REGIONS_LINKS) + '</select></label></div></div></div>')
    order = [NEXT] + [s for s in SKEYS if s != NEXT]
    h += '<div class="w" id="shelf" style="padding-bottom:72px">'
    for s in order:
        m = META[s]
        h += (f'<section class="sgrp" data-season="{s}" id="{s}"><div class="sgh"><h2 class="dsp">{m["code"]}</h2><p><b>{E(m["title"])}</b><span class="gr">{E(m["stage"])}, in stores {E(m["window"])}</span></p></div>'
              '<div class="g g4">' + ''.join(cover(s, t) for t, *_ in TOPICS) + '</div></section>')
    h += '<p class="gr hide" id="fnone" style="padding:30px 0">No report matches. Choose another season or topic.</p></div></main>'
    return h + footer() + end()


def hero_slides():
    pick, seen = [], set()
    want = ['Colour-block knits']
    pool = detail_pool()
    for x in pool:
        if x['n'] in want:
            pick.append(x); seen.add(x['k'].split(',')[0] + x['k'])
    for x in pool:
        if len(pick) >= 4:
            break
        if x['st'] == 'rising' and x['sk'] in ('ss27', 'aw27') and x['k'] not in [p['k'] for p in pick] and x['n'] not in want:
            pick.append(x)
    out = []
    for i, x in enumerate(pick):
        pal = META[x['sk']]['palette']
        c = pal[(i * 2 + 2) % len(pal)]
        out.append((x, c))
    return out


def hero_html():
    sl = hero_slides()
    imgs = ''.join(f'<div class="hs{" on" if i == 0 else ""}">{img(x["img"], x["n"], style="object-position:50% 20%")}</div>' for i, (x, c) in enumerate(sl))
    data = json.dumps([{'n': x['n'], 'l': f'Rising for {x["s"]}', 'c': c[0], 'cn': f'Season colour: {c[1].lower()}, {tcx(c[0])}'} for x, c in sl]).replace('</', '<\\/')
    x0, c0 = sl[0]
    return f'''<section class="hero2" style="display:grid;grid-template-columns:1fr 1fr;height:640px;border-bottom:1px solid var(--ru)">
  <div class="hc" style="padding:72px 56px 64px max(40px,calc((100vw - 1280px)/2 + 40px));display:flex;flex-direction:column;justify-content:center">
    <h1 class="dsp">See the next season first.</h1>
    <p class="lead" style="margin:26px 0 34px">Seasonal trend forecasts with colour, fabric and detail direction, for designers, brands and fashion schools.</p>
    <div style="display:flex;gap:12px;flex-wrap:wrap"><a class="btn" href="/account.html?signup=1">Sign up free</a><a class="btn o" href="/v2/{NEXT}-trims.html#preview">See a sample report</a></div>
    <p class="small mu" style="margin-top:22px">Free to join. Full reports and PDF downloads after sign-up.</p>
  </div>
  <div class="hp" id="hero" style="position:relative;overflow:hidden">{imgs}
    <div class="hcard"><div class="small gr" id="hl">Rising for {x0["s"]}</div><div style="font-weight:500" id="hn">{E(x0["n"])}</div>
      <div class="sw small" style="margin-top:10px"><i id="hc" style="background:{c0[0]};width:28px;height:28px"></i><span id="hcn">Season colour: {E(c0[1].lower())}, {tcx(c0[0])}</span></div>
      <div class="hprog"><i></i></div></div>
    <button type="button" class="hpause" id="hpause" aria-label="Pause the slideshow">Pause</button>
  </div>
</section><script>window.FC_HERO={data}</script>'''


JS2 = r"""(function(){
var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
/* hero slideshow */
var H=document.getElementById('hero');
if(H&&window.FC_HERO){var S=H.querySelectorAll('.hs'),D=window.FC_HERO,i=0,t=null,card=H.querySelector('.hcard'),pb=document.getElementById('hpause');
 function show(n){S[i].classList.remove('on');i=n%S.length;S[i].classList.add('on');var d=D[i];card.classList.remove('in');void card.offsetWidth;
  document.getElementById('hl').textContent=d.l;document.getElementById('hn').textContent=d.n;document.getElementById('hc').style.background=d.c;document.getElementById('hcn').textContent=d.cn;card.classList.add('in')}
 function play(){t=setInterval(function(){show(i+1)},6000);H.classList.add('run')}
 function stop(){clearInterval(t);t=null;H.classList.remove('run')}
 if(!RM&&S.length>1){play();card.classList.add('in')}else{pb.hidden=true}
 pb.addEventListener('click',function(){if(t){stop();pb.textContent='Play';pb.setAttribute('aria-label','Play the slideshow')}else{play();pb.textContent='Pause';pb.setAttribute('aria-label','Pause the slideshow')}});}
/* forecasts filter */
var sh=document.getElementById('shelf');
if(sh&&document.querySelector('.stabs')){var fs='all',ft='all';
 function apply(){var n=0;sh.querySelectorAll('.sgrp').forEach(function(g){var c=0;g.querySelectorAll('.cv').forEach(function(cv){var ok=ft==='all'||cv.dataset.topic===ft;cv.classList.toggle('hide',!ok);if(ok)c++});var ok=(fs==='all'||g.dataset.season===fs)&&c>0;g.classList.toggle('hide',!ok);if(ok)n++});document.getElementById('fnone').classList.toggle('hide',n>0)}
 function setS(v){fs=v;document.querySelectorAll('.stabs button').forEach(function(b){b.classList.toggle('on',b.dataset.v===v);b.setAttribute('aria-pressed',b.dataset.v===v)});apply()}
 document.querySelector('.stabs').addEventListener('click',function(e){var b=e.target.closest('button');if(b)setS(b.dataset.v)});
 document.getElementById('ftopic').addEventListener('change',function(){ft=this.value;apply()});
 document.getElementById('fregion').addEventListener('change',function(){if(this.value)window.open(this.value,'_blank')});
 var hs=location.hash.slice(1);if(hs&&document.querySelector('.stabs [data-v="'+hs+'"]'))setS(hs);}
/* report section nav highlight */
var rn=document.querySelector('.rnav');
if(rn&&'IntersectionObserver' in window){var links={};rn.querySelectorAll('a').forEach(function(a){links[a.getAttribute('href').slice(1)]=a});
 var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){rn.querySelectorAll('a').forEach(function(a){a.classList.remove('on')});var a=links[e.target.id];if(a){a.classList.add('on');a.scrollIntoView({block:'nearest',inline:'nearest'})}}})},{rootMargin:'-30% 0px -60% 0px'});
 document.querySelectorAll('.rs').forEach(function(s){io.observe(s)});}
/* signed-out preview: show overview and inspiration only */
var rep=document.getElementById('report');
if(rep&&location.hash==='#preview'){rep.querySelectorAll('.rs').forEach(function(s,k){if(k>1)s.classList.add('hide')});document.querySelector('.src')&&document.querySelector('.src').classList.add('hide');var g=document.getElementById('gate');g.classList.remove('hide');rep.after(g)}
/* detail pop-up */
var DM=document.getElementById('dm'),FI=window.FC_ITEMS;
if(DM&&FI){var cards=[].slice.call(document.querySelectorAll('button.item')),cur=-1,last=null,ST={e:'Emerging',r:'Rising',p:'Peaking',f:'Fading'},SC={e:'st-e',r:'st-r',p:'st-p',f:'st-f'};
 function saved(){try{return JSON.parse(localStorage.getItem('fc-saved')||'[]')}catch(e){return[]}}
 function fill(i){var d=FI.items[i],c=cards[i],im=c.querySelector('img'),dimg=document.getElementById('dmimg');
  var di=DM.querySelector('.dmi'),ph=c.querySelector('.ph');di.classList.toggle('none',!im);di.style.cssText=im?'':ph.getAttribute('style');var pe=di.querySelector('em');if(pe)pe.remove();if(im){dimg.src=im.src;dimg.alt=d.n}else{dimg.removeAttribute('src');var e2=document.createElement('em');e2.textContent=d.a;di.appendChild(e2)}
  document.getElementById('dmk').textContent=d.k+', '+d.a.toLowerCase();document.getElementById('dmn').textContent=d.n;document.getElementById('dmnote').textContent=d.note;
  var st=document.getElementById('dmst');st.textContent=ST[d.st]+' in '+FI.seasons[FI.si];st.className='stage '+SC[d.st];
  var nx=d.l[FI.si+1];document.getElementById('dmnx').textContent=FI.si<4?(ST[nx]?ST[nx]+' in '+FI.seasons[FI.si+1]:'Leaves the forecast in '+FI.seasons[FI.si+1]):'';
  var h='';for(var j=0;j<5;j++){var s=d.l[j];h+='<div class="c-'+(s==='-'?'n':s)+(j===FI.si?' now':'')+'" style="--d:'+(j*90)+'ms"><b>'+FI.seasons[j]+'</b><span>'+(ST[s]||'Not in forecast')+'</span></div>'}
  document.getElementById('dmlc').innerHTML=h;
  document.getElementById('dmth').innerHTML=d.th.length?'<h3>Part of these themes</h3><p class="gr">'+d.th.join(', ')+'</p>':'';
  var sv=document.getElementById('dmsave'),on=saved().some(function(x){return x.n===d.n});sv.textContent=on?'Saved':'Save detail';sv.setAttribute('aria-pressed',on);
  document.getElementById('dmprev').disabled=i===0;document.getElementById('dmnext').disabled=i===cards.length-1;cur=i}
 function open(i){last=cards[i];fill(i);DM.hidden=false;document.body.style.overflow='hidden';DM.classList.remove('in');void DM.offsetWidth;DM.classList.add('in');
  var im=cards[i].querySelector('img'),big=DM.querySelector('.dmi');
  if(im&&!RM&&big.animate){var a=im.getBoundingClientRect(),b=big.getBoundingClientRect();if(b.width&&b.height)big.animate([{transform:'translate('+(a.left-b.left)+'px,'+(a.top-b.top)+'px) scale('+(a.width/b.width)+','+(a.height/b.height)+')'},{transform:'none'}],{duration:460,easing:'cubic-bezier(.2,.75,.2,1)'})}
  DM.querySelector('.dmx').focus()}
 function close(){DM.classList.remove('in');document.body.style.overflow='';setTimeout(function(){DM.hidden=true},RM?0:180);last&&last.focus()}
 function step(n){var j=cur+n;if(j<0||j>=cards.length)return;var t=DM.querySelector('.dmt');fill(j);if(!RM&&t.animate)t.animate([{opacity:0,transform:'translateX('+(n*24)+'px)'},{opacity:1,transform:'none'}],{duration:260,easing:'ease-out'});DM.querySelector('.dmi').animate&&!RM&&DM.querySelector('.dmi').animate([{opacity:.2},{opacity:1}],{duration:260})}
 cards.forEach(function(c,i){c.addEventListener('click',function(){open(i)})});
 DM.addEventListener('click',function(e){if(e.target.closest('[data-close]'))close()});
 document.getElementById('dmprev').addEventListener('click',function(){step(-1)});document.getElementById('dmnext').addEventListener('click',function(){step(1)});
 document.getElementById('dmsave').addEventListener('click',function(){var d=FI.items[cur],L=saved(),k=L.findIndex(function(x){return x.n===d.n});if(k<0)L.unshift({n:d.n,s:FI.seasons[FI.si],u:location.pathname});else L.splice(k,1);try{localStorage.setItem('fc-saved',JSON.stringify(L.slice(0,200)))}catch(e){}fill(cur)});
 document.addEventListener('keydown',function(e){if(DM.hidden)return;if(e.key==='Escape')close();else if(e.key==='ArrowRight')step(1);else if(e.key==='ArrowLeft')step(-1);else if(e.key==='Tab'){var f=[].slice.call(DM.querySelectorAll('button:not([disabled]),a[href]'));var a=f[0],z=f[f.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}});}
})();
"""


def insights():
    rep = [(u, t, d) for u, t, d in json.load(open('reports_index.json')) if u != 'reports.html']
    items = []
    for a in ARTS:
        items.append(dict(u=f'/{a["slug"]}.html', t=a['title'], k=art_kind(a), d=a.get('date',''), img=art_img(a)))
    for u, t, d in rep:
        sl = u[:-5]
        k = next((c for c in (f'rep-{sl}', sl, f'cover-{sl}', f'hero-{sl}') if c in IMG), None)
        if not k:
            try:
                og = re.search(r'og:image" content="https://forecut\.in/img/([^"]+)\.(?:webp|jpg|png)"', open(os.path.join(ROOT, u)).read())
                k = og.group(1) if og and og.group(1) in IMG else None
            except Exception:
                k = None
        items.append(dict(u='/' + u, t=t.replace('Forecut ', ''), k='Report', d='', img=k))
    h = head('Insights | Forecut', 'Forecut reports, articles and market news.') + nav_app('Insights') + '<main id="main">'
    h += '''<section class="sec t"><div class="w split" style="display:flex;justify-content:space-between;align-items:end;gap:24px;flex-wrap:wrap">
<div><h1 class="dsp" style="font-size:52px">Insights</h1><p class="lead" style="margin-top:10px">Reports, articles and market news.</p></div>
<div class="flt" data-f="kind"><button class="ch on" type="button" data-v="all">All</button><button class="ch" type="button" data-v="Report">Reports</button><button class="ch" type="button" data-v="Article">Articles</button><button class="ch" type="button" data-v="Market news">Market news</button></div></div></section>'''
    lead = items[0]
    h += (f'<section class="w g split" style="grid-template-columns:7fr 5fr;gap:32px;padding-bottom:40px" id="lead"><a href="{lead["u"]}" data-kind="{lead["k"]}">' + (f'<div style="aspect-ratio:16/10">{img(lead["img"])}</div>' if lead['img'] else '') +
          f'<p class="small gr" style="margin:16px 0 6px">{lead["k"]}</p><h2 class="dsp" style="font-size:34px">{E(lead["t"])}</h2></a><div>' +
          ''.join(f'<a href="{x["u"]}" data-kind="{x["k"]}" style="display:grid;grid-template-columns:110px 1fr;gap:16px;padding:0 0 16px;margin-bottom:16px;border-bottom:1px solid var(--ru)">' + (f'<div style="aspect-ratio:1">{img(x["img"])}</div>' if x['img'] else '<div style="aspect-ratio:1;background:var(--st)"></div>') + f'<div><p class="small gr">{x["k"]}</p><p style="font-weight:500;margin-top:4px">{E(x["t"])}</p></div></a>' for x in items[1:5]) + '</div></section>')
    h += '<section class="w" style="padding-bottom:72px"><div class="g g3" id="ilist" style="row-gap:32px">' + ''.join(
        f'<a href="{x["u"]}" data-kind="{x["k"]}">' + (f'<div style="aspect-ratio:16/10">{img(x["img"])}</div>' if x['img'] else '<div style="aspect-ratio:16/10;background:var(--st)"></div>') + f'<p class="small gr" style="margin:12px 0 4px">{x["k"]}</p><p style="font-weight:500">{E(x["t"])}</p></a>' for x in items[5:]) + '</div></section></main>'
    return h + footer() + end()


GROUPS4 = [('Trend', ['trend-to-style', 'rangeboard', 'swatchsmith']),
           ('Design', ['pattern-maker', 'materials-library', 'textile-calculator', 'textile-processing-studio', 'size-chart-builder']),
           ('Specify and cost', ['tech-pack-builder', 'decoration-cost-estimator', 'pricefold', 'evenpoint']),
           ('Produce and sell', ['fit-qc-studio', 'cutclock', 'care-label-generator', 'product-description-writer', 'export-market-checker', 'style-tracker'])]


def tools():
    T = {t['slug']: t for t in TOOLS}
    h = head('Tools | Forecut', 'Free Forecut tools from trend to finished product.') + nav_app('Tools') + '<main id="main">'
    h += f'''<section class="sec t"><div class="w split" style="display:flex;justify-content:space-between;align-items:end;gap:24px;flex-wrap:wrap">
<div><h1 class="dsp" style="font-size:52px">Tools</h1><p class="lead" style="margin-top:10px">From trend to finished product. Free for members.</p></div>
<label class="srch" style="width:320px;max-width:100%">{SEARCH}<input id="tq" type="search" placeholder="Find a tool" aria-label="Find a tool" style="border:0;outline:0;font:inherit;width:100%;background:transparent"></label></div></section>
<section class="w" style="padding-bottom:24px" id="recent"></section>
<section class="w g g4 toolcols" style="gap:0;border-top:1px solid var(--ru);padding-bottom:64px">'''
    for i, (g, sl) in enumerate(GROUPS4):
        h += f'<div style="padding:22px 24px 0 0;{"border-left:1px solid var(--ru);padding-left:24px" if i else ""}"><h2 class="dsp" style="font-size:22px;margin-bottom:14px">{g}</h2>'
        for s in sl:
            t = T[s]
            h += f'<a class="tool" href="/{s}.html" data-q="{E((t["title"] + " " + t["lead"] + " " + t["tags"]).lower())}" style="display:block;padding:11px 0;border-bottom:1px solid var(--ru)"><span style="font-weight:500">{E(t["title"].replace("&", "and"))}</span><br><span class="small gr">{E(t["lead"])}</span></a>'
        h += '</div>'
    h += '</section></main>'
    return h + footer() + end()


def account():
    """Layout of the member dashboard. In the live build the panels are filled by account-dash.js from the member's own data."""
    h = head('Your dashboard | Forecut', 'Your Forecut dashboard.') + nav_app('') + '<main id="main">'
    side = ['Overview', 'Saved details', 'My work', 'Downloads', 'Team', 'Plan and access', 'Settings']
    pool = detail_pool()[:4]
    h += '<div class="w g split" style="grid-template-columns:220px 1fr;gap:48px;padding-top:36px;padding-bottom:72px"><aside class="side"><nav>' + ''.join(
        f'<a href="#" style="display:block;padding:10px 12px;margin-bottom:2px;{"background:var(--st);font-weight:500" if i == 0 else "color:var(--gr)"}">{t}</a>' for i, t in enumerate(side)) + \
        '</nav><p class="small gr" style="margin-top:24px;padding:0 12px">Your work saves on this device and syncs to your account.</p></aside><div>'
    h += '<h1 class="dsp" style="font-size:44px">Your dashboard</h1><p class="gr" style="margin:8px 0 18px">Everything you have saved, made and downloaded on Forecut.</p>'
    h += '<div class="flt tabs-m" style="display:none;margin-bottom:18px">' + ''.join(f'<span class="ch{" on" if i == 0 else ""}">{t}</span>' for i, t in enumerate(side[:6])) + '</div>'
    h += '''<div class="g split" style="grid-template-columns:2fr 1fr;gap:24px;margin-bottom:40px">
<div style="background:#000;color:#fff;padding:26px 28px"><div class="small" style="color:#bdbdbd">Your plan</div><div class="dsp" style="font-size:30px;margin:8px 0 6px" id="planname">Free member</div>
<p style="color:#d6d6d6" id="planline">Every tool is free. Full forecasts and report PDFs come with a plan or an access code.</p></div>
<form style="border:1px solid var(--ru);padding:22px 24px" onsubmit="return false"><div style="font-weight:500;margin-bottom:6px">Have an access code?</div><p class="small gr" style="margin-bottom:12px">From your college, alumni group or a Forecut partner.</p>
<div style="display:flex;gap:8px"><input aria-label="Access code" placeholder="For example NIFT2026" style="flex:1;min-width:0;border:1px solid var(--ru);height:38px;padding:0 12px;font:inherit"><button class="btn s" type="submit">Apply</button></div></form></div>
<div class="hd" style="margin-bottom:16px"><h2 class="dsp" style="font-size:28px">Continue where you left off</h2></div>
<p class="gr" style="margin-bottom:36px" id="contempty">Reports you open and work you save in the tools will appear here.</p>
<div class="hd" style="margin-bottom:16px"><h2 class="dsp" style="font-size:28px">Saved details</h2><a class="lk" href="#">See all</a></div><div class="g g4" style="gap:16px;margin-bottom:40px">''' + ''.join(
        f'<a href="/v2/{p["sk"]}-womenswear.html"><div style="aspect-ratio:4/5">{img(p["img"], p["n"])}</div><div style="font-weight:500;margin-top:10px">{E(p["n"])}</div><div class="small gr">{p["s"]}, {p["st"]}</div></a>' for p in pool) + '''</div>
<div class="g split" style="grid-template-columns:3fr 2fr;gap:32px"><div><div class="hd" style="margin-bottom:10px"><h2 class="dsp" style="font-size:28px">My work</h2><a class="lk" href="/v2/tools.html">Open tools</a></div><p class="gr">Styles, tech packs, palettes and patterns you save in the tools.</p></div>
<div><div class="hd" style="margin-bottom:10px"><h2 class="dsp" style="font-size:28px">Downloads</h2></div><p class="gr">Report PDFs you download.</p>
<div style="margin-top:26px;border:1px solid var(--ru);padding:18px 20px"><div style="font-weight:500;margin-bottom:6px">Team</div><p class="small gr" style="margin-bottom:12px">Share styles and tech packs with classmates or colleagues.</p><a class="btn s o" href="/account.html#team">Invite someone</a></div></div></div>
</div></div></main>'''
    return h + footer() + end()


JS = r"""(function(){
var b=document.querySelector('.mbtn'),m=document.getElementById('mmenu');
if(b&&m){b.addEventListener('click',function(){var o=m.classList.toggle('open');b.setAttribute('aria-expanded',o);document.body.style.overflow=o?'hidden':''});}
/* forecasts filters */
var shelf=document.getElementById('shelf');
if(shelf){var f={season:'all',topic:'all'};document.querySelectorAll('[data-f]').forEach(function(g){g.addEventListener('click',function(e){var c=e.target.closest('button.ch');if(!c)return;g.querySelectorAll('.ch').forEach(function(x){x.classList.toggle('on',x===c)});f[g.dataset.f]=c.dataset.v;var n=0;shelf.querySelectorAll('.cov').forEach(function(cv){var ok=(f.season==='all'||cv.dataset.season===f.season)&&(f.topic==='all'||cv.dataset.topic===f.topic);cv.classList.toggle('hide',!ok);if(ok)n++});document.getElementById('fnone').classList.toggle('hide',n>0);document.getElementById('fcount').textContent=(f.season==='all'&&f.topic==='all')?'Showing every season and topic':'Showing the matching reports'})});}
/* insights filter */
var il=document.getElementById('ilist');
if(il){document.querySelector('[data-f=kind]').addEventListener('click',function(e){var c=e.target.closest('button.ch');if(!c)return;this.querySelectorAll('.ch').forEach(function(x){x.classList.toggle('on',x===c)});var v=c.dataset.v;document.querySelectorAll('[data-kind]').forEach(function(a){a.classList.toggle('hide',v!=='all'&&a.dataset.kind!==v)})});}
/* tools search + recently used */
var tq=document.getElementById('tq');
if(tq){tq.addEventListener('input',function(){var q=tq.value.trim().toLowerCase();document.querySelectorAll('a.tool').forEach(function(a){a.classList.toggle('hide',q&&a.dataset.q.indexOf(q)<0)})});
 try{var r=JSON.parse(localStorage.getItem('fc-recent-tools')||'[]');if(r.length){var h='<p class="small gr" style="margin-bottom:10px">Recently used</p><div class="flt">';r.slice(0,4).forEach(function(x){h+='<a class="ch" href="'+x.u+'">'+x.t+'</a>'});document.getElementById('recent').innerHTML=h+'</div>'}}catch(e){}
 document.querySelectorAll('a.tool').forEach(function(a){a.addEventListener('click',function(){try{var r=JSON.parse(localStorage.getItem('fc-recent-tools')||'[]').filter(function(x){return x.u!==a.getAttribute('href')});r.unshift({u:a.getAttribute('href'),t:a.querySelector('span').textContent});localStorage.setItem('fc-recent-tools',JSON.stringify(r.slice(0,6)))}catch(e){}})});}
/* greeting + detail of the day + continue reading */
var g=document.getElementById('greet');if(g){var hr=new Date().getHours();g.textContent=(hr<12?'Good morning.':hr<17?'Good afternoon.':'Good evening.')}
var P=window.FC_DOTD;if(P&&P.length){var d=new Date(),i=Math.floor((Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()))/864e5)%P.length,x=P[i];
 document.getElementById('dimg').src=x.src||('/img/'+x.img+'.webp');document.getElementById('dimg').alt=x.n;document.getElementById('dname').textContent=x.n;document.getElementById('dnote').textContent=x.note;document.getElementById('dcat').textContent=x.k;document.getElementById('darea').textContent=x.a;
 document.getElementById('dst').textContent=x.st+' in '+x.s+(x.nx?', '+x.nx+' next season':'');document.getElementById('ddate').textContent='Detail of the day, '+d.toLocaleDateString('en-GB',{day:'numeric',month:'long'});
 var t=/Footwear/.test(x.k)?'footwear':/Menswear/.test(x.k)?'menswear':'womenswear';document.getElementById('dlink').href='/v2/'+x.sk+'-'+t+'.html';}
var rep=document.getElementById('report');
if(rep){try{localStorage.setItem('fc-last-report',JSON.stringify({u:location.pathname,t:document.querySelector('h1').textContent,s:document.title.split(' ')[0]}))}catch(e){}
}
window.addEventListener('hashchange',function(){if(rep&&(location.hash==='#preview'||location.hash==='#member'))location.reload()});
var cl=document.getElementById('contlink');if(cl){try{var lr=JSON.parse(localStorage.getItem('fc-last-report')||'null');if(lr){cl.href=lr.u;document.getElementById('conttitle').textContent=lr.t;document.getElementById('contseason').textContent=lr.s}}catch(e){}}
})();
"""


def main():
    os.makedirs(OUT, exist_ok=True)
    shutil.copy(os.path.join(B, 'v2', 'forecut.css'), os.path.join(OUT, 'forecut.css'))
    shutil.copy(os.path.join(B, 'v2', 'archivo.woff2'), os.path.join(OUT, 'archivo.woff2'))
    open(os.path.join(OUT, 'forecut.js'), 'w').write(JS + JS2)
    pages = {'index': landing(), 'home': home(), 'forecasts': forecasts(), 'insights': insights(), 'tools': tools(), 'account': account()}
    for s, t in REPORTS:
        pages[report_slug(s, t)] = report(s, t)
    for n, h in pages.items():
        open(os.path.join(OUT, n + '.html'), 'w').write(h)
    print(len(pages), 'pages written to v2/')


if __name__ == '__main__':
    main()
