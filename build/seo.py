"""Add SEO tags to every page in the repo root, and write sitemap.xml and robots.txt. Safe to rerun (replaces its own block)."""
import re, json, datetime, os
import social as SO
R = '..'; BASE = 'https://forecut.in/'
S = json.load(open('seasons.json')); META = S['meta']; SEAS = S['seasons'] if 'seasons' in S else list(META)
pages = {
 'index.html': ('Forecut · Global Fashion Trend Forecasting | SS, Pre-Fall, AW & Resort by Region',
   'Forecut is global, detail-level fashion trend forecasting: what\'s emerging, rising, peaking and fading across SS, Pre-Fall, AW and Resort, read for Asia, Europe, the Americas, Africa and Oceania.', ''),
 'india.html': ('India Market Fashion Forecast 2026–28 · Sarees, Lehengas, Kurtas, Juttis | Forecut',
   'India fashion trends for Festive 2026, Summer 2027 and Festive 2027: sarees, lehengas, kurtas, bandhgalas, juttis, Kolhapuris, handloom fabrics, chikankari, mirror work and trims, with ₹ price guides.', 'india.html'),
}
for fn, t, d in [('about.html', 'About Forecut · Global Fashion Trend Forecasting', 'Forecut is an independent, detail-level global fashion trend forecasting platform for designers, brands and manufacturers in every region.'),
                 ('method.html', 'How Forecut Forecasts · Methodology, Sources & Trend Stages', 'How Forecut forecasts fashion trends: observed, forecast and projection signals, what emerging, rising, peaking and fading mean, sources, regional readings and image policy.'),
                 ('search.html', 'Search Forecut · Find Any Detail, Trend or Report', 'Search every Forecut detail, trend, region, report and article across AW26 to AW28, Resort, Pre-Fall and the India market.'),
                 ('contact.html', 'Contact Forecut', 'Contact Forecut at hello@forecut.in for questions, feedback, partnerships and enterprise enquiries.'),
                 ('terms.html', 'Terms & Conditions · Forecut', 'Terms and conditions for using the Forecut fashion trend forecasting website.'),
                 ('privacy.html', 'Privacy Policy · Forecut', 'How Forecut collects, uses and protects information, in line with Indian data protection law.')]:
    pages[fn] = (t, d, fn)
import journal_data as JD
pages['journal.html'] = ('Forecut Journal · Indian Fashion Trend Analysis & Guides', 'Analysis and practical guides on Indian and global fashion trends: festive and wedding wear, handloom, footwear, Gen Z fusion and colour, with rupee price bands.', 'journal.html')
ARTS = {}
pages['account.html'] = ('Sign in · Forecut', 'Sign in or create your Forecut account.', 'account.html')
for fn_, t_, d_ in json.load(open('reports_index.json')):
    pages[fn_] = (t_ + ' · Forecut', d_, fn_)
for a in JD.ARTICLES:
    pages[a['slug'] + '.html'] = (a['title'] + ' · Forecut Journal', a['desc'], a['slug'] + '.html'); ARTS[a['slug'] + '.html'] = a
import hubs_data as HD
_IM = set(json.load(open('images.json')))
def _pick(c): return next((x for x in c if x in _IM or os.path.exists(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'img', x + '.webp'))), 'og-image')
for _h in HD.HUBS:
    pages[_h['file']] = (_h['seo'][0], _h['seo'][1], _h['file'])
    for a in _h['articles']:
        pages[a['slug'] + '.html'] = (a['title'] + ' | Forecut ' + _h['eb'], a['desc'], a['slug'] + '.html')
        ARTS[a['slug'] + '.html'] = dict(a, hero=_pick(a['img']), date=HD.DATE)
