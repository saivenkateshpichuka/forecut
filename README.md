# Forecut

AI trend forecasting for garments, footwear and detailing.

Live site: https://forecut.in/

- `index.html`: homepage
- `aw26.html`, `ss27.html`, `aw27.html`, `ss28.html`, `aw28.html`: season reports
- `build/`: data and scripts that generate the season pages (see `build/README.md`). Rebuild with `cd build && STATIC=.. python3 gen_seasons.py`.

Updated monthly.

## Reports and Journal (added Oct 2026)
- `build/journal_data.py` → `journal.py`: Journal articles (journal.html + one page per article).
- `build/reports_data.py` → `reports.py`: Core Item Updates, Design Capsules, India Colour Forecast, Textile & Craft Sourcing Guide, reports.html hub. Flat sketches are pre-rendered with node + flats.js.
- Statuses always come from `india_data.py`, so reports update when the India forecast is refreshed. Run `sh build.sh` from build/.
- Never copy text, palettes, data or images from paid forecasting services (e.g. WGSN) into these pages; use them only as format inspiration.

## Launch locks
`build/site.json` → `"locked"` lists seasons that stay locked (tabs, lifecycle chips, tracker columns, India calendar/switcher, AW27/SS28/AW28 detail sections). At official launch set it to `[]` and run `sh build.sh`.

## Golden rule: never delete
Details (global and India), Journal articles, Brand Watch entries, photos and season pages are only ever **added or updated, never removed**.
- Fading items stay, marked "Fading"; past seasons are archived (rollover.py keeps the page and saves past statuses), not deleted.
- `python3 keep_check.py` (run by build.sh) fails the build if anything that existed in the last commit is missing. If it fails, restore the item; do not bypass the check.
