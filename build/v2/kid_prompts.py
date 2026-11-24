"""Thumbnail prompts for the kidswear pieces (final pipeline, Nov 2026).
Writes ../kids-thumbnail-prompts.csv. Save each picture in images/ as kid-<slug>.png; the images workflow
converts it to img/kid-<slug>.webp and the kids forecast pages pick it up. Pictures already in img/ are left out.
Product-only photos: no children, no faces, no logos, no brand names, no text."""
import csv, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))
import kids_data as KD

ROOT = os.path.dirname(os.path.dirname(HERE))
IMG = set(os.path.splitext(f)[0] for f in os.listdir(os.path.join(ROOT, 'img')))
AGE = {'tg': 'toddler (age 2)', 'tb': 'toddler (age 2)', 'g': 'child (age 8)', 'b': 'child (age 8)', 'k': 'child (age 6)'}
BG = {'w': 'laid flat on a pale oak table with soft daylight', 'k': 'folded and laid flat on warm cream linen with soft daylight', 'f': 'a pair placed on a light wooden floor with soft daylight'}


def islug(x):
    return ''.join(ch.lower() if ch.isalnum() else '-' for ch in x).strip('-').replace('--', '-').replace('--', '-')


def main():
    rows = []
    for name, aud, cat, kind, area, note, life in KD.K:
        fn = 'kid-' + islug(name)
        if fn in IMG:
            continue
        size = AGE[aud.split()[0]]
        p = (f'Realistic product photograph of children\'s clothing: {name.lower()} sized for a {size}, {BG[kind]}. {note} '
             f'Show the {area.lower()} clearly. Natural fabric texture, true-to-life colour, gentle shadows, editorial kidswear catalogue style. '
             'One single item or outfit, no collage. No child, no people, no faces, no mannequin, no logos, no brand names, no text. Square 1:1.')
        rows.append([name, cat, aud, fn + '.png', '1:1 square', p])
    out = os.path.join(ROOT, 'kids-thumbnail-prompts.csv')
    with open(out, 'w', newline='', encoding='utf-8') as f:
        w = csv.writer(f)
        w.writerow(['Piece', 'Category', 'Audience tags', 'File name', 'Shape', 'Prompt'])
        w.writerows(rows)
    print('kids prompts written:', len(rows))


if __name__ == '__main__':
    main()
