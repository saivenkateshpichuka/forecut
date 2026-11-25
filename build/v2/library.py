"""Forecut forecast library (Phase 1, 25 Nov 2026).

Hierarchy: Forecasts > Season > Audience > Category > Subsection > Report or theme
URLs:      /forecasts/  /forecasts/ss27/  /forecasts/ss27/men/  /forecasts/ss27/men/colours/  /forecasts/ss27/men/colours/<report>/
Shared season research (true for several audiences) lives one level up: /forecasts/ss27/colours/<report>/ and is linked
from each audience it applies to; it is never copied into separate audience reports.

Settings (featured year, seasons and their status, audiences, categories) come from content/settings.json.
Existing forecast pages are moved here unchanged in content: the same generator renders them at the new address,
with the hierarchy, publication data and version history added. Old addresses redirect only after the new page is checked.
Editorial reports written for this structure live in content/reports/*.json (status: draft | review | published | archived).
"""
import os, re, json, hashlib, subprocess, datetime, csv, html as HT

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
CONTENT = os.path.join(ROOT, 'content')
SET = json.load(open(os.path.join(CONTENT, 'settings.json')))
AUDS = SET['audiences']
AUD = {a['id']: a for a in AUDS}
CATS = SET['categories']
CAT = {c['id']: c for c in CATS}
SUB = {(c['id'], s['id']): s['name'] for c in CATS for s in c['subsections']}
SUB.update({(c['id'], 'overview'): 'Season reports' for c in CATS})
SUB.update({('silhouettes', 'footwear'): 'Footwear', ('fabrics', 'across'): 'Across woven and knit', ('silhouettes', 'knit'): 'Knit Silhouettes', ('themes', 'themes'): 'Themes'})
KIDS = ['kids', 'boys', 'girls', 'toddler-boys', 'toddler-girls']
ADULT = ['men', 'women']
ALL = [a['id'] for a in AUDS]
OLD_AUD = {'mens': 'men', 'womens': 'women', 'kids': 'kids', 'boys': 'boys', 'girls': 'girls', 'toddler-boys': 'toddler-boys', 'toddler-girls': 'toddler-girls'}
OLD_CAT = {'themes': 'themes', 'theme': 'themes', 'colours': 'colours', 'silhouettes': 'silhouettes', 'fabrics': 'fabrics', 'trims': 'trims',
           'styling': 'styling', 'couture': 'couture', 'business': 'business-strategy', 'innovations': 'innovations'}


def seasons(V):
    return [x['id'] for x in SET['seasons'] if x['status'] in ('published', 'archive') and x['id'] in V.META]


def status(s):
    return next((x['status'] for x in SET['seasons'] if x['id'] == s), 'draft')


def year(s):
    return 2000 + int(s[2:])


def featured(V):
    return [s for s in seasons(V) if year(s) == SET['featured_year'] and status(s) == 'published']


def url(s, aud=None, cat=None, slug=None):
    p = f'/forecasts/{s}/' + (f'{aud}/' if aud and aud != 'all' else '') + (f'{cat}/' if cat else '') + (f'{slug}/' if slug else '')
    return p


def key_of(u):
    return u.strip('/') + '/index'


# ------------------------------------------------------------------ migration map
def mapping(V, s):
    """(legacy page, audience|'all', category, subsection, new slug, also-for audiences) for every existing forecast page of a season."""
    out = []
    for s_, t in V.REPORTS:
        if s_ != s:
            continue
        rs = V.report_slug(s, t)
        if t == 'themes':
            out.append((rs, 'women', 'themes', 'themes', 'season-themes', []))
        elif t == 'colour':
            out.append((rs, 'all', 'colours', 'season-colours', 'colour-forecast', ALL))
        elif t == 'womenswear':
            out.append((rs, 'women', 'silhouettes', 'woven', 'womenswear-season-report', []))
        elif t == 'menswear':
            out.append((rs, 'men', 'silhouettes', 'woven', 'menswear-season-report', []))
        elif t == 'footwear':
            out.append((rs, 'all', 'silhouettes', 'footwear', 'footwear-season-report', ADULT))
        elif t == 'knitwear':
            out.append((rs, 'all', 'silhouettes', 'knit', 'knitwear-season-report', ADULT))
        elif t == 'fabrics':
            out.append((rs, 'all', 'fabrics', 'overview', 'fabrics-season-report', ADULT))
        elif t == 'trims':
            out.append((rs, 'all', 'trims', 'overview', 'trims-season-report', ADULT))
        for sl, ti, kd, ky in V.chapters(s, t):
            rest = sl[len(s) + 1:]
            if t == 'themes':
                out.append((sl, 'women', 'themes', 'themes', rest[len('theme-'):], []))
            elif t == 'colour':
                if kd == 'cdept':
                    a = {'womenswear': 'women', 'menswear': 'men', 'kidswear': 'kids', 'footwear': 'all'}[ky]
                    out.append((sl, a, 'colours', 'season-colours', f'{ky}-colour', ALL if a == 'all' else (['boys', 'girls', 'toddler-boys', 'toddler-girls'] if a == 'kids' else [])))
                elif kd == 'cstory':
                    out.append((sl, 'all', 'colours', 'colour-stories', rest[len('colour-story-'):], ALL))
                else:
                    out.append((sl, 'all', 'colours', 'season-colours', rest, ALL))
            elif t == 'womenswear':
                out.append((sl, 'women', 'silhouettes', 'knit' if ky.endswith('Knitwear') else 'woven', rest[len('womenswear-'):], []))
            elif t == 'menswear':
                out.append((sl, 'men', 'silhouettes', 'knit' if ky.endswith('Knitwear') else 'woven', rest[len('menswear-'):], []))
            elif t == 'footwear':
                c = ky.split('|')[1]
                a = 'women' if c in ('Heels & Flats', 'Boots') else 'men' if c == "Men's Shoes" else 'all'
                out.append((sl, a, 'silhouettes', 'footwear', rest[len('footwear-'):].replace('men-s-shoes', 'mens-shoes'), ADULT if a == 'all' else []))
            elif t == 'fabrics':
                out.append((sl, 'all', 'fabrics', 'across', rest[len('fabrics-'):].replace('fabrics', 'fabrics-and-materials') if rest == 'fabrics-fabrics' else rest[len('fabrics-'):], ADULT))
            elif t == 'trims':
                out.append((sl, 'all', 'trims', 'trending-trims', rest[len('trims-'):], ADULT))
    seen, uniq = set(), []
    for r in out:  # knitwear chapters are listed under both the knitwear and the department reports: keep one home
        if r[0] not in seen:
            seen.add(r[0]); uniq.append(r)
    return uniq


