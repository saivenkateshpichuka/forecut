"""Forecut colour forecast: key colours, colour stories and department palettes for each season.

Forecut's own reading of public evidence (runway coverage, trade fairs, retail). Each colour is set on a real
Pantone TCX colour (code, official name and reference HEX from pantone_fhi.json), so name, code and HEX always agree.
Forecut names are our own descriptive names. No paid forecasting content is used.

Run:  python3 colour_forecast.py   -> rewrites the palette in seasons.json and writes colour_forecast.json
"""
import json, os
import pantone as P

HERE = os.path.dirname(os.path.abspath(__file__))

# role: core (the base of the range), seasonal (what makes the season new), accent (small, high-impact doses)
S = {
 'aw26': {
  'short': 'Browns and near-blacks, with plum and hot accents',
  'status': 'Confirmed by the runways',
  'headline': 'Browns and near-blacks take over from black, lit by plum, moss and hot accents of tomato red, cobalt and mustard.',
  'built': 'Read from the autumn/winter 2026 shows (January menswear, February and March womenswear) and in-store sell-in. Chocolate was the second most-worn colour on the womenswear runways after black, charcoal and pine green grew the most, and plum, moss, tomato red and mustard were the colours reviewers singled out.',
  'key': [
   ('Chocolate', '#4a3326', 'core', 'The new dark neutral. Coats, tailoring, leather and suede.'),
   ('Charcoal', '#3d3f44', 'core', 'Softer than black for tailoring and knits; the fastest-growing dark on the runways.'),
   ('Midnight', '#1f2638', 'core', 'A near-black blue for coats and evening.'),
   ('Cloud white', '#efeee8', 'core', 'Winter whites: knits, shirting and the light partner to every dark.'),
   ('Plum', '#4f2a46', 'seasonal', 'The season\'s alternative to black and burgundy, in velvet, satin and knit.'),
   ('Moss', '#6b6a3c', 'seasonal', 'Olive-to-moss greens in tailoring, outerwear and knits.'),
   ('Tomato red', '#c4392d', 'accent', 'Leather coats, single statement pieces and shoes.'),
   ('Mustard', '#d4a62a', 'accent', 'A warm yellow for knits and accessories.'),
   ('Cobalt', '#1f4cb5', 'accent', 'Saturated blue for outerwear and shoes.'),
   ('Bubblegum', '#e7a1c0', 'accent', 'Soft pink tailoring and knits against browns.'),
  ],
  'stories': [
   ('Dark matter', 'Browns, charcoal and midnight replace head-to-toe black. Tone on tone, with texture doing the work: brushed wool, suede, velvet.', ['Chocolate', 'Charcoal', 'Midnight', 'Cloud white'], 'Coats, tailoring, knitwear, leather goods'),
   ('Old masters', 'Rich, painterly plum and moss with mustard as the light. Grown-up colour for velvet, satin and heavy knits.', ['Plum', 'Moss', 'Mustard', 'Chocolate'], 'Eveningwear, knits, tailoring'),
   ('Hot spots', 'Single saturated pieces against dark neutrals: a tomato-red leather coat, a cobalt shoe, a bubblegum blazer.', ['Tomato red', 'Cobalt', 'Bubblegum', 'Charcoal'], 'Outerwear, shoes, bags, statement pieces'),
  ],
  'dept': {
   'womenswear': ('Chocolate and plum lead, with bubblegum, tomato red and butter-warm mustard as the colour.', ['Chocolate', 'Plum', 'Bubblegum', 'Tomato red', 'Mustard', 'Cloud white']),
   'menswear': ('Charcoal, midnight and chocolate tailoring, moss for outerwear, and a single crimson or cobalt piece.', ['Charcoal', 'Midnight', 'Chocolate', 'Moss', ('Crimson', '#9b1b2a'), 'Cobalt']),
   'kidswear': ('Checks and colour-blocking in deep navy and cherry, warmed with mustard, moss and a soft mauve.', [('Navy', '#1f2a44'), ('Cherry', '#b3202f'), 'Mustard', 'Moss', ('Mauve', '#b08aa6'), ('Oatmeal', '#d8ccb6')]),
   'footwear': ('Brown suede is the shoe of the season, with bordeaux the strongest accent and cobalt for the brave.', [('Brown suede', '#5c3d2a'), ('Bordeaux', '#5e1a28'), ('Butterscotch', '#c08a3e'), ('Anthracite', '#3a3b3e'), 'Cobalt', 'Tomato red']),
  },
  'sources': [('Runway colour share, Fall 2026 womenswear (tfashion)', 'https://tfashion.ai/runway/fw26/colors'), ('Marie Claire: Fall 2026 colour trends', 'https://www.marieclaire.com/fashion/fall-2026-color-trends/'),
              ('Who What Wear: autumn 2026 colour trends', 'https://www.whowhatwear.com/fashion/fall/autumn-fashion-colour-trends-2026'), ('Who What Wear: autumn 2026 shoe colours', 'https://www.whowhatwear.com/fashion/shoes/autumn-shoe-colour-trends-2026'),
              ('Pitti Bimbo 102, AW26 kidswear', 'https://bimbo.pittimmagine.com/it/news/pitti-bimbo-102-a-top-edition')],
 },
 'ss27': {
  'short': 'Purple, true red and Klein blue over sun-faded neutrals',
  'status': 'Confirmed by the runways',
  'headline': 'Colour comes back in full: purple and lilac, head-to-toe red and Klein blue over sun-faded whites, sand and tobacco.',
  'built': 'Read from the spring/summer 2027 shows (June menswear and Pitti Uomo, September womenswear) and the Première Vision February fabric fair. White rose the most on the runways; purple was the most reported colour in New York; red returned head to toe; menswear moved to butter yellow, lavender, pink and ice blue over earth tones.',
  'key': [
   ('Optic white', '#f1f0ea', 'core', 'Crisp white for shirting, linen and tailoring; the biggest riser on the runways.'),
   ('Sand', '#d6c2a3', 'core', 'Sun-faded neutral for linen suits, knits and outerwear.'),
   ('Tobacco', '#6b4a2f', 'core', 'Warm brown that replaces black in summer tailoring and leather.'),
   ('Midnight', '#212b45', 'core', 'Deep blue for tailoring and denim.'),
   ('Lilac', '#b9a3d3', 'seasonal', 'Soft purple for dresses, knits and relaxed workwear.'),
   ('Violet', '#5e3a8c', 'seasonal', 'Saturated purple for statement pieces, leather and evening.'),
   ('True red', '#c8102e', 'seasonal', 'Worn head to toe, not just as a pop.'),
   ('Butter', '#f1dd8f', 'seasonal', 'Soft yellow for knits, shirting and menswear polos.'),
   ('Klein blue', '#1e3fb4', 'accent', 'Intense ultramarine for single statement pieces.'),
   ('Grass green', '#5f9e4d', 'accent', 'A living green for knits, prints and swim.'),
  ],
  'stories': [
   ('Sun-faded', 'Whites, sand, tobacco and ice blue, as if bleached by summer. Linen, cotton and soft tailoring.', ['Optic white', 'Sand', 'Tobacco', ('Ice blue', '#c6dbe6')], 'Tailoring, shirting, linen, menswear'),
   ('Purple reign', 'From lilac to violet, the season\'s most talked-about colour, paired with butter for an unexpected summer mix.', ['Lilac', 'Violet', 'Butter', 'Optic white'], 'Dresses, knits, leather, evening'),
   ('Full colour', 'Red, Klein blue and lemon worn head to toe. Primary colour without prints.', ['True red', 'Klein blue', ('Lemon', '#efe05a'), 'Midnight'], 'Statement dresses, outerwear, shoes'),
   ('Living green', 'Grass green and teal from nature and the pool: summer knits, swim and prints.', ['Grass green', ('Teal', '#1c7d80'), 'Sand', 'Butter'], 'Swim, knits, prints, kidswear'),
  ],
  'dept': {
   'womenswear': ('Lilac and violet lead, with true red and Klein blue for statement pieces and butter for softness.', ['Lilac', 'Violet', 'True red', 'Klein blue', 'Butter', 'Optic white']),
   'menswear': ('Sun-faded earth tones and linen, ice blue as the new shirt colour, with butter, lavender, salmon pink and red pops.', ['Sand', 'Tobacco', ('Ice blue', '#c6dbe6'), 'Butter', ('Salmon pink', '#e99b85'), ('Rust', '#a5502c')]),
   'kidswear': ('Pool brights over sandy neutrals: lemon, aqua, grass green and coral, with lavender for the softer side.', [('Lemon', '#efe05a'), ('Aqua', '#5cc1c6'), 'Grass green', ('Coral', '#ef7c63'), ('Lavender', '#c5b6dd'), 'Sand']),
   'footwear': ('Sandy suedes and natural tones, sea and sky blues, lemon and green reptile effects, and red for heels.', [('Sand suede', '#cdb48f'), ('Sea blue', '#2b6f9e'), ('Sky blue', '#9cc6e4'), ('Lemon', '#efe05a'), ('Reptile green', '#5c7d3f'), 'True red']),
  },
  'sources': [('Refinery29: NYFW spring/summer 2027 colour', 'https://www.refinery29.com/en-us/new-york-fashion-week-spring-summer-2027-color-trends'), ('Runway colour share, Spring 2027 (tfashion)', 'https://tfashion.ai/runway/ss27/colors'),
              ('The Impression: Spring 2027 colour forecast', 'https://theimpression.com/?p=12070953'), ('Première Vision: key colours SS27', 'https://www.premierevision.com/en/articles/2a0d1f83-bafa-f011-832e-000d3a43e2d8/key-colors-for-spring-summer-2027-meaningful-shades'),
              ('FashionUnited: Pitti Uomo 110', 'https://fashionunited.com/news/fairs/pitti-uomo-110-loud-beats-quiet-collections/2026061973088'), ('International Leather Maker: SS27 leather colours', 'https://internationalleathermaker.com/spring-summer-2027-sees-wearing-and-living-leather-trends/')],
 },
 'aw27': {
  'short': 'Violet, plum and bordeaux replace black',
  'status': 'Trade-fair signals; runways in February and March 2027',
  'headline': 'Violet, plum and tannic bordeaux replace black, over neutrals that are no longer neutral: tinted off-blacks, mushroom beige and greyed blue.',
  'built': 'Read from the September 2026 fabric and leather fairs (Première Vision, Lineapelle, Milano Unica) and carried forward from the SS27 runways. The fairs put deep violet, plums, dusty pinks and mauves at the centre, with tinted off-blacks, greyish blues, sage and waxy ochre.',
  'key': [
   ('Tinted black', '#26222b', 'core', 'An off-black with a violet cast, instead of pure black.'),
   ('Mushroom', '#c9bba4', 'core', 'A living beige for knits, coats and leather.'),
   ('Greyed blue', '#6c7d8c', 'core', 'Grey turned blue: tailoring, denim, outerwear.'),
   ('Copper khaki', '#8a6a45', 'core', 'Khaki leaning to taupe and copper for utility and menswear.'),
   ('Deep violet', '#4a2a6a', 'seasonal', 'The key colour of the season, from coats to knits.'),
   ('Tannic bordeaux', '#5c1f2c', 'seasonal', 'A deep red-brown alternative to black.'),
   ('Dusty mauve', '#a88596', 'seasonal', 'Soft, smoky pink-purple, now gender-neutral.'),
   ('Waxy ochre', '#c49a3c', 'accent', 'A painterly yellow-ochre as the light in dark ranges.'),
   ('Sage', '#a2ad8d', 'accent', 'A light green replacing tinted greys.'),
   ('Silicone pink', '#e7b9bf', 'accent', 'A soft, slightly artificial pink for knits and accessories.'),
  ],
  'stories': [
   ('Painted by time', 'Plums, bordeaux and waxy ochre, softened as if by an old varnish. Velvet, brushed wool and patinated leather.', ['Deep violet', 'Tannic bordeaux', 'Waxy ochre', 'Tinted black'], 'Coats, eveningwear, leather, knits'),
   ('New neutrals', 'Neutrals with colour inside: off-black, mushroom, greyed blue and copper khaki.', ['Tinted black', 'Mushroom', 'Greyed blue', 'Copper khaki'], 'Tailoring, outerwear, menswear, denim'),
   ('Pink for all', 'Dusty mauve and silicone pink move into menswear and tailoring, not only knits.', ['Dusty mauve', 'Silicone pink', 'Mushroom', 'Deep violet'], 'Knits, shirting, tailoring, accessories'),
   ('Living green', 'Sage and moss from regenerative materials and the outdoors.', ['Sage', ('Moss', '#6b6a3c'), 'Copper khaki', 'Mushroom'], 'Outerwear, knits, kidswear'),
  ],
  'dept': {
   'womenswear': ('Deep violet and tannic bordeaux lead, softened by dusty mauve and silicone pink, with waxy ochre as the light.', ['Deep violet', 'Tannic bordeaux', 'Dusty mauve', 'Silicone pink', 'Waxy ochre', 'Mushroom']),
   'menswear': ('Tinted black, greyed blue and copper khaki for tailoring and outerwear, with dusky violet for a younger customer.', ['Tinted black', 'Greyed blue', 'Copper khaki', ('Dusky violet', '#6a5578'), 'Tannic bordeaux', 'Sage']),
   'kidswear': ('Plum and ochre with sage and dusty pink, grounded in greyed blue and oat. Forecut projection until the January 2027 kidswear fairs.', [('Plum', '#5a2f50'), 'Waxy ochre', 'Sage', 'Dusty mauve', 'Greyed blue', ('Oat', '#d9cdb5')]),
   'footwear': ('Bordeaux and copper-brown leathers, tinted black, and violet suede for the statement boot.', ['Tannic bordeaux', ('Copper brown', '#7a4a2c'), 'Tinted black', ('Violet suede', '#5d4479'), 'Waxy ochre', 'Mushroom']),
  },
  'sources': [('FashionUnited: Première Vision AW27/28 trends', 'https://fashionunited.com/news/fairs/premiere-vision-paris-what-fabrics-reveal-about-aw27-28-trends/2026090474424'), ('Heuritech: Première Vision FW27-28', 'https://heuritech.com/articles/premiere-vision-fall-winter-27-28/'),
              ('Première Vision: AW27-28 colour preview', 'https://www.premierevision.com/articles/fbd142fa-b23c-f111-8ef3-000d3a4af15b/aw-27-28-color-preview-a-color-shaped-by-time'), ('2C Magazine: AW27-28 fairs', 'https://www.2cmag.com/en/trend/')],
 },
 'ss28': {
  'short': 'Royal blue, turquoise and greyish mauve',
  'status': 'Long-range forecast from early fair previews',
  'headline': 'Blues come back strong, royal and a new turquoise, beside greyish mauve and violet, over straw and bleached linen, with an after-dark edge of inky blue and murky green.',
  'built': 'A long-range Forecut forecast from the first SS28 previews: Première Vision\'s October 2026 colour preview (royal blue, deeper sky blue, a new turquoise, greyish mauve and a dense violet), fabric-fair womenswear previews (straw, khaki green, warm beige, peach) and a darker after-dusk summer mood. It will be updated after the February 2027 fairs.',
  'key': [
   ('Bleached linen', '#ebe4d6', 'core', 'A warm off-white base for summer.'),
   ('Straw', '#d6c088', 'core', 'Natural straw yellow for linen, raffia and knits.'),
   ('Inky blue', '#1f2a48', 'core', 'A blue so dark it reads as black: summer\'s new dark.'),
   ('Khaki green', '#7f7f52', 'core', 'A muted vegetal green for utility and menswear.'),
   ('Royal blue', '#3651b3', 'seasonal', 'Back and brighter, slightly softened.'),
   ('Sonar turquoise', '#3fa0a3', 'seasonal', 'A softened turquoise between ocean and digital.'),
   ('Greyish mauve', '#b6a3b6', 'seasonal', 'A light, atmospheric mauve.'),
   ('Magnetic violet', '#4a3196', 'accent', 'A dense, bluish violet for contrast.'),
   ('Peach', '#f0b496', 'accent', 'A soft warm accent for knits and dresses.'),
   ('Acid lemon', '#e2e04d', 'accent', 'A sharp yellow to light up the dark mood.'),
  ],
  'stories': [
   ('Blue hour', 'Royal blue, sonar turquoise and inky blue: summer blues with real pigment.', ['Royal blue', 'Sonar turquoise', 'Inky blue', 'Bleached linen'], 'Shirting, denim, swim, tailoring'),
   ('Atmosphere', 'Greyish mauve and magnetic violet, soft and hazy against bleached linen.', ['Greyish mauve', 'Magnetic violet', 'Bleached linen', 'Peach'], 'Dresses, knits, evening'),
   ('Vegetal', 'Straw, khaki green and warm beige for natural fibres and crafted surfaces.', ['Straw', 'Khaki green', 'Bleached linen', ('Warm beige', '#cdb593')], 'Linen, crochet, menswear, accessories'),
   ('After dusk', 'Summer goes dark: inky blue and murky green with an acid lemon spark.', ['Inky blue', ('Murky green', '#4f5a3a'), 'Acid lemon', 'Magnetic violet'], 'Evening, statement pieces, footwear'),
  ],
  'dept': {
   'womenswear': ('Royal blue and greyish mauve lead, with magnetic violet and peach, over straw and linen.', ['Royal blue', 'Greyish mauve', 'Magnetic violet', 'Peach', 'Straw', 'Bleached linen']),
   'menswear': ('Inky blue and khaki green tailoring, deeper sky-blue shirting and sonar turquoise for summer pieces.', ['Inky blue', 'Khaki green', ('Deep sky', '#6fa3cf'), 'Sonar turquoise', 'Straw', 'Bleached linen']),
   'kidswear': ('Sonar turquoise and acid lemon brights with peach and sky, on linen bases. Forecut projection.', ['Sonar turquoise', 'Acid lemon', 'Peach', ('Deep sky', '#6fa3cf'), 'Greyish mauve', 'Bleached linen']),
   'footwear': ('Natural straw and raffia, khaki and inky leathers, with royal blue and violet suede accents.', [('Raffia', '#cdb27a'), 'Khaki green', 'Inky blue', 'Royal blue', ('Violet suede', '#5d4479'), 'Bleached linen']),
  },
  'sources': [('Première Vision: SS28 colour preview', 'https://www.premierevision.com/en/articles/8f0a0d9f-e9cd-f111-bf5b-6045bd889b2a/ss28-color-preview-toward-a-new-chromatic-fluidity'), ('FashionUnited: After Dusk, SS28', 'https://fashionunited.uk/news/fashion/after-dusk-why-spring-summer-2028-is-going-dark/2026103091103'),
              ('Italtex: Vegetal Hues SS28', 'https://italtextrends.com/blogs/latest-trends/vegetal-hues-natural-colours-and-lightweight-fabrics-for-ss-2028')],
 },
 'aw28': {
  'short': 'Ink, mulberry and bottle green',
  'status': 'Long-range Forecut projection',
  'headline': 'Winter deepens the SS28 blues and violets: ink, mulberry and bottle green over oat and slate, with petrol teal and vermilion as accents.',
  'built': 'A long-range Forecut projection. It carries the AW27 move away from black and the SS28 return of strong blues and violets into winter. No AW28 fabric fair has taken place yet; it will be refined after the September 2027 fairs.',
  'key': [
   ('Ink', '#1d2236', 'core', 'Deep ink blue as the winter dark.'),
   ('Oat', '#d8ccb4', 'core', 'A warm, undyed-wool neutral.'),
   ('Slate', '#55606b', 'core', 'Blue-grey for tailoring and outerwear.'),
   ('Cocoa', '#5a3e30', 'core', 'A softer brown carried on from AW26 and AW27.'),
   ('Mulberry', '#6a2449', 'seasonal', 'A berry purple between violet and bordeaux.'),
   ('Bottle green', '#1f4a38', 'seasonal', 'A deep green for coats and knits.'),
   ('Antique gold', '#b48a3a', 'seasonal', 'Ochre deepened into gold for knits and trims.'),
   ('Petrol teal', '#1f5c66', 'accent', 'The SS28 turquoise, deepened for winter.'),
   ('Vermilion', '#c8402c', 'accent', 'A warm red for single statement pieces.'),
   ('Lavender grey', '#a59bb4', 'accent', 'A pale violet-grey to lighten dark ranges.'),
  ],
  'stories': [
   ('Night blues', 'Ink, slate and petrol teal: blue as the new winter neutral.', ['Ink', 'Slate', 'Petrol teal', 'Oat'], 'Tailoring, outerwear, denim'),
   ('Berry and gold', 'Mulberry and antique gold, rich and warm for evening and knits.', ['Mulberry', 'Antique gold', 'Cocoa', 'Oat'], 'Evening, knits, accessories'),
   ('Deep forest', 'Bottle green with cocoa and oat: outdoor tailoring and heavy knits.', ['Bottle green', 'Cocoa', 'Oat', 'Vermilion'], 'Outerwear, knits, menswear'),
  ],
  'dept': {
   'womenswear': ('Mulberry and ink lead, with antique gold, lavender grey and a vermilion statement.', ['Mulberry', 'Ink', 'Antique gold', 'Lavender grey', 'Vermilion', 'Oat']),
   'menswear': ('Ink, slate and bottle green tailoring, cocoa knits and petrol teal outerwear.', ['Ink', 'Slate', 'Bottle green', 'Cocoa', 'Petrol teal', 'Oat']),
   'kidswear': ('Bottle green, mulberry and vermilion with gold and oat. Forecut projection.', ['Bottle green', 'Mulberry', 'Vermilion', 'Antique gold', 'Petrol teal', 'Oat']),
   'footwear': ('Ink and cocoa leathers, mulberry suede and bottle-green boots.', ['Ink', 'Cocoa', 'Mulberry', 'Bottle green', 'Slate', 'Antique gold']),
  },
  'sources': [],
 },
}

