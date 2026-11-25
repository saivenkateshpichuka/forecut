"""SS27 Women, first batch of editorial reports (25 Nov 2026). Writes content/reports/*.json.
Evidence: SS27 womenswear shows (New York 10 Sep to Paris 6 Oct 2026), Premiere Vision Paris (Feb 2026), runway data and retail commentary.
Every claim below is drawn from the listed sources or labelled as Forecut's assessment."""
import json, os

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'content', 'reports')
os.makedirs(OUT, exist_ok=True)

S = {
 'fu': {'title': 'SS27 womenswear trends: the key looks from New York, London, Milan and Paris fashion weeks', 'publisher': 'FashionUnited (AFP)', 'url': 'https://fashionunited.com/news/fashion/ss27-womenswear-trends-the-key-looks-from-new-york-london-milan-and-paris-fashion-weeks/2026100775061', 'date': '7 October 2026'},
 'tf': {'title': 'Spring 2027 womenswear trends from the runways (SS27), T-Fashion Runway Index', 'publisher': 'T-Fashion', 'url': 'https://tfashion.ai/runway/ss27', 'date': 'data as of 18 October 2026', 'note': 'Share of looks across 12,320 looks from 359 designers, compared with SS26'},
 'wp': {'title': 'The defining trends and takeaways from the S/S 2027 shows', 'publisher': 'Wallpaper*', 'url': 'https://www.wallpaper.com/fashion-beauty/fashion-week-trends-spring-summer-2027', 'date': 'October 2026'},
 'wr': {'title': 'Spring/Summer 2027 trends: 10 ideas from Milan and Paris', 'publisher': 'Wordrobe', 'url': 'https://wordrobeshop.com/en/spring-summer-2027-trends-milan-paris/', 'date': 'October 2026'},
 'ph': {'title': 'Spring/Summer 2027 fashion trends from the runways', 'publisher': 'Pham Fashion House', 'url': 'https://www.phamfashion.com/blog/spring-summer-2027-fashion-trends-runway', 'date': 'November 2026', 'note': 'Manufacturer commentary; used here for production notes'},
 'www': {'title': 'We already know the dress trends that will define 2027', 'publisher': 'Who What Wear', 'url': 'https://www.whowhatwear.com/fashion/runway/spring-summer-dress-trends-2027', 'date': 'October 2026'},
 'pvf': {'title': 'Spring-Summer 27 Decodings: Fabrics', 'publisher': 'Premiere Vision', 'url': 'https://www.premierevision.com/articles/e620fe9e-3407-f111-8333-000d3a2973d4/spring-summer-27-decodings-fabrics', 'date': '13 February 2026'},
 'pvt': {'title': 'Decoding Spring-Summer 27 key transversal highlights', 'publisher': 'Premiere Vision', 'url': 'https://www.premierevision.com/articles/86fffb89-9602-f111-8333-000d3a2973d4/decoding-spring-summer-27-key-transversal-highlights', 'date': '5 February 2026'},
 'pvd': {'title': 'Spring-Summer 27 Decodings: Decoration', 'publisher': 'Premiere Vision', 'url': 'https://www.premierevision.com/articles/fd62f60f-4c07-f111-8333-000d3a2973d4/spring-summer-27-decodings-decoration', 'date': 'February 2026'},
 'gr': {'title': 'Goodbye plain knits: five unexpected sweater trends', 'publisher': 'Grazia (citing Elle)', 'url': 'https://graziamagazine.com/us/?p=118537', 'date': 'autumn 2026'},
 'cf': {'title': 'Forecut SS27 colour forecast: method and sources', 'publisher': 'Forecut', 'url': 'https://forecut.in/forecasts/ss27/colours/colour-forecast/', 'date': 'November 2026', 'note': 'Built from Refinery29, T-Fashion colour shares, The Impression and Premiere Vision key colours'},
 'pvaw': {'title': 'Premiere Vision Paris: what fabrics reveal about AW27/28 trends', 'publisher': 'FashionUnited', 'url': 'https://fashionunited.uk/news/fairs/premiere-vision-paris-what-fabrics-reveal-about-aw27-28-trends/2026090490139', 'date': '4 September 2026'},
 'mc': {'title': 'Copenhagen Fashion Week spring 2027 trends', 'publisher': 'Marie Claire', 'url': 'https://www.marieclaire.com/fashion/copenhagen-fashion-week-trends-spring-2027/', 'date': 'August 2026'},
}


def src(*keys):
    return [S[k] for k in keys]


def ref(n):
    return f'<sup>[{n}]</sup>'


IMG_NOTE = 'Created for Forecut and supplied through the Forecut image upload on {d}. Illustrative, not a runway photograph.'
LIC = 'Forecut image. Tool and licence terms to be confirmed by the owner.'


def img(file, caption, d):
    return {'file': file, 'caption': caption + ' Forecut visual, not a runway photograph.', 'credit': 'Forecut', 'provenance': IMG_NOTE.format(d=d), 'licence': LIC}


COMMON = {'season': 'ss27', 'audience': 'women', 'status': 'published', 'published': '2026-11-25',
          'research_period': 'Shows 10 September to 6 October 2026; Premiere Vision Paris, February 2026; analysis October to November 2026',
          'markets': 'Global: New York, London, Milan, Paris and Copenhagen runways; applies to premium and mid-market womenswear'}

R = []

