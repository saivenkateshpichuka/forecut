"""Swap every page's header and footer for the shared Forecut ones (idempotent). Run after the page builders."""
import glob, os, re, shutil
import chrome as CH

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
shutil.copy(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'chrome.css'), os.path.join(ROOT, 'chrome.css'))
shutil.copy(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'chrome.js'), os.path.join(ROOT, 'chrome.js'))
HEAD, FOOT = CH.header(), CH.footer()
SKIP = ('/build/', '/.git/', '/apps/', '/img/', '/assets/', '/admin', '/node_modules/')
n = {'h': 0, 'f': 0, 'files': 0}


def fix(h):
    if '<!--fch-->' not in h and '<!--forecut-new-->' not in h and 'class="fx-head"' in h and 'class="fs-head"' not in h and '<header class="nav">' not in h:
        return h   # tool pages keep their own toolbar
    o = h
    # header (old family variants)
    if '<!--fch-->' in h:
        h = re.sub(r'<!--fch-->.*?<!--/fch-->', lambda m: HEAD, h, count=1, flags=re.S)
    elif '<!--sitehead-->' in h:
        h = re.sub(r'<!--sitehead-->.*?<!--/sitehead-->', lambda m: HEAD, h, count=1, flags=re.S)
    elif '<header class="nav">' in h:
        h = re.sub(r'<header class="nav">.*?</header>(<div class="mmenu" id="mmenu">.*?</div>)?', lambda m: HEAD, h, count=1, flags=re.S)
    elif re.search(r'<header class="fs-head"', h):
        h = re.sub(r'(<div class="fs-strip">.*?</div></div>)?<header class="fs-head".*?</header>', lambda m: HEAD, h, count=1, flags=re.S)
    else:
        return o
    # footer
    if '<!--fcf-->' in h:
        h = re.sub(r'<!--fcf-->.*?<!--/fcf-->', lambda m: FOOT, h, count=1, flags=re.S)
    else:
        ms = [m for m in re.finditer(r'<footer(?:\s+class="(?:ft|footer)")?>?.*?</footer>', h, re.S) if 'fx-foot' not in m.group(0)[:40]]
        ms = [m for m in re.finditer(r'<footer(\s[^>]*)?>.*?</footer>', h, re.S) if 'fx-foot' not in (m.group(1) or '')]
        if ms:
            m = ms[-1]
            h = h[:m.start()] + FOOT + h[m.end():]
    if '/chrome.css' not in h:
        h = h.replace('</head>', '<link rel="stylesheet" href="/chrome.css"></head>', 1)
    if '/chrome.js' not in h:
        h = h.replace('</body>', '<script src="/chrome.js" defer></script></body>', 1)
    return h


for f in glob.glob(ROOT + '/**/*.html', recursive=True):
    if any(s in f.replace(ROOT, '') + '/' for s in SKIP) or 'node_modules' in f:
        continue
    h = open(f, encoding='utf-8', errors='ignore').read()
    if len(h) < 3000 and '<!--fch-->' not in h or ('<header' not in h and '<!--fch-->' not in h):
        continue
    new = fix(h)
    if new != h:
        open(f, 'w', encoding='utf-8').write(new)
        n['files'] += 1
print('chrome: updated', n['files'], 'pages')
