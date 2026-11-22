"""Forecut report PDFs (A4 landscape), one set of separate PDFs per season and topic.

python3 v2/pdf_v2.py aw28 trims   -> output/reports/aw28-trims-{full,inspiration,business}.pdf
python3 v2/pdf_v2.py all          -> every season and topic
Writes print HTML to /tmp/fcpdf and prints it with Chromium (v2/pdf_print.cjs).
"""
import os, sys, json, subprocess, shutil
from html import escape as E
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_v2 as V
from PIL import Image

ROOT = V.ROOT
TMP = '/tmp/fcpdf'
OUT = os.path.join(ROOT, 'output', 'reports')
FONT = os.path.join(ROOT, 'build', 'v2', 'archivo.woff2')


def pic(key, w=900):
    if not key:
        return ''
    os.makedirs(os.path.join(TMP, 'i'), exist_ok=True)
    f = os.path.join(TMP, 'i', f'{key}-{w}.jpg')
    if not os.path.exists(f):
        im = Image.open(os.path.join(ROOT, 'img', key + '.webp')).convert('RGB')
        im.thumbnail((w, w * 2))
        im.save(f, 'JPEG', quality=62, optimize=True, progressive=True)
    return 'file://' + f


CSS = """@font-face{font-family:A;src:url(file://%s) format('woff2');font-weight:100 900;font-stretch:62%% 125%%}
@page{size:297mm 210mm;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
body{font:400 10.5pt/1.5 A,sans-serif;color:#000;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pg{width:297mm;height:210mm;padding:15mm 16mm 18mm;position:relative;overflow:hidden;page-break-after:always;display:flex;flex-direction:column}
.d{font-stretch:125%%;font-weight:300;letter-spacing:-.01em;line-height:1.04}
h1.d{font-size:40pt}h2.d{font-size:26pt;margin-bottom:6mm}h3{font-weight:500;font-size:12pt;margin-bottom:2mm}
.gr{color:#5c5c5c}.sm{font-size:9pt}
.ft{position:absolute;left:16mm;right:16mm;bottom:8mm;display:flex;justify-content:space-between;font-size:8pt;color:#8a8a8a;border-top:.3mm solid #e4e2de;padding-top:2.5mm}
.cov{padding:0;color:var(--fg);background:var(--bg)}
.cov .in{position:absolute;inset:16mm;display:flex;flex-direction:column}
.cov .top{display:flex;justify-content:space-between;font-size:11pt;font-weight:600}
.cov .top span:last-child{font-stretch:125%%;letter-spacing:.2em;font-weight:500}
.cov .t{margin-top:auto;font-size:58pt}
.cov .p{font-size:18pt;margin-top:4mm;font-stretch:112%%}
.cov .pal{display:flex;gap:1mm;height:5mm;margin-top:9mm}.cov .pal i{flex:1;outline:.2mm solid rgba(255,255,255,.4)}
.cov .meta{display:flex;justify-content:space-between;margin-top:5mm;font-size:10pt;opacity:.85}
.cols{display:grid;gap:7mm}.c2{grid-template-columns:1fr 1fr}.c3{grid-template-columns:repeat(3,1fr)}.c4{grid-template-columns:repeat(4,1fr)}
.box{border-top:.6mm solid #000;padding-top:3mm}
.im{background:#efede9;overflow:hidden}.im img{width:100%%;height:100%%;object-fit:cover;display:block}
.it .im{height:44mm}.it h4{font-weight:500;font-size:10pt;margin-top:2mm}.it p{font-size:8.5pt;color:#5c5c5c;line-height:1.35}
.st{display:inline-block;font-size:7.5pt;font-weight:600;padding:.4mm 1.8mm;margin-top:1.5mm}
.s-e{background:#e9c46a}.s-r{background:#3a9a63;color:#fff}.s-p{background:#3559b8;color:#fff}.s-f{background:#cfcbc4}
table{border-collapse:collapse;width:100%%}th,td{text-align:left;font-weight:400;padding:1.6mm 1.5mm;border-bottom:.3mm solid #e4e2de;font-size:9pt}
thead th{color:#5c5c5c;font-size:8pt}
.lc td{padding:1mm .8mm}.lc td span{display:block;padding:.8mm 1.5mm;font-size:7.5pt}.lc td.now{outline:.5mm solid #000;outline-offset:-.5mm}
.num{text-align:right;white-space:nowrap}
ul{padding-left:4.5mm}li{margin:1mm 0}
.sw{height:30mm}.toc div{display:flex;justify-content:space-between;padding:2.6mm 0;border-bottom:.3mm solid #e4e2de;font-size:12pt}
.ph{display:grid;place-items:center;font-stretch:125%%;font-weight:300;font-size:14pt}
.key{font-stretch:112%%;font-size:15pt;line-height:1.3}
""" % FONT


