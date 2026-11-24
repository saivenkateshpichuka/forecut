"""Forecast tree from the final pipeline (24 Nov 2026): season > audience > topic > report.

Seven audiences: men, women, kids, toddler boys, toddler girls, boys, girls. Footwear sits inside each audience.
Every report page has a browser-made PDF (print to A4 landscape). Called from build_v2.main(); V is the build_v2 module.
"""
import os, re, sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import kids_data as KD  # noqa: E402

AUDS = [('mens', 'Men', 'Menswear and men\'s footwear'), ('womens', 'Women', 'Womenswear and women\'s footwear'),
        ('kids', 'Kids', 'All kidswear, with kids\' footwear'), ('toddler-boys', 'Toddler boys', 'Ages 1 to 4'),
        ('toddler-girls', 'Toddler girls', 'Ages 1 to 4'), ('boys', 'Boys', 'Ages 5 to 14'), ('girls', 'Girls', 'Ages 5 to 14')]
AUD = {a[0]: a for a in AUDS}
KIDS = {'kids', 'toddler-boys', 'toddler-girls', 'boys', 'girls'}
TODDLER = {'toddler-boys', 'toddler-girls'}
CFDEPT = {'mens': 'menswear', 'womens': 'womenswear'}

TOPICS = [('themes', 'Season themes', 'The season\'s big stories, told for this audience.'),
          ('colours', 'Colours', 'Season colours, theme colours and colour stories, with Pantone TCX and HEX.'),
          ('silhouettes', 'Silhouettes', 'Woven and knit shapes: what to lead with and what comes next.'),
          ('fabrics', 'Fabrics', 'Woven and knit fabrics, finishes and prints.'),
          ('trims', 'Trims', 'Trending trims, trim stories, market strategy and trim innovation.'),
          ('styling', 'Styling', 'Celebrity-inspired, casual, formal and party looks built from the forecast.'),
          ('couture', 'Couture', 'Couture ideas and how they reach ready-to-wear.'),
          ('business', 'Business strategy', 'Range plan, price positioning and markets.'),
          ('innovations', 'Innovations', 'New materials and processes worth testing.')]
TOPIC = {t[0]: t for t in TOPICS}
FWCATS = {'mens': ("Footwear|Men's Shoes", 'Footwear|Sneakers & Casual'), 'womens': ('Footwear|Heels & Flats', 'Footwear|Boots', 'Footwear|Sneakers & Casual')}
KIDFAB = {'w': 'Soft, washable cottons and blends; pre-shrunk, colour-fast and tested for children\'s wear.',
          'k': 'Soft jersey, fleece or fine knit with stretch for movement; flat seams against the skin.',
          'f': 'Flexible soles with grip, padded collars and easy closures a child can manage alone.'}
STORD = 'rpef'
KNITW = re.compile(r'\b(knit|knitted|jersey|rib|ribbed|cable|merino|cashmere|mohair|yarn|wool|fleece|crochet|pointelle|intarsia|jacquard knit|fair isle|sweater|cardigan|tee|t-shirt)\b', re.I)
COVERMAP = {'themes': 'themes', 'colours': 'colour', 'silhouettes': None, 'fabrics': 'fabrics', 'trims': 'trims', 'styling': None,
            'couture': 'themes', 'business': 'themes', 'innovations': 'fabrics'}


# ------------------------------------------------------------ data
def cls(V, it, kind):
    if kind == 'f':
        return 'shoe'
    if it['area'] in V.FAB:
        return 'fabric'
    if it['area'] in V.TRIM and it['area'] not in ('Hem', 'Pleat'):
        return 'trim'
    return 'sil'


def pool(V, aud, s):
    """(key, item, stage, next stage, kind, class) for one audience and season."""
    si = V.SKEYS.index(s)
    raw = []
    if aud in KIDS:
        for k, it in KD.items_for(aud):
            it.setdefault('desc', {'f': KIDFAB[it['kind']]})
            raw.append((k, it, it['kind']))
    else:
        dept = 'Menswear' if aud == 'mens' else 'Womenswear'
        for k, L in V.DET.items():
            if k.split('|')[0] == dept or k in FWCATS[aud]:
                for it in L:
                    raw.append((k, it, 'f' if k.startswith('Footwear') else 'k' if (k.endswith('|Knitwear') or KNITW.search(it['name'])) else 'w'))
    out = []
    for k, it, kd in raw:
        st = it['life'][si]
        if st == '-':
            continue
        out.append((k, it, st, it['life'][si + 1] if si + 1 < 5 else '', kd, cls(V, it, kd)))
    return out


def srt(V, s, xs):
    return sorted(xs, key=lambda x: (STORD.find(x[2]), V.photo(x[1]['name'], s) is None, x[1]['name']))


def split2(V, s, xs):
    xs = srt(V, s, xs)
    a = [x for x in xs if x[2] in 'rp']
    b = [x for x in xs if x[2] in 'ef']
    if len(xs) < 6:
        return xs, srt(V, s, [x for x in xs if x[2] in 'ef']) + [x for x in xs if x[2] in 'rp']
    if len(a) < 3 or len(b) < 3:
        h = (len(xs) + 1) // 2
        a, b = xs[:h], xs[h:]
    return a, b


def t4(x):
    return x[:4]


def cf_dept(V, s, aud):
    return V.CF[s]['dept'][CFDEPT.get(aud, 'kidswear')]


def themes_for(V, s, aud):
    """(title, story, key pieces text, lead hex, accent hex, adult theme row or None) for the four themes."""
    out = []
    if aud in KIDS:
        cs = cf_dept(V, s, aud)['colours']
        for i, (src, title, story, keyp) in enumerate(KD.KTHEMES[s]):
            row = next((t for t in V.META[s]['themes'] if t[0] == src), None)
            out.append((title, story, keyp, cs[i % len(cs)]['hex'], cs[(i + 2) % len(cs)]['hex'], row))
    else:
        for t in V.META[s]['themes'][:4]:
            th = V.THEMES.get(f'{s}|{t[0]}', {})
            out.append((t[0], th.get('story', t[1]), ', '.join(t[6]), t[3], t[4], t))
    return out


def theme_pieces(V, s, aud, P, n):
    title, story, keyp, a, b, row = themes_for(V, s, aud)[n]
    if aud in KIDS:
        want = [w.strip().lower() for w in keyp.split(',')]
        hit = [x for x in P if x[1]['name'].lower() in want]
        words = set(w for w in re.findall(r'[a-z]{5,}', (story + ' ' + keyp).lower()))
        more = [x for x in P if x not in hit and words & set(re.findall(r'[a-z]{5,}', (x[1]['name'] + ' ' + x[1]['note']).lower()))]
        return hit + srt(V, s, more)[:8]
    return srt(V, s, [x for x in P if row[0] in V.theme_hits(s, x[1])])


