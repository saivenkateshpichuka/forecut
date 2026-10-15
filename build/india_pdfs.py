"""Build complete illustrated, selectable-text PDF reports for all five India seasons.
Run after gen_india.py. Existing web descriptions and dated research are the source.
"""
import json,re,html,io,math,shutil,os
from pathlib import Path
from collections import Counter
from PIL import Image as PILImage
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader
from pypdf import PdfReader
import india_data as I
import india_seasons as S
ORIGINAL=S.apply(I)
ROOT=Path(__file__).resolve().parent.parent
OUT=ROOT/'output/pdf';OUT.mkdir(parents=True,exist_ok=True)
FONTROOT=Path(os.environ.get('FORECUT_PDF_FONTS',str(Path.home()/'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pdfjs-dist/standard_fonts')))
# Standard licensed fonts, bundled with the local PDF runtime.
if not FONTROOT.exists(): FONTROOT=Path(__import__('os').environ.get('FORECUT_PDF_FONTS','fonts'))
for name,file in [('FC','LiberationSans-Regular.ttf'),('FCBold','LiberationSans-Bold.ttf'),('FCItalic','LiberationSans-Italic.ttf')]:
 pdfmetrics.registerFont(TTFont(name,str(FONTROOT/file)))
H=841.89;W=595.28;M=43;CW=W-2*M
INK='#1F3D33';CREAM='#F5F0E8';RUST='#B4532A';MUTED='#6E6259';LINE='#DDD4C7'
STATUS={'e':'Emerging','r':'Rising','p':'Peaking','f':'Fading','-':'Not tracked'}
SCOL={'e':'#B4532A','r':'#2D7853','p':'#A06E27','f':'#877184','-':'#8A877E'}
MODEL=json.loads((ROOT/'build/india.json').read_text())
page=(ROOT/('india-reference-library.html' if (ROOT/'india-reference-library.html').exists() else 'india.html')).read_text()
def extract(prefix):return json.JSONDecoder().raw_decode(page.split(prefix,1)[1].lstrip())[0]
BASE_DESCS=extract('var DESC = ');FUTURE=extract('var DATA=')
SRC={s['id']:s for s in S.RESEARCH['sources']}
def slug(s):return re.sub(r'[^a-z0-9]+','-',s.lower()).strip('-')
def clean(s):
 return str(s).replace('₹','INR ').replace('→',' > ').replace('·',' | ').replace('–','-').replace('—','-').replace('\u2011','-').replace('’',"'").replace('“','"').replace('”','"')
def esc(s):return html.escape(clean(s))
CACHE={}
def image(path):
 path=Path(path)
 if path not in CACHE:
  im=PILImage.open(path).convert('RGB');im.thumbnail((1500,1100) if 'india-season-art' in str(path) else (520,720));b=io.BytesIO();im.save(b,format='JPEG',quality=88 if 'india-season-art' in str(path) else 72,optimize=True);CACHE[path]=ImageReader(b)
 return CACHE[path]
