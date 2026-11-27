"""Forecut monthly magazine: flipbook reader + issue index + email. Pages are built from the site's own forecast data."""
import csv, datetime as dt, html, json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'magazine'))
import journal_data as J
import home_blocks as HB
from issues import ISSUES

B = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(B, '..'))
OUT = os.path.join(ROOT, 'magazine')
E = html.escape
M = json.load(open(os.path.join(B, 'seasons.json')))['meta']
IMGS = set(os.listdir(os.path.join(ROOT, 'img')))
NEW = json.load(open(os.path.join(B, 'new_this_month.json')))
BASE = 'https://forecut.in'
GA = 'G-EHT7W1C07R'


def has(k):
    return k and (k + '.webp') in IMGS


def im(k, cls='', alt=''):
    return f'<img class="{cls}" src="/img/{k}.webp" alt="{E(alt)}" loading="lazy">' if has(k) else ''


def lum(hx):
    h = hx.lstrip('#'); r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)); return .2126 * r + .7152 * g + .0722 * b


def ink(bg):
    return '#1c1714' if lum(bg) > .55 else '#fff'


# ------------------------------------------------------------ image slots the editor can generate (all optional: pages fall back to colour and type)
SLOTS = []   # (file, page_use, prompt, aspect)


def slot(name, use, prompt, aspect='3:4'):
    SLOTS.append((f'mag-{CUR["id"]}-{name}', use, prompt, aspect))
    return f'mag-{CUR["id"]}-{name}'


PHOTO_PROMPTS = {'the-waist-returns': 'Fashion photograph, full length, a woman seen from the side in a structured ivory basque-waist bodice and full bubble-hem skirt, turning on a spiral stone staircase, cool daylight from a skylight above, silvery architectural tones, 50mm lens, crisp and graphic, no text, no logos', 'handcraft': 'Documentary close-up of hands hand-embroidering a cotton shirt on a wooden frame, coloured thread in saffron, madder red and indigo, workshop window light, shallow depth of field, tactile and warm, no faces, no text', 'undone': 'Soft-focus lifestyle photograph of a rumpled washed-linen shirt and trousers drying on a rope line between two whitewashed walls, sand and chalk tones, harsh midday sun and deep shadows, relaxed and unpolished, no people, no text', 'in-motion': 'Motion-blur photograph of a model in a pleated orange technical skirt mid-stride on a rooftop at golden hour, fabric flaring, city haze behind, 1/30s shutter, energetic, saturated tangerine against pale sky, no text, no logos', 'elegant-ease': 'Quiet interior photograph of a woman seated in a relaxed olive-green silk shirt and wide tailored trousers on a low cane bench, sage plaster wall, diffused window light, restful and polished, 35mm, no text, no logos', 'reworked-denim': 'Studio still life of patchworked and re-stitched denim in washed indigo, faded blue and raw white, folded in a stack beside a pair of shears and a spool of contrast thread, cool grey backdrop, top-down light, no text, no brand labels'}


