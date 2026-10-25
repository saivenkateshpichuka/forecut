"""Celebrity Style Watch (added 25 Oct 2026): red-carpet, premiere, awards and wedding looks from all six regions,
read as trend signals. Facts (who wore what, by whom, where) are summarised from the linked public sources;
'read' lines are Forecut's own view. Never use celebrity, red-carpet or agency photos: this page is text-only plus
Forecut's own detail images. Add new events at the TOP of EVENTS; never delete old ones (keep_check guards them).

Event: id (unique, never change), date, region (asia, europe, north-america, south-america, africa, oceania),
event, place, looks [(name, designer or '', what they wore)], read (Forecut view), details (existing Forecut
detail names, global or India), src [(source name, url)]."""

UPDATED = '25 Oct 2026'
FILE = 'celebrity-style.html'
SEO = ('Celebrity Style Watch: Red Carpet Looks & Trend Signals by Region | Forecut',
       'Weekly celebrity and red-carpet looks from Los Angeles, London, Rome, Mumbai, Lagos, Santiago and Sydney, who designed them, and which Forecut trend details they confirm.')
HERO = ['hub-couture-gown', 'hub-couture', 'hub-couture-bridal']

THIS_WEEK = [  # Forecut's short read of the latest week (newest week first; old weeks stay in WEEKS)
    'Velvet tailoring for men: Eddie Redmayne (Armani, cobalt blue) in Los Angeles and Tom Hiddleston (Ralph Lauren Collection, double-breasted) in London.',
    'Corsetry everywhere: a lace-up corset dress in London, steel boning in New York, corset blouses on Mumbai sarees and corseted bridal gowns in Nigeria.',
    'Crystal and bead embroidery as the evening finish, from Rome to Mumbai to Lagos wedding guests.',
    'Black tie gets a single loud note: a bright yellow shirt and tie (Loewe), a polka-dot pocket square (BOSS), a white floral brooch (Tom Ford).',
    'SS27 runway pieces are already on red carpets (Mugler, Roberto Cavalli, Erdem, Ralph Lauren, Tom Ford), months before they reach stores.',
]

