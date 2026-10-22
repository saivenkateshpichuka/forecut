"""Global regions for Forecut: six continents, key markets, climate, calendar, preferences, fashion weeks and
season-by-season regional directions. International season names (SS, Pre-Fall, AW/FW, Resort/Cruise) are kept;
each region shows its own local in-store timing. Facts about shows are summarised from the linked sources;
'Forecut direction' text is Forecut's own forecast. Add new items at the top; never delete old ones."""

UPDATED = '22 Oct 2026'

# International season calendar (northern-hemisphere industry standard)
CALENDAR = [
    # name, code, shown, in stores (north), southern hemisphere, tropical/seasonless
    ('Spring/Summer', 'SS', 'Sep–Oct (year before)', 'Feb–Jul', 'Same trends sold Sep–Feb, a season later, in local spring/summer', 'Core of the year: lightweight trends sell 9–12 months'),
    ('Pre-Fall', 'PF', 'Dec–Jan', 'May–Jul', 'Sold as local transitional season (Nov–Jan)', 'Transitional layers, light outerwear for air-conditioned interiors'),
    ('Autumn/Winter (AW / FW)', 'AW', 'Feb–Mar', 'Aug–Jan', 'Same trends sold Mar–Aug, in local autumn/winter', 'Festive and occasion wear; lighter-weight versions of AW trends'),
    ('Resort / Cruise', 'RS', 'May–Jun', 'Nov–Jan (holiday, travel)', 'Lands in local summer: the peak season for resort', 'Holiday, wedding and travel wardrobes'),
]

# Seasons used on region pages: (code, label, global page or None, northern window)
SEASONS = [
    ('aw26', 'AW26', 'aw26.html', 'Aug 2026 – Jan 2027'),
    ('rs27', 'Resort 27', 'resort-27.html', 'Nov 2026 – Jan 2027'),
    ('ss27', 'SS27', 'ss27.html', 'Feb – Jul 2027'),
    ('pf27', 'Pre-Fall 27', 'pre-fall-27.html', 'May – Jul 2027'),
    ('aw27', 'AW27', 'aw27.html', 'Aug 2027 – Jan 2028'),
    ('ss28', 'SS28', 'ss28.html', 'Feb – Jul 2028'),
    ('aw28', 'AW28', 'aw28.html', 'Aug 2028 – Jan 2029'),
]

HOT = ['puffer', 'quilted', 'fur', 'shearling', 'mohair', 'alpaca', 'fleece', 'thermal', 'insulated', 'wool', 'flannel',
       'corduroy', 'parka', 'cashmere', 'brushed', 'padded', 'velvet', 'turtleneck', 'aviator', 'boots']

