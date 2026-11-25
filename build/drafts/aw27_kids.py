# Executed inside aw27.py (uses s, E, K, palette, table, build_audience, KBASIS)
s.basis = KBASIS
KP = {r[0]: r for r in K}


def kpal(names):
    return palette([KP[n] for n in names])


def kidsD(c):
    L = c['label']
    th = c['themes']
    return {
     't': 'In stores August 2027 to January 2028.',
     'themes': th,
     'col': dict(s=c['col_s'], ev=['violet', 'pinkm', 'cf'], st='Emerging',
        b=[('The palette', kpal(c['pal'])), ('Colour groups', c['groups']), ('Why', 'Adult fairs put violet, plum and dusty pinks at the centre and note pink and mauve reaching junior sweatshirts; Forecut\'s kidswear palette applies that with brighter ochre and sage for play.')],
        d='- Test plum and mauve on cotton jersey and fleece; check colour fastness to washing.', c='- Greyed blue and oat carry volume; plum and mauve are the newness.'),
     'tcp': dict(s=f'Palettes for AW27 {L} themes.', ev=['pinkm'], b=[('Palettes by theme', table(['Theme', 'Lead', 'Accent', 'Range'], [[t['name'], *t['pal']] for t in th]))],
        d='- Share oat and greyed blue.', c='- Accents shallow.'),
     'cs': dict(s=f'Colour stories for AW27 {L}.', ev=['pvc', 'living'], b=c['stories'], d='- One capsule per story.', c='- The calmest story carries volume.'),
     'sw': dict(s=c['sw_s'], ev=['shoulder', 'pf', 'camo'], b=[('Shapes', c['sw'])], d='- Room for movement and growth; easy fastenings.', c='- Outerwear leads the woven buy.'),
     'sk': dict(s=c['sk_s'], ev=['kidult', 'pinkm', 'pf'], b=[('Shapes', c['sk'])], d='- Neck openings wide enough for easy dressing.', c='- Sweatshirts and knits are reorder lines.'),
     'fw': dict(s=c['fw_s'], ev=['wool', 'pf', 'csr'], b=[('Fabric by fabric', table(['Fabric', 'Uses'], c['fw']))], d='- Washable finishes; avoid dry-clean-only.', c='- Corduroy and denim carry volume.'),
     'fk': dict(s=c['fk_s'], ev=['merino', 'csr', 'texture'], b=[('Fabric by fabric', table(['Knit', 'Uses'], c['fk']))], d='- Machine-washable wool; pilling tests.', c='- Merino and organic fleece support price.'),
     'tt': dict(s=c['tt_s'], ev=['kidult', 'aplf_trim', 'pf'], b=[('Trims table', table(['Trim', 'Application', 'Safety note'], c['tt']))], d='- No small detachable parts for under-3s.', c='- Trims refresh core sweatshirts.'),
     'ts': dict(s=f'Trims for each AW27 {L} theme.', ev=['pf', 'kidult'], b=[(t['name'], t['trim']) for t in th], d='- One trim family per theme.', c='- Update carry-over blocks.'),
     'tm': dict(s=f'Durable, safe trims for AW27 {L} in a cautious market.', ev=['outlook', 'gw', 'csr'],
        b=[('Build, test, sell through', table(['Action', 'Trims'], [['Build', 'Embroidered badges, piping, snaps'], ['Test', 'Character appliqué, fur-effect collars'], ['Avoid', 'Glued decoration, small parts']]))],
        d='- Wash-test all trims.', c='- Do not use unproven eco claims on trims.'),
     'ti': dict(s=f'Trim innovations for AW27 {L}: reflective details, magnetic and easy closures, tagless labels.', ev=['aplf_trim'],
        b=[('Readiness', table(['Innovation', 'Readiness'], [['Reflective trims for dark evenings', 'Ready'], ['Easy closures', 'Ready; enclose magnets'], ['Printed labels', 'Ready']]))],
        d='- Enclose magnets fully.', c='- Safety and ease sell to parents.'),
     'celeb': dict(s=f'Family and parent-child dressing, not single celebrities, shapes AW27 {L}.', ev=['mini', 'pinkm'],
        b=[('What to take from it', c['celeb'])], d='- Share prints and fabrics with adult lines.', c='- Family capsules for the festive season.'),
     'casual': dict(s=f'Casual AW27 {L}.', ev=['kidult', 'camo', 'pf'], b=[('Formulas', c['casual'])], d='- Layering.', c='- Show full looks.'),
     'formal': dict(s=f'Occasion and formal AW27 {L}.', ev=['boland_fam', 'checks'], b=[('Formulas', c['formal'])], d='- Soft linings.', c='- Festive and ceremony timing.'),
     'party': dict(s=f'Party AW27 {L}.', ev=['silky', 'mu'], b=[('Formulas', c['party'])], d='- Line velvet and lurex.' if 'toddler' not in L else '- No sequins or beads.', c='- Deliver for December.'),
     'craft': dict(s=f'Craft for AW27 {L}: knitted texture, quilt geometry and natural dyeing.', ev=['pf', 'vdh_dye', 'living'], b=[('Translating', c['craft'])], d='- Hand work on safe placements.', c='- Heritage and gift value.'),
     'mat': dict(s=f'Premium materials for AW27 {L}: merino, organic cotton, Tencel modal blends, soft leather and faux shearling.', ev=['csr', 'merino', 'tfl'], b=[('Materials', c['mat'])], d='- Certified fibres.', c='- Premium on merino and leather.'),
     'opp': dict(s=c['opp_s'], ev=['csr', 'resale', 'pinkm'], b=[('Opportunities', c['opp'])], d='- Durability first.', c='- Re-weight to outerwear and knits.'),
     'ass': dict(s=f'Assortment and pricing for AW27 {L}.', ev=['outlook', 'resale'],
        b=[('Assortment', table(['Tier', 'What'], c['ass'])), ('Pricing', '- Full price on outerwear and merino.\n- Value on basics and multipacks.')], d='- Durable for hand-me-downs.', c='- Weekly sell-through tracking.'),
     'mi': dict(s=f'Material innovations for AW27 {L}: machine-washable merino, recycled down alternatives, closed-loop modal, chrome-free leather.', ev=['merino', 'csr', 'tfl', 'altl'],
        b=[('Readiness', table(['Material', 'Readiness'], [['Washable merino', 'Ready'], ['Closed-loop modal blends', 'Ready'], ['Chrome-free leather shoes', 'Ready'], ['Bio-based leather alternatives', 'Niche']]))], d='- Skin-friendly finishes.', c='- Verify every claim.'),
     'dpi': dict(s=f'Design and production for AW27 {L}: permanent ranges, take-back, grading for growth and product data for the EU passport.', ev=['csr', 'dpp', 'gw'],
        b=[('Actions', '- Permanent core styles with seasonal drops.\n- Pre-loved take-back.\n- Record fibre, origin and safety tests.')], d='- Grade for growth.', c='- Plan resale routes.'),
    }