# 1 ---------------------------------------------------------------- woven silhouettes
s1 = src('tf', 'fu', 'wp', 'wr', 'ph', 'www')
R.append(dict(COMMON, kind='report', category='silhouettes', subsection='woven', slug='woven-silhouette-direction',
  title="SS27 Women's Woven Silhouette Direction",
  summary='The skirt replaces the loose trouser as the anchor of the spring wardrobe. Straight and pencil skirts at knee to mid-calf, the dropped-waist dress and the short, waisted jacket lead; bubble volume is a styling moment rather than a volume buy.',
  trend_status='Rising',
  sections=[
   {'heading': 'The evidence', 'body': f'''The clearest signal of the season is measurable. Across 12,320 SS27 womenswear looks, skirts rose from 19.3% to 27.9% of looks against SS26, while dresses fell from 37.0% to 33.3%{ref(1)}. The fastest-rising key item was the straight skirt, which doubled from 5.1% to 10.3%; the dropped-waist dress grew from 0.6% to 4.9%{ref(1)}. On the other side of the ledger, loose trousers fell from 11.5% to 3.0% of looks, chinos from 6.7% to 1.5% and mini dresses from 9.8% to 4.8%{ref(1)}.

The shows explain the numbers. Prada put a skirt in every look, treating it, in the house's words, as "this unique and universal garment"{ref(2)}{ref(3)}. Chanel cut narrow skirts to just below the knee, the length Gabrielle Chanel considered most flattering{ref(2)}, in smocked tweed and sheer organza{ref(3)}. At Dior, Jonathan Anderson ran the full range, from gauze-light minis to ankle-length, flared, pleated and tulle-trimmed skirts{ref(4)}. Across Milan and Paris the dominant lengths were knee and mid-calf{ref(4)}.

Retail buyers read it the same way. Elodie Abrial, commercial director of the Le Bon Marché group, described skirts with "a great deal of fluidity and movement"{ref(2)}. Victoria Dartigues, director of womenswear buying at Galeries Lafayette Paris, linked the season's move to separates to wardrobes that "encourage self-creation rather than adopting a uniform"{ref(2)}.'''},
   {'heading': 'Why it matters', 'body': f'''The shift is structural rather than decorative. Designers rebuilt the season around separates: Daniel Roseberry at Schiaparelli said the house reinvented its dresses and necklines "as tops and bottoms"{ref(2)}. A wardrobe built from separates sells in more combinations, which is why department stores are framing it as a buying opportunity rather than a runway story.

It also follows two seasons of very relaxed trousers. With loose trousers and chinos falling sharply in runway share{ref(1)}, the skirt takes the role of the easy, comfortable bottom, and tailored trousers hold steady at 12.4% of looks{ref(1)}. Heat is the third driver: designers were explicit that the collections answered Europe's summer temperatures with lighter, single-layer clothes{ref(3)}.'''},
   {'heading': 'Shapes to lead with', 'body': f'''**Straight and pencil skirt, knee to mid-calf.** The volume driver of the season. Straight and pencil shapes led in Milan{ref(5)}; Saint Laurent paired gold pencil skirts with trench coats{ref(5)}. Build it as a core shape in suiting, satin and denim.

**The full, layered midi skirt.** Dior, Chanel and the Australian label Aje showed long, light, layered skirts{ref(5)}; Prada used layered crinolines, organza shells and tulle{ref(4)}. Commercially, this works best in two or three layers of light cloth rather than structured petticoats.

**The dropped-waist dress.** Back on the runway{ref(5)} and among the fastest risers{ref(1)}. Pair the dropped seam with a pleated or flared skirt; keep the bodice relaxed.

**The short, waisted jacket.** Cropped jackets replaced oversized shapes at Jil Sander, Tod's and Marni, while Armani, Gucci and Jil Sander cinched jackets at the waist{ref(4)}. Oversized blazers were scarce in Milan{ref(5)}. Givenchy showed cinched peplum tailoring{ref(3)}.

**Bias-cut slips and 1930s gowns.** Chanel's collection included bias-cut 1930s gowns{ref(4)}; satin slips carry the same line into day wear.'''},
   {'heading': 'Shapes to handle with care', 'body': f'''**The pouf and bubble skirt.** Christian Lacroix's mid-1980s shape returned at Loewe and Dior, in very short versions at Miu Miu and Zimmermann, and as a denim sculpture at Comme des Garçons{ref(2)}. FashionUnited's report notes the trend may fade quickly because the pieces are more image-driven than wearable and are almost impossible to sit in{ref(2)}. Forecut's assessment: use bubble hems for editorial and occasion pieces, not for core volume.

**Micro hems and the mini dress.** Etro, Roberto Cavalli and Gucci showed micro hems{ref(4)}, but the mini dress halved its share of looks{ref(1)}. Keep minis as a small, younger-customer option.

**Very loose trousers and chinos.** The sharpest fallers of the season{ref(1)}. Reduce depth and move the customer to a straight, tailored trouser; a relaxed straight leg is replacing the curved barrel jean in denim{ref(5)}.'''},
  ],
  timing=f'''In stores February to July 2027. The straight skirt and the waisted jacket are rising now; Forecut expects both to carry into AW27 in heavier cloth. The bubble skirt is likely to peak within SS27 itself and should not be carried forward in depth. The dropped-waist dress is at an early stage: test in SS27, build in SS28 if sell-through supports it.''',
  products='''- **Skirts:** straight and pencil skirts at knee and mid-calf; pleated and layered midi skirts; satin slip skirts; denim midi skirts.
- **Dresses:** dropped-waist dresses with pleated skirts; bias-cut slip dresses; long column dresses for evening.
- **Jackets:** cropped, waisted jackets; one-button cinched jackets; peplum jackets.
- **Customers:** the core is the working woman who buys separates and builds a wardrobe over seasons, the customer Galeries Lafayette describes. Younger customers will pick up the bubble hem and the mini in small doses.''',
  design_implications=f'''- **Set the lengths first.** Plan skirts at three lengths: just below the knee, mid-calf and ankle. The knee and mid-calf lengths carry the volume{ref(4)}.
- **Engineer movement.** Narrow knee-length skirts need a walking vent, kick pleat or slit; check stride and sitting in the first fitting.
- **Waist placement matters again.** Jackets stop at the natural waist or are belted there; dropped-waist dresses move the seam to the hip. Avoid long, unshaped blazers.
- **Finish carries the price.** Waistbands, linings and hems decide quality in a skirt; fit depends on waist and hip grading, and bias-cut styles should hang before hemming{ref(5)}.
- **Build in pairs.** Design skirts and jackets to work together and apart, reflecting the season's separates logic{ref(2)}.''',
  commercial_implications=f'''- **Move budget from trousers to skirts.** With loose trousers and chinos falling sharply{ref(1)}, shift part of the trouser buy into straight and midi skirts while holding a tailored trouser as the core.
- **Expect better multi-buys.** Separates encourage customers to buy two or three pieces that work together; plan coordinated skirt and jacket stories in shared colours.
- **Cap the bubble skirt.** Treat it as a short-run fashion piece with a clear exit date{ref(2)}.
- **Reduce mini dresses** in favour of midi and maxi lengths; maxi dresses held a 16.0% share of looks{ref(1)}.
- **Price ladder:** core straight skirts at entry and mid price in suiting and denim; layered organza and satin midi skirts at a premium.''',
  sources=s1,
  images=[img('pencil-midi-skirts-ss27-photo', 'Pencil midi skirt.', '14 October 2026'), img('drop-waist-with-pleated-skirt-ss27-photo', 'Dropped waist with pleated skirt.', '13 October 2026'),
          img('cinched-one-button-jackets-ss27-photo', 'Cinched one-button jacket.', '14 October 2026')],
  related=['fc-ss27-women-silhouettes-knit-shape-and-fit-outlook', 'fc-ss27-women-fabrics-woven-fabric-direction'],
))

