"""PREVIEW ONLY (not part of build.sh, not deployed): writes tools_preview/tools.html (hub), textile-calculator.html and pattern-blocks.html
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
@media (max-width:860px){.tl-h,.tool,.tool.wide,.hubg{grid-template-columns:1fr}.yc{grid-template-columns:1fr 1fr}.fg{grid-template-columns:1fr 1fr}}
@media print{body{padding:0}nav,footer,.tabs,.noprint,.prose,.tl-h,details.fs,.fctab{display:none!important}.card{border:0;padding:0}
 #p-tiles .tile{display:block;page-break-after:always}#p-tiles .tile p{font:10px "DM Sans",sans-serif;margin:2mm 0 0}
 body.pt .wrap>*:not(#p-tiles){display:none!important}}
@page{size:A4;margin:10mm}
</style>'''


def page(fn, title, body, js=''):
    open(OUT + fn, 'w').write(HEAD.format(title=E(title)).replace('</style>', '</style>' + CSS, 1) + body + FOOT.replace('</div></body>', (('<script>' + JS('common.js') + js + '</script>') if js else '') + '</div></body>'))


def num(id_, lab, val, step='any', mn='0', extra=''):
    return f'<label>{lab}<input type="number" id="{id_}" value="{val}" step="{step}" min="{mn}" inputmode="decimal"{extra}></label>'


def sel(id_, lab, opts, cur=None):
    return f'<label>{lab}<select id="{id_}">' + ''.join(f'<option value="{v}"{" selected" if v == cur else ""}>{E(t)}</option>' for v, t in opts) + '</select></label>'


def big(lab, id_, sub=''):
    return f'<div class="big"><span>{lab}</span><b><span id="{id_}" style="font:inherit;color:inherit">–</span>{f"<small id={chr(34)}{sub}{chr(34)}></small>" if sub else ""}</b></div>'


# ------------------------------------------------------------------ hub
TOOLS = [('textile-calculator.html', 'Textile calculator', 'Fabric, GSM, yarn & costing',
          'Fabric needed per garment and per order, GSM from a swatch, weight and price per kg or metre, yarn count, shrinkage and garment costing up to MRP.', 'hub-fabrics-art-forecast'),
         ('pattern-blocks.html', 'Pattern block maker', 'Kurta, sleeve & skirt blocks',
          'Enter measurements and get printable kurta (front, back, sleeve) and straight or A-line skirt blocks at true scale, with seam allowance and tiled A4 printing.', 'couture-bespoke-tailoring-2026')]
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
tc = ('<div class="eb">Free tool</div><div class="tl-h"><div><h1>Textile calculator</h1><p class="lead">Fabric needed per garment and per order, GSM and weight, yarn count, shrinkage and costing up to MRP, in one place.</p></div>'
      '<div class="chiprow"><span>Metres and yards</span><span>₹ costing</span><span>Exact conversions</span><span>Nothing is uploaded</span></div></div>'
      '<div id="tc"><div class="tabs noprint" role="tablist"><button data-tab="cons" role="tab">Fabric needed</button><button data-tab="gsm" role="tab">GSM &amp; weight</button><button data-tab="yarn" role="tab">Yarn count</button><button data-tab="shrink" role="tab">Shrinkage</button><button data-tab="cost" role="tab">Costing &amp; MRP</button></div>'
      # consumption
      '<section data-pane="cons" class="tool"><div class="card"><h3>Garment and fabric</h3><div class="fg">'
      '<label class="full">Garment<select id="c-g"></select></label>'
      + sel('c-w', 'Fabric width', WIDTHS, '112') + sel('c-s', 'Size', [(s, s) for s in ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']], 'M')
      + num('c-q', 'Pieces to make', 50, '1', '1') + num('c-p', 'Fabric price (₹ per metre, optional)', '', '1')
      + num('c-sh', 'Shrinkage allowance %', 3, '0.5') + num('c-wa', 'Cutting wastage %', 5, '0.5')
      + '<label class="full">Your own consumption per piece (m), optional<input type="number" id="c-own" step="0.05" min="0" placeholder="Leave empty to use the typical figure"></label>'
      '</div><p class="hint" id="c-note"></p></div>'
      '<div class="card res"><h3>You need</h3>' + big('Per piece', 'c-per', 'c-peryd') + big('For the whole order', 'c-tot', 'c-totyd') + big('Typical base consumption', 'c-base') +
      '<p class="hint" id="c-cost"></p><p class="hint">Typical figures are industry rules of thumb for the style shown. Confirm with your cutting master or a CAD marker before ordering bulk, especially for prints, stripes or checks that need matching.</p></div></section>'
      # gsm
      '<section data-pane="gsm" class="tool" hidden><div><div class="card"><h3>GSM from a swatch</h3><div class="fg">'
      + num('g-g', 'Swatch weight (g)', 1.8, '0.01') + sel('g-shape', 'Swatch', [('circle', 'GSM cutter circle (100 cm²)'), ('rect', 'Rectangle I cut myself')], 'circle') +
      '<div class="fg full" id="g-ab">' + num('g-a', 'Length (cm)', 10, '0.1') + num('g-b', 'Width (cm)', 10, '0.1') + '</div></div>'
      + big('Fabric weight', 'g-out', 'g-oz') + '<p class="hint">Weigh a dry, conditioned swatch on a scale reading to 0.01 g. GSM = grams ÷ area in m².</p></div>'
      '<div class="card"><h3>oz/yd² to GSM</h3>' + num('o-oz', 'Ounces per square yard (e.g. denim 12 oz)', 12, '0.1') + big('Equals', 'o-out') + '</div></div>'
      '<div class="card"><h3>Weight and price of a roll or order</h3><div class="fg">' + num('w-gsm', 'GSM', 180, '1') + sel('w-w', 'Width', WIDTHS, '147') +
      num('w-l', 'Length (m)', 100, '1') + '<span></span>' + num('w-pk', 'Price per kg (₹, optional)', '', '1') + num('w-pm', 'Price per metre (₹, optional)', '', '1') + '</div>'
      + big('Total weight', 'w-kg') + big('Metres in one kg', 'w-mpk') + '<p class="hint" id="w-conv"></p><p class="hint">Weight per metre = GSM × width (m) ÷ 1000 kg. Knits are often sold by the kilo, wovens by the metre: this converts between them.</p></div></section>'
      # yarn
      '<section data-pane="yarn" hidden><div class="card"><h3>Yarn count converter</h3><p class="hint" style="margin:0 0 12px">Type in any box; the others update. Ne and Nm are indirect (higher = finer); tex, denier and dtex are direct (higher = heavier).</p><div class="yc">'
      + num('y-ne', 'Ne (English cotton)', 40, '0.1') + num('y-nm', 'Nm (metric)', 67.7, '0.1') + num('y-tex', 'Tex', 14.76, '0.01') + num('y-den', 'Denier', 132.86, '0.01') + num('y-dtex', 'dtex', 147.6, '0.1') +
      '</div></div><div class="card woven"><h3>Woven fabric GSM from construction</h3><div class="fg" style="grid-template-columns:repeat(3,1fr)">'
      + num('f-epi', 'Ends per inch (EPI)', 132, '1') + num('f-ppi', 'Picks per inch (PPI)', 72, '1') + '<span></span>' + num('f-wa', 'Warp count (Ne)', 40, '0.5') + num('f-we', 'Weft count (Ne)', 40, '0.5') + '<span></span>' + num('f-cw', 'Warp crimp %', 8, '0.5') + num('f-cf', 'Weft crimp %', 6, '0.5') +
      '</div>' + big('Estimated fabric weight', 'f-out', 'f-split') + '<p class="hint">Greige estimate: g/m² = threads per inch × 39.37 × tex ÷ 1000 × (1 + crimp), for warp and weft. Finishing, sizing and washing change the final GSM.</p></div></section>'
      # shrinkage
      '<section data-pane="shrink" class="tool" hidden><div class="card"><h3>Shrinkage from a wash test</h3><div class="fg">' + num('s-b', 'Marked length before washing (cm)', 50, '0.1') + num('s-a', 'Length after washing and drying (cm)', 48.5, '0.1') + '</div>'
      + big('Shrinkage', 's-out') + '<p class="hint" id="s-verdict"></p><p class="hint">Mark 50 × 50 cm on the fabric, wash and dry it as the customer will, measure again. Test warp and weft separately.</p></div>'
      '<div class="card"><h3>Allow for it when cutting</h3><div class="fg">' + num('s-f', 'Finished length you need (cm)', 110, '0.5') + num('s-p', 'Expected shrinkage %', 3, '0.5') + '</div>' + big('Cut length', 's-cut') + '<p class="hint">Cut length = finished length ÷ (1 − shrinkage).</p></div></section>'
      # costing
      '<section data-pane="cost" class="tool" hidden><div class="card"><h3>Cost of one garment</h3><div class="fg">' + num('k-c', 'Fabric consumption (m)', 2.5, '0.05') + num('k-p', 'Fabric price (₹ per m)', 180, '1') +
      num('k-t', 'Trims and labels (₹)', 60, '1') + num('k-cmt', 'Cutting, making and finishing (₹)', 220, '1') + num('k-pk', 'Packing (₹)', 25, '1') + num('k-oh', 'Overheads and rejects %', 10, '0.5') +
      num('k-m', 'Your margin on cost %', 60, '1') + num('k-r', 'Retailer or marketplace margin %', 40, '1') + num('k-g', 'GST %', 5, '0.5') + '</div>'
      '<div class="btns"><button type="button" id="k-from">Use the fabric figure from “Fabric needed”</button></div></div>'
      '<div class="card res"><h3>Price build-up</h3>' + big('Fabric cost', 'k-fab') + big('Total cost', 'k-cost') + big('Your selling price', 'k-ws') + big('Retail price before tax', 'k-rt') + big('Suggested MRP (incl. GST)', 'k-mrp') +
      '<div class="kbar" id="k-bar"></div><div class="kkey" id="k-key"></div><p class="hint">GST on garments depends on the sale value and can change; check the current rate for your price band. MRP is rounded to end in 9.</p></div></section></div>'
      '<div class="prose"><h2>How to use the textile calculator</h2>'
      '<p><b>Fabric needed</b> starts from typical consumption for a size M garment at 44 and 58 inch widths, then adjusts for the width you choose, the size, shrinkage and cutting wastage, and multiplies by the number of pieces. If your pattern master has already laid a marker, type your own consumption per piece and the calculator applies only shrinkage, wastage and quantity. Add a price per metre to see the fabric cost per piece and for the order.</p>'
      '<p><b>GSM and weight</b> works out grams per square metre from a swatch, converts ounces per square yard (common for denim) to GSM, and turns a GSM, width and length into the weight of a roll or an order. It also converts between price per kilo and price per metre, which helps when a knit mill quotes by the kilo and your costing is by the metre.</p>'
      '<p><b>Yarn count</b> converts between Ne, Nm, tex, denier and dtex using the standard formulas: tex = 590.5 ÷ Ne, Nm = 1000 ÷ tex, denier = 9 × tex and dtex = 10 × tex. The woven estimate gives a greige fabric weight from ends and picks per inch, yarn counts and crimp.</p>'
      '<p><b>Shrinkage</b> turns a wash test into a percentage and tells you how much longer to cut. <b>Costing and MRP</b> adds fabric, trims, making, packing and overheads, then your margin, the retailer\'s margin and GST, to suggest a retail price.</p>'
      '<h2>Good to know</h2><ul><li>Wider fabric is usually cheaper per garment even when the price per metre is higher: compare the fabric cost per piece, not the price per metre.</li>'
      '<li>Directional prints, one-way pile (velvet, corduroy) and stripes or checks that must match can add 10–20% to consumption.</li>'
      '<li>Order a little extra for shade variation between rolls, and cut a whole order from the same dye lot where you can.</li></ul>'
      '<p>Related: the <a href="fabrics.html">Fabrics hub</a> for weaves, knits and GSM ranges, and the <a href="india-textile-craft-guide.html">India textile and craft sourcing guide</a>.</p></div>')
page('textile-calculator.html', 'Textile Calculator · Fabric Consumption, GSM, Yarn Count, Costing · Forecut', tc,
     'window.FC_GARMENTS=' + json.dumps(GARMENTS) + ';' + JS('textile.js'))

# ------------------------------------------------------------------ pattern blocks
pb = ('<div class="eb">Free tool</div><div class="tl-h"><div><h1>Pattern block maker</h1><p class="lead">Kurta front, back and sleeve, or a straight or A-line skirt, drafted from your measurements at true scale. Download as SVG or print on A4.</p></div>'
      '<div class="chiprow"><span>True scale in cm</span><span>Seam allowance</span><span>Sleeve cap matched to armhole</span><span>Tiled A4 printing</span></div></div>'
      '<div class="tool wide" id="pb"><div class="noprint"><div class="card"><h3>Block</h3><div class="fg">'
      + sel('p-block', 'Block', [('kurta', 'Kurta / tunic + sleeve'), ('skirt', 'Skirt (straight or A-line)')], 'kurta') + sel('p-size', 'Start from size', [('', 'My measurements'), ('S', 'S'), ('M', 'M'), ('L', 'L'), ('XL', 'XL'), ('XXL', 'XXL')], '')
      + '</div></div><div class="card"><h3>Body measurements (cm)</h3><div class="fg">' + num('p-bust', 'Bust', 91, '0.5') + num('p-waist', 'Waist', 75, '0.5') + num('p-hip', 'Hip', 99, '0.5') + num('p-shoulder', 'Shoulder width', 37, '0.5') + num('p-nw', 'Neck to waist (back)', 40, '0.5') + num('p-bicep', 'Upper arm (bicep)', 28, '0.5') + '</div></div>'
      '<div class="card" id="p-kurta"><h3>Kurta options</h3><div class="fg">' + num('p-len', 'Kurta length from shoulder', 105, '1') + num('p-ad', 'Armhole depth', 21, '0.5') +
      sel('p-ease', 'Fit', [('4', 'Fitted (+4 cm)'), ('8', 'Regular (+8 cm)'), ('12', 'Relaxed (+12 cm)')], '8') + sel('p-shape', 'Side seam', [('straight', 'Straight'), ('shaped', 'Shaped at waist')], 'straight') +
      sel('p-neck', 'Neckline', [('round', 'Round'), ('deep', 'Deep round'), ('v', 'V-neck'), ('boat', 'Boat'), ('band', 'For a band collar')], 'round') + num('p-flare', 'Flare at hem (each side)', 2, '0.5') +
      num('p-slit', 'Side slit length', 30, '1') + num('p-slen', 'Sleeve length', 42, '1') + num('p-sease', 'Sleeve ease at bicep', 5, '0.5') + num('p-cuff', 'Sleeve hem width', 28, '0.5') + '</div></div>'
      '<div class="card" id="p-skirt" hidden><h3>Skirt options</h3><div class="fg">' + num('p-slen2', 'Skirt length', 60, '1') + num('p-hd', 'Waist to hip depth', 20, '0.5') + num('p-aline', 'A-line flare at hem (each side)', 0, '0.5') + '</div></div>'
      '<div class="card"><h3>Output</h3><div class="fg">' + num('p-sa', 'Seam allowance (cm)', 1, '0.25') + '<label class="ck"><input type="checkbox" id="p-grid" checked> Show 1 cm grid</label></div>'
      '<div class="btns"><button type="button" class="p" id="p-dl">Download SVG (true scale)</button><button type="button" id="p-print">Print on A4 tiles</button></div></div></div>'
      '<div><div class="canvas" id="p-svg"></div><div class="info" id="p-info"></div>'
      '<p class="hint">Grain lines run parallel to the selvedge. The shaded band is the seam allowance; its outer line is the cutting line. Pieces marked “on fold” have no allowance at the fold.</p></div></div>'
      '<div id="p-tiles"></div>'
      '<div class="prose"><h2>How to use the pattern block maker</h2>'
      '<p>Choose a block, start from a size or enter your own measurements, then adjust the fit and style options. The drawing updates as you type. Every piece is drawn at true scale in centimetres: one grid square is one centimetre, and the small 5 cm square lets you check the scale after printing.</p>'
      '<p><b>The kurta block</b> drafts a front and back, each cut on the fold, from bust, shoulder width and armhole depth, with your choice of fit ease, straight or waist-shaped sides, neckline, hem flare and side slit. The sleeve is solved to fit: the tool measures the front and back armhole curves and sets the cap height so the sleeve head is about 1 cm longer than the armhole, the small amount of ease that lets it set in smoothly.</p>'
      '<p><b>The skirt block</b> drafts a front (on the fold) and back (with a centre back zip) from waist, hip and the waist-to-hip depth, with darts that share the waist shaping with the side seam. Add flare at the hem for an A-line.</p>'
      '<h2>Printing and using the pattern</h2><ul><li><b>Download SVG</b> to send to a plotter or open in Illustrator, Inkscape or CLO. The file is sized in centimetres.</li>'
      '<li><b>Print on A4 tiles</b> splits the sheet into numbered tiles. Print at 100% or “actual size”, never “fit to page”, then check the 5 cm square and tape the tiles together in order (A1, A2 across, then B1…).</li>'
      '<li>Always make a toile in calico or muslin first, check the fit on the body, and transfer any changes to the pattern before cutting good fabric.</li></ul>'
      '<h2>Limits</h2><p>These are simplified blocks for learning, quick samples and first toiles. They do not include grading, facings, plackets, pockets or collars, and every body is different. For production, a pattern maker should true the seams, add notches and grade the pattern across sizes. See also our guides on <a href="fabrics.html">fabrics</a> and <a href="couture.html">couture construction</a>.</p></div>')
page('pattern-blocks.html', 'Pattern Block Maker · Kurta, Sleeve & Skirt Patterns from Your Measurements · Forecut', pb, JS('pattern.js'))

print('tools preview ok', 3)
