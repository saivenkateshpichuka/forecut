"""One site-wide header for every Forecut page: a thin announcement strip, a full-width bar with
mega menus (Forecasts, Insight, Design, Tools, About), search, sign-in and a free-trial button.
seo.py inserts it after <body> and removes each page's old top nav. Also sets the wider page width."""

LOGO = ('<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="2" y="2" width="28" height="28" rx="7" fill="#1f3d33"/>'
        '<path d="M10 23V9h12M10 16h8" stroke="#f5f0e8" stroke-width="3" fill="none" stroke-linecap="round"/>'
        '<path d="M22 18l3 3-3 3" stroke="#e0784b" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>')

MENU = [
    ('Forecasts', 'forecasts', [
        ('Seasons', [('ss27.html', 'SS27', 'Next season forecast'), ('aw26.html', 'AW26', 'In stores now'),
                     ('resort-27.html', 'Resort 27', 'Cruise · Nov–Jan'), ('pre-fall-27.html', 'Pre-Fall 27', 'Outlook · May–Jul'),
                     ('aw27.html', 'AW27', 'Early outlook')]),
        ('Regions', [('regions.html', 'All regions', 'Global forecast, read by market'), ('region-asia.html', 'Asia', ''),
                     ('region-europe.html', 'Europe', ''), ('region-north-america.html', 'North America', ''),
                     ('india.html', 'India', 'Festive and summer seasons')]),
    ], ('ss27.html', 'SS27 forecast', 'The waist returns, handcraft goes everyday and a luminous blue leads.', 'img/hero-ss27.webp')),
    ('Insight', 'insight', [
        ('Read', [('reports.html', 'Reports', 'Ready-to-use trend and market reports'), ('journal.html', 'Journal', 'Analysis and practical guides'),
                  ('celebrity-style.html', 'Celebrity style', 'Weekly red-carpet watch'),
                  ('how-to-choose-a-fashion-trend-forecasting-service.html', 'Choosing a forecasting service', 'Free vs paid, global vs India')]),
        ('More regions', [('region-south-america.html', 'South America', ''), ('region-africa.html', 'Africa', ''),
                          ('region-oceania.html', 'Oceania', ''), ('method.html', 'How we forecast', 'Our method and sources')]),
    ], None),
    ('Design', 'design', [
        ('Inspiration', [('couture.html', 'Couture', 'Haute couture, bridal and bespoke'), ('fabrics.html', 'Fabrics', 'Fibres, weights and innovations'),
                         ('colour.html', 'Colour', 'Colour stories and theory')]),
    ], None),
    ('Tools', 'tools', [
        ('Most used', [('pattern-maker.html', 'Pattern Maker', 'Western and Indian patterns, editable, every size'),
                       ('textile-processing-studio.html', 'Textile Processing Studio', 'Dye recipes, blends and process costing'),
                       ('tech-pack-builder.html', 'Tech Pack Builder', 'Factory-ready tech packs'),
                       ('trend-to-style.html', 'Trend to Style Brief', 'Mood, collection and accessory boards')]),
        ('Plan and cost', [('rangeboard.html', 'Collection Planner', ''), ('pricefold.html', 'Price & Margin Calculator', ''),
                           ('textile-calculator.html', 'Textile Calculator', ''), ('tools.html', 'All 15 tools →', 'In garment-process order')]),
    ], ('tools.html', 'Forecut Studio', 'Every tool in one app, from collection plan to export.', None)),
    ('About', 'about', [
        ('Forecut', [('about.html', 'About Forecut', ''), ('method.html', 'How we forecast', ''), ('index.html#pricing', 'Pricing & access', ''),
                     ('contact.html', 'Contact', '')]),
    ], None),
]


