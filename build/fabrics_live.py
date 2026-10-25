"""Live fabric forecast content for fabrics.html (Oct 2026 rebuild): runway fabric watch, mill & fair radar,
innovation radar, India signals, news and forecast-led articles. Facts are summarised from the linked sources;
'Forecut read' lines are Forecut's own forecast view. Add new items at the top; never delete old ones."""

UPDATED = '25 Oct 2026'

LIVE = [  # ticker under the hero: (label, text, link)
    ('Live now', 'Lakmē Fashion Week, New Delhi, 13–18 Oct 2026: Ladakh pashmina showcase on 18 Oct', '#india'),
    ('Just in', 'Paris SS27 closed on featherlight, see-through fabrics', '#runway'),
    ('Next', 'AW27 runways, Feb–Mar 2027: Forecut will update the AW27 fabric forecast', '#forecast'),
]

TITLE = 'Fabric forecast: the materials shaping the next seasons'
LEAD = ('Live fabric intelligence from runways, mills and markets. Forecut tracks more than 110 fabric and material trends '
        'across five seasons, from emerging to fading, and reads every fashion week and fabric fair for what it means for '
        'brands, designers and buyers in every region.')
SEO = ('Fabric Trends Forecast SS27–AW28: Runway Fabrics, Mill Innovations & India | Forecut',
       'Live fabric trend forecast: what is emerging, rising, peaking and fading from SS27 to AW28, runway fabric reports from '
       'New York, London, Milan, Paris and India, mill and fabric-fair signals and textile innovations.')
HERO = ['hub-fabrics-live', 'hub-fabrics', 'sheer-organza-overlays-ss27-photo', 'handspun-khadi']

# Runway fabric watch, SS27 shows (Sept–Oct 2026) + India
RUNWAY = [
 {'city': 'Paris', 'dates': '29 Sep – 6 Oct 2026', 'status': 'SS27', 'img': ['hub-fabrics-runway-paris', 'sheer-organza-blouses-ss27-photo'],
  'head': 'Featherlight and see-through',
  'fabrics': ['Ultrafine ripstop nylon coats that billow like parachutes (Issey Miyake)', 'Sheer organza sets and tweed suits (Chanel)',
              'Sheer fabrics with soft tailoring (Dior)', 'Broderie anglaise on white (Chloé)', 'Gold surfaces on trenches and blazers (Saint Laurent)',
              'Crepe, voile and fine knits built to feel weightless'],
  'read': 'Lightness is the season\'s headline. Expect voile, organza, crepe and fine-gauge knits to lead SS27 premium ranges; for India, this suits summer occasion wear and lighter festive layers.',
  'src': [('Monocle', 'https://monocle.com/fashion/paris-fashion-week-october-2026-review/'), ('Forbes', 'https://www.forbes.com/sites/laiafarrangraves/2026/10/08/paris-fashion-week-springsummer-2027-key-trends-to-know/'), ('C2 Fashion Studio', 'https://c2fashionstudio.com/paris-fashion-week-spring-summer-2027/')]},
 {'city': 'Milan', 'dates': '23 – 29 Sep 2026', 'status': 'SS27', 'img': ['hub-fabrics-runway-milan', 'satin-slip-skirts-ss27-photo'],
  'head': 'Sheer, glossy and layered',
  'fabrics': ['Liquid, latex-effect rubber and weightless silk (Ferragamo)', 'Glossy nylon shirting (MSGM) and a PVC suit (Ferragamo)',
              'Oversized organza and nude tulle with raised roses (Moschino, Blumarine)', 'Long crochet knit dresses (Marco Rambaldi, Fendi)',
              'Intrecciato weave, crinkled nylon and taffeta (Bottega Veneta)', 'Checks, stripes and tartan in buttery tones (Prada, Marni, Gucci)'],
  'read': 'Gloss returns next to sheer: coated and lacquered surfaces, crinkle nylon and taffeta. Watch coated cottons and glossy technical shirting as the commercial version.',
  'src': [('nss magazine', 'https://www.nssmag.com/en/fashion/47050/5-trends-from-milan-fashion-week-ss27-women-s'), ('FashionUnited', 'https://fashionunited.com/news/fashion/milan-fashion-week-ss27-a-comprehensive-overview-of-collections-and-events/2026092874871')]},
 {'city': 'London', 'dates': '18 – 22 Sep 2026', 'status': 'SS27', 'img': ['hub-fabrics-runway-london', 'lace-trimmed-slips-over-knits-ss27-photo'],
  'head': 'Organza flowers and loose threads',
  'fabrics': ['Floral appliqué on powder-blue organza (Burberry)', 'Acid florals on reflective organza; jacquard blooms fading into sheer (Alexander McQueen)',
              '3D flowers made from recycled plastic on a sheer gown (Vin + Omi)', 'Hand-cut, layered silk, cotton and gauze (Dreaming Eli)',
              'Torn lace and sliced denim (KNWLS)', 'Lace bodies and camisoles (Marks & Spencer, first LFW show)'],
  'read': 'Surface decoration moves onto sheer bases. Appliqué and raw, frayed edges are the craft story; Indian embroidery houses are well placed to supply it.',
  'src': [('TheIndustry.fashion', 'https://www.theindustry.fashion/fringe-florals-and-acid-green-7-trends-from-london-fashion-week-ss27/')]},
 {'city': 'New York', 'dates': '10 – 15 Sep 2026', 'status': 'SS27', 'img': ['hub-fabrics-runway-newyork', 'sheer-sleeve-dresses-ss27-photo'],
  'head': 'Sheer skirts, silk and light knits',
  'fabrics': ['See-through skirts with covered-up tops (Calvin Klein, Eckhaus Latta, Brandon Maxwell, Thom Browne)', 'Head-to-toe sheer separates (Prabal Gurung, Aknvas, Vettese)',
              'Silk shirts and light knits tied at the waist (Cult Gaia, Tibi)', 'Long, skinny fringe and silk scarves', 'Luminous Blue and marigold as the leading colours'],
  'read': 'Sheer is commercial in New York: expect it as skirts and overlays over opaque layers, the version most Indian retail can sell.',
  'src': [('Fashionista', 'https://fashionista.com/2026/09/new-york-fashion-week-spring-2027-trends')]},
 {'city': 'India', 'dates': 'Lakmē Fashion Week, 13 – 18 Oct 2026', 'status': 'Live', 'img': ['hub-fabrics-runway-india', 'handspun-khadi', 'pastel-handloom-sarees'],
  'head': 'Pashmina, natural fibres and craft',
  'fabrics': ['Ladakhi pashmina and Himalayan wool, hand-woven by women-led enterprises Changra Ladakh and Charkha Ladakh ("The Fifth Season", 18 Oct)',
              'Natural, functional fabrics (Countrymade)', 'Textile traditions in contemporary shapes (PRAMA by Pratima Pandey)',
              'Circular Design Challenge with UN in India (13 Oct)', 'Indian craft, structure and surface in the grand finale (Amit Aggarwal)'],
  'read': 'Provenance fibres (pashmina, khadi, handloom) are India\'s strongest fabric story for Festive 26 and AW27. Forecut will update this card when the week ends.',
  'src': [('Elle India', 'https://elle.in/fashion/lakm%C4%93-fashion-week-is-back-in-delhi-heres-what-to-watch-12613121'), ('Eastern Herald', 'https://easternherald.com/2026/10/13/the-department-of-industries-commerce-ut-ladakh-presents-the-fifth-season-a-fashion-story-from-ladakh-at-lakme-fashion-week-in-partnership-with-fashion-design-council-of-india-f/')]},
 {'city': 'Menswear', 'dates': 'Pitti Uomo 110, June 2026', 'status': 'SS27', 'img': ['hub-fabrics-runway-menswear', 'linen-and-seersucker-shirts-photo', 'seersucker-trousers-photo'],
  'head': 'Tactile, checked and patched',
  'fabrics': ['Richly textured, touchable surfaces', 'Tattersall, madras and glen plaid checks', 'Jacquard and marled wool knits',
              'Suede, canvas and denim with patchwork and sashiko stitching'],
  'read': 'Menswear SS27 sells texture: seersucker, slub linen, waffle and jacquard knits. Checks return to shirting.',
  'src': [('FashionUnited', 'https://fashionunited.com/news/fashion/menswear-ss27-the-soft-masculinity-trend-and-key-item-predictions/2026061372825')]},
]