# ------------------------------------------------------------ report list per audience
def reports(aud):
    kid = aud in KIDS
    R = {
        'themes': [(f'themes-{i}', None, None) for i in range(1, 5)],
        'colours': [('colours-season', 'Season colours', 'The palette for this audience, with footwear colours and combinations.')] +
                   [(f'colours-theme-{i}', None, None) for i in range(1, 4)] +
                   [('colours-stories', 'Colour stories', 'How the season\'s colours combine, story by story.')],
        'silhouettes': [('silhouettes-woven-1', 'Woven silhouettes, report 1', 'Leading woven shapes: rising and peaking.'),
                        ('silhouettes-woven-2', 'Woven silhouettes, report 2', 'Next woven shapes to test, and the ones to exit.'),
                        ('silhouettes-knit-1', 'Knit silhouettes, report 1', 'Leading knit shapes: rising and peaking.'),
                        ('silhouettes-knit-2', 'Knit silhouettes, report 2', 'Next knit shapes to test, and the ones to exit.')],
        'fabrics': [('fabrics-woven-1', 'Woven fabrics, report 1', 'Leading woven fabrics, finishes and prints.'),
                    ('fabrics-woven-2', 'Woven fabrics, report 2', 'Woven fabrics to test next, and the ones to exit.'),
                    ('fabrics-knit-1', 'Knit fabrics, report 1', 'Leading knit fabrics, yarns and textures.'),
                    ('fabrics-knit-2', 'Knit fabrics, report 2', 'Knit fabrics to test next, and the ones to exit.')],
        'trims': [('trims-trending-1', 'Trending trims, report 1', 'Trims that are rising and peaking now.'),
                  ('trims-trending-2', 'Trending trims, report 2', 'New trims to test in small runs.'),
                  ('trims-stories-1', 'Trim stories, report 1', 'Trims for the first season theme.'),
                  ('trims-stories-2', 'Trim stories, report 2', 'Trims for the second season theme.'),
                  ('trims-market-strategy-1', 'Trims market strategy, report 1', 'Trims to build into the range, by market.'),
                  ('trims-market-strategy-2', 'Trims market strategy, report 2', 'Trims to sell through and exit.'),
                  ('trims-innovation-1', 'Trim innovation, report 1', 'Closures and hardware.'),
                  ('trims-innovation-2', 'Trim innovation, report 2', 'Finishes, stitching and craft.')],
        'styling': [('styling-celebrity', 'Celebrity-inspired styling', 'Statement looks in the spirit of red-carpet and street-style dressing.'),
                    ('styling-casual', 'Casual wear', 'Everyday looks built from the season\'s pieces.'),
                    ('styling-formal', 'Formal wear', 'Ceremony, office and occasion looks.' if not kid else 'Ceremony, school event and family occasion looks.'),
                    ('styling-party', 'Party wear', 'Evening, festive and celebration looks.' if not kid else 'Birthday, festive and holiday party looks.')],
        'couture': [('couture-1', 'Couture ideas, report 1' if not kid else 'Occasion wear, report 1', 'Couture techniques and what they mean this season.' if not kid else 'Party and ceremony pieces children can wear comfortably.'),
                    ('couture-2', 'Couture to ready-to-wear, report 2' if not kid else 'Festive and wedding wear, report 2', 'How to translate couture ideas at your price.' if not kid else 'Festive and wedding pieces, with safety notes.')],
        'business': [('business-1', 'Range plan, report 1', 'What to build, test, sell through and exit, category by category.'),
                     ('business-2', 'Price and markets, report 2', 'Price positioning and the markets where the season sells.')],
        'innovations': [('innovations-1', 'Materials, report 1', 'New fibres and materials worth testing.'),
                        ('innovations-2', 'Making and finishing, report 2' if not kid else 'Safer and longer-lasting design, report 2',
                         'New finishes and making methods.' if not kid else 'Safer materials and grow-with-me design.')],
    }
    return R


def rtitle(V, s, aud, suf, title):
    if title:
        return title
    if suf.startswith('themes-'):
        return 'Theme: ' + themes_for(V, s, aud)[int(suf[-1]) - 1][0]
    if suf.startswith('colours-theme-'):
        return 'Theme colours: ' + themes_for(V, s, aud)[int(suf[-1]) - 1][0]
    return suf


def rdesc(V, s, aud, suf, desc):
    if desc:
        return desc
    n = int(suf[-1]) - 1
    t = themes_for(V, s, aud)[n]
    return t[1] if suf.startswith('themes-') else f'The lead and accent colours of {t[0].lower()}, with combinations.'


# ------------------------------------------------------------ html helpers
def E(V, x):
    return V.E(x)


def slug(s, aud, suf=''):
    return f'{s}-{aud}' + (f'-{suf}' if suf else '')


def hero_for(V, s, aud, its, theme_img=None):
    if theme_img and theme_img in V.IMG:
        return V.img(theme_img, '')
    ps = [V.photo(x[1]['name'], s) for x in its]
    ps = [p for p in ps if p]
    if ps:
        return V.img(ps[0], '')
    cs = cf_dept(V, s, aud)['colours']
    return '<div class="cmos">' + ''.join(f'<i style="background:{c["hex"]};--k:{n}"></i>' for n, c in enumerate(cs)) + '</div>'


def shell(V, s, aud, title, desc, crumbs, hero, lead, secs, body, data, pdf=True, sub=''):
    m = V.META[s]
    a = AUD[aud]
    h = V.head(f'{m["code"]} {a[1]}: {title} | Forecut', desc[:300]) + V.nav_app('Forecasts') + '<main id="main">'
    h += ('<div class="w crumb"><a href="/forecasts.html">Forecasts</a> / ' + f'<a href="/forecasts.html#{s}">{m["code"]}</a> / ' +
          ''.join(f'<a href="{u}">{V.E(t)}</a> / ' for u, t in crumbs) + f'{V.E(title)}</div>')
    btns = (f'<a class="btn" href="#{secs[1][0] if len(secs) > 1 else secs[0][0]}">{V.E(secs[1][1] if len(secs) > 1 else secs[0][1])}</a>' +
            ('<button class="btn o" type="button" data-print>Download PDF</button>' if pdf else ''))
    h += (f'<section class="w rhead"><div class="chhero">{hero}</div><div class="rinfo"><p class="small gr">{V.E(a[1])}, {V.E(m["title"])}, {V.E(m["stage"].lower())}{". " + V.E(sub) if sub else ""}</p>'
          f'<h1 class="dsp">{V.E(title)}</h1><p class="lead">{V.E(lead)}</p><div class="ctas">{btns}</div>'
          f'<p class="small gr">Updated {V.TODAY.strftime("%-d %B %Y")}.</p></div></section>')
    if secs:
        h += '<nav class="rnav" aria-label="On this page"><div class="w">' + ''.join(f'<a href="#{x}">{t}</a>' for x, t in secs) + '</div></nav>'
    h += (f'<div class="w gate hide" id="gate"><h2 class="dsp" style="font-size:32px">Read the full report free</h2><p class="gr" style="margin:12px 0 22px">Sign up to read every section and download the PDF. It takes under a minute.</p>'
          f'<a class="btn" href="/account.html#signup">Sign up free</a> <a class="btn o" href="/account.html#signin" style="margin-left:8px">Log in</a></div>'
          f'<div class="w" id="report">{body}<p class="small gr src">Forecut\'s own forecast, built from public runway, trade fair and retail evidence. Sources: {V.E(m.get("sources", ""))}</p></div></main>')
    h += '<div class="prt-foot">forecut.in</div>' + V.DM_HTML
    import json
    dj = json.dumps({'items': data, 'seasons': [V.META[k]['code'] for k in V.SKEYS], 'si': V.SKEYS.index(s)}, ensure_ascii=False).replace('</', '<\\/')
    return h + V.footer() + V.end(f'<script>window.FC_ITEMS={dj}</script>')