import regions_data as RG
for _f, (_t, _d) in RG.PAGES.items(): pages[_f] = (_t, _d, _f)
OVR = {
 'index.html': ('Forecut | Global Fashion Trend Forecasting by Region 2026–2028',
   "Forecut is a global, detail-level fashion trend forecasting platform: SS, Pre-Fall, AW and Resort read for six regions, showing what's emerging, rising, peaking and fading, and when to act."),
 'india.html': ('India Market Fashion Forecast 2026–28 | Forecut Asia',
   'Season-by-season forecasts for Indian fashion, Festive 26 to Festive 28: sarees, lehengas, kurtas, menswear, footwear, fabrics and crafts, with rupee price guides.'),
 'reports.html': ('Trend Reports | Forecut',
   'Ready-to-use global trend reports: core item updates, design capsules, colour forecasts with Pantone TCX, sourcing guides, brand watch and India market reports, with PDF downloads.'),
 'journal.html': ('Journal | Forecut',
   'Expert analysis of global fashion trends by region: runway directions, regional markets, fabrics, footwear, colour and India festive wear, with practical next steps for brands.'),
 'about.html': ('About Us | Forecut',
   'Forecut is an independent global fashion trend forecasting company, combining expert research with AI and data to help brands, designers and manufacturers in every region plan ahead.'),
 'contact.html': ('Contact | Forecut', 'Contact Forecut at hello@forecut.in for questions, partnerships and enterprise enquiries about global fashion trend forecasting.'),
 'terms.html': ('Terms & Conditions | Forecut', 'Terms and conditions for using the Forecut fashion trend forecasting website and reports.'),
 'privacy.html': ('Privacy Policy | Forecut', 'How Forecut collects, uses and protects information, including analytics and advertising cookies.'),
}
for k in SEAS:
    m = META[k]
    pages[f'{k}.html'] = (f"{m['code']} Fashion Trend Forecast ({m['title']}) · Garments, Footwear & Details | Forecut",
        f"{m['code']} trend forecast: {m['intro']} Every detail marked emerging, rising, peaking or fading, with themes, colours and downloadable cards."[:300], f'{k}.html')
for _code, _report in json.load(open('india_season_reports.json'))['seasons'].items():
    pages[_report['file']] = (_code + ' India Fashion Forecast | Forecut', _report['focus'] + ' Design details, prices, designer stories and illustrated PDF.', _report['file'])
pages['india-reference-library.html'] = ('India Extended Reference Library | Forecut', 'Archived India season detail library and complete illustrated reference reports.', 'india-reference-library.html')
org = {"@context": "https://schema.org", "@graph": [
  {"@type": "Organization", "@id": BASE + "#org", "name": "Forecut", "url": BASE, "logo": BASE + "favicon-192.png", "email": "hello@forecut.in", "sameAs": SO.SAME_AS,
   "description": "Global, detail-level fashion trend forecasting platform for designers, brands and manufacturers, with regional forecasts for Asia, Europe, the Americas, Africa and Oceania.", "slogan": "Know the next detail before it trends.", "foundingDate": "2026", "contactPoint": {"@type": "ContactPoint", "email": "hello@forecut.in", "contactType": "customer support", "areaServed": "Worldwide", "availableLanguage": "en"}, "areaServed": "Worldwide"},
  {"@type": "WebSite", "@id": BASE + "#site", "name": "Forecut", "alternateName": ["Forecut India", "forecut.in"], "url": BASE, "publisher": {"@id": BASE + "#org"}, "inLanguage": "en-IN"}]}
for _fn, (_t, _d) in OVR.items():
    if _fn in pages: pages[_fn] = (_t, _d, pages[_fn][2])
for _k in SEAS:
    _fn = f'{_k}.html'
    if _fn in pages: pages[_fn] = (f"{META[_k]['code']} Fashion Trend Forecast | Forecut", pages[_fn][1], pages[_fn][2])
for _fn in list(pages):
    _t, _d, _p = pages[_fn]
    if _t.endswith(' · Forecut Journal'): _t = _t[:-len(' · Forecut Journal')] + ' | Forecut Journal'
    elif _t.endswith(' · Forecut'): _t = _t[:-len(' · Forecut')] + ' | Forecut'
    pages[_fn] = (_t, _d, _p)