# pages that stay at their own address and are linked from the hierarchy (articles, regional editions, complete season pages)
def related(V):
    R = []
    S = seasons(V)
    later = [s for s in S if s != 'aw26']

    def add(page, ss, auds, cat, sub, why):
        if os.path.exists(os.path.join(ROOT, page + '.html')):
            R.append(dict(page=page, seasons=ss, auds=auds, cat=cat, sub=sub, why=why))
    for c in ('couture-kids-occasion',):
        add(c, S, KIDS, 'couture', 'reports', 'Forecut Couture article')
    for c in ('couture-menswear-guide', 'couture-bespoke-menswear'):
        add(c, S, ['men'], 'couture', 'reports', 'Forecut Couture article')
    for c in ('couture-bridal-east-west', 'couture-gown-anatomy'):
        add(c, S, ['women'], 'couture', 'reports', 'Forecut Couture article')
    for c in ('couture-innovations', 'couture-storytelling', 'couture-what-is-haute-couture'):
        add(c, S, ADULT, 'couture', 'reports', 'Forecut Couture article')
    for f in sorted(os.listdir(ROOT)):
        if f.startswith('innovation-') and f.endswith('.html'):
            add(f[:-5], later, ALL, 'innovations', 'reports', 'Forecut Fabrics innovation report')
    for p in ('fabrics-ss27-runway-fabric-report', 'fabrics-milan-ss27-sheer-gloss', 'fabrics-paris-ss27-featherlight'):
        add(p, ['ss27'], ADULT, 'fabrics', 'across', 'Runway fabric report')
    add('fabrics-forecast-ss27-aw27', ['ss27', 'aw27'], ADULT, 'fabrics', 'across', 'Fabric forecast')
    add('fabrics-mill-report-aw27-28', ['aw27'], ADULT, 'fabrics', 'across', 'Mill and fabric fair report')
    add('fabrics-upcoming-2027-28', ['aw27', 'ss28'], ADULT, 'fabrics', 'across', 'Fabric outlook')
    add('ss27-shoe-trends-global-buyers-guide', ['ss27'], ADULT, 'silhouettes', 'footwear', 'Forecut Journal buyer\'s guide')
    add('celebrity-style', featured(V), ADULT, 'styling', 'celebrity', 'Celebrity style tracker (updated regularly)')
    for p in ('north-america-ss27-us-canada-mexico-guide', 'east-asia-ss27-china-japan-korea-guide', 'southeast-asia-ss27-jakarta-ramadan-lunar-new-year-guide',
              'gulf-ramadan-2027-ss27-modest-luxury', 'australia-spring-racing-summer-ss27-oceania-guide', 'eu-unsold-clothes-destruction-ban-ss27-europe-guide',
              'brazil-summer-spfw-n61-beachwear-guide'):
        add(p, ['ss27'], ALL, 'business-strategy', 'reports', 'Regional selling guide')
    return R


SEASON_LINKS = {  # season overview: complete season edition, regional editions, pre-collections
    'aw26': ['aw26', 'india-festive-26'], 'ss27': ['ss27', 'resort-27', 'india-summer-27'], 'aw27': ['aw27', 'pre-fall-27', 'india-festive-27'],
    'ss28': ['ss28', 'india-summer-28'], 'aw28': ['aw28', 'india-festive-28'],
}


# ------------------------------------------------------------------ dates and versions
def git_dates(pages):
    """{page: [dates]} from the repository history of each page's original file (oldest first)."""
    files = [p + '.html' for p in pages]
    out = {p: [] for p in pages}
    try:
        txt = subprocess.run(['git', '-C', ROOT, 'log', '--format=@%ad', '--date=short', '--name-only', '--'] + files,
                             capture_output=True, text=True, timeout=300).stdout
    except Exception:
        return out
    d = None
    for line in txt.splitlines():
        if line.startswith('@'):
            d = line[1:]
        elif line.strip().endswith('.html'):
            p = line.strip()[:-5]
            if p in out and d and d not in out[p]:
                out[p].append(d)
    return {p: sorted(v) for p, v in out.items()}


