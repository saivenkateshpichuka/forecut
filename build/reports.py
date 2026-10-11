"""Write Forecut report pages: reports.html, core-item-*.html, capsule-*.html, india-colour-forecast.html, india-textile-craft-guide.html.
Uses india_data.py (statuses, themes) + reports_data.py (editorial text). Flat sketches are pre-rendered with node + flats.js."""
import html, json, math, subprocess, tempfile, os
import india_data as I
import pantone as PT
import reports_data as R
E = html.escape
src = open('legal.py').read(); ns = {}; exec(src.split('\nP = ')[0], ns)
HEAD, FOOT = ns['HEAD'], ns['FOOT']
IMGS = set(json.load(open('images.json')))
def islug(s): return ''.join(ch.lower() if ch.isalnum() else '-' for ch in s).strip('-').replace('--', '-').replace('--', '-')
D = {x[2]: x for x in I.D}
CODES = I.CODES
NM = {'e': 'Emerging', 'r': 'Rising', 'p': 'Peaking', 'f': 'Fading'}
COL = {'e': '#ff5a1f', 'r': '#00a85a', 'p': '#e09a00', 'f': '#8b5cf6'}
PILL = {'e': 'linear-gradient(135deg,#ff4d1a,#ff8a3d)', 'r': 'linear-gradient(135deg,#00a85a,#1fd17f)', 'p': 'linear-gradient(135deg,#ffb000,#ffd34d)', 'f': 'linear-gradient(135deg,#8b5cf6,#b69cff)'}

# ---------- flats via node ----------
extra = {}
for (cat, sub, name, area, note, life, sk) in I.D:
    if isinstance(sk, dict): extra[name] = sk
    elif isinstance(sk, str): extra[name] = '@' + sk
def render_flats(names):
    eng = open('flats.js').read().replace("if (typeof module !== 'undefined') module.exports = Flats;\n", '')
    js = eng + '\nvar XS = ' + json.dumps(extra) + ';\nObject.keys(XS).forEach(function(k){ var v = XS[k]; Flats.SPEC[k] = typeof v === "string" ? Flats.SPEC[v.slice(1)] : v; });\n' \
        + 'var C={ink:"#13241d",fill:"#ffffff",tint:"#dbe3de",accent:"#b4532a",accent2:"#b4532a",muted:"#53655d"}; var out={};' \
        + 'JSON.parse(process.argv[2]).forEach(function(n){ var r=null; try{ r=Flats.render(n,C,{clean:true}); }catch(e){} out[n]= r ? r.svg : ""; }); process.stdout.write(JSON.stringify(out));'
    with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False) as f: f.write(js); p = f.name
    try: return json.loads(subprocess.run(['node', p, json.dumps(names)], capture_output=True, text=True, check=True).stdout)
    finally: os.unlink(p)

# ---------- shared bits ----------
def curve(life, w=300):
    X = {'e': 46, 'r': 98, 'p': 160, 'f': 236}
    y = lambda x: 92 - 74 * math.exp(-((x - 160) / 62) ** 2)
    ci = next((i for i, c in enumerate(life) if c != '-'), 0); ch = life[ci]; cx = X[ch]
    pts = ' '.join(f'{x},{y(x):.1f}' for x in range(8, 313, 4)); done = ' '.join(f'{x},{y(x):.1f}' for x in range(8, cx + 1, 4))
    s = f'<svg class="curve" viewBox="0 -16 320 144" role="img" aria-label="Trend curve: {NM[ch]} in {CODES[ci]}"><polyline points="{pts}" fill="none" stroke="#e3d9cc" stroke-width="5" stroke-linecap="round"/>'
    if done.count(',') > 1: s += f'<polyline points="{done}" fill="none" stroke="{COL[ch]}" stroke-width="5" stroke-linecap="round"/>'
    for k in 'erpf':
        on = k == ch
        s += f'<circle cx="{X[k]}" cy="{y(X[k]):.1f}" r="{8 if on else 4.5}" fill="{COL[k] if on else "#fffcf7"}" stroke="{COL[k]}" stroke-width="2.5"/><text x="{X[k]}" y="118" text-anchor="middle" font-size="11.5" font-weight="{700 if on else 500}" fill="{COL[k] if on else "#6e6259"}" font-family="DM Sans,sans-serif">{NM[k]}</text>'
    s += f'<text x="{cx}" y="{y(cx) - 15:.1f}" text-anchor="middle" font-size="12" font-weight="700" fill="#1c1714" font-family="DM Sans,sans-serif">{E(CODES[ci])}</text></svg>'
    return s
