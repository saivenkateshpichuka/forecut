"""Business pages for the header: What we do, Services (+ four audience pages), Resources. Run after build_v2."""
import html, os
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
BASE = 'https://forecut.in'
E = html.escape
GA = 'G-EHT7W1C07R'

CSS = r'''
.bz{--g:#1f3d33;--t:#a9481f;--c:#f5f0e8}
.bzh{padding:72px 0 64px;border-bottom:1px solid var(--ru)}
.bzh .w{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:64px;align-items:center}
.bzh .ey{font-size:14px;font-weight:600;color:var(--t);margin-bottom:18px}
.bzh h1{font-stretch:125%;font-weight:300;letter-spacing:-.025em;line-height:1.02;font-size:clamp(40px,5.4vw,72px);margin:0 0 22px}
.bzh .lead{max-width:30em}
.bzh .ct{display:flex;gap:14px;flex-wrap:wrap;margin-top:30px;align-items:center}
.bzh .ph{aspect-ratio:5/4;overflow:hidden;background:var(--c);position:relative}
.bzh .ph img{transition:transform 1.2s}.bzh .ph:hover img{transform:scale(1.03)}
.bzh .ph .cp{position:absolute;left:0;bottom:0;background:#fff;padding:12px 18px;font-size:13px;color:var(--gr);max-width:70%}
.bzs{padding:72px 0;border-bottom:1px solid var(--ru)}
.bzs.tint{background:var(--c)}
.bzs .hd2{display:grid;grid-template-columns:1fr 1.2fr;gap:56px;margin-bottom:44px;align-items:end}
.bzs h2{font-stretch:125%;font-weight:300;letter-spacing:-.02em;line-height:1.05;font-size:clamp(30px,3.6vw,46px);margin:0}
.bzs .hd2 p{color:var(--gr);font-size:18px;line-height:1.5;margin:0;max-width:34em}
.fx3{display:grid;grid-template-columns:repeat(3,1fr);gap:0;border-top:1px solid var(--ink)}
.fx3>a,.fx3>div{padding:26px 28px 30px 0;border-bottom:1px solid var(--ru);display:block}
.fx3>*+*{padding-left:28px;border-left:1px solid var(--ru)}
.fx3 h3{font-size:20px;font-weight:600;margin:0 0 8px;font-stretch:100%}
.fx3 p{margin:0;color:var(--gr);font-size:15px;line-height:1.55}
.fx3 .go{display:inline-block;margin-top:14px;font-weight:600;font-size:14px;color:var(--g);border-bottom:1.5px solid var(--t)}
.fx3>a:hover h3{color:var(--t)}
.bzf{list-style:none;margin:0;padding:0;border-top:1px solid var(--ink)}
.bzf li{display:grid;grid-template-columns:70px minmax(0,1fr) auto;gap:28px;padding:22px 0;border-bottom:1px solid var(--ru);align-items:baseline}
.bzf .n{font-stretch:125%;font-weight:300;font-size:30px;color:var(--g);line-height:1}
.bzf b{display:block;font-size:19px;font-weight:600;margin-bottom:3px}.bzf span.d{color:var(--gr);font-size:15px;line-height:1.5}
.bzf a.go{font-weight:600;font-size:14px;color:var(--g);border-bottom:1.5px solid var(--t);white-space:nowrap}
.tbl{width:100%;border-collapse:collapse;font-size:15px}.tbl th,.tbl td{padding:15px 16px 15px 0;text-align:left;border-bottom:1px solid var(--ru);vertical-align:top}
.tbl th{font-weight:600;color:var(--g);font-size:14px;border-bottom:1px solid var(--ink)}.tbl td:first-child{font-weight:600;width:22%}
.tbl .y{color:var(--sr);font-weight:700}.tbl .n{color:#b7aea5}
.aud{display:grid;grid-template-columns:repeat(2,1fr);gap:0;border-top:1px solid var(--ink)}
.aud a{display:grid;grid-template-columns:96px 1fr;gap:22px;padding:28px 28px 28px 0;border-bottom:1px solid var(--ru);align-items:start}
.aud a:nth-child(even){padding-left:28px;border-left:1px solid var(--ru)}
.aud .im{width:96px;height:120px;overflow:hidden;background:var(--c)}
.aud h3{font-size:24px;font-weight:300;font-stretch:125%;letter-spacing:-.01em;margin:0 0 8px}
.aud p{margin:0;color:var(--gr);font-size:15px;line-height:1.55}.aud .go{display:inline-block;margin-top:12px;font-weight:600;font-size:14px;color:var(--g);border-bottom:1.5px solid var(--t)}
.aud a:hover h3{color:var(--t)}
.faq details{border-bottom:1px solid var(--ru);padding:18px 0}.faq summary{cursor:pointer;font-weight:600;font-size:17px;list-style:none;display:flex;justify-content:space-between;gap:20px}
.faq summary::after{content:"+";color:var(--t);font-size:22px;line-height:1}.faq details[open] summary::after{content:"–"}.faq p{margin:12px 0 0;color:var(--gr);max-width:46em;line-height:1.6}
.bzc{background:var(--g);color:#fff;padding:64px 0}.bzc .w{display:flex;justify-content:space-between;align-items:center;gap:40px;flex-wrap:wrap}
.bzc h2{font-stretch:125%;font-weight:300;font-size:clamp(28px,3.2vw,40px);margin:0;letter-spacing:-.02em;max-width:18em}.bzc p{color:#c9d3cd;margin:10px 0 0}
.bzc .btn{background:var(--c);color:var(--g);border-color:var(--c)}
.split2{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center}
.split2 .ph{aspect-ratio:4/3;overflow:hidden;background:var(--c)}
.chk{list-style:none;margin:20px 0 0;padding:0}.chk li{padding:10px 0 10px 28px;position:relative;border-bottom:1px solid var(--ru);font-size:16px}.chk li::before{content:"";position:absolute;left:2px;top:17px;width:12px;height:7px;border-left:2px solid var(--t);border-bottom:2px solid var(--t);transform:rotate(-45deg)}
@media(max-width:900px){.bzh .w,.bzs .hd2,.split2{grid-template-columns:1fr;gap:28px}.bzh{padding:40px 0}.bzs{padding:44px 0}.fx3,.aud{grid-template-columns:1fr}.fx3>*+*,.aud a:nth-child(even){padding-left:0;border-left:0}.fx3>a,.fx3>div{padding-right:0}.bzf li{grid-template-columns:44px 1fr;gap:14px}.bzf a.go{grid-column:2}.tbl{display:block;overflow-x:auto}.aud a{grid-template-columns:72px 1fr;padding-right:0}.aud .im{width:72px;height:92px}}
'''


