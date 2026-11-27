"""Issue definitions. Add one entry per month; run `python3 magazine.py` (called from build.sh)."""
ISSUES = [
    {'id': '2026-12', 'month': 'December 2026', 'short': 'Dec 2026', 'no': 1, 'season': 'SS27', 'cover_line': 'The waist returns',
     'cover_lines': ['SS27: six themes that will shape spring', 'Seven colours, with HEX codes', 'Six markets, read one by one', 'What to watch at the January fairs'],
     'editor': ['Welcome to the first issue of the Forecut monthly. Each month we collect the forecast, the market guides and the dates that matter into one issue you can read from cover to cover.',
                'December is the month between seasons. SS27 is on the rails, AW26 is in stores and the January fairs are close. This issue reads SS27 theme by theme, then looks at the markets that will buy it.',
                'Next month we update every page after the fairs. If something here changes, the issue will say so.'],
     'brand': None,   # set to a dict (see brand_of_month.example.json) to add the Brand of the Month section
     },
]
