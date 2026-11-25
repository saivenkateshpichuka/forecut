"""Render an editorial report or theme record (content/reports/*.json) as a library page.

Record fields: kind, status, season, audience, also_for, category, subsection, title, slug, summary, research_period, markets,
timing, trend_status, sections[{heading, body}], design_implications, commercial_implications, products,
sources[{title, publisher, url, date, note}], images[{file, caption, credit, provenance, licence}], related[], version_note.
Only records with status 'published' are rendered (library.build checks this).
"""
import json, re, hashlib
import markdown as MD
import library as L


def md(t):
    return MD.markdown(t or '', extensions=['extra', 'sane_lists'])


def rhash(r):
    keep = {k: v for k, v in r.items() if k not in ('status', 'publish_on', 'version_note')}
    return hashlib.sha256(json.dumps(keep, sort_keys=True, ensure_ascii=False).encode()).hexdigest()[:16]


def render(V, r, vstore, today):
    s, aud, cat, sub = r['season'], r['audience'], r['category'], r.get('subsection') or 'reports'
    u = L.url(s, aud, cat, r['slug'])
    cid = 'fc-' + u.strip('/').replace('forecasts/', '').replace('/', '-')
    h = rhash(r)
    vs = vstore.get(cid)
    if not vs:
        vs = vstore[cid] = [{'v': 1, 'date': r.get('published') or today, 'hash': h, 'note': r.get('version_note') or 'First publication'}]
    elif vs[-1].get('hash') != h:
        vs.append({'v': len(vs) + 1, 'date': today, 'hash': h, 'note': r.get('version_note') or 'Updated'})
    m = V.META[s]
    E = V.E
    imgs = r.get('images') or []
    it = dict(id=cid, s=s, aud=aud, cat=cat, sub=sub, slug=r['slug'], also=r.get('also_for') or [], url=u, legacy='', title=r['title'], h1=r['title'],
              desc=r.get('summary', ''), img=('/img/' + imgs[0]['file'] + '.webp') if imgs else None, updated=vs[-1]['date'], version=vs[-1]['v'], kind=r.get('kind', 'report'))
    audn = L.AUD[aud]['name'] if aud in L.AUD else 'All audiences'
    subn = L.SUB.get((cat, sub), '')
    crumb = ('<div class="w crumb"><a href="/forecasts/">Forecasts</a> / ' + f'<a href="{L.url(s)}">{m["code"]}</a> / ' +
             (f'<a href="{L.url(s, aud)}">{audn}</a> / ' if aud in L.AUD else '') + f'<a href="{L.url(s, aud, cat)}">{E(L.CAT[cat]["name"])}</a> / {E(r["title"])}</div>')
    hero = ''
    if imgs:
        im = imgs[0]
        hero = (f'<figure class="rfig">{V.img(im["file"], im.get("caption", ""))}<figcaption>{E(im.get("caption", ""))}'
                f'<span class="cred">{E(im.get("credit", ""))}</span></figcaption></figure>')
    acts = ('<div class="ctas"><button class="btn" type="button" data-print>Download PDF</button>'
            '<button class="btn o" type="button" data-send="board">Add to Board</button><button class="btn o" type="button" data-send="brief">Create Style Brief</button>'
            '<button class="btn o" type="button" data-send="plan">Add to Collection Planner</button></div>')
    head = (f'<section class="w rhead2"><div><p class="small gr">{m["title"]}, {E(audn)}, {E(L.CAT[cat]["name"])}{", " + E(subn) if subn and subn not in ("Reports", L.CAT[cat]["name"]) else ""}</p>'
            f'<h1 class="dsp">{E(r["title"])}</h1><p class="lead">{E(r.get("summary", ""))}</p>{acts}</div>{hero}</section>')
    rows = [('Season', m['title']), ('Audience', audn), ('Category', L.CAT[cat]['name'] + (', ' + subn if subn and subn != 'Reports' else '')),
            ('Published', L.fmt(vs[0]['date'])), ('Last updated', L.fmt(vs[-1]['date'])), ('Version', f'{vs[-1]["v"]}, {L.fmt(vs[-1]["date"])}'),
            ('Research period', r.get('research_period', '')), ('Market', r.get('markets', ''))]
    if r.get('trend_status'):
        rows.append(('Trend status', r['trend_status']))
    rows.append(('Content ID', cid))
    hist = ''.join(f'<li>Version {v["v"]}, {L.fmt(v["date"])}: {E(v["note"])}</li>' for v in reversed(vs))
    meta = ('<section class="w metap" aria-label="About this report"><dl>' + ''.join(f'<div><dt>{a}</dt><dd>{E(b)}</dd></div>' for a, b in rows if b) +
            f'</dl><details><summary>Revision history</summary><ul class="small gr">{hist}</ul></details></section>')
    secs, body = [], ''

    def add(i, t, inner):
        nonlocal body
        secs.append((i, t))
        body += f'<section class="rs ed" id="{i}"><h2 class="dsp">{E(t)}</h2><div class="prose">{inner}</div></section>'
    for n, sct in enumerate(r.get('sections', [])):
        add(f's{n + 1}', sct['heading'], md(sct['body']))
    if r.get('timing'):
        add('timing', 'Timing', md(r['timing']))
    if r.get('products'):
        add('products', 'Products and customers', md(r['products']))
    add('design', 'Design implications', md(r.get('design_implications', '')))
    add('commercial', 'Commercial implications', md(r.get('commercial_implications', '')))
    if len(imgs) > 1:
        add('images', 'Images', '<div class="rfigs">' + ''.join(
            f'<figure class="rfig">{V.img(im["file"], im.get("caption", ""))}<figcaption>{E(im.get("caption", ""))}<span class="cred">{E(im.get("credit", ""))}</span></figcaption></figure>' for im in imgs[1:]) + '</div>')
    src = r.get('sources') or []
    add('sources', 'Evidence and sources', '<ol class="srcs">' + ''.join(
        f'<li><a href="{E(x["url"])}" target="_blank" rel="noopener">{E(x["title"])}</a>, {E(x.get("publisher", ""))}{", " + E(x["date"]) if x.get("date") else ""}{". " + E(x["note"]) if x.get("note") else ""}</li>' for x in src) + '</ol>' +
        (('<p class="small gr">Image credits: ' + '; '.join(f'{E(im.get("caption", ""))}: {E(im.get("credit", ""))}, {E(im.get("licence", ""))}' for im in imgs) + '.</p>') if imgs else ''))
    nav = '<nav class="rnav" aria-label="On this page"><div class="w">' + ''.join(f'<a href="#{i}">{E(t)}</a>' for i, t in secs) + '<a href="#related">Related</a></div></nav>'
    ctx = {'season': m['code'], 'aud': audn, 'src': r['title'], 'url': u, 'id': cid, 'v': vs[-1]['v'], 'vdate': vs[-1]['date']}
    data = [{'n': r['title'], 'note': r.get('summary', ''), 'k': f'{audn}, {L.CAT[cat]["name"]}', 'st': ''}]
    V._PATH[:] = [u.lstrip('/'), imgs[0]['file'] if imgs else None]
    page = (V.head(f'{r["title"]} | Forecut', r.get('summary', '')[:300]) + V.nav_app('Forecasts') + '<main id="main">' + crumb + head + meta + nav +
            f'<div class="w" id="report">{body}<section class="rs" id="related"></section></div></main>' +
            f'<div class="prt-foot">forecut.in{u} · {cid} · version {vs[-1]["v"]}, {L.fmt(vs[-1]["date"])}</div><div class="sendt" id="sendt" role="status" aria-live="polite" hidden></div>')
    page += V.footer() + V.end(f'<script>window.FC_CTX={json.dumps(ctx, ensure_ascii=False)};window.FC_ITEMS={{"items":{json.dumps(data, ensure_ascii=False)}}}</script>')
    it['related_ids'] = r.get('related') or []
    return it, page


def related_block(V, it, items):
    """Related content by metadata: same season and audience; same category first, then the themes and reports it names."""
    same = [i for i in items if i['s'] == it['s'] and i['id'] != it['id'] and (i['aud'] == it['aud'] or (i['aud'] == 'all' and it['aud'] in i['also']))]
    named = [i for i in items if i['id'] in it.get('related_ids', [])]
    pick = named + [i for i in same if i['cat'] == it['cat'] and i not in named] + [i for i in same if i['cat'] != it['cat'] and i.get('kind') in ('theme', 'report') and i not in named]
    if not pick:
        return ''
    return (f'<div class="rsh"><h2 class="dsp">Related {V.META[it["s"]]["code"]} {L.AUD[it["aud"]]["name"].lower() if it["aud"] in L.AUD else ""} research</h2>'
            '<p class="gr">From the same season and audience.</p></div><div class="rgrid">' + ''.join(L.card(V, i) for i in pick[:8]) + '</div>')