def html(active=''):
    nav = []
    for label, key, cols, feat in MENU:
        c = ''.join('<div class="fs-col"><p>' + h + '</p>' + ''.join(
            f'<a href="/{u}"><b>{t}</b>' + (f'<small>{d}</small>' if d else '') + '</a>' for u, t, d in links) + '</div>' for h, links in cols)
        if feat:
            u, t, d, img = feat
            c += (f'<a class="fs-feat" href="/{u}">' + (f'<span class="fs-fi" style="background-image:url(/{img})"></span>' if img else '<span class="fs-fi fs-fg">' + LOGO + '</span>')
                  + f'<b>{t}</b><small>{d}</small><em>Open →</em></a>')
        cur = ' aria-current="true"' if key == active else ''
        nav.append(f'<li class="fs-it"><button type="button" class="fs-tb" aria-expanded="false"{cur}>{label}</button><div class="fs-mega"><div class="fs-mi">{c}</div></div></li>')
    return ('<!--sitehead--><div class="fs-strip"><div class="fs-in"><span class="fs-l">Free trial: every season, region and tool until 1 January 2027.</span><span class="fs-s">Free trial until 1 Jan 2027</span>'
            '<a href="/account.html#signup">Start free →</a></div></div>'
            '<header class="fs-head" id="fc-site"><div class="fs-in">'
            f'<a class="fs-logo" href="/" aria-label="Forecut home">{LOGO}<span>FORECUT</span></a>'
            '<nav class="fs-nav" aria-label="Main"><ul>' + ''.join(nav) + '</ul></nav>'
            '<div class="fs-act"><div id="fc-install-slot" hidden></div><a class="fs-search" href="/search.html" aria-label="Search Forecut"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/></svg></a>'
            '<a class="fs-price" href="/index.html#pricing">Pricing</a><span id="fc-account-slot"><a href="/account.html#signin">Sign in</a></span>'
            '<a class="fs-cta" href="/account.html#signup">Start free trial</a>'
            '<button type="button" class="fs-burger" aria-expanded="false" aria-label="Open menu"><i></i><i></i><i></i></button></div>'
            '</div></header>' + JS + '<!--/sitehead-->')