def pill(c): return f'<span class="pl" style="background:{PILL[c]};color:{"#3d2600" if c == "p" else "#fff"}">{NM[c]}</span>'
def timeline(life):
    return '<span class="tl">' + ''.join(f'<span class="tlc{" " + c if c != "-" else " no"}"><b>{E(CODES[i])}</b>{NM.get(c, "–")}</span>' for i, c in enumerate(life)) + '</span>'
def verdict(life):
    a, b = life[0], (life[1] if len(life) > 1 else '-')
    if a == 'e': return ('Test', 'Early signal. Trial in small drops and premium lines.')
    if a == 'r': return ('Invest', 'Growth is building. Commit to it in your next range.')
    if a == 'p' and b == 'f': return ('Maintain, plan exit', 'At its height now; fading next. Avoid deep buys.')
    if a == 'p': return ('Maintain', 'At its height. Keep in core ranges without over-buying.')
    return ('Reduce', 'Demand is slowing. Clear stock and move on.')
def photo(name, cls='ph'):
    sl = islug(name)
    return f'<div class="{cls}"><img src="img/{sl}.webp" alt="{E(name)}" loading="lazy" width="800" height="800"></div>' if sl in IMGS else f'<div class="{cls} none"></div>'
CSS = '''<style>
.wrap.r{max-width:1120px}
.cover{display:grid;grid-template-columns:1.05fr 1fr;gap:34px;align-items:stretch;margin:18px 0 34px}
.cover .ct{align-self:center}
.cover h1{font-size:clamp(34px,4.6vw,54px)!important}
.cover .lead{font-family:"Source Serif 4",Georgia,serif}
.cover .ci{border-radius:10px;overflow:hidden;background:var(--grid);aspect-ratio:4/5;position:relative}
.cover .ci img{width:100%;height:100%;object-fit:cover;display:block}
.cover .ci::before{content:"";position:absolute;left:-40px;top:24px;bottom:24px;width:40px;background:var(--grid);z-index:-1}
.kicker{font:700 12px "DM Sans",sans-serif;letter-spacing:.1em;text-transform:uppercase;color:var(--chalk)}
.by{font-size:14px;color:var(--muted)}
.sec{margin:46px 0}
.sec>h2{font:700 30px/1.15 "DM Sans",sans-serif!important;letter-spacing:-.025em;margin:0 0 6px}
.sec>p.sub{color:var(--muted);margin:0 0 18px;max-width:70ch}
.pl{display:inline-block;font:700 11px "DM Sans",sans-serif;letter-spacing:.06em;text-transform:uppercase;padding:4px 9px;border-radius:99px}
.tl{display:flex;gap:6px;flex-wrap:wrap}.tlc{font:500 11.5px "DM Sans",sans-serif;border:1px solid var(--grid);border-radius:7px;padding:4px 8px;display:grid;line-height:1.3;background:var(--paper-2)}
.tlc b{font-weight:700;font-size:11px;color:var(--muted)}.tlc.e{color:#d9480f}.tlc.r{color:#00894a}.tlc.p{color:#a87300}.tlc.f{color:#7c4dff}.tlc.no{color:var(--muted)}
.dgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:26px 20px}
.dt{display:grid;gap:9px;align-content:start}
.dt .ph,.cad .ph{aspect-ratio:4/5;border-radius:6px;overflow:hidden;background:var(--grid)}
.dt .ph img,.cad .ph img{width:100%;height:100%;object-fit:cover;display:block}
.dt .hd{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap}
.dt h3{font:700 18px/1.25 "DM Sans",sans-serif!important;margin:0;letter-spacing:-.01em}
.dt p{margin:0;font-size:15.5px!important;line-height:1.55}
.vd{font:700 12px "DM Sans",sans-serif;letter-spacing:.06em;text-transform:uppercase}
.vd.Test{color:#d9480f}.vd.Invest{color:#00894a}.vd.Maintain,.vd.Maintain\\,{color:#a87300}.vd.Reduce{color:#7c4dff}
.curve{width:100%;max-width:300px;height:auto;display:block}
.summary{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:8px 0 6px}
.summary div{background:var(--paper-2);border:1px solid var(--grid);border-radius:10px;padding:14px}
.summary b{display:block;font:700 30px "DM Sans",sans-serif}.summary span{font:600 12px "DM Sans",sans-serif;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.howto{background:var(--mat);color:var(--mat-ink);border-radius:12px;padding:22px 26px}
.howto h2{color:var(--mat-ink)!important;font:700 22px "DM Sans",sans-serif!important;margin:0 0 8px}
.howto li,.howto p{color:var(--mat-ink)!important}
.mood{display:grid;grid-template-columns:320px 1fr;gap:28px}
.sw{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.sw div{border-radius:6px;min-height:96px;padding:10px;display:flex;align-items:flex-end;font:600 13px "DM Sans",sans-serif}
.wh p{margin:0 0 12px}.wh b{font-family:"DM Sans",sans-serif}
.cads{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:26px 22px}
.cad{display:grid;gap:10px;align-content:start}
.cad .pair{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.cad .pair.one{grid-template-columns:1fr}.cad .pair.one .ph{aspect-ratio:8/5}
.cad .flat{aspect-ratio:4/5;border-radius:6px;background:#fff;border:1px solid var(--grid);display:grid;place-items:center;position:relative}
.cad .flat svg{width:86%;height:86%}
.cad .flat small{position:absolute;right:6px;bottom:6px;font:600 10px "DM Sans",sans-serif;background:#53655d;color:#fff;padding:2px 6px;border-radius:3px}
.ptab{width:100%;border-collapse:collapse;font-size:15px;background:var(--paper-2);border:1px solid var(--grid);border-radius:10px;overflow:hidden}
.ptab th,.ptab td{padding:10px 12px;text-align:left;border-bottom:1px solid var(--grid);font-family:"DM Sans",sans-serif}
.ptab th{font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.ptab tr:last-child td{border-bottom:0}.tw{overflow-x:auto}
.cgrp{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:18px}
.cc{border:1px solid var(--grid);border-radius:12px;overflow:hidden;background:var(--paper-2)}
.cc .chip{height:170px;padding:14px;display:flex;flex-direction:column;justify-content:flex-end;font-family:"DM Sans",sans-serif}
.cc .chip b{font-size:22px}.cc .chip span{font-size:12.5px;opacity:.85}
.cc .cb{padding:14px 16px;display:grid;gap:6px}
.cc .cb p{margin:0;font-size:15px!important;line-height:1.5}
.cc .cb dl{margin:0;display:grid;grid-template-columns:auto 1fr;gap:4px 10px;font:14px "DM Sans",sans-serif}
.cc .cb dt{color:var(--muted);font-weight:600}.cc .cb dd{margin:0}
.thumbs{display:flex;gap:6px;margin-top:4px}.thumbs .ph{width:56px;height:70px;border-radius:5px;overflow:hidden;background:var(--grid)}.thumbs img{width:100%;height:100%;object-fit:cover}
.gtab td:first-child{font-weight:700}
.rgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:22px 18px}
.rc{text-decoration:none;color:inherit;display:grid;gap:8px;align-content:start}
.rc .ph{aspect-ratio:4/3;border-radius:8px;overflow:hidden;background:var(--grid)}
.rc img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s ease}.rc:hover img{transform:scale(1.04)}
.rc b{font:700 19px/1.25 "DM Sans",sans-serif;letter-spacing:-.01em}.rc small{font:700 11.5px "DM Sans",sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--chalk)}
.rc span{font-family:"Source Serif 4",Georgia,serif;font-size:15px;color:var(--muted);line-height:1.5}
.note{font-size:14px!important;color:var(--muted)!important}
.bws{display:grid;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));gap:18px}
.bw{background:var(--paper-2);border:1px solid var(--grid);border-radius:12px;padding:18px 20px;display:grid;gap:8px;align-content:start}
.bw h3{font:700 21px "DM Sans",sans-serif!important;margin:0;letter-spacing:-.01em}.bw .bt{margin:2px 0 0;font:600 12px "DM Sans",sans-serif;letter-spacing:.06em;text-transform:uppercase;color:var(--chalk)}
.bw p{margin:0;font-size:15.5px!important;line-height:1.55}
.bchips{display:grid;gap:8px;margin:4px 0}.bchip{display:flex;align-items:center;gap:10px}.bchip .bph{width:46px;height:56px;border-radius:5px;overflow:hidden;background:var(--grid);flex:none}.bchip img{width:100%;height:100%;object-fit:cover}
.bchip>span{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font:600 14px "DM Sans",sans-serif}
@media print{.bws{grid-template-columns:repeat(3,1fr)!important}.bw{break-inside:avoid}}
.dlpdf{display:inline-flex;align-items:center;gap:8px;margin-top:6px;font:700 14px "DM Sans",sans-serif;background:#b4532a;color:#fff!important;text-decoration:none;padding:11px 18px;border-radius:2px}
.dlpdf:hover{background:#9a4522}
@page{size:A4 landscape;margin:12mm 12mm 16mm}
@media print{body{padding:0!important;background:#fff!important;font-size:14px}nav,footer,.dlpdf,.more{display:none!important}.wrap.r{max-width:none}
.sec,.dt,.cad,.cc,tr,.howto,.summary{break-inside:avoid}.sec>h2{break-after:avoid}.cover{margin-top:0;min-height:170mm;break-after:page}.cover .ci{aspect-ratio:auto;height:170mm}.cover .ci::before{display:none}
.dgrid{grid-template-columns:repeat(4,1fr)!important}.cads{grid-template-columns:repeat(3,1fr)!important}.cgrp{grid-template-columns:repeat(4,1fr)!important}.mood{grid-template-columns:300px 1fr!important}
a{text-decoration:none}}
@media (max-width:820px){.cover{grid-template-columns:1fr}.cover .ci{aspect-ratio:4/3}.cover .ci::before{display:none}.mood{grid-template-columns:1fr}.summary{grid-template-columns:repeat(2,1fr)}}
</style>'''
DATE_TXT = '11 October 2026'
def page(fn, title, body):
    pdf = fn.replace('.html', '.pdf')
    body = body.replace('{PDFBTN}', f'<a class="dlpdf" href="{pdf}" download>Download PDF ↓</a>') if fn != 'reports.html' else body
    h = HEAD.format(title=E(title)).replace('</style></head>', '</style>' + CSS + '</head>', 1).replace('<div class="wrap">', '<div class="wrap r">', 1)
    open('../' + fn, 'w').write(h + body + FOOT)
