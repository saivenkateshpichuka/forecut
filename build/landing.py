"""Landing-page sections built from the Forecut Brand Strategy and Marketing Strategy 2026-27 (Oct 2026).
Pricing ladder, launch offers and calls to action follow the strategy documents. Plans open 1 January 2027."""
import json, os, datetime as dt
from html import escape as E
import pantone as PT

LAUNCH = dt.date(2027, 1, 1)
LAUNCH_TXT = '1 January 2027'


def _sl(x):
    return ''.join(ch.lower() if ch.isalnum() else '-' for ch in x).strip('-').replace('--', '-').replace('--', '-')


M = json.load(open('details.json'))['model']
G = {it['name']: it for v in M.values() for it in v}
try:
    import india_data as _I
    N_INDIA = len(_I.D)
except Exception:
    N_INDIA = 0
N_DETAILS = sum(len(v) for v in M.values()) + N_INDIA
ST = {'e': ('emerge', 'Emerging'), 'r': ('rise', 'Rising'), 'p': ('peak', 'Peaking'), 'f': ('fade', 'Fading')}
POS = {'e': .16, 'r': .36, 'p': .55, 'f': .80}

# the signature: photo + lifecycle curve with a "now" dot + colour chip with its Pantone TCX code
HERO = [('Peplum blouses', ['peplum-blouses-photo'], '#2f6fe0', 'Luminous blue'),
        ('Asymmetric wrap closures', ['asymmetric-wrap-closures-ss27-photo', 'asymmetric-wrap-closures-photo'], '#ef6fa7', 'Pop pink'),
        ('Barrel-leg cargo jeans', ['barrel-leg-cargo-jeans-ss27-photo', 'barrel-leg-cargo-jeans-photo'], '#b57552', 'Clay')]


def _curve(stage):
    w, h = 300, 92
    x = 10 + POS[stage] * (w - 20)
    # bell curve y for x
    import math
    def y(px):
        t = (px - 10) / (w - 20)
        return h - 18 - (h - 34) * math.exp(-((t - .5) ** 2) / .045)
    pts = ' '.join(f'{px:.1f},{y(px):.1f}' for px in range(10, w - 9, 6))
    lab = ''.join(f'<text x="{10 + POS[k] * (w - 20):.0f}" y="{h - 2}" text-anchor="middle">{ST[k][1]}</text>' for k in 'erpf')
    return (f'<svg class="lcv" viewBox="0 0 {w} {h}" role="img" aria-label="Lifecycle: {ST[stage][1]} now">'
            f'<polyline points="{pts}" fill="none" stroke="currentColor" stroke-width="1.6" opacity=".55"/>'
            f'<line x1="{x:.1f}" x2="{x:.1f}" y1="8" y2="{h - 16}" stroke="currentColor" stroke-dasharray="2 3" opacity=".35"/>'
            f'<circle cx="{x:.1f}" cy="{y(x):.1f}" r="6" class="now"/><text x="{x + 9:.0f}" y="{y(x) - 8:.0f}" class="nowt">now</text>{lab}</svg>')


def hero_visual():
    cards = []
    for i, (n, imgs, hx, cname) in enumerate(HERO):
        it = G.get(n)
        im = next((c for c in imgs if os.path.exists(f'../img/{c}.webp')), None)
        if not it or not im:
            continue
        st = it['life'][1] if it['life'][1] in ST else 'r'
        code = PT.nearest(hx)[0]
        cards.append(f'<figure class="sig{" on" if not cards else ""}" data-i="{i}"><a href="ss27.html?q={_sl(n).replace("-", "+")}#list" aria-label="{E(n)}: open in the SS27 forecast">'
                     f'<img src="img/{im}.webp" alt="{E(n)}, SS27 forecast detail" width="800" height="800"{" fetchpriority=\"high\"" if not cards else " loading=\"lazy\""}></a>'
                     f'<figcaption><span class="sigk">SS27 · {E(ST[st][1])}</span><b>{E(n)}</b>{_curve(st)}'
                     f'<span class="chipc"><i style="background:{hx}"></i><span>{E(cname)}<small>{E(code)}</small></span></span></figcaption></figure>')
    dots = ''.join(f'<button type="button" aria-label="Show detail {k + 1}"{" aria-pressed=\"true\"" if k == 0 else " aria-pressed=\"false\""}></button>' for k in range(len(cards)))
    return f'<div class="sigw" aria-label="Forecast details">{"".join(cards)}<div class="sigdots">{dots}</div></div>'