CSS = r'''<style id="fs-css">
:root{--fs-max:1440px;--fs-gut:clamp(16px,3.2vw,48px)}
html{overflow-x:clip}body{margin-top:0!important;padding-top:0!important}.fs-strip,.fs-head{margin-left:calc(50% - 50vw);margin-right:calc(50% - 50vw)}
.fs-strip{background:#1c1714;color:#f2ebe2;font:500 12.5px/1.3 'DM Sans',system-ui,sans-serif;letter-spacing:.02em}
.fs-strip .fs-in{display:flex;justify-content:center;gap:14px;padding-top:8px;padding-bottom:8px;flex-wrap:wrap;text-align:center}
.fs-strip a{color:#fff;font-weight:700;text-decoration:underline;text-underline-offset:3px}
.fs-in{max-width:var(--fs-max);margin:0 auto;padding-left:var(--fs-gut);padding-right:var(--fs-gut);box-sizing:border-box}
.fs-head{position:sticky;top:0;z-index:950;background:#fff;color:#111;border-bottom:1px solid #e6e1d8;font-family:'DM Sans',system-ui,sans-serif}
.fs-head.fs-sc{box-shadow:0 6px 18px rgba(0,0,0,.06)}
.fs-head>.fs-in{display:flex;align-items:center;gap:28px;height:68px}
.fs-logo{display:flex;align-items:center;gap:10px;color:#111;text-decoration:none;font:800 19px/1 'DM Sans',sans-serif;letter-spacing:.16em;flex:none}
.fs-logo svg{width:30px;height:30px}
.fs-head .fs-nav{flex:1;height:100%;padding:0;margin:0;gap:0;justify-content:flex-start;align-items:stretch;flex-wrap:nowrap}.fs-nav ul{display:flex;gap:4px;list-style:none;margin:0;padding:0;height:100%}
.fs-it{display:flex;align-items:stretch}
.fs-tb{all:unset;cursor:pointer;padding:0 14px;font:600 13px/1 'DM Sans',sans-serif;letter-spacing:.09em;text-transform:uppercase;color:#111;display:flex;align-items:center;border-bottom:2px solid transparent;margin-bottom:-1px}
.fs-tb:hover,.fs-tb[aria-expanded=true],.fs-tb[aria-current]{border-bottom-color:#111}
.fs-tb:focus-visible{outline:2px solid #1f3d33;outline-offset:-2px}
.fs-mega{position:absolute;left:0;right:0;top:100%;background:#fff;border-top:1px solid #e6e1d8;border-bottom:1px solid #e6e1d8;box-shadow:0 18px 30px rgba(0,0,0,.08);display:none}
.fs-it.open .fs-mega{display:block}
.fs-mi{max-width:var(--fs-max);margin:0 auto;padding:28px var(--fs-gut) 32px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr)) minmax(260px,1.1fr);gap:36px;box-sizing:border-box}
.fs-col p{margin:0 0 12px;font:700 11px/1 'DM Sans',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#8a7f74}
.fs-col a{display:block;padding:7px 0;color:#111;text-decoration:none}.fs-col a b{font-weight:600;font-size:15px}
.fs-col a small{display:block;color:#6e6259;font-size:12.5px;margin-top:2px}.fs-col a:hover b{text-decoration:underline;text-underline-offset:3px}
.fs-feat{grid-column:4;display:block;color:#111;text-decoration:none;background:#f5f1ea;border-radius:4px;overflow:hidden;padding-bottom:16px}
.fs-fi{display:block;height:150px;background:#1f3d33 center/cover}.fs-fg{display:flex;align-items:center;justify-content:center}.fs-fg svg{width:64px;height:64px}
.fs-feat b,.fs-feat small,.fs-feat em{display:block;padding:0 16px}.fs-feat b{margin-top:14px;font-size:16px}.fs-feat small{color:#6e6259;margin-top:4px;font-size:13px}.fs-feat em{font-style:normal;font-weight:700;font-size:13px;margin-top:10px}
.fs-act{display:flex;align-items:center;gap:18px;flex:none;font:600 13.5px 'DM Sans',sans-serif}
.fs-act a{color:#111;text-decoration:none}.fs-search{display:flex}.fs-search svg{width:21px;height:21px}
.fs-cta{background:#111;color:#fff!important;padding:11px 18px;border-radius:2px;letter-spacing:.04em;white-space:nowrap}.fs-cta:hover{background:#1f3d33}
html.fc-member .fs-cta,html.fc-member .fs-strip{display:none}
.fs-burger{all:unset;cursor:pointer;display:none;width:26px;padding:6px 0}.fs-burger i{display:block;height:2px;background:#111;margin:5px 0}
#fc-account-slot .fc-account-label{display:none}
#fc-install-slot .fcinst{all:unset;cursor:pointer;font:600 13px 'DM Sans',sans-serif;color:#111;white-space:nowrap;border-bottom:1.5px solid #111;margin:0}
@media (max-width:1250px){#fc-install-slot{display:none!important}}
@media (max-width:760px){.fs-price{display:none}}
@media (min-width:1101px){.fs-it:hover .fs-mega{display:block}.fs-it:hover .fs-tb{border-bottom-color:#111}}
@media (max-width:1100px){
 .fs-head>.fs-in{height:60px;gap:12px}.fs-logo{font-size:17px}.fs-burger{display:block}.fs-cta{padding:9px 12px;font-size:12.5px}
 .fs-nav{position:fixed;left:0;right:0;top:var(--fs-top,60px);bottom:0;background:#fff;overflow:auto;display:none;height:auto;border-top:1px solid #e6e1d8}
 .fs-head.menu-open .fs-nav{display:block}.fs-nav ul{display:block;height:auto}.fs-it{display:block;border-bottom:1px solid #eee}
 .fs-tb{display:flex;justify-content:space-between;width:100%;box-sizing:border-box;padding:18px var(--fs-gut);font-size:14px;border:0;margin:0}
 .fs-tb:after{content:'+';font-size:20px;font-weight:400}.fs-tb[aria-expanded=true]:after{content:'–'}
 .fs-mega{position:static;box-shadow:none;border:0}.fs-mi{grid-template-columns:1fr;padding:0 var(--fs-gut) 18px;gap:18px}.fs-feat{grid-column:auto}.fs-fi{height:110px}}
@media (max-width:560px){.fs-cta{display:none}.fs-strip{font-size:11.5px}}
.fs-s{display:none}@media (max-width:640px){.fs-l{display:none}.fs-s{display:inline}}
@media print{.fs-strip,.fs-head{display:none}}
/* wider pages: use the screen like a trade platform, not a narrow blog column */
body>.wrap:not(.art):not(.j):not(.r):not(.c){max-width:var(--fs-max)!important;padding-left:var(--fs-gut)!important;padding-right:var(--fs-gut)!important;box-sizing:border-box}
</style>'''