# 2 ---------------------------------------------------------------- knit silhouettes
R.append(dict(COMMON, kind='report', category='silhouettes', subsection='knit', slug='knit-shape-and-fit-outlook',
  title="SS27 Women's Knit Shape and Fit Outlook",
  summary='Knitwear moves into tailoring and lingerie. Sheer, single-layer knits replace the light jacket, ribbed knits get longer and closer, and crochet and open-stitch knits return in oversized cuts.',
  trend_status='Rising',
  sections=[
   {'heading': 'The evidence', 'body': f'''The most important knit idea of SS27 came from tailoring houses rather than knit specialists. At Louis Vuitton, Nicolas Ghesquière cut diaphanous tailoring from the lightest knits, designed to be worn as one layer: "We needed to think differently. You want one layer"{ref(1)}. Hermès showed sheer knits and streamlined bandeau tops{ref(1)}{ref(2)}, and Chanel's 83-look collection included sheer knits{ref(2)}. Courrèges, under Drew Henry's first collection, showed a knitted bandeau with cartoon poppies{ref(1)}.

Heavier knits did not disappear; they changed role. Prada paired its skirts with chunky knits, blazers and leather jackets{ref(2)}. Bottega Veneta and Brunello Cucinelli showed crochet and open-stitch styles in oversized cuts, and florals moved onto knitwear at Stine Goya and Monse{ref(3)}.

At fabric level, Première Vision's SS27 knit selection points the same way: flat, Derby and Richelieu ribs that are more elastic and elongated than jersey, and a retro-sport family of honeycomb piqués, plated knits, diamond and wheat stitches in slightly yellowed, sepia-like tones{ref(4)}. Its season overview adds cool wools, extra-fine merino and combed mohair{ref(5)}.'''},
   {'heading': 'Why it matters', 'body': f'''Heat changed the brief. Designers designed for one layer{ref(1)}, which makes fine knits a replacement for the light jacket and the shirt rather than an extra layer on top. Knit also suits the season's separates logic: a knit top works with every skirt shape in the collection. And the lingerie trend, with bras and bandeaus shown as tops{ref(1)}, gives knitwear a new, small but visible category: the knitted bandeau and bra top.'''},
   {'heading': 'Shapes and fit', 'body': '''**Knit as tailoring.** A fine-gauge knit jacket or cardigan-jacket, cut like a blazer, unlined, worn as the only layer. Fit: close at the shoulder, straight or slightly waisted body, hip length.

**Sheer fine-gauge layers.** Transparent long-sleeved tops and tunics in fine merino or silk blends, worn over a bra top or slip. Fit: close to the body; length either at the hip or tunic length over a skirt.

**The elongated rib.** Polo and crew-neck ribs cut longer and closer, using the stretch and recovery of Derby and Richelieu ribs. Fit: second-skin through the body, tucked into high-waisted skirts.

**The knitted bandeau and bra top.** A small but visible category in SS27. Fit is technical: it needs grip at the top edge, a firm rib or elastic, and sizing by bust rather than S to XL.

**Crochet and open stitch, oversized.** Loose, dropped-shoulder shapes worn over slips and swimwear. Fit: generous, with weight-bearing seams so the fabric does not grow.

**The chunky knit over a skirt.** A short, boxy jumper over a long skirt balances the season's narrow and full skirts.'''},
  ],
  timing='In stores February to July 2027. Sheer and one-layer knits are rising now and should carry into early AW27 as transitional layers. Crochet is a returning, seasonal idea: strongest for the high-summer drop. Knitted bra tops are at an early stage: test small.',
  products='''- **Tops:** sheer fine-gauge tops and tunics; elongated rib polos and crews; knitted bandeaus and bra tops; short-sleeved knit shirts.
- **Layers:** fine knit jackets and cardigan-jackets; pointelle cardigans; cropped cardigans.
- **Dresses:** long rib column dresses; crochet and open-stitch dresses over slips.
- **Customers:** the separates customer who wants one piece to wear alone in heat; younger customers for bra tops and crochet.''',
  design_implications=f'''- **Choose the gauge before the shape.** Fine gauges (14 to 18) hold close, tailored shapes and sheerness; chunky gauges need room and short lengths.
- **Design sheer pieces as a pair.** A sheer knit needs a planned under-layer: a slip, bandeau or bra top in the same colour family.
- **Use rib for fit, not just trims.** Derby and Richelieu ribs stretch and recover more than jersey{ref(4)}, so they can replace darts and seams on fitted tops.
- **Stabilise open stitches.** Tape shoulders and necklines on crochet and open-stitch knits so they keep their shape.
- **Bra tops need lingerie construction.** Use firm top edges, elastic and, where needed, light cups. Consider working with a lingerie maker.''',
  commercial_implications='''- **Re-assign the light-jacket budget.** Part of the unlined jacket buy can move into knit jackets and cardigan-jackets that work as one layer.
- **Pair knits with skirts in the range plan.** Every core skirt shape should have at least one matching knit top in the same colour story.
- **Keep bra tops and crochet as short runs.** High interest, smaller audience; buy them as tests and reorder winners.
- **Watch returns on sheer pieces.** Product pages need clear photography of what is worn underneath.''',
  sources=src('wp', 'wr', 'gr', 'pvf', 'pvt'),
  images=[img('sheer-fine-gauge-layers-ss27-photo', 'Sheer fine-gauge layers.', '14 October 2026'), img('pointelle-cardigans-ss27-photo', 'Pointelle cardigan.', '14 October 2026')],
  related=['fc-ss27-women-silhouettes-woven-silhouette-direction', 'fc-ss27-women-themes-one-layer-summer'],
))

