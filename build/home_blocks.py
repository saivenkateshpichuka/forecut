"""Visual homepage blocks: season cards, region cards, featured construction detail, colour strip.
Used by build_home.py. Data comes from details.json and regions_data.py; editorial lines are short summaries."""
import os
from html import escape as E
import regions_data as RG

ST = {'e': ('emerge', 'Emerging'), 'r': ('rise', 'Rising'), 'p': ('peak', 'Peaking'), 'f': ('fade', 'Fading')}


def _img(cands):
    for c in cands:
        if c and os.path.exists(f'../img/{c}.webp'):
            return c
    return 'hero-ss27'


# (code, title, page, label, horizon, directions, image candidates)
SEASON_CARDS = [
    ('aw26', 'AW26', 'aw26.html', 'Observed', 'In stores now', ['Statement outerwear and shearling', 'Pinstripe power suiting', 'Contrast collars and cuffs'], ['theme-aw26-big-outerwear', 'hero-aw26']),
    ('rs27', 'Resort 27', 'resort-27.html', 'Observed', 'Cruise shows · in stores Nov–Jan', ['Destination shows in Biarritz, Los Angeles and New York', 'Light travel wardrobes and resort tailoring', 'Australian Fashion Week Resort 27 trends'], ['hub-resort-27', 'theme-ss27-in-motion']),
    ('ss27', 'SS27', 'ss27.html', 'Forecast', 'Next season', ['Defined waist: peplums and bubble skirts', 'Handcraft moves into daily shirting', 'Refined flats replace the everyday sneaker'], ['theme-ss27-elegant-ease', 'hero-ss27']),
    ('pf27', 'Pre-Fall 27', 'pre-fall-27.html', 'Forecast', 'Bridge season · in stores May–Jul', ['SS27 trends that keep rising into AW27', 'Transitional layers and lighter wool', 'Timing by region and hemisphere'], ['hub-pre-fall-27', 'theme-aw27-quiet-structure', 'hero-aw26']),
    ('aw27', 'AW27', 'aw27.html', 'Forecast', 'Early outlook', ['Belted, waisted outerwear', 'Brushed wool and cool-wool mélange', 'Slim-sole loafers and soft boots'], ['theme-aw27-waisted-outerwear', 'hero-aw27']),
    ('ss28', 'SS28', 'ss28.html', 'Projection', 'Long range', ['Clean, structured shapes with ease', 'Concealed fastenings and clean plackets', 'Breathable, quick-dry naturals'], ['hero-ss28']),
    ('aw28', 'AW28', 'aw28.html', 'Projection', 'Long range', ['Structured long-line coats', 'Technical wool blends', 'Hybrid sport-smart boots'], ['theme-aw28-functional-tailoring', 'hero-aw28']),
]


def season_cards(M, SEAS):
    out = []
    for code, title, page, lab, hz, dirs, imgs in SEASON_CARDS:
        bar = ''
        if code in SEAS:
            i = SEAS.index(code)
            n = {k: 0 for k in 'erpf'}
            for its in M.values():
                for it in its:
                    c = it['life'][i]
                    if c in n:
                        n[c] += 1
            tot = sum(n.values()) or 1
            bar = ('<div class="sbar" role="img" aria-label="' + ', '.join(f'{n[k]} {ST[k][1].lower()}' for k in 'erpf') + '">'
                   + ''.join(f'<i class="{k}" style="width:{n[k] * 100 / tot:.1f}%"></i>' for k in 'erpf') + '</div>'
                   + f'<div class="skey"><span>{tot} details</span><span>{n["e"]} emerging</span><span>{n["r"]} rising</span><span>{n["p"]} peaking</span><span>{n["f"]} fading</span></div>')
        else:
            bar = '<div class="skey"><span>Collection report · read for all six regions</span></div>'
        out.append(f'<a class="scard" href="{page}"><span class="ph"><img src="img/{_img(imgs)}.webp" alt="{E(title)} forecast" loading="lazy" width="600" height="800"><span class="lab">{lab}</span></span>'
                   f'<span class="bd"><h3>{E(title)}<small>{E(hz)}</small></h3><ul>{"".join(f"<li>{E(d)}</li>" for d in dirs)}</ul>{bar}<span class="go">Open the {E(title)} forecast →</span></span></a>')
    return ''.join(out)


