"""One header and one footer for every Forecut page (v2, forecast hub, legacy and article pages).
chrome_inject.py swaps them in after every build; chrome.css / chrome.js style and run them."""
import json, os

B = os.path.dirname(os.path.abspath(__file__))
META = json.load(open(os.path.join(B, 'seasons.json')))['meta']
NEXT = 'ss27'
MARK = ('<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="2" y="2" width="28" height="28" rx="7" fill="#1f3d33"/>'
        '<path d="M10 23V9h12M10 16h8" stroke="#f5f0e8" stroke-width="3" fill="none" stroke-linecap="round"/>'
        '<path d="M22 18l3 3-3 3" stroke="#e0784b" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>')
MARK_L = MARK.replace('fill="#1f3d33"', 'fill="#f5f0e8"').replace('stroke="#f5f0e8"', 'stroke="#1f3d33"')
SEARCH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>'
ARROW = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h10M9 4l4 4-4 4"/></svg>'
CAT = [('themes', 'Themes', 'Trend stories with mood boards'), ('colour', 'Colour', 'Palettes with Pantone and HEX'), ('silhouettes', 'Silhouettes', 'Shapes and proportions'),
       ('fabrics', 'Fabrics and materials', 'Fibres, weights and finishes'), ('womenswear', 'Womenswear', 'Key garments and looks'), ('menswear', 'Menswear', 'Key garments and looks'),
       ('footwear', 'Footwear', 'Shapes, soles and materials'), ('trims', 'Trims and details', 'Buttons, zips and finishing')]
SEASONS = ['ss27', 'aw27', 'ss28', 'aw28']
SERVICES = [('/services/designers.html', 'Designers', 'Forecasts, colour and tools for your collection'),
            ('/services/brands.html', 'Brands and buyers', 'Range direction and buying decisions'),
            ('/services/fashion-schools.html', 'Fashion schools', 'Live forecasts for studio and classroom'),
            ('/services/students.html', 'Students', 'Research, colour and tools for projects'),
            ('/tools.html', 'Design tools', 'From collection plan to tech pack')]
RESOURCES = [('/insights.html', 'Insights', 'Articles and market news'), ('/reports.html', 'Reports', 'Ready-to-use trend and market reports'),
             ('/magazine/', 'Monthly magazine', 'One issue a month, read like a book'), ('/journal.html', 'Journal', 'Analysis and practical guides'),
             ('/method.html', 'Our method', 'How every forecast is built'), ('/track-record.html', 'Track record', 'What we called and what happened')]