# 3 ---------------------------------------------------------------- woven fabrics
R.append(dict(COMMON, kind='report', category='fabrics', subsection='woven', slug='woven-fabric-direction',
  title="SS27 Women's Woven Fabric Direction",
  summary='Two families carry the season: crisp, dense silks and satins with real body, and very light sheers that let a whole look stay as one layer. Fine wools, linens and refined cottons hold the tailoring and shirting core.',
  trend_status='Rising',
  sections=[
   {'heading': 'The evidence', 'body': f'''Satin appeared in 20.8% of SS27 womenswear looks, up 3.0 points, second only to twill at 26.2%{ref(1)}. Buyers in Paris singled out duchesse satin and high-shine finishes{ref(2)}. Première Vision had already set out the two silk directions in February: "Couture Density" (radzimirs, mikados, duchesse satins, faille, piqué damasks and weighted silks, crisp and substantial) and "Opalescent Lightness" (crepes, devoré chiffons, nylon organzas and double gauzes){ref(3)}.

On the runway, lightness was the stronger story. Dior showed featherweight organza tailoring printed to look like classic wool suiting{ref(4)} and sheer suits with mesh blazers{ref(5)}. Louis Vuitton used fabrics as thin as cigarette paper{ref(5)}; Hermès perforated suede for airflow{ref(4)}. In Milan, Giorgio Armani, Missoni, Max Mara and Ferragamo showed see-through dresses and veiled skirts and trousers in chiffon, tulle, mesh and organza{ref(5)}.

A third, smaller story is gloss: vinyl and translucent PVC, latex-effect rubber, shiny nylon and organza at Ferragamo, Prada, MSGM, Jil Sander and others, and latex coated in gold leaf at Saint Laurent{ref(5)}.'''},
   {'heading': 'Fabric by fabric', 'body': f'''| Fabric | Construction and hand | Best uses | Status |
|---|---|---|---|
| Duchesse satin, mikado, faille | Dense satin and faille weaves; crisp, lustrous, substantial{ref(3)} | Structured skirts, evening, occasion | Rising |
| Fluid satin and crepe-back satin | Satin weave; fluid, high shine | Slip skirts and dresses, wide trousers | Peaking |
| Organza, chiffon, tulle, mesh | Open, very light weaves and nets{ref(5)} | Sheer suits, overlays, layered skirts | Rising |
| Double gauze, devoré chiffon | Light, layered; moiré effects from layering{ref(3)} | Blouses, summer dresses | Emerging |
| Fine pure wool and wool blends | Lightweight wool, blended with viscose, silk or linen; fine prunelles, softened checks{ref(3)} | Summer tailoring, skirts | Core |
| Double crepe | Heavier, dense, supple drape; dry, cool hand{ref(3)} | Fluid tailoring, column dresses | Rising |
| Linen and linen blends | Firm, clean yarn-dyed linens; straw-like tweeds and basket weaves{ref(3)} | Jackets, skirts, trousers | Core |
| Silk-blend shirting | Silk with cotton, viscose or lyocell in poplins, twills, crepes{ref(3)} | Shirts and blouses | Rising |
| Dense cotton satin, micro twill | Crisp, smooth, lightly sanded{ref(3)} | Tailored trousers, skirts | Core |
| Vinyl, PVC, coated fabrics | Glossy, coated{ref(5)} | Accent skirts, outerwear details | Emerging |'''},
   {'heading': 'Why it matters', 'body': f'''The silhouette story depends on cloth. A straight skirt at the knee needs a fabric with body; a single-layer summer look needs a fabric that is light but not flimsy. That is why the two extremes, dense silk and featherweight sheer, rise together. Première Vision also notes satins, double satins and taffetas moving towards stretch{ref(6)}, which makes structured skirts and fitted jackets easier to wear.'''},
  ],
  timing='Dense satins and sheers are in SS27 production now. Forecut expects dense silks to carry into AW27 occasion wear, while the very light sheers are a summer story. Coated and vinyl fabrics are early: use as accents.',
  products='''- **Satin:** slip skirts, bias-cut dresses, wide trousers, jabot and bow blouses.
- **Organza and chiffon:** sheer suits and overlays, layered midi skirts, sheer sleeves.
- **Fine wool and double crepe:** cropped, waisted jackets and straight skirts for the working wardrobe.
- **Linen:** jackets, skirts and trousers for high summer and resort markets.''',
  design_implications=f'''- **Pair weights deliberately.** Combine one structured fabric (duchesse, faille, crepe) with one sheer (organza, chiffon) in the same colour.
- **Sheers need clean construction.** Use French seams and narrow rolled hems; satin needs fine needles and careful pressing{ref(2)}.
- **Print the illusion.** Dior's organza printed to look like wool{ref(4)} shows a way to keep tailoring codes in a summer weight.
- **Check fibre content.** Much commercial satin is polyester{ref(2)}; state composition clearly and test pilling and seam slippage on satin and organza.''',
  commercial_implications='''- **Price on fibre and finish.** Silk duchesse and mikado justify a premium; polyester satins should sit at entry price with clear labelling.
- **Plan matched colour.** Head-to-toe colour and satin-with-sheer pairings need every fabric and trim lab-dipped to one shade before bulk.
- **Order sheers with linings.** Budget for slips and under-layers so sheer pieces sell as complete looks.
- **Keep vinyl and PVC small.** Accent pieces only, with careful care labelling.''',
  sources=src('tf', 'ph', 'pvf', 'wp', 'wr', 'pvt'),
  images=[img('satin-slip-skirts-ss27-photo', 'Satin slip skirt.', '14 October 2026'), img('sheer-organza-blouses-ss27-photo', 'Sheer organza blouse.', '14 October 2026')],
  related=['fc-ss27-women-silhouettes-woven-silhouette-direction', 'fc-ss27-women-themes-one-layer-summer'],
))