def hero_proof():
    return (f'<ul class="proof"><li><b>{N_DETAILS:,}</b><span>details tracked</span></li><li><b>6</b><span>regions, 20 markets</span></li>'
            '<li><b>TCX</b><span>Pantone code on every colour</span></li><li><b>₹0</b><span>to start</span></li></ul>')


def launch_strip():
    days = (LAUNCH - dt.date.today()).days
    return f'''  <section class="launch" aria-label="Launch">
    <div class="lch"><span class="lchk">Launching {LAUNCH_TXT}</span>
      <p><b>Everything is free until launch.</b> The first 100 subscribers become <b>Founding Members</b>: full access for <b>₹999</b> in year one, locked in on renewal.</p></div>
    <div class="lcd" aria-live="polite"><b id="lcd">{max(days, 0)}</b><span>days to go</span></div>
    <a class="btn tc" href="#pricing">Become a founding member</a>
  </section>
'''


AUD = [
    ('d2c', 'D2C brands', 'Plan your next drop with data, not guesswork.', 'Forecasts with Pantone TCX codes your production team can use today.',
     ['Which styles and colours are Rising for your next drop', 'Colour stories with TCX codes for your dyeing unit', 'Regional timing for every market you sell in'], 'Individual or Enterprise', ('Sign in free', 'account.html#signup'), ('Get a free sample brief', 'mailto:hello@forecut.in?subject=Free%20sample%20brief')),
    ('exp', 'Exporters', 'Walk into every buyer meeting with what\'s next.', 'Core items, details and colours for SS27 and beyond, as downloadable PDFs.',
     ['Core Item Updates and season reports to share with buyers', 'Details to sample early, with photos and construction notes', 'Region pages for each buyer market'], 'Enterprise or a custom brief', ('Book a 15-minute demo', 'mailto:hello@forecut.in?subject=Forecut%20demo'), ('Request a custom brief', '#briefs')),
    ('des', 'Designers', 'Your next collection, one season ahead.', 'Colours, crafts and silhouettes from AW26 to AW28, plus Festive and Summer for India.',
     ['Couture, fabric and colour guides', 'Lifecycle stage on every detail', 'Downloadable detail cards for your mood boards'], 'Individual', ('Sign in free', 'account.html#signup'), ('Explore SS27', 'ss27.html')),
    ('stu', 'Students', 'Professional trend research for your projects.', 'Free to start. A photo and a Pantone TCX code for every detail.',
     ['Every season and region to research', 'Methodology you can cite', 'Student plan with a college ID'], 'Free or Student', ('Sign in free', 'account.html#signup'), ('See all details', 'search.html')),
    ('ins', 'Institutes', 'A trend library for your whole department.', 'Student and faculty access, priced for institutes.',
     ['Department-wide access for students and faculty', 'Guest lecture: how trend forecasting works', 'Free 30-day trial for your department'], 'Institute licence', ('Book a 15-minute demo', 'mailto:hello@forecut.in?subject=Institute%20licence'), ('See pricing', '#pricing')),
]


def audience():
    tabs = ''.join(f'<button type="button" role="tab" id="au-{k}" aria-controls="ap-{k}" aria-selected="{"true" if i == 0 else "false"}"{"" if i == 0 else " tabindex=\"-1\""}>{E(n)}</button>' for i, (k, n, *_ ) in enumerate(AUD))
    panes = ''
    for i, (k, n, head, sub, gets, plan, c1, c2) in enumerate(AUD):
        panes += (f'<div class="apane" role="tabpanel" id="ap-{k}" aria-labelledby="au-{k}"{"" if i == 0 else " hidden"}>'
                  f'<div><h3>{E(head)}</h3><p>{E(sub)}</p><a class="btn" href="{c1[1]}">{E(c1[0])}</a> <a class="btn ghost" href="{c2[1]}">{E(c2[0])}</a></div>'
                  f'<div class="aget"><small>What you get</small><ul>{"".join(f"<li>{E(g)}</li>" for g in gets)}</ul><p class="arec">Best plan: <b>{E(plan)}</b></p></div></div>')
    return f'''  <section id="foryou" aria-labelledby="fyh">
    <div class="sechead"><div><span class="mono eyebrow">Built for the job you do</span><h2 id="fyh">From "I hope this works" to "I know where this is going."</h2></div></div>
    <div class="atabs" role="tablist" aria-label="Who are you?">{tabs}</div>
    {panes}
  </section>
'''


