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
TRIM = {'Trim', 'Hardware', 'Closure', 'Embellishment', 'Pocket', 'Placket', 'Collar', 'Cuff', 'Stitch', 'Seam', 'Lapel', 'Neckline', 'Detail', 'Edge', 'Perforation'}
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


def cover(s, topic, locked=False, small=False):
    t = TOPIC[topic][1]
    ci = cover_img(s, topic)
    col = META[s]['palette'][0][0]
    return (f'<a class="cov" href="/v2/{report_slug(s, topic)}.html" data-season="{s}" data-topic="{topic}"><div class="im">' +
            (img(ci, f'{META[s]["code"]} {t}') if ci else '') + f'<span class="ssn">{META[s]["code"]}</span></div><div class="bar" style="background:{col}"></div>'
            f'<div class="meta"><span>{E(season_label(s))}</span>' + (f'<span class="lock">{LOCK} PDF</span>' if locked else '<span>PDF</span>') + '</div>'
            f'<div class="ctl"{" style=font-size:17px" if small else ""}>{E(t)}</div></a>')


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
    h += f'''<section class="hero2" style="display:grid;grid-template-columns:1fr 1fr;height:640px;border-bottom:1px solid var(--ru)">
  <div class="hc" style="padding:72px 56px 64px max(40px,calc((100vw - 1280px)/2 + 40px));display:flex;flex-direction:column;justify-content:center">
    <h1 class="dsp">See the next season first.</h1>
    <p class="lead" style="margin:26px 0 34px">Seasonal trend forecasts with colour, fabric and detail direction, for designers, brands and fashion schools.</p>
    <div style="display:flex;gap:12px;flex-wrap:wrap"><a class="btn" href="/account.html?signup=1">Sign up free</a><a class="btn o" href="/v2/{NEXT}-colour.html#preview">See a sample report</a></div>
    <p class="small mu" style="margin-top:22px">Free to join. Full reports and PDF downloads after sign-up.</p>
  </div>
  <div class="hp" style="position:relative;overflow:hidden">{img(photo('Colour-block knits', 'aw27') or 'hero-' + NEXT, 'Model in a colour-block knit and wide trousers', style='object-position:50% 18%')}
    <div style="position:absolute;left:24px;bottom:24px;background:#fff;padding:14px 16px;max-width:300px">
      <div class="small gr">Rising for AW27</div><div style="font-weight:500">Colour-block knits</div>
      <div class="sw small" style="margin-top:10px"><i style="background:{sg[0]};width:28px;height:28px"></i><span>Colour to use: {E(sg[1].lower())}, {tcx(sg[0])}</span></div></div></div>
</section>
<section class="sec" id="what"><div class="w">
  <div class="hd"><h2 class="dsp">What we do</h2><p class="gr">Forecut reads runways, retail and fabric fairs, and turns them into reports you can design from.</p></div>
  <div class="g g3">
    <div><div style="aspect-ratio:4/3">{img('theme-' + NEXT + '-the-waist-returns')}</div><h3 class="dsp" style="margin:18px 0 8px">Seasonal forecasts</h3><p class="gr">Themes, womenswear, menswear and footwear for every season, from what is in stores now to two years ahead.</p></div>
    <div><div style="aspect-ratio:4/3">{img('theme-' + NEXT + '-elegant-ease')}</div><h3 class="dsp" style="margin:18px 0 8px">Colour and materials</h3><p class="gr">Palettes with Pantone TCX and HEX codes, fabrics, finishes and trims for each season.</p></div>
    <div><div style="aspect-ratio:4/3">{img('theme-aw27-quiet-structure')}</div><h3 class="dsp" style="margin:18px 0 8px">Design to production</h3><p class="gr">Free tools that take a trend to a brief, a pattern, a tech pack and a cost sheet.</p></div>
  </div></div></section>
<section class="sec st"><div class="w">
  <div class="hd"><h2 class="dsp">This season’s reports</h2><a class="lk" href="/v2/forecasts.html">All forecasts</a></div>
  <div class="g g5">{''.join(cover(NEXT, t, locked=True) for t in ['themes', 'womenswear', 'menswear', 'colour', 'fabrics'])}</div>
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
      <a href="/v2/{NEXT}-colour.html" id="contlink" style="display:grid;grid-template-columns:64px 1fr;gap:14px;align-items:center"><div style="aspect-ratio:3/4">{img(cover_img(NEXT, 'colour'))}</div><div><div class="small gr" id="contseason">{META[NEXT]['code']}</div><div id="conttitle">Colour forecast</div></div></a></div>
    <div style="border:1px solid var(--ru);padding:22px"><h3 style="font-weight:500;margin-bottom:6px">Coming up</h3>{''.join(f'<a href="{u}" style="display:grid;grid-template-columns:62px 1fr;padding:9px 0;border-bottom:1px solid var(--ru);font-size:14px"><span class="gr">{d.strftime("%-d %b")}</span><span>{E(t)}</span></a>' for d, t, u in coming(4))}</div>
  </div></section>
<section class="sec st"><div class="w"><div class="hd"><h2 class="dsp" style="font-size:34px">{META[NEXT]['code']} reports</h2><a class="lk" href="/v2/forecasts.html">All forecasts</a></div>
  <div class="g g5">{''.join(cover(NEXT, t, small=True) for t in ['trims', 'womenswear', 'footwear', 'knitwear', 'fabrics'])}</div></div></section>
<section class="sec"><div class="w"><div class="hd"><h2 class="dsp" style="font-size:34px">Latest insights</h2><a class="lk" href="/v2/insights.html">All insights</a></div>
  <div class="g g3">{''.join(f'<a href="/{a["slug"]}.html" style="display:grid;grid-template-columns:110px 1fr;gap:16px">' + (f'<div style="aspect-ratio:1">{img(art_img(a))}</div>' if art_img(a) else '<div></div>') + f'<div><p class="small gr">{art_kind(a)}</p><p style="font-weight:500;margin-top:4px">{E(a["title"])}</p></div></a>' for a in ARTS[:3])}</div></div></section>
</main>'''
    data = json.dumps(pool, ensure_ascii=False).replace('</', '<\\/')
    return h + footer() + end(f'<script>window.FC_DOTD={data}</script>')