def sec(i, t, sub, inner):
    return f'<section class="rs" id="{i}"><div class="rsh"><h2 class="dsp">{t}</h2><p class="gr">{sub}</p></div>{inner}</section>'


def btns(V, s, aud, xs, data):
    if not xs:
        return '<p class="gr">Pieces for this report are added as the season is tracked.</p>'
    colour = cf_dept(V, s, aud)['colours'][0]['hex']
    return '<div class="g g4 items">' + V.item_btns(s, [x[:4] for x in xs], data, colour) + '</div>'


def staged(V, s, aud, xs, data):
    stxt = {'e': 'New ideas to test in small quantities.', 'r': 'Growing fast: build these into the range.', 'p': 'At their height: sell through, do not add depth.', 'f': 'Moving out: reduce or rework.'}
    h = ''
    for st in 'repf':
        g = [x for x in xs if x[2] == st]
        if g:
            h += f'<div class="stg"><h3 class="dsp">{V.STAGE[st][0]}</h3><p class="gr">{stxt[st]}</p></div>' + btns(V, s, aud, g, data)
    return h or btns(V, s, aud, [], data)


def notes(V, s, xs, n=4):
    h = '<div class="notes">'
    for k, it, st, nx, kd, c in xs[:n]:
        p = V.photo(it['name'], s)
        ds = V.DESCMOD.build(k.split('|')[0], k.split('|')[1], it)
        h += (f'<article class="note1"><div class="nim2">{V.img(p, it["name"]) if p else ""}</div><div><p class="small gr">{V.E(k.replace("|", ", "))}, <b class="{V.STAGE[st][1]}">{V.STAGE[st][0].lower()}</b></p>'
              f'<h3 class="dsp">{V.E(it["name"])}</h3><p>{V.E(ds["o"])}</p><div class="g g3 split" style="gap:20px;margin-top:14px"><div><h4>Design notes</h4><ul class="ul small gr">' +
              ''.join(f'<li>{V.E(x)}</li>' for x in ds['d']) + f'</ul></div><div><h4>Fabric and trims</h4><p class="small gr">{V.E(ds["f"])}</p></div><div><h4>Where to use it</h4><p class="small gr">{V.E(ds["u"])}</p></div></div></div></article>')
    return h + '</div>'


def palette(V, s, aud):
    d = cf_dept(V, s, aud)
    return f'<p class="gr" style="max-width:52em;margin-bottom:18px">{V.E(d["text"])}</p><div class="chips">' + ''.join(V.chip(c) for c in d['colours']) + '</div>'


def strategy(V, xs):
    cols = [('Build depth', 'r'), ('Test small', 'e'), ('Sell through', 'p'), ('Exit or rework', 'f')]
    return '<div class="g g4 strat">' + ''.join(
        f'<div><h3>{a}</h3><p class="small gr">{V.STAGE[st][0]} pieces</p><ul>' + (''.join(f'<li>{V.E(x[1]["name"])}</li>' for x in [x for x in xs if x[2] == st][:6]) or '<li class="gr">Nothing at this stage</li>') + '</ul></div>'
        for a, st in cols) + '</div>'


def safety(V, aud):
    pts = ['No drawstrings at the hood or neck; waist cords must not hang loose. Follow EN 14682 and your market\'s own rules.',
           'Test snaps, buttons and trims for pull strength, and check flammability rules for nightwear, costumes and party wear.',
           'Use flat seams and printed care labels where skin is sensitive; choose certified dyes and finishes.']
    if aud in TODDLER or aud == 'kids':
        pts.insert(0, 'For under-3s, avoid small parts: no beads, sequins or loose pom-poms. Use snaps, sewn-down appliqué and embroidery instead.')
    if aud in ('girls', 'boys'):
        pts.insert(0, 'Sequins, beads and small hardware suit ages 5 and up only; sew them securely and test them.')
    return sec('safety', 'Safety notes', 'Check these before sampling.', '<ul class="ul acts">' + ''.join(f'<li>{V.E(p)}</li>' for p in pts) + '</ul>')


def more_block(V, s, aud, topic, cur):
    rs = reports(aud)[topic]
    cards = ''.join(f'<a class="chc tr" href="/{slug(s, aud, suf)}.html"><span class="cht">{V.E(rtitle(V, s, aud, suf, t))}</span><span class="small gr">{V.E(rdesc(V, s, aud, suf, d))}</span></a>'
                    for suf, t, d in rs if suf != cur)
    oth = ''.join(f'<a class="atp" href="/{slug(s, aud, k)}.html">{V.E(t)}</a>' for k, t, _ in TOPICS if k != topic)
    return (f'<section class="rs" id="more"><div class="rsh"><h2 class="dsp">More in {V.E(TOPIC[topic][1].lower())}</h2><p class="gr"><a class="lk" href="/{slug(s, aud, topic)}.html">All {V.E(TOPIC[topic][1].lower())} reports</a></p></div>'
            f'<div class="chg">{cards}</div><h3 class="sub">Other topics</h3><div class="atps">{oth}</div></section>')


def articles(V, prefix, want=()):
    out = []
    for f in sorted(os.listdir(V.ROOT)):
        if f.startswith(prefix) and f.endswith('.html') and f != prefix.rstrip('-') + '.html':
            t = re.search(r'<title>([^<|]*)', open(os.path.join(V.ROOT, f), encoding='utf-8', errors='ignore').read(4000))
            if t:
                out.append((f[:-5], t.group(1).strip()))
    if want:
        out.sort(key=lambda a: not any(w in a[0] for w in want))
    return out


def arts_html(V, arts):
    return '<ul class="ul srcl">' + ''.join(f'<li><a href="/{u}.html">{V.E(t)}</a></li>' for u, t in arts) + '</ul>'


