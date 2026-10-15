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

# Whole-season downloads: every active detail and an image for every detail.
manifest_path=Path('india_pdf_manifest.json')
if manifest_path.exists():
 from pypdf import PdfReader
 manifest=json.loads(manifest_path.read_text())
 assert set(manifest)==set(I.CODES)
 assert h.count('class="season-pdf"')==9
 assert h.count('class="season-cover"')==5
 for i,code in enumerate(I.CODES):
  m=manifest[code];pdf=Path('..')/m['file'];assert pdf.exists()
  reader=PdfReader(pdf);assert len(reader.pages)==m['pages']
  expected=[x for x in I.D if x[5][i]!='-'];assert len(expected)==m['details']
  txt='\n'.join(p.extract_text() or '' for p in reader.pages)
  def ascii_text(s):return s.replace('₹','INR ').replace('→',' > ').replace('·',' | ').replace('–','-').replace('—','-').replace('\u2011','-').replace('’',"'").replace('“','"').replace('”','"')
  assert all(ascii_text(x[2]) in txt for x in expected)
  assert m['images']>=len(expected)+1
  assert pdf.stat().st_size==m['bytes'] and m['bytes']<10*1048576
  assert (Path('..')/m['hero']).exists()
 print('Complete PDF checks passed for all five seasons: active details, images, page counts, sizes and cover assets.')