SITE = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'site.json')))
def share_img(fn):
    html_ = open(os.path.join(R, fn)).read() if os.path.exists(os.path.join(R, fn)) else ''
    k = fn[:-5]
    for cand in [f'img/hero-{k}.webp', f'img/hero-{"india" if k == "india" else k}.webp']:
        if os.path.exists(os.path.join(R, cand)): return cand, 1920, 1080
    m = re.search(r'<div class="(?:jhero|ci|hhero)"><img src="(img/[^"]+)"', html_)
    if m: return m.group(1), 800, 800
    return 'og-image.png', 1200, 630
TAB = '<style>.fctab{display:none}@media (max-width:760px){body{padding-bottom:calc(70px + env(safe-area-inset-bottom,0px))!important}\n.fctab{display:grid;grid-template-columns:repeat(5,1fr);position:fixed;left:0;right:0;bottom:0;z-index:30;background:color-mix(in srgb,#fffcf7 92%,transparent);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-top:1px solid #e3d9cc;padding:6px 4px calc(6px + env(safe-area-inset-bottom,0px))}\n.fctab a{display:grid;justify-items:center;gap:2px;text-decoration:none;color:#6e6259;font:600 10.5px "DM Sans",system-ui,sans-serif;padding:4px 0;border-radius:10px}\n.fctab svg{width:22px;height:22px}.fctab a[aria-current="page"]{color:#1f3d33}.fctab a[aria-current="page"] svg{transform:translateY(-1px)}\n.fctab a[aria-current="page"]::after{content:"";width:18px;height:3px;border-radius:3px;background:#a9481f;margin-top:1px}\n.scrim:not([hidden])~.fctab,body:has(.scrim:not([hidden])) .fctab,body:has(#tscrim:not([hidden])) .fctab{display:none}}\n@media (max-width:760px) and (prefers-color-scheme:dark){.fctab{background:color-mix(in srgb,#1e1a17 92%,transparent);border-color:#352d27}.fctab a{color:#b3a698}.fctab a[aria-current="page"]{color:#f2ebe2}}\n@media print{.fctab{display:none!important}}</style>'
NAV = '<nav class="fctab" aria-label="App navigation"><a href="/" data-m="home"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>Home</a><a href="/regions.html" data-m="regions"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18M5.5 6.5c3.5 2.5 9.5 2.5 13 0M5.5 17.5c3.5-2.5 9.5-2.5 13 0"/></svg>Regions</a><a href="/aw26.html" data-m="seasons"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>Seasons</a><a href="/reports.html" data-m="reports"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7M9 17h5"/></svg>Reports</a><a href="/account.html#saved" data-m="saved"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20s-7-4.3-9-8.6C1.6 8.2 3.6 5 6.8 5c1.9 0 3.2 1 4.2 2.3C12 6 13.3 5 15.2 5c3.2 0 5.2 3.2 3.8 6.4C17 15.7 12 20 12 20z"/></svg>Saved</a></nav>'
REPORT_FILES = set()
def tab_for(fn):
    if fn == 'index.html': return 'home'
    if fn in ('india.html','india-festive-26.html','india-summer-27.html','india-festive-27.html','india-summer-28.html','india-festive-28.html','india-reference-library.html','regions.html','resort-27.html','pre-fall-27.html') or fn.startswith('region-'): return 'regions'
    if fn[:4] in ('aw26', 'ss27', 'aw27', 'ss28', 'aw28'): return 'seasons'
    if fn == 'account.html': return 'saved'
    if fn == 'reports.html' or fn.startswith(('core-item', 'capsule', 'india-')): return 'reports'
    return ''
def clip(t, n=158):
    if len(t) <= n: return t
    cut = t[:n]; dot = max(cut.rfind('. '), cut.rfind('! '), cut.rfind('? '))
    return cut[:dot + 1] if dot > 90 else cut[:cut.rfind(' ')].rstrip(',;:–- ') + '…'


