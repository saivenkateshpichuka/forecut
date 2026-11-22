"""Write ../report-cover-prompts.csv: one landscape thumbnail prompt per report (season x topic).
Save each generated image as images/cover-<season>-<topic>.png; the images workflow converts it to img/*.webp and the
report cover, the forecasts library and the PDF covers switch from the colour block to the picture by themselves."""
import csv, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_v2 as V

SCENE = {'ss': 'bright Mediterranean daylight, whitewashed walls, soft shadows', 'aw': 'moody autumn city at dusk, warm lamplight, stone streets'}
SUBJ = {
    'themes': 'two models walking towards camera wearing looks from the season themes ({th})',
    'colour': 'an overhead flat lay of folded fabric swatches, yarn and paint chips arranged in colour blocks',
    'womenswear': 'one woman model, three-quarter length, wearing {pieces}',
    'menswear': 'one man model, three-quarter length, wearing {pieces}',
    'footwear': 'a still life of shoes on a low plinth: {pieces}',
    'knitwear': 'a close crop of knitwear on a model, showing the stitch texture clearly: {pieces}',
    'fabrics': 'draped and folded fabric lengths on a studio table, close enough to see weave and finish: {pieces}',
    'trims': 'a macro close-up of garment trims and hardware: {pieces}',
}
rows = []
for s, t in V.REPORTS:
    m = V.META[s]
    its = V.topic_items(s, t)
    key = [x[1]['name'].lower() for x in (V.by_stage(its, 'r', s) + V.by_stage(its, 'p', s))][:4]
    pal = ', '.join(n for _, n in m['palette'])
    subj = SUBJ[t].format(pieces=', '.join(key) or 'the key pieces of the season', th=', '.join(x[0] for x in m['themes'][:3]))
    p = (f'{m["title"]} fashion forecast cover, {V.TOPIC[t][1].lower()}: {subj}. Colour palette: {pal}. Scene: {SCENE[s[:2]]}. '
         'Natural, realistic editorial fashion photograph, landscape 16:10, calm uncluttered lower-left area, shallow depth of field. '
         'No text, no logos, no brand names, no watermark.')
    rows.append([f'cover-{s}-{t}.png', m['code'], V.TOPIC[t][1], 'Done' if f'cover-{s}-{t}' in V.IMG else 'Needed', p])
with open(os.path.join(V.ROOT, 'report-cover-prompts.csv'), 'w', newline='', encoding='utf-8') as f:
    w = csv.writer(f); w.writerow(['File name', 'Season', 'Report', 'Status', 'Prompt']); w.writerows(rows)
print(len(rows), 'cover prompts')
