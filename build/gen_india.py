"""Build the India forecast page (../india.html when STATIC is set, else forecut-india.html) from india_data.py,
reusing season_tpl.txt so it shares the viewer, descriptions, download cards and photo support."""
import pantone as PT
import json, html, os, re
import india_data as I
import desc as DESCMOD
from seasons_data import SEASONS, META as SMETA
E = html.escape
STATIC = os.environ.get('STATIC')
SITE = json.load(open('site.json'))
if STATIC and SITE.get('static_url'): SITE = dict(SITE, url=SITE['static_url'])
IMGS = set(json.load(open('images.json'))) if os.path.exists('images.json') else set()
URLS = json.load(open('urls.json'))
def slug(s): return ''.join(ch.lower() if ch.isalnum() else '-' for ch in s).strip('-').replace('--', '-')
def islug(s): return ''.join(ch.lower() if ch.isalnum() else '-' for ch in s).strip('-').replace('--', '-').replace('--', '-')
SL = {'e': ('emerge', 'Emerging'), 'r': ('rise', 'Rising'), 'p': ('peak', 'Peaking'), 'f': ('fade', 'Fading')}

INDIA_RULES = [
    (r'saree|sari', 'Offer pre-stitched pleats or a pre-draped version alongside the classic drape.', None),
    (r'lehenga', 'Keep the can-can light and add a side zip and adjustable drawstring for fit.', None),
    (r'anarkali', 'Cut the flare from the empire line and line it so it swirls without clinging.', None),
    (r'kurta|pathani', 'Offer straight and A-line cuts in three lengths; finish side slits with facings.', None),
    (r'bandhgala|nehru|sherwani', 'Interface the band collar firmly and grade it carefully so it sits flat on every size.', 'Raw silk, brocade, jacquard or velvet with fabric-covered or metal buttons.'),
    (r'jutti|mojari', 'Pad the footbed and soften the heel counter; juttis rub at the heel in long wear.', 'Leather uppers with zari or thread embroidery, leather soles with anti-slip patches.'),
    (r'kolhapuri', 'Credit the GI-tagged Kolhapur cluster and keep the hand-plaited strap construction.', 'Vegetable-tanned leather from the Kolhapur cluster.'),
    (r'mirror', 'Use flat-backed mirrors and secure stitching; keep them off friction areas.', 'Shisha mirrors with cotton or silk thread.'),
    (r'chikankari', 'Use fine cotton or georgette and keep the work white-on-white or tonal.', 'Fine cotton, mul or georgette from Lucknow.'),
    (r'zardozi|zari|gota', 'Use placement work at necklines and borders to control cost and weight.', 'Metallic zari threads, gota ribbon and sequins.'),
    (r'block print|bandhani|ikat', 'Approve strike-offs for colour and register; handmade irregularity is part of the appeal.', 'Cotton or silk with hand block, tie-dye or ikat processes.'),
    (r'kantha|rabari', 'Partner with women\'s artisan groups and keep the running stitch visible.', 'Cotton or silk with hand embroidery threads.'),
    (r'khadi|handloom|chanderi|maheshwari|jamdani|tussar|bhagalpur|banarasi|kanjeevaram', 'Order early: handloom has longer lead times and small minimums.', None),
    (r'potli|latkan|tassel', 'Match tassel and bag trims to the garment palette for a set look.', None),
]

def build_desc(cat, it):
    dept, catname, use, fab = next(c for c in I.CATS if c[1] == cat)
    txt = (it['name'] + ' ' + it['note']).lower()
    over = it['note'].rstrip('.') + '. ' + DESCMOD.AREA.get(it['area'], '')
    tips, f = [], None
    for pat, tip, ff in INDIA_RULES + DESCMOD.RULES:
        if re.search(pat, txt):
            if tip and len(tips) < 2 and tip not in tips: tips.append(tip)
            if ff and not f: f = ff
    for t in DESCMOD.AREA_TIP.get(it['area'], []):
        if len(tips) < 3: tips.append(t)
    return {'o': over.strip(), 'd': tips, 'f': f or fab, 'u': use}