DEPTS = [('womenswear', 'Womenswear'), ('menswear', 'Menswear'), ('kidswear', 'Kidswear'), ('footwear', 'Footwear')]
ROLE = {'core': 'Core', 'seasonal': 'Seasonal', 'accent': 'Accent'}


def snap(hx):
    """Nearest real Pantone TCX: (code, official name, reference hex)."""
    code, name, _ = P.nearest(hx)
    c = code.replace(' TCX', '')
    nm, h = P._D[c]
    return f'{c} TCX', nm.replace('-', ' ').title(), '#' + h.lower()


def colour(name, hx, role='', note=''):
    code, pname, phex = snap(hx)
    return {'name': name, 'hex': phex, 'tcx': code, 'pantone': pname, 'role': role, 'note': note}


def build():
    out = {}
    for s, d in S.items():
        key = [colour(n, h, r, t) for n, h, r, t in d['key']]
        K = {c['name']: c for c in key}

        def res(x):
            return K[x] if isinstance(x, str) else colour(x[0], x[1])
        out[s] = {
            'short': d['short'], 'status': d['status'], 'headline': d['headline'], 'built': d['built'], 'key': key,
            'stories': [{'title': t, 'text': tx, 'colours': [res(x) for x in cs], 'use': u} for t, tx, cs, u in d['stories']],
            'dept': {k: {'title': lbl, 'text': d['dept'][k][0], 'colours': [res(x) for x in d['dept'][k][1]]} for k, lbl in DEPTS},
            'sources': d['sources'],
        }
    return out


def main():
    cf = build()
    json.dump(cf, open(os.path.join(HERE, 'colour_forecast.json'), 'w'), indent=1, ensure_ascii=False)
    sp = os.path.join(HERE, 'seasons.json')
    sd = json.load(open(sp))
    for s, c in cf.items():
        key = c['key']
        order = [x for x in key if x['role'] == 'seasonal'][:3] + [x for x in key if x['role'] == 'core'][:2] + [x for x in key if x['role'] == 'accent'][:2]
        sd['meta'][s]['palette'] = [[x['hex'], x['name']] for x in order]
    json.dump(sd, open(sp, 'w'), indent=1, ensure_ascii=False)
    for s, c in cf.items():
        print(s, ', '.join(f"{x['name']} {x['tcx']} {x['pantone']} {x['hex']}" for x in c['key']))


if __name__ == '__main__':
    main()