def build_issue(CUR_):
    global CUR, SLOTS
    CUR = CUR_; SLOTS = []
    S = M['ss27']; TH = S['themes']; PAL = S['palette']
    arts = [a for a in J.ARTICLES if a.get('date')]
    arts.sort(key=lambda a: a['date'], reverse=True)
    P = []   # (kind, html, toc_title or None)

    def pg(kind, inner, toc=None, cls='', style=''):
        P.append((kind, f'<section class="pg {kind} {cls}" style="{style}">{inner}</section>', toc))

    def folio(n=None):
        return ''

    cov = slot('cover', 'Cover, full page', 'Fashion editorial photograph, tall portrait frame, one model in a vivid cobalt-blue peplum jacket with a defined waist, standing in a bare plaster-walled studio with a single arched window, low winter sun raking from the left, rich shadows, shot on 85mm at f/2, space left empty in the top third for a magazine masthead, no text, no logos, no brand labels', '3:4')
    # ---- cover
    cover_img = cov if has(cov) else ('theme-ss27-the-waist-returns' if has('theme-ss27-the-waist-returns') else None)
    pg('cover', (im(cover_img, 'bg') if cover_img else '<div class="bg solid"></div>') + f'<div class="mast"><b>FORECUT</b><span>{E(CUR["month"].upper())} · ISSUE {CUR["no"]:02d}</span></div>'
       f'<div class="cl"><h1>{E(CUR["cover_line"])}</h1><ul>' + ''.join(f'<li>{E(x)}</li>' for x in CUR['cover_lines']) + '</ul></div>')
    ad1 = slot('ad-forecasts', 'Inside front cover advert', 'Flat-lay still life on warm terracotta paper: a fan of fabric swatches in lilac, true red, sand and Klein blue, brass scissors, a tape measure and a pencil, shot straight down with soft window light, tactile and graphic, no text, no logos', '3:4')
    pg('ad', (im(ad1, 'bg') if has(ad1) else '') + '<div class="adc"><p class="k">Forecut forecasts</p><h2>See the season before it lands.</h2><p>SS27, AW27, SS28 and AW28, with themes, colour, fabrics and details.</p><a href="/forecasts/">forecut.in/forecasts</a></div>', None, 'adr')
    pgn_contents = len(P)
    pg('contents', '', 'Contents')   # filled after all pages are known
    # ---- editor
    ed = slot('editor-desk', 'Editor\'s letter, top half', 'Quiet editor\'s desk seen from above in morning light: open notebook with colour chips, a ceramic cup, a sprig of dried lavender, a folded linen shirt, muted greige and sage palette, shallow depth of field, no text, no people', '4:3')
    pg('letter', (f'<div class="ph">{im(ed)}</div>' if has(ed) else '<div class="ph solid"></div>') + '<p class="k">Editor\'s letter</p><h2>Reading the season, one month at a time</h2>' + ''.join(f'<p>{E(x)}</p>' for x in CUR['editor']) + '<p class="sig">The Forecut team</p>', "Editor's letter")
    # ---- this month at Forecut
    def divider(num, title, sub, colour, key, prompt):
        s = slot(key, f'Section opener: {title}', prompt, '3:4')
        pg('divider', (im(s, 'bg') if has(s) else '') + f'<div class="dv"><span>{num}</span><h2>{E(title)}</h2><p>{E(sub)}</p></div>', title, '', f'background:{colour};color:{ink(colour)}')
    divider('01', 'The season', 'SS27, theme by theme', '#2f5fc0', 'open-season', 'Long exposure fashion photograph of a runway-length corridor of sheer pleated silk curtains in cobalt blue moving in wind, one lit doorway at the end, cinematic and abstract, deep blue and white only, no people, no text')
    pg('lead', f'<p class="k">{E(S["code"])} · {E(S["stage"])}</p><h2>{E(S["intro"].split(".")[0])}.</h2><p class="big">{E(". ".join(S["intro"].split(".")[1:]).strip())}</p><div class="chips">' + ''.join(f'<span style="background:{t[3]};color:{ink(t[3])}">{E(t[0])}</span>' for t in TH) + '</div><div class="strip">' + ''.join(f'<i style="background:{h}"></i>' for h, n in PAL) + '</div>', 'SS27 in one page')
    for i, t in enumerate(TH):
        key = re.sub(r'[^a-z0-9]+', '-', t[0].lower()).strip('-')
        th_img = f'theme-ss27-{key}'
        pg('theme', (f'<div class="ph">{im(th_img)}</div>' if has(th_img) else '<div class="ph solid" style="background:' + t[4] + '"></div>') + f'<p class="k">Theme {i + 1} of {len(TH)}</p><h2>{E(t[0])}</h2><p class="big">{E(t[1])}</p>', t[0], '', f'--a:{t[3]};--b:{t[4]}')
        gar = t[5]; kw = t[6]
        sw = ''.join(f'<i style="background:{c}"></i>' for c in (t[3], t[4]))
        pg('theme3', f'<p class="k">{E(t[0])} · in a word</p><div class="words">' + ''.join(f'<b>{E(k)}</b>' for k in kw) + f'</div><p class="q">{E(t[1])}</p>', None, '', f'background:{t[3]};color:{ink(t[3])}')
        sp = slot('photo-' + key, 'Photo page for theme: ' + t[0], PHOTO_PROMPTS.get(key, ''), '3:4')
        pg('photo', (im(sp, 'bg') if has(sp) else '') + f'<div class="cap"><b>{E(t[0])}</b><span>Illustration for this theme</span></div>', None, '', f'background:linear-gradient(160deg,{t[3]},{t[4]})')
        pg('theme2', f'<p class="k">{E(t[0])}</p><h3>What to design</h3><p class="big">{E(gar)}</p><h4>Keywords</h4><div class="chips">' + ''.join(f'<span>{E(k)}</span>' for k in kw) + f'</div><h4>Theme colours</h4><div class="sws">{sw}</div><p class="note">See the full theme, with mood board and fabrics, at forecut.in.</p>', None, '', f'--a:{t[3]};--b:{t[4]}')
    # ---- colour
    divider('02', 'Colour', 'The SS27 palette', '#c71f2d', 'open-colour', 'Overhead photograph of hand-dyed silk skeins and cotton threads laid in overlapping loops, lilac, violet, true red, optic white, sand and Klein blue, soft diffused light, visible fibre texture, no text, no people')
    for k in range(0, len(PAL), 4):
        grp = PAL[k:k + 4]
        pg('palette', '<p class="k">SS27 palette</p><h2>Seven colours for spring</h2><div class="bands">' + ''.join(f'<div style="background:{h};color:{ink(h)}"><b>{E(n)}</b><span>{h.upper()}</span></div>' for h, n in grp) + '</div>', 'Palette' if k == 0 else None)
    # ---- garments from forecast items
    divider('03', 'The details', 'Garments, fabrics and finishes', '#1f3d33', 'open-details', 'Macro photograph of a woven wool and linen cloth with a hand-stitched seam and a mother-of-pearl button, raking light that shows each yarn, deep forest green and cream, no text, no people')
    _x=slot('photo-fabrics','Photo page: fabrics','Macro photograph of a jacquard cotton-silk cloth with a diamond weave in violet and sand, light raking across the surface to show the yarn, no text','3:4'); pg('photo', (im(_x,'bg') if has(_x) else '') + '<div class="cap"><b>fabrics</b><span>Illustration</span></div>', None, '', 'background:linear-gradient(160deg,#1f3d33,#2d3935)')
    _x=slot('photo-trims','Photo page: trims','Macro photograph of a tray of horn, shell and brass buttons with a coil of silk cord and a brass zip pull, neutral linen background, even soft light, crisp focus, no text, no logos','3:4'); pg('photo', (im(_x,'bg') if has(_x) else '') + '<div class="cap"><b>trims</b><span>Illustration</span></div>', None, '', 'background:linear-gradient(160deg,#1f3d33,#2d3935)')
    _x=slot('photo-footwear','Photo page: footwear','Low-angle photograph of elegant pointed leather slingback shoes in cream and cobalt on a polished terrazzo floor, long reflections, late afternoon light, minimal composition, no text, no logos','3:4'); pg('photo', (im(_x,'bg') if has(_x) else '') + '<div class="cap"><b>footwear</b><span>Illustration</span></div>', None, '', 'background:linear-gradient(160deg,#1f3d33,#2d3935)')
    items = NEW[:16]
    for k in range(0, len(items), 4):
        grp = items[k:k + 4]
        pg('list', '<p class="k">New in the forecast this month</p><h2>' + ('Details added' if k == 0 else 'More details') + '</h2><ol>' + ''.join(f'<li><b>{E(x)}</b></li>' for x in grp) + '</ol><p class="note">Each detail has a card with a sketch, spec notes and a trend graph on forecut.in.</p>', 'New details' if k == 0 else None)
    # ---- markets and articles
    divider('04', 'The markets', 'Where SS27 will be sold, and when', '#a9481f', 'open-markets', 'Dusk photograph of a busy covered market street seen from above, fabric stalls with bolts of cloth in saffron, indigo and green, string lights, warm amber haze, wide lens, documentary feel, no readable signs, no recognisable faces')
    _x=slot('photo-india','Photo page: India market',"Warm photograph of a handloom weaver's workshop: a wooden loom with a half-woven sari in magenta and gold, thread cones in the foreground, shafts of dusty light, no faces, no text",'3:4'); pg('photo', (im(_x,'bg') if has(_x) else '') + '<div class="cap"><b>India market</b><span>Illustration</span></div>', None, '', 'background:linear-gradient(160deg,#1f3d33,#2d3935)')
    _x=slot('photo-gulf','Photo page: Gulf market','Modern arched marble boutique corridor lit in soft gold at dusk, empty, a single abaya-style silk coat in emerald on a stand, symmetrical composition, no text, no logos','3:4'); pg('photo', (im(_x,'bg') if has(_x) else '') + '<div class="cap"><b>Gulf market</b><span>Illustration</span></div>', None, '', 'background:linear-gradient(160deg,#1f3d33,#2d3935)')
    _x=slot('photo-seasia','Photo page: Southeast Asia','Humid-green photograph of batik cloth in indigo and ochre hanging to dry in a tropical courtyard, banana leaves in the background, soft overcast light, no people, no text','3:4'); pg('photo', (im(_x,'bg') if has(_x) else '') + '<div class="cap"><b>Southeast Asia</b><span>Illustration</span></div>', None, '', 'background:linear-gradient(160deg,#1f3d33,#2d3935)')
    reg = [a for a in arts if 'market' in a['tag'].lower() or 'forecast' in a['tag'].lower()]
    oth = [a for a in arts if a not in reg]

    def article(a, kind):
        body = a['body']; paras = []
        for b in body:
            if b[0] == 'p': paras.append(('p', b[1]))
            elif b[0].startswith('h'): paras.append(('h', b[1]))
        pic = a.get('hero_new') or a.get('hero')
        if pic and not has(pic) and a.get('img_prompt'): SLOTS.append((pic, 'Article image: ' + a['title'][:70], a['img_prompt'], '16:10'))
        head = f'<p class="k">{E(a["tag"])} · {E(a.get("date_txt", ""))}</p><h2>{E(a["title"])}</h2><p class="big">{E(a["desc"])}</p>'
        p1 = (f'<div class="ph">{im(pic)}</div>' if has(pic) else '')
        # fill by character budget
        pages, cur, n = [], [], 0
        budget = 1100 if has(pic) else 1500
        for kd, tx in paras:
            if len(tx) > 700: tx = tx[:tx.rfind(' ', 0, 700)] + '…'
            if n + len(tx) > budget and cur:
                pages.append(cur); cur = []; n = 0; budget = 1900
            cur.append((kd, tx)); n += len(tx)
            if len(pages) >= 1 and n > 1500: break
        pages.append(cur)
        pages = pages[:2]
        for i, c in enumerate(pages):
            txt = ''.join(f'<p>{E(t)}</p>' if k == 'p' else f'<h4>{E(t)}</h4>' for k, t in c)
            tail = f'<p class="note">Continue reading at forecut.in/{E(a["slug"])}</p>' if i == len(pages) - 1 else ''
            pg(kind, (head + p1 if i == 0 else '<p class="k">' + E(a['title'][:70]) + '</p>') + f'<div class="cols">{txt}</div>' + tail, a['title'][:60] if i == 0 else None)
    for a in reg[:9]: article(a, 'article')
    divider('05', 'Business', 'Sourcing, fabrics and what buyers want', '#2d3935', 'open-business', 'Black-and-white photograph of a textile mill floor, rows of warping beams and a single worker\'s silhouette far away, strong diagonal light through high windows, grainy film look, no text, no logos')
    for a in oth[:8]: article(a, 'article')
    # ---- quotes: Forecut's own lines
    # ---- calendar
    divider('06', 'Dates', 'What to watch, and when', '#6D7CFF', 'open-dates', 'Minimal still life of a paper desk calendar, a brass pin on a month grid, a swatch card and a pair of tailor\'s chalk pencils, periwinkle and white, hard side light, graphic shadows, no readable text')
    cal = [(d, t, u) for d, t, u in HB.CALENDAR if d >= dt.date(2026, 12, 1)][:12]
    for k in range(0, max(len(cal), 1), 6):
        grp = cal[k:k + 6]
        pg('calendar', '<p class="k">Coming up</p><h2>Dates that follow the forecast</h2><ul>' + ''.join(f'<li><b>{d.strftime("%-d %b %Y")}</b><span>{E(t)}</span></li>' for d, t, u in grp) + '</ul>', 'Calendar' if k == 0 else None)
    # ---- look ahead
    for code in ('aw27', 'ss28', 'aw28'):
        m = M[code]
        pg('ahead', f'<p class="k">Looking ahead · {E(m["code"])} · {E(m["stage"])}</p><h2>{E(m["title"])}</h2><p class="big">{E(m["intro"].split(".")[0])}.</p><p>{E(". ".join(m["intro"].split(".")[1:3]).strip())}</p><div class="sws wide">' + ''.join(f'<i style="background:{h}" title="{E(n)}"></i>' for h, n in m['palette'][:7]) + f'</div><p class="note">{E(m["window"])}. Updated after the January fairs.</p>', f'{m["code"]} outlook' if code == 'aw27' else None)
    # ---- brand of the month (editor supplied)
    if CUR.get('brand'):
        b = CUR['brand']
        bi = slot('brand-hero', 'Brand of the month, hero', 'Editorial photograph of the brand\'s studio or workshop, craft in progress, natural light, authentic detail, no logos or readable labels', '3:4')
        divider('07', 'Brand of the month', b['name'], '#8a6f86', 'open-brand', 'Abstract close-up of folded satin ribbon in dusty mauve, soft studio light, smooth gradient shadows, no text')
        pg('brand', (f'<div class="ph">{im(bi)}</div>' if has(bi) else '') + f'<p class="k">{E(b["country"])}</p><h2>{E(b["name"])}</h2><p class="big">{E(b["one_line"])}</p>' + ''.join(f'<p>{E(x)}</p>' for x in b['story']), 'Brand of the month')
        pg('brand2', '<h3>What to learn</h3><ul>' + ''.join(f'<li>{E(x)}</li>' for x in b['what_to_learn']) + '</ul><dl>' + ''.join(f'<dt>{E(a)}</dt><dd>{E(c)}</dd>' for a, c in b['facts']) + '</dl><p class="note">Sources: ' + E('; '.join(b['sources'])) + '</p>')
    # ---- ads
    ad2 = slot('ad-tools', 'Advert: design tools', 'Clean studio photograph of a pattern-cutting table: paper pattern pieces, a curved ruler, notches marked in pencil and a small mannequin in the background, cool grey and lilac, overhead softbox light, no text, no logos', '3:4')
    pg('ad', (im(ad2, 'bg') if has(ad2) else '') + '<div class="adc"><p class="k">Forecut tools</p><h2>From the forecast to a tech pack.</h2><p>Brief, pattern, cost and hand over, in one place.</p><a href="/tools.html">forecut.in/tools</a></div>', None, 'adr')
    ad3 = slot('ad-colour', 'Advert: colour library', 'Close-up of nine painted colour chips fanned like a hand of cards on raw linen, saturated lilac, red, sand, blue and white, shallow focus, natural north light, no text, no numbers', '3:4')
    pg('ad', (im(ad3, 'bg') if has(ad3) else '') + '<div class="adc"><p class="k">Colour library</p><h2>Every season colour, with HEX.</h2><p>Search by season, hue and name.</p><a href="/colour.html">forecut.in/colour</a></div>', None, 'adr')
    ad4 = slot('ad-schools', 'Advert: fashion schools', 'Bright design studio classroom, long worktable covered with sketchbooks, fabric samples and a mood board of colour chips, afternoon sun through tall windows, no people in frame, no readable text', '3:4')
    pg('ad', (im(ad4, 'bg') if has(ad4) else '') + '<div class="adc"><p class="k">Fashion schools</p><h2>One code for the whole batch.</h2><p>Live forecasts and tools for projects and portfolios.</p><a href="/services/fashion-schools.html">forecut.in/services</a></div>', None, 'adr')
    bk = slot('back', 'Back cover', 'Single pleated white silk fan resting on a pale terracotta surface, long soft shadow, quiet and minimal, a lot of empty space, no text', '3:4')
    pg('back', (im(bk, 'bg') if has(bk) else '') + '<div class="bc"><b>FORECUT</b><p>Next issue on 1 January 2027.</p><p>hello@forecut.in · forecut.in</p></div>')
    # ---- contents (now we know pages)
    ents = [(i + 1, t) for i, (k, h, t) in enumerate(P) if t and k != 'contents']
    ents = [e for e in ents if e[1] not in ('Contents',)]
    P[pgn_contents] = ('contents', '<section class="pg contents"><p class="k">Inside this issue</p><h2>Contents</h2><ol>' + ''.join(f'<li><a href="#p{n}" data-go="{n}"><span>{E(t)}</span><i>{n}</i></a></li>' for n, t in ents) + '</ol></section>', 'Contents')
    return P