# sketches: register India-only specs
extra = {}
for (cat, sub, name, area, note, life, sk) in I.D:
    if isinstance(sk, dict): extra[name] = sk
    elif isinstance(sk, str): extra[name] = '@' + sk
spec_js = 'Object.keys(XS).forEach(function(k){ var v = XS[k]; Flats.SPEC[k] = typeof v === "string" ? Flats.SPEC[v.slice(1)] : v; });'
engine = open('flats.js').read().replace("if (typeof module !== 'undefined') module.exports = Flats;\n", '') + '\nvar XS = ' + json.dumps(extra) + ';\n' + spec_js

codes = I.CODES; si = 0
secs, nav, counts, total, descs = [], [], {k: 0 for k in SL}, 0, {}
short = {'Women': 'Women', 'Men': 'Men', 'Fusion': 'Fusion', 'Western': 'Western', 'Footwear': 'Shoes', 'Materials': 'Craft'}
cur = None
for dept, cat, use, fab in I.CATS:
    items = [dict(cat=c, sub=sb, name=n, area=a, note=no, life=l) for (c, sb, n, a, no, l, sk) in I.D if c == cat and l[si] != '-']
    if dept != cur:
        if cur: secs.append('</div>')
        secs.append(f'<div class="dept" data-dept="{slug(dept)}"><h2 class="depth">{ {"Materials": "Fabrics, craft & trims"}.get(dept, dept if dept not in ("Women", "Men") else dept + "swear")}</h2>')
        cur = dept
    cid = f'{slug(dept)}-{slug(cat)}'
    nav.append(f'<a href="#{cid}" data-dept="{slug(dept)}">{short[dept]} · {E(cat)}</a>')
    items.sort(key=lambda it: 'erpf'.index(it['life'][si]))
    groups = {}
    for it in items: groups.setdefault(it['sub'], []).append(it)
    order = []
    for (c, sb, *_r) in I.D:
        if c == cat and sb not in order: order.append(sb)
    subhtml = []
    for sname in [k for k in order if k in groups]:
        cards = []
        for it in groups[sname]:
            st = it['life'][si]; counts[st] += 1; total += 1
            descs[it['name']] = build_desc(cat, it)
            c, l = SL[st]
            q = E((it['name'] + ' ' + it['area'] + ' ' + it['note'] + ' ' + cat + ' ' + sname).lower())
            img = f' data-img="img/{islug(it["name"])}.webp"' if islug(it['name']) in IMGS else ''
            cards.append(f'<article class="d" tabindex="0" role="button" aria-haspopup="dialog" data-st="{st}" data-life="{it["life"]}"{img} data-q="{q}"><div class="thumb" aria-hidden="true"></div><div class="dtop"><span class="area">{E(sname)}</span><span class="pill {c}">{l}</span></div><h4>{E(it["name"])}</h4><p>{E(it["note"])}</p><span class="open">View detail →</span></article>')
        subhtml.append(f'<div class="sub" data-sub="{E(sname)}"><h5>{E(sname)} <span>{len(groups[sname])}</span></h5><div class="grid">{"".join(cards)}</div></div>')
    secs.append(f'<section class="cat" id="{cid}" data-dept="{slug(dept)}"><div class="cathead"><h3>{E(cat)}</h3><span class="cnt"><span class="vis">{len(items)}</span> details</span></div>{"".join(subhtml)}</section>')
secs.append('</div>')

