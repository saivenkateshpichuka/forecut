"""Map Forecut details (global details.json + India india_data) to pattern-maker presets.
Each result: [detail name, category label, gender, garment id, {option overrides}]. Only construction and garment details that the
pattern maker can draft are mapped; fabrics, prints, footwear, hardware and accessories are left out."""
import json, re
import india_data as I

M = json.load(open('details.json'))['model']

# (pattern, garment-hint or None, options) - first matching rule per group wins; groups combine.
GARMENT = [(r'\bt-?shirts?\b|\btees?\b', 'tshirt'), (r'hood(ie|ed)|sweatshirt', 'hoodie'), (r'saree blouse|\bblouses?\b.*saree|choli', 'blouse'),
           (r'kurta|kurti|anarkali|tunic|kaftan', 'kurta'), (r'lehenga|ghagra|kalidar', 'lehenga'), (r'nehru|bandhgala|waistcoat|sadri|\bvests?\b|gilet', 'jacket'), (r'\bpolos?\b', 'tshirt'),
           (r'shirt dress|frock|\bdress(es)?\b|gown', 'dress'), (r'\bskirts?\b', 'skirt'), (r'trouser|\bpants?\b|jeans|palazzo|sharara|salwar|churidar|jogger|chino|cargo|shorts|culotte', 'trousers'),
           (r'\bshirts?\b|overshirt', 'shirt'), (r'\btops?\b|blouse|camisole|peplum|bodice|corset', 'top')]
OPTS = [
    (r'band[- ]collar|mandarin|grandad|nehru collar|stand collar|chinese collar', {'collar': 'band'}),
    (r'camp collar|cuban|resort collar|revere|convertible collar', {'collar': 'camp'}),
    (r'peter pan', {'collar': 'peterpan'}),
    (r'point collar|spread collar|button-down|shirt collar|contrast collar', {'collar': 'shirt'}),
    (r'v-neck|v neck|plunge', {'neck': 'v'}), (r'boat neck|bateau', {'neck': 'boat'}), (r'square neck', {'neck': 'square'}), (r'crew neck|crewneck', {'neck': 'crew'}),
    (r'scoop|deep neck|sweetheart|u-neck', {'neck': 'deep'}),
    (r'puff|balloon sleeve|bishop|leg-of-mutton|gathered sleeve', {'sleeve': 'puff'}), (r'bell sleeve|flare[d]? sleeve|flute', {'sleeve': 'bell'}), (r'cap sleeve', {'sleeve': 'cap', 'slen': 'cap'}),
    (r'sleeveless|tank|halter|strappy', {'sleeve': 'none'}), (r'three-quarter|3/4', {'slen': '3q'}), (r'short[- ]sleeve', {'slen': 'short'}), (r'long[- ]sleeve|full sleeve', {'slen': 'full'}),
    (r'drop(ped)?[- ]shoulder|oversized|boxy', {'drop': 6}), (r'peplum', {'peplum': '1'}),
    (r'double[- ]pocket|two pockets|twin pocket', {'pockets': '2'}), (r'patch pocket|chest pocket|utility pocket', {'pockets': '1'}), (r'cargo', {'cargo': '1'}),
    (r'curved hem|shirt-tail|shirttail', {'hem': 'curved'}), (r'straight hem|boxy', {'hem': 'straight'}),
    (r'side slit|slit', {'slit': 30}), (r'flare|a-line', {'flare': 6}),
    (r'wide[- ]leg', {'leg': 'wide'}), (r'palazzo|sharara', {'leg': 'palazzo', 'wtype': 'elastic'}), (r'barrel|horseshoe|curved leg|balloon leg', {'leg': 'barrel'}),
    (r'taper|slim|carrot|cigarette', {'leg': 'tapered'}), (r'straight[- ]leg', {'leg': 'straight'}), (r'jogger', {'leg': 'jogger', 'wtype': 'elastic'}),
    (r'drawstring|elastic', {'wtype': 'elastic'}), (r'shorts|bermuda', {'leg': 'shorts'}),
    (r'pencil|straight skirt|column skirt', {'skirt': 'straight'}), (r'a-line skirt', {'skirt': 'aline'}), (r'circle skirt|full skirt|skater|godet', {'skirt': 'circle'}),
    (r'tiered|gathered|dirndl|ruffle skirt', {'skirt': 'gathered'}), (r'panel(led)? skirt|kali', {'skirt': 'panels'}),
    (r'midi', {'slen2': 75}), (r'maxi|floor', {'slen2': 100}), (r'mini', {'slen2': 45}), (r'deep back|backless|low back', {'back': 'deepU'}), (r'shift dress', {'dress': 'shift'}),
    (r'yoke', {'yoke': '1'}), (r'hood', {'hood': '1'}), (r'calf[- ]length|long kurta|floor-length', {'len': 120}),
]
AREAS_OK = {'Collar', 'Shape', 'Garment', 'Waist', 'Closure', 'Pocket', 'Neckline', 'Hem', 'Sleeve', 'Seam', 'Front', 'Panel', 'Pleat', 'Length', 'Shoulder', 'Placket', 'Lapel',
            'Silhouette', 'Detail', 'Leg', 'Cuff', 'Bodice', 'Back', 'Edge', 'Cut', 'Construction', 'Yoke', 'Layer'}