# ------------------------------------------------------------ styling
SLOTS = {
    'mens': [('Top', ('Menswear|Shirts & Polos', 'Menswear|Knitwear')), ('Bottom', ('Menswear|Trousers',)), ('Layer', ('Menswear|Outerwear', 'Menswear|Tailoring')), ('Shoes', FWCATS['mens'])],
    'womens': [('Top', ('Womenswear|Tops & Shirts', 'Womenswear|Knitwear', 'Womenswear|Dresses')), ('Bottom', ('Womenswear|Trousers & Skirts', 'Womenswear|Denim')),
               ('Layer', ('Womenswear|Coats & Jackets', 'Womenswear|Tailoring')), ('Shoes', FWCATS['womens'])],
    'kid': [('Top', ('Kidswear|Tops', 'Kidswear|Knitwear', 'Kidswear|Dresses', 'Kidswear|Sets')), ('Bottom', ('Kidswear|Bottoms',)),
            ('Layer', ('Kidswear|Outerwear', 'Kidswear|Knitwear', 'Kidswear|Occasion')), ('Shoes', ('Kidswear|Footwear',))],
}
MODEW = {
    'formal': ['tailor', 'blazer', 'suit', 'waistcoat', 'trouser', 'loafer', 'oxford', 'derby', 'shirt', 'coat', 'pleat', 'court', 'collar', 'kurta', 'chino', 'mary jane'],
    'party': ['velvet', 'sequin', 'satin', 'party', 'metallic', 'embellish', 'slip', 'mirror', 'gota', 'kurta', 'heel', 'mary jane', 'jutti', 'tulle', 'sheer', 'lace', 'bow', 'drape', 'glitter'],
    'casual': ['jersey', 'denim', 'jean', 'sweat', 'cargo', 'trainer', 'sneaker', 'runner', 'polo', 'knit', 'jogger', 'overshirt', 'short', 'sandal', 'tee', 'fleece', 'puffer', 'utility'],
}
OUTN = {
    'celebrity': (['Red-carpet arrival', 'Airport off-duty', 'Press-day tailoring', 'Front-row statement'], ['Weekend star', 'Premiere ready', 'Photo-call casual', 'Festival front row']),
    'casual': (['Weekend', 'City errands', 'Travel day', 'Café afternoon'], ['School run', 'Park day', 'Holiday', 'Playdate']),
    'formal': (['Office', 'Client meeting', 'Ceremony guest', 'Dinner'], ['Wedding guest', 'School event', 'Family portrait', 'Family ceremony']),
    'party': (['Evening out', 'Cocktail', 'Festive', 'Celebration'], ['Birthday party', 'Festive', 'Holiday party', 'Recital']),
}


def outfits(V, s, aud, P, mode):
    kid = aud in KIDS
    slots = SLOTS['kid' if kid else aud]
    base = [x for x in P if x[5] in ('sil', 'shoe')] or P

    def score(x):
        t = (x[1]['name'] + ' ' + x[1]['note']).lower()
        if mode == 'celebrity':
            m = sum(w in t for w in MODEW['party'] + MODEW['formal']) + (2 if x[2] in 'rp' else 0)
        else:
            m = sum(w in t for w in MODEW[mode])
        return (-m, STORD.find(x[2]), x[1]['name'])
    cands = []
    for lbl, cats in slots:
        c = sorted([x for x in base if x[0] in cats], key=score) or sorted([x for x in P if x[0] in cats], key=score)
        cands.append((lbl, c))
    names_ = OUTN[mode][1 if kid else 0]
    cs = cf_dept(V, s, aud)['colours']
    out = []
    for i in range(4):
        look, used = [], set()
        for lbl, c in cands:
            pick = next((x for j, x in enumerate(c[i:] + c[:i]) if x[1]['name'] not in used), None)
            if pick:
                used.add(pick[1]['name'])
                look.append((lbl, pick))
        col = (cs[i % len(cs)], cs[(i + 3) % len(cs)])
        out.append((names_[i], look, col))
    return out


# ------------------------------------------------------------ pages
def hub(V, s, aud):
    m = V.META[s]
    a = AUD[aud]
    P = pool(V, aud, s)
    lead = srt(V, s, [x for x in P if x[2] in 'rp'])
    data = []
    intro = (f'{m["intro"]}' if aud not in KIDS else f'Kidswear follows adult direction a season or two later, adapted for comfort, safety and growth. {m["intro"]}')
    body = ''
    cards = ''
    for k, t, d in TOPICS:
        t2 = 'Occasion wear' if (k == 'couture' and aud in KIDS) else t
        rs = reports(aud)[k]
        cards += (f'<div class="tpc"><a class="tph" href="/{slug(s, aud, k)}.html"><h3 class="dsp">{V.E(t2)}</h3><p class="small gr">{V.E(d)}</p></a><ul>' +
                  ''.join(f'<li><a href="/{slug(s, aud, suf)}.html">{V.E(rtitle(V, s, aud, suf, tt))}</a></li>' for suf, tt, _ in rs) + '</ul></div>')
    body += sec('topics', 'Topics', 'Every report for this audience and season. Each report has its own PDF.', f'<div class="tpcs">{cards}</div>')
    body += sec('leading', 'Leading now', 'The pieces to build the season on. Select any piece for its trend curve and design notes.', btns(V, s, aud, [x for x in lead if x[5] != 'shoe'][:8], data))
    fw = srt(V, s, [x for x in P if x[5] == 'shoe'])
    body += sec('footwear', 'Footwear', 'Shoes for this audience, inside the same forecast.', btns(V, s, aud, fw[:8], data))
    body += sec('colour', 'Colour', 'The season palette for this audience.', palette(V, s, aud))
    if aud in KIDS:
        body += safety(V, aud)
    sw = ''.join(f'<a class="atp{" on" if k == s else ""}" href="/{slug(k, aud)}.html">{V.META[k]["code"]}</a>' for k in V.SKEYS)
    aw = ''.join(f'<a class="atp{" on" if k == aud else ""}" href="/{slug(s, k)}.html">{V.E(t)}</a>' for k, t, _ in AUDS)
    body += sec('more', 'More forecasts', 'Switch season or audience.', f'<div class="atps">{sw}</div><div class="atps" style="margin-top:12px">{aw}</div>')
    secs = [('topics', 'Topics'), ('leading', 'Leading now'), ('footwear', 'Footwear'), ('colour', 'Colour')] + ([('safety', 'Safety')] if aud in KIDS else []) + [('more', 'More')]
    return shell(V, s, aud, a[1], f'{m["code"]} {a[1].lower()} forecast. {intro}', [], hero_for(V, s, aud, lead), intro, secs, body, data, pdf=False, sub=a[2])