m = I.META
themes = ''.join(f'<article class="theme" tabindex="0" role="button" aria-haspopup="dialog" data-i="{ti}"><div class="tart" data-pat="{t["pat"]}" data-bg="{t["bg"]}" data-fg="{t["fg"]}" data-flat="{E(t["flat"])}" data-title="{E(t["t"])}"{(chr(32) + 'data-photo="img/' + islug(t["flat"]) + '.webp"') if islug(t["flat"]) in IMGS else ""}></div><div class="tbody"><h3>{E(t["t"])}</h3><p>{E(t["d"])}</p><ul class="kw">{"".join(f"<li>{E(k)}</li>" for k in t["tags"])}</ul><span class="more">Explore theme →</span></div></article>' for ti, t in enumerate(I.THEMES))
tdj = [dict(title=t['t'], season='India · Festive & wedding 2026–28', tags=t['tags'], story=t['story'], why=t['why'], brands=t['brands'], src=t['src'], future=False, kw=t['kw'], prices=t['prices'], cost=t['cost'], actions=t['actions']) for t in I.THEMES]
pal = ''.join(f'<div class="sw2"><i style="background:{h}"></i><span>{E(n)}<small>Pantone {PT.nearest(h)[0]}<br>{h.upper()}</small></span></div>' for h, n in m['palette'])
coty = ''
for c in m['keycolours']:
    pairs = ''.join(f'<span><i style="background:{h}"></i>{E(n)}</span>' for h, n in c['pairs'])
    coty += (f'<article class="coty" style="--c:{c["hex"]};--ci:{c["ink"]}">'
             f'<div class="cfield"><span class="mono">{E(c["label"])}</span><div><h2>{E(c["name"])}</h2><span class="code">Pantone {PT.nearest(c["hex"])[0]} · {c["hex"]}</span></div></div>'
             f'<div class="cart" data-flat="{E(c["flat"])}" data-hex="{c["hex"]}"{(chr(32) + 'data-photo="img/' + islug(c["flat"]) + '.webp"') if islug(c["flat"]) in IMGS else ""} role="img" aria-label="{E(c["flat"])} shown in {E(c["name"])}"></div>'
             f'<div class="cinfo"><p>{E(c["text"])}</p><div class="pairs"><b>Pairs with</b>{pairs}</div></div></article>')

# glance
movers = []
for dept, cat, *_ in I.CATS:
    pool = [x for x in I.D if x[0] == cat and x[5][0] in 'er']
    pool.sort(key=lambda x: 'er'.index(x[5][0]))
    if pool and len(movers) < 6 and cat not in ('Western Wear (India)', 'Fabrics & Weaves'): movers.append((pool[0], cat))
mv = ''.join(f'<button class="mv" type="button" data-name="{E(x[2])}"{(chr(32) + 'data-photo="img/' + islug(x[2]) + '.webp"') if islug(x[2]) in IMGS else ""}><span class="gt" aria-hidden="true"></span><span><b>{E(x[2])}</b><small class="{x[5][0]}">{SL[x[5][0]][1]} · {E(cat)}</small></span></button>' for x, cat in movers[:6])
tot = max(total, 1)
mixbar = ''.join(f'<i style="width:{counts[k] / tot * 100:.1f}%;background:var(--{v})" title="{SL[k][1]} {counts[k]}"></i>' for k, v in [('e', 'chalk'), ('r', 'rise'), ('p', 'peak'), ('f', 'fade')])
mixkey = ''.join(f'<span style="--k:var(--{v})">{SL[k][1]} {round(counts[k] / tot * 100)}%</span>' for k, v in [('e', 'chalk'), ('r', 'rise'), ('p', 'peak'), ('f', 'fade')])
cal = ''.join(f'<div class="calw{" cur" if i == 0 else ""}"><b>{E(c)}</b><span>{E(I.WINDOWS[c])}</span></div>' for i, c in enumerate(codes))
glance = (f'<div class="glance"><div><h3>Status mix · {codes[0]}</h3><div class="mixbar" role="img" aria-label="Status mix">{mixbar}</div><div class="mixkey">{mixkey}</div></div>'
          f'<div><h3>Top movers to act on now</h3><div class="movers">{mv}</div></div>'
          '</div>')

LOCKSVG = '<svg class="lk" viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 7V5a3.5 3.5 0 0 1 7 0v2" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="3" y="7" width="10" height="7" rx="1.6" fill="currentColor"/></svg>'
HOME = '/' if STATIC else 'https://forecut.in/'
snav = f'<a href="#" aria-current="page">India<small>Festive &amp; wedding</small></a>' + ''.join(
    f'<a href="{(x + ".html") if STATIC else URLS.get(x, "#")}"{" class=\"lockt\"" if x in [z.lower() for z in SITE.get("locked", [])] else ""}>{SMETA[x]["code"]}<small>{(LOCKSVG + "Opens at launch") if x in [z.lower() for z in SITE.get("locked", [])] else E(SMETA[x]["stage"])}</small></a>' for x in SEASONS)