def body_hash(html):
    m = re.search(r'<div class="w" id="report">(.*)</main>', html, re.S)
    b = m.group(1) if m else html
    b = re.sub(r'\d{1,2} [A-Z][a-z]+ 20\d\d', '', b)
    return hashlib.sha256(b.encode()).hexdigest()[:16]


def versions(cid, html, dates, today, store):
    vs = store.get(cid)
    h = body_hash(html)
    if not vs:
        vs = [{'v': i + 1, 'date': d, 'note': 'Earlier edition at the original address'} for i, d in enumerate(dates)] or []
        vs.append({'v': len(vs) + 1, 'date': today, 'hash': h, 'note': 'Moved into the season, audience and category structure'})
        store[cid] = vs
    elif vs[-1].get('hash') != h:
        vs.append({'v': len(vs) + 1, 'date': today, 'hash': h, 'note': 'Updated'})
    return vs


# ------------------------------------------------------------------ page parts
def poss(aud):
    return AUD[aud]['possessive'] if aud in AUD else ''


def label(V, s, aud):
    return V.META[s]['code'] + (' ' + AUD[aud]['name'] if aud in AUD else '')


def fmt(d):
    try:
        return datetime.date.fromisoformat(d).strftime('%-d %B %Y')
    except Exception:
        return d


def crumbs(V, s, aud, cat, sub, title):
    p = [('/forecasts/', 'Forecasts'), (url(s), V.META[s]['code'])]
    if aud in AUD:
        p.append((url(s, aud), AUD[aud]['name']))
    p.append((url(s, aud, cat), CAT[cat]['name']))
    return '<div class="w crumb">' + ' / '.join(f'<a href="{u}">{V.E(t)}</a>' for u, t in p) + (f' / {V.E(SUB.get((cat, sub), ""))}' if sub not in ('overview', None) and SUB.get((cat, sub)) != CAT[cat]['name'] else '') + f' / {V.E(title)}</div>'


def meta_panel(V, it, vs):
    aud = AUD[it['aud']]['name'] if it['aud'] in AUD else 'All audiences'
    also = ', '.join(AUD[a]['name'] for a in it['also'] if a in AUD)
    rows = [('Season', V.META[it['s']]['title']), ('Audience', aud + (f' (shared with {also})' if it['aud'] == 'all' and also else '')),
            ('Category', CAT[it['cat']]['name'] + ('' if it['sub'] == 'overview' else ', ' + SUB.get((it['cat'], it['sub']), ''))),
            ('First published', fmt(vs[0]['date'])), ('Last updated', fmt(vs[-1]['date'])), ('Version', f'{vs[-1]["v"]}, {fmt(vs[-1]["date"])}'),
            ('Market', 'Global'), ('Content ID', it['id'])]
    hist = ''.join(f'<li>Version {v["v"]}, {fmt(v["date"])}: {V.E(v["note"])}</li>' for v in reversed(vs[-12:]))
    return ('<section class="w metap" aria-label="About this report"><dl>' + ''.join(f'<div><dt>{a}</dt><dd>{V.E(b)}</dd></div>' for a, b in rows) +
            f'</dl><details><summary>Revision history</summary><ul class="small gr">{hist}</ul><p class="small gr">Earlier addresses: /{it["legacy"]}</p></details></section>')


def thumb(html):
    m = re.search(r'<div class="chhero">(.*?)</div>', html, re.S)
    if m:
        i = re.search(r'<img[^>]*?src="([^"]+)"', m.group(1))
        if i:
            return i.group(1)
    i = re.search(r'<img[^>]*?src="(/img/[^"]+)"', html)
    return i.group(1) if i else None


def swatch(html):
    m = re.search(r'background:(#[0-9a-fA-F]{6})', html)
    return m.group(1) if m else '#e8e1d6'


def desc_of(html):
    m = re.search(r'<meta name="description" content="([^"]*)"', html)
    return HT.unescape(m.group(1)) if m else ''


def h1_of(html):
    m = re.search(r'<h1[^>]*>(.*?)</h1>', html, re.S)
    return HT.unescape(re.sub(r'<[^>]+>', '', m.group(1))).strip() if m else ''


def card(V, it, show_aud=True):
    img = f'<img src="{it["img"]}" alt="" loading="lazy">' if it.get('img') else f'<i style="background:{it.get("sw", "#e8e1d6")}"></i>'
    who = (AUD[it['aud']]['name'] if it['aud'] in AUD else 'All audiences') if show_aud else ''
    sub = SUB.get((it['cat'], it['sub']), '')
    return (f'<a class="rcard" href="{it["url"]}" data-sub="{it["sub"]}" data-date="{it.get("updated", "")}" data-title="{V.E(it["title"].lower())}">'
            f'<span class="rci">{img}</span><span class="rct"><span class="small gr">{V.META[it["s"]]["code"]}{", " + V.E(who) if who else ""}{", " + V.E(sub) if sub and it["sub"] != "overview" else ""}</span>'
            f'<b>{V.E(it["title"])}</b><span class="small gr rcd">{V.E(it["desc"][:150])}</span>'
            '</span></a>')


def rel_card(V, r, title):
    return (f'<a class="rcard rel" href="/{r["page"]}.html" data-sub="{r["sub"]}"><span class="rct"><span class="small gr">{V.E(r["why"])}</span><b>{V.E(title)}</b></span></a>')


