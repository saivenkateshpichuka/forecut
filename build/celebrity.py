"""Write ../celebrity-style.html (Celebrity Style Watch) from celebrity_data.py, in the shared Forecut page style."""
import html, json, re, os, urllib.parse
import celebrity_data as C
import regions_data as RG

src = open('legal.py').read()
ns = {}; exec(src.split('\nP = ')[0], ns)
HEAD, FOOT = ns['HEAD'], ns['FOOT']
E = html.escape
IM = set(json.load(open('images.json')))
def slug(s): return re.sub(r'[^a-z]+', '-', s.lower()).strip('-')
def pick(c): return next((x for x in c if x in IM or os.path.exists(f'../img/{x}.webp')), None)
RN = {r['slug']: r['name'] for r in RG.REGIONS}
CSS = '''<style>
.wrap.c{max-width:900px}
.chero{margin:18px 0 8px;border-radius:12px;overflow:hidden;background:var(--grid);aspect-ratio:16/8}
.chero img{width:100%;height:100%;object-fit:cover;display:block}
.cnote{font-size:13.5px;color:var(--muted);margin:6px 0 0}
.wk{background:var(--paper-2);border:1px solid var(--grid);border-radius:12px;padding:18px 22px;margin:22px 0}
.wk h2{margin-top:0}
.rf{display:flex;gap:8px;flex-wrap:wrap;margin:18px 0 6px}
.rf a{font:600 13px "DM Sans",sans-serif;text-decoration:none;color:var(--ink);border:1px solid var(--grid);border-radius:99px;padding:6px 12px;background:var(--paper-2)}
.ev{border-top:1px solid var(--grid);padding:22px 0 8px}
.ev .k{font:600 12px "DM Sans",sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--chalk)}
.ev h3{font:700 22px/1.3 "DM Sans",sans-serif;margin:6px 0 2px}
.ev .pl{font-size:14px;color:var(--muted);font-family:"DM Sans",sans-serif;margin:0 0 10px}
.ev ul{list-style:none;padding:0} .ev li{margin:8px 0}
.ev li b{font-family:"DM Sans",sans-serif}
.ev .dz{font:600 13px "DM Sans",sans-serif;color:var(--muted)}
.rd{background:var(--chalk-soft);border-radius:10px;padding:12px 16px;margin:10px 0}
.chips{display:flex;gap:10px;flex-wrap:wrap;margin:10px 0}
.chip{display:flex;align-items:center;gap:8px;text-decoration:none;color:var(--ink);border:1px solid var(--grid);border-radius:10px;padding:4px 10px 4px 4px;background:var(--paper-2);font:600 13px "DM Sans",sans-serif}
.chip img{width:38px;height:38px;border-radius:7px;object-fit:cover;display:block}
.chip.n{padding:8px 10px}
.srcs{font-size:13.5px;color:var(--muted);font-family:"DM Sans",sans-serif}
</style>'''

def chip(n):
    s = slug(n); im = s if s in IM else None
    href = 'search.html?q=' + urllib.parse.quote(n)
    if im: return f'<a class="chip" href="{href}"><img src="img/{im}.webp" alt="{E(n)} (Forecut illustration)" loading="lazy" width="38" height="38">{E(n)}</a>'
    return f'<a class="chip n" href="{href}">{E(n)}</a>'

def event(e):
    looks = ''.join(f'<li><b>{E(n)}</b>' + (f' <span class="dz">· {E(d)}</span>' if d else '') + f'<br>{E(w)}</li>' for n, d, w in e['looks'])
    srcs = ' · '.join(f'<a href="{E(u)}" rel="nofollow noopener" target="_blank">{E(s)}</a>' for s, u in e['src'])
    return (f'<section class="ev" id="{E(e["id"])}" data-region="{e["region"]}"><div class="k">{E(RN.get(e["region"], e["region"]))} · {E(e["date"])}</div>'
            f'<h3>{E(e["event"])}</h3><p class="pl">{E(e["place"])}</p><ul>{looks}</ul>'
            f'<div class="rd"><b>Forecut read:</b> {E(e["read"])}</div>'
            f'<div class="chips">{"".join(chip(d) for d in e["details"])}</div>'
            f'<p class="srcs">Sources: {srcs}. <a href="region-{e["region"]}.html">{E(RN.get(e["region"], ""))} forecast →</a></p></section>')

hero = pick(C.HERO)
regions = [r for r in RN if any(e['region'] == r for e in C.EVENTS)]
body = ('<p class="eb">Celebrity Style Watch</p><h1>Celebrity style, read as trend signals</h1>'
        '<p class="lead">Every week Forecut tracks red carpets, premieres, award shows and celebrity weddings across six regions, '
        'records who wore what and by whom, and links each look to the trend details it confirms.</p>'
        f'<p class="meta">Updated {E(C.UPDATED)} · {len(C.EVENTS)} events · {sum(len(e["looks"]) for e in C.EVENTS)} looks</p>'
        + (f'<div class="chero"><img src="img/{hero}.webp" alt="Illustration of an evening gown on a dress form (Forecut image)" width="800" height="400"></div>'
           '<p class="cnote">Forecut illustration. We do not publish celebrity or red-carpet photographs; follow the source links to see the original looks.</p>' if hero else '')
        + '<div class="wk"><h2>This week in celebrity style</h2><ul>' + ''.join(f'<li>{E(x)}</li>' for x in C.THIS_WEEK) + '</ul></div>'
        + ''.join(f'<div class="wk"><h2>Week of {E(w)}</h2><ul>' + ''.join(f'<li>{E(x)}</li>' for x in b) + '</ul></div>' for w, b in getattr(C, 'WEEKS', []))
        + '<div class="rf">' + ''.join(f'<a href="#r-{r}">{E(RN[r])}</a>' for r in regions) + '</div>'
        + ''.join(f'<div id="r-{r}"></div>' + ''.join(event(e) for e in C.EVENTS if e['region'] == r) for r in regions)
        + C.GUIDE)
h = HEAD.format(title=E('Celebrity Style Watch · Forecut')).replace('</style></head>', '</style>' + CSS + '</head>', 1).replace('<div class="wrap">', '<div class="wrap c">', 1)
open('../' + C.FILE, 'w').write(h + body + FOOT)
print('celebrity ok', len(C.EVENTS))
