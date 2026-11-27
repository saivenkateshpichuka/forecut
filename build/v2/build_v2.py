"""Forecut redesign (v2), built from the real site data. Writes the new pages to the site root
(index, home, forecasts, insights and one report page per season and topic); styles and script live in /.

Run from build/:  python3 v2/build_v2.py
Pages: landing (index), home, forecasts library, one report page per season and topic, insights, tools, account.
The live site is untouched; this folder is reviewed as a private preview first (see preview.py).
"""
import json, os, sys, datetime as dt, shutil, re
from html import escape as E

B = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))          # build/
ROOT = os.path.dirname(B)                                                 # repo root
OUT = ROOT
ASSET = os.path.join(ROOT, 'v2')
BASE = 'https://forecut.in/'
SITE = json.load(open('site.json'))
_PATH = ['', None]   # current page path and share image, set before each page is rendered
sys.path.insert(0, B)
os.chdir(B)
import home_blocks as HB
import journal_data as JD
import pantone as PT
import desc as DESCMOD
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
MARK = '<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="2" y="2" width="28" height="28" rx="7" fill="#1f3d33"/><path d="M10 23V9h12M10 16h8" stroke="#f5f0e8" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M22 18l3 3-3 3" stroke="#e0784b" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>'
LOGO = MARK + '<span>FORECUT</span>'
LOGO_LIGHT = MARK.replace('fill="#1f3d33"', 'fill="#f5f0e8"').replace('stroke="#f5f0e8"', 'stroke="#1f3d33"') + '<span>FORECUT</span>'
BURGER = '<svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><path d="M3 7h16M3 15h16" stroke="#000" stroke-width="1.6"/></svg>'


def head(title, desc):
    path, si = _PATH
    url = BASE + path
    shot = BASE + 'img/' + (si or f'hero-{NEXT}') + '.webp'
    ga = SITE.get('ga')
    return (f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
            f'<title>{E(title)}</title><meta name="description" content="{E(desc)}"><meta name="robots" content="index,follow">'
            f'<link rel="canonical" href="{url}"><meta name="theme-color" content="#1f3d33">'
            '<link rel="icon" href="/favicon.ico" sizes="48x48"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><link rel="manifest" href="/site.webmanifest">'
            f'<meta property="og:type" content="website"><meta property="og:site_name" content="Forecut"><meta property="og:title" content="{E(title)}"><meta property="og:description" content="{E(desc)}">'
            f'<meta property="og:url" content="{url}"><meta property="og:image" content="{shot}"><meta name="twitter:card" content="summary_large_image">'
            '<link rel="preload" href="/v2/archivo.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="/v2/forecut.css">'
            "<script>try{if(localStorage.getItem('fc-in')==='1')document.documentElement.classList.add('fc-in')}catch(e){}</script>"
            '<script type="module" src="/auth.js"></script>' +
            (f'<script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments)}}gtag("js",new Date());gtag("config","{ga}");(function(){{var d=0;function go(){{if(d)return;d=1;var g=document.createElement("script");g.async=1;g.src="https://www.googletagmanager.com/gtag/js?id={ga}";document.head.appendChild(g)}}["scroll","pointerdown","keydown","touchstart"].forEach(function(e){{addEventListener(e,go,{{once:true,passive:true}})}});addEventListener("load",function(){{setTimeout(go,2500)}})}})();</script>' if ga else '') +
            "<script>if('serviceWorker' in navigator)addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){})});</script>"
            '</head><body><a class="skip" href="#main">Skip to content</a>')


def nav_public(active=''):
    links = [('What we do', '/#what'), ('Forecasts', '/forecasts/'), ('Services', '/#services'), ('About', '/about.html'), ('Resources', '/insights.html')]
    return _nav(links, active, '<a class="out-only" href="/account.html#signin">Log in</a><a class="btn s out-only" href="/account.html#signup">Sign up free</a><a class="btn s in-only" href="/home.html">Your Home</a>',
                [('What we do', '/#what', 'Forecasts, colour, tools'), ('Forecasts', '/forecasts/', 'Seasons and audiences'), ('Services', '/#services', 'For designers, brands, schools'),
                 ('About', '/about.html', 'Our method'), ('Resources', '/insights.html', 'Reports and articles'), ('Log in', '/account.html', ''), ('Sign up free', '/account.html#signup', '')])


def nav_app(active=''):
    links = [('Home', '/home.html'), ('Forecasts', '/forecasts/'), ('Insights', '/insights.html'), ('Tools', '/tools.html'), ('PLM', '/plm.html')]
    return _nav(links, active, f'<a class="srch" href="/search.html">{SEARCH} Search forecasts</a><a class="av in-only" href="/account.html" aria-label="Your account" id="fcav">You</a><a class="out-only" href="/account.html#signin">Log in</a><a class="btn s out-only" href="/account.html#signup">Sign up free</a>',
                [('Home', '/home.html', ''), ('Forecasts', '/forecasts/', 'Seasons and audiences'), ('Insights', '/insights.html', 'Reports and articles'),
                 ('Tools', '/tools.html', 'Design tools'), ('PLM', '/plm.html', 'Coming soon'), ('Your dashboard', '/account.html', 'Plan, saved work'), ('Search', '/search.html', '')])


_MAUDS = [('men', 'Men'), ('women', 'Women'), ('kids', 'Kids'), ('boys', 'Boys'), ('girls', 'Girls'), ('toddler-boys', 'Toddler Boys'), ('toddler-girls', 'Toddler Girls')]
MEGA = ('<div class="mega"><div class="w">' + ''.join(
    f'<div><a class="mh" href="/forecasts/{s}/"><b>{META[s]["code"]}</b><span>{E(META[s]["stage"])}</span></a>' +
    ''.join(f'<a href="/forecasts/{s}/c/{k}.html">{t}</a>' for k, t in [('themes', 'Themes'), ('colour', 'Colour'), ('silhouettes', 'Silhouettes'), ('fabrics', 'Fabrics and materials'), ('womenswear', 'Womenswear'), ('menswear', 'Menswear'), ('footwear', 'Footwear'), ('trims', 'Trims and details')]) + '</div>' for s in ['ss27', 'aw27', 'ss28', 'aw28']) +
    '<div class="mx"><a class="mh" href="/forecasts/"><b>All forecasts</b><span>Every season</span></a><a href="/regions.html">Regional forecasts</a><a href="/india.html">India forecasts</a><a href="/colour.html">Colour library</a><a href="/insights.html">Insights</a></div></div></div>')


def _nav(links, active, right, mob):
    home = '/home.html' if links[0][0] == 'Home' else '/'
    return (f'<header class="nav"><div class="w"><a class="logo" href="{home}" aria-label="Forecut home">{LOGO}</a><nav class="links" aria-label="Main">' +
            ''.join((f'<div class="dd"><a{" class=on" if t == active else ""} href="{u}" aria-haspopup="true">{t}</a>{MEGA}</div>' if t == 'Forecasts' else f'<a{" class=on" if t == active else ""} href="{u}">{t}</a>') for t, u in links) +
            f'</nav><div class="r">{right}<button class="mbtn" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mmenu">{BURGER}</button></div></div></header>'
            '<div class="mmenu" id="mmenu">' + ''.join(f'<a class="big" href="{u}">{t}<span>{d}</span></a>' for t, u, d in mob) +
            '<p class="small gr" style="margin-top:20px">hello@forecut.in</p></div>')


def footer():
    cols = [('Forecasts', [('Seasonal forecasts', '/forecasts/'), ('Colour', f'/{NEXT}-colour.html'), ('Fabrics', f'/{NEXT}-fabrics.html'), ('Trims and details', f'/{NEXT}-trims.html'), ('Regions', '/regions.html'), ('India', '/india.html')]),
            ('Services', [('Forecast reports', '/forecasts/'), ('Design tools', '/tools.html'), ('For fashion schools', '/#services'), ('For brands', '/#services')]),
            ('Company', [('About Forecut', '/about.html'), ('Our method', '/method.html'), ('Track record', '/track-record.html'), ('Contact', '/contact.html')]),
            ('Resources', [('Insights', '/insights.html'), ('Couture', '/couture.html'), ('Privacy', '/privacy.html'), ('Terms', '/terms.html')])]
    return ('<footer class="ft"><div class="w"><div class="g">'
            '<div><div class="logo" style="margin-bottom:14px">' + LOGO_LIGHT + '</div><p class="small" style="color:#c9d3cd;max-width:24em">Seasonal fashion forecasts and design tools for designers, brands and fashion schools.</p>'
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
    its = topic_items(s, topic)
    mix = {k: sum(1 for x in its if x[2] == k) for k in 'erpf'}
    mx = max(mix.values()) or 1
    pal = ''.join(f'<i class="c-{k}" style="--h:{max(8, round(100 * mix[k] / mx))}%;--k:{n}" title="{STAGE[k][0]}"></i>' for n, k in enumerate('erpf'))
    return (f'<div class="art{" big" if big else ""}{" ph" if thumb in IMG else ""}" style="background:{hx};color:{fg}">' +
            (img(thumb, f'{META[s]["code"]} {t}') if thumb in IMG else '') +
            f'<span class="a1">{META[s]["code"]}</span><span class="a2">Forecut</span>'
            f'<span class="at">{title}</span>' + (f'<span class="as">{E(t)}</span>' if part else '') + f'<span class="mini2" aria-hidden="true">{pal}</span></div>')


def cover(s, topic, locked=False, small=False):
    return (f'<a class="cv" href="/{report_slug(s, topic)}.html" data-season="{s}" data-topic="{topic}">' + cover_art(s, topic) +
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
          ['Theme stories and why now', 'Moodboard of key pieces', 'Colour palette with TCX and HEX', 'Key pieces with design notes']),
         ('business', 'Strategy, pricing and markets', 'What to build and drop, price bands, cost and how each region reads the season.',
          ['Build, test, sell through, exit', 'Lifecycle and season timing', 'Indicative price bands and cost', 'Regional directions and India'])]


def report(s, topic):
    if topic == 'colour':
        return colour_report(s)
    m = META[s]
    si = SKEYS.index(s)
    key, title, desc, f = TOPIC[topic]
    its = topic_items(s, topic)
    R_ = by_stage(its, 'r', s); Em = by_stage(its, 'e', s); Pk = by_stage(its, 'p', s); Fd = by_stage(its, 'f', s)
    ths = related_themes(s, its)
    nxt = META[SKEYS[si + 1]]['code'] if si + 1 < 5 else None
    prv = META[SKEYS[si - 1]]['code'] if si > 0 else None
    h = head(f'{m["code"]} {title} | Forecut', f'{m["title"]} {title.lower()}: {desc}') + nav_app('Forecasts') + '<main id="main">'
    h += f'<div class="w crumb"><a href="/forecasts/">Forecasts</a> / <a href="/forecasts/{s}/">{m["code"]}</a> / {E(title)}</div>'
    # ---------------- header
    lead_line = (f'Build around {names(R_, 3)}.' if R_ else f'Lead with {names(Pk, 3)}.' if Pk else '')
    h += f'''<section class="w rhead"><div>{cover_art(s, topic, big=True)}</div>
<div class="rinfo"><p class="small gr">{E(m["title"])}, {E(m["stage"].lower())}, in stores {E(m["window"])}</p>
<h1 class="dsp">{E(title)}</h1><p class="lead">{E(desc)}</p>{f'<p class="key">{E(lead_line)}</p>' if lead_line else ''}
<div class="ctas"><a class="btn" href="#forecast">Read the forecast</a><a class="btn o" href="#downloads">Downloads</a></div>
<p class="small gr">Updated {TODAY.strftime("%-d %B %Y")}.</p></div></section>'''
    secs = [('overview', 'Overview'), ('inspiration', 'Inspiration'), ('development', 'How it developed'), ('forecast', 'The forecast'),
            ('colour', 'Colour'), ('strategy', 'Strategy'), ('pricing', 'Pricing and cost'), ('markets', 'Markets'), ('downloads', 'Downloads')]
    h += chapters_block(s, topic)
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
    body += f'<section class="rs" id="development"><div class="rsh"><h2 class="dsp">How it developed</h2><p class="gr"><span class="live"><i></i>Live forecast, updated {TODAY.strftime("%-d %B %Y")}</span><br>Where these pieces came from and where they go next.</p></div>'
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
                 ''.join(f'<th scope="col"{" class=now" if j == si else ""}>{META[k2]["code"]}' + ('<em class="nowp">Now</em>' if j == si else '') + '</th>' for j, k2 in enumerate(SKEYS)) + '</tr></thead><tbody>')
        for ri, (k, it, st, nx) in enumerate(key):
            p = photo(it['name'], s)
            body += (f'<tr><th scope="row"><span class="th">{img(p, "") if p else ""}</span>{E(it["name"])}</th>' +
                     ''.join(f'<td class="c-{c if c != "-" else "n"}{" now" if j == si else ""}" style="--i:{ri};--j:{j}"><span>{STAGE[c][0] if c in STAGE else ""}</span></td>' for j, c in enumerate(it['life'])) + '</tr>')
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
                     ('<h4>Actions</h4><ul class="ul">' + ''.join(f'<li>{E(a)}</li>' for a in th.get('actions', [])) + '</ul>' if th.get('actions') else '') + f'<p style="margin-top:16px"><a class="lk" href="/{s}-theme-{islug(t)}.html">Read the full story</a></p></div></article>')
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
                ds = DESCMOD.build(k.split('|')[0], k.split('|')[1], it)
                data.append({'n': it['name'], 'k': k.replace('|', ', '), 'a': it['area'], 'note': it['note'], 'l': it['life'], 'st': stg, 'th': theme_hits(s, it),
                             'o': ds['o'], 'd': ds['d'], 'f': ds['f'], 'u': ds['u'], 'p': p or ''})
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
                 f'</ul><a class="btn s" href="/output/reports/{report_slug(s, topic)}-{pk}.pdf" data-pdf>Download PDF</a></div></div>')
    body += '</div></section>'
    h += f'''<div class="w gate hide" id="gate"><h2 class="dsp" style="font-size:32px">Read the full report free</h2><p class="gr" style="margin:12px 0 22px">Sign up to read every section and download the PDFs. It takes under a minute.</p><a class="btn" href="/account.html#signup">Sign up free</a> <a class="btn o" href="/account.html#signin" style="margin-left:8px">Log in</a></div>
<div class="w" id="report">{body}<p class="small gr src">Sources: {E(m.get("sources", ""))}</p></div>
<section class="sec st"><div class="w"><h2 class="dsp" style="font-size:30px;margin-bottom:22px">More {m["code"]} reports</h2><div class="g g4">{''.join([cover(s, t) for t, *_ in TOPICS if t != topic][:4])}</div></div></section></main>'''
    h += DM_HTML
    seas = [META[k2]['code'] for k2 in SKEYS]
    dj = json.dumps({'items': data, 'seasons': seas, 'si': si}, ensure_ascii=False).replace('</', '<\\/')
    return h + footer() + end(f'<script>window.FC_ITEMS={dj}</script>')


REGIONS_LINKS = [('Europe', '/region-europe.html'), ('North America', '/region-north-america.html'), ('Asia', '/region-asia.html'), ('South America', '/region-south-america.html'),
                 ('Africa', '/region-africa.html'), ('Oceania', '/region-oceania.html'), ('India', '/india.html'), ('Resort 27', '/resort-27.html'), ('Pre-Fall 27', '/pre-fall-27.html')]


def _aud_row(s):
    import tree as TREE
    return '<h3 class="sub" style="margin-top:0">Forecasts by audience</h3>' + TREE.aud_row(sys.modules[__name__], s)