def T(slug, name, summ, story, col, sil, fab, trim, pal, p):
    return dict(slug=slug, name=name, s=summ, story=story, col=col, sil=sil, fab=fab, trim=trim, pal=pal, p=p, st='Emerging')


EQ = 'Pitti Filati\'s AW27 research theme "Discipline" draws on dressage, Western reining (Quarter Horse spots, quilt geometry, denim, suede, flannel) and show jumping (stripes, colour blocking, technical knits) [[pf]].'
KU = 'FashionUnited notes "kidult" knitwear with whimsical faces and regressive animal motifs [[fwr]].'
CSR = 'At Playtime in January 2026, CSR was "no longer a peripheral narrative": brands such as Gray Label, Minimalisma and MarMar Copenhagen build on organic cotton, merino, modal, permanent ranges and take-back [[pt26]].'
CFG = {
 'kids': dict(label='kidswear', pal=['Plum', 'Dusty mauve', 'Waxy ochre', 'Sage', 'Greyed blue', 'Oat'],
   col_s='AW27 kidswear colour: plum and dusty mauve with waxy ochre and sage, grounded in greyed blue and oat.',
   groups='- **Core:** greyed blue, oat.\n- **Seasonal:** plum, dusty mauve.\n- **Accent:** waxy ochre, sage.',
   themes=[T('saddle-club', 'Saddle Club', 'Equestrian codes for children: quilted jackets, riding stripes, spotted and colour-blocked knits, cord and denim.', EQ,
            'Oat, greyed blue and waxy ochre.', '- Quilted jacket.\n- Riding-stripe knit.\n- Cord trousers.', 'Corduroy, flannel, denim, technical knit.', 'Quilting, contrast piping, horseshoe-free motifs.', ['Greyed blue', 'Waxy ochre', 'Oat'], '- Jackets, knits, cords.'),
           T('kidult-knits', 'Kidult Knits', 'Whimsical faces and animal motifs on chunky knits and sweatshirts, in plum, mauve and ochre.', KU + ' Pink and mauve now reach junior sweatshirts [[pvaw]].',
            'Plum, dusty mauve, waxy ochre.', '- Chunky crew.\n- Sweatshirt.\n- Knit hat and mittens set.', 'Brushed cotton fleece, wool blends.', 'Intarsia faces, embroidered animals.', ['Plum', 'Waxy ochre', 'Dusty mauve'], '- Knits, sweatshirts, accessories.'),
           T('forever-pieces', 'Forever Pieces', 'Permanent, durable kidswear: organic and merino basics in calm colour, made to be handed down.', CSR,
            'Oat, greyed blue, sage.', '- Unisex basics.\n- Merino base layers.\n- Durable trousers.', 'Organic cotton, merino, modal blends.', 'Minimal branding, reinforced knees.', ['Oat', 'Sage', 'Greyed blue'], '- Basics, base layers, outerwear.')],
   stories=[('Stable', 'Oat, greyed blue and waxy ochre for equestrian pieces.'), ('Plum Play', 'Plum and dusty mauve for knits.'), ('Field', 'Sage and oat for basics.')],
   sw_s='Kidswear wovens for AW27: quilted and padded jackets, cord trousers, dungarees, check shirts and duffle coats.', sw='- **Quilted jacket.**\n- **Padded coat with hood (no cords).**\n- **Cord trouser and dungaree.**\n- **Check shirt.**\n- **Duffle coat.**',
   sk_s='Kidswear knits for AW27: chunky crews, sweatshirts with whimsical motifs, merino base layers, fleece sets.', sk='- **Chunky crew.**\n- **Sweatshirt.**\n- **Merino base layer.**\n- **Fleece set.**',
   fw_s='Kidswear wovens: corduroy, flannel, denim, quilted cotton and water-repellent shells.', fw=[['Corduroy', 'Trousers, dungarees'], ['Flannel', 'Shirts'], ['Denim', 'Jeans, jackets'], ['Water-repellent shell', 'Coats']],
   fk_s='Kidswear knits: organic fleece, merino, brushed cotton and wool blends.', fk=[['Organic fleece', 'Sweatshirts'], ['Merino', 'Base layers'], ['Wool blend', 'Crews']],
   tt_s='Kidswear trims: quilting, embroidered characters, reflective tape, toggles on secure loops.', tt=[['Quilting', 'Jackets', 'None'], ['Embroidered characters', 'Sweatshirts', 'Soft backing'], ['Reflective tape', 'Coats', 'None'], ['Toggles', 'Duffle coats', 'Pull-tested']],
   celeb='- Parent and child knit capsules for the festive season.\n- Avoid real children and celebrities in campaigns without consent.',
   casual='- **Sweatshirt + cords + boots.**\n- **Quilted jacket + jeans.**\n- **Chunky knit + dungarees.**', formal='- **Check shirt + knit waistcoat + cords.**\n- **Velvet dress or blazer for occasions.**', party='- **Velvet piece + tights or trousers.**\n- **Lurex knit.**',
   craft='- Intarsia and hand-finished knits.\n- Quilt geometry.\n- Natural dyes on basics.', mat='- Merino.\n- Organic cotton.\n- Modal blends.\n- Leather boots.',
   opp_s='Growth for AW27 kidswear: outerwear, knitwear, durable basics, family capsules.', opp='1. Outerwear.\n2. Knits and sweatshirts.\n3. Permanent basics.\n4. Family capsules.\n5. Boots.',
   ass=[['Core', 'Basics, jeans, sweatshirts'], ['Seasonal', 'Outerwear, knits, cords'], ['Statement', 'Occasion, novelty']]),
}
CFG['boys'] = dict(CFG['kids'], label='boyswear', pal=['Greyed blue', 'Waxy ochre', 'Sage', 'Plum', 'Oat'],
   col_s='AW27 boyswear colour: greyed blue and oat with waxy ochre and sage, plum for the newness.', groups='- **Core:** greyed blue, oat.\n- **Seasonal:** plum.\n- **Accent:** waxy ochre, sage.',
   themes=[T('show-jumper', 'Show Jumper', 'Sport colour blocking and stripes from show jumping: technical knits, track jackets and padded gilets.', EQ, 'Greyed blue, waxy ochre, oat.', '- Colour-block track jacket.\n- Padded gilet.\n- Striped knit.', 'Technical knit, ripstop.', 'Contrast panels, reflective tape.', ['Greyed blue', 'Waxy ochre', 'Oat'], '- Track tops, gilets, knits.'),
           T('trail-camo', 'Trail Camo', 'Camouflage as a neutral for boys: recoloured woodland camo on parkas and cargo trousers.', 'Woodland camouflage now works almost like a neutral, distorted and recoloured [[fwr]].', 'Sage, greyed blue, oat.', '- Parka.\n- Cargo trouser.', 'Ripstop, cotton twill.', 'Utility pockets, toggles on loops.', ['Sage', 'Greyed blue', 'Oat'], '- Parkas, cargos.')],
   stories=[('Arena', 'Greyed blue and waxy ochre for sport.'), ('Woodland', 'Sage and oat camo.'), ('Plum', 'Plum sweatshirts.')],
   sw_s='Boys\' AW27 wovens: parkas, padded jackets, cargos, cords and check overshirts.', sw='- **Parka (no cords at hood).**\n- **Padded jacket.**\n- **Cargo trouser.**\n- **Cord trouser.**\n- **Check overshirt.**',
   sk_s='Boys\' AW27 knits: colour-block track tops, striped rugby knits, sweatshirts in plum and mauve.', sk='- **Track top.**\n- **Rugby knit.**\n- **Sweatshirt.**\n- **Merino base layer.**',
   casual='- **Parka + cargos + sneakers.**\n- **Rugby knit + jeans.**', formal='- **Check shirt + knit tie-free waistcoat + cords.**\n- **Blazer + roll-neck for occasions.**', party='- **Velvet blazer + tee.**',
   celeb='- Father-son matching on knits and outerwear.\n- Avoid athletes\' names and numbers without licence.',
   opp_s='Growth for AW27 boyswear: outerwear, track and sport knits, cargos, camo.', opp='1. Parkas and padded jackets.\n2. Track tops.\n3. Cargos.\n4. Sweatshirts.\n5. Boots.')
