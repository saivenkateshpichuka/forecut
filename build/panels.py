"""Add data-photo / data-flats to cards whose image is a two-panel (photo | flat sketch) upload."""
import json, os, re
P = json.load(open('panels.json')) if os.path.exists('panels.json') else {}


def add(html):
    def rep(m):
        s = m.group(1)
        if s not in P: return m.group(0)
        flats = '|'.join(f'img/{s}-f{i + 1}.webp' for i in range(P[s]))
        return f'{m.group(0)} data-photo="img/{s}-photo.webp" data-flats="{flats}"'
    return re.sub(r'data-img="img/([a-z0-9-]+)\.webp"', rep, html)
