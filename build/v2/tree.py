"""Forecast tree, corrected pipeline (24 Nov 2026):

Forecasts > Season > Audience > Forecast section > Named report or theme > Related tool
e.g. Forecasts > SS27 > Men > Colours > "SS27 Men's Season Palette" > Colour Palette Builder

Audiences: men, women, boys, girls, toddler boys, toddler girls. Kids is a landing page that helps people choose.
Every named report and theme has a page and a browser-made PDF (A4 landscape print).
Findings can be sent to a Board, a Trend to Style brief or the Collection Planner, keeping season + audience + title.
Called from build_v2.main(); V is the build_v2 module.
"""
import os, re, sys, json

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import kids_data as KD  # noqa: E402
import audience_themes as AT  # noqa: E402

AUDS = [('mens', 'Men', 'Menswear and men\'s footwear'), ('womens', 'Women', 'Womenswear and women\'s footwear'),
        ('boys', 'Boys', 'Ages 5 to 14'), ('girls', 'Girls', 'Ages 5 to 14'),
        ('toddler-boys', 'Toddler Boys', 'Ages 1 to 4'), ('toddler-girls', 'Toddler Girls', 'Ages 1 to 4')]
AUD = {a[0]: a for a in AUDS}
POSS = {'mens': "Men's", 'womens': "Women's", 'boys': "Boys'", 'girls': "Girls'", 'toddler-boys': "Toddler Boys'", 'toddler-girls': "Toddler Girls'"}
KIDS = {'boys', 'girls', 'toddler-boys', 'toddler-girls'}
TODDLER = {'toddler-boys', 'toddler-girls'}
CFDEPT = {'mens': 'menswear', 'womens': 'womenswear'}
FWCATS = {'mens': ("Footwear|Men's Shoes", 'Footwear|Sneakers & Casual'), 'womens': ('Footwear|Heels & Flats', 'Footwear|Boots', 'Footwear|Sneakers & Casual')}
KIDFAB = {'w': 'Soft, washable cottons and blends; pre-shrunk, colour-fast and tested for children\'s wear.',
          'k': 'Soft jersey, fleece or fine knit with stretch for movement; flat seams against the skin.',
          'f': 'Flexible soles with grip, padded collars and easy closures a child can manage alone.'}
STORD = 'rpef'
KNITW = re.compile(r'\b(knit|knits|knitted|jersey|rib|ribbed|cable|merino|cashmere|mohair|fleece|crochet|pointelle|intarsia|fair isle|sweater|cardigan|cardigans|jumper|jumpers|tee|t-shirt|sweatshirt|sweatshirts|polo|polos)\b', re.I)

SECTIONS = [('themes', 'Themes', 'Named stories for the season, each with its own colours, silhouettes, fabrics, trims and products.'),
            ('colours', 'Colour Direction', 'The season palette, colour groups, combinations, applications and theme palettes.'),
            ('silhouettes', 'Silhouette Direction', 'Woven and knit shapes, proportions and fit.'),
            ('fabrics', 'Fabric Direction', 'Woven and knit fabrics: construction, weight, hand feel, finish and suitable products.'),
            ('trims', 'Trim Direction', 'Trending trims, trim stories, market strategy and trim innovation.'),
            ('styling', 'Styling Direction', 'Celebrity influence, casualwear, formalwear and partywear.'),
            ('couture', 'Couture Direction', 'Craft, construction and elevated details.'),
            ('business', 'Business Strategy', 'Category opportunities, assortment, price positioning and market decisions.'),
            ('innovations', 'Innovation Outlook', 'Emerging materials, processes and design and production technology.')]
SECTION = {x[0]: x for x in SECTIONS}
TOOLS_FOR = {'themes': ['trend-to-style', 'rangeboard'], 'colours': ['swatchsmith', 'textile-processing-studio'],
             'silhouettes': ['pattern-maker', 'size-chart-builder'], 'fabrics': ['materials-library', 'textile-calculator'],
             'trims': ['materials-library', 'decoration-cost-estimator'], 'styling': ['trend-to-style', 'rangeboard'],
             'couture': ['decoration-cost-estimator', 'pattern-maker'], 'business': ['rangeboard', 'pricefold', 'evenpoint'],
             'innovations': ['textile-processing-studio', 'pattern-maker']}
COVERMAP = {'themes': 'themes', 'colours': 'colour', 'silhouettes': None, 'fabrics': 'fabrics', 'trims': 'trims', 'styling': None,
            'couture': 'themes', 'business': 'themes', 'innovations': 'fabrics'}


def sec_name(aud, key):
    if key == 'couture' and aud in KIDS:
        return 'Couture and Occasion Direction'
    return SECTION[key][1]


def reports(aud, themes):
    """{section: [(suffix, report name, what it covers)]}."""
    kid = aud in KIDS
    return {
        'themes': [('theme-' + t['slug'], t['name'], t['story']) for t in themes],
        'colours': [('colours-season-palette', 'Season Palette', 'The main palette and its colour groups: core, seasonal and accent, with footwear colour.'),
                    ('colours-combinations', 'Colour Combinations and Applications', 'Tested combinations and where each colour works: product, print, trim and footwear.'),
                    ('colours-theme-palettes', 'Theme Palettes', 'A palette for each named theme, with the pieces to colour that way.')],
        'silhouettes': [('silhouettes-woven', 'Woven Silhouette Direction', 'The woven shapes to lead with and the ones coming next.'),
                        ('silhouettes-woven-fit', 'Woven Proportion and Fit Guide', 'Proportions, ease and fit points for the leading woven shapes.'),
                        ('silhouettes-knit', 'Knit Silhouette Direction', 'The knit shapes to lead with and the ones coming next.'),
                        ('silhouettes-knit-fit', 'Knit Proportion and Fit Guide', 'Proportions, gauge and fit points for the leading knit shapes.')],
        'fabrics': [('fabrics-woven', 'Woven Fabric Direction', 'Woven fabrics with construction, weight, hand feel, finish and suitable products.'),
                    ('fabrics-knit', 'Knit Fabric Direction', 'Knit fabrics and yarns with construction, weight, hand feel, finish and suitable products.')],
        'trims': [('trims-trending', 'Trending Trims Report', 'The trims rising and peaking now, and the new ones to test.'),
                  ('trims-stories', 'Trim Stories', 'The trims that carry each named theme.'),
                  ('trims-market-strategy', 'Trim Market Strategy', 'Which trims to build, sell through and exit, market by market.'),
                  ('trims-innovation', 'Trim Innovation Outlook', 'New closures, hardware, finishes and craft details.')],
        'styling': [('styling-celebrity', 'Celebrity Influence', 'Statement looks in the spirit of red-carpet and street-style dressing, built from the forecast.'),
                    ('styling-casual', 'Casualwear', 'Everyday looks built from the season\'s pieces.'),
                    ('styling-formal', 'Formalwear', 'Ceremony, school event and family occasion looks.' if kid else 'Office, ceremony and dinner looks.'),
                    ('styling-party', 'Partywear', 'Birthday, festive and holiday party looks.' if kid else 'Evening, festive and celebration looks.')],
        'couture': ([('couture-occasion', 'Occasion Wear Craft', 'Party and ceremony pieces children can wear comfortably all day.'),
                     ('couture-festive', 'Festive and Ceremony Details', 'Embroidery, mirror work and finishing for festive and wedding wear, made child-safe.')] if kid else
                    [('couture-craft', 'Couture Craft and Construction', 'Couture techniques behind this season\'s pieces, and what they mean for your range.'),
                     ('couture-details', 'Elevated Details', 'One couture detail per piece: how to translate it at your price.')]),
        'business': [('business-categories', 'Category Opportunities', 'Where the growth is, category by category.'),
                     ('business-assortment', 'Assortment Plan', 'Depth, roles and good-better-best for the range.'),
                     ('business-price', 'Price Positioning', 'Where each kind of piece sits on price.'),
                     ('business-markets', 'Market Decisions', 'Which markets to lead in, and when to deliver.')],
        'innovations': [('innovations-materials', 'Emerging Materials', 'New fibres and materials moving from trial to production.'),
                        ('innovations-processes', 'Processes and Finishing', 'Lower-impact finishing and new making methods.'),
                        ('innovations-technology', 'Design and Production Technology', 'Digital design, sampling and product data to adopt now.')],
    }


# ------------------------------------------------------------ data
def cls(V, it, kind):
    if kind == 'f':
        return 'shoe'
    if it['area'] in V.FAB:
        return 'fabric'
    if it['area'] in V.TRIM and it['area'] not in ('Hem', 'Pleat'):
        return 'trim'
    return 'sil'


_POOL = {}


def pool(V, aud, s):
    """(key, item, stage, next stage, kind w/k/f, class) for one audience and season."""
    if (aud, s) in _POOL:
        return _POOL[(aud, s)]
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
        if st != '-':
            out.append((k, it, st, it['life'][si + 1] if si + 1 < 5 else '', kd, cls(V, it, kd)))
    _POOL[(aud, s)] = out
    return out


def srt(V, s, xs):
    return sorted(xs, key=lambda x: (STORD.find(x[2]), V.photo(x[1]['name'], s) is None, x[1]['name']))


def cf_dept(V, s, aud):
    return V.CF[s]['dept'][CFDEPT.get(aud, 'kidswear')]


def kwmatch(x, kw):
    t = (x[1]['name'] + ' ' + x[1]['note']).lower()
    return sum(1 for w in kw if w in t)


