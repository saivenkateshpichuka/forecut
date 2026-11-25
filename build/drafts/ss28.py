"""SS28 (Spring/Summer 2028), all audiences. Long-range projection; fabric fairs January-February 2027, shows June-October 2027."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from src_ss27 import S as S27
from fclib import Season, build_audience
from genaud import genD, T

S = {
 'dusk': {'title': 'After Dusk: why Spring/Summer 2028 is going dark', 'publisher': 'FashionUnited (Joanne Thomas, Director of Color, Future Snoops)', 'url': 'https://fashionunited.com/news/fashion/after-dusk-why-spring-summer-2028-is-going-dark/2026103075456', 'date': '30 October 2026'},
 'perf': {'title': 'SS28 preview: the modern flow of performance design', 'publisher': 'FashionUnited (Rachael Gentner, Future Snoops)', 'url': 'https://fashionunited.com/news/fashion/ss28-preview-the-modern-flow-of-performance-design/2025112269243', 'date': 'November 2025'},
 'mu28': {'title': 'MU Metamorphosis: Spring-Summer 2028 collections', 'publisher': 'Milano Unica', 'url': 'https://www.milanounica.it/en/media-sp', 'date': '2026'},
 'c2': {'title': 'Spring Summer 2028 trend intelligence: the rise of structured clarity', 'publisher': 'FashionUnited (partner content, C2 Fashion Studio)', 'url': 'https://fashionunited.com/news/fashion/spring-summer-2028-trend-intelligence-the-rise-of-structured-clarity/2026060372742', 'date': 'June 2026'},
 'cph': {'title': 'Copenhagen SS27\'s data points to one thing: colour is back, neutrals are out', 'publisher': 'FashionUnited', 'url': 'https://fashionunited.com/news/fashion/copenhagen-ss27s-data-points-to-one-thing-colour-is-back-neutrals-are-out/2026081874112', 'date': '18 August 2026'},
 'pvaw': {'title': 'Première Vision Paris: what fabrics reveal about AW27/28 trends', 'publisher': 'FashionUnited', 'url': 'https://fashionunited.com/news/fairs/premiere-vision-paris-what-fabrics-reveal-about-aw27-28-trends/2026090474424', 'date': '4 September 2026'},
 'cf28': {'title': 'Forecut SS28 colour forecast', 'publisher': 'Forecut', 'url': 'https://forecut.in/forecasts/ss28/colours/colour-forecast/', 'date': 'November 2026', 'note': 'Long-range forecast from Première Vision\'s October 2026 SS28 colour preview and fabric-fair previews'},
 'fu27': S27['fu27'], 'fit': S27['fit'], 'pbs': S27['pbs'], 'js': S27['js'], 'fs': S27['fs'], 'hb': S27['hb'], 'bofmm': S27['bofmm'], 'en14682': S27['en14682'],
}
BASIS = ('Long-range projection. SS28 fabric fairs open with Première Vision Paris on 26-28 January 2027, and the shows run from June to October 2027. '
         'This report projects from the first SS28 forecaster and fair previews, the SS27 runways and long-term market and regulatory drivers. '
         'Forecut will update it after the fairs and again after the shows.')
s = Season('ss28', S, 'SS28 previews published November 2025 to November 2026; SS27 runway record', 'Global; premium and mid-market', basis=BASIS)
E = {
 'dusk': ('Future Snoops\' SS28 colour shift "After Dusk": "Deep aubergines, inky blues and murky greens are bringing a darker, more atmospheric mood to warm-weather dressing"', 'dusk'),
 'dusk_c': ('Its named colours include Aubergine Skin, Solar Midnight, Smoky Lavender and Swamp Green, with Cloud Bloom as a luminous counterpoint and Fruit Punch for "juicy intensity"; dark shades work best with contrast, not head to toe', 'dusk'),
 'dusk_m': ('Matte finishes ground dark colour, satin and gloss intensify it, and sheer fabrics and open knits lighten it; extreme heat is moving socialising into the evening', 'dusk'),
 'dusk_l': ('Lace, corsetry and dramatic silhouettes return, reinterpreted with lighter materials', 'dusk'),
 'perf': ('Future Snoops\' SS28 performance preview: "smart translucent membranes, hyperlight wovens, and innovative technical silks", ultrastretch wovens, modular constructions and articulated seams', 'perf'),
 'perf_h': ('Performance, everyday and occasion wear merge: "technical blazers, adaptable skirts, and tailored baselayers", in sun-warmed neutrals and soft gradients', 'perf'),
 'perf_w': ('Everyday basics gain "integrated wellness properties" and materials that "intuitively adjust for temperature and activity"', 'perf'),
 'mu': ('Milano Unica\'s SS28 theme "Metamorphosis" rests on Lightness, Enrichment ("the rediscovery of handcrafted techniques") and Adaptability, with LIGHTWEAR, HANDWEAR and TECHWEAR themes', 'mu28'),
 'mu_w': ('Milano Unica sees wool moving toward "ultra-fine qualities, airy surfaces and ultralight constructions"', 'mu28'),
 'c2': ('C2 Fashion Studio calls SS28 "Structured Clarity": consumers "are no longer asking for more. They\'re asking for better"', 'c2'),
 'cph': ('Copenhagen SS27 data showed colour returning and neutrals fading; Jacquemus built its SS27 show around turquoise and orange', 'cph'),
 'cf': ('Forecut\'s SS28 colour forecast: royal blue and a new turquoise beside greyish mauve and violet, over straw and bleached linen, with an after-dark edge', 'cf28'),
 'pvnext': ('Première Vision Paris presents SS28 collections on 26-28 January 2027', 'pvaw'),
 'outlook': ('Fashion is expected to remain in low single-digit growth in 2027; resale is expected to grow two to three times faster than first-hand fashion', 'fu27'),
 'dpp': ('The EU textiles Digital Product Passport delegated act is planned for the fourth quarter of 2027, so SS28 production is the first to be planned under it', 'fu27'),
 'heat27': ('SS27 was shaped by heat: Hypebeast called the sun "the true main character of SS27"', 'hb'),
 'uv': ('UV-protective, breathable and quick-dry kidswear became common at Pitti Bimbo in June 2026', 'fit'),
 'kidsfair': ('SS27 kidswear fairs showed swim with UV protection, organic cotton and coordinated sets', 'pbs'),
 'js': ('Playtime Paris SS27 showed red, stripes, nautical, refined sport and stronger denim', 'js'),
 'fs': ('Future Snoops\' SS27 kids trends Lull (elevated basics) and Happenstance (playful, child-led design) frame the following summer', 'fs'),
 'mini': ('Celebrity parents and social media have driven mini-me family dressing', 'bofmm'),
}
EVA = {'default': ['cf', 'c2'], 'col': ['cf', 'dusk', 'dusk_c', 'cph'], 'tcp': ['dusk_c', 'cf'], 'cs': ['dusk', 'cf'], 'sw': ['perf', 'perf_h', 'dusk_l', 'heat27'], 'sk': ['dusk_m', 'mu_w', 'perf'],
       'fw': ['perf', 'mu', 'mu_w'], 'fk': ['mu_w', 'dusk_m', 'perf_w'], 'tt': ['mu', 'perf'], 'ts': ['mu'], 'tm': ['outlook', 'c2'], 'ti': ['perf', 'perf_w'],
       'celeb': ['dusk', 'c2'], 'casual': ['perf_h', 'heat27'], 'formal': ['perf_h', 'c2'], 'party': ['dusk', 'dusk_m', 'dusk_l'], 'craft': ['mu'], 'mat': ['perf', 'mu'],
       'opp': ['perf_h', 'dusk', 'heat27', 'c2'], 'ass': ['outlook', 'c2'], 'mi': ['perf', 'perf_w', 'mu_w'], 'dpi': ['perf', 'dpp', 'pvnext']}
EVK = dict(EVA, col=['cf', 'cph', 'dusk_c'], sw=['heat27', 'uv', 'js'], sk=['uv', 'kidsfair'], fk=['uv', 'kidsfair', 'perf_w'], fw=['mu', 'kidsfair'], celeb=['mini'],
           casual=['js', 'fs'], party=['dusk_c', 'js'], opp=['uv', 'kidsfair', 'outlook'], mi=['uv', 'perf_w'])
PAL = [('Royal blue', '18-3949 TCX', '#3850A0', 'Seasonal: lead'), ('Sonar turquoise', '16-5123 TCX', '#279D9F', 'Seasonal'), ('Greyish mauve', '15-3507 TCX', '#BDABBE', 'Seasonal'),
       ('Magnetic violet', '19-3847 TCX', '#44377D', 'Accent'), ('Peach', '13-1125 TCX', '#F5B895', 'Accent'), ('Acid lemon', '12-0646 TCX', '#EBDF67', 'Accent'),
       ('Straw', '14-0935 TCX', '#DABE81', 'Core'), ('Bleached linen', '11-0701 TCX', '#EDE6DB', 'Core'), ('Inky blue', '19-3933 TCX', '#29304E', 'Core'),
       ('Khaki green', '18-0525 TCX', '#818455', 'Core'), ('Deep sky', '16-4132 TCX', '#6EA2D5', 'Seasonal')]
TM = [['Build', 'Natural buttons (corozo, shell), tonal piping'], ['Test', 'Hand-finished embroidery, technical toggles'], ['Sell through', 'Heavy hardware in summer ranges']]
TI = [['Translucent membranes on summer outerwear', 'Early; specialist mills'], ['Ultrastretch wovens', 'Ready'], ['Temperature-adaptive finishes', 'Early; test claims'], ['Modular, detachable parts', 'Ready in outerwear']]

W = dict(code='SS28', label='womenswear', t='In stores February to July 2028.', palrows=PAL,
 pal=['Royal blue', 'Greyish mauve', 'Magnetic violet', 'Peach', 'Straw', 'Bleached linen', 'Inky blue'],
 col_s='SS28 womenswear colour is projected to bring royal blue and greyish mauve forward, over straw and bleached linen, with darker after-dusk tones for evening.',
 groups='- **Core:** bleached linen, straw, inky blue.\n- **Seasonal:** royal blue, greyish mauve.\n- **Accent:** magnetic violet, peach.',
 byp='- Royal blue: shirts, dresses, tailoring.\n- Greyish mauve: sheer layers, knits.\n- Inky blue: evening, after-dusk dressing.\n- Straw and linen: summer bases, raffia accessories.',
 themes=[T('after-dusk', 'After Dusk', 'Summer goes dark for evenings: aubergine, inky blue and murky green in sheer, satin and lace, with sharp flashes of colour.',
     'Future Snoops\' "After Dusk" brings deep aubergines, inky blues and murky greens to warm-weather dressing, as extreme heat moves socialising into the evening [[dusk]]. Lace, corsetry and dramatic silhouettes return in lighter materials [[dusk]].',
     'Inky blue and magnetic violet with acid lemon or peach as the flash.', '- Slip and corset-line dresses in light fabrics.\n- Sheer layers over dark bases.', 'Satin, lace, voile, open knits.', 'Lace insets, fine straps, satin piping.', ['Inky blue 19-3933 TCX', 'Acid lemon 12-0646 TCX', 'Magnetic violet, greyish mauve'], '- Evening dresses, sheer tops, satin skirts.'),
   T('weightless', 'Weightless', 'Lightness as luxury: hyperlight wovens, ultralight wool, translucent layers and soft, adaptable tailoring.',
     'Milano Unica\'s SS28 "Metamorphosis" starts from Lightness [[mu28]], and wool moves toward ultra-fine, airy and ultralight constructions [[mu28]]. Future Snoops expects hyperlight wovens and technical silks [[perf]].',
     'Bleached linen, greyish mauve and royal blue.', '- Unlined blazers.\n- Fluid trousers.\n- Sheer shirts.', 'Ultralight wool, voile, technical silk.', 'Minimal, tonal.', ['Bleached linen 11-0701 TCX', 'Royal blue 18-3949 TCX', 'Greyish mauve 15-3507 TCX'], '- Tailoring, shirts, layering pieces.'),
   T('hand-made-summer', 'Handmade Summer', 'Craft in summer: raffia, straw, crochet and hand-finished linen in vegetal colour.',
     'Milano Unica\'s second principle, Enrichment, is "the rediscovery of handcrafted techniques and attention to detail" [[mu28]]. Forecut\'s palette adds straw and khaki green for natural fibres [[cf28]].',
     'Straw, khaki green, bleached linen.', '- Crochet tops.\n- Linen dresses.\n- Raffia bags.', 'Linen, raffia, cotton crochet.', 'Hand embroidery, fringing, wooden buttons.', ['Straw 14-0935 TCX', 'Khaki green 18-0525 TCX', 'Bleached linen'], '- Dresses, knits, bags.')],
 stories=[('Blue Hour', 'Royal blue, sonar turquoise, inky blue and bleached linen.'), ('Atmosphere', 'Greyish mauve and magnetic violet with peach.'), ('Vegetal', 'Straw, khaki green and warm beige.'), ('After Dusk', 'Inky blue, murky green, acid lemon.')],
 sw_s='SS28 women\'s wovens are projected to be lighter and more adaptable: technical blazers, adaptable skirts, fluid trousers and corset-line evening dresses.',
 sw='- **Technical blazer.**\n- **Adaptable skirt** (wrap, convertible length).\n- **Fluid trouser.**\n- **Corset-line slip dress.**\n- **Sheer shirt.**',
 sk_s='SS28 women\'s knits: open and sheer knits, tailored baselayers and crochet.', sk='- **Open-knit tops.**\n- **Tailored baselayer.**\n- **Crochet dress.**\n- **Fine-gauge cardigan.**',
 fw_s='SS28 women\'s wovens: hyperlight and ultrastretch wovens, technical silk, ultralight wool, linen and lace.', fw=[['Hyperlight woven', 'Barely there', 'Dresses, shirts'], ['Ultrastretch woven', 'Structured, moving', 'Blazers'], ['Technical silk', 'Fluid', 'Dresses'], ['Ultralight wool', 'Airy', 'Tailoring'], ['Linen', 'Cool', 'Everything summer']],
 fk_s='SS28 women\'s knits: open knits, fine viscose and silk blends, crochet and wellness-finished jersey.', fk=[['Open knit', 'Airy', 'Layers'], ['Silk blend', 'Smooth', 'Tanks'], ['Crochet', 'Handmade', 'Dresses'], ['Functional jersey', 'Cooling', 'Baselayers']],
 tt_s='SS28 women\'s trims: lace insets, satin piping, natural buttons, hand embroidery.', tt=[['Lace insets', 'Evening', 'Rising'], ['Satin piping', 'Slips', 'Rising'], ['Natural buttons', 'Linen', 'Core'], ['Hand embroidery', 'Dresses', 'Rising']], tm=TM,
 ti_s='Trim and detail innovations: articulated seams, modular parts, concealed breathability.', ti=TI,
 celeb_s='Expect evening and festival dressing to carry SS28 influence: dark colour with flashes, sheer layers, lace.', celeb='- Dark looks with one bright accessory.\n- Sheer over slip.\n- Personal styling over head-to-toe brand.',
 casual='- **Fluid trouser + open knit + sandals.**\n- **Linen dress + raffia bag.**', formal='- **Technical blazer + adaptable skirt.**\n- **Ultralight suit + sheer shirt.**', party='- **Inky slip dress + acid-lemon bag.**\n- **Lace top + satin skirt.**',
 craft_s='Craft for SS28 women: crochet, raffia, hand embroidery and hand-finished linen.', craft='- Crochet.\n- Raffia and straw.\n- Hand embroidery on linen.',
 mat_s='Couture materials for SS28 women: technical silk, lace, voile, raffia and fine linen.', mat='- Technical silk.\n- Lace.\n- Voile.\n- Raffia.',
 opp_s='Projected growth for SS28 women: evening-after-dark dressing, adaptable tailoring, light layers and handmade summer pieces.', opp='1. After-dusk eveningwear.\n2. Technical and adaptable tailoring.\n3. Sheer layers.\n4. Crochet and raffia.\n5. Linen dresses.',
 ass=[['Core (about half)', 'Linen, shirts, tailoring in bleached linen, straw, inky blue'], ['Seasonal (about a third)', 'Royal blue, mauve, after-dusk dresses'], ['Statement (the rest)', 'Lace, corsetry, crochet']], pricing='- Full price on technical tailoring and craft.\n- Value on linen basics.',
 mi_s='Material innovations for SS28 women: translucent membranes, hyperlight wovens, technical silks, temperature-adaptive finishes.', mi=[['Hyperlight wovens', 'Ready'], ['Technical silk', 'Ready'], ['Temperature-adaptive finishes', 'Early; verify'], ['Ultralight wool', 'Ready']],
 dpi_s='Design and production for SS28: modular construction, product data under the EU passport timeline, development booked around the January 2027 fairs.', dpi='- Modular and articulated construction.\n- Fibre and origin data per style.\n- Sample at the fairs; confirm after the shows.')

M = dict(W, label='menswear', pal=['Inky blue', 'Khaki green', 'Deep sky', 'Sonar turquoise', 'Straw', 'Bleached linen'],
 col_s='SS28 menswear colour is projected to centre on inky blue and khaki green tailoring, deeper sky-blue shirting and sonar turquoise for summer pieces.',
 groups='- **Core:** inky blue, khaki green, bleached linen.\n- **Seasonal:** deep sky, sonar turquoise.\n- **Accent:** acid lemon on one piece.', byp='- Inky blue: tailoring.\n- Deep sky: shirts.\n- Turquoise: shorts, knits.\n- Khaki green: utility.',
 themes=[T('technical-ease', 'Technical Ease', 'Tailoring that moves: technical blazers, ultrastretch trousers and tailored baselayers for hot cities.',
     'Future Snoops expects performance, everyday and occasion wear to merge, with "technical blazers" and "tailored baselayers" [[perf]]. SS27 menswear was shaped by heat [[hb]].', 'Inky blue, khaki green, bleached linen.', '- Technical blazer.\n- Ultrastretch trouser.\n- Baselayer tee.', 'Ultrastretch woven, hyperlight nylon, cooling jersey.', 'Articulated seams, concealed vents.', ['Inky blue 19-3933 TCX', 'Deep sky 16-4132 TCX', 'Khaki green'], '- Suits, trousers, tees.'),
   T('after-dark', 'After Dark', 'Dark summer for men: inky blue and murky green in satin and open knits for evenings.', 'Future Snoops\' "After Dusk" brings inky blues and murky greens to summer and pairs them with sharp colour [[dusk]].', 'Inky blue, murky green, acid lemon.', '- Satin camp shirt.\n- Open-knit polo.', 'Satin, open knit.', 'Tonal piping.', ['Inky blue 19-3933 TCX', 'Acid lemon 12-0646 TCX', 'Khaki green'], '- Shirts, knits.'),
   T('crafted-linen', 'Crafted Linen', 'Handmade summer for men: hand-finished linen, crochet polos and straw accessories.', 'Milano Unica\'s Enrichment principle: "the rediscovery of handcrafted techniques" [[mu28]].', 'Straw, bleached linen, khaki green.', '- Linen suit.\n- Crochet polo.', 'Linen, cotton crochet.', 'Wooden and shell buttons.', ['Straw 14-0935 TCX', 'Bleached linen', 'Khaki green'], '- Suits, polos, hats.')],
 stories=[('Blue Hour', 'Inky blue, deep sky and turquoise.'), ('Vegetal', 'Straw, khaki green and linen.'), ('After Dark', 'Inky blue, murky green and acid lemon.')],
 sw_s='SS28 men\'s wovens: technical blazers, ultrastretch trousers, linen suits and camp shirts.', sw='- **Technical blazer.**\n- **Ultrastretch trouser.**\n- **Linen suit.**\n- **Camp shirt.**\n- **Tailored shorts.**',
 sk_s='SS28 men\'s knits: open-knit and crochet polos, cooling baselayers, fine cardigans.', sk='- **Open-knit polo.**\n- **Crochet polo.**\n- **Cooling baselayer.**\n- **Fine cardigan.**',
 casual='- **Camp shirt + tailored shorts.**\n- **Open-knit polo + linen trouser.**', formal='- **Technical suit + baselayer tee.**\n- **Linen suit + open shirt.**', party='- **Satin camp shirt + inky trousers.**',
 celeb_s='Men\'s SS28 influence: evening dressing in heat, satin shirts and dark colour with one bright accent.', celeb='- Satin shirts.\n- Dark colour with a bright accessory.',
 opp_s='Projected growth for SS28 menswear: technical tailoring, linen suits, knit polos, evening shirts.', opp='1. Technical tailoring.\n2. Linen suits.\n3. Knit and crochet polos.\n4. Satin evening shirts.\n5. Tailored shorts.',
 fw_s='SS28 men\'s wovens: ultrastretch and hyperlight wovens, linen, ultralight wool and satin.', fw=[['Ultrastretch woven', 'Moving', 'Technical tailoring'], ['Hyperlight nylon', 'Packable', 'Jackets'], ['Linen', 'Cool', 'Suits, shirts'], ['Ultralight wool', 'Airy', 'Suits'], ['Satin', 'Fluid', 'Evening shirts']],
 fk_s='SS28 men\'s knits: open knits, crochet, cooling jersey and fine merino-silk.', fk=[['Open knit', 'Airy', 'Polos'], ['Crochet', 'Handmade', 'Polos'], ['Cooling jersey', 'Fresh', 'Baselayers'], ['Merino-silk', 'Smooth', 'Cardigans']],
 tt_s='SS28 men\'s trims: shell and corozo buttons, concealed vents, articulated seams, tonal piping.', tt=[['Shell and corozo buttons', 'Shirts, suits', 'Core'], ['Concealed vents', 'Technical blazers', 'Rising'], ['Tonal piping', 'Evening shirts', 'Rising']],
 ass=[['Core (about half)', 'Shirts, trousers, polos in inky blue, linen, khaki'], ['Seasonal (about a third)', 'Technical suits, turquoise, linen suits'], ['Statement (the rest)', 'Satin and crochet']], pricing='- Full price on technical tailoring.\n- Value on polos and tees.',
 mi_s='Material innovations for SS28 men: ultrastretch and hyperlight wovens, cooling jersey, temperature-adaptive finishes.', mi=[['Ultrastretch woven', 'Ready'], ['Hyperlight nylon', 'Ready'], ['Cooling jersey', 'Ready'], ['Adaptive finishes', 'Early; verify']],
 craft_s='Craft for SS28 men: hand-finished linen, crochet, straw.', craft='- Hand-finished linen.\n- Crochet polos.\n- Straw hats.', mat_s='Couture materials for SS28 men: technical silk, fine linen, satin.', mat='- Technical silk.\n- Fine linen.\n- Satin.')

KPAL = [('Sonar turquoise', '16-5123 TCX', '#279D9F', 'Seasonal: lead'), ('Acid lemon', '12-0646 TCX', '#EBDF67', 'Accent'), ('Peach', '13-1125 TCX', '#F5B895', 'Accent'),
        ('Deep sky', '16-4132 TCX', '#6EA2D5', 'Seasonal'), ('Greyish mauve', '15-3507 TCX', '#BDABBE', 'Seasonal'), ('Bleached linen', '11-0701 TCX', '#EDE6DB', 'Core'), ('Inky blue', '19-3933 TCX', '#29304E', 'Core')]
KIDBASIS = ('Long-range projection. SS28 kidswear fairs (Pitti Bimbo and Playtime) take place in June 2027. This report projects from SS28 adult previews, the SS27 kidswear fair record and long-term drivers such as heat and UV protection, and will be updated after the fairs.')
Kd = dict(W, label='kidswear', palrows=KPAL, pal=['Sonar turquoise', 'Acid lemon', 'Peach', 'Deep sky', 'Greyish mauve', 'Bleached linen'],
 col_s='SS28 kidswear colour is projected to be bright and clear: sonar turquoise and acid lemon with peach and sky, on linen bases.', groups='- **Core:** bleached linen, inky blue.\n- **Seasonal:** sonar turquoise, deep sky, greyish mauve.\n- **Accent:** acid lemon, peach.',
 byp='- Turquoise and sky: swim and play.\n- Lemon: tees and accessories.\n- Peach and mauve: dresses and baby.',
 themes=[T('sun-smart', 'Sun Smart', 'Sun protection as design: UPF swim and tees, cooling fabrics, hats and shade-friendly layers.', 'UV-protective, breathable and quick-dry kidswear became common at Pitti Bimbo in 2026 [[fit]]; SS27 summer was shaped by heat [[hb]].', 'Turquoise, sky, linen.', '- Long-sleeve swim.\n- UV tees.\n- Sun hats.', 'UPF swim, cooling jersey.', 'Flat seams, printed UPF labels.', ['Sonar turquoise 16-5123 TCX', 'Acid lemon 12-0646 TCX', 'Deep sky, linen'], '- Swim, tees, hats.'),
   T('little-crafts', 'Little Crafts', 'Handmade summer for children: crochet, embroidery and straw, in peach and linen.', 'Milano Unica\'s SS28 "Enrichment" principle: handcrafted techniques and detail [[mu28]]; Future Snoops\' SS27 Happenstance celebrated playful, child-led design [[fs]].', 'Peach, linen, mauve.', '- Crochet tops.\n- Embroidered dresses and shirts.', 'Cotton crochet, linen.', 'Embroidery with soft backing.', ['Peach 13-1125 TCX', 'Greyish mauve', 'Bleached linen'], '- Dresses, shirts, hats.')],
 stories=[('Pool', 'Turquoise, sky, lemon.'), ('Sorbet', 'Peach, mauve, linen.'), ('Night Swim', 'Inky blue with lemon.')],
 sw_s='SS28 kidswear wovens: relaxed shorts, light dungarees, linen shirts and dresses, convertible pieces.', sw='- **Relaxed shorts.**\n- **Light dungarees.**\n- **Linen shirt.**\n- **Easy dress.**\n- **Convertible trousers.**',
 sk_s='SS28 kidswear knits: UV tees, cooling jersey sets, swim, open knits.', sk='- **UV tee.**\n- **Jersey set.**\n- **Swim.**\n- **Open-knit cardigan.**',
 fw=[['Linen and linen-cotton', 'Cool', 'Shirts, shorts'], ['Organic poplin', 'Light', 'Dresses'], ['Light denim', 'Durable', 'Dungarees'], ['Hyperlight nylon', 'Packable', 'Jackets']], fw_s='SS28 kidswear wovens: linen, organic poplin, light denim and hyperlight nylon.',
 fk=[['Organic jersey', 'Soft', 'Tees'], ['UPF swim', 'Stretch', 'Swim'], ['Cooling jersey', 'Fresh', 'Sets'], ['Cotton crochet', 'Handmade', 'Tops']], fk_s='SS28 kidswear knits: organic jersey, UPF swim and cooling jerseys.',
 tt_s='SS28 kidswear trims: flat seams, embroidery, printed UPF labels, secure snaps.', tt=[['Embroidery', 'Shirts, dresses', 'Rising'], ['Printed labels', 'All', 'Core'], ['Snaps', 'Rompers', 'Core']],
 tm=[['Build', 'Embroidery, printed labels'], ['Test', 'Crochet trims'], ['Avoid', 'Small parts, glued decoration']],
 ti_s='Kidswear innovations: UPF labelling, cooling finishes, easy closures.', ti=[['UPF labelling', 'Ready'], ['Cooling finishes', 'Early; test skin safety'], ['Easy closures', 'Ready']],
 celeb_s='Family dressing, not celebrities, shapes SS28 kidswear.', celeb='- Parent and child swim and shirts.\n- Avoid children\'s likenesses without consent.',
 casual='- **UV tee + relaxed shorts + sandals.**\n- **Jersey set + hat.**', formal='- **Linen shirt + shorts.**\n- **Embroidered dress.**', party='- **Bright printed set.**',
 craft_s='Craft for SS28 kidswear: crochet and embroidery.', craft='- Crochet.\n- Embroidery.', mat_s='Premium materials for SS28 kidswear: organic cotton, linen, recycled swim.', mat='- Organic cotton.\n- Linen.\n- Recycled swim fabric.',
 opp_s='Projected growth for SS28 kidswear: UV and swim, cooling basics, linen, coordinated sets.', opp='1. UV swim and tees.\n2. Cooling basics.\n3. Linen.\n4. Sets.\n5. Sun hats.',
 ass=[['Core', 'Tees, shorts, basics'], ['Seasonal', 'Swim, UV, linen'], ['Statement', 'Craft and party']], pricing='- Full price on UPF and organic.\n- Value on basics.',
 mi_s='Material innovations for SS28 kidswear: UPF fabrics, cooling jersey, recycled swim.', mi=[['UPF fabrics', 'Ready'], ['Cooling jersey', 'Early'], ['Recycled swim', 'Ready']],
 dpi_s='Design and production for SS28 kidswear: grade for growth, safety testing, product data for the EU passport.', dpi='- Grade for growth.\n- Safety test results recorded per style.\n- Fibre and origin data.')
B = dict(Kd, label='boyswear', themes=[Kd['themes'][0], T('court-and-pool', 'Court and Pool', 'Refined sport for boys: tennis and pool codes, piqué, mesh and turquoise.', 'Playtime Paris SS27 showed refined sport and stronger denim [[js]]; Future Snoops expects performance and everyday wear to merge [[perf]].', 'Turquoise, inky blue, linen.', '- Piqué polo.\n- Swim and court shorts.', 'Piqué, mesh, UPF swim.', 'Side stripes, rubber badges.', ['Sonar turquoise', 'Inky blue 19-3933 TCX', 'Bleached linen'], '- Polos, shorts, swim.')],
 tt=[['Side stripes', 'Shorts, polos', 'Rising'], ['Rubber badges', 'Tees', 'Rising'], ['Printed labels', 'All', 'Core']],
 pal=['Sonar turquoise', 'Deep sky', 'Acid lemon', 'Inky blue', 'Bleached linen'], col_s='SS28 boyswear colour is projected around turquoise and deep sky with acid lemon, on inky blue and linen.',
 sw='- **Court shorts.**\n- **Camp shirt.**\n- **Light cargo.**\n- **Dungaree shorts.**', sk='- **Piqué polo.**\n- **UV tee.**\n- **Swim short and rash guard.**', casual='- **Polo + court shorts + sneakers.**', formal='- **Linen shirt + tailored shorts.**', party='- **Printed camp shirt + shorts.**',
 opp_s='Projected growth for SS28 boyswear: sport polos and shorts, UV swim, linen shirts.', opp='1. Polos.\n2. Court and swim shorts.\n3. UV tees.\n4. Linen shirts.')
G = dict(Kd, label='girlswear', themes=[Kd['themes'][1], T('sorbet-dusk', 'Sorbet Dusk', 'Girls\' summer between sorbet and dusk: peach and mauve by day, inky blue with lemon for evening.', 'Future Snoops\' "After Dusk" pairs dark shades with bright flashes [[dusk]]; Forecut\'s kidswear palette adds peach and mauve [[cf28]].', 'Peach, mauve, inky blue.', '- Tiered dress.\n- Wide shorts.', 'Voile, poplin.', 'Smocking, ruffles (secured).', ['Peach 13-1125 TCX', 'Inky blue', 'Greyish mauve'], '- Dresses, sets.')],
 pal=['Peach', 'Greyish mauve', 'Sonar turquoise', 'Acid lemon', 'Bleached linen'], col_s='SS28 girlswear colour is projected around peach and greyish mauve with turquoise and lemon, on linen.',
 sw='- **Tiered dress.**\n- **Wide shorts.**\n- **Smocked top.**', sk='- **Swimsuit.**\n- **Crochet top.**\n- **Jersey dress.**', casual='- **Crochet top + wide shorts.**', formal='- **Smocked dress + sandals.**', party='- **Bright dress + hair accessory.**',
 opp_s='Projected growth for SS28 girlswear: dresses, swim, crochet, sets.', opp='1. Dresses.\n2. Swim.\n3. Crochet.\n4. Sets.')
TB = dict(Kd, label='toddler boys', themes=[T('first-sun', 'First Sun', 'Sun-safe first summers for toddler boys: UPF sun suits, hats and organic sets.', 'UV-protective kidswear became common in 2026 [[fit]]; SS27 baby collections led with organic cotton [[pbs]].', 'Sky, linen.', '- Sun suit.\n- Organic set.', 'UPF swim, organic jersey.', 'Snaps, flat seams.', ['Deep sky 16-4132 TCX', 'Acid lemon', 'Bleached linen'], '- Sun suits, sets, hats.')],
 pal=['Deep sky', 'Sonar turquoise', 'Acid lemon', 'Bleached linen'], col_s='SS28 toddler boys\' colour is projected around sky and turquoise with lemon, on linen.',
 sw='- **Short romper.**\n- **Pull-on shorts.**', sk='- **Sun suit.**\n- **Jersey set.**\n- **Sleepsuit.**', casual='- **Romper + sun hat.**', formal='- **Linen shirt romper.**', party='- **Printed romper.**',
 tt=[['Snaps', 'Rompers', 'Core'], ['Printed labels', 'All', 'Core']], opp_s='Projected growth for SS28 toddler boys: sun suits, organic sets, sleepwear.', opp='1. Sun suits.\n2. Organic sets.\n3. Sleepwear.\n4. Hats.')
TG = dict(TB, label='toddler girls', themes=[T('first-sun', 'First Sun', 'Sun-safe first summers for toddler girls: UPF swimsuits with legs, hats and organic sets.', 'UV-protective kidswear became common in 2026 [[fit]]; SS27 baby collections led with organic cotton [[pbs]].', 'Peach, linen.', '- Swimsuit with legs.\n- Organic set.', 'UPF swim, organic jersey.', 'Snaps, soft ruffles.', ['Peach 13-1125 TCX', 'Greyish mauve', 'Bleached linen'], '- Swim, sets, hats.')],
 pal=['Peach', 'Greyish mauve', 'Sonar turquoise', 'Bleached linen'], col_s='SS28 toddler girls\' colour is projected around peach and greyish mauve with turquoise, on linen.',
 sw='- **Muslin dress with bloomers.**\n- **Sun suit.**', casual='- **Muslin dress + sun hat.**', formal='- **Smocked dress.**', party='- **Soft printed dress (no small parts).**',
 opp_s='Projected growth for SS28 toddler girls: swim, muslin dresses, organic sets.', opp='1. Swim.\n2. Muslin dresses.\n3. Organic sets.\n4. Hats.')

for aud, c in [('women', W), ('men', M)]:
    build_audience(s, aud, genD(c, EVA), E)
s.basis = KIDBASIS
for aud, c in [('kids', Kd), ('boys', B), ('girls', G), ('toddler-boys', TB), ('toddler-girls', TG)]:
    build_audience(s, aud, genD(c, EVK, kids=True), E)
s.write()