def pricing():
    T = f'''  <section id="pricing" aria-labelledby="ph">
    <div class="sechead"><div><span class="mono eyebrow">Pricing · plans open {LAUNCH_TXT}</span><h2 id="ph">Free to start. Full access for ₹1,499 a year.</h2></div>
      <p>About ₹125 a month: less than a single sample run. Nothing is charged before {LAUNCH_TXT}; until then, everything is open.</p></div>
    <div class="ptabs" role="tablist" aria-label="Plan type">
      <button type="button" role="tab" id="pt-ind" aria-controls="pp-ind" aria-selected="true">For individuals</button>
      <button type="button" role="tab" id="pt-team" aria-controls="pp-team" aria-selected="false" tabindex="-1">For teams &amp; institutes</button>
      <button type="button" role="tab" id="pt-brief" aria-controls="pp-brief" aria-selected="false" tabindex="-1">Custom briefs</button>
    </div>
    <div class="fxbar"><label for="fxsel">Show approximate prices in</label><select id="fxsel"><option value="INR">₹ INR</option><option value="USD">US$ USD</option><option value="EUR">€ EUR</option><option value="GBP">£ GBP</option><option value="AED">AED</option></select><span>Rates of 20 Oct 2026, for guidance only</span></div>
    <div class="pp" role="tabpanel" id="pp-ind" aria-labelledby="pt-ind">
      <div class="billing" role="group" aria-label="Billing"><button type="button" data-b="y" aria-pressed="true">Yearly</button><button type="button" data-b="m" aria-pressed="false">Monthly</button></div>
      <div class="plans3">
        <div class="pl"><span class="plk">Free</span><h3>Free member</h3><div class="pr">₹0</div><span class="fx" data-inr="0"></span>
          <ul><li>Browse every season, region and the Journal</li><li>A monthly allowance of full detail cards</li><li>Lifecycle tracker and colour pages</li><li>Ads keep it free</li></ul>
          <a class="btn ghost" href="account.html#signup">Sign in free</a></div>
        <div class="pl"><span class="plk">With college ID</span><h3>Student</h3><div class="pr"><small>from</small> ₹499<small> / year</small></div><span class="fx" data-inr="499"></span>
          <ul><li>Everything in Individual for study</li><li>Every season, region and report</li><li>Cite-ready methodology</li><li>Verified with a college ID</li></ul>
          <a class="btn ghost" href="account.html#signup">Sign in free</a></div>
        <div class="pl feat"><span class="plk">Founding member · first 100</span><h3>Individual</h3>
          <div class="pr y"><s>₹1,499</s> ₹999<small> / first year</small></div><div class="pr m" hidden>₹199<small> / month</small></div>
          <span class="fx y" data-inr="999"></span><p class="plsub y">Then ₹1,499 a year, or keep ₹999 when you renew as a founding member.</p><p class="plsub m" hidden>Cancel any time. Yearly saves you more than 35%.</p>
          <ul><li>Full access to every season (AW26 to AW28), Resort, Pre-Fall and all six regions</li><li>India Festive and Summer reports</li><li>PDF downloads and detail cards as PNG or PDF</li><li>Pantone TCX on every colour</li><li>Ad-free, with monthly updates</li></ul>
          <a class="btn tc" href="#waitlist">Become a founding member</a></div>
      </div>
      <p class="fine">Single reports from ₹299 (Buy this report on any report page from launch).</p>
    </div>
    <div class="pp" role="tabpanel" id="pp-team" aria-labelledby="pt-team" hidden>
      <div class="plans2">
        <div class="pl feat"><span class="plk">Launch offer</span><h3>Enterprise</h3><div class="pr"><s>₹15,000</s> ₹9,999<small> / year</small></div><span class="fx" data-inr="9999"></span>
          <p class="plsub">For teams of 10 or more, one login each.</p>
          <ul><li>Everything in Individual for the whole team</li><li>Add users as you grow</li><li>Team onboarding</li><li>Priority support from hello@forecut.in</li></ul>
          <a class="btn tc" href="mailto:hello@forecut.in?subject=Forecut%20Enterprise">Book a 15-minute demo</a></div>
        <div class="pl"><span class="plk">Forecut Campus</span><h3>Institute licence</h3><div class="pr"><small>from</small> ₹15,000<small> / year</small></div><span class="fx" data-inr="15000"></span>
          <p class="plsub">Department-wide access for students and faculty.</p>
          <ul><li>Unlimited student and faculty access</li><li>Free 30-day trial for your department</li><li>Guest lecture: how trend forecasting works</li><li>Student ambassador programme</li></ul>
          <a class="btn ghost" href="mailto:hello@forecut.in?subject=Forecut%20institute%20licence">Book a 15-minute demo</a></div>
      </div>
    </div>
    <div class="pp" role="tabpanel" id="pp-brief" aria-labelledby="pt-brief" hidden>
      <div class="plans3" id="briefs">
        <div class="pl"><span class="plk">Forecut Briefs</span><h3>Starter</h3><div class="pr">₹10,000</div><span class="fx" data-inr="10000" data-once></span>
          <ul><li>One category, one season</li><li>10–12 key details</li><li>Colour story with TCX codes</li><li>8–10 page PDF, delivered in 5 working days</li></ul>
          <a class="btn ghost" href="mailto:hello@forecut.in?subject=Starter%20brief">Request a custom brief</a></div>
        <div class="pl feat"><span class="plk">Recommended</span><h3>Collection</h3><div class="pr">₹25,000</div><span class="fx" data-inr="25000" data-once></span>
          <ul><li>Up to 3 categories</li><li>Details, colours, fabrics and craft directions</li><li>20–25 pages</li><li>One revision call</li></ul>
          <a class="btn tc" href="mailto:hello@forecut.in?subject=Collection%20brief">Request a custom brief</a></div>
        <div class="pl"><span class="plk">Season-long</span><h3>Season partner</h3><div class="pr">₹50,000</div><span class="fx" data-inr="50000" data-once></span>
          <ul><li>Full season direction</li><li>Line-plan suggestions</li><li>Two review calls</li><li>Quarterly update</li></ul>
          <a class="btn ghost" href="mailto:hello@forecut.in?subject=Season%20partner%20brief">Request a custom brief</a></div>
      </div>
      <p class="fine"><b>Free sample brief:</b> a 3-page mini brief for the first 10 qualified brands. <a href="mailto:hello@forecut.in?subject=Free%20sample%20brief">Get a free sample brief</a>.</p>
    </div>
    <p class="fine">Prices are set in Indian rupees and start on {LAUNCH_TXT}; other currencies are approximate conversions. Secure payment by UPI and card at launch. Outside India? Write to <a href="mailto:hello@forecut.in?subject=Forecut%20pricing">hello@forecut.in</a> for pricing in your currency.</p>
  </section>
'''
    return T


