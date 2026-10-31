# Executed inside reports.py (shares page(), cover(), PAGES, E, CSS helpers).
# Four reports: Global Trend Report (Forecut data), Fashion Controversies, Brand competition statistics, Marketing strategy trends.
import json as _j
_M = _j.load(open('details.json'))['model']
_S = _j.load(open('seasons.json'))
_IMG = set(_j.load(open('images.json')))
WCSS = '''<style>
.wsec{margin-top:40px}.wsec h2{font:700 26px/1.2 "DM Sans",sans-serif;letter-spacing:-.015em;margin:0 0 6px}.wsec .sub{color:var(--muted);margin:0 0 16px}
.wcard{background:var(--paper-2);border:1px solid var(--grid);border-radius:12px;padding:18px 20px;margin-bottom:14px;break-inside:avoid}
.wcard h3{font:700 19px/1.3 "DM Sans",sans-serif;margin:0 0 4px}.wcard .meta{font:600 12px "DM Sans",sans-serif;letter-spacing:.06em;text-transform:uppercase;color:var(--chalk);margin:0 0 8px}
.wcard p,.wcard li{font-size:15.5px;line-height:1.6;margin:6px 0}.wcard .src{font:13px "DM Sans",sans-serif;color:var(--muted)}.wcard .src a{color:var(--muted)}
.lesson{border-left:3px solid var(--mat);padding:4px 0 4px 12px;margin-top:8px;font-family:"DM Sans",sans-serif!important;font-size:14.5px!important}
.tgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px}
.tcd{background:var(--paper-2);border:1px solid var(--grid);border-radius:12px;overflow:hidden;break-inside:avoid}.tcd .ph{aspect-ratio:1;background:var(--grid)}.tcd img{width:100%;height:100%;object-fit:cover;display:block}
.tcd .in{padding:10px 12px}.tcd b{display:block;font:700 15px/1.3 "DM Sans",sans-serif}.tcd small{font:13px "DM Sans",sans-serif;color:var(--muted)}
.chartw{background:var(--paper-2);border:1px solid var(--grid);border-radius:12px;padding:18px 20px;margin-bottom:14px}
.chartw h3{font:700 17px "DM Sans",sans-serif;margin:0 0 2px}.chartw p{font:13.5px "DM Sans",sans-serif;color:var(--muted);margin:0 0 10px}
.mtable{width:100%;border-collapse:collapse;font:14.5px/1.45 "DM Sans",sans-serif;background:var(--paper-2);border:1px solid var(--grid);border-radius:12px;overflow:hidden}
.mtable th,.mtable td{padding:9px 12px;text-align:left;border-bottom:1px solid var(--grid);vertical-align:top}.mtable th{font-size:11.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.kpis{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin-bottom:14px}.kpi{background:var(--paper-2);border:1px solid var(--grid);border-radius:12px;padding:14px 16px}
.kpi b{display:block;font:700 28px/1.1 "DM Sans",sans-serif;letter-spacing:-.02em}.kpi span{font:13.5px/1.4 "DM Sans",sans-serif;color:var(--muted)}
</style>'''
LC = {'e': 'Emerging', 'r': 'Rising', 'p': 'Peaking', 'f': 'Fading'}


def _src(lst): return '<p class="src">Sources: ' + ', '.join(f'<a href="{E(u)}" rel="noopener">{E(n)}</a>' for n, u in lst) + '</p>'


def _ph(name, s):
    sl = islug(name)
    for c in [sl + '-' + s + '-photo', sl + '-' + s, sl + '-photo', sl]:
        if c in _IMG or os.path.exists(f'../img/{c}.webp'): return f'<div class="ph"><img src="img/{c}.webp" alt="{E(name)}" loading="lazy" width="400" height="400"></div>'
    return '<div class="ph"></div>'


def wpage(fn, title, body): page(fn, title, WCSS + body)


