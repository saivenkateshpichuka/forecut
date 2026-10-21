"""Five independent India report pages, a season hub and a preserved reference library."""
from pathlib import Path
import json,html,re
ROOT=Path(__file__).resolve().parent.parent
DATA=json.loads((ROOT/'build/india_season_reports.json').read_text());SEASONS=DATA['seasons'];SOURCES=DATA['sources'];E=html.escape
CSS=(ROOT/'build/india_season_pages.css').read_text();JS=(ROOT/'build/india_season_pages.js').read_text()
PDFS=json.loads((ROOT/'build/india_season_pdf_manifest.json').read_text()) if (ROOT/'build/india_season_pdf_manifest.json').exists() else {}
def link(id,label=None):
 s=SOURCES[id];return '<a class="source-link" href="'+E(s['url'],quote=True)+'" target="_blank" rel="noopener">'+E(label or s['title'])+' ↗</a>'
def paragraph(s):return '<p>'+E(s)+'</p>'
def label(s):return '<span class="label">'+E(s)+'</span>'
def pdf_link(code):
 m=PDFS.get(code)
 return '<a class="button accent" href="'+E(m['file'] if m else '#',quote=True)+'" download>Download season PDF'+(' · '+str(m['pages'])+' pages' if m else '')+' ↓</a>'
def head(title):return '<!doctype html><html lang="en-IN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+E(title)+'</title><link rel="stylesheet" href="fonts/fonts.css"><style>'+CSS+'</style></head><body>'
def nav(code=None):return '<header class="bar"><a class="back" href="/">Forecut.</a><nav class="seasons" aria-label="India seasons"><a href="region-asia.html">Asia region</a><a href="india.html"'+(' aria-current="page"' if code is None else '')+'>India</a>'+''.join('<a href="'+r['file']+'"'+(' aria-current="page"' if c==code else '')+'>'+E(c)+'</a>' for c,r in SEASONS.items())+'</nav></header>'
def footer():return '<footer class="footer"><a href="india.html">India seasons</a><a href="reports.html">Reports</a><a href="journal.html">Journal</a><a href="about.html">About Forecut</a><a href="contact.html">Contact</a><p>© 2026 Forecut · Global fashion forecasting. India market forecasts are part of the <a href=\"region-asia.html\">Asia region</a>.</p></footer>'
def sources_for(r):
 ids=set()
 for s in r['stories']:ids.add(s['source'])
 for s in r['innovations']:ids.add(s['source'])
 for s in r['benchmarks']:ids.add(s['source'])
 for s in r['themes']:ids.update(s['sources'])
 for s in r['details']:ids.update(s['sources'])
 return sorted(ids)
def detail(d):
 prices=d['price'];search=(d['name']+' '+d['category']+' '+d['brief']+' '+d['material']).lower()
 extra=label('Season development')+paragraph(d['season_action'])+label('Construction & validation')+paragraph(d['construction'])+label('Materials')+paragraph(d['material'])+label('Commercial role')+paragraph(d['commercial'])+label('Indicative price architecture')+paragraph('Value: '+prices[0]+' · Mid: '+prices[1]+' · Premium: '+prices[2])
 if d['sources']:extra+=link(d['sources'][0],'Research input')
 return '<article class="detail-card" id="'+E(d['id'])+'" data-category="'+E(d['category'],quote=True)+'" data-search="'+E(search,quote=True)+'"><img src="'+d['image']+'" alt="'+E(d['name'],quote=True)+' — '+E(d['image_kind'],quote=True)+'" width="1024" height="1024" loading="lazy"><div class="detail-body"><span class="mini">'+E(d['category'])+' · '+E(d['image_kind'])+'</span><h3>'+E(d['name'])+'</h3><span class="status '+d['status'].lower()+'">'+d['status']+'</span>'+paragraph(d['brief'])+'<details><summary>Development notes, materials & prices</summary>'+extra+'</details></div></article>'
