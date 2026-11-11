"""Build the five browser-local planning tools. No external services required."""
from pathlib import Path
import json, html
ROOT=Path(__file__).resolve().parent.parent
TOOLS=[('pricefold','Price & Profit Calculator','Price & margin','Calculate product costs, channel fees, returns and the price needed for your target margin.'),('rangeboard','Collection Planner','Collection planner','Plan your seasonal styles, colourways, sizes, quantities, prices and delivery drops.'),('swatchsmith','Colour Palette Builder','Colour palettes','Build a collection palette from Forecut forecasts or your own colours.'),('evenpoint','Break-even Calculator','MOQ & break-even','Compare order quantities, investment, sell-through and the risk of unsold stock.'),('cutclock','Production Calendar','Production calendar','Work backward from launch to plan sampling, sourcing, production and delivery.')]
nav=''.join(f'<a class="tab" href="{key}.html" data-tab="{key}"><img src="tools/icons/{key}.svg" alt=""><span>{name}<small>{label}</small></span></a>' for key,name,label,_ in TOOLS)
def build():
 for key,name,label,desc in TOOLS:
     start=key if key!='tools' else 'pricefold'
     page=f'''<!doctype html>
 <html lang="en-IN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{name} · {label} | Forecut</title><meta name="description" content="{html.escape(desc,quote=True)}"><meta name="theme-color" content="#214538"><meta property="og:title" content="{name} · {label} | Forecut"><meta property="og:description" content="{html.escape(desc,quote=True)}"><meta property="og:url" content="https://forecut.in/{key}.html"><meta property="og:image" content="https://forecut.in/og-image.png"><link rel="canonical" href="https://forecut.in/{key}.html"><link rel="icon" href="favicon.svg"><link rel="stylesheet" href="tools/tools.css?v=tcx-tn-tsx-20261111"><script defer src="tools/core.js"></script><script defer src="tools/palettes.js"></script><script defer src="tools/colour-library.js?v=tcx-tn-tsx-20261111"></script><script defer src="tools/app.js?v=tcx-tn-tsx-20261111"></script></head>
 <body data-tool="{start}"><header class="top"><a class="brand" href="index.html">Forecut<span style="color:#a74826">.</span></a><small><a href="tools.html">All Forecut tools</a></small><a class="back" href="index.html">← Back to forecasts</a></header>
 <div class="layout"><aside class="sidebar"><span class="eyebrow">From forecast to launch</span><nav aria-label="Planning tools">{nav}</nav><div class="side-note">Your collection stays in this browser. Download a backup to keep it safe or move to another device.<p>No account required.</p></div></aside>
 <main id="main"><div class="workspace"><label>Collection name<input id="collectionName" maxlength="100" value="My collection"></label><button id="backup">Download backup</button><button id="restore">Restore backup</button><input id="restoreFile" type="file" accept=".json,application/json" hidden><button id="print">Print / save PDF</button></div><div id="status" role="status" aria-live="polite"></div><p id="printCollection" class="print-only"></p><div id="app"></div><noscript><p>Enable JavaScript to use the Forecut planning tools. No data is sent to a server.</p></noscript><footer class="footer">Forecut · Plan with your own supplier rates and approved specifications. Estimates are planning guides.<br>forecut.in · <a href="privacy.html">Privacy</a> · <a href="tools.html">All planning tools</a></footer></main></div><div id="toast" role="status" aria-live="polite" hidden></div></body></html>'''
     (ROOT/f'{key}.html').write_text(page)
 S=json.loads((ROOT/'build/seasons.json').read_text())
 locked=json.loads((ROOT/'build/site.json').read_text()).get('locked',[])
 palettes=[{'season':k,'title':S['meta'][k]['title'],'colours':[{'hex':h,'name':n} for h,n in S['meta'][k]['palette']]} for k in S['seasons'] if k not in locked]
 (ROOT/'tools/palettes.js').write_text('window.ForecutPalettes = '+json.dumps(palettes,ensure_ascii=False)+';\n')


def hub_cards():
    cards = ''.join(f'<a href="{key}.html"><span class="b"><img src="tools/icons/{key}.svg" alt="" width="56" height="56" style="width:56px;height:56px;aspect-ratio:1;object-fit:contain"><small>Free · {html.escape(label)}</small><b>{name}</b><span>{html.escape(desc)}</span><em>Open the tool →</em></span></a>' for key,name,label,desc in TOOLS)
    return '<section id="collection-tools" aria-labelledby="collection-tools-heading"><h2 id="collection-tools-heading">Plan, price and launch your collection</h2><p class="lead">Five connected tools with a shared collection, browser saving, backup and restore. No account required.</p><div class="hubg">' + cards + '</div><p class="hint">Collection data stays in this browser. Download a backup before clearing browser storage or changing devices. Spreadsheet exports are CSV; printable reports use your browser’s Save as PDF option.</p></section>'

if __name__ == '__main__':
    build()