def shell(path, title, desc, body, img='hero-ss27'):
    url = BASE + '/' + path
    return (f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
            f'<title>{E(title)}</title><meta name="description" content="{E(desc)}"><meta name="robots" content="index,follow"><link rel="canonical" href="{url}">'
            f'<meta name="theme-color" content="#1f3d33"><link rel="icon" href="/favicon.ico" sizes="48x48"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><link rel="manifest" href="/site.webmanifest">'
            f'<meta property="og:type" content="website"><meta property="og:site_name" content="Forecut"><meta property="og:title" content="{E(title)}"><meta property="og:description" content="{E(desc)}"><meta property="og:url" content="{url}"><meta property="og:image" content="{BASE}/img/{img}.webp"><meta name="twitter:card" content="summary_large_image">'
            '<link rel="preload" href="/v2/archivo.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="/v2/forecut.css"><link rel="stylesheet" href="/biz.css">'
            "<script>try{if(localStorage.getItem('fc-in')==='1')document.documentElement.classList.add('fc-in')}catch(e){}</script>"
            '<script type="module" src="/auth.js"></script>'
            f'<script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments)}}gtag("js",new Date());gtag("config","{GA}");(function(){{var d=0;function go(){{if(d)return;d=1;var g=document.createElement("script");g.async=1;g.src="https://www.googletagmanager.com/gtag/js?id={GA}";document.head.appendChild(g)}}["scroll","pointerdown","keydown","touchstart"].forEach(function(e){{addEventListener(e,go,{{once:true,passive:true}})}});addEventListener("load",function(){{setTimeout(go,2500)}})}})();</script>'
            '</head><body class="bz"><!--fch--><!--/fch--><main id="main">' + body + '</main><!--fcf--><!--/fcf--></body></html>')