class Doc:
    def __init__(self, s, topic, part, ptitle):
        self.s, self.topic, self.part, self.ptitle = s, topic, part, ptitle
        self.m = V.META[s]
        self.pages = []

    def page(self, body, cls='', style=''):
        n = len(self.pages) + 1
        ft = '' if 'cov' in cls else f'<div class="ft"><span>Forecut, {self.m["code"]} {E(V.TOPIC[self.topic][1])}, {E(self.ptitle)}</span><span>{n}</span></div>'
        self.pages.append(f'<section class="pg {cls}" style="{style}">{body}{ft}</section>')

    def html(self):
        return f'<!doctype html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>' + ''.join(self.pages) + '</body></html>'


def build(s, topic):
    m = V.META[s]
    si = V.SKEYS.index(s)
    title = V.TOPIC[topic][1]
    its = V.topic_items(s, topic)
    R = V.by_stage(its, 'r', s); Em = V.by_stage(its, 'e', s); Pk = V.by_stage(its, 'p', s); Fd = V.by_stage(its, 'f', s)
    ths = V.related_themes(s, its)
    hx, _ = V.topic_colour(s, topic)
    fg = '#000' if V.lum(hx) > .55 else '#fff'
    nxt = V.META[V.SKEYS[si + 1]]['code'] if si + 1 < 5 else None
    prv = V.META[V.SKEYS[si - 1]]['code'] if si > 0 else None
    pal = m['palette']

    def cover(d, contents):
        th_k = f'cover-{s}-{topic}'
        bgimg = f'<img src="{pic(th_k, 1600)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">' if th_k in V.IMG else ''
        d.page(bgimg + f'''<div class="in"><div class="top"><span>{m["code"]}</span><span>FORECUT</span></div>
<div class="t d">{E(title)}</div><div class="p">{E(d.ptitle)}</div>
<div class="pal">{''.join(f'<i style="background:{c}"></i>' for c, _ in pal)}</div>
<div class="meta"><span>{E(m["title"])}, {E(m["stage"].lower())}. In stores {E(m["window"])}.</span><span>{V.TODAY.strftime("%-d %B %Y")}</span></div></div>''', 'cov', f'--bg:{hx};--fg:{fg}')
        d.page('<div class="cols c2" style="gap:16mm;height:100%"><div><h2 class="d">Contents</h2><div class="toc">' +
               ''.join(f'<div><span>{E(c)}</span></div>' for c in contents) + f'</div></div><div><h3>About this report</h3><p class="gr">{E(V.TOPIC[topic][2])}</p><p class="gr" style="margin-top:3mm">{E(m["intro"])}</p>'
               f'<h3 style="margin-top:8mm">How to read the stages</h3><p class="sm"><span class="st s-e">Emerging</span> new, test in small quantities</p><p class="sm"><span class="st s-r">Rising</span> growing, build into the range</p><p class="sm"><span class="st s-p">Peaking</span> at its height, sell through</p><p class="sm"><span class="st s-f">Fading</span> moving out, reduce or rework</p></div></div>')

    def overview(d):
        ov = []
        if R: ov.append(('Build into the range', f'{V.names(R, 5)} are rising{f" and keep growing into {nxt}" if nxt else ""}.'))
        if Em: ov.append(('Test in small quantities', f'{V.names(Em, 5)} are new ideas to try.'))
        if Pk: ov.append(('Sell through', f'{V.names(Pk, 4)} are at their height. Do not add depth.'))
        if Fd: ov.append(('Reduce or rework', f'{V.names(Fd, 4)} are moving out.'))
        lead = f'Build around {V.names(R, 3)}.' if R else (f'Lead with {V.names(Pk, 3)}.' if Pk else '')
        d.page(f'<h2 class="d">Overview</h2><p class="key">{E(lead)}</p><p class="gr" style="margin:3mm 0 8mm;max-width:200mm">{E(m["intro"])}</p><div class="cols c4">' +
               ''.join(f'<div class="box"><h3>{E(a)}</h3><p class="sm">{E(b)}</p></div>' for a, b in ov) + '</div>')

    def themes_pages(d, full=True):
        for t, desc, pat, bg, tfg, fl, kw in ths[:4 if full else 3]:
            th = V.THEMES.get(f'{s}|{t}', {})
            tk = f'theme-{s}-{V.islug(t)}'
            d.page(f'<div class="cols c2" style="gap:10mm;height:100%"><div class="im" style="background:{bg}">' + (f'<img src="{pic(tk, 1000)}">' if tk in V.IMG else '') + '</div><div>'
                   f'<p class="sm gr">Inspiration</p><h2 class="d" style="margin:2mm 0 4mm">{E(t)}</h2><p>{E(th.get("story", desc))}</p>' +
                   (f'<h3 style="margin-top:5mm">Why now</h3><p class="gr">{E(th["why"])}</p>' if th.get('why') else '') +
                   (f'<h3 style="margin-top:5mm">Seen at</h3><p class="gr sm">{E("; ".join(b[0] + ": " + b[1] for b in th["brands"][:4]))}</p>' if th.get('brands') else '') +
                   f'<h3 style="margin-top:5mm">Key pieces</h3><p class="gr">{E(", ".join(kw))}; {E(fl.lower())}.</p>'
                   f'<div style="display:flex;gap:2mm;margin-top:5mm;align-items:center"><i style="width:14mm;height:9mm;background:{bg};display:block"></i><i style="width:14mm;height:9mm;background:{tfg};display:block;outline:.2mm solid #e4e2de"></i><span class="sm gr" style="margin-left:2mm">{E(V.tcx(bg))}, {bg.upper()} and {E(V.tcx(tfg))}, {tfg.upper()}</span></div>' +
                   (f'<p class="sm gr" style="margin-top:5mm">Source: {E(th["src"])}</p>' if th.get('src') else '') + '</div></div>')

    def mood(d):
        xs = [x for x in R + Pk + Em if V.photo(x[1]['name'], s)][:7]
        if not xs:
            return
        g = '<div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr;grid-template-rows:1fr 1fr;gap:2mm;flex:1">'
        for i, x in enumerate(xs):
            g += f'<div class="im" style="{"grid-row:span 2;" if i == 0 else ""}position:relative"><img src="{pic(V.photo(x[1]["name"], s), 1000 if i == 0 else 600)}"><span style="position:absolute;left:0;bottom:0;background:#fff;font-size:8pt;padding:1mm 2mm">{E(x[1]["name"])}</span></div>'
        d.page('<h2 class="d">Moodboard</h2>' + g + '</div>')

    def colour(d):
        d.page(f'<h2 class="d">Colour</h2><p class="gr" style="margin-bottom:6mm">The {m["code"]} palette, with Pantone TCX and HEX codes.</p><div class="cols" style="grid-template-columns:repeat({len(pal)},1fr);gap:2mm">' +
               ''.join(f'<div><div class="sw" style="background:{c};outline:.2mm solid #e4e2de"></div><p style="font-weight:500;margin-top:2mm">{E(n)}</p><p class="sm gr">{V.tcx(c)}<br>{c.upper()}</p></div>' for c, n in pal) +
               '</div><h3 style="margin-top:10mm">Colour by theme</h3><div class="cols c3" style="margin-top:3mm">' +
               ''.join(f'<div><div style="display:grid;grid-template-columns:2fr 1fr;height:16mm"><i style="background:{t[3]}"></i><i style="background:{t[4]};outline:.2mm solid #e4e2de"></i></div><p class="sm" style="margin-top:2mm"><b style="font-weight:500">{E(t[0])}:</b> <span class="gr">{V.tcx(t[3])} with {V.tcx(t[4])}, for {E(t[5].lower())}.</span></p></div>' for t in ths[:3]) + '</div>')

    def development(d):
        key = [x for x in R + Pk + Em + Fd if V.photo(x[1]['name'], s)][:12] or (R + Pk + Em + Fd)[:12]
        rows = ''.join(f'<tr><th style="font-weight:500">{E(x[1]["name"])}</th>' + ''.join(
            f'<td class="{"now" if j == si else ""}">' + (f'<span class="s-{c}">{V.STAGE[c][0]}</span>' if c in V.STAGE else '') + '</td>' for j, c in enumerate(x[1]['life'])) + '</tr>' for x in key)
        carried = [x for x in its if si > 0 and x[1]['life'][si - 1] in V.STAGE][:6]
        nxs = [x for x in R + Em if x[3] in V.STAGE][:6] if nxt else []
        d.page('<h2 class="d">How it developed</h2><div class="cols" style="grid-template-columns:2fr 1fr;gap:10mm"><table class="lc"><thead><tr><th>Piece</th>' +
               ''.join(f'<th style="{"color:#000;font-weight:600" if j == si else ""}">{V.META[k]["code"]}</th>' for j, k in enumerate(V.SKEYS)) + f'</tr></thead><tbody>{rows}</tbody></table><div>' +
               (f'<h3>Carried on from {prv}</h3>' + ''.join(f'<p class="sm" style="padding:1.2mm 0;border-bottom:.3mm solid #e4e2de"><b style="font-weight:500">{E(x[1]["name"])}</b><br><span class="gr">{V.STAGE[x[1]["life"][si - 1]][0]} in {prv}, {V.STAGE[x[2]][0].lower()} now</span></p>' for x in carried) if carried else '') +
               (f'<h3 style="margin-top:6mm">What happens in {nxt}</h3>' + ''.join(f'<p class="sm" style="padding:1.2mm 0;border-bottom:.3mm solid #e4e2de"><b style="font-weight:500">{E(x[1]["name"])}</b><br><span class="gr">{V.STAGE[x[2]][0]} now, {V.STAGE[x[3]][0].lower()} in {nxt}</span></p>' for x in nxs) if nxs else '') + '</div></div>')

    def items_pages(d, xs, heading, with_next=True):
        for i in range(0, len(xs), 8):
            ch = xs[i:i + 8]
            cells = ''
            for k, it, st, nx in ch:
                p = V.photo(it['name'], s)
                im = f'<div class="im"><img src="{pic(p, 360)}"></div>' if p else f'<div class="im ph" style="background:{hx};color:{fg}">{E(it["area"])}</div>'
                nl = (f' <span class="sm gr">next: {V.STAGE[nx][0].lower()}</span>' if nx in V.STAGE else '') if with_next else ''
                cells += f'<div class="it">{im}<h4>{E(it["name"])}</h4><p>{E(k.replace("|", ", "))}, {E(it["area"].lower())}</p><p style="color:#000">{E(it["note"])}</p><span class="st s-{st}">{V.STAGE[st][0]}</span>{nl}</div>'
            d.page(f'<h2 class="d" style="font-size:20pt">{E(heading)}</h2><div class="cols c4" style="gap:5mm 6mm">{cells}</div>')

    def strategy(d):
        cols = [('Build depth', 's-r', R), ('Test small', 's-e', Em), ('Sell through', 's-p', Pk), ('Exit or rework', 's-f', Fd)]
        d.page('<h2 class="d">Range strategy</h2><div class="cols c4">' + ''.join(
            f'<div><div class="{c}" style="height:2mm;margin-bottom:3mm"></div><h3>{a}</h3><ul class="sm">' + (''.join(f'<li>{E(x[1]["name"])}</li>' for x in g[:9]) or '<li class="gr">Nothing at this stage</li>') + '</ul></div>' for a, c, g in cols) + '</div>')
        acts = [a for t in ths[:3] for a in V.THEMES.get(f'{s}|{t[0]}', {}).get('actions', [])]
        c = V.cal_for(s)
        body = '<h2 class="d">Actions and timing</h2><div class="cols c2" style="gap:12mm"><div><h3>Actions for the range</h3><ul>' + ''.join(f'<li>{E(a)}</li>' for a in acts[:8]) + '</ul></div><div>'
        if c:
            body += ('<h3>Season timing</h3><table><tbody>' + f'<tr><th>Shown on the runway</th><td>{E(c[2])}</td></tr><tr><th>In stores, northern hemisphere</th><td>{E(m["window"])}</td></tr>'
                     f'<tr><th>Southern hemisphere</th><td>{E(c[4])}</td></tr><tr><th>Tropical and seasonless markets</th><td>{E(c[5])}</td></tr></tbody></table>')
        body += ('<h3 style="margin-top:7mm">Range checklist</h3><ul class="sm"><li>Give rising pieces the most options and depth.</li><li>Buy emerging pieces in one or two colours first, then repeat what sells.</li>'
                 '<li>Keep peaking pieces in core colours only; do not add new styles.</li><li>Rework fading pieces with a rising detail, or clear them early.</li></ul></div></div>')
        d.page(body)

    def pricing(d):
        tabs = []
        for t in ths[:4]:
            th = V.THEMES.get(f'{s}|{t[0]}', {})
            if th.get('prices'):
                tabs.append(f'<div><h3>{E(t[0])}</h3><table><thead><tr><th>Key garment</th><th class="num">Value</th><th class="num">Mid</th><th class="num">Premium</th></tr></thead><tbody>' +
                            ''.join(f'<tr><th>{E(r[0])}</th><td class="num">₹{E(r[1])}</td><td class="num">₹{E(r[2])}</td><td class="num">₹{E(r[3])}</td></tr>' for r in th['prices']) + '</tbody></table>' +
                            (f'<p class="sm" style="margin-top:2.5mm"><b style="font-weight:500">Cost level: {E(th["cost"][0].lower())}.</b> <span class="gr">{E(th["cost"][1])}</span></p>' if th.get('cost') else '') + '</div>')
        for i in range(0, len(tabs), 2):
            d.page(f'<h2 class="d">Pricing and cost</h2><p class="gr sm" style="margin:-3mm 0 6mm">Indicative retail bands in ₹ for the Indian market. A planning guide, not a quote.</p><div class="cols c2" style="gap:12mm">' + ''.join(tabs[i:i + 2]) + '</div>')
        d.page('<h2 class="d">Margin checklist</h2><div class="cols c3"><div class="box"><h3>Before you cost</h3><ul class="sm"><li>Fix the retail band first, then work back to the cost you can afford.</li><li>Agree minimums for any new trim or hardware early.</li><li>Ask for a price on two versions: full detail and a simpler one.</li></ul></div>'
               '<div class="box"><h3>Where cost hides</h3><ul class="sm"><li>Hand work such as beading, fringe and embroidery.</li><li>Extra panels, pockets and linings.</li><li>Custom hardware, washes and finishes.</li><li>Duty and freight on imported trims.</li></ul></div>'
               '<div class="box"><h3>Keep the look, cut the cost</h3><ul class="sm"><li>Place the detail where it is seen: neckline, cuff, hem.</li><li>Use stock trims in season colours.</li><li>Put the costly version in a small premium run.</li></ul><p class="sm gr" style="margin-top:3mm">Work out your margin at forecut.in/pricefold.html.</p></div></div>')

    def markets(d):
        rs = V.regions_for(s, its)
        import regions_data as RD
        for i in range(0, len(rs), 3):
            cells = ''
            for r, dirs, fit in rs[i:i + 3]:
                mk = r.get('markets', [])[:3]
                cells += (f'<div class="box"><h3 style="font-size:14pt">{E(r["name"])}</h3>' +
                          ('<p class="sm" style="font-weight:500;margin-top:2mm">Regional direction</p><ul class="sm gr">' + ''.join(f'<li>{E(x)}</li>' for x in dirs[:4]) + '</ul>' if dirs else
                           f'<p class="sm gr">Regional directions for {m["code"]} follow as coverage arrives.</p>') +
                          f'<p class="sm" style="font-weight:500;margin-top:2mm">Climate</p><p class="sm gr">{E(r["climate"])}</p>' +
                          (f'<p class="sm" style="font-weight:500;margin-top:2mm">Best fit from this report</p><p class="sm gr">{E(", ".join(x[1]["name"] for x in fit))}</p>' if fit else '') +
                          ('<p class="sm" style="font-weight:500;margin-top:2mm">Key selling moments</p><ul class="sm gr">' + ''.join(f'<li>{E(x["name"])}: {E(x["moments"])}</li>' for x in mk) + '</ul>' if mk else '') + '</div>')
            d.page(f'<h2 class="d">Markets</h2><div class="cols c3">{cells}</div>')
        d.page(f'<div class="cols c2" style="gap:12mm;height:100%"><div class="im"><img src="{pic("hero-india", 1200)}"></div><div><p class="sm gr">India in depth</p><h2 class="d" style="margin:2mm 0 5mm">India</h2>'
               f'<p>Indian buyers read {m["code"]} through festive and wedding demand, summer weights and handloom. Forecut publishes separate India season reports with craft clusters, colours that sell there and price bands.</p>'
               '<p class="gr" style="margin-top:4mm">See forecut.in/india.html for the India forecasts.</p></div></div>')

    def back(d):
        d.page(f'<div style="margin-top:auto"><h2 class="d">Forecut</h2><p class="gr" style="max-width:150mm">Seasonal fashion forecasts and design tools for designers, brands and fashion schools.</p>'
               f'<p style="margin-top:6mm">forecut.in<br>hello@forecut.in</p><p class="sm gr" style="margin-top:10mm;max-width:200mm">Sources: {E(m.get("sources", ""))}</p>'
               f'<p class="sm gr" style="margin-top:3mm;max-width:200mm">Forecasts are Forecut\'s own reading of the season and may change as collections and sales data arrive. For your own planning only; please do not resell.</p></div>')

    docs = {}
    stage_groups = [(f'Emerging in {m["code"]}', Em), (f'Rising in {m["code"]}', R), (f'Peaking in {m["code"]}', Pk), (f'Fading in {m["code"]}', Fd)]
    for pk, pt, *_ in V.PARTS:
        d = Doc(s, topic, pk, pt)
        if pk == 'full':
            cover(d, ['Overview', 'Inspiration', 'Moodboard', 'How it developed', 'The forecast', 'Colour', 'Range strategy', 'Pricing and cost', 'Markets'])
            overview(d); themes_pages(d); mood(d); development(d)
            for h, g in stage_groups:
                if g and V.TOPIC[topic][3]:
                    items_pages(d, g, h)
            colour(d); strategy(d); pricing(d); markets(d)
        elif pk == 'inspiration':
            cover(d, ['Inspiration', 'Moodboard', 'Colour', 'Key pieces'])
            themes_pages(d); mood(d); colour(d)
            kp = [x for x in R + Em + Pk if V.photo(x[1]['name'], s)]
            if kp:
                items_pages(d, kp[:16], 'Key pieces', with_next=False)
        else:
            cover(d, ['Overview', 'Range strategy', 'How it developed', 'Actions and timing', 'Pricing and cost', 'Margin checklist', 'Markets', 'India'])
            overview(d); strategy(d); development(d); pricing(d); markets(d)
        back(d)
        docs[pk] = d
    return docs


def main(pairs):
    os.makedirs(TMP, exist_ok=True); os.makedirs(OUT, exist_ok=True)
    jobs = []
    for s, topic in pairs:
        for pk, d in build(s, topic).items():
            hp = os.path.join(TMP, f'{s}-{topic}-{pk}.html')
            open(hp, 'w').write(d.html())
            jobs.append([hp, os.path.join(OUT, f'{s}-{topic}-{pk}.pdf')])
    json.dump(jobs, open(os.path.join(TMP, 'jobs.json'), 'w'))
    subprocess.run(['node', os.path.join(V.B, 'v2', 'pdf_print.cjs'), os.path.join(TMP, 'jobs.json')], check=True, cwd='/home/claude/work/design')
    tot = sum(os.path.getsize(o) for _, o in jobs)
    print(len(jobs), 'PDFs,', round(tot / 1e6, 1), 'MB')


if __name__ == '__main__':
    main(V.REPORTS if sys.argv[1] == 'all' else [(sys.argv[1], sys.argv[2])])
