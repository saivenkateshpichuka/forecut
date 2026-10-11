"""Add SEO tags to every page in the repo root, and write sitemap.xml and robots.txt. Safe to rerun (replaces its own block)."""
import re, json, datetime, os
R = '..'; BASE = 'https://forecut.in/'
S = json.load(open('seasons.json')); META = S['meta']; SEAS = S['seasons'] if 'seasons' in S else list(META)
pages = {
 'index.html': ('Forecut · Fashion Trend Forecast for India | Garments, Footwear, Fabrics & Details',
   'Forecut is detail-level fashion trend forecasting for India: what\'s emerging, rising, peaking and fading in ethnic and western wear, footwear, fabrics, embroidery and trims, with ₹ price guides. Free while in testing.', ''),
 'india.html': ('India Fashion Trend Forecast 2026–27 · Sarees, Lehengas, Kurtas, Juttis | Forecut',
   'India fashion trends for Festive 2026, Summer 2027 and Festive 2027: sarees, lehengas, kurtas, bandhgalas, juttis, Kolhapuris, handloom fabrics, chikankari, mirror work and trims, with ₹ price guides.', 'india.html'),
}
for k in SEAS:
    m = META[k]
    pages[f'{k}.html'] = (f"{m['code']} Fashion Trend Forecast ({m['title']}) · Garments, Footwear & Details | Forecut",
        f"{m['code']} trend forecast: {m['intro']} Every detail marked emerging, rising, peaking or fading, with themes, colours and downloadable cards."[:300], f'{k}.html')
org = {"@context": "https://schema.org", "@graph": [
  {"@type": "Organization", "@id": BASE + "#org", "name": "Forecut", "url": BASE, "logo": BASE + "favicon.svg", "email": "hello@forecut.in",
   "description": "Detail-level fashion trend forecasting for India.", "areaServed": "IN"},
  {"@type": "WebSite", "@id": BASE + "#site", "name": "Forecut", "url": BASE, "publisher": {"@id": BASE + "#org"}, "inLanguage": "en-IN"}]}
def block(fn, title, desc, path):
    url = BASE + path
    E = lambda x: x.replace('&', '&amp;').replace('"', '&quot;').replace('<', '&lt;')
    b = ['<!--seo-->', f'<meta name="description" content="{E(desc)}">', f'<link rel="canonical" href="{url}">',
         '<meta name="robots" content="index,follow">', '<meta name="theme-color" content="#1f3d33">',
         '<link rel="icon" href="favicon.svg" type="image/svg+xml">',
         '<meta property="og:type" content="website">', '<meta property="og:site_name" content="Forecut">', '<meta property="og:locale" content="en_IN">',
         f'<meta property="og:title" content="{E(title)}">', f'<meta property="og:description" content="{E(desc)}">', f'<meta property="og:url" content="{url}">',
         f'<meta property="og:image" content="{BASE}og-image.png">', '<meta property="og:image:width" content="1200">', '<meta property="og:image:height" content="630">',
         '<meta name="twitter:card" content="summary_large_image">', f'<meta name="twitter:title" content="{E(title)}">', f'<meta name="twitter:description" content="{E(desc)}">', f'<meta name="twitter:image" content="{BASE}og-image.png">']
    if fn == 'index.html': b.append('<script type="application/ld+json">' + json.dumps(org, ensure_ascii=False) + '</script>')
    else: b.append('<script type="application/ld+json">' + json.dumps({"@context": "https://schema.org", "@type": "WebPage", "name": title, "description": desc, "url": url, "isPartOf": {"@id": BASE + "#site"}, "publisher": {"@id": BASE + "#org"}, "inLanguage": "en-IN",
        "breadcrumb": {"@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Forecut", "item": BASE}, {"@type": "ListItem", "position": 2, "name": title.split(' · ')[0].split(' (')[0], "item": url}]}}, ensure_ascii=False) + '</script>')
    b.append('<!--/seo-->'); return '\n'.join(b)
for fn, (title, desc, path) in pages.items():
    p = os.path.join(R, fn)
    if not os.path.exists(p): continue
    h = open(p).read()
    h = re.sub(r'<!--seo-->.*?<!--/seo-->\n?', '', h, flags=re.S)
    h = re.sub(r'<title>.*?</title>', '<title>' + title.replace('&', '&amp;') + '</title>', h, count=1)
    h = h.replace('</title>', '</title>\n' + block(fn, title, desc, path), 1)
    if '<html lang="en">' in h: h = h.replace('<html lang="en">', '<html lang="en-IN">', 1)
    open(p, 'w').write(h)
today = datetime.date.today().isoformat()
pri = {'index.html': '1.0', 'india.html': '0.9'}
sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join(
    f'  <url><loc>{BASE}{v[2]}</loc><lastmod>{today}</lastmod><changefreq>monthly</changefreq><priority>{pri.get(k, "0.8")}</priority></url>\n' for k, v in pages.items()) + '</urlset>\n'
open(os.path.join(R, 'sitemap.xml'), 'w').write(sm)
open(os.path.join(R, 'robots.txt'), 'w').write(f'User-agent: *\nAllow: /\nDisallow: /build/\nDisallow: /images/\n\nSitemap: {BASE}sitemap.xml\n')
open(os.path.join(R, 'favicon.svg'), 'w').write('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect x="2" y="2" width="28" height="28" rx="7" fill="#1f3d33"/><path d="M10 23V9h12M10 16h8" stroke="#f5f0e8" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M22 18l3 3-3 3" stroke="#b4532a" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>')
print('seo ok', len(pages))
