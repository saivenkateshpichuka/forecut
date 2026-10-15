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

## Flat sketch images
Upload `flat-<slug>.png` (or `flat-<slug>-<season>.png`) to images/. They are padded to 1000×1000 on white (never cropped), replace the code-drawn sketch on cards without a photo, and appear as a "Flat sketch" toggle next to photos in the detail viewer. Prompts: season-prompts/ss27-flat-sketch-prompts.csv.

### Independent India season reports

`build/india_season_reports.json` owns the five curated season edits, with 20 unique development details each, pricing, proposed merchandising offers, documented collection stories, innovation validation and sources. The previous full detail catalogue is preserved in `india-reference-library.html` and the original `Complete-Report.pdf` files. Do not delete either edition.

In `build/`, run `STATIC=.. python3 gen_india.py` to produce the season hub, five dedicated pages and reference archive. Run `python3 india_season_pdfs.py` after changes to report content or images, then regenerate the pages to refresh PDF page counts. Run `seo.py` normally, or set `ONLY` to the changed filenames and `SITEMAP=1` for focused metadata and sitemap updates. Run both `test_india.py` and `test_india_season_pages.py` using Python 3.12 with ReportLab, Pillow and pypdf; Node must be on PATH for script checks. PDF fonts use the same `FORECUT_PDF_FONTS` override as the extended PDF builder.

Generated concept prompts and asset provenance are recorded in `build/india_detail_image_provenance.json`. Reference images illustrate design vocabulary; generated images are original concepts. Neither is future runway evidence. 2028 content is conditional. Retailer snapshots are dated and separate from Forecut's proposed future price bands and offers.
