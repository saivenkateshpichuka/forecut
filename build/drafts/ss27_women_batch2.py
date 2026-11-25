"""SS27 Women, second batch (25 Nov 2026): colour palettes and stories, knit fabrics, trims, styling, couture,
business strategy and innovations. Writes content/reports/*.json. Claims come from the listed sources or are labelled
as Forecut's assessment."""
import json, os

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'content', 'reports')

S = {
 'fu': {'title': 'SS27 womenswear trends: the key looks from New York, London, Milan and Paris fashion weeks', 'publisher': 'FashionUnited (AFP)', 'url': 'https://fashionunited.com/news/fashion/ss27-womenswear-trends-the-key-looks-from-new-york-london-milan-and-paris-fashion-weeks/2026100775061', 'date': '7 October 2026'},
 'tf': {'title': 'Spring 2027 womenswear trends from the runways (SS27), T-Fashion Runway Index', 'publisher': 'T-Fashion', 'url': 'https://tfashion.ai/runway/ss27', 'date': 'data as of 18 October 2026', 'note': 'Share of looks across 12,320 looks from 359 designers, compared with SS26'},
 'wp': {'title': 'The defining trends and takeaways from the S/S 2027 shows', 'publisher': 'Wallpaper*', 'url': 'https://www.wallpaper.com/fashion-beauty/fashion-week-trends-spring-summer-2027', 'date': 'October 2026'},
 'wr': {'title': 'Spring/Summer 2027 trends: 10 ideas from Milan and Paris', 'publisher': 'Wordrobe', 'url': 'https://wordrobeshop.com/en/spring-summer-2027-trends-milan-paris/', 'date': 'October 2026'},
 'ph': {'title': 'Spring/Summer 2027 fashion trends from the runways', 'publisher': 'Pham Fashion House', 'url': 'https://www.phamfashion.com/blog/spring-summer-2027-fashion-trends-runway', 'date': 'November 2026', 'note': 'Manufacturer commentary; runway observations and production notes only'},
 'pvf': {'title': 'Spring-Summer 27 Decodings: Fabrics', 'publisher': 'Premiere Vision', 'url': 'https://www.premierevision.com/articles/e620fe9e-3407-f111-8333-000d3a2973d4/spring-summer-27-decodings-fabrics', 'date': '13 February 2026'},
 'pvt': {'title': 'Decoding Spring-Summer 27 key transversal highlights', 'publisher': 'Premiere Vision', 'url': 'https://www.premierevision.com/articles/86fffb89-9602-f111-8333-000d3a2973d4/decoding-spring-summer-27-key-transversal-highlights', 'date': '5 February 2026'},
 'pvd': {'title': 'Spring-Summer 27 Decodings: Decoration', 'publisher': 'Premiere Vision', 'url': 'https://www.premierevision.com/articles/fd62f60f-4c07-f111-8333-000d3a2973d4/spring-summer-27-decodings-decoration', 'date': 'February 2026'},
 'gr': {'title': 'Goodbye plain knits: five unexpected sweater trends', 'publisher': 'Grazia (citing Elle)', 'url': 'https://graziamagazine.com/us/?p=118537', 'date': 'autumn 2026'},
 'cf': {'title': 'Forecut SS27 colour forecast: method and sources', 'publisher': 'Forecut', 'url': 'https://forecut.in/forecasts/ss27/colours/colour-forecast/', 'date': 'November 2026', 'note': 'Built from Refinery29, T-Fashion colour shares, The Impression and Premiere Vision key colours'},
 'nap': {'title': '5 trends we spotted on the Cannes red carpet', 'publisher': 'NET-A-PORTER, Porter', 'url': 'https://www.net-a-porter.com/en-gb/porter/article-0c53a186fd183827/fashion/art-of-style/cannes-film-festival-2026', 'date': 'May 2026'},
 'ap': {'title': 'Bare skin, fantasy and the machine: 3 takeaways from Paris\' starry couture week', 'publisher': 'Associated Press', 'url': 'https://www.clickondetroit.com/entertainment/2026/07/09/bare-skin-fantasy-and-the-machine-3-takeaways-from-paris-starry-couture-week/', 'date': '9 July 2026'},
 'zoe': {'title': 'The fall 2026 couture season was filled with show-stopping moments', 'publisher': 'The Zoe Report', 'url': 'https://www.thezoereport.com/fashion/paris-couture-week-fall-2026', 'date': 'July 2026'},
 'fu27': {'title': 'Fashion: 2027, the year growth will finally have to be profitable', 'publisher': 'FashionUnited', 'url': 'https://fashionunited.com/news/business/fashion-2027-the-year-growth-will-finally-have-to-be-profitable/2026111875626', 'date': '18 November 2026'},
 'mck': {'title': 'What to expect in the global fashion industry in 2026', 'publisher': 'McKinsey & Company', 'url': 'https://www.mckinsey.com/industries/retail/our-insights/what-to-expect-in-the-global-fashion-industry-in-2026', 'date': '2025'},
 'mc': {'title': 'Copenhagen Fashion Week spring 2027 trends', 'publisher': 'Marie Claire', 'url': 'https://www.marieclaire.com/fashion/copenhagen-fashion-week-trends-spring-2027/', 'date': 'August 2026'},
}


def src(*k):
    return [S[x] for x in k]


def ref(n):
    return f'<sup>[{n}]</sup>'


LIC = 'Forecut image. Tool and licence terms to be confirmed by the owner.'


def img(file, caption, d):
    return {'file': file, 'caption': caption + ' Forecut visual, not a runway photograph.', 'credit': 'Forecut',
            'provenance': f'Created for Forecut and supplied through the Forecut image upload on {d}. Illustrative, not a runway photograph.', 'licence': LIC}


C = {'season': 'ss27', 'audience': 'women', 'status': 'published', 'published': '2026-11-25',
     'research_period': 'Shows 10 September to 6 October 2026; Haute Couture, July 2026; Premiere Vision Paris, February 2026; analysis October to November 2026',
     'markets': 'Global: New York, London, Milan, Paris and Copenhagen runways; premium and mid-market womenswear'}
R = []

