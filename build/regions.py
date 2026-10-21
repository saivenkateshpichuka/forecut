"""Write the global region pages: regions.html (hub + season calendar), region-<slug>.html for six continents,
resort-27.html and pre-fall-27.html. Reuses the hub page shell and helpers from hubs.py."""
import json, html, os, re
_src = open('hubs.py').read()
_ns = {'__name__': 'hubs_helpers'}
exec(_src.split('\nBUILD = {')[0], _ns)
head, im, pick, news, NAVJS, FOOT, CSS = _ns['head'], _ns['im'], _ns['pick'], _ns['news'], _ns['NAVJS'], _ns['FOOT'], _ns['CSS']
E = html.escape
import regions_data as RD
S = json.load(open('seasons.json'))
D = json.load(open('details.json'))
CODES = S['seasons']  # aw26 ss27 aw27 ss28 aw28
STN = {'e': 'Emerging', 'r': 'Rising', 'p': 'Peaking', 'f': 'Fading'}

RCSS = """<style>
.rgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:18px}
.rcard{text-decoration:none;color:inherit;background:var(--paper-2);border:1px solid var(--grid);border-radius:14px;overflow:hidden;display:flex;flex-direction:column;transition:border-color .2s}
.rcard:hover{border-color:var(--ink)}.rcard .ph{aspect-ratio:16/10;overflow:hidden;background:var(--grid)}.rcard .ph img{width:100%;height:100%;object-fit:cover;display:block}
.rcard .in{padding:16px 18px 18px}.rcard h3{font:700 22px "DM Sans",sans-serif;margin:0 0 6px;display:flex;justify-content:space-between;align-items:center;gap:8px}
.rcard p{font-size:15px;line-height:1.55;margin:0 0 10px}.rcard .mk{font:600 13px "DM Sans",sans-serif;color:var(--muted)}
.hemi{font:700 10.5px "DM Sans",sans-serif;letter-spacing:.08em;text-transform:uppercase;border:1px solid var(--grid);border-radius:99px;padding:3px 9px;color:var(--chalk);white-space:nowrap}
.ctab2{border:1px solid var(--grid);border-radius:12px;overflow:auto;background:var(--paper-2)}.ctab2 table{border-collapse:collapse;width:100%;min-width:720px;font:14.5px/1.45 "DM Sans",sans-serif}
.ctab2 th,.ctab2 td{text-align:left;padding:12px 14px;border-top:1px solid var(--grid);vertical-align:top}.ctab2 th{font:700 11.5px "DM Sans",sans-serif;letter-spacing:.07em;text-transform:uppercase;color:var(--muted);background:var(--paper);border-top:0}
.ctab2 td b{display:block}.glance{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px}
.dirb{background:#1f3d33;color:#f5f0e8;border-radius:12px;padding:16px 20px;margin:0 0 16px}.dirb b{display:block;font:700 11.5px "DM Sans",sans-serif;letter-spacing:.08em;text-transform:uppercase;margin-bottom:6px}
.dirb li{color:#f5f0e8}.dirb ul{margin:0;padding-left:18px;font-size:15.5px;line-height:1.6}.when{font:600 14px "DM Sans",sans-serif;margin:0 0 12px}.when span{color:var(--chalk)}
.tg{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px}.tc{text-decoration:none;color:inherit;background:var(--paper-2);border:1px solid var(--grid);border-radius:12px;overflow:hidden}
.tc .ph{aspect-ratio:1;background:var(--grid);overflow:hidden}.tc .ph img{width:100%;height:100%;object-fit:cover;object-position:50% 20%;display:block}.tc .in{padding:10px 12px 12px}
.tc b{display:block;font:600 14.5px/1.3 "DM Sans",sans-serif}.tc small{font:12px "DM Sans",sans-serif;color:var(--muted)}.pill2{display:inline-block;font:700 10.5px "DM Sans",sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#fff;border-radius:99px;padding:2px 8px;margin-top:6px}
.pe{background:#c2410c}.pr{background:#047a45}.pp{background:#f0b000;color:#3d2600!important}.pf{background:#6d4fc2}
.stabs{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;margin:0 0 14px}.stabs::-webkit-scrollbar{display:none}
.stabs button{all:unset;cursor:pointer;flex:none;font:600 14px "DM Sans",sans-serif;border:1px solid var(--grid);border-radius:10px;padding:9px 14px;background:var(--paper-2);text-align:center}
.stabs button small{display:block;font:500 11.5px "DM Sans",sans-serif;color:var(--muted)}.stabs button[aria-pressed="true"]{background:var(--ink);color:var(--paper);border-color:var(--ink)}.stabs button[aria-pressed="true"] small{color:var(--paper)}
.spanel[hidden]{display:none}.mkt .mini{display:flex;flex-direction:column;gap:6px}.mkt .mini dl{display:grid;grid-template-columns:auto 1fr;gap:4px 10px;margin:4px 0 0;font:14px/1.45 "DM Sans",sans-serif}.mkt .mini dt{color:var(--muted)}.mkt .mini dd{margin:0}
.mkt .mini a.go{font:700 14px "DM Sans",sans-serif;color:var(--chalk);margin-top:6px}.infl{columns:2 280px;column-gap:28px;padding-left:18px;font-size:16px;line-height:1.7}
.other{display:flex;flex-wrap:wrap;gap:8px}.other a{font:600 13.5px "DM Sans",sans-serif;text-decoration:none;color:var(--ink);border:1px solid var(--grid);border-radius:99px;padding:7px 14px;background:var(--paper-2)}
.show{background:var(--paper-2);border:1px solid var(--grid);border-radius:12px;padding:16px 18px}.show b{font:700 18px "DM Sans",sans-serif}.show small{display:block;font:600 13px "DM Sans",sans-serif;color:var(--chalk);margin:2px 0 8px}.show p{margin:0;font-size:15px;line-height:1.55}
@media (max-width:760px){.tg{grid-template-columns:1fr 1fr}.rgrid{grid-template-columns:1fr}}
</style>"""
RJS = """<script>(function(){document.querySelectorAll('.stabs').forEach(function(g){var bs=g.querySelectorAll('button');bs.forEach(function(b){b.onclick=function(){bs.forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});g.parentNode.querySelectorAll('.spanel').forEach(function(p){p.hidden=p.id!==b.dataset.s})}})});var h=location.hash.match(/^#s-([a-z0-9]+)$/);if(h){var b=document.querySelector('.stabs button[data-s$="-'+h[1]+'"]');if(b){b.click();var t=document.getElementById('seasons');if(t)t.scrollIntoView();}}})();</script>"""


