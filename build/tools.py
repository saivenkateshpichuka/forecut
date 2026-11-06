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
pm = ('<div class="eb">Members tool</div><div class="tl-h"><div><h1>Pattern maker</h1><p class="lead">Draft patterns for 12 garment types across womenswear, menswear, kidswear and unisex, or start from any of ' + str(len(PMD)) + ' Forecut details. Set measurements in cm, mm or inches, adjust seam allowances per piece, and download SVG, DXF, PNG or PDF.</p></div>'
      '<div class="chiprow"><span>12 garments · 4 categories</span><span>' + str(len(PMD)) + ' linked Forecut details</span><span>cm · mm · inches</span><span>SVG · DXF · PNG · PDF</span><span>Forecut-branded files</span></div></div>'
      '<div class="card" id="pm-gate"><h3>Sign in to use the pattern maker</h3><p style="margin:0 0 12px">The pattern maker is for registered Forecut members. Sign in or create a free account to draft and download patterns.</p>'
      '<div class="btns"><a class="btn p" href="account.html?next=pattern-maker.html#signin">Sign in</a><a class="btn" href="account.html?next=pattern-maker.html#signup">Create a free account</a></div></div>'
      '<div id="pm-app" hidden>'
      '<div class="card"><h3>1 · Start from a Forecut detail <small style="font-weight:500;color:var(--muted)">(<span id="pm-dcount"></span> linked)</small></h3><input type="search" id="pm-dsearch" list="pm-dlist" placeholder="Type a detail, e.g. band collar, barrel-leg, camp collar, peplum, Anarkali"><datalist id="pm-dlist"></datalist><p class="hint" id="pm-dnote"></p></div>'
      '<div class="card"><h3>2 · Category and garment</h3><div class="seg" id="pm-gtabs"></div><div class="seg gar" id="pm-garments"></div></div>'
      '<div class="tool wide" style="margin-top:16px"><div class="noprint"><div class="card"><h3>3 · Measurements</h3><div id="pm-meas"></div></div><div class="card"><h3>4 · Style · <span id="pm-ttl" style="font-weight:500"></span></h3><div id="pm-opts"></div></div>'
      '<div class="card"><h3>5 · Seam allowance</h3><div class="fg"><label>Seam allowance, all pieces<input type="number" step="any" min="0" id="pm-sa"></label><label>Hem allowance, all pieces<input type="number" step="any" min="0" id="pm-hemall"></label></div>'
      '<div class="btns"><button type="button" id="pm-apply">Reset pieces to these values</button><button type="button" id="pm-nosa">Remove all allowances</button></div><p class="hint">Change a single piece in the pieces table. Fold edges never get an allowance.</p></div></div>'
      '<div><div class="canvas" id="pm-svg"></div><label class="ck" style="margin:8px 0"><input type="checkbox" id="pm-grid" checked> Show grid (1 cm or 1 inch)</label><div class="info" id="pm-info"></div>'
      '<div class="card" style="margin-top:14px"><h3>6 · Pieces</h3><div id="pm-pieces" class="tw"></div><div class="btns"><button type="button" id="pm-resetnames">Reset names to automatic</button></div></div>'
      '<div class="card" style="margin-top:14px"><h3>7 · Download</h3><div class="btns"><button type="button" class="p" id="pm-dl-pdf">PDF · A4 tiles to print</button><button type="button" id="pm-dl-pdf2">PDF · full size (plotter)</button><button type="button" id="pm-dl-svg">SVG</button><button type="button" id="pm-dl-dxf">DXF (CAD)</button><button type="button" id="pm-dl-png">PNG</button></div>'
      '<p class="hint" id="pm-msg">All files are true scale and carry the Forecut label. DXF uses millimetres (inches if you choose inches) with layers CUT, SEAM, MARK, GRAIN, TEXT and BRAND.</p></div></div></div></div>'
      '<div class="prose"><h2>How the pattern maker works</h2>'
      '<p><b>Start from a Forecut detail</b>, such as a band-collar kurta, Cuban camp collar shirt, barrel-leg jeans, peplum top or fit-and-flare Anarkali, and the matching garment and options load automatically. Or pick a category (womenswear, menswear, kidswear or unisex) and one of 12 garments: fitted bodice, kurta, shirt, T-shirt, hoodie, saree blouse, top, dress or frock, Nehru jacket or waistcoat, skirt, lehenga and trousers.</p>'
      '<p><b>Measurements</b> start from a size chart for each category and can be changed to your own in centimetres, millimetres or inches. <b>Style options</b> cover fit ease, length, neckline, collar (band, shirt collar with band, camp, Peter Pan), sleeve (set-in, shirt with cuff, T-shirt, puff, bell, cap), pockets, yoke, hem, slits, flare, dropped shoulders, skirt type and leg shape.</p>'
      '<p>Every piece is drafted from the measurements, so pieces that are sewn together fit together: sleeve heads are matched to the armhole, collars and bands to the neckline, and cuffs and waistbands to the wrist and waist. Each piece gets an automatic name, like “Men\'s shirt · Collar band”, which you can edit. Seam and hem allowances can be set for the whole pattern or for each piece, and fold edges never get an allowance.</p>'
      '<h2>Downloads</h2><ul><li><b>PDF, A4 tiles:</b> print at 100% or actual size, check the 5 cm square, and tape the tiles together (A1, A2 across, then B1…). Blank tiles are skipped.</li><li><b>PDF, full size:</b> one page at true size for a plotter or copy shop.</li>'
      '<li><b>DXF:</b> for Gerber, Lectra, Optitex, CLO, Illustrator or AutoCAD, with cutting lines, sewing lines, marks, grain lines and text on separate layers.</li><li><b>SVG and PNG:</b> for editing, sharing and tech packs.</li></ul>'
      '<p>Every file carries the Forecut label on each piece and on the sheet.</p>'
      '<h2>Before you cut</h2><p>These are block patterns for samples, learning and first toiles. They do not include grading across sizes, and every body and fabric behaves differently. Make a toile in calico or muslin, check the fit, and transfer any changes before cutting good fabric. Advanced pattern editing is planned for a later version.</p></div>')
open(OUT + 'pm-link.js', 'w').write('window.FC_PM_LINKS=' + json.dumps({d[0]: PM_NAMES[d[3]] for d in PMD}) + ';' + JS('pm_link.js'))
page('pattern-maker.html', 'Pattern Maker · Draft Kurta, Shirt, Blouse, Dress, Trousers & More · Forecut', pm,
     'window.PM_DETAILS=' + json.dumps(PMD) + ';' + JS('pm_engine.js') + JS('pm_export.js') + JS('pm_ui.js'), auth=True)

print('tools preview ok', 3)