def themes(V, s, aud):
    out = []
    if aud == 'womens':
        for t in V.META[s]['themes']:
            th = V.THEMES.get(f'{s}|{t[0]}', {})
            out.append(dict(name=t[0], slug=V.islug(t[0]), story=th.get('story', t[1]), why=th.get('why'), brands=th.get('brands', []), src=th.get('src'),
                            kw=[w.lower() for w in (th.get('kw') or t[6])], lead=t[3], accent=t[4], actions=th.get('actions', []), img=f'theme-{s}-{V.islug(t[0])}', row=t))
        return out
    cs = cf_dept(V, s, aud)['colours']
    rows = AT.MEN[s] if aud == 'mens' else AT.KIDS[s][aud]
    for name, story, kw, li, ai in rows:
        out.append(dict(name=name, slug=V.islug(name), story=story, why=None, brands=[], src=None, kw=kw, lead=cs[li % len(cs)]['hex'], accent=cs[ai % len(cs)]['hex'],
                        actions=[], img=None, row=None))
    return out


def theme_pieces(V, s, aud, P, th):
    if th['row'] is not None:
        hit = [x for x in P if th['name'] in V.theme_hits(s, x[1])]
    else:
        hit = [x for x in P if kwmatch(x, th['kw'])]
    return sorted(hit, key=lambda x: (-kwmatch(x, th['kw']), STORD.find(x[2]), x[1]['name']))


# ------------------------------------------------------------ fabric and fit knowledge
FABINFO = [  # keywords, construction, weight, hand feel, finish, products
    (('denim', 'jean'), 'Twill weave, indigo warp', '10 to 14 oz', 'Firm at first, softens with wear', 'Rinse or enzyme wash; ozone and laser instead of stone', 'Jeans, jackets, dungarees, skirts'),
    (('needlecord',), 'Fine-wale cut-pile weft', '6 to 8 oz', 'Soft, velvety', 'Garment-washed', 'Shirts, dresses, small trousers'),
    (('corduroy', 'cord'), 'Cut-pile weft (wale)', '8 to 12 oz', 'Soft pile, warm', 'Garment-washed or pigment-dyed', 'Trousers, suits, overshirts, pinafores'),
    (('seersucker',), 'Slack-tension plain weave', '110 to 150 gsm', 'Puckered, cool, airy', 'No ironing needed', 'Shirts, shorts, suits, rompers'),
    (('linen',), 'Plain weave', '140 to 220 gsm', 'Crisp and cool; creases', 'Enzyme or stone wash for softness', 'Shirts, trousers, suits, dresses'),
    (('poplin',), 'Fine plain weave', '100 to 130 gsm', 'Smooth, crisp', 'Mercerised; easy-care finish', 'Shirts, blouses, dresses'),
    (('chambray',), 'Plain weave, coloured warp and white weft', '120 to 160 gsm', 'Light, soft', 'Garment-washed', 'Shirts, dresses, light jackets'),
    (('voile', 'crinkle', 'muslin', 'gauze'), 'Fine open plain weave', '60 to 100 gsm', 'Sheer, airy', 'Crinkle set or soft wash; line where sheer', 'Summer dresses, blouses, layers'),
    (('flannel',), 'Brushed twill or plain weave', '230 to 320 gsm', 'Soft, warm, slightly fuzzy', 'Brushed one or both sides', 'Shirts, trousers, suiting, pyjamas'),
    (('melton', 'overcoat', 'double-face', 'tweed', 'boucle', 'bouclé'), 'Dense woven wool, milled', '400 to 650 gsm', 'Thick, warm, dry', 'Milled and felted', 'Coats, jackets, outerwear'),
    (('wool', 'suiting', 'pinstripe', 'travel suit'), 'Worsted twill or plain weave', '230 to 300 gsm', 'Smooth with natural stretch', 'Stretch or water-resistant finish where needed', 'Suits, trousers, tailoring'),
    (('velvet', 'velour'), 'Cut-pile weave or knit', '250 to 350 gsm', 'Plush, rich', 'Crush-resistant finish', 'Party wear, blazers, dresses, slippers'),
    (('satin', 'silk'), 'Satin weave', '80 to 140 gsm', 'Fluid, glossy', 'Sand-washed or peached for a matte look', 'Shirts, slip dresses, linings, evening'),
    (('canvas', 'waxed', 'duck'), 'Plain-weave duck or canvas', '280 to 400 gsm', 'Firm, structured', 'Wax (PFC-free) or garment-dyed', 'Work jackets, trousers, bags'),
    (('twill', 'chino', 'gabardine', 'tencel'), 'Twill weave', '200 to 280 gsm', 'Firm, smooth', 'Peached or garment-dyed', 'Chinos, trousers, jackets'),
    (('nylon', 'shell', 'technical', 'puffer', 'ripstop', 'recycled'), 'Ripstop or taffeta', '40 to 120 gsm', 'Light, crisp', 'Durable water repellent (PFC-free)', 'Puffers, shells, windbreakers'),
    (('leather', 'suede', 'shearling'), 'Hide or skin', '0.8 to 1.2 mm', 'Supple', 'Chrome-free or vegetable tanning preferred', 'Jackets, trousers, shoes, trims'),
    (('lace', 'broderie', 'eyelet'), 'Lace or embroidered cotton', '80 to 150 gsm', 'Delicate, open', 'Lined where open', 'Blouses, dresses, trims'),
    (('quilt',), 'Two layers stitched with wadding', '250 to 400 gsm', 'Padded, light', 'Recycled fill', 'Jackets, gilets, linings'),
    (('jersey', 'tee', 't-shirt', 'bodysuit'), 'Single jersey', '140 to 200 gsm', 'Soft, stretchy', 'Enzyme and silicone soft wash', 'Tees, dresses, bodysuits, sleepwear'),
    (('rib', 'ribbed'), '1x1 or 2x2 rib knit', '180 to 260 gsm', 'Stretchy, good recovery', 'Soft wash', 'Fitted tops, dresses, leggings, trims'),
    (('fleece', 'sherpa', 'terry', 'sweat', 'loopback'), 'Brushed-back fleece or loopback terry', '280 to 380 gsm', 'Soft, warm', 'Brushed or loopback; anti-pill', 'Sweatshirts, joggers, jackets'),
    (('cashmere', 'merino', 'alpaca', 'lambswool', 'mohair'), 'Fine-gauge or chunky knitted yarn', '12 to 16 gauge fine, 3 to 7 gauge chunky', 'Soft, warm, light', 'Washable treatment on merino', 'Jumpers, cardigans, layers'),
    (('cable', 'fisherman', 'fair isle', 'intarsia', 'jacquard', 'pointelle', 'crochet', 'open-stitch', 'waffle', 'pique', 'piqué', 'mesh'), 'Structured knit', '3 to 12 gauge', 'Textured, dimensional', 'Steam-set; pill test', 'Jumpers, cardigans, polos, tops'),
]


def fab_info(it, kind):
    t = (it['name'] + ' ' + it['note']).lower()
    for kws, *rest in FABINFO:
        if any(k in t for k in kws):
            return rest
    if it['area'] in ('Print', 'Pattern'):
        return ['Printed or yarn-dyed pattern on the base cloth', 'Depends on the base', 'As the base cloth', 'Reactive or pigment print; check rub fastness', 'Shirts, dresses, sets, accessories']
    if it['area'] in ('Finish', 'Wash'):
        return ['A finish applied to the cloth or garment', 'As the base cloth', 'Changes the hand: softer, drier or worn-in', it['note'], 'Across the range']
    return (['Knitted', '160 to 300 gsm', 'Soft with stretch', 'Soft wash', 'Tops, knitwear, layers'] if kind == 'k' else
            ['Woven', '120 to 300 gsm', 'Medium hand', 'Garment wash or easy-care finish', 'Shirts, trousers, jackets'])


FIT = [(('wide', 'barrel', 'full', 'palazzo', 'balloon', 'bubble', 'puff', 'volume', 'tent', 'oversized', 'boxy', 'relaxed', 'baggy', 'drape'),
        'Volume', 'Generous through the body or leg; balance with a neater piece on the other half.', 'Add ease where the volume is, keep the shoulder or waist fitted so the shape stays intentional.'),
       (('cropped', 'short', 'mini', 'compact', 'bermuda', 'shorts', 'blouson'),
        'Short', 'Shorter body or leg; the hem sits at waist, hip or knee.', 'Check the rise and the hem line on the body; grade length carefully across sizes.'),
       (('slim', 'skinny', 'fitted', 'column', 'pencil', 'bodycon', 'narrow', 'car coat'),
        'Close', 'Close to the body with a long, clean line.', 'Use stretch or a vent for movement; check sitting and arm lift in fittings.'),
       (('waist', 'belted', 'peplum', 'basque', 'drop', 'high-waist', 'high waist'),
        'Defined waist', 'The waist is marked: high, natural or dropped.', 'Fit the waist first; set belt loops and darts after the first fitting.'),
       (('long', 'maxi', 'longline', 'midi', 'trench', 'overcoat', 'duster'),
        'Long', 'Long line: below the knee or to the ankle.', 'Check stride and step; add a vent or split for movement.'),
       (('tiered', 'tier', 'flare', 'a-line', 'swing', 'pleat', 'pleated', 'ruffle'),
        'Flared', 'Fitted at the top and swinging out at the hem.', 'Balance hem weight; check the sweep on the body and in motion.')]


def fit_info(it):
    t = (it['name'] + ' ' + it['note']).lower()
    for kws, p, d, f in FIT:
        if any(k in t for k in kws):
            return p, d, f
    return 'Regular', 'Standard proportions with the detail as the update.', 'Keep the block you trust; change one point at a time.'


# ------------------------------------------------------------ html helpers
def slug(s, aud, suf=''):
    return f'{s}-{aud}' + (f'-{suf}' if suf else '')


def full(V, s, aud, name):
    return f'{V.META[s]["code"]} {POSS[aud]} {name}'


