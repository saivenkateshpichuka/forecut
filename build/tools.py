"""Writes the tools hub (tools.html), textile-calculator.html and pattern-maker.html to the site root (published; run from build.sh after legal.py).
For a local review copy instead: TOOLS_OUT=tools_preview/ PM_PREVIEW=1 python3 tools.py
Everything runs in the browser; nothing is sent anywhere. Shared header/footer come from legal.py."""
import html, json, shutil, os
import reports_data as R
import depth_tools as DT
src = open('legal.py').read()
ns = {}
exec(src[:src.index('P = {}')], ns)
HEAD, FOOT = ns['HEAD'], ns['FOOT']
E = html.escape
OUT = os.environ.get('TOOLS_OUT', '../')
os.makedirs(OUT, exist_ok=True)
JS = lambda n: open(os.path.join('tools_js', n)).read()

CSS = '''<style>
.wrap{max-width:1120px!important}
[hidden]{display:none!important}
.tl-h{display:grid;grid-template-columns:1.2fr 1fr;gap:28px;align-items:end;margin:10px 0 24px}
.tl-h .lead{margin:0}
.chiprow{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}.chiprow span{font:600 12.5px "DM Sans",sans-serif;border:1px solid var(--grid);background:var(--paper-2);border-radius:999px;padding:6px 12px;color:var(--muted)}
.tabs{display:flex;gap:6px;flex-wrap:wrap;border-bottom:1px solid var(--grid);margin:0 0 18px}
.tabs button{font:600 15px "DM Sans",sans-serif;background:none;border:0;border-bottom:3px solid transparent;color:var(--muted);padding:10px 14px;cursor:pointer}
.tabs button[aria-selected=true]{color:var(--ink);border-color:var(--chalk)}
.tool{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:22px;align-items:start}
.tool.wide{grid-template-columns:340px minmax(0,1fr)}
.card{background:var(--paper-2);border:1px solid var(--grid);border-radius:12px;padding:18px 20px}
.card h3{font:700 17px "DM Sans",sans-serif;margin:0 0 12px}
.card+.card{margin-top:16px}
.fg{display:grid;grid-template-columns:1fr 1fr;gap:12px 14px}
.fg .full{grid-column:1/-1}
.fg>*,.tool>*,.cl>*{min-width:0}
label{display:grid;gap:5px;font:600 13px "DM Sans",sans-serif;color:var(--muted)}
input,select{font:16px "DM Sans",sans-serif;color:var(--ink);background:var(--paper);border:1px solid var(--grid);border-radius:8px;padding:9px 10px;width:100%;min-width:0}
input[type=color]{padding:2px;height:40px}
input[type=checkbox]{width:auto;accent-color:#a9481f}
label.ck{display:flex;align-items:center;gap:8px;color:var(--ink);font-weight:500}
.res{display:grid;gap:10px}
.big{display:flex;justify-content:space-between;align-items:baseline;gap:10px;border-bottom:1px solid var(--grid);padding:10px 0}
.big:last-child{border-bottom:0}
.big span{font:600 14px "DM Sans",sans-serif;color:var(--muted)}
.big b{font:500 30px/1.1 "Source Serif 4",Georgia,serif;color:var(--ink);text-align:right}
.big small{display:block;font:600 13px "DM Sans",sans-serif;color:var(--muted);text-align:right}
.hint{font:13.5px/1.5 "DM Sans",sans-serif;color:var(--muted);margin:10px 0 0}
.btns{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px}
.btns button,.btn{font:700 14.5px "DM Sans",sans-serif;border-radius:3px;padding:11px 16px;cursor:pointer;border:1px solid var(--ink);background:none;color:var(--ink);text-decoration:none;display:inline-block}
.btns button.p,.btn.p{background:#E08A5E;border-color:#E08A5E;color:#1c1714}
.kbar{display:flex;height:14px;border-radius:99px;overflow:hidden;gap:2px;margin-top:8px}
.kkey{display:flex;flex-wrap:wrap;gap:12px;font:600 12.5px "DM Sans",sans-serif;color:var(--muted);margin-top:8px}.kkey i{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:5px}
.yc{display:grid;grid-template-columns:repeat(5,1fr);gap:10px}
.info{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px 18px;margin-top:12px}
.info div{display:flex;justify-content:space-between;gap:8px;border-bottom:1px solid var(--grid);padding:6px 0;font:14px "DM Sans",sans-serif}.info span{color:var(--muted)}
.canvas{background:#fff;border:1px solid var(--grid);border-radius:10px;padding:8px}
.canvas svg{display:block;width:100%;height:auto;max-height:78vh;margin:0 auto}
.sare{background:#fff;border:1px solid var(--grid);border-radius:10px;padding:10px;overflow-x:auto}
.sare svg{display:block;width:100%;height:auto;min-width:760px}
.zoom svg{min-width:0;width:100%;height:340px}
.sw{display:flex;flex-wrap:wrap;gap:5px;margin-top:4px}.sw button{width:22px;height:22px;border-radius:5px;border:1px solid rgba(0,0,0,.18);cursor:pointer;padding:0}
.cl{display:grid;grid-template-columns:1fr 1fr;gap:12px}
table.spec{width:100%;border-collapse:collapse;font:14px "DM Sans",sans-serif}
table.spec td{border-bottom:1px solid var(--grid);padding:7px 6px;vertical-align:middle}
table.spec td i{display:inline-block;width:14px;height:14px;border-radius:3px;border:1px solid rgba(0,0,0,.15);margin-right:8px;vertical-align:-2px}
details.fs{border:1px solid var(--grid);border-radius:10px;background:var(--paper-2);padding:0 16px;margin:10px 0}
details.fs summary{cursor:pointer;font:700 15px "DM Sans",sans-serif;padding:13px 0}
.prose{max-width:780px}
.hubg{display:grid;grid-template-columns:repeat(2,1fr);gap:18px;margin:10px 0 26px}
.hubg a{display:flex;flex-direction:column;text-decoration:none;color:inherit;background:var(--paper-2);border:1px solid var(--grid);border-radius:14px;overflow:hidden;transition:transform .2s,border-color .2s}
.hubg a:hover{transform:translateY(-3px);border-color:var(--chalk)}
.hubg img{width:100%;aspect-ratio:4/3;object-fit:cover;display:block}
.hubg .b{padding:16px 18px 18px;display:grid;gap:8px}.hubg small{font:700 11px "DM Sans",sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--chalk)}
.hubg b{font:700 20px "DM Sans",sans-serif}.hubg span{font:15px/1.5 "Source Serif 4",Georgia,serif;color:var(--muted)}.hubg em{font:700 14px "DM Sans",sans-serif;font-style:normal;color:var(--chalk)}
.tile{display:none}
.seg{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px}.seg button{font:600 14px "DM Sans",sans-serif;border:1px solid var(--grid);background:var(--paper);color:var(--ink);border-radius:999px;padding:8px 14px;cursor:pointer}
.seg button[aria-pressed=true]{background:var(--ink);color:var(--paper);border-color:var(--ink)}.seg.gar button{border-radius:8px}
.tw{overflow-x:auto}table.pt input[type=text]{min-width:220px}table.pt input[type=number]{width:80px}table.pt th{font:700 12px "DM Sans",sans-serif;text-align:left;color:var(--muted);padding:6px}
#pm-dsearch{margin-top:4px}
.cl{display:grid;grid-template-columns:250px minmax(0,1fr);gap:24px;align-items:start;margin-bottom:30px}
.cl aside{position:sticky;top:12px;max-height:calc(100vh - 24px);overflow:auto;background:var(--paper-2);border:1px solid var(--grid);border-radius:12px;padding:12px}
.cl aside input{margin-bottom:8px}
.clg{margin:10px 0 4px}.clg b{display:block;font:700 11px "DM Sans",sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--chalk);margin:0 0 4px}
.clg a{display:block;font:500 14px/1.35 "DM Sans",sans-serif;color:var(--ink);text-decoration:none;padding:6px 8px;border-radius:6px}
.clg a:hover{background:var(--paper)}.clg a[aria-current=true]{background:var(--ink);color:var(--paper)}
.clm{display:none;margin-bottom:12px}
.clh small{font:700 11px "DM Sans",sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--chalk)}.clh h2{margin:4px 0 6px;font-size:26px}.clh p{margin:0 0 16px;color:var(--muted);font-size:16px}
.iu{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);gap:6px}.iu .un{font-size:14px}
details.fx{margin-top:12px;border-top:1px solid var(--grid);padding-top:8px}details.fx summary{cursor:pointer;font:700 13.5px "DM Sans",sans-serif;color:var(--chalk)}details.fx p{font:14px/1.55 "DM Sans",sans-serif;color:var(--muted);margin:6px 0 0}
.res .big b{font-size:22px}
@media (max-width:860px){.cl{grid-template-columns:1fr}.cl aside{display:none}.clm{display:grid}.tl-h,.tool,.tool.wide,.hubg{grid-template-columns:1fr}.yc{grid-template-columns:1fr 1fr}.fg{grid-template-columns:1fr 1fr}}
@media print{body{padding:0}nav,footer,.tabs,.noprint,.prose,.tl-h,details.fs,.fctab{display:none!important}.card{border:0;padding:0}
 #p-tiles .tile{display:block;page-break-after:always}#p-tiles .tile p{font:10px "DM Sans",sans-serif;margin:2mm 0 0}
 body.pt .wrap>*:not(#p-tiles){display:none!important}}
@page{size:A4;margin:10mm}
</style>'''