CFG['girls'] = dict(CFG['kids'], label='girlswear', pal=['Dusty mauve', 'Plum', 'Waxy ochre', 'Sage', 'Oat'],
   col_s='AW27 girlswear colour: dusty mauve and plum, with waxy ochre and sage, on oat.', groups='- **Core:** oat, greyed blue.\n- **Seasonal:** dusty mauve, plum.\n- **Accent:** waxy ochre, sage.',
   themes=[T('dressage', 'Dressage', 'Equestrian elegance for girls: braided details, riding jackets, pleated skirts and velvet.', EQ, 'Plum, oat, waxy ochre.', '- Riding jacket.\n- Pleated skirt.\n- Velvet dress.', 'Velvet, flannel, wool blends.', 'Braided trims, velvet ribbon (short, secured).', ['Plum', 'Waxy ochre', 'Oat'], '- Jackets, skirts, dresses.'),
           T('lace-and-knit', 'Lace and Knit', 'Romantic winter for girls: lace collars, pointelle and chunky knits in dusty mauve.', 'Première Vision\'s selection was "silkier and more influenced by eveningwear codes" [[pvaw]]; all-over lace is among cited looks [[fwr]]. ' + KU,
            'Dusty mauve, oat.', '- Lace-collar dress.\n- Chunky cardigan.', 'Cotton lace, wool-blend knit.', 'Lace collars, pearl-look buttons (secured).', ['Dusty mauve', 'Sage', 'Oat'], '- Dresses, cardigans.')],
   stories=[('Riding', 'Plum, oat, ochre.'), ('Mauve', 'Dusty mauve and oat.'), ('Sage', 'Sage basics.')],
   sw_s='Girls\' AW27 wovens: riding jackets, pleated skirts, velvet dresses, padded coats, cord pinafores.', sw='- **Riding jacket.**\n- **Pleated skirt.**\n- **Velvet dress.**\n- **Padded coat.**\n- **Cord pinafore.**',
   sk_s='Girls\' AW27 knits: chunky cardigans, pointelle, kidult intarsia, knit dresses.', sk='- **Chunky cardigan.**\n- **Pointelle top.**\n- **Intarsia jumper.**\n- **Knit dress.**',
   casual='- **Intarsia jumper + cords.**\n- **Cardigan + pinafore + tights.**', formal='- **Velvet dress + cardigan.**\n- **Riding jacket + pleated skirt.**', party='- **Lurex knit + tulle-free skirt.**\n- **Velvet dress.**',
   celeb='- Mother-daughter knit and velvet capsules.\n- Keep children\'s versions age-appropriate.',
   opp_s='Growth for AW27 girlswear: velvet and occasion dresses, knits, coats, pinafores.', opp='1. Velvet dresses.\n2. Cardigans and knits.\n3. Coats.\n4. Pinafores.\n5. Boots.')