# ---------------- 1. Global Trend Report (Forecut's own lifecycle data) ----------------
def _season_block(s):
    i = _S['seasons'].index(s); m = _S['meta'][s]
    rising, emerging, fading = [], [], []
    for k, items in _M.items():
        dept, cat = k.split('|')
        for it in items:
            c = it['life'][i] if i < len(it['life']) else '-'
            if c == '-': continue
            prev = it['life'][i - 1] if i > 0 else '-'
            row = (it['name'], dept, cat, it['note'])
            if c == 'r' and prev in 'e-': rising.append(row)
            elif c == 'e': emerging.append(row)
            elif c == 'f': fading.append(row)
    def _has(nm): return 'class="ph"><img' in _ph(nm, s)
    def cards(rows, n):
        rows = sorted(rows, key=lambda r: not _has(r[0]))
        seen, out = set(), []
        for r in rows:
            if r[2] in seen and len(out) < n: continue
            seen.add(r[2]); out.append(r)
            if len(out) >= n: break
        return '<div class="tgrid">' + ''.join(f'<div class="tcd">{_ph(r[0], s)}<div class="in"><b>{E(r[0])}</b><small>{E(r[1])} · {E(r[2])}</small></div></div>' for r in out) + '</div>'
    fl = ', '.join(sorted({r[0] for r in fading})[:14])
    return (f'<section class="wsec"><h2>{E(m["code"])} · {E(m.get("title", ""))}</h2><p class="sub">{len(rising)} details moving into Rising, {len(emerging)} Emerging and {len(fading)} Fading across womenswear, menswear and footwear.</p>'
            f'<h3 style="font:700 17px DM Sans,sans-serif;margin:14px 0 8px">Newly rising: invest</h3>{cards(rising, 8)}'
            f'<h3 style="font:700 17px DM Sans,sans-serif;margin:18px 0 8px">Emerging: test small</h3>{cards(emerging, 4)}'
            f'<div class="wcard" style="margin-top:14px"><div class="meta">Fading: reduce</div><p>{E(fl)}{"…" if len(fading) > 14 else ""}</p></div>'
            f'<p class="src">Palette: {E(", ".join(n for _, n in m["palette"]))}. <a href="{s}.html">See all {E(m["code"])} details →</a></p></section>')


tot = sum(len(v) for v in _M.values())
body = (cover('Global Trend Report · 2026–2028', 'Global Trend Report: what the world will wear next', f'Forecut\'s worldwide outlook for {len(_S["seasons"])} seasons, from AW26 to AW28: the details rising, emerging and fading across womenswear, menswear and footwear, from {tot} tracked details.', 'hero-ss27')
        + '<div class="kpis">' + ''.join(f'<div class="kpi"><b>{a}</b><span>{b}</span></div>' for a, b in [(str(tot), 'details tracked worldwide'), (str(len(_S['seasons'])), 'seasons forecast, AW26–AW28'), (str(len(_M)), 'categories across 3 departments'), ('4', 'lifecycle stages per detail')]) + '</div>'
        + ''.join(_season_block(s) for s in ['ss27', 'aw27', 'ss28'])
        + '<section class="wsec howto"><h2>How to use this report</h2><ul><li><b>Rising:</b> commit to development and broader ranges.</li><li><b>Emerging:</b> test in small capsules.</li><li><b>Peaking:</b> keep in core, avoid over-buying.</li><li><b>Fading:</b> clear stock and move on.</li></ul></section>'
        '<p class="note">Statuses are Forecut\'s forecast, built from public runway, retail and trade signals and refined monthly. AW27, SS28 and AW28 are long-range outlooks.</p>')
wpage('global-trend-report.html', 'Global Trend Report 2026–2028 · Forecut', body)
PAGES.append(('global-trend-report.html', 'Global Trend Report: what the world will wear next', 'Worldwide outlook from AW26 to AW28: newly rising, emerging and fading details across womenswear, menswear and footwear.', 'Global Trend Report', 'hero-ss27'))