EVENTS = [
 {'id': 'mumbai-diwali-ibtida-2026', 'date': '24 Oct 2026', 'region': 'asia', 'event': 'IBTIDA Ek Mehfil Diwali celebration', 'place': 'Mumbai, India',
  'looks': [('Shilpa Shetty', '', 'Ivory lace saree with a sleeveless, corset-style blouse embellished with pearls, beads and crystals; crystal bag with beaded tassels.'),
            ('Huma Qureshi', '', 'Rust-orange and gold Anarkali with zari embroidery, gota patti and mirror work.'),
            ('Mrunal Thakur', '', 'Custom black saree with a structured, corset-style blouse.'),
            ('Shriya Saran', '', 'Shimmering silver-grey saree with a heavily embellished blouse and a layered kundan and pearl choker.'),
            ('Nimrat Kaur', '', 'Sheer brown saree with metallic embellishment and a deep-neck blouse embroidered in silver and gold.'),
            ('Urmila Matondkar', '', 'Pista-green gharara set with a heavily embellished kurta.')],
  'read': 'Pre-Diwali parties confirm two Festive 26 directions: the corset blouse is now the default way to modernise a saree, and black, silver-grey and brown are accepted festive colours beside the usual jewel tones. Gota patti and mirror work keep the Anarkali traditional.',
  'details': ['Corset saree blouses', 'Fit-and-flare Anarkalis', 'Black-and-gold evening gowns', 'Mirror-work bags'],
  'src': [('Free Press Journal', 'https://www.freepressjournal.in/lifestyle/shilpa-shetty-shriya-saran-huma-qureshi-urmila-matondkar-and-other-celebs-bring-festive-glamour-to-ibtida-ek-mehfils-diwali-party-take-a-look')]},
 {'id': 'zlatan-ibile-traditional-wedding-2026', 'date': '24 Oct 2026', 'region': 'africa', 'event': 'Zlatan Ibile and Davita Omoniyi traditional wedding', 'place': 'Nigeria',
  'looks': [('Davita Omoniyi', 'Dova Bridals', 'Custom burgundy corseted mermaid gown with a sweetheart neckline, sheer long sleeves, side train and red crystal lattice beading; Okuku braided crown and layered coral.'),
            ('Zlatan Ibile', 'Deji & Kola', 'Custom cream robe under a textured ivory coat with hand-stitched red beadwork at the shoulders and hem; coral beads and ivory cap.'),
            ('Veekee James', 'Veekee James', 'Fitted mermaid gown with a sheer corset bodice in rows of wine-red crystals, high beaded collar, sheer beaded sleeves and gold sequin waves; champagne fan-pleated gele.')],
  'read': 'Nigerian wedding dressing is the strongest celebrity influence on the West African occasion market. Wine-red and burgundy with coral, corseted mermaid shapes and beadwork concentrated at the shoulders and hem are the takeaways; menswear shows how a single row of beading lifts a plain robe.',
  'details': ['Bead-droplet embroidered dresses', 'Corset-seamed dresses', 'Fishtail gowns with attached drapes'],
  'src': [('BellaNaija', 'https://www.bellanaija.com/2026/10/zlatan-ibile-davita-omoniyi-edo-traditional-wedding-first-look/'), ('BellaNaija', 'https://www.bellanaija.com/2026/10/veekee-james-sheer-beaded-bodice-zlatan-ibile-wedding/')]},
 {'id': 'esquire-uk-better-men-2026', 'date': 'Oct 2026', 'region': 'europe', 'event': "Esquire UK's Better Men Honours", 'place': "Claridge's, London",
  'looks': [('Tom Hiddleston', 'Ralph Lauren Collection', 'Velvet double-breasted suit.'),
            ('Sam Claflin', 'Tom Ford (Fall 2026)', 'Patterned evening coat with a draped scarf.'),
            ('Aaron Pierre', 'BOSS', 'Black double-breasted tuxedo with a polka-dot pocket square.'),
            ('Haider Ackermann', 'Tom Ford', 'Black tailoring with a white floral brooch.'),
            ('Kit Butler', 'McQueen', 'Black suit with a skull-print tie.')],
  'read': 'Men\'s evening dressing in London is double-breasted and textured: velvet, pattern and one decorative accessory. It supports Forecut\'s rising reads on velvet dinner jackets and lapel brooches for AW26 and AW27.',
  'details': ['Velvet dinner jackets', 'Pinstripe double-breasted suits', 'Oversized lapel flower brooches', 'Pocket squares'],
  'src': [('Red Carpet Fashion Awards', 'https://www.redcarpet-fashionawards.com/2026/10/24/who-was-your-best-dressed-this-week-552/')]},
 {'id': 'rome-film-fest-2026', 'date': 'Oct 2026', 'region': 'europe', 'event': 'Rome Film Festival premieres and parties', 'place': 'Rome, Italy',
  'looks': [('Jenna Ortega', 'Roberto Cavalli (Spring 2027)', 'Printed velvet gown at the Klara and the Sun premiere.'),
            ('Leïla Bekhti', 'Ralph Lauren (Spring 2027)', 'White shirt with a gold skirt.'),
            ('Kim Kardashian', 'Erdem (Spring 2027)', 'Crystal-embellished dress with a sheer black lace skirt, at an All\'s Fair cast party.')],
  'read': 'All three looks are SS27 runway pieces, worn about four months before they reach stores. The white-shirt-and-metallic-skirt pairing is the most commercial idea: easy to copy at every price level.',
  'details': ['Bias-cut velvet', 'Lace-trimmed hems', 'Oversized boyfriend shirts', 'Satin slip skirts'],
  'src': [('Red Carpet Fashion Awards', 'https://www.redcarpet-fashionawards.com/2026/10/24/who-was-your-best-dressed-this-week-552/')]},
 {'id': 'london-premieres-oct-2026', 'date': 'Oct 2026', 'region': 'europe', 'event': 'Clayface premiere and DeMellier flagship opening', 'place': 'London, UK',
  'looks': [('Naomi Ackie', 'Dilara Fındıkoğlu (Fall 2025)', 'Black lace-up corset dress.'),
            ('Simone Ashley', 'TOVE', 'Red dress with black mules and a black bag.'),
            ('Céline Dion (Paris)', 'Chanel Haute Couture (Fall 2026)', 'Black jacket with a gold chain belt over light-wash wide-leg jeans, on the final night of her Paris residency.')],
  'read': 'Couture worn with jeans is the clearest high-low signal of the week and supports wide-leg jeans staying at peak into AW27. Visible lacing keeps the corset trend moving from lingerie into eveningwear.',
  'details': ['Visible corset boning', 'Wide-leg jeans', 'Double-belted waists'],
  'src': [('Red Carpet Fashion Awards', 'https://www.redcarpet-fashionawards.com/2026/10/24/who-was-your-best-dressed-this-week-552/')]},
 {'id': 'academy-museum-gala-2026', 'date': '17 Oct 2026', 'region': 'north-america', 'event': 'Academy Museum Gala', 'place': 'Los Angeles, USA',
  'looks': [('Jodie Turner-Smith', 'Mugler (Spring 2027)', 'Sculptural zebra-print look with a dramatic headpiece.'),
            ('Eddie Redmayne', 'Giorgio Armani (Fall 2026)', 'Cobalt-blue velvet look.'),
            ('Diego Calva', 'Loewe', 'Black tuxedo with a bright yellow shirt and matching tie.'),
            ('Charles Melton', 'Artisanal ERL', 'Tailcoat with gold embellishment and wide-leg trousers.'),
            ('Kendall Jenner, Colman Domingo, Elle Fanning, Cailee Spaeny, Clairo', 'Valentino', 'Valentino looks across the guest list.'),
            ('Taylor Swift, Greta Lee', 'Dior', 'Dior, with Greta Lee in Dior Haute Couture.')],
  'read': 'Men took the risks: colour in velvet, a saturated shirt under black tie and embellished tailcoats with wide trousers. For AW26 and AW27 menswear, a coloured velvet jacket is the most saleable version.',
  'details': ['Velvet dinner jackets', 'Single-button tuxedo jackets', 'Wide-leg suit trousers', 'Jewel-tone cashmere'],
  'src': [('Red Carpet Fashion Awards', 'https://www.redcarpet-fashionawards.com/2026/10/24/who-was-your-best-dressed-this-week-552/'), ('Just Jared', 'https://www.justjared.com/2026/10/18/best-dressed-at-academy-museum-gala-2026-our-16-favorite-red-carpet-looks-of-the-night/')]},
 {'id': 'us-awards-screenings-oct-2026', 'date': 'Oct 2026', 'region': 'north-america', 'event': 'Billboard Latin Music Awards and New York screenings', 'place': 'Miami and New York, USA',
  'looks': [('Rosalía', 'Tom Ford (Spring 2027)', 'Black tuxedo tailoring with a bra top and draped skirt, at the Billboard Latin Music Awards, Miami.'),
            ('Jenna Ortega', 'Elias Matso', 'Steel-boned, crystal-embellished dress at the Klara and the Sun screening, New York.'),
            ('Helen Mirren', 'Matières Fécales (Fall 2026)', 'Black tulle skirt with pearl jewellery, A Talent for Murder premiere, New York.')],
  'read': 'Tailoring cut up and recombined with lingerie and drapes is the evening direction for SS27; a tuxedo jacket over a draped skirt is the wearable version.',
  'details': ['Single-button tuxedo jackets', 'Visible corset boning', 'Double-layer sheer skirts'],
  'src': [('Red Carpet Fashion Awards', 'https://www.redcarpet-fashionawards.com/2026/10/24/who-was-your-best-dressed-this-week-552/')]},
 {'id': 'santiago-premiere-oct-2026', 'date': 'Oct 2026', 'region': 'south-america', 'event': 'Wild Horse Nine premiere', 'place': 'Santiago, Chile',
  'looks': [('Mariana di Girolamo', 'Louis Vuitton', 'Custom warm-grey draped gown.')],
  'read': 'Soft draping in a muted neutral, a quieter alternative to the colour and print seen at São Paulo Fashion Week the same month.',
  'details': ['Wrap and twist-front dresses', 'Clean column dresses'],
  'src': [('Red Carpet Fashion Awards', 'https://www.redcarpet-fashionawards.com/2026/10/24/who-was-your-best-dressed-this-week-552/')]},
 {'id': 'logies-2026', 'date': '16 Aug 2026', 'region': 'oceania', 'event': 'TV WEEK Logie Awards', 'place': 'The Star, Sydney, Australia',
  'looks': [('Sonia Kruger', 'Leah Da Glória', 'Bronze hand-beaded fringed gown.'),
            ('Kylie Gillies', 'Carla Zampatti', 'Off-shoulder tassel top with a black floor-length skirt.'),
            ('Rebecca Harding', 'Steven Khalil', 'Silver gown with fur trim.'),
            ('Deborah Mailman', '', 'Sequinned black suit.'),
            ('Ada Nicodemou', 'Leah Da Glória', 'Custom blue gown.')],
  'read': 'Australian designers dominate the local red carpet. Fringe, beading and metallics carry through to the southern-hemisphere summer party season (Nov–Feb), when the same looks sell as event and wedding-guest wear.',
  'details': ['Fringed hems', 'Off-shoulder ruffle dresses', 'Sequin and chainmail minis'],
  'src': [('Mamamia', 'https://www.mamamia.com.au/logies-red-carpet-2026/')]},
]

