"""Validate details.json: lifecycle lengths, 25+ details per category per season, a sketch spec for every name."""
import json, subprocess, sys
from seasons_data import SEASONS
M = json.load(open('details.json')); n = len(SEASONS); bad = []
for d, c in M['order']:
    its = M['model'][f'{d}|{c}']
    for it in its:
        if len(it['life']) != n or any(ch not in 'erpf-' for ch in it['life']): bad.append(('lifecycle', it['name'], it['life']))
    for i, s in enumerate(SEASONS):
        k = sum(1 for it in its if it['life'][i] != '-')
        if k < 25: bad.append(('under 25', s, d, c, k))
names = sorted({it['name'] for v in M['model'].values() for it in v})
if len(names) != sum(len(v) for v in M['model'].values()): bad.append(('duplicate names',))
json.dump(names, open('_names.json', 'w'))
miss = subprocess.run(['node', '-e', "const F=require('./flats.js');const n=require('./_names.json');console.log(JSON.stringify(n.filter(x=>!F.SPEC[x])))"], capture_output=True, text=True).stdout.strip()
if miss and miss != '[]': bad.append(('missing sketch spec', miss))
for i, s in enumerate(SEASONS):
    st = {k: sum(1 for v in M['model'].values() for it in v if it['life'][i] == k) for k in 'erpf'}
    print(s, sum(st.values()), st)
print('PROBLEMS:' if bad else 'OK', *bad, sep='\n  ')
sys.exit(1 if bad else 0)