def header():
    seas = ''.join(
        f'<a class="sr" href="/forecasts/{s}/"><b>{META[s]["code"]}</b><span>{META[s]["stage"]}<small>{META[s]["window"]}</small></span>{ARROW}</a>' for s in SEASONS)
    cats = ''.join(f'<a href="/forecasts/{NEXT}/c/{k}.html"><b>{t}</b><small>{d}</small></a>' for k, t, d in CAT)
    mega = ('<div class="pn mg"><div class="in2">'
            f'<div class="c1"><p class="h">Seasons</p>{seas}<a class="all" href="/forecasts/">All forecasts {ARROW}</a></div>'
            f'<div class="c2"><p class="h">Explore {META[NEXT]["code"]} by topic</p><div class="cg">{cats}</div></div>'
            f'<a class="c3" href="/forecasts/{NEXT}/"><span class="fi" style="background-image:url(/img/hero-ss27.webp)"></span><b>{META[NEXT]["code"]} forecast</b>'
            '<small>The waist returns, handcraft goes everyday and colour comes back in full.</small><em>Open the forecast</em></a>'
            '<div class="c4"><a href="/regions.html">Regional forecasts</a><a href="/india.html">India forecasts</a><a href="/colour.html">Colour library</a><a href="/method.html">How we forecast</a></div>'
            '</div></div>')

    def dd(items):
        return '<div class="pn sm">' + ''.join(f'<a href="{u}"><b>{t}</b><small>{d}</small></a>' for u, t, d in items) + '</div>'
    out = ('<li class="it out-only"><a class="tb" href="/what-we-do.html">What we do</a></li>'
           '<li class="it dd out-only"><a class="tb" href="/forecasts/" aria-haspopup="true">Forecasts</a>' + mega + '</li>'
           '<li class="it dd out-only"><a class="tb" href="/services/" aria-haspopup="true">Services</a>' + dd(SERVICES) + '</li>'
           '<li class="it out-only"><a class="tb" href="/about.html">About</a></li>'
           '<li class="it dd out-only"><a class="tb" href="/resources.html" aria-haspopup="true">Resources</a>' + dd(RESOURCES) + '</li>')
    inn = ('<li class="it in-only"><a class="tb" href="/home.html">Home</a></li>'
           '<li class="it dd in-only"><a class="tb" href="/forecasts/" aria-haspopup="true">Forecasts</a>' + mega + '</li>'
           '<li class="it in-only"><a class="tb" href="/insights.html">Insights</a></li>'
           '<li class="it in-only"><a class="tb" href="/tools.html">Tools</a></li>'
           '<li class="it in-only"><a class="tb" href="/magazine/">Magazine</a></li>'
           '<li class="it in-only"><a class="tb" href="/plm.html">PLM</a></li>')
    return ('<!--fch--><script>try{if(localStorage.getItem("fc-in")==="1")document.documentElement.classList.add("fc-in")}catch(e){}</script>'
            f'<header class="fch" id="fc-site"><div class="in"><a class="lg" href="/" aria-label="Forecut home">{MARK}<span>FORECUT</span></a>'
            f'<nav aria-label="Main"><ul class="nv">{out}{inn}</ul></nav>'
            f'<div class="rt"><a class="srch" href="/search.html" aria-label="Search Forecut">{SEARCH}</a>'
            '<a class="lgi out-only" href="/account.html#signin">Log in</a><a class="cta out-only" href="/account.html#signup">Sign up free</a>'
            '<a class="cta in-only" href="/home.html">Your dashboard</a><span id="fc-account-slot" class="in-only"></span></div></div></header><!--/fch-->')


def footer():
    def col(h, xs):
        return f'<div class="fc"><h4>{h}</h4>' + ''.join(f'<a href="{u}">{t}</a>' for t, u in xs) + '</div>'
    cols = [('Forecasts', [('All forecasts', '/forecasts/'), (f'{META[NEXT]["code"]} forecast', f'/forecasts/{NEXT}/'), ('Colour library', '/colour.html'), ('Regions', '/regions.html'), ('India', '/india.html')]),
            ('Services', [('Designers', '/services/designers.html'), ('Brands and buyers', '/services/brands.html'), ('Fashion schools', '/services/fashion-schools.html'), ('Students', '/services/students.html'), ('Design tools', '/tools.html')]),
            ('Company', [('What we do', '/what-we-do.html'), ('About Forecut', '/about.html'), ('Our method', '/method.html'), ('Track record', '/track-record.html'), ('Contact', '/contact.html')]),
            ('Resources', [('Insights', '/insights.html'), ('Monthly magazine', '/magazine/'), ('Reports', '/reports.html'), ('Journal', '/journal.html'), ('Couture', '/couture.html')])]
    return ('<!--fcf--><footer class="fcf"><div class="in"><div class="tp"><div class="fbd"><a class="lg" href="/" aria-label="Forecut home">' + MARK_L + '<span>FORECUT</span></a>'
            '<p>Seasonal fashion forecasts and design tools for designers, brands and fashion schools.</p><a class="em" href="mailto:hello@forecut.in">hello@forecut.in</a></div>' +
            ''.join(col(h, xs) for h, xs in cols) +
            '</div><div class="bt"><span>© 2026 Forecut</span><span class="lk"><a href="/privacy.html">Privacy</a><a href="/terms.html">Terms</a><a href="#" data-fb>Send feedback</a>'
            '<a href="https://www.instagram.com/forecut.in" rel="noopener">Instagram</a><a href="https://www.linkedin.com/company/forecut" rel="noopener">LinkedIn</a></span></div></div></footer><!--/fcf-->')