def islug(x): return ''.join(ch.lower() if ch.isalnum() else '-' for ch in x).strip('-').replace('--', '-').replace('--', '-')


def items():
    return [(d, c, x) for (d, c) in D['order'] for x in D['model'][f'{d}|{c}']]


ALL = items()


def local_window(r, code):
    north = dict((c, w) for c, _, _, w in RD.SEASONS)[code]
    y = {'aw26': 2026, 'ss27': 2027, 'aw27': 2027, 'ss28': 2028, 'aw28': 2028}
    if r['hemi'] == 'north':
        return north
    if code.startswith('ss'):
        s = f'Sep {y[code]} – Feb {y[code] + 1} (local spring/summer)'
    elif code.startswith('aw'):
        s = f'Mar – Aug {y[code] + 1} (local autumn/winter)'
    elif code == 'rs27':
        s = 'Nov 2026 – Jan 2027 (local summer: peak resort season)'
    else:
        s = 'Feb – Apr 2028 (local autumn transition)'
    if r['hemi'] == 'mixed':
        return f'North & West Africa: {north} · South Africa: {s}'
    return s


def trends_for(r, code, n=8):
    if code == 'rs27': si, bridge = CODES.index('ss27'), None
    elif code == 'pf27': si, bridge = CODES.index('aw27'), CODES.index('ss27')
    else: si, bridge = CODES.index(code), None
    aw = code.startswith('aw') or code == 'pf27'
    out = []
    for d, c, x in ALL:
        st = x['life'][si]
        if st not in ('e', 'r', 'p'): continue
        if bridge is not None and x['life'][bridge] == '-': continue
        txt = (x['name'] + ' ' + x['note']).lower()
        if r['heat'] and aw and any(w in txt for w in RD.HOT): continue
        sc = {'e': 2, 'r': 1.5, 'p': 0.5}[st] + sum(1.2 for w in r['boost'] if w in txt)
        sl = islug(x['name']); first = next(j for j, ch in enumerate(x['life']) if ch != '-')
        fn = sl if si == first else f'{sl}-{CODES[si]}'
        p = pick([fn + '-photo', fn, sl + '-photo', sl])
        if p: sc += 1
        out.append((sc, d, c, x, st, p))
    out.sort(key=lambda t: -t[0])
    res, per = [], {}
    for t in out:
        if per.get(t[1], 0) >= 3: continue
        per[t[1]] = per.get(t[1], 0) + 1; res.append(t)
        if len(res) == n: break
    return res


