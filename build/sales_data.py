"""Sales, occasions and brands to watch by market (Oct 2026). Used by the landing page and region pages.
Dates are public calendar dates; where a date is expected (moon sighting) or not yet announced the label says so.
Brand notes summarise public sources only. Add new entries; never remove old ones (past dates simply stop showing)."""
import datetime as dt
D = dt.date

# (start, end or None, name, kind: 'sale' | 'occasion' | 'fashion', note)
MARKETS = [
 {'name': 'United States', 'region': 'north-america', 'events': [
   (D(2026, 11, 27), None, 'Black Friday', 'sale', 'The biggest discount weekend of the year; holiday partywear and outerwear lead.'),
   (D(2026, 11, 30), None, 'Cyber Monday', 'sale', 'Online-led; strong for basics, knitwear and footwear.'),
   (D(2026, 12, 1), D(2026, 12, 31), 'Holiday party season', 'occasion', 'Sequins, velvet and satin for office parties and New Year\'s Eve.'),
   (D(2027, 2, 14), None, 'Valentine\'s Day', 'occasion', 'Red, pink and lingerie; gifting accessories.')],
  'brands': [
   ('Revolve', 'Q1 2026 net sales up 16% to $342.9m; launched its first namesake label, Revolve Los Angeles.', 'SGB Media', 'https://sgbonline.com/revolve-groups-q1-sales-jump-16-percent/'),
   ('Uniqlo', 'Fast Retailing reported record sales of ¥3.96tn for the year to August 2026, with overseas growth led by the US and Europe.', 'Nation Thailand', 'https://www.nationthailand.com/news/40072030'),
   ('Madhappy x Lucky Brand', 'October 2026 denim capsule; part of a wave of nostalgic denim collaborations.', 'The Zoe Report', 'https://www.thezoereport.com/fashion/october-2026-fashion-news')]},
 {'name': 'United Kingdom', 'region': 'europe', 'events': [
   (D(2026, 11, 27), None, 'Black Friday', 'sale', 'Strongest online; coats and knitwear sell early.'),
   (D(2026, 12, 1), D(2026, 12, 24), 'Christmas party season', 'occasion', 'Partywear, tailoring and gifting.'),
   (D(2026, 12, 26), None, 'Boxing Day sales', 'sale', 'Start of the winter clearance; plan markdown depth.'),
   (D(2027, 2, 14), None, 'Valentine\'s Day', 'occasion', 'Red and pink accents, lingerie and gifting.')],
  'brands': [
   ('Next', 'Full-price sales up 10.6% in the nine weeks to 27 December 2025, international online up 38.3%; profit guidance raised.', 'The Retail Bulletin', 'https://www.theretailbulletin.com/fashion/next-raises-guidance-after-strong-christmas-trading-06-01-2026/'),
   ('H&M x Elie Saab', 'Collaboration launched 22 October 2026 in selected stores worldwide and online, including Elie Saab\'s first menswear.', 'FashionUnited', 'https://fashionunited.uk/news/fashion/h-m-teams-up-with-elie-saab-for-its-next-collaborative-collection/2026090390131')]},
 {'name': 'France & Italy', 'region': 'europe', 'events': [
   (D(2026, 11, 27), None, 'Black Friday', 'sale', 'Now well established in both markets.'),
   (D(2027, 1, 4), D(2027, 1, 31), 'Winter sales (saldi, soldes)', 'sale', 'Regulated winter sales start in early January; exact dates are set locally.', 'Early Jan'),
   (D(2027, 1, 19), D(2027, 1, 24), 'Paris Menswear AW27', 'fashion', 'FHCM calendar.'),
   (D(2027, 1, 25), D(2027, 1, 28), 'Paris Haute Couture SS27', 'fashion', 'FHCM calendar.')],
  'brands': [
   ('Jil Sander x Puma', 'Previewed on the Milan SS27 runway and on sale from October 2026: Speedcat sneakers in black and white leather and a fluid T7 tracksuit.', 'Fashionista', 'https://fashionista.com/2026/10/best-beauty-fashion-launches-collaborations-october-23'),
   ('Gucci (cooling)', 'Kering Q3 2026 revenue flat; Gucci down 6% comparable, softest in Asia Pacific.', 'Kering via GlobeNewswire', 'https://www.globenewswire.com/news-release/2026/10/22/3386683/0/en/kering-revenue-for-the-third-quarter-of-2026.html')]},
 {'name': 'China', 'region': 'asia', 'events': [
   (D(2026, 11, 11), None, 'Singles\' Day (11.11)', 'sale', 'The world\'s largest online shopping day; outerwear and down jackets lead.'),
   (D(2026, 12, 12), None, 'Double 12 (12.12)', 'sale', 'Year-end online sale.'),
   (D(2027, 2, 6), None, 'Lunar New Year', 'occasion', 'New clothes for the new year; red and gold, festive knitwear.')],
  'brands': [
   ('Anta Sports', 'H1 2026 revenue up 12.9% to 43.5bn yuan; Fila division up 6.1% and other brands, including Jack Wolfskin, up 44.2%.', 'FashionUnited', 'https://fashionunited.ca/news/business/anta-sports-reports-double-digit-revenue-growth-in-first-half/2026082646601')]},
 {'name': 'Japan & South Korea', 'region': 'asia', 'events': [
   (D(2026, 11, 27), None, 'Black Friday', 'sale', 'Growing in both markets, led by department stores and online.'),
   (D(2027, 1, 1), D(2027, 1, 3), 'New Year sales and lucky bags (fukubukuro)', 'sale', 'Japan\'s first sales of the year; mystery bags sell out early.'),
   (D(2027, 2, 6), None, 'Seollal (Korean New Year)', 'occasion', 'Family gatherings; modern hanbok and smart knitwear.')],
  'brands': [
   ('Uniqlo', 'Record sales of ¥3.96tn (+16.6%) and operating profit of ¥743.1bn (+31.7%) for the year to August 2026.', 'Nation Thailand', 'https://www.nationthailand.com/news/40072030'),
   ('Maison Margiela x Gentle Monster', 'Fourth eyewear collaboration with the Korean label, launched 29 October 2026.', 'Mille World', 'https://www.milleworld.com/the-week-in-chic-all-the-fashion-news-you-might-have-missed-oct-23-30/')]},
 {'name': 'India', 'region': 'asia', 'events': [
   (D(2026, 11, 8), None, 'Diwali', 'occasion', 'Peak festive buying: sarees, kurta sets, jewel tones and gold.'),
   (D(2026, 11, 9), D(2027, 2, 28), 'Wedding season', 'occasion', 'Bridal, groom and guest wear; velvet and lehengas in the north.'),
   (D(2026, 11, 27), None, 'Black Friday', 'sale', 'Growing online, led by western wear and sneakers.'),
   (D(2027, 1, 26), None, 'Republic Day sales', 'sale', 'Major online sales run around 26 January.', 'Around 26 Jan')],
  'brands': [
   ('Zudio (Trent)', 'Trent\'s standalone revenue rose 23% to Rs57.88bn in the quarter to September 2026, with 36 net new Zudio stores in the half year.', 'Retail Insight Network', 'https://www.retail-insight-network.com/newsletters/trent-q2-standalone-revenue-rises-23'),
   ('Soch', 'Tyohaar festive edit 2026: gota jacquard on silk, bandhani on crepe and tissue embroidery, from Rs 3,000.', 'Images BoF', 'https://www.imagesbof.in/soch-unveils-festive-2026-collection-celebrating-indian-craft-traditions/')]},
 {'name': 'UAE & Saudi Arabia', 'region': 'asia', 'events': [
   (D(2026, 11, 27), None, 'White Friday / Black Friday', 'sale', 'Online marketplaces run week-long Friday sales.'),
   (D(2026, 12, 2), None, 'UAE National Day', 'occasion', 'National colours and celebration wear.'),
   (D(2026, 12, 4), D(2027, 1, 17), 'Dubai Shopping Festival', 'sale', '32nd edition: 45 days of offers across the city.'),
   (D(2027, 2, 8), None, 'Ramadan begins (expected)', 'occasion', 'Ramadan and Eid edits: kaftans, abayas, modest occasionwear. Dates depend on moon sighting.'),
   (D(2027, 3, 9), None, 'Eid al-Fitr (expected)', 'occasion', 'The biggest gifting and new-outfit moment of the year.')],
  'brands': [
   ('Apparel Group', 'Adding 25 brands in Saudi Arabia (including Footasylum and FitFlop) and planning 200+ new stores there in 2026.', 'Arab News', 'https://www.arabnews.pk/node/2634112'),
   ('Tarun Tahiliani', 'Closed Dubai Fashion Week SS27 mixing Indian craft with Middle Eastern couture, ahead of a first Dubai store.', 'Gulf News', 'https://gulfnews.com/the-kurator/the-kurators-dubai-fashion-week-ss27-round-up-1.500725939')]},
 {'name': 'Southeast Asia', 'region': 'asia', 'events': [
   (D(2026, 11, 11), None, '11.11 sales', 'sale', 'Marketplace mega-sale across the region.'),
   (D(2026, 12, 12), None, '12.12 sales (Harbolnas in Indonesia)', 'sale', 'Year-end online sale.'),
   (D(2027, 2, 6), None, 'Lunar New Year and Tết', 'occasion', 'Red and gold festive dressing in Singapore, Malaysia and Vietnam.'),
   (D(2027, 2, 8), None, 'Ramadan begins (expected)', 'occasion', 'Modest fashion edits in Indonesia and Malaysia.')],
  'brands': [
   ('Sejauh Mata Memandang', 'Showed loose long dresses and layered sets in ivory and pale pink at Jakarta Fashion Week 2027.', 'CNN Indonesia', 'https://www.cnnindonesia.com/gaya-hidup/20261028083141-277-1420407/motif-kucing-hingga-isu-karhutla-warnai-koleksi-di-jfw-2027')]},
 {'name': 'Brazil', 'region': 'south-america', 'events': [
   (D(2026, 11, 27), None, 'Black Friday', 'sale', 'Brazil\'s biggest retail event; summer collections on promotion.'),
   (D(2026, 12, 31), None, 'Réveillon (New Year\'s Eve)', 'occasion', 'White outfits by tradition; linen and lace.'),
   (D(2027, 2, 5), D(2027, 2, 10), 'Carnival', 'occasion', 'Colour, sequins, swim and festival dressing.')],
  'brands': [
   ('Riachuelo', 'BTG projected the strongest Q3 2026 of the big three: same-store apparel sales +4.7% and higher margins.', 'Mercado&Consumo', 'https://mercadoeconsumo.com.br/13/10/2026/mc-capital/renner-ca-riachuelo-e-vivara-veja-as-projecoes-para-o-varejo-de-moda-no-3o-tri/'),
   ('FARM Rio x Barbour', 'Third collaboration, "Tropical Greenhouse", on sale 30 October 2026: Barbour tartan and banana florals.', 'FashionUnited', 'https://fashionunited.com/news/fashion/inside-barbour-and-farm-rios-tropical-greenhouse-collection/2026102875409')]},
 {'name': 'Mexico', 'region': 'north-america', 'events': [
   (D(2026, 11, 13), D(2026, 11, 17), 'El Buen Fin', 'sale', 'Mexico\'s national sale weekend, 16th edition.'),
   (D(2026, 12, 16), D(2026, 12, 24), 'Posadas and Christmas', 'occasion', 'Festive dressing and gifting.'),
   (D(2027, 1, 6), None, 'Día de Reyes', 'occasion', 'Family celebration and gifting.')],
  'brands': []},
 {'name': 'Nigeria & West Africa', 'region': 'africa', 'events': [
   (D(2026, 11, 27), None, 'Black Friday', 'sale', 'Led by online marketplaces.'),
   (D(2026, 12, 1), D(2026, 12, 31), '"Detty December" in Lagos', 'occasion', 'Concerts, parties and weddings for the diaspora season home.'),
   (D(2026, 12, 25), None, 'Christmas', 'occasion', 'Family gatherings and new outfits.')],
  'brands': [
   ('Atafo', 'Opened the Lagos Fashion Week 2026 runways with tailoring and Aso-Oke.', 'Fashion Police Nigeria', 'https://fashionpoliceng.com/african-fashion/atafo-kick-off-lagos-fashion-week-2026/'),
   ('Ndiiche', 'Named a brand to watch in 2026: repurposed denim and cotton, Igbo culture and inclusive sizing.', 'Marie Claire Nigeria', 'https://marieclaire.ng/?p=43394')]},
 {'name': 'South Africa', 'region': 'africa', 'events': [
   (D(2026, 11, 5), D(2026, 11, 7), 'Soweto Fashion Week', 'fashion', 'Local designer showcase.'),
   (D(2026, 11, 27), None, 'Black Friday', 'sale', 'One of the biggest trading days of the year.'),
   (D(2026, 12, 26), None, 'Boxing Day (Day of Goodwill) sales', 'sale', 'Summer holiday and festive clearance.')],
  'brands': [
   ('Mr Price', 'FY2026 revenue up 4.2% to R42.7bn with operating profit above R6bn; about 180 new stores planned.', 'FilingReader', 'https://filingreader.com/news-wire/johannesburg/2026-06-05/mr-price-revenue-hits-r427bn-as-profit-passes-r6bn-mark')]},
 {'name': 'Australia & New Zealand', 'region': 'oceania', 'events': [
   (D(2026, 11, 3), None, 'Melbourne Cup', 'occasion', 'Racewear: dresses, millinery and tailoring.'),
   (D(2026, 11, 10), D(2026, 11, 20), 'Click Frenzy', 'sale', 'Major online sale; exact 2026 dates to be announced by Click Frenzy.', 'Mid-Nov'),
   (D(2026, 11, 27), None, 'Black Friday', 'sale', 'Now Australia\'s biggest pre-Christmas sale.'),
   (D(2026, 12, 26), None, 'Boxing Day sales', 'sale', 'Summer clearance; swim and resortwear.')],
  'brands': [
   ('Yu Mei', 'The New Zealand leather-goods label opens its first Australian Lounge in Sydney on 31 October 2026.', 'RUSSH', 'https://www.russh.com/fashion-news-october-2026/'),
   ('The Iconic', 'Q1 2026 net merchandise value up 3.5% and active customers up 3.7%, with 50+ new brands added.', 'Pulse', 'https://www.pulse.bot/ecommerce/news/the-iconics-positive-momentum-continues-in-first-quarter-4549e751-bde6-411a-abd3-c9a02f896422/')]},
]