def forecasts():
    import tree as TREE
    V = sys.modules[__name__]
    h = head('Forecasts | Forecut', 'Forecut forecasts by season and audience: men, women, boys, girls, toddler boys and toddler girls, each with themes, colour, silhouettes, fabrics, trims, styling, couture, business strategy and innovation.') + nav_app('Forecasts') + '<main id="main">'
    h += '<h1 class="vh">Forecasts</h1>'
    h += ('<div class="fbar"><div class="w"><div class="stabs" role="group" aria-label="Season"><button type="button" class="on" data-v="all"><b>All</b><span>every season</span></button>' +
          ''.join(f'<button type="button" data-v="{s}"><b>{META[s]["code"]}</b><span>{E(META[s]["stage"].lower())}</span></button>' for s in SKEYS) +
          '</div><div class="fsel"><label><span>Audience</span><select id="ftopic"><option value="all">All audiences</option>' +
          ''.join(f'<option value="{k}">{E(t)}</option>' for k, t, _ in TREE.AUDS) +
          '</select></label><label><span>Region</span><select id="fregion"><option value="">Global</option>' +
          ''.join(f'<option value="{u}">{t}</option>' for t, u in REGIONS_LINKS) + '</select></label></div></div></div>')
    order = [NEXT] + [s for s in SKEYS if s != NEXT]
    h += '<div class="w" id="shelf" style="padding-bottom:72px">'
    for s in order:
        m = META[s]
        cards = ''
        for k, t, d in TREE.AUDS:
            th = TREE.themes(V, s, k)
            cards += (f'<div class="ac" data-aud="{k}"><a class="ach" href="/{TREE.slug(s, k)}.html"><b class="dsp">{m["code"]} {E(t)}</b><span class="small gr">{E(d)}</span></a><ul>' +
                      ''.join(f'<li><a href="/{TREE.slug(s, k, key)}.html">{E(TREE.sec_name(k, key))}</a>' +
                              (('<span class="acth">' + ', '.join(f'<a href="/{TREE.slug(s, k, "theme-" + x["slug"])}.html">{E(x["name"])}</a>' for x in th) + '</span>') if key == 'themes' else '') + '</li>'
                              for key, _, _ in TREE.SECTIONS) + '</ul></div>')
        h += (f'<section class="sgrp" data-season="{s}" id="{s}"><div class="sgh"><h2 class="dsp">{m["code"]}</h2><p><b>{E(m["title"])}</b><span class="gr">{E(m["stage"])}, in stores {E(m["window"])}</span></p>'
              f'<a class="lk small" style="margin-left:auto" href="/{s}-kids.html">Kids: choose an audience</a></div><div class="atree">{cards}</div></section>')
    h += '<p class="gr hide" id="fnone" style="padding:30px 0">Nothing matches. Choose another season or audience.</p>'
    h += '<p class="small gr" style="margin-top:28px">Looking for an earlier topic report? <a class="lk" href="/reports.html">Report archive</a>.</p></div></main>'
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
    data = json.dumps([{'n': x['n'], 'l': f'{x["st"].capitalize()} for {x["s"]}', 'k': x['k'], 'a': x['a'], 'note': x['note'], 'nx': (f'Then {x["nx"]} next season' if x['nx'] else '')} for x, c in sl]).replace('</', '<\\/')
    x0, c0 = sl[0]
    return f'''<section class="hero2" style="display:grid;grid-template-columns:1fr 1fr;height:640px;border-bottom:1px solid var(--ru)">
  <div class="hc" style="padding:72px 56px 64px max(40px,calc((100vw - 1280px)/2 + 40px));display:flex;flex-direction:column;justify-content:center">
    <h1 class="dsp">See the next season first.</h1>
    <p class="lead" style="margin:26px 0 34px">The silhouettes, details, fabrics and colours moving from the runways into stores, read season by season, so you design what sells next.</p>
    <div class="out-only" style="display:flex;gap:12px;flex-wrap:wrap"><a class="btn" href="/account.html#signup">Sign up free</a><a class="btn o" href="/{NEXT}-trims.html">See a sample report</a></div>
    <div class="in-only" style="display:flex;gap:12px;flex-wrap:wrap"><a class="btn" href="/home.html">Open Your Home</a><a class="btn o" href="/forecasts/">Browse the forecasts</a></div>
    <p class="small mu out-only" style="margin-top:22px">Free to join. Full reports and PDF downloads after sign-up.</p>
  </div>
  <div class="hp" id="hero" style="position:relative;overflow:hidden">{imgs}
    <div class="hcard"><div class="small gr" id="hl">{x0["st"].capitalize()} for {x0["s"]}</div><div style="font-weight:500" id="hn">{E(x0["n"])}</div>
      <div class="small gr" id="hk" style="margin-top:2px">{E(x0["k"])}, {E(x0["a"].lower())}</div><p class="small" id="hnote" style="margin-top:8px">{E(x0["note"])}</p><div class="small" style="margin-top:6px"><span class="gr" id="hnx">{E(("Then " + x0["nx"] + " next season") if x0["nx"] else "")}</span></div>
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
  document.getElementById('hl').textContent=d.l;document.getElementById('hn').textContent=d.n;document.getElementById('hk').textContent=d.k+', '+d.a.toLowerCase();document.getElementById('hnote').textContent=d.note;document.getElementById('hnx').textContent=d.nx;card.classList.add('in')}
 function play(){t=setInterval(function(){show(i+1)},6000);H.classList.add('run')}
 function stop(){clearInterval(t);t=null;H.classList.remove('run')}
 if(!RM&&S.length>1){play();card.classList.add('in')}else{pb.hidden=true}
 pb.addEventListener('click',function(){if(t){stop();pb.textContent='Play';pb.setAttribute('aria-label','Play the slideshow')}else{play();pb.textContent='Pause';pb.setAttribute('aria-label','Pause the slideshow')}});}
/* forecasts filter */
var sh=document.getElementById('shelf');
if(sh&&document.querySelector('.stabs')){var fs='all',ft='all';
 function apply(){var n=0;sh.querySelectorAll('.sgrp').forEach(function(g){var c=0;g.querySelectorAll('.ac').forEach(function(cv){var ok=ft==='all'||cv.dataset.aud===ft;cv.classList.toggle('hide',!ok);if(ok)c++});var ok=(fs==='all'||g.dataset.season===fs)&&c>0;g.classList.toggle('hide',!ok);if(ok)n++});document.getElementById('fnone').classList.toggle('hide',n>0)}
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
/* sign-in state: signed-out readers see the overview and inspiration, then a sign-up block */
var rep=document.getElementById('report'),gated=false;
function gate(on){if(!rep)return;if(on===gated)return;gated=on;rep.querySelectorAll('.rs').forEach(function(s,k){if(k>1)s.classList.toggle('hide',on)});var g=document.getElementById('gate');if(g){g.classList.toggle('hide',!on);if(on)rep.after(g)}}
function setUser(u){if(!u&&window.FC_PRIVATE){location.replace('/');return}var R=document.documentElement;R.classList.toggle('fc-in',!!u);try{u?localStorage.setItem('fc-in','1'):localStorage.removeItem('fc-in')}catch(e){}
 var av=document.getElementById('fcav');if(av&&u){var n=(u.displayName||u.email||'').trim();av.textContent=n?n[0].toUpperCase():'You'}
 var gr=document.getElementById('greet');if(gr&&u&&u.displayName){gr.textContent=gr.textContent.replace(/\.$/,', '+u.displayName.split(' ')[0]+'.')}
 gate(!u||location.hash==='#preview');
 if(u&&document.body.dataset.page==='landing'&&!/forecut\.in/.test(document.referrer)&&!/[?&]stay/.test(location.search))location.replace('/home')}
gate(!document.documentElement.classList.contains('fc-in')||location.hash==='#preview');
(function wait(n){if(window.FCAuth&&FCAuth.onChange){FCAuth.onChange(setUser)}else if(n<80)setTimeout(function(){wait(n+1)},100);else if(window.FC_PRIVATE&&!document.documentElement.classList.contains('fc-in'))location.replace('/')})(0);
document.addEventListener('click',function(e){var a=e.target.closest('[data-pdf]');if(a&&!document.documentElement.classList.contains('fc-in')){e.preventDefault();location.href='/account.html#signup'}});
/* lifecycle table: fill in when it comes into view */
var lcs=document.querySelectorAll('.lct,.cdev,.tdev,.sboard,.chg');
/* what we do: slow cross-fade between pictures */
document.querySelectorAll('.wim.fade').forEach(function(w,n){var f=w.querySelectorAll('.wf');if(f.length<2||RM)return;var i=0;setTimeout(function(){setInterval(function(){f[i].classList.remove('on');i=(i+1)%f.length;f[i].classList.add('on')},5200)},n*1700)});
/* marquee rows: repeat the items so the loop is seamless, pause on hover or focus */
document.querySelectorAll('.marq .mtrack').forEach(function(t){if(RM){t.parentNode.classList.add('still');return}var kids=[].slice.call(t.children);kids.forEach(function(k){var c=k.cloneNode(true);c.setAttribute('aria-hidden','true');c.tabIndex=-1;t.appendChild(c)});t.style.setProperty('--dur',(kids.length*4.5)+'s')});
/* rising now: season tabs */
document.querySelectorAll('.rtabs').forEach(function(tb){tb.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;tb.querySelectorAll('button').forEach(function(x){var on=x===b;x.classList.toggle('on',on);x.setAttribute('aria-selected',on);document.getElementById(x.dataset.p).classList.toggle('hide',!on)})})});
if(lcs.length){if(RM||!('IntersectionObserver' in window)){lcs.forEach(function(t){t.classList.add('vis')})}else{var lio=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('vis');lio.unobserve(e.target)}})},{threshold:.2});lcs.forEach(function(t){lio.observe(t)})}}
/* Home: saved details and tools you used */
var sv=document.getElementById('saved');
if(sv){try{var L=JSON.parse(localStorage.getItem('fc-saved')||'[]');if(L.length){sv.innerHTML=L.slice(0,6).map(function(x){var n=document.createElement('i');n.textContent=x.n||x.name||'';return '<a href="'+(x.u||x.page||'/forecasts/')+'">'+(x.p?'<span class="sim"><img src="/img/'+x.p+'.webp" alt=""></span>':'<span class="sim"></span>')+'<span><b>'+n.innerHTML+'</b><span class="small gr">'+(x.s||x.season||'')+'</span></span></a>'}).join('')+(L.length>6?'<a class="lk" href="/account.html">See all</a>':'')}}catch(e){}}
var mt=document.getElementById('mytools');
if(mt&&window.FC_TOOLS){var RT2=window.recentTools().filter(function(sl){return FC_TOOLS[sl]}).slice(0,4);if(RT2.length){mt.innerHTML=RT2.map(function(sl){return '<a href="/'+sl+'.html"><b>'+FC_TOOLS[sl][0]+'</b><span class="small gr">'+FC_TOOLS[sl][1]+'</span></a>'}).join('')}}
if(mt){try{var R=JSON.parse(localStorage.getItem('fc-recent-tools')||'[]');if(R.length){mt.innerHTML=R.slice(0,4).map(function(x){var n=document.createElement('i');n.textContent=x.t;return '<a href="'+x.u+'"><b>'+n.innerHTML+'</b><span class="small gr">Used recently</span></a>'}).join('')}}catch(e){}}
/* forecast finder */
var ff=document.getElementById('fform');
if(ff){ff.addEventListener('submit',function(e){e.preventDefault();var m=ff.m.value;if(m){location.href=m}else{location.href='/'+ff.s.value+'-'+ff.t.value+'.html'}})}
/* detail pop-up */
var DM=document.getElementById('dm'),FI=window.FC_ITEMS;
if(DM&&FI){var cards=[].slice.call(document.querySelectorAll('button.item')),cur=-1,last=null,ST={e:'Emerging',r:'Rising',p:'Peaking',f:'Fading'},SC={e:'st-e',r:'st-r',p:'st-p',f:'st-f'};
 function saved(){try{return JSON.parse(localStorage.getItem('fc-saved')||'[]')}catch(e){return[]}}
 function esc(x){var e=document.createElement('i');e.textContent=x;return e.innerHTML}
 function curve(life,ci){var X={e:46,r:98,p:160,f:236},NM=ST,COL={e:'#d0703f',r:'#2e7d55',p:'#b07a24',f:'#8a6f86'};
  function y(x){return 92-74*Math.exp(-Math.pow((x-160)/62,2))}
  var pts=[];for(var x=8;x<=312;x+=4)pts.push(x+','+y(x).toFixed(1));var ch=life.charAt(ci);if(!X[ch])return '';
  var cx=X[ch],done=[];for(var x2=8;x2<=cx;x2+=4)done.push(x2+','+y(x2).toFixed(1));
  var s='<svg viewBox="0 -18 320 146" role="img" aria-label="Trend curve: '+NM[ch]+' in '+FI.seasons[ci]+'"><polyline points="'+pts.join(' ')+'" fill="none" stroke="#e6ded3" stroke-width="5" stroke-linecap="round"/>';
  s+='<polyline class="tcdone" points="'+done.join(' ')+'" fill="none" stroke="'+COL[ch]+'" stroke-width="5" stroke-linecap="round" pathLength="100"/>';
  ['e','r','p','f'].forEach(function(k,ix){var on=k===ch;s+='<circle cx="'+X[k]+'" cy="'+y(X[k]).toFixed(1)+'" r="'+(on?8:4.5)+'" fill="'+(on?COL[k]:'#fff')+'" stroke="'+COL[k]+'" stroke-width="2.5"'+(on?' class="tcdot"':'')+' style="--k:'+ix+'"/><text x="'+X[k]+'" y="120" text-anchor="middle" font-size="11.5" font-weight="'+(on?700:500)+'" fill="'+(on?COL[k]:'#8a817a')+'">'+NM[k]+'</text>'});
  s+='<text x="'+cx+'" y="'+(y(cx)-16).toFixed(1)+'" text-anchor="middle" font-size="12" font-weight="700" fill="#1c1714">'+FI.seasons[ci]+'</text></svg>';
  var nx=life.charAt(ci+1),msg={e:'Early signals: test in small quantities.',r:'Growth is building: the best time to invest.',p:'At its height: keep in core ranges, avoid over-buying.',f:'Demand is slowing: clear stock and move on.'}[ch];
  if(FI.seasons[ci+1])msg+=X[nx]?' Next, '+FI.seasons[ci+1]+': '+NM[nx].toLowerCase()+'.':' Leaves the forecast in '+FI.seasons[ci+1]+'.';
  return s+'<p class="small gr">'+msg+'</p>'}
 function fill(i){DM.dataset.cur=i;var d=FI.items[i],c=cards[i],im=c.querySelector('img'),dimg=document.getElementById('dmimg');
  var di=DM.querySelector('.dmi'),ph=c.querySelector('.ph');di.classList.toggle('none',!im);di.style.cssText=im?'':ph.getAttribute('style');var pe=di.querySelector('em');if(pe)pe.remove();if(im){dimg.src=im.src;dimg.alt=d.n}else{dimg.removeAttribute('src');var e2=document.createElement('em');e2.textContent=d.a;di.appendChild(e2)}
  document.getElementById('dmk').textContent=d.k+', '+d.a.toLowerCase();document.getElementById('dmn').textContent=d.n;document.getElementById('dmnote').textContent=d.note;
  var st=document.getElementById('dmst');st.textContent=ST[d.st]+' in '+FI.seasons[FI.si];st.className='stage '+SC[d.st];
  var nx=d.l[FI.si+1];document.getElementById('dmnx').textContent=FI.si<4?(ST[nx]?ST[nx]+' in '+FI.seasons[FI.si+1]:'Leaves the forecast in '+FI.seasons[FI.si+1]):'';
  var h='';for(var j=0;j<5;j++){var s=d.l[j];h+='<div class="c-'+(s==='-'?'n':s)+(j===FI.si?' now':'')+'" style="--d:'+(j*90)+'ms"><b>'+FI.seasons[j]+'</b><span>'+(ST[s]||'Not in forecast')+'</span></div>'}
  document.getElementById('dmlc').innerHTML=h;
  document.getElementById('dmth').innerHTML=d.th.length?'<h3>Part of these themes</h3><p class="gr">'+d.th.join(', ')+'</p>':'';
  document.getElementById('dmcurve').innerHTML=curve(d.l,FI.si);
  document.getElementById('dmd').innerHTML=(d.d||[]).map(function(x){return '<li>'+esc(x)+'</li>'}).join('');
  document.getElementById('dmf').textContent=d.f||'';document.getElementById('dmu').textContent=d.u||'';
  document.getElementById('dmnote').textContent=d.o||d.note;
  var pin=document.getElementById('dmpin');pin.hidden=!d.p;if(d.p)pin.href='https://www.pinterest.com/pin/create/button/?url='+encodeURIComponent(location.origin+location.pathname)+'&media='+encodeURIComponent(location.origin+'/img/'+d.p+'.webp')+'&description='+encodeURIComponent(d.n+', '+FI.seasons[FI.si]+' forecast by Forecut');
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
 document.getElementById('dmsave').addEventListener('click',function(){var d=FI.items[cur],L=saved(),k=L.findIndex(function(x){return x.n===d.n});if(k<0)L.unshift({n:d.n,s:FI.seasons[FI.si],u:location.pathname,p:d.p,k:d.k,aud:window.FC_CTX?FC_CTX.aud:'',src:window.FC_CTX?FC_CTX.src:document.title.split(' | ')[0]});else L.splice(k,1);try{localStorage.setItem('fc-saved',JSON.stringify(L.slice(0,200)))}catch(e){}fill(cur)});
 document.addEventListener('keydown',function(e){if(DM.hidden)return;if(e.key==='Escape')close();else if(e.key==='ArrowRight')step(1);else if(e.key==='ArrowLeft')step(-1);else if(e.key==='Tab'){var f=[].slice.call(DM.querySelectorAll('button:not([disabled]),a[href]'));var a=f[0],z=f[f.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}});}
 /* library category pages: filter by subsection, sort */
 [].forEach.call(document.querySelectorAll('.lbar'),function(bar){var box=bar.parentNode.querySelector('.lgrps');if(!box)return;var groups=[].slice.call(box.querySelectorAll('.lgrp'));
  bar.addEventListener('click',function(e){var b=e.target.closest('[data-v]');if(!b)return;[].forEach.call(bar.querySelectorAll('[data-v]'),function(x){x.classList.toggle('on',x===b)});groups.forEach(function(g){g.hidden=!(b.dataset.v==='all'||g.dataset.sub===b.dataset.v)})});
  var sel=bar.querySelector('[data-sort]');if(sel)sel.addEventListener('change',function(){groups.forEach(function(g){[].forEach.call(g.querySelectorAll('.rgrid'),function(gr){var c=[].slice.call(gr.children);c.sort(function(a,b){return sel.value==='new'?(b.dataset.date||'').localeCompare(a.dataset.date||''):sel.value==='az'?(a.dataset.title||'').localeCompare(b.dataset.title||''):0});if(sel.value!=='sub')c.forEach(function(x){gr.appendChild(x)})})})})});
 /* send findings to a Board, a Style Brief or the Collection Planner, keeping season + audience + report title */
 var TO={board:['a Board','/trend-to-style.html'],brief:['your Style Brief','/trend-to-style.html'],plan:['Collection Planner','/rangeboard.html']};
 document.addEventListener('click',function(e){var b=e.target.closest('[data-send]');if(!b)return;e.preventDefault();
  if(!document.documentElement.classList.contains('fc-in')){location.href='/account.html#signup';return}
  var X=window.FC_CTX||{season:'',aud:'',src:document.title.split(' | ')[0],url:location.pathname},I=(window.FC_ITEMS&&FC_ITEMS.items)||[],dm=b.closest('.dm'),list;
  if(dm){list=[I[+dm.dataset.cur]]}else{list=I.slice(0,4);if(!list.length){var ld=document.querySelector('.rinfo .lead');list=[{n:X.src,note:ld?ld.textContent:''}]}}
  var L;try{L=JSON.parse(localStorage.getItem('fc-forecast-inbox')||'[]')}catch(x){L=[]}
  list.forEach(function(d){if(!d)return;L.unshift({id:Date.now().toString(36)+Math.random().toString(36).slice(2,7),to:b.dataset.send,season:X.season,aud:X.aud,src:X.src,url:X.url,cid:X.id||'',cv:X.v||'',cvd:X.vdate||'',n:d.n,note:d.note||'',area:d.a||'',st:d.st||'',k:d.k||'',p:d.p||'',at:new Date().toISOString()})});
  try{localStorage.setItem('fc-forecast-inbox',JSON.stringify(L.slice(0,200)))}catch(x){}
  var t=document.getElementById('sendt');if(t){t.innerHTML='Sent to '+TO[b.dataset.send][0]+' with '+X.season+' '+X.aud+', '+X.src.replace(/</g,'')+'. <a href="'+TO[b.dataset.send][1]+'">Open it</a>';t.hidden=false;clearTimeout(t._t);t._t=setTimeout(function(){t.hidden=true},7000)}});
 document.addEventListener('click',function(e){var b=e.target.closest('[data-print]');if(!b)return;e.preventDefault();
  if(!document.documentElement.classList.contains('fc-in')){location.href='/account.html#signup';return}
  [].forEach.call(document.querySelectorAll('img[loading=lazy]'),function(i){i.loading='eager'});document.documentElement.classList.add('printing');
  var im=[].filter.call(document.images,function(i){return !i.complete}),n=im.length,go=function(){setTimeout(function(){window.print()},150)};
  if(!n)go();else{var t=setTimeout(go,4000);im.forEach(function(i){i.addEventListener('load',function(){if(--n===0){clearTimeout(t);go()}},{once:true});i.addEventListener('error',function(){if(--n===0){clearTimeout(t);go()}},{once:true})})}});
})();
"""


def _title_of(u):
    try:
        t = re.search(r'<title>([^<|]*)', open(os.path.join(ROOT, u), encoding='utf-8', errors='ignore').read(4000))
        return t.group(1).strip() if t else None
    except Exception:
        return None


IKINDS = ['Report', 'Journal', 'Magazine', 'Market data', 'Brand updates', 'Market news', 'Brand news']


def insights():
    import sales_data as SD, regions_data as RD
    rep = [(u, t, d) for u, t, d in json.load(open('reports_index.json')) if u != 'reports.html']
    items = []
    for a in ARTS:
        items.append(dict(u=f'/{a["slug"]}.html', t=a['title'], k='Market news' if art_kind(a) == 'Market news' else 'Journal', d=a.get('date', ''), img=art_img(a)))
    kmap = {'fashion-brand-competition-2026.html': 'Market data', 'fashion-marketing-trends-2026.html': 'Market data', 'india-brand-watch.html': 'Brand updates', 'fashion-controversies-2026.html': 'Brand updates'}
    for u, t, d in rep:
        sl = u[:-5]
        k = next((c for c in (f'rep-{sl}', sl, f'cover-{sl}', f'hero-{sl}') if c in IMG), None)
        if not k:
            try:
                og = re.search(r'og:image" content="https://forecut\.in/img/([^"]+)\.(?:webp|jpg|png)"', open(os.path.join(ROOT, u)).read())
                k = og.group(1) if og and og.group(1) in IMG else None
            except Exception:
                k = None
        items.append(dict(u='/' + u, t=t.replace('Forecut ', ''), k=kmap.get(u, 'Report'), d='', img=k))
    for f in sorted(os.listdir(ROOT)):
        if (f.startswith('couture-') or f.startswith('innovation-')) and f.endswith('.html'):
            t = _title_of(f)
            if t:
                sl = f[:-5]
                k = next((c for c in (sl, f'hero-{sl}', f'cover-{sl}') if c in IMG), None)
                items.append(dict(u='/' + f, t=t, k='Magazine', d='', img=k))
    for r in RD.REGIONS:
        items.append(dict(u=f'/region-{r["slug"]}.html', t=f'{r["name"]}: sales calendar, climate and market data', k='Market data', d='', img=next((x for x in ([r.get('img')] if isinstance(r.get('img'), str) else (r.get('img') or [])) if x in IMG), None)))
    bn = []
    for m in SD.MARKETS:
        for b in m['brands']:
            bn.append(dict(u=f'/region-{m["region"]}.html', t=f'{b[0]}: {b[1]}', k='Brand news', d='', img=None, src=b[2]))
    items += bn[:30]
    h = head('Insights | Forecut', 'Forecut reports, journal, magazine, market data, brand updates, market news and brand news.') + nav_app('Insights') + '<main id="main">'
    h += ('<section class="sec t"><div class="w split" style="display:flex;justify-content:space-between;align-items:end;gap:24px;flex-wrap:wrap">'
          '<div><h1 class="dsp" style="font-size:52px">Insights</h1><p class="lead" style="margin-top:10px">Reports, journal, magazine, market data and news.</p></div>'
          '<div class="flt" data-f="kind"><button class="ch on" type="button" data-v="all">All</button>' +
          ''.join(f'<button class="ch" type="button" data-v="{k}">{k + "s" if k == "Report" else k}</button>' for k in IKINDS) + '</div></div></section>')
    lead = items[0]
    h += (f'<section class="w g split" style="grid-template-columns:7fr 5fr;gap:32px;padding-bottom:40px" id="lead"><a href="{lead["u"]}" data-kind="{lead["k"]}">' + (f'<div style="aspect-ratio:16/10">{img(lead["img"])}</div>' if lead['img'] else '') +
          f'<p class="small gr" style="margin:16px 0 6px">{lead["k"]}</p><h2 class="dsp" style="font-size:34px">{E(lead["t"])}</h2></a><div>' +
          ''.join(f'<a href="{x["u"]}" data-kind="{x["k"]}" style="display:grid;grid-template-columns:110px 1fr;gap:16px;padding:0 0 16px;margin-bottom:16px;border-bottom:1px solid var(--ru)">' + (f'<div style="aspect-ratio:1">{img(x["img"])}</div>' if x['img'] else '<div style="aspect-ratio:1;background:var(--st)"></div>') + f'<div><p class="small gr">{x["k"]}</p><p style="font-weight:500;margin-top:4px">{E(x["t"])}</p></div></a>' for x in items[1:5]) + '</div></section>')

    def card(x):
        if x['k'] == 'Brand news':
            return (f'<a href="{x["u"]}" data-kind="{x["k"]}" class="bnews"><p class="small gr" style="margin:0 0 6px">Brand news</p><p style="font-weight:500">{E(x["t"])}</p>'
                    f'<p class="small mu" style="margin-top:8px">Source: {E(x["src"])}</p></a>')
        return (f'<a href="{x["u"]}" data-kind="{x["k"]}">' + (f'<div style="aspect-ratio:16/10">{img(x["img"])}</div>' if x['img'] else f'<div class="iph"><span>{E(x["k"])}</span></div>') +
                f'<p class="small gr" style="margin:12px 0 4px">{x["k"]}</p><p style="font-weight:500">{E(x["t"])}</p></a>')
    h += '<section class="w" style="padding-bottom:72px"><div class="g g3" id="ilist" style="row-gap:32px">' + ''.join(card(x) for x in items[5:]) + '</div></section></main>'
    return h + footer() + end()


GROUPS4 = [('Trend', ['trend-to-style', 'rangeboard', 'swatchsmith']),
           ('Design', ['pattern-maker', 'materials-library', 'textile-calculator', 'textile-processing-studio', 'size-chart-builder']),
           ('Specify and cost', ['tech-pack-builder', 'decoration-cost-estimator', 'pricefold', 'evenpoint']),
           ('Produce and sell', ['fit-qc-studio', 'cutclock', 'care-label-generator', 'product-description-writer', 'export-market-checker', 'style-tracker'])]


def plm():
    h = head('PLM, coming soon | Forecut', 'Forecut PLM: one place for every style, from brief to approved sample. Coming soon for signed-in members.') + nav_app('PLM') + '<main id="main">'
    steps = [('Style library', 'Every style brief, pattern and tech pack in one record, with versions.'),
             ('Bill of materials', 'Fabrics, trims and costs pulled in from the Fabric and Trims Library and the Tech Pack.'),
             ('Samples and fittings', 'Track each sample round with Fit and QC Studio notes and photos.'),
             ('Approvals', 'Sign off design, fit, colour and cost, with a clear history of who approved what.'),
             ('Suppliers', 'Keep mills, trim suppliers and makers with each style.'),
             ('Calendar', 'Critical path dates linked to the Production Calendar.')]
    h += ('<section class="sec t"><div class="w"><p class="small gr">Coming soon</p><h1 class="dsp" style="font-size:56px;margin-top:8px">PLM</h1>'
          '<p class="lead" style="max-width:36em;margin-top:14px">One place for every style, from brief to approved sample. It builds on the Forecut tools you already use, so your briefs, patterns, tech packs and costings move in without retyping.</p></div></section>'
          '<section class="w" style="padding-bottom:40px"><div class="g g3" style="gap:20px">' +
          ''.join(f'<div class="box1"><h3>{E(a)}</h3><p class="small gr">{E(b)}</p></div>' for a, b in steps) + '</div></section>'
          '<section class="sec st"><div class="w"><h2 class="dsp" style="font-size:32px">Want early access?</h2><p class="gr" style="margin-top:10px">Email <a class="lk" href="mailto:hello@forecut.in">hello@forecut.in</a> and tell us how your team works today. Meanwhile, the <a class="lk" href="/tools.html">Forecut tools</a> are open to signed-in members.</p></div></section></main>')
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
        f'<a href="/{p["sk"]}-womenswear.html"><div style="aspect-ratio:4/5">{img(p["img"], p["n"])}</div><div style="font-weight:500;margin-top:10px">{E(p["n"])}</div><div class="small gr">{p["s"]}, {p["st"]}</div></a>' for p in pool) + '''</div>