def page(V, path, title, desc, crumb, head_html, body, si=None):
    V._PATH[:] = [path, si]
    h = V.head(f'{title} | Forecut', desc) + V.nav_app('Forecasts') + '<main id="main">' + crumb + head_html + body + '</main>'
    return h + V.footer() + V.end()


def phead(V, kicker, title, lead, actions=''):
    return (f'<section class="w lhead"><p class="small gr">{V.E(kicker)}</p><h1 class="dsp">{V.E(title)}</h1>'
            f'<p class="lead">{V.E(lead)}</p>{actions}</section>')


def lsec(i, t, sub, inner):
    return f'<section class="w lsec" id="{i}"><div class="rsh"><h2 class="dsp">{t}</h2><p class="gr">{sub}</p></div>{inner}</section>'


def prep(V, what):
    return f'<p class="prep">{V.E(what)}</p>'


# ------------------------------------------------------------------ build
def build(V, pages):
    """Move existing forecast pages into the hierarchy and build the library pages. Returns (new pages, redirects, items)."""
    today = V.TODAY.isoformat()
    vstore_p = os.path.join(CONTENT, 'versions.json')
    vstore = json.load(open(vstore_p)) if os.path.exists(vstore_p) else {}
    S = seasons(V)
    M = {s: mapping(V, s) for s in S}
    legacy = [m[0] for s in S for m in M[s]]
    gd = git_dates(legacy)
    items, newp, redirect = [], {}, {}
    to_new = {}
    for s in S:
        for lg, aud, cat, sub, slug, also in M[s]:
            to_new[lg] = url(s, aud, cat, slug)
    # 1. migrated pages: same generator output, new address, hierarchy and publication data added
    for s in S:
        for lg, aud, cat, sub, slug, also in M[s]:
            if lg not in pages:
                continue
            u = to_new[lg]
            src = pages[lg]
            title = h1_of(src)
            cid = 'fc-' + u.strip('/').replace('forecasts/', '').replace('/', '-')
            it = dict(id=cid, s=s, aud=aud, cat=cat, sub=sub, slug=slug, also=also, url=u, legacy=lg, title=title,
                      desc=desc_of(src), img=thumb(src), sw=swatch(src), h1=title)
            # re-render at the new address so canonical, share data and the print footer belong to the new page
            html = src.replace(f'{V.BASE}{lg}.html', f'{V.BASE}{u.lstrip("/")}')
            vs = versions(cid, html, gd.get(lg, []), today, vstore)
            it['updated'] = vs[-1]['date']
            it['version'] = vs[-1]['v']
            html = html.replace(f'Updated {V.TODAY.strftime("%-d %B %Y")}.', f'Updated {fmt(vs[-1]["date"])}.')
            html = re.sub(r'<div class="w crumb">.*?</div>', lambda m: crumbs(V, s, aud, cat, sub, title), html, count=1, flags=re.S)
            mp = meta_panel(V, it, vs)
            m = re.search(r'<section class="w rhead">.*?</section>', html, re.S)
            html = html[:m.end()] + mp + html[m.end():] if m else html.replace('<main id="main">', '<main id="main">' + mp, 1)
            if 'data-print' not in html:
                html = re.sub(r'(<div class="ctas">)', r'\1<button class="btn o" type="button" data-print>Download PDF</button>', html, count=1)
            ctx = {'season': V.META[s]['code'], 'aud': AUD[aud]['name'] if aud in AUD else 'All audiences', 'src': title, 'url': u, 'id': cid, 'v': vs[-1]['v'], 'vdate': vs[-1]['date']}
            html = html.replace('<div class="prt-foot">forecut.in</div>', '')
            html = html.replace('</body>', f'<div class="prt-foot">forecut.in{u} · {cid} · version {vs[-1]["v"]}, {fmt(vs[-1]["date"])}</div>'
                                f'<script>window.FC_CTX={json.dumps(ctx, ensure_ascii=False)}</script></body>', 1)
            it['pdf'] = True
            newp[key_of(u)] = html
            redirect[lg] = u
            items.append(it)
    # 2. links between moved pages point to their new addresses
    def relink(h):
        return re.sub(r'href="/([a-z0-9-]+)(?:\.html)?(#[^"]*)?"', lambda m: f'href="{to_new[m.group(1)]}{m.group(2) or ""}"' if m.group(1) in to_new else m.group(0), h)
    for k in list(newp):
        newp[k] = relink(newp[k])
    for k in list(pages):
        if k not in redirect:
            pages[k] = relink(pages[k])
    # 3. editorial reports written for the structure (published only)
    for f in sorted(os.listdir(os.path.join(CONTENT, 'reports'))) if os.path.isdir(os.path.join(CONTENT, 'reports')) else []:
        if f.endswith('.json'):
            r = json.load(open(os.path.join(CONTENT, 'reports', f)))
            if r.get('status') == 'published' and r.get('season') in S:
                import reports_render as RR
                r.setdefault('slug', os.path.splitext(f)[0])
                it, html = RR.render(V, r, vstore, today)
                newp[key_of(it['url'])] = html
                items.append(it)
    import reports_render as RR
    for k in [k for k in newp if 'id="related"></section>' in newp[k]]:
        it = next((i for i in items if key_of(i['url']) == k), None)
        if it:
            newp[k] = newp[k].replace('<section class="rs" id="related"></section>', '<section class="rs" id="related">' + RR.related_block(V, it, items) + '</section>')
    REL = related(V)
    rtitle = {r['page']: HT.unescape((re.search(r'<title>([^<|]*)', open(os.path.join(ROOT, r['page'] + '.html'), encoding='utf-8', errors='ignore').read(5000)) or [None, r['page']])[1].strip()) for r in REL}
    # 4. library pages: season > audience > category > subsection > report
    for s in S:
        for a in AUDS:
            for c in CATS:
                newp[key_of(url(s, a['id'], c['id']))] = category_page(V, s, a['id'], c['id'], items, REL, rtitle)
                for sb in c['subsections']:
                    own = [i for i in items if i['s'] == s and i['aud'] == a['id'] and i['cat'] == c['id'] and i['sub'] == sb['id']]
                    if len(own) > 1:
                        newp[key_of(url(s, a['id'], c['id'], sb['id']))] = subsection_page(V, s, a['id'], c, sb, own)
            newp[key_of(url(s, a['id']))] = audience_page(V, s, a['id'], items, REL, rtitle)
        for c in CATS:
            newp[key_of(url(s, None, c['id']))] = shared_category_page(V, s, c['id'], items, REL, rtitle)
        newp[key_of(url(s))] = season_page(V, s, items)
    newp['forecasts/index'] = index_page(V, items)
    json.dump(vstore, open(vstore_p, 'w'), indent=1, ensure_ascii=False)
    return newp, redirect, items, REL