REGIONS = [
 {'slug': 'asia', 'name': 'Asia', 'hemi': 'north', 'img': ['hub-region-asia', 'theme-ss27-handcraft', 'hero-ss27'],
  'lead': 'The world\'s largest and fastest-moving fashion market: Chinese and Korean labels setting their own directions, Japan\'s craft-led design, India\'s occasion economy and the Gulf\'s modest-luxury buyers.',
  'climate': 'From temperate four-season East Asia to tropical Southeast Asia and India, and the hot, dry Gulf. One collection rarely fits every market: weight, sleeve length and coverage change by country.',
  'influences': ['Western runway trends filtered through local taste, often within one season', 'K-culture and celebrity-led demand from Seoul', 'Heritage revival: Chinese brocades and kesi, Indian handloom, Japanese craft', 'Modest and layered dressing across the Gulf, Malaysia and Indonesia'],
  'heat': False,
  'boost': ['tailor', 'knit', 'shirt', 'layer', 'embroider', 'sheer', 'organza'],
  'markets': [
    {'name': 'China', 'climate': 'Four seasons in the north and east; subtropical south.', 'moments': 'Lunar New Year, 618 and Double 11 (11.11) shopping festivals', 'prefs': 'Fast adoption of runway ideas, strong local designer brands, heritage motifs, live-commerce driven drops.', 'week': 'Shanghai Fashion Week (SS27 opened 8 Oct 2026, theme "Renewed Radiance")'},
    {'name': 'Japan & South Korea', 'climate': 'Four distinct seasons with humid summers.', 'moments': 'Spring and autumn wardrobe changes, year-end gifting, Chuseok', 'prefs': 'Precise tailoring, layering, quality basics, technical outerwear, K-celebrity influence.', 'week': 'Rakuten Fashion Week Tokyo (31 Aug–5 Sep 2026) · Seoul Fashion Week (1–6 Sep 2026)'},
    {'name': 'India', 'climate': 'Tropical and subtropical; monsoon Jun–Sep; short north-Indian winter.', 'moments': 'Diwali and festive (Sep–Nov), wedding seasons (Nov–Feb, Apr–May), summer', 'prefs': 'Occasion and ethnic wear, handloom and embroidery, fusion for Gen Z, value-led western wear.', 'week': 'Lakmē Fashion Week x FDCI (13–18 Oct 2026)', 'link': ('india.html', 'Open the full India forecast →')},
    {'name': 'Southeast Asia', 'climate': 'Hot and humid all year; wet and dry seasons.', 'moments': 'Ramadan and Hari Raya, Lunar New Year, year-end sales', 'prefs': 'Breathable fabrics, modest options, bright colour, resort and occasion wear.', 'week': 'Jakarta Fashion Week 2027 (26 Oct–1 Nov 2026)'},
    {'name': 'Middle East (GCC)', 'climate': 'Very hot summers; mild "winter" season Oct–Mar is the main retail season.', 'moments': 'Ramadan and Eid, wedding season, winter tourism', 'prefs': 'Modest luxury, abayas and kaftans, eveningwear, high-end craft, international designer brands.', 'week': 'Dubai Fashion Week (22–26 Oct 2026, d3)'},
  ],
  'news': [
    ('Oct 2026', 'Jakarta Fashion Week 2027 opens 26 October', 'Indonesia\'s main fashion week runs 26 October to 1 November 2026 in Jakarta, with a model search and BTN Fashion Lab linking designers with small businesses (UMKM) and local artisans.', [('Indonesia Travel', 'https://www.indonesia.travel/au-en/events/event-detail/jfw-2027')]),
    ('Oct 2026', 'Shanghai Fashion Week SS27: "Renewed Radiance"', 'Nearly 100 runway presentations and about 1,000 brands. HEMU opened with Dunhuang heritage techniques (yunjin and song brocade, kesi silk tapestry, embroidery); the season spotlights traditional Chinese motifs inspired by the Silk Road.', [('China Daily', 'https://www.chinadaily.com.cn/a/202609/23/WS6ab3e914e4b06d4aa055fd84.html'), ('CGTN', 'https://news.cgtn.com/news/2026-10-09/Spring-Summer-2027-Shanghai-Fashion-Week-kicks-off--1R6bkJ10QTK/p.html')]),
    ('Oct 2026', 'Dubai Fashion Week SS27 widens its map', 'Running 22–26 October at Dubai Design District, with designers from the UAE, Kuwait, India, Colombia, Vietnam, Ukraine, Azerbaijan, Jordan, France and Italy, and a buyers\' programme for regional and international stores.', [('Dubai PR Network', 'https://www.dubaiprnetwork.com/fashion-news/194513-dubai-fashion-week-announces-spring-summer-2027-edition-programme')]),
    ('Sep 2026', 'Seoul SS27: tailoring as a system', 'Kwaeja-inspired overlapping forms, cropped jackets and windbreakers, ballooning trousers; earth tones with sheer fabrics and metallic silver; technical fabrics and denim-effect patchwork.', [('METAL Magazine', 'https://metalmagazine.eu/en/post/seoul-fashion-week-ss-2027-our-favourite-collections')]),
    ('Sep 2026', 'Tokyo SS27: translucency and reworked office wear', 'Yoshiokubo layered translucent fabrics with utility thermals; Pillings twisted shirts and pencil skirts with off-centre creases; Charinyeh used gossamer fabrics and coral-like cut jacquard.', [('Tokyo Weekender', 'https://www.tokyoweekender.com/art_and_culture/fashion/rakuten-fashion-week-tokyo-ss-2027-designers/')]),
  ],
  'dir': {
    'ss27': ['Heritage textiles and motifs (brocade, kesi, handloom) on modern silhouettes', 'Sheer and translucent layers worn over opaque bases for modesty and heat', 'Tailoring with technical and utility details, cropped jackets and windbreakers', 'Luminous blue and earth tones; metallic silver accents'],
    'aw27': ['Waisted outerwear for East Asia; lightweight layering pieces for tropical markets', 'Craft on knits and festive wear for India and the Gulf winter season', 'Structured tailoring in soft wools for Japan, Korea and northern China'],
    'rs27': ['Gulf winter-season eveningwear and travel wardrobes', 'Indian wedding-season guest wear', 'Southeast Asian holiday and Lunar New Year capsules'],
  }},
 {'slug': 'europe', 'name': 'Europe', 'hemi': 'north', 'img': ['hub-region-europe', 'hub-fabrics-runway-paris', 'hero-aw26'],
  'lead': 'Home of the Paris, Milan and London calendars and the luxury houses whose shows set the global agenda, plus Scandinavia\'s commercial, sustainability-minded labels.',
  'climate': 'Temperate four-season climate: cold, wet winters in the north, hot dry summers around the Mediterranean.',
  'influences': ['Paris, Milan and London runways set the season\'s headline ideas', 'Copenhagen leads on sustainability and commercial "cool"', 'Luxury houses\' Resort shows extend trends into travel and holiday wear'],
  'heat': False,
  'boost': ['tailor', 'trench', 'coat', 'knit', 'loafer', 'organza', 'sheer', 'check'],
  'markets': [
    {'name': 'France, Italy & UK', 'climate': 'Temperate; mild south, wetter north.', 'moments': 'January and July sales, Christmas, summer holidays', 'prefs': 'Tailoring, heritage brands, quality fabrics, quiet luxury alongside directional design.', 'week': 'Paris, Milan and London fashion weeks (Sep–Oct 2026)'},
    {'name': 'Nordics', 'climate': 'Long cold winters, short bright summers.', 'moments': 'Midsummer, Christmas', 'prefs': 'Functional outerwear, minimal design, sustainability credentials, colour pops in summer.', 'week': 'Copenhagen Fashion Week (3–7 Aug 2026)'},
    {'name': 'Southern Europe', 'climate': 'Mediterranean: hot, dry summers; mild winters.', 'moments': 'Summer travel season, Easter', 'prefs': 'Linen, resort wear, sandals, colour and print; strong local craft (Spain, Portugal, Greece).', 'week': 'Madrid and Lisbon fashion weeks'},
  ],
  'news': [
    ('Oct 2026', 'Paris SS27: the featherlight season', 'Ultrafine ripstop nylon at Issey Miyake, sheer organza sets at Chanel, sheer fabrics with soft tailoring at Dior.', [('Monocle', 'https://monocle.com/fashion/paris-fashion-week-october-2026-review/')]),
    ('Sep 2026', 'Milan SS27: sheer meets gloss', 'Latex-effect rubber and PVC at Ferragamo, glossy nylon at MSGM, taffeta and crinkled nylon at Bottega Veneta.', [('nss magazine', 'https://www.nssmag.com/en/fashion/47050/5-trends-from-milan-fashion-week-ss27-women-s')]),
    ('Aug 2026', 'Copenhagen SS27: Nordic design meets ethical fashion', 'Collina Strada, Stine Goya and By Malene Birger led social coverage of a week built on heritage and sustainability.', [('Onclusive', 'https://onclusive.com/resources/blog/first-fashion-weeks-ss27/')]),
  ],
  'dir': {
    'ss27': ['Featherlight, see-through fabrics: organza, voile, ripstop', 'The waist returns: peplums, basques, defined jackets', 'Skirts as the key piece, often at "the Chanel length" below the knee', 'Soft "ASMR" pastels: butter, lavender, sage, light blue'],
    'aw27': ['Waisted and belted outerwear, soft-focus brushed surfaces', 'Irregular, "living" textures from Première Vision AW27-28', 'Quiet tailoring in technical wools'],
    'rs27': ['Coastal and sporty: sailor stripes, fluid knits, linen (Chanel, Biarritz)', 'Heritage codes softened for travel'],
  }},
 {'slug': 'north-america', 'name': 'North America', 'hemi': 'north', 'img': ['hub-region-north-america', 'hub-fabrics-runway-newyork', 'hero-ss27'],
  'lead': 'The world\'s biggest single apparel market: New York\'s commercial runway, a huge denim, activewear and sneaker culture, and Mexico\'s rising design scene.',
  'climate': 'From cold Canadian winters to hot, humid southern US summers and Mexico\'s warm highlands and coasts.',
  'influences': ['New York\'s wearable take on runway trends', 'Celebrity, sport and streetwear culture', 'Luxury houses staging Resort shows in New York and Los Angeles (Cruise 2027)'],
  'heat': False,
  'boost': ['denim', 'sneaker', 'jacket', 'shirt', 'polo', 'tech', 'utility', 'jean'],
  'markets': [
    {'name': 'United States', 'climate': 'Every climate zone; regional assortments matter.', 'moments': 'Back to school, Thanksgiving and Black Friday, holiday, spring break', 'prefs': 'Denim, activewear, sneakers, wearable versions of runway trends, size inclusivity.', 'week': 'New York Fashion Week (September 2026)'},
    {'name': 'Canada', 'climate': 'Long cold winters, warm summers.', 'moments': 'Holiday, Boxing Day', 'prefs': 'Technical outerwear, layering, practical luxury.', 'week': 'Toronto events'},
    {'name': 'Mexico', 'climate': 'Warm all year in most cities; rainy season Jun–Oct.', 'moments': 'Día de Muertos, holiday season, Buen Fin sales', 'prefs': 'Colour and craft, artisanal textiles, occasion wear, warm-weather dressing.', 'week': 'Fashion Week México (12–17 Oct 2026, Mexico City)'},
  ],
  'news': [
    ('Oct 2026', 'Fashion Week México 2026', 'Ran 12–17 October in Mexico City, with a focus on how light, space and technology shape how collections are presented.', [('Publimetro', 'https://www.publimetro.com.mx/plus/2026/10/17/fashion-week-mexico-2026-moda-diseno-y-tecnologia-se-encuentran-en-las-pasarelas/')]),
    ('Sep 2026', 'NYFW SS27: sheer goes commercial', 'See-through skirts with covered-up tops (Calvin Klein, Brandon Maxwell), light knits tied low at the waist; Luminous Blue and marigold led the palette.', [('Fashionista', 'https://fashionista.com/2026/09/new-york-fashion-week-spring-2027-trends')]),
    ('May 2026', 'Cruise 2027 in New York and Los Angeles', 'Gucci (Demna) showed in Times Square, Louis Vuitton at The Frick Collection, Dior (Jonathan Anderson) at LACMA in Los Angeles.', [('Harper\'s Bazaar India', 'https://www.harpersbazaar.in/fashion/story/cruise-2027-saw-chanel-dior-gucci-and-louis-vuitton-go-all-in-on-drama-1395985-2026-05-22')]),
  ],
  'dir': {
    'ss27': ['Sheer skirts and overlays on opaque bases: the wearable version', 'Primary colours with Luminous Blue; marigold as the breakout shade', 'Knits and shirts tied low at the waist', 'Denim reworked with tailoring'],
    'aw27': ['Technical outerwear and waisted coats', 'Elevated denim and leather', 'Sneakers step back for loafers and refined shoes'],
    'rs27': ['Banker tailoring and technical coats (Gucci)', 'Embroidered and faded denim (Dior)', 'Leather minidresses and racing coats (Louis Vuitton)'],
  }},
 {'slug': 'south-america', 'name': 'South America', 'hemi': 'south', 'img': ['hub-region-south-america', 'theme-ss27-in-motion', 'hero-ss27'],
  'lead': 'A southern-hemisphere market led by Brazil: colour, swim and beachwear, a large cotton and denim industry, and designers rooted in local culture.',
  'climate': 'Tropical in the north and Brazil\'s coast; temperate and four-season in Argentina, Chile and southern Brazil. Seasons are opposite to Europe.',
  'influences': ['European runway trends, adapted a season later for local summer', 'Brazilian beach and swim culture', 'Indigenous and regional craft, sustainable cotton'],
  'heat': True,
  'boost': ['linen', 'crochet', 'print', 'sandal', 'swim', 'denim', 'seersucker', 'cotton'],
  'markets': [
    {'name': 'Brazil', 'climate': 'Mostly tropical; cooler south.', 'moments': 'Carnival (Feb/Mar), Christmas and New Year summer', 'prefs': 'Colour, body-confident fits, swim and beachwear, denim, local designer brands.', 'week': 'São Paulo Fashion Week N61 (13–18 Oct 2026, 26 shows)'},
    {'name': 'Argentina & Chile', 'climate': 'Temperate; cold winters Jun–Aug.', 'moments': 'Christmas summer, winter holidays (July)', 'prefs': 'European-influenced tailoring, leather, knitwear.', 'week': 'BAFWeek (Buenos Aires)'},
    {'name': 'Colombia & Andean', 'climate': 'Equatorial; temperature set by altitude.', 'moments': 'Year-end holidays, festivals', 'prefs': 'Swimwear and resort, colourful occasion wear, shapewear.', 'week': 'Colombiamoda (Medellín)'},
  ],
  'news': [
    ('Oct 2026', 'São Paulo Fashion Week N61', 'Ran 13–18 October with 26 shows, mainly at Pacubra in Ibirapuera Park, as part of SPFW\'s 30th-anniversary celebrations, with established labels, independents and new voices.', [('FashionUnited Brasil', 'https://fashionunited.com.br/news/fashion/spfw-n61-divulga-o-line-up-oficial/20260825570422'), ('O Tempo', 'https://www.otempo.com.br/moda-e-beleza/2026/8/26/spfw-n61-divulga-line-up-oficial-com-26-desfiles-em-sao-paulo-veja')]),
  ],
  'dir': {
    'ss27': ['International SS27 trends reach local stores for spring/summer, Sep 2027–Feb 2028', 'Featherlight and sheer fabrics translated into beach and resort wear', 'Bold colour: Luminous Blue, marigold, berry reds', 'Crochet, raffia and cotton craft'],
    'aw27': ['International AW27 trends sell in local winter, Mar–Aug 2028, in lighter weights for the tropical north', 'Leather and knitwear for Argentina and southern Brazil'],
    'rs27': ['Lands in local summer: the peak season for resort, swim and holiday wear'],
  }},
 {'slug': 'africa', 'name': 'Africa', 'hemi': 'mixed', 'img': ['hub-region-africa', 'theme-ss27-handcraft', 'hero-ss27'],
  'lead': 'A young, fast-growing fashion continent: Lagos and Johannesburg as design capitals, bold prints and colour, and craft-led, circular production.',
  'climate': 'Mostly hot: tropical West and Central Africa, highland East Africa, Mediterranean north, and a temperate, southern-hemisphere South Africa.',
  'influences': ['African heritage textiles and tailoring traditions', 'Diaspora designers in London, Paris and New York', 'Circular and craft-led production'],
  'heat': True,
  'boost': ['print', 'colour', 'tailor', 'craft', 'embroider', 'linen', 'shirt', 'sandal'],
  'markets': [
    {'name': 'Nigeria & West Africa', 'climate': 'Hot and humid; rainy season Apr–Oct.', 'moments': 'Detty December, weddings, Eid', 'prefs': 'Statement occasion wear, bold print and colour, tailoring, aso-ebi group dressing.', 'week': 'Lagos Fashion Week (28 Oct–1 Nov 2026, theme "CRAFTED")'},
    {'name': 'South Africa', 'climate': 'Temperate; southern-hemisphere seasons.', 'moments': 'Festive summer (Dec), Black Friday', 'prefs': 'Local designer pride, maximalist colour, menswear, denim and streetwear.', 'week': 'South African Fashion Week (SS26 shown Mar 2026)'},
    {'name': 'North Africa', 'climate': 'Mediterranean coast, hot desert interior.', 'moments': 'Ramadan and Eid, summer weddings', 'prefs': 'Modest and occasion wear, kaftans and djellabas, craft embroidery.', 'week': 'Casablanca and Cairo events'},
    {'name': 'East Africa', 'climate': 'Mild highland climate (Nairobi, Addis Ababa).', 'moments': 'Year-end holidays, weddings', 'prefs': 'Contemporary African design, handwoven textiles, smart casual.', 'week': 'Nairobi events'},
  ],
  'news': [
    ('Oct 2026', 'Lagos Fashion Week 2026: "CRAFTED"', 'Runs 28 October–1 November under the theme "CRAFTED: Heritage. Innovation. Circular Futures.", putting making, traditional skills and circularity at the centre.', [('FAB L\'Style', 'https://fablstyle.com/lagos-fashion-week-2026-crafted/')]),
    ('Apr 2026', 'South African Fashion Week SS26', '\'80s maximalism, puff and bubble silhouettes, cinched waists, and dark chocolate brown as the "new black".', [('The Post (IOL)', 'https://thepost.co.za/lifestyle/style-beauty/2026-04-27-safw-ss26-trends-80s-maximalism-and-chocolate-brown-dominate-the-runway/')]),
  ],
  'dir': {
    'ss27': ['Cinched waists and volume: puff, bubble and peplum shapes', 'Bold colour and print; chocolate brown as a neutral', 'Craft and heritage textiles in contemporary tailoring', 'Lightweight fabrics for hot climates'],
    'aw27': ['West Africa: occasion and festive (Detty December) rather than cold-weather wear', 'South Africa: AW27 trends sell in local winter, Mar–Aug 2028'],
    'rs27': ['Year-end wedding, festive and holiday wardrobes'],
  }},
 {'slug': 'oceania', 'name': 'Oceania', 'hemi': 'south', 'img': ['hub-region-oceania', 'theme-ss27-in-motion', 'hero-ss27'],
  'lead': 'Australia and New Zealand: relaxed, outdoor and coastal style, a strong local designer scene, and a calendar that runs opposite to Europe and North America.',
  'climate': 'Southern-hemisphere seasons: summer Dec–Feb, winter Jun–Aug. Mostly temperate, tropical in the north of Australia.',
  'influences': ['International runway trends, adapted for a warm, outdoor lifestyle', 'Surf and beach culture', 'Australian Fashion Week Resort collections, shown in May'],
  'heat': True,
  'boost': ['linen', 'crochet', 'sandal', 'sheer', 'swim', 'denim', 'utility', 'print'],
  'markets': [
    {'name': 'Australia', 'climate': 'Temperate south, tropical north; hot summers.', 'moments': 'Christmas summer, Black Friday, end-of-financial-year sales (June)', 'prefs': 'Resort and swim, relaxed tailoring, linen, local designer labels.', 'week': 'Australian Fashion Week (May, Sydney: Resort 27 shown May 2026)'},
    {'name': 'New Zealand', 'climate': 'Temperate, changeable weather.', 'moments': 'Christmas summer, winter (June–August)', 'prefs': 'Practical outerwear, merino knitwear, minimal design.', 'week': 'New Zealand Fashion Week'},
  ],
  'news': [
    ('May 2026', 'Australian Fashion Week Resort 27', 'Five directions: bi-coastal utility (nylon, raincoat fabrics), ethereal sheers (silk organza), high shine (liquid sequin and georgette), "surfer perfect" (wraps, crochet, raffia, sunset prints) and berry reds.', [('Style Arcade', 'https://www.stylearcade.com/blog/australian-fashion-week-resort-27-trend-report')]),
  ],
  'dir': {
    'ss27': ['International SS27 trends reach local stores for spring/summer, Sep 2027–Feb 2028', 'Sheer layers and silk organza (Resort 27 confirms it)', 'Surf-inflected tailoring, wraps and sarong ties', 'Berry reds, chartreuse, mint and aqua'],
    'aw27': ['International AW27 trends sell in local winter, Mar–Aug 2028', 'Merino knitwear and practical outerwear'],
    'rs27': ['Bi-coastal utility, ethereal sheers, high shine, surfer perfect, berry reds (Australian Fashion Week)'],
  }},
]