# ---------------- 2. Fashion controversies ----------------
CONTRO = [
 ('Prada and the Kolhapuri chappal', 'Cultural credit · June 2025 – April 2026',
  ['At its Milan menswear show in June 2025, Prada showed open-toe leather sandals that closely resembled India\'s GI-tagged Kolhapuri chappals, without crediting their origin, prompting criticism in India.',
   'On 10 December 2025, Prada signed an agreement with the Maharashtra and Karnataka leather development corporations LIDCOM and LIDKAR for a project called "Prada Made in India x Inspired by Kolhapuri Chappals".',
   'On 27 April 2026, Prada announced the limited-edition collection, made by artisans in Maharashtra and Karnataka, with a fully funded three-year training programme for 180 artisans with NIFT and KILT.'],
  'Credit the origin of a craft from the start. Partnership with the communities behind it can turn criticism into a long-term story.',
  [('FashionUnited', 'https://fashionunited.uk/news/retail/prada-partners-with-indian-corporations-for-kolhapuri-chappal-project/2025121185303'), ('Prada Group', 'https://www.pradagroup.com/en/news-media/news-section/26-04-27-prada-kolhapuri.html')]),
 ('Shein in France', 'Regulation & retail · 2025 – 2026',
  ['French authorities investigated items sold on Shein\'s marketplace, including childlike sex dolls and weapons, and moved to suspend the platform as Shein opened its first physical store in Paris, at the BHV department store. Shein removed the items and banned such dolls globally.',
   'In June 2026 France fined Shein €22 million over product traceability, environmental labelling and delivery-time violations; reported French fines now exceed €210 million.',
   'In mid-June 2026 BHV ended the partnership; its outgoing CEO called it a "strategic error". Around 100 brands had left BHV after Shein arrived.'],
  'Retail partnerships carry reputational risk. Labelling, traceability and marketplace controls are now enforced, not optional.',
  [('EMARKETER', 'https://www.emarketer.com/content/shein-bhv-marais-partnership-ends-france'), ('ABC News / AP', 'https://6abc.com/post/france-moves-suspend-access-shein-platform-retailer-opens-first-store-paris/18117076/')]),
 ('AI-generated models in advertising', 'AI & creativity · August 2025',
  ['A Guess advertisement in the August 2025 issue of Vogue US used AI-generated models, disclosed in small print. Readers and creators criticised it widely, arguing it threatens jobs and the magazine\'s photographic heritage.',
   'Vogue said the ad came from its advertising department, not its editorial team.'],
  'Use AI openly and carefully. Audiences reward transparency and still value real people, photographers and models.',
  [('FashionNetwork', 'https://us.fashionnetwork.com/news/Vogue-us-faces-backlash-over-guess-ad-featuring-ai-generated-model%2C1754907.html')]),
 ('Adidas and the Oaxaca huarache', 'Cultural credit · 2025',
  ['Officials in the Mexican state of Oaxaca accused Adidas of copying traditional Zapotec huaraches for its Oaxaca Slip-On without permission or compensation, and threatened legal action.',
   'Adidas entered talks with local authorities and later issued a public apology.'],
  'Several countries now protect traditional designs legally. India\'s GI tags, such as Kolhapuri chappals, play a similar role.',
  [('nss magazine', 'https://www.nssmag.com/en/fashion/46219/cultural-appropriation-fashion-zara-2026')]),
 ('Greenwashing scepticism', 'Sustainability claims · 2026',
  ['Greenwashing has become a buying barrier: in one 2026 consumer survey cited by Shopify, 43% of shoppers named it as a reason they hesitate to buy from sustainable brands.',
   'Regulators are acting too: France\'s fines against Shein included environmental labelling breaches.'],
  'Make specific, provable claims (fibre, certification, origin) instead of vague "eco" language.',
  [('Shopify (citing Sustainable Jungle)', 'https://www.shopify.com/in/enterprise/blog/ecommerce-fashion-industry'), ('EMARKETER', 'https://www.emarketer.com/content/shein-bhv-marais-partnership-ends-france')]),
]
cc = ''.join(f'<article class="wcard"><div class="meta">{E(m)}</div><h3>{E(t)}</h3>' + ''.join(f'<p>{E(p)}</p>' for p in ps) + f'<p class="lesson"><b>Lesson for Indian brands:</b> {E(l)}</p>{_src(s)}</article>' for t, m, ps, l, s in CONTRO)
body = (cover('Industry Watch · 2025–2026', 'Fashion controversies: what went wrong and what brands learned', 'Cultural credit, regulation, AI and sustainability claims: the debates that shaped fashion over the past year, summarised neutrally from published sources, with lessons for Indian brands.', 'kolhapuri-chappals')
        + f'<section class="wsec"><h2>The cases</h2><p class="sub">Each case is summarised from the sources linked below it.</p>{cc}</section>'
        + '<section class="wsec howto"><h2>Five rules to avoid the next controversy</h2><ul><li>Credit the craft, community and region behind every heritage technique.</li><li>Partner with artisans instead of only borrowing their designs.</li><li>Disclose AI-generated imagery clearly.</li><li>Make only specific, provable sustainability claims.</li><li>Check retail and marketplace partners for compliance and reputation.</li></ul></section>'
        '<p class="note">This report summarises public reporting as of October 2026 for industry analysis. It does not make allegations beyond what the cited sources report.</p>')
