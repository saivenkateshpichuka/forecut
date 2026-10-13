import pantone as PT
import json, html, os
from seasons_data import SEASONS, META
M = json.load(open('details.json'))
STATIC = os.environ.get('STATIC')  # set STATIC=<outdir> to build the GitHub Pages site
URLS = json.load(open('urls.json')) if os.path.exists('urls.json') else {}
HOME = 'https://claude.ai/artifact/NqT7n8hWTei6RbndhLrHe6'
if STATIC:
    URLS = {k: f'{k}.html' for k in URLS}; HOME = '/'
SL = {'e': ('emerge', 'Emerging'), 'r': ('rise', 'Rising'), 'p': ('peak', 'Peaking'), 'f': ('fade', 'Fading')}
E = html.escape
def slug(s): return ''.join(ch.lower() if ch.isalnum() else '-' for ch in s).strip('-').replace('--', '-')
tpl = open('season_tpl.txt').read()
IMGS = set(json.load(open('images.json'))) if os.path.exists('images.json') else set()
def islug(s): return ''.join(ch.lower() if ch.isalnum() else '-' for ch in s).strip('-').replace('--', '-').replace('--', '-')
import desc as DESCMOD

def story_html(code_slug, eyebrow, title, intro, tags):
    if ('hero-' + code_slug) not in IMGS: return ''
    tg = ''.join(f'<span>{E(x)}</span>' for x in tags[:5])
    return (f'<section class="story" style="--bg:url(img/hero-{code_slug}.webp)" aria-label="Season story"><div class="st">'
            f'<span class="mono eb">{eyebrow}</span><h1>{title}</h1><p>{intro}</p><div class="stt">{tg}</div></div></section>')