def tcards(r, code):
    gp = dict((c, g) for c, _, g, _ in RD.SEASONS)[code]
    target = gp if code not in ('rs27', 'pf27') else ('ss27.html' if code == 'rs27' else 'aw27.html')
    return '<div class="tg">' + ''.join(
        f'<a class="tc" href="{target}">' + (f'<div class="ph"><img src="img/{p}.webp" alt="{E(x["name"])}" loading="lazy" width="300" height="300"></div>' if p else '')
        + f'<div class="in"><b>{E(x["name"])}</b><small>{E(d)} · {E(c)}</small><br><span class="pill2 p{st}">{STN[st]}</span></div></a>'
        for _, d, c, x, st, p in trends_for(r, code)) + '</div>'


def top(title, eb, lead, hero, jumps, pos='50% 35%'):
    p = pick(hero)
    return (f'<p class="eb">{E(eb)}</p><h1>{E(title)}</h1><p class="lead">{E(lead)}</p><p style="font:600 12.5px DM Sans,sans-serif;color:var(--muted);letter-spacing:.04em">Global forecast · Updated {RD.UPDATED}</p>'
            + (f'<div class="hhero"><img src="img/{p}.webp" alt="{E(title)}" width="1600" height="686" fetchpriority="high" style="object-position:{pos}"></div>' if p else '')
            + '<nav class="jump" aria-label="On this page">' + ''.join(f'<a href="#{a}">{E(b)}</a>' for a, b in jumps) + '</nav>')


def season_tabs(r, default='ss27'):
    tabs = ''.join(f'<button type="button" data-s="r-{r["slug"]}-{c}" aria-pressed="{"true" if c == default else "false"}">{E(l)}<small>{E(S["meta"][c]["stage"]) if c in S["meta"] else ("Cruise shows May 2026" if c == "rs27" else "Shows Dec 2026–Jan 2027")}</small></button>' for c, l, _, _ in RD.SEASONS)
    panels = ''
    for c, l, gp, _ in RD.SEASONS:
        d = r['dir'].get(c)
        if not d:
            m = S['meta'].get(c, {})
            d = [m.get('intro', '')] if m else []
            d = [x for x in d if x] + ([f'Regional reading: lead with the {l} trends below that suit {r["name"]}\'s climate and buyers.'])
        panels += (f'<div class="spanel" id="r-{r["slug"]}-{c}"{"" if c == default else " hidden"}>'
                   f'<p class="when">In {E(r["name"])} stores: <span>{E(local_window(r, c))}</span> · <a href="{gp}">Global {E(l)} report →</a></p>'
                   f'<div class="dirb"><b>Forecut direction for {E(r["name"])} · {E(l)}</b><ul>{"".join(f"<li>{E(x)}</li>" for x in d)}</ul></div>'
                   f'<h3 style="font:700 17px DM Sans,sans-serif;margin:18px 0 10px">Global trends to lead with in {E(r["name"])}</h3>{tcards(r, c)}</div>')
    return f'<div class="stabs" role="group" aria-label="Season">{tabs}</div>{panels}'


def lifecycle(r):
    seen, rows = set(), []
    for code in ('ss27', 'aw27', 'aw26'):
        for t in trends_for(r, code, 6):
            if t[3]['name'] in seen or len(rows) >= 10: continue
            seen.add(t[3]['name']); rows.append(t)
    PC = {'e': 'em', 'r': 'ri', 'p': 'pk', 'f': 'fd'}
    body = ''.join('<tr><th scope="row">' + E(x['name']) + f'<small>{E(c)}</small></th>' + ''.join(
        f'<td><span class="lp {PC[ch]}">{STN[ch]}</span></td>' if ch in STN else '<td class="na">–</td>' for ch in x['life']) + '</tr>' for _, d, c, x, st, p in rows)
    return ('<div class="lwrap"><table class="ltab"><thead><tr><th scope="col">Detail</th>' + ''.join(f'<th scope="col">{c.upper()}</th>' for c in CODES) + '</tr></thead><tbody>' + body + '</tbody></table></div>'
            + f'<p class="sub" style="margin-top:10px">Picked for {E(r["name"])}\'s climate and buyers. Stages follow the international seasons; for when each season reaches stores locally, see the season tabs above.</p>')