def tools_row(V, cat):
    T = {t['slug']: t for t in V.TOOLS}
    TF = {'themes': ['trend-to-style', 'rangeboard'], 'colours': ['swatchsmith', 'textile-processing-studio'], 'silhouettes': ['pattern-maker', 'size-chart-builder'],
          'fabrics': ['materials-library', 'textile-calculator'], 'trims': ['materials-library', 'decoration-cost-estimator'], 'styling': ['trend-to-style', 'rangeboard'],
          'couture': ['decoration-cost-estimator', 'pattern-maker'], 'business-strategy': ['rangeboard', 'pricefold', 'evenpoint'], 'innovations': ['textile-processing-studio', 'materials-library']}
    return '<div class="tlinks2">' + ''.join(f'<a class="atp" href="/{t}.html">{V.E(T[t]["title"].replace("&", "and"))}</a>' for t in TF[cat] if t in T) + '</div>'


def own_items(items, s, aud, cat=None, sub=None):
    return [i for i in items if i['s'] == s and i['aud'] == aud and (cat is None or i['cat'] == cat) and (sub is None or i['sub'] == sub)]


def tile_colour(V, s, aud, n):
    d = V.CF[s]['dept'].get({'men': 'menswear', 'women': 'womenswear'}.get(aud, 'kidswear'))
    cs = d['colours'] if d else V.CF[s]['key']
    return cs[n % len(cs)]['hex']


def thumb_card(V, href, title, sub, img, colour, live=True, extra=''):
    lum = (lambda h: (0.299 * int(h[1:3], 16) + 0.587 * int(h[3:5], 16) + 0.114 * int(h[5:7], 16)) / 255)(colour) if colour and len(colour) == 7 else 0
    ink = '#1c1714' if lum > 0.6 else '#ffffff'
    pic = f'<img src="{img}" alt="" loading="lazy">' if img else f'<i style="background:{colour}"><b style="color:{ink};text-shadow:none">{V.E(title.split(" ", 1)[1] if " " in title else title)}</b></i>'
    tag = 'a' if live else 'div'
    return (f'<{tag} class="rcard{"" if live else " off"}"{f" href=\"{href}\"" if live else ""}{extra}><span class="rci">{pic}</span>'
            f'<span class="rct"><b>{V.E(title)}</b><span class="small gr rcd">{V.E(sub)}</span></span></{tag}>')


def cat_thumb(V, s, aud, c, items, n):
    own = own_items(items, s, aud, c['id'])
    img = next((i['img'] for i in own if i.get('img')), None)
    title = f'{V.META[s]["code"]} {AUD[aud]["possessive"]} {c["name"]}'
    sub = 'Reports available' if own else 'In preparation'
    return thumb_card(V, url(s, aud, c['id']), title, sub, img, tile_colour(V, s, aud, n), extra=f' data-aud="{aud}" data-cat="{c["id"]}"')


def sub_thumbs(V, s, aud, c, items):
    """Report thumbnails inside a category: named themes, or one per subsection that has reviewed reports."""
    m = V.META[s]
    out, missing = [], []
    if c['id'] == 'themes':
        for i in own_items(items, s, aud, 'themes'):
            out.append(card(V, i, False))
        return out, missing
    for n, sb in enumerate(c['subsections']):
        own = own_items(items, s, aud, c['id'], sb['id'])
        title = f'{m["code"]} {AUD[aud]["possessive"]} {sb["name"]}'
        if not own:
            missing.append(title)
            continue
        if len(own) == 1:
            i = own[0]
            out.append(thumb_card(V, i['url'], title, i['title'] if i['title'] != title else i['desc'][:140], i.get('img'), tile_colour(V, s, aud, n)))
        else:
            img = next((i['img'] for i in own if i.get('img')), None)
            out.append(thumb_card(V, url(s, aud, c['id'], sb['id']), title, ', '.join(i['title'] for i in own[:4]), img, tile_colour(V, s, aud, n)))
    return out, missing