def topic_page(V, s, aud, topic):
    m = V.META[s]
    k, t, d = TOPIC[topic]
    if topic == 'couture' and aud in KIDS:
        t = 'Occasion wear'
    rs = reports(aud)[topic]
    P = pool(V, aud, s)
    cards = ''.join(f'<a class="chc tr" href="/{slug(s, aud, suf)}.html"><span class="cht">{V.E(rtitle(V, s, aud, suf, tt))}</span><span class="small gr">{V.E(rdesc(V, s, aud, suf, dd))}</span><span class="lk small">Read the report</span></a>'
                    for suf, tt, dd in rs)
    body = sec('reports', 'Reports', 'Each report is a page with its own PDF.', f'<div class="chg">{cards}</div>')
    body += more_block(V, s, aud, topic, '')
    want = {'silhouettes': 'sil', 'fabrics': 'fabric', 'trims': 'trim'}.get(topic)
    lead = srt(V, s, [x for x in P if (x[5] == want if want else True) and x[2] in 'rp'])
    return shell(V, s, aud, t, f'{m["code"]} {AUD[aud][1].lower()} {t.lower()}: {d}', [(f'/{slug(s, aud)}.html', AUD[aud][1])], hero_for(V, s, aud, lead), d,
                 [('reports', 'Reports'), ('more', 'More')], body, [], pdf=False)