LCSS = '''<style>.lwrap{overflow-x:auto;border:1px solid var(--grid);border-radius:12px;background:var(--paper-2)}
.ltab{width:100%;border-collapse:collapse;min-width:640px;font:500 14px "DM Sans",sans-serif}
.ltab th,.ltab td{padding:10px 12px;border-bottom:1px solid var(--grid);text-align:left}
.ltab thead th{font:600 11.5px "DM Sans",sans-serif;letter-spacing:.06em;color:var(--muted)}
.ltab tbody th small{display:block;font-weight:500;color:var(--muted);font-size:12px}
.lp{display:inline-block;font:700 11px "DM Sans",sans-serif;letter-spacing:.04em;text-transform:uppercase;padding:4px 8px;border-radius:99px}
.lp.em{background:#ffe1d3;color:#8a2c00}.lp.ri{background:#d6f5e4;color:#04603a}.lp.pk{background:#fff0c7;color:#6b4a00}.lp.fd{background:#ebe3ff;color:#4b2a9e}
.ltab .na{color:var(--muted)}</style>'''


def region_page(r):
    jumps = [('seasons', 'Season forecast'), ('lifecycle', 'Lifecycle'), ('markets', 'Markets'), ('climate', 'Climate & influences'), ('news', 'Runway & news'), ('more', 'Other regions')]
    mk = '<div class="g3 mkt">' + ''.join(
        f'<div class="mini"><b style="font-size:19px">{E(m["name"])}</b><dl><dt>Climate</dt><dd>{E(m["climate"])}</dd><dt>Key moments</dt><dd>{E(m["moments"])}</dd><dt>Buyers want</dt><dd>{E(m["prefs"])}</dd><dt>Fashion week</dt><dd>{E(m["week"])}</dd></dl>'
        + (f'<a class="go" href="{m["link"][0]}">{E(m["link"][1])}</a>' if m.get('link') else '') + '</div>' for m in r['markets']) + '</div>'
    hemi = {'north': 'Northern hemisphere', 'south': 'Southern hemisphere', 'mixed': 'Both hemispheres'}[r['hemi']]
    weeks = ' · '.join(m['week'] for m in r['markets'])
    glance = (f'<div class="glance"><div class="mini"><b>Hemisphere</b><p>{hemi}{" · seasons opposite to Europe and North America" if r["hemi"] == "south" else ""}</p></div>'
              f'<div class="mini"><b>Key markets</b><p>{E(", ".join(m["name"] for m in r["markets"]))}</p></div>'
              f'<div class="mini"><b>Fashion weeks</b><p>{E(weeks)}</p></div></div>')
    other = '<div class="other">' + ''.join(f'<a href="region-{x["slug"]}.html">{E(x["name"])}</a>' for x in RD.REGIONS if x is not r) + '<a href="regions.html">All regions →</a></div>'
    body = (RCSS + top(f'{r["name"]} fashion forecast', 'Regions · ' + r['name'], r['lead'], r['img'], jumps) + glance
            + f'<section class="sec" id="seasons"><h2>Season by season in {E(r["name"])}</h2><p class="sub">International seasons (SS, Pre-Fall, AW, Resort) with {E(r["name"])}\'s own in-store timing, Forecut\'s regional direction, and the global trends that suit this market.</p>{season_tabs(r)}</section>'
            + f'<section class="sec" id="lifecycle"><h2>Trend lifecycle in {E(r["name"])}</h2><p class="sub">How the trends that suit this region move from AW26 to AW28.</p>{lifecycle(r)}</section>' + LCSS
            + f'<section class="sec" id="markets"><h2>Key markets</h2><p class="sub">Climate, buying moments and preferences that shape how trends sell.</p>{mk}</section>'
            + f'<section class="sec" id="climate"><h2>Climate & influences</h2><p class="sub">{E(r["climate"])}</p><ul class="infl">{"".join(f"<li>{E(x)}</li>" for x in r["influences"])}</ul></section>'
            + f'<section class="sec" id="news"><h2>Runway & news from {E(r["name"])}</h2><p class="sub">The latest fashion weeks and collections, summarised with links to the original coverage.</p>{news(r["news"])}</section>'
            + f'<section class="sec" id="more"><h2>Other regions</h2>{other}</section>' + RJS)
    return body


