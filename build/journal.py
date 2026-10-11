"""Write ../journal.html and one page per article from journal_data.py, in the shared Forecut page style (from legal.py)."""
import html, json
import journal_data as J
src = open('legal.py').read()
ns = {}; exec(src.split('\nP = ')[0], ns)
HEAD, FOOT = ns['HEAD'], ns['FOOT']
E = html.escape
CSS = '''<style>
.wrap.j{max-width:860px}
.jhero{margin:18px 0 8px;border-radius:10px;overflow:hidden;background:var(--grid);aspect-ratio:16/10}
.jhero img,.jfig img{width:100%;height:100%;object-fit:cover;display:block}
.jfig{margin:26px 0;}
.jfig .ph{border-radius:8px;overflow:hidden;background:var(--grid);aspect-ratio:4/3;max-width:560px}
.jfig figcaption{font-size:14px;color:var(--muted);margin-top:8px}
.jtag{display:inline-block;font:700 11.5px Inter,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#fff;background:var(--chalk);padding:4px 10px;border-radius:99px}
.jmeta{font-size:14px;color:var(--muted);margin:6px 0 0}
article p,article li{font-size:17.5px;line-height:1.75}
article h2{font:600 26px/1.25 Fraunces,Georgia,serif;margin:40px 0 10px;letter-spacing:-.01em}
.ptab{width:100%;border-collapse:collapse;font-size:15px;margin:10px 0 6px;background:var(--paper-2);border:1px solid var(--grid);border-radius:10px;overflow:hidden}
.ptab th,.ptab td{padding:10px 12px;text-align:left;border-bottom:1px solid var(--grid)}
.ptab th{font:600 12px Inter,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.ptab tr:last-child td{border-bottom:0}
.tw{overflow-x:auto}
.cta{background:var(--mat);color:var(--mat-ink);border-radius:12px;padding:20px 22px;margin:34px 0 10px;font-size:17px}
.cta a{color:var(--mat-ink);font-weight:700}
.more h3{font:600 22px Fraunces,Georgia,serif;margin:48px 0 14px}
.jgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:22px 18px;margin-top:22px}
.jcard{text-decoration:none;color:inherit;display:grid;gap:8px}
.jcard .ph{aspect-ratio:4/3;border-radius:8px;overflow:hidden;background:var(--grid)}
.jcard img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s ease}
.jcard:hover img{transform:scale(1.04)}
.jcard b{font:600 20px/1.25 Fraunces,Georgia,serif}
.jcard span.d{font-size:15px;color:var(--muted);line-height:1.5}
.jcard small{font:600 11.5px Inter,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--chalk)}
.byline{font-size:14px;color:var(--muted);border-top:1px solid var(--grid);margin-top:36px;padding-top:14px}
</style>'''
def head(title):
    h = HEAD.format(title=E(title)).replace('</style></head>', '</style>' + CSS + '</head>', 1)
    return h.replace('<div class="wrap">', '<div class="wrap j">', 1)
def img(sl, alt, cls):
    return f'<div class="{cls}"><img src="img/{sl}.webp" alt="{E(alt)}" loading="lazy" width="800" height="800"></div>'
def block(b):
    k = b[0]
    if k == 'p': return f'<p>{b[1]}</p>'
    if k == 'h2': return f'<h2>{E(b[1])}</h2>'
    if k == 'ul': return '<ul>' + ''.join(f'<li>{x}</li>' for x in b[1]) + '</ul>'
    if k == 'fig': return f'<figure class="jfig">{img(b[1], b[2], "ph")}<figcaption>{E(b[2])}</figcaption></figure>'
    if k == 'prices': return ('<div class="tw"><table class="ptab"><thead><tr><th scope="col">Item</th><th scope="col">Value ₹</th><th scope="col">Mid ₹</th><th scope="col">Premium ₹</th></tr></thead><tbody>'
                             + ''.join(f'<tr><td>{E(a)}</td><td>{E(v)}</td><td>{E(m)}</td><td>{E(p)}</td></tr>' for a, v, m, p in b[1]) + '</tbody></table></div><p class="meta">Indicative retail prices in India; actual prices vary by brand, fabric and work.</p>')
    if k == 'cta': return f'<div class="cta">{b[1]}</div>'
    raise ValueError(k)
def card(a):
    return f'<a class="jcard" href="{a["slug"]}.html">{img(a["hero"], a["title"], "ph")}<small>{E(a["tag"])} · {a["read"]} min read</small><b>{E(a["title"])}</b><span class="d">{E(a["desc"])}</span></a>'
for a in J.ARTICLES:
    others = [x for x in J.ARTICLES if x is not a][:3]
    body = (f'<p class="eb"><a href="journal.html" style="color:inherit;text-decoration:none">Journal</a></p><article>'
            f'<span class="jtag">{E(a["tag"])}</span><h1 style="margin-top:12px">{E(a["title"])}</h1>'
            f'<p class="lead">{E(a["desc"])}</p><p class="jmeta">By Forecut Editorial · {J.DATE_TXT} · {a["read"]} min read</p>'
            f'<div class="jhero"><img src="img/{a["hero"]}.webp" alt="{E(a["title"])}" width="800" height="800"></div>'
            + ''.join(block(b) for b in a['body']) +
            '<p class="byline">Written by the Forecut editorial team. Sources include public coverage of Lakmé Fashion Week x FDCI 2026 (Harper\'s Bazaar India, Free Press Journal), Aza Fashions and Lashkaraa trend guides, Pearl Academy Gen Z reports, Global Indian and Outlook Business. Statuses are Forecut\'s forecast and will be refined as new data arrives.</p></article>'
            f'<section class="more"><h3>More from the Journal</h3><div class="jgrid">{"".join(card(x) for x in others)}</div></section>')
    open(f'../{a["slug"]}.html', 'w').write(head(a['title'] + ' · Forecut Journal') + body + FOOT)
idx = ('<p class="eb">Journal</p><h1>The Forecut Journal</h1><p class="lead">Analysis and practical guides on Indian and global fashion trends: what is emerging, rising, peaking and fading, why it matters, and what to do about it.</p>'
       f'<div class="jgrid">{"".join(card(x) for x in J.ARTICLES)}</div>')
open('../journal.html', 'w').write(head('Forecut Journal · Indian fashion trend analysis and guides') + idx + FOOT)
nf = ('<p class="eb">Page not found</p><h1>This page has moved on.</h1><p class="lead">Like a fading trend, the page you were looking for is no longer here. Try one of these instead:</p>'
      '<ul><li><a href="/">Forecut home</a></li><li><a href="/india.html">India Forecast 2026–27</a></li><li><a href="/aw26.html">AW26 global season</a></li><li><a href="/journal.html">The Journal</a></li></ul>')
open('../404.html', 'w').write(head('Page not found · Forecut').replace('<meta name="viewport"', '<meta name="robots" content="noindex"><meta name="viewport"', 1).replace('href="india.html"', 'href="/india.html"').replace('href="aw26.html"', 'href="/aw26.html"').replace('href="journal.html"', 'href="/journal.html"') + nf + FOOT.replace('href="', 'href="/').replace('href="/mailto', 'href="mailto').replace('href="//', 'href="/'))
print('journal ok', len(J.ARTICLES))