# ---------------------------------------------------------------- Theme Colour Palettes
R.append(dict(C, kind='report', category='colours', subsection='theme-colour-palettes', slug='theme-colour-palettes-report',
  title="SS27 Women's Theme Colour Palettes",
  summary='A working palette for each SS27 women\'s theme: the lead and accent colours, how much of each to use, and which products carry them.',
  sections=[
   {'heading': 'How to read the palettes', 'body': 'Each theme has a lead colour (the largest area of the look), an accent (used in small doses) and one or two colours from the SS27 womenswear palette that connect the theme to the rest of the range. Pantone TCX codes are the nearest published match to each colour; confirm against a physical Pantone book before dyeing. The themes themselves are described on their own pages under SS27 Women\'s Themes.'},
   {'heading': 'Palettes by theme', 'body': '''| Theme | Lead colour | Accent | Range colours | Carried by |
|---|---|---|---|---|
| One-Layer Summer | Optic white, 11-0602 TCX, #F2F0EB | Butter, 12-0711 TCX, #F6E199 | Lilac 15-3720 TCX | Sheer suits, organza skirts, fine knits |
| Lingerie as Outerwear | Black | Violet, 19-3642 TCX, #603F83 | Optic white, true red 18-1763 TCX | Slip skirts, camisoles, bra tops, lace trims |
| The Waist Returns | Strong blue, nearest 18-4048 TCX, #2F5FC0 | Pale blue, nearest 13-3920 TCX, #CFE0FF | Optic white, Klein blue 18-3949 TCX | Peplum jackets, basque-waist dresses, bubble hems |
| Handcraft | Amber brown, nearest 17-1147 TCX, #A8623F | Cream pink, nearest 11-1306 TCX, #F6E2D4 | Sand 13-1009 TCX | Lace, smocking and embroidery on poplin and knits |
| Undone | Warm grey, nearest 17-0610 TCX, #8F897C | Off-white, nearest 11-0608 TCX, #F2EFE8 | Sand 13-1009 TCX | Raw-edge muslin, slip straps, unfinished hems |
| In Motion | Burnt orange, nearest 16-1448 TCX, #D4651F | Pale apricot, nearest 12-1009 TCX, #FFE1C9 | Butter 12-0711 TCX | Fringe, stripes, swing skirts |
| Elegant Ease | Deep green, nearest 17-6333 TCX, #4F7A3C | Pale green, nearest 12-5404 TCX, #E4F0DA | Optic white | Slim ties, mules, pointed flats, soft tailoring |
| Reworked Denim | Deep indigo, nearest 19-4057 TCX, #24446F | Washed blue, nearest 13-3920 TCX, #C9D8EF | Optic white | Denim suits, cut-offs, coated denim |'''},
   {'heading': 'Why these palettes', 'body': f'''The two new SS27 women's themes follow the runway colour evidence directly: white rose from 23.7% to 28.4% of SS27 looks and black stayed the most worn colour at 35.2%{ref(1)}, which gives One-Layer Summer its white base and Lingerie as Outerwear its black base. Purple is the season's new colour, from Chanel's lilac to Miu Miu's royal purple{ref(2)}, so violet becomes the lingerie theme's accent. Butter is one of the soft, calming shades named on the runways{ref(3)}.

The six earlier SS27 themes keep the colours they were published with. Their nearest Pantone codes are listed so that they can be lab-dipped alongside the new palette.'''},
  ],
  design_implications='''- Use the lead colour on at least half of the look; keep the accent to one piece or one detail.
- Theme palettes share colours on purpose (optic white, sand, butter), so pieces from different themes can be sold together.
- Approve one physical standard per colour before sampling, especially whites and lilac, which shift between fibres.''',
  commercial_implications='''- Put depth into the lead colours of the two new themes (optic white, black) and keep accent colours as smaller buys.
- Plan floor and online stories by theme, so the customer sees a complete palette in one place.
- Carry-over colours from the earlier SS27 themes (sand, off-white) reduce dye-lot risk across deliveries.''',
  sources=src('tf', 'ph', 'fu', 'cf'),
  images=[],
  related=['fc-ss27-women-colours-season-colour-analysis', 'fc-ss27-women-themes-one-layer-summer', 'fc-ss27-women-themes-lingerie-as-outerwear'],
))

# ---------------------------------------------------------------- Colour Stories
R.append(dict(C, kind='report', category='colours', subsection='colour-stories', slug='colour-stories-report',
  title="SS27 Women's Colour Stories",
  summary='Four colour stories for the SS27 womenswear range: Purple Reign for dresses and knits, Full Colour for statement tailoring, Sun-Faded for linen and shirting, and Living Green for swim and summer knits.',
  sections=[
   {'heading': 'Purple Reign', 'body': f'''**Lilac 15-3720 TCX, violet 19-3642 TCX, butter 12-0711 TCX, optic white 11-0602 TCX.**

The lead story for women. Lilac appeared at Chanel, royal purple at Miu Miu and violet across Milan{ref(1)}; on the red carpet, Demi Moore wore custom red and lilac Gucci at Cannes{ref(2)}. Use lilac for day dresses, knitwear and shirts, violet for satin and evening, and butter as a soft companion rather than a contrast.'''},
   {'heading': 'Full Colour', 'body': f'''**True red 18-1763 TCX, Klein blue 18-3949 TCX, lemon 12-0642 TCX, midnight 19-3933 TCX.**

Chanel, Balenciaga and Celine paired canary yellow, true red and cobalt in strong blocks{ref(1)}, and Céline, Akris and Stella McCartney dressed head to toe in a single colour{ref(1)}. "Colour confidence" was also one of the trends of the Cannes red carpet, with Simone Ashley and Isabelle Huppert in red{ref(2)}. Use this story on tailoring, coats and statement dresses, one colour per look or two colours in large blocks.'''},
   {'heading': 'Sun-Faded', 'body': f'''**Optic white 11-0602 TCX, sand 13-1009 TCX, tobacco 18-1028 TCX, ice blue 12-4805 TCX.**

White is the rising neutral of SS27, up from 23.7% to 28.4% of looks, with ecru also gaining{ref(3)}. "'90s minimalism" in pristine white gowns was another Cannes trend{ref(2)}. This story carries linen tailoring, shirting and the sheer layers of the One-Layer Summer theme.'''},
   {'heading': 'Living Green', 'body': '''**Grass green 16-0237 TCX, teal 17-5117 TCX, sand 13-1009 TCX, butter 12-0711 TCX.**

A smaller story for swim, summer knits and prints. It suits holiday and resort drops and markets with long, hot summers.'''},
   {'heading': 'Where the stories come from', 'body': f'These four stories are Forecut\'s SS27 colour stories{ref(4)}, applied here to womenswear products. The same stories are used across audiences with different products; this page sets out how they work for women.'},
  ],
  design_implications='''- Give each story its own delivery or capsule, so colours do not fight on the shop floor.
- Purple Reign and Sun-Faded mix well (lilac with white); Full Colour works best on its own.
- Match trims to the story: tonal buttons and lace for Purple Reign, contrast piping for Full Colour, natural horn and shell for Sun-Faded.''',
  commercial_implications='''- Lead the season with Purple Reign and Sun-Faded; they carry most of the volume.
- Buy Full Colour as statements: more styles, fewer units each.
- Use Living Green for the high-summer and holiday drop.''',
  sources=src('ph', 'nap', 'tf', 'cf'),
  images=[],
  related=['fc-ss27-women-colours-season-colour-analysis', 'fc-ss27-colours-colour-forecast'],
))