def hero_for(V, s, aud, its, theme_img=None):
    if theme_img and theme_img in V.IMG:
        return V.img(theme_img, '')
    ps = [V.photo(x[1]['name'], s) for x in its]
    ps = [p for p in ps if p]
    if ps:
        return V.img(ps[0], '')
    cs = cf_dept(V, s, aud)['colours']
    return '<div class="cmos">' + ''.join(f'<i style="background:{c["hex"]};--k:{n}"></i>' for n, c in enumerate(cs)) + '</div>'


def shell(V, s, aud, title, desc, crumbs, hero, lead, secs, body, data, pdf=True, sub='', ctx_src=None, cta=None):
    m = V.META[s]
    a = AUD[aud]
    h = V.head(f'{title} | Forecut', desc[:300]) + V.nav_app('Forecasts') + '<main id="main">'
    h += ('<div class="w crumb"><a href="/forecasts.html">Forecasts</a> / ' + f'<a href="/forecasts.html#{s}">{m["code"]}</a> / ' +
          ''.join(f'<a href="{u}">{V.E(t)}</a> / ' for u, t in crumbs) + f'{V.E(title)}</div>')
    first = cta or (secs[1] if len(secs) > 1 else secs[0])
    bt = f'<a class="btn" href="#{first[0]}">{V.E(first[1])}</a>' + ('<button class="btn o" type="button" data-print>Download PDF</button>' if pdf else '')
    h += (f'<section class="w rhead"><div class="chhero">{hero}</div><div class="rinfo"><p class="small gr">{V.E(m["code"])} {V.E(a[1])}{", " + V.E(sub) if sub else ""}. {V.E(m["title"])}, {V.E(m["stage"].lower())}</p>'
          f'<h1 class="dsp">{V.E(title)}</h1><p class="lead">{V.E(lead)}</p><div class="ctas">{bt}</div>'
          f'<p class="small gr">Updated {V.TODAY.strftime("%-d %B %Y")}.</p></div></section>')
    h += '<nav class="rnav" aria-label="On this page"><div class="w">' + ''.join(f'<a href="#{x}">{t}</a>' for x, t in secs) + '</div></nav>'
    h += (f'<div class="w gate hide" id="gate"><h2 class="dsp" style="font-size:32px">Read the full report free</h2><p class="gr" style="margin:12px 0 22px">Sign up to read every section, download the PDF and send findings to your tools. It takes under a minute.</p>'
          f'<a class="btn" href="/account.html#signup">Sign up free</a> <a class="btn o" href="/account.html#signin" style="margin-left:8px">Log in</a></div>'
          f'<div class="w" id="report">{body}<p class="small gr src">Forecut\'s own forecast, built from public runway, trade fair and retail evidence. Sources: {V.E(m.get("sources", ""))}</p></div></main>')
    h += '<div class="prt-foot">forecut.in</div>' + V.DM_HTML + '<div class="sendt" id="sendt" role="status" aria-live="polite" hidden></div>'
    ctx = {'season': m['code'], 'aud': a[1], 'src': ctx_src or title, 'url': '/' + V._PATH[0].replace('.html', '')}
    dj = json.dumps({'items': data, 'seasons': [V.META[k]['code'] for k in V.SKEYS], 'si': V.SKEYS.index(s)}, ensure_ascii=False).replace('</', '<\\/')
    cj = json.dumps(ctx, ensure_ascii=False).replace('</', '<\\/')
    return h + V.footer() + V.end(f'<script>window.FC_ITEMS={dj};window.FC_CTX={cj}</script>')


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


def palette(V, s, aud, big_=False):
    d = cf_dept(V, s, aud)
    return f'<p class="gr" style="max-width:52em;margin-bottom:18px">{V.E(d["text"])}</p><div class="chips">' + ''.join(V.chip(c, big_) for c in d['colours']) + '</div>'


def strategy(V, xs):
    cols = [('Build depth', 'r'), ('Test small', 'e'), ('Sell through', 'p'), ('Exit or rework', 'f')]
    return '<div class="g g4 strat">' + ''.join(
        f'<div><h3>{a}</h3><p class="small gr">{V.STAGE[st][0]} pieces</p><ul>' + (''.join(f'<li>{V.E(x[1]["name"])}</li>' for x in [y for y in xs if y[2] == st][:6]) or '<li class="gr">Nothing at this stage</li>') + '</ul></div>'
        for a, st in cols) + '</div>'


def safety_html(V, aud):
    pts = ['No drawstrings at the hood or neck; waist cords must not hang loose. Follow EN 14682 and your market\'s own rules.',
           'Test snaps, buttons and trims for pull strength, and check flammability rules for nightwear, costumes and party wear.',
           'Use flat seams and printed care labels where skin is sensitive; choose certified dyes and finishes.']
    if aud in TODDLER:
        pts.insert(0, 'For under-3s, avoid small parts: no beads, sequins or loose pom-poms. Use snaps, sewn-down appliqué and embroidery instead.')
    else:
        pts.insert(0, 'Sequins, beads and small hardware suit ages 5 and up only; sew them securely and test them.')
    return '<ul class="ul acts">' + ''.join(f'<li>{V.E(p)}</li>' for p in pts) + '</ul>'


def tools_html(V, key):
    T = {t['slug']: t for t in V.TOOLS}
    return '<div class="g g3 rtools">' + ''.join(
        f'<a class="rtool" href="/{sl}.html"><span class="rtim"><img src="/tools/covers/{sl}-640.webp" alt="" loading="lazy"></span><span class="rtt"><b>{V.E(T[sl]["title"].replace("&", "and"))}</b><span class="small gr">{V.E(T[sl]["lead"])}</span><span class="lk small">Open the tool</span></span></a>'
        for sl in TOOLS_FOR[key] if sl in T) + '</div>'


SENDBAR = ('<div class="sendbar"><p class="small"><b>Send the key findings</b> <span class="gr">They keep the season, audience and report title.</span></p>'
           '<div class="sendb"><button type="button" class="btn s o" data-send="board">Add to a Board</button><button type="button" class="btn s o" data-send="brief">Send to Style Brief</button>'
           '<button type="button" class="btn s o" data-send="plan">Add to Collection Planner</button></div></div>')


def more_block(V, s, aud, key, cur, R):
    rs = R.get(key, [])
    cards = ''.join(f'<a class="chc tr" href="/{slug(s, aud, suf)}.html"><span class="cht">{V.E(full(V, s, aud, nm))}</span><span class="small gr">{V.E(d)}</span></a>'
                    for suf, nm, d in rs if suf != cur)
    oth = ''.join(f'<a class="atp" href="/{slug(s, aud, k)}.html">{V.E(sec_name(aud, k))}</a>' for k, _, _ in SECTIONS if k != key)
    return (f'<section class="rs" id="more"><div class="rsh"><h2 class="dsp">More from {V.E(full(V, s, aud, sec_name(aud, key)))}</h2><p class="gr"><a class="lk" href="/{slug(s, aud, key)}.html">Section overview</a></p></div>'
            + (f'<div class="chg">{cards}</div>' if cards else '') + f'<h3 class="sub">Other {V.META[s]["code"]} {V.E(AUD[aud][1].lower())} sections</h3><div class="atps">{oth}</div></section>')


_ARTS = {}


def articles(V, prefix, want=()):
    if prefix not in _ARTS:
        out = []
        for f in sorted(os.listdir(V.ROOT)):
            if f.startswith(prefix) and f.endswith('.html') and f != prefix.rstrip('-') + '.html':
                t = re.search(r'<title>([^<|]*)', open(os.path.join(V.ROOT, f), encoding='utf-8', errors='ignore').read(4000))
                if t:
                    out.append((f[:-5], t.group(1).strip()))
        _ARTS[prefix] = out
    out = list(_ARTS[prefix])
    if want:
        out.sort(key=lambda a: not any(w in a[0] for w in want))
    return out


def arts_html(V, arts):
    return '<ul class="ul srcl">' + ''.join(f'<li><a href="/{u}.html">{V.E(t)}</a></li>' for u, t in arts) + '</ul>'


def keytext(V, xs, n=3):
    return V.names(xs, n)


def big(t):
    return f'<p class="key" style="font-size:22px;max-width:40em;line-height:1.35">{t}</p>'


