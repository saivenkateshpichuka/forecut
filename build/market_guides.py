"""Editorial guide sections for the India market hub, Pre-Fall 27 and Resort 27 pages (Oct 2026). Add only."""
CSS = ('<style>.mguide{max-width:860px;margin:48px auto 0}.mguide h2{font:700 clamp(24px,3vw,32px)/1.15 "DM Sans",system-ui,sans-serif;margin:0 0 12px}'
       '.mguide h3{font:700 19px/1.3 "DM Sans",system-ui,sans-serif;margin:26px 0 6px}.mguide p,.mguide li{font-size:16.5px;line-height:1.7}'
       '.mguide ul{padding-left:20px}.mguide .faq p{margin:0 0 12px}</style>')


def _faq(qs):
    return '<h3>Common questions</h3><div class="faq">' + ''.join(f'<p><b>{q}</b> {a}</p>' for q, a in qs) + '</div>'


INDIA = CSS + '''<section class="mguide" id="guide" aria-labelledby="ig"><span class="eyebrow">Market guide</span><h2 id="ig">How the Indian fashion market works</h2>
<p>India is one market inside Forecut's Asia region, but it runs on a calendar of its own. The international seasons (Spring/Summer and Autumn/Winter) still matter for western wear and export, while ethnic and occasion wear is planned around festivals and weddings. Forecut's India edits translate global trends into that calendar, and add the Indian categories that global reports usually leave out.</p>
<h3>The selling calendar</h3>
<ul><li><b>Summer (March to July):</b> cotton, linen and handloom kurtas, co-ord sets, light dresses and resortwear. Breathability and easy care lead.</li>
<li><b>Festive (August to December):</b> Raksha Bandhan, Onam, Navratri, Durga Puja and Diwali drive the biggest ethnic-wear purchases of the year. Colour, embellishment and gifting matter.</li>
<li><b>Weddings (roughly November to February, with a second window in spring):</b> bridal, groom and guest wear, from lehengas and sarees to sherwanis, bandhgalas and Indo-western looks.</li>
<li><b>Monsoon (June to September):</b> quick-dry fabrics, darker colours and practical footwear in many regions.</li></ul>
<h3>Climate shapes the product</h3>
<p>The north has hot summers and cold winters, so winter weddings support velvet, wool and layered looks. The south and coasts are warm and humid most of the year, so lighter silks, cottons and breathable linings sell year-round. A national range usually needs two weights of key styles, or region-specific edits.</p>
<h3>What Indian customers buy</h3>
<ul><li><b>Ethnic and fusion wear:</b> kurta sets, sarees, lehengas and co-ords, often mixed with western pieces.</li>
<li><b>Occasion wear for several events:</b> weddings often include mehendi, haldi, sangeet, ceremony and reception, each with its own look.</li>
<li><b>Craft with a story:</b> handloom, block prints and regional embroidery sold with provenance.</li>
<li><b>Value and speed:</b> fast-growing value fashion, D2C labels and quick-commerce delivery reward clear, trend-right product at sharp prices.</li></ul>
<h3>How global trends translate</h3>
<p>Global directions reach India adapted. The SS27 defined waist appears as peplum kurtas and structured blouses; sheer layering becomes organza dupattas and overlays; refined flats become juttis and Kolhapuris in new finishes. Forecut tracks both: the global stage of a detail and its Indian version, with indicative rupee price bands.</p>
<h3>How to use the India edits</h3>
<ul><li>Start with the open season (Festive 26) to see the format: 20 curated details, prices, offers and designer stories.</li>
<li>Compare with the global season pages to see which ideas are international and which are local.</li>
<li>Use the region page for Asia to compare India with China, Japan and Korea, Southeast Asia and the Gulf.</li></ul>
''' + _faq([
    ('When should brands plan festive collections?', 'Design and sampling usually happen in spring, with production in early summer, so stock is ready from August for the first festivals.'),
    ('Are Indian trends the same as global trends?', 'Some are shared (silhouettes, colours, fabrics), but Indian occasion wear has its own categories and calendar. Forecut shows both.'),
    ('Which price bands does Forecut use?', 'Indicative value, mid and premium bands in rupees for key garments, as planning estimates rather than live market prices.'),
]) + '<p><a href="region-asia.html">See the Asia region →</a> · <a href="method.html">How Forecut forecasts →</a></p></section>'