def forecasts():
    h = head('Forecasts | Forecut', 'Forecut forecast reports: one report per topic, per season.') + nav_app('Forecasts') + '<main id="main">'
    h += '''<section class="sec t"><div class="w"><h1 class="dsp" style="font-size:52px">Forecasts</h1>
<p class="lead" style="margin-top:10px">One report per topic, per season. Open a preview, read in full, or download the PDF.</p></div></section>
<section class="w" style="padding-bottom:20px" id="filters">'''
    h += '<div style="margin-bottom:14px"><div class="small gr" style="margin-bottom:8px">Season</div><div class="flt" data-f="season"><button class="ch on" data-v="all" type="button">All seasons</button>' + ''.join(f'<button class="ch" type="button" data-v="{s}">{META[s]["code"]} <span class="gr" style="margin-left:6px">{E(META[s]["stage"].lower())}</span></button>' for s in SKEYS) + '</div></div>'
    h += '<div style="margin-bottom:14px"><div class="small gr" style="margin-bottom:8px">Topic</div><div class="flt" data-f="topic"><button class="ch on" data-v="all" type="button">All topics</button>' + ''.join(f'<button class="ch" type="button" data-v="{k}">{E(t)}</button>' for k, t, _, _ in TOPICS) + '</div></div>'
    h += '<div style="margin-bottom:14px"><div class="small gr" style="margin-bottom:8px">Regional and India forecasts</div><div class="flt">' + ''.join(f'<a class="ch" href="{u}">{t}</a>' for t, u in [('Europe', '/region-europe.html'), ('North America', '/region-north-america.html'), ('Asia', '/region-asia.html'), ('South America', '/region-south-america.html'), ('Africa', '/region-africa.html'), ('Oceania', '/region-oceania.html'), ('India', '/india.html'), ('Resort 27', '/resort-27.html'), ('Pre-Fall 27', '/pre-fall-27.html')]) + '</div></div>'
    h += '<div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid var(--ru);padding-top:16px;margin-top:8px"><span class="small gr" id="fcount">Showing every season and topic</span></div></section>'
    order = [NEXT] + [s for s in SKEYS if s != NEXT]
    h += '<section class="w" style="padding-bottom:72px"><div class="g g5" id="shelf" style="row-gap:36px">' + ''.join(cover(s, t) for s in order for t, *_ in TOPICS) + '</div><p class="gr hide" id="fnone" style="padding:30px 0">No report matches. Choose another season or topic.</p></section></main>'
    return h + footer() + end()