class Report:
 def __init__(self,code):
  self.code=code;self.si=I.CODES.index(code);self.file=OUT/('Forecut-India-'+code.replace(' ','-')+'-Complete-Report.pdf');self.c=canvas.Canvas(str(self.file),pagesize=(W,H),pageCompression=1);self.c.setTitle('Forecut India '+code+' - Complete Illustrated Forecast');self.c.setAuthor('Forecut Editorial');self.n=0;self.y=0;self.bounds=[]
 def new(self,label,bookmark=None):
  if self.n:self.c.showPage()
  self.n+=1;c=self.c;c.setFillColor(colors.HexColor(CREAM));c.rect(0,0,W,H,fill=1,stroke=0)
  c.setFillColor(colors.HexColor(INK));c.setFont('FCBold',11);c.drawString(M,H-31,'FORECUT');c.setFont('FC',8);c.drawRightString(W-M,H-31,self.code.upper()+' / INDIA FORECAST')
  c.setStrokeColor(colors.HexColor(LINE));c.line(M,H-43,W-M,H-43);c.line(M,40,W-M,40)
  c.setFont('FC',7);c.setFillColor(colors.HexColor(MUTED));c.drawString(M,26,'forecut.in | Original editorial forecast | 15 October 2026');c.drawRightString(W-M,26,str(self.n));self.y=H-65
  self.text(label.upper(),8.2,'FCBold',RUST,after=12)
  if bookmark:c.bookmarkPage(bookmark);c.addOutlineEntry(label,bookmark,level=0,closed=False)
 def text(self,text,size=10.5,font='FC',colour=INK,after=9,width=None,x=None,raw=False):
  style=ParagraphStyle('p',fontName=font,fontSize=size,leading=size*1.38,textColor=colors.HexColor(colour),spaceAfter=0)
  p=Paragraph(text if raw else esc(text),style);w,h=p.wrap(width or CW,1000)
  if self.y-h<51:raise ValueError(f'Content overflow: {self.code} p{self.n} {text[:80]} y={self.y} h={h}')
  p.drawOn(self.c,M if x is None else x,self.y-h);self.y-=h+after;self.bounds.append((self.n,self.y));return h
 def picture(self,path,w,h,x=None):
  self.c.drawImage(image(path),M if x is None else x,self.y-h,width=w,height=h,mask='auto',preserveAspectRatio=True,anchor='c');self.y-=h+8
 def heading(self,t):self.text(t,27,'FCBold',after=17)
 def sub(self,t):self.text(t.upper(),8.5,'FCBold',RUST,after=5)
 def bullet(self,t,size=10):self.text('- '+t,size,after=7)
 def cover(self,r,items):
  self.new('Complete illustrated report','cover');self.text('India',16,'FC',after=3);self.text(self.code,44,'FCBold',after=10);self.text(r['title'],23,'FCBold',after=13)
  self.picture(ROOT/'img/india-season-art'/(slug(self.code)+'.webp'),CW,325)
  self.text('AI-generated original forecast concept. Not a documented runway photograph.',7.5,'FCItalic',MUTED,after=15)
  self.text(r['focus'],12,after=12);self.text(r['basis'],9,'FCBold',after=10)
  self.text(f'{len(items)} active details | {len(I.CATS)} categories | Full research, palette and development guidance',10,'FCBold',after=8)
  self.text('Prepared for Indian fashion brands, design teams and collection planners.',9,'FC',MUTED)
 def palette(self,r):
  self.new('Season at a glance','overview');self.heading(r['title']);self.text(r['focus'],12);self.text(r['basis'],9,'FCBold',after=15)
  self.sub('Merchandising window');self.text(I.WINDOWS[self.code],11);self.text(I.SEASON_INFO[self.code]['occasions'],10)
  self.sub('Original working palette');n=len(r['palette']);sw=(CW-10*(n-1))/n;yy=self.y-75
  for i,(h,name) in enumerate(r['palette']):
   x=M+i*(sw+10);self.c.setFillColor(colors.HexColor(h));self.c.roundRect(x,yy,sw,70,4,fill=1,stroke=0)
   st=ParagraphStyle('sw',fontName='FC',fontSize=8,leading=11,textColor=colors.HexColor(INK));p=Paragraph(esc(name)+'<br/>'+h.upper(),st);_,ph=p.wrap(sw,80);p.drawOn(self.c,x,yy-7-ph)
  self.y=yy-62;self.text('Digital working colours for sampling, not official textile or colour-authority standards. Approve physical lab dips.',8,'FCItalic',MUTED,after=18)
  cnt=Counter(x[5][self.si] for x in I.D if x[5][self.si]!='-');tot=sum(cnt.values());self.sub('Development priority mix');x=M;barY=self.y-20
  for k in 'erpf':
   w=CW*cnt[k]/tot;self.c.setFillColor(colors.HexColor(SCOL[k]));self.c.rect(x,barY,w,13,stroke=0,fill=1);x+=w
  self.y=barY-14;self.text(' | '.join(f'{STATUS[k]}: {cnt[k]}' for k in 'erpf'),9,'FCBold')
  self.text('Qualitative Forecut development assessments, not measured market shares. Emerging: test; Rising: develop; Peaking: core; Fading: reduce newness. Long-range labels are conditional scenarios.',9)
  if self.si==0:
   self.new('Key colour stories');self.heading('Festive colour direction')
   for colour in I.META['keycolours']:
    self.sub(colour['name']);self.text(colour['text'],9,after=7)
  self.sub('How to use this report');self.bullet('Start with themes and category actions, then review each detail with its image, design notes, material guidance and lifecycle.');self.bullet('Use the development calendar to plan sampling; validate costs, quality and customer response before volume orders.');self.bullet('Images are design references and generated concepts. They do not establish provenance, exact garment specifications or future runway evidence.')
 def theme(self,t,index):
  self.new('Theme '+str(index)+' / '+t['title']);self.heading(t['title']);self.text(t['story'],12,after=17)
  for label,key in [('Build the range','products'),('Development notes','make'),('Commercial action','commercial')]:self.sub(label);self.text(t[key],11,after=15)
  self.sub('Research inputs')
  for k in t.get('sources',[]):
   s=SRC[k];self.text('<link href="'+html.escape(s['url'],quote=True)+'" color="'+INK+'">'+esc(s['title'])+'</link> | '+esc(s['date']),8.8,raw=True)
  if t.get('legacy'):
   for k,v in t['legacy']:
    self.sub(k);self.text(v,9.5,after=10)
 def detail(self,x):
  cat,sub,name,area,note,life,sk=x;d=(FUTURE[str(self.si)]['descs'] if self.si else BASE_DESCS)[name]
  self.new(cat+' / '+sub)
  self.c.bookmarkPage('detail-'+slug(name))
  self.text(name,24,'FCBold',after=8);self.text(STATUS[life[self.si]].upper()+(' | PROJECTED DEVELOPMENT PRIORITY' if self.si else ' | FORECUT ASSESSMENT'),9,'FCBold',SCOL[life[self.si]],after=13)
  pic=ROOT/'img'/(slug(name)+'.webp');alias=False
  if not pic.exists() and isinstance(sk,str):pic=ROOT/'img'/(slug(sk)+'.webp');alias=True
  if not pic.exists():pic=ROOT/'img/india-season-art'/(slug(self.code)+'.webp');alias=True
  top=self.y;self.picture(pic,207,245);self.y=top
  self.text('DETAIL OVERVIEW',8.5,'FCBold',RUST,width=CW-226,x=M+226)
  self.text(d['o'],10.2,width=CW-226,x=M+226)
  self.text('Area: '+area+' | '+sub,8.5,'FCBold',width=CW-226,x=M+226)
  self.y=min(self.y,top-264)
  self.text('Illustrative silhouette reference; sample construction separately.' if alias else 'Forecut design reference image; not future runway evidence.',7.5,'FCItalic',MUTED,after=12)
  self.sub('Design notes')
  for b in d['d']:self.bullet(b,9.5)
  self.sub('Fabric & trims');self.text(d['f'],9.5,after=10);self.sub('Where to use it');self.text(d['u'],9.5,after=10)
  self.sub('Lifecycle across India seasons');cell=CW/5;yy=self.y-42
  if yy<52:raise ValueError('Lifecycle overflow '+name)
  for i,code in enumerate(I.CODES):
   xx=M+i*cell;self.c.setStrokeColor(colors.HexColor(INK if i==self.si else LINE));self.c.setLineWidth(1.5 if i==self.si else .6);self.c.roundRect(xx,yy,cell-5,40,4,fill=0,stroke=1);self.c.setFillColor(colors.HexColor(MUTED));self.c.setFont('FC',7);self.c.drawString(xx+7,yy+26,code);self.c.setFillColor(colors.HexColor(SCOL[life[i]]));self.c.setFont('FCBold',8);self.c.drawString(xx+7,yy+11,STATUS[life[i]])
  self.y=yy-10
 def close(self):self.c.save()