def page(fn, title, body, js='', auth=False):
    pre = '<script>window.FC_PREVIEW=' + ('true' if os.environ.get('PM_PREVIEW') else 'false') + ';</script>' if auth else ''
    au = '<script type="module" src="auth.js"></script>' if auth else ''
    open(OUT + fn, 'w').write(HEAD.format(title=E(title)).replace('</style>', '</style>' + CSS, 1) + body + FOOT.replace('</div></body>', pre + (('<script>' + JS('common.js') + js + '</script>') if js else '') + au + '</div></body>'))


def num(id_, lab, val, step='any', mn='0', extra=''):
    return f'<label>{lab}<input type="number" id="{id_}" value="{val}" step="{step}" min="{mn}" inputmode="decimal"{extra}></label>'


def sel(id_, lab, opts, cur=None):
    return f'<label>{lab}<select id="{id_}">' + ''.join(f'<option value="{v}"{" selected" if v == cur else ""}>{E(t)}</option>' for v, t in opts) + '</select></label>'


def big(lab, id_, sub=''):
    return f'<div class="big"><span>{lab}</span><b><span id="{id_}" style="font:inherit;color:inherit">–</span>{f"<small id={chr(34)}{sub}{chr(34)}></small>" if sub else ""}</b></div>'


# ------------------------------------------------------------------ hub
TOOLS = [('textile-calculator.html', 'Textile calculator', 'Fabric, GSM, yarn & costing',
          '27 calculators: yarn counts in 15 systems, ply, twist and strength, reed, warp and weft, GSM and cover factor, knitting, consumption, markers, thread, SMV, dyeing, regain, costing and units.', 'hub-fabrics-art-forecast'),
         ('pattern-maker.html', 'Pattern maker', 'Members · garments and Forecut details',
          'Draft kurtas, shirts, blouses, dresses, skirts, lehengas, trousers and more from measurements or from a Forecut detail. Automatic fit checks, a how-to-measure guide, per-piece seam allowance and true-scale PDF, DXF, SVG and PNG downloads.', 'couture-bespoke-tailoring-2026')]
hub = ('<div class="eb">Free tools</div><div class="tl-h"><div><h1>Design and production tools</h1>'
       '<p class="lead">Quick, practical calculators and planners for designers, students, D2C brands and production teams. The textile calculator is free for everyone; the pattern maker is free for signed-in Forecut members. Both run entirely in your browser: nothing you type is sent to us.</p></div>'
       '<div class="chiprow"><span>Free</span><span>Works on phone</span><span>Metric and imperial</span><span>PDF, DXF, SVG and PNG patterns</span><span>Nothing is uploaded</span></div></div>'
       '<div class="hubg">' + ''.join(f'<a href="{fn}"><img src="img/{img}.webp" alt="" loading="lazy" width="800" height="600"><span class="b"><small>{E(k)}</small><b>{E(t)}</b><span>{E(d)}</span><em>Open the tool →</em></span></a>' for fn, t, k, d, img in TOOLS) + '</div>'
       '<div class="prose"><h2>What each tool is for</h2>'
       '<p><b>The textile calculator</b> answers the questions that come up every day between a design team and a fabric supplier: how many metres to order for a run of kurtas, what a 180 GSM fabric weighs per metre, what a price per kilo means per metre, how a 40s cotton compares with a 150 denier polyester, how much to allow for shrinkage, and what a garment must sell for once fabric, trims, making, margins and GST are added.</p>'
       '<p><b>The pattern block maker</b> drafts simple blocks from your own measurements: a kurta or tunic front and back with a sleeve whose cap is matched to the armhole, and a straight or A-line skirt with darts. Blocks are drawn at true scale in centimetres, so you can download them as SVG for a plotter or print them on A4 sheets and tape them together. They are starting points for a first toile, not finished production patterns.</p>'
              '<h2>How accurate are they?</h2>'
       '<p>Formulas such as GSM, yarn count and weight conversions are exact. Fabric consumption figures are typical industry estimates for a size M garment and change with style, fabric direction, prints that need matching and how tightly a marker is laid, so treat them as a planning figure and confirm with your cutting master or CAD marker before ordering bulk. Pattern blocks use standard, simplified drafting and should always be tested in calico or muslin first.</p>'
       + DT.HUB +
       '<p>Ideas for another tool? Write to <a href="mailto:hello@forecut.in">hello@forecut.in</a>.</p></div>')
page('tools.html', 'Free Fashion Design Tools · Textile Calculator & Pattern Blocks · Forecut', hub)

# ------------------------------------------------------------------ textile calculator
GARMENTS = [  # name, metres at 44"/112 cm, metres at 58"/147 cm, fixed length?, note
    ("Men's shirt, full sleeve", 2.5, 1.75, 0, 'Typical for a regular-fit shirt with a collar and cuffs, size M.'),
    ("Men's shirt, half sleeve", 2.0, 1.5, 0, 'Regular fit, size M.'),
    ("Women's kurta, knee length", 2.5, 1.75, 0, 'Straight or A-line kurta with 3/4 sleeves, size M.'),
    ("Women's kurta, calf length / Anarkali", 3.5, 2.6, 0, 'Longer kurtas and gentle flares; full Anarkalis with many panels can need 5 m or more.'),
    ("Men's kurta, full sleeve", 2.75, 2.0, 0, 'Knee-length kurta, size M.'),
    ('Trousers / pants', 2.3, 1.25, 0, 'At 44" both legs rarely fit across one width, so two lengths are usually needed.'),
    ('Palazzo pants', 2.4, 1.8, 0, 'Wide-leg palazzo, ankle length.'),
    ('Salwar / churidar', 2.5, 2.0, 0, 'Churidars are often cut on the bias, which uses more fabric.'),
    ('Saree blouse', 0.8, 0.6, 0, 'Standard blouse piece; long sleeves or a peplum need about 1–1.2 m.'),
    ('Lehenga skirt, kalidar', 4.5, 3.5, 0, 'Flare is the big variable: a very full lehenga can need 6–8 m.'),
    ('A-line dress, knee length', 2.2, 1.6, 0, 'Sleeveless or cap sleeve, size M.'),
    ('Nehru jacket / waistcoat', 1.6, 1.25, 0, 'Outer fabric only; add the same again for lining.'),
    ('Blazer (outer fabric)', 2.4, 1.6, 0, 'Single-breasted, size M; lining and interlining extra.'),
    ('Dupatta / stole', 2.5, 2.5, 1, 'A dupatta is a fixed length (about 2.25–2.5 m); width sets its breadth.'),
]
WIDTHS = [('91', '36" (91 cm)'), ('112', '44" (112 cm)'), ('114', '45" (114 cm)'), ('137', '54" (137 cm)'), ('147', '58" (147 cm)'), ('152', '60" (152 cm)')]
CATS = [('Yarn', 'count systems, ply, length and weight, twist, strength, diameter and sett, blend price'), ('Weaving', 'reed and ends, warp and weft, GSM from construction, cover factor, loom-to-finished, loom production'),
        ('Knitting', 'knit GSM and tightness, circular machine needles, width and output'), ('Garment', 'woven and knit consumption, marker efficiency, sewing thread, shrinkage, SMV, costing to MRP'),
        ('Dyeing & processing', 'dye recipe and liquor, padding pick-up, moisture regain and invoice weight'), ('Units', 'every length, weight, area, GSM, density, twist, force, volume, price and temperature unit')]