# ------------------------------------------------------------ styling
SLOTS = {
    'mens': [('Top', ('Menswear|Shirts & Polos', 'Menswear|Knitwear')), ('Bottom', ('Menswear|Trousers',)), ('Layer', ('Menswear|Outerwear', 'Menswear|Tailoring')), ('Shoes', FWCATS['mens'])],
    'womens': [('Top', ('Womenswear|Tops & Shirts', 'Womenswear|Knitwear', 'Womenswear|Dresses')), ('Bottom', ('Womenswear|Trousers & Skirts', 'Womenswear|Denim')),
               ('Layer', ('Womenswear|Coats & Jackets', 'Womenswear|Tailoring')), ('Shoes', FWCATS['womens'])],
    'kid': [('Top', ('Kidswear|Tops', 'Kidswear|Knitwear', 'Kidswear|Dresses', 'Kidswear|Sets')), ('Bottom', ('Kidswear|Bottoms',)),
            ('Layer', ('Kidswear|Outerwear', 'Kidswear|Knitwear', 'Kidswear|Occasion')), ('Shoes', ('Kidswear|Footwear',))],
}
MODEW = {
    'formal': ['tailor', 'blazer', 'suit', 'waistcoat', 'trouser', 'loafer', 'oxford', 'derby', 'shirt', 'coat', 'pleat', 'court', 'collar', 'kurta', 'chino', 'mary jane', 'bandhgala', 'sherwani'],
    'party': ['velvet', 'sequin', 'satin', 'party', 'metallic', 'embellish', 'slip', 'mirror', 'gota', 'heel', 'mary jane', 'jutti', 'tulle', 'sheer', 'lace', 'bow', 'drape', 'glitter', 'lehenga', 'anarkali'],
    'casual': ['jersey', 'denim', 'jean', 'sweat', 'cargo', 'trainer', 'sneaker', 'runner', 'polo', 'knit', 'jogger', 'overshirt', 'short', 'sandal', 'tee', 'fleece', 'puffer', 'utility'],
}
OUTN = {
    'celebrity': (['Red-carpet arrival', 'Airport off-duty', 'Press-day tailoring', 'Front-row statement'], ['Weekend star', 'Premiere ready', 'Photo-call casual', 'Festival front row']),
    'casual': (['Weekend', 'City errands', 'Travel day', 'Café afternoon'], ['School run', 'Park day', 'Holiday', 'Playdate']),
    'formal': (['Office', 'Client meeting', 'Ceremony guest', 'Dinner'], ['Wedding guest', 'School event', 'Family portrait', 'Family ceremony']),
    'party': (['Evening out', 'Cocktail', 'Festive', 'Celebration'], ['Birthday party', 'Festive', 'Holiday party', 'Recital']),
}
CELEB = {'mens': 'Menswear stars now dress for the red carpet and the airport alike: soft tailoring, statement knits and jewellery for men, with sneakers or loafers.',
         'womens': 'Red carpets and street style feed each other: one statement piece, worn with ease, and photographed everywhere.',
         'kid': 'Celebrity families and children\'s TV stars set the mood: bright hero pieces, matching family looks and party shoes.'}


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
    nm = OUTN[mode][1 if kid else 0]
    cs = cf_dept(V, s, aud)['colours']
    out = []
    for i in range(4):
        look, used = [], set()
        for lbl, c in cands:
            pick = next((x for x in c[i:] + c[:i] if x[1]['name'] not in used), None)
            if pick:
                used.add(pick[1]['name'])
                look.append((lbl, pick))
        out.append((nm[i], look, (cs[i % len(cs)], cs[(i + 3) % len(cs)])))
    return out


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


# ------------------------------------------------------------ business blocks
def cat_rows(V, s, P):
    cats = {}
    for x in P:
        cats.setdefault(x[0], []).append(x)
    rows = []
    for k, xs in cats.items():
        r = sum(1 for x in xs if x[2] == 'r'); e = sum(1 for x in xs if x[2] == 'e'); p = sum(1 for x in xs if x[2] == 'p'); f = sum(1 for x in xs if x[2] == 'f')
        rows.append(((2 * r + e - f) / max(1, len(xs)), k, xs, r, e, p, f))
    rows.sort(key=lambda z: -z[0])
    return rows


def opp_table(V, s, P):
    h = ''
    for score, k, xs, r, e, p, f in cat_rows(V, s, P):
        lvl = 'Strong growth' if score > .9 else 'Growing' if score > .4 else 'Steady' if score > 0 else 'Slowing'
        act = 'Add new styles and depth' if score > .9 else 'Add a few new styles' if score > .4 else 'Refresh colour, keep the core' if score > 0 else 'Cut styles, keep the best sellers'
        h += f'<tr><th scope="row">{V.E(k.split("|")[1])}</th><td>{lvl}</td><td>{act}</td><td>{V.E(", ".join(x[1]["name"] for x in srt(V, s, [y for y in xs if y[2] in "re"])[:3]) or "-")}</td></tr>'
    return f'<div class="lcwrap"><table class="rpt"><thead><tr><th scope="col">Category</th><th scope="col">Outlook</th><th scope="col">Action</th><th scope="col">New ideas</th></tr></thead><tbody>{h}</tbody></table></div>'


def range_plan(V, s, P):
    rows = ''
    for score, k, xs, r, e, p, f in sorted(cat_rows(V, s, P), key=lambda z: z[1]):
        depth = 'Deep' if r >= 3 else 'Medium' if r >= 1 else 'Hold' if p else 'Light'
        if f > r + p:
            depth = 'Reduce'
        role = 'Seasonal: build' if r and r >= p else 'Core: sell through' if p else 'Exit or rework' if f else 'Test'
        rows += f'<tr><th scope="row">{V.E(k.split("|")[1])}</th><td>{V.E(role)}</td><td>{depth}</td><td>{V.E(", ".join(x[1]["name"] for x in srt(V, s, xs)[:3]))}</td></tr>'
    return f'<div class="lcwrap"><table class="rpt"><thead><tr><th scope="col">Category</th><th scope="col">Role</th><th scope="col">Depth</th><th scope="col">Lead with</th></tr></thead><tbody>{rows}</tbody></table></div>'


def gbb(V, s, P):
    tiers = [('Good', 'Core shapes in core colours: carry depth and keep making simple.', [x for x in P if x[2] == 'p']),
             ('Better', 'Seasonal pieces in new colours and shapes: the main margin of the range.', [x for x in P if x[2] == 'r']),
             ('Best', 'Statement, craft and new materials: small buys at full price.', [x for x in P if x[2] == 'e'])]
    return '<div class="g g3">' + ''.join(f'<div class="box1"><h3>{a}</h3><p class="small gr">{b}</p><ul class="ul small">' + ''.join(f'<li>{V.E(x[1]["name"])}</li>' for x in srt(V, s, c)[:5]) + '</ul></div>' for a, b, c in tiers) + '</div>'


def price_block(V, s, aud, P):
    kid = aud in KIDS
    h = gbb(V, s, P)
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
        if tabs and aud == 'womens':
            h += f'<h3 class="sub">Price bands in ₹ (India), a planning guide</h3><div class="g g2 split" style="gap:32px">{tabs}</div>'
        h += ('<h3 class="sub">Positioning notes</h3><ul class="ul acts"><li>Hold full price on rising pieces; they are what is new in store.</li><li>Use peaking pieces for value and promotion: customers already know them.</li>'
              '<li>Price emerging and craft pieces as limited, with the story on the label.</li></ul>')
    return h


def markets(V, s, P):
    h = '<div class="g g3 mkts">'
    for r, dr, fit in V.regions_for(s, [x[:4] for x in P]):
        h += (f'<div class="box1"><h3><a href="/region-{r["slug"]}.html">{V.E(r["name"])}</a></h3><ul class="ul small gr">' + ''.join(f'<li>{V.E(d)}</li>' for d in dr[:3]) + '</ul>' +
              (f'<p class="small" style="margin-top:8px">Fits: {V.E(", ".join(x[1]["name"] for x in fit[:3]))}</p>' if fit else '') + '</div>')
    return h + '</div>'


TECH = {
    'adult': [('3D sampling', 'Fit the first sample in 3D before cutting cloth, then use real fittings for the last checks.', 'pattern-maker'),
              ('Digital product data', 'Keep fibre, origin and care data with every style, ready for digital product passports in the EU.', 'tech-pack-builder'),
              ('Small-batch and made-to-order', 'Test emerging pieces in short runs and reorder the winners in season.', 'cutclock'),
              ('Colour accuracy', 'Approve lab dips against Pantone TCX references and keep recipes on record.', 'textile-processing-studio')],
    'kid': [('3D fit across a size range', 'Children grow fast: check the fit across the size range in 3D before sampling.', 'pattern-maker'),
            ('Grade for growth', 'Grow-with-me features need clear grading rules and size charts.', 'size-chart-builder'),
            ('Safety data on file', 'Keep cord, small-part and flammability test results with each style.', 'fit-qc-studio'),
            ('Digital product data', 'Fibre, origin and care data with every style, for labels and digital product passports.', 'tech-pack-builder')],
}


# ------------------------------------------------------------ pages
def hub(V, s, aud, TH, R):
    m = V.META[s]
    a = AUD[aud]
    P = pool(V, aud, s)
    lead = srt(V, s, [x for x in P if x[2] in 'rp'])
    data = []
    intro = m['intro'] if aud not in KIDS else f'Kidswear follows adult direction a season or two later, adapted for comfort, safety and growth. {m["intro"]}'
    cards = ''
    for k, nm, d in SECTIONS:
        cards += (f'<div class="tpc"><a class="tph" href="/{slug(s, aud, k)}.html"><h3 class="dsp">{V.E(sec_name(aud, k))}</h3><p class="small gr">{V.E(full(V, s, aud, sec_name(aud, k)))}</p></a><ul>' +
                  ''.join(f'<li><a href="/{slug(s, aud, suf)}.html">{V.E(rn)}</a></li>' for suf, rn, _ in R[k]) + '</ul></div>')
    body = sec('sections', 'Forecast sections', 'Every named report and theme has its own page and PDF.', f'<div class="tpcs">{cards}</div>')
    body += sec('leading', 'Leading now', 'The pieces to build the season on. Select any piece for its trend curve and design notes.', btns(V, s, aud, [x for x in lead if x[5] != 'shoe'][:8], data))
    body += sec('footwear', 'Footwear', 'Shoes for this audience, inside the same forecast.', btns(V, s, aud, srt(V, s, [x for x in P if x[5] == 'shoe'])[:8], data))
    if aud in KIDS:
        body += sec('safety', 'Safety notes', 'Check these before sampling.', safety_html(V, aud))
    sw = ''.join(f'<a class="atp{" on" if k == s else ""}" href="/{slug(k, aud)}.html">{V.META[k]["code"]}</a>' for k in V.SKEYS)
    aw = ''.join(f'<a class="atp{" on" if k == aud else ""}" href="/{slug(s, k)}.html">{V.E(t)}</a>' for k, t, _ in AUDS)
    body += sec('more', 'More forecasts', 'Switch season or audience.', f'<div class="atps">{sw}</div><div class="atps" style="margin-top:12px">{aw}</div>')
    secs = [('sections', 'Sections'), ('leading', 'Leading now'), ('footwear', 'Footwear')] + ([('safety', 'Safety')] if aud in KIDS else []) + [('more', 'More')]
    title = f'{m["code"]} {a[1]}'
    return shell(V, s, aud, title, f'{title} forecast. {intro}', [], hero_for(V, s, aud, lead), intro, secs, body, data, pdf=False, sub=a[2])