CFG['toddler-boys'] = dict(CFG['kids'], label='toddler boys', pal=['Greyed blue', 'Oat', 'Sage', 'Waxy ochre'],
   col_s='AW27 toddler boys\' colour: greyed blue and oat with sage and waxy ochre.', groups='- **Core:** oat, greyed blue.\n- **Accent:** sage, waxy ochre.',
   themes=[T('little-stable', 'Little Stable', 'Gentle equestrian for toddler boys: quilted pramsuits, cord dungarees and pony motifs.', EQ, 'Oat, greyed blue, ochre.', '- Quilted pramsuit.\n- Cord dungaree.', 'Cotton cord, quilted cotton.', 'Snaps, embroidered ponies.', ['Greyed blue', 'Waxy ochre', 'Oat'], '- Pramsuits, dungarees.'),
           T('cosy-forever', 'Cosy Forever', 'Soft, durable basics for toddler boys: merino and organic sets made to be handed down.', CSR, 'Oat, sage.', '- Merino set.\n- Sleepsuit.', 'Merino, organic interlock.', 'Printed labels.', ['Oat', 'Sage', 'Greyed blue'], '- Sets, sleepwear.')],
   stories=[('Stable', 'Oat, greyed blue, ochre.'), ('Cosy', 'Oat and sage.')],
   sw_s='Toddler boys\' AW27 wovens: quilted pramsuits, cord dungarees with snap legs, padded jackets.', sw='- **Pramsuit with fold-over cuffs.**\n- **Cord dungaree.**\n- **Padded jacket.**',
   sk_s='Toddler boys\' AW27 knits: merino sets, fleece, cardigans, sleepsuits.', sk='- **Merino set.**\n- **Fleece jacket.**\n- **Cardigan.**\n- **Sleepsuit.**',
   tt=[['Snaps', 'Dungarees', 'Pull-tested'], ['Embroidery', 'Sweatshirts', 'Soft backing'], ['Printed labels', 'All', 'None']],
   casual='- **Fleece + cord dungaree.**\n- **Merino set + booties.**', formal='- **Knit cardigan + collared shirt romper.**', party='- **Velvet-look romper (no small parts).**',
   celeb='- Sibling matching knits.', opp_s='Growth for AW27 toddler boys: pramsuits, merino sets, sleepwear, first boots.', opp='1. Pramsuits.\n2. Merino sets.\n3. Sleepwear.\n4. First boots.\n5. Gift sets.')