def hero(ey, h1, lead, img, cap, primary=('Sign up free', '/account.html#signup'), second=None):
    s = f'<a class="btn out-only" href="{primary[1]}">{primary[0]}</a><a class="btn in-only" href="/home.html">Open your dashboard</a>'
    if second:
        s += f'<a class="lk" href="{second[1]}">{second[0]}</a>'
    return (f'<section class="bzh"><div class="w"><div><p class="ey">{E(ey)}</p><h1>{E(h1)}</h1><p class="lead">{E(lead)}</p><div class="ct">{s}</div></div>'
            f'<div class="ph"><img src="/img/{img}.webp" alt="" fetchpriority="high"><span class="cp">{E(cap)}</span></div></div></section>')


def sec(h, p, inner, tint=False):
    return f'<section class="bzs{" tint" if tint else ""}"><div class="w"><div class="hd2"><h2>{E(h)}</h2><p>{E(p)}</p></div>{inner}</div></section>'


def feats(items):
    return '<div class="fx3">' + ''.join(f'<a href="{u}"><h3>{E(t)}</h3><p>{E(d)}</p><span class="go">{E(g)}</span></a>' for t, d, u, g in items) + '</div>'


def flow(items):
    return '<ol class="bzf">' + ''.join(f'<li><span class="n">{i + 1}</span><div><b>{E(t)}</b><span class="d">{E(d)}</span></div><a class="go" href="{u}">{E(g)}</a></li>' for i, (t, d, u, g) in enumerate(items)) + '</ol>'


def faq(items):
    return '<div class="faq">' + ''.join(f'<details><summary>{E(q)}</summary><p>{E(a)}</p></details>' for q, a in items) + '</div>'


def cta(h, p='Full reports, PDFs and every tool with one account.'):
    return (f'<section class="bzc"><div class="w"><div><h2>{E(h)}</h2><p>{E(p)}</p></div><a class="btn out-only" href="/account.html#signup">Sign up free</a>'
            '<a class="btn in-only" href="/home.html">Open your dashboard</a></div></section>')


PAGES = {}