# Mill and fabric-fair radar (newest first). (date, fair, season shown, signals, Forecut read, sources)
FAIRS = [
 ('Sep 2026', 'Première Vision Paris', 'AW27-28', ['"Living Matter": materials as living, irregular surfaces', 'Time and memory; organic "wild" materiality', 'Nuanced neutrals and cool tones'],
  'Slubs, crinkles and uneven dyes move from niche to core for AW27.', [('Première Vision', 'https://paris.premierevision.com/en/content/details-de-la-saison-ah-27-28-pv-paris-septembre-2026')]),
 ('Aug 2026', 'Intertextile Shanghai Apparel Fabrics', 'Sourcing', ['Elastane-free natural stretch in wool, cashmere and mohair (Trabaldo Togna)', 'Waterless finishing and low-impact indigo denim (Kipaş Denim)', 'India Pavilion: GOTS organic cotton, Lenzing fibres, bamboo and silk'],
  'Natural stretch without elastane is the innovation to sample for premium tailoring.', [('Textile World', 'https://www.textileworld.com/textile-world/knitting-apparel/2026/08/global-sourcing-re-imagined-as-intertextile-apparel-champions-sustainability-craftsmanship-and-digitalization/')]),
 ('Jul 2026', 'Milano Unica 43', 'AW27-28', ['"Singular – Plural": Comforting Comfort, Delicacy, Big Blur, Colour Vibe', 'First Hemp Lab with a pilot long-fibre hemp collection', 'Fabrics with 70% plant-based LYCRA® fibre from Milior, Brugnoli and others'],
  'Comfort and blur point to brushed, soft-focus surfaces for AW27; bio-based stretch becomes an easy swap for mills.', [('Alliance for European Flax-Linen & Hemp', 'https://allianceflaxlinenhemp.eu/en/european-flax-linen-hemp-news/news-archive/milano-unica-2026-european-flax-linen-hemp-innovations'), ('LYCRA', 'https://www.lycra.com/en/business/events/milano-unica')]),
 ('May 2026', 'Première Vision Denim', 'AW27-28', ['Historical archives: velvets, satins, upholstery jacquards', 'Elevated core: denim codes in tailoring, trompe-l\'oeil prints', 'Cultural denim and regenerative cotton'],
  'Denim tailoring and printed-denim illusions are the commercial bridge.', [('Première Vision', 'https://www.premierevision.com/articles/5bc3727d-1f3e-f111-8ef3-000d3a4af15b/denim-innovation-for-autumn-winter-27-28')]),
 ('Jan 2026', 'Milano Unica 42', 'SS27', ['Three themes: Natural, Shadow and Sun', 'Viscose georgette, linen and cotton twill, linen terry, washed denim', 'Luminous jacquards, lacquered leather-effect fabrics, iridescent compact jerseys'],
  'Confirms SS27: raw natural fibres for day, reflective and lacquered finishes for evening.', [('FashionUnited', 'https://fashionunited.com/news/fashion/spring-summer-2027-trends-seen-at-milano-unica/2026012770255')]),
]