def _pick(cands, used):
    for c in cands:
        if c not in used and os.path.exists(f'../img/{c}.webp'):
            used.add(c)
            return c
    return _img(cands)


def region_cards():
    out, used = [], set()
    extra = ['hub-fabrics-runway-london', 'theme-ss27-reworked-denim', 'theme-aw27-winter-handcraft', 'hub-fabrics-runway-menswear', 'theme-ss27-handcraft', 'theme-ss27-in-motion']
    hm = {'north': 'Northern hemisphere', 'south': 'Southern hemisphere', 'mixed': 'Both hemispheres'}
    for r in RG.REGIONS:
        mk = ', '.join(m['name'] for m in r['markets'])
        out.append(f'<a class="rc" href="region-{r["slug"]}.html"><img src="img/{_pick(r["img"] + extra, used)}.webp" alt="" loading="lazy" width="800" height="600"><span class="hm">{hm.get(r["hemi"], "")}</span>'
                   f'<span class="in"><b>{E(r["name"])}</b><span>{E(mk)}</span></span></a>')
    return ''.join(out)


def spotlight(M, SEAS, islug):
    want = 'Band-collar shirts with long placket'
    it = next((x for its in M.values() for x in its if x['name'] == want), None)
    if not it:
        return ''
    life = ''.join(f'<span>{s.upper()}<i class="pill {ST[c][0]}">{ST[c][1]}</i></span>' if c in ST else f'<span>{s.upper()}<i class="pill" style="opacity:.45">–</i></span>' for s, c in zip(SEAS, it['life']))
    now = it['life'][1] if it['life'][1] in ST else 'r'
    im = next((c for c in (islug(want) + '-photo', 'sample-band-collar-placket') if os.path.exists(f'../img/{c}.webp')), 'sample-band-collar-placket')
    return f'''<article class="spot" aria-labelledby="sph">
      <div class="ph"><img src="img/{im}.webp" alt="Band-collar shirt with a long button placket" loading="lazy" width="800" height="800"></div>
      <div>
        <div class="kick"><span class="mono eyebrow">Featured detail · Womenswear tops</span><span class="pill {ST[now][0]}">{ST[now][1]} in SS27</span></div>
        <h3 id="sph">Band collar with long placket</h3>
        <p>{E(it['note'])} The point collar steps back; a clean band and an extended placket carry the shirt from office to evening.</p>
        <dl>
          <dt>Construction</dt><dd>Interfaced band 2.5–3.5 cm high; placket extended to the hem or concealed as a fly front; 1–2 mm edge-stitching, no visible collar stand seam.</dd>
          <dt>Fabric</dt><dd>Poplin and crepe de chine for SS27; brushed cotton and fine wool shirting as it moves into AW27.</dd>
          <dt>Trims</dt><dd>Tonal shell or corozo buttons, 7–9 on the placket; hidden snaps on fly fronts.</dd>
          <dt>Where</dt><dd>All six regions. Lightweight cottons for tropical Asia, Brazil and West Africa; layered under knits in Europe and North America.</dd>
          <dt>Lifecycle</dt><dd><div class="lrow">{life}</div></dd>
        </dl>
        <a class="btn" href="ss27.html?q=band-collar#list">See it in the SS27 forecast →</a>
      </div>
    </article>'''


