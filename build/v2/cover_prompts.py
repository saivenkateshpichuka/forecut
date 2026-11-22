"""Thumbnail lists for the redesigned pages.

../report-cover-prompts.csv      one landscape cover per report (season x topic)
../thumbnails-to-generate.csv    every picture still missing: report covers, forecast detail photos shown on the
                                  report pages, and article/hub images, each with a realistic prompt and file name.
Save a generated picture in images/ under its file name; the images workflow converts it to img/*.webp and the pages
and PDF covers pick it up by themselves. Files already in img/ are left out of the to-do list."""
import csv, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_v2 as V

ROOT = V.ROOT
SCENE = {
    'aw26': 'a European old-town street at blue hour, wet cobblestones, warm shop-window light',
    'ss27': 'a sunlit Mediterranean courtyard with whitewashed walls, terracotta pots and olive trees, late-morning sun',
    'aw27': 'a riverside stone embankment in an old European city at dusk, mist over the water, lamplight',
    'ss28': 'a modern city plaza with pale stone, glass and planted trees, bright clear morning light',
    'aw28': 'a hill-town stone lane at golden hour in late autumn, long warm shadows, distant valley',
}
MODELS = ['a South Asian woman in her twenties', 'a Black woman in her thirties', 'an East Asian woman in her twenties', 'a Latina woman in her thirties', 'a Middle Eastern woman in her twenties']
MEN = ['a South Asian man in his thirties', 'a Black man in his twenties', 'an East Asian man in his thirties', 'a white man in his forties', 'a Latino man in his twenties']
CAM = 'Shot on a full-frame camera with an 85mm lens at f/2.8, natural light, true-to-life colour, real fabric texture and creases, natural skin texture, no retouched or CGI look.'
FRAME = 'Landscape 16:10. Keep the lower-left third calm and uncluttered for a title. No text, no logos, no brand names, no watermark, no collage.'


def pieces(s, t, n=3):
    its = V.topic_items(s, t)
    xs = V.by_stage(its, 'r', s) + V.by_stage(its, 'p', s) + V.by_stage(its, 'e', s)
    seen, out = set(), []
    for x in xs:
        k = x[1]['name'].lower()
        if k not in seen:
            seen.add(k); out.append(k)
        if len(out) == n:
            break
    return out


def cover_prompt(s, t, i):
    m = V.META[s]
    pal = [n.lower() for _, n in m['palette']]
    ps = pieces(s, t, 4)
    wear = ', '.join(f'{p} in {pal[j % len(pal)]}' for j, p in enumerate(ps)) or 'the key pieces of the season'
    sc = SCENE[s]
    subj = {
        'themes': f'Three models walking towards the camera, mid-stride, styled in the {m["code"]} themes ' + ', '.join(f'"{x[0]}" ({", ".join(x[6]).lower()})' for x in m['themes'][:3]) +
                  f'. Models: {MODELS[i % 5]}, {MEN[(i + 1) % 5]} and {MODELS[(i + 2) % 5]}. Setting: {sc}',
        'colour': f'Overhead flat lay on a raw linen table by a window: folded fabric swatches, yarn cones, thread spools and paper colour chips arranged in soft blocks, '
                  f'in this exact palette from left to right: {", ".join(pal)}. A tailor\'s tape measure and brass scissors at one edge. Soft directional daylight',
        'womenswear': f'One woman model, {MODELS[i % 5]}, three-quarter length, relaxed pose, wearing {wear}. Setting: {sc}',
        'menswear': f'One man model, {MEN[i % 5]}, three-quarter length, hands in pockets, wearing {wear}. Setting: {sc}',
        'footwear': f'Still life of shoes on a low travertine plinth with a soft shadow: {wear}. Background: a plain wall in {pal[min(3, len(pal) - 1)]}, soft window light',
        'knitwear': f'Close crop from shoulders to hips of {MODELS[i % 5]} wearing {wear}, showing the knit stitch and yarn texture clearly. Setting softly blurred: {sc}',
        'fabrics': f'Draped and folded fabric lengths on a cutting table in a design studio, close enough to see weave, sheen and finish: {wear}. Window light from the left, a pattern-cutting ruler at the edge',
        'trims': f'Macro close-up on a tailor\'s table of garment trims and hardware: {wear}. Chalk, pins and a tape measure around them, warm side light showing metal and thread texture',
    }[t]
    return f'Editorial fashion photograph, {m["title"]} forecast cover for "{V.TOPIC[t][1]}". {subj}. {CAM} {FRAME}'