# ------------------------------------------------------------------ services pages
SV = [
 ('designers', 'Designers', 'Know what to sketch next',
  'Season themes, colours with Pantone and HEX, and detail-level direction you can take straight into a tech pack.',
  'cover-ss27-womenswear', 'SS27 womenswear, from the forecast',
  [('Themes with mood boards', 'Each theme shows where it comes from, its colours, fabrics, silhouettes and key garments.', '/forecasts/ss27/c/themes.html', 'Read the SS27 themes'),
   ('Colour you can specify', 'Season palettes with Pantone TCX and HEX codes, colour combinations and where each colour sits in the range.', '/forecasts/ss27/c/colour.html', 'Open the colour forecast'),
   ('Details you can draw', 'Pop-up detail cards give flat sketches, spec notes and the stage of the trend in each season, with PDF and PNG download.', '/forecasts/ss27/c/silhouettes.html', 'Browse silhouettes')],
  [('Read the season', 'Start with the themes and the colour story for the season you are designing.', '/forecasts/ss27/', 'Open SS27'),
   ('Turn it into a brief', 'Pick themes and colours and build a mood, collection and accessory brief.', '/trend-to-style.html', 'Trend to Style Brief'),
   ('Draft the pattern', 'Block patterns, grading and a 3D fit check in one place.', '/pattern-maker.html', 'Garment Studio'),
   ('Test fabric and colour', 'Compare swatches and build fabric and colour stories.', '/swatchsmith.html', 'Swatchsmith'),
   ('Hand over to the factory', 'Build the tech pack with measurements, trims and construction notes.', '/tech-pack-builder.html', 'Tech Pack Builder')],
  [('Which seasons can I design from?', 'SS27 is the detailed next-season forecast. AW27 is an early outlook, and SS28 and AW28 are long-range outlooks that we update after each fair cycle.'),
   ('Can I download what I find?', 'Yes. Reports and detail cards download as PDF after you sign up, and detail cards also download as a PNG you can drop into a mood board.'),
   ('Are the sketches photographs of real garments?', 'No. Photographs and drawings on Forecut illustrate a direction. They are labelled as illustrations, and we do not use runway or brand photography.')]),
 ('brands', 'Brands and buyers', 'Plan the range by where each trend stands',
  'See what is emerging, rising, peaking or fading, season by season and market by market, before you commit to buys.',
  'cover-ss27-menswear', 'SS27 menswear, from the forecast',
  [('Four seasons ahead', 'SS27, AW27, SS28 and AW28, each marked emerging, rising, peaking or fading, so you know when to test and when to commit.', '/forecasts/', 'See all seasons'),
   ('Regional reading', 'Forecasts read for six regions, with what buyers want and when, plus festive and summer seasons in India.', '/regions.html', 'Open regional forecasts'),
   ('Updated after the fairs', 'Every forecast is checked against the January and summer fairs and updated. What we changed is listed on each season.', '/track-record.html', 'See our track record')],
  [('Find the direction', 'Read the season hub and the themes that matter for your customer.', '/forecasts/ss27/', 'Open SS27'),
   ('Check your market', 'Read the regional forecast for where you sell.', '/regions.html', 'Regions'),
   ('Plan the range', 'Lay out categories, styles and counts on a collection board.', '/rangeboard.html', 'Collection Planner'),
   ('Price it', 'Work out cost, margin and selling price per style.', '/pricefold.html', 'Price and Margin Calculator'),
   ('Check export rules', 'Look up duty, labels and documents for the markets you ship to.', '/export-market-checker.html', 'Export Market Checker')],
  [('Do you sell sales data?', 'No. Forecut reads runways, retail and fabric fairs and turns them into direction. We do not publish retailer sales figures, and we do not claim to know any brand\'s sales.'),
   ('Can my whole team use it?', 'Each person signs up with their own account. If your team is larger, write to hello@forecut.in and we will arrange access.'),
   ('How do I know how reliable a forecast is?', 'Each trend carries a stage and each season is rechecked after the fairs. Our track record page lists what we called and what happened.')]),
 ('fashion-schools', 'Fashion schools', 'Live forecasts for the studio and the classroom',
  'Give a whole batch current forecasts, colour and design tools for projects and portfolios, with one access code.',
  'cover-ss27-themes', 'SS27 themes, from the forecast',
  [('One code for a batch', 'Students sign up with the school code and get the same forecasts and tools. Write to us to set one up.', '/contact.html', 'Ask for a code'),
   ('Current, not archived', 'Four seasons, updated through the year, so a brief can use the season that is actually ahead.', '/forecasts/', 'See the seasons'),
   ('From mood to tech pack', 'Students can follow one idea from forecast to brief, pattern and tech pack inside the same tools.', '/tools.html', 'See the tools')],
  [('Set a brief from a season', 'Choose a season and a theme as the project starting point.', '/forecasts/ss27/c/themes.html', 'SS27 themes'),
   ('Research and moodboard', 'Students build a mood, collection and accessory board from the forecast.', '/trend-to-style.html', 'Trend to Style Brief'),
   ('Develop the garment', 'Patterns, grading and fit in Garment Studio.', '/pattern-maker.html', 'Garment Studio'),
   ('Track the project', 'A light tracker for dates and decisions on a studio project.', '/style-tracker.html', 'Style Tracker'),
   ('Present it', 'Build the tech pack for the final portfolio.', '/tech-pack-builder.html', 'Tech Pack Builder')],
  [('How does the school access code work?', 'You email hello@forecut.in with the school name and batch size. We set up a code that students enter when they sign up.'),
   ('Can students use the work in portfolios?', 'Students can use their own designs and exported tech packs. Forecut forecast text and images belong to Forecut, so credit them when you show them.'),
   ('Is there a cost?', 'Write to us with your batch size. We will tell you what applies for your school.')]),
 ('students', 'Students', 'Learn to read a forecast and build a collection from it',
  'Understand what emerging, rising and peaking mean, and follow a trend from mood board to tech pack.',
  'cover-ss27-colour', 'SS27 colour, from the forecast',
  [('Learn the method', 'How we read runways, retail and fabric fairs, and what each stage of a trend means.', '/method.html', 'Read our method'),
   ('Read a real forecast', 'Open a full season and see how themes, colour, fabrics and details connect.', '/forecasts/ss27/', 'Open SS27'),
   ('Practise with the tools', 'Build boards, patterns and tech packs for your project.', '/tools.html', 'See the tools')],
  [('Understand the stages', 'Emerging, rising, peaking and fading, in plain language.', '/method.html', 'How we forecast'),
   ('Pick a theme', 'Choose one theme and read its inspiration, colours and fabrics.', '/forecasts/ss27/c/themes.html', 'SS27 themes'),
   ('Make the board', 'Turn it into a mood, collection and accessory board.', '/trend-to-style.html', 'Trend to Style Brief'),
   ('Cost it like a brand', 'Price a style with fabric, trims and margin.', '/pricefold.html', 'Price and Margin Calculator'),
   ('Finish the pack', 'Complete a tech pack you can show in your portfolio.', '/tech-pack-builder.html', 'Tech Pack Builder')],
  [('Is it free for students?', 'You can join free and read the full reports. Tools are available to members until the end of the current offer; write to us if your school wants a batch code.'),
   ('Can I cite Forecut in my project?', 'Yes. Credit Forecut and the season, for example "Forecut SS27 forecast". Do not present forecast images as photographs of real products.'),
   ('Where do I start?', 'Open the SS27 forecast, read the themes, then pick one and build a board with Trend to Style Brief.')]),
]
for key, name, h1, lead, img, cap, f3, fl, fq in SV:
    body = (hero(name, h1, lead, img, cap, second=('See the SS27 forecast', '/forecasts/ss27/')) +
            sec('What you get', 'Everything below is part of one Forecut account.', feats(f3)) +
            sec('How ' + name.lower() + ' use it', 'A route through the forecast, in the order the work happens.', flow(fl), tint=True) +
            sec('Questions', 'Straight answers.', faq(fq)) +
            cta(f'Start with the {name.lower()} route'))
    PAGES[f'services/{key}.html'] = shell(f'services/{key}.html', f'Forecut for {name} | Fashion forecasts and design tools', lead, body, img)