def festive26():
 themes=[]
 for t in I.THEMES:
  themes.append(dict(title=t['t'],story=t['story'],products=t['d'],make=' '.join(t['actions']),commercial=t['why'],sources=[],legacy=[('Brand references','; '.join(k+': '+v for k,v in t['brands'])),('Source coverage',t['src']),('Indicative price architecture','; '.join(row[0]+': INR '+row[1]+' value / '+row[2]+' mid / '+row[3]+' premium' for row in t['prices'])),('Cost considerations',' - '.join(t['cost']))]))
 return dict(title='Festive made easy',focus=I.SEASON_INFO['Festive 26']['focus'],basis='Current-season editorial assessment | Pricing is indicative, not live market data',palette=I.META['palette'],themes=themes,categories=[(a,b) for a,b,*_ in I.CATS],plan=[('Now','In stores now. Reorder proven winners for December-February weddings.')],watch=['Compare full-price sales, fit returns and replenishment with your own trading data.'],sources=[])
def main():
 manifest={}
 for code in I.CODES:
  r=S.RESEARCH['seasons'].get(code) or festive26();items=[x for x in I.D if x[5][I.CODES.index(code)]!='-'];report=Report(code);report.cover(r,items);report.palette(r)
  report.new('Report contents','contents');report.heading('Inside this season')
  for title,desc in [('Season strategy','Forecast focus, original palette and development priorities'),('Theme directions','Product opportunities, construction guidance and commercial actions'),('Category opportunities & calendar','Assortment guidance and sampling milestones'),('Complete detail library',str(len(items))+' illustrated detail pages, grouped by category'),('Research & methodology','Linked sources, evidence limits and review checkpoints')]:report.sub(title);report.text(desc,11,after=17)
  report.text('PDF bookmarks navigate the principal sections. Every active detail from this season is included; inactive entries are not silently presented as current recommendations.',9,'FCItalic',MUTED)
  for i,t in enumerate(r['themes'],1):report.theme(t,i)
  report.new('Category opportunities','categories');report.heading('Build the assortment')
  if code=='Festive 26':
   for dept,cat,use,fab in I.CATS:
    report.sub(cat);report.text(use+' '+fab,9.5,after=10)
  else:
   for title,note in r['categories']:report.sub(title);report.text(note,11,after=18)
  report.new('Development calendar','calendar');report.heading('From concept to delivery')
  for date,action in r['plan']:report.sub(date);report.text(action,11,after=19)
  report.sub('What would change this forecast?')
  for t in r['watch']:report.bullet(t,10)
  for dept,cat,*_ in I.CATS:
   group=[x for x in items if x[0]==cat];report.new('Detail library / '+cat,'cat-'+slug(cat));report.heading(cat);report.text(str(len(group))+' active details | '+code,12,'FCBold');report.text('Illustrated design references, full development notes, material guidance and lifecycle for every active detail in this category.',11)
   for x in group:report.bullet(x[2]+' - '+STATUS[x[5][report.si]],10)
   for x in group:report.detail(x)
  report.new('Research & methodology','sources');report.heading('Evidence, with context');report.text(S.RESEARCH['method'],10.5,after=20)
  if not report.si:report.sub('Published Festive 26 source basis');report.text(I.META['sources'],10)
  report.sub('Image provenance');report.text('Season cover: original AI-generated Forecut concept art, October 2026. Detail pages: existing Forecut reference imagery. New propositions use an explicitly labeled related silhouette where an exact image is unavailable. No generated image is presented as a designer runway photograph.',10)
  report.sub('Review date');report.text('Research reviewed 15 October 2026. This is a dated report, not a live market feed. Religious dates, prices and supplier availability require separate checks.',10)
  ids=r['sources']
  if ids:
   report.new('Source register');report.heading('Public research sources')
   for k in ids:
    s=SRC[k];need=90
    if report.y<need+70:report.new('Source register / continued')
    report.text('<link href="'+html.escape(s['url'],quote=True)+'" color="'+INK+'">'+esc(s['title'])+'</link>',11,'FCBold',raw=True,after=5);report.text(s['date'],8.5,'FC',MUTED,after=5);report.text(s['note'],9.5,after=18)
  report.close();reader=PdfReader(report.file);text='\n'.join(p.extract_text() or '' for p in reader.pages)
  for x in items:assert clean(x[2]) in text,('Missing detail',code,x[2])
  assert len(reader.pages)==report.n
  entry=dict(file=str(report.file.relative_to(ROOT)),pages=report.n,details=len(items),bytes=report.file.stat().st_size,images=sum(len(p.images) for p in reader.pages),reviewed='2026-10-15',hero='img/india-season-art/'+slug(code)+'.webp')
  manifest[code]=entry;print(code,entry)
 (ROOT/'build/india_pdf_manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
if __name__=='__main__':main()