tpl = open('season_tpl.txt').read()
rep = {
    '%%ENGINE%%': engine, '%%SECS%%': ''.join(secs), '%%NAV%%': ''.join(nav), '%%SEASONNAV%%': snav,
    '%%THEMES%%': themes, '%%THEMEDATA%%': json.dumps(tdj, ensure_ascii=False).replace('</', '<\\/'), '%%PALETTE%%': pal, '%%COTY%%': coty, '%%HOME%%': HOME,
    '%%TOTAL%%': str(total), '%%CATS%%': str(len(I.CATS)),
    '%%RISE%%': str(counts['r']), '%%EMERGE%%': str(counts['e']), '%%PEAK%%': str(counts['p']), '%%FADE%%': str(counts['f']),
    '%%TITLEUP%%': m['title'].upper(), '%%STAGEUP%%': m['stage'].upper(), '%%WINDOWUP%%': m['window'].upper(),
    '%%CODES%%': json.dumps(codes), '%%PALJSON%%': json.dumps([h for h, n in m['palette']]), '%%BASISCLS%%': 'res', '%%BASISTEXT%%': 'Based on Indian runway, retail and trade coverage',
    '%%STAGE%%': E(m['stage']), '%%WINDOW%%': E(m['window']), '%%TITLE%%': E(m['title']), '%%INTRO%%': E(m['intro']),
    '%%SOURCES%%': E(m['sources']), '%%CODE%%': m['code'],
    '%%GLANCEL%%': glance, '%%GLANCER%%': '',
    '%%DESC%%': json.dumps(descs, ensure_ascii=False).replace('</', '<\\/'), '%%SITE%%': json.dumps(SITE, ensure_ascii=False),
}
out = tpl
for k, v in rep.items(): out = out.replace(k, v)
assert '%%' not in out.replace('100%%', ''), [ln for ln in out.split('\n') if '%%' in ln][:3]
out = out.replace("CUR_SEASON = 'India'", "CUR_SEASON = '" + codes[0] + "'")
out = out.replace('The stories behind India', 'The stories behind India 2026–28').replace('India palette', 'India colour palette')
seg_old = re.search(r'<div class="seg" role="group" aria-label="Department">.*?</div>', out, re.S).group(0)
seg_new = '<div class="seg" role="group" aria-label="Department"><button type="button" data-dept="all" aria-pressed="true">All</button>' + ''.join(f'<button type="button" data-dept="{k}" aria-pressed="false">{v}</button>' for k, v in [('women', 'Women'), ('men', 'Men'), ('fusion', 'Fusion'), ('western', 'Western'), ('footwear', 'Footwear'), ('materials', 'Craft')]) + '</div>'
out = out.replace(seg_old, seg_new).replace('Search details, e.g. collar, zip, sole', 'Search, e.g. saree, jutti, chikankari')
out = out.replace('<title>Forecut India Report</title>', '<title>Forecut India Forecast</title>')
out = out.replace('</style>', '.seasons a.lockt{opacity:.7}.seasons a .lk{width:9px;height:9px;margin-right:4px;vertical-align:-1px;display:inline}' + '</style>', 1)
# season guide (full width, after hero)
import pantone as _PT
sc = ''
for i, c in enumerate(codes):
    si_ = I.SEASON_INFO[c]
    cnt = {k: sum(1 for x in I.D if x[5][i] == k) for k in 'erpf'}; tot = sum(cnt.values())
    bar = ''.join(f'<i style="width:{cnt[k] / max(tot, 1) * 100:.1f}%;background:var(--{v})"></i>' for k, v in [('e', 'chalk'), ('r', 'rise'), ('p', 'peak'), ('f', 'fade')])
    sw = ''.join(f'<i style="background:{h}" title="{_PT.nearest(h)[0]}"></i>' for h in si_['colours'])
    when, occ = I.WINDOWS[c].split(' · ')[0], si_['occasions']
    tag = ('<span class="stag now">Now · open</span>' if (c not in SITE.get('locked', [])) else '<span class="stag lock"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 7V5a3.5 3.5 0 0 1 7 0v2" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="3" y="7" width="10" height="7" rx="1.6" fill="currentColor"/></svg>Opens at launch</span>')
    sc += (f'<article class="scard{" open" if (c not in SITE.get("locked", [])) else " locked"}"><div class="shd">{tag}<b>{E(c)}</b><span>{E(when)}</span></div>'
           f'<p class="socc">{E(occ)}</p><p class="sfoc">{E(si_["focus"])}</p>'
           f'<div class="ssw">{sw}</div><div class="smix">{bar}</div><p class="sct">{tot} details · {cnt["e"]} emerging · {cnt["r"]} rising · {cnt["p"]} peaking · {cnt["f"]} fading</p>'
           f'<p class="splan"><b>Plan:</b> {E(si_["plan"])}</p></article>')
