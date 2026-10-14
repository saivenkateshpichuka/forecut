"""Write the Couture, Fabrics and Colour hubs (couture.html, fabrics.html, colour.html) and their article pages."""
import html, json, sys
sys.path.insert(0, '.')
import hubs_data as H
import india_data as I
import pantone as PT
import credits as CR
import fabrics_live as FL
src = open('legal.py').read(); ns = {}; exec(src.split('\nP = ')[0], ns)
HEAD, FOOT = ns['HEAD'], ns['FOOT']
E = html.escape
IMGS = set(json.load(open('images.json')))
S = json.load(open('seasons.json'))

CSS = '''<style>
.wrap.hub{max-width:1120px}.wrap.art{max-width:860px}
.hhero{margin:22px 0 10px;border-radius:14px;overflow:hidden;aspect-ratio:21/9;background:var(--grid);position:relative}
.hhero img{width:100%;height:100%;object-fit:cover;object-position:50% 30%;display:block}
.jump{display:flex;gap:8px;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;justify-content:flex-start!important;margin:18px 0 6px;position:sticky;top:0;z-index:5;background:var(--paper);padding:10px 0!important}.jump::-webkit-scrollbar{display:none}.jump a{flex:none}
.jump a{font:600 13.5px "DM Sans",sans-serif;text-decoration:none;color:var(--ink);border:1px solid var(--grid);border-radius:99px;padding:7px 14px;background:var(--paper-2)}
.jump a:hover{border-color:var(--ink)}
.sec{margin-top:54px;scroll-margin-top:70px}
.sec>h2{font:700 clamp(24px,3.4vw,32px)/1.15 "DM Sans",sans-serif;letter-spacing:-.02em;margin:0 0 6px}
.sec>p.sub{font-size:16.5px;color:var(--muted);margin:0 0 18px;max-width:720px}
.g3{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:18px}
.g4{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:14px}
.card{background:var(--paper-2);border:1px solid var(--grid);border-radius:14px;overflow:hidden;display:flex;flex-direction:column}
.card .ph{aspect-ratio:4/3;background:var(--grid);overflow:hidden}.card .ph img{width:100%;height:100%;object-fit:cover;object-position:50% 25%;display:block}
.card .in{padding:16px 18px 18px}.card h3{font:700 20px/1.25 "DM Sans",sans-serif;margin:0 0 6px}
.card p,.card li{font-size:15.5px;line-height:1.55;margin:0}.card ul{margin:10px 0 0;padding-left:18px}.card li{margin:4px 0}
.mini{background:var(--paper-2);border:1px solid var(--grid);border-radius:12px;padding:16px 18px}
.mini b{display:block;font:700 16.5px "DM Sans",sans-serif;margin-bottom:4px}.mini p{font-size:15px;line-height:1.5;margin:0;color:var(--ink)}
.mini .sw{height:110px;border-radius:9px;margin:-4px -6px 12px;overflow:hidden;background:var(--grid)}.mini .sw img,.mini .sw svg{width:100%;height:100%;object-fit:cover;display:block}
.theme{border-left:3px solid var(--chalk);padding:4px 0 4px 18px}.theme b{font:700 19px "DM Sans",sans-serif}.theme p{margin:4px 0 0;font-size:16px}
.chips{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 14px}.chips button{all:unset;cursor:pointer;font:600 13.5px "DM Sans",sans-serif;border:1px solid var(--grid);border-radius:99px;padding:7px 14px;background:var(--paper-2)}
.chips button[aria-pressed="true"]{background:var(--ink);color:var(--paper);border-color:var(--ink)}
.fsearch{width:100%;max-width:360px;font:15px "DM Sans",sans-serif;padding:10px 14px;border:1px solid var(--grid);border-radius:10px;background:var(--paper-2);color:var(--ink);margin:0 0 12px}
.lib{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px}
.fab{background:var(--paper-2);border:1px solid var(--grid);border-radius:12px;padding:14px 16px}
.fab b{font:700 17px "DM Sans",sans-serif}.fab .t{font:700 10.5px "DM Sans",sans-serif;letter-spacing:.1em;text-transform:uppercase;color:var(--chalk);margin-left:6px}
.fab dl{display:grid;grid-template-columns:auto 1fr;gap:3px 10px;margin:10px 0 0;font:14px/1.45 "DM Sans",sans-serif}.fab dt{color:var(--muted)}.fab dd{margin:0}
.pal{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;margin-bottom:30px}
.swc{all:unset;cursor:pointer;background:var(--paper-2);border:1px solid var(--grid);border-radius:12px;overflow:hidden;display:block}
.swc i{display:block;height:96px}.swc span{display:block;padding:9px 11px;font:13px/1.4 "DM Sans",sans-serif}.swc span b{display:block;font-size:14.5px}
.swc:hover{border-color:var(--ink)}.swc.ok span:after{content:"Copied";color:var(--chalk);font-weight:700;display:block}
.palhead{display:flex;justify-content:space-between;align-items:baseline;gap:10px;margin:22px 0 10px}.palhead h3{font:700 20px "DM Sans",sans-serif;margin:0}.palhead a{font:600 13.5px "DM Sans",sans-serif;color:var(--muted)}
.acard{text-decoration:none;color:inherit;display:grid;gap:8px}
.acard .ph{aspect-ratio:4/3;border-radius:10px;overflow:hidden;background:var(--grid)}.acard img{width:100%;height:100%;object-fit:cover;object-position:50% 25%;display:block;transition:transform .5s}
.acard:hover img{transform:scale(1.04)}.acard b{font:700 19px/1.3 "DM Sans",sans-serif}.acard .d{font-family:"Source Serif 4",Georgia,serif;font-size:15.5px;color:var(--muted);line-height:1.5}
.acard small{font:600 11.5px "DM Sans",sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--chalk)}
.jtag{display:inline-block;font:700 11.5px "DM Sans",sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#fff;background:var(--chalk);padding:4px 10px;border-radius:99px}
.jmeta{font-size:14px;color:var(--muted);margin:6px 0 0}.jhero{margin:18px 0 8px;border-radius:12px;overflow:hidden;background:var(--grid);aspect-ratio:16/9}.jhero img{width:100%;height:100%;object-fit:cover;object-position:50% 25%;display:block}
article p,article li{font-size:17.5px;line-height:1.75}article h2{font:700 25px/1.25 "DM Sans",system-ui,sans-serif;letter-spacing:-.01em;margin:38px 0 10px}
.ctab{background:var(--mat);color:var(--mat-ink);border-radius:12px;padding:20px 22px;margin:34px 0 10px;font-size:17px}.ctab a{color:var(--mat-ink);font-weight:700}
.more h3{font:600 22px "DM Sans",sans-serif;margin:48px 0 14px}
.ph.ph0{display:grid;place-items:center;background:radial-gradient(circle at 30% 20%,#f3ece2,#d9ccb9 70%);position:relative}
.ph.ph0 em{font:italic 500 clamp(22px,2.6vw,30px)/1.15 "Source Serif 4",Georgia,serif;color:#5e5348;text-align:center;padding:0 18px}
.news{display:grid;gap:14px}.nw{display:grid;grid-template-columns:130px 1fr;gap:18px;background:var(--paper-2);border:1px solid var(--grid);border-radius:12px;padding:16px 18px}
.nw time{font:700 12px "DM Sans",sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--chalk);padding-top:4px}
.nw b{display:block;font:700 18px/1.3 "DM Sans",sans-serif;margin-bottom:4px}.nw p{margin:0;font-size:15.5px;line-height:1.55}
.nw .src{font:13px "DM Sans",sans-serif;color:var(--muted);margin-top:6px}.nw .src a{color:var(--muted)}
.cal{display:grid;gap:0;border:1px solid var(--grid);border-radius:12px;overflow:hidden;background:var(--paper-2)}
.cal div{display:grid;grid-template-columns:130px 220px 1fr;gap:14px;padding:12px 16px;border-bottom:1px solid var(--grid);font:15px/1.45 "DM Sans",sans-serif}.cal div:last-child{border:0}
.cal b{color:var(--chalk)}
@media (max-width:760px){.nw{grid-template-columns:1fr;gap:4px}.cal div{grid-template-columns:1fr;gap:2px}}
'''+'</style><style>'+CR.CSS+'</style>'+'''<style>@media (max-width:760px){.hhero{aspect-ratio:4/3}.g3,.lib{grid-template-columns:1fr}}
</style>'''


