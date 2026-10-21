"""Write ../search.html and ../search-index.json: one search across every global detail, India market detail,
region, season, report, article and hub page. Reuses the hub page shell from hubs.py."""
import json, html, os, re, glob
_src = open('hubs.py').read()
_ns = {'__name__': 'hubs_helpers'}
exec(_src.split('\nBUILD = {')[0], _ns)
head, NAVJS, FOOT = _ns['head'], _ns['NAVJS'], _ns['FOOT']
E = html.escape
import india_data as I

S = json.load(open('seasons.json'))['seasons']  # aw26 ss27 aw27 ss28 aw28
M = json.load(open('details.json'))['model']


def islug(x):
    return ''.join(ch.lower() if ch.isalnum() else '-' for ch in x).strip('-').replace('--', '-').replace('--', '-')


def photo(name):
    sl = islug(name)
    for c in (sl + '-photo', sl + '-ss27-photo', sl):
        if os.path.exists(f'../img/{c}.webp'):
            return c
    return ''


idx = []
# global details: link to the first season where the detail is tracked, filtered to it
for k, items in M.items():
    dept, cat = k.split('|')
    for it in items:
        first = next((i for i, c in enumerate(it['life']) if c in 'erpf'), None)
        if first is None:
            continue
        idx.append({'t': 'd', 'n': it['name'], 'c': f'{dept} · {cat}', 'a': it.get('area', ''), 'x': it.get('note', ''), 'l': it['life'],
                    'u': f'{S[first]}.html?q={islug(it["name"]).replace("-", "+")}#list', 'i': photo(it['name'])})
# India market details
ICODES = ['india-' + islug(c) for c in I.CODES]
for x in I.D:
    first = next((i for i, c in enumerate(x[5]) if c in 'erpf'), 0)
    page = ICODES[first] + '.html' if os.path.exists(f'../{ICODES[first]}.html') else 'india.html'
    idx.append({'t': 'i', 'n': x[2], 'c': f'India · {x[1]}', 'a': x[3], 'x': x[4], 'l': x[5], 'u': page, 'i': photo(x[2])})
# pages: titles and descriptions straight from the built pages
SKIP = {'404.html', 'offline.html', 'search.html', 'account.html', 'terms.html', 'privacy.html'}
for f in sorted(glob.glob('../*.html')):
    fn = os.path.basename(f)
    if fn in SKIP or fn.startswith('forecut-'):
        continue
    h = open(f).read()
    t = re.search(r'<title>(.*?)</title>', h, re.S)
    d = re.search(r'<meta name="description" content="([^"]*)"', h)
    if not t:
        continue
    title = html.unescape(t.group(1)).split(' | ')[0].split(' · Forecut')[0].strip()
    kind = 'r' if fn.startswith('region') or fn in ('resort-27.html', 'pre-fall-27.html') or fn.startswith('india') else ('s' if fn[:-5] in S else 'p')
    og = re.search(r'<meta property="og:image" content="https://forecut.in/img/([a-z0-9-]+)\.webp"', h)
    idx.append({'t': kind, 'n': title, 'c': {'r': 'Region & market', 's': 'Season forecast', 'p': 'Report, article or guide'}[kind], 'x': html.unescape(d.group(1)) if d else '', 'u': fn, 'i': og.group(1) if og else ''})
json.dump(idx, open('../search-index.json', 'w'), ensure_ascii=False, separators=(',', ':'))