def report(code,r):
 locked=code!='Festive 26';c=head(code+' India Fashion Forecast | Forecut')+nav(code)+'<main class="wrap">'
 c+='<section class="hero"><div><span class="eyebrow">India forecast · '+E(code)+'</span><h1>'+E(r['title'])+'</h1>'+paragraph(r['focus'])+'<p class="meta">'+E(r['window'])+'<br>Reviewed 15 October 2026</p><div'+(' class="lockhide" hidden' if locked else '')+'>'+pdf_link(code)+'<a class="button secondary" href="#detail-studio">Explore the detail edit</a></div></div><div class="hhero"><img src="'+r['hero']+'" alt="Original Forecut '+E(code)+' concept collection" width="1536" height="1024"><small>Original AI-generated Forecut concept. Not a documented designer collection.</small></div></section>'
 if locked:c+='<section class="lockpanel"><span class="eyebrow">Member access</span><h2>Read the complete '+E(code)+' report.</h2><p>Sign in for the season’s development details, prices, collection stories, innovations and illustrated PDF. Access is complimentary during early access.</p><a class="button" href="account.html?next=%2F'+r['file']+'">Sign in to read</a></section><div class="lockhide" hidden>'
 c+='<div class="facts"><div><b>20</b><span>Selected development details</span></div><div><b>4</b><span>New concept photographs</span></div><div><b>3</b><span>Designer collection stories</span></div><div><b>3</b><span>Innovation opportunities</span></div></div><p class="confidence">'+E(r['basis'])+'. Lifecycle and development priorities are editorial assessments; they are not measured sales forecasts.</p>'
 c+='<nav class="jump" aria-label="Report sections">'+''.join('<a href="#'+id+'">'+t+'</a>' for id,t in [('direction','Direction'),('detail-studio','Detail studio'),('prices','Prices'),('offers','Offers'),('collections','Designer stories'),('innovations','Innovations'),('calendar','Development calendar'),('sources','Sources')])+'</nav>'
 c+='<section class="section" id="direction"><div class="section-head"><div><span class="eyebrow">Season direction</span><h2>The collection framework.</h2></div><p>Translate the season into material, shape and construction choices for your own customer.</p></div><div class="theme-grid">'
 for t in r['themes']:c+='<article class="panel"><h3>'+E(t['title'])+'</h3>'+paragraph(t['story'])+label('Product opportunity')+paragraph(t['products'])+label('Development action')+paragraph(t['make'])+'</article>'
 c+='</div><div class="palette">'+''.join('<div class="swatch"><i style="background:'+h+'"></i><b>'+E(n)+'</b><small>'+h.upper()+'</small></div>' for h,n in r['palette'])+'</div><p class="small-note">Original Forecut working palette. Approve physical lab dips; digital colours are not textile standards.</p></section>'
 cats=sorted({d['category'] for d in r['details']})
 c+='<section class="section" id="detail-studio"><div class="section-head"><div><span class="eyebrow">The '+E(code)+' detail studio</span><h2>Develop the right details.</h2></div><p>A curated edit specific to this season. Each image is assigned to one season in this edition; development notes distinguish references from new concepts.</p></div><div class="studio-tools"><input id="detail-search" type="search" aria-label="Search season details" placeholder="Search details, materials or construction"><select id="detail-category" aria-label="Filter category"><option value="">All categories</option>'+''.join('<option>'+E(cat)+'</option>' for cat in cats)+'</select><span class="result-count" id="detail-count">20 details</span></div><div class="detail-grid">'+''.join(detail(d) for d in sorted(r['details'],key=lambda d:0 if d['image_kind'].startswith('New') else 1))+'</div><p class="empty" id="detail-empty" hidden>No details match. Try another material or category.</p></section>'
 c+='<section class="section" id="prices"><div class="section-head"><div><span class="eyebrow">Price architecture</span><h2>Build a viable range.</h2></div><p>'+E(r['price_note'])+'</p></div><div class="table-scroll"><table><thead><tr><th>Product family</th><th>Value · INR</th><th>Mid · INR</th><th>Premium · INR</th></tr></thead><tbody>'+''.join('<tr><td>'+E(p['category'])+'</td><td>'+E(p['value'])+'</td><td>'+E(p['mid'])+'</td><td>'+E(p['premium'])+'</td></tr>' for p in r['price_rows'])+'</tbody></table></div><div class="benchmark">'
 for b in r['benchmarks']:c+='<article class="panel"><span class="eyebrow">Retail snapshot · 15 Oct 2026</span><b>'+E(b['brand'])+'</b>'+paragraph(b['product'])+paragraph(b['price'])+paragraph(b['offer'])+link(b['source'],'Verify product & terms')+'</article>'
 c+='</div><p class="small-note">Retail snapshots describe inspected listings, not promised '+E(code)+' prices or offers. Confirm price, stock, sizes and terms at the source.</p></section>'
 c+='<section class="section" id="offers"><div class="section-head"><div><span class="eyebrow">Merchandising offers</span><h2>Give customers a reason to buy.</h2></div><p>'+E(r['offer_note'])+'</p></div><div class="offer-grid">'+''.join('<article class="panel"><h3>'+E(o['title'])+'</h3>'+paragraph(o['action'])+'</article>' for o in r['offers'])+'</div></section>'
 c+='<section class="section" id="collections"><div class="section-head"><div><span class="eyebrow">Designer collections & brand stories</span><h2>Understand the idea behind the look.</h2></div><p>Documented collections provide research inputs. Forecut’s translations below are original proposals for your next range, not announcements by those designers.</p></div><div class="story-grid">'
 for s in r['stories']:c+='<article class="panel"><h3>'+E(s['brand'])+'</h3><p class="collection">'+E(s['collection'])+'</p>'+label('Documented observation')+paragraph(s['observed'])+label('Collection story')+paragraph(s['story'])+label('Forecut translation')+paragraph(s['translate'])+link(s['source'],'Read the collection source')+'</article>'
 c+='</div></section><section class="section" id="innovations"><div class="section-head"><div><span class="eyebrow">Innovation radar</span><h2>What to prototype next.</h2></div><p>Assess material and process opportunities through samples, supplier evidence and a commercial test.</p></div><div class="innovation-grid">'
 for s in r['innovations']:c+='<article class="panel"><span class="eyebrow">'+E(s['maturity'])+'</span><h3>'+E(s['title'])+'</h3>'+paragraph(s['signal'])+label('Collection application')+paragraph(s['use'])+label('Validation gate')+paragraph(s['test'])+link(s['source'],'Review the primary source')+'</article>'
 c+='</div></section><section class="section" id="calendar"><span class="eyebrow">Collection development</span><h2>Plan the work, then validate it.</h2><ol class="calendar">'+''.join('<li><b>'+E(t)+'</b>'+paragraph(a)+'</li>' for t,a in r['plan'])+'</ol><div class="panel"><h3>What would change this forecast?</h3><ul>'+''.join('<li>'+E(w)+'</li>' for w in r['watch'])+'</ul></div></section>'
 c+='<section class="section" id="sources"><details class="source-register"><summary>Research sources, image provenance & methodology</summary><p>Reviewed 15 October 2026. Documented observations, retailer snapshots, supplier claims and original Forecut proposals are identified separately. Future collection adoption is uncertain. Generated images are concepts; reference images illustrate design vocabulary, not exact prototypes or future runway evidence.</p><ol>'
 for k in sources_for(r):s=SOURCES[k];c+='<li>'+link(k)+ '<small>'+E(s['date'])+'</small>'+paragraph(s['note'])+'</li>'
 c+='</ol></details><div class="archive-banner"><h3>Keep exploring.</h3><p>The extended reference edition preserves the earlier '+E(code)+' detail catalogue. It is an archive, separate from this curated season report.</p>'+pdf_link(code)+'<a class="button secondary" href="'+r['archive_pdf']+'" download>Extended reference PDF ↓</a></div></section>'
 if locked:c+='</div>'
 return c+footer()+'</main><script>'+JS+'</script></body></html>'