# ---------------------------------------------------------------- Knit fabrics
R.append(dict(C, kind='report', category='fabrics', subsection='knit', slug='knit-fabric-direction',
  title="SS27 Women's Knit Fabric Direction",
  summary='Fine, cool and elastic: extra-fine merino, cool wools and combed mohair for single-layer knits; flat, Derby and Richelieu ribs for close fits; retro-sport stitches and crochet for texture.',
  trend_status='Rising',
  sections=[
   {'heading': 'The evidence', 'body': f'''Première Vision's SS27 knit selection set out two families. "Iconic Sweaterwear" uses flat, Derby and Richelieu ribs, which are more elastic and elongated than jersey{ref(1)}. "Retro Sport" revives bindings, weighted and reverse stitches, honeycomb piqués, plated knits, diamond stitch and wheat stitch, in slightly yellowed, sepia-like tones{ref(1)}. Its season overview adds cool wools, extra-fine merino and combed mohairs, and compact milanos for structured pieces{ref(2)}.

On the runway, the finest knits did the most work. Louis Vuitton cut tailoring from the lightest knits to be worn as one layer, Hermès showed sheer knits{ref(3)}, and Chanel's collection included sheer knits{ref(4)}. Bottega Veneta and Brunello Cucinelli showed crochet and open-stitch knits in oversized cuts{ref(5)}. Jersey held its share of looks at 12.1%{ref(6)}.'''},
   {'heading': 'Fabric by fabric', 'body': '''| Knit | Structure and hand | Gauge (Forecut guide) | Best uses | Status |
|---|---|---|---|---|
| Extra-fine merino | Smooth, cool, light | 16 to 18 gauge | Sheer layers, knit tailoring | Rising |
| Silk and silk-blend knits | Fluid, slightly sheer | 18 gauge and finer | Single-layer tops and dresses | Rising |
| Cool wool | Dry, crisp hand | 14 to 16 gauge | Knit jackets, polos | Rising |
| Combed mohair | Light, airy halo | 5 to 7 gauge, open | Loose cardigans over slips | Emerging |
| Derby and Richelieu ribs | Elastic, elongated, close-fitting | 12 to 16 gauge | Long rib tops, column dresses | Rising |
| Honeycomb and retro-sport piqué | Textured, structured | 12 to 14 gauge | Polos, knit shirts | Emerging |
| Compact milano | Dense, stable | 14 gauge | Structured knit jackets and skirts | Rising |
| Crochet and open stitch | Open, hand-made look | Varies | Oversized tops, dresses over slips | Peaking |
| Cotton jersey | Soft, stable | 24 to 28 gauge | T-shirts, layering | Core |'''},
   {'heading': 'Why it matters', 'body': 'Single-layer dressing for heat puts knit in place of the light jacket and shirt. The fibre and gauge decide whether a knit can be worn alone: fine merino and silk blends can, open crochet needs a slip underneath. Rib structures with good recovery also let knits replace darts and seams on fitted tops, which simplifies production.'},
  ],
  timing='In stores February to July 2027. Fine merino and silk-blend knits continue into AW27 as transitional layers. Crochet is at its height and suits the high-summer drop only.',
  products='''- Sheer fine-gauge tops and tunics; knit jackets and cardigan-jackets; long rib tops and column dresses; knit polos; crochet tops and dresses.
- Customers: women who want one piece that works alone in heat; younger customers for crochet and sheer layers.''',
  design_implications='''- Choose fibre and gauge before the shape; test sheerness on the body under shop lighting.
- Stabilise shoulders and necklines on open stitches with tape.
- Specify recovery tests for rib (length growth after wear) in the tech pack.
- Design sheer knits with a matching under-layer.''',
  commercial_implications='''- Price fine merino and silk blends at the premium tier; crochet works at entry and mid price in cotton.
- Plan reorders for rib tops and knit polos, which repeat across seasons; keep crochet as a short run.
- Sheer knits need clear product photography of what is worn underneath to limit returns.''',
  sources=src('pvf', 'pvt', 'wp', 'wr', 'gr', 'tf'),
  images=[img('sheer-fine-gauge-layers-ss27-photo', 'Sheer fine-gauge layer.', '14 October 2026')],
  related=['fc-ss27-women-silhouettes-knit-shape-and-fit-outlook', 'fc-ss27-women-fabrics-woven-fabric-direction'],
))

# ---------------------------------------------------------------- Trim stories
R.append(dict(C, kind='report', category='trims', subsection='trim-stories', slug='trim-stories-report',
  title="SS27 Women's Trim Stories",
  summary='The trims that carry each SS27 women\'s theme: ribbon and rolled hems for One-Layer Summer, lace and satin bows for Lingerie as Outerwear, belts and peplum seams for The Waist Returns, and lace, smocking and embroidery for Handcraft.',
  sections=[
   {'heading': 'One-Layer Summer', 'body': f'Narrow rolled hems and French seams keep sheer cloth clean{ref(1)}; ribbon binding replaces facings; organza petals, as at Dior, give decoration without weight{ref(2)}. Hardware stays minimal so a look still reads as one layer.'},
   {'heading': 'Lingerie as Outerwear', 'body': f'Lace trims, satin bows and adjustable straps, with hook-and-eye and visible lingerie fastenings. Fendi showed lace-trimmed bras with a fur stole{ref(2)}; Première Vision highlighted dark Leavers lace and lace with a melted-film sheen{ref(3)}. Bra tops need lingerie components: firm elastic top edges and adjustable sliders.'},
   {'heading': 'The Waist Returns', 'body': f'Belts carry the waist story: Anteprima, Ferragamo, Alberta Ferretti and Ermanno Scervino cinched fluid pieces, Bottega Veneta and Max Mara used leather belts, and Ferragamo enlarged belts and covered snap buttons in sequins{ref(4)}. Add peplum seams, basque-waist panels and belt loops.'},
   {'heading': 'Handcraft', 'body': f'Lace flowers, smocking and embroidery on poplin and knits. Première Vision\'s "Drawn" embroidery direction, with scattered, childlike florals and grass stems on tulle and gauze{ref(3)}, and Chanel\'s corsages{ref(2)} point the way.'},
   {'heading': 'In Motion', 'body': f'Fringe and tassels: Roksanda showed tasselled evening dresses and Ahluwalia fringed skirts, and fringe was a fast-rising detail in Copenhagen{ref(1)}. Use fringe at hems and on scarves where movement shows it.'},
  ],
  design_implications='''- Choose one trim family per theme and use it consistently across the theme's pieces.
- Lab-dip trims to the garment colour; lace and ribbon in particular vary by dye lot.
- Test attachment strength and washing for petals, beads and fringe.''',
  commercial_implications='''- Trims are the cheapest way to make core shapes read as a theme; plan one core skirt or shirt in several theme trims.
- Sell belts, corsages and bows separately as add-ons.''',
  sources=src('ph', 'wp', 'pvd', 'wr'),
  images=[img('lace-trimmed-hems-ss27-photo', 'Lace-trimmed hem.', '14 October 2026')],
  related=['fc-ss27-women-trims-trending-trims-report', 'fc-ss27-women-themes-one-layer-summer', 'fc-ss27-women-themes-lingerie-as-outerwear'],
))

