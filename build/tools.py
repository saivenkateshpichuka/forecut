"""PREVIEW ONLY (not part of build.sh, not deployed): writes tools_preview/tools.html (hub), textile-calculator.html and pattern-maker.html
for review. To publish later: point OUT at ".." and add this script to build.sh after legal.py.
Everything runs in the browser; nothing is sent anywhere. Shared header/footer come from legal.py."""
import html, json, shutil, os
import reports_data as R
src = open('legal.py').read()
ns = {}
exec(src[:src.index('P = {}')], ns)
HEAD, FOOT = ns['HEAD'], ns['FOOT']
E = html.escape
OUT = 'tools_preview/'
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
         ('pattern-maker.html', 'Pattern maker', 'Members · 12 garments, 4 categories',
          'Draft kurtas, shirts, blouses, dresses, skirts, lehengas, trousers and more from measurements or from a Forecut detail. Per-piece seam allowance, editable names, SVG, DXF, PNG and PDF downloads.', 'couture-bespoke-tailoring-2026')]
hub = ('<div class="eb">Free tools</div><div class="tl-h"><div><h1>Design and production tools</h1>'
       '<p class="lead">Quick, practical calculators and planners for designers, students, D2C brands and production teams. They are free, need no sign-in, and run entirely in your browser: nothing you type is sent to us.</p></div>'
       '<div class="chiprow"><span>Free</span><span>No sign-in</span><span>Works on phone</span><span>Metric and imperial</span><span>Download SVG, PNG or print</span></div></div>'
       '<div class="hubg">' + ''.join(f'<a href="{fn}"><img src="img/{img}.webp" alt="" loading="lazy" width="800" height="600"><span class="b"><small>{E(k)}</small><b>{E(t)}</b><span>{E(d)}</span><em>Open the tool →</em></span></a>' for fn, t, k, d, img in TOOLS) + '</div>'
       '<div class="prose"><h2>What each tool is for</h2>'
       '<p><b>The textile calculator</b> answers the questions that come up every day between a design team and a fabric supplier: how many metres to order for a run of kurtas, what a 180 GSM fabric weighs per metre, what a price per kilo means per metre, how a 40s cotton compares with a 150 denier polyester, how much to allow for shrinkage, and what a garment must sell for once fabric, trims, making, margins and GST are added.</p>'
       '<p><b>The pattern block maker</b> drafts simple blocks from your own measurements: a kurta or tunic front and back with a sleeve whose cap is matched to the armhole, and a straight or A-line skirt with darts. Blocks are drawn at true scale in centimetres, so you can download them as SVG for a plotter or print them on A4 sheets and tape them together. They are starting points for a first toile, not finished production patterns.</p>'
              '<h2>How accurate are they?</h2>'
       '<p>Formulas such as GSM, yarn count and weight conversions are exact. Fabric consumption figures are typical industry estimates for a size M garment and change with style, fabric direction, prints that need matching and how tightly a marker is laid, so treat them as a planning figure and confirm with your cutting master or CAD marker before ordering bulk. Pattern blocks use standard, simplified drafting and should always be tested in calico or muslin first.</p>'
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
tc = ('<div class="eb">Free tool</div><div class="tl-h"><div><h1>Textile calculator</h1><p class="lead">27 calculators for yarn, weaving, knitting, garments, dyeing and units. Enter values in any unit, metric or imperial, and in any yarn count system.</p></div>'
      '<div class="chiprow"><span>15 yarn count systems</span><span>Metric and imperial</span><span>Formula shown for each</span><span>Nothing is uploaded</span></div></div>'
      '<div class="cl"><aside class="noprint"><input type="search" id="cl-q" placeholder="Search calculators" aria-label="Search calculators"><nav id="cl-list" aria-label="Calculators"></nav></aside>'
      '<div><label class="clm noprint">Calculator<select id="cl-sel"></select></label><div id="cl-pane"></div></div></div>'
      '<div class="prose"><h2>What is in the textile calculator</h2><ul>' + ''.join(f'<li><b>{E(c)}:</b> {E(d)}.</li>' for c, d in CATS) + '</ul>'
      '<h2>Units and yarn counts</h2>'
      '<p>Every length, width, weight, area, density and price box has its own unit menu, so you can mix units freely: a reed width in inches, a cloth length in metres and a yarn price per pound all work together. Yarn counts can be entered in any of 15 systems, from English cotton (Ne), metric (Nm), tex, dtex and denier to worsted, linen lea, American woollen run and cut, Yorkshire skein, spun silk, raw silk drams and jute. Internally every count is converted to tex, the weight in grams of 1000 metres, which keeps mixed-system calculations exact.</p>'
      '<h2>Where the formulas come from</h2>'
      '<p>The yarn, warp, weft, reed, mixing and cloth-structure calculations follow the classic rules set out in E. A. Posselt\'s <i>Textile Calculations</i> (1906), restated in modern units. For example, 12,600 yards of 30s cotton weigh 8 oz, and a 20s and a 60s twisted together make a 15s. Knitting, garment, sewing-thread, SMV, dyeing and regain calculations use the standard formulas taught in textile and apparel courses today. Each calculator shows its formula, so you can check the working.</p>'
      '<h2>Good to know</h2><ul><li>Formulas and unit conversions are exact. Consumption, thread ratios, packing factors and typical ranges are rules of thumb: confirm with your marker, your mill or a lab test before ordering bulk.</li>'
      '<li>Wider fabric is often cheaper per garment even when the price per metre is higher: compare the fabric cost per piece.</li>'
      '<li>GST on garments depends on the price band and can change; check the current rate.</li></ul>'
      '<p>Related: the <a href="fabrics.html">Fabrics hub</a> for weaves, knits and GSM ranges, and the <a href="india-textile-craft-guide.html">India textile and craft sourcing guide</a>.</p></div>')
page('textile-calculator.html', 'Textile Calculator · Yarn Count, GSM, Warp & Weft, Knitting, Garment Costing, Units · Forecut', tc,
     'window.FC_GARMENTS=' + json.dumps(GARMENTS) + ';' + JS('calcs.js'))

# ------------------------------------------------------------------ pattern maker (sign-in only)
import pm_details
PMD = pm_details.build()
PM_NAMES = {'bodice': 'fitted bodice', 'kurta': 'kurta', 'shirt': 'shirt', 'tshirt': 'T-shirt', 'hoodie': 'hoodie', 'blouse': 'saree blouse', 'top': 'top', 'dress': 'dress', 'jacket': 'Nehru jacket / waistcoat', 'skirt': 'skirt', 'lehenga': 'lehenga', 'trousers': 'trousers'}
IC = {  # small line icons (24px grid, 1.6 stroke)
    'search': '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>',
    'minus': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12"/></svg>', 'plus': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12M12 6v12"/></svg>',
    'fit': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/></svg>',
    'grid': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v16H4zM4 9.3h16M4 14.6h16M9.3 4v16M14.6 4v16"/></svg>',
    'down': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11m-4.5-4.5L12 15l4.5-4.5M5 19.5h14"/></svg>',
    'chev': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5"/></svg>'}
PMCSS = r"""<style>
.wrap{max-width:1680px!important}
.pmh{display:flex;justify-content:space-between;align-items:flex-end;gap:12px 24px;flex-wrap:wrap;margin:26px 0 14px}.pmh>div{display:grid;gap:6px}
.pmh .eb{margin:0}.pmh h1{font-size:30px!important;line-height:1.1;margin:0}
.pmh p{margin:0;max-width:620px;font:14px/1.5 "DM Sans",sans-serif;color:var(--muted)}
.pmh .tag{font:600 12px "DM Sans",sans-serif;color:var(--muted);border:1px solid var(--grid);border-radius:4px;padding:5px 9px;white-space:nowrap}
.gate{max-width:520px;margin:30px 0 60px;border:1px solid var(--grid);border-radius:8px;background:var(--paper-2);padding:24px 26px}
.gate h3{font:700 18px "DM Sans",sans-serif;margin:0 0 6px}.gate p{margin:0 0 16px;color:var(--muted);font:15px/1.5 "DM Sans",sans-serif}
.pmx{--pane:var(--paper-2);--line:var(--grid);--stage:#e7e2da;font:13px/1.4 "DM Sans",sans-serif;color:var(--ink);border:1px solid var(--line);border-radius:8px;overflow:hidden;background:var(--pane);position:relative}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .pmx{--stage:#0d0b0a}}:root[data-theme="dark"] .pmx{--stage:#0d0b0a}
.pbar svg,.ctl svg,.sec>summary svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round;flex:none}
.pmx button{font:inherit;color:inherit;cursor:pointer}
.pmx input,.pmx select{font:13px "DM Sans",sans-serif;color:var(--ink);background:var(--paper);border:1px solid var(--line);border-radius:4px;padding:5px 7px;height:30px;width:100%;min-width:0;margin:0}
.pmx input:focus-visible,.pmx select:focus-visible,.pmx button:focus-visible{outline:2px solid var(--chalk);outline-offset:1px}
.pmx input[type=checkbox]{width:15px;height:15px;padding:0;accent-color:var(--chalk);flex:none}
/* toolbar */
.pbar{display:flex;align-items:center;gap:10px;padding:8px 10px;border-bottom:1px solid var(--line);background:var(--pane);flex-wrap:wrap}
.crumb{display:flex;align-items:center;gap:6px;font-weight:600;min-width:0;flex:1 1 260px;white-space:nowrap;overflow:hidden}
.crumb span{color:var(--muted);font-weight:500}.crumb i{font-style:normal;color:var(--grid)}.crumb b{overflow:hidden;text-overflow:ellipsis}
.srch{position:relative;display:flex;align-items:center;flex:0 1 340px;min-width:200px}.srch svg{position:absolute;left:9px;color:var(--muted)}
.srch input{padding-left:30px;padding-right:44px}.srch small{position:absolute;right:9px;color:var(--muted);font-size:11.5px}
.useg{display:inline-flex;border:1px solid var(--line);border-radius:4px;overflow:hidden;height:30px}
.useg button{border:0;background:var(--paper);padding:0 11px;font-weight:600;color:var(--muted)}.useg button+button{border-left:1px solid var(--line)}
.useg button[aria-pressed=true]{background:var(--ink);color:var(--paper)}
.xbtn{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 12px;border-radius:4px;border:1px solid var(--line);background:var(--paper);font-weight:600}
.xbtn:hover{border-color:var(--muted)}.xbtn.pri{background:var(--ink);border-color:var(--ink);color:var(--paper)}.xbtn.pri:hover{opacity:.9}
.exp{position:relative}
.menu{position:absolute;right:0;top:36px;z-index:20;width:290px;background:var(--paper-2);border:1px solid var(--line);border-radius:6px;box-shadow:0 12px 32px rgba(28,23,20,.16);padding:5px}
.menu button{display:grid;grid-template-columns:52px 1fr;gap:2px 10px;align-items:center;width:100%;text-align:left;border:0;background:none;border-radius:4px;padding:8px 9px}
.menu button:hover,.menu button:focus-visible{background:var(--paper)}
.menu b{grid-row:span 2;font:700 11px "DM Sans",sans-serif;letter-spacing:.04em;border:1px solid var(--line);border-radius:3px;padding:3px 0;text-align:center;color:var(--muted)}
.menu span{font-weight:600}.menu small{color:var(--muted);font-size:12px}.menu hr{border:0;border-top:1px solid var(--line);margin:4px 2px}
/* body */
.pbody{display:grid;grid-template-columns:300px minmax(0,1fr) 300px;height:clamp(620px,calc(100vh - 190px),1100px)}
.pl,.pr{overflow:auto;background:var(--pane)}.pl{border-right:1px solid var(--line)}.pr{border-left:1px solid var(--line);display:flex;flex-direction:column}
.sec{border-bottom:1px solid var(--line)}
.sec>summary,.sec>.hd{display:flex;align-items:center;justify-content:space-between;gap:8px;list-style:none;cursor:pointer;padding:10px 14px;font:700 11px "DM Sans",sans-serif;letter-spacing:.07em;text-transform:uppercase;color:var(--muted)}
.sec>summary::-webkit-details-marker{display:none}.sec>summary svg{transition:transform .15s}.sec:not([open])>summary svg{transform:rotate(-90deg)}
.sec>.bd{padding:0 14px 14px}
.cats{display:grid;grid-template-columns:repeat(4,1fr);border:1px solid var(--line);border-radius:4px;overflow:hidden;margin-bottom:8px}
.cats button{border:0;background:var(--paper);padding:6px 2px;font-size:12px;font-weight:600;color:var(--muted)}.cats button+button{border-left:1px solid var(--line)}
.cats button[aria-pressed=true]{background:var(--ink);color:var(--paper)}
.glist{display:grid;gap:1px}
.glist button{display:flex;justify-content:space-between;align-items:center;border:0;background:none;text-align:left;padding:6px 8px;border-radius:4px;font-weight:500}
.glist button:hover{background:var(--paper)}.glist button[aria-pressed=true]{background:var(--chalk-soft);color:var(--ink);font-weight:700;box-shadow:inset 2px 0 0 var(--chalk)}
.dnote{margin:8px 0 0;font-size:12px;color:var(--muted)}.dnote b{color:var(--ink)}
.row{display:grid;grid-template-columns:minmax(0,1fr) 108px;align-items:center;gap:8px;padding:3px 0;font:500 12.5px/1.3 "DM Sans",sans-serif;color:var(--ink)}
.row>span:first-child{color:var(--muted)}
.uin{position:relative;display:block}.uin input{padding-right:30px;text-align:right;font-variant-numeric:tabular-nums}.uin i{position:absolute;right:8px;top:50%;transform:translateY(-50%);font-style:normal;font-size:11.5px;color:var(--muted);pointer-events:none}
.row.wide{grid-template-columns:minmax(0,1fr) 150px}
.acts{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}.acts .xbtn{height:28px;font-size:12.5px;padding:0 10px}
.hint2{font-size:12px;color:var(--muted);margin:8px 0 0}
/* stage */
.pc{display:flex;flex-direction:column;min-width:0;background:var(--stage)}
.ctl{display:flex;align-items:center;gap:4px;padding:6px 8px;border-bottom:1px solid var(--line);background:var(--pane)}
.ib{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:28px;min-width:28px;padding:0 6px;border:1px solid transparent;border-radius:4px;background:none;color:var(--muted)}
.ib:hover{background:var(--paper);color:var(--ink)}.ib[aria-pressed=true]{background:var(--paper);border-color:var(--line);color:var(--ink)}
#pm-zl{min-width:52px;text-align:center;font-weight:600;font-variant-numeric:tabular-nums;color:var(--ink)}
.ctl .sp{flex:1}.ctl .leg{display:flex;gap:12px;font-size:11.5px;color:var(--muted)}.leg i{display:inline-block;width:16px;height:0;border-top:1.5px solid #1c1714;vertical-align:middle;margin-right:5px}.leg i.s{border-top:1.5px dashed #6e6259}.leg i.f{border-top:2px dashed #a9481f}
.view{flex:1;overflow:auto;position:relative;cursor:grab;padding:28px}.view.drag{cursor:grabbing}
#pm-svg{background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.08),0 8px 28px rgba(0,0,0,.08);margin:0 auto;width:max-content}
#pm-svg svg{display:block;width:auto;height:auto;max-width:none;max-height:none}
.sbar{display:flex;gap:16px;align-items:center;padding:5px 12px;border-top:1px solid var(--line);background:var(--pane);font-size:11.5px;color:var(--muted);white-space:nowrap;overflow:hidden}
.sbar b{color:var(--ink);font-weight:600}.sbar .ok{margin-left:auto}
/* right panel */
.rt{display:flex;border-bottom:1px solid var(--line);position:sticky;top:0;background:var(--pane);z-index:1}
.rt button{flex:1;border:0;background:none;padding:10px 0;font-weight:600;color:var(--muted);border-bottom:2px solid transparent}
.rt button[aria-selected=true]{color:var(--ink);border-bottom-color:var(--chalk)}
.rp{padding:12px 14px}
.pcs{display:grid;gap:8px}
.pcard{border:1px solid var(--line);border-radius:6px;background:var(--paper);padding:8px 9px}
.pcard.off{opacity:.55}
.pcard .t{display:flex;gap:8px;align-items:center;cursor:pointer}.pcard .t b{font-weight:700;flex:1;min-width:0}.pcard .t small{font-size:11.5px;color:var(--muted);white-space:nowrap}
.pcard .nm{display:grid;gap:2px;margin:7px 0 0 23px;font-size:11px;color:var(--muted);font-weight:600}.pcard .nm input{height:28px;font-size:12.5px}
.pcard .a{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:6px 0 0 23px}.pcard .a label{display:grid;gap:2px;font-size:11px;color:var(--muted);font-weight:600}.pcard .a input{height:26px}
.kv{display:grid}.kv div{display:flex;justify-content:space-between;gap:10px;padding:7px 0;border-bottom:1px solid var(--line);font-size:12.5px}.kv span{color:var(--muted)}.kv b{font-weight:600;text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
.kv h5{font:700 11px "DM Sans",sans-serif;letter-spacing:.07em;text-transform:uppercase;color:var(--muted);margin:14px 0 2px}.kv h5:first-child{margin-top:0}
.notes h5{font:700 13px "DM Sans",sans-serif;margin:14px 0 4px}.notes h5:first-child{margin-top:0}.notes p,.notes li{font-size:12.5px;line-height:1.5;color:var(--muted);margin:0 0 6px}.notes ul{padding-left:16px;margin:0}
.toast{position:absolute;left:50%;bottom:42px;transform:translateX(-50%);background:var(--ink);color:var(--paper);border-radius:6px;padding:8px 14px;font-size:12.5px;box-shadow:0 8px 24px rgba(0,0,0,.2);margin:0;max-width:90%;z-index:30}
.pmdoc{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:28px;margin:34px 0 10px;border-top:1px solid var(--grid);padding-top:22px}
.pmdoc h2{font:700 15px "DM Sans",sans-serif;margin:0 0 8px}.pmdoc p,.pmdoc li{font:14px/1.55 "DM Sans",sans-serif;color:var(--muted);margin:0 0 8px}.pmdoc ul{padding-left:18px;margin:0}.pmdoc b{color:var(--ink)}
@media (max-width:1180px){.pbody{grid-template-columns:270px minmax(0,1fr) 260px}}
@media (max-width:980px){.pbody{grid-template-columns:1fr;height:auto}.pc{order:-1;height:68vh}.pl{border-right:0;border-top:1px solid var(--line)}.pr{border-left:0;border-top:1px solid var(--line)}
 .srch{flex:1 1 100%;order:3}.crumb{flex:1 1 auto}.pmdoc{grid-template-columns:1fr}.ctl .leg{display:none}.view{padding:14px}.sbar .ok{display:none}}
</style>"""
pm = (PMCSS + '<div class="pmh"><div><div class="eb">Members tool</div><h1>Pattern maker</h1><p>Draft block patterns for 12 garments across womenswear, menswear, kidswear and unisex, or load one of ' + str(len(PMD)) + ' Forecut details. True-scale PDF, DXF, SVG and PNG.</p></div><span class="tag">For sampling · fit-test before production</span></div>'
      '<div class="gate" id="pm-gate"><h3>Sign in to use the pattern maker</h3><p>The pattern maker is for registered Forecut members. Sign in or create a free account to draft and download patterns.</p>'
      '<div class="btns"><a class="btn p" href="account.html?next=pattern-maker.html#signin">Sign in</a><a class="btn" href="account.html?next=pattern-maker.html#signup">Create a free account</a></div></div>'
      '<div id="pm-app" class="pmx" hidden>'
      '<div class="pbar"><div class="crumb" id="pm-ttl"></div>'
      '<label class="srch" title="Load a Forecut detail">' + IC['search'] + '<input type="search" id="pm-dsearch" list="pm-dlist" placeholder="Load a Forecut detail, e.g. camp collar" aria-label="Load a Forecut detail"><small id="pm-dcount"></small><datalist id="pm-dlist"></datalist></label>'
      '<div class="useg" id="pm-units" role="group" aria-label="Units"><button type="button" data-u="cm">cm</button><button type="button" data-u="mm">mm</button><button type="button" data-u="in">in</button></div>'
      '<div class="exp"><button type="button" class="xbtn pri" id="pm-exp" aria-haspopup="menu" aria-expanded="false">' + IC['down'] + 'Export</button><div class="menu" id="pm-menu" role="menu" hidden>'
      '<button type="button" role="menuitem" id="pm-dl-pdf"><b>PDF</b><span>A4 tiles for home printing</span><small>Print at 100%, check the 5 cm square, tape together</small></button>'
      '<button type="button" role="menuitem" id="pm-dl-pdf2"><b>PDF</b><span>Full-size sheet</span><small>One page for a plotter or copy shop</small></button><hr>'
      '<button type="button" role="menuitem" id="pm-dl-dxf"><b>DXF</b><span>CAD file</span><small>Layers: CUT, SEAM, MARK, GRAIN, TEXT, BRAND</small></button>'
      '<button type="button" role="menuitem" id="pm-dl-svg"><b>SVG</b><span>Vector, true scale</span><small>For Illustrator, Inkscape and tech packs</small></button>'
      '<button type="button" role="menuitem" id="pm-dl-png"><b>PNG</b><span>Image</span><small>For sharing and presentations</small></button></div></div></div>'
      '<div class="pbody"><aside class="pl" aria-label="Pattern settings">'
      '<details class="sec" open><summary>Garment' + IC['chev'] + '</summary><div class="bd"><div class="cats" id="pm-gtabs" role="group" aria-label="Category"></div><div class="glist" id="pm-garments"></div><p class="dnote" id="pm-dnote"></p></div></details>'
      '<details class="sec" open><summary>Measurements' + IC['chev'] + '</summary><div class="bd" id="pm-meas"></div></details>'
      '<details class="sec" open><summary><span>Style · <span id="pm-gname" style="text-transform:none;letter-spacing:0"></span></span>' + IC['chev'] + '</summary><div class="bd" id="pm-opts"></div></details>'
      '<details class="sec" open><summary>Seam allowance' + IC['chev'] + '</summary><div class="bd"><label class="row"><span>Seams, all pieces</span><span class="uin"><input type="number" step="any" min="0" id="pm-sa"><i class="u"></i></span></label>'
      '<label class="row"><span>Hems, all pieces</span><span class="uin"><input type="number" step="any" min="0" id="pm-hemall"><i class="u"></i></span></label>'
      '<div class="acts"><button type="button" class="xbtn" id="pm-apply">Apply to all pieces</button><button type="button" class="xbtn" id="pm-nosa">Net pattern (no allowance)</button></div><p class="hint2">Set a single piece in Pieces. Fold edges never get an allowance.</p></div></details>'
      '</aside><section class="pc" aria-label="Pattern sheet"><div class="ctl"><button type="button" class="ib" id="pm-zout" title="Zoom out" aria-label="Zoom out">' + IC['minus'] + '</button><span id="pm-zl">100%</span><button type="button" class="ib" id="pm-zin" title="Zoom in" aria-label="Zoom in">' + IC['plus'] + '</button>'
      '<button type="button" class="ib" id="pm-zfit" title="Fit sheet (0)">' + IC['fit'] + 'Fit</button><button type="button" class="ib" id="pm-gridb" aria-pressed="true" title="Grid">' + IC['grid'] + 'Grid</button><input type="checkbox" id="pm-grid" checked hidden>'
      '<span class="sp"></span><span class="leg"><span><i></i>Cut line</span><span><i class="s"></i>Sewing line</span><span><i class="f"></i>Fold</span></span></div>'
      '<div class="view" id="pm-view"><div id="pm-svg"></div></div><div class="sbar" id="pm-status"></div></section>'
      '<aside class="pr" aria-label="Pieces and checks"><div class="rt" role="tablist"><button type="button" role="tab" data-t="pieces" aria-selected="true">Pieces</button><button type="button" role="tab" data-t="checks" aria-selected="false">Checks</button><button type="button" role="tab" data-t="notes" aria-selected="false">Notes</button></div>'
      '<div class="rp" data-tp="pieces"><div class="pcs" id="pm-pieces"></div><div class="acts"><button type="button" class="xbtn" id="pm-resetnames">Reset names</button></div></div>'
      '<div class="rp" data-tp="checks" hidden><div class="kv" id="pm-info"></div></div>'
      '<div class="rp notes" data-tp="notes" hidden><h5>How the blocks are drafted</h5><p>Bodices: front wider than back at the bust, underarm depth in proportion to back length, side bust dart sized by cup with the front side seam lengthened to match, front waist dart ending short of the bust point, back waist and shoulder darts.</p>'
      '<p>Sleeves: cap height set from the armhole so the cap carries set-in ease (about 3 cm on fitted blocks, less on shirts, none on tees), elbow dart on fitted long sleeves.</p><p>Skirts: back hip wider than front; darts numbered and sized from the hip-to-waist difference.</p>'
      '<p>Trousers: crotch depth plus ease, hip line a third of the way up, extensions by fit (trouser, slack, jean), crotch-level width checked against the thigh, back inseam walked 0.5 cm shorter than the front.</p>'
      '<h5>Before production</h5><ul><li>Sew a toile in calico and correct the fit.</li><li>Sizes are drafted from the chart, not graded from an approved base size.</li><li>Add fabric shrinkage before cutting bulk.</li></ul></div></aside></div>'
      '<p class="toast" id="pm-msg" role="status" hidden></p></div>'
      '<div class="pmdoc"><div><h2>How it works</h2><p><b>Load a Forecut detail</b>, such as a band-collar kurta, Cuban camp collar shirt, barrel-leg jeans, peplum top or fit-and-flare Anarkali, and the matching garment and options load automatically. Or pick a category and one of 12 garments: fitted bodice, kurta, shirt, T-shirt, hoodie, saree blouse, top, dress or frock, Nehru jacket or waistcoat, skirt, lehenga and trousers.</p>'
      '<p><b>Measurements</b> start from a size chart and can be changed to your own in centimetres, millimetres or inches. <b>Style</b> covers ease, length, neckline, collar, sleeve, pockets, yoke, hem, slits, flare, dropped shoulders, skirt type, leg shape and fit at the crotch.</p></div>'
      '<div><h2>Pieces fit together</h2><p>Every piece is drafted from the same measurements: sleeve heads are matched to the armhole, collars and bands to the neckline, cuffs and waistbands to the wrist and waist. Each piece gets an automatic name, like “Men\'s shirt · Collar band”, which you can edit, and its own seam and hem allowance. Checks shows the seam lengths and fit figures.</p></div>'
      '<div><h2>Downloads</h2><ul><li><b>PDF, A4 tiles:</b> print at 100%, check the 5 cm square, tape the tiles together. Blank tiles are skipped.</li><li><b>PDF, full size:</b> one page at true size for a plotter.</li><li><b>DXF:</b> for Gerber, Lectra, Optitex, CLO, Illustrator or AutoCAD, on separate layers.</li><li><b>SVG and PNG:</b> for editing, sharing and tech packs.</li></ul>'
      '<p>These are block patterns for samples and first toiles. Make a toile, check the fit and correct it before cutting good fabric or going to production.</p></div></div>')
open(OUT + 'pm-link.js', 'w').write('window.FC_PM_LINKS=' + json.dumps({d[0]: PM_NAMES[d[3]] for d in PMD}) + ';' + JS('pm_link.js'))
page('pattern-maker.html', 'Pattern Maker · Draft Kurta, Shirt, Blouse, Dress, Trousers & More · Forecut', pm,
     'window.PM_DETAILS=' + json.dumps(PMD) + ';' + JS('pm_engine.js') + JS('pm_export.js') + JS('pm_ui.js'), auth=True)

print('tools preview ok', 3)