CSS = r'''
:root{--g:#1f3d33;--t:#a9481f;--c:#f5f0e8;--ink:#1c1714}
*{box-sizing:border-box;margin:0;padding:0}
body.mg{background:#1c1f1d;color:#fff;font:400 16px/1.5 "Archivo",system-ui,sans-serif;min-height:100vh;display:flex;flex-direction:column;overflow-x:hidden}
.mgb{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:12px 20px;background:#141614;border-bottom:1px solid #2c312e}
.mgb a{color:#c9d3cd;text-decoration:none;font-size:14px}.mgb a:hover{color:#fff}.mgb .t{font:600 14px "Archivo";letter-spacing:.12em;color:#fff}
.mgb button{all:unset;cursor:pointer;color:#c9d3cd;font-size:14px;padding:6px 10px;border:1px solid #3a413d;border-radius:3px}.mgb button:hover{color:#fff;border-color:#8a948f}
.stage{flex:1;display:grid;place-items:center;padding:24px 12px;perspective:2600px;--pw:min(46vw,calc((100vh - 170px)*.75),560px)}
.book{position:relative;width:calc(var(--pw)*2);height:calc(var(--pw)*4/3);transform-style:preserve-3d;transition:transform .6s}
.book.s0{transform:translateX(calc(var(--pw)*-.5))}.book.se{transform:translateX(calc(var(--pw)*.5))}
.lf{position:absolute;left:50%;top:0;width:50%;height:100%;transform-origin:left center;transform-style:preserve-3d;transition:transform .85s cubic-bezier(.5,.05,.2,1);cursor:pointer}
.lf.fl{transform:rotateY(-180deg)}
.fc,.bk{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;overflow:hidden}
.bk{transform:rotateY(180deg)}
.fc::after,.bk::after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(90deg,rgba(0,0,0,.18),transparent 9%)}
.bk::after{background:linear-gradient(270deg,rgba(0,0,0,.18),transparent 9%)}
.book::before{content:"";position:absolute;left:0;top:0;width:50%;height:100%;box-shadow:inset -14px 0 24px -14px rgba(0,0,0,.45)}
.pg{width:100%;height:100%;background:#fbf8f2;color:var(--ink);container-type:inline-size;position:relative;overflow:hidden;padding:7cqw;font-size:3.4cqw;line-height:1.5}
.pg .k{font:600 2.3cqw/1 "Archivo";letter-spacing:.12em;text-transform:uppercase;color:var(--t);margin-bottom:2.6cqw}
.pg h2{font:300 7.4cqw/1.02 "Archivo";font-stretch:125%;letter-spacing:-.02em;margin:0 0 3cqw}
.pg h3{font:300 6cqw/1.05 "Archivo";font-stretch:125%;margin:0 0 3cqw}.pg h4{font:600 2.4cqw "Archivo";letter-spacing:.1em;text-transform:uppercase;color:#6b625b;margin:4cqw 0 1.6cqw}
.pg p{margin-bottom:2.2cqw}.pg .big{font:italic 400 4.2cqw/1.38 Georgia,"Times New Roman",serif;color:#2d3935}.pg .note{font-size:2.5cqw;color:#8a817a;margin-top:3cqw}
.pg .bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.pg .bg.solid{background:linear-gradient(160deg,#2f5fc0,#1f3d33)}
.pg .ph{height:44%;margin:-7cqw -7cqw 4cqw;overflow:hidden;background:#e8e2d6}.pg .ph img{width:100%;height:100%;object-fit:cover}.pg .ph.solid{background:#e8e2d6}
.chips{display:flex;flex-wrap:wrap;gap:1.6cqw}.chips span{padding:1.1cqw 2.6cqw;border-radius:99cqw;background:#efe9de;font-size:2.7cqw;font-weight:500}
.sws{display:flex;gap:2cqw}.sws i{display:block;width:16cqw;height:16cqw;border-radius:50%}.sws.wide i{flex:1;height:10cqw;border-radius:0}
.cover{padding:0;color:#fff;background:#1f3d33}.cover .mast{position:absolute;left:6cqw;right:6cqw;top:5cqw;text-align:center;text-shadow:0 1px 18px rgba(0,0,0,.25)}
.cover .mast b{display:block;font:200 12.4cqw/1 "Archivo";font-stretch:125%;letter-spacing:.04em}.cover .mast span{font:600 2.4cqw "Archivo";letter-spacing:.3em}
.cover .cl{position:absolute;left:6cqw;right:6cqw;bottom:6cqw;text-shadow:0 1px 20px rgba(0,0,0,.45)}.cover h1{font:300 11cqw/.98 "Archivo";font-stretch:125%;letter-spacing:-.03em;margin-bottom:3.5cqw}
.cover ul{list-style:none}.cover li{font:600 3cqw "Archivo";padding:1cqw 0;border-top:1px solid rgba(255,255,255,.5)}
.contents ol{list-style:none;columns:1}.contents li{border-bottom:1px solid #e6ded3}.contents a{display:flex;justify-content:space-between;gap:3cqw;padding:2cqw 0;color:inherit;text-decoration:none;font:500 3.3cqw "Archivo"}.contents i{font-style:normal;color:var(--t);font-weight:700}
.letter .sig{font:italic 3.6cqw Georgia,serif;margin-top:4cqw}
.divider{padding:0;display:flex;align-items:flex-end}.divider .dv{position:relative;padding:8cqw;width:100%;background:linear-gradient(0deg,rgba(0,0,0,.42),transparent)}.divider .dv span{font:200 6cqw "Archivo";font-stretch:125%;opacity:.9}.divider h2{font-size:15cqw;margin:2cqw 0}.divider p{font:italic 4.2cqw Georgia,serif;margin:0}
.lead .big{font-size:5cqw;margin-bottom:5cqw}.lead h2{font-size:8cqw}
.theme{display:flex;flex-direction:column}.theme h2{font-size:9cqw;color:var(--a)}.theme .ph{height:52%}
.strip{position:absolute;left:0;right:0;bottom:0;height:24%;display:flex}.strip i{flex:1}
.theme2::after,.list::after,.calendar::after{content:"";position:absolute;left:0;right:0;bottom:0;height:26%;background:linear-gradient(135deg,var(--a,#1f3d33),var(--b,#2f5fc0))}
.photo{padding:0;color:#fff}.photo .cap{position:absolute;left:0;right:0;bottom:0;padding:7cqw;background:linear-gradient(0deg,rgba(0,0,0,.5),transparent)}.photo .cap b{display:block;font:300 8cqw/1 "Archivo";font-stretch:125%}.photo .cap span{font-size:2.6cqw;opacity:.85}
.theme3 .words{display:flex;flex-direction:column;gap:1cqw;margin:6cqw 0}.theme3 .words b{font:200 15cqw/.95 "Archivo";font-stretch:125%;letter-spacing:-.03em}.theme3 .q{font:italic 4.4cqw/1.35 Georgia,serif;max-width:80%;position:absolute;bottom:7cqw;left:7cqw}.theme3 .k{color:inherit;opacity:.8}
.theme2 h3{color:var(--a)}.theme2 .sws i{background:var(--a)}
.bands{display:flex;flex-direction:column;gap:0;height:72%;margin-top:3cqw}.bands div{flex:1;display:flex;justify-content:space-between;align-items:flex-end;padding:3cqw 4cqw;font:500 3.2cqw "Archivo"}.bands b{font:300 5.6cqw "Archivo";font-stretch:125%}
.list ol{list-style:none;counter-reset:n}.list li{counter-increment:n;padding:3.4cqw 0;border-bottom:1px solid #e6ded3;font:300 5cqw/1.15 "Archivo";font-stretch:115%}.list li::before{content:counter(n,decimal-leading-zero);color:var(--t);font:600 2.6cqw "Archivo";margin-right:3cqw;letter-spacing:.1em}
.article h2{font-size:6.4cqw}.article .cols{column-count:2;column-gap:4cqw;font-size:2.7cqw;line-height:1.5}.article .cols p{break-inside:avoid-column}.article .ph{height:32%}
.calendar ul{list-style:none}.calendar li{display:grid;grid-template-columns:30cqw 1fr;gap:3cqw;padding:3cqw 0;border-bottom:1px solid #e6ded3}.calendar b{font:300 4cqw "Archivo";font-stretch:120%;color:var(--g)}
.ahead h2{font-size:8cqw}.ahead .sws.wide i{height:22cqw}.ahead{background:#f5f0e8}
.brand h2{font-size:9cqw}.brand2 dl{display:grid;grid-template-columns:30cqw 1fr;gap:1.6cqw 3cqw}.brand2 dt{font-weight:700}.brand2 li{margin:0 0 2cqw 4cqw}
.ad{padding:0;color:#fff;background:#a9481f}.ad.adr{display:flex;align-items:flex-end}.adc{position:relative;padding:8cqw;width:100%;background:linear-gradient(0deg,rgba(20,24,22,.78),rgba(20,24,22,0))}.adc h2{font-size:9.5cqw;color:#fff}.adc .k{color:#f5c9b0}.adc a{display:inline-block;margin-top:2cqw;color:#fff;border-bottom:2px solid #e0784b;text-decoration:none;font-weight:600;font-size:3cqw}
.back{padding:0;background:#1f3d33;color:#fff;display:flex;align-items:flex-end}.back .bc{position:relative;padding:9cqw;width:100%}.back b{display:block;font:200 13cqw "Archivo";font-stretch:125%;letter-spacing:.06em;margin-bottom:3cqw}
.ctl{display:flex;justify-content:center;align-items:center;gap:18px;padding:10px 12px 16px;background:#141614;color:#c9d3cd;font-size:14px}
.ctl button{all:unset;cursor:pointer;width:42px;height:42px;border-radius:50%;border:1px solid #3a413d;display:grid;place-items:center;font-size:20px;color:#fff}.ctl button:hover{background:#2a312d}.ctl button:disabled{opacity:.3;cursor:default}
.ctl input{width:min(36vw,320px);accent-color:#e0784b}
.thumbs{position:fixed;inset:0;background:rgba(10,12,11,.94);z-index:50;overflow:auto;padding:70px 20px 30px;display:none}.thumbs.on{display:block}
.thumbs ol{list-style:none;max-width:760px;margin:0 auto;columns:2;column-gap:40px}.thumbs li{break-inside:avoid;border-bottom:1px solid #2c312e}.thumbs a{display:flex;justify-content:space-between;padding:12px 0;color:#e8eeea;text-decoration:none}.thumbs a:hover{color:#e0784b}
.thumbs .x{position:fixed;right:20px;top:14px}
@media(max-width:820px){.stage{--pw:min(92vw,calc((100vh - 170px)*.75));padding:14px 0}.book{width:var(--pw)!important}.book.s0,.book.se{transform:none!important}
.lf{left:0;width:100%;transform-origin:center;transform:none!important;transition:opacity .35s,transform .45s;opacity:0;pointer-events:none}.lf.cur{opacity:1;pointer-events:auto}.lf .bk{display:none}.lf .fc{backface-visibility:visible}
.mob .lf{display:none}.thumbs ol{columns:1}}
@media(max-width:820px){.mgb .t{display:none}}
@media print{.mgb,.ctl{display:none}}
'''