# ---------------------------------------------------------------- Trim market strategy
R.append(dict(C, kind='report', category='trims', subsection='trim-market-strategy', slug='trim-market-strategy-report',
  title="SS27 Women's Trim Market Strategy",
  summary='Where to spend on trims in a low-growth, cost-pressured 2027: use trims to refresh core shapes, sell decorative trims as add-ons, and keep labour-heavy embellishment for premium pieces.',
  sections=[
   {'heading': 'The market context', 'body': f'''Fashion is expected to stay in low single-digit growth in 2027, and FashionUnited's outlook argues that the question is how much growth will cost{ref(1)}. Freight, energy and financing costs remain high, and excess stock ties up cash and forces markdowns{ref(1)}. In the mid-market, promotional pressure and competition from luxury and value players squeeze margins{ref(1)}. Since 19 July 2026, large companies in the EU may not destroy certain unsold apparel, accessories and footwear{ref(1)}.

In that climate, trims are a low-risk way to update a range: they change how a core piece looks without new patterns, new fabrics or new production runs.'''},
   {'heading': 'Build, test, sell through, exit', 'body': f'''| Action | Trims | Why |
|---|---|---|
| Build | Belts, ribbon ties and bows, lace edging | Rising on the runway{ref(2)}{ref(3)}; low cost; work across price points |
| Test | Fringe, visible fastenings (Velcro, cross-lacing, sequinned snaps), brooches | Early signals{ref(2)}{ref(3)}{ref(4)}; higher fashion risk |
| Sell through | Lingerie lace, crochet trims | At their height; avoid new depth |
| Premium only | 3D petals, crystal and bead embroidery | Hand labour; cost justified only at higher prices |'''},
   {'heading': 'By market', 'body': f'''- **Europe:** with the unsold-goods destruction ban{ref(1)}, keep trims modular and removable so unsold stock can be reworked.
- **India and the Gulf:** embroidery, lace and ribbon suit festive and modest dressing; India's economy grew 7.8% year on year in the second quarter of 2026{ref(1)}.
- **United States:** belts and add-on accessories support units per transaction where spending growth is modest{ref(1)}.
- **Hot-climate markets:** light trims (ribbon, rolled hems) suit single-layer summer clothes.'''},
  ],
  design_implications='''- Design core pieces with trim positions in mind (belt loops, ribbon channels, removable corsage pins).
- Standardise trim suppliers across themes to raise order quantities and cut cost.''',
  commercial_implications='''- Budget trims as a share of the cost price per tier, with hand-applied decoration kept to premium.
- Track sell-through by trim variant and reorder the winners in season.
- Price separately sold trims (belts, corsages, brooches) to lift the average basket.''',
  sources=src('fu27', 'wr', 'wp', 'ph'),
  images=[],
  related=['fc-ss27-women-trims-trending-trims-report', 'fc-ss27-women-business-strategy-assortment-and-pricing-strategy'],
))

# ---------------------------------------------------------------- Trim innovations
R.append(dict(C, kind='report', category='trims', subsection='trim-innovations', slug='trim-innovations-report',
  title="SS27 Women's Trim Innovations",
  summary='Ribbon built into the cloth, coated and pearlescent lace, rubberised corsetry meshes and fastenings used as decoration: the newest trim ideas for SS27.',
  sections=[
   {'heading': 'Ribbon as structure', 'body': f'Première Vision describes ribbon acting as material, ornament and structure: finishing ribbons, highly decorative ribbons and ribbons integrated into fabric construction, inlaid into jacquards, embroidered as backgrounds or applied onto tulle and lace{ref(1)}. For production, this means trims ordered as part of the fabric rather than added at the end.'},
   {'heading': 'Coated and pearlescent lace', 'body': f'The "Wet Sheen" direction brings plastic-coated laces and pearlescent satins{ref(1)}. Première Vision\'s decoration report adds Leavers lace with a melted-film coating for a latex-like sheen{ref(2)}. On the runway, Saint Laurent coated latex in gold leaf{ref(3)}.'},
   {'heading': 'Corsetry components', 'body': f'Membrane-backed draperies, spacer fabrics and rubberised meshes borrowed from corsetry appear among Première Vision\'s structural fabrics{ref(1)}. They let a bodice hold its shape without boning.'},
   {'heading': 'Fastenings as decoration', 'body': f'Prada used coloured Velcro strips with embroidered florals on the fastenings{ref(4)}; Ferragamo covered snap buttons in sequins{ref(3)}; Miu Miu laced skirts with cross-lace fastenings{ref(4)}; Givenchy made belt buckles that double as powder compacts{ref(4)}.'},
   {'heading': 'Readiness', 'body': '''| Innovation | Readiness for production (Forecut assessment) |
|---|---|
| Ribbon-inlaid jacquards | Available from specialist mills; long lead times |
| Coated and pearlescent lace | Available; test cleaning and abrasion |
| Rubberised and spacer meshes | Available from lingerie and sportswear suppliers |
| Decorative fastenings | Ready; mainly a design and sourcing decision |'''},
  ],
  design_implications='''- Bring trim suppliers into fabric development early when ribbon is part of the cloth.
- Test coated laces for cracking, peeling and dry-cleaning.
- Use corsetry meshes to shape bodices and bra tops without rigid boning.''',
  commercial_implications='''- Innovative trims justify a premium on a few hero pieces; do not spread them across the range.
- Long lead times for jacquard ribbons mean early commitment: order SS27 quantities now and limit reorders.''',
  sources=src('pvt', 'pvd', 'wr', 'wp'),
  images=[],
  related=['fc-ss27-women-trims-trending-trims-report', 'fc-ss27-women-innovations-material-innovations-report'],
))