# 4 ---------------------------------------------------------------- season colours
R.append(dict(COMMON, kind='report', category='colours', subsection='season-colours', slug='season-colours',
  title="SS27 Women's Season Colours",
  summary='Lilac and violet lead the womenswear palette, with butter for softness and true red and Klein blue for statement pieces. White is the neutral that is rising; warm browns and greys give way.',
  trend_status='Rising',
  sections=[
   {'heading': 'The palette', 'body': f'''| Colour | Pantone TCX (nearest) | HEX | Role |
|---|---|---|---|
| Lilac | 15-3720 TCX | #B3A0C9 | Seasonal: lead colour |
| Violet | 19-3642 TCX | #603F83 | Seasonal: depth and evening |
| Butter | 12-0711 TCX | #F6E199 | Seasonal: soft neutral |
| True red | 18-1763 TCX | #C71F2D | Seasonal: statement |
| Klein blue | 18-3949 TCX | #3850A0 | Accent: statement |
| Optic white | 11-0602 TCX | #F2F0EB | Core |

These colours come from Forecut's SS27 colour forecast, built from runway colour shares, editorial colour reports and Première Vision's key colours{ref(1)}. Pantone TCX codes are the nearest published match: confirm against a physical Pantone book before dyeing.'''},
   {'heading': 'The evidence', 'body': f'''**Purple is the season's new colour.** Chanel showed lilac, Miu Miu royal purple, and violet ran through Milan{ref(2)}.

**Soft, calming pastels.** Pascal K. Douglas described "colours that soothe and lower cortisol levels: butter, lavender, sage"{ref(3)}. Victoria Beckham and Icicle in Paris and Ashley Williams in London showed shoulder-padded shirts in light blue, yellow and baby pink; Bottega Veneta paired light-yellow pleated trousers with a bright pink jabot blouse{ref(3)}. Dior used a ballet-slipper pink across blazers, skirts and dresses{ref(4)}.

**Strong blocks of primary colour.** Chanel, Balenciaga and Celine paired canary yellow, true red and cobalt in strong blocks{ref(2)}.

**White up, browns down.** White rose from 23.7% to 28.4% of looks and ecru gained 1.4 points, while chocolate, almond and grey each lost between 1.5 and 1.8 points{ref(5)}. Black remains the most worn colour at 35.2%{ref(5)}.

**Gold as a full look.** At Saint Laurent, 49 of 59 looks were gold, from brass to rose{ref(4)}. Treat gold as a finish (lamé, metallic thread, hardware) rather than a dyed colour.'''},
   {'heading': 'Colour groups and how much to use', 'body': '''- **Core (about half the range):** optic white and black, with sand and midnight from the season's shared key colours for depth.
- **Seasonal (about a third):** lilac, violet, butter and true red. Lilac and butter carry day pieces; violet and red carry evening and statement pieces.
- **Accent (the rest):** Klein blue, and gold as a finish. One piece or one detail per look.'''},
   {'heading': 'Combinations and applications', 'body': '''- **Lilac with butter and white.** The softest combination: shirts, knitwear and skirts for day.
- **Violet with true red.** An evening and occasion pairing; use satin or duchesse to carry the depth.
- **Head-to-toe single colour.** Céline, Akris and Stella McCartney showed one shade from head to toe <sup>[2]</sup>; lilac, red or white work best.
- **Primary blocks.** True red, Klein blue and butter in large, flat blocks on tailoring and knitwear.
- **White as the base.** Optic white suits, skirts and shirts take any of the seasonal colours as an accent.'''},
  ],
  timing='Lilac and violet are rising into SS27 and continue into winter: Première Vision\'s AW27-28 trend forum opened with deep violet, plums, dusty pinks and mauves <sup>[6]</sup>. Butter and pastels are a summer story. White is rising for SS27; warm browns are fading.',
  products='''- **Lilac and butter:** shirts, knitwear, skirts, summer tailoring.
- **Violet and true red:** occasion dresses, satin skirts, statement tailoring.
- **Klein blue:** knitwear, shirts, accessories.
- **Optic white:** suiting, shirting, layered summer dresses.''',
  design_implications='''- **Approve one standard per colour.** Head-to-toe and colour-blocked looks need every fabric and trim to match one approved shade; each white needs its own standard.
- **Test lilac across fibres.** Lilac shifts strongly between silk, cotton and polyester; dye lab dips on every base cloth.
- **Use gold as a finish.** Lamé, metallic yarns and hardware, not a dyed colour.''',
  commercial_implications='''- **Lead with lilac in visual merchandising** and keep it in depth across categories, so a customer can build a full look.
- **Buy red and Klein blue lighter.** Strong colours sell as statements: fewer units, more styles.
- **Reduce warm browns** compared with AW26 and SS26 buys; move the neutral budget towards white and ecru.''',
  sources=src('cf', 'ph', 'fu', 'wr', 'tf', 'pvaw'),
  images=[],
  related=['fc-ss27-colours-colour-forecast', 'fc-ss27-women-colours-womenswear-colour'],
))
R[-1]['sections'][0]['body'] = R[-1]['sections'][0]['body']  # palette table above
# Phamfashion source note: the Pham article also repeats a third-party commercial palette; only its runway observations are used here.
R[-1]['sources'][1] = dict(S['ph'], note='Runway colour observations only')