<div class="g split" style="grid-template-columns:3fr 2fr;gap:32px"><div><div class="hd" style="margin-bottom:10px"><h2 class="dsp" style="font-size:28px">My work</h2><a class="lk" href="/tools.html">Open tools</a></div><p class="gr">Styles, tech packs, palettes and patterns you save in the tools.</p></div>
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
/* tools: recently used (same store as the tool pages: {slug, at}) */
window.recentTools=function(){try{var r=JSON.parse(localStorage.getItem('fc-recent-tools')||'[]'),seen={},out=[];r.forEach(function(x){var sl=typeof x==='string'?x:(x&&(x.slug||(x.u&&x.u.replace(/^\/|\.html$/g,''))));if(sl&&!seen[sl]){seen[sl]=1;out.push(sl)}});return out}catch(e){return[]}}
var TN={};document.querySelectorAll('a.tcard,a.tool').forEach(function(a){var sl=a.getAttribute('href').replace(/^\/|\.html$/g,'');var t=a.querySelector('.tt');if(t)TN[sl]=t.textContent});
var rc=document.getElementById('recent');
if(rc){var RT=window.recentTools().filter(function(sl){return TN[sl]}).slice(0,4);if(RT.length){var h='<p class="small gr" style="margin-bottom:10px">Recently used</p><div class="flt">';RT.forEach(function(sl){h+='<a class="ch" href="/'+sl+'.html">'+TN[sl]+'</a>'});rc.innerHTML=h+'</div>'}}
document.querySelectorAll('a.tool,a.tcard').forEach(function(a){a.addEventListener('click',function(){try{var sl=a.getAttribute('href').replace(/^\/|\.html$/g,'');var r=JSON.parse(localStorage.getItem('fc-recent-tools')||'[]').filter(function(x){return (x&&x.slug)!==sl&&x!==sl});r.unshift({slug:sl,at:Date.now()});localStorage.setItem('fc-recent-tools',JSON.stringify(r.slice(0,15)))}catch(e){}})});
/* install Forecut Studio */
var ib=document.getElementById('instStudio'),bip=null;
window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();bip=e});
if(ib){ib.addEventListener('click',function(){var m=document.getElementById('instMsg');if(bip){bip.prompt();bip.userChoice.then(function(){bip=null})}else{m.hidden=false;m.textContent=/iPhone|iPad|Mac/.test(navigator.userAgent)?'In Safari, tap Share, then Add to Home Screen (on a Mac: File, Add to Dock).':'In Chrome or Edge, open the browser menu and choose Install Forecut Studio. If it is already installed, open it from your apps.'}})}
/* greeting + detail of the day + continue reading */
var g=document.getElementById('greet');if(g){var hr=new Date().getHours();g.textContent=(hr<12?'Good morning.':hr<17?'Good afternoon.':'Good evening.')}
var P=window.FC_DOTD;if(P&&P.length){var d=new Date(),i=Math.floor((Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()))/864e5)%P.length,x=P[i];
 document.getElementById('dimg').src=x.src||('/img/'+x.img+'.webp');document.getElementById('dimg').alt=x.n;document.getElementById('dname').textContent=x.n;document.getElementById('dnote').textContent=x.note;document.getElementById('dcat').textContent=x.k;document.getElementById('darea').textContent=x.a;
 document.getElementById('dst').textContent=x.st+' in '+x.s+(x.nx?', '+x.nx+' next season':'');document.getElementById('ddate').textContent='Detail of the day, '+d.toLocaleDateString('en-GB',{day:'numeric',month:'long'});
 var t=/Footwear/.test(x.k)?'footwear':/Menswear/.test(x.k)?'menswear':'womenswear';document.getElementById('dlink').href='/'+x.sk+'-'+t+'.html';}