# ---------------------------------------------------------------- Styling: celebrity
R.append(dict(C, kind='report', category='styling', subsection='celebrity-influence', slug='celebrity-influence-report',
  title="SS27 Women's Celebrity Influence",
  summary='The 2026 red carpets previewed SS27: sheer gowns, strong colour, dark romance, \'90s white minimalism and feathers. This is how those looks reach the SS27 customer.',
  sections=[
   {'heading': 'What the red carpet showed', 'body': f'''At Cannes in May 2026, NET-A-PORTER's editors identified five red-carpet trends{ref(1)}:

- **Sheer beauty.** Despite the festival's dress code, Natasha Poly wore a see-through georgette and pleated satin Ferragamo gown, and Chloé Zhao a pointelle-knit gown from Gabriela Hearst{ref(1)}.
- **Colour confidence.** Demi Moore wore custom red and lilac Gucci, and Simone Ashley and Isabelle Huppert wore vintage red McQueen and Gucci{ref(1)}.
- **Dark romance.** Black gowns with ruffles, velvet and lace on Ruth Negga, Cate Blanchett and Cara and Poppy Delevingne; Negga's custom Saint Laurent combined a guipure lace bodice with a tulle peplum{ref(1)}.
- **'90s minimalism.** Pristine white gowns with clean, minimal shapes{ref(1)}.
- **Feathers.** Some of the most talked-about looks of the festival{ref(1)}.

At Paris Haute Couture Week in July, Demi Moore and Cynthia Erivo attended Pierpaolo Piccioli's Balenciaga debut, which closed with Gigi Hadid{ref(2)}.'''},
   {'heading': 'How it connects to SS27', 'body': f'Each red-carpet trend has a direct SS27 runway counterpart: sheer gowns and the sheer suits of Dior and Louis Vuitton{ref(3)}; red and lilac and the season\'s purple and primary blocks{ref(4)}; dark romance and the dark lace of Première Vision\'s decoration report{ref(5)}; white minimalism and the rise of white to 28.4% of SS27 looks{ref(6)}. Red-carpet exposure months before delivery is why these ideas are likely to sell when they reach stores in spring 2027 (Forecut assessment).'},
   {'heading': 'Looks to build', 'body': '''- **The sheer column:** a sheer knit or georgette column dress over a slip, with flat sandals for day.
- **Red head to toe:** a red satin skirt with a red knit or shirt.
- **Lilac evening:** a lilac satin slip dress with a cropped jacket.
- **White minimal:** a white bias-cut dress or a white suit with no visible trims.
- **Dark romance for day:** a black lace-trimmed slip skirt with a white shirt.'''},
  ],
  design_implications='''- Translate red-carpet ideas into day weights: georgette and fine knit instead of beaded tulle.
- Keep the celebrity idea in one element (colour, sheerness, lace) and simplify the rest.''',
  commercial_implications='''- Time marketing to the 2027 awards and festival calendar, when the same ideas return to the red carpet.
- Sheer and occasion pieces sell close to events; plan smaller, later deliveries for them.
- Avoid licensing or naming celebrities in product marketing without agreements.''',
  sources=src('nap', 'ap', 'wr', 'ph', 'pvd', 'tf'),
  images=[],
  related=['fc-ss27-women-styling-partywear-styling-report', 'fc-ss27-women-colours-season-colour-analysis'],
))

# ---------------------------------------------------------------- Styling: casual
R.append(dict(C, kind='report', category='styling', subsection='casualwear', slug='casualwear-styling-report',
  title="SS27 Women's Casualwear Styling",
  summary='Casual SS27 is built from separates and contrast: jeans with a sheer jacket, joggers with a blazer, a rugby shirt with a brooch, and matching denim sets.',
  sections=[
   {'heading': 'The runway looks', 'body': f'''Designers styled everyday pieces against something unexpected. Proenza Schouler's Rachel Scott put a ribbed vest and jeans under a ballooning sheer floral jacket{ref(1)}; Dries Van Noten pinned a brooch on a rugby shirt{ref(1)}; Miu Miu paired joggers with blazers and sarong skirts with silk shirts{ref(2)}. Givenchy's Sarah Burton built her collection on well-cut jeans and roomy poplin shirts{ref(1)}. A denim jacket or shirt with matching jeans appeared in all four fashion capitals{ref(3)}, and Copenhagen added capri trousers{ref(4)}.

Rachel Scott summed up the approach: "We're not following rules, like: eveningwear must be worn with this kind of shoe, or bag"{ref(1)}.'''},
   {'heading': 'Formulas', 'body': '''- **Jeans + ribbed vest + sheer jacket.** Straight-leg jeans, a close rib tank and a light, sheer overshirt.
- **Joggers + blazer.** Soft joggers with a cropped, waisted blazer and flat shoes.
- **Rugby shirt + skirt + brooch.** A striped rugby shirt tucked into a midi skirt, finished with one brooch.
- **Denim set.** Jacket and jeans cut from the same denim and washed together.
- **Capris + knit polo.** Cropped trousers with a fine knit polo and ballet flats.'''},
   {'heading': 'Why it works', 'body': f'Separates are the season\'s main idea: buyers at Galeries Lafayette Paris describe a fashion "that encourages self-creation rather than adopting a uniform"{ref(5)}. Casual pieces that combine with the season\'s skirts and jackets extend each purchase.'},
  ],
  design_implications='''- Design casual pieces in the season palette so they mix with skirts and tailoring.
- Cut denim sets from the same fabric lot and wash to one recipe.
- Keep casual knits and jerseys clean in finish so they can be dressed up.''',
  commercial_implications='''- Merchandise casual pieces with tailoring, not in a separate casual area.
- Denim sets sell as two pieces: price the set to encourage buying both.''',
  sources=src('wp', 'wr', 'ph', 'mc', 'fu'),
  images=[],
  related=['fc-ss27-women-styling-formalwear-styling-report', 'fc-ss27-women-silhouettes-woven-silhouette-direction'],
))

# ---------------------------------------------------------------- Styling: formal
R.append(dict(C, kind='report', category='styling', subsection='formalwear', slug='formalwear-styling-report',
  title="SS27 Women's Formalwear Styling",
  summary='Formal SS27 means the skirt suit, the cinched jacket and tailoring made light: knee-length skirts, peplum jackets, gold with a trench and organza suits for heat.',
  sections=[
   {'heading': 'The runway looks', 'body': f'''Chanel's narrow, knee-length skirts in smocked tweed and sheer organza{ref(1)} and its new tweed suit{ref(2)} set the tone for formal dressing. Givenchy showed cinched peplum tailoring, trench riffs and woollen overcoats{ref(1)}; Armani, Gucci and Jil Sander cinched jackets at the waist, and Jil Sander, Tod's and Marni shortened them{ref(2)}. Saint Laurent paired gold pencil skirts with trench coats{ref(3)}. For heat, Dior made organza tailoring printed to look like wool suiting{ref(1)}.

Sarah Burton described her Givenchy wardrobe as one "to bring precision and simplicity to dressing"{ref(1)}.'''},
   {'heading': 'Formulas', 'body': '''- **Skirt suit.** A cropped, waisted jacket with a matching knee-length straight skirt.
- **Peplum jacket + slim trouser.** For the office; the waist is defined, the trouser stays straight.
- **Trench + pencil skirt.** A light trench over a satin or metallic pencil skirt.
- **Organza suit.** A summer suit in printed or plain organza over a slip, for weddings and day events in heat.
- **Shirt + full midi skirt + belt.** A poplin shirt tucked into a layered midi skirt, cinched with a leather belt.'''},
  ],
  design_implications='''- Cut skirt suits as separates sold together, so customers can buy different sizes top and bottom.
- Use cool wool, double crepe and organza to keep formalwear wearable in summer.
- Specify linings and finishing carefully: formal pieces are judged on the inside as much as the outside.''',
  commercial_implications='''- Skirt suits replace part of the trouser-suit buy this season.
- Offer alteration-friendly seam allowances on skirts and jackets for a better fit at full price.''',
  sources=src('wp', 'wr', 'ph'),
  images=[img('cinched-one-button-jackets-ss27-photo', 'Cinched one-button jacket.', '14 October 2026')],
  related=['fc-ss27-women-silhouettes-woven-silhouette-direction', 'fc-ss27-women-styling-partywear-styling-report'],
))