PALETTES = [
    ('SS27', 'ss27.html', 'Luminous blue leads, with energy orange and pop pink', [('#2f6fe0', 'Luminous blue'), ('#f07a1d', 'Energy orange'), ('#ef6fa7', 'Pop pink'), ('#7fa35a', 'Meadow green'), ('#b57552', 'Clay')]),
    ('AW27', 'aw27.html', 'Warm cognac and carmine against steel grey', [('#8a4b2a', 'Cognac'), ('#9c1f2e', 'Carmine'), ('#6f7880', 'Steel grey'), ('#6b6a4b', 'Khaki'), ('#5a3f7a', 'Deep purple')]),
    ('SS28', 'ss28.html', 'Radiant earth with sand, stone and deep teal', [('#c0582b', 'Radiant earth'), ('#d9b892', 'Sand'), ('#a8a49b', 'Stone'), ('#1f5e63', 'Deep teal'), ('#f3f0e8', 'Off-white')]),
]


def colour_block():
    cards = ''.join(f'<a class="palc" href="{u}"><span class="palsw" role="img" aria-label="{E(", ".join(n for _, n in cs))}">{"".join(f"<i style=\"background:{h}\" title=\"{E(n)}\"></i>" for h, n in cs)}</span><b>{t} palette</b><small>{E(d)}</small></a>' for t, u, d, cs in PALETTES)
    return f'''  <section id="colour" aria-labelledby="clh">
    <div class="sechead"><div><span class="mono eyebrow">Colour intelligence</span><h2 id="clh">The colours ahead.</h2></div><p>Seasonal palettes with core and accent roles, Pantone TCX references and how to use them. <a href="colour.html">Colour forecasts →</a></p></div>
    <div class="pal">{cards}</div>
  </section>
'''


_MON = {m: i for i, m in enumerate(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], 1)}


def latest_news(n=6):
    """Newest region news across all six regions: (region, date, title, summary, sources).
    Sorted by month (newest first); within a month, regions take turns so one region never fills the list."""
    rows = []
    for r in RG.REGIONS:
        for i, (d, t, p, src) in enumerate(r.get('news', [])):
            mo, _, yr = d.partition(' ')
            rows.append(((int(yr or 0), _MON.get(mo[:3], 0)), i, r, d, t, p, src))
    rows.sort(key=lambda x: (-x[0][0], -x[0][1], x[1]))
    return [(r, d, t, p, src) for _, _, r, d, t, p, src in rows[:n]]


def news_strip(n=4):
    out = []
    for r, d, t, p, src in latest_news(n):
        out.append(f'<a class="hn" href="region-{r["slug"]}.html#news"><small>{E(r["name"])} · {E(d)}</small><b>{E(t)}</b><span>{E(p)}</span>'
                   f'<em>Source: {E(", ".join(x[0] for x in src))}</em></a>')
    return ''.join(out)


def blocks(M, SEAS, islug):
    return {'SEASONCARDS': season_cards(M, SEAS), 'REGIONCARDS': region_cards(), 'SPOTLIGHT': spotlight(M, SEAS, islug), 'COLOUR': colour_block(), 'NEWSSTRIP': news_strip()}


# --- "This week at Forecut" (Oct 2026): newest details, latest Journal, Celebrity Style Watch and the coming calendar ---
import datetime as _dt, json as _json, os as _os

# (date, label, link) — public dates: FHCM calendar (fhcm.paris), festival calendars. Past dates drop off automatically.
CALENDAR = [
    (_dt.date(2026, 11, 8), 'Diwali', 'india.html'),
    (_dt.date(2026, 11, 27), 'Black Friday', 'region-north-america.html'),
    (_dt.date(2026, 12, 1), 'Pre-Fall 27 collections begin (Dec – Jan)', 'pre-fall-27.html'),
    (_dt.date(2027, 1, 19), 'Paris Menswear AW27 (19–24 Jan)', 'region-europe.html'),
    (_dt.date(2027, 1, 25), 'Paris Haute Couture SS27 (25–28 Jan)', 'couture.html'),
    (_dt.date(2027, 2, 6), 'Lunar New Year', 'region-asia.html'),
    (_dt.date(2027, 2, 8), 'Ramadan begins (expected)', 'region-asia.html'),
    (_dt.date(2027, 3, 1), 'Paris Womenswear AW27 (1–9 Mar)', 'aw27.html'),
]