IC = {  # small line icons (24px grid, 1.6 stroke)
    'search': '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>',
    'minus': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12"/></svg>', 'plus': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12M12 6v12"/></svg>',
    'fit': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/></svg>',
    'grid': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v16H4zM4 9.3h16M4 14.6h16M9.3 4v16M14.6 4v16"/></svg>',
    'down': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11m-4.5-4.5L12 15l4.5-4.5M5 19.5h14"/></svg>',
    'chev': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5"/></svg>'}
TCCSS = r"""<style>
.wrap{max-width:1500px!important}
.tch{display:flex;justify-content:space-between;align-items:flex-end;gap:12px 24px;flex-wrap:wrap;margin:26px 0 14px}.tch>div{display:grid;gap:6px}.tch .eb{margin:0}.tch h1{font-size:30px!important;line-height:1.1;margin:0}
.tch .tag{font:600 12px "DM Sans",sans-serif;color:var(--muted);border:1px solid var(--grid);border-radius:4px;padding:5px 9px;white-space:nowrap}
.tcx{--bg:#1b1d20;--p1:#212428;--p2:#2a2e33;--p3:#33383e;--ln:#3a3f46;--tx:#e8e6e1;--mu:#9da3aa;--dim:#6f757c;--ac:#e08a5e;--ac2:#f0a37b;
  font:13px/1.45 "DM Sans",sans-serif;color:var(--tx);background:var(--p1);border:1px solid #121315;border-radius:8px;overflow:hidden;position:relative;color-scheme:dark}
.tcx p,.tcx li,.tcx label,.tcx span,.tcx b,.tcx h2,.tcx h3{font-family:"DM Sans",sans-serif}
.tcx .ic{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round;flex:none}
.tcx button{font:inherit;color:inherit;cursor:pointer}
.tcx input,.tcx select{font:13px "DM Sans",sans-serif;color:var(--tx);background:#16181b;border:1px solid var(--ln);border-radius:3px;padding:5px 8px;height:32px;width:100%;min-width:0;margin:0}
.tcx input:hover,.tcx select:hover{border-color:#4b5159}.tcx input:focus,.tcx select:focus{outline:0;border-color:var(--ac);box-shadow:0 0 0 2px rgba(224,138,94,.22)}
.tcx button:focus-visible,.tcx a:focus-visible{outline:2px solid var(--ac);outline-offset:1px}.tcx select option,.tcx select optgroup{background:#16181b;color:var(--tx)}
.tbar{display:flex;align-items:center;gap:8px;padding:6px 8px;background:var(--bg);border-bottom:1px solid #121315;flex-wrap:wrap}
.tbar .brand{display:flex;align-items:center;gap:8px;padding:0 10px 0 4px;border-right:1px solid var(--ln);font-weight:700;letter-spacing:.02em;white-space:nowrap}.tbar .brand i{width:8px;height:8px;border-radius:2px;background:var(--ac)}
.tcr{display:flex;align-items:center;gap:6px;min-width:0;flex:1 1 220px;white-space:nowrap;overflow:hidden;color:var(--mu)}.tcr b{color:var(--tx);overflow:hidden;text-overflow:ellipsis}.tcr i{font-style:normal;color:var(--dim)}
.tsr{position:relative;display:flex;align-items:center;flex:0 1 330px;min-width:200px}.tsr .ic{position:absolute;left:9px;color:var(--mu)}.tsr input{padding-left:30px;padding-right:34px;height:30px}
.tsr kbd{position:absolute;right:7px;font:600 10.5px ui-monospace,Menlo,monospace;color:var(--dim);border:1px solid var(--ln);border-radius:3px;padding:0 5px;line-height:16px}
.xb{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 11px;border-radius:3px;border:1px solid var(--ln);background:var(--p2);font-weight:600;white-space:nowrap}.xb:hover{background:var(--p3)}
.tbody{display:grid;grid-template-columns:270px minmax(0,1fr);min-height:640px}
.tnav{display:block!important;background:var(--p1);border-right:1px solid #121315;overflow:auto;max-height:calc(100vh - 150px);position:sticky;top:0;scrollbar-width:thin;scrollbar-color:#3a3f46 transparent;padding:6px 0 14px}
.tg h4{display:flex;justify-content:space-between;margin:12px 14px 4px;font:700 10.5px "DM Sans",sans-serif;letter-spacing:.09em;text-transform:uppercase;color:var(--mu)}.tg h4 small{font:600 10.5px ui-monospace,Menlo,monospace;color:var(--dim);letter-spacing:0}
.tg a{display:block;margin:0 8px;padding:6px 8px;border-radius:3px;color:var(--mu);text-decoration:none;font-size:13px;line-height:1.3}.tg a:hover{background:var(--p2);color:var(--tx)}
.tg a[aria-current=true]{background:var(--p3);color:var(--tx);font-weight:700;box-shadow:inset 2px 0 0 var(--ac)}
.tg.rec a{display:flex;justify-content:space-between;gap:8px}.tg.rec a small{color:var(--dim);font-size:11px;white-space:nowrap}
.tnone{margin:14px;color:var(--dim);font-size:12.5px}
.tmain{min-width:0;background:var(--stage,#26292e);padding:20px 22px 26px}
.tmh{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:16px}.tmh small{font:700 10.5px "DM Sans",sans-serif;letter-spacing:.09em;text-transform:uppercase;color:var(--ac2)}
.tmh h2{font:700 24px/1.2 "DM Sans",sans-serif!important;color:var(--tx);margin:4px 0 6px}.tmh p{margin:0;color:var(--mu);max-width:760px;font-size:13.5px}
.tgrid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.08fr);gap:16px;align-items:start}
.tp{background:var(--p1);border:1px solid var(--ln);border-radius:6px;overflow:hidden}
.tp>h3{display:flex;justify-content:space-between;align-items:center;margin:0;padding:9px 14px;background:var(--bg);border-bottom:1px solid var(--ln);font:700 10.5px "DM Sans",sans-serif!important;letter-spacing:.09em;text-transform:uppercase;color:var(--mu)}
.tp>h3 button{border:0;background:none;color:var(--mu);font:600 11.5px "DM Sans",sans-serif;letter-spacing:0;text-transform:none;display:inline-flex;gap:5px;align-items:center}.tp>h3 button:hover{color:var(--tx)}
.tin{padding:10px 14px 14px;display:grid;gap:2px}
.ir{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);gap:10px;align-items:center;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.04)}.ir:last-child{border-bottom:0}
.ir>span,.ir>span label{color:var(--mu);font-size:12.5px;font-weight:500;margin:0}.tcx label{color:inherit}.ir.on>span{color:var(--ac2)}
.iu2{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);gap:4px}.iu2 input{text-align:right;font-variant-numeric:tabular-nums}.iu2 select{color:var(--mu)}
.ir input[type=number]{text-align:right;font-variant-numeric:tabular-nums}
.ans{padding:16px 16px 14px;border-bottom:1px solid var(--ln);background:linear-gradient(180deg,rgba(224,138,94,.08),transparent)}
.ans span{display:block;color:var(--mu);font-size:12.5px;margin-bottom:4px}.ans b{display:block;font:700 30px/1.15 "DM Sans",sans-serif;color:var(--tx);font-variant-numeric:tabular-nums;letter-spacing:-.01em}
.ans em{display:block;font-style:normal;color:var(--ac2);font:600 12.5px ui-monospace,Menlo,monospace;margin-top:6px}
.rt2{padding:4px 14px 10px}.rr{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06);align-items:baseline}.rr:last-child{border-bottom:0}
.rr span{color:var(--mu);font-size:12.5px}.rr b{font:600 13.5px ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--tx);text-align:right;font-variant-numeric:tabular-nums}.rr b i{font-style:normal;color:var(--dim);font-weight:500}.rr b.tx{font:500 12.5px/1.45 "DM Sans",sans-serif;color:var(--tx);max-width:62%;justify-self:end}
.fxb{margin-top:16px}.fxb .fx2{padding:12px 14px;font:12.5px/1.65 ui-monospace,SFMono-Regular,Menlo,monospace;color:#cfd3d8;white-space:normal}
.tnote{margin:12px 2px 0;font-size:12px;color:var(--dim)}
.tsel{display:none}
.toast2{position:absolute;left:50%;bottom:18px;transform:translateX(-50%);background:#f4f1ea;color:#1b1d20;border-radius:4px;padding:8px 14px;font-size:12.5px;font-weight:600;box-shadow:0 10px 28px rgba(0,0,0,.4);margin:0;z-index:30}
.tcdoc{margin-top:26px}.tcdoc>summary{cursor:pointer;font:700 15px "DM Sans",sans-serif;padding:12px 0;border-top:1px solid var(--grid);list-style:none;display:flex;justify-content:space-between}.tcdoc>summary::-webkit-details-marker{display:none}.tcdoc>summary::after{content:"Show";font:600 12px "DM Sans",sans-serif;color:var(--muted)}.tcdoc[open]>summary::after{content:"Hide"}
@media (max-width:1100px){.tgrid{grid-template-columns:1fr}}
@media (max-width:860px){.tbody{grid-template-columns:1fr}.tnav{display:none!important}.tsel select{min-height:44px;font-size:16px}.tch{flex-wrap:wrap}.tch .tag{white-space:normal;max-width:100%}.tbar button,.tbar .xbtn{min-height:40px}.tmain input,.tmain select{min-height:40px;font-size:16px}.tsel{display:block;padding:10px 14px 0;background:var(--stage,#26292e)}.tsel label{display:grid;gap:4px;color:var(--mu);font-size:12px}.tbar .brand{display:none}.tsr{flex:1 1 100%;order:5}.tmain{padding:14px}.ans b{font-size:26px}}
@media print{.tbar,.tnav,.tsel,.tcdoc,.tch .tag{display:none!important}.tcx{border:0;color:#000;background:#fff}.tmain{background:#fff}.tp{border-color:#ccc;background:#fff}}
</style>"""
TI = lambda k: IC[k].replace('<svg ', '<svg class="ic" ', 1)
IC.update({'copy': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 8h11v12H8zM5 16V4h11"/></svg>', 'reset': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v5h5"/></svg>',
           'print': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 9V3h10v6M7 17H4v-7h16v7h-3M7 14h10v7H7z"/></svg>'})
tc = (TCCSS + '<div class="tch"><div><div class="eb">Free tool</div><h1>Textile calculator</h1></div><span class="tag">27 calculators · 15 yarn count systems · metric and imperial</span></div>'
      '<div class="tcx" id="tc-app"><div class="tbar"><span class="brand"><i></i>FORECUT TEXTILE CALC</span><div class="tcr" id="tc-crumb"></div>'
      '<label class="tsr">' + TI('search') + '<input type="search" id="cl-q" placeholder="Search calculators, e.g. GSM, denier, costing" aria-label="Search calculators" autocomplete="off"><kbd>/</kbd></label>'
      '<button type="button" class="xb" id="tc-copy">' + TI('copy') + 'Copy results</button><button type="button" class="xb" id="tc-reset" title="Back to the example values">' + TI('reset') + 'Reset</button><button type="button" class="xb" id="tc-print">' + TI('print') + 'Print</button></div>'
      '<div class="tbody"><nav class="tnav noprint" id="cl-list" aria-label="Calculators"></nav>'
      '<div class="tmain"><div class="tsel noprint"><label>Calculator<select id="cl-sel"></select></label></div><div id="cl-pane"></div></div></div>'
      '<p class="toast2" id="tc-msg" role="status" hidden></p></div>'
      '<details class="tcdoc"><summary>About the textile calculator: units, yarn counts and where the formulas come from</summary>'
'<div class="prose"><h2>What is in the textile calculator</h2><ul>' + ''.join(f'<li><b>{E(c)}:</b> {E(d)}.</li>' for c, d in CATS) + '</ul>'
      '<h2>Units and yarn counts</h2>'
      '<p>Every length, width, weight, area, density and price box has its own unit menu, so you can mix units freely: a reed width in inches, a cloth length in metres and a yarn price per pound all work together. Yarn counts can be entered in any of 15 systems, from English cotton (Ne), metric (Nm), tex, dtex and denier to worsted, linen lea, American woollen run and cut, Yorkshire skein, spun silk, raw silk drams and jute. Internally every count is converted to tex, the weight in grams of 1000 metres, which keeps mixed-system calculations exact.</p>'
      '<h2>Where the formulas come from</h2>'
      '<p>The yarn, warp, weft, reed, mixing and cloth-structure calculations follow the classic rules set out in E. A. Posselt\'s <i>Textile Calculations</i> (1906), restated in modern units. For example, 12,600 yards of 30s cotton weigh 8 oz, and a 20s and a 60s twisted together make a 15s. Knitting, garment, sewing-thread, SMV, dyeing and regain calculations use the standard formulas taught in textile and apparel courses today. Each calculator shows its formula, so you can check the working.</p>'
      '<h2>Good to know</h2><ul><li>Formulas and unit conversions are exact. Consumption, thread ratios, packing factors and typical ranges are rules of thumb: confirm with your marker, your mill or a lab test before ordering bulk.</li>'
      '<li>Wider fabric is often cheaper per garment even when the price per metre is higher: compare the fabric cost per piece.</li>'
      '<li>GST on garments depends on the price band and can change; check the current rate.</li></ul>'
      + DT.CALC +
      '<p>Related: the <a href="fabrics.html">Fabrics hub</a> for weaves, knits and GSM ranges, and the <a href="india-textile-craft-guide.html">India textile and craft sourcing guide</a>.</p></div></details>')
page('textile-calculator.html', 'Textile Calculator · Yarn Count, GSM, Warp & Weft, Knitting, Garment Costing, Units · Forecut', tc,
     'window.FC_GARMENTS=' + json.dumps(GARMENTS) + ';' + JS('calcs.js'))

# ------------------------------------------------------------------ pattern maker (sign-in only)
import pm_details
PMD = pm_details.build()
PM_NAMES = {'bodice': 'fitted bodice', 'kurta': 'kurta', 'shirt': 'shirt', 'tshirt': 'T-shirt', 'hoodie': 'hoodie', 'blouse': 'saree blouse', 'top': 'top', 'dress': 'dress', 'jacket': 'Nehru jacket / waistcoat', 'skirt': 'skirt', 'lehenga': 'lehenga', 'trousers': 'trousers', 'anarkali': 'Anarkali', 'angrakha': 'angrakha', 'sherwani': 'sherwani', 'bandhgala': 'bandhgala', 'salwar': 'salwar', 'patiala': 'patiala salwar', 'churidar': 'churidar', 'gharara': 'gharara'}
IC.update({'tiles': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 3h7v9H4zM13 3h7v9h-7zM4 14h7v7H4zM13 14h7v7h-7z"/></svg>',
           'check': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>', 'warn': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4 2.5 20h19zM12 10v4.5M12 17.5v.01"/></svg>',
           'ruler': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 16 16 3l5 5L8 21zM7 12l2 2M10 9l2 2M13 6l2 2"/></svg>'})
PMCSS = r"""<style>
.wrap{max-width:none!important;padding-left:16px!important;padding-right:16px!important}
.pmh{display:flex;justify-content:space-between;align-items:flex-end;gap:12px 24px;flex-wrap:wrap;margin:26px 0 14px}.pmh>div{display:grid;gap:6px}
.pmh .eb{margin:0}.pmh h1{font-size:30px!important;line-height:1.1;margin:0}
.pmh p{margin:0;max-width:660px;font:14px/1.5 "DM Sans",sans-serif;color:var(--muted)}
.pmh .tag{font:600 12px "DM Sans",sans-serif;color:var(--muted);border:1px solid var(--grid);border-radius:4px;padding:5px 9px;white-space:nowrap}
.gate{max-width:520px;margin:30px 0 60px;border:1px solid var(--grid);border-radius:8px;background:var(--paper-2);padding:24px 26px}
.gate h3{font:700 18px "DM Sans",sans-serif;margin:0 0 6px}.gate p{margin:0 0 16px;color:var(--muted);font:15px/1.5 "DM Sans",sans-serif}
/* ---- workspace: fixed industrial CAD palette, independent of the site theme ---- */
.pmx{--bg:#1b1d20;--p1:#212428;--p2:#2a2e33;--p3:#33383e;--ln:#3a3f46;--tx:#e8e6e1;--mu:#9da3aa;--dim:#6f757c;--ac:#e08a5e;--ac2:#f0a37b;--ok:#6fbf8e;--wa:#e3b341;--stage:#2b2f34;--paper:#fbfaf7;
  font:12.5px/1.4 "DM Sans",sans-serif;color:var(--tx);background:var(--p1);border:1px solid #121315;border-radius:8px;overflow:hidden;position:relative;color-scheme:dark}
.pmx .ic{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round;flex:none}
.pmx button{font:inherit;color:inherit;cursor:pointer}
.pmx input,.pmx select{font:12.5px "DM Sans",sans-serif;color:var(--tx);background:#16181b;border:1px solid var(--ln);border-radius:3px;padding:4px 7px;height:28px;width:100%;min-width:0;margin:0}
.pmx input:hover,.pmx select:hover{border-color:#4b5159}.pmx input:focus,.pmx select:focus{outline:0;border-color:var(--ac);box-shadow:0 0 0 2px rgba(224,138,94,.22)}
.pmx button:focus-visible{outline:2px solid var(--ac);outline-offset:1px}
.pmx input[type=checkbox]{width:14px;height:14px;padding:0;accent-color:var(--ac);flex:none}
.pmx select option{background:#16181b;color:var(--tx)}
/* toolbar */
.pbar{display:flex;align-items:center;gap:8px;padding:6px 8px;background:var(--bg);border-bottom:1px solid #121315;flex-wrap:wrap}
.brand{display:flex;align-items:center;gap:8px;padding:0 10px 0 4px;border-right:1px solid var(--ln);font-weight:700;letter-spacing:.02em;white-space:nowrap}.brand i{width:8px;height:8px;border-radius:2px;background:var(--ac)}
.crumb{display:flex;align-items:center;gap:6px;min-width:0;flex:1 1 240px;white-space:nowrap;overflow:hidden;color:var(--mu)}.crumb b{color:var(--tx);overflow:hidden;text-overflow:ellipsis}.crumb i{font-style:normal;color:var(--dim)}
.crumb code{font:600 11px ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--ac2);background:rgba(224,138,94,.1);border:1px solid rgba(224,138,94,.3);border-radius:3px;padding:2px 6px}
.srch{position:relative;display:flex;align-items:center;flex:0 1 320px;min-width:190px}.srch .ic{position:absolute;left:8px;color:var(--mu)}
.srch input{padding-left:28px}.srch small{position:absolute;right:8px;color:var(--dim);font-size:11px}
.useg{display:inline-flex;border:1px solid var(--ln);border-radius:3px;overflow:hidden;height:28px}
.useg button{border:0;background:#16181b;padding:0 10px;font-weight:600;color:var(--mu)}.useg button+button{border-left:1px solid var(--ln)}.useg button[aria-pressed=true]{background:var(--p3);color:var(--tx)}
.xbtn{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 11px;border-radius:3px;border:1px solid var(--ln);background:var(--p2);font-weight:600;white-space:nowrap}
.xbtn:hover{background:var(--p3)}.xbtn.pri{background:var(--ac);border-color:var(--ac);color:#1b1d20}.xbtn.pri:hover{background:var(--ac2)}
.qa{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;border-radius:3px;border:1px solid rgba(111,191,142,.35);background:rgba(111,191,142,.1);color:var(--ok);font-weight:700;white-space:nowrap}
.qa.w{border-color:rgba(227,179,65,.4);background:rgba(227,179,65,.1);color:var(--wa)}
.exp{position:relative}
.menu{position:absolute;right:0;top:34px;z-index:20;width:300px;background:var(--p2);border:1px solid var(--ln);border-radius:5px;box-shadow:0 14px 36px rgba(0,0,0,.45);padding:5px}
.menu button{display:grid;grid-template-columns:46px 1fr;gap:1px 10px;align-items:center;width:100%;text-align:left;border:0;background:none;border-radius:3px;padding:7px 8px}
.menu button:hover,.menu button:focus-visible{background:var(--p3)}
.menu b{grid-row:span 2;font:700 10.5px ui-monospace,Menlo,monospace;border:1px solid var(--ln);border-radius:3px;padding:3px 0;text-align:center;color:var(--ac2)}
.menu span{font-weight:600}.menu small{color:var(--mu);font-size:11.5px}.menu hr{border:0;border-top:1px solid var(--ln);margin:4px 2px}
/* layout */
.pbody{display:grid;grid-template-columns:280px minmax(0,1fr) 360px;height:clamp(640px,calc(100vh - 128px),1400px)}
.pl,.pr{overflow:auto;background:var(--p1);scrollbar-width:thin;scrollbar-color:#3a3f46 transparent}.pl{border-right:1px solid #121315}.pr{border-left:1px solid #121315}
.sec{border-bottom:1px solid var(--ln)}
.sec>summary{display:flex;align-items:center;justify-content:space-between;gap:8px;list-style:none;cursor:pointer;padding:9px 12px;font:700 10.5px "DM Sans",sans-serif;letter-spacing:.09em;text-transform:uppercase;color:var(--mu);background:var(--bg)}
.sec>summary::-webkit-details-marker{display:none}.sec>summary .ic{transition:transform .15s;width:14px;height:14px}.sec:not([open])>summary .ic{transform:rotate(-90deg)}
.sec>summary em{font-style:normal;text-transform:none;letter-spacing:0;color:var(--tx);font-weight:600;font-size:12px}
.sec>.bd{padding:10px 12px 12px}
.cats{display:grid;grid-template-columns:repeat(4,1fr);border:1px solid var(--ln);border-radius:3px;overflow:hidden;margin-bottom:8px}
.cats button{border:0;background:#16181b;padding:5px 2px;font-size:12px;font-weight:600;color:var(--mu)}.cats button+button{border-left:1px solid var(--ln)}.cats button[aria-pressed=true]{background:var(--p3);color:var(--tx);box-shadow:inset 0 -2px 0 var(--ac)}
.glist{display:grid;gap:1px}
.glist button{display:flex;justify-content:space-between;gap:6px;border:0;background:none;text-align:left;padding:5px 8px;border-radius:3px;color:var(--mu)}
.glist button:hover{background:var(--p2);color:var(--tx)}.glist button[aria-pressed=true]{background:var(--p3);color:var(--tx);font-weight:700;box-shadow:inset 2px 0 0 var(--ac)}
.glist button small{color:var(--dim);font:600 10.5px ui-monospace,Menlo,monospace}
.dnote{margin:8px 0 0;font-size:11.5px;color:var(--mu)}.dnote b{color:var(--ac2)}
.row{display:grid;grid-template-columns:minmax(0,1fr) 104px;align-items:center;gap:8px;padding:2px 0;border-radius:3px}
.row>span:first-child{color:var(--mu);overflow:hidden;text-overflow:ellipsis}
.row.on>span:first-child{color:var(--ac2)}.row.wide{grid-template-columns:minmax(0,1fr) 150px}
.uin{position:relative;display:block}.uin input{padding-right:28px;text-align:right;font-variant-numeric:tabular-nums}.uin i{position:absolute;right:7px;top:50%;transform:translateY(-50%);font-style:normal;font-size:10.5px;color:var(--dim);pointer-events:none}
.acts{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}.acts .xbtn{height:26px;font-size:12px;padding:0 9px}
.hint2{font-size:11.5px;color:var(--dim);margin:8px 0 0}
/* body diagram */
.fig{display:grid;grid-template-columns:44% 1fr;gap:12px;align-items:start;background:#16181b;border:1px solid var(--ln);border-radius:4px;padding:10px;margin-bottom:8px}
.fv{display:grid;gap:6px}.vt{display:grid;grid-template-columns:1fr 1fr;border:1px solid var(--ln);border-radius:3px;overflow:hidden}.vt button{border:0;background:#16181b;padding:3px 0;font-size:11.5px;font-weight:600;color:var(--mu)}.vt button+button{border-left:1px solid var(--ln)}.vt button[aria-pressed=true]{background:var(--p3);color:var(--tx)}
.fig svg{width:100%;height:auto;display:block}
.fig .bd0{fill:#2a2e33;stroke:#5d636b;stroke-width:.9}.fig .gd{stroke:#4a5057;stroke-width:.6;stroke-dasharray:2 2;fill:none}.fig .vl{font:700 7px "DM Sans",sans-serif;fill:#6f757c;letter-spacing:.1em}
.fig .ms{fill:none;stroke:transparent;stroke-width:7;cursor:pointer}.fig .mv{fill:none;stroke:#59606a;stroke-width:1.1;pointer-events:none}.fig .mv.v{stroke-dasharray:3 2}
.fig g.on .mv{stroke:var(--ac);stroke-width:2.2}.fig g.on circle{fill:var(--ac)}.fig circle{fill:#59606a}
.fd small{display:block;font:700 10px "DM Sans",sans-serif;letter-spacing:.09em;text-transform:uppercase;color:var(--dim);margin-bottom:3px}
.fd b{display:block;color:var(--ac2);font-size:13.5px;line-height:1.3;margin-bottom:5px}.fd p{margin:0 0 7px;font-size:12px;line-height:1.5;color:var(--tx)}.fd p.tip{color:var(--mu);border-left:2px solid var(--ln);padding-left:7px}
.fd dl{display:grid;grid-template-columns:auto 1fr;gap:3px 8px;margin:8px 0 0;font-size:11.5px}.fd dt{color:var(--dim)}.fd dd{margin:0;color:var(--tx)}
.mg{font:700 10.5px "DM Sans",sans-serif;letter-spacing:.09em;text-transform:uppercase;color:var(--mu);margin:12px 0 4px;padding-top:8px;border-top:1px solid var(--ln)}#pm-meas>.row:first-child+.mg{border-top:0}
.pchd{display:flex;justify-content:space-between;align-items:center;font-size:11.5px;color:var(--dim);margin:0 0 2px}.pchd button{border:0;background:none;color:var(--ac2);font-weight:600;font-size:11.5px}
.pcard{display:grid;grid-template-columns:18px 1fr;column-gap:4px;padding:6px 8px!important}.pexp{border:0;background:none;color:var(--mu);padding:0;height:20px;display:flex;align-items:center}.pexp .ic{width:14px;height:14px;transition:transform .15s}.pcard.open .pexp .ic{transform:rotate(90deg)}
.pcard .t em{font-style:normal;font:600 10.5px ui-monospace,Menlo,monospace;color:var(--dim);white-space:nowrap}.pcard:not(.open) .nm,.pcard:not(.open) .a{display:none}.pcard .nm,.pcard .a{grid-column:2}
/* stage */
.pc{display:flex;flex-direction:column;min-width:0;background:var(--stage)}
.ctl{display:flex;align-items:center;gap:3px;padding:4px 6px;border-bottom:1px solid #121315;background:var(--p1);flex-wrap:wrap}
.ib{display:inline-flex;align-items:center;justify-content:center;gap:5px;height:26px;min-width:26px;padding:0 7px;border:1px solid transparent;border-radius:3px;background:none;color:var(--mu);white-space:nowrap}
.ib:hover{background:var(--p2);color:var(--tx)}.ib[aria-pressed=true]{background:var(--p3);border-color:var(--ln);color:var(--tx)}
.ctl .sep{width:1px;height:18px;background:var(--ln);margin:0 4px}
#pm-zl{min-width:48px;text-align:center;font:600 12px ui-monospace,Menlo,monospace;color:var(--tx)}
.ctl .sp{flex:1}.leg{display:flex;gap:12px;font-size:11px;color:var(--mu);padding-right:4px}.leg i{display:inline-block;width:18px;height:0;border-top:2px solid #e8e6e1;vertical-align:middle;margin-right:5px}.leg i.s{border-top:1.5px dashed #9da3aa}.leg i.f{border-top:2px dashed var(--ac)}.leg i.g{border-top:1.5px solid #6fbf8e}
.stg{flex:1;min-height:0;display:grid;grid-template-columns:22px minmax(0,1fr);grid-template-rows:22px minmax(0,1fr)}
.rc{background:var(--p1);border-right:1px solid #121315;border-bottom:1px solid #121315;font:600 9px ui-monospace,Menlo,monospace;color:var(--dim);display:flex;align-items:center;justify-content:center}
.rul{background:var(--p1);display:block;width:100%;height:100%}#pm-rx{border-bottom:1px solid #121315}#pm-ry{border-right:1px solid #121315}
.view{overflow:auto;position:relative;cursor:crosshair;padding:30px;background-color:var(--stage);background-image:linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px);background-size:24px 24px;scrollbar-width:thin;scrollbar-color:#4a5057 transparent}
.view.drag{cursor:grabbing}
#pm-svg{background:var(--paper);box-shadow:0 0 0 1px rgba(0,0,0,.5),0 12px 40px rgba(0,0,0,.45);margin:0 auto;width:max-content}
#pm-svg svg{display:block;max-width:none;max-height:none}
#pm-svg path[data-l=CUT]{vector-effect:non-scaling-stroke;stroke-width:1.6px}
#pm-svg path[data-l=SEAM]{vector-effect:non-scaling-stroke;stroke-width:1px;stroke-dasharray:6 4}
#pm-svg path[data-l=MARK]{vector-effect:non-scaling-stroke;stroke-width:1.1px}
#pm-svg path[data-l=GRAIN]{vector-effect:non-scaling-stroke;stroke-width:1.3px}
#pm-svg path[data-l^=SIZE]{vector-effect:non-scaling-stroke;stroke-width:1.3px}
#pm-svg path[data-l=TILE]{vector-effect:non-scaling-stroke;stroke-width:1.2px;stroke-dasharray:7 5}
#pm-svg path[stroke="#a9481f"][data-l=MARK]{stroke-width:2px;stroke-dasharray:9 5}
.sbar{display:flex;gap:14px;align-items:center;padding:4px 10px;border-top:1px solid #121315;background:var(--bg);font:11px ui-monospace,Menlo,monospace;color:var(--mu);white-space:nowrap;overflow:hidden}
.sbar b{color:var(--tx);font-weight:600}.sbar .xy{margin-left:auto;color:var(--ac2);min-width:150px;text-align:right}
/* right */
.gv{padding:10px 12px;border-bottom:1px solid var(--ln)}
.gv h4{display:flex;justify-content:space-between;margin:0 0 7px;font:700 10.5px "DM Sans",sans-serif;letter-spacing:.09em;text-transform:uppercase;color:var(--mu)}.gv h4 span{letter-spacing:0;text-transform:none;font-weight:500;color:var(--dim)}
#pm-flat{background:var(--paper);border-radius:4px;aspect-ratio:16/10;display:flex;align-items:center;justify-content:center;overflow:hidden}
#pm-flat svg{width:100%;height:100%;display:block}
#pm-flat .fl{fill:#fff;stroke:none}#pm-flat .st{fill:none;stroke:#1b1d20;stroke-width:1.15px;vector-effect:non-scaling-stroke;stroke-linejoin:round;stroke-linecap:round}#pm-flat .th{stroke-width:.7px;stroke:#5b6168}
#pm-flat circle{fill:#fff;stroke:#1b1d20;stroke-width:.9px;vector-effect:non-scaling-stroke}#pm-flat text{font-family:"DM Sans",sans-serif;font-weight:700;fill:#6f757c;letter-spacing:.08em}
.pmx p,.pmx li,.pmx dd,.pmx dt{font-family:"DM Sans",sans-serif}
.rt{display:flex;background:var(--bg);border-bottom:1px solid var(--ln);position:sticky;top:0;z-index:2}
.rt button{flex:1;border:0;background:none;padding:9px 0;font-size:12px;font-weight:600;color:var(--mu);border-bottom:2px solid transparent}.rt button:hover{color:var(--tx)}
.rt button[aria-selected=true]{color:var(--tx);border-bottom-color:var(--ac)}
.rp{padding:10px 12px}
.pcs{display:grid;gap:6px}
.pcard{border:1px solid var(--ln);border-radius:4px;background:var(--p2);padding:7px 8px}.pcard.off{opacity:.5}
.pcard .t{display:flex;gap:8px;align-items:center;cursor:pointer}.pcard .t code{font:700 10.5px ui-monospace,Menlo,monospace;color:var(--ac2);min-width:22px}.pcard .t b{font-weight:700;flex:1;min-width:0;color:var(--tx)}.pcard .t small{font-size:11px;color:var(--mu);white-space:nowrap}
.pcard .nm{display:grid;gap:2px;margin:6px 0 0 22px;font-size:10.5px;color:var(--dim);font-weight:600}
.pcard .a{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:5px 0 0 22px}.pcard .a label{display:grid;gap:2px;font-size:10.5px;color:var(--dim);font-weight:600}.pcard .a input{height:26px}
.ck{display:grid;gap:6px}
.ckr{display:grid;grid-template-columns:18px 1fr auto;gap:2px 8px;align-items:start;padding:7px 8px;border:1px solid var(--ln);border-radius:4px;background:var(--p2)}
.ckr .ic{width:15px;height:15px;margin-top:1px}.ckr.ok .ic{color:var(--ok)}.ckr.w .ic{color:var(--wa)}
.ckr b{font-weight:600}.ckr span{grid-column:2/4;color:var(--mu);font-size:11.5px}.ckr em{font-style:normal;font:600 11.5px ui-monospace,Menlo,monospace;color:var(--tx)}
.kv{display:grid;margin-top:12px}.kv div{display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-bottom:1px solid var(--ln)}.kv span{color:var(--mu)}.kv b{font:600 11.5px ui-monospace,Menlo,monospace;text-align:right;white-space:nowrap}
.rp h5{font:700 10.5px "DM Sans",sans-serif;letter-spacing:.09em;text-transform:uppercase;color:var(--mu);margin:14px 0 6px}.rp h5:first-child{margin-top:2px}
.about p,.about li{font-size:12px;line-height:1.5;color:var(--mu);margin:0 0 6px}.about ul{padding-left:16px;margin:0}.about b{color:var(--tx)}
.spec{display:grid;grid-template-columns:auto 1fr;gap:5px 12px;font-size:12px;margin:0}.spec dt{color:var(--dim)}.spec dd{margin:0;color:var(--tx)}
.toast{position:absolute;left:50%;bottom:36px;transform:translateX(-50%);background:#f4f1ea;color:#1b1d20;border-radius:4px;padding:8px 14px;font-size:12.5px;font-weight:600;box-shadow:0 10px 28px rgba(0,0,0,.4);margin:0;max-width:90%;z-index:30}
.ah{display:block;font-size:10.5px;color:var(--dim);line-height:1.35;margin-top:1px}
.cls{display:grid;gap:6px;margin-bottom:10px;padding:8px;border:1px solid var(--ln);border-radius:4px;background:var(--p2)}.clrow{display:grid;grid-template-columns:1fr auto;gap:6px}.clrow .xbtn{height:28px}
.clrow.small{display:flex;gap:12px;align-items:center;font-size:11px;color:var(--dim)}.lnk{border:0;background:none;color:var(--ac2);font-weight:600;font-size:11.5px;padding:0;cursor:pointer}.lnk[disabled],.xbtn[disabled]{opacity:.45;cursor:default}
.spk{display:flex;gap:10px;align-items:center;flex-wrap:wrap;padding:8px 12px;background:rgba(224,138,94,.12);border-bottom:1px solid rgba(224,138,94,.4)}.spk span{color:var(--mu);flex:1}.spk b{color:var(--ac2)}
.row.chk{grid-template-columns:minmax(0,1fr) auto}
.cst .ctiles{display:grid;grid-template-columns:1fr 1fr;gap:6px;position:sticky;top:38px;z-index:1;background:var(--p1);padding-bottom:8px}
.cst .ctile{background:var(--p2);border:1px solid var(--ln);border-radius:4px;padding:8px 9px}.cst .ctile span{display:block;font-size:11px;color:var(--mu)}.cst .ctile b{display:block;font:700 19px/1.2 "DM Sans",sans-serif;color:var(--tx);font-variant-numeric:tabular-nums}
.cst .ctile.hi{border-color:rgba(224,138,94,.5);background:linear-gradient(180deg,rgba(224,138,94,.14),rgba(224,138,94,.04))}.cst .ctile.hi b{color:var(--ac2)}.cst .ctile small{display:block;font-size:10.5px;color:var(--dim);margin-top:2px}
.cst details{border:1px solid var(--ln);border-radius:4px;margin:6px 0;background:var(--p1)}.cst summary{cursor:pointer;list-style:none;display:flex;justify-content:space-between;padding:7px 9px;font:700 10.5px "DM Sans",sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--mu)}
.cst summary::-webkit-details-marker{display:none}.cst summary em{font-style:normal;text-transform:none;letter-spacing:0;color:var(--tx);font:600 11.5px ui-monospace,Menlo,monospace}.cst details>div{padding:2px 9px 8px}
.cst .row{grid-template-columns:minmax(0,1fr) 112px}.cst .row small{color:var(--dim);font-size:10.5px;display:block}
.bk{width:100%;border-collapse:collapse;font-size:11.5px;margin-top:4px}.bk td{padding:5px 0;border-bottom:1px solid var(--ln);vertical-align:top}.bk td:last-child{text-align:right;font:600 11.5px ui-monospace,Menlo,monospace;white-space:nowrap}
.bk td small{display:block;color:var(--dim);font:10.5px ui-monospace,Menlo,monospace}.bk .bar{height:3px;background:var(--p3);border-radius:2px;margin-top:3px}.bk .bar i{display:block;height:3px;background:var(--ac);border-radius:2px}
.bk tr.t td{color:var(--tx);font-weight:700;border-bottom:1px solid #4a5057}.bk tr.g td{color:var(--ac2)}
.cst .acts2{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:10px 0}.cst .acts2 .xbtn,.cst .acts2 a{justify-content:center;font-size:12px;height:28px;text-decoration:none;color:var(--tx)}
.gt{overflow-x:auto;border:1px solid var(--ln);border-radius:4px}.gt table{border-collapse:collapse;font:11px ui-monospace,Menlo,monospace;width:100%}.gt th,.gt td{padding:5px 6px;border-bottom:1px solid var(--ln);text-align:right;white-space:nowrap}.gt td:first-child{text-align:left;font-family:"DM Sans",sans-serif;color:var(--mu);white-space:normal;min-width:120px}.gt th{color:var(--mu);font-weight:700}.gt .b{color:var(--ac2);background:rgba(224,138,94,.08)}
.cst .note{font-size:11px;color:var(--dim);margin:8px 0 0;line-height:1.45}
.pmdocw{margin:26px 0 8px;border-top:1px solid var(--grid)}.pmdocw>summary{cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center;padding:12px 0;font:700 15px "DM Sans",sans-serif}.pmdocw>summary::-webkit-details-marker{display:none}.pmdocw>summary::after{content:"Show";font:600 12px "DM Sans",sans-serif;color:var(--muted)}.pmdocw[open]>summary::after{content:"Hide"}
.pmdoc{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:28px;margin:4px 0 10px}
.pmdoc h2{font:700 15px "DM Sans",sans-serif;margin:0 0 8px}.pmdoc p,.pmdoc li{font:14px/1.55 "DM Sans",sans-serif;color:var(--muted);margin:0 0 8px}.pmdoc ul{padding-left:18px;margin:0}.pmdoc b{color:var(--ink)}
@media (max-width:1240px){.pbody{grid-template-columns:250px minmax(0,1fr) 320px}.leg{display:none}}
@media (max-width:980px){.pbody{grid-template-columns:1fr;height:auto}.pc{order:-1;height:72vh;height:72svh}.view{touch-action:pan-x pan-y}.glist{grid-template-columns:1fr 1fr;gap:2px}.glist button{padding:9px 8px;min-height:40px}.pl input,.pl select,.pr input,.pr select{min-height:38px;font-size:16px}.rt button{min-height:44px}.pmh{flex-wrap:wrap;gap:8px}.pmh .tag{white-space:normal}.pl{border-right:0;border-top:1px solid #121315}.pr{border-left:0;border-top:1px solid #121315}
 .srch{flex:1 1 100%;order:5}.brand{display:none}.crumb{flex:1 1 auto}.pmdoc{grid-template-columns:1fr}.view{padding:14px}.sbar .xy{display:none}}
</style>"""
A = lambda k: IC[k].replace('<svg ', '<svg class="ic" ', 1)
pm = (PMCSS + '<div class="pmh"><div><div class="eb">Members tool</div><h1>Pattern maker</h1></div><span class="tag">For sampling · fit-test before production</span></div>'
      '<div class="gate" id="pm-gate"><h3>Sign in to use the pattern maker</h3><p>The pattern maker is for registered Forecut members. Sign in or create a free account to draft and download patterns.</p>'
      '<div class="btns"><a class="btn p" href="account.html?next=pattern-maker.html#signin">Sign in</a><a class="btn" href="account.html?next=pattern-maker.html#signup">Create a free account</a></div></div>'
      '<div id="pm-app" class="pmx" hidden>'
      '<div class="pbar"><span class="brand"><i></i>FORECUT PATTERN</span><div class="crumb" id="pm-ttl"></div>'
      '<label class="srch" title="Load a Forecut detail">' + A('search') + '<input type="search" id="pm-dsearch" list="pm-dlist" placeholder="Load a Forecut detail…" aria-label="Load a Forecut detail"><datalist id="pm-dlist"></datalist></label>'
      '<button type="button" class="qa" id="pm-qa" title="Pattern checks"></button>'
      '<div class="useg" id="pm-units" role="group" aria-label="Units"><button type="button" data-u="cm">cm</button><button type="button" data-u="mm">mm</button><button type="button" data-u="in">in</button></div>'
      '<div class="useg" id="pm-lang" role="group" aria-label="Language"><button type="button" data-l="en" title="English">EN</button><button type="button" data-l="hi" title="हिन्दी">हिं</button></div>'
      '<div class="exp"><button type="button" class="xbtn pri" id="pm-exp" aria-haspopup="menu" aria-expanded="false">' + A('down') + 'Export</button><div class="menu" id="pm-menu" role="menu" hidden>'
      '<button type="button" role="menuitem" id="pm-dl-pdf"><b>PDF</b><span>A4 tiles for home printing</span><small id="pm-tilecount">Print at 100%, check the 5 cm square, tape together</small></button>'
      '<button type="button" role="menuitem" id="pm-dl-pdf2"><b>PDF</b><span>Full-size sheet</span><small>One page for a plotter or copy shop</small></button><hr>'
      '<button type="button" role="menuitem" id="pm-dl-dxf"><b>DXF</b><span>CAD file</span><small>Layers: CUT, SEAM, MARK, GRAIN, TEXT, BRAND</small></button>'
      '<button type="button" role="menuitem" id="pm-dl-aama"><b>AAMA</b><span>Pattern CAD DXF (AAMA/ASTM)</span><small>For Gerber, Lectra, Optitex: pieces, notches, drill holes, grain</small></button>'
      '<button type="button" role="menuitem" id="pm-dl-gdxf"><b>DXF</b><span>All sizes, graded</span><small>Every size stacked, one layer per size</small></button>'
      '<button type="button" role="menuitem" id="pm-dl-gpdf"><b>PDF</b><span>All sizes, full sheet</span><small>Graded nest for checking and plotting</small></button>'
      '<button type="button" role="menuitem" id="pm-dl-svg"><b>SVG</b><span>Vector, true scale</span><small>For Illustrator, Inkscape and tech packs</small></button>'
      '<button type="button" role="menuitem" id="pm-dl-png"><b>PNG</b><span>Image</span><small>For sharing and presentations</small></button><hr>'
      '<button type="button" role="menuitem" id="pm-dl-tech"><b>PACK</b><span>Tech pack</span><small>Graded specs, pieces, materials, construction, marker</small></button>'
      '<button type="button" role="menuitem" id="pm-dl-cost"><b>COST</b><span>Cost sheet</span><small>Print or save as PDF, with the marker</small></button>'
      '<button type="button" role="menuitem" id="pm-dl-csv"><b>CSV</b><span>Cost sheet data</span><small>For Excel or Google Sheets</small></button>'
      '<button type="button" role="menuitem" id="pm-dl-mdxf"><b>DXF</b><span>Marker</span><small>Pieces laid on the fabric width</small></button></div></div></div>'
      '<div class="pbody"><aside class="pl" aria-label="Pattern settings">'
      '<details class="sec" open><summary>Garment' + A('chev') + '</summary><div class="bd"><div class="cats" id="pm-gtabs" role="group" aria-label="Category"></div><div class="glist" id="pm-garments"></div><p class="dnote" id="pm-dnote"></p></div></details>'
      '<details class="sec" open><summary><span>Style <em id="pm-gname"></em></span>' + A('chev') + '</summary><div class="bd" id="pm-opts"></div></details>'
      '<details class="sec"><summary>Fit adjustments' + A('chev') + '</summary><div class="bd" id="pm-adj"></div></details>'
      '<details class="sec" open><summary>Seam allowance' + A('chev') + '</summary><div class="bd"><label class="row"><span>Seams, all pieces</span><span class="uin"><input type="number" step="any" min="0" id="pm-sa"><i class="u"></i></span></label>'
      '<label class="row"><span>Hems, all pieces</span><span class="uin"><input type="number" step="any" min="0" id="pm-hemall"><i class="u"></i></span></label>'
      '<div class="acts"><button type="button" class="xbtn" id="pm-apply">Apply to all pieces</button><button type="button" class="xbtn" id="pm-nosa">Net pattern</button></div><p class="hint2">Set a single piece in Pieces. Fold edges never get an allowance.</p></div></details>'
      '<details class="sec" open><summary>Fabric' + A('chev') + '</summary><div class="bd"><label class="row wide"><span>Fabric width</span><select id="pm-fw"><option value="0">Auto (44" woven, 63" knit)</option><option value="90">90 cm · 36"</option><option value="112">112 cm · 44"</option><option value="140">140 cm · 55"</option><option value="150">150 cm · 58/60"</option><option value="160">160 cm · 63"</option><option value="180">180 cm · 72"</option></select></label>'
      '<label class="row"><span>Shrinkage, length %</span><span class="uin"><input type="number" step=".5" min="0" max="15" id="pm-shl"><i>%</i></span></label><label class="row"><span>Shrinkage, width %</span><span class="uin"><input type="number" step=".5" min="0" max="15" id="pm-shw"><i>%</i></span></label>'
      '<label class="row" id="pm-strow"><span>Knit stretch, width %</span><span class="uin"><input type="number" step="5" min="0" max="100" id="pm-st"><i>%</i></span></label>'
      '<label class="row chk"><span>One-way fabric (nap, pile or directional print)</span><input type="checkbox" id="pm-oneway"></label>'
      '<p class="hint2" id="pm-fabnote">Shrinkage enlarges every piece so the garment is the right size after washing. Get the figures from a wash test of your fabric.</p></div></details>'
      '</aside><section class="pc" aria-label="Pattern sheet"><div class="ctl"><button type="button" class="ib" id="pm-zout" title="Zoom out (−)" aria-label="Zoom out">' + A('minus') + '</button><span id="pm-zl">100%</span><button type="button" class="ib" id="pm-zin" title="Zoom in (+)" aria-label="Zoom in">' + A('plus') + '</button>'
      '<button type="button" class="ib" id="pm-zfit" title="Fit sheet (0)">' + A('fit') + 'Fit</button><span class="sep"></span><button type="button" class="ib" id="pm-gridb" aria-pressed="true" title="Grid">' + A('grid') + 'Grid</button><input type="checkbox" id="pm-grid" checked hidden>'
      '<button type="button" class="ib" id="pm-tilesb" aria-pressed="false" title="Show how the pattern splits into A4 pages">' + A('tiles') + 'A4 pages</button>'
      '<button type="button" class="ib" id="pm-nestb" aria-pressed="false" title="Stack every size on each piece">' + A('grid') + 'Sizes</button><button type="button" class="ib" id="pm-markb" aria-pressed="false" title="Show the fabric marker used for costing">' + A('ruler') + 'Marker</button>'
      '<span class="sp"></span><span class="leg"><span><i></i>Cut</span><span><i class="s"></i>Sew</span><span><i class="f"></i>Fold</span><span><i class="g"></i>Grain</span></span></div>'
      '<div class="stg"><div class="rc" id="pm-ru"></div><canvas class="rul" id="pm-rx" aria-hidden="true"></canvas><canvas class="rul" id="pm-ry" aria-hidden="true"></canvas><div class="view" id="pm-view"><div id="pm-svg"></div></div></div><div class="sbar" id="pm-status"></div></section>'
      '<aside class="pr" aria-label="Garment, pieces and checks">'
      '<div class="rt" role="tablist"><button type="button" role="tab" data-t="meas" aria-selected="true">Measure</button><button type="button" role="tab" data-t="pieces" aria-selected="false">Pieces</button><button type="button" role="tab" data-t="cost" aria-selected="false">Costing</button><button type="button" role="tab" data-t="checks" aria-selected="false">Checks</button><button type="button" role="tab" data-t="about" aria-selected="false">About</button></div>'
      '<div class="rp" data-tp="meas"><div class="cls" id="pm-clients"></div><div class="fig" id="pm-fig"></div><div id="pm-meas"></div></div>'
      '<div class="rp" data-tp="pieces" hidden><div class="pcs" id="pm-pieces"></div><div class="acts"><button type="button" class="xbtn" id="pm-resetnames">Reset labels</button></div></div>'
      '<div class="rp" data-tp="cost" hidden><div id="pm-cost"></div></div>'
      '<div class="rp" data-tp="checks" hidden><h5>Automatic pattern checks</h5><div class="ck" id="pm-checks"></div><h5>Grade rules: size range</h5><div id="pm-grade"></div><h5>Measurements of this pattern</h5><div class="kv" id="pm-info" style="margin-top:0"></div></div>'
      '<div class="rp about" data-tp="about" hidden><h5>This pattern</h5><dl class="spec" id="pm-spec"></dl>'
      '<h5>Drafting method</h5><p>Blocks are drafted with established industry block methods, as taught in fashion schools and set out in standard references such as H. Joseph-Armstrong, <i>Patternmaking for Fashion Design</i>. Forecut\'s own code calculates each piece from your measurements.</p>'
      '<ul><li><b>Bodice:</b> front wider than back at the bust, bust dart sized by cup with the side seam lengthened to match, back waist and shoulder darts.</li><li><b>Sleeve:</b> cap height set from the armhole so the cap carries the right ease for the sleeve type; elbow dart on fitted long sleeves.</li><li><b>Skirt:</b> back hip wider than front; darts from the hip-to-waist difference.</li><li><b>Trousers:</b> crotch depth plus ease, extensions by fit, crotch width checked against the thigh, back inseam walked 0.5 cm shorter.</li></ul>'
      '<h5>Size charts</h5><p>Forecut base charts: average body measurements for each category (women XS–XXL, men S–3XL, kids 2–12 years). For the best fit, enter your own measurements.</p>'
      '<h5>Accuracy</h5><p>Pieces are drawn as vectors at true scale. After printing, the 5 cm square on the sheet must measure exactly 5 cm. If it does not, set the printer to 100% / actual size.</p>'
      '<h5>Before production</h5><ul><li>Sew a toile in calico and correct the fit.</li><li>Sizes are graded from your base size using the Forecut chart steps. Check the graded set against your own grade rules before bulk.</li><li>Add fabric shrinkage before cutting bulk (enter your wash-test result under Fabric).</li></ul>'
      '<h5>Fit testing</h5><p id="pm-toile"></p>'
      '<h5>What\'s new</h5><dl class="spec log"><dt>1.3</dt><dd>Move the bust dart to the shoulder, armhole, neckline or waist. Princess seams for the bodice, saree blouse and Anarkali. Hindi labels (EN / हिं).</dd><dt>1.2</dt><dd>Costing with true marker nesting, GST and MRP. Graded size nest, AAMA DXF, tech pack, fit adjustments, saved client measurements. Anarkali, angrakha, sherwani, bandhgala, salwar, Patiala, churidar, gharara.</dd><dt>1.1</dt><dd>CAD-style workspace, how-to-measure figure, A4 print preview, automatic checks.</dd><dt>1.0</dt><dd>First release: blocks drafted from measurements, PDF, DXF and SVG export.</dd></dl></div></aside></div>'
      '<p class="toast" id="pm-msg" role="status" hidden></p></div>'
      '<details class="pmdocw"><summary>How the pattern maker works</summary><div class="pmdoc" style="grid-template-columns:repeat(4,minmax(0,1fr))"><div><h2>How it works</h2><p><b>Load a Forecut detail</b>, such as a band-collar kurta, Cuban camp collar shirt, barrel-leg jeans, peplum top or fit-and-flare Anarkali, and the matching garment and options load automatically. Or pick a category and a garment: fitted bodice, kurta, Anarkali, angrakha, shirt, T-shirt, hoodie, saree blouse, top, dress or frock, Nehru jacket, bandhgala, sherwani, skirt, lehenga, trousers, salwar, patiala, churidar and gharara.</p>'
      '<p><b>Measurements</b> start from a size chart and can be changed to your own in centimetres, millimetres or inches; the body diagram shows where to take each one.</p></div>'
      '<div><h2>Checked as you draft</h2><p>Every piece is drafted from the same measurements, so pieces that are sewn together fit together: sleeve heads to the armhole, collars and bands to the neckline, cuffs and waistbands to the wrist and waist. The checks panel tests matching seams, sleeve cap ease and crotch width every time you change something.</p></div>'
      '<div><h2>Costing from the pattern</h2><p>The pattern maker lays your actual pieces, with seam allowances, on the fabric width you choose and works out the fabric per garment, marker length and efficiency. Buttons, thread, zips and elastic are counted from the pattern. Add your rates for fabric, trims and making (SMV × cost per minute) to get the cost per garment, your price, the retail price and MRP with GST, and the totals for an order. Download the cost sheet, the CSV or the marker as DXF.</p><p>Shrinkage from your wash test enlarges every piece, so the garment is the right size after washing.</p></div>'
      '<div><h2>Downloads</h2><ul><li><b>PDF, A4 tiles:</b> print at 100%, check the 5 cm square, tape the tiles together. Preview the pages before you print. Blank tiles are skipped.</li><li><b>PDF, full size:</b> one page at true size for a plotter.</li><li><b>DXF:</b> for Gerber, Lectra, Optitex, CLO, Illustrator or AutoCAD, on separate layers.</li><li><b>SVG and PNG:</b> for editing, sharing and tech packs.</li></ul>'
      '<p>These are block patterns for samples and first toiles. Make a toile, check the fit and correct it before cutting good fabric or going to production.</p></div></div></details>')
open(OUT + 'pm-link.js', 'w').write('window.FC_PM_LINKS=' + json.dumps({d[0]: PM_NAMES[d[3]] for d in PMD}) + ';' + JS('pm_link.js'))
page('pattern-maker.html', 'Pattern Maker · Draft Kurta, Shirt, Blouse, Dress, Trousers & More · Forecut', pm,
     'window.PM_DETAILS=' + json.dumps(PMD) + ';' + JS('pm_engine.js') + JS('pm_export.js') + JS('pm_views.js') + JS('pm_cost.js') + JS('pm_ui.js'), auth=True)

print('tools preview ok', 3)