LOCKSVG = '<svg class="lk" viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 7V5a3.5 3.5 0 0 1 7 0v2" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="3" y="7" width="10" height="7" rx="1.6" fill="currentColor"/></svg>'
SITE = json.load(open('site.json')) if os.path.exists('site.json') else {'name': 'Forecut', 'tagline': '', 'url': ''}
if STATIC and SITE.get('static_url'): SITE = dict(SITE, url=SITE['static_url'])
engine = open('flats.js').read().replace("if (typeof module !== 'undefined') module.exports = Flats;\n", '')
codes = [META[s]['code'] for s in SEASONS]
short = {'Womenswear': 'Women', 'Menswear': 'Men', 'Footwear': 'Shoes'}
for si, s in enumerate(SEASONS):
    m = META[s]
    secs, nav, counts, total = [], [], {k: 0 for k in SL}, 0
    descs = {}
    cur = None
    for dept, cat in M['order']:
        items = [it for it in M['model'][f'{dept}|{cat}'] if it['life'][si] != '-']
        if dept != cur:
            if cur: secs.append('</div>')
            secs.append(f'<div class="dept" data-dept="{slug(dept)}"><h2 class="depth">{dept}</h2>')
            cur = dept
        cid = f'{slug(dept)}-{slug(cat)}'
        nav.append(f'<a href="#{cid}" data-dept="{slug(dept)}">{short[dept]} · {E(cat)}</a>')
        # order: emerging, rising, peaking, fading
        items.sort(key=lambda it: 'erpf'.index(it['life'][si]))
        SC = json.load(open('subcats.json'))['footwear' if dept == 'Footwear' else 'garment']
        def subof(area):
            for k, v in SC.items():
                if area in v: return k
            return list(SC.keys())[-1]
        groups = {}
        for it in items: groups.setdefault(subof(it['area']), []).append(it)
        subhtml = []
        for sname in [k for k in SC if k in groups]:
          cards = []
          for it in groups[sname]:
            st = it['life'][si]; counts[st] += 1; total += 1
            descs[it['name']] = DESCMOD.build(dept, cat, it)
            c, l = SL[st]
            q = E((it['name'] + ' ' + it['area'] + ' ' + it['note'] + ' ' + cat).lower())
            cards.append(f'<article class="d" tabindex="0" role="button" aria-haspopup="dialog" data-st="{st}" data-life="{it["life"]}"{(' data-img="img/' + islug(it['name']) + '-' + s + '.webp"') if (islug(it['name']) + '-' + s) in IMGS else ((' data-img="img/' + islug(it['name']) + '.webp"') if (islug(it['name']) in IMGS and si == next(i for i, ch in enumerate(it['life']) if ch != '-')) else '')} data-q="{q} {E(sname.lower())}"><div class="thumb" aria-hidden="true"></div><div class="dtop"><span class="area">{E(it["area"])}</span><span class="pill {c}">{l}</span></div><h4>{E(it["name"])}</h4><p>{E(it["note"])}</p><span class="open">View detail →</span></article>')
          subhtml.append(f'<div class="sub" data-sub="{E(sname)}"><h5>{E(sname)} <span>{len(groups[sname])}</span></h5><div class="grid">{"".join(cards)}</div></div>')
        secs.append(f'<section class="cat" id="{cid}" data-dept="{slug(dept)}"><div class="cathead"><h3>{E(cat)}</h3><span class="cnt"><span class="vis">{len(items)}</span> details</span></div>{"".join(subhtml)}</section>')
    secs.append('</div>')
    # season at a glance
    movers = []
    for dept in ['Womenswear', 'Menswear', 'Footwear']:
        pool = [(it, cat) for d2, cat in M['order'] if d2 == dept for it in M['model'][f'{d2}|{cat}'] if it['life'][si] in 'er']
        pool.sort(key=lambda x: ('er'.index(x[0]['life'][si]), M['order'].index([dept, x[1]])))
        seen = set(); pick = []
        for it, cat in pool:
            if cat in seen: continue
            seen.add(cat); pick.append((it, cat))
            if len(pick) == 2: break
        movers += pick
    mv = ''.join(f'<button class="mv" type="button" data-name="{E(it["name"])}"><span class="gt" aria-hidden="true"></span><span><b>{E(it["name"])}</b><small class="{it["life"][si]}">{SL[it["life"][si]][1]} · {E(cat)}</small></span></button>' for it, cat in movers)
    tot = max(total, 1)
    mixbar = ''.join(f'<i style="width:{counts[k] / tot * 100:.1f}%;background:var(--{v})" title="{SL[k][1]} {counts[k]}"></i>' for k, v in [('e', 'chalk'), ('r', 'rise'), ('p', 'peak'), ('f', 'fade')])
    mixkey = ''.join(f'<span style="--k:var(--{v})">{SL[k][1]} {round(counts[k] / tot * 100)}%</span>' for k, v in [('e', 'chalk'), ('r', 'rise'), ('p', 'peak'), ('f', 'fade')])
    pstrip = ''.join(f'<i style="background:{h}" title="{E(n)}"></i>' for h, n in m['palette'])
    qj = ''.join(f'<a href="#{slug(d)}-{slug(c)}">{short[d]} · {E(c)}</a>' for d, c in M['order'])
    glance = (f'<div class="glance"><div><h3>Status mix</h3><div class="mixbar" role="img" aria-label="Status mix">{mixbar}</div><div class="mixkey">{mixkey}</div></div>'
              f'<div><h3>Top movers to act on now</h3><div class="movers">{mv}</div></div>'
              + (f'<div><h3>Season palette</h3><div class="pstrip" role="img" aria-label="Season palette">{pstrip}</div></div>' if len(m['coty']) > 1 else '')
              + '</div>')
    LOCKED = [z.lower() for z in SITE.get('locked', [])]
    snav = ''.join(f'<a href="{URLS.get(x, "#")}"{" aria-current=\"page\"" if x == s else ""}{(" class=\"lockt\" data-stage=\"" + E(META[x]["stage"]) + "\"") if x in LOCKED else ""}>{META[x]["code"]}<small>{(LOCKSVG + "Opens at launch") if x in LOCKED else E(META[x]["stage"])}</small></a>' for x in SEASONS)
    snav = f'<a href="{"india.html" if STATIC else "https://forecut.in/india.html"}">India<small>Festive &amp; wedding</small></a>' + snav
    themes = ''.join(f'<article class="theme" tabindex="0" role="button" aria-haspopup="dialog" data-i="{ti}"><div class="tart" data-pat="{p}" data-bg="{bg}" data-fg="{fg}" data-flat="{E(fl)}" data-title="{E(t)}"{(chr(32) + 'data-full="img/theme-' + s + '-' + islug(t) + '.webp"') if ('theme-' + s + '-' + islug(t)) in IMGS else ""}></div><div class="tbody"><h3>{E(t)}</h3><p>{E(d)}</p><ul class="kw">{"".join(f"<li>{E(k)}</li>" for k in kw)}</ul><span class="more">Explore theme →</span></div></article>' for ti, (t, d, p, bg, fg, fl, kw) in enumerate(m['themes']))
    from theme_data import T as TDATA
    tdj = []
    for (t, d, p, bg, fg, fl, kw) in m['themes']:
        x = TDATA[(s, t)]
        tdj.append(dict(title=t, season=m['code'] + ' · ' + m['stage'], tags=kw, story=x['story'], why=x['why'], brands=x['brands'], src=x['src'],
                        future=(m['basis'] != 'research'), kw=x['kw'], prices=x['prices'], cost=x['cost'], actions=x['actions']))
    pal = ''.join(f'<div class="sw2"><i style="background:{h}"></i><span>{E(n)}<small>Pantone {PT.nearest(h)[0]}<br>{h.upper()}</small></span></div>' for h, n in m['palette'])
    coty = ''
    for c in m['coty']:
        pairs = ''.join(f'<span><i style="background:{h}"></i>{E(n)}</span>' for h, n in c['pairs'])
        deep = f' data-deep="{c["deep"]}"' if c.get('deep') else ''
        coty += (f'<article class="coty" style="--c:{c.get("deep", c["hex"]) if False else c["hex"]};--ci:{c["ink"]}">'
                 f'<div class="cfield"><span class="mono">Colour of the year · {E(c["by"])} {c["year"]}</span><div><h2>{E(c["name"])}</h2><span class="code">{E(c["code"])} · {c["hex"]} approx.</span></div></div>'
                 f'<div class="cart" data-flat="{E(c["flat"])}" data-hex="{c["hex"]}"{deep} role="img" aria-label="{E(c["flat"])} shown in {E(c["name"])}"></div>'
                 f'<div class="cinfo"><p>{E(c["text"])}</p><div class="pairs"><b>Pairs with</b>{pairs}</div></div></article>')
    basis = ('res', 'Based on published runway and trade research') if m['basis'] == 'research' else ('proj', 'Forecut projection · updates as runway coverage arrives')
    rep = {
        '%%ENGINE%%': engine, '%%SECS%%': ''.join(secs), '%%NAV%%': ''.join(nav), '%%SEASONNAV%%': snav,
        '%%THEMES%%': themes, '%%THEMEDATA%%': json.dumps(tdj, ensure_ascii=False).replace('</', '<\\/'), '%%PALETTE%%': pal, '%%COTY%%': coty, '%%HOME%%': HOME,
        '%%TOTAL%%': str(total), '%%CATS%%': str(len(M['order'])),
        '%%RISE%%': str(counts['r']), '%%EMERGE%%': str(counts['e']), '%%PEAK%%': str(counts['p']), '%%FADE%%': str(counts['f']),
        '%%TITLEUP%%': m['title'].upper(), '%%STAGEUP%%': m['stage'].upper(), '%%WINDOWUP%%': m['window'].upper(),
        '%%GLANCEL%%': glance, '%%GLANCER%%': '' if len(m['coty']) > 1 else ('<div class="glance pcard"><div><h3>' + m['code'] + ' key colours</h3><div class="pgrid">' + ''.join(f'<div><i style="background:{h}"></i><span>{E(n)}</span></div>' for h, n in m['palette']) + '</div></div></div>'),
        '%%DESC%%': json.dumps(descs, ensure_ascii=False).replace('</', '<\\/'), '%%SITE%%': json.dumps(SITE, ensure_ascii=False),
        '%%CODES%%': json.dumps(codes), '%%PALJSON%%': json.dumps([h for h, n in m['palette']]), '%%BASISCLS%%': basis[0], '%%BASISTEXT%%': basis[1],
        '%%STAGE%%': E(m['stage']), '%%WINDOW%%': E(m['window']), '%%TITLE%%': E(m['title']), '%%INTRO%%': E(m['intro']),
        '%%SOURCES%%': E(m['sources']), '%%CODE%%': m['code'],
        '%%STORY%%': story_html(s, E(m['stage']) + ' · ' + E(m['window']), E(m['title']), E(m['intro']), [th[0] for th in m['themes']]),
    }
    out = tpl
    for k, v in rep.items():
        out = out.replace(k, v)
    assert '%%' not in out.replace('100%%', ''), [ln for ln in out.split('\n') if '%%' in ln][:3]
    out = out.replace('</style>', '.seasons a.lockt{opacity:.7}.seasons a .lk{width:9px;height:9px;margin-right:4px;vertical-align:-1px;display:inline}' + '</style>', 1)
    if s in LOCKED:
        lockp = (f'<div class="lockpanel" id="details-locked"><div class="lpi">{LOCKSVG}</div><h2>{E(m["code"])} details open at launch</h2>'
                 f'<p>The full {E(m["code"])} detail report, with every detail, status, flat sketch and downloadable card, is open to signed-in members now and to everyone at Forecut\'s official launch. '
                 f'The themes and colours above are a preview.</p><p class="lpb"><a class="lpsign" href="/account.html?next=/{s}.html">Sign in free to unlock</a> <a href="{URLS.get(SEASONS[0], "aw26.html")}">Explore {E(META[SEASONS[0]]["code"])} now →</a></p></div>')
        i1 = out.index('<div class="sechead dh">'); i2 = out.index('<footer') if '<footer' in out else out.index('<p class="flinks"')
        out = out[:i1] + lockp + '<div class="lockhide" hidden>' + out[i1:i2] + '</div>' + out[i2:]
        out = out.replace('</style>', '.lockpanel{margin:40px 0;padding:34px 28px;border:1px dashed var(--grid);border-radius:16px;background:var(--paper-2);text-align:center}.lockpanel .lpi{width:46px;height:46px;margin:0 auto 10px;border-radius:50%;background:var(--grid);display:grid;place-items:center;color:var(--muted)}.lockpanel .lpi svg{width:20px;height:20px}.lockpanel h2{margin:0 0 8px}.lockpanel p{max-width:60ch;margin:0 auto;color:var(--muted)}.lockpanel a{color:var(--ink);font-weight:600}.lpb{margin-top:14px!important;display:flex;gap:16px;justify-content:center;align-items:center;flex-wrap:wrap}.lpsign{background:var(--mat);color:var(--mat-ink)!important;text-decoration:none;padding:11px 18px;border-radius:2px}</style>', 1)
    if STATIC:
        import re as _re
        _t = _re.search(r'<title>.*?</title>', out).group(0)
        out = '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">\n' + out.replace(_t, _t + '</head><body>', 1) + '\n</body></html>'
    open(os.path.join(STATIC, f'{s}.html') if STATIC else f'forecut-{s}.html', 'w').write(out)
    print(s, total, counts)