# services index
aud = ''.join(f'<a href="/services/{k}.html"><span class="im"><img src="/img/{im}.webp" alt="" loading="lazy"></span><span><h3>{E(n)}</h3><p>{E(l)}</p><span class="go">See the {E(n.lower())} route</span></span></a>'
              for k, n, h1, l, im, c, *_ in SV)
rows = [('Seasonal forecasts', 'yyyy'), ('Colour with Pantone and HEX', 'yyyy'), ('Regional and India forecasts', 'nyny'), ('Design tools', 'yynn'), ('Collection and price planning', 'nynn'), ('Batch access code', 'nnyn'), ('PDF and PNG downloads', 'yyyy')]
tbl = '<table class="tbl"><thead><tr><th></th><th>Designers</th><th>Brands and buyers</th><th>Fashion schools</th><th>Students</th></tr></thead><tbody>' + ''.join(
    f'<tr><td>{n}</td>' + ''.join(f'<td class="{"y" if c == "y" else "n"}">{"Most used" if c == "y" else "Optional"}</td>' for c in v) + '</tr>' for n, v in rows) + '</tbody></table>'
body = (hero('Services', 'Forecasts and tools, shaped around how you work', 'Forecut gives designers, brands, schools and students the same live forecast, with a different route through it.', 'hero-ss27', 'The SS27 forecast', second=('Compare the routes', '#compare')) +
        sec('Choose your route', 'Every route uses the same forecasts. What changes is where you start and what you build.', f'<div class="aud">{aud}</div>') +
        f'<span id="compare"></span>' + sec('What each route uses most', 'Everything is in every account. This shows where each group usually spends its time.', tbl, tint=True) +
        cta('Not sure which route fits?', 'Write to hello@forecut.in and tell us what you are designing.'))
PAGES['services/index.html'] = shell('services/', 'Services | Forecut fashion forecasts and tools', 'Forecasts and design tools for designers, brands and buyers, fashion schools and students.', body)