FAQ = [
    ('When do paid plans start?', f'On {LAUNCH_TXT}. Until then, every season, region and report is open to everyone, free.'),
    ('What is a Founding Member?', 'The first 100 people to subscribe get full Individual access for ₹999 in year one instead of ₹1,499, and keep ₹999 when they renew. It is a launch badge, not a separate plan.'),
    ('What stays free after launch?', 'Browsing seasons, regions, the Journal and the lifecycle tracker, plus a monthly allowance of full detail cards when you sign in free.'),
    ('Can I pay monthly?', 'Yes: ₹199 a month for Individual. Yearly is cheaper, and Founding Member pricing is yearly.'),
    ('Is there a student price?', 'Yes, from ₹499 a year with a college ID. Institutes can licence Forecut for a whole department.'),
    ('What is a custom brief?', 'A trend brief made for your category and season, with details, colours and TCX codes, delivered as a PDF. Starter, Collection and Season partner packages start at ₹10,000.'),
    ('Do you work with brands outside India?', 'Yes. Forecut reads every season for six regions and 20 markets. Prices are set in rupees; write to us for pricing in your currency.'),
    ('How do you make your forecasts?', 'Public runway, trade and retail research, AI-assisted and editor-reviewed, written in our own words. Read <a href="method.html">how we forecast</a>.'),
]


