"""Apply the Forecut editorial theme (ivory, ink, forest, rust; Fraunces serif) to the page templates. Safe to run more than once."""
import re
FONT = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..700;1,9..144,400..700&family=Instrument+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap">'
LIGHT = ('--paper:#f5f0e8; --paper-2:#fffcf7; --grid:#e3d9cc; --ink:#1c1714; --muted:#6e6259;\n'
         '  --mat:#1f3d33; --mat-ink:#f5f0e8; --chalk:#b4532a; --chalk-soft:#f3e1d6;\n'
         '  --rise:#2e7d55; --peak:#a8701f; --fade:#8a6f86;')
DARK = ('--paper:#14110f; --paper-2:#1e1a17; --grid:#352d27; --ink:#f2ebe2; --muted:#b3a698;\n'
        '  --mat:#e8dccb; --mat-ink:#1c1714; --chalk:#e08a5e; --chalk-soft:#3a2418;\n'
        '  --rise:#6fcf9b; --peak:#e8b860; --fade:#c4a6c0;')
EDITORIAL = """
/* editorial theme */
h1,h2,h3,.d h4,.tbody h3,.vinfo h2,.panelhead h3,.card h3,.plan h3,.logo,.back{font-weight:600!important;letter-spacing:-.012em!important}
h1 em,.hero h1 em{font-style:italic}
.mono,.eyebrow,.eb{letter-spacing:.12em}
.btn,.vbtn{border-radius:2px!important;letter-spacing:.02em}
"""
def apply(path):
    s = open(path).read()
    s = re.sub(r'<link rel="stylesheet" href="https://fonts.googleapis.com/css2\?family=[^"]*">', FONT, s, count=1)
    s = re.sub(r'--paper:#[0-9a-f]{6}; --paper-2:#[0-9a-f]{6}; --grid:#[0-9a-f]{6}; --ink:#[0-9a-f]{6}; --muted:#[0-9a-f]{6};\s*--mat:#[0-9a-f]{6}; --mat-ink:#[0-9a-f]{6}; --chalk:#[0-9a-f]{6}; --chalk-soft:#[0-9a-f]{6};\s*--rise:#[0-9a-f]{6}; --peak:#[0-9a-f]{6}; --fade:#[0-9a-f]{6};',
               lambda m: LIGHT if 'eef2ef' in m.group(0) or 'f5f0e8' in m.group(0) else DARK, s)
    s = s.replace('--tint:#dbe3de; --surface-img:#eef2ef;', '--tint:#e6ddd1; --surface-img:#efe8de;').replace('--tint:#2b3c34; --surface-img:#dfe6e1;', '--tint:#3a322b; --surface-img:#efe8de;')
    s = s.replace('--display:"Bricolage Grotesque","Arial Narrow",system-ui,sans-serif;', '--display:"Fraunces","Playfair Display",Georgia,serif;')
    if '/* editorial theme */' not in s:
        i = s.index('</style>'); s = s[:i] + EDITORIAL + s[i:]
    open(path, 'w').write(s)
for p in ['season_tpl.txt', 'forecut_home.txt']: apply(p)
print('theme applied')