# Resort / Cruise 2027 report and Pre-Fall 2027 outlook
RESORT = {
 'shows': [
  ('Chanel', 'Matthieu Blazy\'s first Cruise collection', 'Biarritz, France', 'Sailor stripes, sporty pieces, robe coats, scarf dresses, relaxed tailoring; fluid knits, Basque-inspired linens and retro swimwear; turquoise and an explosion of colour.'),
  ('Dior', 'Jonathan Anderson', 'LACMA, Los Angeles', 'Floral dresses inspired by Californian poppies, softened Bar jackets, elongated tailoring; denim embroidered with silver chains; sculptural headpieces by Philip Treacy.'),
  ('Gucci', 'Demna\'s Cruise debut', 'Times Square, New York', 'Banker tailoring, pencil skirts, technical coats, cropped leather separates and giant carryalls: grounded "Gucci Core" essentials.'),
  ('Louis Vuitton', 'Nicolas Ghesquière', 'The Frick Collection, New York', 'Structured leather coats, leather minidresses, pleated high-neck blouses with denim, colourful patchwork evening coats.'),
 ],
 'aus': ['Bi-coastal utility: nylon and raincoat fabrics, funnel-neck jackets, frayed edges', 'Ethereal sheers: silk and silk organza, micro polka dots, slip dresses under blazers', 'High shine: liquid sequin and georgette, iridescent green, ice blue, gold', 'Surfer perfect: wraps, sarong ties, crochet sets, raffia hems, sunset prints', 'Berry reds: cherry, raspberry, wine, coral, ballet pink'],
 'src': [('Harper\'s Bazaar India', 'https://www.harpersbazaar.in/fashion/story/cruise-2027-saw-chanel-dior-gucci-and-louis-vuitton-go-all-in-on-drama-1395985-2026-05-22'), ('Style Arcade', 'https://www.stylearcade.com/blog/australian-fashion-week-resort-27-trend-report')],
}

