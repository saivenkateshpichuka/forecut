"""Write ../tool-cover-prompts.csv: one new cover picture per Forecut tool, in the current brand style.

Save each picture as images/tool-<slug>.png (16:9, at least 1600x900). The images workflow turns it into
tools/covers/<slug>.webp (1280x720), <slug>-640.webp and <slug>-og.jpg (1200x630, social preview), so the Tools page,
Home, landing page and each tool's share card all update together."""
import csv, os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from tools_hub import TOOLS

STYLE = ('Shot as a premium editorial still life in a calm fashion design studio. Brand palette: deep forest green (#1F3D33), warm cream paper (#F5F0E8), '
         'terracotta accents (#A9481F) and natural linen, oak and brass. Soft daylight from a window on the left, gentle shadows, shallow depth of field, '
         'true-to-life textures, photographic, not illustrated, not CGI. Landscape 16:9. Keep the main subject in the centre and right; leave a little calm space at the edges so it can be cropped to 1200x630. '
         'Any paper, screen or label in the scene shows only blurred, illegible marks, never readable words or numbers. No text, no logos, no brand names, no watermark, no people\'s faces.')

SCENE = {
    'trend-to-style': 'A runway photo print pinned beside a fresh pencil sketch of the same garment detail, a printed style card with a fabric swatch and colour chip clipped to it, a tape measure and a brass clip',
    'rangeboard': 'A large collection planning board on a studio wall: rows of small garment sketches grouped by drop, colourway chips and fabric swatches under each style, a few pinned paper cards and a hand reaching to move one',
    'style-tracker': 'A production wall with style cards moving across columns from sketch to sample to approval to store, each card with a tiny garment photo and coloured status tag, a laptop below showing a matching board',
    'swatchsmith': 'A fan of fabric and paper colour swatches spread on cream paper in a harmonious seasonal palette (cobalt, orange, pink, sage, clay, stone, cream), with a swatch book and yarn wraps',
    'textile-calculator': 'A textile lab bench: a fabric sample on a GSM cutter and digital scale, a pick glass on woven cloth, yarn cones and a calculator, notes with blurred marks',
    'textile-processing-studio': 'A dye and finishing studio: glass beakers of dye in graded shades, dyed cotton swatches drying on a line, a small screen-print frame and a washed denim sample',
    'materials-library': 'An organised fabric and trims library: labelled swatch cards hanging on rails, open drawers of buttons, zips, snaps and ribbons, a magnifier on a wool swatch',
    'pattern-maker': 'A pattern-cutting table with brown-paper garment pattern pieces, a French curve, pattern notcher, pins and chalk, and a laptop beside them showing the same pattern draped on a 3D avatar',
    '3d-drape-studio': 'A large monitor showing a garment draped in 3D on a soft grey avatar with fabric folds and a colour-coded fit map, a real fabric swatch and a tailor\'s dummy beside the desk',
    'size-chart-builder': 'A graded paper pattern nest showing several sizes outlined in fine coloured lines, a measuring tape running across it, a clipboard with a size chart grid of blurred marks',
    'decoration-cost-estimator': 'An embroidery hoop with a half-finished motif in coloured thread, a screen-printed sample beside it, thread cones, a few sequins and a costing sheet with blurred marks',
    'tech-pack-builder': 'A supplier-ready tech pack spread on the desk: a flat technical drawing with callout arrows, a bill of materials page, fabric and trim swatches stapled on, a measurement sheet, all with illegible marks',
    'fit-qc-studio': 'A fit session: a garment on a dress form with pins along the side seam, a tape measure around the waist, a tablet showing before and after photos, an inspection checklist on a clipboard',
    'pricefold': 'A cost sheet beside a folded garment with a blank swing tag, a calculator, a few coins and a pen, with a small stack of fabric swatches showing the materials being costed',
    'evenpoint': 'A planning desk with a laptop showing a simple rising line chart crossing a horizontal line, a folded sample garment, a notebook and a coffee cup',
    'cutclock': 'A large wall production calendar with weeks marked in green and terracotta, pinned fabric and sample photos on key dates, a laptop calendar view below',
    'care-label-generator': 'Close-up of woven and printed care labels with laundry symbols on cream satin tape, a garment inside seam where one label is sewn in, a small roll of label tape',
    'product-description-writer': 'A product photography corner: a folded garment on a cream backdrop, a laptop with a blurred product page, a notebook and fabric swatch',
    'export-market-checker': 'A shipping and export desk: a folded garment in a box, a world map, document folders, a passport-style document holder and parcel tape, all paperwork illegible',
}


def main():
    rows = []
    slugs = [t['slug'] for t in TOOLS] + ['3d-drape-studio']
    T = {t['slug']: t for t in TOOLS}
    T['3d-drape-studio'] = {'title': '3D Drape Studio', 'lead': 'See fabric drape on a 3D body before you sample.'}
    for n, sl in enumerate(slugs, 1):
        t = T[sl]
        rows.append([n, f'tool-{sl}.png', t['title'].replace('&', 'and'), t['lead'], f'/{sl}.html', '16:9 landscape, at least 1600x900',
                     f'Cover picture for the "{t["title"].replace("&", "and")}" fashion design tool. Scene: {SCENE[sl]}. {STYLE}'])
    with open('../tool-cover-prompts.csv', 'w', newline='', encoding='utf-8') as f:
        w = csv.writer(f)
        w.writerow(['No.', 'File name', 'Tool', 'What the tool does', 'Page', 'Shape', 'Prompt'])
        w.writerows(rows)
    print(len(rows), 'tool cover prompts')


if __name__ == '__main__':
    main()
