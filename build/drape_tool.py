"""Build the 3D Drape Studio page (desktop only) and copy its scripts into tools/."""
from pathlib import Path
from html import escape
import sys
sys.path.insert(0, str(Path(__file__).resolve().parent))
import tools_shell as T

ROOT = Path(__file__).resolve().parent.parent
SRC = Path(__file__).resolve().parent / 'tools_js'
SLUG = '3d-drape-studio'
DESC = ('Sew your pattern onto a realistic 3D avatar in your size, body type and pose, and see how it drapes in different fabrics. '
        'Pull the cloth, move pieces with a gizmo, and check ease with a fit map before you cut a sample.')


def scripts(v):
    head = '/* Forecut. Built from build/tools_js; edit there. */\n'
    (ROOT / 'tools/pm-engine.js').write_text(head + (SRC / 'pm_engine.js').read_text())
    (ROOT / 'tools/drape-sim.js').write_text(head + (SRC / 'drape_sim.js').read_text())
    (ROOT / 'tools/drape-worker.js').write_text(head + (SRC / 'drape_worker.js').read_text().replace('__V__', v))
    ui = (SRC / 'drape_ui.js').read_text().replace('__V__', v)
    imports = f"import './pm-engine.js?v={v}';\nimport './drape-sim.js?v={v}';\n"
    (ROOT / 'tools/drape.js').write_text(head + imports + ui)


def build():
    v = T.VER
    scripts(v)
    start = ('<script>(function(){var ok=window.matchMedia&&matchMedia("(min-width: 1024px) and (pointer: fine)").matches&&!/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);'
             'if(ok){var s=document.createElement("script");s.type="module";s.src="tools/drape.js?v=' + v + '";document.head.appendChild(s);return;}'
             'document.body.classList.add("dr-mobile");var a=document.getElementById("app");if(a){a.removeAttribute("data-fx-gate");a.innerHTML=\'<div class="dr-desk"><img src="tools/covers/3d-drape-studio-640.webp" alt="" width="640" height="360"><h2>Open 3D Drape Studio on a desktop</h2>'
             '<p>The 3D view needs a desktop or laptop screen, a mouse or trackpad, and the extra graphics power of a computer. Open this page on your computer to sew and drape your patterns in 3D.</p>'
             '<a href="pattern-maker.html" target="_top">Use Garment Studio instead</a></div>\';}})();</script>')
    page = (f'<!doctype html><html lang="en-IN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
            f'<title>{escape(T.title(SLUG))} | Forecut</title><meta name="description" content="{escape(DESC)}">'
            f'<link rel="canonical" href="https://forecut.in/{SLUG}.html"><meta property="og:title" content="{escape(T.title(SLUG))} | Forecut">'
            f'<meta property="og:description" content="{escape(DESC)}"><meta name="theme-color" content="#214538"><link rel="icon" href="favicon.svg">'
            f'<link rel="stylesheet" href="fonts/fonts.css">{T.head_links(SLUG)}<link rel="stylesheet" href="tools/drape.css?v={v}">'
            f'<link rel="modulepreload" href="tools/vendor/three.module.min.js">'
            # 3D now lives inside Garment Studio: this page only runs embedded there; opened on its own it goes to the studio's 3D mode
            '<script>(function(){var q=location.search;if(!/[?&]embed=1/.test(q)){location.replace("pattern-maker.html"+(q?q+"&":"?")+"mode=3d");return;}document.documentElement.classList.add("fc-embed");})();</script>'
            '<style>html.fc-embed .fx-head,html.fc-embed .fx-side,html.fc-embed .fx-title,html.fc-embed .follow,html.fc-embed .fx-foot,html.fc-embed .fctab,html.fc-embed #drPM,html.fc-embed .fx-skip{display:none!important}'
            'html.fc-embed .fx-frame{display:block;padding:0;margin:0;max-width:none}html.fc-embed .fx-main{padding:0!important;margin:0!important;max-width:none!important}html.fc-embed body{overflow:hidden}html.fc-embed .dr{height:100vh;max-height:none;padding:8px;box-sizing:border-box}</style></head>'
            f'{T.body_open(SLUG)}<main id="main" class="fx-main">'
            f'{T.title_row(SLUG, '', "Your garment, size, fabric and colour are saved in this browser. Download a backup to move them to another computer.", print_label="Save image")}'
            f'<div id="status" role="status" aria-live="polite"></div><div id="app" class="fx-app" data-fx-gate></div>{start}'
            f'<noscript>Turn on JavaScript to use this tool.</noscript>'
            f'{T.foot("Forecut · The 3D view is a preview for proportion and fit direction. Fabric behaviour is estimated from typical weights, not lab tests. Always sew a sample before production.")}'
            f'</main></div></body></html>')
    (ROOT / f'{SLUG}.html').write_text(page)


if __name__ == '__main__':
    build()
