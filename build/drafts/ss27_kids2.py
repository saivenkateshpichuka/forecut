"""SS27 Boys, Girls, Toddler Boys, Toddler Girls (all categories) and Kids' Celebrity Influence.
Evidence is the SS27 kidswear fair record (Pitti Bimbo 103, Playtime Paris, Future Snoops, MilK, Junior Style).
Where a source does not split by gender or age, the report says so and gives Forecut's application for the audience."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from src_ss27 import S
from fclib import Season, palette, table

s = Season('ss27', S, 'Pitti Bimbo 103, Florence, 24-25 June 2026; Playtime Paris, 28-30 June 2026; analysis July to November 2026',
           'Premium and mid-market childrenswear, Europe-led fairs, global retail')
APP = ('Most SS27 kidswear sources describe collections across ages and genders. The evidence below is the fair record; '
       'the shapes, products and sizes are Forecut\'s application of it to {a}.')

# shared evidence lines (each report picks what is relevant)
E = {
 'pool': ('Pitti Bimbo 103 took "The Pitti Pool" as its theme and called it "the most colorful summer edition yet"', 'pbn'),
 'uv': ('Swimwear, T-shirts and accessories with built-in UV filters were prominent and are becoming common, linked to family concern for health and to changing climate', 'fit'),
 'quick': ('Newer lines emphasise breathability, quick drying and comfort; childrenswear is moving toward functionality, material quality and durability', 'fit'),
 'recyc': ('Collections increasingly use recycled fibres, organic cotton and certified materials', 'fit'),
 'red': ('At Playtime Paris, red "emerged as one of the defining colors of the season"; stripes ran horizontal, vertical and diagonal', 'js'),
 'naut': ('Sailor collars, navy blues and nautical details appeared throughout Playtime Paris', 'js'),
 'sport': ('Sport influence was presented "through a more refined, creative lens"; denim felt "stronger and more diverse than in recent seasons"', 'js'),
 'whim': ('Junior Style saw a "growing whimsical trend", layered styling and character-driven accessories; Tinycottons showed a "wonderfully chic bellboy character"', 'js'),
 'lull': ('Future Snoops\' Lull celebrates "the quiet elegance of elevated basics", set "to the rhythm of the sea"', 'fs'),
 'happ': ('Future Snoops\' Happenstance calls for "nostalgic quirks, exaggerated silhouettes, and playful embellishments"', 'fs'),
 'cozmo': ('Cozmo showed striped T-shirts and coordinated sets forming a total look, for newborns to 14 years', 'pbs'),
 'pp': ('Piccoli Principi\'s "Pearl & Tides" swimwear runs from vintage pink to pastel green and soft navy, in technical fabrics including sustainable lycra, with UV protection', 'pbs'),
 'tt': ('Teeter Totter showed UPF50+ swim and sportswear, backpacks and ultra-light, sand-free beach towels', 'pbs'),
 'pisa': ('Pisamonas showed strap ballerinas, leather sandals, barefoot models and first-summer shoes for babies', 'pbs'),
 'cadhan': ('Cadhan showed soft organic cotton pyjamas, with a "Sogni d\'oro" line for sensitive skin', 'pbs'),
 'marie': ('Marie Raxevisky\'s "Beach Couture" offers UPF 50+ swimwear, sarongs and skirts in fine Italian and recycled fabrics, with mother-daughter matching', 'pbs'),
 'selini': ('Selini Action makes handmade costumes decorated with shells, pebbles, seaweed and embroidery', 'pbs'),
 'poco': ('Poco Blush, designed "almost exclusively for girls", showed bold hues and a loose, printed, reversible dress, and a T-shirt that releases a minty scent when crumpled', 'fupb'),
 'princess': ('Speranza and Junona represent a luxury "princess" style', 'fupb'),
 'true': ('True Artist makes unisex outfits for children and pre-teens', 'fupb'),
 'gray': ('Gray Label keeps to a minimalist range with no patterns except stripes, in "exceptionally soft" pieces made in Portugal', 'fupb'),
 'halcyon': ('Halcyon Nights builds several graphic universes each season with patterns from a panel of artists; Bobo Choses publishes illustrated books alongside its collections', 'fupb'),
 'smallable': ('Smallable\'s buyers came to Pitti Bimbo for "niche brands" with "a little wow factor"', 'fupb'),
 'sticky': ('Sticky Lemon showed backpacks in key shades from past collections and a mini digital camera that attaches to a bag', 'fupb'),
 'milk': ('MilK\'s Dressing Idéal chose matching sets by Catimini and Semon ApartMent, a terry top by Piupiuchick, pyjamas by Oda London, a sailor top by Loir Paris, and shoes by Tnin and Affenzahn', 'milk'),
 'fata_f': ('Fatamadrina lists lightweight linen, voile, organic cotton, terry and micro-mesh as SS27 fabrics', 'fata'),
 'fata_s': ('Fatamadrina lists relaxed shapes, dungarees, oversized T-shirts, pleated dresses and lightweight jackets as SS27 silhouettes', 'fata'),
 'fata_p': ('Fatamadrina lists oversized florals, checks with fruit prints, paisley, vintage geometrics, nautical themes and gingham, and "Wildflowers Bloom" with delicate handcrafted embroidery', 'fata'),
 'sp': ('Salt and Pepper describes its SS27 fabrics as sustainable organic cotton, "exceptionally soft and gentle on the skin"', 'sp'),
 'market': ('In Italy, childrenswear exports fell 9.3% and domestic sales 2.6% in 2025 (Confindustria Moda via Fortune Italia)', 'fit'),
 'outlook': ('Fashion is expected to grow in low single digits in 2027; resale is expected to grow two to three times faster than first-hand fashion through 2027', 'fu27'),
 'dpp': ('The EU textiles Digital Product Passport delegated act is planned for the fourth quarter of 2027; since 19 July 2026 large companies may not destroy certain unsold apparel', 'fu27'),
 'mini': ('Celebrity parents and social media have driven mini-me, matching parent and child dressing, and the growth of luxury childrenswear', ['bofmm', 'natmm']),
}


def ev(*k):
    return [E[x] for x in k]


KPAL = [('Lemon', '12-0642 TCX', '#EDDD59', 'Seasonal'), ('Aqua', '14-4816 TCX', '#58C9D4', 'Seasonal'),
        ('Grass green', '16-0237 TCX', '#75A14F', 'Seasonal'), ('Coral', '16-1541 TCX', '#F6745F', 'Seasonal'),
        ('Lavender', '14-3812 TCX', '#BDB0D0', 'Seasonal'), ('Sand', '13-1009 TCX', '#DAC7AB', 'Core'),
        ('Red', '18-1664 TCX', '#D01C1F', 'Accent'), ('Navy', '19-3920 TCX', '#2B2E43', 'Core')]
P = {x[0]: x for x in KPAL}


def pal(*names, roles=None):
    rows = []
    for i, n in enumerate(names):
        r = list(P[n]); r[3] = (roles or {}).get(n, r[3]); rows.append(tuple(r))
    return palette(rows)


# ====================================================================== BOYS (about 4 to 14)
A = 'boys'; app = APP.format(a='boyswear, roughly ages 4 to 14')
s.theme(A, 'refined-sport', 'Refined Sport',
  'Sport made smarter for boys: mesh and piqué polos, track sets in clean colour, UV tees and swim shorts that move from pitch to pool.',
  f'Playtime Paris showed sport "through a more refined, creative lens" [[js]]. Pitti Bimbo\'s pool theme [[pbn]] and the move to UV-protective, quick-dry pieces [[fit]] make performance a summer basic. Teeter Totter\'s UPF50+ swim and sportswear [[pbs]] show the product. {app}',
  'Navy, red and white, with aqua and grass green. ' + 'Red is the season\'s newness [[js]].',
  '- Piqué and mesh polos.\n- Track jacket and shorts set.\n- Swim shorts with a matching UV tee.\n- Pull-on shorts with a flat drawcord-free waistband.',
  '- Micro-mesh and piqué [[fata]].\n- UPF-rated swim and jersey.\n- Recycled polyester for track pieces [[fit]].',
  '- Contrast piping and side stripes.\n- Rubberised badges instead of metal.\n- Flat, covered elastic waists.',
  status='Rising', timing='In stores March to August 2027.',
  products='- Polos, track sets, UV tees, swim shorts, caps, sneakers.\n- Customer: boys who choose their own clothes; parents buying for camp and holiday.',
  design='- No drawstrings at the waist of swim shorts for younger sizes; use elastic and a flat tie only where permitted for the age.\n- Test UPF claims to EN 13758 or AS/NZS 4399.',
  commercial='- Track sets and polos are reorder lines; buy depth in navy and red.')
s.theme(A, 'workwear-denim', 'Workwear Denim',
  'Denim leads boyswear: carpenter shorts, chore jackets, overalls and coordinated denim sets, washed light and mid blue.',
  f'Denim\'s "presence felt stronger and more diverse than in recent seasons" at Playtime Paris, across everyday, workwear-inspired and coordinated styles [[js]]. Dungarees and lightweight jackets are on Fatamadrina\'s SS27 silhouette list [[fata]]. {app}',
  'Light and mid indigo with sand, red and white.',
  '- Carpenter and relaxed denim shorts.\n- Chore jacket and overshirt.\n- Short overalls.\n- Denim shirt and short set.',
  '- Lightweight cotton denim and chambray.\n- Twill for workwear shorts.\n- Recycled or organic cotton denim where certified [[fit]].',
  '- Hammer loops and patch pockets (bar-tacked, no sharp edges).\n- Corozo or metal shank buttons, pull-tested.\n- Contrast topstitching.',
  status='Rising', timing='In stores February to July 2027; carries into autumn.',
  products='- Denim shorts, chore jackets, overalls, denim shirts.',
  design='- Adjustable waists for growth.\n- Pre-wash to control shrinkage; check abrasion on knees and seat.',
  commercial='- Denim is a volume category for boys; keep the wash palette tight.')
s.theme(A, 'harbour-club', 'Harbour Club',
  'Nautical classics for boys: Breton stripes, navy and red, sailor-collar shirts for occasions and stripe sets for every day.',
  f'Sailor collars, navy blues and nautical details ran through Playtime Paris, with red and stripes as season-defining [[js]]. Cozmo showed striped tees and coordinated sets [[pbs]]; Loir Paris\'s sailor top was in MilK\'s selection [[milk]]. {app}',
  'Navy, red, white and sand.', '- Breton tee.\n- Sailor-collar shirt for occasions.\n- Bermuda shorts.\n- Stripe set.',
  '- Cotton jersey and interlock.\n- Poplin and seersucker for shirts.\n- Linen-cotton for shorts.',
  '- Contrast tape on collars.\n- Anchor-look buttons.\n- Engineered stripes.', status='Rising', timing='In stores February to July 2027.',
  products='- Breton tees, sailor shirts, shorts, stripe sets, canvas shoes.', design='- Match stripes at side seams.', commercial='- Stripes are reorder lines; sailor shirts are occasion buys.')

s.rep(A, 'colours', 'season-colours', 'Boyswear moves from all-navy to red and navy with aqua and lemon brights for summer play.',
  ev=ev('red', 'naut', 'pool'), status='Rising',
  sections=[('The palette', pal('Navy', 'Red', 'Sand', 'Aqua', 'Lemon', 'Grass green', roles={'Red': 'Seasonal: lead accent'})),
            ('Colour groups', '- **Core:** navy, sand, white.\n- **Seasonal:** red; aqua and lemon for swim and play.\n- **Accent:** grass green.'),
            ('By age', '- **4 to 7:** brights and stripes.\n- **8 to 14:** navy, red and sand; brights on one piece only.')],
  timing='Red is the newness for SS27; navy stays core.', products='- Red: tees, caps, sneakers. Navy and sand: shorts and chinos. Aqua and lemon: swim.',
  design='- Lab-dip red on jersey and swim fabric; check colour fastness to chlorine and salt water.', commercial='- Depth in navy and sand; red as a strong seasonal buy.')
s.rep(A, 'colours', 'theme-colour-palettes', 'Working palettes for the SS27 boys\' themes: Refined Sport, Workwear Denim and Harbour Club.',
  ev=ev('red', 'sport'),
  sections=[('Palettes by theme', table(['Theme', 'Lead', 'Accent', 'Range colours'], [
      ['Refined Sport', 'Navy 19-3920 TCX', 'Red 18-1664 TCX', 'White, aqua 14-4816 TCX, grass green 16-0237 TCX'],
      ['Workwear Denim', 'Mid indigo', 'Red 18-1664 TCX', 'Sand 13-1009 TCX, white'],
      ['Harbour Club', 'Navy 19-3920 TCX', 'Red 18-1664 TCX', 'White, sand 13-1009 TCX']]))],
  design='- Share navy and white across themes so pieces mix.', commercial='- Build depth in lead colours; accents shallow.')
s.rep(A, 'colours', 'colour-stories', 'Three boys\' colour stories: Red Line, Pool Brights and Washed Indigo.', ev=ev('red', 'pool', 'sport'),
  sections=[('Red Line', 'Red, navy and white for stripes, sport and caps.'), ('Pool Brights', 'Aqua, lemon and grass green for swim and camp.'),
            ('Washed Indigo', 'Light and mid denim with sand and white.')],
  design='- One capsule per story.', commercial='- Washed Indigo and Red Line carry volume.')
s.rep(A, 'silhouettes', 'woven', 'Boys\' woven shapes for SS27: carpenter and relaxed shorts, chore jackets, short overalls, camp and sailor-collar shirts.',
  ev=ev('sport', 'fata_s', 'naut'), status='Rising',
  sections=[('Shapes to lead with', '- **Relaxed shorts:** above the knee to knee length, elastic back.\n- **Carpenter shorts and overalls.**\n- **Chore jacket and overshirt.**\n- **Camp-collar shirt:** printed or striped.\n- **Sailor-collar shirt:** occasion.')],
  timing='In stores February to August 2027.', products='- Shorts, overalls, jackets, shirts.',
  design='- Adjustable inner waistbands for growth.', commercial='- Shorts are the core woven buy.')
s.rep(A, 'silhouettes', 'knit', 'Boys\' knit shapes: oversized tees, piqué and mesh polos, track sets, rash guards and swim shorts with liners.',
  ev=ev('cozmo', 'sport', 'tt', 'fata_s'),
  sections=[('Shapes and fit', '- **Oversized tee:** dropped shoulder.\n- **Polo:** straight fit, piqué or mesh.\n- **Track set:** zip jacket and shorts.\n- **Rash guard and swim short.**\n- **Stripe set.**')],
  timing='In stores February to August 2027.', products='- Tees, polos, track sets, swim.',
  design='- Flat seams on rash guards.', commercial='- Tees and polos are reorder lines.')
s.rep(A, 'fabrics', 'woven', 'Boys\' wovens: lightweight denim and chambray, cotton twill, seersucker and linen-cotton, with certified organic and recycled options.',
  ev=ev('sport', 'recyc', 'fata_f'),
  sections=[('Fabric by fabric', table(['Fabric', 'Hand', 'Uses'], [['Light denim, chambray', 'Soft, durable', 'Shorts, overalls, shirts'],
      ['Cotton twill', 'Firm', 'Workwear shorts, chinos'], ['Seersucker', 'Cool', 'Shirts, shorts'], ['Linen-cotton', 'Cool, textured', 'Shirts, Bermudas']]))],
  design='- Certify organic and recycled claims before labelling.', commercial='- Denim and twill are volume.')
s.rep(A, 'fabrics', 'knit', 'Boys\' knits: cotton jersey, piqué, micro-mesh, terry and UPF-rated swim and performance fabrics.',
  ev=ev('fata_f', 'uv', 'tt', 'quick'),
  sections=[('Fabric by fabric', table(['Knit', 'Hand', 'Uses'], [['Organic cotton jersey', 'Soft', 'Tees'], ['Piqué', 'Structured', 'Polos'],
      ['Micro-mesh', 'Airy', 'Sport tops, linings'], ['Terry', 'Absorbent', 'Shorts, cover-ups'], ['UPF swim and performance', 'Stretch, quick-dry', 'Swim, rash guards']]))],
  design='- Test UPF after stretching and wetting.', commercial='- UPF supports full price.')
s.rep(A, 'trims', 'trending-trims', 'Boys\' trims: side stripes and piping, rubberised badges, sailor tape, bar-tacked utility pockets and reflective details.',
  ev=ev('sport', 'naut', 'whim'),
  sections=[('Trims table', table(['Trim', 'Application', 'Status'], [['Side stripes and piping', 'Track sets, shorts', 'Rising'], ['Rubberised badges', 'Tees, caps', 'Rising'],
      ['Sailor collar tape', 'Shirts', 'Rising'], ['Utility pockets', 'Shorts, overalls', 'Core'], ['Character appliqué', 'Tees', 'Core']]))],
  design='- Avoid sharp metal hardware; prefer rubber and fabric trims.', commercial='- Trims refresh core tees and shorts.')
s.rep(A, 'trims', 'trim-stories', 'Trims that carry each boys\' theme: piping for Refined Sport, workwear hardware for Workwear Denim, tape for Harbour Club.',
  ev=ev('sport', 'naut'), sections=[('Refined Sport', 'Side stripes, piping, rubber badges.'), ('Workwear Denim', 'Hammer loops, patch pockets, shank buttons.'), ('Harbour Club', 'Sailor tape, anchor-look buttons.')],
  design='- One trim family per theme.', commercial='- Use trims to update carry-over blocks.')
s.rep(A, 'trims', 'trim-market-strategy', 'Durable, wash-proof trims for a slower market: build piping and badges, test character and novelty trims.',
  ev=ev('market', 'outlook'), sections=[('Build, test, sell through', table(['Action', 'Trims'], [['Build', 'Piping, side stripes, sailor tape'], ['Test', 'Novelty badges, reflective details'], ['Sell through', 'Glued-on decoration']]))],
  design='- Trims must survive frequent washing.', commercial='- Durable trims support hand-me-down and resale value.')
s.rep(A, 'trims', 'trim-innovations', 'Functional details for boys: UPF-rated components, reflective trims, scented and novelty finishes tested for skin safety.',
  ev=ev('poco', 'sticky', 'tt'),
  sections=[('Readiness', table(['Innovation', 'Readiness (Forecut assessment)'], [['Reflective trims', 'Ready'], ['Sand-free towel fabric', 'Ready'], ['Scented finishes', 'Test skin safety first'], ['Bag-attached gadgets', 'Accessory category; check toy rules']]))],
  design='- Skin-safety evidence for any finish.', commercial='- Novelty as small gift buys.')
s.rep(A, 'styling', 'celebrity-influence', 'Family and athlete influence on boyswear: father-son matching, team and sport codes, and social media.',
  ev=ev('mini', 'sport'),
  sections=[('What to take from it', '- Father-son matching works best on a few pieces: a shirt, swim shorts, a cap.\n- Sport codes from football, tennis and surf, refined rather than literal.\n- Avoid real athletes\' names and numbers without a licence.')],
  design='- Design adult and boys\' versions from one print or fabric.', commercial='- Family capsules lift basket size.')
s.rep(A, 'styling', 'casualwear', 'Casual boyswear: stripe tee with denim shorts, polo with chinos, track set for every day, camp shirt over a tee.',
  ev=ev('cozmo', 'sport', 'milk'),
  sections=[('Formulas', '- **Breton tee + denim shorts + canvas shoes.**\n- **Polo + chino shorts + sneakers.**\n- **Track jacket + matching shorts.**\n- **Camp shirt open over a tee.**')],
  design='- Sets that work as separates.', commercial='- Show full looks online.')
s.rep(A, 'styling', 'formalwear', 'Occasion boyswear: sailor-collar or linen shirt, tailored shorts, loafers or canvas shoes, for weddings and ceremonies.',
  ev=ev('naut', 'fata_f'), sections=[('Formulas', '- **Sailor-collar shirt + navy shorts.**\n- **Linen shirt + tailored Bermuda.**\n- **Seersucker set.**')],
  design='- Soft collars and linings; no scratchy interlining.', commercial='- Time occasionwear for communion and wedding season.')
s.rep(A, 'styling', 'partywear', 'Party boyswear: printed shirts, bright shorts and statement sneakers.', ev=ev('pool', 'red'),
  sections=[('Formulas', '- **Printed camp shirt + bright shorts.**\n- **Red polo + white shorts.**\n- **Character tee + denim.**')],
  design='- Prints scaled to size.', commercial='- Late-spring delivery for summer parties.')
s.rep(A, 'couture', 'craft-techniques', 'Craft for boys: artist-designed prints, embroidered badges and hand-finished details on hero pieces.',
  ev=ev('halcyon', 'whim'), sections=[('Translating to ready-to-wear', '- Artist prints on camp shirts.\n- Embroidered badges on polos.\n- Character embroidery on caps and tees.')],
  design='- Hand work on one placement only.', commercial='- Tell the artist story; price as limited.')
s.rep(A, 'couture', 'materials-details', 'Premium materials for boyswear: certified organic cotton, fine linen, soft leather sandals and recycled performance fabrics.',
  ev=ev('recyc', 'pisa', 'gray'), sections=[('Materials', '- Organic cotton jersey.\n- Linen and linen-cotton shirting.\n- Leather sandals.\n- Recycled swim and track fabrics.')],
  design='- Fewer, better materials.', commercial='- Premium on certified and leather pieces.')
s.rep(A, 'business-strategy', 'category-opportunities', 'Boyswear growth for SS27: denim, refined sport, UV swim, polos and sets.',
  ev=ev('sport', 'uv', 'cozmo', 'true'),
  sections=[('Opportunities', '1. Denim shorts, overalls and jackets.\n2. Track sets and polos.\n3. UV tees and swim.\n4. Coordinated sets.\n5. Unisex basics that serve boys and girls.')],
  design='- Prioritise function and durability.', commercial='- Re-weight buys to denim and sport.')
s.rep(A, 'business-strategy', 'assortment-pricing', 'Assortment and pricing for SS27 boyswear in a slower market.', ev=ev('market', 'outlook'),
  sections=[('Assortment', table(['Tier', 'What goes in it'], [['Core (about half)', 'Tees, shorts, denim, polos in navy, sand, white'], ['Seasonal (about a third)', 'Swim and UV, sets, red pieces, track'], ['Statement (the rest)', 'Prints, character, occasion shirts']])),
            ('Pricing', '- Full price on UPF and certified organic.\n- Value on basics.\n- Sets priced to reward both pieces.')],
  design='- Durable construction.', commercial='- Weekly sell-through tracking.')
s.rep(A, 'innovations', 'material-innovations', 'Materials for boys: UPF swim and jersey, recycled performance knits, quick-dry and sand-free fabrics.',
  ev=ev('uv', 'quick', 'tt', 'recyc'), sections=[('Readiness', table(['Material', 'Readiness'], [['UPF jersey and swim', 'Ready; test and label'], ['Recycled polyester track fabric', 'Ready'], ['Quick-dry mesh', 'Ready']]))],
  design='- Test UPF to a recognised standard.', commercial='- Verify sustainability claims.')
s.rep(A, 'innovations', 'design-production', 'Design and production for boyswear: durable construction, unisex blocks and product data ready for the EU Digital Product Passport.',
  ev=ev('true', 'quick', 'dpp'), sections=[('Actions', '- Shared unisex blocks for tees and shorts.\n- Reinforced knees and seats.\n- Record fibre, origin, care and safety tests per style.')],
  design='- Grade for growth.', commercial='- Plan resale and donation routes for unsold stock.')

# ====================================================================== GIRLS (about 4 to 14), Beach Couture already published
A = 'girls'; app = APP.format(a='girlswear, roughly ages 4 to 14')
s.theme(A, 'wildflower', 'Wildflower',
  'Romantic summer for girls: wildflower prints, handcrafted embroidery, airy voile and linen dresses in soft pastels.',
  f'Fatamadrina\'s "Wildflowers Bloom" is a dreamy, romantic aesthetic with airy fabrics, delicate handcrafted embroidery and a meadow pastel palette; oversized florals and pleated dresses are on its SS27 lists [[fata]]. Future Snoops\' Lull favours elevated basics [[fs]]. {app}',
  'Lavender, vintage pink and pastel green over sand and white.', '- Pleated and tiered dresses.\n- Puff-sleeve blouses.\n- Wide shorts and skirts.',
  '- Voile, lightweight linen and organic cotton [[fata]].', '- Hand embroidery, smocking, ruffles (secured).', status='Rising',
  timing='In stores February to July 2027.', products='- Dresses, blouses, skirts, sandals.', design='- Line voile where needed; no long ribbons at the neck.', commercial='- Dresses lead the girls\' buy.')
s.theme(A, 'playground-pop', 'Playground Pop',
  'Bold, joyful colour for girls: bright prints, reversible dresses, sparkle and character pieces that girls choose themselves.',
  f'Poco Blush showed bold hues, a reversible printed dress and a scented T-shirt [[fupb]]. The Pirouette Disco Pool Party Runway promised "bold looks, sparkling details, and positive vibes" [[pbn]]. Junior Style saw a growing whimsical trend [[js]]. {app}',
  'Lemon, coral, aqua and red.', '- Reversible and loose dresses.\n- Bike shorts and oversized tees.\n- Sets.', '- Jersey, terry and poplin.', '- Sequins (lined), appliqué, embroidered characters.',
  status='Rising', timing='In stores March to August 2027.', products='- Printed dresses, sets, party tops, accessories.', design='- Line sequins; check edges.', commercial='- Smaller, sharper buys.')

s.rep(A, 'colours', 'season-colours', 'Girls\' SS27 colour: soft pastels for dresses and swim, bold brights for play, red as the new accent.',
  ev=ev('pp', 'poco', 'red'), status='Rising',
  sections=[('The palette', pal('Lavender', 'Coral', 'Lemon', 'Aqua', 'Sand', 'Red', roles={'Lavender': 'Seasonal: lead'})),
            ('Colour groups', '- **Core:** sand, white, navy.\n- **Soft:** lavender, vintage pink, pastel green.\n- **Bright:** coral, lemon, aqua.\n- **Accent:** red.')],
  timing='Pastels stay strong; brights grow.', products='- Lavender dresses, coral swim, lemon tees.', design='- Lab-dip across voile, jersey and swim.', commercial='- Depth in lavender and sand.')
s.rep(A, 'colours', 'theme-colour-palettes', 'Palettes for SS27 girls\' themes: Beach Couture, Wildflower and Playground Pop.', ev=ev('pp', 'fata_p', 'poco'),
  sections=[('Palettes by theme', table(['Theme', 'Lead', 'Accent', 'Range'], [['Beach Couture', 'Vintage pink', 'Soft navy', 'Pastel green, coral 16-1541 TCX'],
      ['Wildflower', 'Lavender 14-3812 TCX', 'Pastel green', 'Sand, white'], ['Playground Pop', 'Lemon 12-0642 TCX', 'Red 18-1664 TCX', 'Coral, aqua']]))],
  design='- Share sand and white.', commercial='- Accents shallow.')
s.rep(A, 'colours', 'colour-stories', 'Girls\' colour stories: Pearl and Tides, Meadow, and Pop.', ev=ev('pp', 'fata_p', 'poco'),
  sections=[('Pearl and Tides', 'Vintage pink, pastel green and soft navy for swim and beach.'), ('Meadow', 'Lavender, pastel green and white for dresses.'), ('Pop', 'Lemon, coral, aqua and red for play.')],
  design='- One capsule per story.', commercial='- Meadow and Pearl and Tides carry volume.')
s.rep(A, 'silhouettes', 'woven', 'Girls\' woven shapes: pleated, tiered and reversible dresses, puff-sleeve blouses, wide shorts and skirts, sailor-collar tops.',
  ev=ev('fata_s', 'poco', 'naut'), status='Rising',
  sections=[('Shapes to lead with', '- **Pleated and tiered dresses.**\n- **Loose reversible dress.**\n- **Puff-sleeve blouse.**\n- **Wide shorts and skorts.**\n- **Sailor-collar dress.**')],
  timing='In stores February to August 2027.', products='- Dresses, blouses, skirts.', design='- Easy openings; back buttons only from older sizes.', commercial='- Dresses carry the woven buy.')
s.rep(A, 'silhouettes', 'knit', 'Girls\' knit shapes: oversized tees, bike shorts, jersey dresses, terry sets, swimsuits and two-pieces.',
  ev=ev('fata_s', 'pp', 'milk'),
  sections=[('Shapes and fit', '- **Oversized tee and bike short.**\n- **Jersey T-shirt dress.**\n- **Terry top and shorts.**\n- **Swimsuit and two-piece.**\n- **Rib tank.**')],
  timing='In stores February to August 2027.', products='- Tees, dresses, sets, swim.', design='- Age-appropriate swim cuts.', commercial='- Swim and sets are strong.')
s.rep(A, 'fabrics', 'woven', 'Girls\' wovens: voile, lightweight linen, organic poplin, gingham, broderie and light denim.',
  ev=ev('fata_f', 'fata_p', 'sport'), sections=[('Fabric by fabric', table(['Fabric', 'Uses'], [['Voile', 'Dresses, blouses'], ['Linen', 'Dresses, shorts'], ['Organic poplin', 'Blouses, dresses'], ['Gingham', 'Dresses'], ['Light denim', 'Skirts, jackets']]))],
  design='- Line sheer fabrics.', commercial='- Organic and linen support premium.')
s.rep(A, 'fabrics', 'knit', 'Girls\' knits: organic jersey, terry, rib, pointelle and UPF swim fabrics including recycled lycra.',
  ev=ev('fata_f', 'pp', 'sp'), sections=[('Fabric by fabric', table(['Knit', 'Uses'], [['Organic jersey', 'Tees, dresses'], ['Terry', 'Sets'], ['Rib and pointelle', 'Tanks, cardigans'], ['UPF swim, recycled lycra', 'Swim']]))],
  design='- Test UPF after stretch.', commercial='- Swim at full price.')
s.rep(A, 'trims', 'trending-trims', 'Girls\' trims: hand embroidery, ruffles, smocking, lined sequins, shell and bead details for older girls.',
  ev=ev('fata_p', 'selini', 'pool'), sections=[('Trims table', table(['Trim', 'Application', 'Safety note'], [['Embroidery', 'Dresses', 'Soft backing'], ['Smocking', 'Dresses', 'None'], ['Sequins', 'Party', 'Lined'], ['Shells and beads', 'Older girls only', 'Pull-test']]))],
  design='- No small parts for younger sizes.', commercial='- Embroidery adds value.')
s.rep(A, 'trims', 'trim-stories', 'Trims for each girls\' theme.', ev=ev('marie', 'fata_p', 'poco'),
  sections=[('Beach Couture', 'Ruffles, bows, scalloped edges.'), ('Wildflower', 'Hand embroidery, smocking.'), ('Playground Pop', 'Appliqué, sequins, characters.')],
  design='- One trim family per theme.', commercial='- Trims refresh blocks.')
s.rep(A, 'trims', 'trim-market-strategy', 'Durable embroidery and smocking over fragile decoration.', ev=ev('market', 'quick'),
  sections=[('Build, test, sell through', table(['Action', 'Trims'], [['Build', 'Embroidery, smocking'], ['Test', 'Sequins, shells'], ['Sell through', 'Glued decoration']]))],
  design='- Wash-test all trims.', commercial='- Durability supports resale.')
s.rep(A, 'trims', 'trim-innovations', 'Novelty with care for girls: scented finishes, reversible construction and UPF components.', ev=ev('poco', 'cadhan'),
  sections=[('Readiness', table(['Innovation', 'Readiness'], [['Reversible construction', 'Ready'], ['Scented finishes', 'Test skin safety'], ['Dermatologically tested fragrances', 'Specialist']]))],
  design='- Skin-safety evidence first.', commercial='- Gift and story buys.')
s.rep(A, 'styling', 'celebrity-influence', 'Mother-daughter dressing and social media shape girlswear: matching beachwear and occasion dresses.',
  ev=ev('mini', 'marie'), sections=[('What to take from it', '- Mother-daughter capsules on swim, sarongs and dresses.\n- Keep children\'s versions age-appropriate.\n- Avoid celebrity names and likenesses.')],
  design='- Design adult and girls\' pieces from one fabric.', commercial='- Family capsules lift basket size.')
s.rep(A, 'styling', 'casualwear', 'Casual girlswear: tee and bike shorts, terry sets, denim skirts and sandals.', ev=ev('milk', 'fata_s', 'pisa'),
  sections=[('Formulas', '- **Oversized tee + bike shorts.**\n- **Terry set + sandals.**\n- **Stripe tee + denim skirt.**\n- **Matching printed set.**')],
  design='- Sets as separates.', commercial='- Show full looks.')
s.rep(A, 'styling', 'formalwear', 'Occasion girlswear: smocked and pleated dresses, embroidered voile, ballerinas.', ev=ev('princess', 'fata_p', 'pisa'),
  sections=[('Formulas', '- **Smocked dress + ballerinas.**\n- **Embroidered voile dress + cardigan.**\n- **Sailor dress.**')],
  design='- Soft linings.', commercial='- Deliver for communion and wedding season.')
s.rep(A, 'styling', 'partywear', 'Party girlswear: sparkle, bold colour and reversible dresses.', ev=ev('pool', 'poco'),
  sections=[('Formulas', '- **Bright dress + sparkle hair clip.**\n- **Sequin top + skirt.**\n- **Reversible dress.**')],
  design='- Line sequins.', commercial='- Late spring delivery.')
s.rep(A, 'couture', 'craft-techniques', 'Couture craft for girls: hand embroidery, smocking, handmade costume details and luxury "princess" dressing.',
  ev=ev('princess', 'selini', 'fata_p', 'halcyon'), sections=[('Translating to ready-to-wear', '- Smocking on yokes.\n- Hand embroidery on one placement.\n- Artist prints.')],
  design='- Budget hand work for hero dresses.', commercial='- Price as limited.')
s.rep(A, 'couture', 'materials-details', 'Premium girls\' materials: fine Italian and recycled fabrics, sustainable lycra, organic cotton voile.',
  ev=ev('marie', 'pp', 'sp'), sections=[('Materials', '- Fine Italian cottons.\n- Recycled swim fabrics.\n- Organic voile.')],
  design='- Check certifications.', commercial='- Mother-daughter capsules at premium.')
s.rep(A, 'business-strategy', 'category-opportunities', 'Girls\' growth for SS27: dresses, swim and cover-ups, sets, mother-daughter capsules, sandals.',
  ev=ev('marie', 'pp', 'poco', 'pisa'), sections=[('Opportunities', '1. Dresses.\n2. UPF swim and cover-ups.\n3. Coordinated sets.\n4. Mother-daughter capsules.\n5. Sandals and ballerinas.')],
  design='- Prioritise dresses and swim.', commercial='- Re-weight buys toward swim.')
s.rep(A, 'business-strategy', 'assortment-pricing', 'Assortment and pricing for SS27 girlswear.', ev=ev('market', 'outlook'),
  sections=[('Assortment', table(['Tier', 'What goes in it'], [['Core', 'Tees, shorts, jersey dresses'], ['Seasonal', 'Woven dresses, swim, sets'], ['Statement', 'Party, couture, reversible']])),
            ('Pricing', '- Full price on swim and embroidered dresses.\n- Value on basics.')], design='- Durable construction.', commercial='- Track sell-through weekly.')
s.rep(A, 'innovations', 'material-innovations', 'Materials for girls: UPF swim, recycled lycra, organic cotton and quick-dry fabrics.', ev=ev('pp', 'uv', 'recyc'),
  sections=[('Readiness', table(['Material', 'Readiness'], [['UPF swim', 'Ready'], ['Recycled lycra', 'Ready'], ['Organic cotton', 'Ready']]))],
  design='- Test UPF.', commercial='- Verify claims.')
s.rep(A, 'innovations', 'design-production', 'Design and production for girlswear: story-led collections, durable construction, product data for the EU passport.',
  ev=ev('halcyon', 'quick', 'dpp'), sections=[('Actions', '- Build stories across products.\n- Record fibre, origin and safety tests.')],
  design='- Grade for growth.', commercial='- Plan resale routes.')

# ====================================================================== TODDLER BOYS and TODDLER GIRLS (about 1 to 4)
for A, lab, th in [('toddler-boys', 'toddler boys, roughly 1 to 4 years', [
        ('first-summer', 'First Summer', 'Soft first summers for toddler boys: organic cotton sets, first-walker sandals and sun hats.',
         'Pisamonas showed first-summer shoes for babies and barefoot models [[pbs]]; Cozmo dresses newborns upward in striped tees and sets [[pbs]]; Salt and Pepper uses soft organic cotton [[sp]].',
         'Sand, aqua, navy and white.', '- Short rompers and two-piece sets.\n- Pull-on shorts.\n- Sun hats.', '- Organic cotton jersey and interlock, muslin.', '- Snap closures, flat seams, printed labels.'),
        ('little-harbour', 'Little Harbour', 'Nautical for toddler boys: stripes, sailor collars and navy with red, in soft jersey.',
         'Sailor collars, navy and red were season-defining at Playtime Paris [[js]]; Loir Paris\'s sailor top was in MilK\'s selection [[milk]].',
         'Navy, red, white.', '- Stripe rompers.\n- Sailor-collar shirts.\n- Shorts.', '- Jersey, interlock, light poplin.', '- Sailor tape, printed anchors.')]),
     ('toddler-girls', 'toddler girls, roughly 1 to 4 years', [
        ('pearl-tides', 'Pearl and Tides', 'Swim and beach for toddler girls in vintage pink, pastel green and soft navy, with UV protection.',
         'Piccoli Principi\'s "Pearl & Tides" runs from vintage pink to pastel green and soft navy, with UV protection [[pbs]]; UV kidswear is becoming common [[fit]].',
         'Vintage pink, pastel green, soft navy.', '- One-piece swimsuits with legs.\n- Sun suits.\n- Cover-up dresses.', '- UPF swim, organic cotton.', '- Ruffles secured, snap crotches.'),
        ('little-meadow', 'Little Meadow', 'Gentle florals and embroidery for toddler girls: muslin dresses, bloomers and soft knits.',
         'Fatamadrina\'s "Wildflowers Bloom" uses airy fabrics and delicate handcrafted embroidery [[fata]]; Cadhan uses soft organic cotton for sleepwear [[pbs]].',
         'Lavender, pastel green, sand.', '- Muslin dresses with bloomers.\n- Rompers.\n- Cardigans.', '- Muslin, voile, organic jersey.', '- Embroidery with soft backing, covered buttons.')])]:
    for slug, name, summ, story, col, sil, fab, trim in th:
        s.theme(A, slug, name, summ, story + ' ' + APP.format(a=lab), col, sil, fab, trim, status='Rising', timing='In stores February to August 2027.',
                products='- Rompers, sets, sun hats, sandals.', design='- Easy dressing: snaps at the crotch, wide neck openings.', commercial='- Gift buyers matter; package sets.')
    girl = A == 'toddler-girls'
    lead = ['Lavender', 'Coral', 'Aqua', 'Sand', 'Lemon'] if girl else ['Aqua', 'Navy', 'Sand', 'Grass green', 'Red']
    s.rep(A, 'colours', 'season-colours', f'{"Soft pastels with coral and lemon" if girl else "Aqua, navy and sand with green and red accents"} for SS27 {lab.split(",")[0]}.',
      ev=ev('pp', 'red') if girl else ev('red', 'naut', 'pool'),
      sections=[('The palette', pal(*lead)), ('Colour groups', '- **Core:** sand, white.\n- **Seasonal:** ' + ', '.join(lead[:3]).lower() + '.\n- Playful colour remains important for this age; keep brights as accents.')],
      design='- Low-impact, skin-friendly dyes; check colour fastness to saliva and sweat where required.', commercial='- Depth in sand and white basics.')
    s.rep(A, 'colours', 'theme-colour-palettes', f'Palettes for SS27 {lab.split(",")[0]} themes.', ev=ev('pp' if girl else 'naut'),
      sections=[('Palettes', table(['Theme', 'Lead', 'Accent'], [[t[1], t[4].split(',')[0], t[4].split(',')[-1].strip(' .')] for t in th]))],
      design='- Lead on most pieces.', commercial='- Accents shallow.')
    s.rep(A, 'colours', 'colour-stories', f'Two colour stories for {lab.split(",")[0]}.', ev=ev('pp', 'lull') if girl else ev('lull', 'naut'),
      sections=[(t[1], t[4]) for t in th], design='- One capsule per story.', commercial='- Gift sets by story.')
    s.rep(A, 'silhouettes', 'woven', f'Woven shapes for {lab.split(",")[0]}: {"muslin dresses with bloomers, sun suits and pinafores" if girl else "short rompers, pull-on shorts, camp shirts and short dungarees"}.',
      ev=ev('fata_s', 'fata_f'), sections=[('Shapes', '- ' + ('Muslin dress with bloomers.\n- Pinafore.\n- Sun suit.' if girl else 'Short romper.\n- Pull-on shorts.\n- Short dungarees with snap legs.\n- Camp shirt.'))],
      design='- Snap legs for nappy changes; no back buttons.', commercial='- Sets sell best.')
    s.rep(A, 'silhouettes', 'knit', f'Knit shapes for {lab.split(",")[0]}: rompers, two-piece jersey sets, sleepsuits and swim.', ev=ev('cozmo', 'cadhan'),
      sections=[('Shapes', '- Short-sleeve romper.\n- Tee and shorts set.\n- Sleepsuit.\n- ' + ('Swimsuit with legs.' if girl else 'Sun suit and swim shorts.'))],
      design='- Close-fitting sleepwear; check national nightwear flammability rules.', commercial='- Multipacks of basics.')
    s.rep(A, 'fabrics', 'woven', f'Wovens for {lab.split(",")[0]}: cotton muslin, voile, light poplin and linen-cotton.', ev=ev('fata_f', 'recyc'),
      sections=[('Fabric by fabric', table(['Fabric', 'Uses'], [['Cotton muslin', 'Dresses, shirts, wraps'], ['Voile', 'Dresses'], ['Light poplin', 'Shirts'], ['Linen-cotton', 'Shorts']]))],
      design='- Pre-wash; soft finishes only.', commercial='- Organic certification supports price.')
    s.rep(A, 'fabrics', 'knit', f'Knits for {lab.split(",")[0]}: organic cotton jersey and interlock, terry, rib and UPF swim.', ev=ev('sp', 'cadhan', 'uv'),
      sections=[('Fabric by fabric', table(['Knit', 'Uses'], [['Organic interlock', 'Rompers, sleepwear'], ['Jersey', 'Tees'], ['Terry', 'Sets, towels'], ['UPF swim', 'Swim']]))],
      design='- Test for skin-safety and colour fastness.', commercial='- Basics drive repeat purchase.')
    s.rep(A, 'trims', 'trending-trims', f'Trims for {lab.split(",")[0]}: snaps, flat seams, printed labels, embroidery with soft backing.', ev=ev('naut' if not girl else 'fata_p'),
      sections=[('Trims table', table(['Trim', 'Note'], [['Snap closures', 'Pull-tested'], ['Printed labels', 'No scratch'], ['Embroidery', 'Soft backing'], ['Appliqué', 'Fully stitched']]))],
      design='- No small detachable parts.', commercial='- Function sells.')
    s.rep(A, 'trims', 'trim-stories', f'Trims for each {lab.split(",")[0]} theme.', ev=ev('pp' if girl else 'naut'),
      sections=[(t[1], t[7]) for t in th], design='- One trim family per theme.', commercial='- Gift-ready packaging.')
    s.rep(A, 'trims', 'trim-market-strategy', f'Safety-first trims are the commercial choice for {lab.split(",")[0]}.', ev=ev('market', 'quick'),
      sections=[('Build, test, sell through', table(['Action', 'Trims'], [['Build', 'Snaps, printed labels, embroidery'], ['Test', 'Appliqué'], ['Avoid', 'Beads, sequins, shells']]))],
      design='- Avoid small parts.', commercial='- Safety builds trust.')
    s.rep(A, 'trims', 'trim-innovations', f'Comfort innovations for {lab.split(",")[0]}: tagless labels, magnetic and easy closures, dermatologically tested finishes.', ev=ev('cadhan'),
      sections=[('Readiness', table(['Innovation', 'Readiness'], [['Printed, tagless labels', 'Ready'], ['Easy closures', 'Ready; test magnets for safety'], ['Dermatologically tested finishes', 'Specialist']]))],
      design='- Magnets must be fully enclosed and secure.', commercial='- Ease of dressing sells to parents.')
    s.rep(A, 'styling', 'celebrity-influence', f'Family dressing and social media influence {lab.split(",")[0]}: matching sets for photos and events.', ev=ev('mini', 'marie' if girl else 'cozmo'),
      sections=[('What to take from it', '- Sibling and parent matching on prints.\n- Avoid celebrity names and likenesses.')],
      design='- Share prints with older sizes.', commercial='- Family capsules.')
    s.rep(A, 'styling', 'casualwear', f'Casual {lab.split(",")[0]}: romper and sun hat, tee and shorts set, first sandals.', ev=ev('pisa', 'cozmo'),
      sections=[('Formulas', '- Romper + sun hat + sandals.\n- Tee + shorts set.\n- ' + ('Muslin dress + bloomers.' if girl else 'Stripe romper.'))],
      design='- Easy changes.', commercial='- Gift sets.')
    s.rep(A, 'styling', 'formalwear', f'Occasion {lab.split(",")[0]}: {"smocked dresses and bloomers" if girl else "sailor-collar rompers and linen sets"}.', ev=ev('naut' if not girl else 'fata_p'),
      sections=[('Formulas', '- ' + ('Smocked dress + soft shoes.' if girl else 'Sailor romper + soft shoes.\n- Linen shirt + shorts.'))],
      design='- Soft linings.', commercial='- Ceremony season.')
    s.rep(A, 'styling', 'partywear', f'Party {lab.split(",")[0]}: soft colour, embroidered details, no small parts.', ev=ev('pool'),
      sections=[('Formulas', '- ' + ('Tulle-free embroidered dress.' if girl else 'Printed shirt romper.'))],
      design='- No sequins or beads.', commercial='- Gift buyers.')
    s.rep(A, 'couture', 'craft-techniques', f'Craft for {lab.split(",")[0]}: smocking, hand embroidery and artist prints.', ev=ev('halcyon', 'fata_p'),
      sections=[('Translating', '- Smocking.\n- Embroidery with soft backing.\n- Artist prints.')], design='- Hand work on safe placements.', commercial='- Heirloom gifts.')
    s.rep(A, 'couture', 'materials-details', f'Premium materials for {lab.split(",")[0]}: organic cotton, fine muslin, soft leather first shoes.', ev=ev('sp', 'pisa', 'gray'),
      sections=[('Materials', '- Organic cotton.\n- Fine muslin.\n- Soft leather first shoes.')], design='- Certified materials.', commercial='- Premium gifting.')
    s.rep(A, 'business-strategy', 'category-opportunities', f'Growth for {lab.split(",")[0]}: organic basics, sleepwear, first shoes, UV swim, gift sets.', ev=ev('sp', 'cadhan', 'pisa', 'uv'),
      sections=[('Opportunities', '1. Organic basics.\n2. Sleepwear.\n3. First-walker shoes.\n4. UV swim and hats.\n5. Gift sets.')], design='- Comfort first.', commercial='- Multipacks and gift sets.')
    s.rep(A, 'business-strategy', 'assortment-pricing', f'Assortment and pricing for {lab.split(",")[0]}.', ev=ev('market', 'outlook'),
      sections=[('Assortment', table(['Tier', 'What'], [['Core', 'Rompers, sets, sleepwear'], ['Seasonal', 'Swim, themes'], ['Statement', 'Occasion, heirloom']]))],
      design='- Durable for hand-me-downs.', commercial='- Gift price points.')
    s.rep(A, 'innovations', 'material-innovations', f'Materials for {lab.split(",")[0]}: certified organic cotton, UPF swim, skin-friendly finishes.', ev=ev('sp', 'uv', 'cadhan'),
      sections=[('Readiness', table(['Material', 'Readiness'], [['Organic cotton', 'Ready'], ['UPF swim', 'Ready'], ['Dermatologically tested finishes', 'Specialist']]))],
      design='- Skin-safety evidence.', commercial='- Verify claims.')
    s.rep(A, 'innovations', 'design-production', f'Design and production for {lab.split(",")[0]}: easy-dress construction, grading for growth, product data for the EU passport.', ev=ev('quick', 'dpp'),
      sections=[('Actions', '- Snap and envelope openings.\n- Grade for growth.\n- Record fibre, origin, safety tests.')], design='- Comfort first.', commercial='- Resale routes.')

# Kids celebrity influence
s.rep('kids', 'styling', 'celebrity-influence', 'Family dressing, social media and storytelling brands shape SS27 kidswear more than individual celebrities.',
  ev=ev('mini', 'marie', 'halcyon', 'smallable'),
  sections=[('What to take from it', '- Parent and child capsules on a few pieces.\n- Story-led brands win attention online.\n- Avoid celebrity names, children\'s likenesses and real people in campaigns without consent.')],
  design='- Design adult and child versions from one fabric or print.', commercial='- Family capsules lift basket size; plan around holidays and events.')
s.write()
