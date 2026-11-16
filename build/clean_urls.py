"""Clean URLs: forecut.in/region-oceania instead of forecut.in/region-oceania.html.

GitHub Pages serves /name from name.html, so every internal link, canonical, og:url, structured data and the sitemap
is rewritten without .html, and a one-line script tidies the address bar when someone arrives on an old .html link
(old links keep working). /tools is also a folder, so the tools hub is published at /tools/ (tools/index.html).
Run last in the build; it is safe to run more than once."""
import re, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
PAGES = {p.stem for p in ROOT.glob('*.html')}
DIRS = {p.name for p in ROOT.iterdir() if p.is_dir()}


def target(stem):
    if stem == 'index': return '/'
    return stem + '/' if stem in DIRS else stem


NAME = r'([a-z0-9][a-z0-9-]*)'
# a page name in a link or a quoted string: href="x.html#a", 'x.html', https://forecut.in/x.html, /x.html
PAT = re.compile(r'(?P<pre>https://forecut\.in/|(?<=["\'(=\s])/|(?<=["\'(=\s])\./|(?<=["\'(=\s]))' + NAME + r'\.html(?=[#?"\'\s)<,]|$)')


def fix(text):
    def rep(m):
        stem = m.group(2)
        if stem not in PAGES: return m.group(0)
        pre = m.group('pre') or ''
        t = target(stem)
        if pre.startswith('https://'): return 'https://forecut.in' + (t if t.startswith('/') else '/' + t)
        if pre == '/': return t if t.startswith('/') else '/' + t
        return t if t != '/' else './' if pre == './' else '/'
    return PAT.sub(rep, text)


TIDY = ('<script>(function(l){var p=l.pathname;if(/\\.html$/.test(p)){p=p.replace(/(^|\\/)index\\.html$/,"$1").replace(/\\.html$/,"");'
        'if(p==="/tools"){l.replace("/tools/"+l.search+l.hash);return}history.replaceState(null,"",p+l.search+l.hash)}})(location)</script>')


def run():
    n = 0
    for f in sorted(ROOT.glob('*.html')):
        s = f.read_text(); o = s
        s = fix(s)
        a = s.find('<script>(function(l){var p=l.pathname;')
        if a > -1: s = s[:a] + s[s.find('(location)</script>', a) + len('(location)</script>'):]
        m = re.search(r'<head[^>]*>', s)
        if m: s = s[:m.end()] + TIDY + s[m.end():]
        if s != o: f.write_text(s); n += 1
    # scripts that build links or navigate
    for f in [ROOT / 'auth.js', ROOT / 'account-dash.js', *sorted((ROOT / 'tools').glob('*.js'))]:
        if not f.exists(): continue
        s = f.read_text(); o = fix(s)
        if o != s: f.write_text(o); n += 1
    sm = ROOT / 'sitemap.xml'
    if sm.exists():
        s = sm.read_text(); o = re.sub(r'(<loc>https://forecut\.in/)' + NAME + r'\.html(</loc>)', lambda m: m.group(1) + (target(m.group(2)) if m.group(2) != 'index' else '').lstrip('/') + m.group(3), s)
        if o != s: sm.write_text(o)
    # the tools hub also lives at /tools/ because /tools is a folder
    hub = ROOT / 'tools.html'
    if hub.exists():
        s = hub.read_text()
        s = re.sub(r'href="#', 'href="/tools/#', s)
        s = re.sub(r'(<head[^>]*>)', r'\1<base href="/">', s, count=1)
        s = s.replace('<link rel="canonical" href="https://forecut.in/tools/">', '<link rel="canonical" href="https://forecut.in/tools/">')
        (ROOT / 'tools' / 'index.html').write_text(s)
    print('clean urls:', n, 'files')


if __name__ == '__main__':
    run()