def cover(kicker, title, lead, img, extra=''):
    return (f'<header class="cover"><div class="ct"><p class="kicker">{E(kicker)}</p><h1>{E(title)}</h1><p class="lead">{E(lead)}</p>'
            f'<p class="by">Forecut Editorial · {DATE_TXT}{extra}</p>{{PDFBTN}}</div><div class="ci"><img src="img/{img}.webp" alt="{E(title)}" width="800" height="800"></div></header>')
SRC = '<p class="note">Statuses are Forecut\'s forecast for India: Festive 26 (Oct 2026 – Feb 2027), Summer 27 (Mar – Jul 2027), Festive 27 (Aug – Dec 2027), and long-range outlooks for Summer 28 (Mar – Jul 2028) and Festive 28 (Aug – Dec 2028). Sources: ' + E(I.META['sources']) + '</p>'
PAGES = []  # (fn, title, desc, kind, img)

# ---------- Core Item Updates ----------
for slug, title, keys, intro, how, hero in R.ITEMS:
    ds = [x for x in I.D if (x[0], x[1]) in keys]
    cnt = {}
    for x in ds: v = verdict(x[5])[0].split(',')[0]; cnt[v] = cnt.get(v, 0) + 1
    summ = ''.join(f'<div><b>{cnt.get(k, 0)}</b><span>{k}</span></div>' for k in ['Invest', 'Test', 'Maintain', 'Reduce'])
    tiles = ''
    for x in sorted(ds, key=lambda x: 'rep f'.index(x[5][0]) if x[5][0] in 'repf' else 9):
        v, vt = verdict(x[5])
        tiles += (f'<article class="dt">{photo(x[2])}<div class="hd"><span class="vd {v.split(",")[0]}">{E(v)}</span>{pill(x[5][0])}</div><h3>{E(x[2])}</h3><p>{E(x[4])} {E(vt)}</p>'
                  f'{curve(x[5])}{timeline(x[5])}</article>')
    fn = f'core-item-{slug}.html'; t = f'Core Item Update: {title} 2026–28'
    lead = intro.split('. ')[0] + '.'
    body = (cover('Core Item Update · India', t, lead, hero) +
            f'<section class="sec"><h2>Overview</h2><p>{E(intro)}</p><div class="summary">{summ}</div><p class="note">Invest: rising now. Test: emerging. Maintain: at its peak. Reduce: fading.</p></section>'
            f'<section class="sec"><h2>The details</h2><p class="sub">Each detail with its status for Festive 26, its trend curve and what it does next.</p><div class="dgrid">{tiles}</div></section>'
            f'<section class="sec howto"><h2>How to update your {E(title.lower())} range</h2><ul>' + ''.join(f'<li>{E(h)}</li>' for h in how) + '</ul></section>'
            f'<p>See every {E(title.lower())} detail with design notes and downloadable cards in the <a href="india.html">India Forecast 2026–28</a>.</p>' + SRC)
    page(fn, t + ' · Forecut', body); PAGES.append((fn, t, intro[:155], 'Core Item Update', hero))