def faq():
    return ('  <section id="faq" aria-labelledby="fqh"><div class="sechead"><div><span class="mono eyebrow">Questions</span><h2 id="fqh">Before you start.</h2></div>'
            '<p>Anything else? <a href="mailto:hello@forecut.in">hello@forecut.in</a>. We reply within 24 hours.</p></div><div class="faq">'
            + ''.join(f'<details><summary>{E(q)}</summary><p>{a}</p></details>' for q, a in FAQ) + '</div></section>\n')


def founding():
    return f'''  <section id="waitlist" aria-labelledby="jh">
    <div class="wait">
      <div>
        <span class="mono eyebrow" style="color:#f3b48e">Founding members · first 100</span>
        <h2 id="jh">Reserve ₹999 for your first year.</h2>
        <p>Plans open on {LAUNCH_TXT}. Leave your email and we will send your Founding Member link before anyone else, plus <b>The Forecut Edit</b>: three trends moving each week, every Monday. No spam; unsubscribe any time.</p>
        <ul class="wl"><li>Full access for ₹999 in year one</li><li>Keep ₹999 when you renew</li><li>Free until launch</li></ul>
      </div>
      <form id="wl" novalidate>
        <label for="email">Work email</label>
        <input id="email" name="email" type="email" placeholder="you@studio.com" autocomplete="email" required>
        <label for="role">I am a</label>
        <select id="role" name="role">
          <option>D2C or retail brand</option><option>Exporter or manufacturer</option><option>Fashion designer</option><option>Student</option><option>Institute or faculty</option><option>Buyer or merchandiser</option><option>Press or creator</option><option>Other</option>
        </select>
        <label for="fb">What would make Forecut most useful for you? (optional)</label>
        <textarea id="fb" name="fb" rows="3" placeholder="Your category, markets, or the season you are planning"></textarea>
        <button class="btn tc" type="submit">Become a founding member</button>
        <p class="formmsg" id="msg" role="status"></p>
      </form>
    </div>
  </section>
'''


JS = '''<script>(function(){
/* hero signature rotation */
var cs=[].slice.call(document.querySelectorAll('.sig')),ds=[].slice.call(document.querySelectorAll('.sigdots button')),i=0,red=matchMedia('(prefers-reduced-motion: reduce)').matches,tm;
function show(n){i=n;cs.forEach(function(c,k){c.classList.toggle('on',k===n);});ds.forEach(function(d,k){d.setAttribute('aria-pressed',k===n?'true':'false');});}
function run(){clearInterval(tm);if(!red&&cs.length>1)tm=setInterval(function(){show((i+1)%cs.length);},4500);}
ds.forEach(function(d,k){d.addEventListener('click',function(){show(k);run();});});run();
/* countdown */
var el=document.getElementById('lcd');if(el){var L=new Date('2027-01-01T00:00:00+05:30').getTime();var d=Math.max(0,Math.ceil((L-Date.now())/864e5));el.textContent=d;if(d===0){var p=el.closest('.launch');if(p)p.querySelector('.lchk').textContent='Plans are open';el.parentNode.hidden=true;}}
/* tabs (audience + pricing) */
document.querySelectorAll('[role=tablist]').forEach(function(g){var ts=[].slice.call(g.querySelectorAll('[role=tab]'));if(!ts.length||!document.getElementById(ts[0].getAttribute('aria-controls')))return;
 function sel(t){ts.forEach(function(x){var on=x===t;x.setAttribute('aria-selected',on?'true':'false');x.tabIndex=on?0:-1;var p=document.getElementById(x.getAttribute('aria-controls'));if(p)p.hidden=!on;});try{if(window.gtag)gtag('event','tab_select',{tab:t.id});}catch(e){}}
 ts.forEach(function(t,k){t.addEventListener('click',function(){sel(t);});t.addEventListener('keydown',function(e){var d=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;if(!d)return;var n=ts[(k+d+ts.length)%ts.length];sel(n);n.focus();});});});
/* yearly / monthly */
document.querySelectorAll('.billing button').forEach(function(b){b.addEventListener('click',function(){var m=b.getAttribute('data-b')==='m';document.querySelectorAll('.billing button').forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false');});
 document.querySelectorAll('.pl .y').forEach(function(e){e.hidden=m;});document.querySelectorAll('.pl .m').forEach(function(e){e.hidden=!m;});});});
/* links to #briefs open the briefs tab */
document.querySelectorAll('a[href="#briefs"]').forEach(function(a){a.addEventListener('click',function(){var t=document.getElementById('pt-brief');if(t)t.click();});});
})();</script>'''