# Innovation radar: (name, what it is, stage, horizon, source or None)
STAGES = ['Runway concept', 'Pilot', 'Early commercial', 'Scaling', 'Mainstream']
RADAR = [
 ('Plant-based stretch', 'Spandex with 70% plant-based content as a drop-in replacement; up to 45% lower carbon footprint in a 2026 LCA.', 'Early commercial', '2027', ('LYCRA', 'https://www.lycra.com/en/business/events/milano-unica')),
 ('Water resistance in the yarn', 'Fluorine-free water repellence built into the fibre rather than a topical finish (Unifi Resist2O Pro).', 'Early commercial', '2027', ('Innovation in Textiles', 'https://innovationintextiles.com/unifi-moves-water-resistance-into-the-yarn')),
 ('Elastane-free natural stretch', 'Wool, cashmere and mohair fabrics that stretch through yarn and weave, with no elastane.', 'Early commercial', '2027–28', ('Textile World', 'https://www.textileworld.com/textile-world/knitting-apparel/2026/08/global-sourcing-re-imagined-as-intertextile-apparel-champions-sustainability-craftsmanship-and-digitalization/')),
 ('Waterless denim finishing', 'Low-water washing and low-impact indigo dyeing for denim.', 'Scaling', 'Now', ('Textile World', 'https://www.textileworld.com/textile-world/knitting-apparel/2026/08/global-sourcing-re-imagined-as-intertextile-apparel-champions-sustainability-craftsmanship-and-digitalization/')),
 ('Fibre traceability', 'Digital platforms that trace fibre from farm to garment (e.g. TextileGenesis for certified linen).', 'Scaling', 'Now', ('Alliance for European Flax-Linen & Hemp', 'https://allianceflaxlinenhemp.eu/en/european-flax-linen-hemp-news/news-archive/milano-unica-2026-european-flax-linen-hemp-innovations')),
 ('Long-fibre European hemp', 'A pilot long-fibre hemp collection from the Hemp4Circularity project, shown at the first Hemp Lab.', 'Pilot', '2028+', ('Alliance for European Flax-Linen & Hemp', 'https://allianceflaxlinenhemp.eu/en/european-flax-linen-hemp-news/news-archive/milano-unica-2026-european-flax-linen-hemp-innovations')),
 ('Biodegradable biopolyester', 'Polyester-like fibres designed to biodegrade or be chemically recycled (Techtextil 2026 award).', 'Pilot', '2028', ('Textile World', 'https://www.textileworld.com/textile-world/2026/04/innovation-as-the-answer-techtextil-and-texprocess-frankfurt-honour-solutions-to-global-challenges-with-the-2026-innovation-awards/')),
 ('Mono-material thread', 'Cellulose sewing and embroidery thread so the whole garment can be recycled as one material.', 'Early commercial', '2027–28', ('Textile World', 'https://www.textileworld.com/textile-world/2026/04/innovation-as-the-answer-techtextil-and-texprocess-frankfurt-honour-solutions-to-global-challenges-with-the-2026-innovation-awards/')),
 ('Recycled-plastic embellishment', 'Three-dimensional flowers made from recycled plastic on sheer fabric, seen on the London runway (Vin + Omi).', 'Runway concept', '2027 capsules', ('TheIndustry.fashion', 'https://www.theindustry.fashion/fringe-florals-and-acid-green-7-trends-from-london-fashion-week-ss27/')),
]

# India fabric signals (Forecut read + evidence)
INDIA = [
 ('Pashmina & Himalayan wool', 'Rising', 'Festive 26 → AW27', 'Lakmē Fashion Week\'s Ladakh showcase puts hand-woven pashmina and Himalayan wool on the national runway. Expect it in luxury shawls, jackets and winter wedding layers.'),
 ('Organza & tissue', 'Peaking', 'Festive 26', 'Light organza lehengas and tissue sarees lead occasion wear, in line with the global featherlight mood from Paris.'),
 ('Handloom as quiet luxury', 'Rising', 'Summer 27', 'Khadi, Maheshwari and Chanderi sold on provenance, mirroring the natural, raw fabrics of Milano Unica\'s "Natural" theme.'),
 ('Seersucker & slub linen', 'Rising', 'Summer 27', 'Forecut\'s data shows seersucker and linen rising across shirts, suits and dresses for SS27; ideal for Indian heat.'),
 ('Sheer layers over opaque', 'Emerging', 'Summer 27', 'Sheer overlays and skirts worn over linings: the wearable route to the runway sheer trend for Indian retail.'),
 ('Glossy technical cottons', 'Emerging', 'AW27', 'Coated and lacquered finishes from Milan and Milano Unica, translated into easy-care commuter fabrics.'),
]

NEWS = [
 ('October 2026', 'Functional Fabric Fair Portland puts bio-based materials first', 'The fall edition runs 26–28 October 2026 at the Oregon Convention Center, focused on bio-based materials for Fall/Winter 2027/28. A new Cellulose Forum covers hemp, linen, nettle, lyocell, modal and viscose, alongside Wool and Cotton forums; more than 340 sustainability-certified suppliers exhibit, 68 of them for the first time. Forecut read: supports our rising stages for lyocell, closed-loop fibres and European hemp in AW27.',
  [('Fibre2Fashion', 'https://www.fibre2fashion.com/news/textile-fairs-news/functional-fabric-fair-2026-spotlights-bio-based-materials-in-portland-314238-newsdetails.htm')]),
 ('October 2026', 'Pakistan cotton arrivals up 7.5% year on year', 'About 4.08 million bales had reached ginneries by 15 October 2026, 7.53% more than a year earlier (Pakistan Cotton Ginners Association). Sindh supplied 55% of arrivals and Punjab 40%; textile mills bought 86.7% of arrivals. Forecut read: steadier South Asian cotton supply helps price stability for cotton shirting, denim and kurta fabrics in SS27.',
  [('ProPakistani', 'https://propakistani.pk/2026/10/19/sindh-stays-ahead-as-cotton-production-crosses-4-million-bales')]),
 ('October 2026', 'Lakmē Fashion Week returns to Delhi with a Ladakh pashmina showcase', 'Lakmē Fashion Week in partnership with FDCI runs 13–18 October 2026 at Taj Palace, New Delhi. On 18 October, "The Fifth Season: A Fashion Story from Ladakh" presents hand-woven Ladakhi pashmina and Himalayan wool from women-led enterprises Changra Ladakh and Charkha Ladakh.',
  [('Elle India', 'https://elle.in/fashion/lakm%C4%93-fashion-week-is-back-in-delhi-heres-what-to-watch-12613121'), ('Eastern Herald', 'https://easternherald.com/2026/10/13/the-department-of-industries-commerce-ut-ladakh-presents-the-fifth-season-a-fashion-story-from-ladakh-at-lakme-fashion-week-in-partnership-with-fashion-design-council-of-india-f/')]),
 ('October 2026', 'Paris SS27 closes on featherlight fabrics', 'Paris Fashion Week ended on 6 October with lightness as its common thread: ultrafine ripstop nylon at Issey Miyake, sheer organza sets at Chanel and translucent, weightless pieces across the shows.',
  [('Monocle', 'https://monocle.com/fashion/paris-fashion-week-october-2026-review/')]),
 ('September 2026', 'Milan SS27: sheer fabrics meet plastic and gloss', 'Milan paired sheer silk, organza and tulle with latex-effect rubber, glossy nylon and PVC, and layered taffeta, crinkled nylon and intrecciato weaves.',
  [('nss magazine', 'https://www.nssmag.com/en/fashion/47050/5-trends-from-milan-fashion-week-ss27-women-s')]),
 ('August 2026', 'Intertextile Shanghai: natural stretch and waterless denim', 'The autumn fair (25–27 August) showed elastane-free stretch wool, cashmere and mohair, waterless denim finishing and an India Pavilion with organic cotton, Lenzing fibres, bamboo and silk.',
  [('Textile World', 'https://www.textileworld.com/textile-world/knitting-apparel/2026/08/global-sourcing-re-imagined-as-intertextile-apparel-champions-sustainability-craftsmanship-and-digitalization/')]),
 ('July 2026', 'Milano Unica: plant-based stretch and the first Hemp Lab', 'At Milano Unica (7–9 July, AW27-28), European mills showed fabrics made with 70% plant-based LYCRA® fibre, and the flax-linen and hemp alliance launched a Hemp Lab with a pilot long-fibre hemp collection.',
  [('LYCRA', 'https://www.lycra.com/en/business/events/milano-unica'), ('Alliance for European Flax-Linen & Hemp', 'https://allianceflaxlinenhemp.eu/en/european-flax-linen-hemp-news/news-archive/milano-unica-2026-european-flax-linen-hemp-innovations')]),
]