PREFALL = '''<section class="sec" id="guide"><h2>What Pre-Fall is, and why it matters</h2>
<p class="sub">A practical guide to the bridge season between summer and winter.</p>
<p>Pre-Fall collections are shown privately or in small presentations between December and January and reach stores from roughly May to July in the northern hemisphere. They arrive when summer stock is being marked down and before heavy winter pieces make sense, so they fill the gap with transitional clothing customers can wear immediately.</p>
<p>For many brands Pre-Fall is commercially important because it often stays on the shop floor for a long time at full price, from early summer into autumn. It is less about runway spectacle and more about wearable, sellable product: jackets, knits, trousers, dresses and accessories that work across temperatures.</p>
<h3>A typical Pre-Fall product mix</h3>
<ul class="infl"><li>Light outerwear: trench coats, shirt jackets, unlined blazers</li><li>Fine-gauge knits and cardigans for layering</li><li>Long-sleeve dresses in mid-weight fabrics</li><li>Tailored trousers in light wool or cotton blends</li><li>Loafers, ballet flats and ankle boots</li><li>Deeper versions of summer colours as a bridge to autumn</li></ul>
<h3>By hemisphere and climate</h3>
<p>In the southern hemisphere (Australia, New Zealand, South America and South Africa) the same transitional need comes around February to April, as summer turns to autumn. In hot climates, such as the Gulf, South and Southeast Asia and West Africa, Pre-Fall works best as lighter layers, deeper colour and early festive or occasion pieces rather than warm outerwear.</p>
<h3>Planning checklist</h3>
<ul class="infl"><li>Pick three or four bridge trends that already sell in SS27 and are still rising into AW27</li><li>Choose fabrics that work across temperatures: light wool, cotton twill, fine knits</li><li>Shift the palette one step deeper than summer</li><li>Plan deliveries to land as summer markdowns begin</li><li>Keep heavier coats for the main AW drop</li></ul>
<h3>Common questions</h3>
<p><b>When are Pre-Fall 2027 collections shown?</b> Mainly in December 2026 and January 2027. Forecut will update this page as collections are published.</p>
<p><b>Is Pre-Fall the same as Resort?</b> No. Resort (or Cruise) is shown in May and June and sells over winter; Pre-Fall is shown in winter and sells over summer.</p>
<p><b>Do smaller brands need a Pre-Fall drop?</b> Not a full collection. Many add a small transitional capsule between their summer and winter ranges.</p>
</section>'''


RESORT = '''<section class="sec" id="guide"><h2>What Resort (Cruise) is, and how it sells</h2>
<p class="sub">A practical guide to the season between Autumn/Winter and Spring/Summer.</p>
<p>Resort, also called Cruise, began as clothing for wealthy clients who travelled to warm destinations in the northern winter. Today it is a full commercial season. Collections are shown in May and June, often as destination shows in cities or locations chosen to tell a story, and arrive in stores from around November, staying through the early months of the new year.</p>
<p>Because Resort hangs in stores for a long time, it is one of the most important seasons commercially for many luxury and contemporary brands. It mixes warm-weather pieces for holidays with easy, wearable clothing that works in cities during winter, especially as layers.</p>
<h3>A typical Resort product mix</h3>
<ul class="infl"><li>Light dresses, kaftans and co-ord sets</li><li>Linen and cotton tailoring</li><li>Swimwear and cover-ups</li><li>Knits and light jackets for travel and cool evenings</li><li>Sandals, espadrilles and flat shoes</li><li>Bags, hats and jewellery for holiday dressing</li></ul>
<h3>By region</h3>
<p>For the southern hemisphere, Resort lands in the local summer, so it can be the main summer delivery in Australia, New Zealand, Brazil and South Africa. In the Gulf, the cooler months from November make it peak season for outdoor events, travel and festive gatherings. In India, Resort timing overlaps with the wedding season and winter-sun travel to Goa, Kerala and abroad, so light occasion pieces and holiday wear sell together. In Europe and North America it serves winter holidays and early spring.</p>
<h3>Planning checklist</h3>
<ul class="infl"><li>Separate true holiday pieces from city-wearable items, and balance both</li><li>Use breathable fabrics: linen, cotton voile, silk, light knits</li><li>Plan colour with sun and travel in mind: whites, sand, blues and bright accents</li><li>Time deliveries for your market's warm season or holiday peaks</li><li>Link to SS27 trends so Resort feels like an early preview of spring</li></ul>
<h3>Common questions</h3>
<p><b>Why is it called Cruise?</b> The name comes from clothing designed for winter cruises and travel to warm destinations.</p>
<p><b>When does Resort 2027 reach stores?</b> Generally from November 2026 to January 2027 in the northern hemisphere, which is the local summer in the southern hemisphere.</p>
<p><b>Is Resort only luxury?</b> No. Many high-street and contemporary brands now run holiday or resort capsules on the same timing.</p>
</section>'''