JS = r'''(function(){
var book=document.getElementById('book'),pages=[].slice.call(document.querySelectorAll('#src>.pg')),N=pages.length,mob=matchMedia('(max-width:820px)'),cur=0,lf=[],ctl={};
function mk(){book.innerHTML='';lf=[];
 if(mob.matches){pages.forEach(function(p,i){var l=document.createElement('div');l.className='lf';var f=document.createElement('div');f.className='fc';f.appendChild(p.cloneNode(true));l.appendChild(f);book.appendChild(l);lf.push(l)});return}
 for(var i=0;i<N;i+=2){var l=document.createElement('div');l.className='lf';var f=document.createElement('div'),b=document.createElement('div');f.className='fc';b.className='bk';
  f.appendChild(pages[i].cloneNode(true));if(pages[i+1])b.appendChild(pages[i+1].cloneNode(true));l.appendChild(f);l.appendChild(b);book.appendChild(l);lf.push(l)}}
function show(n,quiet){n=Math.max(0,Math.min(N-1,n));cur=n;
 if(mob.matches){lf.forEach(function(l,i){l.classList.toggle('cur',i==n)});book.className='book'}
 else{var k=Math.ceil(n/2);/* leaves flipped = those whose back page index < n */ lf.forEach(function(l,i){l.classList.toggle('fl',(2*i+1)<=n);l.style.zIndex=(2*i+1)<=n?i:(lf.length-i);if(quiet)l.style.transition='none'});
  book.className='book'+(n==0?' s0':(n>=N-1&&N%2==1?'':'' ));if(n==0)book.className='book s0';else if(n>=N-1&&N%2==0)book.className='book se';
  if(quiet)setTimeout(function(){lf.forEach(function(l){l.style.transition=''})},60)}
 ctl.cnt.textContent=(n+1)+' / '+N;ctl.rng.value=n;ctl.prev.disabled=n==0;ctl.next.disabled=n>=N-1;history.replaceState(null,'','#p'+(n+1))}
function step(d){show(mob.matches?cur+d:(d>0?(cur==0?1:cur+2):(cur<=1?0:cur-2)))}
ctl.prev=document.getElementById('prev');ctl.next=document.getElementById('next');ctl.rng=document.getElementById('rng');ctl.cnt=document.getElementById('cnt');
ctl.prev.onclick=function(){step(-1)};ctl.next.onclick=function(){step(1)};ctl.rng.max=N-1;ctl.rng.oninput=function(){show(+this.value)};
document.addEventListener('keydown',function(e){if(e.key=='ArrowRight'||e.key==' ')step(1);if(e.key=='ArrowLeft')step(-1);if(e.key=='Escape')document.getElementById('toc').classList.remove('on')});
book.addEventListener('click',function(e){if(e.target.closest('a'))return;var r=book.getBoundingClientRect();step((e.clientX-r.left)>r.width/2?1:-1)});
var sx=null;book.addEventListener('touchstart',function(e){sx=e.touches[0].clientX},{passive:true});book.addEventListener('touchend',function(e){if(sx==null)return;var d=e.changedTouches[0].clientX-sx;if(Math.abs(d)>40)step(d<0?1:-1);sx=null});
document.getElementById('tocb').onclick=function(){document.getElementById('toc').classList.add('on')};document.getElementById('tocx').onclick=function(){document.getElementById('toc').classList.remove('on')};
document.addEventListener('click',function(e){var a=e.target.closest('[data-go]');if(!a)return;e.preventDefault();show(+a.dataset.go-1);document.getElementById('toc').classList.remove('on')});
document.getElementById('fs').onclick=function(){var d=document.documentElement;document.fullscreenElement?document.exitFullscreen():d.requestFullscreen&&d.requestFullscreen()};
mob.addEventListener('change',function(){mk();show(cur,1)});
mk();var h=+(location.hash.replace('#p',''))||1;show(h-1,1);
})();'''


