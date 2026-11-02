# Reports hub (reports.html), exec'd from reports.py: uses PAGES, EXTRA, E and page().
# Featured report, paths by job, filter chips + search, shelves (swipe rows on mobile), access band.
HUB_CSS = '''<style>
.rh{display:grid;grid-template-columns:1.05fr 1fr;gap:40px;align-items:center;margin:36px 0 34px}
.rh h1{margin:6px 0 12px}.rh .lead{margin:0 0 20px}
.rstat{display:flex;flex-wrap:wrap;gap:0;border-top:1px solid var(--grid);border-bottom:1px solid var(--grid);margin:0 0 22px}
.rstat div{padding:14px 22px 14px 0;margin-right:22px;border-right:1px solid var(--grid);font-family:"DM Sans",sans-serif}
.rstat div:last-child{border-right:0;margin-right:0}
.rstat b{display:block;font:500 34px/1 "Source Serif 4",Georgia,serif;color:var(--ink)}.rstat span{font-size:13px;color:var(--muted)}
.rcta{display:flex;flex-wrap:wrap;gap:10px}
.rcta a{font:700 15px "DM Sans",sans-serif;text-decoration:none;padding:13px 20px;border-radius:2px}
.rcta .p{background:#E08A5E;color:#1c1714}.rcta .g{border:1px solid var(--ink);color:var(--ink)}
.feat{position:relative;display:block;border-radius:14px;overflow:hidden;text-decoration:none;color:#fff;aspect-ratio:5/4;background:#1c1714}
.feat img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .6s ease}.feat:hover img{transform:scale(1.03)}
.feat::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(14,11,9,0) 35%,rgba(14,11,9,.86))}
.feat .ft{position:absolute;left:26px;right:26px;bottom:24px;z-index:1;font-family:"DM Sans",sans-serif}
.feat .ft small{display:inline-block;font:700 11px "DM Sans",sans-serif;letter-spacing:.14em;text-transform:uppercase;background:#E08A5E;color:#1c1714;padding:5px 9px;border-radius:3px}
.feat .ft strong{display:block;font:500 34px/1.12 "Source Serif 4",Georgia,serif;margin:12px 0 8px}
.feat .ft span{display:block;font-size:15px;line-height:1.5;color:#efe6d4;max-width:520px}
.feat .ft em{display:inline-block;margin-top:14px;font:700 14px "DM Sans",sans-serif;font-style:normal;border-bottom:2px solid #E08A5E;padding-bottom:2px}
.paths{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:0 0 30px}
.paths a{display:grid;gap:4px;text-decoration:none;color:inherit;border:1px solid var(--grid);background:var(--paper-2);border-radius:10px;padding:16px 18px;font-family:"DM Sans",sans-serif;transition:border-color .2s}
.paths a:hover{border-color:var(--chalk)}
.paths small{font:700 11px "DM Sans",sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--chalk)}
.paths b{font-size:17px}.paths span{font-size:13.5px;color:var(--muted);line-height:1.45}
.rbar{position:sticky;top:0;z-index:5;background:var(--paper);border-bottom:1px solid var(--grid);padding:12px 0;margin:0 0 6px;display:flex;flex-wrap:wrap;gap:10px;align-items:center}
.rbar .chips{display:flex;gap:8px;flex-wrap:wrap}
.rbar button{font:600 14px "DM Sans",sans-serif;border:1px solid var(--grid);background:var(--paper-2);color:var(--ink);border-radius:999px;padding:8px 14px;cursor:pointer}
.rbar button[aria-pressed=true]{background:var(--ink);color:var(--paper);border-color:var(--ink)}
.rbar button i{font-style:normal;opacity:.65;margin-left:4px}
.rbar input{margin-left:auto;font:15px "DM Sans",sans-serif;border:1px solid var(--grid);background:var(--paper-2);color:var(--ink);border-radius:999px;padding:9px 16px;min-width:230px}
.rcount{font:600 13px "DM Sans",sans-serif;color:var(--muted);margin:10px 0 0}
.shelf{margin:34px 0 10px}.shelf[hidden]{display:none}
.shelf .sh{display:flex;align-items:baseline;justify-content:space-between;gap:16px;margin-bottom:14px}
.shelf h2{margin:0}.shelf .sh p{margin:0;font-size:15px;color:var(--muted);max-width:520px}
.row{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px}
.row.c5{grid-template-columns:repeat(5,minmax(0,1fr))}.row.c3{grid-template-columns:repeat(3,minmax(0,1fr))}
.rk{display:flex;flex-direction:column;text-decoration:none;color:inherit;background:var(--paper-2);border:1px solid var(--grid);border-radius:12px;overflow:hidden;transition:transform .25s,border-color .25s}
.rk:hover{transform:translateY(-3px);border-color:var(--chalk)}.rk[hidden]{display:none}
.rk .ph{position:relative;aspect-ratio:4/3;overflow:hidden;background:var(--grid)}
.rk .ph img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s}.rk:hover .ph img{transform:scale(1.04)}
.rk .ph .tg{position:absolute;left:10px;top:10px;font:700 10.5px "DM Sans",sans-serif;letter-spacing:.12em;text-transform:uppercase;background:#1f3d33;color:#f5f0e8;padding:5px 8px;border-radius:3px}
.rk .ph .pd{position:absolute;right:10px;top:10px;font:700 10.5px "DM Sans",sans-serif;letter-spacing:.08em;background:#f5f0e8;color:#1c1714;padding:5px 8px;border-radius:3px}
.rk .bd{display:grid;gap:7px;padding:14px 16px 16px;font-family:"DM Sans",sans-serif;align-content:start;flex:1}
.rk strong{font:700 17px/1.25 "DM Sans",sans-serif;color:var(--ink)}
.rk .ds{font:14.5px/1.5 "Source Serif 4",Georgia,serif;color:var(--muted);display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.rk .go{margin-top:auto;padding-top:4px;font:700 13.5px "DM Sans",sans-serif;color:var(--chalk)}
.vbar{display:flex;height:8px;border-radius:99px;overflow:hidden;gap:2px}
.vbar b.Invest{background:#047a45}.vbar b.Test{background:#c2410c}.vbar b.Maintain{background:#d99a00}.vbar b.Reduce{background:#6d4fc2}
.vlab{font:600 12px "DM Sans",sans-serif;color:var(--muted)}
.pstrip{display:flex;height:22px;border-radius:5px;overflow:hidden;border:1px solid var(--grid)}.pstrip i{flex:1}
.vkey{display:flex;flex-wrap:wrap;gap:14px;font:600 12.5px "DM Sans",sans-serif;color:var(--muted);margin:-4px 0 14px}
.vkey i{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:5px;vertical-align:-1px}
.nores{display:none;padding:30px 0;font:16px "DM Sans",sans-serif;color:var(--muted)}
.access{margin:46px 0 10px;background:#1c1714;color:#f5f0e8;border-radius:14px;padding:30px 32px;display:grid;grid-template-columns:1.1fr 2fr;gap:30px;align-items:center}
.access h2{color:#f5f0e8;margin:0 0 8px}.access p{color:#e8dccb;margin:0;font-size:15.5px}
.access ol{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,1fr);gap:14px;counter-reset:s}
.access li{counter-increment:s;border-top:1px solid #4a3f37;padding-top:12px;font:14.5px/1.5 "DM Sans",sans-serif;color:#e8dccb}
.access li::before{content:"0" counter(s);display:block;font:500 26px "Source Serif 4",Georgia,serif;color:#E08A5E;margin-bottom:4px}
.access li b{color:#fff}
.access .rcta{margin-top:18px}.access .rcta .g{border-color:#e8dccb;color:#f5f0e8}
@media (max-width:1200px){.row.c5{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media (max-width:1000px){.row,.row.c5,.row.c3{grid-template-columns:repeat(2,minmax(0,1fr))}.paths{grid-template-columns:repeat(2,1fr)}}
@media (max-width:820px){.rh{grid-template-columns:1fr;gap:22px;margin-top:22px}.feat{aspect-ratio:4/3}.feat .ft strong{font-size:26px}
.row,.row.c5,.row.c3{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;gap:12px;margin:0 -16px;padding:0 16px 8px;scrollbar-width:none}
.row::-webkit-scrollbar{display:none}
.row .rk{flex:0 0 76%;scroll-snap-align:start}
.rstat{display:grid;grid-template-columns:repeat(4,1fr)}.rstat div{padding:12px 8px 12px 0;margin-right:8px}.rstat b{font-size:26px}.rstat span{font-size:11.5px;line-height:1.3;display:block}
.paths{grid-template-columns:1fr 1fr;gap:10px}.paths a{padding:13px 14px}.paths span{display:none}
.rbar{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none}.rbar::-webkit-scrollbar{display:none}.rbar .chips{flex-wrap:nowrap}.rbar button{white-space:nowrap}
.rbar input{min-width:170px}.shelf .sh{display:block}.shelf .sh p{margin-top:4px}
.access{grid-template-columns:1fr;padding:24px 20px}.access ol{grid-template-columns:1fr}}
@media (prefers-reduced-motion:reduce){.rk,.rk img,.feat img{transition:none}}
@media print{.rbar,.paths,.access{display:none}}
</style>'''

