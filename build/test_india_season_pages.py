"""Content completeness and preservation checks for the five dedicated season pages."""
import json,re,hashlib,subprocess,tempfile,shutil
from pathlib import Path
from pypdf import PdfReader
ROOT=Path(__file__).resolve().parent.parent
DATA=json.loads((ROOT/'build/india_season_reports.json').read_text());MANIFEST=json.loads((ROOT/'build/india_season_pdf_manifest.json').read_text())
names=[];hashes=[]
for code,r in DATA['seasons'].items():
 h=(ROOT/r['file']).read_text();assert h.count('class="detail-card"')==20;assert 'href="#"' not in h;assert '/auth.js' in h
 assert h.count('class="lockpanel"')==(code!='Festive 26');assert len(r['stories'])==len(r['innovations'])==len(r['offers'])==3
 assert r['file'] in (ROOT/'india.html').read_text();assert r['file'] in (ROOT/'sitemap.xml').read_text()
 m=MANIFEST[code];reader=PdfReader(ROOT/m['file']);text='\n'.join(p.extract_text() or '' for p in reader.pages)
 assert len(reader.pages)==m['pages'] and sum(len(p.images) for p in reader.pages)==21
 for d in r['details']:
  names.append(d['name']);hashes.append(hashlib.sha256((ROOT/d['image']).read_bytes()).hexdigest())
  assert d['name'].replace('–','-').replace('’',"'") in text
 for s in r['stories']:assert s['brand'] in text
 for key in ['Price architecture','Merchandising offers','Innovation radar','Retail snapshots','Collection development']:assert key.lower() in text.lower()
 for attrs,script in re.findall(r'<script([^>]*)>(.*?)</script>',h,re.S):
  if 'application/ld+json' in attrs:json.loads(script);continue
  if not script.strip():continue
  with tempfile.NamedTemporaryFile(suffix='.js',mode='w') as f:
   f.write(script);f.flush();subprocess.run([shutil.which('node'),'--check',f.name],check=True,capture_output=True)
assert len(set(names))==100 and len(set(hashes))==100
assert (ROOT/'india-reference-library.html').exists()
assert len(json.loads((ROOT/'build/india_detail_image_provenance.json').read_text()))==20
print('Five pages and complete PDFs passed; 100 unique details/images; original reference archive preserved.')