def section_page(V, s, aud, key, TH, R):
    nm = sec_name(aud, key)
    title = full(V, s, aud, nm)
    P = pool(V, aud, s)
    want = {'silhouettes': 'sil', 'fabrics': 'fabric', 'trims': 'trim'}.get(key)
    lead_its = srt(V, s, [x for x in P if (x[5] == want if want else True) and x[2] in 'rp'])
    if key == 'themes':
        lead = 'This season\'s stories: ' + ', '.join(t['name'] for t in TH) + '.'
    elif key == 'colours':
        lead = cf_dept(V, s, aud)['text']
    elif key == 'couture' and aud in KIDS:
        lead = 'Occasion wear children can actually wear, with couture-level finish and child-safe construction.'
    else:
        lead = (f'Led by {keytext(V, lead_its)}. ' if lead_its else '') + SECTION[key][2]
    body = ''
    secs = []
    if key == 'colours':
        body += sec('palette', 'The palette', V.E(V.CF[s]['status']) + '.', palette(V, s, aud)); secs.append(('palette', 'Palette'))
    lbl = 'Themes' if key == 'themes' else 'Reports'
    cards = ''.join(f'<a class="chc tr" href="/{slug(s, aud, suf)}.html"><span class="cht">{V.E(full(V, s, aud, rn))}</span><span class="small gr">{V.E(d)}</span><span class="lk small">Read it</span></a>' for suf, rn, d in R[key])
    body += sec('reports', lbl, 'Each has its own page and PDF.', f'<div class="chg">{cards}</div>'); secs.append(('reports', lbl))
    body += sec('tools', 'Related tools', 'Take this direction into your own work.', tools_html(V, key)); secs.append(('tools', 'Related tools'))
    body += more_block(V, s, aud, key, None, {}); secs.append(('more', 'More'))
    return shell(V, s, aud, title, f'{title}: {lead}', [(f'/{slug(s, aud)}.html', AUD[aud][1])], hero_for(V, s, aud, lead_its), lead, secs, body, [], pdf=False, cta=('reports', lbl))


def product_recs(V, s, aud, its):
    rows = ''
    pri = {'r': 'Hero: build depth', 'p': 'Core: sell through', 'e': 'Test: small run', 'f': 'Carry-over only'}
    for x in srt(V, s, [y for y in its if y[5] != 'shoe'])[:8]:
        fab = V.DESCMOD.build(x[0].split('|')[0], x[0].split('|')[1], x[1])['f']
        rows += f'<tr><th scope="row">{V.E(x[1]["name"])}</th><td>{V.E(x[0].split("|")[1])}</td><td>{pri[x[2]]}</td><td>{V.E(fab)}</td></tr>'
    if not rows:
        return '<p class="gr">Product recommendations are added as the season is tracked.</p>'
    return f'<div class="lcwrap"><table class="rpt"><thead><tr><th scope="col">Product</th><th scope="col">Category</th><th scope="col">Priority</th><th scope="col">Fabric and trims</th></tr></thead><tbody>{rows}</tbody></table></div>'


def tpair(V, s, th):
    out = ''
    for hx, role in ((th['lead'], 'Lead'), (th['accent'], 'Accent')):
        c = V.cfind(s, hx)
        nm = c['name'] if c else role + ' colour'
        code = c['tcx'] if c else V.tcx(hx)
        out += f'<div><div class="tpair"><div style="background:{hx}"></div></div><p style="font-weight:500;margin-top:10px">{role}: {V.E(nm)}</p><p class="small gr">Pantone {V.E(code)}, {hx.upper()}</p></div>'
    return f'<div class="g g3">{out}</div>'


def near_colours(V, s, aud, th, n=5):
    seen, cs = set(), []
    for c in sorted(V.CF[s]['key'] + cf_dept(V, s, aud)['colours'], key=lambda c: min(V.cdist(c['hex'], th['lead']), V.cdist(c['hex'], th['accent']))):
        if c['hex'] not in seen:
            seen.add(c['hex']); cs.append(c)
    return cs[:n]


def theme_page(V, s, aud, th, TH, R):
    m = V.META[s]
    kid = aud in KIDS
    P = pool(V, aud, s)
    its = theme_pieces(V, s, aud, P, th)
    data = []
    secs, body = [], ''

    def add(i, t, sub, inner):
        nonlocal body
        secs.append((i, t)); body += sec(i, t, sub, inner)
    story = big(V.E(th['story']))
    if th.get('why'):
        story += f'<h3 class="sub">Why now</h3><p class="gr" style="max-width:52em">{V.E(th["why"])}</p>'
    if th.get('brands'):
        story += '<h3 class="sub">Seen at</h3><ul class="ul gr">' + ''.join(f'<li><b style="font-weight:500;color:var(--ink)">{V.E(b[0])}</b>: {V.E(b[1])}</li>' for b in th['brands'][:6]) + '</ul>'
    if kid:
        story += '<p class="gr" style="max-width:52em;margin-top:12px">Forecut\'s kidswear reading of this season\'s adult direction, adapted for comfort, safety and growth.</p>'
    add('story', 'The story', f'{full(V, s, aud, "Themes")}.', story)
    add('colour', 'Colours', 'The lead and accent colour, with the closest season colours.', tpair(V, s, th) + '<div class="chips" style="margin-top:22px">' + ''.join(V.chip(c) for c in near_colours(V, s, aud, th)) + '</div>')
    for k, t, sub in (('sil', 'Silhouettes', 'The shapes that carry the theme.'), ('fabric', 'Fabrics', 'Cloth, prints and finishes for the theme.'), ('trim', 'Trims and details', 'Trims that finish the story.')):
        g = [x for x in its if x[5] == k]
        if g:
            add({'sil': 'silhouettes', 'fabric': 'fabrics', 'trim': 'trims'}[k], t, sub, staged(V, s, aud, g[:12], data))
    fw = [x for x in its if x[5] == 'shoe']
    add('products', 'Product recommendations', 'What to make for this theme, in order of priority.', product_recs(V, s, aud, its) + (('<h3 class="sub">Footwear</h3>' + btns(V, s, aud, fw[:4], data)) if fw else ''))
    if its:
        add('development', 'How it develops', 'Each piece across the five seasons.', V.lc_table(s, [x[:4] for x in its[:12]]))
    acts = th.get('actions') or []
    add('strategy', 'Strategy', 'What to build, test, sell through and drop.', strategy(V, its) + ('<h3 class="sub">Actions</h3><ul class="ul acts">' + ''.join(f'<li>{V.E(x)}</li>' for x in acts[:6]) + '</ul>' if acts else ''))
    if kid:
        add('safety', 'Safety notes', 'Check these before sampling.', safety_html(V, aud))
    rel = [('colours-theme-palettes', 'Theme Palettes'), ('colours-season-palette', 'Season Palette'), ('fabrics-woven', 'Woven Fabric Direction'), ('fabrics-knit', 'Knit Fabric Direction'),
           ('silhouettes-woven', 'Woven Silhouette Direction'), ('trims-stories', 'Trim Stories')]
    add('related', 'Related reports', f'More {m["code"]} {AUD[aud][1].lower()} direction for this theme.', '<div class="chg">' + ''.join(
        f'<a class="chc tr" href="/{slug(s, aud, u)}.html"><span class="cht">{V.E(full(V, s, aud, n))}</span></a>' for u, n in rel) + '</div>')
    add('tools', 'Related tools', 'Take the theme into a board, a brief or a collection plan.', SENDBAR + tools_html(V, 'themes'))
    if th.get('src'):
        body += f'<p class="small gr">Source: {V.E(th["src"])}</p>'
    srcs = AT.SOURCES.get(aud, {}).get(s)
    if srcs:
        body += '<p class="small gr" style="margin-top:8px">Public sources: ' + ', '.join(f'<a class="lk" href="{V.E(u)}" target="_blank" rel="noopener">{V.E(t)}</a>' for t, u in srcs) + '.</p>'
    elif aud == 'mens':
        body += '<p class="small gr" style="margin-top:8px">Forecut projection from the season\'s direction; updated when the menswear shows for this season have taken place.</p>'
    body += more_block(V, s, aud, 'themes', 'theme-' + th['slug'], R)
    secs.append(('more', 'More'))
    ttl = f'{m["code"]} {POSS[aud]} Theme: {th["name"]}'
    return shell(V, s, aud, ttl, f'{ttl}. {th["story"]}', [(f'/{slug(s, aud)}.html', AUD[aud][1]), (f'/{slug(s, aud, "themes")}.html', 'Themes')],
                 hero_for(V, s, aud, srt(V, s, its), th.get('img') if not kid else None), th['story'], secs, body, data, sub='Themes', ctx_src=ttl)