def report(s, topic):
    m = META[s]
    key, title, desc, f = TOPIC[topic]
    ci = cover_img(s, topic)
    col = m['palette'][0][0]
    h = head(f'{m["code"]} {title} | Forecut', f'{m["title"]} {title.lower()}: {desc}') + nav_app('Forecasts') + '<main id="main">'
    h += f'<div class="w crumb"><a href="/v2/forecasts.html">Forecasts</a> / {m["code"]} / {E(title)}</div>'
    body, toc = '', []
    if topic == 'themes':
        for t, d, pat, bg, fg, fl, kw in m['themes']:
            tk = f'theme-{s}-{islug(t)}'
            th = THEMES.get(f'{s}|{t}', {})
            aid = islug(t); toc.append((aid, t))
            body += (f'<article id="{aid}" class="g g2 split" style="gap:40px;padding:36px 0;border-top:1px solid var(--ru);align-items:start">'
                     f'<div style="aspect-ratio:16/11;background:{bg}">' + (img(tk, t) if tk in IMG else '') + '</div>'
                     f'<div><h2 class="dsp" style="font-size:32px;margin-bottom:12px">{E(t)}</h2><p class="lead" style="font-size:17px">{E(th.get("story", d))}</p>' +
                     (f'<h3 style="font-weight:500;margin:18px 0 6px">Why now</h3><p class="gr">{E(th["why"])}</p>' if th.get('why') else '') +
                     f'<h3 style="font-weight:500;margin:18px 0 6px">Key pieces</h3><p>{E(", ".join(kw))}; {E(fl.lower())}.</p>' +
                     (f'<h3 style="font-weight:500;margin:18px 0 6px">Seen at</h3><p class="gr small">{E("; ".join(b[0] + ": " + b[1] for b in th["brands"][:4]))}</p>' if th.get('brands') else '') +
                     f'<div class="sw small" style="margin-top:16px"><i style="background:{bg}"></i><span>Theme colour: {E(tcx(bg))}, {bg.upper()}</span></div></div></article>')
    elif topic == 'colour':
        toc = [('palette', 'The season palette'), ('themes', 'Colour by theme')]
        body += '<section id="palette" style="padding:36px 0;border-top:1px solid var(--ru)"><h2 class="dsp" style="font-size:32px;margin-bottom:18px">The season palette</h2><div class="g g4" style="gap:20px">'
        for hx, nm in m['palette']:
            body += f'<div><div style="aspect-ratio:3/2;background:{hx};border:1px solid var(--ru)"></div><p style="font-weight:500;margin-top:10px">{E(nm)}</p><p class="small gr">{tcx(hx)}, {hx.upper()}</p></div>'
        body += '</div></section><section id="themes" style="padding:36px 0;border-top:1px solid var(--ru)"><h2 class="dsp" style="font-size:32px;margin-bottom:18px">Colour by theme</h2><div class="g g3" style="gap:24px">'
        for t, d, pat, bg, fg, fl, kw in m['themes']:
            body += (f'<div><div style="display:grid;grid-template-columns:2fr 1fr;aspect-ratio:3/2"><div style="background:{bg}"></div><div style="background:{fg}"></div></div>'
                     f'<p style="font-weight:500;margin-top:10px">{E(t)}</p><p class="small gr">Lead colour {tcx(bg)}, {bg.upper()}. Accent {tcx(fg)}, {fg.upper()}.</p><p class="small" style="margin-top:6px">Use for: {E(fl.lower())}.</p></div>')
        body += '</div></section>'
    else:
        its = items_for(topic, s)
        for st in ORDER:
            grp = [x for x in its if x[2] == st]
            if not grp:
                continue
            aid = 'stage-' + STAGE[st][0].lower(); toc.append((aid, f'{STAGE[st][0]} in {m["code"]}'))
            body += f'<section id="{aid}" style="padding:36px 0;border-top:1px solid var(--ru)"><h2 class="dsp" style="font-size:32px;margin-bottom:6px">{STAGE[st][0]} in {m["code"]}</h2><p class="gr" style="margin-bottom:22px">{ {"e": "New ideas to test in small quantities.", "r": "Growing fast: build these into the range.", "p": "At their height: sell through, do not add depth.", "f": "Moving out: reduce or rework."}[st] }</p><div class="g g4" style="gap:28px 20px">'
            for k, it, stg, nx in sorted(grp, key=lambda x: (photo(x[1]['name'], s) is None, x[0], x[1]['name'])):
                p = photo(it['name'], s)
                nxl = ('Next season: ' + STAGE[nx][0].lower()) if nx in STAGE else 'Leaves the forecast next season'
                body += (f'<div class="item"><div class="ph{"" if p else " none"}">' + (img(p, it['name']) if p else E(it['area'])) + '</div>'
                         f'<h4>{E(it["name"])}</h4><p>{E(k.replace("|", ", "))}, {E(it["area"].lower())}</p><p style="margin-top:6px">{E(it["note"])}</p>'
                         f'<p class="lab"><span class="stage {STAGE[stg][1]}">{STAGE[stg][0]}</span> <span class="gr">{nxl}</span></p></div>')
            body += '</div></section>'
    pdf = f'/v2/pdf/{report_slug(s, topic)}.pdf'
    h += f'''<section class="w g split" style="grid-template-columns:5fr 7fr;gap:48px;padding-top:22px;padding-bottom:40px">
  <div><div style="aspect-ratio:3/4;background:var(--st)">{img(ci, m["code"] + " " + title) if ci else ''}</div><div style="height:10px;background:{col}"></div></div>
  <div><p class="small gr">{E(m["title"])}, {E(m["stage"].lower())}, {E(m["window"])}</p>
    <h1 class="dsp" style="font-size:56px;margin:10px 0 18px">{E(title)}</h1>
    <p class="lead">{E(desc)}</p><p class="gr" style="margin-top:12px">{E(m["intro"])}</p>
    <div style="display:flex;gap:12px;margin:26px 0;flex-wrap:wrap"><a class="btn" href="#report">Read the full report</a><a class="btn o" href="{pdf}" data-pdf>Download PDF</a></div>
    <p class="small gr">Updated {TODAY.strftime("%-d %B %Y")}.</p>
    <h3 style="font-weight:500;margin:30px 0 8px">In this report</h3><div class="toc">{''.join(f'<a href="#{a}">{E(t)}</a>' for a, t in toc)}</div>
  </div></section>
<div class="w gate hide" id="gate"><h2 class="dsp" style="font-size:32px">Read the full report free</h2><p class="gr" style="margin:12px 0 22px">Sign up to read every page and download the PDF. Takes under a minute.</p><a class="btn" href="/account.html?signup=1">Sign up free</a> <a class="btn o" href="/account.html" style="margin-left:8px">Log in</a></div>
<section class="w" id="report" style="padding-bottom:40px">{body}<p class="small gr" style="padding-top:20px;border-top:1px solid var(--ru)">Sources: {E(m.get("sources", ""))}</p></section>
<section class="sec st"><div class="w"><h2 class="dsp" style="font-size:30px;margin-bottom:22px">More {m["code"]} reports</h2><div class="g g5">{''.join([cover(s, t, small=True) for t, *_ in TOPICS if t != topic][:5])}</div></div></section></main>'''
    return h + footer() + end()


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
 if(location.hash==='#preview'||document.documentElement.dataset.member==='no'){var secs=rep.querySelectorAll('article,section');secs.forEach(function(s,k){if(k>0)s.classList.add('hide')});document.getElementById('gate').classList.remove('hide')}}
window.addEventListener('hashchange',function(){if(rep&&(location.hash==='#preview'||location.hash==='#member'))location.reload()});
var cl=document.getElementById('contlink');if(cl){try{var lr=JSON.parse(localStorage.getItem('fc-last-report')||'null');if(lr){cl.href=lr.u;document.getElementById('conttitle').textContent=lr.t;document.getElementById('contseason').textContent=lr.s}}catch(e){}}
})();
"""


def main():
    os.makedirs(OUT, exist_ok=True)
    shutil.copy(os.path.join(B, 'v2', 'forecut.css'), os.path.join(OUT, 'forecut.css'))
    shutil.copy(os.path.join(B, 'v2', 'archivo.woff2'), os.path.join(OUT, 'archivo.woff2'))
    open(os.path.join(OUT, 'forecut.js'), 'w').write(JS)
    pages = {'index': landing(), 'home': home(), 'forecasts': forecasts(), 'insights': insights(), 'tools': tools(), 'account': account()}
    for s, t in REPORTS:
        pages[report_slug(s, t)] = report(s, t)
    for n, h in pages.items():
        open(os.path.join(OUT, n + '.html'), 'w').write(h)
    print(len(pages), 'pages written to v2/')


if __name__ == '__main__':
    main()
