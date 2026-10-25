"""Guard: details may be added but never deleted. Compares detail names (global + India + journal + brands)
against the last commit (git HEAD). Fails the build if anything that existed before is missing."""
import json, subprocess, sys, re, ast
def at_head(path):
    try: return subprocess.run(['git', 'show', 'HEAD:build/' + path], capture_output=True, text=True, check=True).stdout
    except Exception: return None
def global_names(txt): return {it['name'] for v in json.loads(txt)['model'].values() for it in v}
def py_names(txt, pat): return set(re.findall(pat, txt))
missing = []
old = at_head('details.json')
if old: missing += sorted(global_names(old) - global_names(open('details.json').read()))
old = at_head('india_data.py')
pat = r"\(\s*['\"][^'\"]+['\"],\s*['\"][^'\"]+['\"],\s*['\"]([^'\"]+)['\"],"
if old: missing += sorted(py_names(old, pat) - py_names(open('india_data.py').read(), pat))
old = at_head('journal_data.py')
if old: missing += ['journal:' + s for s in sorted(py_names(old, r"'slug': '([^']+)'") - py_names(open('journal_data.py').read(), r"'slug': '([^']+)'"))]
old = at_head('hubs_data.py')
if old: missing += ['hub article:' + s for s in sorted(py_names(old, r"'slug': '([^']+)'") - py_names(open('hubs_data.py').read(), r"'slug': '([^']+)'"))]
old = at_head('celebrity_data.py')
if old: missing += ['celebrity event:' + s for s in sorted(py_names(old, r"'id': '([^']+)'") - py_names(open('celebrity_data.py').read(), r"'id': '([^']+)'"))]
old = at_head('images.json')
if old: missing += ['image:' + s for s in sorted(set(json.loads(old)) - set(json.load(open('images.json'))))]
if missing:
    print('KEEP CHECK FAILED: these existed before and were removed. Forecut never deletes details, articles or photos; restore them:')
    for m in missing[:50]: print('  -', m)
    sys.exit(1)
print('keep check OK')
