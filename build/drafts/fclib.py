"""Compact report writer for Forecut editorial reports (content/reports/*.json).
Evidence entries are (text, source key or list of keys or None). '[[key]]' inside section text becomes a numbered ref."""
import json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'content', 'reports')
AUDL = {'women': "Women's", 'men': "Men's", 'kids': "Kids'", 'boys': "Boys'", 'girls': "Girls'",
        'toddler-boys': "Toddler Boys'", 'toddler-girls': "Toddler Girls'"}
KIDS = {'kids', 'boys', 'girls', 'toddler-boys', 'toddler-girls'}
STD = {
    ('colours', 'season-colours'): ('season-colour-analysis', 'Season Colour Analysis'),
    ('colours', 'theme-colour-palettes'): ('theme-colour-palettes-report', 'Theme Colour Palettes'),
    ('colours', 'colour-stories'): ('colour-stories-report', 'Colour Stories'),
    ('silhouettes', 'woven'): ('woven-silhouette-direction', 'Woven Silhouette Direction'),
    ('silhouettes', 'knit'): ('knit-shape-and-fit-outlook', 'Knit Shape and Fit Outlook'),
    ('fabrics', 'woven'): ('woven-fabric-direction', 'Woven Fabric Direction'),
    ('fabrics', 'knit'): ('knit-fabric-direction', 'Knit Fabric Direction'),
    ('trims', 'trending-trims'): ('trending-trims-report', 'Trending Trims Report'),
    ('trims', 'trim-stories'): ('trim-stories-report', 'Trim Stories'),
    ('trims', 'trim-market-strategy'): ('trim-market-strategy-report', 'Trim Market Strategy'),
    ('trims', 'trim-innovations'): ('trim-innovations-report', 'Trim Innovations'),
    ('styling', 'celebrity-influence'): ('celebrity-influence-report', 'Celebrity Influence'),
    ('styling', 'casualwear'): ('casualwear-styling-report', 'Casualwear Styling'),
    ('styling', 'formalwear'): ('formalwear-styling-report', 'Formalwear Styling'),
    ('styling', 'partywear'): ('partywear-styling-report', 'Partywear Styling'),
    ('couture', 'craft-techniques'): ('couture-craft-and-techniques-report', 'Couture Craft and Techniques'),
    ('couture', 'materials-details'): ('couture-materials-and-details-report', 'Couture Materials and Details'),
    ('business-strategy', 'category-opportunities'): ('category-opportunities-report', 'Category Opportunities'),
    ('business-strategy', 'assortment-pricing'): ('assortment-and-pricing-strategy', 'Assortment and Pricing Strategy'),
    ('innovations', 'material-innovations'): ('material-innovations-report', 'Material Innovations'),
    ('innovations', 'design-production'): ('design-and-production-innovations-report', 'Design and Production Innovations'),
}
SUBS = list(STD)
SAFE = ('\n- Safety: no drawstrings or long cords at the hood, neck or waist, in line with EN 14682; test the attachment '
        'strength of buttons, snaps and decorations, and keep small detachable parts off baby and toddler pieces.')


class Season:
    def __init__(self, code, S, research_period, markets, basis=None, published='2026-11-25'):
        self.code, self.S, self.rp, self.mk, self.basis, self.pub = code, S, research_period, markets, basis, published
        self.R = []

    def rep(self, aud, cat, sub, summary, ev=(), sections=(), timing='', products='', design='', commercial='',
            name=None, slug=None, kind='report', status=None, related=(), markets=None, rp=None):
        if (cat, sub) in STD and not slug:
            slug, nm = STD[(cat, sub)]
            name = name or nm
        order, srcs = [], []

        def num(keys):
            out = ''
            for k in ([keys] if isinstance(keys, str) else keys or []):
                if k not in order:
                    order.append(k); srcs.append(self.S[k])
                out += f'<sup>[{order.index(k) + 1}]</sup>'
            return out

        def fill(t):
            return re.sub(r'\[\[([a-z0-9_]+)\]\]', lambda m: num(m.group(1)), t)
        secs = []
        if self.basis:
            secs.append({'heading': 'How this forecast was built', 'body': self.basis})
        if ev:
            secs.append({'heading': 'The evidence', 'body': '\n'.join(f'- {fill(t)}{num(k)}' for t, k in ev)})
        for h, b in sections:
            secs.append({'heading': h, 'body': fill(b)})
        d = fill(design)
        if aud in KIDS and 'EN 14682' not in d:
            d += SAFE
        r = {'kind': kind, 'status': 'published', 'season': self.code, 'audience': aud, 'category': cat,
             'subsection': sub, 'slug': slug, 'title': f'{self.code.upper()} {AUDL[aud]} {name}', 'summary': summary,
             'research_period': rp or self.rp, 'markets': markets or self.mk, 'sections': secs, 'timing': fill(timing),
             'products': fill(products), 'design_implications': d, 'commercial_implications': fill(commercial),
             'sources': srcs, 'images': [], 'related': list(related), 'published': self.pub}
        if status:
            r['trend_status'] = status
        self.R.append(r)

    def theme(self, aud, slug, name, summary, story, colours, silhouettes, fabrics, trims, **k):
        self.rep(aud, 'themes', 'themes', summary, sections=[('The story', story), ('Colours', colours),
                 ('Silhouettes', silhouettes), ('Fabrics', fabrics), ('Trims and details', trims)],
                 name=name, slug=slug, kind='theme', **k)

    def write(self):
        for r in self.R:
            fn = f"{r['season']}-{r['audience']}-{r['category']}-{r['slug']}.json"
            json.dump(r, open(os.path.join(OUT, fn), 'w'), indent=1, ensure_ascii=False)
        print(self.code, len(self.R), 'reports written')


def palette(rows):
    """rows: (name, tcx, hex, role)"""
    return '| Colour | Pantone TCX (nearest) | HEX | Role |\n|---|---|---|---|\n' + '\n'.join(
        f'| {a} | {b} | {c} | {d} |' for a, b, c, d in rows) + '\n\nConfirm codes against a physical Pantone book before dyeing.'


def table(head, rows):
    return '| ' + ' | '.join(head) + ' |\n|' + '---|' * len(head) + '\n' + '\n'.join('| ' + ' | '.join(r) + ' |' for r in rows)