# 5 ---------------------------------------------------------------- trending trims
R.append(dict(COMMON, kind='report', category='trims', subsection='trending-trims', slug='trending-trims',
  title="SS27 Women's Trending Trims",
  summary='Decoration returns in force: three-dimensional petals and corsages, ribbons used as structure, lingerie lace, crystal embroidery and fringe. Belts and visible fastenings carry the season\'s waist and separates story.',
  trend_status='Rising',
  sections=[
   {'heading': 'The evidence', 'body': f'''Première Vision called the season's ornamentation a "decorative overload", drawing on historical ceremonial dress and on insects and microscopic forms, with caterpillars, fringes, ribbons, beads and fractals as motifs{ref(1)}. It singled out ribbon as material, ornament and structure: finishing ribbons, highly decorative ribbons and ribbons built into the fabric itself, inlaid into jacquards or applied onto tulle and lace{ref(1)}.

The runways confirmed it. Dior used organza petals and hand-cut petals{ref(2)}{ref(3)}; Chanel used corsages in the manner Coco Chanel favoured{ref(2)}; Prada placed crystal flowers on jewellery-like skirts and embroidered florals on Velcro fastenings{ref(2)}. Dries Van Noten showed sequinned flowers peeking from a hem and a brooch on a rugby shirt{ref(2)}. Fringe ran through Roksanda's tasselled evening dresses and Ahluwalia's fringed skirts, and was a fast-rising detail in Copenhagen{ref(4)}.

Fastenings became decoration. Prada used coloured Velcro strips{ref(2)}; Miu Miu laced houndstooth skirts with cross-lace fastenings, left undone{ref(2)}; Ferragamo enlarged belts and covered snap buttons in sequins{ref(3)}. Belts cinched fluid pieces at Anteprima, Ferragamo, Alberta Ferretti and Ermanno Scervino, and Bottega Veneta and Max Mara used leather belts{ref(3)}.

Lingerie trims moved outside: Fendi showed lace-trimmed bras with a fur stole{ref(2)} and a black embroidered satin triangle bra{ref(5)}; Dreaming Eli used old-fashioned lace and satin{ref(5)}.'''},
   {'heading': 'Trims to use', 'body': f'''| Trim | Where it appeared | Application | Status |
|---|---|---|---|
| 3D petals and corsages | Dior, Chanel{ref(2)} | Necklines, waists, skirt hems | Rising |
| Ribbon (decorative and structural) | Première Vision{ref(1)} | Bows, binding, ribbon-inlaid jacquards, lacing | Rising |
| Lace trim and lingerie lace | Fendi, Dreaming Eli{ref(5)}; dark Leavers lace{ref(6)} | Slip edges, bra tops, hems | Peaking |
| Crystal and bead embroidery | Prada{ref(2)}; micro-beads on tulle{ref(6)} | Skirts, evening tops | Rising |
| Fringe and tassels | Roksanda, Ahluwalia, Copenhagen{ref(4)} | Skirt hems, scarves, evening | Emerging |
| Visible fastenings (Velcro, cross-lacing, sequinned snaps) | Prada, Miu Miu, Ferragamo{ref(2)}{ref(3)} | Skirts, jackets | Emerging |
| Belts, narrow and enlarged | Ferragamo, Bottega Veneta, Max Mara{ref(3)} | Over jackets and fluid dresses | Rising |
| Brooches | Dries Van Noten{ref(2)} | Jackets, knitwear, shirts | Emerging |'''},
   {'heading': 'Why it matters', 'body': 'After seasons of minimal finishing, trims are the fastest way to make a simple skirt, shirt or knit read as SS27. They also travel well across price points: a corsage, a ribbon tie or a belt can carry the trend at entry price where a fully embellished garment cannot.'},
  ],
  timing='Petals, corsages and ribbons are rising for SS27 and suit the spring occasion calendar. Lingerie lace is at its height. Fringe and visible fastenings are early ideas to test. Forecut expects belts and ribbons to continue into AW27.',
  products='''- **Corsages and petal trims:** occasion dresses, satin tops, jackets (also as separate accessories).
- **Ribbon:** bow-tie blouses, ribbon-laced skirts, ribbon-bound edges on jackets.
- **Lace:** slip skirts and dresses, camisoles, bra tops.
- **Belts:** sold with jackets and dresses, and as accessories.''',
  design_implications=f'''- **Keep trims removable where possible.** Detachable corsages and belts reduce returns and allow restyling.
- **Specify attachment.** Petals and beads need secure stitching and wash testing; state hand-wash or dry-clean care.
- **Match colour exactly.** Trims must be lab-dipped to the garment colour, especially in head-to-toe looks.
- **Source ribbon early.** Jacquard and ribbon-inlaid fabrics need longer lead times{ref(1)}.''',
  commercial_implications='''- **Use trims to update core shapes** rather than buying new styles: the same skirt with a corsage, a ribbon or a belt.
- **Sell trims as accessories too.** Corsages, brooches and belts add units per transaction at low cost.
- **Cost carefully.** Hand-applied petals and beads add labour; use them at premium price points and keep entry pieces to one trim.''',
  sources=src('pvt', 'wp', 'wr', 'ph', 'fu', 'pvd'),
  images=[img('lace-trimmed-hems-ss27-photo', 'Lace-trimmed hem.', '14 October 2026')],
  related=['fc-ss27-trims-trims-season-report', 'fc-ss27-women-themes-lingerie-as-outerwear'],
))