EXTRA_IMGS = ['hub-fabrics-live'] + [x['img'][0] for x in RUNWAY]


def _src(pairs):
    return 'Sources: ' + ', '.join(f'<a href="{u}" rel="noopener" target="_blank">{n}</a>' for n, u in pairs) + '.'


ARTICLES = [
 {'slug': 'fabrics-ss27-runway-fabric-report', 'tag': 'Runway fabrics', 'read': 6, 'img': ['hub-fabrics-art-runway', 'sheer-organza-overlays-ss27-photo'],
  'title': 'SS27 runway fabric report: what New York, London, Milan and Paris were made of',
  'desc': 'The fabrics behind the SS27 shows, city by city, and Forecut\'s read on which ones will reach Indian stores.',
  'body': [
   ('p', 'The Spring/Summer 2027 shows ran from New York in mid-September to Paris on 6 October 2026. Across all four cities one idea kept returning: fabric that feels lighter than air. Here is what the runways were made of, and what it means for the season ahead.'),
   ('h2', 'New York: sheer goes commercial'),
   ('p', 'New York showed see-through skirts paired with covered-up tops at Calvin Klein, Eckhaus Latta, Brandon Maxwell and Thom Browne, and head-to-toe sheer at Prabal Gurung and Vettese. Silk shirts and light knits were tied low at the waist. Luminous Blue, the 2027 colour of the year, and marigold led the palette.'),
   ('h2', 'London: organza as a canvas'),
   ('p', 'London decorated sheer bases. Burberry placed floral appliqué on powder-blue organza, Alexander McQueen printed acid florals on reflective organza, and Vin + Omi built a gown of 3D flowers made from recycled plastic. Frayed, hand-cut layers of silk, cotton and gauze (Dreaming Eli) and torn lace (KNWLS) gave the craft story a raw edge.'),
   ('h2', 'Milan: sheer meets gloss'),
   ('p', 'Milan added shine. Ferragamo showed liquid, latex-effect rubber and a PVC suit, MSGM a glossy nylon shirt, Bottega Veneta crinkled nylon and taffeta with its intrecciato weave. Organza, tulle and long crochet knit dresses kept the romantic side alive.'),
   ('h2', 'Paris: the featherlight finale'),
   ('p', 'Paris made lightness the headline: ultrafine ripstop nylon coats at Issey Miyake, sheer organza sets at Chanel, soft tailoring in sheer fabrics at Dior and broderie anglaise at Chloé. Crepe, voile and fine knits were cut to feel weightless.'),
   ('h2', 'Forecut read: what reaches stores'),
   ('ul', ['<b>Sheer over opaque</b>: overlays, skirts and sleeves on lined garments. The most sellable version of the trend.',
           '<b>Organza and voile</b> for summer occasion wear and lighter festive layers in India.',
           '<b>Glossy technical cottons</b> and crinkle nylon as the everyday version of Milan\'s gloss.',
           '<b>Appliqué and raw edges</b> on sheer bases, a natural fit for Indian embroidery units.']),
   ('p', 'See every fabric trend\'s lifecycle in the <a href="fabrics.html#forecast">Forecut fabric forecast</a>.'),
   ('p', _src([('Fashionista', 'https://fashionista.com/2026/09/new-york-fashion-week-spring-2027-trends'), ('TheIndustry.fashion', 'https://www.theindustry.fashion/fringe-florals-and-acid-green-7-trends-from-london-fashion-week-ss27/'), ('nss magazine', 'https://www.nssmag.com/en/fashion/47050/5-trends-from-milan-fashion-week-ss27-women-s'), ('Monocle', 'https://monocle.com/fashion/paris-fashion-week-october-2026-review/'), ('Forbes', 'https://www.forbes.com/sites/laiafarrangraves/2026/10/08/paris-fashion-week-springsummer-2027-key-trends-to-know/')])),
  ]},
 {'slug': 'fabrics-paris-ss27-featherlight', 'tag': 'Paris Fashion Week', 'read': 4, 'img': ['hub-fabrics-art-paris', 'sheer-organza-blouses-ss27-photo'],
  'title': 'Paris SS27: the featherlight season',
  'desc': 'Ripstop nylon, organza, voile and crepe: how Paris made weightlessness the fabric story of Spring/Summer 2027.',
  'body': [
   ('p', 'Monocle summed up Paris Fashion Week, which closed on 6 October 2026, as a week of "ethereal looks and featherlight fabrics". After seasons of heavy heritage, designers cleared the slate with airy, almost see-through materials in pastels and neutrals.'),
   ('h2', 'The fabrics'),
   ('ul', ['<b>Ultrafine ripstop nylon</b>: Issey Miyake\'s coats ballooned behind the models like parachutes.',
           '<b>Organza</b>: sheer organza sets at Chanel under Matthieu Blazy, alongside tweed suits revisited in new finishes.',
           '<b>Sheer fabrics with soft tailoring</b>: Dior under Jonathan Anderson, with bar jackets and full skirts in new finishes.',
           '<b>Broderie anglaise</b>: Chloé\'s mostly white, "less is more" collection.',
           '<b>Crepe, voile and fine knits</b>: C2 Fashion Studio names "weightless construction" as a key Paris direction, with tangerine in matte cotton, satin and translucent fabrics.']),
   ('h2', 'Forecut read'),
   ('p', 'Weightless fabrics travel well into India\'s climate. For SS27, Forecut expects voile and fine cotton for day, organza and crepe for occasion, and fine-gauge knits as layering pieces. The commercial risk is transparency: line or layer sheer pieces so they work for everyday wear.'),
   ('p', _src([('Monocle', 'https://monocle.com/fashion/paris-fashion-week-october-2026-review/'), ('Forbes', 'https://www.forbes.com/sites/laiafarrangraves/2026/10/08/paris-fashion-week-springsummer-2027-key-trends-to-know/'), ('C2 Fashion Studio', 'https://c2fashionstudio.com/paris-fashion-week-spring-summer-2027/')])),
  ]},
 {'slug': 'fabrics-milan-ss27-sheer-gloss', 'tag': 'Milan Fashion Week', 'read': 4, 'img': ['hub-fabrics-art-milan', 'satin-slip-skirts-ss27-photo'],
  'title': 'Milan SS27: sheer, glossy and layered',
  'desc': 'Latex-effect rubber, glossy nylon, taffeta and crochet: the materials of Milan\'s SS27 shows.',
  'body': [
   ('p', 'Milan Fashion Week SS27 (September 2026) took the sheer story and added shine and volume. nss magazine named "sheer fabrics and plastic materials" and "layer upon layer" among the week\'s five key trends.'),
   ('h2', 'Sheer and plastic'),
   ('ul', ['Ferragamo: semi-transparent, liquid-look latex-effect rubber, a weightless silk shirt and balloon trousers, and a pale blue PVC suit.',
           'MSGM: an electric blue glossy nylon shirt.', 'Moschino: an oversized organza blouse; Blumarine: a nude tulle dress with raised roses.',
           'Marco Rambaldi and Fendi: long, romantic crochet knit dresses.']),
   ('h2', 'Layered textures'),
   ('p', 'Bottega Veneta layered its multicoloured intrecciato weave with crinkled nylon trousers and a long black taffeta dress. Jil Sander showed a yellow taffeta petal dress. Prada, Marni and Gucci brought back checks, stripes and tartan in buttery, vintage tones.'),
   ('h2', 'Forecut read'),
   ('p', 'Gloss is the new partner to sheer. Expect lacquered and coated finishes, crinkle nylon and taffeta in SS27 eveningwear and outerwear, and checks to return in shirting. Milano Unica\'s SS27 "Shadow" theme, with lacquered leather-effect fabrics and luminous jacquards, backs this up at mill level.'),
   ('p', _src([('nss magazine', 'https://www.nssmag.com/en/fashion/47050/5-trends-from-milan-fashion-week-ss27-women-s'), ('FashionUnited', 'https://fashionunited.com/news/fashion/spring-summer-2027-trends-seen-at-milano-unica/2026012770255')])),
  ]},
 {'slug': 'fabrics-lakme-delhi-2026-textiles', 'tag': 'India fashion week', 'read': 4, 'img': ['hub-fabrics-art-lakme', 'handspun-khadi'],
  'title': 'Lakmē Fashion Week Delhi 2026: the textiles to watch',
  'desc': 'Ladakhi pashmina, natural fabrics and circular design: what to watch at Lakmē Fashion Week, 13–18 October 2026.',
  'body': [
   ('p', 'Lakmē Fashion Week, in partnership with the Fashion Design Council of India (FDCI), is back in New Delhi from 13 to 18 October 2026, with the main schedule at Taj Palace. This is a live story: Forecut will update it when the week closes.'),
   ('h2', 'Ladakh: pashmina on the runway'),
   ('p', 'On 18 October, the Department of Industries & Commerce, UT Ladakh, presents "The Fifth Season: A Fashion Story from Ladakh". It features hand-woven Ladakhi pashmina and Himalayan woollen textiles from women-led enterprises Changra Ladakh and Charkha Ladakh, with designers Stanzin Palmo (Zilzom) and Padma Yangchan (Namza Couture), and indigenous crafts named Nambu, Challi and Thigma.'),
   ('h2', 'Natural fabrics and craft'),
   ('ul', ['The Circular Design Challenge with UN in India opens the week on 13 October.', 'Countrymade focuses on natural fabrics, function and sustainability.',
           'PRAMA by Pratima Pandey combines textile traditions with contemporary shapes.', 'Amit Aggarwal closes the week, known for structure, surface and Indian craft.']),
   ('h2', 'Forecut read'),
   ('p', 'Provenance fibres are India\'s strongest fabric story into AW27: pashmina, Himalayan wool, khadi and handloom sold on origin and maker. Brands should plan shawls, jackets and wedding layers that name the fibre and the region.'),
   ('p', _src([('Elle India', 'https://elle.in/fashion/lakm%C4%93-fashion-week-is-back-in-delhi-heres-what-to-watch-12613121'), ('Eastern Herald', 'https://easternherald.com/2026/10/13/the-department-of-industries-commerce-ut-ladakh-presents-the-fifth-season-a-fashion-story-from-ladakh-at-lakme-fashion-week-in-partnership-with-fashion-design-council-of-india-f/')])),
  ]},
 {'slug': 'fabrics-mill-report-aw27-28', 'tag': 'Mill report', 'read': 5, 'img': ['hub-fabrics-art-mill', 'brushed-wool-cashmere-coats-ss27-photo'],
  'title': 'Mill report AW27-28: what the fabric fairs are signalling',
  'desc': 'Milano Unica, Intertextile Shanghai and Première Vision point to soft-focus surfaces, natural stretch and bio-based fibres.',
  'body': [
   ('p', 'Fabric fairs show materials a year or more before they reach stores. The summer 2026 fairs set out the fabric story for Autumn/Winter 2027-28.'),
   ('h2', 'Milano Unica (7–9 July 2026)'),
   ('p', 'The season was framed as "Singular – Plural", with four themes: Comforting Comfort, Delicacy, Big Blur and Colour Vibe. The flax-linen and hemp alliance opened a first Hemp Lab with a pilot long-fibre hemp collection, and mills including Milior and Brugnoli showed fabrics with LYCRA® fibre made with 70% plant-based content.'),
   ('h2', 'Intertextile Shanghai (25–27 August 2026)'),
   ('p', 'Highlights included elastane-free stretch fabrics in wool, cashmere and mohair (Trabaldo Togna), waterless finishing and low-impact indigo (Kipaş Denim), and an India Pavilion showing GOTS organic cotton, Lenzing fibres, bamboo and silk.'),
   ('h2', 'Première Vision Paris (September 2026)'),
   ('p', 'Première Vision built AW27-28 around "Living Matter": irregular, organic surfaces, time and memory, and nuanced neutrals with cool tones.'),
   ('h2', 'Forecut read'),
   ('ul', ['<b>Soft-focus surfaces</b>: brushed, blurred and hazy textures for AW27 knits and coats.', '<b>Natural stretch</b>: comfort without elastane in premium tailoring.',
           '<b>Bio-based stretch</b>: an easy, low-risk sustainability upgrade for knit and denim ranges.', '<b>Irregular finishes</b>: slubs, crinkles and uneven dyes move into core ranges.']),
   ('p', _src([('Alliance for European Flax-Linen & Hemp', 'https://allianceflaxlinenhemp.eu/en/european-flax-linen-hemp-news/news-archive/milano-unica-2026-european-flax-linen-hemp-innovations'), ('LYCRA', 'https://www.lycra.com/en/business/events/milano-unica'), ('Textile World', 'https://www.textileworld.com/textile-world/knitting-apparel/2026/08/global-sourcing-re-imagined-as-intertextile-apparel-champions-sustainability-craftsmanship-and-digitalization/'), ('Première Vision', 'https://paris.premierevision.com/en/content/details-de-la-saison-ah-27-28-pv-paris-septembre-2026')])),
  ]},
]