ssec = f"""  <section class="sec" id="seasons" aria-labelledby="sgh"><div class="sechead"><span class="mono eb">India fashion calendar</span><h2 id="sgh">Five seasons, one plan.</h2><p class="hint">Festive 26 is open now. Later seasons release in full at Forecut\'s official launch.</p></div>
    <div class="sgrid">{sc}</div></section>
"""
out = out.replace('  </header>\n', '  </header>\n' + ssec, 1)
out = out.replace('</style>', '.sgrid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:14px}.scard{border:1px solid var(--grid);border-radius:14px;background:var(--paper-2);padding:16px;display:flex;flex-direction:column;gap:10px}.scard.open{border-color:var(--mat);box-shadow:inset 0 0 0 1px var(--mat)}.shd{display:flex;flex-direction:column;align-items:flex-start;gap:4px}.shd .stag{margin-bottom:6px}.shd b{display:block;font:700 20px var(--display);letter-spacing:-.01em;white-space:nowrap}.shd span{font:500 13px var(--body);color:var(--muted)}.stag{display:inline-flex;align-items:center;gap:5px;font:700 10.5px var(--body);letter-spacing:.06em;text-transform:uppercase;padding:4px 8px;border-radius:99px;white-space:nowrap;flex:none}.stag svg{width:11px;height:11px}.stag.now{background:linear-gradient(135deg,#00a85a,#1fd17f);color:#fff}.stag.lock{background:var(--grid);color:var(--muted)}.socc{margin:0;font:600 13.5px var(--body);color:var(--chalk);line-height:1.4}.sfoc{margin:0;font-size:14.5px;line-height:1.5}.ssw{display:flex;gap:4px}.ssw i{width:22px;height:22px;border-radius:5px;border:1px solid rgba(0,0,0,.08)}.smix{display:flex;height:7px;border-radius:99px;overflow:hidden;background:var(--grid)}.smix i{display:block;height:100%}.sct{margin:0;font:500 12px var(--body);color:var(--muted)}.splan{margin:auto 0 0;font-size:13.5px;line-height:1.45;padding-top:8px;border-top:1px dashed var(--grid)}.splan b{font-family:var(--body)}@media (max-width:1100px){.sgrid{grid-template-columns:repeat(3,minmax(0,1fr))}}@media (max-width:700px){.sgrid{grid-template-columns:1fr}}</style>', 1)
# season switcher (all India seasons)
sbtn = ''.join(f'<button type="button" data-si="{i}"{"" if (c not in SITE.get("locked", [])) else " data-lock aria-disabled=\"true\""} aria-pressed="{"true" if i == 0 else "false"}"><b>{E(c)}{"" if (c not in SITE.get("locked", [])) else " 🔒"}</b><small>{E(I.WINDOWS[c].split(" · ")[0])}</small></button>' for i, c in enumerate(codes))
srow = f'<div class="row srow"><span class="slbl">Season</span><div class="sseg" role="group" aria-label="Season">{sbtn}</div></div><p class="snote" id="snote" hidden>Long-range outlook: statuses are projected from today\'s signals. New emerging details are added each month as they appear.</p>'
out = out.replace('<div class="tools">\n    <div class="row">', '<div class="tools">\n    ' + srow + '\n    <div class="row">', 1)
sjs = '''<script>(function(){var C=''' + json.dumps(codes) + ''',CL={e:'emerge',r:'rise',p:'peak',f:'fade'},LB={e:'Emerging',r:'Rising',p:'Peaking',f:'Fading'},bs=document.querySelectorAll('.sseg button');
function set(i){document.querySelectorAll('.d').forEach(function(d){var ch=(d.getAttribute('data-life')||'').charAt(i);if(!ch||ch==='-'){d.setAttribute('data-off','');return;}d.removeAttribute('data-off');d.setAttribute('data-st',ch);var p=d.querySelector('.pill');if(p){p.className='pill '+CL[ch];p.textContent=LB[ch];}});
bs.forEach(function(b){b.setAttribute('aria-pressed',b.getAttribute('data-si')==String(i)?'true':'false');});var sn=document.getElementById('snote');if(sn)sn.hidden=true;if(window.FCSetSeason)FCSetSeason(C[i]);if(window.FCApply)FCApply();}
bs.forEach(function(b){b.addEventListener('click',function(){var sn=document.getElementById('snote');if(b.hasAttribute('data-lock')){if(sn){sn.hidden=false;sn.textContent=b.querySelector('b').textContent.replace(' 🔒','')+' opens in full at Forecut\\'s official launch. Festive 26 is open now.';}return;}set(+b.getAttribute('data-si'));});});})();</script>'''
out = out.replace('</body></html>', sjs + '\n</body></html>') if '</body></html>' in out else out + sjs
out = out.replace('</style>', '.srow{align-items:center;gap:10px;flex-wrap:nowrap;overflow-x:auto;padding-bottom:2px}.snote{margin:-4px 0 10px;font-size:13.5px;color:var(--muted)}.slbl{font:700 12px var(--body);letter-spacing:.08em;text-transform:uppercase;color:var(--muted);flex:none}.sseg{display:flex;gap:6px}.sseg button{all:unset;cursor:pointer;flex:none;border:1px solid var(--grid);background:var(--paper-2);border-radius:10px;padding:7px 12px;display:grid;line-height:1.25}.sseg button b{font:700 14px var(--body)}.sseg button small{font:500 11px var(--body);color:var(--muted)}.sseg button[aria-pressed="true"]{background:var(--mat);border-color:var(--mat);color:var(--mat-ink)}.sseg button[aria-pressed="true"] small{color:var(--mat-ink);opacity:.8}.sseg button[data-lock]{opacity:.6;cursor:not-allowed}.sseg button:focus-visible{outline:2px solid var(--chalk);outline-offset:2px}</style>', 1)
css = '.cal{display:grid;grid-template-columns:repeat(auto-fill,minmax(118px,1fr));gap:8px}.calw{border:1px solid var(--grid);border-radius:10px;padding:8px 10px;background:var(--paper);display:grid;gap:2px}.calw b{font:600 13px var(--body)}.calw span{font-size:11.5px;color:var(--muted);line-height:1.35}.calw.cur{border-color:var(--mat);box-shadow:inset 0 0 0 1px var(--mat)}@media (max-width:560px){.cal{grid-template-columns:1fr}}'
out = out.replace('</style>', css + '</style>', 1)
json.dump({'codes': codes, 'details': [dict(cat=c, sub=sb, name=n, area=a, note=no, life=l) for (c, sb, n, a, no, l, sk) in I.D]}, open('india.json', 'w'), ensure_ascii=False, indent=0)
path = os.path.join(STATIC, 'india.html') if STATIC else 'forecut-india.html'
if STATIC:
    t = re.search(r'<title>.*?</title>', out).group(0)
    out = '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">\n' + out.replace(t, t + '</head><body>', 1) + '\n</body></html>'
