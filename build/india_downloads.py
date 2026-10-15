"""Complete seasonal PDF buttons and original concept imagery for the India page."""
import json,re,html
from pathlib import Path
E=html.escape
ROOT=Path(__file__).resolve().parent.parent
CODES=['Festive 26','Summer 27','Festive 27','Summer 28','Festive 28']
def add(out):
 manifest=json.loads((ROOT/'build/india_pdf_manifest.json').read_text())
 def button(code,i):
  m=manifest[code];return '<button type="button" class="season-pdf" data-pdf-si="'+str(i)+'" aria-label="Download complete '+E(code)+' report PDF">Download full report PDF ↓<small>'+str(m['pages'])+' pages · '+str(m['details'])+' details · '+str(round(m['bytes']/1048576,1))+' MB</small></button>'
 # Keep this integrated with the generated season guide, not hand-edited HTML.
 n=0
 def card(match):
  nonlocal n
  text=match.group(0);code=CODES[n];m=manifest[code];image='<figure class="season-cover"><img src="'+m['hero']+'" alt="'+E(code)+' original Forecut forecast concept" width="1536" height="1024" loading="lazy"><figcaption>AI-generated forecast concept</figcaption></figure>'
  text=text.replace('<div class="shd">',image+'<div class="shd">',1).replace('</div><p class="socc">','</div>'+button(code,n)+'<p class="socc">',1);n+=1;return text
 out=re.sub(r'<article class="scard\b.*?</article>',card,out,flags=re.S);assert n==5
 for i,code in enumerate(CODES[1:],1):
  marker='<div class="ir-themes">'
  report=out.index('data-report-si="'+str(i)+'"');at=out.index(marker,report);m=manifest[code]
  figure='<div class="ir-download">'+button(code,i)+'<p>Complete season report with images, all '+str(m['details'])+' active details, palette, design guidance, calendar and sources.</p></div><figure class="ir-season-art"><img src="'+m['hero']+'" alt="'+E(code)+' conceptual collection direction" width="1536" height="1024" loading="lazy"><figcaption>Original AI-generated Forecut concept art. Not a documented runway image.</figcaption></figure>'
  out=out[:at]+figure+out[at:]
 css='''.season-cover{margin:0 0 6px}.season-cover img{width:100%;height:auto;aspect-ratio:3/2;object-fit:cover;display:block;border-radius:8px}.season-cover figcaption{font:500 9px var(--body);color:var(--muted);margin-top:5px}.season-pdf{cursor:pointer;background:var(--chalk);color:white;border:0;border-radius:8px;padding:11px 12px;font:700 13px var(--body);text-align:center;line-height:1.35}.season-pdf small{display:block;font:500 10.5px var(--body);opacity:.9;margin-top:4px}.season-pdf:hover{filter:brightness(.92)}.season-pdf:focus-visible{outline:3px solid var(--mat);outline-offset:3px}.ir-download{display:flex;gap:20px;align-items:center;border-block:1px solid var(--grid);padding:20px 0;margin:20px 0 28px}.ir-download p{font-size:14px;line-height:1.6;max-width:55ch}.ir-download .season-pdf{flex:none;min-width:240px}.ir-season-art{margin:0 0 30px}.ir-season-art img{display:block;width:100%;height:auto;border-radius:12px}.ir-season-art figcaption{font:500 12px var(--body);color:var(--muted);margin-top:8px}@media(max-width:700px){.ir-download{align-items:stretch;flex-direction:column;gap:5px}.ir-download .season-pdf{min-width:0}.season-cover figcaption{font-size:10px}}'''
 out=out.replace('</style>',css+'</style>',1)
 js='''<script>(function(){var PDFs=MANIFEST;var C=CODES;
 document.querySelectorAll('[data-pdf-si]').forEach(function(button){button.addEventListener('click',function(){var i=+button.dataset.pdfSi,gate=document.querySelector('.sseg button[data-si="'+i+'"]');if(gate&&gate.hasAttribute('data-lock')){gate.click();var message=document.getElementById('snote');if(message){message.hidden=false;message.textContent='Sign in to download the complete '+C[i]+' report. Your member access includes every season.';message.scrollIntoView({behavior:'smooth',block:'center'});}return;}var a=document.createElement('a');a.href=PDFs[C[i]].file;a.download=PDFs[C[i]].file.split('/').pop();a.hidden=true;document.body.append(a);a.click();a.remove();});});})();</script>'''.replace('MANIFEST',json.dumps(manifest)).replace('CODES',json.dumps(CODES))
 return out.replace('</body></html>',js+'\n</body></html>',1)