def page_html(CUR, P):
    toc = [(i + 1, t) for i, (k, h, t) in enumerate(P) if t]
    src = ''.join(h for k, h, t in P)
    url = f'{BASE}/magazine/{CUR["id"]}.html'
    return (f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
            f'<title>Forecut {CUR["month"]} | Monthly magazine</title><meta name="description" content="The Forecut monthly magazine, {CUR["month"]}: SS27 themes, colour, markets and the dates ahead. Read it like a book."><link rel="canonical" href="{url}">'
            '<meta name="theme-color" content="#141614"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="preload" href="/v2/archivo.woff2" as="font" type="font/woff2" crossorigin>'
            '<style>@font-face{font-family:"Archivo";src:url(/v2/archivo.woff2) format("woff2");font-weight:100 900;font-stretch:62% 125%;font-display:swap}</style><link rel="stylesheet" href="/magazine/magazine.css">'
            f'<script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments)}}gtag("js",new Date());gtag("config","{GA}");</script></head>'
            f'<body class="mg"><header class="mgb"><a href="/magazine/">&larr; All issues</a><span class="t">FORECUT · {E(CUR["month"].upper())}</span><span><button id="tocb" type="button">Contents</button> <button id="fs" type="button">Full screen</button></span></header>'
            '<main class="stage"><div class="book" id="book" aria-live="polite"></div></main>'
            '<div class="ctl"><button id="prev" type="button" aria-label="Previous page">&#8249;</button><input id="rng" type="range" min="0" value="0" aria-label="Page"><span id="cnt">1</span><button id="next" type="button" aria-label="Next page">&#8250;</button></div>'
            f'<div id="src" hidden>{src}</div><div class="thumbs" id="toc"><button class="x" id="tocx" type="button" aria-label="Close" style="all:unset;cursor:pointer;color:#fff;font-size:28px">&times;</button><ol>' +
            ''.join(f'<li><a href="#p{n}" data-go="{n}"><span>{E(t)}</span><span>{n}</span></a></li>' for n, t in toc) + '</ol></div>'
            '<script src="/magazine/magazine.js"></script></body></html>')


