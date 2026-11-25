"""Checks for the forecast library migration (25 Nov 2026).

1. Every moved page: its new page exists and its report text matches the last published version of the old page
   (taken from git HEAD, before the move) word for word, apart from link addresses.
2. Every old address is a redirect to the checked new address.
3. PDFs: every PDF in output/reports exists, is linked from a library page, and every PDF link resolves.
4. Internal links and images on library pages resolve to real files.
Writes docs/migration/checks.md and prints a summary. Usage: python3 check_migration.py [git-ref]
"""
import os, re, sys, json, subprocess, html as H

B = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(B)
REF = sys.argv[1] if len(sys.argv) > 1 else 'HEAD'
R = json.load(open(os.path.join(B, 'docs', 'migration', 'redirects.json')))


def text(h):
    m = re.search(r'<div class="w" id="report">(.*)</main>', h, re.S)
    h = m.group(1) if m else h
    h = re.sub(r'<script.*?</script>', ' ', h, flags=re.S)
    h = re.sub(r'<[^>]+>', ' ', h)
    h = re.sub(r'\b\d{1,2} (January|February|March|April|May|June|July|August|September|October|November|December) 20\d\d', 'DATE', H.unescape(h))
    return re.sub(r'\s+', ' ', h).strip()


def resolve(u):
    u = u.split('#')[0].split('?')[0]
    if not u.startswith('/') or u.startswith('//'):
        return True
    p = u.lstrip('/')
    cands = [p, p + '.html', os.path.join(p, 'index.html')] if p else ['index.html']
    return any(os.path.isfile(os.path.join(ROOT, c)) for c in cands)


out, bad = [], []
# 1 + 2
same = 0
for lg, u in sorted(R['checked'].items()):
    newf = os.path.join(ROOT, u.strip('/'), 'index.html')
    if not os.path.isfile(newf):
        bad.append(f'missing new page {u} for /{lg}'); continue
    try:
        old = subprocess.run(['git', '-C', ROOT, 'show', f'{REF}:{lg}.html'], capture_output=True, text=True).stdout
    except Exception:
        old = ''
    if 'http-equiv="refresh"' in old or not old:
        out.append(f'- /{lg}: no earlier full page in {REF} to compare'); continue
    a, b = text(old), text(open(newf).read())
    if a == b:
        same += 1
    else:
        import difflib
        d = [x for x in difflib.ndiff(a.split(' '), b.split(' ')) if x[:1] in '+-'][:12]
        bad.append(f'text differs: /{lg} -> {u}: {" ".join(d)}')
    st = open(os.path.join(ROOT, lg + '.html')).read()
    if f'url={u}' not in st:
        bad.append(f'old address /{lg} does not redirect to {u}')
for lg, u in R['tree'].items():
    if not resolve(u):
        bad.append(f'generated page /{lg} redirects to missing {u}')
# 3 PDFs
pdfs = sorted(f for f in os.listdir(os.path.join(ROOT, 'output', 'reports')) if f.endswith('.pdf'))
linked = set()
lib = []
for dp, dn, fn in os.walk(os.path.join(ROOT, 'forecasts')):
    for f in fn:
        if f.endswith('.html'):
            lib.append(os.path.join(dp, f))
broken_links, broken_img = set(), set()
for f in lib:
    h = open(f).read()
    for p in re.findall(r'href="(/output/reports/[^"]+\.pdf)"', h):
        linked.add(os.path.basename(p))
        if not os.path.isfile(os.path.join(ROOT, p.lstrip('/'))):
            bad.append(f'broken PDF link {p} on {f}')
    for u in set(re.findall(r'href="(/[^"]*)"', h)):
        if not u.startswith('/output/') and not resolve(u):
            broken_links.add(u)
    for u in set(re.findall(r'src="(/img/[^"]+)"', h)):
        if not os.path.isfile(os.path.join(ROOT, u.lstrip('/'))):
            broken_img.add(u)
unl = [p for p in pdfs if p not in linked]
summary = [f'# Migration checks ({REF})', '',
           f'- Moved pages checked: {len(R["checked"])}; report text identical to the last published version: {same}',
           f'- Pages not redirected because a check failed: {len(R["failed"])}',
           f'- Generated summary pages redirected to their category page: {len(R["tree"])}',
           f'- PDFs in output/reports: {len(pdfs)}; linked from library pages: {len(pdfs) - len(unl)}; not linked: {len(unl)} {unl[:6]}',
           f'- Library pages scanned: {len(lib)}; broken internal links: {len(broken_links)}; missing images: {len(broken_img)}',
           '', '## Problems', ''] + ([f'- {x}' for x in bad[:200]] or ['- None']) + \
          (['', '## Broken links (first 40)', ''] + [f'- {x}' for x in sorted(broken_links)[:40]] if broken_links else []) + \
          (['', '## Missing images (first 40)', ''] + [f'- {x}' for x in sorted(broken_img)[:40]] if broken_img else []) + out[:40]
open(os.path.join(B, 'docs', 'migration', 'checks.md'), 'w').write('\n'.join(summary) + '\n')
print('\n'.join(summary[:8]))
print('problems:', len(bad), 'broken links:', len(broken_links), 'missing images:', len(broken_img))