# ---------------------------------------------------------------- Styling: party
R.append(dict(C, kind='report', category='styling', subsection='partywear', slug='partywear-styling-report',
  title="SS27 Women's Partywear Styling",
  summary='Party SS27 is gold, bias-cut and jewelled: Saint Laurent\'s gold, Chanel\'s 1930s gowns, Louis Vuitton\'s reflective sixties dresses and Miu Miu\'s cocktail dresses worn with swimwear.',
  sections=[
   {'heading': 'The runway looks', 'body': f'''Gold was the season's evening colour: 49 of 59 Saint Laurent looks were gold, from brass to rose, in lamé, organza, lace, brocade, jacquard and gold-leaf latex{ref(1)}. Chanel included bias-cut 1930s gowns{ref(1)}; Louis Vuitton showed sixties dresses with reflective diamonds in grey, silver and yellow{ref(1)}. Miu Miu paired jewelled cocktail dresses with swimwear{ref(2)}, and Roksanda showed tasselled evening dresses{ref(3)}. Early-2000s glamour returned at Etro, Roberto Cavalli and Gucci with leopard print, glitter, micro hems and stilettos over five inches{ref(1)}.'''},
   {'heading': 'Formulas', 'body': '''- **Gold head to toe.** A gold lamé or metallic jacquard dress, or a gold skirt with a black top.
- **Bias-cut slip.** A satin bias-cut dress in violet, black or optic white, with a fine knit or jacket over the shoulders.
- **Sixties shift.** A short, straight dress with reflective embellishment and flat shoes.
- **Jewelled dress + swim layer.** A beaded dress over a bandeau or swimsuit for holiday evenings.
- **Fringe in motion.** A tasselled dress or skirt for dancing.'''},
  ],
  design_implications='''- Line metallic and beaded fabrics to protect skin and seams.
- Bias-cut dresses need to hang before hemming and careful grading.
- Keep one statement element per look: gold, fringe or beading.''',
  commercial_implications='''- Partywear sells close to events; plan the main delivery for the late-spring wedding and party season and keep quantities tight.
- Price gold and beaded pieces at premium; offer a satin slip at mid price as the accessible version.''',
  sources=src('wr', 'wp', 'ph'),
  images=[img('satin-slip-skirts-ss27-photo', 'Satin slip skirt.', '14 October 2026')],
  related=['fc-ss27-women-styling-celebrity-influence-report', 'fc-ss27-women-fabrics-woven-fabric-direction'],
))

# ---------------------------------------------------------------- Couture: craft and techniques
R.append(dict(C, kind='report', category='couture', subsection='craft-techniques', slug='couture-craft-and-techniques-report',
  title="SS27 Women's Couture Craft and Techniques",
  summary='The July 2026 haute couture shows set the craft agenda for SS27: inflated volume and shredded gazar at Balenciaga, poured and moulded materials at Dior and Schiaparelli, and fairy-tale embroidery at Chanel.',
  sections=[
   {'heading': 'The evidence', 'body': f'''The autumn/winter 2026-27 haute couture season, shown in Paris from 6 to 9 July 2026, included 30 houses, five of them new to the calendar{ref(1)}. The Associated Press called couture "the industry's laboratory and its loudest advertisement"{ref(1)}.

- **Balenciaga (Pierpaolo Piccioli's debut):** 3D body scans used to build new mannequins; leather and cashmere moulded by hand; balloon-hemmed gazar and a strapless gown made of 24,150 shreds of gazar; hooded feather cocoons{ref(1)}; dresses made entirely of goose and ostrich feathers, drop waists, veils and high collars{ref(2)}.
- **Dior (Jonathan Anderson):** inspired by the sculptor Lynda Benglis, whose techniques are pouring, knotting and moulding{ref(2)}; crushed pleated hats and sheer tasselled fans{ref(1)}.
- **Chanel (Matthieu Blazy):** suits, braids, tweeds and chains, with an embroidered vine running up heels and through seams{ref(2)}.
- **Schiaparelli (Daniel Roseberry):** corsets moulded into lifelike torsos and silicone shaped by hand{ref(1)}.
- **Iris van Herpen:** some 30,000 hand-blown glass beads on sheer tulle{ref(1)}.
- **Elie Saab:** velvet corseted gowns with New Look waists{ref(1)}.'''},
   {'heading': 'What it means for SS27 womenswear', 'body': f'''Three couture ideas reach ready-to-wear in SS27:

1. **Volume from light cloth.** Balenciaga's gazar and feathers connect to the bubble and layered skirts of SS27 ready-to-wear, where Dior used layered organza{ref(3)}.
2. **The defined waist.** Elie Saab's New Look waists and Balenciaga's drop waists sit alongside the cinched and peplum jackets of the SS27 shows{ref(4)}.
3. **Embroidery that follows the garment.** Chanel's vine embroidery running through seams is a technique that can be scaled down to a single embroidered line on a ready-to-wear jacket or skirt.'''},
  ],
  timing='Couture ideas typically reach premium ready-to-wear within one to three seasons (Forecut assessment). Volume and waist ideas are already in SS27; seam-following embroidery is a candidate for AW27 and SS28.',
  design_implications='''- Borrow one couture technique per piece and keep the rest simple.
- Use light cloth (organza, gazar-like polyester faille) for volume rather than petticoats.
- Place embroidery along seams and edges to reduce stitch counts.''',
  commercial_implications='''- Couture-inspired pieces belong at the top of the range; one or two hero pieces per delivery.
- Use couture references in storytelling and campaigns, not in pricing claims.''',
  sources=src('ap', 'zoe', 'wp', 'wr'),
  images=[],
  related=['fc-ss27-women-couture-couture-materials-and-details-report'],
))

