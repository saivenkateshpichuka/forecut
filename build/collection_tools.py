"""Build the five browser-local planning tools. No external services required."""
from pathlib import Path
import json, html, sys
sys.path.insert(0, str(Path(__file__).resolve().parent))
ROOT=Path(__file__).resolve().parent.parent
TOOLS=[('pricefold','Price & Profit Calculator','Price & margin','Calculate product costs, channel fees, returns and the price needed for your target margin.'),('rangeboard','Collection Planner','Collection planner','Plan your seasonal styles, colourways, sizes, quantities, prices and delivery drops.'),('swatchsmith','Colour Palette Builder','Colour palettes','Build a collection palette from Forecut forecasts or your own colours.'),('evenpoint','Break-even Calculator','MOQ & break-even','Compare order quantities, investment, sell-through and the risk of unsold stock.'),('cutclock','Production Calendar','Production calendar','Work backward from launch to plan sampling, sourcing, production and delivery.')]
nav=''.join(f'<a class="tab" href="{key}.html" data-tab="{key}"><img src="tools/icons/{key}.svg" alt=""><span>{name}<small>{label}</small></span></a>' for key,name,label,_ in TOOLS)
def build():
 for key,name,label,desc in TOOLS:
     start=key if key!='tools' else 'pricefold'
     import tools_shell as T
     n,l,_=T.NAMES[key]
     page=f'''<!doctype html>
<html lang="en-IN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{T.title(key)} | Forecut</title><meta name="description" content="{html.escape(desc,quote=True)}"><meta name="theme-color" content="#214538"><meta property="og:title" content="{T.title(key)} | Forecut"><meta property="og:description" content="{html.escape(desc,quote=True)}"><meta property="og:url" content="https://forecut.in/{key}.html"><meta property="og:image" content="https://forecut.in/og-image.png"><link rel="canonical" href="https://forecut.in/{key}.html"><link rel="icon" href="favicon.svg"><link rel="stylesheet" href="tools/tools.css?v={T.VER}">{T.head_links(key)}{T.rail_style(key)}<script defer src="tools/core.js?v={T.VER}"></script><script defer src="tools/palettes.js?v={T.VER}"></script><script defer src="tools/colour-library.js?v={T.VER}"></script><script defer src="tools/app.js?v={T.VER}"></script></head>
{T.body_open(key)}<main id="main" class="fx-main">{T.title_row(key,desc,'Your collection is saved in this browser and shared by Collection Planner, Price & Margin Calculator, Colour Palette Builder, Break-even Calculator and Production Calendar. Download a backup to keep it safe or move it to another device.')}<div id="status" role="status" aria-live="polite"></div><p id="printCollection" class="print-only"></p><div id="app" class="fx-app" data-fx-gate></div><noscript><p>Turn on JavaScript to use this tool. Nothing you enter is sent to a server.</p></noscript>{T.foot('Forecut · Use your own supplier rates and approved specifications. Results are planning estimates.')}</main></div><div id="toast" role="status" aria-live="polite" hidden></div></body></html>'''
     (ROOT/f'{key}.html').write_text(page)
 S=json.loads((ROOT/'build/seasons.json').read_text())
 locked=json.loads((ROOT/'build/site.json').read_text()).get('locked',[])
 palettes=[{'season':k,'title':S['meta'][k]['title'],'colours':[{'hex':h,'name':n} for h,n in S['meta'][k]['palette']]} for k in S['seasons'] if k not in locked]
 # India seasons (published ones only); names from the research palette, or the nearest colour name
 try:
  import india_data as ID, india_seasons as IS
  IS.apply(ID)
  research=json.loads((ROOT/'build/india_research.json').read_text()).get('seasons',{})
  names=_colour_names()
  for code,info in ID.SEASON_INFO.items():
   if code in locked: continue
   pal=research.get(code,{}).get('palette') or [[h,_nearest(h,names)] for h in info.get('colours',[])]
   if pal: palettes.append({'season':'in-'+code.lower().replace(' ','-'),'title':'India · '+code.replace(' 2',' 202').replace('Festive 26','Festive 2026') ,'colours':[{'hex':h.lower(),'name':n} for h,n in pal]})
 except Exception as e: print('india palettes skipped:',e)
 # Pantone TCX screen approximations (public dataset, the same set the forecast pages use for nearest codes)
 tcx=json.loads((ROOT/'build/pantone_fhi.json').read_text())
 rows=[f"{code}|{name.replace('-',' ').title()}|{hx.lower()}" for code,(name,hx) in sorted(tcx.items())]
 (ROOT/'tools/tcx-ref.js').write_text('/* Pantone Fashion, Home + Interiors TCX references: '+str(len(rows))+' codes with screen-approximation HEX values from a public dataset (github.com/Margaret2/pantone-colors).\n   Screen colours are previews only; confirm every shade against a physical Pantone book. Loaded only by Colour Palette Builder. */\nwindow.ForecutTCX='+json.dumps(';'.join(rows))+';\n')
 (ROOT/'tools/palettes.js').write_text('window.ForecutPalettes = '+json.dumps(palettes,ensure_ascii=False)+';\n')


def _colour_names():
 import re
 raw=(ROOT/'tools/colour-names.js').read_text(); out={}
 for line in raw.splitlines():
  m=re.match(r'window\.(Forecut\w+Names)=(.*);$',line)
  if m: out[m.group(1)]=[(p[:6],p[6:]) for p in json.loads(m.group(2)).split('|')]
 return out
def _lab(h):
 h=h.lstrip('#');rgb=[int(h[i:i+2],16)/255 for i in (0,2,4)];rgb=[((c+.055)/1.055)**2.4 if c>.04045 else c/12.92 for c in rgb]
 x=(rgb[0]*.4124+rgb[1]*.3576+rgb[2]*.1805)/.95047;y=rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;z=(rgb[0]*.0193+rgb[1]*.1192+rgb[2]*.9505)/1.08883
 f=lambda t:t**(1/3) if t>.008856 else 7.787*t+16/116
 return 116*f(y)-16,500*(f(x)-f(y)),200*(f(y)-f(z))
def _nearest(h,names):
 a=_lab(h);d=lambda p:sum((u-v)**2 for u,v in zip(a,_lab(p[0])))
 f=min(names['ForecutFashionNames'],key=d)
 return f[1] if d(f)<12**2 else min(names['ForecutColourNames'],key=d)[1]

def hub_cards():
    cards = ''.join(f'<a href="{key}.html"><span class="b"><img src="tools/icons/{key}.svg" alt="" width="56" height="56" style="width:56px;height:56px;aspect-ratio:1;object-fit:contain"><small>Free · {html.escape(label)}</small><b>{name}</b><span>{html.escape(desc)}</span><em>Open the tool →</em></span></a>' for key,name,label,desc in TOOLS)
    return '<section id="collection-tools" aria-labelledby="collection-tools-heading"><h2 id="collection-tools-heading">Plan, price and launch your collection</h2><p class="lead">Five connected tools with a shared collection, browser saving, backup and restore. No account required.</p><div class="hubg">' + cards + '</div><p class="hint">Collection data stays in this browser. Download a backup before clearing browser storage or changing devices. Spreadsheet exports are CSV; printable reports use your browser’s Save as PDF option.</p></section>'

if __name__ == '__main__':
    build()