# ------------------------------------------------------------------ what we do
body = (hero('What we do', 'We read the season so you design what sells next', 'Forecut reads runways, retail and fabric fairs, and turns them into seasonal forecasts, colour, regional reading and tools you can design from.', 'hero-ss27', 'The SS27 forecast', second=('How we forecast', '/method.html')) +
        sec('Seasonal forecasts', 'Four seasons ahead, each organised the same way so you always know where to look.', feats([
            ('Themes and mood boards', 'Trend stories that show where each idea comes from, with colours, fabrics, silhouettes and key garments.', '/forecasts/ss27/c/themes.html', 'Read the themes'),
            ('Colour and fabric', 'Palettes with Pantone TCX and HEX, colour combinations, fibres, weights and finishes.', '/forecasts/ss27/c/colour.html', 'Open colour'),
            ('Garments and details', 'Womenswear, menswear, footwear, trims and silhouettes, down to the detail card.', '/forecasts/ss27/', 'Open the SS27 hub')])) +
        sec('Regional and India forecasts', 'The same season, read for the market you sell in.', feats([
            ('Six regions', 'What buyers want and when, region by region.', '/regions.html', 'See regions'),
            ('India in depth', 'Festive and summer seasons, handloom and craft clusters.', '/india.html', 'India forecasts'),
            ('Colour library', 'Every season colour in one searchable place.', '/colour.html', 'Open the library')]), tint=True) +
        sec('Design tools', 'From the forecast to a tech pack, in the order the work happens.', feats([
            ('Plan and brief', 'Trend to Style Brief and Collection Planner turn a season into a range.', '/trend-to-style.html', 'Start a brief'),
            ('Develop and cost', 'Garment Studio, Textile Processing Studio, Price and Margin Calculator.', '/tools.html', 'See all tools'),
            ('Hand over', 'Tech Pack Builder and Fit QC Studio prepare factory-ready files.', '/tech-pack-builder.html', 'Build a tech pack')])) +
        sec('How we keep it honest', 'Every trend has a stage, and every forecast is rechecked.', flow([
            ('Read', 'Runways, retail and fabric fairs, across regions.', '/method.html', 'Method'),
            ('Stage', 'Each idea is marked emerging, rising, peaking or fading for each season.', '/method.html', 'Stages'),
            ('Validate', 'Seasons are rechecked after the January and summer fairs.', '/track-record.html', 'Track record'),
            ('Publish', 'Reports and PDFs, a monthly magazine and regional guides.', '/magazine/', 'Magazine')]), tint=True) +
        cta('See it on a real season', 'The SS27 forecast is open to read. Sign up for full reports and PDFs.'))
PAGES['what-we-do.html'] = shell('what-we-do.html', 'What we do | Forecut', 'Forecut turns runways, retail and fabric fairs into seasonal fashion forecasts, colour, regional reading and design tools.', body)

# ------------------------------------------------------------------ resources
RS = [('/insights.html', 'Insights', 'Articles and market news, written for people who make and buy clothes.'),
      ('/reports.html', 'Reports', 'Ready-to-use trend and market reports by season and audience.'),
      ('/magazine/', 'Monthly magazine', 'One issue each month: highlights, fashion news, business and the brand of the month.'),
      ('/journal.html', 'Journal', 'Analysis and practical guides.'),
      ('/method.html', 'Our method', 'How a forecast is built and what each stage means.'),
      ('/track-record.html', 'Track record', 'What we called, what happened and what we changed.'),
      ('/colour.html', 'Colour library', 'Season colours with Pantone TCX and HEX.'),
      ('/couture.html', 'Couture', 'Haute couture, bridal and bespoke.'),
      ('/fabrics.html', 'Fabrics', 'Fibres, weights and innovations.')]
cards = '<div class="fx3">' + ''.join(f'<a href="{u}"><h3>{E(t)}</h3><p>{E(d)}</p><span class="go">Open</span></a>' for u, t, d in RS) + '</div>'
body = (hero('Resources', 'Read, learn and download', 'Everything we publish beyond the seasonal forecast, in one place.', 'cover-ss27-fabrics', 'SS27 fabrics, from the forecast', second=('Search everything', '/search.html')) +
        sec('Everything we publish', 'Free to read. Reports and PDFs download after you sign up.', cards) +
        cta('Get each new issue and report', 'Sign up and the monthly magazine arrives in your inbox on the 1st.'))
PAGES['resources.html'] = shell('resources.html', 'Resources | Forecut', 'Insights, reports, the monthly magazine, journal, method and track record from Forecut.', body)

if __name__ == '__main__':
    open(os.path.join(ROOT, 'biz.css'), 'w').write(CSS)
    for p, h in PAGES.items():
        fp = os.path.join(ROOT, p)
        os.makedirs(os.path.dirname(fp), exist_ok=True)
        open(fp, 'w', encoding='utf-8').write(h)
    print('biz pages:', len(PAGES))