def category_page(V, s, aud, cat, items, REL, rtitle):
    m = V.META[s]
    c = CAT[cat]
    title = f'{m["code"]} {AUD[aud]["possessive"]} {c["name"]}'
    th, missing = sub_thumbs(V, s, aud, c, items)
    body = ''
    if th:
        body += lsec('reports', 'Reports', 'Open a report for the full analysis. Each page can be saved as a PDF.', '<div class="rgrid">' + ''.join(th) + '</div>')
    if missing or not th:
        names = missing if missing else []
        txt = ('In preparation: ' + '; '.join(names) + '.') if names else f'{title}: reports are in preparation.'
        body += lsec('prep', 'In preparation' if th else 'Reports', 'Reports appear here once their research has been reviewed.', prep(V, txt))
    rel = [r for r in REL if s in r['seasons'] and aud in r['auds'] and r['cat'] == cat]
    if rel:
        body += lsec('reading', 'Related reading', 'Articles and guides from Forecut on this subject.', '<div class="rgrid rl">' + ''.join(rel_card(V, r, rtitle[r['page']]) for r in rel) + '</div>')
    shared = [i for i in items if i['s'] == s and i['aud'] == 'all' and i['cat'] == cat]
    if shared:
        body += lsec('shared', 'Season research across audiences', f'{m["code"]} research that covers several audiences.', f'<p><a class="lk" href="{url(s, None, cat)}">{V.E(m["code"])} {V.E(c["name"])}: research across audiences</a></p>')
    body += lsec('tools', 'Related tools', 'Take this direction into your own work.', tools_row(V, cat))
    other = ''.join(f'<a class="atp{" on" if x["id"] == cat else ""}" href="{url(s, aud, x["id"])}">{V.E(x["name"])}</a>' for x in CATS)
    body += lsec('more', f'More {m["code"]} {AUD[aud]["name"]}', '', f'<div class="atps">{other}</div>')
    return page(V, key_of(url(s, aud, cat))[:-5], title, f'{title}: {c["about"]}',
                f'<div class="w crumb"><a href="/forecasts/">Forecasts</a> / <a href="{url(s)}">{m["code"]}</a> / <a href="{url(s, aud)}">{AUD[aud]["name"]}</a> / {V.E(c["name"])}</div>',
                phead(V, f'{m["title"]}, {AUD[aud]["name"]}', title, c['about']), body)


def subsection_page(V, s, aud, c, sb, own):
    m = V.META[s]
    title = f'{m["code"]} {AUD[aud]["possessive"]} {sb["name"]}'
    body = lsec('reports', 'Reports', 'Open a report for the full analysis. Each page can be saved as a PDF.', '<div class="rgrid">' + ''.join(card(V, i, False) for i in own) + '</div>')
    return page(V, key_of(url(s, aud, c['id'], sb['id']))[:-5], title, f'{title}: {c["about"]}',
                f'<div class="w crumb"><a href="/forecasts/">Forecasts</a> / <a href="{url(s)}">{m["code"]}</a> / <a href="{url(s, aud)}">{AUD[aud]["name"]}</a> / <a href="{url(s, aud, c["id"])}">{V.E(c["name"])}</a> / {V.E(sb["name"])}</div>',
                phead(V, f'{m["title"]}, {AUD[aud]["name"]}, {c["name"]}', title, c['about']), body)


def shared_category_page(V, s, cat, items, REL, rtitle):
    m = V.META[s]
    c = CAT[cat]
    sh = [i for i in items if i['s'] == s and i['aud'] == 'all' and i['cat'] == cat]
    title = f'{m["code"]} {c["name"]}: research across audiences'
    groups = {}
    for i in sh:
        groups.setdefault(SUB.get((cat, i['sub']), 'Reports'), []).append(i)
    inner = ''.join(f'<h3 class="sub">{V.E(g)}</h3><div class="rgrid" style="margin-bottom:28px">' + ''.join(card(V, i, False) for i in its) + '</div>' for g, its in groups.items())
    if not inner:
        inner = prep(V, f'No {m["code"]} {c["name"].lower()} research covers several audiences.')
    body = lsec('reports', 'Research across audiences', 'Season research that covers more than one audience.', inner)
    body += lsec('audiences', 'By audience', '', '<div class="atps">' + ''.join(f'<a class="atp" href="{url(s, a["id"], cat)}">{m["code"]} {V.E(a["possessive"])} {V.E(c["name"])}</a>' for a in AUDS) + '</div>')
    return page(V, key_of(url(s, None, cat))[:-5], title, f'{title}. {c["about"]}', f'<div class="w crumb"><a href="/forecasts/">Forecasts</a> / <a href="{url(s)}">{m["code"]}</a> / {V.E(c["name"])}</div>',
                phead(V, m['title'], title, c['about']), body)


def aud_block(V, s, aud, items, head=True):
    a = AUD[aud]
    m = V.META[s]
    h = (f'<div class="ablk" data-aud="{aud}"><h3 class="dsp"><a href="{url(s, aud)}">{m["code"]} {V.E(a["name"])}</a></h3>' if head else '<div class="ablk">')
    return h + '<div class="rgrid g9">' + ''.join(cat_thumb(V, s, aud, c, items, n) for n, c in enumerate(CATS)) + '</div></div>'