def report(V, s, aud, topic, suf, title, desc):
    m = V.META[s]
    a = AUD[aud]
    kid = aud in KIDS
    P = pool(V, aud, s)
    title = rtitle(V, s, aud, suf, title)
    desc = rdesc(V, s, aud, suf, desc)
    data = []
    secs, body, lead, hero_its, timg = [], '', desc, [], None

    def add(i, t, sub, inner):
        nonlocal body
        secs.append((i, t))
        body += sec(i, t, sub, inner)

    parts = suf.split('-')
    n = int(parts[-1]) if parts[-1].isdigit() else 0

    if topic in ('silhouettes', 'fabrics'):
        kd = parts[1]
        want = 'sil' if topic == 'silhouettes' else 'fabric'
        xs = [x for x in P if x[5] == want and ((x[4] == 'k') if kd == 'knit' else (x[4] == 'w'))]
        r1, r2 = split2(V, s, xs)
        its = r1 if n == 1 else r2
        hero_its = its
        lead = (f'Build around {V.names(its, 3)}.' if n == 1 else f'Test {V.names([x for x in its if x[2] == "e"] or its, 3)}.') + ' ' + desc
        add('overview', 'Overview', 'The short version.', f'<p class="key" style="font-size:22px;max-width:40em;line-height:1.35">{V.E(lead)}</p>')
        add('pieces', 'Key pieces', 'Select any piece for its design notes, trend curve and lifecycle.', staged(V, s, aud, its, data))
        add('development', 'How it develops', 'Each piece across the five seasons.', V.lc_table(s, [x[:4] for x in its[:14]]) if its else '')
        add('notes', 'Design notes', 'How to put the leading pieces into a range.', notes(V, s, its))
        add('colour', 'Colour', 'The season palette for this audience, with Pantone TCX and HEX.', palette(V, s, aud))
        add('strategy', 'Strategy', 'What to build, test, sell through and drop.', strategy(V, its))
    elif topic == 'trims':
        T = srt(V, s, [x for x in P if x[5] == 'trim'])
        kind = parts[1] if parts[1] != 'market' else 'market'
        if kind == 'trending':
            r1, r2 = split2(V, s, T)
            its = r1 if n == 1 else r2
        elif kind == 'stories':
            th = themes_for(V, s, aud)[n - 1]
            words = set(re.findall(r'[a-z]{5,}', (th[0] + ' ' + th[1] + ' ' + th[2]).lower()))
            if not kid:
                its = [x for x in T if th[5][0] in V.theme_hits(s, x[1])]
            else:
                its = [x for x in T if words & set(re.findall(r'[a-z]{5,}', (x[1]['name'] + ' ' + x[1]['note']).lower()))]
            if len(its) < 3:
                its = (its + [x for x in T if x not in its])[:6] if n == 1 else (its + [x for x in T[::-1] if x not in its])[:6]
            title = f'Trim story: {th[0]}'
            lead = f'Trims for {th[0].lower()}. {th[1]}'
        elif kind == 'market':
            its = [x for x in T if x[2] in ('re' if n == 1 else 'pf')] or T[:6]
        else:
            hw = {'Closure', 'Hardware', 'Strap'}
            its = [x for x in T if (x[1]['area'] in hw) == (n == 1)] or T
        if len(its) < 4 and kind != 'stories':
            its = its + [x for x in T if x not in its][:4 - len(its)]
        hero_its = its
        if kind != 'stories':
            lead = (f'Lead with {V.names(its, 3)}. ' if its else '') + desc
        add('overview', 'Overview', 'The short version.', f'<p class="key" style="font-size:22px;max-width:40em;line-height:1.35">{V.E(lead)}</p>')
        add('pieces', 'Key trims', 'Select any trim for its design notes and lifecycle.', staged(V, s, aud, its, data))
        add('development', 'How it develops', 'Each trim across the five seasons.', V.lc_table(s, [x[:4] for x in its[:14]]) if its else '')
        if kind == 'market':
            add('markets', 'By market', 'Regional direction for the season, with the trims that fit each market.', markets(V, s, P, its))
        add('notes', 'Design notes', 'How to use the trims.', notes(V, s, its))
        add('strategy', 'Strategy', 'What to build, test, sell through and drop.', strategy(V, its))
    elif topic == 'themes':
        t = themes_for(V, s, aud)[n - 1]
        its = theme_pieces(V, s, aud, P, n - 1)
        hero_its = its
        timg = f'theme-{s}-{V.islug(t[5][0])}' if (t[5] and not kid) else None
        lead = t[1]
        th = V.THEMES.get(f'{s}|{t[5][0]}', {}) if t[5] else {}
        story = f'<p class="key" style="font-size:22px;max-width:40em;line-height:1.35">{V.E(t[1])}</p>'
        if th.get('why'):
            story += f'<h3 class="sub">Why now</h3><p class="gr" style="max-width:52em">{V.E(th["why"])}</p>'
        if kid and t[5]:
            story += f'<p class="gr" style="max-width:52em;margin-top:12px">Adapted from the adult theme {V.E(t[5][0].lower())}.</p>'
        if th.get('brands') and not kid:
            story += '<h3 class="sub">Seen at</h3><ul class="ul gr">' + ''.join(f'<li><b style="font-weight:500;color:var(--ink)">{V.E(b[0])}</b>: {V.E(b[1])}</li>' for b in th['brands'][:6]) + '</ul>'
        story += f'<h3 class="sub">Key pieces</h3><p class="gr">{V.E(t[2])}.</p>'
        add('story', 'The story', 'What is behind it.', story)
        add('pieces', 'Key pieces', 'Select any piece for its design notes, trend curve and lifecycle.', staged(V, s, aud, its, data))
        add('development', 'How it develops', 'Each piece across the five seasons.', V.lc_table(s, [x[:4] for x in its[:14]]) if its else '')
        add('colour', 'Colour', 'The lead and accent colour of the theme.', tpair(V, s, t))
        acts = th.get('actions', [])
        add('strategy', 'Strategy', 'What to build, test, sell through and drop.', strategy(V, its) + ('<h3 class="sub">Actions</h3><ul class="ul acts">' + ''.join(f'<li>{V.E(x)}</li>' for x in acts[:6]) + '</ul>' if acts else ''))
    elif topic == 'colours':
        d = cf_dept(V, s, aud)
        cf = V.CF[s]
        if suf == 'colours-season':
            cs = d['colours']
            lead = d['text']
            fw = cf['dept']['footwear']['colours']
            add('palette', 'The palette', V.E(cf['status']) + '.', '<div class="chips">' + ''.join(V.chip(c, True) for c in cs) + '</div>')
            combos = [(cs[0], cs[1], cs[-1]), (cs[2 % len(cs)], cs[0], cs[3 % len(cs)]), (cs[1], cs[4 % len(cs)], cs[-1])]
            add('combos', 'Combinations', 'Main colour, second colour, accent.', '<div class="g g3">' + ''.join(
                f'<div class="combo"><div class="cb"><i style="background:{x["hex"]};flex:6"></i><i style="background:{y["hex"]};flex:3"></i><i style="background:{z["hex"]};flex:1"></i></div><p class="small" style="margin-top:10px"><b style="font-weight:500">{V.E(x["name"])}</b> with {V.E(y["name"].lower())}, accent {V.E(z["name"].lower())}</p></div>'
                for x, y, z in combos) + '</div>')
            add('footwear', 'Footwear colour', V.E(cf['dept']['footwear']['text']), '<div class="chips">' + ''.join(V.chip(c) for c in fw) + '</div>')
            add('development', 'Season to season', 'This palette across the five seasons.', '<div class="cdev">' + ''.join(
                f'<a href="/{slug(k, aud, "colours-season")}.html" class="crow{" now" if k == s else ""}"><span>{V.META[k]["code"]}<em>{V.E(V.CF[k]["short"])}</em></span><div>' +
                ''.join(f'<i style="background:{c["hex"]}" title="{V.E(c["name"])}"></i>' for c in cf_dept(V, k, aud)['colours']) + '</div></a>' for k in V.SKEYS) + '</div>')
        elif suf == 'colours-stories':
            lead = cf['headline']
            add('stories', 'Colour stories', 'How the colours combine.', '<div class="stories">' + ''.join(
                f'<div class="story">{V.strip(st["colours"], 120)}<div><h3 class="dsp">{V.E(st["title"])}</h3><p>{V.E(st["text"])}</p><p class="small gr" style="margin-top:8px">Use for: {V.E(st["use"])}</p>'
                f'<p class="small" style="margin-top:6px">{V.E(", ".join(x["name"] + " " + x["tcx"] for x in st["colours"]))}</p></div></div>' for st in cf['stories']) + '</div>')
            add('palette', 'Your palette', 'The audience palette these stories draw on.', palette(V, s, aud))
        else:
            t = themes_for(V, s, aud)[n - 1]
            lead = f'{t[0]}: {t[1]}'
            near = sorted(cf['key'] + d['colours'], key=lambda c: min(V.cdist(c['hex'], t[3]), V.cdist(c['hex'], t[4])))
            seen, cs = set(), []
            for c in near:
                if c['hex'] not in seen:
                    seen.add(c['hex']); cs.append(c)
            add('pair', 'Lead and accent', 'The two colours that carry the theme.', tpair(V, s, t))
            add('palette', 'Theme palette', 'The closest season colours, with Pantone TCX and HEX.', '<div class="chips">' + ''.join(V.chip(c, True) for c in cs[:5]) + '</div>')
            its = theme_pieces(V, s, aud, P, n - 1)[:8]
            hero_its = its
            add('pieces', 'Where to use it', 'Pieces from the theme to colour this way.', btns(V, s, aud, its, data))
        add('sources', 'How we built it', 'Forecut\'s own reading of public evidence.', f'<p style="max-width:52em">{V.E(cf["built"])}</p><p class="small gr" style="margin-top:10px">Pantone TCX codes are the nearest published match; confirm with a physical Pantone book before dyeing.</p>')
    elif topic == 'styling':
        mode = parts[1]
        looks = outfits(V, s, aud, P, mode)
        hero_its = [x for _, l, _ in looks for _, x in l]
        lead = desc + (' Built from this season\'s forecast pieces, with no celebrity images.' if mode == 'celebrity' else ' Built from this season\'s forecast pieces.')
        h = ''
        for nm, look, col in looks:
            h += (f'<article class="look"><div class="lkh"><h3 class="dsp">{V.E(nm)}</h3><span class="lkc"><i style="background:{col[0]["hex"]}"></i><i style="background:{col[1]["hex"]}"></i></span>'
                  f'<p class="small gr">{" + ".join(V.E(lbl.lower()) for lbl, _ in look)}. In {V.E(col[0]["name"].lower())} with {V.E(col[1]["name"].lower())}.</p></div>' + btns(V, s, aud, [x for _, x in look], data) +
                  f'<p class="small" style="margin-top:10px">{V.E(look_note(look, mode, kid))}</p></article>')
        add('looks', 'Looks', 'Select any piece for its design notes.', h)
        add('colour', 'Colour', 'The palette to style in.', palette(V, s, aud))
    elif topic == 'couture':
        if not kid:
            arts = articles(V, 'couture-', ('menswear', 'bespoke') if aud == 'mens' else ('gown', 'bridal', 'news', 'update'))
            T = srt(V, s, [x for x in P if x[1]['area'] in ('Embellishment', 'Finish', 'Fabric', 'Texture', 'Drape', 'Silhouette', 'Shape', 'Pleat') and x[2] in ('rp' if n == 1 else 're')])
            its = T[:12]
            if n == 1:
                lead = 'Couture is a laboratory: techniques, proportions and finishes shown there reach occasion wear and premium ready-to-wear one to three seasons later.'
                add('overview', 'Overview', 'What couture means for this season.', f'<p class="key" style="font-size:22px;max-width:40em;line-height:1.35">{V.E(lead)}</p>')
                add('pieces', 'Couture-led pieces', 'Pieces in the forecast with a couture root.', staged(V, s, aud, its, data))
                add('reading', 'Read more', 'Forecut Couture articles.', arts_html(V, arts[:8]))
            else:
                lead = 'Borrow one couture idea per piece and keep the rest simple, so the cost stays under control.'
                tr = [('Hand technique in one zone', 'Work embroidery or beading into a yoke, cuff, neckline or hem border instead of the whole garment.'),
                      ('Structure without weight', 'Use princess seams, light interfacing and corset seaming in place of boning and heavy canvas.'),
                      ('Volume from light fabrics', 'Pleated organza, gathered tulle and bias-cut satin give drama at a lower weight and cost.'),
                      ('Finish as the story', 'Hand-felled hems, bound seams and covered buttons tell the customer where the value is.')]
                add('translate', 'Translations', 'From the atelier to your price point.', '<div class="g g2 split" style="gap:24px">' + ''.join(f'<div class="box1"><h3>{V.E(a_)}</h3><p class="small gr">{V.E(b_)}</p></div>' for a_, b_ in tr) + '</div>')
                add('pieces', 'Pieces to translate', 'Rising and emerging pieces to try it on.', staged(V, s, aud, its, data))
                add('reading', 'Read more', 'Forecut Couture articles.', arts_html(V, arts[:8]))
            hero_its = its
        else:
            occ = ['velvet', 'party', 'waistcoat', 'kurta', 'mirror', 'gota', 'jutti', 'smock', 'mary jane', 'loafer', 'tulle', 'sequin', 'broderie', 'embroider', 'scallop', 'collar']
            T = srt(V, s, [x for x in P if x[0] == 'Kidswear|Occasion' or any(w in x[1]['name'].lower() for w in occ)])
            fest = ['kurta', 'mirror', 'gota', 'jutti', 'velvet', 'waistcoat', 'lehenga']
            its = [x for x in T if (any(w in x[1]['name'].lower() for w in fest)) == (n == 2)] or T
            lead = ('Occasion wear children can actually wear: soft linings, easy closures and room to move.' if n == 1 else
                    'Festive and wedding pieces for the family celebration calendar, made light enough to wear all day.')
            add('overview', 'Overview', 'The short version.', f'<p class="key" style="font-size:22px;max-width:40em;line-height:1.35">{V.E(lead)}</p>')
            add('pieces', 'Key pieces', 'Select any piece for its design notes.', staged(V, s, aud, its, data))
            add('reading', 'Read more', 'From Forecut Couture.', arts_html(V, articles(V, 'couture-', ('kids',))[:3]))
            hero_its = its
            body += safety(V, aud); secs.append(('safety', 'Safety'))
    elif topic == 'business':
        hero_its = srt(V, s, P)
        if n == 1:
            lead = 'A range plan for the season: where to put depth, what to test and what to drop, category by category.'
            add('overview', 'Overview', 'The short version.', f'<p class="key" style="font-size:22px;max-width:40em;line-height:1.35">{V.E(lead)}</p>')
            add('plan', 'Range plan', 'By category. Depth is relative to your usual buy.', range_plan(V, s, aud, P))
            add('calendar', 'Timing', 'When the season lands.', f'<p style="max-width:52em">In stores {V.E(m["window"])}. {V.E(m["stage"])}.</p>')
            add('strategy', 'Build, test, sell, exit', 'The whole audience at a glance.', strategy(V, srt(V, s, P)))
        else:
            lead = 'Price positioning and the markets where this season sells best.'
            add('overview', 'Overview', 'The short version.', f'<p class="key" style="font-size:22px;max-width:40em;line-height:1.35">{V.E(lead)}</p>')
            add('price', 'Price positioning', 'Where each kind of piece sits.', price_block(V, s, aud, P))
            add('markets', 'Markets', 'Regional direction for the season, with the pieces that fit each market.', markets(V, s, P, srt(V, s, P)))
    elif topic == 'innovations':
        arts = articles(V, 'innovation-')
        if n == 1:
            its = srt(V, s, [x for x in P if x[5] == 'fabric' and x[2] in 'er'])[:12] or srt(V, s, [x for x in P if x[5] == 'fabric'])[:12]
            lead = 'New fibres and materials that are moving from trial to production. Test them in a small part of the range first.'
            add('overview', 'Overview', 'The short version.', f'<p class="key" style="font-size:22px;max-width:40em;line-height:1.35">{V.E(lead)}</p>')
            add('pieces', 'Materials to test', 'Emerging and rising materials in the forecast.', staged(V, s, aud, its, data))
            add('reading', 'Innovation reports', 'Forecut\'s material innovation articles.', arts_html(V, arts))
        elif kid:
            g = ['grow', 'extend', 'adjust', 'magnet', 'name', 'organic', 'eco', 'snap', 'reflect', 'neutral', 'upf', 'easy', 'recycled', 'merino']
            its = srt(V, s, [x for x in P if any(w in x[1]['name'].lower() for w in g)])
            lead = 'Clothes that are safer, easier to put on and last longer: fold-back cuffs, let-down hems, adjustable waists and certified materials.'
            add('overview', 'Overview', 'The short version.', f'<p class="key" style="font-size:22px;max-width:40em;line-height:1.35">{V.E(lead)}</p>')
            add('pieces', 'Key pieces', 'Select any piece for its design notes.', staged(V, s, aud, its, data))
            body += safety(V, aud); secs.append(('safety', 'Safety'))
        else:
            its = srt(V, s, [x for x in P if x[1]['area'] in ('Finish', 'Wash', 'Stitch', 'Seam', 'Closure', 'Hardware', 'Embellishment', 'Texture') and x[2] in 'er'])[:12]
            lead = 'New finishes and making methods: lower-impact washes, bonded and mono-material construction, and smarter hardware.'
            add('overview', 'Overview', 'The short version.', f'<p class="key" style="font-size:22px;max-width:40em;line-height:1.35">{V.E(lead)}</p>')
            add('pieces', 'Methods to test', 'Emerging and rising finishes and details.', staged(V, s, aud, its, data))
            add('reading', 'Innovation reports', 'Forecut\'s material innovation articles.', arts_html(V, arts))
        hero_its = its
    if kid and topic not in ('couture', 'innovations', 'business', 'colours') and 'safety' not in [x[0] for x in secs]:
        body += safety(V, aud); secs.append(('safety', 'Safety'))
    body += more_block(V, s, aud, topic, suf)
    secs.append(('more', 'More'))
    tname = TOPIC[topic][1] if not (topic == 'couture' and kid) else 'Occasion wear'
    return shell(V, s, aud, title, f'{m["code"]} {a[1].lower()}, {title.lower()}: {lead}', [(f'/{slug(s, aud)}.html', a[1]), (f'/{slug(s, aud, topic)}.html', tname)],
                 hero_for(V, s, aud, srt(V, s, hero_its), timg), lead, secs, body, data, sub=tname)


