"""SS27 Men: all nine categories (25 Nov 2026). Evidence: Milan, Paris and Pitti Uomo menswear, June 2026;
Premiere Vision SS27; Forecut colour forecast; 2027 business outlook. Writes content/reports/*.json."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from src_ss27 import S, src, ref, img, write

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'content', 'reports')
C = {'season': 'ss27', 'audience': 'men', 'status': 'published', 'published': '2026-11-25',
     'research_period': 'Milan, Paris and Pitti Uomo menswear shows, June 2026; Premiere Vision Paris, February 2026; analysis July to November 2026',
     'markets': 'Global: Milan, Paris and Florence runways; premium and mid-market menswear'}
R = []


def rep(**k):
    R.append(dict(C, kind=k.pop('kind', 'report'), **k))


# ---------------------------------------------------------------- THEMES
rep(kind='theme', category='themes', subsection='themes', slug='short-story', title="SS27 Men's Short Story",
  summary='Proportions shrink: micro jackets, cropped blousons, shorts and boxer shorts worn as outerwear replace the long, oversized line.',
  trend_status='Rising',
  sections=[
   {'heading': 'The story', 'body': f'''Hypebeast named "the micro jacket" one of the defining SS27 menswear trends: shrunken, cropped and body-hugging micro peacoats, collarless trucker jackets with raw edges, bombers and blousons at Celine, Junya Watanabe, Prada and Willy Chavarria{ref(1)}. Prada paired leather with slim five-pocket trousers and cropped jackets with flat pockets that worked as shirts{ref(2)}. Below the waist, Dolce & Gabbana showed microshorts{ref(2)} and boxer shorts left the bedroom: worn bare, above the waistline or as outerwear at JW Anderson, Willy Chavarria and Dries Van Noten, in gingham and stripes at GmbH and Charles Jeffrey Loverboy{ref(1)}.

Heat was the driver. Hypebeast's verdict: "the beating sun is the true main character of SS27"{ref(1)}.'''},
   {'heading': 'Colours', 'body': 'Sand, tobacco and ice blue from the SS27 menswear palette, with rust and salmon pink as accents. See SS27 Men\'s Season Colours.'},
   {'heading': 'Silhouettes', 'body': '- Cropped blousons and micro trucker jackets ending at the waist.\n- Slim five-pocket trousers and closer-cut long trousers.\n- Tailored shorts and boxer-style shorts in shirting.'},
   {'heading': 'Fabrics', 'body': f'Leather, including woven and perforated leather for breathability{ref(2)}; gingham and striped shirting cottons; denim.'},
   {'heading': 'Trims and details', 'body': 'Flat patch pockets, raw edges, elastic and button-fly waistbands on boxer shorts, minimal hardware.'},
  ],
  timing='In stores February to July 2027. Cropped jackets are rising; boxer shorts as outerwear are an early, younger-customer idea.',
  products='- Cropped leather and suede blousons; micro trucker jackets; tailored and boxer-style shorts; slim five-pocket trousers.\n- Customers: fashion-forward men under 35 first; the cropped blouson reaches a broad audience.',
  design_implications='- Re-cut jacket blocks shorter: hem at or just above the waist, with a slimmer sleeve.\n- Design boxer shorts with real outerwear construction: fly, pockets, a stable waistband.\n- Balance short jackets with full or straight trousers for wider customers.',
  commercial_implications='- Add depth to cropped blousons; keep boxer shorts as a test.\n- Shorts carry the high-summer drop; plan them as a coordinated category with shirts.',
  sources=src('hb', 'ap'), images=[img('clean-leather-bombers-ss27-photo', 'Clean leather bomber.', '14 October 2026')],
  related=['fc-ss27-men-silhouettes-woven-silhouette-direction'])

rep(kind='theme', category='themes', subsection='themes', slug='ventilated-tailoring', title="SS27 Men's Ventilated Tailoring",
  summary='The suit adapts to heat: lighter, open-necked and in places transparent, in silk, gauze, seersucker and perforated leather.',
  trend_status='Rising',
  sections=[
   {'heading': 'The story', 'body': f'''Milan designers "went lighter" in silhouette and broadly agreed that a well-dressed man still wears a suit, but the suit is adapting{ref(1)}: lighter, less oversized tailoring with open necklines and more airflow, dress shirts left unbuttoned or rendered transparent{ref(1)}. Thom Browne showed layered seersucker suiting{ref(1)}. In Paris, Jonathan Anderson's Dior collection had fluid suits in very light, almost sheer silk and gauze{ref(2)}, and Hypebeast tracked sheer double-breasted suits at Dior and sheer trousers at Hed Mayner{ref(3)}. At Pitti Uomo, Herno launched crease-proof travel pieces in stretch wool and technical fabrics{ref(4)}.'''},
   {'heading': 'Colours', 'body': 'Ice blue, sand and white, with tobacco for depth. See SS27 Men\'s Season Colours.'},
   {'heading': 'Silhouettes', 'body': '- Unlined, soft-shoulder jackets with open-necked shirts.\n- Lighter double-breasted suits.\n- Long trousers cut closer to the body.'},
   {'heading': 'Fabrics', 'body': f'Silk and gauze{ref(2)}, seersucker{ref(1)}, perforated and woven leather{ref(1)}, fine lightweight wools blended with silk or linen{ref(5)}, crease-proof stretch wool{ref(4)}.'},
   {'heading': 'Trims and details', 'body': 'Minimal canvas and interlining, unlined backs, mother-of-pearl buttons, open-weave and perforated panels.'},
  ],
  timing='In stores February to July 2027; strongest for wedding season and summer events. Forecut expects lighter tailoring to carry into SS28.',
  products='- Unlined summer suits; seersucker suits; linen travel suits; sheer or semi-sheer shirts.\n- Customers: working men who still wear tailoring in hot climates; wedding guests.',
  design_implications='- Remove weight: half-canvas or unconstructed fronts, quarter lining.\n- Test semi-sheer shirting for modesty and comfort before committing.\n- Use crease-recovery and stretch wool for travel pieces.',
  commercial_implications='- Lead tailoring with summer weights rather than four-season cloth.\n- Price sheer and silk pieces at premium; seersucker and linen at mid.',
  sources=src('ap', 'fu5', 'hb', 'wpp', 'pvf'), images=[img('pinstripe-suiting-ss27-photo', 'Pinstripe suiting.', '14 October 2026')],
  related=['fc-ss27-men-fabrics-woven-fabric-direction'])

rep(kind='theme', category='themes', subsection='themes', slug='tender-masculinity', title="SS27 Men's Tender Masculinity",
  summary='Softness, sensuality and decoration in menswear: nude and aquamarine tones, lingerie references, organza feathers and floral satins.',
  trend_status='Emerging',
  sections=[
   {'heading': 'The story', 'body': f'''Menswear embraced softness and sensuality in Paris: Dries Van Noten showed sensual silhouettes in nude and aquamarine tones and Egonlab lingerie-inspired ensembles{ref(1)}. Patrick Clark, fashion editor at GQ France, called the season "a confirmation of the crossover between the men's and women's wardrobes"{ref(1)}. At Pitti Uomo, Simone Rocha's first men's show used boas of organza feathers, cornflower-blue embellishment, aprons and pinafores, under the theme "tender masculinity"{ref(2)}. Willy Chavarria showed floral satin sets{ref(3)}, and Thom Browne put pleated skirts on men in Milan{ref(4)}.'''},
   {'heading': 'Colours', 'body': 'Salmon pink, butter and ice blue, with nude and aquamarine tones. See SS27 Men\'s Season Colours.'},
   {'heading': 'Silhouettes', 'body': '- Fluid shirts and trousers; floral satin sets.\n- Skirts and aprons layered over trousers (fashion customers).\n- Soft, unstructured jackets.'},
   {'heading': 'Fabrics', 'body': f'Satin, including floral satin{ref(3)}; organza; sheer cottons; fine knits.'},
   {'heading': 'Trims and details', 'body': f'Embroidered florals, organza feathers{ref(2)}, brooches, beading.'},
  ],
  timing='In stores February to July 2027. An emerging direction: test with fashion customers; Forecut expects softer colour and fabric to reach the mainstream before skirts do.',
  products='- Satin shirts and sets; embroidered shirts; soft-coloured knitwear; skirts and aprons for fashion customers.',
  design_implications='- Introduce softness through colour and fabric first (satin, pastel knits).\n- Keep construction masculine where the customer needs it: shoulders, collars, trouser blocks.',
  commercial_implications='- Small buys for skirts and aprons; build depth in satin shirts and soft-coloured knits.\n- Merchandise by mood, not by gender, for fashion stores and online.',
  sources=src('fu5', 'wpp', 'hb', 'ap'), images=[img('gilded-embroidered-shirting-ss27-photo', 'Embroidered shirting.', '14 October 2026')],
  related=['fc-ss27-men-colours-season-colour-analysis'])

rep(kind='theme', category='themes', subsection='themes', slug='pyjama-polish', title="SS27 Men's Pyjama Polish",
  summary='Sleepwear turns into city wear: long tunic shirts, piped two-piece sets and check sets with matching coats, made luxurious.',
  trend_status='Rising',
  sections=[
   {'heading': 'The story', 'body': f'''Dior lengthened sleepwear into knee-length tunics and showed two-piece sets in khaki, blue and beige with black collars and piping; Sarah Burton's first menswear collection for Givenchy included a buttoned beige and blue check two-piece with a matching coat{ref(1)}. Alice Feillard, director of menswear buying at Galeries Lafayette, described "a pyjama effect, but a rather sophisticated, luxurious one"{ref(1)}. Hypebeast also suggested pajama-style dressing in satin{ref(2)}, and monochrome sets of long-sleeve tops with wide trousers appeared at IM Men and Celine{ref(3)}.'''},
   {'heading': 'Colours', 'body': 'Khaki, blue and beige with black piping; sand and ice blue from the SS27 menswear palette.'},
   {'heading': 'Silhouettes', 'body': '- Two-piece sets: camp-collar or tunic shirt with drawstring or wide trousers.\n- Knee-length tunic shirts.\n- Set with matching coat.'},
   {'heading': 'Fabrics', 'body': 'Poplin, satin, check shirting, seersucker, fine cotton and silk blends.'},
   {'heading': 'Trims and details', 'body': 'Contrast collars and piping, covered buttons, drawstrings, patch pockets.'},
  ],
  timing='In stores February to July 2027. Rising; suits resort and holiday drops.',
  products='- Two-piece sets, tunic shirts, set-plus-coat looks; sold as separates and as sets.',
  design_implications='- Piping and contrast collars carry the idea: specify them carefully.\n- Cut set trousers with a fly and proper waistband so they work as city trousers.',
  commercial_implications='- Price sets to reward buying both pieces.\n- Good for resort and holiday markets (Gulf, India, Southeast Asia).',
  sources=src('fu5', 'hb', 'fuh'), images=[img('double-pocket-camp-shirts-ss27-photo', 'Double-pocket camp shirt.', '14 October 2026')],
  related=['fc-ss27-men-styling-casualwear-styling-report'])

# ---------------------------------------------------------------- COLOURS
rep(category='colours', subsection='season-colours', slug='season-colour-analysis', title="SS27 Men's Season Colour Analysis",
  summary='Sun-faded earth tones and linen neutrals, ice blue as the new shirt colour, with butter, salmon pink and rust, and aquatic blues and orange for statements.',
  trend_status='Rising',
  sections=[
   {'heading': 'The palette', 'body': '''| Colour | Pantone TCX (nearest) | HEX | Role |
|---|---|---|---|
| Sand | 13-1009 TCX | #DAC7AB | Core |
| Tobacco | 18-1028 TCX | #684832 | Core |
| Ice blue | 12-4805 TCX | #CBDCDF | Seasonal: the new shirt colour |
| Butter | 12-0711 TCX | #F6E199 | Seasonal |
| Salmon pink | 15-1523 TCX | #E29A86 | Seasonal |
| Rust | 18-1250 TCX | #9F5130 | Accent |

This is Forecut's SS27 menswear palette{ref}. Confirm codes against a physical Pantone book before dyeing.'''.replace('{ref}', ref(1))},
   {'heading': 'The evidence', 'body': f'''Two strong colour signals came from the June shows. **Aquatic blues**, from turquoise and sky blue to electric blue, ran through leather jackets, shorts, linen shirts and loafers at Shinyakozuka, Auralee, Zegna and others{ref(2)}. **Orange**, from blood orange and rust to tangerine, appeared at Dries Van Noten, Willy Chavarria, Saint Laurent and Jacquemus{ref(2)}. Dries Van Noten also showed nude and aquamarine{ref(3)}. Paris collections leaned on monochrome palettes, notably at Celine and IM Men{ref(4)}. Leather came in camel and beige at Dior and Saint Laurent{ref(3)}.'''},
   {'heading': 'Colour groups', 'body': '- **Core:** sand and tobacco, with white and black for tailoring.\n- **Seasonal:** ice blue, butter and salmon pink for shirts, knits and summer suits.\n- **Accent:** rust and orange, and aquatic blue, for one piece per look (a bag, cap, jacket or shorts).'},
   {'heading': 'Combinations', 'body': '- Ice blue shirt with sand trousers and tobacco suede.\n- Head-to-toe sand or beige, including leather.\n- Turquoise or sky blue shorts with a white shirt.\n- Orange accessory or blouson over tobacco and sand.'},
  ],
  timing='Ice blue and sand are rising for SS27. Aquatic blues and orange are statement colours for high summer.',
  products='- Ice blue: shirts. Sand and beige: suits, trousers, leather. Aquatic blue: shorts, linen shirts, leather jackets. Orange: blousons, knits, bags.',
  design_implications='- Lab-dip ice blue across poplin, linen and knit; it shifts between fibres.\n- Use orange as one accessory or garment per look, as runways suggested.',
  commercial_implications='- Lead shirts with ice blue; keep sand and tobacco deep.\n- Buy aquatic blue and orange as smaller statement buys.',
  sources=src('cf', 'hb', 'fu5', 'fuh'), images=[])

rep(category='colours', subsection='theme-colour-palettes', slug='theme-colour-palettes-report', title="SS27 Men's Theme Colour Palettes",
  summary='A working palette for each SS27 men\'s theme: Short Story, Ventilated Tailoring, Tender Masculinity and Pyjama Polish.',
  sections=[
   {'heading': 'Palettes by theme', 'body': '''| Theme | Lead | Accent | Range colours | Carried by |
|---|---|---|---|---|
| Short Story | Tobacco 18-1028 TCX | Rust 18-1250 TCX | Sand 13-1009 TCX | Cropped leather and suede blousons, shorts |
| Ventilated Tailoring | Sand 13-1009 TCX | Ice blue 12-4805 TCX | White | Summer suits, open shirts |
| Tender Masculinity | Salmon pink 15-1523 TCX | Aquamarine (sea blue family) | Butter 12-0711 TCX | Satin shirts, soft knits |
| Pyjama Polish | Ice blue 12-4805 TCX | Black (piping) | Sand, khaki | Two-piece sets, tunic shirts |'''},
   {'heading': 'Why these palettes', 'body': f'They follow the runway colour: monochrome sets at Celine and IM Men{ref(1)}, khaki, blue and beige sleepwear sets with black piping at Dior{ref(2)}, nude and aquamarine at Dries Van Noten{ref(2)}, and Forecut\'s SS27 menswear palette{ref(3)}.'},
  ],
  design_implications='- Lead colour on most of the look; accent on one piece or the piping.\n- Share sand across themes so pieces cross-sell.',
  commercial_implications='- Build depth in sand and ice blue; accents as small buys.',
  sources=src('fuh', 'fu5', 'cf'), images=[])

rep(category='colours', subsection='colour-stories', slug='colour-stories-report', title="SS27 Men's Colour Stories",
  summary='Three colour stories for SS27 menswear: Sun-Faded for tailoring and linen, Aquatic for summer shirts and shorts, and Orange Energy for statements.',
  sections=[
   {'heading': 'Sun-Faded', 'body': f'Optic white, sand, tobacco and ice blue{ref(1)}. Tailoring, shirting, linen. Brunello Cucinelli\'s cable knits with a sun-faded finish, achieved with resin in the dyeing process, show the look in knitwear{ref(2)}.'},
   {'heading': 'Aquatic', 'body': f'Turquoise, sky blue and electric blue on leather jackets, shorts, linen shirts, socks and boat shoes{ref(3)}. Pair with white.'},
   {'heading': 'Orange Energy', 'body': f'Blood orange, rust, tangerine and true orange, on a sunset-gradient overcoat, a cropped blouson or a V-neck sweater, or as a single accessory such as a bag or cap{ref(3)}.'},
  ],
  design_implications='- Give each story its own delivery or capsule.\n- Sun-Faded mixes with both other stories; Aquatic and Orange are best kept apart.',
  commercial_implications='- Sun-Faded carries volume; Aquatic and Orange Energy carry newness.',
  sources=src('cf', 'wpp', 'hb'), images=[])

# ---------------------------------------------------------------- SILHOUETTES
rep(category='silhouettes', subsection='woven', slug='woven-silhouette-direction', title="SS27 Men's Woven Silhouette Direction",
  summary='Lighter, closer and shorter: soft summer suits, long trousers cut closer to the body, cropped jackets and shorts, from tailored Bermudas to boxer shorts.',
  trend_status='Rising',
  sections=[
   {'heading': 'The evidence', 'body': f'''Milan showed lighter, less oversized tailoring with open necklines and more airflow, long trousers cut closer to the body, cropped leather jackets and five-pocket slim trousers{ref(1)}. In Paris, collections kept to cleaner, more minimal, straight-edged silhouettes; classic suiting was loosened, and black suits sat alongside smart shorts and athletic shapes at Dries Van Noten, Louis Gabriel Nouchi, Egonlab and Ami{ref(2)}. Micro jackets (shrunken peacoats, collarless truckers, bombers and blousons) and boxer shorts were among the season's defining shapes{ref(3)}. Thom Browne showed pleated skirts for men{ref(1)}.'''},
   {'heading': 'Shapes to lead with', 'body': '- **Soft summer suit:** unlined, softer shoulder, lighter double-breasted versions.\n- **Closer straight trouser:** long, closer to the leg, with a single pleat or flat front.\n- **Cropped jacket:** blouson, trucker or micro peacoat ending at the waist.\n- **Shorts:** tailored Bermudas, suit shorts and smart shorts.\n- **Camp and tunic shirts:** for sets and pyjama-inspired looks.'},
   {'heading': 'Shapes to watch', 'body': f'Boxer shorts as outerwear and skirts for men are early, fashion-customer ideas{ref(3)}{ref(1)}. Very oversized tailoring is giving way to lighter, closer cuts{ref(1)}.'},
  ],
  timing='In stores February to July 2027. Closer trousers and cropped jackets are rising; Forecut expects the closer line to continue into AW27.',
  products='- Summer suits, straight trousers, Bermudas and suit shorts, cropped blousons, camp and tunic shirts.',
  design_implications='- Slim trouser blocks slightly from SS26 relaxed fits, keeping room at the seat.\n- Shorten jacket blocks; adjust pocket placement for cropped lengths.\n- Develop suit shorts with the same cloth as jackets.',
  commercial_implications='- Shift part of the wide-trouser buy into straighter, closer fits.\n- Sell suit shorts as part of a suit offer for hot markets.',
  sources=src('ap', 'fuh', 'hb'), images=[img('bermuda-suit-shorts-ss27-photo', 'Bermuda suit shorts.', '14 October 2026')],
  related=['fc-ss27-men-themes-short-story', 'fc-ss27-men-themes-ventilated-tailoring'])

rep(category='silhouettes', subsection='knit', slug='knit-shape-and-fit-outlook', title="SS27 Men's Knit Shape and Fit Outlook",
  summary='Knitwear goes light and textured: knitted polos and short-sleeve knit shirts, open-stitch summer knits, sun-faded cables and V-necks, cut closer to the body.',
  sections=[
   {'heading': 'The evidence', 'body': f'''Brunello Cucinelli showed rainbow cable-knit sweaters with a sun-faded finish{ref(1)}; Hypebeast pointed to the V-neck sweater in orange{ref(2)}. Première Vision's SS27 knit selection highlights flat, Derby and Richelieu ribs that are more elastic and elongated than jersey, and retro-sport stitches such as honeycomb piqué, diamond and wheat stitch{ref(3)}. Its overview adds cool wools and extra-fine merino{ref(4)}. Milan used knits within lighter, closer silhouettes{ref(5)}.'''},
   {'heading': 'Shapes and fit', 'body': '- **Knitted polo and short-sleeve knit shirt:** the summer shirt replacement; fit close at the shoulder, straight body.\n- **V-neck sweater:** close fit, worn alone or over a T-shirt.\n- **Open-stitch summer knit:** relaxed, for layering over shirts.\n- **Cable crewneck in a light yarn:** classic shape, sun-faded colour.\n- **Rib tank:** close, for layering under open shirts and jackets.'},
  ],
  timing='In stores February to July 2027. Knit polos and short-sleeve knit shirts are a long-running growth line; open-stitch knits are a summer idea.',
  products='- Knitted polos, knit shirts, V-necks, open-stitch knits, light cables, rib tanks.',
  design_implications='- Use 14 to 16 gauge for polos and knit shirts; check sheerness in light colours.\n- Retro-sport stitches (piqué, honeycomb) add texture without weight.',
  commercial_implications='- Knit polos and knit shirts are reorder lines: buy core colours deep.\n- Keep open-stitch and statement cables to smaller buys.',
  sources=src('wpp', 'hb', 'pvf', 'pvt', 'ap'), images=[img('open-johnny-collar-knit-polos-ss27-photo', 'Open Johnny-collar knit polo.', '14 October 2026')],
  related=['fc-ss27-men-fabrics-knit-fabric-direction'])

# ---------------------------------------------------------------- FABRICS
rep(category='fabrics', subsection='woven', slug='woven-fabric-direction', title="SS27 Men's Woven Fabric Direction",
  summary='Sheer shirting, satin, seersucker, soft leather and light tailoring wools lead SS27 menswear fabrics, with crease-proof stretch for travel.',
  trend_status='Rising',
  sections=[
   {'heading': 'The evidence', 'body': f'''- **Sheer shirting:** translucent fabrics from subtle to full transparency, at Kiko Kostadinov, Feng Chen Wang, Dior, Prada, Dries Van Noten, Jacquemus and Saint Laurent{ref(1)}.
- **Satin:** synthetic and silk satin, floral and white, with a billowing drape, at Willy Chavarria, Celine, GmbH and AMI{ref(1)}.
- **Silk and gauze tailoring:** fluid, almost sheer suits at Dior{ref(2)}.
- **Seersucker:** layered seersucker suiting at Thom Browne{ref(3)}.
- **Leather:** camel at Dior, beige suits at Saint Laurent, brown leather Bermudas at Sonia Carrasco and leather tracksuits at Givenchy; leather is becoming "more malleable", with "flexibility, fluidity, lightness, almost like butter", according to Alice Feillard of Galeries Lafayette{ref(2)}. Milan used woven and perforated leather for breathability{ref(3)}.
- **Tailoring cloth:** fine, lightweight wools blended with viscose, silk or linen; heavier double crepes with a dry, cool hand{ref(4)}.
- **Travel fabrics:** crease-proof stretch wool and technical materials at Herno{ref(5)}.'''},
   {'heading': 'Fabric by fabric', 'body': '''| Fabric | Construction and hand | Best uses | Status |
|---|---|---|---|
| Sheer cotton and silk voile | Very light, open | Shirts, layering | Rising |
| Satin (silk or synthetic) | Satin weave, fluid | Shirts, sets, trousers | Rising |
| Seersucker | Puckered plain weave, cool | Suits, shirts, shorts | Rising |
| Lightweight wool blends | Fine worsted with silk or linen | Summer suits | Core |
| Soft and perforated leather | Supple, breathable | Blousons, Bermudas, suits | Rising |
| Linen | Firm, cool | Shirts, suits, trousers | Core |
| Stretch and crease-proof wool | Technical worsted | Travel tailoring | Rising |'''},
  ],
  timing='In stores February to July 2027. Soft leather and seersucker continue into SS28 (Forecut assessment).',
  products='- Sheer shirts, satin shirts and sets, seersucker suits, leather blousons and shorts, linen and travel suits.',
  design_implications='- Sheer shirts need French seams and clean facings.\n- Test leather for colour fastness and perforation strength.\n- Choose crease-recovery finishes for travel suits.',
  commercial_implications='- Leather at premium; seersucker and linen at mid; satin across tiers depending on fibre.\n- State fibre content clearly on satins.',
  sources=src('hb', 'fu5', 'ap', 'pvf', 'wpp'), images=[img('leather-overshirts-ss27-photo', 'Leather overshirt.', '14 October 2026')],
  related=['fc-ss27-men-themes-ventilated-tailoring'])

rep(category='fabrics', subsection='knit', slug='knit-fabric-direction', title="SS27 Men's Knit Fabric Direction",
  summary='Cool wools and extra-fine merino, elastic ribs, retro-sport piqués and sun-faded cotton cables for SS27 menswear knits.',
  sections=[
   {'heading': 'The evidence', 'body': f'Première Vision highlighted flat, Derby and Richelieu ribs, more elastic and elongated than jersey, and retro-sport bindings, honeycomb piqués, plated knits, diamond and wheat stitches in slightly yellowed, sepia-like tones{ref(1)}; cool wools and extra-fine merino{ref(2)}. Brunello Cucinelli\'s cable knits were dyed with resin for a sun-faded, one-of-a-kind finish{ref(3)}.'},
   {'heading': 'Fabric by fabric', 'body': '''| Knit | Hand | Uses |
|---|---|---|
| Extra-fine merino | Smooth, cool | Polos, V-necks, knit shirts |
| Cool wool | Dry, crisp | Knit jackets |
| Cotton cable, garment-faded | Textured, soft | Crewnecks |
| Honeycomb and piqué | Structured, breathable | Polos |
| Derby and Richelieu rib | Elastic, close | Tanks, fitted knits |'''},
  ],
  timing='In stores February to July 2027.',
  products='- Knit polos and shirts, crewnecks, rib tanks, knit jackets.',
  design_implications='- Specify recovery and pilling tests on merino and rib.\n- Garment-dye cotton knits for the sun-faded look.',
  commercial_implications='- Merino at mid to premium; cotton cables at entry to mid.',
  sources=src('pvf', 'pvt', 'wpp'), images=[img('ribbed-polo-knits-ss27-photo', 'Ribbed polo knit.', '14 October 2026')],
  related=['fc-ss27-men-silhouettes-knit-shape-and-fit-outlook'])

# ---------------------------------------------------------------- TRIMS
rep(category='trims', subsection='trending-trims', slug='trending-trims-report', title="SS27 Men's Trending Trims Report",
  summary='Studs and stones on denim, embroidered birds and florals, contrast piping, flat pockets and coral-like beading lead SS27 menswear trims.',
  sections=[
   {'heading': 'The evidence', 'body': f'''- **Studded denim:** oversized stones on jeans and sweaters, seam outlines in studs and rhinestones, at Dolce & Gabbana, Louis Vuitton, Acne Studios and others{ref(1)}; Philipp Plein's crystal-encrusted denim takes days of handwork{ref(2)}.
- **Birds:** doves and cranes, hand-illustrated, embroidered, printed or silhouetted, at Yohji Yamamoto, Wooyoungmi and Shinyakozuka{ref(1)}.
- **Beading:** coral-like beaded accents at Dolce & Gabbana{ref(2)}.
- **Piping and contrast collars:** on Dior's sleepwear sets{ref(3)}.
- **Embroidery and colour gradients on shirts:** Egonlab, Dries Van Noten{ref(4)}.
- **Flat pockets:** cropped jackets with flat pockets that work as shirts at Prada{ref(2)}.
- **Punk hardware:** safety pins and chains at DSM Kei Ninomiya{ref(5)}.'''},
   {'heading': 'Trims table', 'body': '''| Trim | Application | Status |
|---|---|---|
| Studs and stones | Denim seams, jean pockets | Rising |
| Bird embroidery and prints | Shirts, tees | Emerging |
| Contrast piping | Sets, shirts | Rising |
| Flat patch pockets | Cropped jackets, overshirts | Core |
| Beading | Shirts, evening | Emerging |'''},
  ],
  products='- Studded jeans, embroidered shirts and tees, piped sets, flat-pocket jackets.',
  design_implications='- Stud and stone placement should follow seams for a cleaner look.\n- Test bead and stud attachment through washing.',
  commercial_implications='- Studded denim at premium; piping and embroidery work at mid price.',
  sources=src('hb', 'ap', 'fu5', 'fuh', 'wpp'), images=[img('embroidered-denim-ss27-photo', 'Embroidered denim.', '14 October 2026')])

rep(category='trims', subsection='trim-stories', slug='trim-stories-report', title="SS27 Men's Trim Stories",
  summary='Trims that carry each SS27 men\'s theme: flat pockets and raw edges for Short Story, light construction for Ventilated Tailoring, embroidery and feathers for Tender Masculinity, piping for Pyjama Polish.',
  sections=[
   {'heading': 'Short Story', 'body': f'Flat patch pockets, raw edges on collarless truckers{ref(1)}, button-fly and elastic waists on boxer shorts.'},
   {'heading': 'Ventilated Tailoring', 'body': f'Perforated and woven leather panels{ref(2)}, unlined construction, light horn and shell buttons.'},
   {'heading': 'Tender Masculinity', 'body': f'Organza feathers and cornflower-blue embellishment at Simone Rocha{ref(3)}; embroidered florals; brooches.'},
   {'heading': 'Pyjama Polish', 'body': f'Black collars and piping on khaki, blue and beige sets at Dior{ref(4)}; covered buttons; drawstrings.'},
  ],
  design_implications='- One trim family per theme, used consistently.',
  commercial_implications='- Trims refresh core shirts and jackets without new patterns.',
  sources=src('hb', 'ap', 'wpp', 'fu5'), images=[])

rep(category='trims', subsection='trim-market-strategy', slug='trim-market-strategy-report', title="SS27 Men's Trim Market Strategy",
  summary='In a low-growth 2027, use piping, embroidery and pocket details to update core menswear; keep hand-applied studs and beading for premium pieces.',
  sections=[
   {'heading': 'The market context', 'body': f'Fashion is expected to remain in low single-digit growth in 2027, with high freight, energy and financing costs, and markdown risk from excess stock{ref(1)}. In the EU, large companies may not destroy certain unsold apparel since 19 July 2026{ref(1)}.'},
   {'heading': 'Build, test, sell through', 'body': f'''| Action | Trims |
|---|---|
| Build | Contrast piping, flat pockets, embroidered motifs |
| Test | Studs and stones{ref(2)}, bird embroidery{ref(2)}, beading |
| Sell through | Heavy distressing and logo hardware |'''},
   {'heading': 'By market', 'body': f'- **India and the Gulf:** embroidery and piping suit festive and resort dressing; India\'s GDP grew 7.8% year on year in the second quarter of 2026{ref(1)}.\n- **Europe:** keep trims modular so unsold stock can be reworked.\n- **United States:** use trims to differentiate core shirts at full price.'},
  ],
  design_implications='- Design trims that can be added late (embroidery, piping) to respond to sales.',
  commercial_implications='- Track sell-through by trim variant and chase winners.',
  sources=src('fu27', 'hb'), images=[])

rep(category='trims', subsection='trim-innovations', slug='trim-innovations-report', title="SS27 Men's Trim Innovations",
  summary='Cooling and performance details move into menswear: fan-cooled garments, running-vest bottle holders and passport pockets, alongside chrome-free leather components.',
  sections=[
   {'heading': 'The evidence', 'body': f'''- **Integrated cooling:** Rick Owens showed inflatable tracksuits with integrated fans using Adidas\'s Climacool heat-regulation technology{ref(1)}.
- **Performance details:** Y-3 showed a running vest with bottle holders{ref(1)}.
- **Travel details:** Herno added passport-sized pockets to crease-proof travel pieces{ref(2)}.
- **Chrome-free leather:** Margaret Howell\'s Dr Martens 1461 uses chrome-free leather by C.F. Stead, designed to patina{ref(2)}.'''},
   {'heading': 'Readiness', 'body': '| Innovation | Readiness (Forecut assessment) |\n|---|---|\n| Passport and utility pockets | Ready |\n| Bottle and gear holders | Ready from sportswear suppliers |\n| Chrome-free leather trims | Ready; check supply |\n| Integrated fans | Experimental; showpieces only |'},
  ],
  design_implications='- Add functional pockets to travel tailoring and outerwear.',
  commercial_implications='- Functional details justify full price on core pieces.',
  sources=src('fuh', 'wpp'), images=[])

# ---------------------------------------------------------------- STYLING
rep(category='styling', subsection='celebrity-influence', slug='celebrity-influence-report', title="SS27 Men's Celebrity Influence",
  summary='Front rows and designer-celebrities shaped SS27 menswear: Pharrell Williams\'s surf-themed Louis Vuitton and music stars at couture point to soft leather, satin and statement accessories.',
  sections=[
   {'heading': 'What was seen', 'body': f'''- Pharrell Williams built a sandy beach and an artificial wave for Louis Vuitton\'s surf-themed show{ref(1)}, and Louis Vuitton showed Speedy bags in many colours and beaded monogram versions{ref(2)}.
- At Paris couture week, Bad Bunny, Michelle Yeoh and Emma Corrin were among the stars at Schiaparelli{ref(3)}.
- Menswear\'s crossover with womenswear, noted by GQ France\'s Patrick Clark{ref(1)}, is visible in what male stars wear: satin, sheer shirts and jewellery.'''},
   {'heading': 'Looks to build', 'body': '- Soft leather blouson with a white tee and straight trousers.\n- Satin shirt open over a rib tank.\n- Beaded or coloured bag as the single statement.'},
  ],
  design_implications='- Translate red-carpet ideas into wearable fabrics and one statement piece.',
  commercial_implications='- Time campaigns to festival and award seasons; avoid using celebrity names without agreements.',
  sources=src('fu5', 'cov', 'scmp'),
  images=[])

rep(category='styling', subsection='casualwear', slug='casualwear-styling-report', title="SS27 Men's Casualwear Styling",
  summary='Casual SS27 menswear: oversized tees and polos, shirts tied at the waist, "I ♥" graphics, shorts with sporty jackets and flip-flops with smart looks.',
  sections=[
   {'heading': 'The evidence', 'body': f'''At Pitti Uomo, street style favoured oversized T-shirts, polos and colourful shirts tied around the waist{ref(1)}. In Paris, "I ♥" T-shirts were reinterpreted by 3.Paradis, Ami and Doublet; sporty jackets were layered over classic menswear; and lace-up ballet flats, boots and flip-flops were worn with both smart and athletic looks{ref(2)}. Dior styled a fluid check blazer with a loosely buttoned shirt, ripped jeans and a scarf-tie{ref(2)}.'''},
   {'heading': 'Formulas', 'body': '- **Oversized tee + tailored shorts + loafers.**\n- **Polo + straight jeans + shirt tied at the waist.**\n- **Graphic tee + check blazer + ripped jeans.**\n- **Sporty jacket over shirt and tailored trousers.**\n- **Camp shirt set + flip-flops or ballet flats.**'},
  ],
  design_implications='- Design casual pieces in the season palette so they mix with tailoring.',
  commercial_implications='- Graphic tees and polos are reorder lines; keep them in core colours.',
  sources=src('wpp', 'fuh'), images=[img('heritage-rugby-polos-ss27-photo', 'Heritage rugby polo.', '14 October 2026')])

rep(category='styling', subsection='formalwear', slug='formalwear-styling-report', title="SS27 Men's Formalwear Styling",
  summary='Formal SS27 menswear: the lighter suit with an open neck, monochrome black suits, leather suiting and tuxedos cut for both men and women.',
  sections=[
   {'heading': 'The evidence', 'body': f'''Designers broadly agreed that a well-dressed man still wears a suit, but lighter, with open necklines and unbuttoned or transparent shirts{ref(1)}. Paris showed black suits with matching trousers and monochrome dressing at Celine, IM Men and Valette Studio{ref(2)}. Saint Laurent used beige leather for suits{ref(3)}. At couture, Elie Saab cut tuxedos and capes for women as well as men{ref(4)}.'''},
   {'heading': 'Formulas', 'body': '- **Light suit + open-neck shirt + loafers.**\n- **Black suit + black shirt, no tie.**\n- **Beige or camel leather jacket + matching trousers.**\n- **Seersucker suit + knit polo.**\n- **Tuxedo jacket + satin shirt for evening.**'},
  ],
  design_implications='- Shirts designed to be worn open: collar that holds its shape without a tie.',
  commercial_implications='- Offer suits as separates; summer weights lead.',
  sources=src('ap', 'fuh', 'fu5', 'apc'), images=[img('double-breasted-jackets-ss27-photo', 'Double-breasted jacket.', '14 October 2026')])

rep(category='styling', subsection='partywear', slug='partywear-styling-report', title="SS27 Men's Partywear Styling",
  summary='Party SS27 menswear: satin shirts and sets, crystal and studded denim, sheer shirting and gold.',
  sections=[
   {'heading': 'The evidence', 'body': f'Satin, including a golden V-neck and floral satin sets{ref(1)}; studded and crystal denim at Dolce & Gabbana, Louis Vuitton and Philipp Plein{ref(1)}{ref(2)}; sheer shirting{ref(1)}; coral-like beading at Dolce & Gabbana{ref(2)}.'},
   {'heading': 'Formulas', 'body': '- **Floral satin set.**\n- **Studded jeans + black shirt.**\n- **Sheer shirt over a rib tank + black trousers.**\n- **Gold knit + tailored trousers.**'},
  ],
  design_implications='- Line sheer and beaded pieces where they touch skin.',
  commercial_implications='- Partywear sells close to events; buy shallow, deliver late spring.',
  sources=src('hb', 'ap'), images=[])

# ---------------------------------------------------------------- COUTURE
rep(category='couture', subsection='craft-techniques', slug='couture-craft-and-techniques-report', title="SS27 Men's Couture Craft and Techniques",
  summary='Hand craft in menswear: days of handwork on crystal denim, resin-dyed knits, hand-illustrated motifs and tailoring cut for both men and women.',
  sections=[
   {'heading': 'The evidence', 'body': f'''- Philipp Plein\'s crystal-encrusted denim takes days of handwork{ref(1)}.
- Brunello Cucinelli dyed cable knits with resin so each sun-faded piece is unique{ref(2)}.
- Yohji Yamamoto showed a hand-illustrated bird tee{ref(3)}; Sacai wove a vintage photo into a two-piece suit{ref(3)}.
- Martin Quad debuted in Milan with unusual tailoring techniques{ref(1)}.
- At couture, Elie Saab cut tuxedos and capes for both men and women and is expanding its menswear line{ref(4)}.'''},
   {'heading': 'Translating to ready-to-wear', 'body': '- One hand technique per piece (a hand-painted motif, a crystal seam line).\n- Garment-dyed or resin-dyed knits for one-of-a-kind colour.\n- Woven or engineered photographic prints for statement suits.'},
  ],
  design_implications='- Budget hand labour into hero pieces only.',
  commercial_implications='- Tell the craft story on the label; price as limited.',
  sources=src('ap', 'wpp', 'hb', 'apc'), images=[])

rep(category='couture', subsection='materials-details', slug='couture-materials-and-details-report', title="SS27 Men's Couture Materials and Details",
  summary='Elevated menswear materials and details: butter-soft leather, organza feathers, beading, satin and chrome-free leather.',
  sections=[
   {'heading': 'The evidence', 'body': f'''- **Butter-soft leather:** "flexibility, fluidity, lightness, almost like butter" (Alice Feillard, Galeries Lafayette){ref(1)}.
- **Organza feathers and embellishment:** Simone Rocha\'s men\'s show{ref(2)}.
- **Beading:** coral-like beads at Dolce & Gabbana{ref(3)}.
- **Chrome-free leather:** Margaret Howell x Dr Martens, by C.F. Stead{ref(2)}.
- **Satin:** silk and synthetic, floral and white{ref(4)}.'''},
  ],
  design_implications='- Source leather and feathers with traceability; check chrome-free claims.',
  commercial_implications='- Premium materials on a few hero pieces.',
  sources=src('fu5', 'wpp', 'ap', 'hb'), images=[])

# ---------------------------------------------------------------- BUSINESS
rep(category='business-strategy', subsection='category-opportunities', slug='category-opportunities-report', title="SS27 Men's Category Opportunities",
  summary='Growth categories for SS27 menswear: summer tailoring, shorts, cropped jackets, soft leather, knit polos and shirts, and two-piece sets.',
  sections=[
   {'heading': 'The evidence', 'body': f'''- **Tailoring is adapting, not disappearing:** designers broadly agreed that a well-dressed man still wears a suit, now lighter{ref(1)}.
- **Shorts:** microshorts in Milan{ref(1)}, smart shorts in Paris{ref(2)}, boxer shorts as outerwear{ref(3)}.
- **Cropped jackets:** the micro jacket{ref(3)}.
- **Leather:** across Louis Vuitton, Dior, Saint Laurent and Givenchy{ref(4)}.
- **Sets:** pyjama-inspired sets at Dior and Givenchy{ref(4)}.
- **Accessories:** Louis Vuitton offered Speedy bags in many colours{ref(5)}; jewellery and leather goods are projected to grow 4 to 6% a year from 2025 to 2027{ref(6)}.'''},
   {'heading': 'Opportunities', 'body': '1. Summer suits and suit shorts.\n2. Cropped blousons, especially leather and suede.\n3. Knit polos and knit shirts.\n4. Two-piece sets.\n5. Bags and accessories in season colours.'},
   {'heading': 'Categories to reduce', 'body': 'Very oversized tailoring and heavy four-season suits.'},
  ],
  design_implications='- Shift development time to summer-weight tailoring and sets.',
  commercial_implications='- Re-weight open-to-buy towards shorts, sets and cropped jackets.',
  sources=src('ap', 'fuh', 'hb', 'fu5', 'cov', 'fu27'), images=[])

rep(category='business-strategy', subsection='assortment-pricing', slug='assortment-and-pricing-strategy', title="SS27 Men's Assortment and Pricing Strategy",
  summary='Plan SS27 menswear for low growth: separates and sets that combine, summer tailoring sold as separates, shallow fashion buys and full price on what is new.',
  sections=[
   {'heading': 'The market', 'body': f'Fashion is expected to remain in low single-digit growth in 2027; sales up 4% with inventory up 10% is a weaker position than steady stock; mid-market brands face promotional pressure from luxury and value players{ref(1)}. Resale is expected to grow two to three times faster than first-hand fashion through 2027{ref(1)}.'},
   {'heading': 'Assortment', 'body': '| Tier | What goes in it |\n|---|---|\n| Core (about half) | Shirts in ice blue and white, straight trousers, knit polos, sand and tobacco |\n| Seasonal (about a third) | Summer suits, shorts, cropped blousons, sets, satin shirts |\n| Statement (the rest) | Studded denim, sheer shirts, skirts and aprons, orange and aquatic pieces |'},
   {'heading': 'Pricing', 'body': '- Full price on rising pieces (cropped jackets, summer suits, sets).\n- Value on core reorder lines.\n- Premium for leather and hand-finished pieces.\n- Sets priced to reward buying both pieces.'},
  ],
  design_implications='- Fewer styles, more combinations; shared fabrics across shirts and sets.',
  commercial_implications='- Weekly sales-to-stock tracking; chase winners.\n- In the EU, plan rework and resale routes for unsold stock.',
  sources=src('fu27'), images=[])

# ---------------------------------------------------------------- INNOVATIONS
rep(category='innovations', subsection='material-innovations', slug='material-innovations-report', title="SS27 Men's Material Innovations",
  summary='Materials for SS27 menswear: crease-proof stretch wool, technical cottons and water-repellent linen, chrome-free leather, softshell and heat-regulating sportswear fabrics.',
  sections=[
   {'heading': 'The evidence', 'body': f'''- Herno\'s travel collection uses crease-proof fabrics, stretch wool and technical materials{ref(1)}.
- Première Vision highlights technical cottons and water-repellent linens, and compact milanos and softshells{ref(2)}.
- Margaret Howell\'s Dr Martens 1461 uses chrome-free leather by C.F. Stead{ref(1)}.
- Rick Owens used Adidas\'s Climacool heat-regulation technology{ref(3)}.
- Balenciaga used lab-grown AMSilk silk in its July 2026 couture{ref(4)}.'''},
   {'heading': 'Readiness', 'body': '| Material | Readiness (Forecut assessment) |\n|---|---|\n| Stretch and crease-proof wool | Ready |\n| Water-repellent linen, technical cotton | Ready from specialist mills |\n| Chrome-free leather | Ready; limited supply |\n| Heat-regulating sport fabrics | Ready in sportswear |\n| Lab-grown silk | Early; showpieces only |'},
  ],
  design_implications='- Use technical wools in travel tailoring; water-repellent linen for unlined outerwear.',
  commercial_implications='- Verify every sustainability claim before using it.',
  sources=src('wpp', 'pvt', 'fuh', 'apc'), images=[])

rep(category='innovations', subsection='design-production', slug='design-and-production-innovations-report', title="SS27 Men's Design and Production Innovations",
  summary='Body scanning and 3D sampling, product data ready for the EU Digital Product Passport, and SS27 production planned around new EU rules and the Lunar New Year.',
  sections=[
   {'heading': 'The evidence', 'body': f'''- Balenciaga used 3D body scans to build mannequins for its couture{ref(1)}.
- The EU textiles Digital Product Passport delegated act is planned for the fourth quarter of 2027; since 19 July 2026, large companies may not destroy certain unsold apparel; since 1 July 2026, a temporary €3 duty applies per item on consignments up to €150{ref(2)}.
- Brands are diversifying sourcing towards Vietnam, Bangladesh, India, Turkey and Morocco{ref(2)}.
- Lunar New Year falls on 6 February 2027; factories slow from late January{ref(3)}.'''},
  ],
  design_implications='- Develop first samples in 3D; record fibre, origin and care for every style.',
  commercial_implications='- Build buffer time around Lunar New Year; buy shallower in the EU.',
  sources=src('apc', 'fu27', 'ph'), images=[])

write(R, OUT)
