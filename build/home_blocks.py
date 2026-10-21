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


def blocks(M, SEAS, islug):
    return {'SEASONCARDS': season_cards(M, SEAS), 'REGIONCARDS': region_cards(), 'SPOTLIGHT': spotlight(M, SEAS, islug), 'COLOUR': colour_block()}
