"""Build Forecut's eight browser-local design and production tools."""
from pathlib import Path
from html import escape
import sys
sys.path.insert(0, str(Path(__file__).resolve().parent))
ROOT=Path(__file__).resolve().parent.parent
TOOLS=[
 ('trend-to-style','Trend-to-style Builder','Turn a trend detail into a practical, editable style brief.','design','Trend to Style Brief'),
 ('tech-pack-builder','Tech Pack Builder','Bring sketches, callouts, materials and measurements into a supplier-ready document.','production','Tech Pack Builder'),
 ('size-chart-builder','Size Chart Builder','Grade your measurements across sizes with your own steps and tolerances.','design','Size Chart Builder'),
 ('export-market-checker','Export Market Checker','Organise destination research with official sources and an export checklist.','production','Export Market Checker'),
 ('product-description-writer','Product Description Writer','Turn verified product facts into editable English or Hindi product copy.','plan','Product Description Writer'),
 ('decoration-cost-estimator','Embroidery & Print Cost Estimator','Estimate decoration cost, setup allocation and embroidery batch time.','cost','Embroidery & Print Cost'),
 ('care-label-generator','Care Label Generator','Create a text care label from approved composition and care instructions.','production','Care Label Generator')]
def build():
 for slug,name,desc,group,icon in TOOLS:
  import tools_shell as T
  page=f'''<!doctype html><html lang="en-IN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{escape(T.title(slug))} | Forecut</title><meta name="description" content="{escape(desc)}"><link rel="canonical" href="https://forecut.in/{slug}.html"><meta property="og:title" content="{escape(T.title(slug))} | Forecut"><meta property="og:description" content="{escape(desc)}"><meta property="og:image" content="https://forecut.in/tools/thumbnails/{slug}.svg"><meta name="theme-color" content="#214538"><link rel="icon" href="favicon.svg"><link rel="stylesheet" href="tools/studio.css?v={T.VER}">{T.head_links(slug)}{T.rail_style(slug)}<script defer src="tools/studio-core.js?v={T.VER}"></script><script defer src="tools/studio.js?v={T.VER}"></script></head>{T.body_open(slug)}<main id="main" class="fx-main">{T.title_row(slug,desc,'Your work is saved in this browser and shared by Trend to Style Brief, Tech Pack Builder, Size Chart Builder, Export Market Checker, Product Description Writer, Embroidery & Print Cost and Care Label Generator. Download a backup to keep it safe or move it to another device.',extra_buttons='<button id="fxExample" type="button">Try an example</button>')}<nav id="studioNav" hidden></nav><div id="status" role="status" aria-live="polite"></div><div id="app" class="fx-app" data-fx-gate></div><noscript>Turn on JavaScript to use this tool. Nothing you enter is sent to a server.</noscript>{T.foot('Forecut · Check estimates, fit and specifications with your supplier before production.')}</main></div></body></html>'''
  (ROOT/(slug+'.html')).write_text(page)
if __name__=='__main__':build()