CFG['toddler-girls'] = dict(CFG['toddler-boys'], label='toddler girls', pal=['Dusty mauve', 'Oat', 'Sage', 'Plum'],
   col_s='AW27 toddler girls\' colour: dusty mauve and oat with sage and plum.', groups='- **Core:** oat.\n- **Seasonal:** dusty mauve, plum.\n- **Accent:** sage.',
   themes=[T('little-lace', 'Little Lace', 'Soft lace collars, pointelle knits and velvet for toddler girls.', 'Eveningwear codes reached the fabric fairs [[pvaw]]. ' + KU, 'Dusty mauve, oat.', '- Lace-collar romper.\n- Pointelle cardigan.', 'Organic cotton lace, pointelle.', 'Covered buttons, soft lace.', ['Dusty mauve', 'Sage', 'Oat'], '- Rompers, cardigans.'),
           T('cosy-forever', 'Cosy Forever', 'Soft, durable basics for toddler girls: merino and organic sets made to be handed down.', CSR, 'Oat, sage.', '- Merino set.\n- Sleepsuit.', 'Merino, organic interlock.', 'Printed labels.', ['Oat', 'Sage', 'Dusty mauve'], '- Sets, sleepwear.')],
   stories=[('Mauve', 'Dusty mauve and oat.'), ('Cosy', 'Oat and sage.')],
   sw_s='Toddler girls\' AW27 wovens: padded pramsuits, cord pinafores, velvet dresses with bloomers.', sw='- **Pramsuit.**\n- **Cord pinafore.**\n- **Velvet dress with bloomers.**',
   casual='- **Pointelle cardigan + cord pinafore + tights.**', formal='- **Velvet dress + cardigan.**', party='- **Soft velvet dress (no sequins).**',
   celeb='- Mother-daughter and sibling knits.', opp_s='Growth for AW27 toddler girls: pramsuits, knit sets, velvet occasion, sleepwear.', opp='1. Pramsuits.\n2. Knit sets.\n3. Velvet occasion.\n4. Sleepwear.\n5. Gift sets.')
for aud in ['kids', 'boys', 'girls', 'toddler-boys', 'toddler-girls']:
    build_audience(s, aud, kidsD(CFG[aud]), E)