# ---------- Design Capsules ----------
cap_names = [n for t in I.THEMES for n in R.CAPSULES[t['t']][2]]
FL = render_flats(sorted(set(cap_names)))
for t in I.THEMES:
    slug, pal, pieces, hero = R.CAPSULES[t['t']]
    sw = ''.join(f'<div style="background:{h};color:{"#1c1714" if h in ("#f3ecdc", "#d8c08a", "#9fae8f", "#d9a3a6") else "#fff"}">{E(n)}<br>{PT.nearest(h)[0]}<br>{h.upper()}</div>' for h, n in pal)
    cads = ''
    for n in pieces:
        x = D[n]; svg = FL.get(n, '')
        pair = f'<div class="pair"><div class="flat">{svg}<small>Forecut flat</small></div>{photo(n)}</div>' if svg else f'<div class="pair one">{photo(n)}</div>'
        cads += (f'<article class="cad">{pair}'
                 f'<div class="dt"><div class="hd"><h3>{E(n)}</h3>{pill(x[5][0])}</div><p>{E(x[4])}</p>{timeline(x[5])}</div></article>')
    prices = ''.join(f'<tr><td>{E(a)}</td><td>₹{E(b)}</td><td>₹{E(c)}</td><td>₹{E(d)}</td></tr>' for a, b, c, d in t['prices'])
    brands = ''.join(f'<li><b>{E(b)}</b>: {E(w)}</li>' for b, w in t['brands'])
    fn = f'capsule-{slug}.html'; ti = f'Design Capsule: {t["t"]}'
    body = (cover('Design Capsule · India 2026–28', ti, t['d'] if 'd' in t else t['story'], hero) +
            f'<section class="sec"><h2>Mood and colour</h2><div class="mood"><div><div class="sw">{sw}</div><p class="note">Pantone TCX (cotton) codes are the nearest match to the screen colour; confirm against a physical Pantone book and lab dips before production.</p></div>'
            f'<div class="wh"><p><b>Why?</b> {E(t["why"])}</p><p><b>What?</b> {E(t["story"])}</p><p><b>Who\'s showing it?</b></p><ul>{brands}</ul></div></div></section>'
            f'<section class="sec"><h2>Key pieces</h2><p class="sub">Forecut flat sketches with reference photos, ready to brief into design.</p><div class="cads">{cads}</div></section>'
            f'<section class="sec"><h2>Price guide (India)</h2><div class="tw"><table class="ptab"><thead><tr><th>Key garment</th><th>Value</th><th>Mid</th><th>Premium</th></tr></thead><tbody>{prices}</tbody></table></div>'
            f'<p class="note">Cost to make: {E(t["cost"][0])}. {E(t["cost"][1])}</p></section>'
            f'<section class="sec howto"><h2>How to build the capsule</h2><ul>' + ''.join(f'<li>{E(a)}</li>' for a in t['actions']) + '</ul></section>'
            f'<p class="note">Sources: {E(t["src"])}.</p>')
    page(fn, ti + ' · Forecut', body); PAGES.append((fn, ti, t['story'][:155], 'Design Capsule', hero))