def index_html(done):
    cards = ''.join(f'<a class="ic" href="/magazine/{c["id"]}.html"><span class="ci">{im(c["_cov"], "", "")}</span><b>{E(c["month"])}</b><span>{E(c["cover_line"])} · {c["_n"]} pages</span><em>Read the issue</em></a>' for c in done)
    return (f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Monthly magazine | Forecut</title>'
            '<meta name="description" content="The Forecut monthly magazine: one issue a month, read like a book. SS27 themes, colour, markets and the dates ahead."><link rel="canonical" href="https://forecut.in/magazine/">'
            '<link rel="preload" href="/v2/archivo.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="/v2/forecut.css"><link rel="stylesheet" href="/biz.css"><link rel="stylesheet" href="/magazine/magazine.css">'
            "<script>try{if(localStorage.getItem('fc-in')==='1')document.documentElement.classList.add('fc-in')}catch(e){}</script><script type=\"module\" src=\"/auth.js\"></script></head>"
            '<body class="bz"><!--fch--><!--/fch--><main id="main"><section class="bzh"><div class="w"><div><p class="ey">Monthly magazine</p><h1>One issue a month, read like a book</h1>'
            '<p class="lead">Seasonal highlights, markets, colour and the dates ahead in a single issue. A new one is ready on the 30th and reaches subscribers on the 1st.</p>'
            '<div class="ct"><a class="btn" href="/magazine/' + done[0]['id'] + '.html">Read ' + E(done[0]['month']) + '</a></div></div><div class="ph" style="aspect-ratio:3/4;max-width:420px">' + im(done[0]['_cov']) + '</div></div></section>'
            '<section class="bzs"><div class="w"><div class="hd2"><h2>All issues</h2><p>Open any issue and turn the pages with the arrows, the keyboard or a swipe.</p></div><div class="mgi">' + cards + '</div></div></section></main><!--fcf--><!--/fcf--></body></html>')


