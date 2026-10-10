"""Season rollover: drop the oldest season and add a new one at the end.
Usage: python3 rollover.py ss29 "Spring/Summer 2029" "Feb – Jul 2029"
After running: write the new season's themes, palette and colour of the year in seasons.json,
add matching entries to themes.json, set statuses for the new season in details.json, update stage labels,
then build and publish a NEW artifact for the new season and add its URL to urls.json."""
import json, sys
code, title, window = sys.argv[1], sys.argv[2], sys.argv[3]
S = json.load(open('seasons.json')); D = json.load(open('details.json'))
old = S['seasons'].pop(0); S['seasons'].append(code)
last = S['meta'][S['seasons'][-2]]
S['meta'][code] = dict(code=code.upper(), title=title, stage='Long-range outlook', window=window, basis='projection',
                       intro='TODO', themes=[], palette=last['palette'], coty=last['coty'], sources='TODO')
for v in D['model'].values():
    for it in v:
        it['life'] = it['life'][1:] + '-'
json.dump(S, open('seasons.json', 'w'), indent=1, ensure_ascii=False)
json.dump(D, open('details.json', 'w'), indent=1, ensure_ascii=False)
print('Removed', old, '- added', code, '- now fill in TODOs and statuses for', code)
