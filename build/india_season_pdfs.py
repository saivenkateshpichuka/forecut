"""Complete illustrated PDFs for the independent India season edits. Preserve reference PDFs."""
import json,html
from pathlib import Path
from reportlab.pdfgen import canvas
from pypdf import PdfReader
from india_pdfs import Report,ROOT,OUT,W,H,INK,MUTED,esc
from india_season_pages import DATA,SEASONS,SOURCES,sources_for
class SeasonReport(Report):
 def __init__(self,code):
  self.code=code;self.file=OUT/('Forecut-India-'+code.replace(' ','-')+'-Season-Report-v2.pdf');self.c=canvas.Canvas(str(self.file),pagesize=(W,H),pageCompression=1);self.c.setTitle('Forecut India '+code+' | Season Report');self.c.setAuthor('Forecut Editorial');self.n=0;self.y=0;self.bounds=[]
 def unit(self,title,text):self.sub(title);self.text(text,10.2,after=13)
 def ref(self,id):
  s=SOURCES[id];self.text('<link href="'+html.escape(s['url'],quote=True)+'">'+esc(s['title'])+'</link>',8.5,'FCItalic',MUTED,raw=True)
 def compose(self,r):
  self.new('Independent season report','cover');self.text('India / '+self.code,37,'FCBold',after=12);self.heading(r['title']);self.picture(ROOT/r['hero'],509,315);self.text('Original AI-generated Forecut concept. Not a designer runway photograph.',7.5,'FCItalic',MUTED);self.text(r['focus'],12);self.text(r['basis'],9,'FCBold');self.text('20 selected development details / 4 new concepts / Prices, offers, designer stories and innovations',10,'FCBold');self.text('Complete curated edition. Earlier extended reference editions remain available at forecut.in.',9)
  self.new('Report guide','guide');self.heading('Plan, develop, validate.');self.unit('Window',r['window']);self.unit('How to use', 'Read direction and palette, choose details suited to your customer, cost the range, then sample and validate. A forecast is a planning input, not a guarantee of demand.');self.unit('Inside this report','Four collection directions; 20 illustrated details with materials, construction and commercial notes; price architecture; retailer snapshots; three offer concepts; three documented collection stories; three innovation opportunities; development calendar and research sources.');self.unit('Image and evidence key','New concept images are AI-generated original Forecut proposals. Existing reference images illustrate design vocabulary and are not evidence of future runway adoption. Documented observations and supplier claims are identified separately from Forecut recommendations.');self.unit('Prices and offers',r['price_note']+' '+r['offer_note']);self.unit('Lifecycle labels','Rising and Peaking are qualitative editorial development assessments, not measured market shares. Watch is a conditional prototype direction. 2028 remains a scenario.');self.unit('Review date','15 October 2026. Prices, availability and supplier readiness may change; verify before purchase or production.')
  self.new('Colour direction','palette');self.heading('A working colour story.');self.text('Original Forecut palette. Approve physical lab dips; digital colours are not textile standards.',11)
  from reportlab.lib import colors
  for h,n in r['palette']:
   self.c.setFillColor(colors.HexColor(h));self.c.roundRect(43,self.y-51,509,46,4,fill=1,stroke=0);self.y-=64;self.text(n+' / '+h.upper(),11,'FCBold',after=18)
  for i,t in enumerate(r['themes'],1):
   self.new('Direction '+str(i),'direction-'+str(i));self.heading(t['title']);self.text(t['story'],12);self.unit('Product opportunity',t['products']);self.unit('Development action',t['make']);self.unit('Commercial role',t['commercial'])
   for k in t['sources']:self.ref(k)
  self.new('Detail studio','details');self.heading('20 selected details.');self.text('A season-specific edit with unique imagery. Each detail has a development brief, construction validation, material direction and indicative price architecture.',11)
  for d in r['details']:self.text(d['name']+' / '+d['category'],9.2,after=7)
  for i,d in enumerate(r['details'],1):
   self.new('Detail '+str(i)+' / '+d['category'],'detail-'+d['id']);self.text(d['name'],23,'FCBold',after=10);self.text(d['status']+' / '+d['image_kind'],8.5,'FCBold');self.picture(ROOT/d['image'],509,255);self.text(d['brief'],10.2,after=11);self.unit('Season development',d['season_action']);self.unit('Construction & validation',d['construction']);self.unit('Materials',d['material']);self.unit('Commercial role',d['commercial']);self.text('Indicative price: Value '+d['price'][0]+' / Mid '+d['price'][1]+' / Premium '+d['price'][2],8.3,'FCBold');
   if d['sources']:self.ref(d['sources'][0])
  self.new('Price architecture','prices');self.heading('Build a viable range.');self.text(r['price_note'],10.5)
  for p in r['price_rows']:self.unit(p['category'],'Value: '+p['value']+' | Mid: '+p['mid']+' | Premium: '+p['premium'])
  self.new('Retail snapshots','retail');self.heading('A current price reference.');self.text('Inspected 15 October 2026. These are current listing snapshots, not promised future season prices or offers.',10.5)
  for b in r['benchmarks']:self.unit(b['brand'],b['product']);self.unit('Listed price',b['price']);self.unit('Listed offer / terms',b['offer']);self.ref(b['source'])
  self.text('Verify stock, size, price and all conditions directly at the retailer before using the benchmark.',9,'FCItalic',MUTED)
  self.new('Merchandising offers','offers');self.heading('Reasons to buy.');self.text(r['offer_note'],11)
  for o in r['offers']:self.unit(o['title'],o['action'])
  for i,s in enumerate(r['stories'],1):
   self.new('Designer collection story '+str(i),'story-'+str(i));self.heading(s['brand']);self.text(s['collection'],15,'FCBold');self.unit('Documented observation',s['observed']);self.unit('Collection story',s['story']);self.unit('Forecut translation',s['translate']);self.text('This translation is a Forecut proposal, not a designer announcement for this forecast season.',9,'FCItalic',MUTED);self.ref(s['source'])
  for i,s in enumerate(r['innovations'],1):
   self.new('Innovation radar '+str(i),'innovation-'+str(i));self.heading(s['title']);self.text(s['maturity'],11,'FCBold');self.unit('Documented signal',s['signal']);self.unit('Collection application',s['use']);self.unit('Validation gate',s['test']);self.ref(s['source'])
  self.new('Collection development','calendar');self.heading('From concept to delivery.')
  for t,a in r['plan']:self.unit(t,a)
  self.sub('What would change this forecast?')
  for w in r['watch']:self.bullet(w,9.5)
  self.new('Research & methodology','sources');self.heading('Evidence with context.');self.text('Sources support the observations stated in the report. Product directions, price bands and merchandising concepts are original Forecut editorial proposals. Retailer snapshots are dated. Supplier claims require independent sampling and documentation. Nothing here guarantees future adoption or sales.',10.5);self.unit('Image provenance','Season cover and four detail concepts: original AI-generated Forecut concepts, October 2026. Sixteen reference images selected for this season only in this curated edition. Illustrations do not establish an exact construction specification.');self.unit('Earlier reference edition','The original extended detail catalogue and its PDF remain available separately. This PDF contains the full curated season page, including all 20 selected details and commercial research sections.');self.text('Source register follows. Links are clickable.',10,'FCBold')
  for k in sources_for(r):
   s=SOURCES[k]
   if self.y<200:self.new('Source register / continued')
   self.sub(s['title']);self.text(s['date'],8.5);self.text(s['note'],9);self.ref(k)
  self.close()
def main():
 manifest={}
 for code,r in SEASONS.items():
  p=SeasonReport(code);p.compose(r);reader=PdfReader(p.file);manifest[code]=dict(file=str(p.file.relative_to(ROOT)),pages=len(reader.pages),details=20,images=sum(len(x.images) for x in reader.pages),bytes=p.file.stat().st_size);print(code,manifest[code])
 (ROOT/'build/india_season_pdf_manifest.json').write_text(json.dumps(manifest,indent=2))
if __name__=='__main__':main()