wpage('fashion-controversies-2026.html', 'Fashion Controversies 2025–2026 · Forecut', body)
PAGES.append(('fashion-controversies-2026.html', 'Fashion controversies: what went wrong and what brands learned', 'Prada and the Kolhapuri chappal, Shein in France, AI models, Adidas in Oaxaca and greenwashing: the cases and the lessons.', 'Industry Watch', 'kolhapuri-chappals'))

# ---------------- 3. Brand competition statistics ----------------
GROW = [('Trent (Westside, Zudio)', 18.0, 'FY26, to Mar 2026'), ('Fast Retailing (Uniqlo)', 16.6, 'FY2026, to Aug 2026'), ('Aditya Birla Fashion', 11.0, 'FY26, to Mar 2026'), ('Shein', 8.0, '2025'), ('Inditex (Zara)', 3.2, 'FY2025, to Jan 2026')]


def _bars(rows):
    W, rh, lw, mx = 640, 34, 210, 20.0
    h = len(rows) * rh + 26
    g = [f'<line x1="{lw + (x / mx) * (W - lw - 60):.1f}" y1="0" x2="{lw + (x / mx) * (W - lw - 60):.1f}" y2="{h - 22}" stroke="var(--grid)" stroke-width="1"/><text x="{lw + (x / mx) * (W - lw - 60):.1f}" y="{h - 6}" font-size="11" fill="var(--muted)" text-anchor="middle">{x}%</text>' for x in (0, 5, 10, 15, 20)]
    for i, (n, v, per) in enumerate(rows):
        y = i * rh + 6; w = (v / mx) * (W - lw - 60)
        g.append(f'<g><title>{E(n)}: +{v}% revenue growth ({E(per)})</title><text x="{lw - 10}" y="{y + 17}" font-size="13" fill="var(--ink)" text-anchor="end">{E(n)}</text>'
                 f'<path d="M{lw} {y + 4} h{w - 4:.1f} a4 4 0 0 1 4 4 v12 a4 4 0 0 1 -4 4 h-{w - 4:.1f} z" fill="#1f3d33"/><text x="{lw + w + 6:.1f}" y="{y + 17}" font-size="13" font-weight="700" fill="var(--ink)">+{v}%</text></g>')
    return f'<svg viewBox="0 0 {W} {h}" width="100%" role="img" aria-label="Revenue growth by company" font-family="DM Sans, sans-serif">{"".join(g)}</svg>'