GROUPS = [
    ('global', 'Global & industry', 'Worldwide outlook, market numbers, marketing and the debates shaping fashion.', ['Global Trend Report', 'Market Data', 'Marketing Trends', 'Industry Watch']),
    ('core', 'Core item updates', 'Item by item: what to invest in, test, maintain and reduce, with each detail\'s status.', ['Core Item Update']),
    ('caps', 'Design capsules', 'Mood, colour with Pantone TCX codes, key pieces with reference photos, and India price guides.', ['Design Capsule']),
    ('india', 'India guides', 'Indian brands, colour and craft sourcing for the India market.', ['Brand Watch', 'Colour Forecast', 'Sourcing Guide']),
]
G_OF = {k: g for g, _, _, ks in GROUPS for k in ks}
SHORT = {'Global Trend Report': 'Global', 'Market Data': 'Market data', 'Marketing Trends': 'Marketing', 'Industry Watch': 'Industry', 'Brand Watch': 'Brand watch',
         'Core Item Update': 'Core item', 'Design Capsule': 'Capsule', 'Colour Forecast': 'Colour', 'Sourcing Guide': 'Sourcing'}


def rk(p):
    fn, title, desc, kind, img = p[:5]
    t = title.replace('Core Item Update: ', '').replace('Design Capsule: ', '')
    srch = E(f'{title} {desc} {kind}'.lower())
    return (f'<a class="rk" href="{fn}" data-g="{G_OF[kind]}" data-t="{srch}"><span class="ph"><img src="img/{img}.webp" alt="" loading="lazy" width="800" height="600">'
            f'<b class="tg">{E(SHORT[kind])}</b><b class="pd">Web + PDF</b></span>'
            f'<span class="bd"><strong>{E(t)}</strong><span class="ds">{E(desc)}</span>{EXTRA.get(fn, "")}<span class="go">Read report →</span></span></a>')