def today():
    return _dt.date.today()


def hero_tag():
    nxt = next((c for c in CALENDAR if c[0] >= today()), None)
    t = f'Live · updated {today().strftime("%-d %b")}'
    return t + (f' · Next: {E(nxt[1].split(" (")[0])}, {nxt[0].strftime("%-d %b")}' if nxt else '')


def this_week(M, SEAS, islug):
    names = _json.load(open('new_this_month.json')) if _os.path.exists('new_this_month.json') else []
    idx = {it['name']: (k, it) for k, v in M.items() for it in v}
    cards = []
    for n in names:
        if n not in idx: continue
        k, it = idx[n]
        si = next((i for i, c in enumerate(it['life']) if c in ST), None)
        if si is None: continue
        st = it['life'][si]
        sl = islug(n)
        ph = next((c for c in (sl + '-photo', f'{sl}-{SEAS[si]}-photo', sl) if _os.path.exists(f'../img/{c}.webp')), None)
        art = (f'<span class="nwi"><img src="img/{ph}.webp" alt="{E(n)}" loading="lazy" width="400" height="400"></span>' if ph
               else f'<span class="nwi nwt {ST[st][0]}"><b>{E(it.get("area", ""))}</b></span>')
        cards.append(f'<a class="nwc" href="{SEAS[si]}.html?q={sl.replace("-", "+")}#list">{art}<span class="nwb">'
                     f'<span class="pill {ST[st][0]}">{SEAS[si].upper()} · {ST[st][1]}</span><b>{E(n)}</b>'
                     f'<small>{E(k.replace("|", " · "))}</small><span class="nwn">{E(it.get("note", ""))}</span></span></a>')
    import journal_data as _JD
    a = _JD.ARTICLES[0]
    hero = a.get('hero_new') if a.get('hero_new') and _os.path.exists(f"../img/{a['hero_new']}.webp") else a.get('hero')
    cal = ''.join(f'<li><a href="{u}"><time datetime="{d.isoformat()}">{d.strftime("%-d %b")}</time><span>{E(t)}</span></a></li>'
                  for d, t, u in [c for c in CALENDAR if c[0] >= today()][:5])
    side = (f'<a class="twj" href="{a["slug"]}.html"><span class="twjp"><img src="img/{hero}.webp" alt="" loading="lazy" width="800" height="500"></span>'
            f'<small>Latest Journal · {E(a["tag"])}</small><b>{E(a["title"])}</b></a>'
            '<a class="twc" href="celebrity-style.html"><small>Weekly</small><b>Celebrity Style Watch</b><span>Red-carpet looks by region, who designed them, and the Forecut details they show.</span></a>'
            f'<div class="twcal"><small>Coming up</small><ul>{cal}</ul></div>')
    return (f'''  <section id="thisweek" aria-labelledby="twh">
    <div class="sechead"><div><span class="mono eyebrow">This week at Forecut · updated {today().strftime("%-d %b %Y")}</span><h2 id="twh">What's new.</h2></div><p>The newest details added from runways, fashion weeks and retail, the latest analysis, and what's coming on the global calendar.</p></div>
    <div class="twgrid"><div class="twmain"><div class="twlab"><b>{len(cards)} new details this month</b><a href="search.html">Search all details →</a></div><div class="nwrow" tabindex="0" aria-label="New details, scroll sideways">{"".join(cards[:10])}</div>{__import__("landing").next_sales(8)}</div>
    <aside class="twside">{side}</aside></div>
  </section>
''')


_blocks0 = blocks


def blocks(M, SEAS, islug):
    b = _blocks0(M, SEAS, islug)
    b.update({'THISWEEK': this_week(M, SEAS, islug), 'HEROTAG': hero_tag()})
    return b