def hub():
 c=head('India Fashion Forecasts by Season | Forecut')+nav()+'<main class="wrap"><section class="hub-intro"><span class="eyebrow">Forecut India · 2026–2028</span><h1>Plan the next collection.<br>One season at a time.</h1><p>Independent seasonal edits with design details, prices, merchandising offers, designer collection stories and an innovation radar for Indian fashion brands.</p><p class="small-note">Festive 26 is open. Sign in for later seasons during complimentary early access. 2028 reports are conditional long-range scenarios.</p></section><section class="season-grid" id="seasons" aria-label="India season reports">'
 for code,r in SEASONS.items():
  c+='<article class="season-tile"><a href="'+r['file']+'"><img src="'+r['hero']+'" alt="'+E(code)+' original concept collection" width="1536" height="1024"></a><div class="tile-body"><span class="eyebrow">'+('Now open' if code=='Festive 26' else 'Member report')+'</span><h2>'+E(code)+'</h2><span class="mini">'+E(r['window'].split(' · ')[0])+'</span><p><b>'+E(r['title'])+'</b></p><p class="desc">20 curated development details · Original imagery · Prices & offers · Designer stories · Innovation radar</p><a class="button" href="'+r['file']+'">Read '+E(code)+' forecast →</a></div></article>'
 c+='</section><aside class="archive-banner"><span class="eyebrow">Research library</span><h2>Depth beyond the season edit.</h2><p>The earlier extended detail catalogue and all five illustrated reference PDFs remain available.</p><a class="button secondary" href="india-reference-library.html">Open the extended reference library →</a></aside>'+footer()+'</main></body></html>'
 return c
def build(archive=None):
 if archive:(ROOT/'india-reference-library.html').write_text(archive)
 for code,r in SEASONS.items():(ROOT/r['file']).write_text(report(code,r))
 (ROOT/'india.html').write_text(hub())
 print('Built independent India season pages:',len(SEASONS))
if __name__=='__main__':build()