def report(V, s, aud, key, suf, name, desc, TH, R):
    m = V.META[s]
    kid = aud in KIDS
    P = pool(V, aud, s)
    title = full(V, s, aud, name)
    data = []
    secs, body = [], ''
    hero_its = []
    lead = desc

    def add(i, t, sub, inner):
        nonlocal body
        secs.append((i, t)); body += sec(i, t, sub, inner)

    if key == 'colours':
        d = cf_dept(V, s, aud)
        cf = V.CF[s]
        cs = d['colours']
        if suf == 'colours-season-palette':
            lead = d['text']
            add('palette', 'Main palette', V.E(cf['status']) + '.', '<div class="chips">' + ''.join(V.chip(c, True) for c in cs) + '</div>')
            groups = [('Core', 'The base of the range: carry these across most styles.', cs[:2]), ('Seasonal', 'What makes the season new: give these depth.', cs[2:4]),
                      ('Accent', 'Small, high-impact doses: one piece, one trim.', cs[4:])]
            add('groups', 'Colour groups', 'How much of each colour to use.', '<div class="g g3 roles">' + ''.join(
                f'<div><h3>{a}</h3><p class="small gr">{b}</p>{V.strip(c_, 34)}<p class="small" style="margin-top:8px">{V.E(", ".join(x["name"] for x in c_))}</p></div>' for a, b, c_ in groups) + '</div>')
            add('footwear', 'Footwear colour', V.E(cf['dept']['footwear']['text']), '<div class="chips">' + ''.join(V.chip(c) for c in cf['dept']['footwear']['colours']) + '</div>')
            add('development', 'Season to season', 'This palette across the five seasons.', '<div class="cdev">' + ''.join(
                f'<a href="/{slug(k, aud, "colours-season-palette")}.html" class="crow{" now" if k == s else ""}"><span>{V.META[k]["code"]}<em>{V.E(V.CF[k]["short"])}</em></span><div>' +
                ''.join(f'<i style="background:{c["hex"]}" title="{V.E(c["name"])}"></i>' for c in cf_dept(V, k, aud)['colours']) + '</div></a>' for k in V.SKEYS) + '</div>')
        elif suf == 'colours-combinations':
            n = len(cs)
            combos = [(cs[0], cs[1], cs[-1]), (cs[2 % n], cs[0], cs[3 % n]), (cs[1], cs[4 % n], cs[-1]), (cs[3 % n], cs[5 % n], cs[1])]
            lead = f'Lead with {cs[0]["name"].lower()} and {cs[1]["name"].lower()}; use {cs[-1]["name"].lower()} as the accent.'
            add('combos', 'Combinations', 'Main colour, second colour, accent.', '<div class="g g4">' + ''.join(
                f'<div class="combo"><div class="cb"><i style="background:{x["hex"]};flex:6"></i><i style="background:{y["hex"]};flex:3"></i><i style="background:{z["hex"]};flex:1"></i></div><p class="small" style="margin-top:10px"><b style="font-weight:500">{V.E(x["name"])}</b> with {V.E(y["name"].lower())}, accent {V.E(z["name"].lower())}</p></div>'
                for x, y, z in combos) + '</div>')
            apps = [('Main product', cs[:2], 'Outerwear, knitwear and the bulk of the range.'), ('Prints and patterns', cs[1:4], 'Grounds and motifs for prints, checks and stripes.'),
                    ('Trims and details', cs[-2:], 'Piping, buttons, linings, embroidery and labels.'), ('Footwear and accessories', cf['dept']['footwear']['colours'][:3], 'Shoes, bags and small leather goods.')]
            add('applications', 'Applications', 'Where each colour works best.', '<div class="g g2 split" style="gap:28px">' + ''.join(
                f'<div class="box1"><h3>{a}</h3>{V.strip(c_, 30)}<p class="small" style="margin-top:8px">{V.E(", ".join(x["name"] for x in c_))}</p><p class="small gr" style="margin-top:6px">{b}</p></div>' for a, c_, b in apps) + '</div>')
            its = srt(V, s, [x for x in P if x[2] in 'rp' and x[5] != 'trim'])[:8]
            hero_its = its
            add('pieces', 'Pieces to colour first', 'Rising and peaking pieces: colour them in the main palette.', btns(V, s, aud, its, data))
        else:
            lead = 'A palette for each theme: ' + ', '.join(t['name'] for t in TH) + '.'
            h = ''
            for t in TH:
                near = near_colours(V, s, aud, t)
                its = theme_pieces(V, s, aud, P, t)[:4]
                hero_its += its
                h += (f'<article class="look"><div class="lkh"><h3 class="dsp"><a href="/{slug(s, aud, "theme-" + t["slug"])}.html">{V.E(t["name"])}</a></h3></div>{V.strip(near, 60)}'
                      f'<p class="small" style="margin-top:8px">{V.E(", ".join(c["name"] + " " + c["tcx"] for c in near))}</p>' + (btns(V, s, aud, its, data) if its else '') + '</article>')
            add('themes', 'Theme palettes', 'Open a theme for its full story.', h)
        add('sources', 'How we built it', 'Forecut\'s own reading of public evidence.', f'<p style="max-width:52em">{V.E(cf["built"])}</p><p class="small gr" style="margin-top:10px">Pantone TCX codes are the nearest published match; confirm with a physical Pantone book before dyeing.</p>')
    elif key == 'silhouettes':
        kd = 'k' if '-knit' in suf else 'w'
        xs = srt(V, s, [x for x in P if x[5] == 'sil' and x[4] == kd])
        hero_its = xs
        word = 'knit' if kd == 'k' else 'woven'
        if not suf.endswith('-fit'):
            lead = (f'Lead with {keytext(V, [x for x in xs if x[2] in "rp"] or xs)}' + (f'; watch {keytext(V, [x for x in xs if x[2] == "e"], 2)}.' if any(x[2] == 'e' for x in xs) else '.'))
            add('overview', 'Overview', 'The short version.', big(V.E(lead)))
            add('pieces', 'Shapes', 'Select any shape for its design notes, trend curve and lifecycle.', staged(V, s, aud, xs[:16], data))
            add('development', 'How it develops', 'Each shape across the five seasons.', V.lc_table(s, [x[:4] for x in xs[:14]]) if xs else '')
            add('notes', 'Design notes', 'How to put the leading shapes into a range.', notes(V, s, [x for x in xs if x[2] in 'rp'] or xs))
            add('strategy', 'Strategy', 'What to build, test, sell through and drop.', strategy(V, xs))
        else:
            lead = f'Proportions and fit points for {keytext(V, xs, 3) or "the leading " + word + " shapes"}.'
            rows = ''
            for x in [y for y in xs if y[2] in 'rpe'][:12]:
                p, d_, f_ = fit_info(x[1])
                rows += f'<tr><th scope="row">{V.E(x[1]["name"])}</th><td><b class="{V.STAGE[x[2]][1]}">{V.STAGE[x[2]][0]}</b></td><td>{p}</td><td>{V.E(d_)}</td><td>{V.E(f_)}</td></tr>'
            add('overview', 'Overview', 'The short version.', big(V.E(lead)))
            add('proportions', 'Proportions and fit', 'Shape, proportion and the fit point to check in the first fitting.',
                f'<div class="lcwrap"><table class="rpt"><thead><tr><th scope="col">Shape</th><th scope="col">Stage</th><th scope="col">Proportion</th><th scope="col">How it sits</th><th scope="col">Fit point</th></tr></thead><tbody>{rows}</tbody></table></div>')
            bal = ('<ul class="ul acts"><li>Pair one volume piece with one close piece.</li><li>Fit the shoulder and the waist first; everything else hangs from them.</li>' +
                   ('<li>Knit: choose the gauge before the shape; finer gauges hold closer fits, chunky gauges need room.</li>' if kd == 'k' else '<li>Woven: check movement (sitting, arm lift, stride) in every fitting.</li>') +
                   ('<li>Children: allow growing room in length and ease; keep openings easy for small hands.</li>' if kid else '') + '</ul>')
            add('balance', 'Balancing the look', 'Rules of thumb for the season.', bal)
            add('pieces', 'Shapes', 'Select any shape for its design notes.', btns(V, s, aud, xs[:8], data))
    elif key == 'fabrics':
        kd = 'k' if suf.endswith('knit') else 'w'
        xs = srt(V, s, [x for x in P if x[5] == 'fabric' and x[4] == kd]) or srt(V, s, [x for x in P if x[5] == 'fabric'])
        hero_its = xs
        lead = f'Lead with {keytext(V, [x for x in xs if x[2] in "rp"] or xs)}.'
        rows = ''
        for x in xs[:14]:
            c_, w_, h_, f_, p_ = fab_info(x[1], kd)
            rows += f'<tr><th scope="row">{V.E(x[1]["name"])}<br><b class="small {V.STAGE[x[2]][1]}">{V.STAGE[x[2]][0]}</b></th><td>{V.E(c_)}</td><td>{V.E(w_)}</td><td>{V.E(h_)}</td><td>{V.E(f_)}</td><td>{V.E(p_)}</td></tr>'
        add('overview', 'Overview', 'The short version.', big(V.E(lead)))
        add('specs', 'Fabric specifications', 'Typical construction, weight, hand feel and finish. Confirm with your mill before ordering.',
            f'<div class="lcwrap"><table class="rpt"><thead><tr><th scope="col">Fabric story</th><th scope="col">Construction</th><th scope="col">Weight</th><th scope="col">Hand feel</th><th scope="col">Finish</th><th scope="col">Suitable products</th></tr></thead><tbody>{rows}</tbody></table></div>')
        add('pieces', 'Fabrics', 'Select any fabric for its notes and lifecycle.', staged(V, s, aud, xs[:16], data))
        add('development', 'How it develops', 'Each fabric across the five seasons.', V.lc_table(s, [x[:4] for x in xs[:14]]) if xs else '')
    elif key == 'trims':
        T = srt(V, s, [x for x in P if x[5] == 'trim'])
        if suf == 'trims-trending':
            its = T[:16]
            lead = f'Trending now: {keytext(V, [x for x in T if x[2] in "rp"] or T)}.'
            add('overview', 'Overview', 'The short version.', big(V.E(lead)))
            add('pieces', 'Key trims', 'Select any trim for its design notes and lifecycle.', staged(V, s, aud, its, data))
            add('development', 'How it develops', 'Each trim across the five seasons.', V.lc_table(s, [x[:4] for x in its[:14]]) if its else '')
            add('notes', 'Design notes', 'How to use the leading trims.', notes(V, s, its))
        elif suf == 'trims-stories':
            its = []
            h = ''
            for t in TH:
                g = [x for x in T if (t['name'] in V.theme_hits(s, x[1]) if t['row'] is not None else kwmatch(x, t['kw']))]
                if len(g) < 2:
                    g = (g + [x for x in T if x not in g and x[2] in 're'])[:4]
                its += g
                h += (f'<article class="look"><div class="lkh"><h3 class="dsp"><a href="/{slug(s, aud, "theme-" + t["slug"])}.html">{V.E(t["name"])}</a></h3>'
                      f'<span class="lkc"><i style="background:{t["lead"]}"></i><i style="background:{t["accent"]}"></i></span><p class="small gr">{V.E(t["story"])}</p></div>' + btns(V, s, aud, g[:4], data) + '</article>')
            lead = 'The trims that carry each theme: ' + ', '.join(t['name'] for t in TH) + '.'
            add('stories', 'Trim stories', 'One story per theme.', h)
        elif suf == 'trims-market-strategy':
            build = [x for x in T if x[2] in 're']; exitx = [x for x in T if x[2] in 'pf']
            its = build + exitx
            lead = (f'Build {keytext(V, build, 2)}' if build else 'Hold the core trims') + (f'; sell through {keytext(V, exitx, 2)}.' if exitx else '.')
            add('overview', 'Overview', 'The short version.', big(V.E(lead)))
            add('build', 'Build', 'Rising and emerging trims to add.', btns(V, s, aud, build[:8], data))
            add('exit', 'Sell through and exit', 'Peaking and fading trims.', btns(V, s, aud, exitx[:8], data))
            add('markets', 'By market', 'Regional direction for the season, with the pieces that fit each market.', markets(V, s, P))
        else:
            hw = {'Closure', 'Hardware', 'Strap', 'Placket'}
            a_ = [x for x in T if x[1]['area'] in hw]; b_ = [x for x in T if x[1]['area'] not in hw]
            its = a_ + b_
            new = [x for x in its if x[2] == 'e']
            lead = (f'New to test: {keytext(V, new, 3)}.' if new else 'New closures, hardware, finishes and craft details.')
            add('overview', 'Overview', 'The short version.', big(V.E(lead)))
            add('hardware', 'Closures and hardware', 'Fastenings and hardware.', staged(V, s, aud, a_[:8], data) if a_ else '<p class="gr">No new closures this season.</p>')
            add('craft', 'Finishes and craft', 'Stitching, edges and embellishment.', staged(V, s, aud, b_[:8], data) if b_ else '<p class="gr">No new craft details this season.</p>')
        hero_its = its
        add('strategy', 'Strategy', 'What to build, test, sell through and drop.', strategy(V, its))
    elif key == 'styling':
        mode = suf.split('-')[1]
        looks = outfits(V, s, aud, P, mode)
        hero_its = [x for _, l, _ in looks for _, x in l]
        lead = (CELEB['kid' if kid else aud] + ' No celebrity images: every look is built from the forecast pieces.') if mode == 'celebrity' else desc + ' Built from this season\'s forecast pieces.'
        h = ''
        for nm, look, col in looks:
            h += (f'<article class="look"><div class="lkh"><h3 class="dsp">{V.E(nm)}</h3><span class="lkc"><i style="background:{col[0]["hex"]}"></i><i style="background:{col[1]["hex"]}"></i></span>'
                  f'<p class="small gr">{" + ".join(V.E(lbl.lower()) for lbl, _ in look)}. In {V.E(col[0]["name"].lower())} with {V.E(col[1]["name"].lower())}.</p></div>' + btns(V, s, aud, [x for _, x in look], data) +
                  f'<p class="small" style="margin-top:10px">{V.E(look_note(look, mode, kid))}</p></article>')
        add('looks', 'Looks', 'Select any piece for its design notes.', h)
        add('colour', 'Colour', 'The palette to style in.', palette(V, s, aud))
    elif key == 'couture':
        if not kid:
            arts = articles(V, 'couture-', ('menswear', 'bespoke') if aud == 'mens' else ('gown', 'bridal', 'news', 'update'))
            if suf == 'couture-craft':
                its = srt(V, s, [x for x in P if x[1]['area'] in ('Embellishment', 'Finish', 'Fabric', 'Texture', 'Drape', 'Silhouette', 'Shape', 'Pleat', 'Lapel', 'Seam') and x[2] in 'rp'])[:12]
                lead = 'Couture is a laboratory: techniques, proportions and finishes shown there reach occasion wear and premium ready-to-wear one to three seasons later.'
                tech = ([('Hand tailoring', 'Canvassed fronts, hand-set sleeves and soft shoulders.'), ('Hand finishing', 'Pick stitching, hand-felled linings and bound seams.'), ('Embroidery', 'Tonal embroidery and beading in one zone.')] if aud == 'mens' else
                        [('Draping', 'Bias cutting and draping on the stand for fluid shapes.'), ('Structure', 'Corsetry, boning and light interfacing for sculpted bodices.'), ('Embellishment', 'Hand embroidery, beading and featherwork.')])
                add('overview', 'Overview', 'What couture means for this season.', big(V.E(lead)))
                add('techniques', 'Techniques', 'The craft behind the pieces.', '<div class="g g3">' + ''.join(f'<div class="box1"><h3>{V.E(a)}</h3><p class="small gr">{V.E(b)}</p></div>' for a, b in tech) + '</div>')
                add('pieces', 'Couture-led pieces', 'Pieces in the forecast with a couture root.', staged(V, s, aud, its, data))
            else:
                its = srt(V, s, [x for x in P if x[5] == 'trim' and x[2] in 're'])[:12]
                lead = 'Borrow one couture idea per piece and keep the rest simple, so the cost stays under control.'
                tr = [('Hand technique in one zone', 'Work embroidery or beading into a yoke, cuff, neckline or hem border instead of the whole garment.'),
                      ('Structure without weight', 'Use princess seams, light interfacing and corset seaming in place of boning and heavy canvas.'),
                      ('Volume from light fabrics', 'Pleated organza, gathered tulle and bias-cut satin give drama at a lower weight and cost.'),
                      ('Finish as the story', 'Hand-felled hems, bound seams and covered buttons tell the customer where the value is.')]
                add('overview', 'Overview', 'The short version.', big(V.E(lead)))
                add('translate', 'Translations', 'From the atelier to your price point.', '<div class="g g2 split" style="gap:24px">' + ''.join(f'<div class="box1"><h3>{V.E(a_)}</h3><p class="small gr">{V.E(b_)}</p></div>' for a_, b_ in tr) + '</div>')
                add('pieces', 'Details to elevate', 'Rising and emerging details to try it on.', staged(V, s, aud, its, data))
            add('reading', 'Read more', 'Forecut Couture articles.', arts_html(V, arts[:8]))
        else:
            occ = ['velvet', 'party', 'waistcoat', 'kurta', 'mirror', 'gota', 'jutti', 'smock', 'mary jane', 'loafer', 'tulle', 'sequin', 'broderie', 'embroider', 'scallop', 'collar', 'satin', 'lehenga', 'anarkali', 'sherwani', 'bandhgala']
            T = srt(V, s, [x for x in P if x[0] == 'Kidswear|Occasion' or any(w in x[1]['name'].lower() for w in occ)])
            fest = ['kurta', 'mirror', 'gota', 'jutti', 'velvet', 'waistcoat', 'lehenga', 'anarkali', 'sherwani', 'bandhgala']
            its = [x for x in T if any(w in x[1]['name'].lower() for w in fest) == (suf == 'couture-festive')] or T
            lead = ('Occasion wear children can actually wear: soft linings, easy closures and room to move.' if suf == 'couture-occasion' else
                    'Festive and wedding pieces for the family celebration calendar, made light enough to wear all day.')
            add('overview', 'Overview', 'The short version.', big(V.E(lead)))
            add('pieces', 'Key pieces', 'Select any piece for its design notes.', staged(V, s, aud, its, data))
            add('reading', 'Read more', 'From Forecut Couture.', arts_html(V, articles(V, 'couture-', ('kids',))[:3]))
        hero_its = its
    elif key == 'business':
        hero_its = srt(V, s, P)
        rows = cat_rows(V, s, P)
        if suf == 'business-categories':
            top = [k.split('|')[1] for _, k, *_ in rows[:2]]
            lead = f'The strongest growth is in {" and ".join(x.lower() for x in top)}.' if top else desc
            add('overview', 'Overview', 'The short version.', big(V.E(lead)))
            add('categories', 'Category outlook', 'Ranked by momentum: rising and emerging pieces against fading ones.', opp_table(V, s, P))
            add('strategy', 'Build, test, sell, exit', 'Across the audience.', strategy(V, srt(V, s, P)))
        elif suf == 'business-assortment':
            lead = 'Where to put depth, what to test and what to drop, with a good-better-best split.'
            add('overview', 'Overview', 'The short version.', big(V.E(lead)))
            add('plan', 'Assortment plan', 'By category. Depth is relative to your usual buy.', range_plan(V, s, P))
            add('gbb', 'Good, better, best', 'How the range steps up.', gbb(V, s, P))
        elif suf == 'business-price':
            lead = 'Full price on what is new, value on what customers already know, and limited pricing for craft and new materials.'
            add('overview', 'Overview', 'The short version.', big(V.E(lead)))
            add('price', 'Price positioning', 'Where each kind of piece sits.', price_block(V, s, aud, P))
        else:
            lead = f'In stores {m["window"]}. Lead with the markets where the season\'s direction is strongest.'
            add('overview', 'Overview', 'The short version.', big(V.E(lead)))
            add('markets', 'Markets', 'Regional direction, with the pieces that fit each market.', markets(V, s, P))
            add('timing', 'Timing', 'When to buy and deliver.', f'<ul class="ul acts"><li>{V.E(m["stage"])}.</li><li>Deliver rising pieces first; follow with emerging tests once early sales read well.</li><li>Clear fading pieces before the season\'s main drop lands.</li></ul>')
    elif key == 'innovations':
        arts = articles(V, 'innovation-')
        if suf == 'innovations-materials':
            its = srt(V, s, [x for x in P if x[5] == 'fabric' and x[2] in 'er'])[:12] or srt(V, s, [x for x in P if x[5] == 'fabric'])[:12]
            lead = f'Materials to test: {keytext(V, its, 3)}.' if its else desc
            add('overview', 'Overview', 'The short version.', big(V.E(lead)))
            add('pieces', 'Materials to test', 'Emerging and rising materials in the forecast.', staged(V, s, aud, its, data))
            add('reading', 'Innovation reports', 'Forecut\'s material innovation articles.', arts_html(V, arts))
        elif suf == 'innovations-processes':
            if kid:
                g = ['grow', 'extend', 'adjust', 'magnet', 'name', 'organic', 'eco', 'snap', 'reflect', 'neutral', 'upf', 'easy', 'recycled', 'merino', 'popper']
                its = srt(V, s, [x for x in P if any(w in x[1]['name'].lower() for w in g)])[:12]
                lead = 'Clothes that are safer, easier to put on and last longer: fold-back cuffs, let-down hems, adjustable waists and certified materials.'
            else:
                its = srt(V, s, [x for x in P if x[1]['area'] in ('Finish', 'Wash', 'Stitch', 'Seam', 'Closure', 'Hardware', 'Embellishment', 'Texture') and x[2] in 'er'])[:12]
                lead = 'Lower-impact washes, bonded and mono-material construction, and smarter hardware.'
            add('overview', 'Overview', 'The short version.', big(V.E(lead)))
            add('pieces', 'Processes to test', 'Emerging and rising finishes and details.', staged(V, s, aud, its, data))
            add('reading', 'Innovation reports', 'Forecut\'s material innovation articles.', arts_html(V, arts))
        else:
            its = []
            T = {t['slug']: t for t in V.TOOLS}
            lead = 'Digital design, sampling and product data that save time and cloth this season.'
            add('overview', 'Overview', 'The short version.', big(V.E(lead)))
            add('technology', 'Technology to adopt', 'Each with a Forecut tool to start with.', '<div class="g g2 split" style="gap:24px">' + ''.join(
                f'<div class="box1"><h3>{V.E(a)}</h3><p class="small gr">{V.E(b)}</p><a class="lk small" href="/{t}.html">{V.E(T[t]["title"].replace("&", "and")) if t in T else "Open the tool"}</a></div>' for a, b, t in TECH['kid' if kid else 'adult']) + '</div>')
        hero_its = its
    if kid and 'safety' not in [x[0] for x in secs] and key in ('silhouettes', 'fabrics', 'styling', 'trims', 'couture', 'innovations'):
        add('safety', 'Safety notes', 'Check these before sampling.', safety_html(V, aud))
    add('tools', 'Related tools', 'Take this direction into your own work.', SENDBAR + tools_html(V, key))
    body += more_block(V, s, aud, key, suf, R)
    secs.append(('more', 'More'))
    return shell(V, s, aud, title, f'{title}: {lead}', [(f'/{slug(s, aud)}.html', AUD[aud][1]), (f'/{slug(s, aud, key)}.html', sec_name(aud, key))],
                 hero_for(V, s, aud, srt(V, s, hero_its)), lead, secs, body, data, sub=sec_name(aud, key))


