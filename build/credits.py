"""Photo credits for real (free-licensed) images. Edit ../image-credits.csv:
File name,Credit,Source URL,Licence   e.g.  hub-couture-history.jpg,The Metropolitan Museum of Art,https://www.metmuseum.org/...,CC0"""
import csv, html, os
P = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'image-credits.csv')
C = {}
if os.path.exists(P):
    for r in csv.DictReader(open(P, encoding='utf-8')):
        fn = (r.get('File name') or '').strip()
        if fn: C[os.path.splitext(fn)[0].lower()] = ((r.get('Credit') or '').strip(), (r.get('Source URL') or '').strip(), (r.get('Licence') or '').strip())
def cap(slug):
    if slug not in C: return ''
    c, u, l = C[slug]; E = html.escape
    t = f'Photo: {E(c)}' + (f' · {E(l)}' if l else '')
    return f'<p class="pcred">{f"<a href={chr(34)}{E(u)}{chr(34)} rel={chr(34)}noopener{chr(34)} target={chr(34)}_blank{chr(34)}>{t}</a>" if u else t}</p>'
CSS = '.pcred{font:12.5px "DM Sans",sans-serif;color:var(--muted);margin:6px 0 0!important}.pcred a{color:var(--muted)}'