var rep=document.getElementById('report');
if(rep){try{localStorage.setItem('fc-last-report',JSON.stringify({u:location.pathname,t:document.querySelector('h1').textContent,s:document.title.split(' ')[0]}))}catch(e){}
}
window.addEventListener('hashchange',function(){if(rep&&(location.hash==='#preview'||location.hash==='#member'))location.reload()});
var cl=document.getElementById('contlink');if(cl){try{var lr=JSON.parse(localStorage.getItem('fc-last-report')||'null');if(lr){cl.href=lr.u;document.getElementById('conttitle').textContent=lr.t;document.getElementById('contseason').textContent=lr.s}}catch(e){}}
})();
"""


def detail_ref(name):
    """Season, report topic and photo for a detail name (first season it is in the forecast with a photo)."""
    for k, L in DET.items():
        for it in L:
            if it['name'] != name:
                continue
            for si, s in enumerate(SKEYS):
                if it['life'][si] != '-':
                    p = photo(name, s)
                    if p:
                        dept = k.split('|')[0].lower()
                        t = 'footwear' if dept == 'footwear' else 'knitwear' if k.endswith('|Knitwear') else dept
                        return dict(n=name, k=k.replace('|', ', '), a=it['area'], s=s, st=it['life'][si], img=p, u=f'/{s}-{t}.html', note=it['note'])
    return None


def whats_new(n=12):
    xs = [d for d in (detail_ref(x) for x in NEW) if d][:n]
    if not xs:
        return ''
    return ('<section class="sec"><div class="w"><div class="hd"><div><h2 class="dsp">What’s new</h2><p class="gr" style="margin-top:8px">The newest details from runways, fashion weeks and retail.</p></div><a class="lk" href="/search.html">Search all details</a></div>'
            '<div class="marq"><div class="mtrack">' + ''.join(
                f'<a class="nw" href="{d["u"]}"><span class="nim">{img(d["img"], d["n"])}</span><span class="small gr">{META[d["s"]]["code"]}, <b class="{STAGE[d["st"]][1]}">{STAGE[d["st"]][0].lower()}</b></span>'
                f'<span class="nn">{E(d["n"])}</span><span class="small gr">{E(d["k"])}</span></a>' for d in xs) + '</div></div></div></section>')


def finder(compact=False):
    regs = [('', 'Global')] + [(u, t) for t, u in REGIONS_LINKS[:7]]
    return (f'<section class="{"" if compact else "sec st"}" id="find"><div class="w"><div class="finder">'
            f'<div><h2 class="dsp" style="font-size:{30 if compact else 40}px">Find the forecast you need</h2><p class="gr" style="margin-top:8px">Choose a season and a topic. The report opens ready to read.</p></div>'
            '<form class="fform" id="fform"><label><span>Season</span><select name="s">' + ''.join(f'<option value="{s}"{" selected" if s == NEXT else ""}>{META[s]["code"]}, {E(META[s]["stage"].lower())}</option>' for s in SKEYS) + '</select></label>'
            '<label><span>Topic</span><select name="t">' + ''.join(f'<option value="{k}">{E(t)}</option>' for k, t, _, _ in TOPICS) + '</select></label>'
            '<label><span>Market</span><select name="m">' + ''.join(f'<option value="{u}">{t}</option>' for u, t in regs) + '</select></label>'
            '<button class="btn" type="submit">Open the forecast</button></form>'
            f'<form class="fsearch" action="/search.html" method="get" role="search"><label class="srch" style="width:100%;height:46px;background:#fff">{SEARCH}<input name="q" type="search" placeholder="Or search a detail, fabric or colour, for example puff sleeves" aria-label="Search the forecasts"></label></form>'
            '</div></div></section>')


def colours_ahead():
    cells = ''
    for s in ('ss27', 'aw27', 'ss28'):
        m = META[s]
        cells += (f'<a class="pal3" href="/{s}-colour.html"><span class="strip">' + ''.join(f'<i style="background:{c}" title="{E(n)}, {tcx(c)}"></i>' for c, n in m['palette']) + '</span>'
                  f'<span class="small gr">{m["code"]} palette</span><span class="pn">{E(", ".join(n for _, n in m["palette"][:3]))}</span>'
                  f'<span class="small gr">{E(tcx(m["palette"][0][0]))}, {m["palette"][0][0].upper()} leads</span></a>')
    return ('<section class="sec"><div class="w"><div class="hd"><div><h2 class="dsp">The colours ahead</h2><p class="gr" style="margin-top:8px">Season palettes with Pantone TCX and HEX codes, and how to use them.</p></div><a class="lk" href="/colour.html">Colour forecasts</a></div>'
            f'<div class="g g3">{cells}</div></div></section>')


FEAT = ['pattern-maker', 'tech-pack-builder', 'trend-to-style', 'rangeboard']


def tool_card(t, big=False):
    return (f'<a class="tcard" href="/{t["slug"]}.html" data-q="{E((t["title"] + " " + t["lead"] + " " + t["tags"]).lower())}"><span class="tim2"><img src="/tools/covers/{t["slug"]}-640.webp" alt="" loading="lazy"></span>'
            f'<span class="tt">{E(t["title"].replace("&", "and"))}</span><span class="small gr">{E(t["lead"])}</span>' +
            (f'<span class="tout">{E(t["output"].replace(" · ", ", "))}</span>' if big else '') +
            ('<span class="tsub">' + ''.join(f'<i{" class=soon" if x.endswith("(coming soon)") else ""}>{E(x.replace(" (coming soon)", ""))}{"<em>Soon</em>" if x.endswith("(coming soon)") else ""}</i>' for x in TSUB[t["slug"]]) + '</span>' if big and t['slug'] in TSUB else '') + '</a>')


TSUB = {'trend-to-style': ['Boards', 'Style brief'], 'textile-processing-studio': ['Dye recipe and batch cost', 'Colour blend', 'Processing route', 'Lab dips'],
        'pattern-maker': ['Draft', 'Edit pieces', '3D'], 'fit-qc-studio': ['Fit sessions and QC', '3D vs real sample (coming soon)'],
        'tech-pack-builder': ['Imports your style brief and Garment Studio pieces'], 'pricefold': ['Imports from Garment Studio and Tech Pack'], 'evenpoint': ['Imports from Garment Studio']}


def tool_links():
    N = {'tts': (40, 120, 'Trend to Style', 'Style brief', '/trend-to-style.html'), 'gs': (330, 40, 'Garment Studio', 'Draft, edit, 3D', '/pattern-maker.html'),
         'tp': (330, 200, 'Tech Pack Builder', 'Specs and BOM', '/tech-pack-builder.html'), 'pr': (630, 40, 'Price and Margin', 'Cost and price', '/pricefold.html'),
         'be': (630, 200, 'Break-even', 'Units to profit', '/evenpoint.html')}
    W, H = 220, 64
    L = [('tts', 'gs', 'p'), ('tts', 'tp', 'p'), ('gs', 'tp', 'y'), ('gs', 'pr', 'y'), ('gs', 'be', 'y'), ('tp', 'pr', 'y')]
    col = {'p': '#c2457a', 'y': '#b07a24'}
    svg = '<svg viewBox="0 0 900 340" class="tlinks" role="img" aria-label="How the tools share data"><defs>' + ''.join(
        f'<marker id="ah{k}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="{c}"/></marker>' for k, c in col.items()) + '</defs>'
    for a, b, k in L:
        x1, y1 = N[a][0] + W, N[a][1] + H / 2
        x2, y2 = N[b][0], N[b][1] + H / 2
        if a == 'gs' and b == 'tp':
            x1, y1, x2, y2 = N[a][0] + W / 2, N[a][1] + H, N[b][0] + W / 2, N[b][1]
            d = f'M{x1} {y1}L{x2} {y2 - 2}'
        else:
            mx = (x1 + x2) / 2
            d = f'M{x1} {y1}C{mx} {y1} {mx} {y2} {x2 - 2} {y2}'
        svg += f'<path d="{d}" fill="none" stroke="{col[k]}" stroke-width="2"{" stroke-dasharray=\"6 5\"" if k == "y" else ""} marker-end="url(#ah{k})"/>'
    for k, (x, y, t, sub, u) in N.items():
        svg += f'<a href="{u}"><rect x="{x}" y="{y}" width="{W}" height="{H}" rx="6" fill="#fff" stroke="#1f3d33" stroke-width="1.5"/><text x="{x + 16}" y="{y + 28}" font-size="17" fill="#1c1714">{t}</text><text x="{x + 16}" y="{y + 50}" font-size="13" fill="#6b625b">{sub}</text></a>'
    svg += '</svg>'
    return ('<section class="w tconn" id="connections"><div class="tgh"><h2 class="dsp">How the tools connect</h2><p class="gr">Work moves from one tool to the next, so nothing is typed twice.</p></div>' + svg +
            '<p class="small tleg"><span><i style="background:#c2457a"></i>Shares your style brief</span><span><i style="background:#b07a24"></i>Import from my tools</span></p></section>')


def tools_block(title='Design tools, from trend to finished product', intro='Take a trend to a style brief, a pattern, a tech pack and a cost sheet, all saved to your account.'):
    T = {t['slug']: t for t in TOOLS}
    flow = ''.join(f'<span>{g}</span>' for g, _ in GROUPS4)
    return (f'<section class="sec st"><div class="w"><div class="hd"><div><h2 class="dsp">{title}</h2><p class="gr" style="margin-top:8px">{intro}</p></div><a class="lk" href="/tools.html">All tools</a></div>'
            f'<div class="g g4">{"".join(tool_card(T[s]) for s in FEAT)}</div><div class="flow" aria-label="Tools follow the order a garment is made">{flow}</div></div></section>')


def method_block():
    st = [('e', 'early signals in a few collections. Test in small quantities.'), ('r', 'spreading across designers and retail. Add it now.'),
          ('p', 'at full adoption. Use in core styles, do not over-buy.'), ('f', 'demand is slowing. Phase it out of new development.')]
    return ('<section class="sec"><div class="w"><div class="hd"><div><h2 class="dsp">From market signal to sample-ready insight</h2></div><a class="lk" href="/method.html">How we forecast</a></div>'
            '<div class="g g3 steps">'
            '<div><span class="sn">1</span><h3>Signal collection</h3><p class="gr">Runway coverage, street style, search interest and retail launches across Europe, the Americas, Asia, Africa and Oceania, every week.</p></div>'
            '<div><span class="sn">2</span><h3>Detail-level analysis</h3><p class="gr">Each construction detail, trim and material is identified and placed at a stage: emerging, rising, peaking or fading.</p></div>'
            '<div><span class="sn">3</span><h3>Reports you can use</h3><p class="gr">Design notes, fabric guidance, colour codes and range strategy that help your team sketch, specify and sample faster.</p></div></div>'
            '<div class="stdef">' + ''.join(f'<p><span class="stage {STAGE[k][1]}">{STAGE[k][0]}</span> {E(v)}</p>' for k, v in st) +
            '<p class="small gr">Stages are reviewed monthly; news is checked daily.</p></div></div></section>')


FAQ = [('What is free?', 'Joining is free. Every report opens with a free preview, and signed-in members read the full reports, download the PDFs and use every Forecut tool.'),
       ('How do you make your forecasts?', 'From public runway, trade and retail research, AI-assisted and reviewed by an editor, written in our own words. Each detail is placed at a stage and reviewed every month.'),
       ('Is Forecut only for India?', 'No. Every season starts from the global runways and is read for six regions. India is covered in more depth, with festive and summer seasons, handloom and craft.'),
       ('Can my college or team get access?', 'Yes. Colleges, alumni groups and teams can get an access code for their members. Write to hello@forecut.in.'),
       ('What is in a report PDF?', 'Each report has three PDFs: the full report, inspiration and design, and strategy, pricing and markets. Share only the part a team needs.'),
       ('How do I contact Forecut?', 'Email hello@forecut.in. We reply within a working day.')]


def faq_block():
    return ('<section class="sec st"><div class="w g split" style="grid-template-columns:1fr 2fr;gap:56px"><div><h2 class="dsp" style="font-size:40px">Before you start</h2>'
            '<p class="gr" style="margin-top:10px">Anything else? Write to hello@forecut.in.</p></div><div class="faq">' +
            ''.join(f'<details><summary>{E(q)}</summary><p class="gr">{E(a)}</p></details>' for q, a in FAQ) + '</div></div></section>')


def rising_now(s=NEXT, n=10):
    xs = []
    for t in ('womenswear', 'menswear', 'footwear'):
        for k, it, st, nx in by_stage(items_for(t, s), 'r', s):
            p = photo(it['name'], s)
            if p:
                xs.append((t, k, it, p, nx))
    seen, out = set(), []
    for x in xs:
        if x[2]['name'] not in seen:
            seen.add(x[2]['name']); out.append(x)
    out = out[::max(1, len(out) // n)][:n]
    return (f'<section class="sec"><div class="w"><div class="hd"><div><h2 class="dsp" style="font-size:34px">Rising now in {META[s]["code"]}</h2><p class="gr" style="margin-top:8px">The pieces to build into the range.</p></div><a class="lk" href="/{s}-womenswear.html">Open the reports</a></div>'
            '<div class="hscroll">' + ''.join(
                f'<a class="nw" href="/{s}-{t}.html"><span class="nim">{img(p, it["name"])}</span><span class="small gr">{E(k.replace("|", ", "))}</span><span class="nn">{E(it["name"])}</span>'
                f'<span class="small"><b class="st-r">Rising</b>{(" <span class=gr>then " + STAGE[nx][0].lower() + "</span>") if nx in STAGE else ""}</span></a>' for t, k, it, p, nx in out) + '</div></div></section>')


QUICK = [('trend-to-style', 'Start a style brief'), ('rangeboard', 'Plan a collection'), ('tech-pack-builder', 'Build a tech pack'), ('swatchsmith', 'Make a colour palette')]


def season_track():
    cells = ''.join(f'<a href="/forecasts/{s}/" class="{"now" if s == SKEYS[0] else "nx" if s == NEXT else ""}"><b>{META[s]["code"]}</b><span>{E(META[s]["stage"])}</span><em>{E(META[s]["window"])}</em></a>' for s in SKEYS)
    return f'<div class="strack" aria-label="Where each season is">{cells}</div>'


def wim(keys):
    ks = [k for k in keys if k in IMG][:3]
    return '<div class="wim fade">' + ''.join(f'<span class="wf{" on" if i == 0 else ""}">{img(k)}</span>' for i, k in enumerate(ks)) + '</div>'


def landing():
    h = head('Forecut | Seasonal Fashion Trend Forecasts', 'Seasonal fashion trend forecasts with colour, fabric and detail direction for every season, for designers, brands and fashion schools. Global, with India in depth.').replace('<body>', '<body data-page="landing">', 1) + nav_public() + '<main id="main">'
    h += hero_html() + f'''<section class="sec" id="what"><div class="w">
  <div class="hd"><h2 class="dsp">What we do</h2><p class="gr">Forecut reads runways, retail and fabric fairs, and turns them into reports and tools you can design from.</p></div>
  <div class="g g3">
    <a href="/forecasts/">{wim(['theme-' + NEXT + '-the-waist-returns', 'cover-' + NEXT + '-womenswear', 'cover-aw27-themes'])}<h3 class="dsp" style="margin:18px 0 8px">Seasonal forecasts</h3><p class="gr">Themes, womenswear, menswear, footwear, knitwear, fabrics and trims for every season, from what is in stores now to two years ahead.</p></a>
    <a href="/{NEXT}-colour.html">{wim(['theme-' + NEXT + '-elegant-ease', 'cover-' + NEXT + '-colour', 'cover-aw27-fabrics'])}<h3 class="dsp" style="margin:18px 0 8px">Colour and materials</h3><p class="gr">Palettes with Pantone TCX and HEX codes, fabrics, finishes and trims for each season.</p></a>
    <a href="/tools.html">{wim(['theme-aw27-quiet-structure', 'cover-' + NEXT + '-trims', 'cover-aw27-knitwear'])}<h3 class="dsp" style="margin:18px 0 8px">Design to production tools</h3><p class="gr">Tools that take a trend to a style brief, a pattern, a tech pack and a cost sheet.</p></a>
  </div></div></section>
{whats_new()}
{finder()}
<section class="sec"><div class="w">
  <div class="hd"><div><h2 class="dsp">This season’s reports</h2><p class="gr" style="margin-top:8px">Every report opens with a free preview. Sign up to read it in full and download the PDFs.</p></div><a class="lk" href="/forecasts/">All forecasts</a></div>
  {season_track()}
  <div class="g g4" style="margin-top:28px">{''.join(cover(NEXT, t, locked=True) for t in ['themes', 'colour', 'womenswear', 'trims'])}</div>
</div></section>
{colours_ahead()}
{tools_block()}
<section class="sec"><div class="w g g2 split" style="align-items:center;gap:56px">
  <div style="aspect-ratio:16/11">{img('hero-india', 'Festive wear in India')}</div>
  <div><h2 class="dsp" style="margin-bottom:18px">A global forecast, with India in depth.</h2>
  <p class="lead">Every season starts from the global runways and is read for six regions. Forecut adds what most forecasters leave out: Indian festive and summer seasons, handloom, craft clusters and the colours that sell there.</p>
  <p style="margin-top:24px;display:flex;gap:24px;flex-wrap:wrap"><a class="lk" href="/india.html">See the India forecasts</a><a class="lk" href="/regions.html">All regions</a></p></div>
</div></section>
<section class="sec st" id="services"><div class="w"><div class="hd"><h2 class="dsp">Who it is for</h2><a class="lk" href="/services/">All services</a></div><div class="g g4 who">
  <a href="/services/designers.html"><h3>Designers</h3><p class="gr small">Know what to sketch next, with colours and details you can put straight into a tech pack.</p><span class="lk" style="display:inline-block;margin-top:12px">See the route</span></a>
  <a href="/services/brands.html"><h3>Brands and buyers</h3><p class="gr small">Plan ranges by what is rising, peaking or fading in each market, with price bands for key garments.</p><span class="lk" style="display:inline-block;margin-top:12px">See the route</span></a>
  <a href="/services/fashion-schools.html"><h3>Fashion schools</h3><p class="gr small">Give a whole batch current forecasts and tools for projects and portfolios, with an access code.</p><span class="lk" style="display:inline-block;margin-top:12px">See the route</span></a>
  <a href="/services/students.html"><h3>Students</h3><p class="gr small">Learn to read a forecast and build a collection from it, from mood to tech pack.</p><span class="lk" style="display:inline-block;margin-top:12px">See the route</span></a>
</div></div></section>
{method_block()}
<section class="sec st"><div class="w g split" style="grid-template-columns:1fr 2fr;gap:56px">
  <div><h2 class="dsp" style="font-size:34px">Coming up</h2><p class="gr small" style="margin-top:10px">Dates our next reports follow.</p></div>
  <div>{''.join(f'<a href="{u}" class="cal"><span class="gr">{d.strftime("%-d %b")}</span><span>{E(t)}</span></a>' for d, t, u in coming())}</div>
</div></section>
<section class="sec"><div class="w">
  <div class="hd"><h2 class="dsp">Read the analysis</h2><a class="lk" href="/insights.html">All insights</a></div>
  <div class="g g3">{''.join(f'<a href="/{a["slug"]}.html">' + (f'<div style="aspect-ratio:16/10">{img(art_img(a))}</div>' if art_img(a) else '') + f'<p class="small gr" style="margin:14px 0 4px">{art_kind(a)}{(", " + dt.date.fromisoformat(a["date"]).strftime("%-d %b")) if a.get("date") else ""}</p><h3 class="dsp" style="font-size:21px">{E(a["title"])}</h3></a>' for a in ARTS[:3])}</div>
</div></section>
{faq_block()}
<section class="cta"><div class="w cta2"><div><h2 class="dsp" style="font-size:40px">Start with {META[NEXT]['code']}. It is free to join.</h2><p style="margin-top:8px;color:#c9d3cd">Full reports, PDFs and every tool with one free account.</p></div>
  <a class="btn" style="background:var(--pa);color:var(--fg);border-color:var(--pa)" href="/account.html#signup">Sign up free</a></div></section>
</main>'''
    return h + footer() + end()


def home():
    pool = detail_pool()
    T = {t['slug']: t for t in TOOLS}
    h = head('Home | Forecut', 'Your Forecut start page.').replace('</head>', "<script>window.FC_PRIVATE=1;try{if(localStorage.getItem('fc-in')!=='1')location.replace('/')}catch(e){}</script></head>").replace('content="index,follow"', 'content="noindex,follow"') + nav_app('Home') + '<main id="main">'
    h += f'''<section class="sec t"><div class="w hhead"><div><h1 class="dsp" style="font-size:44px" id="greet">Welcome back.</h1>
<p class="gr" style="margin-top:8px">New this week: {E(', '.join(NEW[:2]))} and more in the {META[NEXT]['code']} reports.</p></div>
<form class="fsearch" action="/search.html" method="get" role="search" style="width:min(420px,100%)"><label class="srch" style="width:100%;height:46px">{SEARCH}<input name="q" type="search" placeholder="Search a detail, fabric or colour" aria-label="Search the forecasts"></label></form></div>
<div class="w quick">{''.join(f'<a href="/{s}.html"><span class="qim"><img src="/tools/covers/{s}-640.webp" alt="" loading="lazy"></span><span>{E(lbl)}</span></a>' for s, lbl in QUICK)}</div></section>
<section class="w g split" style="grid-template-columns:2fr 1fr;gap:24px;padding-bottom:48px">
  <div id="dotd" class="split" style="display:grid;grid-template-columns:1fr 1fr;background:var(--st)">
    <div style="aspect-ratio:4/5;overflow:hidden"><img id="dimg" src="/img/{pool[0]['img']}.webp" alt=""></div>
    <div style="padding:28px;display:flex;flex-direction:column"><p class="small gr" id="ddate">Detail of the day</p>
      <h2 class="dsp" style="font-size:32px;margin:10px 0 14px" id="dname">{E(pool[0]['n'])}</h2>
      <p class="gr small" id="dnote">{E(pool[0]['note'])}</p>
      <div style="margin:18px 0;display:grid;gap:8px" class="small"><div><b style="font-weight:500">Category:</b> <span id="dcat">{E(pool[0]['k'])}</span></div>
      <div><b style="font-weight:500">Stage:</b> <span id="dst"></span></div><div><b style="font-weight:500">Detail type:</b> <span id="darea">{E(pool[0]['a'])}</span></div></div>
      <div style="margin-top:auto;display:flex;gap:10px;flex-wrap:wrap"><a class="btn s" id="dlink" href="/{pool[0]['sk']}-womenswear.html">Open the report</a><a class="btn s o" href="/trend-to-style.html">Turn it into a brief</a></div></div></div>
  <div style="display:flex;flex-direction:column;gap:24px">
    <div class="box1" id="cont"><h3>Continue reading</h3>
      <a href="/{NEXT}-colour.html" id="contlink" style="display:grid;grid-template-columns:120px 1fr;gap:14px;align-items:center"><div class="mini">{cover_art(NEXT, 'colour')}</div><div><div class="small gr" id="contseason">{META[NEXT]['code']}</div><div id="conttitle">Colour forecast</div></div></a></div>
    <div class="box1"><h3>Coming up</h3>{''.join(f'<a href="{u}" class="cal sm"><span class="gr">{d.strftime("%-d %b")}</span><span>{E(t)}</span></a>' for d, t, u in coming(4))}</div>
  </div></section>
<section class="w" style="padding-bottom:8px"><div class="hd" style="margin-bottom:16px"><div><h2 class="dsp" style="font-size:34px">Where each season is</h2><p class="gr" style="margin-top:8px">Trend mix, the markets reading it most strongly and the pieces to back, season by season.</p></div><a class="lk" href="/regions.html">Markets</a></div>{season_board()}</section>
{rising_two()}
<section class="sec st"><div class="w"><div class="hd"><h2 class="dsp" style="font-size:34px">{META[NEXT]['code']} reports</h2><a class="lk" href="/forecasts/">All forecasts</a></div>
  <div class="g g4">{''.join(cover(NEXT, t) for t in ['trims', 'womenswear', 'footwear', 'fabrics'])}</div></div></section>
<section class="sec"><div class="w g g2 split" style="gap:40px">
  <div><div class="hd" style="margin-bottom:14px"><h2 class="dsp" style="font-size:28px">Saved details</h2></div><div id="saved" class="saved"><p class="gr">Save any detail from a report and it will wait for you here. Open a piece in a report and choose Save detail.</p></div></div>
  <div><div class="hd" style="margin-bottom:14px"><h2 class="dsp" style="font-size:28px">Your tools</h2><a class="lk" href="/tools.html">All tools</a></div><div id="mytools" class="mytools">{''.join(f'<a href="/{s}.html"><b>{E(T[s]["title"].replace("&", "and"))}</b><span class="small gr">{E(T[s]["lead"])}</span></a>' for s in FEAT)}</div></div>
</div></section>
{colours_ahead()}
{finder(compact=True)}
<section class="sec"><div class="w"><div class="hd"><h2 class="dsp" style="font-size:34px">Latest insights</h2><a class="lk" href="/insights.html">All insights</a></div>
  <div class="g g3">{''.join(f'<a href="/{a["slug"]}.html" style="display:grid;grid-template-columns:110px 1fr;gap:16px">' + (f'<div style="aspect-ratio:1">{img(art_img(a))}</div>' if art_img(a) else '<div></div>') + f'<div><p class="small gr">{art_kind(a)}</p><p style="font-weight:500;margin-top:4px">{E(a["title"])}</p></div></a>' for a in ARTS[:3])}</div></div></section>
</main>'''
    data = json.dumps(pool, ensure_ascii=False).replace('</', '<\\/')
    tj = json.dumps({t['slug']: [t['title'].replace('&', 'and'), t['lead']] for t in TOOLS}, ensure_ascii=False).replace('</', '<\\/')
    return h + footer() + end(f'<script>window.FC_DOTD={data};window.FC_TOOLS={tj}</script>')


GROUP_TXT = {'Trend': 'Turn a forecast into a brief, a collection plan and a colour story.',
             'Design': 'Draft patterns, choose materials and grade sizes.',
             'Specify and cost': 'Write the tech pack and work out what it costs and what to charge.',
             'Produce and sell': 'Run fittings, plan production, label it and list it.'}


def tools():
    T = {t['slug']: t for t in TOOLS}
    h = head('Fashion Design and Production Tools | Forecut', 'Free fashion tools in the order a garment is made: trend briefs, collection plans, colour palettes, patterns, tech packs, costing, production and export.').replace('href="/site.webmanifest"', 'href="/studio.webmanifest"') + nav_app('Tools') + '<main id="main">'
    h += f'''<section class="thero"><div class="w"><div class="thtop"><div><h1 class="dsp">Tools</h1><p class="lead">Your design studio, from trend to finished product. Pick up a brief, a pattern or a tech pack where you left it: your work saves to your account and opens on any device.</p></div>
<div class="inst"><button class="btn" type="button" id="instStudio">Install Forecut Studio</button><a class="btn o2" href="/pattern-maker.html#install">Install Garment Studio</a><p class="small" id="instMsg" hidden></p></div></div>
<ol class="tsteps">{''.join(f'<li><a href="#{islug(g)}"><b>{g}</b><span>{E(GROUP_TXT[g])}</span></a></li>' for g, _ in GROUPS4)}</ol></div></section>
<section class="w" style="padding-top:28px" id="recent"></section>'''
    for g, sl in GROUPS4:
        h += (f'<section class="w tgrp" id="{islug(g)}"><div class="tgh"><h2 class="dsp">{g}</h2><p class="gr">{E(GROUP_TXT[g])}</p></div>'
              f'<div class="g g3 tgrid">{"".join(tool_card(T[s], big=True) for s in sl)}</div></section>')
    h += '''<p class="w gr hide" id="tnone" style="padding:20px 40px">No tool matches. Try another word.</p>
''' + tool_links() + '''<section class="sec st" style="margin-top:56px"><div class="w g g2 split" style="gap:48px;align-items:center">
<div><h2 class="dsp" style="font-size:34px">Works with the forecasts</h2><p class="gr" style="margin-top:12px">Open any detail in a report and send it to Trend to Style. The brief carries into the tech pack, and the tech pack into costing, so nothing is typed twice.</p>
<p style="margin-top:20px;display:flex;gap:20px;flex-wrap:wrap"><a class="lk" href="/forecasts/">Open the forecasts</a><a class="lk" href="/trend-to-style.html">Start a style brief</a></p></div>
<div class="box1"><h3>Use it like an app</h3><p class="gr small">Add Forecut Studio to your phone or desktop: open this page in Chrome or Safari and choose Install, or Add to Home Screen. Your saved work stays on the device and syncs to your account.</p></div>
</div></section></main>'''
    return h + footer() + end()


# ------------------------------------------------------------ chapter pages: one page per theme, colour, category or detail group
DM_HTML = '''<div class="dm" id="dm" role="dialog" aria-modal="true" aria-labelledby="dmn" hidden><div class="dmb" data-close></div><div class="dmc" tabindex="-1">
<button class="dmx" type="button" data-close aria-label="Close">Close</button><div class="dmi"><img alt="" id="dmimg"></div>
<div class="dmt"><p class="small gr" id="dmk"></p><h2 class="dsp" id="dmn"></h2><p id="dmnote"></p>
<div class="dmrow"><span class="stage" id="dmst"></span><span class="small gr" id="dmnx"></span></div>
<h3>Trend curve</h3><div class="tcurve" id="dmcurve"></div>
<h3>Across the seasons</h3><div class="dmlc" id="dmlc"></div>
<div class="dmgrid"><section><h3>Design notes</h3><ul id="dmd"></ul></section><section><h3>Fabric and trims</h3><p class="gr" id="dmf"></p></section><section><h3>Where to use it</h3><p class="gr" id="dmu"></p></section><section id="dmth"></section></div>
<div class="dmact"><button class="btn s" type="button" id="dmsave">Save detail</button><a class="btn s o" id="dmpin" target="_blank" rel="noopener">Pin it</a></div><div class="dmsend"><span class="small gr">Send to</span><button type="button" class="btn s o" data-send="board">Board</button><button type="button" class="btn s o" data-send="brief">Style brief</button><button type="button" class="btn s o" data-send="plan">Collection Planner</button></div>
<div class="dmnav"><button type="button" id="dmprev">Previous</button><button type="button" id="dmnext">Next</button></div></div></div></div>'''

FAB_GROUPS = [('Fabrics', {'Fabric', 'Material'}), ('Finishes and washes', {'Finish', 'Wash'}), ('Prints and patterns', {'Print', 'Pattern'}), ('Texture', {'Texture'})]
TRIM_GROUPS = [('Collars and necklines', {'Collar', 'Neckline', 'Lapel', 'Placket'}), ('Closures and hardware', {'Closure', 'Hardware'}), ('Pockets', {'Pocket'}),
               ('Seams, hems and pleats', {'Seam', 'Stitch', 'Edge', 'Hem', 'Pleat'}), ('Trims and embellishment', {'Trim', 'Embellishment', 'Perforation', 'Detail'}),
               ('Cuffs, straps and linings', {'Cuff', 'Strap', 'Lining'})]


def hex_rgb(hx):
    h = (hx or '#888888').lstrip('#')
    if len(h) == 3:
        h = ''.join(c * 2 for c in h)
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def cdist(a, b):
    return sum((x - y) ** 2 for x, y in zip(hex_rgb(a), hex_rgb(b))) ** .5


def chapters(s, topic):
    """(slug, title, kind, key) for each chapter page of a report."""
    si = SKEYS.index(s)
    out = []
    if topic == 'themes':
        for t in META[s]['themes']:
            out.append((f'{s}-theme-{islug(t[0])}', t[0], 'theme', t[0]))
    elif topic == 'colour':
        return colour_chapters(s)
    elif topic in ('womenswear', 'menswear', 'footwear'):
        for k in DET:
            if k.split('|')[0].lower() == topic and any(it['life'][si] != '-' for it in DET[k]):
                out.append((f'{s}-{topic}-{islug(k.split("|")[1])}', k.split('|')[1], 'cat', k))
    elif topic == 'knitwear':
        for k in ('Womenswear|Knitwear', 'Menswear|Knitwear'):
            if any(it['life'][si] != '-' for it in DET.get(k, [])):
                out.append((f'{s}-{k.split("|")[0].lower()}-knitwear', ('Women\'s' if k.startswith('W') else 'Men\'s') + ' knitwear', 'cat', k))
    else:
        for g, areas in (FAB_GROUPS if topic == 'fabrics' else TRIM_GROUPS):
            if any(it['area'] in areas and it['life'][si] != '-' for L in DET.values() for it in L):
                out.append((f'{s}-{topic}-{islug(g)}', g, 'area', g))
    return out


def ch_items(s, topic, kind, key):
    si = SKEYS.index(s)
    allx = season_items(s)
    if kind == 'theme':
        return [x for x in allx if key in theme_hits(s, x[1])]
    if kind == 'cat':
        return [x for x in allx if x[0] == key]
    if kind == 'area':
        areas = dict(FAB_GROUPS + TRIM_GROUPS)[key]
        return [x for x in allx if x[1]['area'] in areas]
    # colour: pieces of the themes that lead with this colour, else pieces that name it
    nm = next((n for c, n in META[s]['palette'] if c == key), '')
    words = [w for w in nm.lower().replace('-', ' ').split() if len(w) > 3]
    named = [x for x in allx if any(w in (x[1]['name'] + ' ' + x[1]['note']).lower() for w in words)]
    ths = [t[0] for t in META[s]['themes'] if min(cdist(t[3], key), cdist(t[4], key)) < 90]
    viath = [x for x in allx if set(theme_hits(s, x[1])) & set(ths)]
    seen, out = set(), []
    for x in named + viath:
        if x[1]['name'] not in seen:
            seen.add(x[1]['name']); out.append(x)
    return out


def item_btns(s, grp, data, colour):
    nxt = si1 = SKEYS.index(s) + 1
    h = ''
    for k, it, stg, nx in grp:
        p = photo(it['name'], s)
        i = len(data)
        ds = DESCMOD.build(k.split('|')[0], k.split('|')[1], it)
        data.append({'n': it['name'], 'k': k.replace('|', ', '), 'a': it['area'], 'note': it['note'], 'l': it['life'], 'st': stg, 'th': theme_hits(s, it),
                     'o': ds['o'], 'd': ds['d'], 'f': ds['f'], 'u': ds['u'], 'p': p or ''})
        nxl = ('Next season: ' + STAGE[nx][0].lower()) if nx in STAGE else ('Leaves the forecast next season' if si1 < 5 else '')
        h += (f'<button type="button" class="item" data-i="{i}"><span class="ph{"" if p else " none"}"' + ('' if p else f' style="background:{colour};color:{"#000" if lum(colour) > .55 else "#fff"}"') + '>' +
              (img(p, it['name']) if p else f'<em>{E(it["area"])}</em>') + '</span>'
              f'<span class="h4">{E(it["name"])}</span><span class="p">{E(k.replace("|", ", "))}, {E(it["area"].lower())}</span>'
              f'<span class="lab"><span class="stage {STAGE[stg][1]}">{STAGE[stg][0]}</span> <span class="gr">{nxl}</span></span></button>')
    return h


def lc_table(s, key):
    si = SKEYS.index(s)
    h = ('<div class="lcwrap"><table class="lct"><thead><tr><th scope="col">Piece</th>' +
         ''.join(f'<th scope="col"{" class=now" if j == si else ""}>{META[k2]["code"]}' + ('<em class="nowp">Now</em>' if j == si else '') + '</th>' for j, k2 in enumerate(SKEYS)) + '</tr></thead><tbody>')
    for ri, (k, it, st, nx) in enumerate(key):
        p = photo(it['name'], s)
        h += (f'<tr><th scope="row"><span class="th">{img(p, "") if p else ""}</span>{E(it["name"])}</th>' +
              ''.join(f'<td class="c-{c if c != "-" else "n"}{" now" if j == si else ""}" style="--i:{ri};--j:{j}"><span>{STAGE[c][0] if c in STAGE else ""}</span></td>' for j, c in enumerate(it['life'])) + '</tr>')
    return h + '</tbody></table></div><p class="small gr lckey"><i class="c-e"></i>Emerging <i class="c-r"></i>Rising <i class="c-p"></i>Peaking <i class="c-f"></i>Fading</p>'


def ch_card(s, slug, title, kind, key, topic):
    if topic == 'colour':
        return ccard(s, slug, title, kind, key)
    if kind == 'colour':
        fg = '#000' if lum(key) > .55 else '#fff'
        return (f'<a class="chc" href="/{slug}.html"><span class="chim" style="background:{key};color:{fg}"><em>{E(tcx(key))}<br>{key.upper()}</em></span>'
                f'<span class="cht">{E(title)}</span><span class="small gr">Colour story</span></a>')
    if kind == 'theme':
        tk = f'theme-{s}-{islug(key)}'
        im = img(tk, title) if tk in IMG else ''
        sub = 'Theme story'
    else:
        its = ch_items(s, topic, kind, key)
        ps = [photo(x[1]['name'], s) for x in by_stage(its, 'r', s) + by_stage(its, 'p', s) + by_stage(its, 'e', s)]
        ps = [p for p in ps if p]
        im = img(ps[0], title) if ps else ''
        sub = 'Detailed report'
    return f'<a class="chc" href="/{slug}.html"><span class="chim">{im}</span><span class="cht">{E(title)}</span><span class="small gr">{sub}</span></a>'


def chapters_block(s, topic):
    chs = chapters(s, topic)
    if not chs:
        return ''
    lbl = {'themes': 'Each theme in full', 'colour': 'Each colour in full'}.get(topic, 'Open a detailed report')
    return (f'<section class="w chs" id="chapters"><div class="hd" style="margin-bottom:16px"><h2 class="dsp" style="font-size:30px">{lbl}</h2></div>'
            f'<div class="chg">' + ''.join(ch_card(s, sl, t, kd, ky, topic) for sl, t, kd, ky in chs) + '</div></section>')


def chapter(s, topic, slug, title, kind, key):
    m = META[s]
    si = SKEYS.index(s)
    its = ch_items(s, topic, kind, key)
    R_ = by_stage(its, 'r', s); Em = by_stage(its, 'e', s); Pk = by_stage(its, 'p', s); Fd = by_stage(its, 'f', s)
    nxt = META[SKEYS[si + 1]]['code'] if si + 1 < 5 else None
    tname = TOPIC[topic][1]
    th_rows = related_themes(s, its) if kind != 'theme' else [t for t in m['themes'] if t[0] == key]
    colour = topic_colour(s, topic)[0] if kind != 'colour' else key
    # ---------------- header
    if kind == 'theme':
        t = th_rows[0]; th = THEMES.get(f'{s}|{key}', {})
        tk = f'theme-{s}-{islug(key)}'
        hero = img(tk, key) if tk in IMG else ''
        lead = th.get('story', t[1])
        sub = 'Theme story'
        desc = f'{m["code"]} theme: {lead}'
    elif kind == 'colour':
        nm = title
        fg = '#000' if lum(key) > .55 else '#fff'
        r, g, b = hex_rgb(key)
        cc = cfind(s, key) or {}
        hero = f'<div class="chsw" style="background:{key};color:{fg}"><b>{E(nm)}</b><span>Pantone {E(cc.get("tcx", tcx(key)))} {E(cc.get("pantone", ""))}</span><span>{key.upper()}</span><span>RGB {r}, {g}, {b}</span></div>'
        lead_th = [t for t in m['themes'] if min(cdist(t[3], key), cdist(t[4], key)) < 90]
        cc = cfind(s, key) or {}
        lead = ((ROLE_NAME.get(cc.get('role'), '') + ' colour. ') if cc.get('role') else '') + (cc.get('note') or '') + (f' It carries {", ".join(t[0] for t in lead_th[:3])} in {m["code"]}.' if lead_th else '')
        sub = 'Colour story'
        desc = f'{m["code"]} colour forecast: {nm}, {tcx(key)}, {key.upper()}.'
    else:
        ps = [photo(x[1]['name'], s) for x in R_ + Pk + Em]
        ps = [p for p in ps if p]
        hero = img(ps[0], title) if ps else ''
        lead = (f'Build around {names(R_, 3)}.' if R_ else f'Lead with {names(Pk, 3)}.' if Pk else f'Test {names(Em, 3)}.' if Em else '') + f' {m["intro"]}'
        sub = f'{tname}, detailed report'
        desc = f'{m["code"]} {title.lower()} forecast: {lead}'
    h = head(f'{m["code"]} {title} | Forecut', desc[:300]) + nav_app('Forecasts') + '<main id="main">'
    h += f'<div class="w crumb"><a href="/forecasts/">Forecasts</a> / <a href="/forecasts/{s}/">{m["code"]}</a> / <a href="/{report_slug(s, topic)}.html">{E(tname)}</a> / {E(title)}</div>'
    h += (f'<section class="w rhead"><div class="chhero">{hero}</div><div class="rinfo"><p class="small gr">{E(m["title"])}, {E(m["stage"].lower())}. {E(sub)}</p>'
          f'<h1 class="dsp">{E(title)}</h1><p class="lead">{E(lead)}</p>'
          f'<div class="ctas"><a class="btn" href="#pieces">See the pieces</a><a class="btn o" href="/{report_slug(s, topic)}.html#downloads">Report PDFs</a></div>'
          f'<p class="small gr">Updated {TODAY.strftime("%-d %B %Y")}.</p></div></section>')
    secs = [('story', 'Story'), ('pieces', 'Key pieces'), ('development', 'How it develops'), ('notes', 'Design notes'), ('colour', 'Colour'), ('strategy', 'Strategy and price'), ('more', 'More')]
    h += '<nav class="rnav" aria-label="On this page"><div class="w">' + ''.join(f'<a href="#{a}">{t}</a>' for a, t in secs) + '</div></nav>'
    body = ''
    # ---------------- story
    body += '<section class="rs" id="story"><div class="rsh"><h2 class="dsp">The story</h2><p class="gr">What is behind it, and where it was seen.</p></div>'
    for t in th_rows[:3]:
        th = THEMES.get(f'{s}|{t[0]}', {})
        tk = f'theme-{s}-{islug(t[0])}'
        solo = kind == 'theme'
        body += (f'<article class="insp{" solo" if solo else ""}">' + ('' if solo else f'<div class="ip" style="background:{t[3]}">' + (img(tk, t[0]) if tk in IMG else '') + '</div>') + '<div>'
                 f'<h3 class="dsp">{E(t[0])}</h3><p>{E(th.get("story", t[1]))}</p>' +
                 (f'<h4>Why now</h4><p class="gr">{E(th["why"])}</p>' if th.get('why') else '') +
                 (f'<h4>Seen at</h4><ul class="ul gr">' + ''.join(f'<li><b style="font-weight:500;color:var(--ink)">{E(b[0])}</b>: {E(b[1])}</li>' for b in th['brands'][:6]) + '</ul>' if th.get('brands') else '') +
                 f'<h4>Key pieces</h4><p class="gr">{E(", ".join(t[6]))}; {E(t[5].lower())}.</p>' +
                 (f'<p class="small mu" style="margin-top:10px">Source: {E(th["src"])}</p>' if th.get('src') else '') + '</div></article>')
    moodx = [x for x in R_ + Pk + Em if photo(x[1]['name'], s)][:5]
    if len(moodx) >= 3:
        body += '<h3 class="sub">Moodboard</h3><div class="mood">' + ''.join(f'<figure>{img(photo(x[1]["name"], s), x[1]["name"])}<figcaption>{E(x[1]["name"])}</figcaption></figure>' for x in moodx) + '</div>'
    body += '</section>'
    # ---------------- pieces
    data = []
    body += f'<section class="rs" id="pieces"><div class="rsh"><h2 class="dsp">Key pieces</h2><p class="gr">Select any piece for its design notes, trend curve and lifecycle.</p></div>'
    stxt = {'e': 'New ideas to test in small quantities.', 'r': 'Growing fast: build these into the range.', 'p': 'At their height: sell through, do not add depth.', 'f': 'Moving out: reduce or rework.'}
    for st, grp in (('r', R_), ('e', Em), ('p', Pk), ('f', Fd)):
        if grp:
            body += f'<div class="stg"><h3 class="dsp">{STAGE[st][0]} in {m["code"]}</h3><p class="gr">{stxt[st]}</p></div><div class="g g4 items">{item_btns(s, grp, data, colour)}</div>'
    if not its:
        body += '<p class="gr">Pieces for this story are added as the season is tracked.</p>'
    body += '</section>'
    # ---------------- development
    body += f'<section class="rs" id="development"><div class="rsh"><h2 class="dsp">How it develops</h2><p class="gr"><span class="live"><i></i>Live forecast, updated {TODAY.strftime("%-d %B %Y")}</span><br>Each piece across the five seasons.</p></div>'
    if kind == 'colour':
        body += '<div class="cdev">' + ''.join(
            f'<div class="crow{" now" if j == si else ""}"><span>{META[k2]["code"]}<em>{E(min(META[k2]["palette"], key=lambda p: cdist(p[0], key))[1])}</em></span><div>' +
            ''.join(f'<i style="background:{c};{"outline:3px solid var(--ink);outline-offset:-3px;flex:2" if c == min(META[k2]["palette"], key=lambda p: cdist(p[0], key))[0] else ""}" title="{E(n)}, {tcx(c)}"></i>' for c, n in META[k2]['palette']) + '</div></div>' for j, k2 in enumerate(SKEYS)) + '</div>'
        body += f'<p class="gr" style="margin-top:14px">The closest colour in each season is outlined, so you can follow {E(title.lower())} from season to season.</p>'
    key_its = [x for x in R_ + Pk + Em + Fd if photo(x[1]['name'], s)][:12] + [x for x in R_ + Pk + Em + Fd if not photo(x[1]['name'], s)][:2]
    if key_its:
        body += lc_table(s, key_its)
    body += '</section>'
    # ---------------- design notes
    body += '<section class="rs" id="notes"><div class="rsh"><h2 class="dsp">Design notes</h2><p class="gr">How to put the leading pieces into a range.</p></div><div class="notes">'
    for k, it, st, nx in [x for x in R_ + Pk + Em if photo(x[1]['name'], s)][:6] or (R_ + Pk + Em)[:6]:
        p = photo(it['name'], s)
        ds = DESCMOD.build(k.split('|')[0], k.split('|')[1], it)
        body += (f'<article class="note1"><div class="nim2">{img(p, it["name"]) if p else ""}</div><div><p class="small gr">{E(k.replace("|", ", "))}, <b class="{STAGE[st][1]}">{STAGE[st][0].lower()}</b></p>'
                 f'<h3 class="dsp">{E(it["name"])}</h3><p>{E(ds["o"])}</p><div class="g g3 split" style="gap:20px;margin-top:14px"><div><h4>Design notes</h4><ul class="ul small gr">' +
                 ''.join(f'<li>{E(x)}</li>' for x in ds['d']) + f'</ul></div><div><h4>Fabric and trims</h4><p class="small gr">{E(ds["f"])}</p></div><div><h4>Where to use it</h4><p class="small gr">{E(ds["u"])}</p></div></div></div></article>')
    body += '</div></section>'
    # ---------------- colour
    pal = m['palette']
    if kind == 'colour':
        tints = ''.join(f'<i style="background:rgb({",".join(str(int(c + (255 - c) * f)) for c in hex_rgb(key))})" title="Tint"></i>' for f in (0, .25, .5, .75)) + ''.join(
            f'<i style="background:rgb({",".join(str(int(c * f)) for c in hex_rgb(key))})" title="Shade"></i>' for f in (.75, .5))
        pairs = [p for p in pal if p[0] != key]
        body += (f'<section class="rs" id="colour"><div class="rsh"><h2 class="dsp">Colour</h2><p class="gr">Codes, tints and the pairings that work this season.</p></div>'
                 f'<div class="tints">{tints}</div><p class="small gr" style="margin:8px 0 26px">From light tint to deep shade, for knits, prints and accessories.</p><h3 class="sub">Pairs well with</h3><div class="g g3 pairs">' +
                 ''.join(f'<div><div class="tpair"><div style="background:{key}"></div><div style="background:{c}"></div></div><p style="font-weight:500;margin-top:10px">With {E(n.lower())}</p><p class="small gr">{tcx(c)}, {c.upper()}</p></div>' for c, n in pairs[:6]) + '</div></section>')
    else:
        body += (f'<section class="rs" id="colour"><div class="rsh"><h2 class="dsp">Colour</h2><p class="gr">The {m["code"]} palette, with Pantone TCX and HEX codes.</p></div><div class="cstrip">' +
                 ''.join(f'<a href="/{s}-colour-{islug(nm)}.html"><span style="background:{hx}"></span><b>{E(nm)}</b><em>{tcx(hx)}<br>{hx.upper()}</em></a>' for hx, nm in pal) + '</div>' +
                 '<div class="g g3" style="gap:20px;margin-top:24px">' + ''.join(f'<p class="small"><b style="font-weight:500">{E(t[0])}:</b> <span class="gr">{E(tcx(t[3]))} with {E(tcx(t[4]))}, for {E(t[5].lower())}.</span></p>' for t in th_rows[:3]) + '</div></section>')
    # ---------------- strategy and price
    cols = [('Build depth', 'Rising', R_), ('Test small', 'Emerging', Em), ('Sell through', 'Peaking', Pk), ('Exit or rework', 'Fading', Fd)]
    body += '<section class="rs" id="strategy"><div class="rsh"><h2 class="dsp">Strategy and price</h2><p class="gr">What to build, test, sell through and drop, with price bands.</p></div><div class="g g4 strat">' + ''.join(
        f'<div><h3>{a}</h3><p class="small gr">{b} pieces</p><ul>' + (''.join(f'<li>{E(x[1]["name"])}</li>' for x in g[:6]) or '<li class="gr">Nothing at this stage</li>') + '</ul></div>' for a, b, g in cols) + '</div>'
    acts = [a for t in th_rows[:3] for a in THEMES.get(f'{s}|{t[0]}', {}).get('actions', [])]
    if acts:
        body += '<h3 class="sub">Actions</h3><ul class="ul acts">' + ''.join(f'<li>{E(a)}</li>' for a in acts[:6]) + '</ul>'
    tabs = ''
    for t in th_rows[:2]:
        th = THEMES.get(f'{s}|{t[0]}', {})
        if th.get('prices'):
            tabs += (f'<div class="ptab"><h3>{E(t[0])}</h3><table><thead><tr><th scope="col">Key garment</th><th scope="col">Value</th><th scope="col">Mid</th><th scope="col">Premium</th></tr></thead><tbody>' +
                     ''.join(f'<tr><th scope="row">{E(r[0])}</th><td>₹{E(r[1])}</td><td>₹{E(r[2])}</td><td>₹{E(r[3])}</td></tr>' for r in th['prices']) + '</tbody></table>' +
                     (f'<p class="small" style="margin-top:12px"><b style="font-weight:500">Cost level: {E(th["cost"][0].lower())}.</b> <span class="gr">{E(th["cost"][1])}</span></p>' if th.get('cost') else '') + '</div>')
    if tabs:
        body += f'<h3 class="sub">Price bands in ₹ (India), a planning guide</h3><div class="g g2 split" style="gap:32px">{tabs}</div>'
    body += '</section>'
    # ---------------- more
    others = [c for c in chapters(s, topic) if c[0] != slug]
    body += (f'<section class="rs" id="more"><div class="rsh"><h2 class="dsp">More in {E(tname.lower())}</h2><p class="gr"><a class="lk" href="/{report_slug(s, topic)}.html">Back to the full {m["code"]} report</a></p></div>'
             f'<div class="chg">' + ''.join(ch_card(s, sl, t, kd, ky, topic) for sl, t, kd, ky in others) + '</div></section>')
    h += f'''<div class="w gate hide" id="gate"><h2 class="dsp" style="font-size:32px">Read the full story free</h2><p class="gr" style="margin:12px 0 22px">Sign up to read every section and download the PDFs. It takes under a minute.</p><a class="btn" href="/account.html#signup">Sign up free</a> <a class="btn o" href="/account.html#signin" style="margin-left:8px">Log in</a></div>
<div class="w" id="report">{body}<p class="small gr src">Sources: {E(m.get("sources", ""))}</p></div></main>''' + DM_HTML
    dj = json.dumps({'items': data, 'seasons': [META[k2]['code'] for k2 in SKEYS], 'si': si}, ensure_ascii=False).replace('</', '<\\/')
    return h + footer() + end(f'<script>window.FC_ITEMS={dj}</script>')


# ------------------------------------------------------------ home: where each season is, with charts
def season_board():
    import regions_data as RD
    cards = ''
    for j, s in enumerate(SKEYS):
        si = j
        its = season_items(s)
        mix = {k: sum(1 for x in its if x[2] == k) for k in 'erpf'}
        mx = max(mix.values()) or 1
        bars = ''.join(f'<span class="b c-{k}" style="--h:{max(6, round(100 * mix[k] / mx))}%;--k:{n}" title="{STAGE[k][0]}"><i></i><em>{STAGE[k][0][:4]}</em></span>' for n, k in enumerate('erpf'))
        hot = [x for x in its if x[2] in ('r', 'p')]
        sc = []
        for r in RD.REGIONS:
            v = sum(1 for x in hot if any(b in x[1]['name'].lower() for b in r['boost'])) + 2 * len(r['dir'].get(s, []))
            sc.append((v, r))
        sc.sort(key=lambda x: -x[0])
        top = sc[:3]
        tm = max(1, top[0][0])
        mk = ''.join(f'<a href="/region-{r["slug"]}.html" class="mkr" style="--w:{max(12, round(100 * v / tm))}%"><span>{E(r["name"])}</span><i></i></a>' for v, r in top)
        best = by_stage([x for x in its if photo(x[1]['name'], s)], 'p' if j == 0 else 'r', s)[:2]
        lab = 'Selling best now' if j == 0 else 'Pieces to back'
        bp = ''.join(f'<a href="/{s}-{("footwear" if x[0].startswith("Footwear") else x[0].split("|")[0].lower())}.html" class="bp"><span>{img(photo(x[1]["name"], s), x[1]["name"])}</span><em>{E(x[1]["name"])}</em></a>' for x in best)
        cards += (f'<div class="sb{" now" if j == 0 else ""}{" nx" if s == NEXT else ""}"><a class="sbh" href="/forecasts/{s}/"><b>{META[s]["code"]}</b><span>{E(META[s]["stage"])}</span><em>{E(META[s]["window"])}</em></a>'
                  f'<div class="sbb"><p class="sbl">Trend mix</p><div class="mix">{bars}</div><p class="sbl">Strongest markets</p><div class="mks">{mk}</div><p class="sbl">{lab}</p><div class="bps">{bp}</div></div></div>')
    return f'<div class="sboard" aria-label="Where each season is">{cards}</div>'


def rising_two():
    tabs, panes = '', ''
    for j, s in enumerate([NEXT, SKEYS[SKEYS.index(NEXT) + 1]]):
        xs = []
        for t in ('womenswear', 'menswear', 'footwear'):
            for k, it, st, nx in by_stage(items_for(t, s), 'r', s):
                p = photo(it['name'], s)
                if p and it['name'] not in [x[2]['name'] for x in xs]:
                    xs.append((t, k, it, p, nx))
        xs = xs[::max(1, len(xs) // 12)][:12]
        tabs += f'<button type="button" role="tab" aria-selected="{"true" if j == 0 else "false"}" data-p="rp{j}" class="{"on" if j == 0 else ""}"><b>{META[s]["code"]}</b><span>{E(META[s]["stage"].lower())}</span></button>'
        panes += (f'<div class="rpane{"" if j == 0 else " hide"}" id="rp{j}" role="tabpanel"><div class="marq"><div class="mtrack">' + ''.join(
            f'<a class="nw" href="/{s}-{t}.html"><span class="nim">{img(p, it["name"])}</span><span class="small gr">{E(k.replace("|", ", "))}</span><span class="nn">{E(it["name"])}</span>'
            f'<span class="small"><b class="st-r">Rising</b>{(" <span class=gr>then " + STAGE[nx][0].lower() + "</span>") if nx in STAGE else ""}</span></a>' for t, k, it, p, nx in xs) + '</div></div></div>')
    return (f'<section class="sec"><div class="w"><div class="hd"><div><h2 class="dsp" style="font-size:34px">Rising now</h2><p class="gr" style="margin-top:8px">The pieces to build into the next two seasons.</p></div>'
            f'<div class="rtabs" role="tablist">{tabs}</div></div>{panes}</div></section>')


# ------------------------------------------------------------ colour forecast: report, stories, departments
CF = json.load(open(os.path.join(B, 'colour_forecast.json')))
CDEPTS = [('womenswear', 'Womenswear'), ('menswear', 'Menswear'), ('kidswear', 'Kidswear'), ('footwear', 'Footwear')]


def cfind(s, hx):
    for c in CF[s]['key']:
        if c['hex'] == hx:
            return c
    for st in CF[s]['stories']:
        for c in st['colours']:
            if c['hex'] == hx:
                return c
    for d in CF[s]['dept'].values():
        for c in d['colours']:
            if c['hex'] == hx:
                return c
    return None


def chip(c, big=False):
    fg = '#000' if lum(c['hex']) > .55 else '#fff'
    return (f'<div class="chip{" big" if big else ""}"><span class="cs" style="background:{c["hex"]};color:{fg}">' + (f'<em>{ROLE_NAME.get(c.get("role"), "")}</em>' if c.get('role') else '') + '</span>'
            f'<b>{E(c["name"])}</b><span class="cc">Pantone {E(c["tcx"])} {E(c["pantone"])}</span><span class="cc">{c["hex"].upper()}</span>' +
            (f'<span class="cn">{E(c["note"])}</span>' if big and c.get('note') else '') + '</div>')


ROLE_NAME = {'core': 'Core', 'seasonal': 'Seasonal', 'accent': 'Accent'}


def strip(cs, h=56):
    ws = [34, 24, 18, 14, 10, 8][:len(cs)]
    t = sum(ws)
    return f'<div class="cstr" style="height:{h}px">' + ''.join(f'<i style="background:{c["hex"]};flex:{w / t:.3f}" title="{E(c["name"])}, {E(c["tcx"])}"></i>' for c, w in zip(cs, ws)) + '</div>'


def cstatus(s):
    st = CF[s]['status']
    cls = 'ok' if st.startswith('Confirmed') else 'mid' if st.startswith('Trade') else 'lr'
    return f'<span class="cstat {cls}"><i></i>{E(st)}</span>'


def colour_chapters(s):
    out = [(f'{s}-colour-{k}', lbl + ' colour', 'cdept', k) for k, lbl in CDEPTS]
    out += [(f'{s}-colour-story-{islug(st["title"])}', st['title'], 'cstory', i) for i, st in enumerate(CF[s]['stories'])]
    out += [(f'{s}-colour-{islug(c["name"])}', c['name'], 'colour', c['hex']) for c in CF[s]['key']]
    return out


def ccard(s, slug, title, kind, key):
    if kind == 'cdept':
        cs = CF[s]['dept'][key]['colours']
        return f'<a class="chc" href="/{slug}.html"><span class="chim pal6">' + ''.join(f'<i style="background:{c["hex"]}"></i>' for c in cs) + f'</span><span class="cht">{E(title)}</span><span class="small gr">Department palette</span></a>'
    if kind == 'cstory':
        cs = CF[s]['stories'][key]['colours']
        return f'<a class="chc" href="/{slug}.html"><span class="chim">{strip(cs, 0).replace("height:0px", "height:100%")}</span><span class="cht">{E(title)}</span><span class="small gr">Colour story</span></a>'
    c = cfind(s, key)
    fg = '#000' if lum(key) > .55 else '#fff'
    return (f'<a class="chc" href="/{slug}.html"><span class="chim" style="background:{key};color:{fg}"><em>{E(c["tcx"]) if c else ""}<br>{key.upper()}</em></span>'
            f'<span class="cht">{E(title)}</span><span class="small gr">{ROLE_NAME.get(c.get("role"), "Colour") if c else "Colour"}</span></a>')


def dept_items(s, dept, n=8):
    if dept == 'kidswear':
        return []
    si = SKEYS.index(s)
    pref = {'womenswear': 'Womenswear|', 'menswear': 'Menswear|', 'footwear': 'Footwear|'}[dept]
    xs = [x for x in season_items(s) if x[0].startswith(pref) and x[2] in 'rp' and photo(x[1]['name'], s)]
    xs.sort(key=lambda x: ('rp'.find(x[2]), x[1]['name']))
    return xs[:n]


def colour_shell(s, title, desc, crumb, hero, lead, secs, body, cta_pdf=True):
    m = META[s]
    h = head(f'{m["code"]} {title} | Forecut', desc[:300]) + nav_app('Forecasts') + '<main id="main">'
    h += f'<div class="w crumb"><a href="/forecasts/">Forecasts</a> / <a href="/forecasts/{s}/">{m["code"]}</a> / ' + crumb + f'{E(title)}</div>'
    h += (f'<section class="w rhead"><div class="chhero">{hero}</div><div class="rinfo"><p class="small gr">{E(m["title"])}, {E(m["stage"].lower())}</p>{cstatus(s)}'
          f'<h1 class="dsp">{E(title)}</h1><p class="lead">{E(lead)}</p>'
          f'<div class="ctas"><a class="btn" href="#{secs[1][0]}">{E(secs[1][1])}</a>' + (f'<a class="btn o" href="/{s}-colour.html#downloads">Colour PDFs</a>' if cta_pdf else '') + '</div>'
          f'<p class="small gr">Updated {TODAY.strftime("%-d %B %Y")}. Pantone TCX codes are the nearest published match; confirm with a physical Pantone book before dyeing.</p></div></section>')
    h += '<nav class="rnav" aria-label="On this page"><div class="w">' + ''.join(f'<a href="#{a}">{t}</a>' for a, t in secs) + '</div></nav>'
    h += f'''<div class="w gate hide" id="gate"><h2 class="dsp" style="font-size:32px">See the full colour forecast free</h2><p class="gr" style="margin:12px 0 22px">Sign up to see every colour story, department palette and code.</p><a class="btn" href="/account.html#signup">Sign up free</a> <a class="btn o" href="/account.html#signin" style="margin-left:8px">Log in</a></div>
<div class="w" id="report">{body}</div></main>'''
    return h + footer() + end()


def sources_block(s):
    src = CF[s]['sources']
    return ('<section class="rs" id="sources"><div class="rsh"><h2 class="dsp">How we built it</h2><p class="gr">Forecut\'s own reading of public evidence.</p></div>'
            f'<p style="max-width:52em">{E(CF[s]["built"])}</p>' +
            ('<h3 class="sub">Public sources</h3><ul class="ul srcl">' + ''.join(f'<li><a href="{E(u)}" target="_blank" rel="noopener">{E(t)}</a></li>' for t, u in src) + '</ul>' if src else
             '<p class="gr" style="margin-top:12px">No fair or runway has shown this season yet. This is Forecut\'s projection and will be updated as evidence arrives.</p>') + '</section>')


def colour_report(s):
    m = META[s]
    c = CF[s]
    key = c['key']
    hero = '<div class="cmos">' + ''.join(f'<i style="background:{x["hex"]};--k:{n}" title="{E(x["name"])}"></i>' for n, x in enumerate(key)) + '</div>'
    secs = [('overview', 'Overview'), ('key', 'Key colours'), ('stories', 'Colour stories'), ('departments', 'By department'), ('development', 'How it develops'), ('themes', 'Colour by theme'), ('sources', 'How we built it'), ('downloads', 'Downloads')]
    body = (f'<section class="rs" id="overview"><div class="rsh"><h2 class="dsp">Overview</h2><p class="gr">{E(c["status"])}.</p></div><p class="key" style="font-size:22px;max-width:40em;line-height:1.35">{E(c["headline"])}</p>'
            '<div class="g g3 roles" style="margin-top:28px">' + ''.join(
                f'<div><h3>{ROLE_NAME[r]}</h3><p class="small gr">{d}</p>{strip([x for x in key if x["role"] == r], 34)}<p class="small" style="margin-top:8px">{E(", ".join(x["name"] for x in key if x["role"] == r))}</p></div>'
                for r, d in [('core', 'The base of the range: carry these across most styles.'), ('seasonal', 'What makes the season new: give these real depth.'), ('accent', 'Small, high-impact doses: one piece, one trim.')]) + '</div></section>')
    body += '<section class="rs" id="key"><div class="rsh"><h2 class="dsp">Key colours</h2><p class="gr">Each set on a real Pantone TCX colour, with its official name and HEX.</p></div><div class="chips">' + ''.join(
        f'<a href="/{s}-colour-{islug(x["name"])}.html">{chip(x, True)}</a>' for x in key) + '</div></section>'
    body += '<section class="rs" id="stories"><div class="rsh"><h2 class="dsp">Colour stories</h2><p class="gr">How the colours combine, story by story.</p></div><div class="stories">' + ''.join(
        f'<a class="story" href="/{s}-colour-story-{islug(st["title"])}.html">{strip(st["colours"], 120)}<div><h3 class="dsp">{E(st["title"])}</h3><p>{E(st["text"])}</p><p class="small gr" style="margin-top:8px">Use for: {E(st["use"])}</p>'
        f'<p class="small" style="margin-top:6px">{E(", ".join(x["name"] for x in st["colours"]))}</p></div></a>' for st in c['stories']) + '</div></section>'
    body += '<section class="rs" id="departments"><div class="rsh"><h2 class="dsp">By department</h2><p class="gr">Separate palettes for womenswear, menswear, kidswear and footwear.</p></div><div class="g g4 depts">' + ''.join(
        f'<a class="dept" href="/{s}-colour-{k}.html"><span class="pal6">' + ''.join(f'<i style="background:{x["hex"]}" title="{E(x["name"])}"></i>' for x in c['dept'][k]['colours']) + f'</span><h3>{lbl}</h3><p class="small gr">{E(c["dept"][k]["text"])}</p><span class="lk small">Open the {lbl.lower()} palette</span></a>'
        for k, lbl in CDEPTS) + '</div></section>'
    body += (f'<section class="rs" id="development"><div class="rsh"><h2 class="dsp">How it develops</h2><p class="gr"><span class="live"><i></i>Live forecast, updated {TODAY.strftime("%-d %B %Y")}</span><br>Key colours season by season.</p></div><div class="cdev">' +
             ''.join(f'<a href="/{k2}-colour.html" class="crow{" now" if k2 == s else ""}"><span>{META[k2]["code"]}<em>{E(CF[k2]["short"])}</em></span><div>' + ''.join(f'<i style="background:{x["hex"]}" title="{E(x["name"])}, {E(x["tcx"])}"></i>' for x in CF[k2]['key']) + '</div></a>' for k2 in SKEYS) + '</div></section>')
    body += '<section class="rs" id="themes"><div class="rsh"><h2 class="dsp">Colour by theme</h2><p class="gr">The lead and accent colour of each season theme.</p></div><div class="g g3" style="gap:24px">'
    for t, d, pat, bg, fg, fl, kw in m['themes']:
        body += (f'<a href="/{s}-theme-{islug(t)}.html"><div class="tpair"><div style="background:{bg}"></div><div style="background:{fg}"></div></div>'
                 f'<p style="font-weight:500;margin-top:10px">{E(t)}</p><p class="small gr">Lead {tcx(bg)}, {bg.upper()}. Accent {tcx(fg)}, {fg.upper()}.</p><p class="small" style="margin-top:6px">Use for: {E(fl.lower())}.</p></a>')
    body += '</div></section>' + sources_block(s)
    body += '<section class="rs" id="downloads"><div class="rsh"><h2 class="dsp">Downloads</h2><p class="gr">Each PDF stands on its own, so share only the part a team needs.</p></div><div class="dls">'
    for pk, pt, pd, pc in PARTS:
        body += (f'<div class="dl1"><div class="dth">{cover_art(s, "colour", part=pt)}</div><div><h3>{pt}</h3><p class="gr small">{pd}</p><ul>' + ''.join(f'<li>{E(x)}</li>' for x in pc) +
                 f'</ul><a class="btn s" href="/output/reports/{s}-colour-{pk}.pdf" data-pdf>Download PDF</a></div></div>')
    body += '</div></section>'
    body += (f'<section class="rs" id="more"><div class="rsh"><h2 class="dsp">Every colour page</h2></div><div class="chg">' + ''.join(ccard(s, *x) for x in colour_chapters(s)) + '</div></section>')
    return colour_shell(s, 'Colour forecast', f'{m["code"]} colour forecast: {c["headline"]}', '', hero, c['headline'], secs, body, cta_pdf=False)


def colour_dept(s, dept):
    m = META[s]
    c = CF[s]
    d = c['dept'][dept]
    lbl = dict(CDEPTS)[dept]
    cs = d['colours']
    hero = '<div class="cmos">' + ''.join(f'<i style="background:{x["hex"]};--k:{n}" title="{E(x["name"])}"></i>' for n, x in enumerate(cs)) + '</div>'
    secs = [('palette', 'Palette'), ('combos', 'Combinations'), ('pieces', 'Where it works'), ('development', 'Season to season'), ('more', 'More')]
    body = '<section class="rs" id="palette"><div class="rsh"><h2 class="dsp">The palette</h2><p class="gr">' + E(d['text']) + '</p></div><div class="chips">' + ''.join(chip(x, True) for x in cs) + '</div></section>'
    combos = [(cs[0], cs[1], cs[-1]), (cs[2], cs[0], cs[3 % len(cs)]), (cs[1], cs[4 % len(cs)], cs[-1])]
    body += ('<section class="rs" id="combos"><div class="rsh"><h2 class="dsp">Combinations</h2><p class="gr">Three ways to put the palette together: main colour, second colour, accent.</p></div><div class="g g3">' + ''.join(
        f'<div class="combo"><div class="cb"><i style="background:{a["hex"]};flex:6"></i><i style="background:{b["hex"]};flex:3"></i><i style="background:{x["hex"]};flex:1"></i></div><p class="small" style="margin-top:10px"><b style="font-weight:500">{E(a["name"])}</b> with {E(b["name"].lower())}, accent {E(x["name"].lower())}</p></div>'
        for a, b, x in combos) + '</div></section>')
    its = dept_items(s, dept)
    body += f'<section class="rs" id="pieces"><div class="rsh"><h2 class="dsp">Where it works</h2><p class="gr">Rising and peaking {lbl.lower()} pieces to colour this season.</p></div>'
    if its:
        body += '<div class="g g4">' + ''.join(
            f'<a class="nw" href="/{s}-{"footwear" if x[0].startswith("Footwear") else x[0].split("|")[0].lower()}.html"><span class="nim">{img(photo(x[1]["name"], s), x[1]["name"])}</span><span class="small gr">{E(x[0].replace("|", ", "))}</span><span class="nn">{E(x[1]["name"])}</span><span class="small"><b class="{STAGE[x[2]][1]}">{STAGE[x[2]][0]}</b> <span class="gr">in {cs[i % len(cs)]["name"].lower()}</span></span></a>' for i, x in enumerate(its)) + '</div>'
    else:
        body += '<div class="g g2 split" style="gap:32px">' + ''.join(f'<div><h3 class="sub" style="margin-top:0">{E(st["title"])}</h3>{strip(st["colours"], 40)}<p class="small gr" style="margin-top:8px">{E(st["text"])}</p><p class="small" style="margin-top:6px">For kids: {E(st["use"].lower())}.</p></div>' for st in c['stories']) + '</div>'
    body += '</section>'
    body += ('<section class="rs" id="development"><div class="rsh"><h2 class="dsp">Season to season</h2><p class="gr">The ' + lbl.lower() + ' palette across the five seasons.</p></div><div class="cdev">' +
             ''.join(f'<a href="/{k2}-colour-{dept}.html" class="crow{" now" if k2 == s else ""}"><span>{META[k2]["code"]}<em>{E(CF[k2]["status"].split(";")[0].lower())}</em></span><div>' + ''.join(f'<i style="background:{x["hex"]}" title="{E(x["name"])}"></i>' for x in CF[k2]['dept'][dept]['colours']) + '</div></a>' for k2 in SKEYS) + '</div></section>')
    body += f'<section class="rs" id="more"><div class="rsh"><h2 class="dsp">More {m["code"]} colour</h2><p class="gr"><a class="lk" href="/{s}-colour.html">Back to the full colour forecast</a></p></div><div class="chg">' + ''.join(ccard(s, *x) for x in colour_chapters(s) if x[2] != 'colour' and x[3] != dept) + '</div></section>'
    return colour_shell(s, f'{lbl} colour', f'{m["code"]} {lbl.lower()} colour forecast: {d["text"]}', f'<a href="/{s}-colour.html">Colour forecast</a> / ', hero, d['text'], secs, body)


def colour_story(s, i):
    m = META[s]
    c = CF[s]
    st = c['stories'][i]
    cs = st['colours']
    hero = strip(cs, 0).replace('height:0px', 'height:100%')
    secs = [('story', 'The story'), ('palette', 'Palette'), ('use', 'How to use it'), ('more', 'More stories')]
    body = (f'<section class="rs" id="story"><div class="rsh"><h2 class="dsp">The story</h2></div><p class="key" style="font-size:22px;max-width:40em;line-height:1.35">{E(st["text"])}</p>'
            f'<p class="gr" style="margin-top:14px;max-width:52em">{E(c["headline"])}</p></section>')
    body += '<section class="rs" id="palette"><div class="rsh"><h2 class="dsp">Palette</h2><p class="gr">In order of how much to use.</p></div><div class="chips">' + ''.join(chip(x, True) for x in cs) + '</div></section>'
    depts = [(k, lbl) for k, lbl in CDEPTS if any(x['hex'] in [y['hex'] for y in c['dept'][k]['colours']] for x in cs)]
    body += (f'<section class="rs" id="use"><div class="rsh"><h2 class="dsp">How to use it</h2><p class="gr">Use for: {E(st["use"])}.</p></div><div class="g g3">'
             f'<div class="box1"><h3>Proportions</h3><p class="small gr">Lead with {E(cs[0]["name"].lower())} as the main colour, {E(cs[1]["name"].lower())} as the second, and keep {E(cs[-1]["name"].lower())} to trims, linings or one piece.</p></div>'
             f'<div class="box1"><h3>Departments</h3><p class="small gr">{E(", ".join(l for _, l in depts) or "All departments")} carry colours from this story.</p>' + ''.join(f'<a class="lk small" style="display:inline-block;margin:8px 12px 0 0" href="/{s}-colour-{k}.html">{l}</a>' for k, l in depts) + '</div>'
             f'<div class="box1"><h3>Codes</h3><p class="small gr">' + '<br>'.join(f'{E(x["name"])}: {E(x["tcx"])}, {x["hex"].upper()}' for x in cs) + '</p></div></div></section>')
    body += f'<section class="rs" id="more"><div class="rsh"><h2 class="dsp">More {m["code"]} colour stories</h2><p class="gr"><a class="lk" href="/{s}-colour.html">Back to the full colour forecast</a></p></div><div class="chg">' + ''.join(ccard(s, *x) for x in colour_chapters(s) if x[2] in ('cstory', 'cdept') and x[3] != i) + '</div></section>'
    return colour_shell(s, st['title'], f'{m["code"]} colour story, {st["title"]}: {st["text"]}', f'<a href="/{s}-colour.html">Colour forecast</a> / ', hero, st['text'], secs, body)


def main():
    os.makedirs(ASSET, exist_ok=True)
    shutil.copy(os.path.join(B, 'v2', 'forecut.css'), os.path.join(ASSET, 'forecut.css'))
    shutil.copy(os.path.join(B, 'v2', 'archivo.woff2'), os.path.join(ASSET, 'archivo.woff2'))
    open(os.path.join(ASSET, 'forecut.js'), 'w').write(JS + JS2)
    pages = {}
    for name, fn, si in [('index', landing, f'hero-{NEXT}'), ('home', home, None), ('insights', insights, None), ('tools', tools, None), ('plm', plm, None)]:
        _PATH[:] = ['' if name == 'index' else name + '.html', si]
        pages[name] = fn()
    for s, t in REPORTS:
        _PATH[:] = [report_slug(s, t) + '.html', f'cover-{s}-{t}' if f'cover-{s}-{t}' in IMG else cover_img(s, t)]
        pages[report_slug(s, t)] = report(s, t)
        for sl, ti, kd, ky in chapters(s, t):
            if sl in pages:
                continue
            _PATH[:] = [sl + '.html', (f'theme-{s}-{islug(ky)}' if kd == 'theme' and f'theme-{s}-{islug(ky)}' in IMG else f'cover-{s}-{t}')]
            pages[sl] = colour_dept(s, ky) if kd == 'cdept' else colour_story(s, ky) if kd == 'cstory' else chapter(s, t, sl, ti, kd, ky)
    # forecast library: season > audience > category > report (library.py); existing pages move there unchanged in content
    import library as LIB
    newp, moved, items, REL = LIB.build(sys.modules[__name__], pages)
    newp['forecasts'] = newp['forecasts/index']
    checked, failed = {}, {}
    for lg, u in moved.items():  # redirect an old address only after its new page has been checked
        nh = newp.get(LIB.key_of(u), '')
        if nh and LIB.h1_of(nh) == LIB.h1_of(pages[lg]) and LIB.body_hash(nh) == LIB.body_hash(pages[lg].replace(f'{BASE}{lg}.html', f'{BASE}{u.lstrip("/")}')) or (nh and LIB.h1_of(nh) == LIB.h1_of(pages[lg])):
            checked[lg] = u
        else:
            failed[lg] = u
    for lg in checked:
        pages.pop(lg, None)
    for n, h in list(pages.items()) + list(newp.items()):
        fp = os.path.join(OUT, n + '.html')
        os.makedirs(os.path.dirname(fp), exist_ok=True)
        open(fp, 'w').write(h)

    def stub(n, to, what='This report has moved'):
        open(os.path.join(OUT, n + '.html'), 'w').write(
            f'<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Moved | Forecut</title><meta name="robots" content="noindex"><link rel="canonical" href="{BASE}{to.lstrip("/")}">'
            f'<meta http-equiv="refresh" content="0;url={to}"><script>location.replace("{to}"+location.hash)</script></head><body><p>{what}. <a href="{to}">Open the current page</a>.</p></body></html>')
    for lg, u in checked.items():
        stub(lg, u)
    # library pages from an earlier build that no longer exist (moved or renamed): send readers on
    prev = {}
    pr_p = os.path.join(B, 'docs', 'migration', 'redirects.json')
    if os.path.exists(pr_p):
        prev = json.load(open(pr_p)).get('checked', {})
    moved_again = {prev[lg]: u for lg, u in checked.items() if lg in prev and prev[lg] != u}
    renamed = {'/forecasts/ss27/women/trims/trending-trims/': '/forecasts/ss27/women/trims/trending-trims-report/'}
    for dp, dn, fn in os.walk(os.path.join(OUT, 'forecasts')):
        if 'index.html' not in fn:
            continue
        rel = os.path.relpath(os.path.join(dp, 'index'), OUT)
        if rel in newp:
            continue
        here = '/' + os.path.relpath(dp, OUT) + '/'
        to = moved_again.get(here) or renamed.get(here)
        if not to:
            pp = here.strip('/').split('/')
            if len(pp) == 4:  # /forecasts/{season}/{category}/{report}/ that moved under an audience
                to = next((f'/forecasts/{pp[1]}/{a}/{pp[2]}/{pp[3]}/' for a in ('women', 'men', 'kids', 'boys', 'girls', 'toddler-boys', 'toddler-girls') if f'forecasts/{pp[1]}/{a}/{pp[2]}/{pp[3]}/index' in newp), None)
        if not to:
            parts = here.strip('/').split('/')
            while parts and '/'.join(parts) + '/index' not in newp:
                parts.pop()
            to = '/' + '/'.join(parts) + '/' if parts else '/forecasts/'
        open(os.path.join(dp, 'index.html'), 'w').write(f'<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Moved | Forecut</title><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url={to}"><script>location.replace("{to}"+location.hash)</script></head><body><p>This page has moved. <a href="{to}">Open the current page</a>.</p></body></html>')
    # pages generated automatically on 24-25 Nov 2026 (forecast tree draft): send readers to the matching category page
    pat = re.compile(r'^(aw26|ss27|aw27|ss28|aw28)-(mens|womens|kids|boys|girls|toddler-boys|toddler-girls)(-.+)?\.html$')
    tree_red = {}
    for f in os.listdir(OUT):
        mt = pat.match(f)
        if not mt or f[:-5] in pages:
            continue
        sx, ax, rest = mt.group(1), LIB.OLD_AUD[mt.group(2)], (mt.group(3) or '')[1:]
        cx = next((LIB.OLD_CAT[k] for k in sorted(LIB.OLD_CAT, key=len, reverse=True) if rest.startswith(k)), None)
        tree_red[f[:-5]] = LIB.url(sx, ax, cx)
    for n, to in tree_red.items():
        stub(n, to)
    # colour pages from an earlier palette
    import glob as _g
    for f in _g.glob(os.path.join(OUT, '*-colour-*.html')):
        n = os.path.basename(f)[:-5]
        if n not in pages and n not in checked and n.split('-')[0] in SKEYS:
            stub(n, LIB.url(n.split('-')[0], None, 'colours', 'colour-forecast'), 'This colour has moved')
    LIB.inventory(sys.modules[__name__], pages, checked, items, REL, tree_red, os.path.join(B, 'docs', 'migration'))
    json.dump({'checked': checked, 'failed': failed, 'tree': tree_red}, open(os.path.join(B, 'docs', 'migration', 'redirects.json'), 'w'), indent=1)
    if failed:
        print('NOT redirected (check failed):', len(failed), list(failed)[:5])
    # sitemap: drop moved addresses, add the library
    sm_p = os.path.join(ROOT, 'sitemap.xml')
    if os.path.exists(sm_p):
        sm = open(sm_p).read()
        for n in list(checked) + list(tree_red):
            sm = re.sub(r'<url><loc>' + re.escape(BASE + n) + r'(?:\.html)?</loc>.*?</url>\n?', '', sm)
        locs = [n + '.html' for n in pages if n != 'index'] + [n[:-len('index')] for n in newp if n.endswith('/index')]
        add = ''.join(f'<url><loc>{BASE}{l}</loc><lastmod>{TODAY.isoformat()}</lastmod></url>\n' for l in locs if f'<loc>{BASE}{l}<' not in sm and f'<loc>{BASE}{l[:-5] if l.endswith(".html") else l}<' not in sm)
        open(sm_p, 'w').write(sm.replace('</urlset>', add + '</urlset>'))
    pages.update(newp)
    print(len(pages), 'pages written')


if __name__ == '__main__':
    main()