def hub():
    cards = ''.join(
        f'<a class="rcard" href="region-{r["slug"]}.html">{im(r["img"], r["name"])}<div class="in"><h3>{E(r["name"])}<span class="hemi">{ {"north": "North", "south": "South", "mixed": "N + S"}[r["hemi"]]}</span></h3>'
        f'<p>{E(r["lead"])}</p><span class="mk">{E(" · ".join(m["name"] for m in r["markets"]))}</span></div></a>' for r in RD.REGIONS)
    cal = ('<div class="ctab2"><table><tr><th>Season</th><th>Shown</th><th>In stores (northern hemisphere)</th><th>Southern hemisphere</th><th>Tropical & seasonless markets</th></tr>'
           + ''.join(f'<tr><td><b>{E(n)}</b>{E(c)}</td><td>{E(sh)}</td><td>{E(nn)}</td><td>{E(so)}</td><td>{E(tr)}</td></tr>' for n, c, sh, nn, so, tr in RD.CALENDAR) + '</table></div>')
    timing = ('<div class="ctab2"><table><tr><th>Region</th><th>SS27 in stores</th><th>AW27 in stores</th><th>Resort 27</th></tr>'
              + ''.join(f'<tr><td><b><a href="region-{r["slug"]}.html">{E(r["name"])}</a></b></td><td>{E(local_window(r, "ss27"))}</td><td>{E(local_window(r, "aw27"))}</td><td>{E(local_window(r, "rs27"))}</td></tr>' for r in RD.REGIONS) + '</table></div>')
    m = S['meta']['ss27']
    th = ''.join(f'<div class="theme"><b>{E(t[0])}</b><p>{E(t[1])}</p></div>' for t in m['themes'][:6])
    jumps = [('regions', 'Regions'), ('calendar', 'Season calendar'), ('timing', 'Regional timing'), ('global', 'Global SS27 trends'), ('collections', 'Resort & Pre-Fall')]
    return (RCSS + top('Global fashion forecast, region by region', 'Regions', 'One global forecast, read for six regions. Forecut tracks the international seasons (Spring/Summer, Pre-Fall, Autumn/Winter and Resort) and shows how each trend lands in Asia, Europe, North America, South America, Africa and Oceania, with local timing, climate and market preferences.', ['hub-regions', 'hero-ss27'], jumps)
            + f'<section class="sec" id="regions"><h2>Six regions</h2><p class="sub">Pick a region for its season-by-season direction, key markets, climate and fashion weeks.</p><div class="rgrid">{cards}</div></section>'
            + f'<section class="sec" id="calendar"><h2>The international season calendar</h2><p class="sub">Forecut keeps the industry-standard season names. Southern-hemisphere and tropical markets sell the same trends on their own timing.</p>{cal}</section>'
            + f'<section class="sec" id="timing"><h2>When trends reach each region</h2><p class="sub">Local in-store windows for the next seasons.</p>{timing}</section>'
            + f'<section class="sec" id="global"><h2>Global SS27 directions</h2><p class="sub">The trends every region starts from. <a href="ss27.html">Open the full SS27 forecast →</a></p><div class="g3" style="gap:22px">{th}</div></section>'
            + f'<section class="sec" id="collections"><h2>Resort and Pre-Fall</h2><p class="sub">The two "in-between" collections that keep stores fresh between the main seasons.</p><div class="rgrid">'
            + f'<a class="rcard" href="resort-27.html">{im(["hub-resort-27", "theme-ss27-in-motion"], "Resort 27")}<div class="in"><h3>Resort / Cruise 2027<span class="hemi">Nov–Jan</span></h3><p>Chanel in Biarritz, Dior in Los Angeles, Gucci and Louis Vuitton in New York, and Australian Fashion Week.</p></div></a>'
            + f'<a class="rcard" href="pre-fall-27.html">{im(["hub-pre-fall-27", "hero-aw26"], "Pre-Fall 27")}<div class="in"><h3>Pre-Fall 2027<span class="hemi">May–Jul</span></h3><p>The transitional trends that bridge SS27 and AW27, with timing by region.</p></div></a></div></section>' + RJS)