def audience_page(V, s, aud, items, REL, RT={}):
    m = V.META[s]
    a = AUD[aud]
    body = lsec('categories', 'Categories', 'Open a category for its reports.', aud_block(V, s, aud, items, head=False))
    body += lsec('tools', 'Start working', 'Send findings from any report to a Board, a Style Brief or the Collection Planner.', tools_row(V, 'themes') + tools_row(V, 'colours'))
    sw = ''.join(f'<a class="atp{" on" if x == s else ""}" href="{url(x, aud)}">{V.META[x]["code"]}</a>' for x in seasons(V))
    aw = ''.join(f'<a class="atp{" on" if x["id"] == aud else ""}" href="{url(s, x["id"])}">{V.E(x["name"])}</a>' for x in AUDS)
    body += lsec('more', 'Switch season or audience', '', f'<div class="atps">{sw}</div><div class="atps" style="margin-top:12px">{aw}</div>')
    title = f'{m["code"]} {a["name"]}'
    return page(V, key_of(url(s, aud))[:-5], title, f'{m["title"]} forecast for {a["name"].lower()}: themes, colours, silhouettes, fabrics, trims, styling, couture, business strategy and innovations.',
                f'<div class="w crumb"><a href="/forecasts/">Forecasts</a> / <a href="{url(s)}">{m["code"]}</a> / {V.E(a["name"])}</div>',
                phead(V, f'{m["title"]}, {m["stage"].lower()}', title, a['note'] + '.'), body)


def season_page(V, s, items):
    m = V.META[s]
    body = lsec('audiences', 'Audiences and categories', 'Every audience has its own nine categories.', ''.join(aud_block(V, s, a['id'], items) for a in AUDS))
    sh = [i for i in items if i['s'] == s and i['aud'] == 'all']
    if sh:
        cats = []
        for c in CATS:
            if any(i['cat'] == c['id'] for i in sh):
                cats.append(f'<a class="atp" href="{url(s, None, c["id"])}">{V.E(c["name"])}</a>')
        body += lsec('season', 'Research across audiences', 'Season research that covers several audiences: the colour forecast and colour stories, footwear, knitwear, fabrics and trims.', f'<div class="atps">{"".join(cats)}</div>')
    links = [p for p in SEASON_LINKS.get(s, []) if os.path.exists(os.path.join(ROOT, p + '.html'))]
    if links:
        lt = []
        for p in links:
            t = re.search(r'<title>([^<|]*)', open(os.path.join(ROOT, p + '.html'), encoding='utf-8', errors='ignore').read(5000))
            lt.append(f'<li><a href="/{p}.html">{V.E(HT.unescape(t.group(1).strip()) if t else p)}</a>{" (complete season edition on one page)" if p == s else ""}</li>')
        body += lsec('editions', 'Season editions and regional forecasts', '', f'<ul class="ul srcl">{"".join(lt)}</ul>')
    kick = f'{m["stage"]}, in stores {m["window"]}' + (' (earlier season)' if status(s) == 'archive' else '')
    return page(V, key_of(url(s))[:-5], f'{m["code"]} Forecast', f'{m["title"]} forecast: {m["intro"][:200]}',
                f'<div class="w crumb"><a href="/forecasts/">Forecasts</a> / {m["code"]}</div>', phead(V, kick, m['title'], m['intro']), body, si=f'hero-{s}' if f'hero-{s}' in V.IMG else None)


