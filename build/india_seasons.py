"""Original, dated India editorial forecasts; no automatic future lifecycle ageing.
Future status is a qualitative Forecut assessment, never observed market share.
"""
import json
from pathlib import Path
RESEARCH = json.loads(Path(__file__).with_name('india_research.json').read_text())
# Explicit seasonal reassessments: retain the published Festive 26 classification.
# Lightweight summer basics recur; ornate winter surfaces are seasonal, not obsolete.
REASSESS = {
 'Linen kurta sets': 'rprp', 'Light organza lehengas': 'rprp',
 'Pastel handloom sarees': 'rprp', 'Breezy resort dresses': 'rprp',
 'Chikankari': 'rprp', 'Block print': 'prpr', 'Linen': 'prpr',
 'Handspun khadi': 'rrrr', 'Jamdani': 'rrrr', 'Cotton silk': 'pppp',
 'Tone-on-tone embroidery': 'rrrr', 'Kantha': 'rrrr',
 'Reworked vintage Banarasi': 'eeee', 'Natural-dyed fabrics': 'rrrr',
 'Velvet bandhgalas': 'fpfp', 'Banarasi brocade': 'rprp',
 'Tissue': 'rprp', 'Bandhani': 'rrrr', 'Potli bags': 'rprp',
 'Wide lasts for Indian feet': 'rrrr', 'Straight trousers over churidars': 'rrrr',
 'Kurta-shirt hybrids': 'rrrr', 'Angrakha wrap kurtas': 'rrrr',
 'All-over heavy sequins': 'ffff', 'Collared shirt blouses': 'rrrr',
}
# These are original development propositions, not claims that named brands made them.
# Four first tracked in each future window; sketch aliases are illustration references.
NEW = [
 ("Women's Ethnic",'Suits & kurtas','Airy kurta separates with opacity-tested inners','Construction','Separate inner and loose outer layers for coverage with less bulk. Test opacity, shrinkage and seam stability.','-errp','Straight kurta with band collar'),
 ('Indo-Western','Summer layers','Adjustable light draped separates','Closure','Trial secure ties and adjustable drape for seated and walking comfort. Keep styling instructions clear.','-errp','Draped dhoti skirts'),
 ('Embroidery & Surface','Craft accents','Crochet-edged summer shirts','Surface','Small crochet accents on breathable shirts; approve repeatability and wash recovery before scaling.','-errr','Collared shirt blouses'),
 ("Men's Ethnic",'Summer tailoring','Half-lined textured Nehru layers','Construction','Light textured cloth with reduced lining bulk; check collar recovery and perspiration marks.','-errp','Brocade and Chanderi Nehru jackets'),
 ("Women's Ethnic",'Lehengas','Pocketed light occasion skirts','Construction','A lighter wedding-guest skirt with supported pockets and an independently wearable top. Check pocket distortion.','--err','Light organza lehengas'),
 ("Men's Ethnic",'Occasion construction','Secure draped occasion stoles','Closure','Develop unobtrusive original fastening solutions for free movement; stress-test closures and skin contact.','--err','Fluid draped menswear'),
 ('Embroidery & Surface','Placed ornament','Controlled metallic-cord accents','Surface','Small placed reflective details, limited to premium trials. Check weight, abrasion, repair and humidity exposure.','--eer','Tone-on-tone embroidery'),
 ('Trims & Accessories','Occasion layers','Detachable festive cape panels','Layer','Trial a removable occasion layer with discreet, durable attachment points and clear care instructions.','--err','Cape lehengas'),
 ('Indo-Western','Wardrobe systems','Modular travel kurta sets','Construction','Summer 28 hypothesis: compatible separates with useful adjustment. Validate through paid customer pilots in 2027.','---er','Kurta-shirt hybrids'),
 ('Trims & Accessories','Aftercare','Replaceable ties and spare trim kits','Construction','Summer 28 hypothesis: documented repair components supplied with selected products. Cost the service before promising it.','---er','Potli and fabric-covered buttons'),
 ('Fabrics & Weaves','Sourcing trials','Traceable lightweight blend trials','Fabric','Summer 28 hypothesis: test light blends with supplier composition and origin records. Certification does not replace performance testing.','---er','Linen'),
 ('Indian Footwear','Comfort development','Serviceable occasion-flat components','Construction','Summer 28 hypothesis: explore replaceable parts with footwear suppliers; safety, adhesion and flex tests come before scale.','---ee','Kolhapuri chappals'),
 ("Women's Ethnic",'Rewear systems','Reconfigurable saree occasion layers','Layer','Festive 28 hypothesis: refresh an existing saree with an independent layer. Validate attachment security and fit.','----e','Sarees with belts and jackets'),
 ('Trims & Accessories','Repairable ornament','Removable occasion embellishment panels','Construction','Festive 28 hypothesis: separate fragile ornament for storage and servicing. Test snagging and care economics.','----e','Scalloped and cutwork borders'),
 ("Men's Ethnic",'Rewear systems','Reversible light occasion waistcoats','Construction','Festive 28 hypothesis: two useful faces with stable seams and unobtrusive labels. Validate demand before booking cloth.','----e','Contrast-piped Nehru jackets'),
 ('Embroidery & Surface','Craft development','Maker-attributed placed craft capsules','Surface','Festive 28 hypothesis: a limited range built with a named craft partner. Confirm origin, labour cost and capacity before claims.','----e','Kantha'),
]
def apply(I):
    original = {x[2]: x for x in I.D}
    assert set(REASSESS) <= set(original)
    I.D = [x[:5] + (x[5][0]+REASSESS[x[2]],) + x[6:] if x[2] in REASSESS else x for x in I.D]
    I.D.extend(NEW)
    for code, report in RESEARCH['seasons'].items():
        I.SEASON_INFO[code]['focus'] = report['focus']
        I.SEASON_INFO[code]['colours'] = [h for h,n in report['palette'][:4]]
        I.SEASON_INFO[code]['plan'] = report['plan'][0][0]+': '+report['plan'][0][1]
    # Eid merchandising belongs in a verified local calendar, not a fixed Mar–Jul assumption.
    for code in ('Summer 27','Summer 28'):
        I.SEASON_INFO[code]['occasions']='Holi, summer weddings and resort travel; validate Eid timing separately'
        I.WINDOWS[code] = I.WINDOWS[code].replace('Holi, Eid, summer weddings','Holi, summer weddings')
    return original