GUIDE = '''<h2>Why celebrity looks matter to a forecast</h2>
<p>Red carpets, premieres, award shows and high-profile weddings are where runway ideas first meet a mass audience. A look worn by a film star or a musician is photographed thousands of times, searched for within hours and copied by fast-fashion and occasion-wear brands within weeks. That makes celebrity dressing one of the earliest public signals of which runway ideas will travel. Forecut does not treat a single famous outfit as a trend. We treat it as evidence: when the same detail appears on several red carpets, in more than one region, and also on the runway or in retail launches, it supports moving that detail from emerging to rising.</p>
<p>Each event on this page lists who wore what and who designed it, as reported by public sources, followed by a short Forecut read and links to the matching details in the forecast. We never publish celebrity, red-carpet or agency photographs; the details link to Forecut's own illustrations instead.</p>
<h2>How to use this page</h2>
<ul><li><b>Designers:</b> look at construction, not the whole outfit. A corset blouse, a velvet jacket or a beaded hem can be adapted to your own customer at your own price.</li>
<li><b>Buyers and merchandisers:</b> watch for repeats. One star in velvet is styling; five red carpets in velvet in two continents is a buying signal for the next season.</li>
<li><b>Occasion and bridal brands:</b> wedding and festive celebrity looks (Mumbai, Lagos, Dubai) move faster into retail than film-premiere looks, because customers have a date to dress for.</li>
<li><b>Marketing teams:</b> note which designers dress which stars in which market; local labels dressing local stars often matter more to sales than global houses.</li></ul>
<h2>Reading celebrity style by region</h2>
<p><b>North America</b> sets the volume: the Academy Museum Gala, award shows and premieres in Los Angeles and New York put next season's runway pieces on camera months before stores. <b>Europe</b> gives tailoring and couture signals through London, Paris, Rome and Venice. <b>Asia</b> is driven by Bollywood festive and wedding dressing in India, K-pop and C-pop brand ambassadors, and Gulf society events; these looks translate into retail very quickly. <b>Africa</b>'s strongest influence comes from Nigerian weddings, Nollywood and Afrobeats stars, often dressed by local designers. <b>South America</b> mixes telenovela and music stars with São Paulo and Buenos Aires designers. <b>Oceania</b>'s red carpets (the Logies, AACTA Awards, Melbourne Cup) favour Australian designers and land in the southern-hemisphere summer party season.</p>
<h2>Common questions</h2>
<p><b>Does a celebrity look make something a trend?</b> No. It is one signal among many. Forecut changes a detail's stage only when red-carpet evidence agrees with runway, retail and trade coverage.</p>
<p><b>Why are some designers listed as blank?</b> Some reports describe an outfit without naming who made it. We only credit a designer when a public source does.</p>
<p><b>How often is this page updated?</b> Every week, with the newest events at the top. Older events stay, so you can follow how a look spreads over a season.</p>
<p><b>Can I use these looks in a mood board?</b> Use the source links to view the original photographs, and respect each photographer's and publication's rights. Forecut's own detail images can be used in internal briefs with credit.</p>'''