def index_page(V, items):
    S = seasons(V)
    pub = [s for s in S if status(s) == 'published']
    F = featured(V)
    order = F + [s for s in pub if s not in F]
    arc = [s for s in S if status(s) == 'archive']
    tabs = ('<div class="ftabs"><div class="stabs" role="group" aria-label="Season">' +
            ''.join(f'<button type="button" data-v="{s}"{" class=on" if n == 0 else ""}><b>{V.META[s]["code"]}</b><span>{V.E(V.META[s]["stage"].lower())}</span></button>' for n, s in enumerate(order + arc)) +
            '</div><div class="fsel"><label><span>Audience</span><select id="faud"><option value="">All audiences</option>' + ''.join(f'<option value="{a["id"]}">{V.E(a["name"])}</option>' for a in AUDS) +
            '</select></label><label><span>Category</span><select id="fcat"><option value="">All categories</option>' + ''.join(f'<option value="{c["id"]}">{V.E(c["name"])}</option>' for c in CATS) + '</select></label></div></div>')
    h = ''
    for n, s in enumerate(order + arc):
        m = V.META[s]
        lab = f'{SET["featured_year"]} forecast' if s in F else ('Earlier season' if s in arc else 'Forecast')
        h += (f'<section class="w fseason" data-season="{s}" id="{s}"{"" if n == 0 else " hidden"}><div class="sgh"><h2 class="dsp"><a href="{url(s)}">{m["code"]}</a></h2>'
              f'<p><b>{V.E(m["title"])}</b><span class="gr">{V.E(lab)}. {V.E(m["stage"])}, in stores {V.E(m["window"])}</span></p></div>' +
              ''.join(aud_block(V, s, a['id'], items) for a in AUDS) + '</section>')
    data = [{'t': i['title'], 's': i['s'], 'a': i['aud'], 'c': i['cat'], 'u': i['url'], 'd': i['desc'][:140], 'sc': V.META[i['s']]['code'],
             'an': AUD[i['aud']]['name'] if i['aud'] in AUD else 'All audiences', 'cn': CAT[i['cat']]['name']} for i in items]
    srch = ('<section class="w lsec" id="search"><div class="rsh"><h2 class="dsp">Search the library</h2><p class="gr">Search every published report by topic.</p></div>'
            '<div class="lsearch"><input type="search" id="lq" placeholder="Search reports, e.g. skirts, satin, lilac" aria-label="Search the forecast library"></div><div id="lres" class="lres"></div></section>')
    js = ('<script>(function(){var D=' + json.dumps(data, ensure_ascii=False).replace('</', '<\\/') + ';'
          'var secs=[].slice.call(document.querySelectorAll(".fseason")),tabs=[].slice.call(document.querySelectorAll(".ftabs [data-v]")),fa=document.getElementById("faud"),fc=document.getElementById("fcat");'
          'function show(v){tabs.forEach(function(t){t.classList.toggle("on",t.dataset.v===v)});secs.forEach(function(x){x.hidden=x.dataset.season!==v})}'
          'tabs.forEach(function(t){t.addEventListener("click",function(){show(t.dataset.v);history.replaceState(null,"","#"+t.dataset.v)})});'
          'if(location.hash&&document.getElementById(location.hash.slice(1)))show(location.hash.slice(1));'
          'function filt(){[].forEach.call(document.querySelectorAll(".fseason .ablk"),function(b){b.hidden=!!fa.value&&b.dataset.aud!==fa.value});'
          '[].forEach.call(document.querySelectorAll(".fseason .rcard"),function(c){c.hidden=!!fc.value&&c.dataset.cat!==fc.value})}fa.addEventListener("change",filt);fc.addEventListener("change",filt);'
          'var q=document.getElementById("lq"),o=document.getElementById("lres");function e(x){return String(x).replace(/[&<>"]/g,function(k){return{"&":"&amp;","<":"&lt;",">":"&gt;","\\"":"&quot;"}[k]})}'
          'q.addEventListener("input",function(){var t=q.value.trim().toLowerCase();if(t.length<2){o.innerHTML="";return}var r=D.filter(function(d){return(d.t+" "+d.d+" "+d.cn+" "+d.an+" "+d.sc).toLowerCase().indexOf(t)>-1});'
          'o.innerHTML=r.length?r.slice(0,60).map(function(d){return\'<a class="lr" href="\'+d.u+\'"><span class="small gr">\'+e(d.sc+", "+d.an+", "+d.cn)+\'</span><b>\'+e(d.t)+\'</b></a>\'}).join(""):\'<p class="gr">Nothing matches.</p>\'})})();</script>')
    V._PATH[:] = ['forecasts/', None]
    hh = V.head('Forecasts | Forecut', 'Forecut fashion forecasts by season, audience and category: men, women, kids, boys, girls, toddler boys and toddler girls.') + V.nav_app('Forecasts') + '<main id="main">'
    hh += phead(V, 'Season, audience, category', 'Forecasts', 'Choose a season, then an audience and a category. Each report opens as its own page, which you can save as a PDF.')
    hh += f'<div class="fbar"><div class="w">{tabs}</div></div>' + h + srch + '</main>'
    return hh + V.footer() + V.end(js)


# ------------------------------------------------------------------ inventory
def inventory(V, pages_before, redirect, items, REL, tree_redirects, out_dir):
    """Write the migration inventory (CSV + summary) to out_dir."""
    os.makedirs(out_dir, exist_ok=True)
    rows = []
    by_leg = {i['legacy']: i for i in items if i.get('legacy')}
    for lg, u in sorted(redirect.items()):
        i = by_leg[lg]
        rows.append(['moved', f'/{lg}', u, i['h1'], V.META[i['s']]['code'], AUD[i['aud']]['name'] if i['aud'] in AUD else 'All audiences (linked from: ' + ', '.join(AUD[a]['name'] for a in i['also']) + ')',
                     CAT[i['cat']]['name'], SUB.get((i['cat'], i['sub']), ''), i['id'], '', ''])
    for r in REL:
        rows.append(['kept in place, linked', f'/{r["page"]}', f'/{r["page"]}', r['page'], ' '.join(V.META[s]['code'] for s in r['seasons']), ', '.join(AUD[a]['name'] for a in r['auds']),
                     CAT[r['cat']]['name'], SUB.get((r['cat'], r['sub']), ''), '', r['why'], ''])
    for s, ps in SEASON_LINKS.items():
        for p in ps:
            if os.path.exists(os.path.join(ROOT, p + '.html')):
                rows.append(['kept in place, linked', f'/{p}', f'/{p}', p, V.META[s]['code'], 'All', 'Season overview', '', '', 'Complete season edition or regional forecast', ''])
    for lg, u in sorted(tree_redirects.items()):
        rows.append(['redirected (generated summary)', f'/{lg}', u, '', lg.split('-')[0].upper(), '', '', '', '',
                     'Built automatically on 24-25 Nov 2026 from the shared detail data; not separate research. Redirected to its category page; the underlying data stays in the shared reports.', 'flag'])
    with open(os.path.join(out_dir, 'inventory.csv'), 'w', newline='', encoding='utf-8') as f:
        w = csv.writer(f)
        w.writerow(['Action', 'Old URL', 'New URL', 'Title', 'Season', 'Audience', 'Category', 'Subsection', 'Content ID', 'Notes', 'Flag'])
        w.writerows(rows)
    return rows
