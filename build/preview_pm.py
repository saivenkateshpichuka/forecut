"""Development preview of Pattern Maker as one self-contained HTML file (no sign-in, no ads, fonts and styles inlined).
Usage: python3 build/preview_pm.py OUT.html   (run after tools.py has built pattern-maker.html)"""
import base64, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = open(os.path.join(ROOT, 'pattern-maker.html')).read()
css = open(os.path.join(ROOT, 'tools/shell.css')).read()
def font(m):
    f = os.path.join(ROOT, m.group(1))
    return 'url(data:font/woff;base64,' + base64.b64encode(open(f, 'rb').read()).decode() + ')' if os.path.exists(f) else 'url()'
s = src.replace('window.FC_PREVIEW=false', 'window.FC_PREVIEW=true')
s = re.sub(r'<script[^>]*(adsbygoogle|auth\.js|install\.js)[^>]*></script>', '', s)
s = re.sub(r'<link[^>]*(manifest|preload|canonical|icon)[^>]*>', '', s)
s = re.sub(r'<link rel="stylesheet" href="tools/shell\.css[^"]*">', lambda m: '<style>' + css + '</style>', s)
s = re.sub(r'url\((fonts/(?!source-serif-4-italic)[^)]+)\)', font, s)
s = re.sub(r'<meta name="robots"[^>]*>', '', s)
s = s.replace('<head>', '<head><meta name="robots" content="noindex,nofollow">', 1)
s = s.replace('<body', '<body data-preview="dev"', 1)
banner = '<div style="position:fixed;left:8px;bottom:8px;z-index:3000;background:#e08a5e;color:#1b1d20;font:600 11px DM Sans,sans-serif;padding:3px 8px;border-radius:4px;pointer-events:none">Development preview</div>'
s = s.replace('</body>', banner + '</body>', 1)
open(sys.argv[1], 'w').write(s)
print('preview', sys.argv[1], round(len(s) / 1024), 'KB')
