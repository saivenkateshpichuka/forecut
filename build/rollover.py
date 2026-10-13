"""Season rollover: archive the oldest season (never deleted) and add a new one at the end.
The archived season keeps its page (<code>.html stays published) and every detail keeps its past status in it["past"].
Usage: python3 rollover.py ss29 "Spring/Summer 2029" "Feb – Jul 2029"
After running: write the new season's themes, palette and colour of the year in seasons.json,
add matching entries to themes.json, set statuses for the new season in details.json, update stage labels,
then build and publish a NEW artifact for the new season and add its URL to urls.json."""
import json, sys
code, title, window = sys.argv[1], sys.argv[2], sys.argv[3]
S = json.load(open('seasons.json')); D = json.load(open('details.json'))
old = S['seasons'].pop(0); S['seasons'].append(code)
S.setdefault('archive', []).append(old)
last = S['meta'][S['seasons'][-2]]
S['meta'][code] = dict(code=code.upper(), title=title, stage='Long-range outlook', window=window, basis='projection',
                       intro='TODO', themes=[], palette=last['palette'], coty=last['coty'], sources='TODO')
for v in D['model'].values():
    for it in v:
        it.setdefault('past', {})[old] = it['life'][0]
        it['life'] = it['life'][1:] + '-'
json.dump(S, open('seasons.json', 'w'), indent=1, ensure_ascii=False)
json.dump(D, open('details.json', 'w'), indent=1, ensure_ascii=False)
print('Archived', old, '(page kept, statuses saved in past)', '- added', code, '- now fill in TODOs and statuses for', code)