# ---------------- Innovation reports (one full report per radar row) ----------------
def _islug(x): return ''.join(ch.lower() if ch.isalnum() else '-' for ch in x).strip('-').replace('--', '-').replace('--', '-')


_TW = ('Textile World', 'https://www.textileworld.com/textile-world/2026/04/innovation-as-the-answer-techtextil-and-texprocess-frankfurt-honour-solutions-to-global-challenges-with-the-2026-innovation-awards/')
_TWI = ('Textile World', 'https://www.textileworld.com/textile-world/knitting-apparel/2026/08/global-sourcing-re-imagined-as-intertextile-apparel-champions-sustainability-craftsmanship-and-digitalization/')
_ALL = ('Alliance for European Flax-Linen & Hemp', 'https://allianceflaxlinenhemp.eu/en/european-flax-linen-hemp-news/news-archive/milano-unica-2026-european-flax-linen-hemp-innovations')


def _rep(key, slug, title, desc, what, seen, how, means, act, srcs, read=5):
    stage, horizon = next((r[2], r[3]) for r in RADAR if r[0] == key)
    return {'slug': slug, 'tag': 'Innovation report', 'read': read, 'img': [f'hub-fabrics-inn-{_islug(key)}'], 'radar': key,
            'title': title, 'desc': desc,
            'body': [('p', what), ('cta', f'<b>Forecut radar:</b> {stage} · expected in stores {horizon}. <a href="fabrics.html#innovations">See the full innovation radar →</a>'),
                     ('h2', 'Where it was seen'), ('p', seen), ('h2', 'How it works'), ('p', how),
                     ('h2', 'What it means for Indian brands'), ('p', means), ('h2', 'What to do now'), ('ul', act),
                     ('p', _src(srcs))]}


