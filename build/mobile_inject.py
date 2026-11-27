"""Adds the shared mobile app layer (/m.css, /m.js) to every page. Idempotent. Run last."""
import os, glob
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
n = 0
for dp, dn, fn in os.walk(ROOT):
    dn[:] = [d for d in dn if d not in ('build', '.git', 'node_modules', 'apps', 'img', 'assets')]
    for f in fn:
        if not f.endswith('.html'):
            continue
        p = os.path.join(dp, f)
        h = open(p, encoding='utf-8').read()
        if '/m.css' in h or '</head>' not in h or '<body' not in h:
            continue
        if 'location.replace' in h and '<main' not in h:
            continue
        h = h.replace('</head>', '<link rel="stylesheet" href="/m.css"></head>', 1)
        _i = h.rfind('</body>'); h = h[:_i] + '<script src="/m.js" defer></script>' + h[_i:]
        open(p, 'w', encoding='utf-8').write(h)
        n += 1
print('mobile layer injected into', n, 'pages')
