"""SS27 Kids (all nine categories) and SS27 Girls (theme), 25 Nov 2026.
Evidence: Pitti Bimbo 103 (Florence, 24-25 June 2026), Playtime Paris (28-30 June 2026), Future Snoops for Playtime,
MilK Dressing Ideal, Junior Style, FashionUnited, Fortune Italia (Confindustria Moda data), Fatamadrina.
Boys, Toddler Boys and Toddler Girls are not published: no audience-specific SS27 evidence was found."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from src_ss27 import S, src, ref, write

S['js'] = {'title': 'Playtime Paris SS27: where fashion met the spirit of a summer music festival', 'publisher': 'Junior Style (Aleksandra Ataca)', 'url': 'https://juniorstyle.net/playtime-paris-ss27-where-fashion-met-the-spirit-of-a-summer-music-festival/', 'date': '30 June 2026'}
S['fata'] = {'title': 'Childrenswear fashion trends and forecast S/S 2027', 'publisher': 'Fatamadrina (surface design studio for childrenswear)', 'url': 'https://fatamadrina.eu/en/blogs/fashion-trends/kidswear-fashion-trends-ss-2027', 'date': '2026', 'note': 'Design studio forecast; used for season-wide fabric, silhouette and print notes'}
S['sp'] = {'title': 'Salt and Pepper: Spring/Summer 2027 brand profile', 'publisher': 'Pitti Immagine Bimbo', 'url': 'https://bimbo.pittimmagine.com/103/exhibitors/S/salt-and-pepper', 'date': 'June 2026'}

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'content', 'reports')
C = {'season': 'ss27', 'audience': 'kids', 'status': 'published', 'published': '2026-11-25',
     'research_period': 'Pitti Bimbo 103, Florence, 24-25 June 2026; Playtime Paris, 28-30 June 2026; analysis July to November 2026',
     'markets': 'Europe-led kidswear trade fairs; premium and mid-market childrenswear, newborn to teen'}
R = []
SAFE = '\n- Safety: no drawstrings or long cords at the hood, neck or waist of young children\'s clothing, in line with EN 14682; test the attachment strength of buttons, beads, shells and other decorations, and keep small detachable parts off baby and toddler pieces.'


def rep(**k):
    R.append(dict(C, kind=k.pop('kind', 'report'), images=[], **k))


# ---------------------------------------------------------------- THEMES
rep(kind='theme', category='themes', subsection='themes', slug='pool-days', title="SS27 Kids' Pool Days",
  summary='Summer swim and sun protection move to the centre of kidswear: UPF50+ swimwear and tees, quick-dry sets, beach towels and coordinated pool looks.',
  trend_status='Rising',
  sections=[
   {'heading': 'The story', 'body': f'''Pitti Bimbo 103 took "The Pitti Pool" as its theme and called itself "the most colorful summer edition yet"{ref(1)}. Swimwear, T-shirts and accessories with built-in UV filters were prominent: Fortune Italia notes they were recently niche products and are now becoming more common, driven by family concern for health and by changing climate conditions{ref(2)}. Newer lines emphasise breathability, quick drying and comfort{ref(2)}.

Exhibitors showed the idea across the range. Piccoli Principi's "Pearl & Tides" swimwear in two-pieces and swimsuits uses technical fabrics including sustainable lycra, and "each piece guarantees UV protection"; Teeter Totter's "Aegean Chromatique" offers UPF50+ swim and sportswear, backpacks and ultra-light, sand-free beach towels; Marie Raxevisky's "Beach Couture" line includes UPF 50+ certified swimwear, sarongs and skirts{ref(3)}.'''},
   {'heading': 'Colours', 'body': f'Aqua and soft navy with vintage pink and pastel green{ref(3)}, plus red as the accent. See SS27 Kids\' Season Colours.'},
   {'heading': 'Silhouettes', 'body': '- One-piece and two-piece swimsuits; long-sleeve swim tops.\n- Swim shorts and board shorts with matching tops.\n- Cover-ups: sarongs, skirts and terry tops.'},
   {'heading': 'Fabrics', 'body': f'UPF-rated swim fabrics including recycled or sustainable lycra{ref(3)}; quick-dry performance knits{ref(2)}; terry for cover-ups{ref(4)}.'},
   {'heading': 'Trims and details', 'body': 'Flat seams, covered elastics, zip garages at the neck, and labels printed rather than sewn where skin contact is high.'},
  ],
  timing='In stores March to August 2027; strongest for holiday and pool months. Forecut expects UV-protective kidswear to keep growing beyond SS27.',
  products='- UPF swimwear, rash guards, UV tees and hats, swim shorts, cover-ups, beach towels and bags.\n- Customers: families buying for holidays and summer camps; grandparents buying gifts.',
  design_implications='- Only claim UPF ratings that have been tested to a recognised standard such as EN 13758 or AS/NZS 4399, and state the rating on the label.\n- Design swim, tee and cover-up as one coordinated set.' + SAFE,
  commercial_implications='- Build depth in swimwear and UV tees; they sell as sets.\n- UPF ratings support full price; keep them visible on product pages.',
  sources=src('pbn', 'fit', 'pbs', 'milk'), related=['fc-ss27-kids-innovations-material-innovations-report'])

rep(kind='theme', category='themes', subsection='themes', slug='lull', title="SS27 Kids' Lull",
  summary='Elevated basics set to the rhythm of the sea: calm, coastal, intentional pieces where design serves well-being rather than novelty.',
  trend_status='Rising',
  sections=[
   {'heading': 'The story', 'body': f'''Future Snoops named Lull one of its two kids' trends for SS27, presented at Playtime Paris and New York. Lull is "set to the rhythm of the sea" and celebrates "the quiet elegance of elevated basics"; it "favors emotional resonance over novelty and mindfulness over momentum", with design as "a tool for well-being, presence, and lasting impact"{ref(1)}. Its inspirations include coastal comfort, California casual design and seaside living{ref(1)}.

The trade fairs back the mood. Fortune Italia concludes that childrenswear is moving towards more attention to functionality, material quality and garment durability, with less short-lived seasonal fashion{ref(2)}. Gray Label shows a minimalist range with no patterns except stripes, in pieces described as "exceptionally soft"{ref(3)}. Cadhan showed soft organic cotton pyjamas{ref(4)}.'''},
   {'heading': 'Colours', 'body': 'Sand, aqua, soft navy and white: the calmer half of the SS27 kids\' palette.'},
   {'heading': 'Silhouettes', 'body': f'- Relaxed shapes, oversized T-shirts, dungarees and lightweight jackets{ref(5)}.\n- Coordinated sets; easy pull-on trousers and shorts.'},
   {'heading': 'Fabrics', 'body': f'Lightweight linen, voile, organic cotton and terry{ref(5)}; soft jersey.'},
   {'heading': 'Trims and details', 'body': 'Subtle details and clever contrasts: tonal stitching, stripe trims, wooden or corozo buttons, minimal branding.'},
  ],
  timing='In stores February to August 2027. A long-running direction that supports year-round core ranges.',
  products='- Core tees, stripe tops, linen shirts and shorts, dungarees, sets, pyjamas.\n- Customers: parents buying fewer, better pieces; gift buyers.',
  design_implications='- Spend on fabric hand and fit, not on decoration.\n- Build pieces that pass between siblings: neutral colour, durable seams.' + SAFE,
  commercial_implications='- Core lines suit replenishment and longer selling periods.\n- Price on quality; avoid early markdowns.',
  sources=src('fs', 'fit', 'fupb', 'pbs', 'fata'))

rep(kind='theme', category='themes', subsection='themes', slug='happenstance', title="SS27 Kids' Happenstance",
  summary='Child-led design and the charm of the unexpected: nostalgic quirks, exaggerated silhouettes, playful embellishment and collections built around characters and stories.',
  trend_status='Rising',
  sections=[
   {'heading': 'The story', 'body': f'''Future Snoops' second SS27 kids' trend, Happenstance, is "rooted in curiosity and spontaneity": "child-led design leads the way", with "nostalgic quirks, exaggerated silhouettes, and playful embellishments"{ref(1)}.

At Playtime Paris, Junior Style saw a "growing whimsical trend" and collections presented as "worlds, characters, adventures, and emotional experiences", including Tinycottons\' "wonderfully chic bellboy character"{ref(2)}. Storytelling leads at Pitti Bimbo too: Bobo Choses publishes illustrated books that accompany its collections, and Halcyon Nights builds several graphic universes each season with patterns designed by a panel of artists{ref(3)}. Smallable\'s buyers came looking for "a little wow factor, something that cannot be found elsewhere"{ref(3)}.'''},
   {'heading': 'Colours', 'body': 'Lemon, coral, grass green and lavender, with red: the brighter half of the SS27 kids\' palette.'},
   {'heading': 'Silhouettes', 'body': '- Exaggerated collars and puff sleeves; balloon shorts; oversized shirts.\n- Character costumes and uniform references (bellboy, sailor).\n- Reversible pieces.'},
   {'heading': 'Fabrics', 'body': 'Poplin and twill for character pieces; terry and jersey for play; crinkled and textured cottons.'},
   {'heading': 'Trims and details', 'body': f'Embroidered characters, appliqué, contrast piping, novelty buttons; Poco Blush\'s T-shirt releases a minty scent when crumpled{ref(3)}.'},
  ],
  timing='In stores February to August 2027. Strongest in independent and online boutiques.',
  products='- Character shirts and sets, printed dresses, novelty tees, statement collars, accessories and bags.\n- Customers: boutique shoppers and gift buyers; children aged roughly 3 to 10 who choose their own clothes.',
  design_implications='- Build each collection around a story, with a print and a character that appear across products.\n- Use one exaggerated element per piece.' + SAFE,
  commercial_implications='- Smaller, sharper buys; character stories work as capsules.\n- Use the story in product pages and store displays.',
  sources=src('fs', 'js', 'fupb'))

rep(kind='theme', category='themes', subsection='themes', slug='sailor-stripes', title="SS27 Kids' Sailor Stripes",
  summary='Nautical classics return with energy: sailor collars, navy and red, and stripes in every direction.',
  trend_status='Rising',
  sections=[
   {'heading': 'The story', 'body': f'''At Playtime Paris, "red emerged as one of the defining colors of the season", "stripes were another dominant trend" in horizontal, vertical and diagonal runs, and "sailor collars, navy blues, nautical details" appeared throughout, tied to summer travel and the seaside{ref(1)}. MilK\'s Dressing Idéal included a sailor top by Loir Paris{ref(2)}. At Pitti Bimbo, Cozmo showed striped T-shirts and coordinated sets{ref(3)} and Gray Label kept to stripes alone{ref(4)}. Fatamadrina lists nautical themes and a "Nostalgic Nautical" board{ref(5)}.'''},
   {'heading': 'Colours', 'body': '| Colour | Pantone TCX (nearest) | HEX |\n|---|---|---|\n| Navy | 19-3920 TCX Peacoat | #2B2E43 |\n| Red | 18-1664 TCX Fiery Red | #D01C1F |\n| White | optic white | #FFFFFF |\n| Sand | 13-1009 TCX | #DAC7AB |'},
   {'heading': 'Silhouettes', 'body': '- Sailor-collar tops and dresses; Breton tees.\n- Shorts and dungarees with button fronts.\n- Coordinated stripe sets.'},
   {'heading': 'Fabrics', 'body': 'Cotton jersey and interlock for stripes; poplin and twill for collared pieces; denim.'},
   {'heading': 'Trims and details', 'body': 'Sailor collars with contrast tape, anchor or metal-look buttons, ric-rac.'},
  ],
  timing='In stores February to July 2027. A classic with renewed energy; red is the newness.',
  products='- Breton tees, sailor tops, stripe sets, dungarees, red accessories and sandals.',
  design_implications='- Vary stripe direction and width across the range.\n- Engineer stripes to match at seams.' + SAFE,
  commercial_implications='- Stripes are reorder lines; red and sailor collars are the seasonal buys.',
  sources=src('js', 'milk', 'pbs', 'fupb', 'fata'))

# ---------------------------------------------------------------- COLOURS
rep(category='colours', subsection='season-colours', slug='season-colour-analysis', title="SS27 Kids' Season Colour Analysis",
  summary='Bright, saturated summer colour returns to kidswear, led by red, aqua and lemon, balanced by soft pastels and calm neutrals.',
  trend_status='Rising',
  sections=[
   {'heading': 'The palette', 'body': f'''| Colour | Pantone TCX (nearest) | HEX | Role |
|---|---|---|---|
| Lemon | 12-0642 TCX | #EDDD59 | Seasonal |
| Aqua | 14-4816 TCX | #58C9D4 | Seasonal |
| Grass green | 16-0237 TCX | #75A14F | Seasonal |
| Coral | 16-1541 TCX | #F6745F | Seasonal |
| Lavender | 14-3812 TCX | #BDB0D0 | Seasonal |
| Sand | 13-1009 TCX | #DAC7AB | Core |
| Red | 18-1664 TCX | #D01C1F | Accent, newly strong |
| Navy | 19-3920 TCX | #2B2E43 | Core |

The first six are Forecut\'s SS27 kidswear palette{ref(1)}; red and navy are added from the June trade fairs{ref(2)}. Confirm codes against a physical Pantone book before dyeing.'''},
   {'heading': 'The evidence', 'body': f'''- **Red:** "one of the defining colors of the season" at Playtime Paris, from bright statement shades to deeper tones{ref(2)}.
- **Navy and nautical:** sailor collars and navy blues throughout Playtime Paris{ref(2)}.
- **Colour overall:** Pitti Bimbo called its June edition "the most colorful summer edition yet"{ref(3)}; Pisamonas\' SS27 shoes arrive "full of color"{ref(4)}; Poco Blush showed bold hues for girls{ref(5)}.
- **Soft pastels:** Piccoli Principi\'s "Pearl & Tides" runs from vintage pink to pastel green and soft navy{ref(4)}.
- **Neutrals:** Fatamadrina notes "neutrals enhanced with terracotta and sage green" alongside bright, saturated colours{ref(6)}.'''},
   {'heading': 'Colour groups', 'body': '- **Core:** navy, sand, white.\n- **Seasonal brights:** lemon, aqua, coral, grass green.\n- **Seasonal soft:** lavender, vintage pink, pastel green.\n- **Accent:** red.'},
   {'heading': 'By age', 'body': '- **Baby and toddler:** soft pastels and sand, with one bright accent.\n- **Kids:** brights with navy and white.\n- **Older kids and teens:** red, navy and stripes; lavender for girls who want softer colour.'},
  ],
  timing='Red is rising for SS27; brights return after several pastel-led seasons. Soft pastels stay core for baby.',
  products='- Red: tees, sandals, accessories. Aqua and lemon: swim and play. Lavender: dresses and knits. Navy and sand: bottoms and basics.',
  design_implications='- Lab-dip brights on both jersey and swim fabric; they shift between substrates.\n- Check colour fastness to chlorinated and salt water for swim.',
  commercial_implications='- Navy and sand carry volume; brights and red carry newness.',
  sources=src('cf', 'js', 'pbn', 'pbs', 'fupb', 'fata'))

rep(category='colours', subsection='theme-colour-palettes', slug='theme-colour-palettes-report', title="SS27 Kids' Theme Colour Palettes",
  summary='A working palette for each SS27 kids\' theme: Pool Days, Lull, Happenstance and Sailor Stripes.',
  sections=[
   {'heading': 'Palettes by theme', 'body': '''| Theme | Lead | Accent | Range colours |
|---|---|---|---|
| Pool Days | Aqua 14-4816 TCX | Coral 16-1541 TCX | Navy 19-3920 TCX, white, vintage pink |
| Lull | Sand 13-1009 TCX | Aqua 14-4816 TCX | White, navy |
| Happenstance | Lemon 12-0642 TCX | Red 18-1664 TCX | Grass green 16-0237 TCX, lavender 14-3812 TCX |
| Sailor Stripes | Navy 19-3920 TCX | Red 18-1664 TCX | White, sand |'''},
   {'heading': 'Why these palettes', 'body': f'They follow the trade-fair evidence: Piccoli Principi\'s vintage pink, pastel green and soft navy swim{ref(1)}; red, navy and nautical at Playtime Paris{ref(2)}; Future Snoops\' calm, coastal Lull and playful Happenstance{ref(3)}.'},
  ],
  design_implications='- Lead colour on most pieces; accent on one item or trim per outfit.\n- Share navy and white across themes so pieces mix.',
  commercial_implications='- Depth in lead colours; accents as small buys.',
  sources=src('pbs', 'js', 'fs'))

rep(category='colours', subsection='colour-stories', slug='colour-stories-report', title="SS27 Kids' Colour Stories",
  summary='Three colour stories for SS27 kidswear: Pool Brights, Seaside Calm and Red and Navy.',
  sections=[
   {'heading': 'Pool Brights', 'body': f'Aqua, lemon, coral and grass green for swim, play and summer camp. It reflects Pitti Bimbo\'s pool theme and colourful summer edition{ref(1)}.'},
   {'heading': 'Seaside Calm', 'body': f'Sand, white, soft navy, vintage pink and pastel green for basics, baby and nightwear. It follows Piccoli Principi\'s "Pearl & Tides" palette{ref(2)} and Future Snoops\' Lull{ref(3)}.'},
   {'heading': 'Red and Navy', 'body': f'Red, navy and white for stripes, sailor pieces and denim, from Playtime Paris{ref(4)}.'},
  ],
  design_implications='- One delivery or capsule per story.\n- Seaside Calm mixes with both other stories.',
  commercial_implications='- Seaside Calm and Red and Navy carry volume; Pool Brights peaks before holidays.',
  sources=src('pbn', 'pbs', 'fs', 'js'))

# ---------------------------------------------------------------- SILHOUETTES
rep(category='silhouettes', subsection='woven', slug='woven-silhouette-direction', title="SS27 Kids' Woven Silhouette Direction",
  summary='Relaxed, easy-moving woven shapes for SS27 kidswear: dungarees, pleated and reversible dresses, sailor-collar tops, lightweight jackets and denim.',
  trend_status='Rising',
  sections=[
   {'heading': 'The evidence', 'body': f'''Fatamadrina lists relaxed shapes, dungarees, oversized T-shirts, pleated dresses and lightweight jackets as SS27 silhouettes{ref(1)}. At Playtime Paris, denim\'s "presence felt stronger and more diverse than in recent seasons", across everyday, workwear-inspired and coordinated styles; sailor collars ran through the show{ref(2)}. Poco Blush showed a loose, printed, reversible dress{ref(3)}. Future Snoops\' Happenstance calls for "exaggerated silhouettes"{ref(4)}.'''},
   {'heading': 'Shapes to lead with', 'body': '- **Dungarees and short overalls** in denim and cotton twill.\n- **Pleated and loose dresses**, including reversible styles.\n- **Sailor-collar tops and dresses.**\n- **Lightweight jackets:** denim, chore and overshirt shapes.\n- **Relaxed shorts** with elastic backs and real pockets.'},
   {'heading': 'Shapes to watch', 'body': 'Exaggerated collars and balloon shapes from Happenstance; use on one hero piece per drop.'},
  ],
  timing='In stores February to August 2027.',
  products='- Dungarees, dresses, sailor tops, denim jackets and shorts.',
  design_implications='- Easy dressing: wide neck openings, front fastenings for younger ages, adjustable straps on dungarees.\n- Allow room for movement and growth.' + SAFE,
  commercial_implications='- Denim and dungarees are strong core buys; reversible dresses offer two looks for one price.',
  sources=src('fata', 'js', 'fupb', 'fs'))

rep(category='silhouettes', subsection='knit', slug='knit-shape-and-fit-outlook', title="SS27 Kids' Knit Shape and Fit Outlook",
  summary='Knit shapes for SS27 kidswear: oversized T-shirts, striped tees, coordinated jersey sets, terry tops, swimwear and soft pyjamas.',
  sections=[
   {'heading': 'The evidence', 'body': f'''Cozmo showed striped T-shirts and coordinated sets forming a total look, for newborns to 14 years{ref(1)}; Piupiuchick\'s terry top was in MilK\'s Dressing Idéal, with pyjamas from Oda London{ref(2)}; Cadhan showed organic cotton pyjamas{ref(1)}. Oversized T-shirts are among Fatamadrina\'s SS27 silhouettes{ref(3)}. Sport influence was "presented through a more refined, creative lens" at Playtime Paris{ref(4)}.'''},
   {'heading': 'Shapes and fit', 'body': '- **Oversized tee:** dropped shoulder, longer body.\n- **Striped tee:** classic or boxy fit.\n- **Jersey set:** tee or sweatshirt with shorts.\n- **Terry top and shorts.**\n- **Pyjamas:** close, comfortable fit for sleep.\n- **Swim:** one-piece, two-piece, rash guard.'},
  ],
  timing='In stores February to August 2027.',
  products='- Tees, sets, terry pieces, pyjamas, swimwear.',
  design_implications='- In many markets, children\'s nightwear has its own flammability rules; check them before choosing loose-fitting pyjama shapes and fabrics.' + SAFE,
  commercial_implications='- Tees and sets are high-volume reorder lines.',
  sources=src('pbs', 'milk', 'fata', 'js'))

# ---------------------------------------------------------------- FABRICS
rep(category='fabrics', subsection='woven', slug='woven-fabric-direction', title="SS27 Kids' Woven Fabric Direction",
  summary='Lightweight linen, voile, organic cotton poplin, gingham and diverse denim lead SS27 kidswear wovens, with recycled and certified materials.',
  sections=[
   {'heading': 'The evidence', 'body': f'''Collections increasingly use recycled fibres, organic cotton and certified materials{ref(1)}. Fatamadrina lists lightweight linen, voile and organic cotton, with gingham among SS27 prints{ref(2)}. Denim was "stronger and more diverse than in recent seasons" at Playtime Paris{ref(3)}. Marie Raxevisky uses fine Italian fabrics and recycled materials{ref(4)}.'''},
   {'heading': 'Fabric by fabric', 'body': '''| Fabric | Hand | Uses |
|---|---|---|
| Organic cotton poplin | Crisp, light | Shirts, dresses |
| Linen and linen-cotton | Cool, textured | Shirts, shorts, dresses |
| Voile | Very light | Dresses, blouses, layers |
| Gingham cotton | Light | Dresses, shirts |
| Denim, light to mid weight | Durable | Dungarees, jackets, shorts |
| Twill | Firm | Shorts, trousers |'''},
  ],
  design_implications='- Pre-wash linen and denim to control shrinkage.\n- Certify organic claims (for example GOTS) before using them.' + SAFE,
  commercial_implications='- Organic cotton and linen support a premium; denim is volume.',
  sources=src('fit', 'fata', 'js', 'pbs'))

rep(category='fabrics', subsection='knit', slug='knit-fabric-direction', title="SS27 Kids' Knit Fabric Direction",
  summary='Organic cotton jersey and interlock, terry, micro-mesh, and UPF-rated performance and swim fabrics for SS27 kidswear.',
  sections=[
   {'heading': 'The evidence', 'body': f'''Terry and micro-mesh are among Fatamadrina\'s SS27 fabrics{ref(1)}; MilK chose a terry top{ref(2)}. Salt and Pepper describes its SS27 fabrics as sustainable organic cotton, "exceptionally soft and gentle on the skin"{ref(3)}. Cadhan uses soft organic cotton for pyjamas{ref(4)}. Teeter Totter uses performance fabrics with responsible materials and UPF50+ protection; Piccoli Principi uses technical fabrics including sustainable lycra{ref(4)}. Newer lines emphasise breathability and quick drying{ref(5)}.'''},
   {'heading': 'Fabric by fabric', 'body': '''| Knit | Hand | Uses |
|---|---|---|
| Organic cotton jersey | Soft | Tees, sets |
| Interlock | Smooth, stable | Baby, pyjamas |
| Terry | Soft, absorbent | Tops, shorts, cover-ups |
| Micro-mesh | Light, airy | Sport, layers |
| UPF swim and performance knits | Stretch, quick-dry | Swim, rash guards |'''},
  ],
  design_implications='- Test UPF after stretch and wet, when protection can drop.' + SAFE,
  commercial_implications='- Organic cotton basics support repeat purchase; UPF supports full price.',
  sources=src('fata', 'milk', 'sp', 'pbs', 'fit'))

# ---------------------------------------------------------------- TRIMS
rep(category='trims', subsection='trending-trims', slug='trending-trims-report', title="SS27 Kids' Trending Trims Report",
  summary='Sailor collars and nautical tape, handcrafted embroidery, character appliqués, shells and sparkling details lead SS27 kidswear trims, under strict safety rules.',
  sections=[
   {'heading': 'The evidence', 'body': f'''- **Nautical details:** sailor collars and navy at Playtime Paris{ref(1)}.
- **Character elements and layered accessories**{ref(1)}.
- **Handcrafted embroidery:** Fatamadrina\'s "Wildflowers Bloom" uses delicate handcrafted embroidery{ref(2)}.
- **Shells, pebbles, seaweed and embroideries:** on Selini Action\'s handmade costumes{ref(3)}.
- **Sparkle:** Pitti Bimbo\'s Pirouette runway promised "bold looks, sparkling details, and positive vibes"{ref(4)}.'''},
   {'heading': 'Trims table', 'body': '| Trim | Application | Status | Safety note |\n|---|---|---|---|\n| Sailor collar and tape | Tops, dresses | Rising | None specific |\n| Embroidery | Dresses, shirts | Rising | Soft backing on skin side |\n| Character appliqué | Tees, sets | Core | Securely stitched, no loose edges |\n| Shell and bead decoration | Swim, costumes | Emerging | Pull-test; avoid for under-3s |\n| Sequins and sparkle | Party | Seasonal | Line the inside; check edges |'},
  ],
  design_implications='- Prefer printed or embroidered motifs to attached parts for baby and toddler.' + SAFE,
  commercial_implications='- Embroidery and appliqué add value to core tees and dresses without new blocks.',
  sources=src('js', 'fata', 'pbs', 'pbn'))

rep(category='trims', subsection='trim-stories', slug='trim-stories-report', title="SS27 Kids' Trim Stories",
  summary='Trims that carry each SS27 kids\' theme: flat seams for Pool Days, minimal details for Lull, characters for Happenstance and tape for Sailor Stripes.',
  sections=[
   {'heading': 'Pool Days', 'body': 'Flat seams, covered elastics, zip garages, printed labels.'},
   {'heading': 'Lull', 'body': f'Tonal stitching, stripe trims, natural buttons; subtle details and clever contrasts{ref(1)}.'},
   {'heading': 'Happenstance', 'body': f'Character embroidery, appliqué, novelty buttons and playful embellishment{ref(1)}.'},
   {'heading': 'Sailor Stripes', 'body': f'Sailor collars, contrast tape, anchor-look buttons{ref(2)}.'},
  ],
  design_implications='- One trim family per theme.' + SAFE,
  commercial_implications='- Trims refresh carry-over blocks.',
  sources=src('fs', 'js'))

rep(category='trims', subsection='trim-market-strategy', slug='trim-market-strategy-report', title="SS27 Kids' Trim Market Strategy",
  summary='In a slowing childrenswear market, use trims to add value to fewer, longer-lasting pieces; avoid fragile decoration that shortens a garment\'s life.',
  sections=[
   {'heading': 'The market context', 'body': f'In Italy, childrenswear exports fell 9.3% and domestic sales 2.6% in 2025, according to Confindustria Moda data reported by Fortune Italia; families are focused on sustainability and well-being, and the sector is moving toward functionality, material quality and durability{ref(1)}. Fashion overall is expected to remain in low single-digit growth in 2027{ref(2)}.'},
   {'heading': 'Build, test, sell through', 'body': '| Action | Trims |\n|---|---|\n| Build | Embroidery, appliqué, sailor collars and tape |\n| Test | Shell and bead decoration (older kids only), sparkle for party |\n| Sell through | Fragile glued decoration |'},
  ],
  design_implications='- Choose trims that survive repeated washing and hand-me-downs.' + SAFE,
  commercial_implications='- Durable trims support resale and hand-me-down value, which parents increasingly consider.',
  sources=src('fit', 'fu27'))

rep(category='trims', subsection='trim-innovations', slug='trim-innovations-report', title="SS27 Kids' Trim Innovations",
  summary='Functional and sensory details in kidswear: scented finishes, UPF-rated components, reversible construction and gadgets attached to bags.',
  sections=[
   {'heading': 'The evidence', 'body': f'''- Poco Blush\'s T-shirt releases a minty scent when crumpled; its printed dress is reversible{ref(1)}.
- Sticky Lemon showed a mini digital camera that attaches to a bag{ref(1)}.
- Cadhan uses dermatologically tested fragrances in its sleep line, with a "Sogni d\'oro" line for sensitive skin{ref(2)}.
- Teeter Totter\'s ultra-light, sand-free beach towels{ref(2)}.'''},
   {'heading': 'Readiness', 'body': '| Innovation | Readiness (Forecut assessment) |\n|---|---|\n| Reversible construction | Ready |\n| Sand-free towel fabrics | Ready |\n| Scented finishes | Test skin safety and wash durability first |\n| Bag-attached gadgets | Accessory category; check toy and battery rules |'},
  ],
  design_implications='- Any finish on skin-contact garments needs skin-safety evidence.' + SAFE,
  commercial_implications='- Novelty sells as gift and story; keep buys small.',
  sources=src('fupb', 'pbs'))

# ---------------------------------------------------------------- STYLING
rep(category='styling', subsection='casualwear', slug='casualwear-styling-report', title="SS27 Kids' Casualwear Styling",
  summary='Casual SS27 kidswear: coordinated sets, stripes with denim, layered accessories and sport pieces styled with a refined, creative lens.',
  sections=[
   {'heading': 'The evidence', 'body': f'''Cozmo built coordinated sets into a total look{ref(1)}; MilK chose matching sets by Catimini and Semon ApartMent, shoes from Tnin and Affenzahn{ref(2)}. Playtime Paris showed "layered styling", character-driven accessories, refined sport and diverse denim{ref(3)}.'''},
   {'heading': 'Formulas', 'body': '- **Striped tee + denim dungarees + sandals.**\n- **Matching printed set + canvas shoes.**\n- **Oversized tee + relaxed shorts + backpack.**\n- **Sport jacket over a terry set.**\n- **Sailor top + shorts + hat.**'},
  ],
  design_implications='- Design sets so pieces also work as separates.' + SAFE,
  commercial_implications='- Sell sets together and apart; show full looks online.',
  sources=src('pbs', 'milk', 'js'))

rep(category='styling', subsection='formalwear', slug='formalwear-styling-report', title="SS27 Kids' Formalwear Styling",
  summary='Occasion and formal SS27 kidswear: sailor collars, crisp cotton, pleated dresses and "princess" luxury dressing for ceremonies and summer events.',
  sections=[
   {'heading': 'The evidence', 'body': f'Speranza and Junona represent luxury "princess" style at Pitti Bimbo{ref(1)}; pleated dresses appear among SS27 silhouettes{ref(2)}; sailor collars and navy recur at Playtime Paris{ref(3)}.'},
   {'heading': 'Formulas', 'body': '- **Sailor-collar shirt + navy shorts + loafers** (boys\' ceremony look).\n- **Pleated or smocked dress + cardigan + ballerinas.**\n- **Linen shirt + tailored shorts** for summer weddings.\n- **Voile dress with embroidery.**'},
  ],
  design_implications='- Lined, soft-touch occasion pieces; avoid scratchy seams and stiff tulle against skin.' + SAFE,
  commercial_implications='- Occasionwear sells around communions, weddings and holidays; time deliveries for spring.',
  sources=src('fupb', 'fata', 'js'))

rep(category='styling', subsection='partywear', slug='partywear-styling-report', title="SS27 Kids' Partywear Styling",
  summary='Party SS27 kidswear: bold looks and sparkling details from the pool-party runway, with bright colour and reversible statement dresses.',
  sections=[
   {'heading': 'The evidence', 'body': f'Pitti Bimbo opened with the Pirouette Disco Pool Party Runway, "bold looks, sparkling details, and positive vibes"{ref(1)}. Poco Blush showed bold hues and a reversible printed dress{ref(2)}.'},
   {'heading': 'Formulas', 'body': '- **Bright dress + sparkle hair accessory + sandals.**\n- **Sequin or metallic top + shorts.**\n- **Printed shirt + bright shorts** for boys.\n- **Reversible dress** for two looks.'},
  ],
  design_implications='- Line sequin and metallic pieces; check for sharp edges.' + SAFE,
  commercial_implications='- Party buys are seasonal; deliver late spring before summer events.',
  sources=src('pbn', 'fupb'))

# ---------------------------------------------------------------- COUTURE
rep(category='couture', subsection='craft-techniques', slug='couture-craft-and-techniques-report', title="SS27 Kids' Couture Craft and Techniques",
  summary='Craft in premium kidswear: artist-designed prints, handcrafted embroidery, handmade costumes and luxury "princess" dressing.',
  sections=[
   {'heading': 'The evidence', 'body': f'''- Halcyon Nights builds several graphic universes each season with patterns designed by a panel of artists{ref(1)}.
- Bobo Choses publishes illustrated books alongside its collections{ref(1)}.
- Selini Action makes handmade costumes decorated with shells, pebbles, seaweed and embroidery{ref(2)}.
- Speranza and Junona show luxury "princess" style{ref(1)}.
- Fatamadrina\'s "Wildflowers Bloom" uses delicate handcrafted embroidery{ref(3)}.'''},
   {'heading': 'Translating to ready-to-wear', 'body': '- Artist collaborations on prints.\n- Hand embroidery on one placement per garment.\n- Smocking and pleating for occasion dresses.'},
  ],
  design_implications='- Budget hand work into hero pieces.' + SAFE,
  commercial_implications='- Tell the craft and artist story; price as limited.',
  sources=src('fupb', 'pbs', 'fata'))

rep(category='couture', subsection='materials-details', slug='couture-materials-and-details-report', title="SS27 Kids' Couture Materials and Details",
  summary='Premium kidswear materials: fine Italian fabrics, recycled and certified fibres, sustainable lycra, and natural decorations used with care.',
  sections=[
   {'heading': 'The evidence', 'body': f'''- Marie Raxevisky\'s "Beach Couture" uses fine Italian fabrics and recycled materials, with UPF 50+ certification and coordinated adult and child pieces{ref(1)}.
- Piccoli Principi uses high-quality technical fabrics including sustainable lycra{ref(1)}.
- Gray Label works with only two material qualities, made in Portugal{ref(2)}.
- Senger Naturwelt uses GOTS-certified materials for its toys{ref(1)}.'''},
  ],
  design_implications='- Fewer, better materials; check every certification claim.' + SAFE,
  commercial_implications='- Mini-me and family capsules extend premium spend.',
  sources=src('pbs', 'fupb'))

# ---------------------------------------------------------------- BUSINESS
rep(category='business-strategy', subsection='category-opportunities', slug='category-opportunities-report', title="SS27 Kids' Category Opportunities",
  summary='Growth categories for SS27 kidswear: UV-protective swim and tees, organic basics and sleepwear, denim, coordinated sets, baby shoes and family capsules.',
  sections=[
   {'heading': 'The evidence', 'body': f'''- **UV protection:** swimwear, tees and accessories with UV filters becoming common{ref(1)}.
- **Organic and certified basics:** recycled fibres, organic cotton and certified materials{ref(1)}.
- **Shoes:** Pisamonas showed strap ballerinas, leather sandals, barefoot models and first-summer baby shoes{ref(2)}.
- **Sleepwear:** organic cotton pyjamas at Cadhan{ref(2)}, pyjamas in MilK\'s selection{ref(3)}.
- **Denim:** stronger and more diverse at Playtime Paris{ref(4)}.
- **Family dressing:** adult and child pieces, including mother-daughter matches, at Marie Raxevisky{ref(2)}.
- **Buyers want difference:** Smallable comes to Pitti Bimbo to find niche brands{ref(5)}.'''},
   {'heading': 'Opportunities', 'body': '1. UPF swim and sun-protective tees and hats.\n2. Organic basics and pyjamas.\n3. Denim dungarees, jackets and shorts.\n4. Coordinated sets.\n5. Baby and first-walker shoes.\n6. Family and mini-me capsules.'},
   {'heading': 'Baby and toddler', 'body': f'Brands at Pitti Bimbo cover newborn upwards (Cozmo from newborn to 14 years{ref(2)}). For baby and toddler, prioritise soft organic cotton, easy fastenings, first shoes and sleepwear. Forecut did not find separate SS27 evidence for toddler boys and toddler girls, so those pages are not yet published.'},
  ],
  design_implications='- Re-weight development toward function and durability.' + SAFE,
  commercial_implications='- Re-weight open-to-buy toward swim, basics and denim.',
  sources=src('fit', 'pbs', 'milk', 'js', 'fupb'))

rep(category='business-strategy', subsection='assortment-pricing', slug='assortment-and-pricing-strategy', title="SS27 Kids' Assortment and Pricing Strategy",
  summary='Plan SS27 kidswear for a slower market: durable core, sets that sell together and apart, shallow buys on novelty, and full price for UV and organic value.',
  sections=[
   {'heading': 'The market', 'body': f'In Italy, childrenswear exports fell 9.3% and domestic sales 2.6% in 2025 (Confindustria Moda via Fortune Italia){ref(1)}. Pitti Bimbo, which once had more than 500 exhibitors, now runs a smaller, more selective format{ref(2)}. Fashion overall is expected to grow in low single digits in 2027; resale is expected to grow two to three times faster than first-hand fashion through 2027{ref(3)}.'},
   {'heading': 'Assortment', 'body': '| Tier | What goes in it |\n|---|---|\n| Core (about half) | Organic tees, stripes, denim, shorts, pyjamas in navy, sand, white |\n| Seasonal (about a third) | Swim and UV, sets, dresses, sailor pieces, brights |\n| Statement (the rest) | Character and story pieces, party, reversible and novelty |'},
   {'heading': 'Pricing', 'body': '- Full price on UPF and certified-organic pieces; show the benefit.\n- Value on basics.\n- Sets priced to reward buying both pieces.\n- Premium on artist prints and hand craft.'},
  ],
  design_implications='- Durable construction supports hand-me-down and resale value.' + SAFE,
  commercial_implications='- Track sell-through weekly; chase swim before holidays.',
  sources=src('fit', 'fupb', 'fu27'))

# ---------------------------------------------------------------- INNOVATIONS
rep(category='innovations', subsection='material-innovations', slug='material-innovations-report', title="SS27 Kids' Material Innovations",
  summary='Materials for SS27 kidswear: UPF-rated swim and performance knits, recycled fibres, organic and certified cotton, quick-dry and sand-free fabrics.',
  sections=[
   {'heading': 'The evidence', 'body': f'''- UV filters in swimwear, tees and accessories{ref(1)}.
- Recycled fibres, organic cotton and certified materials; breathable, quick-dry fabrics{ref(1)}.
- Sustainable lycra (Piccoli Principi), UPF50+ performance fabrics and sand-free towels (Teeter Totter), recycled fine fabrics with UPF 50+ (Marie Raxevisky){ref(2)}.'''},
   {'heading': 'Readiness', 'body': '| Material | Readiness (Forecut assessment) |\n|---|---|\n| UPF swim and knit | Ready; test and label |\n| Recycled polyamide and polyester swim | Ready |\n| Organic cotton (certified) | Ready |\n| Sand-free microfibre towels | Ready |'},
  ],
  design_implications='- Test UPF to a recognised standard (EN 13758 or AS/NZS 4399).' + SAFE,
  commercial_implications='- Verify every sustainability claim before using it.',
  sources=src('fit', 'pbs'))

rep(category='innovations', subsection='design-production', slug='design-and-production-innovations-report', title="SS27 Kids' Design and Production Innovations",
  summary='Storytelling-led design, artist collaborations, durable construction and product data ready for the EU Digital Product Passport.',
  sections=[
   {'heading': 'The evidence', 'body': f'''- Collections designed as worlds and characters (Playtime Paris){ref(1)}; Bobo Choses and Halcyon Nights build collections around books and artist panels{ref(2)}.
- Durability and functionality over short-lived seasonality{ref(3)}.
- The EU textiles Digital Product Passport delegated act is planned for the fourth quarter of 2027; since 19 July 2026, large companies may not destroy certain unsold apparel{ref(4)}.'''},
  ],
  design_implications='- Record fibre, origin, care and safety test results for every style.' + SAFE,
  commercial_implications='- Plan rework, resale or donation routes for unsold stock in the EU.',
  sources=src('js', 'fupb', 'fit', 'fu27'))

# ---------------------------------------------------------------- GIRLS
rep(kind='theme', audience='girls', category='themes', subsection='themes', slug='beach-couture', title="SS27 Girls' Beach Couture",
  summary='Girls\' summer dressing with a couture touch: romantic swimwear, sarongs and skirts, mother-daughter matching, bold reversible dresses and luxury "princess" pieces.',
  trend_status='Rising',
  sections=[
   {'heading': 'The story', 'body': f'''Marie Raxevisky\'s "Beach Couture" line offers UPF 50+ swimwear, sarongs and skirts in fine Italian fabrics and recycled materials, with coordinated adult and child pieces including a mother-daughter match{ref(1)}. Piccoli Principi\'s "Pearl & Tides" swimwear runs from vintage pink to pastel green and soft navy{ref(1)}. Poco Blush, designed "almost exclusively for girls", showed bold hues and a loose, printed, reversible dress{ref(2)}. Speranza and Junona show a luxury "princess" style{ref(2)}.'''},
   {'heading': 'Colours', 'body': 'Vintage pink, pastel green and soft navy; coral and lavender; red as an accent. See SS27 Kids\' Season Colours.'},
   {'heading': 'Silhouettes', 'body': '- Swimsuits and two-pieces with cover-up sarongs and skirts.\n- Loose and reversible printed dresses.\n- Occasion dresses with full skirts.'},
   {'heading': 'Fabrics', 'body': 'UPF swim fabrics, voile, organic cotton poplin, recycled fine fabrics.'},
   {'heading': 'Trims and details', 'body': 'Ruffles, smocking, embroidered flowers, bows.'},
  ],
  timing='In stores March to August 2027.',
  products='- Swim and cover-up sets, sarongs, printed and reversible dresses, mother-daughter capsules.\n- Customers: girls roughly 4 to 12 and their families.',
  design_implications='- Keep ruffles and bows securely attached and away from the mouth area for younger girls.' + SAFE,
  commercial_implications='- Mother-daughter capsules extend the basket; price as a set.',
  sources=src('pbs', 'fupb'), related=['fc-ss27-kids-themes-pool-days'])

write(R, OUT)