# ---------------------------------------------------------------- Couture: materials and details
R.append(dict(C, kind='report', category='couture', subsection='materials-details', slug='couture-materials-and-details-report',
  title="SS27 Women's Couture Materials and Details",
  summary='Couture materials moved beyond silk and lace in 2026: lab-grown silk, silicone, latex, glass beads and feathers. The details that translate are feathers, satin macramé, corsetry and pearl beading.',
  sections=[
   {'heading': 'The evidence', 'body': f'''- **Lab-grown silk:** Balenciaga used AMSilk silk, which the house describes as "stronger than steel"{ref(1)}.
- **Silicone, latex, clay and paint:** Schiaparelli used poured silicone, sculpted clay, latex and paint{ref(2)}, and techniques from a workshop that makes lifelike silicone infants for films{ref(1)}.
- **Feathers:** goose and ostrich feathers at Balenciaga{ref(2)}, ostrich feathers at Stéphane Rolland{ref(1)}.
- **Satin macramé, agate and diamonds:** Stéphane Rolland{ref(1)}.
- **Beading:** a prom dress beaded in putty-pink pearls at Schiaparelli and hand-blown glass beads on tulle at Iris van Herpen{ref(1)}.
- **Velvet:** velvet roses at Zuhair Murad and velvet corseted gowns at Elie Saab{ref(1)}.'''},
   {'heading': 'Details that translate', 'body': f'''| Couture detail | Ready-to-wear translation | Price tier |
|---|---|---|
| Feathers | Feather trim at a hem or cuff | Premium |
| Satin macramé | Macramé belts and straps | Mid to premium |
| Pearl beading | Pearl buttons and beaded necklines | Mid to premium |
| Corsetry | Corset seaming and rubberised meshes{ref(3)} instead of boning | Mid |
| Moulded and coated surfaces | Coated lace and pearlescent satins{ref(3)} | Mid |'''},
  ],
  design_implications='''- Source feathers and beads from certified, traceable suppliers and state care clearly.
- Test coated and moulded materials for cracking and cleaning before committing.''',
  commercial_implications='''- Keep exotic materials to a few showpieces; translate the look into accessible trims for volume.
- Lab-grown and bio-based materials carry a sustainability story: check claims before using them.''',
  sources=src('ap', 'zoe', 'pvt'),
  images=[],
  related=['fc-ss27-women-couture-couture-craft-and-techniques-report', 'fc-ss27-women-innovations-material-innovations-report'],
))

# ---------------------------------------------------------------- Business: category opportunities
R.append(dict(C, kind='report', category='business-strategy', subsection='category-opportunities', slug='category-opportunities-report',
  title="SS27 Women's Category Opportunities",
  summary='Skirts, short and waisted jackets, satin pieces, floral prints and accessories-style trims are the SS27 womenswear growth categories. Loose trousers, chinos and mini dresses are shrinking.',
  sections=[
   {'heading': 'The evidence', 'body': f'''Runway share of looks, SS27 against SS26{ref(1)}:

| Category | SS26 | SS27 | Change |
|---|---|---|---|
| Skirts | 19.3% | 27.9% | +8.6 points |
| Straight skirts | 5.1% | 10.3% | +5.2 points |
| Dropped-waist dress | 0.6% | 4.9% | +4.3 points |
| Jackets | 20.9% | 23.1% | +2.2 points |
| Satin | 17.8% | 20.8% | +3.0 points |
| Floral prints | 11.4% | 14.2% | +2.8 points |
| Dresses | 37.0% | 33.3% | -3.7 points |
| Loose trousers | 11.5% | 3.0% | -8.5 points |
| Chinos | 6.7% | 1.5% | -5.2 points |
| Mini dresses | 9.8% | 4.8% | -5.0 points |

Retail buyers at Le Bon Marché and Galeries Lafayette Paris highlighted skirts and separates{ref(2)}. Outside apparel, jewellery and leather goods are projected to grow 4 to 6% a year between 2025 and 2027{ref(3)}.'''},
   {'heading': 'Opportunities', 'body': '''1. **Skirts:** the biggest shift of the season; build straight and midi skirts as a core category.
2. **Jackets:** short, waisted jackets and skirt suits.
3. **Satin:** slip skirts and dresses, blouses and wide trousers.
4. **Prints:** florals in particular, on dresses and skirts.
5. **Add-on accessories:** belts, corsages, brooches and bows, which follow the runway trims and the strength of accessories.'''},
   {'heading': 'Categories to reduce', 'body': 'Loose trousers, chinos and mini dresses fell sharply in runway share. Reduce depth, move customers to straight tailored trousers and midi lengths, and clear remaining stock before the SS27 drop.'},
  ],
  design_implications='''- Shift design time from trousers to skirts and jackets.
- Plan skirt and jacket pairs in shared fabrics and colours.''',
  commercial_implications='''- Re-weight the SS27 open-to-buy towards skirts and jackets.
- Test accessories-style trims as add-ons at the till and online checkout.
- Watch early sell-through on dropped-waist dresses before adding depth.''',
  sources=src('tf', 'fu', 'fu27'),
  images=[img('pencil-midi-skirts-ss27-photo', 'Pencil midi skirt.', '14 October 2026')],
  related=['fc-ss27-women-business-strategy-assortment-and-pricing-strategy', 'fc-ss27-women-silhouettes-woven-silhouette-direction'],
))
# satin SS26 value is derived from the published SS27 share and change
R[-1]['sections'][0]['body'] = R[-1]['sections'][0]['body'].replace('| Satin | 17.8% | 20.8% | +3.0 points |', '| Satin | 17.8% (derived) | 20.8% | +3.0 points |')

# ---------------------------------------------------------------- Business: assortment and pricing
R.append(dict(C, kind='report', category='business-strategy', subsection='assortment-pricing', slug='assortment-and-pricing-strategy',
  title="SS27 Women's Assortment and Pricing Strategy",
  summary='Plan SS27 for low growth and high costs: fewer, more flexible styles built as separates, tighter depth on fashion pieces, full price on what is new, and deliveries timed to heat and events.',
  sections=[
   {'heading': 'The market', 'body': f'''The IMF expects global growth of 3.4% in 2027 and inflation of 3.9%, but fashion is expected to stay in low single digits{ref(1)}. Freight, energy and financing costs remain high, and excess stock both ties up cash and leads to markdowns: sales up 4% with inventory up 10% is a weaker position than steady stock{ref(1)}. Mid-market brands face promotional pressure from luxury and value players{ref(1)}. Resale is expected to grow two to three times faster than first-hand fashion in 2027{ref(2)}.

Weather matters for timing: UK data show that a 1°C warmer May brings clothing sales forward from June{ref(1)}.'''},
   {'heading': 'Assortment', 'body': '''| Tier | Share of options (Forecut guide) | What goes in it |
|---|---|---|
| Core | About half | Straight skirts, tailored trousers, shirts, rib knits, white and black |
| Seasonal | About a third | Midi and layered skirts, waisted jackets, satin, lilac and violet, florals |
| Statement | The rest | Gold, sheer suits, bubble skirts, beaded and feathered pieces |

- Build the range as **separates** in shared colours, so each piece sells with two or three others.
- Keep **statement** pieces to short runs with a planned exit.
- Cut **loose trousers, chinos and mini dresses** compared with SS26.'''},
   {'heading': 'Pricing', 'body': '''- **Full price on what is new:** rising pieces (skirts, waisted jackets, satin) are what customers come in for.
- **Value on what customers know:** peaking pieces (lingerie lace, crochet) carry promotions.
- **Premium for craft:** hand-applied petals, beading and silk duchesse justify higher prices; label the craft.
- **Sets:** price skirt suits and denim sets to reward buying both pieces.'''},
   {'heading': 'Timing', 'body': '''- Deliver core separates early (February and March).
- Hold sheer and single-layer pieces for the first heat, and be ready to bring them forward if spring is warm.
- Time partywear and statement pieces for the wedding and event season.'''},
  ],
  design_implications='''- Design fewer styles with more combinations.
- Use shared fabrics across skirts and jackets to simplify buying and reduce minimums.''',
  commercial_implications='''- Track the sales-to-inventory ratio by category every week and chase winners rather than buying deep.
- In the EU, plan for the unsold-goods destruction ban: buy shallower and keep stock that can be reworked or resold.
- Consider a resale or take-back offer for premium pieces.''',
  sources=src('fu27', 'mck'),
  images=[],
  related=['fc-ss27-women-business-strategy-category-opportunities-report', 'fc-ss27-women-trims-trim-market-strategy-report'],
))