def head(title, cls):
    h = HEAD.format(title=E(title)).replace('</style></head>', '</style>' + CSS + '</head>', 1)
    return h.replace('<div class="wrap">', f'<div class="wrap {cls}">', 1)


import os
def pick(c):
    for s in c:
        if s in IMGS or os.path.exists(f'../img/{s}.webp'): return s
    return None


def im(c, alt, cls='ph', eager=False):
    s = pick(c)
    if not s: return f'<div class="{cls} ph0"><em>{E(alt)}</em></div>'
    return f'<div class="{cls}"><img src="img/{s}.webp" alt="{E(alt)}" {"" if eager else "loading=\"lazy\""} width="800" height="600"></div>'


def block(b):
    k = b[0]
    if k == 'p': return f'<p>{b[1]}</p>'
    if k == 'h2': return f'<h2>{E(b[1])}</h2>'
    if k == 'ul': return '<ul>' + ''.join(f'<li>{x}</li>' for x in b[1]) + '</ul>'
    if k == 'cta': return f'<div class="ctab">{b[1]}</div>'
    raise ValueError(k)


def acard(a):
    return f'<a class="acard" href="{a["slug"]}.html">{im(a["img"], a["title"])}<small>{E(a["tag"])} · {a["read"]} min read</small><b>{E(a["title"])}</b><span class="d">{E(a["desc"])}</span></a>'


