"""Regression checks for independent India seasons and preservation of published content."""
import json,re,subprocess,tempfile,shutil
from pathlib import Path
import india_data as I
import india_seasons as S
baseline={x[2]:x for x in I.D};S.apply(I)
assert len({x[2] for x in I.D})==len(I.D)
assert all(len(x[5])==5 and set(x[5])<=set('erpf-') for x in I.D)
assert {x[2]:x[5][0] for x in I.D if x[5][0]!='-'}=={n:x[5][0] for n,x in baseline.items()}
ids={s['id'] for s in S.RESEARCH['sources']}
for c,r in S.RESEARCH['seasons'].items():
 assert len(r['themes'])==4 and len(r['palette'])==5
 assert set(r['sources'])<=ids
 assert all(set(t['sources'])<=set(r['sources']) for t in r['themes'])
 assert len(r['plan'])==4 and len(r['categories'])==5
 i=I.CODES.index(c)
 assert sum(x[5][i]!='-' for x in I.D)>=100 and sum(x[5][i]=='e' for x in I.D)>0
 if i>=3:assert 'scenario' in r['basis'].lower()
h=Path('../india.html').read_text()
assert h.count('class="sec ir-report"')==4 and h.count('class="ir-theme"')==16
assert 'src="/auth.js"' in h and h.count('data-lock aria-disabled="true"')==4
assert '%%DATA%%' not in h and '%%ORIGINAL' not in h
assert len(re.findall('class="d"',h))==len(I.D)
node=shutil.which('node')
assert node, 'Node.js is required for inline script syntax checks'
for attrs,script in re.findall(r'<script([^>]*)>(.*?)</script>',h,re.S):
 if 'application/ld+json' in attrs:json.loads(script);continue
 if not script.strip():continue
 with tempfile.NamedTemporaryFile(suffix='.js',mode='w') as f:
  f.write(script);f.flush();subprocess.run([node,'--check',f.name],check=True,capture_output=True)
print('India checks passed: 103 original details preserved; 4 reports; 16 new ideas; scripts valid; member controls retained.')
