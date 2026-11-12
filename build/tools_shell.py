"""Shared frame for every Forecut tool page: one header, one grouped tool list, one title row with a workspace menu.

Used by collection_tools.py and studio_tools.py (and the dye calculator wrapper), so every tool looks the same.
The tool list itself is rendered by tools/shell.js from one registry.
"""
from html import escape

VER = 'fx-20261112'

# slug: (brand name, plain label, stage)
NAMES = {
    'rangeboard': ('Collection Planner', 'Plan styles, sizes, quantities and drops', '01 Plan the collection'),
    'trend-to-style': ('Trend to Style Brief', 'Turn a trend detail into a style brief', '01 Plan the collection'),
    'swatchsmith': ('Colour Palette Builder', 'Season palettes and swatch sheets', '02 Colour and fabric'),
    'fabric-finder': ('Fabric Finder', 'Choose fabric by weight, stretch and drape', '02 Colour and fabric'),
    'textile-calculator': ('Textile Calculator', 'Yarn, GSM, weaving, knitting and costing', '02 Colour and fabric'),
    'textile-processing-studio': ('Textile Processing Studio', 'Dyeing, processing and colour blends', '02 Colour and fabric'),
    'pattern-maker': ('Pattern Maker', 'Draft and grade garment patterns', '03 Pattern and fit'),
    'size-chart-builder': ('Size Chart Builder', 'Grade measurements across sizes', '03 Pattern and fit'),
    'decoration-cost-estimator': ('Embroidery & Print Cost', 'Decoration cost per piece', '04 Sampling and tech pack'),
    'tech-pack-builder': ('Tech Pack Builder', 'Supplier-ready tech packs', '04 Sampling and tech pack'),
    'pricefold': ('Price & Margin Calculator', 'Real margin after GST, fees and returns', '05 Costing and production'),
    'evenpoint': ('Break-even Calculator', 'Pieces you must sell to cover costs', '05 Costing and production'),
    'cutclock': ('Production Calendar', 'Deadlines worked back from launch', '05 Costing and production'),
    'care-label-generator': ('Care Label Generator', 'Fibre content and care instructions', '06 Labels, listing and export'),
    'product-description-writer': ('Product Description Writer', 'Listing titles, bullets and tags', '06 Labels, listing and export'),
    'export-market-checker': ('Export Market Checker', 'Rules and dates by country', '06 Labels, listing and export'),
}
COUNT = len(NAMES)

# the result block that stays beside the inputs on wide screens
RAIL = {
    'pricefold': '#priceResults',
    'rangeboard': '#rangeResults',
    'evenpoint': '#evenResults',
    'trend-to-style': 'section.panel:last-of-type',
    'product-description-writer': 'section.panel:last-of-type',
    'decoration-cost-estimator': 'section.panel:last-of-type',
    'care-label-generator': 'section.panel:last-of-type',
}


def title(slug):
    return NAMES[slug][0]


def head_links():
    return (f'<link rel="stylesheet" href="tools/shell.css?v={VER}">'
            f'<script defer src="tools/shell.js?v={VER}"></script><script defer src="tools/gate.js?v={VER}"></script>'
            '<script type="module" src="auth.js"></script>')


def rail_style(slug):
    sel = RAIL.get(slug)
    if not sel:
        return ''
    s = f'.fx-app>{sel}'
    return ('<style>@media (min-width:1100px){'
            f'{s}{{grid-column:2;grid-row:1/span 40;position:sticky;top:16px;max-height:calc(100vh - 32px);overflow:auto}}'
            f'{s} .metrics{{grid-template-columns:1fr 1fr}}'
            f'{s} .metric:first-child{{grid-column:1/-1;background:var(--fx-green);border-color:var(--fx-green);color:#fff}}'
            f'{s} .metric:first-child *{{color:#fff}}'
            '}</style>')


def body_open(slug, extra_attrs=''):
    rail = RAIL.get(slug)
    attrs = f' data-tool="{slug}" data-tool-name="{escape(NAMES[slug][0], quote=True)}"' + (f' data-rail="{escape(rail, quote=True)}"' if rail else '') + extra_attrs
    return (f'<body class="fx"{attrs}>'
            '<a class="fx-skip" href="#main" style="position:absolute;left:-999px">Skip to the tool</a>'
            '<header class="fx-head"><a class="fx-brand" href="index.html">Forecut<span>.</span></a>'
            '<nav aria-label="Main"><a href="index.html">Forecasts</a><a href="tools.html" aria-current="page">Tools</a>'
            '<a href="journal.html">Journal</a>'
            f'<a class="fx-signin" href="account.html?next={slug}.html#signin">Sign in ↗</a></nav></header>'
            '<div class="fx-frame"><aside class="fx-side">'
            f'<button class="fx-side-toggle" type="button" aria-expanded="false">All {COUNT} tools <span aria-hidden="true">▾</span></button>'
            '<nav id="fxNav" aria-label="Forecut tools"></nav></aside>')


def title_row(slug, desc, workspace_note, print_label='Print / PDF', extra_buttons=''):
    n, l, stage = NAMES[slug]
    return (f'<div class="fx-title"><div><span class="fx-kicker">Step {escape(stage)}</span>'
            f'<h1>{escape(n)}<span>{escape(l)}</span></h1><p>{escape(desc)}</p></div>'
            f'<div class="fx-actions no-print">{extra_buttons}<button id="print" type="button">{escape(print_label)}</button>'
            '<details class="fx-ws"><summary>Workspace <span aria-hidden="true">▾</span></summary><div class="fx-ws-pop">'
            '<label>Collection name<input id="collectionName" maxlength="100" value="My collection"></label>'
            '<button id="backup" type="button">Download backup</button><button id="restore" type="button">Restore backup</button>'
            '<input id="restoreFile" type="file" accept=".json,application/json" hidden>'
            f'<p>{escape(workspace_note)}</p></div></details></div></div>')


def foot(text):
    return (f'<footer class="fx-foot">{text}<br><a href="privacy.html">Privacy</a> · <a href="terms.html">Terms</a> · '
            '<a href="tools.html">All tools</a></footer>')
