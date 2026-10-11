"""Apply the Forecut editorial theme (ivory, ink, forest, rust; Fraunces serif) to the page templates. Safe to run more than once."""
import re
FONT = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500..700;1,9..144,500..700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap">'
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
LIVE = """
/* readable type */
body{-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
h3,h4,.d h4,.tbody h3,.card h3,.plan h3,.wcard b,.cover h3,.method h3,.panelhead h3,.vinfo h2,.track h3{font-family:var(--body)!important;font-weight:700!important;letter-spacing:-.01em!important}
.mono,.eyebrow,.eb,.pill,.area,.cnt,.open,.more,.kw li,.sub h5,.vmeta dt,.vdesc h3,.mixkey,.cal b{letter-spacing:.04em!important}
.pill{font-weight:600!important;font-size:11.5px!important}
p,li{line-height:1.6}
@media (max-width:560px){body{font-size:16px}.d p{font-size:13.5px!important}.pill{font-size:10.5px!important}}
/* live status */
.pill{position:relative}
.pill::before{flex:none}
@keyframes fcPing{0%{box-shadow:0 0 0 0 currentColor}70%{box-shadow:0 0 0 6px transparent}100%{box-shadow:0 0 0 0 transparent}}
@keyframes fcBreath{0%,100%{opacity:1}50%{opacity:.45}}
@keyframes fcUp{0%,100%{transform:translateY(1px)}50%{transform:translateY(-2px)}}
@keyframes fcDown{0%,100%{transform:translateY(-1px)}50%{transform:translateY(2px)}}
@keyframes fcGlow{0%,100%{transform:scale(1)}50%{transform:scale(1.35)}}
.pill.emerge::after,.pill.rise::after,.pill.fade::after{font-size:10px;line-height:1;display:inline-block}
.pill.rise::after{content:"\\2191"}
.pill.fade::after{content:"\\2193"}
.pill.emerge::after{content:"\\2726"}
@media (prefers-reduced-motion:no-preference){
  .pill.emerge::before{animation:fcPing 1.6s ease-out infinite}
  .pill.emerge::after{animation:fcBreath 1.6s ease-in-out infinite}
  .pill.rise::before{animation:fcPing 2.2s ease-out infinite}
  .pill.rise::after{animation:fcUp 1.2s ease-in-out infinite}
  .pill.peak::before{animation:fcGlow 1.8s ease-in-out infinite}
  .pill.fade{animation:fcBreath 3.2s ease-in-out infinite}
  .pill.fade::after{animation:fcDown 1.6s ease-in-out infinite}
}
"""
def apply(path):
    s = open(path).read()
    s = re.sub(r'<link rel="stylesheet" href="https://fonts.googleapis.com/css2\?family=[^"]*">', FONT, s, count=1)
    s = re.sub(r'--paper:#[0-9a-f]{6}; --paper-2:#[0-9a-f]{6}; --grid:#[0-9a-f]{6}; --ink:#[0-9a-f]{6}; --muted:#[0-9a-f]{6};\s*--mat:#[0-9a-f]{6}; --mat-ink:#[0-9a-f]{6}; --chalk:#[0-9a-f]{6}; --chalk-soft:#[0-9a-f]{6};\s*--rise:#[0-9a-f]{6}; --peak:#[0-9a-f]{6}; --fade:#[0-9a-f]{6};',
               lambda m: LIGHT if 'eef2ef' in m.group(0) or 'f5f0e8' in m.group(0) else DARK, s)
    s = s.replace('--tint:#dbe3de; --surface-img:#eef2ef;', '--tint:#e6ddd1; --surface-img:#efe8de;').replace('--tint:#2b3c34; --surface-img:#dfe6e1;', '--tint:#3a322b; --surface-img:#efe8de;')
    s = s.replace('--display:"Bricolage Grotesque","Arial Narrow",system-ui,sans-serif;', '--display:"Fraunces","Playfair Display",Georgia,serif;')
    s = s.replace('--body:"Instrument Sans",system-ui,-apple-system,"Segoe UI",sans-serif;', '--body:"Inter",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;')
    s = s.replace('--mono:"IBM Plex Mono",ui-monospace,Menlo,Consolas,monospace;', '--mono:"Inter",system-ui,-apple-system,"Segoe UI",sans-serif;')
    if '/* live status */' not in s:
        i = s.index('</style>'); s = s[:i] + LIVE + s[i:]
    if '/* editorial theme */' not in s:
        i = s.index('</style>'); s = s[:i] + EDITORIAL + s[i:]
    open(path, 'w').write(s)
for p in ['season_tpl.txt', 'forecut_home.txt']: apply(p)
print('theme applied')
