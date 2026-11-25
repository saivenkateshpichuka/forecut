"""Generic audience builder for projection seasons. c = audience config, EV = evidence keys per report key."""
from fclib import palette, table


def genD(c, EV, kids=False):
    L = c['label']
    th = c['themes']
    P = {r[0]: r for r in c['palrows']}
    def ev(k):
        return EV.get(k, EV['default'])
    return {
     't': c['t'],
     'themes': th,
     'col': dict(s=c['col_s'], ev=ev('col'), st=c.get('col_st', 'Projected'),
        b=[('The palette', palette([P[n] for n in c['pal']])), ('Colour groups', c['groups']), ('By product', c['byp'])],
        d=c.get('col_d', '- Lab-dip key colours on each main fabric before committing.'), c=c.get('col_c', '- Keep the core deep and the accents shallow until the fairs confirm them.')),
     'tcp': dict(s=f'Working palettes for the {c["code"]} {L} themes.', ev=ev('tcp'),
        b=[('Palettes by theme', table(['Theme', 'Lead', 'Accent', 'Range'], [[t['name'], *t['pal']] for t in th]))], d='- Lead colour on most pieces, accent on one.', c='- Share core colours across themes.'),
     'cs': dict(s=f'Colour stories for {c["code"]} {L}.', ev=ev('cs'), b=c['stories'], d='- One capsule or delivery per story.', c=c.get('cs_c', '- The most neutral story carries volume.')),
     'sw': dict(s=c['sw_s'], ev=ev('sw'), st='Projected', b=[('Shapes to lead with', c['sw'])], d=c.get('sw_d', '- Develop blocks early; confirm proportions after the shows.'), c=c.get('sw_c', '- Keep new shapes to tested quantities.')),
     'sk': dict(s=c['sk_s'], ev=ev('sk'), b=[('Shapes and fit', c['sk'])], d=c.get('sk_d', '- Check gauge and weight for the climate of each market.'), c='- Knit basics are reorder lines.'),
     'fw': dict(s=c['fw_s'], ev=ev('fw'), b=[('Fabric by fabric', table(['Fabric', 'Hand', 'Uses'], c['fw']))], d='- Book mill development slots early.', c='- Natural fibres support a premium.'),
     'fk': dict(s=c['fk_s'], ev=ev('fk'), b=[('Fabric by fabric', table(['Knit', 'Hand', 'Uses'], c['fk']))], d='- Test pilling, stretch recovery and colour fastness.', c='- Core knits carry volume.'),
     'tt': dict(s=c['tt_s'], ev=ev('tt'), b=[('Trims table', table(['Trim', 'Application', 'Status'], c['tt']))], d='- Wash-test every trim.' + (' No small detachable parts for under-3s.' if kids else ''), c='- Trims refresh carry-over blocks.'),
     'ts': dict(s=f'Trims that carry each {c["code"]} {L} theme.', ev=ev('ts'), b=[(t['name'], t['trim']) for t in th], d='- One trim family per theme.', c='- Use trims to update core.'),
     'tm': dict(s=c.get('tm_s', f'Trim strategy for {c["code"]} {L}: durable, verifiable and easy to change late.'), ev=ev('tm'),
        b=[('Build, test, sell through', table(['Action', 'Trims'], c['tm']))], d='- Document trim materials for any environmental claim.', c='- Late-added trims (embroidery, piping) let you react to sales.'),
     'ti': dict(s=c['ti_s'], ev=ev('ti'), b=[('Readiness', table(['Innovation', 'Readiness (Forecut assessment)'], c['ti']))], d='- Design for repair and disassembly.', c='- Function supports full price.'),
     'celeb': dict(s=c['celeb_s'], ev=ev('celeb'), b=[('What to take from it', c['celeb'])], d='- Design pieces that style several ways.', c='- Avoid real names and likenesses in marketing without agreements.'),
     'casual': dict(s=f'Casual {c["code"]} {L}.', ev=ev('casual'), b=[('Formulas', c['casual'])], d='- Sets that work as separates.', c='- Show full looks online.'),
     'formal': dict(s=f'Formal and occasion {c["code"]} {L}.', ev=ev('formal'), b=[('Formulas', c['formal'])], d='- Comfortable linings and soft construction.', c='- Time deliveries for the event calendar.'),
     'party': dict(s=f'Party {c["code"]} {L}.', ev=ev('party'), b=[('Formulas', c['party'])], d='- Line sheer, metallic and embellished pieces.' if not kids else '- Line sparkle; no beads or sequins for under-3s.', c='- Party buys sell close to events; buy shallow.'),
     'craft': dict(s=c['craft_s'], ev=ev('craft'), b=[('Translating to ready-to-wear', c['craft'])], d='- Hand work on hero pieces only.', c='- Tell the craft story; price as limited.'),
     'mat': dict(s=c['mat_s'], ev=ev('mat'), b=[('Materials', c['mat'])], d='- Check certifications and animal-material rules per market.', c='- Premium materials on few hero pieces.'),
     'opp': dict(s=c['opp_s'], ev=ev('opp'), b=[('Opportunities', c['opp']), ('Reduce', c.get('reduce', 'Styles that did not sell through in the previous comparable season.'))], d='- Shift development time to the opportunities.', c='- Re-weight open-to-buy accordingly.'),
     'ass': dict(s=f'Assortment and pricing for {c["code"]} {L}.', ev=ev('ass'),
        b=[('Assortment', table(['Tier', 'What goes in it'], c['ass'])), ('Pricing', c['pricing'])], d='- Fewer styles, more combinations.', c='- Track sales-to-stock weekly; plan resale and rework routes.'),
     'mi': dict(s=c['mi_s'], ev=ev('mi'), b=[('Readiness', table(['Material', 'Readiness (Forecut assessment)'], c['mi']))], d='- Prefer proven materials; trial new ones in small runs.', c='- Verify every environmental claim (EU Directive 2024/825).'),
     'dpi': dict(s=c['dpi_s'], ev=ev('dpi'), b=[('Actions', c['dpi'])], d='- Record fibre, origin, care and test results for every style.', c=c.get('dpi_c', '- Plan production around Lunar New Year and EU product-data rules.')),
    }


def T(slug, name, summ, story, col, sil, fab, trim, pal, p, st='Projected'):
    return dict(slug=slug, name=name, s=summ, story=story, col=col, sil=sil, fab=fab, trim=trim, pal=pal, p=p, st=st)