COMP = [
 ('Inditex (Zara)', 'Spain · FY2025 (Feb 2025 – Jan 2026)', 'Net sales €39.86 bn (about $46.3 bn), +3.2% (+7% at constant currency); net profit €6.22 bn, +5.8%.', [('FashionUnited', 'https://fashionunited.com/news/business/inditex-posts-6-22-billion-euro-profit-in-2025-and-3-19-percent-sales-growth/2026031171084')]),
 ('Shein', 'Global online · 2025', 'Revenue $41.85 bn, +8% (from +20.7% in 2024); net income $2.06 bn, −38.7%. Q1 2026: revenue $9.05 bn (+1.1%) and a net loss of $99 m.', [('Inside Retail', 'https://insideretail.co.nz/2026/07/28/a-us99m-loss-a-e3-toll-and-a-valuation-halved-inside-sheins-filing/')]),
 ('Fast Retailing (Uniqlo)', 'Japan · FY2026 (to Aug 2026)', 'Revenue ¥3.96 trillion (about $25 bn), +16.6%; operating profit ¥743.1 bn, +31.7%. Uniqlo International revenue ¥2.41 trillion, +26.2%.', [('FashionUnited', 'https://fashionunited.com/news/business/uniqlo-international-drives-fast-retailings-16-6-percent-revenue-growth-in-fy2026/2026100875091')]),
 ('H&M Group', 'Sweden · FY2025 (to Nov 2025)', 'Net sales about SEK 228.3 bn; operating profit about SEK 18.4 bn, up from SEK 17.3 bn.', [('Retail Gazette', 'https://www.retailgazette.co.uk/blog/2026/01/hm-lifts-profits-slower-sales')]),
 ('Trent (Westside, Zudio)', 'India · FY26 (to Mar 2026)', 'Revenue ₹19,701 crore, +18%. 963 Zudio stores (including 6 in the UAE, +198 in the year) and 300 Westside stores (+52); 1,286 stores in total.', [('Storyboard18', 'https://www.storyboard18.com/brand-marketing/trent-posts-double-digit-fy26-growth-on-rapid-zudio-expansion-ws-l-94283.htm')]),
 ('Aditya Birla Fashion & Retail', 'India · FY26 (to Mar 2026)', 'Revenue ₹8,177 crore, +11%; EBITDA ₹967 crore (11.8% margin); consolidated net loss ₹830 crore. 1,273 stores; Pantaloons 399 stores.', [('Apparel Resources', 'https://apparelresources.com/business-news/retail/abfrl-posts-11-revenue-growth-in-fy-26-expands-retail-network-to-1273-stores/')]),
]
QC = [('Myntra M-Now', 'Dark stores', '30 min – 2 hrs', '10+ cities, 90+ dark stores'), ('AJIO Rush (Reliance)', 'Store-fulfilled', '4 hrs (testing 2 hrs)', '600+ cities, 1,700+ stores'), ('Zilo', 'Dark stores + brand outlets', 'Under 60 min', 'Mumbai; $15.3 m Series A (Feb 2026)'), ('Slikk', 'Dark stores', 'Under 60 min', 'Bengaluru-led; $13.5 m raised'), ('KNOT', 'Dark stores', 'Under 60 min', 'Mumbai; $5 m (Dec 2025)')]
ctab = '<div class="tw"><table class="mtable"><thead><tr><th>Company</th><th>Period</th><th>Key figures</th><th>Source</th></tr></thead><tbody>' + ''.join(f'<tr><td><b>{E(a)}</b></td><td>{E(b)}</td><td>{E(c)}</td><td>' + ', '.join(f'<a href="{E(u)}" rel="noopener">{E(n)}</a>' for n, u in s) + '</td></tr>' for a, b, c, s in COMP) + '</tbody></table></div>'
qtab = '<div class="tw"><table class="mtable"><thead><tr><th>Player</th><th>Model</th><th>Delivery promise</th><th>Footprint / funding</th></tr></thead><tbody>' + ''.join(f'<tr><td><b>{E(a)}</b></td><td>{E(b)}</td><td>{E(c)}</td><td>{E(d)}</td></tr>' for a, b, c, d in QC) + '</tbody></table></div>'
body = (cover('Market Data · 2025–2026', 'Brand competition: the numbers behind fashion\'s biggest players', 'Latest annual results for global fast-fashion leaders and India\'s largest fashion retailers, plus the race to deliver fashion in under an hour.', 'linen-travel-suits-photo')
        + '<div class="kpis">' + ''.join(f'<div class="kpi"><b>{a}</b><span>{b}</span></div>' for a, b in [('€39.9 bn', 'Inditex net sales, FY2025'), ('$41.9 bn', 'Shein revenue, 2025'), ('₹19,701 cr', 'Trent revenue, FY26 (+18%)'), ('963', 'Zudio stores, Mar 2026')]) + '</div>'
        + f'<section class="wsec"><h2>Who is growing fastest</h2><p class="sub">Reported revenue growth in each company\'s latest full financial year. Periods differ, so compare direction rather than exact rank.</p><div class="chartw"><h3>Revenue growth, latest full year</h3><p>Percent change versus the previous year, as reported</p>{_bars(GROW)}</div></section>'
        + f'<section class="wsec"><h2>The results</h2><p class="sub">Figures as reported by each company or the cited coverage. Currency conversions are those given in the sources.</p>{ctab}</section>'
        + f'<section class="wsec"><h2>India\'s fashion delivery race</h2><p class="sub">Quick-commerce fashion players and their delivery promises, as reported in July 2026. India\'s quick-commerce sector is estimated at about $8.3 bn GMV in 2026.</p>{qtab}{_src([("Fynd (vendor blog, citing Inc42)", "https://www.fynd.com/blog/fashion-quick-commerce-in-india"), ("Indian Retailer", "https://www.indianretailer.com/news/myntra-brings-30-minute-fashion-delivery-tier-ii-cities-m-now")])}</section>'
        + '<section class="wsec howto"><h2>What this tells you</h2><ul><li>Value fashion is winning in India: Zudio added nearly 200 stores in a year.</li><li>Globally, Uniqlo is outgrowing Zara and Shein in percentage terms, while Shein\'s growth and profits have slowed.</li><li>Speed is the new battleground: fashion delivered in under an hour is spreading from metros to tier-II cities.</li><li>Scale is not profit: ABFRL grew revenue 11% but still reported a net loss.</li></ul></section>'
        + RG.WORLD.get('fashion-brand-competition-2026', '') + '<p class="note">Financial figures are summarised from the cited public sources as of October 2026 and may be restated by the companies. This is not investment advice.</p>')
