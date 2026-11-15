"""Forecast track record (Stage 6): every published version of details.json is a dated forecast snapshot (from git).
When a season moves from projection to research basis, its last projected stages are compared with the assessed ones.
Nothing is estimated: if no season has made that move yet, the page says so."""
import json, subprocess, html, os
HERE = os.path.dirname(os.path.abspath(__file__))
E = html.escape
NM = {'e': 'Emerging', 'r': 'Rising', 'p': 'Peaking', 'f': 'Fading', '-': 'Not tracked'}
ORDER = 'erpf'


def _git(*a):
    return subprocess.run(['git', *a], cwd=HERE, capture_output=True, text=True).stdout


def snapshots():
    out = []
    for line in _git('log', '--reverse', '--format=%H %cs', '--', 'details.json', 'seasons.json').split('\n'):
        if not line.strip(): continue
        h, d = line.split()
        try:
            D = json.loads(_git('show', f'{h}:build/details.json')); S = json.loads(_git('show', f'{h}:build/seasons.json'))
        except Exception:
            continue
        codes = [S['meta'][s]['code'] for s in S['seasons']]
        basis = {S['meta'][s]['code']: S['meta'][s]['basis'] for s in S['seasons']}
        life = {it['name']: {c: it['life'][i] for i, c in enumerate(codes) if i < len(it['life'])} for v in D['model'].values() for it in v}
        out.append({'h': h[:7], 'date': d, 'basis': basis, 'life': life})
    # also the working copy (uncommitted edits count as the latest snapshot)
    try:
        D = json.load(open(os.path.join(HERE, 'details.json'))); S = json.load(open(os.path.join(HERE, 'seasons.json')))
        codes = [S['meta'][s]['code'] for s in S['seasons']]
        cur = {'h': 'current', 'date': 'now', 'basis': {S['meta'][s]['code']: S['meta'][s]['basis'] for s in S['seasons']},
               'life': {it['name']: {c: it['life'][i] for i, c in enumerate(codes)} for v in D['model'].values() for it in v}}
        if not out or out[-1]['life'] != cur['life'] or out[-1]['basis'] != cur['basis']: out.append(cur)
    except Exception:
        pass
    return out


def backtest(snaps):
    res = []
    seasons = sorted({c for s in snaps for c in s['basis']})
    for c in seasons:
        proj = [s for s in snaps if s['basis'].get(c) == 'projection']
        obs = [s for s in snaps if s['basis'].get(c) == 'research']
        if not proj or not obs or obs[-1]['date'] < proj[-1]['date'] and obs[-1]['h'] != 'current': continue
        P, O = proj[-1]['life'], obs[-1]['life']
        n = exact = near = 0
        for name, st in P.items():
            a, b = st.get(c, '-'), O.get(name, {}).get(c, '-')
            if a == '-' or b == '-': continue
            n += 1; exact += a == b; near += abs(ORDER.index(a) - ORDER.index(b)) <= 1
        res.append({'season': c, 'from': proj[-1]['date'], 'to': obs[-1]['date'], 'n': n, 'exact': exact, 'near': near})
    return res


def body():
    S = snapshots(); B = backtest(S)
    rows = ''
    for i, s in enumerate(S):
        if i == 0: ch = '—'
        else:
            prev = S[i - 1]['life']; parts = []
            for c in sorted(s['basis']):
                k = sum(1 for nm, st in s['life'].items() if nm in prev and prev[nm].get(c, '-') != st.get(c, '-'))
                if k: parts.append(f'{c} {k}')
            added = len(set(s['life']) - set(prev))
            ch = ', '.join(parts) + (f'{"; " if parts else ""}{added} new details' if added else '') or 'no stage changes'
        proj = ', '.join(c for c, b in sorted(s['basis'].items()) if b == 'projection')
        rows += f'<tr><td>{E(s["date"] if s["date"] != "now" else "Latest")}</td><td>{len(s["life"])}</td><td>{E(proj)}</td><td>{E(ch)}</td></tr>'
    if B:
        bt = '<table class="tr"><tr><th>Season</th><th>Last projected</th><th>Assessed</th><th>Details compared</th><th>Same stage</th><th>Within one stage</th></tr>' + ''.join(
            f'<tr><td>{E(b["season"])}</td><td>{E(b["from"])}</td><td>{E(b["to"])}</td><td>{b["n"]}</td><td>{b["exact"]} ({b["exact"] * 100 // max(1, b["n"])}%)</td><td>{b["near"]} ({b["near"] * 100 // max(1, b["n"])}%)</td></tr>' for b in B) + '</table>'
    else:
        first = S[0]['date'] if S else '—'
        nxt = sorted(c for c, b in (S[-1]['basis'].items() if S else []) if b == 'projection')
        bt = (f'<div class="box"><p><b>No back-test result yet.</b> Records start on {E(first)}. Since then no season has moved from projection to assessed, so there is nothing honest to score. '
              f'The first test will be {E(nxt[0] if nxt else "the next season")}, once its runway shows have been reviewed: its last projected stages will be compared, detail by detail, with the assessed ones and published here.</p></div>')
    return f'''
<div class="eb">Methodology</div><h1>Forecast track record.</h1>
<p class="lead">Every time the forecast changes, a dated snapshot is kept. When a season is shown and assessed, we compare what we projected with what we then assessed, and publish the result here, good or bad.</p>
<h2>Back-test</h2>
<p>For each season that has moved from projection to assessed: the share of details whose assessed stage is the same as the last projected stage, and the share within one stage (for example projected Rising, assessed Peaking).</p>
{bt}
<h2>Forecast snapshots</h2>
<p>Each row is a published version of the forecast. "Changes" counts details whose stage moved in that season compared with the previous version.</p>
<table class="tr"><tr><th>Date</th><th>Details</th><th>Projected seasons</th><th>Changes since the previous version</th></tr>{rows}</table>
<h2>Limits</h2>
<p>Assessed stages are Forecut's own reading of published coverage, so a back-test measures how stable our projections are against our later assessment, not against sales. Read it alongside the <a href="method.html#evidence">evidence grades</a>.</p>
<style>.tr{{width:100%;border-collapse:collapse;font:14px "DM Sans",sans-serif;margin:10px 0}}.tr th{{text-align:left;font-size:12px;color:var(--muted);padding:6px 8px;border-bottom:1px solid var(--grid)}}.tr td{{padding:7px 8px;border-bottom:1px solid var(--grid);vertical-align:top}}</style>'''
