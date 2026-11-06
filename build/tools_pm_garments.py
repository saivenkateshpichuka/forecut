"""Garment availability and option keys per garment, mirrored from tools_js/pm_engine.js (PM.GARMENTS)."""
import json, re, os
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tools_js', 'pm_engine.js')).read()
AVAIL, OPTS = {}, {}
for m in re.finditer(r"(\w+): \{ n: '[^']*', g: \[([^\]]*)\], o: \[([^\]]*)\]", _src):
    AVAIL[m.group(1)] = [x.strip(" '") for x in m.group(2).split(',')]
    OPTS[m.group(1)] = [x.strip(" '") for x in m.group(3).split(',')]
