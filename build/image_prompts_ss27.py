"""Writes build/docs/images-to-generate-ss27.csv: one ChatGPT image prompt per SS27 report page that has no image."""
import csv, glob, json, re, os
BASE = ('4:3 landscape, 1600 x 1200 px. Photorealistic fashion trend-report image, soft natural daylight, '
        'clean off-white studio background, high detail on fabric texture. No text, no logos, no brand names, no watermarks, '
        'no real or recognisable people, no designer runway looks copied.')
KIDS = ' Product only: no children or people in the image. Show garments flat-laid or on child-size forms. No cords at neck or hood, no small loose parts.'
PAL = {
 'women': 'lilac #B3A0C9, violet #603F83, butter #F6E199, true red #C71F2D, Klein blue #3850A0, optic white #F2F0EB',
 'men': 'sand #DAC7AB, tobacco #684832, ice blue #CBDCDF, butter #F6E199, salmon pink #E29A86, rust #9F5130',
 'kids': 'lemon #EDDD59, aqua #58C9D4, grass green #75A14F, coral #F6745F, lavender #BDB0D0, sand #DAC7AB, red #D01C1F, navy #2B2E43',
 'girls': 'vintage pink, pastel green, soft navy, coral and lavender'}
SUBJ = {
 ('colours', 'season-colours'): 'A neat grid of folded fabric swatches (cotton poplin, linen, jersey, satin) in the season palette: {pal}. Each swatch a solid colour, arranged as a colour card.',
 ('colours', 'theme-colour-palettes'): 'Four small groups of fabric swatches side by side, one group per theme, using the palette: {pal}.',
 ('colours', 'colour-stories'): 'Three styled flat lays side by side, each a separate colour story drawn from: {pal}, with garments, swatches and one accessory each.',
 ('business-strategy', 'category-opportunities'): 'A buyer\'s range-planning table: garments from the key categories laid out in rows with blank swing tags, a tape measure and fabric swatches.',
 ('business-strategy', 'assortment-pricing'): 'A rail of garments grouped core, seasonal and statement, with blank price tags, seen in a showroom.',
 ('innovations', 'material-innovations'): 'Macro close-up of performance and sustainable fabrics: technical weaves, recycled fibre swatches, a water droplet beading on a treated surface.',
 ('innovations', 'design-production'): 'A design studio desk with a laptop showing a 3D garment simulation (no readable text), a paper pattern, fabric swatches and a sample garment.',
 ('trims', 'trim-stories'): 'Flat lay of trims grouped by theme: buttons, piping, tape, embroidery patches and zips on linen.',
 ('trims', 'trim-market-strategy'): 'A trim card board with buttons, piping, embroidery and labels pinned in neat rows, blank tags.',
 ('trims', 'trim-innovations'): 'Close-up of functional trims: hidden utility pocket, bonded seam, reflective tape, magnetic closure, on a garment.',
 ('couture', 'craft-techniques'): 'Close-up of hands-free atelier work in progress: hand embroidery on a hoop, beading needles, a garment on a dress form.',
 ('couture', 'materials-details'): 'Macro detail of premium materials: soft leather, organza, satin, beading and feathers arranged on a table.',
 ('styling', 'celebrity-influence'): 'A full outfit on a faceless display mannequin in a styled set suggesting a red carpet or front row, inspired by the report summary, with no recognisable person.',
 ('styling', 'partywear'): 'Party outfits on faceless mannequins or a rail, evening light, inspired by the report summary.',
 ('styling', 'casualwear'): 'Casual outfits styled as flat lays, inspired by the report summary.',
}
rows = []
for f in sorted(glob.glob('content/reports/ss27-*.json')):
    r = json.load(open(f))
    if r.get('images'):
        continue
    aud, cat, sub = r['audience'], r['category'], r['subsection']
    pal = PAL.get(aud, PAL['women'])
    s = SUBJ.get((cat, sub))
    subj = s.format(pal=pal) if s else f'Garments and details that show: {r["summary"]} Colour palette: {pal}.'
    if aud in ('kids', 'girls', 'boys', 'toddler-boys', 'toddler-girls'):
        subj += KIDS
    if aud in ('men',) and not s:
        subj += ' Menswear.'
    url = f"/forecasts/ss27/{aud}/{cat}/{r['slug']}/"
    fn = f"ss27-{aud}-{cat}-{r['slug']}"
    pr = 1 if r['kind'] == 'theme' or sub in ('season-colours', 'woven', 'knit') else 2
    rows.append({'priority': pr, 'audience': aud, 'category': cat, 'report': r['title'], 'page': 'https://forecut.in' + url,
                 'save_as': f'img/{fn}.webp', 'chatgpt_prompt': f'{subj} {BASE}',
                 'caption_on_site': f"{r['title']}: Forecut generated image, not a photograph of a real collection.",
                 'credit_on_site': 'Forecut. Generated with ChatGPT image generation (OpenAI); edited by Forecut.'})
rows.sort(key=lambda x: (x['priority'], ['women', 'men', 'kids', 'girls'].index(x['audience']), x['category']))
os.makedirs('build/docs', exist_ok=True)
with open('build/docs/images-to-generate-ss27.csv', 'w', newline='') as fh:
    w = csv.DictWriter(fh, fieldnames=list(rows[0]))
    w.writeheader(); w.writerows(rows)
print(len(rows), 'prompts')
