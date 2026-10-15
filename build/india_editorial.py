"""Season-specific research panels and synchronisation for the India report."""
import json, html
from pathlib import Path
from india_seasons import RESEARCH
E=html.escape

def add(out,I,descs,original,images):
    sources={s['id']:s for s in RESEARCH['sources']}
    def refs(ids):
        return '<ul class="ir-refs">'+''.join('<li><a href="'+E(sources[k]['url'],quote=True)+'" target="_blank" rel="noopener">'+E(sources[k]['title'])+'</a><small>'+E(sources[k]['date'])+'</small><p>'+E(sources[k]['note'])+'</p></li>' for k in ids)+'</ul>'
    reports=[];payload={}
    category_map={'Women':'Womenswear','Men':'Menswear','Fusion':'Fusion & western','Western':'Fusion & western','Footwear':'Footwear','Materials':'Textiles & trims'}
    for code,r in RESEARCH['seasons'].items():
        si=I.CODES.index(code)
        themes=''.join('<article class="ir-theme"><span class="mono">Direction '+str(i+1).zfill(2)+'</span><h3>'+E(t['title'])+'</h3><p>'+E(t['story'])+'</p><dl>'+''.join('<dt>'+label+'</dt><dd>'+E(t[key])+'</dd>' for label,key in [('Build the range','products'),('Development notes','make'),('Commercial action','commercial')])+'</dl><details><summary>Evidence behind this direction</summary>'+refs(t['sources'])+'</details></article>' for i,t in enumerate(r['themes']))
        colours=''.join('<div class="ir-colour"><i style="background:'+h+'"></i><b>'+E(n)+'</b><small>'+h+'</small></div>' for h,n in r['palette'])
        categories=''.join('<article><h3>'+E(k)+'</h3><p>'+E(v)+'</p></article>' for k,v in r['categories'])
        plan=''.join('<li><b>'+E(k)+'</b><span>'+E(v)+'</span></li>' for k,v in r['plan'])
        reports.append('<section class="sec ir-report" data-report-si="'+str(si)+'" hidden aria-labelledby="ir-title-'+str(si)+'"><div class="ir-heading"><span class="mono eb">Forecut India · '+E(code)+'</span><h2 id="ir-title-'+str(si)+'">'+E(r['title'])+'</h2><p class="ir-confidence">'+E(r['basis'])+'</p><p>'+E(r['focus'])+'</p><small>Research reviewed 15 October 2026 · Original Forecut analysis</small></div><div class="ir-themes">'+themes+'</div><div class="ir-section"><span class="mono eb">Original working palette</span><h3>'+E(code)+' colour direction</h3><p>Use for sampling and range coordination. Validate physical lab dips under your selling light; these digital colours are not textile standards.</p><div class="ir-palette">'+colours+'</div></div><div class="ir-section"><span class="mono eb">Category opportunities</span><div class="ir-categories">'+categories+'</div></div><div class="ir-bottom"><div><h3>Development calendar</h3><ol class="ir-plan">'+plan+'</ol></div><div><h3>What would change this forecast?</h3><ul>'+''.join('<li>'+E(w)+'</li>' for w in r['watch'])+'</ul></div></div><details class="ir-method"><summary>Research sources & methodology · '+str(len(r['sources']))+' sources</summary><p>'+E(RESEARCH['method'])+'</p>'+refs(r['sources'])+'</details></section>')
        ds={};notes={}
        for cat,sub,name,area,note,life,sk in I.D:
            if life[si]=='-':continue
            guidance=dict(r['categories'])[category_map[next(c[0] for c in I.CATS if c[1]==cat)]]
            d=dict(descs[name]);d['o']=note+' '+code+': '+guidance
            d['f'] = ('Light cotton, linen and cotton-silk; opacity-tested inners and restrained thread detailing.' if si in (1,3) else 'Light silk blends, textured weaves and placed embroidery; test metallic trims for weight and care.') if cat in ("Women's Ethnic", "Men's Ethnic", 'Indo-Western') else d['f']
            if name not in original: d['o'] += ' Sketch is an indicative silhouette reference; construction details must be developed in sampling.'
            d['d']=[r['basis']+'. Lifecycle labels are development assessments, not observed sell-through.',guidance, 'Approve fit, material performance, care instructions and actual supplier costing before any bulk commitment.'];d['u']=r['focus'];ds[name]=d
            notes[name]=note+' '+('Long-range hypothesis. ' if si>=3 else 'Forecast direction. ')+guidance
        payload[str(si)]=dict(title='India · '+code+' | '+r['title'],intro=r['focus'],basis=r['basis'],palette=[h for h,n in r['palette']],descs=ds,counts={k:sum(x[5][si]==k for x in I.D) for k in 'erpf'},notes=notes)
    anchor='  <div class="sechead dh">';assert anchor in out
    out=out.replace(anchor,''.join(reports)+'\n'+anchor,1)
    css=Path(__file__).with_name('india_editorial.css').read_text()
    out=out.replace('</style>',css+'</style>',1)
    js=Path(__file__).with_name('india_editorial.js').read_text().replace('%%DATA%%',json.dumps(payload,ensure_ascii=False).replace('</','<\\/')).replace('%%ORIGINAL_DESCS%%',json.dumps(descs,ensure_ascii=False).replace('</','<\\/')).replace('%%ORIGINAL_PALETTE%%',json.dumps([h for h,n in I.META['palette']]))
    out=out.replace("area: card.querySelector('.area').textContent,", "area: card.getAttribute('data-area') || card.querySelector('.area').textContent,")
    out=out.replace("return 'Now: ' + ST[d.st][1]", "return (CUR_SEASON === 'Festive 26' ? 'Now: ' : CUR_SEASON + ' projection: ') + ST[d.st][1]")
    out=out.replace("'INDIA FORECAST 2026–28 · FESTIVE & WEDDING SEASON NOW'", "CUR_SEASON.toUpperCase() + ' · FORECUT EDITORIAL FORECAST'")
    out=out.replace("    return s + '<p class=\"tcmsg\">' + msg", "    if(CUR_SEASON !== 'Festive 26') msg = 'Forecut projection: ' + (NM[ch] || 'not tracked') + '. Validate through sampling and customer testing; this curve is illustrative, not measured demand.';\n    return s + '<p class=\"tcmsg\">' + msg")
    out=out.replace('<dt>Season</dt><dd>India · Oct 2026 – Dec 2028</dd>', '<dt>Season</dt><dd id="india-viewer-season">Festive 26</dd>')
    out=out.replace("x.fillText('India DETAIL REPORT',", "x.fillText(CUR_SEASON.toUpperCase() + ' DETAIL REPORT',")
    out=out.replace("return 'Forecut_India_' +", "return 'Forecut_' + CUR_SEASON.replace(/\\s/g, '_') + '_' +")
    return out.replace('</body></html>' ,'<script>'+js+'</script>\n</body></html>',1)