INNOV_REPORTS = [
 _rep('Plant-based stretch', 'innovation-plant-based-stretch', 'Plant-based stretch: the easy sustainability swap for spandex',
      'Stretch fibre with 70% plant-based content, a drop-in for mills and up to 45% lower footprint. Forecut\'s innovation report.',
      'Almost every jean, legging, shirt and swimsuit with "comfort stretch" relies on spandex (elastane), traditionally made from fossil feedstock. A renewable version of LYCRA® fibre replaces 70% of that content with a plant-based ingredient, made from field corn grown in the US Midwest.',
      'At Milano Unica (7–9 July 2026, Fiera Milano Rho), European mills showed ready-to-wear and swimwear fabrics made with the fibre: Milior (wovens), Brugnoli and Maglificio Alto Milanese (knits for sport and ready-to-wear) and Casa Da Malha (knits). Carvico\'s Vita Life swimwear fabrics are an earlier commercial example.',
      'The plant-based content replaces part of the fibre\'s fossil-derived building block. Because the fibre is a drop-in replacement, mills can switch without changing machinery, and the fabrics keep the stretch and recovery of conventional LYCRA® fibre. A 2026 Ramboll life cycle assessment estimates a carbon footprint up to 45% lower than the fossil-derived version.',
      'This is the lowest-risk sustainability upgrade for denim, activewear, shapewear and stretch shirting: the garment, fit and price story stay the same while the fibre story improves. It suits Indian exporters selling to EU and US brands that ask for lower-impact materials.',
      ['Ask your denim and knit mills whether they can offer renewable stretch versions of core qualities.', 'Test it on one best-selling stretch article for AW27 or SS28 before scaling.', 'Keep the claim precise: "made with 70% plant-based content" refers to the stretch fibre, not the whole garment.'],
      [('LYCRA', 'https://www.lycra.com/en/business/events/milano-unica')]),
 _rep('Water resistance in the yarn', 'innovation-water-resistance-in-the-yarn', 'Water resistance in the yarn: performance without PFAS finishes',
      'Unifi\'s Resist2O Pro builds water resistance into the yarn instead of a chemical finish. What it means for outerwear and travel wear.',
      'Rainwear and outdoor clothing usually get their water repellence from a topical finish (DWR), historically based on fluorinated chemistry (PFAS) that regulators and brands are phasing out. A new approach moves water resistance into the yarn itself.',
      'Unifi announced Resist2O Pro on 12 October 2026 and shows it at Performance Days in Munich (13–14 October 2026), then at the Functional Fabric Fair in Portland (26–28 October 2026). The 2026 Techtextil innovation awards also rewarded two other PFAS-free routes: a dry plasma coating that makes yarns water-repellent (EC0Tex, Bäumlin & Ernst) and plant-based fatty acids grafted onto cellulose fibres (H&B Materials).',
      'Resist2O Pro is engineered to minimise water absorption without topical treatments or fluorinated chemistry (Unifi states fluorine-free and PFOA-free, under 5 ppb), so the separate finishing step disappears. It works across different fabric constructions, for apparel, footwear, furnishings and industrial textiles.',
      'Monsoon wear, commuter jackets, travel trousers and school and uniform fabrics all need water resistance. As export buyers demand PFAS-free products, yarn-level and plant-based solutions will become a sourcing requirement, not a bonus.',
      ['Audit which of your products still use fluorinated water-repellent finishes.', 'Request PFAS-free samples from yarn and fabric suppliers for AW27 outerwear.', 'Check durability after washing in your own tests before making performance claims.'],
      [('Innovation in Textiles', 'https://innovationintextiles.com/unifi-moves-water-resistance-into-the-yarn'), _TW]),
 _rep('Elastane-free natural stretch', 'innovation-elastane-free-natural-stretch', 'Elastane-free natural stretch: comfort tailoring without synthetics',
      'Wool, cashmere and mohair fabrics that stretch through yarn and weave alone. Forecut\'s report on the premium tailoring innovation.',
      'Stretch normally comes from blending in elastane, which makes natural-fibre fabrics harder to recycle. Mills are now engineering stretch from the yarn and weave themselves, so a 100% natural-fibre fabric can still move with the body.',
      'At Intertextile Shanghai Apparel Fabrics (25–27 August 2026), Italian mill Trabaldo Togna presented 100% natural-fibre stretch fabrics in fine wool, cashmere and mohair, made without elastane.',
      'Mechanical stretch comes from highly twisted yarns and weave structures (such as crepe and certain twills) that act like a spring when the fabric is pulled and recover when released. The stretch is gentler than elastane but keeps the fabric mono-material.',
      'Premium tailoring, travel suits and wedding menswear are growing in India, and buyers want comfort without a "technical" look. Natural stretch lets brands sell comfort and a pure-fibre story together.',
      ['Ask suiting suppliers for mechanical-stretch wool qualities for AW27 tailoring.', 'Fit-test: mechanical stretch behaves differently from elastane, so adjust ease in patterns.', 'Use the "100% wool, natural stretch" story on labels and product pages.'],
      [_TWI]),
 _rep('Waterless denim finishing', 'innovation-waterless-denim-finishing', 'Waterless denim finishing: the new standard for washes',
      'Low-water washing and low-impact indigo are scaling across denim. Why Indian denim makers should move first.',
      'Denim\'s worn-in look traditionally comes from heavy wet processing: stone washing, bleaching and repeated rinses that use large amounts of water and chemicals. Waterless and low-water finishing is now scaling across the industry.',
      'At Intertextile Shanghai (August 2026), Turkish mill Kipaş Denim presented circular solutions with waterless finishing and low-impact indigo dyeing, and Pakistan\'s Azgard Nine showed low-resource washing. Première Vision Denim\'s AW27-28 directions also put regenerative cotton and responsible denim at the centre.',
      'Common tools include laser finishing to create fades and whiskers without chemicals, ozone in place of bleaching, nano-bubble or mist technology that uses a fraction of the water, and indigo dyeing processes that cut water, energy and chemical use.',
      'India is one of the world\'s largest denim producers, and water stress is a real constraint in denim clusters. Brands that can document low-water processing gain an edge with export buyers and with consumers.',
      ['Ask laundries for the water use per garment of each wash recipe.', 'Move hero washes to laser and ozone recipes first.', 'Combine with regenerative or organic cotton for a complete denim story.'],
      [_TWI, ('Première Vision', 'https://www.premierevision.com/articles/5bc3727d-1f3e-f111-8ef3-000d3a4af15b/denim-innovation-for-autumn-winter-27-28')]),
 _rep('Fibre traceability', 'innovation-fibre-traceability', 'Fibre traceability: from farm to garment, digitally',
      'Digital traceability platforms and the coming EU Digital Product Passport. What fashion brands need to prepare.',
      'Buyers and regulators increasingly want proof of where a fibre was grown and how it was processed. Digital traceability platforms record each step from farm to finished garment.',
      'The flax-linen and hemp alliance runs a digital traceability platform with TextileGenesis (Lectra Group) for its Masters of FLAX FIBRE™ and Masters of LINEN™ certifications, presented at Milano Unica in July 2026. In the EU, the Ecodesign for Sustainable Products Regulation (ESPR) will introduce a Digital Product Passport for textiles; the Commission\'s working plan gives an indicative 2027 timeline for the textile delegated act, with obligations expected to follow about 18 months after it enters into force.',
      'Each batch of certified fibre gets a digital record that travels with it through spinning, weaving and making. The passport is expected to cover material composition, manufacturing, environmental indicators, chemical compliance, supply-chain traceability and durability or recyclability. Final data rules are not yet adopted.',
      'Indian exporters to the EU will need traceability data from their suppliers. Domestic brands can use the same data as a premium story for handloom, organic cotton and linen.',
      ['Start collecting fibre origin and certificates for your top 20 styles.', 'Ask suppliers which traceability platforms they already use.', 'Watch for the EU textile delegated act; Forecut will update this report when it is adopted.'],
      [_ALL, ('COSH!', 'https://cosh.eco/en/articles/eu-digital-product-passport-espr-explained-fashion-textiles')]),
 _rep('Long-fibre European hemp', 'innovation-long-fibre-european-hemp', 'Long-fibre hemp: the next linen?',
      'A pilot long-fibre hemp collection from the Hemp4Circularity project. Why hemp could become a summer staple.',
      'Hemp grows fast with little water and few inputs, but most hemp is processed as short fibre, which limits it to rougher fabrics. Long-fibre hemp, processed more like flax for linen, can be spun into finer, smoother yarns.',
      'At Milano Unica in July 2026, the Alliance for European Flax-Linen & Hemp opened its first Hemp Lab, with a European Hemp Textile Inspiration Book and a pilot long-fibre hemp collection from Hemp4Circularity, an Interreg North-West Europe project (2023–2026) with about €2.3 million of EU funding.',
      'The project runs pilots across the chain: cultivation, primary processing, data-driven farming, spinning and fabric production, to build a local long-fibre hemp supply in North-West Europe.',
      'Hemp handles heat well and has a linen-like look, ideal for Indian summers. It is still a pilot, so volumes and prices are not yet commercial; expect it first in premium shirting, suiting and home textiles.',
      ['Watch hemp-linen blends as the first accessible step.', 'Request swatches from linen suppliers already sampling hemp.', 'Plan a small capsule for SS28 or later, when supply grows.'],
      [_ALL, ('Hemp4Circularity', 'https://hemp4circularity.nweurope.eu/')]),
 _rep('Biodegradable biopolyester', 'innovation-biodegradable-biopolyester', 'Biodegradable biopolyester: a polyester that can go away',
      'Mariva, a bio-based polymer with PET-like properties that is chemically recyclable and biodegradable. Forecut\'s innovation report.',
      'Polyester is the world\'s most used fibre and a major source of microplastics. A new bio-based polymer aims to behave like polyester in use but break down or be recycled at end of life.',
      'Senbis Polymer Innovations (Netherlands) won a 2026 Techtextil innovation award for Mariva, announced on 14 April 2026. Senbis founded the start-up Mariva Materials in April 2026 to develop uses in sportswear, footwear, technical textiles and nonwovens.',
      'Mariva is a bio-based, high-performance polymer with properties similar to PET and polyamide. It is designed for conventional polymerisation and melt-spinning lines, and pilot trials reportedly spun it on standard PET machinery. Senbis says it is chemically recyclable and biodegradable without producing microplastics.',
      'Indian sportswear and athleisure brands rely heavily on polyester. A material that runs on existing machinery could scale faster than most bio-materials, but it is still at pilot stage.',
      ['Track Mariva Materials\' commercial partners through 2027.', 'Ask your polyester suppliers about bio-based or biodegradable trials.', 'Avoid "biodegradable" claims until certified test results are available.'],
      [_TW]),
 _rep('Mono-material thread', 'innovation-mono-material-thread', 'Mono-material thread: making garments recyclable at the seams',
      'Amann\'s AeoniQ Fil cellulose thread lets a cotton or viscose garment stay one material. Why seams matter for recycling.',
      'A cotton shirt is rarely 100% cotton: it is usually sewn with polyester thread. Those synthetic seams complicate recycling. A new cellulose thread lets the whole garment stay in one material family.',
      'Amann (Germany) won a 2026 Techtextil innovation award for AeoniQ Fil, described as the world\'s first sewing and embroidery thread made from AeoniQ, a wood-pulp-based cellulose fibre. It made its market debut at Texprocess in April 2026.',
      'Amann describes the thread as microplastic-free and biodegradable, with tear resistance and elasticity approaching synthetic threads and about twice the elasticity of conventional cellulose threads. It is meant for mono-material garments and home textiles.',
      'Embroidery is central to Indian fashion. A cellulose embroidery thread could let cotton and viscose kurtas, shirts and home textiles be designed for recycling, a growing requirement from European buyers.',
      ['Test the thread on cotton basics and embroidered styles for seam strength.', 'Combine with cellulose labels and trims for a true mono-material product.', 'Watch EU recycling and ecodesign rules that reward mono-material design.'],
      [_TW]),
 _rep('Recycled-plastic embellishment', 'innovation-recycled-plastic-embellishment', 'Recycled-plastic embellishment: waste turned into couture flowers',
      'Vin + Omi\'s 3D flowers from recycled plastic at London Fashion Week SS27. How embellishment can carry a circular story.',
      'Sequins, beads and three-dimensional flowers are usually made from new plastic. Designers are now making embellishment from recycled plastic waste instead.',
      'At London Fashion Week SS27 (September 2026), Vin + Omi showed a sheer white gown covered in hundreds of 3D flowers made from recycled plastic, part of a wider runway trend for appliqué flowers.',
      'Plastic waste is cleaned, shredded and reformed into sheets, films or filaments, then cut, heat-shaped or moulded into petals, sequins and beads that are applied by hand or machine, just like conventional embellishment.',
      'India is the world\'s embellishment workshop. Recycled-plastic sequins and flowers let Indian embroidery units offer export clients a circular version of the same craft. Expect it first in capsule collections in 2027.',
      ['Source recycled sequins and beads with verified recycled content.', 'Pair with appliqué and organza flowers, a key SS27 runway trend.', 'Tell the waste-to-flower story clearly on product pages.'],
      [('TheIndustry.fashion', 'https://www.theindustry.fashion/fringe-florals-and-acid-green-7-trends-from-london-fashion-week-ss27/')], read=4),
]
INNOV_SLUGS = {r['radar']: r['slug'] for r in INNOV_REPORTS}
EXTRA_IMGS += [r['img'][0] for r in INNOV_REPORTS]