# Forecut colour direction by region (editorial, linked to local occasions and recent runway news). hex, name, use
COLOURS = {
 'asia': [('#b8202e', 'Lunar red', 'Lunar New Year, Diwali and wedding edits'), ('#c99a3b', 'Antique gold', 'Festive trims and metallic thread'),
          ('#3f7f6b', 'Jade', 'Occasion silks and knitwear'), ('#2f6fe0', 'Luminous blue', 'SS27 global colour for daywear'), ('#efe6d4', 'Ivory', 'Modest and Ramadan edits, heat-friendly basics')],
 'europe': [('#2f6fe0', 'Luminous blue', 'SS27 shirting and sheer layers'), ('#f0d98a', 'Butter yellow', 'Knitwear and soft tailoring'),
            ('#a9c4dc', 'Powder blue', 'Organza and appliqué'), ('#4a3326', 'Chocolate', 'Outerwear and leather'), ('#f3f0e8', 'Off-white', 'Broderie and featherlight cotton')],
 'north-america': [('#2f3f6b', 'Deep indigo', 'Y2K and heritage denim'), ('#6e1f2c', 'Burgundy', 'Piped satin and holiday partywear'),
                   ('#b98a5a', 'Camel', 'Equestrian outerwear'), ('#2f6fe0', 'Luminous blue', 'SS27 colour for spring'), ('#efe6d4', 'Cream', 'Knitwear and tailoring')],
 'south-america': [('#f07a1d', 'Carnival orange', 'Carnival and festival dressing'), ('#2f8a57', 'Tropical green', 'Prints and resortwear'),
                   ('#f2c230', 'Sun yellow', 'Swim and summer dresses'), ('#ef6fa7', 'Pop pink', 'SS27 accent'), ('#f6f4ee', 'Réveillon white', 'New Year\'s Eve linen and lace')],
 'africa': [('#b3261e', 'Runway red', 'Seen at Lagos Fashion Week 2026'), ('#6b3f24', 'Earth brown', 'Tailoring and Aso-Oke'),
            ('#23365e', 'Adire indigo', 'Hand-dyed craft'), ('#c99a3b', 'Gold', 'Festive and "Detty December" partywear'), ('#d9c3a0', 'Sand', 'Kaftans and summer layers')],
 'oceania': [('#d9c7a6', 'Coastal sand', 'Linen and resortwear'), ('#8fb8b0', 'Sea glass', 'Swim and summer knits'),
             ('#e05a6a', 'Strawberry', 'Accessories accent'), ('#b7c98f', 'Pistachio', 'Summer dresses'), ('#4a3326', 'Chocolate', 'Leather goods and sandals')],
}


def upcoming(today=None, region=None, limit=None):
    """Events still to come (or running), soonest first: (start, end, name, kind, note, market, date label)."""
    today = today or dt.date.today()
    rows = [(ev[0], ev[1], ev[2], ev[3], ev[4], m['name'], ev[5] if len(ev) > 5 else None) for m in MARKETS if region in (None, m['region'])
            for ev in m['events'] if (ev[1] or ev[0]) >= today]
    rows.sort(key=lambda r: (r[0], r[5]))
    return rows[:limit] if limit else rows


def when(s, e, label=None):
    if label:
        return label
    if e and e != s:
        return f'{s.strftime("%-d %b")} – {e.strftime("%-d %b")}'
    return s.strftime('%-d %b %Y') if s.year != dt.date.today().year else s.strftime('%-d %b')