SCODES = [s.upper() for s in S]
CSS = """<style>
.sbox{display:flex;gap:10px;margin:18px 0 12px}
.sbox input{flex:1;min-width:0;font:500 18px "DM Sans",sans-serif;padding:14px 18px;border-radius:999px;border:1.5px solid var(--ink);background:var(--paper-2);color:var(--ink)}
.sbox input:focus-visible{outline:3px solid var(--chalk);outline-offset:2px}
.sf{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 8px}
.sf button{font:600 13px "DM Sans",sans-serif;border:1px solid var(--grid);background:var(--paper-2);color:var(--ink);padding:8px 13px;border-radius:999px;cursor:pointer}
.sf button[aria-pressed="true"]{background:var(--ink);color:var(--paper);border-color:var(--ink)}
.scount{font:500 13px "DM Sans",sans-serif;color:var(--muted);margin:10px 0 14px}
.res{list-style:none;padding:0;margin:0;display:grid;gap:10px}
.res a{display:grid;grid-template-columns:64px 1fr;gap:14px;align-items:center;text-decoration:none;color:inherit;background:var(--paper-2);border:1px solid var(--grid);border-radius:12px;padding:10px 14px 10px 10px}
.res a:hover,.res a:focus-visible{border-color:var(--ink)}
.res .th{width:64px;height:64px;border-radius:8px;overflow:hidden;background:var(--grid);display:grid;place-items:center;font:700 22px "DM Sans",sans-serif;color:var(--muted)}
.res .th img{width:100%;height:100%;object-fit:cover}
.res b{font:700 16.5px "DM Sans",sans-serif;display:block}
.res small{font:600 11.5px "DM Sans",sans-serif;letter-spacing:.05em;text-transform:uppercase;color:var(--chalk)}
.res p{margin:2px 0 0;font-size:14px;line-height:1.45;color:var(--muted)}
.lf{display:flex;gap:4px;flex-wrap:wrap;margin-top:6px}
.lf span{font:600 10.5px "DM Sans",sans-serif;padding:3px 7px;border-radius:99px;background:var(--grid);color:var(--ink)}
.lf .e{background:#ffe1d3;color:#8a2c00}.lf .r{background:#d6f5e4;color:#04603a}.lf .p{background:#fff0c7;color:#6b4a00}.lf .f{background:#ebe3ff;color:#4b2a9e}
.sh{margin:22px 0 0;font-size:14px;color:var(--muted)}
.sh a{margin-right:12px}
</style>"""
BODY = f"""<div class="eb">Search</div><h1>Search every forecast.</h1>
<p class="lead">Details, trends, regions, seasons, reports and articles across AW26 to AW28, Resort, Pre-Fall and the India market.</p>
<form class="sbox" role="search" onsubmit="return false"><label for="sq" class="vh" style="position:absolute;left:-9999px">Search Forecut</label>
<input id="sq" type="search" placeholder="Try: collar, loafer, linen, Brazil, peplum" autocomplete="off" autofocus></form>
<div class="sf" role="group" aria-label="Filter results"><button type="button" data-t="" aria-pressed="true">All</button><button type="button" data-t="d" aria-pressed="false">Global details</button><button type="button" data-t="i" aria-pressed="false">India market</button><button type="button" data-t="r" aria-pressed="false">Regions</button><button type="button" data-t="s" aria-pressed="false">Seasons</button><button type="button" data-t="p" aria-pressed="false">Reports &amp; articles</button></div>
<div class="sf" role="group" aria-label="Trend stage"><button type="button" data-st="" aria-pressed="true">Any stage</button><button type="button" data-st="e" aria-pressed="false">Emerging</button><button type="button" data-st="r" aria-pressed="false">Rising</button><button type="button" data-st="p" aria-pressed="false">Peaking</button><button type="button" data-st="f" aria-pressed="false">Fading</button></div>
<p class="scount" id="sc" role="status">Loading the index…</p>
<ul class="res" id="sr"></ul>
<p class="sh">Popular: <a href="?q=collar">collar</a><a href="?q=pocket">pocket</a><a href="?q=loafer">loafer</a><a href="?q=linen">linen</a><a href="?q=embroidery">embroidery</a><a href="?q=peplum">peplum</a></p>
<script>(function(){{var SC={json.dumps(SCODES)},IC={json.dumps(list(I.CODES))},L={{e:'Emerging',r:'Rising',p:'Peaking',f:'Fading'}};
var q=document.getElementById('sq'),out=document.getElementById('sr'),cnt=document.getElementById('sc'),T='',ST='',DATA=[];
try{{var u=new URLSearchParams(location.search);if(u.get('q'))q.value=u.get('q');}}catch(e){{}}
function esc(s){{return String(s||'').replace(/[&<>"]/g,function(c){{return{{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}}[c];}});}}
function life(x){{if(!x.l)return'';var codes=x.t==='i'?IC:SC;return'<span class="lf">'+x.l.split('').map(function(c,i){{return L[c]?'<span class="'+c+'">'+codes[i]+' · '+L[c]+'</span>':'';}}).join('')+'</span>';}}
function score(x,w){{var n=x.n.toLowerCase(),s=0;for(var i=0;i<w.length;i++){{var t=w[i];if(n.indexOf(t)>-1)s+=n.indexOf(t)===0?6:4;else if((x.c+' '+(x.a||'')).toLowerCase().indexOf(t)>-1)s+=2;else if((x.x||'').toLowerCase().indexOf(t)>-1)s+=1;else return 0;}}return s+(x.t==='r'||x.t==='s'?1:0);}}
function run(){{var w=q.value.trim().toLowerCase().split(/\\s+/).filter(Boolean),res=[];
 DATA.forEach(function(x){{if(T&&x.t!==T)return;if(ST&&(!x.l||x.l.indexOf(ST)<0))return;var s=w.length?score(x,w):(x.t==='s'||x.t==='r'?3:0);if(s>0||(!w.length&&ST))res.push([s,x]);}});
 res.sort(function(a,b){{return b[0]-a[0];}});var shown=res.slice(0,60);
 cnt.textContent=w.length||ST||T?res.length+' result'+(res.length===1?'':'s')+(res.length>60?' · showing the best 60':''):'Type a detail, fabric, region or season.';
 out.innerHTML=shown.map(function(r){{var x=r[1];return'<li><a href="'+esc(x.u)+'"><span class="th">'+(x.i?'<img src="img/'+esc(x.i)+'.webp" alt="" loading="lazy" width="64" height="64">':esc(x.n.charAt(0)))+'</span><span><small>'+esc(x.c)+'</small><b>'+esc(x.n)+'</b><p>'+esc(x.x)+'</p>'+life(x)+'</span></a></li>';}}).join('');
 try{{history.replaceState(null,'',q.value.trim()?'?q='+encodeURIComponent(q.value.trim()):location.pathname);}}catch(e){{}}
 if(window.gtag&&w.length)gtag('event','search',{{search_term:q.value.trim()}});}}
var tm;q.addEventListener('input',function(){{clearTimeout(tm);tm=setTimeout(run,140);}});
document.querySelectorAll('.sf button').forEach(function(b){{b.addEventListener('click',function(){{var g=b.parentNode;g.querySelectorAll('button').forEach(function(x){{x.setAttribute('aria-pressed',x===b?'true':'false');}});if(b.hasAttribute('data-t'))T=b.getAttribute('data-t');else ST=b.getAttribute('data-st');run();}});}});
fetch('search-index.json').then(function(r){{return r.json();}}).then(function(d){{DATA=d;run();}}).catch(function(){{cnt.textContent='Search could not load. Please refresh the page.';}});}})();</script>"""
open('../search.html', 'w').write(head('Search Forecut', 'hub') + CSS + BODY + NAVJS + FOOT)
print('search ok', len(idx))