# ---------- Colour Forecast ----------
grp = ''
for g, gd in R.COLOUR_GROUPS:
    cards = ''
    for h, n, gg, mood, best, pairs, rel in R.COLOURS:
        if gg != g: continue
        r_, g_, b_ = int(h[1:3], 16), int(h[3:5], 16), int(h[5:7], 16)
        ink = '#1c1714' if (r_ * 299 + g_ * 587 + b_ * 114) / 1000 > 150 else '#fff'
        th = ''.join(photo(x) for x in rel)
        cards += (f'<article class="cc"><div class="chip" style="background:{h};color:{ink}"><b>{E(n)}</b><span>Pantone {PT.nearest(h)[0]}<br>{h.upper()} · RGB {r_}, {g_}, {b_}</span></div>'
                  f'<div class="cb"><p>{E(mood)}</p><dl><dt>Best for</dt><dd>{E(best)}</dd><dt>Pair with</dt><dd>{E(", ".join(pairs))}</dd></dl><div class="thumbs">{th}</div></div></article>')
    grp += f'<section class="sec"><h2>{E(g)}</h2><p class="sub">{E(gd)}</p><div class="cgrp">{cards}</div></section>'
kc = ''.join(f'<li><b>{E(c["name"])}</b> (Pantone {PT.nearest(c["hex"])[0]} · {c["hex"]}): {E(c["text"])}</li>' for c in I.META['keycolours'])
body = (cover('Colour Forecast · India 2026–28', 'India Colour Forecast 2026–28', 'Nine colours for Indian fashion from Festive 26 to Festive 28, in three families: festive jewels, calm handloom, and earth and indigo.', 'fit-and-flare-anarkalis') +
        f'<section class="sec"><h2>Key colours</h2><ul>{kc}</ul></section>' + grp +
        '<section class="sec howto"><h2>How to use the palette</h2><ul><li>Build festive capsules from one jewel tone plus champagne gold and ivory.</li><li>Use sage, ivory and dusty rose for handloom and day-function ranges.</li><li>Run indigo across every category, from denim to sarees and footwear, and warm it with rust.</li><li>Pantone TCX (cotton) codes are the nearest match to each screen colour. Confirm with a physical Pantone book and lab dips before bulk dyeing.</li></ul></section>' + SRC)
