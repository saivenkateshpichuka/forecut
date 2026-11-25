"""Media inventory for the forecast library: every PDF and every image used on library pages, with its known provenance.
Writes docs/migration/pdfs.csv and docs/migration/images.csv. Provenance comes only from records in the repository;
anything without a record is marked 'not established' for the owner to confirm."""
import os, re, csv, json, subprocess

B = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(B)
OUT = os.path.join(B, 'docs', 'migration')
up = json.load(open(os.path.join(B, 'upload_log.json')))
ind = json.load(open(os.path.join(B, 'india_image_provenance.json')))
lag = json.load(open(os.path.join(B, 'lagos_image_provenance.json')))
ind_keys = set()
for f in ('india_detail_image_provenance.json',):
    for r in json.load(open(os.path.join(B, f))):
        ind_keys.add(r.get('slug', ''))

lib = []
for dp, dn, fn in os.walk(os.path.join(ROOT, 'forecasts')):
    lib += [os.path.join(dp, f) for f in fn if f.endswith('.html')]
pdf_used, img_used = {}, {}
for f in lib:
    h = open(f).read()
    page = '/' + os.path.relpath(os.path.dirname(f), ROOT) + '/'
    for p in set(re.findall(r'href="/output/reports/([^"]+\.pdf)"', h)):
        pdf_used.setdefault(p, set()).add(page)
    for p in set(re.findall(r'src="/img/([^"]+)"', h)):
        k = re.sub(r'(-\d+)?\.(webp|jpg|png|avif)$', '', p)
        img_used.setdefault(k, set()).add(page)


def first_date(path):
    r = subprocess.run(['git', '-C', ROOT, 'log', '--diff-filter=A', '--format=%ad', '--date=short', '--', path], capture_output=True, text=True).stdout.split()
    return r[-1] if r else ''


with open(os.path.join(OUT, 'pdfs.csv'), 'w', newline='') as fh:
    w = csv.writer(fh)
    w.writerow(['PDF', 'Size (KB)', 'First committed', 'Linked from (library pages)', 'Status'])
    for p in sorted(os.listdir(os.path.join(ROOT, 'output', 'reports'))):
        if p.endswith('.pdf'):
            fp = os.path.join(ROOT, 'output', 'reports', p)
            w.writerow([f'/output/reports/{p}', os.path.getsize(fp) // 1024, first_date(f'output/reports/{p}'), ' '.join(sorted(pdf_used.get(p, []))),
                        'kept at the same address; earlier edition of the report' if p in pdf_used else 'NOT LINKED'])

n_unknown = 0
added = {}
_t = subprocess.run(['git', '-C', ROOT, 'log', '--diff-filter=A', '--format=@%ad|%s', '--date=short', '--name-only', '--', 'img'], capture_output=True, text=True).stdout
_c = None
for line in _t.splitlines():
    if line.startswith('@'):
        _c = line[1:]
    elif line.startswith('img/') and _c:
        added[re.sub(r'(-\d+)?\.(webp|jpg|png|avif)$', '', line[4:])] = _c
with open(os.path.join(OUT, 'images.csv'), 'w', newline='') as fh:
    w = csv.writer(fh)
    w.writerow(['Image', 'Provenance on record', 'Credit to show', 'Used on (first library page)', 'Flag'])
    for k in sorted(img_used):
        base = re.sub(r'-(aw26|ss27|aw27|ss28|aw28)(-photo)?$|-photo$', '', k)
        if k in up or base in up:
            prov = f'Supplied by the Forecut team through the image upload folder on {up.get(k) or up.get(base)}; created for Forecut. Tool and licence terms not recorded.'
            credit, flag = 'Forecut', 'confirm tool and licence'
        elif k.startswith(('india-', 'festive-', 'summer-')) or base in ind_keys:
            prov = f'{ind["tool"]}, {ind["generated"]}: {ind["usage"]}'
            credit, flag = 'Forecut', ''
        elif 'lagos' in k:
            prov = f'{lag["tool"]}, {lag["date"]}'
            credit, flag = 'Forecut', ''
        elif k.startswith(('cover-', 'hero-', 'theme-', 'tool-')):
            prov = 'Forecut cover or theme image produced from the prompt lists in this repository (cover_prompts.py, report-cover-prompts.csv); upload date not recorded.'
            credit, flag = 'Forecut', 'confirm tool and licence'
        elif k in added:
            d, subj = added[k].split('|', 1)
            prov = f'Added {d} in "{subj[:140]}". Tool and licence terms not recorded.'
            credit, flag = 'Forecut', 'confirm tool and licence'
        else:
            prov, credit, flag = 'Not established', '', 'provenance not established'
            n_unknown += 1
        w.writerow([f'/img/{k}', prov, credit, sorted(img_used[k])[0], flag])
print('pdfs:', sum(1 for _ in open(os.path.join(OUT, 'pdfs.csv'))) - 1, 'images:', len(img_used), 'provenance not established:', n_unknown)