def tpair(V, s, t):
    out = ''
    for hx, role in ((t[3], 'Lead'), (t[4], 'Accent')):
        c = V.cfind(s, hx)
        nm = c['name'] if c else role + ' colour'
        code = c['tcx'] if c else V.tcx(hx)
        out += f'<div><div class="tpair"><div style="background:{hx}"></div></div><p style="font-weight:500;margin-top:10px">{role}: {V.E(nm)}</p><p class="small gr">Pantone {V.E(code)}, {hx.upper()}</p></div>'
    return f'<div class="g g3">{out}</div>'


def look_note(look, mode, kid):
    if not look:
        return ''
    nm = [x[1]['name'].lower() for _, x in look]
    first = nm[0][0].upper() + nm[0][1:]
    tip = {'celebrity': 'Keep one statement piece and let the rest stay quiet.', 'casual': 'Keep the colours close and vary the texture.',
           'formal': 'Match the tones, sharpen the fit and keep accessories simple.', 'party': 'Let one shine or texture lead, and keep the shoes comfortable enough to last the night.'}[mode]
    if kid:
        tip = {'celebrity': 'One fun hero piece, everything else easy to move in.', 'casual': 'Pick pieces a child can put on alone.',
               'formal': 'Soft linings and easy closures so it stays on through the ceremony.', 'party': 'Sparkle on the outside, soft on the inside.'}[mode]
    return f'{first} with {", ".join(nm[1:-1]) + " and " if len(nm) > 2 else ""}{nm[-1] if len(nm) > 1 else ""}. {tip}'