CAT_GARMENT = {'Dresses': 'dress', 'Tops & Shirts': 'top', 'Trousers & Skirts': 'trousers', 'Denim': 'trousers', 'Shirts & Polos': 'shirt', 'Trousers': 'trousers',
               'Coats & Jackets': None, 'Outerwear': None, 'Knitwear': None, 'Tailoring': None}
GARMENT_RX = {g: rx for rx, g in GARMENT}
import tools_pm_garments as GG  # gender availability per garment (kept in sync with pm_engine.js)


EXCL = r'\bcapes?\b|\bcoats?\b|blazer|trench|parka|puffer|bomber|anorak|\bjackets?\b|tuxedo|\bsuits?\b|cardigan|sweater|jumper|knit|corset|bustier|jumpsuit|overall|wrap|kimono|raglan|bias|ruch|drape|pleated|smock|shir|tier|ruffle|fringe|lace|sheer|leather|velvet|denim jacket|outerwear|zip|off-shoulder|one-shoulder|cold-shoulder|asymmetric|cowl|dhoti|co-ord'


def preset(text, gender, cat_hint, name=''):
    t = text.lower(); n = name.lower(); g = None
    for rx, gid in GARMENT:
        if re.search(rx, n): g = gid; break
    if not g and not re.search(EXCL, n):
        for rx, gid in GARMENT:
            if re.search(rx, t): g = gid; break
    if re.search(EXCL, n) and not (g == 'jacket' and re.search(r'nehru|bandhgala|waistcoat|sadri|vest', n) and 'knit' not in n) and not (g and re.search(GARMENT_RX[g], n) and not re.search(r'\bjackets?\b|\bcoats?\b|blazer|\bcapes?\b', n) and re.search(r'tier|ruffle|pleated', n)):
        return None
    g = g or cat_hint
    if not g or gender not in GG.AVAIL[g]: return None
    o = {}
    for rx, add in OPTS:
        if re.search(rx, t):
            for k, v in add.items(): o.setdefault(k, v)
    o = {k: v for k, v in o.items() if k in GG.OPTS[g]}
    if g == 'shirt' and o.get('collar') in ('peterpan',): o.pop('collar')
    if g in ('kurta',) and o.get('collar') not in (None, 'band'): o.pop('collar', None)
    if g in ('top', 'dress') and o.get('collar') in ('shirt', 'camp'): o.pop('collar')
    return g, o


def build():
    out, seen = [], set()
    for key, items in M.items():
        dept, cat = key.split('|')
        if dept == 'Footwear': continue
        gender = 'women' if dept == 'Womenswear' else 'men'
        for x in items:
            if x['area'] not in AREAS_OK: continue
            r = preset(x['name'] + ' ' + x['note'], gender, CAT_GARMENT.get(cat), x['name'])
            if not r or x['name'] in seen: continue
            seen.add(x['name']); out.append([x['name'], dept + ' · ' + cat, gender, r[0], r[1]])
    for row in I.D:
        dept, cat, name, area, note = row[0], row[1], row[2], row[3], row[4]
        if 'Footwear' in dept or 'Accessor' in dept or area not in AREAS_OK: continue
        dc = dept + ' ' + cat
        gender = 'kids' if 'Kid' in dc else 'unisex' if 'Unisex' in dc else 'men' if re.search(r"\bMen", dc) else 'women'
        r = preset(name + ' ' + note + ' ' + cat, gender, {'Lehengas': 'lehenga'}.get(cat), name)
        if not r or name in seen: continue
        seen.add(name); out.append([name, 'India · ' + cat, gender, r[0], r[1]])
    return out


if __name__ == '__main__':
    o = build(); print(len(o))
    import collections; print(collections.Counter(x[3] for x in o))
    import random; random.seed(3)
    for x in random.sample(o, 30): print(x)