# 6 ---------------------------------------------------------------- theme: one layer
R.append(dict(COMMON, kind='theme', category='themes', subsection='themes', slug='one-layer-summer',
  title="SS27 Women's One-Layer Summer",
  summary='A summer dressed for heat: sheer suits, featherweight organza tailoring, single-layer knits and perforated leather. Lightness replaces layering as the sign of luxury.',
  trend_status='Rising',
  sections=[
   {'heading': 'The story', 'body': f'''Europe's extreme summer heat shaped the SS27 collections{ref(1)}. Nicolas Ghesquière put it simply at Louis Vuitton: "We needed to think differently. You want one layer"{ref(1)}. His collection cut tailoring from the lightest knits and used fabrics as thin as cigarette paper{ref(2)}. At Dior, Jonathan Anderson made featherweight organza tailoring printed to look like wool suiting, with pleated plissé and petals{ref(1)}, and sheer suits with mesh blazers{ref(2)}. Hermès perforated suede for airflow{ref(1)} and showed sheer knits{ref(2)}. In Milan, Armani, Missoni, Max Mara and Ferragamo showed see-through dresses and veiled skirts and trousers{ref(2)}.

The result is a new idea of summer polish: a complete, tailored look that weighs almost nothing.'''},
   {'heading': 'Colours', 'body': 'Optic white, butter and lilac from the SS27 womenswear palette, with pale tones that show the transparency of the cloth. See SS27 Women\'s Season Colours for codes.'},
   {'heading': 'Silhouettes', 'body': '- Sheer suits: unlined jackets and straight or full skirts in organza or mesh.\n- Single-layer knit tailoring: a fine knit jacket worn alone.\n- Layered midi skirts in two or three sheer layers.\n- Sheer fine-gauge tops over slips or bandeaus.'},
   {'heading': 'Fabrics', 'body': f'Organza, chiffon, tulle and mesh{ref(2)}; nylon organza, double gauze and devoré chiffon{ref(3)}; fine wool and extra-fine merino{ref(4)}; perforated leather and suede{ref(1)}.'},
   {'heading': 'Trims and details', 'body': 'Narrow rolled hems, French seams, ribbon binding, organza petals, minimal hardware.'},
  ],
  timing='In stores February to July 2027, strongest for the high-summer drop. Forecut expects single-layer tailoring to remain relevant as summers get hotter.',
  products='''- Sheer organza jacket and skirt sets; mesh blazers; fine knit jackets.
- Sheer layered midi skirts; sheer blouses with matching slips.
- Customers: city customers in hot climates who still dress for work and occasions; resort and holiday buyers.''',
  design_implications='''- Design every sheer piece with its under-layer.
- Keep construction invisible: French seams, rolled hems, no heavy facings.
- Print or weave tailoring codes (pinstripes, checks) onto light cloth to keep a suit reading as a suit.''',
  commercial_implications='''- Sell sheer suits as sets with under-layers to raise the average order.
- Market to hot-climate regions (Gulf, India, Southeast Asia, Australia) with modest styling options.
- Watch return rates; show what is worn underneath on product pages.''',
  sources=src('wp', 'wr', 'pvf', 'pvt'),
  images=[img('sheer-organza-overlays-ss27-photo', 'Sheer organza overlay.', '13 October 2026')],
  related=['fc-ss27-women-fabrics-woven-fabric-direction', 'fc-ss27-women-silhouettes-knit-shape-and-fit-outlook', 'fc-ss27-women-colours-season-colours'],
))