CSS = '''
/* ===== Landing 2027: brand-book design (Source Serif 4 headlines, DM Sans body, thin lines, no gradients) ===== */
:root{--serif:"Source Serif 4",Georgia,"Times New Roman",serif;--terracotta:#e08a5e;--marigold:#e8b860;--sand:#e8dccb;--coffee:#3a2418}
h1,h2,.sechead h2,.hero h1,.hx h1{font-family:var(--serif)!important;font-weight:500!important;letter-spacing:-.015em!important}
.btn.tc{background:var(--terracotta)!important;color:#1c1714!important}
.btn.tc:hover{background:#d47a4c!important}
.hero.hx{box-shadow:none!important}
.hx h1{font-size:clamp(40px,5.4vw,72px)!important;line-height:1.02!important}
.hx .lede{font-size:18px}
.proof{list-style:none;margin:22px 0 0;padding:16px 0 0;border-top:1px solid var(--grid);display:grid;grid-template-columns:repeat(4,auto);gap:8px 24px;justify-content:start}
.proof b{display:block;font:500 26px/1 var(--serif);color:var(--ink)}.proof span{font-size:12.5px;color:var(--muted)}
.sigw{position:relative;max-width:420px;margin-left:auto;width:100%}
.apane[hidden],.pp[hidden],.pl [hidden]{display:none!important}
.fxbar select{width:auto!important}
.sig{margin:0;display:none;background:var(--paper);border:1px solid var(--grid);border-radius:4px;overflow:hidden}
.sig.on{display:block;animation:sigIn .6s ease both}
@keyframes sigIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
.hxs{height:auto!important;overflow:visible}
.sig img{display:block;width:100%;height:auto!important;aspect-ratio:5/4;object-fit:cover}
.sig figcaption{padding:14px 16px 16px;display:grid;gap:6px;border-top:1px solid var(--grid)}
.sigk{font:600 11px var(--mono);letter-spacing:.12em;text-transform:uppercase;color:var(--chalk)}
.sig b{font:500 24px/1.15 var(--serif)}
.lcv{width:100%;height:auto;color:var(--ink);font:600 9px var(--body);margin:2px 0}.lcv text{fill:var(--muted);letter-spacing:.05em;text-transform:uppercase}
.lcv .now{fill:var(--terracotta);stroke:var(--paper);stroke-width:2}.lcv .nowt{fill:var(--ink);font-weight:700;text-transform:none}
.chipc{display:flex;gap:10px;align-items:center;font-size:13.5px}.chipc i{width:34px;height:34px;border-radius:2px;border:1px solid var(--grid)}
.chipc small{display:block;font:600 11px var(--mono);color:var(--muted)}
.sigdots{display:flex;gap:8px;justify-content:center;margin-top:12px}
.sigdots button{width:26px;height:4px;border:0;padding:0;background:var(--grid);cursor:pointer}.sigdots button[aria-pressed="true"]{background:var(--ink)}
.launch{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:20px 28px;align-items:center;margin-top:28px;padding:22px 26px;background:#1c1714;color:#f5f0e8;border-radius:4px}
.launch p{margin:6px 0 0;color:#e8dccb;max-width:62ch}.launch b{color:#fff}
.lchk{font:600 12px var(--mono);letter-spacing:.14em;text-transform:uppercase;color:var(--terracotta)}
.lcd{text-align:center;border-left:1px solid #3a3330;padding-left:26px}.lcd b{display:block;font:500 44px/1 var(--serif);color:#fff}.lcd span{font-size:12px;color:#c9bcaa;text-transform:uppercase;letter-spacing:.1em}
.atabs,.ptabs{display:flex;gap:0;flex-wrap:wrap;border-bottom:1px solid var(--ink);margin-bottom:22px}
.atabs button,.ptabs button{font:600 15px var(--body);background:none;border:0;border-bottom:3px solid transparent;margin-bottom:-2px;padding:12px 18px;color:var(--muted);cursor:pointer}
.atabs button[aria-selected="true"],.ptabs button[aria-selected="true"]{color:var(--ink);border-bottom-color:var(--terracotta)}
.apane{display:grid;grid-template-columns:1.2fr 1fr;gap:32px;align-items:start}
.apane h3{font:500 clamp(26px,3vw,36px)/1.12 var(--serif);margin:0 0 10px}.apane p{color:var(--muted);font-size:17px;margin:0 0 18px;max-width:52ch}
.aget{border-left:1px solid var(--grid);padding-left:26px}.aget small{font:600 11px var(--mono);letter-spacing:.12em;text-transform:uppercase;color:var(--chalk)}
.aget ul{margin:10px 0 14px;padding-left:18px;line-height:1.7}.arec{font-size:14.5px!important;color:var(--ink)!important}
.billing{display:inline-flex;border:1px solid var(--ink);border-radius:999px;padding:3px;margin:0 0 18px}
.billing button{font:600 13.5px var(--body);border:0;background:none;padding:7px 16px;border-radius:999px;cursor:pointer;color:var(--ink)}
.billing button[aria-pressed="true"]{background:var(--ink);color:var(--paper)}
.plans3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0;border-top:1px solid var(--ink)}
.plans2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0;border-top:1px solid var(--ink)}
.pl{display:flex;flex-direction:column;gap:8px;padding:22px 22px 24px;border-right:1px solid var(--grid);border-bottom:1px solid var(--grid)}
.plans3 .pl:last-child,.plans2 .pl:last-child{border-right:0}
.pl.feat{background:var(--paper-2);box-shadow:inset 0 3px 0 var(--terracotta)}
.plk{font:600 11px var(--mono);letter-spacing:.1em;text-transform:uppercase;color:var(--chalk)}
.pl h3{font:500 26px var(--serif);margin:0}
.pr{font:500 38px/1.1 var(--serif)}.pr small{font:500 14px var(--body);color:var(--muted)}.pr s{font-size:20px;color:var(--muted);margin-right:6px}
.plsub{font-size:13.5px;color:var(--muted);margin:0}
.pl ul{margin:6px 0 14px;padding-left:18px;font-size:14.5px;line-height:1.6;flex:1}
.pl .btn{justify-content:center;margin-top:auto}
#pricing .fine{font-size:13px;color:var(--muted);margin-top:14px}
.faq{border-top:1px solid var(--ink)}
.faq details{border-bottom:1px solid var(--grid);padding:0 4px}
.faq summary{cursor:pointer;list-style:none;padding:18px 32px 18px 0;font:500 20px/1.3 var(--serif);position:relative}
.faq summary::-webkit-details-marker{display:none}
.faq summary::after{content:"+";position:absolute;right:4px;top:14px;font:400 26px var(--body);color:var(--chalk)}
.faq details[open] summary::after{content:"–"}
.faq p{margin:0 0 18px;color:var(--muted);max-width:72ch;font-size:16px}
.wait{background:#1c1714!important;border-radius:4px!important;box-shadow:none!important}
.wait h2,.wait p,.wait li{color:#f5f0e8!important}.wait p{color:#e8dccb!important}
.wl{margin:14px 0 0;padding-left:18px;line-height:1.8}
.wait label{color:#e8dccb!important}
.nwt,.nwt.emerge,.nwt.peak,.nwt.fade{background:var(--sand)!important}.nwt b{color:var(--coffee)!important}
.scard,.rcv,.rc,.nwc,.twj,.twc,.twcal,.spot,.card,.palc,.xp{box-shadow:none!important}
.scard:hover,.rcv:hover,.nwc:hover{transform:none!important}
@media (max-width:980px){.apane{grid-template-columns:1fr}.aget{border-left:0;padding-left:0;border-top:1px solid var(--grid);padding-top:16px}}
@media (max-width:900px){.plans3,.plans2{grid-template-columns:1fr}.pl{border-right:0}.launch{grid-template-columns:1fr auto}.launch .btn{grid-column:1/-1;justify-content:center}}
@media (max-width:760px){.proof{grid-template-columns:repeat(2,auto)}.sigw{margin:0 auto;max-width:360px}.hxs{display:block!important;height:auto!important}
 .atabs,.ptabs{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none}.atabs button,.ptabs button{white-space:nowrap;padding:10px 12px;font-size:14px}
 .launch{padding:18px}.lcd{padding-left:16px}.lcd b{font-size:34px}.faq summary{font-size:17px}}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .sig{background:var(--paper-2)}}
'''