wpage('fashion-brand-competition-2026.html', 'Fashion Brand Competition Statistics 2026 · Forecut', body)
PAGES.append(('fashion-brand-competition-2026.html', 'Brand competition: the numbers behind fashion\'s biggest players', 'Inditex, Shein, Uniqlo, H&M, Trent (Zudio) and ABFRL results, growth compared, and India\'s quick-commerce fashion race.', 'Market Data', 'linen-travel-suits-photo'))

# ---------------- 4. Marketing strategy trends ----------------
MKT = [
 ('Speed sells: quick-commerce fashion', 'Myntra\'s M-Now delivers in 30 minutes to 2 hours in 10+ cities; Reliance\'s AJIO Rush reaches 600+ cities from 1,700+ stores; start-ups like Zilo, Slikk and KNOT promise under an hour.', 'List your best-sellers on quick-commerce channels for festive and occasion "need it tonight" moments.', [('Fynd', 'https://www.fynd.com/blog/fashion-quick-commerce-in-india')]),
 ('Bharat is the growth market', 'Myntra reports that more than 70% of the new customers it onboarded in 2025 came from non-metro markets, and it is extending 30-minute delivery to cities such as Patna, Jaipur, Lucknow and Ahmedabad.', 'Plan regional-language content, tier-II sizing and pricing, and local festival calendars.', [('Indian Retailer', 'https://www.indianretailer.com/news/myntra-brings-30-minute-fashion-delivery-tier-ii-cities-m-now')]),
 ('AI search changes SEO', 'The State of Fashion 2026 report names AI as executives\' biggest opportunity and expects "generative engine optimisation" (being recommended by AI assistants) to become part of SEO. More than 35% of fashion executives already use generative AI for tasks such as copywriting and image creation.', 'Write clear, factual product pages and guides that AI assistants can understand and quote.', [('FashionUnited', 'https://fashionunited.uk/news/business/the-state-of-fashion-2026-turbulence-is-the-new-normal/2025111784921'), ('Shopify (citing McKinsey)', 'https://www.shopify.com/in/enterprise/blog/ecommerce-fashion-industry')]),
 ('Social commerce and creators', 'Social commerce is expected to reach about 15% of global e-commerce sales in 2026. Short video and creator content drive discovery.', 'Work with micro-creators in your niche and make every post shoppable.', [('Shopify (citing Statista)', 'https://www.shopify.com/in/enterprise/blog/ecommerce-fashion-industry')]),
 ('Craft and provenance as the story', 'India Couture Week 2026 collections credited their artisans, and Prada\'s Kolhapuri partnership shows the value (and the risk) of heritage craft.', 'Name the craft, region and makers in every campaign.', [('ETV Bharat', 'https://www.etvbharat.com/en/lifestyle/india-couture-week-2026-roundup-trends-pictures-enn26073102348'), ('Prada Group', 'https://www.pradagroup.com/en/news-media/news-section/26-04-27-prada-kolhapuri.html')]),
 ('Community and resale', 'Secondhand fashion is expected to grow two to three times faster than new through 2027, and 54% of Gen Z shoppers prefer brands that make them feel part of a community.', 'Build loyalty clubs, styling communities and take-back or resale programmes.', [('FashionUnited', 'https://fashionunited.uk/news/business/the-state-of-fashion-2026-turbulence-is-the-new-normal/2025111784921'), ('Shopify', 'https://www.shopify.com/in/enterprise/blog/ecommerce-fashion-industry')]),
 ('Cutting returns with better content', 'Apparel returns in India run at 25–35%, close to 40% in festive season. Virtual try-on is reported to make shoppers 50% more likely to buy.', 'Invest in fit guides, model diversity, size recommendations and try-on tools.', [('Fynd', 'https://www.fynd.com/blog/fashion-quick-commerce-in-india'), ('Shopify (citing DressX)', 'https://www.shopify.com/in/enterprise/blog/ecommerce-fashion-industry')]),
 ('Honest sustainability and AI', 'Greenwashing is a top buying barrier for 43% of shoppers in one survey, and AI-generated models have drawn public backlash.', 'Make provable claims and disclose AI imagery.', [('Shopify', 'https://www.shopify.com/in/enterprise/blog/ecommerce-fashion-industry'), ('FashionNetwork', 'https://us.fashionnetwork.com/news/Vogue-us-faces-backlash-over-guess-ad-featuring-ai-generated-model%2C1754907.html')]),
 ('Price pressure', '71% of executives expect to raise prices, up from 52%, as tariffs and sourcing costs bite.', 'Protect value perception with clear quality stories and good-better-best ranges.', [('FashionUnited', 'https://fashionunited.uk/news/business/the-state-of-fashion-2026-turbulence-is-the-new-normal/2025111784921')]),
]
mc = ''.join(f'<article class="wcard"><div class="meta">Trend {i + 1:02d}</div><h3>{E(t)}</h3><p>{E(w)}</p><p class="lesson"><b>What to do:</b> {E(d)}</p>{_src(s)}</article>' for i, (t, w, d, s) in enumerate(MKT))
body = (cover('Marketing Trends · 2026', 'Fashion marketing strategy trends for 2026', 'Nine shifts in how fashion brands reach and convert customers, from 30-minute delivery and AI search to creators, craft storytelling and community, with what Indian brands should do about each.', 'packable-technical-shells-photo')
        + '<div class="kpis">' + ''.join(f'<div class="kpi"><b>{a}</b><span>{b}</span></div>' for a, b in [('70%+', 'of Myntra\'s new 2025 customers from non-metros'), ('~15%', 'of e-commerce via social commerce, 2026'), ('35%+', 'of fashion executives using generative AI'), ('25–35%', 'apparel return rates in India')]) + '</div>'
        + f'<section class="wsec"><h2>The nine trends</h2><p class="sub">Each with the evidence, sources and a practical action.</p>{mc}</section>'
        '<p class="note">Statistics are quoted from the cited sources, some of which summarise third-party research; check the originals before using them in investment or budgeting decisions.</p>')
wpage('fashion-marketing-trends-2026.html', 'Fashion Marketing Strategy Trends 2026 · Forecut', body)
PAGES.append(('fashion-marketing-trends-2026.html', 'Fashion marketing strategy trends for 2026', 'Quick-commerce fashion, Bharat growth, AI search, creators, craft storytelling, community, returns and pricing: nine trends and what to do.', 'Marketing Trends', 'packable-technical-shells-photo'))