# 7 ---------------------------------------------------------------- theme: lingerie as outerwear
R.append(dict(COMMON, kind='theme', category='themes', subsection='themes', slug='lingerie-as-outerwear',
  title="SS27 Women's Lingerie as Outerwear",
  summary='Bras, bandeaus and slips move to the outside: worn under suits, with skirts and alone as tops. Satin, lace and boudoir dressing become day wear.',
  trend_status='Rising',
  sections=[
   {'heading': 'The story', 'body': f'''Lingerie was one of the most visible ideas of SS27. Bralettes were worn alone or under jackets, and the bra returned as a simple top{ref(1)}. Prada, Fendi, Tod's, The Attico, Marni, MM6 and Blumarine all showed it: bras under suits and dresses, with skirts, and as tiny tops between swimwear and lingerie{ref(2)}. Fendi paired lace-trimmed bras with a fur stole{ref(3)}; Miu Miu put jewelled bras over sporty rash vests{ref(3)}; Dior placed a black bra top beneath an organza skirt suit{ref(3)}.

The boudoir mood went further. Celine used creased, pressed satin and nightie- and negligee-inspired dresses; Julie Kegels layered deconstructed bras over T-shirts; Ester Manas, with Primadonna, showed sheer, lacy slips and negligees{ref(3)}. In London, Dreaming Eli used "slightly old-fashioned fabrics like lace and satin"{ref(1)}.'''},
   {'heading': 'Colours', 'body': 'Black, optic white and butter for lingerie bases; violet and true red for evening. See SS27 Women\'s Season Colours for codes.'},
   {'heading': 'Silhouettes', 'body': '- Bra and bandeau tops worn under unbuttoned jackets.\n- Slip dresses and slip skirts with lace edges.\n- Negligee-style dresses, unbuttoned at the shoulder.\n- Camisoles layered over knits and T-shirts.'},
   {'heading': 'Fabrics', 'body': f'Fluid and creased satin, lace, sheer tulle and mesh; dark Leavers lace and lace with a melted-film sheen{ref(4)}.'},
   {'heading': 'Trims and details', 'body': 'Lace trims, satin bows and ribbons, adjustable straps, hook-and-eye fastenings as visible details, jewelled or embroidered cups.'},
  ],
  timing='In stores February to July 2027. Slips and lace camisoles are at their height; bra tops as outerwear are rising and suit a younger customer first.',
  products='''- Bra tops and bandeaus in satin, lace and knit; slip dresses and skirts; camisoles; negligee dresses.
- Styled with jackets, cardigans and shirts for wider audiences.
- Customers: younger fashion customers for bra tops; a broad audience for slips and camisoles worn under tailoring.''',
  design_implications='''- Bra tops need lingerie construction: cup sizing, firm top edges and adjustable straps.
- Consider a partnership with a lingerie maker for structured pieces.
- Offer modest styling: camisoles and slips under jackets and shirts work in every market.''',
  commercial_implications='''- Size bra tops by bust and cup, not S to XL, or limit to soft, stretch styles.
- Keep bra-top buys small; put depth into slips and camisoles, which reach a wider customer.
- Style the look with jackets and knitwear in campaigns so the idea reads as day wear.''',
  sources=src('fu', 'wr', 'wp', 'pvd'),
  images=[img('lace-cami-layering-tops-ss27-photo', 'Lace camisole layering top.', '14 October 2026'), img('satin-slip-skirts-ss27-photo', 'Satin slip skirt.', '14 October 2026')],
  related=['fc-ss27-women-trims-trending-trims', 'fc-ss27-women-fabrics-woven-fabric-direction', 'fc-ss27-women-colours-season-colours'],
))

for r in R:
    fn = f"{r['season']}-{r['audience']}-{r['category']}-{r['slug']}.json"
    json.dump(r, open(os.path.join(OUT, fn), 'w'), indent=1, ensure_ascii=False)
print(len(R), 'reports written to', OUT)