def resort():
    R = RD.RESORT
    shows = '<div class="g3">' + ''.join(f'<div class="show"><b>{E(h)}</b><small>{E(dz)} · {E(loc)}</small><p>{E(t)}</p></div>' for h, dz, loc, t in R['shows']) + '</div>'
    reg = ('<div class="ctab2"><table><tr><th>Region</th><th>Resort 27 in stores</th><th>Forecut direction</th></tr>'
           + ''.join(f'<tr><td><b><a href="region-{r["slug"]}.html">{E(r["name"])}</a></b></td><td>{E(local_window(r, "rs27"))}</td><td>{E("; ".join(r["dir"].get("rs27", [])))}</td></tr>' for r in RD.REGIONS) + '</table></div>')
    src = 'Sources: ' + ', '.join(f'<a href="{u}" rel="noopener" target="_blank">{E(n)}</a>' for n, u in R['src']) + '.'
    jumps = [('shows', 'Cruise shows'), ('australia', 'Australian Fashion Week'), ('regions', 'By region')]
    return (RCSS + top('Resort / Cruise 2027', 'Collections · Resort 27', 'Resort (also called Cruise) collections are shown in May and June and arrive in stores from November, for holidays, travel and warm-weather markets. For the southern hemisphere they land in peak summer.', ['hub-resort-27', 'theme-ss27-in-motion'], jumps)
            + f'<section class="sec" id="shows"><h2>The Cruise 2027 shows</h2><p class="sub">Four houses, four cities: spectacle on the runway, wearable clothes underneath.</p>{shows}</section>'
            + f'<section class="sec" id="australia"><h2>Australian Fashion Week: Resort 27</h2><p class="sub">Shown in Sydney in May 2026: the southern hemisphere\'s own resort calendar.</p><ul class="infl">{"".join(f"<li>{E(x)}</li>" for x in R["aus"])}</ul></section>'
            + f'<section class="sec" id="regions"><h2>Resort 27 by region</h2>{reg}<p class="sub" style="margin-top:14px">{src}</p></section>')


def prefall():
    reg = ('<div class="ctab2"><table><tr><th>Region</th><th>Pre-Fall 27 in stores</th></tr>'
           + ''.join(f'<tr><td><b><a href="region-{r["slug"]}.html">{E(r["name"])}</a></b></td><td>{E(local_window(r, "pf27"))}</td></tr>' for r in RD.REGIONS) + '</table></div>')
    g = RD.REGIONS[1]  # Europe as the reference market for the global bridge list
    jumps = [('outlook', 'Outlook'), ('bridge', 'Bridge trends'), ('regions', 'By region')]
    return (RCSS + top('Pre-Fall 2027 outlook', 'Collections · Pre-Fall 27', 'Pre-Fall collections are shown in December and January and reach stores from May to July. They bridge summer and winter with transitional pieces. Pre-Fall 2027 shows have not happened yet, so this is a Forecut projection built from SS27 runway signals and the AW27 outlook; it will be updated when the shows take place.', ['hub-pre-fall-27', 'hero-aw26'], jumps)
            + '<section class="sec" id="outlook"><h2>The Pre-Fall 27 outlook</h2><ul class="infl"><li>Waisted jackets and belted outerwear as the bridge from the SS27 waist story to AW27 coats</li><li>Light layering: fine knits, shirt jackets, trench coats in technical cotton</li><li>Luminous Blue deepening towards navy and ink</li><li>Craft details moving from summer cottons onto knits</li></ul></section>'
            + f'<section class="sec" id="bridge"><h2>Bridge trends</h2><p class="sub">Trends present in SS27 that keep rising into AW27: the safest Pre-Fall bets.</p>{tcards(g, "pf27")}</section>'
            + f'<section class="sec" id="regions"><h2>Pre-Fall 27 by region</h2>{reg}</section>')


OUT = {'regions.html': hub(), 'resort-27.html': resort(), 'pre-fall-27.html': prefall()}
for r in RD.REGIONS:
    OUT[f'region-{r["slug"]}.html'] = region_page(r)
for fn, body in OUT.items():
    title = RD.PAGES[fn][0]
    open('../' + fn, 'w').write(head(title, 'hub') + body + NAVJS + FOOT)
print('regions ok', len(OUT))