EXTRA_CSS = '''
.mgi{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:28px}.ic{display:block}.ic .ci{display:block;aspect-ratio:3/4;overflow:hidden;background:linear-gradient(160deg,#2f5fc0,#1f3d33);margin-bottom:12px}.ic .ci img{width:100%;height:100%;object-fit:cover;transition:transform .6s}.ic:hover .ci img{transform:scale(1.04)}
.ic b{display:block;font:300 22px "Archivo";font-stretch:120%}.ic span{color:#5f5650;font-size:14px}.ic em{display:block;font-style:normal;font-weight:600;color:#a9481f;margin-top:6px;font-size:14px}
'''


def main():
    os.makedirs(OUT, exist_ok=True)
    open(os.path.join(OUT, 'magazine.css'), 'w').write(CSS + EXTRA_CSS)
    open(os.path.join(OUT, 'magazine.js'), 'w').write(JS)
    done = []
    allslots = []
    for CUR_ in ISSUES:
        P = build_issue(CUR_)
        if len(P) % 2: P.insert(len(P) - 1, ('ad', '<section class="pg quote" style="background:#1f3d33;color:#fff"><div class="dv" style="padding:8cqw"><p class="big" style="color:#fff;font-size:6cqw">Forecasts are a point of view that gets checked. We update every page after the fairs.</p></div></section>', None))
        open(os.path.join(OUT, f'{CUR_["id"]}.html'), 'w', encoding='utf-8').write(page_html(CUR_, P))
        c = dict(CUR_); c['_n'] = len(P); c['_cov'] = f'mag-{CUR_["id"]}-cover' if has(f'mag-{CUR_["id"]}-cover') else 'theme-ss27-the-waist-returns'
        done.append(c); allslots += SLOTS
        print(CUR_['id'], 'pages:', len(P), 'image slots:', len(SLOTS), 'filled:', sum(has(s[0]) for s in SLOTS))
    done.sort(key=lambda c: c['id'], reverse=True)
    open(os.path.join(OUT, 'index.html'), 'w', encoding='utf-8').write(index_html(done))
    seen = set(); rows = []
    for f, use, pr, asp in allslots:
        if f in seen: continue
        seen.add(f); rows.append((f + '.webp', use, asp, '2250x3000' if asp == '3:4' else ('1800x1125' if asp == '16:10' else '2000x1500'), pr))
    with open('/home/claude/work/Forecut-magazine-2026-12-image-prompts.csv', 'w', newline='', encoding='utf-8') as fh:
        w = csv.writer(fh); w.writerow(['file_name (save into /img/)', 'used_on', 'aspect', 'size', 'prompt']); w.writerows(rows)
    print('prompts csv rows:', len(rows))
    return allslots


if __name__ == '__main__':
    main()