def kids_landing(V, s):
    m = V.META[s]
    d = V.CF[s]['dept']['kidswear']
    cards = ''
    for k in ('boys', 'girls', 'toddler-boys', 'toddler-girls'):
        th = themes(V, s, k)
        cards += (f'<a class="kidc" href="/{slug(s, k)}.html"><b class="dsp">{AUD[k][1]}</b><span class="small gr">{AUD[k][2]}</span>'
                  f'<span class="small">Themes: {V.E(", ".join(t["name"] for t in th))}</span><span class="lk small">Open {m["code"]} {AUD[k][1].lower()}</span></a>')
    body = sec('choose', 'Choose an audience', 'Each has its own forecast sections, named themes and reports.', f'<div class="kidg">{cards}</div>')
    body += sec('palette', 'Kidswear colour', V.E(V.CF[s]['status']) + '.', f'<p class="gr" style="max-width:52em;margin-bottom:18px">{V.E(d["text"])}</p><div class="chips">' + ''.join(V.chip(c) for c in d['colours']) + '</div>')
    body += sec('safety', 'Safety first', 'For every kids range.', safety_html(V, 'toddler-boys'))
    sw = ''.join(f'<a class="atp{" on" if k == s else ""}" href="/{k}-kids.html">{V.META[k]["code"]}</a>' for k in V.SKEYS)
    body += sec('more', 'Other seasons', 'Kids forecasts by season.', f'<div class="atps">{sw}</div>')
    hero = '<div class="cmos">' + ''.join(f'<i style="background:{c["hex"]};--k:{n}"></i>' for n, c in enumerate(d['colours'])) + '</div>'
    h = V.head(f'{m["code"]} Kids forecasts | Forecut', f'{m["code"]} kidswear forecasts for boys, girls, toddler boys and toddler girls.') + V.nav_app('Forecasts') + '<main id="main">'
    h += f'<div class="w crumb"><a href="/forecasts.html">Forecasts</a> / <a href="/forecasts.html#{s}">{m["code"]}</a> / Kids</div>'
    h += (f'<section class="w rhead"><div class="chhero">{hero}</div><div class="rinfo"><p class="small gr">{V.E(m["title"])}, {V.E(m["stage"].lower())}</p>'
          f'<h1 class="dsp">{m["code"]} Kids</h1><p class="lead">Kidswear follows adult direction a season or two later, adapted for comfort, safety and growth. Choose boys, girls, toddler boys or toddler girls.</p>'
          f'<div class="ctas"><a class="btn" href="#choose">Choose an audience</a></div></div></section>')
    h += f'<div class="w" id="kids">{body}</div></main>'
    return h + V.footer() + V.end()