cards = [p for p in PAGES if p[3] in G_OF]
NT = len(cards)
cnt = {g: sum(1 for p in cards if G_OF[p[3]] == g) for g, *_ in GROUPS}
gtr = next(p for p in cards if p[0] == 'global-trend-report.html')

hub = HUB_CSS
hub += (f'<header class="rh"><div><p class="kicker">Reports · {NT} ready to use</p><h1>Forecut Reports</h1>'
        '<p class="lead">Trend research you can take straight into a design review, range plan or buying meeting: the global outlook, market and marketing data, item-by-item updates, design capsules, and colour and sourcing guides.</p>'
        f'<div class="rstat"><div><b>{NT}</b><span>reports</span></div><div><b>{cnt["global"]}</b><span>global &amp; industry</span></div><div><b>{NT - cnt["global"]}</b><span>India market</span></div><div><b>2</b><span>formats: web + PDF</span></div></div>'
        '<div class="rcta"><a class="p" href="#all">Browse all reports</a><a class="g" href="#access">How access works</a></div></div>'
        f'<a class="feat" href="{gtr[0]}"><img src="img/{gtr[4]}.webp" alt="" width="800" height="640"><span class="ft"><small>Featured report</small>'
        f'<strong>{E(gtr[1])}</strong><span>{E(gtr[2])}</span><em>Read the report →</em></span></a></header>')