def main():
    covers, todo = [], []
    for i, (s, t) in enumerate(V.REPORTS):
        fn = f'cover-{s}-{t}.png'
        st = 'Done' if f'cover-{s}-{t}' in V.IMG else 'Needed'
        p = cover_prompt(s, t, i)
        covers.append([fn, V.META[s]['code'], V.TOPIC[t][1], st, p])
        if st == 'Needed':
            todo.append(['Report cover', f'{V.META[s]["code"]} {V.TOPIC[t][1]}', fn, V.META[s]['code'], V.TOPIC[t][1], '16:10 landscape', p])
    with open(os.path.join(ROOT, 'report-cover-prompts.csv'), 'w', newline='', encoding='utf-8') as f:
        w = csv.writer(f); w.writerow(['File name', 'Season', 'Report', 'Status', 'Prompt']); w.writerows(covers)
    # forecast detail photos missing from the report pages: take the season's own prompt
    for s in V.SKEYS:
        fp = os.path.join(ROOT, 'season-prompts', f'{s}-image-prompts.csv')
        rows = {r['Detail']: r for r in csv.DictReader(open(fp, encoding='utf-8'))} if os.path.exists(fp) else {}
        need = {}
        for t in V.TOPICS:
            if not t[3]:
                continue
            for k, it, st, nx in V.topic_items(s, t[0]):
                if not V.photo(it['name'], s) and it['name'] not in need:
                    need[it['name']] = (k, it, st, t[1])
        for nm, (k, it, st, tt) in sorted(need.items(), key=lambda x: ('repf'.find(x[1][2]), x[0])):
            r = rows.get(nm)
            fn = r['File name'] if r else f'{V.islug(nm)}-{s}.png'
            p = r['Prompt'] if r else (f'Close-up product photograph of {nm.lower()} ({k.split("|")[1].lower()}) for {V.META[s]["code"]}, clearly showing the {it["area"].lower()} detail. {it["note"]} '
                                       'Realistic fabric texture with visible seams and topstitching, garment on an invisible mannequin. Plain warm-grey background, shallow depth of field. '
                                       'One single photo, no collage. No logos, no brand names, no text, no people or faces. Square 1:1, editorial catalogue style.')
            todo.append(['Forecast detail', f'{V.META[s]["code"]} {tt} ({V.STAGE[st][0].lower()})', fn, V.META[s]['code'], nm, '1:1 square', p])
    # article and hub images still needed
    ir = os.path.join(ROOT, 'image-requests.csv')
    if os.path.exists(ir):
        for r in csv.DictReader(open(ir, encoding='utf-8')):
            if r['Status'].startswith('Needed'):
                todo.append(['Article or hub image', r['Page'], r['File name'], '', r['Search keywords'], '16:10 landscape', r['AI prompt (only if no good real photo)']])
    with open(os.path.join(ROOT, 'thumbnails-to-generate.csv'), 'w', newline='', encoding='utf-8') as f:
        w = csv.writer(f); w.writerow(['No.', 'Type', 'Where it shows', 'File name', 'Season', 'Subject', 'Shape', 'Prompt'])
        for n, r in enumerate(todo, 1):
            w.writerow([n] + r)
    from collections import Counter
    print('thumbnails to generate:', dict(Counter(r[0] for r in todo)))


if __name__ == '__main__':
    main()
