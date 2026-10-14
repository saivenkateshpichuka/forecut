"""Forecut social profiles: one place for links, icons and the follow blocks injected on every page (by seo.py)."""
LINKS = [
    ('Instagram', 'https://www.instagram.com/forecut.in/', '@forecut.in',
     '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.3" cy="6.7" r="1.3" fill="currentColor"/></svg>'),
    ('LinkedIn', 'https://www.linkedin.com/company/forecut/', 'Forecut',
     '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4v11H3zm7 0h3.8v1.6h.1c.5-1 1.8-1.9 3.7-1.9 4 0 4.7 2.6 4.7 6v5.3h-4v-4.7c0-1.1 0-2.6-1.6-2.6s-1.8 1.2-1.8 2.5v4.8h-4z"/></svg>'),
    ('Facebook', 'https://www.facebook.com/profile.php?id=61595477456582', 'Forecut',
     '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21z"/></svg>'),
]
SAME_AS = [u for _, u, _, _ in LINKS]

CSS = ('<style>.soc{display:inline-flex;gap:8px;align-items:center}.soc a{display:inline-grid;place-items:center;width:34px;height:34px;border-radius:50%;'
       'border:1px solid var(--grid,#e3d9cc);color:var(--ink,#1c1714);background:var(--paper-2,#fffcf7);text-decoration:none;transition:.2s}'
       '.soc a:hover{background:var(--ink,#1c1714);color:var(--paper,#f5f0e8);border-color:var(--ink,#1c1714)}.soc svg{width:17px;height:17px}'
       'footer .soc{margin:10px 0 0;display:flex}.foot .soc{margin:6px 0}'
       '.follow{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:14px 20px;margin:44px 0 8px;padding:20px 22px;border-radius:14px;'
       'background:var(--mat,#1f3d33);color:var(--mat-ink,#f5f0e8)}.follow b{display:block;font:700 19px/1.3 "DM Sans",sans-serif}'
       '.follow span{font:15px/1.45 "DM Sans",sans-serif;opacity:.88}.follow .soc a{width:auto;height:40px;border-radius:99px;padding:0 15px;gap:8px;'
       'display:inline-flex;font:600 14px "DM Sans",sans-serif;background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.35);color:inherit}'
       '.follow .soc a:hover{background:#fff;color:#1f3d33}.follow .soc{flex-wrap:wrap}'
       '@media (max-width:600px){.follow .soc a span{display:none}.follow .soc a{width:44px;padding:0;justify-content:center}}</style>')


def icons(label=False):
    return '<span class="soc">' + ''.join(
        f'<a href="{u}" target="_blank" rel="noopener me" aria-label="Forecut on {n}" title="Forecut on {n}">{svg}{f"<span>{n}</span>" if label else ""}</a>'
        for n, u, _, svg in LINKS) + '</span>'


def follow(kind='page'):
    t = {'report': ('Get the next report first', 'Follow Forecut for new trend reports, runway fabric watch and India forecasts every week.'),
         'page': ('Follow Forecut', 'Weekly trend forecasts, runway reports and India market signals on Instagram, LinkedIn and Facebook.')}[kind]
    return f'<!--soc--><div class="follow"><div><b>{t[0]}</b><span>{t[1]}</span></div>{icons(True)}</div><!--/soc-->'