page('india-colour-forecast.html', 'India Colour Forecast 2026–28 · Forecut', body)
PAGES.append(('india-colour-forecast.html', 'India Colour Forecast 2026–28', 'Nine colours for Indian fashion in 2026–28: emerald, sapphire, deep wine, champagne gold, sage, ivory, dusty rose, indigo and rust.', 'Colour Forecast', 'fit-and-flare-anarkalis'))

# ---------- Textile & Craft Guide ----------
def gtable(dd):
    rows = ''
    for n, (orig, char, best, srcn) in dd.items():
        x = D.get(n); st = pill(x[5][0]) if x else ''
        rows += f'<tr><td>{E(n)}</td><td>{E(orig)}</td><td>{E(char)}</td><td>{E(best)}</td><td>{st}</td><td>{E(srcn)}</td></tr>'
    return f'<div class="tw"><table class="ptab gtab"><thead><tr><th>Name</th><th>Origin / cluster</th><th>Character</th><th>Best for</th><th>Festive 26</th><th>Sourcing note</th></tr></thead><tbody>{rows}</tbody></table></div>'
def gcards(dd):
    return '<div class="dgrid">' + ''.join(f'<article class="dt">{photo(n)}<div class="hd"><h3>{E(n)}</h3>{pill(D[n][5][0]) if n in D else ""}</div><p><b>{E(o)}</b>. {E(c)}</p>{timeline(D[n][5]) if n in D else ""}</article>' for n, (o, c, b, s) in dd.items() if islug(n) in IMGS) + '</div>'