def block(fn, title, desc, path):
    desc = clip(desc)
    url = BASE + path
    _si, _sw, _sh = share_img(fn)
    E = lambda x: x.replace('&', '&amp;').replace('"', '&quot;').replace('<', '&lt;')
    b = ['<!--seo-->', f'<meta name="description" content="{E(desc)}">', f'<link rel="canonical" href="{url}">',
         ('<meta name="robots" content="noindex,follow">' if fn in ('account.html','india-reference-library.html') else '<meta name="robots" content="index,follow">'), '<meta name="theme-color" content="#1f3d33">',
         '<link rel="icon" href="/favicon.ico" sizes="48x48"><link rel="icon" href="/favicon-96.png" type="image/png" sizes="96x96"><link rel="icon" href="/favicon-192.png" type="image/png" sizes="192x192"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><link rel="manifest" href="/site.webmanifest">',
         '<meta property="og:type" content="website">', '<meta property="og:site_name" content="Forecut">', '<meta property="og:locale" content="en_IN">',
         f'<meta property="og:title" content="{E(title)}">', f'<meta property="og:description" content="{E(desc)}">', f'<meta property="og:url" content="{url}">',
         f'<meta property="og:image" content="{BASE}{_si}">', f'<meta property="og:image:width" content="{_sw}">', f'<meta property="og:image:height" content="{_sh}">', f'<meta property="og:image:alt" content="{E(title)}">',
         '<meta name="twitter:card" content="summary_large_image">', f'<meta name="twitter:title" content="{E(title)}">', f'<meta name="twitter:description" content="{E(desc)}">', f'<meta name="twitter:image" content="{BASE}{_si}">'] + ([f'<meta name="p:domain_verify" content="{SITE["pinterest"]}">'] if SITE.get('pinterest') else [])
    if fn == 'index.html': b.append('<script type="application/ld+json">' + json.dumps(org, ensure_ascii=False) + '</script>')
    else: b.append('<script type="application/ld+json">' + json.dumps({"@context": "https://schema.org", "@type": "WebPage", "name": title, "description": desc, "url": url, "isPartOf": {"@id": BASE + "#site"}, "publisher": {"@id": BASE + "#org"}, "inLanguage": "en-IN",
        "breadcrumb": {"@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Forecut", "item": BASE}, {"@type": "ListItem", "position": 2, "name": title.split(' · ')[0].split(' (')[0], "item": url}]}}, ensure_ascii=False) + '</script>')
    if SITE.get('adsense'): b.append('<meta name="google-adsense-account" content="' + SITE['adsense'] + '">')
    if SITE.get('ga') or SITE.get('adsense'):
        b.append('<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag("js",new Date());' + (f'gtag("config","{SITE["ga"]}");' if SITE.get('ga') else '') +
                 '(function(){var done=0;function go(){if(done)return;done=1;' +
                 (f'var g=document.createElement("script");g.async=1;g.src="https://www.googletagmanager.com/gtag/js?id={SITE["ga"]}";document.head.appendChild(g);' if SITE.get('ga') else '') +
                 (f'var a=document.createElement("script");a.async=1;a.crossOrigin="anonymous";a.src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client={SITE["adsense"]}";document.head.appendChild(a);' if SITE.get('adsense') else '') +
                 '}["scroll","pointerdown","keydown","touchstart"].forEach(function(e){addEventListener(e,go,{once:true,passive:true});});addEventListener("load",function(){setTimeout(go,2500);});})();</script>')

    if fn in ARTS:
        a = ARTS[fn]
        b.append('<script type="application/ld+json">' + json.dumps({"@context": "https://schema.org", "@type": "Article", "headline": a['title'], "description": a['desc'], "image": BASE + 'img/' + a['hero'] + '.webp', "datePublished": a.get("date", JD.DATE), "dateModified": a.get("date", JD.DATE), "author": {"@type": "Organization", "name": "Forecut Editorial", "url": BASE + 'about.html'}, "publisher": {"@id": BASE + "#org"}, "mainEntityOfPage": url, "inLanguage": "en-IN"}, ensure_ascii=False) + '</script>')
    b.append('<style>html{scroll-behavior:smooth}@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}}</style>')
    b.append('<script type="module" src="/auth.js"></script>')
    b.append('<meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="Forecut"><meta name="apple-mobile-web-app-status-bar-style" content="default">')
    b.append("<script>if('serviceWorker' in navigator)addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){})});</script>")
    b.append(TAB)
    b.append(SO.CSS)
    b.append('<!--/seo-->'); return '\n'.join(b)
