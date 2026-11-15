"""Build the Fabric & Trims Library and Fit & QC Studio pages (Stage 8)."""
from pathlib import Path
from html import escape
import sys
sys.path.insert(0, str(Path(__file__).resolve().parent))
import tools_shell as T

ROOT = Path(__file__).resolve().parent.parent
PAGES = {
    'style-tracker': ('Track every style from brief to store: status, owner, revision and sign-off, milestones on the critical path, samples, buyer comments, linked files and a full change history, with what is blocking each style.',
                      'Tracker data is saved in this browser. Download a backup to keep it or move it to another device.', 'plm.js',
                      'Forecut · A lightweight tracker for small teams. It keeps dates and decisions; it does not replace contracts or purchase orders.'),
    'materials-library': ('Keep every fabric and trim you use in one library: fibre, construction, GSM, width, shrinkage, stretch, vendor, price, MOQ, lead time, certifications, tests and approved substitutes. Each value shows whether you entered it, the supplier claims it or a lab tested it.',
                          'Your materials are saved in this browser. Download a backup to keep them or move them to another device.', 'materials.js',
                          'Forecut · Supplier claims are not verified by Forecut. Check certificates on the certifier’s database and test fabrics before bulk.'),
    'fit-qc-studio': ('Run fit sessions and inspections for each style: sample size, material lot, fit model, photos, every point of measure against the graded spec and tolerance, issues with severity, action, owner and due date, approval, before-and-after comparison and the AQL sample size.',
                      'Sessions are saved with the active style in this browser. Download a backup to keep them.', 'fitqc.js',
                      'Forecut · Measurements and AQL plans support your quality process; they do not replace your buyer’s quality manual.'),
}


def build():
    v = T.VER
    for slug, (desc, note, js, foot) in PAGES.items():
        t = T.title(slug)
        page = (f'<!doctype html><html lang="en-IN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{escape(t)} | Forecut</title>'
                f'<meta name="description" content="{escape(desc)}"><link rel="canonical" href="https://forecut.in/{slug}.html"><meta property="og:title" content="{escape(t)} | Forecut"><meta property="og:description" content="{escape(desc)}">'
                f'<meta name="theme-color" content="#214538"><link rel="icon" href="favicon.svg"><link rel="stylesheet" href="fonts/fonts.css">{T.head_links(slug)}'
                f'<link rel="stylesheet" href="tools/tools.css?v={v}"><link rel="stylesheet" href="tools/stage8.css?v={v}"><script defer src="tools/{js}?v={v}"></script></head>'
                f'{T.body_open(slug)}<main id="main" class="fx-main">{T.title_row(slug, desc, note, extra_buttons="<button id=fxExample type=button>Load example</button>")}'
                f'<div id="status" role="status" aria-live="polite"></div><div id="app" class="fx-app s8" data-fx-gate></div>'
                f'<noscript>Turn on JavaScript to use this tool. Nothing you enter is sent to a server.</noscript>{T.foot(foot)}</main></div></body></html>')
        (ROOT / f'{slug}.html').write_text(page)


if __name__ == '__main__':
    build()