def range_plan(V, s, aud, P):
    cats = {}
    for x in P:
        cats.setdefault(x[0], []).append(x)
    rows = ''
    for k, xs in sorted(cats.items()):
        r = sum(1 for x in xs if x[2] in 're')
        f = sum(1 for x in xs if x[2] == 'f')
        p = sum(1 for x in xs if x[2] == 'p')
        depth = 'Deep' if r >= 3 else 'Medium' if r >= 1 else 'Hold' if p else 'Light'
        if f > r + p:
            depth = 'Reduce'
        role = 'Seasonal: build' if r and r >= p else 'Core: sell through' if p else 'Exit or rework' if f else 'Test'
        lead_ = srt(V, s, xs)[:3]
        rows += f'<tr><th scope="row">{V.E(k.split("|")[1])}</th><td>{V.E(role)}</td><td>{depth}</td><td>{V.E(", ".join(x[1]["name"] for x in lead_))}</td></tr>'
    return f'<div class="lcwrap"><table class="rpt"><thead><tr><th scope="col">Category</th><th scope="col">Role</th><th scope="col">Depth</th><th scope="col">Lead with</th></tr></thead><tbody>{rows}</tbody></table></div>'


def price_block(V, s, aud, P):
    kid = aud in KIDS
    tiers = [('Entry', 'Basics and core colours: carry depth, keep making simple.', [x for x in P if x[2] == 'p']),
             ('Mid', 'Seasonal pieces in new colours and shapes: the main margin of the range.', [x for x in P if x[2] == 'r']),
             ('Premium', 'Statement and occasion pieces, craft and new materials: small buys, full price.', [x for x in P if x[2] == 'e'])]
    h = '<div class="g g3">' + ''.join(f'<div class="box1"><h3>{a_}</h3><p class="small gr">{b_}</p><ul class="ul small">' + ''.join(f'<li>{V.E(x[1]["name"])}</li>' for x in srt(V, s, c_)[:5]) + '</ul></div>' for a_, b_, c_ in tiers) + '</div>'
    if kid:
        h += ('<h3 class="sub">Kidswear pricing notes</h3><ul class="ul acts"><li>Price by size band: parents accept a step up for older sizes.</li>'
              '<li>Multi-packs work for basics such as bodysuits, tees and leggings.</li><li>Occasion and festive pieces sell at full price close to the event; plan deliveries for the festival and wedding calendar.</li>'
              '<li>Grow-with-me features justify a higher price when the label explains them.</li></ul>')
    else:
        tabs = ''
        for t in V.META[s]['themes'][:2]:
            th = V.THEMES.get(f'{s}|{t[0]}', {})
            if th.get('prices'):
                tabs += (f'<div class="ptab"><h3>{V.E(t[0])}</h3><table><thead><tr><th scope="col">Key garment</th><th scope="col">Value</th><th scope="col">Mid</th><th scope="col">Premium</th></tr></thead><tbody>' +
                         ''.join(f'<tr><th scope="row">{V.E(r[0])}</th><td>₹{V.E(r[1])}</td><td>₹{V.E(r[2])}</td><td>₹{V.E(r[3])}</td></tr>' for r in th['prices']) + '</tbody></table></div>')
        if tabs:
            h += f'<h3 class="sub">Price bands in ₹ (India), a planning guide</h3><div class="g g2 split" style="gap:32px">{tabs}</div>'
    return h


def markets(V, s, P, its):
    h = '<div class="g g3 mkts">'
    for r, dr, fit in V.regions_for(s, [x[:4] for x in P]):
        h += (f'<div class="box1"><h3><a href="/region-{r["slug"]}.html">{V.E(r["name"])}</a></h3><ul class="ul small gr">' + ''.join(f'<li>{V.E(d)}</li>' for d in dr[:3]) + '</ul>' +
              (f'<p class="small" style="margin-top:8px">Fits: {V.E(", ".join(x[1]["name"] for x in fit[:3]))}</p>' if fit else '') + '</div>')
    return h + '</div>'


# ------------------------------------------------------------ library block for forecasts.html
def aud_row(V, s):
    return ('<div class="auds">' + ''.join(
        f'<a class="aud" href="/{slug(s, k)}.html"><b>{V.E(t)}</b><span>{V.E(d)}</span></a>' for k, t, d in AUDS) + '</div>')


def build(V):
    """Return {page name: html} for the whole tree."""
    pages = {}
    adult_photo = V.photo

    def kid_photo(name, s):
        k = 'kid-' + V.islug(name)
        return next((x for x in (f'{k}-{s}', k) if x in V.IMG), None)
    for s in V.SKEYS:
        for aud, _, _ in AUDS:
            V.photo = kid_photo if aud in KIDS else adult_photo
            V._PATH[:] = [slug(s, aud) + '.html', None]
            pages[slug(s, aud)] = hub(V, s, aud)
            for topic, _, _ in TOPICS:
                cov = COVERMAP[topic] or ('menswear' if aud == 'mens' else 'womenswear' if aud == 'womens' else 'knitwear')
                si = f'cover-{s}-{cov}' if f'cover-{s}-{cov}' in V.IMG else None
                V._PATH[:] = [slug(s, aud, topic) + '.html', si]
                pages[slug(s, aud, topic)] = topic_page(V, s, aud, topic)
                for suf, t, d in reports(aud)[topic]:
                    V._PATH[:] = [slug(s, aud, suf) + '.html', si]
                    pages[slug(s, aud, suf)] = report(V, s, aud, topic, suf, t, d)
    V.photo = adult_photo
    return pages
