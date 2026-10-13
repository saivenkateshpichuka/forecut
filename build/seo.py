"""Add SEO tags to every page in the repo root, and write sitemap.xml and robots.txt. Safe to rerun (replaces its own block)."""
import re, json, datetime, os
R = '..'; BASE = 'https://forecut.in/'
S = json.load(open('seasons.json')); META = S['meta']; SEAS = S['seasons'] if 'seasons' in S else list(META)
pages = {
 'index.html': ('Forecut · Fashion Trend Forecast for India | Garments, Footwear, Fabrics & Details',
   'Forecut is detail-level fashion trend forecasting for India: what\'s emerging, rising, peaking and fading in ethnic and western wear, footwear, fabrics, embroidery and trims, with ₹ price guides. Free during early access.', ''),
 'india.html': ('India Fashion Trend Forecast 2026–28 · Sarees, Lehengas, Kurtas, Juttis | Forecut',
   'India fashion trends for Festive 2026, Summer 2027 and Festive 2027: sarees, lehengas, kurtas, bandhgalas, juttis, Kolhapuris, handloom fabrics, chikankari, mirror work and trims, with ₹ price guides.', 'india.html'),
}
for fn, t, d in [('about.html', 'About Forecut · Fashion Trend Forecasting for India', 'Forecut is an independent, detail-level fashion trend forecasting platform built for the Indian market.'),
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
OVR = {
 'index.html': ('Forecut | Fashion Trend Forecasting for India 2026–2028',
   "Forecut is India's detail-level trend forecasting platform, combining expert research with data to show what's emerging, rising, peaking and fading, and when to act."),
 'india.html': ('India Fashion Forecast 2026–28 | Forecut',
   'Season-by-season forecasts for Indian fashion, Festive 26 to Festive 28: sarees, lehengas, kurtas, menswear, footwear, fabrics and crafts, with rupee price guides.'),
 'reports.html': ('Trend Reports | Forecut',
   'Ready-to-use trend reports for Indian fashion: core item updates, design capsules, colour forecasts with Pantone TCX, sourcing guides and brand watch, with PDF downloads.'),
 'journal.html': ('Journal | Forecut',
   'Expert analysis of Indian and global fashion trends: festive and wedding wear, handloom, footwear, Gen Z fusion and colour, with practical next steps for brands.'),
 'about.html': ('About Us | Forecut',
   'Forecut is an independent fashion trend forecasting company for India, combining expert research with AI and data to help brands, designers and manufacturers plan ahead.'),
 'contact.html': ('Contact | Forecut', 'Contact Forecut at hello@forecut.in for questions, partnerships and enterprise enquiries about fashion trend forecasting for India.'),
 'terms.html': ('Terms & Conditions | Forecut', 'Terms and conditions for using the Forecut fashion trend forecasting website and reports.'),
 'privacy.html': ('Privacy Policy | Forecut', 'How Forecut collects, uses and protects information, including analytics and advertising cookies.'),
}
for k in SEAS:
    m = META[k]
    pages[f'{k}.html'] = (f"{m['code']} Fashion Trend Forecast ({m['title']}) · Garments, Footwear & Details | Forecut",
        f"{m['code']} trend forecast: {m['intro']} Every detail marked emerging, rising, peaking or fading, with themes, colours and downloadable cards."[:300], f'{k}.html')
org = {"@context": "https://schema.org", "@graph": [
  {"@type": "Organization", "@id": BASE + "#org", "name": "Forecut", "url": BASE, "logo": BASE + "favicon-192.png", "email": "hello@forecut.in",
   "description": "India's detail-level fashion trend forecasting platform, combining expert research with data.", "slogan": "Know the next detail before it trends.", "foundingDate": "2026", "contactPoint": {"@type": "ContactPoint", "email": "hello@forecut.in", "contactType": "customer support", "areaServed": "IN", "availableLanguage": "en"}, "areaServed": "IN"},
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
    m = re.search(r'<div class="(?:jhero|ci)"><img src="(img/[^"]+)"', html_)
    if m: return m.group(1), 800, 800
    return 'og-image.png', 1200, 630
def block(fn, title, desc, path):
    url = BASE + path
    _si, _sw, _sh = share_img(fn)
    E = lambda x: x.replace('&', '&amp;').replace('"', '&quot;').replace('<', '&lt;')
    b = ['<!--seo-->', f'<meta name="description" content="{E(desc)}">', f'<link rel="canonical" href="{url}">',
         ('<meta name="robots" content="noindex,follow">' if fn == 'account.html' else '<meta name="robots" content="index,follow">'), '<meta name="theme-color" content="#1f3d33">',
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
        b.append('<script type="application/ld+json">' + json.dumps({"@context": "https://schema.org", "@type": "Article", "headline": a['title'], "description": a['desc'], "image": BASE + 'img/' + a['hero'] + '.webp', "datePublished": JD.DATE, "dateModified": JD.DATE, "author": {"@type": "Organization", "name": "Forecut Editorial", "url": BASE + 'about.html'}, "publisher": {"@id": BASE + "#org"}, "mainEntityOfPage": url, "inLanguage": "en-IN"}, ensure_ascii=False) + '</script>')
    b.append('<style>html{scroll-behavior:smooth}@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}}</style>')
    b.append('<script type="module" src="/auth.js"></script>')
    b.append('<meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="Forecut"><meta name="apple-mobile-web-app-status-bar-style" content="default">')
    b.append("<script>if('serviceWorker' in navigator)addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){})});</script>")
    b.append('<!--/seo-->'); return '\n'.join(b)
for fn, (title, desc, path) in pages.items():
    p = os.path.join(R, fn)
    if not os.path.exists(p): continue
    h = open(p).read()
    h = re.sub(r'<!--seo-->.*?<!--/seo-->\n?', '', h, flags=re.S)
    h = re.sub(r'<title>.*?</title>', '<title>' + title.replace('&', '&amp;') + '</title>', h, count=1)
    h = h.replace('</title>', '</title>\n' + block(fn, title, desc, path), 1)
    _ff = open(os.path.join(R, 'fonts', 'fonts.css')).read().split('*/', 1)[1].strip().replace('url(', 'url(fonts/')
    h = h.replace('<link rel="stylesheet" href="fonts/fonts.css">', '<style>' + _ff + '</style>')
    if '<html lang="en">' in h: h = h.replace('<html lang="en">', '<html lang="en-IN">', 1)
    open(p, 'w').write(h)
today = datetime.date.today().isoformat()
pri = {'index.html': '1.0', 'india.html': '0.9', 'journal.html': '0.8', 'about.html': '0.5', 'contact.html': '0.4', 'terms.html': '0.2', 'privacy.html': '0.2'}
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
    f'  <url><loc>{BASE}{v[2]}</loc><lastmod>{today}</lastmod><changefreq>monthly</changefreq><priority>{pri.get(k, "0.8")}</priority>{imgxml(k)}</url>\n' for k, v in pages.items() if k != 'account.html') + '</urlset>\n'
open(os.path.join(R, 'sitemap.xml'), 'w').write(sm)
open(os.path.join(R, 'robots.txt'), 'w').write(f'User-agent: *\nAllow: /\nDisallow: /build/\nDisallow: /images/\n\nSitemap: {BASE}sitemap.xml\n')
open(os.path.join(R, 'favicon.svg'), 'w').write('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect x="2" y="2" width="28" height="28" rx="7" fill="#1f3d33"/><path d="M10 23V9h12M10 16h8" stroke="#f5f0e8" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M22 18l3 3-3 3" stroke="#b4532a" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>')
print('seo ok', len(pages))