JS = r'''<script>(function(){var h=document.getElementById('fc-site');if(!h)return;var its=[].slice.call(h.querySelectorAll('.fs-it'));
function close(x){its.forEach(function(i){if(i!==x){i.classList.remove('open');i.querySelector('.fs-tb').setAttribute('aria-expanded','false')}})}
its.forEach(function(i){var b=i.querySelector('.fs-tb');b.addEventListener('click',function(e){e.stopPropagation();var o=!i.classList.contains('open');close(i);i.classList.toggle('open',o);b.setAttribute('aria-expanded',String(o))});
 i.addEventListener('mouseleave',function(){if(matchMedia('(min-width:1101px)').matches){i.classList.remove('open');b.setAttribute('aria-expanded','false')}})});
document.addEventListener('click',function(e){if(!h.contains(e.target))close(null)});document.addEventListener('keydown',function(e){if(e.key==='Escape'){close(null);h.classList.remove('menu-open')}});
var bg=h.querySelector('.fs-burger');bg.addEventListener('click',function(){var o=!h.classList.contains('menu-open');h.classList.toggle('menu-open',o);bg.setAttribute('aria-expanded',String(o));document.documentElement.style.overflow=o?'hidden':'';h.style.setProperty('--fs-top',h.getBoundingClientRect().bottom+'px')});
addEventListener('scroll',function(){h.classList.toggle('fs-sc',scrollY>4)},{passive:true});})();</script>'''


def apply(h, fn):
    """Insert the site header into a page and remove the page's old top navigation."""
    import re
    h = re.sub(r'<!--sitehead-->.*?<!--/sitehead-->', '', h, flags=re.S)
    h = re.sub(r'<style id="fs-css">.*?</style>', '', h, flags=re.S)
    if 'id="pm-app"' in h or 'class="fx-main"' in h: return h  # tool pages keep their own app bar
    # old navs
    h = re.sub(r'<nav id="fc-header".*?</nav>', '', h, count=1, flags=re.S)
    h = re.sub(r'<nav><a class="logo" href="/">.*?</nav>', '', h, count=1, flags=re.S)
    h = re.sub(r'<a class="back" href="/"[^>]*>.*?</a>', '', h, count=1, flags=re.S)
    act = ('forecasts' if re.match(r'(ss|aw|resort|pre-fall|region|india)', fn) else 'tools' if fn == 'tools.html'
           else 'design' if fn.split('-')[0].split('.')[0] in ('couture', 'fabrics', 'colour') else
           'insight' if fn.split('-')[0].split('.')[0] in ('reports', 'journal', 'celebrity') else 'about' if fn in ('about.html', 'method.html', 'contact.html') else '')
    css = CSS
    if fn in ('journal.html', 'reports.html'): css = css.replace('</style>', 'body>.wrap{max-width:var(--fs-max)!important;padding-left:var(--fs-gut)!important;padding-right:var(--fs-gut)!important;box-sizing:border-box}</style>')
    h = h.replace('</head>', css + '</head>', 1)
    h = re.sub(r'(<body[^>]*>)', lambda m: m.group(1) + html(act), h, count=1)
    return h