def weave_svg(kind):
    w, c1, c2 = 12, '#1c1714', '#e9e1d5'
    cells = []
    for y in range(10):
        for x in range(16):
            if kind == 'plain': up = (x + y) % 2 == 0
            elif kind == 'twill': up = (x + y) % 4 < 2
            elif kind == 'satin': up = (x * 2 + y * 3) % 5 == 0
            elif kind == 'basket': up = ((x // 2) + (y // 2)) % 2 == 0
            elif kind == 'dobby': up = ((x % 4 in (1, 2)) and (y % 4 in (1, 2))) ^ ((x + y) % 2 == 0)
            elif kind == 'jacq': up = ((x - 8) ** 2 + (y - 5) ** 2) % 7 < 3
            elif kind == 'leno': up = x % 3 == 0 or y % 3 == 0
            else: up = True
            if up: cells.append(f'<rect x="{x * w}" y="{y * w}" width="{w - 1}" height="{w - 1}" fill="{c1 if kind != "satin" else "#b4532a"}"/>')
    if kind == 'pile':
        cells = [f'<path d="M{x * 12 + 6} 120 v-{40 + (x * 37) % 30}" stroke="#6e1f33" stroke-width="7" stroke-linecap="round"/>' for x in range(16)]
    bg = '#f5f0e8' if kind != 'satin' else '#d98d6b'
    return f'<svg viewBox="0 0 192 120" preserveAspectRatio="xMidYMid slice"><rect width="192" height="120" fill="{bg}"/>{"".join(cells)}</svg>'


NAVJS = '''<script>
document.querySelectorAll('.swc').forEach(function(b){b.addEventListener('click',function(){var t=b.getAttribute('data-c');try{navigator.clipboard.writeText(t)}catch(e){}b.classList.add('ok');setTimeout(function(){b.classList.remove('ok')},1400)})});
(function(){var q=document.getElementById('fq'),bs=document.querySelectorAll('#fchips button'),g='All';function f(){var v=(q&&q.value||'').toLowerCase();document.querySelectorAll('.fab').forEach(function(c){var ok=(g==='All'||c.getAttribute('data-g').indexOf(g)>-1)&&c.textContent.toLowerCase().indexOf(v)>-1;c.style.display=ok?'':'none'})}
bs.forEach(function(b){b.onclick=function(){g=b.textContent;bs.forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});f()}});if(q)q.oninput=f})();
</script>'''


def hub_top(h, jumps):
    return (f'<p class="eb">{E(h["eb"])}</p><h1>{E(h["title"])}</h1><p class="lead">{E(h["lead"])}</p>'
            + (f'<div class="hhero"><img src="img/{pick(h["hero"])}.webp" alt="{E(h["title"])}" width="1600" height="686" fetchpriority="high" style="object-position:{h.get('hero_pos', '50% 30%')}"></div>' + CR.cap(pick(h['hero'])) if pick(h['hero']) else '') +
            '<nav class="jump" aria-label="On this page">' + ''.join(f'<a href="#{a}">{E(b)}</a>' for a, b in jumps) + '</nav>')


def articles_sec(h, title='Articles'):
    return f'<section class="sec" id="articles"><h2>{title}</h2><p class="sub">Guides and analysis from the Forecut editorial team.</p><div class="g3">{"".join(acard(a) for a in h["articles"])}</div></section>'


def news(items):
    return '<div class="news">' + ''.join(f'<div class="nw"><time>{E(d)}</time><div><b>{E(t)}</b><p>{E(p)}</p><p class="src">Source: ' + ', '.join(f'<a href="{u}" rel="noopener" target="_blank">{E(n)}</a>' for n, u in src) + '</p></div></div>' for d, t, p, src in items) + '</div>'


def minis(items):
    return '<div class="g4">' + ''.join(f'<div class="mini"><b>{E(x[0])}</b>' + (f'<p style="color:var(--chalk);font:600 12.5px DM Sans,sans-serif;margin-bottom:4px">{E(x[1])}</p><p>{E(x[2])}</p>' if len(x) == 3 else f'<p>{E(x[1])}</p>') + '</div>' for x in items) + '</div>'


def build_couture(h):
    at = ''.join(f'<div class="card">{im(a["img"], a["k"])}<div class="in"><h3>{E(a["k"])}</h3><p>{E(a["p"])}</p><ul>{"".join(f"<li>{E(x)}</li>" for x in a["li"])}</ul></div></div>' for a in h['ateliers'])
    th = ''.join(f'<div class="theme"><b>{E(a)}</b><p>{E(b)}</p></div>' for a, b in h['themes'])
    te = ''.join(f'<div class="mini">{im(c, a, "sw") if pick(c) else ""}<b>{E(a)}</b><p>{E(b)}</p></div>' for a, b, c in h['techniques'])
    inn = ''.join(f'<div class="mini"><b>{E(a)}</b><p>{E(b)}</p></div>' for a, b in h['innov'])
    cal = '<div class="cal">' + ''.join(f'<div><b>{E(a)}</b><span style="font-weight:700">{E(b)}</span><span>{E(c)}</span></div>' for a, b, c in h['calendar']) + '</div>'
    feat = h['articles'][:2]
    return (hub_top(h, [('news', 'Couture news'), ('capitals', 'Couture worldwide'), ('calendar', 'Calendar'), ('wear', 'Couture wear'), ('ateliers', 'Women · Men · Kids'), ('themes', 'Themes'), ('techniques', 'Techniques'), ('innovations', 'Innovations'), ('articles', 'Articles')]) +
            f'<section class="sec" id="news"><h2>Couture news</h2><p class="sub">The latest from the world\'s couture runways, summarised by Forecut with links to the original coverage.</p>{news(h["news"])}<div class="g3" style="margin-top:22px">{"".join(acard(a) for a in feat)}</div></section>'
            f'<section class="sec" id="capitals"><h2>Couture around the world</h2><p class="sub">Each couture capital has its own strengths, clients and craft.</p>{minis(h["capitals"])}</section>'
            f'<section class="sec" id="calendar"><h2>The couture calendar</h2><p class="sub">When couture is shown and when demand peaks. Dates vary by year.</p>{cal}</section>'
            f'<section class="sec" id="wear"><h2>Explore couture wear</h2><p class="sub">The full scope of couture, from red-carpet gowns to kids\' occasion wear.</p>{minis(h["wear"])}</section>'
            f'<section class="sec" id="ateliers"><h2>Three ateliers: women, men and kids</h2><p class="sub">What defines each, and where it is heading.</p><div class="g3">{at}</div></section>'
            f'<section class="sec" id="themes"><h2>Couture themes for the coming wedding seasons</h2><p class="sub">Forecut\'s story directions for bridal and occasion couture, 2026–27.</p><div class="g3" style="gap:22px">{th}</div></section>'
            f'<section class="sec" id="techniques"><h2>Couture techniques</h2><p class="sub">The hand techniques behind couture, from Indian embroidery to Paris atelier crafts.</p><div class="g4">{te}</div></section>'
            f'<section class="sec" id="innovations"><h2>New innovations</h2><p class="sub">How the atelier is changing.</p><div class="g4">{inn}</div></section>'
            + articles_sec(h, 'Couture articles & storytelling'))


FCSS = """<style>
.live{display:flex;gap:10px;flex-wrap:wrap;margin:14px 0 4px}.live a{display:flex;gap:8px;align-items:center;text-decoration:none;color:var(--ink);background:var(--paper-2);border:1px solid var(--grid);border-radius:99px;padding:6px 14px 6px 6px;font:500 14px/1.3 "DM Sans",sans-serif}
.live a b{font:700 11px "DM Sans",sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#fff;background:var(--chalk);border-radius:99px;padding:4px 9px;flex:none}
.live a:first-child b{background:#c4302b}.live a:first-child b:before{content:"";display:inline-block;width:7px;height:7px;border-radius:50%;background:#fff;margin-right:6px;vertical-align:1px;animation:blink 1.4s infinite}
@keyframes blink{50%{opacity:.25}}.upd{font:600 12.5px "DM Sans",sans-serif;color:var(--muted);letter-spacing:.04em}
.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:0 0 18px}.kpi{background:var(--paper-2);border:1px solid var(--grid);border-radius:12px;padding:14px 16px}
.kpi b{display:block;font:700 30px/1 "DM Sans",sans-serif}.kpi span{font:600 12.5px "DM Sans",sans-serif;letter-spacing:.06em;text-transform:uppercase}
.st-e{--c:#2f7d5b}.st-r{--c:#c8691c}.st-p{--c:#b4532a}.st-f{--c:#8a8178}.kpi b,.lane h3{color:var(--c)}
.stabs{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;margin:0 0 14px}.stabs::-webkit-scrollbar{display:none}
.stabs button{all:unset;cursor:pointer;flex:none;font:600 14px "DM Sans",sans-serif;border:1px solid var(--grid);border-radius:10px;padding:9px 14px;background:var(--paper-2);text-align:center}
.stabs button small{display:block;font:500 11.5px "DM Sans",sans-serif;color:var(--muted)}.stabs button[aria-pressed="true"]{background:var(--ink);color:var(--paper);border-color:var(--ink)}.stabs button[aria-pressed="true"] small{color:var(--paper)}
.board{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.lane{background:var(--paper-2);border:1px solid var(--grid);border-radius:12px;padding:12px;border-top:4px solid var(--c)}
.lane h3{font:700 15px "DM Sans",sans-serif;margin:2px 4px 10px;display:flex;justify-content:space-between}.lane h3 i{font-style:normal;color:var(--muted)}
.ft{display:grid;grid-template-columns:48px 1fr;gap:10px;align-items:center;padding:7px 4px;border-top:1px solid var(--grid)}.ft:first-of-type{border-top:0}
.ft .th{width:48px;height:48px;border-radius:8px;overflow:hidden;background:var(--grid)}.ft .th img{width:100%;height:100%;object-fit:cover;object-position:50% 25%;display:block}
.ft .th.no{display:grid;place-items:center;font:700 15px "DM Sans",sans-serif;color:var(--c);background:color-mix(in srgb,var(--c) 12%,transparent)}
.ft b{display:block;font:600 14.5px/1.25 "DM Sans",sans-serif}.ft small{font:12px "DM Sans",sans-serif;color:var(--muted)}
.lc{display:flex;gap:3px;margin-top:4px}.lc i{width:16px;height:5px;border-radius:3px;background:var(--grid)}.lc i.e{background:#2f7d5b}.lc i.r{background:#c8691c}.lc i.p{background:#b4532a}.lc i.f{background:#8a8178}.lc i.now{outline:1.5px solid var(--ink);outline-offset:1px}
.ft.more{display:none}.lane.open .ft.more{display:grid}.lane .sa{all:unset;cursor:pointer;display:block;text-align:center;font:600 13px "DM Sans",sans-serif;color:var(--chalk);padding:8px 0 2px}
.lane .none{font:14px "DM Sans",sans-serif;color:var(--muted);padding:6px 4px}.spanel[hidden]{display:none}
.spanel .lead2{font-size:15.5px;color:var(--muted);margin:0 0 12px}.spanel .lead2 a{color:var(--ink);font-weight:600}
.rw{display:grid;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));gap:18px}.rw .card .tagl{display:flex;justify-content:space-between;align-items:center;font:700 11.5px "DM Sans",sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--chalk);margin-bottom:4px}
.rw .card .tagl em{font-style:normal;color:#fff;background:var(--ink);border-radius:99px;padding:3px 9px}.rw .card .tagl em.live{background:#c4302b}
.read{margin-top:12px;background:var(--mat);color:var(--mat-ink);border-radius:10px;padding:10px 12px;font:14.5px/1.5 "DM Sans",sans-serif}.read b{display:block;font:700 11px "DM Sans",sans-serif;letter-spacing:.08em;text-transform:uppercase;margin-bottom:2px}
.srcs{font:12.5px "DM Sans",sans-serif;color:var(--muted);margin-top:10px}.srcs a{color:var(--muted)}
.fair{display:grid;grid-template-columns:120px 1fr;gap:18px;background:var(--paper-2);border:1px solid var(--grid);border-radius:12px;padding:16px 18px}
.fairs{display:grid;gap:12px}.fair time{font:700 12px "DM Sans",sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--chalk)}.fair time span{display:inline-block;margin-top:6px;color:var(--ink);border:1px solid var(--grid);border-radius:99px;padding:3px 8px;letter-spacing:.04em}
.fair h3{font:700 18px "DM Sans",sans-serif;margin:0 0 6px}.fair ul{margin:0;padding-left:18px;font-size:15px;line-height:1.55}
.radar{border:1px solid var(--grid);border-radius:12px;overflow:hidden;background:var(--paper-2)}.rrow{display:grid;grid-template-columns:1.3fr 1.6fr 1.1fr 90px;gap:14px;padding:13px 16px;border-top:1px solid var(--grid);align-items:center;font:14.5px/1.45 "DM Sans",sans-serif}
.rrow:first-child{border-top:0}.rrow.h{font:700 11.5px "DM Sans",sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);background:var(--paper)}.rrow b{font-size:15.5px}.rrow a{color:var(--muted);font-size:12.5px}
.stage{display:flex;gap:3px}.stage i{flex:1;height:7px;border-radius:4px;background:var(--grid)}.stage i.on{background:var(--chalk)}.stage+small{font:600 12px "DM Sans",sans-serif;color:var(--chalk)}
.isig{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px}.isig .mini span{font:700 11px "DM Sans",sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#fff;background:var(--c);border-radius:99px;padding:3px 9px;margin-right:6px}.isig .mini small{font:600 12.5px "DM Sans",sans-serif;color:var(--muted)}
.ref details{background:var(--paper-2);border:1px solid var(--grid);border-radius:12px;margin:10px 0;padding:0 18px}.ref summary{cursor:pointer;font:700 17px "DM Sans",sans-serif;padding:15px 0;list-style:none;display:flex;justify-content:space-between}.ref summary::-webkit-details-marker{display:none}
.ref summary:after{content:"+";font-weight:400;font-size:22px;line-height:1}.ref details[open] summary:after{content:"–"}.ref details>div{padding:0 0 18px}.ref summary small{font:500 13px "DM Sans",sans-serif;color:var(--muted);margin-left:auto;margin-right:14px;align-self:center}
.rname{display:grid;grid-template-columns:72px 1fr;gap:12px;align-items:center;text-decoration:none;color:var(--ink)}.rname em{display:block;font:600 12.5px "DM Sans",sans-serif;font-style:normal;color:var(--chalk);margin-top:2px}.rname:hover b{text-decoration:underline}
.rth{width:72px;height:54px;border-radius:8px;overflow:hidden;background:var(--grid)}.rth img{width:100%;height:100%;object-fit:cover;display:block}.rth.ph0 em{font-size:9px!important;padding:0 4px!important;line-height:1.1!important}
.radarmini .mini .sw{height:150px}.radarmini .sw.ph0 em{font-size:15px!important}
@media (max-width:900px){.board{grid-template-columns:1fr 1fr}}
@media (max-width:760px){.kpis{grid-template-columns:1fr 1fr}.board{grid-template-columns:1fr}.fair{grid-template-columns:1fr;gap:6px}.rrow{grid-template-columns:1fr;gap:6px}.rrow.h{display:none}.rw{grid-template-columns:1fr}.live a{font-size:13px}}
</style>"""

FJS = """<script>(function(){var bs=document.querySelectorAll('.stabs button');bs.forEach(function(b){b.onclick=function(){bs.forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});document.querySelectorAll('.spanel').forEach(function(p){p.hidden=p.id!==b.dataset.s})}});
document.querySelectorAll('.lane .sa').forEach(function(b){b.onclick=function(){var l=b.closest('.lane');l.classList.toggle('open');b.textContent=l.classList.contains('open')?'Show fewer':b.dataset.t}})})();</script>"""

STN = {'e': 'Emerging', 'r': 'Rising', 'p': 'Peaking', 'f': 'Fading'}


def _islug(x): return ''.join(ch.lower() if ch.isalnum() else '-' for ch in x).strip('-').replace('--', '-').replace('--', '-')


def fabric_items():
    D = json.load(open('details.json'))
    return [(d, c, x) for (d, c) in D['order'] for x in D['model'][f'{d}|{c}'] if x['area'] in ('Fabric', 'Material')]


def forecast_board():
    its = fabric_items(); seasons = S['seasons']; default = 'ss27'
    tabs = ''.join(f'<button type="button" data-s="fs-{s}" aria-pressed="{"true" if s == default else "false"}">{E(S["meta"][s]["code"])}<small>{E(S["meta"][s].get("stage", ""))}</small></button>' for s in seasons)
    panels = ''
    for si, s in enumerate(seasons):
        m = S['meta'][s]; lanes = ''
        cnt = {k: sum(x['life'][si] == k for _, _, x in its) for k in 'erpf'}
        for st in 'erpf':
            rows = [(d, c, x) for d, c, x in its if x['life'][si] == st]
            cards = ''
            for i, (d, c, x) in enumerate(rows):
                sl = _islug(x['name']); first = next(j for j, ch in enumerate(x['life']) if ch != '-')
                fn = sl if si == first else f'{sl}-{s}'
                p = pick([fn + '-photo', fn, sl + '-photo', sl])
                th = f'<div class="th"><img src="img/{p}.webp" alt="" loading="lazy" width="48" height="48"></div>' if p else f'<div class="th no">{E(x["name"][0])}</div>'
                lc = ''.join(f'<i class="{ch if ch != "-" else ""}{" now" if j == si else ""}" title="{E(S["meta"][seasons[j]]["code"])}: {STN.get(ch, "not tracked")}"></i>' for j, ch in enumerate(x['life']))
                cards += f'<div class="ft{" more" if i >= 6 else ""}">{th}<div><b>{E(x["name"])}</b><small>{E(d)} · {E(c)}</small><div class="lc" aria-label="Lifecycle AW26 to AW28">{lc}</div></div></div>'
            more = f'<button class="sa" type="button" data-t="Show all {len(rows)}">Show all {len(rows)}</button>' if len(rows) > 6 else ''
            lanes += f'<div class="lane st-{st}"><h3>{STN[st]} <i>{len(rows)}</i></h3>{cards or "<p class=none>None this season</p>"}{more}</div>'
        kp = ''.join(f'<div class="kpi st-{k}"><b>{cnt[k]}</b><span>{STN[k]}</span></div>' for k in 'erpf')
        panels += (f'<div class="spanel" id="fs-{s}"{"" if s == default else " hidden"}><p class="lead2"><b>{E(m["code"])} · {E(m.get("title", ""))}</b> · {E(m.get("window", ""))} · '
                   f'{"Based on runway and trade research" if m.get("basis") == "research" else "Forecut projection, updated as runways arrive"}. <a href="{s}.html">Full {E(m["code"])} report →</a></p>'
                   f'<div class="kpis">{kp}</div><div class="board">{lanes}</div></div>')
    return f'<div class="stabs" role="group" aria-label="Season">{tabs}</div>{panels}'


def runway_cards():
    out = ''
    for r in FL.RUNWAY:
        live = r['status'] == 'Live'
        out += (f'<div class="card">{im(r["img"], r["city"] + " " + r["head"])}<div class="in"><div class="tagl">{E(r["city"])} · {E(r["dates"])}<em class="{"live" if live else ""}">{"Live" if live else E(r["status"])}</em></div>'
                f'<h3>{E(r["head"])}</h3><ul>{"".join(f"<li>{E(x)}</li>" for x in r["fabrics"])}</ul><div class="read"><b>Forecut read</b>{E(r["read"])}</div>'
                f'<p class="srcs">Source: {", ".join(f"<a href=\"{u}\" rel=\"noopener\" target=\"_blank\">{E(n)}</a>" for n, u in r["src"])}</p></div></div>')
    return f'<div class="rw">{out}</div>'


def fair_rows():
    return '<div class="fairs">' + ''.join(
        f'<div class="fair"><time>{E(d)}<br><span>{E(sea)}</span></time><div><h3>{E(n)}</h3><ul>{"".join(f"<li>{E(x)}</li>" for x in sig)}</ul>'
        f'<div class="read"><b>Forecut read</b>{E(rd)}</div><p class="srcs">Source: {", ".join(f"<a href=\"{u}\" rel=\"noopener\" target=\"_blank\">{E(a)}</a>" for a, u in src)}</p></div></div>'
        for d, n, sea, sig, rd, src in FL.FAIRS) + '</div>'


def radar_table():
    rows = '<div class="rrow h"><span>Innovation</span><span>What it is</span><span>Market readiness</span><span>In stores</span></div>'
    for n, w, st, hz, src in FL.RADAR:
        k = FL.STAGES.index(st)
        bar = '<div class="stage">' + ''.join(f'<i class="{"on" if j <= k else ""}"></i>' for j in range(len(FL.STAGES))) + f'</div><small>{E(st)}</small>'
        sl = FL.INNOV_SLUGS.get(n); th = im([f'hub-fabrics-inn-{FL._islug(n)}'], n, 'rth ph')
        name = f'<a class="rname" href="{sl}.html">{th}<span><b>{E(n)}</b><em>Read report →</em></span></a>' if sl else f'<b>{E(n)}</b>'
        rows += f'<div class="rrow">{name}<span>{E(w)} <a href="{src[1]}" rel="noopener" target="_blank">{E(src[0])}</a></span><div>{bar}</div><span style="font-weight:700">{E(hz)}</span></div>'
    return f'<div class="radar">{rows}</div>'


def india_sig():
    sc = {'Emerging': 'e', 'Rising': 'r', 'Peaking': 'p', 'Fading': 'f'}
    return '<div class="isig">' + ''.join(f'<div class="mini st-{sc[st]}"><b>{E(n)}</b><p style="margin:2px 0 8px"><span>{E(st)}</span><small>{E(when)}</small></p><p>{E(t)}</p></div>' for n, st, when, t in FL.INDIA) + '</div>'


def build_fabrics(h):
    groups = ['All', 'Natural', 'Regenerated', 'Synthetic', 'Knit']
    lib = ''.join(f'<div class="fab" data-g="{E(g)}"><b>{E(n)}</b><span class="t">{E(g)}</span><dl><dt>Fibre</dt><dd>{E(fi)}</dd><dt>Build</dt><dd>{E(c)}</dd><dt>Weight</dt><dd>{E(w)}</dd><dt>Handle</dt><dd>{E(ha)}</dd><dt>Best for</dt><dd>{E(b)}</dd><dt>Care</dt><dd>{E(ca)}</dd></dl></div>'
                  for n, g, fi, c, w, ha, b, ca in h['library'])
    wv = ''.join(f'<div class="mini"><div class="sw">{weave_svg(k)}</div><b>{E(a)}</b><p>{E(b)}</p></div>' for a, k, b in h['weaves'])
    kn = ''.join(f'<div class="mini"><b>{E(a)}</b><p>{E(b)}</p></div>' for a, b in h['knits'])
    hl = ''.join(f'<div class="mini">{im(c, a, "sw") if pick(c) else ""}<b>{E(a)}</b><p>{E(b)}</p></div>' for a, b, c in h['handloom'])
    rm = lambda a, b: f'<div class="mini">{im(["hub-fabrics-radar-" + FL._islug(a)], a, "sw ph")}<b>{E(a)}</b><p>{E(b)}</p></div>'
    radar_more = '<div class="g4 radarmini">' + ''.join(rm(x[0], x[-1]) for x in h['upcoming'] + h['innov']) + '</div>'
    pr = minis(h['prints']); ef = minis(h['embfab']); hw = minis(h['handwork'])
    nlive = len(FL.ARTICLES) + 1
    fc = h['articles'][:nlive]
    inv = [a for a in h['articles'] if a.get('tag') == 'Innovation report']
    guides = [a for a in h['articles'][nlive:] if a.get('tag') != 'Innovation report']
    live = '<div class="live">' + ''.join(f'<a href="{u}"><b>{E(l)}</b>{E(t)}</a>' for l, t, u in FL.LIVE) + '</div>'
    ref = lambda i, t, sub, body: f'<details id="{i}"><summary>{t}<small>{sub}</small></summary><div>{body}</div></details>'
    top = hub_top(h, [('forecast', 'Fabric forecast'), ('runway', 'Runway fabrics'), ('india', 'India'), ('mills', 'Mills & fairs'), ('innovations', 'Innovation radar'), ('news', 'Fabric news'), ('articles', 'Reports'), ('reference', 'Reference')])
    top = top.replace('<div class="hhero">', f'<p class="upd">Live forecast · Updated {FL.UPDATED}</p>{live}<div class="hhero">', 1)
    return (FCSS + top +
            f'<section class="sec" id="forecast"><h2>Fabric forecast, season by season</h2><p class="sub">{len(fabric_items())} fabric and material trends tracked from AW26 to AW28. Pick a season to see what is emerging, rising, peaking and fading. The bars show each trend\'s full lifecycle.</p>{forecast_board()}</section>'
            f'<section class="sec" id="runway"><h2>Runway fabric watch</h2><p class="sub">The fabrics of the SS27 shows and India\'s fashion weeks, with Forecut\'s read on what reaches stores.</p>{runway_cards()}'
            '</section>'
            f'<section class="sec" id="india"><h2>India fabric signals</h2><p class="sub">Forecut\'s read on the fabrics moving in the Indian market, Festive 2026 to AW27.</p>{india_sig()}</section>'
            f'<section class="sec" id="mills"><h2>Mills & fabric fairs</h2><p class="sub">Fabric fairs show materials a year or more before stores. What the latest fairs signal.</p>{fair_rows()}</section>'
            f'<section class="sec" id="innovations"><h2>Innovation radar</h2><p class="sub">New fibres and finishes, rated by how close they are to your shelves.</p>{radar_table()}'
            f'<h3 style="font:700 19px DM Sans,sans-serif;margin:30px 0 12px">Innovation reports</h3><div class="g3">{"".join(acard(a) for a in inv)}</div>'
            f'<h3 style="font:700 19px DM Sans,sans-serif;margin:30px 0 12px">More on the radar</h3>{radar_more}</section>'
            f'<section class="sec" id="news"><h2>Fabric news</h2><p class="sub">The latest fibre, mill and runway news, summarised by Forecut with links to the original sources.</p>{news(h["news"])}</section>'
            f'<section class="sec" id="articles"><h2>Fabric reports</h2><p class="sub">Forecast reports and runway analysis from the Forecut team.</p><div class="g3">{"".join(acard(a) for a in fc)}</div></section>'
            f'<section class="sec ref" id="reference"><h2>Fabric reference</h2><p class="sub">Technical reference for designers and merchandisers: fabrics, weaves, knits, prints and crafts.</p>'
            + ref('library', 'Fabric library', f'{len(h["library"])} fabrics', '<input class="fsearch" id="fq" type="search" placeholder="Search fabrics, e.g. linen, satin, shirts" aria-label="Search fabrics"><div class="chips" id="fchips">'
                  + ''.join(f'<button type="button" aria-pressed="{"true" if g == "All" else "false"}">{g}</button>' for g in groups) + f'</div><div class="lib">{lib}</div>')
            + ref('weaves', 'Weave techniques', f'{len(h["weaves"])} weaves', f'<div class="g4">{wv}</div>')
            + ref('knits', 'Knit structures', f'{len(h["knits"])} knits', f'<div class="g4">{kn}</div>')
            + ref('prints', 'Prints & printing techniques', f'{len(h["prints"])} techniques', pr)
            + ref('embroidery', 'Embroidery fabrics', f'{len(h["embfab"])} bases', ef)
            + ref('handwork', 'Hand work & embroideries', f'{len(h["handwork"])} crafts', hw)
            + ref('handloom', 'Indian handlooms & textile crafts', f'{len(h["handloom"])} crafts', f'<div class="g4">{hl}</div>')
            + f'<h3 style="font:700 19px DM Sans,sans-serif;margin:26px 0 12px">Designer guides</h3><div class="g3">{"".join(acard(a) for a in guides)}</div></section>' + FJS)


def swatch(name, hx):
    code, tn, _ = PT.nearest(hx)
    return f'<button class="swc" type="button" data-c="{hx.upper()} · Pantone {code}" title="Copy {hx.upper()} and Pantone {code}"><i style="background:{hx}"></i><span><b>{E(name)}</b>{hx.upper()}<br>Pantone {code}</span></button>'


def build_colour(h):
    pals = ''
    for s in S['seasons']:
        m = S['meta'][s]
        pals += f'<div class="palhead"><h3>{E(m["code"])} · {E(m.get("title", ""))}</h3><a href="{s}.html">See {E(m["code"])} trends →</a></div><div class="pal">' + ''.join(swatch(n, hx) for hx, n in m['palette']) + '</div>'
    ind = ''
    for k, v in I.SEASON_INFO.items():
        if not v.get('colours'): continue
        ind += f'<div class="palhead"><h3>India · {E(k)}</h3><a href="india.html">See India trends →</a></div><div class="pal">' + ''.join(swatch(PT.nearest(hx)[1], hx) for hx in v['colours']) + '</div>'
    return (hub_top(h, [('palettes', 'Season palettes'), ('india', 'India palettes'), ('articles', 'Colour guides')]) +
            f'<section class="sec" id="palettes"><h2>Season palettes</h2><p class="sub">Tap any colour to copy its HEX and nearest Pantone TCX reference. Screen colours are approximate; approve against physical TCX standards.</p>{pals}</section>'
            f'<section class="sec" id="india"><h2>India palettes</h2><p class="sub">Festive and Summer colour directions for the Indian market. Names are the nearest Pantone TCX references.</p>{ind}</section>'
            + articles_sec(h, 'Colour guides'))


BUILD = {'couture.html': build_couture, 'fabrics.html': build_fabrics, 'colour.html': build_colour}
n = 0
for h in H.HUBS:
    body = BUILD[h['file']](h)
    open('../' + h['file'], 'w').write(head(h['seo'][0], 'hub') + body + NAVJS + FOOT)
    for a in h['articles']:
        others = [x for x in h['articles'] if x is not a][:3]
        ab = (f'<p class="eb"><a href="{h["file"]}" style="color:inherit;text-decoration:none">{E(h["eb"])}</a></p><article>'
              f'<span class="jtag">{E(a["tag"])}</span><h1 style="margin-top:12px">{E(a["title"])}</h1><p class="lead">{E(a["desc"])}</p>'
              f'<p class="jmeta">By Forecut Editorial · {H.DATE_TXT} · {a["read"]} min read</p>'
              + (f'<div class="jhero"><img src="img/{pick(a["img"])}.webp" alt="{E(a["title"])}" width="800" height="450"></div>' + CR.cap(pick(a['img'])) if pick(a['img']) else f'<div class="jhero ph ph0"><em>{E(a["title"])}</em></div>')
              + ''.join(block(b) for b in a['body']) + '</article>'
              f'<section class="more"><h3>More from Forecut {E(h["eb"])}</h3><div class="g3">{"".join(acard(x) for x in others)}</div></section>')
        open(f'../{a["slug"]}.html', 'w').write(head(a['title'] + ' · Forecut ' + h['eb'], 'art') + ab + FOOT); n += 1
print('hubs ok', len(H.HUBS), 'articles', n)