# Lookbook strip of India photos under the hero
IMGS = set(json.load(open('images.json')))
SLN = {'e': 'Emerging', 'r': 'Rising', 'p': 'Peaking', 'f': 'Fading'}
bycat = {}
for x in I.D:
    if islug(x[2]) in IMGS and x[5][0] in 'erp': bycat.setdefault(x[1], []).append(x)
for v in bycat.values(): v.sort(key=lambda x: 'rep'.index(x[5][0]))
pick, rnd = [], 0
while len(pick) < 16 and any(len(v) > rnd for v in bycat.values()):
    for v in bycat.values():
        if len(v) > rnd and len(pick) < 16: pick.append(v[rnd])
    rnd += 1
if pick:
    cards = ''.join(f'<button type="button" class="lbk" data-name="{E(x[2])}"><span class="lbi"><img src="img/{islug(x[2])}.webp" alt="{E(x[2])}" loading="lazy" width="440" height="550"></span><small class="{x[5][0]}">{SLN[x[5][0]]} · {E(x[1])}</small><b>{E(x[2])}</b></button>' for x in pick)
    lb = f"""  <section class="sec" id="lookbook" aria-labelledby="lbh">
    <div class="sechead"><span class="mono eb">The India edit</span><h2 id="lbh">This season, up close.</h2><p class="lbp">The details we're watching across Indian wear right now. Tap any look for notes, timing and a downloadable card.</p></div>
    <div class="lbrow">{cards}</div>
  </section>
"""
    anchor = '  <section class="sec" aria-labelledby="th">'
    import reports_data as RD
    rl = ''.join(f'<a href="core-item-{s}.html">{E(t)}</a>' for s, t, *_ in RD.ITEMS)
    cl = ''.join(f'<a href="capsule-{v[0]}.html">{E(k)}</a>' for k, v in RD.CAPSULES.items())
    rep = f'''  <section class="sec" id="reports" aria-labelledby="rph"><div class="sechead"><span class="mono eb">India reports</span><h2 id="rph">Go deeper.</h2></div>
    <div class="rpl"><div><b>Core Item Updates</b><p>{rl}</p></div><div><b>Design Capsules</b><p>{cl}</p></div><div><b>Guides</b><p><a href="india-brand-watch.html">Brand Watch</a><a href="india-colour-forecast.html">India Colour Forecast</a><a href="india-textile-craft-guide.html">Textile and Craft Sourcing Guide</a><a href="reports.html">All reports →</a></p></div></div></section>
'''
    out = out.replace(anchor, lb + '\n' + rep + anchor, 1)
    out = out.replace('</style>', '.rpl{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.rpl>div{background:var(--paper-2);border:1px solid var(--grid);border-radius:12px;padding:16px 18px}.rpl b{font:700 16px var(--display)}.rpl p{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0 0}.rpl a{font:600 13.5px var(--body);text-decoration:none;color:var(--ink);border:1px solid var(--grid);border-radius:99px;padding:6px 12px;background:var(--paper)}.rpl a:hover{border-color:var(--ink)}@media (max-width:820px){.rpl{grid-template-columns:1fr}}</style>', 1)
    lcss = ('.lbp{color:var(--muted);font-size:15px;max-width:60ch;margin:6px 0 0}'
            '.lbrow{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(200px,240px);gap:16px;overflow-x:auto;padding:4px 2px 14px;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:thin}'
            '.lbk{all:unset;box-sizing:border-box;cursor:pointer;scroll-snap-align:start;display:grid;gap:7px;align-content:start}'
            '.lbk:focus-visible{outline:2px solid var(--chalk);outline-offset:3px}'
            '.lbi{display:block;aspect-ratio:4/5;overflow:hidden;border-radius:4px;background:var(--surface-img)}'
            '.lbi img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s ease}'
            '.lbk:hover .lbi img{transform:scale(1.04)}'
            '.lbk small{font:600 11px var(--body);letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin-top:3px}'
            '.lbk small.e{color:var(--chalk)}.lbk small.r{color:var(--rise)}.lbk small.p{color:var(--peak)}'
            '.lbk b{font:600 18px/1.25 var(--display)}'
            '@media (max-width:560px){.lbrow{grid-auto-columns:62vw;gap:12px}.lbk b{font-size:16px}}')
    out = out.replace('</style>', lcss + '</style>', 1)
    js = "<script>document.querySelectorAll('.lbk').forEach(function(b){b.addEventListener('click',function(){var n=b.getAttribute('data-name'),hit=Array.prototype.find.call(document.querySelectorAll('.d'),function(c){return c.querySelector('h4').textContent===n;});if(hit&&window.ForecutOpenDetail)window.ForecutOpenDetail(hit);});});</script>"
    out = out.replace('</body></html>', js + '\n</body></html>') if '</body></html>' in out else out + js
open(path, 'w').write(out)
print('india', total, counts)
