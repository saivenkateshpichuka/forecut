"""Build the Textile Processing Studio page (replaces the dye calculator; the old address redirects here)."""
from pathlib import Path
from html import escape
import sys
sys.path.insert(0, str(Path(__file__).resolve().parent))
import tools_shell as T

ROOT = Path(__file__).resolve().parent.parent
SLUG = 'textile-processing-studio'
DESC = ('Plan dyeing, printing, washing and finishing: build a dye recipe from a searchable dye library, cost a batch, '
        'preview how coloured fibres blend, and price a full processing route per kg and per metre.')


def build():
    v = T.VER
    page = f'''<!doctype html><html lang="en-IN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{escape(T.title(SLUG))} | Forecut</title><meta name="description" content="{escape(DESC)}"><link rel="canonical" href="https://forecut.in/{SLUG}.html"><meta property="og:title" content="{escape(T.title(SLUG))} | Forecut"><meta property="og:description" content="{escape(DESC)}"><meta name="theme-color" content="#214538"><link rel="icon" href="favicon.svg"><link rel="stylesheet" href="fonts/fonts.css">{T.head_links(SLUG)}<link rel="stylesheet" href="tools/processing.css?v={v}"><script defer src="tools/processing-data.js?v={v}"></script><script defer src="tools/processing.js?v={v}"></script></head>{T.body_open(SLUG)}<main id="main" class="fx-main">{T.title_row(SLUG, DESC, 'Your recipes, blends and routes are saved in this browser. Download a backup to keep them or move them to another device.', extra_buttons='<button id="fxExample" type="button">Load example</button>')}<div id="status" role="status" aria-live="polite"></div><div id="app" class="fx-app" data-fx-gate></div><noscript>Turn on JavaScript to use this tool. Nothing you enter is sent to a server.</noscript>{T.foot('Forecut · Recipes and costs are calculated starting points. Run a lab dip and follow your dye supplier’s instructions and safety data sheets.')}</main></div></body></html>'''
    (ROOT / f'{SLUG}.html').write_text(page)
    # keep the old address working
    (ROOT / 'dye-calculator.html').write_text(
        f'<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Textile Processing Studio | Forecut</title>'
        f'<link rel="canonical" href="https://forecut.in/{SLUG}.html"><meta name="robots" content="noindex">'
        f'<meta http-equiv="refresh" content="0; url={SLUG}.html"></head><body>'
        f'<p>The dye calculator is now part of the <a href="{SLUG}.html">Textile Processing Studio</a>.</p></body></html>')


if __name__ == '__main__':
    build()