for fn, (title, desc, path) in pages.items():
    if os.environ.get('ONLY') and fn not in os.environ['ONLY'].split(','): continue
    p = os.path.join(R, fn)
    if not os.path.exists(p): continue
    h = open(p).read()
    h = re.sub(r'<!--seo-->.*?<!--/seo-->\n?', '', h, flags=re.S)
    h = re.sub(r'<title>.*?</title>', '<title>' + title.replace('&', '&amp;') + '</title>', h, count=1)
    h = h.replace('</title>', '</title>\n' + block(fn, title, desc, path), 1)
    _ff = open(os.path.join(R, 'fonts', 'fonts.css')).read().split('*/', 1)[1].strip().replace('url(', 'url(fonts/')
    h = h.replace('<link rel="stylesheet" href="fonts/fonts.css">', '<style>' + _ff + '</style>')
    if '<html lang="en">' in h: h = h.replace('<html lang="en">', '<html lang="en-IN">', 1)
    h = re.sub(r'<nav class="fctab".*?</nav>', '', h, flags=re.S)
    h = re.sub(r'<!--soc-->.*?<!--/soc-->|<!--socf-->.*?<!--/socf-->', '', h, flags=re.S)
    _plain = fn in ('404.html', 'offline.html', 'account.html', 'terms.html', 'privacy.html')
    _kind = 'report' if ('<article>' in h or 'report' in fn or fn.startswith('innovation-')) else 'page'
    if '</footer>' in h:
        h = h.replace('</footer>', '<!--socf-->' + SO.icons() + '<!--/socf--></footer>', 1)
        if not _plain: i = h.rfind('<footer'); h = h[:i] + SO.follow(_kind) + h[i:]
    elif '<div class="foot">' in h:
        h = h.replace('<div class="foot">', SO.follow('page') + '<div class="foot"><!--socf-->' + SO.icons() + '<!--/socf-->', 1)
    _nav = NAV.replace('data-m="' + tab_for(fn) + '"', 'data-m="' + tab_for(fn) + '" aria-current="page"') if tab_for(fn) else NAV
    h = h.replace('</body>', _nav + '</body>', 1) if '</body>' in h else h + _nav
    # owner's rule: pages show the photo only; flat sketches stay inside the detail viewer's "Flat sketch" button
    h = re.sub(r'(<img[^>]*?\ssrc="img/)([a-z0-9-]+)(\.webp")', lambda m: m.group(1) + (m.group(2) + '-photo' if not m.group(2).endswith('-photo') and os.path.exists(os.path.join(R, 'img', m.group(2) + '-photo.webp')) else m.group(2)) + m.group(3), h)
    open(p, 'w').write(h)