body = (cover('Sourcing Guide · India 2026–28', 'India Textile and Craft Sourcing Guide', 'Where India\'s key weaves and hand-crafts come from, what they are like, what they suit, and where each one sits in the trend cycle.', 'chanderi') +
        f'<section class="sec"><h2>Fabrics and weaves</h2><p class="sub">Handloom and silk lead the quiet-luxury direction. True handloom has longer lead times and minimums: use it for hero pieces.</p>{gtable(R.FABRICS)}</section>'
        f'<section class="sec"><h2>Hand-crafts and surface</h2><p class="sub">Placement work at necklines, cuffs and borders keeps cost and weight under control.</p>{gtable(R.CRAFTS)}</section>'
        f'<section class="sec"><h2>At a glance</h2>{gcards({**R.FABRICS, **R.CRAFTS})}</section>'
        '<section class="sec howto"><h2>Sourcing checklist</h2><ul><li>Order handloom early and confirm minimums with the cluster.</li><li>Ask for GI certification where it applies, such as Chanderi, Banarasi, Kanjeevaram and Kolhapuri.</li><li>Approve strike-offs and lab dips before bulk.</li><li>Credit the craft cluster or artisan group on labels and product pages.</li></ul></section>' + SRC)
page('india-textile-craft-guide.html', 'India Textile and Craft Sourcing Guide 2026–28 · Forecut', body)
PAGES.append(('india-textile-craft-guide.html', 'India Textile and Craft Sourcing Guide', 'Origins, character, best uses and trend status for India\'s key weaves and hand-crafts: Chanderi, Banarasi, Kanjeevaram, chikankari, mirror work and more.', 'Sourcing Guide', 'chanderi'))

# ---------- Brand Watch ----------
bcards = ''
for name, typ, coll, what, dets, stitle, surl, sdate in R.BRANDS:
    chips = ''.join(f'<span class="bchip">{photo(n, "bph")}<span><b>{E(n)}</b>{pill(D[n][5][0])}</span></span>' for n in dets)
    bcards += (f'<article class="bw"><div class="bwh"><div><h3>{E(name)}</h3><p class="bt">{E(typ)} · {E(coll)}</p></div></div><p>{E(what)}</p>'
               f'<div class="bchips">{chips}</div><p class="note">Source: <a href="{E(surl)}" rel="noopener">{E(stitle)}</a>, {E(sdate)}</p></article>')
inv = {}
for b in R.BRANDS:
    for n in b[4]: inv.setdefault(n, []).append(b[0])
rows = ''.join(f'<tr><td>{E(n)}</td><td>{pill(D[n][5][0])}</td><td>{E(", ".join(v))}</td></tr>' for n, v in sorted(inv.items(), key=lambda kv: -len(kv[1])))
body = (cover('Brand Watch · India Festive 2026', 'Brand Watch: what Indian labels are launching', 'How India\'s startups, D2C labels, designers and retailers are bringing Forecut\'s tracked details to market this festive season.', 'tissue-sarees-in-champagne-gold') +
        f'<section class="sec"><h2>Signals at a glance</h2><p class="sub">Forecut details, their Festive 26 status, and the Indian labels showing them.</p><div class="tw"><table class="ptab"><thead><tr><th>Forecut detail</th><th>Festive 26</th><th>Seen at</th></tr></thead><tbody>{rows}</tbody></table></div></section>'
        f'<section class="sec"><h2>The labels</h2><p class="sub">Summaries of published collection coverage and brand pages. Product photos are Forecut references, not the brands\' own products.</p><div class="bws">{bcards}</div></section>'
        '<section class="sec howto"><h2>What this tells you</h2><ul><li>Craft-led festive is mainstream: tissue, gota, bandhani and block print run from value retailers to designer labels.</li><li>Corsets and ready-to-wear drapes are moving from designer capsules into D2C labels.</li><li>Pastels with sage and ivory lead day festive; jewel tones lead evening.</li><li>Indian footwear startups are building on juttis, Kolhapuri shapes and hand-lasted sneakers.</li></ul></section>'
        '<p class="note">Brand Watch summarises public coverage and brand websites as of October 2026. Mentions are for trend analysis only and do not imply endorsement or partnership.</p>')
page('india-brand-watch.html', 'Brand Watch: Indian labels Festive 2026 · Forecut', body)
PAGES.append(('india-brand-watch.html', 'Brand Watch: what Indian labels are launching', 'Soch, Max Fashion, POMCHA, Manyavar, Fizzy Goblet, Gully Labs and more: how Indian brands are bringing festive 2026 trends to market.', 'Brand Watch', 'tissue-sarees-in-champagne-gold'))