PATHS = [('Designer', 'Plan a collection', 'Design capsules with mood, colour and key pieces.', '#caps'),
         ('Brand or buyer', 'Plan a range', 'Core item updates: invest, test, maintain, reduce.', '#core'),
         ('Marketing', 'Plan a campaign', 'The nine marketing trends for 2026.', 'fashion-marketing-trends-2026.html'),
         ('Sourcing', 'Find the fabric', 'India textile and craft sourcing guide.', 'india-textile-craft-guide.html')]
hub += '<nav class="paths" aria-label="Start with your job">' + ''.join(f'<a href="{h}"><small>{E(a)}</small><b>{E(b)}</b><span>{E(c)}</span></a>' for a, b, c, h in PATHS) + '</nav>'

hub += ('<div class="rbar" id="all"><div class="chips" role="group" aria-label="Filter reports">'
        f'<button type="button" data-f="all" aria-pressed="true">All<i>{NT}</i></button>'
        + ''.join(f'<button type="button" data-f="{g}" aria-pressed="false">{E(n)}<i>{cnt[g]}</i></button>' for g, n, *_ in GROUPS) +
        '</div><input type="search" id="rq" placeholder="Search reports, e.g. saree, colour" aria-label="Search reports"></div><p class="rcount" id="rcount" aria-live="polite"></p>')

KEY = '<div class="vkey"><span><i style="background:#047a45"></i>Invest</span><span><i style="background:#c2410c"></i>Test</span><span><i style="background:#d99a00"></i>Maintain</span><span><i style="background:#6d4fc2"></i>Reduce</span><span>· share of each item\'s details, Festive 26</span></div>'
for g, n, d, kinds in GROUPS:
    ps = [p for k in kinds for p in cards if p[3] == k]
    hub += (f'<section class="shelf" id="{g}" data-g="{g}"><div class="sh"><h2>{E(n)}</h2><p>{E(d)}</p></div>' + (KEY if g == 'core' else '') +
            f'<div class="row c{len(ps)}">{"".join(rk(p) for p in ps)}</div></section>')
hub += '<p class="nores" id="nores">No reports match. Try another word, or <a href="#all" data-reset>show all reports</a>.</p>'

hub += ('<section class="access" id="access"><div><h2>How access works</h2><p>Every report is a web page with a matching PDF.</p>'
        '<div class="rcta"><a class="p" href="account.html#signup">Sign in free</a><a class="g" href="index.html#pricing">See pricing</a></div></div>'
        '<ol><li><b>Read online.</b> Every report opens as a web page you can browse and search.</li>'
        '<li><b>Free trial until launch.</b> Signed-in members get the full trial, including PDF downloads, until 1 January 2027.</li>'
        '<li><b>From launch.</b> Reports are included in Student, Individual and Enterprise plans, or buy any single report for ₹299.</li></ol></section>')

hub += '''<script>(function(){
var bs=[].slice.call(document.querySelectorAll('.rbar button')),q=document.getElementById('rq'),cards=[].slice.call(document.querySelectorAll('.rk')),
sh=[].slice.call(document.querySelectorAll('.shelf')),out=document.getElementById('rcount'),nr=document.getElementById('nores'),f='all';
function run(){var w=(q.value||'').trim().toLowerCase(),n=0;
cards.forEach(function(c){var ok=(f==='all'||c.dataset.g===f)&&(!w||c.dataset.t.indexOf(w)>-1);c.hidden=!ok;if(ok)n++;});
sh.forEach(function(s){s.hidden=!s.querySelector('.rk:not([hidden])');});
out.textContent=(f==='all'&&!w)?'':n+' report'+(n===1?'':'s');nr.style.display=n?'none':'block';}
function set(v){f=v;bs.forEach(function(b){b.setAttribute('aria-pressed',b.dataset.f===v?'true':'false');});run();}
bs.forEach(function(b){b.addEventListener('click',function(){set(b.dataset.f);});});
q.addEventListener('input',run);
document.querySelectorAll('[data-reset]').forEach(function(a){a.addEventListener('click',function(){q.value='';set('all');});});
var h=location.hash.slice(1);if(['global','core','caps','india'].indexOf(h)>-1){/* deep links keep all shelves visible and just scroll */}
})();</script>'''
page('reports.html', 'Forecut Reports · Global and India fashion trend reports', hub)