# ------------------------------------------------------------ library block for forecasts.html
def aud_row(V, s):
    return ('<div class="auds">' + ''.join(
        f'<a class="aud" href="/{slug(s, k)}.html"><b>{V.E(t)}</b><span>{V.E(d)}</span></a>' for k, t, d in AUDS) +
        f'<a class="aud kids" href="/{s}-kids.html"><b>Kids</b><span>Choose boys, girls or toddlers</span></a></div>')


def build(V):
    """Return {page name: html} for the whole tree."""
    pages = {}
    adult_photo = V.photo

    def kid_photo(name, s):
        k = 'kid-' + V.islug(name)
        return next((x for x in (f'{k}-{s}', k) if x in V.IMG), None)
    for s in V.SKEYS:
        V._PATH[:] = [f'{s}-kids.html', None]
        pages[f'{s}-kids'] = kids_landing(V, s)
        for aud, _, _ in AUDS:
            V.photo = kid_photo if aud in KIDS else adult_photo
            TH = themes(V, s, aud)
            R = reports(aud, TH)
            V._PATH[:] = [slug(s, aud) + '.html', None]
            pages[slug(s, aud)] = hub(V, s, aud, TH, R)
            for key, _, _ in SECTIONS:
                cov = COVERMAP[key] or ('menswear' if aud == 'mens' else 'womenswear' if aud == 'womens' else 'knitwear')
                si = f'cover-{s}-{cov}' if f'cover-{s}-{cov}' in V.IMG else None
                V._PATH[:] = [slug(s, aud, key) + '.html', si]
                pages[slug(s, aud, key)] = section_page(V, s, aud, key, TH, R)
                for suf, nm, d in R[key]:
                    V._PATH[:] = [slug(s, aud, suf) + '.html', si]
                    if key == 'themes':
                        th = next(t for t in TH if 'theme-' + t['slug'] == suf)
                        if aud == 'womens' and th.get('img') in V.IMG:
                            V._PATH[1] = th['img']
                        pages[slug(s, aud, suf)] = theme_page(V, s, aud, th, TH, R)
                    else:
                        pages[slug(s, aud, suf)] = report(V, s, aud, key, suf, nm, d, TH, R)
    V.photo = adult_photo
    return pages


def stale_redirects(V, pages):
    """Tree pages from the first build that no longer exist: point each to the nearest current page."""
    out = {}
    pat = re.compile(r'^(aw26|ss27|aw27|ss28|aw28)-(mens|womens|kids|boys|girls|toddler-boys|toddler-girls)(-.+)?\.html$')
    for f in os.listdir(V.ROOT):
        mt = pat.match(f)
        if not mt or f[:-5] in pages:
            continue
        s, aud, rest = mt.group(1), mt.group(2), (mt.group(3) or '')[1:]
        if aud == 'kids':
            to = f'/{s}-kids.html'
        else:
            sec_ = next((k for k, _, _ in SECTIONS if rest.startswith(k)), None) or ('themes' if rest.startswith('theme') else None)
            to = f'/{slug(s, aud, sec_)}.html' if sec_ else f'/{slug(s, aud)}.html'
        out[f[:-5]] = to
    return out
