"""AW28 (Autumn/Winter 2028-29), all audiences. Long-range projection; AW28 fabric fairs September 2027, shows early 2028."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from src_ss27 import S as S27
from fclib import Season, build_audience
from genaud import genD, T

S = {
 'fs28': {'title': 'Spotted on the catwalk: Future Snoops\' colour trends for AW28/29', 'publisher': 'FashionUnited (Esmee Blaazer)', 'url': 'https://fashionunited.com/news/fashion/spotted-on-the-catwalk-future-snoops-colour-trends-for-aw28-29/2026102075255', 'date': '20 October 2026'},
 'pvaw': {'title': 'Première Vision Paris: what fabrics reveal about AW27/28 trends', 'publisher': 'FashionUnited', 'url': 'https://fashionunited.com/news/fairs/premiere-vision-paris-what-fabrics-reveal-about-aw27-28-trends/2026090474424', 'date': '4 September 2026'},
 'fwr': {'title': 'Fall/Winter 2027/28 trend report: controlled audacity in an age of agency', 'publisher': 'FashionUnited', 'url': 'https://fashionunited.com/news/fashion/fall-winter-2027-28-trend-report-controlled-audacity-in-an-age-of-agency/2026110375529', 'date': '3 November 2026'},
 'dusk': {'title': 'After Dusk: why Spring/Summer 2028 is going dark', 'publisher': 'FashionUnited (Future Snoops)', 'url': 'https://fashionunited.com/news/fashion/after-dusk-why-spring-summer-2028-is-going-dark/2026103075456', 'date': '30 October 2026'},
 'pt26': {'title': 'CSR drives desirability in kidswear market: Playtime 2026 insights', 'publisher': 'FashionUnited', 'url': 'https://fashionunited.com/news/fairs/csr-drives-desirability-in-kidswear-market-playtime-2026-insights/2026012870269', 'date': '28 January 2026'},
 'cf28': {'title': 'Forecut AW28 colour forecast', 'publisher': 'Forecut', 'url': 'https://forecut.in/forecasts/aw28/colours/colour-forecast/', 'date': 'November 2026', 'note': 'Long-range Forecut projection carrying the AW27 move away from black and the SS28 return of strong blues and violets'},
 'fu27': S27['fu27'], 'bofmm': S27['bofmm'], 'en14682': S27['en14682'],
}
BASIS = ('Long-range projection. AW28 fabric fairs take place in September 2027 and the shows in early 2028. This report projects from the first '
         'AW28/29 colour forecasts, the AW27 fabric fairs, SS28 previews and long-term market and regulatory drivers. Forecut will update it as evidence arrives.')
s = Season('aw28', S, 'AW28/29 colour previews (October 2026), AW27 fairs (September 2026), SS28 previews', 'Global; premium and mid-market', basis=BASIS)
E = {
 'blocked': ('Future Snoops\' AW28/29 "Blocked brights": "Bold colour becomes an act of defiance, a refusal to disappear into the algorithmic mass"; blue leads, with red and purple rising, and cornflower as a new "anchor colour"', 'fs28'),
 'pink': ('Pink becomes a neutral base ("Pink standard"), from soft blush to greyish dusty rose, no longer limited to womenswear; rosehip is a standout pink; suggested for blazers, skirt suits and voile dresses with ruffles or lace', 'fs28'),
 'marin': ('"Marinated midtones": honey brown, mustard yellow, turquoise, lime, retro orange and a brown-burgundy, with "pickled fennel" as an anchor colour', 'fs28'),
 'brown': ('Deep classic brown in leather and leather-look pieces, sporty pieces and tailoring, suited to suede and canvas-like materials', 'fs28'),
 'cobalt': ('Vibrant cobalt with a violet undertone, paired with white; deep wine red with cream and black; bright matcha green with chartreuse and ecru, in menswear and womenswear', 'fs28'),
 'violet27': ('AW27 fairs put violet, plum and deep red forward as alternatives to black, and pink and mauve became gender-neutral', 'pvaw'),
 'wool27': ('AW27 fairs made wool lighter and softer, brought back double-faced woollens and hid performance inside classic suitings', 'pvaw'),
 'fam27': ('AW27 forecasters expected familiar codes made personal, eveningwear in daywear and protected, light volume in menswear', 'fwr'),
 'dusk28': ('SS28 forecasts already carry darker, atmospheric colour into summer', 'dusk'),
 'cf': ('Forecut\'s AW28 projection: ink, mulberry and bottle green over oat and slate, with petrol teal and vermilion as accents', 'cf28'),
 'csr': ('Kidswear brands build on organic cotton, merino, modal, permanent ranges and take-back schemes', 'pt26'),
 'outlook': ('Fashion entered 2027 expecting low single-digit growth, with markdown risk and faster growth in resale', 'fu27'),
 'dpp': ('The EU textiles Digital Product Passport delegated act is planned for the fourth quarter of 2027, so AW28 production will be planned under it', 'fu27'),
 'mini': ('Celebrity parents and social media have driven mini-me family dressing', 'bofmm'),
}
EVA = {'default': ['cf', 'outlook'], 'col': ['cf', 'blocked', 'pink', 'cobalt', 'brown'], 'tcp': ['cf', 'blocked'], 'cs': ['marin', 'cobalt', 'cf'], 'sw': ['fam27', 'wool27', 'pink'],
       'sk': ['marin', 'wool27'], 'fw': ['wool27', 'brown'], 'fk': ['wool27', 'marin'], 'tt': ['brown', 'fam27'], 'ts': ['fam27'], 'tm': ['outlook'], 'ti': ['wool27', 'dpp'],
       'celeb': ['blocked'], 'casual': ['brown', 'marin'], 'formal': ['pink', 'wool27'], 'party': ['cobalt', 'blocked'], 'craft': ['wool27'], 'mat': ['brown', 'wool27'],
       'opp': ['pink', 'brown', 'blocked', 'wool27'], 'ass': ['outlook'], 'mi': ['wool27'], 'dpi': ['dpp']}
EVK = dict(EVA, col=['cf', 'blocked', 'violet27'], sw=['wool27', 'csr'], fk=['csr', 'wool27'], celeb=['mini'], opp=['csr', 'outlook'], mi=['csr', 'wool27'])
PAL = [('Mulberry', '19-2428 TCX', '#6B264B', 'Seasonal: lead'), ('Ink', '19-3831 TCX', '#27293D', 'Core'), ('Antique gold', '16-0948 TCX', '#B68A3A', 'Seasonal'),
       ('Lavender grey', '16-3810 TCX', '#A198AF', 'Accent'), ('Vermilion', '18-1454 TCX', '#C2452D', 'Accent'), ('Oat', '14-1108 TCX', '#D7CAB0', 'Core'),
       ('Slate', '18-4214 TCX', '#58646D', 'Core'), ('Bottle green', '19-6050 TCX', '#264E36', 'Seasonal'), ('Cocoa', '19-1224 TCX', '#5D4236', 'Core'),
       ('Petrol teal', '19-4826 TCX', '#2A5C6A', 'Accent')]
TM = [['Build', 'Horn, corozo and leather buttons; tonal piping'], ['Test', 'Antique-gold hardware, embroidery'], ['Sell through', 'Logo hardware']]
TI = [['Repairable, replaceable parts', 'Ready in outerwear and bags'], ['Bonded and heat-fused construction', 'Ready'], ['Product data labels (QR or NFC)', 'Ready; required as the EU passport arrives']]

W = dict(code='AW28', label='womenswear', t='In stores August 2028 to January 2029.', palrows=PAL,
 pal=['Mulberry', 'Ink', 'Antique gold', 'Lavender grey', 'Vermilion', 'Oat'],
 col_s='AW28 womenswear colour is projected to lead with mulberry and ink, with antique gold, lavender grey and a vermilion statement; pink becomes a neutral and blue a new anchor.',
 groups='- **Core:** ink, oat, cocoa.\n- **Seasonal:** mulberry, antique gold, cornflower-type blues.\n- **Accent:** vermilion, lavender grey, dusty pink as a neutral.',
 byp='- Mulberry: coats, knits, velvet.\n- Ink: tailoring.\n- Antique gold: knits, trims.\n- Dusty pink: blazers, skirt suits.',
 themes=[T('blocked-brights', 'Blocked Brights', 'Colour as defiance: blocked blues, red and purple in confident tailoring and knits.', 'Future Snoops\' AW28/29 "Blocked brights" makes bold colour "an act of defiance"; blue leads and cornflower becomes an anchor colour [[fs28]].', 'Cornflower, cobalt, red, purple.', '- Colour-blocked coats.\n- Bright suits.', 'Double-faced wool, felted wool.', 'Tonal buttons.', ['Cobalt or cornflower', 'Vermilion 18-1454 TCX', 'Ink, oat'], '- Coats, suits, knits.'),
   T('pink-standard', 'Pink Standard', 'Pink as a neutral: blush to dusty rose blazers, skirt suits and romantic voile dresses with lace.', 'Pink becomes a neutral base, no longer limited to womenswear, suggested for blazers, skirt suits and voile dresses with ruffles or lace [[fs28]].', 'Blush, dusty rose, rosehip with brown.', '- Skirt suit.\n- Voile dress.', 'Flannel, voile, lace.', 'Ruffles, lace insets.', ['Dusty rose', 'Rosehip', 'Cocoa, oat'], '- Suits, dresses.'),
   T('marinated', 'Marinated', 'Retro midtones with a lived-in depth: honey brown, mustard, lime, retro orange and brown-burgundy.', 'Future Snoops\' "Marinated midtones" give earthy, retro tones depth and a lived-in look, anchored by "pickled fennel" [[fs28]].', 'Honey brown, mustard, pickled-fennel green.', '- Suede jackets.\n- Knit sets.', 'Suede, brushed wool.', 'Antique-gold hardware.', ['Honey brown', 'Mustard', 'Pickled fennel'], '- Suede, knits.')],
 stories=[('Night Blues', 'Ink, slate, petrol teal and oat.'), ('Berry and Gold', 'Mulberry, antique gold, cocoa and oat.'), ('Deep Forest', 'Bottle green, cocoa, oat and vermilion.'), ('Pink Standard', 'Blush to dusty rose with brown.')],
 sw_s='AW28 women\'s wovens are projected to keep personal tailoring and broad coats, with pink skirt suits and colour-blocked coats.', sw='- **Skirt suit.**\n- **Broad coat.**\n- **Colour-blocked coat.**\n- **Voile dress with lace.**\n- **Suede jacket.**',
 sk_s='AW28 women\'s knits: midtone knit sets, mulberry and gold knits, fine merino layers.', sk='- **Knit set.**\n- **Gold-toned jumper.**\n- **Merino layer.**\n- **Chunky cardigan.**',
 fw_s='AW28 women\'s wovens: double-faced wool, flannel, suede and suede-look, voile and lace.', fw=[['Double-faced wool', 'Soft', 'Coats'], ['Flannel', 'Brushed', 'Suits'], ['Suede', 'Velvety', 'Jackets'], ['Voile and lace', 'Light', 'Dresses']],
 fk_s='AW28 women\'s knits: fine merino, brushed wool, mohair blends.', fk=[['Fine merino', 'Smooth', 'Layers'], ['Brushed wool', 'Hairy', 'Jumpers'], ['Mohair blend', 'Airy', 'Cardigans']],
 tt_s='AW28 women\'s trims: antique-gold hardware, lace, ruffles, horn buttons.', tt=[['Antique-gold hardware', 'Bags, coats', 'Rising'], ['Lace insets', 'Dresses', 'Rising'], ['Horn buttons', 'Tailoring', 'Core']], tm=TM,
 ti_s='Trim and detail innovations for AW28: repairable parts and product data labels.', ti=TI,
 celeb_s='AW28 influence is projected toward confident colour and personal styling rather than single celebrities.', celeb='- Bold colour as self-expression.\n- Personal combinations.',
 casual='- **Suede jacket + knit set.**\n- **Mustard knit + brown trousers.**', formal='- **Pink skirt suit.**\n- **Ink suit + mulberry knit.**', party='- **Cobalt dress.**\n- **Wine velvet with cream.**',
 craft_s='Craft for AW28 women: double-faced finishing, hand embroidery, lace.', craft='- Double-faced coats.\n- Hand embroidery.\n- Lace.',
 mat_s='Couture materials for AW28 women: suede, velvet, lace, double-faced cashmere.', mat='- Suede.\n- Velvet.\n- Lace.\n- Double-faced cashmere.',
 opp_s='Projected growth for AW28 women: coats, skirt suits, suede, colour knits.', opp='1. Coats.\n2. Skirt suits.\n3. Suede and leather-look.\n4. Colour knits.\n5. Romantic dresses.',
 ass=[['Core (about half)', 'Tailoring, knits in ink, oat, cocoa'], ['Seasonal (about a third)', 'Mulberry, pink suits, suede'], ['Statement (the rest)', 'Blocked brights, lace']], pricing='- Full price on coats and suede.\n- Value on merino.',
 mi_s='Material innovations for AW28 women: lighter wools, hidden performance, chrome-free and vegetable-tanned leather.', mi=[['Lighter wools', 'Ready'], ['Hidden performance suiting', 'Ready'], ['Chrome-free leather', 'Ready']],
 dpi_s='Design and production for AW28: the first winter planned under the EU passport timeline; repair and data by design.', dpi='- Product data from the first sample.\n- Repairable construction.\n- Fibre and origin records.')

M = dict(W, label='menswear', pal=['Ink', 'Slate', 'Bottle green', 'Cocoa', 'Petrol teal', 'Oat'],
 col_s='AW28 menswear colour is projected around ink, slate and bottle green tailoring, cocoa knits and petrol teal outerwear, with deep brown and cobalt from the catwalk forecasts.',
 groups='- **Core:** ink, slate, cocoa, oat.\n- **Seasonal:** bottle green, deep brown.\n- **Accent:** petrol teal, cobalt, matcha.', byp='- Ink and slate: tailoring.\n- Cocoa: knits.\n- Bottle green: coats.\n- Petrol teal: outerwear.',
 themes=[T('deep-brown', 'Deep Brown', 'Brown as the menswear base: leather and suede jackets, brown tailoring and sporty brown pieces.', 'Future Snoops names deep classic brown in leather, sporty pieces and tailoring, suited to suede and canvas-like materials [[fs28]].', 'Cocoa, cognac, oat.', '- Suede jacket.\n- Brown suit.', 'Suede, flannel, canvas.', 'Horn buttons, leather patches.', ['Cocoa 19-1224 TCX', 'Petrol teal', 'Oat'], '- Jackets, suits.'),
   T('matcha', 'Matcha', 'Bright matcha green with chartreuse and ecru in menswear knits and outerwear.', 'Future Snoops names bright matcha green with chartreuse and ecru, with menswear examples [[fs28]].', 'Matcha, chartreuse, ecru.', '- Knit.\n- Parka.', 'Wool, nylon.', 'Contrast zips.', ['Matcha', 'Chartreuse', 'Ecru'], '- Knits, outerwear.')],
 stories=[('Night Blues', 'Ink, slate, petrol teal.'), ('Deep Forest', 'Bottle green, cocoa, oat.'), ('Brown', 'Deep brown and cognac.')],
 sw_s='AW28 men\'s wovens: light-volume outerwear, brown and ink tailoring, suede jackets.', sw='- **Light down.**\n- **Suede jacket.**\n- **Relaxed suit.**\n- **Waistcoat.**',
 sk_s='AW28 men\'s knits: cocoa and matcha knits, turtlenecks, knit jackets.', sk='- **Turtleneck.**\n- **Knit jacket.**\n- **Chunky crew.**',
 fw=[['Flannel', 'Brushed', 'Suits'], ['Suede', 'Velvety', 'Jackets'], ['Membrane suiting', 'Technical', 'Coats'], ['Canvas', 'Firm', 'Workwear']], fw_s='AW28 men\'s wovens: flannel, suede, membrane suiting, canvas.',
 tt=[['Horn buttons', 'Tailoring', 'Core'], ['Leather patches', 'Jackets', 'Rising'], ['Contrast zips', 'Outerwear', 'Rising']], tt_s='AW28 men\'s trims: horn, leather, contrast zips.',
 casual='- **Suede jacket + knit + jeans.**\n- **Matcha knit + brown trousers.**', formal='- **Brown suit + turtleneck.**\n- **Ink suit + waistcoat.**', party='- **Wine velvet jacket.**',
 celeb_s='Men\'s AW28 influence: brown, leather and bold single colours.', celeb='- Brown leather.\n- One bold colour.',
 opp_s='Projected growth for AW28 menswear: suede and leather, brown tailoring, light outerwear, colour knits.', opp='1. Suede and leather.\n2. Brown tailoring.\n3. Light outerwear.\n4. Colour knits.',
 ass=[['Core', 'Tailoring and knits in ink, slate, cocoa'], ['Seasonal', 'Brown suede, bottle green coats'], ['Statement', 'Matcha, cobalt']], fk_s='AW28 men\'s knits: fine merino, brushed wool, cashmere blends.', fk=[['Fine merino', 'Smooth', 'Turtlenecks'], ['Brushed wool', 'Hairy', 'Crews'], ['Cashmere blend', 'Soft', 'Knit jackets']],
 craft_s='Craft for AW28 men: suede finishing, natural dyeing, double-faced coats.', craft='- Hand-finished suede.\n- Naturally dyed knits.\n- Double-faced coats.',
 mi_s='Material innovations for AW28 men: lighter wools, hidden performance suiting, chrome-free leather and suede.', pricing='- Full price on suede, leather and technical outerwear.\n- Value on knits.',
 mat_s='Couture materials for AW28 men: suede, cashmere, shearling.', mat='- Suede.\n- Cashmere.\n- Shearling.')

KPAL = [('Bottle green', '19-6050 TCX', '#264E36', 'Seasonal: lead'), ('Mulberry', '19-2428 TCX', '#6B264B', 'Seasonal'), ('Vermilion', '18-1454 TCX', '#C2452D', 'Accent'),
        ('Antique gold', '16-0948 TCX', '#B68A3A', 'Seasonal'), ('Petrol teal', '19-4826 TCX', '#2A5C6A', 'Accent'), ('Oat', '14-1108 TCX', '#D7CAB0', 'Core')]
KB = ('Long-range projection. AW28 kidswear fairs take place in January 2028. This report projects from the first AW28/29 colour forecasts, the AW27 fairs, '
      'kidswear brands\' long-term practices and market drivers, and will be updated as evidence arrives.')
Kd = dict(W, label='kidswear', palrows=KPAL, pal=['Bottle green', 'Mulberry', 'Vermilion', 'Antique gold', 'Petrol teal', 'Oat'],
 col_s='AW28 kidswear colour is projected around bottle green, mulberry and vermilion with antique gold and oat.', groups='- **Core:** oat, petrol teal.\n- **Seasonal:** bottle green, mulberry, antique gold.\n- **Accent:** vermilion.',
 byp='- Bottle green: coats.\n- Mulberry: knits.\n- Vermilion: accessories.\n- Oat: basics.',
 themes=[T('forest-school', 'Forest School', 'Outdoor winter for children: bottle-green coats, waterproof layers, cord and fleece.', 'Forecut\'s AW28 projection puts bottle green with cocoa and oat in its "Deep Forest" story [[cf28]]; kidswear brands build on durable, organic and merino materials [[pt26]].', 'Bottle green, oat, vermilion.', '- Waterproof coat.\n- Fleece.\n- Cords.', 'Water-repellent shell, fleece, cord.', 'Reflective tape.', ['Bottle green 19-6050 TCX', 'Vermilion 18-1454 TCX', 'Oat'], '- Coats, fleece, cords.'),
   T('berry-gold', 'Berry and Gold', 'Festive kidswear in mulberry and antique gold: velvet, knits and occasion pieces.', 'Forecut\'s "Berry and gold" story pairs mulberry and antique gold [[cf28]].', 'Mulberry, antique gold.', '- Velvet dress or blazer.\n- Knit.', 'Velvet, knit.', 'Gold-tone buttons (secured).', ['Mulberry 19-2428 TCX', 'Antique gold 16-0948 TCX', 'Oat'], '- Occasion, knits.')],
 stories=[('Deep Forest', 'Bottle green, oat, vermilion.'), ('Berry and Gold', 'Mulberry and gold.'), ('Teal', 'Petrol teal and oat.')],
 sw_s='AW28 kidswear wovens: waterproof coats, cords, dungarees, velvet occasion pieces.', sw='- **Waterproof coat.**\n- **Cord trouser.**\n- **Dungaree.**\n- **Velvet piece.**',
 sk_s='AW28 kidswear knits: merino layers, fleece, chunky knits.', sk='- **Merino layer.**\n- **Fleece.**\n- **Chunky knit.**',
 fw_s='AW28 kidswear wovens: cord, denim, water-repellent shells, velvet.', fw=[['Cord', 'Soft', 'Trousers'], ['Denim', 'Durable', 'Jeans'], ['Water-repellent shell', 'Light', 'Coats'], ['Velvet', 'Rich', 'Occasion']],
 fk_s='AW28 kidswear knits: merino, organic fleece, wool blends.', fk=[['Merino', 'Smooth', 'Layers'], ['Organic fleece', 'Soft', 'Sweatshirts'], ['Wool blend', 'Warm', 'Knits']],
 tt_s='AW28 kidswear trims: reflective tape, embroidered badges, snaps.', tt=[['Reflective tape', 'Coats', 'Core'], ['Embroidered badges', 'Sweatshirts', 'Core'], ['Snaps', 'Baby', 'Core']],
 tm=[['Build', 'Embroidery, reflective tape'], ['Test', 'Gold-tone details'], ['Avoid', 'Small parts']],
 ti_s='Kidswear innovations: reflective details, easy closures, product data labels.', ti=[['Reflective details', 'Ready'], ['Easy closures', 'Ready'], ['Product data labels', 'Ready']],
 celeb_s='Family dressing shapes AW28 kidswear.', celeb='- Family festive knits.\n- No children\'s likenesses without consent.',
 casual='- **Fleece + cords + boots.**', formal='- **Velvet piece + knit.**', party='- **Mulberry velvet + gold details.**',
 craft_s='Craft for AW28 kidswear: knitted texture and embroidery.', craft='- Intarsia.\n- Embroidery.', mat_s='Premium materials for AW28 kidswear: merino, organic cotton, velvet.', mat='- Merino.\n- Organic cotton.\n- Velvet.',
 opp_s='Projected growth for AW28 kidswear: outerwear, merino, occasion velvet, durable basics.', opp='1. Outerwear.\n2. Merino.\n3. Velvet occasion.\n4. Basics.',
 ass=[['Core', 'Basics, cords, fleece'], ['Seasonal', 'Coats, velvet'], ['Statement', 'Festive']], pricing='- Full price on outerwear and merino.',
 mi_s='Material innovations for AW28 kidswear: washable merino, recycled shells, organic fleece.', mi=[['Washable merino', 'Ready'], ['Recycled shells', 'Ready'], ['Organic fleece', 'Ready']],
 dpi_s='Design and production for AW28 kidswear: permanent ranges, take-back and EU product data.', dpi='- Permanent styles.\n- Take-back.\n- Product data.')
B = dict(Kd, label='boyswear', pal=['Bottle green', 'Petrol teal', 'Vermilion', 'Oat'], col_s='AW28 boyswear colour is projected around bottle green and petrol teal with vermilion.',
 themes=[Kd['themes'][0]], sw='- **Waterproof parka.**\n- **Cargo.**\n- **Cord trouser.**', party='- **Velvet blazer + tee.**', formal='- **Check shirt + cords.**', opp_s='Projected growth for AW28 boyswear: parkas, cargos, fleece.', opp='1. Parkas.\n2. Cargos.\n3. Fleece.')
G = dict(Kd, label='girlswear', pal=['Mulberry', 'Antique gold', 'Bottle green', 'Oat'], col_s='AW28 girlswear colour is projected around mulberry and antique gold with bottle green.',
 themes=[Kd['themes'][1]], sw='- **Velvet dress.**\n- **Pinafore.**\n- **Coat.**', formal='- **Velvet dress + cardigan.**', opp_s='Projected growth for AW28 girlswear: velvet occasion, knits, coats.', opp='1. Velvet.\n2. Knits.\n3. Coats.')
TB = dict(Kd, label='toddler boys', pal=['Bottle green', 'Petrol teal', 'Oat'], col_s='AW28 toddler boys\' colour is projected around bottle green, petrol teal and oat.',
 themes=[T('little-forest', 'Little Forest', 'Cosy outdoor for toddler boys: pramsuits, fleece and cords in bottle green and oat.', 'Forecut\'s "Deep Forest" story [[cf28]]; durable, organic and merino materials in kidswear [[pt26]].', 'Bottle green, oat.', '- Pramsuit.\n- Fleece.', 'Fleece, cord.', 'Snaps.', ['Bottle green', 'Petrol teal', 'Oat'], '- Pramsuits, fleece.')],
 sw='- **Pramsuit.**\n- **Cord dungaree.**', party='- **Soft velvet-look romper (no small parts).**', formal='- **Knit cardigan + romper.**', opp_s='Projected growth for AW28 toddler boys: pramsuits, merino sets, sleepwear.', opp='1. Pramsuits.\n2. Merino sets.\n3. Sleepwear.')
TG = dict(TB, label='toddler girls', pal=['Mulberry', 'Antique gold', 'Oat'], col_s='AW28 toddler girls\' colour is projected around mulberry, antique gold and oat.',
 themes=[T('little-berry', 'Little Berry', 'Festive and cosy for toddler girls: mulberry knits and velvet dresses with bloomers.', 'Forecut\'s "Berry and gold" story [[cf28]]; kidswear brands build on organic and merino materials [[pt26]].', 'Mulberry, oat.', '- Knit set.\n- Velvet dress with bloomers.', 'Merino, velvet.', 'Covered buttons.', ['Mulberry', 'Antique gold', 'Oat'], '- Knits, dresses.')],
 sw='- **Pramsuit.**\n- **Velvet dress with bloomers.**', opp_s='Projected growth for AW28 toddler girls: pramsuits, knit sets, velvet occasion.', opp='1. Pramsuits.\n2. Knit sets.\n3. Velvet occasion.')

for aud, c in [('women', W), ('men', M)]:
    build_audience(s, aud, genD(c, EVA), E)
s.basis = KB
for aud, c in [('kids', Kd), ('boys', B), ('girls', G), ('toddler-boys', TB), ('toddler-girls', TG)]:
    build_audience(s, aud, genD(c, EVK, kids=True), E)
s.write()