# ---------------------------------------------------------------- Innovations: materials
R.append(dict(C, kind='report', category='innovations', subsection='material-innovations', slug='material-innovations-report',
  title="SS27 Women's Material Innovations",
  summary='Materials to watch for SS27 womenswear: lab-grown silk, stretch satins and taffetas, water-repellent linens, technical cottons, softshell and compact knits, and coated surfaces.',
  sections=[
   {'heading': 'The evidence', 'body': f'''- **Lab-grown silk:** Balenciaga used AMSilk silk in its July 2026 couture collection{ref(1)}.
- **Stretch satins:** Première Vision reports satins, double satins and taffetas moving towards stretch{ref(2)}.
- **Technical cottons and water-repellent linens:** part of the "Robust Elegance" direction, with cottons gaining strength through yarn and weave{ref(2)}.
- **Compact milanos and softshells:** in "Powerful Flexibility"{ref(2)}.
- **Membrane-backed draperies, spacers and rubberised meshes:** structural fabrics borrowed from corsetry{ref(2)}.
- **Coated surfaces:** vinyl and translucent PVC, latex-effect rubber and shiny nylon on the SS27 runways{ref(3)}.'''},
   {'heading': 'Readiness', 'body': '''| Material | Readiness (Forecut assessment) | Use in SS27 |
|---|---|---|
| Stretch satin and taffeta | Ready, widely available | Skirts, fitted jackets |
| Water-repellent linen | Ready from specialist mills | Trench coats, jackets |
| Technical cotton | Ready | Workwear-inspired jackets and trousers |
| Compact milano, softshell | Ready | Structured knit jackets and skirts |
| Corsetry meshes and spacers | Ready from lingerie suppliers | Bodices, bra tops |
| Lab-grown silk | Early; limited supply and high cost | Showpieces only |
| PVC and coated fabrics | Ready; check environmental claims and care | Accent pieces |'''},
   {'heading': 'Further reading', 'body': 'Forecut\'s fabric innovation reports cover regenerated fibres, recycled polyester, bio-based materials and finishing in more depth; see the Innovations articles linked from this category.'},
  ],
  design_implications='''- Use stretch satins to make structured skirts and jackets easier to wear.
- Test coated fabrics for cracking, peeling and cleaning; label care clearly.
- Consider water-repellent linen for unlined summer outerwear.''',
  commercial_implications='''- Ready materials can go into SS27 volume; early ones belong in a few hero pieces.
- Check every sustainability claim (bio-based, recycled, lab-grown) against supplier certificates before using it in marketing.''',
  sources=src('ap', 'pvt', 'wr'),
  images=[],
  related=['fc-ss27-women-innovations-design-and-production-innovations-report', 'fc-ss27-women-fabrics-woven-fabric-direction'],
))

# ---------------------------------------------------------------- Innovations: design and production
R.append(dict(C, kind='report', category='innovations', subsection='design-production', slug='design-and-production-innovations-report',
  title="SS27 Women's Design and Production Innovations",
  summary='Body scanning and 3D development, product data ready for the EU\'s Digital Product Passport, and production planned around new EU rules on unsold stock and low-value imports.',
  sections=[
   {'heading': 'Design: scanning and 3D', 'body': f'Balenciaga used 3D body scans to build new mannequins for its July 2026 couture collection{ref(1)}. The same approach is available to ready-to-wear: scanning fit models and developing first samples in 3D reduces sampling rounds. Forecut\'s Garment Studio supports drafting and 3D checks before a physical sample.'},
   {'heading': 'Product data and regulation', 'body': f'''- **Digital Product Passport:** it will not apply to all fashion from the start of 2027; the European Commission plans to adopt the textiles delegated act in the fourth quarter of 2027{ref(2)}. Brands that collect fibre, origin and care data now will be ready.
- **Unsold goods:** since 19 July 2026, large companies may not destroy certain unsold apparel, accessories and footwear in the EU{ref(2)}.
- **Low-value imports:** since 1 July 2026, the EU applies a temporary €3 customs duty per item on consignments worth up to €150{ref(2)}.
- **Ultra-fast fashion:** a French law adopted on 8 July 2026 allows penalties of up to 50% of a product's price{ref(2)}.'''},
   {'heading': 'Production planning', 'body': f'''- **Sourcing:** brands are diversifying towards Vietnam, Bangladesh, India, Turkey and Morocco while keeping China relationships{ref(2)}.
- **Calendar:** Lunar New Year falls on 6 February 2027; Vietnamese and Chinese factories slow from late January and usually return to full capacity in early March{ref(3)}. Plan bulk for later spring drops after the holiday.
- **Climate risk:** the World Meteorological Organization warns that El Niño could bring drought, flooding and extreme heat to key sourcing regions through early 2027{ref(2)}.'''},
  ],
  design_implications='''- Develop first samples in 3D and keep physical sampling for final fit and fabric approval.
- Record fibre composition, origin and care for every style from the start.''',
  commercial_implications='''- Buy shallower in the EU and plan rework, resale or donation routes for unsold stock.
- Build buffer time around Lunar New Year and climate disruption into the SS27 critical path.''',
  sources=src('ap', 'fu27', 'ph'),
  images=[],
  related=['fc-ss27-women-innovations-material-innovations-report', 'fc-ss27-women-business-strategy-assortment-and-pricing-strategy'],
))

for r in R:
    fn = f"{r['season']}-{r['audience']}-{r['category']}-{r['slug']}.json"
    json.dump(r, open(os.path.join(OUT, fn), 'w'), indent=1, ensure_ascii=False)
print(len(R), 'reports written')
