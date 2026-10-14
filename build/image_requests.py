"""Write ../image-requests.csv: for every hub/article image, free-licensed search links (Unsplash, Pexels,
Wikimedia Commons, The Met Open Access) + an AI prompt as fallback, with status. Rule: real free-licensed photo first,
AI image only if no good real photo exists. Credits for real photos go in ../image-credits.csv."""
import csv, os, urllib.parse as U, sys
sys.path.insert(0, '.')
import credits as CR
KW = {
 'hub-couture': 'couture atelier embroidery', 'hub-couture-women': 'indian bridal lehenga', 'hub-couture-men': 'sherwani groom',
 'hub-couture-kids': 'indian kids ethnic wear wedding', 'hub-couture-what-is': 'hand embroidery couture', 'hub-couture-brand': 'fashion showroom gowns',
 'hub-couture-story': 'fashion designer mood board', 'hub-couture-innovation': 'fashion atelier sewing', 'hub-couture-history': 'worth gown',
 'hub-couture-capitals': 'paris fashion atelier', 'hub-couture-gown': 'ball gown dress form', 'hub-couture-bespoke': 'bespoke tailor',
 'hub-couture-bridal': 'bridal gown', 'hub-couture-paris': 'fashion runway paris', 'hub-couture-icw': 'indian fashion runway',
 'hub-fabrics': 'fabric rolls textile', 'hub-fabrics-weave': 'woven fabric macro', 'hub-fabrics-handloom': 'handloom weaver india',
 'hub-fabrics-knit': 'knit texture', 'hub-fabrics-innovation': 'textile samples', 'hub-fabrics-weight': 'fabric swatches',
 'hub-fabrics-news': 'textile trade fair', 'hub-fabrics-upcoming': 'textured fabric', 'hub-fabrics-prints': 'block printing india',
 'hub-fabrics-embroidery': 'zardozi embroidery', 'hub-fabrics-handwork': 'mirror embroidery kutch',
 'hub-colour': 'fabric swatches colours', 'hub-colour-theory': 'colour swatches design', 'hub-colour-tcx': 'colour swatches textile',
 'hub-colour-india': 'indian festival colours fabric', 'hub-colour-skin': 'indian women kurta', 'hub-colour-story': 'colour palette flat lay',
}
MET = ('history', 'gown', 'couture', 'embroidery', 'handwork', 'prints', 'weave')
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
prompts = {r['File name'].rsplit('.', 1)[0]: r for r in csv.DictReader(open(os.path.join(R, 'hub-image-prompts.csv'), encoding='utf-8'))}
rows = []
for slug, r in prompts.items():
    kw = KW.get(slug, slug.replace('hub-', '').replace('-', ' '))
    has = any(os.path.exists(os.path.join(R, 'img', slug + '.webp')) for _ in [0])
    status = 'Done: real photo' if slug in CR.C else ('Done: AI image (replace with a real photo if you find one)' if has else 'Needed')
    rows.append([slug + '.jpg', r['Page'], status, kw,
                 'https://unsplash.com/s/photos/' + U.quote(kw.replace(' ', '-')),
                 'https://www.pexels.com/search/' + U.quote(kw) + '/',
                 'https://commons.wikimedia.org/w/index.php?title=Special:MediaSearch&type=image&search=' + U.quote_plus(kw),
                 ('https://www.metmuseum.org/art/collection/search?showOnly=openAccess&q=' + U.quote_plus(kw)) if any(m in slug for m in MET) else '',
                 r['Prompt']])
rows.sort(key=lambda x: (not x[2].startswith('Needed'), x[0]))
with open(os.path.join(R, 'image-requests.csv'), 'w', newline='', encoding='utf-8') as f:
    w = csv.writer(f)
    w.writerow(['File name', 'Page', 'Status', 'Search keywords', 'Unsplash (free)', 'Pexels (free)', 'Wikimedia Commons (credit required)', 'The Met Open Access (free, CC0)', 'AI prompt (only if no good real photo)'])
    w.writerows(rows)
print('image requests', len(rows), sum(r[2] == 'Needed' for r in rows), 'needed')