PAGES = {  # file: (seo title, description)
 'regions.html': ('Global Fashion Forecast by Region: Asia, Europe, Americas, Africa, Oceania | Forecut',
                  'Global fashion trend forecasting by region: seasonal trends, climate, market preferences and fashion weeks for Asia, Europe, North America, South America, Africa and Oceania.'),
 'resort-27.html': ('Resort / Cruise 2027 Trend Report | Forecut', 'Resort 2027 trends from the Cruise shows (Chanel, Dior, Gucci, Louis Vuitton) and Australian Fashion Week, with regional timing for each market.'),
 'pre-fall-27.html': ('Pre-Fall 2027 Trend Outlook | Forecut', 'Pre-Fall 2027 outlook: the transitional trends that bridge SS27 and AW27, with in-store timing by region.'),
}
for _r in REGIONS:
    PAGES[f'region-{_r["slug"]}.html'] = (f'{_r["name"]} Fashion Trend Forecast: Seasons, Markets & Fashion Weeks | Forecut',
                                         f'{_r["name"]} fashion forecast: regional season directions, climate, market preferences, fashion weeks and the global trends to lead with, SS27 to AW28.')
IMAGES = [n for r in REGIONS for n in r['img'] if n.startswith('hub-')] + ['hub-resort-27', 'hub-pre-fall-27', 'hub-regions']