if not os.environ.get('ONLY') or os.environ.get('SITEMAP'):
    today = datetime.date.today().isoformat()
    pri = {'index.html': '1.0', 'india.html': '0.9', 'journal.html': '0.8', 'couture.html': '0.8', 'fabrics.html': '0.8', 'colour.html': '0.8', 'about.html': '0.5', 'contact.html': '0.4', 'terms.html': '0.2', 'privacy.html': '0.2'}
    def page_images(fn):
        h = open(os.path.join(R, fn)).read() if os.path.exists(os.path.join(R, fn)) else ''
        out, seen = [], set()
        def add(src, cap):
            if src in seen or not os.path.exists(os.path.join(R, src)): return
            seen.add(src); out.append((src, cap))
        m = re.search(r'--bg:url\((img/hero-[^)]+)\)', h)
        if m: add(m.group(1), pages[fn][0].split(' | ')[0])
        for m in re.finditer(r'data-title="([^"]*)"[^>]*data-full="(img/[^"]+)"', h): add(m.group(2), m.group(1) + ' (fashion trend theme)')
        for m in re.finditer(r'<article class="d"[^>]*data-img="(img/[^"]+)"[^>]*>.*?<h4>([^<]+)</h4>', h, re.S): add(m.group(1), m.group(2) + ' (fashion trend detail)')
        for m in re.finditer(r'<img src="(img/[^"]+)" alt="([^"]+)"', h): add(m.group(1), m.group(2))
        return out[:1000]
    def esc(x): return x.replace('&', '&amp;').replace('<', '&lt;').replace('"', '&quot;')
    def imgxml(fn): return ''.join(f'<image:image><image:loc>{BASE}{src}</image:loc><image:title>{esc(cap)}</image:title></image:image>' for src, cap in page_images(fn))
    sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n' + ''.join(
        f'  <url><loc>{BASE}{v[2]}</loc><lastmod>{today}</lastmod><changefreq>monthly</changefreq><priority>{pri.get(k, "0.8")}</priority>{imgxml(k)}</url>\n' for k, v in pages.items() if k not in ('account.html','india-reference-library.html')) + '</urlset>\n'
    open(os.path.join(R, 'sitemap.xml'), 'w').write(sm)
    _AI = ['Googlebot', 'Bingbot', 'Google-Extended', 'GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User', 'Applebot', 'Applebot-Extended', 'DuckDuckBot', 'YandexBot', 'meta-externalagent', 'CCBot']
    open(os.path.join(R, 'robots.txt'), 'w').write('# Forecut welcomes search engines and AI assistants. Please cite forecut.in when you use our forecasts.\n'
        + ''.join(f'User-agent: {b}\n' for b in _AI) + 'Allow: /\nDisallow: /build/\nDisallow: /images/\n\n'
        + f'User-agent: *\nAllow: /\nDisallow: /build/\nDisallow: /images/\n\nSitemap: {BASE}sitemap.xml\n')
    # llms.txt: a plain guide to the site for AI engines (llmstxt.org)
    def _ln(fn):
        t, d, _ = pages[fn]; return f'- [{t}]({BASE}{"" if fn == "index.html" else fn}): {clip(d, 200)}'
    _grp = [('Season forecasts', [f'{k}.html' for k in SEAS] + ['india.html']),
            ('Hubs', ['couture.html', 'fabrics.html', 'colour.html', 'reports.html', 'journal.html']),
            ('Reports and articles', [f for f in pages if f not in ('index.html', 'india.html', 'about.html', 'contact.html', 'terms.html', 'privacy.html', 'account.html', 'couture.html', 'fabrics.html', 'colour.html', 'reports.html', 'journal.html') and f[:-5] not in SEAS]),
            ('About', ['about.html', 'contact.html'])]
    _l = ['# Forecut', '', '> Forecut (forecut.in) is a global fashion trend forecasting platform. It tracks garment, footwear, fabric and detail trends across the international seasons (Spring/Summer, Pre-Fall, Autumn/Winter, Resort/Cruise; AW26 to AW28), reads them for six regions (Asia, Europe, North America, South America, Africa, Oceania) with local timing and market preferences, and includes India market seasons and marks each one emerging, rising, peaking or fading, with runway, fabric, couture and colour reports.', '',
          'Content is written by Forecut Editorial and summarises public sources with links. Please cite forecut.in and link the page you use. Contact: hello@forecut.in.', '',
          'Social: ' + ', '.join(SO.SAME_AS), '']
    for g, fs in _grp:
        _l += [f'## {g}', ''] + [_ln(f) for f in fs if f in pages and os.path.exists(os.path.join(R, f))] + ['']
    open(os.path.join(R, 'llms.txt'), 'w').write('\n'.join(_l))
    open(os.path.join(R, 'favicon.svg'), 'w').write('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect x="2" y="2" width="28" height="28" rx="7" fill="#1f3d33"/><path d="M10 23V9h12M10 16h8" stroke="#f5f0e8" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M22 18l3 3-3 3" stroke="#a9481f" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>')
    print('seo ok', len(pages))