# ---------- Hub ----------
def rcard(p): return f'<a class="rc" href="{p[0]}"><div class="ph"><img src="img/{p[4]}.webp" alt="" loading="lazy" width="800" height="800"></div><small>{E(p[3])}</small><b>{E(p[1])}</b><span>{E(p[2])}</span></a>'
hub = '<p class="kicker" style="margin-top:40px">Reports</p><h1>Forecut Reports</h1><p class="lead">Ready-to-use trend reports for Indian fashion: item-by-item updates, design capsules, colour and sourcing guides. Built from Forecut\'s own research.</p>'
for kind, d in [('Brand Watch', 'What India\'s startups, D2C labels and retailers are launching, mapped to Forecut details.'), ('Core Item Update', 'What to invest in, test, maintain and reduce, item by item.'), ('Design Capsule', 'Mood, colour, key pieces with flat sketches, and prices for each theme.'), ('Colour Forecast', ''), ('Sourcing Guide', '')]:
    ps = [p for p in PAGES if p[3] == kind]
    hub += f'<section class="sec"><h2>{E(kind)}{"s" if len(ps) > 1 else ""}</h2>' + (f'<p class="sub">{E(d)}</p>' if d else '') + f'<div class="rgrid">{"".join(rcard(p) for p in ps)}</div></section>'
page('reports.html', 'Forecut Reports · Indian fashion trend reports', hub)
PAGES.insert(0, ('reports.html', 'Forecut Reports', 'Indian fashion trend reports: core item updates, design capsules, colour forecast and textile and craft sourcing guide.', 'Hub', 'pre-draped-saree-gowns'))
json.dump([[p[0], p[1], p[2]] for p in PAGES], open('reports_index.json', 'w'), ensure_ascii=False, indent=0)
print('reports ok', len(PAGES))

# ---------- PDFs (A4 landscape) via headless Chromium ----------
import threading, http.server, socketserver, functools, sys
if '--no-pdf' not in sys.argv:
    from playwright.sync_api import sync_playwright
    root = os.path.abspath('..')
    class _Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    H = functools.partial(_Q, directory=root)
    from PIL import Image as _Im
    import io as _io
    _jc = {}
    def _small(route):
        u = route.request.url
        if '/img/' in u and u.endswith('.webp'):
            from urllib.parse import unquote
            fp = os.path.join(root, unquote(u.split(f':{port}/', 1)[1]))
            if fp not in _jc:
                im = _Im.open(fp).convert('RGB'); im.thumbnail((560, 560)); bio = _io.BytesIO(); im.save(bio, 'JPEG', quality=72, optimize=True); _jc[fp] = bio.getvalue()
            return route.fulfill(status=200, body=_jc[fp], headers={'Content-Type': 'image/jpeg'})
        return route.continue_() if u.startswith(f'http://127.0.0.1:{port}') else route.abort()
    srv = socketserver.TCPServer(('127.0.0.1', 0), H); port = srv.server_address[1]
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    foot = ('<div style="font:9px DM Sans,Arial,sans-serif;color:#6e6259;width:100%;padding:0 12mm;display:flex;justify-content:space-between">'
            '<span><b style="color:#1f3d33">Forecut</b> · forecut.in · hello@forecut.in</span><span class="pageNumber"></span></div>')
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1200, 'height': 900})
        pg.route('**/*', _small)
        n = 0
        for fn, *_ in PAGES:
            if fn == 'reports.html': continue
            pg.goto(f'http://127.0.0.1:{port}/{fn}', wait_until='load')
            pg.evaluate('''() => Promise.all([...document.images].map(i => { i.loading = 'eager'; return i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }); }))''')
            pg.evaluate('document.fonts.ready'); pg.emulate_media(media='print')
            pg.pdf(path=os.path.join(root, fn.replace('.html', '.pdf')), format='A4', landscape=True, print_background=True, display_header_footer=True,
                   header_template='<span></span>', footer_template=foot, margin={'top': '12mm', 'bottom': '16mm', 'left': '12mm', 'right': '12mm'})
            n += 1
        b.close()
    srv.shutdown(); print('pdfs ok', n)
