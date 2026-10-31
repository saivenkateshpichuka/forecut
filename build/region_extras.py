"""Extra sections for region pages (Oct 2026): colour direction with Pantone TCX, a trend momentum graph,
upcoming sales and occasions, and brands to watch. Data: sales_data.py, details.json, regions_data.py."""
import json
from html import escape as E
import pantone as PT
import regions_data as RD
import sales_data as SD

D = json.load(open('details.json'))['model']
SEAS = json.load(open('seasons.json'))['seasons']
ALL = [x for v in D.values() for x in v]
COL = {'e': '#c2410c', 'r': '#047a45', 'p': '#d99a00', 'f': '#6d4fc2'}
LBL = {'e': 'Emerging', 'r': 'Rising', 'p': 'Peaking', 'f': 'Fading'}

CSS = '''<style>
.rcol{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px}
.rcol div{border:1px solid var(--grid);border-radius:4px;overflow:hidden;background:var(--paper-2)}
.rcol i{display:block;height:84px}.rcol b{display:block;font:600 15px "DM Sans",sans-serif;padding:10px 12px 0}
.rcol code{display:block;font:600 11.5px "DM Sans",sans-serif;color:var(--muted);padding:2px 12px}.rcol span{display:block;font-size:13px;color:var(--muted);padding:4px 12px 12px;line-height:1.4}
.rgx{border:1px solid var(--grid);border-radius:4px;background:var(--paper-2);padding:16px}
.rgx svg{width:100%;max-width:820px;height:auto;display:block}.rgx text{font:600 11px "DM Sans",sans-serif;fill:var(--muted)}
.rgxk{display:flex;gap:14px;flex-wrap:wrap;margin-top:8px;font:600 12px "DM Sans",sans-serif;color:var(--muted)}.rgxk i{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:5px;vertical-align:-1px}
.rsales{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px}
.rsm{font-family:"DM Sans",system-ui,sans-serif;border:1px solid var(--grid);border-radius:4px;background:var(--paper-2);padding:14px 16px}
.rsm h3{font:700 18px "DM Sans",sans-serif;margin:0 0 6px}
.rsm ul{list-style:none;margin:0;padding:0}.rsm li{display:grid;grid-template-columns:86px 1fr;gap:10px;padding:8px 0;border-bottom:1px dashed var(--grid);font-size:13.5px;color:var(--muted)}
.rsm time{font:700 12px "DM Sans",sans-serif;color:#a9481f;padding-top:2px}.rsm li b{display:block;color:var(--ink);font-size:14.5px}
.rsm .bw{margin-top:10px;font-size:13.5px;color:var(--muted)}.rsm .bw small{display:block;font:700 11px "DM Sans",sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#a9481f;margin-bottom:4px}
.rsm .bw p{margin:0 0 6px;font:14px/1.5 "DM Sans",system-ui,sans-serif!important;color:var(--muted)}.rsm li span{font:13.5px/1.45 "DM Sans",system-ui,sans-serif}.rsm .bw b{color:var(--ink)}.rsm .bw a{color:var(--muted);font-size:12px}
@media (max-width:820px){.rcol{grid-template-columns:repeat(2,minmax(0,1fr))}}
</style>'''


def colours(r):
    cs = SD.COLOURS.get(r['slug'], [])
    if not cs: return ''
    cards = ''.join(f'<div><i style="background:{h}"></i><b>{E(n)}</b><code>{E(PT.nearest(h)[0])} · {h.upper()}</code><span>{E(u)}</span></div>' for h, n, u in cs)
    return (f'<section class="sec" id="colour"><h2>Colour direction for {E(r["name"])}</h2><p class="sub">Five colours to plan with for the coming local season, each with its nearest Pantone TCX reference. Confirm against a physical standard before production.</p>'
            f'<div class="rcol">{cards}</div></section>')


def _relevant(r):
    rel = [x for x in ALL if any(w in (x['name'] + ' ' + x['note']).lower() for w in r['boost'])]
    return rel if len(rel) >= 20 else ALL


def graph(r):
    rel = _relevant(r)
    rows = []
    for i, s in enumerate(SEAS):
        aw = s.startswith('aw')
        c = {k: 0 for k in 'erpf'}
        for x in rel:
            ch = x['life'][i]
            if ch not in c: continue
            if r['heat'] and aw and any(w in (x['name'] + ' ' + x['note']).lower() for w in RD.HOT): continue
            c[ch] += 1
        rows.append((s, c))
    W, H, pad, bw = 640, 240, 34, 64
    mx = max(sum(c.values()) for _, c in rows) or 1
    gap = (W - pad * 2 - bw * len(rows)) / max(len(rows) - 1, 1)
    bars = ''
    for i, (s, c) in enumerate(rows):
        x = pad + i * (bw + gap); y = H - 28
        for k in 'erpf':
            h = (H - 60) * c[k] / mx
            if h <= 0: continue
            y -= h
            bars += f'<rect x="{x:.0f}" y="{y:.1f}" width="{bw}" height="{h:.1f}" fill="{COL[k]}"><title>{s.upper()}: {c[k]} {LBL[k].lower()}</title></rect>'
        mom = c['e'] + c['r']
        bars += f'<text x="{x + bw / 2:.0f}" y="{H - 10}" text-anchor="middle">{s.upper()}</text><text x="{x + bw / 2:.0f}" y="{y - 6:.0f}" text-anchor="middle">{mom} rising/emerging</text>'
    key = ''.join(f'<span><i style="background:{COL[k]}"></i>{LBL[k]}</span>' for k in 'erpf')
    lead = max(rows, key=lambda rc: rc[1]['e'] + rc[1]['r'])[0].upper()
    return (f'<section class="sec" id="graph"><h2>Trend momentum in {E(r["name"])}</h2><p class="sub">The {len(rel)} Forecut details most relevant to this region, by stage, season by season{" (heavy winter pieces left out for hot-climate markets)" if r["heat"] else ""}. Momentum peaks in {lead}.</p>'
            f'<div class="rgx"><svg viewBox="0 0 {W} {H}" role="img" aria-label="Stacked bar chart of trend stages by season for {E(r["name"])}">{bars}</svg><div class="rgxk">{key}</div></div></section>')


def sales(r):
    ms = [m for m in SD.MARKETS if m['region'] == r['slug']]
    if not ms: return ''
    cards = ''
    for m in ms:
        ev = [x for x in SD.upcoming(region=r['slug']) if x[5] == m['name']]
        li = ''.join(f'<li><time>{E(SD.when(s, e, lab))}</time><span><b>{E(n)}</b>{E(note)}</span></li>' for s, e, n, k, note, mk, lab in ev)
        bw = ''.join(f'<p><b>{E(b)}</b> {E(t)} <a href="{u}" rel="noopener" target="_blank">{E(src)}</a></p>' for b, t, src, u in m['brands'])
        cards += f'<div class="rsm"><h3>{E(m["name"])}</h3><ul>{li}</ul>' + (f'<div class="bw"><small>Brands to watch</small>{bw}</div>' if bw else '') + '</div>'
    return (f'<section class="sec" id="sales"><h2>Upcoming sales &amp; occasions</h2><p class="sub">The big sale dates and buying moments in {E(r["name"])}, with brands making news. Plan drops and markdowns around them. Ramadan and Eid dates depend on moon sighting.</p>'
            f'<div class="rsales">{cards}</div></section>')


def all_sections(r):
    return CSS + sales(r) + colours(r) + graph(r)
